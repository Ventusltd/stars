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
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const tabletLines = new Map();
const tabletOf = t => { if (!tabletLines.has(t)) tabletLines.set(t, unpack(ctx.db.prepare('SELECT lines FROM tablet WHERE n = ?').get(t).lines)); return tabletLines.get(t); };
const lineNumbers = p => tabletOf(p.tablet).slice(p.first - 1, p.last);
// The code itself, on the focused card, in the dashboard's own monospace: numbered lines, capped so the graph stays light.
const CODE_LINES = 14;
function inlineCode(p) {
  const text = elementSource(ctx, p).split('\n'), nums = lineNumbers(p);
  const shown = text.slice(0, CODE_LINES).map((t, i) => `<span style="color:#4b5568">${String(nums[i] ?? '').padStart(6)}</span> ${esc(t)}`).join('\n');
  return `<pre style="margin:6px 0 0;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.62rem;line-height:1.35;color:var(--text);white-space:pre;overflow:auto;max-height:260px">${shown}${text.length > CODE_LINES ? `\n<span style="color:#4b5568">… ${text.length - CODE_LINES} more lines</span>` : ''}</pre>`;
}

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
const ENGINE_GRAPH = 'https://ventusltd.github.io/ventus-grid-engine/genome/engine-graph.json';
const familyOf = new Map(famList.map(f => [f.n, f]));

// ---- Join to the engine-graph: the hand-made duplication map the Spider already shows at ?graph=engine-graph.
// Its canonical nodes are files in ventus-grid-engine; its edges carry file+lines evidence. A family whose copy
// sits in one of those files, at those lines, is wired to that node; the node deep-links into the engine graph.
const engineJoin = new Map(); // family n -> [{label, type, gh, relation}]
let engineGraph = null;
try { engineGraph = await (await fetch(ENGINE_GRAPH)).json(); } catch { /* offline: no join this run */ }
if (engineGraph?.nodes) {
  const placeIndex = new Map(); // "repo-name/path" -> places
  for (const f of famList) for (const p of f.places) { const k = p.repo.split('/')[1] + '/' + p.path; if (!placeIndex.has(k)) placeIndex.set(k, []); placeIndex.get(k).push({ ...p, family: f.n }); }
  const link = (n, node, relation) => { if (!engineJoin.has(n)) engineJoin.set(n, []); if (!engineJoin.get(n).some(x => x.label === node.label)) engineJoin.get(n).push({ label: node.label, type: node.type, gh: node.gh, relation }); };
  engineGraph.nodes.forEach(node => { for (const p of placeIndex.get('ventus-grid-engine/' + node.label) || []) link(p.family, node, node.type === 'canonical' ? 'canonical home' : 'engine file'); });
  for (const e of engineGraph.edges || []) {
    const ev = e.evidence; if (!ev?.file) continue;
    const m = String(ev.lines || '').match(/(\d+)\s*-\s*(\d+)/); if (!m) continue; // evidence without a line range cites a whole file: too loose to wire
    const [a, b] = [Number(m[1]), Number(m[2])];
    for (const p of placeIndex.get(ev.file) || []) if (p.first <= b && p.last >= a) {
      const fromNode = engineGraph.nodes[e.from], toNode = engineGraph.nodes[e.to];
      if (toNode) link(p.family, toNode, e.type === 'supersedes' ? 'fragment cited as superseded' : `cited: ${e.type}`);
      if (fromNode && e.type === 'supersedes') link(p.family, fromNode, 'superseded by');
    }
  }
}

