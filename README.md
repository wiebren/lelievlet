# Lelievlet 3D

Interactief 3D-model van de lelievlet (Scouting Nederland) voor instructielessen, quizzen over
onderdeelnamen en het aanpassen van de groepskleuren. De geometrie komt uit het officiële CAD-model
van Scouting Nederland; namen en maten zijn gecontroleerd aan de hand van het Vlettenboek en het
klassenreglement.

Het **Vlettenboek** is deel 8 van het LSZW *Vademecum voor het waterwerk*, getiteld *De Lelievlet*
(8e druk, 1988). Het is één en hetzelfde boek; hieronder heet het overal Vlettenboek, en de
paginanummers verwijzen naar die druk.

| Map | Wat |
|---|---|
| `docs/` | Naslag voor gebruikers en instructeurs: `onderdelen.md` (alle onderdelen, andere namen, wat Oefenen vraagt) en `manoeuvres.md` (handelingen, voorwaarden, stappen); `handelingen.md` is de werklijst |
| `reference/` | Bronmateriaal en de index daarop — begin bij `reference/README.md` |
| `pipeline/` | DWG-bodies → meshes → `web/public/models/lelievlet.glb` |
| `web/` | Vite + three.js viewer |
| `build/` | Gegenereerd: mesh-cache, tessellatierapport, preview-renders (kan zonder bezwaar weg) |

## Wat er wel en niet in deze repository staat

De broncode van de viewer (`web/`) en van de model-pipeline (`pipeline/`) staat hier, samen met het
gebouwde model (`web/public/models/lelievlet.glb` + `lelievlet.parts.json`). Van het
referentiemateriaal (`reference/`) staat hier wat we zelf gemaakt hebben: de notities en indexen met
de bronnen en hun URL's, de overgenomen maattabellen (CSV, JSON) en het extractiescript. De gedownloade
stukken zelf (de officiële DWG van Scouting Nederland, het Vlettenboek, de CWO-lesboeken, foto's en
tekeningen) zitten er niet bij; de indexen zeggen waar ze te halen zijn. Zonder `reference/cad/` zijn
de eerste twee pipeline-stappen (het extraheren en tessellateren van de CAD-bodies) niet uit te voeren;
al het overige werkt vanuit het gebouwde model.

## Naslag voor instructeurs

`docs/onderdelen.md` en `docs/manoeuvres.md` zijn bedoeld om de viewer mee te gebruiken en te
controleren: welke onderdelen er zijn, onder welke namen de lesstof ze ook kent, op welk niveau
Oefenen ernaar vraagt, en welke handelingen de boot kan doen met hun voorwaarden en stappen. Ze
worden gemaakt uit de bronnen van de viewer zelf; na een wijziging aan het model, de quizvragen of de
handelingen draai je in `web/`:

    pnpm docs

## De viewer draaien

    cd web && pnpm install && pnpm dev        # http://localhost:5173

`web/index.html` is niet meer dan een lege `<div>` die de viewer vult; alles zit in de bibliotheek
(`web/src/lib.js`). Zie hieronder hoe je hem in een eigen pagina zet.

## Insluiten in een webpagina

De viewer is een bibliotheek. Je zet een element op je pagina, geeft het een hoogte, en laat
`create()` er een viewer in bouwen:

```html
<div id="vlet" style="height:600px"></div>
<script type="module">
  import Lelievlet from 'https://wiebren.github.io/lelievlet/lelievlet.js';
  Lelievlet.create(document.getElementById('vlet'), {
    aanpassen: { zeilnummer: '442', naam: 'Fluessen', plaats: 'Zwolle' },
    namen: { onderdelen: { hommerring: 'Mastring' } },
    quiz: { niveau: 2 },
  });
</script>
```

De viewer bouwt zichzelf in een **shadow DOM** op dat element: jouw stijlen raken hem niet en zijn
stijlen raken jouw pagina niet, en twee viewers op één pagina weten niets van elkaar. Hij vult het
element dat je hem geeft, dus dat element moet een hoogte hebben (`height`, `aspect-ratio`, of een
grid-/flexcel met een hoogte) — een `<div>` zonder hoogte blijft 0 pixels hoog. Een smalle insluiting
krijgt vanzelf de smalle indeling, ook op een brede pagina: de layout kijkt naar de breedte van het
element, niet naar die van het browservenster. De pijltjestoetsen werken alleen zolang de muis boven
de viewer hangt of de focus erin staat, zodat de pagina eromheen gewoon blijft scrollen.

Werk je zonder modules, dan is er ook een IIFE-bundel die een global `Lelievlet` zet:

```html
<script src="https://wiebren.github.io/lelievlet/lelievlet.iife.js"></script>
<script>Lelievlet.create(document.getElementById('vlet'), { /* … */ });</script>
```

Er is bewust **geen jsDelivr-adres**: jsDelivr serveert vanuit de git-repository (`/gh/…@tag/pad`),
en het gebouwde bestand staat niet in de repository — `web/dist-lib/` staat in `.gitignore` en wordt
door de workflow rechtstreeks naar Pages gepubliceerd, zonder `gh-pages`-branch. Ook het model (2,3 MB)
hoort niet op een CDN dat op pakketbestanden is gebouwd. Wie toch een CDN wil, publiceert de
inhoud van `dist-lib/` zelf ergens en wijst er met `assets` naar.

### Insluiten als iframe

Een `<script>` van een andere site draait met alle rechten van jouw pagina: de pagina zelf, de
cookies, de formulieren. Heeft je site ingelogde gebruikers (een ledenomgeving, een webshop), zet de
viewer dan in een iframe. Hij draait dan op wiebren.github.io en kan niets van jouw pagina zien of
aanraken, wat er ook met zijn code zou gebeuren.

```html
<iframe src='https://wiebren.github.io/lelievlet/embed.html#{"aanpassen":{"zeilnummer":"442"},"quiz":{"niveau":2}}'
        style="width:100%; height:600px; border:0"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        allow="fullscreen" title="3D-model van de lelievlet"></iframe>
```

- **De configuratie** staat na de `#`, als JSON: hetzelfde object dat `create()` krijgt. Zet het
  `src`-adres tussen enkele aanhalingstekens, dan kunnen de dubbele in de JSON gewoon blijven staan.
  Het mag ook ingepakt: `#v1.` gevolgd door de JSON, gecomprimeerd (deflate) en in base64url, zo'n
  half zo lang. Dat maakt `packConfig(config)` uit de module (zie hieronder). Zonder `#` start de
  viewer zoals hij zelf is. Verander je het adres na de `#`, dan begint hij opnieuw met de nieuwe
  configuratie.
- **De maat** geef je het iframe; de viewer vult het. Een smal iframe krijgt vanzelf de smalle indeling.
- **`sandbox`** houdt het iframe binnen zijn eigen herkomst. `allow-same-origin` is hier veilig: het
  iframe is van een andere site, dus het krijgt de herkomst van wiebren.github.io en niet die van
  jouw pagina; het is nodig voor de opgeslagen instellingen en scores. `allow-popups` en
  `allow-popups-to-escape-sandbox` laten de bronnen onder *Over dit model* in een gewoon tabblad
  openen.
- **`allow="fullscreen"`** laat de knop voor volledig scherm werken; zonder werkt de rest gewoon.
- **Wat niet kan:** wat `create()` teruggeeft (`ready`, `get()`, `set()`, `destroy()`, hieronder)
  bestaat alleen voor het `<script>`-insluiten. Een iframe bedien je alleen via het adres.
- **Opslag:** instellingen, scores en vinkjes worden onder de herkomst van wiebren.github.io bewaard,
  apart van jouw site.

### Als app installeren

De viewer is ook een app die je kunt installeren (een PWA): `https://wiebren.github.io/lelievlet/app.html`.
Hij opent dan in een eigen venster met een eigen icoon, en werkt ook zonder internet, op het water of
op de steiger.

- **Vanuit elke viewer:** *Installeer als app* onderaan het tandwielpaneel gaat naar de app-pagina en
  neemt het zeilnummer, de naam, de plaats en de kleuren mee. Op een telefoon of tablet (een
  aanraakscherm) staat daarvoor ook een icoon rechtsonder, een telefoon met een pijl omlaag. De
  app-pagina laat zien hoe je installeert: in Chrome en Edge met één knop, in Safari op iPhone en iPad
  via *Deel › Zet op beginscherm*, in Safari op de Mac via *Archief › Voeg toe aan Dock*, op Android via
  het menu. Firefox op de computer installeert geen apps. In een ingesloten viewer opent de app-pagina in een nieuw tabblad; `installeren: false`
  haalt de regel en het icoon weg. In de geïnstalleerde app zelf staan ze er niet.
- **De configuratie** komt na de `#` mee, ingepakt (`#v1.…`, zie *Insluiten als iframe*; gewone JSON
  mag ook), en blijft daar in het adres staan: de geïnstalleerde app start met dat adres. Op een iPhone of iPad heeft de app eigen
  opslag, los van Safari, en vindt ze daar de eerste keer niets; zo start ze toch met de eigen boot. De
  pagina geeft daarvoor een eigen manifest met dat adres als `start_url`, en het manifestbestand zelf
  heeft er geen (dan is het de pagina zelf). Wat je daarna in de app aanpast, onthoudt ze; komt er een
  andere boot na de `#`, dan begint ze daar opnieuw mee.
- **Zonder internet:** een service worker (`sw.js`) bewaart alles wat de app nodig heeft: de pagina,
  het script, het model en de texturen, samen zo'n 2,5 MB.
- **Bijwerken:** elke build schrijft in `sw.js` een versie, een hash over al die bestanden. Verandert
  er iets, dan is er een nieuwe `sw.js`. De app vraagt daar bij het starten naar, elk uur, en telkens
  als hij weer in beeld komt. Is er een nieuwe versie, dan haalt hij die op en biedt hij *Bijwerken*
  aan.

