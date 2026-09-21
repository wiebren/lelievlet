# Lelievlet — hull & construction reference sources

> **Correction (2026-09-19, after cross-checking).** Statements in this file about the official
> 3D DWG are superseded by `../cad/README.md`. The DWG is *not* hull-only — it contains mast, giek,
> gaffel, zeilen, stagen/beslag, doften, buikdenning, helmstok and riemen (222 ACIS bodies) — and
> the `dwg2dxf` route is *not* lossless: every SAT body it produces is truncated with a
> valid-looking end marker appended. The DXF and `lelievlet_3d_sat/` derivatives were therefore
> deleted; complete bodies are in `../cad/sab/`. Files duplicated across folders are now symlinks
> to one canonical copy (see `../README.md`).


Collected 2026-09-19. Everything listed below was fetched and verified locally
(`file` type-checked, PDFs opened and read) unless explicitly marked otherwise.

**Bottom line:** the single most valuable find is the official
*Vademecum voor het waterwerk, deel 8 — De Lelievlet* (8th edition, 1 June 1988,
Landelijke Admiraliteit / Landelijk Nautische en Technische Commissie,
Scouting Nederland). It contains the complete hull geometry: a frame/offset table,
developed plate offsets ("huiduitslagen") for bottom, chine and topside plates at
100 mm intervals, and detail drawings for transom, decks, bulkheads, skeg, floors,
centreboard case, mast tube, centreboard and rudder. This is the drawing set the
current class rules point back to.

---

## 1. Primary / official sources (downloaded)

