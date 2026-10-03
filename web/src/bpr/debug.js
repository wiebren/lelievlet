import * as THREE from 'three';
import { MARKS, makeMark } from './betonning.js';
import { TEKENS, makeSign } from './tekens.js';
import { CONFIGS, makeShip } from './schepen.js';

// debug.bpr: a temporary panel to look the BPR assets over before the lessons use them. Betonning and
// Tekens are laid out as a gallery on the water beside the boat; Schepen puts one ship at a time out
// on the water, turned by a slider, so its lights can be checked from the lelievlet. Day or night.
// Built here rather than in template.js: it goes again once the lessons are there.

const el = (tag, props = {}, ...children) => { const n = Object.assign(document.createElement(tag), props); n.append(...children); return n; };

/** Every geometry, material and texture under a node, given back. */
function dispose(node) {
  node.traverse((o) => {
    o.geometry?.dispose();
    for (const m of [o.material].flat()) { if (!m) continue; for (const v of Object.values(m)) if (v?.isTexture && !v.userData.shared) v.dispose(); m.dispose(); }
  });
}

/** A name over an asset: text on a sprite, always facing the camera. */
function label(text) {
  const c = el('canvas', { width: 512, height: 64 });
  const g = c.getContext('2d');
  g.font = '600 30px system-ui, sans-serif'; const w = Math.min(g.measureText(text).width + 24, 512);
  g.fillStyle = 'rgba(22,34,46,0.72)'; g.beginPath();
  if (g.roundRect) g.roundRect((512 - w) / 2, 8, w, 48, 12); else g.rect((512 - w) / 2, 8, w, 48);   // Safari before 16
  g.fill();
  g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, 256, 33, 488);
  const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthWrite: false, transparent: true }));
  sprite.scale.set(2.4, 0.3, 1); sprite.renderOrder = 40;
  return sprite;
}

/**
 * ui, wrap: the viewer's shadow root and wrapper; scene, camera: to put the assets in and check the
 * lights against; waterline: the height of the water;
 * look(position, target): the camera flies there; setDark(k): night 0..1 held, or null to let go.
 * Returns { update(dt) }, called every frame.
 */
