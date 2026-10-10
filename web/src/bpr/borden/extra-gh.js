// Signs of BPR bijlage 7 that are not asked about in CWO: the over-/onderhoogte plates, the dieptebord,
// the kilometer and hectometer boards and the wegwijzers and name boards of H.2. Drawn after the BPR's
// own drawings (reference/bpr/tekens/bpr_img); see kader.js for the conventions.
//
// The H.2 boards have the BPR's example names on them; their sizes follow the drawings, the longer
// side 900 units. Text is set in the house sans and spaced out to the width the BPR gives it.
import { svg, tekst, pijl, ROOD, WIT, ZWART, BLAUW, GROEN, GEEL } from './kader.js';

const ORANJE = '#f39a12';   // the omleiding board as the BPR prints it (neither the BPR nor the RST gives a RAL)

/** A line of text with its capitals centred on y; `anchor` 'start' sets it from x, `spacing` spaces it out. */
const regel = (x, y, text, size, fill, spacing = 0, anchor = 'start') =>
  tekst(x, y, text, size, fill).replace('text-anchor="middle"', `text-anchor="${anchor}" letter-spacing="${spacing}"`);

/** A field from x0 to the point at x1, between y0 and y1: square at the left, a 90° point at the right. */
function puntveld(x0, y0, x1, y1, fill) {
  const half = (y1 - y0) / 2;
  return `<polygon points="${x0},${y0} ${x1 - half},${y0} ${x1},${y0 + half} ${x1 - half},${y1} ${x0},${y1}" fill="${fill}"/>`;
}

// ---- G.5.1c: over- and onderhoogte, two yellow plates pointing down at the spot -----------------

/** One plate (420 wide, 456 high) at y: yellow, a black field that points down, the figure on top. */
function hoogteplaat(y, text) {
  return `<polygon points="0,${y} 420,${y} 420,${y + 246} 210,${y + 456} 0,${y + 246}" fill="${GEEL}"/>`
    + `<polygon points="28,${y + 176} 392,${y + 176} 392,${y + 228} 210,${y + 410} 28,${y + 228}" fill="${ZWART}"/>`
    + regel(210, y + 80, text, 118, ZWART, 4, 'middle');
}

// ---- G.5.3: the dieptebord, the hoogtebord (G.5.2) the other way up ------------------------------

const dieptebord = () => svg(600, 600, `<rect width="600" height="600" fill="${GEEL}"/><rect x="42" y="42" width="516" height="516" fill="${ZWART}"/>`
  + regel(300, 184, '2,40', 215, GEEL, 6, 'middle') + `<polygon points="153,540 447,540 300,398" fill="${GEEL}"/>`);

// ---- H.1: kilometrering, white boards with a thin black edge ---------------------------------

const kmBord = (w, h, text, y, size) => svg(w, h,
  `<rect x="7" y="7" width="${w - 14}" height="${h - 14}" fill="${WIT}" stroke="${ZWART}" stroke-width="14"/>${tekst(w / 2, y, text, size)}`);

// ---- H.2: bewegwijzering ---------------------------------------------------------------------

/** A green board 940 x 600 with a thin white keyline just inside its edge. */
const groenBord = (body) => svg(940, 600, `<rect width="940" height="600" fill="${GROEN}"/>`
  + `<rect x="8" y="8" width="924" height="584" fill="none" stroke="${WIT}" stroke-width="8"/>${body}`);

const ARM = 24;   // the arms and arrows on the green boards
const KOP = 70;

/** H.2.1a: ahead to Tilburg and Eindhoven, right to Breda; Oosterhout to the left, the red bar where you are. */
const vooraanduidingHoofd = () => groenBord(
  regel(522, 62, 'Tilburg', 66, WIT, 5.5) + regel(522, 145, 'Eindhoven', 66, WIT, 4.5)
  + regel(45, 248, 'Oosterhout', 66, WIT, 5.5) + regel(594, 494, 'Breda', 66, WIT, 5.5)
  + pijl(561, 414, 561, 206, ARM, KOP, WIT) + `<rect x="${431 - ARM / 2}" y="330" width="${ARM}" height="224" fill="${WIT}"/>`
  + pijl(431 - ARM / 2, 402, 768, 402, ARM, KOP, WIT) + `<rect x="402" y="307" width="59" height="33" fill="${ROOD}"/>`);

/** H.2.2a: ahead to ’s-Hertogenbosch, right to the Rietveldhaven on its white plate. */
const vooraanduidingSpecifiek = () => groenBord(
  regel(150, 129, '’s-Hertogenbosch', 66, WIT, 5.5)
  + pijl(187, 531, 187, 188, ARM, KOP, WIT) + pijl(187, 383, 390, 383, ARM, KOP, WIT)
  + `<rect x="248" y="430" width="559" height="91" fill="${WIT}"/>${regel(260, 470, 'Rietveldhaven', 64, ZWART, 7.5)}`);