- **Het icoon** is de eigen boot: de lelievlet in zijaanzicht, in de kleuren en met het zeilnummer
  die de app meekreeg, plus wat er in de app nog is aangepast. De app-pagina tekent het bij de start
  (`web/demo/logo.js`), en opnieuw zodra in de app de kleuren of het zeilnummer veranderen; de service
  worker geeft het in plaats van het standaardicoon. Of het icoon op het beginscherm meeverandert,
  bepaalt het systeem: een iPhone houdt het icoon waarmee de app is toegevoegd, Chrome kijkt af en toe
  (hooguit eens per dag, bij het starten) en vraagt dan of het nieuwe icoon mag. De standaardiconen in
  `web/demo/icons/` komen uit hetzelfde logo, in de kleuren van de viewer zelf, en worden met
  `pnpm icons` opnieuw gemaakt (dat vraagt `rsvg-convert`, uit librsvg).

Bestanden: `web/demo/app.html`, `app.webmanifest`, `logo.js`, `sw.js` (het sjabloon; de versie en de
lijst bestanden vult `pnpm build:lib` in) en `icons/`.

### Wat `create` teruggeeft

```js
const vlet = Lelievlet.create(element, { … });
await vlet.ready;     // het model is geladen en het eerste beeld is getekend
vlet.config;          // de configuratie zoals hij geldt, met alle standaardwaarden ingevuld
vlet.destroy();       // stopt de tekenlus, geeft de WebGL-context en het geheugen terug,
                      // haalt alle listeners weg en maakt het element leeg
vlet.fullscreen();    // volledig scherm aan/uit; vlet.fullscreen(true) of (false) dwingt het af
vlet.get();           // de toestand waarin de viewer nu staat (null zolang het model laadt)
vlet.set({ modus: 'roeien', commando: 'slag' });   // naar een andere toestand, geanimeerd
vlet.set({ tuig: 'mast' }, { direct: true });      // … of in één keer
```

`set(toestand, { direct })` neemt dezelfde sleutels als `toestand` in de configuratie (zie de tabel)
en verandert alleen wat je meegeeft. Het loopt via dezelfde weg als de knoppen: de iconen en panelen
laten zien wat de pagina zette, en een procedure (Zeilen, Mast, Reven) speelt af met zijn voortgangsbalk.
Met `direct: true` staat de boot er meteen. Een `set()` vóór `ready` wacht op het model en gaat dan
samen met de `toestand` uit de configuratie in één keer in. `get()` geeft een object in dezelfde vorm
terug, met `commando` altijd als `{ bb, sb }`, `selectie` als lijst ids en het standpunt als
`camera` (op de millimeter; tijdens een vlucht waar hij heen gaat). `aanzicht` zit er niet in, want
na één sleep met de muis klopt dat niet meer — `camera` wel. Een waarde die de viewer niet kent wordt met een
`console.warn` gemeld en overgeslagen; de rest van de toestand gaat gewoon door.

`create(element, config)` werpt een `TypeError` als het eerste argument geen element is. Na
`destroy()` mag je opnieuw `create()` op hetzelfde element aanroepen.

`packConfig(config)` en `unpackConfig(tekst)` (ook los te importeren) zetten een configuratie om in de
tekst na de `#` van `embed.html` en `app.html`, en terug: beide geven een promise. Ingepakt is het de
JSON, gecomprimeerd en in base64url, met `v1.` ervoor; een browser zonder `CompressionStream` schrijft
gewone JSON. `unpackConfig` leest beide vormen en geeft `null` bij iets wat geen configuratie is.

`fullscreen(aan?)` geeft de promise van het verzoek terug. Browsers staan volledig scherm alleen toe
vanuit een echte gebruikersactie (een klik of toetsaanslag), dus een aanroep uit een `setTimeout` of
bij het laden van de pagina wordt geweigerd — de viewer valt dan terug op de paginavullende modus,
net als op een iPhone. Staat `volledigScherm` op `false`, dan doet de aanroep niets. `destroy()`
verlaat volledig scherm vanzelf.

### Configuratie

Alles is optioneel; wat je weglaat blijft zoals de viewer het zelf heeft. Een sleutel die de viewer
niet kent, wordt één keer met een `console.warn` gemeld. De volledige vorm staat ook in
`web/src/config.js`.

| Sleutel | Type | Standaard | Wat |
|---|---|---|---|
| `assets` | string | naast het script | Map waarin `models/` en `textures/` staan, bijvoorbeeld `'https://cdn.example/vlet/'`. Zonder sluitende `/` wordt die toegevoegd; een relatief pad wordt tegen de pagina opgelost. |
| `volledigScherm` | boolean | `true` | Knop voor volledig scherm, rechtsboven onder het tandwiel, en de sneltoets `f`. `false` haalt de knop weg, laat de `f` met rust en maakt `handle.fullscreen()` een lege huls. |
| `installeren` | boolean | `true` | *Installeer als app* onderaan het tandwielpaneel: opent de app-pagina op wiebren.github.io met de eigen Aanpassen-waarden, en legt daar uit hoe je installeert. Op een aanraakscherm ook als icoon rechtsonder. `false` haalt beide weg. In de geïnstalleerde app zelf staan ze er nooit. |
| `aanpassen.zeilnummer` | string | `'000'` | Zeilnummer op het grootzeil (max. 4 tekens). |
| `aanpassen.naam` | string | `'Lelievlet'` | Naam op het boeisel, ter hoogte van het voordek. |
| `aanpassen.plaats` | string | `'Zwolle'` | Plaats op het boeisel, ter hoogte van het achterdek. |
| `aanpassen.naamKleur` | hexkleur | `'#0b0b0b'` | Kleur van de belettering van de naam. |
| `aanpassen.plaatsKleur` | hexkleur | `'#0b0b0b'` | Kleur van de belettering van de plaats. |
| `aanpassen.bakskleur` | hexkleur | `'#c8102e'` | Accentkleur: beslag, roerkop, hanekam, mastbanden en de geschilderde banden. |
| `aanpassen.kleuren.<zone>` | hexkleur | zie hieronder | Kleur per verfzone: `romp` `#0a0a0b`, `berghout` `#0a0a0b`, `boeisel` `#f5c20d`, `dolboord` `#0a0a0b`, `voordek` `#8f9499`, `achterdek` `#8f9499`, `kuip` `#8f9499`, `zwaardkast` `#8f9499`. |
| `aanpassen.opslaan` | boolean | `true` | `false`: de viewer leest en schrijft geen `localStorage` (Aanpassen, de score en keuzes van Oefenen, de vinkjes bij Manoeuvres); elke bezoeker begint bij jouw waarden. |
| `toestand.modus` | `'zeilen'` \| `'roeien'` \| `'wrikken'` | `'zeilen'` | De modus waarin de viewer opent. |
| `toestand.tuig` | `'op'` \| `'gestreken'` \| `'mast'` | `'op'` | Zeilen op, zeilen gestreken of mast gestreken. |
| `toestand.koers` | getal | `90` | Graden van de wind af: `0` is kop in de wind, `45` aan de wind, `90` halve wind, `135` ruime wind, `180` voor de wind (met de fok te loevert); daartussen mag ook. Positief: wind over stuurboord, negatief: over bakboord. Tussen 0 en 45 wordt 45. |
| `toestand.reven` | 0–5 | `0` | Het aantal slagen van het grootzeil om de giek. |
| `toestand.roeien` | `'naast'` \| `'kruis'` \| `'vier'` | `'kruis'` | Twee riemen naast elkaar, twee kruislings of vier. |
| `toestand.commando` | string of `{ bb, sb }` | `'slag'` | Het roeicommando (sleutels als bij `namen.commandos`). Een string geldt voor de hele boot; per boord kan alleen `haal` `opriemen` `strijk` `stopaf` `lopen`, en een boord dat je weglaat blijft zoals het was. |
| `toestand.zwaard` | `'neer'` \| `'half'` \| `'op'` | volgt de koers | Het midzwaard. Zonder deze sleutel gaat het op bij roeien, wrikken, voor de wind en voor anker, en anders neer. Met het tuig gestreken of de mast neer staat het altijd op (de stap Midzwaard op). |
| `toestand.aanzicht` | `'3d'` \| `'zij'` \| `'boven'` \| `'voor'` \| `'achter'` | `'3d'` | Het camerastandpunt waarmee de viewer begint (er zijn geen knoppen meer voor: de camera draai je zelf). |
| `toestand.selectie` | id of lijst ids | — | Onderdelen die geselecteerd zijn, met hun infotegel; de camera gaat erheen, tenzij er ook een `aanzicht` of `camera` is. `null` of `[]` heft de selectie op. |
| `toestand.camera` | `{ positie, doel }` | — | Het precieze standpunt: `positie` is waar de camera staat, `doel` waar hij naar kijkt, elk `[x, y, z]` in meters in de assen van het model (x van spiegel naar boeg, y omhoog, z naar stuurboord). Gaat voor `aanzicht`. Het makkelijkst te krijgen uit het paneel van `debug.toestand`. |
| `namen.onderdelen[id]` | string | — | Hernoemt een onderdeel overal: hovertip, infotegel, de lijst Onderdelen (ook de samenvoeging van bakboord/stuurboord, die op namen werkt) en de terugkoppeling van de quiz. Sleutel is de onderdeel-id, bijvoorbeeld `{ hommerring: 'Mastring' }`. |
| `namen.stappen[label]` | string | — | Hernoemt een stap van een procedure (Reven, Zeilen, Mast). Sleutel is het standaardlabel, bijvoorbeeld `{ 'Fok strijken': 'Fok neer' }`. Elke stap heeft ook een naam voor de andere kant op, die de balk toont als de procedure achteruit loopt (Fok hijsen, Anker op, Mast zetten, …); die hernoem je op dezelfde manier: `{ 'Fok hijsen': 'Fok op' }`. |
| `namen.commandos[key]` | string of object | — | Hernoemt een roeicommando. Een string is het knoplabel; `{ knop, roep }` zet ook de woorden die de roerganger roept. Sleutels: `slag` `haal` `opriemen` `strijk` `stopaf` `lopen` `over` `op` `geroeid`. |
| `namen.quiz[nr of naam]` | string | — | Hernoemt een quizvraag, op nummer of op de standaardnaam: `{ 27: 'Hommerring', Kleed: 'Baan' }`. |
| `quiz.weg` | array | `[]` | Nummers of namen die niet gevraagd worden: `[27, 'Kleed']`. |
| `quiz.erbij` | array | `[]` | Eigen vragen: `[{ naam, delen: ['id', …], ook: ['id', …], niveau: 1, roeien: true, nr: 200 }]`. `naam` en een niet-lege `delen` zijn verplicht; zonder `nr` krijgt de vraag er zelf een vanaf 1000, zonder `niveau` geldt Zeilen III, `roeien: true` vraagt hem ook bij Roeien en `zeilen: false` laat hem bij Zeilen weg. |
| `quiz.niveau` | `'roeien'` \| 1 \| 2 \| 3 | `3` | Het niveau waarop het startpaneel opent: `'roeien'` voor CWO Roeien, 1–3 voor Zeilen I–III. De gebruiker kan het daarna zelf wisselen, en het paneel onthoudt zijn laatste keuze. |
| `debug.modelnummer` | boolean | `false` | Toont de regel "Modelnummer" in de infotegel: de CAD-handle van de body waarop geklikt is. Een hulpmiddel bij het modelleren, niets voor een verkenner. |
| `debug.quiztabellen` | boolean | `false` | Zet een link **Tabellen** in het startpaneel van Oefenen, die de opgeloste quizconfiguratie als tabel toont: nr, naam (na hernoemen), niveau, `delen` en `ook` (elke id die in het geladen model niet bestaat staat rood), of het een eigen vraag is, en de score per vraag. Daaronder een tweede tabel met alle onderdelen waar geen enkele vraag over gaat. |
| `debug.toestand` | boolean | `false` | Zet een icoon `{ }` rechtsonder, boven de onderdelenkaart. Het paneel toont de toestand waarin de viewer nu staat als de configuratie om daar te beginnen (`{ "toestand": { … } }`, zie `get()`, met het camerastandpunt), bijgewerkt zolang het open staat, met een knop **Kopieer als JSON**. |
| `debug` | `true` \| `false` | — | `debug: true` zet alle hulpmiddelen tegelijk aan, `debug: false` alle uit. |

