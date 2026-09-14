# The Modular star

Updated 2026-09-14 02:20 UTC by GitHub Actions. It reads the current code of 46 Ventusltd repositories.

Every unique line of code has a permanent number. Each file version is stored as its list of line numbers. Functions and classes are numbered as **elements**, and elements with the same logic, ignoring layout and comments, share a numbered **family**. Numbers never change, so a link to line, element or family #N stays valid.

## Totals

| | count |
|---|---|
| Unique lines | 198,411 |
| File versions | 2,754 |
| Elements (functions and classes) | 11,402 |
| Families (same logic) | 10,832 |
| Families found in two or more places | 4,000 |
| Self-contained functions compiled into the library | 394 |

Check: 300 randomly chosen files were rebuilt from their numbered lines, and all matched GitHub byte for byte.

## Work already done more than once

The same logic exists in several places. Before writing something similar, reuse one of these.

| Family | Name | Places | Repositories | Self-contained | First copy |
|---|---|---|---|---|---|
| #1586 | `invariant` | 459 | 5 | yes | [globalgrid2050/pipelinenews_intelligence/202608311343/assets/202608282200-federated-relationships.mjs](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/pipelinenews_intelligence/202608311343/assets/202608282200-federated-relationships.mjs#L12-L14) |
| #8770 | `initialBearingDeg` | 251 | 5 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1627-L1633) |
| #511 | `distanceKm` | 248 | 5 | no | [claude/sessions/202609031559-skin-architecture/prototype/engine.js](https://github.com/Ventusltd/claude/blob/df9da02425fdf0c65d11a84f32cd9b3ef927b309/sessions/202609031559-skin-architecture/prototype/engine.js#L35-L41) |
| #975 | `sha256` | 98 | 5 | no | [data-grid-gb/chatgpt/ingest_etys.py](https://github.com/Ventusltd/data-grid-gb/blob/5181de3423e4fe50c77c568b9f3066c61a1d9e41/chatgpt/ingest_etys.py#L43-L48) |
| #591 | `require` | 10 | 5 | no | [companies/scripts/202608300232-build-atlas-v9-company-repd-links.py](https://github.com/Ventusltd/companies/blob/ac70a37408d4f434e89e8a80cc36d40e450d3cfb/scripts/202608300232-build-atlas-v9-company-repd-links.py#L40-L42) |
| #8782 | `(anonymous)` | 353 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1965-L1969) |
| #8285 | `sha256Hex` | 305 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609041945-place-global-search-v9-5.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609041945-place-global-search-v9-5.js#L124-L127) |
| #8767 | `representativePoint` | 250 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1557-L1575) |
| #8768 | `voltagesKv` | 250 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1583-L1601) |
| #8769 | `destinationPoint` | 246 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1615-L1625) |
| #8850 | `(anonymous)` | 220 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L4617-L4623) |
| #8856 | `(anonymous)` | 220 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L4749-L4752) |
| #5168 | `escapeHTML` | 188 | 4 | yes | [globalgrid2050/repd_grid_atlasv3/index.html](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/repd_grid_atlasv3/index.html#L193-L197) |
| #5609 | `(anonymous)` | 185 | 4 | no | [globalgrid2050/repd_grid_atlasv6/ventus-corev6engine.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/repd_grid_atlasv6/ventus-corev6engine.js#L135-L140) |
| #8772 | `voltageOf` | 182 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1723-L1727) |
| #8773 | `ratingsOf` | 182 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1731-L1739) |
| #8775 | `parametersOf` | 182 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1790-L1797) |
| #8776 | `land` | 182 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1822-L1826) |
| #8777 | `siteOf` | 182 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1836-L1839) |
| #8781 | `resolve` | 182 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1876-L1880) |
| #8778 | `nodeSiteCode` | 178 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1855-L1858) |
| #8779 | `nodesOfSite` | 178 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1862-L1869) |
| #8780 | `graph` | 178 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L1850-L1874) |
| #8786 | `crossing` | 178 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L2104-L2113) |
| #8787 | `describe` | 178 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L2115-L2141) |
| #8788 | `legality` | 178 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L2152-L2161) |
| #8789 | `startNodes` | 178 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L2163-L2167) |
| #8790 | `between` | 178 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L2183-L2301) |
| #8791 | `(anonymous)` | 178 | 4 | yes | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L2374-L2377) |
| #8792 | `within` | 178 | 4 | no | [globalgrid2050/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js](https://github.com/Ventusltd/globalgrid2050/blob/a387cac3aa3f09b8cdd27d3ed8040d661303f127/testcode/202609051152/atlas/cartridges/202609051152-substation-intelligence.js#L2311-L2383) |

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
