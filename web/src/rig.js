import * as THREE from 'three';

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
  const geometry = new THREE.TorusGeometry(0.0085, 0.0022, 6, 14);
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
 * Blokje: a small single block hanging from an eye by its shackle. Origin = where it hangs from,
 * the sheave (radius userData.sheave, centre userData.centre below the origin) stands in the
 * local x-y plane.
 */
export function makeBlokje() {
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa0a6, metalness: 0.75, roughness: 0.4 });
  const group = new THREE.Group();
  const R = 0.016; const DROP = 0.050;
  const shackle = new THREE.Mesh(new THREE.TorusGeometry(0.010, 0.0022, 8, 20), steel);
  shackle.position.y = -0.008; shackle.rotation.y = Math.PI / 2;   // through the eye, across the block
  const sheave = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.010, 24), steel);
  sheave.rotation.x = Math.PI / 2; sheave.position.y = -DROP;
  const cheek = new THREE.Shape();                                  // pear-shaped cheek plate
  cheek.absarc(0, -DROP, R + 0.006, Math.PI * 1.12, Math.PI * 1.88, false);
  cheek.lineTo(0.006, -0.012); cheek.lineTo(-0.006, -0.012); cheek.closePath();
  for (const z of [-0.0075, 0.0055]) {
    const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(cheek, { depth: 0.002, bevelEnabled: false }), steel);
    plate.position.z = z;
    group.add(plate);
  }
  group.add(shackle, sheave);
  group.userData.materials = [steel];
  group.userData.sheave = R; group.userData.centre = new THREE.Vector3(0, -DROP, 0);
  return group;
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
  for (let k = 0; k <= 12; k++) {                               // top: from the pole out to the side
    const a = (Math.PI / 2) * (k / 12);
    profile.push(new THREE.Vector2(R * Math.sin(a), -END * (1 - Math.cos(a))));
  }
  for (let k = 0; k <= 12; k++) {                               // bottom: from the side in to the pole
    const a = (Math.PI / 2) * (k / 12);
    profile.push(new THREE.Vector2(R * Math.cos(a), -(L - END) - END * Math.sin(a)));
  }
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 32), vinyl);
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
