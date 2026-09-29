# BPR — voorrangsregels and vaarregels for a lelievlet crew

Collected 2026-09-28 for the BPR teaching feature of the viewer. Notes in English, Dutch terms and
quotes verbatim. Article numbers were read from the official consolidated text, not from memory
or course material. The scenarios are in `voorrang.json` as data.

A lelievlet (5,60 m) is always a **klein schip** (< 20 m, art. 1.01 A 4°). Which *kind* of small
ship it is depends on what moves it at that moment:

| Lelievlet doing | BPR category | Why |
|---|---|---|
| sailing, no motor running | **klein zeilschip** | "uitsluitend door middel van zijn zeilen" (1.01 A 15°) |
| rowing, wrikken, bomen | **klein door spierkracht voortbewogen schip** | 6.04 lid 8, 6.17 lid 9 |
| sails up **and** outboard running | **klein motorschip** + black cone by day | 1.01 A 15° second sentence, 3.13 lid 7 |
| outboard only | **klein motorschip** (open, < 7 m, ≤ 13 km/h in practice) | 1.01 A 2°, 3.13 lid 2 |

## Sources

| Key | Document | URL | Version / date | Trust |
|---|---|---|---|---|
| [BPR] | Binnenvaartpolitiereglement, **BWBR0003628** | <https://wetten.overheid.nl/BWBR0003628/2026-06-17> | "Geldend van 17-06-2026 t/m heden", consulted 2026-09-28. The page notes *"Wijziging(en) zonder datum inwerkingtreding aanwezig"*: amendments already published but not yet in force. Check again before release. | **Official**, primary |
| [VB] | Vaststellingsbesluit Binnenvaartpolitiereglement, **BWBR0003627**, art. 2 (where the BPR applies) | <https://wetten.overheid.nl/BWBR0003627/2025-01-01> | geldend van 01-01-2025, consulted 2026-09-28 | **Official** |
| [RPR] | Rijnvaartpolitiereglement 1995, **BWBR0006923** (only for the differences listed below) | <https://wetten.overheid.nl/BWBR0006923/2026-06-17> | geldend van 17-06-2026, consulted 2026-09-28 | **Official** |
| [KAT] | CWO Zeil Instructieboek, Katwijkse Zeeverkenners, 2e druk 2008 | `../cwo_zeil_instructieboek_katwijkse_zeeverkenners.pdf`, see `../book/NOTES.md` | 2008, so older than several BPR changes | Secondary, group-made. Good for scenarios and level mapping. It has errors, listed below. |
| [VDJS] | Varen doe je Samen, "Ken de voorrangsregels" | <https://www.varendoejesamen.nl/kennis/ken-de-voorrangsregels> | read 2026-09-28 | Secondary, but a Rijkswaterstaat-backed campaign. Used only to confirm the colloquial "over stuurboord". |
| [CWO] | CWO requirements (see **CWO scope**) | see that section | | see that section |

Local files, not tracked by git: `BPR_BWBR0003628_2026-06-17.html` (the full page),
`BPR_2026-06-17.txt` (plain-text extraction with the site boilerplate removed; the extraction
sometimes drops the last letter of a line, e.g. "reglemen", but the HTML is correct),
`Vaststellingsbesluit_BPR_BWBR0003627.html`/`.txt`, `RPR_BWBR0006923.html`, `RPR.txt`.
`bijlage6/*.png` holds the official images of the sound signals, because Bijlage 6 gives the
signal patterns **only as images**. `bijlage6/list.txt` maps each image to its signal.

## 1. Where the BPR applies ([VB] art. 2)

The BPR applies on *"de openbare wateren in het Rijk, die voor de scheepvaart openstaan"*,
**except**:

- a. Boven-Rijn, Waal, Pannerdensch Kanaal, Neder-Rijn and Lek, and b. the harbours, loading
  places and **recreatieplassen** along them (except the voorhavens of locks). The **RPR**
  applies there.
- c. Westerschelde with its mouths; d. Kanaal van Terneuzen with the buitenvoorhavens at
  Terneuzen. Separate Scheepvaartreglement Westerschelde (not collected).
- e. Eemsmonding (Eems-Dollardverdrag). Separate Scheepvaartreglement Eemsmonding (not collected).
- f. the Dutch parts of the Gemeenschappelijke Maas.
- g. everything **seaward of the line** described in lid 2: along the northern coasts of the Wadden
  islands, the coast of Holland, the Haringvliet, Brouwers and Oosterschelde dams, and Walcheren.
  So the **Waddenzee, IJsselmeer, Markermeer, Zeeuwse meren and Oosterschelde are BPR**. The
  North Sea is **COLREGs** (Dutch "BVA").
- Lid 3: art. 1.01 A 16°–18°, 1.09 lid 1a, 8.01–8.08, 9.04 and 9.05 of the BPR *also* apply on
  the RPR rivers of item a.

## 2. Definitions

All from BPR art. 1.01 unless stated otherwise.

