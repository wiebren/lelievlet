import * as THREE from 'three';
import { bord } from './borden/index.js';
import { hoogteschaalBord } from './borden/fgh.js';

// Scheepvaartverkeerstekens (BPR bijlage 7): a board on a post at the waterside, its face our own
// drawing of the sign (borden/, after the BPR's drawings), or a stand-in with its code for one not
// drawn yet. Board sizes after the RWS Richtlijnen Scheepvaarttekens 2023: 60, 100, 140 or 200 cm by
// the width of the water; 100 cm here, for a waterway of 20 to 60 m. The group stands on the
// waterline, the face towards +z.

/** The relevant signs, by group, with what they are called (reference/bpr/tekens.json). */
export const TEKENS = [
  ['A', 'Verboden', [
    ['A.1', 'In-, uit- of doorvaren verboden'], ['A.1a', 'Buiten gebruik gestelde vaarweg'], ['A.2', 'Voorbijlopen verboden'],
    ['A.4', 'Ontmoeten en voorbijlopen verboden'], ['A.5', 'Verboden ligplaats te nemen'], ['A.5.1', 'Verboden ligplaats te nemen binnen de breedte'],
    ['A.6', 'Verboden te ankeren'], ['A.7', 'Verboden te meren'], ['A.9', 'Verboden hinderlijke waterbeweging te veroorzaken'],
    ['A.10', 'Verboden buiten de begrenzing te varen'], ['A.11', 'Doorvaren nog verboden, wordt aanstonds toegestaan'], ['A.11.1', 'Doorvaren verboden, tenzij stilhouden niet meer kan'], ['A.12', 'Verboden voor motorschepen'],
    ['A.13', 'Verboden voor kleine schepen'], ['A.15', 'Verboden voor zeilschepen'], ['A.16', 'Verboden voor spierkracht'], ['A.17', 'Verboden voor zeilplanken'],
  ]],
  ['B', 'Geboden', [
    ['B.1a', 'Varen in de richting van de pijl'], ['B.1b', 'Varen in de richting van de pijl (staand)'], ['B.5', 'Stilhouden'], ['B.6', 'Snelheid beperken'], ['B.8', 'Bijzonder opletten'],
    ['B.9a', 'Hoofdvaarwater niet opvaren of oversteken'], ['B.9b', 'Hoofdvaarwater niet opvaren of oversteken'],
  ]],
  ['C', 'Beperkingen', [['C.1', 'Beperkte waterdiepte'], ['C.2', 'Beperkte doorvaarthoogte'], ['C.3', 'Beperkte breedte'], ['C.5', 'Vaarwater op afstand van de oever']]],
  ['D', 'Aanbevelingen', [['D.1a', 'Aanbevolen doorvaartopening'], ['D.1b', 'Aanbevolen doorvaartopening, eenrichting'], ['D.2', 'Binnen de begrenzing varen'], ['D.3a', 'Varen in de richting van de pijl']]],
  ['E', 'Aanwijzingen', [
    ['E.1', 'Doorvaren toegestaan'], ['E.2', 'Hoogspanningslijn'], ['E.4a', 'Niet-vrijvarende veerpont'], ['E.4b', 'Vrijvarende veerpont'],
    ['E.5', 'Ligplaats toegestaan'], ['E.5.1', 'Ligplaats toegestaan binnen de breedte'], ['E.5.3', 'Ligplaats toegestaan, zoveel schepen naast elkaar'],
    ['E.6', 'Ankeren toegestaan'], ['E.7', 'Meren toegestaan'], ['E.9a', 'Hoofdvaarwater: kruising'], ['E.9b', 'Hoofdvaarwater: zijvaarwater van rechts'],
    ['E.9c', 'Hoofdvaarwater: zijvaarwater van links'], ['E.9d', 'Hoofdvaarwater: splitsing (d)'], ['E.9e', 'Hoofdvaarwater: splitsing (e)'], ['E.9f', 'Hoofdvaarwater: splitsing (f)'],
    ['E.9g', 'Hoofdvaarwater: splitsing (g)'], ['E.9h', 'Hoofdvaarwater: kruising (h)'], ['E.9i', 'Hoofdvaarwater: kruising (i)'], ['E.10a', 'Nevenvaarwater: kruising met hoofdvaarwater'], ['E.10b', 'Nevenvaarwater mondt uit in hoofdvaarwater'], ['E.10c', 'Nevenvaarwater: splitsing (c)'], ['E.10d', 'Nevenvaarwater: splitsing (d)'],
    ['E.10e', 'Nevenvaarwater: kruising (e)'], ['E.10f', 'Nevenvaarwater: kruising (f)'],
    ['E.11', 'Einde van een verbod, gebod of beperking'], ['E.15', 'Motorschepen toegestaan'], ['E.16', 'Kleine schepen toegestaan'], ['E.18', 'Zeilschepen toegestaan'],
    ['E.19', 'Spierkracht toegestaan'], ['E.20', 'Zeilplanken toegestaan'],
  ]],
  ['F', 'Bijkomende borden', [['F.1', 'Afstand tot het hoofdteken'], ['F.2a', 'Richting waarin het hoofdteken geldt'], ['F.3', 'Aanvullende aanduiding'], ['F.4', 'Categorie']]],
  ['G', 'Bruggen en sluizen', [
    ['G.1a', 'Vaste brug: begrenzing van de vaargeul'], ['G.1b', 'Vaste brug: verboden of aanbevolen doorvaart'], ['G.2a', 'Beweegbare brug in bedrijf'],
    ['G.2b', 'Beweegbare brug buiten bedrijf'], ['G.4.1a', 'Sluis in bedrijf'], ['G.4.1b', 'Sluis buiten bedrijf'], ['G.4.2', 'Sluis met beweegbare brug'],
    ['G.5.1', 'Hoogteschaal'], ['G.5.1a', 'Voorhoogteschaal'], ['G.5.1b', 'Referentieteken'], ['G.5.2', 'Hoogtebord'],
  ]],
  ['H', 'Spuien en inlaten', [['H.3a', 'Er wordt gespuid'], ['H.3b', 'Er wordt ingelaten'], ['H.3c', 'Er zal weldra worden gespuid of ingelaten']]],
];
const SIDE = 1.0;                                // m: the longer side of a board
const POST = 2.2;                                // m: the lower edge of the board above the water

