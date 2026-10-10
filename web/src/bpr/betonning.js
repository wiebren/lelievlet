import * as THREE from 'three';
import { character } from './lichtkarakter.js';

// Betonning en markering (BPR bijlage 8, the Dutch IALA-A system, Richtlijnen Scheepvaarttekens 2023):
// every mark as a small model built here. A mark stands on the waterline at its own origin, y up; what
// floats has a little of itself under water. Colours go in bands from the top down, the topteken
// stands on a short spar above the body, and a lantern on top flashes in the mark's own character.
// Sizes from the RWS guideline and the RWS and Fryslân datasets (reference/bpr/BETONNING.md); how far a
// buoy stands out of the water no Dutch source gives, so those heights are estimates.

export const KLEUR = {
  rood: 0xc1121c, groen: 0x0f8a3c, geel: 0xf2c200, zwart: 0x161616, wit: 0xf2f2ee, hout: 0x7a5a3a,
};
const LICHT = { rood: 0xff3322, groen: 0x33ff66, geel: 0xffd23a, wit: 0xfff4d8, blauw: 0x4a7dff };

// the bodies, as a profile turned round the y axis: [radius, height] from the bottom up (m)
const BODY = {
  stompeTon: { profile: [[0.5, -0.3], [0.6, 0], [0.42, 1.2], [0, 1.2]], top: 1.2 },
  spitseTon: { profile: [[0.5, -0.3], [0.6, 0], [0.03, 1.5], [0, 1.52]], top: 1.52 },
  sparStomp: { profile: [[0.3, -0.8], [0.315, 0], [0.315, 2.2], [0, 2.2]], top: 2.2 },
  sparSpits: { profile: [[0.3, -0.8], [0.315, 0], [0.315, 1.75], [0.02, 2.35], [0, 2.36]], top: 2.36 },
  sparKlein: { profile: [[0.24, -0.6], [0.25, 0], [0.25, 1.1], [0, 1.1]], top: 1.1 },       // Fryslân D 500x1700
  sparAanvullend: { profile: [[0.2, -0.5], [0.215, 0], [0.215, 1.2], [0, 1.2]], top: 1.2 },  // D 430
  sparAanvullendSpits: { profile: [[0.2, -0.5], [0.215, 0], [0.215, 0.95], [0.02, 1.3], [0, 1.31]], top: 1.31 },
  bol: { sphere: 0.6, top: 0.9 },
  drijfbaken: { float: true, top: 1.9 },
  kopbaken: { pole: 0.07, top: 2.4 },
  steekbaken: { twig: true, top: 2.6 },
  walbaken: { bank: true, top: 3.0 },
  oeverbord: { bank: true, top: 3.0 },
  achterpaal: { bank: true, top: 4.3 },                          // the rear, higher one of a pair in line
  geleidelijn: { lijn: ['oeverbord', 'achterpaal'], achter: 5 },
  geleidelichten: { lijn: ['oeverbord', 'achterpaal'], achter: 5 },
  sectorlicht: { bank: true, lantaarn: true, top: 2.6 },
  haveningang: { profile: [[0.15, -0.5], [0.15, 3.4], [0, 3.4]], top: 3.4 },
};

/**
 * Every mark the lessons need. `vorm` picks the body, `banden` its colours from the top down (one
 * entry: all of it), `top` the topteken, `licht` the colour and character of its light, `sectoren` the
 * colours of a sector light, each [kleur, from, to] in degrees off the line straight out over the water.
 */