| Term | Article | Wording (short quote or paraphrase) |
|---|---|---|
| schip | 1.01 A 1° | "elk vaartuig … gebruikt of geschikt om te worden gebruikt als een middel van vervoer te water" |
| motorschip | 1.01 A 2° | "schip dat gebruik maakt van zijn mechanische middelen tot voortbeweging" (except a towed/pushed ship using its engine only to steer better) |
| groot schip | 1.01 A 3° | "schip niet zijnde een klein schip" |
| **klein schip** | 1.01 A 4° | "schip waarvan de lengte minder dan 20 m bedraagt", length measured over the hull without boegspriet, papegaaistok or trimvlak, **except**: a. a ship that tows, assists, pushes or carries alongside a *groot* schip; b. a passagiersschip; c. a veerpont on a CEMT class II+ waterway; d. a vissersschip; e. a duwbak. These exceptions count as **groot**, whatever their length. In chapter 6, a tow or combination made up only of small ships and an amfibievoertuig also count as klein (6.01 lid 2). |
| snel schip | 1.01 A 5° | "groot motorschip, dat met een snelheid van meer dan 40 km per uur ten opzichte van het water kan varen" |
| passagiersschip | 1.01 A 6° | "schip dat meer dan 12 passagiers mag vervoeren" |
| veerpont | 1.01 A 14° | ship running a ferry service across the waterway, **designated as such by the authority** |
| **zeilschip** | 1.01 A 15° | "schip dat uitsluitend door middel van zijn zeilen wordt voortbewogen. Een schip dat onder zeil vaart en tegelijkertijd zijn mechanische middelen tot voortbeweging gebruikt is een motorschip" |
| zeilplank | 1.01 A 16° | "klein zeilschip voorzien van een vrij bewegende zeiltuigage, … op een in alle richtingen draaibare mastvoet" |
| snelle motorboot | 1.01 A 17° | "klein schip dat … sneller dan 20 km per uur ten opzichte van het water kan varen" |
| waterscooter | 1.01 A 18° | snelle motorboot built to be ridden "skiënd" |
| **door spierkracht voortbewogen schip** | 6.04 lid 8, 6.07 lid 8, 6.17 lid 8–9, 3.13 lid 6 | **Not defined** in 1.01; the term is only used in these rules. 9.04 lid 4 adds "bestemd om door spierkracht te worden voortbewogen en ook daadwerkelijk als zodanig worden gebruikt". |
| korte stoot / lange stoot | 1.01 C 7° | "korte stoot: geluidssein durende ongeveer 1 seconde"; "lange stoot: … ongeveer 4 seconden"; about 1 s between blasts |
| reeks zeer korte stoten | 1.01 C 8° | "reeks van tenminste 6 stoten, elk durende ongeveer ¼ seconde", with about ¼ s between them |
| 's nachts / overdag | 1.01 C 1°–2° | sunset to sunrise / sunrise to sunset |
| stilliggend / varend | 1.01 D 3°–4° | "ten anker of gemeerd" / "niet ten anker of gemeerd liggend noch vastgevaren" |
| vaarweg / vaarwater | 1.01 D 5°–6° | vaarweg: "elk voor het openbaar verkeer met schepen openstaand water"; vaarwater: "gedeelte van een vaarweg dat feitelijk door de scheepvaart kan worden gebruikt" |
| naderen op tegengestelde koersen | 6.01 lid 1a | "op koersen die recht of vrijwel recht aan elkaar tegengesteld zijn" |
| **oplopen** | 6.01 lid 1b | "naderen … uit een richting van meer dan 22°30´ achterlijker dan dwars van dat schip" |
| voorbijlopen | 6.01 lid 1c | the manoeuvre that follows oplopen "totdat de schepen geheel vrij van elkaar zijn" |
| **kruisende koersen** | 6.01 lid 1d | neither head-on nor overtaking; "in geval van twijfel wordt er geacht sprake te zijn van naderen op tegengestelde koersen dan wel oplopen" |
| vertrekkend schip | 6.01 lid 1e | "schip dat gaat varen nadat het heeft stilgelegen of was vastgevaren" |
| opvarend / afvarend | 6.01 lid 1f–g | towards / away from the sources of the river |
| engte | 6.07 lid 1 | stretch "waar het vaarwater niet voldoende ruimte biedt voor het elkaar voorbijvaren van twee schepen"; always an engte: sign A.4/A.4.1, an open bridge opening, and a lock or weir open at both ends with two green lights (E.1). 6.24 lid 1: also a bridge or weir opening that is too narrow. |
| beroepsvaart / pleziervaart | — | **Not BPR terms.** The BPR only distinguishes groot/klein and motor/zeil/spierkracht. "Klein wijkt voor groot" is often explained as "beroepsvaart gaat voor" ([KAT] p27), but a 25 m yacht is groot and a 15 m passenger boat for 20 people is groot as well. |
| bakboord / stuurboord, loef / lij | — | **Not defined in the BPR.** The RPR defines loef: "Loef is aan de zijde tegenover het gezette grootzeil" ([RPR] 6.02a lid 4). |
| **"over stuurboordsboeg" / "over bakboordsboeg"** | 6.04 lid 5–6, 6.07, 6.17 lid 5–6 | Not defined, but fixed by 6.17 lid 6c: the lijwaartse schip "dat over stuurboordsboeg zeilt" and cannot see the other's boeg must give way. That mirrors COLREG rule 12(a)(iii), the ship with the **wind on its port side**. So **over stuurboordsboeg = wind van bakboord = giek/grootzeil over stuurboord**. The colloquial term is "over stuurboord zeilen" ([VDJS]); [KAT] says "zeil over SB". **The one over stuurboordsboeg gives way.** (The brief's "bakboord-schoten wijkt" is not a BPR expression. Teach "wind van bakboord / giek over stuurboord wijkt".) |

## 3. Rules

### 3.1 General principles

- **1.04 Voorzorgsmaatregelen.** Even without an explicit rule, the schipper must take every
  precaution that "goede zeemanschap" or the circumstances require, to prevent danger to life,
  damage, and danger to "de veiligheid of het vlotte verloop van de scheepvaart".
- **1.05 Afwijking van het reglement.** The schipper **must** depart from the rules "volgens
  goede zeemanschap" when the particular circumstances require it for safety.
- **1.02 / 1.03.** The schipper is responsible. A crew member who is steering and "tijdelijk
  zelfstandig de koers en de snelheid … bepaalt" is responsible as well (1.03 lid 3).
- **1.09 lid 1: minimum age at the helm.** 18 for a snelle motorboot. 16 for a groot schip, for
  most small motorboats, and for a zeilschip of 7 m or more. 12 for an open motorboat under 7 m
  that cannot exceed 13 km/h. **No minimum age for a zeilschip under 7 m or a rowing boat**, so a
  lelievlet may be steered by any competent crew member. The rule still requires "een daartoe
  bekwaam persoon".
- **5.02 Prioriteit.** "een verkeersteken heeft prioriteit boven een gedragsregel. Een
  verkeersaanwijzing heeft prioriteit boven een gedragsregel en een verkeersteken", without
  prejudice to 1.04/1.05. Order: **aanwijzing (police, bridge or lock keeper) > sign > rule.**
- **6.02 Snelle schepen.** "Een snel schip is verplicht aan andere schepen voorrang te verlenen."
  This is the only case where a *groot* schip gives way to a small one purely by category.
- **6.03 Algemene beginselen.**
  - lid 1: meeting or overtaking only "indien het vaarwater voldoende ruimte biedt".
  - lid 3: a ship whose course already avoids all danger must not change course or speed so
    that a new danger arises.
  - lid 4, **the give-way ship**: must "door tijdige koerswijziging of door snelheidsverandering"
    leave the other the room it needs, "moet … vermijden dat het voor het andere schip overloopt",
    and "mag niet verlangen dat het andere schip te zijnen gerieve koers of snelheid wijzigt".
  - lid 5, **the stand-on ship**: "moet … zijn koers en zijn snelheid behouden". But when it is so
    close "dat aanvaring door een handeling van dat schip alleen niet kan worden vermeden, moet het
    de maatregelen nemen die het beste kunnen bijdragen om aanvaring te voorkomen".
  - lid 6–7, **medewerking verlangen**: a ship entitled to ask for cooperation must still not
    force others into sudden, large changes. The other ship must cooperate "voorzover mogelijk".

### 3.2 The structure of the right-of-way rules

The key teaching point, which course books tend to hide, is that **every** meeting and crossing
rule (6.04, 6.05, 6.17) is built as a ladder. You take the first step that applies:

1. **Stuurboordszijde.** The ship that does **not** follow the stuurboordszijde of the vaarwater
   gives way to the one that does (6.04 lid 2, 6.17 lid 2). This step comes *before* groot/klein
   and before the zeil rules. It needs a vaarwater with sides, such as a canal, river or buoyed
   channel. On open water it usually does not apply.
