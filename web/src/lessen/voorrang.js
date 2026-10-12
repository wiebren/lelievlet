import { createLesKaart, kies } from './kaart.js';
import { voortgang } from './voortgang.js';
import { C } from './voorrang-pad.js';
import { createVoorrangBeeld } from './voorrang-beeld.js';

// Voorrang: a lesson after Sint Maarten Kielboot III § 4.3, with the rules as the BPR has them (6.03, 6.04, 6.07,
// 6.09, 6.10, 6.13 and 6.14 for keren and vertrekken, 6.16, 6.17) and as far as the CWO handboek Kielboot (2022, 402)
// asks them per niveau. You are
// the lelievlet; another vessel of Zoeken › Lichten (bpr/schepen.js) comes your way - on a crossing course, head on,
// or overtaking - and you say who goes first. Then the one that has to give way does, and the line under the
// controls says which rule it is (in words: the article stays here, in `artikel`, not on the card). The map in the card has both from above, with the wind and the wal
// (lessen/voorrang-beeld.js). The last page has the rules in a row, and leads on to the quiz of Voorrang
// (lessen/voorrang-quiz.js), which makes ever new situaties of them.
//
// Each situatie: { naam (neutral: it must not give the answer away), key (what voortgang knows it by, so a new name
// keeps what was gehaald), jij: 'zeilen' | 'roeien', koers (hers, off the wind, + over stuurboord), ander: config id,
// richting (its heading, degrees from her bow, + to stuurboord), soort (how it moves: 'motor' 'zeil' 'spier' 'groot'),
// treffen [x, z] (where they would meet, from her middle), wal ({ sb, bb }: z of the inner edge of the vaarwater's
// banks on her stuurboord and bakboord side; or 'engte', with engte [x, x] where it starts and ends; or { dwars, mond }:
// a vaarwater across her way, that she comes into from a zijvaart - lessen/voorrang-pad.js), voor: 'jij' | 'ander' | 'beide', regel, artikel }. Her own course is set for her (the viewer's wind).
// draai: -1 when the one that gives way turns to bakboord (an oploper passing on her bakboord side), else to stuurboord.
// wacht: the one that gives way stops (for one that is slow, or leaves the wal) in place of turning away; 'stil': it
// lies where it was (before an engte, out of the way in).
// houd: s it holds its new heading before it turns back (lessen/voorrang-pad.js).
// A situatie of the first page has ontmoeting ('kruisend' 'tegengesteld' 'oplopen') in place of voor and artikel.

const ANTWOORD = [['jij', 'Ik ga voor'], ['ander', 'De ander gaat voor'], ['beide', 'Allebei naar stuurboord']];
// on the first page there is no voorrang yet: only what kind of meeting it is - and they pass clear, no one turns
const ONTMOETING = [['kruisend', 'Kruisende koersen'], ['tegengesteld', 'Tegengestelde koersen'], ['oplopen', 'Oplopen']];
const s = (o) => ({ jij: 'zeilen', koers: 90, treffen: [C + 6, 0], ...o });

