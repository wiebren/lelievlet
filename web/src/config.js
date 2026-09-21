// Configuration of one viewer. A group embeds the model in its own page and passes what differs for
// them: the colours and lettering their boats have, the names they use (many parts go by more than
// one name, and which one is taught differs per group), what their quiz asks, and whether the
// debug aids are on. Everything is optional; what is left out is as the viewer has it.
//
//   Lelievlet.create(element, {
//     assets: 'https://…/',                       // where models/ and textures/ are; default: next to the script
//     aanpassen: { zeilnummer: '442', naam: 'Fluessen', plaats: 'Zwolle', bakskleur: '#c8141f',
//                  kleuren: { romp: '#111111', boeisel: '#e6d85a' }, opslaan: true },
//     namen: {
//       onderdelen: { hommerring: 'Mastring', want_bb: 'Bakboord zijstag' },   // by part id
//       stappen: { 'Fok strijken': 'Fok neer' },                                // procedure steps, by their default label
//       commandos: { stopaf: 'Houden' },                                        // roeicommando's, by key
//     },
//     quiz: {
//       weg: [27, 'Kleed'],                          // numbers or names to leave out
//       erbij: [{ naam: 'Anker', delen: ['anker'], niveau: 1, los: true }],
//       niveau: 2,                                   // level the start panel opens on
//     },
//     debug: { modelnummer: true, quiztabellen: true },
//   })

export const DEFAULTS = {
  assets: null,
  aanpassen: { opslaan: true },
  namen: { onderdelen: {}, stappen: {}, commandos: {} },
  quiz: { weg: [], erbij: [], niveau: 3 },
  debug: { modelnummer: false, quiztabellen: false },
};

const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Deep merge of plain objects; arrays and everything else are taken whole from `over`. */
function merge(base, over) {
  if (!isPlain(over)) return over === undefined ? base : over;
  const out = { ...(isPlain(base) ? base : {}) };
  for (const [key, value] of Object.entries(over)) out[key] = merge(out[key], value);
  return out;
}

/**
 * The configuration in force: the defaults with the embedder's on top. `debug: true` switches all
 * the debug aids on at once. Unknown keys are kept (and reported once), so a typing mistake in a
 * page's configuration shows up in the console instead of silently doing nothing.
 */
export function resolveConfig(given = {}) {
  const config = merge(DEFAULTS, given);
  if (given.debug === true) config.debug = { modelnummer: true, quiztabellen: true };
  if (given.debug === false) config.debug = { ...DEFAULTS.debug };
  const unknown = Object.keys(given).filter((key) => !(key in DEFAULTS));
  if (unknown.length) console.warn(`[lelievlet] onbekende instelling(en): ${unknown.join(', ')}`);
  return config;
}

/** The name a group uses for a part, a procedure step or a roeicommando; `fallback` when it has none. */
export const naamVan = (config, soort, key, fallback) => config?.namen?.[soort]?.[key] ?? fallback;

/** The quiz entries for this configuration: the standard list less `weg`, plus `erbij`. */
export function quizEntries(config, standard) {
  const weg = new Set((config?.quiz?.weg ?? []).map((x) => (typeof x === 'number' ? x : String(x).toLowerCase())));
  const kept = standard.filter((e) => !weg.has(e.nr) && !weg.has(e.naam.toLowerCase()));
  const extra = (config?.quiz?.erbij ?? []).filter((e) => e && e.naam && Array.isArray(e.delen) && e.delen.length)
    .map((e, i) => ({ nr: e.nr ?? 1000 + i, niveau: 3, ...e, eigen: true }));
  return [...kept, ...extra];
}