export const MARKS = [
  { id: 'lateraal-rechts-stompe-ton', naam: 'Stompe ton (rood), rechterzijde', vorm: 'stompeTon', banden: ['rood'], top: 'cilinder', licht: ['rood', 'Iso 4s'] },
  { id: 'lateraal-links-spitse-ton', naam: 'Spitse ton (groen), linkerzijde', vorm: 'spitseTon', banden: ['groen'], top: 'kegel', licht: ['groen', 'Iso 4s'] },
  { id: 'lateraal-rechts-sparboei', naam: 'Sparboei rood (stomp)', vorm: 'sparStomp', banden: ['rood'], top: 'cilinder' },
  { id: 'lateraal-links-sparboei', naam: 'Sparboei groen (spits)', vorm: 'sparSpits', banden: ['groen'], top: 'kegel' },
  { id: 'lateraal-friese-meren-boei-rood', naam: 'Boei rood (Friese meren)', vorm: 'sparKlein', banden: ['rood'] },
  { id: 'lateraal-friese-meren-boei-groen', naam: 'Boei groen (Friese meren)', vorm: 'sparKlein', banden: ['groen'] },
  { id: 'bpr-drijfbaken-rechts', naam: 'Drijfbaken rood', vorm: 'drijfbaken', banden: ['rood'], top: 'cilinder' },
  { id: 'bpr-drijfbaken-links', naam: 'Drijfbaken groen', vorm: 'drijfbaken', banden: ['groen'], top: 'kegel' },
  { id: 'bpr-kopbaken-rechts', naam: 'Kopbaken rood', vorm: 'kopbaken', banden: ['rood'], top: 'cilinder' },
  { id: 'bpr-kopbaken-links', naam: 'Kopbaken groen', vorm: 'kopbaken', banden: ['groen'], top: 'kegel' },
  { id: 'bpr-walbaken-rechts', naam: 'Walbaken rechteroever', vorm: 'walbaken', banden: ['rood'], top: 'driehoekOmlaag', licht: ['rood', 'Iso 4s'] },
  { id: 'bpr-walbaken-links', naam: 'Walbaken linkeroever', vorm: 'walbaken', banden: ['groen'], top: 'driehoekOmhoog', licht: ['groen', 'Iso 4s'] },
  { id: 'bpr-steekbaken-los', naam: 'Steekbaken, losse takken (stomp)', vorm: 'steekbaken', banden: ['hout'], top: 'takkenLos' },
  { id: 'bpr-steekbaken-gebonden', naam: 'Steekbaken, gebonden takken (spits)', vorm: 'steekbaken', banden: ['hout'], top: 'takkenGebonden' },
  { id: 'bpr-splitsing-gelijk-belang', naam: 'Scheidingston, vaarwaters van gelijk belang', vorm: 'bol', banden: ['rood', 'groen', 'rood', 'groen'], top: 'bolRoodGroen', licht: ['wit', 'Iso 2s'] },
  { id: 'bpr-splitsing-hoofdvaarwater-links', naam: 'Scheidingston, hoofdvaarwater links', vorm: 'bol', banden: ['rood', 'groen'], top: 'cilinder', licht: ['rood', 'Q'] },
  { id: 'bpr-splitsing-hoofdvaarwater-rechts', naam: 'Scheidingston, hoofdvaarwater rechts', vorm: 'bol', banden: ['groen', 'rood'], top: 'kegel', licht: ['groen', 'Q'] },
  { id: 'bpr-walbaken-splitsing', naam: 'Walbaken splitsingspunt (zandloper)', vorm: 'walbaken', banden: ['rood', 'groen'], top: 'zandloper', licht: ['wit', 'Iso 2s'] },
  { id: 'bpr-aanvullend-rechts', naam: 'Aanvullende markering rood-wit', vorm: 'sparAanvullend', banden: ['rood', 'wit', 'rood', 'wit'], top: 'cilinder' },
  { id: 'bpr-aanvullend-links', naam: 'Aanvullende markering groen-wit', vorm: 'sparAanvullendSpits', banden: ['groen', 'wit', 'groen', 'wit'], top: 'kegel' },
  { id: 'bijzondere-markering', naam: 'Bijzondere markering (geel)', vorm: 'sparKlein', banden: ['geel'], top: 'kruis', licht: ['geel', 'Fl 5s'] },
  { id: 'bijzondere-markering-verboden', naam: 'Bijzondere markering, verboden gebied', vorm: 'sparKlein', banden: ['geel'], top: 'verbod' },
  { id: 'bpr-vaargeul-rechteroever', naam: 'Vaargeul langs de rechteroever', vorm: 'oeverbord', banden: ['rood', 'wit'], top: 'vaargeulRechts', licht: ['rood', 'Oc 4s'] },
  { id: 'bpr-vaargeul-linkeroever', naam: 'Vaargeul langs de linkeroever', vorm: 'oeverbord', banden: ['groen', 'wit'], top: 'vaargeulLinks', licht: ['groen', 'Oc 4s'] },
  { id: 'bpr-overgang-rechteroever', naam: 'Overgang van de vaargeul, rechteroever', vorm: 'oeverbord', banden: ['geel', 'zwart'], top: 'overgangRechts', licht: ['geel', 'Oc 4s'] },
  { id: 'bpr-overgang-linkeroever', naam: 'Overgang van de vaargeul, linkeroever', vorm: 'oeverbord', banden: ['geel', 'zwart'], top: 'overgangLinks', licht: ['geel', 'Oc 4s'] },
  { id: 'bpr-geleidelijn', naam: 'Geleidelijn (twee borden achter elkaar)', vorm: 'geleidelijn', banden: ['geel', 'zwart'], top: 'overgangRechts', licht: ['geel', 'Oc 4s'] },
  { id: 'bpr-geleidelichten', naam: 'Geleidelichten (lichtenlijn)', vorm: 'geleidelichten', banden: ['wit', 'zwart'], top: 'schijf', licht: ['wit', 'Iso 4s'] },
  { id: 'bpr-sectorlicht', naam: 'Sectorlicht', vorm: 'sectorlicht', banden: ['wit'], licht: ['wit', 'Oc 4s'], sectoren: [['rood', -35, -6], ['wit', -6, 6], ['groen', 6, 35]] },
  { id: 'noordkardinaal', naam: 'Noordcardinaal', vorm: 'sparStomp', banden: ['zwart', 'geel'], top: 'noord', licht: ['wit', 'Q'] },
  { id: 'oostkardinaal', naam: 'Oostcardinaal', vorm: 'sparStomp', banden: ['zwart', 'geel', 'zwart'], top: 'oost', licht: ['wit', 'Q(3) 10s'] },
  { id: 'zuidkardinaal', naam: 'Zuidcardinaal', vorm: 'sparStomp', banden: ['geel', 'zwart'], top: 'zuid', licht: ['wit', 'Q(6)+LFl 15s'] },
  { id: 'westkardinaal', naam: 'Westcardinaal', vorm: 'sparStomp', banden: ['geel', 'zwart', 'geel'], top: 'west', licht: ['wit', 'Q(9) 15s'] },
  { id: 'afzonderlijk-gevaar', naam: 'Afzonderlijk gevaar', vorm: 'sparStomp', banden: ['zwart', 'rood', 'zwart'], top: 'tweeBollen', licht: ['wit', 'Fl(2) 10s'] },
  { id: 'bpr-veilig-vaarwater', naam: 'Veilig vaarwater (midvaarwater)', vorm: 'bol', banden: ['rood-wit verticaal'], licht: ['wit', 'Iso 8s'] },
  { id: 'bpr-haveningang-bakboord', naam: 'Haveningang, bakboordszijde', vorm: 'haveningang', banden: ['rood', 'wit', 'rood', 'wit', 'rood', 'wit'], top: 'cilinder', licht: ['rood', 'F'] },
  { id: 'bpr-haveningang-stuurboord', naam: 'Haveningang, stuurboordszijde', vorm: 'haveningang', banden: ['groen', 'wit', 'groen', 'wit', 'groen', 'wit'], top: 'kegel', licht: ['groen', 'F'] },
];

