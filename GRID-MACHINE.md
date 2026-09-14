# The grid machine

*Three minutes on what the Spider Sandbox has become, and how the same page becomes a machine for grid modelling.*
14 September 2026.

## What is brilliant about it

Look at one screen. A cartridge version, `Si(202609051526)`, focused on a phone, with 66 compounds and 66 red,
and 22 wires fanning out to the failures it caused, each wire a real recorded test, each card the exact error.
Nobody drew that. The page that shows it has not been changed for it; it was designed to read what it is
given, and it was given the truth.

That is the whole idea in one picture. The intelligence is not in the page. It is in the graphs, and the graphs
are made from evidence with permanent keys: a line number that never changes, a function family that never
changes, a test that can be replayed from its seed. The page is an eye. The graphs are what it sees.

Three things make it more than a diagram:

1. **It explores one relation at a time.** Focus a node; see what it depends on and what depends on it. That is
   the smallest unit of reasoning there is: from here, what follows, what precedes. Walk, and you have reasoned.
2. **Every card opens the thing itself.** GitHub at the exact lines, the live page, the report. The picture is
   never the last word; the evidence is one tap away.
3. **The same shape holds everything.** Code, tests, blocks, apps, decisions: all nodes and wires. A grid is
   nodes and wires too.

## How it becomes a grid machine

Nothing new is needed in the page to model a grid. A grid graph in the same shape:

| Node | Edge | RAG | Reason on the card |
|---|---|---|---|
| substation, line, connection point, site, project | connects-to, feeds, constrained-by, applies-for | headroom: green has capacity, amber is near, red is full | the numbers: voltage, rating, distance, electrical distance, firm capacity |

The arithmetic already exists as the engine's canonical modules (distance and bearing, nearest search,
electrical distance, rating envelope, firm capacity, connection capacity, corridor estimate). The data already
exists in the estate's grid datasets. A script that joins the two writes a graph the Spider can walk: focus a
site, see the substations it could connect to, the capacity along each path, the corridor cost, the decision.
That is grid modelling as walking, on a phone, with the evidence one tap away.

## Where the intelligence goes next (small steps, in order)

1. **Wires carry a verdict.** Today every wire is drawn the same. Let a wire's type mean something the page shows:
   evidence (proven together), debt (a copy that should import the canonical), warning (unstable), question
   (a decision not yet taken). One additive change to the receiver, and the illusion becomes visible on the
   canvas instead of only in the card's text. This is the one change the page itself needs.
2. **A "why" on every red card.** For any red node, a script writes the path to its cause as one sentence:
   *red because this cartridge version throws "requires the sld-styles module" at line 48,213, in a function
   whose canonical home is elsewhere.* The machine answers "why" by walking, and writes the walk down.
3. **The loop closes.** Pick blocks in the generator, build a cartridge, test it in the Bench, and the result is a
   new star, which becomes new wires in the Spider. Proof of work feeds back into the map of work. The machine
   learns from what it makes, without a model: every fact it adds has a key and a source.
4. **The first grid graph.** Substations, lines and connection points from the estate's datasets, with the engine's
   numbers on the cards, registered like any other graph. From then on the grid and the code that models it are
   walked in the same eye.

## The idea underneath

The illusion, in code, is that every copy is separate work. The Spider dissolves it by showing the family. The
illusion, in the grid, is that every project is separate: in truth they queue on the same substations and share
the same headroom. The same walk dissolves both. That is why one page can be both a code sandbox and a grid
machine: it does not model code or grids; it models what depends on what, with proof.
