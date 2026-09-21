import * as THREE from 'three';

// Vlaggenstok, knop and vlag. The CAD has none of them. The staff stands in the open top end of
// the roerkoning, which is a tube, so it rakes aft with the rudder, and it is a bent one: straight
// where it stands in the tube, then curving over aft so the flag hangs clear of the stern. Its top
// is not a ball but a flat disc with a rounded edge, in the bakskleur. The flag is the Dutch one.

const STAFF_R = 0.0125; const STAFF_TIP_R = 0.009;                  // 25 mm at the foot, tapering to 18 mm
const STAFF_L = 0.88; const INSERT = 0.12;                           // a 100 cm staff, 12 cm of it in the tube
const BEND = THREE.MathUtils.degToRad(24);                           // how far the top has curved over
const KNOP_R = 0.034; const KNOP_T = 0.020;                          // disc, 2 cm thick
const HOIST = 0.50; const FLY = 0.75;                                // flag, 50 x 75 cm
const NU = 26; const NV = 10;                                        // cloth grid: along the fly, along the hoist

function makeTricolour() {
  const canvas = document.createElement('canvas');
  canvas.width = 4; canvas.height = 3;
  const ctx = canvas.getContext('2d');
  ['#ae1c28', '#ffffff', '#21468b'].forEach((colour, i) => { ctx.fillStyle = colour; ctx.fillRect(0, i, 4, 1); });
  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.NearestFilter; texture.minFilter = THREE.NearestFilter;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * foot: top end of the roerkoning on its axis, axis: unit vector up along it (model space).
 * addPart registers a node as a pickable part; accent is the shared bakskleur material.
 * Returns update(t, windAngle, wind 0..1, present 0..1, turn): turn = how the rudder is turned (quaternion).
 */
export function initFlag({ foot, axis, addPart, joinPart, accent }) {
  const wood = new THREE.MeshStandardMaterial({ color: 0xb07a3f, roughness: 0.55 });

  // Centre-line from the rim of the tube (the origin), in model space. It bends in the vertical
  // plane through the tube, away from the vertical, more and more towards the top.
  const over = new THREE.Vector3(0, 1, 0).addScaledVector(axis, -axis.y).normalize().negate();
  const line = []; const lean = [];                                   // points and unit tangents, by length
  const STEPS = 60; const at0 = axis.clone().multiplyScalar(-INSERT);
  for (let i = 0; i <= STEPS; i++) {
    const s = -INSERT + ((STAFF_L + INSERT) * i) / STEPS;
    const k = THREE.MathUtils.smoothstep(s, 0.10 * STAFF_L, 1.15 * STAFF_L);
    const tangent = axis.clone().multiplyScalar(Math.cos(BEND * k)).addScaledVector(over, Math.sin(BEND * k));
    if (i) at0.addScaledVector(tangent, (STAFF_L + INSERT) / STEPS);
    line.push(at0.clone()); lean.push(tangent);
  }
  const along = (s) => {                                              // point and tangent at s metres above the rim
    const f = THREE.MathUtils.clamp((s + INSERT) / (STAFF_L + INSERT), 0, 1) * STEPS;
    const i = Math.min(Math.floor(f), STEPS - 1);
    return { point: line[i].clone().lerp(line[i + 1], f - i), tangent: lean[i].clone().lerp(lean[i + 1], f - i).normalize() };
  };
  const SIDES = 16;
  const tube = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(line), STEPS, STAFF_R, SIDES, false);
  {                                                                   // taper it towards the top
    const p = tube.attributes.position; const centre = new THREE.Vector3(); const v = new THREE.Vector3();
    for (let i = 0; i <= STEPS; i++) {
      centre.copy(line[i]);
      const scale = THREE.MathUtils.lerp(1, STAFF_TIP_R / STAFF_R, THREE.MathUtils.clamp((i / STEPS) * (STAFF_L + INSERT) - INSERT, 0, STAFF_L) / STAFF_L);
      for (let j = 0; j <= SIDES; j++) {
        const n = i * (SIDES + 1) + j;
        v.fromBufferAttribute(p, n).sub(centre).multiplyScalar(scale).add(centre);
        p.setXYZ(n, v.x, v.y, v.z);
      }
    }
    tube.computeVertexNormals();
  }
  const staff = new THREE.Mesh(tube, wood);
  const tip = along(STAFF_L);
  // knop: a disc with a rounded edge, turned on the staff's axis
  const rim = [new THREE.Vector2(0, -KNOP_T / 2)];
  for (let i = 0; i <= 10; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 10;
    rim.push(new THREE.Vector2(KNOP_R - KNOP_T / 2 + (KNOP_T / 2) * Math.cos(a), (KNOP_T / 2) * Math.sin(a)));
  }
  rim.push(new THREE.Vector2(0, KNOP_T / 2));
  const knop = new THREE.Mesh(new THREE.LatheGeometry(rim, 32), accent);
  knop.geometry.translate(0, KNOP_T / 2 - 0.002, 0);                  // sits on the tip, square to it
  knop.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tip.tangent);

  const cloth = new THREE.BufferGeometry();
  const position = new Float32Array((NU + 1) * (NV + 1) * 3); const uv = []; const index = [];
  for (let j = 0; j <= NV; j++) for (let i = 0; i <= NU; i++) uv.push(i / NU, 1 - j / NV);
  for (let j = 0; j < NV; j++) {
    for (let i = 0; i < NU; i++) {
      const a = j * (NU + 1) + i; const b = a + 1; const c = a + NU + 1; const d = c + 1;
      index.push(a, c, b, b, c, d);
    }
  }
  cloth.setAttribute('position', new THREE.BufferAttribute(position, 3));
  cloth.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  cloth.setIndex(index);
  const flag = new THREE.Mesh(cloth, new THREE.MeshStandardMaterial({ map: makeTricolour(), side: THREE.DoubleSide, roughness: 0.9 }));
  flag.frustumCulled = false;

  const hoist = [];                                                   // where the flag is made fast, down from the knop
  for (let j = 0; j <= NV; j++) hoist.push(along(STAFF_L - 0.03 - (HOIST * j) / NV));
  addPart(staff, 'vlaggenstok', 'Vlaggenstok', 'roer', 'roerkoning', [25, 1000, 25]);
  joinPart(knop, 'vlaggenstok');                                      // the knop is part of the stok
  addPart(flag, 'vlag', 'Vlag', 'roer', 'roerkoning', [750, 500, 1]);

  const from = new THREE.Vector3(); const out = new THREE.Vector3();
  const across = new THREE.Vector3(); const at = new THREE.Vector3(); const lifted = new THREE.Vector3();
  const DOWN = new THREE.Vector3(0, -1, 0);

  const leanNow = new THREE.Vector3();
  return (t, windAngle, wind, present, turn) => {
    // taken out for wrikken: drawn up out of the tube, then gone
    const drawn = (1 - present) * 0.4;
    lifted.copy(foot).addScaledVector(axis, drawn);
    for (const mesh of [staff, knop, flag]) mesh.visible = present > 0.04;
    // staff and knop stand in the roerkoning, so they turn with the rudder, about the tube's own axis
    staff.quaternion.copy(turn);
    knop.position.copy(tip.point).applyQuaternion(turn).add(lifted);
    knop.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), tip.tangent).premultiply(turn);
    staff.position.copy(lifted);

    // The cloth leaves the staff in one direction: downwind with a little droop when there is wind,
    // straight down when there is none. A wave runs out along it, growing towards the fly.
    out.set(-Math.cos(windAngle), 0, -Math.sin(windAngle)).multiplyScalar(wind).addScaledVector(DOWN, 1 - 0.78 * wind).normalize();
    const swell = 0.012 + 0.05 * wind; const speed = 1.5 + 5.5 * wind;
    for (let j = 0; j <= NV; j++) {
      from.copy(hoist[j].point).applyQuaternion(turn).add(lifted);    // down the hoist, along the curve
      across.crossVectors(leanNow.copy(hoist[j].tangent).applyQuaternion(turn), out).normalize();
      for (let i = 0; i <= NU; i++) {
        const u = i / NU;
        const wave = swell * u * (Math.sin(9 * u - speed * t + 1.1 * (j / NV)) + 0.35 * Math.sin(17 * u - 1.7 * speed * t));
        at.copy(from).addScaledVector(out, FLY * u * (1 - 0.04 * wind * Math.abs(wave) / swell)).addScaledVector(across, wave);
        at.y -= 0.10 * u * u * wind;                                    // the fly end sags a little
        at.toArray(position, (j * (NU + 1) + i) * 3);
      }
    }
    cloth.attributes.position.needsUpdate = true;
    cloth.computeVertexNormals();
    cloth.computeBoundingSphere();
  };
}
