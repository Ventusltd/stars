// Audit of "needs": the names functions need from outside their own file, across every family record in code/f/*.json.
// Lists the most common names, marks the ones that are browser or Node built-ins (candidates for the known-globals
// list in modular-star/lib.mjs) and the ones with no plain-words entry in modular-star/blocks-catalogue.json.
// Reports only; edits nothing. Usage: node tools/needs-audit.mjs [--live] [--top 60]
// --live reads the published files from GitHub Pages instead of the local checkout. Exits 1 only if the records cannot be read.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const TOP = Number(arg('top', 60)), live = process.argv.includes('--live');
const SITE = 'https://ventusltd.github.io/stars/';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// What lib.mjs already ignores, read from its source so the list is never copied by hand.
const libSrc = readFileSync(path.join(root, 'modular-star', 'lib.mjs'), 'utf8');
const globalsSrc = libSrc.slice(libSrc.indexOf('const GLOBALS'), libSrc.indexOf('.split', libSrc.indexOf('const GLOBALS')));
const KNOWN = new Set(globalsSrc.replace(/\/\/[^\n]*/g, '').match(/'([^']*)'/g).flatMap(s => s.slice(1, -1).split(' ')).filter(Boolean));
const words = JSON.parse(readFileSync(path.join(root, 'modular-star', 'blocks-catalogue.json'), 'utf8')).needs_words || {};

// Built-ins: everything Node 24 puts on globalThis, plus the browser names a page always has.
const NODE = new Set(Object.getOwnPropertyNames(globalThis).concat(['require', 'module', 'exports', '__dirname', '__filename']));
const BROWSER = new Set(('window document navigator location localStorage fetch CSS customElements DOMException DOMRect DOMRectReadOnly Range Selection Text Comment DocumentFragment NodeFilter NodeList ' +
  'Option Notification AudioContext MediaRecorder MediaStream MediaSource SpeechSynthesisUtterance speechSynthesis Geolocation WebAssembly eval arguments escape unescape ' +
  'CanvasRenderingContext2D WebGLRenderingContext WebGL2RenderingContext ImageBitmapRenderingContext SVGElement Animation KeyframeEffect ClipboardItem clipboard ' +
  'scrollTo scrollBy scrollX scrollY innerWidth innerHeight outerWidth outerHeight pageXOffset pageYOffset opener ' +
  'addEventListener removeEventListener dispatchEvent postMessage visualViewport styleMedia onload onerror onresize onhashchange onpopstate ' +
  'setImmediate clearImmediate reportError isSecureContext crossOriginIsolated').split(' '));
// Window properties that are also everyday variable names (status, name, open, close, top, parent, origin, event) are left out on purpose:
// as needs they almost always mean a real variable the file lacks, and the known-globals list must not hide those.
const looksBuiltIn = n => NODE.has(n) || BROWSER.has(n) || /^(HTML|SVG|DOM|CSS|Web|RTC|Media|Audio|Speech|Canvas|WebGL|Intl|Geo|Performance|Idle|Payment|Push|Service|Shared|Broadcast|Message|Storage|Text|Trusted|Screen|Window|Worker|Xml|XML|USB|Bluetooth|Gamepad|Sensor|Presentation|Credential|Navigator|Location)[A-Z]/.test(n) || /[a-z](Event|Element|Observer|Error|Stream|Registry|Node|Worker|Channel)$/.test(n);

// ---- read every family record
let records = [];
try {
  if (live) {
    const index = await (await fetch(SITE + 'code/index.json', { cache: 'no-store' })).json();
    for (const b of index.buckets) records.push(...Object.values(await (await fetch(`${SITE}code/f/${b}.json`, { cache: 'no-store' })).json()));
  } else {
    const dir = path.join(root, 'code', 'f');
    if (!existsSync(dir)) throw new Error('code/f is not in this checkout: run the build or pass --live');
    for (const f of readdirSync(dir)) records.push(...Object.values(JSON.parse(readFileSync(path.join(dir, f), 'utf8'))));
  }
} catch (e) { console.log(`Cannot read the family records: ${e.message}`); process.exitCode = 1; records = null; }
if (!records) { /* nothing to audit */ } else {

const outside = new Map(), inside = new Map(), stand = new Map();
let withNeeds = 0;
for (const r of records) {
  if (r.needs?.length) withNeeds++;
  for (const n of r.needs || []) outside.set(n, (outside.get(n) || 0) + 1);
  for (const n of r.needs_in_function || []) inside.set(n, (inside.get(n) || 0) + 1);
  if (r.standalone) stand.set('yes', (stand.get('yes') || 0) + 1);
}
const top = [...outside].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, TOP);
// A built-in that already has plain words (document, window, fetch...) is a deliberate need: a copied file really does need a page.
const builtins = top.filter(([n]) => looksBuiltIn(n) && !KNOWN.has(n) && !words[n]);
const alreadyKnown = [...outside].filter(([n]) => KNOWN.has(n));
const wordless = top.filter(([n]) => !looksBuiltIn(n) && !words[n]);

console.log(`Needs audit (${live ? 'published' : 'local'} records): ${records.length} families, ${withNeeds} need something from outside their file, ${stand.get('yes') || 0} self-contained.`);
console.log(`${outside.size} distinct names needed outside the file; ${inside.size} distinct names needed inside the function (before the file's own declarations are subtracted).\n`);
console.log(`Top ${top.length} names needed outside the file (families · name · marks):`);
for (const [n, c] of top) {
  const marks = [];
  if (KNOWN.has(n)) marks.push('in the known-globals list already (record older than the list)');
  else if (looksBuiltIn(n) && !words[n]) marks.push('built-in: candidate for the known-globals list');
  if (words[n]) marks.push(`plain words: "${words[n]}"`);
  else if (!looksBuiltIn(n)) marks.push('no plain words');
  console.log(`  ${String(c).padStart(5)}  ${n.padEnd(28)} ${marks.join(' · ')}`);
}
console.log(`\nCandidates for the known-globals list in modular-star/lib.mjs (${builtins.length}): ${builtins.map(([n, c]) => `${n} (${c})`).join(', ') || 'none'}`);
console.log(`Candidates for plain words in modular-star/blocks-catalogue.json (${wordless.length}): ${wordless.map(([n, c]) => `${n} (${c})`).join(', ') || 'none'}`);
if (alreadyKnown.length) console.log(`Names in the known-globals list that still appear as needs (${alreadyKnown.length}): ${alreadyKnown.map(([n, c]) => `${n} (${c})`).join(', ')}.\n` +
  'An element\'s needs are stored when it is first numbered and never recomputed (lib.mjs ingestFile: a known file version is not re-read; INSERT OR IGNORE on element), so a change to the list reaches only file versions seen after it. Clearing these takes a one-off pass that re-derives needs for existing elements; it changes no number.');
}
