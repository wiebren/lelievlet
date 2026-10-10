// Signs of BPR bijlage 7 groups A, B and C that are not asked about in CWO, drawn after the BPR's own
// drawings (reference/bpr/tekens/bpr_img) like the rest. See kader.js for the conventions.
import { verbod, gebod, tekst, WIT, ZWART } from './kader.js';

const f = (v) => +v.toFixed(1);
const punten = (pts) => pts.map(([x, y]) => `${f(x)},${f(y)}`).join(' ');
const vlak = (pts, fill = ZWART) => `<polygon points="${punten(pts)}" fill="${fill}"/>`;

/**
 * An arrowhead with its tip at (x, y) pointing along (ux, uy): `len` long, `wide` wide at its base,
 * the barbs cut off and swept back a little as in the BPR's B arrows (as pijlR in b.js); `shaft` is
 * the width of the shaft it sits on; with `sweep` false the base is straight.
 */
function kop(x, y, ux, uy, len, wide, shaft, sweep = true) {
  const n = Math.hypot(ux, uy); const ax = ux / n; const ay = uy / n;
  const at = (a, b) => [x - ax * a - ay * b, y - ay * a + ax * b];  // a back from the tip, b to the side
  const h = wide / 2; const s = shaft / 2;
  if (!sweep) return vlak([at(0, 0), at(len, h), at(len, -h)]);
  return vlak([at(0, 0), at(len, h), at(len * 1.1, h * 0.95), at(len * 1.03, s), at(len * 1.03, -s), at(len * 1.1, -h * 0.95), at(len, -h)]);
}

