import * as THREE from 'three';
import { unpack } from './config.js';
import { CLOTH as SAILCLOTH } from './sails.js';
import { GROEPEN } from './groepen.js';

// "Aanpassen": sail number, name, home port, the paint scheme and the colour of the sails. Saved in the browser, unless the
// embedder switched that off. Paint zones are glTF material names written by pipeline/parts.py.
//
// Three layers, each beating the one under it: the viewer's own defaults, the defaults the page
// passed in `config.aanpassen`, and what this user saved in this browser. Only what the user made
// different from the first two is saved, so a page that changes its defaults later still reaches a
// visitor who once changed something else - and two viewers on one site do not hand each other
// their colours.

export const STORAGE_KEY = 'lelievlet.aanpassen.v1';
const MODUS_KEY = 'lelievlet.aanpassen.modus';    // Bekend or Eigen, as it was last left

export const ZONES = [
  ['romp', 'Romp'],
  ['berghout', 'Berghout'],
  ['boeisel', 'Boeisel'],
  ['dolboord', 'Dolboord'],
  ['voordek', 'Voordek'],
  ['achterdek', 'Achterdek'],
  ['kuip', 'Kuip'],
  ['zwaardkast', 'Zwaardkast'],
];

const FIELDS = ['zeilnummer', 'naam', 'naamKleur', 'plaats', 'plaatsKleur', 'bakskleur'];

// The colour of the sails, from 0 to 100: bright white, the off-white the cloth is painted in (10, the
// default), then sand, a red-brown taan and a very dark brown. The cloth is tinted, not painted over,
// so tape and corner patches keep their own shade; the first stop lifts the cloth to pure white.
// demo/logo.js has the same stops for the app icon.
const BRIGHT = ((c) => new THREE.Color(1 / c.r, 1 / c.g, 1 / c.b))(new THREE.Color(SAILCLOTH));
const ZEILKLEUR = [[0, BRIGHT], [10, '#ffffff'], [30, '#ecd2b0'], [58, '#b45a37'], [100, '#3b2418']]
  .map(([at, tint]) => [at, new THREE.Color(tint)]);
const sailTint = (k) => {
  const i = Math.max(1, ZEILKLEUR.findIndex(([at]) => at >= k));
  const [a, from] = ZEILKLEUR[i - 1]; const [b, to] = ZEILKLEUR[i];
  return from.clone().lerp(to, (k - a) / (b - a));
};
const sailColor = (material, k) => material.userData.untinted.clone().multiply(sailTint(k));
const INK_WHITE = 50;               // from here on the zeilteken and the number are white
/** 0 to 100, from whatever the page or the browser had; null when it is no number at all. */
const zeilkleur = (v) => (v === '' || v === null || !Number.isFinite(Number(v)) ? null : Math.round(Math.min(100, Math.max(0, Number(v)))));

export const DEFAULTS = {
  zeilnummer: '000',
  naam: 'Lelievlet',
  naamKleur: '#0b0b0b',
  plaats: 'Zwolle',
  plaatsKleur: '#0b0b0b',
  bakskleur: '#c8102e',
  zeilkleur: 10,
  kleuren: {
    romp: '#0a0a0b', berghout: '#0a0a0b', boeisel: '#f5c20d', dolboord: '#0a0a0b',
    voordek: '#8f9499', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
  },
};

/** The viewer's defaults with the page's `config.aanpassen` on top: where this instance starts. */
function baseOf(config) {
  const given = config?.aanpassen ?? {};
  const base = structuredClone(DEFAULTS);
  // as text whatever the page gave (a number for the zeilnummer is easy to pass), and no longer than the field allows
  for (const key of FIELDS) if (given[key] !== undefined && given[key] !== null) base[key] = String(given[key]).slice(0, key === 'zeilnummer' ? 4 : 24);
  for (const [zone] of ZONES) if (given.kleuren?.[zone] !== undefined) base.kleuren[zone] = given.kleuren[zone];
  if (zeilkleur(given.zeilkleur) !== null) base.zeilkleur = zeilkleur(given.zeilkleur);
  return base;
}

