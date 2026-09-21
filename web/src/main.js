import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { dressSails } from './sails.js';
import { HullText } from './hulltext.js';
import { initCustomize, initCustomizePanel, collectZoneMaterials } from './customize.js';
import { initModes } from './modes.js';
import { initRegions } from './regions.js';
import { initQuiz } from './quiz.js';
import { initLocator } from './locator.js';
import { initFullscreen } from './fullscreen.js';
import { makeAsset } from './assets.js';
import { naamVan } from './config.js';

// One viewer, from end to end. Nothing here runs at import time: `mount` is called once per
// embedded viewer with the shadow root it owns, so two of them on one page share no state at all.
// Every id is looked up in that root (`ui`), everything that used to hang on the window or on the
// body hangs on the host element and on the `.lv` wrapper inside it, and every listener outside
// the root is registered with an AbortSignal that destroy() fires.

/**
 * ui:     the ShadowRoot the markup is in
 * host:   the element the shadow root is on; the viewer fills its box
 * config: the resolved configuration (see config.js)
 * Returns { ready, destroy, debug }.
 */
export function mount(ui, host, config) {
  const wrap = ui.querySelector('.lv');
  const $ = (id) => ui.getElementById(id);
  const asset = makeAsset(config.assets);

  const controller = new AbortController();
  const { signal } = controller;
  const disposers = [];
  const onDestroy = (fn) => disposers.push(fn);
  const onResizeFns = [];
  const onResize = (fn) => onResizeFns.push(fn);
  let destroyed = false;

  // Keys only reach this viewer while the pointer is over it or the focus is inside it: an embed
  // must not take the arrow keys away from the page it sits in.
  let pointerIn = false;
  let focusIn = false;
  const engaged = () => pointerIn || focusIn;
  host.addEventListener('pointerenter', () => { pointerIn = true; }, { signal });
  host.addEventListener('pointerleave', () => { pointerIn = false; }, { signal });
  host.addEventListener('focusin', () => { focusIn = true; }, { signal });
  host.addEventListener('focusout', () => { focusIn = false; }, { signal });

  /** What the event really started on: a listener outside the shadow root sees the host instead. */
  const realTarget = (e) => e.composedPath()[0] ?? e.target;

  initCustomizePanel(ui, { signal, engaged });
  // Volledig scherm works from the first frame: it needs nothing of the model
  const fullscreen = initFullscreen({ ui, host, config, signal, engaged, realTarget, onDestroy });

  // panels behind an icon button: the view menu (eye), the parts list and the model information (i)
  const closePanel = new Map();                  // panel id -> close it
  const CORNER = ['sidebar', 'parts', 'quiz'];   // these share the top left corner: only one is open at a time
  for (const [button, panel, onToggle] of [['view-toggle', 'sidebar'], ['parts-toggle', 'parts', partsPanelToggled],
                                           ['quiz-toggle', 'quiz', (open) => quiz?.panelToggled(open)],
                                           ['about-toggle', 'about']]) {
    const toggle = $(button);
    const aside = $(panel);
    const setOpen = (open) => {
      aside.hidden = !open;
      toggle.setAttribute('aria-expanded', String(open));
      onToggle?.(open);
    };
    closePanel.set(panel, () => setOpen(false));
    toggle.addEventListener('click', () => {
      const open = aside.hidden;
      if (open && CORNER.includes(panel)) for (const other of CORNER) if (other !== panel) closePanel.get(other)();
      setOpen(open);
    });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && engaged()) setOpen(false); }, { signal });
  }
  $('about-close').addEventListener('click', () => closePanel.get('about')());
  $('parts-close').addEventListener('click', () => closePanel.get('parts')());

  const canvas = $('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 200);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.zoomToCursor = true;          // the wheel zooms towards what is under the pointer
  controls.minDistance = 0.15;
  controls.maxDistance = 60;

  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(4, 9, 6);
  scene.add(sun, new THREE.HemisphereLight(0xdfefff, 0x6b7785, 0.35));

  // Model space: x = transom -> bow, y = up, z = starboard, metres.
  const parts = [];            // { node, extras, meshes[] }
  const groups = new Map();    // groep id -> { title, node, parts[] }
  let modelBox = new THREE.Box3();
  let hullBox = new THREE.Box3();          // the hull alone, without the rig: the camera never stands inside it
  let selected = [];           // several at once: one row of the parts list can stand for four dollen
  let modes = null;
  let regions = null;
  let quiz = null;
  let hovered = null;
  const override = new Map();  // part -> colour: the quiz lights four parts at once, each its own

  const HOVER = new THREE.Color(0x2d8cff);
  const SELECT = new THREE.Color(0xff8a00);

  let settle = null; let stumble = null;
  const ready = new Promise((resolve, reject) => { settle = resolve; stumble = reject; });

  new GLTFLoader().load(asset('models/lelievlet.glb'), async (gltf) => {
    if (destroyed) return;
    const root = gltf.scene;
    scene.add(root);
    root.traverse((node) => {
      const ex = node.userData;
      if (ex?.titel) groups.set(ex.groep, { title: ex.titel, node, parts: [] });
      if (ex?.id && ex?.naam) {
        const meshes = [];
        node.traverse((m) => {
          if (m.isMesh) {
            m.material = m.material.clone();      // per-part material so highlighting stays local
            m.userData.part = node;
            meshes.push(m);
          }
        });
        parts.push({ node, extras: ex, meshes });
      }
    });

    modelBox = new THREE.Box3().setFromObject(root);      // before decals and back faces are added
    root.traverse((node) => { if (node.userData?.groep === 'romp' && node.userData?.id) hullBox.expandByObject(node); });

    // Aanpassen: zeilnummer, naam en plaats op het boeisel, kleuren per verfzone
    const sails = await dressSails(parts, renderer, asset);
    if (destroyed) return;
    const outerSkin = (id) => parts.find((p) => p.extras.id === id).meshes.find((m) => m.material.name === 'boeisel');
    const hullText = new HullText({ sb: outerSkin('boeisel_sb'), bb: outerSkin('boeisel_bb') }, renderer, root);
    const LETTERING = { naam: { x: 4.6, height: 0.10 }, plaats: { x: 0.78, height: 0.075 } };   // voordek / achterdek
    initCustomize(ui, config, {
      zoneMaterials: collectZoneMaterials(parts),
      setSailNumber: (text) => sails.setNumber(text),
      setHullText: (key, text, color) => hullText.set(key, text, LETTERING[key].x, LETTERING[key].height, color),
    });

    modes = initModes({ parts, tuig: root.getObjectByName('lelievlet').userData.tuig, scene,
                        ui, wrap, config, signal, onResize, engaged, realTarget });
    regions = initRegions({ parts, groups, highlight: SELECT });        // Boeg, Kleed: areas, not parts

    // One choke point for namen.onderdelen: the parts from the model and the ones the viewer built
    // itself (modes.js, flag.js, regions.js) are all in `parts` by now, and every place that shows
    // a name - hover tip, info tile, Onderdelen list, quiz feedback - reads extras.naam.
    for (const p of parts) p.extras.naam = naamVan(config, 'onderdelen', p.extras.id, p.extras.naam);

    for (const p of parts) groups.get(p.extras.groep)?.parts.push(p);   // after initModes: it adds the windvaan
    buildGroupList();
    buildPartList();
    quiz = initQuiz({ parts, scene, select, flyTo,
                      setHighlights, partVisible, closePanel,
                      ui, wrap, config, signal, engaged, realTarget, onDestroy });   // Oefenen
    setView('iso', false);
    $('loading').hidden = true;
    resize();
    controls.update();
    renderer.render(scene, camera);
    settle();
  }, undefined, (error) => { if (!destroyed) stumble(error); });

  function buildGroupList() {
    const list = $('groups');
    for (const [id, g] of groups) {
      const li = document.createElement('li');
      const box = Object.assign(document.createElement('input'), { type: 'checkbox', checked: true, id: `g-${id}` });
      const label = Object.assign(document.createElement('label'), { htmlFor: box.id, textContent: g.title });
      const count = Object.assign(document.createElement('span'), { className: 'count', textContent: g.parts.length });
      box.addEventListener('change', () => { g.node.visible = box.checked; });
      li.append(box, label, count);
      list.append(li);
    }
  }

  // ---------------------------------------------------------------- the parts list ("Onderdelen")
  // One row per distinct name within a group: the boat has four dollen and two zwaardlopers, and
  // picking "Dol" selects all four of them at once. Parts that come as a bakboord and a stuurboord
  // twin share one row as well, under the name without the side; picking it takes one of the two.
  const sections = [];         // { head, ul, count, section, rows[], total, open }
  const rows = [];             // { parts[], twins, button, li, section, key }
  let currentRow = null;
  let partsPoll = null;
  onDestroy(() => clearInterval(partsPoll));

  const setFolded = (entry, open) => { entry.ul.hidden = !open; entry.head.setAttribute('aria-expanded', String(open)); };

  function buildPartList() {
    const list = $('parts-list');
    for (const [id, g] of groups) {
      const byName = new Map();          // row key -> { label, parts[], sides: side -> parts[] }
      for (const p of g.parts) {
        const { base, side } = sideOf(p.extras.naam);
        const key = side ? `side:${base}` : `name:${p.extras.naam}`;   // a twin shares no row with a part of its own
        if (!byName.has(key)) byName.set(key, { label: side ? base : p.extras.naam, parts: [], sides: new Map() });
        const bucket = byName.get(key);
        bucket.parts.push(p);
        if (side) bucket.sides.set(side, [...(bucket.sides.get(side) ?? []), p]);
      }
      if (!byName.size) continue;
      const section = document.createElement('section');
      const head = Object.assign(document.createElement('button'), { type: 'button', className: 'group-head' });
      head.innerHTML = CHEVRON;
      const count = Object.assign(document.createElement('span'), { className: 'count', textContent: String(g.parts.length) });
      head.append(Object.assign(document.createElement('span'), { className: 'title', textContent: g.title }), count);
      head.setAttribute('aria-controls', `parts-${id}`);
      const ul = Object.assign(document.createElement('ul'), { id: `parts-${id}` });
      const entry = { head, ul, count, section, rows: [], total: g.parts.length, open: true };
      setFolded(entry, true);
      head.addEventListener('click', () => { entry.open = !entry.open; setFolded(entry, entry.open); });

      // a name that says a side but has no twin here keeps its own name and stands on its own
      const buckets = [...byName.values()].map((b) => (b.sides.size > 1 ? b : { ...b, label: b.parts[0].extras.naam, sides: new Map() }));
      for (const bucket of buckets.sort((a, b) => a.label.localeCompare(b.label, 'nl'))) {
        const twins = bucket.sides.size > 1 ? [...bucket.sides.values()] : null;
        const li = document.createElement('li');
        const button = Object.assign(document.createElement('button'), { type: 'button', className: 'part' });
        button.append(Object.assign(document.createElement('span'), { className: 'naam', textContent: bucket.label }));
        if (!twins && bucket.parts.length > 1) {      // one row for parts that share a name, with how many there are
          button.append(Object.assign(document.createElement('span'), { className: 'times', textContent: `×${bucket.parts.length}` }));
        }
        if (bucket.parts[0].extras.gebied) {          // an area on other parts, not a part of its own
          button.append(Object.assign(document.createElement('span'), { className: 'gebied', textContent: 'gebied' }));
        }
        li.append(button);
        ul.append(li);
        // searching on "bakboord" still finds a merged row: its own names are part of what is matched
        const key = fold([bucket.label, ...bucket.parts.map((p) => p.extras.naam)].join(' '));
        const row = { parts: bucket.parts, twins, button, li, section: entry, key };
        button.addEventListener('click', () => { const pick = twins ? pickTwin(row) : row.parts; select(pick); flyTo(pick); });
        entry.rows.push(row); rows.push(row);
      }
      section.append(head, ul);
      list.append(section);
      sections.push(entry);
    }
    $('parts-search').addEventListener('input', filterPartList);
    refreshPartList();
  }

  /** Filter by name, blind to case and to accents. */
  function filterPartList() {
    const query = fold($('parts-search').value.trim());
    let found = 0;
    for (const entry of sections) {
      let shown = 0;
      for (const row of entry.rows) {
        const match = !query || row.key.includes(query);
        row.li.hidden = !match;
        if (match) shown++;
      }
      entry.count.textContent = String(query ? shown : entry.total);
      entry.section.hidden = Boolean(query) && !shown;
      setFolded(entry, query ? true : entry.open);     // a search opens every group that has a hit
      found += shown;
    }
    $('parts-empty').hidden = found > 0;
  }

  // a gebied lies on other parts: it is there when they are, its own overlay being hidden until it is picked
  const partVisible = (p) => p.node.parent.visible && (p.sources ?? p.meshes).some((m) => m.visible);

  const twinBox = new THREE.Box3();

  /**
   * Which of the twins a click on their shared row means: the one on the side the camera is looking
   * from (model space: z > 0 is starboard), else the one nearest to it, and never one that is away in
   * this mode. Clicking while that twin is the selection hands over the other one, so reaching the far
   * side costs no orbit.
   */
  function pickTwin(row) {
    const centre = new THREE.Vector3();
    const state = row.twins.map((list) => {
      const empty = worldBox(list, twinBox).isEmpty();        // as the parts stand right now, like the flight
      if (!empty) twinBox.getCenter(centre);
      return { parts: list, there: !empty && list.some(partVisible),
               z: empty ? 0 : centre.z, dist: empty ? Infinity : centre.distanceTo(camera.position) };
    });
    const current = state.find((s) => s.parts.includes(selected[0]));
    const away = current && state.find((s) => s !== current && s.there);
    if (away) return away.parts;
    const shown = state.filter((s) => s.there);
    if (!shown.length) return row.parts;                       // none of them is there; the row is disabled anyway
    const z = camera.position.z;
    const facing = Math.abs(z) > CENTRE_PLANE ? shown.find((s) => Math.sign(s.z) === Math.sign(z)) : null;
    return (facing ?? shown.reduce((a, b) => (b.dist < a.dist ? b : a))).parts;
  }

  /** What is not there in this mode (the sails while rowing, the vlag while wrikken) cannot be picked. */
  function refreshPartList() {
    for (const row of rows) {
      const there = row.parts.some(partVisible);
      row.button.disabled = !there;
      if (there) row.button.removeAttribute('title');
      else row.button.title = 'Niet zichtbaar in deze modus';
    }
  }

  /** Mark the row of a part as the current one, and bring it into view if the list is open. */
  function markRow(part) {
    const row = part ? rows.find((r) => r.parts.includes(part)) : null;
    currentRow?.button.removeAttribute('aria-current');
    currentRow = row;
    if (!row) return;
    row.button.setAttribute('aria-current', 'true');
    if ($('parts').hidden) return;
    if (!row.section.open) { row.section.open = true; setFolded(row.section, true); }
    row.button.scrollIntoView({ block: 'nearest' });
  }

  /** The list only follows the mode while it is open, so a cheap poll is enough. */
  function partsPanelToggled(open) {
    clearInterval(partsPoll);
    partsPoll = null;
    if (!open || !rows.length) return;
    refreshPartList();
    markRow(selected[0] ?? null);
    partsPoll = setInterval(refreshPartList, 400);
  }

  // ---------------------------------------------------------------- camera views
  function setView(name, animate = true) {
    const center = modelBox.getCenter(new THREE.Vector3());
    const size = modelBox.getSize(new THREE.Vector3());
    const radius = size.length() / 2;
    const dist = radius / Math.sin(THREE.MathUtils.degToRad(camera.fov / 2)) * 0.82;
    const dir = {
      iso: new THREE.Vector3(-0.55, 0.35, 0.78),
      side: new THREE.Vector3(0, 0, 1),
      top: new THREE.Vector3(0, 1, 0.0001),
      bow: new THREE.Vector3(1, 0.08, 0),
      stern: new THREE.Vector3(-1, 0.08, 0),
    }[name].normalize();
    const target = center.clone();
    const position = center.clone().addScaledVector(dir, dist);
    if (!animate) {
      flight = null;
      camera.position.copy(position); controls.target.copy(target); controls.update();
      return;
    }
    startFlight(position, target, 600);
  }
  $('views').addEventListener('click', (e) => {
    const view = e.target.dataset?.view;
    if (view) setView(view);
  });

  // ---------------------------------------------------------------- picking
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hoverTip = $('hover');
  let lastHit = null;

  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    // the overlay of a gebied is no target: a click on the boeg has to keep picking Boeisel, Vlak, ...
    const visible = parts.filter((p) => !p.extras.gebied && p.node.parent.visible)
      .flatMap((p) => p.meshes).filter((m) => m.visible);
    const hit = raycaster.intersectObjects(visible, false)[0];
    lastHit = hit ?? null;
    return hit ? parts.find((p) => p.node === hit.object.userData.part) : null;
  }

  function paint(part, color) {
    if (part.extras.gebied) {              // a gebied is not tinted: its overlay IS the highlight
      for (const m of part.meshes) m.visible = Boolean(color);
      return;
    }
    const through = Boolean(color) && part.xray === true && color === SELECT;
    for (const m of part.meshes) {
      m.material.emissive.copy(color ?? new THREE.Color(0));
      m.material.emissiveIntensity = color ? 0.55 : 0;
      m.material.depthTest = !through; m.renderOrder = through ? 30 : 0;   // seen through the boat, see flyTo
    }
  }

  function refreshHighlight() {
    // Two passes: a few parts built in the viewer share a material (every live rope has the grootschoot's,
    // the knop of the vlaggenstok the roerkop's bakskleur), and clearing the one would put out the other.
    const lit = (p) => override.get(p) ?? (selected.includes(p) ? SELECT : p === hovered ? HOVER : null);
    locator.release();                        // the pulse hands the materials back before they are painted
    for (const p of parts) if (!lit(p)) paint(p, null);
    for (const p of parts) if (lit(p)) paint(p, lit(p));
    locator.setTargets(pulsed());
  }

  /**
   * What breathes, and what a locator ring may be drawn around: the selection and the colours the
   * quiz lights parts in, one group per colour - never the hover, which stays calm and instant.
   */
  function pulsed() {
    const groups = new Map();
    const add = (key, part, color) => {
      const group = groups.get(key) ?? { parts: [], color };
      group.parts.push(part);
      group.color = color;                    // a chip of the quiz lets its colour glow: take the newest
      groups.set(key, group);
    };
    for (const [part, color] of override) add(color.getHexString(), part, color);
    for (const p of selected) if (!override.has(p)) add('selectie', p, SELECT);
    return [...groups.values()];
  }

  // A ring points at a part, so it is asked per frame - not once per highlight - whether the quiz
  // allows one: finding the part IS the question in Aanwijzen and Kies, until the answer is in.
  const locator = initLocator({ wrap, canvas, camera, visible: partVisible,
                                rings: () => quiz?.rings() ?? true, signal, onResize, onDestroy });

  /** A colour per part for the quiz, over the selection and the hover; an empty list gives them back. */
  function setHighlights(list = []) {
    override.clear();
    for (const [part, color] of list) override.set(part, color);
    refreshHighlight();
  }

  /**
   * Select one part, or the parts a row of the list stands for; fills the info tile and marks the
   * row. `hit` is the raycast that did it, if there was one: it names the CAD body that was clicked.
   */
  function select(list, hit = null) {
    for (const p of parts) p.xray = false;
    selected = list;
    modes?.reveal(list);                           // something in the bakskist: its lid opens
    refreshHighlight();
    markRow(list[0] ?? null);
    const info = $('info');
    info.hidden = !list.length;
    if (!list.length) return;
    const ex = list[0].extras;
    $('info-group').textContent = groups.get(ex.groep)?.title ?? '';
    $('info-name').textContent = ex.naam;
    const note = $('info-note');
    note.hidden = !ex.gebied;                                          // a region has no model number either
    note.textContent = ex.gebied ? 'Gebied, geen los onderdeel' : '';
    // The CAD body that was clicked; a part merged from several bodies lists the rest in the tooltip.
    // It is a debugging aid and nothing a scout needs, so it only shows with debug.modelnummer on.
    const handle = config.debug.modelnummer ? handleAt(hit) : null;
    const model = $('info-model');
    model.hidden = !handle;
    if (handle) {
      const rest = (ex.handles ?? []).filter((other) => other !== handle);
      const more = $('info-more');
      $('info-handle').textContent = handle;
      more.textContent = rest.length ? `+${rest.length}` : '';
      more.title = rest.join(' ');
    }
  }

  canvas.addEventListener('pointermove', (e) => {
    if (e.buttons) return;                       // orbiting
    hovered = pick(e);
    refreshHighlight();
    hoverTip.hidden = !hovered;
    if (hovered) {
      const box = wrap.getBoundingClientRect();  // the tip is placed inside the viewer, not the window
      hoverTip.textContent = hovered.extras.naam;
      hoverTip.style.left = `${e.clientX - box.left}px`; hoverTip.style.top = `${e.clientY - box.top}px`;
    }
    canvas.style.cursor = hovered ? 'pointer' : 'grab';
  });
  canvas.addEventListener('pointerleave', () => { hovered = null; hoverTip.hidden = true; refreshHighlight(); });

  let downAt = null;
  canvas.addEventListener('pointerdown', (e) => { downAt = [e.clientX, e.clientY]; });
  canvas.addEventListener('pointerup', (e) => {
    if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 4) return;   // was a drag
    const part = pick(e);
    if (quiz?.click(part, lastHit)) return;        // a question is open: the click is an answer, nothing else
    select(part ? [part] : [], lastHit);           // clicking the model picks the one part, not its namesakes
    modes?.click(part, lastHit);                   // a dol, the mik, an oar, ... is also shifted by it
  });

  // Steering: a drag that starts on the helmstok moves the rudder instead of the camera. It listens in
  // the capture phase and keeps the event to itself, so OrbitControls never sees that press.
  const helmRay = new THREE.Raycaster();
  let steering = false;
  const steer = (e) => {
    const box = canvas.getBoundingClientRect();
    helmRay.setFromCamera(new THREE.Vector2(((e.clientX - box.left) / box.width) * 2 - 1, -((e.clientY - box.top) / box.height) * 2 + 1), camera);
    modes.helm.steer(helmRay.ray);
  };
  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || !modes?.helm.grab(pick(e))) return;
    e.stopImmediatePropagation();
    steering = true; downAt = null;
    canvas.setPointerCapture(e.pointerId);
    canvas.style.cursor = 'grabbing';
  }, { capture: true });
  canvas.addEventListener('pointermove', (e) => { if (steering) { e.stopImmediatePropagation(); steer(e); } }, { capture: true });
  for (const type of ['pointerup', 'pointercancel']) {
    canvas.addEventListener(type, (e) => {
      if (!steering) return;
      e.stopImmediatePropagation();
      steering = false; modes.helm.release();
      canvas.releasePointerCapture(e.pointerId);
      canvas.style.cursor = 'grab';
    }, { capture: true });
  }

  // ---------------------------------------------------------------- flying to a part
  // A row of the parts list puts its part in view: the camera closes in on the bounding sphere of
  // the part as it stands right now, from a direction that has as little as possible in front of it.
  const probe = new THREE.Raycaster();
  const partBox = new THREE.Box3();
  const meshBox = new THREE.Box3();
  let flight = null;

  controls.addEventListener('start', () => { flight = null; });        // the user takes the controls

  /**
   * World box of what the part looks like now. Meshes are moved through position/quaternion and the
   * sails have their vertices rewritten per frame, so it is measured vertex by vertex: the cached
   * geometry box would be stale, and computing one would break picking of the same geometry.
   */
  function worldBox(list, out) {
    scene.updateMatrixWorld();
    out.makeEmpty();
    for (const p of list) {
      if (p.box) { out.union(p.box(meshBox)); continue; }   // a gebied measures the triangles it covers itself
      for (const m of p.meshes) if (m.visible) out.union(meshBox.setFromObject(m, true));
    }
    return out;
  }

  /** How many of the sample points of the part are free of other parts, seen from `origin`. */
  const hits = [];
  function countVisible(origin, points, occluders, upTo) {
    const to = new THREE.Vector3();
    let seen = 0;
    for (let i = 0; i < points.length; i++) {
      if (seen + (points.length - i) <= upTo) break;         // cannot beat the best any more
      to.copy(points[i]).sub(origin);
      const far = to.length();
      probe.set(origin, to.divideScalar(far));
      probe.far = far - 0.005;                               // stop just short of the part itself
      let blocked = false;                                   // any hit will do: no need to find and sort them all
      for (const mesh of occluders) {
        hits.length = 0; mesh.raycast(probe, hits);
        if (hits.length) { blocked = true; break; }
      }
      if (!blocked) seen++;
    }
    return seen;
  }

  function flyTo(list) {
    const box = worldBox(list, partBox);
    if (box.isEmpty()) return;
    const centre = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const radius = Math.max(size.length() / 2, 0.02);
    // the narrower of the two openings of the frustum: a wide part in a narrow window needs the width
    const half = THREE.MathUtils.degToRad(camera.fov / 2);
    const opening = Math.min(half, Math.atan(Math.tan(half) * camera.aspect));
    const dist = THREE.MathUtils.clamp(radius / Math.sin(opening) * MARGIN, controls.minDistance, controls.maxDistance);

    const points = SAMPLES.map(([x, y, z]) => new THREE.Vector3(centre.x + x * size.x * 0.35,
      centre.y + y * size.y * 0.35, centre.z + z * size.z * 0.35));
    const occluders = parts.filter((p) => !list.includes(p) && p.node.parent.visible)
      .flatMap((p) => p.meshes).filter((m) => m.visible);    // the water and the wind arrow are no parts
    const candidates = [camera.position.clone().sub(controls.target).normalize()];   // ties keep the camera where it is
    for (const elevation of ELEVATIONS) {
      const e = THREE.MathUtils.degToRad(elevation);
      for (let i = 0; i < AZIMUTHS; i++) {
        const a = (i / AZIMUTHS) * 2 * Math.PI;
        candidates.push(new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)));
      }
    }

    const origin = new THREE.Vector3();
    const deadline = performance.now() + SEARCH_MS;
    let best = candidates[0]; let bestScore = -Infinity; let bestSeen = 0; let bestAway = dist;
    const to0 = new THREE.Vector3();
    for (const dir of candidates) {
      // From inside the boat there is nothing to see: a view that would stand inside the hull is
      // backed out along its own line until it is clear of it (what is then in the way decides
      // whether the part has to be shown through the boat). From above reads better than from below.
      let away = dist;
      if (hullBox.containsPoint(origin.copy(centre).addScaledVector(dir, away))) {
        probe.set(origin, dir); probe.far = Infinity;        // from the viewpoint, which IS inside: the way out
        const exit = probe.ray.intersectBox(hullBox, to0);   // (the part itself may lie under the hull, like the zwaardbout)
        away = exit ? dist + origin.distanceTo(exit) + 0.35 : dist;
      }
      away = Math.min(away, controls.maxDistance);
      origin.copy(centre).addScaledVector(dir, away);
      const bonus = 0.3 * dir.y - (away > 2.2 ? 1 : 0);   // backing out along the length of the boat ends up too far off
      const seen = countVisible(origin, points, occluders, bestScore - bonus);
      const score = bonus + seen;
      if (score > bestScore) { bestScore = score; best = dir; bestSeen = seen; bestAway = away; }
      if (performance.now() > deadline) break;
    }
    // Some parts cannot be seen from anywhere (the zwaardbout inside the zwaardkast): those are drawn
    // through whatever is in front of them for as long as they are selected.
    for (const p of list) p.xray = bestSeen < XRAY_BELOW;
    refreshHighlight();
    startFlight(centre.clone().addScaledVector(best, bestAway), centre);
  }

  /** Camera and target travel together; a new flight, a drag or a zoom replaces this one. */
  function startFlight(position, target, ms = FLIGHT_MS) {
    flight = { from: camera.position.clone(), fromTarget: controls.target.clone(),
               to: position, toTarget: target, start: performance.now(), ms };
  }

  /** One step of the flight, before controls.update() so the controls see where the camera is. */
  function stepFlight() {
    if (!flight) return;
    const t = Math.min(1, (performance.now() - flight.start) / flight.ms);
    const k = t * t * (3 - 2 * t);                           // ease in, ease out
    camera.position.lerpVectors(flight.from, flight.to, k);
    controls.target.lerpVectors(flight.fromTarget, flight.toTarget, k);
    if (t >= 1) flight = null;
  }

  // ---------------------------------------------------------------- keyboard navigation
  // Arrows move the viewpoint, Shift + arrows orbit around the boat, + / - zoom. Applied per frame
  // while held - and only while this viewer has the pointer or the focus, so the page it is embedded
  // in keeps its own arrow keys.
  const held = new Set();
  window.addEventListener('keydown', (e) => {
    // the search field and the rows of the parts list keep their arrow keys to themselves
    if (!engaged() || !NAV_KEYS.has(e.key)) return;
    if (realTarget(e).closest?.('input:not([type=checkbox]), textarea, select, #parts')) return;
    held.add(e.key);
    e.preventDefault();
  }, { signal });
  window.addEventListener('keyup', (e) => held.delete(e.key), { signal });
  window.addEventListener('blur', () => held.clear(), { signal });
  host.addEventListener('pointerleave', () => held.clear(), { signal });

  const spherical = new THREE.Spherical();
  const offset = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3();
  let shiftDown = false;
  window.addEventListener('keydown', (e) => { shiftDown = e.shiftKey; }, { signal });
  window.addEventListener('keyup', (e) => { shiftDown = e.shiftKey; }, { signal });

  function keyboardNavigate(dt) {
    if (!held.size) return;
    const x = (held.has('ArrowRight') ? 1 : 0) - (held.has('ArrowLeft') ? 1 : 0);
    const y = (held.has('ArrowUp') ? 1 : 0) - (held.has('ArrowDown') ? 1 : 0);
    const zoom = (held.has('+') || held.has('=') ? 1 : 0) - (held.has('-') || held.has('_') ? 1 : 0);
    offset.copy(camera.position).sub(controls.target);
    if ((x || y) && !shiftDown) {                               // arrows move the viewpoint
      const speed = offset.length() * 0.6 * dt;                 // speed scales with the viewing distance
      right.setFromMatrixColumn(camera.matrix, 0); up.setFromMatrixColumn(camera.matrix, 1);
      const move = right.multiplyScalar(x * speed).addScaledVector(up, y * speed);
      camera.position.add(move); controls.target.add(move);
    }
    if (zoom || ((x || y) && shiftDown)) {                      // Shift + arrows orbit; + / - zoom
      spherical.setFromVector3(offset);
      if (shiftDown && !zoom) {
        spherical.theta += x * 1.4 * dt;
        spherical.phi = THREE.MathUtils.clamp(spherical.phi - y * 1.0 * dt, 0.05, Math.PI - 0.05);
      }
      spherical.radius = THREE.MathUtils.clamp(spherical.radius * Math.exp(-zoom * 1.2 * dt), controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(offset.setFromSpherical(spherical));
    }
  }

  // ---------------------------------------------------------------- progress bar of the running procedure
  // Reven and Tuig are timelines (see procedure.js): this bar follows the one last set going, steps
  // through it and scrubs it. It hangs above the control bar and is lifted over an open popover, so
  // the bar and the popover never cover each other.
  const procBar = $('procedure');
  const procTime = $('procedure-time');
  const procStep = $('procedure-step');
  const procName = $('procedure-name');
  const procTicks = $('procedure-ticks');
  const procPlay = $('procedure-play');
  const procIcons = procPlay.querySelectorAll('[data-icon]');
  let procShape = '';                    // the procedure the ticks and the range of the slider were built for
  let procWoke = 0;                      // when it was last wanted; it fades REST_MS after that
  let procDragging = false;              // the user has the thumb: playback writes no value
  let procPlaying = null;                // what the play/pause button is drawing

  procPlay.addEventListener('click', () => {
    const p = modes?.procedure();
    if (p) modes.procedureControl[p.playing ? 'pause' : 'play']();
  });
  $('procedure-previous').addEventListener('click', () => modes?.procedureControl.previous());
  $('procedure-next').addEventListener('click', () => modes?.procedureControl.next());

  // Dragging the thumb scrubs, which pauses; on release it stays where it was let go and the user
  // presses play to go on. Arrow keys on the focused slider come through the same input event, so the
  // value written per frame is only ever the one the user just set.
  procTime.addEventListener('input', () => modes?.procedureControl.scrub(Number(procTime.value)));
  procTime.addEventListener('pointerdown', () => { procDragging = true; });
  procTime.addEventListener('change', () => { procDragging = false; });
  for (const type of ['pointerup', 'pointercancel']) {
    window.addEventListener(type, () => { procDragging = false; }, { signal });
  }
  // the press stays here: the control bar closes its popover on a pointerdown outside it, and the
  // panel of the procedure is what keeps this bar in view while it is scrubbed
  procBar.addEventListener('pointerdown', (e) => e.stopPropagation());

  /** How far up an open popover reaches: the wind panel hangs its course markers above its own box. */
  function popoverTop(panel) {
    let top = panel.getBoundingClientRect().top;
    for (const child of panel.children) top = Math.min(top, child.getBoundingClientRect().top);
    return top;
  }

  /** The bar rides above the open popover; the info tile in turn steps over the bar. */
  function placeProcedureBar() {
    const panel = ui.querySelector('#controls .popover:not([hidden])');
    // the popovers stand on the same foot as the bar, so their reach is all the lift it needs
    const lift = panel ? panel.getBoundingClientRect().bottom - popoverTop(panel) + PROC_GAP : 0;
    wrap.style.setProperty('--procedure-lift', `${lift}px`);
    if (procBar.hidden) return;
    const top = wrap.getBoundingClientRect().bottom - procBar.getBoundingClientRect().top;
    wrap.style.setProperty('--procedure-top', `${top + PROC_GAP}px`);
  }
  // a hidden panel measures 0, so this reports the popovers opening, closing and changing height
  const procRoom = new ResizeObserver(placeProcedureBar);
  for (const panel of ui.querySelectorAll('#controls .popover')) procRoom.observe(panel);
  procRoom.observe(procBar);
  onResize(placeProcedureBar);
  onDestroy(() => procRoom.disconnect());

  /** Per frame: fill the bar with where the procedure stands, and decide whether it is in view. */
  function stepProcedureBar() {
    const p = modes?.procedure() ?? null;
    if (!p) { procBar.hidden = true; wrap.classList.remove('procedure-open'); return; }
    procBar.hidden = false;
    const shape = [p.name, ...p.steps.map((s) => s.end)].join(' ');
    if (shape !== procShape) {                            // another procedure, or the same one anew
      procShape = shape;
      procTime.max = String(p.total);
      procTicks.replaceChildren(...p.steps.map((s) => {   // one tick per step boundary
        const tick = document.createElement('span');
        tick.style.left = `${(s.end / p.total) * 100}%`;
        return tick;
      }));
    }
    if (!procDragging) procTime.value = String(p.t);
    const index = p.steps.findIndex((s) => p.t < s.end - 1e-6);        // the step the label is about
    const at = index < 0 ? p.steps.length : index + 1;
    const step = p.steps.length ? `${at}/${p.steps.length}  ${p.label}` : p.label;
    if (procStep.textContent !== step) procStep.textContent = step;
    if (procName.textContent !== p.name) procName.textContent = p.name;
    if (procPlaying !== p.playing) {
      procPlaying = p.playing;
      for (const icon of procIcons) icon.hidden = (icon.dataset.icon === 'pause') !== p.playing;
      procPlay.setAttribute('aria-label', p.playing ? 'Pauzeren' : 'Afspelen');
      procPlay.title = procPlay.getAttribute('aria-label');
    }

    // it stays while it runs or stands still half way, while its own popover is open - so a finished
    // procedure can be scrubbed back through - and while it is hovered or has the focus
    const panel = $(p.name === 'Reven' ? 'reef-panel' : 'rig-panel');
    const now = performance.now();
    if (!p.resting || !panel.hidden || procBar.matches(':hover, :focus-within')) procWoke = now;
    const show = now - procWoke < REST_MS;
    procBar.classList.toggle('faded', !show);
    wrap.classList.toggle('procedure-open', show);
  }

  // ---------------------------------------------------------------- loop
  function resize() {
    const rect = wrap.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));   // full screen can move us to another display
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    wrap.style.setProperty('--lv-height', `${h}px`);   // the popovers cap themselves against it
    for (const fn of onResizeFns) fn();
  }
  const sizeWatch = new ResizeObserver(() => resize());
  sizeWatch.observe(wrap);
  onDestroy(() => sizeWatch.disconnect());
  resize();

  const clock = new THREE.Clock();
  let elapsed = 0;                 // ms since the first frame; the pulse and the rings beat on it
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt * 1000;
    keyboardNavigate(dt);
    modes?.update(dt);
    stepProcedureBar();
    stepFlight();
    controls.update();
    renderer.render(scene, camera);
    // after the render: every matrix stands where this frame drew it, so a ring lands on the part
    locator.update(elapsed, dt * 1000);
  });

  /** Everything this viewer holds on to, given back: listeners, timers, the GPU. */
  function destroy() {
    if (destroyed) return;
    destroyed = true;
    renderer.setAnimationLoop(null);
    controller.abort();
    for (const fn of disposers.reverse()) {
      try { fn(); } catch (error) { console.warn('[lelievlet] opruimen:', error); }
    }
    disposeTree(scene);
    environment.dispose();
    pmrem.dispose();
    controls.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
    ui.replaceChildren();
  }

  const debug = { camera, controls, scene, parts, rows, held, keyboardNavigate, select, flyTo,
                  sideOf, pickTwin, config,
                  get modes() { return modes; }, get regions() { return regions; },
                  get quiz() { return quiz; },
                  get flight() { return flight; }, get hullBox() { return hullBox; } };

  return { ready, destroy, debug, fullscreen: fullscreen.toggle };
}