const materials = new Map();
const paint = (name) => {
  if (!materials.has(name)) materials.set(name, new THREE.MeshStandardMaterial({ color: KLEUR[name] ?? 0xcccccc, roughness: 0.6 }));
  return materials.get(name);
};

/** The radius of a turned profile at height y. */
function radiusAt(profile, y) {
  for (let i = 1; i < profile.length; i++) {
    const [r0, y0] = profile[i - 1]; const [r1, y1] = profile[i];
    if (y <= y1 + 1e-9) return y1 === y0 ? r1 : r0 + (r1 - r0) * ((y - y0) / (y1 - y0));
  }
  return profile[profile.length - 1][0];
}

/** A turned body in bands: the part above water split evenly between the colours, the part under it the last colour. */
function turned(profile, banden) {
  const group = new THREE.Group();
  const top = profile[profile.length - 1][1]; const bottom = profile[0][1];
  const cuts = [top, ...banden.slice(1).map((_, i) => top - (top * (i + 1)) / banden.length), bottom];
  cuts.sort((a, b) => b - a);
  for (let i = 0; i < cuts.length - 1; i++) {
    const [hi, lo] = [cuts[i], cuts[i + 1]];
    const points = [];
    const ys = [lo, ...profile.map(([, y]) => y).filter((y) => y > lo && y < hi), hi];
    for (const y of ys) points.push(new THREE.Vector2(Math.max(radiusAt(profile, y), 0.001), y));
    if (i === 0 && profile[profile.length - 1][0] === 0) points.push(new THREE.Vector2(0.0001, hi));   // closed on top
    const mesh = new THREE.Mesh(new THREE.LatheGeometry(points, 32), paint(banden[Math.min(i, banden.length - 1)]));
    group.add(mesh);
  }
  return group;
}