export default {
  'G.5.1c': { w: 420, h: 998, svg: svg(420, 998, hoogteplaat(0, '+0,40') + hoogteplaat(542, '-0,25')) },
  'G.5.3': { w: 600, h: 600, svg: dieptebord() },

  'H.1a': { w: 800, h: 600, svg: kmBord(800, 600, '20', 300, 476) },
  'H.1b': { w: 525, h: 900, svg: kmBord(525, 900, '4', 300, 582) },

  'H.2.1a': { w: 940, h: 600, svg: vooraanduidingHoofd() },
  // white board with a thin green edge, the green pointed field inside
  'H.2.1b': { w: 900, h: 214, svg: svg(900, 214, `<rect x="2.5" y="2.5" width="895" height="209" fill="${WIT}" stroke="${GROEN}" stroke-width="5"/>`
    + puntveld(23, 23, 873, 191, GROEN) + regel(56, 104, 'Eindhoven', 130, WIT, 4.5)) },
  'H.2.2a': { w: 940, h: 600, svg: vooraanduidingSpecifiek() },
  // black board, the white pointed field inside
  'H.2.2b': { w: 900, h: 155, svg: svg(900, 155, `<rect width="900" height="155" fill="${ZWART}"/>`
    + puntveld(11, 11, 881, 144, WIT) + regel(39, 76, 'Rietveldhaven', 91, ZWART, 11.5)) },
  // a white rim with a thin black edge, the black board, the orange pointed field inside
  'H.2.3': { w: 900, h: 210, svg: svg(900, 210, `<rect x="2.5" y="2.5" width="895" height="205" fill="${WIT}" stroke="${ZWART}" stroke-width="5"/>`
    + `<rect x="12" y="12" width="876" height="186" fill="${ZWART}"/>` + puntveld(26, 30, 864, 180, ORANJE) + regel(63, 102, 'Amsterdam', 109, ZWART, 12.5)) },
  // white board, a thin blue edge, blue letters
  'H.2.4': { w: 900, h: 110, svg: svg(900, 110, `<rect x="2.5" y="2.5" width="895" height="105" fill="${WIT}" stroke="${BLAUW}" stroke-width="5"/>`
    + regel(450, 54, 'Beneden-Merwede', 79, BLAUW, 6.5, 'middle')) },
};

export const EXTRA = [
  { code: 'G.5.1c', naam: 'Overhoogte of onderhoogte', kleur: 'geel', groep: '',
    betekenis: 'Op dit punt van de brug is er meer (+) of minder (−) doorvaarthoogte dan de hoogteschaal aanwijst. Het getal is het verschil in meters.',
    lelievlet: 'Tel het getal op bij de hoogteschaal of trek het ervan af, en vergelijk dat met de hoogte van je mast.' },
  { code: 'G.5.3', naam: 'Dieptebord', kleur: 'geel', groep: '',
    betekenis: 'Een dieptebord geeft de beschikbare waterdiepte in meters. De driehoek wijst omhoog; bij een hoogtebord wijst hij omlaag.',
    lelievlet: 'Let op je zwaard en je roer: die steken dieper dan de romp.' },
  { code: 'H.1a', naam: 'Kilometeraanduiding', kleur: 'wit', groep: 'Kilometers',
    betekenis: 'Een kilometerbord langs de oever geeft aan bij welke kilometer van de vaarweg je bent. De telling loopt van de bron naar zee, of op een kanaal van hoog naar laag.',
    lelievlet: 'Met de kilometerborden en een vaarkaart zie je precies waar je bent en hoe ver je nog moet.' },
  { code: 'H.1b', naam: 'Hectometeraanduiding', kleur: 'wit', groep: 'Kilometers',
    betekenis: 'Tussen de kilometerborden staat om de 100 meter een hectometerbord. Het getal telt de hectometers na het laatste kilometerbord.',
    lelievlet: 'Kijk hoe lang je over 100 meter doet, dan weet je hoe snel je vaart.' },
  { code: 'H.2.1a', naam: 'Vooraanduiding hoofddoelen', kleur: 'groen', groep: '',
    betekenis: 'Dit groene bord staat vóór een splitsing van vaarwegen. Het laat zien welke kant je op moet naar een plaats of vaarweg.' },
  { code: 'H.2.1b', naam: 'Beslissingsaanduiding hoofddoelen', kleur: 'groen', groep: '',
    betekenis: 'Dit groene bord staat bij een splitsing. De punt wijst de richting naar de plaats of vaarweg die erop staat.' },
  { code: 'H.2.2a', naam: 'Vooraanduiding specifieke doelen', kleur: 'groen', groep: '',
    betekenis: 'Dit bord staat vóór een splitsing. Op het witte vlak staat een speciaal doel, zoals een haven, losplaats of jachthaven.' },
  { code: 'H.2.2b', naam: 'Beslissingsaanduiding specifieke doelen', kleur: 'wit', groep: 'Wegwijzers',
    betekenis: 'Dit witte bord staat bij een splitsing. De punt wijst de richting naar een haven, losplaats, jachthaven of ander speciaal doel.',
    lelievlet: 'Zo vind je de jachthaven waar je wilt aanleggen.' },
  { code: 'H.2.3', naam: 'Aanduiding omleiding', kleur: 'geel', groep: '',
    betekenis: 'Een oranje bord met zwarte letters wijst de route van een tijdelijke omleiding, bijvoorbeeld als een vaarweg dicht is.' },
  { code: 'H.2.4', naam: 'Naam van vaarwater of object', kleur: 'wit', groep: 'Wegwijzers',
    betekenis: 'Een wit bord met blauwe letters geeft de naam van een vaarwater of van een haven, brug of sluis.' },
];
