// Which onderwerpen of the lessons have been gevolgd: one key in localStorage for all of them, by the lesson's key
// (as in the list of Leren › Lessen) and the onderwerp's id - not its place in the row, so a lesson that is later
// split up per niveau, or put in another order, keeps what was done. Per onderwerp: when it was seen, and the first
// answer to its vraag. An onderwerp counts as gevolgd once it was seen and, if it has a question, that was
// answered.
//
//   { v: 1, lessen: { [les]: { [onderwerp]: { gezien: ms, antwoord?: 'goed' | 'fout' }, [deel]: { gehaald: ms } } },
//     quizzen?: { [quiz]: { goed, fout } } }
//
// A deel is a part of an onderwerp with a question of its own (Voorrang: a situatie, 'zeilen:Jij: wind over
// stuurboord'); it is gehaald once answered right, and an onderwerp with delen counts only when all of them are.
//
// Like everywhere else the access is wrapped: without storage (or with aanpassen.opslaan false) it works for
// this visit only.

const KEY = 'lelievlet.lessen.v1';
let staat = null;
let opslaan = true;
const luisteraars = new Set();

const lees = () => {
  if (staat) return staat;
  staat = { v: 1, lessen: {} };
  if (!opslaan) return staat;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (saved?.v === 1 && saved.lessen && typeof saved.lessen === 'object') staat = saved;
  } catch { /* nothing kept, or something else under the key */ }
  return staat;
};
/** What is stored now, read afresh: another tab (or the installed app) may have written since. */
const vers = () => { if (opslaan) staat = null; return lees(); };
const schrijf = () => {
  if (opslaan) try { localStorage.setItem(KEY, JSON.stringify(staat)); } catch { /* it works without */ }
  for (const fn of luisteraars) fn();
};

export const voortgang = {
  /** false: nothing is read or written (config aanpassen.opslaan). */
  set opslaan(on) { opslaan = on; staat = null; },
  /** The onderwerp was opened. */
  gezien(les, id) {
    const s = vers(); const l = (s.lessen[les] ??= {});
    if (l[id]?.gezien) return;
    l[id] = { ...l[id], gezien: Date.now() }; schrijf();
  },
  /** Its vraag was answered; only the first answer is kept. */
  antwoord(les, id, goed) {
    const s = vers(); const l = (s.lessen[les] ??= {});
    if (l[id]?.antwoord) return;
    l[id] = { gezien: Date.now(), ...l[id], antwoord: goed ? 'goed' : 'fout' }; schrijf();
  },
  /** A deel answered right; it stays gehaald. */
  gehaald(les, id) {
    const s = vers(); const l = (s.lessen[les] ??= {});
    if (l[id]?.gehaald) return;
    l[id] = { ...l[id], gehaald: Date.now() }; schrijf();
  },
  /** Whether that deel was answered right. */
  isGehaald(les, id) { return Boolean(lees().lessen[les]?.[id]?.gehaald); },
  /** Whether it counts as gevolgd: seen, its question (if it has one: `vraag`) answered, and all its `delen` gehaald. */
  gevolgd(les, id, vraag = false, delen = []) {
    const o = lees().lessen[les]?.[id];
    return Boolean(o?.gezien && (!vraag || o.antwoord) && delen.every((d) => this.isGehaald(les, d)));
  },
  /** How many of `onderwerpen` ([{ id, vraag, delen }]) are gevolgd. */
  telling(les, onderwerpen) {
    return { gevolgd: onderwerpen.filter((o) => this.gevolgd(les, o.id, Boolean(o.vraag), o.delen)).length, van: onderwerpen.length };
  },
  /** An answer in a quiz that keeps no score of its own (Voorrang, Zeiltermen): counted for the logboek. */
  quiz(naam, goed) {
    const s = vers(); const q = ((s.quizzen ??= {})[naam] ??= { goed: 0, fout: 0 });
    q[goed ? 'goed' : 'fout'] += 1; schrijf();
  },
  /** Its { goed, fout } so far, or null. */
  quizScore(naam) { return lees().quizzen?.[naam] ?? null; },
  /** fn() after every change. */
  bijWijziging(fn) { luisteraars.add(fn); return () => luisteraars.delete(fn); },
};
