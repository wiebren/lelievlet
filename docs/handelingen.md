# Handelingen en manoeuvres — werklijst

Wat de viewer aan handelingen (bediening van boot en tuig) en manoeuvres (de boot die iets doet
ten opzichte van wind en wal) heeft en nog moet krijgen, met het CWO-niveau, de bron, de
voorwaarden om ze te kunnen starten en de gedeelde bouwstenen die ervoor nodig zijn. Wat er al is,
stap voor stap met de voorwaarden, staat in `docs/manoeuvres.md`.

Bronnen (sleutels als in `reference/parts/CWO_NIVEAUS.md`): **[KATZ]** het zeil-instructieboek
van de Katwijkse Zeeverkenners (PDF-pagina / gedrukte pagina, gedrukt = PDF − 6), **[KATR]** hun
roei-instructieboek (`reference/book/ROEIEN.md`, gedrukt = PDF − 4), **[JPR3]** CWO Roeien van
Scouting Nederland (2021), **[HBO]** de officiële CWO-eisen Kielboot (Handboek Opleidingen 2005,
normatief), **[VS1–3]** / **[VSR12]** / **[VSR3]** de vorderingsstaten van Scouting Nederland.

## Voorwaarden

Elke handeling heeft een lijst voorwaarden: wat er van de boot *nu* waar moet zijn (niet wat er het
laatst gevraagd is) voordat hij kan beginnen, elk met de reden die de knop toont zolang hij grijs
is. Wat niet genoemd wordt doet er niet toe: de mast strijken vraagt gestreken en opgebonden
zeilen, waar het anker of het midzwaard intussen is maakt niet uit. De tabel staat in `OPS` in
`web/src/modes.js`; nieuwe voorwaarden komen daar bij.

Elke manoeuvre krijgt ook een oefenvorm: de boot blijft staan en bij elke stap kies je uit vier de
volgende. De foute antwoorden zijn stappen die in de toestand van de boot wél kunnen, alleen niet
nu; daarvoor heeft elke stap een lijst van wat er vooraf gedaan moet zijn (`STEP_NEEDS`,
`REEF_NEEDS`). Een nieuwe manoeuvre levert die lijst mee.

Voorwaarden die de werklijst gebruikt:

| Voorwaarde | Betekenis |
|---|---|
| mast staat | de Mast-flow staat aan zijn begin |
| zeilen op | de Zeilen-flow staat aan zijn begin en speelt niet |
| zeilen gestreken | de zeilbinders zijn om (laatste stap van Zeilen) |
| geen rif bezig | de Reven-procedure speelt niet |
| anker op | het anker ligt aan boord, niet op de bodem |
| modus zeilen / roeien | de gekozen modus |
| koers … | de koers ten opzichte van de wind: aan de wind vanaf 45° (dichter bij de wind is het kop in de wind), halve wind vanaf 70°, ruime wind vanaf 112°, voor de wind vanaf 158° (`CLOSE_HAULED`, `HALVE_WIND`, `RUIME_WIND`, `DOWNWIND` in `modes.js`) |
| riemen uit | beide riemen liggen in hun dol |
| aan de wal | er ligt een wal of steiger binnen bereik |
| afgemeerd / los | de landvasten zijn vast aan de wal, of los |
| hogerwal / langswal / lagerwal | hoe de wind ten opzichte van de wal staat |
| geen vaart | de boot ligt (vrijwel) stil |

## Wat er is

