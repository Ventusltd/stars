// Fails if any number from the previous database changed meaning or disappeared.
// Usage: node modular-star/check-permanent.mjs before.sqlite after.sqlite
import { DatabaseSync } from 'node:sqlite';
const [before, after] = process.argv.slice(2);
const db = new DatabaseSync(after);
db.prepare('ATTACH DATABASE ? AS old').run(before);
let bad = 0;
for (const [table, key] of [['line', 'sha'], ['tablet', 'git_blob'], ['family', 'sha'], ['element', 'sha']]) {
  const r = db.prepare(`SELECT count(*) c, (SELECT count(*) FROM old.${table}) total FROM old.${table} o LEFT JOIN main.${table} m ON m.n = o.n AND m.${key} = o.${key} WHERE m.n IS NULL`).get();
  console.log(`${table}: ${r.total} earlier numbers, ${r.c} changed or missing`);
  bad += Number(r.c);
}
if (bad) { console.error('Permanent numbers were broken; refusing to save this database.'); process.exit(1); }