2. **Groot vs klein.** If neither follows the stuurboordszijde, *"het kleine schip [moet] voorrang
   verlenen aan het grote schip"* (6.04 lid 3, 6.17 lid 3).
3. **Between two grote schepen, or two kleine schepen,** the type rules apply (below).

Special situations take over from the ladder: keren (6.13), vertrek (6.14), leaving a harbour or
nevenvaarwater (6.16) and veerponten (6.23) are **excluded** from 6.17 (6.17 lid 1). Engtes have
their own list (6.07). Signs (5.02) and the "blauw bord" (6.04a) override it as well.

### 3.3 Kruisende koersen: art. 6.17

| Lid | Ships (neither on stb-zijde, except lid 2) | Who gives way |
|---|---|---|
| 2 | any two ships | the one **not** following the stuurboordszijde of the vaarwater |
| 3 | groot + klein | **klein** |
| 4 | two grote motorschepen, or groot motor + groot zeil | "het schip dat van bakboord nadert" |
| 5 | two grote zeilschepen | as lid 6 |
| **6a** | two **kleine zeilschepen, verschillende boeg** | "het schip dat over stuurboordsboeg ligt" gives way to the one "over bakboordsboeg" |
| **6b** | two kleine zeilschepen, **dezelfde boeg** | "het loefwaartse schip voorrang verlenen aan het lijwaartse schip" |
| **6c** | kleine zeilschepen, **boeg of the other unknown** | "het lijwaartse schip dat over stuurboordsboeg zeilt en niet met zekerheid kan bepalen of het loefwaartse schip over stuurboords- dan wel over bakboordsboeg zeilt" gives way to the loefwaartse schip |
| 7 | two kleine motorschepen | "het schip dat van bakboord nadert" gives way to the one "van stuurboord" |
| 8 | two door spierkracht voortbewogen schepen | the one approaching from bakboord |
| **9** | klein motorschip / klein zeilschip / klein spierkracht (the **rangorde**) | "het motorschip voorrang verlenen aan het andere schip en … het door spierkracht voortbewogen schip voorrang verlenen aan het zeilschip" |

**Rangorde among small craft:** motor < spierkracht < zeil. A lelievlet under sail stands on for
rowing and motor boats. Rowing, it stands on only for motor boats. With the outboard on it is a
motor boat and gives way to both. There is **no** "van stuurboord gaat voor" between *different*
types: that rule is only for two motor boats or two rowing boats (lid 7–8).

### 3.4 Naderen op tegengestelde koersen: art. 6.04 (6.05 on Geldersche IJssel and Maas)

| Lid | Ships | Rule |
|---|---|---|
| 2 | any two | the one not on the stuurboordszijde gives way |
| 3 | groot + klein | klein gives way |
| 4 | two grote motor, or groot motor + groot zeil | "elk van beide naar stuurboord uitwijken, zodat zij elkaar bakboord op bakboord voorbijvaren" |
| 5 / **6** | two grote / two **kleine zeilschepen** | the one "over stuurboordsboeg" gives way to the one "over bakboordsboeg" (no loef/lij variant here) |
| 7 | two kleine motorschepen | both to stuurboord, bakboord op bakboord |
| **8** | klein motor / zeil / spierkracht | motor gives way to the others; spierkracht gives way to zeil (same rangorde) |
| 9 | two spierkracht | both to stuurboord, bakboord op bakboord |

**6.04a Afwijking: "blauw bord".** A **groot** schip that wants to reach a berth, harbour, lock
or bridge on its **bakboord** side, or is leaving a berth on that side, may ask to pass
**stuurboord op stuurboord**. By day it shows "een lichtblauw bord, in combinatie met een wit
helder rondom schijnend flikkerlicht"; at night a white flashing light, possibly with the board
(lid 3). **Lid 4: "Een klein schip waaraan het verlangen wordt kenbaar gemaakt moet voorrang
verlenen aan het grote schip, bij voorkeur door aan het verlangen te voldoen."** Two korte stoten
if the intention is not understood (lid 5). A reeks zeer korte stoten if the other ship cannot
comply (lid 6).

**6.05 Geldersche IJssel (IJsselkop–Kampen) and Maas / Bergsche Maas to Heusden.** Here the
**afvarend** ship has priority. An opvarend groot schip leaves the afvarend one a suitable way
(lid 2). A klein schip gives way to a groot schip in either direction (lid 7–8). Between two
small ships the stuurboordszijde rule applies, then the same type ladder (lid 9–13).

### 3.5 Oplopen and voorbijlopen: art. 6.09–6.11

- 6.09 lid 1: overtake only after making sure "dat dit zonder gevaar kan geschieden".
- 6.09 lid 2: **every klein schip that is overtaken**, and a groot schip overtaken by a groot
  schip, "moet het voorbijlopen, voorzover nodig en mogelijk, vergemakkelijken", and reduce
  speed if needed. A groot schip overtaken by a *klein* schip has no such duty.
- 6.10 lid 1: "In beginsel moet de oploper aan bakboord van de opgelopene voorbijlopen", or to
  stuurboord "indien daartoe ruimte is".
- 6.10 lid 2: a klein zeilschip overtaking **another zeilschip** "moet het, zo mogelijk, aan loef
  voorbijlopen".
- 6.10 lid 3: a klein schip overtaken by a zeilschip must, if possible, help it pass to loef.
- 6.11: no overtaking where signs **A.2** (voorbijlopen verboden) or **A.4** (ontmoeten en
  voorbijlopen verboden) stand. 6.07 lid 3: no overtaking **in an engte**. 6.28 lid 6: no
  overtaking when approaching or on a **wachtplaats** of a lock.
- The BPR does not say in so many words that "de oploper wijkt". It follows from 6.09 lid 1 and
  6.10: the overtaker must keep clear and choose the side. The overtaken ship facilitates. The
  "22°30´ achterlijker dan dwars" definition matches the stern-light sector, so at night the
  overtaker sees only the heklicht.

### 3.6 Engte: art. 6.07

Applies where no signs regulate passage (lid 2). An engte must be passed "zonder onnodig
oponthoud" and without overtaking (lid 3). **Lid 4: if the view is blocked, give één lange stoot
before entering**, and repeat it in a long engte.

| Lid | Situation | Who waits |
|---|---|---|
| 5 | waterway **with current** | "een tegen stroom varend schip" waits for the one "voor stroom" (any ships) |
| 6 | no current, klein vs groot | klein |
| 8a | two kleine motorschepen | the one with an obstacle "aan stuurboord" or the **binnenbocht aan stuurboord** |
| 8b | two spierkracht | same: obstacle or binnenbocht aan stuurboord waits |
| 8c | klein motor or spierkracht vs klein zeilschip "dat de engte heeft bezeild" | the motor or rowing boat |
| 8d | klein motor vs klein spierkracht | motor |
| 8e | klein zeilschip "dat de engte niet bezeild heeft" vs any klein schip | the zeilschip |
| 8f | two kleine zeilschepen, both "bezeild" | the one over stuurboordsboeg |