/** The base with what this user saved on top, key by key. */
function load(base, opslaan) {
  const config = structuredClone(base);
  if (!opslaan) return config;
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') ?? {};
    for (const key of FIELDS) if (typeof saved[key] === 'string') config[key] = saved[key];
    for (const [zone] of ZONES) if (typeof saved.kleuren?.[zone] === 'string') config.kleuren[zone] = saved.kleuren[zone];
    if (typeof saved.zeilkleur === 'number' && zeilkleur(saved.zeilkleur) !== null) config.zeilkleur = zeilkleur(saved.zeilkleur);
  } catch { /* nothing saved, no storage, or something else under the key: the base */ }
  return config;
}

// a colour picker hands back lower case, a page may have written its colour in capitals
const COLOURS = new Set(['naamKleur', 'plaatsKleur', 'bakskleur']);
const same = (a, b, colour) => (colour ? String(a).toLowerCase() === String(b).toLowerCase() : a === b);

/** Only what differs from the base is written; nothing at all when nothing does. */
function save(config, base, opslaan) {
  if (!opslaan) return;
  const own = {};
  for (const key of FIELDS) if (!same(config[key], base[key], COLOURS.has(key))) own[key] = config[key];
  for (const [zone] of ZONES) {
    if (!same(config.kleuren[zone], base.kleuren[zone], true)) (own.kleuren ??= {})[zone] = config.kleuren[zone];
  }
  if (config.zeilkleur !== base.zeilkleur) own.zeilkleur = config.zeilkleur;
  try {
    if (Object.keys(own).length) localStorage.setItem(STORAGE_KEY, JSON.stringify(own));
    else localStorage.removeItem(STORAGE_KEY);
  } catch { /* private mode */ }
}

/** Open/close behaviour of the panel; works before the model has loaded. */
export function initCustomizePanel(ui, { signal, engaged } = {}) {
  const panel = ui.getElementById('customize');
  const toggle = ui.getElementById('customize-toggle');
  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  ui.getElementById('customize-close').addEventListener('click', () => setOpen(false));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && (engaged?.() ?? true)) setOpen(false);
  }, { signal });
}

/**
 * targets: {
 *   zoneMaterials: Map<zone, Material[]>, sailMaterials: Material[] (collectSailMaterials),
 *   setSailNumber(text), setHullText(key, text, color), setSailInk(white),
 *   melden(): the report of a group's colours (feedback.js); absent: no button for it
 * }
 */
export function initCustomize(ui, appConfig, targets) {
  const opslaan = appConfig?.aanpassen?.opslaan !== false;
  const base = baseOf(appConfig);
  const config = load(base, opslaan);
  const colorList = ui.getElementById('zone-colors');

  const applyZone = (zone, hex) => {
    for (const m of targets.zoneMaterials.get(zone) ?? []) m.color.set(hex);
  };
  const apply = {
    zeilnummer: (v) => targets.setSailNumber(v.trim()),
    naam: () => targets.setHullText('naam', config.naam, config.naamKleur),
    naamKleur: () => targets.setHullText('naam', config.naam, config.naamKleur),
    plaats: () => targets.setHullText('plaats', config.plaats, config.plaatsKleur),
    plaatsKleur: () => targets.setHullText('plaats', config.plaats, config.plaatsKleur),
    bakskleur: (v) => applyZone('bakskleur', v), // accents: beslag and the painted bands
  };
  const applySails = () => {
    for (const m of targets.sailMaterials) m.color.copy(sailColor(m, config.zeilkleur));
    targets.setSailInk(config.zeilkleur >= INK_WHITE);
  };
  // the sails: a slider over the colours it goes through
  const sailSlider = ui.getElementById('cfg-zeilkleur');
  const shade = (tint) => `#${new THREE.Color(SAILCLOTH).multiply(tint).getHexString()}`;   // the cloth as it comes out
  sailSlider.style.setProperty('--track', `linear-gradient(to right, ${ZEILKLEUR.map(([at, tint]) => `${shade(tint)} ${at}%`).join(', ')})`);
  sailSlider.addEventListener('input', () => { config.zeilkleur = Number(sailSlider.value); applySails(); save(config, base, opslaan); });

  // text fields, their lettering colours, and the bakskleur
  for (const key of FIELDS) {
    const input = ui.getElementById(`cfg-${key}`);
    input.value = config[key];
    input.addEventListener('input', () => { config[key] = input.value; apply[key](input.value); save(config, base, opslaan); });
  }
  // one colour picker per paint zone
  for (const [zone, label] of ZONES) {
    const row = document.createElement('label');
    row.className = 'color-row';
    const input = Object.assign(document.createElement('input'), { type: 'color', id: `cfg-kleur-${zone}`, value: config.kleuren[zone] });
    input.addEventListener('input', () => { config.kleuren[zone] = input.value; applyZone(zone, input.value); save(config, base, opslaan); });
    row.append(input, Object.assign(document.createElement('span'), { textContent: label }));
    colorList.append(row);
  }

  const applyAll = () => {
    for (const key of FIELDS) {
      ui.getElementById(`cfg-${key}`).value = config[key];
      apply[key](config[key]);
    }
    for (const [zone] of ZONES) {
      ui.getElementById(`cfg-kleur-${zone}`).value = config.kleuren[zone];
      applyZone(zone, config.kleuren[zone]);
    }
    sailSlider.value = config.zeilkleur;
    applySails();
  };

  // back to where this viewer started, which is the page's own defaults if it gave any
  ui.getElementById('customize-reset').addEventListener('click', () => {
    Object.assign(config, structuredClone(base));
    save(config, base, opslaan);
    applyAll();
    bekend.render();
  });

  const bekend = initBekend(ui, { config, base, opslaan, applyAll, melden: targets.melden });
  applyAll();
  return config;
}

