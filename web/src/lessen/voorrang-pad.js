// The way the boats go in a situatie of Voorrang (lessen/voorrang.js), apart from three.js so that it can be
// checked by itself. Over the water, seen from where the view stands still: she comes along her course to where
// she lies now (her middle at C) at time T, each other boat to where they would meet (its stern at treffen). They
// lie still until the question is answered; then they go, and each that gives way does so at wijk.van (s into the
// round): UIT s turning out by wijk.hoek, wijk.houd s on that heading, UIT s back to the course it had - so it ends
// beside where it was going, not in the bank. One that waits (wijk.stop, or sit.wacht) stops instead, from
// wijk.vanStop; wacht 'stil' (before an engte) lies where it was, clear of the way in, and does not go at all. The
// rest hold on. wijk = null: no one gives way.
//
// A situatie of a lesson onderwerp has one other boat (soort, richting, treffen, voor: 'jij' | 'ander' | 'beide');
// one of Alles op een rij (lessen/voorrang-oefen.js) has boten: [hers, ...others], each { soort, richting, treffen,
// v, wijkt, draai }.

export const C = 2.8;
export const T = 9;                                                       // s to where they meet
export const RONDE = T * 1.6;                                             // s: one round, then they start again
export const SNEL = { motor: 3, zeil: 2, spier: 1.2, groot: 3.2 };        // m/s
export const LANG = { motor: 9, zeil: 7, spier: 4.5, groot: 30 };         // m: as bpr/schepen.js builds them
export const BREED = { motor: 3, zeil: 2.5, spier: 1.4, groot: 5 };
export const ENGTE = 6;                                                   // m: half the width of an engte
export const engte = (sit) => sit.engte ?? [C + 4, C + 40];               // x where it starts and ends

// The land round the water, as boxes [x0, x1, z0, z1]: the banks of a vaarwater along her course (wal { sb, bb }),
// those of an engte, or (wal { dwars: [x0, x1], mond }) a vaarwater across her course, from x0 to x1, that she comes
// into from a zijvaart mond m to either side wide
export function landen(sit) {
  const w = sit.wal;
  if (!w) return [];
  if (w === 'engte') { const [x0, x1] = engte(sit); return [[x0, x1, ENGTE, ENGTE + 8], [x0, x1, -ENGTE - 8, -ENGTE]]; }
  if (w.dwars) { const [x0, x1] = w.dwars; return [[-60, x0, w.mond, 60], [-60, x0, -60, -w.mond], [x1, x1 + 10, -60, 60]]; }
  return [[-60, 120, w.sb, w.sb + 10], [-60, 120, w.bb - 10, w.bb]];
}
// how far a point is from a box: below 0 inside it
const buiten = ([x, z], [x0, x1, z0, z1]) => {
  const dx = Math.max(x0 - x, x - x1); const dz = Math.max(z0 - z, z - z1);
  return dx < 0 && dz < 0 ? Math.max(dx, dz) : Math.hypot(Math.max(dx, 0), Math.max(dz, 0));
};
const UIT = 3;                                                            // s turning out, and as long back
const STOP = 2.5;                                                         // s for one that waits to lose its way
// the rate of turn over a bocht of hoek rad, d from its start: it comes on and goes off smoothly, so the wake
// has no corners
const zacht = (d, hoek) => (d >= 0 && d < UIT ? (hoek / UIT) * (1 - Math.cos(2 * Math.PI * d / UIT)) : 0);

export const vo = (sit) => (sit.jij === 'roeien' ? 1 : 1.4);              // m/s: her own speed

