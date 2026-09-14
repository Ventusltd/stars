#!/usr/bin/env node
// relate.mjs — the relationship line on every focused card.
//
// The Spider dashboard shows a card's `reason` only when the card is focused, and draws every wire the same.
// This step reads any Spider graph, counts the wires at each node by the shared vocabulary
// (relationships/VOCABULARY.md) and writes one compact line into the reason, for example
//   → depends on 3 · ← used by 12 · ⚠ 2 copies should import this · ? 1 decision
// The line is generated from the graph itself, wrapped in <!--relate--> … <!--/relate--> so a second run replaces
// it instead of repeating it. Decisions that concern a node are counted from the Decisions map (decisions/graph.json)
// by shared id (block:Ek, family:511), so a "? decision" appears on the block or family the decision is about.
// Edge types outside the vocabulary are reported, never silently accepted.
//
// Usage: node modular-star/relate.mjs [--out .] [--decisions decisions/graph.json] <graph.json> [<graph.json> …]
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const ROOT = opt('out', '.');
const DECISIONS = opt('decisions', 'decisions/graph.json');
const files = args.filter((a, i) => !a.startsWith('--') && !['--out', '--decisions'].includes(args[i - 1]));
if (!files.length) { console.log('Usage: node modular-star/relate.mjs [--out .] [--decisions decisions/graph.json] <graph.json> …'); process.exit(2); }

// type → [class, phrase when the focused node is the source, phrase when it is the target].
// {n} is the count; {one|many} chooses a word by count. Kept in step with relationships/VOCABULARY.md.
export const VOCABULARY = {
  'contains':      ['containment', 'contains {n}', 'part of {n}'],
  'found-in':      ['containment', 'found in {n} {repository|repositories}', 'holds {n}'],
  'depends-on':    ['dependency', 'depends on {n}', 'used by {n}'],
  'canonical':     ['evidence', 'canonical home known', 'canonical home of {n}'],
  'implements':    ['evidence', 'implements {n}', 'implemented by {n}'],
  'proven':        ['evidence', 'proven with {n}', 'proven with {n}'],
  'seen-together': ['evidence', 'seen with {n}', 'seen with {n}'],
  'mixed-evidence': ['question', 'mixed test evidence with {n}', 'mixed test evidence with {n}'],
  'produces':      ['evidence', 'produces {n}', 'produced by {n}'],
  'run-of':        ['evidence', 'run of {n}', '{n} {run|runs}'],
  'checked-by':    ['evidence', 'checked by {n}', 'checks {n}'],
  'triggers':      ['evidence', 'triggers {n}', 'triggered by {n}'],
  'should-import': ['debt', 'should import {n}', '{n} {copy|copies} should import this'],
  'supersedes':    ['debt', 'supersedes {n}', 'superseded by {n}'],
  'unstable':      ['warning', 'unstable with {n}', 'unstable with {n}'],
  'fails':         ['warning', 'fails with {n}', 'fails with {n}'],
  'thrown-by':     ['warning', 'thrown by {n}', 'throws {n} {fault|faults}'],
  'same-name':     ['warning', 'shares a name with {n}', 'shares a name with {n}'],
  'concerns':      ['question', 'concerns {n}', '{n} {decision|decisions}'],
};
const CLASS_ORDER = ['dependency', 'containment', 'evidence', 'debt', 'warning', 'question'];
const GLYPH = { dependency: ['→', '←'], containment: ['▸', '◂'], evidence: ['✓', '✓'], debt: ['⚠', '⚠'], warning: ['⚠', '⚠'], question: ['?', '?'] };
const phrase = (tpl, n) => tpl.replace('{n}', String(n)).replace(/\{([^|}]+)\|([^}]+)\}/g, (_, one, many) => (n === 1 ? one : many));

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8').replace(/^﻿/, ''));
// Edges as [fromId, toId, type], resolving index references the way the receiver does.
function edgesOf(graph) {
  const nodes = graph.nodes || [];
  const idOf = (r) => (typeof r === 'number' && nodes[r] ? (nodes[r].id ?? r) : r);
  return (graph.edges || graph.links || []).map((e) => Array.isArray(e)
    ? [idOf(e[0]), idOf(e[1]), e[2] || 'repo']
    : [idOf(e.from ?? e.source), idOf(e.to ?? e.target), e.type || 'repo']);
}

