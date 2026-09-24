import * as THREE from 'three';
import { unpack } from './config.js';

// Building blocks for animating the boat. All part geometry is stored in model space with
// identity transforms (x = transom -> bow, y = up, z = starboard), so a part is moved by giving
// its meshes the transform "rotate about a pivot" or "carry this point to that point".

const _q = new THREE.Quaternion();
const _v = new THREE.Vector3();

/** Rotate meshes about the line through `pivot` along unit `axis` (meshes start at identity). */
export function pivotRotate(meshes, pivot, axis, angle) {
  _q.setFromAxisAngle(axis, angle);
  _v.copy(pivot).applyQuaternion(_q);
  for (const m of meshes) {
    m.quaternion.copy(_q);
    m.position.copy(pivot).sub(_v);
  }
}

/** Where a model-space point ends up under pivotRotate. */
export function rotatedPoint(point, pivot, axis, angle, out = new THREE.Vector3()) {
  return out.copy(point).sub(pivot).applyAxisAngle(axis, angle).add(pivot);
}

/** Place meshes so that model point `from` lands on `to`, turned by quaternion `q` about it. */
export function carry(meshes, from, to, q) {
  _v.copy(from).applyQuaternion(q);
  for (const m of meshes) {
    m.quaternion.copy(q);
    m.position.copy(to).sub(_v);
  }
}

/**
 * A rope between something fixed and something that moves. Every vertex has a weight 0..1 for
 * how far it follows the moving end; straight spans only have vertices at their ends, so they
 * stay straight while they stretch.
 */
export class RopeStretch {
  constructor(meshes, weight) {
    this.items = meshes.map((mesh) => {
      const attr = mesh.geometry.attributes.position;
      const rest = Float32Array.from(attr.array);
      const weights = new Float32Array(attr.count);
      const p = new THREE.Vector3();
      for (let i = 0; i < attr.count; i++) weights[i] = weight(p.fromArray(rest, i * 3));
      return { mesh, attr, rest, weights };
    });
    this.last = new THREE.Vector3(NaN, NaN, NaN);
  }

  /** delta: how far the moving end has travelled from its rest position */
  update(delta) {
    if (delta.distanceToSquared(this.last) < 1e-10) return;
    this.last.copy(delta);
    for (const { mesh, attr, rest, weights } of this.items) {
      const a = attr.array;
      for (let i = 0, j = 0; i < weights.length; i++, j += 3) {
        const w = weights[i];
        a[j] = rest[j] + w * delta.x; a[j + 1] = rest[j + 1] + w * delta.y; a[j + 2] = rest[j + 2] + w * delta.z;
      }
      attr.needsUpdate = true;
      mesh.geometry.computeBoundingSphere();      // keeps picking correct
    }
  }
}

/**
 * A rope that is laid anew whenever its ends move: a tube of fixed resolution along a polyline.
 * Used where stretching the CAD rope would not do, because the rope changes its route.
 */
export class RopeLine {
  constructor(points, radius, material, sides = 8) {
    this.n = points; this.sides = sides; this.radius = radius;
    const index = [];
    for (let i = 0; i < points - 1; i++) {
      for (let k = 0; k < sides; k++) {
        const a = i * sides + k; const b = i * sides + ((k + 1) % sides);
        index.push(a, b, a + sides, b, b + sides, a + sides);
      }
    }
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points * sides * 3), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(points * sides * 3), 3));
    geometry.setIndex(index);
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.frustumCulled = false;
    this.t = new THREE.Vector3(); this.u = new THREE.Vector3(); this.w = new THREE.Vector3();
  }

  /** path: array of Vector3; resampled by length to the resolution of the tube, unless it
   *  already has exactly that many points (a tackle: long straights and tight turns) */
  set(path) {
    if (path.length === this.n) return this.lay(path);
    const lengths = [0];
    for (let i = 1; i < path.length; i++) lengths.push(lengths[i - 1] + path[i].distanceTo(path[i - 1]));
    const total = lengths[lengths.length - 1] || 1e-9;
    const P = []; let seg = 1;
    for (let i = 0; i < this.n; i++) {
      const s = (i / (this.n - 1)) * total;
      while (seg < path.length - 1 && lengths[seg] < s) seg++;
      const k = (s - lengths[seg - 1]) / Math.max(lengths[seg] - lengths[seg - 1], 1e-9);
      P.push(new THREE.Vector3().lerpVectors(path[seg - 1], path[seg], clamp01(k)));
    }
    return this.lay(P);
  }

  lay(P) {
    const pos = this.mesh.geometry.attributes.position.array;
    const nor = this.mesh.geometry.attributes.normal.array;
    const { t, u, w } = this;
    u.set(0, 1, 0);
    for (let i = 0; i < this.n; i++) {
      // mean of the two directions, so a long straight does not skew the ring where a turn begins
      t.set(0, 0, 0);
      if (i < this.n - 1) t.add(this.w.subVectors(P[i + 1], P[i]).normalize());
      if (i > 0) t.add(this.w.subVectors(P[i], P[i - 1]).normalize());
      t.normalize();
      u.addScaledVector(t, -u.dot(t));                     // carry the frame along: no twist
      if (u.lengthSq() < 1e-8) u.set(1, 0, 0).addScaledVector(t, -t.x);
      u.normalize(); w.crossVectors(t, u);
      for (let k = 0; k < this.sides; k++) {
        const a = (k / this.sides) * Math.PI * 2; const c = Math.cos(a); const s = Math.sin(a);
        const j = (i * this.sides + k) * 3;
        nor[j] = c * u.x + s * w.x; nor[j + 1] = c * u.y + s * w.y; nor[j + 2] = c * u.z + s * w.z;
        pos[j] = P[i].x + this.radius * nor[j]; pos[j + 1] = P[i].y + this.radius * nor[j + 1]; pos[j + 2] = P[i].z + this.radius * nor[j + 2];
      }
    }
    this.mesh.geometry.attributes.position.needsUpdate = true;
    this.mesh.geometry.attributes.normal.needsUpdate = true;
    this.mesh.geometry.computeBoundingSphere();            // keeps picking correct
  }
}
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/**
 * Route of a rope from `from` to `to` that has to go round the front (+x) of a standing spar:
 * straight to the spar, round it, straight on. Worked out in plan; heights run evenly along it.
 */
