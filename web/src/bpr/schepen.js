import * as THREE from 'three';
import { makeLamp, KLEUR } from './betonning.js';
import { character } from './lichtkarakter.js';

// Other ships with their lights and dagmerken (BPR hoofdstuk 3, bijlage 3; reference/bpr/LICHTEN.md):
// simple hulls, one per kind of ship, each with the places its lights go, and the configurations of
// the BPR laid on them. A light shows only inside its arc, as seen from the camera: toplicht 225
// degrees ahead, a boordlicht 112.5 degrees from dead ahead to its own side, heklicht 135 degrees
// astern, rondom all round. Each ship stands on its waterline at its origin, the bow towards +x and
// starboard towards +z, like the lelievlet. A samenstel (a sleep, a duwstel, a gekoppeld samenstel) is
// all its craft in the one group, the hindmost stern at the origin. Dagmerken are for the day, but here
// they stay up at night too, so they hang where they hide no light: below the lights on the same mast.

// a boordlicht's screen lets it show a few degrees across the bow, so from dead ahead both are seen
// (COLREG annex I: 1 to 3 degrees); without that a light off the centreline would go out head on
const ACROSS = 3;
const ARC = {
  toplicht: [-112.5, 112.5], sb: [-ACROSS, 112.5], bb: [-112.5, ACROSS], heklicht: [112.5, 247.5],
  rondom: null, flikker: null, flikkerlicht: null, zwaaiRond: null, zwaaiHeen: null,
};
// 'flikker' flickers fast (BPR 1.01 C 6°, 100-150 a minute), 'flikkerlicht' is the plain flikkerlicht
// (C 5°, 50-60 a minute); both are shown by day as well where the BPR has them
const BLINK = { flikker: 'VQ', flikkerlicht: 'Q' };
// what a hand swings: in a circle (nood, 3.30) or to and fro (onmanoeuvreerbaar, 3.18)
const SWING = { zwaaiRond: 'rond', zwaaiHeen: 'heen' };
// signs that stay up by night: the A flag is lit (3.38), and so are the verbodsborden on board (3.31 to 3.33),
// the lichtblauw bord may go with its light (6.04a), a buoy is a buoy
const NIGHT_TOO = new Set(['vlagA', 'bordToegang', 'bordRoken', 'bordLigplaats', 'bordBlauw', 'boei']);
const LICHTBLAUW = 0x86c8ec; const VLAGBLAUW = 0x005c8e;

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.75, ...extra });
const box = (w, h, d, color) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
const lampSize = (length) => (length > 100 ? 4 : length > 15 ? 2.2 : 1);

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

/** A rope, cable or chain, straight from `a` to `b` ([x, y, z]). */
function rope(group, a, b, r = 0.035, color = 0x2a2a2a) {
  const from = new THREE.Vector3(...a); const to = new THREE.Vector3(...b);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, from.distanceTo(to), 6), mat(color, { metalness: 0.3 }));
  m.position.copy(from).add(to).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), to.clone().sub(from).normalize());
  group.add(m);
}

/**
 * Several craft in one group: parts [name, ship, x, z], each ship's places then 'name.place'; ropes
 * [from, to] between places (or points). The length is from the origin to the foremost bow.
 */
function fleet(parts, ropes = []) {
  const group = new THREE.Group(); const at = {}; const palen = {}; const sizes = {}; let length = 0;
  for (const [name, s, x = 0, z = 0] of parts) {
    s.group.position.set(x, 0, z); group.add(s.group);
    for (const [k, p] of Object.entries(s.at)) { at[`${name}.${k}`] = [p[0] + x, p[1], p[2] + z]; sizes[`${name}.${k}`] = lampSize(s.length); }
    for (const [k, y] of Object.entries(s.palen ?? {})) palen[`${name}.${k}`] = y;
    length = Math.max(length, x + s.length);
  }
  for (const [a, b] of ropes) rope(group, typeof a === 'string' ? at[a] : a, typeof b === 'string' ? at[b] : b);
  return { group, at, palen, sizes, length };
}

/**
 * A lelievlet-sized open boat (5.6 m, after the lelievlet itself, but as plain as the others): a mast in
 * its koker a third from the bow, set or lying down, sails up or not, oars out, an outboard on the transom,
 * a short stick aft for a light (bijlage 3 schets 30).
 */
function vlet({ mast = true, zeil = false, riemen = false, motor = false, stok = false } = {}) {
  const L = 5.6; const B = 1.85; const F = 0.55;
  const g = hull({ length: L, beam: B, freeboard: F, draft: 0.3, color: 0x24425e, deck: 0x9a7a55, bow: 0.35, sheer: 0.2 });
  const mx = L * 0.68; const top = F + 5.2;
  if (mast) post(g, mx, top - F + 0.2, F - 0.2, 0.05, 0xc8a46a);
  else { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 5, 8), mat(0xc8a46a)); m.rotation.z = Math.PI / 2; m.position.set(L * 0.5, F + 0.25, 0.25); g.add(m); }
  if (zeil) {
    sail(g, [[mx - 0.05, F + 0.6, 0], [mx - 0.05, top - 0.3, 0], [0.4, F + 0.7, 0]], 0xd8c6a0);
    sail(g, [[mx + 0.05, top - 1.2, 0], [L * 0.98, F + 0.35, 0], [mx + 0.1, F + 0.5, 0]], 0xd8c6a0);
  }
  if (riemen) {
    for (const x of [L * 0.42, L * 0.62]) {
      for (const s of [1, -1]) rope(g, [x, F + 0.12, s * (B / 2 - 0.05)], [x - 0.5, -0.05, s * (B / 2 + 2.1)], 0.03, 0xc8a46a);
    }
  }
  if (motor) {
    const head = box(0.35, 0.45, 0.3, 0x2a2a2a); head.position.set(-0.2, F + 0.1, 0); g.add(head);
    const leg = box(0.1, 0.9, 0.08, 0x2a2a2a); leg.position.set(-0.2, F - 0.5, 0); g.add(leg);
  }
  if (stok) post(g, 0.25, 1.3, F, 0.02, 0xc8a46a);
  return { group: g, at: { top: [mx, top + 0.06, 0], voortuig: [L * 0.86, F + 1.9, 0], stok: [0.25, F + 1.36, 0], hand: [L * 0.3, F + 1.1, 0],
    trosVoor: [L, F + 0.2, 0], trosAchter: [0, F + 0.2, 0] }, length: L };
}

