import * as THREE from 'three';
import { QUIZ } from './quizdata.js';
import { regionAt } from './regions.js';

// Oefenen: a quiz over the numbered names of the parts drawing of the class (quizdata.js). Five
// kinds of exercise, all drawn from the same pool:
//   aanwijzen  a name is given and the part has to be clicked (pick first, then Bevestigen)
//   benoemen   the part is highlighted and flown to, and four names are offered
//   typen      the part is highlighted and its name has to be typed, forgivingly judged
//   kies       a name is given and four parts light up, each in its own colour: pick the right one
//   los        the part is shown on its own, without the rest of the boat, then four names
// and Gemengd, which draws a kind per question from the ones the entry allows.
//
// While a round runs the viewer is in quiz mode (body.quiz-on): the hover tooltip, the info tile,
// the progress bar and the parts list are all out of reach, and a click on the model goes to the
// quiz instead of to the selection and to modes.click - nothing may name a part but the card.
//
// An entry none of whose `delen` is in the loaded model is left out silently (Wantketting is still
// being modelled); the ones that fell away are logged once. Entries whose parts are not there in
// the mode the boat is in (the sails while rowing) are left out of the round as well, and so are
// the ones above the chosen niveau - as long as quizdata.js names one at all.
//
// The stats per entry and the all-time totals live in localStorage under one key; every access is
// wrapped, so the quiz works just as well without storage.

const STORE = 'lelievlet.quiz.v1';
const LENGTHS = { 10: 10, 20: 20, alles: Infinity };
const CHOICES = 4;                     // names offered by benoemen and los, parts lit by kies
const ENOUGH = 0.8;                    // below this share of the pool in view the panel says so
const TOP_LEVEL = 3;                   // CWO III: everything, and where an entry without a niveau lands

// kies: four parts light up at once, each in its own colour, with a chip of that colour on the
// card. Blue is left out: it is the colour the viewer already hovers parts in.
const KIES = [{ letter: 'A', hex: 0xe01b24 }, { letter: 'B', hex: 0x26a269 },
              { letter: 'C', hex: 0xc061cb }, { letter: 'D', hex: 0xe5a50a }];
const PULSE_HZ = 2.2;                  // how fast the part of a hovered chip breathes
const PULSE_DEPTH = 0.55;              // how far towards white it goes
const KIN = 0.5;                       // a rival of the same groep counts as half as far away
const KIN_SAMPLES = 24;                // vertices sampled per mesh to say where a part stands

// los: the part hangs alone in front of a plain background, framed from the same corner the iso
// view looks from and turning slowly until the user takes the controls
const LOS_DIR = new THREE.Vector3(-0.55, 0.35, 0.78).normalize();
const LOS_MARGIN = 1.25;               // how much room is left around it: it has to fill the view
const LOS_NEAR = 0.05;                 // m: the closest the camera may come while it is isolated
const LOS_SPIN = 1.6;                  // OrbitControls' own unit; slow enough to read the shape
const LOS_MS = 420;                    // the flight to the isolated part is short: nothing on the way
const LOS_SPREAD = 3;                  // shells this much further apart than the biggest of them are
const LOS_CLUSTER = 1.2;               // a set of look-alikes: one of them is framed, not the field
const LOS_SHELLS = 200000;             // above this many indices a mesh is framed whole: no splitting

const MARKS = { goed: '✓', fout: '✗' };   // 'bijna' - the name was not wrong, only not enough - gets none

const _v = new THREE.Vector3();

const el = (tag, className, text) => Object.assign(document.createElement(tag), { className, textContent: text ?? '' });
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
 * the alternatives it names itself ("Dirk of kraanlijn", "Halshoek of -broek"). A head that
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