export function roundTheFront(from, to, centre, radius, out = []) {
  out.length = 0;
  const tangent = (p) => {                                 // the tangent point nearest the front
    const dx = p.x - centre.x; const dz = p.z - centre.z;
    const d = Math.max(Math.hypot(dx, dz), radius * 1.02);
    const base = Math.atan2(dz, dx); const spread = Math.acos(radius / d);
    const a = base + spread; const b = base - spread;
    const wrap = (x) => Math.abs(Math.atan2(Math.sin(x), Math.cos(x)));
    return wrap(a) < wrap(b) ? Math.atan2(Math.sin(a), Math.cos(a)) : Math.atan2(Math.sin(b), Math.cos(b));
  };
  const a0 = tangent(from); const a1 = tangent(to);
  const plan = [[from.x, from.z]];
  const steps = Math.max(2, Math.ceil(Math.abs(a1 - a0) / 0.2));
  for (let i = 0; i <= steps; i++) {
    const a = a0 + ((a1 - a0) * i) / steps;
    plan.push([centre.x + radius * Math.cos(a), centre.z + radius * Math.sin(a)]);
  }
  plan.push([to.x, to.z]);
  let total = 0; const run = [0];
  for (let i = 1; i < plan.length; i++) { total += Math.hypot(plan[i][0] - plan[i - 1][0], plan[i][1] - plan[i - 1][1]); run.push(total); }
  plan.forEach(([x, z], i) => out.push(new THREE.Vector3(x, from.y + (to.y - from.y) * (run[i] / (total || 1)), z)));
  return out;
}

/** Fade a set of meshes; fully faded meshes are hidden so they cannot be picked. */
export function setOpacity(meshes, alpha) {
  for (const m of meshes) {
    m.visible = alpha > 0.02;
    // a painted decal (zeilteken, zeilnummer) must stay transparent or its patch shows as a block
    m.material.transparent = alpha < 0.999 || m.material.userData.keepTransparent === true;
    m.material.opacity = alpha;
  }
}

/** Zwaardbout: the bolt through the zwaardkast that the midzwaard swings on. */
export function makeZwaardbout() {
  const steel = new THREE.MeshStandardMaterial({ color: 0x8d9298, metalness: 0.75, roughness: 0.4 });
  const group = new THREE.Group();
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.118, 16), steel);
  shank.rotation.x = Math.PI / 2;                  // athwartships, through the kast
  group.add(shank);
  for (const z of [-0.055, 0.055]) {
    const head = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.009, 6), steel);
    head.rotation.x = Math.PI / 2; head.position.z = z;
    group.add(head);
  }
  group.userData.materials = [steel];
  return group;
}

/** Borgpen: the pin through the zwaardloper that rests on the kast top and holds the board up. */
export function makeBorgpen() {
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.75, roughness: 0.35 });
  const group = new THREE.Group();
  const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.0065, 0.0065, 0.085, 14), steel);
  pin.rotation.x = Math.PI / 2;                    // lies athwartships, along model z
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.013, 0.0028, 8, 20), steel);
  ring.position.z = 0.056; ring.rotation.y = Math.PI / 2;   // through an eye in the end: in line with the pin
  group.add(pin, ring);
  group.userData.materials = [steel];
  group.userData.ring = 0.056;                     // where the chain is shackled on
  return group;
}

/** Kettinkje: the short chain from the kast top to the borgpen, so the pin cannot be lost. */
export function makeKettinkje(links = 6) {
  const steel = new THREE.MeshStandardMaterial({ color: 0x81868c, metalness: 0.7, roughness: 0.45 });
  const group = new THREE.Group();
  const geometry = new THREE.TorusGeometry(0.0085, 0.0022, 5, 10);   // a small chain: five sides round, ten along
  group.userData.links = [];
  for (let i = 0; i < links; i++) {
    const link = new THREE.Mesh(geometry, steel);
    group.add(link); group.userData.links.push(link);
  }
  group.userData.materials = [steel];
  return group;
}

/**
 * Sweep a half-round bar along a planar centre-line in the x-y plane, given as samples
 * [x, y, tangent x, tangent y]. The flat back of the bar lies on the centre-line and the round
 * face bulges towards n = (0,0,1) x t; the binormal is that constant (0,0,1), so unlike a Frenet
 * frame the section cannot flip where the curvature changes sign.
 */
function sweepHalfRound(curve, thick, wide, arcSegments = 10) {
  const profile = [];                                  // [along n, along z], counterclockwise
  for (let k = 0; k <= arcSegments; k++) {
    const a = Math.PI - (Math.PI * k) / arcSegments;
    profile.push([k === 0 || k === arcSegments ? 0 : thick * Math.sin(a), (wide / 2) * Math.cos(a)]);
  }
  profile.push([0, wide / 2], [0, -wide / 2]);         // the flat back gets its own two edges, so
  const M = profile.length;                            // it stays flat-shaded against the round one
  const N = curve.length;
  const position = [];
  const index = [];
  for (const [x, y, tx, ty] of curve) {
    for (const [u, w] of profile) position.push(x - u * ty, y + u * tx, w);
  }
  for (let i = 0; i < N - 1; i++) {
    for (let j = 0; j < M; j++) {
      if (j === arcSegments || j === M - 1) continue;   // the two seams: no width, no quad
      const a = i * M + j; const b = i * M + j + 1;
      index.push(a, b, a + M, b, b + M, a + M);
    }
  }
  for (const i of [0, N - 1]) {                        // ends cut square, own vertices again
    const base = position.length / 3;
    for (let k = 0; k <= arcSegments; k++) {
      const o = (i * M + k) * 3;
      position.push(position[o], position[o + 1], position[o + 2]);
    }
    for (let k = 1; k < arcSegments; k++) {
      if (i === 0) index.push(base, base + k + 1, base + k);
      else index.push(base, base + k, base + k + 1);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setIndex(index);
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Roeidol: the galvanised rowlock. Its pin drops into the dolpot on the gangboard and the oar
 * lies in the fork, which is bent from half-round bar with the round side towards the oar.
 * Origin: on the pin axis at the top rim of the dolpot, the fork above it and the pin below.
 */
export function makeDol() {
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.75, roughness: 0.4 });
  const group = new THREE.Group();

  const PIN_R = 0.010; const PIN_L = 0.125;      // 20 mm pin, 125 mm of it inside the dolpot
  const SEAT = 0.022;                            // lowest inside point of the fork: the oar rests here
  const HALF = 0.038;                            // 76 mm between the legs: a 3" dol
  const THICK = 0.009; const WIDE = 0.016;       // half-round bar, 9 mm thick and 16 mm wide
  const TIP = 0.115;                             // the legs end this high
  const FLARE = THREE.MathUtils.degToRad(12);    // and lean out over their last third

  const R = HALF + THICK;                        // the centre-line is the flat back, so it runs outside
  const yc = SEAT + HALF;                        // centre of the bend at the bottom of the U
  const legLen = (TIP - yc) / (2 / 3 + Math.cos(FLARE) / 3);
  const yFlare = yc + (2 * legLen) / 3;          // where the flare begins
  const rf = 0.020; const d = rf * Math.tan(FLARE / 2);   // fillet into it, so there is no kink

  const half = [];                               // bottom of the U up the starboard leg
  for (let k = 0; k <= 24; k++) {
    const a = (Math.PI / 2) * (k / 24);
    half.push([R * Math.sin(a), yc - R * Math.cos(a), Math.cos(a), Math.sin(a)]);
  }
  half.push([R, yFlare - d, 0, 1]);                                     // straight part of the leg
  for (let k = 1; k <= 6; k++) {
    const p = Math.PI - (FLARE * k) / 6;
    half.push([R + rf + rf * Math.cos(p), yFlare - d + rf * Math.sin(p), Math.sin(p), -Math.cos(p)]);
  }
  half.push([R + (legLen / 3) * Math.sin(FLARE), TIP, Math.sin(FLARE), Math.cos(FLARE)]);

  const curve = [];                              // whole U: port tip, round the bend, starboard tip
  for (let i = half.length - 1; i >= 0; i--) {
    const [x, y, tx, ty] = half[i];
    curve.push([-x, y, tx, -ty]);
  }
  curve.push(...half.slice(1));
  group.add(new THREE.Mesh(sweepHalfRound(curve, THICK, WIDE), steel));

  const pin = new THREE.Mesh(new THREE.CylinderGeometry(PIN_R, PIN_R, PIN_L, 20), steel);
  pin.position.y = -PIN_L / 2;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.0135, 0.0135, 0.012, 24), steel);
  collar.position.y = 0.006;                     // the sleeve on top of the pin, standing on the rim
  const weld = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.0135, 0.0025, 24), steel);
  weld.position.y = 0.0125;                      // bead where the fork is welded onto the collar
  const eyeY = -PIN_L - 0.0045;                  // small eye at the foot for the chain
  const eye = new THREE.Mesh(new THREE.TorusGeometry(0.00625, 0.00175, 8, 20), steel);
  eye.position.y = eyeY;                         // stands in x-y, overlapping the end of the pin
  group.add(pin, collar, weld, eye);

  group.userData.materials = [steel];
  group.userData.eye = new THREE.Vector3(0, eyeY, 0);
  group.userData.seat = SEAT;
  group.userData.tip = new THREE.Vector2(HALF + (legLen / 3) * Math.sin(FLARE), TIP);   // inside of a leg at its end
  group.userData.pin = PIN_L;
  return group;
}

