// Signs of group(s) FGH of BPR bijlage 7, drawn after the BPR's own drawings (reference/bpr/tekens/bpr_img).
// See kader.js for the conventions every group follows.
//
// F are plates, drawn on their own with the BPR's example text. G and H are not single boards but
// arrangements at bridges, locks and weirs: each is one illustration on a light-grey panel, made of
// the BPR's little scenes side by side, each scene in its own coordinates (the drawing's pixels).
import { svg, tekst, ROOD, WIT, ZWART, BLAUW, GROEN, GEEL } from './kader.js';

const PANEEL = '#e4e5e2';   // the neutral grey behind a G/H illustration
const LIJN = 3;             // line width of the scene drawings, in scene units

// ---- small drawing helpers -------------------------------------------------------------------

const lijn = (pts, w = LIJN) => `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${ZWART}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"/>`;
const vlak = (pts, fill = WIT, w = LIJN) => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}" stroke="${ZWART}" stroke-width="${w}" stroke-linejoin="round"/>`;

/** A signal light as the scene drawings show it: a coloured disc with a black outline; 'flikker' adds black wedges. */
function licht(cx, cy, r, colour, kind = 'vast') {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${colour}" stroke="${ZWART}" stroke-width="${r * 0.14}"/>`;
  if (kind === 'flikker') {
    for (let i = 0; i < 4; i++) {
      const a0 = (i * Math.PI) / 2 + 0.35; const a1 = a0 + 0.8; const q = r * 0.85;
      const p = (a) => `${(cx + q * Math.cos(a)).toFixed(1)},${(cy + q * Math.sin(a)).toFixed(1)}`;
      s += `<path d="M${cx},${cy} L${p(a0)} A${q},${q} 0 0 1 ${p(a1)} Z" fill="${ZWART}"/>`;
    }
  }
  return s;
}

/** Water: `n` wavy lines between x0 and x1, from y0 down to the bed at y1. */
function water(x0, x1, y0, y1, n = 4) {
  const step = (y1 - y0) / n; const period = 64; let s = '';
  for (let i = 0; i < n; i++) {
    const y = y0 + step * (i + 0.5); let d = `M${x0},${y}`;
    for (let x = x0; x < x1; x += period) {
      const e = Math.min(x + period, x1); const m = (x + e) / 2;
      d += ` Q${(x + m) / 2},${y - step * 0.6} ${m},${y} Q${(m + e) / 2},${y + step * 0.6} ${e},${y}`;
    }
    s += `<path d="${d}" fill="none" stroke="${ZWART}" stroke-width="${LIJN * 0.8}"/>`;
  }
  return s;
}

/** A small diamond (half-diagonal `r`): `left`/`right` colour for each half, outline in `rand`. */
function wybertje(cx, cy, r, left, right, rand) {
  const top = `${cx},${cy - r}`; const bot = `${cx},${cy + r}`;
  return `<polygon points="${top} ${cx - r},${cy} ${bot}" fill="${left}"/><polygon points="${top} ${cx + r},${cy} ${bot}" fill="${right}"/>`
    + `<polygon points="${top} ${cx + r},${cy} ${bot} ${cx - r},${cy}" fill="none" stroke="${rand}" stroke-width="${r * 0.07}"/>`;
}
const a10 = (cx, cy, r, redLeft) => wybertje(cx, cy, r, redLeft ? ROOD : WIT, redLeft ? WIT : ROOD, ROOD);
const d2 = (cx, cy, r, greenLeft) => wybertje(cx, cy, r, greenLeft ? GROEN : WIT, greenLeft ? WIT : GROEN, GROEN);
const d1 = (cx, cy, r) => wybertje(cx, cy, r, GEEL, GEEL, ZWART);

/** An A.1 board (red-white-red bands) centred on cx, cy. */
const a1 = (cx, cy, w, h) => `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" fill="${ROOD}"/>`
  + `<rect x="${cx - w / 2}" y="${cy - h * 0.13}" width="${w}" height="${h * 0.26}" fill="${WIT}"/>`;

/**
 * Lay scenes out on a grey panel `W` wide: `rows` is a list of rows, each a list of scenes
 * { w, h, body }. All scenes share one scale (as in the BPR, where they are printed alike), set by
 * the widest row and capped at `max`; scenes in a row stand on a common base line.
 */
