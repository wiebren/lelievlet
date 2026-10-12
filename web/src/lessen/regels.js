import * as THREE from 'three';
import { CONFIGS, makeShip } from '../bpr/schepen.js';
import { LICHT_UITLEG } from '../bpr/lichtuitleg.js';
import { createPijlen } from '../krachten/pijlen.js';
import { createLesKaart, kies } from './kaart.js';

// Regels: a lesson after Sint Maarten Kielboot III § 4.2 Algemene bepalingen and § 4.6 Overige regels, with what the
// CWO handboek Kielboot (2022, 402) asks of them: groot en klein schip (BPR 1.01), zeilschip and zeilplank, goed
// zeemanschap (1.04, 1.05), the BPR on board and other reglementen (1.11), the schipper and who may steer (1.02,
// 1.09), the name on a small boat (2.02), hinderlijke waterbeweging (6.20) and the motorplicht (9.04, bijlage 15).
// Where a ship shows it, a ship of Zoeken › Lichten (bpr/schepen.js) lies beside the boat, with a 20 m rod by it.

const C = 2.8;
const cfg = (id) => CONFIGS.find((c) => c.id === id);
const KLEUR = { maat: '#36454f', groot: '#c96f00', klein: '#16833a' };
// what the buttons call them
const KORT = { groot_motorschip: 'Vrachtschip', klein_motorschip_a: 'Motorboot', passagiersschip_klein: 'Rondvaartboot', sleepboot: 'Sleepboot',
  lelievlet_zeilen: 'Lelievlet', groot_zeilschip: 'Groot zeilschip', groot_zeil_en_motor: 'Zeil én motor', lelievlet_zeil_en_motor: 'Lelievlet met motor' };
// what each ship is, by the BPR: of the first onderwerp groot or klein, of the second zeilschip or motorschip
const SOORT = {
  groot_motorschip: ['groot', 'Een vrachtschip van 55 m: langer dan 20 m, dus een groot schip.'],
  klein_motorschip_a: ['klein', 'Een motorboot korter dan 20 m: een klein schip.'],
  passagiersschip_klein: ['groot', 'Een rondvaartboot korter dan 20 m, maar hij mag meer dan 12 passagiers meenemen: hij telt als groot schip. Overdag voert hij een gele ruit.'],
  sleepboot: ['groot', 'Een sleepboot die grote schepen sleept, telt als groot schip, ook als hij korter is dan 20 m.'],
  lelievlet_zeilen: ['klein', 'Een lelievlet is 5,6 m lang: een klein schip, en een zeilschip korter dan 7 m.'],
};
const ZEIL_OF_MOTOR = {
  groot_zeilschip: ['Zeilschip', 'Een groot zeilschip dat alleen op zijn zeilen vaart: een zeilschip.'],
  groot_zeil_en_motor: ['Motorschip', 'Een zeilschip met de motor bij is volgens het BPR een motorschip, ook al staan de zeilen. Overdag voert het een kegel met de punt omlaag.'],
  lelievlet_zeilen: ['Zeilschip', 'De lelievlet op haar zeilen: een zeilschip.'],
  lelievlet_zeil_en_motor: ['Motorschip', 'De lelievlet met de buitenboordmotor bij: een motorschip, ook met de zeilen op.'],
};

