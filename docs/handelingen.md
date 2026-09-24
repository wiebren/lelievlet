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
| koers … | de koers ten opzichte van de wind (aan de wind ≤ 60°, halve wind, ruime wind, voor de wind ≥ 150°) |
| riemen uit | beide riemen liggen in hun dol |
| aan de wal | er ligt een wal of steiger binnen bereik |
| afgemeerd / los | de landvasten zijn vast aan de wal, of los |
| hogerwal / langswal / lagerwal | hoe de wind ten opzichte van de wal staat |
| geen vaart | de boot ligt (vrijwel) stil |

## Wat er is

| Handeling | Voorwaarden |
|---|---|
| Zeilen hijsen | mast staat, geen rif bezig |
| Zeilen strijken | geen rif bezig |
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
| Kop in de wind leggen | afgemeerd aan een langswal, zeilen gestreken, wind van achteren |
| Afvaren van langswal | afgemeerd aan een langswal, kop in de wind, zeilen op, geen rif |
| Anker uit / op, midzwaard, riemen en dollen, roeicommando's, sturen | (zonder voorwaarden in het menu) |

Bekende verbetering: [KATZ] 70/64 en [HBO] p. 6 geven hijsen een eigen volgorde (grootschoot en
zeilbandjes los; gaffel op ±45°, beide vallen samen; klauwval vast; piek stellen met een plooi van
nok naar hals; fok als laatste; vallen opschieten). Nu is hijsen strijken achteruit.

## Werklijst

Niveau: KB = CWO Zeilen Kielboot, R = CWO Roeiboot. Omvang: S / M / L.
Bouwstenen: zie het volgende hoofdstuk.

### Zeilmanoeuvres

| # | Manoeuvre | Niveau, bron | Voorwaarden | Bouwstenen | Omvang |
|---|---|---|---|---|---|
| A1 | Overstag gaan | KB I; [VS1] 6, [HBO] p. 7, [KATZ] 76/70 | zeilen op, anker op, aan de wind | draaien, vaart | M |
| A2 | Gijpen | KB I; [VS1] 8, [HBO] p. 7, [KATZ] 77/71 | zeilen op, anker op, voor de wind | draaien, vaart | M |
| A3 | Stormrondje | KB II/III; [HBO] p. 11, 17, [KATZ] 78/72 | zeilen op, anker op, ruime of voor de wind | draaien | S |
| A4 | Oploeven, afvallen, opkruisen | KB I–III; [HBO] p. 7, 17, [KATZ] 74–75/68–69, 81/75 | zeilen op | draaien | S–M |
| A5 | Bijliggen | KB II/III; [HBO] p. 18, [KATZ] 9/3 | zeilen op, anker op | vaart | S |
| A9 | Man over boord onder zeil | KB II/III; [VS2] 14, [HBO] p. 13, 18, [KATZ] 89–90/83–84 | zeilen op, anker op | draaien, vaart | L |
| A10 | Ankeren / anker op onder zeil | KB III; [HBO] p. 19, [KATZ] 93–95/87–89 | zeilen op, anker aan boord | vaart | M |
| A11 | Varend hijsen | KB III; [HBO] p. 16, [KATZ] 71/65 | mast staat, zeilen gestreken, anker op | — | S |
| A12 | Loskomen van de grond | KB II/III; [HBO] p. 19, [KATZ] 91/85 | zeilen op | — | S–M |

### Aanleggen en afvaren

