// Signs of group(s) E of BPR bijlage 7, drawn after the BPR's own drawings (reference/bpr/tekens/bpr_img).
// See kader.js for the conventions every group follows.
import { svg, verbod, gebod, aanwijzing, ruit, tekst, pijl, lamp, ROOD, WIT, ZWART, BLAUW, GROEN, GEEL, RAND } from './kader.js';
import * as symbool from './symbolen.js';

// --- E.1 to E.11 ---

/** A number in units, rounded for the SVG. */
const n = (v) => +v.toFixed(1);

/** A path in white; `transform` mirrors a half-drawn symbol. */
const wit = (d, transform = '') => `<path d="${d}" fill="${WIT}"${transform ? ` transform="${transform}"` : ''}/>`;

/** A symbol drawn as its right half against x = 300, and that half mirrored. */
const symmetrisch = (d) => wit(d) + wit(d, 'translate(600,0) scale(-1,1)');

/** Scale the fractions (of the side of a 600 sign) in a path string to units. */
const f = (strings, ...values) => strings.reduce((s, str, i) => s + str + (i < values.length ? n(values[i] * 600) : ''), '');

// E.4: the ferry in side view, a deckhouse on a hull with raked ends
const veerpont = wit(f`M${0.406},${0.356} H${0.598} V${0.502} H${0.406} Z`)
  + wit(f`M${0.124},${0.5} H${0.876} L${0.797},${0.644} H${0.199} Z`);

// E.9, E.10: a waterway junction seen from above, own channel entering from the bottom edge. Each
// channel is a white band [x0, y0, x1, y1] in fractions of the side; 0 and 1 run it into the keyline,
// so the blue that is left reads as the banks.
const vaarwegen = (banen) => aanwijzing(banen.map(([x0, y0, x1, y1]) => {
  const k = (v) => Math.min(Math.max(v, 0.03), 0.97) * 600;
  return `<rect x="${n(k(x0))}" y="${n(k(y0))}" width="${n(k(x1) - k(x0))}" height="${n(k(y1) - k(y0))}" fill="${WIT}"/>`;
}).join(''));
/** The same junction mirrored left to right (the BPR draws the pairs as mirror images). */
const spiegel = (banen) => banen.map(([x0, y0, x1, y1]) => [1 - x1, y0, 1 - x0, y1]);

// measured on the BPR drawings; thick = main waterway (~0.27 of the side), thin = side waterway (~0.145)
const E9 = {
  a: [[0.35, 0, 0.646, 1], [0, 0.429, 1, 0.569]],                                        // crossing
  b: [[0.325, 0, 0.592, 1], [0.592, 0.425, 1, 0.571]],                                   // side channel right
  d: [[0.329, 0.328, 0.593, 1], [0.329, 0.328, 1, 0.592], [0.383, 0, 0.529, 0.33]],      // main turns right, thin ahead
  f: [[0.328, 0.326, 0.593, 1], [0.328, 0.326, 1, 0.586], [0, 0.385, 0.33, 0.531]],      // main turns right, thin left
  h: [[0.329, 0.5, 0.593, 1], [0.383, 0.328, 1, 0.592], [0.383, 0, 0.529, 0.33], [0, 0.387, 0.4, 0.534]],
};
const E10 = {
  a: [[0.427, 0, 0.573, 1], [0, 0.354, 1, 0.648]],                                       // thin crosses the main
  b: [[0.427, 0.5, 0.571, 1], [0, 0.325, 1, 0.591]],                                     // thin ends on the main
  c: [[0.328, 0, 0.591, 0.672], [0.328, 0.411, 1, 0.672], [0.39, 0.6, 0.535, 1]],        // main from ahead bends right
  e: [[0.324, 0, 0.587, 0.5], [0.386, 0.404, 1, 0.671], [0.386, 0.6, 0.531, 1], [0, 0.479, 0.4, 0.625]],
};

// E.1: three vertical bands green / white / green (39 / 22 / 39 % inside the keyline), landscape 3 : 2
const doorvaart = svg(900, 600, `<rect width="900" height="600" fill="${GROEN}"/>`
  + `<rect x="357" y="0" width="186" height="600" fill="${WIT}"/>`
  + `<rect x="18" y="18" width="864" height="564" fill="none" stroke="${WIT}" stroke-width="10"/>`);

// E.2: the lightning bolt, a zigzag from upper right down to an arrowhead at lower left
const bliksem = wit(f`M${0.645},${0.16} L${0.725},${0.195} L${0.465},${0.44} H${0.665} L${0.42},${0.76} L${0.44},${0.775}
  L${0.28},${0.82} L${0.30},${0.685} L${0.345},${0.715} L${0.53},${0.49} H${0.34} L${0.355},${0.445} Z`);

// E.5: the capital P, a straight stem and a round bowl (drawn, not set, to match the BPR's letter)
const P = `<path fill-rule="evenodd" fill="${WIT}" d="${f`M${0.218},${0.829} V${0.175} H${0.559} A${0.223},${0.223} 0 0 1 ${0.559},${0.621} H${0.337} V${0.829} Z`
  + f`M${0.337},${0.296} H${0.561} A${0.104},${0.104} 0 0 1 ${0.561},${0.504} H${0.337} Z`}"/>`;

