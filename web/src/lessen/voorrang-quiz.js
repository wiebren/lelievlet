import { createLesKaart } from './kaart.js';
import { createVoorrangBeeld } from './voorrang-beeld.js';
import { oefenSituaties, SOORT } from './voorrang-oefen.js';
import { voortgang } from './voortgang.js';

// Leren › Quiz › Voorrang: ever new situaties to practise the voorrang on, made from the rules (lessen/voorrang-oefen.js),
// makkelijk, normaal or moeilijk - chosen in Leren › Quiz; Volgende gives another of that kind at random. The boats
// are A, B (and C), one of them the lelievlet, and you say who goes first - of three, in what order they go. Then they go, the one who gives way does, and the line under the
// question says which rules decide it. The first answer counts and stays: the others can no longer be chosen. On the
// card of the lessons (lessen/kaart.js), with one onderwerp, and the water and the map of the lesson Voorrang
// (lessen/voorrang-beeld.js). The score is of this visit and this niveau only: another niveau starts it again.

const NIVEAU = { makkelijk: 'Makkelijk', normaal: 'Normaal', moeilijk: 'Moeilijk' };
const VOLGORDES = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];

export const VOORRANG_QUIZ = [{
  id: 'quiz', titel: 'Voorrang', cwo: '',
  kort: [
    'Zeg wie er voorgaat, en bij drie boten in welke volgorde. De boten heten <b>A</b>, <b>B</b> en bij moeilijk soms ook <b>C</b>; een van hen is de lelievlet. Na je antwoord varen ze, en zie je wie er wijkt en waarom. Met <b>Volgende</b> krijg je een nieuwe.',
  ],
  meer: [
    { kop: 'De volgorde', tekst: '<b>Oplopen</b>: de oploper wijkt. Anders: 1. wie de <b>stuurboordwal</b> houdt, gaat voor; 2. <b>groot</b> gaat voor klein; 3. <b>zeil</b> gaat voor spierkracht, en spierkracht voor motor; 4. zeilschepen: de wind over <b>stuurboord</b> gaat voor, en met de wind aan dezelfde kant wijkt <b>loef</b> voor lij; 5. gelijke schepen: kruisend gaat wie van <b>stuurboord</b> komt voor, recht op elkaar af gaan ze allebei naar stuurboord.' },
  ],
}];

export function initVoorrangQuiz({ wrap, scene, camera, controls, parts, modes, fly, setCoveredRight, opslaan, onOpen }) {
  const lk = createLesKaart({ wrap, id: 'les-voorrang-quiz', sleutel: 'voorrang-quiz', titel: 'Quiz: Voorrang', lessen: VOORRANG_QUIZ, store: 'lelievlet.quiz.voorrang.v1', opslaan, fly, setCoveredRight, onOpen,
    nogEen: { kan: () => Boolean(gekozen), doe: () => kies(niveau) } });
  const beeld = createVoorrangBeeld({ scene, camera, controls, parts, modes, layer: lk.layer, host: lk.host });
  let alle = null;                                     // made the first time it is asked for
  let niveau = 'makkelijk'; let sit = null; let gekozen = null;
  const score = { goed: 0, van: 0 };

  // one of that niveau at random, not the one there is now, and one whose way out works (voorrang-pad.js plan)
  const kies = (n) => {
    niveau = n; alle ??= oefenSituaties();
    const lijst = alle[n].filter((x) => x !== sit);
    for (let i = 0; i < 12 && lijst.length; i++) {
      const s = lijst.splice(Math.floor(Math.random() * lijst.length), 1)[0];
      beeld.zet(s);
      if (beeld.wijk?.ok !== false) break;
    }
    sit = beeld.sit; gekozen = null;
    lk.renderControls(); lk.verder(); lk.frame();
  };

  // two boats: who goes first, or both to stuurboord; three: in what order they go
  const opties = () => {
    const ls = [...sit.letters].sort();
    if (ls.length === 3) return VOLGORDES.map((v) => [v.map((i) => ls[i]).join(''), v.map((i) => ls[i]).join(', dan ')]);
    return [...ls.map((l) => [l, `${l} gaat voor`]), ['beide', 'Allebei naar stuurboord']];
  };
  const wie = (l) => `${l}: ${SOORT[sit.soorten[sit.letters.indexOf(l)]]}${sit.letters.indexOf(l) === 0 ? ' (de lelievlet)' : ''}`;

  const vraag = () => {
    const el = document.createElement('div'); el.className = 'kr-vraag les-wie';
    el.innerHTML = '<h3></h3><p></p><div class="kr-opties"></div><p class="les-score"></p>';
    const lijst = el.querySelector('.kr-opties'); let van = null;
    el.sync = () => {
      if (!sit) return;
      if (van !== sit) {
        van = sit;
        lijst.innerHTML = opties().map(([k, tekst]) => `<button type="button" data-k="${k}">${tekst}</button>`).join('');
        for (const b of lijst.children) b.addEventListener('click', () => {
          if (gekozen) return;
          score.van += 1; if (b.dataset.k === sit.antwoord) score.goed += 1;
          gekozen = b.dataset.k; voortgang.quiz('voorrang', gekozen === sit.antwoord); beeld.antwoord(); lk.renderControls(); lk.verder(); status();
          // what was said about it, in sight: under the question it may sit below the fold
          requestAnimationFrame(() => lk.q('.kr-status')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
        });
      }
      el.querySelector('h3').textContent = `Vraag · ${NIVEAU[niveau]}`;
      el.querySelector('p').textContent = `${[...sit.letters].sort().map(wie).join(', ')}. ${sit.letters.length === 3 ? 'In welke volgorde gaan ze?' : 'Wie gaat voor?'}`;
      for (const b of lijst.children) {
        b.disabled = Boolean(gekozen) && b.dataset.k !== gekozen && b.dataset.k !== sit.antwoord;
        b.classList.toggle('goed', Boolean(gekozen) && b.dataset.k === sit.antwoord);
        b.classList.toggle('fout', b.dataset.k === gekozen && gekozen !== sit.antwoord);
      }
      el.querySelector('.les-score').textContent = score.van ? `${score.goed} van ${score.van} goed` : '';
    };
    return el;
  };

  lk.koppel({
    begin() {
      kies(niveau);
      return [vraag()];
    },
    release() { beeld.release(); sit = null; },
    aanzicht: () => beeld.kijk(),
  });

  // the line under the question: nothing until it is answered, then the rules; a wrong one yellow, as the quiz of
  // Zeiltermen has it
  const status = () => lk.status(gekozen ? `${gekozen === sit.antwoord ? 'Goed! ' : 'Niet helemaal. '}${sit.regel}` : '', gekozen && gekozen !== sit.antwoord ? 'geel' : '');
  function update(dt, width, height) {
    if (!lk.tick(width) || !sit) return;
    status();
    beeld.update(dt, width, height, lk.bladOpen);
  }

  return {
    update, close: lk.close,
    /** Open it, on a situatie of that niveau. */
    open(n = niveau) {
      if (!Object.hasOwn(NIVEAU, n)) n = niveau;                                   // one it does not know (from the address): as it is
      if (n !== niveau) { score.goed = 0; score.van = 0; }
      niveau = n; lk.open();
    },
    /** The niveau it is on (for the address of the page). */
    get keuze() { return niveau; },
    dispose: () => { lk.dispose(); beeld.dispose(); },
  };
}
