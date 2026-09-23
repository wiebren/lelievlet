# Onderdelen van de lelievlet

Naslag voor wie de viewer gebruikt of controleert: elk onderdeel dat het 3D-model heeft, de andere
namen die de lesstof ervoor gebruikt, en of en hoe **Oefenen** ernaar vraagt.

Dit bestand wordt gemaakt door `web/scripts/docs.mjs` (`pnpm docs` in `web/`) uit
`web/public/models/lelievlet.parts.json` (het model) en `web/src/quizdata.js` (de vragen). Pas
het niet met de hand aan: verander de bron en draai het script opnieuw.

## Hoe te lezen

- **Onderdeel** is de naam die de viewer toont (hovertip, infotegel, onderdelenlijst); **Id** is de
  sleutel waarmee een insluitende pagina het onderdeel hernoemt (`namen.onderdelen`) of selecteert.
- **Andere namen** komen uit de lesstof; de bronsleutels staan in
  `reference/parts/SOURCES.md` en `reference/parts/CWO_NIVEAUS.md` (hoofdstuk 4). De naam
  waaronder Oefenen het vraagt staat in de kolom Oefenen.
- **Oefenen**: **vetgedrukt** is een vraag waarvan dit onderdeel het antwoord *is*, met het niveau
  waarop het gevraagd wordt: Zeilen I, II of III (CWO Zeilen Kielboot) en/of Roeien (CWO Roeiboot,
  zonder niveaus: alles tegelijk). "Telt mee bij" betekent dat een klik op dit onderdeel bij die vraag
  ook goed is, omdat het erbij hoort. Zeilen-niveau L vraagt alles tot en met L.
- Hoe de niveaus zijn bepaald, met bronnen en paginanummers: `reference/parts/CWO_NIVEAUS.md`.
  Waarom Roeien geen niveaus heeft: `reference/book/ROEIEN.md`.

## Onderdelen per groep

### Romp (casco)

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Achterdek | `achterdek` |  | **69 Achterdek** (Zeilen I, Roeien) |
| Schot achterste luchtkast | `achterschot` |  | — |
| Berghout (bakboord) | `berghout_bb` |  | **58 Berghout** (Zeilen II, Roeien) |
| Berghout (stuurboord) | `berghout_sb` |  | **58 Berghout** (Zeilen II, Roeien) |
| Dwarsbuis voordek | `boegrand` |  | telt mee bij 41 Dolboord |
| Boeisel (bakboord) | `boeisel_bb` |  | **42 Boeisel** (Zeilen III, Roeien) |
| Boeisel (stuurboord) | `boeisel_sb` |  | **42 Boeisel** (Zeilen III, Roeien) |
| Contour boeisel | `dekcontour` |  | telt mee bij 42 Boeisel |
| Dolboord (bakboord) | `dolboord_bb` | boordrand [OZS102], stootrand [WIL88, ARG] | **41 Dolboord** (Zeilen III, Roeien) |
| Dolboord (stuurboord) | `dolboord_sb` | boordrand [OZS102], stootrand [WIL88, ARG] | **41 Dolboord** (Zeilen III, Roeien) |
| Kim (bakboord) | `kim_bb` |  | **44 Kim** (Zeilen III, Roeien) |
| Kim (stuurboord) | `kim_sb` |  | **44 Kim** (Zeilen III, Roeien) |
| Mastkoker | `mastkoker` |  | **52 Mastkoker** (Zeilen III, Roeien) |
| Scheg | `scheg` |  | **47 Scheg** (Zeilen II, Roeien) |
| Spanten (wrangen) | `spanten` | wrang ≡ denningsteun [VDM8] | **84 Spant** (Zeilen III, Roeien) |
| Spiegel | `spiegel` |  | **46 Spiegel** (Zeilen II, Roeien) |
| Dolboord over de spiegel | `spiegelrand` |  | telt mee bij 41 Dolboord |
| Vlak (bakboord) | `vlak_bb` | bodem [ARG] | **45 Vlak** (Zeilen III, Roeien) |
| Vlak (stuurboord) | `vlak_sb` | bodem [ARG] | **45 Vlak** (Zeilen III, Roeien) |
| Voordek | `voordek` |  | **60 Voordek** (Zeilen I, Roeien) |
| Voorplecht | `voorplecht` | plecht | — |
| Schot voorste luchtkast | `voorschot` |  | — |
| Wrikgat | `wrikgat` |  | **70 Wrikgat** (Zeilen III, Roeien) |