"Bezeild" (not defined in the BPR; [KAT] p36): the sailing boat can sail straight through without
tacking. An **open bridge opening, and a lock open at both ends with two green lights**, count as
an engte (6.07 lid 1, 6.24 lid 1).

### 3.7 Keren, vertrek, havens and nevenvaarwateren, veerponten

- **6.13 Keren.** Only when safe (lid 1). A groot schip may ask for cooperation (lid 2). **"Een
  klein schip moet bij het keren voorrang verlenen aan een groot schip"** (lid 3). A small ship
  may ask a small ship for cooperation (lid 4). Not where sign A.8 stands (lid 6). E.8 marks a
  turning place (lid 7).
- **6.14 Vertrek.** Same structure: klein gives way to groot (lid 3) and may ask klein for
  cooperation (lid 4).
- **6.16 Uitvaren en invaren van havens en nevenvaarwateren** (and entering or crossing a
  hoofdvaarwater).
  - lid 1: only after making sure it can be done safely.
  - lid 2: a groot schip may ask for cooperation.
  - **lid 3: a klein schip gives way to a groot schip.**
  - lid 4: a klein schip "mag … medewerking verlangen van een klein schip".
  - **lid 5: a ship entering a "lateraal gemarkeerd hoofdvaarwater"**, except from a laterally
    marked nevenvaarwater, "voorrang verlenen aan een schip dat in dat hoofdvaarwater langs de
    laterale markering de stuurboordszijde volgt".
  - lid 6–7: a ship going **against the current** into a harbour gives way to one going "voor
    stroom … zonder op te draaien" into the same harbour.
  - **lid 8: sign B.9 at the mouth.** A ship coming out gives way to ships on the hoofdvaarwater.
  - lid 9–10: red or green lights at the mouth (A.1/E.1 with F.2).
  - lid 11: not for veerponten.

  [KAT] p40 simplifies this to "hoofdvaarwater gaat voor nevenvaarwater". The BPR itself only
  says so for groot vs klein, for lateral marking and for B.9. Between two small ships without
  these, the one leaving may *ask for cooperation* (lid 4), but only after making sure it is safe
  (lid 1).
- **6.23 Veerponten.** A veerpont may ask a groot schip for cooperation. **"Een klein schip moet
  voorrang verlenen aan een vertrekkende, kerende of overstekende veerpont"** (lid 3). Lights of
  a niet-vrijvarende pont at night: white over green, all-round (3.16).

### 3.8 Other vaarregels

- **Keeping to stuurboord.** There is no general "rechts houden" duty in chapter 6 for normal
  visibility. It works through the voorrang ladder (6.04/6.17 lid 2). Explicit duties are:
  - 6.30 lid 2, **slecht zicht**: "Een varend schip moet zo veel mogelijk aan de stuurboordszijde
    van het vaarwater varen."
  - 9.04 lid 2: a klein schip on the Bijlage 15a waterways (except Waal, Boven-Rijn, IJssel,
    Neder-Rijn, Pannerdensch Kanaal).
  - signs B.2/B.3 via 6.12.

  [RPR] 6.02a lid 5 has an explicit ban on tacking so as to force a small ship keeping its
  stuurboordswal to give way. The BPR gets the same result through 6.17 lid 2.
- **6.18 Diverse vaarregels.**
  - lid 1: "op gelijke hoogte varen" only if there is room without hindrance.
  - lid 4: no coming alongside, making fast or riding the wake of a varend schip without the
    schipper's permission.
  - lid 5: no dragging anchor, cable or chain, and never within 100 m of bridges, locks or
    ferries, or where A.6 stands.
  - **lid 6: "Een schip mag zich niet met de stroom laten meedrijven, zonder dat het van een
    middel tot voortbeweging gebruik maakt"** (relevant for a becalmed lelievlet).
- **6.20 Hinderlijke waterbeweging.** Regulate speed to avoid damaging wash, especially before a
  havenmond, near moored ships, near a working veerpont, and where A.9 stands.
- **6.22 lid 2: sign A.1a** (buiten gebruik gestelde vaarweg) "is niet van toepassing op een klein
  schip zonder motor". A lelievlet without an outboard may enter.
- **6.28 Sluizen.** Enter in order of arrival, but **"een klein schip dat tezamen met grote
  schepen wordt geschut mag de sluis echter eerst invaren na deze grote schepen"** (lid 5). No
  overtaking on a wachtplaats (lid 6). A small ship lies at some distance from a large one (lid
  9f). Request signal: lang-kort-lang (lid 4). Lock lights: 6.28a.
- **Slecht zicht, 6.30–6.33.**
  - Keep to stuurboord.
  - Stop at the nearest suitable place if continuing is unsafe (6.30 lid 3).
  - A small ship that is not on radar need not give the mistsein, "doch het mag dit sein geven"
    (6.33 lid 3). The mistsein is één lange stoot, at least once a minute (6.33 lid 1a).
  - Near the bank: keep to it and slow or stop. Away from the bank: clear the vaarwater (6.33
    lid 1d).

### 3.9 Ligplaats nemen and ankeren (chapter 7, 9.03)

- 7.01 lid 1: take a berth "zodanig … dat de scheepvaart niet wordt belemmerd". Lid 3: anchor or
  moor so that wind, current, water level, suction and wash cannot make you a danger.
- **7.02 lid 1: no ligplaats (ankeren and meren)**:
  - a. where it is forbidden by general rule or notice;
  - b. where the authority designates;
  - c. at sign **A.5** (on that side), or k. within the distance on **A.5.1**;
  - **d. "onder een brug of onder een hoogspanningslijn"**;
  - **e. in or near an engte**, or where lying would create one;
  - **f. "waar in een vaarweg een andere vaarweg, daaronder begrepen een haven, uitmondt"**;
  - **g. "in het traject van een veerpont"**;
  - h. in the route of ships approaching or leaving an aanlegplaats;
  - i. at a keerplaats (E.8);
  - j. alongside a ship with the 3.33 board, within the distance shown on it.
- 7.03: **no ankeren** where forbidden by general rule or at sign **A.6** (that side). E.6 allows
  it. 7.04: no meren at **A.7**. E.7 allows it. 7.04 lid 3: moor only to things meant for it,
  not to trees or lampposts.
- 9.03 lid 1 / Bijlage 14a: no berth at all on listed Rijks waterways. Lid 5: this does not apply
  to "een klein schip dat op een veilige plaats buiten het voor de doorgaande scheepvaart bestemde
  vaarwater ligt" on the Bijlage 14b waterways.
- **Signals at anchor (3.20 lid 4):** "Een klein schip dat stilligt … moet voeren: a. 's nachts:
  een wit gewoon rondom schijnend licht …; b. overdag, indien het niet direct of indirect aan de
  oever gemeerd ligt: een zwarte bol". Not required in areas the authority designates (lid 5).
