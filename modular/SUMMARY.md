# The Modular star

Updated 2026-09-21 05:24 UTC by GitHub Actions. It reads the current code of 73 Ventusltd repositories.

Every unique line of code has a permanent number. Each file version is stored as its list of line numbers. Functions and classes are numbered as **elements**, and elements with the same logic, ignoring layout and comments, share a numbered **family**. Numbers never change, so a link to line, element or family #N stays valid.

## Totals

| | count |
|---|---|
| Unique lines | 311,023 |
| File versions | 6,406 |
| Elements (functions and classes) | 20,891 |
| Families (same logic) | 19,531 |
| Families written in two or more different files (duplicate work) | 4,661 |
| Families only copied between versions of one file | 848 |
| Self-contained functions compiled into the library | 421 |

Check: 300 randomly chosen files were rebuilt from their numbered lines, and all matched GitHub byte for byte.

History walked: 9,088 of 9,088 commits across 73 repositories (73 complete). Each run continues where the last one stopped.

## Work already done more than once

The same logic written in two or more different files. Copies of one file in timestamped release folders are counted as versions, not here. Before writing something similar, reuse one of these.

| Family | Name | Different files | Places | Repositories | Self-contained | First written | A copy |
|---|---|---|---|---|---|---|---|
| #1586 | `invariant` | 44 | 472 | 6 | yes | 2026-08-28 | [pipelinenews/releases/202608291447-pipelinenews/assets/202608282200-federated-relationships.mjs](https://github.com/Ventusltd/pipelinenews/blob/4980096b57cb35f63ad2d80bded5687beb2a9532/releases/202608291447-pipelinenews/assets/202608282200-federated-relationships.mjs#L12-L14) |
| #8770 | `initialBearingDeg` | 13 | 254 | 6 | no | 2026-08-31 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1766-L1772) |
| #511 | `distanceKm` | 13 | 251 | 6 | no | 2026-09-01 | [claude/sessions/202609031559-skin-architecture/prototype/engine.js](https://github.com/Ventusltd/claude/blob/df9da02425fdf0c65d11a84f32cd9b3ef927b309/sessions/202609031559-skin-architecture/prototype/engine.js#L35-L41) |
| #591 | `require` | 12 | 12 | 6 | no | 2026-08-29 | [companies/scripts/202608300232-build-atlas-v9-company-repd-links.py](https://github.com/Ventusltd/companies/blob/ac70a37408d4f434e89e8a80cc36d40e450d3cfb/scripts/202608300232-build-atlas-v9-company-repd-links.py#L40-L42) |
| #975 | `sha256` | 67 | 94 | 5 | no | 2026-08-22 | [data-grid-gb/chatgpt/ingest_etys.py](https://github.com/Ventusltd/data-grid-gb/blob/5181de3423e4fe50c77c568b9f3066c61a1d9e41/chatgpt/ingest_etys.py#L43-L48) |
| #8285 | `sha256Hex` | 30 | 318 | 5 | no | 2026-08-29 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L114-L117) |
| #5168 | `escapeHTML` | 24 | 196 | 5 | yes | 2026-04-03 | [youengineer-code-review/civilisation-atlas-v8/ventus-corev8engine.js](https://github.com/Ventusltd/youengineer-code-review/blob/f86dcb229b40ea774b2b5af049dbdc4b90b476de/civilisation-atlas-v8/ventus-corev8engine.js#L9-L16) |
| #5609 | `(anonymous)` | 20 | 192 | 5 | no | 2026-04-07 | [code-generator/apps/substation-finder/Si/202609040045-ventus-corev8engine-deep-link-receiver.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609040045-ventus-corev8engine-deep-link-receiver.js#L126-L131) |
| #8328 | `(anonymous)` | 15 | 87 | 5 | no | 2026-08-30 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L776-L786) |
| #8319 | `numberOrNull` | 12 | 82 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L606-L611) |
| #8320 | `textOrNull` | 12 | 82 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L612-L615) |
| #8321 | `suppliedArrivalFields` | 12 | 82 | 5 | yes | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L605-L628) |
| #8323 | `retryExactRepdDeepLink` | 12 | 82 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L723-L732) |
| #8324 | `(anonymous)` | 12 | 82 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L742-L747) |
| #8325 | `(anonymous)` | 12 | 82 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L749-L761) |
| #8326 | `(anonymous)` | 12 | 82 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L763-L769) |
| #8327 | `bindSearch` | 12 | 82 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Ps/202609040229-place-global-search-arrival-identity.js#L734-L774) |
| #8767 | `representativePoint` | 11 | 252 | 5 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1696-L1714) |
| #8768 | `voltagesKv` | 11 | 252 | 5 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1722-L1740) |
| #8769 | `destinationPoint` | 11 | 248 | 5 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1754-L1764) |
| #8946 | `normalise` | 11 | 179 | 5 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L8332-L8336) |
| #8782 | `(anonymous)` | 10 | 357 | 5 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L2104-L2108) |
| #8850 | `(anonymous)` | 10 | 223 | 5 | yes | 2026-09-04 | [code-generator/apps/substation-finder/Si/202609031958-menu-bar.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609031958-menu-bar.js#L407-L413) |
| #8856 | `(anonymous)` | 10 | 223 | 5 | no | 2026-09-04 | [code-generator/apps/substation-finder/Si/202609031958-menu-bar.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609031958-menu-bar.js#L539-L542) |
| #8772 | `voltageOf` | 9 | 184 | 5 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1862-L1866) |
| #8773 | `ratingsOf` | 9 | 184 | 5 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1870-L1878) |
| #8775 | `parametersOf` | 9 | 184 | 5 | yes | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1929-L1936) |
| #8776 | `land` | 9 | 184 | 5 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1961-L1965) |
| #8777 | `siteOf` | 9 | 184 | 5 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L1975-L1978) |
| #8781 | `resolve` | 9 | 184 | 5 | no | 2026-09-01 | [code-generator/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js](https://github.com/Ventusltd/code-generator/blob/857ea81244848b1da8fe21fffaed74cab568a3b4/apps/substation-finder/Si/202609062358-substation-intelligence-v9-63.js#L2015-L2019) |

## Same name, different code

These names mean different things in different repositories, so check which version is meant before relying on one.

| Name | Different versions | Repositories |
|---|---|---|
| `load` | 30 | 16 |
| `check` | 44 | 14 |
| `build` | 72 | 13 |
| `normalise` | 9 | 13 |
| `draw` | 62 | 12 |
| `verify` | 12 | 12 |
| `require` | 16 | 11 |
| `__init__` | 22 | 10 |
| `write_json` | 17 | 10 |
| `fetch` | 14 | 10 |
| `record` | 17 | 9 |
| `setUp` | 13 | 9 |
| `classify` | 12 | 9 |
| `measure` | 11 | 9 |
| `start` | 57 | 8 |
| `frame` | 17 | 8 |
| `inspect` | 17 | 8 |
| `validate` | 17 | 8 |
| `walk` | 17 | 8 |
| `write` | 17 | 8 |
| `sha256` | 16 | 8 |
| `describe` | 11 | 8 |
| `haversine` | 7 | 8 |
| `step` | 22 | 7 |
| `read` | 13 | 7 |

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
