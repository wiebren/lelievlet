// Signs of BPR bijlage 7 group E that CWO does not ask about, drawn after the BPR's own drawings
// (reference/bpr/tekens/bpr_img) like e.js, each with what the viewer needs to list and explain it.
// See kader.js for the conventions every group follows.
import { svg, aanwijzing, tekst, WIT, BLAUW } from './kader.js';
import { glad } from './symbolen.js';

/** A number in units, rounded for the SVG. */
const n = (v) => +v.toFixed(1);
const xy = ([x, y]) => `${n(x)},${n(y)}`;

/** A white shape: a path, a polygon through [x, y] points, a rectangle, a circle. */
const wit = (d) => `<path d="${d}" fill="${WIT}"/>`;
const vlak = (pts, fill = WIT) => `<polygon points="${pts.map(xy).join(' ')}" fill="${fill}"/>`;
const blok = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"${rx ? ` rx="${rx}"` : ''} fill="${WIT}"/>`;
const rond = (cx, cy, r, fill = WIT) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/>`;

/** The curve segments of a smooth open line through `pts` (Catmull-Rom as cubic Béziers), without its M. */
function bochten(pts) {
  let d = '';
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[Math.max(i - 1, 0)]; const b = pts[i]; const c = pts[i + 1]; const e = pts[Math.min(i + 2, pts.length - 1)];
    d += ` C${xy([b[0] + (c[0] - a[0]) / 6, b[1] + (c[1] - a[1]) / 6])} ${xy([c[0] - (e[0] - b[0]) / 6, c[1] - (e[1] - b[1]) / 6])} ${xy(c)}`;
  }
  return d;
}

/**
 * A white line `w` wide through one or more runs of points: smooth within a run, a sharp corner
 * where one run ends and the next begins (the wake of E.21 and E.24 meeting the waves).
 */
const band = (runs, w, cap = 'butt') => `<path d="M${xy(runs[0][0])}${runs.map(bochten).join('')}" fill="none" stroke="${WIT}" stroke-width="${w}" stroke-linecap="${cap}" stroke-linejoin="round"/>`;

/** An arc of a circle round (cx, cy), `w` wide, from angle a0 to a1 in degrees (clockwise on screen when a1 > a0). */
function boog(cx, cy, r, a0, a1, w) {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  return `<path d="M${xy(p(a0))} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${xy(p(a1))}" fill="none" stroke="${WIT}" stroke-width="${w}"/>`;
}

/** An arrowhead: base `breed` wide centred on (x, y), its point `lang` further on in direction `hoek` (degrees). */
function kop(x, y, hoek, breed, lang) {
  const ux = Math.cos((hoek * Math.PI) / 180); const uy = Math.sin((hoek * Math.PI) / 180);
  return vlak([[x - uy * breed / 2, y + ux * breed / 2], [x + ux * lang, y + uy * lang], [x + uy * breed / 2, y - ux * breed / 2]]);
}

// E.3: the weir, white field inside the keyline with the blue of the weir on it: the deck along the top
// with a step down in the middle, four piers below, the sill along the bottom
const stuw = aanwijzing(`<rect x="21.6" y="21.6" width="556.8" height="556.8" fill="${WIT}"/>`
  + `<path d="M21.6,21.6 H578.4 V154 H467 V223 H133 V154 H21.6 Z" fill="${BLAUW}"/>`
  + [135, 229, 323, 417].map((x) => `<rect x="${x}" y="269" width="48" height="179" fill="${BLAUW}"/>`).join('')
  + `<rect x="21.6" y="494" width="556.8" height="84.4" fill="${BLAUW}"/>`);

// E.5.2: landscape, about 2.2 : 1 in the BPR; the keyline as far in from every edge as on a square sign
const tussen = svg(1320, 600, `<rect width="1320" height="600" fill="${BLAUW}"/>`
  + `<rect x="18" y="18" width="1284" height="564" fill="none" stroke="${WIT}" stroke-width="7.2"/>`
  + tekst(660, 300, '30-60', 340, WIT).replace('<text ', '<text letter-spacing="18" '));

// E.5.4 to E.5.15, the reserved berths of art. 7.06: a white triangle point up (duwvaart), point down
// (other ships than duwvaart) or a diamond (both), 0.67 of the side across, with in it the blue cones
// (point down) those ships must carry: one, two or three, smaller when there are three
const VORM = {
  duw: { pts: [[300, 126], [501, 474], [99, 474]], midden: [348, 354, 339] },
  ander: { pts: [[99, 126], [501, 126], [300, 474]], midden: [261, 261, 287] },
  alle: { pts: [[300, 99], [501, 300], [300, 501], [99, 300]], midden: [318, 318, 321] },
};
function ligplaats(vorm, kegels) {
  const { pts, midden } = VORM[vorm];
  let s = vlak(pts);
  if (kegels) {
    const b = kegels === 3 ? 84 : 114; const h = b * 0.866; const tussenruimte = 18;
    const top = midden[kegels - 1] - (kegels * h + (kegels - 1) * tussenruimte) / 2;
    for (let i = 0; i < kegels; i++) {
      const y = top + i * (h + tussenruimte);
      s += vlak([[300 - b / 2, y], [300 + b / 2, y], [300, y + h]], BLAUW);
    }
  }
  return aanwijzing(s);
}

// E.6.1: a ship in side view on a wavy waterline, a spud pole through it down to the bottom line
const spudpaal = aanwijzing(band([[[20, 349], [40, 352], [60, 337], [80, 332], [100, 334], [125, 340]]], 10)
  + band([[[475, 358], [500, 354], [520, 345], [540, 335], [560, 329], [580, 337]]], 10)
  + blok(20, 479, 560, 10)
  + vlak([[104, 310], [500, 310], [494, 345], [458, 394], [130, 394], [113, 350]])
  + blok(184, 236, 86, 76)
  + wit('M399,290 H422 V492 Q422,506 410.5,506 Q399,506 399,492 Z'));

// E.7.1: a car seen from the front under a crane: the jib tapering up to the left, its post at the right,
// the hook on a thin line
const auto = aanwijzing(
  vlak([[272, 61], [282, 68], [310, 100], [350, 150], [388, 200], [431, 250], [464, 290], [494, 330], [505, 358], [508, 496],
    [475, 496], [474, 360], [456, 333], [429, 292], [401, 252], [366, 202], [330, 152], [297, 103], [272, 72]])
  + `<line x1="273" y1="76" x2="274" y2="240" stroke="${WIT}" stroke-width="7"/>`
  + `<path d="M276,256 L287,280 C292,294 280,302 266,296" fill="none" stroke="${WIT}" stroke-width="8" stroke-linecap="round"/>`
  + `<path d="M176,401 L193,345 L371,338 L395,399" fill="none" stroke="${WIT}" stroke-width="9" stroke-linejoin="round"/>`
  + `<path fill-rule="evenodd" fill="${WIT}" d="M155,407 C160,397 175,395 195,394 L300,391 L395,395 C405,396 412,400 413,410`
  + ' L410,440 C406,458 396,467 385,470 L300,483 L200,481 C176,478 163,466 158,452 Z'
  + ' M165,428 A14,14 0 1 0 193,428 A14,14 0 1 0 165,428 Z M366,421 A15,15 0 1 0 396,421 A15,15 0 1 0 366,421 Z"/>'
  + blok(180, 470, 15, 31) + blok(375, 462, 15, 34));

