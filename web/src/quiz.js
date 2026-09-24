import * as THREE from 'three';
import { QUIZ } from './quizdata.js';
import { regionAt } from './regions.js';
import { quizEntries, quizNaam } from './config.js';

// Oefenen: a quiz over the numbered names of the parts drawing of the class (quizdata.js). Four
// kinds of exercise, all drawn from the same pool:
//   aanwijzen  a name is given and the part has to be clicked (pick first, then Bevestigen)
//   benoemen   the part is highlighted and flown to, and four names are offered
//   typen      the part is highlighted and its name has to be typed, forgivingly judged
//   kies       a name is given and four parts light up, each in its own colour: pick the right one
// and Gemengd, which draws a kind per question from the ones the entry allows.
//
// While a round runs the viewer is in quiz mode (.lv.quiz-on): only the boat and the card are left
// - every panel, button and bar goes, and with them the hover tooltip and the info tile - and a
// click on the model goes to the quiz instead of to the selection and to modes.click: nothing may
// name a part but the card.
//
// An entry none of whose `delen` is in the loaded model is left out silently (Wantketting is still
// being modelled); the ones that fell away are logged once. Entries whose parts are not there in
// the mode the boat is in (the sails while rowing) are left out of the round as well, and so are
// the ones outside the chosen diploma: Roeien asks the names of the roei list, Zeilen the ones up
// to its niveau - as long as quizdata.js names one at all.
//
// The stats per entry and the all-time totals live in localStorage under one key; every access is
// wrapped, so the quiz works just as well without storage - and with aanpassen.opslaan false it is
// not touched at all. Two viewers on one page share that key: a change is laid onto what is stored
// at that moment, so neither writes away what the other one counted.

const STORE = 'lelievlet.quiz.v1';
const LENGTHS = { 10: 10, 20: 20, alles: Infinity };
const CHOICES = 4;                     // names offered by benoemen, parts lit by kies
const ENOUGH = 0.8;                    // below this share of the pool in view the panel says so
const TOP_LEVEL = 3;                   // Zeilen III: everything, and where an entry without a niveau lands
const ROEIEN = 'roeien';               // the level that stands for CWO Roeien, which has no niveaus

// kies: four parts light up at once, each in its own colour, with a chip of that colour on the
// card. Blue is left out: it is the colour the viewer already hovers parts in.
const KIES = [{ letter: 'A', hex: 0xe01b24 }, { letter: 'B', hex: 0x26a269 },
              { letter: 'C', hex: 0xc061cb }, { letter: 'D', hex: 0xe5a50a }];
const PULSE_HZ = 2.2;                  // how fast the part of a hovered chip breathes
const PULSE_DEPTH = 0.55;              // how far towards white it goes
const KIN = 0.5;                       // a rival of the same groep counts as half as far away
const KIN_SAMPLES = 24;                // vertices sampled per mesh to say where a part stands

const MARKS = { goed: '✓', fout: '✗' };   // 'bijna' - the name was not wrong, only not enough - gets none

const _v = new THREE.Vector3();

const el = (tag, className, text) => Object.assign(document.createElement(tag), { className: className ?? '', textContent: text ?? '' });
const hex = (value) => `#${value.toString(16).padStart(6, '0')}`;
const pct = (goed, total) => (total ? Math.round((goed / total) * 100) : 0);
const shuffle = (list) => {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
};

// Plausible wrong names: ones from the same groep, ones that share a word ("van de fok"), and
// ones whose first word ends the same way - the …lijk, …hoek and …val families of the drawing.
const WORD = /[a-zà-ÿ]+/gi;
const NOISE = new Set(['van', 'de', 'het', 'een', 'of', 'met', 'der']);
const wordsOf = (naam) => (naam.toLowerCase().match(WORD) ?? []).filter((w) => !NOISE.has(w));
const tailOf = (naam) => (wordsOf(naam)[0] ?? '').slice(-3);

// ---------------------------------------------------------------- judging a typed name
// Blind to case, to accents and to punctuation; "de"/"het" in front fall away, and so does the
// qualifier that tells two names of the same family apart - but only while it is not needed.
const fold = (text) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  .replace(/[^a-z0-9\- ]+/g, ' ').replace(/\s+/g, ' ').trim();
const article = (text) => text.replace(/^(?:de|het|een|den) /, '');
const stem = (text) => text.replace(/(?:en|s)$/, '');
const TYPOS_PER = 6;                   // letters per typo that is forgiven

/**
 * The forms a name answers to: the whole of it, its head without the "van de …" qualifier, and
 * the alternatives it names itself ("Halshoek of -broek"). A head that
 * several entries share is not enough on its own; `owners` below knows which those are.
 */
function keysOf(naam) {
  const full = fold(naam);
  const head = full.split(/ van (?:de|het|den) | van /)[0];
  const keys = [full, head];
  const alts = head.split(' of ').map((a) => a.trim()).filter(Boolean);
  for (const alt of alts) {
    if (!alt.startsWith('-')) { keys.push(alt); continue; }
    // "-broek" carries the head of the first alternative: halshoek -> halsbroek
    const rest = alt.slice(1);
    for (let i = 3; i <= alts[0].length - 3; i++) keys.push(alts[0].slice(0, i) + rest);
  }
  return [...new Set(keys)];
}

