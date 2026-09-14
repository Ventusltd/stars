# Stars

A star is one recorded test of the GridAtlas map: a particular combination of map components,
switched on or off, loaded in a real browser and checked for errors. Each star has a fixed
identity, so the same test can be repeated and its result compared.

The tests run on our machines and are stored in
[Ventusltd/star-maker](https://github.com/Ventusltd/star-maker). This repository turns them into
summary reports. GitHub Actions rebuilds the reports every hour from the latest results, so no
local machine has to do it.

## Reports

| Report | What it answers |
|---|---|
| [Chemistry](reports/CHEMISTRY.md) | Which combinations of components always work, which fail, and the error each failure produces |
| [Vedic](reports/VEDIC.md) | How components group into broad classes, and whether each test respected its declared rules |
| [Random](reports/RANDOM.md) | Randomly chosen links between components, for spotting dependencies nobody wrote down (these are prompts to look, not findings) |

[`reports/source.json`](reports/source.json) records which snapshot of the test results was used.

## How it runs

- The workflow in `.github/workflows/refresh.yml` runs hourly and on demand.
- It reads star-maker read-only and never changes it.
- It saves a new version of the reports only when there are new test results.
- The builders in `builders/` are plain JavaScript. No AI model is involved.

## The Modular star

Every unique line of Ventusltd code gets a permanent number. Each file version is stored as its list of line numbers,
functions and classes are numbered as elements, and elements with the same logic share a family. Its purpose is to stop the same work being done twice.

- [Every unique line, numbered](LINES.md): the full list, one row per line, key then code (large; open the raw file)
- [Summary](modular/SUMMARY.md): work already done more than once, and names that mean different things in different places
- [Compiled library](library/standalone.mjs): self-contained functions that already appear in two or more places
- [Spider graph](modular/graph.json): the most repeated families, wired to their repositories, for the Spider dashboard
- **Before writing code:** `npm install`, then `node modular-star/find-prior.mjs your-file.js`
- The workflow in `.github/workflows/modular-star.yml` runs every hour. Each run first walks further back through the full commit history (the wandering star), then rebuilds the reports. The database and catalogue are kept on the
  [modular-star release](https://github.com/Ventusltd/stars/releases/tag/modular-star), and every run checks that no earlier number changed.
