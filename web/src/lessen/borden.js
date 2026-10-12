import * as THREE from 'three';
import { TEKENS } from '../bpr/tekens.js';
import { bord } from '../bpr/borden/index.js';
import { BORD_UITLEG } from '../bpr/uitleg.js';
import { makeTeken, plaatsVan, staatVoor, makeVerWater } from '../bpr/seinen.js';
import { cwoTeken } from '../bpr/cwo.js';
import { createLesKaart, keuze, kies, ernst } from './kaart.js';

// Verkeerstekens: a lesson after Sint Maarten Kielboot III § 4.4 - with only the borden the CWO handboek Kielboot
// (2022, Gevorderd, 402, bijlage 7) asks (bpr/cwo.js): A.1, A.9, A.12, A.13, A.15, A.16, A.17, B.5, B.6, E.1, E.4,
// E.9, E.10, E.11, E.15, E.16, E.18, E.19 and E.20 - the G and H tekens, D.1 and A.11 (lights, rood boven groen,
// not a bord on a post) are in Bruggen and Sluizen. Each stands where it really does, as Zoeken › Borden puts
// them out (bpr/seinen.js plaatsVan): most on a post by the boat; what hangs on a bridge, and what is lights or a
// whole installation, on that bridge, lock or spuisluis ahead; the veerpont on the kades ahead. The words are
// Zoeken's (bpr/uitleg.js). Zelf verkennen has every teken of bijlage 7, and leads on to Zoeken and to the quiz of
// Leren › Quiz › Verkeerstekens.

const C = 2.8;
const NAMEN = new Map(TEKENS.flatMap(([, , list]) => list));
const borden = (codes) => codes.map((c) => [c, NAMEN.get(c) ?? c]);
// what the buttons say: short, for under the onderwerp's title says the rest ('Verboden' › 'Zeilschepen')
const KNOP = {
  'A.1': 'Doorvaren', 'A.9': 'Hinderlijke golven', 'A.12': 'Motorschepen', 'A.13': 'Kleine schepen', 'A.15': 'Zeilschepen', 'A.16': 'Spierkracht', 'A.17': 'Zeilplanken',
  'B.5': 'Stilhouden', 'B.6': 'Snelheid beperken', 'E.1': 'Doorvaren toegestaan',
  'E.15': 'Motorschepen', 'E.16': 'Kleine schepen', 'E.18': 'Zeilschepen', 'E.19': 'Spierkracht', 'E.20': 'Zeilplanken', 'E.11': 'Einde verbod of gebod',
  'E.9a': 'Hoofd: kruising', 'E.9b': 'Hoofd: zijwater van rechts', 'E.9c': 'Hoofd: zijwater van links', 'E.10a': 'Neven: kruising', 'E.10b': 'Neven: mondt uit',
  'E.4a': 'Niet-vrijvarend', 'E.4b': 'Vrijvarend',
};
const onderwerp = (o) => ({ cwo: 'KB III', meer: [], ...o });