// E.8: two turning arrows, both 50 wide: a large arc clockwise from the bottom round the left to a head
// at the upper right, and inside it a small arc anticlockwise round the right to a head at the upper left
const keren = aanwijzing(boog(297, 297, 212, 77, 310.6, 50) + kop(434.8, 136, 43.8, 154, 121)
  + boog(297, 300, 81, 98, -120.5, 50) + kop(255.9, 230.2, 139.2, 156, 115));

// E.13: a tap, the spout to the left: a cross handle with flared ends, the spindle, the bonnet, the body
// with its rounded foot, the spout curving down
const kraan = aanwijzing(
  wit('M256,116 Q256,110 262,110 H286 Q300,118 328,118 H415 Q443,118 457,110 H481 Q487,110 487,116 V149 Q487,155 481,155'
    + ' H457 Q443,144 415,144 H328 Q300,144 286,155 H262 Q256,155 256,149 Z')
  + blok(359, 140, 25, 60) + blok(334, 195, 73, 102, 4) + blok(311, 292, 121, 66, 4)
  + wit('M510,356 V418 H424 V440 Q424,469 395,469 H345 Q316,469 316,440 V418 H260 C215,418 178,424 162,450'
    + ' Q150,470 146,492 H93 C93,440 125,385 200,362 Q228,356 262,356 Z'));

