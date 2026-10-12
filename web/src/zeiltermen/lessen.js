// Zeiltermen: the lessons. They follow Sint Maarten Kielboot I, § 1.2 (Peppelman 2025, CC BY-NC-SA 4.0)
// in order and in words: bakboord en stuurboord, loef en lij, hogerwal en lagerwal, de koersen, oploeven
// en afvallen, overstag, opkruisen en gijpen. "Met de wind over stuurboord" says which side the wind comes
// in over (what the book means by "over stuurboord"), so the open question of the convention (notities/
// begrippen, vraag 1) does not come into it.
//
// Each lesson:
//   id, titel, cwo        what it is called, and the CWO-niveau that asks for it
//   bron                  where in Sint Maarten KB I it is (for us: the viewer shows no sources on its cards)
//   aanzicht              where the camera goes: achter, voor, boven, achterboven, hoog (high over her, the bow up)
//   kaart                 how the map in the card is turned: 'boot' (the bow up) or 'wind' (the wind from the top,
//                         as the book draws it)
//   kort, meer            the words: always in view, and one click further ([{ kop, tekst }])
//   bediening             which controls the card shows (see index.js CONTROLS)
//   toon                  what is drawn on the boat and the map (see index.js items)
//   begin                 the settings it starts from
//   vraag                 { tekst, opties: [[tekst, goed]], uitleg, laat }: predict first, then see - `laat` is
//                         what is set once answered, so the answer shows on the boat
//   status(z)             one line under the controls: what the boat does now (z: see index.js `zo`)
//   helt                  she heels a little to lij, so the lage kant is low

// the course names as the windroos of the viewer has them (modes.js), and in de wind
export const KOERSEN = [[22, 'in de wind'], [70, 'aan de wind'], [112, 'halve wind'], [158, 'ruime wind'], [181, 'voor de wind']];
export const koersNaam = (c) => KOERSEN.find(([b]) => Math.min(Math.abs(c), 180) < b)[1];
const kant = (side) => (side > 0 ? 'stuurboord' : 'bakboord');
const hoofd = (t) => `${t[0].toUpperCase()}${t.slice(1)}`;
const vaart = (z) => (z.koers < 22 ? 'Je ligt in de wind: de zeilen klapperen en de boot komt stil te liggen.'
  : `Je vaart ${koersNaam(z.koers)} met de wind over ${kant(z.side)}.`);
// where something in the wind (or straight out of it) lies from her, in words: `c` its angle off the bow
const waar = (c, side) => (c < 25 ? 'recht voor je' : c > 155 ? 'recht achter je'
  : `${c < 65 ? 'schuin voor je' : c > 115 ? 'schuin achter je' : 'dwars'} aan ${kant(side)}`);

