# The Modular Star

*Every unique line of code we have ever written, numbered once and for ever, so that nothing is written twice
without knowing it.*

Written 14 September 2026. Numbers are from the run committed at 08:06 London that morning and change with every hourly run;
the live figures are always in [`modular/SUMMARY.md`](modular/SUMMARY.md).

## The idea in one paragraph

Take every version of every code file in every Ventus repository, back to the first commit. Split each into
its lines. Give each line that has never been seen before a number, and never give that number to anything
else. A file is then just a list of numbers, a **tablet**. Inside each tablet, every function and class is
an **element**, numbered too, and elements whose logic is the same, ignoring spaces, line breaks and comments,
share a numbered **family**. Because the numbers never change, a link to line, element or family #N stays true
for ever, and the question "has this been written before?" becomes a lookup instead of a memory.

## What it found on the first night

| | count |
|---|---|
| Repositories read (public) | 46 |
| Commits walked (all of them) | 8,953 |
| Unique lines ever written | **247,444** |
| File versions (tablets) | 5,470 |
| Functions and classes (elements) | 16,844 |
| Families (same logic) | 15,502 |
| Families written in two or more different files: duplicate work | **3,160** |
| Families only copied between versions of one file: versions, not duplicates | 840 |
| Self-contained functions compiled into a reusable library | 319 |
| Size of the whole database, compressed | 30 MB |

Three hundred randomly chosen files were rebuilt from their numbers and compared with GitHub: all matched byte
for byte.

## The finding that matters most

The most duplicated logic in the estate is the distance maths. `distanceKm` exists in 248 places across 10
different files in 5 repositories, and `initialBearingDeg` in 251 places across 10 files, first written in
late August 2026. `sha256` is written 98 times in 67 different files. `escapeHTML` has 188 copies going back to
April. These are not release copies; they are the same function typed into different projects.

This is exactly what the EARTH_KM decision is about: two earth radii are in use, and the haversine that uses
them is copied rather than shared. The modular star turns that from a suspicion into a list with links.

The same report shows the opposite problem: names that mean different things in different places. `check`
has 38 different versions across 11 repositories, `normalise` 8 across 11, `verify` 11 across 10. Anyone
reading one of those names has to ask which one is meant.

## How to use it

**Before writing code**, from a checkout of this repository:

```
npm install
node modular-star/find-prior.mjs path/to/your-file.js
```

For every function in the file it prints one of three things: **new**, **SAME CODE** (it exists word for
word) or **SAME LOGIC** (it exists in a different layout), with links to where it already lives and, where
the repository publishes a site, the live page that serves it.

**In the Spider dashboard**, the graph [`modular/graph.json`](modular/graph.json) shows the most repeated
families wired to the repositories they appear in, and to other families sharing their name. Green means
self-contained; amber means the function needs something from outside itself, and the card lists what.
GitHub opens the exact lines at a fixed commit; External opens the published page.

**The library**, [`library/standalone.mjs`](library/standalone.mjs), holds one copy of each self-contained
function that appears in two or more places, unchanged, with a comment linking its source. They are
candidates for reuse, not reviewed code.

## How it works

1. **Wandering star** (`modular-star/wandering.mjs`): walks the full commit history of every public
   repository, oldest commit first, and feeds every added or changed code file into the database with the
   date it was written. It resumes where it stopped, so it never repeats work.
2. **Modular star** (`modular-star/build.mjs`): reads the current branch of every repository, then writes
   the summary, the graph, the library and the lookup catalogue.
3. **The permanence check** (`modular-star/check-permanent.mjs`): before anything is saved, every number from
   the previous database must still mean the same thing. If one changed, the run fails and nothing is saved.
4. All of it runs on GitHub Actions, hourly, in about ten minutes. The laptop does nothing.

The database and the lookup catalogue live on the
[`modular-star` release](https://github.com/Ventusltd/stars/releases/tag/modular-star).

## Why the numbers must never change

The number is the identity. The Spider, the tablets, the library and every link in every report refer to
it. An earlier index of ours lost its old numbers when it rewrote its table, and every reference into it
went stale at once. Here the numbers are append-only, and the permanence check makes that a rule the
machine enforces rather than a habit people keep.

## What it does not do yet

- Public repositories only, by design: this repository is public, so private code never enters it.
- JavaScript, HTML scripts and Python. Other languages are stored as lines but not split into functions.
- Files over 1 MB, minified files and vendored folders are skipped.
- It finds the same logic, not similar logic. Two functions that do the same job differently are two families.
- It does not judge which copy is the right one. That is a decision, and decisions are made in daylight.
