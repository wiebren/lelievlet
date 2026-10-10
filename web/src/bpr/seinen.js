import * as THREE from 'three';
import { BORDEN } from './borden/index.js';
import { SCENE } from './borden/fgh.js';
import { ROOD, GROEN, GEEL } from './borden/kader.js';
import { makeLamp } from './betonning.js';
import { makeBoard, makeSign } from './tekens.js';
import { CONFIGS, makeShip } from './schepen.js';
import { character } from './lichtkarakter.js';

// Seinen: the lights (and boards) at bridges, weirs, locks and spuisluizen, BPR bijlage 7 G and H. Not
// one sign each but the states of one installation: a bridge in operation shows one red, red and yellow,
// red over green... Each state is listed on its own, with what it means (BPR art. 6.25 to 6.28a, the
// notes to G, G.1 and H.3), a picture after the BPR's own scenes (borden/fgh.js), and a model: the
// bridge, weir, lock or spuisluis seen from the water, its lamps lit as in that state. CWO unless cwo: false.

// lamps: top down, the same on both sides of the opening; 'flikker' flashes. geel: lamps over the opening.
// borden: the sign over (or, A.10 and D.2, either side of) the opening of a fixed bridge; licht: shown as
// the lights the BPR allows in its place (bijlage 7 G: A.1 red, D.1 yellow fixed lights).
const SEINEN_LIJST = [
  ['Beweegbare brug in bedrijf', 'G.2a', [
    { id: 'brug-rood', naam: 'Eén rood licht', bouw: 'brug', lampen: [['rood']],
      betekenis: 'Doorvaren is verboden. De brug wordt wel bediend.',
      lelievlet: 'Verminder vaart en houd stil vóór de brug, bij het bord B.5 als dat er staat.' },
    { id: 'brug-rood-geel', naam: 'Eén rood en één geel licht', bouw: 'brug', lampen: [['rood']], geel: 1,
      betekenis: 'Doorvaren is verboden, behalve voor schepen die onder de gesloten brug door passen. Er kan verkeer van de andere kant komen.',
      lelievlet: 'Met de mast gestreken past een lelievlet vaak onder een gesloten brug: kijk eerst of je echt laag genoeg bent.' },
    { id: 'brug-rood-2geel', naam: 'Eén rood en twee gele lichten', bouw: 'brug', lampen: [['rood']], geel: 2,
      betekenis: 'Doorvaren is verboden, behalve voor schepen die onder de gesloten brug door passen. Van de andere kant mag niemand komen.' },
    { id: 'brug-rood-groen', naam: 'Rood boven groen', bouw: 'brug', lampen: [['rood'], ['groen']], code: 'A.11',
      betekenis: 'Doorvaren is nog verboden, maar dat wordt zo meteen toegestaan.' },
    { id: 'brug-groen', naam: 'Eén groen licht', bouw: 'ophaal', lampen: [['groen']], code: 'E.1',
      betekenis: 'Doorvaren is toegestaan.' },
    { id: 'brug-rood-groenflikker', naam: 'Rood boven groen flikkerlicht', bouw: 'ophaal', lampen: [['rood'], ['groen', 'flikker']], code: 'A.11.1',
      betekenis: 'Doorvaren is verboden, tenzij je al zo dicht bij de brug bent dat je redelijkerwijs niet meer kunt stilhouden.' },
  ]],
  ['Beweegbare brug buiten bedrijf', 'G.2b', [
    { id: 'brug-2rood', naam: 'Twee rode lichten boven elkaar', bouw: 'brug', lampen: [['rood'], ['rood']],
      betekenis: 'Doorvaren is verboden. De brug wordt niet bediend, dus hij gaat ook niet open.' },
    { id: 'brug-2rood-geel', naam: 'Twee rode en één geel licht', bouw: 'brug', lampen: [['rood'], ['rood']], geel: 1,
      betekenis: 'De brug wordt niet bediend, maar onder de gesloten brug door mag als je schip laag genoeg is. Er kan verkeer van de andere kant komen.' },
    { id: 'brug-2rood-2geel', naam: 'Twee rode en twee gele lichten', bouw: 'brug', lampen: [['rood'], ['rood']], geel: 2,
      betekenis: 'De brug wordt niet bediend, maar onder de gesloten brug door mag als je schip laag genoeg is. Van de andere kant mag niemand komen.' },
    { id: 'brug-2groen', naam: 'Twee groene lichten boven elkaar', bouw: 'ophaal', lampen: [['groen'], ['groen']],
      betekenis: 'Doorvaren is in beide richtingen toegestaan. De brug staat open en wordt niet bediend.' },
  ]],
  ['Sluis in bedrijf', 'G.4.1a', [
    { id: 'sluis-rood', naam: 'Eén rood licht', bouw: 'sluis', lampen: [['rood']],
      betekenis: 'Invaren is verboden. De sluis wordt wel bediend. Bij het uitvaren betekent één rood licht: nog niet uitvaren.' },
    { id: 'sluis-rood-groen', naam: 'Rood boven groen', bouw: 'sluis', lampen: [['rood'], ['groen']], code: 'A.11',
      betekenis: 'Invaren is nog verboden, maar dat wordt zo meteen toegestaan.' },
    { id: 'sluis-groen', naam: 'Eén groen licht', bouw: 'sluis', lampen: [['groen']], open: true, code: 'E.1',
      betekenis: 'Invaren is toegestaan. Bij het uitvaren betekent één groen licht: je mag de sluis uit.' },
  ]],
  ['Sluis buiten bedrijf', 'G.4.1b', [
    { id: 'sluis-2rood', naam: 'Twee rode lichten boven elkaar', bouw: 'sluis', lampen: [['rood'], ['rood']],
      betekenis: 'Invaren is verboden. De sluis wordt niet bediend.' },
    { id: 'sluis-2groen', naam: 'Twee groene lichten boven elkaar', bouw: 'sluis', lampen: [['groen'], ['groen']], open: true,
      betekenis: 'Invaren is toegestaan. De sluis staat aan beide kanten open en wordt niet bediend: je kunt er zo doorheen.' },
  ]],
  ['Sluis met beweegbare brug', 'G.4.2', [
    { id: 'sluisbrug-rood-groen', naam: 'Rood boven groen', bouw: 'sluisbrug', lampen: [['rood'], ['groen']],
      betekenis: 'Invaren in de sluis is nog verboden, maar dat wordt zo meteen toegestaan.' },
    { id: 'sluisbrug-groen-2geel', naam: 'Groen en twee gele lichten', bouw: 'sluisbrug', lampen: [['groen']], geel: 2, open: true,
      betekenis: 'Je mag de sluis in- of uitvaren en onder de gesloten brug door, als je schip laag genoeg is.' },
    { id: 'sluisbrug-groen-open', naam: 'Eén groen licht, brug open', bouw: 'sluisophaal', lampen: [['groen']], open: true,
      betekenis: 'Je mag de sluis in- of uitvaren en door de geopende brug.' },
  ]],
  ['Vaste brug', 'G.1', [
    { id: 'vast-a10', naam: 'Rood-witte ruiten', bouw: 'vast', borden: 'A.10', code: 'G.1a',
      betekenis: 'Je mag alleen tussen de twee rood-witte ruiten door varen; daarbuiten is varen verboden. De rode helften wijzen naar buiten.' },
    { id: 'vast-d2', naam: 'Groen-witte ruiten', bouw: 'vast', borden: 'D.2', code: 'G.1a',
      betekenis: 'Je vaart het best tussen de twee groen-witte ruiten door. De groene helften wijzen naar de doorvaart.' },
    { id: 'vast-a1', naam: 'Rood-wit-rood bord', bouw: 'vast', borden: 'A.1', code: 'G.1b',
      betekenis: 'Door deze opening varen is verboden. Een opening zonder tekens mag je op eigen risico gebruiken.' },
    { id: 'vast-d1a', naam: 'Eén gele ruit', bouw: 'vast', borden: 'D.1a', code: 'G.1b',
      betekenis: 'Aanbevolen doorvaartopening. Er kan verkeer van de andere kant komen.' },
    { id: 'vast-d1b', naam: 'Twee gele ruiten', bouw: 'vast', borden: 'D.1b', code: 'G.1b',
      betekenis: 'Aanbevolen doorvaartopening, alleen in jouw richting: van de andere kant mag hier niemand door.' },
    { id: 'vast-a1-licht', naam: 'Rood licht', bouw: 'vast', borden: 'A.1', licht: true, code: 'G.1b',
      betekenis: 'Door deze opening varen is verboden. Een of twee rode lichten boven de opening zeggen hetzelfde als het rood-wit-rode bord (A.1).' },
    { id: 'vast-d1a-licht', naam: 'Eén geel licht', bouw: 'vast', borden: 'D.1a', licht: true, code: 'G.1b',
      betekenis: 'Aanbevolen doorvaartopening; er kan verkeer van de andere kant komen. Het gele licht zegt hetzelfde als de gele ruit (D.1a).' },
    { id: 'vast-d1b-licht', naam: 'Twee gele lichten', bouw: 'vast', borden: 'D.1b', licht: true, code: 'G.1b',
      betekenis: 'Aanbevolen doorvaartopening, alleen in jouw richting: van de andere kant mag hier niemand door. De twee gele lichten zeggen hetzelfde als de twee gele ruiten (D.1b).' },
    { id: 'vast-orientatie', naam: 'Oriëntatielicht', bouw: 'vast', borden: 'D.1a', licht: true, code: 'D.1', cwo: false,
      betekenis: 'Een vaste brug met maar één doorvaartopening kan midden boven die opening een geel licht hebben. Het laat vooral ’s nachts zien waar je onder de brug door moet.' },
  ]],
  ['Stuw', 'G.3', [
    { id: 'stuw-2rood', naam: 'Twee rode lichten boven elkaar', bouw: 'stuw', lampen: [['rood'], ['rood']], cwo: false,
      betekenis: 'De stuw is gesloten: doorvaren is verboden.',
      lelievlet: 'Blijf ruim weg van een stuw: de stroming kan een boot zonder motor ernaartoe trekken.' },
    { id: 'stuw-rood', naam: 'Eén rood licht', bouw: 'stuw', lampen: [['rood']], cwo: false,
      betekenis: 'Doorvaren is verboden.' },
    { id: 'stuw-groen', naam: 'Eén groen licht', bouw: 'stuw', lampen: [['groen']], open: true, code: 'E.1', cwo: false,
      betekenis: 'Doorvaren is toegestaan. Door een stuw mag je alleen varen waar aan beide kanten van de opening groen licht brandt.' },
    { id: 'stuwbrug-a1', naam: 'Rood-wit-rood bord', bouw: 'stuwbrug', borden: 'A.1', cwo: false,
      betekenis: 'Over de stuw ligt een brug. Door deze opening varen is verboden.' },
    { id: 'stuwbrug-d1a', naam: 'Eén gele ruit', bouw: 'stuwbrug', borden: 'D.1a', cwo: false,
      betekenis: 'Over de stuw ligt een brug. Dit is de aanbevolen doorvaartopening; er kan verkeer van de andere kant komen.' },
    { id: 'stuwbrug-d1b', naam: 'Twee gele ruiten', bouw: 'stuwbrug', borden: 'D.1b', cwo: false,
      betekenis: 'Over de stuw ligt een brug. Dit is de aanbevolen doorvaartopening, alleen in jouw richting: van de andere kant mag hier niemand door.' },
  ]],
  ['Spuien en inlaten', 'H.3', [
    { id: 'spui-spuien', naam: 'Spuien', bouw: 'spui', driehoek: 'op', vlag: 'spuien', code: 'H.3a',
      betekenis: 'Er wordt water gespuid: drie rode lichten in een driehoek met de punt omhoog, of overdag de vlag ‘spuien’. Reken op stroming.' },
    { id: 'spui-inlaten', naam: 'Inlaten', bouw: 'spui', driehoek: 'neer', vlag: 'inlaten', code: 'H.3b',
      betekenis: 'Er wordt water ingelaten: drie rode lichten in een driehoek met de punt omlaag, of overdag de wimpel ‘inlaten’. Het water stroomt naar de inlaat toe.' },
    { id: 'spui-straks', naam: 'Zo meteen spuien of inlaten', bouw: 'spui', driehoek: 'rij', vlag: 'spuien', code: 'H.3c',
      betekenis: 'Drie rode lichten naast elkaar: er wordt zo meteen gespuid of ingelaten. Overdag kan ook alleen de vlag of de wimpel hangen.' },
  ]],
];

