// The logo of the app: the lelievlet in side view, as clean shapes. Hull, boeisel, spars and sails
// are the model's own lines (taken from the GLB in side view, the sails amidships as the CAD has
// them), cut off at the waterline; the lelie and the sail number sit where they sit on the sail.
// Two looks: 'kleur', in the boat's own colours on a light sky, and 'silhouet', white on sea blue.
// The app page draws it in the colours and number of the boat it was brought (app.html); the
// default icons are drawn from it too (scripts/icons.mjs).

// model metres: x from the spiegel to the bow, y up from the base line
const SHEER = [[-0.03, 0.965], [0.0, 0.947], [0.06, 0.927], [0.2, 0.911], [0.44, 0.886], [0.68, 0.861], [0.92, 0.839], [1.16, 0.819],
  [1.4, 0.802], [1.64, 0.786], [1.88, 0.773], [2.12, 0.763], [2.36, 0.757], [2.6, 0.755], [2.84, 0.756], [3.08, 0.76], [3.32, 0.766],
  [3.56, 0.778], [3.8, 0.793], [4.04, 0.81], [4.28, 0.829], [4.52, 0.852], [4.76, 0.879], [5.0, 0.911], [5.16, 0.933], [5.22, 0.945],
  [5.4, 0.99], [5.55, 1.03], [5.62, 1.0]];
const BOEISEL_LOW = [[0.0, 0.927], [0.03, 0.869], [0.09, 0.808], [0.12, 0.75], [0.24, 0.729], [0.39, 0.702], [0.6, 0.664], [0.84, 0.627],
  [1.08, 0.596], [1.32, 0.567], [1.56, 0.544], [1.8, 0.523], [2.04, 0.51], [2.28, 0.502], [2.52, 0.496], [2.76, 0.493], [3.0, 0.494],
  [3.24, 0.5], [3.48, 0.51], [3.72, 0.526], [3.96, 0.549], [4.2, 0.578], [4.44, 0.616], [4.68, 0.662], [4.92, 0.72], [5.1, 0.773],
  [5.28, 0.826], [5.43, 0.879], [5.55, 0.93], [5.61, 0.95]];
// the stem: raked, curving down from the stem head to the waterline
const STEM = [[5.62, 1.0], [5.61, 0.942], [5.55, 0.873], [5.49, 0.784], [5.43, 0.713], [5.37, 0.645], [5.31, 0.593], [5.25, 0.541],
  [5.19, 0.48], [5.13, 0.433], [5.07, 0.388], [5.01, 0.356], [4.95, 0.319], [4.92, 0.3]];
// the stern: the spiegel, one raked line from the waterline up to the sheer, as the model shows it
// from the side (the hull, the boeisel and the rudder's hinges all end on it)
const STERN = [[0.38, 0.3], [0.108, 0.742], [0.03, 0.869], [-0.03, 0.965]];
const WATER = 0.3;
// the rudder, drawn simply: the blade in the hull's colour, a gap of sky between it and
// the spiegel, what shows of it above the water - its fore edge along the spiegel, the top sloping aft
// and rounding down into a trailing edge that goes straight into the water; the helmstok from over
// the spiegel up a little, level, and a slight sweep up at its end
const RAKE = { top: [-0.03, 0.965], dir: [0.525, -0.851], aft: [-0.851, -0.525] };   // the spiegel: down along it, and square to it aft
const onRake = (t, off = 0) => [RAKE.top[0] + t * RAKE.dir[0] + off * RAKE.aft[0], RAKE.top[1] + t * RAKE.dir[1] + off * RAKE.aft[1]];
const ROERKOP = onRake(-0.14, 0.035);                                  // where the helmstok starts
const BLADE = { top: 0.335, gap: 0.07, aft: 0.32, bottom: 0.2 };       // along the spiegel, off it, and m aft and deep
// the head along the gaffel and the peak at its end: no sky between
const MAIN = [[0.869, 1.332], [3.469, 1.332], [3.457, 4.018], [1.794, 5.962], [1.615, 5.49], [1.455, 5.048], [1.344, 4.645],
  [1.233, 4.193], [1.146, 3.785], [1.067, 3.329], [1.006, 2.911], [0.95, 2.438], [0.911, 2.017], [0.885, 1.648]];
