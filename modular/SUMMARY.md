# The Modular star

Updated 2026-09-14 08:50 UTC by GitHub Actions. It reads the current code of 47 Ventusltd repositories.

Every unique line of code has a permanent number. Each file version is stored as its list of line numbers. Functions and classes are numbered as **elements**, and elements with the same logic, ignoring layout and comments, share a numbered **family**. Numbers never change, so a link to line, element or family #N stays valid.

## Totals

| | count |
|---|---|
| Unique lines | 247,444 |
| File versions | 5,470 |
| Elements (functions and classes) | 16,844 |
| Families (same logic) | 15,502 |
| Families written in two or more different files (duplicate work) | 3,160 |
| Families only copied between versions of one file | 840 |
| Self-contained functions compiled into the library | 319 |

Check: 300 randomly chosen files were rebuilt from their numbered lines, and all matched GitHub byte for byte.

History walked: 8,954 of 8,954 commits across 47 repositories (47 complete). Each run continues where the last one stopped.

## Work already done more than once

The same logic written in two or more different files. Copies of one file in timestamped release folders are counted as versions, not here. Before writing something similar, reuse one of these.

| Family | Name | Different files | Places | Repositories | Self-contained | First written | A copy |
|---|---|---|---|---|---|---|---|
| #975 | `sha256` | 67 | 98 | 5 | no | 2026-08-22 | [data-grid-gb/chatgpt/ingest_etys.py](https://github.com/Ventusltd/data-grid-gb/blob/5181de3423e4fe50c77c568b9f3066c61a1d9e41/chatgpt/ingest_etys.py#L43-L48) |
| #1586 | `invariant` | 37 | 459 | 5 | yes | 2026-08-28 | [globalgrid2050/pipelinenews_intelligence/202608311343/assets/202608282200-federated-relationships.mjs](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/pipelinenews_intelligence/202608311343/assets/202608282200-federated-relationships.mjs#L12-L14) |
| #8770 | `initialBearingDeg` | 10 | 251 | 5 | no | 2026-08-31 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1627-L1633) |
| #511 | `distanceKm` | 10 | 248 | 5 | no | 2026-09-01 | [claude/sessions/202609031559-skin-architecture/prototype/engine.js](https://github.com/Ventusltd/claude/blob/df9da02425fdf0c65d11a84f32cd9b3ef927b309/sessions/202609031559-skin-architecture/prototype/engine.js#L35-L41) |
| #591 | `require` | 10 | 10 | 5 | no | 2026-08-29 | [companies/scripts/202608300232-build-atlas-v9-company-repd-links.py](https://github.com/Ventusltd/companies/blob/ac70a37408d4f434e89e8a80cc36d40e450d3cfb/scripts/202608300232-build-atlas-v9-company-repd-links.py#L40-L42) |
| #8285 | `sha256Hex` | 23 | 305 | 4 | no | 2026-08-29 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609041945-place-global-search-v9-5.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609041945-place-global-search-v9-5.js#L124-L127) |
| #5168 | `escapeHTML` | 16 | 188 | 4 | yes | 2026-04-03 | [globalgrid2050/repd_grid_atlasv3/index.html](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/repd_grid_atlasv3/index.html#L193-L197) |
| #5609 | `(anonymous)` | 13 | 185 | 4 | no | 2026-04-07 | [globalgrid2050/repd_grid_atlasv6/ventus-corev6engine.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/repd_grid_atlasv6/ventus-corev6engine.js#L135-L140) |
| #1 | `clampInteger` | 11 | 41 | 4 | yes | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js#L3-L7) |
| #18 | `circle` | 11 | 41 | 4 | no | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/rendering.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/rendering.js#L51-L59) |
| #32 | `renderAll` | 11 | 41 | 4 | no | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/ui.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/ui.js#L288-L302) |
| #8400 | `isProjectTech` | 10 | 142 | 4 | no | 2026-08-31 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L1733-L1744) |
| #8528 | `(anonymous)` | 10 | 142 | 4 | no | 2026-09-01 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L4469-L4479) |
| #8529 | `watchForLayerControls` | 10 | 142 | 4 | no | 2026-09-01 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L4466-L4485) |
| #8531 | `(anonymous)` | 10 | 142 | 4 | no | 2026-08-31 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L4571-L4575) |
| #8586 | `arrive` | 10 | 142 | 4 | no | 2026-08-31 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L5960-L5968) |
| #8398 | `policy` | 10 | 116 | 4 | no | 2026-09-03 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L1723-L1727) |
| #8399 | `(anonymous)` | 10 | 116 | 4 | no | 2026-09-03 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L1716-L1730) |
| #8466 | `deepLinkPlan` | 10 | 106 | 4 | yes | 2026-09-04 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L3215-L3227) |
| #8581 | `apply` | 10 | 106 | 4 | no | 2026-09-03 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L5777-L5791) |
| #8589 | `(anonymous)` | 10 | 104 | 4 | no | 2026-09-04 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L6131-L6140) |
| #8583 | `coordsUsable` | 10 | 100 | 4 | no | 2026-09-04 | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609050354-sld-sandbox-v9-8.js#L5796-L5798) |
| #2 | `effectiveGap` | 10 | 40 | 4 | yes | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js#L11-L15) |
| #3 | `getBurialDepthForComputation` | 10 | 40 | 4 | no | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js#L17-L23) |
| #7 | `getInputs` | 10 | 40 | 4 | no | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js#L50-L67) |
| #8 | `getGroupGeometry` | 10 | 40 | 4 | yes | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js#L69-L83) |
| #9 | `computeLayout` | 10 | 40 | 4 | no | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/calculations.js#L85-L118) |
| #12 | `exportJson` | 10 | 40 | 4 | no | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/export.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/export.js#L1-L13) |
| #13 | `copySnapshot` | 10 | 40 | 4 | no | 2026-04-09 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/export.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/export.js#L15-L26) |
| #14 | `renderStatus` | 10 | 40 | 4 | no | 2026-04-08 | [cable-trench-or-drill/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/rendering.js](https://github.com/Ventusltd/cable-trench-or-drill/blob/958449237b6f498677025a0e274709bc147f43f4/releases/202609051921/solar-bess-topology-v7/cable-geometry-visualiser/rendering.js#L1-L5) |

