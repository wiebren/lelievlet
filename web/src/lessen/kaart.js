// The card of a lesson of Leren › Lessen: a row of onderwerpen to step through, each with its words, a
// picture, controls, one line on what the boat does now, a question to predict first, and at its foot Meer uitleg
// and Volgende - as Krachten en koppels has it (krachten/index.js, whose styling it shares: style.css). Beside the
// boat on a big screen; on a phone a sheet over nearly all of it, with a greep at its top to drag it down out of
// the way of the boat, and a bar at the foot to drag up again.
//
// The card is the same for every lesson; what is on the boat and in the picture is the lesson's own. It hands
// the card its part with koppel({ begin, antwoord, release, aanzicht }):
//   begin(les)        a new onderwerp: set the boat and the scene up, and return the rows of controls
//   antwoord(laat)    the question was answered: show the answer on the boat (`laat` of the onderwerp's vraag)
//   release()         the card closes: let go of the boat and take away what was put out
//   aanzicht()        where the camera goes now, by krachtView's names (main.js); null: it stays
//
// Each onderwerp: { id, titel, cwo, kort: [html], meer: [{ kop, tekst }], vraag?: { tekst, plaatje (html, under
// the tekst), opties: [[tekst, goed]], uitleg, laat }, zoeken?: [tab, naam], quiz?: [soort, naam] } and whatever
// the lesson itself needs. `zoeken`: a
// button on to that page of Zoeken (naarZoeken), for Zelf verkennen - the lesson only has what CWO asks, Zoeken has
// all of it; `quiz`: one on to that quiz of Leren › Quiz (naarQuiz), for the last page. A card of one onderwerp (a
// quiz of its own, lessen/voorrang-quiz.js) has no row of onderwerpen to step through; with nogEen ({ kan(), doe() })
// its Volgende gives another question (doe) once this one is answered (kan), and the lesson calls verder() then.

import { voortgang } from './voortgang.js';

const SHEET = 900;                  // px: up to this wide the card is a sheet at the foot (style.css @container)

const QUIZ_ICOON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="9"/></svg>';
const ZOEK_ICOON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6"/><path d="m15 15 5 5"/></svg>';