// ---------------------------------------------------------------- Bekend
// The colours of groups that are known (groepen.js), found by the group, its plaats, or the zeilnummer or name of
// one of its boats. A group gives its colours and plaats; one of its boats its zeilnummer and naam as well. Below
// them, the way to report your own group's colours. Eigen is the fields and pickers to set them yourself.
const fold = (text) => String(text).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const BLACK = '#0b0b0b';

function initBekend(ui, { config, base, opslaan, applyAll, melden }) {
  const $ = (id) => ui.getElementById(id);
  const el = (tag, props = {}, ...children) => { const node = Object.assign(document.createElement(tag), props); node.append(...children); return node; };
  const zoek = $('cfg-zoek'); const list = $('cfg-groepen'); const geen = $('cfg-geen');

  // which of the two, remembered in this browser (a convenience: nothing else hangs on it)
  const modes = [...$('cfg-modus').querySelectorAll('button')];
  const setMode = (modus) => {
    for (const b of modes) b.setAttribute('aria-checked', String(b.dataset.modus === modus));
    $('cfg-bekend').hidden = modus !== 'bekend'; $('cfg-eigen').hidden = modus !== 'eigen';
    if (opslaan) try { localStorage.setItem(MODUS_KEY, modus); } catch { /* private mode */ }
  };
  for (const b of modes) b.addEventListener('click', () => { setMode(b.dataset.modus); if (b.dataset.modus === 'bekend') render(); });   // what Eigen changed shows
  let saved = null;
  if (opslaan) try { saved = localStorage.getItem(MODUS_KEY); } catch { /* private mode */ }
  setMode(saved === 'eigen' ? 'eigen' : 'bekend');

  // the boat as a group has her: is she that group's, and that boat?
  // (a boat may have a bakskleur of her own: groups tell their boats apart by it)
  const paintOf = (g, boat) => ({
    kleuren: Object.fromEntries(ZONES.map(([zone]) => [zone, g.kleuren?.[zone] ?? base.kleuren[zone]])),
    bakskleur: boat?.bakskleur ?? g.bakskleur ?? base.bakskleur, zeilkleur: g.zeilkleur ?? base.zeilkleur,
    naamKleur: g.naamKleur ?? BLACK, plaatsKleur: g.plaatsKleur ?? BLACK,
  });
  const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
  const isGroup = (g) => {
    const p = paintOf(g);
    const bakskleuren = [p.bakskleur, ...(g.boten ?? []).map((b) => paintOf(g, b).bakskleur)];
    return same(config.plaats, g.plaats) && ZONES.every(([zone]) => same(config.kleuren[zone], p.kleuren[zone]))
      && bakskleuren.some((c) => same(config.bakskleur, c)) && config.zeilkleur === p.zeilkleur;
  };
  const isBoat = (g, b) => isGroup(g) && same(config.bakskleur, paintOf(g, b).bakskleur)
    && config.zeilnummer.trim() === String(b.zeilnummer) && config.naam === b.naam;
  const pick = (g, boat) => {
    const p = paintOf(g, boat);
    Object.assign(config, { bakskleur: p.bakskleur, zeilkleur: p.zeilkleur, naamKleur: p.naamKleur, plaatsKleur: p.plaatsKleur, plaats: g.plaats });
    Object.assign(config.kleuren, p.kleuren);
    if (boat) Object.assign(config, { zeilnummer: String(boat.zeilnummer), naam: boat.naam });
    save(config, base, opslaan);
    applyAll(); render();
  };

  const own = (g) => (g.boten ?? []).some((b) => b.bakskleur);   // the bakskleur goes with each boat, not the group
  const swatches = (g) => {
    const p = paintOf(g);
    return el('span', { className: 'groep-kleuren', ariaHidden: 'true' },
      ...[p.kleuren.romp, p.kleuren.boeisel, p.kleuren.berghout, p.kleuren.voordek, own(g) ? null : p.bakskleur]
        .filter(Boolean).map((c) => el('i', { style: `background: ${c}` })));
  };
  // searched: of a group found by its name or plaats all boats, of one found by a boat only the boats that match
  const groepEl = (g, q) => {
    const kop = el('button', { type: 'button', className: 'groep-kop', title: `De kleuren van ${g.groep}` },
      el('span', {}, el('b', { textContent: g.groep }), el('span', { textContent: g.plaats })), swatches(g));
    kop.addEventListener('click', () => pick(g));
    const all = !q || fold(`${g.groep} ${g.plaats}`).includes(q);
    const match = (g.boten ?? []).filter((b) => all || fold(`${b.zeilnummer} ${b.naam}`).includes(q));
    const shown = match.length ? match : g.boten ?? [];               // found on more than one of them ("Zwolle 440"): all
    const boten = el('div', { className: 'groep-boten' }, ...shown.map((b) => {
      const button = el('button', { type: 'button', title: `${b.naam}, zeilnummer ${b.zeilnummer}` },
        ...(b.bakskleur ? [el('i', { ariaHidden: 'true', style: `background: ${b.bakskleur}` })] : []), `${b.zeilnummer} ${b.naam}`);
      if (isBoat(g, b)) button.setAttribute('aria-current', 'true');
      button.addEventListener('click', () => pick(g, b));
      return button;
    }));
    const card = el('div', { className: 'groep' }, kop, boten);
    if (isGroup(g)) card.setAttribute('aria-current', 'true');
    return card;
  };
  const MAX = 30;
  function render() {
    const typed = zoek.value.trim(); const q = fold(typed);
    const hits = GROEPEN.filter((g) => !q || fold([g.groep, g.plaats, ...(g.boten ?? []).flatMap((b) => [b.zeilnummer, b.naam])].join(' ')).includes(q))
      .sort((a, b) => a.groep.localeCompare(b.groep, 'nl'));
    list.replaceChildren(...hits.slice(0, MAX).map((g) => groepEl(g, q)));
    geen.hidden = hits.length > 0 && hits.length <= MAX;
    // (the way to report one is only offered where reports can be made: an embed may have it off)
    geen.textContent = !GROEPEN.length ? `Er zijn nog geen groepen bekend.${melden ? ' Staat jouw groep er niet bij? Zet de kleuren goed onder Eigen, en meld ze hieronder.' : ''}`
      : hits.length > MAX ? `En nog ${hits.length - MAX} ${hits.length - MAX === 1 ? 'groep' : 'groepen'}: zoek op naam, plaats, zeilnummer of boot.`
      : `Geen groep gevonden met „${typed}”.${melden ? ' Staat jouw groep er niet bij? Meld de kleuren hieronder.' : ''}`;
  }
  zoek.addEventListener('input', render);
  const meld = $('cfg-melden');
  meld.hidden = !melden;
  meld.addEventListener('click', () => melden?.());
  render();
  return { render, setMode };
}

