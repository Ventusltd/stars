# Structure of globalgrid2050 architecture development

Updated 2026-09-25 12:10 UTC by GitHub Actions. Top-down: globalgrid2050 architecture development, its repositories, the categories of the periodic table, the named blocks with their interdependencies, and the canonical modules of the engine in the engine graph's own order.
The same structure, card by card, is `structure/graph.json` (105 KB, 131 cards, 376 links), registered for the Spider dashboard as **Structure of globalgrid2050 architecture development**. Amber is a block whose value is not yet settled; grey has no function inside yet.

## Repositories (36)

```mermaid
flowchart TD
  classDef ok fill:#153d2a,stroke:#39d353,color:#e6edf3
  classDef warn fill:#3d2f0f,stroke:#ffd54a,color:#e6edf3
  classDef fail fill:#3d1414,stroke:#ff6b6b,color:#e6edf3
  classDef live fill:#12304a,stroke:#58a6ff,color:#e6edf3
  classDef off fill:#21262d,stroke:#6b7280,color:#9aa3b5
  estate["globalgrid2050 architecture development"]:::ok
  n_Ventusltd_ventus_grid_engine["ventus-grid-engine · 22 blocks"]:::ok
  estate --> n_Ventusltd_ventus_grid_engine
  n_Ventusltd_globalgrid2050["globalgrid2050 · 20 blocks"]:::ok
  estate --> n_Ventusltd_globalgrid2050
  n_Ventusltd_gridatlas["gridatlas · 12 blocks"]:::ok
  estate --> n_Ventusltd_gridatlas
  n_Ventusltd_testcode["testcode · 12 blocks"]:::ok
  estate --> n_Ventusltd_testcode
  n_Ventusltd_code_generator["code-generator · 11 blocks"]:::ok
  estate --> n_Ventusltd_code_generator
  n_Ventusltd_pipelinenews["pipelinenews · 7 blocks"]:::ok
  estate --> n_Ventusltd_pipelinenews
  n_Ventusltd_spiders["spiders · 5 blocks"]:::ok
  estate --> n_Ventusltd_spiders
  n_Ventusltd_claude["claude · 4 blocks"]:::ok
  estate --> n_Ventusltd_claude
  n_Ventusltd_data_grid_gb["data-grid-gb · 4 blocks"]:::ok
  estate --> n_Ventusltd_data_grid_gb
  n_Ventusltd_data_gridatlas["data-gridatlas · 4 blocks"]:::ok
  estate --> n_Ventusltd_data_gridatlas
  n_Ventusltd_galaxies_wafers["galaxies-wafers · 3 blocks"]:::ok
  estate --> n_Ventusltd_galaxies_wafers
  n_Ventusltd_layout_tool["layout-tool · 3 blocks"]:::ok
  estate --> n_Ventusltd_layout_tool
  n_Ventusltd_chatgpt_audits["chatgpt-audits · 2 blocks"]:::ok
  estate --> n_Ventusltd_chatgpt_audits
  n_Ventusltd_companies["companies · 2 blocks"]:::ok
  estate --> n_Ventusltd_companies
  n_Ventusltd_data_gb_electricity["data-gb-electricity · 2 blocks"]:::ok
  estate --> n_Ventusltd_data_gb_electricity
  n_Ventusltd_grid_distance_maths["grid-distance-maths · 2 blocks"]:::ok
  estate --> n_Ventusltd_grid_distance_maths
  n_Ventusltd_teleprinter["teleprinter · 2 blocks"]:::ok
  estate --> n_Ventusltd_teleprinter
  n_Ventusltd_youengineer_code_review["youengineer-code-review · 2 blocks"]:::ok
  estate --> n_Ventusltd_youengineer_code_review
  n_Ventusltd_cable_trench_or_drill["cable-trench-or-drill · 1 blocks"]:::ok
  estate --> n_Ventusltd_cable_trench_or_drill
  n_Ventusltd_cvaa["cvaa · 1 blocks"]:::ok
  estate --> n_Ventusltd_cvaa
  n_Ventusltd_data_centres_gb["data-centres-gb · 1 blocks"]:::ok
  estate --> n_Ventusltd_data_centres_gb
  n_Ventusltd_data_federation_map_for_globalgrid2050_all_repos["data-federation-map-for-globalgrid2050-all-repos · 1 blocks"]:::ok
  estate --> n_Ventusltd_data_federation_map_for_globalgrid2050_all_repos
  n_Ventusltd_data_interconnectors["data-interconnectors · 1 blocks"]:::ok
  estate --> n_Ventusltd_data_interconnectors
  n_Ventusltd_faraday["faraday · 1 blocks"]:::ok
  estate --> n_Ventusltd_faraday
  n_Ventusltd_gemini["gemini · 1 blocks"]:::ok
  estate --> n_Ventusltd_gemini
  n_Ventusltd_globalgrid2050_homepage["globalgrid2050-homepage · 1 blocks"]:::ok
  estate --> n_Ventusltd_globalgrid2050_homepage
  n_Ventusltd_globalgrid2050_ip_and_mac_addresses["globalgrid2050-ip-and-mac-addresses · 1 blocks"]:::ok
  estate --> n_Ventusltd_globalgrid2050_ip_and_mac_addresses
  n_Ventusltd_gridmachine1["gridmachine1 · 1 blocks"]:::ok
  estate --> n_Ventusltd_gridmachine1
  n_Ventusltd_kuiper_drawing_engine["kuiper-drawing-engine · 1 blocks"]:::ok
  estate --> n_Ventusltd_kuiper_drawing_engine
  n_Ventusltd_sld["sld · 1 blocks"]:::ok
  estate --> n_Ventusltd_sld
  n_Ventusltd_solar_electrical_topology_analysis_engine_text_based["solar-electrical-topology-analysis-engine-text-based · 1 blocks"]:::ok
  estate --> n_Ventusltd_solar_electrical_topology_analysis_engine_text_based
  n_Ventusltd_star_electron_star["star-electron-star · 1 blocks"]:::ok
  estate --> n_Ventusltd_star_electron_star
  n_Ventusltd_star_quantum_twin["star-quantum-twin · 1 blocks"]:::ok
  estate --> n_Ventusltd_star_quantum_twin
  n_Ventusltd_star_solar_star["star-solar-star · 1 blocks"]:::ok
  estate --> n_Ventusltd_star_solar_star
  n_Ventusltd_star_maker["star-maker"]:::ok
  estate --> n_Ventusltd_star_maker
  n_Ventusltd_stars["stars"]:::off
  estate --> n_Ventusltd_stars
```