export function createLesKaart({ wrap, id, sleutel, titel, lessen, opslaan, fly, setCoveredRight, onOpen, naarZoeken, naarQuiz, nogEen }) {
  const card = document.createElement('aside');
  card.id = id; card.className = `les-kaart${lessen.length === 1 ? ' les-enkel' : ''}`; card.hidden = true;
  card.innerHTML = `
    ${GREEP}
    <header><h2>${titel}</h2><span><button type="button" class="link-button kr-breed-knop" aria-pressed="false">Breed</button><button type="button" class="link-button kr-sluit" aria-label="Sluiten">Sluiten</button></span></header>
    <div class="kr-nav">
      <button type="button" class="kr-vorige" aria-label="Vorige">‹</button>
      <select class="kr-lessen" aria-label="Onderwerp">${lessen.map((l, i) => `<option value="${i}">${i + 1}. ${l.titel}</option>`).join('')}</select>
      <button type="button" class="kr-volgende" aria-label="Volgende">›</button>
    </div>
    <div class="kr-lijf">
      <div class="kr-links">
        <div class="kr-schema-host"></div>
      </div>
      <div class="kr-rechts">
        <div class="kr-tekst"></div>
        <div class="kr-bediening"></div>
        <p class="kr-status" aria-live="polite"></p>
        <div class="kr-vraag"></div>
        ${MEER}
      </div>
    </div>
    ${VOET}
`;
  wrap.append(card);
  const back = document.createElement('div');
  back.className = 'kr-terug'; back.hidden = true;
  back.innerHTML = TERUG;
  wrap.append(back);
  const layer = document.createElement('div'); layer.className = 'kr-labels'; wrap.append(layer);
  const q = (sel) => card.querySelector(sel);

  let deel = { begin: () => [], antwoord: () => {}, release: () => {}, aanzicht: () => null };
  let index = 0;                                     // a lesson opens at its first onderwerp, or the one asked for (open)
  // wide, on a big screen: the picture big on the left, the words and the controls beside it (as Krachten en koppels)
  breedKnop(card, opslaan, () => requestAnimationFrame(frame));
  let open = false; let answered = false; let rows = []; let lastStatus = ''; let lastNiveau = '';
  let fresh = false;                                  // just opened: the camera goes once more on the first frame, after what the viewer did itself
  const les = () => lessen[index];
  // the row of onderwerpen, each ticked once it is gevolgd (lessen/voortgang.js)
  const vinkjes = () => q('.kr-lessen').querySelectorAll('option').forEach((o, i) => {
    o.textContent = `${i + 1}. ${lessen[i].titel}${voortgang.gevolgd(sleutel, lessen[i].id, Boolean(lessen[i].vraag), lessen[i].delen) ? ' ✓' : ''}`;
  });
  const los = voortgang.bijWijziging(() => { vinkjes(); if (open) verder(); });   // a deel gehaald may let you go on
  // an onderwerp with no picture on the left stays narrow when wide (style.css .les-zonder-plaatje)
  const plaatje = () => card.classList.toggle('les-zonder-plaatje', ![...q('.kr-schema-host').children].some((el) => el.getBoundingClientRect().height > 0));
  const renderControls = () => { for (const r of rows) r.sync?.(); plaatje(); };

  // ------------------------------------------------------------------ an onderwerp
  const show = (i) => {
    index = Math.min(Math.max(i, 0), lessen.length - 1);
    const l = les();
    q('.kr-lessen').value = String(index);
    q('.kr-vorige').disabled = index === 0;
    q('.kr-tekst').innerHTML = `${l.cwo ? `<p class="kr-chips"><span>CWO ${l.cwo}</span></p>` : ''}${l.kort.map((p) => `<p>${p}</p>`).join('')}`;
    if (l.zoeken && naarZoeken) {
      const naar = document.createElement('button'); naar.type = 'button'; naar.className = 'les-zoeken';
      naar.innerHTML = `${ZOEK_ICOON}<span>Alles in Zoeken › ${l.zoeken[1]}</span>`;
      naar.addEventListener('click', () => { setOpen(false); naarZoeken(l.zoeken[0]); });
      q('.kr-tekst').append(naar);
    }
    if (l.quiz && naarQuiz) {
      const naar = document.createElement('button'); naar.type = 'button'; naar.className = 'les-zoeken';
      naar.innerHTML = `${QUIZ_ICOON}<span>Oefenen in Leren › Quiz › ${l.quiz[1]}</span>`;
      naar.addEventListener('click', () => { setOpen(false); naarQuiz(l.quiz[0]); });
      q('.kr-tekst').append(naar);
    }
    voet.toon(l.meer ?? []);
    answered = false; renderQuestion();
    voortgang.gezien(sleutel, l.id); vinkjes(); verder();
    rows = deel.begin(l) ?? [];
    const host = q('.kr-bediening'); host.replaceChildren(...rows); host.hidden = !rows.length;
    renderControls();
    requestAnimationFrame(() => { plaatje(); frame(); });
  };
  const renderQuestion = () => {
    const v = les().vraag; const host = q('.kr-rechts > .kr-vraag');   // its own, not a question among the controls
    if (!v) { host.replaceChildren(); return; }
    host.innerHTML = `<h3>Vraag</h3><p>${v.tekst}</p>${v.plaatje ?? ''}<div class="kr-opties">${v.opties.map(([t], i) => `<button type="button" data-i="${i}">${t}</button>`).join('')}</div><p class="kr-uitleg" hidden></p>`;
    host.querySelectorAll('.kr-opties button').forEach((b) => b.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const i = Number(b.dataset.i);
      host.querySelectorAll('.kr-opties button').forEach((o, j) => { o.classList.toggle('goed', v.opties[j][1]); o.classList.toggle('fout', j === i && !v.opties[j][1]); o.disabled = true; });
      const p = host.querySelector('.kr-uitleg'); p.hidden = false;
      p.innerHTML = `<b>${v.opties[i][1] ? 'Goed!' : 'Niet helemaal.'}</b> ${v.uitleg}${v.laat ? ' <i>Kijk maar op de boot.</i>' : ''}`;
      voortgang.antwoord(sleutel, les().id, v.opties[i][1]);
      if (v.laat) deel.antwoord(v.laat);
      renderControls(); verder();
    }));
  };
  q('.kr-lessen').addEventListener('change', (e) => show(Number(e.target.value)));
  q('.kr-vorige').addEventListener('click', () => show(index - 1));
  q('.kr-volgende').addEventListener('click', () => show(index + 1));
  // on only once its question is answered (now, or on an earlier visit); after the last one: done
  const voet = lesVoet(card, () => (nogEen ? nogEen.doe() : index === lessen.length - 1 ? setOpen(false) : show(index + 1)));
  // on once its question is answered and all its delen (Voorrang: the situaties) are gehaald
  const verder = () => (nogEen ? voet.stand({ laatste: false, kan: nogEen.kan() }) : voet.stand({ laatste: index === lessen.length - 1,
    kan: (!les().vraag || answered || voortgang.gevolgd(sleutel, les().id, true)) && (les().delen ?? []).every((d) => voortgang.isGehaald(sleutel, d)) }));

  // ------------------------------------------------------------------ the camera, on what the card leaves free
  const narrow = () => wrap.clientWidth <= SHEET;
  const covers = () => {
    if (!open || card.hidden || narrow()) return 0;
    return Math.max(Math.round(wrap.getBoundingClientRect().right - card.getBoundingClientRect().left + 8), 0);
  };
  const frame = () => { if (!open) return; const a = deel.aanzicht(); if (a) fly(a, covers()); };
  let centreKey = '';
  // (only while it is open: a slide still under way when it was shut does not bring the bar back)
  const showBoat = (on) => {
    if (!open) return;
    card.hidden = on; back.hidden = !on; requestAnimationFrame(frame);
    (on ? back : card).querySelector('.les-greep')?.focus({ preventScroll: true });   // the focus goes along, not lost
  };
  veeg(card, back, showBoat);

  const setOpen = (on) => {
    if (on === open) return;
    open = on; card.hidden = !on; back.hidden = true;
    card.style.transition = ''; card.style.transform = ''; back.style.transform = '';   // a slide or drag that was going on
    wrap.classList.toggle('kr-open', on);
    if (on) { onOpen?.(); fresh = true; show(index); return; }
    deel.release();
    setCoveredRight(0); centreKey = ''; lastStatus = '';
  };
  q('.kr-sluit').addEventListener('click', () => setOpen(false));

  vinkjes();
  return {
    card, back, layer, q, host: q('.kr-schema-host'), onderwerpen: lessen,
    koppel(d) { deel = { ...deel, ...d }; },
    /** Whether it is open (lk.open itself opens it). */
    get geopend() { return open; },
    get les() { return les(); },
    get bladOpen() { return !card.hidden; },
    /** Open it at its first onderwerp - or at the one with that id, when one is given (Zoeken › Begrippen). */
    open: (id) => {
      const i = Math.max(lessen.findIndex((l) => l.id === id), 0);
      if (open) { show(i); return; }
      index = i; setOpen(true);
    },
    close: () => setOpen(false),
    renderControls, frame, verder, again: () => show(index),
    /** Every frame, before the lesson's own: false when the card is shut (or has just been, by Leren). */
    tick(width) {
      if (!open) return false;
      // a manoeuvre or a quiz round from Leren takes the whole screen: the lesson is done with
      if (wrap.classList.contains('ops-on') || wrap.classList.contains('quiz-on')) { setOpen(false); return false; }
      if (fresh) { fresh = false; frame(); }
      if (card.hidden && !back.hidden && width > SHEET) showBoat(false);
      const key = `${width} ${open} ${card.hidden} ${card.className}`;
      if (key !== centreKey) { centreKey = key; setCoveredRight(covers()); }
      return true;
    },
    /** The line on what the boat does now; `niveau` how bad that is: '' (all well), 'geel', 'oranje' or 'rood' (danger), as Krachten has it. */
    status(text, niveau = '') {
      if (text !== lastStatus) { q('.kr-status').textContent = text; back.querySelector('p').textContent = text; lastStatus = text; }
      if (niveau === lastNiveau) return;
      for (const el of [q('.kr-status'), back]) { el.classList.remove(`kr-${lastNiveau}`); if (niveau) el.classList.add(`kr-${niveau}`); }
      lastNiveau = niveau;
    },
    dispose() { setOpen(false); los(); card.remove(); back.remove(); layer.remove(); },
  };
}

