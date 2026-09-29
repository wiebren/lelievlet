# Navigatieverlichting en dagmerken (BPR hoofdstuk 3, bijlage 3)

Collected 2026-09-28 for the BPR teaching feature: build other vessels with correct lights as 3D
assets, and quiz on "welk schip zie je?". English notes, Dutch terms verbatim. Every rule below was
read in the official text of the BPR version in force from **17-06-2026** (still "t/m heden" on
2026-09-28). The machine-readable counterpart is `lichten.json` (64 configurations).

Trust levels: **officieel** = wetten.overheid.nl text; **officieel-schets** = bijlage 3 drawing
(the BPR says the drawings only clarify, the text prevails, bijlage 3 I.1); **secundair** = CWO /
lesboeken; **afgeleid** = my own reasoning from the text, marked as such.

## Sources

| Tag | Document | URL | Retrieved | Trust |
|---|---|---|---|---|
| [BPR] | Binnenvaartpolitiereglement, BWBR0003628, geldend van 17-06-2026 t/m heden. Local: `BPR_BWBR0003628_2026-06-17.html` (text: `BPR_2026-06-17.txt`) | <https://wetten.overheid.nl/BWBR0003628/2026-06-17> (`/BWBR0003628/` redirects there) | 2026-09-28 | officieel |
| [B3] | BPR bijlage 3 "Optische tekens van schepen": 75 schetsen, 138 PNG files in `bijlage3/` (named by their wetten.nl image name; map below) | `https://wetten.overheid.nl/afbeelding?toestandid=BWBR0003628/2026-06-17_0&naam=<nnnnn>.png&schalen=nee` | 2026-09-28 | officieel-schets |
| [VB] | Vaststellingsbesluit BPR (BWBR0003627) art. 2 — where the BPR applies. Local: `Vaststellingsbesluit_BPR.txt` (downloaded by another agent) | <https://wetten.overheid.nl/BWBR0003627/> | 2026-09-28 | officieel |
| [ESTRIN] | ES-TRIN 2025/1 (CESNI), art. 7.05. Local: `es_trin_2025_en.pdf` | <https://www.cesni.eu/wp-content/uploads/2024/11/ES_TRIN_2025_signed_en.pdf> | 2026-09-28 | officieel (EU-standard) |
| [HBO] | CWO Handboek Opleidingen 2005, hfst. 5 Kielboot (KB I–V theorie-eisen). Already in the library: `../parts/caynoya_officiele_CWO_eisen_kielboot_1_2_3.pdf` | <https://www.cay-noya.nl/downloads/zeeverkenners/officiele_CWO_eisen_Kielboot_1_2_3.pdf> | 2026-09-28 | secundair (old, but article-precise) |
| [ZB25] | CWO eisen Zwaardboot 2-mans 2025 (via Zeilschool Zuidlaardermeer). Local: `cwo/zeilschoolzuidlaardermeer_Eisen_Zwaardboot_2025.pdf` (another agent) | — | 2026-09-28 | secundair |
| [KATR] | Katwijkse Zeeverkenners, CWO roei-instructieboek, H4 "Lichten, seinen & termen" p. 29–33. `../parts/katwijkse_zeeverkenners_cwo_roei_instructieboek.pdf` | see `../parts/SOURCES.md` | — | secundair (contains an error, see below) |
| [RPR] | Rijnvaartpolitiereglement, as downloaded by another agent (`RPR.txt`), art. 3.20 — only for the "Waal/Lek" side note | <https://wetten.overheid.nl/BWBR0006923/> | 2026-09-28 | officieel |

Not found / not verified: the numeric lichtsterkte and zichtafstand table (see "Sterkte"), and any
current official CWO roei-eisen that mention lights.

## Definitions (BPR 1.01 C and 3.01a)

Verbatim core of **art. 3.01a**:

| Term | Colour | Arc | Where it shines | Strength |
|---|---|---|---|---|
| **toplicht** | wit | **225°** | "van recht vooruit tot 22°30' achterlijker dan dwars" on each side | **krachtig** (by definition) |
| **boordlichten** | groen = stuurboord, rood = bakboord | **112°30'** each | each on its own side, recht vooruit → 22°30' achterlijker dan dwars | **helder** (by definition; small ships may use gewoon where the article says so) |
| **heklicht** | wit | **135°** | "67°30' van recht achteruit" to each side | **helder of gewoon** |
| **rondom schijnend licht** | any colour named | **360°** | all round | as named per article |

So toplicht (225°) + heklicht (135°) = 360°, and the two boordlichten together cover the same 225°
as the toplicht. Bijlage 3 schets 1 (`53084.png`) draws exactly these four arcs.

Other definitions in **1.01 C**:
- **’s nachts** = zonsondergang → zonsopgang; **overdag** = zonsopgang → zonsondergang (C 1°, 2°).
  Night lights are also required by day "wanneer het zicht dit vereist" (3.01 lid 4).
- **wit/rood/groen/geel/blauw licht** and **krachtig / helder / gewoon licht**: colours and strength
  "voldoen aan de daaromtrent vastgestelde voorschriften in ES-TRIN" (C 3°, 4°).
