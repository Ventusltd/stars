# Work log

The running record of this repository's automation: what runs, when it last ran, what is waiting, and where to
continue. Any session, human or agent, resumes from here. Newest entry last. Times are UTC.

## What runs on GitHub

| Workflow | Trigger | Does |
|---|---|---|
| **Modular star** (`modular-star.yml`) | hourly at :41, on push to its scripts, on demand | walks any new history, rebuilds the numbered database, the reports, the code records, the periodic table, the chemistry, `LINES.md`, the Spider graphs and the registry; saves the database to the `modular-star` release; refuses to save if any earlier number changed |
| **Refresh reports** (`refresh.yml`) | after every Modular star run, hourly at :23, on demand | rebuilds the Chemistry, Vedic and Random reports from the latest composition tests |
| **Generate app** (`code-generator`, `generate.yml`) | on demand | assembles an app from blocks of the periodic table, proves it parses, commits it with a report and a recipe |
| **Spider features** (`ventus-grid-engine`, `spider-features.yml`) | hourly at :09 | adds registered graphs to the dashboard once they are verified live; installed 14 September |

GitHub's cron schedule first fired on 14 September (07:58 and 08:05 UTC). Runs are also triggered by pushes, by the chain above, and by hand.

## Where things are

- Every unique line, numbered: `LINES.md`. Every function: `code.html?family=N`. Every block: `table.html`.
- Chemistry of blocks: `blocks/reactions.json`. Generated apps: https://github.com/Ventusltd/code-generator/tree/main/apps.
- The dashboard registry this repository publishes: `spider/features.yml`.

## Waiting on a decision

1. ~~Push the Spider features workflow to `ventus-grid-engine`~~ done 14 September.
2. Whether the dashboard page may gain lazy drill-in and a particle view (see `CODE-UNIVERSE.md`).
3. EARTH_KM: does `engine/geo-core.js` settle the radius question.
4. The three other evidence packs: sld-sandbox needs, 220 kV provenance, TECHNOLOGIES vocabulary.
5. Private repositories: include via a private twin, or leave out.
6. ~~A personal access token for self-scheduling runs~~ not needed: cron now fires.

## Log

- 2026-09-14 09:40 — Periodic table (63 named blocks + auto-blocks), chemistry from evidence, dropdown generator, interdependencies and purpose on the report page all live. First block-built app: `substation-finder`.
- 2026-09-14 09:45 — Enumeration order fixed so the Spider's FOCUS list reads like a table of contents: categories, then blocks by number, then repositories; functions by source file. Ten-minute checks begin.
- 2026-09-14 09:50 — `modular-star/sense.mjs` added (142 nodes, 548 edges, 88 KB): the code universe as a narrative from the whole to the parts; canonical homes with their copies marked `should_import`, twelve unsettled constants as decisions, proven versus untested blocks, top faults, foundations. The hourly run now executes and registers it as `sense`. Idea for the dashboard page, when the owner decides: let a wire carry a verdict (debt, warning, evidence, question), not just a type. Agent usage ends here; everything continues on GitHub. Resume from `Dropbox\RESUME-HERE-20260914.md`.
- 2026-09-14 09:55 — `tools/` added (see `tools/README.md`): `status.mjs` (last 5 runs per workflow in both repositories, cron, live file sizes, registry), `check-graph.mjs` (a graph read as the dashboard receiver reads it; now a workflow step before publishing), `needs-audit.mjs` (most common needs, built-in and plain-words candidates), `run-log.mjs` (a run's log reduced to our lines and errors). Live checks: all five graphs readable, no dangling edges or duplicate ids; `modular/graph.json` at 90% of the 600 KB registry limit; cron fired for the first time at 07:58 and 08:05 UTC today; an element's needs are never recomputed, so a change to the known-globals list reaches only new file versions.
- 2026-09-14 09:53 — Proof of work graph added: `proof/graph.json` (40 cards, 68 links, 26 KB) and `proof/PROOF.md` (Mermaid), written by `modular-star/proof.mjs` on every Modular star run: workflows, latest runs with status and duration, artefacts with sizes and update times, the checks passed. Registered as `proof-of-work`.
- 2026-09-14 09:53 — Structure graph added: `structure/graph.json` (122 cards, 337 links, 93 KB: 27 repositories, 12 categories, 63 named blocks, 20 engine modules) and `structure/STRUCTURE.md` (Mermaid), written by `modular-star/structure.mjs`. Registered as `structure`. Both live at the raw URLs; the dashboard shows them once its manifest is pushed.
- 2026-09-14 09:56 — The Spider features workflow is installed in ventus-grid-engine (commit e133712) and its first run passed: the dashboard now lists every verified graph from the registries (modular, periodic-table, sense, proof-of-work, structure, chemistry, vedic, random, generated-apps) and re-checks them hourly. Decision 1 closed. Work finalised; the automation continues on GitHub.
- 2026-09-14 10:07 — Debugging tools' findings fixed: duplicate registry entries removed, `sense` now committed by the run, modular graph written compact (under the size limit), six more built-ins treated as globals, cron note corrected. Open item: needs are frozen at first ingest, so global-list changes reach only new file versions; a one-off re-derivation for existing elements (no numbers change) is the next task.
