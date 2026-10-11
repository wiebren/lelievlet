# Kielboot I, II en III lesboeken – Scouting Sint Maarten (Hoofddorp)

*Kielboot I / II / III — Zeiltheorie met focus op Scouting*, written by **Christian Peppelman**,
Scouting Sint Maarten (Sint Maartengroep), Hoofddorp. Three LaTeX-typeset theory books for the CWO
Kielboot diplomas, written for the lelievlet, plus two sets of manoeuvre cards. The Sint Maarten
group sails eight lelievletten on the Westeinderplassen.

| Local file | Document | Version | Pages |
|---|---|---|---|
| `kielboot-i-lesboek.pdf` | Kielboot I lesboek | **1.1**, 31 Dec 2025 | 40 |
| `kielboot-ii-lesboek.pdf` | Kielboot II lesboek | **2.4**, 31 Dec 2025 | 52 |
| `kielboot-iii-lesboek.pdf` | Kielboot III lesboek | **1.1** ("1.1.0"), 31 Dec 2025 | 76 |
| `manoeuvrekaarten-kb-ii.pdf` | Manoeuvre Kaarten KB II | **2.0** (PDF built 31 Dec 2025) | 8 |
| `manoeuvrekaarten-kb-iii.pdf` | Manoeuvre Kaarten KB III | **1.0** (PDF built 23 Dec 2025) | 9 |

All five were downloaded 2026-10-11 from the author's GitHub repository
<https://github.com/ScoutingSintMaarten/Kielboot-Lesboeken> (the README's download links point to
`<level>/Versies/… - Versie x.y.pdf`). File names here carry no version; the version is recorded in
this table. Earlier copies (KB I 1.0 of 27 May 2021, KB II 2.2 of 23 March 2021, KB III 1.0.0 of
26 Feb 2023, from Scouting De Bevers) were replaced; what changed is listed under "Changes since the
older versions" below.

In all three books the **printed page number is the PDF page number** (the cover is p. 1). The
manoeuvre cards have no page numbers; "card n" below is PDF page n. All page references below are to
the versions in the table.

The repository holds, per level, the LaTeX sources (`<level>/Source/`, main file `KBI.tex` …
`KBIII.tex`), the chapter banners, and **every figure separately** as Affinity Designer, PDF and PNG
(two sizes), under `<level>/Source/Hoofdstukken/<chapter>/{pdf,png}`; the covers are in
`Common/Omslag/`. That makes the figures reusable without cutting them out of the book PDFs (see the
licence conditions below).

Scouting De Bevers still hosts the **older** versions on its page *Zeil lesmateriaal*
(<https://www.scoutingdebevers.nl/zeil-lesmateriaal/>, checked 2026-10-11, page last modified
2026-09-09). That page lists them as "Kielboot 1 – Lesboek", "Kielboot 2 – Lesboek" and
"Kielboot 3 + 4 – Lesboek" (the KB III book serves for levels 3 and 4). The page does **not** say the
books themselves are recognised by anyone. What it says is about the *diplomas*: to get a sailing
diploma at the group you have to meet the guidelines of "het Waterverbond | Watersport Academy", and
these are "algemeen landelijk erkende diploma's" that are also issued by sailing clubs, Scouting
Nederland and De Bevers. It works on "niveaus 1 t/m 4 voor Kielboot/ Lelievlet". It links to
<https://watersportacademy.nl/opleidingen/4> and to Scouting Nederland's oefenexamens Kielboot I–III,
and recommends Hoefnagels' *Het Zeilboek*. The books themselves were written for the CWO: their covers
still carry "Geschikt voor de diplomalijn van" with the CWO (Stichting Commissie Watersport
Opleidingen) logo, and §0.3 *Lesstof verantwoording* says they follow the CWO Kielboot requirements.
Each also says, on the back of the cover (p. 2), that "De CWO en Scouting Nederland zijn niet
betrokken geweest bij het opstellen van dit lesboek". (This matters for issue #14, the move from CWO
to Watersport Academy.) KB II up to 2.2 had a §0.3 *Introductie* calling itself a "CWO-lesboek" for
"een landelijk erkend zeildiploma"; that section is gone since 2.3.

