import * as THREE from 'three';
import { CONFIGS, makeShip } from '../bpr/schepen.js';
import { MARKS, makeMark } from '../bpr/betonning.js';
import { createPijlen } from '../krachten/pijlen.js';
import { createKaart } from '../zeiltermen/kaart.js';
import { createLesKaart, segmented } from './kaart.js';
import { deckOutline } from './boot.js';

// Grote schepen: a lesson after Sint Maarten Kielboot II and III § 2.6, Vaarproblematiek andersoortige schepen -
// de dode hoek, zuiging, diepgang en verlijeren. A binnenvaartschip of Zoeken › Lichten (bpr/schepen.js, a
// Kempenaar of 55 m) lies by the lelievlet, with on the water what the onderwerp is about: the part of the water
// its skipper cannot see, the water pushed away and drawn in, the vaargeul it cannot leave, the way it goes
// crabwise in a wind. The card has the same from above (zeiltermen/kaart.js), or the water in section.
//
// Everything is placed in the boat's frame (x to her bow, z to stuurboord, her middle at x 2.8): she lies
// where she is, and the ship is put round her.

const KLEUR = { zone: '#c0262d', water: '#1b64c4', schip: '#36454f', wind: '#1b64c4', koers: '#c96f00', echt: '#16833a', jij: '#c96f00', geul: '#7a8a99' };
const C = 2.8;
// the ship (bpr/schepen.js motor): 55 m, 6.6 m wide, the wheelhouse aft. Where the skipper's eye is, and the
// highest part of her forward of it (the hatches over the hold), as the sight line goes over it to the water
const L = 55; const B = 6.6; const OOG = [4.2, 3.6]; const LUIK = [L * 0.81, 2.4];
const DODE = (LUIK[0] - OOG[0]) * OOG[1] / (OOG[1] - LUIK[1]) - (L - OOG[0]);   // m before the bow the water comes into sight
const NAAST = 2;                    // m beside her forward half where the gangboard hides the water