### Roer

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Haak van het borgkettinkje | `borghaak_spiegel` |  | — |
| Borgkettinkje | `borgkettinkje` |  | — |
| Oog van het borgkettinkje | `borgoog_roer` |  | — |
| Helmhout | `helmstok` | helmstok (de meeste bronnen) | **71 Helmhout** (Zeilen I, Roeien) |
| Roerblad | `roerblad` |  | **75 Roerblad** (Zeilen I, Roeien) |
| Roerhaken | `roerhaken` |  | **73 Roerhaken** (Zeilen III, Roeien) |
| Roerkoning | `roerkoning` |  | **72 Roerkoning** (Zeilen II, Roeien) |
| Roerkop (helmhoutbeslag) | `roerkop` | helmhoutbeslag | telt mee bij 71 Helmhout |
| Vingerlingen | `vingerlingen` |  | **74 Vingerlingen** (Zeilen III, Roeien) |

### Zwaard en zwaardkast

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Zwaard | `zwaard` | midzwaard [VDM8, KATR], zwaardblad | **48 Zwaard** (Zeilen I, Roeien) |
| Zwaardkast | `zwaardkast` |  | **51 Zwaardkast** (Zeilen I, Roeien) |
| Zwaardloper | `zwaardloper_boven` | zwaardval [ARG, HBO] | **50 Zwaardloper** (Zeilen III, Roeien) |
| Zwaardloper | `zwaardloper_onder` | zwaardval [ARG, HBO] | **50 Zwaardloper** (Zeilen III, Roeien) |
| Strippen zwaardsleuf | `zwaardstrippen` |  | — |

### Interieur

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Bakskist | `bakskist` |  | — |
| Beslag van de bakskist | `bakskist_beslag` |  | — |
| Deksel van de bakskist | `bakskist_deksel` |  | — |
| Handvatten van de bakskist | `bakskist_handvatten` |  | — |
| Vlonder | `buikdenning` | buikdenning [VDM8, KATR], denning [KB3L, ARG] | **63 Vlonder** (Zeilen II, Roeien) |
| Achterste doft | `doft_achter` |  | **59 Doft** (Zeilen I, Roeien) |
| Voorste doft (mastdoft) | `doft_voor` |  | **59 Doft** (Zeilen I, Roeien) |
| Dofthouders | `dofthouders` |  | telt mee bij 59 Doft |
| EHBO-koffer | `ehbo_koffer` |  | — |
| Hoosblik | `hoosblik` |  | — |
| Meerpen | `meerpen` |  | — |

