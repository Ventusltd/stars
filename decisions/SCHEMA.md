# Decision records

A decision record is one small JSON file, `decisions/dNNN.json`, that attaches a judgement to a permanent key of
globalgrid2050 architecture development. The maps hold facts with permanent keys (blocks with symbols and numbers,
function families with numbers, constants with symbols); a decision record holds what was decided about one of them,
why, and what that now permits. The records are the raw material for a future assistant built from recorded
judgement, and they are the permission an agent needs before it acts on a key.

## The rules

- **Ids are permanent and append-only.** `d001`, `d002`, … The next record takes the next number. A number is never
  reused and a record is never deleted; a change of mind is a new record that *supersedes* the old one.
- **One record, one question, one subject key.** The key is one the other maps already use: a block (`block:Ss`), a
  constant (`block:Ek`; constants are blocks 1 to 12), a function family (`family:511`), or a pair of blocks
  (`block:Ek+block:Gc`).
- **Plain words.** The rationale is written for a reader, not a parser. No names of people.
- **Status says what an agent may do.** `open` is a question, `decided` is permission, `superseded` is history.

## The fields

| Field | Required | Meaning |
|---|---|---|
| `id` | yes | `dNNN`. Permanent. |
| `subject` | yes | `{ "type": "block" \| "constant" \| "family" \| "pair", "key": "<key>" }`. The key uses the map ids: `block:Ss`, `block:Ek`, `family:511`, `block:Ek+block:Gc`. |
| `also` | no | Other keys the decision touches, same id form. The graph wires the record to each. |
| `question` | yes | The question being decided, one sentence. |
| `decision` | when decided | The decision, one or two sentences. Empty string while `open`. |
| `rationale` | when decided | Why, in plain words. May be empty while `open`; may list the candidates. |
| `evidence` | no | Links: evidence packs, files, runs, issues. A list of URLs or repository paths. |
| `date` | yes | `YYYY-MM-DD`, UTC, when the record was written or the status last changed. |
| `status` | yes | `open`, `decided` or `superseded`. |
| `supersedes` | no | The `dNNN` this record replaces. The replaced record is then `superseded`. |
| `consequences` | yes | `{ "settles": [keys], "agents_may": ["plain sentence", …] }`. `settles` lists the keys this record settles (empty while open); `agents_may` says what an agent may now do without asking. |
| `source` | no | `{ "issue": N, "url": "…" }` when the record came from a GitHub issue. |

## How a record is made

- By clicks: open a GitHub issue from the **Decision** form; the `decisions` workflow writes the file, takes the next
  number, commits it and closes the issue with a link to the record. See `README.md`.
- By hand: copy `example.json`, take the next number, commit. Same result.

## How a record is read

- `modular-star/decisions.mjs` reads every `decisions/d*.json` and writes `decisions/graph.json`, the Decisions map
  on the Spider dashboard: one card per record (amber open, green decided, grey superseded) wired to the block,
  constant or family it concerns, so decisions sit on the same map as the facts.
- An agent looking at a key looks for its records. A `decided` record is permission to do what `consequences.agents_may`
  says. An `open` record is a question: the agent may gather evidence and propose, but not act on the key.