/** Knevel: the toggle on the end of the dol's chain, dropped through a hole to stow the dol. */
export function makeKnevel() {
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.75, roughness: 0.4 });
  const group = new THREE.Group();
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.060, 14), steel);
  bar.rotation.z = Math.PI / 2;                  // 6 mm bar, lying along local x
  const RING = 0.002;                            // the bar hangs in the bottom of the ring's eye
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.0065, 0.0015, 8, 20), steel);
  ring.position.y = RING;
  group.add(bar, ring);
  group.userData.materials = [steel];
  group.userData.ring = new THREE.Vector3(0, RING, 0);
  return group;
}

const _along = new THREE.Vector3(); const _linkQ = new THREE.Quaternion(); const _roll = new THREE.Quaternion();
const _X = new THREE.Vector3(1, 0, 0);

/** Lay the links of a kettinkje evenly along a path of points; every other link stands at right angles. */
export function layChain(links, path) {
  const run = [0];
  for (let i = 1; i < path.length; i++) run.push(run[i - 1] + path[i].distanceTo(path[i - 1]));
  const total = run[run.length - 1] || 1e-9;
  let seg = 1;
  links.forEach((link, i) => {
    const s = ((i + 0.5) / links.length) * total;
    while (seg < path.length - 1 && run[seg] < s) seg++;
    const k = (s - run[seg - 1]) / Math.max(run[seg] - run[seg - 1], 1e-9);
    link.position.lerpVectors(path[seg - 1], path[seg], k);
    _along.subVectors(path[seg], path[seg - 1]).normalize();
    link.quaternion.setFromUnitVectors(_X, _along);          // a link lies along the chain, not across it
    if (i % 2) link.quaternion.premultiply(_roll.setFromAxisAngle(_along, Math.PI / 2));
  });
}

/**
 * Mik: the crutch the lowered giek, gaffel and sail rest in (and the mast when it is down). Its
 * foot stands in the mikhouders on the achterschot. Vademecum p. 35, "MIK eindbewerking
 * verzinken": a solid bar of 20 ø, 1210 mm over all, with two hoops bent from 12 ø rod, both in
 * one plane and both opening towards the fork end - the end hoop welded by the middle of its bend
 * onto the end of the bar, the side hoop by one of its legs against the side of it, 180 mm down.
 * Origin: the foot of the bar, which runs up local +y; the hoops lie in the local x-y plane with
 * the side hoop on the +x side.
 */
export function makeMik() {
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.75, roughness: 0.4 });
  const group = new THREE.Group();

  const BAR_R = 0.010; const BAR_L = 1.120;      // 20 ø massief; 1210 over all less the end hoop
  const ROD_R = 0.006;                           // 12 ø rod
  const HALF = 0.050 + ROD_R;                    // leg centre-lines: 100 mm inside between them
  const DEEP = 0.090;                            // outside of the bend to the tips of the legs
  const SIDE_TIP = BAR_L - 0.180;                // the side hoop spans 180 .. 270 from the fork end

  const bar = new THREE.Mesh(new THREE.CylinderGeometry(BAR_R, BAR_R, BAR_L, 20), steel);
  bar.position.y = BAR_L / 2;
  group.add(bar);

  // One hoop, swept as a tube along its centre-line: a straight leg down from x0, a semicircular
  // bend, a straight leg back up to x1. The curvature never changes sign, so the section cannot
  // flip. Returns the deepest point inside the bend, where a spar comes to rest.
  const hoop = (x0, x1, tip) => {
    const xc = (x0 + x1) / 2; const r = Math.abs(x1 - x0) / 2; const s = Math.sign(x1 - x0);
    const yc = tip - DEEP + ROD_R + r;           // centre of the bend
    const P = [];
    for (let k = 0; k < 4; k++) P.push(new THREE.Vector3(x0, tip - ((tip - yc) * k) / 4, 0));
    for (let k = 0; k <= 24; k++) {
      const a = (Math.PI * k) / 24;
      P.push(new THREE.Vector3(xc - s * r * Math.cos(a), yc - r * Math.sin(a), 0));
    }
    for (let k = 1; k <= 4; k++) P.push(new THREE.Vector3(x1, yc + ((tip - yc) * k) / 4, 0));
    const curve = new THREE.CatmullRomCurve3(P, false, 'centripetal');
    group.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 96, ROD_R, 16, false), steel));
    for (const x of [x0, x1]) {                  // the sawn ends of the rod
      const cap = new THREE.Mesh(new THREE.CircleGeometry(ROD_R, 16), steel);
      cap.rotation.x = -Math.PI / 2; cap.position.set(x, tip, 0);
      group.add(cap);
    }
    return new THREE.Vector3(xc, yc - r + ROD_R, 0);
  };

  const fork = hoop(-HALF, HALF, BAR_L + DEEP);
  const sideFork = hoop(BAR_R + ROD_R, BAR_R + ROD_R + 2 * HALF, SIDE_TIP);

  const collar = new THREE.Mesh(new THREE.TorusGeometry(BAR_R, 0.0035, 8, 20), steel);
  collar.position.y = BAR_L; collar.rotation.x = Math.PI / 2;   // weld round the end of the bar
  group.add(collar);
  const BEAD_R = 0.003;                          // fillet along the seam of the side hoop, both sides
  const d = BAR_R + ROD_R; const SEAM = 0.034;
  const bx = (d * d + (BAR_R + BEAD_R) * (BAR_R + BEAD_R) - (ROD_R + BEAD_R) * (ROD_R + BEAD_R)) / (2 * d);
  const bz = Math.sqrt((BAR_R + BEAD_R) * (BAR_R + BEAD_R) - bx * bx);
  for (const z of [-bz, bz]) {
    const bead = new THREE.Mesh(new THREE.CylinderGeometry(BEAD_R, BEAD_R, SEAM, 8), steel);
    bead.position.set(bx, SIDE_TIP + 0.001 - SEAM / 2, z);
    group.add(bead);
  }

  group.userData.materials = [steel];
  group.userData.length = BAR_L;
  group.userData.fork = fork;
  group.userData.sideFork = sideFork;
  group.userData.radius = BAR_R;
  return group;
}