export const SEINEN = SEINEN_LIJST.flatMap(([groep, groepCode, list]) => list.map((s) => ({ ...s, groep, code: s.code ?? groepCode })));

// ---------------------------------------------------------------- the picture, after the BPR's scene
const KLEUR = { rood: ROOD, groen: GROEN, geel: GEEL };
const asLights = (lampen) => lampen.map(([k, kind]) => [KLEUR[k], kind]);

/** The SVG of one state: the BPR's little scene of it, on its own. */
export function seinPlaatje(sein) {
  const { tafereel, brug, ophaalbrug, sluis, sluisBrug, sluisOphaal, vasteBrug, stuw, stuwBrug, licht, a10, d2, d1, a1 } = SCENE;
  const one = (scene) => tafereel([[scene]], 600).svg;
  // over the opening: the boards, or the lights in their place
  const boven = sein.licht
    ? { 'A.1': licht(240, 46, 18, ROOD), 'D.1a': licht(240, 48, 18, GEEL), 'D.1b': licht(219, 48, 18, GEEL) + licht(262, 48, 18, GEEL) }
    : { 'A.1': a1(240, 46, 66, 46), 'D.1a': d1(240, 48, 21), 'D.1b': d1(219, 48, 21) + d1(262, 48, 21) };
  switch (sein.bouw) {
    case 'brug': return one(brug(asLights(sein.lampen), sein.geel ?? 0));
    case 'ophaal': return one(ophaalbrug(asLights(sein.lampen)));
    case 'sluis': return one(sluis(sein.lampen.map(([k]) => KLEUR[k])));
    case 'sluisbrug': return one(sluisBrug(sein.lampen.map(([k]) => KLEUR[k]), sein.geel ?? 0));
    case 'sluisophaal': return one(sluisOphaal());
    case 'vast': return one(vasteBrug({
      'A.10': a10(92, 46, 22, true) + a10(393, 46, 22, false), 'D.2': d2(92, 46, 22, false) + d2(393, 46, 22, true), ...boven,
    }[sein.borden], { gevel: !sein.borden.startsWith('D.1'), bodem: sein.borden.startsWith('A') }));
    case 'stuw': return one(stuw(sein.lampen.map(([k]) => KLEUR[k]), sein.open ? 72 : 44));
    case 'stuwbrug': return one(stuwBrug({ 'A.1': a1(286, 52, 92, 64), 'D.1a': d1(288, 52, 30), 'D.1b': d1(248, 57, 30) + d1(327, 57, 30) }[sein.borden]));
    default: return BORDEN[sein.code]?.svg ?? '';
  }
}