- **flikkerlicht** = periodelicht, **50–60** flikkeringen per minuut (C 5°).
- **licht dat snel flikkert** = zwaailicht of periodelicht, **100–150** per minuut (C 6°).
- **klein schip** = romp < 20 m (excluding boegspriet etc.), but never a passagiersschip (> 12
  passagiers), a veerpont on CEMT II+, a vissersschip, a duwbak, or a boat that tows/pushes/assists
  a big ship (A 4°). **zeilschip** = only under sail; "Een schip dat onder zeil vaart en tegelijkertijd
  zijn mechanische middelen tot voortbeweging gebruikt is een motorschip" (A 15°).
- **stilliggend** = ten anker of gemeerd; **varend** = niet ten anker, gemeerd noch vastgevaren (D 3°, 4°).

General rules worth teaching:
- Lights must be steady ("gelijkmatig") unless stated otherwise (3.02 lid 1).
- Only approved lantaarns (keurmerk/certificaat) whose arc, colour and strength match the BPR
  (3.02 lid 2). **Exception 3.02 lid 3**: lights of *stilliggende* ships without an engine need not
  meet these rules, "Bij goed zicht en tegen een donkere achtergrond dient de zichtbaarheid daarvan
  echter ongeveer **1000 m** te bedragen." — the only visibility distance in the BPR itself.
- Noodlichten when a light fails: krachtig may become helder, helder may become gewoon (3.06).
- No other lights/signs that can be confused with BPR signs; no dazzling (3.05, 3.07).
- Under a bridge, signs may be carried lower (3.01 lid 5).

### Sterkte (strength) and range — not in the BPR

The BPR delegates to ES-TRIN. ES-TRIN 2025/1 art. 7.05 lid 1 only says navigation lights "shall bear
the approval mark prescribed by Directive 2014/90/EU" (Marine Equipment Directive); its numeric
intensity table is therefore not in ES-TRIN itself. A web summary (not verified against a primary
text) gives ordinary ≈ 1 NM, bright ≈ 2–3 NM, strong ≈ 5–6 NM nominal range. **Treat as unverified**;
for the 3D viewer, only the ranking krachtig > helder > gewoon matters.

### Dagmerken sizes (art. 3.03, 3.04)

| Shape | Minimum size (groot schip) |
|---|---|
| cilinder | hoogte **80 cm**, middellijn **50 cm** |
| bol | middellijn **60 cm** |
| kegel | hoogte **60 cm**, grondvlak **60 cm** (grondvlak not more than hoogte) |
| ruit | verticale middellijn **80 cm**, horizontale **50 cm** |
| bord / vlag | ≥ 1 × 1 m; wimpel 1 m long, ≥ 0,50 m high at one end |

Kleine schepen may use smaller shapes "die in verhouding staan tot de grootte van het kleine schip",
as long as they stay clearly visible (3.03 lid 4, 3.04 lid 4). Shapes may be replaced by objects that
look the same from a distance, e.g. a folding ball (3.04 lid 1). No colour faded, no dirt (lid 2).

Bijlage 3 symbols (`15407`–`68744.png`): filled circle = rondom schijnend; circle with a sector =
limited arc (a dot in the middle = not visible to the observer); dashed ring = flikkerlicht;
**dashed circle = facultatief licht**.

## Configurations

For each: article · lights by night · dagmerk by day · how to recognise it · what it means for the
lelievlet. The 3D-relevant position details are in `lichten.json`. Right of way is from BPR 6.04/6.17
(tegengestelde en kruisende koersen) unless noted: **first** the stuurboordswal rule (whoever does not
keep to the starboard side of the vaarwater gives way), **then** klein geeft voorrang aan groot, and
among small ships motor → zeil and spierkracht, spierkracht → zeil (6.04 lid 2, 3, 8; 6.17 lid 2, 3, 9).

### Motorschepen

**Groot motorschip, alleenvarend — 3.08 lid 1** (schets 2). Toplicht on the voorschip in the
lengte-as, ≥ 5 m (≥ 4 m if ≤ 40 m long); boordlichten ≥ 1 m lower, at most 1 m inside the ship's side;
heklicht on the achterschip. Optional second, higher toplicht aft (lid 2, schets 3). No dagmerk.
*Recognise*: one or two white lights high up with red and/or green below; from behind only one white.
Two tophlichten one behind the other show the heading (range lights). *Lelievlet*: groot schip → you
give way unless you keep to your stuurboordswal and it does not; keep well clear anyway.

**Snel schip — 3.08 lid 4** (schets 4a). A groot motorschip > 40 km/h (1.01 A 5°): its normal lights
plus **two yellow krachtige rondom lights that flash fast**, vertically ~1 m apart, **by day and by
night**. *Lelievlet*: a snel schip must give way to all other ships (6.02) — but it is fast; stay
predictable.

**Groot motorschip dat wordt geassisteerd — 3.08 lid 3**: by day a **gele bol** on the voorschip.

**Groot schip onder zeil én motor — 3.08 lid 5**: by day a **zwarte kegel punt omlaag**, as high as
possible. By night it simply shows motorschip lights (it *is* a motorschip, 1.01 A 15°).

**Klein motorschip — 3.13 lid 1** (schetsen 22–24). Three options:
- (a) toplicht (**helder**, not krachtig) *at the same height as* the boordlichten and ≥ 1 m ahead of
  them; boordlichten (gewoon allowed) side by side in one line; heklicht aft.