// E.5.1: the figures 20 as even strokes, E.5.3: the Roman IV
const lijn = (d, w) => `<path d="${d}" fill="none" stroke="${WIT}" stroke-width="${w}"/>`;
const twintig = lijn('M100,240 C100,205 128,186 163,186 C200,186 225,208 225,242 C225,272 208,292 185,315 L112,410 H250', 40)
  + `<ellipse cx="426" cy="297" rx="82" ry="109" fill="none" stroke="${WIT}" stroke-width="40"/>`;
const vier = wit(f`M${0.18},${0.21} H${0.276} V${0.79} H${0.18} Z`)
  + wit(f`M${0.383},${0.21} H${0.473} L${0.6},${0.712} L${0.725},${0.21} H${0.813} L${0.668},${0.79} H${0.529} Z`);

// E.6: the anchor, ring on top, a stock across, the shank, and crescent arms with the points up
const anker = `<circle cx="300" cy="132" r="22" fill="none" stroke="${WIT}" stroke-width="15"/>`
  + wit(f`M${0.37},${0.27} H${0.63} V${0.315} H${0.37} Z`) + wit(f`M${0.455},${0.24} H${0.545} V${0.76} H${0.455} Z`)
  + wit(f`M${0.235},${0.68} Q${0.5},${0.93} ${0.765},${0.68} A${0.024},${0.024} 0 0 0 ${0.72},${0.668}`
    + f` Q${0.5},${0.745} ${0.28},${0.668} A${0.024},${0.024} 0 0 0 ${0.235},${0.68} Z`);

// E.7: the bollard, a rounded head on a waist, a collar, flaring into a base plate (right half, mirrored)
const bolder = symmetrisch('M300,120 C370,120 435,135 435,180 C435,225 395,245 384,275 V312 H413 A19,19 0 0 1 413,350 H384 V400 C392,450 410,480 440,492 H510 V522 H300 Z');

// E.11: blue with a white stripe corner to corner, top left to bottom right, 0.12 of the width
// across; the BPR also has an upright 2 : 3 model (same stripe, corner to corner) to fit behind a tall sign
const einde = (() => {
  const k = 18; const d = 51; const e = 600 - k;
  return aanwijzing(`<polygon points="${k},${k} ${k + d},${k} ${e},${e - d} ${e},${e} ${e - d},${e} ${k},${k + d}" fill="${WIT}"/>`);
})();

export default {
  'E.1': { w: 900, h: 600, svg: doorvaart },
  'E.2': { w: 600, h: 600, svg: aanwijzing(bliksem) },
  'E.4a': { w: 600, h: 600, svg: aanwijzing(veerpont + wit(f`M${0.03},${0.699} H${0.97} V${0.72} H${0.03} Z`)) },
  'E.4b': { w: 600, h: 600, svg: aanwijzing(veerpont) },
  'E.5': { w: 600, h: 600, svg: aanwijzing(P) },
  'E.5.1': { w: 600, h: 600, svg: aanwijzing(twintig) },
  'E.5.3': { w: 600, h: 600, svg: aanwijzing(vier) },
  'E.6': { w: 600, h: 600, svg: aanwijzing(anker) },
  'E.7': { w: 600, h: 600, svg: aanwijzing(bolder) },
  'E.9a': { w: 600, h: 600, svg: vaarwegen(E9.a) },
  'E.9b': { w: 600, h: 600, svg: vaarwegen(E9.b) },
  'E.9c': { w: 600, h: 600, svg: vaarwegen(spiegel(E9.b)) },
  'E.9d': { w: 600, h: 600, svg: vaarwegen(E9.d) },
  'E.9e': { w: 600, h: 600, svg: vaarwegen(spiegel(E9.d)) },
  'E.9f': { w: 600, h: 600, svg: vaarwegen(E9.f) },
  'E.9g': { w: 600, h: 600, svg: vaarwegen(spiegel(E9.f)) },
  'E.9h': { w: 600, h: 600, svg: vaarwegen(E9.h) },
  'E.9i': { w: 600, h: 600, svg: vaarwegen(spiegel(E9.h)) },
  'E.10a': { w: 600, h: 600, svg: vaarwegen(E10.a) },
  'E.10b': { w: 600, h: 600, svg: vaarwegen(E10.b) },
  'E.10c': { w: 600, h: 600, svg: vaarwegen(E10.c) },
  'E.10d': { w: 600, h: 600, svg: vaarwegen(spiegel(E10.c)) },
  'E.10e': { w: 600, h: 600, svg: vaarwegen(E10.e) },
  'E.10f': { w: 600, h: 600, svg: vaarwegen(spiegel(E10.e)) },
  'E.11': { w: 600, h: 600, svg: einde },

  // --- E.15 to E.20: the permissions for the vessel kinds of A.12 to A.17, the same symbols in white (symbolen.js) ---
  'E.15': { w: 600, h: 600, svg: aanwijzing(symbool.schroef(WIT)) },
  'E.16': { w: 600, h: 600, svg: aanwijzing(symbool.sport(WIT)) },
  'E.18': { w: 600, h: 600, svg: aanwijzing(symbool.zeilboot(WIT)) },
  'E.19': { w: 600, h: 600, svg: aanwijzing(symbool.roeiboot(WIT, BLAUW)) },
  'E.20': { w: 600, h: 600, svg: aanwijzing(symbool.zeilplank(WIT)) },
};
