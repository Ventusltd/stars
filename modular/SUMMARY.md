# The Modular star

Updated 2026-11-23 22:53 UTC by GitHub Actions. It reads the current code of 92 Ventusltd repositories.

Every unique line of code has a permanent number. Each file version is stored as its list of line numbers. Functions and classes are numbered as **elements**, and elements with the same logic, ignoring layout and comments, share a numbered **family**. Numbers never change, so a link to line, element or family #N stays valid.

## Totals

| | count |
|---|---|
| Unique lines | 475,816 |
| File versions | 8,803 |
| Elements (functions and classes) | 34,099 |
| Families (same logic) | 32,950 |
| Families written in two or more different files (duplicate work) | 7,506 |
| Families only copied between versions of one file | 3,004 |
| Self-contained functions compiled into the library | 765 |

Check: 300 randomly chosen files were rebuilt from their numbered lines, and all matched GitHub byte for byte.

History walked: 9,204 of 9,204 commits across 92 repositories (92 complete). Each run continues where the last one stopped.

## Work already done more than once

The same logic written in two or more different files. Copies of one file in timestamped release folders are counted as versions, not here. Before writing something similar, reuse one of these.

| Family | Name | Different files | Places | Repositories | Self-contained | First written | A copy |
|---|---|---|---|---|---|---|---|
| #1586 | `invariant` | 47 | 516 | 6 | yes | 2026-08-28 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L48-L50) |
| #8770 | `initialBearingDeg` | 15 | 261 | 6 | no | 2026-08-31 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1766-L1772) |
| #511 | `distanceKm` | 15 | 258 | 6 | no | 2026-09-01 | [claude/sessions/202609031559-skin-architecture/prototype/engine.js](https://github.com/Ventusltd/claude/blob/df9da02425fdf0c65d11a84f32cd9b3ef927b309/sessions/202609031559-skin-architecture/prototype/engine.js#L35-L41) |
| #8782 | `(anonymous)` | 12 | 361 | 6 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L2104-L2108) |
| #591 | `require` | 12 | 12 | 6 | no | 2026-08-29 | [companies/scripts/202608300232-build-atlas-v9-company-repd-links.py](https://github.com/Ventusltd/companies/blob/ac70a37408d4f434e89e8a80cc36d40e450d3cfb/scripts/202608300232-build-atlas-v9-company-repd-links.py#L40-L42) |
| #8772 | `voltageOf` | 11 | 187 | 6 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1862-L1866) |
| #8773 | `ratingsOf` | 11 | 187 | 6 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1870-L1878) |
| #8775 | `parametersOf` | 11 | 187 | 6 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1929-L1936) |
| #8776 | `land` | 11 | 187 | 6 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1961-L1965) |
| #8777 | `siteOf` | 11 | 187 | 6 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1975-L1978) |
| #8781 | `resolve` | 11 | 187 | 6 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L2015-L2019) |
| #8778 | `nodeSiteCode` | 11 | 183 | 6 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1994-L1997) |
| #8779 | `nodesOfSite` | 11 | 183 | 6 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L2001-L2008) |
| #8780 | `graph` | 11 | 183 | 6 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1989-L2013) |
| #8783 | `at` | 10 | 176 | 6 | no | 2026-09-03 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L2028-L2145) |
| #8784 | `index` | 10 | 176 | 6 | no | 2026-09-03 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1942-L2159) |
| #975 | `sha256` | 67 | 358 | 5 | no | 2026-08-22 | [data-gridatlas/atman/202608291237-verify-live-data-release.py](https://github.com/Ventusltd/data-gridatlas/blob/8bf88da9e210ce9f61dc0398869d3369f3fa2445/atman/202608291237-verify-live-data-release.py#L27-L32) |
| #8285 | `sha256Hex` | 33 | 360 | 5 | no | 2026-08-29 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L114-L117) |
| #5168 | `escapeHTML` | 24 | 197 | 5 | yes | 2026-04-03 | [youengineer-code-review/civilisation-atlas-v8/ventus-corev8engine.js](https://github.com/Ventusltd/youengineer-code-review/blob/f86dcb229b40ea774b2b5af049dbdc4b90b476de/civilisation-atlas-v8/ventus-corev8engine.js#L9-L16) |
| #5609 | `(anonymous)` | 20 | 193 | 5 | no | 2026-04-07 | [code-generator/apps/substation-finder/Si/202609040045-ventus-corev8engine-deep-link-receiver.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609040045-ventus-corev8engine-deep-link-receiver.js#L126-L131) |
| #8328 | `(anonymous)` | 16 | 90 | 5 | no | 2026-08-30 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L776-L786) |
| #8767 | `representativePoint` | 13 | 259 | 5 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1696-L1714) |
| #8768 | `voltagesKv` | 13 | 259 | 5 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1722-L1740) |
| #8769 | `destinationPoint` | 13 | 255 | 5 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1754-L1764) |
| #8319 | `numberOrNull` | 13 | 85 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L606-L611) |
| #8320 | `textOrNull` | 13 | 85 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L612-L615) |
| #8321 | `suppliedArrivalFields` | 13 | 85 | 5 | yes | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L605-L628) |
| #8323 | `retryExactRepdDeepLink` | 13 | 85 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L723-L732) |
| #8324 | `(anonymous)` | 13 | 85 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L742-L747) |
| #8325 | `(anonymous)` | 13 | 85 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L749-L761) |

## Same name, different code

These names mean different things in different repositories, so check which version is meant before relying on one.

| Name | Different versions | Repositories |
|---|---|---|
| `build` | 132 | 21 |
| `load` | 65 | 21 |
| `check` | 65 | 20 |
| `__init__` | 60 | 19 |
| `draw` | 125 | 18 |
| `classify` | 23 | 16 |
| `require` | 19 | 16 |
| `verify` | 18 | 15 |
| `setUp` | 50 | 14 |
| `fetch` | 44 | 14 |
| `validate` | 31 | 14 |
| `walk` | 28 | 13 |
| `measure` | 26 | 13 |
| `normalise` | 17 | 13 |
| `refresh` | 43 | 12 |
| `start` | 86 | 11 |
| `frame` | 46 | 11 |
| `step` | 44 | 11 |
| `sha256` | 25 | 11 |
| `record` | 24 | 11 |
| `describe` | 19 | 11 |
| `write_json` | 19 | 11 |
| `close` | 33 | 10 |
| `inspect` | 28 | 10 |
| `collect` | 25 | 10 |

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
