import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

// Lettering on the outside of the spiegel, to bakboord of the roer, as some groups letter their boats there (the
// group's name, or the group and its plaats: Aanpassen › Bekend, groepen.js spiegelTekst). A line or two, '\n' between
// them, centred on each other, laid onto the spiegel as a decal so it follows its curve; empty text: none.

// m: on the spiegel, to bakboord of the roer - in height midway between the sleepogen (up to 0.76) and the dolboord's
// rand (from 0.91), across between the roer and the bakboord sleepoog
const AT = { y: 0.835, z: -0.22 };
const HIGH = [0.085, 0.05];            // m: the height of the letters, on one line and on two
const WIDE = 0.32;                     // m: at most this wide, the room between the roer and the side: longer is smaller

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
      const lines = text.split('\n').slice(0, 2);
      const hit = new THREE.Raycaster(new THREE.Vector3(-2, AT.y, AT.z), new THREE.Vector3(1, 0, 0)).intersectObject(skin, false)[0];
      if (!hit) return;
      const SIZE = 120; const PAD = 12; const LINE = SIZE * 1.15; const face = `700 ${SIZE}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
      const canvas = document.createElement('canvas'); let g = canvas.getContext('2d'); g.font = face;
      const wide = Math.max(...lines.map((line) => g.measureText(line).width));
      canvas.width = Math.ceil(wide + 2 * PAD); canvas.height = Math.ceil(LINE * (lines.length - 1) + SIZE * 1.2 + 2 * PAD);
      g = canvas.getContext('2d'); g.font = face; g.fillStyle = color; g.textBaseline = 'top'; g.textAlign = 'center';
      lines.forEach((line, i) => g.fillText(line, canvas.width / 2, PAD + i * LINE));
      const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
      const n = hit.face.normal.clone().transformDirection(skin.matrixWorld);
      if (n.x > 0) n.negate();                                        // out of the boat, aft
      const across = new THREE.Vector3(0, 0, 1);                      // read from astern: stuurboord to the right
      const up = new THREE.Vector3().crossVectors(n, across);
      const orientation = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(across, up, n));
      const h = Math.min(HIGH[lines.length - 1] * canvas.height / SIZE, WIDE * canvas.height / canvas.width);
      const w = h * canvas.width / canvas.height;
      mesh = new THREE.Mesh(new DecalGeometry(skin, hit.point, orientation, new THREE.Vector3(w, h, 0.06)),
        new THREE.MeshStandardMaterial({ map: texture, transparent: true, roughness: 0.5, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
      mesh.renderOrder = 2; mesh.raycast = () => {};
      skin.parent.add(mesh);
    },
  };
}
