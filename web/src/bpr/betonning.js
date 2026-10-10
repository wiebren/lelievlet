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
  haveningang: { profile: [[0.15, -0.5], [0.15, 3.4], [0, 3.4]], top: 3.4 },
};

/**
 * Every mark the lessons need. `vorm` picks the body, `banden` its colours from the top down (one
 * entry: all of it), `top` the topteken, `licht` the colour and character of its light.
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
  { id: 'bpr-aanvullend-rechts', naam: 'Aanvullende markering rood-wit', vorm: 'sparAanvullend', banden: ['rood', 'wit', 'rood', 'wit'], top: 'cilinder' },
  { id: 'bpr-aanvullend-links', naam: 'Aanvullende markering groen-wit', vorm: 'sparAanvullendSpits', banden: ['groen', 'wit', 'groen', 'wit'], top: 'kegel' },
  { id: 'bijzondere-markering', naam: 'Bijzondere markering (geel)', vorm: 'sparKlein', banden: ['geel'], top: 'kruis', licht: ['geel', 'Fl 5s'] },
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
  driehoekOmhoog: (m) => [triangle(m.banden[0], 1), 0.8],
  driehoekOmlaag: (m) => [triangle(m.banden[0], -1), 0.8],
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
export function makeLamp(kleur, size = 1, strength = 3) {
  const hex = LICHT[kleur] ?? LICHT.wit;
  const group = new THREE.Group();
  const lens = new THREE.Mesh(new THREE.SphereGeometry(0.05 * size, 12, 8), new THREE.MeshStandardMaterial({ color: 0x222222, emissive: hex, emissiveIntensity: 0 }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTexture(), color: hex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
  glow.scale.setScalar(0.9 * size);
  group.add(lens, glow);
  group.userData.set = (on, night) => {
    const k = on ? 1 : 0;
    lens.material.emissiveIntensity = strength * k;
    glow.material.opacity = k * (0.25 + 0.75 * night);
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
 * flashes its light (t in seconds, night 0..1), and bobs it a little if it floats.
 */
export function makeMark(spec) {
  const body = BODY[spec.vorm];
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
    const bank = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.2, 0.4, 16), new THREE.MeshStandardMaterial({ color: 0x6f8f4e, roughness: 1 }));
    bank.position.y = 0.05; inner.add(bank);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, body.top, 8), paint('wit')); pole.position.y = body.top / 2 + 0.2; inner.add(pole);
    top = body.top + 0.2 - 0.9;                                     // the board is on the pole, not above it
  }
  if (spec.top) {
    const [mark, height] = TOPTEKENS[spec.top](spec);
    const onSpar = !body.twig && !body.bank;
    const lift = onSpar ? 0.12 : 0;
    if (onSpar) { const spar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, lift + 0.02, 6), paint('zwart')); spar.position.y = top + lift / 2; inner.add(spar); }
    mark.position.y = top + lift; inner.add(mark);
    top += lift + height;
    if (body.bank) top = body.top + 0.2;
  }
  let flash = null; let lamp = null;
  if (spec.licht) {
    lamp = makeLamp(spec.licht[0]); lamp.position.y = top + 0.08; inner.add(lamp);
    flash = character(spec.licht[1]);
  }
  const phase = (spec.id.length * 0.37) % 3;                         // not every buoy in step
  group.userData = {
    spec, height: top + 0.2,
    update(t, night) {
      lamp?.userData.set(night > 0.3 && flash(t + phase), night);   // a daylight switch: lit only in the dark
      if (floats) { inner.position.y = 0.03 * Math.sin(t * 1.3 + phase); inner.rotation.z = 0.04 * Math.sin(t * 0.9 + phase); inner.rotation.x = 0.03 * Math.sin(t * 1.1 + phase * 2); }
    },
  };
  return group;
}