// ---------------------------------------------------------------- shared, and never written to
const CHEVRON = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const CENTRE_PLANE = 0.03;   // m: nearer the centre plane of the boat than this and the camera picks no side
const AZIMUTHS = 8;
// Candidate directions; the one we are looking from is added. The steep ones are there for what lies
// down in the boat (mastkoker, zwaardloper): that can only be seen from above, through the open kuip.
const ELEVATIONS = [40, 65, 15, 85];
const SAMPLES = [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const MARGIN = 1.6;                    // room left around the part
const FLIGHT_MS = 700;
const SEARCH_MS = 250;                 // the search for a direction never holds up a click for long
const XRAY_BELOW = 3;                  // fewer sample points in view than this: show the part through the boat
const REST_MS = 2500;                  // how long a procedure that is done stays in view
const PROC_GAP = 8;                    // the same air the popovers leave above the control bar
const NAV_KEYS = new Set(['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', '+', '=', '-', '_']);

export const fold = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

// The two ways a name carries its side: as a suffix, "Wantputting (bakboord)", or as a prefix,
// "Bakboord want". Anything else is no twin and keeps its own name - "Voorstag met spanner" and
// "Achterlijk grootzeil" name no side, and "Dol" is one name for four parts that are not a pair.
const SIDES = { bakboord: 'bb', stuurboord: 'sb' };
function sideOf(naam) {
  const suffix = naam.match(/^(.+?) \((bakboord|stuurboord)\)$/);
  if (suffix) return { base: suffix[1], side: SIDES[suffix[2]] };
  const prefix = naam.match(/^(Bakboord|Stuurboord) (.+)$/);
  if (prefix) return { base: prefix[2][0].toUpperCase() + prefix[2].slice(1), side: SIDES[prefix[1].toLowerCase()] };
  return { base: naam, side: null };
}

// Every vertex from the CAD carries the handle of the body it came from (_BODY), as the float value
// of the hexadecimal handle. Geometry built in the viewer has no such attribute, or a handle of 0.
function handleAt(hit) {
  const attr = hit?.object?.geometry?.attributes?._body;
  const value = attr && hit.face ? Math.round(attr.getX(hit.face.a)) : 0;
  return value ? value.toString(16).toUpperCase().padStart(4, '0') : null;
}

/** Give back every geometry, material and texture hanging under a node, each one once. */
function disposeTree(root) {
  const geometries = new Set(); const materials = new Set();
  root.traverse((node) => {
    if (node.geometry) geometries.add(node.geometry);
    for (const m of [node.material].flat()) if (m) materials.add(m);
  });
  for (const g of geometries) g.dispose();
  for (const m of materials) {
    for (const value of Object.values(m)) if (value?.isTexture) value.dispose();
    m.dispose();
  }
  root.clear();
}