- (b) toplicht ≥ 1 m *above* the boordlichten; boordlichten may be combined in one lantern on the bow;
  heklicht aft.
- (b 3°) as (b) but the toplicht **and** heklicht replaced by **one wit rondom schijnend licht** — the
  typical sloep/speedboat: red/green combi on the bow + a white all-round light on a stick.

**Klein open motorschip < 7 m, max 13 km/h — 3.13 lid 2** (schets 25): may show only **one wit gewoon
rondom** light instead. *Recognise*: a single white light — indistinguishable from a rowing boat, a
small sailing boat < 7 m, or a small boat at anchor. Good quiz trap.

**Klein motorschip dat alleen kleine schepen sleept — 3.13 lid 3**: ordinary klein-motorschip lights
(so a rubberboot towing vletten shows no towing lights). *Lelievlet*: klein motorschip must give way
to a lelievlet under sail or oars (6.04 lid 8, 6.17 lid 9), unless the stuurboordswal rule decides.

### Zeilschepen

**Groot zeilschip — 3.12** (schets 20). Boordlichten (gewoon allowed) + heklicht + **two rondom
lights at or near the masthead, rood boven groen**, ≥ 1 m apart (helder or gewoon). No toplicht.
*Recognise*: red above green high up (traditional ezelsbruggetje "rood over groen, zeilschip gaat
schoon" — folklore, not in the BPR), with sidelights
below. *Lelievlet*: groot schip → lelievlet gives way when neither keeps stuurboordswal (6.04 lid 3,
6.17 lid 3); between two big sailing ships the tack rules apply.

**Klein zeilschip — 3.13 lid 5** (schetsen 27–29). One of three:
1. boordlichten side by side or in one lantern in the lengte-as at or near the bow (gewoon allowed) +
   heklicht aft (schets 27);
2. boordlichten and heklicht **united in one lantern (driekleurenlantaarn)** "aan of nabij de top van
   de mast waar deze het best kan worden gezien", gewoon allowed (schets 28). **No length limit** —
   allowed for every klein zeilschip (< 20 m), including < 7 m. (Unlike COLREG, the BPR has no 20 m
   upper limit here because a klein schip is < 20 m by definition.)
3. **only if the ship is < 7 m**: a **wit gewoon rondom schijnend licht** "op een zodanige hoogte, dat
   het van alle zijden zichtbaar is", plus: "bij het naderen van een ander schip, bij gevaar voor
   aanvaring, een tweede wit gewoon licht tonen om de aandacht te trekken" (schets 29 draws the masthead
   light and a dashed = facultatief light aft).

**Klein schip onder zeil én motor — 3.13 lid 7** (schets 21): by day a **zwarte kegel met de punt naar
beneden**, zo hoog mogelijk. By night it is a klein motorschip → toplicht/rondom per 3.13 lid 1.
*Recognise*: a sailing yacht with a cone = treat it as a motorboat (it gives way to you under sail).

### Spierkracht

**Klein schip door spierkracht voortbewogen — 3.13 lid 6** (schets 30): "moet des nachts een **wit
gewoon rondom schijnend licht** voeren." That is the whole rule — the current text is a plain
obligation to *carry* the light (no "show in time" option as in COLREG 25(d)). No position given;
schets 30 draws it on a short pole on the achterschip. Rowing and wrikken are both spierkracht.

### Slepen, duwen, koppelen

**Sleepboot — 3.09 lid 1** (schets 5): **two toplichten** vertically ~1 m apart, boordlichten, and a
**geel heklicht** (not white). Day: a **gele cilinder** with a black and a white band at top and
bottom (white at the ends). With several tugs not in line: **three** toplichten each (lid 2, schets 6).
**Gesleept groot schip — lid 3**: **wit helder rondom** ≥ 5 m (4 m ≤ 40 m); a length > 110 m shows two
(fore and aft); by day a **gele bol**. **Last length — lid 4**: also a heklicht.
*Recognise*: two whites stacked + yellow stern light = tow; behind it, white all-round lights on the
barges. *Lelievlet*: **never cross between tug and tow** (6.15); the tow line is invisible at night.

**Klein schip dat wordt gesleept of langszij wordt meegevoerd — 3.13 lid 4** (schets 26): one **wit
gewoon rondom** (not the bijboot of a ship). Applies to a lelievlet on tow.

**Duwstel — 3.10 lid 1** (schetsen 13–14): **three toplichten in a triangle** on the front barge (top
≥ 5 m, lower two ~1,25 m apart ~1,10 m lower), a toplicht on every other barge visible from ahead
(~3 m lower); boordlichten near the duwboot; **three heklichten side by side** on the duwboot.
Geassisteerd: the three heklichten are yellow, by day a gele bol (lid 2). A duwstel ≤ 110 × 12 m counts
as one motorschip (lid 4). *Recognise*: white triangle ahead = long, heavy, slow to stop, big blind
spot in front.

**Gekoppeld samenstel — 3.11 lid 1** (schetsen 17–18): a toplicht on each ship (a non-motor may show
a wit helder rondom instead, not higher), boordlichten on the outer sides, a heklicht on each ship.
So: **two toplichten side by side**. > 140 m counts as a duwstel (lid 4).

### Veerponten