export const BORDEN_LES = [
  onderwerp({
    id: 'verboden', titel: 'Verboden',
    kort: [
      'Een <b>verbodsbord</b> heeft een rode rand of is rood-wit. Het zegt wat hier niet mag. Een rode streep door een schip zegt: dit soort schip mag hier niet varen.',
      'Let goed op welk schip er op het bord staat. Een lelievlet die zeilt is een zeilschip, roeiend vaart ze op spierkracht, en met een motor erbij is ze een motorschip.',
    ],
    borden: borden(['A.1', 'A.9', 'A.12', 'A.13', 'A.15', 'A.16', 'A.17']),
    vraag: {
      tekst: 'Je zeilt met de lelievlet en ziet een bord met een doorgestreept zeilschip. Wat doe je?',
      opties: [['Doorvaren: het is een klein bootje', false], ['Niet zeilend verder: hier mogen zeilschepen niet varen', true]],
      uitleg: 'Verboden voor zeilschepen geldt ook voor jou als je zeilt. Strijk de zeilen en roei verder, of vaar om.',
      laat: 'A.15',
    },
  }),
  onderwerp({
    id: 'geboden', titel: 'Geboden en doorvaren',
    kort: [
      'Een <b>gebodsbord</b> zegt wat je moet doen: hier <b>stilhouden</b>, of niet sneller varen dan het getal op het bord, in kilometer per uur.',
      'Het bord <b>doorvaren toegestaan</b> zegt dat je hier in, uit of door mag. De lichten bij bruggen en sluizen, zoals rood boven groen, staan in de lessen Bruggen en Sluizen.',
    ],
    borden: borden(['B.5', 'B.6', 'E.1']),
    vraag: {
      tekst: 'Een bord met het getal 6 in een rode rand. Geldt dat ook als je zeilt?',
      opties: [['Nee, alleen voor motorboten', false], ['Ja, je mag niet sneller dan 6 km/u', true]],
      uitleg: 'De snelheidsgrens geldt voor iedereen, ook als je zeilt of roeit.',
      laat: 'B.6',
    },
  }),
  onderwerp({
    id: 'toegestaan', titel: 'Toegestaan en einde',
    kort: [
      'Een blauw bord met een wit schip zegt: dit soort schip <b>mag</b> hier varen, bijvoorbeeld op een water waar andere schepen niet mogen.',
      'Een bord met een <b>schuine streep</b> erdoor zegt: hier <b>eindigt</b> een verbod of gebod.',
    ],
    borden: borden(['E.15', 'E.16', 'E.18', 'E.19', 'E.20', 'E.11']),
    vraag: {
      tekst: 'Een blauw bord met een wit zeilschip. Wat betekent het?',
      opties: [['Zeilschepen mogen hier varen', true], ['Zeilschepen mogen hier niet varen', false], ['Hier is een zeilwedstrijd', false]],
      uitleg: 'Blauw met wit is een aanwijzing: zeilschepen zijn hier toegestaan.',
      laat: 'E.18',
    },
  }),
  onderwerp({
    id: 'vaarwater', titel: 'Hoofd- en nevenvaarwater',
    kort: [
      'Op een kruising of splitsing laat een bord zien welk water het <b>hoofdvaarwater</b> is: de brede baan. Het smalle is het <b>nevenvaarwater</b>.',
      'Kom je uit het nevenvaarwater, dan vaar je het hoofdvaarwater pas op als dat veilig kan. Als klein schip geef je dan <b>voorrang aan een groot schip</b>; van een ander klein schip mag je medewerking vragen. Staat er bij de uitmonding een bord <b>B.9</b>, dan gaat elk schip op het hoofdvaarwater voor.',
    ],
    borden: borden(['E.9a', 'E.9b', 'E.9c', 'E.10a', 'E.10b']),
    vraag: {
      tekst: 'Je vaart met de lelievlet uit het smalle nevenvaarwater het brede hoofdvaarwater op. Daar komt een groot vrachtschip aan. Wie gaat voor?',
      opties: [['Jij, als je van rechts komt', false], ['Het vrachtschip: als klein schip geef je een groot schip voorrang', true]],
      uitleg: 'Uit een nevenvaarwater geef je als klein schip voorrang aan een groot schip. Een ander klein schip mag je om medewerking vragen; vaar pas op als het veilig kan.',
      laat: 'E.10b',
    },
  }),
  onderwerp({
    id: 'veerpont', titel: 'Veerponten',
    kort: [
      'Een veerpont steekt steeds het water over. Een bord laat zien waar: bij een <b>niet-vrijvarende</b> pont, aan een kabel, en bij een <b>vrijvarende</b> pont.',
      'Bij een pont aan een kabel kan die kabel net onder of boven het water hangen: vaar er nooit vlak voor of achter langs.',
    ],
    borden: borden(['E.4a', 'E.4b']), pont: true,
    vraag: {
      tekst: 'Je ziet het bord van een niet-vrijvarende veerpont. Waar let je extra op?',
      opties: [['Op de kabel waaraan de pont vaart', true], ['Op de snelheid van de pont', false]],
      uitleg: 'Een niet-vrijvarende pont hangt aan een kabel of ketting, die vlak bij de pont tot boven het water kan komen.',
      laat: 'E.4a',
    },
  }),
  {
    id: 'verkennen', titel: 'Zelf verkennen', cwo: '',
    kort: [
      'Kies een bord en zeg eerst zelf wat het betekent. Kijk dan of je het goed had.',
      'Hier staan alle borden van het BPR, ook die de CWO niet vraagt. In Zoeken › Borden vind je ze ook, en in Zoeken › Markeringen de tonnen en bakens.',
    ],
    meer: [], zoeken: ['borden', 'Borden'], quiz: ['verkeerstekens', 'Verkeerstekens'],
    verken: TEKENS.map(([g, sub, list]) => [`${g}${sub ? ` · ${sub}` : ''}`, list.map(([c, n]) => [c, `${c} ${n}${cwoTeken(c) ? '' : ' (geen CWO)'}`])]).filter(([, l]) => l.length),
  },
];

