# Work log

The running record of this repository's automation: what runs, when it last ran, what is waiting, and where to
continue. Any session, human or agent, resumes from here. Newest entry last. Times are UTC.

## What runs on GitHub

| Workflow | Trigger | Does |
|---|---|---|
| **Modular star** (`modular-star.yml`) | hourly at :41, on push to its scripts, on demand | walks any new history, rebuilds the numbered database, the reports, the code records, the periodic table, the chemistry, `LINES.md`, the Spider graphs and the registry; saves the database to the `modular-star` release; refuses to save if any earlier number changed |
| **Refresh reports** (`refresh.yml`) | after every Modular star run, hourly at :23, on demand | rebuilds the Chemistry, Vedic and Random reports from the latest composition tests |
| **Generate app** (`code-generator`, `generate.yml`) | on demand | assembles an app from blocks of the periodic table, proves it parses, commits it with a report and a recipe |
| **Spider features** (`ventus-grid-engine`, `spider-features.yml`) | hourly at :09 | adds registered graphs to the dashboard once they are verified live. **Not yet installed: waiting for a push to the engine repository.** |

Known limitation: GitHub's cron schedule has not fired for this repository since it was created. Runs are
triggered by pushes, by the chain above, and by hand. A fallback trigger runs hourly from the Ventus workstation
while it is on. The durable fix is a personal access token stored as a repository secret so a run can schedule
the next one; that needs an owner to create the token.

## Where things are

- Every unique line, numbered: `LINES.md`. Every function: `code.html?family=N`. Every block: `table.html`.
- Chemistry of blocks: `blocks/reactions.json`. Generated apps: https://github.com/Ventusltd/code-generator/tree/main/apps.
- The dashboard registry this repository publishes: `spider/features.yml`.

## Waiting on a decision

1. Push the Spider features workflow to `ventus-grid-engine` (patch prepared).
2. Whether the dashboard page may gain lazy drill-in and a particle view (see `CODE-UNIVERSE.md`).
3. EARTH_KM: does `engine/geo-core.js` settle the radius question.
4. The three other evidence packs: sld-sandbox needs, 220 kV provenance, TECHNOLOGIES vocabulary.
5. Private repositories: include via a private twin, or leave out.
6. A personal access token for self-scheduling runs.

## Log

- 2026-09-14 09:40 — Periodic table (63 named blocks + auto-blocks), chemistry from evidence, dropdown generator, interdependencies and purpose on the report page all live. First block-built app: `substation-finder`.
- 2026-09-14 09:45 — Enumeration order fixed so the Spider's FOCUS list reads like a table of contents: categories, then blocks by number, then repositories; functions by source file. Ten-minute checks begin.
- 2026-09-14 09:50 — `modular-star/sense.mjs` added (142 nodes, 548 edges, 88 KB): the code universe as a narrative from the whole to the parts; canonical homes with their copies marked `should_import`, twelve unsettled constants as decisions, proven versus untested blocks, top faults, foundations. The hourly run now executes and registers it as `sense`. Idea for the dashboard page, when the owner decides: let a wire carry a verdict (debt, warning, evidence, question), not just a type. Agent usage ends here; everything continues on GitHub. Resume from `Dropbox\RESUME-HERE-20260914.md`.
