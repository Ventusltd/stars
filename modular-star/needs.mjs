// What a block genuinely needs from outside itself.
// The family scan (lib.mjs) lists every name a function uses without defining it. Most of those are browser
// built-ins, names the block's own files declare elsewhere, or words read from comments and strings. This module
// reads the files a block copies and sorts each name with the rules shared with code-generator (needs-rules.mjs),
// so the table and the generator agree. Only missing, library and block are needs a reader must supply.
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { classify, inferType, usageIn, PLAIN, LIBRARIES } from './needs-rules.mjs';

export const REQUIRED = new Set(['missing', 'library', 'block']);
export const ORDER = ['missing', 'library', 'block', 'absent', 'defined', 'word', 'browser', 'node'];

// The text of one copied file: from the scan's clone (git objects, no checkout) when present, else from GitHub.
export async function readFile(file, work) {
  if (work) {
    const dir = path.join(work, file.repo.replace('/', '__'));
    try { return execFileSync('git', ['-C', dir, 'show', `${file.commit}:${file.path}`], { encoding: 'utf8', maxBuffer: 8 << 20, stdio: ['ignore', 'pipe', 'ignore'] }); } catch {}
  }
  try { const r = await fetch(`https://raw.githubusercontent.com/${file.repo}/${file.commit}/${file.path}`); return r.ok ? await r.text() : null; } catch { return null; }
}

// In an HTML file only the script bodies are code; the markup is blanked (newlines kept, so line numbers hold),
// otherwise every word of the page text would read as a name the block uses.
export const scriptsOnly = html => { let out = html.replace(/[^\n]/g, ' '); html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, (m, body, at) => { const start = at + m.indexOf(body); out = out.slice(0, start) + body + out.slice(start + body.length); return m; }); return out; };

export async function readFiles(files, work) {
  const texts = await Promise.all(files.map(async f => { const text = await readFile(f, work); return typeof text === 'string' && /\.html?$/i.test(f.path) ? { path: f.path, text: scriptsOnly(text), raw: text } : { path: f.path, text }; }));
  return texts.filter(t => typeof t.text === 'string');
}

// Usage of one name across the block's files: declared if any file declares it, used as code if any file does,
// mentioned if it appears only in comments, strings or page text. Null when no file contains it at all.
export function usageAcross(name, texts) {
  let out = null;
  const word = new RegExp(`(?<![\\w$])${name.replace(/[$]/g, '\\$')}(?![\\w$])`);
  for (const { path: p, text, raw } of texts) {
    const u = usageIn(name, text, /\.py$/i.test(p)) || (raw && word.test(raw) ? { used: false, mentioned: true } : null);
    if (!u) continue;
    if (!out) { out = { used: false, declared: false, mentioned: false, how: null, line: null, file: null }; }
    if (u.used && !out.used) { out.used = true; out.how = u.how; out.line = u.line; out.file = p; }
    if (u.declared) out.declared = true;
    if (u.mentioned) out.mentioned = true;
  }
  return out;
}

// Sort every name. `definersOf(name)` returns the other blocks that define it ([{ symbol, title }]);
// `words` is the table's plain-language dictionary for names (blocks-catalogue.json needs_words).
export function classifyNeeds(names, texts, { definersOf = () => [], words = {} } = {}) {
  return names.map(name => {
    const definers = definersOf(name);
    const usage = texts.length ? (usageAcross(name, texts) || { used: false, mentioned: false, declared: false }) : null;
    const cls = classify(name, { definers, usage });
    const d = { name, class: cls, meaning: '' };
    if (cls === 'library') d.meaning = LIBRARIES[name];
    else if (cls === 'block') { d.block = definers[0].symbol; d.blocks = definers.map(x => x.symbol); d.meaning = `defined by block ${definers[0].symbol} ${definers[0].title}`; }
    else if (cls === 'missing') d.meaning = words[name] ? `${words[name]}; to be written` : `${inferType(name, usage?.how)} to be written`;
    else d.meaning = words[name] && (cls === 'browser' || cls === 'node') ? `${words[name]}: ${PLAIN[cls]}` : PLAIN[cls];
    if (usage?.used) { d.how = usage.how; d.file = usage.file; d.line = usage.line; }
    return d;
  }).sort((a, b) => ORDER.indexOf(a.class) - ORDER.indexOf(b.class) || a.name.localeCompare(b.name, 'en'));
}

export const counts = detail => Object.fromEntries(ORDER.map(c => [c, detail.filter(d => d.class === c).length]).filter(([, n]) => n));
