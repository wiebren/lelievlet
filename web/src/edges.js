import * as THREE from 'three';

// Lines along the creases of every part, in a darker shade of its own colour: panels in one paint
// (the kuip, the romp) and parts that touch (a doft on the vlonder) are told apart by their edges.

const CREASE = 35;                     // degrees: an edge sharper than this gets a line
const DARKER = 0.75;                   // the line is this much darker than the part
const OPACITY = 0.75;
const MOVING = ['zeil', 'lopend_want'];   // reshaped every frame: lines built once would not follow

/**
 * Lines for every part there is now. Working out the creases takes a while over the whole boat, so
 * it is done after the first picture, a few parts at a time between frames: the boat is there at
 * once, and its lines come in a moment later. `signal`: stop when the viewer goes.
 */
export function addEdges(parts, { signal } = {}) {
  const hsl = {};
  const queue = [];
  for (const p of parts) {
    if (MOVING.includes(p.extras.groep)) continue;
    for (const mesh of p.meshes) if (mesh.isMesh && mesh.material.color) queue.push(mesh);
  }
  const lineFor = (mesh) => {
    const position = mesh.geometry.attributes.position;
    const built = position.version;
    const line = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, CREASE),
      new THREE.LineBasicMaterial({ transparent: true }));
    line.raycast = () => {};         // never picked
    let colour = -1;
    // Per frame, and only while it is drawn: the colour follows a repainted part (Aanpassen), the
    // opacity a fading one, and a part whose vertices were rewritten (the ankerketting) loses its lines.
    line.onBeforeRender = () => {
      if (position.version !== built) { line.visible = false; return; }
      const { color, transparent, opacity } = mesh.material;
      if (color.getHex() !== colour) {
        colour = color.getHex();
        color.getHSL(hsl);
        line.material.color.setHSL(hsl.h, hsl.s, hsl.l * (1 - DARKER));
      }
      line.material.opacity = OPACITY * (transparent ? opacity : 1);
    };
    mesh.add(line);
  };
  const work = () => {
    if (signal?.aborted) return;
    const until = performance.now() + BATCH_MS;
    while (queue.length && performance.now() < until) lineFor(queue.shift());
    if (queue.length) setTimeout(work, 0);
  };
  setTimeout(work, 0);
}

const BATCH_MS = 8;                    // per turn, so a frame is never held up for long
