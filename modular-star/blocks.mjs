// The periodic table of blocks: every family grouped into a plain-language block with a permanent number.
// Numbers 1-47 are star-maker's elements and never change; catalogue blocks take 48+ in catalogue order; anything
// unmatched becomes an auto-block per source file, numbered once and persisted in blocks/numbers.json.
// Reads code/f/*.json (written by build.mjs), the star-maker table and the engine-graph. Writes blocks/*.json and
// the Spider graph blocks/graph.json. Usage: node modular-star/blocks.mjs --out . [--work /tmp/repos]
// --work is build.mjs's clone directory; a block's files are read from it (else from GitHub) to sort its needs.
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { readFiles, classifyNeeds, REQUIRED, counts } from './needs.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('out', '.'), SITE = 'https://ventusltd.github.io/stars/';
const WORK = arg('work', '/tmp/repos'), work = existsSync(WORK) ? WORK : null;
const now = new Date().toISOString();
const cat = JSON.parse(readFileSync(new URL('./blocks-catalogue.json', import.meta.url), 'utf8'));
const fold = p => p.replace(/(^|[^0-9])\d{8}(\d{4})?(?=[^0-9]|$)/g, '$1{stamp}');
const getJson = async u => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch { return null; } };

// ---- inputs
const families = [];
for (const f of readdirSync(path.join(OUT, 'code', 'f'))) for (const r of Object.values(JSON.parse(readFileSync(path.join(OUT, 'code', 'f', f), 'utf8')))) families.push(r);
const table = await getJson('https://raw.githubusercontent.com/Ventusltd/star-maker/main/elements/table.json');
const engineGraph = await getJson('https://ventusltd.github.io/ventus-grid-engine/genome/engine-graph.json');
const engineReason = new Map((engineGraph?.nodes || []).map(n => [n.label, n.reason]));
const numbersPath = path.join(OUT, 'blocks', 'numbers.json');
const numbers = existsSync(numbersPath) ? JSON.parse(readFileSync(numbersPath, 'utf8')) : { next: 48 + cat.blocks.length, auto: {} };

// ---- the blocks, in number order
const blocks = [];
const byKey = new Map();
const add = b => { blocks.push(b); byKey.set(b.key, b); return b; };
for (const e of table?.elements || []) {
  const kind = e.number <= 12 ? 'constant' : e.number <= 31 ? 'engine' : e.number <= 35 ? 'cartridge' : e.number <= 46 ? 'layer' : 'deeplink';
  const category = kind === 'engine' ? (cat.engine_categories[e.name] || 'geodesy') : cat.table_categories[kind];
  const title = kind === 'engine' ? (cat.engine_titles[e.name] || e.name) : kind === 'constant' ? e.name.replace(/_/g, ' ').toLowerCase().replace(/^./, c => c.toUpperCase()) :
    kind === 'layer' ? e.name.replace(/_/g, ' ').replace(/(\d+)kv/i, '$1 kV').replace(/^./, c => c.toUpperCase()) : kind === 'deeplink' ? 'The MAP button (deep-link contract)' : e.name;
  const description = kind === 'engine' ? (cat.engine_descriptions[e.name] || engineReason.get('engine/' + e.name) || '') :
    kind === 'constant' ? `A value globalgrid2050 architecture development must agree on. ${e.state === 'UNSETTLED' ? (e.candidates?.length || 0) + ' different values are in use; which is true is a decision.' : 'Settled.'}` :
    kind === 'layer' ? 'A data layer drawn on the GridAtlas map.' : kind === 'cartridge' ? 'A plug-in part of the GridAtlas map.' : 'The contract every MAP link obeys, so a link always arrives on the right feature.';
  const match = kind === 'engine' ? [`^ventus-grid-engine:engine/${e.name.replace('.', '\\.')}$`] : kind === 'cartridge' ? [`cartridges/\\{stamp\\}-${e.name}`, `parts/\\{stamp\\}-${e.name}`, `modules/\\{stamp\\}-${e.name}`, `/${e.name}\\.js$`] :
    kind === 'layer' ? [`(^|[/_-])${e.name}([/_.-]|$)`] : kind === 'deeplink' ? ['deeplink', 'deep-link'] : [];
  add({ number: e.number, symbol: e.symbol, key: e.symbol, title, description, category, kind, state: e.state || null, match: match.map(m => new RegExp(m, 'i')), families: [], source: 'star-maker table' });
}
cat.blocks.forEach((b, i) => add({ number: 48 + i, symbol: b.symbol, key: b.symbol, title: b.title, description: b.description, category: b.category, kind: b.kind, state: null, match: b.match.map(m => new RegExp(m, 'i')), families: [], source: 'catalogue' }));

