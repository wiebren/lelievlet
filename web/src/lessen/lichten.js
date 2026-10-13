import * as THREE from 'three';
import { makeZee } from './boot.js';
import { CONFIGS, makeShip } from '../bpr/schepen.js';
import { LICHT_UITLEG, LICHT_GROEPEN } from '../bpr/lichtuitleg.js';
import { createLesKaart, segmented, keuze, kies, ernst } from './kaart.js';
import { createKaart } from '../zeiltermen/kaart.js';
import { cwoLicht } from '../bpr/cwo.js';            // what the CWO asks, as Zoeken and its quiz have it

// Lichten en dagtekens: a lesson after Sint Maarten Kielboot III hoofdstuk 5, Optische tekens - with only what the
// CWO handboek Kielboot (2022, Gevorderd, 402) asks: BPR 3.01a (the four kinds of light), 3.05, 3.07, 3.08 lid 1 and
// 5, 3.09 lid 1-4, 3.12, 3.13, 3.15, 3.20, 3.25, 3.29, 3.30 and 3.38 (reference/bpr/cwo/THEORIE_EISEN.md). The ships are those of Zoeken › Lichten (bpr/schepen.js), each
// out ahead of the boat, seen from ahead, from either side or from astern, by day or by night; the words are the
// ones Zoeken has for them (bpr/lichtuitleg.js). The first onderwerp lays the sector of each light out on the
// water round the ship, and in the card as a map from above (on a phone the card is all you see); the others have
// a picture of her as you see her from the water, her lights as dots, and the camera at the eye of someone in a
// small boat. Zelf verkennen has every ship of Zoeken, and leads on to it.

const C = 2.8;
const cfg = (id) => CONFIGS.find((c) => c.id === id);
const KANTEN = [['voor', 'Voren'], ['bb', 'Bakboord'], ['sb', 'Stuurboord'], ['achter', 'Achteren']];
const DRAAI = { voor: Math.PI, bb: Math.PI / 2, sb: -Math.PI / 2, achter: 0 };     // her bow: at you, to your left, to your right, away
const SECTOR = { toplicht: '#f5f1d8', sb: '#1fa34a', bb: '#d0202a', heklicht: '#f5f1d8', rondom: '#f5d77a' };
const NAAM = { toplicht: 'toplicht', sb: 'boordlicht', bb: 'boordlicht', heklicht: 'heklicht', rondom: 'rondom schijnend' };

// the colour of a light as a dot in a picture
const LICHT = { wit: '#fff4d8', rood: '#ff3b30', groen: '#34e26b', geel: '#ffd23a', blauw: '#5a8cff' };
const glim = (u, v, kleur, r) => `<circle cx="${u}" cy="${v}" r="${r * 2.6}" fill="${LICHT[kleur] ?? kleur}" opacity="0.28"/><circle cx="${u}" cy="${v}" r="${r}" fill="${LICHT[kleur] ?? kleur}"/>`;
/**
 * A picture for a question that tells of lights in words: each panel { label, dots: [[kleur, x, y]] } a bit of night
 * with the dots where the words put them (x across, -1 to 1; y up, 0 to 2).
 */
function stippen(panelen) {
  return `<div class="les-stippen">${panelen.map(({ label, dots }) => `<svg viewBox="0 0 120 84" role="img" aria-label="${label ?? 'De lichten'}">
    <rect width="120" height="84" rx="6" fill="#0b1220"/><rect y="66" width="120" height="18" fill="#132338"/>
    ${dots.map(([k, x, y]) => glim(60 + x * 34, 60 - y * 22, k, 3.6)).join('')}
    ${label ? `<text x="6" y="80" font-size="9" fill="#9fb0c8">${label}</text>` : ''}</svg>`).join('')}</div>`;
}

const schepen = (ids) => ids.map((id) => [id, LICHT_UITLEG[id]?.naam ?? cfg(id).naam]);
const onderwerp = (o) => ({ cwo: 'KB III', meer: [], ...o });

