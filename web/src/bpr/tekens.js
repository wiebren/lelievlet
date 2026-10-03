import * as THREE from 'three';
import { bord } from './borden/index.js';

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
    ['A.10', 'Verboden buiten de begrenzing te varen'], ['A.11', 'Doorvaren wordt aanstonds toegestaan'], ['A.11.1', 'Doorvaren verboden, tenzij stilhouden niet meer kan'], ['A.12', 'Verboden voor motorschepen'],
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
    ['E.6', 'Ankeren toegestaan'], ['E.7', 'Meren toegestaan'], ['E.9a', 'Hoofdvaarwater, nevenvaarwater mondt uit'], ['E.9b', 'Hoofdvaarwater, kruising'],
    ['E.9c', 'Hoofdvaarwater, splitsing'], ['E.9d', 'Hoofdvaarwater, variant d'], ['E.9e', 'Hoofdvaarwater, variant e'], ['E.9f', 'Hoofdvaarwater, variant f'],
    ['E.9g', 'Hoofdvaarwater, variant g'], ['E.9h', 'Hoofdvaarwater, variant h'], ['E.9i', 'Hoofdvaarwater, variant i'], ['E.10a', 'Nevenvaarwater mondt uit in hoofdvaarwater'], ['E.10b', 'Nevenvaarwater mondt uit in hoofdvaarwater'], ['E.10c', 'Nevenvaarwater, variant c'], ['E.10d', 'Nevenvaarwater, variant d'],
    ['E.10e', 'Nevenvaarwater, variant e'], ['E.10f', 'Nevenvaarwater, variant f'],
    ['E.11', 'Einde van een verbod of gebod'], ['E.15', 'Motorschepen toegestaan'], ['E.16', 'Kleine schepen toegestaan'], ['E.18', 'Zeilschepen toegestaan'],
    ['E.19', 'Spierkracht toegestaan'], ['E.20', 'Zeilplanken toegestaan'],
  ]],
  ['F', 'Bijkomende borden', [['F.1', 'Afstand tot het hoofdteken'], ['F.2a', 'Richting waarin het hoofdteken geldt'], ['F.3', 'Aanvullende aanduiding'], ['F.4', 'Categorie']]],
  ['G', 'Bruggen en sluizen', [
    ['G.1a', 'Vaste brug: begrenzing van de vaargeul'], ['G.1b', 'Vaste brug: verboden of aanbevolen doorvaart'], ['G.2a', 'Beweegbare brug in bedrijf'],
    ['G.2b', 'Beweegbare brug buiten bedrijf'], ['G.4.1a', 'Sluis in bedrijf'], ['G.4.1b', 'Sluis buiten bedrijf'], ['G.4.2', 'Sluis met beweegbare brug'],
    ['G.5.1', 'Hoogteschaal'], ['G.5.1b', 'Referentietekens'], ['G.5.2', 'Hoogtebord'],
  ]],
  ['H', 'Spuien en inlaten', [['H.3a', 'Er wordt gespuid'], ['H.3b', 'Er wordt ingelaten'], ['H.3c', 'Er zal weldra worden gespuid of ingelaten']]],
];
const SIDE = 1.0;                                // m: the longer side of a board
const POST = 2.2;                                // m: the lower edge of the board above the water

const faces = new Map();                         // code -> { texture, aspect, missing }

/** The face of a sign: our own drawing of it (borden/), rasterised; a stand-in for one not drawn yet. */
function face(code) {
  if (faces.has(code)) return faces.get(code);
  const { w, h, svg, missing } = bord(code);
  const c = Object.assign(document.createElement('canvas'), { width: Math.round((512 * w) / Math.max(w, h)), height: Math.round((512 * h) / Math.max(w, h)) });
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

/** A sign on its post. */
export function makeSign(code) {
  const group = new THREE.Group(); group.name = code;
  const wood = new THREE.MeshStandardMaterial({ color: 0x6d6d6d, roughness: 0.7 });
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, POST + 0.6 + 1, 8), wood);
  post.position.set(0, (POST + 0.6 - 1) / 2, -0.05);
  group.add(post);
  const { texture, back: backMap, aspect, missing } = face(code);
  const w = aspect >= 1 ? SIDE : SIDE * aspect; const h = aspect >= 1 ? SIDE / aspect : SIDE;
  // what lies outside the sign's own shape (the corners of a round sign or a diamond) is left out
  const front = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: texture, roughness: 0.5, alphaTest: 0.5 }));
  const back = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: backMap, roughness: 0.8, alphaTest: 0.5 }));
  back.rotation.y = Math.PI; back.position.z = -0.005;
  const board = new THREE.Group(); board.add(front, back); board.position.set(0, POST + h / 2, 0);
  group.add(board);
  group.userData = { code, missing, height: POST + h + 0.2, update() {} };
  return group;
}