### Beslag

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Anker | `anker` |  | — |
| Ankerketting | `ankerketting` |  | — |
| Ankeroog | `ankeroog` |  | — |
| Banden van de gaffeldraad | `beslag_gaffel` |  | telt mee bij 4 Gaffeldraad |
| Dolpotten (bakboord) | `dolpotten_bb` |  | **57 Dolpot** (Zeilen III, Roeien) |
| Dolpotten (stuurboord) | `dolpotten_sb` |  | **57 Dolpot** (Zeilen III, Roeien) |
| Grendelbout | `grendelbout` | mastgrendel, borgbout | **54 Grendelbout** (Zeilen I, Roeien) |
| Grootschootoog | `grootschootoog` |  | **66 Grootschootoog** (Zeilen III) |
| Steun grootschootoog | `grootschootoog_steun` |  | telt mee bij 66 Grootschootoog |
| Hanekam | `hanekam` | hanenkam (de meeste bronnen) | **39 Hanekam** (Zeilen III, Roeien) |
| Hanepootloper | `hanepootloper` | spruitloper [MTX, SNEEK] | **82 Hanepootloper** (Zeilen III) |
| Harpje | `harpje_fokkenval` |  | — |
| Harpje | `harpje_strop` |  | telt mee bij 26 Strop van de gaffel |
| Harpjes | `harpjes` |  | — |
| Harpjes | `harpjes_fok` |  | — |
| Harpjes | `harpjes_mast` |  | — |
| Harpjes | `harpjes_wantketting` |  | — |
| Hijsogen | `hijsogen` |  | **65 Hijsogen** (Zeilen III, Roeien) |
| Kettinkje | `kettinkje_fok` | fokkekettinkje | **38 Kettinkje** (Zeilen III) |
| Kikkers op de mastkoker | `kikkers_mastkoker` |  | **55 Kikker** (Zeilen I, Roeien) |
| Kikkers op het voordek | `kikkers_voordek` |  | **55 Kikker** (Zeilen I, Roeien) |
| Landvastogen | `landvastogen` |  | **68 Landvastogen** (Zeilen III, Roeien) |
| Leiogen fokkenschoot (bakboord) | `leiogen_bb` | leioog fokkeschoot | **67 Leiogen van de fokkenschoot** (Zeilen III) |
| Leiogen fokkenschoot (stuurboord) | `leiogen_sb` | leioog fokkeschoot | **67 Leiogen van de fokkenschoot** (Zeilen III) |
| Leuvers | `leuvers` | leuvertje | **81 Leuver** (Zeilen I) |
| Mastbout | `mastbout` |  | **53 Mastbout** (Zeilen I) |
| Mikhouders | `mikhouders` |  | — |
| Schootring | `schootring` | hoefijzer [KATZ, MTX], grootschootring [KB3L] | **80 Schootring** (Zeilen I) |
| Sleepogen | `sleepogen` |  | telt mee bij 64 Sleepoog |
| Sleepoog | `sleepoog_boeg` |  | **64 Sleepoog** (Zeilen I, Roeien) |
| Strop van de gaffel | `strop_gaffel` |  | **26 Strop van de gaffel** (Zeilen III) |
| Wantputting (bakboord) | `wantputting_bb` |  | — |
| Wantputting (stuurboord) | `wantputting_sb` |  | — |

### Rondhouten

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Gaffel | `gaffel` |  | **6 Gaffel** (Zeilen I) |
| Giek | `giek` |  | **17 Giek** (Zeilen I) |
| Hommerring | `hommerring` | mastring; [VDM8] en [OZS102] onderscheiden mastring, topmastring en hommerring | **27 Mastring** (Zeilen III) |
| Klauw | `klauw` | gaffelklauw | **24 Klauw** (Zeilen I) |
| Lummelbeslag | `lummelbeslag` | lummelhouder; in de lesstof vaak lummelbout [KATZ, MTX, SNEEK, PRAET] | **21 Lummelbeslag** (Zeilen II) |
| Lummelbout | `lummelbout` |  | telt mee bij 21 Lummelbeslag |
| Mast | `mast` |  | **28 Mast** (Zeilen I) |
| Mastband met lummelbeslag | `mastband_lummel` |  | telt mee bij 21 Lummelbeslag |
| Masttopring | `masttopring` |  | — |
| Wervel | `wervel` |  | **15 Wervel** (Zeilen III) |

### Zeilen

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Fok | `fok` |  | **31 Fok** (Zeilen I) |
| Achterlijk fok | `fok_achterlijk` |  | **13 Achterlijk** (Zeilen II) |
| Halshoek fok | `fok_halshoek` | halsbroek [VDM8, KATZ, WIL88] | **34 Halshoek of -broek van de fok** (Zeilen II) |
| Onderlijk fok | `fok_onderlijk` |  | **35 Onderlijk van de fok** (Zeilen II) |
| Schoothoek fok | `fok_schoothoek` |  | **36 Schoothoek van de fok** (Zeilen II) |
| Tophoek fok | `fok_tophoek` |  | **33 Tophoek van de fok** (Zeilen II) |
| Voorlijk fok | `fok_voorlijk` |  | **32 Voorlijk van de fok** (Zeilen II) |
| Grootzeil | `grootzeil` |  | **12 Grootzeil** (Zeilen I) |
| Achterlijk grootzeil | `grootzeil_achterlijk` |  | **13 Achterlijk** (Zeilen II) |
| Bovenlijk grootzeil | `grootzeil_bovenlijk` |  | — |
| Halshoek grootzeil | `grootzeil_halshoek` |  | **20 Halshoek van het grootzeil** (Zeilen II) |
| Klauwhoek | `grootzeil_klauwhoek` |  | **25 Klauwhoek** (Zeilen II) |
| Onderlijk grootzeil | `grootzeil_onderlijk` |  | **19 Onderlijk van het grootzeil** (Zeilen II) |
| Schoothoek grootzeil | `grootzeil_schoothoek` |  | **14 Schoothoek van het grootzeil** (Zeilen II) |
| Tophoek grootzeil (piek) | `grootzeil_tophoek` | nokhoek [MTX, SNEEK, WIL88], piek | **7 Tophoek van het grootzeil** (Zeilen II) |
| Voorlijk grootzeil | `grootzeil_voorlijk` |  | **22 Voorlijk van het grootzeil** (Zeilen II) |
| Zeilnummer | `grootzeil_zeilnummer` |  | — |
| Zeilteken | `grootzeil_zeilteken` |  | — |
| Zeillatten | `zeillatten` |  | **8 Zeillat** (Zeilen III) |

