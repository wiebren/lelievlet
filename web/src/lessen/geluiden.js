import * as THREE from 'three';
import { makeZee } from './boot.js';
import { GELUIDEN, GELUID_GROEPEN } from '../bpr/geluiden.js';
import { makeHoorn, patroonSvg } from '../bpr/hoorn.js';
import { CONFIGS, makeShip } from '../bpr/schepen.js';
import { createLesKaart, keuze, kies, knoppen, ernst } from './kaart.js';

// Geluidsseinen: a lesson after Sint Maarten Kielboot III § 4.5 - the eight sound signals the CWO handboek
// Kielboot (2022, Gevorderd, 402: BPR 4.01, 4.02, 4.04 and bijlage 6 A) asks, each heard on the hoorn of Zoeken (bpr/hoorn.js) and drawn as its stoten. A small
// motorboat out ahead gives it, and does what it says: turns to stuurboord or bakboord, goes astern, keert. Zelf
// verkennen has every signal of the BPR, and leads on to Zoeken › Geluidsseinen.

const C = 2.8;
const sein = (id) => GELUIDEN.find((g) => g.id === id);
// what the CWO asks (bijlage 6 A, as the handboek lists it); `cwo` in bpr/geluiden.js follows an older, wider book
const CWO = new Set(['attentie', 'stuurboord-uit', 'bakboord-uit', 'achteruit', 'niet-manoeuvreren', 'noodsein', 'blijf-weg', 'brug-sluis']);
const KIJK = { hoogte: 12, breedte: 34, doel: [C + 14, 1.5, 0], richting: [-1, 0.55, 0.45] };
// what the boat out ahead does when it gives the signal
const DOET = {
  'stuurboord-uit': 'sb', 'bakboord-uit': 'bb', achteruit: 'achteruit', 'niet-manoeuvreren': 'drijft',
  'keren-sb': 'keren-sb', 'keren-bb': 'keren-bb', 'haven-sb': 'sb', 'haven-bb': 'bb',
};

const onderwerp = (id, titel, kort, standen, vraag, meer = []) => ({ id, titel, cwo: 'KB III', kort, standen, vraag, meer });

