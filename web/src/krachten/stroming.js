// Stroming langs de zeilen, as Sint Maarten draws it (KB III fig. 7.7, 7.17 to 7.19): lines of the air seen from
// above as it goes round fok and grootzeil, the plus and minus of the pressure on either side, and how the flow
// goes when a sail stands goed, te strak or te los. Not a flow simulation: lines drawn to look like the book's,
// on the sail as it stands in the model (its onderlijk, as the schema draws it: index.js shapes).
//
// Everything in the boat's frame: x to the bow, z to stuurboord, at the height `y` the lines are drawn at.

const AFSTANDEN = [0.75, 0.28];               // m: the lines either side of a sail, the nearest last
const LOEF = [0.28];                          // on loef only the near one: further out it runs across the boat's deck
const STAP = 0.12;                            // m between the points of a line

const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const norm = (v) => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };
const lerp2 = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
const smooth = (e0, e1, x) => { const t = Math.min(Math.max((x - e0) / (e1 - e0), 0), 1); return t * t * (3 - 2 * t); };

/**
 * The onderlijk of a sail from above: hals and schoot [x, z], its bolling to lij (side: +1 the wind over
 * stuurboord). tegen: the front of it turned the other way, the tegenbolling of a sail te los. Returns p(t) and
 * the lij normal of the chord.
 */
export function profiel(hals, schoot, side, tegen = false) {
  const c = [schoot[0] - hals[0], schoot[1] - hals[1]]; const len = Math.hypot(c[0], c[1]) || 1;
  let n = [-c[1] / len, c[0] / len];
  if (n[1] * side > 0) n = [-n[0], -n[1]];                              // lij: away from the side the wind comes over
  const diepte = (t) => {
    const d = 0.1 * len * Math.sin(Math.PI * t ** 0.75);
    return tegen ? d - 0.16 * len * Math.sin(Math.PI * Math.min(t / 0.35, 1)) * (t < 0.35 ? 1 : 0) : d;
  };
  return { len, c: [c[0] / len, c[1] / len], n, p: (t) => add(add(hals, c, t), n, diepte(t)) };
}

/**
 * The lines round one sail. hals, schoot: [x, z]; wind: [x, z] the way the schijnbare wind blows; side: as above;
 * stand: 'goed', 'te strak', 'klappert' (te los), 'duwt' or 'bak'; y: their height. Returns { lijnen: [[[x, y, z]]],
 * wervels: [[[x, y, z]]], plus: [[x, y, z]], min: [[x, y, z]] }.
 */
export function stroomlijnen({ hals, schoot, wind, side, stand, y }) {
  const los = stand === 'klappert';
  const { len, c, n, p } = profiel(hals, schoot, side, los);
  const u = norm(wind);
  const w = [-n[0], -n[1]];                                               // loef: the holle side
  const tangent = (t) => norm([p(Math.min(t + 0.02, 1))[0] - p(Math.max(t - 0.02, 0))[0], p(Math.min(t + 0.02, 1))[1] - p(Math.max(t - 0.02, 0))[1]]);
  const out = { lijnen: [], wervels: [], plus: [], min: [] };
  const to3 = (q) => [q[0], y, q[1]];
  if (stand === 'bak' || stand === 'duwt') return out;                   // pushed, not flowed round: no lines to draw

  for (const kant of [1, -1]) {                                           // +1 loef (holle side), -1 lij (bolle side)
    for (const d of kant > 0 ? LOEF : AFSTANDEN) {
      const off = kant * d;
      const volg = Math.exp(-d / 0.75);                                    // how closely a line keeps to the sail
      const langs = (t) => add(p(t), kant > 0 ? w : n, d);                 // a line that follows the sail at d
      const vrij = (t) => add(add(hals, w, off), c, t * len);              // the same line, not bent by the sail
      const pts = [];
      // up the wind to the voorlijk: from the way the wind comes, turning into the chord
      const voor = lerp2(vrij(0), langs(0), volg);
      for (let s = 1.8; s > 0; s -= STAP) {
        const dir = norm(lerp2(u, c, smooth(1.8, 0, s)));
        pts.push(add(voor, dir, -s));
      }
      // along the sail
      const scheiding = stand === 'te strak' && kant < 0 ? 0.45 : 2;       // te strak: on lij the flow lets go half way
      let laatste = voor; let richting = c;
      for (let t = 0; t <= 1.0001; t += STAP / len) {
        let q;
        if (t <= scheiding) {
          q = lerp2(vrij(t), langs(t), volg);
          laatste = q; richting = tangent(Math.min(t, 1));
        } else {
          // past where it let go: straight on along the way it was going, wavering - turbulence
          const s = (t - scheiding) * len;
          q = add(add(laatste, richting, s), w, (Math.sin(t * 38 + d * 9) * 0.06 + 0.05) * s * (d < 0.3 ? 1 : 0.4));
        }
        // te los: the flow at the voorlijk is thrown about, on both sides
        if (los && t < 0.4) q = add(q, w, Math.sin(t * 45 + d * 7) * 0.07 * (1 - t / 0.4));
        pts.push(q);
      }
      // past the achterlijk, back into the wind's own way
      const eind = pts[pts.length - 1]; const uit = scheiding < 1 ? richting : tangent(1);
      for (let s = STAP; s < 1.6; s += STAP) pts.push(add(eind, norm(lerp2(uit, u, smooth(0, 1.6, s))), s));
      out.lijnen.push(pts.map(to3));
    }
  }
  // te strak: eddies in the lee of the achterlijk
  if (stand === 'te strak') {
    for (const [t, k] of [[0.7, 0.35], [0.9, 0.45], [1.05, 0.3]]) {
      const m = add(p(Math.min(t, 1)), n, k + (t > 1 ? (t - 1) * len : 0));
      const r = 0.16 + 0.05 * k; const ring = [];
      for (let a = 0; a <= Math.PI * 1.7; a += 0.3) ring.push(to3(add(m, [Math.cos(a), Math.sin(a)], r)));
      out.wervels.push(ring);
    }
  }
  // the pressure: over on the holle side, under on the bolle side - less when it stands wrong
  const sterk = stand === 'goed' ? 2 : 1;
  for (let i = 1; i <= sterk; i++) {
    const t = i / (sterk + 1);
    out.plus.push(to3(add(p(t), w, 0.35)));
    out.min.push(to3(add(p(t), n, 0.4)));
  }
  return out;
}
