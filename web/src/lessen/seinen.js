import * as THREE from 'three';
import { SEINEN, seinPlaatje, makeSein, makeVerWater } from '../bpr/seinen.js';
import { makeSign, kadeSchaal } from '../bpr/tekens.js';
import { createLesKaart, segmented, keuze, kies, knoppen, ernst } from './kaart.js';
import { gevolg } from '../logboek.js';

// Bruggen and Sluizen: two lessons after Sint Maarten Kielboot II and III, hoofdstuk 3 (3.2 and 3.3 vaste en
// beweegbare bruggen, 3.4 sluizen). Each onderwerp shows a few states of one installation - a fixed bridge with
// its boards, a bridge that opens, a lock - as Zoeken › Seinen has them (bpr/seinen.js: the BPR's meaning of
// each, its picture and its model). The model stands out ahead of the boat, the picture is in the card, and
// what it means is the line under the controls. The boat lies still before it with her sails down; where it
// matters whether she fits under the bridge, the mast can be struck too.

const AHEAD = 18;                   // m from her middle to the bridge or lock, as Zoeken puts it (bpr/zoeken.js)
const C = 2.8;                      // her middle, x
const KIJK = { hoogte: 10, breedte: 24, doel: [C + AHEAD * 0.55, 2, 0], richting: [-1, 0.5, 0.4] };   // from astern and above, the bridge beyond her
// Vaar erdoor: she makes for the opening; with her mast up her rig meets the front of the span (the deck 2.4 m deep, its
// front 1.2 m short of where the model stands) and she stops, shakes and backs off; struck, she goes on under it
const VOOR = C + AHEAD - 1.2;       // x of the span's front
const MASTTOP = 3.62;               // x of her mast head, in her own frame (lelievlet.glb tuig.mast.top)
// what of a bridge she can meet, per kind (bpr/seinen.js makeSein): [m behind the span's front, its underside above the
// water] - a fixed deck at 3.6 m, a bascule's leaf at 2.3 m, and over a weir its gate drawn up under the deck too
const SPAN = { vast: [[0, 3.6]], stuwbrug: [[0, 3.6], [1.25, 2.5]], brug: [[0, 2.3]], sluisbrug: [[0, 2.3]] };
const DOOR = AHEAD + 7;             // how far she goes on, struck: under it and clear of it
const HEEN = 2.4; const TERUG = 1.6;   // m/s ahead, and backing off
// a state of its own for a question: the lock red while its doors stand open (boats still coming out)
const EIGEN = { 'sluis-rood-open': { ...SEINEN.find((x) => x.id === 'sluis-rood'), id: 'sluis-rood-open', open: true } };
const sein = (id) => SEINEN.find((x) => x.id === id) ?? EIGEN[id];
// Zelf verkennen: every state of these groups that Zoeken › Seinen has, CWO or not
const alles = (groepen) => groepen.map((g) => [g, SEINEN.filter((x) => x.groep === g).map((x) => [x.id, `${x.naam}${x.cwo === false ? ' (geen CWO)' : ''}`])]);
const verkennen = (groepen) => ({
  id: 'verkennen', titel: 'Zelf verkennen', cwo: '',
  kort: [
    'Kies wat je wilt zien, en zeg eerst zelf wat het betekent. Kijk dan of je het goed had.',
    'Hier staat ook wat de CWO niet vraagt. In Zoeken › Seinen vind je ze allemaal, met wat je moet doen.',
  ],
  meer: [], verken: alles(groepen), mast: true, zoeken: ['seinen', 'Seinen'],
});