// ---------------------------------------------------------------- the model
// Its own frame: the water at y = 0, the opening 7 m wide centred on x = 0, the side the boat comes
// from towards +z. The canal runs back along -z between two banks.
const OPENING = 7;
const LENS = 1.2;                  // how brightly a signal lens burns: its colour kept, not burnt out
const HALF = OPENING / 2;
const BANK = { top: 1.0, front: 3, back: -16, width: 9.5 };
const mat = (color, roughness = 0.85) => new THREE.MeshStandardMaterial({ color, roughness });
const M = { beton: mat(0x9a9d9f), dek: mat(0x7b7f82), gras: mat(0x6f8f4e, 1), hout: mat(0x6b4a2b), kast: mat(0x1c1c1c, 0.6), wit: mat(0xe9e9e4, 0.7), donker: mat(0x1d2a33, 1) };
const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); return b; };

/** The two banks of the canal, `half` out from its middle, concrete faced, grass on top. */
function banks(g, half = HALF, front = BANK.front, back = BANK.back) {
  for (const s of [-1, 1]) {
    const x = s * (half + BANK.width / 2); const depth = front - back; const z = (front + back) / 2;
    g.add(box(BANK.width, BANK.top + 1.2, depth, M.beton, x, (BANK.top - 1.2) / 2, z));
    g.add(box(BANK.width - 0.4, 0.06, depth - 0.4, M.gras, x + s * 0.2, BANK.top + 0.03, z - 0.2));
  }
}

