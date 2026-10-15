import * as THREE from 'three';
import { solve, BFT, TRIM, boatSpeed, heeled, BERGHOUT_ONDER, HELLING_FLINK, HELM_MOST, WATER_VOL } from './model.js';
import { LESSEN } from './lessen.js';
import { createPijlen } from './pijlen.js';
import { createSchema } from './schema.js';
import { createVlag } from './vlag.js';
import { voortgang } from '../lessen/voortgang.js';
import { gevolg } from '../logboek.js';
import { GREEP, MEER, VOET, TERUG, lesVoet, veeg, breedKnop } from '../lessen/kaart.js';
import { stroomlijnen, profiel } from './stroming.js';

// Krachten en koppels: a card of short lessons that draws the forces on the boat - as arrows on the
// 3D boat and as a schema in the card, the way the lesboeken draw them - while the boat itself sails,
// heels and steers as they say. Opened from Leren › Lessen (main.js), or at once with `?krachten` in the
// address.
//
// The model (model.js) gets what it needs from the boat as it stands in the viewer: where the cloth
// of each sail is and how it is sheeted, how far the zwaard sticks out. The card sets the rest -
// course, schoten, zwaard, wind, bemanning, helmstok - and the boat follows (modes.js `kracht`).

const KLEUR = {
  lucht: '#1b64c4', water: '#c0262d', koppel: '#16833a', koppelSom: '#11552a', duw: '#26323c', maat: '#36454f', spoor: '#6b7a88',
  ware: '#4c5a68', vaart: '#c96f00', schijnbaar: '#00808c', zwaarte: '#6a3fa0', opwaarts: '#0a7da3',
};
const FORCE = 1 / 170;              // metres of arrow per newton
const FORCE_MAX = 3.0;              // the longest arrow; beyond it all forces are drawn smaller together
const WIND = 0.6;                   // metres of arrow per m/s
const PUSH = 220;                   // N: the hand in Kracht en koppel
const MAST = [3.624, 5.78, 0];      // just over the windvaan
const STORE = 'lelievlet.krachten.v1';
const ROMP = ['romp'];              // drawn in the schema's close-up of the hull, when it has one
const ROMP_BOOT = ['romp', 'boot']; // there, and on the boat as well
const KENTER = 2200;                // Nm: half a turn for the koppels of helling, kenterend and oprichtend
const HELLING_VOL = 3000;          // Nm: a full half-bar in the balans of helling (about 6 Bft aan de wind)
const OMSLAAN_NA = 0.8;             // s: going over has to hold this long - a sail still being trimmed is no capsize
// water scheppen: past this helling the dolboord is at the water and it comes in; going over, she first lies there,
// schepping, for a while - time to do something - before she goes
const SCHEP = 22;                   // degrees
const SCHEP_HELLING = 28;           // degrees: how far she lies while she schept, going over
const SCHEP_TIJD = 3.5;             // s
const HOZEN = 0.035;                // of the water she can hold, per second: the crew hozing her dry
const KLAP_TIJD = 0.45;             // s: a klapgijp, the giek over and her thrown to the new lij with it
const GIJP_LOS = 25;                // degrees: with the giek out further than this a gijp is a klapgijp
const KLAP = {
  om: 'Klapgijp! De wind kwam van de verkeerde kant in het zeil, en met de grootschoot los sloeg de giek in één klap over. In deze wind was dat te veel: de boot slaat om. Gijp gecontroleerd, met de grootschoot eerst binnen. Bij harde wind gijp je liever niet: maak een stormrondje.',
  op: 'Klapgijp! De wind kwam van de verkeerde kant in het zeil, en met de grootschoot los sloeg de giek in één klap over. De boot loefde hard op. Gijp daarom gecontroleerd: eerst de grootschoot binnen, dan de giek over, dan weer vieren.',
  goed: 'Gegijpt: met de grootschoot binnen ging de giek gecontroleerd over; je vaart nu over de andere boeg. Vier de schoot nu weer.',
};
const SHEET = 900;                  // px: up to this wide the card is a sheet at the foot (style.css @container)
// course names along the slider, as modes.js has them
const KOERS = [[70, 'Aan de wind'], [112, 'Halve wind'], [158, 'Ruime wind'], [181, 'Voor de wind']];
const koersNaam = (c) => KOERS.find(([b]) => (c > 180 ? 360 - c : c) < b)[1];   // past 180: voor de wind, on the other boeg
// what Zelf verkennen can switch on: chip -> the items it draws
const LAGEN = [
  ['Zeilkracht', ['zeilkracht', 'ontbonden', 'zp']], ['Per zeil', ['perzeil']], ['Stroming', ['stroom', 'druk']], ['Water', ['drift', 'weerstand', 'lp', 'koersdoorwater']],
  // gieren with the roer that answers it: what the sails turn her, and what holds her straight
  ['Gieren', ['zeilkoppels', 'samenkoppel', 'lp', 'helmstok', 'roer', 'roerdelen']], ['Wind', ['wind']],
  ['Helling', ['zijkracht', 'drift', 'zp', 'lp', 'kenterend', 'oprichtend', 'zwaartepunt', 'drukpunt', 'armstab']],
];
// where Zelf verkennen looks from: the schema always from above and astern, whatever is on; the camera from
// astern with Helling on, as lessons 5 and 6 do, else wherever it was
const VERKEN = { schema: () => ['boven', 'achter'], aanzicht: (helling) => (helling ? 'achterboven' : null) };

/** The convex hull of points [u, v], round the outside (monotone chain). */
function hull2(points) {
  const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list) => {
    const out = [];
    for (const q of list) { while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], q) <= 0) out.pop(); out.push(q); }
    return out.slice(0, -1);
  };
  return [...half(p), ...half(p.slice().reverse())];
}