/** Edit distance where two neighbours the wrong way round cost one, like the typo they are. */
function levenshtein(a, b) {
  let back = [];
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = new Array(b.length + 1);
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        row[j] = Math.min(row[j], back[j - 2] + cost);
      }
    }
    back = previous;
    previous = row;
  }
  return previous[b.length];
}

/** Near enough: the same word up to a plural, or one typo per six letters. */
function close(typed, key) {
  if (typed === key) return true;
  if (stem(typed) === stem(key)) return true;
  const room = Math.floor(key.length / TYPOS_PER);
  return room > 0 && Math.min(levenshtein(typed, key), levenshtein(stem(typed), stem(key))) <= room;
}

export function initQuiz({ parts, scene, select, flyTo, setCovered, openLearn,
                           setHighlights, partVisible, closePanel, opslaan = true,
                           ui, wrap, config, signal, engaged, realTarget, onDestroy }) {
  const $ = (id) => ui.getElementById(id);
  const all = (selector) => [...ui.querySelectorAll(selector)];
  const touch = window.matchMedia('(pointer: coarse)');     // a finger: tik, and room for the keyboard

  // ---------------------------------------------------------------- the pool
  // What this page asks about: the standard list less `quiz.weg`, plus `quiz.erbij`, under the
  // names `namen.quiz` gives them.
  const asked = quizEntries(config, QUIZ);
  const byId = new Map(parts.map((p) => [p.extras.id, p]));
  const pool = [];
  const dropped = [];
  const table = [];              // every entry as it was resolved, for the debug tables
  for (const q of asked) {
    const naam = quizNaam(config, q.nr, q.naam);
    const delen = q.delen.map((id) => byId.get(id)).filter(Boolean);
    const ook = (q.ook ?? []).map((id) => byId.get(id)).filter(Boolean);
    const niveau = q.zeilen === false ? null : q.niveau ?? TOP_LEVEL;   // null: not asked in Zeilen
    table.push({ nr: q.nr, naam, niveau, roeien: Boolean(q.roeien), eigen: Boolean(q.eigen),
                 delen: q.delen.map((id) => ({ id, ok: byId.has(id) })),
                 ook: (q.ook ?? []).map((id) => ({ id, ok: byId.has(id) })),
                 gevraagd: delen.length > 0 });
    if (!delen.length) { dropped.push(`${q.nr} ${naam}`); continue; }
    pool.push({
      nr: q.nr, naam, delen, niveau, roeien: Boolean(q.roeien),
      ids: new Set([...delen, ...ook].map((p) => p.extras.id)),   // a click on any of these is right
      gebied: delen.find((p) => p.extras.gebied) ?? null,         // Boeg, Kleed: an area, not an object
      groep: delen[0].extras.groep, woorden: new Set(wordsOf(naam)), staart: tailOf(naam),
      keys: keysOf(naam),
    });
  }
  if (dropped.length) {
    console.info(`Quiz: ${dropped.length} of ${asked.length} names left out, no such part in the model: ${dropped.join(', ')}`);
  }

  // which entries answer to a given typed name: a head that only one entry has is enough by itself
  const owners = new Map();
  for (const entry of pool) {
    for (const key of entry.keys) owners.set(key, [...(owners.get(key) ?? []), entry]);
  }
  const levelled = asked.some((q) => q.niveau || q.roeien);    // nothing to tell apart: the selectors stay away

  // ---------------------------------------------------------------- the score, kept in localStorage
  // { v: 1, totaal: { goed, fout, rondes, beste }, per: { <nr>: { goed, fout, laatst } },
  //   keuze: { kind, length, level } } - the last choices of the start panel
  const EMPTY = { goed: 0, fout: 0, rondes: 0, beste: 0 };
  const fresh = () => ({ totaal: { ...EMPTY }, per: {}, keuze: {} });

  /** What is stored now, or null: no storage, storage switched off, or something else under the key. */
  function readStore() {
    if (!opslaan) return null;
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) ?? 'null');
      return raw?.totaal ? { totaal: { ...EMPTY, ...raw.totaal }, per: raw.per ?? {}, keuze: raw.keuze ?? {} } : null;
    } catch { return null; }                       // no storage, or it holds something else: start from nothing
  }
  let store = readStore() ?? fresh();

  /**
   * One change to the score or the choices: made to what is stored right now - which another viewer
   * on the page may have added to since this one read it - and written back, so only this change is
   * added. What was read becomes this viewer's own copy. Without storage it is made in memory.
   */
  function change(fn) {
    const now = readStore() ?? store;
    fn(now);
    store = now;
    if (!opslaan) return;
    try { localStorage.setItem(STORE, JSON.stringify({ v: 1, ...store })); } catch { /* it works without */ }
  }
  function clearStore() {                          // the choices of the panel are no score: they stay
    change((s) => { s.totaal = { ...EMPTY }; s.per = {}; });
  }

  const statsOf = (entry) => store.per[entry.nr] ?? { goed: 0, fout: 0, laatst: 0 };

  // ---------------------------------------------------------------- picking the questions
  /** What can be asked right now: in the model, up to the niveau, there in the mode the boat is in. */
  const there = (entry) => entry.delen.some(partVisible);
  const supports = (entry, kind) => (kind === 'kies' ? !entry.gebied : true);
  const inLevel = (e) => (level === ROEIEN ? e.roeien : e.niveau !== null && e.niveau <= level);
  const eligible = (kind) => pool.filter((e) => inLevel(e) && supports(e, kind) && there(e));

  /** Spaced repetition, light: what went wrong comes back sooner, what goes well comes back later. */
  function weight(entry) {
    const s = statsOf(entry);
    return (1 + s.fout * 2) / (1 + s.goed);
  }

  /** `count` entries without a repeat, until the pool runs out and starts over. */
  function draw(list, count) {
    const out = [];
    let rest = [];
    while (out.length < count) {
      if (!rest.length) rest = [...list];
      if (!rest.length) break;
      const total = rest.reduce((sum, e) => sum + weight(e), 0);
      let r = Math.random() * total;
      let i = 0;
      while (i < rest.length - 1 && (r -= weight(rest[i])) > 0) i++;
      out.push(...rest.splice(i, 1));
    }
    return out;
  }

  /** The entries this user gets wrong most, worst first. */
  const wrongPool = () => eligible('gemengd')
    .filter((e) => statsOf(e).fout > 0)
    .sort((a, b) => (statsOf(b).fout - statsOf(b).goed) - (statsOf(a).fout - statsOf(a).goed));

  /** Which exercise a question becomes; Gemengd draws one the entry allows. */
  function typeFor(entry, kind) {
    if (kind !== 'gemengd') return kind;
    const options = ['aanwijzen', 'benoemen', 'typen'];
    if (!entry.gebied && eligible('kies').length > CHOICES - 1) options.push('kies');
    return options[Math.floor(Math.random() * options.length)];
  }

  /** The names to choose from: the right one and three that could be mistaken for it, shuffled. */
  function namesFor(entry) {
    const rank = (e) => (e.staart === entry.staart ? 3 : 0)
      + ([...e.woorden].some((w) => entry.woorden.has(w)) ? 2 : 0)
      + (e.groep === entry.groep ? 1 : 0) + Math.random();
    const own = eligible('gemengd').filter((e) => e !== entry);
    const from = own.length >= CHOICES - 1 ? own : pool.filter((e) => e !== entry);
    const others = from.map((e) => ({ e, r: rank(e) }))
      .sort((a, b) => b.r - a.r).slice(0, CHOICES - 1).map((s) => s.e);
    return shuffle([entry, ...others]);
  }

  // kies: the parts that light up beside the right one are the nearest ones, with a part of the
  // same groep counting as half as far - a mistake has to be told apart by looking, not by
  // walking the boat. Where a part stands is averaged over a handful of its vertices: a cached
  // geometry box would be stale on a sail, and computing one would break the picking of that same
  // geometry, while walking every vertex of every candidate costs a third of a second.
  function centreOf(entry) {
    const sum = new THREE.Vector3();
    let n = 0;
    for (const p of entry.delen) {
      for (const m of p.meshes) {
        if (!m.visible) continue;
        const position = m.geometry.attributes.position;
        const step = Math.max(1, Math.floor(position.count / KIN_SAMPLES));
        m.updateWorldMatrix(true, false);
        for (let i = 0; i < position.count; i += step) {
          sum.add(_v.fromBufferAttribute(position, i).applyMatrix4(m.matrixWorld));
          n++;
        }
      }
    }
    return n ? sum.divideScalar(n) : null;
  }

  function partsFor(entry) {
    scene.updateMatrixWorld();
    const centre = centreOf(entry);
    if (!centre) return null;
    const near = eligible('kies').filter((e) => e !== entry)
      .map((e) => ({ e, d: (centreOf(e)?.distanceTo(centre) ?? Infinity) * (e.groep === entry.groep ? KIN : 1) }))
      .filter((s) => Number.isFinite(s.d))
      .sort((a, b) => a.d - b.d).slice(0, (CHOICES - 1) * 2).map((s) => s.e);
    if (near.length < CHOICES - 1) return null;
    return shuffle([entry, ...shuffle(near).slice(0, CHOICES - 1)]);
  }

  /**
   * A typed name, judged: 'goed', 'onvolledig' when only the head was given and more than one
   * entry answers to it, or 'fout'. The full name always wins over a shared head.
   */
  function judge(entry, typed) {
    const answer = article(fold(typed));
    if (!answer) return 'leeg';
    let shared = false;
    for (const key of entry.keys) {
      if (!close(answer, key)) continue;
      if ((owners.get(key) ?? []).length < 2) return 'goed';
      shared = true;                               // keep looking: a longer key may still be right
    }
    return shared ? 'onvolledig' : 'fout';
  }

  // ---------------------------------------------------------------- the start panel
  // One list of exercises to pick from, two small segmented choices under it and one Start. What
  // was chosen last is what the panel opens on.
  const quizToggle = $('learn-toggle');                     // Oefenen, in the column (main.js, initLearn)
  const startButton = $('quiz-start');
  const wrongButton = $('quiz-wrong');
  const totalLine = $('quiz-total');
  const warning = $('quiz-warning');
  const kindButtons = all('#quiz-kind button');
  const lengthButtons = all('#quiz-length button');
  const levelButtons = all('#quiz-level button');
  const disciplineButtons = all('#quiz-discipline button');
  const clearButton = $('quiz-clear');
  const clearConfirm = $('quiz-clear-confirm');
  const known = (buttons, attr, value) => buttons.some((b) => b.dataset[attr] === String(value));
  let kind = known(kindButtons, 'kind', store.keuze.kind) ? store.keuze.kind : 'aanwijzen';
  let length = known(lengthButtons, 'length', store.keuze.length) ? store.keuze.length : '10';
  // the level: ROEIEN, or the niveau of Zeilen; the panel opens on what was chosen last
  const asLevel = (value) => (value === ROEIEN ? ROEIEN : [1, 2, 3].includes(Number(value)) ? Number(value) : null);
  let level = asLevel(store.keuze.level) ?? asLevel(config?.quiz?.niveau) ?? TOP_LEVEL;
  let zeilLevel = level === ROEIEN ? TOP_LEVEL : level;      // what Zeilen comes back to
  let panelPoll = null;
  onDestroy?.(() => clearInterval(panelPoll));

  $('quiz-discipline-row').hidden = !levelled;
  const press = (buttons, value, attr) => {
    for (const b of buttons) b.setAttribute('aria-checked', String(b.dataset[attr] === String(value)));
  };
  const pressLevel = () => {
    press(disciplineButtons, level === ROEIEN ? ROEIEN : 'zeilen', 'discipline');
    press(levelButtons, zeilLevel, 'level');
    $('quiz-level-row').hidden = !levelled || level === ROEIEN;
  };
  const choose = () => {
    press(kindButtons, kind, 'kind'); press(lengthButtons, length, 'length'); pressLevel();
    change((s) => { s.keuze = { kind, length, level }; });
    refreshPanel();
  };
  for (const b of kindButtons) b.addEventListener('click', () => { kind = b.dataset.kind; choose(); });
  for (const b of lengthButtons) b.addEventListener('click', () => { length = b.dataset.length; choose(); });
  for (const b of levelButtons) b.addEventListener('click', () => { level = zeilLevel = Number(b.dataset.level); choose(); });
  for (const b of disciplineButtons) {
    b.addEventListener('click', () => { level = b.dataset.discipline === ROEIEN ? ROEIEN : zeilLevel; choose(); });
  }
  press(kindButtons, kind, 'kind'); press(lengthButtons, length, 'length'); pressLevel();
  startButton.addEventListener('click', () => startRound(kind, length, false));
  wrongButton.addEventListener('click', () => startRound(kind, length, true));

  // clearing the score asks first, inline: no window.confirm
  const askConfirm = (on) => { clearConfirm.hidden = !on; clearButton.hidden = on || !(store.totaal.goed + store.totaal.fout); };
  clearButton.addEventListener('click', () => askConfirm(true));
  $('quiz-clear-no').addEventListener('click', () => askConfirm(false));
  $('quiz-clear-yes').addEventListener('click', () => {
    clearStore();
    refreshPanel();
    askConfirm(false);
  });

  /** How a round would look from here: how much is in view, how long it would be, the total score. */
  function refreshPanel() {
    store = readStore() ?? store;                  // what another viewer on the page has scored counts too
    const ready = eligible(kind);
    const wanted = pool.filter(inLevel);
    const inView = wanted.filter(there).length;
    warning.hidden = inView >= wanted.length * ENOUGH;
    warning.textContent = `Nu zijn ${inView} van de ${wanted.length} onderdelen te zien.`
      + (level === ROEIEN ? ' Zet de modus op Roeien om alles te kunnen oefenen.'
        : ' Zet de boot in de zeilstand om alles te kunnen oefenen.');
    startButton.disabled = !ready.length;
    const rounds = Math.min(LENGTHS[length], ready.length);
    startButton.textContent = ready.length ? `Start · ${rounds} ${rounds === 1 ? 'vraag' : 'vragen'}` : 'Niets te oefenen';
    const wrong = wrongPool();
    wrongButton.hidden = !wrong.length;
    wrongButton.textContent = `Oefen je fouten (${wrong.length})`;
    const { goed, fout, beste } = store.totaal;
    totalLine.textContent = goed + fout ? `${pct(goed, goed + fout)}% goed · beste reeks ${beste}` : 'Nog geen score';
    if (clearConfirm.hidden) clearButton.hidden = !(goed + fout);
  }

  // ---------------------------------------------------------------- debug.quiztabellen
  // The configuration as it was actually resolved: every entry with the names and ids it ended up
  // with, an id that matches no loaded part marked, and what this browser has scored on it. Below
  // it, every part of the model that no entry asks about - which is what says whether a `weg` or
  // an `erbij` landed where it was meant to.
  const debugPanel = $('quiz-debug');
  const debugBody = $('quiz-debug-body');
  const showDebug = (on) => { debugPanel.hidden = !on; if (on) buildTables(); };

  if (config?.debug?.quiztabellen) {
    $('quiz-tables').hidden = false;
    $('quiz-tables').addEventListener('click', () => showDebug(true));
    $('quiz-debug-close').addEventListener('click', () => showDebug(false));
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !debugPanel.hidden && engaged?.()) showDebug(false);
    }, { signal });
  }

  /** One table, from a header row and the rows under it; a cell may be [text, className]. */
  function makeTable(headers, body) {
    const node = document.createElement('table');
    const head = document.createElement('tr');
    for (const text of headers) head.append(el('th', null, text));
    node.append(head);
    for (const cells of body) {
      const tr = document.createElement('tr');
      for (const cell of cells) {
        const [text, className] = Array.isArray(cell) ? cell : [cell, null];
        const td = el('td', className, String(text));
        if (String(text).length > 28) td.classList.add('wide');
        tr.append(td);
      }
      node.append(tr);
    }
    return node;
  }

  /** Ids as one cell, each one marked when the model has no such part. */
  const idCell = (list) => {
    const span = el('span', null);
    list.forEach(({ id, ok }, i) => {
      if (i) span.append(document.createTextNode(' '));
      span.append(el('span', ok ? null : 'ontbreekt', id));
    });
    return span;
  };

  function buildTables() {
    const rows = table.map((e) => {
      const stats = store.per[e.nr] ?? { goed: 0, fout: 0 };
      const tr = document.createElement('tr');
      const cells = [String(e.nr), e.naam, e.niveau === null ? '–' : String(e.niveau), e.roeien ? 'ja' : '', '', '',
                     e.eigen ? 'eigen' : '', `${stats.goed}/${stats.fout}`];
      cells.forEach((text, i) => {
        const td = el('td', i === 6 && e.eigen ? 'eigen' : null, text);
        if (i === 1) td.classList.add('wide');
        if (i === 4) { td.replaceChildren(idCell(e.delen)); td.classList.add('wide'); }
        if (i === 5) { td.replaceChildren(idCell(e.ook)); td.classList.add('wide'); }
        if (!e.gevraagd) td.classList.add('ontbreekt');
        tr.append(td);
      });
      return tr;
    });
    const entryTable = document.createElement('table');
    const head = document.createElement('tr');
    for (const text of ['nr', 'naam', 'zeilen', 'roeien', 'delen', 'ook', 'eigen', 'goed/fout']) head.append(el('th', null, text));
    entryTable.append(head, ...rows);

    const covered = new Set(table.flatMap((e) => [...e.delen, ...e.ook]).map((d) => d.id));
    const rest = parts.filter((p) => !covered.has(p.extras.id))
      .sort((a, b) => a.extras.naam.localeCompare(b.extras.naam, 'nl'))
      .map((p) => [p.extras.id, p.extras.naam, p.extras.groep ?? '']);

    debugBody.replaceChildren(
      el('h3', null, `Vragen (${table.filter((e) => e.gevraagd).length} van ${table.length} bruikbaar)`),
      el('p', null, 'Rood: een id dat in het geladen model niet bestaat. Een hele rode rij wordt niet gevraagd.'),
      entryTable,
      el('h3', null, `Onderdelen zonder vraag (${rest.length} van ${parts.length})`),
      makeTable(['id', 'naam', 'groep'], rest),
    );
  }

  /**
   * The panel follows the mode while it is open, the same cheap poll the parts list uses. The popover
   * also closes without its toggle (a click outside it, Escape, a round or a run starting): the poll
   * sees the panel gone from view and stops itself, and a question to wipe the score goes with it.
   */
  const quizPanel = $('quiz');
  function panelToggled(open) {
    clearInterval(panelPoll);
    panelPoll = null;
    askConfirm(false);
    if (!open) return;
    refreshPanel();
    panelPoll = setInterval(() => (quizPanel.offsetParent === null ? panelToggled(false) : refreshPanel()), 400);
  }

  // ---------------------------------------------------------------- the card
  const card = el('div', null);
  card.id = 'quiz-card'; card.className = 'focus-card';
  card.hidden = true;
  const count = el('span', 'count');
  const score = el('span', 'score');
  const stop = Object.assign(el('button', 'stop', '\u00d7'), { type: 'button', title: 'Stoppen' });
  stop.setAttribute('aria-label', 'Stoppen');
  const bar = el('div', 'bar'); const barFill = el('span', null); bar.append(barFill);
  const head = el('div', 'head');
  head.append(count, bar, score, stop);
  const vraag = el('div', 'vraag');
  const hint = el('div', 'hint');
  const big = el('div', 'big');                          // the score of a finished round
  const answers = el('div', 'answers');
  const typed = Object.assign(document.createElement('input'), {
    type: 'text', className: 'typed', autocomplete: 'off', autocapitalize: 'off', spellcheck: false,
    placeholder: 'Typ de naam…', ariaLabel: 'Naam van het onderdeel',
  });
  const feedback = el('div', 'feedback');
  const actions = el('div', 'actions');
  const primary = Object.assign(el('button', 'primary'), { type: 'button' });
  const extra = Object.assign(el('button', 'extra'), { type: 'button' });
  const secondary = Object.assign(el('button', 'link-button secondary'), { type: 'button' });
  actions.append(secondary, extra, primary);             // the main action on the right
  card.append(head, big, vraag, hint, answers, typed, feedback, actions);
  wrap.append(card);
  // the control bar closes its popover on a pointerdown outside it; the card keeps its own presses
  card.addEventListener('pointerdown', (e) => e.stopPropagation());
  // what the card hides of the boat from below is handed to the viewer, which lifts the picture
  // clear of it; at the top, while typing on a phone, it is left alone
  const coverage = () => {
    if (card.hidden || card.classList.contains('typing')) { setCovered?.(0); return; }
    setCovered?.(Math.max(0, Math.round(wrap.getBoundingClientRect().bottom - card.getBoundingClientRect().top)));
  };
  const cardWatch = new ResizeObserver(coverage);
  cardWatch.observe(card); cardWatch.observe(wrap);
  onDestroy?.(() => cardWatch.disconnect());
  stop.addEventListener('click', () => (round.done || !(round.goed + round.fout) ? closeRound() : showResults()));

  // the text field keeps every key to itself: no arrows to the camera, no 1-4 to the answers
  typed.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') { e.preventDefault(); submitTyped(); }
    if (e.key === 'Escape') { e.preventDefault(); typed.value = ''; }
  });
  // on a phone the keyboard comes up over the bottom of the viewer: while the field has the
  // focus the card stands at the top instead
  typed.addEventListener('focus', () => { card.classList.toggle('typing', touch.matches); coverage(); });
  typed.addEventListener('blur', () => { card.classList.remove('typing'); coverage(); });

  let onPrimary = null;
  let onSecondary = null;
  let onExtra = null;
  primary.addEventListener('click', () => onPrimary?.());
  secondary.addEventListener('click', () => onSecondary?.());
  extra.addEventListener('click', () => onExtra?.());

  /**
   * The buttons under the card; a label of null leaves that button out, and a main button without
   * a function stands there greyed out - so the card does not grow the moment it becomes of use.
   */
  function setActions(primaryText, primaryFn, secondaryText, secondaryFn, extraText = null, extraFn = null) {
    primary.hidden = !primaryText; primary.textContent = primaryText ?? ''; onPrimary = primaryFn;
    primary.disabled = !primaryFn;
    secondary.hidden = !secondaryText; secondary.textContent = secondaryText ?? ''; onSecondary = secondaryFn;
    extra.hidden = !extraText; extra.textContent = extraText ?? ''; onExtra = extraFn;
    actions.hidden = !primaryText && !secondaryText && !extraText;
  }

  function setFeedback(text, mood = null) {
    feedback.replaceChildren();
    feedback.className = `feedback${mood ? ` ${mood}` : ''}`;
    for (const m of ['goed', 'fout', 'bijna']) card.classList.toggle(m, mood === m);   // the whole card shows it
    // while a question is open its line is kept, empty, so the answer does not make the card grow
    feedback.hidden = !text && !question;
    feedback.classList.toggle('leeg', !text);
    if (!text) { feedback.textContent = '\u00a0'; return; }
    if (MARKS[mood]) feedback.append(el('span', 'mark', MARKS[mood]));
    feedback.append(el('span', 'tekst', text));
  }

  function refreshHead() {
    const done = round.index + (question?.answered ? 1 : 0);
    count.textContent = `${Math.min(round.index + 1, round.queue.length)} / ${round.queue.length}`;
    barFill.style.width = `${(done / round.queue.length) * 100}%`;
    score.textContent = round.streak >= 2 ? `reeks ${round.streak}` : '';   // a streak is worth mentioning from two on
  }

  // ---------------------------------------------------------------- quiz mode
  let round = null;        // { kind, length, fouten, queue, index, goed, fout, streak, best, wrong, done }
  let question = null;     // { entry, type, names, lit, pending, answered }

  /**
   * For as long as the round runs there is only the boat and the card: every panel is closed and
   * .lv.quiz-on takes the buttons away, which also keeps out of reach whatever would name a part.
   */
  function setQuizOn(on) {
    wrap.classList.toggle('quiz-on', on);
    card.hidden = !on;
    coverage();
    if (!on) return;
    for (const [panel, close] of closePanel) if (panel !== 'toestand') close();   // the debug aid stays
  }

  // ---------------------------------------------------------------- kies: four parts at once
  // main.js paints the selection and the hover; a colour per part is handed to it through
  // setHighlights, so nothing here writes to a material behind its back.
  let pulsing = null;      // { entry, colour, since }: the part of the chip under the pointer breathes
  let pulseFrame = 0;

  const litColours = () => (question?.lit ?? [])
    .flatMap(({ entry, colour }) => entry.delen.map((p) => [p, colour]));

  function showLit() {
    setHighlights(litColours());
  }

  function stopPulse() {
    cancelAnimationFrame(pulseFrame);
    pulseFrame = 0;
    pulsing = null;
  }

  function pulse(lit) {
    if (!lit || question?.answered) return;
    stopPulse();
    pulsing = { ...lit, since: performance.now() };
    const white = new THREE.Color(0xffffff);
    const step = () => {
      if (!pulsing || !question?.lit) return;
      const t = (performance.now() - pulsing.since) / 1000;
      const k = (1 - Math.cos(t * PULSE_HZ * 2 * Math.PI)) / 2 * PULSE_DEPTH;
      const glow = pulsing.colour.clone().lerp(white, k);
      setHighlights(litColours().map(([p, c]) => [p, pulsing.entry.delen.includes(p) ? glow : c]));
      pulseFrame = requestAnimationFrame(step);
    };
    step();
  }

  function unPulse() {
    if (!pulsing) return;
    stopPulse();
    if (!question?.answered) showLit();
  }

  // ---------------------------------------------------------------- a round
  function startRound(kind_, length_, fouten) {
    const ready = fouten ? wrongPool() : eligible(kind_);
    if (!ready.length) return;
    const wanted = Math.min(LENGTHS[length_], ready.length);
    const queue = fouten ? shuffle(ready.slice(0, wanted)) : draw(ready, wanted);
    round = { kind: kind_, length: length_, fouten, queue, index: 0,
              goed: 0, fout: 0, streak: 0, best: 0, wrong: [], done: false };
    setQuizOn(true);
    ask();
  }

  /** Clears whatever the last question left behind, in the scene and on the card. */
  function clearQuestion() {
    stopPulse();
    big.hidden = true;
    card.classList.remove('results');
    setHighlights([]);
    select([]);
    answers.replaceChildren();
    answers.hidden = true;
    typed.hidden = true;
    typed.value = '';
    typed.disabled = false;
    setFeedback(null);
  }

  const setHint = (text) => { hint.textContent = text; hint.hidden = !text; };

  function ask() {
    const entry = round.queue[round.index];
    let type = typeFor(entry, round.kind);
    let lit = type === 'kies' ? partsFor(entry) : null;
    if (type === 'kies' && !lit) type = 'benoemen';           // not enough parts beside it to choose from
    question = { entry, type, names: null, lit: null, pending: null, answered: false };
    clearQuestion();
    refreshHead();
    // the main button is there from the start, greyed out until there is something to do with it
    setActions({ aanwijzen: 'Bevestigen', typen: 'Nakijken' }[type] ?? 'Volgende', null, null, null);

    if (type === 'aanwijzen') {
      vraag.textContent = `Wijs aan: ${entry.naam}`;
      setHint(touch.matches ? 'Tik het onderdeel in de boot aan.' : 'Klik het onderdeel in de boot aan.');
      return;
    }
    if (type === 'kies') {
      question.lit = lit.map((e, i) => ({ entry: e, colour: new THREE.Color(KIES[i].hex), letter: KIES[i].letter }));
      vraag.textContent = `Welke is de ${entry.naam}?`;
      setHint('Vier onderdelen lichten op: kies de goede kleur.');
      buildChips();
      showLit();
      flyTo(lit.flatMap((e) => e.delen));
      return;
    }
    // benoemen and typen both show the part itself and ask for its name
    select(entry.delen);
    flyTo(entry.delen);
    setHint('');
    if (type === 'typen') {
      vraag.textContent = 'Hoe heet dit onderdeel?';
      typed.hidden = false;
      typed.focus();
      setActions('Nakijken', submitTyped, null, null);
      return;
    }
    vraag.textContent = 'Welk onderdeel is dit?';
    question.names = namesFor(entry);
    buildAnswers();
  }

  function buildAnswers() {
    answers.className = 'answers';
    answers.replaceChildren(...question.names.map((e, i) => {
      const button = Object.assign(el('button', 'answer'), { type: 'button' });
      button.append(el('span', 'key', String(i + 1)), el('span', 'naam', e.naam));
      button.addEventListener('click', () => answer(i));
      return button;
    }));
    answers.hidden = false;
  }

  function buildChips() {
    answers.className = 'answers chips';
    answers.replaceChildren(...question.lit.map((lit, i) => {
      const button = Object.assign(el('button', 'chip'), { type: 'button' });
      button.style.setProperty('--chip', hex(KIES[i].hex));
      button.append(el('span', 'letter', lit.letter));
      button.setAttribute('aria-label', `Onderdeel ${lit.letter}`);
      button.addEventListener('click', () => answer(i));
      for (const type of ['pointerenter', 'focus']) button.addEventListener(type, () => pulse(lit));
      for (const type of ['pointerleave', 'blur']) button.addEventListener(type, unPulse);
      return button;
    }));
    answers.hidden = false;
  }

  /** Benoemen and kies: a choice is made and counts at once. */
  function answer(i) {
    if (!question || question.answered) return;
    const { entry, type } = question;
    const list = type === 'kies' ? question.lit.map((l) => l.entry) : question.names;
    if (!list) return;
    const right = list[i] === entry;
    for (const [j, button] of [...answers.children].entries()) {
      button.disabled = true;
      if (list[j] === entry) button.classList.add('goed');
      else if (j === i) button.classList.add('fout');
    }
    stopPulse();
    setHighlights([]);
    select(entry.delen);
    flyTo(entry.delen);
    // kies named the part in the question already: what is worth saying is which one was picked
    settle(right, right ? 'Goed!'
      : type === 'kies' ? `Fout: dat is de ${list[i].naam}` : `Fout: dit is de ${entry.naam}`);
  }

  // ---------------------------------------------------------------- typen
  function submitTyped() {
    if (!question || question.answered || question.type !== 'typen') return;
    const verdict = judge(question.entry, typed.value);
    if (verdict === 'leeg') { typed.focus(); return; }
    if (verdict === 'onvolledig') {                // the head is shared: it has to be the whole name
      setFeedback('Zo heet er meer dan één. Geef de hele naam.', 'bijna');
      typed.select();
      return;
    }
    typed.disabled = true;
    settle(verdict === 'goed', verdict === 'goed'
      ? `Goed! Zo schrijf je het: ${question.entry.naam}`
      : `Fout: dit is de ${question.entry.naam}`);
  }

  // ---------------------------------------------------------------- aanwijzen
  /** A click on the model while a round runs; true when the quiz took it (so modes.click stays out). */
  function click(part, hit) {
    if (!round || round.done) return false;
    if (!question || question.type !== 'aanwijzen' || question.answered) return true;
    if (!part) { cancelPick(); return true; }
    question.pending = { part, hit };
    select([part], hit);                           // the normal selection highlight, and no name
    setFeedback(null);
    setActions('Bevestigen', confirmPick, 'Annuleren', cancelPick);
    return true;
  }

  function cancelPick() {
    if (!question?.pending) return;
    question.pending = null;
    select([]);
    setActions('Bevestigen', null, null, null);
  }

  function confirmPick() {
    const { part, hit } = question.pending ?? {};
    if (!part) return;
    const { entry } = question;
    // a gebied is right when the click landed on one of the parts it lies on AND inside the area
    const right = entry.gebied ? regionAt(entry.gebied, hit) : entry.ids.has(part.extras.id);
    question.pending = null;
    if (!right) { select(entry.delen); flyTo(entry.delen); }
    settle(right, right ? 'Goed!' : `Fout: dit is de ${part.extras.naam}`);
  }

  // ---------------------------------------------------------------- the answer is in
  function settle(right, text) {
    question.answered = true;
    round[right ? 'goed' : 'fout']++;
    round.streak = right ? round.streak + 1 : 0;
    round.best = Math.max(round.best, round.streak);
    const { nr } = question.entry; const { best } = round;
    change((s) => {
      const stats = s.per[nr] ?? (s.per[nr] = { goed: 0, fout: 0, laatst: 0 });
      stats[right ? 'goed' : 'fout']++;
      stats.laatst = Date.now();
      s.totaal[right ? 'goed' : 'fout']++;
      s.totaal.beste = Math.max(s.totaal.beste, best);
    });
    if (!right) round.wrong.push(question.entry);
    refreshHead();
    setFeedback(text, right ? 'goed' : 'fout');
    setActions('Volgende', next, null, null);
    primary.focus();
  }

  function next() {
    round.index++;
    if (round.index >= round.queue.length) showResults();
    else ask();
  }

  // ---------------------------------------------------------------- the score of the round
  function showResults() {
    round.done = true;
    question = null;
    clearQuestion();
    change((s) => { s.totaal.rondes++; });
    const total = round.goed + round.fout;
    card.classList.add('results');
    count.textContent = 'Klaar';
    barFill.style.width = '100%';
    score.textContent = '';
    big.hidden = false;
    big.textContent = `${pct(round.goed, total)}%`;
    vraag.textContent = `${round.goed} van de ${total} goed`;
    setHint(round.best >= 2 ? `Beste reeks: ${round.best} goed op rij` : '');
    const namen = [...new Set(round.wrong.map((e) => e.naam))];
    setFeedback(namen.length ? `Nog eens oefenen: ${namen.join(', ')}` : 'Alles goed!', namen.length ? null : 'goed');
    const again = wrongPool();
    setActions('Nog een ronde', () => startRound(round.kind, round.length, round.fouten), 'Andere oefening', backToPanel,
      again.length ? `Oefen je fouten (${again.length})` : null,
      again.length ? () => startRound(round.kind, round.length, true) : null);
    primary.focus();
  }

  function closeRound() {
    clearQuestion();
    round = null;
    question = null;
    setQuizOn(false);
  }

  /** Out of the round and back to the start panel, to pick something else. */
  function backToPanel() {
    closeRound();
    openLearn?.('onderdelen');
  }

  // ---------------------------------------------------------------- keyboard
  // 1-4 and A-D pick an answer, Enter confirms and goes on, Escape takes a pick back. The text
  // field of Typen swallows its own keys before they ever get here. Outside the shadow root the
  // event names the host, so what it really started on comes from its composed path - and the keys
  // only count while this viewer has the pointer or the focus.
  window.addEventListener('keydown', (e) => {
    const from = realTarget(e);
    if (!round || !engaged() || from.closest?.('input:not([type=checkbox]), textarea, select')) return;
    if (question && !question.answered && !answers.hidden) {
      const letter = KIES.findIndex((k) => k.letter === e.key.toUpperCase());
      const index = e.key >= '1' && e.key <= String(CHOICES) ? Number(e.key) - 1
        : (question.type === 'kies' && letter >= 0 ? letter : -1);
      const button = index >= 0 ? answers.children[index] : null;
      if (button) { button.click(); e.preventDefault(); return; }
    }
    if (e.key === 'Escape' && question?.pending) { cancelPick(); e.preventDefault(); }
    if (e.key === 'Enter' && from.tagName !== 'BUTTON' && !primary.hidden) { primary.click(); e.preventDefault(); }
  }, { signal });

  /**
   * Whether a locator ring may point at what is lit (the locator asks per frame). Benoemen and
   * Typen light the part as the QUESTION, so a ring is just what is wanted there; Aanwijzen and
   * Kies ask for the part to be found, and nothing at all may point at it before the answer is in.
   */
  const rings = () => !round || !question || question.answered
    || question.type === 'benoemen' || question.type === 'typen';

  onDestroy?.(() => stopPulse());
  quizToggle.disabled = false;      // the model is in: the quiz can be opened
  return { panelToggled, click, rings, active: () => Boolean(round) };
}