export const REGELS = [
  {
    id: 'groot', titel: 'Groot en klein schip', cwo: 'KB I', schepen: ['groot_motorschip', 'klein_motorschip_a', 'passagiersschip_klein', 'sleepboot', 'lelievlet_zeilen'], maat: true,
    kort: [
      'Het BPR maakt verschil tussen een <b>groot schip</b> en een <b>klein schip</b>. Een schip van <b>20 meter of langer</b> is groot, een korter schip is klein.',
      'Sommige schepen tellen ook als ze korter zijn als <b>groot</b>: een passagiersschip dat meer dan 12 mensen mag meenemen, een veerpont, een visser, een duwbak, en een duwboot of sleepboot die een groot schip duwt of sleept.',
    ],
    meer: [{ kop: 'Waarom het ertoe doet', tekst: 'Veel voorrangsregels hangen ervan af: een groot schip gaat voor op een klein schip, tenzij het kleine aan de stuurboordwal vaart.' }],
    vraag: {
      tekst: 'Een rondvaartboot van 15 meter mag 40 passagiers meenemen. Groot of klein schip?',
      opties: [['Klein: hij is korter dan 20 m', false], ['Groot: hij mag meer dan 12 passagiers meenemen', true]],
      uitleg: 'Een passagiersschip dat meer dan 12 mensen mag meenemen, telt als groot schip, ook korter dan 20 m.',
      laat: { schip: 'passagiersschip_klein' },
    },
  },
  {
    id: 'soorten', titel: 'Zeilschip, motorschip, zeilplank', cwo: 'KB II', schepen: ['groot_zeilschip', 'groot_zeil_en_motor', 'lelievlet_zeilen', 'lelievlet_zeil_en_motor'],
    kort: [
      'Een <b>zeilschip</b> vaart alleen op zijn zeilen. Zet een zeilschip zijn motor bij, dan is het volgens het BPR een <b>motorschip</b>, ook al staan de zeilen nog.',
      'Een <b>zeilplank</b> is een klein zeilschip met één zeil dat alle kanten op kan draaien en niet vast staat: een surfplank.',
    ],
    meer: [{ kop: 'De lelievlet', tekst: 'Zeilt de lelievlet, dan is ze een zeilschip. Roei je, dan vaar je op spierkracht. Gebruik je een buitenboordmotor, ook terwijl je zeilt, dan ben je een motorschip en heb je geen voorrang als zeilschip.' }],
    vraag: {
      tekst: 'Je zeilt met de lelievlet en zet de buitenboordmotor bij. Wat ben je nu?',
      opties: [['Nog steeds een zeilschip', false], ['Een motorschip', true]],
      uitleg: 'Met de motor bij ben je een motorschip, ook met de zeilen op. Overdag hoort er dan een kegel bij, punt omlaag.',
      laat: { schip: 'lelievlet_zeil_en_motor' },
    },
  },
  {
    id: 'zeemanschap', titel: 'Goed zeemanschap', cwo: 'KB II',
    kort: [
      'Het BPR kan niet alles regelen. Daarom moet de schipper altijd doen wat <b>goed zeemanschap</b> vraagt: wat nodig is om te voorkomen dat iemand in gevaar komt, dat er schade ontstaat, of dat de scheepvaart wordt gehinderd. Ook als er geen regel voor is.',
      'Moet het voor de veiligheid, dan <b>moet</b> je zelfs van de regels <b>afwijken</b>.',
    ],
    meer: [{ kop: 'Voorrang is niet nemen', tekst: 'Heb je voorrang en neemt de ander die toch? Dan wijk je alsnog uit. Gelijk hebben helpt niet als je tegen een ander schip aan vaart.' }],
    vraag: {
      tekst: 'Je hebt voorrang, maar een motorboot blijft recht op je af komen. Wat doe je?',
      opties: [['Doorvaren: ik heb voorrang', false], ['Toch uitwijken om een aanvaring te voorkomen', true]],
      uitleg: 'Goed zeemanschap gaat voor: doe wat nodig is om een aanvaring te voorkomen, ook als de regel aan jouw kant is.',
    },
  },
  {
    id: 'reglementen', titel: 'Het BPR en andere reglementen', cwo: 'KB II · KB III',
    kort: [
      'De regels op het water staan in het <b>Binnenvaartpolitiereglement</b> (BPR). Een schip moet er een bijgewerkt exemplaar van aan boord hebben, op papier of op een telefoon of tablet. Een klein open schip, zoals een lelievlet, hoeft dat niet.',
      'Het BPR geldt niet overal. Op de Rijn, de Westerschelde en de Eems gelden andere reglementen, en een water kan ook eigen regels hebben. Zoek het op voordat je op een onbekend water gaat varen.',
    ],
    meer: [{ kop: 'Waar je het vindt', tekst: 'Het BPR staat op wetten.overheid.nl. Welke regels op welk water gelden, en wat de bruggen en sluizen doen, staat in de ANWB Wateralmanak deel 1.' }],
    vraag: {
      tekst: 'Moet je in de lelievlet een BPR aan boord hebben?',
      opties: [['Ja, elk schip', false], ['Nee, een klein open schip hoeft dat niet', true]],
      uitleg: 'Een klein open schip, zoals een lelievlet, hoeft geen BPR aan boord te hebben. Kennen moet je het wel.',
    },
  },
  {
    id: 'schipper', titel: 'De schipper', cwo: 'KB III', naam: true,
    kort: [
      'Aan boord is één persoon de <b>schipper</b>: die is verantwoordelijk voor het schip en wat het doet, en de bemanning moet doen wat de schipper zegt.',
      'Wie <b>stuurt</b>, moet dat kunnen. Voor een zeilschip van 7 meter of langer en voor een groot schip moet de roerganger minstens <b>16 jaar</b> zijn. Voor een lelievlet, korter dan 7 m, geldt geen leeftijd.',
    ],
    meer: [{ kop: 'De naam op de boot', tekst: 'Een klein schip moet aan de buitenkant goed leesbaar een naam hebben, en binnen of buiten de naam en woonplaats van de eigenaar. Dat geldt niet voor een schip op spierkracht en een zeilschip korter dan 7 m, zoals de lelievlet; toch hebben de meeste lelievletten een naam op het boeisel.' }],
    vraag: {
      tekst: 'Je bent 13 jaar. Mag je de lelievlet sturen?',
      opties: [['Ja, voor een zeilschip korter dan 7 m geldt geen leeftijd', true], ['Nee, pas vanaf 16 jaar', false]],
      uitleg: 'De leeftijd van 16 jaar geldt voor een zeilschip van 7 m of langer. De lelievlet is korter.',
    },
  },
  {
    id: 'hinder', titel: 'Golfslag en motorplicht', cwo: 'KB III',
    kort: [
      'Maak geen <b>hinderlijke waterbeweging</b>: vaar langzaam bij havenmondingen, langs afgemeerde schepen en bij veerstoepen, zodat je golven geen schade doen. Een bord kan het ook verbieden.',
      'Op sommige drukke wateren met veel beroepsvaart moet een klein schip een <b>motor</b> hebben die het minstens 6 km/u laat varen, en mag je er niet <b>opkruisen</b>. Op de meeste van die wateren houd je ook zo veel mogelijk <b>stuurboordwal</b>, maar niet op de grote rivieren zoals de Waal. Die wateren staan in een bijlage van het BPR, zoals het Noordzeekanaal, de Waal en de Nieuwe Maas.',
    ],
    meer: [{ kop: 'Met de lelievlet', tekst: 'Zeilend zonder motor mag je op zo’n water dus niet varen. Roeien mag wel: een roeiboot die echt geroeid wordt, hoeft daar geen motor te hebben, behalve ten westen van de sluizen bij IJmuiden. Kijk in de Wateralmanak waar het geldt.' }],
    vraag: {
      tekst: 'Mag je met de lelievlet zeilend opkruisen op het Noordzeekanaal?',
      opties: [['Ja, als je uitkijkt', false], ['Nee: daar geldt motorplicht en mag een zeilschip niet opkruisen', true]],
      uitleg: 'Op de wateren met motorplicht moet je een motor hebben en mag je niet opkruisen.',
    },
  },
];

