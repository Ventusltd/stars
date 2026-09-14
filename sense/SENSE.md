# Sense of the code universe

Generated 2026-09-14T10:08:47.714Z. 142 nodes, 549 edges, 88.1 KB.

This graph is not a list of files. It is the estate's code read in an order that makes sense, so the FOCUS list on the
Spider dashboard reads as a narrative from the whole to the parts:

1. **The code universe** — 10,807 distinct functions, 221 numbered blocks.
2. **What the code is for** — 11 purposes, each containing the blocks that serve it.
3. **The blocks** — 63 named blocks (constants, engines, cartridges, layers, apps, tools), wired by *depends_on*
   so a reader can walk from a purpose to a part to what that part needs.
4. **What is canonical** — 20 homes declared by the engine graph, holding 136 canonical functions.
5. **What is illusion** — 65 copies of those functions exist elsewhere (15 shown here); each is wired
   *should_import* to its home. They look like separate code; they are the same function written twice.
6. **What is a decision, not a fact** — 12 values in use in more than one form. No computation settles them.
7. **What is proven together** — 182 block pairs seen together in shipped apps and 6 unstable pairs, drawn as edges
   between the blocks. A block with no *proven* wire has never shipped in an app.
8. **What breaks** — the 5 most frequent composition-test errors, each wired to the block whose function throws it.
9. **What everything leans on** — the 20 most-used functions in the estate.

## Reading the colours

- green: settled, canonical, or a foundation.
- amber: open decision, or a home that still has copies.
- red: a copy that should import its home, or an error that is actually thrown.

## Edge types

- `contains`: 126
- `decides`: 12
- `depends_on`: 94
- `should_import`: 72
- `seen_together`: 182
- `unstable`: 6
- `proven`: 37
- `leans_on`: 20

## Sources

blocks/blocks.json, blocks/reactions.json, modular/dependencies.json, modular/decays.json, modular/engine-join.json, code/f/*.json
(all published at https://ventusltd.github.io/stars/).
