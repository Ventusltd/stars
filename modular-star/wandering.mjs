// Wandering star — walk the full commit history of every public Ventusltd repository and add every version of
// every code file ever written to the numbered database, with the date it was written. It resumes where the last
// run stopped, so the whole history builds up over successive runs without renumbering anything.
// Usage: node modular-star/wandering.mjs --db modular.sqlite --work /tmp/wander --minutes 45
import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import path from 'node:path';
import { openDb, ingestFile, langOf, gitBlobId } from './lib.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const DB = arg('db', 'modular.sqlite'), WORK = arg('work', '/tmp/wander');
const deadline = Date.now() + Number(arg('minutes', '45')) * 60000;
const OWNER = 'Ventusltd', SKIP = /(^|\/)(node_modules|vendor|dist|build|\.git)\/|\.min\.(js|mjs)$/i;
const sh = (args, opts = {}) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1024 * 1024 * 1024, ...opts });

const ctx = openDb(DB);
ctx.db.exec(`
CREATE TABLE IF NOT EXISTS commit_info(repo TEXT NOT NULL, sha TEXT NOT NULL, date TEXT NOT NULL, PRIMARY KEY(repo, sha));
CREATE TABLE IF NOT EXISTS wander(repo TEXT PRIMARY KEY, commits_total INTEGER, commits_done INTEGER, updated_utc TEXT);`);
const done = ctx.db.prepare('SELECT 1 FROM commit_info WHERE repo = ? AND sha = ?');
const insCommit = ctx.db.prepare('INSERT OR IGNORE INTO commit_info(repo, sha, date) VALUES(?, ?, ?)');

const repos = execFileSync('gh', ['api', '--paginate', `users/${OWNER}/repos?type=public&per_page=100`, '--jq', '.[] | select(.private == false and .fork == false) | .full_name'], { encoding: 'utf8' })
  .split('\n').filter(r => r && r !== `${OWNER}/stars`);
// Least-finished repositories first, so every repository makes progress.
const progress = new Map(ctx.db.prepare('SELECT repo, commits_total, commits_done FROM wander').all().map(w => [w.repo, w]));
repos.sort((a, b) => ((progress.get(a)?.commits_done ?? 0) / (progress.get(a)?.commits_total || 1)) - ((progress.get(b)?.commits_done ?? 0) / (progress.get(b)?.commits_total || 1)));

let versions = 0;
for (const repo of repos) {
  if (Date.now() > deadline) break;
  const w = progress.get(repo);
  if (w && w.commits_total && w.commits_done >= w.commits_total) continue;
  const dir = path.join(WORK, repo.replace('/', '__'));
  try {
    rmSync(dir, { recursive: true, force: true });
    execFileSync('git', ['clone', '--quiet', '--bare', '--filter=blob:limit=1m', `https://github.com/${repo}.git`, dir], { stdio: 'pipe' });
    // Oldest first. For each commit, the files it added or changed, with their new blob ids.
    const log = sh(['-C', dir, '-c', 'core.quotepath=false', 'log', '--all', '--reverse', '--no-renames', '--raw', '--no-abbrev', '--format=@@%H %cI']);
    const commits = [];
    for (const line of log.split('\n')) {
      if (line.startsWith('@@')) { const [sha, date] = line.slice(2).split(' '); commits.push({ sha, date, files: [] }); }
      else if (line.startsWith(':')) {
        const [meta, p] = line.split('\t'); const f = meta.split(' ');
        if (['A', 'M'].includes(f[4]?.[0]) && langOf(p) && !SKIP.test(p)) commits.at(-1)?.files.push({ oid: f[3], path: p });
      }
    }
    let n = 0, stopped = false;
    for (const c of commits) {
      if (done.get(repo, c.sha)) { n++; continue; }
      if (Date.now() > deadline) { stopped = true; break; }
      ctx.db.exec('BEGIN');
      if (c.files.length) {
        const input = c.files.map(f => f.oid).join('\n') + '\n';
        const buf = execFileSync('git', ['-C', dir, 'cat-file', '--batch'], { input, maxBuffer: 512 * 1024 * 1024, env: { ...process.env, GIT_NO_LAZY_FETCH: '1' } });
        let pos = 0;
        for (const f of c.files) {
          const nl = buf.indexOf(0x0a, pos);
          const [got, type, size] = buf.subarray(pos, nl).toString().split(' ');
          if (type === 'missing' || got !== f.oid) { pos = nl + 1; continue; }
          const bytes = buf.subarray(nl + 1, nl + 1 + Number(size));
          pos = nl + 1 + Number(size) + 1;
          if (gitBlobId(bytes) !== f.oid) continue;
          ingestFile(ctx, { repo, commit: c.sha, path: f.path, bytes, oid: f.oid, seen: c.date });
          versions++;
        }
      }
      insCommit.run(repo, c.sha, c.date);
      ctx.db.exec('COMMIT');
      n++;
    }
    ctx.db.prepare('INSERT OR REPLACE INTO wander(repo, commits_total, commits_done, updated_utc) VALUES(?, ?, ?, ?)').run(repo, commits.length, n, new Date().toISOString());
    console.log(`${repo}: ${n}/${commits.length} commits walked${stopped ? ' (time budget reached; continues next run)' : ''}`);
  } catch (e) {
    try { ctx.db.exec('ROLLBACK'); } catch {}
    console.log(`${repo}: not walked — ${String(e.message).split('\n')[0].slice(0, 200)}`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const t = ctx.db.prepare('SELECT count(*) repos, sum(commits_done) done, sum(commits_total) total FROM wander').get();
console.log(`History: ${t.done}/${t.total} commits across ${t.repos} repositories; ${versions} file versions read this run.`);
ctx.db.close();
