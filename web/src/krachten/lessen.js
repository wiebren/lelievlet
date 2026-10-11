// Krachten: the lessons. They follow Sint Maarten Kielboot III, hoofdstuk 7 (Peppelman 2023,
// CC BY-NC-SA 4.0) in order, words and colours - blauw lucht, rood water, groen gestippeld een koppel
// - with the natuurkunde set right where the book has it otherwise (the zeil and the "langere weg",
// and the weerstand that balances the voortstuwende kracht). Background in notities/krachten/.
//
// Each lesson:
//   id, titel, cwo        what it is called, and the CWO-niveau that asks for it (HBO 2005, VS 2019)
//   bron                  where in Sint Maarten KB III it is (for us: the viewer shows no sources on its cards)
//   aanzicht              where the camera goes: boven (the bow up), achter, achterboven; null: it stays
//   kort                  one or two short paragraphs: always in view
//   meer                  [{ kop, tekst }]: one click further
//   bediening             which controls the card shows (see index.js CONTROLS)
//   toon                  which arrows and points are drawn (see index.js buildItems)
//   begin                 the settings it starts from
//   vraag                 { tekst, opties: [[tekst, goed]], uitleg, laat }: predict first, then see -
//                         `laat` is what is set once answered, so the answer shows on the boat
//   status(r, s)          one line under the controls: what the boat does now, in words (s: the settings, and
//                         rifMax: how many turns a rif can have)
//   koppel                for the duw and the roer: the koppel (Nm) that fills about half a circle. The gier
//                         koppels go by the roer and those of helling by one scale (index.js), so they need none
//   helt                  she is let heel; balans: 'gier' or 'helling', the koppels side by side in the card
//   zegt                  what its status warns about, in colour: 'helling' (geel flink or rechtop, oranje
//                         berghout onder water or naar loef, rood omslaan) and 'gier' (oranje: the roer cannot hold her)

import { BERGHOUT_ONDER, HELM_MOST } from './model.js';

const kant = (z) => (z > 0 ? 'stuurboord' : 'bakboord');
const hoeveel = (r) => { const h = Math.abs(r.helmNeeded); return h < 3 ? 'een klein beetje' : h < 8 ? 'iets' : 'flink'; };
const gier = (r, s) => {
  const m = r.gier;
  // the helmstok set by hand (Zelf verkennen): whether she goes straight on with it, or turns
  if (s?.roerstand !== undefined && s.roerstand !== 'recht' && r.roer) {
    const totaal = m - r.side * r.roer.koppel;
    return Math.abs(totaal) < 8 ? 'Met de helmstok zo vaart de boot rechtdoor.'
      : totaal > 0 ? 'Met de helmstok zo loeft de boot op.' : 'Met de helmstok zo valt de boot af.';
  }
  if (Math.abs(m) < 8) return 'De koppels heffen elkaar op: de boot vaart rechtdoor, ook zonder roer.';
  if (Math.abs(r.helmNeeded) > HELM_MOST - 0.5) {
    return m > 0 ? 'Samen: een oploevend koppel dat het roer niet meer aankan. Ook met de helmstok helemaal naar loef loeft de boot op.'
      : 'Samen: een afvallend koppel dat het roer niet meer aankan. Ook met de helmstok helemaal naar lij valt de boot af.';
  }
  return m > 0
    ? `Samen: een oploevend koppel. Om rechtdoor te varen houd je de helmstok ${hoeveel(r)} naar loef.`
    : `Samen: een afvallend koppel. Om rechtdoor te varen houd je de helmstok ${hoeveel(r)} naar lij.`;
};
// Too much helling: what to do about it, in the order you would - the weight to loef first, then a rif,
// then easing the grootschoot in the vlagen once the rif is all in.
const minder = (s) => (s.bemanning < 1 ? 'ga allemaal aan loef zitten.'
  : s.rif < s.rifMax ? (s.rif > 0 ? 'zet er een slag rif bij.' : 'tijd om te reven.')
    : 'vier in de vlagen de grootschoot.');
