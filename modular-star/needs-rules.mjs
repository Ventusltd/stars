// Vendored from Ventusltd/code-generator rules.mjs at commit 5211a89 (2026-09-14). Keep byte-identical below this header
// so the periodic table (this repository) and the app generator sort every need into the same eight classes:
// browser, node, library, block, defined, word, absent, missing. A change belongs in code-generator first; then copy it here.

// Rules shared by the generator (Node) and the picker (browser): what a "need" is, and what to do about it.
// A need is a name a block uses but does not define. The periodic table lists them; these rules sort them:
//   browser   — the web browser provides it (document, fetch, Blob …): nothing to write, the assembly page checks it
//   node      — Node.js provides it (Buffer, process …): the file is a Node script, not a page part
//   library   — a known third-party library global (maplibregl …): a script tag supplies it; raised as a work order
//   block     — another block of the table defines it: add that block rather than write anything
//   defined   — the copied files declare it themselves (a parameter or local the table's scan mistook): nothing to do
//   word      — appears only in comments or prose, never as code: not a need
//   missing   — used as code, defined nowhere: a value or function to be written; an input on the page, a work order
export const BROWSER = new Set(('window document navigator location history localStorage sessionStorage indexedDB caches screen devicePixelRatio innerWidth innerHeight ' +
  'fetch Request Response Headers Blob File FileReader FileList URL URLSearchParams FormData Worker SharedWorker XMLHttpRequest WebSocket EventSource BroadcastChannel MessageChannel ' +
  'Event CustomEvent EventTarget ErrorEvent MessageEvent MouseEvent PointerEvent TouchEvent KeyboardEvent WheelEvent DragEvent InputEvent FocusEvent PopStateEvent HashChangeEvent StorageEvent ' +
  'MutationObserver ResizeObserver IntersectionObserver PerformanceObserver performance requestAnimationFrame cancelAnimationFrame requestIdleCallback cancelIdleCallback ' +
  'setTimeout setInterval clearTimeout clearInterval queueMicrotask structuredClone atob btoa crypto alert confirm prompt getComputedStyle matchMedia scrollTo scrollBy open close focus blur print postMessage addEventListener removeEventListener dispatchEvent ' +
  'createImageBitmap ImageBitmap ImageCapture Image Audio Video HTMLElement HTMLImageElement HTMLCanvasElement HTMLInputElement Element Node NodeList DocumentFragment DOMParser XMLSerializer Range Selection DOMRect Path2D CanvasRenderingContext2D OffscreenCanvas ' +
  'CompressionStream DecompressionStream ReadableStream WritableStream TransformStream TextEncoder TextDecoder AbortController AbortSignal ' +
  'Notification MediaRecorder MediaStream AudioContext ClipboardItem ServiceWorker Cache Storage CSS customElements WebAssembly SharedArrayBuffer ' +
  'console Intl JSON Math Date Promise Map Set WeakMap WeakSet WeakRef Symbol Proxy Reflect Array Object String Number Boolean RegExp Error TypeError RangeError SyntaxError BigInt ArrayBuffer DataView ' +
  'Uint8Array Uint16Array Uint32Array Int8Array Int16Array Int32Array Float32Array Float64Array globalThis self parent top frames isNaN isFinite parseInt parseFloat encodeURIComponent decodeURIComponent encodeURI decodeURI undefined NaN Infinity').split(/\s+/));
export const NODE = new Set('Buffer process require module exports __dirname __filename global setImmediate clearImmediate'.split(' '));
export const LIBRARIES = { maplibregl: 'MapLibre GL JS, the map library', mapboxgl: 'Mapbox GL JS', L: 'Leaflet', d3: 'D3', THREE: 'three.js', duckdb: 'DuckDB-Wasm', Chart: 'Chart.js', Papa: 'PapaParse', JSZip: 'JSZip', pako: 'pako', turf: 'Turf.js', proj4: 'proj4', Vue: 'Vue', React: 'React', ReactDOM: 'ReactDOM', jQuery: 'jQuery', $: 'jQuery', mermaid: 'Mermaid', Plotly: 'Plotly', Cesium: 'Cesium', ol: 'OpenLayers' };

// English function words and prose that the table's scan sometimes reads as names. Never a need.
export const WORDS = new Set('a an and the is are was were be been has have had not no that this these those it its until then than when where which who what why how seen first last never again actually genuinely leave leaves produced stranded visible outcome arrival into from with for of to in on at by as or if else so do does did can could may might must shall should will would there here also only just very more most such each every all any some'.split(' '));

