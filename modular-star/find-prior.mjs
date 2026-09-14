// Before writing code: does it already exist somewhere in Ventusltd?
// Usage: node modular-star/find-prior.mjs [--catalog catalog.json.gz] file [file...]
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { langOf, extractAny, splitLines, sha256 } from './lib.mjs';

const args = process.argv.slice(2);
const ci = args.indexOf('--catalog');
const catalogPath = ci >= 0 ? args.splice(ci, 2)[1] : null;
const url = 'https://github.com/Ventusltd/stars/releases/download/modular-star/catalog.json.gz';
const raw = catalogPath ? readFileSync(catalogPath) : Buffer.from(await (await fetch(url)).arrayBuffer());
const catalog = JSON.parse(gunzipSync(raw));
console.log(`Catalogue from ${catalog.generated_utc}\n`);

for (const file of args) {
  const lang = langOf(file);
  if (!lang) { console.log(`${file}: not JavaScript, HTML or Python — skipped`); continue; }
  const bytes = readFileSync(file), lines = splitLines(bytes);
  const { issue, functions } = extractAny(lang, bytes);
  console.log(`${file}${issue ? ` (${issue})` : ''}`);
  if (!functions.length) console.log('  no functions of three lines or more found');
  for (const f of functions) {
    const exact = catalog.elements[sha256(Buffer.concat(lines.slice(f.first - 1, f.last))).toString('hex')];
    const famN = exact ? exact[1] : catalog.family_by_hash[Buffer.from(f.family).toString('hex')];
    const fam = famN ? catalog.families[famN] : null;
    const where = `${f.name} (lines ${f.first}–${f.last})`;
    if (!fam) { console.log(`  new         ${where}`); continue; }
    console.log(`  ${exact ? 'SAME CODE  ' : 'SAME LOGIC '} ${where} → family #${famN}, ${fam.places.length} place(s) in ${fam.repos} repositories`);
    for (const p of fam.places.slice(0, 3)) console.log(`              ${p.link}${p.live ? `  (published: ${p.live})` : ''}`);
  }
}