// The other way: the weight too far to loef for this wind - in to the middle, or on to lij ('' when they
// sit aan lij already). A little helling to lij lets the sails fall into their shape.
const naarLij = (s) => (s.bemanning > 0 ? 'ga in het midden zitten.' : s.bemanning === 0 ? 'ga aan lij zitten.' : '');
const hoofd = (t) => `${t[0].toUpperCase()}${t.slice(1)}`;
// Helling and gieren in one line - but going over, only that: what the roer does no longer matters
const hellingEnGier = (r, s) => (r.helling.omslaan ? helling(r, s) : `${helling(r, s)} ${gier(r, s)}`);
const helling = (r, s) => {
  const h = r.helling;
  if (h.omslaan) return `Te veel: het oprichtend koppel kan het niet meer aan. De boot slaat om! ${hoofd(minder(s))}`;
  const phi = Math.round(Math.abs(h.phi));
  const lij = naarLij(s);
  if (phi < 1) return `De boot vaart rechtop.${lij ? ` Een beetje helling naar lij laat de zeilen in hun vorm vallen: ${lij}` : ''}`;
  if (h.phi < 0) return `Helling naar loef: ongeveer ${phi}°.${lij ? ` ${hoofd(lij)}` : ''}`;
  return `Helling naar lij: ongeveer ${phi}°.${h.phi >= BERGHOUT_ONDER ? ` Het berghout gaat onder water: ${minder(s)}` : ''}`;
};

