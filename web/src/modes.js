import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { initFlag, initLeechFlag } from './flag.js';
import { Procedure } from './procedure.js';
import { RopeLine, RopeStretch, roundTheFront, carry, layChain, makeBorgpen, makeCourseArrow, makeDol, makeKettinkje, makeKnevel, makeMik, makeRivet, makeBolts, makeStootwil, makeWater, makeWindArrow, makeWindVane,
         makeZwaardbout, pivotRotate, rotatedPoint, setOpacity, makeIsland, initSpinnaker, makeTugStern, makeWake } from './rig.js';
import { naamVan, unpack } from './config.js';

// Modes (Zeilen / Roeien / Wrikken) and the sail trim for a course to the wind.
// The boat stays where it is; the wind arrow moves round it. A course is signed: positive means
// wind over starboard (sails to port), negative wind over port. Angles "to port" are positive.

const UP = new THREE.Vector3(0, 1, 0);
const deg = THREE.MathUtils.degToRad;
const clamp = THREE.MathUtils.clamp;
const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);

// course to the wind (degrees off the bow) -> sheeting angle (degrees off the centreline)
const BOOM = [[45, 12], [90, 40], [135, 65], [180, 85]];
const FOK = [[45, 14], [90, 35], [135, 55], [180, 68]];
const FOK_TE_LOEVERT = -75;                       // set to windward, opposite the grootzeil
const FENDER_SECONDS = 2.4;                        // a stootwil over the rail, or back in
const FOK_CAD = 20.7;                             // how the fok is sheeted in the CAD model
// how far the fok bows out, as a fraction of its reach (luff -> clew): flat close-hauled, full off the wind
const FOK_BEND = [[45, 0.06], [90, 0.10], [135, 0.13], [180, 0.15]];
// fullness of the grootzeil relative to its designed belly
const MAIN_BEND = [[45, 0.8], [90, 1.0], [180, 1.15]];

const BOTTOM = -2.2;                               // m: the bottom the anker lies on, 2.5 m under the waterline
const LANDS = 0.9;                                // from here on the way down (0..1) the anker tips over onto its flukes
const SNAP_AT = 4;                                // m of way made over the anker before the ankerlijn parts
const WATER_EDGE = 2.8 - 14 - 1;                  // x where what is left astern is outside the water disc (rig.js makeWater)
const CLOSE_HAULED = 45; const RUN = 180;                             // courses
// Voor de wind begins at DOWNWIND; on the way from there to RUN, the end of the slider, the fok goes
// over to windward: voor de wind is always sailed with the fok te loevert.
const DOWNWIND = 158;
// The slider is mirrored: dead centre is kop in de wind (course 0), HEAD_GAP to either side of it aan
// de wind begins, to the right with the wind over starboard, to the left over port.
const HEAD_GAP = 30;
const SLIDER_MAX = RUN - CLOSE_HAULED + HEAD_GAP;
const HEAD_TO_WIND = 'Kop in de wind';
const MARKERS = [
  { course: CLOSE_HAULED, label: 'Aan de wind' },
  { course: 90, label: 'Halve wind' },
  { course: 135, label: 'Ruime wind' },
  { course: RUN, label: 'Voor de wind', sub: 'Fok te loevert' },
];

// -- roeicommando's (Katwijkse Zeeverkenners, CWO roei-instructieboek H2). What an oar does for a
// commando is a pose (or a stroke) that the oar eases into.
//   power: +1 halen, -1 strijken, 0 still; down: how far the blade end points down; yaw: swung aft
//   along the hull; roll: 1 blade upright, 0 flat (only while not rowing); inboard: handle to the dol;
//   stand: 1 = standing on the vlonder (riemen op); given: 0 = out of the dol and stowed (geroeid)
// `beide` marks the commando's that are given to the whole boat at once: they are never called for
// one boord alone, so the popover offers them once, above the two boorden.
const ROEICOMMANDOS = {
  slag: { beide: true, power: 1, down: 13, yaw: 0, roll: 0, inboard: 0.8, stand: 0, given: 1, drive: 1, say: 'haalt op… gelijk, op… slag' },
  haal: { power: 1, down: 13, yaw: 0, roll: 0, inboard: 0.8, stand: 0, given: 1, drive: 1, say: 'haalt op… gelijk', strokes: true },
  opriemen: { power: 0, down: 3, yaw: 0, roll: 0, inboard: 0.8, stand: 0, given: 1, drive: 0, say: '' },
  strijk: { power: -1, down: 13, yaw: 0, roll: 0, inboard: 0.8, stand: 0, given: 1, drive: -1, say: 'strijkt… gelijk' },
  stopaf: { power: 0, down: 24, yaw: 0, roll: 1, inboard: 0.8, stand: 0, given: 1, drive: -0.5, say: 'stopt… af', atOnce: true },
  lopen: { power: 0, down: 7, yaw: 78, roll: 0, inboard: 0.8, stand: 0, given: 1, drive: 0, say: 'riemen… lopen', atOnce: true },
  over: { beide: true, power: 0, down: 0, yaw: 0, roll: 0, inboard: 1.72, stand: 0, given: 1, drive: 0, say: 'riemen… over' },
  op: { beide: true, power: 0, down: -88, yaw: 0, roll: 1, inboard: 0.06, stand: 1, given: 1, drive: 0, say: 'riemen… op' },
  geroeid: { beide: true, power: 0, down: 3, yaw: 0, roll: 0, inboard: 0.8, stand: 0, given: 0, drive: 0, say: 'riemen… geroeid' },
};

function interp(table, x) {
  if (x <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (x <= table[i][0]) {
      const [x0, y0] = table[i - 1]; const [x1, y1] = table[i];
      return y0 + (y1 - y0) * (x - x0) / (x1 - x0);
    }
  }
  return table[table.length - 1][1];
}
const smoothstep = (t) => t * t * (3 - 2 * t);

/** Cloth exported flat with a bend weight per vertex (_BOLLING); depth sets how far it bows out. */
class Bend {
  constructor(meshes, normal) {
    const geometries = [...new Set(meshes.map((m) => m.geometry))].filter((g) => g.attributes._bolling);
    this.items = geometries.map((geometry) => ({
      geometry, rest: Float32Array.from(geometry.attributes.position.array), weights: geometry.attributes._bolling.array,
    }));
    this.normal = normal; this.depth = NaN; this.phi = 0; this.slack = 0;
    this.shift = new THREE.Vector3(); this.shifted = new THREE.Vector3(NaN, 0, 0);   // sideways set of the foot; see update()
    this.foot = 0; this.luff = 1;                                   // where the foot is and how high the cloth stands above it
    this.warp = null; this.warpKey = 0; this.warped = 0;            // warp(p): last say over a vertex, for a sail coming down
    this.reef = null;       // { foot, axisY, radius, side, luff, layer }: set for a sail that is reefed by rolling
    this.flutter = 0; this.time = 0;   // head to wind the cloth catches nothing and shakes: metres per unit of weight, and when
  }

  /** How far the giek has to be turned (radians) before cloth starts to go round it: the foot first
   *  travels from the top of the giek to its side, where the sail then leaves the roll. */
  static get LEAD() { return Math.PI / 2; }

  /** Length of cloth on the roll after turning the giek by phi; the roll grows a layer per turn. */
  wound(phi) {
    const t = Math.max(phi - Bend.LEAD, 0); const g = this.reef.layer / (2 * Math.PI);
    return this.reef.radius * t + (g * t * t) / 2;
  }

  /** How far the rest of the sail, and with it the gaffel, comes down for that. */
  drop(phi) {
    const { foot, axisY, radius } = this.reef; const h0 = foot - axisY;
    const lead = Math.min(phi, Bend.LEAD); const k = smoothstep(lead / Bend.LEAD);
    return h0 - THREE.MathUtils.lerp(h0, radius, k) * Math.cos(lead) + this.wound(phi);
  }

