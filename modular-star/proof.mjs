// Proof of work: what ran, when, what it produced and which checks it passed, as a Spider graph.
// Reads the workflow runs of the public Ventusltd repositories through the GitHub CLI (GH_TOKEN on Actions),
// the artefacts in this repository (sizes and last-updated), the modular-star release and the generated apps.
// Writes proof/graph.json (the dashboard graph, nodes in reading order: workflows, runs, artefacts, checks) and
// proof/PROOF.md (the same as a Mermaid diagram GitHub renders). Standard library only; every input is optional,
// so the graph is still written when the CLI, the network or a file is missing (those cards go grey).
// Usage: node modular-star/proof.mjs --out .
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('out', '.');
const SITE = 'https://ventusltd.github.io/stars/';
const REPO = 'Ventusltd/stars';
const GH = 'https://github.com/';
const now = new Date();
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const mono = s => `<div style="font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;color:#9aa3b5;margin-top:4px;white-space:pre-wrap">${s}</div>`;
const kb = n => n >= 1024 * 1024 ? (n / 1048576).toFixed(1) + ' MB' : n >= 1024 ? Math.round(n / 1024) + ' KB' : n + ' B';
const utc = iso => iso ? new Date(iso).toISOString().replace('T', ' ').slice(0, 16) + ' UTC' : 'unknown';
const ago = iso => { if (!iso) return ''; const m = Math.round((now - new Date(iso)) / 60000); return m < 60 ? `${m} min ago` : m < 2880 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} days ago`; };
const dur = (a, b) => { if (!a || !b) return ''; const s = Math.round((new Date(b) - new Date(a)) / 1000); return s < 60 ? `${s} s` : `${Math.floor(s / 60)} min ${s % 60} s`; };

// ---- the GitHub CLI, optional
const gh = (...args) => {
  try {
    const r = spawnSync('gh', args, { encoding: 'utf8', timeout: 60000 });
    if (r.status !== 0) return null;
    return JSON.parse(r.stdout);
  } catch { return null; }
};
const RUN_FIELDS = 'databaseId,workflowName,status,conclusion,createdAt,updatedAt,url,event,displayTitle,headSha';
const runsOf = repo => gh('run', 'list', '-R', repo, '-L', '40', '--json', RUN_FIELDS) || [];
const stepsOf = (repo, id) => { const v = gh('run', 'view', String(id), '-R', repo, '--json', 'jobs'); return v?.jobs?.[0]?.steps || []; };
const lastCommitDate = (repo, p) => { const c = gh('api', `repos/${repo}/commits?path=${encodeURIComponent(p)}&per_page=1`); return c?.[0]?.commit?.committer?.date || null; };

// ---- workflows, in the order a reader meets them
const WORKFLOWS = [
  { id: 'wf:modular-star', label: 'Modular star', repo: REPO, name: 'Modular star', file: '.github/workflows/modular-star.yml', keep: 5,
    what: 'Scans the current code of every public repository, numbers every unique line permanently, groups functions into families and blocks, and writes the reports, the code records, the periodic table and the Spider graphs.', when: 'Hourly, on a push to its scripts, and on demand.' },
  { id: 'wf:refresh', label: 'Refresh reports', repo: REPO, name: 'Refresh reports', file: '.github/workflows/refresh.yml', keep: 3,
    what: 'Reads the latest recorded composition tests and rebuilds the Chemistry, Vedic and Random reports.', when: 'After every Modular star run, hourly, and on demand.' },
  { id: 'wf:generate', label: 'Generate app', repo: 'Ventusltd/code-generator', name: 'Generate app', file: '.github/workflows/generate.yml', keep: 3,
    what: 'Assembles an app from chosen blocks of the periodic table, proves that it parses, and commits it with a report and a recipe.', when: 'On demand.' },
  { id: 'wf:spider-features', label: 'Spider features', repo: 'Ventusltd/ventus-grid-engine', name: 'Spider features', file: '.github/workflows/spider-features.yml', keep: 3,
    what: 'Adds the graphs this repository registers to the Spider dashboard once each is verified live.', when: 'Hourly, once installed in the dashboard repository.' },
];
const runsByRepo = {};
for (const w of WORKFLOWS) if (!runsByRepo[w.repo]) runsByRepo[w.repo] = runsOf(w.repo);
const cliWorks = Object.values(runsByRepo).some(r => r.length);
const thisRun = process.env.GITHUB_RUN_ID ? Number(process.env.GITHUB_RUN_ID) : null;

const runRag = r => r.status !== 'completed' ? 'blue' : r.conclusion === 'success' ? 'green' : ['failure', 'timed_out', 'startup_failure'].includes(r.conclusion) ? 'red' : r.conclusion ? 'amber' : 'grey';
const runWord = r => r.status !== 'completed' ? (r.databaseId === thisRun ? 'running now (this run writes this graph)' : r.status.replace('_', ' ')) : r.conclusion === 'success' ? 'passed' : r.conclusion || 'unknown';
const stepLine = steps => steps.filter(s => !/^(Set up job|Complete job|Post |Run actions\/)/.test(s.name)).map(s => `${s.conclusion === 'success' ? '✔' : s.conclusion === 'skipped' ? '–' : s.conclusion ? '✖' : '…'} ${esc(s.name)}`).join('\n');

const nodes = [], edges = [];
const edge = (from, to, type) => edges.push({ from, to, type });

// ---- 1. workflows
const latestOf = {}, latestDone = {}, stepsDone = {};
for (const w of WORKFLOWS) {
  const runs = runsByRepo[w.repo].filter(r => r.workflowName === w.name).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  latestOf[w.id] = runs[0] || null;
  latestDone[w.id] = runs.find(r => r.status === 'completed') || null;
  stepsDone[w.id] = latestDone[w.id] ? stepsOf(w.repo, latestDone[w.id].databaseId) : [];
  w.runs = runs.slice(0, w.keep);
  const passed = runs.slice(0, 10).filter(r => r.conclusion === 'success').length, seen = runs.slice(0, 10).length;
  const rag = !cliWorks ? 'grey' : !runs.length ? 'grey' : runRag(runs[0]);
  const status = !cliWorks ? 'Run history unavailable from here (needs the GitHub CLI).' : !runs.length ? 'No run recorded yet: the workflow is not installed in its repository.' :
    `Latest run ${runWord(runs[0])}, started ${utc(runs[0].createdAt)} (${ago(runs[0].createdAt)}). ${passed} of the last ${seen} runs passed.`;
  nodes.push({ id: w.id, label: w.label, type: 'workflow', rag, reason: `${esc(w.what)} <span style="color:#9aa3b5">${esc(w.when)}</span>${mono(esc(status))}`,
    gh: `${GH}${w.repo}/actions/workflows/${path.basename(w.file)}`, ext: `${GH}${w.repo}/actions/workflows/${path.basename(w.file)}` });
}
edge('wf:modular-star', 'wf:refresh', 'triggers');
edge('wf:modular-star', 'wf:spider-features', 'triggers');

// ---- 2. runs, newest first under each workflow
for (const w of WORKFLOWS) for (const r of w.runs) {
  const id = `run:${r.databaseId}`;
  const steps = latestDone[w.id]?.databaseId === r.databaseId ? stepsDone[w.id] : [];
  const line = [`${r.event.replace('_', ' ')} · started ${utc(r.createdAt)}`, r.status === 'completed' ? `took ${dur(r.createdAt, r.updatedAt)}` : 'still running', `commit ${String(r.headSha).slice(0, 7)}`].join(' · ');
  nodes.push({ id, label: `${w.label} · ${utc(r.createdAt).slice(5, 16)}`, type: 'run', rag: runRag(r),
    reason: `${esc(runWord(r).replace(/^./, c => c.toUpperCase()))}: ${esc(r.displayTitle)}${mono(esc(line) + (steps.length ? '\n' + stepLine(steps) : ''))}`, gh: r.url, ext: r.url });
  edge(id, w.id, 'run-of');
}

// ---- 3. artefacts: what the runs leave behind, with size and last-updated
const artefacts = [
  { id: 'art:summary', file: 'modular/SUMMARY.md', label: 'Modular star summary', by: 'wf:modular-star', what: 'Totals, duplicate work, the rebuild check and the history walked, in plain words.', ext: `${GH}${REPO}/blob/main/modular/SUMMARY.md` },
  { id: 'art:lines', file: 'LINES.md', label: 'Every numbered line', by: 'wf:modular-star', what: 'Every unique line of code in globalgrid2050 architecture development with its permanent number.', ext: `${GH}${REPO}/blob/main/LINES.md` },
  { id: 'art:code', file: 'code.html', label: 'Code report page', by: 'wf:modular-star', what: 'One page per function family: every place it is used, the live page, the numbered lines, copy.', ext: `${SITE}code.html` },
  { id: 'art:modular-graph', file: 'modular/graph.json', label: 'Modular star graph', by: 'wf:modular-star', what: 'The Spider graph of families found in two or more files, wired to their repositories.', ext: `${SITE}modular/graph.json` },
  { id: 'art:blocks', file: 'blocks/blocks.json', label: 'Periodic table of blocks', by: 'wf:modular-star', what: 'Every block with its number, description, functions, repositories and interdependencies.', ext: `${SITE}blocks/blocks.json` },
  { id: 'art:table', file: 'table.html', label: 'Periodic table page', by: 'wf:modular-star', what: 'The blocks by category, with dropdowns to build an app from them.', ext: `${SITE}table.html` },
  { id: 'art:blocks-graph', file: 'blocks/graph.json', label: 'Periodic table graph', by: 'wf:modular-star', what: 'The Spider graph of blocks, categories and repositories.', ext: `${SITE}blocks/graph.json` },
  { id: 'art:reactions', file: 'blocks/reactions.json', label: 'Chemistry of blocks', by: 'wf:modular-star', what: 'Which blocks combine, and the evidence for each combination.', ext: `${SITE}blocks/reactions.json` },
  { id: 'art:library', file: 'library/standalone.mjs', label: 'Compiled library', by: 'wf:modular-star', what: 'Every self-contained function, compiled into one importable module.', ext: `${GH}${REPO}/blob/main/library/standalone.mjs` },
  { id: 'art:features', file: 'spider/features.yml', label: 'Dashboard registry', by: 'wf:modular-star', what: 'The list of graphs this repository offers to the Spider dashboard.', ext: `${GH}${REPO}/blob/main/spider/features.yml` },
  { id: 'art:proof', file: 'proof/graph.json', label: 'Proof of work graph', by: 'wf:modular-star', what: 'This graph. Rebuilt on every run.', ext: `${SITE}proof/graph.json` },
  { id: 'art:structure', file: 'structure/graph.json', label: 'Structure graph', by: 'wf:modular-star', what: 'globalgrid2050 architecture development, top-down: repositories, blocks and the engine modules.', ext: `${SITE}structure/graph.json` },
  { id: 'art:chemistry', file: 'reports/CHEMISTRY.md', label: 'Chemistry report', by: 'wf:refresh', what: 'Which combinations of map components always work and which fail.', ext: `${GH}${REPO}/blob/main/reports/CHEMISTRY.md` },
  { id: 'art:vedic', file: 'reports/CLASSIFICATION.md', label: 'Classification report', by: 'wf:refresh', what: 'The five-element classification of the code and whether each test respected its rules.', ext: `${GH}${REPO}/blob/main/reports/CLASSIFICATION.md` },
  { id: 'art:random', file: 'reports/RANDOM.md', label: 'Random report', by: 'wf:refresh', what: 'Randomly chosen links between components, as prompts to look.', ext: `${GH}${REPO}/blob/main/reports/RANDOM.md` },
];
const generatedUtc = f => { try { const j = JSON.parse(readFileSync(path.join(OUT, f), 'utf8')); return j.generated_utc || null; } catch { return null; } };
const summaryUpdated = () => { try { const m = readFileSync(path.join(OUT, 'modular/SUMMARY.md'), 'utf8').match(/Updated (\d{4}-\d\d-\d\d \d\d:\d\d) UTC/); return m ? m[1].replace(' ', 'T') + 'Z' : null; } catch { return null; } };
for (const a of artefacts) {
  const p = path.join(OUT, a.file);
  const exists = existsSync(p);
  const size = exists ? statSync(p).size : 0;
  const when = a.file.endsWith('.json') ? generatedUtc(a.file) : a.file === 'modular/SUMMARY.md' ? summaryUpdated() : (cliWorks ? lastCommitDate(REPO, a.file) : null);
  const line = exists ? `${kb(size)} · ${when ? 'updated ' + utc(when) + ' (' + ago(when) + ')' : 'update time not available'} · ${a.file}` : `not present yet · ${a.file}`;
  nodes.push({ id: a.id, label: a.label, type: 'artefact', rag: !exists ? 'grey' : when && (now - new Date(when)) > 36e5 * 26 ? 'amber' : 'green', reason: esc(a.what) + mono(esc(line)), gh: `${GH}${REPO}/blob/main/${a.file}`, ext: a.ext });
  edge(a.by, a.id, 'produces');
  if (latestOf[a.by]) edge(`run:${latestOf[a.by].databaseId}`, a.id, 'produces');
}
// The numbered database, kept as a release so every run continues from the last.
{
  const rel = gh('release', 'view', 'modular-star', '-R', REPO, '--json', 'assets,url,publishedAt');
  const assets = rel?.assets || [];
  const line = assets.length ? assets.map(x => `${x.name.padEnd(28)} ${kb(x.size).padStart(8)}  ${utc(x.updatedAt)}`).join('\n') : 'release not readable from here';
  nodes.push({ id: 'art:release', label: 'Numbered database (release)', type: 'artefact', rag: assets.length ? 'green' : 'grey',
    reason: 'The database in which every line, function and family keeps its number for ever, and the prior-work catalogue. Each run restores it, adds to it, and saves it back.' + mono(esc(line)),
    gh: rel?.url || `${GH}${REPO}/releases/tag/modular-star`, ext: rel?.url || `${GH}${REPO}/releases/tag/modular-star` });
  edge('wf:modular-star', 'art:release', 'produces');
}
// Generated apps, one card each.
{
  const apps = (gh('api', 'repos/Ventusltd/code-generator/contents/apps') || []).filter(x => x.type === 'dir').slice(0, 8);
  for (const app of apps) {
    let parts = null;
    try { const r = gh('api', `repos/Ventusltd/code-generator/contents/apps/${app.name}/parts.json`); parts = r?.content ? JSON.parse(Buffer.from(r.content, 'base64').toString('utf8')) : null; } catch { parts = null; }
    const blocks = Array.isArray(parts) ? parts.map(p => p.symbol || p.block || p).filter(x => typeof x === 'string') : Array.isArray(parts?.blocks) ? parts.blocks.map(p => p.symbol || p) : Object.keys(parts || {}).filter(k => /^[A-Z][a-z0-9]{0,2}$/.test(k));
    const id = `app:${app.name}`;
    nodes.push({ id, label: `App · ${app.name}`, type: 'app', rag: 'green', reason: `An app assembled from blocks of the periodic table, with its report and recipe.${mono(esc((blocks.length ? 'blocks: ' + blocks.join(', ') + '\n' : '') + 'apps/' + app.name))}`,
      gh: app.html_url, ext: app.html_url });
    edge('wf:generate', id, 'produces');
    edge('art:blocks', id, 'produces');
  }
  if (!apps.length) nodes.push({ id: 'app:none', label: 'Generated apps', type: 'app', rag: 'grey', reason: 'The generated apps could not be listed from here.', gh: `${GH}Ventusltd/code-generator/tree/main/apps`, ext: `${GH}Ventusltd/code-generator/tree/main/apps` });
}

// ---- 4. checks: the proofs each run must pass before anything is saved
const stepOf = (wid, re) => stepsDone[wid].find(s => re.test(s.name)) || null;
const stepRag = s => !s ? 'grey' : s.conclusion === 'success' ? 'green' : s.conclusion === 'skipped' ? 'amber' : 'red';
const stepWord = (wid, s) => !s ? 'no completed run to read' : `${s.conclusion || 'unknown'} in the latest completed run (${utc(latestDone[wid]?.createdAt)})`;
const rebuild = (() => { try { const m = readFileSync(path.join(OUT, 'modular/SUMMARY.md'), 'utf8').match(/Check: ([^\n]+)/); return m ? m[1] : null; } catch { return null; } })();
const registered = ['modular/graph.json', 'blocks/graph.json', 'spider/graphs/chemistry.json', 'spider/graphs/vedic.json', 'spider/graphs/random.json', 'proof/graph.json', 'structure/graph.json']
  .filter(f => existsSync(path.join(OUT, f))).map(f => ({ f, size: statSync(path.join(OUT, f)).size }));
const oversize = registered.filter(x => x.size > 600 * 1024);
const pagesRun = runsByRepo[REPO].filter(r => r.workflowName === 'pages-build-deployment').sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;
const CHECKS = [
  { id: 'chk:tests', label: 'Unit tests', what: 'The numbering and parsing logic is tested before any run touches the database.', step: stepOf('wf:modular-star', /^Tests$/), wid: 'wf:modular-star', on: ['art:release'] },
  { id: 'chk:rebuild', label: 'Rebuild check', what: 'Randomly chosen files are rebuilt from their numbered lines and compared with GitHub byte for byte.',
    rag: rebuild ? (/all matched/.test(rebuild) ? 'green' : 'red') : 'grey', line: rebuild || 'no summary to read', on: ['art:lines', 'art:release'] },
  { id: 'chk:permanence', label: 'Permanence check', what: 'No line, function or family number from an earlier run may change. The run refuses to save if one did.', step: stepOf('wf:modular-star', /no earlier number changed/), wid: 'wf:modular-star', on: ['art:release', 'art:lines', 'art:code'] },
  { id: 'chk:library', label: 'Library loads', what: 'The compiled library is parsed and imported before it is published.', step: stepOf('wf:modular-star', /compiled library loads/), wid: 'wf:modular-star', on: ['art:library'] },
  { id: 'chk:size', label: 'Graph size limit', what: 'Every graph registered for the dashboard must stay under the size limit, because the dashboard loads them all on open.',
    rag: registered.length ? (oversize.length ? 'red' : 'green') : 'grey', line: registered.map(x => `${x.f.padEnd(30)} ${kb(x.size).padStart(7)}`).join('\n') + (oversize.length ? '\nover the limit: ' + oversize.map(x => x.f).join(', ') : '\nall under 600 KB'), on: ['art:modular-graph', 'art:blocks-graph', 'art:proof', 'art:structure', 'art:features'] },
  { id: 'chk:parses', label: 'Generated app parses', what: 'A generated app is only committed once its assembled code parses.', rag: latestDone['wf:generate'] ? runRag(latestDone['wf:generate']) : 'grey', line: latestDone['wf:generate'] ? `latest Generate app run ${runWord(latestDone['wf:generate'])} (${utc(latestDone['wf:generate'].createdAt)})` : 'no completed run to read', on: nodes.filter(n => n.id.startsWith('app:') && n.id !== 'app:none').map(n => n.id) },
  { id: 'chk:pages', label: 'Published to the web', what: 'GitHub Pages rebuilt the public site after the last save, so what this graph describes is what a reader can open.', rag: pagesRun ? runRag(pagesRun) : 'grey', line: pagesRun ? `Pages deployment ${runWord(pagesRun)} at ${utc(pagesRun.updatedAt)} (${ago(pagesRun.updatedAt)})` : 'no deployment to read', on: ['art:code', 'art:table', 'art:modular-graph', 'art:blocks-graph', 'art:proof', 'art:structure'] },
];
for (const c of CHECKS) {
  const rag = c.step !== undefined ? stepRag(c.step) : c.rag;
  const line = c.step !== undefined ? stepWord(c.wid, c.step) : c.line;
  nodes.push({ id: c.id, label: c.label, type: 'check', rag, reason: esc(c.what) + mono(esc(line)), gh: `${GH}${REPO}/blob/main/.github/workflows/modular-star.yml`, ext: c.id === 'chk:parses' ? `${GH}Ventusltd/code-generator/actions` : `${GH}${REPO}/actions` });
  for (const a of c.on) edge(a, c.id, 'checked-by');
}

// ---- write the graph
mkdirSync(path.join(OUT, 'proof'), { recursive: true });
const graph = { schema: 'proof-of-work-graph.v1', label: 'Proof of work', generated_utc: now.toISOString(),
  note: 'Workflows, their latest runs, the artefacts they produce and the checks they pass. Rebuilt by the Modular star workflow; every card opens the run, file or release it describes.',
  counts: { workflows: WORKFLOWS.length, runs: nodes.filter(n => n.type === 'run').length, artefacts: nodes.filter(n => n.type === 'artefact' || n.type === 'app').length, checks: CHECKS.length },
  nodes, edges };
writeFileSync(path.join(OUT, 'proof', 'graph.json'), JSON.stringify(graph));

// ---- PROOF.md with a Mermaid diagram
const mid = s => 'n_' + s.replace(/[^a-z0-9]+/gi, '_');
const mlabel = s => `"${String(s).replace(/"/g, '#quot;')}"`;
const ragClass = { green: 'ok', amber: 'warn', red: 'fail', blue: 'live', grey: 'off' };
const m = ['flowchart LR'];
m.push('  classDef ok fill:#153d2a,stroke:#39d353,color:#e6edf3', '  classDef warn fill:#3d2f0f,stroke:#ffd54a,color:#e6edf3', '  classDef fail fill:#3d1414,stroke:#ff6b6b,color:#e6edf3', '  classDef live fill:#12304a,stroke:#58a6ff,color:#e6edf3', '  classDef off fill:#21262d,stroke:#6b7280,color:#9aa3b5');
const shown = new Set();
const show = n => { if (shown.has(n.id)) return; shown.add(n.id); m.push(`  ${mid(n.id)}[${mlabel(n.label)}]:::${ragClass[n.rag] || 'off'}`); };
m.push('  subgraph g_workflows["Workflows"]'); for (const n of nodes.filter(n => n.type === 'workflow')) show(n); m.push('  end');
m.push('  subgraph g_runs["Latest runs"]'); for (const w of WORKFLOWS) { const r = latestOf[w.id]; if (r) show(nodes.find(n => n.id === `run:${r.databaseId}`)); } m.push('  end');
m.push('  subgraph g_artefacts["Artefacts"]'); for (const n of nodes.filter(n => n.type === 'artefact' || n.type === 'app')) show(n); m.push('  end');
m.push('  subgraph g_checks["Checks"]'); for (const n of nodes.filter(n => n.type === 'check')) show(n); m.push('  end');
for (const e of edges) if (shown.has(e.from) && shown.has(e.to)) m.push(`  ${mid(e.from)} ${e.type === 'run-of' ? '-. run .->' : e.type === 'checked-by' ? '-- checked by -->' : e.type === 'triggers' ? '== triggers ==>' : '-->'} ${mid(e.to)}`);
const table = ['| Workflow | Latest run | Started | Took | Last 10 |', '|---|---|---|---|---|'];
for (const w of WORKFLOWS) { const r = latestOf[w.id]; const n = nodes.find(x => x.id === w.id); table.push(`| ${w.label} | ${r ? `[${runWord(r)}](${r.url})` : 'not installed'} | ${r ? utc(r.createdAt) : ''} | ${r && r.status === 'completed' ? dur(r.createdAt, r.updatedAt) : ''} | ${(n.reason.match(/(\d+ of the last \d+ runs passed)/) || ['', ''])[1]} |`); }
const md = `# Proof of work

Updated ${utc(now.toISOString())} by GitHub Actions. Green passed, amber needs a look, red failed, blue still running, grey not readable from here.
The same graph, card by card, is \`proof/graph.json\` (${kb(statSync(path.join(OUT, 'proof', 'graph.json')).size)}, ${nodes.length} cards, ${edges.length} links), registered for the Spider dashboard as **Proof of work**.

${table.join('\n')}

\`\`\`mermaid
${m.join('\n')}
\`\`\`

## Checks

${CHECKS.map(c => { const n = nodes.find(x => x.id === c.id); return `- **${c.label}** (${n.rag}): ${c.what}`; }).join('\n')}
`;
writeFileSync(path.join(OUT, 'proof', 'PROOF.md'), md);
console.log(`Proof of work: ${nodes.length} nodes, ${edges.length} edges, ${kb(statSync(path.join(OUT, 'proof', 'graph.json')).size)}; CLI ${cliWorks ? 'read the runs' : 'not available, run cards grey'}.`);