/**
 * Stootwil: a dark blue fender, 300 mm over all and 82 ø, its ends rounded shut. Hangs from the
 * origin, its axis down -y.
 */
export function makeStootwil() {
  const vinyl = new THREE.MeshStandardMaterial({ color: 0x1a2b52, roughness: 0.45 });
  const L = 0.300; const R = 0.041; const END = 0.040;          // END: how far the rounding runs
  const profile = [];
  for (let k = 0; k <= 8; k++) {                                // top: from the pole out to the side
    const a = (Math.PI / 2) * (k / 8);
    profile.push(new THREE.Vector2(R * Math.sin(a), -END * (1 - Math.cos(a))));
  }
  for (let k = 0; k <= 8; k++) {                                // bottom: from the side in to the pole
    const a = (Math.PI / 2) * (k / 8);
    profile.push(new THREE.Vector2(R * Math.cos(a), -(L - END) - END * Math.sin(a)));
  }
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 20), vinyl);
  const group = new THREE.Group();
  group.add(body);
  group.userData.length = L;
  group.userData.radius = R;
  return group;
}

const galvanised = () => new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.75, roughness: 0.45 });

/**
 * A rivet across the boat (along z) through `centre`, `half` from the middle to either outer face:
 * a shank of radius r, closed with a flattened head on both faces. Built where it is in model space.
 */
export function makeRivet(centre, r, half) {
  const steel = galvanised();
  const group = new THREE.Group();
  const shank = new THREE.CylinderGeometry(r, r, 2 * half, 16).rotateX(Math.PI / 2);
  group.add(new THREE.Mesh(shank.translate(centre.x, centre.y, centre.z), steel));
  for (const side of [-1, 1]) {
    const head = new THREE.SphereGeometry(r * 1.6, 20, 6, 0, Math.PI * 2, 0, Math.PI / 2);
    head.scale(1, 0.35, 1).rotateX(side * Math.PI / 2).translate(centre.x, centre.y, centre.z + side * half);
    group.add(new THREE.Mesh(head, steel));
  }
  return group;
}

/** Short hex-head bolts standing in holes of a flat plate: `points` are the hole centres on its top. */
export function makeBolts(points, r) {
  const steel = galvanised();
  const group = new THREE.Group();
  const HEAD = 0.004;                            // M6: 10 mm across the flats, 4 mm high
  for (const p of points) {
    const head = new THREE.CylinderGeometry(r * 1.9, r * 1.9, HEAD, 6).translate(p.x, p.y + HEAD / 2, p.z);
    const washer = new THREE.CylinderGeometry(r * 2.1, r * 2.1, 0.0012, 20).translate(p.x, p.y + 0.0006, p.z);
    group.add(new THREE.Mesh(head, steel), new THREE.Mesh(washer, steel));
  }
  return group;
}

/** Masthead wind vane: the red vane streams downwind, the wire frame points into the wind (+x). */
export function makeWindVane() {
  const group = new THREE.Group();
  const metal = new THREE.MeshStandardMaterial({ color: 0xb9bec4, metalness: 0.7, roughness: 0.35 });
  const red = new THREE.MeshStandardMaterial({ color: 0xcc1f2c, roughness: 0.6, side: THREE.DoubleSide });
  const P = (x, y, z) => new THREE.Vector3(x, y, z);
  const rod = (from, to, r = 0.0035) => {
    const dir = new THREE.Vector3().subVectors(to, from);
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, dir.length(), 8), metal);
    mesh.position.copy(from).addScaledVector(dir, 0.5);
    mesh.quaternion.setFromUnitVectors(P(0, 1, 0), dir.clone().normalize());
    return mesh;
  };
  const WIRE = 0.0012;                                             // 2.4 mm wire
  group.add(rod(P(0, -0.20, 0), P(0, 0.075, 0), 0.0022));          // spindle and the post it turns on
  group.add(rod(P(0, 0.072, 0), P(0.175, 0.014, 0), WIRE),         // wire frame, pointing into the wind
            rod(P(0, -0.020, 0), P(0.175, 0.014, 0), WIRE),
            rod(P(0.055, 0.052, 0), P(0.06, -0.006, 0), WIRE));    // the stay across it
  const vane = new THREE.Mesh(new THREE.PlaneGeometry(0.10, 0.092), red);
  vane.position.set(-0.05, 0.026, 0);                              // hangs off the same post
  group.add(vane);
  return group;
}

/** Flat arrow on the water showing which way the boat is rowed: points along +x, tail at the origin. */
export function makeCourseArrow() {
  const s = new THREE.Shape();
  s.moveTo(0, -0.11); s.lineTo(0.95, -0.11); s.lineTo(0.95, -0.30); s.lineTo(1.55, 0);
  s.lineTo(0.95, 0.30); s.lineTo(0.95, 0.11); s.lineTo(0, 0.11); s.closePath();
  const material = new THREE.MeshBasicMaterial({ color: 0x1f9d55, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false });
  const arrow = new THREE.Mesh(new THREE.ShapeGeometry(s), material);
  arrow.rotation.x = -Math.PI / 2;                 // lay it flat: shape y -> model -z
  const group = new THREE.Group();
  group.add(arrow);
  group.userData.materials = [material];
  return group;
}

