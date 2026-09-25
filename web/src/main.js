import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { dressSails, loadImage } from './sails.js';
import { HullText } from './hulltext.js';
import { initCustomize, initCustomizePanel, collectZoneMaterials, initPaint, collectSailMaterials } from './customize.js';
import { initModes } from './modes.js';
import { initRegions } from './regions.js';
import { initQuiz } from './quiz.js';
import { initHandelingen } from './handelingen.js';
import { initLogboek } from './logboek.js';
import { initNight } from './rig.js';
import { initLocator } from './locator.js';
import { initFullscreen } from './fullscreen.js';
import { makeAsset } from './assets.js';
import { naamVan, merge, unpack } from './config.js';
import { addEdges } from './edges.js';
import { packConfig } from './pack.js';

// One viewer, from end to end. Nothing here runs at import time: `mount` is called once per
// embedded viewer with the shadow root it owns, so two of them on one page share no state at all.
// Every id is looked up in that root (`ui`), everything that used to hang on the window or on the
// body hangs on the host element and on the `.lv` wrapper inside it, and every listener outside
// the root is registered with an AbortSignal that destroy() fires.

/**
 * ui:     the ShadowRoot the markup is in
 * host:   the element the shadow root is on; the viewer fills its box
 * config: the resolved configuration (see config.js)
 * Returns { ready, destroy, debug, fullscreen, get, set }.
 */
/** Whether this page runs as an installed app (standalone, not in a browser tab). */
const runsAsApp = () => ['standalone', 'minimal-ui', 'window-controls-overlay'].some((m) => matchMedia(`(display-mode: ${m})`).matches)
  || navigator.standalone === true;                                   // iOS

