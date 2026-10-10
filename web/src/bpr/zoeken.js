import * as THREE from 'three';
import { BORDEN } from './borden/index.js';
import { TEKENS, makeSign } from './tekens.js';
import { MARKS, makeMark } from './betonning.js';
import { BORD_UITLEG, MARK_UITLEG } from './uitleg.js';
import { SEINEN, seinPlaatje, makeSein, makeVeerpont } from './seinen.js';
import { NIET_CWO, EXTRA } from './borden/index.js';
import { VLAGGEN, VLAG_GROEPEN, VLAG_KLEUREN, PATRONEN, vlagSvg, makeVlag } from './vlaggen.js';

// Zoeken, beside Onderdelen: the tabs Borden (BPR bijlage 7), Markeringen (bijlage 8), Seinen (the
// lights at bridges, locks and spuisluizen, bijlage 7 G and H) and Vlaggen (the BPR's, the racing
// signals and the code flags). Each one has a search field and a way to find a thing by what it looks
// like: a sign by its colour and then the kind of sign, a mark by its shape and its colours, a signal by
// where it stands and the colours of its lights, a flag by its kind, colours and pattern. What is picked gets a card at the top of the list, and
// stands out on the water beside the boat while the camera goes to look at it; letting go of it (the
// card's ×, another tab, the panel closing) takes it away again and the camera back to where it was.

const el = (tag, props = {}, ...children) => { const n = Object.assign(document.createElement(tag), props); n.append(...children); return n; };
const fold = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const asImage = (svg) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;   // its own document: no ids shared

// Borden, as they look: the colour first, then where a colour has many signs, the kind of sign
const BORD_KLEUREN = [
  { key: 'rood', label: 'Rood', dot: '#c8102e', groepen: [
    ['Rood-wit', ['A.1', 'A.1a', 'A.10']],
    ['Doorgestreept', ['A.2', 'A.4', 'A.5', 'A.5.1', 'A.6', 'A.7', 'A.9', 'A.12', 'A.13', 'A.15', 'A.16', 'A.17']],
    ['Rode rand', ['B.1a', 'B.1b', 'B.5', 'B.6', 'B.8', 'B.9a', 'B.9b', 'C.1', 'C.2', 'C.3', 'C.5']],
  ] },
  { key: 'blauw', label: 'Blauw', dot: '#0b4ea2', groepen: [
    ['Met een teken', ['E.2', 'E.4a', 'E.4b', 'E.5', 'E.5.1', 'E.5.3', 'E.6', 'E.7', 'E.15', 'E.16', 'E.18', 'E.19', 'E.20', 'E.11', 'D.3a']],
    ['Kruisingen', ['E.9a', 'E.9b', 'E.9c', 'E.9d', 'E.9e', 'E.9f', 'E.9g', 'E.9h', 'E.9i', 'E.10a', 'E.10b', 'E.10c', 'E.10d', 'E.10e', 'E.10f']],
  ] },
  { key: 'geel', label: 'Geel', dot: '#f5b800', groepen: [
    ['Aanbevolen doorvaart', ['D.1a', 'D.1b']],
    ['Hoogte en diepte', ['G.5.1', 'G.5.1a', 'G.5.1b', 'G.5.2']],
  ] },
  { key: 'groen', label: 'Groen', dot: '#1f7a45', groepen: [['', ['E.1', 'D.2']]] },
  { key: 'wit', label: 'Wit', dot: '#ffffff', groepen: [['Onderborden', ['F.1', 'F.2a', 'F.3', 'F.4']]] },
];

// signs that hang on a bridge (BPR bijlage 7: A.10 and D.2 at the edges of the opening, D.1 over it, C.2 and
// the hoogtebord on it): put out on a fixed bridge, not on a post
const OP_BRUG = new Set(['A.10', 'D.2', 'D.1a', 'D.1b', 'C.2', 'G.5.1b', 'G.5.1c', 'G.5.2', 'G.5.3']);
// where a sign CWO does not ask about goes, when its looks say less than what it is for
const EXTRA_GROEP = { 'G.5.1c': 'Hoogte en diepte', 'G.5.3': 'Hoogte en diepte', 'H.2.3': 'Wegwijzers' };

