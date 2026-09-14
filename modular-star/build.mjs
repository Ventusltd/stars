// Modular star — scan the current code of every visible Ventusltd repository into the numbered database,
// then write the reports, the Spider graph, the prior-work catalogue and the compiled library.
// Usage: node modular-star/build.mjs --db modular.sqlite --work /tmp/repos --out .
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import path from 'node:path';
import * as acorn from 'acorn';
import { openDb, ingestFile, langOf, rebuildTablet, gitBlobId, elementSource, unpack } from './lib.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const DB = arg('db', 'modular.sqlite'), WORK = arg('work', '/tmp/repos'), OUT = arg('out', '.');
const OWNER = 'Ventusltd', SKIP = /(^|\/)(node_modules|vendor|dist|build|\.git)\/|\.min\.(js|mjs)$/i;
const now = new Date().toISOString();
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...opts });

function listRepos() {
  // Public repositories only: this repository is public, so nothing from a private repository may enter it.
  return sh('gh', ['api', '--paginate', `users/${OWNER}/repos?type=public&per_page=100`, '--jq', '.[] | {full_name, private, fork, archived, default_branch}'])
    .split('\n').filter(Boolean).map(l => JSON.parse(l))
    .filter(r => r.full_name.startsWith(OWNER + '/') && !r.private && !r.fork && r.full_name !== `${OWNER}/stars`);
}

// Read many blobs in one git process: "<oid> blob <size>\n<bytes>\n" per object.
function readBlobs(dir, oids) {
  const out = new Map();
  for (let i = 0; i < oids.length; i += 200) {
    const chunk = oids.slice(i, i + 200);
    const buf = execFileSync('git', ['-C', dir, 'cat-file', '--batch'], { input: chunk.join('\n') + '\n', maxBuffer: 512 * 1024 * 1024, env: { ...process.env, GIT_NO_LAZY_FETCH: '1' } });
    let pos = 0;
    for (const oid of chunk) {
      const nl = buf.indexOf(0x0a, pos);
      const [got, type, size] = buf.subarray(pos, nl).toString().split(' ');
      if (type === 'missing' || got !== oid) { pos = nl + 1; continue; }
      const len = Number(size);
      out.set(oid, buf.subarray(nl + 1, nl + 1 + len));
      pos = nl + 1 + len + 1;
    }
  }
  return out;
}

