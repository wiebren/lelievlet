import * as THREE from 'three';

// Two aids that make a highlighted part easier to find, both stepped from the render loop in
// main.js and from nothing else - no animation frame of their own, no timer.
//
//   the pulse   the strength paint() left on the materials of the selection and of the quiz
//               colours breathes between PULSE_LOW and the whole of it. A few parts share a
//               material (every live rope carries the grootschoot's), so it is the MATERIAL that
//               is followed, each one once, with the value paint() gave it as its base; handing
//               that value back leaves the scene exactly as it was found. The hover is left alone:
//               it has to stay calm and instant.
//   the ring    a part that is too small to spot gets a circle around it in the colour of its
//               highlight, in an overlay right above the canvas and under every panel. It is a
//               locator, not a highlight: it shows only while the part covers less than
//               RING_APPEAR_PX on screen, it cannot be hidden by the boat (so it finds the
//               zwaardbout inside the zwaardkast), and it stays crisp at any pixel ratio.
//
// prefers-reduced-motion: reduce takes the movement out of both: a steady highlight, a still ring.

const PULSE_MS = 1400;             // one breath, shared by the light and the ring
const PULSE_LOW = 0.55;            // the dimmest share of the strength paint() set

const RING_APPEAR_PX = 44;         // a part smaller than this on screen gets a ring ...
const RING_HIDE_PX = 56;           // ... and keeps it until it is bigger than this (no flicker between)
const RING_PX = 56;                // the diameter it rests at
const RING_GAP_PX = 12;            // but never closer around the part than this
const RING_MERGE_PX = 40;          // two parts this near each other on screen share one ring
const RING_MAX = 4;                // never more rings than this for one highlight
const RING_PING = 1.18;            // how far the ping opens up before it starts over
const RING_OPAQUE = 0.95;          // opacity at the start of the ping ...
const RING_FAINT = 0.45;           // ... and at the end of it
const HOME_MS = 450;               // a new ring contracts from HOME_SCALE to its resting size
const HOME_SCALE = 3;
const FADE_MS = 180;               // coming and going
const BOUNDS_MS = 200;             // vertices that move are measured again at most this often

const TAU = Math.PI * 2;
const easeOut = (t) => 1 - (1 - t) ** 3;
const clamp = (v, low, high) => Math.min(high, Math.max(low, v));

const _v = new THREE.Vector3();
const _p = new THREE.Vector3();
const _box = new THREE.Box3();
const _one = new THREE.Sphere();
const _part = new THREE.Sphere();

/**
 * wrap:      the .lv box everything is laid out against; the overlay fills it
 * canvas:    the canvas the scene is drawn on; the overlay is put right after it, so it lies over
 *            the boat and under every panel without a z-index of its own
 * camera:    the camera of this viewer
 * visible:   partVisible: whether a part is there in the mode the boat is in
 * rings:     asked per frame whether a ring may be drawn at all (the quiz says no while finding
 *            the part is the question)
 * Returns { release, setTargets, update }.
 */