// -- the ships: each builds its hull and says where its lights go ([x, y, z] on the ship). `palen`: places
// with nothing to stand on yet, and the height a post for them starts from - drawn only when a
// configuration puts something there.
const SHIPS = {
  // a binnenvaartschip, a Kempenaar of some 55 m: toplicht on a mast on the voorschip, the boordlichten
  // on the wheelhouse, the heklicht on the stern. `ra`: a yard across the mast aft, for signs on either side.
  // `dek`: on the hatch in the lengte-as, forward of the light on 'sbPaal' (not behind it from the other side).
  motor: (opts = {}) => {
    const L = 55; const B = 6.6; const F = 1.3;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 2 });
    const hold = box(L * 0.62, 1.1, B - 1.2, 0x7b6d57); hold.position.set(L * 0.5, F + 0.55, 0); g.add(hold);
    const house = box(3.2, 2.6, B - 1.6, 0xe8e4da); house.position.set(4.2, F + 1.3, 0); g.add(house);
    const roof = box(3.6, 0.15, B - 1.2, 0x333333); roof.position.set(4.2, F + 2.65, 0); g.add(roof);
    post(g, L * 0.95, 5, F, 0.08); post(g, 3.2, 5.2, F + 2.7, 0.06);
    const at = { voor: [L * 0.95, F + 5, 0], sb: [4.2, F + 2.9, B / 2 - 0.9], bb: [4.2, F + 2.9, -(B / 2 - 0.9)], hek: [0.3, F + 1.2, 0],
      achter: [3.2, F + 7.9, 0], mast: [3.2, F + 5.5, 0], mid: [L * 0.5, F + 3.5, 0],
      sbPaal: [L * 0.5, F, B / 2 - 0.3], bordSb: [5.6, F + 3.9, B / 2 - 0.75], dek: [L * 0.65, F + 3, 0], trosVoor: [L, F + 0.4, 0], trosAchter: [0.4, F + 0.4, 0] };
    if (opts.ra) {
      const ra = box(0.12, 0.12, B - 0.6, 0xd9d9d9); ra.position.set(3.2, F + 6.5, 0); g.add(ra);
      at.raSb = [3.2, F + 6.35, B / 2 - 0.35]; at.raBb = [3.2, F + 6.35, -(B / 2 - 0.35)];
    }
    return { group: g, at, palen: { mid: F + 1.1, sbPaal: F, bordSb: F + 2.7, dek: F + 1.1, hek: F }, length: L };
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
    // counted as one motorschip (3.10 lid 4): the boordlichten on the wheelhouse well below the toplicht on the bak
    return { group: g, at: { voor: [L + 68, 6.5, 0], sb: [6, F + 3.5, B / 2 - 0.8], bb: [6, F + 3.5, -(B / 2 - 0.8)], hek: [0.3, F + 1.5, 0] }, palen: { hek: F }, length: L + 70 };
  },
  // a sleepboot: two or three toplichten on its mast, the sleephaak aft of the middle
  sleep: () => {
    const L = 16; const B = 5; const F = 1.2;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.8, color: 0x1f2b40 });
    const house = box(4, 2.8, B - 1.4, 0xe8e4da); house.position.set(L * 0.55, F + 1.4, 0); g.add(house);
    post(g, L * 0.7, 6, F, 0.07);
    return { group: g, at: { voor: [L * 0.7, F + 6, 0], sb: [L * 0.55, F + 3, B / 2 - 0.7], bb: [L * 0.55, F + 3, -(B / 2 - 0.7)], hek: [0.3, F + 1, 0], mast: [L * 0.7, F + 2.9, 0],
      trosVoor: [L, F + 0.4, 0], trosAchter: [L * 0.3, F + 0.6, 0] }, palen: { hek: F }, length: L };
  },
  // a rijnaak without an engine, as it goes in a sleep: a mast on the voorschip for its light, a roef aft
  sleepschip: () => {
    const L = 50; const B = 6.6; const F = 1.2;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 2.2, color: 0x2a2620, deck: 0x5a4c3a });
    const hold = box(L * 0.7, 1, B - 1.2, 0x6a5a45); hold.position.set(L * 0.52, F + 0.5, 0); g.add(hold);
    const roef = box(3, 1.8, B - 2, 0xd8d0c0); roef.position.set(3, F + 0.9, 0); g.add(roef);
    post(g, L * 0.9, 5.2, F, 0.08);
    return { group: g, at: { voor: [L * 0.9, F + 5.2, 0], sb: [5, F, B / 2 - 0.4], bb: [5, F, -(B / 2 - 0.4)], hek: [0.3, F, 0],
      trosVoor: [L, F + 0.3, 0], trosAchter: [0.3, F + 0.3, 0] }, palen: { sb: F, bb: F, hek: F }, length: L };
  },
  // a duwbak of 70 x 11 m: nothing on it but what a duwstel puts there, on posts
  bak: () => {
    const L = 70; const B = 11; const F = 1.6;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 3, bow: 0.05, color: 0x3a3226, deck: 0x5a4c3a });
    const hatch = box(L - 8, 0.9, B - 1.6, 0x4a3e30); hatch.position.set(L / 2, F + 0.45, 0); g.add(hatch);
    return { group: g, at: { voor: [L - 2.5, F, 0], voorBb: [L - 2.5, F, -0.625], voorSb: [L - 2.5, F, 0.625], mid: [L / 2, F + 0.9, 0],
      achterSb: [1.5, F, B / 2 - 0.5], achterBb: [1.5, F, -(B / 2 - 0.5)], trosVoor: [L, F + 0.3, 0] },
    palen: { voor: F, voorBb: F, voorSb: F, mid: F + 0.9, achterSb: F, achterBb: F }, length: L };
  },
  // the duwboot of a big duwstel: its wheelhouse high up on a tower, to see over the bakken
  duwboot: () => {
    const L = 28; const B = 12; const F = 1.8;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 2, bow: 0.02, color: 0x24302a });
    const house = box(10, 2.6, B - 3, 0xe8e4da); house.position.set(12, F + 1.3, 0); g.add(house);
    const tower = box(3, 4, 3, 0xe8e4da); tower.position.set(12, F + 4.6, 0); g.add(tower);
    const wheel = box(4, 2.4, B - 4, 0xdfe6ea); wheel.position.set(12, F + 7.8, 0); g.add(wheel);
    post(g, 12, 2.6, F + 9, 0.08);
    // sb, bb: boordlichten beside the house, for when the duwboten are the widest part of the duwstel (3.10 lid 3)
    return { group: g, at: { mast: [12, F + 11.6, 0], hek: [1.2, F + 3, 0], hekSb: [1.2, F + 3, 1.25], hekBb: [1.2, F + 3, -1.25], sb: [14, F + 3, B / 2 - 0.5], bb: [14, F + 3, -(B / 2 - 0.5)] },
      palen: { hek: F, hekSb: F, hekBb: F, sb: F, bb: F }, length: L };
  },
  // a duwstel of four bakken, two by two, and its duwboot behind the two hindmost: 168 x 22 m
  duwstel4: () => fleet([['duwboot', SHIPS.duwboot(), 0, 0], ['b1', SHIPS.bak(), 28, -5.5], ['b2', SHIPS.bak(), 28, 5.5], ['b3', SHIPS.bak(), 98, -5.5], ['b4', SHIPS.bak(), 98, 5.5]]),
  // the same pushed by two duwboten side by side, 'ds' to starboard and 'db' to port: 168 x 24 m
  duwstel4TweeDuwboten: () => fleet([['db', SHIPS.duwboot(), 0, -6], ['ds', SHIPS.duwboot(), 0, 6], ['b1', SHIPS.bak(), 28, -5.5], ['b2', SHIPS.bak(), 28, 5.5],
    ['b3', SHIPS.bak(), 98, -5.5], ['b4', SHIPS.bak(), 98, 5.5]]),
  // the same, a sleepboot ahead of it on a line to help it along
  duwstel4Assist: () => fleet([['duwboot', SHIPS.duwboot(), 0, 0], ['b1', SHIPS.bak(), 28, -5.5], ['b2', SHIPS.bak(), 28, 5.5], ['b3', SHIPS.bak(), 98, -5.5], ['b4', SHIPS.bak(), 98, 5.5],
    ['sleper', SHIPS.sleep(), 208, 0]], [['sleper.trosAchter', [168, 1.9, 0]]]),
  // a groot motorschip with a sleepboot ahead of it, helping it along
  motorAssist: () => fleet([['schip', SHIPS.motor(), 0, 0], ['sleper', SHIPS.sleep(), 90, 0]], [['sleper.trosAchter', 'schip.trosVoor']]),
  // slepen: the sleepboot ahead, the lengths behind it on 35 m of tros
  sleep1: () => fleet([['a', SHIPS.sleepschip(), 0, 0], ['sleper', SHIPS.sleep(), 85, 0]], [['sleper.trosAchter', 'a.trosVoor']]),
  sleep2: () => fleet([['a', SHIPS.sleepschip(), 0, 0], ['b', SHIPS.sleepschip(), 85, 0], ['sleper', SHIPS.sleep(), 170, 0]],
    [['sleper.trosAchter', 'b.trosVoor'], ['b.trosAchter', 'a.trosVoor']]),
  // the last length two ships side by side
  sleepLangszij: () => fleet([['a1', SHIPS.sleepschip(), 0, -3.3], ['a2', SHIPS.sleepschip(), 0, 3.3], ['b', SHIPS.sleepschip(), 85, 0], ['sleper', SHIPS.sleep(), 170, 0]],
    [['sleper.trosAchter', 'b.trosVoor'], ['b.trosAchter', 'a1.trosVoor'], ['b.trosAchter', 'a2.trosVoor']]),
  // two sleepboten side by side, not in line, on one length
  sleepTweeSlepers: () => fleet([['a', SHIPS.sleepschip(), 0, 0], ['s1', SHIPS.sleep(), 85, -8], ['s2', SHIPS.sleep(), 85, 8]],
    [['s1.trosAchter', 'a.trosVoor'], ['s2.trosAchter', 'a.trosVoor']]),
  // a gekoppeld samenstel: the motorschip to port, a ship without an engine made fast to its starboard side
  gekoppeld: () => fleet([['motor', SHIPS.motor(), 0, -3.3], ['bak', SHIPS.sleepschip(), 0, 3.3]]),
  // the same, a sleepboot ahead of the two on a line to both bows, helping them along: on the middle, clear of both toplichten
  gekoppeldAssist: () => fleet([['motor', SHIPS.motor(), 0, -3.3], ['bak', SHIPS.sleepschip(), 0, 3.3], ['sleper', SHIPS.sleep(), 90, 0]],
    [['sleper.trosAchter', 'motor.trosVoor'], ['sleper.trosAchter', 'bak.trosVoor']]),
  // a drijvend voorwerp on tow: a bouwponton with a bok on it
  ponton: () => {
    const L = 30; const B = 10; const F = 1;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1, bow: 0.01, color: 0x575d63, deck: 0x6f747a, sheer: 0.05 });
    const bok = box(1, 7, 1, 0xc9a227); bok.position.set(L * 0.35, F + 3.5, 0); g.add(bok);
    const giek = box(10, 0.5, 0.5, 0xc9a227); giek.position.set(L * 0.35 + 4.5, F + 6.5, 0); giek.rotation.z = 0.5; g.add(giek);
    return { group: g, at: { hoekVSb: [L - 0.4, F, B / 2 - 0.4], hoekVBb: [L - 0.4, F, -(B / 2 - 0.4)], hoekASb: [0.4, F, B / 2 - 0.4], hoekABb: [0.4, F, -(B / 2 - 0.4)],
      trosVoor: [L, F + 0.3, 0] }, palen: { hoekVSb: F, hoekVBb: F, hoekASb: F, hoekABb: F }, length: L };
  },
  pontonSleep: () => fleet([['p', SHIPS.ponton(), 0, 0], ['sleper', SHIPS.sleep(), 60, 0]], [['sleper.trosAchter', 'p.trosVoor']]),
  // a drijvende steiger, moored along the bank to port
  steiger: () => {
    const L = 24; const B = 3.5; const F = 0.6;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.6, bow: 0.01, color: 0x4a4f55, deck: 0x8a6a44, sheer: 0.02 });
    for (const s of [1, -1]) { const rail = box(L - 1, 0.05, 0.05, 0xd9d9d9); rail.position.set(L / 2, F + 1, s * (B / 2 - 0.1)); g.add(rail); }
    return { group: g, at: { hoekVSb: [L - 0.3, F, B / 2 - 0.2], hoekASb: [0.3, F, B / 2 - 0.2] }, palen: { hoekVSb: F, hoekASb: F }, length: L };
  },
  pont: () => {
    const L = 18; const B = 8; const F = 0.9;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.2, bow: 0.01, color: 0x3c4a3c, deck: 0x7a7a70 });
    for (const x of [-1.5, L + 0.2]) { const ramp = box(2, 0.2, B - 2, 0x555555); ramp.position.set(x + 0.4, F + 0.1, 0); g.add(ramp); }
    const house = box(2.2, 2.4, 2.2, 0xe8e4da); house.position.set(L / 2, F + 1.2, B / 2 - 1.3); g.add(house);
    post(g, L / 2, 5.2, F + 2.4, 0.05, 0xd9d9d9, B / 2 - 1.3);
    g.userData.ends = [[-1.2, F + 0.35], [L + 0.8, F + 0.35]];      // where a cable would run on board, fore and aft
    return { group: g, at: { mast: [L / 2, F + 5.5, B / 2 - 1.3], sb: [L / 2 + 1.2, F + 2.6, B / 2 - 0.2], bb: [L / 2 + 1.2, F + 2.6, -(B / 2 - 0.2)], hek: [0.2, F + 1, 0],
      trosVoor: [L + 1, F + 0.4, 0] }, palen: { hek: F }, length: L };
  },
  // a vrijvarende pont at its aanlegplaats: its ramp down on the landing ahead of it
  pontAanleg: () => {
    const s = SHIPS.pont();
    const stoep = box(10, 0.4, 10, 0x9a968c); stoep.position.set(s.length + 5.5, 0.35, 0); stoep.rotation.z = 0.2; s.group.add(stoep);
    return s;
  },
  // a drijver of a gierpont: a small boat with a bok that carries the cable, and a post for its light
  drijver: () => {
    const L = 6; const B = 2.4; const F = 0.6;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.5, bow: 0.3, color: 0x3c4a3c, deck: 0x7a7a70 });
    post(g, L * 0.5, 1.6, F, 0.05, 0x555555, 0.6); post(g, L * 0.5, 1.6, F, 0.05, 0x555555, -0.6);
    post(g, L * 0.3, 2.8, F, 0.04);
    return { group: g, at: { kabel: [L * 0.5, F + 1.6, 0], licht: [L * 0.3, F + 2.85, 0] }, length: L };
  },
  // a gierpont: the pont on its long cable, which runs upstream (+x) over two drijvers to its anchor
  gierpont: () => fleet([['pont', SHIPS.pont(), 0, 0], ['d1', SHIPS.drijver(), 45, 0], ['d2', SHIPS.drijver(), 80, 0]],
    [['pont.trosVoor', 'd1.kabel'], ['d1.kabel', 'd2.kabel'], ['d2.kabel', [118, -4, 0]]]),
  passagier: () => {
    const L = 18; const B = 4.2; const F = 0.8;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.9, color: 0x1d3a5a, deck: 0x9a9080 });
    const cabin = box(L * 0.7, 1.9, B - 0.6, 0xdfe6ea); cabin.position.set(L * 0.45, F + 0.95, 0); g.add(cabin);
    post(g, L * 0.8, 3.3, F + 1.9, 0.05);
    // a groot schip (BPR 1.01 A 4° b): the toplicht 4 m up at least, its length being under 40 m
    return { group: g, at: { voor: [L * 0.8, F + 3.45, 0], sb: [L * 0.78, F + 1.6, B / 2 - 0.2], bb: [L * 0.78, F + 1.6, -(B / 2 - 0.2)], hek: [0.2, F + 1, 0], mast: [L * 0.8, F + 4.3, 0] }, palen: { hek: F }, length: L };
  },
  // a snel schip: a fast passenger catamaran of 35 m, its yellow flashing lights at the top of the mast
  snelVeer: () => {
    const L = 35; const B = 9; const F = 1.8;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1, bow: 0.25, color: 0xd8dde0, deck: 0x8a9096 });
    const cabin = box(L * 0.6, 2.4, B - 1, 0x2a3440); cabin.position.set(L * 0.5, F + 1.2, 0); g.add(cabin);
    const bridge = box(5, 1.2, B - 3, 0x2a3440); bridge.position.set(L * 0.62, F + 3, 0); g.add(bridge);
    post(g, L * 0.62, 4.6, F + 3.6, 0.05);
    return { group: g, at: { voor: [L * 0.62, F + 4.6, 0], sb: [L * 0.79, F + 2.6, B / 2 - 0.45], bb: [L * 0.79, F + 2.6, -(B / 2 - 0.45)], hek: [0.3, F + 1, 0],
      top: [L * 0.62, F + 8.2, 0] }, palen: { hek: F }, length: L };
  },
  politie: () => {
    const L = 14; const B = 4; const F = 1;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.8, color: 0x1a3d8f, deck: 0xdddddd });
    const house = box(4, 2.2, B - 1, 0xf2f2f2); house.position.set(L * 0.5, F + 1.1, 0); g.add(house);
    return { group: g, at: { voor: [L * 0.62, F + 3.3, 0], sb: [L * 0.62, F + 2, B / 2 - 0.4], bb: [L * 0.62, F + 2, -(B / 2 - 0.4)], hek: [0.2, F + 1, 0], dak: [L * 0.5, F + 2.5, 0.45],
      boeg: [L * 0.88, F, 0] }, palen: { boeg: F, hek: F, voor: F + 2.2, dak: F + 2.2 }, length: L };
  },
  werk: () => {
    const L = 22; const B = 9; const F = 1;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.2, bow: 0.02, color: 0xc9a227, deck: 0x6a6a6a });
    const crane = box(1.2, 8, 1.2, 0x333333); crane.position.set(L * 0.5, F + 4, 0); g.add(crane);
    const jib = box(12, 0.6, 0.6, 0x333333); jib.position.set(L * 0.5 + 5, F + 7.5, 0); jib.rotation.z = 0.35; g.add(jib);
    post(g, L * 0.3, 6, F, 0.06, 0xd9d9d9, B / 2 - 0.6); post(g, L * 0.3, 6, F, 0.06, 0xd9d9d9, -(B / 2 - 0.6));
    return { group: g, at: { sbMast: [L * 0.3, F + 6, B / 2 - 0.6], bbMast: [L * 0.3, F + 6, -(B / 2 - 0.6)] }, length: L };
  },
  // a varend werkschip, a baggerschip of 60 m: its signs on a tall mast with a yard on the wheelhouse aft,
  // the dagmerken below the lights so that both are seen
  hopper: () => {
    const L = 60; const B = 9; const F = 1.5;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 2.5, color: 0x5a2a20 });
    const hold = box(L * 0.55, 1.2, B - 2, 0x4a4030); hold.position.set(L * 0.52, F + 0.6, 0); g.add(hold);
    const house = box(6, 3.5, B - 2, 0xe8e4da); house.position.set(5, F + 1.75, 0); g.add(house);
    const wing = box(1.2, 0.2, B, 0xe8e4da); wing.position.set(6.5, F + 3.5, 0); g.add(wing);
    post(g, 5, 15 - (F + 3.5), F + 3.5, 0.08);
    const ra = box(0.15, 0.15, B - 1, 0xd9d9d9); ra.position.set(5, 9, 0); g.add(ra);
    for (const z of [(B - 1) / 2, -(B - 1) / 2]) rope(g, [5, 9, z], [5, 5.25, z], 0.015);   // the lines the signs at the yard's ends hang on
    post(g, L * 0.95, 5, F, 0.08);
    // the crane and the zuigbuis on her bakboord side, the side that is blocked
    const crane = box(1, 6, 1, 0x333333); crane.position.set(L * 0.7, F + 3, -(B / 2 - 1.5)); g.add(crane);
    const pipe = box(14, 0.6, 0.6, 0x333333); pipe.position.set(L * 0.7 - 4, F + 1.2, -(B / 2 + 0.2)); pipe.rotation.z = -0.2; g.add(pipe);
    return { group: g, at: { voor: [L * 0.95, F + 5, 0], sb: [6.5, F + 3.75, B / 2 - 0.3], bb: [6.5, F + 3.75, -(B / 2 - 0.3)], hek: [0.3, F + 1.5, 0],
      top: [5, 15, 0], raSb: [5, 8.85, (B - 1) / 2], raBb: [5, 8.85, -(B - 1) / 2] }, palen: { hek: F }, length: L };
  },
  // a werkboot of 15 m: wheelhouse forward, a small crane aft
  werkboot: () => {
    const L = 15; const B = 5.5; const F = 1.2;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.2, bow: 0.12, color: 0xd9822b, deck: 0x6a6a6a });
    const house = box(3.4, 2.4, B - 1.6, 0xe8e4da); house.position.set(L * 0.65, F + 1.2, 0); g.add(house);
    const crane = box(0.5, 2.5, 0.5, 0x333333); crane.position.set(L * 0.2, F + 1.25, 0); g.add(crane);
    const jib = box(4, 0.3, 0.3, 0x333333); jib.position.set(L * 0.2 + 1.6, F + 2.5, 0); jib.rotation.z = 0.3; g.add(jib);
    post(g, L * 0.65, 2.3, F + 2.4, 0.05);
    return { group: g, at: { voor: [L * 0.65, F + 4.0, 0], sb: [L * 0.65 + 1.75, F + 2.0, B / 2 - 0.75], bb: [L * 0.65 + 1.75, F + 2.0, -(B / 2 - 0.75)], hek: [0.3, F + 1, 0],
      top: [L * 0.65, F + 4.75, 0] }, palen: { hek: F }, length: L };
  },
  visser: () => {
    const L = 20; const B = 6; const F = 1.6;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 2, color: 0x7a1f1f, deck: 0x8a8070 });
    const house = box(4, 2.4, B - 1.6, 0xe8e4da); house.position.set(L * 0.62, F + 1.2, 0); g.add(house);
    post(g, L * 0.8, 7, F, 0.08); post(g, L * 0.3, 6, F, 0.08);
    return { group: g, at: { mast: [L * 0.8, F + 7, 0], achter: [L * 0.3, F + 6, 0], sb: [L * 0.62, F + 2.6, B / 2 - 0.3], bb: [L * 0.62, F + 2.6, -(B / 2 - 0.3)], hek: [0.2, F + 1.2, 0],
      trosVoor: [L, F + 0.4, 0] }, palen: { hek: F }, length: L };
  },
  // a fuikenvisser lying still, its uitlegger out to starboard with the net hanging from it
  visserNet: () => {
    const s = SHIPS.visser(); const F = 1.6; const x = 9; const out = 12;
    rope(s.group, [x, F + 1.2, 2.8], [x, F + 1.2, out], 0.08, 0x8b6a43);
    const net = new THREE.Mesh(new THREE.PlaneGeometry(out - 4, 3.2), mat(0x30402a, { side: THREE.DoubleSide, transparent: true, opacity: 0.7 }));
    net.position.set(x, F - 0.4, (out + 4) / 2); net.rotation.y = Math.PI / 2; s.group.add(net);
    post(s.group, x, 1.5, F + 1.2, 0.04, 0x8b6a43, out);
    s.at.net = [x, F + 2.75, out];
    return s;
  },
  // a mijnenopruimingsschip of the navy: the three green lights at the top and the yard ends of its mast
  mijnen: () => {
    const L = 50; const B = 10; const F = 2.5; const mx = L * 0.55;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 2.5, bow: 0.25, color: 0x7d868c, deck: 0x5d6468 });
    const house = box(18, 4, B - 2, 0x8d969c); house.position.set(mx, F + 2, 0); g.add(house);
    post(g, mx, 11, F + 4, 0.1);
    const ra = box(0.15, 0.15, 8, 0xd9d9d9); ra.position.set(mx, 12, 0); g.add(ra);
    return { group: g, at: { top: [mx, F + 15.05, 0], raSb: [mx, 11.85, 3.9], raBb: [mx, 11.85, -3.9], voor: [mx + 0.25, 10, 0],
      sb: [mx + 9.1, F + 3.6, B / 2 - 1], bb: [mx + 9.1, F + 3.6, -(B / 2 - 1)], hek: [0.3, F + 0.8, 0] }, palen: { hek: F }, length: L };
  },
  // a loodsboot of 20 m: its mast on the voorschip
  loods: () => {
    const L = 20; const B = 5.5; const F = 1.6; const mx = L * 0.66;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.4, bow: 0.25, color: 0x161c24, deck: 0x6a6a6a });
    const house = box(6, 2.4, B - 1, 0xe8e4da); house.position.set(L * 0.55, F + 1.2, 0); g.add(house);
    post(g, mx, 4.8, F + 2.4, 0.05);
    return { group: g, at: { top: [mx, F + 7.25, 0], sb: [L * 0.55 + 3.1, F + 1.8, B / 2 - 0.4], bb: [L * 0.55 + 3.1, F + 1.8, -(B / 2 - 0.4)], hek: [0.3, F + 1, 0] }, palen: { hek: F }, length: L };
  },
  // a rib that divers go out from: a post amidships for its rondom light, the A board below it
  rib: () => {
    const L = 7.5; const B = 2.8; const F = 0.7;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.4, bow: 0.3, color: 0x3a3f45, deck: 0x55595e, sheer: 0.15 });
    const console = box(0.8, 1, 0.9, 0xd9d9d9); console.position.set(L * 0.55, F + 0.5, 0); g.add(console);
    post(g, L * 0.35, 2.6, F, 0.04);
    return { group: g, at: { rondom: [L * 0.35, F + 2.65, 0], vlag: [L * 0.35, F + 1.3, 0], boegSb: [L * 0.97, F + 0.3, 0.05], boegBb: [L * 0.97, F + 0.3, -0.05] }, length: L };
  },
  // a zeeschip of 150 m: a toplicht on the foremast, a higher one aft, what hoofdstuk 10 adds in red on the mainmast (on
  // a bracket at its forward starboard side: neither ahead, astern nor abeam behind the mast)
  zeeschip: () => {
    const L = 150; const B = 22; const F = 8;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 7, bow: 0.15, color: 0x22303a, deck: 0x6a4a3a, sheer: 1.5 });
    const house = box(14, 14, B - 2, 0xe8e4da); house.position.set(16, F + 7, 0); g.add(house);
    const cargo = box(L * 0.6, 5, B - 3, 0x8a3a2a); cargo.position.set(L * 0.58, F + 2.5, 0); g.add(cargo);
    post(g, L * 0.9, 10, F, 0.25); post(g, 16, 9, F + 14, 0.2);
    return { group: g, at: { voor: [L * 0.9, F + 10, 0], achter: [16, F + 23, 0], rood: [16.35, F + 20, 0.35], sb: [23.3, F + 4, B / 2 - 0.5], bb: [23.3, F + 4, -(B / 2 - 0.5)], hek: [0.5, F + 2, 0] }, palen: { hek: F }, length: L };
  },
  motorKlein: () => {
    const L = 9; const B = 3; const F = 0.8;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.6, color: 0xf2f2f2, deck: 0x9a8a6a });
    const cabin = box(3, 1.2, B - 0.6, 0xf2f2f2); cabin.position.set(L * 0.55, F + 0.6, 0); g.add(cabin);
    post(g, L * 0.9, 0.9, F + 0.1, 0.03); post(g, 0.3, 1.2, F, 0.03);
    return { group: g, at: { voor: [L * 0.9, F + 1.0, 0], sb: [L * 0.72, F + 1.0, B / 2 - 0.2], bb: [L * 0.72, F + 1.0, -(B / 2 - 0.2)], hek: [0.3, F + 1.2, 0],
      rondom: [0.3, F + 1.5, 0], mast: [L * 0.55, F + 2.2, 0], boegSb: [L * 0.97, F + 0.35, 0.05], boegBb: [L * 0.97, F + 0.35, -0.05],
      trosVoor: [L, F + 0.2, 0], trosAchter: [0.2, F + 0.3, 0] }, palen: { mast: F + 1.2 }, length: L };
  },
  sloep: () => {
    const L = 6.5; const B = 2.3; const F = 0.6;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.4, color: 0x0f3d2e, deck: 0x9a7a55, bow: 0.3 });
    post(g, 0.3, 1.1, F, 0.025);
    return { group: g, at: { rondom: [0.3, F + 1.15, 0], sb: [L * 0.93, F + 0.2, 0.08], bb: [L * 0.93, F + 0.2, -0.08], mast: [0.3, F + 1.2, 0] }, palen: { mast: F }, length: L };
  },
  roei: () => {
    const L = 4.5; const B = 1.4; const F = 0.45;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.25, color: 0x8b6a43, deck: 0x6b4f33, bow: 0.35 });
    post(g, 0.25, 1, F, 0.02, 0x8b6a43);
    return { group: g, at: { rondom: [0.25, F + 1.02, 0] }, length: L };
  },
  // a klein motorschip (a volgboot) with a rowing boat made fast alongside to port
  motorKleinLangszij: () => fleet([['m', SHIPS.motorKlein(), 0, 0], ['roei', SHIPS.roei(), 2.5, -2.25]]),
  // a volgboot towing lelievletten in a line, on 8 and 12 m of line
  volgbootEenVlet: () => fleet([['v1', vlet({ mast: false, stok: true }), 0, 0], ['m', SHIPS.motorKlein(), 17.6, 0]], [['m.trosAchter', 'v1.trosVoor']]),
  volgbootTweeVletten: () => fleet([['v2', vlet({ mast: false, stok: true }), 0, 0], ['v1', vlet({ mast: false, stok: true }), 13.6, 0], ['m', SHIPS.motorKlein(), 31.2, 0]],
    [['m.trosAchter', 'v1.trosVoor'], ['v1.trosAchter', 'v2.trosVoor']]),
  zeil: () => {
    const L = 7; const B = 2.5; const F = 0.7;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 0.5, color: 0xf2f2f2, deck: 0xb9a57a, bow: 0.3 });
    post(g, L * 0.62, 9, F, 0.05);
    sail(g, [[L * 0.62 - 0.05, F + 0.9, 0], [L * 0.62 - 0.05, F + 8.8, 0], [0.6, F + 0.9, 0]], 0xf4f1e8);
    sail(g, [[L * 0.64, F + 7.8, 0], [L * 0.97, F + 0.5, 0], [L * 0.66, F + 0.6, 0]], 0xf4f1e8);
    post(g, 0.25, 1.1, F, 0.02);
    return { group: g, at: { top: [L * 0.62, F + 9.05, 0], sb: [L * 0.96, F + 0.35, 0.1], bb: [L * 0.96, F + 0.35, -0.1], hek: [0.2, F + 0.5, 0],
      voor: [L * 0.62 + 0.1, F + 4.5, 0], rondom: [L * 0.62, F + 9.1, 0], mast: [L * 0.62, F + 6, 0.1],   // the toplicht on the front of the mast
      voortuig: [L * 0.85, F + 3.8, 0], hand: [1.2, F + 1.1, 0.3] }, length: L };      // in the voortuig, before the fok: in sight
  },
  zeilGroot: () => {
    const L = 26; const B = 6; const F = 1.2;
    const g = hull({ length: L, beam: B, freeboard: F, draft: 1.4, color: 0x2a2a2a, deck: 0x8a7a5a, bow: 0.2 });
    // the mast, and above it a thin stick for the lights at the top: in the mast itself it would hide them
    post(g, L * 0.6, 18.2, F, 0.2, 0x8b6a43); post(g, L * 0.6, 1.8, F + 18.2, 0.035, 0x8b6a43);
    sail(g, [[L * 0.6 - 0.2, F + 1.5, 0], [L * 0.6 - 0.2, F + 17, 0], [1.5, F + 2, 0]], 0x7a4a2a);
    sail(g, [[L * 0.62, F + 15, 0], [L * 0.98, F + 1.5, 0], [L * 0.64, F + 1.6, 0]], 0x7a4a2a);
    return { group: g, at: { top: [L * 0.6, F + 20, 0], mastVoor: [L * 0.6 + 0.3, F + 20, 0], sb: [L * 0.8, F + 0.9, B / 2 - 0.3], bb: [L * 0.8, F + 0.9, -(B / 2 - 0.3)], hek: [0.3, F + 1, 0],
      voortuig: [L * 0.82, F + 8.5, 0] }, palen: { hek: F }, length: L };
  },
  // the lelievlet: under sail, rowed (mast down, the light on its stick), under motor, lying still (mast up, sails down)
  vletZeil: () => vlet({ zeil: true }),
  vletRoei: () => vlet({ mast: false, riemen: true, stok: true }),
  vletMotor: () => vlet({ zeil: true, motor: true }),
  vletKaal: () => vlet(),
};

