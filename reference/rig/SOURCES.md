# Lelievlet — rig & sail reference sources

> **Correction (2026-09-19, after cross-checking).** Statements in this file about the official
> 3D DWG are superseded by `../cad/README.md`. The DWG is *not* hull-only — it contains mast, giek,
> gaffel, zeilen, stagen/beslag, doften, buikdenning, helmstok and riemen (222 ACIS bodies) — and
> the `dwg2dxf` route is *not* lossless: every SAT body it produces is truncated with a
> valid-looking end marker appended. The DXF and `lelievlet_3d_sat/` derivatives were therefore
> deleted; complete bodies are in `../cad/sab/`. Files duplicated across folders are now symlinks
> to one canonical copy (see `../README.md`).


Collected 2026-09-19. All files in this directory were downloaded and verified with `file`
to be real PDF/ZIP/PNG data (not HTML error pages).

Officialness legend:
- **[OFFICIAL]** — Scouting Nederland / LSZW (the class authority)
- **[SEMI]** — scouting group or supplier reproducing official material
- **[INFO]** — hobby/wiki/commercial, use only as cross-check

---

## 1. Downloaded files

### `vademecum_waterwerk_deel8_lelievlet_vlettenboek.pdf` **[OFFICIAL] — the primary source**
- Source: https://lszw.scouting.nl/images/lelievlet.pdf
  (byte-identical copy also at https://kaagcup.scouting.nl/images/download/lelievlet.pdf and
  https://www.maasgroep18.nl/usercontent/web/lelievlet/lelievlet.pdf — md5 `7fcd315c28f7b23659a3ca4ecd13fa6d`)
- "Vademecum voor het waterwerk, deel 8 — De Lelievlet", 8th print (rev. 1 June 1988), 86 pages.
  This is *the* official build manual ("het Vlettenboek"); the 2025 class rules explicitly name it
  as the underlying document for all hull, spar and sail dimensions.
- Rig-relevant pages: 15–17 (general arrangement + numbered parts list), 46 (houtwerk/beslag spec),
  47 (mast drawing), 48–49 (top- and hommerring), 50 (gaffel, giek, helmstok, vlaggestok),
  51 (gaffelklauw), 52 (lummelbout en wervel), 56 (specificatie tuigage), 57–59 (sail spec,
  construction, measurement), **60 (ZEILPLAN with all lijk dimensions)**, 61 (klephaak
  voorstagspanner), 62 (schootring), 36 (mastkoker), 43 (hanekam), 44 (grootschootoog, kikkers),
  45 (fokkeschootogen, wantogen), 81–84 (meetrapport / measurement forms with min–max tolerances).

### `vlettenboek_rig_pages/` (25 × PNG, 300 dpi)
- Rendered from the PDF above with `pdftoppm`, descriptively named per page, e.g.
  `p60_ZEILPLAN_lelievlet.png`, `p47_mast.png`, `p84_meetrapport_tuigage_zeilen.png`.
- Note: pages 60, 16, 22, 23, 37 are drawn **upside-down (rotated 180°)** in the original scan.

### `lszw_klassenvoorschriften_lelievlet_v2.pdf` **[OFFICIAL]**
- Source: https://lszw.scouting.nl/images/LSZW-2025/PDF-files/KLASSENVOORSCHRIFTEN_Lelievlet_v2.pdf
  (same file at https://kaagcup.scouting.nl/images/download/2026/PDF-files/KLASSENVOORSCHRIFTEN_Lelievlet_v2.pdf)
- "Klassenvoorschriften Nationale Lelievlet Klasse", version 2.0, valid from 1 May 2025, 6 pages.
  Class authority: Scouting Nederland. Contains the current **RONDHOUT / STAAND WANT /
  LOPEND WANT / ZEILEN / GROOTZEIL / FOK** sections (min–max envelopes rather than exact
  dimensions; it defers to the Vlettenboek for the sail dimensions).
- v1.3 / v1.0 (2024) is referenced on lszw.scouting.nl but no live URL was found; only v2.0 is online.

### `scouting_activiteitenbank_benamingen_vlet.pdf` **[OFFICIAL]**
- Source: https://activiteitenbank.scouting.nl/uploads/Benamingen_vlet.pdf
- "Onderdelen van de lelievlet" — 2 pages: a numbered line drawing of a fully rigged lelievlet
  (sail insignia + number 266 visible) plus the answer key with 81 Dutch part names. Best quick
  nomenclature reference for labelling a 3D model.

### `scoutingdump_handboek_lelievlet.pdf` **[SEMI]**
- Source: http://www.scoutingdump.nl/file/download/416/handboek-lelievlet (free, no login)
- 78 pages — an **earlier print of the same Vlettenboek** (identical table of contents, no page
  numbers in the index, no meetrapport forms). Useful as a cross-check on the same drawings.

### `scouting_3D-Model-binded-lelievlet.zip` + `scouting_3D_model_dwg/3D Model-binded.dwg` **[OFFICIAL]**
- Source: https://www.scouting.nl/assets/uploads/doorzoekbareBestanden/06.Ondersteuning/Kennisnetwerk/Accomodatie-en-gebouwen/Waterscouting/Lelieschepen/3D-Model-binded-lelievlet.zip
- 15.3 MB zip → 16 MB AutoCAD 2007 DWG (dated 2012), linked from the official
  Scouting Nederland "Lelieschepen" page.
- **Checked with libredwg: it contains NO rig.** Layers are only `0`, `DEFPOINTS`,
  `PartSolids-Frame`, `PartSolids-Long Shell` — 215 3DSOLIDs = hull frames + shell plating only.
  Useful for the hull, useless for the rig.

### `maasgroep18_lelievlet_platenpakket.pdf` **[SEMI]**
- Source: https://www.maasgroep18.nl/usercontent/web/lelievlet/Lelievlet_platenpakket.pdf
- 6 pages — steel plate nesting / cutting drawings of the casco. Hull only, no rig.

### `scoutingelburg_bouwpakket_lelievlet.pdf` **[SEMI]**
- Source: https://scoutingelburg.nl/onewebmedia/Bouwpakket%20Lelievlet.pdf — 4 pages, scanned
  kit/quotation sheets for a lelievlet building kit.

### `caynoya_lelievlet.pdf` **[SEMI]**
- Source: https://www.cay-noya.nl/downloads/zeeverkenners/Lelievlet.pdf (ZV Cay-Noya, June 2007)
- 2 pages: complete inventory list "INHOUD/SAMENSTELLING LELIEVLET" broken down into Romp / Mast /
  Vallen / Rondhout / Zeilen / Verstaging / Driftbeperking / Roeien & Wrikken / Roer / Overig.
  Excellent plain-language checklist of *which* rig parts exist and how they connect
  (klauwval + piekeval in one double block or two single blocks, dirk/kraanlijn optional, etc.).
  No dimensions.

### `scoutingdebevers_kielboot3_lesboek.pdf` **[SEMI]**
- Source: https://www.scoutingdebevers.nl/wp-content/uploads/2023/10/Kielboot-III-Lesboek.pdf
- 72 pages, CWO Kielboot III sailing theory with Scouting/lelievlet focus.

### `katwijkse_zeeverkenners_kielboot3_boek.pdf` **[SEMI]**
- Source: https://www.cyoc.nl/pdf/kb3_boek.pdf — CWO Kielboot III booklet, Katwijkse Zeeverkenners
  (companion to the CWO zeil instructieboek you already have).

### `scoutingvlet_zeilboekje_2.pdf` **[SEMI]**
- Source: https://www.scoutingvlet.nl/wp-content/uploads/2016/12/zeilboekje_2.pdf
- 12 pages, ZV Cay-Noya "Zeilboekje 2", CWO kielboot I/II/III requirements — includes
  *Tuigage*, *Zeiltekens* and *Reefsystemen* items.

### `lszw_nk_lelievlet_2026_aankondiging.pdf` / `kaagcup_wedstrijdbepalingen_2026.pdf` **[OFFICIAL]**
- https://lszw.scouting.nl/images/LSZW-2026/PDF-files/aankondiging-NK_Lelievlet_2026_versie_3_GG_def.pdf
- https://kaagcup.scouting.nl/images/download/2026/PDF-files/Kaagcup_wedstrijdbepalingen_web_2026-05-04.pdf
- Racing NoR/SI. Contain the per-event additions to the class rules (sheet-cleat/reef exceptions etc.).

---

## 2. Useful online pages (not downloadable files)

| URL | What | Official? |
|---|---|---|
| https://www.scouting.nl/bestuur/waterscouting/lelieschepen | Official "team Lelieschepen" page: numbering, keuring, links to the 3D model and the build video https://www.youtube.com/watch?v=MwjqskasGZ8 | [OFFICIAL] |
| https://lszw.scouting.nl/downloads-en-links | Index page holding the Vlettenboek + Klassenvoorschriften links used above | [OFFICIAL] |
| https://nl.scoutwiki.org/Lelievlet | Scoutpedia: hull/sail overview, sail area 12.15 m² | [INFO] |
| https://nl.scoutwiki.org/Grootzeil | Scoutpedia: grootzeil 8,15 m², max deviation 5 % incl. fok | [INFO] |
| https://onlinezeilschool.nl/onderdelen-lelievlet/ | Labelled lelievlet parts diagram | [INFO] |
| https://zeilen.scoutingniftarlake.nl/cursus/deel1.php | Simple labelled lelievlet diagram (`images/lelievlet.jpg`) | [INFO] |
| https://www.scoutingvlet.nl/product-categorie/houtwerk/rondhout/ | Supplier of Scouting Nederland-model spars; lists mast Oregon 5600 mm, giek grenen 2750 mm, gaffel grenen compleet | [SEMI] |
| https://www.maasgroep18.nl/web/lelievlet/ | Group page with the Vlettenboek + platenpakket | [SEMI] |

### Not retrievable / not downloaded
- `https://bds.home.xs4all.nl/lelievlet/In_gebruik_nemen_van_de_Lelievlet.pdf` and the rest of Henk &
  Janneke Bos's xs4all lelievlet archive (incl. "De lelievlet 8e druk"): **the xs4all site is dead**,
  it now serves a mijnweb.site parking page. The Internet Archive was **"Temporarily Offline"** at the
  time of this run, so no Wayback copy could be fetched — worth retrying later:
  `https://web.archive.org/web/2020/https://bds.home.xs4all.nl/lelievlet/`
- https://www.vandegruiter.com/waterscouting/lelievlet/lelievlet-zeilen — sailmaker with ~18 lelievlet
  sail variants (ECO, Zeeuws model, with/without reef system). **Cloudflare-blocked to scripted
  fetching** (HTTP 486); no login/payment needed, just open it in a browser.
- https://www.miedemasails.nl/lelievlet-grootzeil/t20e382/ — Miedema Sails (Heeg) makes lelievlet
  sails; the page is a quote-request form only, **it publishes no dimensions**.
- https://www.modelbouwtekeningen.nl/en/nvm-1008028-lelievlet.html — NVM model drawing 10.08.028
  of the lelievlet. **Paid product, not downloaded.**
- Klassenvoorschriften Lelievlet **v1.3** — referenced by LSZW but superseded; no live URL found.

---

## 3. Key dimensions

Unless stated otherwise, everything below is from
`vademecum_waterwerk_deel8_lelievlet_vlettenboek.pdf` ("VB p.N") — the official Scouting Nederland
build manual — and the min/max columns come from its own measurement forms (meetrapport, pp. 81–84).
"Nominal" = the drawing value on VB p.60 / the midpoint of the meetrapport tolerance band.

### 3.1 Sail areas

| Item | Value | Source |
|---|---|---|
| Grootzeil | **8,15 m²** | VB p.57, p.59 (Heron calc); nl.scoutwiki.org/Grootzeil |
| Fok | **4,00 m²** | VB p.57, p.59 |
| Total "standaard Lelievletzeil" | **12,15 m²** | VB p.57 heading, p.59 |
| Max. total area deviation | 5 % = 0,608 m² (grootzeil + fok together) | VB p.57 |
| Measuring method | Heron/"S-formule" on 1 triangle for the fok, 2 for the grootzeil; max 15 kg tension in the lijken; roach, fok-broek (≤10 % of lijk), fok leech hollow (≤3 %) and grootzeil leech roach are excluded | VB p.57, p.59 |

> **Conflict:** several web sources (incl. English Wikipedia and secondary pages) quote
> **12,25 m² total / 8,25 m² grootzeil**. The Vlettenboek's own arithmetic on p.59 gives
> 3,443 + 4,707 = 8,150 and 8,150 + 4,00 = **12,15 m²**. Use 12,15 / 8,15 / 4,00.

### 3.2 Grootzeil — lijk lengths (gaff mainsail)

VB p.60 gives the nominal drawing values; VB p.84 "MEETRAPPORT LELIEVLET TUIGAGE" gives min–max.

| Lijk | Nominal | Min | Max |
|---|---|---|---|
| Voorlijk (luff, along the mast) | **2650 mm** | 2610 | 2690 |
| Bovenlijk / gaffellijk (head, along the gaffel) | **2600 mm** | 2560 | 2640 |
| Onderlijk (foot, along the giek) | **2600 mm** | 2560 | 2640 |
| Achterlijk (leech, curved with roach) | **4740 mm** | 4700 | 4780 |
| Diagonal klauwhoek → schoothoek ("schoot op rak") | **3650 mm** | 3610 | 3690 |

Corners: nokhoek (peak), klauwhoek (throat), halshoek (tack), schoothoek (clew).
Cross-check: triangle (2,65 / 3,65 / 2,60) = 3,443 m² + triangle (3,65 / 2,60 / 4,74) = 4,707 m²
→ 8,150 m². ✔ (VB p.59)

Grootzeil details:
- **3 zeillatten in the achterlijk**, latverdeling (spacing of the bottom of the batten pockets
  along the leech, measured from the nokhoek) **1185 mm** nominal (min 1135, max 1235) — VB p.84.
- Batten-pocket lengths **600 / 650 / 650 mm**; on the drawing the pocket offsets from the leech are
  130 / 180 / 130 mm (VB p.60, p.84).
- Battens themselves: **essen, 35 mm wide, 1 × 580 mm and 2 × 630 mm** (VB p.57).
- Zeilringen (cringles for lacing): voorlijk spacing **500 mm** (450–550); bovenlijk and onderlijk
  spacing **200 mm** (180–220) except the first (VB p.84). Ring size 10 mm i.d. (VB p.57).
- Onderlijk: first ring 100/200 mm from the halshoek, 500 mm from the schoothoek (VB p.60).
- Voorlijk carries a **rijglijn** (nylon 5 mm × 4 m); 2 marllijnen nylon 3 mm × 6 m for gaffel and
  giek; 4 bindsels nylon 3 mm × 1 m for nokhoek, klauwhoek, halshoek and schoothoek (VB p.58).
- Schoothoek ring 16 mm i.d., sewn in (VB p.57).
- Luff/leech round ("innemingen"): voorlijk 28 / 20 / 11 mm; achterlijk 10 / 7 / 4 / 2 mm (VB p.58).

### 3.3 Fok (jib)

| Lijk | Nominal | Min | Max |
|---|---|---|---|
| Voorlijk (luff, hanked to the voorstag) | **4200 mm** | 4160 | 4240 |
| Achterlijk (leech) | **4070 mm** | 4030 | 4110 |
| Onderlijk (foot) | **2000 mm** | 1960 | 2040 |
| Luff wire, kous-to-kous (RVS 7×7 or 7×19, **Ø3 mm**) | **4300 mm** | 4260 | 4340 |
| Pijlhoogte van de ronding (curve on the short edge) | **~100 mm** | (form prints "100 / 80") | |

- Leuvers (hanks): brass, 40 mm, plastic-sleeved; spacing along the voorlijk **750 mm**
  (700–800), lowest leuver **400 mm** from the halshoek (350–450) → 6 hanks on a standard fok
  (Cay-Noya inventory says "leuver 6 à 8").
- Halshoek ring 12 mm i.d.; schoothoek ring 20 mm i.d., sewn in (VB p.57).
- Luff round ("innemingen") voorlijk 20 / 15 / 10 / 5 mm; achterlijk 14 / 10 / 5 / 2 mm (VB p.58).
- The onderlijk plus 40 cm of the achterlijk is tape-reinforced; voorlijk nastelbaar (VB p.58).
- Kettinkje voor de fok (tack chain): 250 mm, 5 mm link (VB p.56/p.84).
- Class rules v2.0: luff may be staaldraad **or dyneema**; fok may be flown **with or without
  leuvers**; a **fokkenboom is forbidden** unless a race notice says otherwise.

### 3.4 Sail cloth, seams, zeiltekens and zeilnummers

- Cloth: **polyesterdoek ≈ 220 g/m²**, well stabilised, coated as lightly as possible (VB p.57).
  Class rules v2.0: polyester fibre cloth, thickness free, **laminate sails forbidden**.
- Thread: UV-stable polyester ≈ 125 denier/3 (Barbour or equivalent) (VB p.57).
- Lijken (boltrope) grootzeil: **8 mm 3-strand white polyester**, long lay, 4,6 kg/100 m (VB p.57).
- Corner rings sewn into a minimum of **7 layers** of cloth (VB p.58).
- **Zeiltekens (VB p.58):** placed **starboard highest**;
  - **Lelie (fleur-de-lis): 38 × 40 cm**
  - **V: 38 × 40 × 5 cm** (width × height × stroke)
  - **Cijfers (sail numbers): 30 × 20 × 5 cm** (height × width × stroke)
  - black nylon cloth, glued and preferably also stitched.
- Class rules v2.0: sail numbers are issued by Scouting Nederland, sequential from "1"; the
  casconummer gives the absolute right to that number; **identical, clearly legible number on both
  sides of the grootzeil**.
- Delivered with the sail plan: 1 grootzeil, 1 fok, 3 zeillatten, 4 bindsels, 1 rijglijn,
  2 marllijnen, 1 roomy polyester bag (VB p.58).

### 3.5 Rondhout (spars)

| Part | Vlettenboek nominal | Meetrapport min–max (VB p.83) | Class rules v2.0 |
|---|---|---|---|
| **Mast**, grenen (pine), one piece | **5600 mm** | 5570 – 5630 | 5000 – 5800 mm; wood or a single thick-walled aluminium tube |
| Mast foot, square | **90 × 90 mm** | 88×88 – 90×90 | square foot allowed |
| Mast Ø at the hommerring | **68 mm** (VB p.47) | — | min Ø 80 mm, may taper to max 55 mm |
| Mast Ø at the top | **60 mm** (VB p.47) | — | (see conflict below) |
| Mastbout hole (Ø13) above the mast foot | **380 mm** | 380 | — |
| Foot → hart lummelbeslag (gooseneck) | **900 mm** | 900 | boom attachment ≥ **1150 mm above the cockpit floor** |
| Foot → onderkant hommerring | **4700 mm** | 4700 | rigging attachment ≤ 1000 mm below the top |
| **Giek** (boom), grenen, round | **2750 mm × Ø47 mm** | 2730 – 2770 | max **3000 mm** from the fitting |
| **Gaffel** (gaff), grenen, round | **2700 mm × Ø47 mm** | 2680 – 2720 | max **3000 mm** |
| Gaffelspruit (bridle), 7×19 wire | **L = 1900 mm**, attached **600 mm from each end**, standing **130 mm** off the gaff | wijdte 130 | — |
| Klauwspruit, 7×19 wire, running under the gaffel | **L = 700 mm** (VB p.50), klauwspruit length 300 mm (VB p.83) | 300 | — |
| Peerkous at the gaff peak, above the spar | 300 mm | — | — |
| Helmstok, hickory/essen | 950 mm, foot 150 mm long, 30 mm thick, 75 mm high | 950 | free shape, must not project past the achterdek |
| Vlaggestok, essen, curved | 1000 mm × Ø25 mm | — | — |
| Mik (boom crutch), verzinkt | 1210 mm | 1210 | — |
| Masttopring | i.d. 52 / body 56 (2 mm wall) / o.d. 60 mm, 4 lugs 8 mm thick, eyes Ø12 in Ø27 bosses | — | — |
| Mastringen (supplied) | 1 × i.d. 67 mm with 3 eyes; 1 × i.d. 50 mm with 4 eyes; giekring i.d. 47 mm with 1 eye + wervel | — | — |

> **Conflicts / cautions on the spars**
> 1. **Mast diameter.** VB p.47 draws the mast as Ø60 at the top, Ø68 at the hommerring, 90 mm square
>    at the foot (octagonal in between). KV v2.0 states "minimale diameter van 80 mm, welke verjongd
>    mag worden naar maximaal 55 mm" — the 80 mm minimum does not match the drawn 68 mm at the
>    hommerring. For a model of a *standard* vlet, follow the Vlettenboek drawing.
> 2. **Gooseneck height.** VB gives 900 mm above the *mast foot*; KV v2.0 gives ≥1150 mm above the
>    *cockpit floor*. These reference different datums. Derived (not directly sourced): VB p.81 puts
>    the mastbout 736–754 mm above the vlak and VB p.47 puts it 380 mm above the mast foot, so the
>    mast foot sits ≈365 mm above the vlak and the gooseneck ≈1265 mm above the vlak — which is
>    consistent with the 1150 mm rule. Treat the ≈365 mm as my arithmetic, not a published figure.
> 3. **Supplier lengths.** scoutingvlet.nl sells the Scouting-Nederland-model mast as
>    "Mast Oregon 5600 mm", described in the product text as 559,5 cm with a 9 × 9 cm foot and
>    90 cm from the top to the crown of the hommerring — i.e. the same mast, Oregon pine instead of
>    grenen. Giek grenen 2750 mm matches the VB exactly.
> 4. **Do not use the "mast 7,80 m / giek 3,70 m / gaffel 3,10 m / boegspriet 2,25 m" set** that a
>    web search surfaces — that belongs to a different (larger) boat, not the lelievlet.

### 3.6 Staand want (standing rigging)

- Composition: **1 voorstag + 2 zijstagen (wanten)**, no spreaders, no backstay (KV v2.0).
- Voorstag: Ø4 mm 7×7 galvanised wire. **Length conflict:**
  - VB p.56 "Specificatie tuigage": **4,88 m**
  - VB p.84 "Meetrapport tuigage": **4,99 m**
  Both are official pages of the same book. Flagged — measure, or model ≈4,9 m.
- Wanten: **2 × 4,20 m, Ø4 mm 7×7** galvanised (VB p.56 and p.84 agree).
- Tensioning: 2 × langschalmige ketting 5 mm × 350 mm + shackle per zijstag; the voorstag gets
  1 spanner Ø10 mm metric thread with borging and **klephaak** (quick-release hook, drawn VB p.61)
  — this is what makes the mast strijkbaar.
- Class rules v2.0: wire **or dyneema**; zijstagen may be tensioned with spanners, chains or
  lashings of adequate breaking strength; the **voorstag lands on the point of the voordek**.
- Attachment on the mast: hommerring **4700 mm above the foot / 900 mm below the top**; the voorstag
  attachment must not be lower than the fokkenval attachment nor lower than the zijstagen, and the
  rigging attachment must be within 1000 mm of the top (KV v2.0).
- Attachment on the hull:
  - **Hanekam** (stemhead fitting) — flat bar **30 × 5 mm, 200 mm long, three Ø12 holes**
    (VB p.43); it carries the voorstag and the fok tack. Must be on the ship's centreline (VB p.82).
  - **Wantputtingen** — 2 ×, triangular plate **40 × 5 × 70 mm** with a Ø9 hole, R=16 (VB p.45),
    welded slightly angled onto the dolboord, in line with the want (VB p.21).
  - Wantputting position: **247–279 mm forward of "punt 0"** (punt 0 = aft face of the mastkoker /
    forward face of the zwaardkast), i.e. ≈263 mm; athwartships spacing hart-to-hart
    **1781–1805 mm** (VB p.81).

### 3.7 Lopend want (running rigging)

Line stock supplied per boat (VB p.56 / p.84):
- 72 m polypropylene Ø10 mm (brown) — halyards etc.
- 20 m polypropylene Ø14 mm
- 20 m polyester sheet rope Ø10 mm (white)

Blocks (all tufnol, Ø43 mm sheave): **4 × single, 1 × single with hondsvot (becket), 2 × double**,
plus 12 × ¼" H-shackles, 2 × ¼" swivel H-shackles, 9 × 5/16" H-shackles, 6 × 1¼" and 3 × 2" thimbles.

- **Klauwval** (throat halyard) and **piekeval** (peak halyard): either both in one double block, or
  each on its own single block (Cay-Noya inventory). The gaffel hangs from the piekeval via the
  **gaffeldraad**/gaffelspruit; the klauwval lifts the klauw.
- **Fokkeval**: single block.
- **Dirk / kraanlijn**: optional, single block (Cay-Noya inventory; also item 11 in the
  Benamingen drawing).
- **Grootschoot**: polyester Ø10 mm, rove through **2 blocks + shackles** and a **schootring Ø90 mm**
  (drawn VB p.62; the Cay-Noya list notes it has **3 holes so the boat can be sailed reefed**).
  The lower/ground block lands on the **grootschootoog** — a Ø14 mm bar loop 165 mm long,
  75 mm high, 40 mm clear (VB p.44), located **1876–1908 mm aft of punt 0** (VB p.81).
  Class rules v2.0: the ground block must be at the height of the aftmost cockpit frame; the
  grootschoot may be **no more than 4:1** and must have **no cleat or winch** (unless a race notice
  allows it). There is **no overloop/traveller** on a standard lelievlet.
- **Fokkeschoot**: single line, led through **lei-ogen** on the boeisel — Ø8 mm bar loops
  85 mm long, 50 mm wide, 37 mm high, **6 of them** (also used for fenders; the Cay-Noya list says
  6 à 8) (VB p.45). Longitudinal positions relative to punt 0 (VB p.81):
  **(1) 266–298, (2) 726–758, (3) 1126–1158, (4) 1926–1958 mm** (aft-positive).
  Class rules v2.0: the fokkeschoot **may have a turning block but may not be purchased**, and may
  have **no cleat or winch**.
- **Belaying points**: **4 kikkers (cleats) on the mastkoker**, Ø12 mm bar × 190 mm, 160 long over
  all, 70 between the feet, R=10 (VB p.44, p.36); plus **2 kikkers on the dolboord of the voordek**,
  about **250 mm from the plecht** (VB p.82). There is no nagelbank.
- **Neerhouder / halstalie / kunningham:** none in the standard rig. The class rules state that the
  onderlijk and the bovenlijk of the grootzeil **may not be adjustable while sailing** unless a race
  notice says otherwise.
- **Reefing:** the standard Vlettenboek sail plan has **no reef points/smeerreep**; reefing is done
  by lowering the gaffel and using the second/third hole of the 90 mm schootring (Cay-Noya:
  "schootring met 3 gaten voor varen met rif"). Sailmakers (Van de Gruiter) sell lelievlet
  grootzeilen "met rifsysteem" as a non-standard option. `scoutingvlet_zeilboekje_2.pdf` has a
  "Reefsystemen" theory item.
- Other fittings: wervel (boom swivel) on the giek; lummelbeslag with bolt and mastring (shape free
  per the class rules); mastbout **M12 × 120** with nyloc nut and mastgrendel **M12 × 120** with wing
  nut (VB p.82); verklikker (wind indicator) with mount; Nederlandse vlag 40 × 60 cm; meerpen 50 cm.

### 3.8 Mast position / mastkoker

- **Mastkoker**: welded 4 mm steel tube, internal **92–96 mm** square (VB p.36, p.82),
  **950 mm** tall with the 650 mm section detailed on VB p.36; welded all round; carries the
  4 kikkers, the mastbout hole and the grendelbout hole.
- **Punt 0** for all longitudinal measurements = **aft face of the mastkoker = forward face of the
  zwaardkast** (VB p.81). So the mast sits immediately in front of the centreboard case.
- Punt 0 → binnenkant voorsteven: **≈1950–1984 mm** (the form prints "950" for the minimum, an
  obvious typo for 1950) (VB p.81).
- Punt 0 → voorste luchtkastschot 437–461 mm; → voorkant voorste doftsteun 366–368 mm;
  → voorkant achterste doftsteun 1326–1358 mm; → achterste luchtkastschot 2321–2363 mm (VB p.81).
- Hoogte mastbout uit het vlak: **736–754 mm** (VB p.81).
- **The mast must be strijkbaar (lowerable)** and must have a fall-arrest ("valbeveiliging") at the
  mast foot that catches the mast if it breaks (KV v2.0). In practice the mast pivots on the
  mastbout, the grendelbout is withdrawn and the voorstag klephaak is released.

### 3.9 Hull figures relevant to the rig

| Item | Value | Source |
|---|---|---|
| L.o.a. | 5,60 m (± 5 cm); meetrapport 5586–5628 mm excl. berghout | VB p.21, p.81 |
| Beam, internally aft of the mastkoker | 1,80 m (± 5 cm) | VB p.21 |
| Casco length (class rules) | 5600 ± 50 mm | KV v2.0 |
| Casco width (class rules) | 1800 ± 100 mm | KV v2.0 |
| Dolboord | 1" gaspijp, 33,7 mm o.d. | VB p.81 |

---

## 4. What is still missing

- The **exact mast rake / stay geometry as built** (there is no drawing showing the voorstag and
  wanten lengths against hull stations; you have wire lengths and attachment points, but the
  voorstag length itself is quoted inconsistently as 4,88 m vs 4,99 m).
- **Klassenvoorschriften Lelievlet v1.3** (2024) — superseded, no live copy found.
- The **Henk & Janneke Bos lelievlet archive** on xs4all (incl. "In gebruik nemen van de Lelievlet"
  and "De lelievlet 8e druk") — site dead, Internet Archive was offline during this run.
- Any **DXF/DWG of the rig**. The only official CAD file (Scouting Nederland 3D model) is hull-only.
- **Sailmakers' own published dimensions** — Miedema Sails publishes none; Van de Gruiter's
  lelievlet sail catalogue is behind a bot-check and could not be read.
