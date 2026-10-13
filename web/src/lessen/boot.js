import * as THREE from 'three';

// The lelievlet as a lesson's map draws her: the edge of her deck from above, in her own frame - [x, z] in metres,
// x to the bow, z to stuurboord - taken once from the model (the boeisel, berghout and spiegel).

/** parts: the viewer's parts; scene: to find the boat in. */
export function deckOutline(parts, scene) {
  let boat = scene.getObjectByName('lelievlet');
  while (boat.parent && boat.parent !== scene) boat = boat.parent;
  const tmp = new THREE.Vector3(); const top = new Map();
  for (const part of parts.filter((p) => /^(boeisel|berghout|spiegel)/.test(p.extras.id))) {
    for (const mesh of part.meshes) {
      mesh.updateWorldMatrix(true, false);
      const pos = mesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i += 2) {
        boat.worldToLocal(tmp.fromBufferAttribute(pos, i).applyMatrix4(mesh.matrixWorld));
        const bx = Math.round(tmp.x * 10); top.set(bx, Math.max(top.get(bx) ?? 0, Math.abs(tmp.z)));
      }
    }
  }
  const xs = [...top.keys()].sort((a, b) => a - b);
  return [...xs.map((x) => [x / 10, top.get(x)]), ...xs.slice().reverse().map((x) => [x / 10, -top.get(x)])];
}

/**
 * An opaque sea out to `straal` metres, for a lesson whose scene reaches past the viewer's own water (rig.js makeWater:
 * 14 m, and clear): with the same hole where she lies, so it does not stand inside her, and laid where the viewer's
 * water is - call userData.volg() each frame where a lesson moves or turns her (modes.kracht.opzij, plek).
 */
export function makeZee(modes, straal) {
  const vorm = new THREE.Shape(); vorm.absarc(2.8, 0, straal, 0, Math.PI * 2, false);
  const gat = modes.water.geometry.parameters?.shapes?.holes?.[0];
  if (gat) vorm.holes.push(gat);
  const zee = new THREE.Mesh(new THREE.ShapeGeometry(vorm, 64), new THREE.MeshStandardMaterial({ color: 0x5f8eae, roughness: 0.35, metalness: 0 }));
  zee.rotation.x = -Math.PI / 2;
  zee.userData.volg = () => { zee.position.copy(modes.water.position); zee.position.y -= 0.01; zee.rotation.z = modes.water.rotation.z; };
  zee.userData.volg();
  return zee;
}