export function initKrachten({ wrap, scene, camera, controls, parts, modes, fly, setCoveredRight, opslaan, onOpen }) {
  const byId = new Map(parts.map((p) => [p.extras.id, p]));
  let boat = scene.getObjectByName('lelievlet');
  while (boat.parent && boat.parent !== scene) boat = boat.parent;

  // ------------------------------------------------------------------ the boat as it stands
  const tmp = new THREE.Vector3(); const ta = new THREE.Vector3(); const tb = new THREE.Vector3(); const tc = new THREE.Vector3();
  const toBoat = (v) => boat.worldToLocal(v);
  /** The middle of a sail's cloth, area-weighted, in the boat's frame. */
  const td = new THREE.Vector3(); const local = new THREE.Vector3(); const n3 = new THREE.Matrix3();
  const clothCentre = (id) => {
    const seen = new Set(); let area = 0; const sum = new THREE.Vector3();
    for (const mesh of byId.get(id)?.meshes ?? []) {
      const g = mesh.geometry; if (seen.has(g)) continue; seen.add(g);
      mesh.updateWorldMatrix(true, false);
      const pos = g.attributes.position; const index = g.index;
      const n = index ? index.count : pos.count;
      let a = 0; local.set(0, 0, 0);
      for (let i = 0; i < n; i += 3) {
        const i0 = index ? index.getX(i) : i; const i1 = index ? index.getX(i + 1) : i + 1; const i2 = index ? index.getX(i + 2) : i + 2;
        ta.fromBufferAttribute(pos, i0); tb.fromBufferAttribute(pos, i1); tc.fromBufferAttribute(pos, i2);
        tmp.subVectors(tb, ta).cross(td.subVectors(tc, ta)); const t = tmp.length() / 2;
        local.addScaledVector(ta.add(tb).add(tc), t / 3); a += t;
      }
      if (a <= 0) continue;
      const scale = Math.cbrt(Math.abs(n3.setFromMatrix4(mesh.matrixWorld).determinant())) ** 2;
      // the mean of the cloth in its own frame, taken to the world (a sail is not scaled unevenly)
      local.divideScalar(a).applyMatrix4(mesh.matrixWorld);
      const w = a * scale;
      sum.addScaledVector(local, w); area += w;
    }
    return area > 0 ? toBoat(sum.divideScalar(area)) : null;
  };
  /** A point of the model: the middle of a (small) part, in the world. */
  const partAt = (id, out = new THREE.Vector3()) => {
    out.set(0, 0, 0); let n = 0;
    for (const mesh of byId.get(id)?.meshes ?? []) {
      mesh.updateWorldMatrix(true, false);
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 2) { out.add(tmp.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld)); n++; }
    }
    return n ? out.divideScalar(n) : null;
  };
  // ------------------------------------------------------------------ water in the boat
  // The kuip from the achterschot to the voorschot, measured once from the inside of the hull: per station its
  // half-width at each height. The water is drawn as its level surface - level in the world, however she heels -
  // from where that meets the hull on one side to where it meets it on the other.
  const kuipWater = (() => {
    const model = scene.getObjectByName('lelievlet');
    const skin = parts.filter((p) => /^(kim|vlak|boeisel)_/.test(p.extras.id)).flatMap((p) => p.meshes).filter((m) => m.material.name === 'kuip');
    const STATIONS = Array.from({ length: 14 }, (_, i) => 1.36 + (i * (3.97 - 1.36)) / 13);
    const DY = 0.05; const ROWS = 20; const FLOOR = 0.04; const TOP = 0.9;
    const wide = STATIONS.map(() => new Array(ROWS).fill(0));
    model.updateWorldMatrix(true, false);
    const inv = model.matrixWorld.clone().invert(); const m4 = new THREE.Matrix4(); const v = new THREE.Vector3();
    for (const mesh of skin) {
      mesh.updateWorldMatrix(true, false); m4.multiplyMatrices(inv, mesh.matrixWorld);
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).applyMatrix4(m4);
        const j = Math.round(v.y / DY); if (j < 0 || j >= ROWS) continue;
        STATIONS.forEach((x, k) => { if (Math.abs(v.x - x) < 0.07) wide[k][j] = Math.max(wide[k][j], Math.abs(v.z)); });
      }
    }
    for (const w of wide) for (let j = 1; j < ROWS; j++) if (!w[j]) w[j] = w[j - 1];   // a height with no vertex: as below
    const halfWidth = (w, y) => { const f = THREE.MathUtils.clamp(y / DY, 0, ROWS - 1); const j = Math.floor(f); return w[j] + (w[Math.min(j + 1, ROWS - 1)] - w[j]) * (f - j); };
    const position = new Float32Array((STATIONS.length - 1) * 6 * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(position.length), 3));
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x3f8db8, emissive: 0x0d3550, transparent: true, opacity: 0.78,
      roughness: 0.3, metalness: 0, side: THREE.DoubleSide, depthWrite: false }));
    mesh.frustumCulled = false; mesh.renderOrder = 3; mesh.visible = false; mesh.raycast = () => {};
    model.add(mesh);
    const q = new THREE.Quaternion(); const up = new THREE.Vector3();
    const ends = STATIONS.map(() => [0, 0, 0, 0, false]);
    return {
      hide() { mesh.visible = false; },
      dispose() { mesh.removeFromParent(); geometry.dispose(); mesh.material.dispose(); },
      /** fill: 0 dry .. 1 as much as she holds; on: only where she heels. */
      set(fill, on) {
        mesh.visible = on && fill > 0.005;
        if (!mesh.visible) return;
        // the world's up in the boat's frame: across her (y, z) - she heels about her length
        up.set(0, 1, 0).applyQuaternion(model.getWorldQuaternion(q).invert());
        const n = Math.hypot(up.y, up.z); const uy = up.y / n; const uz = up.z / n;
        let low = Infinity;
        for (const w of wide) for (let j = 1; j < ROWS; j++) for (const z of [-w[j], w[j]]) low = Math.min(low, j * DY * uy + z * uz);
        const c = low + 0.24 + 0.45 * fill;                          // over the buikdenning at once, then up to the dolboord
        wide.forEach((w, k) => {
          let a = null; let b = null;
          for (let t = -1.2; t <= 1.2; t += 0.02) {
            const y = c * uy - t * uz; const z = c * uz + t * uy;
            if (y >= FLOOR && y <= TOP && Math.abs(z) <= halfWidth(w, y)) { if (a === null) a = t; b = t; }
          }
          const e = ends[k]; e[4] = a !== null;
          if (e[4]) { e[0] = c * uy - a * uz; e[1] = c * uz + a * uy; e[2] = c * uy - b * uz; e[3] = c * uz + b * uy; }
        });
        let i = 0;
        const put = (x, y, z) => { position[i++] = x; position[i++] = y; position[i++] = z; };
        for (let k = 0; k + 1 < STATIONS.length; k++) {
          const p = ends[k]; const q2 = ends[k + 1];
          if (!p[4] || !q2[4]) continue;
          const x0 = STATIONS[k]; const x1 = STATIONS[k + 1];
          put(x0, p[0], p[1]); put(x1, q2[0], q2[1]); put(x0, p[2], p[3]);
          put(x0, p[2], p[3]); put(x1, q2[0], q2[1]); put(x1, q2[2], q2[3]);
        }
        const normal = geometry.attributes.normal.array;
        for (let j = 0; j < i; j += 3) { normal[j] = 0; normal[j + 1] = uy; normal[j + 2] = uz; }
        geometry.setDrawRange(0, i / 3);
        geometry.attributes.position.needsUpdate = true; geometry.attributes.normal.needsUpdate = true;
      },
    };
  })();

  const SAILS = [
    { naam: 'grootzeil', area: 8.15, hoeken: ['grootzeil_halshoek', 'grootzeil_klauwhoek', 'grootzeil_tophoek', 'grootzeil_schoothoek'] },
    { naam: 'fok', area: 4.0, hoeken: ['fok_halshoek', 'fok_tophoek', 'fok_schoothoek'] },
  ];
  // (corners in the boat's frame, as all else measured here: drawn later in the world as she stands then)
  const measureSails = (rif) => SAILS.map((s) => {
    const corners = s.hoeken.map((id) => toBoat(partAt(id)));
    const hals = corners[0]; const schoot = corners[corners.length - 1];
    // (the cloth wound on the giek with a rif is pressed flat in the model: it adds nothing to the middle)
    const mid = clothCentre(s.naam) ?? hals.clone().lerp(schoot, 0.5);
    // a rif: the voorlijk shorter by what is wound on the giek, and the sail as much smaller
    const wound = s.naam === 'grootzeil' ? Math.min(Math.max(rif.zakt / rif.voorlijk, 0), 0.8) : 0;
    return { naam: s.naam, area: s.area * (1 - wound), point: mid.toArray(), chord: [schoot.x - hals.x, schoot.z - hals.z], corners };
  });
  /** What of the zwaard sticks out under the vlak, in the boat's frame. */
  const measureBoard = () => {
    let n = 0; let sx = 0; let sy = 0; let low = 0; let fore = -Infinity; let aft = Infinity;
    for (const mesh of byId.get('zwaard')?.meshes ?? []) {
      mesh.updateWorldMatrix(true, false);
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 3) {
        toBoat(tmp.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld));
        if (tmp.y < 0) { n++; sx += tmp.x; sy += tmp.y; low = Math.min(low, tmp.y); fore = Math.max(fore, tmp.x); aft = Math.min(aft, tmp.x); }
      }
    }
    return n ? { x: sx / n, y: sy / n, depth: -low, fore, aft } : null;
  };
  // Measured again only when the giek, the fok, the rif or the zwaard has moved: walking every triangle
  // of the cloth each frame for the same answer is work for nothing. (In the boat's own frame, so her
  // heel and the swell do not change it.) A change shows in the meshes a frame later, when modes.js has
  // shaped them: so for a few frames after one it is measured each frame.
  const SETTLE = 3;
  let sailsKey = ''; let sailsNow = null; let sailsSettle = 0; let boardKey = ''; let boardNow = null; let boardSettle = 0;
  const readSails = (rif) => {
    const t = modes.trim(); const key = `${t.boom.toFixed(2)} ${t.jib.toFixed(2)} ${rif.slagen.toFixed(3)}`;
    if (key !== sailsKey || !sailsNow) { sailsKey = key; sailsSettle = SETTLE; }
    if (sailsSettle > 0) { sailsSettle--; sailsNow = measureSails(rif); }
    return sailsNow;
  };
  const readBoard = () => {
    const key = String(modes.trim().board);
    if (key !== boardKey) { boardKey = key; boardSettle = SETTLE; }
    if (boardSettle > 0) { boardSettle--; boardNow = measureBoard(); }
    return boardNow;
  };
  // outlines for the schema, once, in the boat's frame: the deck edge from above, the hull from astern
  const outline = (() => {
    const ids = parts.map((p) => p.extras.id).filter((id) => /^(boeisel|berghout|vlak|spiegel|scheg)/.test(id));
    const top = new Map(); const side = new Map();
    for (const id of ids) {
      for (const mesh of byId.get(id).meshes) {
        mesh.updateWorldMatrix(true, false);
        const pos = mesh.geometry.attributes.position;
        for (let i = 0; i < pos.count; i += 2) {
          toBoat(tmp.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld));
          const bx = Math.round(tmp.x * 10); const by = Math.round(tmp.y * 20);
          top.set(bx, Math.max(top.get(bx) ?? 0, Math.abs(tmp.z)));
          side.set(by, Math.max(side.get(by) ?? 0, Math.abs(tmp.z)));
        }
      }
    }
    const xs = [...top.keys()].sort((a, b) => a - b); const ys = [...side.keys()].sort((a, b) => a - b);
    const deck = [...xs.map((x) => [x / 10, 0.95, top.get(x)]), ...xs.slice().reverse().map((x) => [x / 10, 0.95, -top.get(x)])];
    const section = hull2([...ys.flatMap((y) => [[side.get(y), y / 20], [-side.get(y), y / 20]])]).map(([z, y]) => [2.8, y, z]);
    return { deck, section };
  })();

  // ------------------------------------------------------------------ the card

  const card = document.createElement('aside');
  card.id = 'krachten'; card.hidden = true;
  card.innerHTML = `
    ${GREEP}
    <header><h2>Krachten en koppels</h2><span><button type="button" class="link-button kr-breed-knop" aria-pressed="false">Breed</button><button type="button" class="link-button kr-sluit" aria-label="Sluiten">Sluiten</button></span></header>
    <div class="kr-nav">
      <button type="button" class="kr-vorige" aria-label="Vorige">‹</button>
      <select class="kr-lessen" aria-label="Onderwerp">${LESSEN.map((l, i) => `<option value="${i}">${i + 1}. ${l.titel}</option>`).join('')}</select>
      <button type="button" class="kr-volgende" aria-label="Volgende">›</button>
    </div>
    <div class="kr-lijf">
      <div class="kr-links">
        <div class="kr-schema-host"></div>
        <div class="kr-balansen"></div>
      </div>
      <div class="kr-rechts">
        <div class="kr-tekst"></div>
        <div class="kr-bediening"></div>
        <p class="kr-status" aria-live="polite"></p>
        <div class="kr-vraag"></div>
        ${MEER}
      </div>
    </div>
    ${VOET}
`;
  wrap.append(card);
  // on a phone the card covers the boat: its greep drags it down, and this bar brings it back (lessen/kaart.js veeg)
  const back = document.createElement('div');
  back.className = 'kr-terug'; back.hidden = true;
  back.innerHTML = TERUG;
  wrap.append(back);
  const layer = document.createElement('div'); layer.className = 'kr-labels'; wrap.append(layer);
  const q = (sel) => card.querySelector(sel);

  const pijlen = createPijlen({ scene, camera, controls, layer });
  const schema = createSchema(q('.kr-schema-host'));
  const vlag = createVlag(scene);
  const VLAG_AT = [1.2, 0.3, 3.2];                      // the boei: beside her stern, on the loef side (z by side)
  let vlagTijd = 0;

  // ------------------------------------------------------------------ state
  const saved = (() => { if (!opslaan) return {}; try { return JSON.parse(localStorage.getItem(STORE) ?? '{}') ?? {}; } catch { return {}; } })();
  const save = () => { if (!opslaan) return; try { localStorage.setItem(STORE, JSON.stringify({ les: lesIndex })); } catch { /* private mode */ } };
  let lesIndex = Number.isInteger(saved.les) && LESSEN[saved.les] ? saved.les : 0;
  // on a big screen the card can be opened wide, for a bigger schema beside the words: one choice for all lessons
  const breed = breedKnop(card, opslaan, () => requestAnimationFrame(frame));
  const DEFAULT = { koers: 90, groot: 'goed', fok: 'goed', zwaard: 'neer', bft: 3, vaart: 1, vlaag: false, bemanning: 0, helmstok: 0, roerstand: 'recht', duw: 4.9 };
  let s = { ...DEFAULT };
  const lagen = new Set(['Zeilkracht', 'Water']);
  let open = false;
  let answered = false;
  let shownTheta = 0;                                   // the heel drawn: it eases to what the model says
  let shownCourse = null;                               // the course the forces are worked out on: it eases to the boat's,
                                                        // so a step on the slider turns them, not throws them
  let lastStatus = ''; let lastNiveau = '';
  let omslaanTijd = 0;
  let klapOm = 0;                                       // s: a klapgijp threw her over - she lies there this much longer
  let wasOm = false;
  let water = 0;                                        // in the boat: 0 dry .. 1 as much as she holds (model.js WATER_VOL)
  let schepte = false;
  let opstaan = 0;                                      // s: she is coming back up after going over
  let gijp = null;                                      // a gijp under way: { t, klap, gegooid }
  let melding = null;                                   // what a gijp brought about, said for a while: { tekst, niveau, t, tot }
  let lastMain = 0;                                     // degrees the giek was out last frame
  // the side the koers slider counts from: past 180 the wind is over the other side - voor de wind on the other
  // boeg, the giek gone over (a gijp). Let go of the slider and it counts from the side she is on.
  let boeg = 1;
  let schemaDue = 0;
  let verkenAanzicht = null;                             // where Zelf verkennen last sent the camera
  let trim = null;                                      // Zo trim je, under way: { t }
  const les = () => LESSEN[lesIndex];

  // ------------------------------------------------------------------ the boat follows the card
  const side = () => Math.sign(modes.state.course) || 1;
  const courseNow = () => Math.abs(modes.state.course) || 90;
  const koersOp = (k) => (k <= 180 ? boeg * k : -boeg * (360 - k));
  const setBoat = (want) => {
    const go = {};
    if (want.koers !== undefined) go.koers = koersOp(want.koers);
    if (want.zwaard !== undefined || want.koers !== undefined) go.zwaard = s.zwaard;   // a course trims the zwaard itself: ours goes after it
    if (Object.keys(go).length) modes.apply(go);
  };
  // a rif set at once - unless the boat is being reefed just now: then the card shows what she has
  const zetRif = (n) => { if (!modes.zetRif(n)) s.rif = Math.round(modes.rif().slagen); };
  let rifBijOpenen = 0;                                 // the rif she had: given back when the card closes
  let lijnBijOpenen = null;                             // a line she lay on: let go, and made fast again when it closes
  const set = (want) => {
    // past voor de wind, or back: the wind comes in the sail from the other side and the giek goes over
    if ('koers' in want && (want.koers > 180) !== (s.koers > 180)) {
      // with the grootschoot te strak the giek is held in, whatever the wind lets it out to: a gijp, not a klap
      gijp = { t: 0, klap: lastMain > GIJP_LOS && s.groot !== 'strak', gegooid: false };
      if (gijp.klap) gevolg('klapgijp');
    }
    Object.assign(s, want);
    if ('koers' in want || 'zwaard' in want) setBoat(want);
    if ('rif' in want) zetRif(s.rif);
    renderControls();
  };

  // ------------------------------------------------------------------ controls
  const segmented = (label, key, options) => {
    const row = document.createElement('div'); row.className = 'kr-rij';
    row.innerHTML = `<span>${label}</span><div class="segmented" role="radiogroup" aria-label="${label}">${options.map(([v, t]) => `<button type="button" role="radio" data-v="${v}">${t}</button>`).join('')}</div>`;
    row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
      const raw = b.dataset.v; set({ [key]: Number.isNaN(Number(raw)) ? raw : Number(raw) });
    }));
    row.sync = () => row.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(String(s[key]) === b.dataset.v)));
    return row;
  };
  const slider = (label, key, min, max, step, says, ends) => {
    const row = document.createElement('label'); row.className = 'kr-rij kr-schuif';
    row.innerHTML = `<span>${label} <b></b></span><input type="range" min="${min}" max="${max}" step="${step}">${ends ? `<small><i>${ends[0]}</i><i>${ends[1]}</i></small>` : ''}`;
    const input = row.querySelector('input'); const value = row.querySelector('b');
    input.addEventListener('input', () => set({ [key]: Number(input.value) }));
    row.sync = () => { if (Number(input.value) !== s[key]) input.value = String(s[key]); value.textContent = says(s[key]); };
    return row;
  };
  // A slider with a mark, for Zelf verkennen: a scale that stays put, and over it a mark where the setting
  // the boat wants is - "goed" for a sheet, "recht" for the helmstok - which moves with the wind and the
  // course. Let go on the mark (or near it) and the setting is that word: it then moves along with the mark.
  const SNAP = 3;                                                    // degrees either side of the mark
  const merkSchuif = ({ label, key, min, max, woord, ends, merk, zegt }) => {
    const row = document.createElement('label'); row.className = 'kr-rij kr-schuif kr-merk';
    row.innerHTML = `<span>${label} <b></b></span><div class="kr-baan"><input type="range" min="${min}" max="${max}" step="1"><i class="kr-goed" aria-hidden="true">${woord}</i></div><small><i>${ends[0]}</i><i>${ends[1]}</i></small>`;
    const input = row.querySelector('input'); const value = row.querySelector('b'); const mark = row.querySelector('.kr-goed');
    let op = (min + max) / 2;                                        // where the mark stands
    input.addEventListener('change', () => row.sync());
    const at = () => (s[key] === woord ? op : s[key]);
    input.addEventListener('input', () => {
      const v = Number(input.value);
      set({ [key]: Math.abs(v - op) <= SNAP ? woord : v });
    });
    row.sync = () => {
      // while it is held the thumb is the finger's, not set from here
      const v = Math.round(at()); if (!input.matches(':active') && Number(input.value) !== v) input.value = String(v);
      value.textContent = s[key] === woord || Math.abs(at() - op) <= SNAP ? woord : zegt(at(), at() - op);
    };
    // every frame, with what the model says: where the mark is now
    row.tick = (ctx) => {
      op = THREE.MathUtils.clamp(merk(ctx), min, max);
      mark.style.left = `calc(8px + (100% - 16px) * ${(op - min) / (max - min)})`;
      row.sync();
    };
    return row;
  };
  // a sheet: the angle of the sail to the boat, from all the way in to all the way out
  const schoot = (label, key, min, max) => merkSchuif({ label, key, min, max, woord: 'goed', ends: ['strak', 'los'],
    merk: ({ sheet }) => sheet('goed', min, max), zegt: (v, d) => (d < 0 ? 'te strak' : 'te los') });
  const kantZeggen = (h) => (Math.abs(h) < 0.5 ? 'midden' : `${Math.abs(Math.round(h))}° naar ${h > 0 ? 'stuurboord' : 'bakboord'}`);
  const CONTROLS = {
    koers: () => {
      // past voor de wind only where the card has a grootschoot to take in first: elsewhere a gijp could only be a klap
      const schoot = les().bediening.some((k) => k === 'groot' || k === 'grootschoot');
      const row = slider('Koers', 'koers', 45, schoot ? 195 : 180, 5, koersNaam);
      // let go past 180: she is on the other boeg now, and the slider counts from there
      row.querySelector('input').addEventListener('change', () => { boeg = side(); s.koers = courseNow(); renderControls(); });
      return row;
    },
    groot: () => segmented('Grootschoot', 'groot', [['los', 'Te los'], ['goed', 'Goed'], ['strak', 'Te strak']]),
    fok: () => segmented('Fokkenschoot', 'fok', [['bak', 'Bak'], ['los', 'Te los'], ['goed', 'Goed'], ['strak', 'Te strak']]),
    zwaard: () => segmented('Zwaard', 'zwaard', [['neer', 'Neer'], ['half', 'Half'], ['op', 'Op']]),
    rif: () => segmented('Rif', 'rif', Array.from({ length: modes.rif().max + 1 }, (_, n) => [n, n === 0 ? 'Geen' : String(n)])),
    wind: () => slider('Wind', 'bft', 1, 6, 1, (b) => `${b} Bft`),
    vaart: () => slider('Vaart', 'vaart', 0, 1.3, 0.05, (v) => (v < 0.05 ? 'stil' : v < 0.6 ? 'langzaam' : v <= 1.05 ? 'op snelheid' : 'snel')),
    vlaag: () => {
      const row = document.createElement('div'); row.className = 'kr-rij';
      row.innerHTML = '<span>Vlaag</span><button type="button" class="kr-vlaag" aria-pressed="false">Een vlaag</button>';
      const b = row.querySelector('button'); b.addEventListener('click', () => set({ vlaag: !s.vlaag }));
      row.sync = () => b.setAttribute('aria-pressed', String(s.vlaag));
      return row;
    },
    // lij on the side it is seen from astern: on the left with the wind over stuurboord, else on the right
    bemanning: () => {
      const opties = [['-1', 'Aan lij'], ['0', 'Midden'], ['1', 'Aan loef']];
      return segmented('Bemanning', 'bemanning', side() > 0 ? opties : opties.reverse());
    },
    helmstok: () => slider('Helmstok', 'helmstok', -80, 80, 5, (h) => (h === 0 ? 'recht' : `${Math.abs(h)}° naar ${h > 0 ? 'stuurboord' : 'bakboord'}`), ['bakboord', 'stuurboord']),
    duw: () => slider('Waar duw je?', 'duw', 0, 5.6, 0.1, () => '', ['achter', 'voor']),
    // De juiste zeilstand: the book's way, played on the grootzeil - vieren tot de tegenbolling, dan aanhalen tot die weg is
    trimmen: () => {
      const row = document.createElement('div'); row.className = 'kr-rij';
      row.innerHTML = '<span>Het grootzeil</span><button type="button" class="primary">Zo trim je</button>';
      const b = row.querySelector('button'); b.addEventListener('click', () => { trim = { t: 0 }; renderControls(); });
      row.sync = () => { b.disabled = Boolean(trim); };
      return row;
    },
    grootschoot: () => schoot('Grootschoot', 'groot', 4, 85),
    fokkenschoot: () => schoot('Fokkenschoot', 'fok', 6, 62),
    // the helmstok, its mark where it holds her straight on (+ : naar stuurboord)
    roerstand: () => merkSchuif({ label: 'Helmstok', key: 'roerstand', min: -HELM_MOST, max: HELM_MOST, woord: 'recht', ends: ['bakboord', 'stuurboord'],
      merk: ({ recht }) => recht, zegt: (v) => kantZeggen(v) }),
    laag: () => {
      const row = document.createElement('div'); row.className = 'kr-lagen';
      row.innerHTML = LAGEN.map(([naam]) => `<button type="button" aria-pressed="false" data-laag="${naam}">${naam}</button>`).join('');
      row.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        if (lagen.has(b.dataset.laag)) lagen.delete(b.dataset.laag); else lagen.add(b.dataset.laag);
        renderControls();
      }));
      row.sync = () => row.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(lagen.has(b.dataset.laag))));
      return row;
    },
  };
  let rows = [];
  const renderControls = () => { for (const r of rows) r.sync(); };

  // ------------------------------------------------------------------ a lesson
  const showLesson = (i) => {
    lesIndex = THREE.MathUtils.clamp(i, 0, LESSEN.length - 1); save();
    const l = les();
    q('.kr-lessen').value = String(lesIndex);
    voortgang.gezien('krachten', l.id); vinkjes();
    q('.kr-vorige').disabled = lesIndex === 0;   // a row, not a round
    q('.kr-tekst').innerHTML = `${l.cwo ? `<p class="kr-chips"><span>CWO ${l.cwo}</span></p>` : ''}${l.kort.map((p) => `<p>${p}</p>`).join('')}`;
    const host = q('.kr-bediening'); host.replaceChildren();
    rows = l.bediening.map((key) => CONTROLS[key]()); host.append(...rows);
    voet.toon(l.meer);
    answered = false; renderQuestion(); trim = null; verder();
    boeg = side(); water = 0; gijp = null; melding = null; klapOm = 0; opstaan = 0; modes.kracht.boomRate = null;
    s = { ...DEFAULT, koers: courseNow(), zwaard: modes.state.midzwaard, ...l.begin };
    // a rif only where the lesson has the control for it: elsewhere the sail is shown whole
    s.rif = l.bediening.includes('rif') ? (l.begin.rif ?? Math.round(modes.rif().slagen)) : 0;
    zetRif(s.rif);
    setBoat({ koers: s.koers, zwaard: s.zwaard });
    requestAnimationFrame(frame);
    schema.views = l.id === 'helling' ? ['achter', 'boven'] : l.id === 'stabiliteit' ? ['achter', 'romp'] : l.id === 'verkennen' ? VERKEN.schema() : ['boven'];
    verkenAanzicht = VERKEN.aanzicht(lagen.has('Helling'));
    renderControls();
  };
  const renderQuestion = () => {
    const v = les().vraag; const host = q('.kr-vraag');
    if (!v) { host.replaceChildren(); return; }
    host.innerHTML = `<h3>Vraag</h3><p>${v.tekst}</p><div class="kr-opties">${v.opties.map(([t], i) => `<button type="button" data-i="${i}">${t}</button>`).join('')}</div><p class="kr-uitleg" hidden></p>`;
    host.querySelectorAll('.kr-opties button').forEach((b) => b.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const i = Number(b.dataset.i);
      host.querySelectorAll('.kr-opties button').forEach((o, j) => { o.classList.toggle('goed', v.opties[j][1]); o.classList.toggle('fout', j === i && !v.opties[j][1]); o.disabled = true; });
      const p = host.querySelector('.kr-uitleg'); p.hidden = false;
      p.innerHTML = `<b>${v.opties[i][1] ? 'Goed!' : 'Niet helemaal.'}</b> ${v.uitleg} <i>Kijk maar op de boot.</i>`;
      voortgang.antwoord('krachten', les().id, v.opties[i][1]);
      set(v.laat); verder();
    }));
  };

  // each onderwerp ticked in the row once it is gevolgd (lessen/voortgang.js)
  const vinkjes = () => q('.kr-lessen').querySelectorAll('option').forEach((o, i) => {
    o.textContent = `${i + 1}. ${LESSEN[i].titel}${voortgang.gevolgd('krachten', LESSEN[i].id, Boolean(LESSEN[i].vraag)) ? ' ✓' : ''}`;
  });
  voortgang.bijWijziging(vinkjes);
  q('.kr-lessen').addEventListener('change', (e) => showLesson(Number(e.target.value)));
  q('.kr-vorige').addEventListener('click', () => showLesson(lesIndex - 1));
  q('.kr-volgende').addEventListener('click', () => showLesson(lesIndex + 1));
  // Volgende only once its question is answered (now, or on an earlier visit); after the last one: done
  const voet = lesVoet(card, () => (lesIndex === LESSEN.length - 1 ? setOpen(false) : showLesson(lesIndex + 1)));
  const verder = () => voet.stand({ laatste: lesIndex === LESSEN.length - 1, kan: !les().vraag || answered || voortgang.gevolgd('krachten', les().id, true) });
  // the camera, on what the card leaves free: beside it - or, as a sheet on a phone, the card is either
  // over the boat or out of the way, and there is nothing to frame around
  const narrow = () => wrap.clientWidth <= SHEET;
  const covers = () => {
    if (!open || card.hidden || narrow()) return 0;
    return Math.max(Math.round(wrap.getBoundingClientRect().right - card.getBoundingClientRect().left + 8), 0);
  };
  const aanzicht = () => (les().id === 'verkennen' ? VERKEN.aanzicht(lagen.has('Helling')) : les().aanzicht);
  const frame = () => { const a = aanzicht(); if (a) fly(a, covers()); };
  // the middle of the picture in the middle of what the card leaves free (main.js moves the lens, not the
  // camera, so a view from astern stays straight from astern); measured again only when the page changes
  let centreKey = '';
  const centre = (width) => {
    const key = `${width} ${open} ${card.hidden} ${breed()}`;
    if (key !== centreKey) { centreKey = key; setCoveredRight(covers()); }
  };

  // on a phone: the boat on its own, with what it does in a bar at the foot and the way back to the lesson
  const showBoat = (on) => {
    card.hidden = on; back.hidden = !on;
    requestAnimationFrame(frame);
  };
  veeg(card, back, showBoat);

  const release = () => {
    Object.assign(modes.kracht, { boom: null, jib: null, heel: 0, helm: null, vane: null, boomRate: null, slap: 0, vlag: null });
    water = 0; gijp = null; melding = null; klapOm = 0; opstaan = 0; kuipWater.hide();
    setCoveredRight(0); centreKey = '';
    shownTheta = 0; shownCourse = null; pijlen.visible = false; vlag.visible = false;
  };
  const setOpen = (on) => {
    if (on === open) return;
    open = on; card.hidden = !on; back.hidden = true;
    wrap.classList.toggle('kr-open', on);
    if (on) {
      if (modes.state.mode !== 'zeilen') modes.apply({ modus: 'zeilen' });
      if (modes.current().tuig !== 'op') modes.apply({ tuig: 'op' });
      onOpen?.();                                       // the other lessons close
      rifBijOpenen = Math.round(modes.rif().slagen);
      // lying on a line she lies head to wind, the sails shaking: the forces are those of a boat sailing free
      lijnBijOpenen = { island: modes.island?.on, tow: modes.tow?.on };
      modes.island?.set(false); modes.tow?.set(false);
      showLesson(lesIndex);
    } else {
      release(); modes.zetRif(rifBijOpenen);
      if (lijnBijOpenen?.island) modes.island.set(true); else if (lijnBijOpenen?.tow) modes.tow.set(true);
      lijnBijOpenen = null;
    }
  };
  q('.kr-sluit').addEventListener('click', () => setOpen(false));

  // ------------------------------------------------------------------ every frame
  function update(dt, width, height) {
    if (!open) return;
    // a manoeuvre or a quiz round from Leren takes the whole screen: the lesson is done with
    if (wrap.classList.contains('ops-on') || wrap.classList.contains('quiz-on')) { setOpen(false); return; }
    // a manoeuvre or a handeling under way has the boat: the layer steps aside till it is done
    if (modes.procedure() || modes.state.mode !== 'zeilen') { release(); return; }
    // turned past the width of a sheet with the boat on its own: the card comes back beside it
    if (card.hidden && !back.hidden && width > SHEET) showBoat(false);
    centre(width);
    // on her boeg the slider counts from the side she is on, however she got there (a manoeuvre, the windroos)
    if (s.koers <= 180) boeg = side();
    // the midzwaard set on the boat itself, by a click on it: the card goes with it
    if (s.zwaard !== modes.state.midzwaard) { s.zwaard = modes.state.midzwaard; renderControls(); }
    const l = les();
    const sd = side();
    const want = modes.state.course;
    if (shownCourse === null || Math.sign(shownCourse) !== Math.sign(want)) shownCourse = want;
    shownCourse += (want - shownCourse) * (1 - Math.exp(-dt * 4));
    const course = shownCourse;
    const baseTws = BFT[s.bft];
    const tws = s.vlaag ? baseTws * 1.6 : baseTws;
    // the boat speed is that of the wind before the vlaag: she has not picked up yet
    const vaart = s.vaart * (boatSpeed(course, baseTws) / Math.max(boatSpeed(course, tws), 1e-6));
    const V = vaart * boatSpeed(course, tws);
    const b = (Math.abs(course) * Math.PI) / 180;
    const awa = (Math.atan2(tws * Math.sin(b), tws * Math.cos(b) + V) * 180) / Math.PI;
    // the sheets: each sail eased to the angle of attack its setting asks for, as far as it goes
    // (or, from a slider, the angle itself)
    const sheet = (v, lo, hi) => THREE.MathUtils.clamp(typeof v === 'number' ? v : awa - TRIM[v], lo, hi);
    // a schoot only holds a sail in: let out further than the wind, it swings back in till the wind runs along it,
    // and it klappert with a tegenbolling - it cannot stand out there with the wind in its back
    const vrij = (v, lo, hi) => Math.min(sheet(v, lo, hi), Math.max(awa - TRIM.los, lo));
    const main = vrij(s.groot, 4, 85);
    const jib = s.fok === 'bak' ? -24 : vrij(s.fok, 6, 62);
    modes.kracht.boom = sd * main; modes.kracht.jib = sd * jib;
    lastMain = main;
    // a gijp under way: the giek over to the new side - with the schoot los in one klap, bouncing back off the
    // end of the schoot; with it in, under control
    if (gijp) {
      gijp.t += dt;
      if (gijp.klap) {
        modes.kracht.boomRate = gijp.t < KLAP_TIJD ? 14 : gijp.t < 0.9 ? 7 : null;
        if (gijp.t >= KLAP_TIJD && gijp.t < 0.9) modes.kracht.boom = sd * Math.max(main - 14, 4);
        // one movement: as the giek swings over she is thrown to the new lij and up into the wind - the heel comes on
        // while the giek goes, not after it lands
        if (l.helt && gijp.t <= KLAP_TIJD) shownTheta += -sd * THREE.MathUtils.degToRad(8 + 4 * s.bft) * Math.min(dt, KLAP_TIJD) / KLAP_TIJD;
        if (!gijp.gegooid) {
          // with wind enough she goes
          gijp.gegooid = true;
          const om = Boolean(l.helt) && (s.bft >= 5 || (s.bft >= 4 && s.bemanning < 0));
          if (om) klapOm = 6;
          const op = Math.max(courseNow() - 55, 90);
          modes.apply({ koers: sd * op, zwaard: s.zwaard });
          if (s.koers <= 180) { boeg = side(); s.koers = op; renderControls(); }
          melding = { tekst: om ? KLAP.om : KLAP.op, niveau: om ? 'rood' : 'oranje', t: 0, tot: om ? 6 : 8 };   // gone over: said while she lies there
        }
        if (gijp.t > 0.9) gijp = null;
      } else {
        modes.kracht.boomRate = 1.6;
        if (gijp.t > 1.8) { gijp = null; modes.kracht.boomRate = null; melding = { tekst: KLAP.goed, niveau: '', t: 0, tot: 6 }; }
      }
    }

    if (l.id === 'verkennen') {                         // with Helling on the camera goes astern
      const kijk = VERKEN.aanzicht(lagen.has('Helling'));
      if (kijk !== verkenAanzicht) { verkenAanzicht = kijk; frame(); }
    }
    const toon = l.id === 'verkennen' ? new Set(LAGEN.filter(([n]) => lagen.has(n)).flatMap(([, keys]) => keys)) : new Set(l.toon);
    if (toon.has('zeilkracht')) toon.delete('zijkracht');   // the whole zeilkracht already, not its side part as well
    const helt = Boolean(l.helt);                         // in Zelf verkennen always: the chip Helling only draws it
    // the roer (blade + : to stuurboord): in Het roer as the card has it; in Zelf verkennen as the helmstok
    // slider has it, drawn or not, so the status can say what it does - 'recht' holding her straight on,
    // worked out at the heel drawn; elsewhere, where it is drawn, held straight
    const roerZet = l.id === 'roer' ? -s.helmstok
      : l.id === 'verkennen' ? (s.roerstand === 'recht' ? 'recht' : -s.roerstand)
        : toon.has('roer') ? 'recht' : null;
    const rif = modes.rif();
    const input = {
      course, tws, vaart, sails: readSails(rif), board: readBoard(), crew: s.bemanning, heel: helt, helm: roerZet,
      push: l.id === 'kracht' ? { x: s.duw, force: PUSH } : null, water: helt ? water * WATER_VOL : 0,
    };
    const eq = solve(input);
    // going over, nothing holds her: she heels on, slowly, till she lies on her side - once it has held a
    // moment: while a sail is still being trimmed after a change it can draw too much for a frame or two
    // Before she goes she lies on her ear a while, schepping water: what is done then can still save her
    omslaanTijd = eq.helling.omslaan ? omslaanTijd + dt : 0;
    klapOm = Math.max(klapOm - dt, 0);
    const omslaan = omslaanTijd > OMSLAAN_NA + SCHEP_TIJD || klapOm > 0;
    const opHetOor = !omslaan && omslaanTijd > OMSLAAN_NA;
    eq.helling.omslaan = omslaan;
    const doel = omslaan ? -sd * Math.PI / 2 : opHetOor ? -sd * THREE.MathUtils.degToRad(SCHEP_HELLING) : eq.helling.theta;
    shownTheta += (doel - shownTheta) * (1 - Math.exp(-dt * (omslaan ? 0.6 : 3)));
    // water: in over the dolboord once she heels that far to lij - on her side, she fills - and out again as
    // the crew hoos once she is back up
    const lij = -sd * THREE.MathUtils.radToDeg(shownTheta);   // degrees of helling to lij
    // coming back up after she went over, the water she holds runs out over the dolboord: none comes in on the way
    if (wasOm && !omslaan) opstaan = 3;
    opstaan = Math.max(opstaan - dt, 0);
    const instroom = !helt || opstaan > 0 ? 0 : omslaan && lij > 45 ? 0.4 : lij > SCHEP ? 0.05 + 0.1 * (lij - SCHEP) / 6 : 0;
    if (!helt) water = 0;
    else if (instroom) water = Math.min(water + instroom * dt, omslaan ? 0.6 : 1);
    else if (lij < SCHEP - 4) water = Math.max(water - HOZEN * dt, 0);
    const schept = instroom > 0 && !omslaan;
    if (schept && !schepte) gevolg('scheppen');
    if (omslaan && !wasOm) gevolg('omgeslagen');
    schepte = schept; wasOm = omslaan;
    kuipWater.set(water, helt);
    // going over, the roer stays where it was when she went - not straightened as the sails lose the wind
    const r = solve({ ...input, drawAt: shownTheta, helm: omslaan && roerZet === 'recht' ? -sd * eq.helmNeeded : roerZet });
    r.helling.omslaan = omslaan;
    for (const h of [r.helling, eq.helling]) Object.assign(h, { schept, water });
    // the numbers - balans, status, warning - going over as they were when she went: lying on her side the
    // sails catch nothing, and all would seem to have come to rest
    const rTal = omslaan ? eq : r;
    modes.kracht.heel = shownTheta;                       // upright too eases there, with the arrows
    // over on her side the sails lie on the water and the flag in it: no wind fills them
    modes.kracht.slap = omslaan ? 1 : 0; modes.kracht.vlag = omslaan ? 0 : null;
    modes.kracht.vane = sd * (r.awa * Math.PI) / 180;
    // the helmstok: as the card has it, or where it has to be to sail straight on
    const recht = sd * eq.helmNeeded;                    // the helmstok that holds her straight (+ : naar stuurboord)
    const helmstok = l.id === 'roer' ? s.helmstok
      : l.id === 'verkennen' && s.roerstand !== 'recht' ? s.roerstand
        : toon.has('helmstok') || l.id === 'verkennen' ? recht : 0;
    for (const row of rows) row.tick?.({ sheet, recht });
    modes.kracht.helm = (-helmstok * Math.PI) / 180;

    const items = buildItems(r, toon, l, input);
    // Ware en schijnbare wind: a flag that stands still, in the ware wind, beside the one on the boat
    vlag.visible = l.id === 'wind';
    if (l.id === 'wind') {
      vlagTijd += dt;
      const [wx, wz] = r.ware; const n = Math.hypot(wx, wz) || 1;
      vlag.update(vlagTijd, tmp.set(VLAG_AT[0], VLAG_AT[1], sd * VLAG_AT[2]), [wx / n, wz / n], Math.min(tws / 12, 1));
      items.push({ type: 'tekst', at: [VLAG_AT[0], VLAG_AT[1] + 3.0, sd * VLAG_AT[2]], kleur: KLEUR.ware, label: 'vaste vlag: ware wind', views: ['boot'] });
    }
    // the koppels side by side: gieren in sturen, helling in stabiliteit, both short in Zelf verkennen
    balansen(rTal, l);
    // the close-up of the hull is the schema's - on the boat only what is marked for it as well: the arm and
    // the oprichtend koppel lie too close together there to read
    pijlen.visible = true; pijlen.draw(items.filter((it) => !it.views || it.views.includes('boot')));
    pijlen.update(width, height);
    // the schema thirty times a second at most: a page of SVG anew each frame is more than the eye needs
    schemaDue -= dt;
    if (!card.hidden && schemaDue <= 0) { schemaDue = 1 / 30; schema.draw(shapes(input.sails, input.board, helmstok, r.zeilen), items, l.titel); }
    // Zo trim je: te los first, till the tegenbolling shows; then in, just till it is gone
    let fase = '';
    if (trim) {
      trim.t += dt;
      if (trim.t < 3) { if (s.groot !== 'los') set({ groot: 'los' }); fase = 'Vier het grootzeil tot er een tegenbolling in het voorlijk komt: het zeil killt.'; }
      else if (trim.t < 6) { if (s.groot !== 'goed') set({ groot: 'goed' }); fase = 'Trek het dan net zo ver aan tot de tegenbolling weg is: nu volgt de stroming het zeil.'; }
      else { trim = null; renderControls(); }
    }
    if (melding && (melding.t += dt) > melding.tot) melding = null;
    // what a gijp brought about is said for a while - unless she schept or goes over now: that is said first
    if (melding && (rTal.helling.omslaan || rTal.helling.schept) && !klapOm) melding = null;
    const status = fase || melding?.tekst || l.status(rTal, { ...s, rifMax: rif.max });
    if (status !== lastStatus) { q('.kr-status').textContent = status; back.querySelector('p').textContent = status; lastStatus = status; }
    // a warning in its colour, not in the green of how things are
    const niveau = melding ? melding.niveau : waarschuwing(rTal, l, s);
    if (niveau !== lastNiveau) {
      for (const el of [q('.kr-status'), back]) { el.classList.remove(`kr-${lastNiveau}`); if (niveau) el.classList.add(`kr-${niveau}`); }
      lastNiveau = niveau;
    }
  }

  /** How bad what the status says is: '' (all well), geel, oranje or rood - for what the lesson warns about.
   *  Heeled to loef, or upright, it is only a warning while the bemanning can still move towards lij. */
  function waarschuwing(r, l, s) {
    const zegt = l.zegt ?? []; const phi = r.helling.phi; const helling = zegt.includes('helling');
    const kanNaarLij = s.bemanning > -1; const rechtop = Math.round(Math.abs(phi)) < 1;
    if (helling && (r.helling.omslaan || r.helling.schept)) return 'rood';
    if (helling && phi >= BERGHOUT_ONDER) return 'oranje';
    if (helling && !rechtop && phi < 0 && kanNaarLij) return 'oranje';
    if (zegt.includes('gier') && Math.abs(r.helmNeeded) > HELM_MOST - 0.5) return 'oranje';
    if (helling && (phi >= HELLING_FLINK || r.helling.water > 0.03 || (rechtop && kanNaarLij))) return 'geel';
    return '';
  }

  // ------------------------------------------------------------------ the koppels side by side
  // A balans: a bar for each koppel, from a middle line to one side or the other, and their sum - "in
  // evenwicht" when it comes to nothing. In full ('vol') every bar shows; short (Zelf verkennen, where
  // there can be two) only the sum under the balans' name, with the parts one click further.
  const makeBalans = ({ titel, kop, delen }) => {
    const el = document.createElement('div'); el.className = 'kr-balans'; el.hidden = true;
    const rij = (n, naam, kleur, som) => `<div class="kr-balans-rij${som ? ' kr-som' : ''}" data-n="${n}"><span>${naam}</span><div class="kr-balans-baan"><i style="background: ${kleur}"></i>${som ? '<em>in evenwicht</em>' : ''}</div></div>`;
    el.innerHTML = `<div class="kr-balans-kop"><span>◀ ${kop[0]}</span><span>${kop[1]} ▶</span></div>
      <button type="button" class="kr-balans-open" aria-expanded="false" hidden>${rij('netto', titel, KLEUR.koppelSom, true)}</button>
      <div class="kr-balans-delen">${delen.map((d) => rij(d.n, d.naam, d.kleur, d.som)).join('')}</div>`;
    const rows = [...el.querySelectorAll('.kr-balans-rij')].map((row) => ({ row, n: row.dataset.n, bar: row.querySelector('i'), em: row.querySelector('em') }));
    const knop = el.querySelector('.kr-balans-open'); const lijst = el.querySelector('.kr-balans-delen');
    let kort = false; let uit = false;
    const sync = () => {
      el.classList.toggle('kr-kort', kort); knop.hidden = !kort; lijst.hidden = kort && !uit;
      knop.setAttribute('aria-expanded', String(uit)); knop.querySelector('span').textContent = `${uit ? '▾' : '▸'} ${titel}`;
    };
    knop.addEventListener('click', () => { uit = !uit; sync(); });
    const kopEl = el.querySelectorAll('.kr-balans-kop span');
    return {
      el,
      /** The words at the two ends, when they turn round (helling on the other boeg). */
      kop([links, rechts]) { if (kopEl[0].textContent !== `◀ ${links}`) { kopEl[0].textContent = `◀ ${links}`; kopEl[1].textContent = `${rechts} ▶`; } },
      toon(on, isKort) { el.hidden = !on; if (isKort !== kort) { kort = isKort; uit = false; sync(); } },
      /** v: the koppel for each bar by name, and `netto` for the sum; most: the koppel of a full half-bar;
       *  weg: bars left out; som: the bar that is the sum - short, it is the one under the name already. */
      set(v, most, weg = [], som = 'totaal') {
        for (const { row, n, bar, em } of rows) {
          row.hidden = weg.includes(n) || (kort && n === som);
          const w = Math.min(Math.abs(v[n] ?? 0) / most, 1) * 50;
          bar.style.width = `${w}%`; bar.style.left = (v[n] ?? 0) >= 0 ? '50%' : `${50 - w}%`;
          if (em) em.hidden = Math.abs(v[n] ?? 0) > 0.03 * most;
        }
      },
    };
  };
  // gieren: the sails, their sum, and with the roer drawn the roer and the total - a full half-bar is what
  // the roer holds with the helmstok 15 degrees over, the yardstick of the arcs on the boat
  const gierBalans = makeBalans({ titel: 'gieren', kop: ['afvallend', 'oploevend'], delen: [
    { n: 'grootzeil', naam: 'grootzeil', kleur: KLEUR.koppel }, { n: 'fok', naam: 'fok', kleur: KLEUR.koppel },
    { n: 'samen', naam: 'samen', kleur: KLEUR.koppelSom, som: true }, { n: 'roer', naam: 'roer', kleur: KLEUR.water },
    { n: 'totaal', naam: 'totaal', kleur: KLEUR.koppelSom, som: true }] });
  // helling: the kenterend koppel of the zeilkracht against the oprichtend one of the gewicht, each in the
  // colour of its force; lij on the side it is seen from astern - left with the wind over stuurboord
  const hellingBalans = makeBalans({ titel: 'helling', kop: ['naar lij', 'naar loef'], delen: [
    { n: 'kenterend', naam: 'kenterend', kleur: KLEUR.lucht }, { n: 'oprichtend', naam: 'oprichtend', kleur: KLEUR.zwaarte },
    { n: 'totaal', naam: 'totaal', kleur: KLEUR.koppelSom, som: true }] });
  q('.kr-balansen').append(gierBalans.el, hellingBalans.el);
  function balansen(r, l) {
    const verken = l.id === 'verkennen';
    const metGier = verken ? lagen.has('Gieren') : l.balans === 'gier';
    const metHelling = verken ? lagen.has('Helling') : l.balans === 'helling';
    gierBalans.toon(metGier, verken); hellingBalans.toon(metHelling, verken);
    if (metGier) {
      const v = { grootzeil: 0, fok: 0 };
      r.zeilen.forEach((z, i) => { v[z.naam] = r.perZeil[i]; });
      v.samen = r.gier; v.roer = r.roer ? -r.side * r.roer.koppel : 0;   // the roer's koppel the gier way: oploevend > 0
      v.totaal = v.samen + v.roer; v.netto = r.roer ? v.totaal : v.samen;
      gierBalans.set(v, Math.max(r.roerMaat, 50), r.roer ? [] : ['roer', 'totaal'], r.roer ? 'totaal' : 'samen');
    }
    if (metHelling) {
      const h = r.helling; const k = r.side;                          // k: lij on the left (+1) or the right (-1)
      hellingBalans.kop(k > 0 ? ['naar lij', 'naar loef'] : ['naar loef', 'naar lij']);
      hellingBalans.set({ kenterend: -k * h.tip, oprichtend: k * h.right, totaal: k * (h.right - h.tip), netto: k * (h.right - h.tip) }, HELLING_VOL);
    }
  }

  // ------------------------------------------------------------------ what is drawn
  function buildItems(r, toon, l, input) {
    const items = [];
    const sd = r.side;
    const forces = [];
    const fv = (f) => [f[0], 0, f[1]];                                // [x, z] -> [x, 0, z]
    // one scale for every force in the picture, shrunk together when one would be too long
    const collect = (f) => forces.push(Math.hypot(f[0], f[1]));
    if (toon.has('perzeil')) r.zeilen.forEach((z) => collect(z.force));
    if (toon.has('zeilkracht') || toon.has('zijkracht') || toon.has('voortstuwend')) collect(r.zeilkracht.force);
    if (toon.has('drift')) collect(r.drift);
    if (toon.has('roer') && r.roer) collect(r.roer.force);
    const scale = Math.min(FORCE, FORCE_MAX / Math.max(...forces, 1));
    const sc = (v) => v.map((c) => c * scale);
    // half a turn for the lesson's koppel; the gier koppels measured against the roer (half a turn is what it
    // holds at 15 degrees), so an arc says what the helmstok has to do
    const gierMaat = Math.max(r.roerMaat, 50);
    const koppelArc = (m, most = 1.5 * Math.PI, ref = l.koppel, least = 0.25) => Math.sign(m) * Math.min(Math.max((Math.abs(m) / ref) * Math.PI, least), most);
    // a koppel about a vertical axis; its middle on the loef side, or towards `mid` (radians: 0 forward, PI aft)
    // least: the shortest it is drawn (radians), long enough to stand out beyond its word
    const arcY = (center, r0, m, label, mid = -sd * Math.PI / 2, most, vol = false, ref, kleur = KLEUR.koppel, least) => {
      const sweep = Math.abs(m) < 3 ? 0 : koppelArc(m, most, ref, least);
      items.push({ type: 'boog', center, as: 'y', r: r0, start: mid - sweep / 2, sweep, kleur, label, vol });
    };
    const gierWoord = (m) => (m > 0 ? 'oploevend koppel' : 'afvallend koppel');   // m: oploevend > 0

    if (toon.has('duw') && r.duw) {
      const L = PUSH * FORCE * 1.1; const at = r.duw.at;
      items.push({ type: 'pijl', from: [at[0], at[1], at[2] + L], vec: [0, 0, -L], kleur: KLEUR.duw, label: 'duw', labelAt: 0.3 });
    }
    if (toon.has('arm') && r.duw) {
      items.push({ type: 'maat', a: [r.lp[0], 1.0, 0], b: [r.duw.at[0], 1.0, 0], kleur: KLEUR.maat, label: 'arm', offset: [0, 14] });
    }
    if (toon.has('duwkoppel') && r.duw) arcY([r.lp[0], 1.0, 0], 0.75, r.duw.koppel, 'koppel');

    if (toon.has('perzeil')) {
      for (const z of r.zeilen) {
        const thin = toon.has('zeilkracht');
        items.push({ type: 'pijl', from: z.at, vec: fv(sc(z.force)), kleur: KLEUR.lucht, dun: thin, label: z.naam });
      }
    }
    const ce = r.zeilkracht.at; const F = r.zeilkracht.force;
    if (toon.has('zeilkracht')) items.push({ type: 'pijl', from: ce, vec: fv(sc(F)), kleur: KLEUR.lucht, label: 'zeilkracht' });
    if (toon.has('ontbonden')) {
      const fwd = [F[0] * scale, 0, 0]; const lat = [0, 0, F[1] * scale]; const tip = fv(sc(F)).map((c, i) => ce[i] + c);
      items.push({ type: 'pijl', from: ce, vec: fwd, kleur: KLEUR.lucht, dun: true, label: 'voortstuwend', labelAt: 0.8 });
      items.push({ type: 'pijl', from: ce, vec: lat, kleur: KLEUR.lucht, dun: true, label: 'verlijerend', labelAt: 0.8 });
      items.push({ type: 'lijn', a: fwd.map((c, i) => ce[i] + c), b: tip, kleur: KLEUR.lucht });
      items.push({ type: 'lijn', a: lat.map((c, i) => ce[i] + c), b: tip, kleur: KLEUR.lucht });
    }
    if (toon.has('voortstuwend')) items.push({ type: 'pijl', from: ce, vec: [F[0] * scale, 0, 0], kleur: KLEUR.lucht, label: 'voortstuwend' });
    if (toon.has('zijkracht')) items.push({ type: 'pijl', from: ce, vec: [0, 0, F[1] * scale], kleur: KLEUR.lucht, label: 'zeilkracht' });
    if (toon.has('zp')) items.push({ type: 'punt', at: ce, kleur: KLEUR.lucht, label: 'zeilpunt' });

    const lp = r.lp;
    if (toon.has('drift')) items.push({ type: 'pijl', from: lp, vec: fv(sc(r.drift)), kleur: KLEUR.water, label: 'driftbeperkend' });
    if (toon.has('weerstand')) items.push({ type: 'pijl', from: lp, vec: fv(sc(r.weerstand)), kleur: KLEUR.water, label: 'weerstand' });
    if (toon.has('lp')) items.push({ type: 'punt', at: lp, kleur: KLEUR.water, label: 'lateraal punt' });
    if (toon.has('koersdoorwater')) {
      const lam = (r.verlijering * Math.PI) / 180; const at = [5.75, 0.3, 0]; const L = 1.2;
      const tip = [at[0] + L * Math.cos(lam), at[1], -sd * L * Math.sin(lam)];
      items.push({ type: 'lijn', a: at, b: [at[0] + L, at[1], 0], kleur: KLEUR.spoor });
      items.push({ type: 'pijl', from: at, vec: tip.map((c, i) => c - at[i]), kleur: KLEUR.spoor, dun: true });
      // its word beside its point, on the loef side, away from where it leans: no room is taken ahead of it
      items.push({ type: 'tekst', at: tip, kleur: KLEUR.spoor, label: 'koers door het water', offset: [sd * 72, 4] });
    }
    if (toon.has('zeilkoppels')) {
      r.zeilen.forEach((z, i) => {
        const m = r.perZeil[i];
        if (Math.abs(m) < 3) return;
        // each round its own end of the lateraal punt, as Sint Maarten draws them (fig. 7.20, 7.21)
        arcY([lp[0], 1.0, 0], 0.85, -sd * m, gierWoord(m), z.naam === 'fok' ? 0 : Math.PI, 0.9 * Math.PI, false, gierMaat, undefined, 0.7);
      });
    }
    if (toon.has('gierkoppel')) arcY([lp[0], 1.0, 0], 0.9, -sd * r.gier, gierWoord(r.gier), undefined, undefined, false, gierMaat);
    // the two together, round the outside of the two per sail: what is left for the roer to hold
    if (toon.has('samenkoppel')) arcY([lp[0], 1.0, 0], 1.35, -sd * r.gier, Math.abs(r.gier) < 3 ? '' : `samen: ${gierWoord(r.gier)}`, undefined, undefined, true, gierMaat);
    if (toon.has('armgier')) {
      // seen from astern: how far the zeilpunt stands beside the lateraal punt
      const foot = [lp[0], lp[1], ce[2]];
      items.push({ type: 'lijn', a: ce, b: foot, kleur: KLEUR.maat });
      items.push({ type: 'maat', a: lp, b: foot, kleur: KLEUR.maat, label: 'arm', offset: [0, 14] });
    }

    if (toon.has('wind')) {
      const m = heeled(MAST, shownTheta);
      const tail = (w) => [m[0] - w[0] * WIND, m[1], m[2] - w[1] * WIND];
      const tw = tail(r.ware); const tv = tail(r.vaartwind); const ts = tail(r.schijnbaar);
      const arrow = (t, kleur, label) => items.push({ type: 'pijl', from: t, vec: m.map((c, i) => c - t[i]), kleur, label, dun: kleur !== KLEUR.schijnbaar, labelAt: 0.35 });
      if (Math.hypot(...r.vaartwind) > 0.05) {
        items.push({ type: 'lijn', a: tw, b: ts, kleur: KLEUR.vaart }, { type: 'lijn', a: tv, b: ts, kleur: KLEUR.ware });
        arrow(tv, KLEUR.vaart, 'vaartwind');
      }
      arrow(tw, KLEUR.ware, 'ware wind');
      arrow(ts, KLEUR.schijnbaar, 'schijnbare wind');
    }

    if (r.roer && toon.has('roer')) {
      const at = r.roer.at;
      items.push({ type: 'pijl', from: at, vec: fv(sc(r.roer.force)), kleur: KLEUR.water, label: 'roerkracht' });
      if (toon.has('roerdelen')) {
        const st = fv(sc(r.roer.sturend)); const re = fv(sc(r.roer.remmend)); const tip = fv(sc(r.roer.force)).map((c, i) => at[i] + c);
        items.push({ type: 'pijl', from: at, vec: st, kleur: KLEUR.water, dun: true, label: 'sturend', labelAt: 0.85 });
        items.push({ type: 'pijl', from: at, vec: re, kleur: KLEUR.water, dun: true, label: 'remmend', labelAt: 0.85 });
        items.push({ type: 'lijn', a: st.map((c, i) => at[i] + c), b: tip, kleur: KLEUR.water }, { type: 'lijn', a: re.map((c, i) => at[i] + c), b: tip, kleur: KLEUR.water });
      }
      if (toon.has('roerkoppel')) {
        arcY([lp[0], 1.0, 0], 0.8, r.roer.koppel, 'koppel', undefined, undefined, false, undefined, KLEUR.water);   // red, as its roerkracht
        // room aft of the boat and to both sides for what the roer can give, held whether the arrows are
        // short or long: the picture stays put as the helmstok goes over
        for (const z of [-1.5, 1.5]) items.push({ type: 'ruimte', at: [at[0] - 1.4, at[1], z] });
      }
      // in Zelf verkennen, beside the sails' koppel: the roer's, to the same yardstick, round the lij side -
      // red, as its roerkracht is: water
      else if (l.id === 'verkennen') {
        const m = -sd * r.roer.koppel;
        arcY([lp[0], 1.0, 0], 0.9, r.roer.koppel, `roer: ${gierWoord(m)}`, sd * Math.PI / 2, undefined, false, gierMaat, KLEUR.water);
      }
    }

    // the air round the sails, and its pressure: the lines in the schema from above, as the book draws them (on the
    // boat they would run through her), plus on loef and minus on lij on both
    if (toon.has('stroom') || toon.has('druk')) {
      for (const sail of input.sails) {
        const z = r.zeilen.find((q) => q.naam === sail.naam);
        const hals = sail.corners[0]; const schoot = sail.corners[sail.corners.length - 1];
        const y = Math.max(hals.y, schoot.y) + 0.35;
        const f = stroomlijnen({ hals: [hals.x, hals.z], schoot: [schoot.x, schoot.z], wind: r.schijnbaar, side: sd, stand: z?.stand ?? 'goed', y });
        if (toon.has('stroom')) {
          for (const pts of f.lijnen) items.push({ type: 'stroom', pts, kleur: KLEUR.lucht, pijl: true, views: ['boven'] });
          for (const pts of f.wervels) items.push({ type: 'stroom', pts, kleur: KLEUR.lucht, views: ['boven'] });
        }
        if (toon.has('druk')) {
          for (const at of f.plus) items.push({ type: 'tekst', at, label: '+', kleur: KLEUR.water, views: ['boven', 'boot'] });
          for (const at of f.min) items.push({ type: 'tekst', at, label: '−', kleur: KLEUR.lucht, views: ['boven', 'boot'] });
        }
      }
    }
    // the four driftbeperkende middelen, each its share of the driftbeperkende kracht, where it is
    if (toon.has('middelen')) {
      const board = input.board; const steekt = board && board.depth > 0.08;
      const delen = steekt ? (s.zwaard === 'neer' ? [0.32, 0.48, 0.1, 0.1] : [0.45, 0.3, 0.13, 0.12]) : [0.66, 0, 0.19, 0.15];
      const plek = [[2.6, -0.12, 0, 'onderwaterschip'], [steekt ? board.x : 3, steekt ? board.y : -0.3, 0, 'zwaard'], [0.7, -0.22, 0, 'scheg'], [-0.1, -0.3, 0, 'roer']];
      plek.forEach(([x, y, zz, naam], i) => {
        if (!delen[i]) return;
        items.push({ type: 'pijl', from: [x, y, zz], vec: fv(sc(r.drift.map((c) => c * delen[i]))), kleur: KLEUR.water, dun: true, label: naam, labelAt: 0.9 });
      });
    }

    // helling, seen from astern: kenterend against oprichtend
    const h = r.helling;
    if (toon.has('kenterend')) {
      const c = ce.map((v, i) => (v + lp[i]) / 2);
      const sweep = -sd * koppelArc(h.tip, undefined, KENTER);
      items.push({ type: 'boog', center: c, as: 'x', r: 0.55, start: -sweep / 2, sweep, kleur: KLEUR.koppel, label: 'kenterend koppel', offset: [0, -14] });
    }
    if (toon.has('zwaartepunt')) {
      items.push({ type: 'pijl', from: h.g, vec: [0, -1.0, 0], kleur: KLEUR.zwaarte, dun: true, label: 'zwaartekracht', labelAt: 0.85, views: ROMP_BOOT });
      items.push({ type: 'punt', at: h.g, kleur: KLEUR.zwaarte, label: 'zwaartepunt', offset: [sd * 52, 0], views: ROMP_BOOT });
    }
    if (toon.has('drukpunt')) {
      items.push({ type: 'pijl', from: h.b, vec: [0, 1.0, 0], kleur: KLEUR.opwaarts, dun: true, label: 'opwaartse kracht', labelAt: 0.85, views: ROMP_BOOT });
      items.push({ type: 'punt', at: h.b, kleur: KLEUR.opwaarts, label: 'drukpunt', offset: [-sd * 44, 0], views: ROMP_BOOT });
    }
    if (toon.has('armstab') && Math.abs(h.g[2] - h.b[2]) > 0.02) {
      items.push({ type: 'maat', a: [h.g[0], -0.25, h.g[2]], b: [h.g[0], -0.25, h.b[2]], kleur: KLEUR.maat, label: 'arm', offset: [0, 14], views: ROMP });
    }
    if (toon.has('oprichtend')) {
      const c = h.g.map((v, i) => (v + h.b[i]) / 2);
      const sweep = sd * Math.sign(h.right) * koppelArc(Math.abs(h.right), undefined, KENTER);
      items.push({ type: 'boog', center: [c[0], 0.75, c[2]], as: 'x', r: 0.42, start: -sweep / 2, sweep, kleur: KLEUR.koppel, label: 'oprichtend koppel', offset: [0, -14], views: ROMP });
    }
    return items;
  }

  /** The boat for the schema: outlines, sails and zwaard, in the world as she stands. */
  function shapes(sails, board, helmstok = 0, zeilen = []) {
    const w = (p) => tmp.set(...p).applyMatrix4(boat.matrixWorld).toArray();
    const out = [];
    out.push({ view: 'boven', pts: outline.deck.map(w), closed: true, fill: '#f7f4ec', stroke: '#36454f', fit: true });
    out.push({ view: 'achter', pts: outline.section.map(w), closed: true, fill: '#f7f4ec', stroke: '#36454f', fit: true });
    if (board) {
      out.push({ view: 'boven', pts: [[board.aft, 0.0, 0], [board.fore, 0.0, 0]].map(w), stroke: '#36454f', px: 2.5, dashed: true });
      out.push({ view: 'achter', pts: [[2.8, 0.0, 0], [2.8, -board.depth, 0]].map(w), stroke: '#36454f', px: 3 });
    }
    out.push({ view: 'achter', pts: [[3.62, 0.37, 0], [3.62, 5.64, 0]].map(w), stroke: '#7a5a2e', px: 2.5, romp: false });
    out.push({ view: 'boven', dot: w([3.62, 1, 0]), r: 0.06, fill: '#7a5a2e' });
    // the roer from above: blade and helmstok one straight line through the roerpen on the spiegel, the
    // helmstok into the boat, the blade aft of it - so the blade goes the other way (helmstok + : stuurboord)
    const a = (helmstok * Math.PI) / 180; const pen = [0.02, 0.7, 0];
    const along = (l) => [pen[0] + l * Math.cos(a), pen[1], pen[2] + l * Math.sin(a)];
    out.push({ view: 'boven', pts: [along(0), along(1.25)].map(w), stroke: '#7a5a2e', px: 3 });
    out.push({ view: 'boven', pts: [along(0), along(-0.42)].map(w), stroke: '#36454f', px: 5 });
    out.push({ view: 'boven', dot: w(pen), r: 0.035, fill: '#36454f' });
    for (const s of sails) {
      // from astern the sail as it stands; from above, as the lesboeken draw it, the onderlijk: a curve from
      // hals to schoothoek, its bolling to lij, deepest a third of the way back
      out.push({ view: 'achter', pts: s.corners.map((c) => w(c.toArray())), closed: true, fill: 'rgba(250, 248, 240, 0.85)', stroke: '#8a8578', px: 1, romp: false });
      // (a sail te los has a tegenbolling in its voorlijk: stroming.js profiel)
      const hals = s.corners[0]; const schoot = s.corners[s.corners.length - 1];
      const los = zeilen.find((z) => z.naam === s.naam)?.stand === 'klappert';
      const { p } = profiel([hals.x, hals.z], [schoot.x, schoot.z], side(), los);
      const profile = [];
      for (let i = 0; i <= 16; i++) { const [x, z] = p(i / 16); profile.push(w([x, hals.y, z])); }
      out.push({ view: 'boven', pts: profile, stroke: '#5f5a50', px: 2.4, romp: false });
    }
    return out;
  }

  /** Open it at its first onderwerp - or at the one with that id, when one is given (Zoeken › Begrippen). */
  const openOp = (id) => {
    const i = Math.max(LESSEN.findIndex((l) => l.id === id), 0);
    if (open) { showLesson(i); return; }
    lesIndex = i; setOpen(true);
  };
  return { update, open: openOp, close: () => setOpen(false), onderwerpen: LESSEN,
           /** Open: { sleutel, onderwerp } for the address of the page (adres.js), as lessen/kaart.js openKaart. */
           nu: () => (open ? { sleutel: 'krachten', onderwerp: LESSEN[lesIndex].id } : null),
           dispose: () => { setOpen(false); pijlen.dispose(); schema.dispose(); vlag.dispose(); kuipWater.dispose(); card.remove(); back.remove(); layer.remove(); } };
}
