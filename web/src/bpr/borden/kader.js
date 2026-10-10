// The scheepvaartverkeerstekens of BPR bijlage 7, drawn here from the drawings in the BPR itself
// (reference/bpr/tekens/bpr_img, conventions in reference/bpr/TEKENS.md): no one else's artwork, so
// no licence to carry. Every sign is an SVG string; tekens.js turns it into the face of a board.
//
// Conventions, the same for every group file:
// - a square sign is 600 x 600 units, an upright one 600 x 900, a landscape one 900 x 600; the
//   BPR's measures are in fractions of the side, so they hold at any size
// - the border is 1/10 of the (shorter) side, drawn as a stroke of 60 centred 30 in from the edge;
//   the red diagonal of a prohibition runs corner to corner, top left to bottom right, as wide as
//   the border, and the symbol is drawn on top of it
// - symbols in ZWART on white, or WIT on blue; letters and figures in a plain bold sans (the RWS
//   Ee-alfabet is not free), sized in units
// - a group file exports { code: { w, h, svg } } where svg is the complete <svg> string; use the
//   helpers below for the frames so every sign agrees

// the RAL traffic colours as they are usually rendered (neither the BPR nor the RST gives values)
export const ROOD = '#c1121c';        // RAL 3020
export const WIT = '#f7fbf5';         // RAL 9016
export const ZWART = '#2a2d2f';       // RAL 9017
export const BLAUW = '#0e4c96';       // RAL 5017
export const GROEN = '#237f52';       // RAL 6024
export const GEEL = '#f7ba0b';        // RAL 1023

export const RAND = 60;               // units: the border of a 600 sign

/** The complete SVG of a sign `w` x `h` with `body` inside. */
export const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;

/** A prohibition (A): white field, red border and the red diagonal, `symbol` on top. */
export const verbod = (symbol, w = 600, h = 600) => svg(w, h,
  `<rect x="${RAND / 2}" y="${RAND / 2}" width="${w - RAND}" height="${h - RAND}" fill="${WIT}" stroke="${ROOD}" stroke-width="${RAND}"/>`
  + `<line x1="${RAND / 2}" y1="${RAND / 2}" x2="${w - RAND / 2}" y2="${h - RAND / 2}" stroke="${ROOD}" stroke-width="${RAND}"/>${symbol}`);

/** An obligation or restriction (B, C): white field, red border, no diagonal. */
export const gebod = (symbol, w = 600, h = 600) => svg(w, h,
  `<rect x="${RAND / 2}" y="${RAND / 2}" width="${w - RAND}" height="${h - RAND}" fill="${WIT}" stroke="${ROOD}" stroke-width="${RAND}"/>${symbol}`);

/** A permission or indication (E): blue field with a thin white keyline just inside the edge, `symbol` in white. */
export const aanwijzing = (symbol, w = 600, h = 600) => svg(w, h,
  `<rect width="${w}" height="${h}" fill="${BLAUW}"/>`
  + `<rect x="${w * 0.03}" y="${h * 0.03}" width="${w * 0.94}" height="${h * 0.94}" fill="none" stroke="${WIT}" stroke-width="${Math.min(w, h) * 0.012}"/>${symbol}`);

/** A square set on its point (A.10, D.1, D.2), in a 600 x 600 sign: the points at the middles of the sides. */
export const ruit = (fill, stroke = 'none', strokeWidth = 0) => `<polygon points="300,4 596,300 300,596 4,300" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;

/** Text centred at x, y (the middle of the capitals), bold, `size` units high. */
export const tekst = (x, y, text, size, fill = ZWART) =>
  `<text x="${x}" y="${y + size * 0.36}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${size}" text-anchor="middle" fill="${fill}">${text}</text>`;

/**
 * An arrow from (x1, y1) to (x2, y2): a shaft `width` wide and a head `head` long and `head` wide
 * at its base, as the BPR draws them (a plain straight arrow, solid).
 */
export function pijl(x1, y1, x2, y2, width, head, fill = ZWART) {
  const len = Math.hypot(x2 - x1, y2 - y1); const ux = (x2 - x1) / len; const uy = (y2 - y1) / len;
  const px = -uy; const py = ux; const shaftEnd = len - head; const w = width / 2; const hw = head / 2;
  const at = (a, b) => `${(x1 + ux * a + px * b).toFixed(1)},${(y1 + uy * a + py * b).toFixed(1)}`;
  return `<polygon points="${[at(0, -w), at(shaftEnd, -w), at(shaftEnd, -hw), at(len, 0), at(shaftEnd, hw), at(shaftEnd, w), at(0, w)].join(' ')}" fill="${fill}"/>`;
}

/**
 * A signal light as the BPR draws it: a round lamp in a black housing with a white rim. `kind`:
 * 'vast' (plain disc), 'flikker' (a disc with black wedges), 'isofase' (the top and bottom quadrants
 * black, between the diagonals, as in D.3c and E.12b).
 */
export function lamp(cx, cy, r, colour, kind = 'vast') {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r * 1.25}" fill="${ZWART}" stroke="${WIT}" stroke-width="${r * 0.08}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${colour}"/>`;
  const wedge = (a0, a1) => {
    const p = (a) => `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
    return `<path d="M${cx},${cy} L${p(a0)} A${r},${r} 0 0 1 ${p(a1)} Z" fill="${ZWART}"/>`;
  };
  if (kind === 'flikker') for (let i = 0; i < 4; i++) s += wedge((i * Math.PI) / 2 + 0.3, (i * Math.PI) / 2 + 0.9);
  if (kind === 'isofase') s += wedge(-0.75 * Math.PI, -0.25 * Math.PI) + wedge(0.25 * Math.PI, 0.75 * Math.PI);
  return s;
}

/** A stand-in for a sign nobody has drawn yet: grey board with its code. */
export const plaatshouder = (code, w = 600, h = 600) => svg(w, h,
  `<rect x="15" y="15" width="${w - 30}" height="${h - 30}" fill="#e6e6e2" stroke="#888" stroke-width="30"/>${tekst(w / 2, h / 2, code, 110, '#555')}`);
