// Check a Spider graph the way the dashboard's receiver reads it (ventus-grid-engine index.html,
// normaliseGenericGraph): nodes {id, label, type, rag, reason, gh, ext}; edges {from, to, type} or [from, to, type];
// ids resolve; rag in green|amber|red|blue|grey. The receiver drops what it cannot resolve without a word, so this
// script says it instead. Usage: node tools/check-graph.mjs <file-or-url> [--strict]
// Exits 1 on a structural fault (unparseable, no nodes, unlabelled node, duplicate id, dangling edge, bad rag);
// the size limit and the length limits are warnings unless --strict.
import { readFileSync } from 'node:fs';

const src = process.argv[2], strict = process.argv.includes('--strict');
if (!src) { console.log('Usage: node tools/check-graph.mjs <file-or-url> [--strict]'); process.exit(2); }
const RAG = new Set(['green', 'amber', 'red', 'blue', 'grey']);
const LIMIT = 600 * 1024, LABEL_MAX = 120, REASON_MAX = 4000;
const faults = [], warnings = [];

let bytes;
try { bytes = /^https?:/.test(src) ? Buffer.from(await (await fetch(src, { cache: 'no-store' })).arrayBuffer()) : readFileSync(src); }
catch (e) { console.log(`${src}: cannot read: ${e.message}`); process.exit(1); }
let raw;
try { raw = JSON.parse(bytes.toString('utf8').replace(/^﻿/, '')); } catch (e) { console.log(`${src}: not JSON: ${e.message}`); process.exit(1); }

const rawNodes = Array.isArray(raw.nodes) ? raw.nodes : Array.isArray(raw.features) ? raw.features.map(f => ({ id: f.id, ...(f.properties || {}) })) : null;
if (!rawNodes) faults.push('no nodes array (the receiver shows a grey placeholder card)');
const nodes = rawNodes || [];
if (rawNodes && !nodes.length) faults.push('nodes is empty (the receiver treats an empty graph as unreachable)');
const ids = new Map(), dupes = [];
let noId = 0, noGh = 0, noExt = 0, badRag = 0, longLabel = 0, longReason = 0, unlabelled = 0, scripts = 0, longestReason = 0;
nodes.forEach((n, i) => {
  const id = n.id !== undefined ? n.id : i;
  if (n.id === undefined) noId++;
  if (ids.has(id)) dupes.push(String(id)); else ids.set(id, i);
  const label = n.label || n.title || (n.id !== undefined ? String(n.id) : '');
  if (!label) unlabelled++;
  if (label.length > LABEL_MAX) longLabel++;
  const rag = n.rag || n.status || 'grey';
  if (!RAG.has(rag)) badRag++;
  const reason = String(n.reason || n.status_reason || n.path || '');
  longestReason = Math.max(longestReason, reason.length);
  if (reason.length > REASON_MAX) longReason++;
  if (/<script|javascript:/i.test(reason)) scripts++; // reason is rendered as HTML by the focused card
  if (!n.gh) noGh++;
  if (!n.ext) noExt++;
});
const rawEdges = Array.isArray(raw.edges) ? raw.edges : Array.isArray(raw.links) ? raw.links : [];
const types = new Map(), dangling = [];
let selfEdges = 0, arrayForm = 0, objectForm = 0;
for (const e of rawEdges) {
  let a, b, t;
  if (Array.isArray(e)) { arrayForm++; [a, b] = e; t = e[2] || 'repo'; }
  else { objectForm++; a = e.from !== undefined ? e.from : e.source; b = e.to !== undefined ? e.to : e.target; t = e.type || 'repo'; }
  // The receiver resolves a reference by id first, then treats it as an index if it is a number.
  const ra = ids.has(a) ? ids.get(a) : a, rb = ids.has(b) ? ids.get(b) : b;
  const ok = typeof ra === 'number' && ra >= 0 && ra < nodes.length && typeof rb === 'number' && rb >= 0 && rb < nodes.length;
  if (!ok) { if (dangling.length < 5) dangling.push(`${a} -> ${b}`); else dangling.push(''); continue; }
  if (ra === rb) selfEdges++;
  types.set(t, (types.get(t) || 0) + 1);
}
const danglingCount = dangling.length;

if (dupes.length) faults.push(`${dupes.length} duplicate id(s): ${[...new Set(dupes)].slice(0, 5).join(', ')} (edges would attach to the last node with that id)`);
if (danglingCount) faults.push(`${danglingCount} dangling edge(s) dropped by the receiver, e.g. ${dangling.filter(Boolean).slice(0, 3).join('; ')}`);
if (badRag) faults.push(`${badRag} node(s) with a rag outside green|amber|red|blue|grey`);
if (unlabelled) faults.push(`${unlabelled} node(s) with no label, title or id`);
if (noId) (raw.adapted_for ? warnings : faults).push(`${noId} node(s) without an id (the receiver uses the index; spider/register.py adapts such graphs)`);
if (scripts) faults.push(`${scripts} reason(s) contain a script tag or javascript: URL; reason is rendered as HTML`);
if (bytes.length > LIMIT) (strict ? faults : warnings).push(`${Math.round(bytes.length / 1024)} KB is over the 600 KB registry limit: spider/register.py will not register it`);
else if (bytes.length > LIMIT * 0.9) warnings.push(`${Math.round(bytes.length / 1024)} KB is ${Math.round(100 * bytes.length / LIMIT)}% of the 600 KB registry limit`);
if (longLabel) (strict ? faults : warnings).push(`${longLabel} label(s) over ${LABEL_MAX} characters`);
if (longReason) (strict ? faults : warnings).push(`${longReason} reason(s) over ${REASON_MAX} characters (longest ${longestReason})`);
if (selfEdges) warnings.push(`${selfEdges} self-edge(s)`);
if (noGh) warnings.push(`${noGh} node(s) without gh (no GitHub action on the card)`);
if (noExt) warnings.push(`${noExt} node(s) without ext (no External action on the card)`);

const nodeTypes = new Map(); for (const n of nodes) nodeTypes.set(n.type || 'unknown', (nodeTypes.get(n.type || 'unknown') || 0) + 1);
const ragCount = new Map(); for (const n of nodes) { const r = n.rag || 'grey'; ragCount.set(r, (ragCount.get(r) || 0) + 1); }
console.log(`${src}: ${raw.label || raw.schema || 'graph'} · ${Math.round(bytes.length / 1024)} KB · generated ${raw.generated_utc || 'undated'}`);
console.log(`  ${nodes.length} nodes (${[...nodeTypes].map(([t, c]) => `${c} ${t}`).join(', ')}); rag ${[...ragCount].map(([r, c]) => `${c} ${r}`).join(', ')}`);
console.log(`  ${rawEdges.length} edges (${objectForm} object form, ${arrayForm} index form): ${[...types].sort((a, b) => b[1] - a[1]).map(([t, c]) => `${c} ${t}`).join(', ') || 'none'}`);
console.log(`  FOCUS order, first 12: ${nodes.slice(0, 12).map((n, i) => `${i + 1}. ${String(n.label || n.title || n.id || '').slice(0, 48)}`).join(' · ')}`);
for (const w of warnings) console.log(`  warning: ${w}`);
for (const f of faults) console.log(`  FAULT: ${f}`);
console.log(faults.length ? `  ${faults.length} fault(s): the dashboard would not show this graph as written.` : '  Readable by the receiver.');
process.exitCode = faults.length ? 1 : 0; // not process.exit(): on Windows that races an open fetch socket and aborts with a libuv assertion