export const BRUGGEN = [
  {
    id: 'vast', titel: 'Een vaste brug', cwo: 'KB III',
    kort: [
      'Een <b>vaste brug</b> kan niet open. Boven een opening kan een bord hangen dat zegt of je erdoor mag.',
      'Het <b>rood-wit-rode bord</b>: doorvaren verboden. <b>Eén gele ruit</b>: doorvaren mag, maar er kan iemand van de andere kant komen. <b>Twee gele ruiten</b>: doorvaren mag, en van de andere kant komt niemand.',
    ],
    meer: [
      { kop: 'Aan de andere kant', tekst: 'Een opening met twee gele ruiten is voor één richting. Aan de andere kant van die opening hangt daarom een bord dat doorvaren verbiedt.' },
      { kop: 'Een opening zonder bord', tekst: 'Hangt er geen bord boven een opening, dan mag je er op eigen risico door.' },
    ],
    standen: [['vast-a1', 'Rood-wit-rood'], ['vast-d1a', 'Eén ruit'], ['vast-d1b', 'Twee ruiten']],
    vraag: {
      tekst: 'Je kunt kiezen: een opening met één gele ruit, of een met twee. Welke neem je?',
      opties: [['Eén gele ruit', false], ['Twee gele ruiten', true], ['Maakt niet uit', false]],
      uitleg: 'Bij twee gele ruiten komt er niemand van de andere kant: dat is het veiligst.',
      laat: 'vast-d1b',
    },
  },
  {
    id: 'lichten', titel: 'Lichten in plaats van borden', cwo: 'KB III',
    kort: [
      'In plaats van een bord kan er ook een <b>licht</b> boven de opening hangen. Het betekent hetzelfde.',
      '<b>Rood</b> zegt hetzelfde als het rood-wit-rode bord, <b>één geel</b> licht hetzelfde als één gele ruit, en <b>twee gele</b> lichten hetzelfde als twee gele ruiten.',
    ],
    meer: [{ kop: '’s Nachts', tekst: 'De lichten zie je ook in het donker. Daarom hangen ze vaak naast of in plaats van de borden.' }],
    standen: [['vast-a1-licht', 'Rood'], ['vast-d1a-licht', 'Eén geel'], ['vast-d1b-licht', 'Twee geel']],
    vraag: {
      tekst: 'Boven een opening brandt één geel licht. Wat betekent dat?',
      opties: [['Doorvaren mag, er kan iemand van de andere kant komen', true], ['Doorvaren mag, alleen in jouw richting', false], ['Doorvaren is verboden', false]],
      uitleg: 'Eén geel licht is hetzelfde als één gele ruit: doorvaren mag, maar let op tegenliggers.',
      laat: 'vast-d1a-licht',
    },
  },
  {
    id: 'vaargebied', titel: 'Waar je vaart', cwo: 'KB III',
    kort: [
      'Ruiten aan weerszijden van een opening zeggen iets over waar je vaart. Tussen twee <b>groen-witte ruiten</b> vaar je het best: dat is <b>aanbevolen</b>, bijvoorbeeld omdat het ernaast ondiep is.',
      'Tussen twee <b>rood-witte ruiten</b> <b>moet</b> je blijven: daarbuiten is varen verboden.',
    ],
    meer: [{ kop: 'De halve ruiten', tekst: 'De groene helften wijzen naar de doorvaart. Bij de rood-witte ruiten wijzen de rode helften naar buiten, naar waar je niet mag komen.' }],
    standen: [['vast-d2', 'Groen-wit'], ['vast-a10', 'Rood-wit']],
    vraag: {
      tekst: 'Aan weerszijden van de opening hangt een rood-witte ruit. Mag je er net naast varen?',
      opties: [['Ja, het is maar een advies', false], ['Nee, je moet ertussen blijven', true]],
      uitleg: 'Rood-witte ruiten zijn een gebod: buiten de ruiten varen is verboden. Groen-witte ruiten zijn een advies.',
      laat: 'vast-a10',
    },
  },
  {
    id: 'hoogte', titel: 'De hoogteschaal', cwo: 'KB III',
    kort: [
      'Bij een brug kan een <b>hoogteschaal</b> staan. Daarop lees je af hoe hoog de brug boven het water is: kijk waar het water het bord raakt. De hoogte staat er in meters.',
      'Is je mast hoger dan de brug, dan moet je hem strijken, of wachten tot de brug open gaat.',
    ],
    meer: [{ kop: 'De lelievlet', tekst: 'Met de mast erop is een lelievlet zo’n zes meter hoog. Met de mast gestreken past ze onder de meeste bruggen door.' }],
    plaatje: 'G.5.1', model: 'vast-d1a',
    mast: true,
    vraag: {
      tekst: 'Waar lees je de hoogte op de hoogteschaal af?',
      opties: [['Bovenaan het bord', false], ['Waar het water het bord raakt', true], ['Bij het gele vlak', false]],
      uitleg: 'Het water komt hoger of lager tegen het bord: waar het water het raakt, lees je de hoogte van de brug af.',
    },
  },
  {
    id: 'open', titel: 'Beweegbare brug', cwo: 'KB III',
    kort: [
      'Een <b>beweegbare brug</b> heeft lichten. Ze zeggen wanneer je er door mag.',
      '<b>Rood</b>: stop, niet doorvaren. <b>Rood boven groen</b>: de brug gaat zo open, maar je mag er nog niet door. <b>Groen</b>: doorvaren. <b>Rood boven knipperend groen</b>: de brug gaat dicht, net als oranje bij een verkeerslicht.',
    ],
    meer: [
      { kop: 'Eerst de tegenliggers', tekst: 'Is de brug open en zie je toch een rood licht, dan mogen de schepen van de andere kant eerst. Daarna krijg jij groen.' },
      { kop: 'Wachten', tekst: 'Wacht vóór de brug, op een plek waar je de rest niet in de weg ligt.' },
    ],
    standen: [['brug-rood', 'Dicht'], ['brug-rood-groen', 'Gaat open'], ['brug-groen', 'Open'], ['brug-rood-groenflikker', 'Gaat dicht']],
    vraag: {
      tekst: 'Je ziet rood boven groen. Mag je al door de brug?',
      opties: [['Ja, er brandt groen', false], ['Nee, wacht tot alleen groen brandt', true]],
      uitleg: 'Rood boven groen zegt: de brug gaat zo open. Doorvaren mag pas als alleen het groene licht brandt.',
      laat: 'brug-rood-groen',
    },
  },
  {
    id: 'onder', titel: 'Onder de gesloten brug door', cwo: 'KB III',
    kort: [
      'Naast het rode licht kan ook <b>geel</b> branden. Dan mag je onder de gesloten brug door, als je eronder past.',
      '<b>Eén geel</b> licht: er kan iemand van de andere kant komen. <b>Twee gele</b> lichten: van de andere kant komt niemand.',
    ],
    meer: [{ kop: 'Pas je eronder?', tekst: 'Met de mast erop past een lelievlet niet onder een gesloten brug. Strijk de mast, of wacht tot de brug open gaat.' }],
    standen: [['brug-rood', 'Rood'], ['brug-rood-geel', 'Rood en geel'], ['brug-rood-2geel', 'Rood en twee geel']],
    mast: true,
    vraag: {
      tekst: 'Er brandt rood en één geel licht, en je mast staat. Mag je erdoor?',
      opties: [['Ja, er brandt geel', false], ['Nee, je past er met je mast niet onder', true]],
      uitleg: 'Het gele licht geldt alleen voor wie onder de gesloten brug past. Strijk eerst de mast, of wacht tot de brug open gaat.',
      laat: 'brug-rood-geel',
    },
  },
  {
    id: 'buiten', titel: 'Buiten bediening', cwo: 'KB III',
    kort: [
      '<b>Twee rode</b> lichten boven elkaar: de brug is <b>buiten bediening</b>. Hij gaat niet open, bijvoorbeeld omdat er geen brugwachter is. Doorvaren is verboden.',
      'Brandt er ook <b>geel</b>, dan mag je er wel onder door als je eronder past, net als bij één rood licht met geel.',
    ],
    meer: [{ kop: 'Twee groen', tekst: 'Twee groene lichten boven elkaar: de brug staat open en wordt niet bediend. Je mag erdoor, maar let op schepen van de andere kant.' }],
    standen: [['brug-2rood', 'Twee rood'], ['brug-2rood-geel', 'Met geel'], ['brug-2rood-2geel', 'Met twee geel'], ['brug-2groen', 'Twee groen']],
    mast: true,
    vraag: {
      tekst: 'Er branden twee rode lichten boven elkaar. Hoe lang moet je wachten tot de brug open gaat?',
      opties: [['Tot er groen bij komt', false], ['De brug gaat niet open: hij wordt niet bediend', true]],
      uitleg: 'Twee rood betekent buiten bediening. Wachten heeft geen zin: zoek een andere weg, of strijk je mast als er geel brandt.',
      laat: 'brug-2rood',
    },
  },
  verkennen(['Vaste brug', 'Beweegbare brug in bedrijf', 'Beweegbare brug buiten bedrijf']),
];