| Handeling | Voorwaarden |
|---|---|
| Zeilen hijsen | mast staat, geen rif bezig |
| Zeilen aanslaan / afslaan | afslaan: zeilen gestreken en opgebonden; hijsen kan pas weer na aanslaan |
| Zeilen strijken | geen rif bezig; zonder anker (kop in de wind valt weg als ze al stil ligt) |
| Mast strijken | zeilen gestreken |
| Mast zetten | — |
| Reven | zeilen op |
| Overstag gaan (wenden) | zeilen op, anker op, niet afgemeerd, aan de wind of halve wind, geen rif, wending of gijp bezig |
| Gijpen | zeilen op, anker op, niet afgemeerd, ruime of voor de wind, geen rif, wending of gijp bezig |
| Stormrondje | als gijpen |
| Afmeren: sliplanding hogerwal | als de sliplanding langswal; legt een steiger dwars op de wind voor de boeg en eindigt kop in de wind op het voorlandvast |
| Afmeren: opschieter hogerwal | zeilen op, anker op, halve wind of ruimer, geen rif, wending of gijp bezig; legt een steiger dwars op de wind voor de boeg |
| Afmeren: sliplanding langswal | zeilen op, anker op, niet kop in de wind, geen rif, wending of gijp bezig; legt zelf een langswal aan lij naast het eind van de sliplanding |
| Afmeren: voor top en takel langswal | als de sliplanding; strijkt onderweg grootzeil en fok en ligt daarna met de wind van achteren |
| Opkruisen | zeilen op, anker op, niet afgemeerd, niet kop in de wind, geen rif of wending bezig; legt een kanaal langs de wind |
| Man over boord | zeilen op, anker op, niet afgemeerd, niet kop in de wind, geen rif, wending of gijp bezig; legt een drenkeling in het water |
| Dwarspeiling (in Wenden) | zeilen op, anker op, niet afgemeerd, niet kop in de wind, geen rif, wending of gijp bezig; een punt op het water, de peiling getekend, overstag en erover |
| Afmeren: aanleggen aan lagerwal | als de sliplanding; strijkt onderweg grootzeil en fok en ligt langszij met de wind op de kant |
| Afvaren van hogerwal | met de boeg aan een hogerwal, kop in de wind, zeilen op, geen rif |
| Afvaren van lagerwal | afgemeerd aan een lagerwal, grootzeil en fok gestreken, geen rif; roeit eerst van de kant |
| Ankeren onder zeil | zeilen op, niet afgemeerd, niet kop in de wind, geen rif of wending bezig |
| Ankeren zonder zeilen | grootzeil en fok omlaag, niet afgemeerd |
| Anker op onder zeil | voor anker, grootzeil en fok gestreken, mast staat, geen rif |
| Anker op zonder zeilen | voor anker, grootzeil en fok omlaag |
| Kop in de wind leggen | afgemeerd aan een langswal, zeilen gestreken, wind van achteren |
| Afvaren van langswal | afgemeerd aan een langswal, kop in de wind, zeilen op, geen rif |
| Bijliggen / weer varen | bijliggen: zeilen op, anker op, niet afgemeerd, aan de wind tot halve wind (40°–120°), geen rif, wending of gijp bezig; weer varen: ze ligt bij |
| Verhalen | afgemeerd, langszij (niet met de boeg of de spiegel aan de kant), zeilen gestreken, geen afmeren of draaien bezig |
| Roeien: achtje, aanleggen met de boeg, zijwaartse aanleg, aanleggen met de spiegel | modus roeien, anker op, niet afgemeerd; aanleggen legt zelf een kant |
| Roeien: afvaren | modus roeien, aan de kant (langszij, met de boeg of met de spiegel) |
| Roeien: man overboord | modus roeien, anker op, niet afgemeerd, dwars op de wind (45°–135°) |
| Roeien: ankeren / anker op | modus roeien; ankeren: niet afgemeerd; anker op: voor anker |
| Anker uit / op, midzwaard, riemen en dollen, roeicommando's, sturen | (zonder voorwaarden in het menu) |

Bekende verbetering: [KATZ] 70/64 en [HBO] p. 6 geven hijsen een eigen volgorde (grootschoot en
zeilbandjes los; gaffel op ±45°, beide vallen samen; klauwval vast; piek stellen met een plooi van
nok naar hals; fok als laatste; vallen opschieten). Nu is hijsen strijken achteruit.