// The boats of a situatie, hers first, where they set out: { soort, haar, x, z, kop, v, wijkt, draai }
export function vloot(sit) {
  const v = vo(sit);
  const haar = { soort: sit.jij === 'roeien' ? 'spier' : 'zeil', haar: true, x: C - v * T, z: 0, kop: 0, v, draai: 1 };
  const uit = (b) => {
    const h = b.richting * Math.PI / 180; const [mx, mz] = b.treffen;
    return { soort: b.soort, x: mx - b.v * Math.cos(h) * T, z: mz - b.v * Math.sin(h) * T, kop: h, v: b.v, draai: b.draai ?? 1, wijkt: Boolean(b.wijkt) };
  };
  if (sit.boten) {
    const [eigen, ...rest] = sit.boten;
    return [{ ...haar, wijkt: Boolean(eigen.wijkt), draai: eigen.draai ?? 1 }, ...rest.map((b) => uit({ ...b, v: b.v ?? SNEL[b.soort] }))];
  }
  // she the faster when she overtakes: it goes slower than she does
  const ander = uit({ soort: sit.soort, richting: sit.richting, treffen: sit.treffen, draai: sit.draai,
    v: sit.omgekeerd ? Math.max(v * 0.45, 0.4) : SNEL[sit.soort], wijkt: sit.voor === 'jij' || sit.voor === 'beide' });
  return [{ ...haar, wijkt: sit.voor === 'ander' || sit.voor === 'beide' }, ander];
}

// all of them over the round up to u s: their places [{ x, z, kop }], hers first; elk(places, k) after each step
export function vaar(sit, u, wijk, elk = null) {
  const bs = vloot(sit);
  const nu = bs.map((b) => ({ x: b.x, z: b.z, kop: b.kop }));
  const stap = 0.05; const stil = sit.wacht === 'stil';
  const stopt = bs.map((b, i) => Boolean(wijk) && b.wijkt && (wijk.stop?.[i] ?? Boolean(sit.wacht)));
  for (let k = 0; k < u; k += stap) {
    bs.forEach((b, i) => {
      const p = nu[i];
      let vaart = 1;
      if (wijk && b.wijkt) {
        if (stopt[i]) {
          const d = k - (wijk.vanStop ?? wijk.van);
          vaart = stil ? 0 : d < 0 ? 1 : d < STOP ? (1 + Math.cos(Math.PI * d / STOP)) / 2 : 0;
        } else {
          const d = k - wijk.van;
          p.kop += (zacht(d, wijk.hoek) - zacht(d - UIT - wijk.houd, wijk.hoek)) * b.draai * stap * (b.soort === 'groot' ? 0.5 : 1);
        }
      }
      p.x += b.v * vaart * Math.cos(p.kop) * stap; p.z += b.v * vaart * Math.sin(p.kop) * stap;
    });
    elk?.(nu, k);
  }
  return nu;
}

// the nearest distance of two segments, each [[x, z], [x, z]]
function lijn([p, q], [r, s]) {
  const d1 = [q[0] - p[0], q[1] - p[1]]; const d2 = [s[0] - r[0], s[1] - r[1]]; const w = [p[0] - r[0], p[1] - r[1]];
  const A = d1[0] * d1[0] + d1[1] * d1[1]; const E = d2[0] * d2[0] + d2[1] * d2[1]; const B = d1[0] * d2[0] + d1[1] * d2[1];
  const D = d1[0] * w[0] + d1[1] * w[1]; const F = d2[0] * w[0] + d2[1] * w[1];
  const klem = (v) => Math.min(Math.max(v, 0), 1);
  let sc = A * E - B * B > 1e-9 ? klem((B * F - D * E) / (A * E - B * B)) : 0;
  let tc = E > 1e-9 ? (B * sc + F) / E : 0;
  if (tc < 0) { tc = 0; sc = klem(-D / A); } else if (tc > 1) { tc = 1; sc = klem((B - D) / A); }
  return Math.hypot(w[0] + sc * d1[0] - tc * d2[0], w[1] + sc * d1[1] - tc * d2[1]);
}

// the corners of a hull, as a box from x0 to x1 along it and hw to either side
const hoeken = (p, x0, x1, hw) => [[x0, -hw], [x1, -hw], [x1, hw], [x0, hw]]
  .map(([a, b]) => [p.x + a * Math.cos(p.kop) - b * Math.sin(p.kop), p.z + a * Math.sin(p.kop) + b * Math.cos(p.kop)]);

// The hull of each as a capsule round its middle line, [from, to] along it from its place and r to either side:
// hers from her deck (haar: { x0, x1, r } from her middle), the others' from length and beam (from the stern)
const romp = (b, haar) => (b.haar ? { x0: haar.x0, x1: haar.x1, r: haar.r } : { x0: 0, x1: LANG[b.soort], r: BREED[b.soort] / 2 });
const langs = (p, m) => [[p.x + (m.x0 + m.r) * Math.cos(p.kop), p.z + (m.x0 + m.r) * Math.sin(p.kop)], [p.x + (m.x1 - m.r) * Math.cos(p.kop), p.z + (m.x1 - m.r) * Math.sin(p.kop)]];

