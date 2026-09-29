# Scheepvaartverkeerstekens (BPR bijlage 7)

Collected 2026-09-28 for the BPR teaching feature: build the waterway traffic signs as 3D sign
assets and quiz on them. English notes, Dutch terms verbatim. Every code and name below was read in
the official text of **BPR bijlage 7, version in force from 17-06-2026** (still "t/m heden" on
2026-09-28). The machine-readable counterpart is `tekens.json` (132 entries: all A–E signs, the
F plates, the G light/board combinations at kunstwerken, and H.3).

Trust levels: **officieel** = wetten.overheid.nl text and drawings; **richtlijn** = Rijkswaterstaat
Richtlijnen Scheepvaarttekens 2023 (the official implementation guideline, not law); **secundair** =
CWO handbooks and group booklets; **afgeleid** = my own measurement or reasoning, marked as such.

## Sources

| Tag | Document | URL / local file | Retrieved | Trust |
|---|---|---|---|---|
| [B7] | **Binnenvaartpolitiereglement, BWBR0003628, bijlage 7 "Verkeerstekens"**, geldend van 17-06-2026 t/m heden. The page notes *"Wijziging(en) zonder datum inwerkingtreding aanwezig"*: check again before release. Full regulation (downloaded by another agent): `BPR_BWBR0003628_2026-06-17.html`. Bijlage 7 cut out: `tekens/bijlage7_2026-06-17.html`, as text `tekens/bijlage7.txt` | <https://wetten.overheid.nl/BWBR0003628/2026-06-17> | 2026-09-28 | officieel |
| [B7-img] | The 186 drawings of bijlage 7 (scanned colour prints, PNG, ~250–600 px). `tekens/bpr_img/<naam>.png`; code → file map in `bpr_afbeelding` of `tekens.json` | `https://wetten.overheid.nl/afbeelding?toestandid=BWBR0003628/2026-06-17_0&naam=<naam>.png` | 2026-09-28 | officieel (drawings) |
| [BPR-art] | BPR art. 6.25 (vaste bruggen), 6.26 (beweegbare bruggen), 6.27 (stuwen), 6.28a (sluizen) — the light meanings | same file | 2026-09-28 | officieel |
| [RST] | Rijkswaterstaat, **Richtlijnen Scheepvaarttekens 2023** (91 p.; ch. 2 formats and colours, ch. 3 meaning and use of every sign, ch. 4 signal lights at kunstwerken). `richtlijnen_scheepvaarttekens_2023.pdf` (downloaded by another agent; text `tekens/rst2023.txt`) | <https://open.rijkswaterstaat.nl/publish/pages/193547/richtlijnen_scheepvaarttekens_2023_final_v5_clean_voorwoord_ondertekend.pdf> | 2026-09-28 | richtlijn |
| [Commons] | Wikimedia Commons SVG sets, licence read per file from the Commons API (`extmetadata.LicenseShortName`). Downloads in `tekens/commons/` (177 files) | see per sign below | 2026-09-28 | per file |
| [CWO-KB22] | CWO Handboek Kielboot 2022, Kielboot III item "Reglementen" (identical Bijlage 7 list in Handboek Opleidingen 2005, `../parts/caynoya_officiele_CWO_eisen_kielboot_1_2_3.pdf`). Local: `cwo/cwo_HandboekKielboot1-3-2022.pdf` (another agent; see `VOORRANG.md` "CWO scope") | web.archive.org of cwo.nl | 2026-09-28 | secundair (official but archived) |
| [CWO-R15] | CWO Handboek 3.2 Roeien (2015), Roeien III. `cwo/cwo_Handboek3.2Roeien.pdf` | web.archive.org of cwo.nl | 2026-09-28 | secundair |
| [KAT] | Katwijkse Zeeverkenners CWO zeil-instructieboek (2008), §4.4 Verkeerstekens and §4.5 Bruggen & sluizen (p. 49–59). `../cwo_zeil_instructieboek_katwijkse_zeeverkenners.pdf` | see `../book/NOTES.md` | — | secundair, has errors (below) |

cwo.nl itself (`/leren-varen/kielboot`) lists no sign requirements; the current requirements sit
behind the instructor login on watersportdiploma.nl (see `VOORRANG.md`).

## Local files in `tekens/` (all git-ignored)

- `bpr_img/` — all 186 bijlage-7 drawings, named by their wetten.nl image name.
- `bijlage7_2026-06-17.html`, `bijlage7.txt` — the bijlage cut from the regulation.
- `commons/` — the Commons SVGs (Dutch, German BinSchStrO, "Notice …", Polish sets).
- `rst2023.txt` — pdftotext of the RST.

## What bijlage 7 contains

A verbodstekens · B gebodstekens · C beperkingstekens · D aanbevelingstekens · E aanwijzingstekens ·
F bijkomende tekens (F.1 afstand, F.2 richting, F.3 aanvullend, F.4 categorie) · G tekens aan
kunstwerken (G.1 vaste bruggen, G.2 beweegbare bruggen, G.3 stuwen, G.4 sluizen, G.5
hoogteaanduidingen) · H overige (H.1 kilometrering, H.2 bewegwijzering, H.3 spui- en inlaattekens).
Every group carries the note *"Deze tekens kunnen worden aangevuld of verduidelijkt met bijkomende
tekens, vermeld onder F"*. The last remarks of the bijlage: *"Des daags kunnen hetzij de dagtekens,
hetzij de lichten, hetzij beide worden gebruikt"* and *"De vlaggen en wimpels kunnen worden
vervangen door borden van dezelfde vorm."*

The bijlage gives **pictures only, no dimensions or colour codes**. The geometry below is measured
from the drawings [B7-img] (afgeleid) and from [RST] ch. 2.

## Geometry and colour conventions

### Shapes

| Family | Shape | Build it as |
|---|---|---|
| A (most) | square board | white field, **red border ≈ 1/10 of the side**, **red diagonal** from the top-left corner to the bottom-right corner, **as wide as the border**, black symbol centred. Measured on [B7-img] A.5: border 23–24 px on a 238 px sign (0.099); the diagonal is 29–31 px measured horizontally = ~21 px perpendicular. The Dutch Commons SVGs use exactly this: 600 × 600 viewBox, `rect 540×540 stroke 60`, diagonal `M30,30 L570,570 stroke 60`, symbol drawn **after** (on top of) the diagonal. |
| A.2, A.3, A.4, A.4.1 | upright rectangle 2 : 3 | same border and diagonal, corner to corner |
| A.1 | landscape rectangle ≈ 3 : 2 (drawing 380 × 256) | three horizontal bands red / white / red, red ≈ 37 % each, white ≈ 26 % (measured), no separate border |
| A.1a | disc | red disc, white horizontal bar |
| A.10, D.2, D.1 | square turned 45° (diamond) | A.10: half red/half white, **red half outward**; D.2: half green/half white, **green half toward the channel** (measured on [B7-img] 65438 and 65514); D.1: yellow with thin black outline |
| B, C | square (B.1a landscape 3 : 2; B.1b, B.2–B.4 upright 2 : 3) | white field, red border ≈ 1/10 of the short side, black symbol, **no diagonal** |
| D.3 | rectangle 3 : 2 (D.3b 2 : 3) | blue field, white arrow |
| E | square (E.3, E.4, E.5.2 landscape; E.11 has a rectangular and a square model) | blue field, thin **white keyline** just inside the edge (≈ 2 % of the side, measured on E.5: 2–3 px blue edge, 4–5 px white, then blue), white symbol |
| E.1 | landscape rectangle 3 : 2 | three **vertical** bands green / white / green, ≈ 39 / 22 / 39 % |
| E.11 | upright rectangle or square | blue with a white diagonal stripe top-left → bottom-right |
| lights | round lamps in a black housing with white rim | the drawings show the lamps inside a rectangle; flashing = disc with black wedges ("windmill"); isophase = disc with two opposite black quadrants |
| F plates | above (F.1), beside (F.2a) or below (F.3, F.4) the main sign | F.1 as wide as the main sign, height ≈ 1/3 of its width; F.3 height ≤ 1/3 of its length; F.2a pointed, same height as the main sign [RST §3.6] |

The German BinSchStrO SVGs on Commons draw a slightly heavier border (≈ 1/8 of the side:
63.1 outer, 47.3 inner on B.5) with rounded corners and a thin white outer rim; the Dutch set
(1/10, square corners) is closer to the BPR drawings.

### Standard board sizes [RST §2.3.3, tabel 1 and 2]