## Nog te beslissen: commando's

Wat een stap roept staat in de tekstballon en in `docs/manoeuvres.md`. Deze commando's staan niet
letterlijk bij die stap in het zeilinstructieboek; ze blijven voorlopig staan, tot er een besluit
over is:

| Commando | Stap | Manoeuvre |
|---|---|---|
| *Ree!* | Overstag gaan | Man over boord |
| *Fok bak!* | Fok bak trekken | Man over boord |
| *Fok bak!* | Fok bak, grootzeil helemaal uitvieren | Afvaren van hogerwal |
| *Voorlandvast los, afzetten!* | Voorlandvast los, recht naar achteren afzetten | Afvaren van hogerwal |
| *Grootzeil hijsen!* | Grootzeil hijsen | Afvaren van lagerwal |
| *Fok hijsen!* | Fok hijsen | Afvaren van lagerwal |
| *Vaarweg vrij?* | Kijken of de vaarweg vrij is | Afvaren van hogerwal, langswal en lagerwal |
| *Stootwillen buitenboord!* | Stootwillen buitenboord | Aanleggen aan lagerwal |
| *Fok strijken!*, *Grootzeil strijken!* | Fok strijken, Grootzeil strijken | Ankeren onder zeil, voor top en takel, aanleggen aan lagerwal |
| *Grootzeil hijsen!*, *Fok hijsen!* | Grootzeil hijsen, Fok hijsen | Anker op onder zeil |
| *Fok bak!* | Fok bak trekken | Anker op onder zeil |
| *Fok bak!* | Fok bak houden | Bijliggen |
| *Haakvoor, is het anker geborgd?* | Vragen of het anker geborgd is | Ankeren roeiend |
| *Springen los!*, *Springen vast!* | Springen losmaken, Springen weer vastmaken | Verhalen |
| *Voorlandvast verzetten!*, *Achterlandvast verzetten!* | Landvast naar de volgende bolder | Verhalen |
| *Halen!* | Aan de landvast halen | Verhalen |
| *Voorlandvast vast!*, *Achterlandvast vast!* | Landvast opnieuw vastmaken | Verhalen |
| *Fok bak houden!* | Fok bak houden | Overstag, stormrondje; *Fok bak houden!* ook bij afvaren van langswal |
| *Stootwillen uit!*, *Zeilen los!*, *Grootzeil aan!* | Stootwillen uit, Zeilen los, Grootzeil aan | Sliplanding langswal en hogerwal |
| *Voorlandvast vast!*, *Achterlandvast vast!*, *Achterspring vast!*, *Voorspring vast!* | De landvasten en springen vastmaken | Afmeren (alle vormen), kop in de wind leggen |
| *Voorspring los!*, *Achterspring los!*, *Achterlandvast los!* | De lijnen losmaken | Afvaren van langswal, kop in de wind leggen |
| *Voorlandvast los, afduwen!* | Voorlandvast los, afduwen | Afvaren van langswal |
| *Wijs!* | Iemand aanwijzen die naar de drenkeling wijst | Man over boord (zeilen; het boek zegt alleen "De stuurman wijst iemand aan") |
| *Stootwil naar de boeg!*, *Voorlandvast los!*, *Spiegel afduwen!*, *Stootwillen naar de andere kant!* | De stappen van kop in de wind leggen | Kop in de wind leggen (geen boek beschrijft deze manoeuvre) |
| *Op riemen, bakboord strijkt, stuurboord haalt op… gelijk!* | Achteruit rond, van de boeg aan de kant af | Afvaren roeiend (eigen stap, niet in CWO Roeien) |

## Afwijkingen van de boeken: te beslissen