/** Flat arrow on the water showing where the wind comes from. */
export function makeWindArrow() {
  const s = new THREE.Shape();                    // points along +x, tail at the origin
  s.moveTo(0, -0.14); s.lineTo(1.15, -0.14); s.lineTo(1.15, -0.38); s.lineTo(1.9, 0);
  s.lineTo(1.15, 0.38); s.lineTo(1.15, 0.14); s.lineTo(0, 0.14); s.closePath();
  const material = new THREE.MeshBasicMaterial({
    color: 0x1769c4, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false,
  });
  const arrow = new THREE.Mesh(new THREE.ShapeGeometry(s), material);
  arrow.rotation.x = -Math.PI / 2;                // lay it flat: shape y -> model -z

  const canvas = document.createElement('canvas');
  canvas.width = 256; canvas.height = 96;
  const ctx = canvas.getContext('2d');
  ctx.font = '700 64px "Helvetica Neue", Helvetica, Arial, sans-serif';
  ctx.fillStyle = '#1769c4'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('wind', 128, 50);
  const label = new THREE.Sprite(new THREE.SpriteMaterial({
    map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false,
  }));
  label.scale.set(1.2, 0.45, 1); label.position.set(0.3, 0.55, 0);

  const group = new THREE.Group();
  group.add(arrow, label);
  group.userData.materials = [material, label.material];
  return group;
}

/** Waterline of the hull at height `level`: half-breadths found by casting rays at the plating. */
function waterlineOutline(level, hullMeshes) {
  const ray = new THREE.Raycaster();
  for (const m of hullMeshes) m.updateWorldMatrix(true, false);
  const starboard = []; const port = [];
  for (let x = -0.2; x <= 6.2; x += 0.04) {
    ray.set(new THREE.Vector3(x, level, 4), new THREE.Vector3(0, 0, -1));
    const sb = ray.intersectObjects(hullMeshes, false)[0];
    ray.set(new THREE.Vector3(x, level, -4), new THREE.Vector3(0, 0, 1));
    const bb = ray.intersectObjects(hullMeshes, false)[0];
    if (sb && bb && sb.point.z > bb.point.z) { starboard.push([x, sb.point.z]); port.push([x, bb.point.z]); }
  }
  return [...starboard, ...port.reverse()];              // closed loop, stern -> bow -> stern
}

/** Water surface with a hole where the boat is, so it does not show inside the hull. */
export function makeWater(level, hullMeshes) {
  const surface = new THREE.Shape();
  surface.absarc(2.8, 0, 14, 0, Math.PI * 2, false);
  const outline = waterlineOutline(level, hullMeshes);
  if (outline.length > 6) {
    const hole = new THREE.Path();                       // shape y is model -z once the mesh lies flat
    outline.forEach(([x, z], i) => (i ? hole.lineTo(x, -z) : hole.moveTo(x, -z)));
    hole.closePath();
    surface.holes.push(hole);
  }
  const water = new THREE.Mesh(
    new THREE.ShapeGeometry(surface, 64),
    new THREE.MeshStandardMaterial({
      color: 0x5f93b5, transparent: true, opacity: 0.32, roughness: 0.25, metalness: 0,
      side: THREE.DoubleSide, depthWrite: false,
    }),
  );
  water.rotation.x = -Math.PI / 2;
  water.position.set(0, level, 0);
  water.renderOrder = 1;
  return water;
}


// An island: a low sandy mound with a sign on it. Nothing of it is in the CAD, so it is
// built here. The group stands at the island's centre on the waterline; its children are in that
// local frame, x and z as in the model, y up out of the water.

const SAND = 0xd9c59b;                                 // the same sand the anchor lies in
const WET = 0xa89070;                                  // darker where the water washes it
const WOOD = 0x8b6a43;
const SEG = 48; const RINGS = 6;                       // round the mound, and out from its crown
const LIP = 0.05;                                      // the beach stands this much proud of the water
const SKIRT = 0.8;                                     // and shelves on this far under it
const BUMP = { x: 1.5, z: -1.3, r: 1.2, h: 0.2 };      // a second, lower hump: not one clean dome
const SIGN = { at: 1.2, post: 1.2, wide: 1.4, high: 0.5, drop: 2 };
const LINES = ['PCRBVHGDvJfvDw==', 'KTNCQHCdvNa7KT9Ga4uP9uHjEj5TIYO1vsk='].map(unpack);