export const VOORRANG = [
  {
    id: 'soorten', titel: 'Kruisen, tegemoet, oplopen', cwo: 'KB I',
    kort: [
      'Bij voorrang kijk je eerst <b>hoe</b> je een ander schip tegenkomt. <b>Kruisende koersen</b>: jullie koersen snijden elkaar. <b>Tegengestelde koersen</b>: jullie varen recht of bijna recht op elkaar af. <b>Oplopen</b>: het ene schip haalt het andere in.',
      'Bij elke soort hoort een rij regels. Je begint bovenaan, en de eerste regel die past, beslist.',
    ],
    situaties: [
      s({ naam: 'Situatie 1', soort: 'motor', richting: 180, treffen: [C + 6, -4], ontmoeting: 'tegengesteld', regel: 'Tegengestelde koersen: jullie varen (bijna) recht op elkaar af.' }),
      s({ naam: 'Situatie 2', soort: 'motor', richting: 0, treffen: [C, -4], ontmoeting: 'oplopen', regel: 'Oplopen: het motorbootje komt van achteren en haalt je in.' }),
      s({ naam: 'Situatie 3', soort: 'motor', richting: 90, treffen: [C + 9, 0], ontmoeting: 'kruisend', regel: 'Kruisende koersen: jullie koersen snijden elkaar; het motorbootje komt van opzij.' }),
    ],
  },
  {
    id: 'wal', titel: 'Stuurboordwal en grote schepen', cwo: 'KB I',
    kort: [
      'De eerste regel: het schip dat de <b>stuurboordzijde</b> van het vaarwater houdt, gaat voor op het schip dat dat niet doet.',
      'Houdt geen van beide de stuurboordzijde, dan gaat een <b>groot schip</b> voor op een klein schip, zoals een lelievlet.',
    ],
    meer: [{ kop: 'Ruimte', tekst: 'Ook als jij voorgaat: een groot schip kan niet snel uitwijken of stoppen. Houd ruim afstand en maak op tijd duidelijk wat je doet.' }],
    situaties: [
      // each on a course that meets the other: the big ship on her side of the water, she on its side, or both down the middle
      s({ naam: 'Situatie 1', key: 'Jij aan de stuurboordwal', soort: 'groot', richting: 180, treffen: [C + 30, 1], wal: { sb: 4, bb: -26 }, voor: 'jij', regel: 'Jij houdt de stuurboordzijde van het vaarwater, het grote schip niet: het grote schip moet jou voorrang geven.', artikel: 'BPR 6.04 lid 2' }),
      s({ naam: 'Situatie 2', key: 'Het grote schip aan zijn stuurboordwal', soort: 'groot', richting: 180, treffen: [C + 30, -2.5], wal: { sb: 22, bb: -8 }, voor: 'ander', regel: 'Het grote schip houdt de stuurboordzijde van het vaarwater, jij niet: jij geeft voorrang en gaat naar je eigen stuurboordzijde.', artikel: 'BPR 6.04 lid 2' }),
      s({ naam: 'Situatie 3', key: 'Allebei midden op het water', soort: 'groot', richting: 180, treffen: [C + 30, 1], wal: { sb: 14, bb: -14 }, voor: 'ander', regel: 'Geen van beide houdt de stuurboordzijde: jullie varen allebei midden op het water. Dan moet een klein schip voorrang geven aan een groot schip.', artikel: 'BPR 6.04 lid 3' }),
    ],
  },
  {
    id: 'soort', titel: 'Zeil, spier, motor', cwo: 'KB I',
    kort: [
      'Twee <b>kleine</b> schepen, en geen van beide aan de stuurboordwal: dan telt wat voor schip het is. Een <b>zeilschip</b> gaat voor een schip op <b>spierkracht</b>, en dat gaat voor een <b>motorschip</b>.',
      'Een lelievlet die zeilt is een zeilschip, roeiend vaart ze op spierkracht, en met een motor erbij is ze een motorschip, ook al staan de zeilen.',
    ],
    situaties: [
      s({ naam: 'Situatie 1', key: 'Jij zeilt, een motorbootje kruist', soort: 'motor', richting: 90, treffen: [C - 2, 0], voor: 'jij', regel: 'Een motorschip moet voorrang geven aan een zeilschip.', artikel: 'BPR 6.17 lid 9' }),
      s({ naam: 'Situatie 2', key: 'Jij roeit, een zeilbootje kruist', jij: 'roeien', soort: 'zeil', richting: -90, voor: 'ander', regel: 'Een schip op spierkracht moet voorrang geven aan een zeilschip.', artikel: 'BPR 6.17 lid 9' }),
      s({ naam: 'Situatie 3', key: 'Jij roeit, een motorbootje komt tegemoet', jij: 'roeien', soort: 'motor', richting: 180, voor: 'jij', regel: 'Een motorschip moet voorrang geven aan een schip op spierkracht.', artikel: 'BPR 6.04 lid 8' }),
    ],
  },
  {
    id: 'zeilen', titel: 'Zeilschepen onderling', cwo: 'KB I',
    kort: [
      'Twee zeilschepen met de wind over <b>verschillende kanten</b>: het schip met de wind over <b>stuurboord</b>, de giek aan bakboord, gaat voor.',
      'Hebben ze de wind over <b>dezelfde kant</b>, dan wijkt het schip aan <b>loef</b> voor het schip aan <b>lij</b>.',
    ],
    meer: [
      { kop: 'Zoals het BPR het zegt', tekst: 'Het BPR noemt de kant van de giek: een schip dat <i>over stuurboordsboeg</i> ligt (giek aan stuurboord, de wind over bakboord) verleent voorrang aan een schip over bakboordsboeg. Het lesboek zegt: zeilen over bakboord gaat voor. Dat is allemaal dezelfde regel.' },
      { kop: 'Twijfel', tekst: 'Zie je niet aan welke kant de ander de wind heeft, en heb je zelf de wind over bakboord? Ga er dan van uit dat jij moet wijken.' },
    ],
    situaties: [
      s({ naam: 'Situatie 1', key: 'Jij: wind over stuurboord', koers: 45, soort: 'zeil', richting: 90, treffen: [C - 2, 0], voor: 'jij', regel: 'Verschillende boeg: het schip met de wind over stuurboord gaat voor. De ander heeft de wind over bakboord en wijkt.', artikel: 'BPR 6.17 lid 6a' }),
      s({ naam: 'Situatie 2', key: 'Jij: wind over bakboord', koers: -45, soort: 'zeil', richting: -90, voor: 'ander', regel: 'Verschillende boeg: jij hebt de wind over bakboord, de ander over stuurboord. Jij wijkt.', artikel: 'BPR 6.17 lid 6a' }),
      s({ naam: 'Situatie 3', key: 'Zelfde boeg, jij aan loef', koers: 90, soort: 'zeil', richting: 30, treffen: [C + 6, -2], voor: 'ander', regel: 'Dezelfde boeg: loef wijkt voor lij. Jij ligt aan loef van de ander, dus jij wijkt.', artikel: 'BPR 6.17 lid 6b' }),
    ],
  },
  {
    id: 'oplopen', titel: 'Oplopen', cwo: 'KB I',
    kort: [
      'Wie een ander schip <b>inhaalt</b>, is de <b>oploper</b>, en die moet uitwijken. Inhalen mag alleen als het veilig kan.',
      'Je loopt meestal <b>aan bakboord</b> voorbij. Is daar geen ruimte en aan stuurboord wel, dan mag het ook aan stuurboord. Zeilschepen lopen elkaar het liefst aan de <b>loefzijde</b> op.',
    ],
    meer: [{ kop: 'Meewerken', tekst: 'Het schip dat wordt opgelopen, moet het voorbijlopen zo nodig makkelijker maken: een beetje uitwijken of vaart minderen.' }],
    situaties: [
      s({ naam: 'Situatie 1', key: 'Een motorbootje haalt je in', soort: 'motor', richting: 0, treffen: [C, -4], draai: -1, voor: 'jij', regel: 'De oploper wijkt uit: het motorbootje loopt je aan bakboord voorbij.', artikel: 'BPR 6.09, 6.10' }),
      s({ naam: 'Situatie 2', key: 'Jij haalt een roeiboot in', soort: 'spier', richting: 0, treffen: [C + 9, 0], omgekeerd: true, voor: 'ander', regel: 'Jij bent de oploper: jij wijkt uit en loopt de roeiboot aan bakboord voorbij.', artikel: 'BPR 6.09, 6.10' }),
    ],
  },
  {
    id: 'engte', titel: 'Een engte', cwo: 'KB I · KB III',
    kort: [
      'Een <b>engte</b> is een stuk vaarwater waar twee schepen elkaar niet kunnen passeren: tussen keringen, door een open brug of sluis. Inhalen is daar verboden.',
      'Zonder stroom gaat een <b>groot</b> schip voor een klein schip. Tussen kleine schepen gaat een zeilschip dat de engte <b>bezeild</b> heeft voor; dan spierkracht, dan motor. Een zeilschip dat de engte niet bezeild heeft, geeft alle andere kleine schepen voorrang.',
    ],
    meer: [{ kop: 'Bezeild', tekst: 'Een engte heb je bezeild als je er doorheen kunt zonder overstag te gaan. Moet je erin opkruisen, dan heb je hem niet bezeild.' }, { kop: 'Stroom', tekst: 'Loopt er stroom, dan gaat het schip dat met de stroom mee vaart voor.' }],
    situaties: [
      s({ naam: 'Situatie 1', key: 'Groot schip in de engte', soort: 'groot', richting: 180, treffen: [C + 29, 0], wal: 'engte', engte: [C + 26, C + 60], voor: 'ander', regel: 'In een engte zonder stroom geeft een klein schip voorrang aan een groot schip.', artikel: 'BPR 6.07 lid 6' }),
      s({ naam: 'Situatie 2', key: 'Jij zeilt erdoor, bezeild', koers: 90, soort: 'motor', richting: 180, treffen: [C + 20, 0], wal: 'engte', engte: [C + 8, C + 24], wacht: 'stil', voor: 'jij', regel: 'Een klein motorschip geeft voorrang aan een klein zeilschip dat de engte bezeild heeft.', artikel: 'BPR 6.07 lid 8c' }),
      s({ naam: 'Situatie 3', key: 'Jij roeit, een motorbootje komt', jij: 'roeien', soort: 'motor', richting: 180, treffen: [C + 20, 0], wal: 'engte', engte: [C + 8, C + 24], wacht: 'stil', voor: 'jij', regel: 'Een klein motorschip geeft voorrang aan een schip op spierkracht.', artikel: 'BPR 6.07 lid 8d' }),
    ],
  },
  {
    id: 'gelijk', titel: 'Gelijke schepen', cwo: 'KB III',
    kort: [
      'Twee <b>motorschepen</b> of twee schepen op <b>spierkracht</b> die op elkaar afvaren: allebei wijken ze <b>naar stuurboord</b>, zodat ze bakboord langs bakboord passeren.',
      'Kruisen hun koersen, dan gaat het schip dat van <b>stuurboord</b> komt voor: rechts gaat voor.',
    ],
    situaties: [
      s({ naam: 'Situatie 1', key: 'Jij roeit, een roeiboot komt tegemoet', jij: 'roeien', soort: 'spier', richting: 180, voor: 'beide', regel: 'Twee schepen op spierkracht op tegengestelde koersen: allebei naar stuurboord, bakboord langs bakboord.', artikel: 'BPR 6.04 lid 9' }),
      s({ naam: 'Situatie 2', key: 'Jij roeit, een roeiboot van stuurboord', jij: 'roeien', soort: 'spier', richting: -90, voor: 'ander', regel: 'Kruisende koersen tussen schepen op spierkracht: het schip dat van stuurboord nadert, gaat voor.', artikel: 'BPR 6.17 lid 8' }),
      s({ naam: 'Situatie 3', key: 'Jij roeit, een roeiboot van bakboord', jij: 'roeien', soort: 'spier', richting: 90, treffen: [C + 2, 0], wacht: true, voor: 'jij', regel: 'Kruisende koersen tussen schepen op spierkracht: de ander nadert van bakboord en wijkt.', artikel: 'BPR 6.17 lid 8' }),
    ],
  },
  {
    id: 'speciaal', titel: 'Keren, vertrekken, oversteken', cwo: 'KB III',
    kort: [
      'Wie <b>keert</b>, <b>vertrekt</b>, een <b>haven</b> in- of uitvaart of een vaarwater <b>oversteekt</b>, mag dat alleen als het zonder gevaar kan. Je mag dan wel om medewerking vragen, maar je hebt geen voorrang.',
      'Doet een <b>klein schip</b> het, dan geeft het een groot schip voorrang. Een <b>groot schip</b> dat keert, vertrekt of een haven uitvaart, mag om medewerking vragen: als klein schip werk je dan mee, door in te houden of uit te wijken, en laat je het gaan.',
    ],
    situaties: [
      s({ naam: 'Situatie 1', key: 'Een groot schip vertrekt van de wal', soort: 'groot', richting: -60, treffen: [C + 7, -11.4], wal: { sb: 16, bb: -60 }, wacht: true, voor: 'ander', regel: 'Het grote schip vertrekt van de wal en mag om medewerking vragen. Jij werkt mee: je houdt in en laat het eerst gaan.', artikel: 'BPR 6.14 lid 2, 6.03 lid 7' }),
      s({ naam: 'Situatie 2', key: 'Jij steekt over, een motorbootje komt', koers: 90, soort: 'motor', richting: 90, treffen: [C + 3, 0], wal: { dwars: [C - 3, C + 27], mond: 6 }, wacht: true, voor: 'ander', regel: 'Je komt uit een zijvaart en steekt het vaarwater over. Wie oversteekt, heeft geen voorrang: wacht tot het motorbootje voorbij is en steek pas over als het veilig kan.', artikel: 'BPR 6.16' }),
    ],
  },
  {
    id: 'rij', titel: 'Alles op een rij', cwo: '',
    kort: [
      '<b>Kruisend</b>: 1. stuurboordwal gaat voor; 2. groot gaat voor klein; 3. zeil voor spierkracht voor motor; 4. gelijke schepen: van stuurboord gaat voor; zeilschepen: wind over stuurboord gaat voor, en loef wijkt voor lij.',
      '<b>Tegengesteld</b>: 1. stuurboordwal; 2. groot voor klein; 3. zeil voor spierkracht voor motor; 4. zeilschepen: wind over stuurboord gaat voor; 5. gelijke schepen: allebei naar stuurboord. <b>Oplopen</b>: de oploper wijkt.',
      '<b>Uit een haven of zijvaart, keren, vertrekken</b>: je hebt geen voorrang, en gaat pas als het veilig kan. Een klein schip geeft een groot schip voorrang. Staat bij de uitgang het bord B.9, dan gaat het schip op het hoofdvaarwater voor. En altijd: <b>goed zeemanschap</b>, doe wat nodig is om een aanvaring te voorkomen.',
    ],
    situaties: null, quiz: ['voorrang', 'Voorrang'],
  },
];
// each situatie is a deel of its onderwerp (lessen/voortgang.js): answered right it is gehaald - shown green, and
// the onderwerp counts, and lets you go on, only once all its situaties are; 'Alles op een rij' has them all again
for (const o of VOORRANG) if (o.situaties) { for (const x of o.situaties) x.deel = `${o.id}:${x.key ?? x.naam}`; o.delen = o.situaties.map((x) => x.deel); }