## Same name, different code

These names mean different things in different repositories, so check which version is meant before relying on one.

| Name | Different versions | Repositories |
|---|---|---|
| `check` | 38 | 11 |
| `normalise` | 8 | 11 |
| `require` | 16 | 10 |
| `verify` | 11 | 10 |
| `build` | 29 | 8 |
| `sha256` | 16 | 8 |
| `write_json` | 16 | 8 |
| `__init__` | 15 | 8 |
| `load` | 15 | 8 |
| `record` | 14 | 7 |
| `fetch` | 10 | 7 |
| `haversine` | 7 | 7 |
| `write` | 15 | 6 |
| `validate` | 13 | 6 |
| `write_reports` | 12 | 6 |
| `collect` | 11 | 6 |
| `read` | 11 | 6 |
| `setUp` | 11 | 6 |
| `walk` | 11 | 6 |
| `draw` | 9 | 6 |
| `inspect` | 9 | 6 |
| `close` | 7 | 6 |
| `distanceKm` | 5 | 6 |
| `sha256_file` | 5 | 6 |
| `sha256Hex` | 4 | 6 |

## How to check for earlier work before writing code

```
npm install
node modular-star/find-prior.mjs path/to/your-file.js
```
This lists every function in the file that already exists, either word for word or with the same logic in a different layout, with links to where it lives.

## Use in the Spider

`modular/graph.json` is a Spider graph: the most repeated families wired to the repositories they appear in. Green means self-contained; amber means the function needs something from outside itself, which the node lists.

## Coverage

- Current default branch of each repository scanned; earlier history is not yet included. Numbers from earlier runs are kept, so history builds up with every run.
- JavaScript, HTML inline scripts and Python only. Files over 1 MiB, minified files and vendored folders are skipped.
- Public repositories only, by design: this repository is public, so private code is never read into it.
