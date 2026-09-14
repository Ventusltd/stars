#!/usr/bin/env node
// decision-record.mjs — turns a GitHub issue made from the Decision form into decisions/dNNN.json.
//
// Reads the issue body (the form renders as "### Field" headings followed by the answer), takes the next free
// number in decisions/ (never reused), writes the record in the shape of decisions/SCHEMA.md and prints its path.
// Run by .github/workflows/decisions.yml. Usage:
//   ISSUE_BODY="..." ISSUE_NUMBER=12 ISSUE_URL=https://github.com/... node modular-star/decision-record.mjs --out .
// Or for a dry run from a file:  node modular-star/decision-record.mjs --body body.md --out /tmp/x
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const ROOT = opt('--out') || '.';
const body = opt('--body') ? readFileSync(opt('--body'), 'utf8') : process.env.ISSUE_BODY || '';
const issue = Number(process.env.ISSUE_NUMBER) || null;
const issueUrl = process.env.ISSUE_URL || null;

// ---------- parse the form ----------
const fields = {};
for (const m of body.matchAll(/^###\s+(.+?)\s*\r?\n([\s\S]*?)(?=^###\s|\s*$(?![\s\S]))/gm)) {
  const v = m[2].trim();
  fields[m[1].trim().toLowerCase()] = v === '_No response_' || v === 'None' ? '' : v;
}
const get = (...names) => { for (const n of names) if (fields[n] !== undefined && fields[n] !== '') return fields[n]; return ''; };

const record = get('record').toLowerCase();
const status = /open question/.test(record) ? 'open' : 'decided';
const typeWord = get('subject type').toLowerCase();
const type = /pair/.test(typeWord) ? 'pair' : /family/.test(typeWord) ? 'family' : /constant/.test(typeWord) ? 'constant' : 'block';

// The subject key dropdown shows "Ek · Earth km" or "family:511"; the free-text box wins when filled.
let key = get('subject key (if not in the list)', 'subject key (other)') || get('subject key');
key = key.split('·')[0].trim();
if (/^\d+$/.test(key)) key = `family:${key}`;
if (type === 'pair') key = key.split(/\s*[+,]\s*/).map((k) => (/^[A-Za-z]/.test(k) && !k.includes(':') ? `block:${k}` : k)).join('+');
else if (key && !key.includes(':')) key = `${type === 'family' ? 'family' : 'block'}:${key}`;
if (!key) { console.error('No subject key in the issue; nothing written.'); process.exit(1); }

const question = get('question');
const decision = status === 'open' ? '' : get('decision');
const rationale = get('rationale', 'why');
const evidence = get('evidence').split(/\r?\n/).map((s) => s.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
const supersedes = (get('supersedes').match(/d\d{3,}/) || [])[0] || null;
const agentsMay = get('what agents may now do', 'consequences').split(/\r?\n/).map((s) => s.replace(/^[-*]\s*/, '').trim()).filter(Boolean);
if (!question) { console.error('No question in the issue; nothing written.'); process.exit(1); }
if (status === 'decided' && !decision) { console.error('Marked as a decision but the decision is empty; nothing written.'); process.exit(1); }

// ---------- next number, never reused ----------
const dir = join(ROOT, 'decisions');
mkdirSync(dir, { recursive: true });
const used = readdirSync(dir).map((f) => (f.match(/^d(\d{3,})\.json$/) || [])[1]).filter(Boolean).map(Number);
const id = `d${String((used.length ? Math.max(...used) : 0) + 1).padStart(3, '0')}`;
const keys = key.split('+');

const out = {
  id,
  subject: { type, key },
  question, decision, rationale, evidence,
  date: new Date().toISOString().slice(0, 10),
  status,
  ...(supersedes ? { supersedes } : {}),
  consequences: { settles: status === 'decided' ? keys : [], agents_may: agentsMay },
  ...(issue ? { source: { issue, url: issueUrl } } : {}),
};
const path = join(dir, `${id}.json`);
if (existsSync(path)) { console.error(`${path} already exists; refusing to overwrite.`); process.exit(1); }
writeFileSync(path, JSON.stringify(out, null, 2) + '\n');

// Mark the superseded record, if it is here.
if (supersedes && existsSync(join(dir, `${supersedes}.json`))) {
  const old = JSON.parse(readFileSync(join(dir, `${supersedes}.json`), 'utf8'));
  if (old.status !== 'superseded') { old.status = 'superseded'; old.superseded_by = id; old.date = out.date; writeFileSync(join(dir, `${supersedes}.json`), JSON.stringify(old, null, 2) + '\n'); }
}
console.log(`decisions/${id}.json`);
if (process.env.GITHUB_OUTPUT) writeFileSync(process.env.GITHUB_OUTPUT, `id=${id}\npath=decisions/${id}.json\nstatus=${status}\nkey=${key}\n`, { flag: 'a' });
