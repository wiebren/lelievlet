import * as THREE from 'three';
import { koersNaam, KOERSEN } from './lessen.js';
import { createPijlen } from '../krachten/pijlen.js';
import { createKaart } from './kaart.js';
import { createWal, AF } from './wal.js';
import { makeZeilen } from './zeilen.js';
import { createLesKaart } from '../lessen/kaart.js';
import { deckOutline } from '../lessen/boot.js';
import { voortgang } from '../lessen/voortgang.js';

// Leren › Quiz › Zeiltermen: the words of the lesson Zeiltermen (zeiltermen/lessen.js) asked on the boat itself.
// She sails on a course at random and a question asks what you see: which koers, over which side the wind comes in,
// whether a side marked ? is bakboord or stuurboord, loef or lij, whether a wal is the hogerwal or the lagerwal, or
// - she turns - whether she loeft op or valt af. Answered, the words go on the boat and in the map, and the line
// under it says why. Volgende gives another of the kind chosen in Leren › Quiz (or of any, gemengd). On the card
// of the lessons (lessen/kaart.js), with one onderwerp; the score is of this visit only.

const KLEUR = { wind: '#1b64c4', bakboord: '#c0262d', stuurboord: '#16833a', loef: '#1b64c4', lij: '#00808c', wal: '#55663f', nu: '#c96f00', draai: '#7a3fa0', vraag: '#7a3fa0' };
const C = [2.8, 0];
const MAST = [3.62, 0];
export const SOORTEN = { gemengd: 'Gemengd', koers: 'Koersen', boeg: 'Wind over', boorden: 'Bakboord en stuurboord', loeflij: 'Loef en lij', wal: 'Hogerwal en lagerwal', draai: 'Oploeven en afvallen' };
const KIES = (list) => list[Math.floor(Math.random() * list.length)];
const kant = (s) => (s > 0 ? 'stuurboord' : 'bakboord');

export const ZEILTERMEN_QUIZ = [{
  id: 'quiz', titel: 'Zeiltermen', cwo: '',
  kort: ['Kijk naar de boot en de tekening, en beantwoord de vraag. Daarna zie je de woorden op de boot. Met <b>Volgende</b> krijg je een nieuwe.'],
  meer: [
    { kop: 'Bakboord en stuurboord', tekst: 'Kijk je naar voren, van het achterdek naar het voordek, dan is bakboord links en stuurboord rechts.' },
    { kop: 'Loef en lij', tekst: 'Loef is de kant waar de wind vandaan komt, de hoge kant; lij de kant waar hij heen gaat, de lage kant.' },
    { kop: 'De koersen', tekst: 'In de wind, aan de wind, halve wind (de wind dwars), ruime wind (schuin van achteren) en voor de wind (recht van achteren).' },
    { kop: 'Oploeven en afvallen', tekst: 'Oploeven is naar de wind toe draaien, afvallen van de wind af.' },
  ],
}];