// the signs CWO does not ask about, each in its place by its looks: in a group of its colour, a new one
// when the colour has its groups and this is none of them, in the one there is when it has only one
const EXTRA_BY = new Map(EXTRA.map((x) => [x.code, x]));
for (const x of EXTRA) {
  const k = BORD_KLEUREN.find((c) => c.key === x.kleur) ?? BORD_KLEUREN.find((c) => c.key === 'wit');
  const named = k.groepen.some(([g]) => g);
  const name = EXTRA_GROEP[x.code] ?? x.groep;
  const groep = named ? k.groepen.find(([g]) => g === name) ?? (k.groepen.push([name || 'Overig', []]), k.groepen.at(-1)) : k.groepen[0];
  groep[1].push(x.code);
}

// Markeringen: the shape of the body, and the colours on it
const VORM = {
  stompeTon: 'stomp', spitseTon: 'spits', sparStomp: 'spar', sparSpits: 'spar', sparKlein: 'spar', sparAanvullend: 'spar',
  sparAanvullendSpits: 'spar', bol: 'bol', drijfbaken: 'baken', kopbaken: 'baken', steekbaken: 'baken', walbaken: 'wal', haveningang: 'wal',
};
const VORMEN = [['stomp', 'Stompe ton'], ['spits', 'Spitse ton'], ['spar', 'Spar'], ['bol', 'Bol'], ['baken', 'Baken'], ['wal', 'Op de wal']];
const MARK_KLEUREN = [['rood', 'Rood', '#c1121c'], ['groen', 'Groen', '#0f8a3c'], ['geel', 'Geel', '#f2c200'],
  ['zwart', 'Zwart', '#161616'], ['wit', 'Wit', '#ffffff'], ['hout', 'Takken', '#7a5a3a']];
const kleurenVan = (spec) => new Set(spec.banden.flatMap((b) => b.split(/[ -]/)).filter((k) => MARK_KLEUREN.some(([key]) => key === k)));

const CLEAR = 4.5;                 // m: kept between it and the middle of the wind arrow
const OUT = 7;                     // m: how far from the middle of the boat a sign or mark is put out
const AHEAD = 18;                  // m: how far ahead a bridge, lock or spuisluis stands, the boat coming up to it
const THUMB = 160;                 // px: the picture of a mark in the list, rendered from its model

/**
 * ui: the viewer's shadow root; renderer, scene, camera: to draw the pictures of the marks and to put
 * the one picked out on the water; boat(): the middle of the boat; lookFromHelm(point | null): the
 * camera at the helm as in Schipper, looking at a point (null lets go); waterline(): the height of the
 * water; windArrow(): the arrow on the water that shows the wind, to keep clear of; view(): where the camera and its target are now; fly(position, target): the camera goes
 * there; setDark(k): night 0..1 held, or null to let go.
 * Returns { update(dt), release(), reset(), tab(key), entries() }.
 */
