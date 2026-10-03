import * as THREE from 'three';
import { makeLamp, KLEUR } from './betonning.js';
import { character } from './lichtkarakter.js';

// Other ships with their lights and dagmerken (BPR hoofdstuk 3, bijlage 3; reference/bpr/LICHTEN.md):
// simple hulls, one per kind of ship, each with the places its lights go, and the configurations of
// the BPR laid on them. A light shows only inside its arc, as seen from the camera: toplicht 225
// degrees ahead, a boordlicht 112.5 degrees from dead ahead to its own side, heklicht 135 degrees
// astern, rondom all round. Each ship stands on its waterline at its origin, the bow towards +x and
// starboard towards +z, like the lelievlet.

// a boordlicht's screen lets it show a few degrees across the bow, so from dead ahead both are seen
// (COLREG annex I: 1 to 3 degrees); without that a light off the centreline would go out head on
const ACROSS = 3;
const ARC = {
  toplicht: [-112.5, 112.5], sb: [-ACROSS, 112.5], bb: [-112.5, ACROSS], heklicht: [112.5, 247.5], rondom: null, flikker: null,
};

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extra });
const box = (w, h, d, color) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));

/** A hull in plan: a square stern, straight sides and a bow drawn in over the forward `bow` of it. */
function hull({ length, beam, freeboard, draft = 0.5, bow = 0.18, color = 0x2b3740, deck = 0x6d6a60, sheer = 0.3 }) {
  const shape = new THREE.Shape(); const half = beam / 2; const start = length * (1 - bow);
  shape.moveTo(0, -half); shape.lineTo(start, -half);
  shape.quadraticCurveTo(length, -half, length, 0); shape.quadraticCurveTo(length, half, start, half);
  shape.lineTo(0, half); shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, { depth: freeboard + draft, bevelEnabled: false, curveSegments: 12 });
  geometry.rotateX(-Math.PI / 2); geometry.translate(0, -draft, 0);   // the plan lies flat, the depth goes up
  const mesh = new THREE.Mesh(geometry, [mat(deck), mat(color)]);
  const group = new THREE.Group(); group.add(mesh);
  // the bow a little higher: a sheer
  const stem = box(length * 0.12, sheer, beam * 0.6, color); stem.position.set(length * 0.92, freeboard + sheer / 2 - 0.05, 0); group.add(stem);
  return group;
}

/** A mast or post from `at` up `height`. */
function post(group, x, height, base = 0, r = 0.06, color = 0xd9d9d9, z = 0) {
  const p = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.7, r, height, 8), mat(color));
  p.position.set(x, base + height / 2, z); group.add(p);
}

/** A sail: a triangle from tack to head to clew, in the plane of the ship. */
function sail(group, points, color) {
  const g = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
  g.setIndex([0, 1, 2]); g.computeVertexNormals();
  group.add(new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color, roughness: 0.9, side: THREE.DoubleSide })));
}

