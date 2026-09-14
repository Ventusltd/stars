import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { openDb, ingestFile, rebuildTablet, extractJs, extractHtml, extractAny, gitBlobId, elementSource } from './lib.mjs';
import { classifyNeeds, REQUIRED } from './needs.mjs';

const B = s => Buffer.from(s);
const ADD = 'function add(a, b) {\n  const s = a + b;\n  return s;\n}\n';
const one = (ctx, sql) => ctx.db.prepare(sql).get();

test('the same function in two files is one element found in two places', () => {
  const ctx = openDb(':memory:');
  ingestFile(ctx, { repo: 'r1', commit: 'c1', path: 'a.js', bytes: B(ADD) });
  ingestFile(ctx, { repo: 'r2', commit: 'c2', path: 'lib/b.js', bytes: B('// helper\n' + ADD) });
  assert.equal(one(ctx, 'SELECT count(*) c FROM element').c, 1);
  assert.equal(one(ctx, 'SELECT count(*) c FROM tablet_element').c, 2);
});

test('a reformatted copy is a new element in the same family', () => {
  const ctx = openDb(':memory:');
  ingestFile(ctx, { repo: 'r', commit: 'c', path: 'a.js', bytes: B(ADD) });
  ingestFile(ctx, { repo: 'r', commit: 'c', path: 'b.js', bytes: B('function add(a,b){\n    const s=a+b; // sum\n    return s;\n}\n') });
  assert.equal(one(ctx, 'SELECT count(*) c FROM element').c, 2);
  assert.equal(one(ctx, 'SELECT count(*) c FROM family').c, 1);
});

test('self-contained functions are told apart from ones that need outside names', () => {
  const f = extractJs('function a(x) {\n  return Math.max(x, 0);\n}\nfunction b(id) {\n  return document.getElementById(id);\n}\nclass P {\n  get x() {\n    return this.v;\n  }\n}\n');
  const by = Object.fromEntries(f.map(x => [x.name, x]));
  assert.equal(by.a.standalone, true);
  assert.deepEqual(by.b.needs, ['document']);
  assert.equal(by.b.standalone, false);
  assert.equal(by.P.standalone, true);
  assert.equal(by.x.kind, 'method');
});

test('functions inside HTML scripts keep the file line numbers and exact source', () => {
  const html = '<html>\n<body>\n<script>function g(x) {\n  return x * 2;\n}\n</script>\n';
  const [g] = extractHtml(html);
  assert.equal(g.first, 3);
  assert.equal(g.last, 5);
  const ctx = openDb(':memory:');
  const tablet = ingestFile(ctx, { repo: 'r', commit: 'c', path: 'i.html', bytes: B(html) });
  const te = ctx.db.prepare('SELECT * FROM tablet_element WHERE tablet = ?').get(tablet);
  assert.equal(elementSource(ctx, te), 'function g(x) {\n  return x * 2;\n}');
});

test('numbers survive reopening, and new lines get new higher numbers', () => {
  const file = path.join(mkdtempSync(path.join(tmpdir(), 'modular-')), 't.sqlite');
  let ctx = openDb(file);
  ingestFile(ctx, { repo: 'r', commit: 'c1', path: 'a.js', bytes: B(ADD) });
  const before = ctx.db.prepare('SELECT n, sha FROM line ORDER BY n').all();
  ctx.db.close();
  ctx = openDb(file);
  ingestFile(ctx, { repo: 'r', commit: 'c2', path: 'z.js', bytes: B('const z = 1;\n' + ADD) });
  const after = ctx.db.prepare('SELECT n, sha FROM line ORDER BY n').all();
  for (const r of before) assert.deepEqual(Buffer.from(after.find(x => x.n === r.n).sha), Buffer.from(r.sha));
  assert.equal(after.length, before.length + 1);
  assert.ok(after.at(-1).n > before.at(-1).n);
});

test('files rebuild byte for byte, including Windows line endings and no final newline', () => {
  const ctx = openDb(':memory:');
  const bytes = B('\uFEFFfunction w() {\r\n  return 1;\r\n}\r\nconst end = 2;');
  const tablet = ingestFile(ctx, { repo: 'r', commit: 'c', path: 'w.js', bytes });
  const rebuilt = rebuildTablet(ctx, tablet);
  assert.deepEqual(rebuilt, bytes);
  assert.equal(gitBlobId(rebuilt), gitBlobId(bytes));
});

test('unusual line breaks are refused rather than mis-numbered', () => {
  assert.match(extractAny('js', B('function q() {\r  return 1;\r}\r')).issue, /Unusual line breaks/);
});

test('a block\'s needs are sorted into the eight classes shared with the app generator; only three classes are required', () => {
  const texts = [{ path: 'a.js', text: 'const BLOCK_CLASS = "x";\n// the map is genuinely needed\nfunction go(map) {\n  return new maplibregl.Map({ container: document.body, style: resolve(map) });\n}\ngo(1);\n' }];
  const detail = classifyNeeds(['maplibregl', 'document', 'BLOCK_CLASS', 'map', 'genuinely', 'resolve', 'GB_ID', 'process'], texts,
    { definersOf: n => n === 'resolve' ? [{ symbol: 'Ss', title: 'Substation search' }] : [] });
  const by = Object.fromEntries(detail.map(d => [d.name, d.class]));
  assert.deepEqual(by, { maplibregl: 'library', document: 'browser', BLOCK_CLASS: 'defined', map: 'defined', genuinely: 'word', resolve: 'block', GB_ID: 'absent', process: 'node' });
  assert.deepEqual(detail.filter(d => REQUIRED.has(d.class)).map(d => d.name), ['maplibregl', 'resolve']);
  assert.equal(detail.find(d => d.name === 'resolve').block, 'Ss');
  assert.equal(detail[0].class, 'library'); // required classes come first
  assert.equal(classifyNeeds(['EARTH_KM'], [], {})[0].class, 'missing'); // no files to read: a capitalised name is still a need
});

const python = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
test('Python functions: same logic in a different layout shares a family', { skip: spawnSync(python, ['--version']).status !== 0 }, () => {
  const ctx = openDb(':memory:');
  ingestFile(ctx, { repo: 'r', commit: 'c', path: 'a.py', bytes: B('def area(w, h):\n    # rectangle\n    return w * h\n\n\n') });
  ingestFile(ctx, { repo: 'r', commit: 'c', path: 'b.py', bytes: B('def area(w,h):\n\n    return (w*h)\n') });
  assert.equal(one(ctx, 'SELECT count(*) c FROM element').c, 2);
  assert.equal(one(ctx, 'SELECT count(*) c FROM family').c, 1);
});