export const SCHEPEN = [
  {
    id: 'dodehoek', titel: 'De dode hoek', cwo: 'KB II · KB III',
    kort: [
      'Net als een vrachtwagen heeft een groot schip een <b>dode hoek</b>: het deel van het water dat de schipper vanuit de stuurhut niet kan zien.',
      'Die ligt vooral <b>voor de boeg</b>, en kan ver doorlopen. Maar ook als je <b>vlak naast</b> het schip vaart, kan de schipper je missen.',
    ],
    meer: [
      { kop: 'Hoe ver', tekst: 'De schipper kijkt over de voorkant van zijn schip heen. Hoe hoger het voorschip en hoe lager de stuurhut, hoe verder de dode hoek doorloopt. Een leeg schip ligt hoog op het water: dan is de dode hoek extra groot.' },
      { kop: 'Rondom', tekst: 'Sommige schepen hebben door hun vorm rondom een dode hoek, niet alleen voor de boeg.' },
    ],
    waar: [['voor', 'Voor de boeg'], ['naast', 'Vlak ernaast'], ['ver', 'Ruim opzij']],
    vraag: {
      tekst: 'Je vaart een eindje voor de boeg van een groot schip. Ziet de schipper je?',
      opties: [['Ja, je zit recht voor hem', false], ['Nee, je zit in zijn dode hoek', true]],
      uitleg: 'Recht voor de boeg kijkt de schipper over zijn schip heen: het water vlak ervoor ziet hij niet.',
      laat: { waar: 'voor' },
    },
  },
  {
    id: 'zuiging', titel: 'Zuiging', cwo: 'KB II · KB III',
    kort: [
      'Een groot schip duwt aan de voorkant het water weg. Aan de <b>zijkant</b> en de <b>achterkant</b> wordt het water weer aangezogen.',
      'Een kleine boot of een zwemmer die daar in de buurt is, kan <b>meegezogen</b> of zelfs onder het schip gezogen worden. Blijf dus uit de buurt van de zij- en achterkant.',
    ],
    meer: [{ kop: 'Ook achter het schip', tekst: 'Achter een schip draait de schroef: daar stroomt het water hard. Steek nooit vlak achter een schip over.' }],
    waar: [['dicht', 'Vlak ernaast'], ['ruim', 'Ruim opzij']],
    vraag: {
      tekst: 'Een groot schip vaart vlak langs. Waar ben je het veiligst?',
      opties: [['Vlak achter het schip', false], ['Naast de achterkant', false], ['Ruim uit de buurt', true]],
      uitleg: 'Aan de zij- en achterkant wordt het water aangezogen. Hoe verder weg, hoe minder je ervan merkt.',
      laat: { waar: 'ruim' },
    },
  },
  {
    id: 'diepgang', titel: 'Diepgang', cwo: 'KB II · KB III',
    kort: [
      'Veel wateren hebben een <b>vaargeul</b>: een dieper deel, soms aangegeven met tonnen. Een zwaar beladen schip ligt diep en kan soms <b>alleen in de vaargeul</b> varen.',
      'Zo’n schip kan dan niet voor je uitwijken. Daar moet jij rekening mee houden: blijf zo veel mogelijk buiten de vaargeul en geef het de ruimte.',
    ],
    meer: [{ kop: 'De lelievlet', tekst: 'Met het zwaard op steekt een lelievlet maar een paar decimeter diep. Buiten de vaargeul is er voor jou meestal water genoeg.' }],
    doorsnede: true,
    vraag: {
      tekst: 'Een zwaar beladen schip komt door de vaargeul aan. Wat doe je?',
      opties: [['Doorvaren: hij moet uitwijken', false], ['Buiten de vaargeul blijven en ruimte geven', true]],
      uitleg: 'Hij kan de vaargeul niet uit. Jij kunt dat wel: maak ruimte.',
    },
  },
  {
    id: 'verlijeren', titel: 'Verlijeren', cwo: 'KB II · KB III',
    kort: [
      'Ook een groot motorschip <b>verlijert</b>: met wind van opzij wordt het opzij geduwd. Om toch rechtdoor te gaan, vaart het een beetje <b>scheef</b>, met de kop iets naar de wind.',
      'Zo neemt het meer ruimte in en is het minder wendbaar. Geef zo’n schip de ruimte.',
    ],
    meer: [{ kop: 'Kompaskoers en werkelijke koers', tekst: 'De richting waarin de boeg wijst, heet de kompaskoers. De richting waarin het schip echt gaat, is de werkelijke koers. Bij verlijeren zijn die twee niet hetzelfde.' }],
    vraag: {
      tekst: 'Een groot schip vaart scheef door de zijwind. Wat betekent dat voor jou?',
      opties: [['Niets, het gaat gewoon rechtdoor', false], ['Het neemt meer ruimte in en kan minder goed uitwijken', true]],
      uitleg: 'Scheef varend is het schip breder dan het lijkt, en het heeft zijn roer al nodig om rechtdoor te gaan.',
    },
  },
];

