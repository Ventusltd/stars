# Sense of the code universe

Generated 2026-09-18T22:49:21.566Z. 142 nodes, 568 edges, 89.7 KB.

This graph is not a list of files. It is globalgrid2050 architecture development's code read in an order that makes sense, so the FOCUS list on the
Spider dashboard reads as a narrative from the whole to the parts:

1. **The code universe** — 13,520 distinct functions, 298 numbered blocks.
2. **What the code is for** — 11 purposes, each containing the blocks that serve it.
3. **The blocks** — 63 named blocks (constants, engines, cartridges, layers, apps, tools), wired by *depends-on*
   so a reader can walk from a purpose to a part to what that part needs.
4. **What is canonical** — 20 homes declared by the engine graph, holding 136 canonical functions.
5. **What is illusion** — 65 copies of those functions exist elsewhere (15 shown here); each is wired
   *should-import* to its home. They look like separate code; they are the same function written twice.
6. **What is a decision, not a fact** — 12 values in use in more than one form. No computation settles them.
7. **What is proven together** — 191 block pairs with passed tests or app co-occurrence, 6 pairs with mixed test evidence and 0 unstable pairs, drawn as edges
   between the blocks. A block not wired from this chapter has never shipped in an app; *proven* wires are composition tests that passed, *seen-together* wires are use without a test.
8. **What breaks** — the 5 most frequent composition-test errors, each wired to the block whose function throws it.
9. **What everything leans on** — the 20 most-used functions in globalgrid2050 architecture development.

## Reading the colours

- green: settled, canonical, or a foundation.
- amber: open decision, or a home that still has copies.
- red: a copy that should import its home, or an error that is actually thrown.

## Edge types

- `contains`: 180
- `concerns`: 12
- `depends-on`: 107
- `should-import`: 72
- `seen-together`: 191
- `mixed-evidence`: 6

## Sources

blocks/blocks.json, blocks/reactions.json, modular/dependencies.json, modular/decays.json, modular/engine-join.json, code/f/*.json
(all published at https://ventusltd.github.io/stars/).
