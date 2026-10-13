import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

// A word on the outside of the spiegel, to bakboord of the roer, as some groups letter their boats there (the group's
// name, Aanpassen › Bekend: groepen.js spiegelTekst). One line, in the colour of the naam, laid onto the spiegel as a
// decal so it follows its curve; empty text: none.

// m: on the spiegel, to bakboord of the roer - in height midway between the sleepogen (up to 0.76) and the dolboord's
// rand (from 0.91), across between the roer and the bakboord sleepoog
const AT = { y: 0.835, z: -0.22 };
const HIGH = 0.085;                    // m: the height of the letters

export function makeSpiegelTekst(parts) {
  const skin = parts.find((p) => p.extras.id === 'spiegel')?.meshes.find((m) => m.material.name === 'romp');
  let mesh = null; let was = '';

  return {
    set(text, color) {
      const key = `${text}|${color}`;
      if (key === was) return;
      was = key;
      if (mesh) { mesh.removeFromParent(); mesh.geometry.dispose(); mesh.material.map.dispose(); mesh.material.dispose(); mesh = null; }
      if (!text || !skin) return;
      skin.updateWorldMatrix(true, false);
      const hit = new THREE.Raycaster(new THREE.Vector3(-2, AT.y, AT.z), new THREE.Vector3(1, 0, 0)).intersectObject(skin, false)[0];
      if (!hit) return;
      const SIZE = 120; const PAD = 12; const face = `700 ${SIZE}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
      const canvas = document.createElement('canvas'); let g = canvas.getContext('2d'); g.font = face;
      canvas.width = Math.ceil(g.measureText(text).width + 2 * PAD); canvas.height = Math.ceil(SIZE * 1.2 + 2 * PAD);
      g = canvas.getContext('2d'); g.font = face; g.fillStyle = color; g.textBaseline = 'top'; g.fillText(text, PAD, PAD);
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
      const n = hit.face.normal.clone().transformDirection(skin.matrixWorld);
      if (n.x > 0) n.negate();                                        // out of the boat, aft
      const across = new THREE.Vector3(0, 0, 1);                      // read from astern: stuurboord to the right
      const up = new THREE.Vector3().crossVectors(n, across);
      const orientation = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(across, up, n));
      const h = HIGH * canvas.height / SIZE; const w = h * canvas.width / canvas.height;
      mesh = new THREE.Mesh(new DecalGeometry(skin, hit.point, orientation, new THREE.Vector3(w, h, 0.06)),
        new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.5, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
      mesh.renderOrder = 2; mesh.raycast = () => {};
      skin.parent.add(mesh);
    },
  };
}