// -- the ships: each builds its hull and says where its lights go ([x, y, z] on the ship)
const SHIPS = {
  // a binnenvaartschip, a Kempenaar of some 55 m: toplicht on a mast on the voorschip, the boordlichten
  // on the wheelhouse, the heklicht on the stern
  motor: () => {
    const L = 55; const B = 6.6; const F = 1.3;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 2 });
    const hold = box(L * 0.62, 1.1, B - 1.2, 0x7b6d57); hold.position.set(L * 0.5, F + 0.55, 0); g.add(hold);
    const house = box(3.2, 2.6, B - 1.6, 0xe8e4da); house.position.set(4.2, F + 1.3, 0); g.add(house);
    const roof = box(3.6, 0.15, B - 1.2, 0x333333); roof.position.set(4.2, F + 2.65, 0); g.add(roof);
    post(g, L * 0.95, 5, F, 0.08); post(g, 3.2, 5.2, F + 2.7, 0.06);
    return { group: g, at: { voor: [L * 0.95, F + 5, 0], sb: [4.2, F + 2.9, B / 2 - 0.9], bb: [4.2, F + 2.9, -(B / 2 - 0.9)], hek: [0.3, F + 1.2, 0],
      achter: [3.2, F + 7.9, 0], mast: [3.2, F + 5.5, 0], mid: [L * 0.5, F + 3.5, 0] }, length: L };
  },
  tanker: () => {
    const s = SHIPS.motor();
    for (let i = 0; i < 6; i++) { const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 30, 8), mat(0xb03030)); pipe.rotation.z = Math.PI / 2; pipe.position.set(30, 2.6 + 0.3 * (i % 2), -2 + i * 0.8); s.group.add(pipe); }
    return s;
  },
  duw: () => {
    const L = 20; const B = 8; const F = 1.4;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.6, bow: 0.02 });
    const house = box(5, 4.5, B - 2, 0xe8e4da); house.position.set(6, F + 2.25, 0); g.add(house);
    const barge = hull({ length: 70, beam: 11, freeboard: 1.5, draft: 3, bow: 0.05, color: 0x3a3226, deck: 0x5a4c3a });
    barge.position.x = L; g.add(barge);
    post(g, L + 68, 5, 1.5, 0.1);
    return { group: g, at: { voor: [L + 68, 6.5, 0], sb: [6, F + 4.8, B / 2 - 1], bb: [6, F + 4.8, -(B / 2 - 1)], hek: [0.3, F + 1.5, 0] }, length: L + 70 };
  },
  sleep: () => {
    const L = 16; const B = 5; const F = 1.2;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.8, color: 0x1f2b40 });
    const house = box(4, 2.8, B - 1.4, 0xe8e4da); house.position.set(L * 0.55, F + 1.4, 0); g.add(house);
    post(g, L * 0.7, 6, F, 0.07);
    return { group: g, at: { voor: [L * 0.7, F + 6, 0], sb: [L * 0.55, F + 3, B / 2 - 0.7], bb: [L * 0.55, F + 3, -(B / 2 - 0.7)], hek: [0.3, F + 1, 0], mast: [L * 0.7, F + 3.3, 0] }, length: L };
  },
  pont: () => {
    const L = 18; const B = 8; const F = 0.9;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.2, bow: 0.01, color: 0x3c4a3c, deck: 0x7a7a70 });
    for (const x of [-1.5, L + 0.2]) { const ramp = box(2, 0.2, B - 2, 0x555555); ramp.position.set(x + 0.4, F + 0.1, 0); g.add(ramp); }
    const house = box(2.2, 2.4, 2.2, 0xe8e4da); house.position.set(L / 2, F + 1.2, B / 2 - 1.3); g.add(house);
    post(g, L / 2, 5.2, F + 2.4, 0.05, 0xd9d9d9, B / 2 - 1.3);
    g.userData.ends = [[-1.2, F + 0.35], [L + 0.8, F + 0.35]];      // where a cable would run on board, fore and aft
    return { group: g, at: { mast: [L / 2, F + 5.5, B / 2 - 1.3], sb: [L / 2 + 1.2, F + 2.6, B / 2 - 0.2], bb: [L / 2 + 1.2, F + 2.6, -(B / 2 - 0.2)], hek: [0.2, F + 1, 0] }, length: L };
  },
  passagier: () => {
    const L = 18; const B = 4.2; const F = 0.8;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.9, color: 0x1d3a5a, deck: 0x9a9080 });
    const cabin = box(L * 0.7, 1.9, B - 0.6, 0xdfe6ea); cabin.position.set(L * 0.45, F + 0.95, 0); g.add(cabin);
    post(g, L * 0.8, 2.6, F + 1.9, 0.05);
    return { group: g, at: { voor: [L * 0.85, F + 2.6, 0], sb: [L * 0.78, F + 1.6, B / 2 - 0.2], bb: [L * 0.78, F + 1.6, -(B / 2 - 0.2)], hek: [0.2, F + 1, 0], mast: [L * 0.8, F + 4.3, 0] }, length: L };
  },
  politie: () => {
    const L = 14; const B = 4; const F = 1;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.8, color: 0x1a3d8f, deck: 0xdddddd });
    const house = box(4, 2.2, B - 1, 0xf2f2f2); house.position.set(L * 0.5, F + 1.1, 0); g.add(house);
    return { group: g, at: { voor: [L * 0.62, F + 3.3, 0], sb: [L * 0.62, F + 2, B / 2 - 0.4], bb: [L * 0.62, F + 2, -(B / 2 - 0.4)], hek: [0.2, F + 1, 0], dak: [L * 0.5, F + 2.5, 0] }, length: L };
  },
  werk: () => {
    const L = 22; const B = 9; const F = 1;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.2, bow: 0.02, color: 0xc9a227, deck: 0x6a6a6a });
    const crane = box(1.2, 8, 1.2, 0x333333); crane.position.set(L * 0.5, F + 4, 0); g.add(crane);
    const jib = box(12, 0.6, 0.6, 0x333333); jib.position.set(L * 0.5 + 5, F + 7.5, 0); jib.rotation.z = 0.35; g.add(jib);
    post(g, L * 0.3, 6, F, 0.06, 0xd9d9d9, B / 2 - 0.6); post(g, L * 0.3, 6, F, 0.06, 0xd9d9d9, -(B / 2 - 0.6));
    return { group: g, at: { sbMast: [L * 0.3, F + 6, B / 2 - 0.6], bbMast: [L * 0.3, F + 6, -(B / 2 - 0.6)] }, length: L };
  },
  visser: () => {
    const L = 20; const B = 6; const F = 1.6;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 2, color: 0x7a1f1f, deck: 0x8a8070 });
    const house = box(4, 2.4, B - 1.6, 0xe8e4da); house.position.set(L * 0.62, F + 1.2, 0); g.add(house);
    post(g, L * 0.8, 7, F, 0.08); post(g, L * 0.3, 8, F, 0.08);
    return { group: g, at: { mast: [L * 0.8, F + 7, 0], achter: [L * 0.3, F + 8, 0], sb: [L * 0.62, F + 2.6, B / 2 - 0.3], bb: [L * 0.62, F + 2.6, -(B / 2 - 0.3)], hek: [0.2, F + 1.2, 0] }, length: L };
  },
  motorKlein: () => {
    const L = 9; const B = 3; const F = 0.8;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.6, color: 0xf2f2f2, deck: 0x9a8a6a });
    const cabin = box(3, 1.2, B - 0.6, 0xf2f2f2); cabin.position.set(L * 0.55, F + 0.6, 0); g.add(cabin);
    post(g, L * 0.9, 0.9, F + 0.1, 0.03); post(g, 0.3, 1.2, F, 0.03);
    return { group: g, at: { voor: [L * 0.9, F + 1.0, 0], sb: [L * 0.72, F + 1.0, B / 2 - 0.2], bb: [L * 0.72, F + 1.0, -(B / 2 - 0.2)], hek: [0.3, F + 1.2, 0],
      rondom: [0.3, F + 1.5, 0], mast: [L * 0.55, F + 2.2, 0] }, length: L };
  },
  sloep: () => {
    const L = 6.5; const B = 2.3; const F = 0.6;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.4, color: 0x0f3d2e, deck: 0x9a7a55, bow: 0.3 });
    post(g, 0.3, 1.1, F, 0.025);
    return { group: g, at: { rondom: [0.3, F + 1.15, 0], sb: [L * 0.93, F + 0.2, 0.08], bb: [L * 0.93, F + 0.2, -0.08], mast: [0.3, F + 1.2, 0] }, length: L };
  },
  roei: () => {
    const L = 4.5; const B = 1.4; const F = 0.45;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.25, color: 0x8b6a43, deck: 0x6b4f33, bow: 0.35 });
    post(g, 0.25, 1, F, 0.02, 0x8b6a43);
    return { group: g, at: { rondom: [0.25, F + 1.02, 0] }, length: L };
  },
  zeil: () => {
    const L = 7; const B = 2.5; const F = 0.7;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.5, color: 0xf2f2f2, deck: 0xb9a57a, bow: 0.3 });
    post(g, L * 0.62, 9, F, 0.05);
    sail(g, [[L * 0.62 - 0.05, F + 0.9, 0], [L * 0.62 - 0.05, F + 8.8, 0], [0.6, F + 0.9, 0]], 0xf4f1e8);
    sail(g, [[L * 0.64, F + 7.8, 0], [L * 0.97, F + 0.5, 0], [L * 0.66, F + 0.6, 0]], 0xf4f1e8);
    post(g, 0.25, 1.1, F, 0.02);
    return { group: g, at: { top: [L * 0.62, F + 9.05, 0], sb: [L * 0.96, F + 0.35, 0.1], bb: [L * 0.96, F + 0.35, -0.1], hek: [0.2, F + 0.5, 0],
      voor: [L * 0.62, F + 4.5, 0.08], rondom: [L * 0.62, F + 9.1, 0], mast: [L * 0.62, F + 6, 0.1],
      voortuig: [L * 0.85, F + 3.8, 0] }, length: L };                // in the voortuig, before the fok: in sight
  },
  zeilGroot: () => {
    const L = 26; const B = 6; const F = 1.2;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.4, color: 0x2a2a2a, deck: 0x8a7a5a, bow: 0.2 });
    post(g, L * 0.6, 20, F, 0.2, 0x8b6a43);
    sail(g, [[L * 0.6 - 0.2, F + 1.5, 0], [L * 0.6 - 0.2, F + 17, 0], [1.5, F + 2, 0]], 0x7a4a2a);
    sail(g, [[L * 0.62, F + 15, 0], [L * 0.98, F + 1.5, 0], [L * 0.64, F + 1.6, 0]], 0x7a4a2a);
    return { group: g, at: { top: [L * 0.6, F + 20, 0], sb: [L * 0.8, F + 0.9, B / 2 - 0.3], bb: [L * 0.8, F + 0.9, -(B / 2 - 0.3)], hek: [0.3, F + 1, 0],
      voortuig: [L * 0.82, F + 8.5, 0] }, length: L };
  },
};

