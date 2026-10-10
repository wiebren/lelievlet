import * as THREE from 'three';
import { BORDEN } from './borden/index.js';
import { TEKENS, makeSign } from './tekens.js';
import { MARKS, makeMark } from './betonning.js';
import { BORD_UITLEG, MARK_UITLEG } from './uitleg.js';
import { SEINEN, seinPlaatje, makeSein, makeVeerpont } from './seinen.js';
import { NIET_CWO, EXTRA } from './borden/index.js';
import { VLAGGEN, VLAG_GROEPEN, VLAG_KLEUREN, PATRONEN, vlagSvg, makeVlag, makeHijs, aanBoord } from './vlaggen.js';
import { CONFIGS, makeShip } from './schepen.js';
import { makeHoorn, patroonSvg } from './hoorn.js';
import { GELUIDEN, GELUID_GROEPEN } from './geluiden.js';
import { LICHT_GROEPEN, LICHT_UITLEG } from './lichtuitleg.js';

// Zoeken, beside Onderdelen: the pages Borden (BPR bijlage 7), Markeringen (bijlage 8), Seinen (the
// lights at bridges, locks and spuisluizen, bijlage 7 G and H), Vlaggen (the BPR's, the racing signals and
// the code flags), Lichten and Dagmerken (the ships of BPR hoofdstuk 3) and Geluidsseinen (bijlage 6), off a
// start page with a field over everything. Each one has a search field and a way to find a thing by what it looks
// like: a sign by its colour and then the kind of sign, a mark by its shape and its colours, a signal by
// where it stands and the colours of its lights, a flag by its kind, colours and pattern. What is picked gets a card at the top of the list, and
// stands out on the water beside the boat while the camera goes to look at it; letting go of it (the
// card's ×, another page, the panel closing) takes it away again and the camera back to where it was.

const el = (tag, props = {}, ...children) => { const n = Object.assign(document.createElement(tag), props); n.append(...children); return n; };
const fold = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const asImage = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;   // its own document: no ids shared

// Borden, as they look: the colour first, then where a colour has many signs, the kind of sign
const BORD_KLEUREN = [
  { key: 'rood', label: 'Rood', dot: '#c8102e', groepen: [
    ['Rood-wit', ['A.1', 'A.1a', 'A.10']],
    ['Doorgestreept', ['A.2', 'A.4', 'A.5', 'A.5.1', 'A.6', 'A.7', 'A.9', 'A.12', 'A.13', 'A.15', 'A.16', 'A.17']],
    ['Rode rand', ['B.1a', 'B.1b', 'B.5', 'B.6', 'B.8', 'B.9a', 'B.9b', 'C.1', 'C.2', 'C.3', 'C.5']],
  ] },
  { key: 'blauw', label: 'Blauw', dot: '#0b4ea2', groepen: [
    ['Met een teken', ['E.2', 'E.4a', 'E.4b', 'E.5', 'E.5.1', 'E.5.3', 'E.6', 'E.7', 'E.15', 'E.16', 'E.18', 'E.19', 'E.20', 'E.11', 'D.3a']],
    ['Kruisingen', ['E.9a', 'E.9b', 'E.9c', 'E.9d', 'E.9e', 'E.9f', 'E.9g', 'E.9h', 'E.9i', 'E.10a', 'E.10b', 'E.10c', 'E.10d', 'E.10e', 'E.10f']],
  ] },
  { key: 'geel', label: 'Geel', dot: '#f5b800', groepen: [
    ['Aanbevolen doorvaart', ['D.1a', 'D.1b']],
    ['Hoogte en diepte', ['G.5.1', 'G.5.1a', 'G.5.1b', 'G.5.2']],
  ] },
  { key: 'groen', label: 'Groen', dot: '#1f7a45', groepen: [['', ['E.1', 'D.2']]] },
  { key: 'wit', label: 'Wit', dot: '#ffffff', groepen: [['Onderborden', ['F.1', 'F.2a', 'F.3', 'F.4']]] },
];

// signs that hang on a bridge (BPR bijlage 7: A.10 and D.2 at the edges of the opening, D.1 over it, C.2 and
// the hoogtebord on it): put out on a fixed bridge, not on a post
const OP_BRUG = new Set(['A.10', 'D.2', 'D.1a', 'D.1b', 'C.2', 'G.5.1b', 'G.5.1c', 'G.5.2', 'G.5.3']);
// where an extra sign goes, when its looks say less than what it is for
const EXTRA_GROEP = { 'G.5.1c': 'Hoogte en diepte', 'G.5.3': 'Hoogte en diepte', 'H.2.3': 'Wegwijzers' };

// the signs beyond the main list (most of them not asked by CWO), each in its place by its looks: in a group of its colour, a new one
// when the colour has its groups and this is none of them, in the one there is when it has only one
const EXTRA_BY = new Map(EXTRA.map((x) => [x.code, x]));
for (const x of EXTRA) {
  const k = BORD_KLEUREN.find((c) => c.key === x.kleur) ?? BORD_KLEUREN.find((c) => c.key === 'wit');
  const named = k.groepen.some(([g]) => g);
  const name = EXTRA_GROEP[x.code] ?? x.groep;
  const groep = named ? k.groepen.find(([g]) => g === name) ?? (k.groepen.push([name || 'Overig', []]), k.groepen.at(-1)) : k.groepen[0];
  groep[1].push(x.code);
}

// Markeringen: the shape of the body, and the colours on it
const VORM = {
  stompeTon: 'stomp', spitseTon: 'spits', sparStomp: 'spar', sparSpits: 'spar', sparKlein: 'spar', sparAanvullend: 'spar',
  sparAanvullendSpits: 'spar', bol: 'bol', drijfbaken: 'baken', kopbaken: 'baken', steekbaken: 'baken', walbaken: 'wal', haveningang: 'wal',
  oeverbord: 'bord', geleidelijn: 'bord', geleidelichten: 'licht', sectorlicht: 'licht',
};
const VORMEN = [['stomp', 'Stompe ton'], ['spits', 'Spitse ton'], ['spar', 'Spar'], ['bol', 'Bol'], ['baken', 'Baken'], ['wal', 'Op de wal'],
  ['bord', 'Oeverbord'], ['licht', 'Licht op de wal']];
const MARK_KLEUREN = [['rood', 'Rood', '#c1121c'], ['groen', 'Groen', '#0f8a3c'], ['geel', 'Geel', '#f2c200'],
  ['zwart', 'Zwart', '#161616'], ['wit', 'Wit', '#ffffff'], ['hout', 'Takken', '#7a5a3a']];
// (a sector light: the colours of its sectors too)
const kleurenVan = (spec) => new Set([...spec.banden.flatMap((b) => b.split(/[ -]/)), ...(spec.sectoren ?? []).map(([k]) => k)].filter((k) => MARK_KLEUREN.some(([key]) => key === k)));

const CLEAR = 4.5;                 // m: kept between it and the middle of the wind arrow
const OUT = 7;                     // m: how far from the middle of the boat a sign or mark is put out
const AHEAD = 18;                  // m: how far ahead a bridge, lock or spuisluis stands, the boat coming up to it
const THUMB = 160;                 // px: the picture of a mark in the list, rendered from its model

/**
 * ui: the viewer's shadow root; renderer, scene, camera: to draw the pictures of the marks and to put
 * the one picked out on the water; boat(): the middle of the boat; lookFromHelm(point | null): the
 * camera at the helm as in Schipper, looking at a point (null lets go); waterline(): the height of the
 * water; windArrow(): the arrow on the water that shows the wind, to keep clear of; view(): where the camera and its target are now; fly(position, target): the camera goes
 * there; setDark(k): night 0..1 held, or null to let go; eigen.show({ licht, bal } | null): the lelievlet's own
 * toplicht and ankerbol (and zaklamp, seen from side `zijde`) shown on her, for what she carries herself; eigen.box():
 * all of her, to fit in the view.
 * Returns { update(dt), release(), info(), entries(), reset(), goto(page), destroy(), parts(list, search) }.
 */
