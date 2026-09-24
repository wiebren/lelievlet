# Handelingen en manoeuvres

Naslag voor wie de viewer gebruikt of controleert: wat de boot kan doen, wanneer (de voorwaarden)
en in welke stappen. Wat er nog bij komt, met CWO-niveau en bronnen, staat in de werklijst
`docs/handelingen.md`.

Dit bestand wordt gemaakt door `web/scripts/docs.mjs` (`pnpm docs` in `web/`); de stappen, de
voorwaarden en wat er eerst gedaan moet zijn komen rechtstreeks uit `web/src/modes.js`. Pas het niet
met de hand aan: verander de bron en draai het script opnieuw. Een insluitende pagina kan de namen
van stappen veranderen (`namen.stappen`); hier staan de standaardnamen.

## Het menu Handelingen

Oefenen (de studentenmuts in de kolom linksboven) → Manoeuvres, alleen in de modus Zeilen, toont de
handelingen per groep: **Zeil** (hijsen, strijken, reven), **Wenden** (overstag, gijp, stormrondje),
**Afmeren** (sliplanding en opschieter aan hogerwal, sliplanding en voor top en takel aan een langswal, kop in de
wind leggen, afvaren van langswal) en **Mast** (zetten, strijken). Eerst staat de groep open met de eerste handeling die kan.
Een handeling die niet kan is grijs, met de reden eronder; een die al gedaan is zegt dat ("De mast
staat al"). De voorwaarden kijken naar hoe de boot er *nu* bij ligt, niet naar wat er het laatst
gevraagd is. Wat niet genoemd wordt doet er niet toe: de mast strijken vraagt gestreken en
opgebonden zeilen, waar het anker of het midzwaard intussen is maakt niet uit.

Daaronder kies je:

- **Bekijken**: de handeling speelt vanzelf af. De stappenbalk staat in de kaart: vorige stap,
  afspelen/pauzeren, volgende stap en een schuif over de hele handeling. Volgende en vorige stap gaan
  altijd in de richting van de handeling zelf, ook bij zeilen hijsen en mast zetten, die de
  tijdlijn van strijken terug doorlopen. Een stap op zich laat de camera eerst naar de onderdelen gaan
  waar het om gaat.
- **Oefenen**: de boot blijft staan en bij elke stap is de vraag *Wat is de volgende stap?*, met vier
  antwoorden. Het goede antwoord staat ertussen, en de drie andere zijn stappen die in de toestand van
  de boot op dat moment wél zouden kunnen, alleen niet nu: een stap waarvan alles wat er eerst moet
  gebeuren al gedaan is (kolom *Eerst gedaan* hieronder), of het terugdraaien van een stap die al
  gedaan is. Ze komen vooral uit de handeling zelf, soms uit de andere helft van het tuig. Bij de
  manoeuvres (wenden, gijpen, afmeren, afvaren, kop in de wind) komen er zetten van andere manoeuvres
  bij, zodat er altijd vier antwoorden zijn: één of twee uit de manoeuvre zelf, de rest uit wat je
  varend zou kunnen doen (oploeven, afvallen, ree, fok bak, gijp, zeilen los, strijken, anker uit…),
  bij het afmeren ook stootwillen en landvasten, en afgemeerd de lijnen, stootwillen en afduwen. Een
  andere naam voor dezelfde zet als het goede antwoord (*Afvallen* bij *Iets afvallen*) staat er nooit
  tussen. Na elk antwoord wordt de goede stap getoond; aan het eind volgt de uitslag.

Een handeling die je bij Oefenen van begin tot eind zonder fout hebt doorlopen, krijgt een groen
vinkje in de hoek van zijn tegel. Hij moet dan ook bij zijn eerste stap begonnen zijn: wie halverwege
het strijken stopt en vanaf daar weer hijst, heeft maar een deel gedaan en krijgt geen vinkje. Dat onthoudt de browser (`lelievlet.manoeuvres.v1` in
localStorage); Bekijken telt niet mee.

Zolang een handeling loopt, staat de viewer in focusmodus: alleen de boot, de kaart en de knop voor
volledig scherm; een klik op het model doet dan niets.

## Zeilen strijken

Voorwaarden:
- de mast staat — anders grijs met *De mast ligt al*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*

Ligt de boot afgemeerd, dan vallen *Kop in de wind*, *Anker uit* en *Midzwaard op* weg: ze ligt al kop
in de wind en de landvasten houden haar vast, dus er gaat geen anker uit en daarom ook het midzwaard
niet op. Bij hijsen vallen om dezelfde reden *Midzwaard neer*, *Anker op* en *Afvallen* weg. De stappen
blijven op de voortgangsbalk staan, gearceerd, en worden overgeslagen. In Oefenen komen ze niet voor,
ook niet als fout antwoord.

| # | Stap | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|
| 1 | Kop in de wind | — | 1,5 s |
| 2 | Anker uit | — | 4 s |
| 3 | Midzwaard op | — | 1,5 s |
| 4 | Fok strijken | — | 2 s |
| 5 | Mik zetten | — | 1,5 s |
| 6 | Grootzeil strijken | Mik zetten | 2,5 s |
| 7 | Zeil opdoeken | Grootzeil strijken | 1,5 s |
| 8 | Zeilbinders om | Zeil opdoeken | 1,2 s |

## Zeilen hijsen

Voorwaarden:
- de mast staat — anders grijs met *Eerst de mast zetten*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*
- er is geen afmeren of kop in de wind leggen half af — anders grijs met *Eerst het afmeren of draaien afmaken*
- niet afgemeerd, of afgemeerd kop in de wind, of aan de wind of halve wind met de wind over de steiger — anders grijs met *Afgemeerd alleen kop in de wind, of met de wind over de steiger*

Hijsen is strijken in omgekeerde volgorde. Het zeilinstructieboek geeft hijsen een eigen volgorde
(grootschoot en zeilbandjes los; gaffel op ±45°, beide vallen samen; klauwval vast; piek stellen met
een plooi van nok naar hals; fok als laatste; vallen opschieten — [KATZ] p. 64, [HBO] p. 6); dat staat
op de werklijst.

| # | Stap | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|
| 1 | Zeilbinders af | Tuig terug in de vork van de mik, Grendelbout in | 1,2 s |
| 2 | Zeil losmaken | Zeilbinders af | 1,5 s |
| 3 | Grootzeil hijsen | Zeil losmaken | 2,5 s |
| 4 | Mik wegnemen | Grootzeil hijsen | 1,5 s |
| 5 | Fok hijsen | Fok aanslaan | 2 s |
| 6 | Midzwaard neer | — | 1,5 s |
| 7 | Anker op | — | 4 s |
| 8 | Afvallen | — | 1,5 s |

## Mast strijken

Voorwaarden:
- de zeilen zijn gestreken en opgebonden — anders grijs met *Eerst de zeilen strijken*

| # | Stap | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|
| 1 | Fok afslaan | Fok strijken | 2 s |
| 2 | Tuig in de onderste haak van de mik | Zeilbinders om | 2 s |
| 3 | Lummelbout uit | Tuig in de onderste haak van de mik | 1,8 s |
| 4 | Grendelbout uit | Zeilbinders om | 1,5 s |
| 5 | Ring van de pelikaanhaak omhoog | — | 1,2 s |
| 6 | Pelikaanhaak uit de hanekam | Ring van de pelikaanhaak omhoog | 1,8 s |
| 7 | Mast strijken | Lummelbout uit, Grendelbout uit, Pelikaanhaak uit de hanekam, Fok afslaan | 5 s |

## Mast zetten

Voorwaarden:
- geen

| # | Stap | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|
| 1 | Mast zetten | — | 5 s |
| 2 | Pelikaanhaak in de hanekam | Mast zetten | 1,8 s |
| 3 | Ring van de pelikaanhaak omlaag | Pelikaanhaak in de hanekam | 1,2 s |
| 4 | Grendelbout in | Mast zetten | 1,5 s |
| 5 | Lummelbout in | Mast zetten | 1,8 s |
| 6 | Tuig terug in de vork van de mik | Lummelbout in | 2 s |
| 7 | Fok aanslaan | Mast zetten | 2 s |

## Reven

Een rolrif: de giek wordt een aantal slagen gedraaid (0 tot en met het maximum dat het zeil toelaat),
of het rif gaat er weer uit.

Voorwaarden:
- de zeilen staan — anders grijs met *Eerst de zeilen hijsen*

| # | Stap | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|
| 1 | Kop in de wind * | — | 1,5 s |
| 2 | Vallen vieren | — | 0,7 s |
| 3 | Schootring naar de nok | — | 1,1 s |
| 4 | Giek naar achteren trekken | Schootring naar de nok | 0,5 s |
| 5 | Giek draaien | Giek naar achteren trekken, Vallen vieren | 1,25 s per slag |
| 6 | Giek terug in het lummelbeslag | Giek draaien | 0,5 s |
| 7 | Grootschoot verhangen ** | Giek terug in het lummelbeslag | 0,9 s |
| 8 | Schootring terug | Grootschoot verhangen | 1,1 s |
| 9 | Vallen doorzetten | Giek terug in het lummelbeslag | 0,7 s |
| 10 | Afvallen * | Vallen doorzetten | 1,5 s |

\* Alleen als de boot niet al met de kop in de wind ligt; dan ook als laatste stap *Afvallen*.
\*\* Alleen bij een rif; als het rif eruit gaat, wordt de grootschoot teruggehangen.

## Overstag gaan (wenden)

Met de kop door de wind van de ene boeg naar de andere, in de volgorde van het zeilinstructieboek
(Katwijkse Zeeverkenners, § 5.6.1, p. 70). Hij kan vanaf aan de wind en halve wind: de eerste stap
loeft op tot hoog aan de wind (45°), daarna gaat de boeg door de wind en eindigt de boot hoog aan de
wind over de andere boeg. Een wending gaat alleen vooruit: terug is nog een keer overstag, over de
andere boeg. Bij Oefenen zijn er daarom geen antwoorden die een stap terugdraaien; wel een stap die al
gedaan is, nog een keer. Bij Bekijken kan Vorige stap wel: dat laat de stap ervoor nog eens zien. De fok doet wat de commando's zeggen:
los en klapperend; bak aan de oude kant gehouden terwijl de boeg door de wind gaat, vol maar
verkeerd om (de buik naar de nieuwe lijzijde); met *Fok bak houden* blijft hij zo staan terwijl de
boot over de nieuwe boeg afvalt - de bakke fok helpt haar rond; pas dan weer los, klapperend over naar
de nieuwe kant; en aangetrokken, vol de goede kant op. Het grootzeil killt van *Fok los* tot de boot
over de nieuwe boeg is afgevallen, en de helmstok staat van *Ree* naar lij en komt bij het afvallen
terug naar het midden. Het boek zelf gaat na *Fok bak* meteen naar *Fok over*; het vasthouden en
afvallen daartussen is zoals het op het water gedaan wordt.

Voorwaarden:
- de zeilen staan — anders grijs met *Eerst de zeilen hijsen*
- het anker is op — anders grijs met *Eerst het anker op*
- de boot is niet afgemeerd — anders grijs met *Eerst losgooien*
- de boot vaart aan de wind of halve wind (niet kop in de wind, niet ruime of voor de wind) — anders grijs met *Eerst aan de wind of halve wind gaan varen*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*
- er is geen wending of gijp bezig — anders grijs met *Eerst de wending of gijp afmaken*

| # | Stap | Roept | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|---|
| 1 | Hoog aan de wind | — | — | 0,6 s, plus 1 s per 30° ruimer dan aan de wind |
| 2 | Klaar om te wenden | “Klaar om te wenden!” (de roerganger) | — | 1 s |
| 3 | Ree | “Ree!” (de roerganger) | Klaar om te wenden | 1 s |
| 4 | Fok los | “Fok los!” (de roerganger) | — | 1,5 s |
| 5 | Fok bak | “Fok bak!” (de roerganger) | — | 2 s |
| 6 | Fok bak houden | “Fok bak houden!” (de roerganger) | Fok bak | 1 s |
| 7 | Afvallen | — | — | 1,5 s |
| 8 | Fok over | “Fok over!” (de roerganger) | Fok bak | 1,5 s |
| 9 | Fok aan | “Fok aan!” (de roerganger) | — | 1,5 s |

Wie met de hand een andere koers kiest terwijl een wending half af stilstaat, neemt het roer over: de
wending vervalt.

## Gijpen

Met de achtersteven door de wind, in de volgorde van het zeilinstructieboek (§ 5.6.2, p. 71). Hij kan
vanaf ruime wind en voor de wind: de eerste stap valt af tot goed voor de wind (172°), daarna gaat de
achtersteven door de wind en eindigt de boot op 155° over de andere boeg, net buiten voor de wind.
*Fok komt over* is de fok die naar te loevert klapt als de boot voorbij pal voor de wind afvalt; staat
de fok aan het begin al te loevert (voor de wind), dan valt die stap weg. Te loevert over de oude boeg
is lij over de nieuwe: daar blijft de fok, en hij gaat bij *Bijsturen* naar zijn gewone stand. De giek
blijft aan de oude kant tot *Gijp!*, wordt dan hand over hand met de grootschoot binnengehaald tot vlak
bij midscheeps en bij *Schoot uitvieren* rustig uitgevierd naar de nieuwe kant: geen klapgijp. De
helmstok gaat bij *Iets afvallen* van de stuurman af (die aan lij zit), bij *Tegensturen* de andere
kant op en bij *Bijsturen* weer recht. Net als overstag gaat een gijp alleen vooruit, en valt hij weg
als je halverwege met de hand de koers verandert. *Kijken of de weg vrij is* uit het boek zit niet als eigen stap in de viewer.

Voorwaarden:
- de zeilen staan — anders grijs met *Eerst de zeilen hijsen*
- het anker is op — anders grijs met *Eerst het anker op*
- de boot is niet afgemeerd — anders grijs met *Eerst losgooien*
- de boot vaart ruime wind of voor de wind (niet halve wind of hoger) — anders grijs met *Eerst ruime of voor de wind gaan varen*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*
- er is geen wending of gijp bezig — anders grijs met *Eerst de wending of gijp afmaken*

| # | Stap | Roept | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|---|
| 1 | Goed voor de wind | — | — | 0,6 s, plus 1 s per 30° hoger dan voor de wind |
| 2 | Stuurman naar lij | — | — | 1 s |
| 3 | Klaar voor de gijp | “Klaar voor de gijp!” (de roerganger) | — | 1 s |
| 4 | Iets afvallen | — | Klaar voor de gijp | 1,2 s |
| 5 | Fok komt over | “Fok komt over!” (de fokkenist) | — | 1,2 s |
| 6 | Gijp! Grootschoot inhalen | “Gijp!” (de roerganger) | — | 3,5 s |
| 7 | Tegensturen | — | Gijp! Grootschoot inhalen | 0,8 s |
| 8 | Schoot uitvieren | — | Gijp! Grootschoot inhalen | 4 s |
| 9 | Bijsturen | — | Tegensturen | 1 s |

## Stormrondje

Gijpen door overstag te gaan (zeilinstructieboek § 5.6.3, p. 72, Kielboot II & III): als het hard
waait is een gijp lastig, omdat de wind het zeil bij het overhalen flinke vaart geeft. Dan loef je op,
ga je overstag en val je weer af. Het is meer werk en vraagt meer ruimte, maar het is veiliger: het
zeil vangt na de wending geleidelijk meer wind. Het boek geeft er geen eigen commando's voor; de
wending in het midden is de overstag van hierboven, met zijn commando's. De boot begint op ruime wind
of voor de wind, loeft op tot hoog aan de wind (45°) en gaat overstag. Na „Fok bak houden” valt ze in
één keer af tot dezelfde koers over de andere boeg, met de fok nog bak: die duwt de boeg weg. Pas
daarna komt de fok over en wordt hij aangetrokken voor die koers. De giek volgt de koers: aangetrokken
bij het oploeven, gevierd bij het afvallen.
Het spoor op het water laat de lus zien die de boot vaart.

Voorwaarden:
- de zeilen staan — anders grijs met *Eerst de zeilen hijsen*
- het anker is op — anders grijs met *Eerst het anker op*
- de boot is niet afgemeerd — anders grijs met *Eerst losgooien*
- de boot vaart ruime wind of voor de wind (niet halve wind of hoger) — anders grijs met *Eerst ruime of voor de wind gaan varen*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*
- er is geen wending of gijp bezig — anders grijs met *Eerst de wending of gijp afmaken*

| # | Stap | Roept | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|---|
| 1 | Oploeven | — | — | 0,8 s, plus 1 s per 45° ruimer dan aan de wind |
| 2 | Klaar om te wenden | “Klaar om te wenden!” (de roerganger) | — | 1 s |
| 3 | Ree | “Ree!” (de roerganger) | Klaar om te wenden | 1 s |
| 4 | Fok los | “Fok los!” (de roerganger) | — | 1,5 s |
| 5 | Fok bak | “Fok bak!” (de roerganger) | — | 2 s |
| 6 | Fok bak houden | “Fok bak houden!” (de roerganger) | Fok bak | 1 s |
| 7 | Afvallen | — | — | 1,5 s, plus 1 s per 45° ruimer dan aan de wind |
| 8 | Fok over | “Fok over!” (de roerganger) | Fok bak | 1,5 s |
| 9 | Fok aan | “Fok aan!” (de roerganger) | — | 1,5 s |

## Afmeren: sliplanding hogerwal

Aanleggen aan hogerwal, de wind recht van de kant af, met een sliplanding (zeilinstructieboek
§ 5.10.1, p. 79). De viewer legt een steiger dwars op de wind neer, precies voor waar de boeg
uitkomt; de weg erheen blijft er benedenwinds van.

- **Oploeven tot aan de wind** (alleen als ze nog niet aan de wind voer): koers op de kant.
- **Zeilen los**: ruim van tevoren de schoten vieren tot de zeilen klapperen; ze remt af op de
  tegenwind (van 1,4 naar 0,6 m/s).
- **Grootzeil aan**: in het boek als je te vroeg stil komt te liggen. Hier altijd even, om te laten
  zien hoe ze weer vaart krijgt (tot 1 m/s).
- **Oploeven, kop in de wind aan de steiger**: het laatste stuk loeft ze op tot kop in de wind en komt
  met de boeg vlak voor de steiger stil te liggen.
- **Voorlandvast vastmaken**, van het sleepoog naar de bolder die het dichtst bij de boeg staat. De
  wind houdt haar van de kant af; zo ligt ze ook als het boek het afvaren van hogerwal begint (§ 5.9.1,
  p. 76: "je ligt al tegen wind in").

Kop in de wind leggen en afvaren van langswal gaan hier niet: die horen bij een langswal.

Voor Oefenen is fout: oploeven naar de steiger voordat de zeilen los zijn, en het voorlandvast voordat
ze er ligt. Grootzeil aan komt na zeilen los. Alleen vooruit.

Voorwaarden:
- de zeilen staan — anders grijs met *Eerst de zeilen hijsen*
- het anker is op — anders grijs met *Eerst het anker op*
- de boot vaart een koers (niet kop in de wind) — anders grijs met *Eerst een koers varen, niet kop in de wind*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*
- er is geen wending of gijp bezig — anders grijs met *Eerst de wending of gijp afmaken*

| # | Stap | Roept | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|---|
| 1 | Oploeven tot aan de wind | — | — | volgt uit de afstand en de snelheid |
| 2 | Zeilen los | “Zeilen los!” (de roerganger) | — | volgt uit de afstand en de snelheid |
| 3 | Grootzeil aan | “Grootzeil aan!” (de roerganger) | Zeilen los | volgt uit de afstand en de snelheid |
| 4 | Oploeven, kop in de wind aan de steiger | — | — | volgt uit de afstand en de snelheid |
| 5 | Voorlandvast vastmaken | “Voorlandvast vast!” (de roerganger) | — | 2 s |

## Afmeren: opschieter hogerwal

De andere manier om aan hogerwal aan te leggen (zeilinstructieboek § 5.10.1, p. 80). De viewer legt de
steiger dwars op de wind neer, precies voor waar de boeg uitkomt, en laat hem van de kant waar ze
vandaan kwam af lopen: komt ze voor de wind aan, dan vaart ze langs het eind ervan.

- **Langs de kant, remweg schatten**: ze vaart halve wind, ruime wind of voor de wind op de koers die
  ze had, zo ver van de kant als ze straks met de kop in de wind nodig heeft om stil te komen.
- **Met veel roer tegen de wind in**: de helmstok gaat ver naar lij (35°) en ze loeft op in een ruime
  halve cirkel, zoals het boek het tekent, tot kop in de wind; het laatste stuk gaat de helmstok terug
  naar het midden. Vanaf halve wind klapperen de zeilen. Ze schiet met de vaart die ze nog heeft op
  naar de steiger en komt met de boeg vlak ervoor stil te liggen.
- **Voorlandvast vastmaken**, van het sleepoog naar de bolder die het dichtst bij de boeg staat, zoals
  na de sliplanding aan hogerwal.

Het boek noemt ook afremmen door het roer heen en weer te bewegen, als het nodig is; dat zit er niet
in: ze komt precies goed aan.

Voor Oefenen: het roer gaat pas om als ze langs de kant vaart; het voorlandvast voordat ze er ligt is
fout. Alleen vooruit.

Voorwaarden:
- de zeilen staan — anders grijs met *Eerst de zeilen hijsen*
- het anker is op — anders grijs met *Eerst het anker op*
- de boot vaart halve wind, ruime wind of voor de wind (70° of meer van de wind) — anders grijs met *Eerst halve wind, ruime of voor de wind gaan varen*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*
- er is geen wending of gijp bezig — anders grijs met *Eerst de wending of gijp afmaken*

| # | Stap | Roept | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|---|
| 1 | Langs de kant, remweg schatten | — | — | volgt uit de afstand en de snelheid |
| 2 | Met veel roer tegen de wind in | — | Langs de kant, remweg schatten | volgt uit de afstand en de snelheid |
| 3 | Voorlandvast vastmaken | “Voorlandvast vast!” (de roerganger) | — | 2 s |

## Afmeren: sliplanding langswal

Aanleggen aan een langswal kan op twee manieren (zeilinstructieboek § 5.10.2, p. 81): met een
sliplanding of voor top en takel. Dit is de eerste.

Aanleggen aan een langswal met een sliplanding (zeilinstructieboek § 5.10.1, p. 79) en dan vastmaken
(§ 5.4, p. 67; roei-instructieboek § 1.2.3, p. 3). De viewer legt een nieuwe steiger neer, langs de
wind en aan lij van de boot, precies naast waar de sliplanding eindigt; de boot vaart er dus nooit
doorheen.

- **Oploeven tot aan de wind** (alleen als ze nog niet aan de wind voer): koers op de kant.
- **Stootwillen uit** aan de kant van de steiger, terwijl ze aan de wind doorvaart.
- **Zeilen los**: ruim van tevoren de schoten vieren tot de zeilen klapperen. Ze vangt geen wind
  meer en remt af op de tegenwind (van 1,4 naar 0,6 m/s).
- **Grootzeil aan**: in het boek als je te vroeg stil komt te liggen. Hier altijd even, om te laten
  zien hoe ze weer vaart krijgt (tot 1 m/s). De fok blijft los.
- **Oploeven, langszij**: ze loeft op tot kop in de wind, langs de steiger, en komt stil te liggen,
  een halve meter tot een meter ervandaan. Zo slaat de spiegel er bij het oploeven niet tegenaan.

Dan de landvasten. De wind komt van voren, dus eerst het **voorlandvast** en daarna het
achterlandvast. Andersom draait de boot van de wal weg. Met de landvasten wordt ze zijwaarts
tegen de stootwillen gehaald: eerst de boeg met het voorlandvast, dan de spiegel met het
achterlandvast. Het voorlandvast loopt door het sleepoog naar
een bolder voor de boeg, het achterlandvast van het landvastoog op de spiegel naar een bolder achter
de boot. Daarna de **achterspring** en de **voorspring**, van dezelfde ogen naar de bolder ter hoogte
van het midden van de boot: die houden haar tegen het heen en weer gaan langs de wal.

Voor Oefenen is fout: langszij komen voordat de stootwillen uit zijn of de zeilen los zijn, een
landvast voordat de boot langszij ligt, en het achterlandvast eerst. Grootzeil aan komt na zeilen
los, de springen na de landvasten, en de voorspring na de achterspring. Afmeren gaat alleen vooruit;
losgooien hoort bij het afvaren (D1, D2, D8).

Voorwaarden:
- de zeilen staan — anders grijs met *Eerst de zeilen hijsen*
- het anker is op — anders grijs met *Eerst het anker op*
- de boot vaart een koers (niet kop in de wind) — anders grijs met *Eerst een koers varen, niet kop in de wind*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*
- er is geen wending of gijp bezig — anders grijs met *Eerst de wending of gijp afmaken*

| # | Stap | Roept | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|---|
| 1 | Oploeven tot aan de wind | — | — | volgt uit de afstand en de snelheid |
| 2 | Stootwillen uit | “Stootwillen uit!” (de roerganger) | — | volgt uit de afstand en de snelheid |
| 3 | Zeilen los | “Zeilen los!” (de roerganger) | — | volgt uit de afstand en de snelheid |
| 4 | Grootzeil aan | “Grootzeil aan!” (de roerganger) | Zeilen los | volgt uit de afstand en de snelheid |
| 5 | Oploeven, langszij | — | — | volgt uit de afstand en de snelheid |
| 6 | Voorlandvast vastmaken | “Voorlandvast vast!” (de roerganger) | — | 2 s |
| 7 | Achterlandvast vastmaken | “Achterlandvast vast!” (de roerganger) | — | 2 s |
| 8 | Achterspring vastmaken | “Achterspring vast!” (de roerganger) | Voorlandvast vastmaken, Achterlandvast vastmaken | 2 s |
| 9 | Voorspring vastmaken | “Voorspring vast!” (de roerganger) | Achterspring vastmaken | 2 s |

## Afmeren: voor top en takel langswal

De andere manier van § 5.10.2 (p. 81): op het laatste moment alle zeilen strijken en de boot met de
wind laten meedrijven tot ze op haar plek ligt. Het vraagt ruimte langs de kant, en de snelheid is
niet te regelen. De viewer legt de steiger weer precies naast waar de weg eindigt, langs de wind.

- **Oploeven tot aan de wind** (alleen als ze nog niet aan de wind voer): koers op de kant.
- **Grootzeil strijken**, ruim van tevoren: de giek in de mik en het grootzeil erop, zoals bij Zeilen
  strijken. Ze vaart verder op de fok en loopt terug van 1,4 naar 1,1 m/s.
- **Stootwillen uit** aan de kant van de steiger.
- **Fok strijken**, vlak voor de kant.
- **Afvallen tot voor de wind**: met de vaart die ze nog heeft draait ze van de wind af, tot ze met de
  wind van achteren langs de steiger ligt.
- **Voor top en takel langszij**: zonder zeilen drijft ze voor de wind langs de steiger en komt op haar
  plek tot stilstand, iets ervandaan.

Dan de landvasten. De wind komt nu van achteren, dus eerst het **achterlandvast** en daarna het
voorlandvast: zo blijft de spiegel in de wind. Met de landvasten wordt ze tegen de stootwillen gehaald,
eerst de spiegel, dan de boeg. Daarna de achterspring en de voorspring, zoals bij de sliplanding.

De zeilen liggen dan gestreken maar nog niet opgedoekt: Zeilen strijken gaat verder met opdoeken en de
zeilbinders. Daarna kan de boot kop in de wind gelegd worden, en dan weer afvaren.

Voor Oefenen is fout: de fok eerst strijken, afvallen voordat de zeilen weg zijn, het voorlandvast
eerst. Langszij drijven komt pas na het afvallen, de springen na de landvasten, en de voorspring na de
achterspring. Voor top en takel gaat alleen vooruit.

Voorwaarden:
- de zeilen staan — anders grijs met *Eerst de zeilen hijsen*
- het anker is op — anders grijs met *Eerst het anker op*
- de boot vaart een koers (niet kop in de wind) — anders grijs met *Eerst een koers varen, niet kop in de wind*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*
- er is geen wending of gijp bezig — anders grijs met *Eerst de wending of gijp afmaken*

| # | Stap | Roept | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|---|
| 1 | Oploeven tot aan de wind | — | — | volgt uit de afstand en de snelheid |
| 2 | Grootzeil strijken | “Grootzeil strijken!” (de roerganger) | — | volgt uit de afstand en de snelheid |
| 3 | Stootwillen uit | “Stootwillen uit!” (de roerganger) | — | volgt uit de afstand en de snelheid |
| 4 | Fok strijken | “Fok strijken!” (de roerganger) | — | volgt uit de afstand en de snelheid |
| 5 | Afvallen tot voor de wind | — | — | volgt uit de afstand en de snelheid |
| 6 | Voor top en takel langszij | — | Afvallen tot voor de wind | volgt uit de afstand en de snelheid |
| 7 | Achterlandvast vastmaken | “Achterlandvast vast!” (de roerganger) | — | 2 s |
| 8 | Voorlandvast vastmaken | “Voorlandvast vast!” (de roerganger) | — | 2 s |
| 9 | Achterspring vastmaken | “Achterspring vast!” (de roerganger) | Voorlandvast vastmaken, Achterlandvast vastmaken | 2 s |
| 10 | Voorspring vastmaken | “Voorspring vast!” (de roerganger) | Achterspring vastmaken | 2 s |

## Afgemeerd: de wind draait

Ligt de boot langszij afgemeerd, dan kan de wind gewoon verzet worden: de lijnen houden haar op haar
plaats en de wind draait om haar heen.

Ligt ze met de boeg aan de steiger op alleen het voorlandvast (na de sliplanding of de opschieter aan
hogerwal), dan draait ze om haar boeg als de wind verzet wordt. De windschuif blijft wat hij altijd is,
de wind op de boot: van kop in de wind tot halve wind draait ze mee, tot ze langs de steiger ligt;
verder draait ze niet, anders zou ze erdoorheen gaan, en gaat alleen de wind verder rond. Onderweg komt
de boeg wat van de steiger af, zodat haar zijkant vrij blijft. De zeilen staan los en waaien mee.
Laat je de windschuif los bij halve wind, ruime wind of voor de wind, dan wordt ze langszij vastgemaakt:
steekt ze voorbij het eind van de steiger (na een opschieter ligt ze aan de kop ervan), dan schuift ze
eerst langs de steiger tot ze er helemaal naast ligt en gaat het voorlandvast naar een eigen bolder;
dan de stootwillen uit en na elkaar het achterlandvast, de achterspring en de voorspring. Vanaf dan is
het een langswal. Andersom, van langszij terug naar met de boeg aan de steiger, gebeurt niet. Afvaren van langswal kan alleen met de wind van voren. Komt de wind van
achteren, dan eerst kop in de wind leggen. Andere windrichtingen komen later.

Afgemeerd gaan de zeilen alleen omhoog als ze vrij van de wal waaien: kop in de wind, of aan de wind
of halve wind met de wind over de steiger, zodat ze boven het water uitstaan. Gestreken ligt de fok
gebundeld midden op de voorstag, en de giek in de mik, wat de wind ook doet.

## Kop in de wind leggen

Afgemeerd met de wind van achteren, met de zeilen gestreken: het boek wil haar kop in de wind voor het
afvaren (§ 5.9.2, p. 77, "zonodig moet de boot even worden verhaald"). Ze wordt om haar boeg gedraaid.

- Een **stootwil naar de boeg**, aan de kant van de wal: daar leunt ze straks tegen de steiger.
- **Alle lijnen los behalve de voorspring**: het voorlandvast, de achterspring, en het achterlandvast
  als laatste. De voorspring houdt haar tegen de wind.
- **Spiegel afduwen.**
- **Over de boeg draaien**: de wind duwt de spiegel rond, om de boeg heen, tot ze weer langs de steiger
  ligt, kop in de wind, met haar andere kant naar de wal. Terwijl ze draait gaan de stootwillen naar
  de andere kant: de stootwil achter binnen, die aan de andere kant uit.
- **De lijnen weer vast.** De voorspring is blijven zitten; omgedraaid ligt zijn bolder voor de boeg,
  dus hij is nu het voorlandvast. Dan het achterlandvast, de achterspring en een nieuwe voorspring naar
  de bolder bij het midden van de boot. Tot slot de stootwil van de boeg binnen.

Afmeren legt daarvoor een steiger van 18 meter met de ligplaats in het midden: omgedraaid ligt de boot
een bootlengte verder.

Voor Oefenen is fout: de spiegel afduwen voordat de lijnen los zijn, en een lijn vastmaken voordat ze
weer langs de steiger ligt.

Voorwaarden:
- de boot ligt afgemeerd — anders grijs met *Eerst afmeren*
- de wal is een langswal — anders grijs met *Alleen aan een langswal*
- er is geen kop in de wind leggen bezig — anders grijs met *Eerst het draaien afmaken*
- de zeilen zijn gestreken en opgebonden — anders grijs met *Eerst de zeilen strijken*
- de wind komt van achteren (135° of meer van de boeg) — anders grijs met *Alleen met de wind van achteren*

| # | Stap | Roept | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|---|
| 1 | Stootwil naar de boeg | “Stootwil naar de boeg!” (de roerganger) | — | 3 s |
| 2 | Voorlandvast losmaken | “Voorlandvast los!” (de roerganger) | Stootwil naar de boeg | 2 s |
| 3 | Achterspring losmaken | “Achterspring los!” (de roerganger) | Voorlandvast losmaken | 2 s |
| 4 | Achterlandvast losmaken | “Achterlandvast los!” (de roerganger) | Achterspring losmaken | 2 s |
| 5 | Spiegel afduwen | “Spiegel afduwen!” (de roerganger) | — | 2,5 s |
| 6 | Over de boeg draaien | “Stootwillen naar de andere kant!” (de roerganger) | — | 10 s |
| 7 | Achterlandvast vastmaken | “Achterlandvast vast!” (de roerganger) | — | 2 s |
| 8 | Achterspring vastmaken | “Achterspring vast!” (de roerganger) | Achterlandvast vastmaken | 2 s |
| 9 | Voorspring vastmaken | “Voorspring vast!” (de roerganger) | Achterspring vastmaken | 2 s |
| 10 | Stootwil van de boeg binnen | — | Voorspring vastmaken | 3 s |

## Afvaren van langswal

Wegvaren van een langswal (zeilinstructieboek § 5.9.2, p. 77). De boot ligt kop in de wind met de
zeilen op, zoals Afmeren haar achterlaat. De lijnen gaan in omgekeerde volgorde los
(roei-instructieboek § 1.2.3, p. 3): eerst de springen, dan het achterlandvast, en het
**voorlandvast als laatste**. Met de wind van voren is dat de lijn die haar vasthoudt. Dan kijken of
de vaarweg vrij is.

De persoon op de wal gooit het voorlandvast los, trekt de boot een stukje naar voren zodat ze al wat
vaart heeft, en duwt de boeg rustig af. Met de **fok bak** draait de boeg verder van de wal af, tot
aan de wind. Niet in één keer ver afvallen, want dan slaat de spiegel tegen de wal. Met genoeg ruimte
komt de fok over en wordt het **grootzeil aangetrokken**. Ze vaart weg aan de wind (60°), en als ze
vrij is gaan de stootwillen binnen. Daarna vaart ze gewoon verder.

Voor Oefenen is fout: het voorlandvast los voordat de rest los is (dan zwaait ze met de spiegel naar
de wal en hangt ze aan het achterlandvast), de fok over voordat hij bak gehouden is, en de
stootwillen binnen voordat ze van de wal af is. De achterspring komt na de voorspring, en het
grootzeil aan na de fok over. Afvaren gaat alleen vooruit.

Voorwaarden:
- de boot ligt afgemeerd — anders grijs met *Eerst afmeren*
- er is geen afmeren of kop in de wind leggen half af — anders grijs met *Eerst het afmeren of draaien afmaken*
- de wal is een langswal — anders grijs met *Alleen van een langswal*
- de wind komt van voren (minder dan 45° van de boeg) — anders grijs met *Eerst kop in de wind leggen*
- de zeilen staan — anders grijs met *Eerst de zeilen hijsen*
- er wordt niet gereefd — anders grijs met *Eerst het reven afmaken*

| # | Stap | Roept | Eerst gedaan (voor Oefenen) | Duur |
|---|---|---|---|---|
| 1 | Voorspring losmaken | “Voorspring los!” (de roerganger) | — | 2 s |
| 2 | Achterspring losmaken | “Achterspring los!” (de roerganger) | Voorspring losmaken | 2 s |
| 3 | Achterlandvast losmaken | “Achterlandvast los!” (de roerganger) | — | 2 s |
| 4 | Kijken of de vaarweg vrij is | “Vaarweg vrij?” (de roerganger) | — | 1,5 s |
| 5 | Voorlandvast los, afduwen | “Voorlandvast los, afduwen!” (de roerganger) | — | volgt uit de afstand en de snelheid |
| 6 | Fok bak houden | “Fok bak houden!” (de roerganger) | — | volgt uit de afstand en de snelheid |
| 7 | Fok over | “Fok over!” (de roerganger) | Fok bak houden | volgt uit de afstand en de snelheid |
| 8 | Grootzeil aan | “Grootzeil aan!” (de roerganger) | Fok over | volgt uit de afstand en de snelheid |
| 9 | Stootwillen binnen | — | Voorlandvast los, afduwen | volgt uit de afstand en de snelheid |

## Wat er geroepen wordt, het spoor en de camera

Tijdens een manoeuvre (overstag, gijpen, afmeren) tekent de viewer de weg die de boot over het water
aflegt als een lichtrood spoor; het blijft liggen tot de volgende manoeuvre begint. Ga je terug in de
manoeuvre (terugspoelen), dan verdwijnt het stuk spoor daarna weer en ligt de boot waar ze toen was.
Een manoeuvre die begint terwijl de boot vaart (overstag, gijpen, stormrondje en het afmeren) vaart
eerst drie seconden rechtdoor op de koers die ze had, met spoor, zodat je ziet waar ze vandaan komt;
dan begint de eerste stap. Dat stuk is geen stap: het hoort bij de eerste.
Wacht de manoeuvre op je (stap voor stap, bij Oefenen op je antwoord, of gepauzeerd), dan blijft de boot
liggen waar ze is: ze vaart pas verder als de volgende stap begint.

De manoeuvres aan de wal (afmeren, kop in de wind leggen, afvaren) worden van hoog bekeken, met de
boot en de steiger allebei in beeld: de camera gaat daarheen als de handeling begint, en bij elke stap
die op zich getoond wordt. De andere handelingen gaan per stap naar de onderdelen waar het om gaat.

Als een stap met een commando begint, verschijnt het commando in een tekstballon boven wie het roept:
de roerganger achterin, of de fokkenist bij de mast (*Fok komt over!*). Een roeicommando dat je kiest
verschijnt op dezelfde manier. Terugspoelen of een stap terug roept niets.

## Zonder menu: met een klik op het model

| Onderdeel | Wat een klik doet |
|---|---|
| Dol of dolkettinkje | de dol in de dolpot, of eruit (niet terwijl er met die riem geroeid wordt) |
| Riem | in de dol, of terug op de doften; beide riemen in hun dol is roeien |
| Wrikriem | in het wrikgat, of terug; in het wrikgat is wrikken |
| Zwaard, zwaardloper, borgpen of kettinkje | het midzwaard een stand verder: neer, half, op en weer neer |
| Mik of mikhouders | de mik omhoog in de houders of terug op de vlonder; met het zeil opgedoekt erin: het tuig in de kraanlijn optoppen, of terug |
| Stootwil | overboord, of weer binnen |
| Bakskist | het deksel open of dicht |
| Ankerlijn of anker | het anker uit, of op |
| Helmstok | slepen stuurt het roer |

## Koersen

De koers kies je in het paneel Boot, onder Wind (alleen in de modus Zeilen): de wind komt van boven in de koersschuif, met **kop in de wind** in het
midden, dan **aan de wind** (45°), **halve wind** (90°), **ruime wind** (135°) en **voor de wind**
(vanaf 158°, met de fok te loevert), met de wind over bakboord of over stuurboord. Giek, fok en de
bolling van de zeilen volgen de koers.

## Roeicommando's

Een commando begint met *Op… riemen*, behalve de twee die meteen moeten worden uitgevoerd (*Stopt…
af* en *Riemen… lopen*). De roerganger roept het met de boorden ervoor: *Bakboord, stuurboord haalt
op… gelijk*.

| Knop | Voor | De roerganger roept |
|---|---|---|
| Op… slag | hele boot | “haalt op… gelijk, op… slag” |
| Riemen… over | hele boot | “riemen… over” |
| Riemen… op | hele boot | “riemen… op” |
| Riemen… geroeid | hele boot | “riemen… geroeid” |
| Haalt op… gelijk | per boord | “haalt op… gelijk” |
| Op… riemen | per boord | — |
| Strijkt… gelijk | per boord | “strijkt… gelijk” |
| Stopt… af | per boord | “stopt… af” |
| Riemen… lopen | per boord | “riemen… lopen” |
