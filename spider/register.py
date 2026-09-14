"""Register the graphs this repository publishes for the Spider dashboard.

Writes spider/features.yml, a list of graphs in the same shape as the entries of the dashboard's own
spider/manifest.json (ventus-grid-engine), and adapts any graph that is not yet in the dashboard's format
into spider/graphs/<id>.json. The dashboard's update workflow reads features.yml, checks each graph is
reachable, and adds it. Standard library only; no model involved.
"""
import json
import pathlib
import datetime

ROOT = pathlib.Path(__file__).resolve().parents[1]
SITE = "https://ventusltd.github.io/stars/"
OUT = ROOT / "spider" / "graphs"

# id, title, source file, who makes it, what it shows. Ids match the local Spider copies where they exist.
GRAPHS = [
    ("modular", "Modular star", "modular/graph.json", "stars/modular-star (build.mjs)",
     "Functions and classes found in two or more different files across the public Ventusltd repositories, wired to the "
     "repositories they live in and to other families sharing their name. Node ids are permanent numbers (family:N); "
     "GitHub opens the exact lines, External opens the published page. Rebuilt hourly on GitHub Actions."),
    ("chemistry", "Chemistry stars", "reports/chemistry/graph.json", "star-maker (chemistry.mjs), rebuilt by stars",
     "Which combinations of GridAtlas components always work, which fail, and the error each failure produces. "
     "Arithmetic over every recorded composition test."),
    ("vedic", "Vedic stars", "reports/vedic/graph.json", "star-maker (vedic.mjs), rebuilt by stars",
     "The five-element classification of the code: how components group into broad classes, and whether each test "
     "respected its declared rules."),
    ("random", "Random stars", "reports/random/graph.json", "star-maker (random.mjs), rebuilt by stars",
     "Randomly chosen links between components, for tripping over dependencies nobody wrote down. Prompts to look, "
     "not findings."),
]


def adapt(graph):
    """Bring a graph into the dashboard's generic shape: nodes with ids, edges by id with a type."""
    nodes = graph.get("nodes") or []
    if nodes and all("id" in n for n in nodes):
        return graph, False
    seen = set()
    out_nodes = []
    for n in nodes:
        label = str(n.get("label", ""))
        if not label or label in seen:
            continue
        seen.add(label)
        node = {"id": label, "label": label, "type": n.get("type", "unknown"), "rag": str(n.get("rag", "grey")).lower(),
                "reason": n.get("reason", "")}
        for k in ("gh", "ext"):
            if n.get(k):
                node[k] = n[k]
        out_nodes.append(node)
    index = {n["id"]: i for i, n in enumerate(out_nodes)}
    out_edges = []  # index arrays, the receiver's compact edge form (as genome-spider publishes)
    for e in graph.get("edges") or []:
        a, b = e.get("from"), e.get("to")
        if a in index and b in index:
            out_edges.append([index[a], index[b], e.get("type") or e.get("kind") or "repo"])
    adapted = {k: v for k, v in graph.items() if k not in ("nodes", "edges")}
    adapted["adapted_for"] = "ventus-grid-engine Spider receiver (ids = labels, edge kind = type)"
    adapted["nodes"], adapted["edges"] = out_nodes, out_edges
    return adapted, True


def yaml_str(s):
    return json.dumps(s, ensure_ascii=False)  # a JSON string is a valid YAML double-quoted scalar


features = []
OUT.mkdir(parents=True, exist_ok=True)
for gid, title, src, spider, description in GRAPHS:
    path = ROOT / src
    if not path.exists():
        continue
    graph = json.loads(path.read_text(encoding="utf-8-sig"))
    graph, changed = adapt(graph)
    if not graph["nodes"]:
        continue
    if changed:
        target = OUT / f"{gid}.json"
        target.write_text(json.dumps(graph, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        url = SITE + "spider/graphs/" + gid + ".json"
    else:
        target, url = path, SITE + src
    if target.stat().st_size > 160 * 1024:  # the dashboard fetches every registered graph on load; keep the front door quick
        print(f"{gid}: {target.stat().st_size // 1024} KB is over the 160 KB limit, not registered")
        continue
    features.append((gid, title, url, spider, description, len(graph["nodes"]), len(graph["edges"]),
                     graph.get("generated_utc", "")))

lines = [
    "# Graphs this repository publishes for the Spider dashboard (ventus-grid-engine spider/manifest.json).",
    "# Written by spider/register.py on every build. Each entry has the same fields as a manifest entry.",
    "schema_version: spider-features-v1",
    f"generated_utc: {yaml_str(datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'))}",
    "site: " + yaml_str(SITE),
    "graphs:",
]
for gid, title, url, spider, description, n, e, gen in features:
    lines += [
        f"  - id: {yaml_str(gid)}",
        f"    title: {yaml_str(title)}",
        f"    path: {yaml_str(url)}",
        "    edges_path: null",
        f"    source_spider: {yaml_str(spider)}",
        f"    description: {yaml_str(description)}",
        f"    nodes: {n}",
        f"    edges: {e}",
        f"    graph_generated_utc: {yaml_str(gen)}",
    ]
(ROOT / "spider" / "features.yml").write_text("\n".join(lines) + "\n", encoding="utf-8")
print(f"{len(features)} graphs registered: " + ", ".join(f"{f[0]} ({f[5]} nodes / {f[6]} edges)" for f in features))