export function initZoeken({ ui, renderer, scene, camera, boat, lookFromHelm, waterline, windArrow, view, fly, setDark, eigen }) {
  // how dark it is held here, 0 day .. 1 night: the lights of a ship shown come up with it, as a light does at dusk
  let darkK = 0;
  const holdDark = (k) => { darkK = Math.min(k ?? 0, 1); setDark(k); };
  const $ = (id) => ui.getElementById(id);
  const holder = new THREE.Group(); holder.name = 'zoeken'; scene.add(holder);
  const built = new Map();                                       // 'bord:A.6' / 'mark:id' -> the object, built once
  let shown = null;                                              // { key, object }
  let cameFrom = null;                                           // the view before the first one was put out
  let dark = false; let t = 0;
  let helmHeld = false;
  const downwind = new THREE.Vector3(); const quat = new THREE.Quaternion(); const quat2 = new THREE.Quaternion();                                          // the view is at the helm, for Op het water
  const cards = [];                                              // every card's close, to let go from anywhere
  const resets = [];                                             // every tab back to how it opened the first time
  const entries = [];                                            // every sign, mark and signal, for the quiz (tekenquiz.js)
  const sources = [];                                            // per tab what it has, for the field over everything
  const hoorn = makeHoorn();                                     // the sound signals of Geluidsseinen, heard

  const NAMEN = new Map(TEKENS.flatMap(([, , list]) => list));   // code -> name
  let drawPictures = () => {};                                   // the pictures of the marks, once their tab is opened
  let drawLights = () => {};                                     // and those of the ships' lights,
  let drawDagmerken = () => {};                                  // and of their dagmerken

  /**
   * Pictures of models, each rendered by day above the water only (what floats has a part under it):
   * `list` [{ object, img }], each object taken out of where it is and put back after; `lens(mid, reach)`
   * where the camera stands, given the middle of what is to be seen and how far back it must be to see
   * all of it; `w` and `h` the picture in pixels. The renderer is left as it was, whatever goes wrong.
   */
  function snapshots(list, { lens: lensAt, w = THUMB, h = THUMB, fit = 0.56, extent = (size) => Math.max(size.y, size.x, size.z) }) {
    const stage = new THREE.Scene(); stage.environment = scene.environment;
    stage.add(new THREE.HemisphereLight(0xffffff, 0x8a99a8, 1.1));
    const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(-3, 6, 5); stage.add(sun);
    const lens = new THREE.PerspectiveCamera(24, w / h, 0.1, 1000);
    const target = new THREE.WebGLRenderTarget(w, h, { samples: 4 });
    target.texture.colorSpace = THREE.SRGBColorSpace;
    const pixels = new Uint8Array(w * h * 4);
    const canvas = el('canvas', { width: w, height: h }); const g = canvas.getContext('2d');
    const was = { target: renderer.getRenderTarget(), clear: renderer.getClearColor(new THREE.Color()), alpha: renderer.getClearAlpha(),
      planes: renderer.clippingPlanes };
    renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)];   // what is under water is left out
    try {
      const box = new THREE.Box3(); const part = new THREE.Box3(); const size = new THREE.Vector3(); const mid = new THREE.Vector3();
      for (const { object, img } of list) {
        const parent = object.parent; const at = object.position.clone(); const turned = object.rotation.clone();
        object.position.set(0, 0, 0); object.rotation.set(0, 0, 0); stage.add(object);
        object.updateMatrixWorld(true);
        // framed on what is solid above the water: not the glow round a light, which is mostly empty
        box.makeEmpty();
        object.traverse((o) => {
          if (!o.isMesh || !o.visible) return;
          if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
          box.union(part.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld));
        });
        box.min.y = Math.max(box.min.y, 0); box.getSize(size); box.getCenter(mid);
        const reach = extent(size) * fit / Math.tan(THREE.MathUtils.degToRad(lens.fov / 2));
        lens.position.set(...lensAt(mid, reach, size)); lens.lookAt(mid);
        renderer.setRenderTarget(target); renderer.setClearColor(0x000000, 0); renderer.clear();
        renderer.render(stage, lens);
        renderer.readRenderTargetPixels(target, 0, 0, w, h, pixels);
        const image = g.createImageData(w, h);
        for (let y = 0; y < h; y++) image.data.set(pixels.subarray((h - 1 - y) * w * 4, (h - y) * w * 4), y * w * 4);
        g.putImageData(image, 0, 0);
        img.src = canvas.toDataURL();
        stage.remove(object); object.position.copy(at); object.rotation.copy(turned); parent?.add(object);
      }
    } finally {                                                  // whatever went wrong, the viewer's own drawing is left as it was
      renderer.setRenderTarget(was.target); renderer.setClearColor(was.clear, was.alpha); renderer.clippingPlanes = was.planes;
      target.dispose();
    }
  }

  /**
   * Put an object out on the water beside the boat and go to look at it: abeam on the side the camera
   * is on, a little forward or aft, or else on the other side, wherever it stands clear of the wind arrow.
   * `ahead`: a bridge or lock, straight ahead with its opening on her line, as when coming up to it.
   * `helm`: looked at from where the helmsman sits, not from over the boat. `wide`: further back, for
   * what is as wide as the water (a veerpont between its two kades). `far`: a ship, turned `deg`, out ahead
   * (shipView).
   */
  let lens = null;                                               // how far (and near) the camera saw before a ship took it further
  /** Back to the camera's own range, once nothing far out is shown. */
  const restoreLens = () => { if (lens !== null) { camera.far = lens; camera.userData.minNear = 0; camera.updateProjectionMatrix(); lens = null; } };
  /**
   * What the panel leaves of the view: on a phone it lies over the lower part (and so does the card of a quiz
   * round, at the bottom of the view wherever it is), `covered` of the height; on a wide screen it stands at the
   * right, `right` of the width. And the camera's lens, as the tangents of half its angles.
   */
  function freeView() {
    const canvas = ui.getElementById('scene').getBoundingClientRect();
    const covered = Math.max(0, ...[ui.getElementById('parts'), ...ui.querySelectorAll('.focus-card')].map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > canvas.width * 0.6 || (r.width && r.bottom > canvas.bottom - 40 && r.left < canvas.left + canvas.width / 2 && r.right > canvas.left + canvas.width / 2))
      .map((r) => Math.max(0, canvas.bottom - r.top) / canvas.height));
    const panel = ui.getElementById('parts').getBoundingClientRect();
    const right = panel.width && panel.width < canvas.width * 0.6 && panel.left > canvas.left + canvas.width / 2 ? Math.max(0, canvas.right - panel.left) / canvas.width : 0;
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    return { covered, right, tanV, tanH: tanV * camera.aspect };
  }
  function show(key, make, { ahead = false, helm = false, wide = false, far = false, deg = 0 } = {}) {
    if (shown?.key === key) return;
    if (shown?.flags) eigen?.flags?.(null);
    if (shown?.own) eigen?.show(null);                           // the lelievlet back as she was
    if (!built.has(key)) built.set(key, make());
    const object = built.get(key);
    holder.clear(); holder.add(object);
    if (!shown) cameFrom = view();
    shown = { key, object };
    const centre = boat(); const { position } = view();
    const near = Math.sign(position.z - centre.z) || 1;
    const { covered, right, tanV, tanH } = freeView();
    if (far) {
      const { at, from, target } = shipView(object, deg, { covered, right, tanV, tanH });
      object.position.copy(at); object.rotation.y = -Math.PI / 2;
      if (helmHeld) { helmHeld = false; lookFromHelm(null); }
      fly(from, target);
      return;
    }
    restoreLens();                                               // a sign or mark by the boat: the camera's own range
    const arrow = windArrow()?.visible ? new THREE.Box3().setFromObject(windArrow()).getCenter(new THREE.Vector3()) : null;
    const spots = [near, -near].flatMap((s) => [1.5, 5, -2].map((dx) => ({ side: s, at: new THREE.Vector3(centre.x + dx, waterline(), centre.z + s * OUT) })));
    const { side, at } = ahead ? { side: near, at: new THREE.Vector3(centre.x + AHEAD, waterline(), centre.z) }
      : spots.find(({ at: p }) => !arrow || Math.hypot(p.x - arrow.x, p.z - arrow.z) > CLEAR) ?? spots[0];
    object.position.copy(at);
    // a sign faces +z: towards the boat on her port side; ahead, towards her bow
    object.rotation.y = ahead ? -Math.PI / 2 : side > 0 ? Math.PI : 0;
    // looked at from over the boat, as from the water: the boat in front, the sign or mark beyond her
    const height = object.userData.height ?? 2;
    const target = object.position.clone().setY(waterline() + height * 0.5).lerp(centre.clone().setY(waterline() + 1), ahead ? 0.2 : 0.35);
    // from the helm: where Schipper sits, looking at it (main.js holds the view there, the head free to turn)
    if (helm) {
      // the card of the round lies over the lower part: looked at a little below it, it stands in what is left.
      // Schipper's lens is some 90 degrees across, less upright on a narrow screen (main.js followRunView).
      const look = object.position.clone().setY(waterline() + height * 0.45);
      const canvas = ui.getElementById('scene').getBoundingClientRect();
      const card = [...ui.querySelectorAll('.focus-card')].map((el) => el.getBoundingClientRect()).find((r) => r.width);
      const covered = card ? Math.max(0, canvas.bottom - card.top) / canvas.height : 0;
      const upright = THREE.MathUtils.clamp(2 * Math.atan(1 / camera.aspect), THREE.MathUtils.degToRad(50), THREE.MathUtils.degToRad(85));
      look.y -= covered * look.distanceTo(centre) * Math.tan(upright / 2);
      if (object.userData.aim) object.rotation.y = Math.atan2(centre.x - object.position.x, centre.z - object.position.z);   // its middle sector to her
      helmHeld = true; lookFromHelm(look); return;
    }
    if (helmHeld) { helmHeld = false; lookFromHelm(null); }
    const from = wide ? new THREE.Vector3(centre.x - 24, waterline() + 11, centre.z + side * 7)
      : ahead ? new THREE.Vector3(centre.x - 11, waterline() + 6, centre.z + side * 5)   // over and past the sails, the whole of it in view
      : new THREE.Vector3(centre.x - 7, waterline() + 3.4, centre.z - side * 5);
    // aimed lower, it is seen in the middle of what the panel leaves
    target.y -= covered * from.distanceTo(target) * tanV;
    // a light that shows its colour by where it is seen from (a sectorlicht): its middle sector to the camera
    if (object.userData.aim) object.rotation.y = Math.atan2(from.x - object.position.x, from.z - object.position.z);
    fly(from, target);
  }

  /**
   * A ship of Lichten and Dagmerken, turned `deg` (0 coming at you): out ahead of the boat as far as it takes to see
   * all of her as she lies - top of the mast to the water, end to end - filling some two thirds of what the panel
   * leaves of the view. Looked at from just past the bow, so none of the boat's own rigging is in the way, from a
   * height that goes with hers, low for a small boat and higher for a tall ship: the lowest at which no light that
   * shows this way is hidden behind a part of her (a light aft behind a post forward, say).
   */
  const FRONT = 4; const FILL = 0.68;
  // a line or a thin post is narrower than a light: it never hides one (as schepen.js has it)
  const thin = (o) => o.geometry?.type === 'CylinderGeometry' && Math.max(o.geometry.parameters.radiusTop, o.geometry.parameters.radiusBottom) < 0.045;
  const sight = new THREE.Raycaster(); const lampAt = new THREE.Vector3(); const seen = new THREE.Vector3();
  function shipView(object, deg, { covered, right, tanV, tanH }) {
    const centre = boat();
    const { top = 6, ship } = object.userData;
    const high = 2 * Math.atan(tanV * (1 - covered)) * FILL; const wide = 2 * Math.atan(tanH * (1 - right)) * FILL;
    const lights = ship?.userData.lights ?? [];
    const lamps = new Set(); for (const l of lights) l.lamp.traverse((o) => lamps.add(o));
    const solid = []; object.traverse((o) => { if (o.isMesh && !lamps.has(o) && o.geometry?.type !== 'CircleGeometry') solid.push(o); });
    // what is to be seen of her, as she lies turned: the corners of all her parts above the water, from her middle
    object.position.set(0, 0, 0); object.rotation.y = -Math.PI / 2; object.updateMatrixWorld(true);
    const origin = object.getWorldPosition(new THREE.Vector3()); const box = new THREE.Box3(); const points = [];
    for (const o of solid) {
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); box.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        points.push(new THREE.Vector3(x - origin.x, Math.max(0, y - origin.y), z - origin.z));
      }
    }
    const nearest = Math.min(0, ...points.map((p) => p.x)); const farthest = Math.max(1, ...points.map((p) => Math.hypot(p.x, p.z)));
    // the angles she takes up from an eye `eye` above the water and `side` to starboard of her line, her middle `d` ahead
    const angles = (eye, side, d) => {
      let h0 = Infinity; let h1 = -Infinity; let v0 = Infinity; let v1 = -Infinity;
      for (const p of points) {
        const x = d + p.x; const z = p.z - side; const h = Math.atan2(z, x); const v = Math.atan2(p.y - eye, Math.hypot(x, z));
        if (h < h0) h0 = h; if (h > h1) h1 = h; if (v < v0) v0 = v; if (v > v1) v1 = v;
      }
      return { h0, h1, v0, v1 };
    };
    const place = (eye, side) => {
      // not nearer than 8 m: closer by, a small boat looks as if seen through a door spy
      let d = 8 - nearest; let f = angles(eye, side, d);
      // on a phone, a duwstel across the narrow view lies the better part of a kilometre off
      while (d < 1500 && (f.v1 - f.v0 > high || f.h1 - f.h0 > wide)) { d += d < 200 ? 1 : 5; f = angles(eye, side, d); }
      const from = new THREE.Vector3(centre.x + FRONT, waterline() + eye, centre.z + side);
      return { eye, d, from, at: new THREE.Vector3(from.x + d, waterline(), centre.z), aimH: (f.h0 + f.h1) / 2, aimV: (f.v0 + f.v1) / 2 };
    };
    // how many of the lights that show towards `from` are hidden from it
    const hiddenFrom = ({ from, at }) => {
      object.position.copy(at); object.rotation.y = -Math.PI / 2; object.updateMatrixWorld(true);
      let n = 0;
      for (const l of lights) {
        if (l.swing) continue;
        l.lamp.getWorldPosition(lampAt);
        if (l.arc) {
          seen.copy(from); l.lamp.parent.worldToLocal(seen); seen.x -= l.rest.x; seen.z -= ship.userData.axis ?? 0;   // as schepen.js does
          const bearing = THREE.MathUtils.radToDeg(Math.atan2(seen.z, seen.x)); const [lo, hi] = l.arc;
          const b = hi > 180 ? (bearing + 360) % 360 : bearing;
          if (b < lo || b > hi) continue;
        }
        const dir = lampAt.clone().sub(from); const dist = dir.length();
        sight.set(from, dir.normalize()); sight.far = dist - 0.12;
        if (sight.intersectObjects(solid, false).some(({ object: o }) => !thin(o))) n++;
      }
      return n;
    };
    const base = THREE.MathUtils.clamp(top * 0.5, 2.5, 9.5);
    let best = null;
    // as high as it takes, up to well over her: from astern a sleepboot's heklicht is behind the ship she tows. And
    // where that is not enough (a ponton with a bok on it), a little to one side: on her line first, as she is met
    search: for (const side of [0, 4, -4, 8, -8]) {
      for (let eye = base; eye <= Math.max(base + 2, top * 1.6 + 2, 18); eye += 0.75) {
        const view = place(eye, side); view.hidden = hiddenFrom(view);
        if (!best || view.hidden < best.hidden) best = view;
        if (!view.hidden) break search;
      }
    }
    const { d, from, at, aimH, aimV } = best;
    // the middle of what she takes up, up and down and side to side
    const target = from.clone().add(new THREE.Vector3(Math.cos(aimV) * Math.cos(aimH), Math.sin(aimV), Math.cos(aimV) * Math.sin(aimH)).multiplyScalar(d));
    // aimed lower, or for the panel at the right a little to the right of her: she is in the middle of what it leaves
    target.y -= covered * from.distanceTo(target) * tanV;
    target.z += right * from.distanceTo(target) * tanH;
    // the camera keeps within reach of what it looks at (OrbitControls' maxDistance): a long ship far out is
    // looked at through a point on the same line, nearer by, so it is the same view from the same place
    if (from.distanceTo(target) > 45) target.sub(from).setLength(45).add(from);
    // the camera sees 200 m; a long sleep across the view lies further off than that, while she is shown (and then
    // it need not see as near as it does: the depth of what it sees is the sharper for it)
    if (lens === null) lens = camera.far;
    camera.far = Math.max(lens, d + farthest + 30); camera.updateProjectionMatrix();
    camera.userData.minNear = camera.far > 400 ? 0.5 : 0;           // main.js keeps the near plane no nearer
    return { at, from, target };
  }
  /** The ship shown turned another way: out at the distance that goes with it, the camera after her. */
  function turnShip(deg) {
    const object = shown?.object; if (!object?.userData.turn) return;
    object.userData.turn(deg);
    const { at, from, target } = shipView(object, deg, freeView());
    object.position.copy(at); fly(from, target);
  }

  /**
   * What a lelievlet carries, shown on the boat herself rather than on a model of one: nothing is put out,
   * her own toplicht and ankerbol are shown (eigen), and the camera goes round her to the side asked.
   */
  function showOwn(key, signals, deg) {
    holder.clear(); restoreLens();
    if (shown?.flags) eigen?.flags?.(null);
    if (shown?.own) eigen?.show(null);                           // another of hers: what the one before set, undone first
    if (helmHeld) { helmHeld = false; lookFromHelm(null); }
    if (!shown) cameFrom = view();
    shown = { key, object: null, own: { ...signals, licht: dark ? 1 : 0, zijde: deg } };
    eigen?.show(shown.own);
    lookAtOwn(deg);
  }
  /**
   * A flag she may fly herself, on her: hoisted on her weather want, and looked at from her weather quarter,
   * square to the cloth, a little from above.
   */
  function showFlags(key, v) {
    if (shown?.key === key) return;
    holder.clear(); restoreLens();
    if (helmHeld) { helmHeld = false; lookFromHelm(null); }
    if (shown?.flags) eigen?.flags?.(null);
    if (shown?.own) eigen?.show(null);
    if (!shown) cameFrom = view();
    const group = makeHijs(v);
    const at = eigen?.flags?.(group);
    if (!at) {                                                   // her mast is down: on a staff beside her, as in the quiz
      const was = cameFrom; shown = null; show(key, () => makeVlag(v)); cameFrom = was ?? cameFrom;
      return;
    }
    shown = { key, object: null, flags: group };
    const face = at.face.setY(0).normalize();
    if (face.dot(at.quarter) < 0) face.negate();
    fly(at.mid.clone().addScaledVector(face, 5).addScaledVector(at.quarter, 2).add(new THREE.Vector3(0, 0.6, 0)), at.mid);
  }

  /**
   * Round her: 0 from ahead, 90 her bakboord, 180 from astern, 270 her stuurboord. As far off as it takes to see
   * all of her, the top of the mast to the water, in what the panel leaves of the view (as shipView has a ship).
   */
  function lookAtOwn(deg) {
    if (shown?.own) shown.own.zijde = deg;                       // the zaklamp is held out on the side she is seen from
    const c = boat(); const a = THREE.MathUtils.degToRad(deg);
    const box = eigen?.box?.() ?? new THREE.Box3(c.clone().addScalar(-3), c.clone().addScalar(3));
    const points = [];
    for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) points.push(new THREE.Vector3(x, Math.max(y, waterline()), z));   // above the water
    const { covered, right, tanV, tanH } = freeView();
    const high = 2 * Math.atan(tanV * (1 - covered)) * FILL; const wide = 2 * Math.atan(tanH * (1 - right)) * FILL;
    const ahead = new THREE.Vector3(-Math.cos(a), 0, Math.sin(a)); const across = new THREE.Vector3(-ahead.z, 0, ahead.x);   // looking, and to its right
    const eye = waterline() + 2.5; const q = new THREE.Vector3();
    const angles = (from) => {
      let h0 = Infinity; let h1 = -Infinity; let v0 = Infinity; let v1 = -Infinity;
      for (const p of points) {
        q.copy(p).sub(from); const x = q.dot(ahead); const z = q.dot(across);
        const h = Math.atan2(z, x); const v = Math.atan2(q.y, Math.hypot(x, z));
        h0 = Math.min(h0, h); h1 = Math.max(h1, h); v0 = Math.min(v0, v); v1 = Math.max(v1, v);
      }
      return { h0, h1, v0, v1 };
    };
    const at = (d) => c.clone().addScaledVector(ahead, -d).setY(eye);
    let d = 7; let f = angles(at(d));
    while (d < 60 && (f.v1 - f.v0 > high || f.h1 - f.h0 > wide)) { d += 0.25; f = angles(at(d)); }
    const from = at(d); const aimH = (f.h0 + f.h1) / 2; const aimV = (f.v0 + f.v1) / 2;
    const target = from.clone().addScaledVector(ahead, Math.cos(aimV) * Math.cos(aimH) * d)
      .addScaledVector(across, Math.cos(aimV) * Math.sin(aimH) * d).add(new THREE.Vector3(0, Math.sin(aimV) * d, 0));
    target.y -= covered * d * tanV;                              // in the middle of what the panel leaves
    target.addScaledVector(across, right * d * tanH);
    fly(from, target);
  }

  /** Nothing out on the water any more: the camera back to where it was. */
  function release() {
    hoorn.stop();                                                // a sound signal does not go on once its card is gone
    for (const close of cards) close(false);
    if (!shown) return;
    if (shown.own) eigen?.show(null);
    if (shown.flags) eigen?.flags?.(null);
    holder.clear(); shown = null;
    dark = false; holdDark(null);                                 // the day or night held here (Lichten holds day too) let go
    restoreLens();
    if (helmHeld) { helmHeld = false; lookFromHelm(null); }
    if (cameFrom) fly(cameFrom.position, cameFrom.target);
    cameFrom = null;
  }

  // ---------------------------------------------------------------- one tab: search, chips, card, grid
  function pane(root, { placeholder, items, chips, card }) {
    const search = el('input', { type: 'search', className: 'zoek-veld', autocomplete: 'off', placeholder });
    search.setAttribute('aria-label', placeholder.replace('…', ''));
    // CWO: only what the CWO asks about (item.cwo), on every page at once
    const cwo = el('button', { type: 'button', className: 'chip zoek-cwo', textContent: 'CWO', title: 'Alleen wat bij CWO hoort' });
    cwo.setAttribute('aria-pressed', String(cwoOnly));
    cwo.addEventListener('click', () => { cwoOnly = !cwoOnly; for (const f of cwoPanes) f(); });
    const list = el('div', { className: 'zoek-lijst' });
    const kaart = el('div', { className: 'zoek-kaart', hidden: true });
    const empty = el('p', { className: 'hint', hidden: true, textContent: 'Niets gevonden.' });
    root.append(el('div', { className: 'zoek-zoekrij' }, search, cwo), ...chips.rows, el('div', { className: 'zoek-scroll' }, kaart, list, empty));
    const scroller = kaart.parentElement;

    let current = null;
    const closeCard = (andRelease = true) => {
      const back = kaart.contains(ui.activeElement) ? current?.button : null;   // the × had the focus: back to the item
      kaart.hidden = true; current?.button.removeAttribute('aria-current'); current = null;
      $('parts').classList.remove('gekozen');
      back?.focus({ preventScroll: true });
      if (andRelease) release();
    };
    cards.push((andRelease) => { if (current) closeCard(andRelease); });
    const open = (item) => {
      dark = false; holdDark(null);                               // each card starts as the viewer is; one with a light offers the night
      current?.button.removeAttribute('aria-current');
      current = item; item.button.setAttribute('aria-current', 'true');
      const close = el('button', { type: 'button', className: 'zoek-kaart-sluit', title: 'Sluiten', textContent: '×', onclick: () => closeCard() });
      close.setAttribute('aria-label', 'Sluiten');
      const parts = card(item).filter(Boolean);
      // what CWO does not ask about says so, on every page alike (Borden and Vlaggen say it in their own words)
      if (item.cwo === false && !parts.some((p) => /niet voor CWO/i.test(p.textContent ?? ''))) parts.push(el('p', { className: 'niet-cwo', textContent: 'Niet voor CWO.' }));
      kaart.replaceChildren(...parts, close);
      kaart.hidden = false; scroller.scrollTop = 0;
      $('parts').classList.add('gekozen');                       // on a phone: only the card, the water seen over it
      close.focus({ preventScroll: true });                      // the grid may be hidden now: the focus goes to the card
      item.place();
    };

    const sections = new Map();                                  // heading -> { section, grid }
    for (const item of items) {
      if (item.cwo === false && !/niet voor CWO/.test(item.button.title)) item.button.title += ' (niet voor CWO)';
      if (!sections.has(item.heading)) {
        const grid = el('div', { className: 'zoek-grid' });
        const section = el('section', {}, ...(item.heading ? [el('h3', { textContent: item.heading })] : []), grid);
        list.append(section); sections.set(item.heading, { section, grid });
      }
      item.button.addEventListener('click', () => open(item));
      sections.get(item.heading).grid.append(item.button);
    }
    const filter = () => {
      const query = fold(search.value.trim());
      let found = 0;
      for (const item of items) {
        const hit = (!cwoOnly || item.cwo) && chips.match(item) && (!query || item.key.includes(query));
        item.button.hidden = !hit; if (hit) found++;
      }
      for (const { section, grid } of sections.values()) section.hidden = ![...grid.children].some((b) => !b.hidden);
      empty.hidden = found > 0;
    };
    search.addEventListener('input', filter);
    chips.onChange(filter);
    cwoPanes.push(() => { cwo.setAttribute('aria-pressed', String(cwoOnly)); filter(); });
    filter();
    // for the field over everything on the start page: what this tab has, and how to open one of them here
    const cat = root.id.replace('zoek-', '');
    sources.push({ cat, search, items: () => items.map((item) => ({ key: item.key, cwo: item.cwo, naam: item.button.title.replace(/ \(niet voor CWO\)$/, ''),
      src: () => item.button.querySelector('img')?.src, open: () => { goto(cat); open(item); } })) });
    resets.push(() => { search.value = ''; chips.reset(); closeCard(false); filter(); scroller.scrollTop = 0; });
  }

  // the CWO chip of every page: one choice for all of them, kept when the panel closes
  let cwoOnly = false; const cwoPanes = [];

  /** A row of toggle chips; `many`: more than one can be on at once. */
  function chipRow(options, { many = false, label }) {
    const row = el('div', { className: 'zoek-chips' });
    row.setAttribute('role', 'group'); row.setAttribute('aria-label', label);
    const on = new Set();
    let changed = () => {};
    const buttons = options.map(([key, text, dot]) => {
      const b = el('button', { type: 'button', className: 'chip' });
      if (dot) b.append(el('span', { className: 'dot', style: `background: ${dot}` }));
      b.append(text); b.dataset.key = key; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (on.has(key)) on.delete(key); else { if (!many) on.clear(); on.add(key); }
        for (const x of buttons) x.setAttribute('aria-pressed', String(on.has(x.dataset.key)));
        changed();
      });
      return b;
    });
    row.append(...buttons);
    const clear = () => { on.clear(); for (const x of buttons) x.setAttribute('aria-pressed', 'false'); };
    return { row, on, clear, onChange: (fn) => { changed = fn; } };
  }

  // ---------------------------------------------------------------- Borden
  {
    const kleur = chipRow(BORD_KLEUREN.map((k) => [k.key, k.label, k.dot]), { label: 'Kleur' });
    // the kinds of the colour that is on, when it has more than one
    const soortRow = el('div', { className: 'zoek-chips sub', hidden: true });
    let soort = null; let changed = () => {};
    const showKinds = () => {
      const k = BORD_KLEUREN.find((x) => kleur.on.has(x.key));
      soort = null;
      const kinds = k?.groepen.filter(([name]) => name) ?? [];
      soortRow.hidden = kinds.length < 2;
      soortRow.replaceChildren(...kinds.map(([name]) => {
        const b = el('button', { type: 'button', className: 'chip', textContent: name }); b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          soort = soort === name ? null : name;
          for (const x of soortRow.children) x.setAttribute('aria-pressed', String(x.textContent === soort));
          changed();
        });
        return b;
      }));
    };
    kleur.onChange(() => { showKinds(); changed(); });
    const items = BORD_KLEUREN.flatMap((k) => k.groepen.flatMap(([groep, codes]) => codes.map((code) => {
      const { svg } = BORDEN[code];
      const naam = NAMEN.get(code) ?? EXTRA_BY.get(code)?.naam ?? code;
      const uitleg = BORD_UITLEG?.[code] ?? EXTRA_BY.get(code) ?? {};
      const cwo = !NIET_CWO.has(code);
      const button = el('button', { type: 'button', className: `zoek-item${cwo ? '' : ' niet-cwo'}`, title: `${code} ${naam}${cwo ? '' : ' (niet voor CWO)'}` },
        el('img', { src: asImage(svg), alt: '', loading: 'lazy', decoding: 'async' }), el('span', { textContent: code }));
      // what hangs on a bridge is shown on one, straight ahead; everything else on its post beside the boat
      const place = (opts) => (OP_BRUG.has(code)
        ? show(`bord:${code}`, () => makeSein({ id: code, bouw: 'vast', borden: code }), { ...opts, ahead: true })
        : code === 'E.4a' || code === 'E.4b' ? show(`bord:${code}`, () => makeVeerpont(code), { ...opts, ahead: true, wide: true })   // on both kades, the pont between
        : show(`bord:${code}`, () => makeSign(code), opts));
      entries.push({ soort: 'bord', id: code, naam, tekst: uitleg.betekenis ?? naam, doen: uitleg.betekenis, groep: `${k.key}:${groep}`,
        cwo: !NIET_CWO.has(code), ahead: OP_BRUG.has(code) || code === 'E.4a' || code === 'E.4b', src: () => asImage(svg), place });
      return { code, naam, uitleg, svg, cwo, kleur: k.key, groep, button, heading: groep ? `${k.label}: ${groep.toLowerCase()}` : k.label,
        key: fold([code, naam, uitleg.betekenis ?? '', uitleg.lelievlet ?? ''].join(' ')), place };
    })));
    pane($('zoek-borden'), {
      placeholder: 'Zoek bord of code…', items,
      chips: { rows: [kleur.row, soortRow], onChange: (fn) => { changed = fn; }, reset: () => { kleur.clear(); showKinds(); },
        match: (item) => (!kleur.on.size || kleur.on.has(item.kleur)) && (!soort || item.groep === soort) },
      card: (item) => [
        el('div', { className: 'zoek-kaart-kop' }, el('img', { src: asImage(item.svg), alt: '' }),
          el('div', {}, el('span', { className: 'code', textContent: item.code }), el('h3', { textContent: item.naam }))),
        ...[item.uitleg.betekenis, item.uitleg.lelievlet].filter(Boolean).map((text) => el('p', { textContent: text })),
        ...(item.cwo ? [] : [el('p', { className: 'niet-cwo', textContent: 'Niet voor CWO: dit bord komt niet in Oefenen.' })]),
      ],
    });
  }

  // ---------------------------------------------------------------- Markeringen
  {
    const vorm = chipRow(VORMEN, { label: 'Vorm' });
    const kleur = chipRow(MARK_KLEUREN, { many: true, label: 'Kleur' });
    let changed = () => {};
    vorm.onChange(() => changed()); kleur.onChange(() => changed());
    const pictures = new Map();                                  // id -> img, drawn the first time the tab is opened
    const items = MARKS.map((spec) => {
      const uitleg = MARK_UITLEG?.[spec.id] ?? {};
      const img = el('img', { alt: '' }); pictures.set(spec.id, img);
      const button = el('button', { type: 'button', className: 'zoek-item mark', title: spec.naam }, img, el('span', { textContent: spec.naam }));
      const place = (opts) => show(`mark:${spec.id}`, () => makeMark(spec), opts);
      const cwo = spec.cwo !== false;                          // a mark is CWO unless it says it is not
      entries.push({ soort: 'ton', id: spec.id, naam: spec.naam, tekst: uitleg.betekenis ?? spec.naam, doen: uitleg.passeren, groep: VORM[spec.vorm],
        cwo, src: () => img.src, place });
      return { spec, uitleg, button, img, cwo, vorm: VORM[spec.vorm], kleuren: kleurenVan(spec), heading: '',
        key: fold([spec.naam, uitleg.betekenis ?? '', uitleg.passeren ?? ''].join(' ')), place };
    });
    pane($('zoek-markeringen'), {
      placeholder: 'Zoek ton of baken…', items,
      chips: { rows: [vorm.row, kleur.row], onChange: (fn) => { changed = fn; }, reset: () => { vorm.clear(); kleur.clear(); },
        match: (item) => (!vorm.on.size || vorm.on.has(item.vorm)) && [...kleur.on].every((k) => item.kleuren.has(k)) },
      card: (item) => {
        const night = item.spec.licht ? el('button', { type: 'button', className: 'link-button zoek-nacht' }) : null;
        const label = () => { night.textContent = dark ? 'Bekijk overdag' : 'Bekijk ’s nachts'; };
        night?.addEventListener('click', () => { dark = !dark; holdDark(dark ? 1 : null); label(); });
        if (night) label();
        return [
          el('div', { className: 'zoek-kaart-kop' }, el('img', { src: item.img.src, alt: '' }), el('div', {}, el('h3', { textContent: item.spec.naam }))),
          ...[item.uitleg.betekenis, item.uitleg.passeren, item.uitleg.licht].filter(Boolean).map((text) => el('p', { textContent: text })),
          ...(night ? [night] : []),
        ];
      },
    });
    /** The pictures of the marks, each rendered from its own model, above the water only. */
    drawPictures = () => {
      if (!pictures.size) return;
      snapshots(items.map((item) => {
        const key = `mark:${item.spec.id}`;
        if (!built.has(key)) built.set(key, makeMark(item.spec));
        return { object: built.get(key), img: item.img };
      }), { lens: (mid, reach) => [mid.x - reach * 0.35, mid.y + reach * 0.18, mid.z + reach * 0.92] });
      pictures.clear();
    };
  }

  // ---------------------------------------------------------------- Seinen
  {
    const PLEKKEN = [['brug', 'Beweegbare brug'], ['sluis', 'Sluis'], ['vast', 'Vaste brug'], ['stuw', 'Stuw'], ['spui', 'Spuien']];
    const plekVan = (s) => ({ brug: 'brug', ophaal: 'brug', sluis: 'sluis', sluisbrug: 'sluis', sluisophaal: 'sluis', vast: 'vast', stuw: 'stuw', stuwbrug: 'stuw', spui: 'spui' })[s.bouw];
    const LICHTKLEUREN = [['rood', 'Rood', '#c8102e'], ['groen', 'Groen', '#1f7a45'], ['geel', 'Geel', '#f5b800']];
    const BORDKLEUR = { 'A.10': 'rood', 'A.1': 'rood', 'D.2': 'groen', 'D.1a': 'geel', 'D.1b': 'geel' };
    const kleurenVanSein = (s) => new Set([...(s.lampen ?? []).map(([k]) => k), ...(s.geel ? ['geel'] : []), ...(s.driehoek ? ['rood'] : []),
      ...(s.borden ? [BORDKLEUR[s.borden]] : [])]);
    const plek = chipRow(PLEKKEN, { label: 'Waar' });
    const kleur = chipRow(LICHTKLEUREN, { many: true, label: 'Kleur' });
    let changed = () => {};
    plek.onChange(() => changed()); kleur.onChange(() => changed());
    const items = SEINEN.map((sein) => {
      const svg = seinPlaatje(sein);
      const button = el('button', { type: 'button', className: 'zoek-item sein', title: `${sein.groep}: ${sein.naam}` },
        el('img', { src: asImage(svg), alt: '', loading: 'lazy', decoding: 'async' }), el('span', { textContent: sein.naam }));
      const place = (opts) => show(`sein:${sein.id}`, () => makeSein(sein), { ...opts, ahead: true });
      const cwo = sein.cwo !== false;                          // a signal is CWO unless it says it is not
      entries.push({ soort: 'sein', id: sein.id, naam: sein.naam, tekst: sein.betekenis, doen: sein.betekenis, groep: sein.groep,
        cwo, ahead: true, breed: true, src: () => asImage(svg), place });
      return { sein, svg, button, cwo, heading: sein.groep, plek: plekVan(sein), kleuren: kleurenVanSein(sein),
        key: fold([sein.groep, sein.naam, sein.code, sein.betekenis, sein.lelievlet ?? ''].join(' ')), place };
    });
    pane($('zoek-seinen'), {
      placeholder: 'Zoek sein…', items,
      chips: { rows: [plek.row, kleur.row], onChange: (fn) => { changed = fn; }, reset: () => { plek.clear(); kleur.clear(); },
        match: (item) => (!plek.on.size || plek.on.has(item.plek)) && [...kleur.on].every((k) => item.kleuren.has(k)) },
      card: (item) => {
        const night = item.sein.borden && !item.sein.licht ? null : el('button', { type: 'button', className: 'link-button zoek-nacht' });   // boards only: nothing lit
        const label = () => { night.textContent = dark ? 'Bekijk overdag' : 'Bekijk ’s nachts'; };
        night?.addEventListener('click', () => { dark = !dark; holdDark(dark ? 1 : null); label(); });
        if (night) label();
        return [
          el('img', { className: 'zoek-kaart-plaat', src: asImage(item.svg), alt: '' }),
          el('div', { className: 'zoek-kaart-kop' }, el('div', {}, el('span', { className: 'code', textContent: `${item.sein.groep} · ${item.sein.code}` }),
            el('h3', { textContent: item.sein.naam }))),
          ...[item.sein.betekenis, item.sein.lelievlet].filter(Boolean).map((text) => el('p', { textContent: text })),
          ...(night ? [night] : []),
        ];
      },
    });
  }

  // ---------------------------------------------------------------- Lichten and Dagmerken
  // The ships of BPR hoofdstuk 3 (schepen.js), on two pages. Lichten: the picture is what you see at
  // night of one coming straight at you, only the lights that shine your way, and she is found by the
  // colours of her lights. Dagmerken: by day, her dagmerken as you see them from ahead, found by their
  // shapes (only those that carry one: by day the rest look alike). Picked, she lies a good way ahead;
  // her card turns her to be seen from ahead, either side or astern - each light showing only inside
  // its own arc - and a slider goes from day to night and back on the same ship.
  {
    const ZIJDEN = [['voren', 'Van voren', 0], ['stuurboord', 'Van stuurboord', 270], ['bakboord', 'Van bakboord', 90], ['achteren', 'Van achteren', 180]];
    const LICHTKLEUREN = [['wit', 'Wit', '#ffffff'], ['rood', 'Rood', '#e0251b'], ['groen', 'Groen', '#1f9a4a'], ['geel', 'Geel', '#f5b800'], ['blauw', 'Blauw', '#2a6cf0']];
    // two kegels point to point (diabolo) are found under Kegel: a row of chips the shorter
    const VORMEN = [['bol', 'Bol'], ['kegel', 'Kegel'], ['cilinder', 'Cilinder'], ['ruit', 'Ruit'], ['bord', 'Bord'], ['vlag', 'Vlag']];
    const vormVan = (naam) => (/diabolo/i.test(naam) ? 'kegel' : /bol/i.test(naam) ? 'bol' : /kegel/i.test(naam) ? 'kegel' : /cilinder/i.test(naam) ? 'cilinder'
      : /ruit/i.test(naam) ? 'ruit' : /bord/i.test(naam) ? 'bord' : /vlag|wimpel/i.test(naam) ? 'vlag' : 'overig');
    const DOT = { wit: '#fff6dc', rood: '#ff3b2f', groen: '#3bff7a', geel: '#ffd23a', blauw: '#4a7dff' };
    const WATER = new THREE.MeshStandardMaterial({ color: 0x5f93b5, transparent: true, opacity: 0.32, roughness: 0.25, depthWrite: false });

    /**
     * A ship turned to be seen from one side, her middle on the origin: the lamps as makeShip lays them.
     * In the frame of what show() puts out ahead, +z faces the boat.
     */
    const makeView = (config) => {
      const ship = makeShip(config);
      // her middle and length from what she is made of: a sleep or a duwstel does not start at its origin
      ship.updateMatrixWorld(true);
      const box = new THREE.Box3(); const part = new THREE.Box3();
      ship.traverse((o) => { if (o.isMesh && o.geometry) { if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); box.union(part.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld)); } });
      const length = box.isEmpty() ? (ship.userData.length ?? 10) : box.max.x - box.min.x;
      const turn = new THREE.Group(); ship.position.set(box.isEmpty() ? -length / 2 : -(box.min.x + box.max.x) / 2, 0, box.isEmpty() ? 0 : -(box.min.z + box.max.z) / 2); turn.add(ship);
      const view = new THREE.Group(); view.add(turn);
      // a patch of water of her own: the water of the viewer is a disc round the boat, and she lies beyond it
      const patch = new THREE.Mesh(new THREE.CircleGeometry(length * 0.75 + 8, 48), WATER);
      patch.rotation.x = -Math.PI / 2; patch.position.y = 0.01; patch.renderOrder = 1; view.add(patch);
      view.userData = {
        // how high she goes, and half of the most she is across, turned any way: what show() fits in the view
        height: 6, length, top: box.isEmpty() ? 6 : box.max.y, beam: box.isEmpty() ? 6 : box.max.z - box.min.z, ship,
        update: (t, night, cam) => ship.userData.update?.(t, night, cam),
        // heading as seen: 0 coming at you, 90 her bakboord your way, 180 going away, 270 her stuurboord
        turn: (deg) => { turn.rotation.y = -Math.PI / 2 - THREE.MathUtils.degToRad(deg); },
      };
      view.userData.turn(0);
      return view;
    };

    /** What shows of her at night from dead ahead: [{ kleur, x, y }], x across as you see it, y up. */
    const seenAhead = (ship) => {
      ship.updateMatrixWorld(true);
      const p = new THREE.Vector3();
      return (ship.userData.lights ?? []).filter(({ arc }) => !arc || (arc[0] <= 0 && arc[1] >= 0))
        .map(({ kleur, lamp }) => { lamp.getWorldPosition(p); return { kleur, x: -p.z, y: p.y }; });
    };
    /** The night picture: her lights on the dark, where they are as you see them, each with a little glow. */
    const lightsSvg = (dots) => {
      const W = 160; const H = 120;
      const xs = dots.map((d) => d.x); const ys = dots.map((d) => d.y);
      const spanX = Math.max(3, Math.max(...xs, 0) - Math.min(...xs, 0)); const spanY = Math.max(3, Math.max(...ys, 0) - Math.min(...ys, 0));
      const k = Math.min((W - 40) / spanX, (H - 40) / spanY);
      const cx = (Math.max(...xs, 0) + Math.min(...xs, 0)) / 2; const cy = (Math.max(...ys, 0) + Math.min(...ys, 0)) / 2;
      const glow = Object.entries(DOT).map(([key, c]) => `<radialGradient id="g-${key}"><stop offset="0" stop-color="${c}"/><stop offset="0.35" stop-color="${c}" stop-opacity="0.55"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('');
      const body = dots.map((d) => { const x = W / 2 + (d.x - cx) * k; const y = H / 2 - (d.y - cy) * k;
        return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="12" fill="url(#g-${d.kleur})"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.4" fill="${DOT[d.kleur] ?? '#fff'}"/>`; }).join('');
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${glow}</defs><rect width="${W}" height="${H}" rx="10" fill="#0c1726"/>`
        + `<line x1="8" y1="${H - 16}" x2="${W - 8}" y2="${H - 16}" stroke="#1d3350" stroke-width="1"/>${body}</svg>`;
    };

    // By day: her hull a dark shape on the water, and her dagmerken where they are as you see them from
    // ahead, each drawn as what it is - a bol round, a kegel a triangle, a cilinder upright, boards and flags
    const KLEUR = { zwart: '#161616', geel: '#f2c200', rood: '#c1121c', groen: '#0f8a3c', wit: '#f6f6f2', blauw: '#1f4fd1', oranje: '#f26322', lichtblauw: '#86c8ec' };
    const shapeSvg = (vorm, kleur, x, y, h) => {
      const c = KLEUR[kleur] ?? KLEUR.zwart; const r = h / 2; const cy = y - r; const line = 'stroke="#16222e" stroke-width="0.8"';
      const tri = (up) => `<polygon points="${x - r},${up ? y : y - h} ${x + r},${up ? y : y - h} ${x},${up ? y - h : y}" fill="${c}"/>`;
      switch (vorm) {
        case 'bol': case 'boei': return `<circle cx="${x}" cy="${cy}" r="${r}" fill="${c}"/>`;
        case 'kegelOmlaag': return tri(false);
        case 'kegel': case 'kegelOmhoog': return tri(true);
        case 'cilinder': return `<rect x="${x - r * 0.8}" y="${y - h}" width="${r * 1.6}" height="${h}" fill="${c}"/>`;
        case 'sleepcilinder': return `<rect x="${x - r * 0.8}" y="${y - h}" width="${r * 1.6}" height="${h}" fill="${KLEUR.geel}" ${line}/>`
          + `<rect x="${x - r * 0.8}" y="${y - h * 0.9}" width="${r * 1.6}" height="${h * 0.12}" fill="#161616"/><rect x="${x - r * 0.8}" y="${y - h * 0.22}" width="${r * 1.6}" height="${h * 0.12}" fill="#161616"/>`;
        case 'ruit': return `<polygon points="${x},${y - h} ${x + r},${cy} ${x},${y} ${x - r},${cy}" fill="${c}"/>`;
        case 'diabolo': return `<polygon points="${x - r},${y - h} ${x + r},${y - h} ${x},${cy}" fill="${c}"/><polygon points="${x - r},${y} ${x + r},${y} ${x},${cy}" fill="${c}"/>`;
        case 'bordRoodWit': return `<rect x="${x - r}" y="${y - h}" width="${h}" height="${r}" fill="${KLEUR.rood}"/><rect x="${x - r}" y="${cy}" width="${h}" height="${r}" fill="${KLEUR.wit}" ${line}/>`;
        case 'bordBlauw': return `<rect x="${x - r}" y="${y - h}" width="${h}" height="${h}" fill="${KLEUR.lichtblauw}" stroke="#fff" stroke-width="1.2"/>`;
        case 'wimpel': return `<polygon points="${x - r},${y - h} ${x - r},${y} ${x + r * 1.4},${cy}" fill="${c}"/>`;
        case 'vlagB': return `<polygon points="${x - r},${y - h} ${x + r},${y - h} ${x + r * 0.45},${cy} ${x + r},${y} ${x - r},${y}" fill="${KLEUR.rood}"/>`;
        // the verbodsborden on board: round (3.31, 3.32), or square with the triangle of metres below it (3.33)
        case 'bordToegang': case 'bordRoken': return `<circle cx="${x}" cy="${cy}" r="${r * 0.88}" fill="${KLEUR.wit}" stroke="${KLEUR.rood}" stroke-width="${r * 0.24}"/>`
          + `<line x1="${x - r * 0.6}" y1="${cy - r * 0.6}" x2="${x + r * 0.6}" y2="${cy + r * 0.6}" stroke="${KLEUR.rood}" stroke-width="${r * 0.18}"/>`;
        case 'bordLigplaats': { const w = (h * 2) / 3; const t = y - h / 3;
          return `<rect x="${x - w / 2}" y="${y - h}" width="${w}" height="${w}" fill="${KLEUR.wit}" stroke="${KLEUR.rood}" stroke-width="${w * 0.12}"/>`
            + `<line x1="${x - w * 0.38}" y1="${y - h + w * 0.12}" x2="${x + w * 0.38}" y2="${t - w * 0.12}" stroke="${KLEUR.rood}" stroke-width="${w * 0.08}"/>`
            + `<polygon points="${x - w / 2},${t} ${x + w / 2},${t} ${x},${y}" fill="${KLEUR.wit}" ${line}/>`; }
        default: return `<rect x="${x - r}" y="${y - h}" width="${h}" height="${h * 0.75}" fill="${c}" ${line}/>`;   // a board or a flag
      }
    };
    const daySvg = (ship) => {
      ship.updateMatrixWorld(true);
      const W = 160; const H = 120; const p = new THREE.Vector3();
      const marks = (ship.userData.dagmerken ?? []).filter((d) => !d.nacht || d.vorm !== 'boei')
        .map(({ shape, vorm, kleur, h }) => { shape.getWorldPosition(p); return { vorm, kleur, x: -p.z, y: p.y, h }; });
      // her hull as seen from ahead: as wide as she is, up to her deck
      // (not the dagmerken, and not a post or a line: on a small boat they would make her hull as high as they go)
      const box = new THREE.Box3(); const part = new THREE.Box3(); const size = new THREE.Vector3(); const signs = new Set();
      for (const { shape } of ship.userData.dagmerken ?? []) shape.traverse((o) => signs.add(o));
      ship.traverse((o) => {
        if (!o.isMesh || !o.geometry || signs.has(o)) return;
        if (!o.geometry.boundingBox) o.geometry.computeBoundingBox(); part.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld);
        part.getSize(size); if (size.x < 0.3 && size.z < 0.3) return;
        if (part.max.y < 3.5) box.union(part);
      });
      const hull = box.isEmpty() ? { x0: -2, x1: 2, top: 1.5 } : { x0: -box.max.z, x1: -box.min.z, top: Math.max(0.6, Math.min(box.max.y, 3)) };
      // framed on her hull and her dagmerken, from the water up: what she is and what she carries
      const xs = [hull.x0, hull.x1, ...marks.map((m) => m.x)];
      const hi = Math.max(hull.top, ...marks.map((m) => m.y + m.h));
      const spanX = Math.max(1.5, Math.max(...xs) - Math.min(...xs) + 1.2); const spanY = Math.max(1.5, hi + 0.6);
      const k = Math.min((W - 24) / spanX, (H - 24) / spanY);
      const cx = (Math.max(...xs) + Math.min(...xs)) / 2; const cy = hi / 2;
      const X = (x) => (W / 2 + (x - cx) * k).toFixed(1); const Y = (y) => (H / 2 - (y - cy) * k).toFixed(1);
      const base = Math.min(H, Number(Y(0)));
      // a picture, not a drawing to scale: every sign made larger by the same factor, to be told apart, and the
      // signs one above the other each pushed down below the one over it where they would run into each other
      const grow = Math.max(1, 16 / (Math.min(...marks.map((m) => m.h)) * k));
      const placed = [];
      for (const m of [...marks].sort((a, b) => b.y - a.y)) {
        const size = m.h * k * grow;
        const above = placed.filter((o) => Math.abs(o.x - m.x) * k < 16).map((o) => o.foot + 3);
        placed.push({ ...m, size, foot: Math.max(Number(Y(m.y)), 4 + size, ...above.map((y) => y + size)) });
      }
      // her hull from ahead: wider at the deck than at the water, as a boat is
      const inset = (hull.x1 - hull.x0) * 0.18;
      let body = `<polygon points="${X(hull.x0)},${Y(hull.top)} ${X(hull.x1)},${Y(hull.top)} ${X(hull.x1 - inset)},${Y(0)} ${X(hull.x0 + inset)},${Y(0)}" fill="#3a4654"/>`;
      for (const m of placed) body += `<line x1="${X(m.x)}" y1="${Y(hull.top)}" x2="${X(m.x)}" y2="${m.foot.toFixed(1)}" stroke="#5b6b7a" stroke-width="1"/>`;
      for (const m of placed) body += shapeSvg(m.vorm, m.kleur, Number(X(m.x)), m.foot, m.size);
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><rect width="${W}" height="${H}" rx="10" fill="#dfeaf2"/>`
        + (base < H ? `<rect y="${base}" width="${W}" height="${H - base}" fill="#9fbfd6"/>` : '') + `${body}</svg>`;
    };

    const KORT = { 'Grote schepen': 'Groot', 'Kleine schepen': 'Klein', 'Slepen, duwen en koppelen': 'Slepen en duwen', Veerponten: 'Veerpont',
      Stilliggend: 'Stil', 'Werk en hinder': 'Werk', 'Bijzondere schepen': 'Bijzonder', 'De lelievlet': 'Lelievlet' };
    // A klein schip that the lelievlet herself can be - with her toplicht, her ankerbol - is shown as her, not
    // as a model: sailing (the sails up), at anchor (the sails down, the anchor out, the ankerbol up), moored.
    const EIGEN = { klein_zeilschip_lt7m: { bal: false, tuig: 'op', hand: true }, klein_schip_stilliggend: { bal: true, anker: true }, lelievlet_gemeerd: { bal: false } };
    // what the BPR asks of a lelievlet is what it asks of any klein schip: those are not listed twice under her
    // own name; moored she has no klein schip beside her, so that one stays, among the ships lying still
    const DUBBEL = new Set(['lelievlet_zeilen', 'lelievlet_zeilen_driekleur', 'lelievlet_roeien', 'lelievlet_zeil_en_motor', 'lelievlet_geankerd', 'lelievlet_gesleept']);
    const GROEP = { lelievlet_gemeerd: 'Stilliggend' };
    // and her picture is of the lelievlet too, as she is shown
    const BEELD = Object.fromEntries([['klein_zeilschip_lt7m', 'lelievlet_zeilen'], ['klein_schip_stilliggend', 'lelievlet_geankerd']]
      .map(([id, als]) => [id, CONFIGS.find((c) => c.id === als)]));
    const SCHEPEN = CONFIGS.filter((c) => !DUBBEL.has(c.id));
    const GROEPEN = LICHT_GROEPEN.filter((g) => SCHEPEN.some((c) => (GROEP[c.id] ?? LICHT_UITLEG?.[c.id]?.groep) === g));
    /** One page of ships: 'nacht' (Lichten) or 'dag' (Dagmerken). Returns what draws its pictures. */
    const pagina = (root, tijd) => {
      const kies = tijd === 'nacht' ? chipRow(LICHTKLEUREN, { many: true, label: 'Kleur van de lichten' })
        : chipRow(VORMEN, { many: true, label: 'Vorm van het dagmerk' });
      let changed = () => {};
      let zijde = 0;
      const items = SCHEPEN.filter((config) => tijd === 'nacht' || config.dagmerken?.length).map((config) => {
        const uitleg = LICHT_UITLEG?.[config.id] ?? {};
        const img = el('img', { alt: '' });
        const naam = uitleg.naam ?? config.naam;
        const button = el('button', { type: 'button', className: 'zoek-item licht', title: naam }, img, el('span', { textContent: naam }));
        const kenmerken = new Set(tijd === 'nacht' ? (config.lichten ?? []).map(([k]) => k) : (config.dagmerken ?? []).map(([v]) => vormVan(v)));
        const key = `schip:${config.id}`;
        const place = (opts) => {
          if (EIGEN[config.id]) { showOwn(key, EIGEN[config.id], zijde); return; }
          if (!built.has(key)) built.set(key, makeView(config));
          built.get(key).userData.turn(zijde);                       // first: how far out she goes depends on how she lies
          show(key, () => built.get(key), { ...opts, ahead: true, far: true, deg: zijde });
        };
        const g = GROEP[config.id] ?? uitleg.groep ?? GROEPEN[0];
        return { config, uitleg, naam, button, img, cwo: !!config.cwo, heading: g, groep: g, kenmerken,
          key: fold([naam, config.naam, uitleg.lichten ?? '', uitleg.dagmerk ?? '', uitleg.betekenis ?? '', uitleg.artikel ?? config.artikel ?? ''].join(' ')), place };
      });
      // the groups by a short name on their chips (the headings of the list keep the whole of it), and only
      // those this page has: by day the veerponten, which carry no dagmerk, have nothing to show
      const groep = chipRow(GROEPEN.filter((g) => items.some((i) => i.groep === g)).map((g) => [g, KORT[g] ?? g]), { label: 'Groep' });
      groep.onChange(() => changed()); kies.onChange(() => changed());
      // the pictures, drawn once: by night from where her lights are, by day from where her dagmerken are
      let drawn = false;
      const draw = () => {
        if (drawn) return; drawn = true;
        for (const item of items) {
          const beeld = BEELD[item.config.id] ?? item.config;
          try { item.img.src = asImage(tijd === 'nacht' ? lightsSvg(seenAhead(makeShip(beeld))) : daySvg(makeShip(beeld))); }
          catch { item.img.src = asImage(lightsSvg([])); }
        }
      };
      pane(root, {
        placeholder: tijd === 'nacht' ? 'Zoek schip of licht…' : 'Zoek schip of dagmerk…', items,
        chips: { rows: [groep.row, kies.row], onChange: (fn) => { changed = fn; }, reset: () => { groep.clear(); kies.clear(); },
          match: (item) => (!groep.on.size || groep.on.has(item.groep)) && [...kies.on].every((k) => item.kenmerken.has(k)) },
        card: (item) => {
          // as the page is: by night, or by day; the slider goes between the two on this ship
          // by night it opens at the far end of the slider: so dark only her lights are seen
          zijde = 0; dark = tijd === 'nacht'; holdDark(dark ? 2 : 0);
          const sides = el('div', { className: 'segmented zoek-zijden' });
          sides.setAttribute('role', 'radiogroup'); sides.setAttribute('aria-label', 'Aanzicht');
          // a ship along a kade has it on her bakboord side: from there she would be seen from the land
          for (const [key, label, deg] of ZIJDEN.filter(([key]) => !(item.config.kade && key === 'bakboord'))) {
            const b = el('button', { type: 'button', textContent: label }); b.setAttribute('role', 'radio'); b.dataset.key = key;
            b.setAttribute('aria-checked', String(deg === 0));
            b.addEventListener('click', () => {
              zijde = deg;
              if (shown?.own) lookAtOwn(deg); else turnShip(deg);
              for (const x of sides.children) x.setAttribute('aria-checked', String(x === b));
            });
            sides.append(b);
          }
          const slider = el('input', { type: 'range', min: 0, max: 100, step: 1, value: dark ? 100 : 0 });
          slider.setAttribute('aria-label', 'Van dag naar nacht');
          // the first half of the slider is dusk to night, the second half on to a night where only lights are seen
          slider.addEventListener('input', () => {
            const k = Number(slider.value) / 50; dark = k > 0; holdDark(k);
            if (shown?.own) { shown.own.licht = Math.min(k, 1); eigen?.show(shown.own); }   // her own toplicht as dark as it is
          });
          const schuif = el('label', { className: 'zoek-dagnacht' }, el('span', { textContent: 'Dag' }), slider, el('span', { textContent: 'Nacht' }));
          const teksten = tijd === 'nacht' ? [item.uitleg.lichten, item.uitleg.dagmerk] : [item.uitleg.dagmerk, item.uitleg.lichten];
          return [
            el('div', { className: 'zoek-kaart-kop' }, el('img', { src: item.img.src, alt: '' }),
              el('div', {}, el('span', { className: 'code', textContent: item.uitleg.artikel ?? item.config.artikel ?? '' }), el('h3', { textContent: item.naam }))),
            ...[...teksten, item.uitleg.betekenis, item.uitleg.lelievlet].filter(Boolean).map((text) => el('p', { textContent: text })),
            sides, schuif,
          ];
        },
      });
      return draw;
    };
    drawLights = pagina($('zoek-lichten'), 'nacht');
    drawDagmerken = pagina($('zoek-dagmerken'), 'dag');
  }

  // ---------------------------------------------------------------- Geluidsseinen
  // The sound signals of BPR bijlage 6 (geluiden.js): each drawn after its time, as the BPR draws them,
  // and to be heard (hoorn.js). Found by their group, by what is heard in them (short, long, very short,
  // the bell, one at a time), and whether a lelievlet may give it herself. Nothing is put out on the water.
  {
    const GEHOORD = [['k', 'Korte stoot'], ['l', 'Lange stoot'], ['z', 'Zeer korte stoten'], ['b', 'Klok']];
    const groep = chipRow(GELUID_GROEPEN.map((g) => [g, g]), { label: 'Groep' });
    const gehoord = chipRow(GEHOORD, { label: 'Wat je hoort' });   // one at a time: together they say little
    const zelf = chipRow([['zelf', 'Mag een lelievlet zelf geven']], { label: 'Zelf geven' });
    let changed = () => {};
    groep.onChange(() => changed()); gehoord.onChange(() => changed()); zelf.onChange(() => changed());
    const items = GELUIDEN.map((g) => {
      const svg = patroonSvg(g.patroon);
      const button = el('button', { type: 'button', className: 'zoek-item geluid', title: g.naam },
        el('img', { src: asImage(svg), alt: '' }), el('span', { textContent: g.naam }));
      const tokens = new Set([...g.patroon].map((t) => ({ Z: 'z', B: 'b' })[t] ?? t));
      return { g, svg, button, cwo: !!g.cwo, heading: g.groep, groep: g.groep, tokens,
        key: fold([g.naam, g.groep, g.betekenis ?? '', g.lelievlet ?? '', g.artikel ?? ''].join(' ')), place: () => {} };
    });
    pane($('zoek-geluiden'), {
      placeholder: 'Zoek geluidssein…', items,
      chips: { rows: [groep.row, gehoord.row, zelf.row], onChange: (fn) => { changed = fn; }, reset: () => { groep.clear(); gehoord.clear(); zelf.clear(); },
        match: (item) => (!groep.on.size || groep.on.has(item.groep)) && [...gehoord.on].every((t) => item.tokens.has(t)) && (!zelf.on.size || item.g.klein) },
      card: (item) => {
        hoorn.stop();
        const speel = el('button', { type: 'button', className: 'primary zoek-speel' });
        const label = (on) => { speel.textContent = on ? '■ Stop' : '▶ Laat horen'; };
        label(false);
        speel.addEventListener('click', () => {
          if (hoorn.playing) { hoorn.stop(); return; }
          if (hoorn.play(item.g.patroon, { herhaald: item.g.herhaald, klaar: () => label(false) })) label(true);
        });
        return [
          el('div', { className: 'zoek-kaart-kop' }, el('div', {}, el('span', { className: 'code', textContent: `${item.g.groep} · ${item.g.artikel ?? ''}` }),
            el('h3', { textContent: item.g.naam }))),
          el('img', { className: 'geluid-plaat', src: asImage(item.svg), alt: '' }),
          speel,
          ...[item.g.betekenis, item.g.lelievlet].filter(Boolean).map((text) => el('p', { textContent: text })),
          ...(item.g.herhaald ? [el('p', { className: 'niet-cwo', textContent: 'Dit sein wordt herhaald; je hoort het hier twee keer.' })] : []),
          el('p', { className: 'niet-cwo', textContent: item.g.klein ? 'Een lelievlet mag dit sein zelf geven.' : 'Een klein schip, zoals een lelievlet, geeft dit sein niet zelf.' }),
        ];
      },
    });
  }

  // ---------------------------------------------------------------- Vlaggen
  // A flag by its colours first (more than one at once: all of them on it), then by its pattern - only
  // the patterns there are among the flags of those colours, so the row stays short. Asked in Oefenen
  // (under Seinen) only what CWO asks, and not the flags that say what a sign or signal already says
  // there (the red flag of A.1, the spui flag and pennant of H.3): two answers would be right.
  {
    const ALREADY = new Set(['bpr-A.1-rode-vlag', 'bpr-H.3a-spuien', 'bpr-H.3b-inlaten']);
    // what kind of flag first: a signal of the BPR, a racing signal, or the code flags themselves
    const SOORT = { bpr: 'seinen', wedstrijd: 'wedstrijd', letter: 'seinboek', cijfer: 'seinboek', vervanger: 'seinboek', onderscheiding: 'seinboek' };
    const categorie = chipRow([['seinen', 'Seinen'], ['wedstrijd', 'Wedstrijd'], ['seinboek', 'Letters en cijfers']], { label: 'Soort' });
    const kleur = chipRow(VLAG_KLEUREN, { many: true, label: 'Kleur' });
    const patroonRow = el('div', { className: 'zoek-chips sub', hidden: true });
    let patroon = null; let changed = () => {};
    const order = new Map(VLAG_GROEPEN.map((g, i) => [g, i]));
    const items = [...VLAGGEN].sort((a, b) => (order.get(a.groep) ?? 99) - (order.get(b.groep) ?? 99)).map((v) => {
      const svg = vlagSvg(v);
      const button = el('button', { type: 'button', className: `zoek-item vlag${v.cwo ? '' : ' niet-cwo'}`, title: `${v.naam}${v.cwo ? '' : ' (niet voor CWO)'}` },
        el('img', { src: asImage(svg), alt: '', loading: 'lazy', decoding: 'async' }), el('span', { textContent: v.naam }));
      const place = (opts) => show(`vlag:${v.id}`, () => makeVlag(v), opts);
      if (v.cwo && !ALREADY.has(v.id)) {
        entries.push({ soort: 'sein', id: v.id, naam: v.naam, tekst: v.betekenis, doen: v.betekenis, groep: 'Vlaggen en borden aan boord', cwo: true, src: () => asImage(svg), place });
      }
      // what a lelievlet may fly herself is shown on her; the quiz keeps it on a staff beside her, to be seen from the helm
      const zelf = aanBoord(v);
      return { v, svg, button, cwo: !!v.cwo, heading: v.groep, soort: SOORT[v.soort] ?? 'seinen', kleuren: new Set(v.kleuren), patroon: v.patroon,
        key: fold([v.naam, v.groep, v.betekenis, v.spelwoord ?? '', v.id].join(' ')), place: zelf ? () => showFlags(`vlag:${v.id}`, v) : place };
    });
    const showPatterns = () => {
      patroon = null;
      const there = new Set(items.filter((i) => (!categorie.on.size || categorie.on.has(i.soort)) && [...kleur.on].every((k) => i.kleuren.has(k))).map((i) => i.patroon));
      const list = kleur.on.size ? PATRONEN.filter(([key]) => there.has(key)) : [];
      patroonRow.hidden = list.length < 2;
      patroonRow.replaceChildren(...list.map(([key, label]) => {
        const b = el('button', { type: 'button', className: 'chip', textContent: label }); b.dataset.key = key; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          patroon = patroon === key ? null : key;
          for (const x of patroonRow.children) x.setAttribute('aria-pressed', String(x.dataset.key === patroon));
          changed();
        });
        return b;
      }));
    };
    kleur.onChange(() => { showPatterns(); changed(); });
    categorie.onChange(() => { showPatterns(); changed(); });
    pane($('zoek-vlaggen'), {
      placeholder: 'Zoek vlag, letter of sein…', items,
      chips: { rows: [categorie.row, kleur.row, patroonRow], onChange: (fn) => { changed = fn; }, reset: () => { categorie.clear(); kleur.clear(); showPatterns(); },
        match: (item) => (!categorie.on.size || categorie.on.has(item.soort)) && [...kleur.on].every((k) => item.kleuren.has(k)) && (!patroon || item.patroon === patroon) },
      card: (item) => [
        el('div', { className: 'zoek-kaart-kop' }, el('img', { src: asImage(item.svg), alt: '' }),
          el('div', {}, el('span', { className: 'code', textContent: item.v.groep }), el('h3', { textContent: item.v.naam }))),
        ...[item.v.betekenis, item.v.lelievlet].filter(Boolean).map((text) => el('p', { textContent: text })),
        ...(item.v.cwo ? [] : [el('p', { className: 'niet-cwo', textContent: 'Niet voor CWO: deze vlag komt niet in Oefenen.' })]),
      ],
    });
  }

  // ---------------------------------------------------------------- the start page, and going between pages
  // Zoeken opens on a field over everything and a tile per kind; a tile opens that kind's own page (with
  // its own search and chips, ‹ back to the start). Typing in the field, the tiles give way to the results
  // of every kind, a few each, and a link to see them all on their own page.
  const CATS = { onderdelen: 'Onderdelen', borden: 'Borden', markeringen: 'Markeringen', seinen: 'Seinen', vlaggen: 'Vlaggen', lichten: 'Lichten', dagmerken: 'Dagmerken', geluiden: 'Geluidsseinen' };
  const HITS = 6;                                                // results per kind on the start page
  let page = 'home';
  function goto(cat) {
    if (cat === page) return;
    release();
    page = cat;
    $('zoek-home').hidden = cat !== 'home';
    for (const c of Object.keys(CATS)) $(`zoek-${c}`).hidden = c !== cat;
    $('zoek-titel').textContent = CATS[cat] ?? 'Zoeken';
    $('zoek-terug').hidden = cat === 'home';
    if (cat === 'markeringen') drawPictures();
    if (cat === 'lichten') drawLights();
    if (cat === 'dagmerken') drawDagmerken();
  }
  // back on the start page the focus goes to the tile it came from (not to the field: on a phone that brings up the keyboard)
  let fromTile = null;
  $('zoek-terug').addEventListener('click', () => { goto('home'); fromTile?.focus({ preventScroll: true }); });
  // the tile that had the focus is gone with the start page: the focus goes on to ‹ (not to a search field, which
  // on a phone would bring up the keyboard)
  for (const tile of ui.querySelectorAll('.zoek-tegel')) tile.addEventListener('click', () => { fromTile = tile; goto(tile.dataset.cat); $('zoek-terug').focus({ preventScroll: true }); });

  const field = $('zoek-alles'); const results = $('zoek-resultaten'); const tiles = $('zoek-tegels');
  const findAll = () => {
    const query = fold(field.value.trim());
    tiles.hidden = Boolean(query); results.hidden = !query;
    if (!query) { results.replaceChildren(); return; }
    drawPictures(); drawLights(); drawDagmerken();               // their pictures, the first time they are needed
    const groups = [];
    for (const source of sources) {
      const hits = source.items().filter((h) => h.key.includes(query) && (!cwoOnly || h.cwo !== false));
      if (!hits.length) continue;
      const section = el('section', {}, el('h3', { textContent: `${CATS[source.cat]} · ${hits.length}` }));
      for (const h of hits.slice(0, HITS)) {
        const src = h.src?.();
        const pic = src ? el('img', { src, alt: '' }) : null;
        if (pic && source.cat === 'geluiden') pic.className = 'geluid';   // a sound signal's pattern: long and low
        const b = el('button', { type: 'button', className: 'zoek-hit' }, ...(pic ? [pic] : []), el('span', { textContent: h.naam }));
        b.addEventListener('click', () => h.open());
        section.append(b);
      }
      if (hits.length > HITS) {
        const more = el('button', { type: 'button', className: 'link-button zoek-meer', textContent: `Alle ${hits.length} in ${CATS[source.cat]} ›` });
        more.addEventListener('click', () => {
          goto(source.cat); source.search.value = field.value; source.search.dispatchEvent(new Event('input'));
          source.search.focus({ preventScroll: true });
        });
        section.append(more);
      }
      groups.push(section);
    }
    results.replaceChildren(...(groups.length ? groups : [el('p', { className: 'hint', textContent: 'Niets gevonden.' })]));
    results.scrollTop = 0;
  };
  field.addEventListener('input', findAll);
  cwoPanes.push(findAll);                                        // the CWO chip of a page counts for what is found here too

  return {
    update(dt) {
      if (!shown?.object) return;
      t += dt;
      shown.object.userData.update?.(t, darkK, camera);
      // a flag flies the way the wind arrow points (downwind, at the boat), told in the flag's own frame
      const arrow = windArrow();
      if (shown.object.userData.wind && arrow) {
        downwind.set(1, 0, 0).applyQuaternion(arrow.getWorldQuaternion(quat)).applyQuaternion(shown.object.getWorldQuaternion(quat2).invert()).setY(0);
        if (downwind.lengthSq() > 1e-6) shown.object.userData.wind(downwind.normalize());
      }
    },
    release,
    /** What is out on the water now, for a report: { wat, id }. */
    info: () => shown && { wat: shown.key.split(':')[0], id: shown.key.slice(shown.key.indexOf(':') + 1) },
    /**
     * Every sign, mark and signal: { soort, id, naam, tekst, doen, groep, cwo, src(), place({ helm }) }, the pictures of
     * the marks drawn first. `doen`: what it means you must do; `cwo`: whether CWO asks about it (the quiz keeps to those).
     */
    entries() { drawPictures(); return entries; },
    /** The panel closed: nothing picked, no search, no chips on, and back to the start page to open on. */
    reset() { release(); for (const r of resets) r(); field.value = ''; findAll(); goto('home'); },
    /** To a page: 'home' or a kind ('onderdelen', 'borden', ...). */
    goto,
    /** The viewer taken down: no sound signal goes on after it. */
    destroy() { hoorn.close(); },
    /**
     * The parts of the boat for the field over everything (main.js has their list): [{ key, naam, open }],
     * `search` the field of their own page.
     */
    parts(list, search) { sources.unshift({ cat: 'onderdelen', search, items: () => list.map((p) => ({ ...p, open: () => { goto('onderdelen'); p.open(); } })) }); },
    /** A tab was opened: the pictures of the marks are drawn the first time theirs is. */
  };
}