// E.14: a telephone handset, the earpiece at the upper left, the mouthpiece at the lower right
const telefoon = aanwijzing(`<path fill="${WIT}" d="${glad([
  [150, 120], [178, 121], [188, 137], [200, 157], [215, 177], [232, 195], [238, 207], [230, 222], [210, 231], [193, 236],
  [187, 252], [193, 268], [208, 286], [235, 306], [262, 327], [283, 350], [300, 374], [318, 391], [340, 398], [356, 395],
  [365, 374], [380, 358], [397, 350], [412, 356], [440, 378], [465, 398], [474, 413], [468, 433], [445, 443], [420, 460],
  [385, 474], [355, 466], [320, 459], [285, 446], [250, 426], [215, 400], [188, 375], [165, 345], [145, 310], [132, 278],
  [121, 245], [115, 212], [121, 185], [135, 160], [146, 140],
])}"/>`);

// E.17: a water skier facing left, leaning back, arms out to the tow line, on a ski with its tip up
const waterski = aanwijzing(rond(495, 140, 27)
  + vlak([[312, 188], [495, 185], [502, 192], [502, 215], [497, 240], [490, 260], [487, 282], [480, 300], [462, 318], [440, 324],
    [420, 329], [400, 334], [380, 336], [360, 341], [349, 350], [335, 370], [322, 390], [316, 402], [305, 424], [279, 424],
    [281, 407], [290, 390], [300, 370], [310, 350], [315, 334], [322, 322], [340, 311], [360, 304], [380, 296], [400, 291],
    [424, 282], [426, 262], [430, 240], [435, 210], [388, 208], [330, 209]])
  + `<line x1="76" y1="202" x2="262" y2="190" stroke="${WIT}" stroke-width="7"/>`
  + band([[[145, 396], [160, 409], [200, 421], [300, 447], [414, 474]]], 13, 'round'));

// E.21: a speedboat planing to the right, bow high, the driver behind the windscreen, the outboard at
// the stern; under it the wake running into a wave
const snel = aanwijzing(rond(310, 189, 19)
  + vlak([[63, 350], [222, 301], [240, 275],
    [260, 239], [270, 221], [279, 213], [290, 216], [300, 219], [320, 224], [340, 229], [352, 229], [362, 222], [374, 214],
    [382, 217], [398, 239], [440, 231], [500, 216], [559, 200], [558, 215], [552, 236], [540, 252], [520, 275], [500, 292],
    [480, 308], [460, 318], [440, 323], [420, 331], [400, 336], [380, 341], [370, 343], [360, 338], [340, 325], [320, 318],
    [300, 313], [280, 315], [260, 315], [240, 325], [220, 336], [200, 348], [180, 361], [160, 374], [140, 384], [120, 397],
    [100, 399], [84, 400]])
  + vlak([[304, 238], [328, 240], [286, 275]], BLAUW)
  + `<rect x="39" y="322.5" width="50" height="17" rx="6" fill="${WIT}" transform="rotate(-14 64 331)"/>`
  + band([[[52, 410], [70, 418], [100, 423], [120, 421], [140, 410], [160, 398], [180, 385], [200, 373], [220, 362], [240, 350],
    [260, 341], [285, 336], [310, 338], [330, 345], [348, 357], [362, 370]],
  [[362, 370], [380, 361], [400, 358], [420, 360], [440, 365], [460, 373], [480, 381], [500, 386], [520, 387], [540, 383], [546, 380]]], 16, 'round'));

