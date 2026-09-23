// Handelingen: the start panel in the popover of the control bar, and the card of a run.
//
// The panel lists the operations - Zeilen hijsen and strijken, Mast strijken and zetten, Reven -
// each greyed out with its reason while its preconditions are not met (modes.js, OPS), and asks
// how: Bekijken, where it plays by itself and the step controls of the procedure come into the card,
// or Oefenen, where it stands still and every next step is a question with four options: the right
// one and steps that could be done in the state the boat is in, only not now (modes.run.question).
// An answer plays that step, the camera going first as always; a wrong one plays the right one.
//
// While a run is on the viewer is in focus mode (.lv.ops-on): only the boat and the card, like a
// round of Oefenen in the quiz, whose card this one looks like.

const NAMES = {
  hijsen: 'Zeilen hijsen', strijken: 'Zeilen strijken', mastStrijken: 'Mast strijken', mastZetten: 'Mast zetten', reven: 'Reven',
  overstag: 'Overstag (wenden)', gijpen: 'Gijpen', stormrondje: 'Stormrondje', afmeren: 'Afmeren', kopInDeWind: 'Kop in de wind leggen', afvaren: 'Afvaren van langswal',
};
const ABOUT = {
  hijsen: 'Zeilbinders af, zeil los, zeilen omhoog',
  strijken: 'Kop in de wind, anker uit, zeilen omlaag en opdoeken',
  mastStrijken: 'Fok af, tuig in de mik, mast omlaag',
  mastZetten: 'Mast omhoog, tuig terug in de vork, fok aan',
  reven: 'Een rolrif: slagen om de giek',
  overstag: 'Door de wind naar de andere boeg',
  gijpen: 'Met de achtersteven door de wind',
  stormrondje: 'Oploeven, overstag en weer afvallen: gijpen zonder gijp',
  afmeren: 'Sliplanding aan een langswal, landvasten en springen vast',
  kopInDeWind: 'Afgemeerd, wind van achteren: over de boeg draaien',
  afvaren: 'Lijnen los, afduwen, fok bak en wegzeilen',
};
const DONE = {
  hijsen: 'De zeilen staan al', strijken: 'De zeilen zijn al gestreken', mastStrijken: 'De mast ligt al', mastZetten: 'De mast staat al', reven: '', overstag: '', gijpen: '', stormrondje: '', afmeren: 'De boot ligt al afgemeerd', kopInDeWind: '', afvaren: '',
};
const MARKS = { goed: '✓', fout: '✗' };
const STORE = 'lelievlet.manoeuvres.v1';      // { v: 1, foutloos: { <op>: true } }: practised through without a mistake

const el = (tag, className, text) => Object.assign(document.createElement(tag), { className: className ?? '', textContent: text ?? '' });
const pct = (goed, total) => (total ? Math.round((goed / total) * 100) : 0);

