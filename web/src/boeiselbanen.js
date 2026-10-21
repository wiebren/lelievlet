import * as THREE from 'three';

// The boeisel painted in lengthwise bands, as some groups have a flag on the sides of a boat (Aanpassen › Bekend:
// groepen.js boeiselBanen, e.g. rood, wit, blauw). Only the outside of the strake, top band first, each an equal
// part of its height wherever along the boat: the bands follow the sheer. The lettering stays on top (decals).
// Or its fore half in the bakskleur, as some groups tell their boats apart (groepen.js boeiselVoor).
//
// Where a point is in the strake's height is worked out per pixel: between the strake's lower and upper edge at that
// place along the boat. The edges are the skin's own border round it, split at its aftmost and foremost points into
// its two long sides (the short ends, at the steven and the spiegel, left out where they run up), and handed to the
// shader as a row of heights along the boat.

const MAX = 4;                         // bands at most
const N = 256;                         // heights of the edges along the boat

/** The strake's edges along it: { x0, x1, rand: [lower, upper] y at N places from x0 to x1 }, in the mesh's space. */
function edgesOf(mesh) {
  const g = mesh.geometry; const pos = g.attributes.position; const index = g.index;
  const pts = Array.from({ length: pos.count }, (_, i) => new THREE.Vector3().fromBufferAttribute(pos, i));
  // the same point once, however often the mesh has it (split for its normals)
  const ids = new Map(); const one = pts.map((p) => {
    const k = `${p.x.toFixed(5)},${p.y.toFixed(5)},${p.z.toFixed(5)}`;
    if (!ids.has(k)) ids.set(k, ids.size);
    return ids.get(k);
  });
  const corner = (t, j) => (index ? index.getX(3 * t + j) : 3 * t + j);
  const edges = new Map();                             // edge -> [triangles on it, its two corners]
  for (let t = 0; t < (index ? index.count : pos.count) / 3; t++) {
    const v = [0, 1, 2].map((j) => corner(t, j));
    for (let j = 0; j < 3; j++) {
      const a = v[j]; const b = v[(j + 1) % 3]; const k = one[a] < one[b] ? `${one[a]},${one[b]}` : `${one[b]},${one[a]}`;
      const e = edges.get(k);
      if (e) e[0]++; else edges.set(k, [1, a, b]);
    }
  }
  // the border, walked round: one loop round the strake (holes in it, if any, make loops of their own: the longest is
  // the one round it). From its aftmost point to its foremost and back are its two long sides: the higher the upper.
  const next = new Map();
  for (const [n, a, b] of edges.values()) {
    if (n !== 1) continue;
    for (const [u, w] of [[a, b], [b, a]]) (next.get(one[u]) ?? next.set(one[u], []).get(one[u])).push(one[w]);
  }
  const punt = new Map();
  pts.forEach((p, i) => punt.set(one[i], p));
  const seen = new Set(); let om = [];
  for (const start of next.keys()) {
    if (seen.has(start)) continue;
    const loop = [start]; seen.add(start);
    for (;;) {
      const verder = next.get(loop.at(-1)).find((v) => !seen.has(v));
      if (verder === undefined) break;
      seen.add(verder); loop.push(verder);
    }
    if (loop.length > om.length) om = loop;
  }
  const P = om.map((v) => punt.get(v));
  const xs = P.map((p) => p.x);
  const i0 = xs.indexOf(Math.min(...xs)); const i1 = xs.indexOf(Math.max(...xs));
  const [lo, hi] = i0 < i1 ? [i0, i1] : [i1, i0];
  const zijden = [P.slice(lo, hi + 1), [...P.slice(hi), ...P.slice(0, lo + 1)]];
  const gem = (z) => z.reduce((sum, p) => sum + p.y, 0) / z.length;
  // each side as heights along the boat, its points in order of x; the ends left out, which run up or across the boat
  const langs = (p, q) => Math.abs(q.y - p.y) <= 0.7 * q.distanceTo(p) && Math.abs(q.x - p.x) >= 0.3 * q.distanceTo(p);
  const curve = (z) => z.filter((p, i) => [z[i - 1], z[i + 1]].some((q) => q && langs(p, q)))
    .sort((a, b) => a.x - b.x);
  // past its end a side runs on as it ran over its last 10 cm: where the end is cut off at a slant (the spiegel), the
  // bands run straight on into the cut, not bent along it
  const verder = (c, x, a, dir) => {
    const b = c.find((p) => Math.abs(p.x - a.x) >= 0.1 && Math.sign(p.x - a.x) === dir) ?? a;
    return a.y + (b.x === a.x ? 0 : (b.y - a.y) / (b.x - a.x) * (x - a.x));
  };
  const op = (c, x) => {
    if (x <= c[0].x) return verder(c, x, c[0], 1);
    if (x >= c.at(-1).x) return verder(c, x, c.at(-1), -1);
    let a = 0; let b = c.length - 1;
    while (b - a > 1) { const m = (a + b) >> 1; if (c[m].x <= x) a = m; else b = m; }
    return c[a].y + (c[b].y - c[a].y) * (x - c[a].x) / Math.max(c[b].x - c[a].x, 1e-9);
  };
  const [boven, onder] = (gem(zijden[0]) > gem(zijden[1]) ? zijden : [zijden[1], zijden[0]]).map(curve);
  const x0 = Math.min(...xs); const x1 = Math.max(...xs);
  const rand = new Float32Array(N * 4);
  for (let i = 0; i < N; i++) {
    const x = x0 + (x1 - x0) * i / (N - 1);
    rand[4 * i] = op(onder, x); rand[4 * i + 1] = op(boven, x);
  }
  return { x0, x1, rand };
}

