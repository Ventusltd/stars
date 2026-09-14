// Chemistry of blocks: which combinations are known to work, from evidence rather than chance.
// Two sources: (1) the recorded composition tests (reports/chemistry/compounds.json): cartridges that were green
// together; (2) the code itself: blocks whose functions already live in the same app folder. Each pair gets an
// honest probability and an example app to open. Anything without evidence is "untested".
// Reads blocks/blocks.json and code/f/*.json. Writes blocks/reactions.json. Usage: node modular-star/reactions.mjs --out .
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { pairVerdict } from './pair-verdict.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('out', '.');
const now = new Date().toISOString();
const fold = p => p.replace(/(^|[^0-9])\d{8}(\d{4})?(?=[^0-9]|$)/g, '$1{stamp}');
const table = JSON.parse(readFileSync(path.join(OUT, 'blocks', 'blocks.json'), 'utf8'));
// Named blocks only: the auto-blocks (one per stray file) are "other tools" and would swamp the chemistry.
const famOf = JSON.parse(readFileSync(path.join(OUT, 'blocks', 'families.json'), 'utf8'));
const bySym = new Map(table.blocks.filter(b => b.kind !== 'auto').map(b => [b.symbol, b]));
const blockOfFamily = new Map();
for (const [sym, fams] of Object.entries(famOf)) if (bySym.has(sym)) for (const n of fams) blockOfFamily.set(n, sym);
const live = new Map(JSON.parse(readFileSync(new URL('./live-sites.json', import.meta.url), 'utf8').replace(/^﻿/, '')).sites.map(s => [s.repo, s.site]));

// ---- apps: every folder in which code lives, with the set of blocks found there
const apps = new Map();
for (const f of readdirSync(path.join(OUT, 'code', 'f'))) for (const r of Object.values(JSON.parse(readFileSync(path.join(OUT, 'code', 'f', f), 'utf8')))) {
  const sym = blockOfFamily.get(r.n); if (!sym) continue;
  for (const p of r.places) {
    const folder = p.repo.split('/')[1] + '/' + fold(path.posix.dirname(p.path));
    if (!apps.has(folder)) apps.set(folder, { folder, repo: p.repo, dir: path.posix.dirname(p.path), blocks: new Set(), stamp: '' });
    const a = apps.get(folder); a.blocks.add(sym);
    const st = (p.path.match(/\d{12}|\d{8}/g) || ['']).sort().pop(); if (st > a.stamp) { a.stamp = st; a.dir = path.posix.dirname(p.path); }
  }
}
// A folder's title walks up past generic segments (scripts, assets, plugins…) to the app it belongs to.
const GENERIC = /^(scripts?|assets?|plugins?|data|tools?|src|lib|js|cartridges|modules|parts|source|releases?|sandbox|testcode|atlas|pipeline|dist|build|\.|\d{8,12}|\{stamp\})$/i;
const titleOf = a => { const segs = a.dir.split('/').filter(s => s && !GENERIC.test(s)); const seg = segs.pop() || a.repo.split('/')[1]; return seg.replace(/\{stamp\}-?/g, '').replace(/[-_]+/g, ' ').replace(/^./, c => c.toUpperCase()); };
const appList = [...apps.values()].filter(a => a.blocks.size >= 2).map(a => ({
  folder: a.folder, title: titleOf(a), repo: a.repo, blocks: [...a.blocks].sort(),
  live: live.has(a.repo) ? live.get(a.repo) + (a.dir === '.' ? '' : a.dir + '/') : null,
  gh: `https://github.com/${a.repo}/tree/main/${a.dir === '.' ? '' : a.dir}` })).sort((x, y) => y.blocks.length - x.blocks.length);

// ---- tests: the composition tests, by cartridge symbol pair
const tests = new Map();
{
  const compounds = JSON.parse(readFileSync(path.join(OUT, 'reports', 'chemistry', 'compounds.json'), 'utf8')).compounds;
  if (!Array.isArray(compounds) || !compounds.length) throw new Error('Composition evidence is missing or empty');
  for (const c of compounds) {
    pairVerdict({ green: c.green, red: c.red, total: c.stars });
    const syms = [...new Set((c.formula || '').split('·').map(s => s.replace(/\(.*\)$/, '').trim()).filter(s => bySym.has(s)))].sort();
    for (let i = 0; i < syms.length; i++) for (let j = i + 1; j < syms.length; j++) {
      const k = syms[i] + '|' + syms[j]; if (!tests.has(k)) tests.set(k, { green: 0, red: 0, total: 0, decays: new Map() });
      const t = tests.get(k); t.green += c.green || 0; t.red += c.red || 0; t.total += c.stars || 0;
      for (const d of c.decays || []) t.decays.set(d.text, (t.decays.get(d.text) || 0) + (d.n || 1));
    }
  }
}

// ---- pairs: evidence and probability
const pairs = new Map();
for (const a of appList) for (let i = 0; i < a.blocks.length; i++) for (let j = i + 1; j < a.blocks.length; j++) {
  const k = a.blocks[i] + '|' + a.blocks[j]; if (!pairs.has(k)) pairs.set(k, { a: a.blocks[i], b: a.blocks[j], together: 0, examples: [] });
  const p = pairs.get(k); p.together++; if (p.examples.length < 3) p.examples.push({ title: a.title, live: a.live, gh: a.gh });
}
for (const k of tests.keys()) if (!pairs.has(k)) { const [a, b] = k.split('|'); pairs.set(k, { a, b, together: 0, examples: [] }); }
const reactions = [...pairs.values()].map(p => {
  const t = tests.get(p.a + '|' + p.b);
  let probability, verdict, basis;
  if (t && t.total) { probability = Math.round(100 * (t.green + 1) / (t.total + 2)) / 100; verdict = pairVerdict(t); basis = `${t.green} green, ${t.red} red of ${t.total} composition tests`; }
  else if (p.together) { probability = Math.min(0.9, 0.5 + 0.1 * p.together); verdict = 'seen together'; basis = `already used together in ${p.together} app folder${p.together === 1 ? '' : 's'}, never composition-tested`; }
  else { probability = 0.25; verdict = 'untested'; basis = 'no evidence either way'; }
  const decay = t ? [...t.decays].sort((x, y) => y[1] - x[1])[0] : null;
  return { a: p.a, b: p.b, probability, verdict, basis, together: p.together, examples: p.examples, tests: t ? { green: t.green, red: t.red, total: t.total } : null, decay: decay ? decay[0] : null };
}).sort((x, y) => y.probability - x.probability || y.together - x.together);

writeFileSync(path.join(OUT, 'blocks', 'reactions.json'), JSON.stringify({ generated_utc: now,
  note: 'Probability is evidence, not chance: composition tests where they exist, otherwise how often two blocks already live in the same app folder. Untested means untested.',
  apps: appList.slice(0, 400), reactions }, null, 1));
console.log(`Reactions: ${reactions.length} pairs (${reactions.filter(r => r.verdict === 'proven').length} proven, ${reactions.filter(r => r.verdict === 'seen together').length} seen together); ${appList.length} app folders with two or more blocks.`);
