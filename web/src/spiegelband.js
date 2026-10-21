import * as THREE from 'three';

// The spiegel painted above the berghout in a colour of its own, as some groups carry a band like the boeisel round
// the stern (Aanpassen › Bekend: groepen.js spiegelBand). With spiegelPunt the band runs on down the middle of the
// spiegel to a point, three quarters of the way down. Only the outside of the spiegel; the lettering stays on top
// (spiegeltekst.js, a decal).
//
// Worked out per pixel from where it is on the spiegel: its height, and how far it is from the middle.

const BERGHOUT = 0.753;                // m: the boeisel's lower edge, the top of the berghout, where it meets the spiegel
const PUNT = 0.75;                     // the point: this part of the way down from the top of the spiegel

/** set(colour | null, punt): the band above the berghout, running down to a point or not; null: none. */
export function makeSpiegelBand(parts) {
  const skin = parts.find((p) => p.extras.id === 'spiegel')?.meshes.find((m) => m.material.name === 'romp');
  skin?.geometry.computeBoundingBox();
  const box = skin?.geometry.boundingBox;
  const uniforms = {
    uBand: { value: 0 },
    uBandKleur: { value: new THREE.Color() },
    uPunt: { value: 0 },
  };
  let ready = false;
  const prepare = () => {
    if (ready || !skin) return;
    ready = true;
    const top = box.max.y; const half = Math.max(box.max.z, -box.min.z);
    const own = { uVorm: { value: new THREE.Vector3(BERGHOUT, top - PUNT * (top - box.min.y), half) } };
    const material = skin.material;
    material.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms, own);
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', '#include <common>\nvarying vec3 vSpiegel;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSpiegel = position;');
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          varying vec3 vSpiegel;
          uniform float uBand;
          uniform vec3 uBandKleur;
          uniform float uPunt;
          uniform vec3 uVorm;`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          if (uBand > 0.5) {
            // above the berghout; with the point also below it, between two lines from its corners to the point
            float punt = mix(uVorm.y, uVorm.x, clamp(abs(vSpiegel.z) / uVorm.z, 0.0, 1.0));
            if (vSpiegel.y >= uVorm.x || (uPunt > 0.5 && vSpiegel.y >= punt)) diffuseColor.rgb = uBandKleur;
          }`);
    };
    material.customProgramCacheKey = () => 'spiegelband';
    material.needsUpdate = true;
  };
  return {
    set(colour, punt) {
      if (colour) { prepare(); uniforms.uBandKleur.value.set(colour); }
      uniforms.uBand.value = colour ? 1 : 0;
      uniforms.uPunt.value = punt ? 1 : 0;
    },
  };
}