/** The board: dark lettering on pale paint, two lines, the long one fitted to the width. */
function lettering() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024; canvas.height = 366;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#efe4c8'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#c0ad84'; ctx.lineWidth = 8; ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);
  ctx.fillStyle = '#33291a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  const put = (text, y, size) => {
    const font = (px) => `700 ${px}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
    ctx.font = font(size);
    const wide = ctx.measureText(text).width;
    if (wide > 820) ctx.font = font(Math.floor((size * 820) / wide));
    ctx.fillText(text, canvas.width / 2, y);
  };
  put(LINES[0], 126, 82);
  put(LINES[1], 240, 106);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Two posts and a board, the lettering on the +x face: the group is turned to face the boat. */
function makeSign() {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.9 });
  const post = new THREE.CylinderGeometry(0.03, 0.03, SIGN.post, 10);
  for (const s of [-1, 1]) {
    const leg = new THREE.Mesh(post, wood);
    leg.position.set(0, SIGN.post / 2, s * (SIGN.wide / 2 - 0.12));
    group.add(leg);
  }
  const y = SIGN.post - SIGN.high / 2 - 0.08;
  const plank = new THREE.Mesh(new THREE.BoxGeometry(0.04, SIGN.high, SIGN.wide), wood);
  plank.position.set(0, y, 0);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(SIGN.wide - 0.06, SIGN.high - 0.06),
    new THREE.MeshStandardMaterial({ map: lettering(), roughness: 0.95 }));
  face.rotation.y = Math.PI / 2;                       // its normal from +z round to +x
  face.position.set(0.022, y, 0);
  group.add(plank, face);
  return group;
}

/**
 * The island off the bow. `centre` is [x, z] in model space, `facing` an [x, z] direction from
 * the island towards the boat: the sign looks that way and the beach is measured along it.
 */
export function makeIsland({ centre, waterline, facing, radius = 3.5, height = 0.6 }) {
  const toBoat = new THREE.Vector2(facing[0], facing[1]).normalize();
  const wobble = (a) => 1 + 0.09 * Math.sin(3 * a + 0.7) + 0.05 * Math.sin(5 * a - 1.2);   // never a clean circle
  const dome = (t) => (t >= 1 ? 0 : Math.cos((Math.PI / 2) * t) ** 2);   // rounded at the top, dying out level at the rim
  const rim = (a) => radius * wobble(a);
  const sand = (x, z) => height * dome(Math.hypot(x, z) / rim(Math.atan2(z, x)))
    + BUMP.h * dome(Math.hypot(x - BUMP.x, z - BUMP.z) / BUMP.r);

  // the beach: a fan of rings out from the crown, the rim at LIP above the water
  const pos = [0, LIP + sand(0, 0), 0]; const index = [];
  const outline = [];
  for (let j = 1; j <= RINGS; j++) {
    for (let i = 0; i < SEG; i++) {
      const a = (i / SEG) * Math.PI * 2; const r = (rim(a) * j) / RINGS;
      const x = Math.cos(a) * r; const z = Math.sin(a) * r;
      pos.push(x, LIP + sand(x, z), z);
      if (j === RINGS) outline.push(x, z);
    }
  }
  const at = (j, i) => 1 + (j - 1) * SEG + (i % SEG);
  for (let i = 0; i < SEG; i++) index.push(0, at(1, i + 1), at(1, i));
  for (let j = 1; j < RINGS; j++) {
    for (let i = 0; i < SEG; i++) {
      index.push(at(j, i), at(j, i + 1), at(j + 1, i), at(j, i + 1), at(j + 1, i + 1), at(j + 1, i));
    }
  }
  const top = new THREE.BufferGeometry();
  top.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  top.setIndex(index);
  top.computeVertexNormals();
  const mound = new THREE.Mesh(top, new THREE.MeshStandardMaterial({ color: SAND, roughness: 1 }));

  // and what is under water: the same outline shelving in to a flat bottom, so the island is solid
  const wPos = []; const wIndex = [];
  for (let i = 0; i < SEG; i++) wPos.push(outline[i * 2], LIP, outline[i * 2 + 1], outline[i * 2] * 0.72, -SKIRT, outline[i * 2 + 1] * 0.72);
  wPos.push(0, -SKIRT, 0);
  const floor = SEG * 2;
  for (let i = 0; i < SEG; i++) {
    const a = i * 2; const b = ((i + 1) % SEG) * 2;
    wIndex.push(a, b, a + 1, b, b + 1, a + 1, floor, a + 1, b + 1);
  }
  const side = new THREE.BufferGeometry();
  side.setAttribute('position', new THREE.Float32BufferAttribute(wPos, 3));
  side.setIndex(wIndex);
  side.computeVertexNormals();
  const skirt = new THREE.Mesh(side, new THREE.MeshStandardMaterial({ color: WET, roughness: 1 }));

  const sign = makeSign();
  const sx = toBoat.x * SIGN.at; const sz = toBoat.y * SIGN.at;
  const signY = LIP + sand(sx, sz);
  sign.position.set(sx, signY, sz);
  sign.rotation.y = Math.atan2(-toBoat.y, toBoat.x);   // its +x on the boat

  const group = new THREE.Group();
  group.position.set(centre[0], waterline, centre[1]);
  group.add(mound, skirt, sign);
  group.visible = false;

  const UNDER = height + LIP + 0.15;                   // far enough down that nothing of it shows
  return {
    group,
    height: height + LIP,
    radius,
    /** Out of the water as k says, the sign coming up out of the sand over the last of it. */
    rise(k) {
      group.visible = k > 0.001;
      group.position.y = waterline - (1 - k) * UNDER;
      sign.position.y = signY - (1 - k) * SIGN.drop;
    },
    /** A point on the beach `out` metres up from the water's edge, on the line towards the boat. */
    shore(out) {
      const a = Math.atan2(toBoat.y, toBoat.x);
      const r = Math.max(0, rim(a) - out);
      const x = toBoat.x * r; const z = toBoat.y * r;
      return new THREE.Vector3(centre[0] + x, waterline + LIP + sand(x, z), centre[1] + z);
    },
  };
}


// What is out there while the boat is towed: the stern of the boat ahead that has the towline, and
// the wake it leaves on the water. None of this is in the CAD, so it is built here. The water is a
// disc of radius 14 m about x 2.8, and the stern stands at the far edge of it: only its after end
// is really there, and it fades out forward before the water does.

const HULL = 0x2b3740;                             // dark, like a working boat
const DECK = 0x6d6a60;
const STRAKE = 0xd7d1c2;                           // the pale rubbing strake along the sheer
const POST = 0x39332c;

const HALF = 1.1;                                  // half the beam: 2.2 m over the transom
const ROUND = 0.9;                                 // the stern is round in plan: this radius either side of a short flat
const LENGTH = 1.5;                                // how far forward of the transom anything is built
const DRAFT = 0.35;
const FREEBOARD = 0.8;                             // the deck over the water
const CUTS = [0, 0.12, 0.3, 0.55, 0.85, 1.15, 1.5];   // the slices: close together aft, where the plan turns
const STRAKE_AT = 0.16; const STRAKE_HIGH = 0.12; const STRAKE_OUT = 0.035;
const POST_AT = 0.35; const POST_R = 0.06; const POST_H = 0.7;
const POST_EYE = 0.55;                             // the towline takes its turns low round the post

/** Half the beam `x` metres forward of the transom, `out` metres outboard of the planking. */
const half = (x, out = 0) => (x < ROUND ? HALF - ROUND + Math.sqrt(Math.max(ROUND * ROUND - (ROUND - x) ** 2, 0)) : HALF) + out;

/** The plan of the slab between x0 and x1 as a shape: its x is the model's, its y the model's -z. */
function slab(x0, x1, out) {
  const N = 8; const points = [];
  for (let i = 0; i <= N; i++) { const x = THREE.MathUtils.lerp(x0, x1, i / N); points.push(new THREE.Vector2(x, half(x, out))); }
  for (let i = N; i >= 0; i--) { const x = THREE.MathUtils.lerp(x0, x1, i / N); points.push(new THREE.Vector2(x, -half(x, out))); }
  return new THREE.Shape(points);
}

/**
 * The stern of the towing boat, at `at` on the centreline with its transom facing the boat and the
 * hull running forward from there. Every slice along its length has its own materials, so the
 * forward end can be faded out into nothing; fade(k) brings the whole of it in and out.
 * `post` is where the towline is made fast, in model space.
 */
export function makeTugStern({ waterline, at = 15.8 }) {
  const group = new THREE.Group();
  group.name = 'sleepboot';
  group.position.set(at, waterline, 0);
  group.visible = false;
  const coats = [];                                // every material of it, with how solid it is at most
  const coat = (colour, base, extra = {}) => {
    const material = new THREE.MeshStandardMaterial({ color: colour, roughness: 0.75, transparent: true,
                                                      depthWrite: base > 0.999, opacity: base, ...extra });
    coats.push({ material, base });
    return material;
  };
  const upright = (geometry, bottom, materials) => {
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.rotation.x = -Math.PI / 2;                // the extrusion, laid in plan, stands up out of the water
    mesh.position.y = bottom;
    return mesh;
  };
  for (let i = 0; i < CUTS.length - 1; i++) {
    const [x0, x1] = [CUTS[i], CUTS[i + 1]];
    // solid over the transom itself, and from there dying away to nothing at the forward end
    const base = THREE.MathUtils.clamp(1 - ((x0 + x1) / 2 - CUTS[1]) / (LENGTH - CUTS[1]), 0, 1);
    const solid = { depth: DRAFT + FREEBOARD, bevelEnabled: false };
    // the caps of the extrusion are the deck and the bottom, its walls the planking
    group.add(upright(new THREE.ExtrudeGeometry(slab(x0, x1, 0), solid), -DRAFT, [coat(DECK, base), coat(HULL, base)]));
    const band = { depth: STRAKE_HIGH, bevelEnabled: false };
    group.add(upright(new THREE.ExtrudeGeometry(slab(x0, x1, STRAKE_OUT), band), FREEBOARD - STRAKE_AT, coat(STRAKE, base)));
  }
  const bollard = new THREE.Mesh(new THREE.CylinderGeometry(POST_R, POST_R, POST_H, 12), coat(POST, 1));
  bollard.position.set(POST_AT, FREEBOARD + POST_H / 2, 0);
  group.add(bollard);
  return {
    group,
    post: new THREE.Vector3(at + POST_AT, waterline + FREEBOARD + POST_H - POST_EYE, 0),
    /** There as far as k says, and gone at 0. */
    fade(k) {
      group.visible = k > 0.001;
      for (const c of coats) c.material.opacity = c.base * k;
    },
  };
}

const BANDS = [[0.1, 0.1, 1], [0.9, 0.1, 1], [0.5, 0.3, 0.7]];   // across the wake: two edges and a lighter middle
const WAKE_Y = 0.005;                              // it lies this much over the water, and never writes depth

/** Foam: streaks along the wake, rippled along its length so that scrolling it shows movement.
 *  The ripple runs round a whole number of times, so the texture tiles as it streams away. */
function foam() {
  const canvas = document.createElement('canvas');
  canvas.width = 128; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(canvas.width, canvas.height);
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const u = (x + 0.5) / canvas.width; const v = (y + 0.5) / canvas.height;
      let a = 0;
      for (const [centre, wide, strength] of BANDS) a = Math.max(a, strength * Math.exp(-(((u - centre) / wide) ** 2)));
      a = Math.min(1, a * (0.8 + 0.3 * Math.sin(v * Math.PI * 4 + u * 7)));
      const j = (y * canvas.width + x) * 4;
      image.data[j] = 255; image.data[j + 1] = 255; image.data[j + 2] = 255; image.data[j + 3] = Math.round(255 * a);
    }
  }
  ctx.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping; texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 3);
  return texture;
}

/** And what dies away at the far end of it: this one does not scroll, so the end stays where it is. */
function dying() {
  const canvas = document.createElement('canvas');
  canvas.width = 4; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  const grade = ctx.createLinearGradient(0, 0, 0, canvas.height);
  grade.addColorStop(0, '#ffffff'); grade.addColorStop(0.55, '#dddddd'); grade.addColorStop(1, '#000000');
  ctx.fillStyle = grade; ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping; texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}

/**
 * The wake astern of a transom at `from` on the centreline: a flat V on the water, `length` metres
 * long, spreading from `near` to `far` (half widths) as it goes aft. It streams away by itself.
 */
export function makeWake({ waterline, from, length, near, far, strength = 0.95 }) {
  const position = []; const uv = []; const index = [];
  const STEPS = 8;
  for (let i = 0; i <= STEPS; i++) {
    const v = i / STEPS; const wide = THREE.MathUtils.lerp(near, far, v);
    position.push(from - v * length, 0, -wide, from - v * length, 0, wide);
    uv.push(0, v, 1, v);
    if (i > 0) { const a = (i - 1) * 2; index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(position, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  geometry.setIndex(index);
  const map = foam();
  const material = new THREE.MeshBasicMaterial({ map, alphaMap: dying(), transparent: true, opacity: 0,
                                                 depthWrite: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.name = 'kielzog';
  mesh.position.y = waterline + WAKE_Y;
  mesh.renderOrder = 2;
  mesh.visible = false;
  mesh.frustumCulled = false;
  return {
    mesh,
    /** As much of it as k says; nothing at 0. */
    fade(k) { mesh.visible = k > 0.001; material.opacity = k * strength; },
    /** The foam runs away astern while the boat is towed along. */
    stream(dt) { map.offset.y -= dt * 0.35; },
  };
}


// A spinnaker: a big, full sail with no boltropes, flown from the top of the mast on two sheets.
// Nothing of it is in the CAD; the cloth is a grid laid afresh every frame between its three
// corners, with the belly blown out to leeward and a little life in it, like the vlag. Its cloth
// is in four panels, in the colours of the Scouting logo.

const NU = 28; const NV = 18;                                        // across the foot, up to the head
const COLOURS = ['#d7282f', '#2a9d3f', '#f7d117', '#1e63b5'];        // red, green, yellow, blue

function makeCloth() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 512;
  const ctx = canvas.getContext('2d');
  // panels running diagonally, the way the strokes of the logo do, the four colours over and over
  for (let i = -3; i < 7; i++) {
    ctx.fillStyle = COLOURS[((i % 4) + 4) % 4];
    ctx.beginPath();
    const x0 = (i / 4) * 512 - 160; const x1 = ((i + 1) / 4) * 512 - 160;
    ctx.moveTo(x0, 512); ctx.lineTo(x1, 512); ctx.lineTo(x1 + 320, 0); ctx.lineTo(x0 + 320, 0); ctx.closePath();
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/** The sail with its two sheets; `material` is the rope's. */
export function initSpinnaker({ addPart, material }) {
  const cloth = new THREE.BufferGeometry();
  const position = new Float32Array((NU + 1) * (NV + 1) * 3); const uv = []; const index = [];
  for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) uv.push(i / NU, j / NV);
  for (let j = 0; j < NV; j++) {
    for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i; const b = a + 1; const c = a + NU + 1; const d = c + 1;
      index.push(a, c, b, b, c, d);
    }
  }
  cloth.setAttribute('position', new THREE.BufferAttribute(position, 3));
  cloth.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  cloth.setIndex(index);
  const sail = new THREE.Mesh(cloth, new THREE.MeshStandardMaterial({ map: makeCloth(), side: THREE.DoubleSide, roughness: 0.85 }));
  sail.frustumCulled = false;
  addPart(sail, 'spinnaker', 'Spinnaker', 'zeil', 'grootzeil', [4500, 5500, 4500]);
  const sheets = [new RopeLine(20, 0.004, material), new RopeLine(20, 0.004, material)];
  const ropes = new THREE.Group(); ropes.add(sheets[0].mesh, sheets[1].mesh);
  addPart(ropes, 'spinnakerschoten', 'Spinnakerschoten', 'lopend_want', 'grootschoot', [0, 0, 0]);

  const p = new THREE.Vector3(); const centre = new THREE.Vector3(); const across = new THREE.Vector3(); const out = new THREE.Vector3(); const up = new THREE.Vector3(0, 1, 0);
  const SHOULDER = 0.22;                                              // how far the edges bow out beyond the straight head-to-corner line, as a share of the foot
  const shoulder = (v) => v * Math.pow(1 - v, 0.6) / 0.335;          // 0 at foot and head, 1 at about five eighths up
  /**
   * Lay the cloth between head H and the two lower corners A and B, blown out along `downwind`
   * (horizontal unit vector) by `belly` metres at the fullest, at time t. The sail is broadest
   * about two thirds up - its edges bow out well beyond the straight lines from the head to the
   * corners - and narrows to the foot. `hoist` 0..1 gathers the whole sail up at the head.
   * Returns the two corners as they are, for the sheets.
   */
  const lay = (H, A, B, downwind, belly, t, hoist) => {
    across.subVectors(B, A); const footWidth = across.length(); across.normalize();
    for (let j = 0; j <= NV; j++) {
      const v = j / NV;
      centre.lerpVectors(A, B, 0.5).lerp(H, v);
      const half = 0.5 * footWidth * (1 - v) + SHOULDER * footWidth * shoulder(v);
      for (let i = 0; i <= NU; i++) {
        const u = i / NU;
        p.copy(centre).addScaledVector(across, (u - 0.5) * 2 * half);
        // the belly: full from the foot - which bows out between the corners like the foot of
        // the fok - up to well past half way, and closing towards the head
        const full = Math.pow(Math.sin(Math.PI * u), 0.8) * (1 - Math.pow(Math.max(0, (v - 0.35) / 0.65), 1.5));
        p.addScaledVector(downwind, belly * full);
        p.addScaledVector(up, -0.12 * belly * Math.sin(Math.PI * u) * (1 - v) * (1 - v));
        // life in the cloth: a slow wave running up, and a faster one across
        const wave = 0.035 * belly * Math.sin(6 * v - 2.2 * t + 3 * u) + 0.02 * belly * Math.sin(11 * u + 1.6 * t);
        p.addScaledVector(downwind, wave * Math.sin(Math.PI * u) * Math.sin(Math.PI * v));
        p.lerp(H, 1 - hoist);
        p.toArray(position, (j * (NU + 1) + i) * 3);
      }
    }
    cloth.attributes.position.needsUpdate = true;
    cloth.computeVertexNormals();
    cloth.computeBoundingSphere();
    return [A.clone().lerp(H, 1 - hoist), B.clone().lerp(H, 1 - hoist)];
  };
  /** A sheet from a corner to an eye on the rail, hanging in a bight. */
  const sheet = (k, from, to) => {
    const path = [];
    for (let i = 0; i <= 10; i++) {
      const s = i / 10; const q = new THREE.Vector3().lerpVectors(from, to, s);
      q.y -= 0.12 * from.distanceTo(to) * Math.sin(Math.PI * s);
      path.push(q);
    }
    sheets[k].set(path);
  };
  return { sail, ropes, sheets, lay, sheet, out };
}


// Night over the water: the sun goes down to a bluish moon, the sky and the water go dark and the
// toplicht comes on, all over six seconds. When it comes is decided in update(); once it is night,
// looking around does not bring the day back.
//
// The day values are read once, at the start: the sky from the CSS variables the sheet defines,
// the rest from the lights and the water as they stand, so nothing here has to be kept in step
// with style.css, main.js or rig.js.

const IDLE = 60;        // seconds
const FADE = 6;         // seconds to go over, either way

const NIGHT = {
  sun: 0.08, sunColor: 0x9fb4d8, hemi: 0.06, env: 0.05,
  water: 0x0e1a2e, waterOpacity: 0.6, top: '#0b1530', bottom: '#1a2a4a',
};

const smoothstep = (t) => t * t * (3 - 2 * t);
const clamp = THREE.MathUtils.clamp;
const lerp = THREE.MathUtils.lerp;

/**
 * scene, sun, hemi: the lights to dim; wrap: the element the sky gradient hangs on
 * water:    the water mesh, or null - its material darkens and thickens with the rest
 * toplicht: { set(k) } on the masthead light, 0 by day and 1 at night
 * slowest:  the lowest value of the speed slider
 * note:     logboek.note, called once the first night has fully fallen
 */
export function initNight({ scene, sun, hemi, wrap, water, toplicht, slowest = 0.25, note }) {
  const css = getComputedStyle(wrap);
  const day = {
    sun: sun.intensity, hemi: hemi?.intensity ?? 0, env: scene.environmentIntensity ?? 1,
    waterOpacity: water?.material.opacity ?? 0,
  };
  const colours = (from, to) => ({ from: new THREE.Color(from), to: new THREE.Color(to), now: new THREE.Color() });
  const sunColour = colours(sun.color.getHex(), NIGHT.sunColor);
  const waterColour = colours(water ? water.material.color.getHex() : 0xffffff, NIGHT.water);
  const sky = {
    top: colours(css.getPropertyValue('--bg-top').trim() || '#cfe3f1', NIGHT.top),
    bottom: colours(css.getPropertyValue('--bg-bottom').trim() || '#f4f7f9', NIGHT.bottom),
  };

  let k = 0;              // 0 day, 1 night
  let on = false;         // where it is heading
  let forced = null;      // the button overrules the slider until the slider is moved
  let wasSlow = null;
  let idle = 0;
  let told = false;

  const mix = (c, s) => c.now.copy(c.from).lerp(c.to, s);

  const apply = () => {
    const s = smoothstep(k);
    sun.intensity = lerp(day.sun, NIGHT.sun, s);
    sun.color.copy(mix(sunColour, s));
    if (hemi) hemi.intensity = lerp(day.hemi, NIGHT.hemi, s);
    scene.environmentIntensity = lerp(day.env, NIGHT.env, s);
    // inline on the wrapper, so the gradient of the sheet follows without a rule of its own
    wrap.style.setProperty('--bg-top', mix(sky.top, s).getStyle());
    wrap.style.setProperty('--bg-bottom', mix(sky.bottom, s).getStyle());
    if (water) {
      water.material.color.copy(mix(waterColour, s));
      water.material.opacity = lerp(day.waterOpacity, NIGHT.waterOpacity, s);
    }
    toplicht?.set(s);
  };

  /** Anything the user does: it puts off the night, but never sends it away once it is there. */
  const activity = () => { if (!on) idle = 0; };

  const set = (want) => { forced = !!want; on = !!want; if (!want) idle = 0; };

  const update = (dt, speed) => {
    const slow = speed <= slowest + 1e-6;
    if (wasSlow === null) wasSlow = slow;
    if (slow !== wasSlow) { forced = null; wasSlow = slow; }      // moving the slider takes the button's word back
    if (forced !== null) on = forced;
    else if (!slow) { on = false; idle = 0; }
    else if (!on) { idle += dt; if (idle >= IDLE) on = true; }
    const was = k;
    k = clamp(k + (on ? dt : -dt) / FADE, 0, 1);
    if (k !== was) apply();                                       // standing still costs nothing
    if (k >= 1 && !told) { told = true; note?.('nz'); }
    return k;
  };

  apply();
  return { get on() { return on; }, get k() { return k; }, set, update, activity };
}