const faces = new Map();                         // code -> { texture, aspect, missing }

/**
 * The face of a sign: our own drawing of it (borden/), rasterised; a stand-in for one not drawn yet.
 * `drawing`: another drawing under its own key; `size`: the pixels of its longer side.
 */
function face(code, drawing = null, size = 512) {
  if (faces.has(code)) return faces.get(code);
  const { w, h, svg, missing } = drawing ?? bord(code);
  const c = Object.assign(document.createElement('canvas'), { width: Math.round((size * w) / Math.max(w, h)), height: Math.round((size * h) / Math.max(w, h)) });
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 4;
  // the back of the board: the sign's own outline in grey, so a round sign or a diamond is that shape behind too
  const b = Object.assign(document.createElement('canvas'), { width: c.width, height: c.height });
  const back = new THREE.CanvasTexture(b); back.colorSpace = THREE.SRGBColorSpace;
  const img = new Image();
  img.onload = () => {
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); texture.needsUpdate = true;
    const g = b.getContext('2d'); g.drawImage(img, 0, 0, b.width, b.height);
    g.globalCompositeOperation = 'source-in'; g.fillStyle = '#9a9a9a'; g.fillRect(0, 0, b.width, b.height); back.needsUpdate = true;
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  const entry = { texture, back, aspect: w / h, missing: Boolean(missing) };
  faces.set(code, entry);
  return entry;
}

/** The board of a sign alone, its longer side `side` m, centred on its origin, the face towards +z. */
export function makeBoard(code, side = SIDE, drawing = null, size = 512) {
  const { texture, back: backMap, aspect, missing } = face(code, drawing, size);
  const w = aspect >= 1 ? side : side * aspect; const h = aspect >= 1 ? side / aspect : side;
  // what lies outside the sign's own shape (the corners of a round sign or a diamond) is left out
  const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, alphaTest: 0.5 }));
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: backMap, roughness: 0.8, alphaTest: 0.5 }));
  back.rotation.y = Math.PI; back.position.z = -0.005;
  const board = new THREE.Group(); board.add(front, back);
  board.userData = { w, h, missing };
  return board;
}

/**
 * G.5.1, the hoogteschaal: not a board on a post but a tall scale on a thick pile in the water, its
 * foot under water - the figure at the waterline is the height there is under the bridge it belongs to.
 * A metre on the scale is a metre: five of them, 1.5 m wide.
 */