function tafereel(rows, W = 900, max = 1, gap = 30, margin = 30) {
  const width = (row) => row.reduce((t, s) => t + s.w, 0);
  const k = Math.min(max, ...rows.map((row) => (W - 2 * margin - gap * (row.length - 1)) / width(row)));
  let y = margin; let out = '';
  for (const row of rows) {
    const H = Math.max(...row.map((s) => s.h)) * k;
    let x = (W - width(row) * k - gap * (row.length - 1)) / 2;
    for (const s of row) {
      out += `<g transform="translate(${x.toFixed(1)},${(y + H - s.h * k).toFixed(1)}) scale(${k.toFixed(4)})">${s.body}</g>`;
      x += s.w * k + gap;
    }
    y += H + gap;
  }
  const h = Math.round(y - gap + margin);
  return { w: W, h, svg: svg(W, h, `<rect width="${W}" height="${h}" fill="${PANEEL}"/>${out}`) };
}

// ---- F: plates -------------------------------------------------------------------------------

/** A white plate with a thin black border and one line of black text. */
function plaat(w, h, text, size, spacing = 0) {
  const t = tekst(w / 2, h / 2, text, size).replace('<text ', `<text letter-spacing="${spacing}" `);
  return svg(w, h, `<rect x="5" y="5" width="${w - 10}" height="${h - 10}" fill="${WIT}" stroke="${ZWART}" stroke-width="10"/>${t}`);
}

// F.2a: the pointed plate beside the main sign, as high as the sign, with the length of the stretch
function puntbord() {
  const w = 460; const h = 600;
  return svg(w, h, `<polygon points="5,5 290,5 455,300 290,595 5,595" fill="${WIT}" stroke="${ZWART}" stroke-width="10" stroke-linejoin="round"/>`
    + tekst(185, 255, '2', 78) + tekst(185, 350, 'km', 70));
}

// ---- G: fixed bridges (G.1), scene 480 x 240 ------------------------------------------------

/** A fixed bridge: fascia between two lines (or only the underside line), two tapered piers, water. */
function vasteBrug(top, { gevel = true, bodem = false } = {}) {
  let s = '';
  if (gevel) s += lijn([[0, 12], [480, 12]]);
  s += lijn([[0, 80], [480, 80]]);
  s += vlak([[32, 80], [62, 80], [68, 205], [26, 205]]) + vlak([[418, 80], [452, 80], [459, 205], [414, 205]]);
  s += water(68, 414, 160, 205) + lijn([[68, 205], [414, 205]]);
  if (bodem) s += lijn([[0, 233], [480, 233]]);
  return { w: 480, h: 240, body: s + top };
}

// ---- G: movable bridges (G.2), scenes 400 x 195 and 421 x 445 -------------------------------

/** A lifting bridge seen closed: sloping deck, two piers with `lights` (colour per lamp, top down), yellow under the span. */
function brug(lights, geel = 0) {
  let s = lijn([[0, 5], [396, 5], [396, 25]]) + lijn([[0, 59], [50, 59]]) + lijn([[97, 59], [396, 25]]);
  s += vlak([[50, 59], [99, 59], [99, 190], [50, 190]]) + vlak([[353, 25], [397, 25], [397, 190], [353, 190]]);
  s += water(99, 353, 146, 190) + lijn([[99, 190], [353, 190]]);
  lights.forEach(([c, k], i) => { s += licht(74, 84 + i * 36, 15, c, k) + licht(375, 84 + i * 36, 15, c, k); });
  if (geel === 1) s += licht(220, 64, 15, GEEL);
  if (geel === 2) s += licht(201, 64, 15, GEEL) + licht(239, 62, 15, GEEL);
  return { w: 400, h: 195, body: s };
}

/** A bascule bridge standing open: raised leaf over the left pier, `lights` in both piers. */
function ophaalbrug(lights) {
  let s = vlak([[183, 8], [208, 20], [125, 300], [80, 358], [26, 382]]);
  s += vlak([[77, 299], [125, 299], [125, 420], [77, 420]]) + vlak([[376, 299], [424, 299], [424, 420], [376, 420]]);
  s += water(125, 376, 372, 420, 3) + lijn([[125, 420], [376, 420]]);
  lights.forEach(([c, k], i) => { s += licht(101, 332 + i * 32, 13, c, k) + licht(400, 332 + i * 32, 13, c, k); });
  return { w: 430, h: 440, body: s };
}

// ---- G: locks (G.4), scenes 420 x 200, 400 x 275, 472 x 538 ----------------------------------

