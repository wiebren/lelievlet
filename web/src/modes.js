import * as THREE from 'three';
import { initFlag } from './flag.js';
import { Procedure } from './procedure.js';
import { RopeLine, RopeStretch, roundTheFront, carry, layChain, makeBlokje, makeBorgpen, makeCourseArrow, makeDol, makeKettinkje, makeKnevel, makeMik, makeWater, makeWindArrow, makeWindVane,
         makeZwaardbout, pivotRotate, rotatedPoint, setOpacity } from './rig.js';
import { naamVan } from './config.js';

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
const FOK_CAD = 20.7;                             // how the fok is sheeted in the CAD model
// how far the fok bows out, as a fraction of its reach (luff -> clew): flat close-hauled, full off the wind
const FOK_BEND = [[45, 0.06], [90, 0.10], [135, 0.13], [180, 0.15]];
// fullness of the grootzeil relative to its designed belly
const MAIN_BEND = [[45, 0.8], [90, 1.0], [180, 1.15]];

const CLOSE_HAULED = 45; const RUN = 180; const LOEVERT = 195;      // courses; LOEVERT = fok te loevert
// The slider is mirrored: dead centre is kop in de wind (course 0), HEAD_GAP to either side of it aan
// de wind begins, to the right with the wind over starboard, to the left over port.
const HEAD_GAP = 30;
const SLIDER_MAX = LOEVERT - CLOSE_HAULED + HEAD_GAP;
const HEAD_TO_WIND = 'Kop in de wind';
const MARKERS = [
  { course: CLOSE_HAULED, label: 'Aan de wind' },
  { course: 90, label: 'Halve wind' },
  { course: 135, label: 'Ruime wind' },
  { course: RUN, label: 'Voor de wind' },
  { course: LOEVERT, label: 'Fok te loevert' },
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

export function initModes({ parts, tuig, scene, ui, wrap, config, signal, onResize, engaged, realTarget }) {
  const byId = new Map(parts.map((p) => [p.extras.id, p]));
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
  const sailRig = meshesOf([...new Set([...MAIN, ...GIEK, 'lummelbout', ...JIB, ...running])]);   // fades out when the sails are down

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
  let reef = { slack: 0, slide: 0, pull: 0, turns: 0, hoop: 0 };
  let reefing = null;                                               // the Procedure that is taking it to another number of turns
  let shown = null;                                                 // the procedure the progress bar is about
  const planReef = (turns) => {
    if (Math.abs(reef.turns - turns) < 1e-6 && reef.slack + reef.slide + reef.pull < 1e-6) return;
    reefing = new Procedure('Reven', reef, [
      { key: 'slack', to: 1, seconds: 0.7, label: stap('Vallen vieren') },
      { key: 'slide', to: 1, seconds: 1.1, label: stap('Schootring naar de nok') },
      { key: 'pull', to: 1, seconds: 0.5, label: stap('Giek naar achteren trekken') },
      { key: 'turns', to: turns, seconds: 1.25 * Math.max(Math.abs(turns - reef.turns), 0.4), label: stap('Giek draaien') },
      { key: 'pull', to: 0, seconds: 0.5, label: stap('Giek terug in het lummelbeslag') },
      { key: 'hoop', to: turns > 0 ? 1 : 0, seconds: 0.9, label: stap('Grootschoot verhangen') },
      { key: 'slide', to: 0, seconds: 1.1, label: stap('Schootring terug') },
      { key: 'slack', to: 0, seconds: 0.7, label: stap('Vallen doorzetten') },
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
  const qRest = new THREE.Quaternion(); const peakAt = new THREE.Vector3();
  // -- fokkenschoten: schoothoek -> block on the forward leioog -> hand of the crew. They are laid
  // anew for every position of the fok, because the sheet to windward goes round the front of
  // the mast and the one to leeward runs straight. Each block hangs in its sheet.
  const jibClew = V(tuig.fok_schoothoek);
  const jibSheets = ['bb', 'sb'].map((key) => {
    const info = tuig.fokkenschoot[key];
    const foot = V(info.voet); const sheave = V(info.schijf);
    return { foot, sheave, hand: V(info.hand), side: Math.sign(foot.z), reach: foot.distanceTo(sheave),
             rest: sheave.clone().sub(foot).normalize(), block: meshesOf([`blok_fokkenschoot_${key}`]),
             at: new THREE.Vector3(), lead: null, tail: null };
  });
  {
    const part = byId.get('fokkenschoot');
    const material = part.meshes[0].material;
    const home = part.node.parent;
    for (const old of part.meshes) { old.visible = false; old.geometry.dispose(); }
    part.node.removeFromParent();                                   // the CAD rope is replaced outright
    part.node = new THREE.Group(); part.node.name = 'fokkenschoot'; home.add(part.node);
    part.meshes = [];
    for (const sheet of jibSheets) {
      sheet.lead = new RopeLine(40, tuig.fokkenschoot.straal_m, material);
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
    jibSheets.knot = knot;
  }
  const mastRound = tuig.fokkenschoot.mast_straal_m + tuig.fokkenschoot.straal_m + 0.006;
  const clewNow = new THREE.Vector3(); const toClew = new THREE.Vector3(); const toHand = new THREE.Vector3();
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
  const UPPER_HANG = deg(172);                                    // not quite plumb: its handle leans on the kast
  const qLower = new THREE.Quaternion(); const qUpper = new THREE.Quaternion();
  const footTo = new THREE.Vector3(); const kneeTo = new THREE.Vector3();
  const boardHole = new THREE.Vector3(); const pinTo = new THREE.Vector3();
  const borgpen = addPart(makeBorgpen(), 'borgpen', 'Borgpen', 'zwaard', 'zwaardloper_onder', [13, 13, 85]);
  const kettinkje = addPart(makeKettinkje(), 'kettinkje', 'Kettinkje borgpen', 'zwaard', 'zwaardloper_onder', [17, 100, 17]);
  const chainEye = V(loper.kettingoog);
  const pinHang = chainEye.clone().setY(chainEye.y - loper.ketting_m);
  const HANG = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, -1, 0));
  const pinRing = new THREE.Vector3();

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

  const dirkInfo = tuig.kraanlijn;
  const dirkBlock = addPart(makeBlokje(), 'blok_kraanlijn', 'Blok van de kraanlijn', 'lopend_want', 'grootschoot', [44, 72, 12]);
  dirkBlock.position.copy(V(dirkInfo.oog));
  const dirkSheave = dirkBlock.position.clone().add(dirkBlock.userData.centre);
  const dirkMaterial = sheetMaterial.clone();                             // its own, so it lights up by itself when selected
  const dirk = new RopeLine(27, dirkInfo.straal_m, dirkMaterial);         // the span and the turn over the sheave
  const dirkDown = new RopeLine(3, dirkInfo.straal_m, dirkMaterial);      // the fall to the kikker
  const dirkKnot = new THREE.Mesh(new THREE.SphereGeometry(0.006, 12, 8), dirkMaterial);   // stopper knot behind the wervel
  const dirkNode = new THREE.Group(); dirkNode.add(dirk.mesh, dirkDown.mesh, dirkKnot);
  addPart(dirkNode, 'kraanlijn', 'Kraanlijn', 'lopend_want', 'grootschoot', [8, 4300, 2900]);
  sailRig.push(dirk.mesh, dirkDown.mesh, dirkKnot, ...parts.find((p) => p.extras.id === 'blok_kraanlijn').meshes);
  const dirkEnd = V(dirkInfo.wervel); const dirkFall = dirkInfo.val.map(V);
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
  scene.add(boltLine.mesh);
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
  // ankeroog. Weighing it is the same in reverse. At rest the modelled gear is shown as it is.
  const anchorGear = (() => {
    const anchor = byId.get('anker'); const chainPart = byId.get('ankerketting'); const linePart = byId.get('ankerlijn');
    if (!anchor || !chainPart || !linePart || !tuig.anker) return null;
    const hand = V(tuig.anker.schakel); const eye = V(tuig.anker.oog);
    const route = new THREE.CatmullRomCurve3([hand, new THREE.Vector3(hand.x, 1.27, hand.z), new THREE.Vector3(4.55, 1.5, 0.33),
      new THREE.Vector3(5.12, 1.5, 0.36), new THREE.Vector3(5.33, 1.47, 0.80), new THREE.Vector3(5.36, 0.55, 0.84),
      new THREE.Vector3(5.75, -1.7, 0.95)], false, 'centripetal');
    const chock = new THREE.Vector3(eye.x - 0.01, eye.y + 0.14, 0.085);    // where the lijn crosses the rail
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
    const rope = new RopeLine(40, 0.006, linePart.meshes[0].material);
    rope.mesh.visible = false; rope.mesh.userData.part = linePart.node; linePart.node.parent.add(rope.mesh);
    const stowedLine = linePart.meshes.slice(); linePart.meshes.push(rope.mesh);
    // six millimetres of line is no target for a finger: an unseen sleeve round it takes the click
    const grip = new RopeLine(40, 0.035, new THREE.MeshStandardMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }), 6);
    grip.mesh.visible = false; grip.mesh.userData.part = linePart.node; linePart.node.parent.add(grip.mesh); linePart.meshes.push(grip.mesh);
    return { u: 0, want: 0, shown: NaN, hand, eye, route, chock, anchor: anchor.meshes, chainMesh, rest, links, per, rope, grip, stowedLine };
  })();
  const layAnchor = () => {
    const g = anchorGear; if (!g || Math.abs(g.u - g.shown) < 1e-4) return;
    g.shown = g.u;
    const stowedNow = g.u < 0.004;
    for (const m of g.stowedLine) m.visible = stowedNow;
    g.rope.mesh.visible = !stowedNow; g.grip.mesh.visible = !stowedNow;
    const at = g.route.getPoint(stowedNow ? 0 : g.u);
    for (const m of g.anchor) m.position.copy(at).sub(g.hand);
    const a = g.chainMesh.geometry.attributes.position.array;
    if (stowedNow) { a.set(g.rest); g.chainMesh.geometry.attributes.position.needsUpdate = true; g.chainMesh.geometry.computeBoundingSphere(); return; }
    // ketting: a metre of it from the shackle towards the rail, hanging in a bight while that is nearer
    const from = at.clone().setY(at.y + 0.036); const LENGTH = 1.0;
    const to = g.chock.clone().sub(from); const span = to.length();
    const reach = Math.min(span * 0.8, LENGTH * 0.98);
    const end = from.clone().addScaledVector(to.normalize(), reach);
    const bight = 0.45 * Math.sqrt(Math.max(LENGTH * LENGTH - reach * reach, 0));
    const p = new THREE.Vector3(); const q = new THREE.Quaternion(); const t = new THREE.Vector3(); const prev = new THREE.Vector3();
    const chainAt = (k, out) => out.lerpVectors(from, end, k).setY(THREE.MathUtils.lerp(from.y, end.y, k) - bight * 4 * k * (1 - k));
    g.links.forEach((link, i) => {
      const k = (i + 0.5) / g.links.length;
      chainAt(k, p); chainAt(Math.max(k - 0.01, 0), prev); chainAt(Math.min(k + 0.01, 1), t).sub(prev).normalize();
      q.setFromUnitVectors(link.axis, t);
      for (let n = i * g.per; n < (i + 1) * g.per; n++) {
        prev.fromArray(g.rest, n * 3).sub(link.centre).applyQuaternion(q).add(p).toArray(a, n * 3);
      }
    });
    g.chainMesh.geometry.attributes.position.needsUpdate = true;
    g.chainMesh.geometry.computeVertexNormals(); g.chainMesh.geometry.computeBoundingSphere();
    // lijn: from the end of the ketting to the rail, slack until the anchor is over the side; then to the ankeroog
    const slack = 0.30 * (1 - smoothstep(clamp((g.u - 0.55) / 0.3, 0, 1)));
    const path = [];
    for (let i = 0; i <= 16; i++) {
      const k = i / 16; const s = new THREE.Vector3().lerpVectors(end, g.chock, k);
      s.y -= slack * 4 * k * (1 - k);
      if (s.x > 4.05 && s.x < 5.45 && Math.abs(s.z) < 0.55) s.y = Math.max(s.y, 0.705);   // it lies on the voordek, not in it
      path.push(s);
    }
    path.push(g.chock.clone().setZ(0.04).setY(g.chock.y + 0.004), g.eye.clone());
    g.rope.set(path); g.grip.set(path);
  };

  // -- bakskist: modelled with its lid open; a click shuts or opens it
  const kist = tuig.bakskist ? { lid: meshesOf(['bakskist_deksel']), hinge: V(tuig.bakskist.scharnier), axis: V(tuig.bakskist.richting).normalize(),
    shut: deg(tuig.bakskist.open_graden), open: 1, want: 1 } : null;
  foldParts('bakskist', ['bakskist_deksel', 'bakskist_beslag', 'bakskist_handvatten']);      // one part to name; the lid still swings

  // -- zeilen strijken. In order: head to wind, anchor out, fok down and bundled on its stay, mik
  // set, grootzeil down with giek and gaffel into the fork of the mik, sail rolled up between
  // them, three zeilbinders round the lot. Hoisting is the same list backwards. Like reven, every
  // step is one value run to its goal.
  // One timeline for the rig: sails struck is its first half, mast down the whole of it. "Zeilen op",
  // "Zeilen gestreken" and "Mast gestreken" are three moments on it.
  const rigging = new Procedure('Tuig', { head: 0, anchor: 0, jib: 0, mik: 0, main: 0, furl: 0, ties: 0,
    fokoff: 0, low: 0, pin: 0, grendel: 0, ring: 0, hook: 0, mast: 0 }, [
    { key: 'head', to: 1, seconds: 1.5, label: stap('Kop in de wind') },
    { key: 'anchor', to: 1, seconds: 4, label: stap('Anker uit') },
    { key: 'jib', to: 1, seconds: 2, label: stap('Fok strijken') },
    { key: 'mik', to: 1, seconds: 1.5, label: stap('Mik zetten') },
    { key: 'main', to: 1, seconds: 2.5, label: stap('Grootzeil strijken') },
    { key: 'furl', to: 1, seconds: 1.5, label: stap('Zeil opdoeken') },
    { key: 'ties', to: 1, seconds: 1.2, label: stap('Zeilbinders om') },
    { key: 'fokoff', to: 1, seconds: 2, label: stap('Fok afnemen') },
    { key: 'low', to: 1, seconds: 2, label: stap('Tuig in de onderste haak van de mik') },
    { key: 'pin', to: 1, seconds: 1.8, label: stap('Lummelbout uit') },
    { key: 'grendel', to: 1, seconds: 1.5, label: stap('Grendelbout uit') },
    { key: 'ring', to: 1, seconds: 1.2, label: stap('Ring van de pelikaanhaak omhoog') },
    { key: 'hook', to: 1, seconds: 1.8, label: stap('Pelikaanhaak uit de hanekam') },
    { key: 'mast', to: 1, seconds: 5, label: stap('Mast strijken') },
  ]);
  const strike = rigging.values;
  const RIG_AT = { op: 0, gestreken: rigging.after('ties'), mast: rigging.total };
  const planStrike = (rig) => { rigging.command(RIG_AT[rig]); shown = rigging; };
  const throat = new THREE.Vector3(3.4568, 3.9816, 0);             // klauwhoek of the sail, where the gaffel meets the mast
  const GAFFEL_RISE = Math.atan2(0.7512, 0.66);                     // how steeply the gaffel stands when the sail is set
  const STOWED_Y = boomPivot.y + 0.19;                              // the gaffel's throat when it lies on the rolled sail
  const qTilt = new THREE.Quaternion(); const qGaff = new THREE.Quaternion(); const throatTo = new THREE.Vector3();
  const ATHWART = new THREE.Vector3(0, 0, 1);
  const clothMeshes = mainMeshes.filter((m) => m.geometry.attributes._bolling);
  mainBend.warp = (P) => {                                          // the grootzeil coming down in folds, then gathered on the giek
    const m = smoothstep(strike.main); const f = smoothstep(strike.furl);
    const h = Math.max(P[1] - boomPivot.y, 0);
    P[2] += 0.04 * m * (1 - f) * Math.sin(h * 26) * Math.min(h * 4, 1);
    P[1] = boomPivot.y + h * (1 - 0.93 * m);
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
  const hanks = meshesOf(['leuvers']).map((mesh) => {
    const rest = Float32Array.from(mesh.geometry.attributes.position.array);
    const p = new THREE.Vector3(); const along = new Float32Array(rest.length / 3);
    let first = Infinity; let last = -Infinity;
    for (let i = 0; i < along.length; i++) {
      along[i] = p.fromArray(rest, i * 3).sub(stayFoot).dot(stayAxis);
      first = Math.min(first, along[i]); last = Math.max(last, along[i]);
    }
    const pitch = (last - first) / 9;                                // ten of them, evenly spaced
    const home = along.map((a) => first + Math.round((a - first) / pitch) * pitch);   // where its own leuver sits
    return { mesh, rest, home, shown: NaN };
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
  const warpPoint = (bend, p) => { const P = [p.x, p.y, p.z]; bend.warp(P); return p.set(P[0], P[1], P[2]); };
  const valHarp = (() => {
    const meshes = meshesOf(['harpje_fokkenval']);
    if (!meshes.length) return null;
    const box = new THREE.Box3();
    for (const m of meshes) { m.geometry.computeBoundingBox(); box.union(m.geometry.boundingBox); }
    const home = box.getCenter(new THREE.Vector3()); home.y = box.max.y;      // where the val is made fast to it
    const rope = new RopeLine(2, 0.003, byId.get('fokkenval').meshes[0].material);
    rope.mesh.visible = false;
    joinPart(rope.mesh, 'fokkenval');
    return { meshes, home, at: new THREE.Vector3(), rope };
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
  scene.add(water, wind);
  // vlaggenstok in the top of the roerkoning, with its knop (bakskleur, like the roerkop) and the flag
  const flyFlag = initFlag({ foot: V(tuig.vlaggenstok.voet), axis: V(tuig.vlaggenstok.richting), addPart, joinPart,
                             accent: byId.get('roerkop').meshes.find((m) => m.material.name === 'bakskleur').material });

  // -- state: targets are set by the UI, the smoothed values chase them
  // rowPhase 0..1 runs inpik -> haal -> uitpik -> recover; rowLength is half the sweep of the oar (radians)
  const state = { commando: { bb: 'slag', sb: 'slag' }, mode: 'zeilen', course: 90, midzwaard: 'neer', rowing: 'kruis', rowPhase: 0, rowLength: 0.42 };
  const now = { boom: 0, jib: FOK_CAD, jibBend: 0.08, mainBend: 1, board: 0, sails: 1, rowing: 0, sculling: 0, flutter: 0, windAngle: deg(90), t: 0 };
  const chase = (key, target, dt, rate = 4.5) => { now[key] += (target - now[key]) * (1 - Math.exp(-dt * rate)); };

  const q = new THREE.Quaternion(); const roll = new THREE.Quaternion(); const dir = new THREE.Vector3();
  const tmp0 = new THREE.Vector3(); const tmp1 = new THREE.Vector3();
  const tmp = new THREE.Vector3(); const delta = new THREE.Vector3();
  const hang = new THREE.Vector3(); const sheetDir = new THREE.Vector3(); const qa = new THREE.Quaternion();
  const identity = new THREE.Quaternion(); const blended = new THREE.Quaternion();
  const IDENTITY_Q = new THREE.Quaternion();

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

  function update(dt) {
    const sailing = state.mode === 'zeilen';
    const side = Math.sign(state.course) || 1;                      // +1: wind over starboard, sails to port
    const course = Math.min(Math.abs(state.course), RUN);
    const loevert = smoothstep(clamp((Math.abs(state.course) - RUN) / (LOEVERT - RUN), 0, 1));
    rigging.tick(dt); reefing?.tick(dt);
    if (anchorGear) {
      if (rigging.t > 1e-6) { anchorGear.u = strike.anchor; anchorGear.want = Math.round(strike.anchor); }   // the procedure has it
      else {
        const gap = anchorGear.want - anchorGear.u; const step = 0.25 * dt;   // by hand: four seconds from chest to bottom
        anchorGear.u = Math.abs(gap) <= step ? anchorGear.want : anchorGear.u + Math.sign(gap) * step;
      }
    }
    if (kist) {
      kist.open += (kist.want - kist.open) * (1 - Math.exp(-dt * 3.5));
      pivotRotate(kist.lid, kist.hinge, kist.axis, kist.shut * (1 - kist.open));
    }
    const headUp = Math.max(smoothstep(strike.head), state.course === 0 ? 1 : 0);
    const upwind = 1 - headUp;                                      // head to wind: everything amidships and shaking
    chase('flutter', sailing ? headUp : 0, dt, 2.2);
    chase('boom', sailing ? side * interp(BOOM, course) * upwind + 1.6 * now.flutter * Math.sin(1.9 * now.t) : 0, dt);   // the giek wanders a little
    chase('jib', sailing ? side * THREE.MathUtils.lerp(interp(FOK, course), FOK_TE_LOEVERT, loevert) * upwind : FOK_CAD, dt);
    chase('jibBend', interp(FOK_BEND, course) * upwind, dt);
    chase('mainBend', interp(MAIN_BEND, course) * upwind, dt);
    chase('windAngle', deg(side * course) * upwind, dt);
    chase('sails', sailing ? 1 : 0, dt, 3.5);
    chase('board', { neer: 0, half: 1, op: 2 }[state.midzwaard], dt, 2.2);
    chase('rowing', state.mode === 'roeien' ? 1 : 0, dt, 2.5);
    chase('sculling', scullOar.byHand ?? (state.mode === 'wrikken' ? 1 : 0), dt, 2.5);   // by the mode, or put out by a click
    now.t += dt;
    // midzwaard: 0 = neer, 1 = half, 2 = op
    const s = now.board;
    // half -> op: the board is all the way up by s = 1.6, the links fold over s = 1.5 .. 2 once
    // the foot pin has cleared the kast top
    const angle = s <= 1 ? THREE.MathUtils.lerp(boardAngles[0], boardAngles[1], s)
                         : THREE.MathUtils.lerp(boardAngles[1], boardAngles[2], smoothstep(clamp((s - 1) / 0.6, 0, 1)));
    pivotRotate(boardMeshes, boardPivot, boardAxis, -deg(angle));
    rotatedPoint(boardPin, boardPivot, boardAxis, -deg(angle), boardHole);
    rotatedPoint(loperFoot, boardPivot, boardAxis, -deg(angle), footTo);   // the foot pin rides on the board

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
    const boomAngle = -deg(now.boom);                               // about +y; to port is negative
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
    qTilt.setFromAxisAngle(ATHWART, GAFFEL_RISE * smoothstep(clamp(strike.main * 1.6 - 0.6, 0, 1)));
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
    qBundle.setFromUnitVectors(tmp.copy(nokFrom).sub(bundleFrom).normalize(), delta.copy(nokTo).sub(bundleTo).normalize());
    const bundled = lowK > 0 || freeK > 0;
    if (bundled) { for (const set of [rolling, pulled, ringMeshes, [shaft], boomStill, gaffelSet, lacing]) swing(set); }
    stowed.quaternion.identity(); stowed.position.set(0, 0, 0); binders.quaternion.identity(); binders.position.set(0, 0, 0);
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
    onGaffel(peakAt.copy(hanepoot).add(ridden), tmp); if (bundled) withBundle(tmp);
    peakHalyard.update(delta.copy(offMast(tmp, tmp)).sub(hanepoot));
    rotatedPoint(warpPoint(jibBend, clewNow.copy(jibClew)), stayTack, stayAxis, jibAngle, clewNow);
    jibSheets.knot.position.copy(clewNow);
    for (const sheet of jibSheets) {
      // to leeward the sheet runs straight to its block; to windward it goes round the front of
      // the mast first. While the schoothoek crosses the boat the one route eases into the other.
      const across = smoothstep(clamp(-(clewNow.z * sheet.side) / 0.12, 0, 1));
      const first = across > 0 ? roundTheFront(clewNow, sheet.sheave, mastPivot, mastRound, round)[1] : sheet.sheave;
      // the block hangs between its two parts of the sheet
      toClew.copy(across > 0.5 ? first : clewNow).sub(sheet.foot).normalize();
      toHand.copy(sheet.hand).sub(sheet.foot).normalize();
      toClew.add(toHand).normalize();
      qa.setFromUnitVectors(sheet.rest, toClew);
      carry(sheet.block, sheet.foot, sheet.foot, qa);
      sheet.at.copy(sheet.foot).addScaledVector(toClew, sheet.reach);
      straight.length = 0; straight.push(clewNow, sheet.at);
      if (across > 0) {
        roundTheFront(clewNow, sheet.at, mastPivot, mastRound, round);
        if (across < 1) {                                           // blend, point for point along the rope
          const n = round.length - 1;
          round.forEach((p, i) => p.lerp(tmp.lerpVectors(clewNow, sheet.at, i / n), 1 - across));
        }
      }
      sheet.lead.set(across > 0 ? round : straight);
      // the tail to the hand is slack: it sags
      const tailPath = [];
      for (let i = 0; i <= 8; i++) {
        const p = new THREE.Vector3().lerpVectors(sheet.at, sheet.hand, i / 8);
        p.y -= 0.05 * Math.sin((Math.PI * i) / 8);
        tailPath.push(p);
      }
      sheet.tail.set(tailPath);
    }
    onGaffel(throatEnd, tmp); if (bundled) withBundle(tmp);
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
    }
    {
      // kraanlijn: wervel -> over the block -> down the mast to its kikker
      rotatedPoint(dirkEnd, boomPivot, UP, boomTurn, wervelNow);
      if (bundled) withBundle(wervelNow);
      const sheaveNow = withMast(dirkSheave);
      dirkBlock.position.copy(withMast(V(dirkInfo.oog)));
      dirkKnot.position.copy(wervelNow).addScaledVector(tmp.set(-1, 0, 0).applyAxisAngle(UP, boomTurn), 0.009);
      dirkBlock.quaternion.setFromAxisAngle(UP, Math.atan2(-(wervelNow.z - sheaveNow.z), wervelNow.x - sheaveNow.x)).premultiply(qMast);   // the block looks at the nok
      const r = dirkBlock.userData.sheave + dirkInfo.straal_m;
      const belly = Math.max(0, mainBend.depth) * bellyMax;           // only a belly to port pushes it out
      bellyDir.copy(mainBend.normal).applyAxisAngle(UP, boomAngle);
      tmp.copy(wervelNow).sub(sheaveNow).setY(0).normalize();         // horizontally from the block towards the nok
      dirkPath.length = 0;
      for (let i = 0; i <= 20; i++) {                                 // the slack span
        const k = i / 20; const hang = Math.sin(Math.PI * k);
        const p = new THREE.Vector3().lerpVectors(wervelNow, sheaveNow, k).addScaledVector(tmp, (1 - k) * 0 + k * r);
        p.y -= 0.10 * hang * (1 - lowered); p.addScaledVector(bellyDir, (0.9 * belly + 0.015) * hang);
        if (i === 20) p.copy(sheaveNow).addScaledVector(tmp, r);
        dirkPath.push(p);
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
      for (const m of fokGear) { m.position.y = 0.25 * off; m.visible = off <= 0.7; }               // these are not: set, never added to
      // the harpje of the fokkenval comes down the stay with the head of the fok, the val paying out
      // after it; once the fok is off, the val is hauled back up to where it was
      if (valHarp) {
        const down = warpPoint(jibBend, valHarp.at.copy(valHarp.home)).sub(valHarp.home).multiplyScalar(1 - off);
        for (const m of valHarp.meshes) m.position.add(down);
        valHarp.rope.mesh.visible = down.lengthSq() > 1e-6 && now.sails > 0.5;
        if (valHarp.rope.mesh.visible) valHarp.rope.set([valHarp.home, valHarp.at.copy(valHarp.home).add(down)]);
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
    wind.visible = now.sails > 0.05;
    for (const m of wind.userData.materials) m.opacity = 0.85 * now.sails;
    const tail = 4.4 + 1.9;                                         // the arrow is 1.9 m long, tip 4.4 m out
    wind.position.set(2.8 + tail * Math.cos(now.windAngle), tuig.waterlijn_m + 0.02, tail * Math.sin(now.windAngle));
    wind.rotation.y = Math.PI - now.windAngle;
    vane.quaternion.setFromAxisAngle(UP, -now.windAngle).premultiply(qMast);   // its frame points into the wind
    withMast(tmp.copy(mastHead).setY(mastHead.y + 0.06), vane.position);
    helm.angle += (helm.target - helm.angle) * (1 - Math.exp(-dt * 12));
    pivotRotate(rudderMeshes, rudderFoot, rudderAxis, helm.angle);
    helm.qTurn.setFromAxisAngle(rudderAxis, helm.angle);
    borg?.chain.update(delta.copy(rotatedPoint(borg.eye, rudderFoot, rudderAxis, helm.angle, tmp)).sub(borg.eye));
    flyFlag(now.t, now.windAngle, now.sails, 1 - now.sculling, helm.qTurn);   // no flag while wrikken: the riem needs the room

    // wrikriem: a figure of eight over the wrikgat, blade twisting
    const th = (now.t * 2 * Math.PI) / 1.6;
    dir.set(-Math.cos(SCULL_PITCH), -Math.sin(SCULL_PITCH), 0).applyAxisAngle(UP, 0.2 * Math.sin(th) * now.sculling);
    poseOar(scullOar, now.sculling, wrikgat, dir, -0.65 * Math.cos(th) * now.sculling);

    // roeiriemen: all in time, one stroke per 3.2 s
    if (state.mode === 'roeien') state.rowPhase = (state.rowPhase + dt / 3.2) % 1;
    const stroke = state.rowPhase * 2 * Math.PI;
    const pull = Math.sin(stroke);                                  // > 0: blade in the water, moving aft
    const feather = smoothstep(clamp(pull * 3 + 0.5, 0, 1));        // upright while pulling
    const seats = ROWING[state.rowing];
    const ease = 1 - Math.exp(-dt * 2.5);
    // mik: up in its holders when the sails are struck onto it, or when set by hand; not for rowing or sculling
    mikPose.up += ((strike.mik > 0.05 ? 1 : mikPose.byHand ?? 0) - mikPose.up) * (1 - Math.exp(-dt * 1.8));
    {
      const k = smoothstep(clamp(mikPose.up, 0, 1));
      mik.position.lerpVectors(mikPose.stowed, mikPose.standing, k);
      mik.position.y += 0.55 * Math.sin(Math.PI * k);              // carried over in an arc, not dragged through the boat
      mik.quaternion.slerpQuaternions(mikPose.flat, mikPose.upright, k);
    }
    for (const d of dollen) { d.wanted = 0; d.busy = false; }
    const easePose = 1 - Math.exp(-dt * 3.2);
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
    for (const d of dollen) {
      if (!d.busy && d.byHand !== undefined) d.wanted = d.byHand;   // shipped or unshipped by a click
      d.seated += (d.wanted - d.seated) * (1 - Math.exp(-dt * 2.2));
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
    const m = c > RUN ? MARKERS[4] : c >= 158 ? MARKERS[3] : c >= 112 ? MARKERS[2] : c >= 68 ? MARKERS[1] : MARKERS[0];
    return `${m.label}, wind over ${course < 0 ? 'bakboord' : 'stuurboord'}`;
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
  // and it follows the boat - up for rowing, sculling and running before the wind, down again for
  // any other course (it moves when that changes, so what was set by hand in between is left alone).
  const setBoard = (value) => { state.midzwaard = value; };
  let boardRaised = null;
  const trimBoard = () => {
    const up = state.mode !== 'zeilen' || Math.abs(state.course) >= RUN;
    if (up === boardRaised) return;
    boardRaised = up;
    if (up) setBoard('op'); else if (state.midzwaard === 'op') setBoard('neer');
  };

  // reven: the number of turns of the giek
  const reefSlider = $('reef');
  const reefValue = $('reef-value'); const reefCount = $('reef-count');
  reefSlider.max = String(reefInfo.max_slagen);
  const setReef = (turns) => {
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
  const setMode = (mode) => {
    state.mode = mode;
    for (const d of dollen) d.byHand = undefined;                   // a new mode puts dollen, riemen and mik where they belong in it
    for (const oar of [...Object.values(rowOars), scullOar]) oar.byHand = undefined;
    mikPose.byHand = undefined;
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
      if (m.course === LOEVERT) b.classList.add(side < 0 ? 'out-left' : 'out-right');   // same row, moved outwards
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
  slider.addEventListener('change', () => {                         // released between voor de wind and fok te loevert: snap
    const c = Math.abs(state.course);
    if (c > RUN && c < LOEVERT) setCourse(Math.sign(state.course) * (c - RUN < (LOEVERT - RUN) / 2 ? RUN : LOEVERT));
  });
  for (const b of modeButtons) b.addEventListener('click', () => { setMode(b.dataset.mode); openPopover(null); });
  setCourse(state.course); setRowing(state.rowing); setMode(state.mode);

  /** A click on a part that can be shifted by hand: a dol goes in or out of its pot (not while an
   *  oar is being pulled in it), the mik up into its holders or back onto the buikdenning. */
  const click = (part, hit = null) => {
    const id = part?.extras.id ?? '';
    // a riem goes out into its dol or back onto the doften (the dol follows by itself)
    const oar = Object.values(rowOars).find((o) => o.meshes.includes(hit?.object)) ?? (id === 'riem_sb' ? rowOars.sb : id === 'riem_bb' ? rowOars.bb : null);
    if (oar) oar.byHand = oar.use * oar.pose.given > 0.5 ? 0 : 1;
    if (id === 'wrikriem') scullOar.byHand = now.sculling > 0.5 ? 0 : 1;
    const d = dollen.find((x) => id === `dol_${x.key}` || id === `dolketting_${x.key}`);
    if (d && !d.busy) d.byHand = d.seated > 0.5 ? 0 : 1;
    if (id === 'mik' || id === 'mikhouders') mikPose.byHand = mikPose.up > 0.5 ? 0 : 1;
    // the zwaardloper (or its borgpen) sets the midzwaard one stop further: neer, half, op and round again
    if (id === 'zwaard' || id.startsWith('zwaardloper') || id === 'borgpen' || id === 'kettinkje') setBoard({ neer: 'half', half: 'op', op: 'neer' }[state.midzwaard]);
    if (kist && id.startsWith('bakskist')) kist.want = kist.want > 0.5 ? 0 : 1;
    if (anchorGear && ['anker', 'ankerketting', 'ankerlijn'].includes(id) && rigging.t < 1e-6) anchorGear.want = anchorGear.want > 0.5 ? 0 : 1;
  };
  /** Steering with the pointer: grab() says whether this part is the helmstok, steer() takes a ray. */
  const helmPlane = new THREE.Plane(); const helmHit = new THREE.Vector3();
  const helmControl = {
    grab: (part) => { helm.held = part?.extras.id === 'helmstok'; return helm.held; },
    steer: (ray) => {
      helmPlane.setFromNormalAndCoplanarPoint(UP, helm.hinge);      // the pointer, at the height the helmstok swings at
      if (ray.intersectPlane(helmPlane, helmHit)) steerTo(helmHit);
    },
    release: () => { helm.held = false; },
  };
  /** For the progress bar: the procedure last set going, as plain data, and the handles to steer it. */
  const procedure = () => (shown && {
    name: shown.name, t: shown.t, total: shown.total, playing: shown.playing, resting: shown.resting,
    label: shown.current?.label ?? '', steps: shown.steps.map((s) => ({ label: s.label, begin: s.begin, end: s.end })),
  });
  const procedureControl = {
    play: () => shown?.play(), pause: () => shown?.pause(), next: () => shown?.step(1), previous: () => shown?.step(-1),
    scrub: (t) => shown?.scrub(t),
  };
  /** Parts that have been selected (on the model, in the list, by the quiz): what hides them gives way. */
  const reveal = (list) => {
    if (kist && list.some((p) => ['meerpen', 'hoosblik', 'ehbo_koffer'].includes(p.extras.id))) kist.want = 1;   // the lid goes up
  };
  return { update, state, click, reveal, helm: helmControl, procedure, procedureControl };
}
