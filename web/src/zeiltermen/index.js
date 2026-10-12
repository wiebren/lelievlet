import * as THREE from 'three';
import { LESSEN, koersNaam } from './lessen.js';
import { createPijlen } from '../krachten/pijlen.js';
import { createKaart } from './kaart.js';
import { createWal, AF } from './wal.js';
import { createLesKaart } from '../lessen/kaart.js';
import { deckOutline } from '../lessen/boot.js';
import { makeZeilen } from './zeilen.js';

// Zeiltermen: a card of short lessons on the words of Sint Maarten Kielboot I § 1.2 - bakboord en
// stuurboord, loef en lij, hogerwal en lagerwal, de koersen, oploeven en afvallen, overstag, opkruisen
// en gijpen - drawn as words and arrows on the 3D boat and as a map in the card, while the boat sails,
// turns and goes about as they say: overstag, opkruisen and gijpen are the manoeuvres of the viewer
// itself. Opened from Leren › Lessen (main.js), or at once with `?zeiltermen` in the address. The card
// is the one of every lesson (lessen/kaart.js), and the words go on the boat as Krachten en koppels puts
// them there (krachten/pijlen.js).

const KLEUR = {
  wind: '#1b64c4', bakboord: '#c0262d', stuurboord: '#16833a', loef: '#1b64c4', lij: '#00808c',
  vaart: '#36454f', wal: '#55663f', koers: '#5f5a50', nu: '#c96f00', draai: '#7a3fa0', spoor: '#d0202a', drift: '#a14a00',
};
const STORE = 'lelievlet.zeiltermen.v1';
const C = [2.8, 0];                 // her middle, [x, z]: what she turns about, and the middle of the map
const MAST = [3.62, 0];
const NA = 5000;                    // ms a manoeuvre's track stays once it is done
const STAP = 15;                    // degrees a click on Oploeven or Afvallen turns her
const MAN = { overstag: 45, opkruisen: 45, gijpen: 180 };   // the course each manoeuvre starts from
const KNOP = { overstag: 'Ga overstag', opkruisen: 'Kruis op', gijpen: 'Gijp' };
// what Zelf verkennen can switch on: chip -> what it draws
const LAGEN = [['Bakboord en stuurboord', ['boorden', 'vaarrichting']], ['Loef en lij', ['loeflij']], ['Wallen', ['wal']], ['Koersen', ['koersen', 'koersnaam']]];