/** A lock head seen from outside: two walls with ledges, `lights` beside each wall. */
function sluis(lights, y0 = 44) {
  let s = lijn([[24, 14], [68, 14], [68, 191], [370, 191], [370, 14], [414, 14]]) + water(68, 370, 149, 191);
  lights.forEach((c, i) => { s += licht(44, y0 + i * 34, 14.5, c) + licht(394, y0 + i * 34, 14.5, c); });
  return { w: 420, h: 200, body: s };
}

/** A lock with a fixed-looking movable bridge over its head (G.4.2). */
function sluisBrug(lights, geel = 0, y0 = 100) {
  let s = lijn([[9, 20], [395, 20], [393, 48], [359, 50]]) + lijn([[9, 78], [56, 78], [359, 50]]);
  s += lijn([[56, 78], [56, 269], [359, 269], [359, 50]]) + water(56, 359, 230, 269);
  lights.forEach((c, i) => { s += licht(30, y0 + i * 36, 14.5, c) + licht(385, y0 + i * 36, 14.5, c); });
  if (geel === 2) s += licht(185, 80, 14, GEEL) + licht(220, 77, 14, GEEL);
  return { w: 410, h: 275, body: s };
}

/** A lock with its bascule bridge raised (G.4.2, last picture). */
function sluisOphaal() {
  let s = vlak([[182, 9], [215, 23], [110, 336], [80, 446], [13, 406]]);
  s += lijn([[67, 336], [110, 336], [110, 525], [411, 525], [411, 336], [460, 336]]) + water(110, 411, 480, 525, 3);
  s += licht(88, 379, 14, GROEN) + licht(438, 387, 14, GROEN);
  return { w: 472, h: 538, body: s };
}

// ---- G.5: height marks -----------------------------------------------------------------------

/** The hoogteschaal: metre blocks 7..11 alternating black and yellow, decimetre ticks down the left. */
function hoogteschaal() {
  const x = 50; const y = 50; const W = 320; const M = 160; const narrow = 39; const wide = 78;
  let s = '';
  for (let i = 0; i < 5; i++) {
    const top = y + i * M; const fill = i % 2 ? GEEL : ZWART; const ink = i % 2 ? ZWART : GEEL;
    s += `<rect x="${x}" y="${top}" width="${W}" height="${M}" fill="${fill}"/>`;
    // the wide column: black on the upper half metre, yellow on the lower
    s += `<rect x="${x}" y="${top}" width="${wide}" height="${M / 2}" fill="${ZWART}"/><rect x="${x}" y="${top + M / 2}" width="${wide}" height="${M / 2}" fill="${GEEL}"/>`;
    // decimetre ticks in the narrow column, in the opposite colour of the half they sit in
    for (let d = 0; d < 10; d++) {
      if (d % 2 === 0) continue;
      const tick = d < 5 ? GEEL : ZWART; const dm = M / 10;
      s += `<rect x="${x}" y="${(top + d * dm + dm * 0.1).toFixed(1)}" width="${narrow}" height="${(dm * 0.8).toFixed(1)}" fill="${tick}"/>`;
    }
    s += tekst(x + wide + (W - wide) / 2, top + M / 2, String(7 + i), 175, ink);
  }
  return { w: 420, h: 900, svg: svg(420, 900, `<rect width="420" height="900" fill="${PANEEL}"/>${s}`) };
}

// ---- H.3: spui- en inlaattekens ---------------------------------------------------------------

/** A flag pole with its black cap, from y0 down to y1. */
const paal = (x, y0, y1) => lijn([[x, y0], [x, y1]], 5) + `<rect x="${x - 14}" y="${y0 - 5}" width="28" height="9" fill="${ZWART}"/>`;
const tekstWit = (x, y, t, size) => tekst(x, y, t, size, WIT).replace('<text ', '<text letter-spacing="2" ');

/** The blue "spuien" flag on its pole; x is the pole. */
const vlag = (x, y) => paal(x, y, y + 235) + `<rect x="${x + 4}" y="${y + 8}" width="245" height="92" fill="${BLAUW}"/>` + tekstWit(x + 126, y + 52, 'spuien', 52);
/** The blue "inlaten" pennant on its pole; x is the pole. */
const wimpel = (x, y, len = 360) => paal(x, y, y + 235) + `<polygon points="${x + 4},${y + 28} ${x + len},${y + 70} ${x + 4},${y + 112}" fill="${BLAUW}"/>` + tekstWit(x + len * 0.33, y + 70, 'inlaten', 50);
const enof = (x, y, t = 'en/of') => `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="44" text-anchor="middle" fill="${ZWART}">${t}</text>`;