**Niet-vrijvarende veerpont (kabel/gierpont) — 3.16 lid 1** (schets 37): **wit helder rondom** ≥ 5 m
(lower if ≤ 15 m) with **groen helder rondom ~1 m above it**. Same lights at its aanlegplaats (3.22
lid 1). The bovenstroomse drijver of a gierpont: wit helder rondom ≥ 3 m (lid 2).
**Vrijvarende veerpont — 3.16 lid 3** (schets 39): the same green-over-white **plus boordlichten and
heklicht**. *Recognise*: "groen boven wit" all round = veerpont. *Lelievlet*: **a klein schip must give
way to a departing, turning or crossing veerpont** (6.23 lid 3); never pass close ahead of a kabelpont
(cable).

### Gevaarlijke stoffen (ADN)

**3.14** (schetsen 31–36), additional to the normal lights, visible all round:
- **1 blauw licht / 1 blauwe kegel punt omlaag** — brandbare stoffen (lid 1); by day may also be one
  cone fore and one aft ≥ 3 m.
- **2 blauw / 2 kegels** vertical ~1 m — voor de gezondheid schadelijke stoffen (lid 2).
- **3 blauw / 3 kegels** — ontplofbare stoffen (lid 3).
In a duwstel/gekoppeld samenstel the duwboot/motorschip carries them (lid 4). Blue lights at least
gewoon strength (lid 8). Also stilliggend (3.21). *Lelievlet*: with 2 or 3 cones/lights, no ship may
stay within **50 m** except while passing (6.18 lid 2).

### Stilliggen

**Groot schip gemeerd — 3.20 lid 1** (schets 43): one **wit gewoon rondom** at the vaarwater side,
≥ 3 m (or two, fore and aft). **Groot schip geankerd, not at the bank — lid 2** (schets 44): two wit
gewoon rondom, fore ≥ 4 m, aft ≥ 2 m and ≥ 2 m lower; by day a **zwarte bol** on the voorschip.
Duwstel geankerd: a white on each ship, black balls on duwboot and front outer barges (lid 3).

**Klein schip stilliggend — 3.20 lid 4** (schets 46 night `53154.png`, day `68721.png`): see "De
lelievlet zelf" for the exact wording.

**Anker dat een gevaar kan vormen — 3.26 lid 1, 3** (schets 58): a second **wit gewoon rondom** ~1 m
straight below the anchor light; the anchor itself marked by a **gele boei met radarreflector**.
*Lelievlet*: stay off the anchor side; don't sail over a yellow buoy near a ship.

Exemptions for all of 3.20 (lid 5): in a vaarweg(deel) designated by the authority; where navigation
is impossible or forbidden; moored to the bank and sufficiently lit by shore lighting; on a "veilige
ligplaats"; or on a ligplaats the authority has designated and where it has allowed omitting the signs.

### Onmanoeuvreerbaar, vastgevaren, werk, golfslag

**Onmanoeuvreerbaar — 3.18** (schetsen 41a/b): "zo nodig": night **a red light swung to and fro — for
a klein schip this may be white** — or **two rode gewone rondom** vertical ~1 m; day **a red flag
swung to and fro** (or a red board) or **two zwarte bollen** vertical ~1 m. Replaces or supplements
the sound signal of bijlage 6 A. *Lelievlet*: usable by the lelievlet itself (e.g. rudder lost, mast
down in a fairway): swing a white torch at night, a red flag/cloth by day.

**Vastgevaren of gezonken — 3.25 lid 2** (schetsen 56–57): the signs of 3.25 lid 1 **c and d**: on the
side where passage is free **rood boven wit** rondom (~1 m apart), on the blocked side **rood**; by
day a **rood-wit bord** (or red over white boards) on the free side and a **rood bord** on the blocked
side (flags allowed). 3.01 lid 3 makes 3.21, 3.23, 3.25 and 3.26 apply to a vastgevaren ship; **3.20
(ligplaats light) is not listed**. (For a lelievlet aground in shallow water outside the fairway this is
formally required but in practice rarely done — afgeleid, no source.)

**Drijvend werktuig in bedrijf / schip dat werken uitvoert of peilt — 3.25 lid 1 a, b** (schetsen
54–55): free side **2 groen rondom** vertical (day **2 groene ruiten**); blocked side **rood rondom**
(day **rode bol**). With protection against golfslag (c, d): rood-over-wit / rood, day rood-wit bord /
rood bord. *Lelievlet*: pass on the green side; you may not pass on the red side (6.22 lid 3); slow
down and keep distance on the rood-wit side (6.20 lid 3).

**Beperkt manoeuvreerbaar (varend, werkend) — 3.34** (schetsen 68–69): besides motorschip lights,
**rood-wit-rood** rondom vertical (day **bol-ruit-bol**, black); if one side is blocked, 2 red (day 2
balls) on the blocked side and 2 green (day 2 ruiten) on the free side, ≥ 2 m below. May use the 3.25
signs instead (lid 5).

**Bescherming tegen hinderlijke waterbeweging — 3.29** (schets 63): **rood boven wit** rondom
(helder/gewoon), day a **bord half rood (boven) half wit** or two boards red over white (flags
allowed). Allowed for badly damaged ships, ships working in the fairway, ships unable to manoeuvre,
or with written permission (lid 2). *Lelievlet*: pass slowly and as far away as possible (6.20 lid 2).
A lelievlet cannot make hinderlijke golfslag, but a volgboot can.

