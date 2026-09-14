# The code universe in the Spider

*How every unique line ever written, with its permanent number, becomes a particle in the Spider dashboard
at https://ventusltd.github.io/ventus-grid-engine/ — and what that makes possible with the chemistry stars.*

Written 14 September 2026 after reading the dashboard page line by line. Decisions marked **DECIDE** are Vikram's.

## How the dashboard works today (read from `index.html`)

1. It is the Spider Sandbox reference page, copied character for character, with three path lines changed and a
   receiver appended. The receiver reads `spider/manifest.json` and, on every open, fetches every graph the manifest
   lists and adds one root card per graph. There is no lazy loading.
2. A graph is a list of nodes (`label, type, rag, reason, gh, ext`) and edges (`from, to, type`). Cards show the
   badge, the name and the RAG dot; **the focused card also shows `reason`, and `reason` is rendered as HTML**.
   Column view lists the focused node's dependencies and dependents; spider view lays the same cards out on a
   canvas with coloured wires. Both views draw only the focused node and its neighbours.
3. Drill-in exists only from root cards (`child`). Inside a graph there is no drill-in.
4. `?graph=<id>` opens a graph; `?focus=<label>` centres a node. Tap actions: Explore, GitHub (`gh`), External (`ext`).
5. `?graph=engine-graph` is a hand-made duplication map of the engine: 53 file nodes wired by *supersedes*,
   *duplicates*, *drifts_from*, *should_import*, each edge carrying file-and-lines evidence. `engine/geo-core.js`
   is "the one haversine", with three named radii (`R_ATLAS`, `R_UK`, `R_MEAN`).

## What is integrated now, with no change to the page

- **The code itself, on the card.** Each family's focused card now carries its lines, numbered with their permanent
  keys, in the dashboard's own monospace. GitHub stays one tap away as the check; nobody has to leave to read.
- **Wires to the engine.** Any family whose copy sits in a file the engine-graph cites, at the cited lines, is wired
  to that engine node (canonical home, superseded fragment, or cited copy). The engine node deep-links to
  `?graph=engine-graph&focus=<that file>`. The two graphs now agree on what is canonical.
- **Chemistry decays → code.** Each error a red composition test produces (for example *sld-sandbox requires the
  sld-styles module*, 702 red stars) is searched for in the numbered lines, and wired to the functions that carry it.
  A red star now leads to the line that throws it.
- **Code report and generator.** Every family has a page (every place it is used, the live page, its line keys,
  copy) and can be assembled into a new app with a report that lists what it still needs.
- The element numbers are the family numbers: **this is the periodic table's atomic number**, and self-contained
  versus needs-context is its first property.

## To show *all* the code as particles: what needs the page to change

The front door loads every listed graph on open, so 16,844 functions cannot be listed as cards. Three small,
additive changes to the receiver (appended below its comment line, like everything the receiver already adds;
the receiver proof kept passing; a new proof added):

1. **Lazy drill-in.** A node may carry `child_path`; drilling into it fetches that graph then. The front door stays
   one small card, "Code universe"; drill-in opens a repository; drill-in again opens a function with its lines as
   particles.
2. **Particles.** In spider view, when a scope has more than about 60 nodes, draw the non-neighbours as dots (one per
   family, colour by RAG, placed by repository and kind) and show text only for the focused node and its neighbours.
   Text where you look, dots everywhere else, so the graphics stay light.
3. **Lines as particles.** A function's scope lists its lines as nodes (`14137 │ const s = a + b;`), wired in order,
   each line a dot until focused. The same line number appearing in two functions is the same particle: shared
   lines become visible wires between functions.

**DECIDE 1.** Allow these additive changes to `index.html`, or build the universe as a new spider species page that
copies the receiver and is linked from the dashboard as a card. Recommendation: change the receiver, additively,
because the dashboard is the master IDE and this is what it is for.

## Decisions waiting

- **DECIDE 2. The engine push** (`Dropbox\claude-spider-features`): lets the dashboard list graphs from registries
  automatically. Until then the Modular and Generated-apps cards do not appear on the front door.
- **DECIDE 3. EARTH_KM.** The engine already holds three named radii by purpose in `geo-core.js`. The decision is
  whether that settles it: every other copy of `distanceKm` (248 places) is superseded and should import from the
  engine, and generated apps take the radius from there, never as a bare number.
- **DECIDE 4. sld-sandbox NEEDS, 220 kV provenance, TECHNOLOGIES vocabulary** — the three other evidence packs.
- **DECIDE 5. Private repositories.** The modular star reads public code only, because `stars` is public. Including
  the four private repositories needs a private twin of the star with a read token.
- **DECIDE 6. Codex's local library scan.** It duplicates the wandering star, hit its 896 MB cap at 03:08, and has
  failed every run since. Retire it in favour of the GitHub one, or have Codex adopt the tablet storage.