export function initHandelingen({ ui, wrap, modes, stepProcedure, dismissProcedure, setCovered, signal, engaged, realTarget, onDestroy }) {
  const $ = (id) => ui.getElementById(id);
  const run = modes.run;
  const touch = window.matchMedia('(pointer: coarse)');

  // ---------------------------------------------------------------- what has been practised without a mistake
  // An operation practised to its end with every next step right is ticked off in the list. It lives
  // in localStorage under one key; like everywhere else the access is wrapped, so it works without.
  let flawless = {};
  try { flawless = JSON.parse(localStorage.getItem(STORE) ?? 'null')?.foutloos ?? {}; } catch { /* start from nothing */ }
  const markFlawless = (op) => {
    flawless[op] = true;
    try { localStorage.setItem(STORE, JSON.stringify({ v: 1, foutloos: flawless })); } catch { /* it works without */ }
  };

  // ---------------------------------------------------------------- the start panel
  const panel = $('ops-panel');
  const list = $('ops-list');
  const turnsRow = $('ops-turns-row'); const turnsBox = $('ops-turns');
  const modeButtons = [...panel.querySelectorAll('#ops-mode button')];
  const startButton = $('ops-start');
  let chosen = null; let mode = 'bekijken'; let turns = run.turns || 1;

  const rows = Object.keys(NAMES).map((op) => {
    const b = Object.assign(el('button', null), { type: 'button' });
    b.setAttribute('role', 'radio'); b.dataset.op = op;
    const tick = el('span', 'tick', '✓'); tick.title = 'Foutloos geoefend'; tick.hidden = true;
    b.append(tick, el('b', null, NAMES[op]), el('span', null, ABOUT[op]));
    b.addEventListener('click', () => { chosen = op; refreshPanel(); });
    list.append(b);
    return b;
  });
  for (let n = 0; n <= run.maxTurns; n++) {
    const b = Object.assign(el('button', null, n === 0 ? 'Geen' : String(n)), { type: 'button' });
    b.setAttribute('role', 'radio'); b.dataset.turns = String(n);
    b.addEventListener('click', () => { turns = n; refreshPanel(); });
    turnsBox.append(b);
  }
  for (const b of modeButtons) b.addEventListener('click', () => { mode = b.dataset.mode; refreshPanel(); });
  startButton.addEventListener('click', () => start(chosen, mode, turns));

  /** What can be done now: the rows greyed with their reason, the choice moved off one that cannot. */
  function refreshPanel() {
    const state = Object.fromEntries(run.ops().map((o) => [o.op, o]));
    const can = (op) => !state[op].blocked && !state[op].done;
    if (!chosen || !can(chosen)) chosen = rows.map((b) => b.dataset.op).find(can) ?? null;
    for (const b of rows) {
      const { op } = b.dataset; const s = state[op];
      b.disabled = !can(op);
      b.setAttribute('aria-checked', String(op === chosen));
      const sub = s.done ? DONE[op] : s.blocked ?? ABOUT[op];
      if (b.lastChild.textContent !== sub) b.lastChild.textContent = sub;
      b.querySelector('.tick').hidden = !flawless[op];
    }
    turnsRow.hidden = chosen !== 'reven';
    for (const b of turnsBox.children) {
      b.setAttribute('aria-checked', String(Number(b.dataset.turns) === turns));
      b.disabled = Number(b.dataset.turns) === run.turns;         // the rif it has now is nothing to do
    }
    if (chosen === 'reven' && turns === run.turns) turns = run.turns === 0 ? 1 : 0;
    for (const b of modeButtons) b.setAttribute('aria-checked', String(b.dataset.mode === mode));
    startButton.disabled = !chosen;
    startButton.textContent = chosen ? `${mode === 'oefenen' ? 'Oefenen' : 'Start'}: ${NAMES[chosen].toLowerCase()}` : 'Niets te doen';
  }
  // while it is in sight - its section of Oefenen shown, and that popover open - it follows the boat
  const panelWatch = setInterval(() => { if (panel.offsetParent !== null) refreshPanel(); }, 300);
  onDestroy?.(() => clearInterval(panelWatch));

  // ---------------------------------------------------------------- the card
  const card = el('div', 'focus-card');
  card.id = 'ops-card';
  card.hidden = true;
  const name = el('span', 'name');
  const count = el('span', 'count');
  const bar = el('div', 'bar'); const barFill = el('span', null); bar.append(barFill);
  const stop = Object.assign(el('button', 'stop', '×'), { type: 'button', title: 'Stoppen' });
  stop.setAttribute('aria-label', 'Stoppen');
  const head = el('div', 'head'); head.append(name, count, bar, stop);
  const big = el('div', 'big');
  const vraag = el('div', 'vraag');
  const hint = el('div', 'hint');
  const holder = el('div', 'steps');                               // the step controls of the procedure, while watched
  const answers = el('div', 'answers');
  const feedback = el('div', 'feedback');
  const actions = el('div', 'actions');
  const primary = Object.assign(el('button', 'primary'), { type: 'button' });
  const extra = Object.assign(el('button', 'extra'), { type: 'button' });
  const secondary = Object.assign(el('button', 'link-button secondary'), { type: 'button' });
  actions.append(feedback, secondary, extra, primary);             // what was right or wrong, beside Volgende
  card.append(head, big, vraag, hint, holder, answers, actions);
  wrap.append(card);
  card.addEventListener('pointerdown', (e) => e.stopPropagation());
  const procBar = $('procedure'); const procHome = procBar.parentNode; const procNext = procBar.nextSibling;

  let onPrimary = null; let onSecondary = null; let onExtra = null;
  primary.addEventListener('click', () => onPrimary?.());
  secondary.addEventListener('click', () => onSecondary?.());
  extra.addEventListener('click', () => onExtra?.());
  /** The buttons under the card; a main button without a function stands there greyed out. */
  function setActions(primaryText, primaryFn, secondaryText = null, secondaryFn = null, extraText = null, extraFn = null) {
    primary.hidden = !primaryText; primary.textContent = primaryText ?? ''; onPrimary = primaryFn; primary.disabled = !primaryFn;
    secondary.hidden = !secondaryText; secondary.textContent = secondaryText ?? ''; onSecondary = secondaryFn;
    extra.hidden = !extraText; extra.textContent = extraText ?? ''; onExtra = extraFn;
    // the row goes when it has neither a button nor a verdict in it (the feedback lives in it)
    actions.hidden = !primaryText && !secondaryText && !extraText && (feedback.hidden || feedback.classList.contains('leeg'));
  }
  /** The cross, or at the end of the run a green Klaar in its place: it closes the card either way. */
  function setDone(done) {
    if (stop.classList.contains('klaar') === done) return;
    stop.classList.toggle('klaar', done);
    stop.textContent = done ? 'Klaar' : '×';
    stop.title = done ? 'Klaar' : 'Stoppen'; stop.setAttribute('aria-label', stop.title);
  }
  function setFeedback(text, mood = null) {
    feedback.replaceChildren();
    for (const m of ['goed', 'fout']) card.classList.toggle(m, mood === m);
    feedback.classList.toggle('leeg', !text);
    if (!text) { feedback.textContent = ' '; return; }
    if (MARKS[mood]) feedback.append(el('span', 'mark', MARKS[mood]));
    feedback.append(el('span', 'tekst', text));
  }

  // what the card hides of the boat from below goes to the viewer, which lifts the picture clear of it
  const coverage = () => setCovered?.(card.hidden ? 0
    : Math.max(0, Math.round(wrap.getBoundingClientRect().bottom - card.getBoundingClientRect().top)));
  const cardWatch = new ResizeObserver(coverage);
  cardWatch.observe(card); cardWatch.observe(wrap);
  onDestroy?.(() => cardWatch.disconnect());

  // ---------------------------------------------------------------- a run
  let current = null;       // { op, mode, total, asked, goed, wrong: [], question, answered, waiting, finished }
  let tick = 0;

  function setFocus(on) {
    wrap.classList.toggle('ops-on', on);
    wrap.classList.toggle('ops-oefenen', on && current?.mode === 'oefenen');
    card.hidden = !on;
    if (on && current.mode === 'bekijken') holder.append(procBar);
    else if (procBar.parentNode !== procHome) procHome.insertBefore(procBar, procNext);
    holder.hidden = !(on && current.mode === 'bekijken');
    clearInterval(tick);
    if (on) tick = setInterval(follow, 150);
    coverage();
  }

  function start(op, how, n) {
    if (!op) return;
    modes.closePopover();
    if (!run.begin(op, { play: how === 'bekijken', turns: n })) return;
    const p = modes.procedure();
    // it counts as the whole manoeuvre only when it starts at its first step: struck halfway and then
    // hoisted from there is a part of it, and earns no tick
    const fromStart = Boolean(p) && (p.backwards ? p.t >= p.total - 1e-6 : p.t <= 1e-6);
    current = { op, mode: how, total: p?.steps.filter((s) => !s.skipped).length ?? 0, fromStart, goed: 0, fout: 0, wrong: [], question: null, answered: false, done: false };
    name.textContent = op === 'reven' ? `${NAMES[op]} · ${n === 0 ? 'rif eruit' : `${n} ${n === 1 ? 'slag' : 'slagen'}`}` : NAMES[op];
    big.hidden = true; card.classList.remove('results');
    card.classList.toggle('bekijken', how === 'bekijken');
    setDone(false);
    setFocus(true);
    follow();                                                      // the count and the bar at once, not on the next tick
    if (how === 'oefenen') ask();
    else {
      vraag.hidden = true; hint.hidden = true; answers.hidden = true; feedback.hidden = true;
      setActions(null, null);                                      // watched, it is closed with its cross
    }
  }

  /** Steps done so far, the way the run goes. */
  const doneSteps = (p) => { const live = p.steps.filter((s) => !s.skipped); return p.backwards ? live.filter((s) => s.begin >= p.t - 1e-6).length : live.filter((s) => s.end <= p.t + 1e-6).length; };

  /** Every few frames: the count and the bar, and the buttons that wait for a step to finish. */
  function follow() {
    const p = modes.procedure();
    if (!p || !current) return;
    const done = Math.min(doneSteps(p), current.total);
    count.textContent = `${Math.min(done + (current.done ? 0 : 1), current.total)} / ${current.total}`;
    barFill.style.width = `${(done / Math.max(current.total, 1)) * 100}%`;
    // watched to its end, or practised through to the result: done, and the cross says so
    setDone(current.done || (current.mode === 'bekijken' && run.finished && !p.playing));
    if (current.mode === 'bekijken') return;                       // nothing waits for it: it plays, and the cross closes it
    if (current.answered && !current.done && !p.playing && primary.disabled) {   // the step has been shown
      const last = run.finished;
      setActions(last ? 'Uitslag' : 'Volgende', last ? results : ask);
      primary.focus();
    }
  }

  function ask() {
    const q = run.question();
    if (!q) { results(); return; }
    current.question = q; current.answered = false;
    vraag.hidden = false; vraag.textContent = 'Wat is de volgende stap?';
    hint.hidden = false; hint.textContent = touch.matches ? 'Tik het goede antwoord aan.' : 'Kies het goede antwoord (1–4).';
    answers.hidden = false; feedback.hidden = false;
    answers.replaceChildren(...q.options.map((text, i) => {
      const b = Object.assign(el('button', 'answer'), { type: 'button' });
      b.append(el('span', 'key', String(i + 1)), el('span', 'naam', text));
      b.addEventListener('click', () => answer(i));
      return b;
    }));
    setFeedback(null);
    setActions('Volgende', null);
  }

  function answer(i) {
    const q = current?.question;
    if (!q || current.answered) return;
    current.answered = true;
    const right = q.options[i] === q.answer;
    [...answers.children].forEach((b, j) => {
      b.disabled = true;
      if (q.options[j] === q.answer) b.classList.add('goed');
      else if (j === i) b.classList.add('fout');
    });
    current[right ? 'goed' : 'fout']++;
    if (!right) current.wrong.push(q.answer);
    setFeedback(right ? 'Goed!' : `Fout: eerst ${q.answer.toLowerCase()}`, right ? 'goed' : 'fout');
    stepProcedure(run.direction);                                  // the step is shown: the camera goes first
  }

  function results() {
    current.done = true;
    if (current.mode === 'oefenen' && current.fromStart && current.fout === 0 && current.goed === current.total) markFlawless(current.op);
    card.classList.add('results');
    answers.hidden = true; hint.hidden = true;
    const total = current.goed + current.fout;
    big.hidden = false; big.textContent = `${pct(current.goed, total)}%`;
    vraag.textContent = `${current.goed} van de ${total} stappen goed`;
    setFeedback(current.wrong.length ? `Nog eens: ${current.wrong.join(', ')}` : 'Alles in de goede volgorde!', current.wrong.length ? null : 'goed');
    setActions(null, null);                                        // closed with Klaar, where the cross was
    setDone(true);
    stop.focus();
  }

  function close() {
    current = null;
    setFeedback(null);
    setFocus(false);
    dismissProcedure?.();                                          // the bar went with the card: it does not linger
  }
  stop.addEventListener('click', close);

  // 1-4 pick an answer, Enter goes on - only while this viewer has the pointer or the focus
  window.addEventListener('keydown', (e) => {
    if (!current || !engaged() || realTarget(e).closest?.('input:not([type=checkbox]), textarea, select')) return;
    if (current.mode === 'oefenen' && !current.answered && e.key >= '1' && e.key <= '4') {
      answers.children[Number(e.key) - 1]?.click(); e.preventDefault(); return;
    }
    if (e.key === 'Enter' && realTarget(e).tagName !== 'BUTTON' && !primary.hidden && !primary.disabled) { primary.click(); e.preventDefault(); }
  }, { signal });
  onDestroy?.(() => clearInterval(tick));

  return { active: () => Boolean(current), refresh: refreshPanel };
}