export const SLUIZEN = [
  {
    id: 'invaren', titel: 'Een sluis invaren', cwo: 'KB III',
    kort: [
      'Een <b>sluis</b> brengt een boot van het ene water naar het andere, als die niet even hoog liggen. Of je de sluis in mag, zeggen de lichten: bijna net als bij een brug.',
      '<b>Rood</b>: niet invaren, ook niet als de deuren open staan. Er kunnen nog boten uit moeten komen. <b>Rood boven groen</b>: zo meteen mag je. <b>Groen</b>: invaren.',
    ],
    meer: [
      { kop: 'In de sluis', tekst: 'In de sluis hangen vaak ook lichten: die zeggen wanneer je eruit mag. Is er een sluiswachter, luister dan goed: hij zegt vaak waar je moet gaan liggen.' },
    ],
    standen: [['sluis-rood', 'Rood'], ['sluis-rood-groen', 'Rood en groen'], ['sluis-groen', 'Groen']],
    vraag: {
      tekst: 'De deuren van de sluis staan open, maar het licht is rood. Wat doe je?',
      opties: [['Invaren: de deuren zijn open', false], ['Wachten tot het groen wordt', true]],
      uitleg: 'Rood is rood, ook met open deuren: de boten in de sluis moeten er eerst uit.',
      laat: 'sluis-rood-open',
    },
  },
  {
    id: 'buiten', titel: 'Buiten bedrijf', cwo: 'KB III',
    kort: [
      'Een sluis kan, net als een brug, <b>buiten bedrijf</b> zijn. <b>Twee rode</b> lichten: de sluis wordt niet bediend en de deuren zijn dicht.',
      '<b>Twee groene</b> lichten: de sluis wordt niet bediend, maar beide deuren staan open. Je mag erdoor.',
    ],
    meer: [{ kop: 'Let op tegenliggers', tekst: 'Staat de sluis aan beide kanten open, dan is hij een smalle doorgang. Er kan iemand van de andere kant komen.' }],
    standen: [['sluis-2rood', 'Twee rood'], ['sluis-2groen', 'Twee groen']],
    vraag: {
      tekst: 'Bij de sluis branden twee groene lichten boven elkaar. Mag je erdoor?',
      opties: [['Ja, de sluis staat open', true], ['Nee, wachten op de sluiswachter', false]],
      uitleg: 'Twee groen: de sluis wordt niet bediend en staat aan beide kanten open. Je mag erdoor; let op tegenliggers.',
      laat: 'sluis-2groen',
    },
  },
  {
    id: 'spuien', titel: 'Spuien en inlaten', cwo: 'KB III',
    kort: [
      'Soms laat een sluis water weg (<b>spuien</b>) of binnen (<b>inlaten</b>). Dan kan het water er hard stromen. Dat geven sommige sluizen aan met lichten of een vlag.',
      '<b>Drie rode lichten, punt omhoog</b>: er wordt gespuid. <b>Punt omlaag</b>: er wordt ingelaten. <b>Naast elkaar</b>: dat gaat zo meteen gebeuren.',
    ],
    meer: [{ kop: 'Niet overal', tekst: 'Deze tekens zijn er niet bij elke sluis. Ook zonder tekens kan er gespuid worden: houd afstand van een sluis en let op stroming.' }],
    standen: [['spui-spuien', 'Spuien'], ['spui-inlaten', 'Inlaten'], ['spui-straks', 'Zo meteen']],
    vraag: {
      tekst: 'Drie rode lichten in een driehoek, de punt omhoog. Wat gebeurt er?',
      opties: [['Er wordt gespuid', true], ['Er wordt ingelaten', false], ['De sluis is buiten bedrijf', false]],
      uitleg: 'Punt omhoog is spuien, punt omlaag inlaten. Reken op stroming bij de sluis.',
      laat: 'spui-spuien',
    },
  },
  {
    id: 'brugsluis', titel: 'Een brug bij een sluis', cwo: 'KB III',
    kort: [
      'Soms ligt een brug vlak naast een sluis. Let dan goed op de lichten: ze zeggen iets over de sluis én de brug.',
      'Het kan zijn dat je lang voor de open brug moet wachten, omdat de sluis eerst leeg moet varen. Wacht dan vóór de brug, ook als je eronder past.',
    ],
    standen: [['sluisbrug-rood-groen', 'Rood en groen'], ['sluisbrug-groen-2geel', 'Groen en twee geel'], ['sluisbrug-groen-open', 'Groen, brug open']],
    vraag: {
      tekst: 'Je past onder de brug, maar de sluis erachter is nog niet leeg. Wat doe je?',
      opties: [['Alvast onder de brug door varen', false], ['Vóór de brug wachten', true]],
      uitleg: 'De sluis moet eerst leeg varen. Wacht vóór de brug, dan lig je niemand in de weg.',
      laat: 'sluisbrug-rood-groen',
    },
  },
  verkennen(['Sluis in bedrijf', 'Sluis buiten bedrijf', 'Sluis met beweegbare brug', 'Spuien en inlaten', 'Stuw']),
];