| # | Manoeuvre | Niveau, bron | Voorwaarden | Bouwstenen | Omvang |
|---|---|---|---|---|---|
| D1 | Afvaren van hogerwal | KB I; [VS1] 9, [HBO] p. 7, [KATZ] 82/76 | afgemeerd, hogerwal, zeilen op, anker op | wal, afmeren, vaart, draaien | L |
| D2 | Afvaren van langswal | KB I; [KATZ] 83/77 | afgemeerd, langswal, zeilen op | wal, afmeren, vaart, draaien | M |
| D3 | Afvaren van lagerwal | KB II/III; [KATZ] 84/78 | afgemeerd, lagerwal, mast staat, zeilen gestreken | wal, afmeren, vaart | M |
| D4 | Aankomen aan hogerwal (sliplanding) — gedaan | KB I onder toezicht, II/III; [HBO] p. 7, 18, [KATZ] 85/79 | los, aan de wal, zeilen op, anker op, aan de wind | wal, vaart, draaien | L |
| D5 | Opschieter — gedaan | KB II/III; [KATZ] 86/80 | los, aan de wal, zeilen op, halve of ruime wind | wal, vaart, draaien | M |
| D6 | Aanleggen aan lagerwal / voor top en takel | KB III; [HBO] p. 18, [KATZ] 87–88/81–82 | los, lagerwal, zeilen op, aan de wind | wal, vaart, draaien | M |
| D7 | Afmeren (landvasten en springen) | KB I+, R; [HBO] p. 7, 19, [KATZ] 73/67 | aan de wal, geen vaart | wal, afmeren | M |
| D8 | Afvaren roeiend | R I+; [KATR] 15/11, [JPR3] p. 19 | afgemeerd, modus roeien, anker op | wal, afmeren, vaart | S |
| D9 | Aanleggen met de punt | R I/II; [VSR12] 4, [KATR] 15/11, [JPR3] p. 19 | los, aan de wal, modus roeien, riemen uit | wal, vaart | M |
| D10 | Aanleggen met de zijkant | R III; [VSR3] 7, [KATR] 16/12, [JPR3] p. 20 | los, aan de wal, modus roeien, riemen uit | wal, vaart, draaien | M |
| D11 | Aanleggen met de spiegel | R III; [VSR3] 6, [JPR3] p. 21 | los, aan de wal, modus roeien, riemen uit | wal, vaart, draaien | M |
| D12 | Verhalen | alle vorderingsstaten | afgemeerd, zeilen gestreken | wal, afmeren | S |

### Roeimanoeuvres

| # | Manoeuvre | Niveau, bron | Voorwaarden | Bouwstenen | Omvang |
|---|---|---|---|---|---|
| B1 | Achtje roeien, bochten | R I/II, III; [VSR12] 5, [VSR3] 8, [KATR] 14/10, [JPR3] p. 18 | modus roeien, riemen uit, anker op | draaien, vaart | M |
| B6 | Man overboord roeiend | R III; [VSR3] 9, [KATR] 16/12, [JPR3] p. 22 | modus roeien, anker op | draaien, vaart | L |
| B7 | Ankeren / anker op roeiend | R III; [VSR3] 10, [KATR] 17/13, [JPR3] p. 23–25 | modus roeien, anker aan boord | vaart | S |
| B8 | Jagen | R; [KATR] 18–19/14–15, [JPR3] p. 30 | aan de wal, zeilen gestreken | wal | M |
| B9 | Slepen | R, KB II/III theorie; [KATR] 19–20/15–16, [KATZ] 98/92 | — | meer boten | L |
| B10 | Bomen | R; [JPR3] p. 31 | zeilen gestreken | vaart | S |

### Tuig en boot

| # | Handeling | Niveau, bron | Voorwaarden | Omvang |
|---|---|---|---|---|
| C1 | Zeilen aanslaan, zeil- en nachtklaar | KB III (aanslaan), KB I (klaar); [HBO] p. 6, 16 | mast staat; zeilen afgeslagen (nieuwe toestand) | M |
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
| Zeilen / Mast / Reven in één menu Handelingen, met voorwaarden | gedaan |
| Handelingen als startpaneel en kaart met focusmodus; Bekijken en Oefenen (volgende stap kiezen) | gedaan |
| R1–R5 | gedaan; het debugmenu is weg |
| A1 Overstag gaan (wenden), met Bekijken en Oefenen | gedaan |
| A2 Gijpen, met Bekijken en Oefenen | gedaan |
| Commando's als tekstballon boven wie ze roept | gedaan |
| A3 Stormrondje, met Bekijken en Oefenen | gedaan |
| D7 Afmeren met sliplanding aan een langswal (stootwillen, zeilen los, grootzeil aan, langszij; landvasten, springen), met Bekijken en Oefenen | gedaan |
| D2 Afvaren van langswal (lijnen los in omgekeerde volgorde, afduwen, fok bak, wegzeilen), met Bekijken en Oefenen | gedaan |
| Afgemeerd de wind verzetten; kop in de wind leggen met de wind van achteren (om de boeg, op de voorspring). Andere windrichtingen volgen | gedaan |
| A4 en verder, D1, D3–D6, D8–D12 | nog niet begonnen |