/** Group the (already per-part cloned) materials of the model by paint zone. */
export function collectZoneMaterials(parts) {
  const zones = new Map([...ZONES.map(([zone]) => [zone, []]), ['bakskleur', []]]);
  for (const part of parts) {
    for (const mesh of part.meshes) {
      if (zones.has(mesh.material.name)) zones.get(mesh.material.name).push(mesh.material);
    }
  }
  return zones;
}


// The paint the early vletten wore: dark brown hull, tan boeisel, oiled wood on the decks and in the
// kuip, and sails the colour of tanned cotton. When it is taken off, the user's own colours come back.
//
// The change is lerped over FADE seconds instead of being set at once, so it reads as paint being
// laid on. Nothing is written once a fade has settled: a colour the user picks in "Aanpassen"
// afterwards stays put.

const NUMBER = unpack('WngcBg==');
const ENTRY = 've';
const FADE = 1.5;                   // seconds

const SCHEME = {
  romp: '#3b2a1f', berghout: '#2a1c14', boeisel: '#c8a46b', dolboord: '#3b2a1f',
  voordek: '#8b7355', achterdek: '#8b7355', kuip: '#8b7355', zwaardkast: '#8b7355',
  bakskleur: '#6b3a1e',
};
const CLOTH = '#b7895a';