export const GELUIDSSEINEN = [
  onderwerp('stoten', 'Kort en lang', [
    'Met <b>geluidsseinen</b> laten schepen elkaar weten wat ze doen. Een sein is een rij <b>korte stoten</b> (ongeveer 1 seconde) en <b>lange stoten</b> (ongeveer 4 seconden), met steeds een korte pauze ertussen.',
    'Een groot schip geeft ze zo nodig om een aanvaring te voorkomen. Een <b>klein schip</b>, zoals de lelievlet, geeft zo nodig <b>attentie</b>, <b>ik kan niet manoeuvreren</b> en het <b>noodsein</b>; de seinen om uit te wijken of achteruit te slaan geeft het niet. Neem dus een hoorn mee.',
  ], [['attentie', 'Eén lang'], ['stuurboord-uit', 'Eén kort']], {
    tekst: 'Hoe lang duurt een lange stoot ongeveer?',
    opties: [['1 seconde', false], ['4 seconden', true], ['10 seconden', false]],
    uitleg: 'Een lange stoot duurt ongeveer 4 seconden, een korte ongeveer 1.',
  }),
  onderwerp('uitwijken', 'Uitwijken', [
    'Wil een schip laten weten welke kant het op gaat, dan geeft het één of meer korte stoten. <b>Eén kort</b>: ik ga stuurboord uit. <b>Twee kort</b>: ik ga bakboord uit. <b>Drie kort</b>: ik sla achteruit. <b>Vier kort</b>: ik kan niet manoeuvreren.',
    'Met <b>één lang</b> vraagt een schip om aandacht: <b>attentie</b>.',
  ], [['attentie', 'Attentie'], ['stuurboord-uit', '1 kort'], ['bakboord-uit', '2 kort'], ['achteruit', '3 kort'], ['niet-manoeuvreren', '4 kort']], {
    tekst: 'Het motorschip voor je geeft twee korte stoten. Welke kant gaat het op?',
    opties: [['Naar zijn stuurboord', false], ['Naar zijn bakboord', true], ['Het slaat achteruit', false]],
    uitleg: 'Twee kort: ik ga bakboord uit. Het schip draait naar zijn eigen bakboord, naar links gezien vanaf het schip zelf.',
    laat: 'bakboord-uit',
  }),
  onderwerp('nood', 'Nood en blijf weg', [
    'Het <b>noodsein</b> zijn steeds weer <b>lange stoten</b>: een schip is in nood en roept om hulp. Dat sein moet je kennen, en zelf kunnen geven.',
    '<b>Kort, lang</b>, steeds herhaald, is het <b>blijf-weg-sein</b>. Dat geeft alleen een schip met gevaarlijke stoffen dat een ongeluk heeft: vaar dan weg van het gevaar.',
  ], [['noodsein', 'Noodsein'], ['blijf-weg', 'Blijf weg']], {
    tekst: 'Je bent in nood en hebt een hoorn. Welk sein geef je?',
    opties: [['Steeds weer lange stoten', true], ['Eén korte stoot', false], ['Kort, lang, herhaald', false]],
    uitleg: 'Het noodsein: blijf lange stoten geven. Kort-lang herhaald is het blijf-weg-sein, voor schepen met gevaarlijke stoffen.',
    laat: 'noodsein',
  }),
  onderwerp('brug', 'Brug of sluis', [
    'Wil je dat een brug of sluis voor je wordt bediend, dan geef je <b>lang, kort, lang</b>.',
    'Heeft de brugwachter of sluiswachter laten merken dat hij het hoorde, dan herhaal je het niet. Je mag het ook gewoon roepen.',
  ], [['brug-sluis', 'Lang, kort, lang']], {
    tekst: 'Je wilt dat de brug opengaat. Welk sein geef je?',
    opties: [['Lang, kort, lang', true], ['Eén lang', false], ['Drie kort', false]],
    uitleg: 'Lang, kort, lang: verzoek om de brug of sluis te bedienen.',
    laat: 'brug-sluis',
  }),
  {
    id: 'verkennen', titel: 'Zelf verkennen', cwo: '',
    kort: [
      'Kies een sein en luister. Zeg eerst zelf wat het betekent, en kijk dan of je het goed had.',
      'Hier staan alle seinen van het BPR, ook die de CWO niet vraagt: voorbijlopen, keren, havens in en uit, mist. In Zoeken › Geluidsseinen vind je ze ook, met wat je moet doen.',
    ],
    meer: [], zoeken: ['geluiden', 'Geluidsseinen'],
    verken: GELUID_GROEPEN.map((g) => [g, GELUIDEN.filter((x) => x.groep === g).map((x) => [x.id, `${x.naam}${CWO.has(x.id) ? '' : ' (geen CWO)'}`])]),
  },
];