/** A sphere striped red and white from pole to pole: the midvaarwater mark. */
function stripedBall(r) {
  const canvas = Object.assign(document.createElement('canvas'), { width: 256, height: 16 });
  const g = canvas.getContext('2d');
  for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? '#f2f2ee' : '#c1121c'; g.fillRect(i * 32, 0, 32, 16); }
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.SphereGeometry(r, 32, 20), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.6 }));
}

/** A sphere in horizontal bands. */
function bandedBall(r, banden) {
  if (banden[0] === 'rood-wit verticaal') return stripedBall(r);
  const group = new THREE.Group();
  const n = banden.length;
  for (let i = 0; i < n; i++) {
    const theta0 = (Math.PI * i) / n; const theta1 = (Math.PI * (i + 1)) / n;
    group.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 8, 0, Math.PI * 2, theta0, theta1 - theta0), paint(banden[i])));
  }
  return group;
}

// -- toptekens: each built standing on y = 0, as tall as it says it is
const TOP = {
  cilinder: (kleur) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.34, 20), paint(kleur)); m.position.y = 0.17; return [m, 0.34]; },
  kegel: (kleur) => { const m = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 20), paint(kleur)); m.position.y = 0.16; return [m, 0.32]; },
  bol: (kleur) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 14), paint(kleur)); m.position.y = 0.16; return [m, 0.32]; },
};
/** Two black cones, one above the other, pointing up (1) or down (-1) each. */
const cones = (a, b) => () => {
  const g = new THREE.Group();
  [[a, 0.18], [b, 0.56]].forEach(([dir, y]) => {
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.3, 20), paint('zwart'));
    c.position.y = y; if (dir < 0) c.rotation.z = Math.PI; g.add(c);
  });
  return [g, 0.74];
};
const TOPTEKENS = {
  cilinder: (m) => TOP.cilinder(m.banden[0]),
  kegel: (m) => TOP.kegel(m.banden[0]),
  noord: cones(1, 1), zuid: cones(-1, -1), oost: cones(-1, 1), west: cones(1, -1),
  tweeBollen: () => { const g = new THREE.Group(); for (const y of [0.16, 0.52]) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), paint('zwart')); b.position.y = y; g.add(b); } return [g, 0.68]; },
  kruis: () => {
    const g = new THREE.Group();
    for (const a of [Math.PI / 4, -Math.PI / 4]) { const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.06), paint('geel')); bar.rotation.z = a; bar.position.y = 0.2; g.add(bar); }
    return [g, 0.36];
  },
  bolRoodGroen: () => { const b = bandedBall(0.16, ['rood', 'groen', 'rood', 'groen']); b.position.y = 0.16; return [b, 0.32]; },
  // the verbodsteken A.1 as a cylinder, red, white and red: a verboden gebied (bijlage 8 §4)
  verbod: () => {
    const g = new THREE.Group();
    for (const [kleur, lo, hi] of [['rood', 0, 0.12], ['wit', 0.12, 0.22], ['rood', 0.22, 0.34]]) {
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, hi - lo, 20), paint(kleur)); band.position.y = (lo + hi) / 2; g.add(band);
    }
    return [g, 0.34];
  },
  driehoekOmhoog: (m) => [triangle(m.banden[0], 1), 0.8],
  driehoekOmlaag: (m) => [triangle(m.banden[0], -1), 0.8],
  // the splitsingspunt on the bank (§2.1.3d): red point down over green point up, the points touching
  zandloper: () => {
    const h = (0.9 * Math.sqrt(3)) / 2; const g = new THREE.Group();
    const red = triangle('rood', -1); red.position.y = h; g.add(triangle('groen', 1), red);
    return [g, 2 * h];
  },
  // the square boards of §5 on the bank the channel runs along (5.1) or where it crosses over (5.2)
  vaargeulRechts: () => [board([['wit', rect(-0.5, 0, 0.5, 1 / 6)], ['rood', rect(-0.5, 1 / 6, 0.5, 5 / 6)], ['wit', rect(-0.5, 5 / 6, 0.5, 1)]]), 1],
  vaargeulLinks: () => [board([['groen', [[-D, D], [D, D], [0, 2 * D]]], ['wit', [[-D, D], [0, 0], [D, D]]]]), 2 * D],
  overgangRechts: () => [board([['geel', rect(-0.5, 0, -0.12, 1)], ['zwart', rect(-0.12, 0, 0.12, 1)], ['geel', rect(0.12, 0, 0.5, 1)]]), 1],
  overgangLinks: () => {
    const b = 0.12;
    return [board([['geel', [[-D, D], [-b, b], [-b, 2 * D - b]]], ['zwart', [[0, 0], [b, b], [b, 2 * D - b], [0, 2 * D], [-b, 2 * D - b], [-b, b]]],
      ['geel', [[D, D], [b, 2 * D - b], [b, b]]]]), 2 * D];
  },
  schijf: () => [disc(), 0.74],
  takkenLos: () => [twigs(false), 0.7],
  takkenGebonden: () => [twigs(true), 0.7],
};