// ---- assign every family: first block whose pattern matches any of its source files (lineage form)
const lineageOf = p => p.repo.split('/')[1] + ':' + fold(p.path);
const autoTitle = lineage => { const file = lineage.split(':')[1].split('/').pop().replace(/\{stamp\}-?/g, '').replace(/\.(m?js|py|html?)$/i, ''); return file.replace(/[-_]+/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase()); };
for (const f of families) {
  const lineages = [...new Set(f.places.map(lineageOf))];
  let block = null;
  outer: for (const b of blocks) for (const l of lineages) for (const m of b.match) if (m.test(l)) { block = b; break outer; }
  if (!block) {
    // Auto-block per source file lineage (the first place's), numbered once and kept.
    const l = lineages[0], key = 'auto:' + l;
    block = byKey.get(key);
    if (!block) {
      if (!numbers.auto[l]) { numbers.auto[l] = numbers.next++; }
      const repo = l.split(':')[0];
      block = add({ number: numbers.auto[l], symbol: 'x' + numbers.auto[l], key, title: autoTitle(l), description: `Functions from ${repo} ${l.split(':')[1]}.`, category: 'other', kind: 'auto', state: null, match: [], families: [], source: 'auto', lineage: l });
    }
  }
  block.families.push(f);
}
mkdirSync(path.join(OUT, 'blocks'), { recursive: true });
writeFileSync(numbersPath, JSON.stringify(numbers, null, 1));

// ---- finish each block: functions inside, files to copy, where it lives (needs are sorted below, once every block's names are known)
const stampOf = p => (p.match(/\d{12}|\d{8}/g) || ['0']).sort().pop();
const out = blocks.map(b => {
  const fams = b.families;
  const defined = new Set(fams.flatMap(f => f.names));
  const needs = [...new Set(fams.flatMap(f => f.needs || []))].filter(x => !defined.has(x)).sort();
  const repos = [...new Set(fams.flatMap(f => f.repos))];
  const live = [...new Set(fams.flatMap(f => f.places.filter(p => p.live).map(p => p.live)))].slice(0, 8);
  // One file per lineage, the newest stamp: what the generator copies when this block is chosen.
  const byLineage = new Map();
  for (const f of fams) for (const p of f.places) { const l = lineageOf(p); const cur = byLineage.get(l); if (!cur || stampOf(p.path) > stampOf(cur.path)) byLineage.set(l, p); }
  const files = [...byLineage.values()].map(p => ({ repo: p.repo, commit: p.commit, path: p.path, live: p.live || null })).slice(0, 12);
  const named = fams.filter(f => f.names[0] !== '(anonymous)');
  b.defined = defined; b.needsRaw = needs;
  return { number: b.number, symbol: b.symbol, title: b.title, description: b.description, category: b.category, kind: b.kind, state: b.state, source: b.source,
    functions: fams.length, named_functions: named.length, families: fams.map(f => f.n),
    inside: named.sort((a, b2) => b2.places.length - a.places.length).slice(0, 40).map(f => ({ family: f.n, name: f.names[0], places: f.places.length, standalone: f.standalone })),
    needs: [], needs_detail: [], needs_checked: needs.length, repos, live, files,
    first_written: fams.map(f => f.first_written).filter(Boolean).sort()[0] || null };
}).sort((a, b) => a.number - b.number);

// ---- needs, sorted the way code-generator sorts them (needs.mjs, needs-rules.mjs). The scan's raw list is every
// name a function uses without defining it; reading the block's own files tells built-ins, locals and prose apart
// from what is genuinely required. `needs` keeps only the required names (missing, library, another block);
// `needs_detail` is the whole checked list so nothing is hidden.
const namedBlocks = blocks.filter(b => b.kind !== 'auto' && b.families.length);
const tally = {};
for (const o of out) {
  const b = byKey.get(o.symbol) || blocks.find(x => x.number === o.number);
  if (!b.needsRaw?.length) continue;
  const texts = await readFiles(o.files, work);
  const definersOf = name => namedBlocks.filter(other => other.number !== b.number && other.defined?.has(name)).map(x => ({ symbol: x.symbol, title: x.title }));
  o.needs_detail = classifyNeeds(b.needsRaw, texts, { definersOf, words: cat.needs_words });
  o.needs = o.needs_detail.filter(d => REQUIRED.has(d.class)).map(({ name, class: cls, meaning, block }) => block ? { name, class: cls, meaning, block } : { name, class: cls, meaning });
  o.needs_files_read = texts.length;
  for (const [c, n] of Object.entries(counts(o.needs_detail))) tally[c] = (tally[c] || 0) + n;
}
console.log(`Needs checked: ${Object.entries(tally).map(([c, n]) => `${c} ${n}`).join(', ') || 'none'}; required ${out.reduce((s, o) => s + o.needs.length, 0)} of ${out.reduce((s, o) => s + o.needs_checked, 0)} names.`);