The older short links (`bit.ly/CWO_KB1`, `…KB2`, `…KB2_Kaart`, found on
<https://www.scoutingsarto.nl/informatie/cwo-zeilles/>) point to `sintmaartengroep.nl/app/uploads/…`
files that now return 404. `bit.ly/CWO_KB3` points to the GitHub repository.

## Licence and attribution

All three books: **CC BY-NC-SA 4.0** (Naamsvermelding-NietCommercieel-GelijkDelen 4.0 Internationaal),
stated in §0.4 *Document Informatie* on p. 4 of each book. The manoeuvre cards carry no licence text
of their own; the repository README puts everything in it under CC BY-NC-SA 4.0. Contact:
CWO@sintmaartengroep.nl; for originals and printed copies the books point to
<https://sintmaartengroep.nl/>, which no longer offers them; the GitHub repository does. This is the
same licence as this whole repository (`LICENSE`), code included, so text and figures can be reused
anywhere in the repo (docs, site, viewer, reference notes), provided:

- **Attribution**: name the author, link the licence, and say whether the material was changed. On
  the site this goes in "Over dit model" (the sources list in `web/src/template.js` already links the
  GitHub repository and says "wat we eruit overnemen is aangepast").
- **NonCommercial**: no commercial use.
- **ShareAlike**: an adaptation goes out under CC BY-NC-SA 4.0, which the repo licence already is.

Not covered by the books' licence (checked again in the new versions, 2026-10-11):

- the cover: the CWO, Scouting Nederland and Sint Maarten logos are trademarks ("Handelsmerken op het
  voorblad zijn van respectievelijke stichtingen of organisaties", p. 2), and the background photo is
  from Visit Aalsmeer (credited on p. 2). The repository's `Common/Omslag/` cover files carry the same
  logos, although its README does not carve them out;
- the parts drawing (KB I fig. 1.8 p. 10, KB II fig. 1.5 p. 10, KB III fig. 1.7 p. 11), which is
  still the Willibrordus PNG ([WIL88] in `../parts/SOURCES.md`, © 2008, 2013 Waterscouting
  St. Willibrordus), embedded as a raster image and credited by the book in a footnote
  ("Lelievlet_onderdelen.png, https://www.willibrordusgroep.nl/…, Feb 2021"). Only the table of names
  (Tabel 1.1) is the author's own.

The LaTeX theme is *The Legrand Orange Book* (Mathias Legrand, CC BY-NC-SA 3.0). The books ask
readers not to print them at home, scan them or copy them in a way that hurts quality, and to have
them printed as a stapled colour brochure. That is a request, not a licence condition.

Attribution line to use (Dutch, as the site is Dutch):

> Naar de lesboeken *Kielboot I, II en III – Zeiltheorie met focus op Scouting* (versies 1.1, 2.4 en
> 1.1, december 2025) en de manoeuvrekaarten KB II en KB III van Christian Peppelman, Scouting
> Sint Maarten Hoofddorp (<https://github.com/ScoutingSintMaarten/Kielboot-Lesboeken>),
> CC BY-NC-SA 4.0 (<https://creativecommons.org/licenses/by-nc-sa/4.0/>); bewerkt.

For one book, name it with its version, e.g. "*Kielboot III* (versie 1.1, 2025)". For a figure taken
from the repository's figure folders, name the book and figure number, e.g. "figuur 7.11 uit
*Kielboot III* (versie 1.1) van Christian Peppelman, CC BY-NC-SA 4.0; bewerkt".

Short tags used elsewhere: `[KB3]` (`../parts/SOURCES.md`, `../seinvlaggen/SEINVLAGGEN.md`) and
`[KB3L]` (`../parts/CWO_NIVEAUS.md`, `docs/onderdelen.md`) both mean the Kielboot III book.
Suggested for the others: `[KB1L]`, `[KB2L]`, and `[MK2]`, `[MK3]` for the manoeuvre cards.

---

## Kielboot III (v1.1, 76 pp.) — `kielboot-iii-lesboek.pdf`

Front matter: cover p. 1 (lelievlet drawing on a Westeinderplassen photo, hull yellow/red/grey; logos
of Sint Maarten, CWO and Scouting Nederland); colophon p. 2 ("Opgeleverd op 31 december 2025");
voorwoord, dankwoord (Katwijkse Zeeverkenners' books "een grote inspiratiebron" for the figures),
lesstof-verantwoording (written to the CWO Kielboot III requirements, sometimes going further) p. 3;
licence, version history (0.1 22 March 2020, 0.2 15 Jan 2023, 1.0 26 Feb 2023, **1.1 31 Dec 2025
"Correctie kleine fouten, toevoeging krachten op het roer en update aan manoeuvre kaarten"**) p. 4;
contents p. 5. Blank pages: 6, 16, 34, 48, 50, 64, 74, 75. Back cover: p. 76.

### Page index

| Pages | Chapter / topic |
|---|---|
| 7–12 | **1 Bootonderdelen & Zeiltermen** |
| 7 | 1.2.1 bakboord/stuurboord, loef/lij, hoge/lage kant, hogerwal/lagerwal · 1.2.2 boven- en benedenwinds |
| 8–9 | 1.2.3 koersen (windroos) · 1.2.4 overstag, opkruisen/laveren, slag, korte en lange slag (how to use them) · 1.2.5 gijpen, "binnen de wind varen" |
| 9–10 | 1.2.6 overige termen (see below) |
| 10–11 | 1.3 Tabel 1.1 Vletonderdelen (88 numbers) p. 10, fig. 1.7 drawing p. 11 · 1.3.1 extra onderdelen p. 11 |
| 12 | 1.4 Conclusie: list of all terms of the chapter |
| 13–15 | **2 Veiligheid, Weer & Vaarproblematiek** |
| 13 | 2.2 reddingsvest: 5 situations to wear one, 7 requirements · 2.3 omslaan (stay with the boat) · 2.4 gedragsregels |
| 14 | schippersgroet · 2.5 weer: Tabel 2.1 Beaufort 0–12 (km/h, effect; after KNMI) · KB III sails up to and including Bft 5 · 2.5.1 weersomslag, ruimen/krimpen |
| 15 | 2.6 dode hoek, zuiging, diepgang/vaargeul, verlijeren of large ships |
| 17–20 | **3 Bruggen & Sluizen** |
| 17 | 3.2 vaste bruggen: red/white board, one and two yellow diamonds |
| 18–19 | 3.3 beweegbare bruggen: light signals; green/red diamonds for advised/permitted passage; hoogteschaal |
| 19–20 | 3.4 sluizen: light signals; spuien and inlaten signs; brug-sluis combination ("wacht dan dus voor de brug") |
| 21–28 | **4 Reglementen & Voorrangsregels** |
| 21 | 4.2 BPR on board (not required for small open boats) · 4.2.1 types of ship |
| 22 | 4.2.2 terms · 4.2.3 goed zeemanschap · 4.2.4 Tabel 4.1 minimum ages · 4.2.5 naming ships · 4.2.6 other rules (ANWB Wateralmanak) · 4.2.7 zwemverboden |
| 23 | 4.3 voorrang: kruisende koersen, rules 1–6.2 with a diagram each |
| 24–25 | tegengestelde koersen (rules 1–5; rule 5 "beide wijken naar stuurboord"); tegengestelde koersen **met engte** (stroom, groot/klein, priority order incl. "bezeilt de engte", sail/spier/motor) · oplopen (normally to port, sailing boats to windward) · 4.3.1 speciale manoeuvres · 4.3.2 the rules in a row |
| 26–27 | 4.4 verkeerstekens: 9 geboden/verboden, 10 aanwijzingstekens · 4.5 geluidsseinen, Tabel 4.2 (8 signals) |
| 28 | 4.6 hinderlijke waterbeweging; motorplicht with the list of BPR bijlage 15 waters |
| 29–33 | **5 Optische Tekens** |
| 29 | 5.2 four kinds of light with arcs (fig. 5.1), Tabel 5.1 legend · 5.3 dagtekens (kegel, bol, gele ruit, sleepcilinder) |
| 30 | 5.4.1 large ships: motorschip, zeilschip, stilliggen, ankeren, slepen |
| 31–32 | 5.4.2 small ships: motorschip, open motorschip, zeilschip > 7 m, zeilschip met motor, zeilschip < 7 m and spierkracht, gesleept, ankeren |
| 32–33 | 5.4.3 passagiersruit, zeilkegel, werkende werktuigen, hinderlijke waterbeweging, duiktekens (seinvlag A) |
| 35–38 | **6 Schiemannen** |
| 35 | 6.2 gevlochten/geslagen, schavielen, Tabel 6.1 natuur- vs kunstvezel, which rope for schoten, landvast/anker, vallen |
| 36–38 | 6.3 knots (see figures) · Tabel 6.2 aftekenlijst (12 knots or tasks) |
| 39–47 | **7 Krachten op het schip** |
| 39–40 | 7.2 kracht, optellen/ontbinden, koppel, arm |
| 40–42 | 7.3 voortstuwing: stroming, druk, zeilkracht, zeilpunt · 7.3.1 driftbeperkende middelen, lateraalpunt · 7.3.2 voortstuwende kracht |
| 42–43 | 7.4 correcte zeilstand (trimmen; a too-loose sail "wordt ook wel het killen van het zeil genoemd", new in 1.1) · 7.5 effect of fok and grootzeil around the lateraalpunt |
| 43–44 | 7.6 helling and loef-/lijgierigheid |
| 44–45 | 7.7 stabiliteit: kenterend/oprichtend koppel, drukpunt, zwaartepunt, gewichts- vs vormstabiel |
| 46 | 7.8 schijnbare wind (ware wind + vaartwind), effect of a gust and of speed |
| 47 | **7.9 Krachten op het roer** (new in 1.1): the rudder deflects water like a sail deflects air; the force is perpendicular to the blade and grows with speed and rudder angle; split into sturende and remmende kracht, about equal at 45°; beyond that the steering part hardly grows while the braking part grows strongly, so steering always costs speed · 7.10 Conclusie |
| 49–62 | **II Oefenvragen** (divider 49; questions 51–60, answers 61–62) |
| 63–73 | **III Zeil manoeuvres** (divider 63; manoeuvres 65–73) |

### Figures

| Fig. | p. | Shows |
|---|---|---|
| 1.1 | 7 | Two boats between hogerwal and lagerwal, labelled loef/lij and stuurboord/bakboord |
| 1.2 | 7 | Passing a buoy bovenwinds and benedenwinds |
| 1.3 | 8 | Windroos: 8 boats on all courses (in de wind, aan de wind, halve wind, ruime wind, voor de wind), with arrows for oploeven and afvallen |
| 1.4 | 9 | Opkruisen in a channel |
| 1.5 | 9 | Korte en lange slag (wind at an angle to the channel) |
| 1.6 | 9 | Binnen de wind: a boat dead downwind and one further off with the sail still on the old side |
| 1.7 | 11 | The Willibrordus lelievlet drawing with 88 numbered pointers (sail number 214) |
| 2.1–2.4 | 15 | Dode hoek; zuiging around a large ship; diepgang/vaargeul; verlijeren (kompaskoers vs werkelijke koers) |
| 3.1 | 17 | Fixed bridge with three openings: red-white board, one yellow diamond, two yellow diamonds |
| 3.2–3.10 | 18–19 | Movable bridge lights: single red; red + one yellow; red + two yellow; red-green (about to open); green; flashing green + red (closing); double red (out of service); green-white diamonds (advised area); red-white diamonds (keep between) |
| 3.11 | 19 | Hoogteschaal (bridge clearance gauge, metres) |
| 3.12–3.16 | 19–20 | Lock lights: red; red-green; green; double red; double green |
| 3.17, 3.18 | 20 | Spuien and inlaten signs at a lock |
| 4.1 | 23 | Kruisend, tegengesteld, oplopend |
| (unnumbered) | 23–25 | One small diagram per voorrang rule (14 + engte rules + oplopen to windward) |
| (unnumbered) | 26–27 | BPR signs: red geboden/verboden (in-/uit-/doorvaren verboden, hinderlijke waterbeweging, verboden voor motor/klein ("sport")/zeil/spier/zeilplank, stil houden, speed limit 6 km/h); blue aanwijzingstekens (niet-vrijvarende and vrijvarende veerpont, hoofd-/nevenvaarwater, einde verbod, toegestaan voor motor/klein/zeil/spier/zeilplank); Tabel 4.2 sound signals drawn as bars |
| 5.1 | 29 | Arcs of the lights around a boat: boordlichten 112°30′, toplicht 225°, rondom 360°, heklicht 135° |
| 5.2–5.8 | 30 | Large ships at night and by day: motorschip; zeilschip (red over green in the mast); afgemeerd; ankeren (two white / black ball); slepen (two toplights, yellow heklicht / sleepcilinder) |
| 5.9–5.19 | 31–32 | Small ships: motorschip and its variant; open motorschip; zeilschip > 7 m (two options, incl. driekleurenlicht); with motor; **zeilschip < 7 m (5.15) and rowing boat (5.16): one white all-round light**; gesleept; ankeren (white light / black ball) |
| 5.20–5.25 | 32–33 | Passagiersruit; zeilkegel; werktuigen by night and day; hinderlijke waterbeweging; seinvlag A with anchor ball |
| 6.1–6.13 | 36–38 | Halve steek, slipsteek, achtknoop, platte knoop, schootsteek enkel en dubbel, mastworp, paalsteek, opschieten, dubbele halve steek, slippende dubbele halve steek, kikker beleggen in three steps (8'tjes, eindlus, afknopen) |
| 7.1–7.6 | 39–40 | Force arrow; adding and splitting forces (parallelogram); koppel; arm |
| 7.7–7.10 | 40 | Flow along fok and grootzeil, pressure +/−, forces per sail, combined zeilkracht at the zeilpunt |
| 7.11 | 41 | **Lelievlet in side view with its four driftbeperkende middelen labelled: onderwaterschip, zwaard, scheg, roer** (label "Skeg" up to 1.0) |
| 7.12–7.14 | 41 | Sideways push and the resistance arrows; lateraalpunt |
| 7.15, 7.16 | 42 | Zeilkracht split into voortstuwende and verlijerende kracht |
| 7.17–7.19 | 42 | Sail good / too tight (turbulence at the leech) / too loose (backing at the luff) |
| 7.20, 7.21 | 43 | Grootzeil turns the boat up, fok turns it down, around the lateraalpunt |
| 7.22–7.25 | 43–44 | Zeilpunt vs lateraalpunt from behind, the arm, heel to lee (bigger arm) and to windward (smaller) |
| 7.26–7.30 | 45 | Kenterend and oprichtend koppel; gewichtsstabiel and vormstabiel at rest and heeled |
| 7.31, 7.32 | 46 | Schijnbare wind from ware wind + vaartwind; a gust makes it come in ruimer |
| 7.33–7.35 | 47 | **New in 1.1**: roerkracht at the rudder with the lateraalpunt; rudder at about 45° ("Roer Half") and hard over ("Roer Plat"), each split into sturende and remmende kracht |

### Lelievlet-specific content

- **Parts**: Tabel 1.1 (p. 10) groups the names as Fok, Mast, Grootzeil, Gaffel, Giek, Staand want,
  Lopend want, Casco, Zwaard, Roer, Vlag. Grey numbers need not be known, even for KB III: 27 Baan,
  30 Strop, 86 Vlag, 87 Vlaggenstok, 88 Knop (unchanged in 1.1). Extra parts, §1.3.1 p. 11:
  voorsteven, sluiting (harpje, musketonhaak), kous (metal eye in the sail), **kiel** (which a
  lelievlet does not have; "kielboot" is only the CWO discipline), halstalie.
- **Four driftbeperkende middelen** of a lelievlet: onderwaterschip, zwaard, scheg, roer (p. 41,
  fig. 7.11). A lelievlet is "van nature loefgierig" (p. 43).
- **Lights**: a sailing boat under 7 m, and a boat moved by muscle power, only needs one white
  all-round light. Oefenvraag 5.7 (p. 58) asks this of a sailing lelievlet (answer: rondom schijnend
  licht). At anchor: white all-round light, or by day a black ball on the voorschip. The light is not
  needed in a well-lit area or out of the fairway (pp. 31–32).
- **Rules that free the lelievlet**: no minimum age for a rowing or sailing boat under 7 m (Tabel 4.1,
  p. 22). No name on the hull needed for such boats (§4.2.5, p. 22). No BPR copy needed on board a
  small open boat (p. 21).
- **Wind limit**: KB III up to and including Bft 5 (p. 14); KB II up to Bft 4 (KB II p. 14).
- **Kikker beleggen** (p. 38): the end loop on top of the kikker, twisted so the end runs back the way
  of the previous figure of eight.
- **Rope** (p. 35): schoten braided (run easily through blocks); vallen without stretch (the sail does
  not sag); landvasten and ankerlijn with a little stretch.
- **Rudder** (p. 47, new): hard over brakes more than it steers; past about 45° the boat hardly turns
  faster but loses much more speed.
- **Man overboard**: picked up "aan de hoge kant achter de stag" (p. 71).
- The cover drawing is a gaff-rigged lelievlet with mastring, rijglijn, lelie-and-V zeilteken (no
  number) and the Dutch flag on a staff at the stern. Hull colours: KB I yellow/green, KB II
  yellow/orange, KB III yellow/red, all with a grey aft part.

### Terms defined (chapter 1, list on p. 12)

Bakboord, stuurboord, loefzijde, lijzijde, hoge kant, lage kant, hogerwal, lagerwal, in de wind,
aan de wind, halve wind, ruime wind, voor de wind, oploeven, afvallen, bovenwinds, benedenwinds,
overstag gaan, opkruisen (= laveren), slag, korte slag, lange slag, gijpen, binnen de wind (varen),
bezeild, planeren, volvallen, verhalen, verlijeren/drift, opschieter, dwarspeiling, bijliggen,
killen van het zeil, bak, deinzen.

Some definitions in paraphrase:

- **volvallen**: names the side you sail off on after lying head to wind; "volvallen over bakboord"
  means the grootzeil is to port as you get away.
- **opschieter**: landing at a hogerwal by turning head to wind just before the bank, so all speed is
  lost.
- **bijliggen**: fok bak, luffing with the rudder, so the boat lies between in de wind and halve wind;
  rudder and fok may be made fast.
- **killen**: easing a sail until only the leech still draws (p. 10); p. 42 (new in 1.1) also calls
  the too-loose sail of fig. 7.19 "killen".
- **deinzen**: drifting backwards with the bow to the wind.
- **verhalen**: moving a boat a short way by punting, sculling or lines.

Elsewhere:

- BPR terms (pp. 21–22): schip, motorschip, zeilschip, zeilplank, passagiersschip, veerpont, klein
  and groot schip, sleep; assisteren, 's nachts, overdag, vaarweg, vaarwater; goed zeemanschap.
- engte, bezeild (p. 24).
- schavielen, gevlochten/geslagen (p. 35).
- kracht, koppel, arm, zeilpunt, lateraalpunt (formally: the point where all lateral forces act;
  also the boat's pivot), driftbeperkende kracht, trimmen, loef-/lijgierig, kenterend and oprichtend
  koppel, drukpunt (= drijfpunt), zwaartepunt, gewichts-/vormstabiel, begin- and eindstabiliteit,
  ware wind, vaartwind, schijnbare wind, roerkracht, sturende and remmende kracht (chapter 7).

### Boat parts (Tabel 1.1, p. 10) — compared with our quiz

The same 88-number list is in all three books, unchanged in the new versions (names, numbering and
the grey/blue marking were checked against the new PDFs). The required level is **KB I** if the
number is blue in KB I (p. 11), else **KB II** if not grey in KB II (p. 11), else **KB III** if not
grey in KB III (p. 10), else "–" (never required). Quiz numbers and levels are from
`web/src/quizdata.js` (Katwijk 84-name list).

| Nr | Name in the book | Book level | Quiz nr · name · niveau |
|---|---|---|---|
| 1 | Fok | I | 31 Fok · 1 |
| 2 | Tophoek (fok) | II | 33 · 2 |
| 3 | Halshoek (fok) | II | 34 · 2 |
| 4 | Schoothoek (fok) | II | 36 · 2 |
| 5 | Voorlijk (fok) | II | 32 · 2 |
| 6 | Achterlijk (fok) | III | 13 Achterlijk · 2 |
| 7 | Onderlijk (fok) | III | 35 · 2 |
| 8 | Leuver | III | 81 Leuver · **1** |
| 9 | Mast | I | 28 · 1 |
| 10 | Windvaantje | II | 2 Windvaan · 3 |
| 11 | Mastring | III | 27 Mastring · 3 |
| 12 | Rijglijn | I | 23 · 1 |
| 13 | Mastbout | I | 53 · 1 |
| 14 | Grendelbout | II | 54 · **1** |
| 15 | Grootzeil | I | 12 · 1 |
| 16 | Tophoek (grootzeil) | II | 7 · 2 |
| 17 | Klauwhoek | II | 25 · 2 |
| 18 | Halshoek (grootzeil) | II | 20 · 2 |
| 19 | Schoothoek (grootzeil) | II | 14 · 2 |
| 20 | Bovenlijk | III | — not in the quiz |
| 21 | Voorlijk (grootzeil) | I | 22 · 2 |
| 22 | Achterlijk (grootzeil) | I | 13 · 2 |
| 23 | Onderlijk (grootzeil) | III | 19 · 2 |
| 24 | Zeilteken | II | — |
| 25 | Zeilnummer | II | — |
| 26 | Zeillat | II | 8 · 3 |
| 27 | Baan | – | — |
| 28 | Gaffel | I | 6 · 1 |
| 29 | Spruit/gaffeldraad | II | 4 Gaffeldraad · 3 |
| 30 | Strop | – | 26 Strop van de gaffel · 3 |
| 31 | Klauw | I | 24 · 1 |
| 32 | Marllijn | I | 5 · 3 |
| 33 | Giek | I | 17 · 1 |
| 34 | Lummelbeslag | II | 21 · 2 |
| 35 | Grootschootring | I | 80 Schootring · 1 |
| 36 | Wervel | I | 15 · 3 |
| 37 | Pettenlijntje | I | 16 · 3 |
| 38 | Voorstag | I | 30 · 1 |
| 39 | Zijstag | I | 10 Zijstag · 1 |
| 40 | Voorstagspanner | III | 40 · 3 |
| 41 | Fokkeval | I | 29 Fokkenval · 1 |
| 42 | Klauwval | I | 1 · 1 |
| 43 | Piekeval | I | 3 Piekenval · 1 |
| 44 | Kraanlijn / dirk | I | 11 Kraanlijn · 1 |
| 45 | Fokkeschoot | I | 37 Fokkenschoot · 1 |
| 46 | Grootschoot | I | 18 · 1 |
| 47 | Dolboord | II | 41 · 3 |
| 48 | Boeisel | II | 42 · 3 |
| 49 | Berghout | II | 58 · 2 |
| 50 | Boeg | I | 79 · 1 |
| (51) | *missing from the table* (Willibrordus: Kuip) | – | — |
| 52 | Vlak | II | 45 · 3 |
| 53 | Scheg (text p. 41 also "scheg" since 1.1) | II | 47 · 2 |
| 54 | Spiegel | II | 46 · 2 |
| 55 | Voordek | I | 60 · 1 |
| 56 | Achterdek | I | 69 · 1 |
| 57 | Kim | II | 44 · 3 |
| 58 | Luchtkast | I | — (left out on purpose) |
| 59 | Hanenkam | I | 39 Hanekam · 3 |
| 60 | Sleepoog | I | 64 · 1 |
| 61 | Hijsoog | III | 65 Hijsogen · 3 |
| 62 | Leioog | III | 67 · 3 |
| 63 | Grootschootoog | III | 66 · 3 |
| 64 | Landvastoog | III | 68 · 3 |
| 65 | Wrikgat | III | 70 · 3 |
| 66 | Dol | I | 56 · 1 |
| 67 | Dolpot | I | 57 · 3 |
| 68 | Doft | I | 59 · 1 |
| 69 | Dofthouder | III | (only `ook` of 59 Doft) |
| 70 | Vlonder/Denning | I | 63 Vlonder · 2 |
| 71 | Spant | II | 84 · 3 |
| 72 | Zwaard | I | 48 · 1 |
| 73 | Zwaardbout | II | 49 · 3 |
| 74 | Zwaardloper | II | 50 · 3 |
| 75 | Zwaardgreep | II | — |
| 76 | Zwaardpen | I | — |
| 77 | Zwaardkast | I | 51 · 1 |
| 78 | Zwaardplaatje | I | — |
| 79 | Mastkoker | I | 52 · 3 |
| 80 | Kikker | I | 55 · 1 |
| 81 | Helmstok | I | 71 Helmhout · 1 |
| 82 | Roerkoning | II | 72 · 2 |
| 83 | Roerhaak | II | 73 Roerhaken · 3 |
| 84 | Roerblad | I | 75 · 1 |
| 85 | Vingerling | II | 74 Vingerlingen · 3 |
| 86 | Vlag | – | 78 · 3 |
| 87 | Vlaggenstok | – | 76 · 3 |
| 88 | Knop | – | — (part of the Vlaggenstok) |

Counts: KB I asks **40** names, KB II 69, KB III 82 (of the 87 in the table).

Differences with the quiz:

- **In the book, not in the quiz**: Bovenlijk, Zeilteken, Zeilnummer, Baan, Luchtkast, Zwaardgreep,
  Zwaardpen, Zwaardplaatje, Knop, Dofthouder (as its own name). Also the extras of §1.3.1.
- **In the quiz, not in the book**: Kleed, Kettinkje, Wantketting, Hanepootloper, Dodemanseind, Riem.
- **Level differences**:
  - the book wants these at KB I where the quiz has 2 or 3: Voorlijk and Achterlijk of the
    grootzeil, Marllijn, Wervel, Pettenlijntje, Hanenkam, Dolpot, Vlonder, Mastkoker;
  - the book wants these later than the quiz's niveau 1: Grendelbout (II), Leuver (III).
- **Spellings to accept**: fokkeval, piekeval, fokkeschoot, hanenkam, windvaantje,
  spruit/gaffeldraad, grootschootring, zijstag, vlonder/denning, helmstok, kraanlijn/dirk, scheg.

### Manoeuvres (part III, pp. 65–73) — steps as the book gives them

Each manoeuvre is one page: a drawing of the boat's track and numbered steps. Commands in quotes are
the book's words. The same pages are the KB III manoeuvre cards (see below). Changes against 1.0 are
marked *(1.1)*.

1. **Oploeven** (p. 65): (1) roer loslaten or give it a small push; (2) sheet in the grootzeil "als
   deze begint tegen te bollen bij het voorlijk" *(1.1; was: try to stay one course ahead with the
   sail)*; (3) take the rudder again just before the wanted course. Extra: weight to lee luffs faster.
2. **Afvallen** (p. 66): (1) ease the grootzeil "zodat het net wat killt bij het voorlijk", weight to
   windward bears away faster *(1.1; was: ease to the setting of the course you want, with the weight
   tip in a separate box)*; (2) bear away with the rudder; (3) rudder straight on arrival.
3. **Overstag** (p. 67): (1) safety: is it safe in the boat, is there room; (2) sail well aan de wind
   and call **'Klaar om te wenden'**; (3) push the rudder, call **'fok ree'**, sheet in the grootzeil;
   "de fok vangt nu alleen aan het voorlijk wind" *(1.1)*; (4) in the wind, command **'fok bak'** to
   turn through easily; (5) **fok over** "geleidelijk" *(1.1)* once through the wind, ease the
   grootzeil a little and sheet it in slowly; (6) on a good aan-de-wind course with speed again:
   **'fok aan'**. Extra gewicht *(1.1)*: start with weight to lee, move it to windward when the sail
   no longer draws, then bring the heel back to neutral calmly.
4. **Gijp** (p. 68): (1) safety; (2) sail well voor de wind, hold the course, sit on the wrong side of
   the rudder; (3) command **'fok te loevert'** (the fok only goes over when you are truly dead
   downwind); (4) bear away a little more, "binnen de wind varen", so the sail goes over more easily;
   (5) **'Klaar voor de gijp!'**: warn the crew and haul the sail in; (6) when the sail goes over,
   call **'gijp'**, ease the sail fully, take the rudder. Extra gewicht *(1.1)*: start with some
   weight to windward to bear away easily; after the gijp bring the weight to the new windward side,
   "dit stopt de draai".
5. **Hogerwal** (pp. 69–70): (1) sail towards the hogerwal on a clean aan-de-wind line; (2) watch the
   aan-de-windse lijnen and choose your overstag; (3) go overstag at that moment; (4) close to the
   bank, ease grootzeil and fok, **"Laat je zeil nooit helemaal klapperen"**; (5) only the very last
   metre may you turn into the wind. p. 70 diagrams: moment van overstag; laat en vroeg overstag
   (ruim aan de wind / aan de wind / scherp aan de wind lines); extra overstag after tacking too
   early; onderhalen (pinching up to the line). Unchanged.
6. **Man over boord** (p. 71): (1) the witness calls 'Man over boord'; the helmsman calls **'zwem,
   wijs, fok bak en gooi een reddingsvest!'**; (2) bear away to voor de wind as fast as possible: sail
   out, rudder hard over, fok bak; (3) sail on 3–4 boat lengths "of tot je voorbij de aan de windse
   lijn van de man gevaren bent (blauw)" *(1.1; the drawing got a blue line)*; (4) fok over and in,
   luff to aan de wind; (5) choose the overstag moment by the aan-de-windse lijnen; (6) slow down by
   easing fok and grootzeil, say now who takes the person out: on the high side behind the stag;
   (7) **man vast**: call it, pull the fok bak, then bijliggen.
7. **Stormrondje** (p. 72): (1) voor de wind; (2) luff "rustig" *(1.1)* to aan de wind, grootzeil in,
   fok possibly killend; (3) overstag; (4) bear away as fast as possible; (5) keep bearing away to voor
   de wind. *(1.1: five steps instead of four; "houd de fok bak om sneller af te vallen" and the
   Extra Gewicht box (weight to lee to luff, to windward to bear away) are gone.)*
8. **Lagerwal** (p. 73): (1) sail aan de wind to a point upwind of the landing; (2) lower the
   grootzeil while aan de wind; (3) bear away to voor de wind on the fok; (4) lower the fok, get
   stootwillen and landvasten ready; (5) turn up to come alongside the bank. Unchanged.

Against the viewer's current choices (`../discussiepunten.md`, which follows the Katwijk book):

- **Overstag**: Katwijk §5.6.1 has *Fok los*; the melder (#11) wants a killing fok. Sint Maarten has
  a third version: fok ree (now explicitly: the fok only draws at the luff), then fok bak in the
  wind, fok over gradually, fok aan.
- **Hogerwal**: Sint Maarten agrees with the melder's point 2 ("nooit helemaal klapperen"), against
  Katwijk's "tot ze helemaal klapperen".

### Oefenvragen (part II, pp. 51–60) — answers on pp. 61–62

All multiple choice with an answer key. Many answers have an explanation (toelichting). No questions
were added for §7.9.

| § | p. | Questions (topic per number) |
|---|---|---|
| 1 Bootonderdelen & zeiltermen | 51–52 | 1 kous · 2 bezeild · 3 binnen de wind · 4 fok corner on a picture (schoothoek) · 5 rudder part on a picture (roerkoning) · 6 hogerwal/lagerwal/hoge/lage kant on a picture · 7 line lacing the sail to giek and gaffel (marllijn) · 8 which boat sails ruime wind · 9 rounding a buoy boven-/benedenwinds · 10 afvallen |
| 2 Veiligheid, weer | 53 | 1 reddingsvest requirement (15 s) · 2 40 km/h in Beaufort · 3 sudden wind shift · 4 stay with a capsized boat · 5 large ship verlijeren · 6 where zuiging is worst · 7 krimpen · 8 description of Bft 5 |
| 3 Bruggen & sluizen | 54 | 1 bridge where passage is allowed with oncoming traffic possible · 2 bridge about to open · 3 hoogteschaal reading (key now A, 3,8 m) · 4 two yellow diamonds · 5 bridge already closing |
| 4 Reglementen & voorrang | 55–57 | 1–23 "who has right of way" on 23 diagrams: crossing, opposite, overtaking, sail/oar/motor, large ship, hoofd-/nevenvaarwater, stuurloos boat, crossing a fairway, and engtes (16–23) · 24 sign "stil houden" · 25 sound signal long-short-long · 26 minimum age large ship · 27 BPR on all waters? · 28 "sport" sign (option C now "Recreatievaart") · 29 speed sign 6 · 30 fast motorboat (age + KVB) |
| 5 Optische tekens | 58 | 1 zwarte bol · 2 zwarte kegel · 3–6 identify a ship from its night lights · 7 **lights of a sailing lelievlet at night** |
| 6 Schiemannen | 59 | 1 knot for equal thickness · 2 platte knoop + dubbele schootsteek · 3 which picture is a dubbele halve steek · 4 non-slipping loop · 5 natural vs synthetic rope · 6 where stretch helps |
| 7 Krachten | 60 | 1 luffing faster (weight to lee) · 2 sail fault on a picture (too loose) · 3 luffing fast from halve wind · 4 checking the sail · 5 heel to windward · 6 stability of a keelboat · 7 lateraalpunt · 8 driftbeperkende middelen |

---

## Kielboot II (v2.4, 52 pp.) — `kielboot-ii-lesboek.pdf`

The oldest of the three: begun in 2018 to replace the group's "flink verouderde" theory book (p. 3).
Version history p. 4: 1.5 9 Jan 2019 eerste druk; 1.6 23 Aug 2019 part III added; 1.7 Sept 2019;
2.0 5 Jan 2020; 2.1 21 March 2020; 2.2 23 March 2021 ("Figuur 2.5 vernieuwd en toevoeging
antwoordenblad"); **2.3 6 Nov 2023 "Update hoofdstuk reglementen"; 2.4 31 Dec 2025 "Spelling
correcties"**. Colophon p. 2: "Opgeleverd op 31 december 2025". Same structure and largely the same
text and figures as KB III, minus optische tekens, BPR detail and the physics. Since 2.3 its
voorrang chapter is the KB III text and diagrams (without engte and the BPR extras). Blank pages: 6,
12, 16, 28, 32, 52.

| Pages | Chapter / topic |
|---|---|
| 7–11 | **1 Bootonderdelen & Zeiltermen**: bakboord/stuurboord, loef/lij, hogerwal/lagerwal (7); koersen (8); boven-/benedenwinds with a racing tip (8–9); overige termen (9); fig. 1.5 drawing (10) and Tabel 1.1 with grey numbers (11); term list (11) |
| 13–15 | **2 Veiligheid, Weer & Vaarproblematiek**: reddingsvest, 7 requirements (13); omslaan, gedragsregels (13); schippersgroet, weer (KB II up to **Bft 4**), weersomslag, ruimen/krimpen (14); dode hoek, zuiging, diepgang, verlijeren (14–15) |
| 17–20 | **3 Bruggen & Sluizen**: the same as KB III without hoogteschaal and spuien/inlaten (figs 3.1–3.15); brug-sluis combination (20) |
| 21–24 | **4 Reglementen & Voorrangsregels** (rewritten in 2.3): motorschip, zeilschip (a sailboard counts, a sailing boat with its motor on does not), klein/groot schip; goed zeemanschap; ANWB Wateralmanak (21); fig. 4.1, kruisende koersen rules 1–6.2 with a diagram each, incl. hoofd-/nevenvaarwater and "motor- en roeiboten onderling: het schip van rechts gaat voor" (22); tegengestelde koersen 1–5 with diagrams, rule 5 "roei- of motorschepen onderling: beide wijken naar stuurboord"; oplopen, normally to port, sailing boats to windward (23); §4.3.1 the rules in a row; §4.3.2 crossing a fairway gives no right of way, "stuurboordswal" means the starboard side of the fairway, not the actual bank (fig. 4.2) (24). The racing-exceptions remark of 2.2 is gone |
| 25–27 | **5 Schiemannen**: 10 knots or tasks with aftekentabel (as KB III, without the double sheet bend and the slipped double half hitch) |
| 29–30 | **6 Krachten op het schip**: force arrows, wind as a field of arrows, draaipunt near the mast (6.1–6.3); fok bears away, grootzeil luffs (6.4–6.5); sail good/too tight/too loose (6.6–6.8); helling: the boat is loefgierig by itself, crew to lee luffs faster |
| 31–42 | **II Oefenvragen** (divider 31; questions 33–40, answers 41–42) |
| 43–51 | **III Zeilmanoeuvres** (divider 43): oploeven 44, afvallen 45, overstag 46, gijp 47, hogerwal 48–49, man over boord 50, stormrondje 51 (no lagerwal). Now set as text over vector drawings (2.2 had them as images); same as the KB II manoeuvre cards, see below |

Figures: 1.1 hoger-/lagerwal; 1.2 windkoersen; 1.3 boven-/benedenwinds past a buoy; 1.4 opkruisen;
1.5 parts drawing; 2.1–2.4 dode hoek, zuiging, diepgang, verlijeren; 3.1–3.10 bridges; 3.11–3.15
locks; 4.1 voorrangskoersen; unnumbered rule diagrams (22–23); 4.2 two boats both on stuurboordswal
in open water; 5.1–5.12 knots; 6.1 krachten, 6.2 windpijlen, 6.3 draaipunt (seesaw); 6.4–6.5 effect
fok/grootzeil; 6.6–6.8 sail setting.

Terms (list p. 11): bakboord … voor de wind, oploeven, afvallen, bovenwinds, benedenwinds, overstag,
gijpen, opkruisen, laveren, killen van het zeil, opschieten (coiling, = opbossen), beleggen, bak,
deinzen.

Parts: Tabel 1.1 as KB III. Grey (not for KB II): 6, 7, 8, 11, 20, 23, 27, 30, 40, 61, 62, 63, 64,
65, 69, 86, 87, 88.

Oefenvragen (all answered, pp. 41–42):

| § | p. | Topics |
|---|---|---|
| 1 | 33–34 | 1 top edge of the hull (dolboord; the key lists dolboord–boeisel–berghout–kim–vlak top to bottom) · 2 hanenkam · 3 opkruisen/laveren · 4 corner of the grootzeil (tophoek) · 5 vingerlingen · 6 wallen and kanten · 7 val for the fok · 8 ruime wind · 9 rounding a buoy · 10 oploeven |
| 2 | 35 | 1 reddingsvest · 2 gedragsregels · 3 sudden wind shift · 4 capsize · 5 verlijeren · 6 zuiging · 7 krimpen · 8 dode hoek |
| 3 | 36 | 1 two yellow lights · 2 bridge about to open · 3 green diamonds · 4 one yellow diamond · 5 bridge closing |
| 4 | 37–38 | 1–15 "who has right of way" diagrams (redrawn as vector), plus follow-up questions 5 (order of three boats), 9 (which kind of course), 10 (stuurloos boat), 12–13 (crossing a fairway) |
| 5 | 39 | knots: unequal thickness, picture, securing a mastworp, halve steek picture, ring, stopper knot |
| 6 | 40 | weight to lee, sail too tight, luffing from halve wind, checking the sail, sail too loose |

## Kielboot I (v1.1, 40 pp.) — `kielboot-i-lesboek.pdf`

Made after KB II had been used for two years; same content cut down to KB I, in simpler language for
younger pupils (p. 3). Version history p. 4: 0.1 26 Feb 2021 … 1.0 27 May 2021, **1.1 31 Dec 2025
"Spellingverbeteringen en correct loef en lij voorbeeld"**. Page layout identical to 1.0.

| Pages | Chapter / topic |
|---|---|
| 7–11 | **1 Bootonderdelen & Zeiltermen**: bakboord ("links") and stuurboord ("rechts"), loef/lij, hogerwal/lagerwal (7); koersen, oploeven, afvallen (8); overstag ("ook wel 'wending'"), opkruisen, gijpen (9); fig. 1.8 drawing (10); Tabel 1.1 with the **40 blue numbers to know** (11); term list (11) |
| 13–14 | **2 Veiligheid**: when to wear a reddingsvest (incl. "boots/schipper"), 4 simple requirements, fig. 2.1 with its parts (handvat, kraag, reflector, fluitje, riem, kruisband) (13); omslaan, gedragsregels, schippersgroet (14) |
| 15–17 | **3 Reglementen & Voorrangsregels**: five kinds of boat incl. roeiboot, each with its pictogram; goed zeemanschap (15); kruisend rules 1–4.2, tegengesteld 1–2 (16); oplopen, overtaking to windward vs to leeward (figs 3.2, 3.3), crossing a fairway gives no right of way, the rules in a row (17) |
| 19–21 | **4 Schiemannen**: 10 knots or tasks (as KB II) with aftekentabel |
| 23 | **5 Krachten op het schip**: fok bears away, grootzeil luffs; sail too tight (leech flutters), too loose (backs at the luff); trim by easing until it backs, then a little in |
| 25–33 | **II Oefenvragen** (27–32), answers (33) |
| 34–38 | **III Zeilmanoeuvres**: oploeven 35, afvallen 36, overstag 37, gijp 38. Still the 2021 image pages, unchanged in 1.1, so their text is the **old** KB III 1.0 text (oploeven "één koers voor lopen", afvallen "tot de stand van de koers", no Extra Gewicht for overstag/gijp) |

Figures: 1.1 hoger-/lagerwal; 1.2 windkoersen; 1.3 oploeven; 1.4 afvallen; 1.5 overstag; 1.6
opkruisen; 1.7 gijpen; 1.8 parts drawing; 2.1 reddingsvest with parts; 3.1 voorrangskoersen;
unnumbered rule diagrams; 3.2 oplopen aan loef; 3.3 oplopen aan lij; 4.1–4.12 knots; 5.1 effect fok;
5.2 effect grootzeil; 5.3 sail good; 5.4 sail backing.

Terms (list p. 11): bakboord, stuurboord, loefzijde, lijzijde, hoge kant, lage kant, hogerwal,
lagerwal, in de wind, aan de wind, halve wind, ruime wind, voor de wind, oploeven, afvallen, overstag
gaan, opkruisen, gijpen.

Parts to know for KB I (blue, p. 11): 1 Fok, 9 Mast, 12 Rijglijn, 13 Mastbout, 15 Grootzeil,
21 Voorlijk, 22 Achterlijk, 28 Gaffel, 31 Klauw, 32 Marllijn, 33 Giek, 35 Grootschootring, 36 Wervel,
37 Pettenlijntje, 38 Voorstag, 39 Zijstag, 41 Fokkeval, 42 Klauwval, 43 Piekeval, 44 Kraanlijn/dirk,
45 Fokkeschoot, 46 Grootschoot, 50 Boeg, 55 Voordek, 56 Achterdek, 58 Luchtkast, 59 Hanenkam,
60 Sleepoog, 66 Dol, 67 Dolpot, 68 Doft, 70 Vlonder/Denning, 72 Zwaard, 76 Zwaardpen, 77 Zwaardkast,
78 Zwaardplaatje, 79 Mastkoker, 80 Kikker, 81 Helmstok, 84 Roerblad (40).

Oefenvragen (all answered, p. 33):

| § | p. | Topics |
|---|---|---|
| 1 | 27–28 | 1 part on a picture (zwaard) · 2 hanenkam · 3 opkruisen · 4 part on a picture (giek) · 5 wallen/kanten · 6 val for the fok · 7–9 which boat sails ruime / aan de / voor de wind · 10 line on a picture (piekeval) · 11 oploeven |
| 2 | 29 | reddingsvest requirement, when to wear it, gedragsregels, capsize (the heading says "Veiligheid, Weer & Vaarproblematiek", copied from KB II) |
| 3 | 30 | six "who has right of way" diagrams |
| 4 | 31 | six knot questions |
| 5 | 32 | five questions on sail effects and trim |

---

## Manoeuvre Kaarten KB II (v2.0, 8 pp.) — `manoeuvrekaarten-kb-ii.pdf`

One A4 card per page, title and "KB II" in the header, no page numbers, no cover, no licence text.
The text and drawings are **identical to the KB II lesboek 2.4 pages 44–51**; the cards are those
pages without the book's numbering ("1. Oploeven" becomes "Oploeven") and page footer.

| Card | Manoeuvre | Steps and commands |
|---|---|---|
| 1 | Oploeven | (1) roer loslaten / klein duwtje; (2) zeil aantrekken: "probeer één koers voor te lopen met je zeil"; (3) roer vastpakken just before the course. Extra gewicht: aan lij |
| 2 | Afvallen | (1) grootzeil vieren "tot de stand van de koers waar je heen wilt varen"; (2) afvallen met het roer; (3) roer recht. No weight tip |
| 3 | Overstag | (1) veiligheid; (2) aan de wind, **'Klaar om te wenden'**; (3) **'fok ree'**, roer een duwtje, grootzeil aan; (4) in de wind **'fok bak'**; (5) fok over, grootzeil wat vieren en langzaam aan; (6) **'fok aan'** |
| 4 | Gijp | (1) veiligheid; (2) goed voor de wind, aan de verkeerde kant van het roer; (3) **'fok te loevert'**; (4) binnen de wind varen; (5) **'Klaar voor de gijp!'**, zeil binnenhalen; (6) **'gijp'**, zeil volledig vieren, roer vastpakken |
| 5–6 | Hogerwal | (1) aan de wind naar de hogerwal; (2) aan-de-windse lijnen, overstag kiezen; (3) overstag; (4) grootzeil en fok vieren, "nooit helemaal klapperen"; (5) de allerlaatste meter de wind in. Card 6: the four diagrams (moment van overstag, laat en vroeg, extra overstag, onderhalen) |
| 7 | Man over boord | (1) getuige 'Man over boord', roerganger **'zwem, wijs, fok bak en gooi een reddingsvest!'**; (2) zo snel mogelijk voor de wind, zeil vieren, roer plat, fok bak; (3) 3–4 bootlengtes "of tot je voorbij de aan de windse lijn van de man gevaren bent (blauw)"; (4) fok over en aan, oploeven; (5) overstag op de aan-de-windse lijnen; (6) snelheid regelen, wie haalt de man eruit: hoge kant achter de stag; (7) **man vast**, fok bak, bijliggen |
| 8 | Stormrondje | (1) voor de wind; (2) oploeven naar aan de wind, grootzeil aan, fok eventueel killend; (3) overstag; (4) zo snel mogelijk afvallen; (5) blijven afvallen tot voor de wind |

How they differ from the lesboek text: not from KB II 2.4 (same pages). Against the KB II 2.2 /
KB III 1.0 pages they replace: the man-over-boord step 3 alternative (sail past the person's
aan-de-windse lijn, drawn in blue) is new, and the stormrondje lost "houd de fok bak om sneller af te
vallen" and its Extra Gewicht box, gaining a separate step "afvallen"; the afvallen card has no
Extra Gewicht box (KB I and KB III 1.0 had "gewicht aan loef"). Against KB III 1.1 and its
cards: KB II keeps the older oploeven/afvallen wording, has no Extra Gewicht for overstag or gijp,
no "geleidelijk" for fok over, no explanation of fok ree, no "rustig" in the stormrondje, and no
lagerwal. KB I 1.1 still has the older images for its four manoeuvres.

## Manoeuvre Kaarten KB III (v1.0, 9 pp.) — `manoeuvrekaarten-kb-iii.pdf`

Same format, "KB III" in the header. Text and drawings are **identical to the KB III lesboek 1.1
pages 65–73** (the "update aan manoeuvre kaarten" of the 1.1 version history), so the steps are those
listed under "Manoeuvres" above:

| Card | Manoeuvre | Lesboek page |
|---|---|---|
| 1 | Oploeven (sheet in when the grootzeil starts to back at the luff) | 65 |
| 2 | Afvallen (ease until it just kills at the luff; weight to windward) | 66 |
| 3 | Overstag (fok ree explained, fok over gradually, Extra gewicht lee → loef → neutral) | 67 |
| 4 | Gijp (Extra gewicht: loef to start, then the new loef to stop the turn) | 68 |
| 5–6 | Hogerwal, and its four diagrams | 69–70 |
| 7 | Man over boord (with the blue aan-de-windse lijn) | 71 |
| 8 | Stormrondje (five steps, "rustig" oploeven) | 72 |
| 9 | Lagerwal | 73 |

How they differ from the lesboek text: not from KB III 1.1. Against KB III 1.0 (the version our
older notes and the viewer's discussion were based on): every change marked *(1.1)* in the manoeuvre
list above. The weight advice moved from a single remark in the stormrondje (1.0) to the overstag
and gijp cards, and the afvallen weight tip into step 1.

---

## Changes since the older versions

Checked by comparing the text of every page (pdftotext) and, for the image-only and coloured parts,
by looking at the rendered pages.

- **KB III 1.0.0 → 1.1**: language fixes throughout ("wat" → "dat", "Binnenvaartpolitiereglement" in
  one word, "scheg" for "skeg", "opgeloefd", "verhaald", …); tegengestelde koersen regel 5 now
  stuurboord (pp. 24, 25); brug-sluis: "wacht dan dus voor de brug" instead of "achter de brug"
  (p. 20); bijlage-15 list capitalised (p. 28); p. 42 calls the too-loose sail "killen"; new §7.9
  *Krachten op het roer* with figs 7.33–7.35 (p. 47), which pushes part II two pages and part III
  three pages later (oefenvragen 49–60 → 51–62, manoeuvres 62–70 → 65–73, 72 → 76 pages); answer key
  3.3 and 4.7 corrected (p. 61); oefenvraag 4.28 option C reworded; manoeuvre pages updated (see
  above). Cover, figures of chapters 1–6, Tabel 1.1 and its grey numbers unchanged.
- **KB II 2.2 → 2.4**: §0.3 *Introductie* dropped, so the licence is now §0.4; chapter 4 rewritten in
  2.3 after KB III (two pages → four, diagrams per rule, stuurboord rule 5, racing remark gone),
  which pushes everything after it two pages later (schiemannen 23 → 25, krachten 27 → 29,
  oefenvragen 31–40 → 33–42, manoeuvres 42–49 → 44–51); brug-sluis "voor de brug"; answer key 4.7
  B → A (grote schepen) and 4.10 B → A (p. 42); manoeuvre pages now text, with the man-over-boord
  and stormrondje changes listed above; spelling.
- **KB I 1.0 → 1.1**: the loef/lij example of kruisende koersen regel 4.2 (p. 16) now reads
  "Zeilschip A ligt aan loef van zeilschip B en verleent dus voorrang", which matches the drawing;
  spelling. Same page numbers, same manoeuvre images.

## Errors and oddities

Fixed in the new versions:

- **KB III p. 24–25, tegengestelde koersen regel 5**: rowing or motor boats meeting head-on "wijken
  beide naar bakboord" in 1.0; now **stuurboord** (text, diagram caption and the summary on p. 25).
  KB II 2.4 has the rule with stuurboord too (pp. 23–24).
- **KB III oefenvraag 3.3** (hoogteschaal): the key said C, 4,8 m; now A, 3,8 m, with option A
  changed from 4,2 to 3,8 m (pp. 54, 61).
- **KB III oefenvraag 4.7**: the key said B by "hoofd gaat voor nevenvaarwater"; now A by "grote
  schepen gaan voor op kleine schepen" (p. 61). Same correction in KB II (key 4.7, p. 42).
- **KB I p. 16, regel 4.2**: the "lij gaat voor loef" example had the boats the wrong way round
  ("A ligt aan lij … heeft dus voorrang" while A is the windward boat); fixed in 1.1.
- KB III "skeg" in the text against "Scheg" in the table: now "scheg" everywhere (p. 41, fig. 7.11).

Still there in the new versions:

- ~~Parts table vs drawing, and "kiel" as a part~~: **not errors.** An earlier review here read Tabel 1.1
  against the Willibrordus drawing and the generic list wrongly; the owner checked the book (2026-10-11):
  the parts in the books are right. Don't report them.
- **Fig. 3.2, one red light at a movable bridge** (KB III p. 18, KB II p. 18): the book says that if
  it is the only opening and you fit under the closed bridge, you may pass. BPR art. 6.26 lid 4b and
  bijlage 7 G.2: one red light means "het doorvaren is verboden, de brug wordt bediend"; passing
  under a closed bridge is only allowed with the yellow light(s) of figs 3.3/3.4.
- **Fig. 3.13, red over green at a lock** (KB III p. 20; KB II fig. 3.12, p. 19): the book adds that
  some locks show it when about to close, and that you may then only enter if you cannot stop. BPR
  bijlage 7 G.4 gives red over green only as "invaart verboden, wordt aanstonds toegestaan"; the
  "only if you can no longer stop" meaning belongs to the closing signal of a bridge (fig. 3.7).
- **Groot motorschip** (KB III p. 30): "een toplicht (minimaal 4 meter hoog)" and "het tweede
  toplicht … is enkel verplicht als een schip langer is dan 110 meter". BPR art. 3.08 (version
  17-06-2026 in `../bpr/`): the toplicht at least 5 m, reduced to 4 m only for ships of at most 40 m;
  the second toplicht on the achterschip is optional ("mag"), with no length condition.
- **"Klein zeilschip (>7 meter)" / "(<7 meter)"** headings (KB III p. 31): BPR art. 3.13 lid 5 gives
  every small sailing ship the boordlichten + heklicht or the masthead tricolour; under 7 m it *may*
  instead carry one white all-round light (and must then show a second white light when another ship
  approaches, which the book leaves out). The headings suggest the first options are only for boats
  over 7 m.
- **Equal transit** (KB III p. 40): the air on the convex side "moet een langere weg afleggen" and so
  flows faster. That is the equal-transit fallacy; the result (lower pressure on the lee side) is
  right, the reason is not.
- **Net forward force** (KB III p. 42, §7.3.2): the verlijerende kracht "wordt opgeheven door de
  driftbeperkende kracht. Hierdoor blijft alleen de voortstuwende kracht nog over". This leaves out
  the hull's resistance against forward motion, and that lateral resistance only builds up with some
  leeway (drift), so the boat always verlijert a little.
- KB I p. 17 refers to fig. 3.3 for overtaking to windward, which is fig. 3.2.
- KB III p. 39, fig. 7.3: not an error ("in figuur 7.3 is een enkele zwarte krachtpijl te zien" is right; 7.4 shows the split).
- KB III answer 3.1 has garbled word order ("tegenliggende niet vaart mogelijk", p. 61).
- KB III p. 31 "Klein open motorschip … met een lengte van minder dan 7 meter een maximale snelheid
  … hoeft enkel en wit rondom schijnend licht te voeren" (missing "en", "en" for "een").
- KB II's version history mentions "Figuur 2.5 vernieuwd", but chapter 2 has only figs 2.1–2.4.
- KB II's answer key for chapter 4 uses one letter per number for both the diagram and its
  follow-up question. That makes 9 and 10 ambiguous: key 9 = B, but the "which course" option for
  overtaking is C; key 10 is now A, but the follow-up's goed-zeemanschap option (matching the
  toelichting) is D.
- KB II 2.4's p. 4 footer says "Versie 2.4 6 november 2023", while the table dates 2.4 to
  31 December 2025 (2.3 is the November 2023 version).

Things to check before reuse:

- The BPR content (ages, signs, motorplicht list, sound signals, lights) predates the BPR version that
  `../bpr/` uses (from 17-06-2026); check against `../bpr/` first.
- The books are written for the CWO diplomalijn, and their covers carry the CWO logo.
