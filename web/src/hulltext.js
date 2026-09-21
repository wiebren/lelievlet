import * as THREE from 'three';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

// Lettering on the boeisel: the text is projected onto the curved plating as a decal, on both
// sides of the boat, following the sheer. Model space: x = transom -> bow, y = up, z = starboard.

const raycaster = new THREE.Raycaster();

const strakeCache = new Map();

/** Middle of the boeisel strake (and the surface normal there) at station x on one side. */
function strakeMiddle(mesh, x, side) {
  const key = `${mesh.uuid}:${x.toFixed(3)}:${side}`;
  if (!strakeCache.has(key)) strakeCache.set(key, findStrakeMiddle(mesh, x, side));
  return strakeCache.get(key);
}

function findStrakeMiddle(mesh, x, side) {
  let lo = null; let hi = null;
  const dir = new THREE.Vector3(0, 0, -side);
  for (let y = 0.3; y <= 1.25; y += 0.01) {
    raycaster.set(new THREE.Vector3(x, y, side * 3), dir);
    const hit = raycaster.intersectObject(mesh, false)[0];
    if (!hit) continue;
    if (!lo) lo = hit;
    hi = hit;
  }
  if (!lo) return null;
  const yMid = (lo.point.y + hi.point.y) / 2;
  raycaster.set(new THREE.Vector3(x, yMid, side * 3), dir);
  const mid = raycaster.intersectObject(mesh, false)[0];
  if (!mid) return null;
  const normal = mid.face.normal.clone().transformDirection(mesh.matrixWorld);
  if (normal.z * side < 0) normal.negate();
  return { point: mid.point, normal, height: hi.point.y - lo.point.y };
}

function textTexture(text, color, renderer) {
  const H = 256; const pad = 24;
  const font = `700 ${H - 2 * pad}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  ctx.font = font;
  const width = Math.ceil(ctx.measureText(text).width) + 2 * pad;
  canvas.width = Math.max(8, width); canvas.height = H;
  ctx = canvas.getContext('2d');
  ctx.font = font; ctx.fillStyle = color; ctx.textBaseline = 'middle';
  ctx.fillText(text, pad, H / 2 + 4);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return { texture, aspect: canvas.width / canvas.height };
}

export class HullText {
  /** boeisel: { sb: Mesh, bb: Mesh } - the outer skins of the boeisel plates */
  constructor(boeisel, renderer, parent) {
    this.boeisel = boeisel; this.renderer = renderer; this.parent = parent;
    this.decals = new Map();
    for (const m of Object.values(boeisel)) m.updateWorldMatrix(true, false);
  }

  /** key: slot name, text, x: station (m from the transom) of the text centre, letterHeight in m */
  set(key, text, x, letterHeight, color = '#0b0b0b') {
    for (const old of this.decals.get(key) ?? []) {
      this.parent.remove(old); old.geometry.dispose(); old.material.map.dispose(); old.material.dispose();
    }
    this.decals.set(key, []);
    text = text.trim();
    if (!text) return;
    for (const [name, side] of [['sb', 1], ['bb', -1]]) {
      const mesh = this.boeisel[name];
      const here = strakeMiddle(mesh, x, side);
      const aft = strakeMiddle(mesh, x - 0.25, side); const fore = strakeMiddle(mesh, x + 0.25, side);
      if (!here || !aft || !fore) continue;
      const { texture, aspect } = textTexture(text, color, this.renderer);
      const boxHeight = letterHeight / 0.62;                   // cap height is ~62 % of the canvas height
      // Seen from outside, text runs towards the bow on starboard and towards the stern on port.
      const n = here.normal.clone().normalize();
      const along = fore.point.clone().sub(aft.point).multiplyScalar(side).normalize();
      const xAxis = along.sub(n.clone().multiplyScalar(along.dot(n))).normalize();
      const yAxis = new THREE.Vector3().crossVectors(n, xAxis);
      const orientation = new THREE.Euler().setFromRotationMatrix(new THREE.Matrix4().makeBasis(xAxis, yAxis, n));
      const size = new THREE.Vector3(boxHeight * aspect, boxHeight, 0.3);
      const decal = new THREE.Mesh(
        new DecalGeometry(mesh, here.point, orientation, size),
        new THREE.MeshStandardMaterial({
          map: texture, transparent: true, roughness: 0.5, depthWrite: false,
          polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
        }),
      );
      decal.renderOrder = 2;
      this.parent.add(decal);
      this.decals.get(key).push(decal);
    }
  }
}