/** A black housing with lamps one over the other, the top one at `y`; returns the lamps with their character. */
function head(g, x, y, z, lampen, lamps) {
  const step = 0.42;
  g.add(box(0.42, step * lampen.length + 0.08, 0.22, M.kast, x, y - (step * (lampen.length - 1)) / 2, z));
  lampen.forEach(([kleur, kind], i) => {
    const lamp = makeLamp(kleur, 2.4, LENS, { day: true }); lamp.position.set(x, y - i * step, z + 0.14); g.add(lamp);
    lamps.push({ lamp, lit: kind === 'flikker' ? character('Q') : () => true });
  });
}

/** Yellow lamps under the middle of a span whose underside is at `y`, at its front `z`. */
function yellows(g, n, y, z, lamps) {
  const xs = n === 2 ? [-0.35, 0.35] : n === 1 ? [0] : [];
  for (const x of xs) { const lamp = makeLamp('geel', 2.2, LENS, { day: true }); lamp.position.set(x, y - 0.16, z + 0.05); g.add(lamp); lamps.push({ lamp, lit: () => true }); }
}

/** A bascule bridge over the opening at `z`: fixed ends on the banks, the leaf down or standing open. */
function bascule(g, z, open, under = 2.3) {
  const deep = 2.4; const thick = 0.4;
  for (const s of [-1, 1]) {
    g.add(box(1.1, under - BANK.top, deep - 0.4, M.beton, s * (HALF + 0.55), (under + BANK.top) / 2, z));      // abutment
    g.add(box(2.4, thick, deep, M.dek, s * (HALF + 1.2), under + thick / 2, z));                               // fixed end
  }
  const pivot = new THREE.Group(); pivot.position.set(-HALF, under + thick / 2, z);
  pivot.add(box(OPENING, thick, deep, M.wit, OPENING / 2, 0, 0));
  pivot.add(box(OPENING, 0.5, 0.05, M.wit, OPENING / 2, 0.45, deep / 2 - 0.05), box(OPENING, 0.5, 0.05, M.wit, OPENING / 2, 0.45, -deep / 2 + 0.05));   // its railings
  pivot.rotation.z = open ? 1.32 : 0;
  g.add(pivot);
  return { front: z + deep / 2, under };
}