// How it goes with a wijk, over the round: ruimte, how close any two come; speling, how much room is left over the
// marge each pair needs (3 m by a groot schip, else 2); and wal, how close any comes to a bank - below 0 is in it,
// and one that waits for an engte may not be in it
export function meet(sit, haar, wijk) {
  const bs = vloot(sit); const maten = bs.map((b) => romp(b, haar));
  const land = landen(sit); const [ex0, ex1] = sit.wal === 'engte' ? engte(sit) : [0, 0];
  let ruimte = Infinity; let speling = Infinity; let wal = Infinity;
  vaar(sit, RONDE, wijk, (nu) => {
    const lijnen = nu.map((p, i) => langs(p, maten[i]));
    for (let i = 0; i < nu.length; i++) for (let j = i + 1; j < nu.length; j++) {
      const d = lijn(lijnen[i], lijnen[j]) - maten[i].r - maten[j].r;
      ruimte = Math.min(ruimte, d);
      speling = Math.min(speling, d - (bs[i].soort === 'groot' || bs[j].soort === 'groot' ? 3 : 2));
    }
    if (!land.length) return;
    nu.forEach((p, i) => {
      const hk = hoeken(p, maten[i].x0, maten[i].x1, maten[i].r);
      for (const pt of hk) for (const box of land) wal = Math.min(wal, buiten(pt, box));
      const wacht = wijk && bs[i].wijkt && (wijk.stop?.[i] ?? Boolean(sit.wacht));
      if (sit.wal === 'engte' && wacht && hk.some(([x]) => x > ex0 && x < ex1)) wal = Math.min(wal, -1);
    });
  });
  return { ruimte, speling, wal };
}

// When and how each that gives way does it: early (from VAN s; one that stops as late as it can, coming on up to
// where it has to wait), with the smallest bocht and then the shortest hold that comes clear of the others and keeps
// off the banks - a gentle swerve, not a sharp turn late. Where it is not said which stop (sit.boten), it tries them
// all turning first, then one or more stopping. ok: false when nothing works.
const VAN = [2, 1.5, 1, 0.5];
const VAN_STOP = [5.5, 5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5];
const HOEK = [0.3, 0.4, 0.5, 0.6, 0.75, 0.9, 1.1];                       // rad; a groot schip turns half of it
const HOUD = [1, 2, 3, 4, 6, 8];
export function plan(sit, haar) {
  const bs = vloot(sit);
  const wijkers = bs.map((b, i) => (b.wijkt ? i : -1)).filter((i) => i >= 0);
  if (!wijkers.length) return null;
  if (sit.wacht === 'stil') return { van: 0, houd: 0, hoek: 0, ok: true };
  const goed = (w) => { const m = meet(sit, haar, w); return m.speling >= 0 && m.wal >= 0.5; };
  // which of them stop: as the situatie says, or each way, the fewest stopping first
  const keuzes = [];
  if (sit.boten) {
    for (let n = 0; n < 1 << wijkers.length; n++) keuzes.push(bs.map((b, i) => wijkers.includes(i) && Boolean(n & (1 << wijkers.indexOf(i)))));
    keuzes.sort((a, b) => a.filter(Boolean).length - b.filter(Boolean).length);
  } else keuzes.push(bs.map((b) => b.wijkt && Boolean(sit.wacht)));
  for (const stop of keuzes) {
    const draaien = wijkers.some((i) => !stop[i]); const stoppen = wijkers.some((i) => stop[i]);
    for (const vanStop of stoppen ? VAN_STOP : [0]) for (const van of draaien ? VAN : [0]) {
      for (const hoek of draaien ? HOEK : [0]) for (const houd of draaien ? HOUD : [0]) {
        const w = { van, vanStop, houd, hoek, stop };
        if (goed(w)) return { ...w, ok: true };
      }
    }
  }
  return { van: 0.5, vanStop: 0.5, houd: 3, hoek: 0.75, stop: bs.map(() => false), ok: false };
}