Uit een controle van alle manoeuvres tegen de bronnen (september 2026). Waar de viewer anders doet dan
het boek, staat hier wat de viewer doet, wat de bron zegt, en wat er beslist moet worden: het boek
volgen, of de afwijking houden en hem als bewuste keuze in `docs/manoeuvres.md` vermelden. Waar de
boeken het onderling oneens zijn, staat dat erbij; daar volgt de viewer er één.

### Te beslissen

| # | Manoeuvre | De viewer | De bron | Beslissing |
|---|---|---|---|---|
| 1 | Overstag | Na *Fok bak* nog *Fok bak houden* (met de roep *Fok bak houden!*) en *Afvallen*, dan *Fok over* | [KATZ] 76/70, [HBO] p. 7 en Meestoxopeus: van *fok bak* rechtstreeks naar *fok over* ("als de boot net door de wind heen is") | De twee stappen weghalen, of houden als toelichting op wat er gebeurt |
| 2 | Overstag | Geen stap *Kijken of de weg vrij is* | [KATZ] 76/70, stap 2 | Toevoegen, of weglaten omdat het water leeg is |
| 3 | Man over boord (zeilen) | Ze vaart 1,5 bootlengte door voor ze keert | [HBO] p. 13: ongeveer 4 bootlengtes; [KATZ] 89–90: 3 à 4, of 4 à 5 scheepslengtes | Naar 4 bootlengtes, of houden (korter in beeld) |
| 4 | Man over boord (zeilen) | Geen *Man dwars!* en *Man vast!* | [HBO] p. 13 | Toevoegen |
| 5 | Aanleggen aan lagerwal | Laatste stap: op het laatste moment van de kant af sturen, een kwartslag, langszij | [KATZ] 88/82 en Meestoxopeus: eindigen met "Alles in orde maken om aan te kunnen leggen" | De stap houden (het komt van ons, niet uit het boek), of het boek volgen |
| 6 | Reven | Grootschoot verhangen en schootring terug vóór de vallen doorgezet worden; begint met *Kop in de wind* | [KATZ] 72/66: klauwval vast, piekenval stellen, en het hoefijzer als laatste; geen *kop in de wind* in de lijst | De volgorde van het boek nemen |
| 7 | Hijsen | Strijken achteruit | [KATZ] 70/64 en [HBO] p. 6: een eigen volgorde (grootschoot los, gaffel op ±45°, klauwval vóór piek, fok als laatste, vallen opschieten) | Een eigen hijsvolgorde bouwen (al bekend) |
| 8 | Strijken | De mik vóór grootzeil strijken | [KATZ]: de mik na grootzeil strijken | Al bekend; de volgorde van het boek nemen |
| 9 | Sliplanding | *Grootzeil aan* altijd | [KATZ] 85/79: alleen "als je te vroeg stilligt" | Houden (zo toont hij wat het boek bedoelt), of alleen als ze te vroeg stil ligt |
| 10 | Anker op onder zeil (Oefenen) | *Anker binnenhalen* mag na *Anker los* | [KATZ] 95/89: pas na *Rustige koers wegvaren* | `ANCHOR_NEEDS.binnen` op `['weg']` zetten |
| 11 | Kop in de wind leggen, verhalen, ankeren en anker op zonder zeilen | Eigen stappen en roepen | Geen boek beschrijft deze manoeuvres ([KATZ] 83/77 zegt alleen "zonodig ... verhaalt") | Houden als eigen uitwerking; zo in de docs zetten |

### De boeken zijn het oneens; de viewer volgt er één

| Manoeuvre | De viewer volgt | De andere bron |
|---|---|---|
| Bijliggen | Meestoxopeus p. 3: het grootzeil iets vieren, zoals bij ruime wind | [KATZ] 9/3 noemt het *bijdraaien* en viert het grootzeil helemaal; *bijliggen* is daar een stormtechniek |
| Voor top en takel | [KATZ] 87/81: afvallen tot voor de wind | Meestoxopeus p. 82: afvallen tot ruime wind |
| Afvaren van hogerwal (deinzen) | [KATZ]: fok bak | [HBO] p. 12: "bij voorkeur zonder fok bak" |
| Man over boord, het eind | [KATZ]: rustige koers doorvaren | [HBO]: bijliggen |