- **Lights under way (3.13 lid 5, klein zeilschip):** boordlichten + heklicht (bow and stern, or
  a mast-top tricolour), **or, under 7 m: "een wit gewoon rondom schijnend licht … [en] bij het
  naderen van een ander schip, bij gevaar voor aanvaring, een tweede wit gewoon licht"**. Rowing
  (3.13 lid 6): one white all-round light. Sail + motor by day: black cone, point down (3.13 lid
  7).
- 2.02 lid 3: the name and owner markings of 2.02 lid 1 are **not required on a sailing boat
  under 7 m or a rowing boat**. [KAT] p25 wrongly limits the exemption to rowing boats.

### 3.10 Sailing, surfing and small craft restrictions

- **9.04, Bijlage 15a** (36 main waterways, e.g. Noordzeekanaal, Amsterdam-Rijnkanaal, Lekkanaal,
  Nieuwe Waterweg, Oude Maas, Noord, Merwedes, Waal, Hollandsch Diep hoofdvaarwater, Prinses
  Margrietkanaal):
  - lid 1: a klein schip may only sail there with "een motor die voor onmiddellijk gebruik gereed
    is" that can hold **≥ 6 km/h**. A sailing lelievlet without an outboard is **not allowed**.
  - lid 2: keep to stuurboord.
  - lid 3: "niet toegestaan het vaarwater op te kruisen" (no tacking up the fairway).
  - lid 4: rowing boats actually being rowed are exempt from lid 1, except west of the IJmuiden
    locks.
  - lid 6, Bijlage 15b: radar reflector in poor visibility.
- **9.05.** No zeilplanken on the through-traffic parts of the Bijlage 16 waterways (lid 1). **No
  kitesurfing** ("door een vlieger voortbewogen plank of klein schip") unless the authority
  designates an area (lid 2–3).
- **Bijlage 7 signs:** A.12 verboden voor motorschepen, **A.13 verboden voor kleine schepen**,
  A.14 waterskiën, **A.15 verboden voor zeilschepen**, **A.16 verboden voor door spierkracht
  voortbewogen schepen**, A.17 zeilplanken, A.20 waterscooters.
- **8.08 Zwemmen** and watersport without a ship are forbidden at wachtplaatsen, near bridges,
  locks and weirs, in the through fairway, in ferry routes, in harbours and their entrances, near
  mooring places, and in speed or waterski zones.

### 3.11 Geluidsseinen (chapter 4, Bijlage 6)

**4.01 lid 1b / 4.02:** a groot schip must give the Bijlage 6 signals "ter voorkoming van
aanvaring". **4.02 lid 2: "Een klein schip moet ter voorkoming van aanvaring zo nodig het
attentiesein, het sein «Ik kan niet manoeuvreren» en zo nodig het noodsein … geven en het mag zo
nodig een der overige algemene geluidsseinen … alsmede het mistsein … geven."** **Lid 3: a klein
schip "mag niet de manoeuvreerseinen, vermeld in de afdelingen B, C, D en E" geven**: no
meeting, overtaking, turning or harbour-exit signals. The only signalling device named for small
ships is for *motor* boats (lid 1b, "scheepstoeter of hoorn"). A lelievlet in practice carries a
mouth horn or gas horn. 4.03: no other use of the horn.

Section A, "Algemene seinen", read from the official images in `bijlage6/`
(─ lange stoot 4 s, • korte stoot 1 s, · zeer korte stoot ¼ s):

| Sein | Pattern | Small ship | Image |
|---|---|---|---|
| Attentie | ─ (één lange stoot) | **must** when needed | 115873 |
| Ik ga stuurboord uit | • | may | 115872 |
| Ik ga bakboord uit | • • | may | 115875 |
| Ik sla achteruit | • • • | may | 115876 |
| Ik kan niet manoeuvreren | • • • • | **must** when needed | 115877 |
| Er dreigt gevaar voor aanvaring | reeks zeer korte stoten (≥ 6 × ¼ s) | may | 115878 |
| Verzoek om medische hulp | • • • • ─ | may; text in **3.30 lid 3** (Bijlage 6 wrongly cites "3.46, lid 3") | 115879 |
| **Noodsein** | herhaalde lange stoten ─ ─ … or reeksen klokslagen (4.01 lid 4) | **must** when needed | 115880 |
| Blijf weg | • ─ repeated ≥ 15 min (tankers only, 4.04) | hear and obey (6.19) | 115881 |
| Verzoek bediening brug/sluis | ─ • ─ (6.26 lid 7, 6.28 lid 4) | may | 115882 |

Signals a lelievlet crew **hears** from large ships (they cannot give them):
- Section B: "Ik wil stuurboord op stuurboord voorbijvaren" (• •, with the blue board; 6.04a).
- Section C: overtaking.
- Section D: keren, "ik ga over stuurboord keren" = ─ • (image 115899).
- Section E: harbour exit, "ik ga oversteken" = ─ ─ ─ (image 115903).
- Section G: mistsein one lange stoot (115906).
- Engte with no view: één lange stoot (6.07 lid 4).

Large motor ships show a **yellow all-round light** together with every blast (4.01 lid 2).

## 4. Where the BPR does not apply: differences (short)

- **Rijn, Waal, Pannerdensch Kanaal, Neder-Rijn, Lek (RPR, [RPR] art. 6.02–6.02a):**
  - A klein schip must leave every non-small ship "de ruimte …, die dit nodig heeft om zijn koers
    te volgen en om te manoeuvreren". Large ships are relieved of meeting and overtaking rules
    towards small ones.
  - There is **no stuurboordszijde step**. The opvarend schip leaves the way to the afvarend
    schip (6.04).
  - Among small craft, 6.02a has the same rangorde (motor < spierkracht < zeil) and the same
    boeg, loef and twijfel rules. It adds "Een klein zeilschip moet een ander klein zeilschip aan
    loef voorbijlopen. Loef is aan de zijde tegenover het gezette grootzeil" and bans opkruisen
    that forces a small ship on its stuurboordswal to give way.
  - Overtaking may be on either side (6.10).
  - BPR 9.04 (motor requirement on Waal and Neder-Rijn, among others) applies there too
    ([VB] art. 2 lid 3).
- **Westerschelde, Kanaal van Terneuzen, Eemsmonding, Gemeenschappelijke Maas:** their own
  scheepvaartreglementen, not collected. In the BPR havens along the Westerschelde, a ship
  leaving a harbour must not force a ship "dat dit vaarwater in een gestrekte koers volgt" to
  change course or speed (BPR 12.05).
- **Sea (COLREGs / BVA), seaward of the [VB] art. 2 line:**
  - no groot/klein ladder and no stuurboordszijde step;
  - sail vs sail uses the same wind-side, windward and doubt rules (rule 12);
  - "power gives way to sail" (rule 18), but small and sailing craft "shall not impede" a ship
    that can only navigate in a narrow channel or traffic lane (rules 9–10);
  - a rowing boat has lights (rule 25d) but no place in the right-of-way order;
  - different sound signals (one short = altering to starboard is the same, but manoeuvring
    signals are open to all).

  *Trust: from general knowledge of the COLREG text, **not** checked against the official Dutch
  text in this session.*
