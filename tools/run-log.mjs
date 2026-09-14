// The lines that matter from one workflow run: what our scripts printed (Blocks:, Reactions:, Spider graph:, graphs
// registered, repository counts) plus every error and stack trace, with timestamps and colour codes stripped.
// Usage: node tools/run-log.mjs <run-id> [--repo Ventusltd/stars] [--all]
// --all prints every line of the log (still cleaned). Exits 1 when the run did not succeed, 2 when its log is not yet available.
import { execFileSync } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const id = process.argv[2], repo = arg('repo', 'Ventusltd/stars'), all = process.argv.includes('--all');
if (!id || !/^\d+$/.test(id)) { console.log('Usage: node tools/run-log.mjs <run-id> [--repo owner/name] [--all]'); process.exit(2); }

const gh = args => execFileSync('gh', args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
let run;
try { run = JSON.parse(gh(['run', 'view', id, '-R', repo, '--json', 'status,conclusion,event,createdAt,updatedAt,workflowName,displayTitle,jobs,url'])); }
catch (e) { console.log(`Run ${id} in ${repo}: ${String(e.stderr || e.message).trim().split('\n')[0]}`); process.exit(2); }
const mins = ((Date.parse(run.updatedAt) - Date.parse(run.createdAt)) / 60000).toFixed(1);
console.log(`${run.workflowName} #${id} (${repo}): ${run.status} ${run.conclusion || ''} · ${run.event} · ${run.createdAt.slice(0, 16).replace('T', ' ')} UTC · ${mins} min · ${run.url}`);
for (const j of run.jobs || []) for (const s of j.steps || []) if (s.conclusion && s.conclusion !== 'success' && s.conclusion !== 'skipped') console.log(`  step "${s.name}": ${s.conclusion}`);

let log;
try { log = gh(['run', 'view', id, '-R', repo, '--log']); }
catch (e) { console.log(`  log not available yet: ${String(e.stderr || e.message).trim().split('\n')[0]}`); process.exit(run.status === 'completed' ? 1 : 2); }

// Lines arrive as "job<TAB>step<TAB>2026-09-14T09:44:57.1234567Z text"; keep the step, drop the clock and colours.
const OURS = /^(Blocks:|Reactions:|Spider graph:|Repositories to scan:|Done:|Rebuild check|History|No changes\.|First run:|\d+ graphs registered|[\w.-]+: \d+ KB is over|Ventusltd\/\S+: (\d+ code files|not scanned)|\d+ library functions load|✔|✖|# (pass|fail|tests) |\S+\.json: .* KB · generated|\s+(warning: |FAULT: |Readable by the receiver|\d+ fault\(s\)))/;
const TROUBLE = /(##\[error\]|\bError\b|\bERR!|Traceback|^\s+File "|^\s+at |Unhandled|exit code|fatal:|failed|FAULT|npm error|SyntaxError|TypeError|ReferenceError|RangeError)/;
let lastStep = '', shown = 0;
for (const raw of log.split('\n')) {
  const parts = raw.split('\t');
  const step = parts.length >= 3 ? parts[1] : '';
  const text = (parts.length >= 3 ? parts.slice(2).join('\t') : raw).replace(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d+)?Z ?/, '').replace(/\x1b\[[0-9;]*[A-Za-z]/g, '').replace(/\r$/, '');
  if (!text.trim()) continue;
  if (!all && !OURS.test(text) && !TROUBLE.test(text)) continue;
  if (/^##\[(group|endgroup|debug)\]/.test(text)) continue;
  if (step !== lastStep) { console.log(`\n[${step || 'run'}]`); lastStep = step; }
  console.log('  ' + text.slice(0, 400));
  shown++;
}
if (!shown) console.log('\n  Nothing from our scripts and no errors in the log.');
process.exit(run.conclusion === 'success' ? 0 : 1);