### Bijzondere tekens

- **Handhaving (politie, RWS-toezicht), brandweerboot, reddingsvaartuig in actie — 3.27** (schets
  61): **blauw gewoon rondom flikkerlicht** or fast flashing. *Lelievlet*: make room, follow
  instructions (1.19).
- **Werkzaamheden in/nabij het vaarwater (met toestemming) — 3.28**: **geel** rondom flikkerlicht.
- **Varend passagiersschip < 20 m — 3.15** (schets 36a): by day a **gele ruit** (rondvaartboot,
  watertaxi). It is a groot schip by definition (1.01 A 4° b).
- **Recht van voorrang — 3.17**: by day a **rode wimpel** on the voorschip.
- **Stuurboord op stuurboord — 6.04a lid 3** (schets 75): a groot schip that wants to pass starboard
  to starboard shows at stuurboord a **wit helder rondom flikkerlicht** (night; board optional) or a
  **lichtblauw bord with white edge + that flashing light** (day). *Lelievlet*: expect it to cross to
  "your" side; small ships are not bound to answer with the board, keep clear.
- **Loodsboot — 3.36**: **wit boven rood** at the masthead + boordlichten + heklicht; day **blauwe
  vlag met witte L**.
- **Vissersschip (vissend) — 3.37** (schets 72): **groen boven wit** rondom (≥ 1 m apart, white ≥ 2 m
  above the boordlichten) + boordlichten + heklicht, optionally a toplicht aft and higher; day **two
  black cones point to point (diabolo)**. Stilliggend with nets out in current: **wit gewoon rondom +
  gele vlag** at the net (3.24). The BPR vissersschip is never a klein schip (1.01 A 4° d). Do not
  confuse with the veerpont: veerpont = groen boven wit ~1 m apart *without* boordlichten (niet
  vrijvarend); vissersschip = groen boven wit with the white ≥ 2 m above its boordlichten.
- **Duiker te water — 3.38**: seinvlag **A** (stiff replica allowed), lit at night.
- **Mijnenopruiming — 3.35**: 3 groene rondom (mast top + ra-nokken), day 3 black balls; keep 1000 m
  away (6.18 lid 3).
- **Noodtekens — 3.30**: light swung in a circle (night) or flag/object swung in a circle (day);
  vuurpijlen, lichtkogels, parachutelichten, rookbommen, vlammen; or a flag with a ball above or below.
  Medical help: sound ····— (4 kort, 1 lang).
- **Drijvende voorwerpen/inrichtingen** — varend: witte heldere rondom lights outlining it (3.19);
  stilliggend: witte gewone rondom at the fairway side (3.23).
- Hoofdstuk 10 (vaarwegen tussen zee en zeehavens): bovenmaats zeeschip 3 rode rondom / zwarte
  cilinder (10.03); zeeschip met gevaarlijke stoffen rood helder rondom / vlag B (10.04). Out of scope
  for most lelievlet waters.

## De lelievlet zelf

A lelievlet is a **klein schip** (5,6 m < 20 m; 1.01 A 4°), **open**, no engine, **< 7 m**. By the
definitions it is a *zeilschip* when sailing, a *door spierkracht voortbewogen schip* when rowing or
wrikken (sculling), and *stilliggend* at anchor or moored. It never needs a toplicht.

| Mode | Night (’s nachts; also by day in poor visibility, 3.01 lid 4) | Day | Article |
|---|---|---|---|
| **Zeilen** | Choice of: (1) boordlichten on the bow + heklicht aft; (2) **driekleurenlantaarn in de top**; (3) — because it is < 7 m — **one wit gewoon rondom** light, high enough to be seen from all sides, plus a **second white light (torch) shown when approaching another ship if there is risk of collision**. Option 3 is the realistic one for a vlet. | nothing | 3.13 lid 5 |
| **Roeien / wrikken** | **one wit gewoon rondom schijnend licht** (must be carried; no position prescribed; schets 30 has it on a stick aft) | nothing | 3.13 lid 6 |
| **Buitenboordmotor, with or without sail** (rare) | it is then a klein motorschip (1.01 A 15°): full lights of 3.13 lid 1, **or** — being open, < 7 m and (with a small outboard) not faster than 13 km/h — just **one wit gewoon rondom** (3.13 lid 2; afgeleid that a vlet meets "open" and the speed limit) | with sail up: **zwarte kegel punt omlaag**, as high as possible (3.13 lid 7) | 3.13 lid 1, 2, 7 |
| **Op sleeptouw / langszij meegevoerd** | **one wit gewoon rondom** | nothing | 3.13 lid 4 |
| **Geankerd** | **one wit gewoon rondom**, "waar dit het best kan worden gezien" | **zwarte bol** (if not moored to the bank) | 3.20 lid 4 |
| **Gemeerd aan de oever / steiger** | **one wit gewoon rondom** unless an exemption of lid 5 applies | nothing | 3.20 lid 4, 5 |

### Voor anker en aan een ligplaats — exact rule (coordinator's question)