/** A walbaken's board: a triangle, point up or down, 0.9 m on a side, standing on its lower edge or point. */
function triangle(kleur, dir) {
  const s = 0.9; const h = (s * Math.sqrt(3)) / 2;
  const shape = new THREE.Shape();
  if (dir > 0) { shape.moveTo(-s / 2, 0); shape.lineTo(s / 2, 0); shape.lineTo(0, h); }
  else { shape.moveTo(-s / 2, h); shape.lineTo(s / 2, h); shape.lineTo(0, 0); }
  const board = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false }), paint(kleur));
  board.position.z = 0.06;
  return board;
}

const D = Math.SQRT1_2;                          // m: half the diagonal of a square board 1 m on a side, on its point
const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
/** A board in coloured pieces, each [kleur, points] with x from its middle and y up from its foot, beside the pole as a walbaken's. */
function board(pieces) {
  const g = new THREE.Group();
  for (const [kleur, points] of pieces) {
    const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, y)));
    const piece = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.03, bevelEnabled: false }), paint(kleur));
    piece.position.z = 0.06; g.add(piece);
  }
  return g;
}

/** The dagmerk of a geleidelicht (§5.3): a round board with a cross, black left and right of it, white above and below. */
function disc() {
  const r = 0.35; const g = new THREE.Group();
  const back = new THREE.Mesh(new THREE.CylinderGeometry(r + 0.02, r + 0.02, 0.03, 32), paint('zwart'));
  back.rotation.x = Math.PI / 2; back.position.set(0, r + 0.02, 0.055); g.add(back);
  for (let i = 0; i < 4; i++) {
    const quarter = new THREE.Mesh(new THREE.CircleGeometry(r, 12, (Math.PI / 4) * (2 * i - 1), Math.PI / 2), paint(i % 2 ? 'wit' : 'zwart'));
    quarter.position.set(0, r + 0.02, 0.075); g.add(quarter);
  }
  return g;
}

/**
 * The lantern of a sector light, standing on y = 0: its glass in the colours of its sectors towards the water
 * (+z), dark where it shows no light. Returns [lantern, height, glass].
 */
function lantern(sectoren) {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 24), paint('zwart')); base.position.y = 0.04;
  const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.3, 24), paint('zwart')); glass.position.y = 0.23;
  const cap = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.16, 24), paint('zwart')); cap.position.y = 0.46;
  g.add(base, glass, cap);
  for (const [kleur, from, to] of sectoren) {
    const deg = THREE.MathUtils.degToRad;
    const pane = new THREE.Mesh(new THREE.CylinderGeometry(0.185, 0.185, 0.3, 8, 1, true, deg(from), deg(to - from)), paint(kleur));
    pane.position.y = 0.23; g.add(pane);
  }
  return [g, 0.54, glass];
}

