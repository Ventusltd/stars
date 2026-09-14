#!/usr/bin/env node
// sense.mjs — makes sense of the code universe for the Spider dashboard.
//
// Reads the published star data (blocks/, code/, modular/) and writes one small graph,
// sense/graph.json, whose ORDER and WIRING tell a story instead of listing files:
//   the whole → its purposes → the blocks that serve each purpose → the canonical homes
//   → the copies that should import them (illusion) → the decisions still open
//   → what is proven together → what breaks → what everything leans on.
// Also writes sense/SENSE.md explaining the graph in plain language.
//
// Usage: node modular-star/sense.mjs --out .      (node 24, no dependencies)
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const ROOT = outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : '.';
const STARS = 'https://ventusltd.github.io/stars/';
const MAX_NODES = 300;

const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8'));
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

// ---------- load ----------
const blocksFile = readJson('blocks/blocks.json');
const reactions = readJson('blocks/reactions.json');
const families = existsSync(join(ROOT, 'blocks/families.json')) ? readJson('blocks/families.json') : {};
const deps = readJson('modular/dependencies.json');
const decays = readJson('modular/decays.json');
const engineJoin = readJson('modular/engine-join.json');
const codeIndex = existsSync(join(ROOT, 'code/index.json')) ? readJson('code/index.json') : null;

const blocks = blocksFile.blocks || [];
const categories = blocksFile.categories || [];
const bySymbol = new Map(blocks.map((b) => [b.symbol, b]));
const byNumber = new Map(blocks.map((b) => [String(b.number), b]));
const findBlock = (ref) => {
  if (ref == null) return null;
  if (typeof ref === 'object') return findBlock(ref.symbol ?? ref.number ?? ref.block ?? ref.id);
  return bySymbol.get(String(ref)) || byNumber.get(String(ref)) || null;
};

// Function families: read only the buckets we need (families named by decays, hubs, engine-join).
const familyCache = new Map();
const bucketSize = codeIndex?.bucket_size || 500;
function family(n) {
  const key = String(n);
  if (familyCache.has(key)) return familyCache.get(key);
  const bucket = Math.floor(Number(n) / bucketSize);
  const p = join(ROOT, 'code/f', `${bucket}.json`);
  let rec = null;
  if (existsSync(p)) {
    try { rec = JSON.parse(readFileSync(p, 'utf8'))[key] || null; } catch { rec = null; }
  }
  familyCache.set(key, rec);
  return rec;
}
const familyGh = (rec) => {
  const pl = rec?.places?.[0];
  if (!pl) return null;
  return `https://github.com/${pl.repo}/blob/${pl.commit || 'main'}/${pl.path}#L${pl.first}-L${pl.last}`;
};

// ---------- graph builder ----------
const nodes = [];
const edges = [];
const ids = new Set();
function add(node) {
  if (ids.has(node.id)) return node.id;
  ids.add(node.id);
  nodes.push(node);
  return node.id;
}
function wire(from, to, type) {
  if (!ids.has(from) || !ids.has(to) || from === to) return;
  edges.push({ from, to, type });
}

// ---------- 1. the whole ----------
const familyCount = codeIndex?.families ?? deps.families_with_uses ?? 0;
const canonicalCount = Object.values(engineJoin.families || {}).filter((f) => f.joins?.some((j) => j.type === 'canonical')).length;
const fragmentCount = Object.values(engineJoin.families || {}).reduce((n, f) => n + (f.joins || []).filter((j) => j.type === 'fragment').length, 0);
const unsettled = blocks.filter((b) => b.state === 'UNSETTLED');
const settled = blocks.filter((b) => b.state === 'SETTLED');

add({
  id: 'universe', label: 'The code universe', type: 'whole', rag: 'amber',
  reason: `${familyCount.toLocaleString()} distinct functions across globalgrid2050 architecture development, organised into ${blocks.length} numbered blocks; ${settled.length} blocks are settled, ${unsettled.length} are open decisions, and ${fragmentCount} copies still shadow a canonical home.`
    + `<br><small>Read downwards: purpose → block → canonical home → copies → decisions → proof → faults → foundations.</small>`,
  gh: 'https://github.com/Ventusltd/stars/blob/main/CODE-UNIVERSE.md',
  ext: `${STARS}table.html`,
});

