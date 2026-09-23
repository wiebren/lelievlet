import * as THREE from 'three';

// A wooden steiger to lie alongside: a deck of planks on two rows of piles, a gording along the
// water side and cast-iron bolders on the deck near its edge. Nothing of it is in the CAD, so it is
// built here. Its local frame: x along the steiger, z = 0 the water side of the gording with +z out
// over the water, y up from the waterline.

const WOOD = 0x8a6f4d;                                 // weathered planks
const PILE = 0x5a4a38;                                 // the piles, darker and wet
const IRON = 0x2e3338;                                 // bolders
const DECK_Y = 0.45;                                   // top of the deck over the water
const PLANK = { wide: 0.14, gap: 0.012, thick: 0.035 };
const GORDING = { high: 0.18, thick: 0.08 };           // the beam along the water side, under the deck edge
const PILE_R = 0.09; const PILE_EVERY = 2; const PILE_DOWN = 1.2;
const BOLDER = { r: 0.06, high: 0.22, cap: 0.085, capHigh: 0.04, in: 0.25, every: 2 };

/**
 * length, width: of the deck, in metres. Returns { group, bolders, length, width, deckY }:
 * `bolders` are the points a line is made fast to, in the local frame - just under each cap.
 */
export function makeSteiger({ length = 10, width = 1.8 } = {}) {
  const group = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.9 });
  const pile = new THREE.MeshStandardMaterial({ color: PILE, roughness: 0.95 });
  const iron = new THREE.MeshStandardMaterial({ color: IRON, roughness: 0.55, metalness: 0.4 });

  // the planks run across, from the water side to the land side, with a gap between each two
  const plank = new THREE.BoxGeometry(PLANK.wide, PLANK.thick, width);
  const count = Math.floor(length / (PLANK.wide + PLANK.gap));
  const planks = new THREE.InstancedMesh(plank, wood, count);
  const m = new THREE.Matrix4();
  for (let i = 0; i < count; i++) {
    m.makeTranslation(-length / 2 + (i + 0.5) * (PLANK.wide + PLANK.gap), DECK_Y - PLANK.thick / 2, -width / 2);
    planks.setMatrixAt(i, m);
  }
  group.add(planks);

  // two stringers under the planks, and the gording on the water side
  for (const z of [-GORDING.thick / 2, -width + GORDING.thick / 2]) {
    const beam = new THREE.Mesh(new THREE.BoxGeometry(length, GORDING.high, GORDING.thick), wood);
    beam.position.set(0, DECK_Y - PLANK.thick - GORDING.high / 2, z);
    group.add(beam);
  }

  // piles in two rows, standing in the water: each just inside its beam, which is bolted to it, and
  // up to the underside of the planks - the deck lies on them, nothing of them comes through it
  const piles = Math.floor(length / PILE_EVERY) + 1;
  const under = DECK_Y - PLANK.thick;                               // the underside of the planks
  const post = new THREE.CylinderGeometry(PILE_R, PILE_R, under + PILE_DOWN, 12);
  const inset = GORDING.thick + PILE_R + 0.005;
  for (let i = 0; i < piles; i++) {
    const x = -length / 2 + PILE_R + (i * (length - 2 * PILE_R)) / (piles - 1);   // the end ones under the deck, not past it
    for (const z of [-inset, -width + inset]) {
      const p = new THREE.Mesh(post, pile);
      p.position.set(x, (under - PILE_DOWN) / 2, z);
      group.add(p);
    }
  }

  // bolders along the edge, one every few metres, the first and last clear of the ends
  const bolders = [];
  const n = Math.max(2, Math.floor(length / BOLDER.every));
  const body = new THREE.CylinderGeometry(BOLDER.r * 0.85, BOLDER.r, BOLDER.high, 16);
  const cap = new THREE.CylinderGeometry(BOLDER.cap, BOLDER.cap, BOLDER.capHigh, 16);
  for (let i = 0; i < n; i++) {
    const x = -length / 2 + ((i + 0.5) * length) / n;
    const b = new THREE.Mesh(body, iron);
    b.position.set(x, DECK_Y + BOLDER.high / 2, -BOLDER.in);
    const c = new THREE.Mesh(cap, iron);
    c.position.set(x, DECK_Y + BOLDER.high + BOLDER.capHigh / 2, -BOLDER.in);
    group.add(b, c);
    bolders.push(new THREE.Vector3(x, DECK_Y + BOLDER.high * 0.8, -BOLDER.in));
  }
  return { group, bolders, length, width, deckY: DECK_Y };
}
