// Modular star — shared logic.
// Every unique line gets a permanent number. A file version is a tablet: the ordered list of its line
// numbers. Functions and classes inside tablets become numbered elements; elements with the same
// logic (ignoring layout and comments) share a numbered family. Numbers are never reused or changed.
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as acorn from 'acorn';
import * as loose from 'acorn-loose';
import * as walk from 'acorn-walk';

export const MIN_LINES = 3;
export const MAX_ANALYSE_LINES = 400;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const decoder = new TextDecoder('utf-8', { ignoreBOM: true });

export const sha256 = b => createHash('sha256').update(b).digest();
export const gitBlobId = bytes => createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex');

export function langOf(p) {
  const ext = path.extname(p).toLowerCase();
  if (['.js', '.mjs', '.cjs'].includes(ext)) return 'js';
  if (['.html', '.htm'].includes(ext)) return 'html';
  if (ext === '.py') return 'py';
  return null;
}

export const SCHEMA = `
CREATE TABLE IF NOT EXISTS line(n INTEGER PRIMARY KEY AUTOINCREMENT, sha BLOB UNIQUE NOT NULL, text BLOB NOT NULL);
CREATE TABLE IF NOT EXISTS tablet(n INTEGER PRIMARY KEY AUTOINCREMENT, git_blob TEXT UNIQUE NOT NULL, lang TEXT, lines BLOB NOT NULL, issue TEXT);
CREATE TABLE IF NOT EXISTS family(n INTEGER PRIMARY KEY AUTOINCREMENT, sha BLOB UNIQUE NOT NULL, lang TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS element(n INTEGER PRIMARY KEY AUTOINCREMENT, sha BLOB UNIQUE NOT NULL, family INTEGER NOT NULL, kind TEXT, needs TEXT, standalone INTEGER);
CREATE TABLE IF NOT EXISTS tablet_element(tablet INTEGER NOT NULL, element INTEGER NOT NULL, first INTEGER NOT NULL, last INTEGER NOT NULL, col0 INTEGER, col1 INTEGER, name TEXT, PRIMARY KEY(tablet, element, first));
CREATE TABLE IF NOT EXISTS occurrence(repo TEXT NOT NULL, commit_sha TEXT NOT NULL, path TEXT NOT NULL, tablet INTEGER NOT NULL, seen_utc TEXT NOT NULL, PRIMARY KEY(repo, commit_sha, path));
CREATE TABLE IF NOT EXISTS scan(repo TEXT PRIMARY KEY, commit_sha TEXT, branch TEXT, scanned_utc TEXT, files INTEGER, skipped INTEGER, issue TEXT);
CREATE INDEX IF NOT EXISTS te_element ON tablet_element(element);
CREATE INDEX IF NOT EXISTS occ_tablet ON occurrence(tablet);
CREATE INDEX IF NOT EXISTS element_family ON element(family);
`;

export function openDb(file) {
  const db = new DatabaseSync(file);
  db.exec(SCHEMA);
  const q = sql => db.prepare(sql);
  return {
    db,
    insLine: q('INSERT OR IGNORE INTO line(sha, text) VALUES(?, ?)'),
    getLine: q('SELECT n FROM line WHERE sha = ?'),
    getTablet: q('SELECT n FROM tablet WHERE git_blob = ?'),
    insTablet: q('INSERT INTO tablet(git_blob, lang, lines, issue) VALUES(?, ?, ?, ?)'),
    insOcc: q('INSERT OR IGNORE INTO occurrence(repo, commit_sha, path, tablet, seen_utc) VALUES(?, ?, ?, ?, ?)'),
    insFamily: q('INSERT OR IGNORE INTO family(sha, lang) VALUES(?, ?)'),
    getFamily: q('SELECT n FROM family WHERE sha = ?'),
    insElement: q('INSERT OR IGNORE INTO element(sha, family, kind, needs, standalone) VALUES(?, ?, ?, ?, ?)'),
    getElement: q('SELECT n FROM element WHERE sha = ?'),
    insTE: q('INSERT OR IGNORE INTO tablet_element(tablet, element, first, last, col0, col1, name) VALUES(?, ?, ?, ?, ?, ?, ?)'),
    lineCache: new Map(),
  };
}