function makeHoogteschaal(code = 'G.5.1') {
  const group = new THREE.Group(); group.name = code;
  const HIGH = 5; const OUT = 3.6;                 // m: the scale, and how much of it stands out of the water
  // the voorhoogteschaal (G.5.1a) carries the name of its bridge over it
  const plate = code === 'G.5.1a' ? 0.55 : 0;
  const pile = new THREE.Mesh(new THREE.BoxGeometry(0.55, OUT + plate + 0.4 + 3, 0.55), new THREE.MeshStandardMaterial({ color: 0x5b4a3a, roughness: 0.9 }));
  pile.position.set(0, (OUT + plate + 0.4 - 3) / 2, -0.3);
  const board = makeBoard('G.5.1/schaal', HIGH, hoogteschaalBord(), 1024);
  board.position.set(0, OUT - HIGH / 2, 0);
  group.add(pile, board);
  if (plate) {
    const naam = makeBoard('G.5.1a/naam', 1.5, { w: 600, h: 160, svg: naambord('Hoge brug') });
    naam.position.set(0, OUT + 0.08 + naam.userData.h / 2, 0); group.add(naam);
  }
  group.userData = { code, missing: false, height: OUT + plate + 0.4, update() {} };
  return group;
}

/** A white name plate with a black edge and one name, 600 x 160. */
const naambord = (naam) => `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="160" viewBox="0 0 600 160"><rect x="6" y="6" width="588" height="148" fill="#f7fbf5" stroke="#2a2d2f" stroke-width="12"/>`
  + `<text x="300" y="80" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="78" text-anchor="middle" dominant-baseline="central" fill="#2a2d2f">${naam}</text></svg>`;

/**
 * An onderbord (F) is never on its own: it goes with a main sign on the same post - F.1 over it (from
 * how far it holds), F.2a beside it (the stretch it holds for), F.3 and F.4 under it (what it is about,
 * whom it is for). Each with a main sign it is typically found with.
 */
const ONDERBORD = { 'F.1': ['A.1', 'boven'], 'F.2a': ['A.5', 'naast'], 'F.3': ['B.8', 'onder'], 'F.4': ['E.5', 'onder'] };
function makeOnderbord(code) {
  const [main, where] = ONDERBORD[code];
  const group = new THREE.Group(); group.name = code;
  const wood = new THREE.MeshStandardMaterial({ color: 0x6d6d6d, roughness: 0.7 });
  const sign = makeBoard(main); const plate = makeBoard(code, where === 'naast' ? 0.8 : 0.9);
  const { h: hs } = sign.userData; const { w: wp, h: hp } = plate.userData;
  const gap = 0.06;
  let top;
  if (where === 'boven') { sign.position.set(0, POST + hs / 2, 0); plate.position.set(0, POST + hs + gap + hp / 2, 0); top = POST + hs + gap + hp; }
  else if (where === 'naast') { sign.position.set(-0.05 - sign.userData.w / 2, POST + hs / 2, 0); plate.position.set(0.05 + wp / 2, POST + hs / 2, 0); top = POST + hs; }
  else { plate.position.set(0, POST + hp / 2, 0); sign.position.set(0, POST + hp + gap + hs / 2, 0); top = POST + hp + gap + hs; }
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, top + 1, 8), wood);
  post.position.set(0, (top - 1) / 2, -0.05);
  group.add(post, sign, plate);
  group.userData = { code, missing: false, height: top + 0.2, update() {} };
  return group;
}

/** A sign on its post (the hoogteschaal on its pile in the water, an onderbord with its main sign). */
export function makeSign(code) {
  if (code === 'G.5.1' || code === 'G.5.1a') return makeHoogteschaal(code);
  if (ONDERBORD[code]) return makeOnderbord(code);
  const group = new THREE.Group(); group.name = code;
  const wood = new THREE.MeshStandardMaterial({ color: 0x6d6d6d, roughness: 0.7 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, POST + 0.6 + 1, 8), wood);
  post.position.set(0, (POST + 0.6 - 1) / 2, -0.05);
  group.add(post);
  const board = makeBoard(code); const { h, missing } = board.userData;
  board.position.set(0, POST + h / 2, 0);
  group.add(board);
  group.userData = { code, missing, height: POST + h + 0.2, update() {} };
  return group;
}
