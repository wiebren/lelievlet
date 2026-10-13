// Krachten: a steady-state model of the forces on a lelievlet, for the explanation layer. No
// simulation: for a course, a wind and a trim it finds the forces as they stand once the boat
// sails at an even speed - and then they balance, which is the point of half the explanations.
//
// Frames. Everything is in model space: x forward (the spiegel at 0, the voorsteven at 5.6 m), y up
// (the bottom of the vlak at 0, the waterline at 0.30 m), z to stuurboord. The boat never yaws in the
// viewer, so a horizontal direction in the boat is one in the world; she only heels, about the x
// axis through the waterline. A course is signed as in modes.js: positive, the wind comes over
// stuurboord and the sails stand to bakboord.
//
// The numbers. No book gives forces, stabiliteit or the place of the zeilpunt and lateraal punt of a
// lelievlet (notities/krachten/boek-katwijk-en-anderen.md § 15), so what follows is estimated and
// tuned to give lengths and angles that look right: about 6 degrees of helling at 3 Bft halve wind,
// 4 degrees of verlijeren aan de wind with the zwaard down. The arrows only show lengths, never
// numbers (notities/krachten/voorstel.md).

const RHO_AIR = 1.2;
const RHO_WATER = 1000;
const G = 9.81;

/** Wind speed per Beaufort, the middle of each band (m/s). */
export const BFT = [0.2, 1, 2.5, 4.4, 6.7, 9.4, 12.3];

// Boat speed through the water as a part of the true wind, per course; the hull caps it (the
// golfsnelheid of a 5 m waterline is about 2.8 m/s).
const POLAR = [[0, 0], [38, 0], [45, 0.42], [60, 0.55], [90, 0.65], [120, 0.62], [150, 0.52], [180, 0.45]];
const HULL_SPEED = 2.8;

const MASS_BOAT = 950;            // kg, rigged and equipped (900 - 1000 kg, scoutwiki)
const MASS_CREW = 4 * 65;         // four aboard
const G_BOAT = [2.9, 0.45, 0];    // zwaartepunt of boat and gear (the steel hull is low, the mast high)
// where they sit: "aan loef" moves their weight `reach` from the middle on average - not all four sit out
// on the gangboord (0.72 m), and not all the time
const CREW = { x: 2.3, y: 0.85, reach: 0.36 };
// water in the kuip: where its weight sits, off the middle to the low side (m, and m per degree of helling)
const WATER_IN = { x: 2.7, y: 0.25, reach: 0.3, spread: 0.008 };
export const WATER_VOL = 350;     // kg: water well over the buikdenning - more runs out over the dolboord at lij
const ROLL_Y = 0.30;              // she heels about the waterline (modes.js)
// Righting arm of the hull on its own about G_BOAT, per degree of helling: vormstabiel, steep at
// first and falling off once the berghout goes under at about 20 degrees.
const GZ = [[0, 0], [5, 0.07], [10, 0.13], [15, 0.175], [20, 0.205], [25, 0.21], [30, 0.2], [40, 0.15], [50, 0.08], [60, 0.01], [70, -0.05]];
export const BERGHOUT_ONDER = 19; // degrees: from here the berghout is in the water (KATZ p. 66: tijd om te reven)
export const HELLING_FLINK = 12;  // degrees: a flinke helling, said in yellow
export const HELM_MOST = 45;      // degrees: the most the roer gives - past what that holds she turns whatever you do

// Sail coefficients by angle of attack (degrees between the chord and the apparent wind): lift
// across the wind and drag along it. Up to 30 degrees the flow follows the sail; beyond it lets go
// and the sail is a plate the wind pushes on (te strak, and voor de wind).
const CL = [[0, 0], [3, 0.3], [8, 0.95], [14, 1.35], [18, 1.42], [24, 1.15], [30, 0.6]];
const CD = [[0, 0.03], [8, 0.07], [14, 0.13], [18, 0.2], [24, 0.32], [30, 0.4]];
const PLATE = 1.3;
export const TRIM = { los: 1.5, goed: 15, strak: 29 };   // the angle of attack each schoot setting aims for

// Rudder: the force stands square to the blade and grows with sin of the angle (Sint Maarten KB III
// § 7.9: at 45 degrees sturend and remmend are about the same, beyond it mostly the remmende grows).
const RUDDER = { area: 0.15, cn: 2.0, x: 0.12, y: 0.12 };

