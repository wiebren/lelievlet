import * as THREE from 'three';

// Krachten, drawn on the boat: arrows, koppels and points in the 3D scene, over everything else
// (a force under water or behind a sail must not be hidden), with their word beside them in the page.
// Everything is drawn anew each frame from a list of items in world space (index.js):
//
//   { type: 'pijl', from, vec, kleur, label, dun }       an arrow from `from` along `vec` (metres)
//   { type: 'lijn', a, b, kleur }                         a dashed line: a parallelogram, a track
//   { type: 'punt', at, kleur, label }                    a point: zeilpunt, lateraal punt ...
//   { type: 'boog', center, as, r, start, sweep, kleur, label, vol }   a koppel: a dashed arc with a head,
//                                                         about the x or y axis (as 'x' | 'y'); sweep in
//                                                         radians, positive is a positive turn about it;
//                                                         vol: solid and heavier, for the sum of the others
//   { type: 'maat', a, b, kleur, label }                  a dimension: the arm
//   { type: 'tekst', at, kleur, label }                   a word on its own, `offset` pixels from `at`
//   { type: 'ruimte', at }                                nothing drawn: room the schema keeps free (schema.js)
//
// and on any of them: labelAt (where along an arrow its word goes, 0..1), offset ([x, y] pixels the word is
// moved), views (where it is drawn: the schema's views, and 'boot' for the boat - none: everywhere).
//
// Line widths are set in screen pixels (PX, the half-width of a force arrow): worked back to metres at the
// distance looked at, so they stay the same however far off the camera is and however big the page.

const UP = new THREE.Vector3(0, 1, 0);
const ORDER = 1000;
const PX = 3;