// ---- Join to the chemistry stars: each decay message (the error a red composition produces) resolved to the
// numbered lines that contain it, and so to the functions that throw it.
const decays = [];
try {
  const compounds = JSON.parse(readFileSync(path.join(OUT, 'reports', 'chemistry', 'compounds.json'), 'utf8')).compounds || [];
  const counts = new Map();
  for (const c of compounds) for (const d of c.decays || []) counts.set(d.text, (counts.get(d.text) || 0) + (d.n || 1));
  const tabletsByLine = new Map();
  for (const t of ctx.db.prepare('SELECT n, lines FROM tablet').all()) unpack(t.lines).forEach((ln, i) => { if (!tabletsByLine.has(ln)) tabletsByLine.set(ln, []); tabletsByLine.get(ln).push([Number(t.n), i + 1]); });
  const teByTablet = new Map();
  for (const te of ctx.db.prepare('SELECT te.tablet, te.first, te.last, te.name, e.family FROM tablet_element te JOIN element e ON e.n = te.element').all()) { if (!teByTablet.has(te.tablet)) teByTablet.set(te.tablet, []); teByTablet.get(te.tablet).push(te); }
  for (const [text, n] of [...counts].sort((a, b) => b[1] - a[1]).slice(0, 12)) {
    const msg = text.split(': ').slice(-1)[0].trim(); if (msg.length < 12) continue;
    const lines = ctx.db.prepare("SELECT n FROM line WHERE instr(CAST(text AS TEXT), ?) > 0 LIMIT 200").all(msg).map(r => Number(r.n));
    const fams = new Map();
    for (const ln of lines) for (const [t, pos] of tabletsByLine.get(ln) || []) for (const te of teByTablet.get(t) || []) if (te.first <= pos && pos <= te.last) fams.set(Number(te.family), te.name);
    // Named functions first; anonymous wrappers (cartridge IIFEs) are shown with their file so the card still says where.
    const list = [...fams].map(([f, name]) => ({ family: f, name: name === '(anonymous)' ? '(anonymous) in ' + (familyOf.get(f)?.places[0]?.path.split('/').pop() || '?') : name })).filter(x => familyOf.has(x.family)).sort((a, b) => (a.name.startsWith('(anonymous)') ? 1 : 0) - (b.name.startsWith('(anonymous)') ? 1 : 0));
    decays.push({ message: text, red_stars: n, needle: msg, lines, families: list });
  }
} catch { /* no chemistry report in this checkout */ }

const chosen = new Map(repeated.slice(0, 150).map(f => [f.n, f]));
// Only the strong relations join the front-door graph; every relation is kept in engine-join.json.
for (const [n, joins] of engineJoin) if (familyOf.has(n) && joins.some(j => /canonical home|superseded by/.test(j.relation))) chosen.set(n, familyOf.get(n));
for (const d of decays) for (const x of d.families.slice(0, 6)) chosen.set(x.family, familyOf.get(x.family));
// Enumeration order for the FOCUS list: by source file (repository, then path), then by family number, so the list reads like a table of contents.
const top = [...chosen.values()].sort((x, y) => x.places[0].repo.localeCompare(y.places[0].repo) || x.places[0].path.localeCompare(y.places[0].path) || x.n - y.n);
const nodes = [], edges = [], repoNodes = new Set(), engineNodes = new Map();
for (const f of top) {
  const c = f.places[0], id = `family:${f.n}`;
  const needs = c.needs ? JSON.parse(c.needs) : null;
  const joins = (engineJoin.get(f.n) || []).filter(j => /canonical home|superseded by|superseded$/.test(j.relation));
  nodes.push({ id, key: id, label: `#${f.n} ${[...f.names][0]}`, type: c.standalone ? 'library element' : 'element', rag: c.standalone ? 'green' : 'amber',
    reason: `${f.lineages.size} different files · ${f.places.length} places in ${f.repos.size} repositories · ${f.elements.size} version(s)` + (firstWritten.has(f.n) ? ` · first written ${firstWritten.get(f.n).slice(0, 10)}` : '') + (needs?.length ? ` · needs ${needs.slice(0, 6).join(', ')}` : c.standalone ? ' · self-contained' : '')
      + (joins.length ? ` · engine: ${joins.map(j => j.relation + ' ' + j.label).join('; ')}` : '') + inlineCode(c),
    gh: gh(c), ext: codePage(f.n) });
  for (const r of f.repos) { repoNodes.add(r); edges.push({ from: id, to: `repo:${r}`, type: 'found-in' }); }
  for (const j of joins) { const eid = `engine:${j.label}`; if (!engineNodes.has(eid)) engineNodes.set(eid, j); edges.push({ from: id, to: eid, type: j.type === 'canonical' ? 'canonical' : 'engine' }); }
}
// Same name, different code: wire the families that share a name, so the Spider shows where a name means two things.
const byName = new Map();
for (const f of top) for (const name of f.names) if (name.length > 3 && !['(anonymous)', 'default', 'constructor'].includes(name)) byName.set(name, [...(byName.get(name) || []), f.n]);
for (const ns of byName.values()) for (let i = 1; i < ns.length; i++) edges.push({ from: `family:${ns[0]}`, to: `family:${ns[i]}`, type: 'same-name' });
for (const r of repoNodes) nodes.push({ id: `repo:${r}`, key: `repo:${r}`, label: r.split('/')[1], type: 'repo', rag: 'green',
  reason: live.has(r) ? `published at ${live.get(r)}` : 'repository', gh: `https://github.com/${r}`, ext: live.get(r) || null });
