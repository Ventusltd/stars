// The structure of globalgrid2050 architecture development, top-down: Estate → repositories → categories → the named blocks → the engine's
// canonical modules, as a Spider graph whose enumeration reads like a table of contents.
// Reads blocks/blocks.json (blocks, categories, interdependencies), modular/source.json (which repositories were
// scanned, at which commit), modular-star/live-sites.json (public sites), spider/register.py (the graphs this
// repository publishes) and the engine graph at ventus-grid-engine (fetched; optional). No auto-blocks, no
// functions, so the graph stays well under 300 cards. Writes structure/graph.json and structure/STRUCTURE.md.
// Usage: node modular-star/structure.mjs --out .
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import path from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('out', '.');
const SITE = 'https://ventusltd.github.io/stars/';
const ENGINE_SITE = 'https://ventusltd.github.io/ventus-grid-engine/';
const GH = 'https://github.com/';
const now = new Date();
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mono = s => `<div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#9aa3b5;margin-top:4px;white-space:pre-wrap">${s}</div>`;
const kb = n => n >= 1024 ? Math.round(n / 1024) + ' KB' : n + ' B';
const utc = iso => iso ? new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : 'unknown';
const readJson = (f, d) => { try { return JSON.parse(readFileSync(path.join(OUT, f), 'utf8')); } catch { return d; } };
const getJson = async u => { try { const r = await fetch(u); return r.ok ? await r.json() : null; } catch { return null; } };