// E.22: a boat on a trailer on a slipway that runs down to the left into the waves
const trailer = aanwijzing(
  band([[[42, 431], [55, 428], [65, 423], [75, 414], [85, 411], [95, 414], [105, 421], [115, 428], [130, 432], [150, 426], [170, 420], [190, 420], [210, 428]]], 27)
  + band([[[42, 471], [55, 468], [65, 463], [75, 455], [85, 453], [95, 455], [105, 461], [115, 468], [130, 472], [150, 466], [170, 460], [190, 452], [205, 446]]], 27)
  + vlak([[150, 433], [555, 261], [555, 312], [150, 480]])
  + vlak([[166, 346], [474, 219], [480, 245], [175, 376]])
  + wit('M298,290 H360 V340 C360,352 350,357 330,357 C310,357 298,345 298,325 Z')
  + wit('M90,271 Q300,215 448,111 C450,175 420,225 365,264 L300,292 L283,298 L220,313 L180,317 L150,324 L135,323 Z'));

// E.23: VHF over the channel number
const marifoon = aanwijzing(tekst(300, 183, 'VHF', 179, WIT) + tekst(300, 413, '18', 179, WIT));

// E.24: a rider on a water scooter going up to the right, a thin line of blue along the hull, a wave below
const waterscooter = aanwijzing(rond(171, 131, 22)
  + vlak([[148, 159], [187, 161], [184, 232], [176, 252], [200, 266], [222, 276], [238, 284], [248, 305], [215, 303],
    [180, 291], [150, 282], [136, 274], [130, 258], [137, 205]])
  + `<g fill="none" stroke="${WIT}" stroke-linecap="round" stroke-linejoin="round"><path d="M186,175 L236,177" stroke-width="16"/>`
  + '<path d="M186,205 L220,216 L240,190" stroke-width="15"/><path d="M238,178 L322,262" stroke-width="17" stroke-linecap="butt"/></g>'
  + vlak([[100, 352], [320, 277], [310, 237], [511, 237], [500, 250], [480, 267], [460, 280], [440, 290], [380, 310], [320, 330],
    [260, 350], [200, 370], [140, 390], [100, 403], [91, 398], [92, 365]])
  + vlak([[100, 413], [140, 397], [200, 377], [260, 357], [320, 340], [380, 320], [440, 297], [480, 277], [500, 258], [513, 243],
    [511, 255], [500, 293], [480, 323], [460, 340], [440, 357], [400, 377], [360, 390], [340, 393], [320, 390], [300, 383],
    [280, 380], [260, 380], [240, 387], [220, 397], [200, 407], [180, 420], [160, 430], [140, 443], [118, 447], [104, 440], [98, 425]])
  + band([[[88, 475], [100, 478], [120, 480], [140, 477], [160, 468], [180, 458], [200, 445], [220, 435], [240, 425], [260, 414],
    [280, 410], [300, 415], [318, 430], [330, 444]],
  [[330, 444], [342, 428], [360, 425], [380, 426], [400, 431], [420, 438], [440, 443], [460, 448], [480, 449], [497, 447]]], 23));

// E.25: a plug and its socket from the side: two pins at the left, the plug, the socket tapering a little
// to the right, the cable
const walstroom = aanwijzing(blok(72, 208, 111, 49) + blok(72, 343, 111, 49) + blok(194, 173, 99, 251)
  + vlak([[307, 187], [446, 199], [446, 401], [307, 413]]) + blok(458, 262, 93, 76));

