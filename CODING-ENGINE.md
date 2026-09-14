# From clicks to code

*How the relational map becomes a coding engine, and how twenty-two years of grid-connection judgement can be
recorded on it by clicks, so that agents write only what is missing.*

14 September 2026. A design, written while four auditors work on its parts.

## What exists at the end of today

| Layer | What it holds | Key |
|---|---|---|
| Lines | every unique line of code ever written in the public repositories (247,444) | line number |
| Functions | every function and class, grouped where the logic is the same (16,844 in 10,805 families) | family number |
| Blocks | plain-named units a person chooses (63 named; the original 47 elements plus 16 more) | symbol and number |
| Compatibility | which blocks are proven together, seen together, or untested, with the example app | block pair |
| Dependencies | what uses what, function to function and block to block | keys on both ends |
| Applications | apps assembled from blocks, with their bill of materials and what they still need | app name |
| Audit | what ran, when, what it produced, which checks passed | run id |
| Decisions | the values and choices computation cannot settle | decision id (being added) |

Every layer is a graph the dashboard reads, and every node carries a permanent key. That is the substrate.

## The engine, in one loop

1. **Choose.** A person picks what they want by clicks: a starting point (a preset), a category, a block. No code
   is shown until asked.
2. **Assemble.** What exists is copied exactly from GitHub at a pinned commit, in dependency order, into a page
   that can be opened and judged: which parts loaded, which failed, which values are still needed.
3. **Hand off.** What does not exist becomes a work order: what is missing, where it will be used, what it must
   provide, and how it will be checked. The work order is a GitHub issue an agent can act on.
4. **Write.** An agent (Claude, Codex) writes the missing package against the work order. The new code is a new
   file in a repository, so the next hourly run numbers its lines, places its functions, and adds its block.
5. **Prove.** The assembled page loads again; the compatibility of the new block with the old ones is recorded
   as a test; the audit graph shows the run. Green or red, the map now knows.
6. **Decide.** Where the engine cannot settle a value (an earth radius, a vocabulary, whether a copy should be
   retired), the person records a decision by clicks, attached to the key it concerns. A decided record is
   permission; an open record is a question.

Round again. Each turn adds keys; no turn removes any.

## Why this is the right substrate for an assistant

An assistant built from this map does not have to guess. Every fact it can state has a key and a source; every
judgement it can act on is a decision record with a rationale; every gap it can fill is a work order with an
acceptance check. Twenty-two years of experience, recorded as decisions on keys, is a training set of a different
kind: not text to imitate, but choices to respect. The assistant's first competence is therefore modest and real:
given a request, find the blocks that already do it, say what is proven with what, list what is missing, and
raise the work orders. Its second competence follows from the decisions: never re-ask what has been decided,
always ask what is open.

## What the four auditors are adding today

| Seat | Adds |
|---|---|
| Relationship intelligence | one vocabulary for every wire (evidence, dependency, containment, debt, warning, question); a relationship line on every focused card; a "why" sentence on every red card; the additive change the dashboard page would need to colour wires by verdict |
| The non-coder's journey | a start-here page of plain questions; plain wording on the table and report pages; a check that every published page loads without errors |
| The coding engine | an assembled page per app that loads its files and shows what failed; work orders for what is missing, raised as GitHub issues for the agents; the picker shows "built from existing code" and "to be written" |
| The experience map | the decision record, an issue form for recording one by clicks, a workflow that files it under a permanent number, and a Decisions graph wired to the keys it settles |

## What is still needed after today, in order

1. The dashboard page change: wires coloured by verdict and a focused card's edges grouped by class. Additive,
   small, and the single largest gain in legibility. Owner's decision.
2. A test bench on GitHub Actions that opens each assembled application page in a headless browser and records
   the result as a compatibility test, so the loop closes without a laptop.
3. The first real grid graph: substations, lines and connection points from the published datasets with the
   engine's numbers on the cards, so the same clicks that assemble code can scope a connection.
4. Private repositories, through a private twin, once the public loop is trusted.

## What the owner decides

- Allow the dashboard page change (item 1).
- Take the first decisions on the map: the earth radius (the engine holds three named radii by purpose), the
  sld-sandbox needs, the 220 kV provenance, the technology vocabulary. Each becomes a record other work can rely on.
- Whether work orders go to a person first or straight to an agent.
