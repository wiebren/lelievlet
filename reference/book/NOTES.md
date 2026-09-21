# CWO Zeil Instructieboek – Katwijkse Zeeverkenners (2e druk, 2008)

Source: https://katwijksezeeverkenners.nl/wp-content/uploads/2015/07/cwo_zeil_instructieboek_katwijkse_zeeverkenners.pdf
Local: `../cwo_zeil_instructieboek_katwijkse_zeeverkenners.pdf` (132 PDF pages; printed page = PDF page − 6)

This is the project's primary reference for **part names** and lesson content.
It is a group-made learning booklet, not an official drawing: use it for naming and
arrangement, not for dimensions.

## Extracted files

| File | What |
|---|---|
| `h2_technisch_inzicht_p22-28.pdf` | Chapter 2 "Technisch inzicht" as a standalone PDF |
| `p23_onderdelen_lelievlet.svg` | The numbered parts diagram as **vector** SVG (607 paths): side profile with rig, longitudinal section, plan view |
| `p23_onderdelen_lelievlet_300dpi.png` | Same page rasterised at 300 dpi |
| `onderdelen_lelievlet.json` | The 84 numbered part names from PDF p22, keyed to the diagram numbers |

## Pages that matter for the 3D model

| PDF page | Printed | Content | Use |
|---|---|---|---|
| 22 | 16 | §2.1 list of 84 parts; CWO levels: Kielboot I = 20 parts, II = 40, III = all (which parts is group-specific) | Quiz part list + difficulty tiers |
| 23 | 17 | Numbered diagram, 3 views. Facts: L 5,60 m, B 1,80 m, "oppervlakte grootzeil 12,15 m²" — **error in the book**: 12,15 m² is the total (grootzeil 8,15 + fok 4,00, Vlettenboek p.59) | Proportions, arrangement of doften/zwaardkast/luchtkasten/ogen |
| 24–25 | 18–19 | Explanations: schoten, vallen, blokken, dodemanseind, marllijn, wervel, pettenlijntje, leuvers, buikdenning (=vlonders), lummelbeslag, riemen (roeiriemen + 1 wrikriem), mangat, dollen (kettinkje, "dollen uit"), harpje (mannetje/vrouwtje), hanepootloper, staand/lopend want | Tooltip / lesson text per part |
| 26–27 | 20–21 | Sail types and rig types (lelievlet = gaffelgetuigde sloep) | Context lesson |
| 28 | 22 | Bomen (punting) with vaarboom/wrikriem at ~45° | Possible animation |
| 70–71 | 64–65 | §5.2 Hijsen & strijken (stilliggend / varend) | Hoisting animation: klauwval + piekenval, dirk |
| 72 | 66 | §5.3.1 Rolrif: giek naar achteren trekken, om lummelbout draaien, hoefijzer (schootring) verstellen | Reefing animation; boom must be modelled as rotatable, schootring as a sliding horseshoe |
| 112–113 | 106–107 | Oefenopgaven "Technisch inzicht" (multiple choice), answers on 130 | Ready-made quiz questions |

## Scale check of the p23 diagram

Plan view bounding box in the PDF is 402.2 × 130.4 pt → L/B = 3.09, versus 5.60 / 1.80 = 3.11
stated on the same page. The illustration is therefore drawn to proportion, at ≈ 71.8 pt per metre
(side profile hull: 402 pt long as well). It is usable as a tracing underlay for profile, section
and plan, but details such as mast thickness (10.9 pt ≈ 15 cm) are clearly exaggerated for
legibility. Treat as indicative; official drawings win on any conflict.

## Rig facts stated or shown in the book

- Gaff sloop: grootzeil 8,15 m² + fok 4,00 m² = 12,15 m² (the book mislabels the total as the grootzeil); mast in a **mastkoker** with **mastbout** and **grendelbout** (lowerable mast).
- Staand want: voorstag (with voorstagspanner), BB want, SB want (wantketting of -spanner). No backstay.
- Grootzeil halyards: **klauwval** (throat) and **piekenval** (peak), the latter to a **gaffeldraad** (wire span on the gaff) via the **hanepootloper** (shackle).
- Grootzeil laced to gaff and giek with a **marllijn**; luff laced to the mast with a **rijglijn** (diagram also labels a mastring).
- Sail has 3 zeillatten (battens) in pockets; class insignia (lelie over V) + sail number on the main.
- Boom end: **wervel** (rotating plate, takes the dirk/kraanlijn and stops the schootring sliding forward), **pettenlijntje** between schootring and wervel.
- Fok hanked to the voorstag with **leuvers**; fokkenschoot through **leiogen** on the hull.
- Hull/interior items shown in plan + section: voordek over a forward luchtkast with mangat, achterdek over aft luchtkast, 2 doften, zwaardkast on centreline between them, buikdenning, spanten, hijsogen, grootschootoog, landvastogen, wrikgat in the spiegel top, sleepoog on the bow, scheg aft, berghout, boeisel, dolboord, dolpotten.
