// Write LINES.md: every unique line of code in the numbered database, in number order, one row per line.
// Not a summary. Format per row: <number><tab><code>. Line endings are stripped for display (the database
// keeps them). Usage: node modular-star/lines.mjs --db modular.sqlite --out LINES.md
import { createWriteStream } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const db = new DatabaseSync(arg('db', 'modular.sqlite'), { readOnly: true });
const total = Number(db.prepare('SELECT count(*) c FROM line').get().c);
const last = Number(db.prepare('SELECT max(n) m FROM line').get().m);
const decoder = new TextDecoder('utf-8', { fatal: false });
const out = createWriteStream(arg('out', 'LINES.md'));
const write = s => new Promise(r => out.write(s) ? r() : out.once('drain', r));

await write(`# Every unique line of code — Ventusltd public repositories\n\n` +
  `${total.toLocaleString('en-GB')} unique lines, numbered 1 to ${last.toLocaleString('en-GB')}. Generated ${new Date().toISOString()} by the modular star from the ` +
  `numbered database (modular.sqlite on the modular-star release). The number is the line's permanent key: it never changes ` +
  `and is never reused. Numbers missing from the sequence were never issued. Each row is \`number<tab>code\`; the code is shown ` +
  `exactly as written, with its line ending removed (the database keeps the ending). Where a line appears, and in which files: ` +
  `the tablet and occurrence tables of the same database.\n\n` + '```text\n');
for (const row of db.prepare('SELECT n, text FROM line ORDER BY n').iterate()) {
  const text = decoder.decode(Buffer.from(row.text)).replace(/\r?\n$/, '').replace(/\r$/, '');
  await write(`${row.n}\t${text}\n`);
}
await write('```\n');
await new Promise(r => out.end(r));
console.log(`LINES.md: ${total} lines written (numbers up to ${last})`);
