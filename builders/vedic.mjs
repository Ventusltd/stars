// THE CLASSIFICATION STAR. Every element and every function family is sorted into one of five classes by
// what it does: Structure (shells, manifests, contracts, registries), Movement (links, events, routes),
// Computation (engines, calculations), Flow (streams, feeds, fetches) and Data (layers, files, records).
// Then two checks: what is never used and could be removed without loss; and whether every recorded test
// loaded the map's parts in the declared order. No model.
//
//   node vedic.mjs  → <sky>/vedic/{classes.json, graph.json}, CLASSIFICATION.md   (folder name kept for continuity)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { nodeLinks } from './node-links.mjs';
const SKY = process.env.SKY_DIR || 'C:/Users/vikra/Documents/GitHub/star-maker';
const OUT = path.join(SKY, 'vedic'); await mkdir(OUT, { recursive: true });
const table = JSON.parse(await readFile(path.join(SKY, 'elements', 'table.json'), 'utf8')).elements;
const atoms = JSON.parse(await readFile(path.join(SKY, 'electron', 'atoms.json'), 'utf8'));
const summary = JSON.parse(await readFile(path.join(SKY, 'soul', 'summary.json'), 'utf8'));
const CLASSES = [
  ['Structure',   /shell|manifest|contract|registry|schema|composition|current|loader|kernel/i, 'what holds everything in place: shells, manifests, contracts, registries'],
  ['Movement',    /deeplink|deep-link|link|event|dispatch|message|emit|route|flyto|arrival|search|gazetteer/i, 'what moves between parts: links, events, routes, arrivals'],
  ['Computation', /engine|calc|compute|distance|fault|rating|power|flow|topology|estimate|demand|capacity|economics|drop|factor|envelope|geodesy|haversine|area|shape/i, 'what transforms: engines, calculations, the maths'],
  ['Flow',        /stream|parquet|bridge|fetch|duckdb|feed|pipeline|flow|sync|crawl|survey/i, 'data on the move: streams, feeds, fetches, crawls'],
  ['Data',        /layer|geojson|data|substation|grid_|railway|airport|datacentre|plant|offtaker|csv|json|file|store/i, 'data at rest: layers, files, substations, circuits'],
];
const classOf = s => (CLASSES.find(([, rx]) => rx.test(s)) || ['Data'])[0];
const forms = [...table.map(e => ({ kind: 'element', name: e.symbol + ' ' + e.name, cls: classOf(e.name + ' ' + e.family), state: e.state })),
               ...atoms.top.map(a => ({ kind: 'function', name: `#${a.number} ${a.name}`, cls: classOf(a.name), class: a.class, spin: a.spin }))];
const counts = Object.fromEntries(CLASSES.map(([c]) => [c, forms.filter(f => f.cls === c).length]));
// Never used: not stated, not called, not tested.
const unused = atoms.top.filter(a => a.class === 'inert-unused' || (a.spin === 'unpaired' && a.valence === 0 && !a.purpose)).slice(0, 60);
// Declared order: the loaded order must follow the live order.
let kept = 0, broke = 0; const live = ['streaming-parquet-bridge', 'uk-gazetteer-flyto', 'substation-intelligence', 'sld-sandbox'];
try { const { readdirSync } = await import('node:fs'); for (const f of readdirSync(path.join(SKY, 'stars')).slice(0, 4000)) { const s = JSON.parse(await readFile(path.join(SKY, 'stars', f), 'utf8')); const idx = (s.loaded || []).map(id => live.indexOf(id)); (idx.every((v, i) => i === 0 || v > idx[i - 1]) ? kept++ : broke++); } } catch {}
await writeFile(path.join(OUT, 'classes.json'), JSON.stringify({ generated_utc: new Date().toISOString(), counts, forms: forms.slice(0, 800), unused, declared_order: { kept, broke } }, null, 2));
const nodes = CLASSES.map(([c, , meaning]) => ({ label: c, type: 'class', rag: 'green', reason: `${meaning} · ${counts[c]} forms` }));
const edges = [];
for (const f of forms.slice(0, 300)) { nodes.push({ label: f.name, type: f.kind, rag: f.state === 'UNSETTLED' || f.class === 'inert-unused' ? 'amber' : 'green', reason: `${f.kind} · ${f.cls}` }); edges.push({ from: f.cls, to: f.name, kind: 'IS_MADE_OF' }); }
for (const n of nodes) Object.assign(n, nodeLinks(n, { report: 'CLASSIFICATION', symbols: new Set(table.map(e => e.symbol)) }));
await writeFile(path.join(OUT, 'graph.json'), JSON.stringify({ schema: 'classification-graph.v1', label: 'The Classification star', generated_utc: new Date().toISOString(), note: 'Five classes and the forms in each; unused forms and the declared-order check are in the report.', focus_default: 'Computation', nodes, edges }, null, 2));
const md = `# The Classification star

Every version belongs to its family: ${summary.souls.toLocaleString()} function families behind ${summary.incarnations.toLocaleString()} versions. Below, the forms sorted into five classes, what is never used, and whether the declared order held. Updated ${new Date().toISOString()}. No model.

## Five classes: what does each form do?
| class | meaning here | forms |
|---|---|---|
${CLASSES.map(([c, , meaning]) => `| **${c}** | ${meaning} | ${counts[c]} |`).join('\n')}

## Never used: not stated, not called, not tested; could be removed without loss
${unused.slice(0, 40).map(a => `- **#${a.number} ${a.name}** · ${a.lines} lines · home ${a.homes.join('/')} · ${a.class}`).join('\n') || '- nothing: everything is held by something'}

## Declared order: did it hold?
Of ${kept + broke} tests read, **${kept}** loaded the map's parts in the declared order and **${broke}** did not.${broke ? ' A test that broke the order is a finding.' : ' The loader keeps the order; the faults are in the parts, not the order.'}

## For the Spider
\`vedic/graph.json\` — ${nodes.length} nodes, ${edges.length} IS_MADE_OF edges: open a class to see the forms in it.
`;
await writeFile(path.join(SKY, 'CLASSIFICATION.md'), md);
console.log(`classification: ${Object.entries(counts).map(([c, n]) => `${c} ${n}`).join(' · ')} · unused ${unused.length} · order ${kept}/${kept + broke}`);