/** Mitre gates across the opening at `z`, shut in a shallow V or swung back against the walls. */
function gates(g, z, open) {
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group(); pivot.position.set(s * HALF, 0, z);
    pivot.add(box(HALF + 0.15, 2.5, 0.3, M.hout, -s * (HALF + 0.15) / 2, 0.05, 0));
    pivot.rotation.y = open ? s * Math.PI / 2 : -s * 0.18;
    g.add(pivot);
  }
}

/** A flag or pennant with its word, on a pole on the bank. */
function flag(g, word, x, z) {
  g.add(box(0.07, 4.2, 0.07, M.wit, x, BANK.top + 2.1, z));
  const c = Object.assign(document.createElement('canvas'), { width: 256, height: 160 });
  const ctx = c.getContext('2d'); ctx.fillStyle = '#0e4c96';
  if (word === 'inlaten') { ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(256, 80); ctx.lineTo(0, 160); ctx.fill(); }
  else ctx.fillRect(0, 0, 256, 160);
  ctx.fillStyle = '#fff'; ctx.font = `700 ${word === 'inlaten' ? 34 : 46}px system-ui, sans-serif`; ctx.textBaseline = 'middle';
  ctx.fillText(word, word === 'inlaten' ? 18 : 30, 82);
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.875), new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, alphaTest: 0.5, transparent: true }));
  cloth.position.set(x + 0.74, BANK.top + 3.7, z);
  if (word === 'inlaten') {                                       // only the triangle of a pennant
    const a = Object.assign(document.createElement('canvas'), { width: 256, height: 160 }); const actx = a.getContext('2d');
    actx.fillStyle = '#fff'; actx.beginPath(); actx.moveTo(0, 0); actx.lineTo(256, 80); actx.lineTo(0, 160); actx.fill();
    cloth.material.alphaMap = new THREE.CanvasTexture(a);
  }
  g.add(cloth);
}