// ------------------------------------------------------------------ how bad a meaning is
/**
 * The colour of the status line for a meaning (of a sign, a signal, a light): 'rood' for a verbod or danger, 'oranje'
 * for what calls for care (a current, a ship coming straight at you, something that cannot be done safely), 'geel'
 * for wait or watch out (traffic from the other side), '' for all well. Sentence by sentence: the worst one counts.
 */
const ERNST = ['', 'geel', 'oranje', 'rood'];
const VERBOD = /verboden|mag(?:en)? (?:je |hier )?niet|niet (?:in|uit|door)varen/i;
const zin = (t) => {
  if (/nog verboden|nog niet|zo meteen (toegestaan|wel|gespuid)/i.test(t)) return 'geel';
  if (/^Je mag alleen tussen/.test(t)) return 'geel';                   // only that way through: a verbod beside it
  // what each of the lights of a bridge or lock means, one by one: no verbod of the moment
  if (/\brood\b/i.test(t) && /\bgroen\b[^.]*?(toegestaan|mag)/i.test(t)) return 'geel';
  if (/zonder gevaar|gevaar te voorkomen|gevaar voor aanvaring/i.test(t)) return 'oranje';
  // a verbod on what a lelievlet going by does not do - lie, anchor or moor there, come aboard: watch out, no more
  if ((VERBOD.test(t) || /\bnooit\b/i.test(t)) && /ligplaats|ankeren|meren|aan boord|langszij/i.test(t)) return 'geel';
  // (gevaar itself, not gevaarlijk: a ship with gevaarlijke stoffen is one to keep clear of, below)
  if (VERBOD.test(t) || /\bgevaar\b|\bnood/i.test(t)) return 'rood';
  if (/gevaarlijk|gespuid|ingelaten|stroming|recht op je af/i.test(t)) return 'oranje';
  if (/engte|let op|kan verkeer van de andere kant|tegenliggers|klein schip moet voorrang geven|geef je voorrang|laag genoeg/i.test(t)) return 'geel';
  return '';
};
// sentence by sentence - not at a colon, which belongs to its sentence ('…: dat is verboden')
export function ernst(tekst = '') {
  return ERNST[Math.max(0, ...tekst.split(/(?<=[.!?])\s+/).map((t) => ERNST.indexOf(zin(t))))];
}

