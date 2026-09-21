# 3D Model-binded.dwg — shipyard CAD model of the lelievlet

**Official Scouting Nederland 3D model.** Published on the Lelieschepen page
<https://www.scouting.nl/bestuur/accommodatie-vloot-en-materiaal/lelieboten>, direct link
<https://www.scouting.nl/assets/uploads/doorzoekbareBestanden/06.Ondersteuning/Kennisnetwerk/Accomodatie-en-gebouwen/Waterscouting/Lelieschepen/3D-Model-binded-lelievlet.zip>
(SHA-256 `1fbf05a0…adc37`, identical to the copy the project owner supplied on 2026-09-19).
It is published for scouting groups and builders.

| | |
|---|---|
| File | `3D Model-binded.dwg`, 16 MB, DWG version AC1021 (AutoCAD 2007 format) |
| Written by | AutoCAD 2013 (ASM 217.0.0.4503), bodies timestamped Mon 14 May 2012 |
| Origin software | Layer names (`PartSolids-Frame`, `PartSolids-Long Shell`, `StiffenerSolids`) are **ShipConstructor** conventions → a production model of the kind used to cut the steel plates; "binded" = xrefs bound into one file |
| Units | millimetres (`$INSUNITS` = 4) |
| Axes | X = length, stern ≈ 738 → bow ≈ 6336; Y = beam, centreline at 0; Z = up, underside of vlak ≈ 0 |
| Content | 215 × 3DSOLID + 7 × REGION, all ACIS bodies stored as binary SAB; no blocks; hull plating is exact NURBS |

This is the **primary geometry reference** for the project. It outranks the instruction-book
illustration and anything else on dimensions.

## Files here

| File | What |
|---|---|
| `extract_sab.py` | Pulls every ACIS body out of LibreDWG's JSON dump into `sab/` and writes the index |
| `sab/<Layer>_<handle>.sab` | One standard ACIS binary (SAB) file per body — **222 files, all complete** |
| `solids_index.json` | Per body: layer, DWG handle, face count, surface types, vertex bounding box (mm) |
| `vertex_preview.png` | B-rep vertices of all bodies by layer: side, plan and stern views |

Reproduce: `brew install libredwg`, then
`dwgread -O JSON -o model.json "3D Model-binded.dwg" && uv run --with ezdxf python3 extract_sab.py model.json`

**Do not use `dwg2dxf` for this file.** LibreDWG 0.14 converts the binary SAB to SAT text on the
way to DXF and drops the last partial 4096-byte chunk of every body (36 bodies come out empty,
the rest truncated). The JSON dump carries the untouched bytes.

## Layers and measured sizes (vertex bounding boxes, mm)

| Layer | Bodies | Extent X × Y × Z | Notes |
|---|---|---|---|
| PartSolids-Long Shell | 8 | 5599 × 1836 × 1012 | Hull plating. Per side three strakes: bottom (5249 long, half-width 596), middle (5483), top (5598, z 493–1006); plus an aft deck plate (1178 × 1477) and a fore deck plate (1359 × 1682). Naming (vlak / kim / boeisel) to be confirmed against the book diagram |
| PartSolids-Frame | 32 | 5717 × 1793 × 1511 | Transverse/centreline plate parts: spanten, spiegel, zwaardkast, scheg, schotten; lowest point z = −428 (zwaard and/or roer) |
| StiffenerSolids | 32 | 5770 × 1855 × 930 | Profiles (berghout, dolboord, …); widest point of the boat = **1855 mm** |
| Contours | 3 | 5587 × 1762 × 266 | Gunwale/deck contour part + two small parts at the bow (x ≈ 6020) |
| BuikdenningSolids | 20 | 2640 × 1245 × 122 | Vlonders, x 2116–4756, z 96–218 |
| DoftSolids | 2 | 208 × 1675 / 1773 × 25 | Two doften, 208 wide × 25 thick, top at z = 674; at x 2789–2997 and 3775–3983 |
| MastSolids | 1 | 107 × 91 × 5300 | Mast **5300 mm**, z 365 → 5665, at x ≈ 4300–4406 (≈ 1.98 m aft of the stem) |
| GiekSolids | 2 | 2833 × 49 × 64 | Giek 2822 long at z ≈ 1320 + small fitting at the mast (lummel) |
| GaffelSolids | 1 | 1919 × 126 × 2052 | Gaffel ≈ 2810 mm along its axis, peak at z ≈ 5946 |
| ZeilSolids | 8 | 4532 × 730 × 4798 | Grootzeil (x 1594–4194, z 1332–5933), fok (drawn sheeted to starboard/port by 730 mm), 6 regions = 3 zeillatten × 2 faces |
| StagSolids | 109 | 4696 × 1792 × 5647 | Voorstag, wanten, blocks, fittings, rigging hardware, up to z = 5864 |
| HelmstokSolids | 1 | 907 × 30 × 290 | Helmstok |
| RiemSolids | 3 | — | 2 roeiriemen of 2808 mm, 1 wrikriem of 3120 mm, stowed on the doften |

Overall: LOA of plating 5599 mm, beam over plating 1836 mm, over stiffeners 1855 mm, top of
mast 5.67 m and gaffel peak 5.95 m above the underside of the bottom plate.

## Conflicts with the Vlettenboek (Vademecum deel 8, see `../rig/SOURCES.md`)

| Item | This DWG | Vlettenboek (tolerance) | Class rules v2.0 (2025) |
|---|---|---|---|
| Mast length | 5300 | 5600 (5570–5630) | 5000–5800 |
| Giek | 2822 | 2750 (2730–2770) | max 3000 |
| Gaffel | ≈ 2810 | 2700 (2680–2720) | max 3000 |
| Onderlijk grootzeil | 2600 (x 1594–4194) | 2600 | — |
| Mast foot above underside bottom plate | 365 | ≈ 365 (derived) | — |

The spars in the DWG are within the class rules but not the Vlettenboek's nominal sizes. The
hull is what this model was made for (plate cutting); for the rig the Vlettenboek is the
authority, as the class rules themselves say. Decide per spar which to follow — default:
Vlettenboek dimensions, DWG positions.

## Open points

- Bodies are not named in the DWG — only layer + handle. `pipeline/parts.py` holds the
  identification made so far (70 named parts); the ~97 small `StagSolids` bodies (blokken,
  harpjes, leuvers, spanners, mastbeslag) are still one collective part.
- Roer and zwaard have no layer of their own: roerblad `58B7`, roerkoning `58B8`, zwaard `5857`
  sit in the frame/stiffener layers.
- Running rigging **is** modelled, as swept solids inside `StagSolids`: fokkenval, klauwval,
  piekenval, gaffeldraad, marllijnen, rijglijn, grootschoot with blocks, fokkenschoot. Not found
  so far: dirk/kraanlijn, landvasten, dollen, vlaggenstok.
- Conversion to meshes is solved in `pipeline/` (own SAB -> OpenCascade converter, 6934 of
  6936 faces). Three small rigging fittings do not close as solids; they are oriented by the
  sign of their enclosed volume instead. (The mast used to be open too: its ring eyes are torus
  faces, which needed the ACIS orientation rule - see the root README.)
- The sails are modelled as 0.1 mm thick solids; the exporter keeps one skin and renders it
  double sided.
