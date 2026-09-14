#!/usr/bin/env node
// decisions.mjs — the Decisions map for the Spider dashboard.
//
// Reads every decision record (decisions/d*.json, see decisions/SCHEMA.md) and writes decisions/graph.json in the
// dashboard's shape: nodes {id, label, type, rag, reason, gh, ext}, edges {from, to, type}. Each record is one card
// (open = amber, decided = green, superseded = grey) wired to the key it concerns, using the same ids the other
// graphs use (block:Ss, family:511, block:Ek), so a decision sits on the same map as the fact it is about.
// Reads blocks/blocks.json when present for the keys' titles; runs without it.
//
// Usage: node modular-star/decisions.mjs --out .      (node 24, no dependencies)
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const ROOT = outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : '.';
const STARS = 'https://ventusltd.github.io/stars/';
const REPO = 'https://github.com/Ventusltd/stars/blob/main/';
const RAG = { open: 'amber', decided: 'green', superseded: 'grey' };

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));

// ---------- load ----------
const dir = join(ROOT, 'decisions');
const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^d\d{3,}\.json$/.test(f)).sort() : [];
const records = files.map((f) => ({ ...readJson(join(dir, f)), _file: f }));
const blocks = existsSync(join(ROOT, 'blocks/blocks.json')) ? readJson(join(ROOT, 'blocks/blocks.json')).blocks || [] : [];
const bySymbol = new Map(blocks.map((b) => [b.symbol, b]));

// ---------- keys ----------
// A subject key is one map id or a pair joined by '+'. Returns the individual map ids.
const splitKey = (key) => String(key || '').split('+').map((k) => k.trim()).filter(Boolean);
function keyNode(id) {
  const [kind, ref] = id.split(':');
  if (kind === 'block') {
    const b = bySymbol.get(ref);
    return {
      id, label: b ? `${b.symbol} · ${b.title}` : `${ref} · block`, type: b?.kind || 'block',
      rag: b?.state === 'UNSETTLED' ? 'amber' : 'green',
      reason: b ? esc(b.description) : 'A block of the periodic table.',
      gh: b?.files?.[0] ? `https://github.com/${b.files[0].repo}/blob/${b.files[0].commit || 'main'}/${b.files[0].path}` : null,
      ext: `${STARS}table.html?block=${encodeURIComponent(ref)}`,
    };
  }
  if (kind === 'family') {
    return { id, label: `family ${ref}`, type: 'family', rag: 'green', reason: `Function family ${ref}: every copy of one function, under its permanent number.`,
      gh: null, ext: `${STARS}code.html?family=${encodeURIComponent(ref)}` };
  }
  return { id, label: id, type: 'key', rag: 'grey', reason: 'A key named by a decision record.', gh: null, ext: `${STARS}table.html` };
}

// ---------- graph ----------
const nodes = [], edges = [], ids = new Set();
function add(node) { if (!ids.has(node.id)) { ids.add(node.id); nodes.push(node); } return node.id; }
function wire(from, to, type) { if (ids.has(from) && ids.has(to) && from !== to) edges.push({ from, to, type }); }

const count = (s) => records.filter((r) => r.status === s).length;
add({
  id: 'decisions', label: 'Decisions', type: 'whole', rag: count('open') ? 'amber' : 'green',
  reason: `${records.length} decision records: ${count('open')} open, ${count('decided')} decided, ${count('superseded')} superseded. `
    + 'A decided record is permission; an open record is a question. Each record is wired to the block, constant or family it concerns.',
  gh: REPO + 'decisions/README.md', ext: 'https://github.com/Ventusltd/stars/issues/new?template=decision.yml',
});

// Records first, in id order, so the FOCUS list reads like a register.
for (const r of records) {
  const status = RAG[r.status] ? r.status : 'open';
  const body = status === 'open'
    ? `<b>Question.</b> ${esc(r.question)}${r.rationale ? `<br>${esc(r.rationale)}` : ''}`
    : `<b>Question.</b> ${esc(r.question)}<br><b>Decision.</b> ${esc(r.decision)}${r.rationale ? `<br><b>Why.</b> ${esc(r.rationale)}` : ''}`;
  const may = r.consequences?.agents_may?.length ? `<br><small>Agents may: ${r.consequences.agents_may.map(esc).join(' ')}</small>` : '';
  const sup = r.supersedes ? `<br><small>Supersedes ${esc(r.supersedes)}.</small>` : '';
  const ev = (r.evidence || []).length ? `<br><small>Evidence: ${(r.evidence || []).slice(0, 4).map((e) => `<a href="${esc(e)}">${esc(e.replace(/^https?:\/\/(www\.)?/, '').slice(0, 60))}</a>`).join(' · ')}</small>` : '';
  add({
    id: `decision:${r.id}`, label: `${r.id} · ${r.subject?.key || '?'} · ${status}`, type: 'decision', rag: RAG[status],
    reason: `${body}${sup}${may}${ev}<br><small>${esc(r.date || '')} · ${esc(r.subject?.type || '')}</small>`,
    gh: REPO + 'decisions/' + r._file, ext: r.source?.url || `${STARS}decisions/${r._file}`,
  });
  wire('decisions', `decision:${r.id}`, 'contains');
}

// Then the keys, so the decisions join the other maps by id.
for (const r of records) {
  const keys = [...splitKey(r.subject?.key), ...(r.also || []).flatMap(splitKey)];
  for (const k of keys) { add(keyNode(k)); wire(`decision:${r.id}`, k, 'concerns'); }
}
for (const r of records) {
  if (r.supersedes) { add({ id: `decision:${r.supersedes}`, label: `${r.supersedes} · superseded`, type: 'decision', rag: 'grey', reason: 'Superseded record not found in decisions/.', gh: null, ext: null }); wire(`decision:${r.id}`, `decision:${r.supersedes}`, 'supersedes'); }
}

mkdirSync(dir, { recursive: true });
const out = { schema: 'decisions-graph.v1', label: 'Decisions', generated_utc: new Date().toISOString(), nodes, edges };
writeFileSync(join(dir, 'graph.json'), JSON.stringify(out));
console.log(`Decisions: ${records.length} records (${count('open')} open, ${count('decided')} decided, ${count('superseded')} superseded); graph ${nodes.length} nodes, ${edges.length} edges.`);