**BPR art. 3.20 lid 4** (verbatim): *"Een klein schip dat stilligt, met uitzondering van de bijboot
van een schip, moet voeren:*
*a. ’s nachts: een wit gewoon rondom schijnend licht waar dit het best kan worden gezien;*
*b. overdag, indien het niet direct of indirect aan de oever gemeerd ligt: een zwarte bol op een
geschikte plaats, op een zodanige hoogte dat hij van alle zijden zichtbaar is."*

- **By day at anchor: yes, a zwarte bol is required** for a klein schip — kleine schepen are *not*
  exempt. "Stilligt" includes ten anker (1.01 D 3°), and "niet direct of indirect aan de oever gemeerd"
  covers anchoring. **Place**: only "op een geschikte plaats, op een zodanige hoogte dat hij van alle
  zijden zichtbaar is" — **no voorschip requirement** (that is only for the groot schip, lid 2 b: "op
  het voorschip"), no minimum height. Schets 46 (day, `68721.png`) draws it hung from the forestay /
  in front of the mast on the foredeck. **Size**: nominally Ø 60 cm (3.04 lid 3 b), but a klein schip
  may use a smaller ball in proportion to the boat, provided it stays clearly visible (3.04 lid 4); a
  folding ball or any object that looks like a ball from a distance is allowed (3.04 lid 1). For a
  lelievlet: practical answer = a small black (folding) ball hoisted in the fokkeval/voorstag or on the
  mast, well above the gunwale — the exact spot is free (afgeleid from the text).
- **By night at anchor**: one **wit gewoon rondom schijnend licht** "waar dit het best kan worden
  gezien" — **no height** is prescribed for a klein schip (contrast groot schip ≥ 3/4 m). "Gewoon"
  (ordinary) strength is enough; **not helder**. Because a lelievlet has no engine, 3.02 lid 3 applies:
  the light need not be an approved (keurmerk) lantern, but must be visible about **1000 m** in good
  visibility against a dark background — a good stormlamp/LED ankerlicht qualifies. (The Vlettenboek
  inventory lists a *stormlamp* as the lamp for lighting/ankerlicht, see `../parts/SOURCES.md` glossary
  [VDM8 p. 15].) Schets 46 (night, `53154.png`) draws the white light on the mast/forestay area.
- **Anchor a danger to navigation** (e.g. long scope into the fairway): additionally a **second wit
  gewoon rondom ~1 m straight below** the anchor light (3.26 lid 1, first dash, which refers to 3.20
  lid 4) and the anchor marked with a **gele boei met radarreflector** (3.26 lid 3).
- **Moored (aan een ligplaats, afgemeerd aan de oever/steiger, or langszij another boat that is
  moored to the bank = "indirect")**: by night still the **wit gewoon rondom** (3.20 lid 4 a); by day
  **no bol** (lid 4 b applies only when not moored to the bank).
- **Exemptions (3.20 lid 5)** — the signs of 3.20 (so also the ball and the anchor light) need not be
  carried by a ship: *"a. dat ligt in een vaarweg of in een gedeelte van een vaarweg, aangewezen door
  de bevoegde autoriteit; b. dat ligt in een vaarweg waar varen niet mogelijk dan wel verboden is; c.
  dat direct of indirect aan de oever gemeerd ligt en vanwege aldaar aanwezige verlichting voldoende
  zichtbaar is; d. dat op een veilige ligplaats ligt; e. dat ligt op een ligplaats die de bevoegde
  autoriteit als zodanig heeft aangeduid en waar hij het achterwege laten van het voeren van de tekens
  heeft toegestaan."* So in a jachthaven box ("veilige ligplaats") or at a lit quay no light is needed.
  **There is no general exemption for anchoring "near the bank" or "outside the vaarwater"**: the BPR
  applies on all public waters open to navigation (Vaststellingsbesluit art. 2), and "vaarweg" is all
  such water (1.01 D 5°). An anchored lelievlet in a quiet bay outside the buoyed channel still needs
  ball + light unless one of a–e applies (d "veilige ligplaats" is undefined — afgeleid: a sheltered
  spot out of all traffic might be argued, not certain).
- Also note: the **bijboot** of a ship is exempt (lid 4) — a lelievlet is not a bijboot.
- Side note, **not BPR**: on the Waal, Lek, Boven-Rijn, Neder-Rijn, Pannerdensch Kanaal (RPR applies,
  Vaststellingsbesluit art. 2 lid 1 a) RPR 3.20 lid 2 requires for a stilliggend klein schip only a wit
  gewoon rondom licht "aan de zijde van het vaarwater" — and no day ball [RPR].

### Right-of-way consequences for the lelievlet

- Under sail it is a *klein zeilschip*: small motorboats and rowing boats give way to it (6.04 lid 8,
  6.17 lid 9); it gives way to all big ships (klein → groot) and to veerponten (6.23 lid 3), always
  subject to the stuurboordswal rule first.
- Under oars/wrikken it is a *spierkracht* ship: gives way to kleine zeilschepen and all big ships;
  kleine motorschepen give way to it.
- At night another skipper sees a lelievlet (sailing or rowing, option 3) as **a single white light**:
  he cannot tell course, type or even if it is moving. Teach: show the second light / shine a torch on
  the sail when a ship approaches.

## CWO scope (secundair)

