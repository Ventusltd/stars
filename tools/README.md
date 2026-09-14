# Tools for reasoning about the automation

Small scripts, Node 24 built-ins only, that run the same way on a workstation and in GitHub Actions. Each prints a
short plain-language report and exits non-zero on a real problem, so any of them can gate a step or be read at a glance.

| Script | Run | Reports |
|---|---|---|
| `status.mjs` | `node tools/status.mjs` | The last 5 runs of every workflow in `stars` and `code-generator` (result, duration, age, trigger), whether the cron schedule has ever fired, the HTTP status, size and last-modified age of the key published files, and the graphs in the registry. Exits 1 if a workflow's newest finished run failed, a key file is not served, or `gh` cannot be read. Needs `gh` signed in. |
| `check-graph.mjs` | `node tools/check-graph.mjs modular/graph.json` or a URL; `--strict` | Reads a Spider graph exactly as the dashboard's receiver does (`normaliseGenericGraph` in ventus-grid-engine `index.html`) and says out loud what the receiver drops in silence: dangling edges, duplicate ids, unlabelled nodes, rag values outside green, amber, red, blue and grey, script tags in `reason` (which is rendered as HTML). Prints node and edge counts by type, the byte size against the 600 KB registry limit, nodes missing `gh` or `ext`, and the first 12 labels in order, which is what the FOCUS list will show. Structural faults exit 1; size and length limits are warnings unless `--strict`. |
| `needs-audit.mjs` | `node tools/needs-audit.mjs [--live] [--top 60]` | Across every family record in `code/f/*.json` (local, or published with `--live`), the most common names functions need from outside their file. Marks browser and Node built-ins as candidates for the known-globals list in `modular-star/lib.mjs`, and names without an entry in the plain-words map of `modular-star/blocks-catalogue.json`. Reports only; never edits. |
| `run-log.mjs` | `node tools/run-log.mjs <run-id> [--repo Ventusltd/stars] [--all]` | One run's log with timestamps and colours stripped, reduced to the lines our scripts print (`Blocks:`, `Reactions:`, `Spider graph:`, `graphs registered`, repository counts) and every error or stack trace, grouped by step. Exits 1 if the run did not succeed, 2 if its log is not available yet. |

The Modular star workflow runs `check-graph.mjs` on `modular/graph.json` and `blocks/graph.json` after the blocks
are built, so a graph the dashboard could not read fails the run before it is published.

Nothing here writes to the repository or renumbers anything; the numbers in the data are permanent.
