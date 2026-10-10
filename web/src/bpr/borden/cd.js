// Signs of group(s) CD of BPR bijlage 7, drawn after the BPR's own drawings (reference/bpr/tekens/bpr_img).
// See kader.js for the conventions every group follows.
import { svg, gebod, aanwijzing, tekst, WIT, ZWART, GROEN, GEEL } from './kader.js';

/** A black polygon through the given [x, y] points. */
const vlak = (pts, fill = ZWART) => `<polygon points="${pts.map((p) => p.join(',')).join(' ')}" fill="${fill}"/>`;

// The C triangles are roughly right-angled and isosceles in the BPR, their base on the border.
/** A triangle standing on the bottom of the field, `depth` high and `half` half wide (C.1: the bottom rises). */
const opBodem = (depth, half) => vlak([[300 - half, 540], [300, 540 - depth], [300 + half, 540]]);
/** A triangle hanging from the top of the field, apex down (C.2: limited headroom). */
const vanBoven = (depth, half) => vlak([[300 - half, 60], [300 + half, 60], [300, 60 + depth]]);
/** A pair of triangles on the left and right edges, apexes toward each other at height cy (C.3). */
const vanZijden = (cy, depth = 140) =>
  vlak([[60, cy - depth], [60 + depth, cy], [60, cy + depth]]) + vlak([[540, cy - depth], [540 - depth, cy], [540, cy + depth]]);

/** A diamond board with its points on the middles of the sides of a 600 square at (x, 0), outline inside. */
function ruitBord(x, fill, stroke, sw, extra = '') {
  const i = sw / Math.SQRT2;  // keep the outline's corners inside the 600 square
  const pts = [[300, i], [600 - i, 300], [300, 600 - i], [i, 300]].map(([a, b]) => `${a + x},${b}`).join(' ');
  return `${extra}<polygon points="${pts}" fill="${fill === 'none' ? 'none' : fill}" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="miter"/>`;
}

/** A white arrow pointing right on D.3a: broad shaft, head with bevelled, swept-back barbs (65515); D.3b stands it up. */
export const witPijl = () => vlak([[100, 259], [608, 259], [592, 176], [618, 170], [792, 300], [618, 430], [592, 424], [608, 341], [100, 341]], WIT);

export default {
  // C.1: depth limited; the plain sign and the one with the depth in cm above the triangle (BPR: 220)
  'C.1': { w: 600, h: 600, svg: gebod(opBodem(140, 140) + tekst(300, 265, '220', 235)) },
  // C.2: headroom limited; the BPR's example 7 (m) below the triangle
  'C.2': { w: 600, h: 600, svg: gebod(vanBoven(150, 165) + tekst(300, 385, '7', 230)) },
  // C.3: width of the channel limited; the BPR's example 12 (m) above the triangles
  'C.3': { w: 600, h: 600, svg: gebod(vanZijden(390, 135) + tekst(290, 200, '12', 250)) },
  // C.5: the channel lies at the distance shown (m) toward the side the arrow-shaped plate points
  'C.5': {
    w: 600, h: 600,
    svg: gebod(vlak([[300, 60], [540, 60], [540, 540], [300, 540], [128, 300]]) + tekst(342, 290, '12', 265, WIT)),
  },
  // D.1a: recommended passage, both ways: one yellow diamond with a thin black outline
  'D.1a': { w: 600, h: 600, svg: svg(600, 600, ruitBord(0, GEEL, ZWART, 14)) },
  // D.1b: recommended passage, one way only: two yellow diamonds side by side (the BPR's preferred form)
  'D.1b': { w: 1260, h: 600, svg: svg(1260, 600, ruitBord(0, GEEL, ZWART, 14) + ruitBord(660, GEEL, ZWART, 14)) },
  // D.2: stay within the passage marked by a pair of these; drawn is the left-hand board of the
  // BPR's pair (65514), whose green half is on the right, toward the channel
  'D.2': {
    w: 600, h: 600,
    svg: svg(600, 600, `<polygon points="300,5 595,300 300,595 5,300" fill="${WIT}"/><polygon points="300,5 595,300 300,595" fill="${GROEN}"/>`
      + ruitBord(0, 'none', GROEN, 8) + `<line x1="300" y1="5" x2="300" y2="595" stroke="${GROEN}" stroke-width="4"/>`),
  },
  // D.3a: recommended to keep to the direction of the arrow (here: right)
  'D.3a': { w: 900, h: 600, svg: aanwijzing(witPijl(), 900, 600) },
};