/** One state as a model: what is built, and which lamps burn. userData.update(t, night) flashes them. */
export function makeSein(sein) {
  const g = new THREE.Group(); g.name = sein.id;
  const lamps = [];
  banks(g);
  let height = 3;
  const sides = (y, z) => { for (const s of [-1, 1]) head(g, s * (HALF + 0.35), y, z, sein.lampen, lamps); };
  switch (sein.bouw) {
    case 'brug': case 'ophaal': {
      const b = bascule(g, 0, sein.bouw === 'ophaal');
      sides(b.under - 0.4, b.front - 0.2 + 0.11);
      yellows(g, sein.geel ?? 0, b.under, b.front, lamps);
      height = sein.bouw === 'ophaal' ? 6 : 3.4;
      break;
    }
    case 'sluis': {
      gates(g, -1.5, sein.open);
      // the lights on posts on the walls, either side of the way in
      for (const s of [-1, 1]) g.add(box(0.12, 1.9, 0.12, M.kast, s * (HALF + 0.35), BANK.top + 0.95, 1.2));
      sides(BANK.top + 1.9, 1.33);
      height = 3.2;
      break;
    }
    case 'sluisbrug': case 'sluisophaal': {
      gates(g, -3, sein.open);
      const b = bascule(g, 0, sein.bouw === 'sluisophaal');
      sides(b.under - 0.4, b.front - 0.2 + 0.11);
      yellows(g, sein.geel ?? 0, b.under, b.front, lamps);
      height = sein.bouw === 'sluisophaal' ? 6 : 3.4;
      break;
    }
    case 'vast': case 'stuwbrug': {
      const under = 3.6; const deep = 2.4;
      for (const s of [-1, 1]) g.add(box(1.1, under - BANK.top, deep - 0.4, M.beton, s * (HALF + 0.55), (under + BANK.top) / 2, 0));
      g.add(box(OPENING + 6, 0.7, deep, M.beton, 0, under + 0.35, 0));
      // over a weir: its gate drawn up under the deck, out of the water
      if (sein.bouw === 'stuwbrug') g.add(box(OPENING, 1.1, 0.3, M.dek, 0, under - 0.55, -0.2));
      // the lights in place of a board: one red, or one or two yellow side by side, on the fascia over the middle
      if (sein.licht) {
        const kleur = sein.borden === 'A.1' ? 'rood' : 'geel';
        for (const x of sein.borden === 'D.1b' ? [-0.3, 0.3] : [0]) head(g, x, under + 0.35, deep / 2 + 0.11, [[kleur]], lamps);
        height = 4.4;
        break;
      }
      const at = (code, x, mirror = false) => {
        const board = makeBoard(code, { 'D.1b': 1.2, 'A.1': 0.9, 'C.2': 0.66, 'G.5.2': 0.66, 'G.5.3': 0.66, 'G.5.1c': 0.66, 'G.5.1b': 0.62 }[code] ?? 0.6);
        board.position.set(x, under + 0.35, deep / 2 + 0.02); if (mirror) board.scale.x = -1; g.add(board);
      };
      // the halves of A.10 and D.2 point the way: the board as drawn on the left, mirrored on the right
      if (sein.borden === 'A.10' || sein.borden === 'D.2') { at(sein.borden, -2.9); at(sein.borden, 2.9, true); }
      else at(sein.borden, 0);
      height = 4.4;
      break;
    }
    case 'stuw': {
      // two tall piers either side of the opening, the lights on their fronts; the gate between them down
      // in the water when the weir is shut, drawn up out of it when it is open
      const high = 6;
      for (const s of [-1, 1]) g.add(box(1.4, high + 1.2, 3, M.beton, s * (HALF + 0.7), (high - 1.2) / 2, 0));
      g.add(box(OPENING + 2.8, 0.5, 3, M.beton, 0, high + 0.25, 0));                              // the walkway the gate hangs from
      g.add(box(OPENING, 2.4, 0.3, M.dek, 0, sein.open ? high - 1.4 : 0.4, -0.4));
      sides(BANK.top + 3, 1.5 + 0.11);
      height = 6.8;
      break;
    }
    case 'spui': {
      g.add(box(OPENING, 3.6, 1.2, M.beton, 0, 0.6, -0.6));                                       // the sluice across the canal
      for (const x of [-2.3, 0, 2.3]) g.add(box(1.6, 1.0, 0.04, M.donker, x, 0.3, 0.02));          // its openings
      g.add(box(0.12, 1.2, 0.12, M.kast, 0, 2.4 + 0.6, -0.3));
      g.add(box(1.3, 1.1, 0.12, M.kast, 0, 3.75, -0.3));
      const spots = { op: [[0, 0.3], [-0.38, -0.25], [0.38, -0.25]], neer: [[-0.38, 0.25], [0.38, 0.25], [0, -0.3]], rij: [[-0.42, 0], [0, 0], [0.42, 0]] }[sein.driehoek];
      for (const [x, y] of spots) { const lamp = makeLamp('rood', 2.2, LENS, { day: true }); lamp.position.set(x, 3.75 + y, -0.2); g.add(lamp); lamps.push({ lamp, lit: () => true }); }
      flag(g, sein.vlag, HALF + 1.2, 1.2);
      height = 4.6;
      break;
    }
    default: break;
  }
  g.userData = {
    height,
    update(t, night) { for (const { lamp, lit } of lamps) lamp.userData.set(lit(t), night); },
  };
  for (const { lamp } of lamps) lamp.userData.set(true, 0);
  return g;
}