De ontwikkelpagina (`web/index.html`) geeft `debug: import.meta.env.DEV` mee: onder `pnpm dev` staan
alle hulpmiddelen dus aan, in een build niet.

Staat een van de debugvlaggen aan, dan heeft de handle er een `debugHandle` bij: camera, controls,
scene, parts, en de handles van `modes`, `regions` en `quiz`. In de Vite-ontwikkelserver staat
dezelfde handle op `window.vlet`, voor de eerste viewer op de pagina.

### Hoe het in elkaar zit

`web/src/lib.js` is de hele buitenkant: het hangt een shadow root aan het element, vult die met de
stylesheet (`style.css`, als string ingeladen met `?inline`) en de opmaak (`web/src/template.js`, de
markup die vroeger de body van `index.html` was, in één `<div class="lv">`), en roept `mount()` in
`web/src/main.js` aan. Er draait niets meer op importniveau: alles wat `main.js` deed zit in die
functie, en geen enkel `src`-bestand houdt nog veranderlijke toestand op moduleniveau. Elk
`document.getElementById` is een opzoeking in de shadow root geworden, alles wat op `document.body`
stond (`quiz-on`, `procedure-open`, `--procedure-top`) staat nu op
`.lv`, en elke listener op `window` of `document` hangt aan een `AbortSignal` die `destroy()` afvuurt.
Omdat een gebeurtenis buiten de shadow root naar het hostelement wordt omgericht, leest de code die
moet weten waar een klik of toets echt begon `e.composedPath()[0]` in plaats van `e.target`. De
renderer en de camera worden met een `ResizeObserver` op het element gemeten, niet op het venster, en
de smalle indeling komt van container queries op `.lv` in plaats van media queries.

### Bouwen en publiceren

    cd web
    pnpm build:lib        # -> web/dist-lib/ : lelievlet.js, lelievlet.iife.js, models/, textures/, index.html
    pnpm build            # -> web/dist/    : de ontwikkelpagina als losse site

`pnpm build:lib` bundelt three mee (er is niets externs nodig), zet `models/` en `textures/` naast
het script en kopieert `web/demo/index.html` als `index.html` erbij — dat is de pagina die
gepubliceerd wordt. De workflow `.github/workflows/pages.yml` doet dit bij elke push naar `main` en
zet `web/dist-lib` op GitHub Pages. Omdat de bestanden naast het script staan, hoeft een insluitende
pagina geen `assets` op te geven.

## Het model opnieuw bouwen

    OCP='--python 3.12 --with cadquery-ocp>=7.8,<7.9 --with ezdxf --with numpy'
    uv run $OCP python3 pipeline/tessellate_all.py --force      # ACIS-bodies -> build/mesh (≈15 s)
    uv run --python 3.12 --with numpy --with scipy --with meshoptimizer python3 pipeline/build_glb.py
    uv run --python 3.12 --with numpy --with pillow python3 pipeline/render_preview.py build/preview/iso.png --view iso

`cadquery-ocp` staat vast op 7.8: in de 8.x-wheels zijn de array-klassen `TColgp`/`TColStd` vervallen.

## Pipeline

1. `reference/cad/extract_sab.py` haalt de 222 binaire ACIS-bodies uit de DWG (zie
   `reference/cad/README.md` voor waarom `dwg2dxf` niet gebruikt mag worden).
2. `pipeline/acis_occ.py` bouwt elke body opnieuw op in OpenCascade: analytische oppervlakken exact,
   spline-oppervlakken uit hun NURBS-data, loops uit de co-edge-richtingen van ACIS; faces worden per
   body aan elkaar genaaid en gesloten shells als solid georiënteerd. Bij tori en bollen zijn beide
   zijden van een loop begrensd, dus daar bepaalt de ACIS-regel welke kant de face is (keer de loops
   om dan en slechts dan als de face omgekeerd is ten opzichte van het herbouwde oppervlak;
   geverifieerd op 1372 van de 1373 eenduidige faces). Wie in plaats daarvan de kleinste kant kiest,
   verliest elk oog, elke ring en elke harpbeugel. Omsluiten die loops een negatief oppervlak, dan
   zijn ze de las van een oog en is de face het hele oppervlak min die patch, wat OpenCascade niet
   kan meshen (de patch kruist de naad); in plaats daarvan wordt het hele oppervlak uitgevoerd, want
   de patch zit verborgen in het onderdeel waar het oog op gelast is. 6934 van de 6936 faces
   converteren; de twee missers zijn een splinter van 0.6 mm op de giek en een cilinderwand van 3 mm
   binnen in een tuigbeslag.
3. `pipeline/tessellate_all.py` mesht met exacte oppervlaktenormalen en een driehoekbudget per body
   (touwwerk wordt grover gemaakt) — ≈ 500 k driehoeken in totaal.
4. `pipeline/parts.py` benoemt de bodies (handle → onderdeel-id, Nederlandse naam, groep, materiaal),
   geïdentificeerd op maat en positie aan de hand van het Vlettenboek. Tuigbeslag dat er niet in staat
   valt voorlopig onder één verzamelonderdeel.
5. `pipeline/sails.py` vervangt de vlakke CAD-zeilen van 0.1 mm door bol zeildoek op dezelfde omtrek,
   met UV's, baannaden opgemeten uit het zeilplan (Vlettenboek p. 60: dwarsgesneden, doek van 90 cm,
   loodrecht op schoothoek → tophoek/kop) en de plaats van zeilteken en cijfers (p. 58: lelie + V
   38 cm breed, cijfers 30 × 20 cm, stuurboord het hoogst). De viewer tekent de texture
   (`web/src/sails.js`), zodat het zeilnummer live te wijzigen is.
