// One-call status of the automation: recent runs of every workflow in stars and code-generator, whether the
// cron schedule has ever fired, the live size and HTTP status of the published files, and the registry's graphs.
// Usage: node tools/status.mjs            (needs gh, signed in; node 24 built-ins only)
// Exits 1 when a workflow's newest finished run failed, a key file is not served, or gh could not be read.
import { execFileSync } from 'node:child_process';

const REPOS = ['Ventusltd/stars', 'Ventusltd/code-generator'];
const SITE = 'https://ventusltd.github.io/stars/';
const FILES = ['blocks/blocks.json', 'blocks/reactions.json', 'modular/graph.json', 'spider/features.yml', 'code/index.json', 'LINES.md'];
const REGISTRY_LIMIT = 600 * 1024;
const now = Date.now();
let problems = 0;

const gh = args => { try { return JSON.parse(execFileSync('gh', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })); } catch (e) { problems++; console.log(`gh ${args.slice(0, 3).join(' ')}: ${String(e.stderr || e.message).trim().split('\n')[0]}`); return null; } };
const span = ms => { ms = Math.max(0, ms); const s = Math.round(ms / 1000); return s < 60 ? `${s}s` : s < 3600 ? `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s` : s < 86400 ? `${Math.floor(s / 3600)}h${String(Math.floor(s % 3600 / 60)).padStart(2, '0')}m` : `${Math.floor(s / 86400)}d${Math.floor(s % 86400 / 3600)}h`; };
const kb = n => n >= 1024 * 1024 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`;
const mark = r => r.status !== 'completed' ? 'RUN' : { success: 'ok', failure: 'FAIL', cancelled: 'cancel', timed_out: 'TIMEOUT', skipped: 'skip', neutral: 'ok', action_required: 'ACTION' }[r.conclusion] || r.conclusion || '?';

console.log(`Status at ${new Date(now).toISOString().slice(0, 16).replace('T', ' ')} UTC`);
for (const repo of REPOS) {
  const runs = gh(['run', 'list', '-R', repo, '--limit', '80', '--json', 'databaseId,workflowName,status,conclusion,event,createdAt,updatedAt,startedAt']) || [];
  const byFlow = new Map();
  for (const r of runs) { if (!byFlow.has(r.workflowName)) byFlow.set(r.workflowName, []); if (byFlow.get(r.workflowName).length < 5) byFlow.get(r.workflowName).push(r); }
  console.log(`\n${repo}`);
  for (const [name, list] of byFlow) {
    const cells = list.map(r => {
      const start = Date.parse(r.startedAt || r.createdAt), end = r.status === 'completed' ? Date.parse(r.updatedAt) : now;
      return `${mark(r)} ${span(end - start)} ${span(now - Date.parse(r.createdAt))} ago (${r.event})`;
    });
    const newestDone = list.find(r => r.status === 'completed');
    if (newestDone && ['failure', 'timed_out'].includes(newestDone.conclusion) && name !== 'pages-build-deployment') problems++;
    console.log(`  ${name}: ${cells.join(' | ')}${list[0] ? `  #${list[0].databaseId}` : ''}`);
  }
  const cron = gh(['run', 'list', '-R', repo, '--event', 'schedule', '--limit', '1', '--json', 'createdAt,workflowName']) || [];
  console.log(cron.length ? `  cron: last fired ${span(now - Date.parse(cron[0].createdAt))} ago (${cron[0].workflowName})` : '  cron: never fired');
}

console.log(`\nPublished at ${SITE}`);
for (const f of FILES) {
  try {
    const r = await fetch(SITE + f, { method: 'HEAD', headers: { 'accept-encoding': 'identity' }, cache: 'no-store' });
    const len = Number(r.headers.get('content-length') || 0), mod = Date.parse(r.headers.get('last-modified') || '');
    if (r.status !== 200) problems++;
    const note = f === 'modular/graph.json' || f === 'blocks/graph.json' ? (len > REGISTRY_LIMIT ? ' OVER the 600 KB registry limit' : len > REGISTRY_LIMIT * 0.9 ? ` ${Math.round(100 * len / REGISTRY_LIMIT)}% of the 600 KB registry limit` : '') : '';
    console.log(`  ${r.status} ${f.padEnd(22)} ${kb(len).padStart(8)}${mod ? `  modified ${span(now - mod)} ago` : ''}${note}`);
  } catch (e) { problems++; console.log(`  ERR ${f}: ${e.message}`); }
}

try {
  const yml = await (await fetch(SITE + 'spider/features.yml', { cache: 'no-store' })).text();
  const entries = [...yml.matchAll(/- id: "([^"]+)"[\s\S]*?nodes: (\d+)\s+edges: (\d+)\s+graph_generated_utc: "([^"]*)"/g)];
  console.log(`\nRegistry: ${entries.length} graphs: ${entries.map(m => `${m[1]} (${m[2]}n/${m[3]}e, ${m[4] ? span(now - Date.parse(m[4])) + ' old' : 'undated'})`).join(', ')}`);
  if (!entries.length) problems++;
} catch (e) { problems++; console.log(`Registry: unreadable: ${e.message}`); }

console.log(problems ? `\n${problems} problem(s) above.` : '\nNo problems.');
process.exitCode = problems ? 1 : 0; // not process.exit(): on Windows that races an open fetch socket and aborts with a libuv assertion