// -- dagmerken, each standing on y = 0 (sizes from BPR 3.03 and 3.04: bol 60, kegel 60 x 60, cilinder 80 x
// 50, ruit 80 x 50 cm, bord 1 x 1 m, wimpel 1 m long; a klein schip may carry them smaller: `klein` halves
// them). A bord stands across the ship, to be seen from ahead and astern; a flag or wimpel flies aft.
function flat(points, color) {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
  return new THREE.Mesh(new THREE.ShapeGeometry(shape), mat(color, { side: THREE.DoubleSide }));
}
// a sign lit by night: its colours glow when it is dark (update)
function lit(g) {
  g.traverse((o) => { if (o.material) { o.material.emissive.set(o.material.color); o.material.emissiveIntensity = 0; o.userData.verlicht = true; } });
  return g;
}
/**
 * A verbodsbord of 3.31 to 3.33, standing in the lengte-as with the same face on either side (and a post, if it has
 * one, up between the two): `back` the board itself, `parts` the flat shapes of a face, [geometry, colour, x, y,
 * turned], each laid a hair in front of the one before.
 */
function tweezijdig(back, parts, depth) {
  const g = new THREE.Group(); g.add(back);
  for (const side of [1, -1]) {
    const face = new THREE.Group(); face.rotation.y = side > 0 ? 0 : Math.PI;
    parts.forEach(([geometry, color, x, y, turn = 0], i) => {
      const m = new THREE.Mesh(geometry, mat(color)); m.position.set(x, y, depth / 2 + 0.002 * (i + 1)); m.rotation.z = turn; face.add(m);
    });
    g.add(lit(face));
  }
  return g;
}
const plane = (w, h) => new THREE.PlaneGeometry(w, h);
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
    case 'bord': { const b = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1 * k, 1 * k), m); b.position.y = 0.5 * k; return [b, 1 * k]; }
    case 'bordBlauw': {                                            // lichtblauw with a white rand (6.04a lid 3), its frame dark
      const g = new THREE.Group();
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.02, 1.04 * k, 1.04 * k), mat(0x222222)); back.position.y = 0.5 * k; g.add(back);
      const rand = new THREE.Mesh(new THREE.BoxGeometry(0.03, 1 * k, 1 * k), mat(KLEUR.wit)); rand.position.y = 0.5 * k; g.add(rand);
      const face = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.88 * k, 0.88 * k), mat(LICHTBLAUW)); face.position.y = 0.5 * k; g.add(face);
      return [g, 1.04 * k];
    }
    case 'wimpel': return [flat([[0, 0], [0, 0.5 * k], [-1 * k, 0.25 * k]], c), 0.5 * k];
    case 'vlag': return [flat([[0, 0], [0, 0.6 * k], [-0.9 * k, 0.6 * k], [-0.9 * k, 0]], c), 0.6 * k];
    case 'vlagL': {                                                // blue, a white L on it (3.36)
      const g = new THREE.Group(); g.add(flat([[0, 0], [0, 0.6 * k], [-0.9 * k, 0.6 * k], [-0.9 * k, 0]], VLAGBLAUW));
      const up = new THREE.Mesh(new THREE.BoxGeometry(0.08 * k, 0.36 * k, 0.012), mat(KLEUR.wit)); up.position.set(-0.38 * k, 0.3 * k, 0); g.add(up);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.22 * k, 0.08 * k, 0.012), mat(KLEUR.wit)); foot.position.set(-0.45 * k, 0.16 * k, 0); g.add(foot);
      return [g, 0.6 * k];
    }
    case 'vlagA': {                                                // seinvlag A, a stiff replica: white at the staff, a blue swallowtail; two of them across each other, to be seen from all sides
      const g = new THREE.Group();
      for (const turn of [0, -Math.PI / 2]) {
        const f = new THREE.Group(); f.rotation.y = turn;
        f.add(flat([[0, 0], [0, 0.6 * k], [-0.45 * k, 0.6 * k], [-0.45 * k, 0]], KLEUR.wit));
        f.add(flat([[-0.45 * k, 0], [-0.45 * k, 0.6 * k], [-0.9 * k, 0.6 * k], [-0.65 * k, 0.3 * k], [-0.9 * k, 0]], VLAGBLAUW));
        g.add(f);
      }
      return [lit(g), 0.6 * k];
    }
    case 'vlagB': return [flat([[0, 0], [0, 0.6 * k], [-0.9 * k, 0.6 * k], [-0.65 * k, 0.3 * k], [-0.9 * k, 0]], KLEUR.rood), 0.6 * k];   // seinvlag B, red with a swallowtail (10.04)
    case 'bordToegang': case 'bordRoken': {                       // round, 60 cm across: white, a red rand and bar, and in black a hand that stops you (3.31) or a burning match (3.32)
      const r = 0.3; const D = 0.15;
      const back = new THREE.Mesh(new THREE.CylinderGeometry(r, r, D, 32), mat(0x666666)); back.rotation.x = Math.PI / 2;
      const vlam = new THREE.ShapeGeometry(new THREE.Shape([[0, -0.04], [0.03, 0], [0, 0.09], [-0.03, 0]].map(([x, y]) => new THREE.Vector2(x, y))));
      const teken = vorm === 'bordToegang'
        ? [[plane(0.13, 0.13), 0, -0.035], ...[-0.05, -0.017, 0.017, 0.05].map((x) => [plane(0.027, 0.11), x, 0.07]), [plane(0.027, 0.09), -0.08, -0.005, 0.6], [plane(0.09, 0.07), 0, -0.12]]
        : [[plane(0.024, 0.24), 0.02, -0.05, 0.3], [new THREE.CircleGeometry(0.022, 12), -0.016, 0.065], [vlam, -0.025, 0.12]];
      const g = tweezijdig(back, [[new THREE.CircleGeometry(r * 0.98, 40), KLEUR.wit, 0, 0], ...teken.map(([geometry, x, y, turn]) => [geometry, KLEUR.zwart, x, y, turn]),
        [plane(0.48, 0.045), KLEUR.rood, 0, 0, -Math.PI / 4], [new THREE.RingGeometry(0.24, r, 40), KLEUR.rood, 0, 0]], D);
      g.scale.setScalar(k); g.position.y = r * k;
      return [g, 2 * r * k];
    }
    case 'bordLigplaats': {                                        // 3.33: a square board, white with a red rand and bar and a black P, a white triangle below with the metres (10)
      const D = 0.15; const back = new THREE.Group();
      const square = box(1, 1, D, 0x666666); square.position.y = 1; back.add(square);
      const point = (pts) => new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)));
      const prism = new THREE.Mesh(new THREE.ExtrudeGeometry(point([[-0.5, 0.5], [0.5, 0.5], [0, 0]]), { depth: D, bevelEnabled: false }), mat(0x666666));
      prism.position.z = -D / 2; back.add(prism);
      const nul = new THREE.Shape(); nul.absellipse(0, 0, 0.065, 0.085, 0, Math.PI * 2);
      const gat = new THREE.Path(); gat.absellipse(0, 0, 0.032, 0.052, 0, Math.PI * 2); nul.holes.push(gat);
      const g = tweezijdig(back, [[plane(0.98, 0.98), KLEUR.wit, 0, 1], [new THREE.ShapeGeometry(point([[-0.48, 0.5], [0.48, 0.5], [0, 0.02]])), KLEUR.wit, 0, 0],
        [plane(0.84, 0.1), KLEUR.rood, 0, 1.37], [plane(0.84, 0.1), KLEUR.rood, 0, 0.63], [plane(0.1, 0.84), KLEUR.rood, -0.37, 1], [plane(0.1, 0.84), KLEUR.rood, 0.37, 1],
        [plane(0.1, 0.56), KLEUR.zwart, -0.12, 0.98], [new THREE.RingGeometry(0.07, 0.16, 20, 1, -Math.PI / 2, Math.PI), KLEUR.zwart, -0.07, 1.1],
        [plane(0.9, 0.08), KLEUR.rood, 0, 1, -Math.PI / 4], [plane(0.035, 0.16), KLEUR.zwart, -0.07, 0.3], [new THREE.ShapeGeometry(nul), KLEUR.zwart, 0.04, 0.3]], D);
      g.scale.setScalar(k);
      return [g, 1.5 * k];
    }
    case 'boei': {                                                 // a yellow buoy with a radar reflector on a stick, in the water
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12), mat(KLEUR.geel)); body.position.y = 0.1; g.add(body);
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 6), mat(0x888888)); stick.position.y = 0.75; g.add(stick);
      const refl = new THREE.Mesh(new THREE.OctahedronGeometry(0.18), mat(0xbbbbbb, { metalness: 0.8, roughness: 0.3 })); refl.position.y = 1.15; g.add(refl);
      return [g, 1.3];
    }
    default: return [new THREE.Group(), 0];
  }
}