// Interdependencies between blocks: block A depends on block B when a name A needs is defined inside B.
for (const o of out) {
  const deps = new Map();
  for (const d of o.needs_detail) if (d.class === 'block') for (const symbol of d.blocks) { if (!deps.has(symbol)) deps.set(symbol, []); deps.get(symbol).push(d.name); }
  o.depends_on = [...deps].map(([symbol, via]) => ({ symbol, title: namedBlocks.find(x => x.symbol === symbol).title, via: via.slice(0, 6) }));
}
for (const o of out) o.used_by = out.filter(x => x.depends_on.some(d => d.symbol === o.symbol)).map(x => x.symbol);

mkdirSync(path.join(OUT, 'blocks'), { recursive: true });
// The public table is kept light for phones: family lists live in families.json, the rest in blocks.json.
writeFileSync(path.join(OUT, 'blocks', 'families.json'), JSON.stringify(Object.fromEntries(out.map(b => [b.symbol, b.families]))));
writeFileSync(path.join(OUT, 'blocks', 'blocks.json'), JSON.stringify({ generated_utc: now, categories: cat.categories,
  // Small auto-blocks (under 8 functions) stay in families.json only; they are not shown anywhere.
  blocks: out.filter(b => b.kind !== 'auto' || b.functions >= 8).map(({ families, ...b }) => b.kind === 'auto' ? { ...b, inside: b.inside.slice(0, 6), files: b.files.slice(0, 2), live: b.live.slice(0, 1), repos: b.repos.slice(0, 3) } : { ...b, inside: b.inside.slice(0, 24), files: b.files.slice(0, 8), live: b.live.slice(0, 4) }) }));
writeFileSync(path.join(OUT, 'blocks', 'presets.json'), JSON.stringify({ generated_utc: now, presets: cat.presets }, null, 1));

// ---- Spider graph: blocks wired to their categories and to the repositories they live in. Plain descriptions on the card.
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nodes = [], edges = [];
for (const c of cat.categories) nodes.push({ id: `category:${c.id}`, label: c.title, type: 'category', rag: 'green', reason: c.blurb, gh: null, ext: `${SITE}table.html?category=${c.id}` });
const repoSeen = new Set();
for (const b of out) {
  if (b.kind === 'auto' && b.functions < 8) continue;
  const rag = b.state === 'UNSETTLED' ? 'amber' : b.functions ? (b.needs.length ? 'amber' : 'green') : 'grey';
  nodes.push({ id: `block:${b.symbol}`, label: `${b.symbol} · ${b.title}`, type: b.kind, rag,
    reason: esc(b.description) + (b.functions ? ` <span style="color:#9aa3b5">· ${b.functions} functions inside${b.needs.length ? ' · needs from elsewhere: ' + b.needs.slice(0, 5).map(n => esc(n.name) + ' (' + esc(n.meaning) + ')').join(', ') : ''}</span>` : ''),
    gh: b.files[0] ? `https://github.com/${b.files[0].repo}/blob/${b.files[0].commit}/${b.files[0].path}` : null, ext: `${SITE}table.html?block=${b.symbol}` });
  edges.push({ from: `category:${b.category}`, to: `block:${b.symbol}`, type: 'contains' }); // edge types follow relationships/VOCABULARY.md
  for (const d of b.depends_on) edges.push({ from: `block:${b.symbol}`, to: `block:${d.symbol}`, type: 'depends-on' });
  for (const r of b.repos.slice(0, 6)) { if (!repoSeen.has(r)) { repoSeen.add(r); nodes.push({ id: `repo:${r}`, label: r.split('/')[1], type: 'repo', rag: 'green', reason: 'repository', gh: `https://github.com/${r}`, ext: null }); } edges.push({ from: `block:${b.symbol}`, to: `repo:${r}`, type: 'found-in' }); }
}
writeFileSync(path.join(OUT, 'blocks', 'graph.json'), JSON.stringify({ schema: 'periodic-table-graph.v1', label: 'The periodic table', generated_utc: now, nodes, edges }));
const autos = out.filter(b => b.kind === 'auto');
console.log(`Blocks: ${out.length} (${out.length - autos.length} named, ${autos.length} auto); families placed ${families.length}; graph ${nodes.length} nodes.`);