| Level | Lights / dagmerken required | Source |
|---|---|---|
| Kielboot I, II | **none** — only definitions (groot/klein schip, zeilschip) and give-way rules 6.04 / 6.17 | [HBO] §5.3.4, §5.4.4 (pp. 8, 13) |
| **Kielboot III** | 3.01a a–d (toplicht, boordlichten, heklicht, rondom), 3.05, 3.07, **3.08 lid 1 and lid 5** (motorkegel), **3.09 lid 1–4** (slepen), **3.12**, **3.13**, **3.15** (gele ruit), **3.20**, **3.25**, **3.29**, 3.30, 3.38 | [HBO] §5.5.4 p. 20–21 |
| Kielboot IV | same set, 3.08 in full | [HBO] §5.6.4 p. 31 |
| Kielboot V (≈ Klein Vaarbewijs II level) | practically all of H3: + 3.01 lid 4/5, 3.10, 3.11, 3.14, 3.16, 3.18, 3.21, 3.24–3.28, 3.31–3.34, 3.37, and hoofdstuk 10.03/10.04 | [HBO] §5.7.6 p. 44–46 |
| Zwaardboot 2-mans 1, 2 (2025) | "zes basisregels van het BPR" only | [ZB25] |
| Zwaardboot 2-mans III (2025) | "de belangrijkste tekens, lichten en seinen die in het BPR worden benoemd" (not article-specific) | [ZB25] |
| CWO Roeien (Scouting) | [KATR] H4 teaches 3.13 lid 6 and the klein/groot configurations | [KATR] p. 29–33 |

The 2005 handbook is old but article-precise; the new competency structure (2024, `cwo/`) does not
list articles. Suggested quiz tiers: **basis** (KB III / zwaardboot III) = the KB III set above;
**gevorderd** = KB V set.

Known error in [KATR] p. 29: *"Schepen < 7 meter hebben geen boordlichten!"* — wrong as a rule. Only
the open motorboat ≤ 13 km/h (3.13 lid 2) and the small sailing boat choosing option 3 (lid 5) may
omit them; a closed or faster motorboat < 7 m needs full klein-motorschip lights, and a sailing boat
< 7 m *may* carry boordlichten or a driekleurenlantaarn.

## Quiz scenarios

Viewing geometry (afgeleid from the arcs): seeing **both** red and green = it points (almost) at you;
**green only** = you see its stuurboord side → it moves **from your left to your right**; **red only**
= its bakboord side → it moves **right to left**; **white only (low)** = heklicht, you are behind it
(or a single rondom light: small boat / at anchor).

1. *Je ziet recht vooruit een groen licht met een wit licht erboven.* → Motorschip (groot of klein,
   toplicht + stuurboord-boordlicht), you see its stuurboord side, it crosses from left to right.
   Not a sailing ship (a sailing ship never shows a white toplicht). If it is groot: klein geeft voorrang (6.17 lid 3) unless you keep
   stuurboordswal and it does not.
2. *Rood en groen naast elkaar, twee witte erboven, de achterste hoger.* → Groot motorschip coming
   straight at you (3.08 lid 2). Get out of its way to starboard / stuurboordswal.
3. *Rood boven groen hoog in de mast, eronder een rood licht.* → Groot zeilschip (3.12), bakboord side
   to you, moving right to left.
4. *Groen boven wit, rondom, alleen.* → Niet-vrijvarende veerpont (3.16 lid 1). Give way (6.23 lid 3).
   Same plus boordlichten → vrijvarende veerpont; plus boordlichten, heklicht and white well below the
   green → vissersschip (3.37).
5. *Twee witte lichten boven elkaar, groen eronder, en achteraan een geel licht.* → Sleepboot (3.09).
   Look for the white rondom lights of the tow behind it; never cross between.
6. *Drie witte lichten in een driehoek.* → Duwstel from ahead (3.10).
7. *Eén wit licht, laag, dat niet van richting lijkt te veranderen.* → Heklicht of anything, or a
   rondom light of: a klein zeilschip < 7 m, a roeiboot, a klein open motorboot < 7 m, a gesleept klein
   schip, or a small boat at anchor. Unknown → keep clear, sound/show a light.
8. *Eén blauw licht boven de lichten van een vrachtschip.* → Brandbare stoffen (3.14 lid 1). Two or
   three blue: keep 50 m (6.18 lid 2).
9. *Blauw flikkerend licht.* → Politie / toezicht / brandweer / KNRM in actie (3.27).
10. *Twee gele snel flikkerende lichten boven elkaar, ook overdag.* → Snel schip (3.08 lid 4); it must
    give way, but expect a big wake.
11. *Overdag: een zeiljacht met een zwarte kegel, punt omlaag.* → It is motoring (3.13 lid 7): a
    klein motorschip, it gives way to you under sail.
12. *Overdag: zwarte bol op een klein bootje midden op het meer.* → Klein schip geankerd (3.20 lid 4).
13. *Overdag: werkschip met aan één kant twee groene ruiten en aan de andere kant een rode bol.* →
    Drijvend werktuig in bedrijf (3.25 lid 1 a–b): pass on the green side only (6.22 lid 3).
14. *Rood boven wit, rondom (of een rood-wit bord).* → Wil beschermd worden tegen golfslag (3.29), or
    — with a red light/board on the other side — vastgevaren/gezonken or werkend (3.25). Slow down,
    keep distance.
15. *Een klein schip zwaait 's nachts met een wit licht heen en weer.* → Onmanoeuvreerbaar (3.18); in
    a circle → nood (3.30).