### Roeien

| # | Manoeuvre | De viewer | De bron | Beslissing |
|---|---|---|---|---|
| 12 | Afvaren roeiend | Van de boeg aan de kant: een eigen stap achteruit rond | [JPR3] p. 19 beschrijft alleen afvaren langszij | Houden als eigen uitwerking, of alleen langszij toestaan |
| 13 | Afvaren roeiend (Oefenen) | *Riemen toe* mag vóór het afzetten | [JPR3] p. 19: riemen toe "als er genoeg ruimte is", na het afzetten | *toe* laten wachten op *zet* |
| 14 | Ankeren roeiend (Oefenen) | *Het anker overboord* pas na *strijken* | [JPR3] p. 23: strijken kan, "bijv. bij weinig wind" | Strijken niet verplicht stellen |
| 15 | Man overboord roeiend | De drenkeling altijd binnen tussen de eerste en de tweede doft | [JPR3] p. 22: zo zonder mast; met een mast bij het zijstag | Kiezen naar of de mast staat |

## Werklijst

Niveau: KB = CWO Zeilen Kielboot, R = CWO Roeiboot. Omvang: S / M / L.
Bouwstenen: zie het volgende hoofdstuk.

### Zeilmanoeuvres

| # | Manoeuvre | Niveau, bron | Voorwaarden | Bouwstenen | Omvang |
|---|---|---|---|---|---|
| A1 | Overstag gaan — gedaan | KB I; [VS1] 6, [HBO] p. 7, [KATZ] 76/70 | zeilen op, anker op, aan de wind | draaien, vaart | M |
| A2 | Gijpen — gedaan | KB I; [VS1] 8, [HBO] p. 7, [KATZ] 77/71 | zeilen op, anker op, voor de wind | draaien, vaart | M |
| A3 | Stormrondje — gedaan | KB II/III; [HBO] p. 11, 17, [KATZ] 78/72 | zeilen op, anker op, ruime of voor de wind | draaien | S |
| A4 | Oploeven, afvallen, opkruisen — opkruisen gedaan | KB I–III; [HBO] p. 7, 17, [KATZ] 74–75/68–69, 81/75 | zeilen op | draaien | S–M |
| A5 | Bijliggen — gedaan, met weer varen | KB II/III; [HBO] p. 18, [KATZ] 9/3 | zeilen op, anker op | vaart | S |
| A9 | Man over boord onder zeil — gedaan | KB II/III; [VS2] 14, [HBO] p. 13, 18, [KATZ] 89–90/83–84 | zeilen op, anker op | draaien, vaart | L |
| A10 | Ankeren / anker op onder zeil — gedaan, ook zonder zeilen | KB III; [HBO] p. 19, [KATZ] 93–95/87–89 | zeilen op, anker aan boord | vaart | M |
| A11 | Varend hijsen | KB III; [HBO] p. 16, [KATZ] 71/65 | mast staat, zeilen gestreken, anker op | — | S |
| A12 | Loskomen van de grond | KB II/III; [HBO] p. 19, [KATZ] 91/85 | zeilen op | — | S–M |

### Aanleggen en afvaren