// ---- inputs
const table = readJson('blocks/blocks.json', { categories: [], blocks: [] });
const categories = table.categories || [];
const catIndex = new Map(categories.map((c, i) => [c.id, i]));
const catTitle = id => categories.find(c => c.id === id)?.title || id;
const named = (table.blocks || []).filter(b => b.kind !== 'auto').sort((a, b) => (catIndex.get(a.category) ?? 99) - (catIndex.get(b.category) ?? 99) || a.number - b.number);
const source = readJson('modular/source.json', { repositories: [] });
const scanned = new Map((source.repositories || []).map(r => [r.repo, r]));
const sites = new Map(((() => { try { return JSON.parse(readFileSync(new URL('./live-sites.json', import.meta.url), 'utf8')); } catch { return { sites: [] }; } })().sites || []).map(s => [s.repo, s.site]));
const registerText = (() => { try { return readFileSync(path.join(OUT, 'spider', 'register.py'), 'utf8'); } catch { return ''; } })();
const published = [...registerText.matchAll(/\(\s*"([\w-]+)",\s*"([^"]+)",\s*"([^"]+)"/g)].map(m => ({ id: m[1], title: m[2], src: m[3] }));
const engineGraph = await getJson(ENGINE_SITE + 'genome/engine-graph.json');
const engineModules = (engineGraph?.nodes || []).filter(n => n.type === 'canonical');

// ---- repositories: those blocks live in, plus the ones named in the registry (this repository and the source of the tests)
const ENGINE_REPO = 'Ventusltd/ventus-grid-engine';
const blocksIn = new Map();
for (const b of named) for (const r of b.repos || []) { if (!blocksIn.has(r)) blocksIn.set(r, []); blocksIn.get(r).push(b.symbol); }
const extra = ['Ventusltd/stars', ...[...registerText.matchAll(/\b(star-maker|code-generator)\b/g)].map(m => 'Ventusltd/' + m[1])];
const repoNames = [...new Set([ENGINE_REPO, ...blocksIn.keys(), ...extra])].filter(r => r.startsWith('Ventusltd/'));
repoNames.sort((a, b) => (a === ENGINE_REPO ? -1 : b === ENGINE_REPO ? 1 : 0) || (blocksIn.get(b)?.length || 0) - (blocksIn.get(a)?.length || 0) || a.localeCompare(b));
const repoRole = r => r === ENGINE_REPO ? 'The engine: the canonical modules every other copy is measured against, and the Spider dashboard.' :
  r === 'Ventusltd/stars' ? `This repository: the numbered code database, the periodic table and the reports. Publishes ${published.length} graphs for the dashboard: ${published.map(p => p.title).join(', ')}.` :
  r === 'Ventusltd/star-maker' ? 'The recorded composition tests (the stars) that the reports read.' :
  r === 'Ventusltd/code-generator' ? 'Assembles apps from blocks of the periodic table.' : 'A public repository of globalgrid2050 architecture development.';

const nodes = [], edges = [];
const edge = (from, to, type) => edges.push({ from, to, type });

// ---- 1. globalgrid2050 architecture development
nodes.push({ id: 'estate', label: 'globalgrid2050 architecture development', type: 'estate', rag: 'green',
  reason: `Every public repository, the named blocks of the periodic table found across them, and the engine's canonical modules. Read top-down: estate, repositories, categories, blocks, modules.` +
    mono(esc(`${repoNames.length} repositories · ${categories.length} categories · ${named.length} named blocks · ${engineModules.length} engine modules · ${source.repositories?.length || 0} repositories scanned ${utc(source.generated_utc)}`)),
  gh: `${GH}Ventusltd`, ext: `${SITE}table.html` });

// ---- 2. repositories
for (const r of repoNames) {
  const short = r.split('/')[1], sc = scanned.get(r), syms = blocksIn.get(r) || [];
  const line = [syms.length ? `${syms.length} blocks: ${syms.join(', ')}` : 'no named block found here', sc ? `${sc.code_files} code files scanned at ${String(sc.commit).slice(0, 7)}` : 'not in the last scan', sites.get(r) ? `site ${sites.get(r)}` : null].filter(Boolean).join('\n');
  nodes.push({ id: `repo:${r}`, label: short, type: 'repo', rag: syms.length || sc?.code_files ? 'green' : 'grey', reason: esc(repoRole(r)) + mono(esc(line)), gh: GH + r, ext: sites.get(r) || GH + r });
  edge('estate', `repo:${r}`, 'contains');
}

// ---- 3. categories, in table order
for (const c of categories) {
  const inCat = named.filter(b => b.category === c.id);
  if (!inCat.length) continue;
  nodes.push({ id: `category:${c.id}`, label: c.title, type: 'category', rag: 'green', reason: esc(c.blurb) + mono(esc(`${inCat.length} blocks: ${inCat.map(b => b.symbol).join(', ')}`)), gh: null, ext: `${SITE}table.html?category=${c.id}` });
}

// ---- 4. the named blocks, by category then number
const rel = b => [b.depends_on?.length ? 'depends on: ' + b.depends_on.map(d => d.symbol).join(', ') : 'depends on: none recorded', b.used_by?.length ? 'used by: ' + b.used_by.join(', ') : 'used by: none recorded'].join(' · ');
for (const b of named) {
  const rag = b.state === 'UNSETTLED' ? 'amber' : b.functions ? 'green' : 'grey';
  const line = [`#${b.number} · ${catTitle(b.category)} · ${b.functions} functions · in ${(b.repos || []).length} repositories`, rel(b), b.state === 'UNSETTLED' ? 'unsettled: more than one value is in use' : null].filter(Boolean).join('\n');
  nodes.push({ id: `block:${b.symbol}`, label: `${b.symbol} · ${b.title}`, type: b.kind, rag, reason: esc(b.description) + mono(esc(line)),
    gh: b.files?.[0] ? `${GH}${b.files[0].repo}/blob/${b.files[0].commit}/${b.files[0].path}` : null, ext: `${SITE}table.html?block=${b.symbol}` });
  edge(`category:${b.category}`, `block:${b.symbol}`, 'contains');
  for (const r of b.repos || []) if (repoNames.includes(r)) edge(`repo:${r}`, `block:${b.symbol}`, 'contains');
  for (const d of b.depends_on || []) edge(`block:${b.symbol}`, `block:${d.symbol}`, 'depends-on');
}

// ---- 5. the engine's canonical modules, in the engine graph's own order
const blockOfModule = label => named.find(b => (b.files || []).some(f => f.repo === ENGINE_REPO && f.path === label));
for (const n of engineModules) {
  const id = `module:${n.label}`, b = blockOfModule(n.label);
  nodes.push({ id, label: n.label, type: 'module', rag: n.rag || 'green', reason: esc(n.reason || 'A canonical module of the engine.') + mono(esc(`canonical module · ${b ? 'block ' + b.symbol + ' · ' + b.title : 'no block of the periodic table yet'}`)),
    gh: n.gh || `${GH}${ENGINE_REPO}/blob/main/${n.label}`, ext: `${ENGINE_SITE}?graph=engine-graph&focus=${encodeURIComponent(n.label)}` });
  edge(`repo:${ENGINE_REPO}`, id, 'contains');
  if (b) edge(id, `block:${b.symbol}`, 'implements');
}
if (!engineModules.length) nodes.push({ id: 'module:none', label: 'Engine modules', type: 'module', rag: 'grey', reason: 'The engine graph could not be fetched during this run, so its modules are not listed. They return on the next run.', gh: `${GH}${ENGINE_REPO}`, ext: `${ENGINE_SITE}?graph=engine-graph` });

// ---- write the graph
mkdirSync(path.join(OUT, 'structure'), { recursive: true });
const graph = { schema: 'structure-graph.v1', label: 'Structure of globalgrid2050 architecture development', generated_utc: now.toISOString(),
  note: 'Top-down: globalgrid2050 architecture development, its repositories, the categories of the periodic table, the named blocks with their interdependencies, and the canonical modules of the engine in the engine graph\'s order. Rebuilt by the Modular star workflow.',
  counts: { repositories: repoNames.length, categories: nodes.filter(n => n.type === 'category').length, blocks: named.length, engine_modules: engineModules.length },
  nodes, edges };
writeFileSync(path.join(OUT, 'structure', 'graph.json'), JSON.stringify(graph));

// ---- STRUCTURE.md with Mermaid diagrams
const mid = s => 'n_' + s.replace(/[^a-z0-9]+/gi, '_');
const ml = s => `"${String(s).replace(/"/g, '#quot;')}"`;
const cls = { green: 'ok', amber: 'warn', red: 'fail', blue: 'live', grey: 'off' };
const defs = ['  classDef ok fill:#153d2a,stroke:#39d353,color:#e6edf3', '  classDef warn fill:#3d2f0f,stroke:#ffd54a,color:#e6edf3', '  classDef fail fill:#3d1414,stroke:#ff6b6b,color:#e6edf3', '  classDef live fill:#12304a,stroke:#58a6ff,color:#e6edf3', '  classDef off fill:#21262d,stroke:#6b7280,color:#9aa3b5'];
const d1 = ['flowchart TD', ...defs, `  estate[${ml('globalgrid2050 architecture development')}]:::ok`];
for (const r of repoNames) { const n = nodes.find(x => x.id === `repo:${r}`); d1.push(`  ${mid(r)}[${ml(r.split('/')[1] + (blocksIn.get(r)?.length ? ' · ' + blocksIn.get(r).length + ' blocks' : ''))}]:::${cls[n.rag]}`, `  estate --> ${mid(r)}`); }
const d2 = ['flowchart LR', ...defs];
for (const c of categories) { const inCat = named.filter(b => b.category === c.id); if (!inCat.length) continue; d2.push(`  subgraph ${mid(c.id)}[${ml(c.title)}]`); for (const b of inCat) d2.push(`    ${mid('block:' + b.symbol)}[${ml(b.symbol + ' · ' + b.title)}]:::${cls[nodes.find(n => n.id === 'block:' + b.symbol).rag]}`); d2.push('  end'); }
for (const b of named) for (const d of b.depends_on || []) if (named.some(x => x.symbol === d.symbol)) d2.push(`  ${mid('block:' + b.symbol)} --> ${mid('block:' + d.symbol)}`);
const d3 = ['flowchart LR', ...defs, `  engine[${ml('ventus-grid-engine')}]:::ok`];
for (const n of engineModules) { const b = blockOfModule(n.label); d3.push(`  ${mid(n.label)}[${ml(n.label)}]:::${cls[n.rag] || 'ok'}`, `  engine --> ${mid(n.label)}`); if (b) d3.push(`  ${mid(n.label)} -. block .-> ${mid('block:' + b.symbol)}[${ml(b.symbol + ' · ' + b.title)}]:::${cls[nodes.find(x => x.id === 'block:' + b.symbol).rag]}`); }
const md = `# Structure of globalgrid2050 architecture development

Updated ${utc(now.toISOString())} by GitHub Actions. Top-down: globalgrid2050 architecture development, its repositories, the categories of the periodic table, the named blocks with their interdependencies, and the canonical modules of the engine in the engine graph's own order.
The same structure, card by card, is \`structure/graph.json\` (${kb(statSync(path.join(OUT, 'structure', 'graph.json')).size)}, ${nodes.length} cards, ${edges.length} links), registered for the Spider dashboard as **Structure of globalgrid2050 architecture development**. Amber is a block whose value is not yet settled; grey has no function inside yet.

## Repositories (${repoNames.length})

\`\`\`mermaid
${d1.join('\n')}
\`\`\`

## Blocks by category (${named.length}), arrows mean "depends on"

\`\`\`mermaid
${d2.join('\n')}
\`\`\`

## Engine modules (${engineModules.length}), in the engine graph's order

${engineModules.length ? '```mermaid\n' + d3.join('\n') + '\n```' : 'The engine graph could not be fetched during this run.'}
`;
writeFileSync(path.join(OUT, 'structure', 'STRUCTURE.md'), md);
console.log(`Structure: ${nodes.length} nodes (${repoNames.length} repositories, ${named.length} blocks, ${engineModules.length} engine modules), ${edges.length} edges, ${kb(statSync(path.join(OUT, 'structure', 'graph.json')).size)}.`);