export function initGeluiden({ sleutel, wrap, scene, camera, modes, fly, setCoveredRight, opslaan, onOpen, naarZoeken }) {
  const lk = createLesKaart({ wrap, id: 'les-geluiden', sleutel, titel: 'Geluidsseinen', lessen: GELUIDSSEINEN, store: 'lelievlet.les.geluiden.v1', opslaan, fly, setCoveredRight, onOpen, naarZoeken });
  const waterline = scene.getObjectByName('lelievlet').userData.tuig?.waterlijn_m ?? 0.3;
  const hoorn = makeHoorn();
  const plaatje = document.createElement('div'); plaatje.className = 'les-sein'; lk.host.append(plaatje);
  // the boat that gives the signals: a small motorboat out ahead, coming her way
  const boot = makeShip(CONFIGS.find((c) => c.id === 'klein_motorschip_a'));
  const holder = new THREE.Group(); holder.visible = false; holder.add(boot); scene.add(holder);
  const water = (op) => { holder.visible = op; if (modes?.water) modes.water.visible = !op; };
  // where it starts: dead ahead, heading towards her - one kort then gives a pass bakboord langs bakboord
  const START = [C + 34, 0]; const KOP = Math.PI;
  let id = null; let doet = null; let vanaf = 0; let t = 0; let klinkt = false;
  // her water is clear and reaches 14 m (rig.js makeWater): the boat out ahead lies on an opaque sea instead
  const zee = makeZee(modes, 400); holder.add(zee);

  const zet = (key) => { id = key; doet = null; vanaf = 0; t = 0; hoorn.stop(); toon(); lk.renderControls(); };
  const toon = () => {
    const g = sein(id);
    plaatje.innerHTML = `<div class="les-sein-patroon">${patroonSvg(g.patroon, { h: 34, k: 18 })}</div><p><b>${g.naam}</b></p>`;
  };
  const speel = () => {
    const g = sein(id); if (!g) return;
    klinkt = true; lk.renderControls();
    hoorn.play(g.patroon, { herhaald: g.herhaald, klaar: () => { klinkt = false; lk.renderControls(); } });
    // the boat out ahead does it, as it sounds - from where it is now, not from the start again
    t = doet ? 0 : t % 11; vanaf = t + 1; doet = DOET[id] ?? null;
  };

  lk.koppel({
    begin(l) {
      water(true); t = 0; doet = null; vanaf = 0;
      zet(l.standen ? l.standen[0][0] : l.verken[0][1][0][0]);
      const rows = [];
      if (l.verken) rows.push(keuze('Sein', l.verken, () => id, zet));
      if (l.standen) rows.push(kies('Sein', l.standen, () => id, zet));
      rows.push(knoppen([['speel', 'Laat horen', true]], speel, () => !klinkt));
      return rows;
    },
    antwoord(laat) { if (lk.les.standen?.some(([k]) => k === laat)) { zet(laat); } },
    release() { hoorn.stop(); water(false); },
    aanzicht: () => KIJK,
  });

  // the boat out ahead: on its way to her, and doing what it signalled
  const pad = (s) => {
    let x = START[0]; let z = START[1]; let kop = KOP; const v = 2.2;
    const stap = 0.05;
    for (let u = 0; u < Math.min(s, vanaf + 13); u += stap) {
      const bezig = doet && u > vanaf;
      let draai = 0; let snel = v;
      const d = u - vanaf;                                                   // s since it gave the signal
      if (bezig && (doet === 'sb' || doet === 'bb')) draai = (doet === 'sb' ? 1 : -1) * (d < 3 ? 0.22 : 0);
      if (bezig && doet.startsWith('keren')) draai = (doet === 'keren-sb' ? 1 : -1) * (d < Math.PI / 0.45 ? 0.45 : 0);
      if (bezig && doet === 'achteruit') snel = Math.max(v - d * 1.6, -0.9);
      if (bezig && doet === 'drijft') { snel = Math.max(v - d * 1.2, 0); z += 0.25 * stap; draai = 0.05; }
      kop -= draai * stap;                                                 // + : to its stuurboord, which is a turn the other way about y
      x += Math.cos(kop) * snel * stap; z -= Math.sin(kop) * snel * stap;
    }
    return { x, z, kop };
  };

  function update(dt, width) {
    if (!lk.tick(width)) return;
    t += dt;
    // a loop: it comes on, does what it signals, and starts again
    const s = doet ? t : t % 11;
    const p = pad(s);
    boot.position.set(p.x, waterline, p.z); boot.rotation.y = p.kop;
    boot.userData.update?.(t, 0, camera);
    if (doet && t > vanaf + 13) { doet = null; vanaf = 0; t = 0; }
    const g = sein(id);
    // the signals of danger and of need in that colour
    const NIVEAU = { 'blijf-weg': 'rood', 'gevaar-aanvaring': 'rood', noodsein: 'rood', 'medische-hulp': 'oranje', 'niet-manoeuvreren': 'oranje' };
    lk.status(g ? `${g.naam}: ${g.betekenis}${lk.les.verken && g.lelievlet ? ` ${g.lelievlet}` : ''}` : '', NIVEAU[g?.id] ?? ernst(g?.betekenis));
  }

  return { update, open: lk.open, close: lk.close, onderwerpen: GELUIDSSEINEN,
           dispose: () => { lk.dispose(); hoorn.close?.(); holder.removeFromParent(); } };
}
