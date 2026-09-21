// "Aanpassen": sail number, name, home port and the paint scheme. Saved in the browser.
// Paint zones are glTF material names written by pipeline/parts.py.

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

function load() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return { ...structuredClone(DEFAULTS), ...saved, kleuren: { ...DEFAULTS.kleuren, ...saved.kleuren } };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function save(config) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(config)); } catch { /* private mode */ }
}

/** Open/close behaviour of the panel; works before the model has loaded. */
export function initCustomizePanel() {
  const panel = document.getElementById('customize');
  const toggle = document.getElementById('customize-toggle');
  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  };
  toggle.addEventListener('click', () => setOpen(panel.hidden));
  document.getElementById('customize-close').addEventListener('click', () => setOpen(false));
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
}

/**
 * targets: {
 *   zoneMaterials: Map<zone, Material[]>, setSailNumber(text), setHullText(key, text, color)
 * }
 */
export function initCustomize(targets) {
  const config = load();
  const FIELDS = ['zeilnummer', 'naam', 'naamKleur', 'plaats', 'plaatsKleur', 'bakskleur'];
  const colorList = document.getElementById('zone-colors');

  const apply = {
    zeilnummer: (v) => targets.setSailNumber(v.trim()),
    naam: () => targets.setHullText('naam', config.naam, config.naamKleur),
    naamKleur: () => targets.setHullText('naam', config.naam, config.naamKleur),
    plaats: () => targets.setHullText('plaats', config.plaats, config.plaatsKleur),
    plaatsKleur: () => targets.setHullText('plaats', config.plaats, config.plaatsKleur),
    bakskleur: (v) => applyZone('bakskleur', v), // accents: beslag and the painted bands
  };
  const applyZone = (zone, hex) => {
    for (const m of targets.zoneMaterials.get(zone) ?? []) m.color.set(hex);
  };

  // text fields, their lettering colours, and the bakskleur
  for (const key of FIELDS) {
    const input = document.getElementById(`cfg-${key}`);
    input.value = config[key];
    input.addEventListener('input', () => { config[key] = input.value; apply[key](input.value); save(config); });
  }
  // one colour picker per paint zone
  for (const [zone, label] of ZONES) {
    const row = document.createElement('label');
    row.className = 'color-row';
    const input = Object.assign(document.createElement('input'), { type: 'color', id: `cfg-kleur-${zone}`, value: config.kleuren[zone] });
    input.addEventListener('input', () => { config.kleuren[zone] = input.value; applyZone(zone, input.value); save(config); });
    row.append(input, Object.assign(document.createElement('span'), { textContent: label }));
    colorList.append(row);
  }

  const applyAll = () => {
    for (const key of FIELDS) {
      document.getElementById(`cfg-${key}`).value = config[key];
      apply[key](config[key]);
    }
    for (const [zone] of ZONES) {
      document.getElementById(`cfg-kleur-${zone}`).value = config.kleuren[zone];
      applyZone(zone, config.kleuren[zone]);
    }
  };

  document.getElementById('customize-reset').addEventListener('click', () => {
    Object.assign(config, structuredClone(DEFAULTS));
    save(config);
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