export function createPijlen({ scene, camera, controls, layer }) {
  const group = new THREE.Group(); group.name = 'krachten'; scene.add(group);
  const materials = new Map();
  const material = (kleur) => {
    if (!materials.has(kleur)) {
      materials.set(kleur, new THREE.MeshBasicMaterial({ color: kleur, depthTest: false, depthWrite: false, transparent: true, opacity: 0.96 }));
    }
    return materials.get(kleur);
  };
  // unit shapes along +y from the origin: a shaft, a head, a dot
  const shaftGeo = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true); shaftGeo.translate(0, 0.5, 0);
  const headGeo = new THREE.ConeGeometry(1, 1, 14); headGeo.translate(0, 0.5, 0);
  const dotGeo = new THREE.SphereGeometry(1, 16, 10);
  const pools = { shaft: [], head: [], dot: [] };
  const used = { shaft: 0, head: 0, dot: 0 };
  const take = (kind, kleur) => {
    let m = pools[kind][used[kind]];
    if (!m) {
      m = new THREE.Mesh({ shaft: shaftGeo, head: headGeo, dot: dotGeo }[kind]);
      m.renderOrder = ORDER + (kind === 'dot' ? 2 : 1); m.frustumCulled = false;
      pools[kind].push(m); group.add(m);
    }
    used[kind]++;
    m.material = material(kleur); m.visible = true;
    return m;
  };
  const dir = new THREE.Vector3(); const a = new THREE.Vector3(); const b = new THREE.Vector3();

  /** A round bar from p to q, `r` thick. */
  const bar = (p, q, r, kleur) => {
    dir.subVectors(q, p); const len = dir.length(); if (len < 1e-5) return;
    const m = take('shaft', kleur);
    m.position.copy(p); m.quaternion.setFromUnitVectors(UP, dir.divideScalar(len)); m.scale.set(r, len, r);
  };
  const head = (tip, along, r, kleur) => {
    const len = 4.2 * r;
    const m = take('head', kleur);
    m.position.copy(tip).addScaledVector(along, -len); m.quaternion.setFromUnitVectors(UP, along); m.scale.set(1.9 * r, len, 1.9 * r);
  };
  /** Dashes along a polyline. */
  const dashes = (points, r, kleur) => {
    const dash = 5 * r; const gap = 3.5 * r; let carry = 0; let on = true;
    for (let i = 1; i < points.length; i++) {
      const p = points[i - 1]; const q = points[i];
      const seg = p.distanceTo(q); let t = 0;
      while (t < seg) {
        const step = Math.min((on ? dash : gap) - carry, seg - t);
        if (on) { a.lerpVectors(p, q, t / seg); b.lerpVectors(p, q, (t + step) / seg); bar(a, b, r, kleur); }
        t += step; carry += step;
        if (carry >= (on ? dash : gap) - 1e-6) { carry = 0; on = !on; }
      }
    }
  };
  const arcPoints = (it, n = 36) => {
    const c = new THREE.Vector3(...it.center); const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = it.start + (it.sweep * i) / n;
      // a positive turn about y takes +x to -z; about x it takes +y to +z
      pts.push(it.as === 'y' ? new THREE.Vector3(c.x + it.r * Math.cos(t), c.y, c.z - it.r * Math.sin(t))
                             : new THREE.Vector3(c.x, c.y + it.r * Math.cos(t), c.z + it.r * Math.sin(t)));
    }
    return pts;
  };

  // -- the words, in the page over the canvas
  const labels = []; let labelsUsed = 0;
  const label = (text, kleur, at, offset = [0, 0], first = false) => {
    let el = labels[labelsUsed];
    if (!el) { el = document.createElement('div'); el.className = 'kr-label'; layer.append(el); labels.push(el); }
    labelsUsed++;
    if (el.textContent !== text) { el.textContent = text; el._w = 0; el._k = undefined; }
    el.style.setProperty('--kr', kleur);
    el.hidden = false;
    el._at = at.clone(); el._offset = offset; el._first = first;
  };

  let shown = [];
  let visible = true;
  return {
    set visible(on) { visible = on; group.visible = on; if (!on) for (const el of labels) el.hidden = true; },
    draw(items) { shown = items; },
    /** Lays the items out for this camera; after the camera has moved, before the render. */
    update(width, height) {
      for (const k of Object.keys(used)) used[k] = 0;
      labelsUsed = 0;
      if (visible) {
        const metresPerPx = (2 * Math.max(camera.position.distanceTo(controls.target), 2) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) / Math.max(height, 1);
        const r = PX * metresPerPx;
        for (const it of shown) {
          if (it.type === 'pijl') {
            const from = new THREE.Vector3(...it.from); const vec = new THREE.Vector3(...it.vec);
            const len = vec.length(); if (len < 0.02) continue;
            const w = it.dun ? 0.6 * r : r;
            const along = vec.clone().divideScalar(len);
            const tip = from.clone().add(vec);
            const headLen = Math.min(4.2 * w, len * 0.45);
            bar(from, tip.clone().addScaledVector(along, -headLen * 0.9), w, it.kleur);
            head(tip, along, Math.min(w, len * 0.45 / 4.2), it.kleur);
            if (it.label) label(it.label, it.kleur, from.clone().addScaledVector(vec, it.labelAt ?? 0.62), it.offset ?? [0, -12]);
          } else if (it.type === 'lijn') {
            dashes([new THREE.Vector3(...it.a), new THREE.Vector3(...it.b)], 0.35 * r, it.kleur);
          } else if (it.type === 'punt') {
            const m = take('dot', it.kleur); m.position.set(...it.at); m.scale.setScalar(2.4 * r);
            if (it.label) label(it.label, it.kleur, m.position, it.offset ?? [0, 16], true);
          } else if (it.type === 'boog') {
            if (Math.abs(it.sweep) < 0.05) continue;
            const pts = arcPoints(it);
            const body = pts.slice(0, -2);
            if (it.vol) for (let i = 1; i < body.length; i++) bar(body[i - 1], body[i], 1.0 * r, it.kleur);
            else dashes(body, 0.7 * r, it.kleur);
            const end = pts[pts.length - 1]; const before = pts[pts.length - 3];
            head(end, end.clone().sub(before).normalize(), (it.vol ? 1.2 : 0.9) * r, it.kleur);
            if (it.label) label(it.label, it.kleur, pts[Math.floor(pts.length / 2)], it.offset ?? [0, 0]);
          } else if (it.type === 'tekst') {
            label(it.label, it.kleur, new THREE.Vector3(...it.at), it.offset ?? [0, 0]);
          } else if (it.type === 'maat') {
            const p = new THREE.Vector3(...it.a); const q = new THREE.Vector3(...it.b);
            if (p.distanceTo(q) < 0.03) continue;
            bar(p, q, 0.45 * r, it.kleur);
            // ticks square to it, in the plane the camera sees it in
            const d = q.clone().sub(p).normalize();
            const view = camera.position.clone().sub(p).normalize();
            const tick = d.clone().cross(view).normalize().multiplyScalar(5 * r);
            for (const e of [p, q]) bar(e.clone().sub(tick), e.clone().add(tick), 0.45 * r, it.kleur);
            if (it.label) label(it.label, it.kleur, p.clone().lerp(q, 0.5), it.offset ?? [0, -12]);
          }
        }
      }
      for (const k of Object.keys(pools)) for (let i = used[k]; i < pools[k].length; i++) pools[k][i].visible = false;
      for (let i = labelsUsed; i < labels.length; i++) labels[i].hidden = true;
      // the words: projected after everything has its place, each moved off the ones before it - and off
      // the points, whose words come first - as little as it can
      const p = new THREE.Vector3();
      const placed = [];
      const H = 19;
      const order = labels.slice(0, labelsUsed).sort((a, b) => b._first - a._first);   // the points keep their place
      for (const el of order) {
        p.copy(el._at).project(camera);
        if (p.z > 1) { el.hidden = true; continue; }
        if (!el._w) el._w = el.offsetWidth || el.textContent.length * 7 + 12;
        const x = ((p.x + 1) / 2) * width + el._offset[0]; const y0 = ((1 - p.y) / 2) * height + el._offset[1];
        // its own place when free, else the step it had while that still fits: a word does not hop about
        // back to its own place from elsewhere only with room to spare: no hopping to and fro
        const free = (k, ruim = 0) => !placed.some((q) => Math.abs(q.x - x) < (q.w + el._w) / 2 + 2 + ruim && Math.abs(q.y - (y0 + k * H)) < H + ruim);
        const k = free(0, el._k ? 6 : 0) ? 0 : el._k !== undefined && free(el._k) ? el._k : [-1, 1, -2, 2, -3, 3, -4, 4].find((n) => free(n)) ?? 0;
        el._shown = el._k === undefined ? k : el._shown + (k - el._shown) * 0.2; el._k = k;
        placed.push({ x, y: y0 + k * H, w: el._w });
        const y = y0 + el._shown * H;
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
      }
    },
    dispose() {
      group.removeFromParent();
      shaftGeo.dispose(); headGeo.dispose(); dotGeo.dispose();
      for (const m of materials.values()) m.dispose();
      for (const el of labels) el.remove();
    },
  };
}
