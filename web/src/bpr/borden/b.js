// Signs of group(s) B of BPR bijlage 7, drawn after the BPR's own drawings (reference/bpr/tekens/bpr_img).
// See kader.js for the conventions every group follows.
import { gebod, tekst, ZWART } from './kader.js';

/**
 * The BPR's arrow, pointing right from x0 to the tip at x1 on the line y = cy: a straight shaft
 * `shaft` wide and a head `head` wide and `headLen` long whose barbs are cut off square-ish and
 * swept back a little (measured on 65453 and 65454).
 */
function pijlR(x0, x1, cy, shaft, head, headLen, fill = ZWART) {
  const c = x1 - headLen; const s = shaft / 2; const h = head / 2;
  const back = c - headLen * 0.2; const join = c - headLen * 0.05;  // the swept-back barb
  const pts = [[x0, -s], [join, -s], [back, -h * 0.95], [c, -h], [x1, 0], [c, h], [back, h * 0.95], [join, s], [x0, s]];
  return `<polygon points="${pts.map(([x, y]) => `${x.toFixed(1)},${(cy + y).toFixed(1)}`).join(' ')}" fill="${fill}"/>`;
}

/** A black bar with round ends from (x1, y1) to (x2, y2), `width` wide (B.5, B.8). */
const staaf = (x1, y1, x2, y2, width) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${ZWART}" stroke-width="${width}" stroke-linecap="round"/>`;

/** A black rectangle. */
const blok = (x, y, w, h) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${ZWART}"/>`;

export default {
  // B.1a: follow the direction of the arrow; landscape, the arrow a little right of centre
  'B.1a': { w: 900, h: 600, svg: gebod(pijlR(124, 776, 300, 63, 180, 130), 900, 600) },
  // B.1b: the same arrow pointing up, on an upright board
  'B.1b': {
    w: 600, h: 900,
    svg: gebod(`<g transform="rotate(-90 300 450)">${pijlR(300 - 294, 300 + 333, 450, 63, 176, 130)}</g>`, 600, 900),
  },
  // B.5: stop (under the circumstances the BPR gives): a horizontal bar with round ends
  'B.5': { w: 600, h: 600, svg: gebod(staaf(170, 300, 430, 300, 100)) },
  // B.6: do not exceed the speed shown (km/h); the BPR's example is 7
  'B.6': { w: 600, h: 600, svg: gebod(tekst(300, 300, '7', 420)) },
  // B.8: keep a sharp lookout: a vertical bar with round ends
  'B.8': { w: 600, h: 600, svg: gebod(staaf(300, 170, 300, 430, 100)) },
  // B.9a: main channel ahead, crossing it: a band across the whole field and a stem down from it
  'B.9a': { w: 600, h: 600, svg: gebod(blok(60, 218, 480, 151) + blok(250, 360, 100, 180)) },
  // B.9b: a crossing: the band across and a vertical band from top to bottom
  'B.9b': { w: 600, h: 600, svg: gebod(blok(60, 225, 480, 152) + blok(250, 60, 100, 480)) },
};