  /** depth: belly; phi: how far the giek is rolled (radians); slack: 0..1, the val eased a little */
  set(depth, phi = 0, slack = 0) {
    if (Math.abs(depth - this.depth) < 2e-4 && Math.abs(phi - this.phi) < 1e-4 && Math.abs(slack - this.slack) < 1e-3
        && this.shift.distanceToSquared(this.shifted) < 1e-9 && this.warpKey === this.warped && this.flutter < 1e-4 && !this.fluttered) return;
    this.fluttered = this.flutter >= 1e-4;                          // one more pass after it dies down, to lay the cloth still
    const shake = this.flutter; const t = this.time;
    this.warped = this.warpKey;
    const P = [0, 0, 0];
    this.depth = depth; this.phi = phi; this.slack = slack; this.shifted.copy(this.shift);
    const sx = this.shift.x; const sz = this.shift.z;
    const n = this.normal;
    const reef = this.reef && (phi > 0 || slack > 0) ? this.reef : null;
    let W = 0; let lead = 0; let k = 0; let r = 0; let g = 0; let rOut = 0;
    if (reef) {
      W = this.wound(phi); lead = Math.min(phi, Bend.LEAD); k = smoothstep(lead / Bend.LEAD);
      g = reef.layer / (2 * Math.PI);
      rOut = reef.radius + g * Math.max(phi - Bend.LEAD, 0);                 // the outermost layer
      r = THREE.MathUtils.lerp(reef.foot - reef.axisY, rOut, k);
    }
    this.rollRadius = reef && phi > Bend.LEAD * 0.6 ? rOut : 0;       // what the roll round the giek has grown to
    for (const { geometry, rest, weights } of this.items) {
      const a = geometry.attributes.position.array;
      for (let i = 0, j = 0; i < weights.length; i++, j += 3) {
        let w = weights[i] * depth; let y = rest[j + 1]; let z = rest[j + 2];
        // waves running aft from the luff, held where the cloth is held (the weight is 0 there), two of
        // them out of step so that it never repeats neatly
        if (shake) w += weights[i] * shake * (Math.sin(6.9 * t + 5.2 * rest[j]) + 0.5 * Math.sin(11.3 * t + 9.1 * rest[j] + 2.4 * y));
        if (reef) {
          const s = Math.max(y - reef.foot, 0);                             // cloth between this point and the foot
          if (s >= W) {                                                     // still flying: down, and beside the giek
            const free = s - W;
            y = reef.axisY + r * Math.cos(lead) + free - 0.06 * slack * smoothstep(Math.min(free / 0.6, 1));
            // beside the giek, measured from the giek and not from where the CAD has the cloth (its foot
            // wanders some 7 mm off the centre line); higher up it goes back to its own place
            z += (reef.axisZ + reef.side * r * Math.sin(lead) - z) * k * (1 - Math.min(free / reef.luff, 1));
            w *= THREE.MathUtils.lerp(1, Math.min(free / 0.5, 1), k);        // no belly where it comes off the roll
          } else {                                                          // on the roll: the cloth mesh is far too
            y = reef.axisY; z = reef.axisZ + reef.side * rOut; w = 0;       // coarse to wind into a spiral, so it is
          }                                                                 // gathered where it meets the roll, and
                                                                            // the roll itself is a body of its own
        }
        // 1 at the foot, 0 at the head; with a rif in, the foot is where the cloth leaves the roll
        const low = 1 - Math.min(Math.max((rest[j + 1] - this.foot - W) / (this.luff - W), 0), 1);
        P[0] = rest[j] + low * sx + w * n.x; P[1] = y + w * n.y; P[2] = z + low * sz + w * n.z;
        if (this.warp) this.warp(P);
        a[j] = P[0]; a[j + 1] = P[1]; a[j + 2] = P[2];
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();
      geometry.computeBoundingSphere();
    }
  }
}

export function initModes({ parts, tuig, scene, ui, wrap, config, signal, onResize, engaged, realTarget, note = () => {} }) {
  const byId = new Map(parts.map((p) => [p.extras.id, p]));
  // the model as a whole, under the scene: what rolls when the boat rolls
  let boat = scene.getObjectByName('lelievlet');
  while (boat.parent && boat.parent !== scene) boat = boat.parent;
  const $ = (id) => ui.getElementById(id);
  const all = (selector) => [...ui.querySelectorAll(selector)];
  /** A step of a procedure under the name this group uses for it. */
  const stap = (label) => naamVan(config, 'stappen', label, label);
  // The roeicommando's this instance uses: `namen.commandos` may rename the button and, with
  // { knop, roep }, the words the roerganger calls. The table itself is shared and never written to.
  const COMMANDS = Object.fromEntries(Object.entries(ROEICOMMANDOS).map(([key, base]) => {
    const over = config?.namen?.commandos?.[key];
    const roep = typeof over === 'string' ? undefined : over?.roep;
    return [key, roep === undefined ? base : { ...base, say: roep }];
  }));
  const knopVan = (key) => {
    const over = config?.namen?.commandos?.[key];
    return typeof over === 'string' ? over : over?.knop ?? null;
  };
  const meshesOf = (ids) => ids.flatMap((id) => byId.get(id)?.meshes ?? []);

  // -- what moves with what
  // The gaffel and the sail swing about the mast, but the giek turns on the lummelbout, which
  // stands 52 mm aft of the mast in the lips of the mastband and stays put.
  const GIEK = ['giek', 'wervel', 'lummelbeslag', 'marllijn_giek', 'schootring', 'borglijntje_lummelbout'];
  const MAIN = ['grootzeil', 'zeillatten', 'gaffel', 'klauw', 'marllijn_gaffel',
    'gaffeldraad', 'rijglijn', 'beslag_gaffel', 'strop_gaffel', 'harpje_strop', 'hanepootloper', 'dodemanseind'];
  const JIB = ['fok', 'leuvers'];
  // lopend want goes away with the sails - but not the lines that have nothing to do with them
  const MOORING = ['ankerlijn', 'achterlandvast', 'voorlandvast'];
  const running = parts.filter((p) => p.extras.groep === 'lopend_want' && !MOORING.includes(p.extras.id)).map((p) => p.extras.id);
  // the named edges and corners of a sail (grootzeil_voorlijk, fok_schoothoek, ...) belong to it
  const ofSail = (sail) => parts.map((p) => p.extras.id).filter((id) => id.startsWith(`${sail}_`));
  MAIN.push(...ofSail('grootzeil')); JIB.push(...ofSail('fok'));
  // The gaffeldraad is laid anew in the gaffel's own (CAD) frame and carried along with it: taut in
  // a triangle up to the hanepootloper while the piekenval carries the gaffel, a slack bight beside
  // the gaffel once that lies on the made-up sail. The wire keeps its length.
  const peakSpan = (() => {
    const part = byId.get('gaffeldraad'); const old = part.meshes[0];
    const pos = old.geometry.attributes.position; const p = new THREE.Vector3();
    const a = new THREE.Vector3(Infinity, 0, 0); const b = new THREE.Vector3(-Infinity, 0, 0);
    let zLo = Infinity; let zHi = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i);
      if (p.x < a.x) a.copy(p);
      if (p.x > b.x) b.copy(p);
      zLo = Math.min(zLo, p.z); zHi = Math.max(zHi, p.z);
    }
    const chord = new THREE.Vector3().subVectors(b, a); const c = chord.length(); chord.normalize();
    const apex = new THREE.Vector3(); let far = -1;                  // where the hanepootloper rides
    for (let i = 0; i < pos.count; i++) {
      p.fromBufferAttribute(pos, i);
      const off = p.clone().sub(a); off.addScaledVector(chord, -off.dot(chord));
      if (off.lengthSq() > far) { far = off.lengthSq(); apex.copy(p); }
    }
    const ta = clamp(apex.clone().sub(a).dot(chord) / c, 0.1, 0.9);
    const length = a.distanceTo(apex) + apex.distanceTo(b);
    const sag = Math.sqrt(Math.max((3 * c * (length - c)) / 8, 0));   // of a shallow bight as long as the wire
    const N = 24; const ia = Math.round(ta * N);
    const rope = new RopeLine(N + 1, clamp((zHi - zLo) / 2, 0.0015, 0.004), old.material);
    const home = part.node.parent;
    old.visible = false; old.geometry.dispose(); part.node.removeFromParent();
    part.node = new THREE.Group(); part.node.name = 'gaffeldraad'; home.add(part.node);
    rope.mesh.userData.part = part.node; part.node.add(rope.mesh); part.meshes = [rope.mesh];
    const path = Array.from({ length: N + 1 }, () => new THREE.Vector3());
    const dir = new THREE.Vector3(); const hang = new THREE.Vector3(); const moved = new THREE.Vector3();
    /** slack 0..1; toRest: the rotation that takes a direction of the world into the gaffel's rest frame */
    const lay = (slack, toRest) => {
      dir.set(0, -0.45, -0.9).applyQuaternion(toRest);               // off to bakboord and down, over the side of the bundle
      dir.addScaledVector(chord, -dir.dot(chord)).normalize();
      for (let i = 0; i <= N; i++) {
        const t = i <= ia ? (ta * i) / ia : ta + ((1 - ta) * (i - ia)) / (N - ia);
        if (i <= ia) path[i].lerpVectors(a, apex, i / ia); else path[i].lerpVectors(apex, b, (i - ia) / (N - ia));
        hang.lerpVectors(a, b, t).addScaledVector(dir, 4 * sag * t * (1 - t));
        path[i].lerp(hang, slack);
      }
      rope.set(path);
      return moved.subVectors(path[ia], apex);                       // how far the hanepootloper has come with it
    };
    return { lay };
  })();
  const mainMeshes = meshesOf(MAIN); const jibMeshes = meshesOf(JIB);
  // fades out when the sails are down - with what shackles the fok on, which goes ashore with it
  const sailRig = meshesOf([...new Set([...MAIN, ...GIEK, 'lummelbout', ...JIB, ...running, 'kettinkje_fok', 'harpjes_fok', 'harpje_fokkenval'])]);

  const mastPivot = V(tuig.mast.punt);
  const boomPivot = V(tuig.lummelbout); const boomEnd = V(tuig.giek_nok);
  const stayTack = V(tuig.voorstag.hals);
  const stayAxis = V(tuig.voorstag.top).sub(stayTack).normalize();

  // -- the belly of a sail is always to leeward, so it is applied here and not baked into the model
  const mainBend = new Bend(meshesOf(['grootzeil', 'zeillatten', ...ofSail('grootzeil')]), V(byId.get('grootzeil').extras.zeil.bolling.normaal));
  const jibInfo = byId.get('fok').extras.zeil.bolling;
  const jibBend = new Bend(meshesOf(['fok', ...ofSail('fok')]), V(jibInfo.normaal));

  // -- reven: the sail is reefed by rolling it round the giek (rolrif). What is done, in order:
  // ease the vallen a little, slide the schootring aft to the nok to clear the sail, pull the giek
  // aft against the spring in the lummelbeslag so it comes free to turn, turn it, let it spring
  // back, shift the grootschoot to the port hoop of the schootring (the sail now leaves the roll
  // beside the giek, so the ring has to stand turned), slide the ring forward again and set up
  // the vallen. Each step is one value run to its goal; a new order simply replans from wherever
  // the values are.
  const reefInfo = tuig.reven;
  const boomAxis = boomEnd.clone().sub(boomPivot).normalize();      // the giek at rest, from the lummel aft
  mainBend.foot = reefInfo.onderlijk_m; mainBend.luff = 2.65;
  const ROLL_R = Math.max(reefInfo.straal_m, 0.030);                // giek, its marllijn and the first layer of cloth
  mainBend.reef = { foot: reefInfo.onderlijk_m, axisY: boomPivot.y, axisZ: boomPivot.z, radius: ROLL_R, side: -1, luff: 2.6, layer: 0.0012 };
  // the cloth on the giek: a roll as long as the foot of the sail, growing with every turn
  const reefRoll = (() => {
    let aft = Infinity; let fore = -Infinity;
    for (const { rest } of mainBend.items) {
      for (let j = 0; j < rest.length; j += 3) {
        if (rest[j + 1] < reefInfo.onderlijk_m + 0.03) { aft = Math.min(aft, rest[j]); fore = Math.max(fore, rest[j]); }
      }
    }
    const geometry = new THREE.CylinderGeometry(1, 1, fore - aft, 28, 1, false);
    geometry.rotateZ(Math.PI / 2); geometry.translate((fore + aft) / 2, boomPivot.y, boomPivot.z);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xd8d3c3, roughness: 0.92 }));
    mesh.visible = false;
    return mesh;
  })();
  let reef = { head: 0, slack: 0, slide: 0, pull: 0, turns: 0, hoop: 0 };
  let reefing = null;                                               // the Procedure that is taking it to another number of turns
  let shown = null;                                                 // the procedure the progress bar is about
  let measuring = false;                                            // posed for a look ahead (measureAt): nothing may stick
  const planReef = (turns) => {
    if (Math.abs(reef.turns - turns) < 1e-6 && reef.head + reef.slack + reef.slide + reef.pull < 1e-6) return;
    // Where to look from, in model space. The boat is near enough symmetric that either side will do:
    // the viewer takes the one nearer to the camera, and for the lummelbeslag the one the fok is not on.
    const RING_VIEW = { positie: [1.49, 1.547, 2.733], doel: [1.592, 0.964, -0.664] };
    const LUMMEL_VIEW = { positie: [3.432, 1.5, 0.674], doel: [3.518, 1.313, 0.01], kant: 'zonder fok' };
    const HOOP_VIEW = { positie: [1.573, 1.162, 0.638], doel: [0.948, 1.134, 0.038] };
    // turning up and bearing away are looked at the way the vallen are: framed on what those do (like)
    const VALLEN = ['gaffel', 'klauw', 'piekenval', 'klauwval'];
    const upwind = state.course !== 0;                              // already head to wind: no turning up, no bearing away
    reefing = new Procedure('Reven', reef, [
      ...(upwind ? [{ key: 'head', to: 1, seconds: 1.5, label: stap('Kop in de wind'), back: stap('Afvallen'), focus: VALLEN, like: 'slack' }] : []),
      { key: 'slack', to: 1, seconds: 0.7, label: stap('Vallen vieren'), back: stap('Vallen doorzetten'), focus: VALLEN },
      { key: 'slide', to: 1, seconds: 1.1, label: stap('Schootring naar de nok'), back: stap('Schootring terug'), focus: ['schootring', 'giek'], camera: RING_VIEW },
      { key: 'pull', to: 1, seconds: 0.5, label: stap('Giek naar achteren trekken'), back: stap('Giek terug in het lummelbeslag'), focus: ['lummelbeslag', 'wervel'], camera: LUMMEL_VIEW },
      { key: 'turns', to: turns, seconds: 1.25 * Math.max(Math.abs(turns - reef.turns), 0.4), label: stap('Giek draaien'), back: stap('Giek terugdraaien'), focus: ['giek', 'rif'] },
      { key: 'pull', to: 0, seconds: 0.5, label: stap('Giek terug in het lummelbeslag'), back: stap('Giek naar achteren trekken'), focus: ['lummelbeslag', 'wervel'], camera: LUMMEL_VIEW },
      { key: 'hoop', to: turns > 0 ? 1 : 0, seconds: 0.9, label: stap('Grootschoot verhangen'), back: stap('Grootschoot terughangen'), focus: ['grootschoot', 'schootring'], camera: HOOP_VIEW },
      { key: 'slide', to: 0, seconds: 1.1, label: stap('Schootring terug'), back: stap('Schootring naar de nok'), focus: ['schootring', 'giek'], camera: RING_VIEW },
      { key: 'slack', to: 0, seconds: 0.7, label: stap('Vallen doorzetten'), back: stap('Vallen vieren'), focus: VALLEN },
      ...(upwind ? [{ key: 'head', to: 0, seconds: 1.5, label: stap('Afvallen'), back: stap('Kop in de wind'), focus: VALLEN, like: 'slack' }] : []),
    ]);
    reef = reefing.values; reefing.command(reefing.total); shown = reefing;
  };
  const rolling = meshesOf(['giek', 'marllijn_giek']);              // turn with the giek
  const pulled = meshesOf(['wervel']);                              // go aft with it, but the wervel hangs free on its pin
  const boomStill = meshesOf(['lummelbeslag', 'borglijntje_lummelbout']);
  const ringMeshes = meshesOf(['schootring']);
  const gaffelSet = mainMeshes.filter((m) => !m.geometry.attributes._bolling && !meshesOf(['rijglijn']).includes(m));
  const lacing = meshesOf(['rijglijn']);                            // bunches up along the mast as the gaffel comes down
  const LUFF = 2.65;
  const hoopCentre = V(tuig.blokken.boven); const hoopPort = V(reefInfo.hoep_bb); const hoopStarboard = V(reefInfo.hoep_sb);
  // how far the ring has to turn to bring the port hoop under the giek
  const RING_TURN = (() => {
    const v = hoopPort.clone().sub(boomPivot); v.addScaledVector(boomAxis, -v.dot(boomAxis)).normalize();
    return Math.atan2(new THREE.Vector3().crossVectors(v, new THREE.Vector3(0, -1, 0)).dot(boomAxis), -v.y);
  })();
  const qYaw = new THREE.Quaternion(); const qTurn = new THREE.Quaternion(); const axisNow = new THREE.Vector3();
  const ring = { turn: 0, slide: 0 };
  const onRing = (rest, out) => out.copy(rest).sub(boomPivot).applyAxisAngle(boomAxis, ring.turn)
    .addScaledVector(boomAxis, ring.slide).applyQuaternion(qYaw).add(boomPivot);
  // the shaft the giek slides and turns on: only seen while the giek is pulled aft
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.10, 16),
    new THREE.MeshStandardMaterial({ color: 0x8d9298, metalness: 0.75, roughness: 0.4 }));
  shaft.geometry.rotateZ(Math.PI / 2);                              // along the giek, from inside the fork into the giek:
  shaft.geometry.translate(boomPivot.x - 0.075, boomPivot.y, boomPivot.z);   // like every part, modelled where it sits in the boat
  shaft.userData.materials = [shaft.material];

  // -- ropes between the hull/mast and a moving sail
  const sheetEye = V(tuig.grootschoot.oog); const sheetTop = V(tuig.grootschoot.giek);
  // The grootschoot is reeved anew every frame through the sheaves of its two blocks, which tilt
  // with the sheet, so it stays in them whatever the giek does.
  const sheetInfo = tuig.grootschoot;
  const tackle = { becket: V(sheetInfo.hondsvot), upper: V(sheetInfo.schijf_boven),
                   lower: sheetInfo.schijven_onder.map(V), hand: V(sheetInfo.hand), r: sheetInfo.schijf_straal_m };
  const TURN = 9;                                                   // points round a sheave
  const mainSheetPart = byId.get('grootschoot');
  const sheetMaterial = mainSheetPart.meshes[0].material;
  {
    const home = mainSheetPart.node.parent;
    for (const old of mainSheetPart.meshes) { old.visible = false; old.geometry.dispose(); }
    mainSheetPart.node.removeFromParent();                          // the CAD rope is replaced outright
    mainSheetPart.node = new THREE.Group(); mainSheetPart.node.name = 'grootschoot'; home.add(mainSheetPart.node);
    mainSheetPart.meshes = [];
  }
  const sheetFall = new RopeLine(1 + 3 * TURN, sheetInfo.straal_m, sheetMaterial);   // between the blocks
  const sheetHaul = new RopeLine(36, sheetInfo.straal_m, sheetMaterial);             // to the hand and down to the vlonder
  for (const rope of [sheetFall, sheetHaul]) {
    rope.mesh.userData.part = mainSheetPart.node; mainSheetPart.node.add(rope.mesh);
    mainSheetPart.meshes.push(rope.mesh); sailRig.push(rope.mesh);
  }
  const fallPath = Array.from({ length: 1 + 3 * TURN }, () => new THREE.Vector3());
  const haulPath = [];
  const FORE = new THREE.Vector3(1, 0, 0);
  const ex = new THREE.Vector3(); const away = new THREE.Vector3(); const centre = new THREE.Vector3();
  const handNow = new THREE.Vector3();
  /** Half a turn round a sheave, written into fallPath from index `at`; `enter` = +1 comes in forward of it. */
  const turn = (at, c, outward, enter, sweep = Math.PI) => {
    for (let i = 0; i < TURN; i++) {
      const a = (sweep * i) / (TURN - 1);
      fallPath[at + i].copy(c).addScaledVector(ex, tackle.r * enter * Math.cos(a)).addScaledVector(outward, tackle.r * Math.sin(a));
    }
  };
  const hanepoot = V(tuig.hanepoot);
  const peakHalyard = new RopeStretch(meshesOf(['piekenval']),      // only its far end hangs on the gaff
    (p) => (Math.hypot(p.x - mastPivot.x, p.z - mastPivot.z) > 0.15 ? 1 : 0));
  // what rides on the gaffeldraad goes where its bight goes: the loper whole, the dodemanseind by its end
  const loperRide = new RopeStretch(meshesOf(['hanepootloper']), () => 1);
  const deadReach = (() => {
    let reach = 0;
    for (const m of meshesOf(['dodemanseind'])) {
      const pos = m.geometry.attributes.position; const p = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) reach = Math.max(reach, p.fromBufferAttribute(pos, i).distanceTo(hanepoot));
    }
    return reach || 1;
  })();
  const deadRide = new RopeStretch(meshesOf(['dodemanseind']), (p) => 1 - clamp(p.distanceTo(hanepoot) / deadReach, 0, 1));
  const qRest = new THREE.Quaternion(); const peakAt = new THREE.Vector3(); const gaffSlide = new THREE.Vector3();
  // -- fokkenschoten: schoothoek -> block on the forward leioog -> hand of the crew. They are laid
  // anew for every position of the fok, because the sheet to windward goes round the front of
  // the mast and the one to leeward runs straight. Each block hangs by the bow of its harpje on
  // the bar of the leioog and swivels there until it stands along the bisector of its two parts,
  // its schijf in their plane; the sheet runs round the schijf on the side of the eye.
  const jibClew = V(tuig.fok_schoothoek);
  const HARP_CLEAR = 0.0075;                                       // bar of the leioog to the centre line of the bow round it
  /** The bar of the forward leioog of a side at the crown of its arch: what a block hangs from. */
  const leioogBar = (key, near) => {
    const p = new THREE.Vector3(); const crown = []; let high = -Infinity;
    for (const m of meshesOf([`leiogen_${key}`])) {
      const pos = m.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i); if (Math.abs(p.x - near.x) < 0.03) { crown.push(p.clone()); high = Math.max(high, p.y); } }
    }
    const top = crown.filter((q) => q.y > high - 0.0015);
    const at = top.reduce((acc, q) => acc.add(q), new THREE.Vector3()).divideScalar(top.length);
    return at.setY(at.y - 0.004);                                   // the highest metal, a bar radius down
  };
  /**
   * A block hung in a leioog: its meshes, where the bow of its harpje and its sheave(s) are as it
   * is modelled, and the frame it stands in there (along itself, along its axle, across both).
   */
  const hangBlock = (eye, meshes, bow, sheaves, radius) => {
    const mid = sheaves.reduce((acc, q) => acc.add(q), new THREE.Vector3()).divideScalar(sheaves.length);
    const rest = mid.clone().sub(bow).normalize();
    const axle = (sheaves.length > 1 ? sheaves[1].clone().sub(sheaves[0]) : new THREE.Vector3(0, 0, Math.sign(bow.z)))
      .addScaledVector(rest, -(sheaves.length > 1 ? sheaves[1].clone().sub(sheaves[0]) : new THREE.Vector3(0, 0, Math.sign(bow.z))).dot(rest)).normalize();
    const home = new THREE.Matrix4().makeBasis(rest, axle, new THREE.Vector3().crossVectors(rest, axle)).transpose();
    return { meshes, bow, sheaves, radius, span: mid.distanceTo(bow), home, eye,
             out: new THREE.Vector3(0, 0, Math.sign(bow.z)), bis: new THREE.Vector3(0, 1, 0), normal: new THREE.Vector3(),
             turn: new THREE.Quaternion(), bowAt: new THREE.Vector3(), at: sheaves.map(() => new THREE.Vector3()) };
  };
  const jibSheets = ['bb', 'sb'].map((key) => {
    const info = tuig.fokkenschoot[key];
    const block = hangBlock(leioogBar(key, V(info.voet)), meshesOf([`blok_fokkenschoot_${key}`]), V(info.voet), [V(info.schijf)], info.schijf_straal_m);
    return { key, side: Math.sign(block.bow.z), hand: V(info.hand), block, single: block, sheave: 0, lead: null, tail: null };
  });
  const LEAD_POINTS = 44; const WRAP_POINTS = 8;                     // a lead: its run, and its turn round the schijf
  const sheetRopes = (part, sheets, material) => {
    for (const sheet of sheets) {
      sheet.lead = new RopeLine(LEAD_POINTS + WRAP_POINTS, tuig.fokkenschoot.straal_m, material);
      sheet.tail = new RopeLine(14, tuig.fokkenschoot.straal_m, material);
      for (const rope of [sheet.lead, sheet.tail]) {
        rope.mesh.userData.part = part.node; part.node.add(rope.mesh); part.meshes.push(rope.mesh);
        sailRig.push(rope.mesh);                                     // fades with the sails, like the rope it replaces
      }
    }
    // no harpje in the schoothoek: the schoot is one line, knotted into the cringle at its middle
    const knot = new THREE.Mesh(new THREE.SphereGeometry(tuig.fokkenschoot.straal_m * 2.4, 12, 8), material);
    knot.scale.set(1, 1.35, 1);
    knot.userData.part = part.node; part.node.add(knot); part.meshes.push(knot); sailRig.push(knot);
    sheets.knot = knot;
  };
  {
    const part = byId.get('fokkenschoot');
    const material = part.meshes[0].material;
    const home = part.node.parent;
    for (const old of part.meshes) { old.visible = false; old.geometry.dispose(); }
    part.node.removeFromParent();                                   // the CAD rope is replaced outright
    part.node = new THREE.Group(); part.node.name = 'fokkenschoot'; home.add(part.node);
    part.meshes = [];
    sheetRopes(part, jibSheets, material);
  }
  const mastRound = tuig.fokkenschoot.mast_straal_m + tuig.fokkenschoot.straal_m + 0.006;
  /** `n` points along `path`, evenly by length. */
  const spread = (path, n, out) => {
    const run = [0];
    for (let i = 1; i < path.length; i++) run.push(run[i - 1] + path[i].distanceTo(path[i - 1]));
    const total = run[run.length - 1] || 1e-9; let seg = 1;
    for (let i = 0; i < n; i++) {
      const at = (i / (n - 1)) * total;
      while (seg < path.length - 1 && run[seg] < at) seg++;
      out.push(new THREE.Vector3().lerpVectors(path[seg - 1], path[seg], clamp((at - run[seg - 1]) / Math.max(run[seg] - run[seg - 1], 1e-9), 0, 1)));
    }
    return out;
  };
  const wrapU = new THREE.Vector3(); const wrapW = new THREE.Vector3(); const wrapQ = new THREE.Vector3();
  /**
   * The turn of a rope round a schijf: from where it comes in tangentially off `from` to where it
   * leaves for `to`, round the side away from `bis` (the side of the eye). Points on the circle
   * of `radius` about `centre` in the plane square to `normal`.
   */
  const wrapSheave = (from, to, centre, radius, normal, bis, out) => {
    wrapU.copy(bis).addScaledVector(normal, -bis.dot(normal)).normalize();   // away from the eye, in the plane
    wrapW.crossVectors(normal, wrapU);
    const tangent = (p) => {                                        // the tangent point nearest the far side (angle pi)
      wrapQ.copy(p).sub(centre);
      const qu = wrapQ.dot(wrapU); const qw = wrapQ.dot(wrapW);
      const d = Math.max(Math.hypot(qu, qw), radius * 1.001); const base = Math.atan2(qw, qu); const half = Math.acos(radius / d);
      const far = (x) => Math.abs(Math.atan2(Math.sin(x - Math.PI), Math.cos(x - Math.PI)));
      return far(base + half) < far(base - half) ? base + half : base - half;
    };
    let a0 = tangent(from); let a1 = tangent(to);
    const norm = (x) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    a0 = norm(a0); a1 = norm(a1);
    if (a0 > Math.PI && a1 < Math.PI) a1 += 2 * Math.PI;            // go on through pi, whichever way round that is
    else if (a0 < Math.PI && a1 > Math.PI) { /* increasing already passes pi */ }
    else if (a1 < a0) a1 += 2 * Math.PI;
    out.length = 0;
    for (let i = 0; i < WRAP_POINTS; i++) {
      const a = a0 + ((a1 - a0) * i) / (WRAP_POINTS - 1);
      out.push(new THREE.Vector3().copy(centre).addScaledVector(wrapU, radius * Math.cos(a)).addScaledVector(wrapW, radius * Math.sin(a)));
    }
    return out;
  };
  const sheaveAt = new THREE.Vector3(); const bight = []; const lead = [];
  /**
   * One sheet, from `clew`: hang its block first if `hang` (a block shared by two sheets hangs by
   * the first), then lay the rope: to windward round the front of the mast, round the schijf on
   * the side of the eye, and slack to the hand.
   */
  const laySheet = (sheet, clew, hang) => {
    const b = sheet.block;
    const across = smoothstep(clamp(-(clew.z * sheet.side) / 0.12, 0, 1));
    if (hang) {
      // it swings on the bar of the eye until it stands along the bisector of its two parts, its
      // schijf in their plane: a whole frame, not the shortest turn onto the bisector
      for (let k = 0; k < 3; k++) {
        sheaveAt.copy(b.eye).addScaledVector(b.bis, HARP_CLEAR + b.span);
        const first = across > 0 ? roundTheFront(clew, sheaveAt, mastPivot, mastRound, round)[1] : clew;
        toClew.copy(first).sub(sheaveAt).normalize(); toHand.copy(sheet.hand).sub(sheaveAt).normalize();
        blockAxle.crossVectors(toClew, toHand);
        if (blockAxle.lengthSq() < 1e-10) blockAxle.copy(b.out);     // both parts in line: as it hangs
        if (blockAxle.dot(b.out) < 0) blockAxle.negate();            // never turned over: the outboard cheek stays outboard
        b.bis.copy(toClew).add(toHand).normalize();
        blockAxle.addScaledVector(b.bis, -blockAxle.dot(b.bis)).normalize();
      }
      b.normal.copy(blockAxle);
      b.turn.setFromRotationMatrix(blockFrame.makeBasis(b.bis, blockAxle, blockCross.crossVectors(b.bis, blockAxle)).multiply(b.home));
      b.bowAt.copy(b.eye).addScaledVector(b.bis, HARP_CLEAR);
      carry(b.meshes, b.bow, b.bowAt, b.turn);
      b.sheaves.forEach((q, i) => b.at[i].copy(q).sub(b.bow).applyQuaternion(b.turn).add(b.bowAt));
    }
    const centre = b.at[sheet.sheave];
    const first = across > 0 ? roundTheFront(clew, centre, mastPivot, mastRound, round)[1] : clew;
    wrapSheave(first, sheet.hand, centre, b.radius, b.normal, b.bis, bight);
    // the run to the schijf: straight, or round the front of the mast, eased from the one to the other
    straight.length = 0; straight.push(clew, bight[0]);
    if (across > 0) {
      roundTheFront(clew, bight[0], mastPivot, mastRound, round);
      if (across < 1) { const n = round.length - 1; round.forEach((q, i) => q.lerp(tmp.lerpVectors(clew, bight[0], i / n), 1 - across)); }
    }
    lead.length = 0; spread(across > 0 ? round : straight, LEAD_POINTS, lead);
    sheet.lead.set(lead.concat(bight));
    // the tail to the hand is slack: it sags
    const tailPath = [];
    for (let i = 0; i <= 8; i++) {
      const q = new THREE.Vector3().lerpVectors(bight[WRAP_POINTS - 1], sheet.hand, i / 8);
      q.y -= 0.05 * Math.sin((Math.PI * i) / 8);
      tailPath.push(q);
    }
    sheet.tail.set(tailPath);
  };
  const clewNow = new THREE.Vector3(); const toClew = new THREE.Vector3(); const toHand = new THREE.Vector3();
  const blockAxle = new THREE.Vector3(); const blockCross = new THREE.Vector3(); const blockFrame = new THREE.Matrix4();
  const straight = []; const round = [];
  // klauwval: only its end is shackled to a strop on the klauw and swings with the gaffel; the
  // fall to the cleat runs a few centimetres aft of it and stays put.
  const throatEnd = V(tuig.klauwval.klauw);
  const throatHalyard = new RopeStretch(meshesOf(['klauwval']),
    (p) => (p.x < throatEnd.x + 0.03 && Math.abs(p.y - throatEnd.y) < 0.08 ? 1 : 0));

  // -- midzwaard: board and rod swing about the zwaardbout; at the full angle the lower edge of
  // the board is flush with the vlak
  const boardPivot = V(tuig.zwaard.bout);
  const boardAxis = new THREE.Vector3(0, 0, 1);                   // starboard: the board swings fore and aft
  const boardUp = -deg(tuig.zwaard.hoek_graden);                  // negative lifts the aft edge
  const boardMeshes = meshesOf(['zwaard']);
  const addPart = (node, id, naam, groep, host, size) => {        // geometry the CAD does not have
    byId.get(host).node.parent.add(node);
    const part = { node, meshes: [], extras: { id, naam, groep, afmetingen_mm: size } };
    node.traverse((m) => { if (m.isMesh) { m.userData.part = node; part.meshes.push(m); } });
    parts.push(part);
    return node;
  };
  /** More geometry for a part that is there already: it is picked, lit and listed as that part. */
  const joinPart = (node, id) => {
    const part = byId.get(id) ?? parts.find((p) => p.extras.id === id);
    part.node.parent.add(node);
    node.traverse((m) => { if (m.isMesh) { m.userData.part = part.node; part.meshes.push(m); } });
    return node;
  };
  /** Parts of the model that are taught as one: `ids` become geometry of `into` and leave the list. */
  const foldParts = (into, ids) => {
    for (const id of ids) {
      const part = byId.get(id);
      if (!part) continue;
      for (const m of part.meshes) { m.userData.part = byId.get(into).node; byId.get(into).meshes.push(m); }
      parts.splice(parts.indexOf(part), 1);
      byId.delete(id);
    }
  };
  const bout = makeZwaardbout();                                  // the zwaard swings on it
  bout.position.copy(boardPivot);
  addPart(bout, 'zwaardbout', 'Zwaardbout', 'zwaard', 'zwaard', [24, 24, 118]);
  // The zwaardloper is a linkage: its foot is pinned to the board, its two links are pinned at the
  // knuckle, and nothing ever moves except by turning on one of those pins. Neer -> half the board
  // swings and the loper hangs plumb over its foot pin. Half -> op the foot comes up out of the
  // kast, then the lower link turns on the foot pin to lie aft along the kast and the upper link
  // turns on the knuckle pin to hang down behind it.
  const loper = tuig.zwaardloper;
  const loperLower = meshesOf(['zwaardloper_onder']); const loperUpper = meshesOf(['zwaardloper_boven']);
  const loperFoot = V(loper.voet); const loperKnee = V(loper.knik); const pinHole = V(loper.pen);
  const boardPin = V(tuig.zwaard.penhole);                        // the hole in the board itself
  const boardAngles = tuig.zwaard.hoek_graden;
  const AFT = new THREE.Vector3(0, 0, 1);                         // starboard: the fold turns fore and aft
  // riveted: the lower link to the board at its foot, and the two links together at the knuckle -
  // both pins go right through the lower link, whose cheeks hold the other part between them
  {
    const half = Math.max(...meshesOf(['zwaardloper_onder']).map((m) => {
      m.geometry.computeBoundingBox(); return Math.max(-m.geometry.boundingBox.min.z, m.geometry.boundingBox.max.z);
    }));
    for (const at of [loperFoot, loperKnee]) {
      const rivet = joinPart(makeRivet(at, 0.0065, half), 'zwaardloper_onder');
      rivet.traverse((m) => { if (m.isMesh) loperLower.push(m); });
    }
  }
  // the top plate of the zwaardkast is bolted down along both sides; the holes are in the model on
  // the starboard side, and the port side has the same ones
  {
    const holes = [];
    for (const m of meshesOf(['zwaardkast'])) {
      const a = m.geometry.attributes.position;
      for (let i = 0; i < a.count; i++) {
        const x = a.getX(i); const y = a.getY(i); const z = a.getZ(i);
        if (y < 0.4995 || Math.abs(z - 0.035) > 0.005 || x < 2.93) continue;
        const hole = holes.find((h) => Math.abs(h.x - x) < 0.02);
        if (hole) { hole.min = Math.min(hole.min, x); hole.max = Math.max(hole.max, x); hole.zmin = Math.min(hole.zmin, z); hole.zmax = Math.max(hole.zmax, z); }
        else holes.push({ x, min: x, max: x, zmin: z, zmax: z, y });
      }
    }
    const points = holes.flatMap((h) => {
      const c = new THREE.Vector3((h.min + h.max) / 2, h.y, (h.zmin + h.zmax) / 2);
      return [c, c.clone().setZ(-c.z)];
    });
    if (points.length) addPart(makeBolts(points, 0.003), 'zwaardkastbouten', 'Bouten van de zwaardkast', 'zwaard', 'zwaardkast', [10, 4, 10]);
  }
  const UPPER_HANG = deg(172);                                    // not quite plumb: its handle leans on the kast
  const qLower = new THREE.Quaternion(); const qUpper = new THREE.Quaternion();
  const footTo = new THREE.Vector3(); const kneeTo = new THREE.Vector3();
  const boardHole = new THREE.Vector3(); const pinTo = new THREE.Vector3();
  const borgpen = addPart(makeBorgpen(), 'borgpen', 'Borgpen', 'zwaard', 'zwaardloper_onder', [13, 13, 85]);
  const kettinkje = addPart(makeKettinkje(), 'kettinkje', 'Kettinkje borgpen', 'zwaard', 'zwaardloper_onder', [17, 100, 17]);
  const chainEye = V(loper.kettingoog);
  // out, the pin hangs from its ring a chain's length below the eye: ring on top, pin plumb under it
  const pinHang = chainEye.clone().setY(chainEye.y - loper.ketting_m - borgpen.userData.ring);
  const HANG = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 1, 0));
  const pinRing = new THREE.Vector3();
  // The zwaardbout is pulled out by dragging it: clear of the kast it leaves the board on the pin
  // of its loper alone. Hanging on that one pin the board turns on it, swinging fore and aft under
  // the boat until it comes to rest plumb below. The loper itself does not move: it stays where it
  // hangs, handle above the kast. The bolt lies on the buikdenning beside the kast until a click
  // puts it back.
  const BOLT_OUT = 0.14;                                          // 118 mm of bolt, and a little over to be clear
  const SWING_QUICK = 0.9; const SWING_SLOW = 8;                  // s: the water takes the first swing out of it fast, the rest slowly
  const SWING_BEAT = 2.2;                                         // rad/s: the beat it swings at
  const bolt = { pull: 0, side: 1, fall: 0, down: false, grabZ: null, was: 0, swing: 0 };
  const boltLie = new THREE.Vector3(); const boltAt = new THREE.Vector3();
  const boltTo = new THREE.Vector3(); const boltRay = new THREE.Vector3();
  const qFell = new THREE.Quaternion(); const qSag = new THREE.Quaternion();
  const swingAt = new THREE.Vector3(); const boardMid = new THREE.Vector3();
  {
    const p = new THREE.Vector3(); let n = 0;                     // the middle of the board: what wants to be under the pin
    for (const m of boardMeshes) {
      const a = m.geometry.attributes.position;
      for (let i = 0; i < a.count; i++) { boardMid.add(p.fromBufferAttribute(a, i)); n++; }
    }
    if (n) boardMid.divideScalar(n);
  }
  {
    const probe = new THREE.Raycaster(); probe.far = 1.5;         // where the floor is beside the kast
    probe.set(new THREE.Vector3(boardPivot.x, 0.6, 0.35), new THREE.Vector3(0, -1, 0));
    const floor = meshesOf(['buikdenning', 'vlak_sb', 'vlak_bb']);
    const hit = probe.intersectObjects(floor, false)[0];
    let top = boardPivot.y - 0.35;                                // no floor to be found: a guess, low in the boat
    for (const m of meshesOf(['buikdenning'])) { m.geometry.computeBoundingBox(); top = Math.max(top, m.geometry.boundingBox.max.y); }
    boltLie.set(boardPivot.x, (hit ? hit.point.y : top) + 0.012, 0.35);   // it lies on its heads
  }
  /** Out of the kast: the board is in no one's hands any more and goes down. */
  const dropBolt = () => { bolt.pull = BOLT_OUT; bolt.down = true; bolt.swing = 0; };
  /** And back: the board comes up into the kast and the bolt goes home, in the one motion. */
  const holdBolt = () => { bolt.down = false; };
  const pullBolt = (ray) => {
    const b = ray.direction.z;                                    // the bolt lies along z
    if (1 - b * b < 1e-4) return;                                 // sighted down the bolt: no telling how far
    boltRay.copy(boardPivot).sub(ray.origin);                     // the point of the bolt's line nearest the ray
    const along = (b * boltRay.dot(ray.direction) - boltRay.z) / (1 - b * b);
    if (bolt.grabZ === null) { bolt.grabZ = along; return; }      // the first move is where it was taken hold of
    const by = along - bolt.grabZ;
    if (bolt.pull < 1e-4) bolt.side = Math.sign(by) || 1;         // it comes out the side it is pulled to
    bolt.pull = clamp(by * bolt.side, 0, BOLT_OUT);
  };

  // -- the blocks of the grootschoot hang in the sheet, so they tilt with it
  const blockTop = V(tuig.blokken.boven); const blockFoot = V(tuig.blokken.onder);
  const upperBlock = meshesOf(['blok_grootschoot_giek']);
  const lowerBlock = meshesOf(['blok_grootschoot_kuip']);
  const DOWN = new THREE.Vector3(0, -1, 0);

  // -- oars: rest pose is stowed on the doften (handle forward, blade aft). The model has one
  // pair of roeiriemen; rowing with four needs a second pair, which shares their geometry.
  const makeOar = (id, side, meshes) => {
    const handle = V(tuig.riemen[id].handvat); const blade = V(tuig.riemen[id].blad);
    const axis = blade.clone().sub(handle).normalize();
    const inboard = id === 'wrikriem' ? 1.4 : 0.8;                  // handle to the point resting on the boat
    return { id, side, meshes, axis, handle, inboard, pivot: handle.clone().addScaledVector(axis, inboard), use: 0, dol: new THREE.Vector3(),
             pose: { power: 1, down: deg(13), yaw: 0, roll: 0, inboard, stand: 0, given: 1 } };
  };
  const spare = (id) => {
    const part = byId.get(id);
    const copies = part.meshes.map((m) => {
      const copy = new THREE.Mesh(m.geometry, m.material);
      copy.userData.part = m.userData.part;
      m.parent.add(copy);
      return copy;
    });
    part.meshes.push(...copies);                                    // so it highlights and picks as the same part
    return copies;
  };
  const rowOars = {
    sb: makeOar('riem_sb', 1, byId.get('riem_sb').meshes.slice()), bb: makeOar('riem_bb', -1, byId.get('riem_bb').meshes.slice()),
    sb2: makeOar('riem_sb', 1, spare('riem_sb')), bb2: makeOar('riem_bb', -1, spare('riem_bb')),
  };
  const scullOar = makeOar('wrikriem', 0, byId.get('wrikriem').meshes);
  // Stowed, the riemen lie on the doften against the planking of their own side: slid out and turned
  // a little, so that each follows the side from end to end. The wrikriem lies inboard of the
  // starboard riem and is stowed the same way. (Where the CAD has them, they are square to the doften.)
  {
    const wall = meshesOf(['boeisel_bb', 'boeisel_sb', 'kim_bb', 'kim_sb']);
    const probe = new THREE.Raycaster();
    const stow = {};
    for (const [key, side] of [['sb', 1], ['bb', -1]]) {
      const extent = new THREE.Box3();
      for (const m of rowOars[key].meshes) extent.union(new THREE.Box3().setFromBufferAttribute(m.geometry.attributes.position));
      const outer = side > 0 ? extent.max.z : extent.min.z;
      const roomAt = (x) => {
        probe.set(new THREE.Vector3(x, (extent.min.y + extent.max.y) / 2, 0), new THREE.Vector3(0, 0, side));
        const hit = probe.intersectObjects(wall, false)[0];
        return hit ? Math.max(Math.abs(hit.point.z) - Math.abs(outer) - 0.002, 0) : 0;
      };
      const aft = extent.min.x + 0.03; const fore = extent.max.x - 0.03;
      stow[key] = { pivot: new THREE.Vector3(aft, 0, outer), out: side * roomAt(aft),
                    yaw: -side * Math.atan2(roomAt(fore) - roomAt(aft), fore - aft) };
    }
    for (const [key, oar] of Object.entries(rowOars)) oar.stow = stow[key.slice(0, 2)];
    scullOar.stow = stow.sb;
  }
  const dol = Object.fromEntries(Object.entries(tuig.dollen).map(([k, p]) => [k, V(p)]));
  // which oar sits in which dol for each way of rowing
  const ROWING = {
    naast: { sb: 'sb_achter', bb: 'bb_achter' },                    // two, side by side on one doft
    kruis: { sb: 'sb_voor', bb: 'bb_achter' },                      // two, crosswise: one oar per doft
    vier: { sb: 'sb_voor', bb: 'bb_achter', sb2: 'sb_achter', bb2: 'bb_voor' },
  };
  for (const [key, oar] of Object.entries(rowOars)) oar.dol.copy(dol[ROWING.kruis[key] ?? ROWING.vier[key]]);
  // -- dirk of kraanlijn: carries the giek when the sail is down. Under sail it hangs slack from
  // the block at the masthead to the wervel, to port of the sail, and lies against the cloth when
  // the sail bellies that way.
  addPart(reefRoll, 'rif', 'Rif (opgerold zeil)', 'zeil', 'grootzeil', [2700, 70, 70]);
  addPart(shaft, 'lummelas', 'As van het lummelbeslag (verend)', 'beslag', 'grootschootoog', [16, 16, 100]);
  sailRig.push(shaft);
  // pettenlijntje: starboard hoop of the schootring -> lower hole of the wervel. Laid anew every
  // frame, because the ring slides along the giek: with the ring aft it simply hangs slack.
  const petten = (() => {
    const part = byId.get('pettenlijntje');
    const material = part.meshes[0].material;
    const home = part.node.parent;
    for (const old of part.meshes) { old.visible = false; old.geometry.dispose(); }
    part.node.removeFromParent();
    part.node = new THREE.Group(); part.node.name = 'pettenlijntje'; home.add(part.node);
    const rope = new RopeLine(24, 0.002, material);
    const knot = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 10, 8), material);
    part.meshes = [rope.mesh, knot];
    for (const m of part.meshes) { m.userData.part = part.node; part.node.add(m); sailRig.push(m); }
    const hole = V(reefInfo.wervel_onder);
    return { rope, knot, hole, length: hole.distanceTo(hoopStarboard) * 1.015, path: [], from: new THREE.Vector3(), to: new THREE.Vector3() };
  })();

  /**
   * The lower block of the grootschoot over again, hung by its shackle at `bearing` with its axis
   * along `down` and its sheaves side by side along `axle`: its meshes with the geometry moved
   * there (so they can be carried like any CAD body), where its two sheaves are, and its radius.
   */
  const standDouble = (bearing, down, axle) => {
    if (!tuig.grootschoot?.schijven_onder) return null;
    const oog = V(tuig.grootschoot.oog); const sheaves = tuig.grootschoot.schijven_onder.map(V);
    const mid = sheaves[0].clone().add(sheaves[1]).multiplyScalar(0.5);
    const axis = mid.clone().sub(oog).normalize();
    const a2 = sheaves[1].clone().sub(sheaves[0]); a2.addScaledVector(axis, -a2.dot(axis)).normalize();
    const b1 = down.clone().normalize(); const b2 = axle.clone(); b2.addScaledVector(b1, -b2.dot(b1)).normalize();
    const M = new THREE.Matrix4().makeTranslation(bearing.x, bearing.y, bearing.z)
      .multiply(new THREE.Matrix4().makeBasis(b1, b2, new THREE.Vector3().crossVectors(b1, b2)))
      .multiply(new THREE.Matrix4().makeBasis(axis, a2, new THREE.Vector3().crossVectors(axis, a2)).transpose())
      .multiply(new THREE.Matrix4().makeTranslation(-oog.x, -oog.y, -oog.z));
    const meshes = lowerBlock.map((of) => { const g = of.geometry.clone().applyMatrix4(M); g.computeVertexNormals(); return new THREE.Mesh(g, of.material.clone()); });
    return { meshes, sheaves: sheaves.map((q) => q.clone().applyMatrix4(M)), radius: tuig.grootschoot.schijf_straal_m };
  };
  // the kraanlijn runs over the second sheave of the block of the klauwval at the hommerring, which
  // is therefore a double: the single block the CAD has there gives way to it
  const DIRK_CLEAR = 0.08;                                              // off the cloth of the sail: past gaffel and lacing
  const mainCloth = meshesOf(['grootzeil']); const dirkProbe = new THREE.Vector3();
  const dirkInfo = tuig.kraanlijn;
  const dirkDouble = (() => {
    const single = byId.get('blok_klauwval');
    const box = new THREE.Box3(); for (const m of single.meshes) box.expandByObject(m);
    for (const m of single.meshes) m.visible = false;
    return standDouble(box.getCenter(new THREE.Vector3()).setY(box.max.y), new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1));
  })();
  for (const m of dirkDouble.meshes) joinPart(m, 'blok_klauwval');        // it is that block, in the list and under the pointer
  const dirkSheave = dirkDouble.sheaves[0].clone();                      // the kraanlijn over the port sheave, the klauwval over the other
  const dirkMaterial = sheetMaterial.clone();                             // its own, so it lights up by itself when selected
  const dirk = new RopeLine(27, dirkInfo.straal_m, dirkMaterial);         // the span and the turn over the sheave
  const dirkDown = new RopeLine(3, dirkInfo.straal_m, dirkMaterial);      // the fall to the kikker
  const dirkKnot = new THREE.Mesh(new THREE.SphereGeometry(0.006, 12, 8), dirkMaterial);   // stopper knot behind the wervel
  const dirkNode = new THREE.Group(); dirkNode.add(dirk.mesh, dirkDown.mesh, dirkKnot);
  addPart(dirkNode, 'kraanlijn', 'Kraanlijn', 'lopend_want', 'grootschoot', [8, 4300, 2900]);
  sailRig.push(dirk.mesh, dirkDown.mesh, dirkKnot);
  const dirkEnd = V(dirkInfo.wervel); const dirkFall = dirkInfo.val.map(V);
  const withTheMast = dirkDouble.meshes;                                 // added to the mast's set once that exists (below)
  const bellyMax = Math.max(...mainBend.items.map((item) => item.weights.reduce((a, b) => Math.max(a, b), 0)));
  const dirkPath = []; const wervelNow = new THREE.Vector3(); const bellyDir = new THREE.Vector3();

  // -- mik: the crutch for the lowered giek, gaffel and sail. Under sail it lies on the buikdenning
  // beside the zwaardkast; with the sails down it stands in its two holders on the achterschot,
  // fork up and square to the boat, its foot on the floor.
  const mik = addPart(makeMik(), 'mik', 'Mik', 'beslag', 'grootschootoog', [212, 1210, 20]);
  const mikPose = { stowed: new THREE.Vector3(), standing: new THREE.Vector3(), up: 0,
    // lying: bar forward along the boat, hoops flat; standing: bar up, hoops athwartships
    flat: new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(0, 0, 1), new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0))),
    upright: new THREE.Quaternion().setFromAxisAngle(UP, -Math.PI / 2) };
  {
    const floor = meshesOf(['buikdenning', 'vlak_sb', 'vlak_bb', 'kim_sb', 'kim_bb']);
    const probe = new THREE.Raycaster(); probe.far = 1.5;
    const floorAt = (x, z, from) => {
      probe.set(new THREE.Vector3(x, from, z), DOWN);
      const hit = probe.intersectObjects(floor, false)[0];
      return hit ? hit.point.y : from - 0.35;
    };
    const lower = V(tuig.mik.houder_onder);
    mikPose.standing.set(lower.x, floorAt(lower.x, lower.z, lower.y), lower.z);
    const LIE = { x: 1.45, z: -0.30 };                              // port side of the kuip, foot aft
    let bed = 0;
    for (let s = 0; s <= 1.2; s += 0.1) bed = Math.max(bed, floorAt(LIE.x + s, LIE.z, 0.6));
    mikPose.stowed.set(LIE.x, bed + mik.userData.radius + 0.001, LIE.z);
  }

  // -- stootwillen: four, on short lines from the outermost leiogen of either side (the eyes are
  // not only for the fokkenschoot). Inboard, the hull narrows downwards, so a fender hung plumb
  // would go through the planking: it hangs against it instead, at the slope it has there.
  // A click puts one overboard: lifted over the rail, it hangs plumb outside against the boeisel,
  // its line over the dolboord - and back in again.
  const stootwillen = [];
  {
    const LINE = 0.07; const LINE_R = 0.003;                        // 6 mm line, a hand's breadth long inboard
    const DROP = 0.10;                                              // overboard: the top of the fender below the rail
    const inside = meshesOf(['boeisel_bb', 'boeisel_sb', 'kim_bb', 'kim_sb', 'dolboord_bb', 'dolboord_sb', 'spanten']);
    const outside = meshesOf(['boeisel_bb', 'boeisel_sb', 'kim_bb', 'kim_sb', 'dolboord_bb', 'dolboord_sb', 'berghout_bb', 'berghout_sb']);
    const probe = new THREE.Raycaster();
    const cast = (from, dir, meshes) => { probe.set(from, dir); return probe.intersectObjects(meshes, false)[0] ?? null; };
    /**
     * Where the axis of a fender of radius r lies against the inside of the hull at (x, y), on the
     * side `side` (+1 starboard): r off the planking square to it, not sideways - low down the
     * planking turns in towards the kim, and a sideways gap would let the fender into it.
     */
    const againstWall = (x, y, side, r) => {
      const hit = cast(new THREE.Vector3(x, y, 0), new THREE.Vector3(0, 0, side), inside);
      if (!hit) return null;
      const normal = hit.face.normal.clone().transformDirection(hit.object.matrixWorld);
      if (normal.z * side > 0) normal.negate();                   // towards the middle of the boat
      return hit.point.addScaledVector(normal, r + 0.004);
    };
    /** How far out the outside of the hull is at (x, y): the berghout and the flare of the boeisel. */
    const outAt = (x, y, side) => {
      const hit = cast(new THREE.Vector3(x, y, side * 2), new THREE.Vector3(0, 0, -side), outside);
      return hit ? Math.abs(hit.point.z) : 0;
    };
    /** The top of the rail by the eye: the highest point of the gunwale going outboard from it. */
    const crestBy = (tie, side) => {
      let crest = null;
      for (let z = Math.abs(tie.z); z < Math.abs(tie.z) + 0.25; z += 0.005) {
        const hit = cast(new THREE.Vector3(tie.x, 2, side * z), DOWN, outside);
        if (hit && (!crest || hit.point.y > crest.y)) crest = hit.point;
      }
      return crest ?? tie.clone().setY(tie.y + 0.08);
    };
    /** The eyes of a leiogen part, fore to aft: its vertices fall apart in clusters along x. */
    const eyesOf = (id) => {
      const a = byId.get(id).meshes[0].geometry.attributes.position;
      const xs = [];
      for (let i = 0; i < a.count; i++) xs.push(i);
      xs.sort((i, j) => a.getX(i) - a.getX(j));
      const eyes = [];
      for (const i of xs) {
        const v = new THREE.Vector3().fromBufferAttribute(a, i);
        const eye = eyes.at(-1);
        if (eye && v.x - eye.max.x < 0.05) eye.expandByPoint(v); else eyes.push(new THREE.Box3().setFromPoints([v]));
      }
      return eyes;
    };
    const fenders = new THREE.Group();
    const lineMaterial = new THREE.MeshStandardMaterial({ color: 0xe9e4d6, roughness: 0.9 });
    let size = null;
    for (const id of ['leiogen_bb', 'leiogen_sb']) {
      const eyes = eyesOf(id);
      for (const eye of [eyes[0], eyes.at(-1)]) {                   // the aftmost and the foremost
        const side = Math.sign(eye.max.z + eye.min.z);
        const fender = makeStootwil();
        const { length, radius } = fender.userData;
        size = [radius * 2000, length * 1000, radius * 2000];
        // the line leaves the bottom of the eye, on its inboard side
        const tie = new THREE.Vector3((eye.min.x + eye.max.x) / 2, eye.min.y, side > 0 ? eye.min.z : eye.max.z);
        // inboard: two points of the axis against the wall, below the top shoulder and above the bottom one
        const upper = againstWall(tie.x, tie.y - LINE - 0.04, side, radius);
        const lower = againstWall(tie.x, tie.y - LINE - length + 0.04, side, radius);
        const axis = upper && lower ? lower.clone().sub(upper).normalize() : DOWN.clone();
        const inTop = upper ? upper.clone().addScaledVector(axis, -0.04 / Math.max(-axis.y, 0.3)) : tie.clone().setY(tie.y - LINE);
        const inQ = new THREE.Quaternion().setFromUnitVectors(DOWN, axis);
        // overboard: plumb, clear of whatever stands out furthest over its length
        const crest = crestBy(tie, side);
        const outTop = new THREE.Vector3(tie.x, crest.y - DROP, 0);
        let reach = 0; let widest = outTop.y;
        for (let y = crest.y - 0.01; y >= outTop.y - length; y -= 0.01) {
          const z = outAt(tie.x, y, side);
          if (z > reach) { reach = z; widest = y; }
        }
        outTop.z = side * (reach + radius + 0.004);
        // the line: over the top of the rail, then down the outside to the fender
        const over = crest.clone().setY(crest.y + LINE_R);
        const skirt = new THREE.Vector3(tie.x, Math.min(widest, crest.y), side * (reach + LINE_R));
        const line = new RopeLine(14, LINE_R, lineMaterial);
        fenders.add(fender, line.mesh);
        stootwillen.push({ fender, line, tie, over, skirt, inTop, inQ, outTop, outQ: new THREE.Quaternion(),
                           high: crest.y + length + 0.04, clear: side * (Math.abs(tie.z) - radius - 0.01), side,
                           meshes: [...fender.children, line.mesh], at: 0, want: 0, shown: NaN });
      }
    }
    addPart(fenders, 'stootwillen', 'Stootwillen', 'interieur', 'leiogen_bb', size);
  }
  /**
   * Put a stootwil where `at` says: 0 inboard, 1 overboard. In between it goes the way a hand takes
   * it: in off the planking, clear of its eye; straight up until it hangs clear above the rail;
   * across; and down the other side.
   */
  const hangFender = (w) => {
    const top = w.fender.position;
    const LEGS = 4;
    const leg = Math.min(Math.floor(w.at * LEGS), LEGS - 1); const k = smoothstep(w.at * LEGS - leg);
    const lerp = THREE.MathUtils.lerp;
    if (leg === 0) top.set(w.inTop.x, w.inTop.y, lerp(w.inTop.z, w.clear, k));
    else if (leg === 1) top.set(w.inTop.x, lerp(w.inTop.y, w.high, k), w.clear);
    else if (leg === 2) top.set(w.inTop.x, w.high, lerp(w.clear, w.outTop.z, k));
    else top.set(w.outTop.x, lerp(w.high, w.outTop.y, k), w.outTop.z);
    // it keeps the slope of the planking while it comes off it, and hangs plumb once it is rising
    w.fender.quaternion.slerpQuaternions(w.inQ, w.outQ, leg === 0 ? 0 : leg === 1 ? k : 1);
    const outboard = Math.abs(top.z) > Math.abs(w.over.z);
    const path = [w.tie];
    if (outboard) { path.push(w.over); if (top.y < w.skirt.y) path.push(w.skirt); }
    path.push(top.clone());
    w.line.set(path);
  };
  for (const w of stootwillen) hangFender(w);

  // -- two lines of lettering on the outside of the spiegel, the second as wide as the first
  const spiegelSkin = byId.get('spiegel').meshes.find((m) => m.material.name === 'romp');
  let spiegelLetters = null; let spiegelShows = false;
  const letterSpiegel = (lines) => {
    if (spiegelLetters) {
      spiegelLetters.removeFromParent(); spiegelLetters.geometry.dispose();
      spiegelLetters.material.map.dispose(); spiegelLetters.material.dispose(); spiegelLetters = null;
    }
    if (!lines || !spiegelSkin) return;
    const probe = new THREE.Raycaster(new THREE.Vector3(-2, 0.86, -0.25), new THREE.Vector3(1, 0, 0));
    const hit = probe.intersectObject(spiegelSkin, false)[0];
    if (!hit) return;
    // light letters on a dark spiegel, dark ones on a light one
    const { r, g, b } = spiegelSkin.material.color;
    const ink = 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.3 ? '#111111' : '#f5f2ea';
    const SIZE = 160; const PAD = 24; const face = (px) => `700 ${px}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    const canvas = document.createElement('canvas'); let ctx = canvas.getContext('2d');
    ctx.font = face(SIZE); const wide = ctx.measureText(lines[0]).width;
    const second = SIZE * wide / ctx.measureText(lines[1]).width;
    canvas.width = Math.ceil(wide + 2 * PAD); canvas.height = Math.ceil(PAD * 2 + SIZE * 1.15 + second * 1.2);
    ctx = canvas.getContext('2d'); ctx.fillStyle = ink; ctx.textBaseline = 'top';
    ctx.font = face(SIZE); ctx.fillText(lines[0], PAD, PAD);
    ctx.font = face(second); ctx.fillText(lines[1], PAD, PAD + SIZE * 1.15);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const n = hit.face.normal.clone().transformDirection(spiegelSkin.matrixWorld);
    if (n.x > 0) n.negate();                                        // out of the boat, aft
    const across = new THREE.Vector3(0, 0, 1);                      // read from astern: starboard is on the right
    const up = new THREE.Vector3().crossVectors(n, across);
    const orientation = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(across, up, n));
    const width = 0.30;
    spiegelLetters = new THREE.Mesh(
      new DecalGeometry(spiegelSkin, hit.point, orientation, new THREE.Vector3(width, width * canvas.height / canvas.width, 0.06)),
      new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.5, depthWrite: false,
        polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
    spiegelLetters.renderOrder = 2;
    spiegelLetters.raycast = () => {};
    spiegelSkin.parent.add(spiegelLetters);
  };


  // -- dollen. The boat has six dolpotten but only four dollen, in the potten by the two doften;
  // the pair by the voordek stays empty. Each dol is kept by a kettinkje that runs down through
  // its pot to a knevel too long to come back up through it. A dol only stands in its pot while
  // an oar is being pulled in it; otherwise it is "uit" and hangs inboard on its chain.
  const POT_LENGTH = 0.100; const POT_RIM = 0.0135; const DOL_CHAIN = 0.205; const DOL_LIFT = 0.14;
  const dollen = ['sb_voor', 'bb_voor', 'sb_achter', 'bb_achter'].map((key) => {
    const pot = V(tuig.dolpotten[key]);
    const side = Math.sign(pot.z);                                  // +1 starboard
    const node = addPart(makeDol(), `dol_${key}`, 'Dol', 'roeien', 'riem_sb', [100, 245, 16]);
    const chain = makeKettinkje(11); const knevel = makeKnevel();     // enough links to hang in one another
    const tackle = new THREE.Group(); tackle.add(chain, knevel);
    addPart(tackle, `dolketting_${key}`, 'Kettinkje van de dol', 'roeien', 'riem_sb', [60, 205, 10]);
    return { key, pot, side, node, chain, knevel, eye: node.userData.eye.clone(), seated: 0, yaw: 0,
             hang: new THREE.Vector3(0, -(DOL_CHAIN - POT_LENGTH - 0.025), -side * (POT_RIM + 0.008)), bed: [] };
  });
  // Under a pot the kim comes in closer than the chain is long, so the end of the chain does not
  // hang free: it lands on the plating and lies down the slope. bed = the plating under each pot,
  // sampled inboard from the pot's axis, a link's thickness above the steel.
  {
    const plating = meshesOf(['kim_sb', 'kim_bb', 'vlak_sb', 'vlak_bb', 'boeisel_sb', 'boeisel_bb']);
    const probe = new THREE.Raycaster(); probe.far = 0.6;
    for (const d of dollen) {
      for (let off = 0; off <= 0.12; off += 0.01) {
        probe.set(new THREE.Vector3(d.pot.x, d.pot.y - POT_LENGTH, d.pot.z - d.side * off), DOWN);
        const hit = probe.intersectObjects(plating, false)[0];
        if (hit) d.bed.push(hit.point.clone().setY(hit.point.y + 0.006));
      }
    }
  }
  const dolQ = new THREE.Quaternion(); const dolYaw = new THREE.Quaternion(); const FORE_AXIS = new THREE.Vector3(1, 0, 0);

  // -- the voorste doft, taken out of its place and set elsewhere
  const bench = (() => {
    const meshes = meshesOf(['doft_voor']);
    const rest = new THREE.Box3(); const seat = new THREE.Box3();
    for (const m of meshes) rest.union(new THREE.Box3().setFromBufferAttribute(m.geometry.attributes.position));
    for (const m of meshesOf(['doft_achter'])) seat.union(new THREE.Box3().setFromBufferAttribute(m.geometry.attributes.position));
    return { meshes, rest, seatX: (seat.min.x + seat.max.x) / 2, row: null, want: false, t: 0, at: 0, shown: 0, raise: 0.16,
             from: new THREE.Vector3(), to: new THREE.Vector3(), pre: new THREE.Vector3(), q: new THREE.Quaternion() };
  })();
  /** The row whose two dollen alone are standing, if the doft may go in them now. */
  const benchRow = () => {
    if (state.mode === 'roeien') return null;
    const up = dollen.filter((d) => d.seated > 0.9);
    const row = (d) => d.key.split('_')[1];
    return up.length === 2 && row(up[0]) === row(up[1]) ? row(up[0]) : null;
  };
  /**
   * In the dollen of `row`: its lower edge in the bottom of the forks, its face against the far
   * legs, leaning away from the achterste doft. Which point of it (from) comes to lie where (to), turned by q.
   */
  const placeBench = (row) => {
    const pot = dollen.find((d) => d.key.endsWith(row)).pot;
    const s = Math.sign(pot.x - bench.seatX);                       // the way it leans: away from the seat
    const { seat, tip } = dollen[0].node.userData;
    const low = new THREE.Vector2(-s * 0.008, seat + 0.002);        // its lower edge, in the bottom of the fork
    const face = new THREE.Vector3(s * tip.x - low.x, tip.y - low.y, 0).normalize();   // up its face to the far leg
    const into = new THREE.Vector3(-s * face.y, s * face.x, 0);     // square to the face, into the plank
    const across = new THREE.Vector3(0, 0, 1);
    bench.q.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(into, across), into, across));
    // the edge that goes down: the plank's underside becomes the face, so it is the aft edge leaning forward
    bench.from.set(s > 0 ? bench.rest.min.x : bench.rest.max.x, bench.rest.min.y, 0);
    bench.to.set(pot.x + low.x, pot.y + low.y, 0);
    bench.raise = 0.16; bench.pre.copy(bench.to).setY(bench.to.y + bench.raise);   // let down into the forks
  };
  /**
   * Over the dolboord just aft of the wantputting, on the side away from the sails: resting on the
   * dolboord, its inboard end under the edge of the top plate of the zwaardkast.
   */
  const placePlank = (side) => {
    const box = (ids) => { const b = new THREE.Box3(); for (const m of meshesOf(ids)) b.union(new THREE.Box3().setFromBufferAttribute(m.geometry.attributes.position)); return b; };
    const chainplate = box([side > 0 ? 'wantputting_sb' : 'wantputting_bb']);
    const kast = box(['zwaardkast']);
    const { rest } = bench;
    const x = chainplate.min.x - (rest.max.x - rest.min.x) / 2 - 0.01;
    const thick = rest.max.y - rest.min.y; const half = (rest.max.z - rest.min.z) / 2;
    const probe = new THREE.Raycaster();
    let crest = null;                                               // the top of the dolboord there
    for (let z = 0.6; z < 1.0; z += 0.005) {
      probe.set(new THREE.Vector3(x, 2, side * z), DOWN);
      const hit = probe.intersectObjects(meshesOf(['dolboord_bb', 'dolboord_sb', 'boeisel_bb', 'boeisel_sb']), false)[0];
      if (hit && (!crest || hit.point.y > crest.y)) crest = hit.point;
    }
    if (!crest) return false;
    const end = kast.max.z - 0.01; const plate = kast.max.y - 0.003;  // the end, and the underside of the plate
    let slope = 0.3;                                                // underside on the crest, top face at the end against the plate
    for (let i = 0; i < 6; i++) slope = Math.atan((crest.y + thick / Math.cos(slope) - plate) / (Math.abs(crest.z) - end));
    bench.q.setFromAxisAngle(FORE_AXIS, -side * slope);
    bench.from.set((rest.min.x + rest.max.x) / 2, rest.min.y, side > 0 ? rest.min.z : rest.max.z);
    bench.to.set(x, crest.y - Math.tan(slope) * (Math.abs(crest.z) - end), side * end);
    // it comes in from outboard, sliding down along itself until the end is under the plate
    bench.raise = 0.16;
    bench.pre.copy(bench.to).add(new THREE.Vector3(0, Math.sin(slope), side * Math.cos(slope)).multiplyScalar(0.15));
    return half > 0;
  };
  /** Lifted straight up, carried over while it turns, and let down into the forks. */
  const benchPoseQ = new THREE.Quaternion(); const benchAt = new THREE.Vector3();
  const layBench = () => {
    const LEGS = 3;
    const leg = Math.min(Math.floor(bench.at * LEGS), LEGS - 1); const k = smoothstep(bench.at * LEGS - leg);
    if (leg === 0) { benchAt.copy(bench.from).setY(bench.from.y + bench.raise * k); benchPoseQ.identity(); }
    else if (leg === 1) {
      benchAt.copy(bench.from).setY(bench.from.y + bench.raise).lerp(bench.pre, k);
      benchPoseQ.identity().slerp(bench.q, k);
    } else { benchAt.lerpVectors(bench.pre, bench.to, k); benchPoseQ.copy(bench.q); }
    carry(bench.meshes, bench.from, benchAt, benchPoseQ);
  };
  const eyeAt = new THREE.Vector3(); const rim = new THREE.Vector3(); const chainPath = [];
  // -- roeicommando's (Katwijkse Zeeverkenners, CWO roei-instructieboek H2). Each boord has its own
  // commando; what an oar does for it is a pose (or a stroke) that the oar eases into.
  //   see ROEICOMMANDOS below
  const courseArrow = makeCourseArrow(); courseArrow.visible = false; scene.add(courseArrow);
  const wrikgat = V(tuig.wrikgat);
  const SCULL_PITCH = deg(50);                                      // how steeply the wrikriem points down

  // -- roer: everything that hangs on the roerkoning turns about it, and it is raked 33.7 degrees, so
  // the angle about the roerkoning is not the angle the helmstok makes with the centre line seen
  // from above. bearing[] tabulates the one against the other, to steer by where the pointer is.
  const rudderMeshes = meshesOf(['roerblad', 'roerkoning', 'roerhaken', 'roerkop', 'helmstok', 'borgoog_roer']);
  const rudderFoot = V(tuig.vlaggenstok.voet); const rudderAxis = V(tuig.vlaggenstok.richting).normalize();
  const helm = { angle: 0, target: 0, held: false, grip: new THREE.Vector3(), hinge: new THREE.Vector3(), qTurn: new THREE.Quaternion() };
  {
    let far = -Infinity;                                            // the grip: the end of the helmstok furthest from the roerkoning
    const p = new THREE.Vector3();
    for (const m of meshesOf(['helmstok'])) {
      const pos = m.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 7) { p.fromBufferAttribute(pos, i); if (p.x > far) { far = p.x; helm.grip.copy(p); } }
    }
    const along = helm.grip.clone().sub(rudderFoot).dot(rudderAxis);
    helm.hinge.copy(rudderFoot).addScaledVector(rudderAxis, along);  // the point of the roerkoning it swings round
  }
  // borgkettinkje: hook on the spiegel, eye on the rudder. It hangs slack, so when the rudder turns
  // it is simply carried along by its rudder end, less and less towards the hook.
  const borg = tuig.borgketting && byId.get('borgkettinkje') ? (() => {
    const eye = V(tuig.borgketting.oog); const hook = V(tuig.borgketting.haak); const span = eye.distanceTo(hook);
    return { eye, chain: new RopeStretch(byId.get('borgkettinkje').meshes, (p) => clamp(1 - p.distanceTo(eye) / span, 0, 1)) };
  })() : null;
  const HELM_MAX = deg(38);
  const bearing = [];                                               // [angle about the roerkoning, bearing of the grip seen from above]
  for (let a = -0.9; a <= 0.9001; a += 0.02) {
    const g = rotatedPoint(helm.grip, rudderFoot, rudderAxis, a).sub(helm.hinge);
    bearing.push([a, Math.atan2(g.z, g.x)]);
  }
  const steerTo = (point) => {                                      // point: where the pointer is, at the height of the grip
    const want = clamp(Math.atan2(point.z - helm.hinge.z, point.x - helm.hinge.x), -0.75, 0.75);
    let best = bearing[0];
    for (const row of bearing) if (Math.abs(row[1] - want) < Math.abs(best[1] - want)) best = row;
    helm.target = clamp(best[0], -HELM_MAX, HELM_MAX);
  };

  // -- mast strijken. With the sails struck: the fok comes off altogether; the made-up sail with giek
  // and gaffel goes from the fork of the mik into its lower hook; the lummelbout is drawn, so the
  // bundle is free of the mast and its forward end comes down on the mastdoft, the bout hanging on
  // its borglijntje; grendelbout out; the keeper ring slid up the pelikaanhaak and the hook taken
  // out of the hanekam; then the mast comes down aft on the mastbout into the fork of the mik, its
  // top beyond the spiegel, with everything that is on it. The wanten go slack and are laid in
  // the mik as well; the voorstag is folded along the mast.
  const mastBolt = new THREE.Vector3(3.6236, 0.7452, 0.0);          // the mastbout it turns on (top hole of the mastkoker)
  const mastHead = V(tuig.mast.top);
  const MIK_X = V(tuig.mik.houder_onder).x;
  const MAST_DOWN = Math.PI / 2 - Math.atan2(1.3338 + 0.045 - mastBolt.y, mastBolt.x - MIK_X);   // until it lies in the fork
  const STAY_FOLD = deg(22.5);                                      // the angle between voorstag and mast
  const mastSet = meshesOf(['mast', 'mastband_lummel', 'hommerring', 'masttopring', 'harpjes_mast', 'blok_piekenval',
    'blok_klauwval', 'blok_fokkenval', 'piekenval', 'klauwval', 'fokkenval', 'harpje_fokkenval']);
  mastSet.push(...withTheMast);
  const staySet = meshesOf(['voorstag', 'voorstagspanner']); const stayRing = meshesOf(['pelikaanhaak_ring']);
  const fokGear = meshesOf(['kettinkje_fok', 'harpjes_fok']);       // what leaves the boat with the fok
  const grendel = meshesOf(['grendelbout']); const lummelbout = meshesOf(['lummelbout']); const borglijn = meshesOf(['borglijntje_lummelbout']);
  const qMast = new THREE.Quaternion(); const qStay = new THREE.Quaternion(); const qBundle = new THREE.Quaternion();
  const bundleFrom = new THREE.Vector3(); const bundleTo = new THREE.Vector3(); const nokFrom = new THREE.Vector3(); const nokTo = new THREE.Vector3();
  const withMast = (p, out = new THREE.Vector3()) => out.copy(p).sub(mastBolt).applyQuaternion(qMast).add(mastBolt);
  const qMastBack = new THREE.Quaternion();
  const offMast = (p, out) => out.copy(p).sub(mastBolt).applyQuaternion(qMastBack).add(mastBolt);   // into the mast's own frame
  const withBundle = (p) => p.sub(bundleFrom).applyQuaternion(qBundle).add(bundleTo);
  const swing = (meshes) => {                                       // what is already placed goes along with the bundle
    for (const m of meshes) { m.quaternion.premultiply(qBundle); withBundle(m.position); }
  };
  const giekEye = new THREE.Vector3(3.4977, 1.351, 0.0009);         // eye on the beslagband the borglijntje is made fast to
  const boltMid = new THREE.Vector3(3.5715, 1.3117, 0.0011);
  const boltLine = new RopeLine(8, 0.0014, sheetMaterial.clone()); boltLine.mesh.visible = false;
  boat.add(boltLine.mesh);                                         // in the boat: it rolls with it
  // wanten: wire from the hommerring to the wantketting; laid live, because they go slack with the mast
  const shrouds = ['want_bb', 'want_sb'].map((id) => {
    const part = byId.get(id); const old = part.meshes[0]; const pos = old.geometry.attributes.position;
    const top = new THREE.Vector3(); const foot = new THREE.Vector3(); let hi = -Infinity; let lo = Infinity; const p = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i); if (p.y > hi) { hi = p.y; top.copy(p); } if (p.y < lo) { lo = p.y; foot.copy(p); } }
    top.y -= 0.012; foot.y += 0.012;                                // middle of the eyes, not their ends
    const rope = new RopeLine(30, 0.0022, old.material);
    rope.mesh.userData.part = part.node; part.node.parent.add(rope.mesh); rope.mesh.visible = false;
    part.meshes.push(rope.mesh);
    return { old, rope, top, foot, side: Math.sign(foot.z) };
  });

  // -- anker. Let go by hand: lifted by its shackle from where it stands against the voorschot,
  // carried forward over the voordek, swung out over the starboard bow and lowered away until it
  // is on the bottom; ketting and lijn follow it, the lijn over the rail by the stem to the
  // ankeroog. On the bottom it tips over and lies flat on its flukes, the shank towards the boat;
  // the first half of the ketting lies along the bottom after it, the rest curves up to the lijn.
  // Weighing it is the same in reverse. At rest the modelled gear is shown as it is.
  const anchorGear = (() => {
    const anchor = byId.get('anker'); const chainPart = byId.get('ankerketting'); const linePart = byId.get('ankerlijn');
    if (!anchor || !chainPart || !linePart || !tuig.anker) return null;
    const hand = V(tuig.anker.schakel); const eye = V(tuig.anker.oog);
    // where the lijn comes aboard: over the stem head, the forward tip of the voorplecht, and it hangs
    // straight down the outside of the stem from there
    const chock = new THREE.Vector3(eye.x + 0.4, 0, 0.04);
    {
      const probe = new THREE.Raycaster(); const over = meshesOf(['voorplecht', 'boegrand', 'hanekam']);
      const top = (x) => { probe.set(new THREE.Vector3(x, 2, chock.z), DOWN); return probe.intersectObjects(over, false)[0]?.point.y ?? null; };
      while (chock.x > eye.x && top(chock.x) === null) chock.x -= 0.002;
      chock.y = (top(chock.x) ?? 1.01) + 0.007; chock.x += 0.012;
    }
    const hangOff = chock.clone().add(new THREE.Vector3(0.015, -0.25, 0));   // below the stem head, outside
    // The ankeroog stands aft in the stem under the voorplecht, so from the rail the lijn crosses the
    // plecht aft to its edge, goes round that and runs forward underneath to the eye.
    const aroundPlecht = (() => {
      const plecht = meshesOf(['voorplecht']); const probe = new THREE.Raycaster();
      const topAt = (x, z) => { probe.set(new THREE.Vector3(x, eye.y + 0.5, z), DOWN); return probe.intersectObjects(plecht, false)[0]?.point.y ?? null; };
      const OFF = 0.007;                                            // the lijn's radius and a millimetre
      const Z = 0.03;                                               // where it goes round: clear of hanekam and pelikaanhaak
      const PLATE = 0.004;                                          // "PLECHT dik 4 mm"
      let edgeX = eye.x - 0.4;
      while (edgeX < eye.x && topAt(edgeX, Z) === null) edgeX += 0.002;   // the aft edge, from aft
      if (edgeX >= eye.x) return [chock.clone().setZ(0.04).setY(chock.y + 0.004), eye.clone()];
      const path = [];
      for (let i = 1; i <= 8; i++) {                                // on the plecht, from the rail to the edge
        const k = i / 8; const x = THREE.MathUtils.lerp(chock.x, edgeX + 0.012, k); const z = THREE.MathUtils.lerp(chock.z, Z, k);
        path.push(new THREE.Vector3(x, (topAt(x, z) ?? chock.y - 0.03) + OFF, z));
      }
      const top = path[path.length - 1].y - OFF; const under = top - PLATE; const c = OFF * Math.SQRT1_2;
      path.push(new THREE.Vector3(edgeX - c, top + c, Z), new THREE.Vector3(edgeX - OFF, top, Z),     // round the edge
        new THREE.Vector3(edgeX - OFF, under, Z), new THREE.Vector3(edgeX - c, under - c, Z));
      const below = new THREE.Vector3(edgeX + 0.012, under - OFF, Z);
      for (let i = 0; i <= 4; i++) path.push(new THREE.Vector3().lerpVectors(below, eye, i / 4));    // forward under it to the eye
      return path;
    })();
    // On the bottom: pipeline/anchor.py stows it with the shank plumb and the crown athwartships.
    // Turned a quarter about the crown axis the shank lies flat on the bottom, and the flukes, which
    // lean 12 degrees off it, point down and dig in; then yawed so the shank points at the boat.
    const landing = new THREE.Vector3(7.2, 0, 0.6);                 // where the shackle comes to rest, ahead of the bow
    const toBoat = new THREE.Vector3(chock.x - landing.x, 0, chock.z - landing.z).normalize();
    const yaw = new THREE.Quaternion().setFromAxisAngle(UP, Math.atan2(-toBoat.z, toBoat.x));
    const tip = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), -Math.PI / 2);
    let lowStanding = Infinity;                                     // lowest point of the anchor below its shackle
    {
      const v = new THREE.Vector3();
      for (const m of anchor.meshes) {
        const pos = m.geometry.attributes.position;
        for (let i = 0; i < pos.count; i++) lowStanding = Math.min(lowStanding, v.fromBufferAttribute(pos, i).applyMatrix4(m.matrix).y - hand.y);
      }
    }
    const shackleFlat = landing.clone().setY(BOTTOM + 0.0225);       // shank level with the crown, whose tube (r 22.5 mm) is on the bottom
    // lowered over the starboard bow, and down until it stands on the bottom by the landing
    const route = new THREE.CatmullRomCurve3([hand, new THREE.Vector3(hand.x, 1.27, hand.z), new THREE.Vector3(4.55, 1.5, 0.33),
      new THREE.Vector3(5.12, 1.5, 0.36), new THREE.Vector3(5.33, 1.47, 0.80), new THREE.Vector3(5.36, 0.55, 0.84),
      new THREE.Vector3(6.3, -1.0, 0.8), landing.clone().setY(BOTTOM - lowStanding)], false, 'centripetal');
    // the ketting is one mesh of equal links: each is posed as a rigid piece along the chain's run
    const chainMesh = chainPart.meshes[0]; const pos = chainMesh.geometry.attributes.position;
    const LINKS = 54; const per = pos.count / LINKS; const rest = Float32Array.from(pos.array);
    const links = [];
    for (let i = 0; i < LINKS; i++) {
      const centre = new THREE.Vector3(); const p = new THREE.Vector3();
      for (let k = i * per; k < (i + 1) * per; k++) centre.add(p.fromArray(rest, k * 3));
      centre.divideScalar(per);
      const axis = new THREE.Vector3(); let far = 0;
      for (let k = i * per; k < (i + 1) * per; k++) {
        const d = p.fromArray(rest, k * 3).distanceToSquared(centre);
        if (d > far) { far = d; axis.copy(p).sub(centre); }
      }
      links.push({ centre, axis: axis.normalize() });
    }
    const rope = new RopeLine(120, 0.006, linePart.meshes[0].material);        // fine enough to go round the edge of the plecht
    rope.mesh.visible = false; rope.mesh.userData.part = linePart.node; linePart.node.parent.add(rope.mesh);
    const stowedLine = linePart.meshes.slice(); linePart.meshes.push(rope.mesh);
    // six millimetres of line is no target for a finger: an unseen sleeve round it takes the click
    const grip = new RopeLine(120, 0.035, new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }), 6);
    grip.mesh.visible = false; grip.mesh.userData.part = linePart.node; linePart.node.parent.add(grip.mesh); linePart.meshes.push(grip.mesh);
    // the bottom: a plain disc of sand under the anchor and the ketting, like the disc of the water.
    // It is only there once the anchor lies on it; seen from either side, and from below the flukes
    // that dig in stick out through it.
    const sand = new THREE.Mesh(new THREE.CircleGeometry(1.3, 64),
      new THREE.MeshStandardMaterial({ color: 0xd9c59b, transparent: true, opacity: 0, roughness: 1, side: THREE.DoubleSide }));
    sand.rotation.x = -Math.PI / 2;
    sand.position.copy(landing).addScaledVector(toBoat, 0.2).setY(BOTTOM);   // between the crown and where the ketting rises
    sand.visible = false;
    scene.add(sand);
    // byHand: taken over by hand while the Tuig procedure is under way (weighed to go rowing).
    // drift: how far the gear is astern of where it was let go, in metres; lost: the lijn has parted,
    // seen: the gear that went with it is still on the water, whip: its tail swinging back plumb.
    return { u: 0, want: 0, byHand: false, shown: NaN, drift: 0, lost: false, seen: 1, whip: 0, sandHome: sand.position.clone(),
             hand, eye, route, chock, hangOff, aroundPlecht, yaw, tip, shackleFlat, toBoat, sand,
             anchor: anchor.meshes, chainMesh, rest, links, per, rope, grip, stowedLine };
  })();
  // All that is left of the ankerlijn once it has parted: a tail from the ankeroog over the stem head
  // and down the outside into the water. Let go it still points astern and then swings plumb, and it
  // shortens with `u` as it is hauled in.
  const layTail = (g) => {
    const w = smoothstep(clamp(g.whip, 0, 1)); const len = 0.9 * clamp(g.u, 0, 1);
    const bend = new THREE.Vector3(-0.5, -0.02, 0).lerp(new THREE.Vector3(0, -0.5, 0), w);
    const tip = new THREE.Vector3(-0.95, -0.14, 0).lerp(new THREE.Vector3(0, -1, 0), w);
    const a = g.hangOff; const b = a.clone().addScaledVector(bend, len); const c = a.clone().addScaledVector(tip, len);
    const path = [];
    for (let i = 10; i >= 0; i--) {                                 // the free end first: the lijn runs from there to the oog
      const k = i / 10; const m = 1 - k;
      path.push(new THREE.Vector3().addScaledVector(a, m * m).addScaledVector(b, 2 * m * k).addScaledVector(c, k * k));
    }
    path.push(g.chock, ...g.aroundPlecht);
    g.rope.set(path); g.grip.set(path);
  };
  const layAnchor = () => {
    const g = anchorGear; if (!g || Math.abs(g.u - g.shown) < 1e-4) return;
    g.shown = g.u;
    const stowedNow = g.u < 0.004;
    for (const m of g.stowedLine) m.visible = stowedNow;
    g.rope.mesh.visible = !stowedNow; g.grip.mesh.visible = !stowedNow;
    setOpacity(g.anchor, g.seen); setOpacity([g.chainMesh], g.seen);   // what went with the lijn lies there until it is off the water
    if (g.lost && g.seen < 0.02) { g.sand.visible = false; layTail(g); return; }
    // it turns slowly on its line as it sinks, and on the bottom tips over onto its flukes about its shackle
    const down = g.lost ? 1 : g.u;                                  // what parted stays on the bottom while the tail comes in
    const land = stowedNow ? 0 : smoothstep(clamp((down - LANDS) / (1 - LANDS), 0, 1));
    const sink = stowedNow ? 0 : smoothstep(clamp((down - 0.6) / (LANDS - 0.6), 0, 1));
    // the boat sails on over the anchor: she stands still here, so its gear goes astern instead
    const flat = g.drift > 0 ? g.shackleFlat.clone().setX(g.shackleFlat.x - g.drift) : g.shackleFlat;
    const at = g.route.getPoint(stowedNow ? 0 : down).lerp(flat, land);
    g.sand.position.x = g.sandHome.x - g.drift;
    g.sand.visible = land > 0; g.sand.material.opacity = land;
    const turn = new THREE.Quaternion().slerpQuaternions(IDENTITY_Q, g.yaw, sink)
      .multiply(new THREE.Quaternion().slerpQuaternions(IDENTITY_Q, g.tip, land));
    const pivot = new THREE.Vector3();
    for (const m of g.anchor) { m.quaternion.copy(turn); m.position.copy(at).sub(pivot.copy(g.hand).applyQuaternion(turn)); }
    const a = g.chainMesh.geometry.attributes.position.array;
    // both bounds, not just the sphere: a ray is tested against the box too, and the one the glTF
    // brought is the stowed chain's, so once it is out a click on it would go through
    const rebound = (geo) => { geo.computeBoundingSphere(); geo.computeBoundingBox(); };
    if (stowedNow) { a.set(g.rest); g.chainMesh.geometry.attributes.position.needsUpdate = true; rebound(g.chainMesh.geometry); return; }
    // ketting: a metre of it from the shackle towards the rail, hanging in a bight while that is nearer
    const from = new THREE.Vector3(0, 0.036, 0).applyQuaternion(turn).add(at); const LENGTH = 1.0;
    const to = g.chock.clone().sub(from); const span = to.length();
    const reach = Math.min(span * 0.8, LENGTH * 0.98);
    const end = from.clone().addScaledVector(to.normalize(), reach);
    const bight = 0.45 * Math.sqrt(Math.max(LENGTH * LENGTH - reach * reach, 0));
    const p = new THREE.Vector3(); const q = new THREE.Quaternion(); const t = new THREE.Vector3(); const prev = new THREE.Vector3();
    const hangAt = (k, out) => out.lerpVectors(from, end, k).setY(THREE.MathUtils.lerp(from.y, end.y, k) - bight * 4 * k * (1 - k));
    // on the bottom: half of it along the bottom towards the boat (dropping off the shackle first),
    // then an arc of the other half that starts level and turns up towards the rail
    const ON_BOTTOM = 0.5 * LENGTH; const bed = BOTTOM + 0.01;     // a link on edge: its centre half its width up
    // dragged astern it still leads to the rail, which is by then ahead of it instead of aft
    const lead = g.drift > 0 ? new THREE.Vector3(g.chock.x - from.x, 0, g.chock.z - from.z).normalize() : g.toBoat;
    const foot = from.clone().addScaledVector(lead, ON_BOTTOM).setY(bed);
    const rise = Math.atan2(g.chock.y - bed, Math.hypot(g.chock.x - foot.x, g.chock.z - foot.z));
    const r = (LENGTH - ON_BOTTOM) / rise;
    const lieAt = (k, out) => {
      const s = k * LENGTH;
      if (s <= ON_BOTTOM) return out.copy(from).addScaledVector(lead, s).setY(THREE.MathUtils.lerp(from.y, bed, smoothstep(clamp(s / 0.12, 0, 1))));
      const a = (s - ON_BOTTOM) / r;
      return out.copy(foot).addScaledVector(lead, r * Math.sin(a)).setY(bed + r * (1 - Math.cos(a)));
    };
    const lying = new THREE.Vector3();
    const chainAt = (k, out) => (land > 0 ? hangAt(k, out).lerp(lieAt(k, lying), land) : hangAt(k, out));
    g.links.forEach((link, i) => {
      const k = (i + 0.5) / g.links.length;
      chainAt(k, p); chainAt(Math.max(k - 0.01, 0), prev); chainAt(Math.min(k + 0.01, 1), t).sub(prev).normalize();
      q.setFromUnitVectors(link.axis, t);
      for (let n = i * g.per; n < (i + 1) * g.per; n++) {
        prev.fromArray(g.rest, n * 3).sub(link.centre).applyQuaternion(q).add(p).toArray(a, n * 3);
      }
    });
    g.chainMesh.geometry.attributes.position.needsUpdate = true;
    g.chainMesh.geometry.computeVertexNormals(); rebound(g.chainMesh.geometry);
    chainAt(1, end);
    if (g.lost) { layTail(g); return; }                            // the lijn has parted: the end of the ketting trails free
    // lijn: from the end of the ketting to the rail, slack until the anchor is over the side; then to the ankeroog
    const slack = 0.30 * (1 - smoothstep(clamp((g.u - 0.55) / 0.3, 0, 1)));
    const path = [];
    if (g.drift > 0 && end.x < g.chock.x) {                        // past the bow: bar taut from the oog, under the boat as it must
      for (let i = 0; i <= 8; i++) path.push(new THREE.Vector3().lerpVectors(end, g.eye, i / 8));
    } else {
      for (let i = 0; i <= 16; i++) {
        const k = i / 16; const s = new THREE.Vector3().lerpVectors(end, g.hangOff, k);
        s.y -= slack * 4 * k * (1 - k);
        if (s.x > 4.05 && s.x < 5.45 && Math.abs(s.z) < 0.55) s.y = Math.max(s.y, 0.705);   // it lies on the voordek, not in it
        path.push(s);
      }
      path.push(g.chock, ...g.aroundPlecht);
    }
    g.rope.set(path); g.grip.set(path);
  };

  // -- bakskist: modelled with its lid open; a click shuts or opens it
  const kist = tuig.bakskist ? { lid: meshesOf(['bakskist_deksel']), hinge: V(tuig.bakskist.scharnier), axis: V(tuig.bakskist.richting).normalize(),
    shut: deg(tuig.bakskist.open_graden), open: 0, want: 0 } : null;      // modelled open, shown shut until something asks for it
  foldParts('bakskist', ['bakskist_deksel', 'bakskist_beslag', 'bakskist_handvatten']);      // one part to name; the lid still swings

  // -- zeilen strijken. In order: head to wind, anchor out, fok down and bundled on its stay, mik
  // set, grootzeil down with giek and gaffel into the fork of the mik, sail rolled up between
  // them, three zeilbinders round the lot. Hoisting is the same list backwards. Like reven, every
  // step is one value run to its goal.
  // One timeline for the rig: sails struck is its first half, mast down the whole of it. "Zeilen op",
  // "Zeilen gestreken" and "Mast gestreken" are three moments on it.
  // Where the steps are looked at from, in model space; mirrored to the side nearer to the camera,
  // except the anker, which goes out over the starboard bow.
  const ANCHOR_VIEW = { positie: [8.02, 4.977, 8.957], doel: [5.376, 0.001, 0.945], kant: 'vast' };
  const ZWAARD_VIEW = { positie: [3.961, 3.036, 3.977], doel: [3.023, 0.144, 0] };
  const FURL_VIEW = { positie: [-1.161, 1.819, 1.578], doel: [2.812, 1.344, -0.123] };
  const TIES_VIEW = { positie: [4.413, 1.762, 2.22], doel: [2.192, 1.32, -0.001] };
  const GRENDEL_VIEW = { positie: [3.311, 1.412, 1.178], doel: [3.741, 0.209, -0.218] };
  const HOOK_VIEW = { positie: [6.089, 1.645, 0.334], doel: [5.446, 1.14, 0.014] };
  const MAST_VIEW = { positie: [8.198, 3.069, 8.201], doel: [2.464, 0.967, -0.817] };
  const rigging = new Procedure('Tuig', { head: 0, anchor: 0, zwaard: 0, jib: 0, mik: 0, main: 0, furl: 0, ties: 0,
    fokoff: 0, low: 0, pin: 0, grendel: 0, ring: 0, hook: 0, mast: 0 }, [
    { key: 'head', to: 1, seconds: 1.5, label: stap('Kop in de wind'), back: stap('Afvallen'), focus: ['mast', 'grootzeil', 'fok'] },
    { key: 'anchor', to: 1, seconds: 4, label: stap('Anker uit'), back: stap('Anker op'), focus: ['anker', 'ankerketting', 'ankerlijn'], camera: ANCHOR_VIEW },
    { key: 'zwaard', to: 1, seconds: 1.5, label: stap('Midzwaard op'), back: stap('Midzwaard neer'), focus: ['zwaard', 'zwaardloper_boven', 'zwaardloper_onder'], camera: ZWAARD_VIEW },
    { key: 'jib', to: 1, seconds: 2, label: stap('Fok strijken'), back: stap('Fok hijsen'), focus: ['fok', 'fokkenval', 'voorstag'] },
    { key: 'mik', to: 1, seconds: 1.5, label: stap('Mik zetten'), back: stap('Mik wegnemen'), focus: ['mik', 'giek'] },
    { key: 'main', to: 1, seconds: 2.5, label: stap('Grootzeil strijken'), back: stap('Grootzeil hijsen'), focus: ['grootzeil', 'gaffel', 'giek'] },
    { key: 'furl', to: 1, seconds: 1.5, label: stap('Zeil opdoeken'), back: stap('Zeil losmaken'), focus: ['gaffel', 'giek'], camera: FURL_VIEW },
    { key: 'ties', to: 1, seconds: 1.2, label: stap('Zeilbinders om'), back: stap('Zeilbinders af'), focus: ['gaffel', 'giek'], camera: TIES_VIEW },
    { key: 'fokoff', to: 1, seconds: 2, label: stap('Fok afslaan'), back: stap('Fok aanslaan'), focus: ['fok', 'voorstag'] },
    { key: 'low', to: 1, seconds: 2, label: stap('Tuig in de onderste haak van de mik'), back: stap('Tuig terug in de vork van de mik'), focus: ['mik', 'giek'] },
    { key: 'pin', to: 1, seconds: 1.8, label: stap('Lummelbout uit'), back: stap('Lummelbout in'), focus: ['lummelbout', 'lummelbeslag'] },
    { key: 'grendel', to: 1, seconds: 1.5, label: stap('Grendelbout uit'), back: stap('Grendelbout in'), focus: ['grendelbout', 'mastkoker'], camera: GRENDEL_VIEW },
    { key: 'ring', to: 1, seconds: 1.2, label: stap('Ring van de pelikaanhaak omhoog'), back: stap('Ring van de pelikaanhaak omlaag'), focus: ['pelikaanhaak_ring', 'hanekam'], camera: HOOK_VIEW },
    { key: 'hook', to: 1, seconds: 1.8, label: stap('Pelikaanhaak uit de hanekam'), back: stap('Pelikaanhaak in de hanekam'), focus: ['pelikaanhaak_ring', 'hanekam'], camera: HOOK_VIEW },
    { key: 'mast', to: 1, seconds: 5, label: stap('Mast strijken'), back: stap('Mast zetten'), focus: ['mast'], camera: MAST_VIEW },
  ]);
  const strike = rigging.values;
  const RIG_AT = { op: 0, gestreken: rigging.after('ties'), mast: rigging.total };
  // Topping up: with the sails made up, the kraanlijn can take the giek out of the mik - the bundle goes
  // up 45 degrees on the lummel and the mik is put away, after which it hangs free and may sway.
  // t runs 0..1: the first part hoists, the last part stows the mik; back down it is the other way round.
  const topping = { want: 0, t: 0, hoist: 0, mikOff: 0, SECONDS: 5, ANGLE: deg(45) };
  // Aside for wrikken: the made-up sail is lifted out of the mik and laid down to port, the giek
  // still on the lummel and the wervel on the achterdek against the bakboord boeisel, out of the
  // way of the wrikriem; then the mik is laid on the vlonders. Any other mode puts it back.
  // t runs 0..1 like topping's: first the bundle moves, then the mik goes down.
  const aside = { t: 0, move: 0, mikOff: 0, SECONDS: 4, WERVEL: new THREE.Vector3(0.85, 0.74, -0.52) };
  const planStrike = (rig) => { topping.want = 0; rigging.command(RIG_AT[rig]); shown = rigging; };
  const throat = new THREE.Vector3(3.4568, 3.9816, 0);             // klauwhoek of the sail, where the gaffel meets the mast
  const GAFFEL_RISE = Math.atan2(0.7512, 0.66);                     // how steeply the gaffel stands when the sail is set
  const STOWED_Y = boomPivot.y + 0.19;                              // the gaffel's throat when it lies on the rolled sail
  const qTilt = new THREE.Quaternion(); const qGaff = new THREE.Quaternion(); const throatTo = new THREE.Vector3();
  const ATHWART = new THREE.Vector3(0, 0, 1);
  const clothMeshes = mainMeshes.filter((m) => m.geometry.attributes._bolling);
  // The bovenlijk is laced to the gaffel, from the klauwhoek (throat) to the tophoek: coming down,
  // the cloth goes where the gaffel goes, all of it at the head and less the nearer it is to the
  // foot, which stays on the giek. update() says how the gaffel moves (gaffStrike), before the sail is laid.
  const peak = (() => {                                             // the tophoek: the highest point of the cloth
    const best = new THREE.Vector3(0, -Infinity, 0); const v = new THREE.Vector3();
    for (const mesh of meshesOf(['grootzeil'])) {
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) if (v.fromBufferAttribute(pos, i).y > best.y) best.copy(v);
    }
    return best.setZ(0);
  })();
  const gaffStrike = { reefDrop: 0, drop: 0, tilt: 0 };             // what a rif lowers it by; what striking adds; its turn towards level
  const headRest = new THREE.Vector3(); const headNow = new THREE.Vector3(); const throatRest = new THREE.Vector3();
  mainBend.warp = (P) => {                                          // the grootzeil coming down in folds, then gathered on the giek
    const m = smoothstep(strike.main); const f = smoothstep(strike.furl);
    const h = Math.max(P[1] - boomPivot.y, 0);
    const foot = mainBend.foot;
    // the point of the bovenlijk above this one, where it is now and where the gaffel takes it
    throatRest.copy(throat).setY(throat.y - gaffStrike.reefDrop);
    headRest.lerpVectors(throat, peak, clamp((throat.x - P[0]) / (throat.x - peak.x), 0, 1)).setY(headRest.y - gaffStrike.reefDrop);
    headNow.copy(headRest).sub(throatRest).applyAxisAngle(ATHWART, gaffStrike.tilt).add(throatRest).setY(headNow.y - gaffStrike.drop);
    const up = clamp((P[1] - foot) / Math.max(headRest.y - foot, 0.05), 0, 1);
    P[0] += up * (headNow.x - headRest.x); P[1] += up * (headNow.y - headRest.y);
    P[2] += 0.04 * m * (1 - f) * Math.sin(h * 26) * Math.min(h * 4, 1);
    P[1] = THREE.MathUtils.lerp(P[1], boomPivot.y + 0.085 + (P[1] - boomPivot.y - 0.085) * 0.4, f);
    P[2] *= 1 - 0.5 * f;
  };
  const stayFoot = stayTack.clone(); const jibOut = new THREE.Vector3();
  jibBend.warp = (P) => {                                           // the fok sliding down its stay into a bundle on the voordek
    const j = smoothstep(strike.jib);
    jibOut.set(P[0], P[1], P[2]).sub(stayFoot);
    const along = jibOut.dot(stayAxis);
    jibOut.addScaledVector(stayAxis, -along);                       // what is left: how far off the stay
    const far = jibOut.length();
    jibOut.multiplyScalar(1 - 0.8 * j).addScaledVector(stayAxis, along * (1 - 0.9 * j)).add(stayFoot);
    P[0] = jibOut.x; P[1] = jibOut.y - 0.30 * j * Math.min(far / 0.6, 1); P[2] = jibOut.z + 0.014 * j * Math.sin(along * 30);
  };
  // the leuvers are one mesh; coming down, each slides along the stay with the piece of luff it is on
  const hankHome = (rest) => {
    const p = new THREE.Vector3(); const along = new Float32Array(rest.length / 3);
    let first = Infinity; let last = -Infinity;
    for (let i = 0; i < along.length; i++) {
      along[i] = p.fromArray(rest, i * 3).sub(stayFoot).dot(stayAxis);
      first = Math.min(first, along[i]); last = Math.max(last, along[i]);
    }
    const pitch = (last - first) / 9;                                // ten of them, evenly spaced
    return along.map((a) => first + Math.round((a - first) / pitch) * pitch);   // where its own leuver sits
  };
  const hanks = meshesOf(['leuvers']).map((mesh) => {
    const rest = Float32Array.from(mesh.geometry.attributes.position.array);
    return { mesh, rest, home: hankHome(rest), shown: NaN };
  });
  const slideHanks = (j) => {
    for (const hank of hanks) {
      if (Math.abs(j - hank.shown) < 1e-4) continue;
      hank.shown = j;
      const a = hank.mesh.geometry.attributes.position.array;
      for (let i = 0, k = 0; i < hank.home.length; i++, k += 3) {
        const slide = -hank.home[i] * 0.9 * j;                      // exactly as far as the luff it is seized to (jibBend.warp)
        a[k] = hank.rest[k] + slide * stayAxis.x; a[k + 1] = hank.rest[k + 1] + slide * stayAxis.y; a[k + 2] = hank.rest[k + 2] + slide * stayAxis.z;
      }
      hank.mesh.geometry.attributes.position.needsUpdate = true;
      hank.mesh.geometry.computeBoundingSphere();
    }
  };
  // -- boegspriet: bolted to the hanekam, it takes the voorstagspanner and the harpje of the
  // kettinkje on its upper flange. Those, the kettinkje and the tack of the fok go up by `lift`; the
  // voorstag is that much shorter at its foot, the fok stretched to its new tack, head and schoothoek
  // where they were. It goes on in one run: voorstagspanner and kettinkje off the hanekam and held
  // clear above it, the boegspriet slid in from forward, bolted, and the two made fast to it.
  const bowsprit = (() => {
    const part = byId.get('boegspriet'); const bolts = byId.get('boegspriet_bouten');
    if (!part || !bolts || !tuig.boegspriet) return null;
    for (const p of [part, bolts]) { parts.splice(parts.indexOf(p), 1); p.node.visible = false; }   // only there while it is on
    const lift = V(tuig.boegspriet.verplaatsing);
    const tack = stayTack.clone(); const head = V(tuig.voorstag.top);
    const geometryOf = (ids) => [...new Set(meshesOf(ids).map((m) => m.geometry))];
    // the tack's share of a point of the fok: its barycentric weight in tack, head and schoothoek
    const e1 = tack.clone().sub(jibClew); const e2 = head.clone().sub(jibClew);
    const d11 = e1.dot(e1); const d12 = e1.dot(e2); const d22 = e2.dot(e2); const det = d11 * d22 - d12 * d12;
    const q = new THREE.Vector3();
    const ofTack = (p) => { q.copy(p).sub(jibClew); return (d22 * q.dot(e1) - d12 * q.dot(e2)) / det; };
    // the voorstag: its foot goes all the way, its top not at all
    const [stay] = geometryOf(['voorstag']);
    let lo = Infinity; let hi = -Infinity;
    for (let i = 1; stay && i < stay.attributes.position.count * 3; i += 3) { lo = Math.min(lo, stay.attributes.position.array[i]); hi = Math.max(hi, stay.attributes.position.array[i]); }
    const move = (geometry, array, share) => {
      const rest = Float32Array.from(array); const p = new THREE.Vector3();
      const weight = new Float32Array(rest.length / 3).map((_, i) => share(p.fromArray(rest, i * 3)));
      return { geometry, array, rest, weight };
    };
    const moves = [
      ...geometryOf(['voorstagspanner', 'pelikaanhaak_ring', 'harpjes_fok', 'kettinkje_fok']).map((g) => move(g, g.attributes.position.array, () => 1)),
      ...(stay ? [move(stay, stay.attributes.position.array, (p) => clamp((hi - p.y) / (hi - lo), 0, 1))] : []),
      ...jibBend.items.map((item) => move(item.geometry, item.rest, ofTack)),
      ...hanks.map((hank) => move(hank.mesh.geometry, hank.rest, ofTack)),
    ];
    // it runs by itself, so the steps are timing and nothing else
    const proc = new Procedure('Boegspriet', { los: 0, schuif: 0, bout: 0, vast: 0 }, [
      { key: 'los', to: 1, seconds: 1.5, label: 'los' },
      { key: 'schuif', to: 1, seconds: 2, label: 'inschuiven' },
      { key: 'bout', to: 1, seconds: 1.2, label: 'vastbouten' },
      { key: 'vast', to: 1, seconds: 1.5, label: 'vast' },
    ]);
    return { part, bolts, lift, tack, moves, proc, want: false, at: new THREE.Vector3(), shown: new THREE.Vector3(NaN, 0, 0) };
  })();
  const SPRIET_CLEAR = 0.06;                                        // held this far over the upper flange while it goes in
  const SPRIET_SLIDE = 1.0;                                         // where it starts: this far forward of its place
  const BOLT_SLIDE = 0.08;                                          // and the bolts: this far to port
  const setBowsprit = (on) => {
    const b = bowsprit;
    if (!b || b.want === on) return;
    b.want = on; b.proc.command(on ? b.proc.total : 0);              // it plays on its own, off the progress bar
    if (on) note('bs');
  };
  // -- chill: with the sails down, the doft as a bench and a ruime wind or voor de wind, a boegspriet
  // rigged carries a spinnaker instead of the kluiver: on a ruime wind tacked to the hook on
  // the boegspriet, its sheet to the leeward aft leioog; voor de wind flown free from the masthead,
  // a sheet from either corner to the aft leioog of its side. Between the two it eases over.
  const chill = (() => {
    if (!bowsprit || !tuig.kluiver || !tuig.mast?.top) return null;
    const sp = initSpinnaker({ addPart, material: byId.get('fokkenschoot').meshes[0].material });
    const part = parts.find((p) => p.node === sp.sail); const ropePart = parts.find((p) => p.node === sp.ropes);
    for (const p of [part, ropePart]) { parts.splice(parts.indexOf(p), 1); p.node.visible = false; }
    const eye = (id) => {                                           // the top of the aftmost leioog of a side
      const q = new THREE.Vector3(); let low = Infinity; const pts = [];
      for (const m of meshesOf([id])) { const pos = m.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { pts.push(q.fromBufferAttribute(pos, i).clone()); low = Math.min(low, q.x); } }
      return pts.filter((r) => r.x < low + 0.06).reduce((a, r) => (r.y > a.y ? r : a));
    };
    return { sp, part, ropePart, holds: false, hoist: 0, head: V(tuig.mast.top), hook: V(tuig.kluiver.hals),
             eyes: { bb: eye('leiogen_bb'), sb: eye('leiogen_sb') }, downwind: new THREE.Vector3(), A: new THREE.Vector3(), B: new THREE.Vector3() };
  })();
  const CHILL_COURSE = 130;                                          // from here up it is a ruime wind
  const layChill = (step, struck) => {
    const c = chill; if (!c) return;
    const course = Math.abs(state.course); const side = Math.sign(state.course) || 1;
    const anchorDown = anchorGear && anchorGear.u > 0.01;
    const ready = bowsprit.want && state.mode === 'zeilen' && struck && strike.mast < 0.01 && bench.at > 0.99 && course >= CHILL_COURSE;
    if (ready && anchorDown && anchorGear.want > 0.5) weighAnchor(false);   // it comes up: no sailing on with it down
    const holds = ready && !anchorDown;
    c.holds = holds;
    const up = holds && bowsprit.proc.values.vast > 0.99;
    c.hoist = clamp(c.hoist + (up ? step : -step) / 3, 0, 1);
    if (c.hoist === 1) note('sp');
    const there = c.hoist > 0;
    for (const p of [c.part, c.ropePart]) {
      p.node.visible = there;
      const listed = parts.includes(p);
      if (there && !listed) parts.push(p); else if (!there && listed) parts.splice(parts.indexOf(p), 1);
    }
    if (!there) return;
    const run = smoothstep(clamp((course - 150) / 20, 0, 1));       // 0 ruime wind, 1 voor de wind
    c.downwind.set(-Math.cos(now.windAngle), 0, -Math.sin(now.windAngle));
    c.A.copy(c.hook).lerp(tmp.set(5.2, 1.7, side * 2.4), run);      // the tack: on the hook, or flying to windward
    c.B.set(3.3, 1.6, -side * 2.6).lerp(tmp.set(5.2, 1.7, -side * 2.4), run);   // the clew, to leeward
    const belly = 1.3 + 0.4 * run;
    const [a, b] = c.sp.lay(c.head, c.A, c.B, c.downwind, belly, now.t, smoothstep(c.hoist));
    const lee = side > 0 ? 'bb' : 'sb'; const weather = side > 0 ? 'sb' : 'bb';
    c.sp.sheet(1, b, c.eyes[lee]);
    c.sp.sheets[0].mesh.visible = run > 0.05;
    if (run > 0.05) c.sp.sheet(0, a, c.eyes[weather]);
  };
  const layBowsprit = () => {
    const b = bowsprit; if (!b) return;
    const { los, schuif, bout, vast } = b.proc.values;
    const off = smoothstep(los); const on = smoothstep(vast);
    b.at.copy(b.lift).multiplyScalar(off).setY(b.at.y + SPRIET_CLEAR * (off - on));
    const inPlace = (p, there) => {                                 // shown and pickable while it is on the boat at all
      p.node.visible = there;
      const listed = parts.includes(p);
      if (there && !listed) parts.push(p); else if (!there && listed) parts.splice(parts.indexOf(p), 1);
    };
    inPlace(b.part, schuif > 0); inPlace(b.bolts, bout > 0);
    setKluiver(vast > 0.99 && !chill?.holds);                        // the kluiver is set once the boegspriet is rigged
    b.part.node.position.x = SPRIET_SLIDE * (1 - smoothstep(schuif));
    b.bolts.node.position.z = -BOLT_SLIDE * (1 - smoothstep(bout));
    if (b.at.distanceToSquared(b.shown) < 1e-12) return;
    b.shown.copy(b.at);
    for (const { geometry, array, rest, weight } of b.moves) {
      for (let i = 0, k = 0; k < rest.length; i++, k += 3) {
        array[k] = rest[k] + weight[i] * b.at.x; array[k + 1] = rest[k + 1] + weight[i] * b.at.y; array[k + 2] = rest[k + 2] + weight[i] * b.at.z;
      }
      if (array !== geometry.attributes.position.array) geometry.attributes.position.array.set(array);
      geometry.attributes.position.needsUpdate = true;
      geometry.computeBoundingSphere(); geometry.computeBoundingBox();
    }
    stayTack.copy(b.tack).add(b.at); stayFoot.copy(stayTack);
    stayAxis.copy(V(tuig.voorstag.top)).sub(stayTack).normalize();
    for (const hank of hanks) { hank.home = hankHome(hank.rest); hank.shown = NaN; }
    jibBend.depth = NaN;                                            // laid again from its new rest
  };
  const warpPoint = (bend, p) => { const P = [p.x, p.y, p.z]; bend.warp(P); return p.set(P[0], P[1], P[2]); };
  // -- kluiver: the fok over again, set flying from the hook on the boegspriet. Nothing is
  // modelled for it: the fok's own meshes are shown a second time - cloth, kettinkje, harpjes and
  // the harpje of its val - moved as one rigid piece from the hanekam onto the hook and turned
  // onto the longer luff, so it swings, bellies and comes down with the fok. What that luff is
  // longer by is taken up by its val, which runs to the top of the mast over the second sheave of
  // a double block in place of the single one of the fokkenval. Its sheets run over the inboard
  // sheave of a double block on either leioog: the lower block of the grootschoot, shown a second
  // time in place of the single block, which then carries the fok's sheet on its outboard sheave.
  const kluiver = (() => {
    if (!tuig.kluiver || !tuig.grootschoot?.schijven_onder || !bowsprit) return null;
    const hals = V(tuig.kluiver.hals); const top = V(tuig.kluiver.top);
    const jib = byId.get('fok');
    const twins = (ids, node) => meshesOf(ids).map((of) => {
      const c = new THREE.Mesh(of.geometry, of.material.clone());
      c.matrixAutoUpdate = false; c.userData.of = of; node.add(c);
      return c;
    });
    const node = new THREE.Group(); const cloth = twins(['fok', ...ofSail('fok')], node);
    addPart(node, 'kluiver', 'Kluiver', 'zeil', 'fok', jib.extras.afmetingen_mm);
    const part = parts.find((p) => p.node === node);
    const gearNode = new THREE.Group(); const gear = twins(['kettinkje_fok', 'harpjes_fok', 'harpje_fokkenval'], gearNode);
    addPart(gearNode, 'kluiver_beslag', 'Kettinkje en harpjes van de kluiver', 'beslag', 'fok', [0, 0, 0]);
    const gearPart = parts.find((p) => p.node === gearNode);
    // the double blocks on the leiogen
    const doubles = jibSheets.map((sheet) => {
      const group = new THREE.Group();
      const meshes = lowerBlock.map((of) => { const c = new THREE.Mesh(of.geometry, of.material.clone()); group.add(c); return c; });
      const side = sheet.side > 0 ? 'stuurboord' : 'bakboord';
      addPart(group, `blok_fokkenschoot_dubbel_${sheet.key}`, `Dubbel blok fokkenschoot (${side})`, 'lopend_want', 'fokkenschoot',
              byId.get('blok_grootschoot_kuip').extras.afmetingen_mm);
      const block = hangBlock(sheet.single.eye, meshes, V(tuig.grootschoot.oog), tuig.grootschoot.schijven_onder.map(V), tuig.grootschoot.schijf_straal_m);
      return { part: parts.find((p) => p.node === group), block };
    });
    // the double block at the masthead, where the single block of the fokkenval hangs
    const single = byId.get('blok_fokkenval');
    const box = new THREE.Box3(); for (const m of single.meshes) box.expandByObject(m);
    const bearing = box.getCenter(new THREE.Vector3()).setY(box.max.y);
    const head = standDouble(bearing, new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0, 1));
    const headNode = new THREE.Group(); headNode.add(...head.meshes);
    addPart(headNode, 'blok_fokkenval_dubbel', 'Dubbel blok fokkenval', 'lopend_want', 'fokkenschoot', byId.get('blok_grootschoot_kuip').extras.afmetingen_mm);
    const headPart = parts.find((p) => p.node === headNode);
    mastSet.push(...head.meshes);
    // its val: up from the harpje at its head over the port sheave, and down the mast to the kikker
    const valNode = new THREE.Group();
    const valMaterial = byId.get('fokkenval').meshes[0].material.clone();
    const valUp = new RopeLine(2, dirkInfo.straal_m, valMaterial); const valDown = new RopeLine(2, dirkInfo.straal_m, valMaterial);
    valNode.add(valUp.mesh, valDown.mesh);
    addPart(valNode, 'kluiverval', 'Kluiverval', 'lopend_want', 'fokkenschoot', [0, 0, 0]);
    const valPart = parts.find((p) => p.node === valNode);
    // its sheets, a part of their own like the fokkenschoot
    const ropes = new THREE.Group();
    addPart(ropes, 'kluiverschoot', 'Kluiverschoot', 'lopend_want', 'fokkenschoot', [0, 0, 0]);
    const ropePart = parts.find((p) => p.node === ropes);
    const sheets = jibSheets.map((sheet, i) => ({ key: sheet.key, side: sheet.side, hand: sheet.hand.clone().add(new THREE.Vector3(-0.12, 0, 0)),
                                                  block: doubles[i].block, sheave: 0, lead: null, tail: null }));
    sheetRopes(ropePart, sheets, byId.get('fokkenschoot').meshes[0].material);
    const hidden = [part, gearPart, ropePart, valPart, headPart, ...doubles.map((d) => d.part)];
    for (const p of hidden) { parts.splice(parts.indexOf(p), 1); p.node.visible = false; }
    sailRig.push(...cloth, ...gear, valUp.mesh, valDown.mesh);
    return { hals, top, cloth, gear, part, gearPart, ropePart, valPart, headPart, single, head, valUp, valDown, doubles, sheets,
             S: new THREE.Matrix4(), on: false, clewNow: new THREE.Vector3(), valTop: new THREE.Vector3() };
  })();
  const setKluiver = (on) => {
    const k = kluiver;
    if (!k || k.on === on) return;
    k.on = on;
    if (on) {
      // the fok's gear as it stands now, rigidly: the bow of the lower harpje of its kettinkje - the
      // bottom of the lot - onto the hook, its luff turned onto the kluiver's
      const q = new THREE.Quaternion().setFromUnitVectors(V(tuig.voorstag.top).sub(stayTack).normalize(), k.top.clone().sub(k.hals).normalize());
      const foot = new THREE.Vector3(); const p = new THREE.Vector3(); let low = Infinity; let n = 0;
      const harps = meshesOf(['harpjes_fok']);
      for (const m of harps) { m.updateMatrixWorld(); const pos = m.geometry.attributes.position; for (let i = 0; i < pos.count; i++) low = Math.min(low, p.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).y); }
      for (const m of harps) { const pos = m.geometry.attributes.position; for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld); if (p.y < low + 0.03) { foot.add(p); n++; } } }
      foot.divideScalar(Math.max(n, 1));
      k.S.makeTranslation(k.hals.x, k.hals.y, k.hals.z).multiply(new THREE.Matrix4().makeRotationFromQuaternion(q))
        .multiply(new THREE.Matrix4().makeTranslation(-foot.x, -foot.y, -foot.z));
    }
    const inPlace = (p, there) => {
      p.node.visible = there;
      const listed = parts.includes(p);
      if (there && !listed) parts.push(p); else if (!there && listed) parts.splice(parts.indexOf(p), 1);
    };
    inPlace(k.part, on); inPlace(k.gearPart, on); inPlace(k.ropePart, on); inPlace(k.valPart, on); inPlace(k.headPart, on);
    const singleHead = parts.find((p) => p === k.single);
    if (singleHead) inPlace(singleHead, !on); else for (const m of k.single.meshes) m.visible = !on;
    k.doubles.forEach((d, i) => {
      inPlace(d.part, on);
      const sheet = jibSheets[i];
      const single = parts.find((p) => p.meshes.includes(sheet.single.meshes[0])) ?? null;
      if (single) inPlace(single, !on); else for (const m of sheet.single.meshes) m.visible = !on;
      sheet.block = on ? d.block : sheet.single; sheet.sheave = on ? 1 : 0;   // the fok on the outboard sheave of the double
    });
  };
  const valHarp = (() => {
    const meshes = meshesOf(['harpje_fokkenval']);
    if (!meshes.length) return null;
    const box = new THREE.Box3();
    for (const m of meshes) { m.geometry.computeBoundingBox(); box.union(m.geometry.boundingBox); }
    const home = box.getCenter(new THREE.Vector3()); home.y = box.max.y;      // where the val is made fast to it
    const rope = new RopeLine(2, 0.003, byId.get('fokkenval').meshes[0].material);
    rope.mesh.visible = false;
    joinPart(rope.mesh, 'fokkenval');
    return { meshes, home, at: new THREE.Vector3(), down: new THREE.Vector3(), rope };
  })();
  // the sail made up on the giek, and the zeilbinders round sail, giek and gaffel
  const stowed = (() => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.085, 2.55, 20, 8), new THREE.MeshStandardMaterial({ color: 0xd8d3c3, roughness: 0.95 }));
    const pos = mesh.geometry.attributes.position;                  // not a lathe-turned cylinder: a little lumpy
    for (let i = 0; i < pos.count; i++) {
      const k = 1 + 0.10 * Math.sin(pos.getY(i) * 9 + pos.getX(i) * 40) + 0.06 * Math.sin(pos.getY(i) * 23);
      pos.setX(i, pos.getX(i) * k); pos.setZ(i, pos.getZ(i) * k * 0.85);
    }
    mesh.geometry.computeVertexNormals(); mesh.geometry.rotateZ(Math.PI / 2);
    mesh.geometry.translate(boomEnd.x + 0.12 + 1.275, boomPivot.y + 0.095, boomPivot.z);
    mesh.visible = false;
    return mesh;
  })();
  const binders = new THREE.Group();
  {
    const elastic = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.85 });   // white shock cord
    const balls = [new THREE.MeshStandardMaterial({ color: 0xc8141f, roughness: 0.5 }),   // one red ball,
      new THREE.MeshStandardMaterial({ color: 0x1d4fa3, roughness: 0.5 })];               // one blue
    for (const x of [1.25, 2.05, 2.95]) {
      for (const dx of [-0.006, 0.006]) {                           // double elastic
        const loop = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.0035, 8, 40), elastic);
        loop.rotation.y = Math.PI / 2; loop.scale.set(0.95, 1.3, 1); loop.position.set(x + dx, boomPivot.y + 0.085, boomPivot.z);
        binders.add(loop);
      }
      for (const [n, dy] of [0.05, 0.085].entries()) {              // the two balls it is hooked together with
        const ball = new THREE.Mesh(new THREE.SphereGeometry(0.013, 12, 10), balls[n]);
        ball.position.set(x, boomPivot.y + 0.085 + dy, boomPivot.z + 0.105);
        binders.add(ball);
      }
    }
    binders.visible = false;
  }
  addPart(stowed, 'zeil_opgedoekt', 'Opgedoekt grootzeil', 'zeil', 'grootzeil', [2550, 170, 150]);
  addPart(binders, 'zeilbinders', 'Zeilbinders', 'zeil', 'grootzeil', [1720, 290, 220]);

  // -- scenery
  const water = makeWater(tuig.waterlijn_m,
    meshesOf(['vlak_sb', 'vlak_bb', 'kim_sb', 'kim_bb', 'boeisel_sb', 'boeisel_bb', 'spiegel']));
  const wind = makeWindArrow();
  const vane = makeWindVane();                                    // windvaan on the masthead
  vane.position.copy(V(tuig.mast.top)); vane.position.y += 0.06;   // clear of the masttopring
  addPart(vane, 'windvaan', 'Windvaan', 'rondhout', 'mast', [275, 95, 4]);
  // toplicht, just under the windvaan. It hangs there by day as well, unlit, the way it does on the
  // boat; initNight (rig.js) turns it up through setToplicht.
  const toplicht = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 12, 8),
    new THREE.MeshStandardMaterial({ color: 0xf6efdc, emissive: 0xfff2c0, emissiveIntensity: 0, roughness: 0.5, metalness: 0 }),
  );
  const toplichtGloed = new THREE.PointLight(0xfff2c0, 0, 6);
  toplicht.add(toplichtGloed);
  toplicht.position.copy(V(tuig.mast.top)); toplicht.position.y += 0.02;
  addPart(toplicht, 'toplicht', 'Toplicht', 'rondhout', 'mast', [60, 90, 60]);
  // the halo round the lamp, added AFTER addPart so it is neither picked nor counted as geometry of
  // the part: a sprite of its own, over everything, never dimmed by the light there is
  const toplichtHalo = (() => {
    const canvas = Object.assign(document.createElement('canvas'), { width: 64, height: 64 });
    const ctx = canvas.getContext('2d');
    const glow = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    glow.addColorStop(0, 'rgba(255, 252, 235, 1)');
    glow.addColorStop(0.25, 'rgba(255, 242, 192, 0.55)');
    glow.addColorStop(1, 'rgba(255, 242, 192, 0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
    }));
    sprite.scale.setScalar(0.35);
    sprite.raycast = () => {};
    sprite.visible = false;
    toplicht.add(sprite);
    return sprite;
  })();
  // paint() in main.js clears emissive on every part whenever the highlighting is refreshed, so the
  // lamp writes its own back every frame in update(); this only keeps how far it is turned up.
  const lamp = { k: 0, hex: toplicht.material.emissive.getHex() };   // its own colour, as it starts
  const setToplicht = (k) => { lamp.k = k; toplichtGloed.intensity = 1.5 * k; };
  scene.add(water, wind);
  // vlaggenstok in the top of the roerkoning, with its knop (bakskleur, like the roerkop) and the flag
  // a flag on the achterlijk of the grootzeil, made fast along the top of the leech from the tophoek
  // down: it hangs from the tape of the leech, wherever the sail takes that
  const leechFlag = (() => {
    const fly = initLeechFlag({ addPart });
    const part = parts.find((p) => p.node === fly.mesh);
    parts.splice(parts.indexOf(part), 1); fly.mesh.visible = false;
    const tape = meshesOf(['grootzeil_achterlijk'])[0];
    const pos = tape.geometry.attributes.position; const p = new THREE.Vector3();
    let top = null; let bottom = null;
    for (let i = 0; i < pos.count; i++) { p.fromBufferAttribute(pos, i); if (!top || p.y > top.y) top = p.clone(); if (!bottom || p.y < bottom.y) bottom = p.clone(); }
    const down = bottom.clone().sub(top).normalize();
    const at = [];
    for (let j = 0; j <= fly.rows; j++) {                             // the vertex of the tape nearest each point of the hoist
      const want = (j * fly.hoist) / fly.rows; let best = 0; let score = Infinity;
      for (let i = 0; i < pos.count; i++) {
        p.fromBufferAttribute(pos, i).sub(top);
        const along = p.dot(down); const off = p.addScaledVector(down, -along).length();
        const d = Math.abs(along - want) + 0.3 * off;
        if (d < score) { score = d; best = i; }
      }
      at.push(best);
    }
    sailRig.push(fly.mesh);
    return { fly, part, tape, at, points: at.map(() => new THREE.Vector3()), on: false, k: 0,      // k: how far it has faded in
             set(on) { if (this.on === on) return; this.on = on; if (on) { parts.push(part); note('sv'); } else parts.splice(parts.indexOf(part), 1); },
             setEmblem: fly.setEmblem };
  })();
  const flyFlag = initFlag({ foot: V(tuig.vlaggenstok.voet), axis: V(tuig.vlaggenstok.richting), addPart, joinPart,
                             accent: byId.get('roerkop').meshes.find((m) => m.material.name === 'bakskleur').material });

  // -- op sleeptouw: the voorlandvast taken out of its coil, through the sleepoog on the stem and
  // ahead to a boat out of sight. The coiled line goes away for as long as it is out there.
  const TOW_SECONDS = 2;                                            // paying it out, and taking it back
  const TOW_AHEAD = 9;                                              // m ahead of the stem: where the towing boat has it
  const TOW_SAG = 0.22;                                             // m of bight in the middle of the run
  const tow = (() => {
    const part = byId.get('voorlandvast'); const eyePart = byId.get('sleepoog_boeg');
    if (!part || !eyePart) return null;
    const box = new THREE.Box3();
    for (const m of eyePart.meshes) box.expandByObject(m);
    const eye = box.getCenter(new THREE.Vector3());
    const rope = new RopeLine(40, 0.006, part.meshes[0].material);
    rope.mesh.visible = false; rope.mesh.userData.part = part.node; part.node.parent.add(rope.mesh);
    const stowed = part.meshes.slice(); part.meshes.push(rope.mesh);
    // just clear of the water, so it is seen against it over its whole run
    const far = new THREE.Vector3(eye.x + TOW_AHEAD, tuig.waterlijn_m + 0.25, 0);
    return { part, rope, stowed, eye, far, to: far, want: false, k: 0, shown: NaN,
             path: Array.from({ length: 24 }, () => new THREE.Vector3()) };
  })();
  /** The run of the line, paid out as far as k says: out of the eye, forward and down into a
   *  shallow bight, then away to `to` - the towing boat ahead, or the meerpen on the beach. */
  const layTow = () => {
    const t = tow; if (!t || t.k === t.shown) return;
    t.shown = t.k;
    for (const m of t.stowed) m.visible = t.k === 0;
    t.rope.mesh.visible = t.k > 0;
    if (t.k === 0) return;
    const sag = (TOW_SAG * t.eye.distanceTo(t.to)) / TOW_AHEAD;     // a short span hangs less deep
    for (let i = 0; i < t.path.length; i++) {
      const s = (t.k * i) / (t.path.length - 1);                    // along the run it will take, so far as it is out
      t.path[i].lerpVectors(t.eye, t.to, s).y -= sag * 4 * s * (1 - s);
    }
    t.rope.set(t.path);
  };
  // The boat that has the other end: only its stern, standing at the far edge of the water disc
  // (which reaches to x 16.8) and fading out forward, where the water would end under it. It is
  // there while the line runs to it - not while the boat lies at the meerpen - and while it pulls
  // there is a wake astern of it and astern of our own transom.
  const TUG_AT = 15.8;
  const tug = makeTugStern({ waterline: tuig.waterlijn_m, at: TUG_AT });
  const wakes = [makeWake({ waterline: tuig.waterlijn_m, from: 0.05, length: 6, near: 0.55, far: 1.25 }),
                 makeWake({ waterline: tuig.waterlijn_m, from: TUG_AT, length: 3.5, near: 1, far: 1.5, strength: 0.7 })];
  scene.add(tug.group, ...wakes.map((w) => w.mesh));
  if (tow) tow.far.copy(tug.post);                                  // the line goes to the post on its deck

  // -- an island off the port bow: the boat lies there at the meerpen. The island rises out of the water off the port bow, the lid of the bakskist goes up
  // and the meerpen is carried ashore and driven into the beach, and the voorlandvast - the same
  // line that goes out on sleeptouw - runs from the sleepoog to its head. Going, it is undone in
  // that order backwards: the line in, the pen back in the kist, then the island under again.
  const ISLAND_AT = [10.5, -3.5];                                   // the centre of it, off the port bow
  const ISLAND_SECONDS = 3;                                         // rising out of the water, and sinking back
  const PEN_SECONDS = 2.5;                                          // the meerpen from the kist to the beach
  const PEN_BEACH = 1.2;                                            // m up the beach from the water's edge
  const PEN_LEAN = deg(9);                                          // driven in leaning away from the boat
  const PEN_SUNK = 0.07;                                            // m of the point in the sand
  const PEN_ARC = 0.8;                                              // how high it swings on the way over
  const PEN_EYE = 0.05;                                             // from the top of the pen down to its eye
  const moor = (() => {
    const pen = byId.get('meerpen');
    if (!pen || !tow || !kist) return null;
    const box = new THREE.Box3();
    for (const m of pen.meshes) box.expandByObject(m);
    // it lies fore and aft in the kist with its head - the eye and the ring in it - aft, so it
    // stands on the end that is forward now, and the rest axis point -> head is straight aft
    const mid = box.getCenter(new THREE.Vector3());
    const tip = new THREE.Vector3(box.max.x, mid.y, mid.z);
    const length = box.max.x - box.min.x;
    const isle = makeIsland({ centre: ISLAND_AT, waterline: tuig.waterlijn_m,
                              facing: [tow.eye.x - ISLAND_AT[0], -ISLAND_AT[1]] });
    scene.add(isle.group);
    const away = new THREE.Vector3(ISLAND_AT[0] - tow.eye.x, 0, ISLAND_AT[1]).normalize();
    const lean = new THREE.Vector3(away.z, 0, -away.x);             // the pen leans over this, away from the boat
    const stand = UP.clone().applyAxisAngle(lean, PEN_LEAN);
    const tipAt = isle.shore(PEN_BEACH).addScaledVector(stand, -PEN_SUNK);
    const head = tipAt.clone().addScaledVector(stand, length - PEN_EYE);
    const standQ = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(-1, 0, 0), stand);
    return { isle, pen, tip, tipAt, head, standQ, want: false, up: 0, ashore: 0, shown: NaN, opened: false };
  })();
  const penQ = new THREE.Quaternion(); const penAt = new THREE.Vector3();
  /** The meerpen w of the way from where it lies in the kist to standing in the sand. */
  const placePen = (w) => {
    penQ.slerpQuaternions(IDENTITY_Q, moor.standQ, w);
    penAt.lerpVectors(moor.tip, moor.tipAt, w);
    penAt.y += Math.sin(Math.PI * w) * PEN_ARC;                     // up out of the kist and over the boeisel
    carry(moor.pen.meshes, moor.tip, penAt, penQ);
  };

  // -- state: targets are set by the UI, the smoothed values chase them
  // rowPhase 0..1 runs inpik -> haal -> uitpik -> recover; rowLength is half the sweep of the oar (radians)
  const state = { commando: { bb: 'slag', sb: 'slag' }, mode: 'zeilen', course: 90, midzwaard: 'neer', rowing: 'kruis', rowPhase: 0, rowLength: 0.42 };
  const ROLL_AXIS = new THREE.Vector3(1, 0, 0); const rollAt = new THREE.Vector3(0, tuig.waterlijn_m, 0);
  const swell = { k: 0, sway: 0, roll: 0, SWAY: deg(30), ROLL: deg(7) };
  const now = { boom: 0, jib: FOK_CAD, jibBend: 0.08, mainBend: 1, board: 0, sails: 1, wind: 1, rowing: 0, sculling: 0, flutter: 0, windAngle: deg(90), t: 0 };
  const chase = (key, target, dt, rate = 4.5) => { now[key] += (target - now[key]) * (1 - Math.exp(-dt * rate)); };

  const q = new THREE.Quaternion(); const roll = new THREE.Quaternion(); const dir = new THREE.Vector3();
  const tmp0 = new THREE.Vector3(); const tmp1 = new THREE.Vector3();
  const tmp = new THREE.Vector3(); const delta = new THREE.Vector3();
  const hang = new THREE.Vector3(); const sheetDir = new THREE.Vector3(); const qa = new THREE.Quaternion();
  const identity = new THREE.Quaternion(); const blended = new THREE.Quaternion();
  const IDENTITY_Q = new THREE.Quaternion();

  /** Where an oar lies stowed (see oar.stow), blended away as it is put to use (weight 1). */
  const stowQ = new THREE.Quaternion();
  function stowOar(oar, weight) {
    const move = oar.stow;
    if (!move || weight >= 1) return;
    const k = 1 - weight;
    stowQ.setFromAxisAngle(UP, move.yaw * k);
    for (const m of oar.meshes) {
      m.position.sub(move.pivot).applyQuaternion(stowQ).add(move.pivot);
      m.position.z += move.out * k;
      m.quaternion.premultiply(stowQ);
    }
  }

  function poseOar(oar, weight, target, direction, rollAngle) {
    // blend from stowed (identity) to "pivot point on `target`, shaft along `direction`"
    q.setFromUnitVectors(oar.axis, direction);
    roll.setFromAxisAngle(direction, rollAngle);
    q.premultiply(roll);
    blended.slerpQuaternions(identity, q, weight);
    tmp.lerpVectors(oar.pivot, target, weight);
    tmp.y += Math.sin(Math.PI * weight) * 0.45;                     // lift it clear of the boat on the way
    carry(oar.meshes, oar.pivot, tmp, blended);
  }

  // -- a stootwil in the water. It lies on its side, half under, pointing away from the boat, and
  // rides the surface where it fell - the line is cast off with it and trails behind. Hauled back,
  // it hangs overboard at the rail again.
  const MOB_SECONDS = 2;                                            // throwing it in, and hauling it back
  const MOB_LIFT = 0.3;                                             // how high the arc rises over the straight way there
  const MOB_LINE = 0.07;                                            // its own short line, trailing on the surface
  const MOB_WET = 0.01;                                             // the axis this far above the waterline: half under
  const MOB_WAY = 0.5;                                              // the way she makes under sail, in metres a second
  const seaRest = new THREE.Vector3(); const seaAxis = new THREE.Vector3();
  const seaAcross = new THREE.Vector3(); const seaTail = new THREE.Vector3();
  const seaMid = new THREE.Vector3(); const seaQ = new THREE.Quaternion();
  let armed = null;                                                 // the stootwil in hand: the next click on the water throws it
  /** Throw `w` in at `at`, a point on the water, from wherever it hangs now. */
  const toSea = (w, at) => {
    const point = at.clone(); point.y = tuig.waterlijn_m + MOB_WET;
    // the water is holed where the boat is, but a throw at the very edge of it would still be on
    // the planking: put that one alongside, on the boord the stootwil came from
    if (point.x > -0.3 && point.x < 6.2 && Math.abs(point.z) < 1) point.z = w.side * 1.2;
    seaAxis.set(point.x - 2.8, 0, point.z);                         // away from the boat, though not quite straight
    if (seaAxis.lengthSq() < 1e-6) seaAxis.set(0, 0, w.side);
    seaAxis.normalize().applyAxisAngle(UP, 0.7 * Math.sin(97 * point.x + 61 * point.z));
    w.sea = { centre: point, axis: seaAxis.clone(), phase: 7 * point.x + 3 * point.z, k: 0, back: false, landed: false,
              from: w.fender.position.clone(), fromQ: w.fender.quaternion.clone() };
    w.at = 1; w.want = 1; w.shown = 1;                              // overboard, as far as everything else is concerned
    armed = null;
  };
  /** Haul `w` back out of the water, to where it hangs overboard. */
  const fromSea = (w) => {
    w.sea.back = true; w.sea.k = 0;
    w.sea.from.copy(w.fender.position); w.sea.fromQ.copy(w.fender.quaternion);
  };
  /**
   * A stootwil on its way into the water, lying in it, or on its way back to the rail. False once
   * it is at the rail again and the ordinary hanging takes it over.
   */
  const seaFender = (w, dt, step) => {
    const sea = w.sea;
    sea.k = Math.min(1, sea.k + dt / MOB_SECONDS);
    const s = smoothstep(sea.k);
    // Under sail she makes her way and the stootwil stays where it is in the water: astern it goes,
    // and once it is past the edge of the water it is gone for good - a new one is on its eye.
    if (sea.k === 1 && !sea.back && !measuring && state.mode === 'zeilen'
        && rigging.t < 1e-6 && state.course !== 0 && now.flutter < 0.05) {
      sea.centre.x -= MOB_WAY * step;
      if (sea.centre.x < 2.8 - 14.5) { w.sea = null; w.at = 0; w.want = 0; w.shown = NaN; return false; }
    }
    seaAcross.set(-sea.axis.z, 0, sea.axis.x);                      // across it, on the surface
    if (sea.back) { seaRest.copy(w.outTop); seaQ.copy(w.outQ); seaAxis.copy(sea.axis); }
    else {
      // the ends rise and fall and it turns a little where it lies: that is the water doing it, so
      // it goes at dt and the speed of what is being done leaves it alone
      seaAxis.copy(sea.axis).applyAxisAngle(UP, sea.k * deg(5) * Math.sin(0.6 * now.t + sea.phase))
             .applyAxisAngle(seaAcross, sea.k * deg(6) * Math.sin(1.3 * now.t + sea.phase));
      seaRest.copy(sea.centre).addScaledVector(seaAxis, -w.fender.userData.length / 2);
      seaRest.y += sea.k * 0.012 * Math.sin(1.7 * now.t + sea.phase);
      seaQ.setFromUnitVectors(DOWN, seaAxis);
    }
    if (sea.k < 1) {
      w.fender.position.lerpVectors(sea.from, seaRest, s);
      w.fender.position.y += MOB_LIFT * Math.sin(Math.PI * s);      // up and over, not straight across
      w.fender.quaternion.slerpQuaternions(sea.fromQ, seaQ, s);
    } else { w.fender.position.copy(seaRest); w.fender.quaternion.copy(seaQ); }
    // the line leaves the top, which is the end towards the boat, and lies out behind it
    const top = w.fender.position;
    seaTail.copy(top).addScaledVector(seaAxis, -MOB_LINE);
    seaTail.y = Math.max(tuig.waterlijn_m + 0.004, top.y - 0.3 * MOB_LINE);
    seaMid.lerpVectors(top, seaTail, 0.5).addScaledVector(seaAcross, 0.25 * MOB_LINE);
    w.line.set([seaTail, seaMid, top.clone()]);
    if (sea.k < 1) return true;
    if (sea.back) { w.sea = null; w.at = 1; w.want = 1; w.shown = NaN; return false; }
    if (!sea.landed) { sea.landed = true; note('mo'); }
    return true;
  };
  const mob = {
    get on() { return stootwillen.some((w) => w.sea && !w.sea.back); },
    set(on) {
      if (!on) { for (const w of stootwillen) if (w.sea && !w.sea.back) fromSea(w); return; }
      const w = stootwillen.find((x) => x.side < 0 && !x.sea);      // off the bakboord quarter
      if (w) toSea(w, new THREE.Vector3(0.5, 0, -2.5));
    },
  };
  /** Where a ray already set from the pointer crosses the water, as a hit, or null. */
  const waterHit = (raycaster) => raycaster.intersectObject(water, false)[0] ?? null;

  function update(dt, pace = 1) {
    const step = dt * pace;                                         // what is being done goes at this speed; wind and water at dt
    const sailing = state.mode === 'zeilen';
    const side = Math.sign(state.course) || 1;                      // +1: wind over starboard, sails to port
    const course = Math.min(Math.abs(state.course), RUN);
    const loevert = smoothstep(clamp((Math.abs(state.course) - DOWNWIND) / (RUN - DOWNWIND), 0, 1));
    rigging.tick(step); reefing?.tick(step); bowsprit?.proc.tick(step); layBowsprit();
    if (anchorGear) {
      // Taken over by hand, the procedure has it back once they agree: at its start, or where its
      // own anchor step comes to the same place (hoisting, it weighs an anchor that is up already)
      const agree = Math.abs(strike.anchor - anchorGear.u) < 1e-3 && Math.round(strike.anchor) === anchorGear.want;
      if (anchorGear.byHand && (rigging.t < 1e-6 || agree)) anchorGear.byHand = false;
      if (rigging.t > 1e-6 && !anchorGear.byHand) {                 // the procedure has it: with its own anchor, on its own ground
        anchorGear.u = strike.anchor; anchorGear.want = Math.round(strike.anchor);
        if (anchorGear.lost || anchorGear.drift > 0) {              // it has one of its own: the loss is behind us
          anchorGear.lost = false; anchorGear.drift = 0; anchorGear.seen = 1; anchorGear.whip = 0; anchorGear.shown = NaN;
        }
      } else if (!measuring) {
        const gap = anchorGear.want - anchorGear.u; const by = 0.25 * step;   // by hand: four seconds from chest to bottom
        anchorGear.u = Math.abs(gap) <= by ? anchorGear.want : anchorGear.u + Math.sign(gap) * by;
      }
      // Sailing full over her own anchor a vlet brings herself up short on it, and the ankerlijn is
      // jerked off the ankeroog: nothing in the bow of a vlet holds against her way under sail.
      if (!measuring) {
        const g = anchorGear;
        const wasDrift = g.drift; const wasWhip = g.whip; const wasLost = g.lost; const wasSeen = g.seen;
        // only with the wind in the sails: they are up and drawing, and the boat is on a course
        const drawing = sailing && rigging.t < 1e-6 && state.course !== 0 && now.flutter < 0.05;
        if (drawing && g.u > 0.999) {
          g.drift += 1.5 * step;                                    // she makes her way; the gear stays on the bottom
          if (!g.lost && g.drift >= SNAP_AT) { g.lost = true; g.whip = 0; note('av'); }
        } else if (!g.lost) g.drift = Math.max(g.drift - 1.5 * step, 0);   // brought up short: it never came to that
        if (g.lost) {
          g.whip = Math.min(g.whip + step / 0.6, 1);
          g.seen = g.shackleFlat.x - g.drift < WATER_EDGE ? 0 : 1;  // left behind beyond the water: nothing to be seen of it
          if (g.u < 0.004) { g.lost = false; g.drift = 0; g.seen = 1; g.whip = 0; }   // hauled in: the next one is a new one
        }
        if (g.drift !== wasDrift || g.whip !== wasWhip || g.lost !== wasLost || g.seen !== wasSeen) g.shown = NaN;   // laid again this frame
      }
      if (!measuring) trimBoard();                                  // on the bottom, or back aboard: the midzwaard follows
    }
    for (const w of stootwillen) {
      if (w.sea && seaFender(w, dt, step)) continue;                // in the water: it lies where it fell
      const by = step / FENDER_SECONDS; const gap = w.want - w.at;
      w.at = Math.abs(gap) <= by ? w.want : w.at + Math.sign(gap) * by;
      if (w.at !== w.shown) { w.shown = w.at; hangFender(w); }
    }
    const allOut = stootwillen.length > 0 && stootwillen.every((w) => w.at === 1);
    if (allOut !== spiegelShows && !measuring) {
      spiegelShows = allOut;
      letterSpiegel(allOut ? [unpack('IioNVXuA+cP+QCRff5c='), unpack('HDZaGW2NtsLvCSJNJIuH+cTlDyNSdJI=')] : null);
      if (allOut) note('th');
    }
    if (moor && (moor.want || moor.up > 0)) {
      if (moor.want) {
        moor.up = Math.min(1, moor.up + step / ISLAND_SECONDS);
        if (moor.up === 1) {
          if (!moor.opened) { kist.want = 1; moor.opened = true; }
          if (tow.k === 0) moor.ashore = Math.min(1, moor.ashore + step / PEN_SECONDS);   // any towline in first
        }
      } else {
        if (tow.k === 0) moor.ashore = Math.max(0, moor.ashore - step / PEN_SECONDS);
        if (moor.ashore === 0) {
          if (moor.opened) { kist.want = 0; moor.opened = false; }
          moor.up = Math.max(0, moor.up - step / ISLAND_SECONDS);
        }
      }
      tow.want = moor.want && moor.ashore === 1;                    // made fast once the pen stands
      const to = moor.ashore === 1 ? moor.head : tow.far;           // and it runs to the pen until it is in again
      if (tow.to !== to) { tow.to = to; tow.shown = NaN; }
      moor.isle.rise(smoothstep(moor.up));
      if (moor.ashore !== moor.shown) { moor.shown = moor.ashore; placePen(smoothstep(moor.ashore)); }
    }
    if (kist) {
      kist.open += (kist.want - kist.open) * (1 - Math.exp(-step * 3.5));
      pivotRotate(kist.lid, kist.hinge, kist.axis, kist.shut * (1 - kist.open));
    }
    if (tow) {
      const by = step / TOW_SECONDS; const gap = (tow.want ? 1 : 0) - tow.k;
      tow.k = Math.abs(gap) <= by ? (tow.want ? 1 : 0) : tow.k + Math.sign(gap) * by;
      layTow();
      if (tow.k === 1) note(tow.to === tow.far ? 'sl' : 'bi');
      // under tow there is a boat ahead and water running past; at the meerpen there is neither
      const towing = tow.to === tow.far ? smoothstep(tow.k) : 0;
      tug.fade(towing);
      for (const w of wakes) { w.fade(towing); if (towing > 0) w.stream(dt); }
    }
    {
      const by = step / topping.SECONDS; const gap = topping.want - topping.t;
      topping.t = Math.abs(gap) <= by ? topping.want : topping.t + Math.sign(gap) * by;
      topping.hoist = smoothstep(clamp(topping.t / 0.6, 0, 1)); topping.mikOff = smoothstep(clamp((topping.t - 0.55) / 0.45, 0, 1));
    }
    {
      const inMik = strike.ties > 0.99 && strike.low < 1e-3 && topping.t === 0;   // made up, in the fork of the mik
      const want = state.mode === 'wrikken' && inMik ? 1 : 0;
      const by = step / aside.SECONDS; const gap = want - aside.t;
      aside.t = Math.abs(gap) <= by ? want : aside.t + Math.sign(gap) * by;
      aside.move = smoothstep(clamp(aside.t / 0.6, 0, 1)); aside.mikOff = smoothstep(clamp((aside.t - 0.55) / 0.45, 0, 1));
    }
    // on sleeptouw the boat lies head to wind as well: it follows the line, not the sails
    const headUp = Math.max(smoothstep(strike.head), smoothstep(reef.head), state.course === 0 ? 1 : 0,
                            tow ? smoothstep(tow.k) : 0, moor ? smoothstep(moor.up) : 0);
    const upwind = 1 - headUp;                                      // head to wind: everything amidships and shaking
    chase('flutter', sailing ? headUp : 0, dt, 2.2);
    // the giek wanders a little while the sail shakes, and more when it hangs in the kraanlijn - but not while it lies in the mik
    const loose = Math.max(1 - smoothstep(strike.main), topping.hoist * topping.hoist);
    chase('boom', sailing ? side * interp(BOOM, course) * upwind + (1.6 + 2.4 * topping.hoist) * loose * now.flutter * Math.sin(1.9 * now.t) : 0, dt);
    chase('jib', sailing ? side * THREE.MathUtils.lerp(interp(FOK, course), FOK_TE_LOEVERT, loevert) * upwind : FOK_CAD, dt);
    chase('jibBend', interp(FOK_BEND, course) * upwind, dt);
    chase('mainBend', interp(MAIN_BEND, course) * upwind, dt);
    // struck, the boat lies head to wind - unless it sails on under the spinnaker: then the wind
    // comes from the course again, but the struck rig stays where it was made up
    chase('windAngle', deg(side * course) * (1 - headUp * (1 - smoothstep(chill?.hoist ?? 0))), dt);
    // struck, the sails stay in the boat when it is rowed or sculled: only set sails are taken away
    const struck = rigging.t >= RIG_AT.gestreken - 1e-6;
    chase('sails', sailing || struck ? 1 : 0, dt, 3.5);
    chase('wind', sailing ? 1 : 0, dt, 3.5);
    chase('board', { neer: 0, half: 1, op: 2 }[state.midzwaard], dt, 2.2);
    chase('rowing', state.mode === 'roeien' ? 1 : 0, dt, 2.5);
    chase('sculling', scullOar.byHand ?? (state.mode === 'wrikken' ? 1 : 0), dt, 2.5);   // by the mode, or put out by a click
    now.t += dt;
    {
      const driven = state.mode === 'wrikken' && now.sculling > 0.9 && topping.hoist > 0.95;
      swell.k = driven ? Math.min(1, swell.k + dt * (0.015 + 0.1 * swell.k)) : Math.max(0, swell.k - dt * 0.25);
      if (swell.k === 1) note('dn');
      const lag = Math.sin((now.t * 2 * Math.PI) / 1.6 - Math.PI / 2);   // a quarter beat behind the stroke
      swell.sway = (deg(4) * Math.min(swell.k * 10, 1) + swell.SWAY * swell.k) * lag * topping.hoist;
      swell.roll = swell.ROLL * swell.k * lag;
    }
    // midzwaard: 0 = neer, 1 = half, 2 = op
    // the zwaardbout: in the hand it follows it, out of the kast it lies beside it while the board
    // goes down, and back the same way round - a second and a quarter either way
    if (bolt.down && strike.zwaard > 0.01) holdBolt();             // a procedure that wants the board up gets the bolt back first
    if (bolt.down) {
      bolt.pull = BOLT_OUT;
      bolt.fall = Math.min(1, bolt.fall + step / 1.2);
      bolt.swing += step;                                          // how long it has been hanging there
      if (bolt.fall === 1) note('zb');
    } else {
      bolt.fall = Math.max(0, bolt.fall - step / 1.2);
      if (helm.held !== 'bout') bolt.pull = Math.max(0, bolt.pull - (step * BOLT_OUT) / 1.2);   // let go short: it slides back
    }
    boltAt.copy(boardPivot); boltAt.z += bolt.side * bolt.pull;
    boltTo.set(boltLie.x, boltLie.y, bolt.side * boltLie.z);
    bout.position.copy(boltAt).lerp(boltTo, smoothstep(bolt.fall));
    if (bolt.fall > 0) now.board = bolt.was; else bolt.was = now.board;   // out of the kast, nothing sets the board
    const s = now.board + (2 - now.board) * smoothstep(strike.zwaard);   // the Tuig procedure raises it after the anchor
    // half -> op: the board is all the way up by s = 1.6, the links fold over s = 1.5 .. 2 once
    // the foot pin has cleared the kast top
    const angle = s <= 1 ? THREE.MathUtils.lerp(boardAngles[0], boardAngles[1], s)
                         : THREE.MathUtils.lerp(boardAngles[1], boardAngles[2], smoothstep(clamp((s - 1) / 0.6, 0, 1)));
    pivotRotate(boardMeshes, boardPivot, boardAxis, -deg(angle));
    rotatedPoint(boardPin, boardPivot, boardAxis, -deg(angle), boardHole);
    rotatedPoint(loperFoot, boardPivot, boardAxis, -deg(angle), footTo);   // the foot pin rides on the board
    if (bolt.fall > 0) {
      // On the one pin the board turns until its middle hangs plumb under it, and being a pendulum
      // it goes past and comes back, dying away over a quarter of a minute. The pin stays where it
      // is, so the loper hangs on as it always does. Back in, the turn goes out of it again.
      const fell = smoothstep(bolt.fall);
      swingAt.copy(boardMid).sub(loperFoot).applyAxisAngle(boardAxis, -deg(angle));
      const plumb = -Math.atan2(swingAt.x, -swingAt.y);           // the turn that puts that middle straight down
      const beat = (0.7 * Math.exp(-bolt.swing / SWING_QUICK) + 0.3 * Math.exp(-bolt.swing / SWING_SLOW)) * Math.cos(SWING_BEAT * bolt.swing);
      qFell.setFromAxisAngle(boardAxis, plumb * (1 - beat) * fell).multiply(qSag.setFromAxisAngle(boardAxis, -deg(angle)));
      carry(boardMeshes, loperFoot, footTo, qFell);
      boardHole.copy(boardPin).sub(loperFoot).applyQuaternion(qFell).add(footTo);
    }

    const fold = smoothstep(clamp((s - 1.5) / 0.5, 0, 1));
    qLower.setFromAxisAngle(AFT, (Math.PI / 2) * fold);           // about the foot pin: up -> aft
    carry(loperLower, loperFoot, footTo, qLower);
    kneeTo.copy(loperKnee).sub(loperFoot).applyQuaternion(qLower).add(footTo);   // the knuckle pin rides on the lower link
    qUpper.setFromAxisAngle(AFT, UPPER_HANG * fold);              // about the knuckle pin: up -> hanging down
    carry(loperUpper, loperKnee, kneeTo, qUpper);

    // the pin is only in at a stop: at half through a hole in the loper, at op through the board
    const pinIn = Math.max(1 - smoothstep(clamp(Math.abs(s - 1) / 0.2, 0, 1)),
                           1 - smoothstep(clamp(Math.abs(s - 2) / 0.2, 0, 1)));
    pinTo.copy(s > 1.5 ? boardHole : tmp.copy(pinHole).sub(loperFoot).add(footTo));
    // out of the hole the pin does not vanish: it hangs down on its chain beside the kast
    borgpen.position.copy(pinHang).lerp(pinTo, pinIn);
    borgpen.quaternion.slerpQuaternions(HANG, IDENTITY_Q, pinIn);
    pinRing.set(0, 0, borgpen.userData.ring).applyQuaternion(borgpen.quaternion).add(borgpen.position);
    layChain(kettinkje.userData.links, [chainEye, pinRing]);

    // sails: boom, gaff and mainsail swing about the mast; the fok about the voorstag
    const boomAngle = -deg(now.boom) + swell.sway;                  // about +y; to port is negative
    pivotRotate(mainMeshes, mastPivot, UP, boomAngle);
    // The giek swings by the same angle, but on the lummelbout, 52 mm aft of the mast. The cloth is
    // made fast to both: its head follows the gaffel round the mast, its foot follows the giek, and
    // in between it goes over evenly from the one to the other (Bend.shift).
    const boomTurn = boomAngle;
    mainBend.shift.copy(boomPivot).sub(mastPivot).setY(0);          // (turned back - itself): where the foot has to go
    mainBend.shift.sub(tmp.copy(mainBend.shift).applyAxisAngle(UP, -boomAngle)).negate();
    const mastDown = MAST_DOWN * smoothstep(strike.mast);
    qMast.setFromAxisAngle(ATHWART, mastDown); qMastBack.copy(qMast).invert();
    pivotRotate(mastSet, mastBolt, ATHWART, mastDown);
    // voorstag with its hook: lifted out of the hanekam, then folded along the mast as it comes down
    qStay.setFromAxisAngle(ATHWART, -(deg(2) * smoothstep(strike.hook) + (STAY_FOLD - deg(2)) * smoothstep(strike.mast)));
    for (const set of [staySet, stayRing]) {
      carry(set, mastHead, withMast(mastHead, tmp), qTurn.copy(qMast).multiply(qStay));
    }
    for (const m of stayRing) m.position.addScaledVector(tmp.copy(stayAxis).negate().applyQuaternion(qTurn), -0.10 * smoothstep(strike.ring));
    for (const m of grendel) { m.position.set(0, 0, -0.20 * smoothstep(strike.grendel)); }
    const phi = reef.turns * 2 * Math.PI;
    const sailDrop = mainBend.drop(phi) + 0.06 * smoothstep(reef.slack);   // the gaffel comes down with the luff
    // struck, the gaffel comes all the way down the mast and is laid flat on the rolled sail
    const lowered = smoothstep(strike.main);
    const gaffelDrop = THREE.MathUtils.lerp(sailDrop, throat.y - STOWED_Y, lowered);
    gaffStrike.reefDrop = sailDrop; gaffStrike.drop = gaffelDrop - sailDrop;
    gaffStrike.tilt = GAFFEL_RISE * smoothstep(clamp(strike.main * 1.6 - 0.6, 0, 1));
    qTilt.setFromAxisAngle(ATHWART, gaffStrike.tilt);
    qGaff.setFromAxisAngle(UP, boomAngle).multiply(qTilt);
    rotatedPoint(throat, mastPivot, UP, boomAngle, throatTo).y -= gaffelDrop;
    carry(gaffelSet, throat, throatTo, qGaff);
    const onGaffel = (rest, out) => out.copy(rest).sub(throat).applyQuaternion(qGaff).add(throatTo);
    for (const m of lacing) { m.scale.y = Math.max((LUFF - gaffelDrop) / LUFF, 0.02); m.position.y += reefInfo.onderlijk_m * (1 - m.scale.y); }

    qYaw.setFromAxisAngle(UP, boomTurn);
    qYaw.multiply(qTilt.setFromAxisAngle(ATHWART, -deg(1.1) * lowered));   // the nok lifted into the fork of the mik
    axisNow.copy(boomAxis).applyQuaternion(qYaw);
    const aft = 0.03 * smoothstep(reef.pull);
    pivotRotate(boomStill, boomPivot, UP, boomTurn);
    carry([shaft], boomPivot, boomPivot, qYaw);
    carry(pulled, boomPivot, tmp.copy(boomPivot).addScaledVector(axisNow, aft), qYaw);
    qTurn.setFromAxisAngle(boomAxis, phi).premultiply(qYaw);        // rolled first, then swung out
    carry(rolling, boomPivot, tmp.copy(boomPivot).addScaledVector(axisNow, aft), qTurn);
    ring.turn = RING_TURN * smoothstep(reef.hoop); ring.slide = reefInfo.schuif_m * smoothstep(reef.slide);
    qTurn.setFromAxisAngle(boomAxis, ring.turn).premultiply(qYaw);
    carry(ringMeshes, boomPivot, tmp.copy(boomPivot).addScaledVector(axisNow, ring.slide), qTurn);
    // The made-up sail with giek and gaffel as one stiff bundle, carried by two points: forward the
    // lummel (later the mastdoft), aft the mik (first its fork, then its lower hook).
    const lowK = smoothstep(strike.low); const freeK = smoothstep(clamp(strike.pin * 2 - 1, 0, 1));
    bundleFrom.copy(boomPivot); nokFrom.copy(boomPivot).addScaledVector(axisNow, boomPivot.x - MIK_X);
    bundleTo.set(boomPivot.x - 0.13, 0.775, 0.03).lerp(boomPivot, 1 - freeK);
    nokTo.set(MIK_X, mikPose.standing.y + 0.862 + 0.030, 0.072).lerp(nokFrom, 1 - lowK);
    if (aside.move > 0) {                                           // the giek pointing at where the wervel comes to lie
      tmp.copy(aside.WERVEL).sub(bundleTo).setLength(nokFrom.distanceTo(bundleFrom)).add(bundleTo);
      nokTo.lerp(tmp, aside.move);
    }
    if (topping.hoist > 0) {                                        // topped up: the nok goes up about the lummel
      tmp.copy(axisNow).setY(0).normalize().cross(UP);
      nokTo.sub(bundleTo).applyAxisAngle(tmp, topping.ANGLE * topping.hoist).add(bundleTo);
    }
    qBundle.setFromUnitVectors(tmp.copy(nokFrom).sub(bundleFrom).normalize(), delta.copy(nokTo).sub(bundleTo).normalize());
    const bundled = lowK > 0 || freeK > 0 || topping.hoist > 0 || aside.move > 0;
    if (bundled) { for (const set of [rolling, pulled, ringMeshes, [shaft], boomStill, gaffelSet, lacing]) swing(set); }
    // topped up, the klauw of the gaffel stays round the mast: the gaffel slides along the bundle by what
    // the turn about the lummel would have carried its klauw forward
    gaffSlide.set(0, 0, 0);
    if (topping.hoist > 0) {
      const along = delta.copy(nokTo).sub(bundleTo).normalize();
      const forward = withBundle(tmp.copy(throatTo)).x - throatTo.x;
      if (Math.abs(along.x) > 0.05) gaffSlide.copy(along).multiplyScalar(-forward / along.x);
      for (const m of gaffelSet) m.position.add(gaffSlide);
      for (const m of lacing) m.position.add(gaffSlide);
    }
    pivotRotate([stowed, binders], boomPivot, UP, boomTurn);        // made up on the giek, so where the giek swings to
    if (bundled) swing([stowed, binders]);
    // lummelbout: drawn upwards, then hanging under the giek on its borglijntje
    {
      const draw = smoothstep(clamp(strike.pin * 2, 0, 1));
      const eyeNow = bundled ? withBundle(tmp.copy(giekEye)) : tmp.copy(giekEye);
      const hangAt = delta.copy(eyeNow).setY(eyeNow.y - 0.13);
      const at = new THREE.Vector3().copy(boltMid).setY(boltMid.y + 0.085 * draw).lerp(hangAt, freeK);
      carry(lummelbout, boltMid, at, IDENTITY_Q);
      boltLine.mesh.visible = draw >= 0.05 && now.sails > 0.5;
      if (boltLine.mesh.visible) boltLine.set([eyeNow.clone(), at.clone().setY(at.y + 0.03)]);
    }
    const jibAngle = -deg(now.jib - FOK_CAD);
    pivotRotate(jibMeshes, stayTack, stayAxis, jibAngle);
    // the vallen lie in the mast's own frame once it turns, so their ends are taken back into it
    // the gaffeldraad carries the gaffel until that lies down; only then does it go slack
    qRest.copy(qGaff); if (bundled) qRest.premultiply(qBundle);
    const ridden = peakSpan.lay(smoothstep(clamp((strike.main - 0.75) / 0.25, 0, 1)), qRest.invert());
    loperRide.update(ridden); deadRide.update(ridden);
    onGaffel(peakAt.copy(hanepoot).add(ridden), tmp); if (bundled) withBundle(tmp).add(gaffSlide);
    peakHalyard.update(delta.copy(offMast(tmp, tmp)).sub(hanepoot));
    rotatedPoint(warpPoint(jibBend, clewNow.copy(jibClew)), stayTack, stayAxis, jibAngle, clewNow);
    jibSheets.knot.position.copy(clewNow);
    for (const sheet of jibSheets) laySheet(sheet, clewNow, true);
    if (kluiver?.on) {
      for (const c of [...kluiver.cloth, ...kluiver.gear]) { c.userData.of.updateMatrix(); c.matrix.multiplyMatrices(kluiver.S, c.userData.of.matrix); c.visible = c.userData.of.visible; }
      kluiver.clewNow.copy(clewNow).applyMatrix4(kluiver.S);
      // the val: from the harpje at the head, wherever that is now, over the port sheave and down to the kikker
      const harp = kluiver.gear[kluiver.gear.length - 1];
      kluiver.valTop.copy(valHarp ? valHarp.home : kluiver.top).applyMatrix4(harp.matrix);
      const over = withMast(kluiver.head.sheaves[0], tmp).clone();
      kluiver.valUp.set([kluiver.valTop.clone(), over.clone().setY(over.y + kluiver.head.radius)]);
      kluiver.valDown.set([over.clone().setY(over.y + kluiver.head.radius), withMast(V(dirkInfo.val[dirkInfo.val.length - 1]), tmp).clone()]);
      kluiver.sheets.knot.position.copy(kluiver.clewNow);
      for (const sheet of kluiver.sheets) laySheet(sheet, kluiver.clewNow, false);
    }
    onGaffel(throatEnd, tmp); if (bundled) withBundle(tmp).add(gaffSlide);
    throatHalyard.update(delta.copy(offMast(tmp, tmp)).sub(throatEnd));

    // pettenlijntje: what it has too much of hangs in a bight under the giek
    onRing(hoopStarboard, petten.from);
    petten.to.copy(petten.hole).sub(boomPivot).applyQuaternion(qYaw).add(boomPivot).addScaledVector(axisNow, aft);
    if (bundled) { withBundle(petten.from); withBundle(petten.to); }
    {
      const span = petten.from.distanceTo(petten.to);
      const bight = 0.45 * Math.sqrt(Math.max(petten.length * petten.length - span * span, 0));
      petten.path.length = 0;
      for (let i = 0; i <= 23; i++) {
        const k = i / 23; const p = new THREE.Vector3().lerpVectors(petten.from, petten.to, k);
        p.y -= bight * 4 * k * (1 - k); petten.path.push(p);
      }
      petten.rope.set(petten.path);
      petten.knot.position.copy(petten.to).addScaledVector(axisNow, 0.009);
    }
    // the blocks tilt along the line from the schootring down to the grootschootoog
    onRing(hoopCentre, hang).lerp(onRing(hoopPort, tmp), smoothstep(reef.hoop));   // the hoop the sheet is on
    if (bundled) withBundle(hang);
    sheetDir.copy(sheetEye).sub(hang).normalize();
    qa.setFromUnitVectors(DOWN, sheetDir);
    carry(upperBlock, blockTop, hang, qa);
    qa.setFromUnitVectors(UP, sheetDir.negate());
    carry(lowerBlock, blockFoot, blockFoot, qa);
    // reeve the sheet: both blocks have the same tilt qa, their sheaves stand fore and aft
    sheetDir.negate();                                              // now points down the sheet again
    ex.copy(FORE).applyQuaternion(qa);
    const upperAt = (p, out) => out.copy(p).sub(blockTop).applyQuaternion(qa).add(hang);
    const lowerAt = (p, out) => out.copy(p).sub(blockFoot).applyQuaternion(qa).add(blockFoot);
    upperAt(tackle.becket, fallPath[0]);
    away.copy(sheetDir);                                            // under a lower sheave
    turn(1, lowerAt(tackle.lower[0], centre), away, 1);
    away.negate();                                                  // over the upper sheave
    turn(1 + TURN, upperAt(tackle.upper, centre), away, -1);
    // the hauling part leaves the second lower sheave towards the hand of the helmsman, who
    // sits to windward: opposite the giek
    handNow.copy(tackle.hand); handNow.z *= -clamp(now.boom / 8, -1, 1) || 1;
    away.negate();
    lowerAt(tackle.lower[1], centre);
    tmp.copy(handNow).sub(centre).normalize();
    const rise = Math.atan2(-tmp.dot(away), -tmp.dot(ex));         // how far above "straight aft" the hand is
    turn(1 + 2 * TURN, centre, away, 1, Math.PI / 2 + clamp(rise, -0.6, 1.4));
    sheetFall.set(fallPath);
    haulPath.length = 0;
    const leave = fallPath[fallPath.length - 1];
    for (let i = 0; i <= 10; i++) {                                 // to the hand, with a little slack
      const p = new THREE.Vector3().lerpVectors(leave, handNow, i / 10);
      p.y -= 0.04 * Math.sin((Math.PI * i) / 10); haulPath.push(p);
    }
    for (let i = 1; i <= 6; i++) {                                  // the end hangs from the hand onto the achterdek
      const k = i / 6;
      haulPath.push(new THREE.Vector3(handNow.x - 0.06 * k * k, THREE.MathUtils.lerp(handNow.y, sheetInfo.dek_m, k), handNow.z));
    }
    for (let i = 1; i <= 5; i++) haulPath.push(new THREE.Vector3(handNow.x - 0.06 - 0.07 * i, sheetInfo.dek_m, handNow.z * (1 - 0.04 * i)));
    sheetHaul.set(haulPath);
    // Bellies to leeward: the side the sail stands on, flat while it crosses the boat. For the
    // fok that also turns it inside out when it is set to windward (fok te loevert).
    mainBend.flutter = 0.16 * now.flutter * (1 - smoothstep(strike.main)); mainBend.time = now.t;
    mainBend.set(now.mainBend * clamp(now.boom / 8, -1, 1), phi, reef.slack);
    // the roll turns and goes aft with the giek; it is scaled about the giek's axis to the size it has grown to
    reefRoll.visible = mainBend.rollRadius > 0 && now.sails > 0.5;
    if (reefRoll.visible) {
      const size = mainBend.rollRadius;
      reefRoll.scale.set(1, size, size);
      reefRoll.quaternion.copy(qYaw);
      tmp.set(0, boomPivot.y * (1 - size), boomPivot.z * (1 - size));       // scaling is about the origin: put the axis back
      reefRoll.position.copy(tmp).sub(boomPivot).applyQuaternion(qYaw).add(boomPivot).addScaledVector(axisNow, aft);
      if (bundled) swing([reefRoll]);                               // rolled round the giek, so in the mik or topped up with it
    }
    {
      // kraanlijn: wervel -> over the block -> down the mast to its kikker
      rotatedPoint(dirkEnd, boomPivot, UP, boomTurn, wervelNow);
      if (bundled) withBundle(wervelNow);
      const sheaveNow = withMast(dirkSheave);
      dirkKnot.position.copy(wervelNow).addScaledVector(tmp.set(-1, 0, 0).applyAxisAngle(UP, boomTurn), 0.009);
      const r = dirkDouble.radius + dirkInfo.straal_m;
      const belly = Math.max(0, mainBend.depth) * bellyMax;           // only a belly to port pushes it out
      bellyDir.copy(mainBend.normal).applyAxisAngle(UP, boomAngle);
      tmp.copy(wervelNow).sub(sheaveNow).setY(0).normalize();         // horizontally from the block towards the nok
      dirkPath.length = 0;
      for (let i = 0; i <= 20; i++) {                                 // the slack span
        const k = i / 20; const hang = Math.sin(Math.PI * k);
        const p = new THREE.Vector3().lerpVectors(wervelNow, sheaveNow, k).addScaledVector(tmp, (1 - k) * 0 + k * r);
        p.y -= 0.30 * hang * (1 - lowered);
        // to port of the sail the whole way: from the nok it runs inside the sail's triangle and crosses
        // the gaffel a hand's breadth aft of the mast, so it is held off the plane of the sail, and
        // further out where the belly comes towards it; only at either end does it come back to the line
        p.addScaledVector(bellyDir, 0.9 * belly * hang + DIRK_CLEAR * (1 - lowered) * Math.min(1, k / 0.06, (1 - k) / 0.06));
        if (i === 20) p.copy(sheaveNow).addScaledVector(tmp, r);
        dirkPath.push(p);
      }
      // whatever the run still comes within DIRK_CLEAR of the cloth - the belly bulges towards it - is
      // pushed out along the sail's normal, point by point against the cloth as it stands this frame
      for (const p of dirkPath) {
        let near = Infinity; let nz = 0;
        for (const m of mainCloth) {
          const pos = m.geometry.attributes.position; m.updateMatrixWorld();
          for (let i = 0; i < pos.count; i += 3) {
            const d = dirkProbe.fromBufferAttribute(pos, i).applyMatrix4(m.matrixWorld).distanceToSquared(p);
            if (d < near) { near = d; nz = dirkProbe.dot(bellyDir); }
          }
        }
        const short = DIRK_CLEAR - (p.dot(bellyDir) - nz);
        if (near < DIRK_CLEAR * DIRK_CLEAR * 4 && short > 0) p.addScaledVector(bellyDir, short);
      }
      for (let i = 1; i <= 6; i++) {                                  // over the sheave
        const a = (Math.PI * i) / 6;
        dirkPath.push(new THREE.Vector3().copy(sheaveNow).addScaledVector(tmp, r * Math.cos(a)).addScaledVector(UP, r * Math.sin(a)));
      }
      dirk.set(dirkPath);
      dirkDown.set([dirkPath[dirkPath.length - 1], ...dirkFall.map((p) => withMast(p))]);
    }
    mainBend.warpKey = strike.main * 7 + strike.furl; jibBend.warpKey = strike.jib;
    layAnchor();
    slideHanks(smoothstep(strike.jib));
    jibBend.flutter = 0.05 * now.flutter * (1 - smoothstep(strike.jib)); jibBend.time = now.t + 1.3;
    jibBend.set(now.jibBend * jibInfo.reikwijdte_m * clamp(now.jib / 10, -1, 1));
    setOpacity(sailRig, now.sails);
    // made up: the cloth gives way to the roll on the giek, and the binders go on
    // fok taken off: lifted clear of the stay, then gone, with all that belongs to it
    {
      const off = smoothstep(strike.fokoff);
      for (const m of jibMeshes) { m.position.y += 0.25 * off; if (off > 0.7) m.visible = false; }   // posed afresh every frame
      for (const m of fokGear) { m.position.y = 0.25 * off; m.visible = off <= 0.7 && now.sails > 0.02; }   // these are not: set, never added to
      // the harpje of the fokkenval comes down the stay with the head of the fok, the val paying out
      // after it; once the fok is off, the val is hauled back up to where it was
      if (valHarp) {
        // `at` is where the harpje is now; the displacement is worked out on a vector of its own
        const at = warpPoint(jibBend, valHarp.at.copy(valHarp.home));
        const down = valHarp.down.subVectors(at, valHarp.home).multiplyScalar(1 - off);
        for (const m of valHarp.meshes) m.position.add(down);
        valHarp.rope.mesh.visible = down.lengthSq() > 1e-6 && now.sails > 0.5;
        if (valHarp.rope.mesh.visible) valHarp.rope.set([valHarp.home, at.copy(valHarp.home).add(down)]);
      }
      if (off > 0.7) for (const m of byId.get('fokkenschoot').meshes) m.visible = false;
      for (const m of grendel) m.visible = strike.grendel <= 0.97;
      if (strike.pin > 0.03) for (const m of borglijn) m.visible = false;   // the live line to the hanging bout takes over
    }
    // wanten: straight while the mast stands; with it down they hang slack over the mik
    for (const w of shrouds) {
      const live = strike.mast > 0.001;
      w.old.visible = !live; w.rope.mesh.visible = live;
      if (!live) continue;
      const k = smoothstep(strike.mast); const topNow = withMast(w.top);
      const over = new THREE.Vector3(MIK_X, mikPose.standing.y + 1.19, w.side * 0.035);   // in the fork, beside the mast
      const path = [w.foot];
      for (let i = 1; i < 12; i++) {
        const t = i / 12; const p = new THREE.Vector3().lerpVectors(w.foot, topNow, t);
        const viaMik = t < 0.55 ? new THREE.Vector3().lerpVectors(w.foot, over, t / 0.55) : new THREE.Vector3().lerpVectors(over, topNow, (t - 0.55) / 0.45);
        viaMik.y -= 0.12 * Math.sin(Math.PI * (t < 0.55 ? t / 0.55 : (t - 0.55) / 0.45));
        path.push(p.lerp(viaMik, k));
      }
      path.push(topNow);
      w.rope.set(path);
    }
    const madeUp = strike.furl > 0.75 && now.sails > 0.5;
    if (madeUp) for (const m of clothMeshes) m.visible = false;
    stowed.visible = madeUp;
    binders.visible = strike.ties > 0.02 && now.sails > 0.5; binders.scale.setScalar(1);
    for (const b of binders.children) b.visible = strike.ties > (b.position.x < 1.5 ? 0.15 : b.position.x < 2.5 ? 0.5 : 0.85);

    // wind arrow: out on the water to windward, pointing at the middle of the boat
    wind.visible = now.wind > 0.05;
    for (const m of wind.userData.materials) m.opacity = 0.85 * now.wind;
    const tail = 4.4 + 1.9;                                         // the arrow is 1.9 m long, tip 4.4 m out
    wind.position.set(2.8 + tail * Math.cos(now.windAngle), tuig.waterlijn_m + 0.02, tail * Math.sin(now.windAngle));
    wind.rotation.y = Math.PI - now.windAngle;
    vane.quaternion.setFromAxisAngle(UP, -now.windAngle).premultiply(qMast);   // its frame points into the wind
    withMast(tmp.copy(mastHead).setY(mastHead.y + 0.06), vane.position);
    withMast(tmp.copy(mastHead).setY(mastHead.y + 0.02), toplicht.position);
    // paint() in main.js blacks out emissive on every part when the highlighting is refreshed, so
    // the lamp writes its own back here, every frame. A highlight colour is left where it is: while
    // the part is hovered or picked the highlighting has it, and the lamp takes over again after.
    const glass = toplicht.material; const was = glass.emissive.getHex();
    if (was === 0 || was === lamp.hex) {
      glass.emissive.setHex(0xfff2c0); lamp.hex = glass.emissive.getHex();
      glass.emissiveIntensity = 2.5 * lamp.k;
    }
    toplichtHalo.visible = lamp.k > 0.01;
    toplichtHalo.material.opacity = lamp.k;
    helm.angle += (helm.target - helm.angle) * (1 - Math.exp(-dt * 12));
    pivotRotate(rudderMeshes, rudderFoot, rudderAxis, helm.angle);
    helm.qTurn.setFromAxisAngle(rudderAxis, helm.angle);
    borg?.chain.update(delta.copy(rotatedPoint(borg.eye, rudderFoot, rudderAxis, helm.angle, tmp)).sub(borg.eye));
    flyFlag(now.t, now.windAngle, now.wind, 1 - now.sculling, helm.qTurn);   // no flag while wrikken: the riem needs the room
    layChill(step, struck);
    leechFlag.k = clamp(leechFlag.k + (leechFlag.on ? dt : -dt) / 1.5, 0, 1);   // it fades in and out, a second and a half
    leechFlag.fly.mesh.visible = leechFlag.k > 0;
    if (leechFlag.k > 0) {
      leechFlag.fly.setOpacity(smoothstep(leechFlag.k));
      leechFlag.tape.updateMatrix();
      const pos = leechFlag.tape.geometry.attributes.position;
      leechFlag.at.forEach((i, j) => leechFlag.points[j].fromBufferAttribute(pos, i).applyMatrix4(leechFlag.tape.matrix));
      leechFlag.fly(now.t, now.windAngle, now.wind, leechFlag.points);
    }

    // wrikriem: a figure of eight over the wrikgat, blade twisting
    const th = (now.t * 2 * Math.PI) / 1.6;
    dir.set(-Math.cos(SCULL_PITCH), -Math.sin(SCULL_PITCH), 0).applyAxisAngle(UP, 0.2 * (1 + 0.9 * swell.k) * Math.sin(th) * now.sculling);
    poseOar(scullOar, now.sculling, wrikgat, dir, -0.65 * Math.cos(th) * now.sculling);
    stowOar(scullOar, now.sculling);
    // the boat rolls about its waterline
    boat.quaternion.setFromAxisAngle(ROLL_AXIS, swell.roll);
    boat.position.copy(rollAt).sub(tmp.copy(rollAt).applyQuaternion(boat.quaternion));

    // roeiriemen: all in time, one stroke per 3.2 s
    if (state.mode === 'roeien') state.rowPhase = (state.rowPhase + dt / 3.2) % 1;
    const stroke = state.rowPhase * 2 * Math.PI;
    const pull = Math.sin(stroke);                                  // > 0: blade in the water, moving aft
    const feather = smoothstep(clamp(pull * 3 + 0.5, 0, 1));        // upright while pulling
    const seats = ROWING[state.rowing];
    const ease = 1 - Math.exp(-step * 2.5);
    // mik: up in its holders when the sails are struck onto it, or when set by hand; not for rowing or sculling
    mikPose.up += ((strike.mik > 0.05 ? 1 - Math.max(topping.mikOff, aside.mikOff) : mikPose.byHand ?? 0) - mikPose.up) * (1 - Math.exp(-step * 1.8));
    {
      const k = smoothstep(clamp(mikPose.up, 0, 1));
      mik.position.lerpVectors(mikPose.stowed, mikPose.standing, k);
      mik.position.y += 0.55 * Math.sin(Math.PI * k);              // carried over in an arc, not dragged through the boat
      mik.quaternion.slerpQuaternions(mikPose.flat, mikPose.upright, k);
    }
    for (const d of dollen) { d.wanted = 0; d.busy = false; }
    const easePose = 1 - Math.exp(-step * 3.2);
    for (const [key, oar] of Object.entries(rowOars)) {
      const out = oar.byHand ?? (state.mode === 'roeien' && seats[key] ? 1 : 0);   // shipped by the mode, or by a click
      const seat = out ? seats[key] ?? ROWING.kruis[key] ?? ROWING.vier[key] : null;
      const order = COMMANDS[state.commando[oar.side > 0 ? 'sb' : 'bb']];
      const pose = oar.pose;
      for (const k of ['power', 'yaw', 'roll', 'inboard', 'stand', 'given']) pose[k] += ((k === 'yaw' ? deg(order.yaw) : order[k]) - pose[k]) * easePose;
      if (oar.byHand === 1) pose.given += (1 - order.given) * easePose;   // put out by hand, also after "geroeid"
      pose.down += (deg(order.down) - pose.down) * easePose;
      oar.pivot.copy(oar.handle).addScaledVector(oar.axis, pose.inboard);
      const inDol = seat && dollen.find((d) => d.key === seat);
      oar.use += ((seat ? 1 : 0) - oar.use) * ease;                 // an oar that is not needed goes back
      if (seat) oar.dol.lerp(dol[seat], ease);
      const spareOar = key.endsWith('2');
      const weight = oar.use * (spareOar ? 1 : pose.given);         // geroeid: back where it is stowed
      for (const m of oar.meshes) if (spareOar) m.visible = weight * pose.given > 0.02;   // the second pair only exists while in use
      // halen and strijken are the same stroke run the other way; "haalt op… gelijk" waits between strokes
      const swing = order.strokes ? Math.min(((now.t % 4.6) / 3.2), 1) * 2 * Math.PI : stroke;
      const way = Math.sign(pose.power) || 1; const hard = Math.abs(pose.power);
      const bite = Math.sin(swing * way);                            // > 0: blade in the water
      const upright = THREE.MathUtils.lerp(pose.roll, smoothstep(clamp(bite * 3 + 0.5, 0, 1)), hard);
      const sweep = (state.rowLength * Math.cos(swing) * hard * oar.side - pose.yaw * oar.side) * weight;
      const down = pose.down + deg(6) * bite * hard * weight;
      dir.set(0, -Math.sin(down), oar.side * Math.cos(down)).applyAxisAngle(UP, sweep);
      // riemen op: the oar stands on the vlonder by the rower, not in its dol
      tmp0.copy(oar.dol).lerp(tmp1.set(oar.dol.x + 0.12, 0.26, oar.dol.z * 0.45), smoothstep(clamp(pose.stand, 0, 1)));
      poseOar(oar, weight, tmp0, dir, (Math.PI / 2) * upright * oar.side);
      stowOar(oar, weight);
      if (inDol && pose.given > 0.5) { inDol.wanted = 1; inDol.busy = true; inDol.yaw = sweep; }   // the oar brings its dol
    }
    // which way that takes the boat: an arrow on the water, ahead of the bow or astern
    {
      const sb = COMMANDS[state.commando.sb].drive; const bb = COMMANDS[state.commando.bb].drive;
      const ahead = sb + bb; const turn = sb - bb;                  // turn > 0: starboard pulls harder, the bow goes to port
      const moving = state.mode === 'roeien' && (Math.abs(ahead) > 0.01 || Math.abs(turn) > 0.01) && Math.max(Math.abs(sb), Math.abs(bb)) > 0.6;
      courseArrow.visible = moving && now.rowing > 0.5;
      if (courseArrow.visible) {
        const astern = ahead < -0.01;
        const swing = Math.atan2(turn * 0.5, Math.abs(ahead));       // 0 straight, 26 flauw, 56 scherp, 90 zeer scherp (degrees)
        courseArrow.position.set(astern ? -0.6 : 6.1, tuig.waterlijn_m + 0.02, 0);
        courseArrow.rotation.y = astern ? Math.PI - swing : swing;  // about +y: positive turns the arrow to port
      }
    }
    {
      const end = 3;                                                // a second a stage
      if (bench.want && bench.row && bench.row !== benchRow() && bench.t >= end) bench.want = false;   // rowing, or another dol put up
      const goal = bench.want ? end : 0; const gap = goal - bench.t;
      bench.t = Math.abs(gap) <= step ? goal : bench.t + Math.sign(gap) * step;
      bench.at = bench.t / end;
      if (bench.at !== bench.shown) { bench.shown = bench.at; layBench(); }
    }
    for (const d of dollen) {
      if (!d.busy && d.byHand !== undefined) d.wanted = d.byHand;   // shipped or unshipped by a click
      if (bench.t > 0 && bench.row && d.key.endsWith(bench.row)) { d.wanted = 1; d.yaw = 0; }   // they hold the doft until it is out
      d.seated += (d.wanted - d.seated) * (1 - Math.exp(-step * 2.2));
      // out of the pot in two moves: lifted straight up until the pin is clear, then swung over
      // inboard about its eye until it hangs upside down on the chain
      const lift = smoothstep(clamp((1 - d.seated) / 0.45, 0, 1));
      const over = smoothstep(clamp((1 - d.seated - 0.4) / 0.6, 0, 1));
      eyeAt.set(0, d.eye.y + DOL_LIFT * lift, 0).lerp(d.hang, over).add(d.pot);
      dolQ.setFromAxisAngle(FORE_AXIS, -d.side * Math.PI * over);
      dolQ.multiply(dolYaw.setFromAxisAngle(UP, d.yaw * d.seated));  // in use it turns with the oar
      carry([d.node], d.eye, eyeAt, dolQ);
      // the chain: from the eye, over the rim once the dol is outside, down the bore to the knevel
      chainPath.length = 0;
      rim.set(0, 0.003, -d.side * POT_RIM).add(d.pot);
      const outside = over > 0.02 ? eyeAt.distanceTo(rim) : 0;
      const top = outside ? d.pot.y : eyeAt.y;
      const knevelY = Math.min(top - (DOL_CHAIN - outside), d.pot.y - POT_LENGTH - 0.004);
      chainPath.push(eyeAt);
      if (outside) chainPath.push(rim, tmp.set(d.pot.x, d.pot.y - 0.012, d.pot.z).clone());
      const landing = d.bed[0];
      if (landing && knevelY < landing.y) {                         // more chain than drop: the rest lies on the kim
        let left = landing.y - knevelY;
        chainPath.push(landing);
        for (let i = 1; i < d.bed.length && left > 0; i++) {
          const step = d.bed[i].distanceTo(d.bed[i - 1]);
          chainPath.push(step <= left ? d.bed[i] : new THREE.Vector3().lerpVectors(d.bed[i - 1], d.bed[i], left / step));
          left -= step;
        }
      } else chainPath.push(new THREE.Vector3(d.pot.x, knevelY, d.pot.z));
      layChain(d.chain.userData.links, chainPath);
      d.knevel.position.copy(chainPath[chainPath.length - 1]).sub(d.knevel.userData.ring);
    }
  }

  // -- UI: one bar of icon buttons along the bottom; each one opens its control in a popover
  const bar = $('controls');
  const popovers = ['mode', 'wind', 'reef', 'rig', 'oars', 'cmd'].map((key) => ({
    key, button: $(`${key}-toggle`), panel: $(`${key}-panel`),
  }));
  let opened = null;
  /** Centre a panel over its own icon, but keep it inside the viewer - not inside the window. */
  const place = ({ button, panel }) => {
    const EDGE = 8;
    const box = button.getBoundingClientRect();
    const frame = wrap.getBoundingClientRect();
    const room = Math.max(frame.left + EDGE, frame.right - panel.offsetWidth - EDGE);
    const x = Math.min(Math.max(box.left + box.width / 2 - panel.offsetWidth / 2, frame.left + EDGE), room);
    panel.style.left = `${x - bar.getBoundingClientRect().left}px`;
  };
  const openPopover = (control) => {                                // null closes; only ever one open
    if (opened === control) return;
    if (opened) { opened.panel.hidden = true; opened.button.setAttribute('aria-expanded', 'false'); }
    opened = control;
    if (!control) return;
    control.panel.hidden = false;
    control.button.setAttribute('aria-expanded', 'true');
    place(control);
  };
  for (const control of popovers) {
    control.button.addEventListener('click', () => openPopover(opened === control ? null : control));
  }
  // a press outside the bar closes the popover; the event is retargeted to the host on its way out
  // of the shadow root, so what it really started on has to be read from its composed path
  document.addEventListener('pointerdown', (e) => {
    if (opened && !e.composedPath().includes(bar)) openPopover(null);
  }, { signal });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && opened && engaged()) { opened.button.focus(); openPopover(null); }
  }, { signal });
  onResize(() => { if (opened) place(opened); });
  /** An icon that does not apply to the mode goes away and takes its popover with it. */
  const relevant = (key, applies) => {
    const control = popovers.find((c) => c.key === key);
    control.button.hidden = !applies;
    if (!applies && opened === control) openPopover(null);
  };

  // -- the mirrored course slider, in the wind popover
  const windPanel = $('wind-panel');
  const slider = $('course');
  const markers = $('course-markers');
  const ticks = windPanel.querySelector('.ticks');
  const needle = $('wind-needle');

  const toSlider = (course) => (course === 0 ? 0 : Math.sign(course) * (Math.abs(course) - CLOSE_HAULED + HEAD_GAP));
  const nameOf = (course) => {
    if (course === 0) return HEAD_TO_WIND;
    const c = Math.abs(course);
    const m = c >= DOWNWIND ? MARKERS[3] : c >= 112 ? MARKERS[2] : c >= 68 ? MARKERS[1] : MARKERS[0];
    return `${m.label}${m.sub ? `, ${m.sub.toLowerCase()}` : ''}, wind over ${course < 0 ? 'bakboord' : 'stuurboord'}`;
  };
  const setCourse = (course) => {
    state.course = course;
    slider.value = String(toSlider(course));
    slider.setAttribute('aria-valuetext', nameOf(course));
    needle.setAttribute('transform', `rotate(${Math.round(course)} 12 12)`);   // the cloud sits where the wind comes from, the bow being up
    for (const b of markers.querySelectorAll('button')) b.setAttribute('aria-pressed', String(Number(b.dataset.course) === course));
    trimBoard();
  };
  const fromSlider = (value) => {                                   // the middle of the gap is kop in de wind, its sides aan de wind
    if (Math.abs(value) < HEAD_GAP / 2) return 0;
    return Math.sign(value) * (CLOSE_HAULED + Math.max(Math.abs(value) - HEAD_GAP, 0));
  };
  // The midzwaard has no control of its own: a click on it or its zwaardloper sets it a stop further,
  // and it follows the boat - up for rowing, sculling, running before the wind and lying at anchor,
  // down again otherwise (it moves when that changes, so what was set by hand in between is left
  // alone). An anchor let go by the Tuig procedure is not counted: that raises it in a step of its own.
  const setBoard = (value) => { holdBolt(); state.midzwaard = value; };   // it takes its bolt to be set at all
  let boardRaised = null;
  const trimBoard = () => {
    const anchored = anchorGear && rigging.t < 1e-6 && anchorGear.u > 0.999 && !anchorGear.lost;   // an anchor on the bottom astern holds nothing
    const up = state.mode !== 'zeilen' || Math.abs(state.course) >= RUN || anchored;
    if (up === boardRaised) return;
    boardRaised = up;
    if (up) setBoard('op'); else if (state.midzwaard === 'op') setBoard('neer');
  };

  // reven: the number of turns of the giek
  const reefSlider = $('reef');
  const reefValue = $('reef-value'); const reefCount = $('reef-count');
  reefSlider.max = String(reefInfo.max_slagen);
  let reefWanted = 0;                                               // what the slider was last let go on
  const setReef = (turns) => {
    reefWanted = turns;
    reefSlider.value = String(turns);
    reefValue.textContent = turns === 0 ? 'geen' : `${turns} ${turns === 1 ? 'slag' : 'slagen'} om de giek`;
    reefCount.textContent = String(turns); reefCount.hidden = turns === 0;
    planReef(turns);
  };
  reefSlider.addEventListener('change', () => { setReef(Number(reefSlider.value)); openPopover(null); });
  reefSlider.addEventListener('input', () => {
    const turns = Number(reefSlider.value);
    reefValue.textContent = turns === 0 ? 'geen' : `${turns} ${turns === 1 ? 'slag' : 'slagen'} om de giek`;
  });

  // Roeicommando. "Op… slag", "riemen… over", "riemen… op" and "riemen… geroeid" are given to the
  // whole boat and never to one boord, so they have a group of their own above the two boorden;
  // what is left is what a roerganger does call per boord, to turn the boat ("bakboord strijkt,
  // stuurboord haalt op"). A per-side choice leaves the other boord exactly as it was.
  const cmdButtons = all('#cmd-panel button');
  const spoken = $('cmd-spoken');
  for (const b of cmdButtons) {                                     // namen.commandos renames the button
    const label = knopVan(b.dataset.commando);
    if (label) b.textContent = label;
  }
  const setCommando = (boord, commando) => {
    if (boord === 'beide') { state.commando.bb = commando; state.commando.sb = commando; }
    else state.commando[boord] = commando;
    for (const b of cmdButtons) {
      const group = b.parentElement.dataset.boord;
      const pressed = group === 'beide'
        ? state.commando.bb === b.dataset.commando && state.commando.sb === b.dataset.commando
        : state.commando[group] === b.dataset.commando;
      b.setAttribute('aria-pressed', String(pressed));
    }
    const { bb, sb } = state.commando;
    const words = bb === sb ? (COMMANDS[bb].say ? `Bakboord, stuurboord ${COMMANDS[bb].say}` : '')
      : [['Bakboord', bb], ['Stuurboord', sb]].filter(([, c]) => COMMANDS[c].say).map(([name, c], i) => `${i ? name.toLowerCase() : name} ${COMMANDS[c].say}`).join(', ');
    // "op… riemen" comes first, except before the two commando's that have to be obeyed at once
    const first = [bb, sb].every((c) => COMMANDS[c].atOnce) ? '' : 'Op… riemen. ';
    spoken.textContent = `“${first}${words}${words ? '.' : ''}”`.replace('. ”', '.”').replace('“Op… riemen. ”', '“Op… riemen.”');
  };
  for (const b of cmdButtons) {
    b.addEventListener('click', () => {
      setCommando(b.parentElement.dataset.boord, b.dataset.commando);
      openPopover(null);                                            // like the other choices that set the boat going
    });
  }
  setCommando('beide', state.commando.bb);

  // tuig: sails set or struck
  const rigButtons = all('#rig-panel button');
  const setRig = (rig) => {
    state.rig = rig;
    for (const b of rigButtons) b.setAttribute('aria-pressed', String(b.dataset.rig === rig));
    planStrike(rig);
    relevant('wind', state.mode === 'zeilen' && rig === 'op');       // nothing to trim or reef with the sails down
    relevant('reef', state.mode === 'zeilen' && rig === 'op');
  };
  for (const b of rigButtons) b.addEventListener('click', () => { setRig(b.dataset.rig); openPopover(null); });

  const rowButtons = all('#oars-panel button');
  const oarCount = $('oar-count');
  const setRowing = (rowing) => {
    state.rowing = rowing;
    oarCount.textContent = rowing === 'vier' ? '4' : '2';
    for (const b of rowButtons) b.setAttribute('aria-pressed', String(b.dataset.rowing === rowing));
  };
  for (const b of rowButtons) b.addEventListener('click', () => { setRowing(b.dataset.rowing); openPopover(null); });

  const modeButtons = all('#mode-panel button');
  const modeGlyphs = all('#mode-toggle [data-mode]');
  /** Let the anchor go (true) or weigh it (false) by hand, whatever the Tuig procedure did with it. */
  const weighAnchor = (out) => {
    if (!anchorGear || (anchorGear.want > 0.5) === out) return;
    if (anchorGear.lost && out) return;                             // there is nothing on the end of it to let go
    anchorGear.want = out ? 1 : 0;
    if (rigging.t > 1e-6) anchorGear.byHand = true;
  };
  const setMode = (mode) => {
    state.mode = mode;
    for (const d of dollen) d.byHand = undefined;                   // a new mode puts dollen, riemen and mik where they belong in it
    for (const oar of [...Object.values(rowOars), scullOar]) oar.byHand = undefined;
    mikPose.byHand = undefined;
    if (mode !== 'zeilen') weighAnchor(false);                      // at anchor there is no rowing
    if (mode === 'roeien') bench.want = false;                     // the doft is needed to row from
    trimBoard();
    for (const b of modeButtons) b.setAttribute('aria-pressed', String(b.dataset.mode === mode));
    for (const g of modeGlyphs) g.toggleAttribute('hidden', g.dataset.mode !== mode);   // the icon shows the mode
    relevant('wind', mode === 'zeilen' && (state.rig ?? 'op') === 'op');   // the wind only trims sails
    relevant('oars', mode === 'roeien');
    relevant('cmd', mode === 'roeien');
    relevant('reef', mode === 'zeilen' && (state.rig ?? 'op') === 'op');   // no sail, nothing to reef
    relevant('rig', mode === 'zeilen');
    if (opened) place(opened);                                      // the bar re-centres as icons come and go
  };

  slider.min = String(-SLIDER_MAX); slider.max = String(SLIDER_MAX);
  for (const side of [-1, 1]) {
    for (const m of MARKERS) {
      const course = side * m.course;
      const b = Object.assign(document.createElement('button'), { type: 'button', textContent: m.label });
      b.dataset.course = String(course);
      const at = (c) => `${((toSlider(c) + SLIDER_MAX) / (2 * SLIDER_MAX)) * 100}%`;
      b.style.left = at(course);
      if (m.sub) b.append(Object.assign(document.createElement('span'), { className: 'sub', textContent: m.sub }));
      if (m.course === RUN) b.classList.add(side < 0 ? 'end-left' : 'end-right');   // at the very end: kept inside the panel
      if (m.course === 90) b.classList.add('r1');                    // rows up, where the viewer is narrow
      if (m.course === 135) b.classList.add('r2');
      if (m.course === CLOSE_HAULED) b.classList.add(side < 0 ? 'near-left' : 'near-right');   // nudged to keep clear of its neighbours
      b.addEventListener('click', () => setCourse(course));
      markers.append(b);
      const tick = document.createElement('span');
      tick.style.left = at(course);
      ticks.append(tick);
    }
  }
  {
    const b = Object.assign(document.createElement('button'), { type: 'button', textContent: HEAD_TO_WIND, className: 'upper' });
    b.dataset.course = '0'; b.style.left = '50%';
    b.addEventListener('click', () => setCourse(0));
    markers.append(b);
    const tick = document.createElement('span'); tick.style.left = '50%'; ticks.append(tick);
  }
  for (const [text, left] of [['wind over bakboord', '25%'], ['wind over stuurboord', '75%']]) {
    const caption = Object.assign(document.createElement('span'), { className: 'caption', textContent: text });
    caption.style.left = left;
    markers.append(caption);
  }
  slider.addEventListener('input', () => setCourse(fromSlider(Number(slider.value))));
  for (const b of modeButtons) b.addEventListener('click', () => { setMode(b.dataset.mode); openPopover(null); });
  setCourse(state.course); setRowing(state.rowing); setMode(state.mode);

  /** A click on a part that can be shifted by hand: a dol goes in or out of its pot (not while an
   *  oar is being pulled in it), the mik up into its holders or back onto the buikdenning. */
  let trail = []; let flagChanged = false; let lastFender = null; let fenderAt = 0;
  const DOUBLE_MS = 450;                                            // two clicks this close together are one double click
  // some parts clicked one after the other do something between them: the ids (packed), what is
  // done, and whether that is all the click does
  const RUNS = [
    ['GC1IUm6BttDEAiNPbcWdud3yESpJZZa1oM0=', () => tow && (tow.want = !tow.want, true), true],
    ['HS5CRXKPt9PtAT9eKpaHs9fwEiRAXoK7tt4=', () => tow && (tow.want = !tow.want, true), true],
    ['AyBDUnWPtJfzASJPYYSG9trhEy5MYI0=', () => bowsprit && (setBowsprit(!bowsprit.want), true)],
    ['DDNCWGqUvN73PzZPY4mfs9nlE2tAc4+7p8PoEzpjfoq4xPDvHDhXO42oyuwDNj1fcq69x+cQPUJYcJI=', () => (leechFlag.set(!leechFlag.on), true)],
    ['Dy5LQ0GYttjpQDZda4SZstnhDj8=', () => {
      if (bench.want || bench.t !== 0 || state.mode === 'roeien' || !placePlank(Math.sign(state.course) || 1)) return false;
      bench.row = null; bench.want = true; note('wp');
      if (!flagChanged) { flagChanged = true; flyFlag.change(); }
      return true;
    }],
  ].map(([ids, act, ends = false]) => ({ ids: unpack(ids).split(' '), act, ends }));
  const ranOut = () => RUNS.find((r) => r.ids.length <= trail.length
    && r.ids.every((x, i) => x === trail[trail.length - r.ids.length + i]) && r.act());
  const click = (part, hit = null) => {
    const id = part?.extras.id ?? '';
    // a stootwil taken in hand waits for the place it is to go: any other click puts it back down
    const inHand = armed; armed = null;
    if (hit?.object === water) {
      if (inHand && !inHand.sea) toSea(inHand, hit.point);
      trail = []; return;
    }
    trail = [...trail.slice(-2), id];
    const run = ranOut();
    if (run) { trail = []; if (run.ends) return; }
    // a riem goes out into its dol or back onto the doften (the dol follows by itself)
    const oar = Object.values(rowOars).find((o) => o.meshes.includes(hit?.object)) ?? (id === 'riem_sb' ? rowOars.sb : id === 'riem_bb' ? rowOars.bb : null);
    // a stootwil goes overboard or comes back in, each one on its own
    const fender = stootwillen.find((w) => w.meshes.includes(hit?.object));
    // out of the water it is hauled back to the rail
    const stamp = performance.now();
    const twice = fender && fender === lastFender && stamp - fenderAt < DOUBLE_MS;
    if (fender?.sea) { if (!fender.sea.back) fromSea(fender); }
    else if (twice) { fender.want = 1; armed = fender; }
    else if (fender) fender.want = fender.want > 0.5 ? 0 : 1;
    lastFender = fender ?? null; fenderAt = fender ? stamp : 0;
    if (oar) oar.byHand = oar.use * oar.pose.given > 0.5 ? 0 : 1;
    if (id === 'wrikriem') scullOar.byHand = now.sculling > 0.5 ? 0 : 1;
    // with the sails down, gear put out by hand that makes a way of going on is that way of going on:
    // both riemen in their dollen is rowing, the wrikriem in the wrikgat is sculling
    if (rigging.t >= RIG_AT.gestreken - 1e-6) {
      if (oar && state.mode !== 'roeien' && rowOars.sb.byHand === 1 && rowOars.bb.byHand === 1) {
        if (state.rowing === 'vier') setRowing('kruis');            // two riemen: not four
        setMode('roeien');
      } else if (id === 'wrikriem' && state.mode !== 'wrikken' && scullOar.byHand === 1) setMode('wrikken');
    }
    const d = dollen.find((x) => id === `dol_${x.key}` || id === `dolketting_${x.key}`);
    if (d && bench.t > 0 && bench.row && d.key.endsWith(bench.row)) bench.want = false;   // the doft comes out first
    else if (d && !d.busy) d.byHand = d.seated > 0.5 ? 0 : 1;
    if (id === 'doft_voor') {
      const row = benchRow();
      if (bench.want || bench.t > 0) { bench.want = false; trail = []; }
      else if (row) { bench.row = row; placeBench(row); bench.want = true; note('rl'); }
    }
    if (id === 'mik' || id === 'mikhouders') {
      // with the sails made up in it, the mik is freed by topping the giek up in the kraanlijn (and back)
      const madeUp = strike.ties > 0.99 && strike.low < 0.01 && rigging.resting;
      if (madeUp) topping.want = topping.want > 0.5 ? 0 : 1; else mikPose.byHand = mikPose.up > 0.5 ? 0 : 1;
    }
    // the zwaardloper (or its borgpen) sets the midzwaard one stop further: neer, half, op and round again
    if (id === 'zwaard' || id.startsWith('zwaardloper') || id === 'borgpen' || id === 'kettinkje') setBoard({ neer: 'half', half: 'op', op: 'neer' }[state.midzwaard]);
    if (id === 'zwaardbout' && bolt.down) holdBolt();              // picked up off the buikdenning: the board comes up with it
    if (kist && id.startsWith('bakskist')) kist.want = kist.want > 0.5 ? 0 : 1;
    if (anchorGear && ['anker', 'ankerketting', 'ankerlijn'].includes(id)) weighAnchor(anchorGear.want < 0.5);
  };
  /** Dragging with the pointer: grab() says whether this part takes one, steer() takes a ray.
   *  The helmstok steers; the zwaardbout is pulled out of its kast the same way. */
  const helmPlane = new THREE.Plane(); const helmHit = new THREE.Vector3();
  const helmControl = {
    grab: (part) => {
      const id = part?.extras.id;
      // lying loose the bolt is not dragged any more, so a click on it is just a click
      helm.held = id === 'helmstok' ? 'helm' : (id === 'zwaardbout' && !bolt.down ? 'bout' : false);
      if (helm.held === 'bout') bolt.grabZ = null;
      return Boolean(helm.held);
    },
    steer: (ray) => {
      if (helm.held === 'bout') { pullBolt(ray); return; }
      helmPlane.setFromNormalAndCoplanarPoint(UP, helm.hinge);      // the pointer, at the height the helmstok swings at
      if (ray.intersectPlane(helmPlane, helmHit)) steerTo(helmHit);
    },
    release: () => {
      if (helm.held === 'bout' && bolt.pull >= 0.95 * BOLT_OUT) dropBolt();   // pulled clear: it stays out
      helm.held = false;
    },
  };
  /** For the progress bar: the procedure last set going, as plain data, and the handles to steer it. */
  const procedure = () => (shown && {
    name: shown.name, t: shown.t, total: shown.total, playing: shown.playing, resting: shown.resting, stepping: shown.stepping,
    label: shown.label, index: shown.index, backwards: shown.direction < 0,
    steps: shown.steps.map((s) => ({ label: s.label, back: s.back, begin: s.begin, end: s.end })),
  });
  const procedureControl = {
    play: () => shown?.play(), pause: () => shown?.pause(), scrub: (t) => shown?.scrub(t),
    /** One step on (+1) or back (-1), after `delay` seconds. */
    step: (direction, delay) => shown?.step(direction, delay),
    /** The parts the step one step on or back is about: where the camera looks while it plays. */
    focus: (direction) => (shown?.upcoming(direction)?.step.focus ?? [])
      .map((id) => parts.find((p) => p.extras.id === id)).filter(Boolean),
    /** Where that step is looked at from, when it says so itself: { positie, doel, kant } in model space. */
    camera: (direction) => shown?.upcoming(direction)?.step.camera ?? null,
    /** Calls `fn` with the boat posed at the start, half way and the end of that step: where it will be. */
    across: (direction, fn) => {
      const next = shown?.upcoming(direction);
      if (!next) return;
      const at = shown.steps.indexOf(next.step);                    // the step it is framed like: the nearest one with that key
      const like = next.step.like && shown.steps.filter((s) => s.key === next.step.like)
        .sort((a, b) => Math.abs(shown.steps.indexOf(a) - at) - Math.abs(shown.steps.indexOf(b) - at))[0];
      if (like) { for (const f of [0, 0.5, 1]) measureAt(like.begin + (like.end - like.begin) * f, fn); return; }
      const from = shown.t;
      for (const f of [0, 0.5, 1]) measureAt(from + (next.at - from) * f, fn);
    },
  };
  /** Poses the boat at time `t` of the procedure shown, calls `fn`, and puts everything back as it was. */
  const measureAt = (t, fn) => {
    const was = shown.t;
    const gear = anchorGear && { u: anchorGear.u, want: anchorGear.want, byHand: anchorGear.byHand };
    measuring = true;
    try {
      shown.seek(t); update(0); fn();
    } finally {
      shown.seek(was); if (gear) Object.assign(anchorGear, gear); update(0);
      measuring = false;
    }
  };
  /** Parts that have been selected (on the model, in the list, by the quiz): what hides them gives way. */
  const reveal = (list) => {
    if (kist && list.some((p) => ['meerpen', 'hoosblik', 'ehbo_koffer'].includes(p.extras.id))) kist.want = 1;   // the lid goes up
  };

  // -- the state from outside: `toestand` in the configuration, and handle.set()/get() afterwards.
  // Every value goes through the same setter as the control the user has for it, so the icons and
  // popovers show what the page set. A value the viewer does not know is reported and left alone.
  const warn = (key, value, known) => console.warn(`[lelievlet] toestand.${key}: ${JSON.stringify(value)} kent de viewer niet${known ? ` (${known.join(', ')})` : ''}`);
  const PER_BOORD = Object.keys(ROEICOMMANDOS).filter((key) => !ROEICOMMANDOS[key].beide);
  /**
   * Take the boat to `want` (only the keys given). `direct`: no animation, the boat stands there at
   * once - that is how the configuration's toestand is applied, before the first frame.
   */
  const apply = (want = {}, { direct = false } = {}) => {
    const { modus, tuig: rig, koers, reven, roeien, commando, zwaard } = want;
    if (modus !== undefined) {
      if (['zeilen', 'roeien', 'wrikken'].includes(modus)) setMode(modus); else warn('modus', modus, ['zeilen', 'roeien', 'wrikken']);
    }
    if (rig !== undefined) {
      if (rig in RIG_AT) {
        setRig(rig);
        if (direct) { rigging.seek(RIG_AT[rig]); rigging.playing = false; }
      } else warn('tuig', rig, Object.keys(RIG_AT));
    }
    if (koers !== undefined) {                                      // like the slider: 0, or 45 .. 180 to either side
      if (Number.isFinite(koers)) setCourse(koers === 0 ? 0 : Math.sign(koers) * clamp(Math.abs(koers), CLOSE_HAULED, RUN));
      else warn('koers', koers);
    }
    if (reven !== undefined) {
      if (Number.isFinite(reven)) {
        setReef(clamp(Math.round(reven), 0, reefInfo.max_slagen));
        if (direct && reefing) { reefing.seek(reefing.total); reefing.playing = false; }
      } else warn('reven', reven);
    }
    if (roeien !== undefined) {
      if (['naast', 'kruis', 'vier'].includes(roeien)) setRowing(roeien); else warn('roeien', roeien, ['naast', 'kruis', 'vier']);
    }
    if (commando !== undefined) {                                   // one for the whole boat, or { bb, sb } per boord
      if (typeof commando === 'string' && commando in ROEICOMMANDOS) setCommando('beide', commando);
      else if (commando && typeof commando === 'object' && Object.entries(commando).every(([k, c]) => ['bb', 'sb'].includes(k) && PER_BOORD.includes(c))) {
        for (const [boord, c] of Object.entries(commando)) setCommando(boord, c);
      } else warn('commando', commando, Object.keys(ROEICOMMANDOS));
    }
    if (zwaard !== undefined) {                                     // last: the mode and the course trim it too
      if (['neer', 'half', 'op'].includes(zwaard)) setBoard(zwaard); else warn('zwaard', zwaard, ['neer', 'half', 'op']);
    }
    if (direct) for (let i = 0; i < 100; i++) update(0.05);          // five seconds: everything that eases in has arrived
  };
  /** Where the boat is going, in the form apply() takes. */
  const current = () => ({
    modus: state.mode, tuig: state.rig ?? 'op', koers: state.course, reven: reefWanted,
    roeien: state.rowing, commando: { ...state.commando },
    zwaard: strike.zwaard > 0.5 ? 'op' : state.midzwaard,           // the Tuig procedure holds it up
  });
  return { update, state, click, reveal, helm: helmControl, procedure, procedureControl, apply, current,
           bowsprit: bowsprit && { get on() { return bowsprit.want; }, set: setBowsprit },
           chill: chill && { get on() { return chill.holds; } },
           water, waterHit, mob, toplicht: { set: setToplicht },
           boardDrop: { get on() { return bolt.down; }, set: (on) => (on ? dropBolt() : holdBolt()) },
           tow: tow && { get on() { return tow.want; }, set: (on) => { tow.want = on; } },
           island: moor && { get on() { return moor.want; }, set: (on) => { moor.want = on; } },
           // set(true) only puts the boat where it happens by itself: under sail, on a course, anchor out
           lostAnchor: anchorGear && {
             get on() { return anchorGear.lost === true; },
             set: (on) => {
               if (!on) { weighAnchor(false); return; }
               if (anchorGear.lost) return;
               setMode('zeilen'); setRig('op');
               if (state.course === 0) setCourse(90);
               weighAnchor(true);
             },
           },
           leechFlag: { get on() { return leechFlag.on; }, set: (on) => leechFlag.set(on), setEmblem: leechFlag.setEmblem } };
}