// ---------- 2. chapters ----------
const CH = {
  purpose: add({ id: 'ch-purpose', label: 'What the code is for', type: 'chapter', rag: 'green',
    reason: 'The purposes globalgrid2050 architecture development serves; every block below belongs to one of them.', gh: null, ext: `${STARS}table.html` }),
  canonical: add({ id: 'ch-canonical', label: 'What is canonical', type: 'chapter', rag: 'green',
    reason: `The ${canonicalCount} functions whose one true home the engine graph declares; everything else with the same name is a copy.`,
    gh: 'https://github.com/Ventusltd/ventus-grid-engine/blob/main/genome/engine-graph.json', ext: `${STARS}modular/engine-join.json` }),
  illusion: add({ id: 'ch-illusion', label: 'What is illusion', type: 'chapter', rag: 'red',
    reason: `${fragmentCount} copies of canonical functions that look like separate code but are the same thing written twice; each should import its home.`,
    gh: 'https://github.com/Ventusltd/ventus-grid-engine/blob/main/genome/engine-graph.json', ext: `${STARS}modular/engine-join.json` }),
  decision: add({ id: 'ch-decision', label: 'What is a decision, not a fact', type: 'chapter', rag: 'amber',
    reason: `${unsettled.length} values globalgrid2050 architecture development uses in more than one form; which is true cannot be computed, it has to be decided.`,
    gh: 'https://github.com/Ventusltd/stars/blob/main/CODE-UNIVERSE.md', ext: `${STARS}table.html?state=UNSETTLED` }),
  proof: add({ id: 'ch-proof', label: 'What is proven together', type: 'chapter', rag: 'amber',
    reason: `${reactions.reactions?.length ?? 0} pairs of blocks are used together in shipped apps; "seen together" is evidence of fit, not a passed test.`,
    gh: null, ext: `${STARS}blocks/reactions.json` }),
  fault: add({ id: 'ch-fault', label: 'What breaks', type: 'chapter', rag: 'red',
    reason: `${decays.decays?.length ?? 0} error messages seen in composition tests, each traced to the exact function that throws it.`,
    gh: null, ext: `${STARS}modular/decays.json` }),
  foundation: add({ id: 'ch-foundation', label: 'What everything leans on', type: 'chapter', rag: 'green',
    reason: 'The most-used functions in globalgrid2050 architecture development; a change here is felt everywhere.', gh: null, ext: `${STARS}modular/dependencies.json` }),
};
for (const id of Object.values(CH)) wire('universe', id, 'contains');

// ---------- 3. purposes (categories) ----------
const catIds = new Map();
for (const c of categories) {
  if (c.id === 'other') continue;
  const members = blocks.filter((b) => b.category === c.id && b.kind !== 'auto');
  if (!members.length) continue;
  const id = add({
    id: `cat-${c.id}`, label: c.title, type: 'purpose', rag: members.some((b) => b.state === 'UNSETTLED') ? 'amber' : 'green',
    reason: `${c.blurb || c.title}. ${plural(members.length, 'block')} serve this purpose.`,
    gh: null, ext: `${STARS}table.html?category=${encodeURIComponent(c.id)}`,
  });
  catIds.set(c.id, id);
  wire(CH.purpose, id, 'contains');
}

// ---------- 4. blocks (the named parts) ----------
const blockId = (b) => `block-${b.number}`;
const blockGh = (b) => {
  const f = b.files?.[0];
  if (!f) return null;
  if (typeof f === 'string') return f.startsWith('http') ? f : null;
  return f.gh || (f.repo && f.path ? `https://github.com/${f.repo}/blob/main/${f.path}` : null);
};
const namedBlocks = blocks.filter((b) => b.kind !== 'auto');
for (const b of namedBlocks) {
  const rag = b.state === 'UNSETTLED' ? 'amber' : b.state === 'SETTLED' ? 'green' : 'amber';
  const what = b.description || b.title;
  const rel = [];
  if (b.functions) rel.push(plural(b.functions, 'function'));
  if (b.depends_on?.length) rel.push(`depends on ${b.depends_on.length}`);
  if (b.used_by?.length) rel.push(`used by ${b.used_by.length}`);
  add({
    id: blockId(b), label: `${b.number} ${b.symbol} · ${b.title}`, type: b.kind || 'block', rag,
    reason: `${esc(what).replace(/\.?$/, '.')}${rel.length ? `<br><small>${rel.join(' · ')}</small>` : ''}`,
    gh: blockGh(b), ext: `${STARS}table.html?block=${b.number}`,
  });
}
for (const b of namedBlocks) {
  const cat = catIds.get(b.category);
  if (cat) wire(cat, blockId(b), 'contains');
  for (const d of b.depends_on || []) { const t = findBlock(d); if (t && ids.has(blockId(t))) wire(blockId(b), blockId(t), 'depends-on'); }
  if (b.state === 'UNSETTLED') wire(CH.decision, blockId(b), 'concerns');
}

