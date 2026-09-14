#!/usr/bin/env node
// why.mjs — one plain sentence on every red card, tracing the cause.
//
// For each red node in modular/graph.json and blocks/graph.json, walks the evidence this repository already holds
// (modular/decays.json, modular/engine-join.json, blocks/reactions.json, a block's needs in blocks/blocks.json) and
// writes the walk down as one sentence in the card's reason, wrapped in <!--why--> … <!--/why--> so a second run
// replaces it. Honest by rule: when the walk finds nothing, the sentence is "cause not yet traced".
// Also writes relationships/WHY.md, the same sentences as a list.
//
// Usage: node modular-star/why.mjs --out .      (node 24, no dependencies)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const outIdx = args.indexOf('--out');
const ROOT = outIdx >= 0 && args[outIdx + 1] ? args[outIdx + 1] : '.';
const STARS = 'https://ventusltd.github.io/stars/';
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), 'utf8').replace(/^﻿/, ''));
const maybe = (p) => (existsSync(join(ROOT, p)) ? readJson(p) : null);
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const plural = (n, w, ws = w + 's') => `${n} ${n === 1 ? w : ws}`;
const NOT_TRACED = 'cause not yet traced';

// ---------- evidence ----------
const decays = maybe('modular/decays.json')?.decays || [];
const engineJoin = maybe('modular/engine-join.json')?.families || {};
const reactions = maybe('blocks/reactions.json')?.reactions || [];
const blocks = maybe('blocks/blocks.json')?.blocks || [];
const familiesOf = maybe('blocks/families.json') || {};
const blockOfFamily = new Map();
for (const [sym, fams] of Object.entries(familiesOf)) for (const n of fams) blockOfFamily.set(String(n), sym);
const bySymbol = new Map(blocks.map((b) => [b.symbol, b]));
const blockName = (sym) => { const b = bySymbol.get(sym); return b ? `block ${b.symbol} · ${b.title}` : `block ${sym}`; };
const lineList = (lines) => lines.slice(0, 3).join(', ') + (lines.length > 3 ? ` and ${lines.length - 3} more` : '');

function whyDecay(needle) {
  const d = decays.find((x) => x.needle === needle || x.message === needle);
  if (!d) return NOT_TRACED;
  const first = d.families?.[0];
  const sym = first ? blockOfFamily.get(String(first.family)) : null;
  let s = `Red because ${d.red_stars.toLocaleString()} red composition tests throw "${d.needle}"`;
  s += d.lines?.length ? `, carried at ${d.lines.length === 1 ? 'numbered line' : `${d.lines.length} numbered lines`} ${lineList(d.lines)}` : ', not found in any numbered line';
  s += d.families?.length ? ` in ${plural(d.families.length, 'function')}` + (first ? ` (for example family ${first.family}, ${first.name}${sym ? `, ${blockName(sym)}` : ''})` : '') : ' and in no function this star has numbered';
  s += '.';
  const m = d.needle.match(/requires the (\S+) module/);
  if (m) s += ` The message names a module that was absent when the compound was assembled: ${m[1]}.`;
  return s;
}

function whyFamily(n) {
  const thrown = decays.filter((d) => (d.families || []).some((f) => String(f.family) === String(n)));
  if (thrown.length) { const d = thrown[0]; return `Red because this function carries the error "${d.needle}", thrown in ${d.red_stars.toLocaleString()} red composition tests${thrown.length > 1 ? `, and ${plural(thrown.length - 1, 'other error')}` : ''}.`; }
  const j = engineJoin[String(n)];
  const frag = j?.joins?.find((x) => x.type === 'fragment');
  const canon = j?.joins?.find((x) => x.type === 'canonical');
  if (frag) return `Red because this copy of ${j.name} is ${frag.relation || 'a fragment'} (${frag.label})${canon ? `; its canonical home is ${canon.label}` : ''}.`;
  return NOT_TRACED;
}

function whyBlock(sym) {
  const b = bySymbol.get(sym);
  const fails = reactions.filter((r) => (r.a === sym || r.b === sym) && r.verdict === 'fails');
  if (fails.length) { const r = fails[0]; const other = r.a === sym ? r.b : r.a; return `Red because composition tests with ${blockName(other)} fail (${r.basis})${r.decay ? `, the error being "${r.decay}"` : ''}${fails.length > 1 ? `; ${plural(fails.length - 1, 'other pair')} also fail` : ''}.`; }
  if (b?.needs?.length) return `Red because the block needs ${plural(b.needs.length, 'name')} it does not define (${b.needs.slice(0, 4).map((x) => x.meaning || x.name).join(', ')}${b.needs.length > 4 ? ', …' : ''}).`;
  if (b && !b.functions) return 'Red because no function of the numbered code was placed in this block.';
  return NOT_TRACED;
}

function why(node) {
  const id = String(node.id ?? '');
  if (node.type === 'decay' || id.startsWith('decay:')) return whyDecay(id.replace(/^decay:/, ''));
  if (id.startsWith('family:')) return whyFamily(id.slice(7));
  if (id.startsWith('block:')) return whyBlock(id.slice(6));
  return NOT_TRACED;
}

// ---------- write ----------
const MARK = /<!--why-->[\s\S]*?<!--\/why-->/g;
function withWhy(reason, sentence) {
  const base = String(reason || '').replace(MARK, '');
  const piece = `<!--why--><br><b>Why.</b> ${esc(sentence)}<!--/why-->`;
  const pre = base.indexOf('<pre');
  return pre >= 0 ? base.slice(0, pre) + piece + base.slice(pre) : base + piece;
}

const md = ['# Why, on every red card', '', `Generated ${new Date().toISOString()}. One sentence per red card, walked from the evidence this repository holds`,
  '(decays, the engine join, the chemistry, a block\'s needs) by `modular-star/why.mjs`. "Cause not yet traced" means the walk found nothing; it is never invented.', ''];
let total = 0, traced = 0;
for (const file of ['modular/graph.json', 'blocks/graph.json']) {
  const graph = maybe(file);
  if (!graph) { md.push(`## ${file}`, '', 'Not present in this checkout.', ''); continue; }
  const red = (graph.nodes || []).filter((n) => n.rag === 'red');
  md.push(`## ${graph.label || file} (\`${file}\`)`, '');
  if (!red.length) { md.push(`No red cards at ${graph.generated_utc || 'this run'}.`, ''); continue; }
  for (const n of red) {
    const s = why(n);
    total++; if (s !== NOT_TRACED) traced++;
    n.reason = withWhy(n.reason, s);
    md.push(`- **${n.label}** (\`${n.id}\`): ${s}`);
  }
  md.push('');
  writeFileSync(join(ROOT, file), JSON.stringify(graph));
}
md.push(`${total} red cards, ${traced} traced, ${total - traced} not yet traced. Cards: ${STARS}spider/graphs/`);
mkdirSync(join(ROOT, 'relationships'), { recursive: true });
writeFileSync(join(ROOT, 'relationships/WHY.md'), md.join('\n') + '\n');
console.log(`why: ${total} red cards, ${traced} traced, ${total - traced} not yet traced → relationships/WHY.md`);
