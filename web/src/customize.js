// "Aanpassen": sail number, name, home port and the paint scheme. Saved in the browser, unless the
// embedder switched that off. Paint zones are glTF material names written by pipeline/parts.py.
//
// Three layers, each beating the one under it: the viewer's own defaults, the defaults the page
// passed in `config.aanpassen`, and what this user saved in this browser.

const STORAGE_KEY = 'lelievlet.aanpassen.v1';

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

export const DEFAULTS = {
  zeilnummer: '000',
  naam: 'Lelievlet',
  naamKleur: '#0b0b0b',
  plaats: 'Zwolle',
  plaatsKleur: '#0b0b0b',
  bakskleur: '#c8102e',
  kleuren: {
    romp: '#0a0a0b', berghout: '#0a0a0b', boeisel: '#f5c20d', dolboord: '#0a0a0b',
    voordek: '#8f9499', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
  },
};

/** The viewer's defaults with the page's `config.aanpassen` on top: where this instance starts. */
function baseOf(config) {
  const given = config?.aanpassen ?? {};
  const base = structuredClone(DEFAULTS);
  for (const key of FIELDS) if (given[key] !== undefined) base[key] = given[key];
  for (const [zone] of ZONES) if (given.kleuren?.[zone] !== undefined) base.kleuren[zone] = given.kleuren[zone];
  return base;
}

function load(base, opslaan) {
  if (!opslaan) return structuredClone(base);
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return { ...structuredClone(base), ...saved, kleuren: { ...base.kleuren, ...saved.kleuren } };
  } catch {
    return structuredClone(base);
  }
}

function save(config, opslaan) {
  if (!opslaan) return;
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* private mode */ }
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
 *   zoneMaterials: Map<zone, Material[]>, setSailNumber(text), setHullText(key, text, color)
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

  // text fields, their lettering colours, and the bakskleur
  for (const key of FIELDS) {
    const input = ui.getElementById(`cfg-${key}`);
    input.value = config[key];
    input.addEventListener('input', () => { config[key] = input.value; apply[key](input.value); save(config, opslaan); });
  }
  // one colour picker per paint zone
  for (const [zone, label] of ZONES) {
    const row = document.createElement('label');
    row.className = 'color-row';
    const input = Object.assign(document.createElement('input'), { type: 'color', id: `cfg-kleur-${zone}`, value: config.kleuren[zone] });
    input.addEventListener('input', () => { config.kleuren[zone] = input.value; applyZone(zone, input.value); save(config, opslaan); });
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
  };

  // back to where this viewer started, which is the page's own defaults if it gave any
  ui.getElementById('customize-reset').addEventListener('click', () => {
    Object.assign(config, structuredClone(base));
    save(config, opslaan);
    applyAll();
  });

  applyAll();
  return config;
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