// one question of a kind: where she sails and what is asked
const VRAGEN = {
  koers: () => {
    const koers = KIES([0, 45, 55, 90, 100, 135, 145, 180]);
    return { koers, side: KIES([-1, 1]), aanzicht: 'achterboven', kaart: 'wind', tekst: 'Welke koers vaart de boot?',
      opties: KOERSEN.map(([, n]) => [n, n[0].toUpperCase() + n.slice(1)]), goed: koersNaam(koers), toon: ['koersnaam'],
      uitleg: (v) => (v.koers === 0 ? 'Recht tegen de wind in: de boot ligt in de wind en de zeilen klapperen.' : `De wind komt ${waar(v.koers)} binnen: dat is ${koersNaam(v.koers)}.`) };
  },
  boeg: () => {
    const side = KIES([-1, 1]);
    return { koers: KIES([45, 90, 120, 150]), side, aanzicht: 'achterboven', kaart: 'boot', tekst: 'Over welke kant komt de wind binnen?',
      opties: [['bakboord', 'Over bakboord'], ['stuurboord', 'Over stuurboord']], goed: kant(side), toon: ['boorden'],
      uitleg: (v) => `De wind komt over ${kant(v.side)} binnen: de giek en de zeilen staan aan de andere kant, aan ${kant(-v.side)}.` };
  },
  boorden: () => {
    const merk = KIES([-1, 1]); const kijk = KIES(['achter', 'voor']);
    return { koers: KIES([90, 120]), side: KIES([-1, 1]), merk, aanzicht: kijk, kaart: null, tekst: 'Welke kant van de boot is gemarkeerd met het vraagteken?',
      opties: [['bakboord', 'Bakboord'], ['stuurboord', 'Stuurboord']], goed: kant(merk), toon: ['boorden'],
      uitleg: (v) => `Dat is ${kant(v.merk)}. Kijk met de vaarrichting mee: bakboord links, stuurboord rechts${kijk === 'voor' ? ' - en je kijkt hier van voren, dus voor jou is het andersom' : ''}.` };
  },
  loeflij: () => {
    const side = KIES([-1, 1]); const merk = KIES([-1, 1]);
    return { koers: KIES([45, 90, 120, 150]), side, merk, aanzicht: 'achterboven', kaart: 'boot', tekst: 'Is de kant met het vraagteken loef of lij?',
      opties: [['loef', 'Loef'], ['lij', 'Lij']], goed: merk === side ? 'loef' : 'lij', toon: ['loeflij'],
      uitleg: (v) => `De wind komt over ${kant(v.side)} binnen, dus ${kant(v.side)} is loef, de hoge kant, en ${kant(-v.side)} lij.` };
  },
  wal: () => {
    const merk = KIES([1, -1]);
    return { koers: KIES([45, 90, 135]), side: KIES([-1, 1]), merk, aanzicht: 'hoog', kaart: 'wind', tekst: 'Is de wal met het vraagteken de hogerwal of de lagerwal?',
      opties: [['hogerwal', 'Hogerwal'], ['lagerwal', 'Lagerwal']], goed: merk > 0 ? 'hogerwal' : 'lagerwal', toon: ['wal'],
      uitleg: () => 'De hogerwal ligt aan de kant waar de wind vandaan komt; naar de lagerwal drijf je af. Die is gevaarlijk: je komt er makkelijk op vast.' };
  },
  draai: () => {
    const side = KIES([-1, 1]); const op = Math.random() < 0.5;
    const van = op ? KIES([90, 120, 135]) : KIES([45, 60, 90]);
    return { koers: van, naar: op ? van - 40 : van + 40, side, aanzicht: 'boven', kaart: 'wind', tekst: 'Kijk hoe de boot draait. Loeft ze op of valt ze af?',
      opties: [['op', 'Ze loeft op'], ['af', 'Ze valt af']], goed: op ? 'op' : 'af', toon: ['draai'],
      uitleg: () => (op ? 'Ze draait naar de wind toe: dat is oploeven. De zeilen moeten dan aangetrokken worden.' : 'Ze draait van de wind af: dat is afvallen. De zeilen moeten dan gevierd worden.') };
  },
};
// where the wind comes in, by its angle off the bow
const waar = (c) => (c < 25 ? 'recht van voren' : c < 70 ? 'schuin van voren' : c < 112 ? 'dwars' : c < 158 ? 'schuin van achteren' : 'recht van achteren');

