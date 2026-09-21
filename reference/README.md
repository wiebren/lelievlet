# Lelievlet reference library

Collected 2026-09-19 for an accurate interactive 3D model of the lelievlet (instruction lessons,
part-name quizzes, group-colour customisation). Each subfolder has its own index with sources,
URLs and trust level. Duplicate downloads were replaced by symlinks to one canonical copy.

Only our own work is in the repository: these notes and indexes, the transcribed tables (CSV,
JSON) and the extraction script. The downloaded documents, drawings, photographs and the DWG with
the bodies extracted from it are not; the indexes give the URL of each, to fetch it again.

| Folder | Index | What |
|---|---|---|
| `cad/` | `README.md` | **Official Scouting Nederland 3D CAD model** (DWG, 2012) + all 222 ACIS bodies extracted as complete `.sab` files, dimension index, preview |
| `hull/` | `SOURCES.md` | Vlettenboek (all 86 pages rendered), transcribed offset tables (CSV), Boekel 1:10 vector plate developments, 1977 handboek, class rules, NTR, historical material |
| `rig/` | `SOURCES.md` | Sail plan, spar and fitting drawings (25 Vlettenboek pages at 300 dpi), rig inventory, class-rule rig sections, key rig dimensions with tolerances |
| `parts/` | `SOURCES.md` | Labelled part diagrams (81 / 84 / 88 / 102-part variants), blank quiz drawing, ~200-term Dutch glossary with synonyms, CWO/insigne requirements, instruction booklets (sailing, rowing, wrikken), colour/numbering conventions |
| `book/` | `NOTES.md` | The Katwijkse Zeeverkenners CWO zeil-instructieboek: 84-part list as JSON, vector parts diagram (SVG), lesson/quiz page index |

## Source hierarchy — who wins on a conflict

1. **Klassenvoorschriften Nationale Lelievlet Klasse v2.0** (1 May 2025) — what is *allowed*.
   `hull/klassenvoorschriften_lelievlet_v2_lszw.pdf`
2. **Vademecum voor het waterwerk deel 8 "De Lelievlet" / het Vlettenboek** (8e druk 1988) — the
   nominal design with tolerances; the class rules name it as the authority for hull, sail and
   spar dimensions. `hull/lszw_vademecum_lelievlet.pdf`
   Key pages: 16–17 names · 21 technical description · 22 spantenlijst · 23–45 casco details ·
   46–52 spars and fittings · 56–62 rig and **zeilplan (60)** · 81–84 meetrapport (min/max).
3. **Official 3D DWG** — the actual geometry to build the model from. Hull agrees with the
   spantenlijst to within ≈ 5 mm (chine half-breadth 596 vs 594, berghout 918 vs 913,
   zwaardkast 946 × 500 vs 950 × 497–503, mast foot at 365 in both). Its **spars deviate** from
   the Vlettenboek nominals (mast 5300 vs 5600, giek 2822 vs 2750, gaffel ≈ 2810 vs 2700) but
   are within the class rules.
4. Group-made instruction booklets — for **names and lesson content only**, never dimensions.

## Headline dimensions

| | |
|---|---|
| LOA casco | 5600 mm ± 50 (DWG plating: 5599) |
| Beam | 1800 mm nominal; DWG 1836 over plating, 1855 over berghout. Tolerance ±100 (class rules) vs ±50 (Vlettenboek) |
| Holte | 900–950 mm |
| Plating | kim / boeisel / dekken / luchtkasten 3 mm · vlak / spiegel / zwaardkast / mastkoker 4 mm · zwaard / scheg / roer 5,5 mm (current yards use 5) |
| Berghout / dolboord | Ø20 round bar / 1" gaspijp (33,7 mm) |
| Sail area | 12,15 m² = grootzeil 8,15 + fok 4,00 (several booklets wrongly call 12,15 the grootzeil) |
| Grootzeil | voorlijk 2650 · bovenlijk 2600 · onderlijk 2600 · achterlijk 4740 · diagonal 3650 · 3 battens |
| Fok | voorlijk 4200 · achterlijk 4070 · onderlijk 2000 · 6 leuvers |
| Mast / giek / gaffel | 5600 / 2750 / 2700 (Vlettenboek) — class rules: mast 5000–5800, giek and gaffel ≤ 3000 |
| Zeilteken | lelie 38 × 40 cm over a V; cijfers 30 × 20 cm; both sides of the grootzeil, starboard highest |
| Casco weight | ≈ 650 kg |

Known internal conflict in the Vlettenboek: voorstag 4,88 m (p56) vs 4,99 m (p84).

## Naming

The 81-name list on Vlettenboek p16–17 is the original that all later lists derive from
(Katwijk 84, Willibrordus/De Bevers 88, onlinezeilschool 102). Synonyms the quiz must accept are
listed at the end of `parts/SOURCES.md` (tophoek/nokhoek, piekeval/piekenval, gaffeldraad/spruit,
dirk/kraanlijn, buikdenning/vlonder, want/zijstag, schootring/hoefijzer, …). A lelievlet has
**kikkers**, not bolders; the drain is a **spuigat**, the bailer a **hoosvat**.

## Customisation

There is no national colour scheme: "de kleuren die de vlet hebben zijn de kleuren van de groep".
Each vlet has a name, a number and usually a ploeg **dektekening** on the deck. Zeilnummers are
issued by Scouting Nederland (team Lelieschepen, waterscouting@scouting.nl) and tied to the
casconummer. Placement of boat name and group emblem is tradition, not regulated.

## Still missing

- The bodies in the DWG are unnamed; mapping 222 bodies → part names is manual work, and running
  rigging (vallen, schoten, marllijn, rijglijn) is not modelled in it.
- No lines plan exists (the design was derived by measuring ≈ 100 Beenhakker hulls in 1970); the
  spantenlijst + DWG replace it.
- Good out-of-water photo sets of a bare hull; two sale listings are noted in `hull/SOURCES.md`.
- Van de Gruiter sail catalogue (needs a real browser), Henk Bos archive pages not yet recovered.

## Tooling notes

`brew install libredwg poppler` were added on this machine. **Never use `dwg2dxf` on the DWG**:
LibreDWG 0.14 truncates every ACIS body on the way to DXF while still appending a valid-looking
end marker. Use `dwgread -O JSON` + `cad/extract_sab.py` (see `cad/README.md`).