### 1.1 `lszw_vademecum_lelievlet.pdf` — THE construction drawing set
- **Source URL:** https://lszw.scouting.nl/images/lelievlet.pdf
  (linked from https://lszw.scouting.nl/downloads-en-links as "Vademecum voor het waterwerk")
- **What it is:** *Vademecum voor het waterwerk, deel 8 — De Lelievlet*, 8e druk,
  1 juni 1988, compiled by Henk Bos for the Landelijk Nautische en Technische
  Commissie of Scouting Nederland. 86 PDF pages, scanned images (no text layer on the
  drawing pages).
- **Trustworthiness:** Official. This is the "vlettenboek" that the 2025 class rules
  name as the underlying document ("met het Vademecum voor het waterwerk deel 8 De
  Lelievlet (verder aangeduid als 'vlettenboek') als onderligger"). Hosted on a
  scouting.nl subdomain. Highest authority available.
- **Caveat:** 1988 edition. Later editions may exist; none found online (see §8).
  The drawings themselves derive from a 1970 survey of ~100 existing Beenhakker
  vletten averaged into a single set of lines, so they are a *consensus* hull, not
  a designer's original lines plan (there never was one — see the foreword, p. 4).

Page map (PDF page = printed page number):

| Page | Contents |
|---|---|
| 3  | "De Lelie zeil-, roei- en wrikvlet" — sail plan / general arrangement with main dimensions |
| 4  | Foreword + history (Stokman, Beenhakker, 1956 prototypes, 1970 survey) |
| 5  | Table of contents |
| 6–11 | Bouwbeschrijving (step-by-step build description) |
| 12–14 | Hulpmiddelen en buigmallen (jigs and bending moulds) |
| 15 | Onderdelen schip en tuig |
| 16 | Full GA drawing with numbered parts ("Lelie zeil-roei en wrik vlet") |
| 17 | Names list |
| 18–20 | **Materiaallijst** — every steel part with plate thickness, cut size and weight |
| 21 | **Technische beschrijving van het casco** (text; plate thicknesses, berghout, dolboord) |
| 22 | **SPANTENLIJST** — body plan + full offset table, frames 0–10 |
| 23 | Side view + plan view with positions of doften, dolpotten, wantputtingen, luchtkasten |
| 24 | Longitudinal section with positions of the wrangen (floors) |
| 25 | **HET VLAK (de helft)** — developed bottom-plate offsets, 100 mm steps |
| 26 | **DE KIMPLAAT** — developed chine-plate offsets, 100 mm steps |
| 27 | **BOEISEL** — developed topside-plate offsets, 100 mm steps |
| 28 | **SPIEGEL** (transom) outline, 4 mm, 960 × 680 mm |
| 29 | Half voordek outline + camber |
| 30 | Mangatplaat voor (forward bulkhead), 3 mm, 1700 × 600 |
| 31 | Half achterdek outline + camber |
| 32 | Mangatplaat achter (aft bulkhead), 3 mm, 1500 × 428 |
| 33 | **SCHEG** (skeg), 5.5 or 6 mm, 1040 long |
| 34 | Buikdenning steunen (wrangen / floors), 3 mm — 5 shapes |
| 35 | Voorplecht detail, dolpotten, landvast-ogen, mik |
| 36 | **Zwaardkast en mastkoker**, 4 mm — construction + dimensions |
| 37 | **Uitslag zwaardkast** — developed side plate, height offsets at 100 mm steps |
| 38 | **ZWAARD** (centreboard), 5 mm + 6 mm doubler |
| 39 | Zwaardloper |
| 40 | **ROER** (rudder) — blade 530 × 410 × 5.5, roerkoning 1" gaspijp × 1050 |
| 41 | Rudder fittings / helmstok holder |
| 42 | Plaats van de vingerlingen op de spiegel |
| 43–45 | Hanekam, dofthouder, ogen, kikkers |
| 46 | Specificatie houtwerk en beslag (mast, gaffel, giek, riemen, doften …) |
| 47–53 | Mast, top- en hommerring, gaffel, giek, helmstok, gaffelklauw, lummelbout |
| 54 | Buikdenning (floorboards) |
| 55 | Riemen, wrikriem, haakstok, vaarboom |
| 56–62 | Tuigage, zeilspecificatie, zeilplan |
| 63 | Roeidol |
| 64 | Anker 7,5 kg |
| 65–71 | Persklemmen op stagen en wanten |
| 72–78 | Veiligheid tijdens bouw en onderhoud |
| 79 | Richtlijnen voor keuring / SN-nummer (plate thicknesses + tolerances) |
| 80 | Keuringsformulier SN-nummer |
| 81–82 | **MEETRAPPORT LELIEVLET CASCO** — 48 measured hull dimensions with min/max |
| 83 | Meetrapport houtwerk (spars, oars, floorboards) |
| 84 | Meetrapport tuigage (sail and rigging dimensions) |

### 1.2 `vademecum_pages/vademecum_pNN.png` — rendered pages
All 86 pages rendered at ~200 dpi greyscale PNG (generated locally with pypdfium2, not
downloaded). Use these for tracing; the drawing pages are scans so the PDF has no
vector geometry to extract.

### 1.2b `scoutingdump_lelievlet_3d_model_binded.dwg` — official 3D CAD model ⭐
- **Source URL:** https://www.scouting.nl/assets/uploads/doorzoekbareBestanden/06.Ondersteuning/Kennisnetwerk/Accomodatie-en-gebouwen/Waterscouting/Lelieschepen/3D-Model-binded-lelievlet.zip
  (also mirrored as ScoutingDump #439; the two are byte-identical). The zip is kept as
  `scoutingdump_autocad_3d_model_lelievlet.zip`; the extracted DWG is the 16 MB file.
- **What it is:** Scouting Nederland's own 3D CAD model of the lelievlet.
  **Verified by me**, not just by filename: `file` reports *DWG AutoDesk AutoCAD
  2007/2008/2009*; converting it with `dwg2dxf` (GNU LibreDWG) yields a 24 MB DXF
  containing **215 `3DSOLID` entities** plus the full ACIS construction history
  (`ACSH_SWEEP_CLASS` ×115, `ACSH_CYLINDER_CLASS` ×91, `ACSH_BREP_CLASS` ×66,
  `ACSH_BOOLEAN_CLASS` ×245, fillets, cones, extrusions). `$INSUNITS = 4`, i.e.
  **millimetres**. File timestamp 15 May 2012.
- **Why this matters most for your task:** this is the only *vector, three-dimensional,
  full-scale* source found anywhere. It is a solid model, so you can pull real surfaces
  out of it rather than re-lofting from the 1988 offset tables.
- **Caveat:** it is a 2012 CAD interpretation, not the class authority. The
  klassenvoorschriften still point at the 1988 Vlettenboek, so treat the DWG as
  geometry and the Vademecum as the dimensional authority, and reconcile the two.
- Model extents span roughly 22.6 × 24.3 × 13.5 m, which is far bigger than a boat —
  consistent with an assembly plus parts laid out around it ("binded"). Check which
  solids belong to the assembly before scaling anything.
- **Already converted for you:**
  - `scoutingdump_lelievlet_3d_model_binded.dxf` (24 MB) — made with
    `dwg2dxf -o out.dxf …` (GNU LibreDWG 0.14, `brew install libredwg`).
  - `lelievlet_3d_sat/` — **215 individual `.sat` (ACIS) files**, one per solid, named
    by layer. This is the form most CAD kernels will actually import.

  I checked whether the conversion kept real geometry rather than just entity stubs.
  It did: the DXF carries the ACIS payload in the classic XOR-0x5F–obfuscated form, and
  decoding it yields a complete B-rep — **6772 `face`, 12134 `edge`, 7064 `vertex`,
  24818 `coedge`, 8850 `surface` records**, with `body` / `lump` / `shell` /
  `nubs` spline surfaces. So the solids are genuine, not placeholders.

- **Layer breakdown of the 215 solids** (this tells you what is modelled):

  | Layer | Solids | What it is |
  |---|---|---|
  | `PartSolids-Long Shell` | 8 | **the hull plating** — bottom, chine and topside plates, transom, decks |
  | `PartSolids-Frame` | 32 | spanten |
  | `StiffenerSolids` | 32 | stiffeners / stringers |
  | `BuikdenningSolids` | 20 | floorboards |
  | `StagSolids` | 108 | standing rigging |
  | `RiemSolids` | 3 | oars |
  | `Contours` | 3 | construction contours |
  | `DoftSolids` | 2 | thwarts |
  | `ZeilSolids` | 2 | sails |
  | `GiekSolids` / `GaffelSolids` / `MastSolids` / `HelmstokSolids` | 2 / 1 / 1 / 1 | spars and tiller |

  The 8 hull-plating solids are the ones you want: each carries ~2000 faces and ~500
  vertex points, and their vertex coordinates span **X ≈ 0 … 6336 mm** — the right order
  for a 5,6 m hull whose developed boeisel is 5877 mm. (Y and Z ranges are wide because
  parts are laid out around the assembly, so identify the assembled solids before use.)

- If the SAT files give your toolchain trouble, the fallback is ODA File Converter
  (free), BricsCAD or AutoCAD opening the original DWG and exporting STEP/STL.

### 1.2c `boekel_minivlet_*.pdf` — vector plate developments at ~1:10 ⭐
- **Source:** https://www.maasgroep18.nl/usercontent/web/lelievlet/Lelievlet_platenpakket.pdf
  and companion A1/A4 sheets.
- **What they are:** true **vector** (not scanned) plaatuitslagen with the parts named
  exactly as in the Vademecum — BODEMPLAAT, KIMPLAAT, BOEISEL, VOORSCHOT, ACHTERSCHOT,
  zwaardkast, roerblad, scheg, spanten — plus a nesting example on a 250 × 1000 sheet
  ("Nestingvoorbeeld (zonder zwaardkast en spanten)"). Drawn 2005.
- **Scale is 1:10 — confirmed at source, not inferred.** The A1 PDF's embedded metadata
  reads:

  ```
  /Title (D:\Data\boot\lelievlet\snijdelen1op10.dwg Model (1))
  /Author (Daniël Boekel)     /CreationDate (D:20050324184342)
  ```

  i.e. the originating CAD file is literally `snijdelen1op10.dwg` — "cutting parts at
  1 to 10". That matches the Vademecum's own advice on p6 to build a 1:10 trial model
  from 0,3 mm sheet.

  Measuring the rendered A1 at 300 dpi corroborates it — the longest outlines come out
  at roughly 577–591 mm on paper, i.e. **5,8–5,9 m at full size**, exactly right for a
  5,60 m hull whose developed boeisel is 5877 mm and kimplaat 5842 mm. Two independent
  measurement passes agreed closely on the lengths but **disagreed on the widths**
  (e.g. boeisel 59,3 mm vs 45,4 mm), because automatic bounding boxes bridge adjacent
  outlines. **Take lengths as reliable and re-measure widths yourself** if they matter.
- Each panel is a closed polyline of 51–63 points, so it digitises directly.
- **Trustworthiness:** third-party (Boekel) model draughting, geometrically derived from
  the lelievlet but not an official document. Use as a vector cross-check on the
  Vademecum tables, not as authority. It is **not** a full-size cutting file.
- The A3 variant is byte-identical to the copy maasgroep18.nl serves, so both sites
  publish one file. Original home: `http://boekel.nu/minivlet/` (© 2005 Daniël Boekel /
  waterscouting.com).

### 1.2d `scoutingdump_handboek_lelievlet.pdf` — the 1977 predecessor
- **Source URL:** http://www.scoutingdump.nl/file/download/416/handboek-lelievlet
  (that site has an **expired TLS certificate**; it needs `curl -k`.)
- "Handboek lelievlet", 1977, Landelijke Nautisch Technische Commissie, 78 pages, scan.
  An **earlier edition** of the same drawing set as the 1988 Vademecum. Useful for
  spotting which dimensions changed between editions.

### 1.2e `bds_*.pdf` — Henk Bos's archive, recovered from the Wayback Machine
The compiler of the Vademecum ran `bds.home.xs4all.nl`, now dead (XS4ALL retired user
home pages). The vademecum PDF you have is **byte-identical** (MD5 `7fcd315c…`) to the
copy that lived there, so LSZW is simply mirroring Bos's file. Recovered via
`web.archive.org/web/20241231105439id_/`:

| File | Contents |
|---|---|
| `bds_in_gebruik_nemen_van_de_lelievlet.pdf` (16 pp) | Collecting the casco, packing lists for casco/houtwerk/tuigage, paint systems, rigging and trimming |
| `bds_promo_lelievlet_1955_stockmann.pdf` | Scan of the **1955 promotional album by A.L.J. Stockmann** — the original fundraising brochure |
| `bds_tips_in_scherts_1.pdf` (12 pp) | Outboard bracket, lifting rudder, bowsprit, deck gratings, anchor holder, zinc anode |
| `bds_tips_in_scherts_2.pdf` (12 pp) | Removable centreboard case, improved lifting rudder, spray hood, **alternative sail plans** |
| `bds_spiegel_der_zeilvaart_1987_lelievlet_1200.pdf` (5 pp) | *Spiegel der Zeilvaart* nr. 9, 1987, "Lelievlet 1200 — Boot van het jaar" |
| `bds_vademecum_deel3_werfbaas.pdf` (118 pp) | **Vademecum deel 3 — Werfbaas**: hull and woodwork repair, welding steel, turning the vlet over, preservation |

### 1.2f Scouting Nederland NTR (current safety/inspection rules)
From https://www.scouting.nl/bestuur/waterscouting/ntr-veiligheid-op-het-water :
`scoutingnl_NTR_laag1.pdf`, `scoutingnl_NTR_laag2_periodieke_keuring.pdf`,
`scoutingnl_NTR_bootprofielen.pdf`, and three lelievlet-specific infographics
(`..._onderhoud_lelievlet`, `..._uitrusting_lelievlet`, `..._lelievlet_optioneel`).
Plus the older, text-searchable `scoutingnl_NTR_2008.pdf`, whose chapter 9 covers
lelievlet/juniorvlet/lelieschouw inspection and cites Henk Bos's site as the authority.
These govern equipment and periodic inspection, **not hull geometry**.

### 1.2g Card-model material (shape reference only, no dimensions)
`scoutingdump_bouwplaat_*` (1:38 card model, Elfrink bouwplaten Wageningen — PDFs, a
colour JPG and a zip) and `seascouts_ie_lelievlet_manual_v1.0.pdf` (Irish Sea Scouts
handling manual). Low value for geometry.

### 1.3 `klassenvoorschriften_lelievlet_v2_lszw.pdf` — official class rules
- **Source URL:** https://lszw.scouting.nl/images/LSZW-2025/PDF-files/KLASSENVOORSCHRIFTEN_Lelievlet_v2.pdf
- **What it is:** "KLASSENVOORSCHRIFTEN NATIONALE Lelievlet KLASSE", version 2.0,
  publication date 1 May 2025. 6 pages, text PDF.
- **Trustworthiness:** Official and current. Class authority = Scouting Nederland.
- **Contents relevant to geometry:** casco length 5600 ±50 mm, beam 1800 ±100 mm,
  mast 5000–5800 mm, giek max 3000 mm, gaffel max 3000 mm, mandatory buoyancy tanks
  fore and aft, minimum 2 doften, floorboards over the frames. Explicitly states the
  Lelievlet is **not a one-design** ("De Lelievlet is geen eenheidsklasse") and that
  positions of spanten, mastkoker and zwaardkast in the cockpit "kan en mag variëren".
  Zwaard and roer must match the Vlettenboek drawings.

### 1.4 `wedstrijdbepalingen_NK_lelievlet_2026.pdf`
- **Source URL:** https://lszw.scouting.nl/images/LSZW-2026/PDF-files/wedstrijdbepalingen-NK_lelievlet_2026_versie_2_GG_def.pdf
- Racing instructions for the 2026 Dutch championship. **No hull geometry.**
  Downloaded for completeness only; low value for modelling.

### 1.5 `bouwpakket_lelievlet_scoutingelburg.pdf` + `bouwpakket_elburg_pages/`
- **Source URL:** https://scoutingelburg.nl/onewebmedia/Bouwpakket%20Lelievlet.pdf
- **What it is:** a **papercraft cut-out model** ("bouwplaat") of a lelievlet — 4 pages:
  p1 instructions, p2–p4 printed card parts (hull sides, bottom, decks, skeg, rudder,
  sails, oars). Named "Bouwpakket Lelievlet" but it is *not* a steel construction kit
  and carries no dimensions.
- **Trustworthiness:** hosted by a scouting group; shape is stylised. Useful only as a
  rough visual of the plate layout / part breakdown. Page 1 states 5,6 m × 1,8 m,
  grootzeil 12,15 m², fok 4 m², mast 5,6 m.

---

## 2. Transcribed offset tables (derived files, created locally)

I typed these out of the scans so you can load them directly. **They are transcriptions
by eye and should be spot-checked against the PNGs before you rely on them.**

| File | From | Contents |
|---|---|---|
| `offsets_spantenlijst.csv` | p22 | Frames 0–10: height above base and half-breadth at boeisel, berghout, onderkant huid; keel height |
| `offsets_vlak.csv` | p25 | Developed bottom plate, half, 100 mm steps, 0–5565 |
| `offsets_kimplaat.csv` | p26 | Developed chine plate, 100 mm steps, 0–5842 |
| `offsets_boeisel.csv` | p27 | Developed topside plate, 100 mm steps, 0–5877 |
| `offsets_dekken.csv` | p29, p31 | Fore and aft deck outlines + camber |

### Station datum (worked out, not printed on the drawing)

The spantenlijst's left-hand column (365, 865 … 5365, 500 mm apart) carries no stated
datum on p22. It is **measured from the spiegel (transom) forward**. Three independent
checks agree:

1. p23 carries a `365` dimension from the aft end of the hull to station 0, and a `245`
   dimension from station 10 to the stem. 365 + (10 × 500) + 245 = 5610 ≈ LOA 5600.
2. The meetrapport chain closes: aft bulkhead is 968 mm from the transom (p25);
   Punt 0 (back of the mast tube) is 2342 mm forward of it (p81 #14, nominal), so
   Punt 0 sits at 3310 mm; the forward bulkhead is 449 mm ahead of Punt 0 (p81 #1),
   i.e. **3759 mm** from the transom. p25 independently states **3750 mm**.
3. Spant 6 is the widest frame (913 × 2 = 1826 mm over berghout), matching meetrapport
   item 22, "Breedte t.p.v. spant 6 op berghouthoogte 1822–1830". Spant 6 at 3365 mm
   from the transom also puts max beam ~60 % aft-to-forward, and the mast (Punt 0,
   3310 mm) right beside it — both consistent with the sail plan on p3.

So: **spant 0 = 365 mm forward of the transom, spant 10 = 5365 mm, stem ≈ 5610 mm.**

### ⚠ Unreconciled: plate tables vs. spantenlijst

The developed plate tables (p25–p27) are indexed by *arc length along the unrolled
plate*, not by `x`. Comparing the vlak table's `breedte bovenste lijn` (the vlak/kim
seam) against the spantenlijst's `onderkant_huid_halfbeam` at the same nominal number
gives these residuals:

| spant | station | vlak table @ that length | spantenlijst | residual |
|---|---|---|---|---|
| 0 | 365 | ~350 | 285 | +65 |
| 1 | 865 | ~428 | 371 | +57 |
| 2 | 1365 | ~496 | 452 | +44 |
| 3 | 1865 | ~549 | 520 | +29 |
| 4 | 2365 | ~583 | 566 | +17 |
| 5 | 2865 | ~593 | 591 | +2 |
| 6 | 3365 | ~588 | 594 | −6 |
| 7 | 3865 | ~542 | 568 | −26 |
| 8 | 4365 | ~466 | 492 | −26 |
| 9 | 4865 | ~375 | 355 | +20 |
| 10 | 5365 | ~269 | 139 | +130 |

The residuals are smooth and near zero amidships, blowing up at both ends where the
bottom sweeps up hardest — the signature of a developed-vs-projected coordinate
mismatch, plus possible weld-landing allowance on the cut plate. **Build the hull from
the spantenlijst (p22), and treat the plate tables as cutting patterns rather than as
hull offsets.** Do not assume `lengte` in a plate table equals `x` in the spantenlijst.

---

## 3. Key dimensions

All values below were read directly from the source named. Where sources disagree the
conflict is flagged rather than resolved.

### 3.1 Principal hull dimensions

| Item | Value | Source |
|---|---|---|
| Length over all (casco) | 5600 mm ± 50 mm (punt voordek tot achterkant achterdek) | Klassenvoorschriften v2.0 §CASCO |
| Length over all | 5.60 m ± 5 cm | Vademecum p21 and p79 |
| L.O.A. excl. berghout | 5586–5628 mm (nominal 5607) | Vademecum p81 meetrapport #15 |
| Length shown on sail plan | 5600 mm | Vademecum p3 |
| Beam | **1800 mm ± 100 mm** | Klassenvoorschriften v2.0 §CASCO |
| Beam | **1.80 m ± 5 cm**, measured *inside*, abaft the mast tube | Vademecum p21 and p79 |
| ⚠ **CONFLICT** | class rules allow ±100 mm, the Vademecum/keuring allows only ±50 mm | — |
| Max beam over berghout | 1790 mm | Vademecum p22 body plan |
| Max beam at boeisel/dolboord | 1750 mm | Vademecum p22 body plan |
| Beam at spant 6, berghout height | 1822–1830 mm (incl. berghout) | Vademecum p81 #22 |
| Holte (depth) | 0,90–0,95 m, from a taut line from foredeck over the aft dolboord | Vademecum p79 |
| Height vlak → measuring line along voorschot | 903–921 mm | Vademecum p81 #30 |
| Height vlak → measuring line along achterschot | 711–729 mm | Vademecum p81 #34 |
| Level (top stem − top transom) | 55 mm | Vademecum p81 #16; also on p23 |
| Freeboard-ish figure on sail plan | 1250 mm (waterline to sheer forward) | Vademecum p3 |
| Mast height above waterline | 5960 mm | Vademecum p3 |
| Draft | 0,30 m board up | nl.scoutwiki.org/Lelievlet (unofficial) |
| Draft | 0,80 m board down | nl.scoutwiki.org/Lelievlet (unofficial) |
| Weight, bare casco | 650 kg | scoutingvlet.nl; nl.scoutwiki.org |
| Weight of steel plate only (materiaallijst sum) | 706,955 kg | Vademecum p18 — ⚠ conflicts with the 650 kg figure; the 707 kg is *stock plate* including offcuts, not finished hull |
| Weight, fully rigged | 900–1000 kg | nl.scoutwiki.org (unofficial) |
| Air draft / height | **6,50 m** | en.wikipedia.org/wiki/Lelievlet; pampusgroep.nl/vloot/vletten.html |
| Air draft / height | 5,60 m, or 5,70 m rigged | nl.wikipedia.org/wiki/Lelievlet; nl.scoutwiki.org |
| ⚠ **CONFLICT** | three different "height" figures circulate. 5960 mm on the Vademecum sail plan (p3) is mast top above the waterline, which is closest to the 6,50 m claim once a burgee/antenna is allowed for. The 5,60 m figure looks like the *length* copied into the wrong field — do not use it | — |
| Doorvaarthoogte (mast down) | 85 cm | boatauction.com listing 4260 (dealer listing, unofficial) |
| ⚠ Length in a dealer listing | 575 cm | boatauction.com listing 4260 — disagrees with the official 560 cm; a loose measurement, ignore |
| 1956 prototypes | **4,80 m and 5,60 m**, identical centreboard cases, identical **12 m²** rig; the 5,60 m boat sailed better and was chosen | Vademecum p4 (primary source) |
| ⚠ **CONFLICT** | nl.wikipedia states the prototypes were 4,60 m with a 12,5 m² rig. The Vademecum foreword is the primary source and says 4,80 m / 12 m² | — |
| Hull numbering | started 1947 at **nr. 104** (existing vletjes counted backwards); first vletje built 1945, derived from the Zeeuwse *vleugbootje* | Vademecum p4 |
| Fleet size | ~1200 by 1987; ~1550 by 2006 | Vademecum p4; nl.scoutwiki |
| Origin of the drawings | Henk Bos measured **~100 existing Beenhakker vletten in 1970** and averaged them — the "official" lines are a statistical average, not an original design | Vademecum p4 |
| Junior lelievlet (different boat) | L 4,00 m · B 1,62 m · 7,00 m² · 350 kg · mast 4 m | nl.wikipedia.org/wiki/Lelievlet |
| Lelievlet 725 (different boat) | 7,25 × 2,46 m, draft 0,40 m | boatauction.com listing 5952 |
| Sail area total | 12,15 m² (grootzeil 8,15 + fok 4,00), max deviation 0,608 m² | Vademecum p57; Klassenvoorschriften |

### 3.2 Plate thicknesses

| Part | Thickness | Source |
|---|---|---|
| Kimmen (chine plates), boeisel, dekken, luchtkastschotten | **3 mm** | Vademecum p21 + p79 |
| Vlak (bottom), spiegel, zwaardkast, mastkoker | **4 mm** | Vademecum p21 + p79 |
| Zwaard, scheg, roer | **5,5 mm** | Vademecum p79 (keuringsrichtlijn) |
| Scheg | 5,5 **of 6 mm** | Vademecum p33 drawing |
| Zwaard | 5 mm, with a 6 mm doubler ("dubbeling dik 6") | Vademecum p38 drawing |
| Roerblad | 530 × 410 × **5,5** mm | Vademecum p40 drawing + p18 materiaallijst |
| ⚠ **CONFLICT** | scoutingvlet.nl states: bottom/transom/frames 4 mm; zwaardkast, mastkoker, zwaard, roer, scheg **5 mm**; other plating 3 mm; steel S235, blasted. Boer Metaaltechniek's price list likewise sells a **5 mm** zwaardkast plate. Two independent current builders therefore use 5 mm where the 1988 keuringsrichtlijn says 5,5 mm | https://www.scoutingvlet.nl/product/scoutingvlet-snijpakket/ ; Boer Metaaltechniek 2019 price list (Wayback) |
| ⚠ **Real-world deviation** | Maasgroep 18 built their vlet *Njord* with **4 mm instead of the specified 3 mm** topside/chine plating, because 3 mm deflected during construction and needed extra frames | https://www.maasgroep18.nl/web/njord/ |
| Berghout | 20 mm round solid bar | Vademecum p21, p79, p81 #47 |
| Dolboord | 1" gaspijp, 33,7 mm OD, outside the hull (inside at the transom) | Vademecum p21, p81 #48 |
| Voorplecht | 4 mm, slightly convex | Vademecum p35 |
| Wrangen (floors) | 3 mm | Vademecum p34 |

### 3.3 Hull shaping tolerances

| Item | Value | Source |
|---|---|---|
| Spiegel (transom) curvature | minimum 10 mm bulge; ~10 mm visual check | Vademecum p21, p82 #79 |
| Vlak V-shape over the whole length | minimum 10 mm | Vademecum p21 |
| Bolling van het vlak (outward) | ~10 mm | Vademecum p82 #78 |
| Bolling voorplecht | ~10 mm | Vademecum p82 #80 |
| Deck camber (voordek and achterdek) | 40 mm per metre | Vademecum p29, p31 |
| Deck position | 20 mm below the boeisel/kim seam | Vademecum p21 |
| Scheg, roer, zwaard vs. drawings | ± 2,5 mm | Vademecum p79 |

### 3.4 Longitudinal layout (meetrapport p81)

Datum "Punt 0" = **back of the mast tube / front of the centreboard case**.
Values are min–max from the official measuring report; nominal is the midpoint.

| # | Item | min | max |
|---|---|---|---|
| 1 | Punt 0 → forward buoyancy bulkhead | 437 | 461 |
| 2 | Punt 0 → centre of forward rowlock socket | 10 | 34 |
| 3 | Punt 0 → inside of the stem (where boeisel/kim/vlak landings meet) | 950 | 1984 (as printed; the 950 looks like a typo in the source) |
| 4 | Punt 0 → centre of shroud chainplate | 247 | 279 |
| 5 | Punt 0 → fairlead 1 | 266 | 298 |
| 6 | Punt 0 → front of forward thwart support | 366 | 368 |
| 7 | Punt 0 → fairlead 2 | 726 | 758 |
| 8 | Punt 0 → middle rowlock socket | 888 | 918 |
| 9 | Punt 0 → fairlead 3 | 1126 | 1158 |
| 10 | Punt 0 → front of aft thwart support | 1326 | 1358 |
| 11 | Punt 0 → mainsheet eye | 1876 | 1908 |
| 12 | Punt 0 → aft rowlock socket | 1876 | 1908 |
| 13 | Punt 0 → fairlead 4 | 1926 | 1958 |
| 14 | Punt 0 → aft buoyancy bulkhead | 2321 | 2363 |
| 17 | Length between fore and aft buoyancy bulkheads | 2760 | 2780 |
| 18 | Aft bulkhead → front of middle floor (wrang) | 1380 | 1380 |
| 19 | Length of the centreboard case on the bottom | 941 | 959 |

From p25: **aft bulkhead at 968 mm from the transom; forward bulkhead at 3750 mm from
the transom.** (These two are consistent with #17: 3750 − 968 = 2782.)

From p24 (longitudinal section), the **wrangen (floors)** sit at 450, 950, 1420, 1870,
2330, 2790, 3270 and 3720 mm from the datum used on that page.

### 3.5 Transom, bulkheads, cockpit widths

| Item | Value | Source |
|---|---|---|
| Spiegel plate stock | 4 mm, 960 × 680 mm | Vademecum p28 |
| Spiegel width at dolboord (outside) | 857–863 mm | p81 #26 |
| Spiegel width at berghout (inside, excl. berghout) | 957–963 mm | p81 #27 |
| Spiegel width at the vlak | 567–573 mm | p81 #28 |
| Spiegel height on centreline, vlak → dolboord | 677–683 mm | p81 #35 |
| Angle centreline–transom | 59° | p81 #39 |
| Angle transom–bottom | 134° | p81 #40 |
| Voorschot (fwd bulkhead) plate | 3 mm, 1700 × 600 mm stock | p30, p18 |
| Voorschot width at berghout height (inside) | 1696–1704 mm | p81 #20 |
| Voorschot width at the vlak (inside) | 1080–1088 mm | p81 #21 |
| Voorschot height on centreline incl. pipe | 613–619 mm | p81 #29 |
| Achterschot (aft bulkhead) plate | 3 mm, 1500 × 428 mm stock | p32, p18 |
| Achterschot width at berghout height (inside) | 1496–1506 mm | p81 #24 |
| Achterschot width at the vlak (inside) | 877–883 mm | p81 #25 |
| Achterschot height on centreline incl. pipe | 441–447 mm | p81 #33 |
| Rand luchtkast voor (buoyancy tank rim, 20 mm round) | 1690 mm | p19 |
| Rand luchtkast achter | 1476 mm | p19 |

### 3.6 Zwaardkast, mastkoker, zwaard

| Item | Value | Source |
|---|---|---|
| Zwaardkast + mastkoker plate | 4 mm | p36 |
| Zwaardkast length on the bottom | 941–959 mm (nominal 950) | p81 #19; p36 shows 950 |
| Zwaardkast developed side plate | 950 long, 905 on the other edge, 460/535 wide; height offsets at 100 mm steps: 466, 475, 484, 491, 496, 500, 503, 505, 505, 505 | p37 |
| Zwaardkast wand stock | 2 × 1000 × 540 mm, 4 mm | p18 |
| Height of the front of the zwaardkast above the vlak | 497–503 mm | p81 #32 |
| Mastkoker mould tolerance | min 92, max 96 mm | p82 #49 |
| Mastkoker internal | 92–96 mm (mast foot is 90 × 90 mm square) | p36, p83 #2 |
| Mastkoker parts | back 700 × 100, sides 2 × 450 × 115, bottom 115 × 100, all 4 mm | p18 |
| Height of the mast bolt above the vlak | 736–754 mm | p81 #31 |
| Mast bolt / grendel | M12 × 120 | p21, p36 |
| Zwaard (centreboard) blade | 900 × 450 mm, 5 mm, with 6 mm doubler; 450 mm chord; R=880 leading curve; R=40 corners; pivot 175 mm down / 70 mm in from the corner; all holes ⌀13 | p38, p18 |
| Zwaardbout | M12 × 55, galvanised, with locking | p21, p82 #70 |

### 3.7 Roer (rudder) and scheg (skeg)

| Item | Value | Source |
|---|---|---|
| Roerblad | 530 × 410 × 5,5 mm; 325 mm to the R=205 centre; 270 mm from the leading edge at the top; blade sits at 82° to the stock | p40 |
| Roerkoning (stock) | 1" gaspijp × 1050 mm | p40 |
| Rudder head plate | part 2, 70° | p40 |
| Roerhaak plates | 40 × 12 mm, 3 off, 65 mm each; hole ⌀20, R=20 / R=17, 45 mm overall | p40, p19 |
| Vingerling spacing on the transom | 190 mm, 560 mm, 855 mm | p42 |
| Rudder bolts | 2 × M6 × 50 galvanised + 2 Nyloc M6 | p21 |
| Scheg (skeg) | 1040 mm long × ~230 mm max height, 5,5 or 6 mm; R=60 aft, R=100 forward, 140 / 60 / 80 setback dims | p33 |
| Scheg length measured along the vlak | 1036–1044 mm | p81 #41 |
| Scheg height perpendicular to the vlak | 198–202 mm | p81 #42 |

### 3.8 Wrikgat, dollen, doften, buikdenning, berghout

| Item | Value | Source |
|---|---|---|
| Wrikgat (sculling notch) | 81–89 mm high × 81–89 mm wide (nominal 85 × 85); centre 133–147 mm from the dolboord; on starboard | p81 #36–38; p23 shows "DIEP 85" and 140 |
| Wrikgat reinforcement | 35 × 10 flat, 250 mm | p19 |
| Rowlock sockets (dolpotten) | ¾" pipe × 100 mm, welded vertical to the boeisel, 50 mm down; at boardhoogte; tolerance max 2 mm on the mould | p35, p82 #50, #63 |
| Number of rowlocks | 6 dollen (3" galvanised) supplied; meetrapport houtwerk lists 4 | p46 vs p83 #20 — ⚠ minor conflict |
| Doften (thwarts) | 2 off, 1850 × 200 × 35 mm, yang timber | p46 |
| Doft supports (dofthouders) | 4 off, 330 × 60 mm, 2 mm plate; aligned on the buoyancy-tank rubbing strips, with a drain hole | p18, p21 |
| Klassenvoorschriften minimum | at least 2 doften | Klassenvoorschriften v2.0 |
| Buikdenning (floorboards) | 6 pcs 190 × 20 × 1345 mm + 6 pcs 190 × 20 × 1395 mm, plus 8 cleats 100 × 30 (490, 530, 610, 620 mm) | p83 #18; p5 amendment note "voorste buikdenning lengte 1395 mm" |
| Berghout | 20 mm round solid, total 12000 mm | p21, p19 |
| Slijtstrippen on the bow | 3 pieces, 16 × 8 half-round or 15 × 5 flat; 1 × 700 and 2 × 600 long; start 25 mm behind the forward buoyancy bulkhead | p21, p24, p82 #57 |
| Strip on the voorschot | 40 × 5, 1000 mm long | p24, p36, p5 |
| Kikkers on the foredeck | ~250 mm from the plecht, on the dolboord | p82 #58 |
| Sleepoog | ~180 mm below the berghout | p82 #64 |
| Drain holes | 4 × ⌀16 mm between deck and the boeisel/kim seam at the tank bulkheads | p21, p82 #67 |
| Kimplaat width at the voorschot | 541–547 mm | p81 #43 |
| Boeisel width at the voorschot | 238–242 mm | p81 #44 |
| Kimplaat width at the achterschot | 461–467 mm | p81 #45 |
| Boeisel width at the achterschot | 234–238 mm | p81 #46 |

### 3.9 Rig (for completeness — you asked mainly about the hull)

| Item | Value | Source |
|---|---|---|
| Mast | grenen, 5600 mm, foot 90 mm square (88×88–90×90), measured 5570–5630 | p46, p83 |
| Mast bolt hole from the foot | 380 mm | p83 #3 |
| Foot → centre lummelbeslag | 900 mm | p83 #4 |
| Foot → underside hommerring | 4700 mm | p83 #5 |
| Class rule mast | 5000–5800 mm, ⌀ ≥ 80 mm tapering to ≥ 55 mm, wood or single thick-walled aluminium tube | Klassenvoorschriften v2.0 |
| ⚠ **CONFLICT** | Vademecum specifies a 5600 mm grenen mast; the 2025 class rules permit 5000–5800 mm and aluminium | — |
| Gaffel | grenen 2700 mm, ⌀47 mm (measured 2680–2720) | p46, p83 #6 |
| Giek | grenen 2750 mm, ⌀47 mm (measured 2730–2770) | p46, p83 #10 |
| Class rule giek / gaffel | max 3000 mm each | Klassenvoorschriften v2.0 |
| Helmstok | hickory, 950 mm, foot 150 long × 30 thick × 75 high | p46, p83 #12–13 |
| Roeiriemen | 6 × essen, 11 ft = 3113 mm, blade 120 × 25 mm, loom ⌀50 | p46, p83 #14 |
| Wrikriem | 1 × essen, 12 ft = 3396 mm, blade 140 × 25 mm, loom ⌀60 | p46, p83 #15 |
| Vaarboom | 4000 mm | p46, p83 #16 |
| Mik | 1210 mm, 20 mm round solid, galvanised | p35, p46 |
| Anker | 7,5 kg (Vademecum) / min 7 kg with 15 m of ≥10 mm line (class rules) | p64; Klassenvoorschriften |
| Sail plan | gaffel 2700 / 600 / 900 / 600 mm dims on p3; grootzeil achterlijk 4700–4780, bovenlijk 2560–2640, onderlijk 2560–2640, voorlijk 2610–2690; fok achterlijk 4030–4110, voorlijk 4160–4240, onderlijk 1960–2040 | p3, p84 |

---

## 4. Secondary sources consulted (not downloaded)

### 4.1 scoutingvlet.nl — the yard currently building lelievletten
- https://www.scoutingvlet.nl/lelievlet/
- https://www.scoutingvlet.nl/product/scoutingvlet-snijpakket/ — CNC **snijpakket**
  (plasma-cut plate developments with engraving), €2.825. States 5,60 × 1,80 m, 650 kg;
  plate: bottom/transom/frames 4 mm, zwaardkast/mastkoker/zwaard/roer/scheg 5 mm,
  other plating 3 mm. Includes a step-by-step build description.
- https://www.scoutingvlet.nl/product/scoutingvlet-casco-zonder-coating/ and the
  2-component coated variants — casco ≈ €5.050, sailaway ≈ €7.580 (prices as published).
- **No DXF/DWG published.** The plate developments are sold as cut steel, not as files.
  Worth an e-mail if you want CAD geometry — they must hold DXFs to drive the plasma table.
- **Trustworthiness:** current commercial builder, delivers CE-certified hulls with
  Scouting Nederland sail/boat numbers. Specs are consistent with the Vademecum except
  the 5 mm vs 5,5 mm zwaard/roer/scheg difference noted above.
- https://www.scoutingvlet.nl/downloads/ — only a `zeilboekje_2.pdf` (sailing primer,
  not construction) and a test image. Nothing useful for hull geometry.

### 4.2 https://lszw.scouting.nl/downloads-en-links
Official LSZW (Landelijke Scouting Zeilwedstrijden) download index. Source of items
1.1, 1.3, 1.4. Also carries 2026 event paperwork with no technical content.

### 4.3 https://nl.scoutwiki.org/Lelievlet (Scoutpedia)
Unofficial wiki. Gives 5,60 × 1,80 m, draft 0,30 m / 0,80 m with board down,
650 kg casco, 900–1000 kg rigged, 12,15 m² sail, 6 rowers, "knikspantvlet", air tanks
fore and aft, wrikgat on starboard, first boat built 1956 at Teunis Beenhakker's yard,
~1550 built in NL by 2006. Useful for the draft figures, which the Vademecum does not
state. Treat as secondary.

### 4.4 Boer Metaaltechniek, Bleskensgraaf — the other builder
Melkweg 22c, 2971 VK Bleskensgraaf (KvK 67531601), successor to Botenbouw Tukker
(bankrupt 2016). **Their lelievlet pages are 404 today**; recovered from the Wayback
Machine:
- `web.archive.org/web/20201001182317/https://www.boermetaaltechniek.nl/lelievlet/materiaal-en-onderhoud/`
  — "De mallen en tekeningen van toen hebben wij omgezet in een 3D ontwerp… Alle
  lelievletten worden bij ons laser gesneden." So a second, independent 3D CAD model of
  the lelievlet exists in private hands. CE-tested; Sigma Cover 280 or Hempel
  Multistrength coating.
- `.../20201001195021/.../lelievlet/snij-pakket-lelievlet/` — snijpakket: laser-cut
  plates with laser-scribed lines accurate to the millimetre, profiles cut and bent,
  guaranteed to satisfy the Scouting Nederland keuringseisen.
- `.../20190824184139/.../lelievlet/prijslijst-lelievlet/` — 2019 price list: casco
  €4380 incl. primer / €3730 excl.; casco incl. RVS parts + corten zwaardkast €4530;
  zwaardkast €1645; zwaardkast plate 5 mm blasted €295; zwaard with loper €145 steel /
  €152 RVS; roer €145 / €175; **set spanten €52**; dolpot €3,25; kikker €2,40; hanekam
  €3,23; wantputting €1,95; vingerling €3,25; leioog €0,75.
- Note the price list again implies **5 mm** for the zwaardkast, matching scoutingvlet
  and contradicting the Vademecum's 4 mm for the case / 5,5 mm for blade and skeg.

### 4.5 Other suppliers named by Scouting Nederland
From https://www.scouting.nl/bestuur/accommodatie-vloot-en-materiaal/lelieboten :
hulls from **Boer Metaaltechniek**, **Scheepswerf Nieko** (Oostelijke Industrieweg 25,
Franeker — cascos, repairs, woodwork) and **ScoutingVlet**; woodwork from
**De Rie Masten**; sails from **Van de Gruiter BV**. Sail/casco numbers are requested
through `waterscouting@scouting.nl`.

**Beenhakker, Kinderdijk** — the original builder. No current web presence for boat
sales. By June 1986 the yard's cumulative build count across all vlet types stood at
**8784**; the firm was continued by Jacob Beenhakker and son Theo (Vademecum p4).

### 4.6 https://www.modelbouwtekeningen.nl/en/nvm-1008028-lelievlet.html
NVM drawing 10.08.028 "Lelievlet" — a model-builder's plan, €48,15. **Paid; not
downloaded.** Could be a useful cross-check on the hull lines if you want to buy it.

### 4.7 Forum threads — read in full, nothing downloadable survives
- https://www.modelbouwforum.nl/threads/model-bouwtekening-van-lelievlet-maken.4477/
  (5 pages). Every image host it used is dead (`foto.modelbouwforum.nl/uploads/afb*.jpg`
  now return HTML; the Yahoo group `groups.yahoo.com/group/bootjes/` is gone;
  `waterwerk.scouting.nl` is dead and Wayback holds only 2003–2007 HTML). Where members
  said they got drawings: the OP measured a real boat himself; "horus" (Chris Ammeraal)
  **digitised the old drawings into AutoCAD** and shared them privately; another member
  bought a drawing with `uitslagen van de huidplanken` at the **Scheepvaartmuseum
  Amsterdam**; repeated pointers to the NVM plan. In-thread figures (~5 m LOA, ~1,5 m
  beam, mast ~6 m) are eyeballed and **less accurate than the Vademecum** — ignore them.
  One usable detail: the gunwale tubes are quoted as 1" and ¾" OD.
- https://www.modelbouwforum.nl/threads/lelievlet-1-7.156858/ (9 pages) — a motor
  *sleepvlet* scratch-build, not this boat. Its only value is pointing at the Bos PDF
  (already in hand) and confirming the 4,8 m / 5,6 m prototype story.
- https://watersportforum.eu/viewtopic.php?f=2&t=4715 — **dead end**, 3 posts from 2019,
  no drawings or dimensions. The replies point at unrelated commercial kits
  (blomaak.nl/vlet/, gaastmeerdesign.nl loodsjol-650).

### 4.8 NVM drawing 10.08.028 — details confirmed from the official catalogue
From https://www.modelbouwers.nl/catalogi/Catalogus%20schepen.pdf : scale **1:10, 2
sheets, l.o.a. 57 cm**, contents *algemeen plan; spantenplan; tuigplan*, €36,25 for NVM
members, "gebaseerd op tekeningen uit publicaties van Scouting Nederland", with an
article in *de Modelbouwer* 2003/4. Sold to non-members at €48,15 via
modelbouwtekeningen.nl. **Paid, not downloaded.** Since it is explicitly derived from
the Scouting Nederland publications you already have, it is unlikely to add geometry.

---

## 6. Existing 3D models elsewhere

| URL | What | Format | Licence |
|---|---|---|---|
| https://www.thingiverse.com/thing:4744451 | "Lelievlet" by `rikki_nl`, 2021 — hull plus mast, gaff, boom, oars | STL, 6 files (`kuip_v2.stl` 41,6 MB) | **CC BY**, free |
| https://www.thingiverse.com/thing:7408320 | "Scouting Lelyvlet" by `ggcmulder`, 2026 — remix adding rudder, zwaard, zwaardkast, bakskist | STL, 5 files | CC BY-SA, free |
| https://www.thingiverse.com/thing:4747453 | Whiteboard magnets by `Chr37` — stylised, **not to scale** | STL + STEP | CC BY-NC-SA, free |
| https://3dwarehouse.sketchup.com/model/4d9dded7e736757ac85f2a5a64a0c0ea/Junior-Vlet | "Junior Vlet" — the smaller sister boat, 5 935 polys | .skp / glb / usdz | 3D Warehouse General, free |

Not downloaded: these are meshes rather than drawings, and Thingiverse is bot-gated.
They are worth pulling by hand as a silhouette cross-check, but the official DWG (§1.2b)
supersedes them for accuracy.

**Verified to contain nothing** (searched *lelievlet, scoutingvlet, juniorvlet,
beenhakkervlet, lelieschouw, vlet*): Sketchfab (API + UI), GrabCAD, Printables, Cults3D,
TurboSquid, CGTrader, Free3D, Thangs. Yeggi surfaces only the two Thingiverse items.
**BlendSwap is the one platform not conclusively checked** (JS-only search).

---

## 7. Photo sets (URLs only, as requested)

**Wikimedia Commons:** the category is `Category:Lelievletten`, **not** `Category:Lelievlet`
(that one 404s) — https://commons.wikimedia.org/wiki/Category:Lelievletten — 110 files,
CC BY-SA 3.0, many at 4288×2848. Largest series: Nautilus Delft 1128 (×9) and 1129 (×9),
Triton Culemborg (×9), Waingunga 534 (×5), Pocahontas (×5). **Caveat: essentially all of
them are on-water under sail.** No out-of-water, trailer, underside or interior shots.

Better for hull shape:

1. https://boatauction.com/nl/boat-selling/4260/open-zeilboot/lelievlet/scouting — 12
   photos of a **bare stripped steel casco**. Probably the best set found.
2. https://www.marktplaats.nl/v/watersport-en-boten/bootonderdelen/m2416563878-lelivlet-5-60-mtr
   — 4 photos, **brand-new 5,60 m casco in primer, on land**, no rig or floorboards;
   plate seams, chine, stem and transom all readable.
3. https://www.zeeverkennerssintjoris.nl/pg-27820-7-78396/pagina/onderhoud_vaartuigen.html
   — ~16 photos, annual haul-out in the boathouse. Largest genuine maintenance gallery.
4. https://scouting-olav.nl/blog/2023/onderhoud-aan-de-boten/ — 5 photos, boats ashore
   with **bottoms** being painted.
5. https://onlinezeilschool.nl/onderdelen-lelievlet/ — labelled **casco cross-section**
   and **top-down casco** diagrams keyed to a 102-part list. Best source for interior
   nomenclature.
6. https://www.scoutingvlet.nl/lelievlet/ — the current builder's clean orthographic
   **front / side / top** renders, plus plasma-cut plate-kit photos.
7. https://www.fivelgroep.nl/vloot/lelievletten/ (2 midwinter shots ashore) and
   https://scoutingmarcopolo.nl/lelievletten/ ("in de botenloods").
8. https://zeilersforum.nl/index.php/forum-125/projecten/46400-een-lelievlet —
   restoration of vlet 533 (Katwijkse Zeeverkenners, built 1970), scraping and painting.
   Attachments are lazy-loaded; needs a manual browser pass.
9. https://www.flickr.com/photos/tags/lelievlet/ — ~60 photos, all on-water; JS-only UI.

Angles above are inferred from page text, not pixel-verified.

---

## 8. What is still missing

- **No true lines plan (lijnenplan)** with waterlines and buttocks exists for this boat,
  and there never was one. The Vademecum foreword states plainly that no national
  drawings existed; the 1988 drawings were reverse-engineered in 1970 by measuring ~100
  Beenhakker hulls and averaging them. The spantenlijst on p22 is the closest thing.
- **No edition of the Vademecum newer than the 8th (1988).** LSZW's own download page
  lists only this one. A Scribd copy of the same edition is paywalled and was skipped.
- **No free full-scale DXF / cutting file.** Both current builders (ScoutingVlet,
  Boer Metaaltechniek) cut from their own CAD — Boer explicitly says they converted the
  old moulds and drawings into a 3D design for laser cutting — but neither publishes it.
  Worth an e-mail to either if you want production geometry.
  *Partial substitutes now in hand:* the official Scouting Nederland DWG (§1.2b, 3D
  solids, mm) and the Boekel ~1:10 vector plate developments (§1.2c).
- The Vademecum PDF is a **scan**, so its tables cannot be vectorised — hence §2.
- `zeilnummers.nl` (the lelievlet register) is **dead** — the server refuses connections
  and there is no useful Wayback content.
- `lelievlet.nl` was only ever a small WordPress blog (2013–2018); no drawings or specs.
- **ScoutingDump may hold more** than the four files found (#354, #416, #439, #495) —
  its search is POST/JS-driven and did not respond to scripted queries. Worth a manual
  browse. Its TLS certificate is expired, so `curl -k` is required.
- **Marktplaats** blocks scripted fetches; only aggregator snippets were readable.
- **No good multi-angle out-of-water photo set** exists on the open web. Wikimedia's 110
  images are all sailing shots. The two casco-for-sale listings (§7.1, §7.2) are the only
  clean bare-hull sets, and they will disappear when the listings expire — **grab those
  images now if you want them.** Facebook (Scouting Olav; the VAKWIJS / "Vletten op de
  Maas" school build project, which photographs bare hulls under construction) is where
  the missing material probably lives; not searched, per instruction.
- `boekel.nu/minivlet/A1 genest.pdf` (the nested version of the 1:10 plate drawing)
  returns HTTP 200 with **0 bytes** — broken on the server, not a fetch failure.