// -- dagmerken, each standing on y = 0 (sizes from BPR 3.04: bol 60, kegel 60 x 60, cilinder 80 x 50,
// ruit 80 x 50 cm; a klein schip may carry them smaller: `klein` halves them)
function dagmerk(vorm, kleur, klein) {
  const k = klein ? 0.5 : 1; const c = KLEUR[kleur] ?? (kleur === 'blauw' ? 0x1f4fd1 : 0x161616);
  const m = mat(c);
  switch (vorm) {
    case 'bol': { const s = new THREE.Mesh(new THREE.SphereGeometry(0.3 * k, 16, 12), m); s.position.y = 0.3 * k; return [s, 0.6 * k]; }
    case 'kegelOmlaag': { const s = new THREE.Mesh(new THREE.ConeGeometry(0.3 * k, 0.6 * k, 16), m); s.rotation.z = Math.PI; s.position.y = 0.3 * k; return [s, 0.6 * k]; }
    case 'cilinder': { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * k, 0.25 * k, 0.8 * k, 16), m); s.position.y = 0.4 * k; return [s, 0.8 * k]; }
    case 'ruit': {
      const g = new THREE.Group();
      for (const dir of [1, -1]) { const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.25 * k, 0.4 * k, 16), m); c2.position.y = (0.4 + dir * 0.2) * k; if (dir < 0) c2.rotation.z = Math.PI; g.add(c2); }
      return [g, 0.8 * k];
    }
    case 'diabolo': {
      const g = new THREE.Group();
      for (const dir of [1, -1]) { const c2 = new THREE.Mesh(new THREE.ConeGeometry(0.3 * k, 0.6 * k, 16), m); c2.position.y = (0.6 + dir * 0.3) * k; if (dir > 0) c2.rotation.z = Math.PI; g.add(c2); }
      return [g, 1.2 * k];
    }
    case 'sleepcilinder': {                                        // yellow, with a black and a white band at each end
      const g = new THREE.Group(); const parts = [['wit', 0.05], ['zwart', 0.1], ['geel', 0.5], ['zwart', 0.1], ['wit', 0.05]];
      let y = 0.8 * k;
      for (const [col, h] of parts) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.25 * k, 0.25 * k, h * k, 16), mat(KLEUR[col])); y -= h * k; s.position.y = y + (h * k) / 2; g.add(s); }
      return [g, 0.8 * k];
    }
    case 'bordRoodWit': {
      const g = new THREE.Group();
      for (const [col, y] of [['rood', 0.75], ['wit', 0.25]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.5 * k, 1 * k), mat(KLEUR[col])); b.position.y = y * k; g.add(b); }
      return [g, 1 * k];
    }
    default: return [new THREE.Group(), 0];
  }
}