/** The sectors of a sector light on the water before it, each in its colour, from the bank out. */
function fans(sectoren) {
  const g = new THREE.Group();
  for (const [kleur, from, to] of sectoren) {
    const deg = THREE.MathUtils.degToRad;
    const fan = new THREE.Mesh(new THREE.RingGeometry(1.3, 4, 24, 1, deg(from - 90), deg(to - from)),
      new THREE.MeshBasicMaterial({ color: LICHT[kleur], transparent: true, opacity: 0.35, depthWrite: false, side: THREE.DoubleSide }));
    fan.rotation.x = -Math.PI / 2; fan.position.y = 0.06; fan.renderOrder = 1; g.add(fan);   // over the water, which is see-through too
  }
  return g;
}

/** The bit of bank a mark on the wal stands on; `long` m more of it behind, for a pair in line. */
function mound(long = 0) {
  const bank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x6f8f4e, roughness: 1 }));
  bank.position.set(0, 0.05, -long / 2); bank.scale.z = 1 + long / 2.4;
  return bank;
}

/**
 * A pair in line on one bank, the rear one higher (§5.2.3, §5.3), their lights in step: seen one above the
 * other, you are on the line they give.
 */
function markLine(spec, body) {
  const group = new THREE.Group(); group.name = spec.id;
  const pair = body.lijn.map((vorm, i) => { const m = makeMark({ ...spec, vorm }, { bare: true }); m.position.z = -i * body.achter; group.add(m); return m; });
  group.add(mound(body.achter));
  group.userData = { spec, height: pair[1].userData.height, update: (t, night) => { for (const m of pair) m.userData.update(t, night); } };
  return group;
}

/** Twigs at the top of a steekbaken: spread out (stomp), or bound together into a point (spits). */
function twigs(bound) {
  const g = new THREE.Group();
  for (let i = 0; i < 9; i++) {
    const a = (i / 9) * Math.PI * 2; const len = 0.55 + 0.15 * ((i * 7) % 3) / 2;
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.012, len, 5), paint('hout'));
    const spread = bound ? 0.05 : 0.45;
    t.position.set(Math.cos(a) * spread * len / 2, len / 2, Math.sin(a) * spread * len / 2);
    t.rotation.set(Math.sin(a) * spread, 0, -Math.cos(a) * spread);
    g.add(t);
  }
  if (bound) { const tie = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 6, 12), paint('hout')); tie.rotation.x = Math.PI / 2; tie.position.y = 0.45; g.add(tie); }
  return g;
}

/**
 * A small glow that can be lit: a lens and a sprite round it. set(on, night) each frame. `strength`:
 * how brightly the lens burns - less keeps the colour of a large lens, which would burn out to white.
 */
export function makeLamp(kleur, size = 1, strength = 3, { day = false } = {}) {
  const hex = LICHT[kleur] ?? LICHT.wit;
  const group = new THREE.Group();
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.05 * size, 12, 8), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: hex, emissiveIntensity: 0 }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: hex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  glow.scale.setScalar(0.45 * size);
  group.add(lens, glow);
  // in daylight a lamp is no more than a bright lens; its glow comes up with the dark. A light that is there to be
  // seen by day (`day`: a signal at a bridge or lock, a flikkerlicht) burns full and keeps some of its glow
  group.userData.set = (on, night) => {
    const k = on ? 1 : 0; const dusk = night * night * (3 - 2 * night);
    lens.material.emissiveIntensity = strength * k * (day ? 1 : 0.4 + 0.6 * dusk);
    glow.material.opacity = k * (day ? 0.3 + 0.7 * dusk : 0.15 + 0.85 * dusk);
    glow.visible = k > 0;
  };
  return group;
}
let glowMap = null;
function glowTexture() {
  if (glowMap) return glowMap;
  const c = Object.assign(document.createElement('canvas'), { width: 64, height: 64 });
  const g = c.getContext('2d'); const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,0.6)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 64, 64);
  glowMap = new THREE.CanvasTexture(c); glowMap.userData.shared = true;   // one for every lamp: never disposed with one
  return glowMap;
}

/**
 * One mark, standing on its waterline at the origin. Returns a group; group.userData.update(t, night)
 * flashes its light (t in seconds, night 0..1), and bobs it a little if it floats. `bare`: one on the wal
 * without its own bit of bank, for a pair that shares one.
 */
