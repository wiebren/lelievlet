import * as THREE from 'three';

// Hogerwal and lagerwal on the water: two strips of land square to the wind, one on either side of her,
// each with a dyke and clumps of trees along its edge - as the banks of Opkruisen (modes.js layBanks) are
// drawn. They lie still about her middle while she sails, turned with the wind: what matters here is which
// wal is where, not that she gets nearer to one.
//
// Built in a frame of its own: +x the way the wind comes from, so the hogerwal lies along +x and the
// lagerwal along -x; set() turns it to the wind of the moment.

export const AF = 9;                                   // m from her middle to the edge of each wal
const BREED = 7;                                       // m of land
const LANG = 90;                                       // m along the wal, either way

export function createWal(scene, { waterline, at = [2.8, 0, 0] }) {
  const group = new THREE.Group(); group.name = 'zeiltermen-wal'; group.visible = false;
  const pos = []; const index = []; const wall = [];
  const rise = (u, seed) => 1.4 + 0.3 * Math.sin(u * 0.21 + seed) + 3.5 * Math.max(0, Math.sin(u * 0.33 + seed * 2) * Math.sin(u * 0.071 + seed));
  for (const [sign, seed] of [[1, 1], [-1, 4]]) {
    const inner = sign * AF; const outer = sign * (AF + BREED);
    const n = pos.length / 3;
    for (const [x, z] of [[inner, -LANG], [outer, -LANG], [inner, LANG], [outer, LANG]]) pos.push(x, 0.01, z);
    index.push(n, n + 1, n + 2, n + 1, n + 3, n + 2);
    const steps = 2 * LANG;
    for (let i = 0; i < steps; i++) {
      const z0 = -LANG + i; const z1 = z0 + 1;
      const h0 = rise(z0, seed); const h1 = rise(z1, seed);
      wall.push(inner, -0.3, z0, inner, -0.3, z1, inner, h0, z0, inner, -0.3, z1, inner, h1, z1, inner, h0, z0);
    }
  }
  const land = new THREE.BufferGeometry();
  land.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); land.setIndex(index);
  const flat = new THREE.Mesh(land, new THREE.MeshBasicMaterial({ color: 0xa4ad8f, side: THREE.DoubleSide,
    polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
  flat.renderOrder = 1;
  const wallGeometry = new THREE.BufferGeometry();
  wallGeometry.setAttribute('position', new THREE.Float32BufferAttribute(wall, 3));
  const dyke = new THREE.Mesh(wallGeometry, new THREE.MeshBasicMaterial({ color: 0x93a391, side: THREE.DoubleSide }));
  for (const m of [flat, dyke]) { m.frustumCulled = false; group.add(m); }
  group.position.set(at[0], waterline, at[2]);
  scene.add(group);
  return {
    set visible(on) { group.visible = on; },
    get visible() { return group.visible; },
    /** wind: the wind off her bow (radians, + : over stuurboord), the way it comes from. */
    set(wind) { group.rotation.y = -wind; },
    dispose() { group.removeFromParent(); land.dispose(); wallGeometry.dispose(); flat.material.dispose(); dyke.material.dispose(); },
  };
}