const vierkant = (s) => ({ w: 600, h: 600, svg: s });

export default {
  'E.3': vierkant(stuw),
  'E.5.2': { w: 1320, h: 600, svg: tussen },
  'E.5.4': vierkant(ligplaats('duw', 0)),
  'E.5.5': vierkant(ligplaats('duw', 1)),
  'E.5.6': vierkant(ligplaats('duw', 2)),
  'E.5.7': vierkant(ligplaats('duw', 3)),
  'E.5.8': vierkant(ligplaats('ander', 0)),
  'E.5.9': vierkant(ligplaats('ander', 1)),
  'E.5.10': vierkant(ligplaats('ander', 2)),
  'E.5.11': vierkant(ligplaats('ander', 3)),
  'E.5.12': vierkant(ligplaats('alle', 0)),
  'E.5.13': vierkant(ligplaats('alle', 1)),
  'E.5.14': vierkant(ligplaats('alle', 2)),
  'E.5.15': vierkant(ligplaats('alle', 3)),
  'E.6.1': vierkant(spudpaal),
  'E.7.1': vierkant(auto),
  'E.8': vierkant(keren),
  'E.13': vierkant(kraan),
  'E.14': vierkant(telefoon),
  'E.17': vierkant(waterski),
  'E.21': vierkant(snel),
  'E.22': vierkant(trailer),
  'E.23': vierkant(marifoon),
  'E.24': vierkant(waterscooter),
  'E.25': vierkant(walstroom),
};

// The reserved berths, E.5.4 to E.5.15: who may lie there, and what the cones mean (art. 3.14, 7.06, 7.07)
const KEGELS = [
  {},
  { aantal: 'één blauwe kegel of één blauw licht', lading: 'bepaalde brandbare stoffen', afstand: 10 },
  { aantal: 'twee blauwe kegels of twee blauwe lichten', lading: 'voor de gezondheid schadelijke stoffen', afstand: 50 },
  { aantal: 'drie blauwe kegels of drie blauwe lichten', lading: 'ontplofbare stoffen', afstand: 100 },
];
// who may lie there, and the words that go with them (duwvaart takes the singular)
const WIE = {
  duw: { naam: 'duwvaart', wie: 'mag alleen duwvaart ligplaats nemen: een duwboot met bakken ervoor', die: 'duwvaart', hoeft: 'hoeft', moet: 'moet', ze: 'die', vervoert: 'vervoert' },
  ander: { naam: 'andere schepen', wie: 'mogen alleen andere schepen dan duwvaart ligplaats nemen', die: 'schepen', hoeft: 'hoeven', moet: 'moeten', ze: 'ze', vervoert: 'vervoeren' },
  alle: { naam: 'alle schepen', wie: 'mogen duwvaart en andere schepen ligplaats nemen', die: 'schepen', hoeft: 'hoeven', moet: 'moeten', ze: 'ze', vervoert: 'vervoeren' },
};
const KORT = ['geen blauwe kegel', 'één blauwe kegel', 'twee blauwe kegels', 'drie blauwe kegels'];
function gereserveerd(code, vorm, k) {
  const w = WIE[vorm]; const kegel = KEGELS[k];
  const betekenis = `Aan deze kant van de vaarweg ${w.wie}. ` + (k === 0
    ? `Dat geldt alleen voor ${w.die} die geen blauwe kegel of blauw licht ${w.hoeft} te voeren.`
    : `Dat geldt alleen voor ${w.die} die ${kegel.aantal} ${w.moet} voeren, omdat ${w.ze} ${kegel.lading} ${w.vervoert}.`);
  let lelievlet;
  if (k === 0) lelievlet = vorm === 'duw' ? 'Een lelievlet is geen duwvaart, dus hier mag je geen ligplaats nemen.'
    : 'Een lelievlet voert geen blauwe kegel, dus je mag hier ligplaats nemen, zo dicht mogelijk bij de oever.';
  else lelievlet = `Hier mag een lelievlet niet liggen. Neem ook nergens ligplaats binnen ${kegel.afstand} meter van een schip met ${KORT[k]}.`;
  return { code, naam: `Ligplaats ${w.naam}: ${KORT[k]}`, kleur: 'blauw', groep: 'Gereserveerde ligplaatsen', betekenis, lelievlet };
}