// Lateral resistance: where each driftbeperkend middel works and how much it takes; the weights place
// the lateraal punt. It is taken with the zwaard down, whatever the zwaard does: the lesboeken give it
// one place, and the driftbeperkende kracht there does not move when the zwaard goes up. What the
// zwaard does change is the verlijering: side force = LEEWAY_K * grip * 1/2 rho V^2 * angle, where
// grip is 1 with it down and falls off fast as it comes up - a quarter of it half up, an eighth when
// up: 4 degrees aan de wind in 3 Bft becomes 15 and 30.
const LATERAL = [
  { naam: 'onderwaterschip', x: 3.15, y: 0.15, w: 1.0 },
  { naam: 'scheg', x: 0.85, y: 0.2, w: 0.12 },
  { naam: 'roer', x: 0.15, y: 0.12, w: 0.12 },
  { naam: 'zwaard', x: 2.98, y: -0.15, w: 1.6 },               // down: measured from the model
];
const BOARD_DEPTH = 0.607;
const LEEWAY_K = 3.13;
const GRIP_UP = 4 / 30;                                         // what is left with the zwaard up
const GRIP_POWER = 3.43;                                        // half (0.35 of 0.61 m) gives 4 / 15
const grip = (depth) => GRIP_UP + (1 - GRIP_UP) * clamp(depth / BOARD_DEPTH, 0, 1) ** GRIP_POWER;

export const interp = (table, x) => {
  if (x <= table[0][0]) return table[0][1];
  for (let i = 1; i < table.length; i++) {
    if (x <= table[i][0]) {
      const [x0, y0] = table[i - 1]; const [x1, y1] = table[i];
      return y0 + ((y1 - y0) * (x - x0)) / (x1 - x0);
    }
  }
  return table[table.length - 1][1];
};
const rad = (d) => (d * Math.PI) / 180;
const deg = (r) => (r * 180) / Math.PI;
const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

/** A point of the boat after a heel of `theta` (radians about +x; positive: the mast to stuurboord). */
export function heeled([x, y, z], theta) {
  const c = Math.cos(theta); const s = Math.sin(theta); const dy = y - ROLL_Y;
  return [x, ROLL_Y + dy * c - z * s, dy * s + z * c];
}

/** Lift and drag coefficients at an angle of attack in degrees (0 .. 180). */
export function sailCoefficients(alpha) {
  const a = Math.abs(alpha);
  if (a <= 30) return { cl: interp(CL, a), cd: interp(CD, a) };
  const s = Math.sin(rad(Math.min(a, 180)));
  return { cl: PLATE * s * Math.cos(rad(a)), cd: PLATE * s * s + 0.05 };
}

/** How a sail stands at that angle of attack: as Sint Maarten KB III § 7.4 names it. */
export const sailState = (alpha) => (alpha < 4 ? 'klappert' : alpha <= 22 ? 'goed' : alpha <= 60 ? 'te strak' : 'duwt');

export function boatSpeed(course, tws) {
  const r = interp(POLAR, Math.abs(course));
  return HULL_SPEED * Math.tanh((r * tws) / HULL_SPEED);
}

/**
 * The forces, for one moment.
 *   course   degrees, signed (modes.js)
 *   tws      true wind speed, m/s
 *   vaart    the boat speed as a part of what she would sail at (1), or 0 lying still
 *   sails    [{ naam, area, point: [x,y,z], chord: [dx, dz] }] - from the model as it stands: the point
 *            is the middle of the cloth, the chord runs from the voorlijk to the achterlijk
 *   board    { depth }: how far the zwaard sticks out under the vlak, or null
 *   crew     -1 aan lij .. 0 midden .. +1 aan loef
 *   helm     the rudder angle in degrees (positive: the blade to stuurboord); 'recht' for the one that
 *            holds her straight, worked out here at the heel drawn; or null for no roer at all
 *   heel     true: let her heel; false: upright
 *   push     for "kracht en koppel": { x (along the boat), force N }, or null
 *   drawAt   the heel (radians, as modes.js) to give the points at - the one the boat is shown with,
 *            which eases towards the one found here - or null for that one
 */