/**
 * The cloth of grootzeil and fok with the cotton tape and corner patches along their edges.
 * Left out: the zeillatten (wood), the zeilteken and zeilnummer patches (artwork on a canvas of
 * their own), rope, and everything outside the sails - spinnaker and flags are parts elsewhere.
 * Each keeps the colour it came with, untinted, for white sails.
 */
export function collectSailMaterials(parts) {
  const materials = new Set();
  for (const part of parts) {
    const id = part.extras?.id ?? '';
    if (part.extras?.groep !== 'zeil') continue;
    if (!/^(grootzeil|fok)(_|$)/.test(id)) continue;
    if (id.endsWith('_zeilteken') || id.endsWith('_zeilnummer')) continue;
    for (const mesh of part.meshes) {
      if (!mesh.material || mesh.material.name.startsWith('touw')) continue;
      mesh.material.userData.untinted ??= mesh.material.color.clone();
      materials.add(mesh.material);
    }
  }
  return [...materials];
}

/**
 * zoneMaterials: Map<zone, Material[]> from customize.js (the paint zones plus 'bakskleur')
 * sailMaterials: the cloth materials, see collectSailMaterials
 * config:        the object initCustomize returned; it is read at the moment the scheme goes off,
 *                so whatever the user has picked by then is what comes back
 * note:          logboek.note, called once when the scheme is fully on
 * setSailInk:    white or black zeilteken and number, switched halfway through the fade
 */
export function initPaint({ zoneMaterials, sailMaterials, config, note, setSailInk }) {
  // sail cloth fades back to the colour the user has given the sails
  const tracked = [
    ...[...zoneMaterials].flatMap(([zone, ms]) => ms.map((material) => ({ material, zone }))),
    ...sailMaterials.map((material) => ({ material, zone: null })),
  ];

  const userColor = (zone) => (zone === 'bakskleur' ? config.bakskleur : config.kleuren[zone]);
  const from = new Map();           // material -> colour when the running fade began
  const to = new Map();
  let on = false;
  let t = 1;                        // progress of the running fade; 1 is settled, nothing to do
  let announced = false;
  let ink = null;                   // the zeilteken and number once the fade is halfway; null when set

  const setNumber = (text) => {
    const want = String(text).trim() === NUMBER;
    if (want === on) return;
    on = want;
    for (const entry of tracked) {
      from.set(entry.material, entry.material.color.clone());
      to.set(entry.material, on
        ? new THREE.Color(entry.zone ? SCHEME[entry.zone] : CLOTH)
        : (entry.zone ? new THREE.Color(userColor(entry.zone)) : sailColor(entry.material, config.zeilkleur)));
    }
    ink = on ? false : config.zeilkleur >= INK_WHITE;
    t = 0;
  };

  const update = (dt) => {
    if (t >= 1) return;
    t = Math.min(1, t + dt / FADE);
    if (ink !== null && t >= 0.5) { setSailInk?.(ink); ink = null; }
    const k = t * t * (3 - 2 * t);                 // eased: the paint creeps in and settles
    for (const entry of tracked) {
      entry.material.color.copy(from.get(entry.material)).lerp(to.get(entry.material), k);
    }
    if (t >= 1 && on && !announced) { announced = true; note?.(ENTRY); }
  };

  return { setNumber, update };
}