- **Bovenmaatse zeegaande schepen** (Bijlage 11 waterways between sea and seaports, BPR 10.08):
  every ship gives way to them.

## 5. Errors and simplifications in [KAT] to avoid in the viewer

- p24 vs p29: snel schip "> 40 km/uur" (correct), then "> 30 km/uur" in a scenario caption (wrong).
- p23–24: passagiersschip "12 personen of meer". BPR: "meer dan 12 passagiers". "Groot schip: …
  alle schepen korter dan 20 meter die een beroep uitoefenen" is not the BPR definition, which
  has only the five listed exceptions.
- p25: the exemption from name markings is for rowing boats **and** sailing boats under 7 m
  (2.02 lid 3).
- p40: "hoofdvaarwater gaat voor nevenvaarwater" in general. The BPR says so only with lateral
  marking (6.16 lid 5), sign B.9 (lid 8), or groot vs klein.
- p29 tip "Ruime wind gaat voor voor-de-wind …": a heuristic for loef/lij. The rule is about
  position (loefwaarts/lijwaarts), not about the point of sail.
- p28: "Klein wijkt voor groot" is listed after SB-wal. That order is correct. The book's
  multi-boat tip (p30) puts "groot gaat voor klein" first, which ignores the stuurboordszijde step.

## 6. Scenarios

Conventions:
- "Lelievlet" = our boat (klein; zeilschip / spierkracht / motorschip as stated).
- "Wind van bakboord" = giek over stuurboord = BPR **over stuurboordsboeg**. "Wind van stuurboord"
  = giek over bakboord = **over bakboordsboeg**.
- "Open water" means no vaarwater sides apply, so the stuurboordszijde step is skipped.
- Levels use [KAT]'s own tags. See §7.

| # | Situation (animatable) | Wijkt | Behoudt koers | Why | Art. | Level |
|---|---|---|---|---|---|---|
| S01 | Open water. Lelievlet **aan de wind, wind van bakboord** (giek SB). Zeilboot **halve wind, wind van stuurboord** (giek BB). Kruisende koersen. | lelievlet | zeilboot | different boeg: over stuurboordsboeg wijkt | 6.17 lid 6a | KB I |
| S02 | Open water. Lelievlet **ruime wind, wind van stuurboord** (giek BB). Zeilboot **aan de wind, wind van bakboord** (giek SB). Kruisende koersen. | zeilboot | lelievlet | as S01, roles swapped. Lelievlet stands on even though it sails "lower" | 6.17 lid 6a | KB I |
| S03 | Open water. Both **wind van stuurboord**. Lelievlet to windward (loefwaarts), zeilboot to leeward. Courses converge. | lelievlet | zeilboot | same boeg: loef wijkt voor lij | 6.17 lid 6b | KB I |
| S04 | Open water. Both **wind van bakboord**. Lelievlet lijwaarts (halve wind), zeilboot loefwaarts (voor de wind), converging. | zeilboot | lelievlet | loef wijkt voor lij | 6.17 lid 6b | KB I |
| S05 | Open water. Lelievlet **wind van bakboord**. To windward a boat runs dead downwind with a spinnaker, so its giek side cannot be seen. | lelievlet | other boat | lijwaarts, over stuurboordsboeg, other's boeg in doubt: give way | 6.17 lid 6c | KB I |
| S06 | Open water. Lelievlet sails **head-on** to a zeilboot. Lelievlet wind van stuurboord, zeilboot wind van bakboord. | zeilboot | lelievlet | tegengestelde koersen, two small sailboats: over stuurboordsboeg wijkt (no loef/lij rule here) | 6.04 lid 6 | KB II |
| S07 | Open water. **Lelievlet rowing**, zeilboot crossing from its bakboord. | lelievlet | zeilboot | rangorde: spierkracht wijkt voor zeil (side does not matter) | 6.17 lid 9 | KB I / Roeien |
| S08 | Open water. **Lelievlet sailing**. Small motorboat crossing from the lelievlet's **stuurboord**. | motorboot | lelievlet | motor wijkt voor zeil. "Van stuurboord" counts only between two motorboats | 6.17 lid 9 | KB I |
| S09 | Open water. **Lelievlet rowing**. Small motorboat approaching head-on. | motorboot | lelievlet | motor wijkt voor spierkracht (tegengestelde koers) | 6.04 lid 8 | Roeien |
| S10 | Open water. Two **rowing lelievletten** crossing. B comes from A's bakboord. | B (van bakboord) | A | two spierkracht: van bakboord nadert wijkt | 6.17 lid 8 | Roeien |
| S11 | Open water. Two rowing lelievletten **head-on**. | both | — | both go to stuurboord, bakboord op bakboord | 6.04 lid 9 | Roeien |
| S12 | Lelievlet **with sails up and outboard running** (black cone). Zeilboot crossing from its bakboord. | lelievlet | zeilboot | sail + motor = motorschip, which gives way to the zeilschip | 1.01 A 15°, 6.17 lid 9, 3.13 lid 7 | KB II |
| S13 | Canal. Lelievlet sailing on the **stuurboordszijde**. Another small zeilboot is **opkruisen** across the canal and would have right of way on boeg (wind van stuurboord). | zeilboot (crossing) | lelievlet | stuurboordszijde step comes before the boeg rules | 6.17 lid 2 | KB I |
| S14 | Canal. Lelievlet on the stuurboordszijde. Small sailboat coming the other way **on the wrong side** (its bakboordszijde). | zeilboot | lelievlet | tegengestelde koers: the one not on the stuurboordszijde wijkt | 6.04 lid 2 | KB II |
| S15 | Wide lake fairway, neither on a side. Lelievlet crosses the course of a **groot motorschip** (70 m). | lelievlet | groot schip | klein wijkt voor groot | 6.17 lid 3 | KB I |
| S16 | River, neither on a side. Lelievlet and **groot schip head-on**. | lelievlet | groot schip | klein wijkt voor groot | 6.04 lid 3 | KB II |
| S17 | Canal. Groot schip coming towards the lelievlet shows **lichtblauw bord + wit flikkerlicht** at stuurboord: it wants to berth on its bakboord side. | lelievlet | groot schip | give way, preferably by passing stuurboord op stuurboord | 6.04a lid 2–4 | KB II |
| S18 | Lelievlet (wind van stuurboord, stand-on per S02) keeps course and speed. The other boat does not react and is now 2 boat lengths off. | both act | — | stand-on must keep course and speed, but when collision can no longer be avoided by the other alone it must take the best action. Attention signal ─ / gevaar signal ····· | 6.03 lid 5, 1.04, 4.02 lid 2 | KB I |
| S19 | Lelievlet sailing **overtakes** a slower zeilboot from > 22°30′ abaft its beam. | lelievlet (oploper) | zeilboot (facilitates) | oploper keeps clear, passes **to loef** if possible. The overtaken small boat facilitates. | 6.01 lid 1b, 6.09, 6.10 lid 2–3 | KB II |
| S20 | Small motorboat **overtakes the lelievlet** (sailing) in a canal. | motorboot (oploper) | lelievlet (facilitates) | passes in principle on the lelievlet's bakboord. The lelievlet helps, and if the overtaker is a zeilboot helps it pass to loef. | 6.09 lid 2, 6.10 lid 1, 3 | KB II |
| S21 | **Groot schip overtakes** the lelievlet in a narrow canal. | groot schip (oploper) | lelievlet facilitates, slows if needed | every overtaken klein schip must facilitate | 6.09 lid 2 | KB II |
| S22 | **Engte** (open bridge opening), no current. Lelievlet sailing, **bezeild** (can sail straight through). Small motorboat arrives from the other side. | motorboot waits | lelievlet | klein motor wacht voor klein zeilschip dat de engte bezeild heeft | 6.07 lid 8c | KB II |
| S23 | Engte, no current. Lelievlet sailing but **niet bezeild** (must tack inside). Rowing boat arrives from the other side. | lelievlet waits | roeiboot | a zeilschip that has not "bezeild" the engte waits for any klein schip | 6.07 lid 8e | KB II |
| S24 | Engte on a **river with current**. Lelievlet (rowing) going **against** the current. A small motorboat comes down **with** it. | lelievlet waits | motorboot | tegen stroom wacht voor voor stroom, whatever the type | 6.07 lid 5 | KB II / Roeien |
| S25 | Engte, no current. Lelievlet vs **groot schip**. | lelievlet waits | groot schip | klein wacht voor groot | 6.07 lid 6 | KB II |
| S26 | Engte, no current. Two rowing lelievletten. A has a moored boat **aan stuurboord** (obstacle on its side). | A waits | B | obstacle or binnenbocht aan stuurboord waits | 6.07 lid 8b | Roeien |
| S27 | Lelievlet wants to **leave a harbour** onto a hoofdvaarwater. A groot schip approaches on the hoofdvaarwater. | lelievlet waits | groot schip | klein wijkt voor groot bij uitvaren | 6.16 lid 3 | KB III |
| S28 | Lelievlet leaves a side channel into a **laterally buoyed hoofdvaarwater**. A small yacht follows the stuurboordszijde along the buoys. | lelievlet | yacht | entering a lateraal gemarkeerd hoofdvaarwater: give way to the one following its stuurboordszijde | 6.16 lid 5 | KB III |
| S29 | Harbour mouth with **sign B.9**. Lelievlet coming out, small motorboat passing on the hoofdvaarwater. | lelievlet | motorboot | B.9: the one coming out gives way to all on the hoofdvaarwater | 6.16 lid 8 | KB III |
| S30 | **Veerpont** leaves its landing while the lelievlet approaches the crossing. | lelievlet | veerpont | klein schip wijkt voor vertrekkende, kerende of overstekende veerpont | 6.23 lid 3 | KB III |
| S31 | Lelievlet wants to **turn round** (keren) in a canal. A groot schip is coming up behind. | lelievlet waits | groot schip | klein schip bij keren wijkt voor groot. It may not give the keer-sein (─ •) | 6.13 lid 3, 4.02 lid 3 | KB III |
| S32 | Lelievlet wants to **leave the wal** (vertrek). A small motorboat is at some distance. | motorboot cooperates | lelievlet may ask | klein mag bij vertrek medewerking verlangen van klein, only after making sure it is safe | 6.14 lid 1, 4 | KB III |
| S33 | **Snel schip** (groot, > 40 km/h) crosses ahead of a rowing lelievlet. | snel schip | lelievlet | snel schip verleent altijd voorrang | 6.02 | KB I |
| S34 | Lelievlet approaches a **bridge opening with no view** round the bend. | — (signal) | — | give één lange stoot before entering the engte | 6.07 lid 4 | KB III |
| S35 | **Mist** on a canal. Lelievlet sailing, hears a lange stoot ahead. | lelievlet keeps to stuurboordszijde, slows or lies up near the bank | — | stuurboordszijde in slecht zicht; mistsein optional for a small ship | 6.30 lid 2–3, 6.33 lid 1d, lid 3 | KB III |
| S36 | Lelievlet wants to **anchor** for lunch: under a bridge / in a harbour mouth / in a ferry route / in an engte. | not allowed | — | ligplaats nemen verboden. Where allowed: black ball by day, white all-round light at night | 7.02 lid 1d–g, 3.20 lid 4 | KB III |
| S37 | Lelievlet **without outboard** reaches the Amsterdam-Rijnkanaal (Bijlage 15a). | may not sail there. Rowing is allowed, keeping stuurboord and not crossing. | — | motor ≥ 6 km/h required, spierkracht exempt | 9.04 lid 1–4 | KB III |

