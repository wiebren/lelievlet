# Handelingen en manoeuvres

Naslag voor wie de viewer gebruikt of controleert: wat de boot kan doen, wanneer (de voorwaarden)
en in welke stappen. Wat er nog bij komt, met CWO-niveau en bronnen, staat in de werklijst
`docs/handelingen.md`.

Dit bestand wordt gemaakt door `web/scripts/docs.mjs` (`pnpm docs` in `web/`); de stappen, de
voorwaarden en wat er eerst gedaan moet zijn komen rechtstreeks uit `web/src/modes.js`. Pas het niet
met de hand aan: verander de bron en draai het script opnieuw. Een insluitende pagina kan de namen
van stappen veranderen (`namen.stappen`); hier staan de standaardnamen.

## Het menu Handelingen

Oefenen (de studentenmuts in de kolom linksboven) → Manoeuvres, alleen in de modus Zeilen, toont een lijst handelingen.
Een handeling die niet kan is grijs, met de reden eronder; een die al gedaan is zegt dat ("De mast
staat al"). De voorwaarden kijken naar hoe de boot er *nu* bij ligt, niet naar wat er het laatst
gevraagd is. Wat niet genoemd wordt doet er niet toe: de mast strijken vraagt gestreken en
opgebonden zeilen, waar het anker of het midzwaard intussen is maakt niet uit.

Daaronder kies je:

- **Bekijken**: de handeling speelt vanzelf af. De stappenbalk staat in de kaart: vorige stap,
  afspelen/pauzeren, volgende stap en een schuif over de hele handeling. Een stap op zich laat de
  camera eerst naar de onderdelen gaan waar het om gaat.
- **Oefenen**: de boot blijft staan en bij elke stap is de vraag *Wat is de volgende stap?*, met vier
  antwoorden. Het goede antwoord staat ertussen, en de drie andere zijn stappen die in de toestand van
  de boot op dat moment wél zouden kunnen, alleen niet nu: een stap waarvan alles wat er eerst moet
  gebeuren al gedaan is (kolom *Eerst gedaan* hieronder), of het terugdraaien van een stap die al
  gedaan is. Ze komen vooral uit de handeling zelf, soms uit de andere helft van het tuig. Na elk
  antwoord wordt de goede stap getoond; aan het eind volgt de uitslag.

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
andere boeg. Vorige stap staat daarom uit (met de schuif kun je wel terug om een stap nog eens te bekijken), en bij Oefenen zijn er geen
antwoorden die een stap terugdraaien; wel een stap die al gedaan is, nog een keer. De fok doet wat de commando's zeggen:
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

## Afmeren

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

## Afgemeerd: de wind draait

Ligt de boot afgemeerd, dan kan de wind gewoon verzet worden: de lijnen houden haar op haar plaats en
de wind draait om haar heen. Afvaren van langswal kan alleen met de wind van voren. Komt de wind van
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

## Wat er geroepen wordt, en het spoor

Tijdens een manoeuvre (overstag, gijpen, afmeren) tekent de viewer de weg die de boot over het water
aflegt als een lichtrood spoor; het blijft liggen tot de volgende manoeuvre begint.

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
