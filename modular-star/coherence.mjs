// Coherence intelligent resume — the lab's own memory. Gathers, in one place, what ran, what exists, what is
// registered, what the graphs say, and what is waiting, so any agent or person resumes from the same page.
// Writes resume/RESUME.md and resume/status.json. Runs on GitHub Actions (coherence.yml), at most 20 minutes.
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const now = new Date().toISOString();
const read = p => existsSync(p) ? readFileSync(p, 'utf8') : '';
const gh = args => { try { return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', timeout: 60000 })); } catch { return []; } };
const runs = (repo, n) => gh(['run', 'list', '-R', repo, '-L', String(n), '--json', 'workflowName,status,conclusion,createdAt,event,databaseId,updatedAt'])
  .map(r => ({ workflow: r.workflowName, status: r.conclusion || r.status, event: r.event, started: r.createdAt, minutes: Math.round((Date.parse(r.updatedAt) - Date.parse(r.createdAt)) / 60000), id: r.databaseId }));
const size = p => existsSync(p) ? Math.round(statSync(p).size / 1024) : null;

const stars = runs('Ventusltd/stars', 8), gen = runs('Ventusltd/code-generator', 4);
const cronFired = stars.some(r => r.event === 'schedule');
const index = existsSync('code/index.json') ? JSON.parse(read('code/index.json')) : null;
const table = existsSync('blocks/blocks.json') ? JSON.parse(read('blocks/blocks.json')) : null;
const registry = [...read('spider/features.yml').matchAll(/- id: "([^"]+)"/g)].map(m => m[1]);
const artefacts = ['LINES.md', 'modular/SUMMARY.md', 'modular/graph.json', 'blocks/blocks.json', 'blocks/reactions.json', 'sense/graph.json', 'proof/graph.json', 'structure/graph.json', 'code/index.json', 'spider/features.yml']
  .map(p => ({ path: p, kb: size(p) }));
const worklog = read('WORKLOG.md').split('\n').filter(l => l.startsWith('- 20')).slice(-6);
const decisions = (read('CODE-UNIVERSE.md').match(/\*\*DECIDE \d\.[^\n]*/g) || []).map(s => s.replace(/\*\*/g, '').slice(0, 160));
const senseHead = read('sense/SENSE.md').split('\n').slice(0, 12).join('\n');
const failures = [...stars, ...gen].filter(r => r.status === 'failure');

const status = { generated_utc: now, runs: { stars, code_generator: gen }, cron_has_fired: cronFired, index: index && { families: index.families, elements: index.elements, lines: index.lines, updated: index.generated_utc },
  blocks: table && { named: table.blocks.filter(b => b.kind !== 'auto').length, auto: table.blocks.filter(b => b.kind === 'auto').length, updated: table.generated_utc }, registry, artefacts, failures, decisions, latest_log: worklog };
mkdirSync('resume', { recursive: true });
writeFileSync('resume/status.json', JSON.stringify(status, null, 1));

const md = [`# Coherence: intelligent resume`, '', `Generated ${now.slice(0, 16).replace('T', ' ')} UTC by the coherence workflow. This is the single page to resume from. It is rebuilt after every Modular star run and on demand; a copy is synchronised to Dropbox \`coherence\\\` while the Ventus workstation is on.`, '',
  '## Health', '', `- Failed runs in the last window: **${failures.length}**${failures.length ? ' — ' + failures.map(f => `${f.workflow} #${f.id}`).join(', ') : ''}.`, `- GitHub schedule has ${cronFired ? '' : 'never '}fired in this repository${cronFired ? '' : ' (runs come from pushes, the chain, the workstation fallback, or by hand)'}.`,
  index ? `- Index: ${index.families.toLocaleString('en-GB')} families, ${index.elements.toLocaleString('en-GB')} functions and classes, ${index.lines.toLocaleString('en-GB')} unique lines (updated ${index.generated_utc.slice(0, 16).replace('T', ' ')} UTC).` : '- Index: not built yet.',
  table ? `- Periodic table: ${status.blocks.named} named blocks, ${status.blocks.auto} auto-blocks.` : '- Periodic table: not built yet.', `- Registered for the dashboard: ${registry.join(', ') || 'nothing yet'}.`, '',
  '## Last runs', '', '| Repository | Workflow | Result | Trigger | Started (UTC) | Minutes |', '|---|---|---|---|---|---|',
  ...stars.map(r => `| stars | ${r.workflow} | ${r.status} | ${r.event} | ${r.started.slice(0, 16).replace('T', ' ')} | ${r.minutes} |`), ...gen.map(r => `| code-generator | ${r.workflow} | ${r.status} | ${r.event} | ${r.started.slice(0, 16).replace('T', ' ')} | ${r.minutes} |`), '',
  '## Artefacts', '', '| File | Size |', '|---|---|', ...artefacts.map(a => `| ${a.path} | ${a.kb === null ? 'missing' : a.kb + ' KB'} |`), '',
  '## What the sense graph says', '', senseHead || '_sense/SENSE.md not built yet._', '',
  '## Decisions waiting', '', ...(decisions.length ? decisions.map(d => `- ${d}`) : ['- See CODE-UNIVERSE.md.']), '',
  '## Latest work log', '', ...worklog, '',
  '## How to resume', '', '1. Read this page, then `WORKLOG.md`.', '2. If a run failed: `gh run view <id> --log-failed` (or `node tools/run-log.mjs <id>`), fix the script, never the generated outputs.', '3. If no Modular star run began in the last 70 minutes: `gh workflow run modular-star.yml -R Ventusltd/stars`.', '4. Continue from the newest work log entry.'];
writeFileSync('resume/RESUME.md', md.join('\n') + '\n');
console.log(`Coherence: ${failures.length} failed run(s); registry ${registry.length}; artefacts ${artefacts.filter(a => a.kb !== null).length}/${artefacts.length}.`);