const rood = (x, y) => licht(x, y, 32, ROOD);

export default {
  'F.1': { w: 600, h: 160, svg: plaat(600, 160, '800', 120, 6) },
  'F.2a': { w: 460, h: 600, svg: puntbord() },
  'F.3': { w: 600, h: 150, svg: plaat(600, 150, 'brugbouw', 92, 5) },
  'F.4': { w: 600, h: 190, svg: plaat(600, 190, 'sport', 150, 12) },

  // fixed bridge: A.10 pair (must) and D.2 pair (should) mark the channel
  'G.1a': tafereel([[
    vasteBrug(a10(92, 46, 22, true) + a10(393, 46, 22, false), { bodem: true }),
    vasteBrug(d2(92, 46, 22, false) + d2(393, 46, 22, true)),
  ]]),
  // fixed bridge: closed opening (A.1), recommended (D.1a), recommended one-way (D.1b)
  'G.1b': tafereel([[
    vasteBrug(a1(240, 46, 66, 46), { bodem: true }),
    vasteBrug(d1(240, 48, 21), { gevel: false }),
    vasteBrug(d1(219, 48, 21) + d1(262, 48, 21), { gevel: false }),
  ]]),
  // movable bridge in operation: red; red + yellow; red + two yellow; red over green; open, green; red over flashing green
  'G.2a': tafereel([
    [brug([[ROOD]]), brug([[ROOD]], 1), brug([[ROOD]], 2)],
    [brug([[ROOD], [GROEN]]), ophaalbrug([[GROEN]]), ophaalbrug([[ROOD], [GROEN, 'flikker']])],
  ]),
  // movable bridge not operated: two red (+ one or two yellow); open, two green
  'G.2b': tafereel([
    [brug([[ROOD], [ROOD]]), brug([[ROOD], [ROOD]], 1)],
    [brug([[ROOD], [ROOD]], 2), ophaalbrug([[GROEN], [GROEN]])],
  ]),
  'G.4.1a': tafereel([[sluis([ROOD]), sluis([ROOD, GROEN]), sluis([GROEN], 71)]]),
  'G.4.1b': tafereel([[sluis([ROOD, ROOD], 50), sluis([GROEN, GROEN], 36)]]),
  'G.4.2': tafereel([[sluisBrug([ROOD, GROEN]), sluisBrug([GROEN], 2, 134), sluisOphaal()]]),
  'G.5.1': hoogteschaal(),
  // referentietekens: the black board with two yellow blocks, or the A.10 or D.2 pair
  'G.5.1b': tafereel([[
    { w: 180, h: 360, body: `<rect width="180" height="360" fill="${ZWART}"/><rect x="16" y="84" width="148" height="80" fill="${GEEL}"/><rect x="16" y="238" width="148" height="80" fill="${GEEL}"/>` },
    { w: 420, h: 360, body: a10(80, 90, 62, true) + a10(340, 90, 62, false) + d2(80, 270, 62, false) + d2(340, 270, 62, true) },
  ]]),
  'G.5.2': { w: 600, h: 600, svg: svg(600, 600, `<rect width="600" height="600" fill="${GEEL}"/><rect x="42" y="42" width="516" height="516" fill="${ZWART}"/>`
    + `<polygon points="160,80 440,80 300,215" fill="${GEEL}"/>${tekst(300, 372, '3,75', 175, GEEL)}`) },

  // H.3: three red lights, point up = spuien; point down = inlaten; in a row = soon
  'H.3a': tafereel([[{ w: 800, h: 340, body: rood(112, 65) + rood(64, 145) + rood(176, 145) + enof(320, 158) + vlag(490, 60) }]]),
  'H.3b': tafereel([[{ w: 880, h: 320, body: rood(57, 90) + rood(166, 90) + rood(110, 164) + enof(307, 110) + wimpel(480, 45) }]]),
  'H.3c': tafereel([[{ w: 1180, h: 320, body: rood(50, 110) + rood(135, 110) + rood(220, 110) + enof(330, 122) + vlag(420, 40) + enof(760, 122, 'of') + wimpel(820, 40) }]]),
};