// Split bytes into physical lines, each keeping its own line ending, so a tablet rebuilds exactly.
export function splitLines(bytes) {
  const out = [];
  let start = 0;
  for (let i = 0; i < bytes.length; i++) if (bytes[i] === 0x0a) { out.push(bytes.subarray(start, i + 1)); start = i + 1; }
  if (start < bytes.length) out.push(bytes.subarray(start));
  return out;
}
const pack = nums => { const b = Buffer.alloc(nums.length * 4); nums.forEach((n, i) => b.writeUInt32LE(n, i * 4)); return b; };
export const unpack = blob => { const b = Buffer.from(blob); const out = []; for (let i = 0; i < b.length; i += 4) out.push(b.readUInt32LE(i)); return out; };

function lineNumber(ctx, bytes) {
  const sha = sha256(bytes), key = sha.toString('hex');
  let n = ctx.lineCache.get(key);
  if (n === undefined) {
    ctx.insLine.run(sha, bytes);
    n = Number(ctx.getLine.get(sha).n);
    ctx.lineCache.set(key, n);
  }
  return n;
}

export function rebuildTablet(ctx, tabletN) {
  const row = ctx.db.prepare('SELECT lines FROM tablet WHERE n = ?').get(tabletN);
  const get = ctx.db.prepare('SELECT text FROM line WHERE n = ?');
  return Buffer.concat(unpack(row.lines).map(n => Buffer.from(get.get(n).text)));
}

// Exact source of an element occurrence (the node itself, not its whole lines).
export function elementSource(ctx, te) {
  const row = ctx.db.prepare('SELECT lines FROM tablet WHERE n = ?').get(te.tablet);
  const get = ctx.db.prepare('SELECT text FROM line WHERE n = ?');
  const nums = unpack(row.lines).slice(te.first - 1, te.last);
  const lines = nums.map(n => decoder.decode(Buffer.from(get.get(n).text)));
  if (lines.length === 1) return lines[0].slice(te.col0, te.col1);
  return lines[0].slice(te.col0) + lines.slice(1, -1).join('') + lines.at(-1).slice(0, te.col1);
}

const GLOBALS = new Set(('undefined NaN Infinity globalThis Object Function Array Number parseFloat parseInt Boolean String Symbol Date Promise RegExp ' +
  'Error AggregateError EvalError RangeError ReferenceError SyntaxError TypeError URIError JSON Math Intl ArrayBuffer SharedArrayBuffer DataView ' +
  'Atomics Uint8Array Int8Array Uint16Array Int16Array Uint32Array Int32Array Float32Array Float64Array Uint8ClampedArray BigInt64Array ' +
  'BigUint64Array BigInt Map Set WeakMap WeakSet WeakRef FinalizationRegistry Proxy Reflect isFinite isNaN encodeURI encodeURIComponent decodeURI ' +
  'decodeURIComponent structuredClone queueMicrotask setTimeout clearTimeout setInterval clearInterval console TextEncoder TextDecoder URL ' +
  'URLSearchParams AbortController AbortSignal').split(' '));

function tokenKey(text) {
  try {
    const toks = [];
    for (const t of acorn.tokenizer(text, { ecmaVersion: 'latest', allowHashBang: true })) {
      const v = t.value && typeof t.value === 'object' ? `/${t.value.pattern}/${t.value.flags}` : (t.value ?? '');
      toks.push(t.type.label + ':' + v);
    }
    return toks.join('\u0001');
  } catch {
    return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').replace(/\s+/g, '');
  }
}

function patternNames(p, into) {
  if (!p) return;
  switch (p.type) {
    case 'Identifier': into.add(p.name); break;
    case 'ObjectPattern': for (const q of p.properties) patternNames(q.type === 'RestElement' ? q.argument : q.value, into); break;
    case 'ArrayPattern': for (const e of p.elements) patternNames(e, into); break;
    case 'AssignmentPattern': patternNames(p.left, into); break;
    case 'RestElement': patternNames(p.argument, into); break;
  }
}

