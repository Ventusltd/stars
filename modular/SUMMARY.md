# The Modular star

Updated 2026-09-14 12:43 UTC by GitHub Actions. It reads the current code of 47 Ventusltd repositories.

Every unique line of code has a permanent number. Each file version is stored as its list of line numbers. Functions and classes are numbered as **elements**, and elements with the same logic, ignoring layout and comments, share a numbered **family**. Numbers never change, so a link to line, element or family #N stays valid.

## Totals

| | count |
|---|---|
| Unique lines | 247,856 |
| File versions | 5,484 |
| Elements (functions and classes) | 16,862 |
| Families (same logic) | 15,518 |
| Families written in two or more different files (duplicate work) | 3,337 |
| Families only copied between versions of one file | 800 |
| Self-contained functions compiled into the library | 321 |

Check: 300 randomly chosen files were rebuilt from their numbered lines, and all matched GitHub byte for byte.

History walked: 8,954 of 8,954 commits across 47 repositories (47 complete). Each run continues where the last one stopped.

## Work already done more than once

The same logic written in two or more different files. Copies of one file in timestamped release folders are counted as versions, not here. Before writing something similar, reuse one of these.

| Family | Name | Different files | Places | Repositories | Self-contained | First written | A copy |
|---|---|---|---|---|---|---|---|
| #1586 | `invariant` | 43 | 469 | 6 | yes | 2026-08-28 | [gridatlas/202608310050-gridatlas-next-version-builders/tools/202608310050-select-build-plan.mjs](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/202608310050-gridatlas-next-version-builders/tools/202608310050-select-build-plan.mjs#L28-L30) |
| #8770 | `initialBearingDeg` | 13 | 254 | 6 | no | 2026-08-31 | [gridatlas/atlas/cartridges/202609012045-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012045-sld-sandbox-v9-8.js#L3643-L3649) |
| #511 | `distanceKm` | 13 | 251 | 6 | no | 2026-09-01 | [claude/sessions/202609031559-skin-architecture/prototype/engine.js](https://github.com/Ventusltd/claude/blob/df9da02425fdf0c65d11a84f32cd9b3ef927b309/sessions/202609031559-skin-architecture/prototype/engine.js#L35-L41) |
| #591 | `require` | 12 | 12 | 6 | no | 2026-08-29 | [companies/scripts/202608300232-build-atlas-v9-company-repd-links.py](https://github.com/Ventusltd/companies/blob/ac70a37408d4f434e89e8a80cc36d40e450d3cfb/scripts/202608300232-build-atlas-v9-company-repd-links.py#L40-L42) |
| #975 | `sha256` | 67 | 98 | 5 | no | 2026-08-22 | [data-grid-gb/chatgpt/ingest_etys.py](https://github.com/Ventusltd/data-grid-gb/blob/5181de3423e4fe50c77c568b9f3066c61a1d9e41/chatgpt/ingest_etys.py#L43-L48) |
| #8285 | `sha256Hex` | 29 | 315 | 5 | no | 2026-08-29 | [gridatlas/atlas/cartridges/202608301136-place-postcode-search.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202608301136-place-postcode-search.js#L64-L67) |
| #5168 | `escapeHTML` | 23 | 195 | 5 | yes | 2026-04-03 | [gridatlas/atlas/cartridges/202609012045-substation-intelligence-v9-63.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012045-substation-intelligence-v9-63.js#L45-L49) |
| #5609 | `(anonymous)` | 19 | 191 | 5 | no | 2026-04-07 | [gridatlas/atlas/cartridges/202609012045-substation-intelligence-v9-63.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012045-substation-intelligence-v9-63.js#L154-L159) |
| #8328 | `(anonymous)` | 15 | 86 | 5 | no | 2026-08-30 | [gridatlas/atlas/cartridges/202608301136-place-postcode-search.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202608301136-place-postcode-search.js#L495-L505) |
| #8319 | `numberOrNull` | 12 | 81 | 5 | no | 2026-09-04 | [gridatlas/atlas/cartridges/202609040337-place-global-search-v9-5.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040337-place-global-search-v9-5.js#L577-L582) |
| #8320 | `textOrNull` | 12 | 81 | 5 | no | 2026-09-04 | [gridatlas/atlas/cartridges/202609040337-place-global-search-v9-5.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040337-place-global-search-v9-5.js#L583-L586) |
| #8321 | `suppliedArrivalFields` | 12 | 81 | 5 | yes | 2026-09-04 | [gridatlas/atlas/cartridges/202609040337-place-global-search-v9-5.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040337-place-global-search-v9-5.js#L576-L599) |
| #8323 | `retryExactRepdDeepLink` | 12 | 81 | 5 | no | 2026-09-04 | [gridatlas/atlas/cartridges/202609040337-place-global-search-v9-5.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040337-place-global-search-v9-5.js#L694-L703) |
| #8324 | `(anonymous)` | 12 | 81 | 5 | no | 2026-09-04 | [gridatlas/atlas/cartridges/202609040337-place-global-search-v9-5.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040337-place-global-search-v9-5.js#L713-L718) |
| #8325 | `(anonymous)` | 12 | 81 | 5 | no | 2026-09-04 | [gridatlas/atlas/cartridges/202609040337-place-global-search-v9-5.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040337-place-global-search-v9-5.js#L720-L732) |
| #8326 | `(anonymous)` | 12 | 81 | 5 | no | 2026-09-04 | [gridatlas/atlas/cartridges/202609040337-place-global-search-v9-5.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040337-place-global-search-v9-5.js#L734-L740) |
| #8327 | `bindSearch` | 12 | 81 | 5 | no | 2026-09-04 | [gridatlas/atlas/cartridges/202609040337-place-global-search-v9-5.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040337-place-global-search-v9-5.js#L705-L745) |
| #8767 | `representativePoint` | 11 | 252 | 5 | yes | 2026-09-01 | [gridatlas/atlas/cartridges/202609012045-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012045-sld-sandbox-v9-8.js#L58-L76) |
| #8768 | `voltagesKv` | 11 | 252 | 5 | yes | 2026-09-01 | [gridatlas/atlas/cartridges/202609012045-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012045-sld-sandbox-v9-8.js#L84-L102) |
| #8769 | `destinationPoint` | 11 | 248 | 5 | no | 2026-09-01 | [gridatlas/atlas/cartridges/202609012141-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012141-sld-sandbox-v9-8.js#L131-L141) |
| #8946 | `normalise` | 11 | 179 | 5 | no | 2026-09-01 | [gridatlas/atlas/cartridges/202609012045-substation-intelligence-v9-63.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012045-substation-intelligence-v9-63.js#L1512-L1516) |
| #8782 | `(anonymous)` | 10 | 357 | 5 | no | 2026-09-01 | [gridatlas/atlas/cartridges/202609012141-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012141-sld-sandbox-v9-8.js#L992-L996) |
| #8850 | `(anonymous)` | 9 | 222 | 5 | yes | 2026-09-04 | [gridatlas/atlas/cartridges/202609040021-substation-intelligence-v9-63.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040021-substation-intelligence-v9-63.js#L4382-L4388) |
| #8856 | `(anonymous)` | 9 | 222 | 5 | no | 2026-09-04 | [gridatlas/atlas/cartridges/202609040021-substation-intelligence-v9-63.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609040021-substation-intelligence-v9-63.js#L4445-L4448) |
| #8772 | `voltageOf` | 9 | 184 | 5 | yes | 2026-09-01 | [gridatlas/atlas/cartridges/202609012141-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012141-sld-sandbox-v9-8.js#L834-L838) |
| #8773 | `ratingsOf` | 9 | 184 | 5 | yes | 2026-09-01 | [gridatlas/atlas/cartridges/202609012141-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012141-sld-sandbox-v9-8.js#L842-L850) |
| #8775 | `parametersOf` | 9 | 184 | 5 | yes | 2026-09-01 | [gridatlas/atlas/cartridges/202609012141-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012141-sld-sandbox-v9-8.js#L852-L859) |
| #8776 | `land` | 9 | 184 | 5 | no | 2026-09-01 | [gridatlas/atlas/cartridges/202609012141-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012141-sld-sandbox-v9-8.js#L884-L888) |
| #8777 | `siteOf` | 9 | 184 | 5 | no | 2026-09-01 | [gridatlas/atlas/cartridges/202609012141-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012141-sld-sandbox-v9-8.js#L898-L901) |
| #8781 | `resolve` | 9 | 184 | 5 | no | 2026-09-01 | [gridatlas/atlas/cartridges/202609012141-sld-sandbox-v9-8.js](https://github.com/Ventusltd/gridatlas/blob/ece848117a6d21b7fccb232557194877698c48a9/atlas/cartridges/202609012141-sld-sandbox-v9-8.js#L903-L907) |

## Same name, different code

These names mean different things in different repositories, so check which version is meant before relying on one.

| Name | Different versions | Repositories |
|---|---|---|
| `normalise` | 8 | 12 |
| `check` | 38 | 11 |
| `require` | 16 | 11 |
| `verify` | 11 | 11 |
| `build` | 34 | 9 |
| `write_json` | 16 | 9 |
| `load` | 15 | 9 |
| `sha256` | 16 | 8 |
| `__init__` | 15 | 8 |
| `fetch` | 11 | 8 |
| `haversine` | 7 | 8 |
| `record` | 14 | 7 |
| `close` | 7 | 7 |
| `distanceKm` | 5 | 7 |
| `sha256_file` | 5 | 7 |
| `sha256Hex` | 4 | 7 |
| `start` | 36 | 6 |
| `invariant` | 22 | 6 |
| `write` | 15 | 6 |
| `validate` | 13 | 6 |
| `write_reports` | 12 | 6 |
| `collect` | 11 | 6 |
| `read` | 11 | 6 |
| `setUp` | 11 | 6 |
| `walk` | 11 | 6 |

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
