# The non-coder's journey

An audit of the public pages of globalgrid2050 architecture development as a UK grid-connection professional
reaches them on a phone, without reading code: homepage → Grid Engine → Relational mapping → a card →
External → the table page or the code report → back. Read from the served HTML and data on 14 September 2026.
Findings are in priority order; each has its fix and says whether the fix is done or waits for the owner of
that page.

Pages this repository owns: `start.html` (new), `table.html`, `code.html`, `tools/pages-check.mjs`. The dashboard
(ventus-grid-engine), the homepage and the code generator are named here only so their owners can act.

## 1. There was no way back, and no way in from the top

- `https://ventusltd.github.io/stars/` answered 404: a reader who trimmed the address to find the front of the site
  hit a dead end. Neither page linked to the homepage or to the map it was opened from; the only way back was the
  browser's history, and on a phone the "In the Spider" link opened a new tab, so history did not lead back either.
- **Fixed**: every page carries the same one-line navigation: `← Map` (the map that opens this page), `Home`,
  `Start here`, and the sister page. Map links open in the same tab so the phone's back button returns.
- **Owner**: the shared menu module (`estate-menu.js`) has no entry for these pages, and the homepage nest only
  lists the twelve dashboard cards. A `Start here` entry under Relational mapping, pointing to
  `https://ventusltd.github.io/stars/start.html`, would give the non-coder a front door. The dashboard page has no
  link back to the homepage either; the only navigation is its Focus dropdown.

## 2. The dashboard's External action is three taps and two words away from a non-coder

- Arriving on a card from the homepage, the reader sees Focus, Show (Both / Outgoing / Incoming), Spider, and a
  "Tap does" row: Explore, GitHub, External, Status (disabled). To reach the table page they must work out that
  "External" changes what a tap does, press it, then tap a card. Nothing says "open this block's page". "External"
  reads as "leaves the site" and "Explore" as "look around", neither as "open".
- **Fixed here**: `start.html` explains it in one line at the foot ("Tap does sets what a tap on a card does…"),
  and both pages now link back to the exact map so the round trip is short.
- **Owner (dashboard)**: rename the action buttons to plain verbs ("Show links", "Open on GitHub", "Open its page")
  or put an "Open its page" link on the focused card itself. Three of the nine registered graphs (Compatibility,
  Classification, Sampling) have no `ext` at all, so External does nothing on them; the button should say so or
  hide.

## 3. Jargon on the pages

| Word on the page | What a non-coder reads | Plain words now used |
|---|---|---|
| auto-blocks | unknown | blocks found automatically from source files |
| `fn` on every tile | unknown | functions |
| family, family number | a surname | function #N, "one number shared by all copies of the same logic" |
| standalone / needs context | unclear | self-contained: works on its own / needs from elsewhere |
| In the Spider, Open in the Spider | unknown | See it on the map |
| unsettled / UNSETTLED | a mood | value not yet agreed |
| kind: engine, cartridge, deeplink, auto | unknown | an engine module, a plug-in part of the map, a link contract, found automatically… |
| Needs from outside | outside what? | Needs from elsewhere |
| `×40` after a function name | unknown | kept, but the list is now titled "most used first" so the number reads as a count |
| Copy code, Copy import from library | for coders only | Copy the code, Copy an import line; moved to the end of the button row |
| Modular star, Spider, cartridge, tablet, element, genome | internal names | not removed where they are the name of a thing (the map is still "the map"; "Modular star" is now only in the linked explanation) |

Still on the pages because they are the name of a thing and the owner should decide: **block**, **repository**,
**GitHub**, **haversine**, **GeoJSON**, **cartridge** (in block titles), the block symbols (At, Ek, Gc…).

## 4. Dead ends and heavy links

- **"Every unique line" is a 21 MB file** (`LINES.md`, 5.6 MB compressed), linked from the foot of every code report
  with nothing to say so. On a phone it stalls or is refused. **Fixed**: labelled "(21 MB, not for phones)"; the
  check tool warns on its size on every run. **Owner**: consider a paged or per-repository version.