### Staand want

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Ring van de pelikaanhaak | `pelikaanhaak_ring` | ring van de klephaak | **40 Voorstagspanner** (Zeilen III) |
| Voorstag met spanner | `voorstag` |  | **30 Voorstag** (Zeilen I) |
| Voorstagspanner met pelikaanhaak | `voorstagspanner` | spanner met klep, klephaak | **40 Voorstagspanner** (Zeilen III) |
| Bakboord zijstag | `want_bb` | want [KATZ, ARG] | **10 Zijstag** (Zeilen I) |
| Stuurboord zijstag | `want_sb` | want [KATZ, ARG] | **10 Zijstag** (Zeilen I) |
| Wantketting (bakboord) | `wantketting_bb` | wantspanner [SNEEK, ARG], talreep | **43 Wantketting** (Zeilen III) |
| Wantketting (stuurboord) | `wantketting_sb` | wantspanner [SNEEK, ARG], talreep | **43 Wantketting** (Zeilen III) |

### Lopend want

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Achterlandvast | `achterlandvast` |  | — |
| Ankerlijn | `ankerlijn` |  | — |
| Blok fokkenschoot (bakboord) | `blok_fokkenschoot_bb` |  | telt mee bij 37 Fokkenschoot |
| Blok fokkenschoot (stuurboord) | `blok_fokkenschoot_sb` |  | telt mee bij 37 Fokkenschoot |
| Blok fokkenval | `blok_fokkenval` |  | telt mee bij 29 Fokkenval |
| Bovenblok grootschoot | `blok_grootschoot_giek` |  | telt mee bij 18 Grootschoot |
| Onderblok grootschoot | `blok_grootschoot_kuip` |  | telt mee bij 18 Grootschoot |
| Blok klauwval | `blok_klauwval` |  | telt mee bij 1 Klauwval |
| Blok piekenval | `blok_piekenval` |  | telt mee bij 3 Piekenval |
| Borglijntje lummelbout | `borglijntje_lummelbout` |  | — |
| Dodemanseind | `dodemanseind` | dodemanslijn, spruitloperborglijn [SNEEK], dodemanslijntje [PRAET] | **83 Dodemanseind** (Zeilen III) |
| Fokkenschoot | `fokkenschoot` | fokkeschoot [KB3L] | **37 Fokkenschoot** (Zeilen I) |
| Fokkenval | `fokkenval` | fokkeval [KB3L] | **29 Fokkenval** (Zeilen I) |
| Gaffeldraad | `gaffeldraad` | spruit [MTX, SNEEK, KB3L] | **4 Gaffeldraad** (Zeilen III) |
| Grootschoot met blokken | `grootschoot` |  | **18 Grootschoot** (Zeilen I) |
| Klauwval | `klauwval` |  | **1 Klauwval** (Zeilen I) |
| Marllijn (gaffel) | `marllijn_gaffel` |  | **5 Marllijn** (Zeilen III) |
| Marllijn (giek) | `marllijn_giek` |  | **5 Marllijn** (Zeilen III) |
| Pettenlijntje | `pettenlijntje` |  | **16 Pettenlijntje** (Zeilen III) |
| Piekenval | `piekenval` | piekeval [KB3L], nokeval | **3 Piekenval** (Zeilen I) |
| Rijglijn | `rijglijn` |  | **23 Rijglijn** (Zeilen I) |
| Voorlandvast | `voorlandvast` |  | — |