export const LICHTEN = [
  onderwerp({
    id: 'soorten', titel: 'Vier soorten lichten', nacht: true, sectoren: true, kant: 'voor',
    kort: [
      '’s Nachts, van zonsondergang tot zonsopgang, voert een schip lichten. Er zijn vier soorten: het <b>toplicht</b> (wit, naar voren over 225°), de <b>boordlichten</b> (groen aan stuurboord, rood aan bakboord, elk over 112,5°), het <b>heklicht</b> (wit, naar achteren over 135°) en het <b>rondom schijnend licht</b> (over 360°).',
      'Op het water zie je ze als waaiers rond het schip: vaar je binnen een waaier, dan zie je dat licht. Hoe groot een waaier hier is, zegt niets over hoe ver je het licht ziet.',
    ],
    schepen: schepen(['groot_motorschip', 'klein_motorschip_rondom']),
    vraag: {
      tekst: 'Je ziet een schip met een wit licht, en daaronder alleen groen. Welke kant van het schip zie je?',
      plaatje: stippen([{ dots: [['wit', 0.35, 1.6], ['groen', -0.3, 0.45]] }]),
      opties: [['De bakboordkant', false], ['De stuurboordkant', true], ['De achterkant', false]],
      uitleg: 'Groen is het boordlicht aan stuurboord. Zie je alleen groen, dan kijk je tegen de stuurboordkant aan.',
    },
  }),
  onderwerp({
    id: 'motorschip', titel: 'Een groot motorschip', nacht: true, kant: 'voor',
    kort: [
      'Een varend groot motorschip voert een <b>toplicht</b> hoog op het voorschip, <b>boordlichten</b> en een <b>heklicht</b>.',
      'Van welke kant je het ziet, zeggen de kleuren: <b>groen en rood tegelijk</b>, dan komt het recht op je af.',
    ],
    schepen: schepen(['groot_motorschip']),
    vraag: {
      tekst: 'Je ziet hoog een wit licht, en daaronder groen én rood. Wat doet het schip?',
      plaatje: stippen([{ dots: [['wit', 0, 1.7], ['groen', -0.45, 0.45], ['rood', 0.45, 0.45]] }]),
      opties: [['Het vaart van je weg', false], ['Het komt recht op je af', true], ['Het ligt stil', false]],
      uitleg: 'Groen en rood tegelijk zie je alleen recht van voren: het schip komt op je af. Ga uit de weg.',
      laat: { kant: 'voor' },
    },
  }),
  onderwerp({
    id: 'zeilschepen', titel: 'Zeilschepen en kleine schepen', nacht: true, kant: 'sb',
    kort: [
      'Een <b>groot zeilschip</b> voert boordlichten, een heklicht, en in de top van de mast een rood boven een groen rondom schijnend licht.',
      '<b>Kleine schepen</b> voeren minder: een klein zeilschip boordlichten en een heklicht, of een driekleurenlantaarn in de top. Is het korter dan 7 meter, en ook een schip op spierkracht, dan is een wit rondom schijnend licht genoeg.',
    ],
    schepen: schepen(['groot_zeilschip', 'klein_zeilschip_boeg_hek', 'klein_zeilschip_lt7m', 'klein_schip_spierkracht', 'lelievlet_zeilen', 'klein_motorschip_a']),
    vraag: {
      tekst: 'Welk licht moet een lelievlet onder zeil ’s nachts minstens laten zien?',
      opties: [['Een wit rondom schijnend licht', true], ['Een rood en een groen licht in de mast', false], ['Geen: ze is te klein', false]],
      uitleg: 'Korter dan 7 meter is een wit rondom schijnend licht genoeg; boordlichten en een heklicht mogen ook.',
      laat: { schip: 'lelievlet_zeilen' },
    },
  }),
  onderwerp({
    id: 'dagtekens', titel: 'Dagtekens', nacht: false, kant: 'sb',
    kort: [
      'Overdag zeggen <b>dagtekens</b> wat een schip doet. Een <b>zwarte kegel</b>, punt omlaag: een zeilschip dat ook zijn motor gebruikt. Een <b>zwarte bol</b>: een schip voor anker.',
      'Een <b>gele ruit</b>: een passagiersschip korter dan 20 meter. Een <b>cilinder</b>, wit-zwart-geel-zwart-wit: een sleepboot.',
    ],
    schepen: schepen(['groot_zeil_en_motor', 'klein_zeil_en_motor', 'groot_schip_geankerd', 'passagiersschip_klein', 'sleepboot']),
    vraag: {
      tekst: 'Een zeilschip voert een zwarte kegel met de punt omlaag. Wat betekent dat?',
      opties: [['Het ligt voor anker', false], ['Het vaart ook op de motor', true], ['Het sleept een ander schip', false]],
      uitleg: 'De kegel zegt: dit zeilschip gebruikt ook zijn motor. Dan geldt het als motorschip, en heeft het geen voorrang als zeilschip.',
      laat: { schip: 'groot_zeil_en_motor' },
    },
  }),
  onderwerp({
    id: 'slepen', titel: 'Slepen', nacht: true, kant: 'sb',
    kort: [
      'Een <b>sleepboot</b> trekt andere schepen voort. ’s Nachts voert hij twee toplichten boven elkaar, boordlichten en een <b>geel heklicht</b>. Overdag voert hij de cilinder; de schepen die hij sleept een gele bol.',
      'De gesleepte schepen voeren hun eigen tekens. Vaar <b>nooit tussen</b> een sleepboot en wat hij sleept door: daar loopt de sleeptros.',
    ],
    schepen: schepen(['sleepboot', 'gesleept_groot_schip', 'laatste_lengte_sleep', 'sleepboten_niet_in_kiellinie']),
    vraag: {
      tekst: 'Recht voor je zie je ’s nachts twee witte toplichten boven elkaar, met groen en rood eronder. Wat is het?',
      plaatje: stippen([{ label: 'van voren', dots: [['wit', 0, 1.75], ['wit', 0, 1.25], ['groen', -0.45, 0.4], ['rood', 0.45, 0.4]] }]),
      opties: [['Een sleepboot', true], ['Een veerpont', false], ['Een schip in nood', false]],
      uitleg: 'Twee toplichten boven elkaar: een sleepboot, die op je af komt. Kijk uit naar wat hij erachter sleept, en vaar er nooit tussendoor. Van achteren zie je zijn gele heklicht.',
      laat: { schip: 'sleepboot', kant: 'voor' },
    },
  }),
  onderwerp({
    id: 'stil', titel: 'Stilliggende schepen', nacht: true, kant: 'sb',
    kort: [
      'Een <b>klein schip</b> dat voor anker ligt, voert ’s nachts een wit rondom schijnend licht. Een <b>groot schip</b> voert er twee: één op het voorschip en een tweede op het achterschip, minstens 2 m lager. Overdag voeren ze een zwarte bol.',
      'Een groot schip dat aan de oever ligt <b>afgemeerd</b>, voert ’s nachts een wit licht aan de kant van het vaarwater.',
    ],
    schepen: schepen(['groot_schip_geankerd', 'groot_schip_gemeerd', 'klein_schip_stilliggend', 'lelievlet_geankerd']),
    vraag: {
      tekst: 'Je ankert ’s nachts met de lelievlet. Wat zet je op?',
      opties: [['Niets: ze is klein', false], ['Een wit rondom schijnend licht', true], ['Een rood licht', false]],
      uitleg: 'Een klein schip voor anker voert ’s nachts een wit rondom schijnend licht, waar het goed te zien is.',
      laat: { schip: 'lelievlet_geankerd' },
    },
  }),
  onderwerp({
    id: 'werk', titel: 'Werk, nood en duikers', nacht: false, kant: 'sb',
    kort: [
      'Een schip aan het werk laat zien aan welke kant je erlangs mag: aan die kant <b>twee groene</b> lichten of ruiten boven elkaar, aan de andere kant een <b>rood</b> licht of een rode bol. <b>Rood boven wit</b>, als licht, bord of vlag: maak geen golfslag.',
      'Wie met een vlag of licht <b>rondzwaait</b>, is in nood. De blauw-witte <b>vlag A</b>: er is een duiker te water.',
    ],
    schepen: schepen(['werkend_schip', 'werkend_schip_golfslag', 'vastgevaren_gezonken', 'bescherming_golfslag', 'nood', 'duiker']),
    vraag: {
      tekst: 'Je ziet de blauw-witte vlag A op een boot. Wat doe je?',
      opties: [['Langzaam en ruim erlangs: er is een duiker te water', true], ['Snel erlangs: hij wil voorrang', false], ['Niets bijzonders', false]],
      uitleg: 'Vlag A betekent: duiker te water. Houd ruim afstand en vaar langzaam.',
      laat: { schip: 'duiker' },
    },
  }),
  {
    id: 'verkennen', titel: 'Zelf verkennen', cwo: '', nacht: true, kant: 'voor',
    kort: [
      'Kies een schip, de kant waarvan je kijkt, en dag of nacht. Zeg eerst zelf wat het is, en kijk dan of je het goed had.',
      'Hier staan alle schepen van Zoeken, ook die de CWO niet vraagt. In Zoeken › Lichten en Dagmerken vind je ze ook.',
    ],
    meer: [], zoeken: ['lichten', 'Lichten'],
    verken: LICHT_GROEPEN.map((g) => [g, Object.entries(LICHT_UITLEG).filter(([id, u]) => u.groep === g && cfg(id))
      .map(([id, u]) => [id, `${u.naam}${cwoLicht(u.artikel) ? '' : ' (geen CWO)'}`])]).filter(([, l]) => l.length),
  },
];