// ---------- 5. canonical homes and their copies (illusion) ----------
// Group engine-join by canonical label (an engine file). One node per home, one node per copy (capped).
const homes = new Map(); // label -> { gh, functions:Set, fragments:[] }
for (const [fam, rec] of Object.entries(engineJoin.families || {})) {
  const joins = rec.joins || [];
  const canon = joins.filter((j) => j.type === 'canonical');
  const frags = joins.filter((j) => j.type === 'fragment');
  for (const c of canon) {
    const h = homes.get(c.label) || { gh: c.gh, functions: new Set(), fragments: [] };
    h.functions.add(rec.name);
    for (const f of frags) h.fragments.push({ ...f, fn: rec.name, family: fam });
    homes.set(c.label, h);
  }
}
const homeList = [...homes.entries()].sort((a, b) => b[1].fragments.length - a[1].fragments.length);
const homeIds = new Map();
for (const [label, h] of homeList) {
  const id = add({
    id: `home-${label.replace(/[^a-z0-9]+/gi, '-')}`, label, type: 'canonical', rag: h.fragments.length ? 'amber' : 'green',
    reason: `The one true home of ${[...h.functions].slice(0, 4).map(esc).join(', ')}${h.functions.size > 4 ? ` and ${h.functions.size - 4} more` : ''}.`
      + (h.fragments.length ? `<br><small>${`${h.fragments.length} ${h.fragments.length === 1 ? 'copy' : 'copies'}`} elsewhere should import from here.</small>` : ''),
    gh: h.gh || null, ext: `${STARS}modular/engine-join.json`,
  });
  homeIds.set(label, id);
  wire(CH.canonical, id, 'contains');
}
// Copies: budget what remains so the whole graph stays under MAX_NODES with room for the rest.
const RESERVE = 20 + 12 + 25; // hubs + decays + slack
let copyBudget = MAX_NODES - nodes.length - RESERVE;
const copySeen = new Set();
for (const [label, h] of homeList) {
  for (const f of h.fragments) {
    if (copyBudget <= 0) break;
    const key = f.label;
    if (copySeen.has(key)) { wire(`copy-${key.replace(/[^a-z0-9]+/gi, '-')}`, homeIds.get(label), 'should-import'); continue; }
    copySeen.add(key);
    const id = add({
      id: `copy-${key.replace(/[^a-z0-9]+/gi, '-')}`, label: key, type: 'copy', rag: 'red',
      reason: `A copy of ${esc(f.fn)} that lives apart from its home; it reads as separate code but is the same function written again.`
        + `<br><small>${esc(f.relation || 'copy')} · family ${f.family}</small>`,
      gh: f.gh || null, ext: `${STARS}code.html?family=${f.family}`,
    });
    copyBudget--;
    wire(id, homeIds.get(label), 'should-import');
    wire(CH.illusion, id, 'contains');
  }
}
const copiesShown = copySeen.size;

// ---------- 6. proven together (reactions as edges between blocks) ----------
let seen = 0, unstable = 0, mixed = 0;
const appsBySymbol = new Map();
for (const app of reactions.apps || []) for (const s of app.blocks || []) appsBySymbol.set(s, (appsBySymbol.get(s) || 0) + 1);
for (const r of reactions.reactions || []) {
  const a = findBlock(r.a), b = findBlock(r.b);
  if (!a || !b || !ids.has(blockId(a)) || !ids.has(blockId(b)) || r.verdict === 'untested') continue;
  const type = r.verdict === 'proven' ? 'proven' : r.verdict === 'unstable' ? 'unstable' : r.verdict === 'fails' ? 'fails' : r.verdict === 'mixed evidence' ? 'mixed-evidence' : 'seen-together';
  if (type === 'unstable' || type === 'fails') unstable++; else if (type === 'mixed-evidence') mixed++; else seen++;
  wire(blockId(a), blockId(b), type);
}
// Blocks that appear in no shipped app are untested by use.
for (const b of namedBlocks) {
  if (b.kind === 'constant') continue;
  if ((appsBySymbol.get(b.symbol) || 0) > 0) wire(CH.proof, blockId(b), 'contains');
}

// ---------- 7. what breaks (decays → throwing functions → blocks) ----------
const familyToBlock = new Map();
for (const b of blocks) for (const f of b.inside || []) familyToBlock.set(String(f.family), b);
const decayList = [...(decays.decays || [])].sort((a, b) => (b.red_stars || 0) - (a.red_stars || 0)).slice(0, 12);
decayList.forEach((d, i) => {
  const throwers = (d.families || []).slice(0, 3);
  const first = throwers[0] ? family(throwers[0].family) : null;
  const id = add({
    id: `decay-${i}`, label: d.needle || d.message, type: 'fault', rag: 'red',
    reason: `An error seen ${(d.red_stars || 0).toLocaleString()} times in composition tests; ${plural((d.families || []).length, 'function')} can throw it.`
      + `<br><small>${esc(d.message)}</small>`,
    gh: familyGh(first), ext: throwers[0] ? `${STARS}code.html?family=${throwers[0].family}` : `${STARS}modular/decays.json`,
  });
  wire(CH.fault, id, 'contains');
  const hit = new Set();
  for (const t of d.families || []) { const b = familyToBlock.get(String(t.family)); if (b && ids.has(blockId(b))) hit.add(blockId(b)); }
  for (const bid of hit) wire(id, bid, 'thrown-by');
});

