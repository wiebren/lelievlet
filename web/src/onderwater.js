import * as THREE from 'three';

// The onderwaterschip in a colour of its own, as a group may paint her bottom (Aanpassen › Bekend: groepen.js
// onderwaterKleur): the romp's paint of the vlak, the kim and the scheg below a line a little above the waterline, as a
// boot-top is painted. The spiegel ends above that line; the zwaard and the roer keep the romp's paint: they move.
//
// Worked out per pixel from its height on the hull.

const BOVEN = 0.04;                    // m: the line this far above the waterline
const DELEN = ['vlak_bb', 'vlak_sb', 'kim_bb', 'kim_sb', 'scheg'];

/** set(colour | null): the onderwaterschip in that colour; null: as the rest of the romp. */
export function makeOnderwater(parts, waterline) {
  const skins = parts.filter((p) => DELEN.includes(p.extras.id))
    .flatMap((p) => p.meshes.filter((m) => m.material.name === 'romp'));
  const uniforms = {
    uOnder: { value: 0 },
    uOnderKleur: { value: new THREE.Color() },
    uOnderLijn: { value: waterline + BOVEN },
  };
  let ready = false;
  const prepare = () => {
    if (ready) return;
    ready = true;
    for (const { material } of skins) {
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms);
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying float vOnderY;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOnderY = position.y;');
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', `#include <common>
            varying float vOnderY;
            uniform float uOnder;
            uniform vec3 uOnderKleur;
            uniform float uOnderLijn;`)
          .replace('#include <color_fragment>', `#include <color_fragment>
            if (uOnder > 0.5 && vOnderY < uOnderLijn) diffuseColor.rgb = uOnderKleur;`);
      };
      material.customProgramCacheKey = () => 'onderwater';
      material.needsUpdate = true;
    }
  };
  return {
    set(colour) {
      if (colour) { prepare(); uniforms.uOnderKleur.value.set(colour); }
      uniforms.uOnder.value = colour ? 1 : 0;
    },
  };
}
