// Signs of group(s) A of BPR bijlage 7, drawn after the BPR's own drawings (reference/bpr/tekens/bpr_img).
// See kader.js for the conventions every group follows.
import { svg, verbod, ruit, tekst, lamp, ROOD, WIT, ZWART, GROEN } from './kader.js';
import { glad, schroef, sport, zeilboot, roeiboot, zeilplank } from './symbolen.js';

/**
 * A vertical arrow with its tip at (x, tip) and its tail at (x, tail): a shaft `shaft` wide and a
 * head `len` long and `wide` wide, as in A.2 and A.4 (the BPR head is wider than it is long).
 */
function pijlV(x, tail, tip, shaft = 62, len = 146, wide = 176) {
  const d = Math.sign(tip - tail); const base = tip - d * len; const s = shaft / 2; const h = wide / 2;
  return `<polygon points="${x - s},${tail} ${x - s},${base} ${x - h},${base} ${x},${tip} ${x + h},${base} ${x + s},${base} ${x + s},${tail}" fill="${ZWART}"/>`;
}

/** Anchor drawn upside down: curved flukes at the top, the shank down to the stock and the ring. */
const anker = () => `<g fill="${ZWART}">`
  + `<path d="M165,168 A206,206 0 0 1 440,168" fill="none" stroke="${ZWART}" stroke-width="52" stroke-linecap="round"/>`
  + '<polygon points="275,120 330,120 342,392 270,392"/>'
  + '<rect x="225" y="385" width="155" height="36"/>'
  + '<path fill-rule="evenodd" d="M272,447 a30,32 0 1 0 60,0 a30,32 0 1 0 -60,0 Z M292,443 a10,10 0 1 0 20,0 a10,10 0 1 0 -20,0 Z"/>'
  + '</g>';

/** Mooring bollard from the side: a head flaring to the top, a waist, a collar with round ends, a flared foot on a base plate. */
const bolder = () => `<g fill="${ZWART}"><path d="${glad([
  [300, 140], [400, 148], [420, 166], [425, 195], [414, 222], [393, 247], [376, 276], [371, 305],
  [406, 311], [425, 337], [406, 363], [379, 368], [383, 400], [398, 432], [425, 458], [460, 472],
  [455, 478], [190, 478], [185, 472], [207, 450], [221, 415], [226, 370],
  [196, 362], [180, 338], [196, 313], [229, 306], [226, 276], [208, 247], [187, 222], [177, 193], [184, 164], [205, 150],
])}"/><rect x="103" y="475" width="397" height="50"/></g>`;

/** Two waves: arches with flat ends, the ends cut square, running across the field. */
const golven = () => [247, 419].map((y) =>
  `<path d="M78,${y} C185,${y} 195,${y - 68} 300,${y - 68} C405,${y - 68} 415,${y} 522,${y}" fill="none" stroke="${ZWART}" stroke-width="76"/>`).join('');

/** A backplate with two signal lights one above the other, red over green. */
const lichten = (w, h, y1, y2, r, groen = 'vast') => svg(w, h,
  `<rect width="${w}" height="${h}" fill="${ZWART}"/>${lamp(w / 2, y1, r, ROOD)}${lamp(w / 2, y2, r, GROEN, groen)}`);

export default {
  // board: three horizontal bands red / white / red inside a thin red outline
  'A.1': { w: 900, h: 600, svg: svg(900, 600,
    `<rect x="3" y="3" width="894" height="594" fill="${WIT}" stroke="${ROOD}" stroke-width="6"/>`
    + `<rect x="18" y="18" width="864" height="210" fill="${ROOD}"/><rect x="18" y="372" width="864" height="210" fill="${ROOD}"/>`) },
  // red disc, white bar almost the full width
  'A.1a': { w: 600, h: 600, svg: svg(600, 600,
    `<circle cx="300" cy="300" r="300" fill="${ROOD}"/><rect x="24" y="241" width="552" height="118" fill="${WIT}"/>`) },
  // two arrows up, staggered: lower left and upper right
  'A.2': { w: 600, h: 900, svg: verbod(pijlV(216, 805, 500) + pijlV(394, 435, 133), 600, 900) },
  // left arrow down, right arrow up
  'A.4': { w: 600, h: 900, svg: verbod(pijlV(210, 124, 785) + pijlV(393, 790, 126), 600, 900) },
  'A.5': { w: 600, h: 600, svg: verbod(`<g transform="translate(306,0) scale(1.15,1) translate(-306,0)">${tekst(295, 293, 'P', 550)}</g>`) },
  // the width in metres; 20 as in the BPR drawing, the wide round figures stretched a little
  'A.5.1': { w: 600, h: 600, svg: verbod(`<g transform="translate(305,0) scale(1.24,1) translate(-305,0)">${tekst(305, 288, '20', 312)}</g>`) },
  'A.6': { w: 600, h: 600, svg: verbod(anker()) },
  'A.7': { w: 600, h: 600, svg: verbod(bolder()) },
  'A.9': { w: 600, h: 600, svg: verbod(golven()) },
  // the board on the left bank: red half outward (left), white half toward the channel, thin red outline
  'A.10': { w: 600, h: 600, svg: svg(600, 600,
    `${ruit(WIT, ROOD, 8)}<polygon points="300,4 4,300 300,596" fill="${ROOD}"/>`) },
  // lights only: red fixed over green fixed
  'A.11': { w: 360, h: 600, svg: lichten(360, 600, 143, 458, 100) },
  // red fixed over green flashing
  'A.11.1': { w: 360, h: 720, svg: lichten(360, 720, 151, 555, 104, 'flikker') },
  'A.12': { w: 600, h: 600, svg: verbod(schroef(ZWART)) },
  'A.13': { w: 600, h: 600, svg: verbod(sport(ZWART)) },
  'A.15': { w: 600, h: 600, svg: verbod(zeilboot(ZWART)) },
  'A.16': { w: 600, h: 600, svg: verbod(roeiboot(ZWART)) },
  'A.17': { w: 600, h: 600, svg: verbod(zeilplank(ZWART)) },
};
