// Vessel symbols shared by the A prohibitions (black on white) and their E permissions (white on
// blue): A.12/E.15, A.13/E.16, A.15/E.18, A.16/E.19, A.17/E.20. Each is drawn in the 600 x 600
// frame of a square sign after the BPR's own drawing, in one colour `fill`; `gap` (the field colour)
// is used where the BPR separates two overlapping parts with a thin line of the background.

/**
 * A smooth closed outline through `pts` ([x, y] pairs), as a path: a Catmull-Rom spline turned
 * into cubic Béziers, so an organic shape can be given as the points it passes through.
 */
export function glad(pts) {
  const n = pts.length; const p = (i) => pts[(i + n) % n]; const f = (v) => v.toFixed(1);
  let d = `M${p(0)[0]},${p(0)[1]}`;
  for (let i = 0; i < n; i++) {
    const [a, b, c, e] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    d += ` C${f(b[0] + (c[0] - a[0]) / 6)},${f(b[1] + (c[1] - a[1]) / 6)} ${f(c[0] - (e[0] - b[0]) / 6)},${f(c[1] - (e[1] - b[1]) / 6)} ${c[0]},${c[1]}`;
  }
  return `${d} Z`;
}

/** Three-bladed propeller seen end-on: blades up (leaning left), right, and down-left. */
export const schroef = (fill) => `<path fill="${fill}" d="${glad([
  // upper blade, right edge
  [248, 118], [280, 128], [298, 150], [312, 170], [322, 190], [327, 215], [328, 245], [334, 270], [345, 293],
  // right blade
  [366, 298], [392, 287], [420, 279], [452, 282], [476, 300], [487, 330], [482, 358], [465, 380], [430, 395], [395, 392], [360, 378], [305, 364],
  // lower blade
  [272, 372], [264, 390], [262, 410], [259, 432], [248, 452], [225, 466], [195, 467], [170, 455], [155, 432], [151, 410],
  [155, 390], [164, 370], [177, 350], [199, 330], [237, 310],
  // upper blade, left edge
  [250, 290], [255, 270], [250, 250], [230, 230], [203, 210], [192, 190], [192, 168], [200, 148], [220, 128],
])}"/>`;

/** The word "sport", lower case, spaced wide as in the BPR drawing. */
export const sport = (fill) =>
  `<text x="300" y="340" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="146" letter-spacing="6" text-anchor="middle" fill="${fill}">sport</text>`;

/** Sailing boat in side view: a right-angled mainsail with the mast at the right, a hull below. */
export const zeilboot = (fill) => `<g fill="${fill}">`
  + '<polygon points="352,100 356,405 123,405"/>'
  + '<path d="M93,435 L513,436 L418,513 L135,513 C110,513 97,495 95,470 Z"/>'
  + '</g>';

/** Rowing boat with one rower, facing left, the oar running down to the lower left across the hull. */
export function roeiboot(fill, gap) {
  const oar = (stroke, extra = 0) => `<g stroke="${stroke}" stroke-linecap="round">`
    + `<line x1="446" y1="219" x2="200" y2="480" stroke-width="${20 + extra}"/>`
    + `<line x1="294" y1="380" x2="190" y2="490" stroke-width="${34 + extra}"/></g>`;
  // where the oar crosses the hull the E drawing keeps a thin line of the field colour around it
  const cut = gap ? `<clipPath id="roeiboot-romp"><rect x="80" y="284" width="450" height="85"/></clipPath>`
    + `<g clip-path="url(#roeiboot-romp)">${oar(gap, 24)}</g>` : '';
  return `<g fill="${fill}">`
    + '<circle cx="240" cy="165" r="33"/>'
    + '<polygon points="227,215 440,215 440,240 296,240 300,290 235,290"/>'
    + '<polygon points="93,288 513,288 500,365 150,365"/>'
    + `</g>${cut}${oar(fill)}`;
}

/** Windsurfer: a person leaning back on the left, arms out to the boom, a curved sail on the right. */
export const zeilplank = (fill) => `<g fill="${fill}">`
  + '<circle cx="128" cy="272" r="24"/>'
  // sail: straight luff from the masthead to the tack, straight foot, a curved leech
  + '<path d="M345,97 L270,457 L457,392 C458,300 420,180 345,97 Z"/>'
  // body: shoulders, arms out to the boom, the torso, the bent leg down to the board
  + '<polygon points="118,296 152,300 272,310 276,330 174,331 176,395 212,405 262,452 276,502 250,502 238,458 160,428 132,395"/>'
  + '<rect x="218" y="505" width="92" height="14" rx="7"/>'
  + '</g>';