export function initBprDebug({ ui, wrap, scene, camera, waterline, look, setDark, signal, engaged }) {
  const root = new THREE.Group(); root.name = 'bpr-debug'; root.visible = false; scene.add(root);
  const shelves = { betonning: new THREE.Group(), tekens: new THREE.Group(), schepen: new THREE.Group() };
  for (const g of Object.values(shelves)) root.add(g);
  const items = [];                                              // { object, label, tab }
  let night = 0; let tab = 'betonning'; let t = 0;

  // each shelf is built the first time its tab is opened: the signs alone are some 80 canvases
  const built = new Set();
  const build = (key) => { if (built.has(key)) return; built.add(key); ({ betonning: buildMarks, tekens: buildSigns })[key]?.(); };
  // -- betonning: rows of six on the starboard side, 4.5 m apart, the first row nearest the boat
  const buildMarks = () => MARKS.forEach((spec, i) => {
    const mark = makeMark(spec);
    mark.position.set(-8 + (i % 6) * 4.5, waterline, 6 + Math.floor(i / 6) * 5);
    const name = label(spec.naam); name.position.set(0, mark.userData.height + 0.45, 0); mark.add(name);
    shelves.betonning.add(mark); items.push({ object: mark, tab: 'betonning', id: spec.id, naam: spec.naam, info: spec.licht?.join(' ') ?? '' });
  });
  // -- tekens: rows of ten on the port side, facing the boat
  const buildSigns = () => TEKENS.flatMap(([, , list]) => list).forEach(([code, naam], i) => {
    const sign = makeSign(code);
    sign.position.set(-6 + (i % 10) * 2, waterline, -5 - Math.floor(i / 10) * 4.2);
    const name = label(`${code} ${naam}`); name.scale.set(1.9, 0.24, 1); name.position.set(0, 3.9, 0.1); sign.add(name);
    shelves.tekens.add(sign); items.push({ object: sign, tab: 'tekens', id: code, naam: `${code} ${naam}` });
  });
  // -- schepen: one at a time, out on the water
  let ship = null; let heading = 0; let distance = 40;
  const placeShip = () => {
    if (!ship) return;
    const d = Math.max(distance, ship.userData.length * 0.8 + 10);
    ship.position.set(2.8 + d, waterline, 0);                     // dead ahead of the lelievlet
    // its course as seen from the boat: 0 is coming straight at her, 90 crossing from starboard to port,
    // 180 going away; the ship's middle stays where it is
    ship.rotation.y = Math.PI - THREE.MathUtils.degToRad(heading);
    const mid = new THREE.Vector3(ship.userData.length / 2, 0, 0).applyEuler(ship.rotation).add(ship.position);
    ship.position.sub(mid).add(new THREE.Vector3(2.8 + d, waterline, 0));
  };
  const showShip = (config) => {
    if (ship) { shelves.schepen.remove(ship); dispose(ship); }       // every ship is built afresh: the last one goes
    ship = makeShip(config); shelves.schepen.add(ship); placeShip();
    look(new THREE.Vector3(1.5, 1.9, 0.4), new THREE.Vector3(2.8 + distance, 2, 0));   // from the helm, looking at it
  };

  // -- the panel
  const button = el('button', { id: 'bpr-toggle', className: 'icon-button', type: 'button', title: 'BPR-assets', textContent: 'BPR' });
  button.setAttribute('aria-label', 'BPR-assets'); button.setAttribute('aria-expanded', 'false');
  const list = el('div', { className: 'bpr-list' });
  const tabs = el('div', { className: 'segmented bpr-tabs' });
  const dayNight = el('div', { className: 'segmented' });
  const shipControls = el('div', { className: 'bpr-ship', hidden: true });
  const panel = el('aside', { id: 'bpr-debug', hidden: true },
    el('header', {}, el('h2', { textContent: 'BPR-assets' }), el('button', { type: 'button', className: 'link-button', textContent: 'Sluiten', onclick: () => open(false) })),
    el('p', { className: 'hint', textContent: 'Tijdelijk: om de modellen te beoordelen voor de lessen ze gebruiken.' }),
    tabs, dayNight, shipControls, list);
  wrap.append(button, panel);

  for (const [key, text] of [['betonning', 'Betonning'], ['tekens', 'Tekens'], ['schepen', 'Schepen']]) {
    const b = el('button', { type: 'button', textContent: text }); b.dataset.tab = key;
    b.addEventListener('click', () => showTab(key)); tabs.append(b);
  }
  for (const [k, text] of [[0, 'Dag'], [1, 'Nacht']]) {
    const b = el('button', { type: 'button', textContent: text }); b.dataset.k = String(k);
    b.addEventListener('click', () => { night = k; setDark(k); mark(dayNight, 'k', String(k)); }); dayNight.append(b);
  }
  const range = (text, min, max, value, fn) => {
    const input = el('input', { type: 'range', min, max, value, step: 1 });
    const out = el('span', { textContent: String(value) });
    input.addEventListener('input', () => { out.textContent = input.value; fn(Number(input.value)); });
    return el('label', { className: 'bpr-range' }, el('span', { textContent: text }), input, out);
  };
  shipControls.append(range('Koers (°, 0 = op je af)', 0, 359, heading, (v) => { heading = v; placeShip(); }),
    range('Afstand (m)', 15, 150, distance, (v) => { distance = v; placeShip(); }));
  const mark = (group, key, value) => { for (const b of group.children) b.setAttribute('aria-pressed', String(b.dataset[key] === value)); };

  function showTab(key) {
    build(key);
    tab = key; mark(tabs, 'tab', key);
    for (const [k, g] of Object.entries(shelves)) g.visible = k === key;
    shipControls.hidden = key !== 'schepen';
    list.replaceChildren();
    // the whole of the gallery in view: the buoys to starboard, the signs to port
    if (key === 'betonning') look(new THREE.Vector3(-12, 12, -8), new THREE.Vector3(3, 0.5, 14));
    if (key === 'tekens') look(new THREE.Vector3(2, 6, 10), new THREE.Vector3(3, 2.5, -14));
    if (key === 'schepen') {
      for (const config of CONFIGS) {
        const b = el('button', { type: 'button', className: 'bpr-item' }, el('b', { textContent: config.naam }), el('span', { textContent: `BPR ${config.artikel}` }));
        b.addEventListener('click', () => { showShip(config); for (const x of list.children) x.removeAttribute('aria-current'); b.setAttribute('aria-current', 'true'); });
        list.append(b);
      }
      return;
    }
    for (const item of items.filter((i) => i.tab === key)) {
      const b = el('button', { type: 'button', className: 'bpr-item' }, el('b', { textContent: item.naam }), el('span', { textContent: item.info ?? '' }));
      b.addEventListener('click', () => {
        const at = item.object.getWorldPosition(new THREE.Vector3());
        const side = Math.sign(at.z) || 1;                        // looked at from the boat's side
        look(at.clone().add(new THREE.Vector3(-1.5, 2.2, -side * 5)), at.clone().setY(waterline + 1.4));
      });
      list.append(b);
    }
  }

  function open(on) {
    panel.hidden = !on; root.visible = on; button.setAttribute('aria-expanded', String(on));
    if (!on) { setDark(null); return; }
    setDark(night); mark(dayNight, 'k', String(night)); showTab(tab);
  }
  button.addEventListener('click', () => open(panel.hidden));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && engaged() && !panel.hidden) open(false); }, { signal });

  return {
    update(dt) {
      if (!root.visible) return;
      t += dt;
      for (const g of shelves[tab].children) g.userData.update?.(t, night, camera);
    },
  };
}
