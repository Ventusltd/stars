# Proof of work

Updated 2026-09-23 23:09 UTC by GitHub Actions. Green passed, amber needs a look, red failed, blue still running, grey not readable from here.
The same graph, card by card, is `proof/graph.json` (26 KB, 40 cards, 68 links), registered for the Spider dashboard as **Proof of work**.

| Workflow | Latest run | Started | Took | Last 10 |
|---|---|---|---|---|
| Modular star | [running now (this run writes this graph)](https://github.com/Ventusltd/stars/actions/runs/35932065351) | 2026-09-23 23:08 UTC |  | 6 of the last 7 runs passed |
| Refresh reports | [passed](https://github.com/Ventusltd/stars/actions/runs/35917712198) | 2026-09-23 20:42 UTC | 24 s | 10 of the last 10 runs passed |
| Generate app | [passed](https://github.com/Ventusltd/code-generator/actions/runs/34846587798) | 2026-09-14 13:00 UTC | 37 s | 5 of the last 7 runs passed |
| Spider features | not installed |  |  |  |

```mermaid
flowchart LR
  classDef ok fill:#153d2a,stroke:#39d353,color:#e6edf3
  classDef warn fill:#3d2f0f,stroke:#ffd54a,color:#e6edf3
  classDef fail fill:#3d1414,stroke:#ff6b6b,color:#e6edf3
  classDef live fill:#12304a,stroke:#58a6ff,color:#e6edf3
  classDef off fill:#21262d,stroke:#6b7280,color:#9aa3b5
  subgraph g_workflows["Workflows"]
  n_wf_modular_star["Modular star"]:::live
  n_wf_refresh["Refresh reports"]:::ok
  n_wf_generate["Generate app"]:::ok
  n_wf_spider_features["Spider features"]:::off
  end
  subgraph g_runs["Latest runs"]
  n_run_35932065351["Modular star · 09-23 23:08"]:::live
  n_run_35917712198["Refresh reports · 09-23 20:42"]:::ok
  n_run_34846587798["Generate app · 09-14 13:00"]:::ok
  end
  subgraph g_artefacts["Artefacts"]
  n_art_summary["Modular star summary"]:::ok
  n_art_lines["Every numbered line"]:::ok
  n_art_code["Code report page"]:::warn
  n_art_modular_graph["Modular star graph"]:::ok
  n_art_blocks["Periodic table of blocks"]:::ok
  n_art_table["Periodic table page"]:::warn
  n_art_blocks_graph["Periodic table graph"]:::ok
  n_art_reactions["Chemistry of blocks"]:::ok
  n_art_library["Compiled library"]:::ok
  n_art_features["Dashboard registry"]:::ok
  n_art_proof["Proof of work graph"]:::ok
  n_art_structure["Structure graph"]:::ok
  n_art_chemistry["Chemistry report"]:::ok
  n_art_vedic["Classification report"]:::ok
  n_art_random["Random report"]:::ok
  n_art_release["Numbered database (release)"]:::ok
  n_app_geodesy["App · geodesy"]:::ok
  n_app_substation_finder["App · substation-finder"]:::ok
  end
  subgraph g_checks["Checks"]
  n_chk_tests["Unit tests"]:::ok
  n_chk_rebuild["Rebuild check"]:::ok
  n_chk_permanence["Permanence check"]:::ok
  n_chk_library["Library loads"]:::ok
  n_chk_size["Graph size limit"]:::ok
  n_chk_parses["Generated app parses"]:::ok
  n_chk_pages["Published to the web"]:::ok
  end
  n_wf_modular_star == triggers ==> n_wf_refresh
  n_wf_modular_star == triggers ==> n_wf_spider_features
  n_run_35932065351 -. run .-> n_wf_modular_star
  n_run_35917712198 -. run .-> n_wf_refresh
  n_run_34846587798 -. run .-> n_wf_generate
  n_wf_modular_star --> n_art_summary
  n_run_35932065351 --> n_art_summary
  n_wf_modular_star --> n_art_lines
  n_run_35932065351 --> n_art_lines
  n_wf_modular_star --> n_art_code
  n_run_35932065351 --> n_art_code
  n_wf_modular_star --> n_art_modular_graph
  n_run_35932065351 --> n_art_modular_graph
  n_wf_modular_star --> n_art_blocks
  n_run_35932065351 --> n_art_blocks
  n_wf_modular_star --> n_art_table
  n_run_35932065351 --> n_art_table
  n_wf_modular_star --> n_art_blocks_graph
  n_run_35932065351 --> n_art_blocks_graph
  n_wf_modular_star --> n_art_reactions
  n_run_35932065351 --> n_art_reactions
  n_wf_modular_star --> n_art_library
  n_run_35932065351 --> n_art_library
  n_wf_modular_star --> n_art_features
  n_run_35932065351 --> n_art_features
  n_wf_modular_star --> n_art_proof
  n_run_35932065351 --> n_art_proof
  n_wf_modular_star --> n_art_structure
  n_run_35932065351 --> n_art_structure
  n_wf_refresh --> n_art_chemistry
  n_run_35917712198 --> n_art_chemistry
  n_wf_refresh --> n_art_vedic
  n_run_35917712198 --> n_art_vedic
  n_wf_refresh --> n_art_random
  n_run_35917712198 --> n_art_random
  n_wf_modular_star --> n_art_release
  n_wf_generate --> n_app_geodesy
  n_art_blocks --> n_app_geodesy
  n_wf_generate --> n_app_substation_finder
  n_art_blocks --> n_app_substation_finder
  n_art_release -- checked by --> n_chk_tests
  n_art_lines -- checked by --> n_chk_rebuild
  n_art_release -- checked by --> n_chk_rebuild
  n_art_release -- checked by --> n_chk_permanence
  n_art_lines -- checked by --> n_chk_permanence
  n_art_code -- checked by --> n_chk_permanence
  n_art_library -- checked by --> n_chk_library
  n_art_modular_graph -- checked by --> n_chk_size
  n_art_blocks_graph -- checked by --> n_chk_size
  n_art_proof -- checked by --> n_chk_size
  n_art_structure -- checked by --> n_chk_size
  n_art_features -- checked by --> n_chk_size
  n_app_geodesy -- checked by --> n_chk_parses
  n_app_substation_finder -- checked by --> n_chk_parses
  n_art_code -- checked by --> n_chk_pages
  n_art_table -- checked by --> n_chk_pages
  n_art_modular_graph -- checked by --> n_chk_pages
  n_art_blocks_graph -- checked by --> n_chk_pages
  n_art_proof -- checked by --> n_chk_pages
  n_art_structure -- checked by --> n_chk_pages
```

## Checks

- **Unit tests** (green): The numbering and parsing logic is tested before any run touches the database.
- **Rebuild check** (green): Randomly chosen files are rebuilt from their numbered lines and compared with GitHub byte for byte.
- **Permanence check** (green): No line, function or family number from an earlier run may change. The run refuses to save if one did.
- **Library loads** (green): The compiled library is parsed and imported before it is published.
- **Graph size limit** (green): Every graph registered for the dashboard must stay under the size limit, because the dashboard loads them all on open.
- **Generated app parses** (green): A generated app is only committed once its assembled code parses.
- **Published to the web** (green): GitHub Pages rebuilt the public site after the last save, so what this graph describes is what a reader can open.