const FOK = [[3.8, 1.11], [4.079, 1.104], [4.477, 1.113], [4.85, 1.146], [5.19, 1.199], [5.396, 1.245], [3.842, 5.091]];   // clew forward of the mast
const MAST = [[3.624, 0.75], [3.624, 5.635]]; const GAFFEL = [[3.546, 3.914], [1.794, 5.962]]; const GIEK = [[0.763, 1.318], [3.517, 1.318]];
// the lelie and the number twice as large as on the sail and lower down, where it is widest: they
// have to read on a small icon. A long number is set smaller, so it stays within the cloth
const EMBLEM = { x: 1.865, y: 3.18, w: 0.77, h: 1.1 };
const NUMBER = { x: 2.2, y: 2.08, size: 0.85, width: 2.0 };          // m: its baseline, and the most it may take across

const DEFAULT = { romp: '#0a0a0b', boeisel: '#f5c20d', berghout: '#0a0a0b', zeilnummer: '000' };
const SEA = '#1d4e79';

/**
 * The logo as SVG text, `size` pixels square. `boat`: the Aanpassen values ({ kleuren, zeilnummer });
 * what is missing is the viewer's default. `emblem`: the zeilteken as a URL the SVG
 * can use - a data: URL where the SVG is drawn as an image, which may load nothing from outside.
 * `maskable` leaves the margin a launcher may cut a circle or a squircle out of.
 */