export function initBorden({ sleutel, wrap, scene, modes, fly, setCoveredRight, opslaan, onOpen, naarZoeken, naarQuiz }) {
  const lk = createLesKaart({ wrap, id: 'les-borden', sleutel, titel: 'Verkeerstekens', lessen: BORDEN_LES, store: 'lelievlet.les.borden.v1', opslaan, fly, setCoveredRight, onOpen, naarZoeken, naarQuiz });
  const waterline = scene.getObjectByName('lelievlet').userData.tuig?.waterlijn_m ?? 0.3;
  const holder = new THREE.Group(); holder.name = 'les-borden'; holder.visible = false; scene.add(holder);
  // the water out to a bridge or the veerpont ahead, so that it stands in it (bpr/seinen.js)
  const verWater = modes?.water ? makeVerWater(modes.water) : null;
  const plaatje = document.createElement('div'); plaatje.className = 'les-sein'; lk.host.append(plaatje);
  const built = new Map(); let code = null; let model = null; let t = 0;

  const zet = (c) => {
    code = c;
    if (model) model.removeFromParent();
    if (!built.has(c)) built.set(c, makeTeken(c));
    model = built.get(c);
    // a sign on its post ahead of her on her stuurboord side, turned to her (its face is its +z); a bridge, lock,
    // spuisluis or the veerpont's kades straight ahead, across her way, as in Bruggen and Sluizen
    if (plaatsVan(c) !== 'paal') { model.position.set(C + 18, waterline, 0); model.rotation.y = -Math.PI / 2; }
    else { model.position.set(C + 11, waterline, 4.5); model.rotation.y = Math.atan2(C - (C + 11), 0 - 4.5); }
    holder.add(model);
    if (verWater) { if (plaatsVan(c) === 'paal') verWater.removeFromParent(); else if (!verWater.parent) (modes.water.parent ?? scene).add(verWater); }
    plaatje.innerHTML = `<div class="les-bord">${bord(c).svg}</div><p><b>${NAMEN.get(c) ?? c}</b></p>`;
    lk.renderControls(); lk.frame();
  };
  const kijk = () => (plaatsVan(code) === 'pont'
    ? { hoogte: 14, breedte: 34, doel: [C + 12, 1.5, 0], richting: [-1, 0.55, 0.45] }
    : plaatsVan(code) === 'brug' ? { hoogte: 10, breedte: 24, doel: [C + 10, 2, 0], richting: [-1, 0.5, 0.4] }   // as Bruggen looks at it
      : { hoogte: 6.5, breedte: 16, doel: [C + 8, 1.8, 3], richting: [-1, 0.32, -0.12] });

  lk.koppel({
    begin(l) {
      holder.visible = true;
      zet(l.borden ? l.borden[0][0] : l.verken[0][1][0][0]);
      if (l.verken) return [keuze('Bord', l.verken, () => code, zet)];
      return [kies('Bord', l.borden.map(([c, naam]) => [c, KNOP[c] ?? naam]), () => code, zet)];
    },
    antwoord(laat) { zet(laat); },
    release() { holder.visible = false; verWater?.removeFromParent(); },
    aanzicht: kijk,
  });

  function update(dt, width) {
    if (!lk.tick(width)) return;
    t += dt;
    model?.userData.update?.(t, 0);                                       // a flashing light flashes
    // the words of the state of the bridge, lock or spuisluis it is shown as, as Bruggen and Sluizen have them (and in
    // their colour, by what it means), or else of the bord
    const staat = staatVoor(code);
    const u = staat ?? BORD_UITLEG[code];
    // a verbod red (A.1a not for a lelievlet without a motor), a gebod orange, a veerpont that has voorrang yellow
    const niveau = staat ? ernst(staat.betekenis ?? '') : code === 'A.1a' ? 'geel' : code.startsWith('A.') ? 'rood' : code.startsWith('B.') ? 'oranje'
      : ernst(`${u?.betekenis ?? ''} ${u?.lelievlet ?? ''}`);
    lk.status(u ? `${u.betekenis}${u.lelievlet ? ` ${u.lelievlet}` : ''}` : NAMEN.get(code) ?? '', niveau);
  }

  return { update, open: lk.open, close: lk.close, onderwerpen: BORDEN_LES,
           dispose: () => { lk.dispose(); holder.removeFromParent(); verWater?.removeFromParent(); } };
}