| Waterspiegelbreedte | Bordtype | Square (cm) | Rectangle (cm) | A.1, A.10, D.1, D.2, E.1 (cm) | Min. height of the board's lower edge above mean water (cm) |
|---|---|---|---|---|---|
| < 20 m | 1 | 60 × 60 | 60 × 90 | 48 × 48 / 48 × 72 | 200 |
| 20–60 m | 2 | 100 × 100 | 100 × 150 | 80 × 80 / 80 × 120 | 300 |
| 60–170 m | 3 | 140 × 140 | 140 × 210 | 120 × 120 / 120 × 180 | 400 |
| > 170 m | 4 | 200 × 200 | 200 × 300 | 160 × 160 / 160 × 240 | 500 |

Bordtype 0 exists for harbours and jetties (no size given). Signs are either parallel to the
waterway axis (mainly prohibitions and permissions valid for "de zijde van de vaarweg waar het bord
is geplaatst": A.5–A.7, E.5–E.7) or square to it (most others). At most 4 signs per panel,
separate signs ≥ 100 m apart. Letters and figures in the **RWS Ee-alfabet** (readable at
6,2 m per cm letter height). A lelievlet's canals are mostly type 1–2: **60 cm or 100 cm boards**.

### Signal lights at kunstwerken [RST §4.1, §4.4.5, tabel 5]

RWS uses lamp diameters of **21 cm and 30 cm**. Freestanding lights need a **black background
shield with a white rim** (5 cm rim for 21 cm lamps, 8 cm for 30 cm) and a sun hood:

| Lamps | Ø (cm) | Centre spacing (cm) | Shield incl. rim (cm) |
|---|---|---|---|
| 1 | 21 / 30 | — | 60 / 90 |
| 2 | 21 / 30 | 28 / 36 | 60 × 88 / 90 × 125 |
| 3 | 21 / 30 | 28 / 36 | 60 × 116 / 90 × 161 |

"In Nederland zijn de lichten doorgaans verticaal aangebracht in de volgorde rood-groen-rood" —
i.e. a three-lamp head: red on top, green in the middle, red at the bottom (one red = top lamp;
two red = top and bottom; red over green = top + middle).

### Colours

Neither the BPR nor the RST gives colour codes: the RST requires the colours to meet **NEN 3381**
(the Dutch traffic-sign colour standard) and, for signal lights, the chromaticity areas of CEVNI
annex 4. So any hex value is a rendering choice. Values seen:

| Colour | Dutch Commons set | German BinSchStrO set | Sampled from the BPR scans | Commonly used RAL (not stated in BPR/RST) |
|---|---|---|---|---|
| rood | `#c1121c` | `#cc0000` | `#f74331` (printed, too light) | RAL 3020 verkeersrood (`#c1121c` is its usual sRGB value) |
| wit | `#f7fbf5` | `#ffffff` | — | RAL 9016 verkeerswit |
| zwart | `#2a2d2f` | `#000000` | — | RAL 9017 verkeerszwart |
| blauw | — | `#003499` | `#033ece` | RAL 5017 verkeersblauw |
| groen | — | `#009933` | `#099f63` | RAL 6024 verkeersgroen |
| geel | — | `#ffff00` | `#fded01` | RAL 1023 verkeersgeel |

The "Notice …" CC0 set uses a light sky blue for E signs, not a traffic blue: recolour before use.

## The signs

★ = relevant for a lelievlet or named in a CWO list (see next section). Commons column: the
preferred free SVG for that code (PD = public domain, CC0, BY-SA = attribution + share-alike);
"—" = no suitable free vector found. The full record (varianten, kleuren, artikelen, CEVNI
differences, RST remarks, BPR image names) is in `tekens.json`.

### A — Verbodstekens (prohibitions)

| Code | Naam (BPR, verbatim) | Vorm · symbool | ★ | Commons (licence) |
|---|---|---|---|---|
| `A.1` | In-, uit-, of doorvaren verboden (algemeen teken) | landscape rectangle 3:2 (board); or light(s); or flag(s) · Board: three horizontal bands red / white / red, no border (thin red outline in the drawing). Light version: one red fixed light, or two red fixed lights one above the other. Flag version: a red flag, or two red flags one above the other. | ★ | [Nederlands scheepvaartteken A.1.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.1.svg) (PD) |
| `A.1a` | Buiten gebruik gestelde gedeelten van de vaarweg; vaarverbod, niet geldend voor een klein schip zonder motor | round disc · Red disc with a white horizontal bar across the middle (like the road "no entry" sign); the bar is about 1/5 of the diameter high and runs to ~80 % of the diameter. | ★ | [Nederlands scheepvaartteken A.1a.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.1a.svg) (PD) |
| `A.2` | Voorbijlopen verboden | upright rectangle 2:3 · Two black arrows pointing up, staggered: one lower-left, one upper-right, parallel and vertical. | ★ | [Nederlands scheepvaartteken A.2.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.2.svg) (PD) |
| `A.3` | Voorbijlopen verboden voor samenstellen onderling Het verbod geldt niet, wanneer tenminste één van beide betrokken samenstellen een duwstel is … | upright rectangle 2:3 · As A.2 but each arrow has two stacked arrowheads (= a convoy). |  | [Nederlands scheepvaartteken A.3.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.3.svg) (PD) |
| `A.4` | Ontmoeten en voorbijlopen verboden | upright rectangle 2:3 · Two vertical black arrows side by side: left one points down, right one points up. | ★ | [Nederlands scheepvaartteken A.4.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.4.svg) (PD) |
| `A.4.1` | Ontmoeten en voorbijlopen van samenstellen onderling verboden. Dit verbod geldt niet wanneer tenminste één van beide betrokken samenstellen een … | upright rectangle 2:3 · As A.4 (down arrow left, up arrow right) but each arrow has two stacked arrowheads. |  | [Nederlands scheepvaartteken A.4.1.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.4.1.svg) (PD) |
| `A.5` | Verboden ligplaats te nemen (ankeren en meren) aan de zijde van de vaarweg waar het bord is geplaatst | square · Black capital letter P, centred, upright. | ★ | [Nederlands scheepvaartteken A.5.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.5.svg) (PD) |
| `A.5.1` | Verboden ligplaats te nemen (ankeren en meren) binnen de in meters aangegeven breedte te rekenen vanaf het bord | square · Black number (e.g. 20) = metres, centred. | ★ | [Nederlands scheepvaartteken A.5.1.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.5.1.svg) (PD) |
| `A.6` | Verboden te ankeren en ankers, kabels en kettingen te laten slepen aan de zijde van de vaarweg waar het bord is geplaatst | square · Black anchor drawn UPSIDE DOWN: curved arms (flukes) at the top, shank down, stock bar and ring at the bottom. | ★ | [Nederlands scheepvaartteken A.6.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.6.svg) (PD) |
| `A.7` | Verboden te meren aan de zijde van de vaarweg waar het bord is geplaatst | square · Black bolder (mooring bollard) seen from the side, centred. | ★ | [Nederlands scheepvaartteken A.7.svg](https://commons.wikimedia.org/wiki/File:Nederlands_scheepvaartteken_A.7.svg) (PD) |
| `A.8` | Verboden te keren | square · Black thick arrow bent into an almost complete circle (like a "C" open at the bottom-left), arrowhead at upper right pointing right/clockwise. |  | [A.8 Wendeverbot.svg](https://commons.wikimedia.org/wiki/File:A.8_Wendeverbot.svg) (PD) |
| `A.9` | Verboden hinderlijke waterbeweging te veroorzaken | square · Two black horizontal wavy lines one above the other, centred. | ★ | [A.9 Vermeidung von Wellenschlag oder Sogwirkung.svg](https://commons.wikimedia.org/wiki/File:A.9_Vermeidung_von_Wellenschlag_oder_Sogwirkung.svg) (PD) |
| `A.10` | Verboden buiten de aangegeven begrenzing te varen | always a pair of square boards set on a point (diamonds) · Each diamond split along its vertical diagonal: the RED half faces outward (away from the channel), the WHITE half faces the channel. Dashed arrow in the drawing = the permitted width. | ★ | [A.10 Verbot außerhalb der angezeigten Begrenzung zu fahren.svg](https://commons.wikimedia.org/wiki/File:A.10_Verbot_au%C3%9Ferhalb_der_angezeigten_Begrenzung_zu_fahren.svg) (PD) |
| `A.11` | In-, uit- of doorvaren, wordt aanstonds toegestaan | lights (two) · Two fixed lights one above the other: red above, green below, in a black housing. | ★ | [POL Znak Żeglugowy A11 lamp1.svg](https://commons.wikimedia.org/wiki/File:POL_Znak_%C5%BBeglugowy_A11_lamp1.svg) (BY-SA 3.0) |
| `A.11.1` | Doorvaren verboden, tenzij de doorvaartopening zo dicht is genaderd, dat stilhouden redelijkerwijs niet meer mogelijk is groen flikkerlicht | lights (two) · Red fixed light above a green FLASHING light (the drawing marks flashing with black wedges in the green disc). | ★ | — |
| `A.12` | Verboden voor motorschepen | square · Black three-bladed ship propeller, seen end-on, centred. | ★ | [A.12 Fahrverbot für Fahrzeuge mit Maschinenantrieb.svg](https://commons.wikimedia.org/wiki/File:A.12_Fahrverbot_f%C3%BCr_Fahrzeuge_mit_Maschinenantrieb.svg) (PD) |
| `A.13` | Verboden voor kleine schepen | square · The black word "sport" (lower case, bold sans) horizontally across the centre. | ★ | [A.13 Fahrverbot für Sportboote.svg](https://commons.wikimedia.org/wiki/File:A.13_Fahrverbot_f%C3%BCr_Sportboote.svg) (PD) |
| `A.14` | Verboden te waterskiën | square · Black water skier being towed, facing left, towline to the upper left. |  | [A.14 Verbot des Wasserskilaufens.svg](https://commons.wikimedia.org/wiki/File:A.14_Verbot_des_Wasserskilaufens.svg) (PD) |
| `A.15` | Verboden voor zeilschepen | square · Black sailboat in side view: triangular mainsail, hull below. | ★ | [A.15 Fahrverbot für Segelfahrzeuge.svg](https://commons.wikimedia.org/wiki/File:A.15_Fahrverbot_f%C3%BCr_Segelfahrzeuge.svg) (PD) |
| `A.16` | Verboden voor door spierkracht voortbewogen schepen | square · Black rowing boat with one rower, oar diagonal down to the lower left. | ★ | [A.16 Fahrverbot.svg](https://commons.wikimedia.org/wiki/File:A.16_Fahrverbot.svg) (PD) |
| `A.17` | Verboden voor zeilplanken | square · Black windsurfer: person on a board holding a triangular sail. | ★ | [A.17 Verbot des Segelsurfens.svg](https://commons.wikimedia.org/wiki/File:A.17_Verbot_des_Segelsurfens.svg) (PD) |
| `A.18` | Einde van het vaarweggedeelte waar door snelle motorboten zonder beperking van de snelheid mag worden gevaren | square · Black speedboat planing to the right with a bow wave, crossed by the diagonal. |  | [POL Znak Żeglugowy A18.svg](https://commons.wikimedia.org/wiki/File:POL_Znak_%C5%BBeglugowy_A18.svg) (BY-SA 3.0) |
| `A.19` | Verboden schepen te water te laten en uit het water te halen | square · Black boat on a trailer on a sloping slipway, water line bottom-left. |  | [POL Znak Żeglugowy A19.svg](https://commons.wikimedia.org/wiki/File:POL_Znak_%C5%BBeglugowy_A19.svg) (BY-SA 3.0) |
| `A.20` | Verboden voor waterscooters | square · Black rider on a water scooter with spray, facing right. |  | [Notice A.20 Water bikes prohibited.svg](https://commons.wikimedia.org/wiki/File:Notice_A.20_Water_bikes_prohibited.svg) (CC0) |

### B — Gebodstekens (obligations)

| Code | Naam (BPR, verbatim) | Vorm · symbool | ★ | Commons (licence) |
|---|---|---|---|---|
| `B.1a` | Verplichting te varen in de richting aangegeven door de pijl | landscape rectangle 3:2 · Black horizontal arrow pointing right (may point left). | ★ | [B.1 Gebot.svg](https://commons.wikimedia.org/wiki/File:B.1_Gebot.svg) (PD) |
| `B.1b` | Verplichting te varen in de richting aangegeven door de pijl (idem) | upright rectangle 2:3 · Black vertical arrow pointing up. | ★ | — |
| `B.2a` | Verplichting zich naar de bakboordszijde van het vaarwater te begeven | upright rectangle 2:3 · Black arrow coming up from the lower right, jogging to the left, ending in an arrowhead at the upper left. |  | [B.2a Gebot.svg](https://commons.wikimedia.org/wiki/File:B.2a_Gebot.svg) (PD) |
| `B.2b` | Verplichting zich naar de stuurboordszijde van het vaarwater te begeven | upright rectangle 2:3 · Mirror image of B.2a: arrow jogs from lower left to upper right. |  | [B.2b Gebot.svg](https://commons.wikimedia.org/wiki/File:B.2b_Gebot.svg) (PD) |
| `B.3a` | Verplichting de bakboordszijde van het vaarwater te houden | upright rectangle 2:3 · Left: solid black arrow pointing up (own track). Right: dashed black line with arrowhead pointing down (oncoming traffic). |  | [B.3a Gebot.svg](https://commons.wikimedia.org/wiki/File:B.3a_Gebot.svg) (PD) |
| `B.3b` | Verplichting de stuurboordszijde van het vaarwater te houden | upright rectangle 2:3 · Mirror of B.3a: dashed down-arrow left, solid up-arrow right. |  | [B.3b Gebot.svg](https://commons.wikimedia.org/wiki/File:B.3b_Gebot.svg) (PD) |
| `B.4a` | Verplichting het vaarwater over te steken naar bakboord | upright rectangle 2:3 · Solid black arrow from lower right crossing to upper left (arrowhead up), and a dashed arrow crossing the other way (arrowhead down, lower left). |  | [B.4a Gebot.svg](https://commons.wikimedia.org/wiki/File:B.4a_Gebot.svg) (PD) |
| `B.4b` | Verplichting het vaarwater over te steken naar stuurboord | upright rectangle 2:3 · Mirror of B.4a. |  | [B.4 Gebot.svg](https://commons.wikimedia.org/wiki/File:B.4_Gebot.svg) (PD) |
| `B.5` | Verplichting vóór het bord stil te houden onder bepaalde omstandigheden | square · Black horizontal bar with rounded ends, centred, ~60 % of the field wide. | ★ | [B.5 Gebot.svg](https://commons.wikimedia.org/wiki/File:B.5_Gebot.svg) (PD) |
| `B.6` | Verplichting de vaarsnelheid te beperken, zoals is aangegeven (in km/u) | square · Black number (km/h), e.g. 7, centred. | ★ | [B.6 Gebot.svg](https://commons.wikimedia.org/wiki/File:B.6_Gebot.svg) (PD) |
| `B.7` | Verplichting een geluidssein te geven | square · Black filled disc, centred, ~45 % of the field. |  | [B.7 Gebot.svg](https://commons.wikimedia.org/wiki/File:B.7_Gebot.svg) (PD) |
| `B.8` | Verplichting bijzonder op te letten | square · Black vertical bar with rounded ends, centred. | ★ | [B.8 Gebot.svg](https://commons.wikimedia.org/wiki/File:B.8_Gebot.svg) (PD) |
| `B.9a` | Verplichting niet het hoofdvaarwater op te varen of over te steken, indien daardoor schepen op het hoofdvaarwater zouden worden genoodzaakt hun … | square · Black "T": broad horizontal band across the upper half (main channel) and a vertical stem down to the bottom edge (your channel). | ★ | [B.9a Gebot.svg](https://commons.wikimedia.org/wiki/File:B.9a_Gebot.svg) (PD) |
| `B.9b` | Verplichting niet het hoofdvaarwater op te varen of over te steken, indien daardoor schepen op het hoofdvaarwater zouden worden genoodzaakt hun … | square · Black cross: broad horizontal band and a vertical band crossing it. | ★ | [B.9b Gebot.svg](https://commons.wikimedia.org/wiki/File:B.9b_Gebot.svg) (PD) |
| `B.10` | Verplichting zonodig koers en snelheid te wijzigen ten behoeve van uitvarende schepen | lights (two) · Two yellow flashing lights one above the other in a white-framed housing (drawn with black wedges = flashing). |  | [POL Znak Żeglugowy B10.svg](https://commons.wikimedia.org/wiki/File:POL_Znak_%C5%BBeglugowy_B10.svg) (BY-SA 3.0) |
| `B.11a` | Verplichting gebruik te maken van marifoon overeenkomstig de daartoe bij algemene regeling vastgestelde voorschriften, dan wel zich te melden op … | square · Black letters "VHF" centred. |  | [B.11a Gebot VHF.svg](https://commons.wikimedia.org/wiki/File:B.11a_Gebot_VHF.svg) (PD) |
| `B.11b` | Verplichting gebruik te maken van marifoon overeenkomstig de daartoe bij algemene regeling vastgestelde voorschriften, dan wel zich te melden op … | square · Black "VHF" above a channel number (e.g. 11). |  | [B.11b Gebot VHF.svg](https://commons.wikimedia.org/wiki/File:B.11b_Gebot_VHF.svg) (PD) |
| `B.12` | Verplichting tot het gebruik van walstroomaansluitingen | square · Black plug (electric connector) seen from the side, pointing left. |  | [B.12 Gebot.svg](https://commons.wikimedia.org/wiki/File:B.12_Gebot.svg) (PD) |

### C — Beperkingstekens (restrictions)

| Code | Naam (BPR, verbatim) | Vorm · symbool | ★ | Commons (licence) |
|---|---|---|---|---|
| `C.1` | Beperkte waterdiepte; eventueel de beschikbare diepte aangegeven in centimeters | square · Black triangle standing on the bottom edge, apex up (the "bottom" rising); optional number above it. Variant (67699): number in white on a black bar in the upper half, black triangle at the bottom. | ★ | [C.1 Die Fahrwassertiefe ist begrenzt.svg](https://commons.wikimedia.org/wiki/File:C.1_Die_Fahrwassertiefe_ist_begrenzt.svg) (PD) |
| `C.2` | Beperkte doorvaarthoogte; eventueel de beschikbare doorvaarthoogte aangegeven in meters | square · Black triangle hanging from the top edge, apex down; optional number below. Variant (67700): white number on a black bar at the bottom. | ★ | [C.2 Die lichte Höhe über dem Wasserspiegel ist begrenzt.svg](https://commons.wikimedia.org/wiki/File:C.2_Die_lichte_H%C3%B6he_%C3%BCber_dem_Wasserspiegel_ist_begrenzt.svg) (PD) |
| `C.3` | Beperkte breedte van doorvaart of vaarwater; eventueel de beschikbare breedte aangegeven in meters | square · Two black triangles on the left and right edges, apexes pointing to each other at mid-height; optional number between/above them. | ★ | [C.3 Die Breite der Durchfahrtsöffnung oder des Fahrwassers ist begrenzt.svg](https://commons.wikimedia.org/wiki/File:C.3_Die_Breite_der_Durchfahrts%C3%B6ffnung_oder_des_Fahrwassers_ist_begrenzt.svg) (PD) |
| `C.4` | Vaartbeperkingen; vraag nadere inlichtingen | square · Empty white field inside the red border (no symbol). |  | [C.4 Es bestehen Schifffahrtsbeschränkungen.svg](https://commons.wikimedia.org/wiki/File:C.4_Es_bestehen_Schifffahrtsbeschr%C3%A4nkungen.svg) (PD) |
| `C.5` | Het vaarwater bevindt zich op enige afstand van de oever; het op het bord voorkomende getal geeft in meters de afstand aan die de schepen uit de … | square · Black pentagon shaped like an arrow pointing to the left (toward the channel), filling most of the field, with a white number (e.g. 12). | ★ | [C.5 Das Fahrwasser ist am rechten (linken) Ufer eingeengt; die Zahl auf dem Zeichen gibt den Abstand in Metern an, in dem sich die Fahrzeuge vom Tafelzeichen entfernt halten sollen.svg](https://commons.wikimedia.org/wiki/File:C.5_Das_Fahrwasser_ist_am_rechten_(linken)_Ufer_eingeengt;_die_Zahl_auf_dem_Zeichen_gibt_den_Abstand_in_Metern_an,_in_dem_sich_die_Fahrzeuge_vom_Tafelzeichen_entfernt_halten_sollen.svg) (PD) |

### D — Aanbevelingstekens (recommendations)

| Code | Naam (BPR, verbatim) | Vorm · symbool | ★ | Commons (licence) |
|---|---|---|---|---|
| `D.1a` | Aanbevolen doorvaartopening (vaste bruggen); doorvaart toegestaan (gesloten beweegbare bruggen) — doorvaart uit de tegengestelde richting toegestaan | square board set on a point (diamond) · One yellow diamond (square turned 45°) with a thin black outline; or one yellow fixed light. Hung above the middle of the opening. | ★ | [D.1 Empfohlene Durchfahrtsöffnung.svg](https://commons.wikimedia.org/wiki/File:D.1_Empfohlene_Durchfahrts%C3%B6ffnung.svg) (PD) |
| `D.1b` | Aanbevolen doorvaartopening (vaste bruggen); doorvaart toegestaan (gesloten beweegbare bruggen) — doorvaart uit de tegengestelde richting verboden | two diamonds or two lights · Two yellow diamonds side by side (preferred) or one above the other; or two yellow fixed lights. | ★ | [D.1b Empfohlene Durchfahrtsöffnung.svg](https://commons.wikimedia.org/wiki/File:D.1b_Empfohlene_Durchfahrts%C3%B6ffnung.svg) (BY-SA 4.0) |
| `D.2` | Aanbeveling binnen de aangegeven begrenzing te varen | always a pair of diamonds · Each diamond split vertically: the GREEN half faces the channel (inward), the WHITE half faces outward. Counterpart of A.10. | ★ | [D.2 Empfehlung sich in dem durch die Tafeln begrenzten Raum zu halten.svg](https://commons.wikimedia.org/wiki/File:D.2_Empfehlung_sich_in_dem_durch_die_Tafeln_begrenzten_Raum_zu_halten.svg) (PD) |
| `D.3a` | Aanbeveling te varen in de richting aangegeven door: de pijl | landscape rectangle 3:2 · White horizontal arrow pointing right (or left) on a blue field. | ★ | [D.3 Empfehlung in die Richtung des Pfeils zu fahren.svg](https://commons.wikimedia.org/wiki/File:D.3_Empfehlung_in_die_Richtung_des_Pfeils_zu_fahren.svg) (PD) |
| `D.3b` | Aanbeveling te varen in de richting aangegeven door: idem | upright rectangle 2:3 · White vertical arrow pointing up on blue. |  | — |
| `D.3c` | Aanbeveling te varen in de richting aangegeven door: het isofase licht | two lights side by side in a white-framed housing · Left: a white fixed light (open circle). Right: a white isophase light (drawn as a circle with two opposite black quadrants). |  | [POL Znak Żeglugowy D3 lamp.svg](https://commons.wikimedia.org/wiki/File:POL_Znak_%C5%BBeglugowy_D3_lamp.svg) (BY-SA 3.0) |

### E — Aanwijzingstekens (information / permissions)

| Code | Naam (BPR, verbatim) | Vorm · symbool | ★ | Commons (licence) |
|---|---|---|---|---|
| `E.1` | In-, uit- of doorvaren toegestaan (algemeen teken) | landscape rectangle 3:2 (board); or light(s) · Board: three VERTICAL bands green / white / green. Light version: one green fixed light, or two green lights one above the other. | ★ | [E.1 Erlaubnis zur Durchfahrt.svg](https://commons.wikimedia.org/wiki/File:E.1_Erlaubnis_zur_Durchfahrt.svg) (PD) |
| `E.2` | Hoogspanningslijn | square · White lightning bolt (zigzag with arrowhead) from upper right to lower left. | ★ | [E.2 Kreuzung einer Hochspannungsleitung.svg](https://commons.wikimedia.org/wiki/File:E.2_Kreuzung_einer_Hochspannungsleitung.svg) (PD) |
| `E.3` | Stuw | landscape rectangle 3:2 · Stylised weir: blue horizontal band at the top (the bridge deck) with four/five vertical blue pillars hanging from it on white, blue strip at the bottom. |  | [E.3 Hinweis auf ein Wehr.svg](https://commons.wikimedia.org/wiki/File:E.3_Hinweis_auf_ein_Wehr.svg) (PD) |
| `E.4a` | Niet-vrijvarende veerpont | square · White ferry in side view (hull with deckhouse) in the upper part, and a white horizontal line (the cable) across the lower part. | ★ | [E.4a Nicht frei fahrende Fähre.svg](https://commons.wikimedia.org/wiki/File:E.4a_Nicht_frei_fahrende_F%C3%A4hre.svg) (PD) |
| `E.4b` | Vrijvarende veerpont | square · White ferry in side view, no cable line. | ★ | [E.4b Frei fahrende Fähre.svg](https://commons.wikimedia.org/wiki/File:E.4b_Frei_fahrende_F%C3%A4hre.svg) (PD) |
| `E.5` | Toestemming ligplaats te nemen (ankeren en meren) aan de zijde van de vaarweg waar het bord is geplaatst | square · White capital P, centred. | ★ | [E.5 Erlaubnis zum Stillliegen auf der Seite der Wasserstraße, auf der das Zeichen steht.svg](https://commons.wikimedia.org/wiki/File:E.5_Erlaubnis_zum_Stillliegen_auf_der_Seite_der_Wasserstra%C3%9Fe,_auf_der_das_Zeichen_steht.svg) (PD) |
| `E.5.1` | Toestemming ligplaats te nemen (ankeren en meren) tot ten hoogste de aangegeven breedte, in meters gerekend vanaf het bord | square · White number (e.g. 20), centred. | ★ | [E.5.1 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.1_Erlaubnis.svg) (PD) |
| `E.5.2` | Toestemming ligplaats te nemen (ankeren en meren) op het gedeelte van de vaarweg, gelegen tussen de aangegeven afstanden, in meters gerekend vanaf … | landscape rectangle (~2:1) · White "30-60" (two numbers with a hyphen). |  | [E.5.2 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.2_Erlaubnis.svg) (PD) |
| `E.5.3` | Toestemming ligplaats te nemen (ankeren en meren) met ten hoogste het aangegeven aantal schepen langszijde van elkaar, aan de zijde van de vaarweg … | square · White Roman numeral (e.g. IV). | ★ | [E.5.3 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.3_Erlaubnis.svg) (PD) |
| `E.5.4` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor duwvaart die geen blauwe kegels of lichten behoeft te voeren, aan de zijde van … | square · White triangle, apex up (large, centred) |  | [E.5.4 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.4_Erlaubnis.svg) (PD) |
| `E.5.5` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor duwvaart die één blauwe kegel of één blauw licht moet voeren, aan de zijde van … | square · White triangle, apex up (large, centred) containing one small blue triangle (apex down) stacked vertically = the blue cones |  | [E.5.5 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.5_Erlaubnis.svg) (PD) |
| `E.5.6` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor duwvaart die twee blauwe kegels of twee blauwe lichten moet voeren, aan de … | square · White triangle, apex up (large, centred) containing two small blue triangles (apex down) stacked vertically = the blue cones |  | [E.5.6 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.6_Erlaubnis.svg) (PD) |
| `E.5.7` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor duwvaart die drie blauwe kegels of drie blauwe lichten moet voeren aan de zijde … | square · White triangle, apex up (large, centred) containing three small blue triangles (apex down) stacked vertically = the blue cones |  | [E.5.7 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.7_Erlaubnis.svg) (PD) |
| `E.5.8` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor andere schepen dan duwvaart die geen blauwe kegels of lichten behoeven te … | square · White triangle, apex down (large, centred) |  | [E.5.8 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.8_Erlaubnis.svg) (PD) |
| `E.5.9` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor andere schepen dan duwvaart die één blauwe kegel of één blauw licht moeten … | square · White triangle, apex down (large, centred) containing one small blue triangle (apex down) stacked vertically = the blue cones |  | [E.5.9 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.9_Erlaubnis.svg) (PD) |
| `E.5.10` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor andere schepen dan duwvaart die twee blauwe kegels of twee blauwe lichten … | square · White triangle, apex down (large, centred) containing two small blue triangles (apex down) stacked vertically = the blue cones |  | [E.5.10 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.10_Erlaubnis.svg) (PD) |
| `E.5.11` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor andere schepen dan duwvaart die drie blauwe kegels of drie blauwe lichten … | square · White triangle, apex down (large, centred) containing three small blue triangles (apex down) stacked vertically = the blue cones |  | [E.5.11 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.11_Erlaubnis.svg) (PD) |
| `E.5.12` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor schepen - zowel duwvaart als andere schepen dan duwvaart - die geen blauwe … | square · White diamond (large, centred) |  | [E.5.12 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.12_Erlaubnis.svg) (PD) |
| `E.5.13` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor schepen - zowel duwvaart als andere schepen dan duwvaart - die één blauwe kegel … | square · White diamond (large, centred) containing one small blue triangle (apex down) stacked vertically = the blue cones |  | [E.5.13 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.13_Erlaubnis.svg) (PD) |
| `E.5.14` | Toestemming om ligplaats te nemen (ankeren en meren) uitsluitend voor schepen - zowel duwvaart als andere schepen dan duwvaart - die twee blauwe … | square · White diamond (large, centred) containing two small blue triangles (apex down) stacked vertically = the blue cones |  | [E.5.14 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.14_Erlaubnis.svg) (PD) |
| `E.5.15` | Toestemming ligplaats te nemen (ankeren en meren) uitsluitend voor schepen - zowel duwvaart als andere schepen dan duwvaart - die drie blauwe … | square · White diamond (large, centred) containing three small blue triangles (apex down) stacked vertically = the blue cones |  | [E.5.15 Erlaubnis.svg](https://commons.wikimedia.org/wiki/File:E.5.15_Erlaubnis.svg) (PD) |
| `E.6` | Toestemming te ankeren aan de zijde van de vaarweg waar het bord is geplaatst | square · White anchor, upright (ring on top, arms curving up at the bottom). | ★ | [Notice E.6. Anchoring permitted.svg](https://commons.wikimedia.org/wiki/File:Notice_E.6._Anchoring_permitted.svg) (CC0) |
| `E.6.1` | Toestemming gebruik te maken van spudpalen aan de zijde van de vaarweg waar het bord is geplaatst | square · White ship in side view on a wavy water line with a vertical spud pole going down into the bottom (horizontal line). |  | — |
| `E.7` | Toestemming te meren aan de zijde van de vaarweg waar het bord is geplaatst | square · White bolder (bollard), centred. | ★ | [E.7 Erlaubnis zum Festmachen am Ufer auf der Seite der Wasserstraße, auf der das Tafelzeichen steht.svg](https://commons.wikimedia.org/wiki/File:E.7_Erlaubnis_zum_Festmachen_am_Ufer_auf_der_Seite_der_Wasserstra%C3%9Fe,_auf_der_das_Tafelzeichen_steht.svg) (PD) |
| `E.7.1` | Toestemming te meren voor het onmiddellijk van of aan boord zetten van een auto | square · White car at the bottom, with a crane jib and hook above it (lifting the car). |  | [E.7.1 Erlaubnis zum Festmachen am Ufer für das sofortige Ein- oder Ausladen eines Kraftwagens.svg](https://commons.wikimedia.org/wiki/File:E.7.1_Erlaubnis_zum_Festmachen_am_Ufer_f%C3%BCr_das_sofortige_Ein-_oder_Ausladen_eines_Kraftwagens.svg) (PD) |
| `E.8` | Plaats om te keren | square · White turning arrow as in A.8 (almost full circle, arrowhead upper right). |  | [E.8 Hinweis auf eine Wendestelle.svg](https://commons.wikimedia.org/wiki/File:E.8_Hinweis_auf_eine_Wendestelle.svg) (PD) |
| `E.9a` | Het gevolgde vaarwater geldt als hoofdvaarwater ten opzichte van het vaarwater dat daarin uitmondt | square · White junction plan seen from above, your channel enters from the bottom edge: crossing: broad vertical band (own channel = main) crossed by a narrower horizontal band to both sides. Thick band ~25 % of the side, thin ~15 % (measured on the BPR drawing). Letters d–i are approximate: trace the BPR image for exact geometry. | ★ | [E.9a Einmündung.svg](https://commons.wikimedia.org/wiki/File:E.9a_Einm%C3%BCndung.svg) (PD) |
| `E.9b` | Het gevolgde vaarwater geldt als hoofdvaarwater ten opzichte van het vaarwater dat daarin uitmondt (idem) | square · White junction plan seen from above, your channel enters from the bottom edge: broad vertical band, narrower side channel joining from the right. Thick band ~25 % of the side, thin ~15 % (measured on the BPR drawing). Letters d–i are approximate: trace the BPR image for exact geometry. | ★ | [E.9b Einmündung.svg](https://commons.wikimedia.org/wiki/File:E.9b_Einm%C3%BCndung.svg) (PD) |
| `E.9c` | Het gevolgde vaarwater geldt als hoofdvaarwater ten opzichte van het vaarwater dat daarin uitmondt (idem) | square · White junction plan seen from above, your channel enters from the bottom edge: broad vertical band, narrower side channel joining from the left. Thick band ~25 % of the side, thin ~15 % (measured on the BPR drawing). Letters d–i are approximate: trace the BPR image for exact geometry. | ★ | [E.9c Einmündung.svg](https://commons.wikimedia.org/wiki/File:E.9c_Einm%C3%BCndung.svg) (PD) |
| `E.9d` | Het gevolgde vaarwater geldt als hoofdvaarwater ten opzichte van het vaarwater dat daarin uitmondt (idem) | square · White junction plan seen from above, your channel enters from the bottom edge: broad band from the bottom turns right (broad horizontal to the right edge); straight ahead continues narrower. Thick band ~25 % of the side, thin ~15 % (measured on the BPR drawing). Letters d–i are approximate: trace the BPR image for exact geometry. | ★ | — |
| `E.9e` | Het gevolgde vaarwater geldt als hoofdvaarwater ten opzichte van het vaarwater dat daarin uitmondt (idem) | square · White junction plan seen from above, your channel enters from the bottom edge: mirror of d: broad band turns left, narrower continuation straight ahead. Thick band ~25 % of the side, thin ~15 % (measured on the BPR drawing). Letters d–i are approximate: trace the BPR image for exact geometry. | ★ | — |
| `E.9f` | Het gevolgde vaarwater geldt als hoofdvaarwater ten opzichte van het vaarwater dat daarin uitmondt (idem) | square · White junction plan seen from above, your channel enters from the bottom edge: T-junction at the top: broad band from the bottom turns right, narrower branch to the left. Thick band ~25 % of the side, thin ~15 % (measured on the BPR drawing). Letters d–i are approximate: trace the BPR image for exact geometry. | ★ | — |
| `E.9g` | Het gevolgde vaarwater geldt als hoofdvaarwater ten opzichte van het vaarwater dat daarin uitmondt (idem) | square · White junction plan seen from above, your channel enters from the bottom edge: mirror of f: broad band turns left, narrower branch to the right. Thick band ~25 % of the side, thin ~15 % (measured on the BPR drawing). Letters d–i are approximate: trace the BPR image for exact geometry. | ★ | — |
| `E.9h` | Het gevolgde vaarwater geldt als hoofdvaarwater ten opzichte van het vaarwater dat daarin uitmondt (idem) | square · White junction plan seen from above, your channel enters from the bottom edge: crossing where the widths differ per arm (staggered); trace the BPR image. Thick band ~25 % of the side, thin ~15 % (measured on the BPR drawing). Letters d–i are approximate: trace the BPR image for exact geometry. | ★ | — |
| `E.9i` | Het gevolgde vaarwater geldt als hoofdvaarwater ten opzichte van het vaarwater dat daarin uitmondt (idem) | square · White junction plan seen from above, your channel enters from the bottom edge: mirror of h; trace the BPR image. Thick band ~25 % of the side, thin ~15 % (measured on the BPR drawing). Letters d–i are approximate: trace the BPR image for exact geometry. | ★ | — |
| `E.10a` | Het gevolgde vaarwater geldt als nevenvaarwater ten opzichte van het vaarwater waarin het uitmondt | square · White junction plan, own channel from the bottom edge: crossing: thin vertical (own channel) meets a broad horizontal band going both ways. | ★ | [E.10a Nebenwasserstraße.svg](https://commons.wikimedia.org/wiki/File:E.10a_Nebenwasserstra%C3%9Fe.svg) (PD) |
| `E.10b` | Het gevolgde vaarwater geldt als nevenvaarwater ten opzichte van het vaarwater waarin het uitmondt (idem) | square · White junction plan, own channel from the bottom edge: T-junction: thin vertical stem from the bottom into a broad horizontal band along the top. | ★ | [E.10b Nebenwasserstraße.svg](https://commons.wikimedia.org/wiki/File:E.10b_Nebenwasserstra%C3%9Fe.svg) (PD) |
| `E.10c` | Het gevolgde vaarwater geldt als nevenvaarwater ten opzichte van het vaarwater waarin het uitmondt (idem) | square · White junction plan, own channel from the bottom edge: thin channel from the bottom joins a broad channel that bends away to the right (staggered). | ★ | — |
| `E.10d` | Het gevolgde vaarwater geldt als nevenvaarwater ten opzichte van het vaarwater waarin het uitmondt (idem) | square · White junction plan, own channel from the bottom edge: mirror of c. | ★ | — |
| `E.10e` | Het gevolgde vaarwater geldt als nevenvaarwater ten opzichte van het vaarwater waarin het uitmondt (idem) | square · White junction plan, own channel from the bottom edge: staggered crossing, broad band crossing, thin continuation offset. | ★ | — |
| `E.10f` | Het gevolgde vaarwater geldt als nevenvaarwater ten opzichte van het vaarwater waarin het uitmondt (idem) | square · White junction plan, own channel from the bottom edge: mirror of e. | ★ | — |
| `E.11` | Einde van een verbod of een gebod geldend voor één richting of einde van een beperking | upright rectangle or square (two models · Blue field with a white diagonal stripe from top-left to bottom-right (no symbol). | ★ | [E.11 Ende eines Verbots oder eines Gebots.svg](https://commons.wikimedia.org/wiki/File:E.11_Ende_eines_Verbots_oder_eines_Gebots.svg) (PD) |
| `E.12a` | Voorwaarschuwing. vaste lichten: moeilijkheden vooruit, stoppen indien de voorschriften zulks vereisen. | two lights side by side in a white-framed housing · Two white fixed lights side by side. |  | [POL Znak Żeglugowy E12a lamp1.svg](https://commons.wikimedia.org/wiki/File:POL_Znak_%C5%BBeglugowy_E12a_lamp1.svg) (BY-SA 3.0) |
| `E.12b` | Voorwaarschuwing. synchroon brandende isofase lichten: u kunt voorzichtig naderen | two lights side by side · Two white isophase lights side by side (drawn with two black opposite quadrants). |  | [POL Znak Żeglugowy E12b lamp1.svg](https://commons.wikimedia.org/wiki/File:POL_Znak_%C5%BBeglugowy_E12b_lamp1.svg) (BY-SA 3.0) |
| `E.12.1` | Waarschuwing voor uitvarende of langsvarende schepen flikkerlicht | one light in a white-framed housing · One yellow flashing light (drawn with black wedges). |  | — |
| `E.13` | Drinkwater voor schepen | square · White water tap (faucet), spout to the left. |  | [E.13 Trinkwasserzapfstelle.svg](https://commons.wikimedia.org/wiki/File:E.13_Trinkwasserzapfstelle.svg) (PD) |
| `E.14` | Telefoon | square · White telephone handset, diagonal. |  | [E.14 Fernsprechstelle.svg](https://commons.wikimedia.org/wiki/File:E.14_Fernsprechstelle.svg) (PD) |
| `E.15` | Motorschepen toegestaan | square · White three-bladed propeller. | ★ | [E.15 Fahrerlaubnis für Fahrzeuge mit Maschinenantrieb.svg](https://commons.wikimedia.org/wiki/File:E.15_Fahrerlaubnis_f%C3%BCr_Fahrzeuge_mit_Maschinenantrieb.svg) (PD) |
| `E.16` | Kleine schepen toegestaan | square · White word "sport". | ★ | [E.16 Fahrerlaubnis für Sportboote.svg](https://commons.wikimedia.org/wiki/File:E.16_Fahrerlaubnis_f%C3%BCr_Sportboote.svg) (PD) |
| `E.17` | Waterskiën toegestaan | square · White water skier. |  | [E.17 RL Wasserskistrecke.svg](https://commons.wikimedia.org/wiki/File:E.17_RL_Wasserskistrecke.svg) (PD) |
| `E.18` | Zeilschepen toegestaan | square · White sailboat (triangular sail, hull). | ★ | [E.18 Fahrerlaubnis für Segelfahrzeuge.svg](https://commons.wikimedia.org/wiki/File:E.18_Fahrerlaubnis_f%C3%BCr_Segelfahrzeuge.svg) (PD) |
| `E.19` | Door spierkracht voortbewogen schepen toegestaan | square · White rowing boat with rower. | ★ | [E.19 Fahrerlaubnis für Fahrzeuge, die weder mit Maschinenantrieb noch unter Segel fahren.svg](https://commons.wikimedia.org/wiki/File:E.19_Fahrerlaubnis_f%C3%BCr_Fahrzeuge,_die_weder_mit_Maschinenantrieb_noch_unter_Segel_fahren.svg) (PD) |
| `E.20` | Zeilplanken toegestaan | square · White windsurfer. | ★ | [E.20 Erlaubnis zum Segelsurfen.svg](https://commons.wikimedia.org/wiki/File:E.20_Erlaubnis_zum_Segelsurfen.svg) (PD) |
| `E.21` | Snel varen voor kleine motorschepen toegestaan | square · White speedboat planing to the right with a bow wave. |  | [POL Znak Żeglugowy E21.svg](https://commons.wikimedia.org/wiki/File:POL_Znak_%C5%BBeglugowy_E21.svg) (BY-SA 3.0) |
| `E.22` | Toegestaan schepen te water te laten (trailerhelling) | square · White boat on a trailer on a sloping slipway, waves bottom left. |  | [POL Znak Żeglugowy E22.svg](https://commons.wikimedia.org/wiki/File:POL_Znak_%C5%BBeglugowy_E22.svg) (BY-SA 3.0) |
| `E.23` | Marifoonkanaal voor nautische informatie, bijvoorbeeld: kanaal 18. | square · White "VHF" above the channel number (e.g. 18). |  | [E.21 Nautischer Informationsfunkdienst.svg](https://commons.wikimedia.org/wiki/File:E.21_Nautischer_Informationsfunkdienst.svg) (PD) |
| `E.24` | Waterscooters toegestaan | square · White rider on a water scooter with spray. |  | [Notice E.24 Water bikes permitted.svg](https://commons.wikimedia.org/wiki/File:Notice_E.24_Water_bikes_permitted.svg) (CC0) |
| `E.25` | Aansluiting voor walstroom beschikbaar | square · White plug/socket connector seen from the side (two pins left, cable right). |  | [E.25 Landstromanschluss vorhanden.svg](https://commons.wikimedia.org/wiki/File:E.25_Landstromanschluss_vorhanden.svg) (PD) |

### F — Bijkomende tekens (plates added to a main sign)

| Code | Naam (BPR, verbatim) | Vorm · symbool | ★ | Commons (licence) |
|---|---|---|---|---|
| `F.1` | Afstandsaanduidingen: borden boven het hoofdteken, vermeldende na welke afstand het hoofdteken geldt | rectangle as wide as the main sign · Black number (e.g. 800) on white with a thin black border. | ★ | — |
| `F.2a` | Richtingaanduidingen: borden naast het hoofdteken, aangevende de richting van het vaarweggedeelte waarop het hoofdteken betrekking heeft | pointed board (pentagon/arrow) · White board with a point on the side of the stretch; optional length, e.g. "2 km". | ★ | — |
| `F.2b` | Richtingaanduidingen: lichtpijl, aangevende de richting waarvoor het hoofdteken (één of meer lichten) geldt | black square panel · White chevron made of lights (pointing up, left or right) with the red/green lights beside it. |  | — |
| `F.3` | Aanvullende aanduidingen: borden onder het hoofdteken, waarop een nadere verklaring of aanwijzing is vermeld | rectangle as wide as the main sign · Short black text or symbol on white, e.g. "brugbouw", a long-blast dash, "1,80", "regeling scheepvaart", "400 V~"; or white numbers on black (C.1 "220"). | ★ | — |
| `F.4` | Categorie aanduidingen: borden onder het hoofdteken, aangevende de categorie waarvoor het hoofdteken geldt | rectangle below the main sign · Black pictogram (e.g. propeller) or the word "sport". | ★ | — |

### G — Tekens aan kunstwerken (Dutch only; not in CEVNI [RST §3.7])

Bijlage 7 G opens: at the kunstwerken of G.1–G.4 **A.1** may be shown as red fixed lights or
red-white-red rectangular boards, **E.1** as green fixed lights or green-white-green boards,
**D.1** as yellow fixed lights or yellow diamond boards, and there are green flashing lights
(A.11.1). Detailed per light picture in the next-but-one section; images in `tekens.json`.

| Code | Naam | ★ |
|---|---|---|
| `G.1a` | Vaste bruggen: begrenzing vaargeulbreedte (A.10 must / D.2 should) | ★ |
| `G.1b` | Vaste bruggen: verboden of aanbevolen doorvaartopening (A.1 / D.1a / D.1b). *"Niet gemarkeerde brugopeningen kunnen op eigen risico worden gebruikt."* | ★ |
| `G.2a` / `G.2b` | Beweegbare bruggen in bedrijf / buiten bedrijf | ★ |
| `G.3` | Stuwen | |
| `G.4.1a` / `G.4.1b` / `G.4.2` | Sluis in bedrijf / buiten bedrijf / sluis met beweegbare brug | ★ |
| `G.5.1` | Hoogteschaal: 1 m blocks alternating yellow and black with the metre figure, decimetre ticks; starboard side (or both sides) of the opening. G.5.1a voorhoogteschaal (same, placed ahead, name above) | ★ |
| `G.5.1b` | Referentietekens: black board with two yellow blocks, on the span where the gauge applies (A.10 or D.2 serve instead) | ★ |
| `G.5.1c` | Overhoogte/onderhoogte: small yellow/black plate "+0,40" / "-0,25" | |
| `G.5.2` / `G.5.3` | Hoogtebord / dieptebord: black square, yellow rim, yellow figure and triangle (down for height, up for depth) | ★ / |

### H.3 — Spui- en inlaattekens

| Code | Naam | Picture |
|---|---|---|
| `H.3a` | Er wordt gespuid | three red lights in a triangle, **point up**, and/or a blue rectangular flag with white "spuien" |
| `H.3b` | Er wordt ingelaten | three red lights in a triangle, **point down**, and/or a blue pennant with white "inlaten" |
| `H.3c` | Er zal weldra worden gespuid/ingelaten | three red lights in a row, and/or the flag or the pennant |

Note: [RST] §3.8 describes the same pictures but swaps the letters (its "H.3a" is ingelaten). The
BPR drawings and captions win. H.1 (kilometer- and hectometerborden, white with black figures) and
H.2 (bewegwijzering: green/white/orange/white-with-blue name boards) are left out of the JSON.

## Where the BPR sign differs from CEVNI and from the Commons drawings

- **Numbering traps in the German files.** BinSchStrO reuses CEVNI numbers for other signs:
  German A.13 "Anhalten in Schleusen", A.14 "Durchfahren von Brücken", A.16 "Aufforderung zum
  Anhalten", B.14–B.17 are **Seeschifffahrtsstraßen-Ordnung** signs; German A.18 = water scooters
  (BPR A.20); German E.21 = VHF information (BPR **E.23**); German E.22 = Hochwassermarke (BPR E.22 =
  trailerhelling); German E.24 = kitesurf (BPR E.24 = waterscooters). `tekens.json` maps by the
  picture, not by the German number. The German file "B.4 Gebot" is BPR **B.4b** and "B.4a Gebot"
  is BPR B.4a (checked against the drawings).
- **A.1a**: the same red disc with white bar as BinSchStrO/CEVNI A.1a ("gesperrte Wasserfläche"),
  but the BPR wording adds *"niet geldend voor een klein schip zonder motor"*. **A.11.1** (red over
  flashing green) and **E.12.1** (yellow flashing) have no counterpart in the Commons CEVNI sets
  (CEVNI text itself not checked); all of **G** is Dutch [RST §3.7].
- **A.13 / E.16**: BPR name "kleine schepen", the drawing still reads "sport" (lower case). German
  files write "SPORT".
- **A.6**: square in the BPR, upright rectangle in BinSchStrO. **E.6**: square in the BPR, upright
  rectangle in the German file (so the CC0 "Notice E.6" is used).
- **A.11**: the Dutch practice is red **above** green; CEVNI (and the LukeLR/Polish files) also
  show them side by side.
- **A.4.1, E.12a/b, D.3b**: not in the RPR [RST]; E.12 and D.3b are not used in practice.
- The BPR has **no E.26/E.27** (frost harbour signs) that CEVNI has [RST].
- F.2a: the BPR shows a **white** pointed side plate; the RST 2023 prefers a **black plate with a
  white arrow** for new signs. F.2b light arrows are not used in NL.

## Most relevant for a lelievlet / CWO

A lelievlet is a **klein schip** (< 20 m), sails and rows, usually has no engine. So:

- **Bans that hit it**: A.1 (and at bridges/locks its light forms), **A.13 kleine schepen**,
  **A.15 zeilschepen** (under sail), **A.16 spierkracht** (rowing), A.12 only when an outboard is
  used. **A.1a does NOT apply** to a small ship without engine — a good quiz question.
- **Ligplaats**: A.5, A.5.1, A.6, A.7 versus E.5, E.5.1, E.5.3, E.6, E.7 (plus F.2a arrows marking
  the stretch). Only valid on the side where the board stands.
- **Narrows and bridges**: A.2, A.4, A.10 and D.2 pairs, D.1a/D.1b, B.5 stop line, C.1–C.3 (depth,
  headroom — the mast!, width), C.5, G.5 hoogteschaal.
- **Main/side waterway**: B.9a/b, E.9, E.10 (thick line = hoofdvaarwater).
- **Permissions ending a ban**: E.11, E.16, E.18, E.19.
- Also: A.9 (not for making wash, but CWO asks it), B.6 speed, B.8 + onderbord, E.2 power line
  (mast!), E.4a/E.4b ferries, H.3 spuien/inlaten.

CWO lists (secondary; old code spellings kept):

| List | Bijlage 7 signs |
|---|---|
| **Kielboot III** [CWO-KB22] (= Zwaardboot 2-mans III; same list in the 2005 handbook) | A1 (incl. A.1.a), A9, A11, A12, A13, A15, A16, A17, B5, B6, D1, E1, E4, E4.1, E9, E10, E11, E15, E16, E18, E19, E20, G1, G2, G4, G5.1a, H3 |
| **Roeien III** [CWO-R15] | A1, A6, A7, A11, A12, A13, A16, B5, B6, B8, D1, E1, E4a, E4b, E9, E10, E16, E19, F1, G1, G2, G4, G5.1a, H3 |
| Kielboot I–II, Roeien I–II | no signs |

Old spellings: **E4.1 = today's E.4b** (vrijvarende veerpont); **"G5.1a Hoogteschaal"** — in the
current bijlage the hoogteschaal is **G.5.1** and G.5.1a is the voorhoogteschaal. `cwo` in
`tekens.json` records which list names a code; `relevant` = named by CWO **or** practically
relevant for a lelievlet (my judgement, afgeleid).

Watch out in [KAT] §4.4: the text beside **E.1** reads "Dit bord geeft aan dat jij je op het
hoofdvaarwater bevindt" (wrong for E.1 = in-/uit-/doorvaren toegestaan; probably a layout slip from
E.9), and it names a sign "verboden voor snelle motorboten" that has no such name in the current
bijlage (A.18 is the *end* of a fast-motorboat zone). Use it for scenario ideas only.

## Bridges, locks and weirs: how signs and lights work together

This is what the bridge and lock scenes need. Light meanings are the BPR articles verbatim
(officieel); the placement comes from the G drawings and [RST] ch. 4.

### Fixed bridge (art. 6.25, G.1)

- Over each opening, centred on the fascia: **A.1** board (opening closed; one-way traffic sees it
  on the "wrong" side of a D.1b opening), **D.1a** one yellow diamond (recommended, two-way) or
  **D.1b** two yellow diamonds side by side (recommended, oncoming traffic forbidden). The boards
  may be yellow fixed lights instead; with a single opening a yellow light can hang in the middle as
  an **oriëntatielicht**.
- At the edges of the usable width: the **A.10** pair (must stay between) or the **D.2** pair
  (should stay between). These double as referentietekens for the hoogteschaal.
- **Hoogteschaal G.5.1** on the starboard-side pier (both sides for one wide opening), or a
  **hoogtebord G.5.2** on the span. Below 2,0 m clearance no height marks are used; for low bridges
  < 3 m over small recreational waters a decimetre-only narrow scale is allowed [RST].
- Unmarked openings: "op eigen risico".

### Movable bridge (art. 6.26 lid 4, G.2)

Lights "aan weerszijden van de doorvaartopening op gelijke hoogte dan wel aan de stuurboordszijde";
yellow lights over the middle of the opening. Verbatim meanings:

| Lights (each side) | + yellow over opening | Meaning (6.26 lid 4) | Bijlage 7 image |
|---|---|---|---|
| **two red** above each other | — | a. doorvaren verboden, de brug wordt **niet bediend** | 65634 (G.2b) |
| **one red** | — | b. doorvaren verboden, de brug wordt **bediend** | 65628 (G.2a) |
| **red above green** | — | c. verboden, maar dit zal **aanstonds** worden toegestaan (A.11) | 65631 |
| **one green** | — | d. doorvaren toegestaan | 65632 (bridge open) |
| **two green** above each other | — | e. toegestaan in beide richtingen, brug in geopende stand (G.2b: buiten bedrijf) | 65637 |
| **red above flashing green** | — | f. verboden, tenzij zo dicht genaderd dat stilhouden redelijkerwijs niet meer mogelijk is (A.11.1) | 65633 |
| a, b or c | **one yellow** | g. niet toegestaan behalve voor schepen van beperkte hoogte; beide richtingen (D.1a) | 65629 / 65635 |
| a, b or c | **two yellow** | h. idem, doorvaart in de andere richting niet toegestaan (D.1b) | 65630 / 65636 |

The red and green lights of a, b, d, e may be replaced by the A.1 / E.1 boards (lid 5). Around the
bridge: **B.5** marks where to stop (lid 3b: wait before B.5), **A.7** often forbids mooring
other than on the wachtplaats, overtaking is forbidden near the bridge (lid 3c), VHF listen if
fitted. Request an opening with **lang-kort-lang** (lid 6). A lelievlet with its mast down fits
under most closed bridges with a yellow light: that is exactly case g/h.

### Lock (art. 6.28a, G.4)

| Invaart lights | Meaning |
|---|---|
| two red above each other | a. invaren verboden, sluis wordt niet bediend |
| one red | b. invaren verboden, sluis wordt bediend |
| red above green | c. verboden, aanstonds toegestaan |
| one green | d. invaren toegestaan |
| two green above each other | e. toegestaan, sluis aan beide zijden open, niet bediend |

Uitvaart: one red = verboden, one green = toegestaan; placed at the stop line, visible only from
inside the chamber [RST §4.2]. Lock with a movable bridge without its own signals (G.4.2): red
over green at the lock = entry soon; green plus **two yellow** under the bridge = enter/leave the
lock and pass under the closed bridge; green with the bridge open = lock and bridge allowed.
Multi-chamber locks may use **D.3c** (white fixed + white isophase light: go toward the isophase
one, the chamber ready first) [RST].

### Weir (art. 6.27, G.3)

Two red above each other = weir closed; one red = no passage; green each side = passage allowed;
a bridge over the weir carries A.1 / D.1a / D.1b boards over its openings. E.3 warns ahead
(with an F.1 distance plate, placed ≈ 5 × the design ship length ahead [RST]).

### Advance warnings

E.4a/E.4b ferries, E.2 power line and E.3 weir always get an **F.1 distance plate** on top; B.6 can
carry "ingaande na 800" (F.1). A.2/A.4/C.3 with an F.3 plate ("brugbouw") are placed 300–500 m
before works [RST §2.4.4].

## Licences for the Commons files

- **Public domain**: the Dutch "Nederlands scheepvaartteken A.x" set (Bouwe Brouwer, A.1–A.7 only),
  the German "BinSchStrO" set (official German drawings, PD as amtliches Werk), and the 171 PNG
  mirrors "Verkeerstekens Binnenvaartpolitiereglement - X (nnnnn).png" (the same scans as
  [B7-img], PD as Dutch government work). No attribution needed.
- **CC0**: the "Notice …" set (Ad Verburg). Used for A.20, E.6, E.24.
- **CC BY-SA 3.0**: the Polish "POL Znak Żeglugowy …" set (Orem) — the only free vectors for A.11
  lights, A.18, A.19, B.10, D.3c, E.12, E.21, E.22. Needs attribution and share-alike: redraw these
  in-house if the viewer's licence cannot carry BY-SA.
- **CC BY-SA 4.0**: LukeLR's light and pair drawings (A.1/E.1 lights, A.10 and D.2 pairs, D.1b).

Nothing free was found for **A.11.1, B.1b, D.3b, E.6.1, E.9d–i, E.10c–f, E.12.1** and the F/G
composites; these are simple enough to draw from the BPR images.

## Uncertain or missing

- The drawings of **E.9d–i and E.10c–f** are approximated in words (thick/thin band layout); trace
  the BPR PNGs for exact geometry.
- Whether the diagonal of A signs is painted over or under the symbol: the Dutch SVGs and most
  drawings put the symbol on top; the scans are ambiguous (A.4 looks the other way round).
- No official RAL/hex values: NEN 3381 was not consulted (paid standard).
- The CWO sign lists come from archived handbooks (2022 Kielboot, 2015 Roeien); current lists are
  behind a login.
- The BPR page announces amendments without an entry-into-force date; re-check bijlage 7 before
  release.
