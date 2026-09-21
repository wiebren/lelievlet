# CWO level per part name

Which CWO level a Dutch sea scout has to know each name of the class's parts drawing at.
One row per entry of `QUIZ` in `web/src/quizdata.js` (82 entries; nr. 61 Luchtkast and 62 Mangat
are not in the quiz). Compiled 2026-09-21 from the material in this directory only — no new
sources were fetched. Dutch terms and quotations are left in Dutch on purpose.

Source keys are those of `SOURCES.md`, plus the ones introduced here:

| Key | Document | Status |
|---|---|---|
| `[HBO]` | `caynoya_officiele_CWO_eisen_kielboot_1_2_3.pdf` — Handboek Opleidingen 2005, hfst. 5 Kielboot | the written-out CWO requirements; **normative** |
| `[SPIEGEL]` | `wsvdespiegel_diploma_eisen_kielbootzeilen_cwo.pdf` | one-page summary of the same requirements |
| `[VS1]` `[VS2]` `[VS3]` | `sn_insigne_CWO-Zeilen-Kielboot-{1,2,3}.pdf` | Scouting Nederland vorderingsstaten (jan. 2019) |
| `[VSR12]` `[VSR3]` | `sn_insigne_CWO-Roeiboot-1-2.pdf`, `sn_insigne_CWO-Roeiboot-3.pdf` | idem, roeien |
| `[SNEEK]` | `scoutingsneek_zeilinstructieboek_kielboot_I_II_III.pdf` — "Theorie CWO Kielboot I, II & III", Adm. Vechtplassen, ed. jan. 2006 | **the only source that marks per name which parts are Kielboot I** |
| `[KATZ]` | `cwo_zeil_instructieboek_katwijkse_zeeverkenners.pdf` (in `reference/`), 2e druk 2005 | the book the 84-name quiz list comes from |
| `[MTX]` | `meestoxopeus_CWO_kielboot_1_2_3_instructieboek.pdf`, Adm. 12, 1e druk 2005 | derivative of `[KATZ]`, 104 names |
| `[KB3L]` | `scouting_de_bevers_kielboot_III_lesboek.pdf` (2023) | Kielboot III lesboek, 88 names, greys out what is *not* required |
| `[ARG1]` `[ARG2]` | `argo8_cwo1_instructieboekje.pdf`, `argo8_cwo2_theorieboek.pdf` | group booklets KB1 / KB2, 80 names |
| `[PRAET]` | `praetgroep_cwo2_insigne_zeilen_kielboot_2.pdf` (2012) | KB2 reader, 78 names |
| `[KATR]` | `katwijkse_zeeverkenners_cwo_roei_instructieboek.pdf` | roeiboek, 40 names |
| `[JPR3]` | `jpcoen_boek_cwo_roeien_3_2021.pdf` | CWO Roeien, versie 2021, *"de leidraad voor het CWO diploma Roeien"* bij Scouting Nederland; dezelfde 40 namen |

---

## 1. What the requirement literally says, per level

### CWO Zeilen Kielboot I

Vorderingsstaat `[VS1]` p. 1 lists theory requirement **"3. Onderdelen"** and nothing more.
The written-out requirement, `[HBO]` **p. 8** (§5.3.4, toelichting op de theorie-eisen):

> **3. Onderdelen**
> Op eigen boot en tuigage in de praktijk en op een tekening **minstens 15 onderdelen** bij de
> juiste naam kunnen noemen **(naar keuze van de kandidaat)**. Op de tekening moeten duidelijk
> minstens 20 verschillende onderdelen voorkomen.

`[SPIEGEL]` p. 2 renders this as the single number `15`. So at KB I the CWO prescribes **a count,
not a list** — which names is up to the candidate. The scouting books fill that in themselves:

* `[KATZ]` p. 16: *"Kielboot I: 20 onderdelen (waaronder onderdelen van het lopend en staand
  want)"* — and warns: *"Omdat elke groep andere eisen stelt hoeveel onderdelen en welke je moet
  weten voor kielboot I en II, moet je dit aan je leiding vragen."*
* `[MTX]` p. 22: *"Kielboot I: 15 onderdelen"*.
* `[ARG1]` p. 4: *"Op je examen moet er 20 van kunnen benoemen"* (uit de 80 van de lijst).
* `[SNEEK]` p. 18: *"**Kielboot I: alleen de onderdelen met een \***; Kielboot II & III: alle
  onderdelen"* — and then actually stars 30 of the quiz's names in the lists on p. 19–21. **This
  is the only per-name statement in the whole collection and it is the basis of column `niveau 1`
  below.**

### CWO Zeilen Kielboot II

`[VS2]` p. 1: theory requirement **"3. Onderdelen"**. `[HBO]` **p. 14** (§5.4.4):

> **3. Onderdelen**
> Van eigen boot en tuigage in de praktijk en op een tekening **minstens 25 onderdelen** bij de
> juiste naam kunnen noemen. De onderdelen naar eigen keuze van de kandidaat. Op de tekening
> moeten duidelijk minstens 30 verschillende onderdelen voorkomen. **In ieder geval moeten gekend
> worden: blok, landvast, kiel, helmstok, roer, mast, giek, val, schoot, halshoek, schoothoek,
> grootzeil, fok.**