// ---------- 8. foundations (hubs) ----------
const hubs = (deps.hubs || []).slice(0, 20);
for (const h of hubs) {
  const rec = family(h.family);
  const id = add({
    id: `hub-${h.family}`, label: `${h.name} · family ${h.family}`, type: 'foundation', rag: 'green',
    reason: `A function ${plural(h.used_by, 'other function')} rely on; it is a foundation, so a change here reaches all of them.`
      + (rec?.repos?.length ? `<br><small>in ${plural(rec.repos.length, 'repository')}, ${plural(rec.places?.length || 0, 'place')}</small>` : ''),
    gh: familyGh(rec), ext: `${STARS}code.html?family=${h.family}`,
  });
  wire(CH.foundation, id, 'contains');
  const b = familyToBlock.get(String(h.family));
  if (b && ids.has(blockId(b))) wire(blockId(b), id, 'contains');
}

// ---------- write ----------
const edgeTypes = {};
for (const e of edges) edgeTypes[e.type] = (edgeTypes[e.type] || 0) + 1;
const graph = {
  id: 'sense',
  title: 'Sense of the code universe',
  generated_utc: new Date().toISOString(),
  note: 'Order is the narrative: whole, chapters, purposes, blocks, canonical homes, copies, faults, foundations. Edge types are the shared vocabulary (relationships/VOCABULARY.md): contains, depends-on, canonical, should-import, concerns, proven, seen-together, mixed-evidence, unstable, fails, thrown-by.',
  source: { blocks: 'blocks/blocks.json', reactions: 'blocks/reactions.json', dependencies: 'modular/dependencies.json', decays: 'modular/decays.json', engine_join: 'modular/engine-join.json' },
  nodes, edges,
};
mkdirSync(join(ROOT, 'sense'), { recursive: true });
const out = JSON.stringify(graph);
writeFileSync(join(ROOT, 'sense/graph.json'), out);

const md = `# Sense of the code universe

Generated ${graph.generated_utc}. ${nodes.length} nodes, ${edges.length} edges, ${(out.length / 1024).toFixed(1)} KB.

This graph is not a list of files. It is globalgrid2050 architecture development's code read in an order that makes sense, so the FOCUS list on the
Spider dashboard reads as a narrative from the whole to the parts:

1. **The code universe** — ${familyCount.toLocaleString()} distinct functions, ${blocks.length} numbered blocks.
2. **What the code is for** — ${catIds.size} purposes, each containing the blocks that serve it.
3. **The blocks** — ${namedBlocks.length} named blocks (constants, engines, cartridges, layers, apps, tools), wired by *depends-on*
   so a reader can walk from a purpose to a part to what that part needs.
4. **What is canonical** — ${homeList.length} homes declared by the engine graph, holding ${canonicalCount} canonical functions.
5. **What is illusion** — ${fragmentCount} copies of those functions exist elsewhere (${copiesShown} shown here); each is wired
   *should-import* to its home. They look like separate code; they are the same function written twice.
6. **What is a decision, not a fact** — ${unsettled.length} values in use in more than one form. No computation settles them.
7. **What is proven together** — ${seen} block pairs with passed tests or app co-occurrence, ${mixed} pairs with mixed test evidence and ${unstable} unstable pairs, drawn as edges
   between the blocks. A block not wired from this chapter has never shipped in an app; *proven* wires are composition tests that passed, *seen-together* wires are use without a test.
8. **What breaks** — the ${decayList.length} most frequent composition-test errors, each wired to the block whose function throws it.
9. **What everything leans on** — the ${hubs.length} most-used functions in globalgrid2050 architecture development.

## Reading the colours

- green: settled, canonical, or a foundation.
- amber: open decision, or a home that still has copies.
- red: a copy that should import its home, or an error that is actually thrown.

## Edge types

${Object.entries(edgeTypes).map(([t, n]) => `- \`${t}\`: ${n}`).join('\n')}

## Sources

blocks/blocks.json, blocks/reactions.json, modular/dependencies.json, modular/decays.json, modular/engine-join.json, code/f/*.json
(all published at ${STARS}).
`;
writeFileSync(join(ROOT, 'sense/SENSE.md'), md);
console.log(`sense/graph.json: ${nodes.length} nodes, ${edges.length} edges, ${(out.length / 1024).toFixed(1)} KB`);
console.log(`edge types: ${JSON.stringify(edgeTypes)}`);