/**
 * The configurations of BPR hoofdstuk 3 and 10, every one of reference/bpr/lichten.json under its id and
 * a few it lacks, in the groups of lichtuitleg.js. `schip` picks the hull (or samenstel); each light is
 * [kleur, soort, where, height above that place, { facultatief }], soort one of toplicht, sb, bb, heklicht,
 * rondom, flikker (snel), flikkerlicht, zwaaiRond, zwaaiHeen; each dagmerk is [vorm, kleur, where, height,
 * klein]. `kabel`: a kabelpont's cable to both banks; `kade`: a quay (or steiger) along the port side;
 * `anker`: its anchor out ahead (true, or so many metres out to starboard), the place 'boei' over it.
 * `cwo`: what CWO asks about, the articles in the theory of Kielboot III or V (reference/bpr/LICHTEN.md, CWO
 * scope) and the lelievlet's own; left out for the rest.
 */
const TOP = ['wit', 'toplicht'];
const MOTOR = [[...TOP, 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']];
const on = (prefix, list) => list.map(([k, s, w, ...rest]) => [k, s, `${prefix}.${w}`, ...rest]);
// the sleepboot at the kop of a sleep, or helping a ship along (3.09 lid 1), and a groot schip in a sleep (lid 3, 4)
const SLEPER = (p) => on(p, [[...TOP, 'voor'], [...TOP, 'voor', -1], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['geel', 'heklicht', 'hek']]);
const SLEPER_DAG = (p) => [['sleepcilinder', 'geel', `${p}.mast`]];
const GESLEEPT = (p, laatste) => on(p, [['wit', 'rondom', 'voor'], ...(laatste ? [['wit', 'heklicht', 'hek', 1]] : [])]);
const GESLEEPT_DAG = (p) => [['bol', 'geel', `${p}.voor`, -1.6]];
// a duwstel of four bakken (3.10 lid 1): the triangle on the front bak to port, a toplicht on the one beside it,
// the boordlichten on the widest part by the duwboot, three heklichten side by side on the duwboot
const DUWSTEL_KOP = [[...TOP, 'b3.voor', 5.5], [...TOP, 'b3.voorBb', 4.4], [...TOP, 'b3.voorSb', 4.4], [...TOP, 'b4.voor', 2.5]];
const HEKLICHTEN = (kleur, p) => on(p, [[kleur, 'heklicht', 'hekBb'], [kleur, 'heklicht', 'hek'], [kleur, 'heklicht', 'hekSb']]);
const DUWSTEL = (hek = 'wit') => [...DUWSTEL_KOP, ['groen', 'sb', 'b2.achterSb', 1.5], ['rood', 'bb', 'b1.achterBb', 1.5], ...HEKLICHTEN(hek, 'duwboot')];
// a gekoppeld samenstel (3.11 lid 1): a toplicht on each, the boordlichten on the outer sides, a heklicht on each
const GEKOPPELD = [[...TOP, 'motor.voor'], [...TOP, 'bak.voor', -0.9], ['groen', 'sb', 'bak.sb', 2.9], ['rood', 'bb', 'motor.bb'],
  ['wit', 'heklicht', 'motor.hek'], ['wit', 'heklicht', 'bak.hek', 1.2]];
const KLEIN_MOTOR_A = (p) => on(p, [[...TOP, 'voor'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']]);
const ZEESCHIP = [[...TOP, 'voor'], [...TOP, 'achter'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']];
// a groot schip moored, its light on the side of the water (3.20 lid 1)
const GEMEERD = [['wit', 'rondom', 'sbPaal', 3]];

export const CONFIGS = [
  // -- grote schepen
  { id: 'groot_motorschip', naam: 'Groot motorschip, varend', artikel: '3.08 lid 1', cwo: true, schip: 'motor', lichten: MOTOR },
  { id: 'groot_motorschip_tweede_toplicht', naam: 'Groot motorschip met tweede toplicht', artikel: '3.08 lid 2', cwo: true, schip: 'motor',
    lichten: [[...TOP, 'voor'], [...TOP, 'achter'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'snel_schip', naam: 'Snel schip', artikel: '3.08 lid 4', cwo: true, schip: 'snelVeer',
    lichten: [...MOTOR, ['geel', 'flikker', 'top'], ['geel', 'flikker', 'top', -1]] },
  { id: 'groot_zeil_en_motor', naam: 'Groot schip onder zeil én motor', artikel: '3.08 lid 5', cwo: true, schip: 'zeilGroot',
    lichten: [[...TOP, 'mastVoor', -6], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']], dagmerken: [['kegelOmlaag', 'zwart', 'voortuig']] },
  { id: 'groot_zeilschip', naam: 'Groot zeilschip', artikel: '3.12', cwo: true, schip: 'zeilGroot',
    lichten: [['rood', 'rondom', 'top', -0.3], ['groen', 'rondom', 'top', -1.5], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'passagiersschip_klein', naam: 'Passagiersschip < 20 m', artikel: '3.15', cwo: true, schip: 'passagier', lichten: MOTOR, dagmerken: [['ruit', 'geel', 'mast']] },

  // -- kleine schepen
  { id: 'klein_motorschip_a', naam: 'Klein motorschip', artikel: '3.13 lid 1a', cwo: true, schip: 'motorKlein', lichten: MOTOR },
  { id: 'klein_motorschip_b', naam: 'Klein motorschip, toplicht hoger', artikel: '3.13 lid 1b', cwo: true, schip: 'motorKlein',
    lichten: [[...TOP, 'mast'], ['groen', 'sb', 'boegSb'], ['rood', 'bb', 'boegBb'], ['wit', 'heklicht', 'hek']] },
  { id: 'klein_motorschip_rondom', naam: 'Klein motorschip, wit rondom', artikel: '3.13 lid 1b', cwo: true, schip: 'motorKlein',
    lichten: [['wit', 'rondom', 'rondom'], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb']] },
  { id: 'klein_open_motorschip_lt7m', naam: 'Open motorbootje < 7 m', artikel: '3.13 lid 2', cwo: true, schip: 'sloep', lichten: [['wit', 'rondom', 'rondom']] },
  { id: 'klein_zeilschip_boeg_hek', naam: 'Klein zeilschip, boordlichten en heklicht', artikel: '3.13 lid 5', cwo: true, schip: 'zeil',
    lichten: [['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'klein_zeilschip_driekleur', naam: 'Klein zeilschip, driekleurenlantaarn', artikel: '3.13 lid 5', cwo: true, schip: 'zeil',
    lichten: [['groen', 'sb', 'top'], ['rood', 'bb', 'top'], ['wit', 'heklicht', 'top']] },
  { id: 'klein_zeilschip_lt7m', naam: 'Klein zeilschip < 7 m, wit rondom', artikel: '3.13 lid 5', cwo: true, schip: 'zeil',
    lichten: [['wit', 'rondom', 'rondom'], ['wit', 'rondom', 'hand', 0, { facultatief: true }]] },
  { id: 'klein_schip_spierkracht', naam: 'Klein schip op spierkracht', artikel: '3.13 lid 6', cwo: true, schip: 'roei', lichten: [['wit', 'rondom', 'rondom']] },
  { id: 'klein_zeil_en_motor', naam: 'Klein schip onder zeil én motor', artikel: '3.13 lid 7', cwo: true, schip: 'zeil',
    lichten: MOTOR, dagmerken: [['kegelOmlaag', 'zwart', 'voortuig', 0, true]] },

  // -- slepen, duwen en koppelen
  { id: 'sleepboot', naam: 'Sleepboot van een sleep', artikel: '3.09 lid 1', cwo: true, schip: 'sleep1',
    lichten: [...SLEPER('sleper'), ...GESLEEPT('a', true)], dagmerken: [...SLEPER_DAG('sleper'), ...GESLEEPT_DAG('a')] },
  { id: 'sleepboten_niet_in_kiellinie', naam: 'Twee sleepboten naast elkaar', artikel: '3.09 lid 2', cwo: true, schip: 'sleepTweeSlepers',
    lichten: [...['s1', 's2'].flatMap((p) => on(p, [[...TOP, 'voor'], [...TOP, 'voor', -1], [...TOP, 'voor', -2], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['geel', 'heklicht', 'hek']])),
      ...GESLEEPT('a', true)],
    dagmerken: [...SLEPER_DAG('s1'), ...SLEPER_DAG('s2'), ...GESLEEPT_DAG('a')] },
  { id: 'gesleept_groot_schip', naam: 'Gesleept groot schip', artikel: '3.09 lid 3', cwo: true, schip: 'sleep2',
    lichten: [...SLEPER('sleper'), ...GESLEEPT('b'), ...GESLEEPT('a', true)], dagmerken: [...SLEPER_DAG('sleper'), ...GESLEEPT_DAG('b'), ...GESLEEPT_DAG('a')] },
  { id: 'laatste_lengte_sleep', naam: 'Laatste lengte van een sleep', artikel: '3.09 lid 4', cwo: true, schip: 'sleepLangszij',
    lichten: [...SLEPER('sleper'), ...GESLEEPT('b'), ...GESLEEPT('a1', true), ...GESLEEPT('a2', true)],
    dagmerken: [...SLEPER_DAG('sleper'), ...GESLEEPT_DAG('b'), ...GESLEEPT_DAG('a1'), ...GESLEEPT_DAG('a2')] },
  { id: 'groot_motorschip_geassisteerd', naam: 'Groot motorschip, geassisteerd', artikel: '3.08 lid 3', cwo: true, schip: 'motorAssist',
    lichten: [...on('schip', MOTOR), ...SLEPER('sleper')], dagmerken: [['bol', 'geel', 'schip.voor', -1.3], ...SLEPER_DAG('sleper')] },
  { id: 'duwstel', naam: 'Duwstel', artikel: '3.10 lid 1', cwo: true, schip: 'duwstel4', lichten: DUWSTEL() },
  { id: 'duwstel_klein', naam: 'Duwstel (kort en smal)', artikel: '3.10 lid 4', cwo: true, schip: 'duw', lichten: MOTOR },
  { id: 'duwstel_geassisteerd', naam: 'Duwstel, geassisteerd', artikel: '3.10 lid 2', cwo: true, schip: 'duwstel4Assist',
    lichten: [...DUWSTEL('geel'), ...SLEPER('sleper')], dagmerken: [['bol', 'geel', 'duwboot.mast', -2.2], ...SLEPER_DAG('sleper')] },
  // the heklichten of the duwboot on the one to starboard, a heklicht on the other; the duwboten the widest, the boordlichten on them
  { id: 'duwstel_twee_duwboten', naam: 'Duwstel met twee duwboten', artikel: '3.10 lid 3', cwo: true, schip: 'duwstel4TweeDuwboten',
    lichten: [...DUWSTEL_KOP, ['groen', 'sb', 'ds.sb'], ['rood', 'bb', 'db.bb'], ...HEKLICHTEN('wit', 'ds'), ['wit', 'heklicht', 'db.hek']] },
  { id: 'gekoppeld_samenstel', naam: 'Gekoppeld samenstel', artikel: '3.11 lid 1', cwo: true, schip: 'gekoppeld', lichten: GEKOPPELD },
  { id: 'gekoppeld_samenstel_geassisteerd', naam: 'Gekoppeld samenstel, geassisteerd', artikel: '3.11 lid 2', cwo: true, schip: 'gekoppeldAssist',
    lichten: [...GEKOPPELD, ...SLEPER('sleper')], dagmerken: [['bol', 'geel', 'motor.voor', -1.3], ...SLEPER_DAG('sleper')] },
  { id: 'klein_motorschip_sleept_klein', naam: 'Volgboot met vletten op sleeptouw', artikel: '3.13 lid 3', cwo: true, schip: 'volgbootTweeVletten',
    lichten: [...KLEIN_MOTOR_A('m'), ['wit', 'rondom', 'v1.stok'], ['wit', 'rondom', 'v2.stok']] },
  { id: 'klein_schip_gesleept', naam: 'Klein schip langszij meegevoerd', artikel: '3.13 lid 4', cwo: true, schip: 'motorKleinLangszij',
    lichten: [...KLEIN_MOTOR_A('m'), ['wit', 'rondom', 'roei.rondom']] },
  { id: 'drijvend_voorwerp_varend', naam: 'Drijvend voorwerp, varend', artikel: '3.19', schip: 'pontonSleep',
    lichten: [...SLEPER('sleper'), ...['hoekVSb', 'hoekVBb', 'hoekASb', 'hoekABb'].map((h) => ['wit', 'rondom', `p.${h}`, 2.2])], dagmerken: SLEPER_DAG('sleper') },

  // -- veerponten
  { id: 'veerpont_niet_vrijvarend', naam: 'Niet-vrijvarende veerpont', artikel: '3.16 lid 1', cwo: true, schip: 'pont', kabel: true,
    lichten: [['wit', 'rondom', 'mast'], ['groen', 'rondom', 'mast', 1]] },
  { id: 'veerpont_ankerschuit', naam: 'Gierpont met zijn drijvers', artikel: '3.16 lid 2', cwo: true, schip: 'gierpont',
    lichten: [['wit', 'rondom', 'pont.mast'], ['groen', 'rondom', 'pont.mast', 1], ['wit', 'rondom', 'd2.licht']] },
  { id: 'veerpont_vrijvarend', naam: 'Vrijvarende veerpont', artikel: '3.16 lid 3', cwo: true, schip: 'pont',
    lichten: [['wit', 'rondom', 'mast'], ['groen', 'rondom', 'mast', 1], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']] },
  { id: 'veerpont_vrijvarend_aanlegplaats', naam: 'Vrijvarende veerpont aan de aanlegplaats', artikel: '3.22 lid 2', schip: 'pontAanleg',
    lichten: [['wit', 'rondom', 'mast'], ['groen', 'rondom', 'mast', 1]] },

  // -- stilliggend
  { id: 'groot_schip_gemeerd', naam: 'Groot schip gemeerd', artikel: '3.20 lid 1', cwo: true, schip: 'motor', kade: true, lichten: GEMEERD },
  { id: 'groot_schip_geankerd', naam: 'Groot schip voor anker', artikel: '3.20 lid 2', cwo: true, schip: 'motor', anker: true,
    lichten: [['wit', 'rondom', 'voor'], ['wit', 'rondom', 'achter']], dagmerken: [['bol', 'zwart', 'voor', -0.9]] },
  { id: 'duwstel_geankerd', naam: 'Duwstel voor anker', artikel: '3.20 lid 3', cwo: true, schip: 'duwstel4',
    lichten: [['wit', 'rondom', 'duwboot.mast'], ...['b1', 'b2', 'b3', 'b4'].map((b) => ['wit', 'rondom', `${b}.mid`, 3])],
    dagmerken: [['bol', 'zwart', 'duwboot.mast', -2.2], ['bol', 'zwart', 'b3.voor', 3], ['bol', 'zwart', 'b4.voor', 3]] },
  { id: 'klein_schip_stilliggend', naam: 'Klein schip voor anker', artikel: '3.20 lid 4', cwo: true, schip: 'sloep', anker: true,
    lichten: [['wit', 'rondom', 'rondom']], dagmerken: [['bol', 'zwart', 'mast', 0.35, true]] },
  { id: 'anker_gevaar', naam: 'Anker dat een gevaar kan zijn', artikel: '3.26 lid 1, 3', cwo: true, schip: 'motor', anker: true,
    lichten: [['wit', 'rondom', 'voor'], ['wit', 'rondom', 'voor', -1], ['wit', 'rondom', 'achter']],
    dagmerken: [['bol', 'zwart', 'voor', -1.9], ['boei', 'geel', 'boei']] },
  { id: 'drijvend_voorwerp_stil', naam: 'Drijvende steiger', artikel: '3.23', schip: 'steiger', kade: true,
    lichten: [['wit', 'rondom', 'hoekVSb', 1.2], ['wit', 'rondom', 'hoekASb', 1.2]] },
  // a ponton along the kade, its anchor out into the water: the light of 3.23 nearest the anchor made two, one above the other
  { id: 'drijvend_voorwerp_anker_gevaar', naam: 'Drijvend voorwerp, anker een gevaar', artikel: '3.26 lid 2, 3', cwo: true, schip: 'ponton', kade: true, anker: 6,
    lichten: [['wit', 'rondom', 'hoekVSb', 2.2], ['wit', 'rondom', 'hoekVSb', 1.2], ['wit', 'rondom', 'hoekASb', 2.2]], dagmerken: [['boei', 'geel', 'boei']] },
  { id: 'netten_stilliggend', naam: 'Stilliggend schip met net uit', artikel: '3.24', cwo: true, schip: 'visserNet', anker: true,
    lichten: [['wit', 'rondom', 'mast'], ['wit', 'rondom', 'hek', 0.8], ['wit', 'rondom', 'net']],
    dagmerken: [['bol', 'zwart', 'mast', -1.5], ['vlag', 'geel', 'net', -0.75]] },
  // the verbodsborden on board (3.31 to 3.33), of a ship moored: on deck in the lengte-as, seen from either side, lit by night
  { id: 'verbod_toegang', naam: 'Verboden toegang aan boord', artikel: '3.31', cwo: true, schip: 'motor', kade: true, lichten: GEMEERD, dagmerken: [['bordToegang', 'wit', 'dek']] },
  { id: 'verbod_roken', naam: 'Verboden te roken en open vuur', artikel: '3.32', cwo: true, schip: 'tanker', kade: true, lichten: GEMEERD, dagmerken: [['bordRoken', 'wit', 'dek']] },
  { id: 'verbod_ligplaats_langszij', naam: 'Verboden langszij ligplaats te nemen', artikel: '3.33', cwo: true, schip: 'motor', kade: true, lichten: GEMEERD,
    dagmerken: [['bordLigplaats', 'wit', 'dek']] },

  // -- werk en hinder
  { id: 'werkend_schip', naam: 'Werkend schip (vrije zijde stuurboord)', artikel: '3.25 lid 1', cwo: true, schip: 'werk',
    lichten: [['groen', 'rondom', 'sbMast'], ['groen', 'rondom', 'sbMast', -1], ['rood', 'rondom', 'bbMast']],
    dagmerken: [['ruit', 'groen', 'sbMast', -2.8], ['ruit', 'groen', 'sbMast', -3.8], ['bol', 'rood', 'bbMast', -2.8]] },
  { id: 'werkend_schip_golfslag', naam: 'Werkend schip, ook tegen golfslag', artikel: '3.25 lid 1', cwo: true, schip: 'werk',
    lichten: [['rood', 'rondom', 'sbMast'], ['wit', 'rondom', 'sbMast', -1], ['rood', 'rondom', 'bbMast']],
    dagmerken: [['bordRoodWit', 'rood', 'sbMast', -2.8], ['bord', 'rood', 'bbMast', -2.8]] },
  // her anchor out on the free side, in the way of who passes there: a buoy over it, by night with a white light on top
  { id: 'werktuig_anker_gevaar', naam: 'Werkend schip, anker een gevaar', artikel: '3.26 lid 4', cwo: true, schip: 'werk', anker: 8,
    lichten: [['groen', 'rondom', 'sbMast'], ['groen', 'rondom', 'sbMast', -1], ['rood', 'rondom', 'bbMast'], ['wit', 'rondom', 'boei', 1.5]],
    dagmerken: [['ruit', 'groen', 'sbMast', -2.8], ['ruit', 'groen', 'sbMast', -3.8], ['bol', 'rood', 'bbMast', -2.8], ['boei', 'geel', 'boei']] },
  { id: 'beperkt_manoeuvreerbaar', naam: 'Beperkt manoeuvreerbaar schip', artikel: '3.34', cwo: true, schip: 'hopper',
    lichten: [...MOTOR, ['rood', 'rondom', 'top'], ['wit', 'rondom', 'top', -1], ['rood', 'rondom', 'top', -2],
      ['rood', 'rondom', 'raBb'], ['rood', 'rondom', 'raBb', -1], ['groen', 'rondom', 'raSb'], ['groen', 'rondom', 'raSb', -1]],
    dagmerken: [['bol', 'zwart', 'top', -3.3], ['ruit', 'zwart', 'top', -4.4], ['bol', 'zwart', 'top', -5.3],
      ['bol', 'zwart', 'raBb', -2.5], ['bol', 'zwart', 'raBb', -3.5], ['ruit', 'zwart', 'raSb', -2.6], ['ruit', 'zwart', 'raSb', -3.6]] },
  { id: 'werkzaamheden_geel', naam: 'Schip aan het werk, geel flikkerlicht', artikel: '3.28', cwo: true, schip: 'werkboot',
    lichten: [...MOTOR, ['geel', 'flikkerlicht', 'top']] },
  { id: 'bescherming_golfslag', naam: 'Bescherming tegen golfslag', artikel: '3.29', cwo: true, schip: 'motor',
    lichten: [['rood', 'rondom', 'mast'], ['wit', 'rondom', 'mast', -1]], dagmerken: [['bordRoodWit', 'rood', 'mid']] },
  // the signs of 3.25 lid 1 c and d (lid 2): the free side to starboard, the blocked side to port
  { id: 'vastgevaren_gezonken', naam: 'Vastgevaren of gezonken schip', artikel: '3.25 lid 2', cwo: true, schip: 'motor', ra: true,
    lichten: [['rood', 'rondom', 'raSb'], ['wit', 'rondom', 'raSb', -1], ['rood', 'rondom', 'raBb']],
    dagmerken: [['bordRoodWit', 'rood', 'raSb', -2.3], ['bord', 'rood', 'raBb', -2.3]] },
  { id: 'onmanoeuvreerbaar', naam: 'Onmanoeuvreerbaar schip', artikel: '3.18', cwo: true, schip: 'motor',
    lichten: [['rood', 'rondom', 'mast'], ['rood', 'rondom', 'mast', -1]], dagmerken: [['bol', 'zwart', 'mid'], ['bol', 'zwart', 'mid', -1]] },
  // a lelievlet in nood: its own light in the top, and a light swung round in a circle; by day a flag with a ball under it
  { id: 'nood', naam: 'Schip in nood', artikel: '3.30', cwo: true, schip: 'vletKaal',
    lichten: [['wit', 'rondom', 'top'], ['wit', 'zwaaiRond', 'hand']], dagmerken: [['vlag', 'rood', 'top', -0.7], ['bol', 'zwart', 'top', -1.5, true]] },

  // -- bijzondere schepen
  { id: 'gevaarlijke_stoffen_1', naam: 'Schip met gevaarlijke stoffen (1 blauw)', artikel: '3.14 lid 1', cwo: true, schip: 'tanker',
    lichten: [...MOTOR, ['blauw', 'rondom', 'mast']], dagmerken: [['kegelOmlaag', 'blauw', 'mast', -1.6]] },
  { id: 'gevaarlijke_stoffen_2', naam: 'Schip met gevaarlijke stoffen (2 blauw)', artikel: '3.14 lid 2', cwo: true, schip: 'tanker',
    lichten: [...MOTOR, ['blauw', 'rondom', 'mast'], ['blauw', 'rondom', 'mast', 1]],
    dagmerken: [['kegelOmlaag', 'blauw', 'mast', -1.6], ['kegelOmlaag', 'blauw', 'mast', -2.6]] },
  { id: 'gevaarlijke_stoffen_3', naam: 'Schip met gevaarlijke stoffen (3 blauw)', artikel: '3.14 lid 3', cwo: true, schip: 'tanker',
    lichten: [...MOTOR, ['blauw', 'rondom', 'achter', -2], ['blauw', 'rondom', 'achter', -1], ['blauw', 'rondom', 'achter']],
    dagmerken: [['kegelOmlaag', 'blauw', 'achter', -3], ['kegelOmlaag', 'blauw', 'achter', -3.9], ['kegelOmlaag', 'blauw', 'achter', -4.8]] },
  { id: 'handhaving_brandweer', naam: 'Politie, brandweer, hulpverlening', artikel: '3.27', cwo: true, schip: 'politie',
    lichten: [...MOTOR, ['blauw', 'flikker', 'dak', 0.2]] },
  { id: 'voorrang', naam: 'Schip met recht van voorrang', artikel: '3.17', schip: 'politie', lichten: MOTOR, dagmerken: [['wimpel', 'rood', 'boeg', 1.5]] },
  { id: 'stuurboord_op_stuurboord', naam: 'Wil stuurboord op stuurboord passeren', artikel: '6.04a lid 3', cwo: true, schip: 'motor',
    lichten: [...MOTOR, ['wit', 'flikkerlicht', 'bordSb', 0.65]], dagmerken: [['bordBlauw', 'lichtblauw', 'bordSb', -0.52]] },
  { id: 'vissersschip', naam: 'Vissersschip', artikel: '3.37', cwo: true, schip: 'visser',
    lichten: [['groen', 'rondom', 'mast'], ['wit', 'rondom', 'mast', -1], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']],
    dagmerken: [['diabolo', 'zwart', 'achter', -1.5]] },
  { id: 'loodsboot', naam: 'Loodsboot', artikel: '3.36', schip: 'loods',
    lichten: [['wit', 'rondom', 'top'], ['rood', 'rondom', 'top', -1], ['groen', 'sb', 'sb'], ['rood', 'bb', 'bb'], ['wit', 'heklicht', 'hek']],
    dagmerken: [['vlagL', 'blauw', 'top', -0.65]] },
  { id: 'mijnenopruimer', naam: 'Mijnenopruimingsschip', artikel: '3.35', schip: 'mijnen',
    lichten: [...MOTOR, ['groen', 'rondom', 'top'], ['groen', 'rondom', 'raSb'], ['groen', 'rondom', 'raBb']],
    dagmerken: [['bol', 'zwart', 'top', -1.3], ['bol', 'zwart', 'raSb', 0.27], ['bol', 'zwart', 'raBb', 0.27]] },
  { id: 'duiker', naam: 'Schip met een duiker te water', artikel: '3.38', cwo: true, schip: 'rib',
    lichten: [['wit', 'rondom', 'rondom'], ['groen', 'sb', 'boegSb'], ['rood', 'bb', 'boegBb']], dagmerken: [['vlagA', 'wit', 'vlag']] },
  { id: 'bovenmaats_zeeschip', naam: 'Bovenmaats zeeschip', artikel: '10.03', cwo: true, schip: 'zeeschip',
    lichten: [...ZEESCHIP, ['rood', 'rondom', 'rood'], ['rood', 'rondom', 'rood', -2], ['rood', 'rondom', 'rood', -4]],
    dagmerken: [['cilinder', 'zwart', 'rood', -5.4]] },
  { id: 'zeeschip_gevaarlijke_stoffen', naam: 'Zeeschip met gevaarlijke stoffen', artikel: '10.04', cwo: true, schip: 'zeeschip',
    lichten: [...ZEESCHIP, ['rood', 'rondom', 'rood']], dagmerken: [['vlagB', 'rood', 'rood', -1.6]] },

  // -- de lelievlet
  { id: 'lelievlet_zeilen', naam: 'Lelievlet onder zeil', artikel: '3.13 lid 5', cwo: true, schip: 'vletZeil',
    lichten: [['wit', 'rondom', 'top'], ['wit', 'rondom', 'hand', 0, { facultatief: true }]] },
  { id: 'lelievlet_zeilen_driekleur', naam: 'Lelievlet onder zeil, driekleurenlantaarn', artikel: '3.13 lid 5', cwo: true, schip: 'vletZeil',
    lichten: [['groen', 'sb', 'top'], ['rood', 'bb', 'top'], ['wit', 'heklicht', 'top']] },
  { id: 'lelievlet_roeien', naam: 'Lelievlet geroeid', artikel: '3.13 lid 6', cwo: true, schip: 'vletRoei', lichten: [['wit', 'rondom', 'stok']] },
  { id: 'lelievlet_zeil_en_motor', naam: 'Lelievlet met motor', artikel: '3.13 lid 2, 7', cwo: true, schip: 'vletMotor',
    lichten: [['wit', 'rondom', 'top']], dagmerken: [['kegelOmlaag', 'zwart', 'voortuig', 0, true]] },
  { id: 'lelievlet_geankerd', naam: 'Lelievlet voor anker', artikel: '3.20 lid 4', cwo: true, schip: 'vletKaal', anker: true,
    lichten: [['wit', 'rondom', 'top']], dagmerken: [['bol', 'zwart', 'voortuig', 0, true]] },
  { id: 'lelievlet_gemeerd', naam: 'Lelievlet gemeerd', artikel: '3.20 lid 4', cwo: true, schip: 'vletKaal', kade: true, lichten: [['wit', 'rondom', 'top']] },
  { id: 'lelievlet_gesleept', naam: 'Lelievlet op sleeptouw', artikel: '3.13 lid 4', cwo: true, schip: 'volgbootEenVlet',
    lichten: [...KLEIN_MOTOR_A('m'), ['wit', 'rondom', 'v1.stok']] },
];

const tmp = new THREE.Vector3();
const across = new THREE.Vector3();
const sight = new THREE.Raycaster(); const eye = new THREE.Vector3(); const lampAt = new THREE.Vector3();

/** A quay along the port side of what `ship` built: concrete for a big ship, a wooden steiger for a small one. */
function kade(group, ship) {
  const bounds = new THREE.Box3().setFromObject(ship.group);
  const groot = ship.length > 15; const top = groot ? 2.2 : 0.7; const wide = groot ? 5 : 1.6; const long = ship.length + (groot ? 20 : 6);
  const k = box(long, top + 2, wide, groot ? 0x8f8c86 : 0x8a6a44);
  k.position.set(ship.length / 2, top / 2 - 1, bounds.min.z - wide / 2 - (groot ? 0.4 : 0.25)); group.add(k);
}

/**
 * A ship in one configuration. group.userData.update(t, night, camera) shows each light only inside
 * its arc as seen from the camera, flickers what flickers and swings what is swung, and takes the
 * dagmerken in by night. userData.lights: [{ kleur, soort, plaats, lamp, arc, blink, byDay, facultatief }]
 * (plaats 'craft.place' in a samenstel), the
 * arc [from, to] in degrees from dead ahead (+ to starboard) or null all round; userData.length: from
 * the hindmost stern to the foremost bow, in m.
 */
export function makeShip(config) {
  const ship = SHIPS[config.schip](config);
  const group = new THREE.Group(); group.name = config.id; group.add(ship.group);
  const at = { ...ship.at };
  // a kabelpont hauls itself along a cable from bank to bank: it comes aboard at each end, and away
  // from the pont it goes down into the water
  if (config.kabel) {
    for (const [x, y] of ship.group.userData.ends) {
      const out = x < 1 ? -1 : 1;
      rope(group, [x, y, 0], [x + out * 9, -1.2, 0], 0.03);
    }
  }
  if (config.kade) kade(group, ship);
  // the anchor out ahead (or ahead and out to starboard, `anker` metres), its chain from the bow down to it
  if (config.anker) {
    const scope = Math.max(12, ship.length * 0.5); const bow = at.trosVoor ?? [ship.length, 0.5, 0]; const out = config.anker === true ? 0 : config.anker;
    rope(group, bow, [ship.length + scope, -3, out], ship.length > 15 ? 0.06 : 0.02);
    at.boei = [ship.length + scope, 0, out + 1.2];
  }
  const size = (where) => ship.sizes?.[where] ?? lampSize(ship.length);
  const tops = {};                                                  // per place, how high a post must go
  const reach = (where, y) => { tops[where] = Math.max(tops[where] ?? -Infinity, y); };
  const place = (where) => {
    if (!at[where]) console.warn(`schepen: ${config.id} has no place ${where}`);
    return at[where] ?? [0, 2, 0];
  };
  const lights = [];
  for (const [kleur, soort, where, dy = 0, extra = {}] of config.lichten ?? []) {
    const base = place(where);
    const lamp = makeLamp(kleur, size(where), 3, { day: !!BLINK[soort] });   // a flikkerlicht is there by day too
    // the glow round a light is in the eye that sees it, not out on the water: it lies over a mast or a post
    // in front of it, and is gone only where the light itself is hidden (update)
    const glow = lamp.children[1]; glow.material.depthTest = false; glow.renderOrder = 5;
    lamp.position.set(base[0], base[1] + dy, base[2]);
    group.add(lamp); reach(where, base[1] + dy - 0.06);
    lights.push({
      kleur, soort, plaats: where, lamp, arc: ARC[soort] ?? null, blink: BLINK[soort] ? character(BLINK[soort]) : null, byDay: !!BLINK[soort],
      facultatief: !!extra.facultatief, swing: SWING[soort] ?? null, rest: lamp.position.clone(), glow, r: 0.05 * size(where),
    });
  }
  const shapes = []; const verlicht = [];
  for (const [vorm, kleur, where, dy = 0, klein = false] of config.dagmerken ?? []) {
    const base = place(where);
    // in a group of its own, so that a shape made of one mesh keeps standing on its place as it was made to
    const [made, h] = dagmerk(vorm, kleur, klein);
    const shape = new THREE.Group(); shape.add(made);
    shape.position.set(base[0], base[1] + dy, base[2]);
    group.add(shape); reach(where, base[1] + dy + h + 0.03);
    shapes.push({ shape, nacht: NIGHT_TOO.has(vorm), vorm, kleur, h });
    shape.traverse((o) => { if (o.userData.verlicht) verlicht.push(o.material); });
  }
  for (const [where, top] of Object.entries(tops)) {
    const from = ship.palen?.[where];
    if (from === undefined || top <= from) continue;
    const [x, , z] = at[where];
    post(group, x, top - from, from, ship.length > 15 ? 0.06 : 0.025, 0xd9d9d9, z);
  }
  // what can stand between the eye and a light: all of her but the lamps (their glow is no wall)
  const lampParts = new Set(); for (const l of lights) l.lamp.traverse((o) => lampParts.add(o));
  // (not a line or a thin post: narrower than a light, it never hides one)
  const thin = (o) => o.geometry?.type === 'CylinderGeometry' && Math.max(o.geometry.parameters.radiusTop, o.geometry.parameters.radiusBottom) < 0.045;
  const solid = []; group.traverse((o) => { if (o.isMesh && !lampParts.has(o) && !thin(o)) solid.push(o); });
  let frame = 0;
  // her middle across, of the craft only (not a kade beside her)
  const mid = new THREE.Box3(); const part = new THREE.Box3(); group.updateMatrixWorld(true);
  ship.group.traverse((o) => { if (o.isMesh) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); mid.union(part.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld)); } });
  const axis = mid.isEmpty() ? 0 : (mid.min.z + mid.max.z) / 2;
  group.userData = {
    config, length: ship.length, lights, axis,
    // the dagmerken, for a picture of what is seen of her by day: [{ shape, vorm, kleur, h, nacht }]
    dagmerken: shapes,
    update(t, night, camera) {
      for (const l of lights) {
        let on = night > 0.05 || l.byDay;                            // lit at sundown, out by day; a flikkerlicht shows by day too
        if (l.swing) {
          // swung by hand across the line of sight, in a circle or to and fro
          tmp.copy(camera.position); l.lamp.parent.worldToLocal(tmp).sub(l.rest);
          across.set(-tmp.z, 0, tmp.x).normalize();
          const a = (2 * Math.PI * t) / 1.6;
          l.lamp.position.copy(l.rest).addScaledVector(across, l.swing === 'rond' ? 0.45 * Math.cos(a) : 0.5 * Math.sin(a));
          if (l.swing === 'rond') l.lamp.position.y += 0.45 * Math.sin(a);
          l.lamp.visible = night > 0.05;                              // a torch in a hand: not hanging there by day
        }
        if (l.arc) {
          // the bearing from the middle of all of her (a samenstel too), as the sector is seen from further off:
          // up close a boordlicht some metres out to the side would otherwise go out for an eye right ahead of her
          tmp.copy(camera.position); l.lamp.parent.worldToLocal(tmp); tmp.x -= l.rest.x; tmp.z -= axis;
          const bearing = THREE.MathUtils.radToDeg(Math.atan2(tmp.z, tmp.x));            // 0 ahead, + to starboard
          const [from, to] = l.arc;
          const b = to > 180 ? (bearing + 360) % 360 : bearing;
          on = on && b >= from && b <= to;
        }
        if (l.blink) on = on && l.blink(t);
        l.lamp.userData.set(on, night);
        // its glow only where the light itself is seen (looked again every few frames, and when it comes on)
        if (on && (l.hidden === undefined || (frame + lights.indexOf(l)) % 6 === 0)) {
          camera.getWorldPosition(eye); l.lamp.getWorldPosition(lampAt);
          const dist = lampAt.distanceTo(eye); sight.set(eye, lampAt.sub(eye).normalize()); sight.far = Math.max(0, dist - 1.5 * l.r);
          l.hidden = sight.intersectObjects(solid, false).length > 0;
        }
        if (on && l.hidden) l.glow.visible = false;
      }
      frame++;
      const dark = night > 0.5;                                      // the dagmerken stay up at night as they do on the water
      for (const m of verlicht) m.emissiveIntensity = dark ? 0.5 : 0;
    },
  };
  return group;
}