/**
 * The configurations the lessons need, from BPR hoofdstuk 3. `schip` picks the hull; each light is
 * [kleur, soort, where, height above that place], soort one of toplicht, sb, bb, heklicht, rondom,
 * flikker; each dagmerk is [vorm, kleur, where, height].
 */
export const CONFIGS = [
  { id: 'groot_motorschip', naam: 'Groot motorschip, varend', artikel: '3.08 lid 1', schip: 'motor',
    lichten: [['wit', 'toplicht', 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'groot_motorschip_tweede_toplicht', naam: 'Groot motorschip met tweede toplicht', artikel: '3.08 lid 2', schip: 'motor',
    lichten: [['wit', 'toplicht', 'voor'], ['wit', 'toplicht', 'achter'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'snel_schip', naam: 'Snel schip', artikel: '3.08 lid 4', schip: 'politie',
    lichten: [['wit', 'toplicht', 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek'], ['geel', 'flikker', 'dak', 0.3], ['geel', 'flikker', 'dak', 1.3]] },
  { id: 'groot_zeil_en_motor', naam: 'Groot schip onder zeil én motor', artikel: '3.08 lid 5', schip: 'zeilGroot',
    lichten: [['wit', 'toplicht', 'top', -6], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']], dagmerken: [['kegelOmlaag', 'zwart', 'voortuig']] },
  { id: 'sleepboot', naam: 'Sleepboot van een sleep', artikel: '3.09 lid 1', schip: 'sleep',
    lichten: [['wit', 'toplicht', 'voor'], ['wit', 'toplicht', 'voor', -1], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['geel', 'heklicht', 'hek']], dagmerken: [['sleepcilinder', 'geel', 'mast']] },
  { id: 'duwstel_klein', naam: 'Duwstel (kort en smal)', artikel: '3.10 lid 4', schip: 'duw',
    lichten: [['wit', 'toplicht', 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'groot_zeilschip', naam: 'Groot zeilschip', artikel: '3.12', schip: 'zeilGroot',
    lichten: [['rood', 'rondom', 'top', -0.3], ['groen', 'rondom', 'top', -1.5], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'klein_motorschip_a', naam: 'Klein motorschip', artikel: '3.13 lid 1a', schip: 'motorKlein',
    lichten: [['wit', 'toplicht', 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'klein_motorschip_rondom', naam: 'Klein motorschip, wit rondom', artikel: '3.13 lid 1b', schip: 'motorKlein',
    lichten: [['wit', 'rondom', 'rondom'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb']] },
  { id: 'klein_open_motorschip_lt7m', naam: 'Open motorbootje < 7 m', artikel: '3.13 lid 2', schip: 'sloep', lichten: [['wit', 'rondom', 'rondom']] },
  { id: 'klein_zeilschip_boeg_hek', naam: 'Klein zeilschip, boordlichten en heklicht', artikel: '3.13 lid 5', schip: 'zeil',
    lichten: [['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'klein_zeilschip_driekleur', naam: 'Klein zeilschip, driekleurenlantaarn', artikel: '3.13 lid 5', schip: 'zeil',
    lichten: [['groen', 'sb', 'top'], ['rood', 'bb', 'top'], ['wit', 'heklicht', 'top']] },
  { id: 'klein_zeilschip_lt7m', naam: 'Klein zeilschip < 7 m, wit rondom', artikel: '3.13 lid 5', schip: 'zeil', lichten: [['wit', 'rondom', 'rondom']] },
  { id: 'klein_schip_spierkracht', naam: 'Klein schip op spierkracht', artikel: '3.13 lid 6', schip: 'roei', lichten: [['wit', 'rondom', 'rondom']] },
  { id: 'klein_zeil_en_motor', naam: 'Klein schip onder zeil én motor', artikel: '3.13 lid 7', schip: 'zeil',
    lichten: [['wit', 'toplicht', 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']], dagmerken: [['kegelOmlaag', 'zwart', 'voortuig', 0, true]] },
  { id: 'gevaarlijke_stoffen_2', naam: 'Schip met gevaarlijke stoffen (2 blauw)', artikel: '3.14 lid 2', schip: 'tanker',
    lichten: [['wit', 'toplicht', 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek'], ['blauw', 'rondom', 'mast'], ['blauw', 'rondom', 'mast', 1]],
    dagmerken: [['kegelOmlaag', 'blauw', 'mast', -1.6], ['kegelOmlaag', 'blauw', 'mast', -2.6]] },
  { id: 'passagiersschip_klein', naam: 'Passagiersschip < 20 m', artikel: '3.15', schip: 'passagier',
    lichten: [['wit', 'toplicht', 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']], dagmerken: [['ruit', 'geel', 'mast']] },
  { id: 'veerpont_niet_vrijvarend', naam: 'Niet-vrijvarende veerpont', artikel: '3.16 lid 1', schip: 'pont', kabel: true,
    lichten: [['wit', 'rondom', 'mast'], ['groen', 'rondom', 'mast', 1]] },
  { id: 'veerpont_vrijvarend', naam: 'Vrijvarende veerpont', artikel: '3.16 lid 3', schip: 'pont',
    lichten: [['wit', 'rondom', 'mast'], ['groen', 'rondom', 'mast', 1], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'onmanoeuvreerbaar', naam: 'Onmanoeuvreerbaar schip', artikel: '3.18', schip: 'motor',
    lichten: [['rood', 'rondom', 'mast'], ['rood', 'rondom', 'mast', -1]], dagmerken: [['bol', 'zwart', 'mid'], ['bol', 'zwart', 'mid', -1]] },
  { id: 'groot_schip_geankerd', naam: 'Groot schip voor anker', artikel: '3.20 lid 2', schip: 'motor',
    lichten: [['wit', 'rondom', 'voor'], ['wit', 'rondom', 'hek', 1]], dagmerken: [['bol', 'zwart', 'voor', 0.3]] },
  { id: 'klein_schip_stilliggend', naam: 'Klein schip voor anker', artikel: '3.20 lid 4', schip: 'sloep',
    lichten: [['wit', 'rondom', 'rondom']], dagmerken: [['bol', 'zwart', 'mast', 0.1, true]] },
  { id: 'werkend_schip', naam: 'Werkend schip (vrije zijde stuurboord)', artikel: '3.25 lid 1', schip: 'werk',
    lichten: [['groen', 'rondom', 'sbMast'], ['groen', 'rondom', 'sbMast', -1], ['rood', 'rondom', 'bbMast']],
    dagmerken: [['ruit', 'groen', 'sbMast', -2.8], ['ruit', 'groen', 'sbMast', -3.8], ['bol', 'rood', 'bbMast', -2.8]] },
  { id: 'vastgevaren_gezonken', naam: 'Vastgevaren of gezonken schip', artikel: '3.25 lid 2', schip: 'motor',
    lichten: [['rood', 'rondom', 'mast'], ['wit', 'rondom', 'mast', -1]], dagmerken: [['bordRoodWit', 'rood', 'mid']] },
  { id: 'handhaving_brandweer', naam: 'Politie, brandweer, hulpverlening', artikel: '3.27', schip: 'politie',
    lichten: [['wit', 'toplicht', 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek'], ['blauw', 'flikker', 'dak', 0.2]] },
  { id: 'bescherming_golfslag', naam: 'Bescherming tegen golfslag', artikel: '3.29', schip: 'motor',
    lichten: [['rood', 'rondom', 'mast'], ['wit', 'rondom', 'mast', -1]], dagmerken: [['bordRoodWit', 'rood', 'mid']] },
  { id: 'vissersschip', naam: 'Vissersschip', artikel: '3.37', schip: 'visser',
    lichten: [['groen', 'rondom', 'mast'], ['wit', 'rondom', 'mast', -1], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']],
    dagmerken: [['diabolo', 'zwart', 'achter', -2]] },
];

const tmp = new THREE.Vector3();

/**
 * A ship in one configuration. group.userData.update(t, night, camera) shows each light only inside
 * its arc as seen from the camera, and flickers what flickers.
 */
export function makeShip(config) {
  const ship = SHIPS[config.schip]();
  const group = new THREE.Group(); group.name = config.id; group.add(ship.group);
  // a kabelpont hauls itself along a cable from bank to bank: it comes aboard at each end, and away
  // from the pont it goes down into the water
  if (config.kabel) {
    const wire = mat(0x2a2a2a, { metalness: 0.4 });
    for (const [x, y] of ship.group.userData.ends) {
      const out = x < 1 ? -1 : 1;
      const from = new THREE.Vector3(x, y, 0); const to = new THREE.Vector3(x + out * 9, -1.2, 0);
      const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, from.distanceTo(to), 6), wire);
      cable.position.copy(from).add(to).multiplyScalar(0.5);
      cable.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
      group.add(cable);
    }
  }
  const lights = [];
  for (const [kleur, soort, where, dy = 0] of config.lichten ?? []) {
    const base = ship.at[where] ?? [0, 2, 0];
    const size = ship.length > 15 ? 2.2 : 1;
    const lamp = makeLamp(kleur, size);
    lamp.position.set(base[0], base[1] + dy, base[2]);
    group.add(lamp);
    lights.push({ lamp, arc: ARC[soort], blink: soort === 'flikker' ? character('VQ') : null, byDay: soort === 'flikker' });
  }
  for (const [vorm, kleur, where, dy = 0, klein = false] of config.dagmerken ?? []) {
    const base = ship.at[where] ?? [0, 2, 0];
    const [shape] = dagmerk(vorm, kleur, klein);
    shape.position.set(base[0], base[1] + dy, base[2]);
    group.add(shape);
  }
  group.userData = {
    config, length: ship.length,
    update(t, night, camera) {
      for (const l of lights) {
        let on = night > 0.3 || l.byDay;                             // by day the lights are out; a flikkerlicht shows by day too
        if (l.arc) {
          tmp.copy(camera.position); l.lamp.parent.worldToLocal(tmp).sub(l.lamp.position);
          const bearing = THREE.MathUtils.radToDeg(Math.atan2(tmp.z, tmp.x));            // 0 ahead, + to starboard
          const [from, to] = l.arc;
          const b = to > 180 ? (bearing + 360) % 360 : bearing;
          on = on && b >= from && b <= to;
        }
        if (l.blink) on = on && l.blink(t);
        l.lamp.userData.set(on, night);
      }
    },
  };
  return group;
}