export function initZeiltermen({ wrap, scene, camera, controls, parts, modes, fly, setCoveredRight, opslaan, onOpen, sleutel, naarQuiz }) {
  const lelievlet = scene.getObjectByName('lelievlet');
  let boat = lelievlet; while (boat.parent && boat.parent !== scene) boat = boat.parent;
  const waterline = lelievlet.userData.tuig?.waterlijn_m ?? 0.3;

  const deck = deckOutline(parts, scene);           // the map's boat

  const zeilen = makeZeilen({ parts, boat });       // the sails from above, for the map

  // ------------------------------------------------------------------ the card

  const lk = createLesKaart({ wrap, id: 'zeiltermen', sleutel, titel: 'Zeiltermen', lessen: LESSEN, store: STORE, opslaan, fly, setCoveredRight, onOpen, naarQuiz });
  const { layer, q } = lk;
  const les = () => lk.les;

  const pijlen = createPijlen({ scene, camera, controls, layer });
  const kaart = createKaart(q('.kr-schema-host'));
  const wal = createWal(scene, { waterline, at: [C[0], 0, C[1]] });

  // ------------------------------------------------------------------ state
  // s: what the card asks of her. koers 0 .. 180 off the wind and side (+1: the wind over stuurboord) are
  // read back from the boat each frame, so a manoeuvre that takes her to the other boeg shows in the card
  let s = {};
  const lagen = new Set(['Loef en lij', 'Wallen']);
  let heel = 0;                                         // the heel drawn: it eases to what the lesson wants
  let draaiTijd = 0;                                    // when Oploeven or Afvallen was last clicked
  let man = null;                                       // a manoeuvre: { op, naam, wacht } - waiting for her course, or under way
  let klaar = null;                                     // the one last done, for the status
  let klaarOm = 0;                                      // when it was done: its track stays a moment, then goes
  let kanNiet = null;                                   // why the one asked for could not be done

  // ------------------------------------------------------------------ the boat follows the card
  const sideNow = () => Math.sign(modes.state.course) || s.side || 1;
  // her wind as she has it now - in a turn too - off the bow, + over stuurboord (in a gijp it can run past half a turn)
  const windNu = () => Math.atan2(Math.sin(modes.dock.wind), Math.cos(modes.dock.wind));
  const setBoat = () => modes.apply({ koers: s.koers === 0 ? 0 : s.side * s.koers });
  const set = (want) => {
    if ('draai' in want && want.draai !== s.draai) s.van = s.koers;   // turning: from where (a series of clicks one way, from its start)
    Object.assign(s, want);
    if ('koers' in want || 'side' in want) { if (!('draai' in want)) { s.draai = null; s.van = undefined; } klaar = null; kanNiet = null; setBoat(); }
    if ('kijk' in want) frame();
    if (want.doe) doe(want.doe);
    renderControls();
  };

  /** Overstag, opkruisen or gijpen, as the viewer does them: first to the course it starts from, then off. */
  function doe(op) {
    s.doe = null; klaar = null; kanNiet = null; s.draai = null;
    const from = MAN[op];
    if (Math.abs(Math.abs(modes.state.course) - from) > 2) { s.koers = from; setBoat(); }
    man = { op, wacht: true, sinds: 0 };
  }
  const startMan = () => {
    if (!modes.run.begin(man.op)) return false;
    man.wacht = false; man.naam = modes.procedure()?.name ?? null;
    return true;
  };

  // ------------------------------------------------------------------ controls
  const segmented = (label, key, options, cast = (v) => v) => {
    const row = document.createElement('div'); row.className = 'kr-rij';
    row.innerHTML = `<span>${label}</span><div class="segmented" role="radiogroup" aria-label="${label}">${options.map(([v, t]) => `<button type="button" role="radio" data-v="${v}">${t}</button>`).join('')}</div>`;
    row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => set({ [key]: cast(b.dataset.v) })));
    row.sync = () => row.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(String(s[key]) === b.dataset.v)));
    return row;
  };
  const knoppen = (buttons) => {
    const row = document.createElement('div'); row.className = 'kr-rij zt-knoppen';
    row.innerHTML = buttons.map(([k, t]) => `<button type="button" data-k="${k}">${t}</button>`).join('');
    return row;
  };
  const CONTROLS = {
    kijk: () => segmented('Kijk van', 'kijk', [['achter', 'Achteren'], ['voor', 'Voren']]),
    boeg: () => segmented('Wind over', 'side', [['-1', 'Bakboord'], ['1', 'Stuurboord']], Number),
    // 0, or 45 .. 180: between them there is no course to sail, so the slider jumps
    koers: () => {
      const row = document.createElement('label'); row.className = 'kr-rij kr-schuif';
      row.innerHTML = '<span>Koers <b></b></span><input type="range" min="0" max="180" step="5"><small><i>in de wind</i><i>voor de wind</i></small>';
      const input = row.querySelector('input'); const value = row.querySelector('b');
      input.addEventListener('input', () => { const v = Number(input.value); set({ koers: v < 25 ? 0 : Math.max(v, 45) }); });
      row.sync = () => { if (!input.matches(':active') && Number(input.value) !== s.koers) input.value = String(s.koers); value.textContent = koersNaam(s.koers); };
      return row;
    },
    draai: () => {
      const row = knoppen([['op', 'Oploeven'], ['af', 'Afvallen']]);
      row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        const op = b.dataset.k === 'op';
        const k = op ? (s.koers <= 45 ? 0 : Math.max(s.koers - STAP, 45)) : (s.koers === 0 ? 45 : Math.min(s.koers + STAP, 180));
        draaiTijd = performance.now(); set({ draai: op ? 'op' : 'af', koers: k });
      }));
      row.sync = () => row.querySelectorAll('button').forEach((b) => { b.disabled = b.dataset.k === 'op' ? s.koers === 0 : s.koers >= 180; });
      return row;
    },
    laag: () => {
      const row = document.createElement('div'); row.className = 'kr-lagen';
      row.innerHTML = LAGEN.map(([naam]) => `<button type="button" aria-pressed="false" data-laag="${naam}">${naam}</button>`).join('');
      row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        if (lagen.has(b.dataset.laag)) lagen.delete(b.dataset.laag); else lagen.add(b.dataset.laag);
        renderControls(); frame();
      }));
      row.sync = () => row.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(lagen.has(b.dataset.laag))));
      return row;
    },
  };
  for (const op of Object.keys(MAN)) {
    CONTROLS[op] = () => {
      const row = knoppen([[op, KNOP[op]]]);
      const b = row.querySelector('button'); b.classList.add('primary');
      b.addEventListener('click', () => set({ doe: op }));
      row.sync = () => { b.disabled = Boolean(man); };
      return row;
    };
  }
  const renderControls = () => lk.renderControls();

  // ------------------------------------------------------------------ a lesson
  // where the camera goes: the lesson's, from ahead when asked; in Zelf verkennen high over her with Wallen on
  const aanzicht = () => {
    const l = les();
    if (l.bediening.includes('kijk')) return s.kijk === 'voor' ? 'voor' : 'achter';
    if (l.id === 'verkennen') return lagen.has('Wallen') ? 'hoog' : 'achterboven';
    return l.aanzicht;
  };
  const frame = () => lk.frame();
  lk.koppel({
    begin(l) {
      man = null; klaar = null; kanNiet = null;
      if (modes.state.mode !== 'zeilen') modes.apply({ modus: 'zeilen' });
      if (modes.current().tuig !== 'op') modes.apply({ tuig: 'op' });
      modes.dock.schoon();                              // what an earlier manoeuvre left on the water goes
      const course = modes.state.course;
      s = { koers: Math.abs(course), side: Math.sign(course) || 1, kijk: 'achter', draai: null, van: undefined, drift: false, ...l.begin };
      if (l.begin.koers !== undefined) setBoat();
      return l.bediening.map((key) => CONTROLS[key]());
    },
    antwoord(laat) { if (laat.draai) draaiTijd = performance.now(); set(laat); },
    release() { modes.kracht.heel = 0; heel = 0; pijlen.visible = false; wal.visible = false; },
    aanzicht,
  });

  // ------------------------------------------------------------------ every frame
  function update(dt, width, height) {
    if (!lk.tick(width)) return;
    if (modes.state.mode !== 'zeilen') { modes.kracht.heel = 0; pijlen.visible = false; wal.visible = false; return; }
    const l = les();

    // the card reads her back: a manoeuvre, or the boeg changed elsewhere, shows in it
    const course = modes.state.course;
    if (course !== 0) s.side = Math.sign(course);
    s.koers = Math.abs(course);
    // a manoeuvre: waiting till she is on the course it starts from, then under way, then done
    if (man) {
      if (man.wacht) {
        man.sinds += dt;
        const off = Math.abs(Math.abs(THREE.MathUtils.radToDeg(windNu())) - MAN[man.op]);
        if ((off < 3 || man.sinds > 6) && !startMan() && man.sinds > 6) {
          kanNiet = modes.run.ops().find((o) => o.op === man.op)?.blocked ?? 'het lukt nu niet';
          man = null;
        }
      } else {
        const p = modes.procedure();
        if (!p || p.name !== man.naam || (!p.playing && p.t >= p.total - 1e-6)) {
          klaar = man.op; man = null; klaarOm = performance.now();
          // the viewer's gijp ends on a ruime wind; the lesson's goes from voor de wind to voor de wind
          if (klaar === 'gijpen') { s.koers = 180; setBoat(); }
        }
      }
      renderControls();
    }
    // done a while: the track on the water goes - the water runs on past her, and the track with it
    if (!man && klaarOm && performance.now() - klaarOm > NA) { klaarOm = 0; modes.dock.schoon(); }

    const wind = windNu();
    const wx = Math.cos(wind); const wz = Math.sin(wind);
    const nu = Math.abs(THREE.MathUtils.radToDeg(wind)); const side = Math.sign(wind) || sideNow();
    const verken = l.id === 'verkennen';
    const toon = new Set(verken ? LAGEN.filter(([n]) => lagen.has(n)).flatMap(([, k]) => k) : l.toon);
    toon.add('wind');
    if (l.id === 'boorden') toon.delete('wind');
    const inDeWind = nu < 22;

    // she heels a little to lij where the lage kant is the point
    const wantHeel = l.helt && !inDeWind ? -side * THREE.MathUtils.degToRad(7) : 0;
    heel += (wantHeel - heel) * (1 - Math.exp(-dt * 2));
    modes.kracht.heel = heel;

    // ---- on the boat
    const items = [];
    const at = (x, y, z) => [x, y, z];
    const P = (u, y = 1.0) => at(C[0] + u[0], y, C[1] + u[1]);           // [dx, dz] from her middle
    // (the wind on the water is the viewer's own arrow: on the boat nothing more is drawn for it)
    // ahead of her bow, up high enough that from astern its word stands over the boat, not on her spiegel
    if (toon.has('vaarrichting')) items.push({ type: 'pijl', from: at(6.4, 2.6, 0), vec: [1.6, 0, 0], kleur: KLEUR.vaart, label: 'vaarrichting', labelAt: 0.5 });
    if (toon.has('boorden')) {
      items.push({ type: 'tekst', at: at(2.6, 1.15, -1.85), label: 'bakboord', kleur: KLEUR.bakboord });
      items.push({ type: 'tekst', at: at(2.6, 1.15, 1.85), label: 'stuurboord', kleur: KLEUR.stuurboord });
    }
    if (toon.has('loeflij') && !inDeWind) {
      items.push({ type: 'tekst', at: at(2.2, 0.9, side * 2.0), label: `loef · hoge kant`, kleur: KLEUR.loef });
      items.push({ type: 'tekst', at: at(2.2, 0.9, -side * 2.0), label: `lij · lage kant`, kleur: KLEUR.lij });
    }
    wal.visible = toon.has('wal');
    if (toon.has('wal')) {
      wal.set(wind);
      items.push({ type: 'tekst', at: P([wx * (AF + 2), wz * (AF + 2)], 3.2), label: 'hogerwal', kleur: KLEUR.wal });
      items.push({ type: 'tekst', at: P([-wx * (AF + 2), -wz * (AF + 2)], 3.2), label: 'lagerwal', kleur: KLEUR.wal });
    }
    if (s.drift) items.push({ type: 'pijl', from: P([0, 0], 0.7), vec: [-wx * 5, 0, -wz * 5], kleur: KLEUR.drift, label: 'zo drijf je af', labelAt: 0.75 });
    if (toon.has('koersnaam')) items.push({ type: 'tekst', at: at(6.4, 0.4, 0), label: koersNaam(nu), kleur: KLEUR.nu });   // just ahead of her bow, in the view
    // a turn: an arc from the bow towards the wind (oploeven) or away from it, while it is fresh
    const draai = toon.has('draai') && s.draai && performance.now() - draaiTijd < 6000 ? s.draai : null;
    const draaiZin = draai ? (draai === 'op' ? -side : side) : 0;           // a positive turn about y goes to bakboord
    if (draai) {
      items.push({ type: 'boog', center: at(C[0], 1.1, C[1]), as: 'y', r: 3.6, start: 0, sweep: draaiZin * 0.7, kleur: KLEUR.draai, label: draai === 'op' ? 'oploeven' : 'afvallen' });
    }
    pijlen.visible = true; pijlen.draw(items); pijlen.update(width, height);

    // ---- on the map
    if (lk.bladOpen) {
      const m = [];
      const add = (u) => [C[0] + u[0], C[1] + u[1]];
      if (toon.has('wal')) {
        // (with the koersen round her, a little further off on the map, clear of their words)
        const af = toon.has('koersen') ? AF + 3.5 : AF;
        for (const [sg, naam] of [[1, 'hogerwal'], [-1, 'lagerwal']]) {
          const rx = -wz; const rz = wx;
          const e = (d, a) => add([sg * wx * d + rx * a, sg * wz * d + rz * a]);
          m.push({ type: 'vlak', pts: [e(af, -40), e(af, 40), e(af + 30, 40), e(af + 30, -40)], fill: '#c5cdb0', stroke: '#93a391', fit: false });
          m.push({ type: 'tekst', at: e(af + 2, 0), label: naam, kleur: KLEUR.wal });
        }
      }
      if (toon.has('koersen')) {
        // the koersen round her as the book draws them: with the wind from the top, each a ray on either side
        const R0 = 4.2; const R1 = 8.4;
        const ray = (c, sg) => { const a = THREE.MathUtils.degToRad(c); return [Math.cos(a) * wx - sg * Math.sin(a) * -wz, Math.cos(a) * wz - sg * Math.sin(a) * wx]; };
        const geen = [];
        for (let c = -45; c <= 45; c += 5) { const d = ray(Math.abs(c), Math.sign(c) || 1); geen.push(add([d[0] * R1, d[1] * R1])); }
        m.push({ type: 'vlak', pts: [add([0, 0]), ...geen], fill: 'rgba(54, 69, 79, 0.08)', fit: false });
        for (const [c, naam] of [[0, 'in de wind'], [45, 'aan de wind'], [90, 'halve wind'], [135, 'ruime wind'], [180, 'voor de wind']]) {
          for (const sg of c === 0 || c === 180 ? [1] : [1, -1]) {
            const d = ray(c, sg); const hier = koersNaam(nu) === naam && (sg === side || c === 0 || c === 180);
            // in de wind only its word: the wind comes down that way already
            if (c > 0) m.push({ type: 'lijn', pts: [add([d[0] * R0, d[1] * R0]), add([d[0] * R1, d[1] * R1])], kleur: hier ? KLEUR.nu : KLEUR.koers, px: hier ? 2.4 : 1.2, dashed: !hier });
            m.push({ type: 'tekst', at: add([d[0] * (R1 + 1.1), d[1] * (R1 + 1.1)]), label: naam, kleur: hier ? KLEUR.nu : KLEUR.koers, klein: !hier });
          }
        }
      }
      // her track over the water, and the way the manoeuvre goes
      // (the map takes it in only while it is sailed: once done it stays a moment and goes, and does not draw the
      // map out after it as it drifts off with the water)
      if (toon.has('spoor') && (man || klaarOm)) {
        const way = modes.dock.way(60).map((p) => [p.x, p.z]);
        if (way.length > 1 && man) m.push({ type: 'lijn', pts: way, kleur: '#8a96a3', px: 1.2, dashed: true });
        const track = modes.dock.track().map((p) => [p.x, p.z]);
        if (track.length > 1) m.push({ type: 'lijn', pts: track, kleur: KLEUR.spoor, px: 3, opacity: 0.55, fit: Boolean(man) });
      }
      // the boat: deck, mast, and the sails as they stand
      m.push({ type: 'vlak', pts: deck, fill: '#f7f4ec', stroke: '#36454f' });
      for (const pts of zeilen(windNu(), side)) m.push({ type: 'lijn', pts, kleur: '#5f5a50', px: 2.4 });
      m.push({ type: 'punt', at: MAST, kleur: '#7a5a2e', r: 3.5 });
      if (toon.has('vaarrichting')) m.push({ type: 'pijl', from: [6.3, 0], vec: [1.5, 0], kleur: KLEUR.vaart, label: 'vaarrichting', dun: true });
      if (toon.has('boorden')) {
        m.push({ type: 'tekst', at: [2.8, -1.7], label: 'bakboord', kleur: KLEUR.bakboord });
        m.push({ type: 'tekst', at: [2.8, 1.7], label: 'stuurboord', kleur: KLEUR.stuurboord });
      }
      if (l.bediening.includes('kijk')) {                                    // where you stand and look from
        const voor = s.kijk === 'voor';
        m.push({ type: 'pijl', from: [voor ? 10.4 : -2.6, 0], vec: [voor ? -1.4 : 1.4, 0], kleur: KLEUR.nu, dun: true });
        m.push({ type: 'tekst', at: [voor ? 11.2 : -3.4, 0], label: 'jij', kleur: KLEUR.nu });
      }
      if (toon.has('loeflij') && !inDeWind) {
        m.push({ type: 'tekst', at: [2.0, side * 1.9], label: 'loef', kleur: KLEUR.loef });
        m.push({ type: 'tekst', at: [2.0, -side * 1.9], label: 'lij', kleur: KLEUR.lij });
      }
      const hoek = toon.has('spoor');                                          // a track goes where it goes: the wind out of its way
      if (toon.has('wind') && !hoek) {
        for (const k of [-2.5, 0, 2.5]) {
          const rx = -wz * k; const rz = wx * k;
          m.push({ type: 'pijl', from: add([wx * 7 + rx, wz * 7 + rz]), vec: [-wx * 2.4, -wz * 2.4], kleur: KLEUR.wind, dun: k !== 0 });
        }
        m.push({ type: 'tekst', at: add([wx * 7.8, wz * 7.8]), label: 'wind', kleur: KLEUR.wind });
      }
      if (s.drift) m.push({ type: 'pijl', from: C, vec: [-wx * 5, -wz * 5], kleur: KLEUR.drift, label: 'zo drijf je af', labelAt: 0.8 });
      if (draai) {
        const pts = [];
        for (let i = 0; i <= 24; i++) { const t = (draaiZin * 0.7 * i) / 24; pts.push([C[0] + 3.6 * Math.cos(t), C[1] - 3.6 * Math.sin(t)]); }
        m.push({ type: 'boog', pts, kleur: KLEUR.draai, label: draai === 'op' ? 'oploeven' : 'afvallen' });
      }
      const ruim = toon.has('wal') ? 2 * AF + (toon.has('koersen') ? 15 : 8) : toon.has('koersen') ? 21 : 11;
      kaart.draw({ frame: l.kaart, wind, centre: C, min: [ruim, ruim], items: m, titel: l.titel, hoek: hoek && l.kaart === 'wind' });
    }

    const z = { koers: nu, side, kijk: s.kijk, draai: s.draai, van: s.van, bezig: Boolean(man && !man.wacht), klaar: klaar === l.id };
    const status = kanNiet ? `Dat kan nu niet: ${kanNiet.toLowerCase()}.` : l.status(z);
    lk.status(status, kanNiet ? 'geel' : '');
  }

  return { update, open: lk.open, close: lk.close, onderwerpen: LESSEN,
           dispose: () => { lk.dispose(); pijlen.dispose(); kaart.dispose(); wal.dispose(); } };
}