export function mount(ui, host, config) {
  const wrap = ui.querySelector('.lv');
  const $ = (id) => ui.getElementById(id);
  const asset = makeAsset(config.assets);
  // aanpassen.opslaan false: nothing of this viewer is read from or written to localStorage, in any module
  const opslaan = config.aanpassen?.opslaan !== false;

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
  const logboek = initLogboek(ui, { opslaan });
  // Volledig scherm works from the first frame: it needs nothing of the model
  const fullscreen = initFullscreen({ ui, host, config, signal, engaged, realTarget, onDestroy });

  // panels behind a button: the parts list (the search in the part card), and Over dit model, which
  // has no button of its own but a link at the foot of Aanpassen. Oefenen is a popover of the column.
  const closePanel = new Map();                  // panel id -> close it
  const openPanel = new Map();                   // panel id -> open it
  for (const [button, panel, onToggle] of [['parts-toggle', 'parts', partsPanelToggled],
                                           [null, 'about'], ['toestand-toggle', 'toestand', (open) => toestandToggled(open)],
                                           ['log-toggle', 'logboek']]) {
    const toggle = button && $(button);
    const aside = $(panel);
    const setOpen = (open) => {
      aside.hidden = !open;
      toggle?.setAttribute('aria-expanded', String(open));
      onToggle?.(open);
    };
    closePanel.set(panel, () => setOpen(false));
    openPanel.set(panel, () => setOpen(true));
    toggle?.addEventListener('click', () => setOpen(aside.hidden));
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && engaged()) setOpen(false); }, { signal });
  }
  $('about-close').addEventListener('click', () => closePanel.get('about')());
  // Over dit model: from the foot of Aanpassen, which makes way for it; it stands in the middle
  $('about-open').addEventListener('click', () => { $('customize-close').click(); openPanel.get('about')(); });
  $('toestand-close').addEventListener('click', () => closePanel.get('toestand')());
  $('parts-close').addEventListener('click', () => closePanel.get('parts')());
  $('log-close').addEventListener('click', () => closePanel.get('logboek')());

  const canvas = $('scene');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.9;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = environment;
  scene.environmentIntensity = 0.4;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 200);
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.zoomToCursor = true;          // the wheel zooms towards what is under the pointer
  controls.minDistance = 0.02;           // close enough to read a shackle; see aimAt() for why it stays usable
  const MAX_DISTANCE = 60;                                           // how far out the view goes, but to keep a manoeuvre's track in (keepTrackInView)
  controls.maxDistance = MAX_DISTANCE;

  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(4, 9, 6);
  const hemi = new THREE.HemisphereLight(0xdfefff, 0x6b7785, 0.25);
  scene.add(sun, hemi);

  let sailNumber = ''; let fromNumber = false;
  const MARKED = ['WngdAA==', 'WngaBA=='].map(unpack);
  const followNumber = () => {
    const f = modes?.leechFlag;
    if (f) {
      const want = MARKED.includes(sailNumber);
      if (want && !f.on) { f.set(true); fromNumber = true; } else if (!want && fromNumber) { f.set(false); fromNumber = false; }
    }
    modes?.island?.set(sailNumber === MARKED[0]);
  };
  // Model space: x = transom -> bow, y = up, z = starboard, metres.
  const parts = [];            // { node, extras, meshes[] }
  const groups = new Map();    // groep id -> { title, node, parts[] }
  let modelBox = new THREE.Box3();
  let hullBox = new THREE.Box3();          // the hull alone, without the rig: the camera never stands inside it
  let selected = [];           // several at once: one row of the parts list can stand for four dollen
  let modes = null;
  let paintScheme = null;      // the older paint scheme; see initPaint in customize.js
  let regions = null;
  let quiz = null;
  let handelingen = null;     // a run of an operation, in its own focus mode
  let hovered = null;
  const override = new Map();  // part -> colour: the quiz lights four parts at once, each its own

  const HOVER = new THREE.Color(0x2d8cff);
  const SELECT = new THREE.Color(0xff8a00);

  let settle = null; let stumble = null;
  const ready = new Promise((resolve, reject) => { settle = resolve; stumble = reject; });

  const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);      // the model is meshopt-packed
  loader.load(asset('models/lelievlet.glb'), async (gltf) => {
    if (destroyed) return;
    const root = gltf.scene;
    // the normals come packed in 8 bits (pipeline/build_glb.py); back to floats once, here: the
    // sails, the chains and the blocks work them out again, and a sum does not fit in 8 bits
    root.traverse((m) => {
      const n = m.geometry?.attributes.normal;
      if (!n?.normalized) return;
      const out = new THREE.Float32BufferAttribute(n.count * 3, 3);
      for (let i = 0; i < n.count; i++) out.setXYZ(i, n.getX(i), n.getY(i), n.getZ(i));
      m.geometry.setAttribute('normal', out);
    });
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
    const zoneMaterials = collectZoneMaterials(parts);
    const aanpassen = initCustomize(ui, config, {
      zoneMaterials,
      setSailNumber: (text) => { sails.setNumber(text); sailNumber = text; followNumber(); paintScheme?.setNumber(text); },
      setHullText: (key, text, color) => hullText.set(key, text, LETTERING[key].x, LETTERING[key].height, color),
    });
    // Installeer als app: to the app page on our own site, taking what the user made of the boat with
    // it, where the page shows how to install it. Not offered inside the installed app itself.
    const installItem = $('app-install');
    installItem.hidden = !config.installeren || runsAsApp();
    const installApp = async () => {
      const own = Object.fromEntries(['zeilnummer', 'naam', 'naamKleur', 'plaats', 'plaatsKleur', 'bakskleur', 'kleuren'].map((k) => [k, aanpassen[k]]));
      const page = asset('app.html');
      // in its own tab, not in this page's place, unless this page is the viewer's own and not framed.
      // The tab is opened on the tap itself - later a browser counts it as a popup - and the address
      // follows once the boat is packed (the app page lets go of its opener)
      const here = window.top === window.self && new URL(page, location.href).origin === location.origin;
      const tab = here ? null : window.open('about:blank', '_blank');
      const url = `${page}?installeer#${await packConfig({ aanpassen: own })}`;
      if (here) location.href = url;
      else if (tab) tab.location.href = url;
      else window.open(url, '_blank', 'noopener');
    };
    installItem.addEventListener('click', installApp, { signal });
    // on a phone or tablet it is also an icon in the bottom right-hand corner: that is where an app
    // is wanted, and the settings panel is a long way round
    const installIcon = $('app-install-toggle');
    const touch = matchMedia('(pointer: coarse)');
    const showIcon = () => { installIcon.hidden = !config.installeren || runsAsApp() || !touch.matches; };
    showIcon(); touch.addEventListener('change', showIcon, { signal });
    installIcon.addEventListener('click', installApp, { signal });
    // after initCustomize: it has laid the user's colours on, which is what the paint fades back to
    paintScheme = initPaint({ zoneMaterials, sailMaterials: collectSailMaterials(parts), config: aanpassen, note: logboek.note });
    paintScheme.setNumber(aanpassen.zeilnummer);

    modes = initModes({ parts, tuig: root.getObjectByName('lelievlet').userData.tuig, scene,
                        ui, wrap, config, signal, onResize, engaged, realTarget, note: logboek.note, say });
    regions = initRegions({ parts, groups, highlight: SELECT });        // Boeg, Kleed: areas, not parts

    // One choke point for namen.onderdelen: the parts from the model and the ones the viewer built
    // itself (modes.js, flag.js, regions.js) are all in `parts` by now, and every place that shows
    // a name - hover tip, info tile, Onderdelen list, quiz feedback - reads extras.naam.
    for (const p of parts) p.extras.naam = naamVan(config, 'onderdelen', p.extras.id, p.extras.naam);

    for (const p of parts) groups.get(p.extras.groep)?.parts.push(p);   // after initModes: it adds the windvaan
    buildPartList();
    addEdges(parts);                                         // every part there is by now, the viewer's own too
    quiz = initQuiz({ parts, scene, select, flyTo, setCovered, openLearn: (kind) => openLearn(kind),
                      setHighlights, partVisible, closePanel, opslaan,
                      ui, wrap, config, signal, engaged, realTarget, onDestroy });   // Oefenen
    handelingen = initHandelingen({ ui, wrap, modes, stepProcedure, lookAtProcedure, dismissProcedure, setCovered, opslaan, signal, engaged, realTarget, onDestroy });
    closePanel.set('learn', () => modes.closePopover());    // a round or a run takes the whole screen
    initLearn();
    loaded = true;
    setView('iso', false);
    applyState(merge(config.toestand, early), true);      // what the page asked for, before anyone sees the boat
    early = {};
    $('loading').hidden = true;
    resize();
    controls.update();
    renderer.render(scene, camera);
    settle();
  }, undefined, (error) => { if (!destroyed) stumble(error); });

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
      const entry = { head, ul, count, section, rows: [], total: g.parts.length, open: true, show: null };
      setFolded(entry, true);
      head.addEventListener('click', () => { entry.open = !entry.open; setFolded(entry, entry.open); });
      // beside it, an eye that shows or hides the whole group in the model
      const eye = Object.assign(document.createElement('button'), { type: 'button', className: 'group-eye' });
      eye.innerHTML = EYE;
      const showGroup = (on) => {
        g.node.visible = on;
        eye.setAttribute('aria-pressed', String(!on));
        eye.title = on ? `${g.title} verbergen` : `${g.title} tonen`; eye.setAttribute('aria-label', eye.title);
        section.classList.toggle('verborgen', !on);
      };
      eye.addEventListener('click', () => showGroup(!g.node.visible));
      entry.show = showGroup;
      const headRow = Object.assign(document.createElement('div'), { className: 'group-row' });
      headRow.append(head, eye);

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
      section.append(headRow, ul);
      list.append(section);
      sections.push(entry);
      showGroup(g.node.visible);
    }
    $('parts-search').addEventListener('input', filterPartList);
    // every group at once, shown or hidden, through the same eyes
    $('parts-show-all').addEventListener('click', () => { for (const e of sections) e.show(true); });
    $('parts-hide-all').addEventListener('click', () => { for (const e of sections) e.show(false); });
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
  // how fast what is being done goes - procedures, and what is moved by hand; wind, water and flag keep their own time
  let speed = 1;
  $('speed').addEventListener('input', (e) => { speed = Number(e.target.value) || 1; });

  // ---------------------------------------------------------------- picking
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const hoverTip = $('hover');
  let lastHit = null;

  function pick(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
    raycaster.setFromCamera(pointer, camera);
    const hit = raycaster.intersectObjects(pickable(), false)[0];
    lastHit = hit ?? null;
    return hit ? parts.find((p) => p.node === hit.object.userData.part) : null;
  }
  // the overlay of a gebied is no target: a click on the boeg has to keep picking Boeisel, Vlak, ...
  const pickable = () => parts.filter((p) => !p.extras.gebied && p.node.parent.visible)
    .flatMap((p) => p.meshes).filter((m) => m.visible);

  // OrbitControls zooms and pans by the distance to its target, whatever lies under the pointer: with
  // the target left behind a close-up surface every step shrinks towards nothing at minDistance, and
  // a pan crawls. So when a zoom or a pan starts, the target is put on the line of sight at the depth
  // of what is under the pointer (the camera does not turn): steps then scale with that distance.
  const sight = new THREE.Vector3();
  const aimProbe = new THREE.Raycaster();
  function aimAt(x, y) {
    aimProbe.setFromCamera(pointer.set(x, y), camera);
    const hit = aimProbe.intersectObjects(pickable(), false)[0];
    if (!hit) return;                                          // the sky: keep the target where it is
    camera.getWorldDirection(sight);
    const depth = Math.max(hit.point.sub(camera.position).dot(sight), controls.minDistance * 1.001);
    controls.target.copy(camera.position).addScaledVector(sight, depth);
  }
  const ndc = (e) => {
    const rect = canvas.getBoundingClientRect();
    return [((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1];
  };
  // captured on the wrapper, so the target is in place before OrbitControls on the canvas sees the event.
  // A trackpad sends a stream of wheel events: aim once per gesture, a raycast is ~10 ms.
  let lastWheel = 0;
  wrap.addEventListener('wheel', (e) => {
    if (e.target === canvas && e.timeStamp - lastWheel > 200) aimAt(...ndc(e));
    lastWheel = e.timeStamp;
  }, { capture: true, passive: true, signal });
  wrap.addEventListener('pointerdown', (e) => {                // a pan: right button, or left with a modifier
    if (e.target === canvas && e.pointerType === 'mouse' && (e.button === 2 || (e.button === 0 && (e.ctrlKey || e.metaKey || e.shiftKey)))) aimAt(...ndc(e));
  }, { capture: true, signal });

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
    info.classList.toggle('leeg', !list.length);              // with nothing selected it is only its search button
    if (!list.length) return;
    const ex = list[0].extras;
    $('info-group').textContent = groups.get(ex.groep)?.title ?? '';
    $('info-name').textContent = ex.naam;
    const note = $('info-note');
    note.hidden = !ex.gebied;                                          // a region has no model number either
    note.textContent = ex.gebied ? 'Gebied, geen los onderdeel' : '';
    // The CAD body that was clicked; a part merged from several bodies lists the rest in the tooltip.
    // It is a debugging aid and nothing a scout needs, so it only shows with debug.modelnummer on.
    // A part the pipeline or the viewer made itself (anker, ankerlijn, leuvers) has no CAD body: its id stands in.
    const handle = config.debug.modelnummer ? (handleAt(hit) ?? (ex.handles?.length ? null : ex.id)) : null;
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
    if (handelingen?.active()) return;             // a run of an operation: the boat is looked at, not handled
    const part = pick(e);
    if (quiz?.click(part, lastHit)) return;        // a question is open: the click is an answer, nothing else
    select(part ? [part] : [], lastHit);           // clicking the model picks the one part, not its namesakes
    // nothing in the way: the ray is still set from the pointer, so the water is a place to point at
    modes?.click(part, part ? lastHit : modes.waterHit(raycaster));   // a dol, the mik, an oar, ... is also shifted by it
  });
  // Escape lets go of the selection, as a click on nothing does; a quiz round keeps its own Escape
  window.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || !engaged() || !selected.length || quiz?.active()) return;
    if (realTarget(e).closest?.('input:not([type=checkbox]), textarea, select')) return;
    select([]);
  }, { signal });

  // Steering: a drag that starts on the helmstok moves the rudder instead of the camera. It listens in
  // the capture phase and keeps the event to itself, so OrbitControls never sees that press.
  const helmRay = new THREE.Raycaster();
  let steering = false; let steerFrom = null;      // where the press was: let go there, it was a click
  const steer = (e) => {
    const box = canvas.getBoundingClientRect();
    helmRay.setFromCamera(new THREE.Vector2(((e.clientX - box.left) / box.width) * 2 - 1, -((e.clientY - box.top) / box.height) * 2 + 1), camera);
    modes.helm.steer(helmRay.ray);
  };
  canvas.addEventListener('pointerdown', (e) => {
    // not in a focus mode: a run is looked at, and in a quiz round a click on the helmstok is an answer
    if (e.button !== 0 || handelingen?.active() || quiz?.active() || !modes?.helm.grab(pick(e))) return;
    e.stopImmediatePropagation();
    steering = true; downAt = null; steerFrom = [e.clientX, e.clientY];
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
      if (type === 'pointerup' && Math.hypot(e.clientX - steerFrom[0], e.clientY - steerFrom[1]) <= 4) {
        const part = pick(e);                      // not steered: the helmstok was clicked, like any other part
        if (!quiz?.click(part, lastHit)) select(part ? [part] : [], lastHit);
      }
    }, { capture: true });
  }

  // ---------------------------------------------------------------- flying to a part
  // A row of the parts list puts its part in view: the camera closes in on the bounding sphere of
  // the part as it stands right now, from a direction that has as little as possible in front of it.
  const probe = new THREE.Raycaster();
  const partBox = new THREE.Box3();
  const meshBox = new THREE.Box3();
  let flight = null;

  let handledAt = -Infinity;                                        // when the user last moved the view
  controls.addEventListener('start', () => { flight = null; handledAt = performance.now(); });   // the user takes the controls

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

  /**
   * Returns whether the camera is on its way. `box`: the room to frame, when it is more than where the
   * parts are now (a step of a procedure takes them somewhere); `low`: looked at from the side, the
   * way something being done is best followed, instead of from above - and square onto the plane the
   * movement is in, when the box is flat (the midzwaard swings fore and aft: seen from abeam);
   * `near`: stay on the side of the boat the camera is on (the boat is near enough symmetric that
   * what is seen from one side is seen from the other); `ms`: how long the flight takes.
   */
  function flyTo(list, { box = worldBox(list, partBox), low = false, near = false, ms = FLIGHT_MS } = {}) {
    if (box.isEmpty()) return false;
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
    for (const elevation of low ? LOW_ELEVATIONS : ELEVATIONS) {
      const e = THREE.MathUtils.degToRad(elevation);
      for (let i = 0; i < AZIMUTHS; i++) {
        const a = (i / AZIMUTHS) * 2 * Math.PI;
        candidates.push(new THREE.Vector3(Math.cos(a) * Math.cos(e), Math.sin(e), Math.sin(a) * Math.cos(e)));
      }
    }

    const origin = new THREE.Vector3();
    const deadline = performance.now() + SEARCH_MS;
    // the thinnest side of the box, and how flat it is: 1 for a sheet, 0 for a cube
    const extents = [size.x, size.y, size.z];
    const thin = extents.indexOf(Math.min(...extents));
    const flat = 1 - extents[thin] / Math.max(Math.max(...extents.filter((_, i) => i !== thin)), 1e-6);
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
      const lift = low ? -0.6 * Math.abs(dir.y - LOW_Y) + SQUARE_ON * flat * Math.abs(dir.getComponent(thin)) : 0.3 * dir.y;
      const bonus = lift - (away > Math.max(2.2, dist * 1.3) ? 1 : 0);   // backing out along the length of the boat ends up too far off
      const seen = countVisible(origin, points, occluders, bestScore - bonus);
      const score = bonus + seen;
      if (score > bestScore) { bestScore = score; best = dir; bestSeen = seen; bestAway = away; }
      if (performance.now() > deadline) break;
    }
    // Some parts cannot be seen from anywhere (the zwaardbout inside the zwaardkast): those are drawn
    // through whatever is in front of them for as long as they are selected.
    for (const p of list) p.xray = bestSeen < XRAY_BELOW;
    refreshHighlight();
    if (near && best.z * (camera.position.z - centre.z) < 0) best = best.clone().setZ(-best.z);
    startFlight(centre.clone().addScaledVector(best, bestAway), centre, ms);
    return true;
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
  // in keeps its own arrow keys. A held key is kept by its physical key (e.code), not by the character
  // it gives: Shift + = gives '+' but, with Shift let go first, a keyup for '='; what it does is
  // settled on the way down, by the character where it is known, so + and - work on any layout.
  const held = new Map();                                       // e.code -> 'left' | 'right' | 'up' | 'down' | 'in' | 'out'
  window.addEventListener('keydown', (e) => {
    // the search field and the rows of the parts list keep their arrow keys to themselves
    const action = NAV_KEYS.get(e.key) ?? NAV_CODES.get(e.code);
    if (!engaged() || !action) return;
    if (realTarget(e).closest?.('input:not([type=checkbox]), textarea, select, #parts')) return;
    if (!held.size) aimAt(0, 0);                                // moves and zooms go by what is in the middle
    held.set(e.code || e.key, action);
    e.preventDefault();
  }, { signal });
  window.addEventListener('keyup', (e) => held.delete(e.code || e.key), { signal });
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
    const on = new Set(held.values());
    const x = (on.has('right') ? 1 : 0) - (on.has('left') ? 1 : 0);
    const y = (on.has('up') ? 1 : 0) - (on.has('down') ? 1 : 0);
    const zoom = (on.has('in') ? 1 : 0) - (on.has('out') ? 1 : 0);
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
  // through it and scrubs it. It stands at the foot of the viewer, in the middle; while a run of an
  // operation is watched it is in the card instead (handelingen.js), and while one is practised it is
  // not there at all: the questions are the steps.
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
  let procDismissed = null;              // the shape of the procedure whose card was closed: it stays away
  let procWasPlaying = false;            // ... until it, or another one, is started afresh
  const shapeOf = (p) => [p.name, ...p.steps.map((s) => `${s.end}${s.skipped ? 'x' : ''}`)].join(' ');
  /** The card of a run closed (handelingen.js): its bar goes at once, not after lingering. */
  function dismissProcedure() {
    const p = modes?.procedure();
    if (!p) return;
    procDismissed = shapeOf(p); procWasPlaying = p.playing;
    procBar.hidden = true; wrap.classList.remove('procedure-open');
  }
  const procBand = Object.assign(document.createElement('span'), { className: 'band' });   // the step it is on

  procPlay.addEventListener('click', () => {
    stepsQueued = 0;
    const p = modes?.procedure();
    if (p) modes.procedureControl[p.playing ? 'pause' : 'play']();
  });
  // A step on its own is shown: the camera first goes to the parts it is about - all the room they
  // take up while it plays, from the side - and then it plays.
  const stepBox = new THREE.Box3();
  function stepProcedure(direction) {
    const focus = modes?.procedureControl.focus(direction);
    const view = modes?.procedureControl.camera(direction);
    let flying = false;
    if (view) flying = flyToView(view, direction);
    else if (focus?.length) {
      const span = new THREE.Box3();
      modes.procedureControl.across(direction, () => span.union(worldBox(focus, stepBox)));
      flying = !span.isEmpty() && flyTo(focus, { box: span, low: true, near: true, ms: STEP_FLIGHT_MS });
      // what cannot be seen from anywhere (the midzwaard going up into its kast) is selected for the
      // step: lit, and drawn through the boat
      if (flying && focus.some((p) => p.xray)) { select(focus); for (const p of focus) p.xray = true; refreshHighlight(); }
    }
    modes?.procedureControl.step(direction, flying ? STEP_FLIGHT_MS / 1000 : 0);
  }
  /**
   * A step that says where it is looked at from. The boat is near enough symmetric that the view
   * also serves mirrored: it is taken on the side nearer to the camera, or with kant 'zonder fok' on
   * the side the fok is not on as the step ends, so it does not hang in the way; with kant 'vast'
   * it is taken as it is.
   */
  function flyToView({ positie, doel, kant }, direction) {
    const position = new THREE.Vector3(...positie); const target = new THREE.Vector3(...doel);
    const mirrored = (v) => v.clone().setZ(-v.z);
    let flip = null;
    const fok = kant === 'zonder fok' ? parts.find((p) => p.extras.id === 'fok') : null;
    if (fok) {
      const span = new THREE.Box3();
      modes.procedureControl.across(direction, () => span.union(worldBox([fok], stepBox)));
      const z = span.isEmpty() ? 0 : span.getCenter(new THREE.Vector3()).z;
      if (Math.abs(z) > 0.02) flip = Math.sign(position.z) === Math.sign(z);
    }
    if (kant === 'vast') flip = false;                  // only right from its own side
    flip ??= camera.position.distanceTo(mirrored(position)) < camera.position.distanceTo(position);
    const to = flip ? mirrored(position) : position; const look = flip ? mirrored(target) : target;
    if (camera.position.distanceTo(to) < 0.05 && controls.target.distanceTo(look) < 0.05) return false;   // there already: nothing to wait for
    startFlight(to, look, STEP_FLIGHT_MS);
    return true;
  }
  /** A run starting: the camera goes to where the procedure as a whole is watched from, if it says. */
  function lookAtProcedure() {
    const view = modes?.procedureControl.view();
    if (view) flyToView(view, 1);
  }
  // A click the way a step is already going is one more step, taken when this one is done (the camera
  // goes first again); the other way it turns the step round, or calls it off if it has not moved yet.
  let stepsQueued = 0;
  function clickStep(direction) {
    const p = modes?.procedure();
    if (p?.stepping && p.heading === direction) { stepsQueued += direction; return; }
    stepsQueued = 0;
    stepProcedure(direction);
  }
  $('procedure-previous').addEventListener('click', () => clickStep(-1));
  $('procedure-next').addEventListener('click', () => clickStep(1));

  // Dragging the thumb scrubs, which pauses; on release it stays where it was let go and the user
  // presses play to go on. Arrow keys on the focused slider come through the same input event, so the
  // value written per frame is only ever the one the user just set.
  // the slider goes in steps of 0.01 s, and a procedure is seldom that long exactly: at its right-hand
  // end it is the end, or the run would never be done
  procTime.addEventListener('input', () => {
    stepsQueued = 0;
    const value = Number(procTime.value); const max = Number(procTime.max);
    modes?.procedureControl.scrub(value > max - Number(procTime.step) ? max : value);
  });
  procTime.addEventListener('pointerdown', () => { procDragging = true; });
  procTime.addEventListener('change', () => { procDragging = false; });
  for (const type of ['pointerup', 'pointercancel']) {
    window.addEventListener(type, () => { procDragging = false; }, { signal });
  }
  // the press stays here: the column of controls closes its popover on a pointerdown outside it, and
  // the panel of the procedure is what keeps this bar in view while it is scrubbed
  procBar.addEventListener('pointerdown', (e) => e.stopPropagation());

  /** How far up the bar reaches: in a narrow embed the info tile steps over it (--procedure-top). */
  function placeProcedureBar() {
    if (procBar.hidden) return;
    const top = wrap.getBoundingClientRect().bottom - procBar.getBoundingClientRect().top;
    wrap.style.setProperty('--procedure-top', `${top + PROC_GAP}px`);
  }
  // a hidden bar measures 0, so this reports it coming into view as well as changing height
  const procRoom = new ResizeObserver(placeProcedureBar);
  procRoom.observe(procBar);
  onResize(placeProcedureBar);
  onDestroy(() => procRoom.disconnect());

  /** Per frame: fill the bar with where the procedure stands, and decide whether it is in view. */
  function stepProcedureBar() {
    const p = modes?.procedure() ?? null;
    // practising an operation (handelingen.js), the next step is the question: no bar to see or click
    if (!p || wrap.classList.contains('ops-oefenen')) { procBar.hidden = true; wrap.classList.remove('procedure-open'); stepsQueued = 0; return; }
    // after the card of a run closed, its bar stays away until another procedure is shown, or this
    // one is started afresh
    const inCard = wrap.classList.contains('ops-on');
    const shape = shapeOf(p);
    const fresh = p.playing && !procWasPlaying;
    procWasPlaying = p.playing;
    if (inCard || shape !== procDismissed || fresh) procDismissed = null;
    if (procDismissed === shape) { procBar.hidden = true; wrap.classList.remove('procedure-open'); stepsQueued = 0; return; }
    if (stepsQueued && !p.playing) {                      // the step is done: on to the next one clicked for
      const direction = Math.sign(stepsQueued); stepsQueued -= direction;
      stepProcedure(direction);
    }
    procBar.hidden = false;
    if (shape !== procShape) {                            // another procedure, or the same one anew
      procShape = shape;
      procTime.max = String(p.total);
      procTicks.replaceChildren(procBand, ...p.steps.map((s) => {   // the band, and one tick per step boundary
        const tick = document.createElement('span');
        tick.style.left = `${(s.end / p.total) * 100}%`;
        return tick;
      }), ...p.steps.filter((s) => s.skipped).map((s) => {           // a step skipped now: blocked out
        const block = document.createElement('span'); block.className = 'skipped';
        block.style.left = `${(s.begin / p.total) * 100}%`; block.style.width = `${((s.end - s.begin) / p.total) * 100}%`;
        return block;
      }));
    }
    if (!procDragging) procTime.value = String(p.t);
    const on = p.steps[p.index];                          // the band marks that step, not how far it has come
    if (on) { procBand.style.left = `${(on.begin / p.total) * 100}%`; procBand.style.width = `${((on.end - on.begin) / p.total) * 100}%`; }
    procBar.classList.toggle('terug', p.backwards);
    // the step the label is about, and named the way the procedure is going (Fok strijken, Fok hijsen)
    // counted without the skipped steps: those are not done here at all
    const live = p.steps.filter((s) => !s.skipped); const at = live.indexOf(p.steps[p.index]);
    const step = live.length ? `${Math.max(at, 0) + 1}/${live.length}  ${p.label}` : p.label;
    if (procStep.textContent !== step) procStep.textContent = step;
    if (procName.textContent !== p.name) procName.textContent = p.name;
    if (procPlaying !== p.playing) {
      procPlaying = p.playing;
      // the icons are SVG groups, which have no hidden property: the attribute has to be set
      for (const icon of procIcons) icon.toggleAttribute('hidden', (icon.dataset.icon === 'pause') !== p.playing);
      procPlay.setAttribute('aria-label', p.playing ? 'Pauzeren' : 'Afspelen');
      procPlay.title = procPlay.getAttribute('aria-label');
    }

    // it stays while it runs or stands still half way, while its own popover is open - so a finished
    // procedure can be scrubbed back through - and while it is hovered or has the focus
    const panel = $('ops-panel');                         // in sight: its section shown, and the Oefenen popover open
    const now = performance.now();
    if (!p.resting || panel.offsetParent !== null || procBar.matches(':hover, :focus-within')) procWoke = now;
    const show = wrap.classList.contains('ops-on') || now - procWoke < REST_MS;   // in the card of a run it stays
    procBar.classList.toggle('faded', !show);
    wrap.classList.toggle('procedure-open', show);
  }

  // Part of the view covered from below (the card of a running quiz): the picture is lifted by half
  // of it, so what the camera looks at stands in the middle of what is still to be seen. Picking and
  // the locator rings go through the same projection, so they follow.
  let covered = 0;
  function frame() {
    const { width: w, height: h } = wrap.getBoundingClientRect();
    if (covered > 0 && w > 0 && h > 0) camera.setViewOffset(w, h, 0, covered / 2, w, h);
    else camera.clearViewOffset();
  }
  const setCovered = (px) => { if (px === covered) return; covered = px; frame(); };

  // ---------------------------------------------------------------- Oefenen
  // A popover of the column: first what to practise - Manoeuvres (handelingen.js) or Onderdelen
  // (quiz.js) - then that one's own start panel. It opens on the one chosen last; Manoeuvres is only
  // there while sailing (modes.js hides its button), and without it the panel shows Onderdelen.
  let learnKind = 'manoeuvres';
  let openLearn = () => {};
  function initLearn() {
    const buttons = [...ui.querySelectorAll('#learn-kind button')];
    const show = (kind = learnKind) => {
      const can = !$('learn-manoeuvres').hidden;
      const shown = kind === 'manoeuvres' && !can ? 'onderdelen' : kind;
      for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset.learn === shown));
      $('ops-panel').hidden = shown !== 'manoeuvres';
      $('quiz').hidden = shown !== 'onderdelen';
      const open = !$('learn-panel').hidden;
      quiz?.panelToggled(open && shown === 'onderdelen');
      if (open && shown === 'manoeuvres') handelingen?.refresh();
      modes?.placePopover();                                  // its height changed: it has to fit again
    };
    for (const b of buttons) b.addEventListener('click', () => { learnKind = b.dataset.learn; show(); });
    $('learn-toggle').addEventListener('click', () => show()); // after modes.js has opened or shut it
    openLearn = (kind) => { if (kind) learnKind = kind; if ($('learn-panel').hidden) $('learn-toggle').click(); else show(); };
  }

  // ---------------------------------------------------------------- the bottom right corner
  // The part card stands in the corner; what else lives there - the debug buttons, the list of
  // Onderdelen that its search opens - goes above it, as high as the card reaches (--info-clear).
  const infoCard = $('info');
  let infoClear = -1;
  function placeCorner() {
    const shown = infoCard.offsetParent !== null;                    // not taken away by a focus mode
    const clear = shown ? Math.round(wrap.getBoundingClientRect().bottom - infoCard.getBoundingClientRect().top) + 8 : 16;
    if (clear === infoClear) return;
    infoClear = clear;
    wrap.style.setProperty('--info-clear', `${clear}px`);
  }

  // ---------------------------------------------------------------- what is called out
  // A command - "Klaar om te wenden!", "Gijp!", a roeicommando - floats in a speech bubble over the
  // one who calls it: the helmsman in the stern, or the fokkenist by the mast. It follows the boat on
  // the screen, and fades once it has had time to be read.
  const callout = Object.assign(document.createElement('div'), { className: 'callout' });
  callout.hidden = true;
  wrap.append(callout);
  const SPEAKERS = { roer: new THREE.Vector3(1.0, 1.45, 0), fok: new THREE.Vector3(3.8, 1.5, 0) };   // model space: where their heads are
  let calloutUntil = 0; let calloutAt = SPEAKERS.roer;
  function say(text, who = 'roer') {
    if (!text) return;
    callout.textContent = text;
    calloutAt = SPEAKERS[who] ?? SPEAKERS.roer;
    calloutUntil = performance.now() + 1800 + 50 * text.length;
    callout.hidden = false; callout.classList.remove('gone');
  }
  const calloutPoint = new THREE.Vector3();
  function stepCallout() {
    if (callout.hidden) return;
    const now = performance.now();
    if (now > calloutUntil) { callout.classList.add('gone'); if (now > calloutUntil + 400) { callout.hidden = true; return; } }
    calloutPoint.copy(calloutAt).project(camera);
    const box = wrap.getBoundingClientRect();
    const behind = calloutPoint.z > 1;
    callout.style.visibility = behind ? 'hidden' : '';
    callout.style.left = `${((calloutPoint.x + 1) / 2) * box.width}px`;
    callout.style.top = `${((1 - calloutPoint.y) / 2) * box.height}px`;
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
    frame();
    wrap.style.setProperty('--lv-height', `${h}px`);   // the popovers cap themselves against it
    for (const fn of onResizeFns) fn();
  }
  const sizeWatch = new ResizeObserver(() => resize());
  sizeWatch.observe(wrap);
  onDestroy(() => sizeWatch.disconnect());
  resize();

  // The picture is drawn from the boat: she stays put and the world turns under her. In a manoeuvre it
  // is her that turns, as you would see it from the water: the camera goes round her by as much as
  // her heading changes, so the steiger, the wind and her track stand still and she swings.
  let headingWas = null;
  const turnAxis = new THREE.Vector3(0, 1, 0); const turnAbout = new THREE.Vector3(2.8, 0, 0);   // her pivot, in model space
  const turnPoint = (v, a) => v.sub(turnAbout).applyAxisAngle(turnAxis, a).add(turnAbout);
  // ...and the whole of her track stays in the picture: when it would run off it, the view draws back
  // and moves over, smoothly, until it fits with room to spare - so it does not start and stop again
  // with every bit the track grows - never in closer on its own, and not for a few seconds after the
  // view was moved by hand. What lies past the water is drawn on the sky.
  let refitting = false;
  const trackBox = new THREE.Box3(); const trackSphere = new THREE.Sphere();
  const lookFrom = new THREE.Vector3(); const lookAt = new THREE.Vector3();
  function keepTrackInView(dt) {
    const dock = modes?.dock;
    if (!dock?.turnsHer) { controls.maxDistance = MAX_DISTANCE; refitting = false; return; }
    if (flight || performance.now() - handledAt < 3000) return;
    if (dock.trackBox(trackBox).isEmpty()) return;
    trackBox.expandByPoint(turnAbout).getBoundingSphere(trackSphere);   // and the boat
    const half = Math.min(THREE.MathUtils.degToRad(camera.fov / 2), Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
    const need = (trackSphere.radius + 1.5) / Math.sin(half);
    const off = lookFrom.copy(camera.position).sub(controls.target); const dist = off.length();
    // does it all fit, with the target where it is - with `room` to spare?
    const fits = (room) => dist >= need * room && lookAt.copy(trackSphere.center).sub(controls.target).length() + trackSphere.radius * room <= Math.tan(half) * dist;
    if (!refitting && fits(1)) return;
    refitting = !fits(1.25);                                        // on until there is a quarter more room than needed
    if (!refitting) return;
    controls.maxDistance = Math.max(MAX_DISTANCE, need * 1.35, controls.maxDistance);
    const k = 1 - Math.exp(-dt * 1.2);
    controls.target.lerp(trackSphere.center, k);
    off.setLength(THREE.MathUtils.lerp(dist, Math.max(dist, need * 1.3), k));
    camera.position.copy(controls.target).add(off);
  }

  function turnWithHer() {
    const dock = modes?.dock; if (!dock) return;
    const h = dock.heading; const was = headingWas; headingWas = h;
    if (was === null || !dock.turnsHer) return;
    const d = Math.atan2(Math.sin(h - was), Math.cos(h - was));
    if (!d || Math.abs(d) > 0.5) return;                        // a new world laid is no turn
    turnPoint(camera.position, d); turnPoint(controls.target, d);
    if (flight) { turnPoint(flight.from, d); turnPoint(flight.fromTarget, d); }
  }

  const clock = new THREE.Clock();
  let elapsed = 0;                 // ms since the first frame; the pulse and the rings beat on it
  renderer.setAnimationLoop(() => {
    const dt = Math.min(clock.getDelta(), 0.05);
    elapsed += dt * 1000;
    keyboardNavigate(dt);
    modes?.update(dt, speed);
    turnWithHer();
    keepTrackInView(dt);
    night?.update(dt, speed);
    paintScheme?.update(dt);
    stepProcedureBar();
    stepCallout();
    placeCorner();
    stepFlight();
    controls.update();
    // the near plane comes in with the camera, so a close look is not cut open; further out it stays
    // at 5 cm, where the depth buffer has the precision to keep far surfaces apart
    const near = THREE.MathUtils.clamp(camera.position.distanceTo(controls.target) * 0.2, 0.002, 0.05);
    if (Math.abs(near - camera.near) > 1e-4) { camera.near = near; camera.updateProjectionMatrix(); }
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

  // ---------------------------------------------------------------- the state from outside
  // `toestand` in the configuration is where the viewer starts; handle.set() takes it somewhere else
  // later, animated as if the user had done it (or at once, with { direct: true }). What is set
  // before the model is in is kept and applied with the configuration's own toestand, at once.
  let loaded = false;
  let early = {};
  const VIEWS = { '3d': 'iso', zij: 'side', boven: 'top', voor: 'bow', achter: 'stern' };

  function applyState(want = {}, direct = false) {
    modes.apply(want, { direct });
    const { aanzicht, selectie, camera: view } = want;
    const point = (v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite);
    if (view !== undefined) {                              // the exact viewpoint; it wins over aanzicht
      if (point(view?.positie) && point(view?.doel)) {
        const position = new THREE.Vector3(...view.positie); const target = new THREE.Vector3(...view.doel);
        if (direct) { flight = null; camera.position.copy(position); controls.target.copy(target); controls.update(); }
        else startFlight(position, target, 600);
      } else console.warn(`[lelievlet] toestand.camera: ${JSON.stringify(view)} kent de viewer niet ({ positie: [x, y, z], doel: [x, y, z] })`);
    }
    if (aanzicht !== undefined && view === undefined) {
      if (aanzicht in VIEWS) setView(VIEWS[aanzicht], !direct);
      else console.warn(`[lelievlet] toestand.aanzicht: ${JSON.stringify(aanzicht)} kent de viewer niet (${Object.keys(VIEWS).join(', ')})`);
    }
    if (selectie !== undefined) {
      const ids = selectie === null ? [] : [selectie].flat();
      const list = parts.filter((p) => ids.includes(p.extras.id));
      const missing = ids.filter((id) => !list.some((p) => p.extras.id === id));
      if (missing.length) console.warn(`[lelievlet] toestand.selectie: geen onderdeel met id ${missing.join(', ')}`);
      select(list);
      if (list.length && aanzicht === undefined && view === undefined) {   // a camera asked for as well keeps its own place
        scene.updateMatrixWorld();
        flyTo(list);
        if (direct && flight) {
          camera.position.copy(flight.to); controls.target.copy(flight.toTarget); flight = null;
        }
      }
    }
  }

  /** Take the viewer to this toestand (only the keys given); before `ready` it waits for the model. */
  function set(want = {}, { direct = false } = {}) {
    if (destroyed) return;
    if (loaded) applyState(want, direct); else early = merge(early, want);
  }

  /** Where the viewer is now, in the form set() takes (with the camera, not the aanzicht); null until the model is in. */
  function get() {
    if (!loaded) return null;
    const at = (v) => v.toArray().map((x) => Math.round(x * 1000) / 1000);   // to the millimetre
    const to = flight ? flight.toTarget : controls.target;                   // mid-flight: where it is going
    return { ...modes.current(), selectie: selected.map((p) => p.extras.id),
             camera: { positie: at(flight ? flight.to : camera.position), doel: at(to) } };
  }

  // debug.toestand: the state as it is, written as the configuration that starts a viewer there. It
  // follows the boat and the camera while the panel is open.
  $('toestand-toggle').hidden = !config.debug.toestand;
  let night = null;                                                    // see initNight, once the model is there
  ready.then(() => {
    if (modes?.leechFlag) loadImage(asset('textures/embleem.png')).then((img) => modes.leechFlag.setEmblem(img), () => {});
    followNumber();
    // night keeps its own time; see initNight in rig.js
    night = initNight({ scene, sun, hemi, wrap, water: modes?.water, toplicht: modes?.toplicht,
                        slowest: Number($('speed').min) || 0.25, note: logboek.note });
    const stir = () => night.activity();
    for (const type of ['pointermove', 'pointerdown', 'wheel']) wrap.addEventListener(type, stir, { signal, passive: true });
    window.addEventListener('keydown', stir, { signal });
  }, () => {});
  let toestandPoll = null;
  onDestroy(() => clearInterval(toestandPoll));
  function toestandText() {
    const now = get();
    if (!now) return '';
    const { commando, selectie, camera: view, ...rest } = now;
    const toestand = { ...rest, commando: commando.bb === commando.sb ? commando.bb : commando };
    if (selectie.length) toestand.selectie = selectie.length === 1 ? selectie[0] : selectie;
    toestand.camera = view;
    // one line per point: [x, y, z] reads better than a number per line
    return JSON.stringify({ toestand }, null, 2).replace(/\[\s+([^\]]*?)\s+\]/g, (_, inner) => `[${inner.split(/,\s+/).join(', ')}]`);
  }
  function toestandToggled(open) {
    clearInterval(toestandPoll);
    toestandPoll = null;
    if (!open) return;
    const pre = $('toestand-json');
    const refresh = () => { const text = toestandText(); if (pre.textContent !== text) pre.textContent = text; };
    refresh();
    toestandPoll = setInterval(refresh, 300);
  }
  $('toestand-copy').addEventListener('click', async () => {
    const button = $('toestand-copy');
    try {
      await navigator.clipboard.writeText(toestandText());
      button.textContent = 'Gekopieerd';
    } catch {                                           // no clipboard (http, or refused): select it to copy by hand
      getSelection().selectAllChildren($('toestand-json'));
      button.textContent = 'Selecteer en kopieer zelf';
    }
    setTimeout(() => { button.textContent = 'Kopieer als JSON'; }, 1500);
  });

  const debug = { camera, controls, scene, parts, rows, held, keyboardNavigate, select, flyTo,
                  sideOf, pickTwin, config,
                  get modes() { return modes; }, get regions() { return regions; },
                  get quiz() { return quiz; }, get night() { return night; },
                  get flight() { return flight; }, get hullBox() { return hullBox; } };

  return { ready, destroy, debug, fullscreen: fullscreen.toggle, get, set };
}

// ---------------------------------------------------------------- shared, and never written to
// an eye, struck through while its group is hidden (the slash shows through aria-pressed, in the sheet)
const EYE = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/><path class="slash" d="M4 4l16 16"/></svg>';
const CHEVRON = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
const CENTRE_PLANE = 0.03;   // m: nearer the centre plane of the boat than this and the camera picks no side
const AZIMUTHS = 8;
// Candidate directions; the one we are looking from is added. The steep ones are there for what lies
// down in the boat (mastkoker, zwaardloper): that can only be seen from above, through the open kuip.
const ELEVATIONS = [40, 65, 15, 85];
// A step of a procedure is followed from the side, a little above the boat.
const LOW_ELEVATIONS = [20, 8, 35];
const LOW_Y = Math.sin(THREE.MathUtils.degToRad(20));
const SQUARE_ON = 3;                   // how much looking square onto a flat movement weighs, in sample points seen
const STEP_FLIGHT_MS = 1400;           // the camera goes to a step at half the speed of a click in the list
const SAMPLES = [[0, 0, 0], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
const MARGIN = 1.6;                    // room left around the part
const FLIGHT_MS = 700;
const SEARCH_MS = 250;                 // the search for a direction never holds up a click for long
const XRAY_BELOW = 3;                  // fewer sample points in view than this: show the part through the boat
const REST_MS = 2500;                  // how long a procedure that is done stays in view
const PROC_GAP = 8;                    // air between the progress bar and the info tile that steps over it
// what a key does, by the character it gives, and by the physical key for a character not in this list
const NAV_KEYS = new Map([['ArrowLeft', 'left'], ['ArrowRight', 'right'], ['ArrowUp', 'up'], ['ArrowDown', 'down'],
                          ['+', 'in'], ['=', 'in'], ['-', 'out'], ['_', 'out']]);
const NAV_CODES = new Map([['ArrowLeft', 'left'], ['ArrowRight', 'right'], ['ArrowUp', 'up'], ['ArrowDown', 'down'],
                           ['Equal', 'in'], ['NumpadAdd', 'in'], ['Minus', 'out'], ['NumpadSubtract', 'out']]);

const fold = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

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
