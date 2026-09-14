// Check the published pages of this repository the way a phone reaches them: each page, every file the page
// fetches or links to under its own site, HTTP status, size, and any <script src> or stylesheet pulled from a
// host outside our own (no CDN is allowed: the pages must work with the files served here).
// Usage: node tools/pages-check.mjs [--site https://ventusltd.github.io/stars/] [--grace 30] [--strict]
// Exits 1 on an HTTP error for one of our own files or a script from a non-allowed host. A file that is missing
// on the site but was committed here less than --grace minutes ago is reported as "not deployed yet" (a warning),
// so a run that follows a push does not fail on Pages' deploy delay. Size limits are warnings unless --strict.
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';

const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SITE = arg('--site', 'https://ventusltd.github.io/stars/').replace(/\/?$/, '/');
const GRACE_MIN = Number(arg('--grace', 30)), strict = process.argv.includes('--strict');
const ALLOWED_HOSTS = new Set(['ventusltd.github.io', 'globalgrid2050.com', 'www.globalgrid2050.com']);
const PAGE_MAX = 64 * 1024, DATA_MAX = 2 * 1024 * 1024; // a page over 64 KB or a data file over 2 MB is slow on a phone
const PAGES = ['start.html', 'table.html', 'code.html'];
const DATA = ['blocks/blocks.json', 'blocks/families.json', 'code/index.json', 'code/names.json', 'code/f/0.json', 'code/f/1.json'];
const faults = [], warnings = [];
const kb = n => n < 1024 ? `${n} B` : `${Math.round(n / 1024)} KB`; // sizes are as sent (Pages compresses)

function minutesSinceCommit(path) {
  try { const t = Number(execSync(`git log -1 --format=%ct -- "${path}"`, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()); return t ? (Date.now() / 1000 - t) / 60 : Infinity; }
  catch { return Infinity; }
}
async function head(path) {
  const url = new URL(path, SITE).href;
  let r;
  try { r = await fetch(url, { method: 'HEAD', cache: 'no-store', redirect: 'follow' }); if (r.status === 405) r = await fetch(url, { cache: 'no-store' }); }
  catch (e) { return { url, status: 0, size: 0, error: e.message }; }
  return { url, status: r.status, size: Number(r.headers.get('content-length') || 0), type: r.headers.get('content-type') || '' };
}
function judge(path, res, max) {
  const label = `${path}: ${res.status || 'no response'} ${res.size ? kb(res.size) : ''}`.trim();
  if (res.status === 200) { if (res.size > max) (strict ? faults : warnings).push(`${path} is ${kb(res.size)}, over ${kb(max)}: slow on a phone`); return label; }
  if (res.status === 404 && existsSync(path) && minutesSinceCommit(path) < GRACE_MIN) { warnings.push(`${path} is not deployed yet (committed ${Math.round(minutesSinceCommit(path))} min ago; Pages is still publishing)`); return label + ' (not deployed yet)'; }
  faults.push(`${path}: HTTP ${res.status || res.error} for one of our own files`);
  return label;
}

console.log(`Pages check · ${SITE} · ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC`);
for (const page of PAGES) {
  const url = new URL(page, SITE).href;
  let r, html = '';
  try { r = await fetch(url, { cache: 'no-store' }); html = r.ok ? await r.text() : ''; } catch (e) { r = { status: 0, statusText: e.message }; }
  const size = Buffer.byteLength(html);
  console.log(`  ${judge(page, { status: r.status, size, error: r.statusText }, PAGE_MAX)}`);
  if (!html) continue;
  // Scripts and stylesheets from outside our own hosts: the page would break offline or when the CDN changes.
  for (const m of html.matchAll(/<script[^>]*\ssrc\s*=\s*["']([^"']+)["']/gi)) {
    const src = m[1]; if (!/^(https?:)?\/\//i.test(src)) continue;
    const host = new URL(src.startsWith('//') ? 'https:' + src : src).host;
    if (!ALLOWED_HOSTS.has(host)) faults.push(`${page} loads a script from ${host}: ${src}`); else console.log(`    script from our own host: ${src}`);
  }
  for (const m of html.matchAll(/<link[^>]*\shref\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    const href = m[1]; if (!/^(https?:)?\/\//i.test(href) || !/stylesheet|preload|modulepreload/i.test(m[0])) continue;
    const host = new URL(href.startsWith('//') ? 'https:' + href : href).host;
    if (!ALLOWED_HOSTS.has(host)) faults.push(`${page} loads a stylesheet from ${host}: ${href}`);
  }
  if (/@import\s+url\(\s*["']?https?:/i.test(html)) warnings.push(`${page} has a CSS @import from another site`);
  // Every relative file the page fetches or links to must be served.
  const refs = new Set();
  for (const m of html.matchAll(/fetch\(\s*[`'"]\.\/([^`'"$?]+)[`'"?]/g)) refs.add(m[1]);
  for (const m of html.matchAll(/href="\.\/([^"?#]+)/g)) refs.add(m[1]);
  for (const ref of [...refs].sort()) {
    if (ref.includes('${')) continue; // a template, checked through the DATA list
    const res = await head(ref);
    console.log(`    ${judge(ref, res, ref.endsWith('.md') && ref.startsWith('LINES') ? Infinity : ref.endsWith('.html') ? PAGE_MAX : DATA_MAX)}`);
    if (ref === 'LINES.md' && res.size > DATA_MAX) warnings.push(`LINES.md is ${kb(res.size)}: linked with a size warning, never as a first step`);
  }
}
console.log('  data files the pages read:');
for (const d of DATA) console.log(`    ${judge(d, await head(d), DATA_MAX)}`);
for (const w of warnings) console.log(`  warning: ${w}`);
for (const f of faults) console.log(`  FAULT: ${f}`);
console.log(faults.length ? `  ${faults.length} fault(s): a reader on a phone would hit an error.` : '  Every page and file is served from our own site.');
process.exitCode = faults.length ? 1 : 0; // not process.exit(): on Windows that races an open fetch socket