/** meshes: the outer skins of the boeisel, both sides. set(colours | null, voor): the bands, top first; null: none.
 *  voor: the colour of the fore half (a THREE.Color, followed as it changes: the bakskleur's); null: as the rest. */
export function makeBoeiselBanen(meshes) {
  const uniforms = {
    uBanen: { value: 0 },
    uBaan: { value: Array.from({ length: MAX }, () => new THREE.Color()) },
    uVoor: { value: 0 },
    uVoorKleur: { value: new THREE.Color() },
  };
  let ready = false;
  const prepare = () => {
    if (ready) return;
    ready = true;
    for (const mesh of meshes) {
      const { x0, x1, rand } = edgesOf(mesh);
      const texture = new THREE.DataTexture(rand, N, 1, THREE.RGBAFormat, THREE.FloatType);
      texture.needsUpdate = true;
      const own = { uRand: { value: texture }, uX: { value: new THREE.Vector2(x0, x1) } };
      const material = mesh.material;
      material.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, uniforms, own);
        shader.vertexShader = shader.vertexShader
          .replace('#include <common>', '#include <common>\nvarying vec2 vRomp;')
          .replace('#include <begin_vertex>', '#include <begin_vertex>\nvRomp = position.xy;');
        shader.fragmentShader = shader.fragmentShader
          .replace('#include <common>', `#include <common>
            varying vec2 vRomp;
            uniform int uBanen;
            uniform vec3 uBaan[${MAX}];
            uniform float uVoor;
            uniform vec3 uVoorKleur;
            uniform sampler2D uRand;
            uniform vec2 uX;`)
          .replace('#include <color_fragment>', `#include <color_fragment>
            if (uBanen > 0) {
              // the edges here along the boat, between two of their heights
              float f = clamp((vRomp.x - uX.x) / (uX.y - uX.x), 0.0, 1.0) * float(${N - 1});
              int k = int(floor(f));
              vec2 rand = mix(texelFetch(uRand, ivec2(k, 0), 0).rg, texelFetch(uRand, ivec2(min(k + 1, ${N - 1}), 0), 0).rg, fract(f));
              float hoog = clamp((vRomp.y - rand.x) / max(rand.y - rand.x, 1e-4), 0.0, 1.0);
              int i = clamp(int((1.0 - hoog) * float(uBanen)), 0, uBanen - 1);
              for (int j = 0; j < ${MAX}; j++) if (j == i) diffuseColor.rgb = uBaan[j];
            }
            if (uVoor > 0.5 && vRomp.x > 0.5 * (uX.x + uX.y)) diffuseColor.rgb = uVoorKleur;   // forward of midway along it`);
      };
      material.customProgramCacheKey = () => 'boeiselbanen';
      material.needsUpdate = true;
    }
  };
  return {
    set(colours, voor = null) {
      const banen = Array.isArray(colours) ? colours.slice(0, MAX) : [];
      if (banen.length || voor) prepare();
      uniforms.uBanen.value = banen.length;
      banen.forEach((c, i) => uniforms.uBaan.value[i].set(c));
      uniforms.uVoor.value = voor ? 1 : 0;
      if (voor) uniforms.uVoorKleur.value = voor;
    },
  };
}