Not in the table, but worth a quiz question: the **lock** order (6.28 lid 5: small boats enter
after the large ones), **A.1a** (a lelievlet without motor may enter, 6.22 lid 2), and **sign
priority** (5.02).

## 7. CWO scope

### Sources

| Key | Document | Where | Version | Trust |
|---|---|---|---|---|
| [CWO-KB22] | CWO Handboek Kielboot | `cwo/cwo_HandboekKielboot1-3-2022.pdf`, from web.archive.org of `cwo.nl/serverspecific/default/images/Downloads_Handboeken/HandboekKielboot1-3-2022.pdf` | 1 March 2022 | **Official** (archived). Spot-checked. |
| [CWO-ZB22] | CWO Handboek Zwaardboot 2-mans | `cwo/cwo_HandboekZwaardboot2mans1-3-2022.pdf` (same folder, archived) | 1 March 2022 | Official (archived). The 1-mans copy in the archive is truncated. |
| [CWO-R15] | CWO Handboek 3.2 Roeien | `cwo/cwo_Handboek3.2Roeien.pdf` (same folder, archived) | Handboek Opleidingen 2015. No 2022 roei handbook was ever archived. | Official (archived) |
| [CWO-2024] | CWO Competentiestructuur 2024 | `cwo/cwo_CWOCompetentiestructuur2024.pdf` | 26 April 2024 | Official. **Structure only.** The current requirements live on watersportdiploma.nl behind an instructor login. |
| [SN-VS] | Scouting Nederland vorderingsstaten CWO Kielboot I–III, Roeiboot I–III | `../parts/sn_insigne_CWO-*.pdf` | 2018–2019 | Scouting (secondary). They name only "Reglementen" and "Weersinvloeden". |

**Caveat.** The requirements valid in 2026 are not public. The 2022 handbook is the latest
official text we can read. Its wording on these topics is nearly unchanged from 2005, so it is a
safe basis, but it is not guaranteed to be current. There is **no separate CWO discipline for
Scouting or lelievlet**: Scouting uses CWO Kielboot for sailing and CWO Roeien for rowing. In
2022 the levels were renamed Basis = I, Ervaren = II, Gevorderd = III, Vergevorderd = IV, and an
Introductie level was added.