// What a function needs from outside itself. Empty needs + no `this` = a standalone library candidate.
function analyse(fn) {
  const isClass = fn.type.startsWith('Class');
  const declared = new Set(isClass || fn.type === 'ArrowFunctionExpression' ? [] : ['arguments']);
  const used = new Set();
  let usesThis = false, incomplete = false;
  if (fn.id) declared.add(fn.id.name);
  for (const p of fn.params || []) patternNames(p, declared);
  walk.fullAncestor(fn, (n, _s, anc) => {
    const parent = anc[anc.length - 2];
    switch (n.type) {
      case 'VariableDeclarator': patternNames(n.id, declared); break;
      case 'FunctionDeclaration': case 'FunctionExpression': case 'ArrowFunctionExpression':
        if (n.id) declared.add(n.id.name);
        for (const p of n.params) patternNames(p, declared);
        if (n.type !== 'ArrowFunctionExpression') declared.add('arguments');
        break;
      case 'ClassDeclaration': case 'ClassExpression': if (n.id) declared.add(n.id.name); break;
      case 'CatchClause': patternNames(n.param, declared); break;
      case 'ThisExpression': case 'Super': if (!isClass) usesThis = true; break;
      case 'MetaProperty': usesThis = true; break;
      case 'Identifier': {
        if (n.name === '✖') { incomplete = true; break; }
        if (!parent) break;
        if (parent.type === 'MemberExpression' && parent.property === n && !parent.computed) break;
        if (['Property', 'MethodDefinition', 'PropertyDefinition'].includes(parent.type) && parent.key === n && !parent.computed && !parent.shorthand) break;
        if (['LabeledStatement', 'BreakStatement', 'ContinueStatement', 'ExportSpecifier', 'ImportSpecifier'].includes(parent.type)) break;
        used.add(n.name);
      }
    }
  });
  const needs = [...used].filter(x => !declared.has(x) && !GLOBALS.has(x)).sort();
  return { needs, usesThis, incomplete };
}

function nameOf(node, parent, src) {
  if (node.id?.name) return node.id.name;
  if (!parent) return '(anonymous)';
  if (parent.type === 'VariableDeclarator' && parent.id.type === 'Identifier') return parent.id.name;
  if (['Property', 'MethodDefinition', 'PropertyDefinition'].includes(parent.type)) return parent.key.name ?? String(parent.key.value ?? '(computed)');
  if (parent.type === 'AssignmentExpression') return src.slice(parent.left.start, parent.left.end).slice(0, 60);
  if (parent.type === 'ExportDefaultDeclaration') return 'default';
  return '(anonymous)';
}

// lineOffset/colOffset place a script embedded in HTML back onto the file's own lines.
export function extractJs(src, lineOffset = 0, colOffset = 0) {
  let ast;
  const opts = { ecmaVersion: 'latest', locations: true, allowHashBang: true, allowReturnOutsideFunction: true, allowAwaitOutsideFunction: true };
  try { ast = acorn.parse(src, { ...opts, sourceType: 'module' }); }
  catch { try { ast = acorn.parse(src, { ...opts, sourceType: 'script' }); } catch { ast = loose.parse(src, opts); } }
  const out = [];
  walk.fullAncestor(ast, (node, _s, anc) => {
    if (!['FunctionDeclaration', 'FunctionExpression', 'ArrowFunctionExpression', 'ClassDeclaration', 'ClassExpression'].includes(node.type)) return;
    const first = node.loc.start.line, last = node.loc.end.line;
    if (last - first + 1 < MIN_LINES) return;
    const parent = anc[anc.length - 2];
    const isMethod = (parent?.type === 'MethodDefinition') || (parent?.type === 'Property' && (parent.method || parent.kind !== 'init')) || parent?.type === 'PropertyDefinition';
    const kind = isMethod ? 'method' : node.type.startsWith('Class') ? 'class' : node.type === 'ArrowFunctionExpression' ? 'arrow' : 'function';
    const text = src.slice(node.start, node.end);
    let needs = null, standalone = false;
    if (last - first + 1 <= MAX_ANALYSE_LINES) {
      const a = analyse(node);
      needs = a.needs;
      standalone = !isMethod && !a.usesThis && !a.incomplete && a.needs.length === 0;
    }
    out.push({
      first: first + lineOffset, last: last + lineOffset,
      col0: node.loc.start.column + (first === 1 ? colOffset : 0),
      col1: node.loc.end.column + (last === 1 ? colOffset : 0),
      kind, name: nameOf(node, parent, src), family: sha256('js\0' + tokenKey(text)), needs, standalone,
    });
  });
  return out;
}