// ------------------------------------------------------------------ wide or narrow
// One choice for all the lessons, Krachten en koppels too: opened wide, every lesson opens wide.

const BREED = 'lelievlet.lessen.breed';
const kaarten = new Set();
let breed = null;

/** The Breed / Smal button in the card's header (.kr-breed-knop); na() after a change, for the camera. */
export function breedKnop(card, opslaan, na) {
  if (breed === null) { breed = false; if (opslaan) try { breed = localStorage.getItem(BREED) === '1'; } catch { /* private mode */ } }
  const knop = card.querySelector('.kr-breed-knop');
  // one label, Breed, pressed while it is wide (a label that changed as well would say 'Smal, pressed' while wide)
  const zet = () => { card.classList.toggle('kr-breed', breed); knop.setAttribute('aria-pressed', String(breed)); knop.textContent = 'Breed'; };
  kaarten.add(zet); zet();
  knop.addEventListener('click', () => {
    breed = !breed;
    if (opslaan) try { localStorage.setItem(BREED, breed ? '1' : '0'); } catch { /* private mode */ }
    for (const z of kaarten) z();
    na();
  });
  return () => breed;
}

// ------------------------------------------------------------------ the greep, the foot, and the bar back
// The same on the card of Krachten en koppels (krachten/index.js).