## Blocks by category (63), arrows mean "depends on"

```mermaid
flowchart LR
  classDef ok fill:#153d2a,stroke:#39d353,color:#e6edf3
  classDef warn fill:#3d2f0f,stroke:#ffd54a,color:#e6edf3
  classDef fail fill:#3d1414,stroke:#ff6b6b,color:#e6edf3
  classDef live fill:#12304a,stroke:#58a6ff,color:#e6edf3
  classDef off fill:#21262d,stroke:#6b7280,color:#9aa3b5
  subgraph n_constants["Constants and vocabularies"]
    n_block_At["At · Allowed technologies"]:::warn
    n_block_Ek["Ek · Earth km"]:::warn
    n_block_Hr["Hr · Hit radius edge px"]:::warn
    n_block_Hi["Hi · Hit radius vertex px"]:::warn
    n_block_L["L · Limit"]:::warn
    n_block_Mr["Mr · Max resources"]:::warn
    n_block_Mt["Mt · Max tries"]:::warn
    n_block_Ri["Ri · Repd ids"]:::warn
    n_block_Rp["Rp · Repd page"]:::warn
    n_block_Sm["Sm · Solar min exclusive"]:::warn
    n_block_S["S · Statuses"]:::warn
    n_block_T["T · Technologies"]:::warn
  end
  subgraph n_geodesy["Geodesy and distance"]
    n_block_Gc["Gc · Distance and bearing"]:::ok
    n_block_Ga["Ga · Area and perimeter"]:::ok
    n_block_Gs["Gs · Circles and shapes on the map"]:::ok
    n_block_Gg["Gg · GeoJSON helpers"]:::ok
    n_block_Vg["Vg · Geodesy (v9 atlas copy)"]:::off
    n_block_Vn["Vn · Nearest substation search"]:::ok
  end
  subgraph n_network["Grid network and electrical"]
    n_block_Nt["Nt · Grid network topology"]:::ok
    n_block_Ed["Ed · Electrical distance"]:::off
    n_block_Re["Re · Line and transformer ratings"]:::off
    n_block_Pf["Pf · Published fault level"]:::ok
    n_block_Po["Po · Power factor"]:::ok
    n_block_Vd["Vd · Voltage drop"]:::ok
  end
  subgraph n_connections["Connections and capacity"]
    n_block_Ce["Ce · Cable corridor estimate"]:::off
    n_block_El["El · Electrification demand"]:::ok
    n_block_Fc["Fc · Firm capacity"]:::ok
    n_block_Dd["Dd · Diversified demand"]:::ok
    n_block_Cc["Cc · Connection capacity"]:::ok
    n_block_Ro["Ro · Route obstacles"]:::ok
    n_block_Ie["Ie · Interconnector economics"]:::ok
  end
  subgraph n_cartridges["Map cartridges"]
    n_block_Sp["Sp · streaming-parquet-bridge"]:::ok
    n_block_Ug["Ug · uk-gazetteer-flyto"]:::ok
    n_block_Ss["Ss · sld-sandbox"]:::ok
    n_block_Si["Si · substation-intelligence"]:::ok
    n_block_Ra["Ra · REPD Grid Atlas core engine (v3 to v8)"]:::ok
  end
  subgraph n_layers["Map layers"]
    n_block_A["A · Airports"]:::ok
    n_block_D["D · Datacentres"]:::ok
    n_block_G1["G1 · Grid 132 kV"]:::off
    n_block_G2["G2 · Grid 220 kV"]:::off
    n_block_Gr["Gr · Grid 275 kV"]:::off
    n_block_G4["G4 · Grid 400 kV"]:::off
    n_block_G6["G6 · Grid 66 kV"]:::off
    n_block_Gri["Gri · Grid substations"]:::off
    n_block_Io["Io · Industrial offtakers"]:::ok
    n_block_Pp["Pp · Power plants"]:::ok
    n_block_R["R · Railways"]:::ok
    n_block_Sa["Sa · Satellite imagery"]:::ok
    n_block_Dc["Dc · Data centres and offtakers data tools"]:::ok
  end
  subgraph n_arrival["Deep links and arrival"]
    n_block_Dt["Dt · The MAP button (deep-link contract)"]:::ok
    n_block_Ps["Ps · Place search and arrival"]:::ok
  end
  subgraph n_news["Pipeline News"]
    n_block_Pn["Pn · Pipeline News app"]:::ok
    n_block_Gp["Gp · Grid proximity panel"]:::ok
    n_block_Wf["Wf · Wider fleet panel"]:::ok
    n_block_Ln["Ln · Live news discovery"]:::ok
  end
  subgraph n_solar["Solar, BESS and cables"]
    n_block_Cg["Cg · Cable trench geometry"]:::ok
    n_block_Sb["Sb · Solar and BESS single-line sandbox"]:::ok
    n_block_St["St · Solar electrical topology (text engine)"]:::ok
  end
  subgraph n_interface["Pages and interface"]
    n_block_Tp["Tp · Teleprinter controls"]:::ok
    n_block_Em["Em · Site menu bar"]:::ok
    n_block_Mb["Mb · Atlas menu bar"]:::off
  end
  subgraph n_proofs["Proofs and checks"]
    n_block_Pr["Pr · Proofs and checks"]:::ok
    n_block_Gn["Gn · Genome and spiders"]:::ok
  end
  n_block_Sp --> n_block_Pr
  n_block_Sp --> n_block_Cg
  n_block_Ug --> n_block_St
  n_block_Ug --> n_block_Tp
  n_block_Ug --> n_block_Pr
  n_block_Ug --> n_block_Gn
  n_block_Ss --> n_block_Pr
  n_block_Ss --> n_block_St
  n_block_Ss --> n_block_Tp
  n_block_Ss --> n_block_Gn
  n_block_Si --> n_block_Pr
  n_block_Si --> n_block_St
  n_block_Si --> n_block_Tp
  n_block_Si --> n_block_Gn
  n_block_Si --> n_block_Sa
  n_block_Ra --> n_block_St
  n_block_Ra --> n_block_Tp
  n_block_Ra --> n_block_Pr
  n_block_Ra --> n_block_Gn
  n_block_Ra --> n_block_Ss
  n_block_Ra --> n_block_Si
  n_block_Ra --> n_block_Wf
  n_block_Sa --> n_block_St
  n_block_Sa --> n_block_Tp
  n_block_Sa --> n_block_Pr
  n_block_Sa --> n_block_Gn
  n_block_Sa --> n_block_Ie
  n_block_Sa --> n_block_Ss
  n_block_Dt --> n_block_Ps
  n_block_Dt --> n_block_Pr
  n_block_Dt --> n_block_Gp
  n_block_Dt --> n_block_St
  n_block_Dt --> n_block_Tp
  n_block_Dt --> n_block_Gn
  n_block_Dt --> n_block_Cg
  n_block_Dt --> n_block_Dc
  n_block_Ps --> n_block_Ss
  n_block_Ps --> n_block_Si
  n_block_Ps --> n_block_Wf
  n_block_Pn --> n_block_Pr
  n_block_Pn --> n_block_Si
  n_block_Pn --> n_block_Tp
  n_block_Pn --> n_block_St
  n_block_Pn --> n_block_Gn
  n_block_Pn --> n_block_Ss
  n_block_Pn --> n_block_Wf
  n_block_Pn --> n_block_Dt
  n_block_Pn --> n_block_Sa
  n_block_Gp --> n_block_Ss
  n_block_Gp --> n_block_Si
  n_block_Gp --> n_block_Wf
  n_block_Wf --> n_block_St
  n_block_Wf --> n_block_Tp
  n_block_Wf --> n_block_Pr
  n_block_Wf --> n_block_Gn
  n_block_Wf --> n_block_Pn
  n_block_Ln --> n_block_Pr
  n_block_Ln --> n_block_St
  n_block_Ln --> n_block_Tp
  n_block_Ln --> n_block_Gn
  n_block_Cg --> n_block_Pr
  n_block_Cg --> n_block_Si
  n_block_Cg --> n_block_Ra
  n_block_Cg --> n_block_Pn
  n_block_Cg --> n_block_Gn
  n_block_Cg --> n_block_Ss
  n_block_Cg --> n_block_Dt
  n_block_Cg --> n_block_Wf
  n_block_Cg --> n_block_Dc
  n_block_Cg --> n_block_St
  n_block_Cg --> n_block_Ps
  n_block_Cg --> n_block_Sb
  n_block_Cg --> n_block_Gp
  n_block_Cg --> n_block_Tp
  n_block_Cg --> n_block_Sa
  n_block_Sb --> n_block_St
  n_block_Sb --> n_block_Tp
  n_block_Sb --> n_block_Pr
  n_block_Sb --> n_block_Gn
  n_block_Sb --> n_block_Ss
  n_block_Sb --> n_block_Si
  n_block_Sb --> n_block_Wf
  n_block_Sb --> n_block_Cg
  n_block_Sb --> n_block_Pn
  n_block_St --> n_block_Si
  n_block_St --> n_block_Tp
  n_block_St --> n_block_Sp
  n_block_St --> n_block_Dt
  n_block_St --> n_block_Pn
  n_block_St --> n_block_Em
  n_block_St --> n_block_Gn
  n_block_Tp --> n_block_Pr
  n_block_Tp --> n_block_Ss
  n_block_Tp --> n_block_Gn
  n_block_Tp --> n_block_Si
  n_block_Tp --> n_block_Wf
  n_block_Tp --> n_block_Pn
  n_block_Em --> n_block_St
  n_block_Em --> n_block_Tp
  n_block_Em --> n_block_Pr
  n_block_Em --> n_block_Gn
  n_block_Pr --> n_block_Dc
  n_block_Pr --> n_block_Dt
  n_block_Gn --> n_block_Dt
  n_block_Gn --> n_block_St
  n_block_Gn --> n_block_Pn
  n_block_Gn --> n_block_Em
```