| # | Manoeuvre | Niveau, bron | Voorwaarden | Bouwstenen | Omvang |
|---|---|---|---|---|---|
| D1 | Afvaren van hogerwal — gedaan | KB I; [VS1] 9, [HBO] p. 7, [KATZ] 82/76 | afgemeerd, hogerwal, zeilen op, anker op | wal, afmeren, vaart, draaien | L |
| D2 | Afvaren van langswal — gedaan | KB I; [KATZ] 83/77 | afgemeerd, langswal, zeilen op | wal, afmeren, vaart, draaien | M |
| D3 | Afvaren van lagerwal — gedaan | KB II/III; [KATZ] 84/78 | afgemeerd, lagerwal, mast staat, zeilen gestreken | wal, afmeren, vaart | M |
| D4 | Aankomen aan hogerwal (sliplanding) — gedaan | KB I onder toezicht, II/III; [HBO] p. 7, 18, [KATZ] 85/79 | los, aan de wal, zeilen op, anker op, aan de wind | wal, vaart, draaien | L |
| D5 | Opschieter — gedaan | KB II/III; [KATZ] 86/80 | los, aan de wal, zeilen op, halve of ruime wind | wal, vaart, draaien | M |
| D6 | Aanleggen aan lagerwal / voor top en takel — gedaan | KB III; [HBO] p. 18, [KATZ] 87–88/81–82 | los, lagerwal, zeilen op, aan de wind | wal, vaart, draaien | M |
| D7 | Afmeren (landvasten en springen) — gedaan | KB I+, R; [HBO] p. 7, 19, [KATZ] 73/67 | aan de wal, geen vaart | wal, afmeren | M |
| D8 | Afvaren roeiend — gedaan | R I+; [KATR] 15/11, [JPR3] p. 19 | afgemeerd, modus roeien, anker op | wal, afmeren, vaart | S |
| D9 | Aanleggen met de punt — gedaan (met de boeg) | R I/II; [VSR12] 4, [KATR] 15/11, [JPR3] p. 19 | los, aan de wal, modus roeien, riemen uit | wal, vaart | M |
| D10 | Aanleggen met de zijkant — gedaan | R III; [VSR3] 7, [KATR] 16/12, [JPR3] p. 20 | los, aan de wal, modus roeien, riemen uit | wal, vaart, draaien | M |
| D11 | Aanleggen met de spiegel — gedaan | R III; [VSR3] 6, [JPR3] p. 21 | los, aan de wal, modus roeien, riemen uit | wal, vaart, draaien | M |
| D12 | Verhalen — gedaan | alle vorderingsstaten | afgemeerd, zeilen gestreken | wal, afmeren | S |

### Roeimanoeuvres

| # | Manoeuvre | Niveau, bron | Voorwaarden | Bouwstenen | Omvang |
|---|---|---|---|---|---|
| B1 | Achtje roeien, bochten — achtje gedaan | R I/II, III; [VSR12] 5, [VSR3] 8, [KATR] 14/10, [JPR3] p. 18 | modus roeien, riemen uit, anker op | draaien, vaart | M |
| B6 | Man overboord roeiend — gedaan | R III; [VSR3] 9, [KATR] 16/12, [JPR3] p. 22 | modus roeien, anker op | draaien, vaart | L |
| B7 | Ankeren / anker op roeiend — gedaan | R III; [VSR3] 10, [KATR] 17/13, [JPR3] p. 23–25 | modus roeien, anker aan boord | vaart | S |
| B8 | Jagen | R; [KATR] 18–19/14–15, [JPR3] p. 30 | aan de wal, zeilen gestreken | wal | M |
| B9 | Slepen | R, KB II/III theorie; [KATR] 19–20/15–16, [KATZ] 98/92 | — | meer boten | L |
| B10 | Bomen | R; [JPR3] p. 31 | zeilen gestreken | vaart | S |

### Tuig en boot

| # | Handeling | Niveau, bron | Voorwaarden | Omvang |
|---|---|---|---|---|
| C1 | Zeilen aanslaan, zeil- en nachtklaar — aan- en afslaan gedaan | KB III (aanslaan), KB I (klaar); [HBO] p. 6, 16 | mast staat; zeilen afgeslagen (nieuwe toestand) | M |
| C2 | Zeil- en scheepstrim | KB III; [HBO] p. 19 | zeilen op | M |

