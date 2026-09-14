# Engine patch: wires coloured and labelled by verdict class

*The exact, additive change to `ventus-grid-engine/index.html` that would make a wire's type visible on the canvas.
Not applied; the owner of the page decides. Written 14 September 2026 against the page as served that day.*

## What the page does today

Read from `index.html`:

- Line 176 `ECSS` maps an edge type to a wire colour; line 178 `REL` maps it to the label on a neighbour card and in
  the legend. Both fall back to `repo` (`#b8ccff`, "repo ref") for any type they do not know. Every star graph's
  type is unknown to them, which is why every wire is drawn the same.
- `cardInner()` (line 195) writes the arrow words "depends on →" or "← depended on by" on every neighbour card
  regardless of type, so a block "depends on" its category and a fault "depends on" the function that throws it.
- `drawColumn()` (line 200) lists a focused card's neighbours in two sections, "Depends on →" and "← Depended on
  by", in edge order.
- `marker()` (line 201) makes one SVG arrowhead per type with the id `arr-<type>`; a type with a space would break
  the `url(#arr-…)` reference, which is why the vocabulary uses hyphens.
- The receiver comment at line 215 marks the boundary: nothing above it is changed; additions go below.
- The receiver already does exactly this kind of addition once: `loadContents()` sets
  `REL.contains="contains";ECSS.contains="#7da0c8";` for the contents graph.

## The change

Append the block below at the end of the receiver script, after the `wireReceiver()` definition and before the
closing IIFE on line 288 (or after it; both work, because `draw()` looks the two functions up by name when it runs).
Nothing above the receiver comment changes. No CSS is added: colours come from the page's own `RAG` and `ECSS`
constants, and the sections reuse the existing `.sect`, `.branch`, `.twig`, `.empty` classes.

```js
/* --- Relationship vocabulary (Ventusltd/stars, relationships/VOCABULARY.md).
   Appended after the receiver; nothing above is changed. Every wire type the
   star graphs publish gets a verdict class; the class gets a colour from the
   page's own palette (RAG and ECSS above); the arrow words on a neighbour
   card say what the wire means instead of "depends on"; the column view
   groups a focused card's neighbours by class. A graph whose types are not
   in the table (federation, contents, the built-ins) is drawn exactly as
   before: both overrides hand back to the original function. --- */
const WIRE_CLASS={"depends-on":"dependency","imports":"dependency",
  "contains":"containment","found-in":"containment",
  "canonical":"evidence","implements":"evidence","proven":"evidence","seen-together":"evidence","produces":"evidence","run-of":"evidence","checked-by":"evidence","triggers":"evidence",
  "should-import":"debt","should_import":"debt","supersedes":"debt","duplicates":"debt",
  "unstable":"warning","fails":"warning","thrown-by":"warning","same-name":"warning","drifts_from":"warning",
  "concerns":"question"};
const CLASS_COLOUR={dependency:ECSS.repo,containment:ECSS.archive,evidence:RAG.green,debt:RAG.amber,warning:RAG.red,question:ECSS.governance};
const CLASS_ORDER=["dependency","containment","evidence","debt","warning","question"];
/* Arrow words on a neighbour card: [focused card is the source, focused card is the target]. */
const WIRE_WORDS={"depends-on":["depends on →","← used by"],"imports":["imports →","← imported by"],
  "contains":["contains →","← part of"],"found-in":["found in →","← holds"],
  "canonical":["canonical home →","← canonical home of"],"implements":["implements →","← implemented by"],"proven":["proven with →","← proven with"],"seen-together":["seen with →","← seen with"],"produces":["produces →","← produced by"],"run-of":["run of →","← run"],"checked-by":["checked by →","← checks"],"triggers":["triggers →","← triggered by"],
  "should-import":["should import →","← should import this"],"should_import":["should import →","← should import this"],"supersedes":["supersedes →","← superseded by"],"duplicates":["duplicates →","← duplicated by"],
  "unstable":["unstable with →","← unstable with"],"fails":["fails with →","← fails with"],"thrown-by":["thrown by →","← throws"],"same-name":["same name as →","← same name as"],"drifts_from":["drifts from →","← drifted from by"],
  "concerns":["concerns →","← decision"]};
for(const t in WIRE_CLASS){if(!ECSS[t])ECSS[t]=CLASS_COLOUR[WIRE_CLASS[t]];if(!REL[t])REL[t]=WIRE_CLASS[t]+" · "+t.replace(/[-_]/g," ");}
const cardInnerFlat=cardInner;
cardInner=function(node,opts={}){const html=cardInnerFlat(node,opts);const rel=opts.rel,w=rel&&WIRE_WORDS[rel.type];if(!w)return html;return html.replace(rel.dir==="out"?'<span class="arrow">depends on →</span>':'<span class="arrow">← depended on by</span>',`<span class="arrow">${rel.dir==="out"?w[0]:w[1]}</span>`);};
const drawColumnFlat=drawColumn;
drawColumn=function(focus,out,inc){if(![...out,...inc].some(it=>WIRE_CLASS[it.type]))return drawColumnFlat(focus,out,inc);const nodes=S().nodes;const shell=document.createElement("div");shell.className="shell";shell.innerHTML=`<div class="focuswrap">${cardInner(focus,{center:true,dim:!actionable(focus),go:goLabel(focus)})}</div>`;const section=(title,items,dir)=>{const s=document.createElement("div");s.innerHTML=`<div class="sect">${title}</div>`;const br=document.createElement("div");br.className="branch";items.forEach(it=>{const node=nodes[it.other],dim=!actionable(node);const t=document.createElement("div");t.className="twig";t.style.setProperty("--twig",ECSS[it.type]||ECSS.repo);t.innerHTML=cardInner(node,{rel:{type:it.type,dir},dim,go:goLabel(node)});t.addEventListener("click",()=>handleTap(it.other));br.appendChild(t);});s.appendChild(br);return s;};const cls=it=>WIRE_CLASS[it.type]||"dependency";let any=false;for(const c of CLASS_ORDER){const o=out.filter(it=>cls(it)===c),i=inc.filter(it=>cls(it)===c);if(o.length){shell.appendChild(section(c+" →",o,"out"));any=true;}if(i.length){shell.appendChild(section("← "+c,i,"in"));any=true;}}if(!any){const e=document.createElement("div");e.className="empty";e.textContent="None";shell.appendChild(e);}overlay.appendChild(shell);shell.querySelector(".focuswrap .card").addEventListener("click",()=>handleTap(current));};
```