export const GREEP = '<button type="button" class="les-greep" aria-label="Laat de boot zien"><i></i><span>Laat boot zien</span></button>';
export const MEER = '<div class="kr-meer" hidden><div class="kr-meer-body"></div></div>';
export const VOET = '<div class="les-voet"><button type="button" class="les-meer-knop" aria-expanded="false">Meer uitleg</button><button type="button" class="les-verder">Volgende</button></div>';
export const TERUG = '<button type="button" class="les-greep" aria-label="Terug naar de les"><i></i><span>Terug naar de les</span></button><p></p>';

/** The foot of the card: Meer uitleg opens its text above the foot, Volgende (Klaar on the last) calls verder. */
export function lesVoet(card, verder) {
  const q = (sel) => card.querySelector(sel);
  const knop = q('.les-meer-knop'); const meer = q('.kr-meer'); const door = q('.les-verder');
  const zetMeer = (on) => {
    meer.hidden = !on; knop.setAttribute('aria-expanded', String(on)); knop.textContent = on ? 'Minder uitleg' : 'Meer uitleg';
    if (on) meer.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  };
  knop.addEventListener('click', () => zetMeer(meer.hidden));
  door.addEventListener('click', verder);
  return {
    /** A new onderwerp, with its [{ kop, tekst }]: no button without them. */
    toon(list) {
      q('.kr-meer-body').innerHTML = list.map((m) => `<h4>${m.kop}</h4><p>${m.tekst}</p>`).join('');
      knop.hidden = !list.length; zetMeer(false);
    },
    /** Whether it is the last onderwerp, and whether one may go on; the › at the top always goes, answered or not. */
    stand({ laatste, kan }) {
      door.textContent = laatste ? 'Klaar' : 'Volgende ›'; door.disabled = !kan;
      q('.kr-volgende').disabled = laatste;
    },
  };
}

/** On a phone: the greep at the top of the card, dragged down or tapped, shows the boat (showBoat(true)); the bar at
 *  the foot, dragged up or tapped, brings the card back. The card follows the finger down, and slides. */