### Roeien en wrikken

| Onderdeel | Id | Andere namen | Oefenen |
|---|---|---|---|
| Roeiriem (bakboord) | `riem_bb` | roeiriem | **85 Riem** (Roeien) |
| Roeiriem (stuurboord) | `riem_sb` | roeiriem | **85 Riem** (Roeien) |
| Wrikriem | `wrikriem` |  | telt mee bij 85 Riem |

## De vragen van Oefenen

81 vragen bij Zeilen (niveau I: 30,
tot en met II: 48, tot en met III: 81),
35 bij Roeien. Het nummer is dat van de onderdelentekening van de klasse
(`reference/book/onderdelen_lelievlet.json`); 85 en verder zijn namen van de roeilijst die de
zeiltekening niet nummert. Een insluitende pagina kan vragen weglaten (`quiz.weg`), toevoegen
(`quiz.erbij`) en hernoemen (`namen.quiz`); zie de README.

| Nr | Vraag | Zeilen | Roeien | Antwoord: onderdelen | Telt ook goed |
|---|---|---|---|---|---|
| 1 | Klauwval | I |  | Klauwval | Blok klauwval |
| 2 | Windvaan | III |  | Windvaan |  |
| 3 | Piekenval | I |  | Piekenval | Blok piekenval |
| 4 | Gaffeldraad | III |  | Gaffeldraad | Banden van de gaffeldraad |
| 5 | Marllijn | III |  | Marllijn (gaffel), Marllijn (giek) |  |
| 6 | Gaffel | I |  | Gaffel |  |
| 7 | Tophoek van het grootzeil | II |  | Tophoek grootzeil (piek) |  |
| 8 | Zeillat | III |  | Zeillatten |  |
| 9 | Kleed | III |  | Kleed (gebied op het grootzeil) |  |
| 10 | Zijstag | I |  | Bakboord zijstag, Stuurboord zijstag |  |
| 11 | Kraanlijn | I |  | kraanlijn | blok_kraanlijn |
| 12 | Grootzeil | I |  | Grootzeil |  |
| 13 | Achterlijk | II |  | Achterlijk grootzeil, Achterlijk fok |  |
| 14 | Schoothoek van het grootzeil | II |  | Schoothoek grootzeil |  |
| 15 | Wervel | III |  | Wervel |  |
| 16 | Pettenlijntje | III |  | Pettenlijntje |  |
| 17 | Giek | I |  | Giek |  |
| 18 | Grootschoot | I |  | Grootschoot met blokken | Bovenblok grootschoot, Onderblok grootschoot |
| 19 | Onderlijk van het grootzeil | II |  | Onderlijk grootzeil |  |
| 20 | Halshoek van het grootzeil | II |  | Halshoek grootzeil |  |
| 21 | Lummelbeslag | II |  | Lummelbeslag | Mastband met lummelbeslag, Lummelbout, lummelas |
| 22 | Voorlijk van het grootzeil | II |  | Voorlijk grootzeil |  |
| 23 | Rijglijn | I |  | Rijglijn |  |
| 24 | Klauw | I |  | Klauw |  |
| 25 | Klauwhoek | II |  | Klauwhoek |  |
| 26 | Strop van de gaffel | III |  | Strop van de gaffel | Harpje |
| 27 | Mastring | III |  | Hommerring |  |
| 28 | Mast | I |  | Mast |  |
| 29 | Fokkenval | I |  | Fokkenval | Blok fokkenval |
| 30 | Voorstag | I |  | Voorstag met spanner |  |
| 31 | Fok | I |  | Fok |  |
| 32 | Voorlijk van de fok | II |  | Voorlijk fok |  |
| 33 | Tophoek van de fok | II |  | Tophoek fok |  |
| 34 | Halshoek of -broek van de fok | II |  | Halshoek fok |  |
| 35 | Onderlijk van de fok | II |  | Onderlijk fok |  |
| 36 | Schoothoek van de fok | II |  | Schoothoek fok |  |
| 37 | Fokkenschoot | I |  | Fokkenschoot | Blok fokkenschoot (bakboord), Blok fokkenschoot (stuurboord) |
| 38 | Kettinkje | III |  | Kettinkje |  |
| 39 | Hanekam | III | ja | Hanekam |  |
| 40 | Voorstagspanner | III |  | Voorstagspanner met pelikaanhaak, Ring van de pelikaanhaak |  |
| 41 | Dolboord | III | ja | Dolboord (bakboord), Dolboord (stuurboord) | Dolboord over de spiegel, Dwarsbuis voordek |
| 42 | Boeisel | III | ja | Boeisel (bakboord), Boeisel (stuurboord) | Contour boeisel |
| 43 | Wantketting | III |  | Wantketting (bakboord), Wantketting (stuurboord) |  |
| 44 | Kim | III | ja | Kim (bakboord), Kim (stuurboord) |  |
| 45 | Vlak | III | ja | Vlak (bakboord), Vlak (stuurboord) |  |
| 46 | Spiegel | II | ja | Spiegel |  |
| 47 | Scheg | II | ja | Scheg |  |
| 48 | Zwaard | I | ja | Zwaard |  |
| 49 | Zwaardbout | III | ja | zwaardbout |  |
| 50 | Zwaardloper | III | ja | Zwaardloper, Zwaardloper | borgpen, kettinkje |
| 51 | Zwaardkast | I | ja | Zwaardkast |  |
| 52 | Mastkoker | III | ja | Mastkoker |  |
| 53 | Mastbout | I |  | Mastbout |  |
| 54 | Grendelbout | I | ja | Grendelbout |  |
| 55 | Kikker | I | ja | Kikkers op de mastkoker, Kikkers op het voordek |  |
| 56 | Dol | I | ja | dol_sb_voor, dol_bb_voor, dol_sb_achter, dol_bb_achter | dolketting_sb_voor, dolketting_bb_voor, dolketting_sb_achter, dolketting_bb_achter |
| 57 | Dolpot | III | ja | Dolpotten (bakboord), Dolpotten (stuurboord) |  |
| 58 | Berghout | II | ja | Berghout (bakboord), Berghout (stuurboord) |  |
| 59 | Doft | I | ja | Voorste doft (mastdoft), Achterste doft | Dofthouders |
| 60 | Voordek | I | ja | Voordek |  |
| 63 | Vlonder | II | ja | Vlonder |  |
| 64 | Sleepoog | I | ja | Sleepoog | Sleepogen |
| 65 | Hijsogen | III | ja | Hijsogen |  |
| 66 | Grootschootoog | III |  | Grootschootoog | Steun grootschootoog |
| 67 | Leiogen van de fokkenschoot | III |  | Leiogen fokkenschoot (bakboord), Leiogen fokkenschoot (stuurboord) |  |
| 68 | Landvastogen | III | ja | Landvastogen |  |
| 69 | Achterdek | I | ja | Achterdek |  |
| 70 | Wrikgat | III | ja | Wrikgat |  |
| 71 | Helmhout | I | ja | Helmhout | Roerkop (helmhoutbeslag) |
| 72 | Roerkoning | II | ja | Roerkoning |  |
| 73 | Roerhaken | III | ja | Roerhaken |  |
| 74 | Vingerlingen | III | ja | Vingerlingen |  |
| 75 | Roerblad | I | ja | Roerblad |  |
| 76 | Vlaggenstok | III | ja | Vlaggenstok |  |
| 78 | Vlag | III | ja | Vlag |  |
| 79 | Boeg | I | ja | Boeg (gebied) |  |
| 80 | Schootring | I |  | Schootring |  |
| 81 | Leuver | I |  | Leuvers |  |
| 82 | Hanepootloper | III |  | Hanepootloper |  |
| 83 | Dodemanseind | III |  | Dodemanseind |  |
| 84 | Spant | III | ja | Spanten (wrangen) |  |
| 85 | Riem | – | ja | Roeiriem (stuurboord), Roeiriem (bakboord) | Wrikriem |

## Niet gevraagd

- **61 Luchtkast** en **62 Mangat** staan op de tekening, maar niets in het model staat ervoor.
- **77 Knop van de vlaggenstok** hoort bij de Vlaggenstok.
- Van de roeilijst van 40: **Handvat** en **Blad** zijn delen van de riem en **Zwaardgreep** van het
  zwaard; ze worden vragen zodra het model ze als eigen onderdeel heeft.