export const EXTRA = [
  { code: 'E.3', naam: 'Stuw', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Verderop ligt een stuw: een dam in de rivier die de waterstand regelt. Je mag alleen door een opening met aan beide kanten een groen teken (E.1), of met een geel ruitteken (D.1) op de brug erboven.',
    lelievlet: 'Blijf ruim weg van de stuw: de stroming trekt een boot zonder motor er makkelijk naartoe.' },
  { code: 'E.5.2', naam: 'Ligplaats toegestaan tussen de afstanden', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Je mag ligplaats nemen tussen de twee afstanden op het bord, in meters gerekend vanaf het bord. Bij 30-60 dus tussen 30 en 60 meter.' },
  ...[['duw', 4], ['ander', 8], ['alle', 12]].flatMap(([vorm, eerste]) => [0, 1, 2, 3].map((k) => gereserveerd(`E.5.${eerste + k}`, vorm, k))),
  { code: 'E.6.1', naam: 'Spudpalen toegestaan', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Aan de kant van de vaarweg waar dit bord staat, mag je spudpalen gebruiken. Een spudpaal is een paal die een schip in de bodem zet om stil te liggen.' },
  { code: 'E.7.1', naam: 'Meren om een auto aan of van boord te zetten', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Hier mag je meren, maar alleen om meteen een auto aan boord of van boord te zetten.' },
  { code: 'E.8', naam: 'Plaats om te keren', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Hier kunnen schepen keren. Je mag hier geen ligplaats nemen.',
    lelievlet: 'Keert hier een groot schip, dan mag het van jou medewerking vragen: geef het de ruimte.' },
  { code: 'E.13', naam: 'Drinkwater', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Hier kunnen schepen drinkwater innemen.' },
  { code: 'E.14', naam: 'Telefoon', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Hier is een telefoon.' },
  { code: 'E.17', naam: 'Waterskiën toegestaan', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Hier mag je overdag waterskiën. In de boot die trekt, moet een uitkijk van minstens 15 jaar meevaren.',
    lelievlet: 'Let goed op snelle boten met waterskiërs, en zwem hier niet: dat is verboden.' },
  { code: 'E.21', naam: 'Snel varen toegestaan', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Hier mogen snelle motorboten harder varen dan 20 kilometer per uur. Buiten zo’n gebied mag dat niet.',
    lelievlet: 'Pas op voor snelle boten en hun hoge golven, en zwem hier niet: dat is verboden.' },
  { code: 'E.22', naam: 'Trailerhelling', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Dit is een trailerhelling: hier mag je een boot vanaf een trailer te water laten.' },
  { code: 'E.23', naam: 'Marifoonkanaal voor nautische informatie', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Op het marifoonkanaal op het bord hoor je nautische informatie, zoals berichten over het scheepvaartverkeer hier.',
    lelievlet: 'Heb je een marifoon aan boord, dan moet je onderweg uitluisteren; op dit kanaal hoor je wat er hier speelt.' },
  { code: 'E.24', naam: 'Waterscooters toegestaan', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Hier mogen waterscooters varen. Een waterscooter is een snelle motorboot waarop je rijdt als op een scooter, zoals een jetski.' },
  { code: 'E.25', naam: 'Walstroom', kleur: 'blauw', groep: 'Met een teken',
    betekenis: 'Hier is een aansluiting voor walstroom. Een schip dat hier ligt, kan zijn stroom van de wal halen in plaats van een aggregaat te laten draaien.' },
];