## What a reader then sees

- Spider view: wires and arrowheads in six colours (dependency blue-white, containment blue-grey, evidence green,
  debt amber, warning red, question purple), and a legend that reads "debt · should import", "warning · thrown by",
  "question · concerns".
- Column view: a focused card's neighbours grouped under "dependency →", "← containment", "← debt", "← question",
  in that order, each twig's left border in the class colour (the `--twig` variable the page already uses).
- Every neighbour card says what the wire means: "← 14 copies should import this" replaces "← depended on by".
- The `mode` filter (both, in, out) is honoured because `draw()` empties `out` or `inc` before calling
  `drawColumn`, as it does today.

## Why the receiver proof keeps passing

`spider/receiver.proof.mjs` drives the page from `file://`, where no manifest graph can load, and checks the
built-in federation and contents graphs: card layout, the FOCUS re-centre, the 🕷 button's two states. Their edge
types (`data`, `governance`, `archive`, `external`, `repo`, `workflow`, `contains`) are not in `WIRE_CLASS`, so both
overrides return the original functions' output byte for byte, and `ECSS.contains`/`REL.contains` are left as
`loadContents()` set them (the loop only fills a type that is absent). Function declarations at the top level of a
classic script are reassignable bindings, so `cardInner=…` and `drawColumn=…` take effect for `draw()` without
editing lines 195 or 200.

## What is not changed

`ROOT_NODES`, `normaliseGenericGraph`, `neighbours`, `drawSpider`, `marker`, the count line ("dependencies ·
dependents") and the `?graph=`/`?focus=` handling. The count line could later say "3 dependencies · 12 dependents ·
2 debts · 1 question"; that is a second, separate addition.

## Decision for the owner

Apply the block above to `index.html` (one commit, `node spider/receiver.proof.mjs` run by hand afterwards), or
leave the relationship line on the focused card as the only place the vocabulary shows. `modular-star/relate.mjs`
writes that line either way.
