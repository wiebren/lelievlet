// Oefenen, Verkeerstekens: a quiz on the borden, tonnen and seinen of Zoeken (zoeken.js hands them
// over, each with its picture, its name and what it means you must do). Only what CWO asks about
// comes in. The kinds of exercise:
// - zien: the picture on the card; one question asks what it is called, the next what it means or
//   what you must do (a tonne: how you pass it) - the two mixed
// - herkennen: a name or a meaning on the card, which of four pictures is it
// - water: it stands out on the water, seen from the helm; what is it, or what must you do
// - gemengd: the three by turns
// The wrong answers are drawn from the same kind of thing, and from its own group first (a red sign
// beside red signs, a lock beside locks), so the picture alone does not give it away. The card looks
// and works like the one of Onderdelen (quiz.js), and so does the score, kept in this browser.

import { TYPING } from '../config.js';

const CHOICES = 4;
const LENGTHS = { 10: 10, 20: 20, alles: Infinity };
const TYPES = ['zien', 'herkennen', 'water'];
const SOORTEN = { alles: ['bord', 'ton', 'sein'], borden: ['bord'], tonnen: ['ton'], seinen: ['sein'] };
const MARKS = { goed: '✓', fout: '✗' };
const STORE = 'lelievlet.verkeerstekens.v1';

const el = (tag, className, text) => { const n = document.createElement(tag); if (className) n.className = className; if (text != null) n.textContent = text; return n; };
const shuffle = (list) => { const a = [...list]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pct = (a, total) => Math.round((100 * a) / Math.max(total, 1));

// what a question asks for: 'naam' (what it is called) or 'doen' (what it means, what you must do)
const VRAAG = {
  naam: { bord: 'Hoe heet dit bord?', ton: 'Hoe heet deze markering?' },
  doen: { bord: 'Wat betekent dit bord?', ton: 'Hoe vaar je langs deze markering?', sein: 'Wat betekent dit sein?' },
};
const HERKEN = { bord: 'Welk bord hoort hierbij?', ton: 'Welke markering hoort hierbij?', sein: 'Welk sein hoort hierbij?' };
/** Naam or doen, as the entry allows: a signal has no name worth asking (it says what it looks like). */
const askFor = (e) => (e.soort === 'sein' || !e.naam ? 'doen' : !e.doen ? 'naam' : Math.random() < 0.5 ? 'naam' : 'doen');
const textOf = (e, about) => (about === 'doen' ? e.doen : e.naam);
/**
 * What makes two answers different enough to tell apart: a meaning by its first sentence (E.10a to f
 * all start "Je vaart op een nevenvaarwater…" and differ only in the drawing), a name without what is
 * in brackets at its end ("splitsing (d)" and "(e)", "in de richting van de pijl" and "… (staand)").
 */
const gistOf = (e, about) => (about === 'doen' ? (e.doen ?? '').split(/(?<=[.!?])\s/)[0] : (e.naam ?? '').replace(/\s*\([^)]*\)$/, '').toLowerCase());
/**
 * Signs that mean the same and differ only in their drawing never stand in one question together: one
 * of them would be as right as the other. B.1a and b (the arrow lying or standing), B.9a and b, the
 * crossings E.9 and E.10; and, asked what to do, every mark kept to bakboord going up, or to stuurboord -
 * a red spar, a red buoy and a stomp steekbaken are passed alike.
 */
const FAMILIES = [/^B\.1[ab]$/, /^B\.9[ab]$/, /^E\.9[a-i]$/, /^E\.10[a-f]$/];
/**
 * Signs that look alike and mean something else: the wrong answers come from among them first, so a question
 * asks for the difference that matters - the crossing seen from the nevenvaarwater (B.9) or from the
 * hoofdvaarwater (E.9, E.10), the arrow you must follow or are advised to (B.1, D.3), the ruiten that forbid or
 * advise (A.10, D.2), and the signs over the opening of a fixed bridge.
 */
const LOOKALIKES = [
  /^(B\.9[ab]|E\.9[a-i]|E\.10[a-f])$/, /^(B\.1[ab]|D\.3[abc])$/, /^(A\.10|D\.2)$/, /^(A\.1|D\.1[ab])$/,
  /^vast-(a10|d2|a1|d1a|d1b)$/,
];
function familyOf(e, about) {
  if (e.soort === 'bord') { const f = FAMILIES.find((r) => r.test(e.id)); if (f) return String(f); }
  // a mark passed on the same side going up (opvarend) is passed the same way, whatever it looks like
  if (e.soort === 'ton' && about === 'doen') { const m = (e.doen ?? '').match(/opvarend[^.]*?aan (bakboord|stuurboord)/i); if (m) return m[1].toLowerCase(); }
  if (/^bpr-3\.30-/.test(e.id)) return 'nood';
  // a board over a fixed bridge and the lights that may stand in for it say the same
  if (/^vast-.*-licht$/.test(e.id)) return `${e.soort}:${e.id.replace(/-licht$/, '')}`;                     // a flag swung round or a flag with a ball: both ask for help
  return `${e.soort}:${e.id}`;
}