/** A centre line through `pts`, its corners rounded off over `r` units either side, as a path. */
function bocht(pts, r) {
  let d = `M${pts[0].join(',')}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [p, q, n] = [pts[i - 1], pts[i], pts[i + 1]];
    const a = Math.hypot(q[0] - p[0], q[1] - p[1]); const b = Math.hypot(n[0] - q[0], n[1] - q[1]);
    d += ` L${f(q[0] + ((p[0] - q[0]) * r) / a)},${f(q[1] + ((p[1] - q[1]) * r) / a)}`
      + ` Q${q[0]},${q[1]} ${f(q[0] + ((n[0] - q[0]) * r) / b)},${f(q[1] + ((n[1] - q[1]) * r) / b)}`;
  }
  return `${d} L${pts[pts.length - 1].join(',')}`;
}

/**
 * The B arrow along the centre line `pts` (tail first, the last point the tip): a shaft 62 wide
 * with rounded bends and the head; `dash` gives the stroke-dasharray of a dashed one.
 */
function looppijl(pts, dash = '') {
  const [p, q] = pts.slice(-2); const len = 134;
  const n = Math.hypot(q[0] - p[0], q[1] - p[1]); const base = [q[0] - ((q[0] - p[0]) * len) / n, q[1] - ((q[1] - p[1]) * len) / n];
  const line = [...pts.slice(0, -1), base];
  return `<path d="${bocht(line, 46)}" fill="none" stroke="${ZWART}" stroke-width="62"${dash ? ` stroke-dasharray="${dash}"` : ''}/>`
    + kop(q[0], q[1], q[0] - p[0], q[1] - p[1], len, 176, 62);
}

/** Mirror a symbol on an upright sign left to right (the b sign of an a sign). */
const spiegel = (symbol, w = 600) => `<g transform="matrix(-1 0 0 1 ${w} 0)">${symbol}</g>`;

/**
 * A vertical convoy arrow (A.3, A.4.1): a shaft from `tail` to the first tip `tip`, and an arrowhead
 * at each of the `tips` (two stacked heads stand for a samenstel).
 */
function konvooi(x, tail, tips, shaft, len, wide, sweep = true) {
  const d = Math.sign(tips[0] - tail);
  return `<rect x="${x - shaft / 2}" y="${Math.min(tail, tips[0] - d * len)}" width="${shaft}" height="${Math.abs(tips[0] - d * len - tail)}" fill="${ZWART}"/>`
    + tips.map((t) => kop(x, t, 0, d, len, wide, shaft, sweep)).join('');
}

/**
 * A thick arrow bent round a centre (cx, cy) at radius r, from angle a0 to a1 (degrees, clockwise
 * on screen when a1 > a0), with a head at a1: its base on the radius, `off` further out, its tip
 * `len` along the arc and turned `turn` degrees inward (A.8).
 */
function boogpijl(cx, cy, r, a0, a1, width, base, len, off = 0, turn = 0) {
  const cw = a1 > a0; const rad = (a) => (a * Math.PI) / 180;
  const pt = (a, rr = r) => [cx + rr * Math.cos(rad(a)), cy + rr * Math.sin(rad(a))];
  const end = a1 + (cw ? 2 : -2);  // run the band a little into the head, so no seam shows
  const [x0, y0] = pt(a0); const [x1, y1] = pt(end);
  const arc = `<path d="M${f(x0)},${f(y0)} A${r},${r} 0 ${Math.abs(end - a0) > 180 ? 1 : 0} ${cw ? 1 : 0} ${f(x1)},${f(y1)}" fill="none" stroke="${ZWART}" stroke-width="${width}"/>`;
  const dir = rad(a1 + (cw ? 90 + turn : -90 - turn));
  const [bx, by] = pt(a1, r + off); const nx = Math.cos(rad(a1)); const ny = Math.sin(rad(a1));
  return arc + vlak([[bx + (nx * base) / 2, by + (ny * base) / 2], [bx + Math.cos(dir) * len, by + Math.sin(dir) * len], [bx - (nx * base) / 2, by - (ny * base) / 2]]);
}

/** Two turning arrows, a large one clockwise round the field and a small one inside it the other way. */
const keren = () => boogpijl(305, 297, 195, 79, 305, 50, 145, 118, 0, 6) + boogpijl(314, 288, 64, 106, -135, 52, 150, 110, 18);

/** Water skier facing left on one ski, the tow line running off to the left. */
const waterskier = () => `<g fill="${ZWART}">`
  + '<circle cx="483" cy="156" r="27"/>'
  + '<rect x="90" y="203" width="192" height="10"/>'
  // neck, arms out to the handle, the torso, the thigh and the shin down to the ski
  + '<path d="M470,180 L492,180 L493,197 L487,292 C484,306 474,318 458,324 L398,336 L362,342 L346,352 L330,385 L306,428 L268,428 L282,396 L296,360 L312,328 C318,316 330,310 344,306 L414,288 L418,227 L326,224 L306,212 L306,201 L470,196 Z"/>'
  + '<path d="M146,374 L156,372 C158,392 166,402 186,408 L416,458 L412,476 L184,424 C160,418 150,402 146,374 Z"/>'
  + '</g>';

/** Fast motorboat planing to the right, the driver leaning into the windscreen, its wake below. */
const speedboot = () => {
  const zog = 'M78,414 C100,428 125,422 150,410 C190,390 230,360 262,340 C292,322 330,316 350,338 C360,350 366,360 372,364 C390,352 410,350 432,357 C460,366 490,378 518,370';
  return `<path d="${zog}" fill="none" stroke="${WIT}" stroke-width="30" stroke-linejoin="round"/>`
    + `<path d="${zog}" fill="none" stroke="${ZWART}" stroke-width="13" stroke-linecap="butt" stroke-linejoin="miter"/>`
    + `<g fill="${ZWART}"><circle cx="308" cy="207" r="16"/>`
    + '<path fill-rule="evenodd" d="M90,362 L255,292 L260,282 L278,233 L292,230 L302,238 L348,242 L366,227 L388,244 L528,210 C527,240 516,262 496,280 C478,298 452,314 420,326 L398,336 L382,340 C372,330 360,318 340,314 C310,308 282,312 264,318 L222,340 L198,358 L174,375 L150,388 L114,400 Z M298,249 L326,250 L296,269 Z"/>'
    + '<polygon points="66,339 100,327 104,339 72,351"/></g>';
};

/** Boat on a trailer standing on a slipway, water at the foot of the slipway. */
const trailerhelling = () => `<g fill="${ZWART}">`
  + '<path d="M132,303 L504,177 C512,182 512,203 502,218 C484,244 452,265 410,286 C370,304 320,318 262,330 C220,337 180,340 147,341 Z"/>'
  + '<polygon points="181,366 500,257 506,274 187,384"/>'
  + '<circle cx="346" cy="342" r="28"/>'
  + '<polygon points="216,420 540,308 540,444 216,444"/>'
  + '</g>'
  + `<path d="M78,424 C90,440 112,442 128,424 C142,410 158,428 170,432 C184,436 196,412 212,422 L222,426" fill="none" stroke="${ZWART}" stroke-width="13"/>`;

/** Water scooter rider kneeling, leaning on the handlebar, spray and a wave under the scooter. */
const waterscooter = () => `<g fill="${ZWART}">`
  + '<circle cx="162" cy="113" r="22"/>'
  // torso, thigh and shin; the arms out to the handlebar, with the gap between them
  + '<path d="M134,146 L178,146 L176,248 L226,270 L238,298 L198,302 L130,270 L126,200 Z"/>'
  + '<path fill-rule="evenodd" d="M174,146 L240,150 L250,172 L236,208 L174,200 Z M182,162 L232,165 L238,176 L230,192 L182,186 Z"/>'
  + `<line x1="240" y1="166" x2="306" y2="234" stroke="${ZWART}" stroke-width="11"/>`
  // the scooter: seat and hood above, the hull below, cut by a thin white line
  + '<path d="M90,392 C82,380 84,358 98,348 C130,330 170,314 198,302 L238,300 L272,281 L316,262 L288,227 L506,226 C514,232 512,250 506,272 C494,306 466,334 420,352 L372,371 L334,386 L312,371 L260,368 L240,371 L222,378 L214,390 L196,401 L180,414 L150,426 L116,438 C100,436 88,424 86,412 Z"/>'
  + '</g>'
  + `<path d="M84,398 C160,378 230,356 300,331 C380,302 450,280 509,231" fill="none" stroke="${WIT}" stroke-width="8"/>`
  + `<path d="M84,477 C124,481 152,470 182,450 C220,422 250,398 280,398 C305,398 320,416 335,430 C350,414 362,410 380,412 C430,418 466,436 503,434" fill="none" stroke="${ZWART}" stroke-width="20" stroke-linejoin="miter"/>`;

/** "VHF", with a channel number below it or not. */
const vhf = (y) => `<g transform="translate(300,0) scale(1.1,1) translate(-300,0)">${tekst(300, y, 'VHF', 175)}</g>`;

// B.3: the own track solid on one side, the oncoming track dashed on the other
const houden = looppijl([[212, 770], [212, 108]])
  + `<path d="M392,108 V626" fill="none" stroke="${ZWART}" stroke-width="62" stroke-dasharray="84 64"/>` + kop(392, 760, 0, 1, 134, 176, 62);
// B.4: both tracks cross the water; the oncoming one dashed, broken where it crosses the own one
const oversteken = looppijl([[438, 780], [438, 542], [210, 379], [210, 140]])
  + looppijl([[438, 132], [438, 379], [210, 542], [210, 780]], '120 60 105 193 72 47 400');
// B.2: one arrow that moves over to the other side of the water
const opzij = looppijl([[444, 770], [444, 506], [210, 350], [210, 108]]);

export default {
  // A.3: as A.2, each arrow with two heads: a samenstel
  'A.3': { w: 600, h: 900, svg: verbod(konvooi(186, 780, [402, 564], 60, 134, 180) + konvooi(426, 480, [100, 262], 60, 134, 180), 600, 900) },
  // A.4.1: as A.4, each arrow with two heads (a newer drawing: a heavier shaft, narrower plain heads)
  'A.4.1': { w: 600, h: 900, svg: verbod(konvooi(204, 144, [754, 550], 72, 104, 122, false) + konvooi(408, 736, [132, 372], 72, 104, 122, false), 600, 900) },
  'A.8': { w: 600, h: 600, svg: verbod(keren()) },
  'A.14': { w: 600, h: 600, svg: verbod(waterskier()) },
  // A.18 in the BPR: the end of a stretch where fast motorboats may go at any speed
  'A.18': { w: 600, h: 600, svg: verbod(speedboot()) },
  'A.19': { w: 600, h: 600, svg: verbod(trailerhelling()) },
  'A.20': { w: 600, h: 600, svg: verbod(waterscooter()) },
  'B.2a': { w: 600, h: 900, svg: gebod(opzij, 600, 900) },
  'B.2b': { w: 600, h: 900, svg: gebod(spiegel(opzij), 600, 900) },
  'B.3a': { w: 600, h: 900, svg: gebod(houden, 600, 900) },
  'B.3b': { w: 600, h: 900, svg: gebod(spiegel(houden), 600, 900) },
  'B.4a': { w: 600, h: 900, svg: gebod(oversteken, 600, 900) },
  'B.4b': { w: 600, h: 900, svg: gebod(spiegel(oversteken), 600, 900) },
  // B.7: a black disc
  'B.7': { w: 600, h: 600, svg: gebod(`<circle cx="300" cy="300" r="155" fill="${ZWART}"/>`) },
  'B.11a': { w: 600, h: 600, svg: gebod(vhf(297)) },
  // B.11b: with the channel; the BPR's example is 11
  'B.11b': { w: 600, h: 600, svg: gebod(vhf(188) + tekst(300, 393, '11', 175)) },
  // C.4: the border alone; what is restricted goes on a plate below
  'C.4': { w: 600, h: 600, svg: gebod('') },
};

const B = { kleur: 'rood', groep: 'Rode rand' };
const A = { kleur: 'rood', groep: 'Doorgestreept' };

export const EXTRA = [
  { code: 'A.3', naam: 'Voorbijlopen verboden voor samenstellen', ...A,
    betekenis: 'Samenstellen, zoals slepen en duwstellen, mogen elkaar hier niet inhalen. Dat mag wel als een van beide een duwstel is van hoogstens 110 bij 12 meter.',
    lelievlet: 'Een lelievlet is geen samenstel: dit verbod geldt niet voor jou, maar inhalen mag alleen als het veilig kan.' },
  { code: 'A.4.1', naam: 'Ontmoeten en voorbijlopen verboden voor samenstellen', ...A,
    betekenis: 'Samenstellen mogen elkaar hier niet ontmoeten en niet inhalen, want daarvoor is het vaarwater te smal. Dat mag wel als een van beide een duwstel is van hoogstens 110 bij 12 meter.',
    lelievlet: 'Het vak is wel een engte: ook met een lelievlet mag je hier niet inhalen.' },
  { code: 'A.8', naam: 'Verboden te keren', ...A,
    betekenis: 'Hier mag je niet keren: je mag niet omdraaien om de andere kant op te varen.',
    lelievlet: 'Het verbod geldt voor elk schip, dus ook voor een lelievlet, die makkelijk kan draaien.' },
  { code: 'A.14', naam: 'Verboden te waterskiën', ...A,
    betekenis: 'Hier mag je niet waterskiën en je ook niet op een soortgelijke manier achter een boot laten trekken. Waterskiën mag alleen overdag op plekken die daarvoor zijn aangewezen.' },
  { code: 'A.18', naam: 'Einde snelvaren zonder snelheidsbeperking', ...A,
    betekenis: 'Hier eindigt het deel van de vaarweg waar snelle motorboten zo hard mogen varen als ze willen. Vanaf hier mogen ze niet sneller dan 20 km per uur, tenzij er een andere grens geldt.' },
  { code: 'A.19', naam: 'Verboden te water te laten of eruit te halen', ...A,
    betekenis: 'Hier mag je geen boot te water laten en ook geen boot uit het water halen, bijvoorbeeld met een trailer.',
    lelievlet: 'Wil je een lelievlet van de trailer te water laten, zoek dan een helling met het blauwe bord E.22.' },
  { code: 'A.20', naam: 'Verboden voor waterscooters', ...A,
    betekenis: 'Waterscooters (jetski’s) mogen hier niet varen.' },
  { code: 'B.2a', naam: 'Naar de bakboordszijde gaan', ...B,
    betekenis: 'Je moet hier naar de bakboordszijde van het vaarwater varen: de linkerkant, gezien in je vaarrichting.' },
  { code: 'B.2b', naam: 'Naar de stuurboordszijde gaan', ...B,
    betekenis: 'Je moet hier naar de stuurboordszijde van het vaarwater varen: de rechterkant, gezien in je vaarrichting.' },
  { code: 'B.3a', naam: 'Bakboordszijde houden', ...B,
    betekenis: 'Je moet hier aan de bakboordszijde van het vaarwater varen, dus links, en daar blijven. De gestreepte pijl is de weg van tegenliggers.' },
  { code: 'B.3b', naam: 'Stuurboordszijde houden', ...B,
    betekenis: 'Je moet hier aan de stuurboordszijde van het vaarwater varen, dus rechts, en daar blijven. De gestreepte pijl is de weg van tegenliggers.' },
  { code: 'B.4a', naam: 'Oversteken naar bakboord', ...B,
    betekenis: 'Je moet hier het vaarwater oversteken naar de bakboordszijde, de linkerkant. Tegenliggers steken op dezelfde plek over.' },
  { code: 'B.4b', naam: 'Oversteken naar stuurboord', ...B,
    betekenis: 'Je moet hier het vaarwater oversteken naar de stuurboordszijde, de rechterkant. Tegenliggers steken op dezelfde plek over.' },
  { code: 'B.7', naam: 'Geluidssein geven', ...B,
    betekenis: 'Je moet hier een geluidssein geven. Het bord wordt bijna niet meer gebruikt: tegenwoordig gaat zoiets meestal via de marifoon.' },
  { code: 'B.11a', naam: 'Marifoon gebruiken', ...B,
    betekenis: 'Je moet hier de marifoon gebruiken zoals de regels voorschrijven, of je melden op het aangegeven kanaal.' },
  { code: 'B.11b', naam: 'Marifoon gebruiken op dit kanaal', ...B,
    betekenis: 'Je moet hier de marifoon gebruiken op het kanaal dat op het bord staat, hier kanaal 11, of je op dat kanaal melden.' },
  { code: 'C.4', naam: 'Vaartbeperkingen, vraag inlichtingen', ...B,
    betekenis: 'Hier gelden beperkingen voor de scheepvaart; vraag om meer informatie. Op een bord eronder staat wat de beperking is of waar je informatie krijgt.' },
];
