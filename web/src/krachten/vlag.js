import * as THREE from 'three';

// A flag that stands still, for Ware en schijnbare wind: on a boei beside the boat, it flies in the ware
// wind, while the flag and the windvaan on the boat - sailing - fly in the schijnbare wind. Set going
// faster, or a vlaag, and the two turn apart. It is the scene's, not the boat's: it does not heel with her.

const POLE = 2.6;                   // m, from the water to the top of the pole
const W = 0.7; const H = 0.46;      // the cloth
const NU = 18;                      // segments along the cloth, for its waves

export function createVlag(scene) {
  const group = new THREE.Group(); group.name = 'krachten-vlag'; group.visible = false; scene.add(group);
  const boei = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.32, 0.55, 24), new THREE.MeshStandardMaterial({ color: 0xf2c200, roughness: 0.5 }));
  boei.position.y = 0.05; group.add(boei);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, POLE, 10), new THREE.MeshStandardMaterial({ color: 0xe6e6e6, roughness: 0.5 }));
  pole.position.y = POLE / 2; group.add(pole);

  // the cloth from the pole along +x, rood wit blauw from the top: three bands painted on it, sharp
  const geo = new THREE.PlaneGeometry(W, H, NU, 1); geo.translate(W / 2, 0, 0);
  const canvas = document.createElement('canvas'); canvas.width = 4; canvas.height = 3;
  const paint = canvas.getContext('2d');
  ['#ae1c28', '#ffffff', '#21468b'].forEach((c, i) => { paint.fillStyle = c; paint.fillRect(0, i, 4, 1); });
  const texture = new THREE.CanvasTexture(canvas); texture.magFilter = THREE.NearestFilter; texture.colorSpace = THREE.SRGBColorSpace;
  const cloth = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide, roughness: 0.85 }));
  const pos = geo.attributes.position;
  const holder = new THREE.Group(); holder.position.y = POLE - H / 2; holder.add(cloth); group.add(holder);
  const rest = Float32Array.from(pos.array);

  return {
    set visible(on) { group.visible = on; },
    /** at: where it stands (world, on the water); to: [x, z], the way the ware wind blows (world); wind 0..1. */
    update(t, at, to, wind) {
      group.position.copy(at);
      holder.rotation.y = Math.atan2(-to[1], to[0]);                  // its +x downwind
      // waves running out along the cloth, bigger towards the free end, and a little sag in a light wind
      const swell = 0.02 + 0.06 * wind; const speed = 2 + 6 * wind;
      for (let i = 0; i < pos.count; i++) {
        const x = rest[3 * i]; const u = x / W;
        pos.setZ(i, Math.sin(t * speed - u * 7) * swell * u);
        pos.setY(i, rest[3 * i + 1] - 0.12 * u * u * (1 - wind));
      }
      pos.needsUpdate = true; geo.computeVertexNormals();
    },
    dispose() {
      group.removeFromParent();
      group.traverse((o) => { o.geometry?.dispose(); o.material?.dispose(); });
      texture.dispose();
    },
  };
}
