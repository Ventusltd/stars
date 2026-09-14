# One vocabulary for every wire

*The relationship types the Spider graphs of globalgrid2050 architecture development use, what each means in one
line, and the verdict class a wire carries. Written 14 September 2026 from an audit of every edge in every published
graph.*

A wire is an edge `{from, to, type}`. The dashboard draws every wire the same today because its colour and label
tables (`ECSS`, `REL` in `index.html`) do not know these types; `ENGINE-PATCH.md` is the additive change that would
teach it. Until then, `modular-star/relate.mjs` writes the same information as a line of text on every focused card.

## The vocabulary

Types are lower-case with hyphens, never spaces or underscores: the page uses the type as an SVG marker id. The
direction is always `from → to`, and the meaning is read from the source.

| Class | Type | Meaning (from → to) | Glyph on the card |
|---|---|---|---|
| dependency | `depends-on` | the source needs the target to work | → depends on · ← used by |
| containment | `contains` | the source is the whole; the target is one of its parts | ▸ contains · ◂ part of |
| containment | `found-in` | the source lives in the target (a repository, a file) | ▸ found in · ◂ holds |
| evidence | `canonical` | the source sits at its declared canonical home, proven by file and lines | ✓ canonical home |
| evidence | `implements` | the source (an engine module) implements the target block | ✓ implements |
| evidence | `proven` | the two blocks passed composition tests together | ✓ proven with |
| evidence | `seen-together` | the two blocks already live in the same shipped app; use, not a test | ✓ seen with |
| evidence | `produces`, `run-of`, `checked-by`, `triggers` | the audit trail: a run of a workflow produced an artefact, a check checked it | ✓ |
| debt | `should-import` | the source is a copy that should import the target, its canonical home | ⚠ should import · ⚠ copies should import this |
| debt | `supersedes` | the source replaces the target; the target should go | ⚠ supersedes · ⚠ superseded by |
| warning | `unstable` | composition tests pass sometimes (40 to 80 per cent) | ⚠ unstable with |
| warning | `fails` | composition tests fail (under 40 per cent) | ⚠ fails with |
| warning | `thrown-by` | the source is an error; the target is a function that throws it | ⚠ thrown by · ⚠ throws |
| warning | `same-name` | two functions share a name but not their logic | ⚠ shares a name with |
| question | `concerns` | the source is a decision record about the target key; open is a question, decided is permission | ? decision |

Six classes: **evidence** (proven together), **dependency**, **containment**, **debt** (a copy that should import),
**warning** (unstable, failing, or ambiguous), **question** (a decision not yet taken). The class is what a colour
would show; the type is what the label would say.

## What the audit found (before this vocabulary)

Twenty-five type strings across six graphs, with the same relation spelt three ways and one string that a reader
could not decode.

| Graph | Type as published | Count | Could a reader tell what the wire means? | Now |
|---|---|---|---|---|
| Modular (`modular/graph.json`) | `found-in` | 782 | yes | `found-in` |
| | `canonical` | 133 | yes, with the card text | `canonical` |
| | `engine` | 54 | no: it meant "a fragment the engine graph cites as superseded" | `should-import` |
| | `thrown-by` | 15 | yes | `thrown-by` |
| | `same-name` | 12 | yes | `same-name` |
| Periodic table (`blocks/graph.json`) | `found-in` | 259 | yes | `found-in` |
| | `category` | 207 | no: a noun, drawn block → category, so the block "depended on" its category | `contains`, drawn category → block |
| | `depends-on` | 155 | yes | `depends-on` |
| Assessment (`sense/graph.json`) | `seen_together` | 188 | yes, but it also hid `proven` and `fails` verdicts under one name | `seen-together`, `proven`, `fails` |
| | `contains` | 124 | yes | `contains` |
| | `depends_on` | 90 | yes; a second spelling of `depends-on` | `depends-on` |
| | `should_import` | 72 | yes; a second spelling | `should-import` |
| | `proven` | 36 | no: it meant "this block appears in a shipped app", not a passed test | `contains` (from the chapter) |
| | `leans_on` | 20 | no: chapter → hub, the chapter does not lean on anything | `contains` |
| | `decides` | 12 | partly | `concerns` (the type the Decisions map uses) |
| | `unstable` | 6 | yes | `unstable` |
| Structure (`structure/graph.json`) | `contains` | 232 | yes | unchanged |
| | `depends-on` | 90 | yes | unchanged |
| | `implements` | 15 | yes | unchanged |
| Audit (`proof/graph.json`) | `produces` 35, `checked-by` 20, `run-of` 11, `triggers` 2 | 68 | yes | unchanged |
| Decisions (`decisions/graph.json`) | `concerns` 19, `contains` 16 | 35 | yes | unchanged; ids `block:Ek`, `family:511` join the other maps |
| Engine population (`ventus-grid-engine`, hand-made) | `duplicates` 18, `supersedes` 13, `should_import` 10, `drifts_from` 7, `imports` 3 | 51 | yes | not this repository's to change; mapped to classes in `ENGINE-PATCH.md` |

Two findings beyond spelling. The Assessment graph collapsed every reaction verdict except `unstable` into
`seen_together`, so a pair that failed its composition tests was drawn as evidence; the script now keeps `proven`,
`seen-together`, `unstable` and `fails` apart and skips `untested`. The Periodic table wired blocks *to* their
category, so on the dashboard a block "depended on" its category and a category was "depended on by" its blocks;
the wire now runs from the category and says `contains`.

## Where the vocabulary lives

- `modular-star/relate.mjs` holds the table as code (type → class, phrase as source, phrase as target) and writes the
  relationship line on every focused card. Any type outside the table is reported in the run log and shown in plain
  words, never dropped.
- `modular-star/build.mjs` (Modular), `blocks.mjs` (Periodic table) and `sense.mjs` (Assessment) emit these types.
  `structure.mjs`, `proof.mjs` and `decisions.mjs` already did.
- `WHY.md` is the sentence on every red card; `ENGINE-PATCH.md` is the page change that would colour the wires.