export function initRegels({ sleutel, wrap, scene, camera, controls, fly, setCoveredRight, opslaan, onOpen }) {
  const lk = createLesKaart({ wrap, id: 'les-regels', sleutel, titel: 'Regels', lessen: REGELS, store: 'lelievlet.les.regels.v1', opslaan, fly, setCoveredRight, onOpen });
  const waterline = scene.getObjectByName('lelievlet').userData.tuig?.waterlijn_m ?? 0.3;
  const pijlen = createPijlen({ scene, camera, controls, layer: lk.layer });
  const holder = new THREE.Group(); holder.name = 'les-regels'; holder.visible = false; scene.add(holder);
  const plaatje = document.createElement('div'); plaatje.className = 'les-sein'; lk.host.append(plaatje);
  const built = new Map(); let schip = null; let model = null; let lang = 10;
  let lengte = 10;                                                          // the length that counts: of a sleep, the sleepboot's own
  const Z = 14;                                                             // the ship lies alongside, this far to stuurboord
  let maatX = 0;                                                            // where the 20 m rod begins
  let eigen = false;                                                        // the lelievlet asked about is her own boat
  let hoog = 0;                                                             // the ship's height, its mast to the top

  const zet = (id) => {
    schip = id;
    if (model) model.removeFromParent();
    if (!built.has(id)) {
      const m = makeShip(cfg(id)); m.updateMatrixWorld(true);
      const b = new THREE.Box3().setFromObject(m); built.set(id, { m, lang: b.max.x - b.min.x, min: b.min.x, hoog: b.max.y });
    }
    const b = built.get(id); model = b.m; lang = b.lang; hoog = b.hoog;
    // alongside her, its stern level with hers, parallel
    model.position.set(-b.min, waterline, Z); model.rotation.y = 0;
    // a lelievlet beside the rod is her: no second boat, the rod beside her own
    eigen = Boolean(lk.les.maat) && id.startsWith('lelievlet');
    if (eigen) model.removeFromParent(); else holder.add(model);
    // the 20 m rod beside the ship itself, and its length: of a sleep the sleepboot's, not the line and the ship it tows
    model.updateMatrixWorld(true);
    let sleper = null; model.traverse((o) => { if (o.userData.deel === 'sleper') sleper = o; });
    const sb = sleper ? new THREE.Box3().setFromObject(sleper) : null;
    maatX = sb ? sb.min.x : 0; lengte = sb ? sb.max.x - sb.min.x : lang;
    const s = SOORT[id]; const zm = lk.les.maat ? null : ZEIL_OF_MOTOR[id];
    plaatje.innerHTML = `<p><b>${cfg(id).naam}</b></p><p class="hint">${s && lk.les.maat ? `${s[0] === 'groot' ? 'Groot schip' : 'Klein schip'} · ongeveer ${Math.round(lengte)} m` : zm ? zm[0] : ''}</p>`;
    lk.renderControls(); lk.frame();
  };
  const kijk = () => {
    const l = lk.les;
    if (l.naam) return { hoogte: 3.5, breedte: 7, doel: [4.6, 0.9, 1.6], richting: [0.15, 0.25, 1] };   // her name on the boeisel, stuurboord
    if (!l.schepen) return 'achterboven';
    // all of it in sight: its length, and its mast to the top (a big sailing ship stands high)
    const w = Math.max(lang, 24); const h = eigen ? 0 : hoog;
    return { hoogte: Math.max(w * 0.6 + 6, h * 1.25 + 4), breedte: w * 1.25, doel: [w / 2, Math.max(1, h / 2), eigen ? 1.5 : Z / 2], richting: [-0.15, h > 12 ? 0.35 : 0.8, -1] };   // a tall one more from the side
  };

  lk.koppel({
    begin(l) {
      holder.visible = Boolean(l.schepen);
      if (l.schepen) { zet(l.schepen[0]); return [kies('Schip', l.schepen.map((id) => [id, KORT[id] ?? cfg(id).naam]), () => schip, zet)]; }
      plaatje.innerHTML = '';
      return [];
    },
    antwoord(laat) { if (laat.schip) zet(laat.schip); },
    release() { holder.visible = false; pijlen.visible = false; },
    aanzicht: kijk,
  });

  function update(dt, width, height) {
    if (!lk.tick(width)) return;
    const l = lk.les;
    model?.userData.update?.(0, 0, camera);
    const items = [];
    if (l.maat && model) {
      // a rod of 20 m on the water between her and the ship: is it longer or shorter?
      const z = eigen ? 2.2 : Z / 2;                                        // beside her own stuurboord side, or between her and the ship
      items.push({ type: 'maat', a: [maatX, waterline + 0.2, z], b: [maatX + 20, waterline + 0.2, z], kleur: KLEUR.maat, label: '20 m' });
    }
    pijlen.visible = items.length > 0; pijlen.draw(items); pijlen.update(width, height);
    // what it is, as the onderwerp asks: groot or klein, zeilschip or motorschip
    const s = l.maat ? SOORT[schip] : ZEIL_OF_MOTOR[schip];
    lk.status(l.schepen && s ? s[1] : l.schepen ? (LICHT_UITLEG[schip]?.betekenis ?? cfg(schip)?.naam ?? '') : l.naam ? 'Kijk op het boeisel: de naam van de boot. Je eigen naam en kleuren zet je in Aanpassen.' : '');
  }

  return { update, open: lk.open, close: lk.close, onderwerpen: REGELS,
           dispose: () => { lk.dispose(); pijlen.dispose(); holder.removeFromParent(); } };
}