/**
 * ui, wrap: the viewer's shadow root and its wrapper; zoeken: the signs, marks and signals
 * (entries()) and taking what was put on the water away again (release()); closePanels(): every panel
 * shut for the round; openLearn(kind): back to the Oefenen panel; opslaan: whether the score is kept;
 * engaged, realTarget, signal: as main.js.
 */
export function initTekenQuiz({ ui, wrap, zoeken, closePanels, openLearn, opslaan = true, engaged, realTarget, signal }) {
  const $ = (id) => ui.getElementById(id);

  // ---------------------------------------------------------------- the score, kept in localStorage
  // { v: 1, totaal: { goed, fout, rondes, beste }, per: { '<soort>:<id>': { goed, fout, laatst, mis } }, keuze: { soort, kind, length } }
  const EMPTY = { goed: 0, fout: 0, rondes: 0, beste: 0 };
  const fresh = () => ({ totaal: { ...EMPTY }, per: {}, keuze: {} });
  function readStore() {
    if (!opslaan) return null;
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) ?? 'null');
      return raw?.totaal ? { totaal: { ...EMPTY, ...raw.totaal }, per: raw.per ?? {}, keuze: raw.keuze ?? {} } : null;
    } catch { return null; }
  }
  let store = readStore() ?? fresh();
  /** One change, made to what is stored right now (another viewer on the page may have added to it). */
  function change(fn) {
    const now = readStore() ?? store;
    fn(now); store = now;
    if (!opslaan) return;
    try { localStorage.setItem(STORE, JSON.stringify({ v: 1, ...store })); } catch { /* it works without */ }
  }
  const keyOf = (e) => `${e.soort}:${e.id}`;
  const statsOf = (e) => store.per[keyOf(e)] ?? { goed: 0, fout: 0, laatst: 0 };

  // ---------------------------------------------------------------- the start panel
  let soort = store.keuze.soort ?? 'alles'; let kind = store.keuze.kind ?? 'zien'; let length = store.keuze.length ?? '10';
  const pick = (group, attr, value, set) => {
    const buttons = [...$(group).querySelectorAll('button')];
    const press = (v) => { for (const x of buttons) x.setAttribute('aria-checked', String(x.dataset[attr] === v)); };
    if (!buttons.some((b) => b.dataset[attr] === value)) value = buttons[0].dataset[attr];
    press(value); set(value);
    for (const b of buttons) {
      b.addEventListener('click', () => {
        press(b.dataset[attr]); set(b.dataset[attr]);
        change((s) => { s.keuze = { soort, kind, length }; });
        refreshPanel();
      });
    }
  };
  pick('teken-soort', 'soort', soort, (v) => { soort = v; });
  pick('teken-kind', 'kind', kind, (v) => { kind = v; });
  pick('teken-length', 'length', length, (v) => { length = v; });

  /** What can be asked: only what CWO asks about, of the kind chosen. */
  const pool = (s = soort) => zoeken.entries().filter((e) => e.cwo && SOORTEN[s].includes(e.soort));
  /** What went wrong the last time it was asked, of the kind chosen. */
  const wrongPool = () => pool().filter((e) => statsOf(e).mis);
  /** Light spaced repetition: what went wrong, or was never asked, comes first; what went well later. */
  const weight = (e) => { const s = statsOf(e); return (s.mis ? 4 : 0) + (s.goed + s.fout ? 1 / (1 + s.goed - s.fout) : 2) + Math.random() * 1.5; };

  const askConfirm = (on) => { clearConfirm.hidden = !on; clearButton.hidden = on; };
  const startButton = $('teken-start'); const wrongButton = $('teken-wrong');
  const totalLine = $('teken-total'); const clearButton = $('teken-clear'); const clearConfirm = $('teken-clear-confirm');
  function refreshPanel() {
    store = readStore() ?? store;
    askConfirm(false);                                           // 'Score wissen?' does not outlive the panel
    const ready = pool();
    const rounds = Math.min(LENGTHS[length], ready.length);
    startButton.disabled = !ready.length;
    startButton.textContent = ready.length ? `Start · ${rounds} ${rounds === 1 ? 'vraag' : 'vragen'}` : 'Niets te oefenen';
    const wrong = wrongPool();
    wrongButton.hidden = !wrong.length;
    wrongButton.textContent = `Oefen je fouten (${wrong.length})`;
    const { goed, fout, beste } = store.totaal;
    totalLine.textContent = goed + fout ? `${pct(goed, goed + fout)}% goed · beste reeks ${beste}` : 'Nog geen score';
    if (clearConfirm.hidden) clearButton.hidden = !(goed + fout);
  }
  clearButton.addEventListener('click', () => askConfirm(true));
  $('teken-clear-no').addEventListener('click', () => askConfirm(false));
  $('teken-clear-yes').addEventListener('click', () => { change((s) => { s.totaal = { ...EMPTY }; s.per = {}; }); askConfirm(false); refreshPanel(); });
  startButton.addEventListener('click', () => startRound());
  wrongButton.addEventListener('click', () => startRound(true));

  // ---------------------------------------------------------------- the card
  const card = el('div', 'focus-card teken-card'); card.id = 'teken-card'; card.hidden = true;
  const count = el('span', 'count'); const score = el('span', 'score');
  const stop = Object.assign(el('button', 'stop', '×'), { type: 'button', title: 'Stoppen' }); stop.setAttribute('aria-label', 'Stoppen');
  const bar = el('div', 'bar'); const barFill = el('span'); bar.append(barFill);
  const head = el('div', 'head'); head.append(count, bar, score, stop);
  const big = el('div', 'big'); const vraag = el('div', 'vraag'); const hint = el('div', 'hint');
  const plaat = Object.assign(el('img', 'teken-plaat'), { alt: '' });
  const answers = el('div', 'answers'); const feedback = el('div', 'feedback');
  const actions = el('div', 'actions');
  const primary = Object.assign(el('button', 'primary'), { type: 'button' });
  const extra = Object.assign(el('button', 'extra'), { type: 'button' });
  const secondary = Object.assign(el('button', 'link-button secondary'), { type: 'button' });
  actions.append(secondary, extra, primary);
  card.append(head, big, vraag, hint, plaat, answers, feedback, actions);
  wrap.append(card);
  card.addEventListener('pointerdown', (e) => e.stopPropagation());   // the column's popovers keep out of it

  let onPrimary = null; let onSecondary = null; let onExtra = null;
  primary.addEventListener('click', () => onPrimary?.());
  secondary.addEventListener('click', () => onSecondary?.());
  extra.addEventListener('click', () => onExtra?.());
  function setActions(primaryText, primaryFn, secondaryText = null, secondaryFn = null, extraText = null, extraFn = null) {
    primary.hidden = !primaryText; primary.textContent = primaryText ?? ''; onPrimary = primaryFn; primary.disabled = !primaryFn;
    secondary.hidden = !secondaryText; secondary.textContent = secondaryText ?? ''; onSecondary = secondaryFn;
    extra.hidden = !extraText; extra.textContent = extraText ?? ''; onExtra = extraFn;
    actions.hidden = !primaryText && !secondaryText && !extraText;
  }
  function setFeedback(text, mood = null) {
    feedback.replaceChildren();
    feedback.className = `feedback${mood ? ` ${mood}` : ''}`;
    for (const m of ['goed', 'fout']) card.classList.toggle(m, mood === m);
    feedback.classList.toggle('leeg', !text);
    if (!text) { feedback.textContent = '\u00a0'; return; }   // the empty line kept, so an answer does not make the card grow
    if (MARKS[mood]) feedback.append(el('span', 'mark', MARKS[mood]));
    feedback.append(el('span', 'tekst', text));
  }
  const setHint = (text) => { hint.textContent = text ?? ''; hint.hidden = !text; };
  const showPicture = (e) => { plaat.src = e.src(); plaat.hidden = false; plaat.classList.toggle('breed', Boolean(e.breed)); };

  // ---------------------------------------------------------------- a round
  let round = null;       // { kind, queue, index, goed, fout, streak, best, wrong, done, fouten }
  let question = null;    // { entry, type, about, options, answered, chosen }

  function setOn(on) {
    wrap.classList.toggle('quiz-on', on);
    card.hidden = !on;
    if (on) closePanels();
  }

  function startRound(fouten = false) {
    const ready = fouten ? wrongPool() : pool();
    if (!ready.length) return;
    const wanted = Math.min(LENGTHS[length], ready.length);
    const queue = shuffle(ready.map((e) => [weight(e), e]).sort((a, b) => b[0] - a[0]).slice(0, wanted).map(([, e]) => e));
    round = { soort, kind, queue, index: 0, goed: 0, fout: 0, streak: 0, best: 0, wrong: [], done: false, fouten };
    setOn(true);
    ask();
  }

  /** Three others of the same kind, its lookalikes first, then its own group: none that reads the same, none of the same family. */
  function distractors(entry, by, about) {
    const same = zoeken.entries().filter((e) => e.cwo && e.soort === entry.soort && e !== entry && by(e) && by(e) !== by(entry));
    const seen = new Set([by(entry)]); const families = new Set([familyOf(entry, about)]); const out = [];
    const alike = LOOKALIKES.find((r) => r.test(entry.id));
    const like = (x) => alike?.test(x.id);
    for (const e of [...shuffle(same.filter(like)), ...shuffle(same.filter((x) => !like(x) && x.groep === entry.groep)),
      ...shuffle(same.filter((x) => !like(x) && x.groep !== entry.groep))]) {
      if (out.length === CHOICES - 1) break;
      if (seen.has(by(e)) || families.has(familyOf(e, about))) continue;
      seen.add(by(e)); families.add(familyOf(e, about)); out.push(e);
    }
    return out;
  }

  function refreshHead() {
    const done = round.index + (question?.answered ? 1 : 0);
    count.textContent = `${Math.min(round.index + 1, round.queue.length)} / ${round.queue.length}`;
    barFill.style.width = `${(done / round.queue.length) * 100}%`;
    score.textContent = round.streak >= 2 ? `reeks ${round.streak}` : '';
  }

  function clearQuestion() {
    big.hidden = true; card.classList.remove('results');
    plaat.hidden = true; plaat.removeAttribute('src');
    vraag.classList.remove('lang');
    answers.replaceChildren(); answers.hidden = true;
    setFeedback(null);
  }

  function ask() {
    if (round.index >= round.queue.length) { showResults(); return; }
    const entry = round.queue[round.index];
    const type = round.kind === 'gemengd' ? TYPES[Math.floor(Math.random() * TYPES.length)] : round.kind;
    const about = askFor(entry);
    // pictures told apart by what they are asked as; a picture that goes with the same words would be right as well
    const by = (e) => gistOf(e, about);
    const options = shuffle([entry, ...distractors(entry, by, about)]);
    question = { entry, type, about, options, answered: false };
    if (type !== 'water') zoeken.release();                      // in Gemengd: what the last question put out goes
    card.classList.toggle('herkennen', type === 'herkennen');
    clearQuestion(); refreshHead();
    setActions('Volgende', null);
    if (type === 'herkennen') {
      // the question is the name or the meaning itself, said in full; which picture goes with it
      vraag.textContent = entry.soort === 'sein' ? `${entry.groep}: ${textOf(entry, about)}` : textOf(entry, about);
      vraag.classList.toggle('lang', vraag.textContent.length > 60);
      setHint(HERKEN[entry.soort]);
      answers.className = `answers plaatjes${entry.breed ? ' breed' : ''}`;
      answers.replaceChildren(...options.map((e, i) => {
        const b = Object.assign(el('button', 'answer plaatje'), { type: 'button' });
        b.append(el('span', 'key', String(i + 1)), Object.assign(el('img'), { src: e.src(), alt: '' }));
        b.setAttribute('aria-label', `Plaatje ${i + 1}`);
        b.addEventListener('click', () => answer(i));
        return b;
      }));
    } else {
      vraag.textContent = VRAAG[about][entry.soort];
      if (type === 'water') {
        setHint(entry.ahead ? 'Kijk vooruit, vanaf het roer.' : 'Kijk opzij, vanaf het roer.');
        entry.place({ helm: true });
      } else {
        setHint(null);
        showPicture(entry);
      }
      answers.className = `answers${about === 'doen' ? ' lang' : ''}`;
      answers.replaceChildren(...options.map((e, i) => {
        const b = Object.assign(el('button', 'answer'), { type: 'button' });
        b.append(el('span', 'key', String(i + 1)), el('span', 'naam', textOf(e, about)));
        b.addEventListener('click', () => answer(i));
        return b;
      }));
    }
    answers.hidden = false;
  }

  function answer(i) {
    if (!question || question.answered) return;
    const { entry, options, type } = question;
    const right = options[i] === entry;
    question.chosen = i;
    for (const [j, b] of [...answers.children].entries()) {
      b.disabled = true;
      if (options[j] === entry) b.classList.add('goed'); else if (j === i) b.classList.add('fout');
    }
    question.answered = true;
    round[right ? 'goed' : 'fout']++;
    round.streak = right ? round.streak + 1 : 0; round.best = Math.max(round.best, round.streak);
    if (!right) round.wrong.push(entry);
    const { best } = round;
    change((s) => {
      const stats = s.per[keyOf(entry)] ?? (s.per[keyOf(entry)] = { goed: 0, fout: 0, laatst: 0 });
      stats[right ? 'goed' : 'fout']++; stats.laatst = Date.now(); stats.mis = !right;
      s.totaal[right ? 'goed' : 'fout']++; s.totaal.beste = Math.max(s.totaal.beste, best);
    });
    refreshHead();
    // what it was, in full: its name and what it means
    const said = entry.soort === 'sein' ? `${entry.groep}, ${entry.naam}. ${entry.doen}`
      : `${entry.soort === 'bord' ? `${entry.id} ` : ''}${entry.naam}.${entry.doen ? ` ${entry.doen}` : ''}`;
    if (type === 'herkennen') showPicture(entry);
    setFeedback(right ? `Goed! ${said}` : `Fout. ${said}`, right ? 'goed' : 'fout');
    setActions(round.index + 1 < round.queue.length ? 'Volgende' : 'Uitslag', next);
    primary.focus();
  }

  function next() { round.index++; ask(); }

  function showResults() {
    round.done = true; question = null;
    clearQuestion(); zoeken.release();
    change((s) => { s.totaal.rondes++; });
    const total = round.goed + round.fout;
    card.classList.add('results');
    count.textContent = 'Klaar'; barFill.style.width = '100%'; score.textContent = '';
    big.hidden = false; big.textContent = `${pct(round.goed, total)}%`;
    vraag.textContent = `${round.goed} van de ${total} goed`;
    setHint(round.best >= 2 ? `Beste reeks: ${round.best} goed op rij` : '');
    const wrong = [...new Set(round.wrong)];
    setFeedback(wrong.length ? `Nog eens oefenen: ${wrong.map((e) => (e.soort === 'bord' ? e.id : e.naam)).join(', ')}` : 'Alles goed!', wrong.length ? null : 'goed');
    const again = wrongPool();
    setActions('Nog een ronde', () => startRound(round.fouten), 'Andere oefening', backToPanel,
      again.length ? `Oefen je fouten (${again.length})` : null, again.length ? () => startRound(true) : null);
    primary.focus();
  }

  function closeRound() {
    clearQuestion(); zoeken.release();
    round = null; question = null;
    setOn(false);
  }
  function backToPanel() { closeRound(); openLearn('verkeerstekens'); }
  stop.addEventListener('click', () => (round?.done || !(round?.goed + round?.fout) ? closeRound() : showResults()));

  // 1-4 pick an answer, Enter goes on - only while this viewer has the pointer or the focus
  window.addEventListener('keydown', (e) => {
    if (!round || !engaged() || e.ctrlKey || e.metaKey || e.altKey || realTarget(e).closest?.(TYPING)) return;
    if (question && !question.answered && e.key >= '1' && e.key <= String(CHOICES)) { answers.children[Number(e.key) - 1]?.click(); e.preventDefault(); return; }
    if (e.key === 'Enter' && realTarget(e).tagName !== 'BUTTON' && !primary.hidden && !primary.disabled) { primary.click(); e.preventDefault(); }
  }, { signal });

  /**
   * The round as it stands, for a report: the question that is open and the four answers in the order
   * shown (the card is not on the screenshot). Melden shows the sign asked about only once it is answered.
   */
  const info = () => round && {
    soort: round.soort, oefening: round.kind, vraag: `${Math.min(round.index + 1, round.queue.length)} / ${round.queue.length}`,
    goed: round.goed, fout: round.fout, fouten: round.fouten, klaar: round.done,
    type: question?.type, over: question?.about,
    teken: question ? { soort: question.entry.soort, id: question.entry.id, naam: question.entry.naam } : undefined,
    opties: question?.options.map((e) => `${e.id}: ${question.type === 'herkennen' ? e.naam : textOf(e, question.about)}`),
    gekozen: question?.chosen, beantwoord: question ? question.answered : undefined,
  };
  return { active: () => Boolean(round), stop: () => round && closeRound(), refresh: refreshPanel, info };
}