export function veeg(card, back, showBoat) {
  const SLIDE = 'transform 0.22s ease-out';
  const naarBoot = () => {
    card.style.transition = SLIDE; card.style.transform = 'translateY(100%)';
    setTimeout(() => { card.style.transition = ''; card.style.transform = ''; if (!card.hidden) showBoat(true); }, 220);
  };
  const naarLes = () => {
    back.style.transform = ''; showBoat(false);
    card.style.transition = 'none'; card.style.transform = 'translateY(100%)';
    void card.offsetHeight;                           // from there, not from where it ends
    card.style.transition = SLIDE; card.style.transform = '';
    setTimeout(() => { card.style.transition = ''; }, 220);
  };
  // a drag of more than DRAG px goes; less than TIK px is a tap, and the click that follows does it
  const DRAG = 60; const TIK = 8;
  const sleep = (el, omlaag, beweeg, klaar) => {
    let y0 = null; let dy = 0; let gesleept = false;
    el.addEventListener('pointerdown', (e) => { y0 = e.clientY; dy = 0; gesleept = false; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => {
      if (y0 === null) return;
      dy = e.clientY - y0;
      if (Math.abs(dy) > TIK) beweeg(omlaag ? Math.max(dy, 0) : Math.min(dy, 0));
    });
    const los = () => {
      if (y0 === null) return;
      y0 = null;
      if (Math.abs(dy) <= TIK) return;
      gesleept = true;
      if (omlaag ? dy > DRAG : dy < -DRAG / 2) klaar(); else beweeg(0, true);
    };
    el.addEventListener('pointerup', los); el.addEventListener('pointercancel', los);
    el.addEventListener('click', () => { if (gesleept) { gesleept = false; return; } klaar(); });
  };
  sleep(card.querySelector('.les-greep'), true, (dy, terug) => {
    card.style.transition = terug ? SLIDE : 'none'; card.style.transform = dy ? `translateY(${dy}px)` : '';
  }, naarBoot);
  sleep(back, false, (dy, terug) => {
    back.style.transition = terug ? SLIDE : 'none'; back.style.transform = dy ? `translateY(${Math.max(dy, -40)}px)` : '';
  }, naarLes);
}

// ------------------------------------------------------------------ rows of controls
// Each a row of the card, with sync() to show what is set now: get() reads it, set(v) changes it.

/** One of a few, as a segmented control; klaar(value): whether that one is done (shown green). */
export function segmented(label, options, get, set, klaar = null) {
  const row = document.createElement('div'); row.className = 'kr-rij';
  row.innerHTML = `<span>${label}</span><div class="segmented" role="radiogroup" aria-label="${label}">${options.map(([v, t]) => `<button type="button" role="radio" data-v="${v}">${t}</button>`).join('')}</div>`;
  const buttons = [...row.querySelectorAll('button')];
  buttons.forEach((b, i) => b.addEventListener('click', () => set(options[i][0])));
  row.sync = () => buttons.forEach((b, i) => { b.setAttribute('aria-checked', String(get() === options[i][0])); if (klaar) b.classList.toggle('klaar', klaar(options[i][0])); });
  return row;
}

/** A slider; zegt(v): the word for where it is, ends: the words at its two ends. */
export function schuif(label, { min, max, step }, get, set, zegt, ends) {
  const row = document.createElement('label'); row.className = 'kr-rij kr-schuif';
  row.innerHTML = `<span>${label} <b></b></span><input type="range" min="${min}" max="${max}" step="${step}">${ends ? `<small><i>${ends[0]}</i><i>${ends[1]}</i></small>` : ''}`;
  const input = row.querySelector('input'); const value = row.querySelector('b');
  input.addEventListener('input', () => set(Number(input.value)));
  row.sync = () => { if (!input.matches(':active') && Number(input.value) !== get()) input.value = String(get()); value.textContent = zegt(get()); };
  return row;
}

/** One of many, in groups, as a list to choose from: groepen [[groep, [[value, text]]]]; klaar(value): a ✓ after it. */
export function keuze(label, groepen, get, set, klaar = null) {
  const row = document.createElement('label'); row.className = 'kr-rij les-keuze';
  row.innerHTML = `<span>${label}</span><select>${groepen.map(([g, list]) => `<optgroup label="${g}">${list.map(([v, t]) => `<option value="${v}">${t}</option>`).join('')}</optgroup>`).join('')}</select>`;
  const select = row.querySelector('select');
  select.addEventListener('change', () => set(select.value));
  const teksten = new Map([...select.options].map((o) => [o.value, o.textContent]));
  row.sync = () => {
    if (klaar) for (const o of select.options) o.textContent = `${teksten.get(o.value)}${klaar(o.value) ? ' ✓' : ''}`;
    if (select.value !== get()) select.value = get();
  };
  return row;
}

/**
 * One of several, as a segmented control - running over more lines when there are many or long ones. (A list to
 * choose from, keuze, only where the list is too long for that: Zelf verkennen, all situaties at once.)
 */
export function kies(label, options, get, set, klaar = null) {
  const row = segmented(label, options, get, set, klaar);
  if (options.length > 3 || options.reduce((n, [, t]) => n + String(t).length, 0) > 30) row.classList.add('les-veel');
  return row;
}

/** A row of buttons: [[key, text, primary?]]; klik(key); kan(key): whether it can be pressed now; aan(key): whether it is the one chosen. */
export function knoppen(buttons, klik, kan = () => true, aan = () => false) {
  const row = document.createElement('div'); row.className = 'kr-rij zt-knoppen';
  row.innerHTML = buttons.map(([k, t, primary]) => `<button type="button" data-k="${k}"${primary ? ' class="primary"' : ''}>${t}</button>`).join('');
  const list = [...row.querySelectorAll('button')];
  list.forEach((b) => b.addEventListener('click', () => klik(b.dataset.k)));
  row.sync = () => list.forEach((b) => { b.disabled = !kan(b.dataset.k); b.setAttribute('aria-pressed', String(aan(b.dataset.k))); });
  return row;
}