## Engine modules (20), in the engine graph's order

```mermaid
flowchart LR
  classDef ok fill:#153d2a,stroke:#39d353,color:#e6edf3
  classDef warn fill:#3d2f0f,stroke:#ffd54a,color:#e6edf3
  classDef fail fill:#3d1414,stroke:#ff6b6b,color:#e6edf3
  classDef live fill:#12304a,stroke:#58a6ff,color:#e6edf3
  classDef off fill:#21262d,stroke:#6b7280,color:#9aa3b5
  engine["ventus-grid-engine"]:::ok
  n_engine_geo_core_js["engine/geo-core.js"]:::ok
  engine --> n_engine_geo_core_js
  n_engine_geo_core_js -. block .-> n_block_Gc["Gc · Distance and bearing"]:::ok
  n_engine_geo_area_js["engine/geo-area.js"]:::ok
  engine --> n_engine_geo_area_js
  n_engine_geo_area_js -. block .-> n_block_Ga["Ga · Area and perimeter"]:::ok
  n_engine_geo_shapes_js["engine/geo-shapes.js"]:::ok
  engine --> n_engine_geo_shapes_js
  n_engine_geo_shapes_js -. block .-> n_block_Gs["Gs · Circles and shapes on the map"]:::ok
  n_engine_geo_geojson_js["engine/geo-geojson.js"]:::ok
  engine --> n_engine_geo_geojson_js
  n_engine_geo_geojson_js -. block .-> n_block_Gg["Gg · GeoJSON helpers"]:::ok
  n_engine_v9_geodesy_js["engine/v9-geodesy.js"]:::ok
  engine --> n_engine_v9_geodesy_js
  n_engine_v9_nearest_search_js["engine/v9-nearest-search.js"]:::ok
  engine --> n_engine_v9_nearest_search_js
  n_engine_v9_nearest_search_js -. block .-> n_block_Vn["Vn · Nearest substation search"]:::ok
  n_deeplink_contract_js["deeplink/contract.js"]:::ok
  engine --> n_deeplink_contract_js
  n_engine_network_topology_js["engine/network-topology.js"]:::ok
  engine --> n_engine_network_topology_js
  n_engine_network_topology_js -. block .-> n_block_Nt["Nt · Grid network topology"]:::ok
  n_engine_electrical_distance_js["engine/electrical-distance.js"]:::ok
  engine --> n_engine_electrical_distance_js
  n_engine_rating_envelope_js["engine/rating-envelope.js"]:::ok
  engine --> n_engine_rating_envelope_js
  n_engine_corridor_estimate_js["engine/corridor-estimate.js"]:::ok
  engine --> n_engine_corridor_estimate_js
  n_engine_published_fault_level_js["engine/published-fault-level.js"]:::ok
  engine --> n_engine_published_fault_level_js
  n_engine_published_fault_level_js -. block .-> n_block_Pf["Pf · Published fault level"]:::ok
  n_engine_electrification_demand_js["engine/electrification-demand.js"]:::ok
  engine --> n_engine_electrification_demand_js
  n_engine_electrification_demand_js -. block .-> n_block_El["El · Electrification demand"]:::ok
  n_engine_firm_capacity_js["engine/firm-capacity.js"]:::ok
  engine --> n_engine_firm_capacity_js
  n_engine_firm_capacity_js -. block .-> n_block_Fc["Fc · Firm capacity"]:::ok
  n_engine_diversified_demand_js["engine/diversified-demand.js"]:::ok
  engine --> n_engine_diversified_demand_js
  n_engine_diversified_demand_js -. block .-> n_block_Dd["Dd · Diversified demand"]:::ok
  n_engine_connection_capacity_js["engine/connection-capacity.js"]:::ok
  engine --> n_engine_connection_capacity_js
  n_engine_connection_capacity_js -. block .-> n_block_Dd["Dd · Diversified demand"]:::ok
  n_engine_route_obstacles_js["engine/route-obstacles.js"]:::ok
  engine --> n_engine_route_obstacles_js
  n_engine_route_obstacles_js -. block .-> n_block_Dd["Dd · Diversified demand"]:::ok
  n_engine_interconnector_economics_js["engine/interconnector-economics.js"]:::ok
  engine --> n_engine_interconnector_economics_js
  n_engine_interconnector_economics_js -. block .-> n_block_Ie["Ie · Interconnector economics"]:::ok
  n_engine_power_factor_js["engine/power-factor.js"]:::ok
  engine --> n_engine_power_factor_js
  n_engine_power_factor_js -. block .-> n_block_Po["Po · Power factor"]:::ok
  n_engine_voltage_drop_js["engine/voltage-drop.js"]:::ok
  engine --> n_engine_voltage_drop_js
  n_engine_voltage_drop_js -. block .-> n_block_Vd["Vd · Voltage drop"]:::ok
```