// Sort one need. `usage` is what the generator found in the copied files ({ used, declared, how, line, mentioned }); the picker has no files, so it passes null.
export function classify(name, { definers = [], usage = null } = {}) {
  if (BROWSER.has(name)) return 'browser';
  if (NODE.has(name)) return 'node';
  if (name in LIBRARIES) return 'library';
  if (definers.length) return 'block';
  if (usage) { if (usage.declared) return 'defined'; if (WORDS.has(name)) return 'word'; if (!usage.used) return usage.mentioned ? 'word' : 'absent'; return 'missing'; }
  // No files to look at: a plain lowercase dictionary-looking word is prose, anything with capitals, digits or underscores is a name.
  return WORDS.has(name) || /^[a-z]{1,12}$/.test(name) ? 'word' : 'missing';
}

export const PLAIN = {
  browser: 'provided by the web browser', node: 'provided by Node.js, not by a web page', library: 'a library a script tag must supply',
  block: 'defined by another block of the table: add it', defined: 'declared inside the copied files; nothing to write', word: 'a word from comments or text, not code',
  absent: 'not in the copied files; the table saw it in another version of the block', missing: 'used but defined nowhere: to be written'
};

// Guess a type from how a name is used: `new X(` a class, `X(` a function, `X.` or `X[` an object, ALL_CAPS a constant.
export function inferType(name, how) {
  if (name in LIBRARIES) return 'library (global object)';
  if (how === 'new') return 'class';
  if (how === 'call') return 'function';
  if (how === 'member') return 'object';
  if (/^[A-Z][A-Z0-9_]+$/.test(name)) return /_ID$|_CLASS$|_KEY$|_NAME$|_URL$|_PATH$/.test(name) ? 'constant (string)' : 'constant';
  return 'value';
}

// Blank out comments and string literals (newlines kept, so line numbers hold) so prose does not count as code. Rough by design.
const blank = m => m.replace(/[^\n]/g, ' ');
export function stripComments(text, isPython) {
  if (isPython) return text.replace(/"""[\s\S]*?"""|'''[\s\S]*?'''/g, blank).replace(/(^|[^\\])#.*$/gm, '$1').replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, blank);
  return text.replace(/\/\*[\s\S]*?\*\//g, blank).replace(/(^|[^:\\'"`])\/\/.*$/gm, '$1').replace(/`(?:[^`\\]|\\.)*`/g, blank).replace(/"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, blank);
}

// Where and how a name is used in one file (comments and strings removed). Returns { mentioned } when it appears only in prose, null when absent.
export function usageIn(name, text, isPython) {
  const code = stripComments(text, isPython);
  const esc = name.replace(/[$]/g, '\\$');
  const id = new RegExp(`(?<![\\w$.])${esc}(?![\\w$])`);
  const viaWindow = new RegExp(`\\b(?:window|globalThis|self)\\.${esc}(?![\\w$])`);
  const lines = code.split('\n');
  let first = -1;
  for (let i = 0; i < lines.length; i++) if (id.test(lines[i]) || viaWindow.test(lines[i])) { first = i + 1; break; }
  if (first < 0) return new RegExp(`(?<![\\w$])${esc}(?![\\w$])`).test(text) ? { used: false, mentioned: true } : null;
  const declared = new RegExp(`\\b(?:const|let|var|function|class|def|import)\\s+(?:\\*\\s+as\\s+)?${esc}(?![\\w$])|(?<![\\w$.])${esc}\\s*=[^=>]|\\(([^()]*(?<![\\w$.])${esc}(?![\\w$])[^()]*)\\)\\s*(?:=>|\\{|:|->)|(?<![\\w$.])${esc}\\s*=>|\\{[^{}]*(?<![\\w$.])${esc}(?![\\w$])[^{}]*\\}\\s*=[^=]|\\bfor\\s*\\(\\s*(?:const|let|var)?\\s*${esc}\\b|\\bfor\\s+${esc}\\s+in\\b|\\bcatch\\s*\\(\\s*${esc}\\s*\\)|\\bas\\s+${esc}(?![\\w$])`).test(code);
  const how = new RegExp(`\\bnew\\s+${esc}\\s*\\(`).test(code) ? 'new' : new RegExp(`(?<![\\w$.])${esc}\\s*\\(`).test(code) ? 'call' : new RegExp(`(?<![\\w$.])${esc}\\s*[.\\[]`).test(code) ? 'member' : 'value';
  return { used: true, declared, how, line: first };
}