export function initVoorrang({ sleutel, wrap, scene, camera, controls, parts, modes, fly, setCoveredRight, opslaan, onOpen, naarQuiz }) {
  const lk = createLesKaart({ wrap, id: 'les-voorrang', sleutel, titel: 'Voorrang', lessen: VOORRANG, store: 'lelievlet.les.voorrang.v1', opslaan, fly, setCoveredRight, onOpen, naarQuiz });
  const beeld = createVoorrangBeeld({ scene, camera, controls, parts, modes, layer: lk.layer, host: lk.host });
  let alle = []; let sit = null; let gekozen = null;

  const zet = (key) => {
    sit = alle.find((x) => x.naam === key) ?? alle[0]; gekozen = null;
    beeld.zet(sit);
    lk.renderControls(); lk.frame();
  };

  // the question of each situatie, as the card asks its questions: the answers in a column, the right one green once
  // answered and a wrong one red - and another may still be tried. An answer sets them going, from the start
  const juist = () => sit?.ontmoeting ?? sit?.voor;
  const wieGaatVoor = () => {
    const vraag = document.createElement('div'); vraag.className = 'kr-vraag les-wie';
    vraag.innerHTML = '<h3>Vraag</h3><p></p><div class="kr-opties"></div>';
    const lijst = vraag.querySelector('.kr-opties'); let set = null;
    vraag.sync = () => {
      const nu = sit?.ontmoeting ? ONTMOETING : ANTWOORD;
      if (nu !== set) {
        set = nu;
        lijst.innerHTML = nu.map(([k, tekst]) => `<button type="button" data-k="${k}">${tekst}</button>`).join('');
        for (const b of lijst.children) b.addEventListener('click', () => {
          gekozen = b.dataset.k; beeld.antwoord();
          if (gekozen === juist()) voortgang.gehaald(sleutel, sit.deel);
          lk.renderControls(); status(); inBeeld();
        });
      }
      vraag.querySelector('p').textContent = sit?.ontmoeting ? `${sit.naam}: wat voor ontmoeting is dit?` : `${sit?.naam}: wie gaat voor?`;
      for (const b of lijst.children) {
        b.classList.toggle('goed', Boolean(gekozen) && b.dataset.k === juist());
        b.classList.toggle('fout', b.dataset.k === gekozen && gekozen !== juist());
      }
    };
    return vraag;
  };
  // what was said about the answer, scrolled into sight: under the question it may sit below the fold
  const inBeeld = () => requestAnimationFrame(() => lk.q('.kr-status')?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  // the line under the controls: nothing until it is answered, then the rule
  const status = () => {
    if (!gekozen) return lk.status('');
    if (sit.ontmoeting) return lk.status(`${gekozen === sit.ontmoeting ? 'Goed! ' : 'Niet helemaal. '}${sit.regel}`);
    const goed = gekozen === sit.voor;
    lk.status(`${goed ? 'Goed! ' : 'Niet helemaal. '}${sit.regel}`, goed ? '' : 'oranje');   // wrong here is a collision
  };

  const gehaald = (naam) => voortgang.isGehaald(sleutel, alle.find((x) => x.naam === naam)?.deel);

  lk.koppel({
    begin(l) {
      if (!l.situaties) { beeld.release(); sit = null; return []; }
      alle = l.situaties;
      zet(alle[0].naam);
      return [kies('Situatie', alle.map((x) => [x.naam, x.naam]), () => sit?.naam, zet, gehaald), wieGaatVoor()];
    },
    release() { beeld.release(); sit = null; },
    aanzicht: () => beeld.kijk(),
  });

  function update(dt, width, height) {
    if (!lk.tick(width) || !sit) return;
    status();
    beeld.update(dt, width, height, lk.bladOpen);
  }

  return { update, open: lk.open, close: lk.close, onderwerpen: VOORRANG,
           dispose: () => { lk.dispose(); beeld.dispose(); } };
}