export const LESSEN = [
  {
    id: 'kracht', titel: 'Kracht en koppel', cwo: 'KB III', bron: 'Sint Maarten KB III § 7.2',
    aanzicht: 'boven',
    kort: [
      'Een <b>kracht</b> teken je als een pijl: hij wijst waar de kracht heen duwt, en hoe langer de pijl, hoe sterker de kracht.',
      'Duw je de boot opzij precies bij het <b>lateraal punt</b>, dan schuift hij alleen opzij. Duw je ergens anders, dan gaat hij ook <b>draaien</b>. Dat draaiende effect heet een <b>koppel</b>.',
    ],
    meer: [
      { kop: 'De arm', tekst: 'De afstand van de kracht tot het draaipunt heet de <b>arm</b>. Met dezelfde kracht maakt een langere arm een groter koppel. Een deur duw je makkelijk open bij de klink, en maar moeilijk vlak bij de scharnieren.' },
      { kop: 'Optellen en splitsen', tekst: 'Twee krachten op hetzelfde punt kun je optellen: maak er een parallellogram van, en de schuine lijn is de kracht die hetzelfde doet als die twee samen. Andersom kun je één kracht splitsen in twee krachten die samen hetzelfde doen. Zo splitsen we straks de zeilkracht in een deel vooruit en een deel opzij.' },
      { kop: 'Het draaipunt van de boot', tekst: 'In het water draait een boot om het <b>lateraal punt</b>: daar komen alle zijwaartse krachten van het water samen. Bij een lelievlet ligt het iets achter de mast. Meer daarover bij <i>Zwaard en lateraal punt</i>.' },
    ],
    bediening: ['duw'],
    toon: ['duw', 'lp', 'arm', 'duwkoppel'],
    begin: { duw: 4.9 },
    vraag: {
      tekst: 'Je duwt de boot opzij, vlak bij de achtersteven. Wat doet hij?',
      opties: [['Hij schuift alleen opzij', false], ['Hij draait: de boeg gaat de andere kant op', true], ['Hij draait: de boeg gaat mee met je duw', false]],
      uitleg: 'De achtersteven gaat met je duw mee. Omdat de boot om het lateraal punt draait, gaat de boeg de andere kant op. Hoe verder van het lateraal punt, hoe langer de arm en hoe groter het koppel.',
      laat: { duw: 0.4 },
    },
    status: (r) => {
      const d = r.duw; if (!d) return '';
      if (Math.abs(d.arm) < 0.2) return 'Je duwt bij het lateraal punt: de boot schuift opzij zonder te draaien.';
      const arm = Math.abs(d.arm) < 1.2 ? 'Korte arm, klein koppel' : 'Lange arm, groot koppel';
      return `${arm}: de boeg draait naar ${d.koppel > 0 ? 'bakboord' : 'stuurboord'}.`;
    },
    koppel: 350,
  },
  {
    id: 'zeil', titel: 'Zeilkracht', cwo: 'KB I · KB III', bron: 'Sint Maarten KB III § 7.3 en 7.4',
    aanzicht: 'boven',
    kort: [
      'Het zeil buigt de wind af. Aan de holle kant van het zeil wordt de druk hoger, aan de bolle kant lager. Dat <b>drukverschil</b> geeft een kracht op elk zeil, ongeveer haaks op het zeil.',
      'De krachten op de fok en het grootzeil samen heten de <b>zeilkracht</b>, en die werkt in het <b>zeilpunt</b>. Splits je hem, dan zie je een <b>voortstuwend</b> deel (vooruit) en een <b>verlijerend</b> deel (opzij).',
    ],
    meer: [
      { kop: 'Te los, goed, te strak', tekst: 'Te los: het voorlijk klappert en het zeil geeft bijna geen kracht. Te strak: de wind volgt de bolle kant van het zeil niet meer en laat los. Dan wordt de zeilkracht kleiner en wijst hij meer opzij: je helt meer en gaat langzamer. Goed trimmen: vier tot er een kleine tegenbolling in het voorlijk komt, en trek dan net zo ver aan dat die weg is.' },
      { kop: 'Per koers', tekst: 'Aan de wind wijst de zeilkracht vooral opzij. Hoe ruimer je vaart, hoe meer hij naar voren wijst. Voor de wind duwt de wind gewoon tegen het zeil, zoals bij een razeil.' },
      { kop: 'Het zeilpunt', tekst: 'We tekenen de zeilkracht in één punt, het zeilpunt. Het ligt iets achter de mast, ongeveer halverwege de hoogte. Het schuift mee als de zeilen anders staan: vier je het grootzeil, dan gaat het naar voren en naar buiten.' },
      { kop: 'Geen langere weg', tekst: 'Je hoort vaak dat de lucht aan de bolle kant een langere weg aflegt en daarom sneller moet stromen. Dat klopt niet: de lucht aan de twee kanten hoeft niet tegelijk aan het achterlijk aan te komen. Wat wel klopt: het zeil buigt de stroming af, en waar de stroming een bocht maakt, is de druk aan de buitenkant van de bocht lager. Ook een plat zeil geeft daarom kracht.' },
    ],
    bediening: ['koers', 'groot', 'fok'],
    toon: ['perzeil', 'zeilkracht', 'ontbonden', 'zp'],
    begin: { koers: 60, groot: 'goed', fok: 'goed', bft: 3, vaart: 1 },
    vraag: {
      tekst: 'Je vaart aan de wind. Waar wijst de zeilkracht vooral heen?',
      opties: [['Naar voren', false], ['Opzij', true], ['Naar achteren', false]],
      uitleg: 'Aan de wind staan de zeilen bijna in de lengte van de boot, en de kracht staat er ongeveer haaks op: vooral opzij. Het deel naar voren is klein, maar het water houdt het deel opzij tegen (zie <i>Zwaard en lateraal punt</i>).',
      laat: { koers: 45 },
    },
    status: (r) => {
      const stand = (z) => ({ goed: 'staat goed', klappert: 'klappert', 'te strak': 'staat te strak', duwt: 'wordt geduwd', bak: 'staat bak' }[z.stand]);
      const [g, f] = ['grootzeil', 'fok'].map((n) => r.zeilen.find((z) => z.naam === n));
      return `Grootzeil ${stand(g)}, fok ${stand(f)}.`;
    },
  },
  {
    id: 'zwaard', titel: 'Zwaard en lateraal punt', cwo: 'KB III', bron: 'Sint Maarten KB III § 7.3.1 en 7.3.2',
    aanzicht: 'boven',
    kort: [
      'Het verlijerende deel van de zeilkracht wil de boot opzij duwen. Het <b>onderwaterschip</b>, het <b>zwaard</b>, de <b>scheg</b> en het <b>roer</b> houden dat tegen. Samen geven ze de <b>driftbeperkende kracht</b>, in het <b>lateraal punt</b>.',
      'Het voortstuwende deel duwt de boot vooruit, en het water remt de romp af: de <b>weerstand</b>. Vaart de boot even snel door, dan zijn alle krachten in evenwicht.',
    ],
    meer: [
      { kop: 'Verlijeren', tekst: 'Een beetje opzij gaat de boot altijd: het zwaard werkt pas als het water er een klein beetje schuin langs stroomt. De boot vaart dus iets schuin door het water (de grijze pijl voor de boeg). Haal je het zwaard op, dan wordt die hoek veel groter.' },
      { kop: 'Waarom blijft de pijl even groot?', tekst: 'Vaart de boot rechtdoor, dan is de driftbeperkende kracht altijd even groot als de verlijerende: anders zou hij steeds sneller opzij gaan. Wat het zwaard verandert, is hoe schuin de boot daarvoor door het water moet. Met het zwaard neer is een kleine hoek genoeg; haal je het op, dan moet de romp het alleen doen, en dat lukt pas als de boot veel schuiner door het water gaat: kijk naar de grijze pijl voor de boeg.' },
      { kop: 'Evenwicht', tekst: 'Waarom gaat de boot niet steeds harder? Bij meer snelheid remt het water meer, tot de weerstand even groot is als de voortstuwende kracht. Dan blijft de snelheid gelijk. Gaat het harder waaien, dan wint de voortstuwing even en versnelt de boot, tot ze weer even groot zijn.' },
      { kop: 'Wanneer het zwaard op?', tekst: 'Aan de wind is het verlijerende deel groot: zwaard neer. Voor de wind duwt de wind bijna alleen vooruit; met het zwaard (half) op heb je dan minder weerstand. En in ondiep water haal je het op.' },
      { kop: 'Waar ligt het lateraal punt?', tekst: 'Geen boek geeft de precieze plek voor een lelievlet. Dit model rekent het uit met de vormen onder water: iets achter de mast.' },
    ],
    bediening: ['koers', 'zwaard'],
    toon: ['zeilkracht', 'ontbonden', 'drift', 'weerstand', 'lp', 'zp', 'koersdoorwater'],
    begin: { koers: 45, groot: 'goed', fok: 'goed', bft: 3, vaart: 1, zwaard: 'neer' },
    vraag: {
      tekst: 'Je vaart aan de wind en haalt het zwaard op. Wat gebeurt er?',
      opties: [['Je gaat sneller: minder weerstand', false], ['Je verlijert meer', true], ['Er verandert niets', false]],
      uitleg: 'Zonder zwaard moet de romp de boot alleen tegenhouden. Dat lukt alleen als de boot veel schuiner door het water gaat: hij verlijert meer en wint minder hoogte.',
      laat: { zwaard: 'op' },
    },
    status: (r) => {
      const l = r.verlijering;
      return `Verlijeren: ${l < 6 ? 'een klein beetje' : l < 20 ? 'flink' : 'veel'} (${Math.round(l)}°). De verlijerende en de driftbeperkende kracht zijn even groot, net als de voortstuwende kracht en de weerstand.`;
    },
  },
  {
    id: 'sturen', titel: 'Sturen met de zeilen', cwo: 'KB I', bron: 'Sint Maarten KB III § 7.5',
    aanzicht: 'boven',
    kort: [
      'Het grootzeil werkt achter het lateraal punt. Zijn kracht duwt de achtersteven van de wind af: een <b>oploevend koppel</b>, de boot draait de wind in.',
      'De fok werkt voor het lateraal punt en duwt de boeg van de wind af: een <b>afvallend koppel</b>. Welk koppel wint, bepaal je met de schoten.',
    ],
    meer: [
      { kop: 'Loefgierig', tekst: 'Met goed staande zeilen wint bij een lelievlet het grootzeil een beetje: laat je het roer los, dan loeft hij op. Hij is <b>loefgierig</b>. Om rechtdoor te varen houd je de helmstok iets naar loef; kijk maar naar de helmstok. Een beetje loefgierig is veilig: laat je los, dan draait de boot de wind in en valt de druk weg.' },
      { kop: 'Zo stuur je met de zeilen', tekst: 'Oploeven: grootzeil aan, fok vieren. Afvallen: grootzeil vieren, fok aan of bak houden. Het roer hoeft dan minder te doen, en remt dus ook minder.' },
      { kop: 'Fok bak', tekst: 'Houd je de fok aan de loefkant, dan duwt de wind hem naar lij. Dat gebeurt voor het lateraal punt, dus de boeg gaat hard van de wind af. Zo help je bij overstag gaan en bij bijliggen.' },
      { kop: 'Ook vooruit telt', tekst: 'Staat de giek uit, dan trekt het grootzeil vooruit in een punt buiten de boot, terwijl het water in het midden remt. Ook dat geeft een oploevend koppel. Daarom loeft een lelievlet met een ver gevierd grootzeil voor de wind toch nog op.' },
    ],
    bediening: ['groot', 'fok', 'koers'],
    toon: ['perzeil', 'zeilkoppels', 'samenkoppel', 'lp', 'helmstok'],
    balans: 'gier',                                     // the koppels side by side in the card
    begin: { koers: 70, groot: 'goed', fok: 'goed', bft: 3, vaart: 1, zwaard: 'neer' },
    vraag: {
      tekst: 'Je viert de fok en houdt het grootzeil aan. Wat doet de boot?',
      opties: [['Hij loeft op', true], ['Hij valt af', false], ['Hij vaart rechtdoor', false]],
      uitleg: 'De fok geeft bijna geen kracht meer, dus zijn afvallend koppel valt weg. Het oploevend koppel van het grootzeil wint: de boot draait de wind in, en je moet meer tegenroer geven.',
      laat: { fok: 'los' },
    },
    status: gier,
    zegt: ['gier'],
  },
  {
    id: 'helling', titel: 'Helling en sturen', cwo: 'KB II', bron: 'Sint Maarten KB III § 7.6',
    aanzicht: 'achterboven',
    kort: [
      'Van achteren gezien staat het zeilpunt hoog boven de boot en het lateraal punt diep eronder. Helt de boot naar lij, dan komt het zeilpunt buiten de boot te staan. Daar trekt de voortstuwende kracht, terwijl het water in het midden remt: een <b>oploevend koppel</b>.',
      'Helt de boot naar loef, dan wordt de <b>arm</b> kleiner of draait hij om: de boot wordt minder loefgierig, of zelfs <b>lijgierig</b>.',
    ],
    meer: [
      { kop: 'In een vlaag', tekst: 'Een vlaag laat de boot meer hellen. Het zeilpunt komt verder buiten de boot en de boot loeft op. Dat is ook veilig: met de kop in de wind valt de druk weg.' },
      { kop: 'Zo gebruik je het', tekst: 'Wil je oploeven of overstag, ga dan even aan lij zitten. Wil je afvallen, laat de boot dan iets naar loef hellen. Rechtop varen is meestal het snelst: dan hoef je het minst met het roer te remmen.' },
      { kop: 'Reven', tekst: 'Met een rif is het grootzeil kleiner en zit het zeilpunt lager. De boot helt minder, het zeilpunt komt minder ver buiten de boot en de boot wordt minder loefgierig.' },
      { kop: 'Ook rechtop', tekst: 'Ook als de boot rechtop vaart, staat het zeilpunt buiten het midden zodra de giek uitstaat. Daarom is een lelievlet altijd een beetje loefgierig.' },
    ],
    bediening: ['bemanning', 'wind', 'rif'],
    toon: ['voortstuwend', 'weerstand', 'zp', 'lp', 'armgier', 'gierkoppel', 'helmstok'],
    begin: { koers: 70, groot: 'goed', fok: 'goed', bft: 3, vaart: 1, zwaard: 'neer', bemanning: 0, rif: 0 },
    vraag: {
      tekst: 'Jullie gaan allemaal aan lij zitten. Wat doet de boot?',
      opties: [['Hij loeft op', true], ['Hij valt af', false], ['Er verandert niets', false]],
      uitleg: 'De boot helt meer naar lij. Het zeilpunt komt verder buiten de boot, de arm wordt langer en het oploevend koppel groter. Je moet de helmstok verder naar loef houden.',
      laat: { bemanning: -1 },
    },
    status: hellingEnGier,
    zegt: ['helling', 'gier'],
    helt: true,
  },
  {
    id: 'stabiliteit', titel: 'Helling en stabiliteit', cwo: 'KB III', bron: 'Sint Maarten KB III § 7.7',
    aanzicht: 'achter',
    kort: [
      'De zeilkracht werkt hoog in de zeilen, de driftbeperkende kracht diep onder water. Samen maken ze het <b>kenterend koppel</b>: de boot wil omvallen.',
      'Daartegen werkt het <b>oprichtend koppel</b>: de zwaartekracht in het <b>zwaartepunt</b> en de opwaartse kracht in het <b>drukpunt</b>. Helt de boot, dan schuift het drukpunt naar lij en komt er een arm tussen. Bij een vaste helling zijn de twee koppels even groot.',
    ],
    meer: [
      { kop: 'Vormstabiel', tekst: 'Een lelievlet is breed en plat: <b>vormstabiel</b>. Bij een kleine helling schuift het drukpunt snel naar lij, dus hij staat meteen stevig. Helt hij ver, dan komt het drukpunt weer dichter bij het zwaartepunt: de arm wordt kleiner en het oprichtend koppel ook. Een kielboot met een zware kiel is <b>gewichtsstabiel</b>: in het begin wiebelig, maar hoe verder hij helt, hoe sterker hij terugkomt.' },
      { kop: 'De bemanning', tekst: 'Zitten jullie aan loef, dan schuift het zwaartepunt naar loef en wordt de arm langer: meer oprichtend koppel, minder helling.' },
      { kop: 'Te veel helling', tekst: 'Gaat het berghout onder water, dan is het tijd om te reven: met minder zeil wordt het kenterend koppel kleiner. In een vlaag help je je meteen door de grootschoot te vieren.' },
      { kop: 'Reven', tekst: 'Met een rif rol je een deel van het grootzeil om de giek. Het zeil wordt kleiner, dus de zeilkracht ook, en het zeilpunt zakt: de arm van het kenterend koppel wordt korter. Allebei maken het kenterend koppel kleiner, dus de boot helt minder. Daarom reef je als het harder gaat waaien.' },
      { kop: 'Water in de boot', tekst: 'Water in de boot loopt naar de lage kant en laat de boot nog verder hellen. Hoos de boot dus leeg.' },
    ],
    bediening: ['wind', 'bemanning', 'groot', 'rif'],
    toon: ['zijkracht', 'drift', 'kenterend', 'zp', 'lp', 'zwaartepunt', 'drukpunt', 'armstab', 'oprichtend'],
    begin: { koers: 60, groot: 'goed', fok: 'goed', bft: 4, vaart: 1, zwaard: 'neer', bemanning: 0, rif: 0 },
    vraag: {
      tekst: 'Het gaat harder waaien. Waar kunnen jullie het beste gaan zitten?',
      opties: [['Aan loef', true], ['Aan lij', false], ['In het midden', false]],
      uitleg: 'Aan loef schuift het zwaartepunt naar loef. De arm tussen zwaartepunt en drukpunt wordt langer, het oprichtend koppel groter, en de boot helt minder.',
      laat: { bemanning: 1 },
    },
    status: (r, s) => helling(r, s),
    zegt: ['helling'],
    balans: 'helling',
    helt: true,
  },
  {
    id: 'wind', titel: 'Ware en schijnbare wind', cwo: 'KB III', bron: 'Sint Maarten KB III § 7.8',
    aanzicht: 'achterboven',                          // a flag seen from above is only a line
    kort: [
      'De <b>ware wind</b> voel je als je stilligt. Vaar je, dan komt er <b>vaartwind</b> bij: wind recht van voren, net zo hard als je vaart, zoals op de fiets.',
      'Samen vormen ze de <b>schijnbare wind</b>. Die voel je in de boot, die wijzen het windvaantje in de mast en de vlag op de boot aan, en daarop zet je de zeilen. Alleen wat stilstaat, zoals de vlag op de boei, wijst de ware wind aan.',
    ],
    meer: [
      { kop: 'Sneller varen', tekst: 'Hoe sneller je vaart, hoe meer de schijnbare wind van voren komt. Versnelt de boot, trek de zeilen dan wat aan.' },
      { kop: 'Een vlaag', tekst: 'In een vlaag wordt de ware wind ineens sterker, maar de boot is nog niet sneller. De schijnbare wind komt dan even ruimer in: je kunt iets oploeven en hoogte winnen.' },
      { kop: 'Voor de wind', tekst: 'Voor de wind vaar je met de wind mee. De vaartwind gaat er dan van af: de schijnbare wind is zwakker dan de ware wind.' },
    ],
    bediening: ['koers', 'vaart', 'vlaag'],
    toon: ['wind'],
    begin: { koers: 90, groot: 'goed', fok: 'goed', bft: 3, vaart: 0.4 },
    vraag: {
      tekst: 'De boot gaat sneller varen. Waar komt de schijnbare wind dan vandaan?',
      opties: [['Meer van voren', true], ['Meer van achteren', false], ['Hij blijft gelijk', false]],
      uitleg: 'De vaartwind komt recht van voren en wordt groter als je sneller gaat. Tel je hem op bij de ware wind, dan draait de schijnbare wind naar voren.',
      laat: { vaart: 1.2 },
    },
    status: (r) => {
      if (r.V < 0.05) return 'Stil: de schijnbare wind is de ware wind.';
      const verschil = Math.abs(r.awa - Math.abs(r.course));
      if (verschil < 3) return 'De schijnbare wind komt bijna uit dezelfde hoek als de ware wind.';
      return `De schijnbare wind komt ${Math.round(verschil)}° meer van voren dan de ware wind, en is ${r.aws > r.tws ? 'sterker' : 'zwakker'}.`;
    },
  },
  {
    id: 'roer', titel: 'Het roer', cwo: 'KB II · KB III', bron: 'Sint Maarten KB III § 7.9',
    aanzicht: 'boven',
    kort: [
      'Het roer buigt het water af, zoals het zeil de wind. Zo ontstaat de <b>roerkracht</b>, haaks op het roerblad. Die duwt de achtersteven opzij, en de boot draait om het lateraal punt.',
      'Hoe sneller je vaart en hoe verder je het roer uitzet, hoe groter de roerkracht. Lig je stil, dan doet het roer niets.',
    ],
    meer: [
      { kop: 'Sturend en remmend', tekst: 'Splits de roerkracht in een deel opzij, de <b>sturende kracht</b>, en een deel naar achteren, de <b>remmende kracht</b>. Bij 45° zijn ze ongeveer even groot. Zet je het roer verder uit, dan wordt de sturende kracht weer kleiner en de remmende steeds groter: je remt meer dan je draait. Stuur dus met niet meer roer dan nodig.' },
      { kop: 'Helmstok en boeg', tekst: 'Duw je de helmstok naar bakboord, dan gaat het roerblad naar stuurboord en de achtersteven naar bakboord. De boeg draait dan naar stuurboord: de andere kant op dan de helmstok.' },
      { kop: 'Achteruit', tekst: 'Vaar je achteruit (deinzen), dan werkt het roer andersom: de boeg gaat naar de kant van de helmstok.' },
      { kop: 'Roer en zeilen samen', tekst: 'Elke roerbeweging remt een beetje. Help je het roer met de zeilen (zie <i>Sturen met de zeilen</i>), dan hoeft het roer minder en houd je meer snelheid.' },
    ],
    bediening: ['helmstok', 'vaart'],
    toon: ['roer', 'roerdelen', 'lp', 'roerkoppel'],
    begin: { koers: 90, groot: 'goed', fok: 'goed', bft: 3, vaart: 1, helmstok: 20 },
    vraag: {
      tekst: 'Je zet de helmstok heel ver uit, tot 70°. Draait de boot dan veel sneller dan bij 45°?',
      opties: [['Ja, veel sneller', false], ['Nee, eerder minder snel: hij remt vooral', true]],
      uitleg: 'Voorbij 45° wordt de sturende kracht weer kleiner, en de remmende kracht steeds groter. Je draait dus niet sneller: je verliest vooral snelheid.',
      laat: { helmstok: 70 },
    },
    status: (r, s) => {
      if (!s.helmstok) return 'Roer recht: geen roerkracht, de boot vaart rechtdoor.';
      if (r.V < 0.05) return 'Stil liggend stroomt er geen water langs het roer: het doet niets.';
      return `Helmstok naar ${kant(s.helmstok)}: de boeg draait naar ${kant(-s.helmstok)}.`;
    },
    koppel: 500,
  },
  {
    id: 'verkennen', titel: 'Zelf verkennen', cwo: '', bron: '',
    aanzicht: null,
    kort: [
      'Zet zelf aan wat je wilt zien, en verander de koers, de zeilen, het zwaard, de wind en de bemanning. Kijk wat er met de pijlen gebeurt.',
    ],
    meer: [],
    bediening: ['laag', 'koers', 'wind', 'grootschoot', 'fokkenschoot', 'roerstand', 'zwaard', 'bemanning', 'rif'],
    toon: [],                                                       // the chips (index.js LAGEN)
    begin: {},
    status: hellingEnGier,
    zegt: ['helling', 'gier'],
    helt: true,
  },
];