/**
 * E.4a and E.4b, the veerpont: a waterway with a kade on either side, the sign on both kades facing the
 * water, and the pont of schepen.js out in the middle, lying across from kade to kade as it crosses -
 * the niet-vrijvarende (E.4a) on its cable to both banks, the vrijvarende (E.4b) free. Its own frame as
 * makeSein's: the water at y = 0, the side the boat comes from towards +z.
 */
export function makeVeerpont(code) {
  const g = new THREE.Group(); g.name = code;
  const HALF_WIDE = 19;                                             // m: half the water, so the cable of a kabelpont reaches the kades
  banks(g, HALF_WIDE, 8, -26);
  for (const s of [-1, 1]) {                                        // the sign on each kade, just back from its edge, towards the boat
    const sign = makeSign(code); sign.position.set(s * (HALF_WIDE + 1.2), BANK.top - 0, 5); g.add(sign);
    // the landing the pont lays its ramp on: a sloping strip of concrete into the water
    const stoep = box(2.4, 0.3, 9, M.beton, s * (HALF_WIDE - 0.9), BANK.top / 2 - 0.1, 0);
    stoep.rotation.z = s * 0.35; g.add(stoep);
  }
  const config = CONFIGS.find((c) => c.id === (code === 'E.4a' ? 'veerpont_niet_vrijvarend' : 'veerpont_vrijvarend'));
  const pont = makeShip(config);
  pont.position.set(-pont.userData.length / 2, 0, 0);               // its length across the water, its middle in the middle
  g.add(pont);
  g.userData = { height: 6, update(t, night, camera) { pont.userData.update?.(t, night, camera); } };
  return g;
}