### Kielboot (Zwaardboot 2-mans has identical wording), item 402 "Reglementen"

| Level | BPR articles required | Lights, signals, signs | Betonning |
|---|---|---|---|
| Introductie | 401 "Basis reglementen": 1.04, 1.05, 6.04 lid 6 and 8, 6.17 lid 6 | noodsein (102) | — |
| **Basis (I)** | 1.01 A 3°/4° (groot/klein), 6.01, 6.03 lid 1,3,4,5, **6.04 lid 2,3,6,8**, **6.07 lid 6** (engte klein/groot), 6.09, **6.10 lid 1**, **6.17 lid 2,3,6,9** | — | — |
| **Ervaren (II)** | the above plus 1.01 A 15° (zeilschip) and 16° (zeilplank), 1.04, 1.05, the whole of 6.10, and "weet dat er naast het BPR nog andere reglementen kunnen gelden" | — | — (optional waterkaarten) |
| **Gevorderd (III)** | 1.01–1.11, **6.01–6.28a** (all of §3.2–3.8), 7.09, 7.10, 8.08, **9.04, 9.05** | 2.02; **3.01a** (toplicht, boordlichten, heklicht, rondom schijnend licht); 3.05, 3.07, 3.08 lid 1 and 5, 3.09, 3.12, **3.13**, 3.15, **3.20**, 3.25, 3.29, **3.30**, 3.38; **4.01 lid 1b and 4, 4.02, 4.04**; 5.01, 5.02. **Bijlage 6A**: attentie, SB uit, BB uit, achteruit, kan niet manoeuvreren, noodsein, blijf weg, verzoek brug/sluis. **Bijlage 7**: A1 (incl. A.1a), A9, A11, A12, A13, A15, A16, A17, B5, B6, D1, E1, E4, E4.1, E9, E10, E11, E15, E16, E18, E19, E20, G1, G2, G4, G5.1a, H3 | optional module 4102: SIGNI red/green (splitsings)tonnen |
| Vergevorderd (IV) | same | same, plus optional nachtzeilen (4601) | SIGNI (4102) |

### Roeien, item 5 "Reglementen" ([CWO-R15])

| Level | BPR articles | Lights, signals, signs |
|---|---|---|
| **I / II** | 1.01 A 2°/3°/4°/15°/16°, 1.04, 1.05, 6.01 lid 1, 6.03, **6.04 lid 2,3,8,9**, 6.10, **6.14**, **6.17 lid 2,3,8,9**, 7.01 lid 1 | none |
| **III** | full list, as Kielboot III | 3.01a, 3.08, 3.09 lid 1 and 3, 3.13, 3.14 lid 1–3, 3.15, **3.16 (veerponten)**, 3.20 lid 1,2,4,5, 3.25, 3.29, 3.30; 4.01, 4.02, 4.04; Bijlage 6A as above. Bijlage 7: A1, **A6, A7**, A11, A12, A13, A16, B5, B6, **B8**, D1, E1, E4a, E4b, E9, E10, E16, E19, **F1**, G1, G2, G4, G5.1a, H3. **No betonning at any roei level.** |

### How the viewer levels should be read

The scenario `niveau` values are **[KAT]'s tags**. That book is stricter than CWO 2022: it puts
tegengestelde koersen, oplopen and engtes at KB II & III. CWO 2022 *Basis* already includes
6.04 lid 2,3,6,8, 6.07 lid 6, 6.09 and 6.10 lid 1. To follow CWO rather than the book:

- **Basis / I:** S01–S11, S13–S16, S18–S21, S25, S33. That is kruisend, tegengesteld, oplopen,
  and engte klein/groot.
- **Ervaren / II:** plus S12 (zeilschip definition: sail + motor).
- **Gevorderd / III:** everything else. That covers the blauw bord S17 (6.04a), the engte
  details S22–S24 and S26, havens S27–S29, veerpont S30, keren S31, vertrek S32 (for Roeien
  already at I/II), engte signal S34, slecht zicht S35, 9.04 S37, and all lights, signals and
  signs.
- **Ankeren S36:** chapter 7.02 is not in any CWO list, only 7.01 lid 1, 7.09 and 7.10. [KAT]
  teaches it at KB III.
- **Betonning:** not required at I–III in any discipline. Keep lateral and cardinal buoyage as
  context or optional for III (6.16 lid 5 needs "lateraal gemarkeerd").

### [KAT] pages on these topics

PDF page = printed page + 6. The book's own level tags are in brackets.

| Topic | PDF pages | Printed | Level in book |
|---|---|---|---|
| H3 BPR: scope, definitions, 1.02/1.09/1.11/2.02/6.02/8.08 | 29–31 | 23–25 | all |
| Koersen, general principles, symbols | 32–33 | 26–27 | all |
| 3.2.1 Kruisende koersen (incl. multi-boat puzzles) | 34–36 | 28–30 | all |
| 3.2.2 Oplopende koersen | 37 | 31 | KB II & III |
| 3.2.3 Tegengestelde koersen, blauw bord | 38–39 | 32–33 | KB II & III |
| 3.2.4 Engtes, "bezeild" | 40–42 | 34–36 | KB II & III |
| 3.3 Keren, vertrek, veerpont, hoofd-/nevenvaarwater, gelijke hoogte, hinderlijke waterbeweging, ligplaats | 43–47 | 37–41 | KB III |
| 4.1 Dagtekens | 48 | 42 | KB II & III |
| 4.2 Scheepsverlichting (< 7 m, 7–20 m, > 20 m, other, stilliggend) | 49–53 | 43–47 | II & III / III |
| 4.3 Geluidsseinen (with mnemonics) | 54 | 48 | KB III |
| 4.4 Verkeerstekens | 55–60 | 49–54 | II & III (gebod/beperking III) |
| 4.5 Bruggen & sluizen | 61–65 | 55–59 | KB II & III |
| 4.6 Markeringstekens (kardinaal, lateraal, splitsing, geleidelichten) | 66–69 | 60–63 | KB III |
| 5.13 Ankeren | 92–95 | 86–89 | KB III |
| 6.7 Aanvaringspeiling / boordpeiling | 102–103 | 96–97 | KB III |
| Oefenopgaven BPR (answers PDF 131) | 114–118 | 108–112 | mixed |
| Oefenopgaven Lichten, seinen & termen | 119–123 | 113–117 | mixed |

Roei counterpart (`../parts/katwijkse_zeeverkenners_cwo_roei_instructieboek.pdf`, PDF pages):
- H3 BPR: p. 22–32.
- H4 Lichten, seinen & termen: p. 33–51.
  - Geluidsseinen: p. 39.
  - Verkeerstekens: p. 40–44.
  - Betonning: p. 50–51.