16. *Rood-wit-rood boven elkaar.* → Beperkt manoeuvreerbaar (3.34) — by day bol-ruit-bol.
17. *Wat voer jij in de lelievlet om 22:00 onder zeil? En geroeid? En voor anker?* → wit gewoon
    rondom + tweede licht bij naderen / wit gewoon rondom / wit gewoon rondom (+ zwarte bol overdag).
18. *Overdag, een grote duwbak toont aan stuurboord een lichtblauw bord met wit flikkerlicht.* → It
    wants to pass stuurboord op stuurboord (6.04a).

## Bijlage 3: sketch → image file

`bijlage3/<name>.png`, first file = night (Lichten), second = day (Dagtekens) where two are given.

| Schets | Article | Files |
|---|---|---|
| symbols | legend | 15407 rondom · 15408 beperkte boog · 15409 flikker · 68742 facultatief · 15410 vlag/bord · 68741 wimpel · 15411 bol · 15412 cilinder · 68743 kegel · 15414 ruit · 68744 radarreflector |
| 1 | 3.01a arcs | 53084 |
| 2, 3 | 3.08 lid 1, 2 | 53087, 53088 |
| 4, 4a | 3.08 lid 3, 4 (snel schip) | 68709 68710; 111868 111869 |
| 5–12 | 3.09 slepen | 53090 53092; 53094 53097; 53096 53098; 53099 53100; 53102 53104; 53105 53106; 53107 53108; 68711 |
| 13–16 | 3.10 duwstellen | 53109; 53110; 53112 53113; 53111 |
| 17–19 | 3.11 gekoppeld | 53114; 53115; 68712 68713 |
| 20 | 3.12 groot zeilschip | 68740 |
| 21 | 3.08 lid 5 / 3.13 lid 7 kegel | 53126 53127 |
| 22–26 | 3.13 lid 1–4 klein motor / gesleept | 53117; 53118; 53119; 68714; 53120 |
| 27–29 | 3.13 lid 5 klein zeilschip | 53121; 53122; 53123 |
| 30 | 3.13 lid 6 spierkracht | 53124 |
| 31a–36 | 3.14 gevaarlijke stoffen | 53128 53130; 53132; 53135 53133; 53136; 53137 53138; 53139 53140; 53141 53142; 53143 53144 |
| 36a | 3.15 gele ruit | 111870 |
| 37–39 | 3.16 veerponten | 53146; 53147; 53148 |
| 40 | 3.17 rode wimpel | 53149 |
| 41a/b | 3.18 onmanoeuvreerbaar | 53150 53151; 68715 68716 |
| 42 | 3.19 | 53152 |
| 43–46 | 3.20 gemeerd / geankerd groot / duwstel / **klein** | 53153; 68717 68718; 68719 68720; **53154 68721** |
| 47–49 | 3.21 | 53155 53156; 53157 53158; 53159 53160 |
| 50–53 | 3.22–3.24 | 53161; 53162; 53163; 68722 68723 |
| 54–57 | 3.25 | 53166 53168; 53169 53171; 53172 53173; 53174 53175 |
| 58–60 | 3.26 ankers | 53176 53177; 53178 53179; 53180 53181 |
| 61–64 | 3.27–3.30 | 53182 53183; 53184 53185; 53186 53187; 68724 68725 272745 |
| 65–67 | 3.31–3.33 | 272766 272768; 272771 272773; 53194 53195 |
| 68–74 | 3.34–3.38 | 68726 68732; 68727 256272; 68728 68734; 68729 68735; 68730 68736; 68738 |
| 75 | 6.04a blauw bord | 53196 53197 |

## `lichten.json`

Array of `{ id, naam, artikel, schip, lichten: [{ kleur, soort, boog_graden, plaats, aantal, sterkte }],
dagmerk: [{ vorm, kleur, aantal, plaats }] | null, relevant }`. `soort` is one of `toplicht`,
`boordlicht`, `heklicht`, `rondom`, `flikker`; `boog_graden` 225 / 112.5 / 135 / 360 (null for a
hand-swung or hand-shown light). `sterkte` is the BPR word (`krachtig`, `helder`, `gewoon`, `helder of
gewoon`, `gewoon toegestaan`, or null when the article names none). A dagmerk-only sign (gele ruit,
rode wimpel, vlag A) has `lichten: []`. `relevant: false` marks configurations a lelievlet crew will
hardly meet (assisting, mijnenopruimer, loodsboot, zeegaand bovenmaats). Entries `lelievlet_*` give
the lelievlet's own options per mode.

## Uncertain / missing

- Numeric lichtsterkte / zichtafstand for gewoon/helder/krachtig: not in BPR or ES-TRIN 2025 text
  (delegated to the Marine Equipment Directive); the only BPR figure is ~1000 m (3.02 lid 3).
- "Veilige ligplaats" (3.20 lid 5 d) is not defined in the BPR.
- Whether a lelievlet with an outboard counts as "open" under 3.13 lid 2 (afgeleid: yes).
- No current (2024+) CWO document lists lights per article; the KB table is from the 2005 handbook.
- Bijlage 3 images all downloaded but only schetsen 1, 29, 30, 46 were viewed; captions were matched
  from the HTML table order.