export function makeMark(spec, { bare = false } = {}) {
  const body = BODY[spec.vorm];
  if (body.lijn) return markLine(spec, body);
  const inner = new THREE.Group();                                    // what bobs on the water
  const group = new THREE.Group(); group.name = spec.id; group.add(inner);
  const floats = !body.pole && !body.twig && !body.bank && spec.vorm !== 'haveningang';
  let top = body.top;
  if (body.profile) inner.add(turned(body.profile, spec.banden));
  else if (body.sphere) { const b = bandedBall(body.sphere, spec.banden); b.position.y = body.top - body.sphere; inner.add(b); }
  else if (body.float) {
    const f = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.45, 20), paint(spec.banden[0])); f.position.y = 0.05; inner.add(f);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.65, 8), paint(spec.banden[0])); pole.position.y = 0.27 + 0.82; inner.add(pole);
  } else if (body.pole) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(body.pole, body.pole, body.top + 1.5, 10), paint(spec.banden[0])); pole.position.y = (body.top - 1.5) / 2; inner.add(pole);
  } else if (body.twig) {
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.035, body.top + 1, 6), paint('hout')); stick.position.y = (body.top - 1) / 2; inner.add(stick);
    top = body.top - 0.45;                                          // the twigs start below the tip
  } else if (body.bank) {
    if (!bare) inner.add(mound());
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, body.top, 8), paint('wit')); pole.position.y = body.top / 2 + 0.2; inner.add(pole);
    top = body.top + 0.2;                                           // the top of the pole
  }
  if (spec.top) {
    const [mark, height] = TOPTEKENS[spec.top](spec);
    const onSpar = !body.twig && !body.bank;
    const lift = onSpar ? 0.12 : 0;
    if (onSpar) { const spar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, lift + 0.02, 6), paint('zwart')); spar.position.y = top + lift / 2; inner.add(spar); }
    // a board is on the pole, not above it: its foot 0.9 m under the top, or lower for a taller one
    mark.position.y = body.bank ? top - Math.max(0.9, height) : top + lift; inner.add(mark);
    if (!body.bank) top += lift + height;
  }
  let eye = null;                                                    // where the sector light was last looked at from
  let glassAt = null;                                                // the middle of its glass: its lamps burn there
  if (body.lantaarn) {
    const [l, height, glass] = lantern(spec.sectoren); l.position.y = top; inner.add(l, fans(spec.sectoren));
    glassAt = top + glass.position.y; top += height;
    eye = new THREE.Vector3(0, 0, 1);
    glass.onBeforeRender = (renderer, scene, camera) => { eye.setFromMatrixPosition(camera.matrixWorld); };
  }
  let flash = null; let lamp = null; let sectors = null;
  if (spec.licht) flash = character(spec.licht[1]);
  // a sector light has a lamp for each sector, and the one lit is that of the sector you look from
  if (spec.sectoren) {
    sectors = spec.sectoren.map(([kleur, from, to]) => {
      const l = makeLamp(kleur); l.position.y = glassAt ?? top + 0.08; inner.add(l);
      const glow = l.children[1]; glow.material.depthTest = false; glow.renderOrder = 5;   // seen through its own glass
      return { lamp: l, from, to };
    });
  } else if (spec.licht) { lamp = makeLamp(spec.licht[0]); lamp.position.y = top + 0.08; inner.add(lamp); }
  const phase = (spec.id.length * 0.37) % 3;                         // not every buoy in step
  const seen = new THREE.Vector3();
  group.userData = {
    spec, height: top + 0.2,
    update(t, night) {
      lamp?.userData.set(night > 0.3 && flash(t + phase), night);   // a daylight switch: lit only in the dark
      if (sectors) {
        inner.worldToLocal(seen.copy(eye)); const bearing = THREE.MathUtils.radToDeg(Math.atan2(seen.x, seen.z));
        for (const s of sectors) s.lamp.userData.set(night > 0.3 && bearing >= s.from && bearing < s.to && flash(t + phase), night);
      }
      if (floats) { inner.position.y = 0.03 * Math.sin(t * 1.3 + phase); inner.rotation.z = 0.04 * Math.sin(t * 0.9 + phase); inner.rotation.x = 0.03 * Math.sin(t * 1.1 + phase * 2); }
    },
  };
  group.userData.aim = !!spec.sectoren;                           // Zoeken turns its middle sector to the eye
  return group;
}