export function extractHtml(text) {
  const out = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
  let m;
  while ((m = re.exec(text))) {
    const attrs = m[1];
    if (/\bsrc\s*=/i.test(attrs)) continue;
    const type = (attrs.match(/\btype\s*=\s*["']?([^"'\s>]+)/i) || [])[1];
    if (type && !/^(module|text\/javascript|application\/javascript)$/i.test(type)) continue;
    const bodyStart = m.index + m[0].indexOf('>') + 1;
    let lineOffset = 0;
    for (let i = 0; i < bodyStart; i++) if (text.charCodeAt(i) === 10) lineOffset++;
    const colOffset = bodyStart - (text.lastIndexOf('\n', bodyStart - 1) + 1);
    out.push(...extractJs(m[2], lineOffset, colOffset));
  }
  return out;
}

export function extractPy(bytes) {
  const py = process.env.PYTHON || (process.platform === 'win32' ? 'python' : 'python3');
  const r = spawnSync(py, [path.join(HERE, 'functions.py')], { input: bytes, maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) return { issue: 'Python helper failed: ' + String(r.stderr || r.error).slice(0, 160), functions: [] };
  const res = JSON.parse(r.stdout);
  return { issue: res.issue ?? null, functions: (res.functions || []).map(f => ({ ...f, family: Buffer.from(f.family, 'hex'), col0: null, col1: null, needs: null, standalone: false })) };
}

// Parse any supported source into functions. Refuses (with a reason) when line counting could disagree.
export function extractAny(lang, bytes) {
  const text = decoder.decode(bytes);
  if (/\r(?!\n)|\u2028|\u2029/.test(text)) return { issue: 'Unusual line breaks (lone CR or U+2028/2029); functions not extracted', functions: [] };
  try {
    if (lang === 'js') return { issue: null, functions: extractJs(text) };
    if (lang === 'html') return { issue: null, functions: extractHtml(text) };
    if (lang === 'py') return extractPy(bytes);
  } catch (e) {
    return { issue: 'Parse failed: ' + String(e.message).slice(0, 160), functions: [] };
  }
  return { issue: null, functions: [] };
}

export function ingestFile(ctx, { repo, commit, path: p, bytes, oid, seen = new Date().toISOString() }) {
  const lang = langOf(p);
  if (!lang) return null;
  oid ??= gitBlobId(bytes);
  let tablet = ctx.getTablet.get(oid)?.n;
  if (tablet === undefined) {
    const lines = splitLines(bytes);
    const nums = lines.map(l => lineNumber(ctx, l));
    const { issue, functions } = extractAny(lang, bytes);
    tablet = Number(ctx.insTablet.run(oid, lang, pack(nums), issue).lastInsertRowid);
    for (const f of functions) {
      if (f.last > lines.length) continue;
      const body = Buffer.concat(lines.slice(f.first - 1, f.last));
      ctx.insFamily.run(f.family, lang === 'html' ? 'js' : lang);
      const family = Number(ctx.getFamily.get(f.family).n);
      const esha = sha256(body);
      ctx.insElement.run(esha, family, f.kind, f.needs ? JSON.stringify(f.needs) : null, f.standalone ? 1 : 0);
      const element = Number(ctx.getElement.get(esha).n);
      ctx.insTE.run(tablet, element, f.first, f.last, f.col0, f.col1, f.name);
    }
  }
  ctx.insOcc.run(repo, commit, p, tablet, seen);
  return tablet;
}