// Decisions by key: id → { total, open }.
const decisionsPath = resolve(ROOT, DECISIONS);
const decisionsFor = new Map();
if (existsSync(decisionsPath)) {
  const dg = readJson(decisionsPath);
  const rag = new Map((dg.nodes || []).map((n) => [n.id, n.rag]));
  for (const [from, to, type] of edgesOf(dg)) {
    if (type !== 'concerns') continue;
    const d = decisionsFor.get(to) || { total: 0, open: 0 };
    d.total++; if (rag.get(from) === 'amber') d.open++;
    decisionsFor.set(to, d);
  }
}

const MARK = /<!--relate-->[\s\S]*?<!--\/relate-->/g;
function withLine(reason, line) {
  const base = String(reason || '').replace(MARK, '');
  const piece = `<!--relate--><br><small>${line}</small><!--/relate-->`;
  const pre = base.indexOf('<pre'); // the numbered code lines stay last on the card
  return pre >= 0 ? base.slice(0, pre) + piece + base.slice(pre) : base + piece;
}

export function relate(graph, { decisions = decisionsFor, isDecisionsGraph = false } = {}) {
  const counts = new Map(); // id → Map(type|dir → n)
  const typeCounts = {};
  const bump = (id, key) => { if (!counts.has(id)) counts.set(id, new Map()); const m = counts.get(id); m.set(key, (m.get(key) || 0) + 1); };
  for (const [from, to, type] of edgesOf(graph)) {
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    bump(from, type + '|out'); bump(to, type + '|in');
  }
  let lines = 0;
  for (const node of graph.nodes || []) {
    const m = counts.get(node.id) || new Map();
    const parts = [];
    for (const [key, n] of m) {
      const [type, dir] = key.split('|');
      const v = VOCABULARY[type];
      if (!v) { parts.push({ cls: 'containment', order: 99, text: `${type.replace(/[-_]/g, ' ')} ${dir === 'out' ? '→' : '←'} ${n}` }); continue; }
      const [cls, outTpl, inTpl] = v;
      parts.push({ cls, order: CLASS_ORDER.indexOf(cls) * 2 + (dir === 'out' ? 0 : 1), text: `${GLYPH[cls][dir === 'out' ? 0 : 1]} ${phrase(dir === 'out' ? outTpl : inTpl, n)}` });
    }
    if (!isDecisionsGraph && decisions.has(node.id)) {
      const d = decisions.get(node.id);
      parts.push({ cls: 'question', order: 20, text: `? ${phrase('{n} {decision|decisions}', d.total)}${d.open && d.open !== d.total ? `, ${d.open} open` : d.open ? ' open' : ' decided'}` });
    }
    if (!parts.length) continue;
    parts.sort((a, b) => a.order - b.order);
    node.reason = withLine(node.reason, parts.map((p) => p.text).join(' · '));
    lines++;
  }
  const unknown = Object.entries(typeCounts).filter(([t]) => !VOCABULARY[t]);
  return { lines, typeCounts, unknown };
}

const here = import.meta.url === new URL(`file:///${process.argv[1].replace(/\\/g, '/')}`).href || process.argv[1]?.endsWith('relate.mjs');
if (here) {
  let bad = 0;
  for (const f of files) {
    const p = resolve(ROOT, f);
    if (!existsSync(p)) { console.log(`${f}: not present in this checkout, skipped`); continue; }
    const graph = readJson(p);
    const r = relate(graph, { isDecisionsGraph: resolve(p) === decisionsPath });
    writeFileSync(p, JSON.stringify(graph));
    const kb = (readFileSync(p).length / 1024).toFixed(0);
    console.log(`${f}: relationship line on ${r.lines} of ${(graph.nodes || []).length} cards · ${kb} KB · ${Object.entries(r.typeCounts).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${n} ${t}`).join(', ') || 'no edges'}`);
    if (r.unknown.length) { bad++; console.log(`  outside the vocabulary (relationships/VOCABULARY.md): ${r.unknown.map(([t, n]) => `${t} (${n})`).join(', ')}`); }
  }
  if (bad) console.log(`${bad} graph(s) use edge types outside the vocabulary; the line still shows them, in plain words.`);
}