export function logoSvg({ look = 'kleur', boat = {}, emblem = null, size = 512, maskable = false } = {}) {
  const k = boat.kleuren ?? {};
  const romp = k.romp ?? DEFAULT.romp; const boeisel = k.boeisel ?? DEFAULT.boeisel; const berghout = k.berghout ?? DEFAULT.berghout;
  const number = String(boat.zeilnummer ?? DEFAULT.zeilnummer).trim();
  const showNumber = number && number !== DEFAULT.zeilnummer;       // the viewer's placeholder is no number
  const white = look === 'silhouet';
  // the frame: the boat from the water to the peak of the gaffel, square, the waterline low
  const span = maskable ? 8.6 : 6.7; const cx = 2.7; const bottom = maskable ? -1.3 : -0.4;
  const X = (x) => ((x - (cx - span / 2)) / span) * size; const Y = (y) => ((bottom + span - y) / span) * size; const L = (m) => (m / span) * size;
  const path = (pts, close = true) => `M${pts.map(([x, y]) => `${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join('L')}${close ? 'Z' : ''}`;
  const spar = ([a, b], w) => `<path d="${path([a, b], false)}" stroke="${white ? '#fff' : '#9b6a3c'}" stroke-width="${L(w).toFixed(1)}" stroke-linecap="round"/>`;
  const hull = [...SHEER, ...STEM, ...STERN];
  const band = [...SHEER.slice(1), ...BOEISEL_LOW.slice().reverse()];
  const wave = (y, amp) => {
    const pts = []; for (let x = -2; x <= 8; x += 0.1) pts.push([x, y + amp * Math.sin((x / 6.5) * 2 * Math.PI * 3)]);
    return pts;
  };
  const ink = white ? SEA : '#111';
  const out = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`);
  out.push('<defs><filter id="ink" color-interpolation-filters="sRGB">',
    `<feFlood flood-color="${ink}"/><feComposite in2="SourceAlpha" operator="in"/></filter>`,
    '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfe0ee"/><stop offset="1" stop-color="#f5f8fb"/></linearGradient></defs>');
  out.push(`<rect width="${size}" height="${size}" fill="${white ? SEA : 'url(#sky)'}"/>`);
  // sails first, the spars over their edges
  const cloth = white ? '#fff' : '#f4f1e8'; const seam = white ? 'none' : '#cdc6b6';
  for (const s of [FOK, MAIN]) out.push(`<path d="${path(s)}" fill="${cloth}" stroke="${seam}" stroke-width="${L(0.025).toFixed(1)}" stroke-linejoin="round"/>`);
  out.push(spar(GIEK, 0.075), spar(GAFFEL, 0.075), spar(MAST, 0.1));
  // the hull above the water: black, the boeisel band, and the berghout along the sheer
  out.push(`<path d="${path(hull)}" fill="${white ? '#fff' : romp}"/>`);
  if (!white) {
    out.push(`<path d="${path(band)}" fill="${boeisel}"/>`);
    out.push(`<path d="${path(SHEER, false)}" fill="none" stroke="${berghout}" stroke-width="${L(0.06).toFixed(1)}" stroke-linecap="round"/>`);
  }
  // the rudder blade, below the water where the sea covers it
  const [ax, ay] = onRake(BLADE.top, BLADE.gap);
  const [bx, by] = onRake((RAKE.top[1] - BLADE.bottom) / -RAKE.dir[1], BLADE.gap);
  const back = ax - BLADE.aft;
  out.push(`<path d="M${X(ax).toFixed(1)},${Y(ay).toFixed(1)}L${X(ax - 0.19).toFixed(1)},${Y(ay - 0.09).toFixed(1)}`
    + `Q${X(back).toFixed(1)},${Y(ay - 0.15).toFixed(1)} ${X(back).toFixed(1)},${Y(ay - 0.3).toFixed(1)}`
    + `L${X(back).toFixed(1)},${Y(BLADE.bottom).toFixed(1)}L${X(bx).toFixed(1)},${Y(by).toFixed(1)}Z" fill="${white ? '#fff' : romp}"/>`);
  // the helmstok: from the roerkop up a little, level, and a slight sweep up at its end
  const [hx, hy] = ROERKOP; const level = hy + 0.05;
  out.push(`<path d="M${X(hx).toFixed(1)},${Y(hy).toFixed(1)}Q${X(hx + 0.08).toFixed(1)},${Y(level).toFixed(1)} ${X(hx + 0.2).toFixed(1)},${Y(level).toFixed(1)}`
    + `L${X(0.45).toFixed(1)},${Y(level).toFixed(1)}Q${X(0.6).toFixed(1)},${Y(level).toFixed(1)} ${X(0.66).toFixed(1)},${Y(level + 0.05).toFixed(1)}"`
    + ` fill="none" stroke="${white ? '#fff' : '#9b6a3c'}" stroke-width="${L(0.06).toFixed(1)}" stroke-linecap="round" stroke-linejoin="round"/>`);
  // the lelie and the number, on the grootzeil
  if (emblem) {
    out.push(`<image href="${emblem}" x="${X(EMBLEM.x).toFixed(1)}" y="${Y(EMBLEM.y + EMBLEM.h).toFixed(1)}" width="${L(EMBLEM.w).toFixed(1)}" height="${L(EMBLEM.h).toFixed(1)}" preserveAspectRatio="xMidYMid meet" filter="url(#ink)"/>`);
  }
  if (showNumber) {
    const text = number.replace(/[<&"]/g, '');
    out.push(`<text x="${X(NUMBER.x).toFixed(1)}" y="${Y(NUMBER.y).toFixed(1)}" font-family="Arial, Helvetica, system-ui, sans-serif" font-weight="700" font-size="${L(Math.min(NUMBER.size, NUMBER.width / (0.58 * text.length))).toFixed(1)}" text-anchor="middle" fill="${ink}">${text}</text>`);
  }
  // the water
  if (white) {
    for (const [y, a, w, o] of [[WATER - 0.08, 0.045, 0.1, 1], [WATER - 0.3, 0.04, 0.08, 0.6]]) {
      out.push(`<path d="${path(wave(y, a), false)}" fill="none" stroke="#fff" stroke-opacity="${o}" stroke-width="${L(w).toFixed(1)}" stroke-linecap="round"/>`);
    }
  } else {
    const top = wave(WATER, 0.045);
    out.push(`<path d="${path([...top, [8, bottom - 1], [-2, bottom - 1]])}" fill="${SEA}"/>`);
    out.push(`<path d="${path(top, false)}" fill="none" stroke="#5f8fb8" stroke-width="${L(0.04).toFixed(1)}"/>`);
  }
  out.push('</svg>');
  return out.join('');
}