export function initZeiltermenQuiz({ wrap, scene, camera, controls, parts, modes, fly, setCoveredRight, opslaan, onOpen }) {
  const lelievlet = scene.getObjectByName('lelievlet');
  let boat = lelievlet; while (boat.parent && boat.parent !== scene) boat = boat.parent;
  const waterline = lelievlet.userData.tuig?.waterlijn_m ?? 0.3;
  const deck = deckOutline(parts, scene);
  const zeilen = makeZeilen({ parts, boat });

  let soort = 'gemengd'; let v = null; let gekozen = null; let fase = 'klaar'; let tijd = 0;
  const score = { goed: 0, van: 0 };

  const lk = createLesKaart({ wrap, id: 'les-zeiltermen-quiz', sleutel: 'zeiltermen-quiz', titel: 'Quiz: Zeiltermen', lessen: ZEILTERMEN_QUIZ, store: 'lelievlet.quiz.zeiltermen.v1', opslaan, fly, setCoveredRight, onOpen,
    nogEen: { kan: () => Boolean(gekozen), doe: () => nieuw() } });
  const pijlen = createPijlen({ scene, camera, controls, layer: lk.layer });
  const kaart = createKaart(lk.host);
  const kaartEl = lk.host.querySelector('svg.zt-kaart');
  const wal = createWal(scene, { waterline, at: [C[0], 0, C[1]] });

  // direct: there at once (a new question: she does not swing round in sight first, modes.js apply)
  const zet = (koers, side, direct = false) => modes.apply({ koers: koers === 0 ? 0 : side * koers }, { direct });
  // her wind as she has it now, off the bow, + over stuurboord
  const windNu = () => Math.atan2(Math.sin(modes.dock.wind), Math.cos(modes.dock.wind));

  // a new question: she goes to its course first; one that turns waits till she is there, then turns
  function nieuw() {
    const k = soort === 'gemengd' ? KIES(Object.keys(VRAGEN)) : soort;
    v = VRAGEN[k](); v.soort = k; gekozen = null;
    if (modes.state.mode !== 'zeilen') modes.apply({ modus: 'zeilen' });
    if (modes.current().tuig !== 'op') modes.apply({ tuig: 'op' });
    modes.dock.schoon();
    zet(v.koers, v.side, true);
    fase = v.naar !== undefined ? 'naar' : 'klaar'; tijd = 0;
    lk.renderControls(); lk.verder(); lk.frame();
  }

  const vraag = () => {
    const el = document.createElement('div'); el.className = 'kr-vraag les-wie';
    el.innerHTML = '<h3></h3><p></p><div class="kr-opties"></div><p class="les-score"></p>';
    const lijst = el.querySelector('.kr-opties'); let van = null;
    el.sync = () => {
      if (!v) return;
      if (van !== v) {
        van = v;
        lijst.innerHTML = v.opties.map(([k, t]) => `<button type="button" data-k="${k}">${t}</button>`).join('');
        // the first answer counts, and stays: as the vragen of the lessons, no second try
        for (const b of lijst.children) b.addEventListener('click', () => {
          if (gekozen) return;
          score.van += 1; if (b.dataset.k === v.goed) score.goed += 1;
          gekozen = b.dataset.k; voortgang.quiz('zeiltermen', gekozen === v.goed);
          lk.renderControls(); lk.verder();
        });
      }
      el.querySelector('h3').textContent = `Vraag · ${SOORTEN[v.soort]}`;
      // on a phone the card lies over the boat: where the question has no map, say how to see it
      const smal = wrap.clientWidth <= 900;
      el.querySelector('p').textContent = `${v.tekst}${!v.kaart && smal ? ' Kijk op de boot: tik op Laat boot zien.' : ''}`;
      // a turn: only once it is under way can it be told; answered, none can be chosen any more
      for (const b of lijst.children) {
        b.disabled = Boolean(gekozen) || (v.soort === 'draai' && fase !== 'draait' && fase !== 'klaar');
        b.classList.toggle('goed', Boolean(gekozen) && b.dataset.k === v.goed);
        b.classList.toggle('fout', b.dataset.k === gekozen && gekozen !== v.goed);
      }
      el.querySelector('.les-score').textContent = score.van ? `${score.goed} van ${score.van} goed` : '';
    };
    return el;
  };

  lk.koppel({
    begin() { nieuw(); return [vraag()]; },
    release() { pijlen.visible = false; wal.visible = false; modes.kracht.heel = 0; v = null; },
    aanzicht: () => v?.aanzicht ?? 'achterboven',
  });

  function update(dt, width, height) {
    if (!lk.tick(width) || !v) return;
    if (modes.state.mode !== 'zeilen') { pijlen.visible = false; wal.visible = false; return; }
    const wind = windNu();
    const wx = Math.cos(wind); const wz = Math.sin(wind);
    const nu = Math.abs(THREE.MathUtils.radToDeg(wind)); const side = Math.sign(wind) || v.side;
    // a turn: to where it starts, a moment there, then the turn itself
    if (fase !== 'klaar') {
      tijd += dt;
      // there: her course and on her own boeg too (the other boeg would pass the same angle on the way round)
      if (fase === 'naar' && ((Math.abs(nu - v.koers) < 3 && (v.koers === 0 || side === v.side)) || tijd > 8)) { fase = 'wacht'; tijd = 0; }
      else if (fase === 'wacht' && tijd > 1.2) { fase = 'draait'; tijd = 0; zet(v.naar, v.side); lk.renderControls(); }
      else if (fase === 'draait' && Math.abs(nu - v.naar) < 3) { fase = 'klaar'; lk.renderControls(); }
    }
    const af = Boolean(gekozen);
    const toon = new Set(af ? v.toon : []);

    // ---- on the boat: the ? where it asks about, and once answered the words
    const items = [];
    const at = (x, y, z) => [x, y, z];
    if (v.merk && v.soort !== 'wal' && !af) items.push({ type: 'tekst', at: at(2.6, 1.15, v.merk * 1.85), label: '?', kleur: KLEUR.vraag, groot: true });
    if (toon.has('boorden')) {
      items.push({ type: 'tekst', at: at(2.6, 1.15, -1.85), label: 'bakboord', kleur: KLEUR.bakboord });
      items.push({ type: 'tekst', at: at(2.6, 1.15, 1.85), label: 'stuurboord', kleur: KLEUR.stuurboord });
    }
    if (toon.has('loeflij')) {
      items.push({ type: 'tekst', at: at(2.2, 0.9, side * 2.0), label: 'loef · hoge kant', kleur: KLEUR.loef });
      items.push({ type: 'tekst', at: at(2.2, 0.9, -side * 2.0), label: 'lij · lage kant', kleur: KLEUR.lij });
    }
    if (toon.has('koersnaam')) items.push({ type: 'tekst', at: at(7.6, 0.5, 0), label: koersNaam(nu), kleur: KLEUR.nu });
    wal.visible = v.soort === 'wal';
    if (wal.visible) {
      wal.set(wind);
      const P = (d) => at(C[0] + wx * d, 3.2, C[1] + wz * d);
      if (af) { items.push({ type: 'tekst', at: P(AF + 2), label: 'hogerwal', kleur: KLEUR.wal }); items.push({ type: 'tekst', at: P(-(AF + 2)), label: 'lagerwal', kleur: KLEUR.wal }); }
      else items.push({ type: 'tekst', at: P(v.merk * (AF + 2)), label: '?', kleur: KLEUR.vraag, groot: true });
    }
    const draaiZin = v.naar !== undefined ? (v.naar < v.koers ? -side : side) : 0;
    if (toon.has('draai')) items.push({ type: 'boog', center: at(C[0], 1.1, C[1]), as: 'y', r: 3.6, start: 0, sweep: draaiZin * 0.7, kleur: KLEUR.draai, label: v.goed === 'op' ? 'oploeven' : 'afvallen' });
    pijlen.visible = true; pijlen.draw(items); pijlen.update(width, height);

    // ---- on the map: the boat, its sails and the wind - not for bakboord en stuurboord, where it would tell
    if (lk.bladOpen && v.kaart) {
      const m = [];
      const add = (u) => [C[0] + u[0], C[1] + u[1]];
      if (v.soort === 'wal') {
        for (const sg of [1, -1]) {
          const rx = -wz; const rz = wx;
          const e = (d, a) => add([sg * wx * d + rx * a, sg * wz * d + rz * a]);
          m.push({ type: 'vlak', pts: [e(AF, -40), e(AF, 40), e(AF + 30, 40), e(AF + 30, -40)], fill: '#c5cdb0', stroke: '#93a391', fit: false });
          const label = af ? (sg > 0 ? 'hogerwal' : 'lagerwal') : sg === v.merk ? '?' : '';
          if (label) m.push({ type: 'tekst', at: e(AF + 2, 0), label, kleur: label === '?' ? KLEUR.vraag : KLEUR.wal, groot: label === '?' });
        }
      }
      m.push({ type: 'vlak', pts: deck, fill: '#f7f4ec', stroke: '#36454f' });
      for (const pts of zeilen(wind, side)) m.push({ type: 'lijn', pts, kleur: '#5f5a50', px: 2.4 });
      m.push({ type: 'punt', at: MAST, kleur: '#7a5a2e', r: 3.5 });
      if (v.merk && v.soort !== 'wal' && !af) m.push({ type: 'tekst', at: [2.8, v.merk * 1.7], label: '?', kleur: KLEUR.vraag, groot: true });
      if (toon.has('boorden')) { m.push({ type: 'tekst', at: [2.8, -1.7], label: 'bakboord', kleur: KLEUR.bakboord }); m.push({ type: 'tekst', at: [2.8, 1.7], label: 'stuurboord', kleur: KLEUR.stuurboord }); }
      if (toon.has('loeflij')) { m.push({ type: 'tekst', at: [2.0, side * 1.9], label: 'loef', kleur: KLEUR.loef }); m.push({ type: 'tekst', at: [2.0, -side * 1.9], label: 'lij', kleur: KLEUR.lij }); }
      if (toon.has('koersnaam')) m.push({ type: 'tekst', at: [7.8, 0], label: koersNaam(nu), kleur: KLEUR.nu });
      for (const k of [-2.5, 0, 2.5]) {
        const rx = -wz * k; const rz = wx * k;
        m.push({ type: 'pijl', from: add([wx * 7 + rx, wz * 7 + rz]), vec: [-wx * 2.4, -wz * 2.4], kleur: KLEUR.wind, dun: k !== 0 });
      }
      m.push({ type: 'tekst', at: add([wx * 7.8, wz * 7.8]), label: 'wind', kleur: KLEUR.wind });
      if (toon.has('draai')) {
        const pts = [];
        for (let i = 0; i <= 24; i++) { const t = (draaiZin * 0.7 * i) / 24; pts.push([C[0] + 3.6 * Math.cos(t), C[1] - 3.6 * Math.sin(t)]); }
        m.push({ type: 'boog', pts, kleur: KLEUR.draai, label: v.goed === 'op' ? 'oploeven' : 'afvallen' });
      }
      const ruim = v.soort === 'wal' ? 2 * AF + 8 : 11;
      kaart.draw({ frame: v.kaart, wind, centre: C, min: [ruim, ruim], items: m, titel: 'Van bovenaf' });
    }
    kaartEl.style.display = v.kaart ? '' : 'none';

    lk.status(af ? `${gekozen === v.goed ? 'Goed! ' : 'Niet helemaal. '}${v.uitleg({ ...v, koers: v.naar ?? v.koers })}` : '', af && gekozen !== v.goed ? 'geel' : '');
  }

  return {
    update, close: lk.close,
    /** Open it, on questions of that kind ('gemengd': all kinds); the score starts again for another kind. */
    open(k = soort) {
      if (!Object.hasOwn(SOORTEN, k)) k = soort;                        // one it does not know (from the address): as it is
      if (k !== soort) { score.goed = 0; score.van = 0; }                 // another kind: a score of its own
      soort = k; lk.open();
    },
    /** The kind it is on (for the address of the page). */
    get keuze() { return soort; },
    dispose: () => { lk.dispose(); pijlen.dispose(); kaart.dispose(); wal.dispose(); },
  };
}