export function initLocator({ wrap, canvas, camera, visible, rings: allowed, signal, onResize, onDestroy }) {
  const layer = document.createElement('div');
  layer.className = 'locators';
  canvas.insertAdjacentElement('afterend', layer);

  const calmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let calm = calmQuery.matches;
  calmQuery.addEventListener('change', (e) => {
    calm = e.matches;
    if (calm) for (const b of breathing) b.material[b.field] = b.base;   // stop where it stands, at full
  }, { signal });

  let width = 0;
  let height = 0;
  const measure = () => {
    const rect = wrap.getBoundingClientRect();
    width = rect.width; height = rect.height;
  };
  measure();
  onResize(measure);

  // ---------------------------------------------------------------- the pulse
  const breathing = [];            // { material, field, base }: each material once, its painted strength
  const taken = new Set();
  let groups = [];                 // [{ parts, color }] as refreshHighlight() painted them

  /** Every material back at the strength paint() gave it. Called before the parts are painted anew. */
  function release() {
    for (const b of breathing) b.material[b.field] = b.base;
    breathing.length = 0;
    taken.clear();
    groups = [];
  }

  /**
   * What is lit right now: [{ parts, color }], straight after refreshHighlight() painted it,
   * so what stands on the materials at this moment is the base the pulse works from. A gebied is no
   * tint but an overlay, so what breathes there is the opacity of that overlay.
   */
  function setTargets(list) {
    groups = list;
    for (const group of list) {
      for (const part of group.parts) {
        const field = part.extras.gebied ? 'opacity' : 'emissiveIntensity';
        for (const mesh of part.meshes) {
          const material = mesh.material;
          if (taken.has(material) || typeof material[field] !== 'number') continue;
          taken.add(material);
          breathing.push({ material, field, base: material[field] });
        }
      }
    }
  }

  // ---------------------------------------------------------------- how big a part is on screen
  // Bounding spheres are cached per geometry and never written to geometry.boundingSphere: the
  // picking leans on that one. A live rope and a bent sail rewrite their vertices every frame,
  // which shows in the version of the attribute; those are measured again a few times a second.
  const geometryBounds = new WeakMap();      // geometry -> { sphere, version, at }
  const regionBounds = new WeakMap();        // a gebied measures its own triangles -> { sphere, at }

  function measureSphere(position, sphere) {
    _box.setFromBufferAttribute(position);
    _box.getCenter(sphere.center);
    let far = 0;
    for (let i = 0; i < position.count; i++) {
      far = Math.max(far, sphere.center.distanceToSquared(_p.fromBufferAttribute(position, i)));
    }
    sphere.radius = Math.sqrt(far);
  }

  function localSphere(mesh, now) {
    const position = mesh.geometry?.attributes?.position;
    if (!position) return null;
    let entry = geometryBounds.get(mesh.geometry);
    if (!entry) {
      entry = { sphere: new THREE.Sphere(), version: -1, at: -Infinity };
      geometryBounds.set(mesh.geometry, entry);
    }
    if (entry.version !== position.version && now - entry.at >= BOUNDS_MS) {
      entry.version = position.version;
      entry.at = now;
      measureSphere(position, entry.sphere);
    }
    return entry.sphere;
  }

  /** World sphere around a part as it stands right now, or null when there is nothing of it to see. */
  function sphereOf(part, now) {
    if (part.box) {                          // a gebied: the triangles it covers, in world space already
      let entry = regionBounds.get(part);
      if (!entry) {
        entry = { sphere: new THREE.Sphere(), at: -Infinity };
        regionBounds.set(part, entry);
      }
      if (now - entry.at >= BOUNDS_MS) {
        entry.at = now;
        const box = part.box(_box);
        if (box.isEmpty()) entry.sphere.makeEmpty();
        else box.getBoundingSphere(entry.sphere);
      }
      return entry.sphere.isEmpty() ? null : entry.sphere;
    }
    _part.makeEmpty();
    for (const mesh of part.meshes) {
      if (!mesh.visible) continue;
      const local = localSphere(mesh, now);
      if (!local || local.radius < 0) continue;
      _part.union(_one.copy(local).applyMatrix4(mesh.matrixWorld));
    }
    return _part.isEmpty() ? null : _part;
  }

  /** Where that sphere lands on the canvas, in CSS pixels; null when it is behind us or off it. */
  function toScreen(sphere) {
    _v.copy(sphere.center).applyMatrix4(camera.matrixWorldInverse);
    const depth = -_v.z;
    if (depth <= camera.near) return null;
    const fov = THREE.MathUtils.degToRad(camera.fov) / 2;
    const r = (sphere.radius * camera.zoom * height) / (2 * Math.tan(fov) * depth);
    _v.copy(sphere.center).project(camera);
    const x = (_v.x * 0.5 + 0.5) * width;
    const y = (-_v.y * 0.5 + 0.5) * height;
    if (x < -r || y < -r || x > width + r || y > height + r) return null;
    return { x, y, r, ids: null, key: '' };
  }

  /**
   * The spots one highlight asks a ring for: one per part, but parts that land on the same place
   * share a ring around their joint centre, and there are never more than RING_MAX of them.
   */
  function spotsOf(group, now) {
    const spots = [];
    for (const part of group.parts) {
      if (!visible(part)) continue;
      const sphere = sphereOf(part, now);
      const spot = sphere ? toScreen(sphere) : null;
      if (!spot) continue;
      spot.ids = [part.extras.id];
      spots.push(spot);
    }
    while (spots.length > 1) {
      let a = 0; let b = 1; let near = Infinity;
      for (let i = 0; i < spots.length; i++) {
        for (let j = i + 1; j < spots.length; j++) {
          const d = Math.hypot(spots[i].x - spots[j].x, spots[i].y - spots[j].y);
          if (d < near) { near = d; a = i; b = j; }
        }
      }
      if (near > RING_MERGE_PX && spots.length <= RING_MAX) break;
      const one = spots[a]; const other = spots[b];
      const x = (one.x + other.x) / 2; const y = (one.y + other.y) / 2;
      one.r = Math.max(Math.hypot(x - one.x, y - one.y) + one.r,
                       Math.hypot(x - other.x, y - other.y) + other.r);
      one.x = x; one.y = y;
      one.ids.push(...other.ids);
      spots.splice(b, 1);
    }
    for (const spot of spots) spot.key = spot.ids.sort().join('+');
    return spots;
  }

  // ---------------------------------------------------------------- the rings
  const rings = new Map();         // key (the parts it is around) -> { el, on, fade, born, ... }

  function stepRings(now, dt) {
    const wanted = new Map();
    if (width > 0 && height > 0 && allowed()) {
      for (const group of groups) {
        for (const spot of spotsOf(group, now)) wanted.set(spot.key, { spot, color: group.color });
      }
    }
    for (const [key, ring] of rings) if (!wanted.has(key)) ring.on = false;      // gone from view
    for (const [key, { spot, color }] of wanted) {
      let ring = rings.get(key);
      if (!ring) {
        ring = { el: null, on: false, fade: 0, born: now, x: spot.x, y: spot.y, rest: RING_PX,
                 color, drawn: '' };
        rings.set(key, ring);
      }
      const across = spot.r * 2;
      ring.on = ring.on ? across < RING_HIDE_PX : across < RING_APPEAR_PX;
      ring.x = spot.x; ring.y = spot.y;
      ring.rest = Math.max(RING_PX, across + RING_GAP_PX);
      ring.color = color;
      if (ring.on && !ring.el) {                        // it homes in on the spot from three times its size
        ring.el = document.createElement('div');
        ring.el.className = 'locator';
        ring.born = now;
        layer.append(ring.el);
      }
    }

    const phase = (now % PULSE_MS) / PULSE_MS;
    for (const [key, ring] of rings) {
      ring.fade = clamp(ring.fade + ((ring.on ? dt : -dt) / FADE_MS), 0, 1);
      if (!ring.el) {
        if (!ring.on) rings.delete(key);               // it never appeared: nothing to remember
        continue;
      }
      if (!ring.on && ring.fade <= 0) {
        ring.el.remove();
        rings.delete(key);
        continue;
      }
      draw(ring, now, phase);
    }
  }

  /** One ring, placed and sized in CSS pixels; the ping and the homing are both pure scale. */
  function draw(ring, now, phase) {
    const home = calm ? 1 : 1 + (HOME_SCALE - 1) * (1 - easeOut(Math.min(1, (now - ring.born) / HOME_MS)));
    const ping = calm ? 1 : 1 + (RING_PING - 1) * easeOut(phase);
    const size = ring.rest * home * ping;
    const opacity = ring.fade * (calm ? RING_OPAQUE : RING_OPAQUE + (RING_FAINT - RING_OPAQUE) * easeOut(phase));
    const style = ring.el.style;
    style.width = `${size.toFixed(1)}px`;
    style.height = style.width;
    style.transform = `translate3d(${(ring.x - size / 2).toFixed(1)}px, ${(ring.y - size / 2).toFixed(1)}px, 0)`;
    style.opacity = opacity.toFixed(3);
    const colour = ring.color.getStyle();
    if (ring.drawn !== colour) { ring.drawn = colour; style.setProperty('--ring', colour); }
  }

  // ---------------------------------------------------------------- per frame
  /** `now` and `dt` in milliseconds, both from the clock of the render loop. */
  function update(now, dt) {
    if (!calm && breathing.length) {
      const k = PULSE_LOW + (1 - PULSE_LOW) * (0.5 + 0.5 * Math.cos((now / PULSE_MS) * TAU));
      for (const b of breathing) b.material[b.field] = b.base * k;
    }
    if (groups.length || rings.size) stepRings(now, dt);
  }

  onDestroy(() => {
    release();
    for (const ring of rings.values()) ring.el?.remove();
    rings.clear();
    layer.remove();
  });

  return { release, setTargets, update };
}
