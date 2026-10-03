import * as THREE from 'three';
import { MeshBVH, acceleratedRaycast } from 'three-mesh-bvh';

// Raycasts through a bounding volume hierarchy instead of every triangle: picking what is under the
// pointer, the search for a view of a part (flyTo) and the probes that lay gear on the hull go
// through hundreds of thousands of triangles otherwise. A tree is built once per geometry. Where the
// geometry is rewritten later (a sail bellying, a decal on it) the tree is refitted to it before it
// answers - the same triangles, moved - and anything whose triangles themselves changed takes the
// plain way, triangle by triangle, as before.

const MIN_TRIANGLES = 256;            // below this the plain way is as quick
let patched = false;
const plain = THREE.Mesh.prototype.raycast;

/** Mesh.raycast goes through the tree where there is a current one. Once per page; nothing at import. */
export function useTrees() {
  if (patched) return;
  patched = true;
  THREE.Mesh.prototype.raycast = function raycast(raycaster, intersects) {
    const g = this.geometry; const tree = g?.boundsTree;
    if (tree?.lelievlet && !this.isInstancedMesh && !this.isSkinnedMesh) {
      const pos = g.attributes.position; const own = tree.lelievlet;  // what we keep on the tree, under a key of our own
      if (own.version !== pos.version && g.index === own.index && pos === own.position) {
        tree.refit(); own.version = pos.version;                    // moved, not remade: the tree follows
      }
      if (own.version === pos.version) return acceleratedRaycast.call(this, raycaster, intersects);
    }
    return plain.call(this, raycaster, intersects);
  };
}

/** A tree for every geometry under `root` that is big enough to be worth one; returns how many. */
export function buildTrees(root) {
  const done = new Set(); let n = 0;
  root.traverse((m) => {
    const g = m.isMesh ? m.geometry : null;
    if (!g || done.has(g) || g.boundsTree || !g.attributes.position) return;
    done.add(g);
    const triangles = (g.index ? g.index.count : g.attributes.position.count) / 3;
    if (triangles < MIN_TRIANGLES || g.morphAttributes?.position?.length) return;
    g.boundsTree = new MeshBVH(g, { indirect: true });               // indirect: the geometry's own index stays as it is
    g.boundsTree.lelievlet = { version: g.attributes.position.version, index: g.index, position: g.attributes.position };
    n++;
  });
  return n;
}