for (const [eid, j] of engineNodes) nodes.push({ id: eid, key: eid, label: j.label, type: j.type === 'canonical' ? 'engine canonical' : 'engine ' + j.type, rag: j.type === 'canonical' ? 'green' : 'amber',
  reason: j.type === 'canonical' ? 'the engine\'s canonical module: the copy that should be imported' : `${j.type} in the engine-graph`, gh: j.gh || null,
  ext: `https://ventusltd.github.io/ventus-grid-engine/?graph=engine-graph&focus=${encodeURIComponent(j.label)}` });
for (const d of decays) {
  if (!d.families.length) continue;
  const id = `decay:${d.needle}`;
  nodes.push({ id, key: id, label: d.message.slice(0, 90), type: 'decay', rag: 'red', reason: `${d.red_stars} red composition tests produce this error · found in ${d.lines.length} numbered line(s) · the functions that carry it are wired below`, gh: null, ext: `${SITE}reports/CHEMISTRY.md` });
  for (const x of d.families.slice(0, 6)) if (chosen.has(x.family)) edges.push({ from: id, to: `family:${x.family}`, type: 'thrown-by' });
}
mkdirSync(path.join(OUT, 'modular'), { recursive: true });
writeFileSync(path.join(OUT, 'modular', 'graph.json'), JSON.stringify({ schema: 'modular-star-graph.v1', label: 'The Modular star', generated_utc: now, nodes, edges }, null, 1));
writeFileSync(path.join(OUT, 'modular', 'decays.json'), JSON.stringify({ generated_utc: now, note: 'Chemistry decay messages resolved to the numbered lines that contain them and the families that throw them.', decays }, null, 1));
writeFileSync(path.join(OUT, 'modular', 'engine-join.json'), JSON.stringify({ generated_utc: now, source: ENGINE_GRAPH, families: Object.fromEntries([...engineJoin].map(([n, j]) => [n, { name: [...familyOf.get(n).names][0], joins: j }])) }, null, 1));
console.log(`Spider graph: ${nodes.length} nodes, ${edges.length} edges; engine join ${engineJoin.size} families; ${decays.length} decay messages resolved.`);