export const LESSEN = [
  {
    id: 'boorden', titel: 'Bakboord en stuurboord', cwo: 'KB I', bron: 'Sint Maarten KB I § 1.2.1',
    aanzicht: 'achter', kaart: 'boot',
    kort: [
      'Op het water zeg je niet links en rechts, maar <b>bakboord</b> en <b>stuurboord</b>. Zo weet iedereen in de boot meteen welke kant je bedoelt.',
      'Kijk altijd met de vaarrichting mee, van het achterdek naar het voordek. Dan is <b>bakboord links</b> en <b>stuurboord rechts</b>. Dat blijft zo, ook als je zelf andersom zit.',
    ],
    meer: [
      { kop: 'Rood en groen', tekst: '’s Nachts voert een schip aan bakboord een rood licht en aan stuurboord een groen licht. Zo zie je in het donker welke kant van een schip je ziet.' },
    ],
    bediening: ['kijk'],
    toon: ['vaarrichting', 'boorden'],
    begin: { kijk: 'achter' },
    vraag: {
      tekst: 'Je staat voor de boeg en kijkt naar de boot. Aan welke kant van jou is bakboord?',
      opties: [['Links van mij', false], ['Rechts van mij', true]],
      uitleg: 'Bakboord is links als je met de vaarrichting meekijkt. Kijk je de boot van voren aan, dan kijk je de andere kant op: bakboord is dan rechts van jou.',
      laat: { kijk: 'voor' },
    },
    status: (z) => (z.kijk === 'voor' ? 'Je kijkt de boot van voren aan: bakboord is nu rechts van je. Het blijft bakboord.'
      : 'Je kijkt met de vaarrichting mee: bakboord is links, stuurboord rechts.'),
  },
  {
    id: 'loeflij', titel: 'Loef en lij', cwo: 'KB I', bron: 'Sint Maarten KB I § 1.2.1',
    aanzicht: 'achterboven', kaart: 'wind',
    kort: [
      'Loef en lij zeggen waar de wind is. De kant waar de wind de boot in komt, is <b>loef</b>: de <b>hoge kant</b>. De kant waar de wind de boot weer verlaat, is <b>lij</b>: de <b>lage kant</b>.',
      'Hoog en laag, omdat de wind de boot een beetje laat hellen: de loefkant komt omhoog, de lijkant gaat omlaag.',
    ],
    meer: [
      { kop: 'Loef en lij wisselen', tekst: 'Komt de wind over stuurboord binnen, dan is stuurboord loef en bakboord lij. Komt hij over bakboord, dan is het andersom. Bakboord en stuurboord horen bij de boot, loef en lij bij de wind.' },
      { kop: 'Waar het zeil staat', tekst: 'De giek en het grootzeil staan aan lij: de wind duwt ze van zich af.' },
      { kop: 'Ook om je heen', tekst: 'Loef en lij gaan ook over wat om je heen is. Een boei aan loef ligt aan de kant waar de wind vandaan komt. Een boot aan lij van je ligt aan de kant waar de wind naartoe waait.' },
    ],
    bediening: ['boeg'],
    toon: ['wind', 'loeflij'],
    begin: { koers: 90, side: 1 },                          // over stuurboord: the question sends her to the other boeg
    helt: true,
    vraag: {
      tekst: 'Je gaat naar de andere boeg: de wind komt nu over bakboord binnen. Welke kant is dan lij?',
      opties: [['Bakboord', false], ['Stuurboord', true]],
      uitleg: 'Lij is de kant waar de wind de boot verlaat: tegenover de kant waar hij binnenkomt. Met de wind over bakboord is stuurboord lij, en daar gaat de giek nu ook heen.',
      laat: { side: -1 },
    },
    status: (z) => (z.koers < 22 ? 'Je ligt in de wind: die komt recht van voren, en er is geen loef of lij.'
      : `De wind komt over ${kant(z.side)} binnen: ${kant(z.side)} is loef, de hoge kant. ${hoofd(kant(-z.side))} is lij, de lage kant.`),
  },
  {
    id: 'wal', titel: 'Hogerwal en lagerwal', cwo: 'KB I', bron: 'Sint Maarten KB I § 1.2.1',
    aanzicht: 'hoog', kaart: 'wind',
    kort: [
      'Ook een wal heeft een naam naar de wind. De <b>hogerwal</b> is de wal waar de wind vandaan komt. De <b>lagerwal</b> is de wal waar de wind naartoe waait.',
      'Je hogerwal ligt dus aan loef van je, je lagerwal aan lij. Hoe je ook vaart: de hogerwal blijft de wal waar de wind vandaan komt.',
    ],
    meer: [
      { kop: 'Pas op voor lagerwal', tekst: 'Lig je stil, of gaat er iets mis, dan drijf je met de wind mee naar de lagerwal. Houd daarom ruimte aan lij, en vaar niet onnodig dicht onder de lagerwal.' },
      { kop: 'Aanleggen', tekst: 'Aan een hogerwal waait de wind je van de kant af: je vaart aan de wind op de kant aan en remt met killende zeilen. Aan een lagerwal waait hij je ertegenaan: dan strijk je eerst het grootzeil. In Manoeuvres vind je ze allebei, onder Afmeren.' },
    ],
    bediening: ['koers', 'boeg'],
    toon: ['wind', 'wal'],
    begin: { koers: 90 },
    vraag: {
      tekst: 'Je zeilen vallen weg en je ligt stil. Naar welke wal drijf je?',
      opties: [['Naar de hogerwal', false], ['Naar de lagerwal', true], ['Je blijft liggen waar je bent', false]],
      uitleg: 'De wind duwt de boot mee, naar de kant waar hij naartoe waait: de lagerwal.',
      laat: { drift: true },
    },
    status: (z) => `De hogerwal ligt ${waar(z.koers, z.side)}, de lagerwal ${waar(180 - z.koers, -z.side)}.`,
  },
  {
    id: 'koersen', titel: 'Koersen', cwo: 'KB I', bron: 'Sint Maarten KB I § 1.2.2',
    aanzicht: 'achterboven', kaart: 'wind',
    kort: [
      'Een <b>koers</b> zegt hoe de boot ligt ten opzichte van de wind. Van recht tegen de wind in tot recht van de wind af: <b>in de wind</b>, <b>aan de wind</b>, <b>halve wind</b>, <b>ruime wind</b> en <b>voor de wind</b>.',
      'Elke koers kun je varen met de wind over bakboord en met de wind over stuurboord, behalve in de wind.',
    ],
    meer: [
      { kop: 'In de wind', tekst: 'Recht tegen de wind in kun je niet zeilen: de zeilen klapperen en je komt stil te liggen. Zo dicht als het gaat bij de wind vaar je aan de wind, ongeveer 45° van de wind af.' },
      { kop: 'De zeilen per koers', tekst: 'Aan de wind staan de zeilen strak. Hoe ruimer je vaart, hoe verder je ze viert. Voor de wind staat het grootzeil helemaal uit en zet je de fok te loevert, aan de andere kant.' },
      { kop: 'Waarom het ertoe doet', tekst: 'Veel manoeuvres beginnen op een vaste koers: overstag ga je vanaf aan de wind, gijpen doe je vanaf voor de wind. Daarom moet je de koersen kennen en kunnen varen.' },
    ],
    bediening: ['koers', 'boeg'],
    toon: ['wind', 'koersen', 'koersnaam'],
    begin: { koers: 45 },
    vraag: {
      tekst: 'De wind komt schuin van achteren binnen. Welke koers vaar je?',
      opties: [['Aan de wind', false], ['Halve wind', false], ['Ruime wind', true], ['Voor de wind', false]],
      uitleg: 'Schuin van achteren is ruime wind: tussen halve wind (de wind dwars) en voor de wind (recht van achteren) in.',
      laat: { koers: 135 },
    },
    status: vaart,
  },
  {
    id: 'draaien', titel: 'Oploeven en afvallen', cwo: 'KB I', bron: 'Sint Maarten KB I § 1.2.2',
    aanzicht: 'boven', kaart: 'wind',
    kort: [
      'Als je van koers verandert, draai je de boeg naar de wind toe of van de wind af.',
      'Naar de wind toe draaien heet <b>oploeven</b>: je gaat <b>hoger</b> varen. Van de wind af draaien heet <b>afvallen</b>: je gaat <b>lager</b>, of ruimer, varen.',
    ],
    meer: [
      { kop: 'Met de helmstok', tekst: 'Om op te loeven duw je de helmstok naar lij, van de wind af. Om af te vallen haal je hem naar loef: naar je toe, als je aan de hoge kant zit.' },
      { kop: 'De zeilen mee', tekst: 'Loef je op, haal dan de schoten aan. Val je af, vier ze dan. Zo blijven de zeilen goed staan.' },
      { kop: 'Tot hoe ver', tekst: 'Oploeven kan tot aan de wind: nog verder en je komt in de wind te liggen. Afvallen kan tot voor de wind: nog verder en de giek kan onverwacht overslaan.' },
    ],
    bediening: ['draai'],
    toon: ['wind', 'draai', 'koersnaam'],
    begin: { koers: 90 },
    vraag: {
      tekst: 'Je vaart halve wind en loeft op. Welke koers kom je dan op?',
      opties: [['Aan de wind', true], ['Ruime wind', false], ['Voor de wind', false]],
      uitleg: 'Oploeven is naar de wind toe draaien: van halve wind kom je dan op aan de wind.',
      laat: { draai: 'op', koers: 45 },
    },
    status: (z) => (z.draai && z.van !== undefined && koersNaam(z.van) !== koersNaam(z.koers)
      ? `Je bent ${z.draai === 'op' ? 'opgeloefd' : 'afgevallen'} van ${koersNaam(z.van)} naar ${koersNaam(z.koers)}.` : vaart(z)),
  },
  {
    id: 'overstag', titel: 'Overstag', cwo: 'KB I', bron: 'Sint Maarten KB I § 1.2.3',
    aanzicht: 'hoog', kaart: 'wind',
    kort: [
      'Bij <b>overstag</b> ga je van aan de wind met de wind over de ene boeg naar aan de wind met de wind over de andere boeg. De boeg draait daarbij <b>door de wind</b>.',
      'Overstag gaan heet ook <b>wenden</b>.',
    ],
    meer: [
      { kop: 'De boeg', tekst: 'De boeg is de voorkant van de boot. Over de andere boeg wil zeggen: de wind komt nu over de andere kant binnen. Loef en lij wisselen dus ook.' },
      { kop: 'Stap voor stap', tekst: 'Hoe je overstag gaat, met de commando’s, zie je in Leren › Manoeuvres, onder Wenden.' },
    ],
    bediening: ['overstag'],
    toon: ['wind', 'loeflij', 'spoor'],
    begin: { koers: 45 },
    vraag: {
      tekst: 'Je gaat overstag. Wat draait er door de wind?',
      opties: [['De boeg', true], ['De achtersteven', false], ['Niets: je draait van de wind af', false]],
      uitleg: 'Bij overstag draait de boeg door de wind. Bij een gijp is het de achtersteven.',
      laat: { doe: 'overstag' },
    },
    status: (z) => (z.bezig ? 'Overstag: de boeg draait door de wind.'
      : z.klaar ? `Overstag gegaan: je vaart nu ${z.koers < 22 ? 'nog in de wind' : `${koersNaam(z.koers)} met de wind over ${kant(z.side)}`}.` : vaart(z)),
  },
  {
    id: 'opkruisen', titel: 'Opkruisen', cwo: 'KB I', bron: 'Sint Maarten KB I § 1.2.4',
    aanzicht: 'hoog', kaart: 'wind',
    kort: [
      'Wil je naar een punt dat in de wind ligt, dan kun je er niet recht naartoe zeilen. Je vaart dan steeds aan de wind en gaat steeds overstag: dat heet <b>opkruisen</b>.',
      'Zo vaar je zigzag tegen de wind in, en kom je bij elke slag een stuk hoger.',
    ],
    meer: [
      { kop: 'Slagen', tekst: 'Elk stuk tussen twee keer overstag heet een slag. Hoe hoger je aan de wind kunt varen, hoe minder slagen je nodig hebt.' },
      { kop: 'Bezeild', tekst: 'Kun je het punt halen zonder nog eens overstag te gaan, dan heb je het bezeild.' },
    ],
    bediening: ['opkruisen'],
    toon: ['wind', 'spoor'],
    begin: { koers: 45 },
    vraag: {
      tekst: 'Waarom kun je niet recht naar een punt in de wind zeilen?',
      opties: [['De zeilen klapperen en je komt stil te liggen', true], ['Dat mag niet volgens de regels', false], ['De boot gaat dan te hard', false]],
      uitleg: 'Recht tegen de wind in vangen de zeilen geen wind. Daarom vaar je aan de wind, zo hoog als het gaat, en ga je steeds overstag.',
      laat: { doe: 'opkruisen' },
    },
    status: (z) => (z.bezig ? 'Opkruisen: aan de wind, overstag, en weer aan de wind.' : z.klaar ? 'Opgekruist: zigzag ben je tegen de wind in gekomen.' : vaart(z)),
  },
  {
    id: 'gijpen', titel: 'Gijpen', cwo: 'KB I', bron: 'Sint Maarten KB I § 1.2.5',
    aanzicht: 'hoog', kaart: 'wind',
    kort: [
      'Bij een <b>gijp</b> ga je van voor de wind met de wind over de ene boeg naar voor de wind met de wind over de andere boeg. Nu draait de <b>achtersteven</b> door de wind.',
      'De giek gaat daarbij naar de andere kant. Daarom haal je hem eerst binnen, en let iedereen op zijn hoofd.',
    ],
    meer: [
      { kop: 'Overstag of gijpen?', tekst: 'Bij overstag gaat de boeg door de wind, bij een gijp de achtersteven. Overstag ga je vanaf aan de wind, gijpen doe je vanaf voor de wind.' },
      { kop: 'Stap voor stap', tekst: 'Hoe je gijpt, met de commando’s, zie je in Leren › Manoeuvres, onder Wenden.' },
    ],
    bediening: ['gijpen'],
    toon: ['wind', 'loeflij', 'spoor'],
    begin: { koers: 180 },
    vraag: {
      tekst: 'Wat doe je voordat de giek bij een gijp overgaat?',
      opties: [['De grootschoot binnenhalen', true], ['De fokkenschoot vieren', false], ['Het zwaard opdraaien', false]],
      uitleg: 'Een binnengehaalde giek zwaait maar een klein stukje over, in plaats van met volle vaart van boord tot boord.',
      laat: { doe: 'gijpen' },
    },
    status: (z) => (z.bezig ? 'Gijpen: de achtersteven draait door de wind, en de giek gaat over.'
      : z.klaar ? `Gegijpt: je vaart nu ${koersNaam(z.koers)} met de wind over ${kant(z.side)}.` : vaart(z)),
  },
  {
    id: 'verkennen', titel: 'Zelf verkennen', cwo: '', bron: 'Sint Maarten KB I § 1.4',
    aanzicht: 'hoog', kaart: 'wind',
    kort: [
      'Zet aan wat je wilt zien, en kies een koers. Probeer het eerst te zeggen, en kijk dan of het klopt: waar is loef, welke wal is de hogerwal, welke koers vaar je?',
    ],
    meer: [
      { kop: 'Alle termen', tekst: 'Bakboord, stuurboord, loefzijde, lijzijde, hoge kant, lage kant, hogerwal, lagerwal, in de wind, aan de wind, halve wind, ruime wind, voor de wind, oploeven, afvallen, overstag gaan, opkruisen en gijpen.' },
    ],
    bediening: ['koers', 'boeg', 'draai', 'laag'],
    toon: ['wind'],
    begin: {},
    status: vaart,
    quiz: ['zeiltermen', 'Zeiltermen'],
  },
];