- **"What this is" and "Summary" opened raw Markdown** (`MODULAR-STAR.md`, `modular/SUMMARY.md` are served as
  `text/markdown`, which the phone shows as plain text or downloads). **Fixed**: both now open the rendered file on
  GitHub.
- **`table.html?category=…` did nothing**: the code report and 12 dashboard cards link to it, and the table ignored
  the parameter and opened at the top. **Fixed**: the table now scrolls to that subject, underlines it and shows a
  "Showing the subject … · show every subject" line; each subject heading is a link that does the same.
- **The code report opened empty**: no query, nothing on the page but a search box and a footer. **Fixed**: a landing
  card says what a report is, offers four example functions to tap, and points the reader who does not know a name
  to the table.
- **"No family #N"** for an unknown number, with no next step. **Fixed**: the message says what to do.
- **"Add to an app" leads to a terminal command**: the code generator page shows `gh workflow run …`, which a
  non-coder cannot use, and it needs write access to that repository. **Fixed here**: the table and `start.html`
  say the generator needs a GitHub account with access. **Owner (code generator)**: a request form (an issue
  template, or a workflow_dispatch link on GitHub) would let a non-coder ask for an app without a terminal.
- **Code fetched from raw.githubusercontent.com**: the code report reads source from GitHub at the exact commit;
  it is not a script and not a CDN, but on a network that blocks GitHub the code pane shows a plain message and the
  rest of the report still works. No change.

## 5. The table was 207 tiles long on a phone

- 63 named blocks and 144 blocks found automatically, all in one scroll, with the automatic ones (titles such as
  "Watchdog" and "Run study", all from one audit repository) taking two thirds of the page under "Other tools".
- **Fixed**: the 144 automatic blocks sit behind one line, "144 blocks found automatically from source files, in
  number order (tap to show)", which opens itself when a link names one of them. Every named block is still on the
  page, in number order within its subject.
- The detail panel is sticky at the bottom of the screen and had no close button, so on a phone a long block
  (Ss, sld-sandbox, 698 functions) covered most of the screen until another tile was tapped. **Fixed**: a close
  button, a 70 % height cap with its own scroll, and the panel closes cleanly from the address bar too.

## 6. The most useful action was not first

- On a block, the first button was "Add to an app" (coders only); on a function, "Copy code". A grid professional
  wants to see the thing running.
- **Fixed**: the order is now Open the live page (highlighted when it exists) → See it on the map → Add to an app /
  Open on GitHub → Copy. On the code report the "where it is used" table now comes before the code, with live
  pages first, and the code is in a section the reader can fold.

## 7. Lists were in arrival order

- Depends on, Used by, the parts list, the "uses" and "used by" of a function, and the places table were in the
  order the builder wrote them. **Fixed**: alphabetical for names and repositories, most-used first for the parts
  list, live pages first for places, number order for blocks and for "used by".

## 8. No "Start here"

- Nothing asked the reader what they wanted to do. **Fixed**: `start.html` asks one question, then one more
  (three at most): see what has been built / find one piece of code / check that things work / build an app, and
  every answer is one tap to the right map, subject or page. No code is shown until the reader opens a function
  on the code report. It uses the pages' own dark monospace style and no script from any other host.

## 9. Checks

- All three pages: no `<script src>` at all, no stylesheet from another host, scripts parse under Node 24.
- `tools/pages-check.mjs` fetches each page and every file it reads or links to, reports status and size, flags a
  script or stylesheet from a host outside `ventusltd.github.io` and `globalgrid2050.com`, and now runs in
  `modular-star.yml` after the graph checks. An HTTP error on our own file fails the run; a file committed in the
  last 30 minutes that Pages has not served yet is a warning, so the run after a push does not fail on deploy lag.
  Size limits (64 KB for a page, 2 MB for a data file) are warnings unless `--strict`.

## For the owner to decide

1. A `Start here` entry on the homepage nest and in the shared menu, so the front door is reachable from the top.
2. Plain verbs on the dashboard's "Tap does" row, and an "Open its page" link on the focused card.
3. The names kept as names: block symbols, "cartridge" in block titles, "haversine", "GeoJSON".
4. A way for a non-coder to request an app without a terminal (code generator).
5. `LINES.md`: keep the 21 MB file, or replace the link with a per-repository page.