export function initLichten({ sleutel, wrap, scene, camera, modes, fly, setCoveredRight, opslaan, onOpen, naarZoeken, setDark }) {
  const lk = createLesKaart({ wrap, id: 'les-lichten', sleutel, titel: 'Lichten en dagtekens', lessen: LICHTEN, store: 'lelievlet.les.lichten.v1', opslaan, fly, setCoveredRight, onOpen, naarZoeken });
  const waterline = scene.getObjectByName('lelievlet').userData.tuig?.waterlijn_m ?? 0.3;
  const holder = new THREE.Group(); holder.name = 'les-lichten'; holder.visible = false; scene.add(holder);
  // Seen from low on the water, the water has to hide what of her is under it: the viewer's own water round the boat
  // is clear and reaches 14 m (rig.js makeWater), she lies further out. So there an opaque sea, and the clear water
  // away (the boat is behind the eye then); on the sectors, seen from above, the viewer's water as it was.
  const zee = makeZee(modes, 900); holder.add(zee);
  const laag = () => holder.visible && !lk.les?.sectoren;
  const water = (op) => { zee.visible = op; if (modes?.water) modes.water.visible = !op; };
  // in the card: the map from above (the sectors) or her as seen from the water, and under it the words
  const kaart = createKaart(lk.host); const kaartSvg = lk.host.lastElementChild;
  const zicht = document.createElement('div'); zicht.className = 'les-vol les-zicht'; lk.host.append(zicht);
  const plaatje = document.createElement('div'); plaatje.className = 'les-sein les-vol'; lk.host.append(plaatje);
  const built = new Map();
  let schip = null; let kant = 'voor'; let nacht = true; let model = null; let t = 0;
  let waaiers = [];

  const bouw = (id) => { if (!built.has(id)) built.set(id, makeShip(cfg(id))); return built.get(id); };
  // her size as built, measured once: length along her, and her height over the water
  const maat = new Map();
  const meet = (m) => {
    if (!maat.has(m)) { m.position.set(0, 0, 0); m.rotation.set(0, 0, 0); m.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(m); maat.set(m, { lang: b.max.x - b.min.x, hoog: Math.max(b.max.y, 2) }); }
    return maat.get(m);
  };
  const lengte = () => (model ? meet(model).lang : 10);
  // how far out ahead of the boat she lies: on the sectors as near as fits; seen from the water so far that the camera,
  // framing her (main.js krachtView, with the card over part of the view), stands ahead of the boat's bow - the eye
  // low on the water would otherwise look through her own sail
  const raam = () => {
    const h = model ? meet(model).hoog : 6; const opzij = kant === 'sb' || kant === 'bb';
    // at least some 18 by 8 m, as the picture in the card: a roeiboot small on the water, not as big as a ship
    return { hoogte: Math.max(h * 1.25 + 2, 8), breedte: Math.max((opzij ? lengte() : lengte() * 0.5) * 1.3 + 6, 18), h };
  };
  const afstand = () => {
    const kort = Math.max(16, lengte() * 1.15);
    if (lk.les?.sectoren) return kort;
    const { hoogte, breedte } = raam(); const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    // what the card leaves of the view, as the card works it out (lessen/kaart.js covers): on a phone, a sheet, all
    const r = wrap.getBoundingClientRect(); const c = lk.card.getBoundingClientRect();
    const over = wrap.clientWidth > 900 && !lk.card.hidden ? Math.max(r.right - c.left + 8, 0) : 0;
    const vrij = Math.max(r.width - over, r.width * 0.35) / Math.max(r.width, 1);
    return Math.max(kort, Math.max(hoogte / 2 / tan, breedte / 2 / (tan * camera.aspect) / vrij) + 4);
  };
  // the sectors of her lights on the water, a fan for each, as far out as half her length (at least a few metres)
  const toonWaaiers = () => {
    for (const w of waaiers) { w.removeFromParent(); w.geometry.dispose(); w.material.dispose(); }
    waaiers = [];
    if (!lk.les.sectoren || !model) return;
    const r = Math.max(lengte() * 0.75, 7);
    model.userData.lights.forEach((l, i) => {
      const kleur = SECTOR[l.soort]; if (!kleur) return;
      const [from, to] = l.arc ?? [0, 360];
      // ARC: degrees from dead ahead, + to starboard; on the water about her +x, +z her stuurboord
      const geo = new THREE.CircleGeometry(r * (l.soort === 'heklicht' ? 0.8 : l.soort === 'toplicht' ? 1 : 0.9), 48, THREE.MathUtils.degToRad(from), THREE.MathUtils.degToRad(to - from));
      geo.rotateX(Math.PI / 2);
      const w = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: kleur, transparent: true, opacity: 0.22, depthWrite: false, side: THREE.DoubleSide }));
      w.position.set(l.rest?.x ?? l.lamp.position.x, 0.04 + i * 0.01, model.userData.axis ?? 0); w.renderOrder = 3;
      model.add(w); waaiers.push(w);
    });
  };
  // The camera sees 200 m (main.js); a long ship's fans, looked at from further off, reach beyond that and were cut
  // off by a straight line across the view, and seen from low on the water a long ship lies far out. While she is
  // out it sees as far as she and her fans go - as Zoeken does for a ship far out (bpr/zoeken.js shipView) - and
  // after that as far as it did again.
  let lens = null;
  const verZien = () => {
    if (!model || !holder.visible) {
      if (lens !== null) { camera.far = lens; camera.userData.minNear = 0; camera.updateProjectionMatrix(); lens = null; }
      return;
    }
    if (lens === null) lens = camera.far;
    const midden = new THREE.Vector3(lengte() / 2, 0, 0).applyMatrix4(model.matrixWorld);
    const far = Math.max(lens, camera.position.distanceTo(midden) + lengte() / 2 + (lk.les?.sectoren ? Math.max(lengte() * 0.75, 7) : 0) + 20);
    if (Math.abs(far - camera.far) < 1) return;
    camera.far = far; camera.userData.minNear = far > 400 ? 0.5 : 0;    // main.js keeps the near plane no nearer
    camera.updateProjectionMatrix();
  };
  // ---------------------------------------------------------------- the map from above: her and her sectors
  // Her outline from above (the hull of all her parts but the lamps), and each light's sector as a fan in its colour,
  // as on the water. In her own frame: x to the bow, z to stuurboord.
  const lampDelen = (m) => { const set = new Set(); for (const l of m.userData.lights) l.lamp.traverse((o) => set.add(o)); for (const w of waaiers) set.add(w); return set; };
  const naarHaar = new THREE.Matrix4(); const pt = new THREE.Vector3();
  // every vertex of her visible parts in her own frame, part by part: [[x, y, z], ...] per mesh, with its colour
  const delen = (m, zien) => {
    m.updateMatrixWorld(true); naarHaar.copy(m.matrixWorld).invert();
    const lamp = lampDelen(m); const uit = [];
    const zichtbaar = (o) => { for (let p = o; p && p !== m; p = p.parent) if (!p.visible) return false; return true; };
    m.traverse((o) => {
      if (!o.isMesh || lamp.has(o) || !zien(o) || !zichtbaar(o)) return;
      const pos = o.geometry.attributes.position; if (!pos) return;
      const mat = new THREE.Matrix4().multiplyMatrices(naarHaar, o.matrixWorld);
      const pts = []; const stap = Math.max(1, Math.floor(pos.count / 400));
      for (let i = 0; i < pos.count; i += stap) { pt.fromBufferAttribute(pos, i).applyMatrix4(mat); pts.push([pt.x, pt.y, pt.z]); }
      // a hull (bpr/schepen.js hull(): an extruded plan, its deck the first material, its side the second)
      const romp = o.geometry.type === 'ExtrudeGeometry';
      const kleur = Array.isArray(o.material) ? o.material[romp ? 1 : 0]?.color : o.material?.color;
      uit.push({ o, romp, pts, kleur: kleur ? `#${kleur.getHexString()}` : '#555' });
    });
    return uit;
  };
  // the convex hull of points [u, v] (monotone chain)
  const omhulsel = (ps) => {
    const p = [...ps].sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
    const x = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = []; for (const q of p) { while (lo.length >= 2 && x(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    const hi = []; for (const q of [...p].reverse()) { while (hi.length >= 2 && x(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  };
  const BEARING = { voor: 0, sb: 90, bb: -90, achter: 180 };       // where you are, from her bow (+ to stuurboord)
  let bovenaf = null; let bovenafVan = null;
  const kaartItems = () => {
    if (bovenafVan === model && bovenaf) return bovenaf;
    const items = [];
    const r = Math.max(lengte() * 0.75, 7); const axis = model.userData.axis ?? 0;
    model.userData.lights.forEach((l) => {
      const kleur = SECTOR[l.soort]; if (!kleur) return;
      const [from, to] = l.arc ?? [0, 360]; const rr = r * (l.soort === 'heklicht' ? 0.8 : l.soort === 'toplicht' ? 1 : 0.9);
      const x0 = l.rest.x; const pts = l.arc ? [[x0, axis]] : [];
      for (let a = from; a <= to + 1e-6; a += (to - from) / 32) pts.push([x0 + rr * Math.cos(THREE.MathUtils.degToRad(a)), axis + rr * Math.sin(THREE.MathUtils.degToRad(a))]);
      // a white light on the light map: a warm white with a darker edge, so that it is seen
      const wit = kleur === SECTOR.toplicht || kleur === SECTOR.heklicht;
      items.push({ type: 'vlak', pts, fill: wit ? '#fff3b066' : `${kleur}55`, stroke: wit ? '#b9a85c' : kleur });
      const mid = THREE.MathUtils.degToRad(l.arc ? (from + to) / 2 : 135);
      items.push({ type: 'tekst', at: [x0 + rr * 0.72 * Math.cos(mid), axis + rr * 0.72 * Math.sin(mid)], label: NAAM[l.soort], kleur: '#36454f', klein: true });
    });
    const romp = omhulsel(delen(model, () => true).flatMap((d) => d.pts.map(([x, , z]) => [x, z])));
    items.push({ type: 'vlak', pts: romp, fill: '#3a4656', stroke: '#11161d' });
    bovenaf = items; bovenafVan = model;
    return items;
  };
  const tekenKaart = () => {
    const ver = Math.max(lengte() * 0.75, 7) + lengte() / 2 + 2;
    kaart.draw({ frame: 'boot', wind: 0, centre: [lengte() / 2, 0], min: [ver * 2, ver * 2], titel: 'De sectoren van bovenaf', items: kaartItems() });
  };

  // ---------------------------------------------------------------- her as seen from the water
  // A sketch of her as you see her from where you are, the lights you see from there as dots: by night only those,
  // with her dark; by day her colours and dagtekens, and no lights but one that burns by day too. Each hull is drawn
  // as the kind of craft it is - a roeiboot low with a sheer and pointed ends and someone at the oars, another small
  // one with a transom and a stem, a big one long and low with its bow up - on its own measures; what is on her
  // (a wheelhouse, a mast, sails, the posts of her lights, her dagtekens) is her own parts seen flat. The scale is
  // the same for all: at least 16 m across, so a roeiboot is small and a binnenvaartschip fills it.
  const ZIJ = { voor: 'van voren', sb: 'van stuurboord', bb: 'van bakboord', achter: 'van achteren' };
  const plat = { voor: ([, y, z]) => [-z, y], achter: ([, y, z]) => [z, y], sb: ([x, y]) => [x, y], bb: ([x, y]) => [-x, y] };
  // a hull's outline in her own frame [x, y, z]: from aside (z 0) or end on (x 0), over its box b
  const rompVorm = (b, soort, opzij) => {
    const L = b.max.x - b.min.x; const top = b.max.y; const h = Math.max(top, 0.3); const onder = Math.max(b.min.y, -0.4);
    const klein = L < 15; const spits = soort === 'roei';
    const pts = [];
    if (opzij) {
      // the sheer: up to the stem, and to the stern of a small one
      const achter = klein ? (spits ? 0.4 : 0.18) * h : 0; const voor = klein ? 0.5 * h : 0.35 * h;
      const zeeg = (t) => top + (t < 0.45 ? achter * ((0.45 - t) / 0.45) ** 2 : 0) + (klein ? (t > 0.45 ? voor * ((t - 0.45) / 0.55) ** 2 : 0) : (t > 0.85 ? voor * ((t - 0.85) / 0.15) ** 2 : 0));
      const steven = klein ? 0.14 : 0.05;                                  // how far the stem rakes back to the water
      pts.push([b.min.x + (spits ? 0.12 * L : 0.015 * L), onder, 0]);
      for (let i = 0; i <= 24; i++) { const t = i / 24; pts.push([b.min.x + t * L, zeeg(t), 0]); }
      for (let i = 1; i <= 8; i++) { const t = i / 8; pts.push([b.max.x - steven * L * t * t, zeeg(1) + (onder - zeeg(1)) * Math.sin(t * Math.PI / 2), 0]); }
    } else {
      const cz = (b.min.z + b.max.z) / 2; const B = b.max.z - b.min.z;
      pts.push([0, top, cz - B / 2], [0, top + (klein ? 0.3 * h : 0.12 * h), cz], [0, top, cz + B / 2], [0, onder, cz + B * (klein ? 0.3 : 0.45)], [0, onder, cz - B * (klein ? 0.3 : 0.45)]);
    }
    return pts;
  };
  // someone at the oars of a roeiboot: a body and a head over the middle of the hull
  const roeier = (b, opzij) => {
    const top = b.max.y; const xm = (b.min.x + b.max.x) / 2; const zm = (b.min.z + b.max.z) / 2;
    const at = (d, y) => (opzij ? [xm + d, y, 0] : [0, y, zm + d]);
    const lijf = [at(-0.22, top - 0.1), at(0.22, top - 0.1), at(0.16, top + 0.62), at(-0.16, top + 0.62)];
    const hoofd = []; for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; hoofd.push(at(0.14 * Math.cos(a), top + 0.82 + 0.14 * Math.sin(a))); }
    return [lijf, hoofd];
  };
  let zichtVan = '';
  const tekenZicht = () => {
    const key = `${schip} ${kant} ${nacht} ${lk.host.clientWidth}`;
    if (key === zichtVan) return;
    zichtVan = key;
    const P = plat[kant]; const opzij = kant === 'sb' || kant === 'bb'; const soort = model.userData.config?.schip;
    const dag = new Set(model.userData.dagmerken.filter((d) => !nacht || d.nacht).flatMap((d) => { const set = []; d.shape.traverse((o) => set.push(o)); return set; }));
    const alleMerken = new Set(model.userData.dagmerken.flatMap((d) => { const set = []; d.shape.traverse((o) => set.push(o)); return set; }));
    const stukken = delen(model, (o) => !alleMerken.has(o) || dag.has(o));
    // each hull as its kind; the raised stem bpr/schepen.js puts on it (a box on its bow) is in that outline already
    const rompen = stukken.filter((d) => d.romp).map((d) => {
      const b = new THREE.Box3().setFromArray(d.pts.flat()); return { d, b, klein: b.max.x - b.min.x < 15 };
    });
    const steven = (d) => !d.romp && d.o.geometry.type === 'BoxGeometry' && rompen.some(({ b, d: r }) => r.o.parent === d.o.parent
      && d.pts.every(([x]) => x > b.min.x + 0.8 * (b.max.x - b.min.x)) && d.pts.every(([, y]) => y > b.max.y - 0.4));
    // far parts first, the near ones over them
    const naar = { voor: [1, 0, 0], achter: [-1, 0, 0], sb: [0, 0, 1], bb: [0, 0, -1] }[kant];
    const diep = (pts) => Math.max(...pts.map((q) => q[0] * naar[0] + q[2] * naar[2]));
    const vormen = [];
    for (const d of stukken) {
      if (steven(d)) continue;
      const r = d.romp && rompen.find((x) => x.d === d);
      if (r) {
        vormen.push({ pts: rompVorm(r.b, r.klein && soort === 'roei' ? 'roei' : soort, opzij).map(P), kleur: d.kleur, diep: diep(d.pts) + 0.01 });
        if (r.klein && /roei/i.test(soort)) for (const deel of roeier(r.b, opzij)) vormen.push({ pts: deel.map(P), kleur: '#3b4a5c', diep: diep(d.pts) + 0.02 });
      } else vormen.push({ pts: omhulsel(d.pts.map(P)), kleur: d.kleur, diep: diep(d.pts), merk: alleMerken.has(d.o) });
    }
    vormen.sort((a, b) => a.diep - b.diep);
    // the lights seen from there: lit by night (a flikkerlicht by day too), and inside their arc
    const b = BEARING[kant];
    const lichten = model.userData.lights.filter((l) => {
      if (!nacht && !l.byDay) return false;
      if (!l.arc) return true;
      const [from, to] = l.arc; const bb = to > 180 ? (b + 360) % 360 : b;
      return bb >= from && bb <= to;
    }).filter((l) => !l.facultatief).map((l) => {
      l.lamp.updateMatrixWorld(true); const w = l.lamp.getWorldPosition(new THREE.Vector3()).applyMatrix4(naarHaar);
      return { at: P([w.x, w.y, w.z]), kleur: l.kleur, diep: w.x * naar[0] + w.z * naar[2] };
    }).sort((p, q) => p.diep - q.diep);                                   // far ones first, the near ones over them
    const all = vormen.flatMap((v) => v.pts).concat(lichten.map((l) => l.at));
    const us = all.map((q) => q[0]); const vs = all.map((q) => q[1]);
    const u0 = Math.min(...us); const u1 = Math.max(...us); const v1 = Math.max(...vs);
    // one scale for all: at least 16 m across and 7 m up, her middle in the middle, the water a little way up
    const W = 320; const breed = Math.max((u1 - u0) * 1.06 + 3, 16); const hoog = Math.max(v1 + 2.2, 7);
    const H = Math.round(Math.min(210, Math.max(120, W * hoog / breed)));
    const k = Math.min(W / breed, (H - 20) / hoog); const cu = (u0 + u1) / 2;   // (the water takes the lowest 20 px)
    // a dagteken small on a big ship stays readable: drawn at least MERK px, about its own middle
    const MERK = 11;
    for (const v of vormen) {
      if (!v.merk || v.pts.length < 2) continue;
      const vu = v.pts.map((q) => q[0]); const vv = v.pts.map((q) => q[1]);
      const groot = Math.max(Math.max(...vu) - Math.min(...vu), Math.max(...vv) - Math.min(...vv)) * k;
      if (groot >= MERK || groot <= 0) continue;
      const f = MERK / groot; const mu = (Math.max(...vu) + Math.min(...vu)) / 2; const mv = (Math.max(...vv) + Math.min(...vv)) / 2;
      v.pts = v.pts.map(([u, w]) => [mu + (u - mu) * f, mv + (w - mv) * f]);
    }
    // two lights that land on one spot (one behind the other, as a red and a green rondom of a werkend schip from
    // aside): the one behind a little aside, so both are seen and the near one is over it
    const gezet = [];
    for (const l of [...lichten].reverse()) {                            // the near one stays, the one behind moves
      let [u, w] = l.at;
      for (let i = 0; i < 4 && gezet.some(([a, b]) => Math.hypot((a - u) * k, (b - w) * k) < 6); i++) u += 7 / k;
      gezet.push([u, w]); l.at = [u, w];
    }
    const X = (u) => (W / 2 + (u - cu) * k).toFixed(1); const Y = (v) => (H - 20 - v * k).toFixed(1);
    const lucht = nacht ? '#0b1220' : '#e3eef5'; const water = nacht ? '#132338' : '#9fbcd0';
    const kleur = (c) => (nacht ? '#202b3b' : c);
    zicht.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Het schip ${ZIJ[kant]}">
      <rect width="${W}" height="${H}" fill="${lucht}"/>
      ${vormen.map((v) => `<polygon points="${v.pts.map(([u, w]) => `${X(u)},${Y(w)}`).join(' ')}" fill="${kleur(v.kleur)}" stroke="${kleur(v.kleur)}" stroke-width="1" stroke-linejoin="round"/>`).join('')}
      <rect x="0" y="${Y(0)}" width="${W}" height="${(H - Number(Y(0))).toFixed(1)}" fill="${water}"/>
      ${lichten.map((l) => glim(X(l.at[0]), Y(l.at[1]), l.kleur, 3.2)).join('')}
      <text x="8" y="${H - 6}" font-size="11" fill="${nacht ? '#9fb0c8' : '#36454f'}">Je ziet het ${ZIJ[kant]}</text></svg>`;
  };
  // which picture the card has: the map on the sectors, else her from the water
  const toonBeeld = () => {
    const sectoren = Boolean(lk.les.sectoren);
    kaartSvg.style.display = sectoren ? '' : 'none'; zicht.hidden = sectoren;
    if (!lk.bladOpen || !model) return;
    if (sectoren) tekenKaart(); else tekenZicht();
  };

  const zet = (id) => {
    schip = id; zichtVan = '';
    if (model) model.removeFromParent();
    model = bouw(id); holder.add(model);
    toonWaaiers(); toonPlaatje(); lk.renderControls(); lk.frame();
  };
  const toonPlaatje = () => {
    const u = LICHT_UITLEG[schip];
    if (lk.les.sectoren) {
      plaatje.innerHTML = `<table class="les-tabel"><thead><tr><th>Licht</th><th>Kleur</th><th>Te zien over</th></tr></thead><tbody>
        <tr><td>Toplicht</td><td>wit</td><td>225°, naar voren</td></tr><tr><td>Boordlichten</td><td>groen (sb), rood (bb)</td><td>elk 112,5°</td></tr>
        <tr><td>Heklicht</td><td>wit</td><td>135°, naar achteren</td></tr><tr><td>Rondom schijnend</td><td>wit, of een kleur</td><td>360°</td></tr></tbody></table>`;
      return;
    }
    plaatje.innerHTML = `<p><b>${u?.naam ?? cfg(schip).naam}</b></p><p class="hint">${nacht ? u?.lichten ?? '' : u?.dagmerk ?? 'Overdag voert dit schip geen dagteken.'}</p>`;
  };
  const kijk = () => {
    const d = afstand(); const h = model ? meet(model).hoog : 6;
    if (lk.les.sectoren) return { hoogte: lengte() * 1.4 + 8, breedte: lengte() * 2.2 + 10, doel: [C + d, 0, 0], richting: [-0.45, 1, 0.55] };
    // from ahead or astern straight along her line, so both boordlichten (or the heklicht) show; from aside a little
    // off it - and from low on the water, at the eye of someone in a small boat: 2 m over the waterline
    const opzij = kant === 'sb' || kant === 'bb'; const { hoogte, breedte } = raam();
    return { hoogte, breedte, doel: [C + d, h * 0.45, 0], richting: [-1, 0.2, opzij ? 0.12 : 0], oog: waterline + 2 };
  };

  lk.koppel({
    begin(l) {
      holder.visible = true;
      kant = l.kant ?? 'voor'; nacht = l.nacht ?? true; setDark?.(nacht ? 1 : 0);
      zet(l.schepen ? l.schepen[0][0] : l.verken[0][1][0][0]);
      const rows = [];
      if (l.verken) rows.push(keuze('Schip', l.verken, () => schip, zet));
      else if (l.schepen.length > 1) rows.push(kies('Schip', l.schepen, () => schip, zet));
      // where you look from: not on the sectors, which lie round her whatever side you are on
      if (!l.sectoren) rows.push(segmented('Je ziet het van', KANTEN, () => kant, (v) => { kant = v; lk.renderControls(); lk.frame(); }));
      // day or night: not on the sectors either, which are of the lights, by night
      if (!l.sectoren) rows.push(segmented('Tijd', [[false, 'Dag'], [true, 'Nacht']], () => nacht, (v) => { nacht = v; setDark?.(v ? 1 : 0); toonPlaatje(); lk.renderControls(); }));
      return rows;
    },
    antwoord(laat) {
      if (laat.kant) { kant = laat.kant; lk.renderControls(); lk.frame(); }
      if (laat.schip) zet(laat.schip);
    },
    release() { holder.visible = false; verZien(); water(false); setDark?.(null); },
    aanzicht: kijk,
  });

  function update(dt, width) {
    if (!lk.tick(width)) return;
    t += dt;
    if (model) {
      model.rotation.y = DRAAI[kant];
      // her middle out ahead of the boat, on the line you look along
      const mid = lengte() / 2; const d = afstand();
      model.position.set(C + d - Math.cos(DRAAI[kant]) * mid, waterline, Math.sin(DRAAI[kant]) * mid);
      model.userData.update?.(t, nacht ? 1 : 0, camera);
      // the second white light a small boat shows only when a collision threatens (a zaklamp): not here, where the
      // words say one light
      for (const l of model.userData.lights) if (l.facultatief) l.lamp.visible = false;
    }
    verZien();
    water(laag());
    toonBeeld();
    const u = LICHT_UITLEG[schip];
    // on the sectors what her lights are, with nothing to warn of: the page is about the four kinds of light
    if (lk.les.sectoren) lk.status(u?.lichten ?? '');
    else lk.status(u ? `${u.betekenis}${lk.les.verken && u.lelievlet ? ` ${u.lelievlet}` : ''}` : '', schip?.startsWith('lelievlet') ? '' : ernst(u?.betekenis));   // her own lights: nothing to warn of
  }

  return { update, open: lk.open, close: lk.close, onderwerpen: LICHTEN,
           dispose: () => { lk.dispose(); kaart.dispose(); holder.removeFromParent(); } };
}