export function initSchepen({ sleutel, wrap, scene, camera, controls, parts, modes, fly, setCoveredRight, opslaan, onOpen }) {
  const lk = createLesKaart({ wrap, id: 'les-schepen', sleutel, titel: 'Grote schepen', lessen: SCHEPEN, store: 'lelievlet.les.schepen.v1', opslaan, fly, setCoveredRight, onOpen });
  const lelievlet = scene.getObjectByName('lelievlet');
  const waterline = lelievlet.userData.tuig?.waterlijn_m ?? 0.3;
  const deck = deckOutline(parts, scene);
  const pijlen = createPijlen({ scene, camera, controls, layer: lk.layer });
  const kaart = createKaart(lk.host);
  const doorsnede = document.createElement('div'); doorsnede.className = 'les-plaatje'; doorsnede.hidden = true; lk.host.append(doorsnede);
  const kaartSvg = lk.host.querySelector('svg');

  // the ship, with the dode hoek on the water as a child of it: it goes where she goes
  const holder = new THREE.Group(); holder.name = 'les-schepen'; holder.visible = false; scene.add(holder);
  // the water further out than the viewer's own disc (14 m round her, rig.js makeWater), for a ship of 55 m: an
  // opaque sea in its place while the lesson is open, as Lichten has it
  const zee = new THREE.Mesh(new THREE.CircleGeometry(600, 64), new THREE.MeshStandardMaterial({ color: 0x5f8eae, roughness: 0.35, metalness: 0 }));
  zee.rotation.x = -Math.PI / 2; holder.add(zee);
  const ship = makeShip(CONFIGS.find((c) => c.id === 'groot_motorschip'));
  holder.add(ship);
  const zone = (() => {
    const shape = new THREE.Shape();
    // ahead of the bow, widening a little, and the strips beside her forward half
    shape.moveTo(L / 2, B / 2); shape.lineTo(L, B / 2); shape.lineTo(L + DODE, B / 2 + 4); shape.lineTo(L + DODE, -B / 2 - 4);
    shape.lineTo(L, -B / 2); shape.lineTo(L / 2, -B / 2); shape.lineTo(L / 2, -B / 2 - NAAST); shape.lineTo(L, -B / 2 - NAAST);
    shape.lineTo(L, B / 2 + NAAST); shape.lineTo(L / 2, B / 2 + NAAST); shape.closePath();
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color: KLEUR.zone, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }));
    mesh.rotation.x = Math.PI / 2; mesh.position.y = 0.03; mesh.renderOrder = 3;
    ship.add(mesh); return mesh;
  })();
  // verlijeren: the strip of water the ship takes, going crabwise - wider than it is - as a zone of danger
  const strook = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: KLEUR.zone, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
  strook.renderOrder = 3; strook.visible = false; holder.add(strook);
  const STROOK = 70;                                                      // m of it either side of her
  // the vaargeul: rode tonnen on her side of it, groene on the far side
  const geul = new THREE.Group(); scene.add(geul); geul.visible = false;
  const ton = (id) => MARKS.find((m) => m.id === id);
  const GEUL = { rood: -6, groen: -26 };                                  // z of the two rows
  for (let x = -60; x <= 60; x += 30) {
    for (const [z, id] of [[GEUL.rood, 'lateraal-rechts-stompe-ton'], [GEUL.groen, 'lateraal-links-spitse-ton']]) {
      const m = makeMark(ton(id)); m.position.set(C + x, waterline, z); geul.add(m);
    }
  }

  let waar = null; let t = 0;
  const les = () => lk.les;
  // where the ship lies for each onderwerp and choice: [x of her stern, z of her middle, heading]
  const plek = () => {
    const l = les();
    if (l.id === 'dodehoek') return { voor: [C - 30 - L, 0, 0], naast: [C + 8 - L, B / 2 + 1.6, 0], ver: [C + 10 - L, 30, 0] }[waar];
    if (l.id === 'zuiging') return [C - L + ((t * 2.5) % 140) - 40, waar === 'ruim' ? 24 : B / 2 + 4, 0];   // she comes by, again and again
    if (l.id === 'diepgang') return [C - 20 - L / 2 + ((t * 2) % 120) - 30, (GEUL.rood + GEUL.groen) / 2, 0];
    return [C - L / 2 - 10 + ((t * 2) % 120) - 60, 26, THREE.MathUtils.degToRad(-9)];   // verlijeren: her head a little to the wind (from -z), going by
  };
  const kijk = () => {
    const l = les();
    // the dode hoek: all of the ship and the water ahead of it; beside it from her other side, so it does not hide her
    if (l.id === 'dodehoek') {
      if (waar === 'voor') return { hoogte: 52, breedte: 140, doel: [C - 22, 0, 0], richting: [-0.25, 0.8, 1] };
      if (waar === 'naast') return { hoogte: 30, breedte: 75, doel: [C - 12, 0, 3], richting: [-0.3, 0.8, -1] };
      return { hoogte: 40, breedte: 100, doel: [C - 18, 0, 14], richting: [-0.3, 0.8, -1] };
    }
    if (l.id === 'zuiging') return { hoogte: 34, breedte: 85, doel: [C, 0, 6], richting: [-0.35, 1, -0.8] };   // from her other side: the ship beyond her
    if (l.id === 'diepgang') return { hoogte: 30, breedte: 80, doel: [C, 0, -12], richting: [-0.9, 0.9, 0.5] };
    return { hoogte: 34, breedte: 80, doel: [C, 0, 18], richting: [-0.4, 1, 0.6] };
  };

  lk.koppel({
    begin(l) {
      if (modes.state.mode !== 'zeilen') modes.apply({ modus: 'zeilen' });
      if (modes.current().tuig !== 'op') modes.apply({ tuig: 'op' });
      modes.dock.schoon();
      waar = l.waar?.[0][0] ?? null; t = 0;
      holder.visible = true; modes.water.visible = false; zone.visible = l.id === 'dodehoek'; geul.visible = l.id === 'diepgang'; strook.visible = l.id === 'verlijeren';
      kaartSvg.style.display = l.doorsnede ? 'none' : ''; doorsnede.hidden = !l.doorsnede;
      if (l.doorsnede) doorsnede.innerHTML = sectie();
      return l.waar ? [segmented('Waar jij vaart', l.waar, () => waar, (v) => { waar = v; lk.renderControls(); lk.frame(); })] : [];
    },
    antwoord(laat) { if (laat.waar) { waar = laat.waar; lk.renderControls(); } },
    release() { holder.visible = false; modes.water.visible = true; geul.visible = false; pijlen.visible = false; modes.kracht.opzij = 0; },
    aanzicht: kijk,
  });

  /** The water in section, across the vaargeul: the ship deep in it, the lelievlet beside it in the shallows. */
  function sectie() {
    const W = 600; const H = 260; const y0 = 90;                         // the water surface
    const bodem = 'M0,160 L170,160 L230,220 L370,220 L430,160 L600,160 L600,260 L0,260 Z';
    return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Doorsnede van het water met de vaargeul">
      <rect width="${W}" height="${H}" fill="#e3eef5"/>
      <rect y="${y0}" width="${W}" height="${H - y0}" fill="#bcd6e6"/>
      <path d="${bodem}" fill="#c9b38a" stroke="#a08960"/>
      <path d="M245,${y0 - 28} L355,${y0 - 28} L350,${y0 + 70} L250,${y0 + 70} Z" fill="#36454f"/>
      <rect x="262" y="${y0 - 52}" width="22" height="24" fill="#e8e4da" stroke="#36454f"/>
      <path d="M470,${y0 - 6} L520,${y0 - 6} L514,${y0 + 8} L476,${y0 + 8} Z" fill="#f5c20d" stroke="#36454f"/>
      <line x1="495" y1="${y0 - 6}" x2="495" y2="${y0 - 70}" stroke="#7a5a2e" stroke-width="2.5"/>
      <line x1="495" y1="${y0 + 8}" x2="495" y2="${y0 + 22}" stroke="#36454f" stroke-width="3"/>
      <g font-family="inherit" font-weight="600" font-size="15" text-anchor="middle" paint-order="stroke" stroke="#fff" stroke-width="3">
        <text x="300" y="${y0 + 150}" fill="#5b4a2a">vaargeul</text>
        <text x="300" y="${y0 - 62}" fill="#36454f">beladen schip</text>
        <text x="495" y="${y0 - 78}" fill="#36454f">lelievlet</text>
        <text x="90" y="${y0 + 52}" fill="#5b4a2a">ondiep</text><text x="520" y="${y0 + 52}" fill="#5b4a2a">ondiep</text>
      </g>
    </svg>`;
  }

  // the outline of the ship from above, in her own frame [x, z]
  const romp = [[0, -B / 2 + 0.4], [0.6, -B / 2], [L - 6, -B / 2], [L - 1, -B / 2 + 1.4], [L, 0], [L - 1, B / 2 - 1.4], [L - 6, B / 2], [0.6, B / 2], [0, B / 2 - 0.4]];

  function update(dt, width, height) {
    if (!lk.tick(width)) return;
    t += dt;
    const l = les();
    const [sx, sz, kop] = plek();
    ship.position.set(sx, waterline, sz); ship.rotation.y = -kop;
    // close beside him the zuiging takes her: pushed off a little by his bow wave, then drawn in along his side until
    // she lies against him, and let go again once his stern is past (a: where she is along him, 1 his bow, 0 his stern)
    let opzij = 0; let zuig = '';
    if (l.id === 'zuiging' && waar === 'dicht') {
      const a = (C - sx) / L; const TEGEN = sz - B / 2 - 1.05;          // her middle where her side touches his
      zuig = a > 1.1 || a < -0.35 ? '' : a > 0.85 ? 'weg' : a > 0.4 ? 'trek' : a >= 0 ? 'tegen' : 'los';
      opzij = a > 1.1 || a < -0.35 ? 0 : a > 0.85 ? -1.2 * Math.sin((Math.PI * (1.1 - a)) / 0.25)
        : a > 0.35 ? TEGEN * THREE.MathUtils.smoothstep(0.85 - a, 0, 0.5) : a >= 0 ? TEGEN : TEGEN * (1 + a / 0.35);
    }
    modes.kracht.opzij = opzij;
    zee.position.set(C, modes.water.position.y - 0.01, opzij);
    ship.userData.update?.(t, 0, camera);
    // a point of the ship, in the boat's frame [x, z]
    const op = ([x, z]) => [sx + x * Math.cos(kop) - z * Math.sin(kop), sz + x * Math.sin(kop) + z * Math.cos(kop)];
    const items = []; const m = [];
    const at = ([x, z], y = 1.5) => [x, y, z];
    const bij = () => {                                                     // is she in the dode hoek now?
      if (l.id !== 'dodehoek') return false;
      return waar !== 'ver';
    };
    if (l.id === 'dodehoek') {
      // the sight line: from the skipper's eye over the hatches down to the water
      const oog = op([OOG[0], 0]); const water = op([L + DODE, 0]);
      items.push({ type: 'lijn', a: [oog[0], OOG[1] + waterline, oog[1]], b: [water[0], waterline, water[1]], kleur: KLEUR.schip });
      items.push({ type: 'tekst', at: at(op([L + DODE * 0.8, 0]), 1), label: 'dode hoek', kleur: KLEUR.zone });
      items.push({ type: 'tekst', at: at(op([OOG[0], 0]), OOG[1] + 2), label: 'stuurhut', kleur: KLEUR.schip });
    }
    if (l.id === 'zuiging') {
      const voor = op([L + 3, 0]);
      // on both his sides: pushed away at the bow, drawn in along his side and in behind his stern; the words on her side
      // (its words only while they are in sight: he comes from far and goes far)
      const inBeeld = (p) => Math.abs(p[0] - C) < 36;
      for (const k of [1, -1]) {
        const woord = (w, p) => (k === -1 && inBeeld(p) ? { label: w } : {});
        const boeg = op([L, k * (B / 2 + 1)]); const zij = op([L * 0.4, k * (B / 2 + 8)]);
        items.push({ type: 'pijl', from: at(boeg, 0.6), vec: [6, 0, k * 5], kleur: KLEUR.water, ...woord('weggeduwd', boeg) });
        items.push({ type: 'pijl', from: at(zij, 0.6), vec: [0, 0, -k * 6], kleur: KLEUR.water, ...woord('aangezogen', zij) });
        items.push({ type: 'pijl', from: at(op([-6, k * (B / 2 + 5)]), 0.6), vec: [4, 0, -k * 4], kleur: KLEUR.water });
      }
      items.push({ type: 'pijl', from: at(voor, 3), vec: [9, 0, 0], kleur: KLEUR.schip, label: 'vaarrichting' });
    }
    // the strip it takes: between the outermost points of its hull, across its werkelijke koers
    let strookZ = null;
    if (l.id === 'verlijeren') {
      const zs = romp.map((p) => op(p)[1]); strookZ = [Math.min(...zs), Math.max(...zs)];
      strook.position.set(C, waterline + 0.03, (strookZ[0] + strookZ[1]) / 2); strook.scale.set(2 * STROOK, 1, strookZ[1] - strookZ[0]);
      items.push({ type: 'tekst', at: [C + 22, 1, strookZ[0]], label: 'gevarenzone', kleur: KLEUR.zone });
    }
    if (l.id === 'verlijeren') {
      const mid = op([L / 2, 0]);
      items.push({ type: 'pijl', from: at(op([L, 0]), 2), vec: [16 * Math.cos(kop), 0, 16 * Math.sin(kop)], kleur: KLEUR.koers, label: 'kompaskoers' });
      items.push({ type: 'pijl', from: at(mid, 2.4), vec: [26, 0, 0], kleur: KLEUR.echt, label: 'werkelijke koers' });
      items.push({ type: 'pijl', from: [mid[0], 3, mid[1] - 18], vec: [0, 0, 8], kleur: KLEUR.wind, label: 'wind' });
    }
    pijlen.visible = true; pijlen.draw(items); pijlen.update(width, height);

    // the map: her, the ship and what goes with it, the bow up - the ship as far from her as she is from it now
    const opK = (p) => { const [x, z] = op(p); return [x, z - opzij]; };
    if (lk.bladOpen && !l.doorsnede) {
      if (l.id === 'dodehoek') {
        m.push({ type: 'vlak', pts: [[L / 2, B / 2 + NAAST], [L, B / 2 + NAAST], [L, B / 2], [L + DODE, B / 2 + 4], [L + DODE, -B / 2 - 4], [L, -B / 2], [L, -B / 2 - NAAST], [L / 2, -B / 2 - NAAST]].map(op), fill: 'rgba(192, 38, 45, 0.22)' });
        m.push({ type: 'tekst', at: opK([L + DODE * 0.3, 0]), label: 'dode hoek', kleur: KLEUR.zone });
      }
      if (l.id === 'zuiging') {
        for (const k of [1, -1]) {
          const woord = (w) => (k === -1 ? { label: w } : {});
          m.push({ type: 'pijl', from: opK([L, k * (B / 2 + 1)]), vec: [6, k * 5], kleur: KLEUR.water, dun: true, ...woord('weg') });
          m.push({ type: 'pijl', from: opK([L * 0.4, k * (B / 2 + 8)]), vec: [0, -k * 6], kleur: KLEUR.water, dun: true, ...woord('aangezogen') });
          m.push({ type: 'pijl', from: opK([-6, k * (B / 2 + 5)]), vec: [4, -k * 4], kleur: KLEUR.water, dun: true });
        }
      }
      if (l.id === 'verlijeren') {
        m.push({ type: 'vlak', pts: [[C - STROOK, strookZ[0]], [C + STROOK, strookZ[0]], [C + STROOK, strookZ[1]], [C - STROOK, strookZ[1]]], fill: 'rgba(192, 38, 45, 0.18)', fit: false });
        m.push({ type: 'tekst', at: [C - 8, strookZ[1] + 4], label: 'gevarenzone', kleur: KLEUR.zone });
        m.push({ type: 'pijl', from: opK([L, 0]), vec: [16 * Math.cos(kop), 16 * Math.sin(kop)], kleur: KLEUR.koers, label: 'kompaskoers' });
        m.push({ type: 'pijl', from: opK([L / 2, 0]), vec: [30, 0], kleur: KLEUR.echt, label: 'werkelijke koers' });
        const mid = opK([L / 2, 0]);
        m.push({ type: 'pijl', from: [mid[0], mid[1] - 16], vec: [0, 8], kleur: KLEUR.wind, label: 'wind' });
      }
      m.push({ type: 'vlak', pts: romp.map(op), fill: '#9aa5ae', stroke: KLEUR.schip });
      m.push({ type: 'vlak', pts: deck, fill: '#f7f4ec', stroke: '#36454f' });
      m.push({ type: 'punt', at: [C, 0], kleur: KLEUR.jij, r: 4.5 });               // she is small beside the ship: a dot marks her
      m.push({ type: 'tekst', at: [C, -7], label: 'jij', kleur: KLEUR.jij });
      kaart.draw({ frame: 'boot', wind: 0, centre: [C, 0], min: [30, 30], items: m, titel: l.titel });
    }

    const status = l.id === 'dodehoek' ? (bij() ? 'Hier ziet de schipper je niet: je zit in zijn dode hoek.' : 'Hier kan de schipper je zien.')
      : l.id === 'zuiging' ? (waar !== 'dicht' ? 'Ruim opzij merk je weinig van de zuiging.'
        : { weg: 'De boeg duwt het water weg: je wordt eerst van het schip af geduwd.', trek: 'Langs de zijkant word je naar het schip toe gezogen.',
          tegen: 'Je ligt tegen het schip aan: hier kun je eronder raken.', los: 'Het schip is voorbij: je komt weer los.' }[zuig]
          ?? 'Vlak naast het schip merk je de zuiging: je wordt naar het schip toe getrokken.')
        : l.id === 'diepgang' ? 'Het beladen schip vaart in de vaargeul, tussen de tonnen. Jij blijft erbuiten.'
          : 'Het schip vaart scheef: de kop wijst een beetje naar de wind, maar het gaat rechtdoor.';
    // in his dode hoek, or close beside him in the zuiging: danger; a ship going crabwise: keep clear
    lk.status(status, (l.id === 'dodehoek' && bij()) || (l.id === 'zuiging' && waar === 'dicht') ? 'rood' : l.id === 'verlijeren' ? 'oranje' : '');
  }

  return { update, open: lk.open, close: lk.close, onderwerpen: SCHEPEN,
           dispose: () => { lk.dispose(); pijlen.dispose(); kaart.dispose(); holder.removeFromParent(); geul.removeFromParent(); } };
}
