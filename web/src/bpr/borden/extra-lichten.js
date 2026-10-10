// The light signs of BPR bijlage 7 that stand on their own on the bank, not at a bridge, lock or weir
// (those are in seinen.js): B.10, D.3c, E.12a/b, E.12.1 and the lichtpijl F.2b. Drawn after the BPR's own
// drawings (reference/bpr/tekens/bpr_img) as A.11 is in a.js, a black backplate with the lamps of
// kader.js, each with what the viewer needs to list and explain it. See kader.js for the conventions.
import { svg, lamp, ROOD, WIT, ZWART, GROEN, GEEL } from './kader.js';

/** A black backplate `w` x `h` with lamps of radius `r`, each [cx, cy, colour, kind]. */
const kast = (w, h, r, lampen) => svg(w, h,
  `<rect width="${w}" height="${h}" fill="${ZWART}"/>${lampen.map(([cx, cy, kleur, kind]) => lamp(cx, cy, r, kleur, kind)).join('')}`);

// F.2b: a chevron of white light pointing to the haven, beside the lights it goes with: here the BPR's
// second example, red over green (invaren nog verboden, wordt aanstonds toegestaan); plain discs, as drawn
const lichtpijl = svg(600, 600, `<rect width="600" height="600" fill="${ZWART}"/>`
  + `<polyline points="318,101 506,308 318,513" fill="none" stroke="${WIT}" stroke-width="58" stroke-linecap="round"/>`
  + `<circle cx="185" cy="200" r="61" fill="${ROOD}"/><circle cx="185" cy="402" r="61" fill="${GROEN}"/>`);

export default {
  // B.10: two yellow flashing lights one above the other, upright like A.11
  'B.10': { w: 360, h: 600, svg: kast(360, 600, 100, [[180, 143, GEEL, 'flikker'], [180, 458, GEEL, 'flikker']]) },
  // D.3c: a white fixed light beside a white isophase light, landscape 2 : 1
  'D.3c': { w: 640, h: 320, svg: kast(640, 320, 96, [[160, 160, WIT], [480, 160, WIT, 'isofase']]) },
  // E.12a: two white fixed lights side by side; E.12b: two white isophase lights
  'E.12a': { w: 680, h: 320, svg: kast(680, 320, 96, [[170, 160, WIT], [510, 160, WIT]]) },
  'E.12b': { w: 680, h: 320, svg: kast(680, 320, 96, [[170, 160, WIT, 'isofase'], [510, 160, WIT, 'isofase']]) },
  // E.12.1: one yellow flashing light, square
  'E.12.1': { w: 360, h: 360, svg: kast(360, 360, 110, [[180, 180, GEEL, 'flikker']]) },
  'F.2b': { w: 600, h: 600, svg: lichtpijl },
};

const L = { groep: 'Lichten' };

export const EXTRA = [
  { code: 'B.10', naam: 'Koers en snelheid aanpassen voor uitvarende schepen', kleur: 'geel', ...L, cwo: true,
    betekenis: 'Twee gele flikkerlichten boven elkaar: hier komen schepen een haven of zijvaarwater uit. Je moet zo nodig van koers veranderen of langzamer varen om ze de ruimte te geven.',
    lelievlet: 'Dat geldt ook voor een lelievlet: let goed op de uitgang en houd ruimte vrij.' },
  { code: 'D.3c', naam: 'Varen in de richting van het isofase licht', kleur: 'wit', ...L,
    betekenis: 'Een wit vast licht naast een wit isofase licht, dat even lang aan als uit is. Het wordt aanbevolen te varen naar de kant van het isofase licht, bijvoorbeeld bij een sluis met meer kolken naar de kolk die het eerst klaar is.' },
  { code: 'E.12a', naam: 'Voorwaarschuwing: moeilijkheden vooruit', kleur: 'wit', ...L,
    betekenis: 'Twee witte vaste lichten naast elkaar: verderop is het lastig, bijvoorbeeld bij een brug of sluis. Houd stil als de regels daar dat vragen. In Nederland kom je dit teken bijna niet tegen.' },
  { code: 'E.12b', naam: 'Voorwaarschuwing: voorzichtig naderen', kleur: 'wit', ...L,
    betekenis: 'Twee witte isofase lichten die tegelijk aan- en uitgaan: je mag voorzichtig verder varen naar wat er vooruit ligt. In Nederland kom je dit teken bijna niet tegen.' },
  { code: 'E.12.1', naam: 'Waarschuwing voor uitvarende of langsvarende schepen', kleur: 'geel', ...L,
    betekenis: 'Een geel flikkerlicht bij de uitgang van een haven of zijvaarwater: let op schepen die naar buiten komen, of, als je zelf naar buiten vaart, op schepen die langsvaren.',
    lelievlet: 'Vaar je een haven uit, kijk dan eerst goed of er iets aankomt.' },
  { code: 'F.2b', naam: 'Lichtpijl', kleur: 'wit', ...L,
    betekenis: 'Een pijl van wit licht naast rode of groene lichten wijst de haven of het zijvaarwater aan waarvoor die lichten gelden. Rood: in- en uitvaren verboden. Rood boven groen: nog verboden, maar zo meteen toegestaan. Groen: in- en uitvaren toegestaan.' },
];