`[MTX]` p. 22 quotes this list but replaces *kiel* by *zwaard* (*"Kielboot II: 25 onderdelen;
waaronder in ieder geval: blok, landvast, **zwaard**, helmstok, roer, mast, giek, val, schoot,
halshoek, schoothoek, grootzeil en fok"*) — correct for a lelievlet, which has no keel.
`[KATZ]` p. 16 raises the count: *"Kielboot II: 40 onderdelen"*. `[PRAET]` p. 2 aftekenlijst:
*"Onderdelen(25)"*. `[ARG2]` p. 19 goes furthest: *"Op je examen moet je ze allemaal kunnen
benoemen"* (all 80).

### CWO Zeilen Kielboot III

`[VS3]` p. 2: theory requirement **"3. Onderdelen"**. `[HBO]` **p. 20** (§5.5.4):

> **3. Onderdelen**
> Van de eigen boot en tuigage in de praktijk en op afbeeldingen **minstens 40 onderdelen** bij de
> juiste naam kunnen noemen. Deze onderdelen naar eigen keuze van de kandidaat. **In ieder geval
> moeten gekend worden: voorsteven, spiegel, sluiting, kous, blok, stootkussen, hoosvat, landvast,
> kiel, helmstok, roer, roerblad, mast, giek, val, halstalie, schoot, voor-, achter-, onderlijk,
> hals-, schoothoek, grootzeil, fok.**

`[KATZ]` p. 16 and `[MTX]` p. 22 both say simply *"Kielboot III: alle onderdelen"*.
`[KB3L]` p. 10: *"In figuur 1.7 is een tekening van een lelievlet te zien met maar liefst 88
gelabelde onderdelen. De namen van de onderdelen staan in tabel 1.1. **Alle onderdelen, behalve
die met grijze nummers, moet je kennen.**"* — grey in tabel 1.1 are 27 Baan, 30 Strop, 86 Vlag,
87 Vlaggenstok, 88 Knop. `[KB3L]` §1.3.1 p. 11 adds five parts that the drawing cannot show:
voorsteven, sluiting, kous, kiel, halstalie (exactly the `[HBO]` p. 20 extras).

### CWO Roeiboot

`[VSR12]` p. 1 and `[VSR3]` p. 1 both list theory requirement **"3. Onderdelen"**; no written-out
Roeiboot chapter is present in this repository. The teaching material is unambiguous, though:
`[KATR]` §1.1 and `[JPR3]` p. 6 — *"Voordat je gaat varen is het belangrijk om alle onderdelen van
een roeiboot te kennen. … Toch is het **noodzakelijk om alle onderdelen te kennen**"* — followed by
a 40-name list (`[JPR3]` p. 7) that is rowing-oriented: hull, thwarts, rowlocks, rudder, zwaard and
the oar, and no rig at all. The `Roeiboot` column below says whether the name is in that 40-list.

### Sailing-school sources vs. scouting sources — recorded disagreements

* `[HBO]` is a generic CWO text: its mandatory lists name **kiel** (a lelievlet has none — `[MTX]`
  p. 22 substitutes *zwaard*), and never mention **gaffel**, **klauw**, **klauwhoek**, **gaffeldraad**
  or **kraanlijn**, because a CWO kielboot is normally bermudagetuigd. Where `[HBO]` and the
  scouting books differ, the scouting books win here, as instructed.
* `[HBO]` p. 14 makes *halshoek* and *schoothoek* compulsory from KB II but *voor-, achter-* and
  *onderlijk* only from KB III (p. 20) — that split is used below.

---

## 2. Method, and what it can and cannot support

* **niveau 1** = starred in `[SNEEK]` p. 19–21 under *"Kielboot I: alleen de onderdelen met een \*"*.
  This is a direct, per-name statement from an admiraliteits-lesboek, so these rows are `hoog`.
  Caveat: `[SNEEK]` stars 30 of the 82 quiz entries, while `[KATZ]` p. 16 budgets 20 and `[MTX]`
  p. 22 / `[HBO]` p. 8 only 15 for KB I. The set is therefore a *superset* of what any one group
  will actually ask; every starred name is defensibly level 1, but a KB I candidate only has to
  produce 15–20 of them.
* **niveau 2 vs. 3 is not stated by name in any source.** `[SNEEK]` lumps II and III together
  ("Kielboot II & III: alle onderdelen"), and `[HBO]`/`[KATZ]`/`[MTX]` only give counts
  (25 or 40 at KB II; *alle* at KB III). The split below is therefore derived, with this rule:
  * **niveau 2** — not starred by `[SNEEK]`, but either (a) in the `[HBO]` p. 14 KB II mandatory
    list, or (b) used in the *running lesson text* of a KB I/KB II chapter of
    `[KATZ]`/`[MTX]`/`[SNEEK]`/`[ARG1]`/`[ARG2]`/`[PRAET]`/`[KB3L]` — i.e. a part the course
    actually talks about, not merely labels on the drawing.
  * **niveau 3** — everything else: names that occur only as a label in the big numbered list, or
    only in chapters carrying the *Kielboot III* symbol, or greyed out in `[KB3L]` p. 10.
  Confidence for these rows is `midden` at best and `laag` where the only evidence is the absence
  of evidence. The resulting 30 / 18 / 34 split puts 48 names at level ≤ 2, close to the
  *"Kielboot II: 40 onderdelen"* of `[KATZ]` p. 16.
* One systematic caveat: `[KATZ]` p. 106–107 ("Oefenopgaven — Technisch inzicht") carries **no**
  level symbol, so formally those practice questions are KB I material too. They ask about
  voorstagspanner, wervel, mastkoker/mastbout/grendelbout, dolboord/boeisel/berghout/kim,
  denningen, lummelbout and the lijken. `[KATZ]` itself says the choice is group-dependent, so
  these questions are treated as evidence that a name is *examinable*, not that it is level 1;
  they are cited in the rows they touch.

---

## 3. The table

`Roeiboot` = the name is in the 40-name list that `[JPR3]` p. 7 / `[KATR]` §1.1 require for
CWO Roeiboot I/II/III.

| nr | naam | niveau | Roeiboot | bron(nen) | vertrouwen |
|---|---|---|---|---|---|
| 1 | Klauwval | 1 | – | `[SNEEK]` p. 21 nr. 86 `*`; `[SNEEK]` p. 21 *"\* Vallen … Voor het grootzeil zijn dit er twee, klauwval en piekenval"*; `[KATZ]` p. 64 hijsen (geen symbool = KB I) | hoog |
| 2 | Windvaan | 3 | – | `[KATZ]` p. 13 = §1.6 *Ware wind & schijnbare wind*, symbool **Kielboot III**; idem `[MTX]` p. 19, `[SNEEK]` p. 14; niet gesterd in `[SNEEK]` p. 19 nr. 7 | midden |
| 3 | Piekenval | 1 | – | `[SNEEK]` p. 21 nr. 82 `*`; `[ARG1]` p. 11–12 hijsen/strijken | hoog |
| 4 | Gaffeldraad | 3 | – | `[SNEEK]` p. 19 nr. 5 *Spruit* (geen `*`); buiten de namenlijst alleen als KB III-oefenvraag `[KB3L]` p. 49 | midden |
| 5 | Marllijn | 3 | – | `[SNEEK]` p. 19 nr. 2 (geen `*`); lesuitleg alleen in de onderdelenparagraaf `[MTX]` p. 22; marlsteek staat in `[MTX]` bijlage 7.3 p. 104 "Niet diploma"; KB III-oefenvraag `[KB3L]` p. 49 | midden |
| 6 | Gaffel | 1 | – | `[SNEEK]` p. 19 nr. 1 `*`; `[KATZ]` p. 64 hijsen; `[ARG1]` p. 11 | hoog |
| 7 | Tophoek van het grootzeil | 2 | – | niet gesterd (`[SNEEK]` p. 21 nr. 98); wél lesstof KB I/II: `[KATZ]` p. 64 *"Gaffel goed stellen met de piekenval (vouw van halshoek naar tophoek)"*, `[ARG1]` p. 11 | midden |
| 8 | Zeillat | 3 | – | `[SNEEK]` p. 21 nr. 102 (geen `*`); buiten de lijst alleen in §*Hoe werken de zeilen* = **Kielboot III**: `[KATZ]` p. 9, `[MTX]` p. 15, `[SNEEK]` p. 12; `[KB3L]` p. 58 | midden |
| 9 | Kleed | 3 | – | `[SNEEK]` p. 21 nr. 99 (geen `*`); komt in de lesteksten nooit onder deze naam voor — daar heet het *huik* (`[KATZ]` p. 64, `[ARG1]` p. 11) | laag |
| 10 | Want | 1 | – | `[SNEEK]` p. 19 nr. 41 *Zijstag of want* `*`; `[SNEEK]` p. 22 *"Staand want … de voorstag en de zijstagen"*; `[KATZ]` p. 16 eist voor KB I expliciet *"onderdelen van het lopend en staand want"* | hoog |
| 11 | Dirk of kraanlijn | 1 | – | `[SNEEK]` p. 19 nr. 43 `*`; `[SNEEK]` p. 21 uitleg vallen; `[KATZ]` p. 65 strijken | hoog |
| 12 | Grootzeil | 1 | – | `[SNEEK]` p. 21 nr. 100 `*`; `[HBO]` p. 14 en p. 20 verplicht | hoog |
| 13 | Achterlijk | 2 | – | niet gesterd (`[SNEEK]` p. 21 nr. 101); `[HBO]` p. 20 verplicht vanaf KB III, maar al lesstof bij het wenden: `[KATZ]` p. 70 *"Fok overhalen als achterlijk van het grootzeil over de nieuwe boeg wind vangt"* (geen symbool = KB I); `[KB3L]` p. 42; `[KATZ]` p. 107 vraag 14 | midden |
| 14 | Schoothoek van het grootzeil | 2 | – | `[HBO]` p. 14 **verplicht vanaf KB II**; `[ARG1]` p. 11; niet gesterd in `[SNEEK]` p. 21 nr. 103 | hoog |
| 15 | Wervel | 3 | – | `[SNEEK]` p. 19 nr. 30 (geen `*`); uitleg alleen binnen de onderdelenparagraaf (`[MTX]` p. 22, `[SNEEK]` p. 18); `[KATZ]` p. 107 vraag 11 | laag |
| 16 | Pettenlijntje | 3 | – | `[SNEEK]` p. 19 nr. 31 (geen `*`); uitleg alleen binnen de onderdelenparagraaf `[MTX]` p. 22 | laag |
| 17 | Giek | 1 | – | `[SNEEK]` p. 19 nr. 34 `*`; `[HBO]` p. 14 en p. 20 verplicht | hoog |
| 18 | Grootschoot | 1 | – | `[SNEEK]` p. 19 nr. 32 `*` en p. 18 *"\* Schoten (32 & 38)"*; `[HBO]` p. 14 (*schoot*) | hoog |
| 19 | Onderlijk van het grootzeil | 2 | – | niet gesterd (`[SNEEK]` p. 21 nr. 104); `[HBO]` p. 20 verplicht vanaf KB III, maar lesstof bij reven (KB II-praktijkeis): `[ARG2]` p. 16 *"Trek daarna het onderlijk strak"*; `[KATZ]` p. 107 vraag 14 | midden |
| 20 | Halshoek van het grootzeil | 2 | – | `[HBO]` p. 14 **verplicht vanaf KB II**; `[KATZ]` p. 64, `[ARG1]` p. 11; niet gesterd in `[SNEEK]` p. 21 nr. 95 | hoog |
| 21 | Lummelbeslag | 2 | – | niet gesterd (`[SNEEK]` p. 19 nr. 40); lesstof bij reven: `[KATZ]` p. 66 / `[MTX]` p. 67 / `[SNEEK]` p. 83 *"de giek draaien terwijl deze aan de mast door middel van de lummelbout vast zit"*; `[KATZ]` p. 107 vraag 15 | midden |
| 22 | Voorlijk van het grootzeil | 2 | – | niet gesterd (`[SNEEK]` p. 21 nr. 96); `[HBO]` p. 20 vanaf KB III, maar al KB I-lesstof bij killen: `[KATZ]` p. 3 (§1.1.2, geen symbool), `[ARG1]` p. 10 | midden |
| 23 | Rijglijn | 1 | – | `[SNEEK]` p. 19 nr. 42 `*` en p. 19 uitleg *"\* Rijglijn (42)"*; `[SNEEK]` p. 22 lopend want | hoog |
| 24 | Klauw | 1 | – | `[SNEEK]` p. 21 nr. 87 `*`; `[ARG1]` p. 11–12 hijsen/strijken | hoog |
| 25 | Klauwhoek | 2 | – | niet gesterd (`[SNEEK]` p. 21 nr. 97); KB I-lesstof bij hijsen: `[ARG1]` p. 11 *"Loopt er een plooi van de klauwhoek naar de schoothoek, dan staat de piek te laag"*; `[KATZ]` p. 106 vraag 2 | midden |
| 26 | Strop van de gaffel | 3 | – | **`[KB3L]` p. 10 tabel 1.1 nr. 30 "Strop" staat grijs: hoeft ook op KB III niet gekend te worden**; niet gesterd (`[SNEEK]` p. 21 nr. 85); geen lestekst | midden |
| 27 | Mastring | 3 | – | `[SNEEK]` p. 21 nr. 84 (geen `*`); komt buiten de namenlijsten in geen enkel lesboek voor | laag |
| 28 | Mast | 1 | – | `[SNEEK]` p. 19 nr. 6 `*`; `[HBO]` p. 14 en p. 20 verplicht | hoog |
| 29 | Fokkenval | 1 | – | `[SNEEK]` p. 21 nr. 81 `*`; `[ARG1]` p. 11 *"Zet de fokkenval vast op de bovenste kikker"* | hoog |
| 30 | Voorstag | 1 | – | `[SNEEK]` p. 19 nr. 9 `*`; `[SNEEK]` p. 22 *"Staand want … de voorstag en de zijstagen"* | hoog |
| 31 | Fok | 1 | – | `[SNEEK]` p. 21 nr. 91 `*`; `[HBO]` p. 14 en p. 20 verplicht | hoog |
| 32 | Voorlijk van de fok | 2 | – | zie nr. 22; niet gesterd (`[SNEEK]` p. 21 nr. 90); `[ARG1]` p. 10 / `[ARG2]` p. 14 killen van het zeil | midden |
| 33 | Tophoek van de fok | 2 | – | niet gesterd (`[SNEEK]` p. 21 nr. 89); `[ARG1]` p. 11; oefenvraag `[KB3L]` p. 49; `[KATZ]` p. 106 vraag 2 | midden |
| 34 | Halshoek of -broek van de fok | 2 | – | `[HBO]` p. 14 **verplicht vanaf KB II** (*halshoek*); `[ARG2]` p. 16; *broek* alleen in `[VDM8]`/`[KATZ]`/`[WIL88]` | midden |
| 35 | Onderlijk van de fok | 2 | – | zie nr. 19; `[ARG2]` p. 16 reven; `[HBO]` p. 20 | midden |
| 36 | Schoothoek van de fok | 2 | – | `[HBO]` p. 14 **verplicht vanaf KB II**; `[ARG2]` p. 16; niet gesterd (`[SNEEK]` p. 21 nr. 94) | hoog |
| 37 | Fokkenschoot | 1 | – | `[SNEEK]` p. 19 nr. 38 `*` en p. 18 *"\* Schoten (32 & 38)"*; `[ARG1]` p. 11 | hoog |
| 38 | Kettinkje | 3 | – | `[SNEEK]` p. 19 nr. 10 (geen `*`); geen lestekst; staat niet in de 88-lijst van `[KB3L]` p. 10 | laag |
| 39 | Hanekam | 3 | ja | `[SNEEK]` p. 19 nr. 12 (geen `*`); geen lestekst in de kielbootboeken; wel `[JPR3]` p. 7 nr. 4 / `[KATR]` nr. 4 | laag |
| 40 | Voorstagspanner | 3 | – | `[SNEEK]` p. 19 nr. 11 (geen `*`); geen lestekst; `[KATZ]` p. 106 vraag 1 | laag |
| 41 | Dolboord | 3 | ja | `[SNEEK]` p. 19 nr. 35 (geen `*`); geen lestekst; `[KATZ]` p. 107 vraag 13; `[JPR3]` p. 7 nr. 7 | laag |
| 42 | Boeisel | 3 | ja | `[SNEEK]` p. 19 nr. 36 (geen `*`); geen lestekst; `[KATZ]` p. 107 vraag 13; `[JPR3]` p. 7 nr. 8 | laag |
| 43 | Wantketting | 3 | – | `[SNEEK]` p. 19 nr. 39 *Wantketting of wantspanner* (geen `*`); geen lestekst; **staat helemaal niet in de 88-lijst van `[KB3L]` p. 10** | laag |
| 44 | Kim | 3 | ja | `[SNEEK]` p. 19 nr. 18 (geen `*`); geen lestekst; `[KATZ]` p. 107 vraag 13; `[JPR3]` p. 7 nr. 10 | laag |
| 45 | Vlak | 3 | ja | `[SNEEK]` p. 19 nr. 19 (geen `*`); geen lestekst (alle treffers zijn het bijwoord *vlak bij*); `[JPR3]` p. 7 nr. 11 | laag |
| 46 | Spiegel | 2 | ja | niet gesterd (`[SNEEK]` p. 19 nr. 24), maar `[HBO]` p. 20 verplicht én lesstof: `[KATZ]` p. 7 *"De spiegel (achterkant) van de boot draait naar de richting waar het roerblad naar toe wijst"*, `[KATZ]` p. 77 afvaren, `[MTX]` p. 22; `[JPR3]` p. 7 nr. 24 | midden |
| 47 | Scheg | 2 | ja | niet gesterd (`[SNEEK]` p. 19 nr. 20), maar vaste lesstof bij drift/verlijeren (KB II-stof): `[MTX]` p. 9 en p. 12, `[SNEEK]` p. 5 en p. 10, `[PRAET]` p. 9 en p. 16; `[KATZ]` p. 106 vraag 9; `[JPR3]` p. 7 nr. 23 | midden |
| 48 | Zwaard | 1 | ja | `[SNEEK]` p. 19 nr. 16 `*`; `[MTX]` p. 22 zet *zwaard* op de KB II-verplichtlijst in plaats van *kiel*; `[PRAET]` p. 6 heeft een eigen §*Het zwaard*; `[JPR3]` p. 7 nr. 18 | hoog |
| 49 | Zwaardbout | 3 | ja | `[SNEEK]` p. 19 nr. 15 *Zwaardoren* (geen `*`); geen lestekst in de kielbootboeken; `[JPR3]` p. 7 nr. 13 *"Zwaardoren met zwaardbout"* | laag |
| 50 | Zwaardloper | 3 | ja | `[SNEEK]` p. 19 nr. 17 (geen `*`); geen lestekst; `[JPR3]` p. 7 nr. 16 | laag |
| 51 | Zwaardkast | 1 | ja | `[SNEEK]` p. 20 nr. 53/71 `*`; `[JPR3]` p. 7 nr. 12 | hoog |
| 52 | Mastkoker | 3 | ja | `[SNEEK]` p. 20 nr. 50/66 (géén `*`, terwijl mastbout en grendelbout die er doorheen gaan wél gesterd zijn); `[KATZ]` p. 107 vraag 12; `[JPR3]` p. 7 nr. 14 | laag |
| 53 | Mastbout | 1 | – | `[SNEEK]` p. 20 nr. 47/67 `*`; `[KATZ]` p. 107 vraag 12 | hoog |
| 54 | Grendelbout | 1 | ja | `[SNEEK]` p. 20 nr. 49/65 `*`; `[KATZ]` p. 107 vraag 12; `[JPR3]` p. 7 nr. 15 | hoog |
| 55 | Kikker | 1 | ja | `[SNEEK]` p. 20 nr. 68 `*`; *een kikker beleggen* is schiemanseis op KB I (`[ARG1]` p. 3 en p. 17, `[SPIEGEL]` p. 1); `[JPR3]` p. 7 nr. 35 | hoog |
| 56 | Dol | 1 | ja | `[SNEEK]` p. 20 nr. 56/73 `*` en p. 20 uitleg *"\* Dol (56 & 73)"*; `[KATZ]` p. 106 vraag 7; `[JPR3]` p. 7 nr. 21 | hoog |
| 57 | Dolpot | 3 | ja | `[SNEEK]` p. 20 nr. 57/70 (geen `*`); komt alleen voor als onderdeel van de uitleg bij *dol*; `[JPR3]` p. 7 nr. 20 | laag |
| 58 | Berghout | 2 | ja | niet gesterd (`[SNEEK]` p. 19 nr. 37), maar het staat in de reef-regel die alle drie de boeken geven: `[KATZ]` p. 66 / `[MTX]` p. 67 / `[SNEEK]` p. 83 *"wanneer het berghout in het water komt dan moet je reven"* — en *de noodzaak van het reven onderkennen* is al een KB I-praktijkeis (`[VS1]` nr. 12); `[JPR3]` p. 7 nr. 9 | midden |
| 59 | Doft | 1 | ja | `[SNEEK]` p. 20 nr. 54/69 `*`; `[ARG2]` p. 10 onderhoud *"Doften en denningen"*; `[JPR3]` p. 7 nr. 19 | hoog |
| 60 | Voordek | 1 | ja | `[SNEEK]` p. 20 nr. 44/63 `*`; `[JPR3]` p. 7 nr. 3 | hoog |
| 63 | Buikdenning | 2 | ja | niet gesterd (`[SNEEK]` p. 20 nr. 55/72), maar lesstof in het KB II-boek: `[ARG2]` p. 9–10 *"Doften en denningen … hoeven dus niet in de primer"*; `[KATZ]` p. 107 vraag 10; `[JPR3]` p. 7 nr. 33 | midden |
| 64 | Sleepoog | 1 | ja | `[SNEEK]` p. 19 nr. 13 `*`; `[ARG1]` p. 11 *"maak je het anker met een ankerlijn vast aan het sleepoog"*; `[JPR3]` p. 7 nr. 1 | hoog |
| 65 | Hijsogen | 3 | ja | `[SNEEK]` p. 20 nr. 59/77 (geen `*`); geen lestekst; `[JPR3]` p. 7 nr. 31 | laag |
| 66 | Grootschootoog | 3 | – | `[SNEEK]` p. 20 nr. 58/76 (geen `*`); geen lestekst; staat ook niet in de roeilijst | laag |
| 67 | Leiogen van de fokkenschoot | 3 | – | `[SNEEK]` p. 20 nr. 52/64 (geen `*`); geen lestekst | laag |
| 68 | Landvastogen | 3 | ja | `[SNEEK]` p. 20 nr. 61/79 (geen `*`). `[HBO]` p. 14/p. 20 maakt *landvast* (de lijn) verplicht, niet het oog; de oog-benaming komt in geen lestekst voor. `[JPR3]` p. 7 nr. 30 | laag |
| 69 | Achterdek | 1 | ja | `[SNEEK]` p. 20 nr. 60/78 `*`; `[JPR3]` p. 7 nr. 22 | hoog |
| 70 | Wrikgat | 3 | ja | `[SNEEK]` p. 20 nr. 62/80 (geen `*`); in de kielbootboeken geen lestekst. Wél Roeiboot-basisstof: `[KATR]` §1.2.1 *"De kant waar het wrikgat zit, is stuurboord"*, `[JPR3]` p. 7 nr. 32 | midden |
| 71 | Helmstok | 1 | ja | `[SNEEK]` p. 19 nr. 29 `*`; `[HBO]` p. 14 en p. 20 verplicht; `[JPR3]` p. 7 nr. 29 | hoog |
| 72 | Roerkoning | 2 | ja | niet gesterd (`[SNEEK]` p. 19 nr. 25), maar lesstof bij vlagvoering (*Gedragsregels* = theorie-eis 7 vanaf KB II, `[VS2]` p. 1): `[KATZ]` p. 95 / `[MTX]` p. 95 / `[SNEEK]` p. 86 *"de Nederlandse vlag op een gebogen vlaggenstok op de roerkoning"*; oefenvraag `[KB3L]` p. 49; `[JPR3]` p. 7 nr. 26 | midden |
| 73 | Roerhaken | 3 | ja | `[SNEEK]` p. 19 nr. 23 (geen `*`); uitleg alleen binnen de onderdelenparagraaf (`[MTX]` p. 22, `[SNEEK]` p. 18); `[JPR3]` p. 7 nr. 27 | laag |
| 74 | Vingerlingen | 3 | ja | `[SNEEK]` p. 19 nr. 21 (geen `*`); idem nr. 73; KB III-oefenvraag `[KB3L]` p. 49; `[JPR3]` p. 7 nr. 28 | midden |
| 75 | Roerblad | 1 | ja | `[SNEEK]` p. 19 nr. 22 `*`; `[HBO]` p. 20 verplicht; `[KATZ]` p. 7 werking van het roer; `[JPR3]` p. 7 nr. 25 | hoog |
| 76 | Vlaggenstok | 3 | ja | **`[KB3L]` p. 10 nr. 87 staat grijs: hoeft ook op KB III niet gekend te worden.** Tegenspraak: `[KATZ]`/`[MTX]` p. 95 en `[SNEEK]` p. 86 behandelen hem wél in §vlagvoering (Kielboot II & III), en `[JPR3]` p. 7 nr. 36 eist hem voor Roeiboot | laag |
| 77 | Knop van de vlaggenstok | 3 | – | **`[KB3L]` p. 10 nr. 88 grijs**; komt buiten de namenlijsten nergens voor | midden |
| 78 | Vlag | 3 | ja | **`[KB3L]` p. 10 nr. 86 grijs**; tegenspraak: vlagvoering `[KATZ]`/`[MTX]` p. 95, `[SNEEK]` p. 86 (Kielboot II & III) en `[JPR3]` p. 7 nr. 37 | laag |
| 79 | Boeg | 1 | ja | `[SNEEK]` p. 19 nr. 14 *Boeg of voorsteven* `*`; `[HBO]` p. 20 verplicht (*voorsteven*); `[KB3L]` §1.3.1 p. 11; `[JPR3]` p. 7 nr. 2 | hoog |
| 80 | Schootring | 1 | – | `[SNEEK]` p. 19 nr. 33 `*`; lesstof bij reven: `[KATZ]` p. 66 / `[SNEEK]` p. 83 *"dat je het hoefijzer (schootring) moet verstellen"* | hoog |
| 81 | Leuver | 1 | – | `[SNEEK]` p. 19 nr. 8 en p. 21 nr. 88 `*`, met uitleg *"\* Leuver (8) — De fok wordt door middel van kleine haakjes aan de voorslag bevestigd"* (p. 18) | hoog |
| 82 | Hanepootloper | 3 | – | `[SNEEK]` p. 19 nr. 4 / p. 21 nr. 83 *Spruitloper* (geen `*`); buiten de onderdelenparagraaf nergens; staat niet in de 88-lijst van `[KB3L]` p. 10 | laag |
| 83 | Dodemanseind | 3 | – | `[SNEEK]` p. 19 nr. 3 (geen `*`); `[KATZ]` p. 18 zegt er zelf bij: *"Het dodemanseind zit vaak niet op een lelievlet"*; staat niet in de 88-lijst van `[KB3L]` p. 10 | midden |
| 84 | Spant | 3 | ja | `[SNEEK]` p. 20 nr. 51/74 (geen `*`); geen lestekst in de kielbootboeken; `[JPR3]` p. 7 nr. 34 | laag |

**Verdeling:** niveau 1 — 30 namen; niveau 2 — 18 namen; niveau 3 — 34 namen (82 totaal).

---

## 4. Names in the quiz that the CWO material calls something else

| quiz | andere benaming in de CWO-stof |
|---|---|
| 7 Tophoek van het grootzeil | **Nokhoek**. `[MTX]` p. 25 en `[SNEEK]` p. 21: *"De tophoek is de bovenste hoek van een 3-punts zeil (zoals de fok). De bovenste hoek van een 4-punts zeil (grootzeil bij een Lelievlet) heet nokhoek."* Ook `[WIL88]` nr. 16. `[KATZ]`, `[VDM8]`, `[SNB]`, `[KB3L]` en `[ARG1/2]` zeggen wél *tophoek*. |
| 4 Gaffeldraad | **Spruit** (`[MTX]`/`[SNEEK]` nr. 5), *Spruit/gaffeldraad* (`[KB3L]` nr. 29) |
| 82 Hanepootloper | **Spruitloper** (`[MTX]`/`[SNEEK]` nr. 4 en 83) |
| 83 Dodemanseind | **Dodemanslijn**, ook *spruitloperborglijn* (`[SNEEK]` p. 18), *dodemanslijntje* (`[PRAET]` p. 5) |
| 10 Want | **Zijstag** (`[KB3L]` nr. 39), *Zijstag of want* (`[MTX]`/`[SNEEK]` nr. 41), *BB want* (`[ARG1/2]` nr. 10) |
| 43 Wantketting | *Wantketting of wantspanner* (`[SNEEK]` nr. 39), **Wandspanner** (`[ARG1/2]` nr. 43) |
| 49 Zwaardbout | **Zwaardoren** (`[MTX]`/`[SNEEK]` nr. 15); *Zwaardoren met zwaardbout* (`[JPR3]` p. 7); `[KATZ]` nr. 49 drukt *Zwaardhout* (zetfout) |
| 50 Zwaardloper | **Zwaardval** (`[ARG1/2]` nr. 50, en `[HBO]` p. 30 in de KB IV-lijst) |
| 80 Schootring | **Hoefijzer** (`[KATZ]` p. 19 en p. 66, `[MTX]`), **Grootschootring** (`[KB3L]` nr. 35) |
| 21 Lummelbeslag | **Lummelbout** (`[KATZ]` p. 66, `[MTX]` p. 67, `[SNEEK]` p. 83, `[PRAET]` nr. 21), *Lummel in beslag* (`[ARG1/2]` nr. 21) |
| 41 Dolboord | `[ARG1/2]` splitsen: nr. 41 **Stootrand**, nr. 42 *Boeisel (buitenkant) / Doolboord (binnenkant)* |
| 45 Vlak | **Bodem** (`[ARG1/2]` nr. 45) |
| 9 Kleed | in de lestekst altijd **huik** (`[KATZ]` p. 64, `[ARG1]` p. 11); `[ARG1/2]` nr. 9: *Kleed ("Baan" als horizontaal)* |
| 63 Buikdenning | **Vlonder / Denning** (`[KB3L]` nr. 70, `[ARG1/2]` nr. 63 *Denning*) |
| 2 Windvaan | overal **vaantje** of **windvaantje** |
| 27 Mastring | `[VDM8]`/`[OZS102]` onderscheiden *mastring*, *topmastring* en **hommerring** |
| 39 Hanekam | de meeste bronnen schrijven **Hanenkam** |
| 79 Boeg | `[HBO]` p. 20 eist de naam **voorsteven**; `[MTX]`/`[SNEEK]` nr. 14 *Boeg of voorsteven* |
| 3 / 29 / 37 Piekenval, Fokkenval, Fokkenschoot | `[KB3L]` schrijft *Piekeval*, *Fokkeval*, *Fokkeschoot* |
| 26 Strop van de gaffel | `[ARG1/2]` nr. 26 geeft als alternatief **Spruit** — dat botst met nr. 4 Gaffeldraad, waar de andere boeken *spruit* voor gebruiken |
| 34 Halshoek of -broek van de fok | *broek* staat alleen in `[VDM8]`/`[KATZ]`/`[WIL88]`; de CWO-stof zegt alleen *halshoek* |

---

## 5. Names the sources teach that are not in the quiz (candidates for later)

Ordered roughly by how strongly the material requires them.

**Kielboot I (gesterd in `[SNEEK]` p. 18–22, dus KB I-stof, maar niet in de quizlijst):**
* **Blok** / *katrol* — `[SNEEK]` p. 22 `*`, en `[HBO]` p. 14 én p. 20 maken *blok* verplicht.
* **Harpje** (met *mannetje* en *vrouwtje*) — `[SNEEK]` p. 22 `*`, `[KATR]` §1.3.
* **Riem** / *roeiriem* en **Wrikriem** — `[SNEEK]` p. 20 `*`; `[JPR3]` p. 7 nr. 38; `[VDM8]` p. 15.
* **Landvast** (en *voorlandvast*, *achterlandvast*, *spring*, *voorspring*, *achterspring*) —
  `[HBO]` p. 14 en p. 20 verplicht; `[KATR]` §1.2.3; `[ARG1]` p. 13.

**Verplicht volgens `[HBO]` p. 20 (KB III) maar niet in de quiz:**
voorsteven, **sluiting** (harpsluiting/musketonhaak), **kous**, **kiel**, **halstalie**,
**stootkussen** (fender), **hoosvat** — alle vijf de eerste ook in `[KB3L]` §1.3.1 p. 11.

**Staat wel in de tekeningen/lijsten van `[KB3L]` p. 10 of `[MTX]`/`[SNEEK]`, niet in de quiz:**
* **Luchtkast** en **Mangat** (bewust weggelaten; `[KB3L]` nr. 58, `[MTX]` nr. 45/46) — plus
  *mangatdeksel* (`[WIL88]`).
* **Bovenlijk** van het grootzeil (`[KB3L]` nr. 20; `[KATZ]` p. 107 vraag 14).
* **Zeilteken** en **Zeilnummer** (`[KB3L]` nr. 24 en 25; `[KV2]`).
* **Dofthouder** (`[KB3L]` nr. 69, `[ARG1/2]` nr. 59 *doftweger*).
* **Zwaardgreep**, **Zwaardpen**, **Zwaardplaatje** (`[KB3L]` nr. 75, 76, 78; `[JPR3]` p. 7 nr. 17
  en nr. 12 *"Zwaardkast met zwaardplaatje"*).
* **Baan** (`[KB3L]` nr. 27 — grijs, dus zelfs op KB III niet vereist).
* **Hondsvot** (`[ARG1/2]` nr. 66).

**Uitrusting die KB I-lesteksten opsommen maar die geen nummer op de tekening heeft:**
mik (en *schaar*), zeilbandjes, fokkenzak, bootskist, hoosvat, dweil, anker + ankerlijn +
ankerboei, meerpen, vaarboom — `[KATZ]` p. 64, `[ARG1]` p. 11, `[VDM8]` p. 15.

**Alleen Roeiboot:** *casco* (`[KATR]` §1.1), **Handvat** en **Blad** van de riem
(`[JPR3]` p. 7 nr. 39 en 40), en de roeitermen slagdoft/middoft/boegroeier/roerganger
(`[KATR]` §1.2.2) — geen onderdelen van de tekening, maar wel examenstof Roeiboot I/II.