// Code records for the report page (code.html): every family, in buckets of 500 by number, so a page loads one
// small file. Each record carries every place the logic lives, the live page that serves it, and the permanent
// line numbers of its first copy. Plus a name index for search.
const libraryExport = new Map(library.map(({ f, c }) => [f.n, `f${f.n}_${String(c.name).replace(/[^A-Za-z0-9_$]/g, '_').slice(0, 40)}`]));
const buckets = new Map(), names = Object.create(null); // null prototype: a function named constructor or toString must not collide
// Interdependencies: a family "uses" the families that define a name it needs, preferring ones in the same repository.
const definers = new Map();
for (const f of famList) for (const name of f.names) if (name !== '(anonymous)' && name.length > 1) { if (!definers.has(name)) definers.set(name, []); definers.get(name).push(f); }
const usesOf = f => {
  const needs = f.places[0].needs ? JSON.parse(f.places[0].needs) : [];
  const out = [];
  for (const name of needs) {
    const cands = definers.get(name); if (!cands) continue;
    const same = cands.filter(g => [...g.repos].some(r => f.repos.has(r)));
    for (const g of (same.length ? same : cands).slice(0, 3)) if (g.n !== f.n) out.push({ family: g.n, name, via: same.length ? 'same repository' : 'by name only' });
  }
  return out;
};
const usedBy = new Map();
const recs = new Map();
// What a function still needs from OUTSIDE ITS FILE: its needs minus every name its own file declares
// (constants, variables, functions, classes, window.x assignments). This is what a copied file still lacks.
const declaredCache = new Map();
const fileDeclares = tablet => {
  if (!declaredCache.has(tablet)) {
    const src = rebuildTablet(ctx, tablet).toString('utf8');
    const s = new Set();
    for (const m of src.matchAll(/\b(?:const|let|var|function|class)\s+([A-Za-z_$][\w$]*)/g)) s.add(m[1]);
    for (const m of src.matchAll(/\b(?:const|let|var)\s*\{([^}]*)\}/g)) for (const part of m[1].split(',')) { const nm = part.split(':').pop().trim().split('=')[0].trim(); if (/^[A-Za-z_$][\w$]*$/.test(nm)) s.add(nm); }
    for (const m of src.matchAll(/\bwindow\.([A-Za-z_$][\w$]*)\s*=/g)) s.add(m[1]);
    for (const m of src.matchAll(/\bimport\s+(?:\*\s+as\s+)?([A-Za-z_$][\w$]*)|\bimport\s*\{([^}]*)\}/g)) { if (m[1]) s.add(m[1]); if (m[2]) for (const part of m[2].split(',')) { const nm = part.split(' as ').pop().trim(); if (nm) s.add(nm); } }
    declaredCache.set(tablet, s);
  }
  return declaredCache.get(tablet);
};
for (const f of famList) {
  const c = f.places[0];
  const uses = usesOf(f);
  const declared = fileDeclares(c.tablet);
  const needsOutside = (c.needs ? JSON.parse(c.needs) : []).filter(n => !declared.has(n));
  for (const u of uses) { if (!usedBy.has(u.family)) usedBy.set(u.family, []); usedBy.get(u.family).push({ family: f.n, name: u.name }); }
  recs.set(f.n, {
    n: f.n, names: [...f.names].slice(0, 6), kind: c.kind, standalone: !!c.standalone, needs: needsOutside, needs_in_function: c.needs ? JSON.parse(c.needs) : null,
    first_written: firstWritten.get(f.n) || null, library: libraryExport.get(f.n) || null,
    files: f.lineages.size, versions: f.elements.size, repos: [...f.repos],
    lines: lineNumbers(c), uses,
    places: f.places.slice(0, 40).map(p => ({ repo: p.repo, commit: p.commit_sha, path: p.path, first: p.first, last: p.last, name: p.name,
      live: live.has(p.repo) ? live.get(p.repo) + p.path : null })),
  });
}
const hubs = [...usedBy].map(([n, by]) => ({ family: n, name: [...familyOf.get(n).names][0], used_by: by.length })).sort((a, b) => b.used_by - a.used_by).slice(0, 60);
writeFileSync(path.join(OUT, 'modular', 'dependencies.json'), JSON.stringify({ generated_utc: now, note: 'A family uses the families that define a name it needs; hubs are the most used.', families_with_uses: [...recs.values()].filter(r => r.uses.length).length, hubs }, null, 1));
for (const f of famList) {
  const rec = recs.get(f.n);
  rec.used_by = (usedBy.get(f.n) || []).slice(0, 40);
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