/**
 * One of the two lessons: titel and id of its card, its onderwerpen (BRUGGEN or SLUIZEN), and the viewer's
 * scene, boat (modes.js) and camera (fly) as the other lessons have them.
 */
export function initSeinLes({ id, sleutel, titel, lessen, store, wrap, scene, modes, fly, setCoveredRight, opslaan, onOpen, dismissProcedure, naarZoeken }) {
  const lk = createLesKaart({ wrap, id, sleutel, titel, lessen, store, opslaan, fly, setCoveredRight, onOpen, naarZoeken });
  const waterline = scene.getObjectByName('lelievlet').userData.tuig?.waterlijn_m ?? 0.3;
  // the foremost of her rig at a height (her own frame): the voorstag, from its top down to its hals, forward of the
  // mast; above the stag, the mast head
  const stag = scene.getObjectByName('lelievlet').userData.tuig?.voorstag ?? { top: [3.84, 5.09, 0], hals: [5.4, 1.25, 0] };
  const voorste = (y) => (y >= stag.top[1] ? MASTTOP
    : stag.top[0] + ((stag.top[1] - y) / (stag.top[1] - stag.hals[1])) * (stag.hals[0] - stag.top[0]));
  // how far she goes before her rig, mast up, meets the bridge (Infinity: nothing it can meet)
  const raak = (bouw) => Math.min(Infinity, ...(SPAN[bouw] ?? []).map(([achter, onder]) => VOOR + achter - 0.04 - voorste(waterline + onder)));
  const built = new Map(); let model = null;
  let stand = null; let mastWeg = false; let tuigWas = null; let t = 0;
  // Vaar erdoor, under way: { fase: 'heen' | 'stoot' | 'onder' | 'terug', x, t }; what came of it stays on the card
  // (`gebeurd`) till something else is chosen
  let vaart = null; let gebeurd = null;
  const stil = () => { vaart = null; modes.kracht.plek = null; modes.kracht.deining = null; verWater?.position.setX(C); };
  const plaatje = document.createElement('div'); plaatje.className = 'les-plaatje'; lk.host.append(plaatje);
  // De hoogteschaal: G.5.1 on the front of the kade just before the bridge, on her stuurboord side, from the top of the
  // wall (1 m out of the water) down into it; the figure at the water is this bridge's height (3.6 m)
  const schaal = makeSign('G.5.1', { hoogte: 3.6, kade: 1 }); schaal.position.set(4.6, 0, 3.02);   // the kade's front: x 3.5 .. 13, z 3
  // the water out to the bridge: its kade, and the hoogteschaal on it, stand in the water
  const verWater = modes.water ? makeVerWater(modes.water) : null;

  // Spuien en inlaten: the stream on the water, streaks running out from the sluice and fanning wide (spuien), or
  // drawn in to it (inlaten) - in the model's own frame, the boat's side towards +z; and from above beside the sein
  const STREPEN = 80; const LANG = 15;                                  // streaks, and how far out from the sluice
  const strepen = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.09, 1.3).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7, depthWrite: false }), STREPEN);
  strepen.renderOrder = 2; strepen.frustumCulled = false;
  const streep = Array.from({ length: STREPEN }, () => ({ x: (Math.random() * 2 - 1) * 3.1, fase: Math.random() }));
  const stuk = new THREE.Object3D();
  const stroom = () => ({ 'spui-spuien': 1, 'spui-inlaten': -1 }[stand] ?? 0);   // +1 out from it, -1 in to it
  const schets = document.createElement('div'); schets.className = 'les-plaatje'; lk.host.append(schets);
  const stromingSvg = (zin) => {
    const pijl = (x) => {
      const [y0, y1] = zin > 0 ? [44, 150] : [150, 44];
      const x1 = zin > 0 ? 120 + (x - 120) * 1.6 : x; const x0 = zin > 0 ? x : 120 + (x - 120) * 1.6;
      return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" stroke="#1b64c4" stroke-width="3" stroke-dasharray="10 8" marker-end="url(#stroom-punt)">`
        + `<animate attributeName="stroke-dashoffset" from="36" to="0" dur="${zin > 0 ? 0.7 : 1.1}s" repeatCount="indefinite"/></line>`;
    };
    return `<svg viewBox="0 0 240 210" role="img" aria-label="De stroming van bovenaf">
      <defs><marker id="stroom-punt" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0 L10,5 L0,10 Z" fill="#1b64c4"/></marker></defs>
      <rect width="240" height="210" fill="#dbe8f2"/>
      <rect x="0" y="0" width="62" height="210" fill="#9a9d9f"/><rect x="178" y="0" width="62" height="210" fill="#9a9d9f"/>
      <rect x="62" y="22" width="116" height="16" fill="#7b7f82"/>
      <text x="120" y="17" font-size="15" font-weight="600" text-anchor="middle" fill="#36454f">${zin > 0 ? 'spuisluis' : 'inlaat'}</text>
      ${[86, 120, 154].map(pijl).join('')}
      <path d="M120,166 C126,174 126,190 124,198 L116,198 C114,190 114,174 120,166 Z" fill="#f7f4ec" stroke="#36454f"/>
      <text x="134" y="192" font-size="16" font-weight="600" fill="#c96f00">jij</text>
      <text x="6" y="204" font-size="13" fill="#36454f">Van bovenaf</text></svg>`;
  };

  const zet = (key) => {
    stand = key; stil(); gebeurd = null;
    const l = lk.les;
    const s = sein(l.model ?? key);
    if (model) model.removeFromParent();
    if (!built.has(s.id)) built.set(s.id, makeSein(s));
    model = built.get(s.id);
    model.position.set(C + AHEAD, waterline, 0); model.rotation.y = -Math.PI / 2;
    scene.add(model);
    if (verWater && !verWater.parent) (modes.water.parent ?? scene).add(verWater);
    if (l.plaatje === 'G.5.1') model.add(schaal); else schaal.removeFromParent();
    if (stroom()) { model.add(strepen); schets.innerHTML = stromingSvg(stroom()); } else { strepen.removeFromParent(); schets.replaceChildren(); }
    // the hoogteschaal as it is on the kade here, the water at its height; else the picture of the state
    plaatje.innerHTML = l.plaatje ? kadeSchaal(3.6, 1).svg : seinPlaatje(s);
    lk.renderControls();
  };
  // the sails down, so she lies still before it; the mast struck or up again, at once (and no bar of the
  // procedure that took: main.js dismissProcedure)
  const tuig = (rig) => { if (modes.current().tuig !== rig) { modes.apply({ tuig: rig }, { direct: true }); dismissProcedure?.(); } };

  // a bridge where fitting under it decides: a fixed one, or one shut with yellow lights that let through what fits
  // under it (shut and red without them, or open, it is not her mast that keeps her back or lets her through)
  const pas = () => {
    const l = lk.les; const s = sein(l.model ?? stand);
    const brug = ['brug', 'vast', 'sluisbrug', 'stuwbrug'].includes(s?.bouw)
      && (s.bouw === 'vast' || Boolean(s.geel) || /onder de gesloten brug|laag genoeg/.test(s.betekenis ?? ''));
    // her mast struck, the verbod is not for her when it lets through what fits under: what is left of it counts
    const zonder = (s?.betekenis ?? '').replace(/[^.]*verboden, behalve voor schepen die onder de gesloten brug door passen\./, '')
      .replace(/als je schip laag genoeg is/g, '');                       // and she is low enough
    const voorHaar = mastWeg && brug ? zonder : s?.betekenis;
    // struck, she fits under it - but where nobody may go through, that does not let her (verboden: mast up or not)
    const verboden = brug && ernst(zonder) === 'rood';
    return { s, brug, voorHaar, verboden, dicht: mastWeg && verboden };
  };
  const vaarErdoor = () => { gebeurd = null; vaart = { fase: 'heen', x: 0, t: 0, raak: raak(pas().s?.bouw) }; lk.renderControls(); };

  lk.koppel({
    begin(l) {
      if (tuigWas === null) tuigWas = modes.current().tuig;
      if (modes.state.mode !== 'zeilen') modes.apply({ modus: 'zeilen' });
      if (!l.mast) mastWeg = false;
      tuig(mastWeg ? 'mast' : 'gestreken');
      zet(l.standen ? l.standen[0][0] : l.verken ? l.verken[0][1][0][0] : l.model);
      const rows = [];
      if (l.verken) rows.push(keuze('Wat je ziet', l.verken, () => stand, zet));
      if (l.standen) rows.push(kies(l.standen.length > 3 ? 'Stand' : 'Wat je ziet', l.standen, () => stand, zet));
      if (l.mast) rows.push(segmented('Mast', [[false, 'Staat'], [true, 'Gestreken']], () => mastWeg, (v) => { mastWeg = v; tuig(v ? 'mast' : 'gestreken'); stil(); gebeurd = null; lk.renderControls(); }));   // a vaart stops
      // where she may go under it if she fits: try it - with her mast up too
      if (l.mast) rows.push(knoppen([['vaar', 'Vaar erdoor']], vaarErdoor, () => !vaart && pas().brug && !pas().verboden));
      return rows;
    },
    antwoord(laat) { if (lk.les.standen?.some(([k]) => k === laat)) zet(laat); },
    release() {
      stil(); gebeurd = null;
      if (model) model.removeFromParent();
      verWater?.removeFromParent();
      if (tuigWas) tuig(tuigWas);
      tuigWas = null; mastWeg = false;
    },
    aanzicht: () => KIJK,
  });

  // Vaar erdoor, a frame of it: ahead to the bridge; her mast up, it meets the span - a jolt, she shakes and backs
  // off to where she lay; struck, she goes on under it and comes back astern
  function varen(dt) {
    vaart.t += dt;
    const v = vaart;
    if (v.fase === 'heen') {
      v.x += HEEN * Math.min(1, v.t / 1.5) * dt;                         // she gathers way
      if (!mastWeg && v.x >= v.raak) {
        v.x = v.raak; v.fase = 'stoot'; v.t = 0;
        // waiting for it to open is no use where it never does: a fixed one, or one that is not being worked
        const { s } = pas(); const vaste = ['vast', 'stuwbrug'].includes(s?.bouw) || /niet bediend/.test(s?.betekenis ?? '');
        gebeurd = { niveau: 'rood', tekst: `Boem! Je mast raakte de brug${lk.les.plaatje ? ': op de hoogteschaal staat 3,6 m, en je mast is zo’n 6 m hoog' : ''}. `
          + (vaste ? 'Lees de hoogteschaal, en strijk je mast als je er niet onder past.' : 'Lees de hoogteschaal, strijk je mast, of wacht tot de brug opengaat.') };
        gevolg('brug');
      } else if (mastWeg && v.x >= DOOR) { v.x = DOOR; v.fase = 'onder'; v.t = 0;
        gebeurd = { niveau: '', tekst: 'Met je mast gestreken pas je eronder: je vaart er gewoon onderdoor.' }; }
    } else if (v.fase === 'stoot') {
      // the jolt runs back through her: the mast head thrown aft (pitch), a roll after it, dying away
      const k = Math.exp(-v.t / 0.7);
      modes.kracht.deining = { op: 0, stamp: 0.07 * k * Math.sin(v.t * 9), rol: 0.03 * k * Math.sin(v.t * 6 + 1) };
      v.x -= 0.25 * k * dt;                                             // knocked back a little
      if (v.t > 2.2) { modes.kracht.deining = null; v.fase = 'terug'; v.t = 0; }
    } else if (v.fase === 'onder') {
      if (v.t > 1.5) { v.fase = 'terug'; v.t = 0; }
    } else {
      v.x -= TERUG * Math.min(1, v.t / 1.2) * dt;
      if (v.x <= 0) { stil(); lk.renderControls(); return; }
    }
    modes.kracht.plek = { x: v.x, z: 0, kop: 0 };
    // the water round her goes along with her (modes.js): the rest with it, where hers is this frame
    if (verWater) verWater.position.x = modes.water.position.x + C;
  }

  function update(dt, width) {
    if (!lk.tick(width)) return;
    t += dt;
    model?.userData.update?.(t, 0);
    const zin = stroom();
    if (zin) {
      // each streak along its line out from the sluice, faster out (spuien) than in, long in the middle of its run
      for (const [i, s] of streep.entries()) {
        const u = (s.fase + (t * (zin > 0 ? 2.6 : 1.6)) / LANG) % 1; const z = 0.8 + (zin > 0 ? u : 1 - u) * LANG;
        const wijd = 1 + z / 12;                                         // it fans out away from the sluice
        stuk.position.set(s.x * wijd, 0.04, z); stuk.rotation.set(0, Math.atan(s.x / 12), 0);
        stuk.scale.set(1, 1, Math.max(Math.sin(Math.PI * u), 0.05)); stuk.updateMatrix();
        strepen.setMatrixAt(i, stuk.matrix);
      }
      strepen.instanceMatrix.needsUpdate = true;
    }
    if (vaart) varen(dt);
    const l = lk.les;
    const { s, brug, voorHaar, dicht } = pas();
    let status = l.plaatje ? 'Hoogteschaal: lees de hoogte af waar het water het bord raakt. Bij deze brug is dat 3,6 m.' : `${s?.betekenis ?? ''}${l.verken && s?.lelievlet ? ` ${s.lelievlet}` : ''}`;
    const vast = l.mast && brug && !mastWeg;                               // with her mast up she does not fit under it
    if (gebeurd) { lk.status(gebeurd.tekst, gebeurd.niveau); return; }
    if (l.mast && brug) {
      const onder = s.bouw === 'vast' ? 'de brug' : 'de gesloten brug';   // a vaste brug is never shut, it is there
      status += !mastWeg ? ` Met je mast erop pas je niet onder ${onder}.`
        : dicht ? ' Je mast is gestreken en je past eronder, maar hier mag je niet door.' : ` Je mast is gestreken: je past onder ${onder}.`;
    }
    lk.status(status.trim(), vast ? 'rood' : l.plaatje ? '' : ernst(voorHaar));
  }

  return { update, open: lk.open, close: lk.close, onderwerpen: lessen, dispose: () => { lk.dispose(); verWater?.removeFromParent(); for (const m of built.values()) m.removeFromParent(); } };
}