const ctx = openDb(DB);
const repos = listRepos();
const gaps = [];
console.log(`Repositories to scan: ${repos.length}`);
for (const r of repos) {
  const dir = path.join(WORK, r.full_name.replace('/', '__'));
  try {
    rmSync(dir, { recursive: true, force: true });
    const url = `https://github.com/${r.full_name}.git`;
    execFileSync('git', ['clone', '--quiet', '--depth', '1', '--filter=blob:limit=1m', '--no-checkout', url, dir], { stdio: 'pipe' });
    const commit = sh('git', ['-C', dir, 'rev-parse', 'HEAD']).trim();
    const entries = sh('git', ['-C', dir, 'ls-tree', '-r', '-z', 'HEAD']).split('\0').filter(Boolean).map(e => {
      const [meta, p] = e.split('\t'); const [, type, oid] = meta.split(/\s+/); return { type, oid, path: p };
    }).filter(e => e.type === 'blob' && langOf(e.path));
    // Blobs over 1 MiB were never downloaded (clone filter); with lazy fetching off they read as missing and are skipped.
    const wanted = entries.filter(e => !SKIP.test(e.path));
    const blobs = readBlobs(dir, [...new Set(wanted.map(e => e.oid))]);
    ctx.db.exec('BEGIN');
    let files = 0;
    for (const e of wanted) {
      const bytes = blobs.get(e.oid);
      if (!bytes || gitBlobId(bytes) !== e.oid) continue;
      ingestFile(ctx, { repo: r.full_name, commit, path: e.path, bytes, oid: e.oid, seen: now });
      files++;
    }
    ctx.db.prepare('INSERT OR REPLACE INTO scan(repo, commit_sha, branch, scanned_utc, files, skipped, issue) VALUES(?,?,?,?,?,?,NULL)')
      .run(r.full_name, commit, r.default_branch, now, files, entries.length - files);
    ctx.db.exec('COMMIT');
    console.log(`${r.full_name}: ${files} code files (${entries.length - files} skipped: vendored, minified or over 1 MiB)`);
  } catch (e) {
    try { ctx.db.exec('ROLLBACK'); } catch {}
    gaps.push({ repo: r.full_name, reason: String(e.message).split('\n')[0].slice(0, 200) });
    console.log(`${r.full_name}: not scanned — ${gaps.at(-1).reason}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ---------- proof: files rebuild byte for byte from their numbered lines ----------
const sample = ctx.db.prepare('SELECT n, git_blob FROM tablet ORDER BY random() LIMIT 300').all();
const rebuiltOk = sample.filter(t => gitBlobId(rebuildTablet(ctx, t.n)) === t.git_blob).length;
if (rebuiltOk !== sample.length) { console.error(`Rebuild check failed: ${rebuiltOk}/${sample.length}`); process.exit(1); }

// ---------- reports ----------
const count = t => Number(ctx.db.prepare(`SELECT count(*) c FROM ${t}`).get().c);
const live = new Map(JSON.parse(readFileSync(new URL('./live-sites.json', import.meta.url), 'utf8').replace(/^\uFEFF/, '')).sites.map(s => [s.repo, s.site]));
const enc = p => p.split('/').map(encodeURIComponent).join('/');
// A file's lineage is its path with timestamp stamps (8 or 12 digits) folded, so 202609051152-x.js and 202609041945-x.js match.
const lineageOf = p => p.replace(/(^|[^0-9])\d{8}(\d{4})?(?=[^0-9]|$)/g, '$1{stamp}');
const gh = o => `https://github.com/${o.repo}/blob/${o.commit_sha}/${enc(o.path)}#L${o.first}-L${o.last}`;

const places = ctx.db.prepare(`
  SELECT e.family fam, te.element el, te.tablet, te.first, te.last, te.col0, te.col1, te.name, e.kind, e.needs, e.standalone,
         o.repo, o.commit_sha, o.path, o.seen_utc
  FROM tablet_element te JOIN element e ON e.n = te.element JOIN occurrence o ON o.tablet = te.tablet
  JOIN scan s ON s.repo = o.repo AND s.commit_sha = o.commit_sha
  ORDER BY e.family, o.seen_utc, te.element`).all();
const families = new Map();
for (const p of places) {
  let f = families.get(p.fam);
  if (!f) families.set(p.fam, f = { n: Number(p.fam), places: [], repos: new Set(), elements: new Set(), names: new Set(), lineages: new Set() });
  f.places.push(p); f.repos.add(p.repo); f.elements.add(Number(p.el)); f.names.add(p.name); f.lineages.add(p.repo + ':' + lineageOf(p.path));
}
const famList = [...families.values()];
// Copies of one file in timestamped release folders are versions, not duplicate work. Only logic that lives in two or
// more different files (lineages) counts as work done more than once.
const repeated = famList.filter(f => f.lineages.size >= 2).sort((a, b) => b.repos.size - a.repos.size || b.lineages.size - a.lineages.size || b.places.length - a.places.length || a.n - b.n);
const versionedOnly = famList.filter(f => f.places.length >= 2 && f.lineages.size === 1).length;
const firstWritten = new Map();
let history = null;
try {
  for (const r of ctx.db.prepare(`SELECT e.family fam, min(ci.date) d FROM tablet_element te JOIN element e ON e.n = te.element
      JOIN occurrence o ON o.tablet = te.tablet JOIN commit_info ci ON ci.repo = o.repo AND ci.sha = o.commit_sha GROUP BY e.family`).all()) firstWritten.set(Number(r.fam), r.d);
  history = ctx.db.prepare('SELECT count(*) repos, sum(commits_done) done, sum(commits_total) total, sum(commits_done >= commits_total) complete FROM wander').get();
} catch { /* history not walked yet */ }
const divergent = ctx.db.prepare(`
  SELECT te.name, count(DISTINCT e.family) fams, count(DISTINCT o.repo) repos
  FROM tablet_element te JOIN element e ON e.n = te.element JOIN occurrence o ON o.tablet = te.tablet
  JOIN scan s ON s.repo = o.repo AND s.commit_sha = o.commit_sha
  WHERE te.name NOT IN ('(anonymous)', 'default', 'constructor', 'init', 'main', 'render', 'update', 'run') AND length(te.name) > 3
  GROUP BY te.name HAVING fams >= 2 AND repos >= 2 ORDER BY repos DESC, fams DESC LIMIT 25`).all();

// Compiled library: one canonical copy of each repeated, self-contained JavaScript function.
const library = [];
for (const f of repeated) {
  const c = f.places.find(p => p.standalone && p.col0 !== null && p.kind !== 'class' && p.kind !== 'method');
  if (!c) continue;
  const src = elementSource(ctx, c);
  try { acorn.parse('(' + src + '\n)', { ecmaVersion: 'latest', sourceType: 'module' }); } catch { continue; }
  library.push({ f, c, src });
}
mkdirSync(path.join(OUT, 'library'), { recursive: true });
writeFileSync(path.join(OUT, 'library', 'standalone.mjs'),
  `// Compiled library of self-contained JavaScript functions that appear in two or more places across Ventusltd code.\n` +
  `// Generated by the modular star ${now}. Each export is one family's earliest-seen copy, unchanged; the comment links its source.\n` +
  `// Candidates for reuse, not reviewed or tested: check the source before depending on one.\n\n` +
  library.map(({ f, c, src }) => `// Family #${f.n} · element #${c.el} · ${f.places.length} places in ${f.repos.size} repositories · ${gh(c)}\n` +
    `export const f${f.n}_${String(c.name).replace(/[^A-Za-z0-9_$]/g, '_').slice(0, 40)} = ${src};\n`).join('\n'));

// Spider graph, in the ventus-grid-engine receiver's generic shape (index.html normaliseGenericGraph):
// nodes {id, label, type, rag, reason, gh, ext}, edges {from, to, type} by id. Ids are the permanent keys, so any
// other graph that uses the same key (family:N, repo:owner/name) joins this one.
const SITE = 'https://ventusltd.github.io/stars/';
const codePage = n => `${SITE}code.html?family=${n}`;
const top = repeated.slice(0, 200);
const nodes = [], edges = [], repoNodes = new Set();
for (const f of top) {
  const c = f.places[0], id = `family:${f.n}`;
  const needs = c.needs ? JSON.parse(c.needs) : null;
  nodes.push({ id, key: id, label: `#${f.n} ${[...f.names][0]}`, type: c.standalone ? 'library element' : 'element', rag: c.standalone ? 'green' : 'amber',
    reason: `${f.lineages.size} different files · ${f.places.length} places in ${f.repos.size} repositories · ${f.elements.size} version(s)` + (firstWritten.has(f.n) ? ` · first written ${firstWritten.get(f.n).slice(0, 10)}` : '') + (needs?.length ? ` · needs ${needs.slice(0, 6).join(', ')}` : c.standalone ? ' · self-contained' : ''),
    gh: gh(c), ext: codePage(f.n) });
  for (const r of f.repos) { repoNodes.add(r); edges.push({ from: id, to: `repo:${r}`, type: 'found-in' }); }
}
// Same name, different code: wire the families that share a name, so the Spider shows where a name means two things.
const byName = new Map();
for (const f of top) for (const name of f.names) if (name.length > 3 && !['(anonymous)', 'default', 'constructor'].includes(name)) byName.set(name, [...(byName.get(name) || []), f.n]);
for (const ns of byName.values()) for (let i = 1; i < ns.length; i++) edges.push({ from: `family:${ns[0]}`, to: `family:${ns[i]}`, type: 'same-name' });
for (const r of repoNodes) nodes.push({ id: `repo:${r}`, key: `repo:${r}`, label: r.split('/')[1], type: 'repo', rag: 'green',
  reason: live.has(r) ? `published at ${live.get(r)}` : 'repository', gh: `https://github.com/${r}`, ext: live.get(r) || null });
mkdirSync(path.join(OUT, 'modular'), { recursive: true });
writeFileSync(path.join(OUT, 'modular', 'graph.json'), JSON.stringify({ schema: 'modular-star-graph.v1', label: 'The Modular star', generated_utc: now, nodes, edges }, null, 1));

// Code records for the report page (code.html): every family, in buckets of 500 by number, so a page loads one
// small file. Each record carries every place the logic lives, the live page that serves it, and the permanent
// line numbers of its first copy. Plus a name index for search.
const libraryExport = new Map(library.map(({ f, c }) => [f.n, `f${f.n}_${String(c.name).replace(/[^A-Za-z0-9_$]/g, '_').slice(0, 40)}`]));
const tabletLines = new Map();
const lineNumbers = p => {
  if (!tabletLines.has(p.tablet)) tabletLines.set(p.tablet, unpack(ctx.db.prepare('SELECT lines FROM tablet WHERE n = ?').get(p.tablet).lines));
  return tabletLines.get(p.tablet).slice(p.first - 1, p.last);
};
const buckets = new Map(), names = {};
for (const f of famList) {
  const c = f.places[0];
  const rec = {
    n: f.n, names: [...f.names].slice(0, 6), kind: c.kind, standalone: !!c.standalone, needs: c.needs ? JSON.parse(c.needs) : null,
    first_written: firstWritten.get(f.n) || null, library: libraryExport.get(f.n) || null,
    files: f.lineages.size, versions: f.elements.size, repos: [...f.repos],
    lines: lineNumbers(c),
    places: f.places.slice(0, 40).map(p => ({ repo: p.repo, commit: p.commit_sha, path: p.path, first: p.first, last: p.last, name: p.name,
      live: live.has(p.repo) ? live.get(p.repo) + p.path : null })),
  };
  const b = Math.floor(f.n / 500);
  if (!buckets.has(b)) buckets.set(b, {});
  buckets.get(b)[f.n] = rec;
  for (const name of f.names) if (name !== '(anonymous)') (names[name] ||= []).push(f.n);
}
mkdirSync(path.join(OUT, 'code', 'f'), { recursive: true });
for (const [b, recs] of buckets) writeFileSync(path.join(OUT, 'code', 'f', `${b}.json`), JSON.stringify(recs));
writeFileSync(path.join(OUT, 'code', 'names.json'), JSON.stringify(names));
writeFileSync(path.join(OUT, 'code', 'index.json'), JSON.stringify({ generated_utc: now, families: famList.length, bucket_size: 500, buckets: [...buckets.keys()].sort((a, b) => a - b), lines: count('line'), elements: count('element') }));

// Prior-work catalogue (release asset): exact element hashes and family hashes → where they already live.
const elementRows = ctx.db.prepare('SELECT e.n, e.sha, e.family, f.sha fsha FROM element e JOIN family f ON f.n = e.family').all();
const catalog = { generated_utc: now, elements: {}, families: {} };
for (const e of elementRows) catalog.elements[Buffer.from(e.sha).toString('hex')] = [Number(e.n), Number(e.family)];
for (const f of famList) catalog.families[f.n] = {
  names: [...f.names].slice(0, 5), repos: f.repos.size,
  places: f.places.slice(0, 10).map(p => ({ link: gh(p), live: live.has(p.repo) ? live.get(p.repo) + p.path : null })) };
catalog.family_by_hash = Object.fromEntries(ctx.db.prepare('SELECT n, sha FROM family').all().map(f => [Buffer.from(f.sha).toString('hex'), Number(f.n)]));
writeFileSync(path.join(OUT, 'catalog.json.gz'), gzipSync(JSON.stringify(catalog)));

const scans = ctx.db.prepare('SELECT * FROM scan ORDER BY repo').all();
writeFileSync(path.join(OUT, 'modular', 'source.json'), JSON.stringify({ generated_utc: now, repositories: scans.map(s => ({ repo: s.repo, commit: s.commit_sha, code_files: Number(s.files) })), not_scanned: gaps }, null, 2));

const md = [];
md.push('# The Modular star', '');
md.push(`Updated ${now.slice(0, 16).replace('T', ' ')} UTC by GitHub Actions. It reads the current code of ${scans.length} Ventusltd repositories.`, '');
md.push('Every unique line of code has a permanent number. Each file version is stored as its list of line numbers. Functions and classes are numbered as **elements**, and elements with the same logic, ignoring layout and comments, share a numbered **family**. Numbers never change, so a link to line, element or family #N stays valid.', '');
md.push('## Totals', '', '| | count |', '|---|---|');
md.push(`| Unique lines | ${count('line').toLocaleString('en-GB')} |`, `| File versions | ${count('tablet').toLocaleString('en-GB')} |`, `| Elements (functions and classes) | ${count('element').toLocaleString('en-GB')} |`, `| Families (same logic) | ${count('family').toLocaleString('en-GB')} |`);
md.push(`| Families written in two or more different files (duplicate work) | ${repeated.length.toLocaleString('en-GB')} |`, `| Families only copied between versions of one file | ${versionedOnly.toLocaleString('en-GB')} |`, `| Self-contained functions compiled into the library | ${library.length.toLocaleString('en-GB')} |`, '');
md.push(`Check: ${rebuiltOk} randomly chosen files were rebuilt from their numbered lines, and all matched GitHub byte for byte.`, '');
if (history) md.push(`History walked: ${Number(history.done).toLocaleString('en-GB')} of ${Number(history.total).toLocaleString('en-GB')} commits across ${history.repos} repositories (${history.complete} complete). Each run continues where the last one stopped.`, '');
md.push('## Work already done more than once', '', 'The same logic written in two or more different files. Copies of one file in timestamped release folders are counted as versions, not here. Before writing something similar, reuse one of these.', '');
md.push('| Family | Name | Different files | Places | Repositories | Self-contained | First written | A copy |', '|---|---|---|---|---|---|---|---|');
for (const f of repeated.slice(0, 30)) { const c = f.places[0]; md.push(`| #${f.n} | \`${[...f.names].slice(0, 2).join('`, `')}\` | ${f.lineages.size} | ${f.places.length} | ${f.repos.size} | ${c.standalone ? 'yes' : 'no'} | ${(firstWritten.get(f.n) || '').slice(0, 10) || '–'} | [${c.repo.split('/')[1]}/${c.path}](${gh(c)}) |`); }
md.push('', '## Same name, different code', '', 'These names mean different things in different repositories, so check which version is meant before relying on one.', '');
md.push('| Name | Different versions | Repositories |', '|---|---|---|');
for (const d of divergent) md.push(`| \`${d.name}\` | ${d.fams} | ${d.repos} |`);
md.push('', '## How to check for earlier work before writing code', '');
md.push('```', 'npm install', 'node modular-star/find-prior.mjs path/to/your-file.js', '```');
md.push('This lists every function in the file that already exists, either word for word or with the same logic in a different layout, with links to where it lives.', '');
md.push('## Use in the Spider', '', '`modular/graph.json` is a Spider graph: the most repeated families wired to the repositories they appear in. Green means self-contained; amber means the function needs something from outside itself, which the node lists.', '');
md.push('## Coverage', '');
md.push(`- Current default branch of each repository scanned; earlier history is not yet included. Numbers from earlier runs are kept, so history builds up with every run.`);
md.push('- JavaScript, HTML inline scripts and Python only. Files over 1 MiB, minified files and vendored folders are skipped.');
md.push('- Public repositories only, by design: this repository is public, so private code is never read into it.');
if (gaps.length) md.push(`- Not scanned this run: ${gaps.map(g => g.repo).join(', ')} (see \`modular/source.json\`).`);
writeFileSync(path.join(OUT, 'modular', 'SUMMARY.md'), md.join('\n') + '\n');
ctx.db.close();
console.log(`Done: ${count.length ? '' : ''}${repeated.length} repeated families, ${library.length} library functions, ${gaps.length} repositories not scanned.`);