Kenteren en omslaan worden niet als manoeuvre onderwezen ([KATZ] 96/90: koppen tellen, bij de boot
blijven) en staan er niet op.

## Gedeelde bouwstenen

Deze kwamen eerst en zijn los beoordeeld voordat er manoeuvres op gebouwd werden. Het tijdelijke
debugmenu daarvoor is weer weg; de manoeuvres gebruiken ze nu zelf. Draaien (R2) doen overstag,
gijpen en stormrondje als eigen procedure, en afmeren legt zijn eigen steiger.

| # | Bouwsteen | Wat | Nodig voor |
|---|---|---|---|
| R1 | **Wereld en vaart** | De boot heeft een plaats en een koers in een wereld waarin de wind en de wal vast liggen. Vaart volgt uit modus, koers, zeilen en roeicommando, met traagheid; voor anker of afgemeerd is hij nul. De boot blijft in beeld staan en de wereld schuift eronderdoor. | bijna alles |
| R2 | **Draaien** | Een koerswijziging die in de tijd verloopt: door de wind (overstag), langs voor de wind (gijp), of naar een koers. Wind en wal draaien mee, zonder sprong. | A1–A4, A9, B1, D1–D6, D10–D11 |
| R3 | **Wal (steiger)** | Een houten steiger op palen met bolders, te leggen als hogerwal, langswal of lagerwal, aan bakboord of stuurboord. | D1–D12, B8 |
| R4 | **Afgemeerd** | Langszij aan de wal: voorlandvast en achterlandvast van de landvastogen naar de bolders, de stootwillen aan die kant buiten. | D1–D3, D7, D8, D12 |
| R5 | **Voorwaarden** | `aan de wal`, `afgemeerd`, `hogerwal/langswal/lagerwal`, `geen vaart` bij de bestaande in `OPS`. | alle nieuwe |

## Volgorde

1. Bouwstenen R1–R5, beoordeeld met een tijdelijk debugmenu.
2. Overstag gaan (A1), dan gijpen en stormrondje (A2, A3).
3. Afmeren en afvaren (D7, D1, D2, D8), dan aanleggen (D4, D9).
4. Achtje roeien (B1), bijliggen en varend hijsen (A5, A11) met de juiste hijsvolgorde.
5. Man over boord onder zeil en roeiend (A9, B6), de overige aanleg- en roeimanoeuvres.

## Status

| Onderdeel | Status |
|---|---|
| Handelingen als startpaneel en kaart met focusmodus; Bekijken en Oefenen (volgende stap kiezen) | gedaan |
| R1–R5 | gedaan |
| Tuigage: mast zetten en strijken, zeilen aan- en afslaan, hijsen, reven, strijken | gedaan |
| Wenden: A1 overstag, A2 gijpen, A3 stormrondje, A4 opkruisen, A5 bijliggen, A9 man over boord, dwarspeiling | gedaan |
| Afmeren: D4 sliplanding hogerwal, D5 opschieter, D6 voor top en takel en aanleggen aan lagerwal, D7 sliplanding langswal, D12 verhalen | gedaan |
| Afvaren: D1 van hogerwal, D2 van langswal, D3 van lagerwal; kop in de wind leggen | gedaan |
| Anker: A10 ankeren en anker op, onder zeil en zonder zeilen | gedaan |
| Roeien: B1 achtje, B6 man overboord, B7 ankeren en anker op, D8 afvaren, D9–D11 aanleggen met de boeg, de zijkant en de spiegel | gedaan |
| Commando's als tekstballon boven wie ze roept, gestapeld | gedaan |
| Afwijkingen van de boeken (hierboven) | te beslissen |
| A4 oploeven en afvallen als eigen manoeuvre, A11 varend hijsen, A12 loskomen van de grond, C1 zeil- en nachtklaar, C2 trim, B8 jagen, B9 slepen, B10 bomen | nog niet begonnen |