6. `pipeline/rigging.py` genereert geometrie opnieuw die in de CAD niet klopt. De blokken van de
   fokkenschoot zijn op het tweede leioog getekend; ze horen op het voorste, bij het zijstag
   (bodies 5943 / 5953), dus `NUDGE` in `pipeline/parts.py` brengt ze daarheen en de schoot loopt
   schoothoek -> blok -> hand van de bemanning (de viewer legt hem live, zie verderop). De roerkop is
   getekend als twee losse zijplaten van 2 mm; het is één plaat die over een radius is omgezet, met
   het helmhout die er van onderen in steekt, dus de omgezette band langs de bovenrand wordt
   gegenereerd en toegevoegd.
   Ook beide marllijnen worden opnieuw gegenereerd, met echte marlsteken (de CAD windt een
   gewone spiraal): lijn langs het lijk, bij elke zeilring één ingestoken slag, eerste ring op 100 mm,
   daarna om de 200 mm. Getekend als Ø4 in plaats van de voorgeschreven Ø3, zodat hij zichtbaar blijft.
   `pipeline/hardware.py` voegt beslag toe vanuit de gaten die de CAD wél heeft: de **mastbout**
   (bovenste gat van de mastkoker, dwars door de mast) en de **grendelbout** (onderste gat, vóór de
   mastvoet), ronde lippen met een gat op de mastband zodat de lummelbout daarin staat, het
   **borglijntje** van de lummelbout naar het oog op de beslagband van de giek, en de voet van
   elke wantputting, doorgetrokken tot op het dolboord (de CAD laat hem 9 mm erboven eindigen, in de
   lucht; de plaat zelf wordt niet verplaatst, zodat het harpje van het zijstag nog steeds door het gat gaat).
   Ook bouwt het de zes **dolpotten** (Vlettenboek p. 23 en p. 35): 3/4"-buis van 100 mm lang,
   aan beide einden open, verticaal tegen de binnenkant van het dolboord met de bovenkant gelijk
   daarmee, op x = 4412 / 3432 / 2488 aan beide zijden, elk met de plaat van 4 mm die over de onderste
   50 mm de wig tussen pot en boeisel opvult. Zeeg en breedte lopen over de boot uiteen, dus de cirkel
   van het dolboord en de binnenkant van de beplating worden bij elk spant opgemeten. De dollen
   zelf worden in de viewer gebouwd, op `extras.tuig.dolpotten`.
   De twee **mikhouders** zijn dezelfde buis, 50 mm lang, boven elkaar op de hartlijn tegen de
   voorkant van het achterschot — een vlakke verticale plaat op x = 2041.2, zodat de wand hem langs
   een lijn raakt en er geen vulplaat nodig is — de bovenste met zijn bovenkant 40 mm onder de
   bovenrand van dat vlak en de onderste 250 mm daaronder. De **mik** zelf
   (Vlettenboek p. 35) wordt in de viewer gebouwd (`makeMik`), op `extras.tuig.mik`.
   `pipeline/sleepogen.py` maakt de **sleepogen** aan de buitenkant van de spiegel door de
   landvastogen (CAD-bodies 589B, 589F) te spiegelen in het middenvlak van de plaat.
   `pipeline/anchor.py` voegt het **ankergerei** toe, waarvan de CAD niets heeft: het **anker**
   (de gegalvaniseerde Danforth van scoutingvlet.nl, ongeveer 7.5 kg — er zijn geen maten
   gepubliceerd, dus de plaat van 6 mm is van twee foto's afgepast en komt uit op 7.6 kg staal), de
   meter **ankerketting** van 6 mm (DIN 766, 54 schalmen van elk een stadionvormige ring) en
   ongeveer 6.4 m **ankerlijn** van 12 mm. Het ligt aan stuurboord opgeborgen, met een bakskist tegen
   hetzelfde schot aan bakboord: het anker leunt voorover tegen de achterkant van het voorschot (een
   vlakke plaat op x = 4758.2), met de toppen van de vloeien tegen dat vlak en de onderranden van de
   stabilisatorplaten op de vlonder, die tot op 2 mm van het schot doorloopt. De schacht is 12°
   uit het vlak van de vloeien gedraaid (hij draait op de kruisbuis, tot ongeveer 32° naar beide
   kanten) en staat daardoor rechtop: in dat vlak zou hij door het schot steken, omdat hij zowel
   langer als dikker is dan de vloeien. Ketting en opgeschoten lijn liggen naast het anker op de
   denning en de lijn loopt over het voorschot, langs het voordek (de hoogte daarvan is uit body 59D4
   bemonsterd zodat het touw op het dek ligt) en omhoog door de V van de boeg naar het **ankeroog**.
   Dat oog is hetzelfde beslag als de landvastogen op de spiegel (Vlettenboek p. 35, bodies 589B/589F,
   daarvan afgemeten: staf van 9 mm, 96 mm lang, beugel 25.6 mm uitstekend), met de voetjes gelast in
   de naad waar de twee vlakplaten bij de steven samenkomen, 70 mm onder de voorplecht. Beide
   uiteinden staan voor de viewer op `extras.tuig.anker`.
   `pipeline/bakskist.py` (de kist op de vlonders, hol, met deksel, scharnieren en touwhandvatten;
   `placement()` geeft het binnenframe om er spullen in op te bergen) en `pipeline/landvasten.py`
   (achterlandvast op het bakboord landvastoog, opgeschoten op het achterdek; voorlandvast
   opgeschoten op het voordek, over het dolboord naar het sleepoog op de steven) volgen hetzelfde
   patroon: een module met `build(mesh_dir)`, toegevoegd in `build_glb.py`.
   `pipeline/bakskist_inhoud.py`: wat er in de kist ligt, geplaatst in het eigen (hellende) frame
   daarvan: de **meerpen**, het **hoosblik** en de witte **EHBO-koffer** met verhoogde rode letters.
   `pipeline/fokbeslag.py`: tien **leuvers** (stagleuvers 51.5 x 27 mm) met hun bek om de as van het
   voorstag en hun staart op het voorlijk van de fok (de CAD zet de fok 37 tot 46 mm van zijn stag af;
   de leuvers overbruggen dat), en de **voorstagspanner met pelikaanhaak**: haak door het voorste gat
   van de hanekam, oog gepend aan de kous van het stag, borgring over arm en stag. Het vervangt het
   harpje dat de CAD daar heeft (bodies 514E, 5156, in `DROP`). In de viewer zwaaien de leuvers met de
   fok mee en glijden ze langs het stag omlaag als de fok gestreken wordt.
   `pipeline/wantkettingen.py`: de **wantketting** onderaan elk zijstag — zes schalmen van dezelfde
   ketting van 6 mm als de ankerketting, op de lijn van de draad zelf tussen de beugel van het harpje
   in de wantputting en het gesplitste kousoog. De CAD laat de draad tot aan dat harpje doorlopen, dus
   de module kort hem ook in (`hardware.reshape` stuurt bodies 51C2 / 519A daarheen): de mesh wordt
   haaks op de as afgesneden, 5 mm boven de splits, het oog wordt 115.8 mm langs die as omhooggezet en
   de kale draad die het nu bedekt vervalt. Beide uiteinden van elk zijstag gaan voor de viewer op
   `extras.tuig.wanten`.
7. `pipeline/build_glb.py` schrijft de GLB: meters, Y omhoog, x van spiegel naar boeg, z naar
   stuurboord; scene graph groep → onderdeel, met `extras` (id, naam, groep, materiaal, DWG-handles, size).

## Aanpassen

De tandwielknop opent het menu (`web/src/customize.js`): zeilnummer, naam en plaats (belettering die
als decals op het boeisel wordt geprojecteerd ter hoogte van voordek / achterdek, aan beide zijden —
`web/src/hulltext.js`), een bakskleur en één kleur per verfzone. De bakskleur (materiaal `bakskleur`)
accentueert roerkop, voorplecht, hanekam, de metalen mastbanden (lummelband, hommerring,
masttopring), het giekbeslag aan beide einden van de giek, en geschilderde banden van 5 cm: 5 cm
vanaf de uiteinden van de doften en het helmhout, en net voorbij de handgreep van elke riem. De
metalen delen zijn faces van de CAD-solids die als eigen onderdelen zijn afgesplitst
(`REGION_SPLITS`); de geschilderde banden worden langs twee vlakken in de mesh gesneden (`BANDS`,
`cut_bands` in `pipeline/build_glb.py`). Zones zijn glTF-materiaalnamen die in `pipeline/parts.py`
worden toegekend: romp (incl. alles onder de waterlijn), berghout, boeisel, dolboord, voordek,
achterdek, kuip, zwaardkast (incl. zwaardloper, mastkoker en de kikkers daarop). Er zijn drie lagen,
elk sterker dan de vorige: de eigen standaardwaarden van de viewer, wat de pagina in
`config.aanpassen` meegeeft, en wat deze gebruiker in deze browser heeft ingesteld — dat laatste
blijft bewaard in `localStorage` onder `lelievlet.aanpassen.v1`, tenzij `aanpassen.opslaan` op
`false` staat. Alleen wat afwijkt van de eerste twee lagen wordt bewaard: verandert de pagina later
haar `config.aanpassen`, dan krijgt ook een bezoeker die ooit iets anders aanpaste de nieuwe waarden.
"Standaardwaarden" zet alles terug naar waar deze viewer begon, dus naar de waarden
van de pagina als die er zijn. Alle tekst naar de gebruiker toe is Nederlands.

## Modi en animatie

`web/src/modes.js` schakelt tussen Zeilen, Roeien en Wrikken en trimt in Zeilen de zeilen voor een
koers ten opzichte van de wind. De bediening is een kolom iconen linksboven - **Boot**, dan
**Oefenen**, en in Roeien **Roeicommando** - en elk icoon opent zijn bediening in een popover ernaast: één tegelijk, weer te sluiten met hetzelfde icoon, een ander icoon,
Escape of een klik ernaast. **Boot** bundelt de modus (Zeilen, Roeien, Wrikken), de koers ten
opzichte van de wind en het aantal riemen; het icoon tekent de modus, en in het paneel staat bij
*Wind* de wolk met pijl gedraaid naar waar de wind vandaan komt. Wind staat er alleen in Zeilen met
de zeilen op en Riemen alleen in Roeien; een keuze in het paneel laat het open, zodat je daarna nog
iets anders kunt zetten. De koersschuif is gespiegeld: precies in het midden ligt de boot met de kop in de
wind (koers 0, zoals voor anker: giek en fok midscheeps, en de zeilen vangen niets en klapperen zacht -
`Bend.flutter`, golven die van het voorlijk naar achteren lopen, met het bollinggewicht als omhullende
zodat het doek stil blijft waar het vastzit), aan weerszijden daarvan begint aan de wind (elke boeg zijn eigen knop), naar rechts
komt de wind over stuurboord, naar links over bakboord, dus door het midden gaan is overstag gaan; beide uiteinden lopen door tot voor de wind, dat altijd met de fok te loevert wordt gevaren: het label heeft dat als grijze tweede regel. De labels zijn zichtbaar zolang
het windpaneel open staat. De boot blijft liggen; een windpijl draait eromheen.
Alle waarden lopen soepel naar hun doelwaarde toe, dus elke verandering is een animatie.

- Gaffel, grootzeil, hun rijglijn en beslag draaien om de (exact verticale) mast. De giek draait op
  de lummelbout, die 52 mm achter de mast in de lippen van de mastband staat, en wordt zo gericht dat
  de nok onder de schoothoek blijft. De fok draait om het voorstag; waar voor de wind begint (158°) gaat
  hij op weg naar 180° over naar loef (fok te loevert).
- De fokkenschoten zijn geen opgerekte CAD-touwen maar worden elk frame opnieuw gelegd (`RopeLine`,
  `roundTheFront` in `web/src/rig.js`): de lijzijdige schoot loopt recht van de schoothoek naar zijn
  blok, de loefzijdige gaat eerst om de voorkant van de mast heen. Elk blok hangt aan zijn leioog
  tussen de twee parten van zijn schoot.
- Beide zeilen worden vlak geëxporteerd met een buiggewicht per vertex en in de viewer gebogen, want
  de buik zit altijd aan lij en wisselt van kant als de boot overstag gaat (grootzeil en zijn
  zeillatten: ontworpen buik, iets voller bij ruimere wind).
- Elk lijk en elke hoek van beide zeilen is een eigen benoemd onderdeel (voorlijk, achterlijk,
  onderlijk, bovenlijk; hals-, schoot-, klauw- en tophoek): een strook band van 6 cm langs elk lijk en
  een versterkingslap in elke hoek, aan beide zijden gegenereerd in `pipeline/sails.py`.
- De fok is een vlakke driehoek die door de wind bol wordt gezet: vlak geëxporteerd met een
  buiggewicht per vertex (`_BOLLING`), in de viewer gebogen met enkelvoudige kromming (voorlijk
  recht, hoeken vast, onderlijk en achterlijk bollen uit). De diepte volgt de koers, gaat door vlak
  heen terwijl de fok overkomt en keert binnenstebuiten voor fok te loevert.
- Piekenval en klauwval, die alleen een bewegend uiteinde volgen, worden per vertex opgerekt
  (`RopeStretch` in `web/src/rig.js`).
- De grootschoot is een talie die elk frame opnieuw wordt geschoren (`RopeLine`): vastgezet aan de
  hondsvot onder het bovenste blok, om de ene schijf van het onderste blok, over de bovenste schijf,
  om de andere onderste schijf en door naar de hand van de roerganger, die aan loef op het achterdek
  zit. De CAD tekent het onderste blok 40 mm achter het grootschootoog met het harpje naast het oog;
  `NUDGE` verplaatst het zo dat de harppen onder de bovenkant van het oog door gaat.
- Assen en ankerpunten komen uit de CAD via `pipeline/rig_data.py` (rootnode `extras.tuig`). Dat
  bestand sorteert ook het niet-benoemde beslag naar wat met giek, gaffel of fok meebeweegt.
- De knoppen zitten op drie plaatsen. Linksboven staat de kolom met **Boot**, de studentenmuts
  **Oefenen** en in Roeien **Roeicommando**. Oefenen kiest eerst wat je oefent - **Manoeuvres** (de
  handelingen, alleen in Zeilen) of **Onderdelen** (de quiz) - en toont daaronder het startpaneel
  daarvan; het opent op wat het laatst gekozen is.
  Rechtsboven zit het **tandwiel** voor Aanpassen, met onderaan dat paneel de snelheid van de
  animaties (met de sneltoetsen voor de camera) en de link **Over dit model**, dat midden in beeld
  opengaat. Rechtsonder staat de **onderdelenkaart**: met niets geselecteerd is
  dat alleen een ronde zoekknop, met een onderdeel geselecteerd de kaart met groep en naam en
  rechtsboven daarin dezelfde zoekknop. Die opent de doorzoekbare **Onderdelen**-lijst boven de
  kaart; elke groepskop daarin heeft een oog dat de hele groep in het model verbergt of weer toont,
  en *Alles tonen* / *Alles verbergen* doen dat voor alle groepen tegelijk. Wat verder in die hoek staat (de debugknoppen) schuift mee omhoog met de hoogte van de
  kaart (`--info-clear`). De bediening van de boot zelf zit achter de kolom iconen linksboven.
- Onder het tandwiel zit **Volledig scherm** (de vier hoekhaken, naar binnen gekeerd zodra het aan
  staat), ook te bedienen met de toets `f`; hij verdwijnt zolang het Aanpassen-paneel open staat,
  want dat staat op zijn plek. Volledig scherm wordt aan het *hostelement* gevraagd, dus de hele
  shadow root gaat mee en de viewer houdt zijn eigen indeling (`web/src/fullscreen.js`). Kan de
  browser dat niet — Safari op de iPhone kent `requestFullscreen` op een element niet, en in een
  `<iframe>` zonder `allow="fullscreen"` is het uitgezet — of wordt het verzoek geweigerd, dan legt
  de viewer zichzelf paginavullend over de pagina heen (`position: fixed`, attribuut `data-lv-vol`
  op de host) en zet de pagina eronder op slot; Escape haalt hem daar weer uit. Zie `volledigScherm`
  in de configuratietabel.
- Een lopende procedure (Reven, Zeilen, Mast) toont zijn voortgangsbalk `#procedure` onderaan in beeld:
  vorige stap, play/pause, volgende stap en een schuif over de hele timeline met een streepje bij elke
  stapgrens, het nummer en het Nederlandse label van de stap waarin hij zit, en de naam van de
  procedure. Hij speelt vanzelf af; slepen aan de schuif scrubt en pauzeert, play brengt hem verder
  naar wat opgedragen was. Hij staat onderaan in het midden; in een smalle viewer stapt de infotegel
  eroverheen (`--procedure-top`). Bij een handeling die bekeken wordt staat hij in de kaart, bij
  oefenen is hij er niet: daar zijn de stappen de vragen. Zodra de procedure stilligt vervaagt hij
  na 2.5 s, tenzij zijn eigen paneel open staat, de muis erboven hangt of hij de focus heeft - zo kan een afgelopen
  procedure vanuit "Handelingen" teruggescrubd worden.
- Onderdelen somt elk onderdeel per groep op, doorzoekbaar, met één regel per naam
  (vier dollen zijn één regel "Dol ×4"). Een bakboord- en een stuurboordtweeling delen één regel onder
  de naam zonder de zijde ("Wantputting (bakboord)" en "(stuurboord)" -> "Wantputting", als één
  geteld); een klik erop pakt de tweeling aan de kant waar de camera vandaan kijkt, of de
  dichtstbijzijnde, en nog een klik levert de andere. De zoekfunctie vindt de zijde in de namen achter
  zo'n regel nog steeds. Een regel selecteert zijn onderdeel of onderdelen - dezelfde highlight en
  infotegel als een klik op het model, en de regel van een onderdeel dat op het model is aangeklikt
  wordt in de lijst gemarkeerd - en vliegt de camera ernaartoe: de bounding sphere van de meshes zoals
  die er op dat moment bij staan, gezien vanuit de kandidaatrichting (8 azimuts × twee hoogtehoeken,
  plus de richting waaruit nu gekeken wordt) waarbij het kleinste aantal van zeven steekproefpunten
  van het onderdeel achter andere onderdelen schuilgaat. Onderdelen die in de huidige modus weg zijn,
  worden gedimd en zijn niet aan te klikken.
- Wat geselecteerd is **ademt**, en wat klein is krijgt een **zoeklicht** (`web/src/locator.js`). De
  highlight van de selectie - en van de kleuren die de quiz op onderdelen zet, maar nooit die van de
  hover, die rustig en onmiddellijk blijft - zwelt aan en af in 1.4 s, tussen 55 % en 100 % van de
  sterkte die `paint()` zette; de overlay van een gebied ademt in zijn dekking mee. Het is het
  *materiaal* dat gevolgd wordt, elk één keer met de waarde die het van `paint()` kreeg als
  uitgangspunt (een paar onderdelen delen er een), en die waarde wordt teruggegeven zodra de
  highlight weg is, zodat er niets van achterblijft. Dekt een opgelicht onderdeel minder dan 44 px
  van het scherm, dan komt er een ring omheen: een vaste 56 px in beeld (nooit dichter dan 12 px om
  het onderdeel), in de kleur van de highlight, met een zachte gloed, in een laag direct boven de
  canvas en onder alle panelen - dus ook te zien als het onderdeel diep in de boot zit, zoals de
  zwaardbout in de zwaardkast. Hij pingt mee op dezelfde maat, komt binnen vanaf drie keer zijn maat
  in 450 ms, volgt het onderdeel per frame (ook tijdens een animatie: de bounding spheres worden
  gecached en alleen bij levende touwen en zeilen een paar keer per seconde opnieuw gemeten) en
  vervaagt zodra het onderdeel groter dan 56 px wordt - die marge tussen 44 en 56 px voorkomt
  geflikker precies op de grens. Een selectie van meerdere onderdelen krijgt een ring per onderdeel,
  hoogstens vier, waarbij onderdelen die op het scherm binnen 40 px van elkaar staan er samen één om
  hun gezamenlijke midden krijgen. In de quiz verklapt hij niets: bij Benoemen en Typen (waar het
  onderdeel de vráág is) staat er een ring, bij Aanwijzen en Kies het onderdeel pas nadat het
  antwoord gegeven is. Met `prefers-reduced-motion: reduce` beweegt er niets: een rustige highlight
  en een stilstaande ring.
- Sommige nummers in de tekening duiden een gebied aan, geen object: Boeg (de voorste 0.65 m van de
  romp) en Kleed (de derde baan van het grootzeil, geteld vanaf de schoothoek omhoog, tussen de naden
  van `extras.zeil.naden`). Ze staan als onderdelen in de lijst, gemarkeerd als "gebied", met
  "Gebied, geen los onderdeel" in de infotegel. `web/src/regions.js` definieert elk gebied
  als een paar onderdeel-id's plus een predicaat over de driehoeken van hun meshes, en bouwt de
  highlight als een overlay die de position- en normal-attributen van die meshes deelt (zodat hij met
  het zeil meebuigt) en eronder hangt (zodat hij met ze meezwaait). Hij verschijnt alleen zolang zijn
  regel geselecteerd is en is zelf nooit aan te klikken - een klik op de boeg selecteert nog steeds
  Boeisel, Vlak of Berghout.
- Een windvaan in de masttop (gebouwd in `web/src/rig.js`, niet in de CAD) draait zo dat het
  draadframe in de wind wijst en de rode vaan met de wind mee uitstaat.
- Midzwaard neer / half / op, zonder eigen bediening: een klik op het zwaard, de zwaardloper of de
  borgpen zet het een stand verder, en het volgt de boot - op bij roeien, wrikken, voor de wind en zodra een met de hand uitgegooid
  anker op de bodem ligt, weer neer bij elke andere koers en als het anker weer binnen is (het beweegt
  als dát verandert; stond het op half, dan blijft het half).
  Het zwaard draait om de zwaardbout in zijn voorste
  onderhoek - de CAD heeft die bout als een gat in de plaat, en het Vlettenboek p. 38 geeft de
  draairadius (R=880). De zwaardloper is een stangenstelsel en draait uitsluitend op zijn pennen: de
  voet van de onderste stang is aan het zwaard gepend (beide hebben op dezelfde plek een gat), de
  stangen zijn bij het knikpunt aan elkaar gepend, en de bovenkant van de kast is een sleuf van
  250 mm, zodat de loper loodrecht boven zijn voet hangt. De drie standen worden in
  `pipeline/rig_data.py` uit die gaten opgelost (`board_stops`): **neer** de schouderplaat van de
  loper komt op de kasttop te liggen (zwaard 14.3° onder de getekende stand, die zelf de stand op het
  middelste gat van de loper is); **half** de borgpen door het onderste gat van de bovenste stang
  rust op de kasttop (+6.6°); **op** de pen door het gat van het zwaard zelf rust daar (+34.3°), de
  voetpen zit dan boven de kast en de loper klapt weg - de onderste stang draait op de voetpen om
  achterover langs de kast te liggen, de bovenste stang draait op de knikpen om erachter naar beneden
  te hangen. De pen zit er alleen bij een stand in; daartussenin hangt hij aan zijn kettinkje aan een
  oog op de kasttop.
- Wervel en pettenlijntje (`pipeline/hardware.py`): de CAD tekent de wervel als een staaf van
  12 x 55 mm met twee putjes; hij wordt iets langer en breder opnieuw opgebouwd (18 x 92 mm), met in
  beide einden een echt gat. De kraanlijn wordt in het bovenste gat vastgezet. Het pettenlijntje loopt
  van de vrije beugel aan het bakboordeind van de schootring naar achteren onder de giek door, door
  het oog onder de achterste beslagband en door het onderste gat, met een stopperknoop erachter.
- Procedures (`web/src/procedure.js`): reven, zeilen strijken en mast strijken zijn timelines van
  stappen, die elk één waarde in een gegeven tijd van waar hij stond naar waar hij moet zijn brengen en
  een Nederlands label dragen. Een timeline kan beide kanten op worden afgespeeld, gepauzeerd, stap
  voor stap doorlopen en gescrubd; `initModes()` geeft de voortgangsbalk `procedure()` (kale data) en
  `procedureControl` (play, pause, volgende, vorige, scrub). Het tuig is ÉÉN timeline: "Zeilen op" is
  het begin, "Zeilen gestreken" het einde van de stap zeilbinders, "Mast gestreken" het einde ervan.
  Getoond en bediend wordt hij als twee flows, **Zeilen** en **Mast**: elk een `Stretch` (in
  `web/src/procedure.js`) van die timeline, met alleen zijn eigen stappen op de voortgangsbalk; vorige,
  volgende en de schuif blijven binnen de flow.
- Oefenen → **Manoeuvres** (`web/src/handelingen.js`) is een startpaneel met de
  handelingen als rijen, zoals de oefeningen van Oefenen, in vijf groepen: **Tuigage** (mast zetten, zeilen
  aanslaan, hijsen, reven met het aantal slagen, strijken en afslaan, mast strijken), **Wenden** (overstag, gijp, stormrondje, opkruisen, man over boord,
  dwarspeiling), **Afmeren** (aan hogerwal de sliplanding en de opschieter; aan een langswal de
  sliplanding en voor top en takel; aanleggen aan lagerwal; verhalen), **Afvaren** (van hogerwal, langswal en
  lagerwal, en kop in de wind leggen) en **Anker** (ankeren en anker op, onder zeil en zonder zeilen). De
  stappen en voorwaarden van elk staan in `docs/manoeuvres.md`. Een stap met een commando ("Ree!",
  "Gijp!") laat het commando als tekstballon zien boven wie het roept, net als een gekozen
  roeicommando. Elke handeling heeft
  voorwaarden (`OPS` in `web/src/modes.js`) die kijken naar hoe de boot er nu bij ligt en niet naar
  wat het laatst gevraagd is; een rij die niet kan is grijs, met de reden eronder ("Eerst de zeilen
  strijken", "Eerst de mast zetten", "Eerst de zeilen hijsen", "Eerst het reven afmaken") of wat er
  al zo is ("De mast staat al"). Wat niet genoemd is, doet er niet toe: de mast wil alleen gestreken
  en opgebonden zeilen — waar het anker of het midzwaard intussen is, maakt niet uit.
  Daaronder twee knoppen: **Bekijken** speelt de handeling af, en de stappenbalk (vorige, afspelen,
  volgende, de schuif) staat dan in de kaart; **Oefenen** laat de boot staan en vraagt bij elke stap
  "Wat is de volgende stap?" met vier antwoorden: de goede en drie die in de toestand van de boot
  nú zouden kunnen, alleen niet nu. Welke dat zijn volgt uit wat elke stap vooraf nodig heeft
  (`STEP_NEEDS` en `REEF_NEEDS` in `modes.js`: opdoeken vraagt het grootzeil omlaag, de mast de
  lummelbout, de grendelbout, de pelikaanhaak en de fok eraf), plus het terugdraaien van een stap die
  al gedaan is; ze komen vooral uit de handeling zelf en soms uit de andere flow. Een antwoord laat
  die stap zien (de camera eerst, zoals altijd), een fout antwoord de goede; na de laatste stap volgt
  de uitslag. Zolang een handeling loopt staat de viewer in focusmodus (`.lv.ops-on`), net als bij
  Oefenen: alleen de boot, de kaart en volledig scherm, en een klik op het model doet niets.
  Een rif is een nieuwe timeline vanaf de huidige stand naar het gekozen aantal slagen.
- Mast strijken (tweede helft van de timeline van het tuig): fok eraf; het opgedoekte zeil met giek en
  gaffel, één stijve bundel die op twee punten wordt gedragen, gaat van de vork van de mik in de
  onderste haak daarvan; lummelbout eruit (die hangt aan zijn borglijntje onder de giek) en het
  voorste eind van de bundel komt op de mastdoft; grendelbout eruit; borgring omhoog over de
  pelikaanhaak geschoven; haak uit de hanekam; mast naar achteren neer om de mastbout (74.6 graden) in
  de vork van de mik, de top voorbij de spiegel, met banden, blokken, harpjes, vallen, windvaan en
  kraanlijnblok; het voorstag vouwt zich langs de mast; de zijstagen worden live gelegd en hangen slap
  over de mik; de einden van de vallen blijven op de gaffel (hun delta's worden teruggerekend naar het
  eigen assenstelsel van de mast).
- Opgetopt in de kraanlijn: met de zeilen gestreken en opgedoekt zet een klik op de mik de bundel (giek,
  opgedoekt zeil, gaffel, zeilbinders) in vijf seconden 45 graden omhoog om de lummel - dezelfde
  tweepuntsoplossing als bij mast strijken, met het achterste punt omhooggedraaid - waarna de mik wordt
  opgeborgen; nog een klik en het gaat andersom. De klauw van de gaffel blijft om de mast (de gaffel
  schuift langs de bundel), de grootschoot viert mee en de kraanlijn staat strak. Alleen zo, of onder
  zeil met de kop in de wind, zwaait de giek zacht heen en weer; in de mik ligt hij stil. Onder zeil hangt
  de kraanlijn 30 cm door. De bakskist staat standaard dicht.
- De gaffeldraad is geen CAD-mesh meer maar een live draad in het assenstelsel van de gaffel: strak in
  een driehoek naar de hanepootloper zolang de piekenval de gaffel draagt, en pas als de gaffel op het
  opgedoekte zeil ligt een slappe bocht van dezelfde lengte over de bakboordkant van de bundel.
  Hanepootloper, het eind van de piekenval en het dodemanseind gaan met de bocht mee. De fok neemt bij
  "Fok afslaan" zijn kettinkje en de harpjes aan de hals mee; het harpje van de fokkenval komt met de
  top van de fok langs het voorstag omlaag, en de fokkenschoot zit met een knoop aan de schoothoek.
- Zeilen strijken, bediening "Handelingen" (Zeilen hijsen / strijken), dezelfde soort sequencer als
  reven: kop in de wind (giek, fok en windpijl midscheeps, geen buik); anker uit (het opgeborgen
  anker, de ketting en de lijn maken plaats voor een lijn die vanaf het ankeroog over de boeg in het
  water wordt gevierd); midzwaard op; fok langs zijn stag omlaag tot een bundel op het voordek (`jibBend.warp`); mik
  gezet; grootzeil in plooien omlaag terwijl de gaffel langs de mast zakt en vlak wordt gelegd (het bovenlijk blijft aan de gaffel: elk punt van het doek gaat mee met de gaffel, naar gelang hoe hoog het tussen onderlijk en bovenlijk zit), de nok
  van de giek 1.1 graden opgetild in de vork van de mik, kraanlijn strak (`mainBend.warp`); het doek
  opgedoekt tot een rol op de giek (onderdeel "Opgedoekt grootzeil"); drie zeilbinders (dubbel
  elastiek, twee ballen) om zeil, giek en gaffel. Hijsen laat het achterstevoren lopen; de balk noemt
  dan elke stap bij zijn omgekeerde naam (Zeilbinders af, Grootzeil hijsen, … Afvallen), en staat hij
  stil, dan de stap die als laatste gedaan is.
- Met de hand: slepen aan het helmhout stuurt (de roeronderdelen, vlaggenstok en vlag draaien om de
  schuine roerkoning; een tabel zet de peiling van de aanwijzer om in de hoek om die as; het slepen
  wordt in de capture-fase afgevangen zodat OrbitControls het nooit ziet). Een klik op een dol zet hem
  op of neemt hem eruit (niet zolang er een riem in getrokken wordt), een klik op de mik of zijn
  houders zet hem op of bergt hem op; een moduswisseling zet ze terug waar ze horen. Een klik op de
  bakskist sluit of opent het deksel, en wie een onderdeel ín de kist selecteert (meerpen, hoosblik,
  EHBO-koffer; ook via de lijst of de quiz) krijgt het deksel vanzelf open (in open stand gemodelleerd; het deksel en wat eraan vastgeschroefd
  zit draaien om de scharnierlijn uit `extras.tuig.bakskist`; deksel, beslag en handvatten zijn in de
  GLB eigen onderdelen en worden bij het laden in het onderdeel Bakskist gevouwen, `foldParts`). Een klik op het
  zwaard, de zwaardloper of zijn borgpen zet het midzwaard een stand verder: neer, half, op en weer neer.
  Een klik op een riem legt hem uit in zijn dol of terug op de doften, in elke modus; de dol komt
  vanzelf mee. Een klik op de wrikriem legt hem in het wrikgat of bergt hem weer op. Een klik op anker, ketting of lijn laat het anker vallen of haalt het op (om de lijn van
  6 mm zit een onzichtbare huls van 7 cm die de klik vangt): opgepakt aan zijn harpje, over het voordek gedragen, over de
  stuurboordboeg uitgezwaaid en langs een spline naar de bodem gevierd, 2,5 m onder de waterlijn en
  zo'n 1,5 m voor de boeg; onderweg draait het aan zijn lijn tot de schacht naar de boot wijst. Op de
  bodem kantelt het om zijn harpje: de schacht ligt plat, de vloeien wijzen schuin omlaag en graven
  zich in. De eerste helft van de ketting ligt daarachter plat op de bodem, de andere helft buigt in
  een boog omhoog naar de lijn. Zodra het anker ligt, verschijnt eronder een effen zandkleurige schijf bodem van
  2,6 m doorsnee, in dezelfde stijl als de schijf van het water; de vloeien graven zich erin en steken
  er van onderen gezien doorheen. Bij het ophalen verdwijnt hij weer. De ketting is één mesh waarvan de 54 schalmen als starre stukken langs
  zijn verloop worden geplaatst, de lijn wordt live over het dolboord naar het ankeroog gelegd. Zeilen strijken stuurt dezelfde animatie aan en wacht erop.
- Het onderlijk van het grootzeil volgt de giek, die op de lummelbout zwaait, terwijl het bovenlijk de
  gaffel volgt, die 52 mm verder naar voren om de mast draait; `Bend.shift` neemt het doek gelijkmatig
  over van de een naar de ander, zodat er bij geen enkele schootstand een gat tussen zeil en giek valt,
  gereefd of niet.
- Reven (rolrif), bediening "Reven" met het aantal slagen van de giek. Een kleine sequencer in
  `web/src/modes.js` doorloopt de stappen op volgorde, elk één waarde die naar zijn doel wordt
  gedreven, en plant opnieuw vanaf waar hij op dat moment is als de opdracht verandert: vallen vieren;
  de schootring naar achteren naar de nok schuiven; de giek 3 cm naar achteren trekken tegen de veer in
  het lummelbeslag in (er komt een as in de spleet tevoorschijn); de giek ronddraaien; hem terug laten
  veren; de grootschoot verzetten naar de bakboordbeugel van de schootring, die 37 graden om de giek
  draait; de ring naar voren schuiven; de vallen doorzetten. `Bend` doet het doek: het onderlijk legt
  eerst een kwartslag af van de bovenkant van de giek naar de zijkant, daarna wordt er doek opgewonden
  (de rol groeit 1.2 mm per slag), het zeil erboven zakt over die lengte omlaag met gaffel, klauw,
  vallen en rijglijn, en laat de rol naast de giek achter. De mesh van het doek is te grof om tot een
  spiraal op te winden, dus opgewonden doek wordt bij de rol samengetrokken en de rol is een eigen
  onderdeel ("Rif"). Het pettenlijntje wordt live gelegd tussen de stuurboordbeugel en de wervel, die
  geen van beide met de giek meedraaien, en hangt in een bocht als het slap staat.
- Dodemanseind (`pipeline/hardware.py`): twee slagen om de gaffel op 10 cm van de nok, daarna slap
  naar de hanepootloper, het punt op de gaffeldraad waar de piekenval is vastgezet; zwaait met de
  gaffel mee.
- Kraanlijn (niet in de CAD): van de wervel omhoog over de tweede schijf van het blok van de
  klauwval bij de hommerring (daarom een dubbel blok, in plaats van het enkele uit de CAD), en omlaag
  naar de bovenste bakboordkikker op de mastkoker, de enige vrije. Elk frame gelegd: hij hangt slap, zwaait met de giek
  mee en ligt tegen het doek aan als het zeil naar bakboord bolt.
- Vlaggenstok, knop en vlag (`web/src/flag.js`): een gebogen stok (recht in de buis, daarna naar
  achteren overbuigend, taps) die in de open bovenkant van de roerkoning staat, een 1"-buis, zodat hij
  met het roer mee 33.7 graden achteroverhelt; de knop is een schijf van 2 cm met een afgeronde rand in
  de bakskleur; de Nederlandse vlag waait onder zeil met de wind mee uit, hangt stil als er geen wind
  is, en het geheel wordt voor het wrikken uit de buis getrokken.
- Mik (`makeMik`): hij ligt op de vlonder aan bakboord in de kuip, ook bij roeien en wrikken; bij
  zeilen strijken (of met een klik) wordt hij overgezet en staat hij in de twee mikhouders op het
  achterschot, vork omhoog en haaks op de boot, met zijn voet op het vlak.
- Dollen: de boot heeft zes dolpotten (pipeline) maar vier dollen (`makeDol`, `makeKnevel` in
  `web/src/rig.js`), in de potten bij de twee doften. Een dol staat alleen in zijn pot, meedraaiend met
  de riem, zolang er een riem in getrokken wordt; anders is hij eruit gelicht en hangt hij binnenboord
  ondersteboven aan zijn kettinkje, dat door de pot loopt naar een knevel die niet door de boring kan
  (`layChain` legt de schalmen langs het pad over de rand).
- Vijf onderdelen die de CAD niet heeft, worden in de viewer gebouwd (`web/src/rig.js`) en als gewone
  aanklikbare onderdelen geregistreerd: de **zwaardbout**, de **borgpen**, het **kettinkje** daarvan,
  de **windvaan** en de omzetting van de **roerkop**.
- De twee blokken van de grootschoot hangen in de schoot: elk is gericht langs de lijn van de
  schootring naar het grootschootoog, zodat ze kantelen als de giek uitzwaait.
- Zeilteken en zeilnummer zijn eigen onderdelen (aanklikbaar, benoemd), dunne lappen die op het doek
  liggen met hun eigen getekende texture, gespiegeld aan stuurboord. Ze buigen en zwaaien met het zeil
  mee, net als de lijken en hoeken.
- Roeicommando's (bediening "Roeicommando", Katwijks roeiboek H2). Het paneel heeft drie groepen.
  Bovenaan **Beide boorden**: op slag, riemen over, riemen op en riemen geroeid — die worden aan de
  hele boot tegelijk gegeven en nooit aan één boord, dus ze staan er één keer en zetten bakboord én
  stuurboord. Daaronder **Bakboord** en **Stuurboord**, elk met wat een roerganger wél per boord
  roept: haalt op gelijk (losse slagen met een wachtmoment), op riemen, strijkt gelijk (dezelfde slag
  achterstevoren), stopt af en riemen lopen. Een keuze voor één boord laat het andere staan zoals het
  stond — bakboord "strijkt gelijk" terwijl stuurboord nog op slag ligt is precies hoe de boot wordt
  gedraaid. Een knop van "Beide boorden" is alleen ingedrukt als beide boorden dat commando hebben.
  Een commando is een houding (`ROEICOMMANDOS` in `web/src/modes.js`: kracht, hoe ver omlaag, hoe ver
  naar achteren gehaald, blad verticaal of vlak, hoe ver binnenboord, staand op de vlonder, in de dol
  of opgeborgen; `beide: true` markeert de commando's voor de hele boot) waar elke riem van dat boord
  soepel naartoe gaat. Het paneel toont de woorden die de roerganger voor de twee boorden samen zou
  roepen, met "op… riemen" eerst, tenzij beide tegelijk moeten worden opgevolgd, en sluit zich na een
  keuze zoals de andere bedieningen die de boot in beweging zetten. Verschillende commando's op de
  twee boorden geven de flauwe, scherpe en zeer scherpe bocht; een groene pijl op het water laat zien
  welke kant de boot op gaat (de boot zelf blijft liggen).
- Roeien: de zeilen vervagen en de slag (inpik - haal - uitpik - oprijden) loopt eenvoudigweg door, één
  per 3.2 s; drie opstellingen - 2 naast elkaar, 2 kruislings, 4 riemen (het tweede paar riemen wordt
  in de viewer toegevoegd); Wrikken: de wrikriem in het wrikgat, 1.4 m binnenboord onder 50 graden, met
  een achtvormige beweging. De CAD heeft geen dollen; elke riem ligt 50 mm boven de rand van zijn
  dolpot.

## Quiz (Oefenen)

Oefenen → **Onderdelen** is de quiz (`web/src/quiz.js`, de styling ervan in
één gemarkeerd blok onderaan `web/src/style.css`). Er wordt alleen gevraagd naar de genummerde namen
op de onderdelentekening van de klasse — `web/src/quizdata.js`, één entry per naam met de id's van de
onderdelen die het *zijn* (`delen`) en de onderdelen die bij een klik goed gerekend worden omdat ze
erbij horen (`ook`). Het model heeft veel meer onderdelen dan er geleerd hoeven te worden. Id's
worden bij het opstarten tegen `parts` opgezocht; een entry waarvan geen enkel onderdeel uit `delen` in het model zit valt af, en wat is
afgevallen wordt één keer met `console.info` gelogd.

Welke vragen een insluitende pagina stelt, bepaalt zij zelf: `quizEntries()` in `web/src/config.js`
haalt `quiz.weg` uit de standaardlijst en zet `quiz.erbij` erachteraan, en `namen.quiz` hernoemt een
vraag. `debug.quiztabellen` zet een link **Tabellen** in het startpaneel die laat zien wat daar
uiteindelijk uit kwam — handig om te zien of een `weg` of `erbij` terechtkwam waar hij hoorde.

Vier soorten oefening, en Gemengd, die per vraag één soort trekt uit wat de entry toelaat:

- **Aanwijzen** — de naam staat er en het onderdeel moet aangeklikt worden. De klik krijgt de gewone
  selectie-highlight en de kaart biedt Bevestigen / Annuleren aan, zonder ooit te noemen wat er
  geraakt is. Goed als de id van het aangeklikte onderdeel in `delen` of `ook` staat; bij een gebied
  (Boeg, Kleed) als de klik op een van de onderdelen landde waar het gebied op ligt *én* binnen het
  gebied zelf — `regionAt` in `web/src/regions.js` beantwoordt dat aan de hand van de driehoeken die
  de overlay bedekt. Fout: de kaart noemt wat er in plaats daarvan is aangeklikt, en de camera vliegt
  naar het echte onderdeel en licht het op.
- **Benoemen** — het onderdeel wordt opgelicht en aangevlogen, en er worden vier namen aangeboden. De
  drie foute worden op aannemelijkheid gekozen: dezelfde uitgang van het eerste woord (de families
  …lijk, …hoek en …val), een woord gemeen, dezelfde groep, en daarna willekeurig.
- **Typen** — hetzelfde, maar de naam moet getypt worden. De beoordeling is mild: ongevoelig voor
  hoofdletters, accenten en leestekens, een "de"/"het" ervoor valt weg, enkelvoud en meervoud zijn
  allebei goed, één typefout per zes letters wordt vergeven (twee omgewisselde buurletters tellen als
  één), de alternatieven die een naam draagt worden geaccepteerd ("halshoek" of "halsbroek"), en de kern van een naam zonder het "van de …" ook — maar alleen waar één entry
  daarop antwoordt: "tophoek" alleen vraagt om de hele naam, want beide zeilen hebben er een. De
  juiste schrijfwijze wordt achteraf altijd getoond. Het veld houdt elke toets voor zich, zodat er
  niets bij de camera terechtkomt.
- **Kies het onderdeel** — de kaart noemt een onderdeel en er lichten vier onderdelen tegelijk op,
  elk in een eigen kleur, met op de kaart een chip in die kleur met de letter A–D; met de muis boven
  een chip of met de focus erop gaat het bijbehorende onderdeel ademen. De concurrenten zijn de
  dichtstbijzijnde onderdelen, waarbij een onderdeel uit dezelfde groep half zo ver telt.

Het startpaneel is één lijst oefeningen, elk met een regel uitleg, met daaronder het aantal vragen
en het niveau als kleine schakelaars, één grote Start-knop en **Oefen je fouten**. Wat het laatst
gekozen is, onthoudt het paneel (`keuze` in de opgeslagen score).

Zolang een ronde loopt staat de viewer in quizmodus (`.lv.quiz-on`): er blijven alleen de boot, de
kaart en de knop voor volledig scherm over — alle panelen gaan dicht en alle andere knoppen, de
bedieningsbalk, de voortgangsbalk, de hovertooltip en de infotegel verdwijnen — en een klik op het
model gaat naar de quiz in plaats van naar de selectie en naar `modes.click`: er valt geen anker
midden in een vraag. De kaart staat onderaan, met bovenin een voortgangsbalk, de reeks vanaf twee
goed op rij en een kruisje om te stoppen. In een smalle viewer (telefoon) wordt het een paneel over
de volle breedte met grote knoppen; bij Typen springt het naar boven zolang het veld de focus heeft,
zodat het toetsenbord het niet bedekt. Wat de kaart van onderen afdekt, geeft de quiz door aan
`setCovered`: de camera krijgt een view-offset van de helft daarvan, zodat het onderdeel boven de
kaart in beeld staat; aanklikken en de ringen gebruiken dezelfde projectie. Alles is met het
toetsenbord te bedienen: 1–4 (en A–D) kiezen, Enter bevestigt en gaat door, Escape neemt een keuze
terug.

Vragen worden zonder herhaling getrokken tot de pool op is, met een weging naar wat er misgaat
(`(1 + fout × 2) / (1 + goed)`). Entries waarvan de onderdelen er in de modus waarin de boot staat
niet zijn vallen af, via dezelfde `partVisible` als de onderdelenlijst, en het startpaneel meldt het
als een groot deel van de pool weg is. Het paneel kiest eerst het **Diploma**: **Roeien** vraagt
de namen van de roeilijst van 40 (`roeien: true` in `quizdata.js`; welke dat zijn staat in
`reference/book/ROEIEN.md`), die geen niveaus kent — de roeiboeken eisen ze allemaal. **Zeilen**
heeft daaronder een **Niveau** (I / II / III): niveau L vraagt alles met `niveau <= L`, een entry
zonder niveau telt als III, en `zeilen: false` (de Riem) laat een roei-naam bij Zeilen weg. Zeilen
onthoudt zijn niveau als je even naar Roeien wisselt. De keuze werkt meteen: het aantal vragen op de
Start-knop loopt mee (voor de volgende ronde, niet halverwege een lopende). De ronde eindigt in een resultatenkaart met het percentage, de beste reeks
en de namen die fout gingen, met **Nog een ronde**, **Andere oefening** (terug naar het startpaneel)
en **Oefen je fouten**, die een ronde van niets dan de entries die deze
gebruiker het vaakst fout heeft.

De score per entry en de totalen aller tijden staan in `localStorage` onder de enkele sleutel
`lelievlet.quiz.v1` — `{ v: 1, totaal: { goed, fout, rondes, beste }, per: { <nr>: { goed, fout,
laatst } }, keuze: { kind, length, level } }`. Elke toegang is afgeschermd, zodat de quiz net zo goed
werkt zonder storage, en met `aanpassen.opslaan: false` wordt er niets gelezen of geschreven. Twee
viewers op één pagina tellen samen: elke wijziging wordt gelegd op wat er op dat moment bewaard staat.
"Wissen" onderaan het startpaneel wist de score (niet de keuze) na een inline
"Score wissen?".

`main.js` geeft de quiz wat hij nodig heeft via één aanroep `initQuiz({ … })` na `initModes` en
`initRegions`: `parts`, `scene`, `select`, `flyTo`, `setCovered`,
`setHighlights`, `partVisible`, de map met paneelsluiters, en het gereedschap van de insluiting
(`ui`, `wrap`, `config`, `signal`, `engaged`, `realTarget`, `onDestroy`). `setHighlights` is het enige dat de
highlighting er speciaal voor heeft gekregen: een kleur per onderdeel, die `refreshHighlight` boven
de selectie en de hover raadpleegt, zodat de quiz zelf nooit naar een materiaal schrijft. Andersom
vraagt het zoeklicht (zie boven) elk frame aan de quiz of er een ring getekend mag worden: bij
Aanwijzen en Kies het onderdeel mag dat pas als het antwoord binnen is.

## Controles of de geometrie klopt

`pipeline/check_attached.py [gap_mm]` somt elk stuk beslag op (body korter dan 1.5 m) dat van elke
andere body verder af staat dan die gap, dus in de lucht hangt, met de body die er het dichtst bij
ligt. `gap_mm` is het optionele eerste argument: de speling in millimeters waaronder twee bodies nog
als "vast aan elkaar" gelden (standaard 3.0). Hoger gezet meldt het script minder, lager gezet meer —
`check_attached.py 0.5` is streng genoeg om ook een beslag te vinden dat er net naast zit, terwijl de
standaard alleen het echt losse beslag overhoudt. Het werkt op oppervlakken, niet op
vertices, en duurt een halve minuut. Correcties gaan in `NUDGE` in `pipeline/parts.py`.

- Rompbeplating 5599 × 1836 mm (klasse: 5600 ± 50 × 1800).
- Plaatvolume ÷ oppervlak geeft 3.96 mm voor het vlak en 2.99 mm voor de dekken; het Vlettenboek
  schrijft 4 en 3 mm voor.
- Halve breedte op de kim 596 (Vlettenboek spantenlijst 594), berghout 918 (913), zwaardkast
  946 × 500 (950 × 497–503), mastvoet op 365 in beide, leiogen van de fokkenschoot op 282 / 742 / 1142 /
  1942 mm achter de mastkoker, binnen de tolerantiebanden van het Vlettenboek.

## Beeldmateriaal

`web/public/textures/zeilteken.png` is afgeleid van `reference/parts/scoutwiki_lelievlet_zeilteken.png`
(scoutwiki.scouts.nl); het embleem zelf is het klassenteken van Scouting Nederland.
