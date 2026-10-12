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