export function initZoeken({ ui, renderer, scene, camera, boat, lookFromHelm, waterline, windArrow, view, fly, setDark }) {
  const $ = (id) => ui.getElementById(id);
  const holder = new THREE.Group(); holder.name = 'zoeken'; scene.add(holder);
  const built = new Map();                                       // 'bord:A.6' / 'mark:id' -> the object, built once
  let shown = null;                                              // { key, object }
  let cameFrom = null;                                           // the view before the first one was put out
  let dark = false; let t = 0;
  let helmHeld = false;                                          // the view is at the helm, for Op het water
  const cards = [];                                              // every card's close, to let go from anywhere
  const resets = [];                                             // every tab back to how it opened the first time
  const entries = [];                                            // every sign, mark and signal, for the quiz (tekenquiz.js)

  const NAMEN = new Map(TEKENS.flatMap(([, , list]) => list));   // code -> name
  let drawPictures = () => {};                                   // the pictures of the marks, once their tab is opened

  /**
   * Put an object out on the water beside the boat and go to look at it: abeam on the side the camera
   * is on, a little forward or aft, or else on the other side, wherever it stands clear of the wind arrow.
   * `ahead`: a bridge or lock, straight ahead with its opening on her line, as when coming up to it.
   * `helm`: looked at from where the helmsman sits, not from over the boat. `wide`: further back, for
   * what is as wide as the water (a veerpont between its two kades).
   */
  function show(key, make, { ahead = false, helm = false, wide = false } = {}) {
    if (shown?.key === key) return;
    if (!built.has(key)) built.set(key, make());
    const object = built.get(key);
    holder.clear(); holder.add(object);
    if (!shown) cameFrom = view();
    shown = { key, object };
    const centre = boat(); const { position } = view();
    const near = Math.sign(position.z - centre.z) || 1;
    const arrow = windArrow()?.visible ? new THREE.Box3().setFromObject(windArrow()).getCenter(new THREE.Vector3()) : null;
    const spots = [near, -near].flatMap((s) => [1.5, 5, -2].map((dx) => ({ side: s, at: new THREE.Vector3(centre.x + dx, waterline(), centre.z + s * OUT) })));
    const { side, at } = ahead ? { side: near, at: new THREE.Vector3(centre.x + AHEAD, waterline(), centre.z) }
      : spots.find(({ at: p }) => !arrow || Math.hypot(p.x - arrow.x, p.z - arrow.z) > CLEAR) ?? spots[0];
    object.position.copy(at);
    // a sign faces +z: towards the boat on her port side; ahead, towards her bow
    object.rotation.y = ahead ? -Math.PI / 2 : side > 0 ? Math.PI : 0;
    // looked at from over the boat, as from the water: the boat in front, the sign or mark beyond her
    const height = object.userData.height ?? 2;
    const target = object.position.clone().setY(waterline() + height * 0.5).lerp(centre.clone().setY(waterline() + 1), ahead ? 0.2 : 0.35);
    // from the helm: where Schipper sits, looking at it (main.js holds the view there, the head free to turn)
    if (helm) {
      // the card of the round lies over the lower part: looked at a little below it, it stands in what is left.
      // Schipper's lens is some 90 degrees across, less upright on a narrow screen (main.js followRunView).
      const look = object.position.clone().setY(waterline() + height * 0.45);
      const canvas = ui.getElementById('scene').getBoundingClientRect();
      const card = [...ui.querySelectorAll('.focus-card')].map((el) => el.getBoundingClientRect()).find((r) => r.width);
      const covered = card ? Math.max(0, canvas.bottom - card.top) / canvas.height : 0;
      const upright = THREE.MathUtils.clamp(2 * Math.atan(1 / camera.aspect), THREE.MathUtils.degToRad(50), THREE.MathUtils.degToRad(85));
      look.y -= covered * look.distanceTo(centre) * Math.tan(upright / 2);
      helmHeld = true; lookFromHelm(look); return;
    }
    if (helmHeld) { helmHeld = false; lookFromHelm(null); }
    const from = wide ? new THREE.Vector3(centre.x - 24, waterline() + 11, centre.z + side * 7)
      : ahead ? new THREE.Vector3(centre.x - 11, waterline() + 6, centre.z + side * 5)   // over and past the sails, the whole of it in view
      : new THREE.Vector3(centre.x - 7, waterline() + 3.4, centre.z - side * 5);
    // on a phone the panel lies over the lower part of the view: aimed lower, it is seen in the middle of what is left
    // (and so does the card of a quiz round, at the bottom of the view wherever it is)
    const canvas = ui.getElementById('scene').getBoundingClientRect();
    const covered = Math.max(0, ...[ui.getElementById('parts'), ...ui.querySelectorAll('.focus-card')].map((el) => el.getBoundingClientRect())
      .filter((r) => r.width > canvas.width * 0.6 || (r.width && r.bottom > canvas.bottom - 40 && r.left < canvas.left + canvas.width / 2 && r.right > canvas.left + canvas.width / 2))
      .map((r) => Math.max(0, canvas.bottom - r.top) / canvas.height));
    target.y -= covered * from.distanceTo(target) * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    fly(from, target);
  }

  /** Nothing out on the water any more: the camera back to where it was. */
  function release() {
    for (const close of cards) close(false);
    if (!shown) return;
    holder.clear(); shown = null;
    if (dark) { dark = false; setDark(null); }
    if (helmHeld) { helmHeld = false; lookFromHelm(null); }
    if (cameFrom) fly(cameFrom.position, cameFrom.target);
    cameFrom = null;
  }

  // ---------------------------------------------------------------- one tab: search, chips, card, grid
  function pane(root, { placeholder, items, chips, card }) {
    const search = el('input', { type: 'search', className: 'zoek-veld', autocomplete: 'off', placeholder });
    search.setAttribute('aria-label', placeholder.replace('…', ''));
    const list = el('div', { className: 'zoek-lijst' });
    const kaart = el('div', { className: 'zoek-kaart', hidden: true });
    const empty = el('p', { className: 'hint', hidden: true, textContent: 'Niets gevonden.' });
    root.append(search, ...chips.rows, el('div', { className: 'zoek-scroll' }, kaart, list, empty));
    const scroller = kaart.parentElement;

    let current = null;
    const closeCard = (andRelease = true) => {
      const back = kaart.contains(ui.activeElement) ? current?.button : null;   // the × had the focus: back to the item
      kaart.hidden = true; current?.button.removeAttribute('aria-current'); current = null;
      $('parts').classList.remove('gekozen');
      back?.focus({ preventScroll: true });
      if (andRelease) release();
    };
    cards.push((andRelease) => { if (current) closeCard(andRelease); });
    const open = (item) => {
      if (dark) { dark = false; setDark(null); }                 // each card starts by day; one with a light offers the night
      current?.button.removeAttribute('aria-current');
      current = item; item.button.setAttribute('aria-current', 'true');
      const close = el('button', { type: 'button', className: 'zoek-kaart-sluit', title: 'Sluiten', textContent: '×', onclick: () => closeCard() });
      close.setAttribute('aria-label', 'Sluiten');
      kaart.replaceChildren(...card(item), close);
      kaart.hidden = false; scroller.scrollTop = 0;
      $('parts').classList.add('gekozen');                       // on a phone: only the card, the water seen over it
      close.focus({ preventScroll: true });                      // the grid may be hidden now: the focus goes to the card
      item.place();
    };

    const sections = new Map();                                  // heading -> { section, grid }
    for (const item of items) {
      if (!sections.has(item.heading)) {
        const grid = el('div', { className: 'zoek-grid' });
        const section = el('section', {}, ...(item.heading ? [el('h3', { textContent: item.heading })] : []), grid);
        list.append(section); sections.set(item.heading, { section, grid });
      }
      item.button.addEventListener('click', () => open(item));
      sections.get(item.heading).grid.append(item.button);
    }
    const filter = () => {
      const query = fold(search.value.trim());
      let found = 0;
      for (const item of items) {
        const hit = chips.match(item) && (!query || item.key.includes(query));
        item.button.hidden = !hit; if (hit) found++;
      }
      for (const { section, grid } of sections.values()) section.hidden = ![...grid.children].some((b) => !b.hidden);
      empty.hidden = found > 0;
    };
    search.addEventListener('input', filter);
    chips.onChange(filter);
    filter();
    resets.push(() => { search.value = ''; chips.reset(); closeCard(false); filter(); scroller.scrollTop = 0; });
  }

  /** A row of toggle chips; `many`: more than one can be on at once. */
  function chipRow(options, { many = false, label }) {
    const row = el('div', { className: 'zoek-chips' });
    row.setAttribute('role', 'group'); row.setAttribute('aria-label', label);
    const on = new Set();
    let changed = () => {};
    const buttons = options.map(([key, text, dot]) => {
      const b = el('button', { type: 'button', className: 'chip' });
      if (dot) b.append(el('span', { className: 'dot', style: `background: ${dot}` }));
      b.append(text); b.dataset.key = key; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (on.has(key)) on.delete(key); else { if (!many) on.clear(); on.add(key); }
        for (const x of buttons) x.setAttribute('aria-pressed', String(on.has(x.dataset.key)));
        changed();
      });
      return b;
    });
    row.append(...buttons);
    const clear = () => { on.clear(); for (const x of buttons) x.setAttribute('aria-pressed', 'false'); };
    return { row, on, clear, onChange: (fn) => { changed = fn; } };
  }

  // ---------------------------------------------------------------- Borden
  {
    const kleur = chipRow(BORD_KLEUREN.map((k) => [k.key, k.label, k.dot]), { label: 'Kleur' });
    // the kinds of the colour that is on, when it has more than one
    const soortRow = el('div', { className: 'zoek-chips sub', hidden: true });
    let soort = null; let changed = () => {};
    const showKinds = () => {
      const k = BORD_KLEUREN.find((x) => kleur.on.has(x.key));
      soort = null;
      const kinds = k?.groepen.filter(([name]) => name) ?? [];
      soortRow.hidden = kinds.length < 2;
      soortRow.replaceChildren(...kinds.map(([name]) => {
        const b = el('button', { type: 'button', className: 'chip', textContent: name }); b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          soort = soort === name ? null : name;
          for (const x of soortRow.children) x.setAttribute('aria-pressed', String(x.textContent === soort));
          changed();
        });
        return b;
      }));
    };
    kleur.onChange(() => { showKinds(); changed(); });
    const items = BORD_KLEUREN.flatMap((k) => k.groepen.flatMap(([groep, codes]) => codes.map((code) => {
      const { svg } = BORDEN[code];
      const naam = NAMEN.get(code) ?? EXTRA_BY.get(code)?.naam ?? code;
      const uitleg = BORD_UITLEG?.[code] ?? EXTRA_BY.get(code) ?? {};
      const cwo = !NIET_CWO.has(code);
      const button = el('button', { type: 'button', className: `zoek-item${cwo ? '' : ' niet-cwo'}`, title: `${code} ${naam}${cwo ? '' : ' (niet voor CWO)'}` },
        el('img', { src: asImage(svg), alt: '', loading: 'lazy', decoding: 'async' }), el('span', { textContent: code }));
      // what hangs on a bridge is shown on one, straight ahead; everything else on its post beside the boat
      const place = (opts) => (OP_BRUG.has(code)
        ? show(`bord:${code}`, () => makeSein({ id: code, bouw: 'vast', borden: code }), { ...opts, ahead: true })
        : code === 'E.4a' || code === 'E.4b' ? show(`bord:${code}`, () => makeVeerpont(code), { ...opts, ahead: true, wide: true })   // on both kades, the pont between
        : show(`bord:${code}`, () => makeSign(code), opts));
      entries.push({ soort: 'bord', id: code, naam, tekst: uitleg.betekenis ?? naam, doen: uitleg.betekenis, groep: `${k.key}:${groep}`,
        cwo: !NIET_CWO.has(code), ahead: OP_BRUG.has(code) || code === 'E.4a' || code === 'E.4b', src: () => asImage(svg), place });
      return { code, naam, uitleg, svg, cwo, kleur: k.key, groep, button, heading: groep ? `${k.label}: ${groep.toLowerCase()}` : k.label,
        key: fold([code, naam, uitleg.betekenis ?? '', uitleg.lelievlet ?? ''].join(' ')), place };
    })));
    pane($('zoek-borden'), {
      placeholder: 'Zoek bord of code…', items,
      chips: { rows: [kleur.row, soortRow], onChange: (fn) => { changed = fn; }, reset: () => { kleur.clear(); showKinds(); },
        match: (item) => (!kleur.on.size || kleur.on.has(item.kleur)) && (!soort || item.groep === soort) },
      card: (item) => [
        el('div', { className: 'zoek-kaart-kop' }, el('img', { src: asImage(item.svg), alt: '' }),
          el('div', {}, el('span', { className: 'code', textContent: item.code }), el('h3', { textContent: item.naam }))),
        ...[item.uitleg.betekenis, item.uitleg.lelievlet].filter(Boolean).map((text) => el('p', { textContent: text })),
        ...(item.cwo ? [] : [el('p', { className: 'niet-cwo', textContent: 'Niet voor CWO: dit bord komt niet in Oefenen.' })]),
      ],
    });
  }

  // ---------------------------------------------------------------- Markeringen
  {
    const vorm = chipRow(VORMEN, { label: 'Vorm' });
    const kleur = chipRow(MARK_KLEUREN, { many: true, label: 'Kleur' });
    let changed = () => {};
    vorm.onChange(() => changed()); kleur.onChange(() => changed());
    const pictures = new Map();                                  // id -> img, drawn the first time the tab is opened
    const items = MARKS.map((spec) => {
      const uitleg = MARK_UITLEG?.[spec.id] ?? {};
      const img = el('img', { alt: '' }); pictures.set(spec.id, img);
      const button = el('button', { type: 'button', className: 'zoek-item mark', title: spec.naam }, img, el('span', { textContent: spec.naam }));
      const place = (opts) => show(`mark:${spec.id}`, () => makeMark(spec), opts);
      entries.push({ soort: 'ton', id: spec.id, naam: spec.naam, tekst: uitleg.betekenis ?? spec.naam, doen: uitleg.passeren, groep: VORM[spec.vorm],
        cwo: true, src: () => img.src, place });
      return { spec, uitleg, button, img, vorm: VORM[spec.vorm], kleuren: kleurenVan(spec), heading: '',
        key: fold([spec.naam, uitleg.betekenis ?? '', uitleg.passeren ?? ''].join(' ')), place };
    });
    pane($('zoek-markeringen'), {
      placeholder: 'Zoek ton of baken…', items,
      chips: { rows: [vorm.row, kleur.row], onChange: (fn) => { changed = fn; }, reset: () => { vorm.clear(); kleur.clear(); },
        match: (item) => (!vorm.on.size || vorm.on.has(item.vorm)) && [...kleur.on].every((k) => item.kleuren.has(k)) },
      card: (item) => {
        const night = item.spec.licht ? el('button', { type: 'button', className: 'link-button zoek-nacht' }) : null;
        const label = () => { night.textContent = dark ? 'Bekijk overdag' : 'Bekijk ’s nachts'; };
        night?.addEventListener('click', () => { dark = !dark; setDark(dark ? 1 : null); label(); });
        if (night) label();
        return [
          el('div', { className: 'zoek-kaart-kop' }, el('img', { src: item.img.src, alt: '' }), el('div', {}, el('h3', { textContent: item.spec.naam }))),
          ...[item.uitleg.betekenis, item.uitleg.passeren, item.uitleg.licht].filter(Boolean).map((text) => el('p', { textContent: text })),
          ...(night ? [night] : []),
        ];
      },
    });
    /** The pictures of the marks, each rendered from its own model, above the water only. */
    drawPictures = () => {
      if (!pictures.size) return;
      const stage = new THREE.Scene(); stage.environment = scene.environment;
      stage.add(new THREE.HemisphereLight(0xffffff, 0x8a99a8, 1.1));
      const sun = new THREE.DirectionalLight(0xffffff, 1.2); sun.position.set(-3, 6, 5); stage.add(sun);
      const lens = new THREE.PerspectiveCamera(24, 1, 0.1, 100);
      const target = new THREE.WebGLRenderTarget(THUMB, THUMB, { samples: 4 });
      target.texture.colorSpace = THREE.SRGBColorSpace;
      const pixels = new Uint8Array(THUMB * THUMB * 4);
      const canvas = el('canvas', { width: THUMB, height: THUMB }); const g = canvas.getContext('2d');
      const was = { target: renderer.getRenderTarget(), clear: renderer.getClearColor(new THREE.Color()), alpha: renderer.getClearAlpha(),
        planes: renderer.clippingPlanes };
      renderer.clippingPlanes = [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)];   // what is under water is left out
      try {
        const box = new THREE.Box3(); const part = new THREE.Box3(); const size = new THREE.Vector3(); const mid = new THREE.Vector3();
        for (const item of items) {
          const key = `mark:${item.spec.id}`;
          if (!built.has(key)) built.set(key, makeMark(item.spec));
          const object = built.get(key); const parent = object.parent;
          object.position.set(0, 0, 0); object.rotation.set(0, 0, 0); stage.add(object);
          object.updateMatrixWorld(true);
          // framed on what is solid above the water: not the glow round its light, which is mostly empty
          box.makeEmpty();
          object.traverse((o) => {
            if (!o.isMesh || !o.visible) return;
            if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
            box.union(part.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld));
          });
          box.min.y = Math.max(box.min.y, 0); box.getSize(size); box.getCenter(mid);
          const reach = Math.max(size.y, size.x, size.z) * 0.56 / Math.tan(THREE.MathUtils.degToRad(lens.fov / 2));
          lens.position.set(mid.x - reach * 0.35, mid.y + reach * 0.18, mid.z + reach * 0.92); lens.lookAt(mid);
          renderer.setRenderTarget(target); renderer.setClearColor(0x000000, 0); renderer.clear();
          renderer.render(stage, lens);
          renderer.readRenderTargetPixels(target, 0, 0, THUMB, THUMB, pixels);
          const image = g.createImageData(THUMB, THUMB);
          for (let y = 0; y < THUMB; y++) image.data.set(pixels.subarray((THUMB - 1 - y) * THUMB * 4, (THUMB - y) * THUMB * 4), y * THUMB * 4);
          g.putImageData(image, 0, 0);
          item.img.src = canvas.toDataURL();
          stage.remove(object); parent?.add(object);
        }
      } finally {                                                // whatever went wrong, the viewer's own drawing is left as it was
        renderer.setRenderTarget(was.target); renderer.setClearColor(was.clear, was.alpha); renderer.clippingPlanes = was.planes;
        target.dispose();
      }
      pictures.clear();
    };
  }

  // ---------------------------------------------------------------- Seinen
  {
    const PLEKKEN = [['brug', 'Beweegbare brug'], ['sluis', 'Sluis'], ['vast', 'Vaste brug'], ['spui', 'Spuien']];
    const plekVan = (s) => ({ brug: 'brug', ophaal: 'brug', sluis: 'sluis', sluisbrug: 'sluis', sluisophaal: 'sluis', vast: 'vast', spui: 'spui' })[s.bouw];
    const LICHTKLEUREN = [['rood', 'Rood', '#c8102e'], ['groen', 'Groen', '#1f7a45'], ['geel', 'Geel', '#f5b800']];
    const BORDKLEUR = { 'A.10': 'rood', 'A.1': 'rood', 'D.2': 'groen', 'D.1a': 'geel', 'D.1b': 'geel' };
    const kleurenVanSein = (s) => new Set([...(s.lampen ?? []).map(([k]) => k), ...(s.geel ? ['geel'] : []), ...(s.driehoek ? ['rood'] : []),
      ...(s.borden ? [BORDKLEUR[s.borden]] : [])]);
    const plek = chipRow(PLEKKEN, { label: 'Waar' });
    const kleur = chipRow(LICHTKLEUREN, { many: true, label: 'Kleur' });
    let changed = () => {};
    plek.onChange(() => changed()); kleur.onChange(() => changed());
    const items = SEINEN.map((sein) => {
      const svg = seinPlaatje(sein);
      const button = el('button', { type: 'button', className: 'zoek-item sein', title: `${sein.groep}: ${sein.naam}` },
        el('img', { src: asImage(svg), alt: '', loading: 'lazy', decoding: 'async' }), el('span', { textContent: sein.naam }));
      const place = (opts) => show(`sein:${sein.id}`, () => makeSein(sein), { ...opts, ahead: true });
      entries.push({ soort: 'sein', id: sein.id, naam: sein.naam, tekst: sein.betekenis, doen: sein.betekenis, groep: sein.groep,
        cwo: true, ahead: true, breed: true, src: () => asImage(svg), place });
      return { sein, svg, button, heading: sein.groep, plek: plekVan(sein), kleuren: kleurenVanSein(sein),
        key: fold([sein.groep, sein.naam, sein.code, sein.betekenis, sein.lelievlet ?? ''].join(' ')), place };
    });
    pane($('zoek-seinen'), {
      placeholder: 'Zoek sein…', items,
      chips: { rows: [plek.row, kleur.row], onChange: (fn) => { changed = fn; }, reset: () => { plek.clear(); kleur.clear(); },
        match: (item) => (!plek.on.size || plek.on.has(item.plek)) && [...kleur.on].every((k) => item.kleuren.has(k)) },
      card: (item) => {
        const night = item.sein.bouw === 'vast' ? null : el('button', { type: 'button', className: 'link-button zoek-nacht' });
        const label = () => { night.textContent = dark ? 'Bekijk overdag' : 'Bekijk ’s nachts'; };
        night?.addEventListener('click', () => { dark = !dark; setDark(dark ? 1 : null); label(); });
        if (night) label();
        return [
          el('img', { className: 'zoek-kaart-plaat', src: asImage(item.svg), alt: '' }),
          el('div', { className: 'zoek-kaart-kop' }, el('div', {}, el('span', { className: 'code', textContent: `${item.sein.groep} · ${item.sein.code}` }),
            el('h3', { textContent: item.sein.naam }))),
          ...[item.sein.betekenis, item.sein.lelievlet].filter(Boolean).map((text) => el('p', { textContent: text })),
          ...(night ? [night] : []),
        ];
      },
    });
  }

  // ---------------------------------------------------------------- Vlaggen
  // A flag by its colours first (more than one at once: all of them on it), then by its pattern - only
  // the patterns there are among the flags of those colours, so the row stays short. Asked in Oefenen
  // (under Seinen) only what CWO asks, and not the flags that say what a sign or signal already says
  // there (the red flag of A.1, the spui flag and pennant of H.3): two answers would be right.
  {
    const ALREADY = new Set(['bpr-A.1-rode-vlag', 'bpr-H.3a-spuien', 'bpr-H.3b-inlaten']);
    // what kind of flag first: a signal of the BPR, a racing signal, or the code flags themselves
    const SOORT = { bpr: 'seinen', wedstrijd: 'wedstrijd', letter: 'seinboek', cijfer: 'seinboek', vervanger: 'seinboek', onderscheiding: 'seinboek' };
    const categorie = chipRow([['seinen', 'Seinen'], ['wedstrijd', 'Wedstrijd'], ['seinboek', 'Letters en cijfers']], { label: 'Soort' });
    const kleur = chipRow(VLAG_KLEUREN, { many: true, label: 'Kleur' });
    const patroonRow = el('div', { className: 'zoek-chips sub', hidden: true });
    let patroon = null; let changed = () => {};
    const order = new Map(VLAG_GROEPEN.map((g, i) => [g, i]));
    const items = [...VLAGGEN].sort((a, b) => (order.get(a.groep) ?? 99) - (order.get(b.groep) ?? 99)).map((v) => {
      const svg = vlagSvg(v);
      const button = el('button', { type: 'button', className: `zoek-item vlag${v.cwo ? '' : ' niet-cwo'}`, title: `${v.naam}${v.cwo ? '' : ' (niet voor CWO)'}` },
        el('img', { src: asImage(svg), alt: '', loading: 'lazy', decoding: 'async' }), el('span', { textContent: v.naam }));
      const place = (opts) => show(`vlag:${v.id}`, () => makeVlag(v), opts);
      if (v.cwo && !ALREADY.has(v.id)) {
        entries.push({ soort: 'sein', id: v.id, naam: v.naam, tekst: v.betekenis, doen: v.betekenis, groep: 'Vlaggen en borden aan boord', cwo: true, src: () => asImage(svg), place });
      }
      return { v, svg, button, heading: v.groep, soort: SOORT[v.soort] ?? 'seinen', kleuren: new Set(v.kleuren), patroon: v.patroon,
        key: fold([v.naam, v.groep, v.betekenis, v.spelwoord ?? '', v.id].join(' ')), place };
    });
    const showPatterns = () => {
      patroon = null;
      const there = new Set(items.filter((i) => (!categorie.on.size || categorie.on.has(i.soort)) && [...kleur.on].every((k) => i.kleuren.has(k))).map((i) => i.patroon));
      const list = kleur.on.size ? PATRONEN.filter(([key]) => there.has(key)) : [];
      patroonRow.hidden = list.length < 2;
      patroonRow.replaceChildren(...list.map(([key, label]) => {
        const b = el('button', { type: 'button', className: 'chip', textContent: label }); b.dataset.key = key; b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          patroon = patroon === key ? null : key;
          for (const x of patroonRow.children) x.setAttribute('aria-pressed', String(x.dataset.key === patroon));
          changed();
        });
        return b;
      }));
    };
    kleur.onChange(() => { showPatterns(); changed(); });
    categorie.onChange(() => { showPatterns(); changed(); });
    pane($('zoek-vlaggen'), {
      placeholder: 'Zoek vlag, letter of sein…', items,
      chips: { rows: [categorie.row, kleur.row, patroonRow], onChange: (fn) => { changed = fn; }, reset: () => { categorie.clear(); kleur.clear(); showPatterns(); },
        match: (item) => (!categorie.on.size || categorie.on.has(item.soort)) && [...kleur.on].every((k) => item.kleuren.has(k)) && (!patroon || item.patroon === patroon) },
      card: (item) => [
        el('div', { className: 'zoek-kaart-kop' }, el('img', { src: asImage(item.svg), alt: '' }),
          el('div', {}, el('span', { className: 'code', textContent: item.v.groep }), el('h3', { textContent: item.v.naam }))),
        ...[item.v.betekenis, item.v.lelievlet].filter(Boolean).map((text) => el('p', { textContent: text })),
        ...(item.v.cwo ? [] : [el('p', { className: 'niet-cwo', textContent: 'Niet voor CWO: deze vlag komt niet in Oefenen.' })]),
      ],
    });
  }

  return {
    update(dt) {
      if (!shown) return;
      t += dt;
      shown.object.userData.update?.(t, dark ? 1 : 0, camera);
    },
    release,
    /** What is out on the water now, for a report: { wat, id }. */
    info: () => shown && { wat: shown.key.split(':')[0], id: shown.key.slice(shown.key.indexOf(':') + 1) },
    /**
     * Every sign, mark and signal: { soort, id, naam, tekst, doen, groep, cwo, src(), place({ helm }) }, the pictures of
     * the marks drawn first. `doen`: what it means you must do; `cwo`: whether CWO asks about it (the quiz keeps to those).
     */
    entries() { drawPictures(); return entries; },
    /** The panel closed: nothing picked, no search, no chips on; which tab was open stays. */
    reset() { release(); for (const r of resets) r(); },
    /** A tab was opened: the pictures of the marks are drawn the first time theirs is. */
    tab(key) { if (key === 'markeringen') drawPictures(); },
  };
}