export function solve({ course, tws, vaart = 1, sails, board, crew = 0, helm = null, heel = true, push = null, drawAt = null, water = 0 }) {
  const side = Math.sign(course) || 1;          // +1: wind over stuurboord, lij is bakboord (-z)
  const beta = rad(Math.abs(course));
  const V = vaart * boatSpeed(course, tws);
  // the wind as the air moves, in the horizontal plane [x, z]: the ware wind comes from `course` off
  // the bow on the loef side, the vaartwind from dead ahead
  const ware = [-tws * Math.cos(beta), -side * tws * Math.sin(beta)];
  const vaartwind = [-V, 0];
  const schijnbaar = [ware[0] + vaartwind[0], ware[1] + vaartwind[1]];
  const aws = Math.hypot(...schijnbaar);
  const awa = aws > 1e-6 ? deg(Math.atan2(Math.abs(schijnbaar[1]), -schijnbaar[0])) : 0;
  const q = 0.5 * RHO_AIR * aws * aws;
  const flow = aws > 1e-6 ? [schijnbaar[0] / aws, schijnbaar[1] / aws] : [0, 0];

  // -- each sail: lift across the flow, drag along it
  const zeilen = sails.map((s) => {
    const len = Math.hypot(s.chord[0], s.chord[1]) || 1;
    const c = [s.chord[0] / len, s.chord[1] / len];
    const alpha = deg(Math.acos(clamp(c[0] * flow[0] + c[1] * flow[1], -1, 1)));
    const { cl, cd } = sailCoefficients(alpha);
    // lift points to the side the wind is turned away from: the side of the chord the flow does not come from
    const cross = c[0] * flow[1] - c[1] * flow[0];
    const turn = cross >= 0 ? 1 : -1;
    const lift = [-turn * flow[1], turn * flow[0]];
    const k = q * s.area;
    const f = [k * (cl * lift[0] + cd * flow[0]), k * (cl * lift[1] + cd * flow[1])];
    // bak: the sail stands on the loef side, so the wind is in its back
    const bak = s.chord[1] * side > 0.05 * len;
    return { naam: s.naam, point: s.point, force: f, alpha, stand: bak ? 'bak' : sailState(alpha) };
  });
  const sum = zeilen.reduce((a, z) => [a[0] + z.force[0], a[1] + z.force[1]], [0, 0]);

  // -- lateraal punt: the driftbeperkende middelen together
  const W = LATERAL.reduce((a, p) => a + p.w, 0);
  const lp = [LATERAL.reduce((a, p) => a + p.w * p.x, 0) / W, LATERAL.reduce((a, p) => a + p.w * p.y, 0) / W, 0];

  // -- helling: the kenterend koppel of the side force between zeilpunt and lateraal punt against the
  // oprichtend koppel of weight and buoyancy. Solved for the angle where they are equal.
  const crewZ = side * crew * CREW.reach;
  const wBoat = MASS_BOAT * G; const wCrew = MASS_CREW * G; const wWater = water * G; const wAll = wBoat + wCrew + wWater;
  const ce0 = centre(zeilen);
  const heelAt = (phi) => {                          // phi degrees to lij, negative to loef
    const theta = -side * rad(phi);
    const gb = heeled(G_BOAT, theta); const gc = heeled([CREW.x, CREW.y, crewZ], theta);
    // water in the boat runs to the low side, further the more she heels - lying upright it lies in the middle
    const lever = WATER_IN.reach * clamp(phi / 5, -1, 1) + Math.sign(phi) * WATER_IN.spread * Math.min(Math.abs(phi), 40);
    const gw = heeled([WATER_IN.x, WATER_IN.y, -side * lever], theta);
    const g = [0, 1, 2].map((i) => (wBoat * gb[i] + wCrew * gc[i] + wWater * gw[i]) / wAll);   // the zwaartepunt: boat, tuig, crew and water
    const b = [gb[0], 0.12, gb[2] - side * Math.sign(phi) * interp(GZ, Math.abs(phi))];        // the drukpunt, gone over to lij
    const right = wAll * (g[2] - b[2]) * side;                      // > 0 rights her
    const ce = heeled(ce0, theta); const l = heeled(lp, theta);
    const tilt = Math.cos(rad(phi)) ** 2;                            // a heeled sail catches less
    const tip = Math.abs(sum[1]) * tilt * (ce[1] - l[1]);
    return { phi, theta, g, b, right, tip, ce, lp: l, tilt };
  };
  // phi from -25 (to loef: the crew outweighs a light wind) up; where the koppels are equal she stays
  const net = (phi) => { const s = heelAt(phi); return s.tip - s.right; };   // > 0: she heels further to lij
  let h = heelAt(0);
  let omslaan = false;
  if (heel) {
    let top = 0; let best = -Infinity;                               // the top of the oprichtend koppel
    for (let p = 0; p <= 60; p += 1) { const r = heelAt(p).right; if (r > best) { best = r; top = p; } }
    if (net(top) > 0) { omslaan = true; h = heelAt(top); }           // past it nothing holds her: she goes over
    else {
      let lo = -25; let hi = top;
      for (let i = 0; i < 32; i++) { const mid = (lo + hi) / 2; if (net(mid) > 0) lo = mid; else hi = mid; }
      h = heelAt((lo + hi) / 2);
    }
  }
  // the angle found is reported; the points are where they are at the heel shown
  const found = h;
  if (drawAt !== null) h = heelAt(-side * deg(drawAt));
  const theta = h.theta;

  // -- where it all works, after the helling
  const zeilenH = zeilen.map((z) => ({ ...z, force: [z.force[0] * h.tilt, z.force[1] * h.tilt], at: heeled(z.point, theta) }));
  const ceH = h.ce; const lpH = h.lp;
  sum[0] *= h.tilt; sum[1] *= h.tilt;
  const voortstuwend = sum[0];
  const verlijerend = sum[1];
  // verlijeren: the angle the hull and zwaard need to make that side force
  const k = LEEWAY_K * grip(board?.depth ?? 0);
  const qw = 0.5 * RHO_WATER * Math.max(V, 0.3) ** 2;
  const verlijering = clamp(deg(Math.abs(verlijerend) / (k * qw)), 0, 35);
  // the water: as much against the side as the sails push, and a weerstand as big as the drive
  const drift = [0, -verlijerend];
  const weerstand = [-voortstuwend, 0];

  // -- gieren: the koppel about the lateraal punt (vertical axis). (r - lp) x F, the y part: > 0 turns
  // the bow to bakboord. Oploeven is turning to the loef side, so oploevend = -side * M.
  const yawOf = (at, f) => (at[2] - lpH[2]) * f[0] - (at[0] - lpH[0]) * f[1];
  const perZeil = zeilenH.map((z) => -side * yawOf(z.at, z.force));
  // the weerstand pulls in the middle of the hull, the drift in the lateraal punt: only the sails
  const gier = perZeil.reduce((a, m) => a + m, 0);

  // -- het roer: square to the blade, in the water at V. To hold her straight it has to answer the
  // gier: a loefgierige boat needs a force at the stern to the loef side, and the water pushes the
  // blade away from the side its achterkant points to - so the blade to lij, the helmstok to loef.
  const rudderAt = heeled([RUDDER.x, RUDDER.y, 0], theta);
  const rudderK = 0.5 * RHO_WATER * V * V * RUDDER.area * RUDDER.cn;
  const rudderArm = lpH[0] - RUDDER.x;
  // Square to the blade it gives rudderK sin a; across the boat - what holds her - that times cos a, so
  // rudderK sin a cos a = rudderK sin 2a / 2: the most at 45 degrees (HELM_MOST), where this stops.
  const hold = Math.abs(gier) / rudderArm;
  const helmNeeded = rudderK > 1e-6 ? Math.sign(gier) * deg(Math.asin(clamp((2 * hold) / rudderK, 0, 1)) / 2) : 0;   // + : helmstok naar loef
  // a yardstick for gier koppels: what the roer holds with the helmstok 15 degrees over
  const roerMaat = rudderK * Math.sin(rad(15)) * Math.cos(rad(15)) * rudderArm;
  let roer = null;
  if (helm !== null) {
    const a = rad(helm === 'recht' ? -side * helmNeeded : helm);      // + : the achterkant of the blade to stuurboord
    const n = Math.abs(Math.sin(a)) * rudderK;
    // it turns the water to stuurboord, so the force is to bakboord - and aft, the blade being across the stream
    const f = [-n * Math.abs(Math.sin(a)), -Math.sign(a) * n * Math.cos(a)];
    roer = { at: rudderAt, force: f, sturend: [0, f[1]], remmend: [f[0], 0], koppel: yawOf(rudderAt, f) };   // koppel > 0: the bow to bakboord
  }

  // -- a push by hand, for the first lesson
  let duw = null;
  if (push) {
    const at = heeled([push.x, 0.75, 0.95], theta);
    const f = [0, -push.force];
    duw = { at, force: f, arm: push.x - lpH[0], koppel: yawOf(at, f) };      // koppel > 0: the bow to bakboord
  }

  return {
    course, side, V, tws, aws, awa, ware, vaartwind, schijnbaar,
    zeilen: zeilenH, zeilkracht: { at: ceH, force: sum, size: Math.hypot(...sum) }, voortstuwend, verlijerend,
    lp: lpH, drift, weerstand, verlijering,
    gier, perZeil, helmNeeded, rudderK, roerMaat, roer, duw,
    helling: { phi: found.phi, theta: found.theta, omslaan, g: h.g, b: h.b, right: h.right, tip: h.tip,
               weight: wAll },
  };
}

/** The zeilpunt: where the side forces of the sails together work (each sail by how hard it pushes). */
function centre(zeilen) {
  let w = 0; const p = [0, 0, 0];
  for (const z of zeilen) {
    const f = Math.hypot(...z.force);
    w += f; for (let i = 0; i < 3; i++) p[i] += f * z.point[i];
  }
  if (w < 1e-9) {
    for (const z of zeilen) for (let i = 0; i < 3; i++) p[i] += z.point[i] / zeilen.length;
    return zeilen.length ? p : [3, 2.8, 0];
  }
  return p.map((v) => v / w);
}