export function initQuiz({ parts, camera, controls, scene, select, flyTo, startFlight,
                           setHighlights, partVisible, closePanel }) {
  // ---------------------------------------------------------------- the pool
  const byId = new Map(parts.map((p) => [p.extras.id, p]));
  const pool = [];
  const dropped = [];
  for (const q of QUIZ) {
    const delen = q.delen.map((id) => byId.get(id)).filter(Boolean);
    if (!delen.length) { dropped.push(`${q.nr} ${q.naam}`); continue; }
    const ook = (q.ook ?? []).map((id) => byId.get(id)).filter(Boolean);
    pool.push({
      nr: q.nr, naam: q.naam, delen, los: Boolean(q.los), niveau: q.niveau ?? TOP_LEVEL,
      ids: new Set([...delen, ...ook].map((p) => p.extras.id)),   // a click on any of these is right
      gebied: delen.find((p) => p.extras.gebied) ?? null,         // Boeg, Kleed: an area, not an object
      groep: delen[0].extras.groep, woorden: new Set(wordsOf(q.naam)), staart: tailOf(q.naam),
      keys: keysOf(q.naam),
    });
  }
  if (dropped.length) {
    console.info(`Quiz: ${dropped.length} of ${QUIZ.length} names left out, no such part in the model: ${dropped.join(', ')}`);
  }

  // which entries answer to a given typed name: a head that only one entry has is enough by itself
  const owners = new Map();
  for (const entry of pool) {
    for (const key of entry.keys) owners.set(key, [...(owners.get(key) ?? []), entry]);
  }
  const levelled = QUIZ.some((q) => q.niveau);     // no niveau anywhere: the selector stays away

  // the isolated part is lit like any other: the lights are told to light layer 1 as well
  scene.traverse((o) => { if (o.isLight) o.layers.enableAll(); });

  // ---------------------------------------------------------------- the score, kept in localStorage
  // { v: 1, totaal: { goed, fout, rondes, beste }, per: { <nr>: { goed, fout, laatst } } }
  const EMPTY = { goed: 0, fout: 0, rondes: 0, beste: 0 };
  let store = { totaal: { ...EMPTY }, per: {} };

  function loadStore() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) ?? 'null');
      if (raw?.totaal) store = { totaal: { ...EMPTY, ...raw.totaal }, per: raw.per ?? {} };
    } catch { /* no storage, or it holds something else: start from nothing */ }
  }
  function saveStore() {
    try { localStorage.setItem(STORE, JSON.stringify({ v: 1, ...store })); } catch { /* it works without */ }
  }
  function clearStore() {
    store = { totaal: { ...EMPTY }, per: {} };
    try { localStorage.removeItem(STORE); } catch { /* nothing to clear */ }
  }
  loadStore();

  const statsOf = (entry) => store.per[entry.nr] ?? { goed: 0, fout: 0, laatst: 0 };

  // ---------------------------------------------------------------- picking the questions
  /** What can be asked right now: in the model, up to the niveau, there in the mode the boat is in. */
  const there = (entry) => entry.delen.some(partVisible);
  const supports = (entry, kind) => (kind === 'los' ? entry.los : kind === 'kies' ? !entry.gebied : true);
  const eligible = (kind) => pool.filter((e) => e.niveau <= level && supports(e, kind) && there(e));

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
    if (entry.los) options.push('los');
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
  const quizToggle = document.getElementById('quiz-toggle');
  const partsToggle = document.getElementById('parts-toggle');
  const startButton = document.getElementById('quiz-start');
  const wrongButton = document.getElementById('quiz-wrong');
  const totalLine = document.getElementById('quiz-total');
  const warning = document.getElementById('quiz-warning');
  const kindButtons = [...document.querySelectorAll('#quiz-kind button')];
  const lengthButtons = [...document.querySelectorAll('#quiz-length button')];
  const levelButtons = [...document.querySelectorAll('#quiz-level button')];
  const clearButton = document.getElementById('quiz-clear');
  const clearConfirm = document.getElementById('quiz-clear-confirm');
  let kind = 'aanwijzen';
  let length = '10';
  let level = TOP_LEVEL;
  let panelPoll = null;

  for (const node of [document.getElementById('quiz-level'), document.getElementById('quiz-level-head')]) {
    node.hidden = !levelled;
  }
  const press = (buttons, value, attr) => {
    for (const b of buttons) b.setAttribute('aria-pressed', String(b.dataset[attr] === String(value)));
  };
  for (const b of kindButtons) {
    b.addEventListener('click', () => { kind = b.dataset.kind; press(kindButtons, kind, 'kind'); refreshPanel(); });
  }
  for (const b of lengthButtons) {
    b.addEventListener('click', () => { length = b.dataset.length; press(lengthButtons, length, 'length'); refreshPanel(); });
  }
  for (const b of levelButtons) {
    b.addEventListener('click', () => { level = Number(b.dataset.level); press(levelButtons, level, 'level'); refreshPanel(); });
  }
  document.getElementById('quiz-close').addEventListener('click', () => closePanel.get('quiz')());
  startButton.addEventListener('click', () => startRound(kind, length, false));
  wrongButton.addEventListener('click', () => startRound(kind, length, true));

  // clearing the score asks first, inline: no window.confirm
  const askConfirm = (on) => { clearConfirm.hidden = !on; clearButton.hidden = on; };
  clearButton.addEventListener('click', () => askConfirm(true));
  document.getElementById('quiz-clear-no').addEventListener('click', () => askConfirm(false));
  document.getElementById('quiz-clear-yes').addEventListener('click', () => {
    clearStore();
    askConfirm(false);
    refreshPanel();
  });

  /** How a round would look from here: how much is in view, how long it would be, the total score. */
  function refreshPanel() {
    const ready = eligible(kind);
    const inView = pool.filter(there).length;
    warning.hidden = inView >= pool.length * ENOUGH;
    warning.textContent = `Nu zijn ${inView} van de ${pool.length} onderdelen te zien.`
      + ' Zet de boot in de zeilstand om alles te kunnen oefenen.';
    startButton.disabled = !ready.length;
    const rounds = Math.min(LENGTHS[length], ready.length);
    startButton.textContent = ready.length ? `Start (${rounds} ${rounds === 1 ? 'vraag' : 'vragen'})` : 'Start';
    const wrong = wrongPool();
    wrongButton.hidden = !wrong.length;
    wrongButton.textContent = `Oefen fouten (${wrong.length})`;
    const { goed, fout, rondes, beste } = store.totaal;
    totalLine.textContent = goed + fout
      ? `In totaal: ${goed} goed · ${fout} fout · ${pct(goed, goed + fout)}% · ${rondes} ${rondes === 1 ? 'ronde' : 'rondes'} · beste reeks ${beste}`
      : 'Nog geen score.';
  }

  /** The panel follows the mode while it is open, the same cheap poll the parts list uses. */
  function panelToggled(open) {
    clearInterval(panelPoll);
    panelPoll = null;
    askConfirm(false);
    if (!open) return;
    refreshPanel();
    panelPoll = setInterval(refreshPanel, 400);
  }

  // ---------------------------------------------------------------- the card
  const card = el('div', null);
  card.id = 'quiz-card';
  card.hidden = true;
  const count = el('span', 'count');
  const score = el('span', 'score');
  const stop = Object.assign(el('button', 'link-button stop', 'Stoppen'), { type: 'button' });
  const head = el('div', 'head');
  head.append(count, score, stop);
  const vraag = el('div', 'vraag');
  const hint = el('div', 'hint');
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
  actions.append(primary, extra, secondary);
  card.append(head, vraag, hint, answers, typed, feedback, actions);
  document.body.append(card);
  // the control bar closes its popover on a pointerdown outside it; the card keeps its own presses
  card.addEventListener('pointerdown', (e) => e.stopPropagation());
  stop.addEventListener('click', () => (round.goed + round.fout ? showResults() : closeRound()));

  // the text field keeps every key to itself: no arrows to the camera, no 1-4 to the answers
  typed.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') { e.preventDefault(); submitTyped(); }
    if (e.key === 'Escape') { e.preventDefault(); typed.value = ''; }
  });

  let onPrimary = null;
  let onSecondary = null;
  let onExtra = null;
  primary.addEventListener('click', () => onPrimary?.());
  secondary.addEventListener('click', () => onSecondary?.());
  extra.addEventListener('click', () => onExtra?.());

  /** The buttons under the card; a label of null leaves that button out. */
  function setActions(primaryText, primaryFn, secondaryText, secondaryFn, extraText = null, extraFn = null) {
    primary.hidden = !primaryText; primary.textContent = primaryText ?? ''; onPrimary = primaryFn;
    secondary.hidden = !secondaryText; secondary.textContent = secondaryText ?? ''; onSecondary = secondaryFn;
    extra.hidden = !extraText; extra.textContent = extraText ?? ''; onExtra = extraFn;
    actions.hidden = !primaryText && !secondaryText && !extraText;
  }

  function setFeedback(text, mood = null) {
    feedback.replaceChildren();
    feedback.className = `feedback${mood ? ` ${mood}` : ''}`;
    feedback.hidden = !text;
    if (!text) return;
    if (MARKS[mood]) feedback.append(el('span', 'mark', MARKS[mood]));
    feedback.append(el('span', 'tekst', text));
  }

  function refreshHead() {
    count.textContent = `Vraag ${Math.min(round.index + 1, round.queue.length)} / ${round.queue.length}`;
    score.textContent = `${round.goed} goed · ${round.fout} fout · reeks ${round.streak}`;
  }

  // ---------------------------------------------------------------- quiz mode
  let round = null;        // { kind, length, fouten, queue, index, goed, fout, streak, best, wrong, done }
  let question = null;     // { entry, type, names, lit, pending, answered }

  /** Everything that would give an answer away goes out of reach for as long as the round runs. */
  function setQuizOn(on) {
    document.body.classList.toggle('quiz-on', on);
    partsToggle.disabled = on;
    quizToggle.disabled = on;
    card.hidden = !on;
    if (!on) return;
    closePanel.get('parts')();
    closePanel.get('quiz')();
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

  // ---------------------------------------------------------------- los: the part on its own
  // modes.js rewrites mesh.visible every frame, so the rest of the boat cannot be switched off.
  // Instead the part is put on layer 1 and the camera is told to look at that layer only: the boat,
  // the water and the wind arrow are all on layer 0 and fall away by themselves.
  const isolated = [];
  let isolatedOn = false;
  let nearWas = 0;
  const losBox = new THREE.Box3();

  function isolate(entry) {
    for (const p of entry.delen) {
      for (const m of p.meshes) m.traverse((o) => { o.layers.enable(1); isolated.push(o); });
    }
    isolatedOn = true;
    camera.layers.set(1);
    nearWas = controls.minDistance;
    controls.minDistance = LOS_NEAR;
    document.body.classList.add('quiz-los');
    frameLos(losFocus(entry));
    controls.autoRotate = true;
    controls.autoRotateSpeed = LOS_SPIN;
  }

  /** Puts the layers back exactly as they were, however the question or the round ended. */
  function restore() {
    if (!isolatedOn) return;
    for (const o of isolated) o.layers.disable(1);
    isolated.length = 0;
    isolatedOn = false;
    camera.layers.set(0);
    controls.minDistance = nearWas;
    controls.autoRotate = false;
    document.body.classList.remove('quiz-los');
  }
  controls.addEventListener('start', () => { controls.autoRotate = false; });   // the user takes over

  /**
   * The world box of every shell of a mesh, found by walking its triangles: one box per leuver,
   * per dol, per hijsoog. A set of look-alikes is often merged into one mesh, and the CAD body
   * handle only tells them apart where the geometry came from the CAD at all.
   */
  function shells(mesh) {
    const index = mesh.geometry.index;
    const position = mesh.geometry.attributes.position;
    mesh.updateWorldMatrix(true, false);
    if (!index || index.count > LOS_SHELLS) return [new THREE.Box3().setFromObject(mesh, true)];
    const parent = new Int32Array(position.count).fill(-1);
    const find = (i) => {
      while (parent[i] >= 0) { if (parent[parent[i]] >= 0) parent[i] = parent[parent[i]]; i = parent[i]; }
      return i;
    };
    const join = (a, b) => { const x = find(a); const y = find(b); if (x !== y) parent[x] = y; };
    for (let t = 0; t < index.count; t += 3) {
      join(index.getX(t), index.getX(t + 1));
      join(index.getX(t + 1), index.getX(t + 2));
    }
    const boxes = new Map();
    for (let t = 0; t < index.count; t++) {
      const i = index.getX(t);
      const root = find(i);
      if (!boxes.has(root)) boxes.set(root, new THREE.Box3());
      boxes.get(root).expandByPoint(_v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld));
    }
    return [...boxes.values()];
  }

  /**
   * What is framed. Normally the whole part, but a name that stands for a set of look-alikes
   * spread over the boat - leuvers, the four dollen, the hijsogen - would be a field of specks:
   * one of them, with whatever stands right against it, fills the view instead. All stay lit.
   */
  function losFocus(entry) {
    scene.updateMatrixWorld();
    const boxes = entry.delen.flatMap((p) => p.meshes).filter((m) => m.visible)
      .flatMap(shells).filter((b) => !b.isEmpty());
    const size = new THREE.Vector3();
    const whole = boxes.reduce((out, b) => out.union(b), new THREE.Box3());
    if (boxes.length < 2 || whole.isEmpty()) return whole;
    const span = (b) => b.getSize(size).length();
    const biggest = boxes.reduce((a, b) => (span(b) > span(a) ? b : a));
    const radius = Math.max(span(biggest) / 2, 0.01);
    if (span(whole) / 2 < radius * LOS_SPREAD) return whole;
    const centre = biggest.getCenter(new THREE.Vector3());
    const near = biggest.clone();
    const at = new THREE.Vector3();
    for (const b of boxes) if (b.getCenter(at).distanceTo(centre) < radius * LOS_CLUSTER) near.union(b);
    return near;
  }

  /** The part fills the view: its bounding sphere as it stands now, seen from the iso corner. */
  function frameLos(box) {
    losBox.copy(box);
    if (losBox.isEmpty()) return;
    const centre = losBox.getCenter(new THREE.Vector3());
    const radius = Math.max(losBox.getSize(new THREE.Vector3()).length() / 2, 0.02);
    const half = THREE.MathUtils.degToRad(camera.fov / 2);
    const opening = Math.min(half, Math.atan(Math.tan(half) * camera.aspect));
    const dist = Math.max(radius / Math.sin(opening) * LOS_MARGIN, LOS_NEAR + radius);
    startFlight(centre.clone().addScaledVector(LOS_DIR, dist), centre, LOS_MS);
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
    restore();
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
    setActions(null, null, null, null);

    if (type === 'aanwijzen') {
      vraag.textContent = `Wijs aan: ${entry.naam}`;
      setHint('Klik het onderdeel in de boot aan.');
      return;
    }
    if (type === 'kies') {
      question.lit = lit.map((e, i) => ({ entry: e, colour: new THREE.Color(KIES[i].hex), letter: KIES[i].letter }));
      vraag.textContent = `Welke is de ${entry.naam}?`;
      setHint('Vier onderdelen lichten op; kies de goede letter.');
      buildChips();
      showLit();
      flyTo(lit.flatMap((e) => e.delen));
      return;
    }
    // benoemen, typen and los all show the part itself and ask for its name
    if (type === 'los') { isolate(entry); setHint('Het onderdeel is uit de boot gelicht; je kunt er omheen draaien.'); }
    else { select(entry.delen); flyTo(entry.delen); setHint(''); }
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

  /** Benoemen, los and kies: a choice is made and counts at once. */
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
    restore();                                     // the boat comes back around the part
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
    setActions(null, null, null, null);
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
    const stats = store.per[question.entry.nr] ?? (store.per[question.entry.nr] = { goed: 0, fout: 0, laatst: 0 });
    stats[right ? 'goed' : 'fout']++;
    stats.laatst = Date.now();
    store.totaal[right ? 'goed' : 'fout']++;
    round[right ? 'goed' : 'fout']++;
    round.streak = right ? round.streak + 1 : 0;
    round.best = Math.max(round.best, round.streak);
    store.totaal.beste = Math.max(store.totaal.beste, round.best);
    if (!right) round.wrong.push(question.entry);
    saveStore();
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
    store.totaal.rondes++;
    saveStore();
    const total = round.goed + round.fout;
    count.textContent = `${round.index} van de ${round.queue.length}`;
    score.textContent = '';
    vraag.textContent = 'Ronde klaar';
    setHint(`${round.goed} goed · ${round.fout} fout · ${pct(round.goed, total)}% · beste reeks ${round.best}`);
    const namen = [...new Set(round.wrong.map((e) => e.naam))];
    setFeedback(namen.length ? `Nog eens oefenen: ${namen.join(', ')}` : 'Alles goed!', namen.length ? null : 'goed');
    const again = wrongPool();
    setActions('Nog een ronde', () => startRound(round.kind, round.length, round.fouten), 'Klaar', closeRound,
      again.length ? `Oefen fouten (${again.length})` : null,
      again.length ? () => startRound(round.kind, round.length, true) : null);
    primary.focus();
  }

  function closeRound() {
    clearQuestion();
    round = null;
    question = null;
    setQuizOn(false);
  }

  // ---------------------------------------------------------------- keyboard
  // 1-4 and A-D pick an answer, Enter confirms and goes on, Escape takes a pick back. The text
  // field of Typen swallows its own keys before they ever get here.
  window.addEventListener('keydown', (e) => {
    if (!round || e.target.closest?.('input:not([type=checkbox]), textarea, select')) return;
    if (question && !question.answered && !answers.hidden) {
      const letter = KIES.findIndex((k) => k.letter === e.key.toUpperCase());
      const index = e.key >= '1' && e.key <= String(CHOICES) ? Number(e.key) - 1
        : (question.type === 'kies' && letter >= 0 ? letter : -1);
      const button = index >= 0 ? answers.children[index] : null;
      if (button) { button.click(); e.preventDefault(); return; }
    }
    if (e.key === 'Escape' && question?.pending) { cancelPick(); e.preventDefault(); }
    if (e.key === 'Enter' && e.target.tagName !== 'BUTTON' && !primary.hidden) { primary.click(); e.preventDefault(); }
  });

  quizToggle.disabled = false;      // the model is in: the quiz can be opened
  return { panelToggled, click, active: () => Boolean(round) };
}
