import * as THREE from 'three';
import { makeLamp } from './betonning.js';
import { character } from './lichtkarakter.js';

// Seinvlaggen: the flags of the Internationaal Seinboek (26 letters, 10 cijferwimpels, 3 vervangwimpels
// and the onderscheidingswimpel), the race signals of the Regels voor Wedstrijdzeilen 2025-2028, and the
// flags, boards and day signs of the BPR (with the BVA's noodsein N boven C). After
// reference/seinvlaggen/SEINVLAGGEN.md and seinvlaggen.json: every design is drawn with the broeking
// (hoist) on the left, in normalised coordinates, x from the hoist (0) to the vlucht (1), y from the top
// (0) to the bottom (1); the fields are painted in order and clipped by the outline. The ICS fixes no
// proportions and no shades: the chosen ones and the RvW palette are those of the md.
//
// No official Dutch text of the Seinboek is online, so the meanings of the letters are our own
// translation of Pub. 102 (eigenVertaling: true), kept short and plain. The race signals follow the
// official Dutch RvW, the BPR signs the law.

// ---------------------------------------------------------------- colours, patterns, shapes (the zoek chips)
/** The RvW palette (md "Colours"); lichtblauw has no published value, ours is a guess. */
export const KLEUREN = {
  rood: '#e31f27', blauw: '#005c8e', geel: '#ffe600', zwart: '#000000', wit: '#ffffff',
  oranje: '#f26322', groen: '#00a060', lichtblauw: '#86c8ec',
};
const GRIJS = '#c9ccd0';                                   // the klassenvlag: its colours are the event's own

export const VLAG_KLEUREN = [['rood', 'Rood'], ['wit', 'Wit'], ['blauw', 'Blauw'], ['geel', 'Geel'], ['zwart', 'Zwart'],
  ['oranje', 'Oranje'], ['groen', 'Groen'], ['lichtblauw', 'Lichtblauw']].map(([key, label]) => [key, label, KLEUREN[key]]);
export const PATRONEN = [
  ['effen', 'Effen'], ['gedeeld', 'In tweeën'], ['banden', 'Strepen'], ['kruis', 'Kruis'], ['schuin kruis', 'Schuin kruis'],
  ['ruit', 'Ruit'], ['vlak in vlak', 'Vlak in vlak'], ['schijf', 'Bol of schijf'], ['blokken', 'Blokken'], ['driehoeken', 'Driehoeken'],
  ['tekst', 'Letter of woord'], ['gezwaaid', 'Gezwaaid'], ['met bol', 'Met een bol'], ['samengesteld', 'Meer vlaggen'], ['variabel', 'Wisselt'],
];
export const VORMEN = [['vlag', 'Vlag'], ['zwaluwstaart', 'Zwaluwstaart'], ['wimpel', 'Wimpel'], ['puntwimpel', 'Puntwimpel'],
  ['bord', 'Bord'], ['meer vlaggen', 'Meer vlaggen']];

// ---------------------------------------------------------------- designs
const RECHT = [[0, 0], [1, 0], [1, 1], [0, 1]];
const OMTREK = {
  vlag: RECHT, bord: RECHT,
  zwaluwstaart: [[0, 0], [1, 0], [0.75, 0.5], [1, 1], [0, 1]],   // the notch a quarter of the length deep
  wimpel: [[0, 0], [1, 0.3], [1, 0.7], [0, 1]],                    // tapered, blunt: the fly 0.4 of the hoist
  puntwimpel: [[0, 0], [1, 0.5], [0, 1]],
  driehoek: [[0.5, 0], [1, 1], [0, 1]],                            // a board, point up
};
const VERHOUDING = { vlag: 1.25, zwaluwstaart: 1.25, wimpel: 2.5, puntwimpel: 1.6, bord: 0.8 };   // length : height
/** A design: its shape, its fields painted in order; `l` length ÷ height, `omtrek` another outline. */
const ontwerp = (vorm, velden, { l = VERHOUDING[vorm], omtrek = OMTREK[vorm] } = {}) => ({ vorm, l, omtrek, velden });

const vlak = (k) => ({ t: 'vlak', k });
const staand = (kleuren, delen) => ({ t: 'banden', staand: true, kleuren, delen });     // side by side, hoist first
const liggend = (kleuren, delen) => ({ t: 'banden', staand: false, kleuren, delen });   // top down
const rh = (x, y, b, h, k) => ({ t: 'rh', x, y, b, h, k });
const veelhoek = (punten, k) => ({ t: 'veelhoek', punten, k });
const schijf = (cx, cy, r, k) => ({ t: 'schijf', cx, cy, r, k });                       // r: of the height, a true circle
const balk = (van, naar, breedte, k) => ({ t: 'balk', van, naar, breedte, k });         // breedte: of the height
const blokken = (kolommen, rijen, kleuren) => ({ t: 'blokken', kolommen, rijen, kleuren });   // first colour top left
const schuin = (aantal, kleuren) => ({ t: 'schuin', aantal, kleuren });                 // "/" bands, first at hoist-top
const tekst = (woord, k, cx, cy, hoogte) => ({ t: 'tekst', woord, k, cx, cy, hoogte });
const kruis = (k, x, b, y, h) => [rh(x, 0, b, 1, k), rh(0, y, 1, h, k)];
const zes = (a, b) => [a, b, a, b, a, b];

// ---------------------------------------------------------------- Seinboek: letters, cijfers, vervangers, OW
// [letter, spelwoord, design, patroon, meaning (own translation of Pub. 102)]
const LETTERS = [
  ['A', 'Alfa', ontwerp('zwaluwstaart', [staand(['wit', 'blauw'])]), 'gedeeld', 'Ik heb een duiker onder water. Houd ruim afstand en vaar langzaam.'],
  ['B', 'Bravo', ontwerp('zwaluwstaart', [vlak('rood')]), 'effen', 'Ik laad, los of vervoer gevaarlijke stoffen.'],
  ['C', 'Charlie', ontwerp('vlag', [liggend(['blauw', 'wit', 'rood', 'wit', 'blauw'])]), 'banden', 'Ja: het antwoord is bevestigend.'],
  ['D', 'Delta', ontwerp('vlag', [liggend(['geel', 'blauw', 'geel'], [0.2, 0.6, 0.2])]), 'banden', 'Houd van mij vrij: ik kan maar moeilijk manoeuvreren.'],
  ['E', 'Echo', ontwerp('vlag', [liggend(['blauw', 'rood'])]), 'gedeeld', 'Ik verander mijn koers naar stuurboord.'],
  ['F', 'Foxtrot', ontwerp('vlag', [vlak('wit'), veelhoek([[0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]], 'rood')]), 'ruit', 'Ik ben onmanoeuvreerbaar. Kom met mij in verbinding.'],
  ['G', 'Golf', ontwerp('vlag', [staand(zes('geel', 'blauw'))]), 'banden', 'Ik heb een loods nodig. Bij vissersschepen: ik haal mijn netten in.'],
  ['H', 'Hotel', ontwerp('vlag', [staand(['wit', 'rood'])]), 'gedeeld', 'Ik heb een loods aan boord.'],
  ['I', 'India', ontwerp('vlag', [vlak('geel'), schijf(0.5, 0.5, 0.25, 'zwart')]), 'schijf', 'Ik verander mijn koers naar bakboord.'],
  ['J', 'Juliett', ontwerp('vlag', [liggend(['blauw', 'wit', 'blauw'])]), 'banden', 'Ik heb brand en gevaarlijke lading aan boord, of ik lek gevaarlijke lading. Houd ruim van mij vrij.'],
  ['K', 'Kilo', ontwerp('vlag', [staand(['geel', 'blauw'])]), 'gedeeld', 'Ik wil met u in verbinding komen.'],
  ['L', 'Lima', ontwerp('vlag', [blokken(2, 2, ['geel', 'zwart'])]), 'blokken', 'Stop uw schip onmiddellijk.'],
  ['M', 'Mike', ontwerp('vlag', [vlak('blauw'), balk([0, 0], [1, 1], 0.175, 'wit'), balk([0, 1], [1, 0], 0.175, 'wit')]), 'schuin kruis', 'Mijn schip ligt stil en heeft geen vaart door het water.'],
  ['N', 'November', ontwerp('vlag', [blokken(4, 4, ['blauw', 'wit'])]), 'blokken', 'Nee: het antwoord is ontkennend.'],
  ['O', 'Oscar', ontwerp('vlag', [veelhoek([[0, 0], [1, 1], [0, 1]], 'geel'), veelhoek([[0, 0], [1, 0], [1, 1]], 'rood')]), 'gedeeld', 'Man over boord.'],
  ['P', 'Papa', ontwerp('vlag', [vlak('blauw'), rh(0.25, 0.25, 0.5, 0.5, 'wit')]), 'vlak in vlak', 'In de haven: iedereen aan boord, het schip gaat vertrekken. Bij vissersschepen op zee: mijn netten zitten vast.'],
  ['Q', 'Quebec', ontwerp('vlag', [vlak('geel')]), 'effen', 'Mijn schip is gezond en ik vraag om vrij verkeer met de wal.'],
  ['R', 'Romeo', ontwerp('vlag', [vlak('rood'), ...kruis('geel', 0.44, 0.12, 0.425, 0.15)]), 'kruis', 'Als losse vlag heeft R geen betekenis.'],
  ['S', 'Sierra', ontwerp('vlag', [vlak('wit'), rh(0.25, 0.25, 0.5, 0.5, 'blauw')]), 'vlak in vlak', 'Ik sla achteruit: mijn schroef draait achteruit.'],
  ['T', 'Tango', ontwerp('vlag', [staand(['rood', 'wit', 'blauw'])]), 'banden', 'Houd van mij vrij: ik vis met een spannet, twee schepen met samen één net.'],
  ['U', 'Uniform', ontwerp('vlag', [blokken(2, 2, ['rood', 'wit'])]), 'blokken', 'U loopt gevaar: u vaart op gevaar af.'],
  ['V', 'Victor', ontwerp('vlag', [vlak('wit'), balk([0, 0], [1, 1], 0.175, 'rood'), balk([0, 1], [1, 0], 0.175, 'rood')]), 'schuin kruis', 'Ik heb hulp nodig.'],
  ['W', 'Whiskey', ontwerp('vlag', [vlak('blauw'), rh(0.2, 0.2, 0.6, 0.6, 'wit'), rh(0.3, 0.3, 0.4, 0.4, 'rood')]), 'vlak in vlak', 'Ik heb medische hulp nodig.'],
  ['X', 'Xray', ontwerp('vlag', [vlak('wit'), ...kruis('blauw', 0.44, 0.12, 0.425, 0.15)]), 'kruis', 'Stop met wat u van plan bent en let op mijn seinen.'],
  ['Y', 'Yankee', ontwerp('vlag', [schuin(10, ['geel', 'rood'])]), 'banden', 'Mijn anker krabt: het houdt niet en sleept over de bodem.'],
  ['Z', 'Zulu', ontwerp('vlag', [
    veelhoek([[0, 0], [1, 0], [0.5, 0.5]], 'geel'), veelhoek([[0, 0], [0.5, 0.5], [0, 1]], 'zwart'),
    veelhoek([[0, 1], [0.5, 0.5], [1, 1]], 'rood'), veelhoek([[1, 0], [1, 1], [0.5, 0.5]], 'blauw'),
  ]), 'driehoeken', 'Ik heb een sleepboot nodig. Bij vissersschepen: ik zet mijn netten uit.'],
];
const LETTER_EXTRA = {
  A: { lelievlet: 'Dit is ook de duikvlag uit het BPR: blijf ruim uit de buurt, want er zwemt iemand onder water.' },
  O: { lelievlet: 'Deze vlag zit vaak aan een man-over-boord-boei.' },
  T: { lelievlet: 'Niet verwarren met de Nederlandse vlag: die heeft liggende banen rood, wit en blauw.' },
};

const CIJFERS = [
  ['1', 'Unaone', [vlak('wit'), schijf(0.24, 0.5, 0.27, 'rood')], 'schijf'],
  ['2', 'Bissotwo', [vlak('blauw'), schijf(0.24, 0.5, 0.27, 'wit')], 'schijf'],
  ['3', 'Terrathree', [staand(['rood', 'wit', 'blauw'])], 'banden'],
  ['4', 'Kartefour', [vlak('rood'), ...kruis('wit', 0.31, 0.08, 0.4, 0.2)], 'kruis'],
  ['5', 'Pantafive', [staand(['geel', 'blauw'])], 'gedeeld'],
  ['6', 'Soxisix', [liggend(['zwart', 'wit'])], 'gedeeld'],
  ['7', 'Setteseven', [liggend(['geel', 'rood'])], 'gedeeld'],
  ['8', 'Oktoeight', [vlak('wit'), ...kruis('rood', 0.31, 0.08, 0.4, 0.2)], 'kruis'],
  ['9', 'Novenine', [rh(0, 0, 0.5, 0.5, 'wit'), rh(0.5, 0, 0.5, 0.5, 'zwart'), rh(0, 0.5, 0.5, 0.5, 'rood'), rh(0.5, 0.5, 0.5, 0.5, 'geel')], 'blokken'],
  ['0', 'Nadazero', [staand(['geel', 'rood', 'geel'])], 'banden'],
];

const SEINBOEK = [
  ...LETTERS.map(([id, spelwoord, o, patroon, betekenis]) => ({
    id, soort: 'letter', groep: 'Seinboek: letters', naam: `Vlag ${id}`, spelwoord, ontwerp: o, patroon, betekenis,
    eigenVertaling: true, bron: 'Internationaal Seinboek', ...LETTER_EXTRA[id],
  })),
  ...CIJFERS.map(([id, spelwoord, velden, patroon]) => ({
    id, soort: 'cijfer', groep: 'Seinboek: cijferwimpels', naam: `Cijferwimpel ${id}`, spelwoord, ontwerp: ontwerp('wimpel', velden), patroon,
    betekenis: id === '0' ? 'Het cijfer 0 in een sein uit het seinboek. Als losse wimpel betekent hij niets.'
      : `Het cijfer ${id} in een sein uit het seinboek. Bij wedstrijden: de OW boven deze wimpel is ${id} uur uitstel.`,
    bron: 'Internationaal Seinboek',
  })),
  { id: '1e-vervanger', soort: 'vervanger', groep: 'Seinboek: vervangwimpels en OW', naam: 'Eerste vervangwimpel',
    ontwerp: ontwerp('puntwimpel', [vlak('blauw'), veelhoek([[0, 0.2], [0.6, 0.5], [0, 0.8]], 'geel')]), patroon: 'vlak in vlak',
    betekenis: 'Herhaalt in een sein de bovenste vlag van dezelfde soort, want elke vlag is er maar één keer. Bij wedstrijden: algemene terugroep.',
    eigenVertaling: true, bron: 'Internationaal Seinboek' },
  { id: '2e-vervanger', soort: 'vervanger', groep: 'Seinboek: vervangwimpels en OW', naam: 'Tweede vervangwimpel',
    ontwerp: ontwerp('puntwimpel', [staand(['blauw', 'wit'])]), patroon: 'gedeeld',
    betekenis: 'Herhaalt in een sein de tweede vlag van boven, van dezelfde soort.', eigenVertaling: true, bron: 'Internationaal Seinboek' },
  { id: '3e-vervanger', soort: 'vervanger', groep: 'Seinboek: vervangwimpels en OW', naam: 'Derde vervangwimpel',
    ontwerp: ontwerp('puntwimpel', [vlak('wit'), rh(0, 1 / 3, 1, 1 / 3, 'zwart')]), patroon: 'banden',
    betekenis: 'Herhaalt in een sein de derde vlag van boven, van dezelfde soort.', eigenVertaling: true, bron: 'Internationaal Seinboek' },
  { id: 'onderscheidingswimpel', soort: 'onderscheiding', groep: 'Seinboek: vervangwimpels en OW', naam: 'Onderscheidingswimpel (OW)',
    ontwerp: ontwerp('wimpel', [staand(['rood', 'wit', 'rood', 'wit', 'rood'])]), patroon: 'banden',
    betekenis: 'Halfstok betekent ‘sein gezien’, in top ‘sein begrepen’; na het laatste sein is hij het slotsein, tussen cijfers de komma. Bij wedstrijden betekent de OW uitstel.',
    eigenVertaling: true, bron: 'Internationaal Seinboek; namen uit de RvW' },
];

// ---------------------------------------------------------------- Wedstrijdseinen (RvW 2025-2028)
// `vlaggen`: the flags that make the signal, top down (ids above); `naast`: on their own halyards.
// geluid in the RvW's notation: ↑ shown, ↓ taken down, • one sound, — one long sound.
const UITSTEL = 'Wedstrijd: uitstel en afbreken';
const START = 'Wedstrijd: start';
const BAAN = 'Wedstrijd: op de baan';
const WEDSTRIJD = [
  { id: 'wed-OW', groep: UITSTEL, naam: 'Uitstel (OW)', vlaggen: ['onderscheidingswimpel'], geluid: '↑ •• ↓ •', bron: 'RvW Wedstrijdseinen, 27.3',
    betekenis: 'Wedstrijden die nog niet zijn gestart, zijn uitgesteld. Omhoog met twee geluidsseinen; omlaag met één, en een minuut later volgt het waarschuwingssein.',
    lelievlet: 'Op het NK Lelievlet hangt de OW ook op de wal, in de vlaggenmast.' },
  { id: 'wed-OW-H', groep: UITSTEL, naam: 'Uitstel, seinen aan de wal (OW boven H)', vlaggen: ['onderscheidingswimpel', 'H'], geluid: '↑ ••', bron: 'RvW Wedstrijdseinen',
    betekenis: 'Nog niet gestarte wedstrijden zijn uitgesteld, en verdere seinen worden aan de wal gegeven. Omhoog met twee geluidsseinen.' },
  { id: 'wed-OW-A', groep: UITSTEL, naam: 'Uitstel, vandaag niets meer (OW boven A)', vlaggen: ['onderscheidingswimpel', 'A'], geluid: '↑ ••', bron: 'RvW Wedstrijdseinen',
    betekenis: 'Nog niet gestarte wedstrijden zijn uitgesteld: vandaag zijn er geen wedstrijden meer. Omhoog met twee geluidsseinen.' },
  { id: 'wed-OW-cijfer', groep: UITSTEL, naam: 'Uitstel in uren (OW boven cijfer)', vlaggen: ['onderscheidingswimpel', '1'], geluid: '↑ •• ↓ •', bron: 'RvW Wedstrijdseinen',
    betekenis: 'Uitstel van 1 tot 9 uur na de geplande starttijd: de cijferwimpel zegt hoeveel uur, hier één. Omhoog met twee geluidsseinen, omlaag met één.' },
  { id: 'wed-N', groep: UITSTEL, naam: 'Afbreken (N)', vlaggen: ['N'], geluid: '↑ ••• ↓ •', bron: 'RvW Wedstrijdseinen, 32.3',
    betekenis: 'Alle gestarte wedstrijden zijn afgebroken: terug naar het startgebied. Omhoog met drie geluidsseinen; omlaag met één, en een minuut later volgt het waarschuwingssein.' },
  { id: 'wed-N-H', groep: UITSTEL, naam: 'Afbreken, seinen aan de wal (N boven H)', vlaggen: ['N', 'H'], geluid: '↑ •••', bron: 'RvW Wedstrijdseinen, 32.3',
    betekenis: 'Alle gestarte wedstrijden zijn afgebroken, en verdere seinen worden aan de wal gegeven. Omhoog met drie geluidsseinen.' },
  { id: 'wed-N-A', groep: UITSTEL, naam: 'Afbreken, vandaag niets meer (N boven A)', vlaggen: ['N', 'A'], geluid: '↑ •••', bron: 'RvW Wedstrijdseinen, 32.3',
    betekenis: 'Alle gestarte wedstrijden zijn afgebroken: vandaag zijn er geen wedstrijden meer. Omhoog met drie geluidsseinen.' },

  { id: 'wed-klassenvlag', groep: START, naam: 'Klassenvlag: waarschuwingssein', ontwerp: ontwerp('vlag', [{ t: 'vlak', kleur: GRIJS }, tekst('?', 'zwart', 0.5, 0.52, 0.7)]),
    patroon: 'variabel', kleuren: [], geluid: '↑ • ↓ •', bron: 'RvW 26',
    betekenis: 'Vijf minuten voor de start gaat de klassenvlag omhoog, bij de start weer omlaag, elke keer met één geluidssein. Hoe hij eruitziet, staat in de wedstrijdbepalingen.',
    lelievlet: 'Op het NK Lelievlet 2026 droeg de klassenvlag het speltakembleem, op een oranje, rood of blauw veld.' },
  { id: 'wed-P', groep: START, naam: 'Voorbereiding (P)', vlaggen: ['P'], geluid: '↑ • ↓ —', bron: 'RvW 26',
    betekenis: 'Het voorbereidingssein: vier minuten voor de start omhoog, met één geluidssein. Eén minuut voor de start gaat hij omlaag, met één lang geluidssein.' },
  { id: 'wed-I', groep: START, naam: 'Voorbereiding met I-regel (I)', vlaggen: ['I'], geluid: '↑ • ↓ —', bron: 'RvW 26, 30.1',
    betekenis: 'Voorbereidingssein met de I-regel: ben je in de laatste minuut over de startlijn, dan moet je via een verlengde van de lijn terug.' },
  { id: 'wed-Z', groep: START, naam: 'Voorbereiding met Z-regel (Z)', vlaggen: ['Z'], geluid: '↑ • ↓ —', bron: 'RvW 26, 30.2',
    betekenis: 'Voorbereidingssein met de Z-regel: ben je in de laatste minuut in de driehoek tussen startlijn en eerste merkteken, dan krijg je 20 % straf.' },
  { id: 'wed-U', groep: START, naam: 'Voorbereiding met U-regel (U)', vlaggen: ['U'], geluid: '↑ • ↓ —', bron: 'RvW 26, 30.3',
    betekenis: 'Voorbereidingssein met de U-regel: wie in de laatste minuut in die driehoek is, wordt zonder zitting gediskwalificeerd. Dat geldt niet bij een herstart.' },
  { id: 'wed-Z-I', groep: START, naam: 'Voorbereiding met Z- en I-regel', vlaggen: ['Z', 'I'], naast: true, geluid: '↑ • ↓ —', bron: 'RvW 26, 30.1, 30.2',
    betekenis: 'Voorbereidingssein waarbij de I-regel en de Z-regel allebei gelden.' },
  { id: 'wed-zwarte-vlag', groep: START, naam: 'Zwarte vlag', ontwerp: ontwerp('vlag', [vlak('zwart')]), patroon: 'effen', geluid: '↑ • ↓ —', bron: 'RvW 26, 30.4',
    betekenis: 'Voorbereidingssein met de zwarte-vlagregel: wie in de laatste minuut in die driehoek is, wordt gediskwalificeerd, ook bij een herstart. Zijn zeilnummer wordt getoond.' },
  { id: 'wed-X', groep: START, naam: 'Individuele terugroep (X)', vlaggen: ['X'], geluid: '↑ •', bron: 'RvW 29.1',
    betekenis: 'Eén of meer boten waren bij de start te vroeg over de lijn en moeten terug om opnieuw te starten. Omhoog met één geluidssein.' },
  { id: 'wed-1e-vervanger', groep: START, naam: 'Algemene terugroep (eerste vervanger)', vlaggen: ['1e-vervanger'], geluid: '↑ •• ↓ •', bron: 'RvW 29.2',
    betekenis: 'Algemene terugroep: de hele klasse start opnieuw. Omhoog met twee geluidsseinen; omlaag met één, en een minuut later volgt het waarschuwingssein.' },
  { id: 'wed-oranje-vlag', groep: START, naam: 'Startlijn (oranje vlag)', ontwerp: ontwerp('vlag', [vlak('oranje')]), patroon: 'effen', geluid: '', bron: 'RvW Wedstrijdseinen',
    betekenis: 'De stok of boei met deze vlag is één uiteinde van de startlijn.',
    lelievlet: 'Op het NK Lelievlet zit de oranje vlag op de gele startboeien.' },

  { id: 'wed-V', groep: BAAN, naam: 'Veiligheid (V)', vlaggen: ['V'], geluid: '↑ —', bron: 'RvW Wedstrijdseinen, 37',
    betekenis: 'Luister het communicatiekanaal uit voor veiligheidsinstructies. Omhoog met één (lang) geluidssein.' },
  { id: 'wed-S', groep: BAAN, naam: 'Afgekorte baan (S)', vlaggen: ['S'], geluid: '↑ ••', bron: 'RvW 32.2',
    betekenis: 'De baan is ingekort: finish tussen het merkteken en de stok met vlag S. Omhoog met twee geluidsseinen.' },
  { id: 'wed-C', groep: BAAN, naam: 'Merkteken verlegd (C)', vlaggen: ['C'], geluid: '- - - - -', bron: 'RvW 33',
    betekenis: 'Het volgende merkteken is verlegd; een bord erbij zegt hoe. Je hoort herhaalde geluidsseinen.' },
  { id: 'wed-groene-driehoek', groep: BAAN, naam: 'Groene driehoek (bij C)', ontwerp: ontwerp('bord', [vlak('groen')], { omtrek: OMTREK.driehoek }), patroon: 'effen', geluid: '', bron: 'RvW 33',
    betekenis: 'Samen met vlag C: het volgende rak is naar stuurboord verlegd.' },
  { id: 'wed-rode-rechthoek', groep: BAAN, naam: 'Rode rechthoek (bij C)', ontwerp: ontwerp('bord', [vlak('rood')]), patroon: 'effen', geluid: '', bron: 'RvW 33',
    betekenis: 'Samen met vlag C: het volgende rak is naar bakboord verlegd.' },
  { id: 'wed-min', groep: BAAN, naam: 'Minbord (bij C)', ontwerp: ontwerp('bord', [vlak('wit'), rh(0.25, 0.3, 0.5, 0.06, 'zwart')]), patroon: 'tekst', geluid: '', bron: 'RvW 33',
    betekenis: 'Samen met vlag C: het volgende rak wordt korter.' },
  { id: 'wed-plus', groep: BAAN, naam: 'Plusbord (bij C)', ontwerp: ontwerp('bord', [vlak('wit'), rh(0.25, 0.3, 0.5, 0.06, 'zwart'), rh(0.4625, 0.15, 0.075, 0.36, 'zwart')]), patroon: 'tekst', geluid: '', bron: 'RvW 33',
    betekenis: 'Samen met vlag C: het volgende rak wordt langer.' },
  { id: 'wed-L', groep: BAAN, naam: 'Mededeling of volg mij (L)', vlaggen: ['L'], geluid: '↑ •', bron: 'RvW Wedstrijdseinen',
    betekenis: 'Aan de wal: er hangt een mededeling voor de deelnemers. Op het water: kom binnen roepafstand of volg dit schip.' },
  { id: 'wed-M', groep: BAAN, naam: 'Vervangend merkteken (M)', vlaggen: ['M'], geluid: '- - - - -', bron: 'RvW 34',
    betekenis: 'Het schip of voorwerp met deze vlag vervangt een merkteken dat er niet meer is. Je hoort herhaalde geluidsseinen.' },
  { id: 'wed-Y', groep: BAAN, naam: 'Drijfmiddel aan (Y)', vlaggen: ['Y'], geluid: '↑ •', bron: 'RvW 40',
    betekenis: 'Iedereen draagt een persoonlijk drijfmiddel, zoals een zwemvest; een wetsuit of droogpak telt niet. Omhoog met één geluidssein.',
    lelievlet: 'Op de Kaagcup betekent Y: iedereen een reddingsvest aan.' },
  { id: 'wed-blauwe-vlag', groep: BAAN, naam: 'Finishlijn (blauwe vlag)', ontwerp: ontwerp('vlag', [vlak('blauw')]), patroon: 'effen', geluid: '', bron: 'RvW Wedstrijdseinen',
    betekenis: 'De stok of boei met deze vlag is één uiteinde van de finishlijn.',
    lelievlet: 'Op het NK Lelievlet zit de blauwe vlag op de gele finishboeien.' },
  { id: 'wed-protestvlag', groep: BAAN, naam: 'Protestvlag', ontwerp: ontwerp('vlag', [vlak('rood')]), patroon: 'effen', geluid: '', bron: 'RvW 60.2',
    betekenis: 'Wie wil protesteren, roept ‘Protest’. Een boot langer dan 6 m toont ook een rode vlag.',
    lelievlet: 'Een lelievlet is 5,6 m lang: je roept alleen ‘Protest’, een vlag hoeft niet.' },
].map((v) => ({ soort: 'wedstrijd', ...v }));

// ---------------------------------------------------------------- BPR (and the BVA's noodsein at sea)
// `tafereel`: what the BPR describes, built as a small scene: 'heen-en-weer' and 'rond' (a flag swung by
// hand), 'bol' (a flag with a ball below it), 'werktuig' (two boards on a yard: red on the closed
// side, red over white on the free side), 'licht' (a board with a white flashing light).
const BPR_LIJST = [
  { id: 'bpr-3.30-rondzwaaien', naam: 'Noodsein: vlag rondzwaaien', ontwerp: ontwerp('vlag', [vlak('rood')]), tafereel: 'rond', patroon: 'gezwaaid', cwo: true,
    bron: 'BPR 3.30', betekenis: 'Dit schip is in nood en vraagt om hulp. ’s Nachts zwaait het een licht in het rond; met de hoorn geeft het herhaalde lange stoten.',
    lelievlet: 'Ben je zelf in nood, dan mag je ook een vlag of iets anders in het rond zwaaien.' },
  { id: 'bpr-3.30-vlag-bol', naam: 'Noodsein: vlag met bol', ontwerp: ontwerp('vlag', [vlak('rood')], { l: 1 }), tafereel: 'bol', patroon: 'met bol', cwo: true,
    bron: 'BPR 3.30; BVA bijlage IV', betekenis: 'Een vlag met een bol erboven of eronder: dit schip is in nood en vraagt om hulp. Op zee betekent dit teken hetzelfde.' },
  { id: 'bpr-3.38-duiker', naam: 'Duikvlag (A)', vlaggen: ['A'], cwo: true, bron: 'BPR 3.38',
    betekenis: 'Bij dit schip wordt gedoken. De vlag mag ook een stijve plaat zijn, en ’s nachts is hij verlicht.',
    lelievlet: 'Er zwemt iemand onder water: blijf er ruim vandaan en vaar langzaam.' },
  { id: 'bpr-3.25-werktuig', naam: 'Werkend werktuig: rood en rood-wit', ontwerp: ontwerp('bord', [liggend(['rood', 'wit'])], { l: 1.25 }),
    ook: ontwerp('bord', [vlak('rood')], { l: 1.25 }), tafereel: 'werktuig', patroon: 'gedeeld', cwo: true, bron: 'BPR 3.25; 6.22',
    betekenis: 'Hier wordt gewerkt of ligt een schip vast. Langs de rode kant varen is verboden; langs de rood-witte kant mag het, zonder golven te maken.',
    lelievlet: 'Vaar langs de rood-witte kant, en vaar daar langzaam.' },
  { id: 'bpr-3.29-rood-wit', naam: 'Rood boven wit: geen golfslag', ontwerp: ontwerp('bord', [liggend(['rood', 'wit'])], { l: 1.25 }), patroon: 'gedeeld', cwo: true,
    bron: 'BPR 3.29', betekenis: 'Dit schip wil geen last van jouw golven, bijvoorbeeld omdat het beschadigd is of er wordt gewerkt. In plaats van een bord mag het een vlag zijn.',
    lelievlet: 'Vaar langzaam en met ruime afstand langs.' },
  { id: 'bpr-6.04a-lichtblauw-bord', naam: 'Lichtblauw bord', ontwerp: ontwerp('bord', [vlak('wit'), rh(0.06, 0.06, 0.88, 0.88, 'lichtblauw')], { l: 1 }),
    tafereel: 'licht', patroon: 'vlak in vlak', cwo: true, bron: 'BPR 6.04a',
    betekenis: 'Dit grote schip wil stuurboord op stuurboord passeren, dus andersom dan gewoonlijk. Bij het bord flikkert een wit licht.',
    lelievlet: 'Geef het schip de ruimte, en passeer het liefst stuurboord op stuurboord.' },
  { id: 'bpr-A.1-rode-vlag', naam: 'Rode vlag: doorvaren verboden', ontwerp: ontwerp('vlag', [vlak('rood')]), patroon: 'effen', cwo: true,
    bron: 'BPR bijlage 7 A.1', betekenis: 'In-, uit- of doorvaren is hier verboden. Twee rode vlaggen boven elkaar: het verbod duurt langer.' },
  { id: 'bpr-H.3a-spuien', naam: 'Vlag ‘spuien’', ontwerp: ontwerp('vlag', [vlak('blauw'), tekst('spuien', 'wit', 0.5, 0.5, 0.45)], { l: 1.6 }), patroon: 'tekst', cwo: true,
    bron: 'BPR bijlage 7 H.3', betekenis: 'Er wordt water gespuid: reken op stroming bij de sluis. Hangen er ook drie rode lichten naast elkaar, dan gebeurt het zo meteen.' },
  { id: 'bpr-H.3b-inlaten', naam: 'Wimpel ‘inlaten’', ontwerp: ontwerp('puntwimpel', [vlak('blauw'), tekst('inlaten', 'wit', 0.34, 0.5, 0.3)], { l: 2.5 }), patroon: 'tekst', cwo: true,
    bron: 'BPR bijlage 7 H.3', betekenis: 'Er wordt water ingelaten: de stroming gaat naar de inlaat toe. Hangen er ook drie rode lichten naast elkaar, dan gebeurt het zo meteen.' },
  { id: 'bpr-3.17-rode-wimpel', naam: 'Rode wimpel: voorrang', ontwerp: ontwerp('puntwimpel', [vlak('rood')], { l: 2 }), patroon: 'effen',
    bron: 'BPR 3.17', betekenis: 'Dit schip heeft voorrang bij bruggen en sluizen en wil die gebruiken. De wimpel zit op het voorschip.',
    lelievlet: 'Bij een brug of sluis gaat dit schip vóór je.' },
  { id: 'bpr-3.18-rode-vlag-zwaaien', naam: 'Rode vlag zwaaien: onmanoeuvreerbaar', ontwerp: ontwerp('vlag', [vlak('rood')]), tafereel: 'heen-en-weer', patroon: 'gezwaaid',
    bron: 'BPR 3.18', betekenis: 'Dit schip kan niet meer manoeuvreren. Soms geeft het er vier korte stoten bij, of toont het in plaats van de vlag twee zwarte bollen.',
    lelievlet: 'Ga op tijd uit de weg: dit schip kan jou niet ontwijken.' },
  { id: 'bpr-3.24-gele-vlag', naam: 'Gele vlag: net uit', ontwerp: ontwerp('vlag', [vlak('geel')]), patroon: 'effen',
    bron: 'BPR 3.24', betekenis: 'Een stilliggend schip heeft aan de kant van de vlag een net of uitlegger uit. Niet verwarren met vlag Q, die ook geel is.' },
  { id: 'bpr-3.36-loodsvlag', naam: 'Loodsvlag', ontwerp: ontwerp('vlag', [vlak('blauw'), tekst('L', 'wit', 0.5, 0.52, 0.6)]), patroon: 'tekst',
    bron: 'BPR 3.36', betekenis: 'Dit is een loodsboot in dienst. Het is geen vlag uit het seinboek: seinvlag L is geel en zwart.' },
  { id: 'bva-NC-noodsein', naam: 'Noodsein op zee (N boven C)', vlaggen: ['N', 'C'], bron: 'BVA bijlage IV',
    betekenis: 'Op zee: dit schip is in nood en vraagt om hulp. Het is het noodsein N.C. uit het Internationaal Seinboek.' },
  { id: 'bpr-10.05-zeeschepen', naam: 'Vlaggen van zeeschepen', vlaggen: ['A', 'B', 'G', 'H', 'P', 'Q', 'Z'], naast: true, bron: 'BPR 10.05',
    betekenis: 'Zeeschepen mogen op de vaarwegen naar zee de seinboekvlaggen A, B, G, H, P, Q en Z tonen. Wat elke vlag betekent, staat bij de letter.' },
].map((v) => ({ soort: 'bpr', groep: 'BPR', ...v }));

// ---------------------------------------------------------------- the list
const BY_ID = new Map(SEINBOEK.map((v) => [v.id, v]));
const unique = (list) => [...new Set(list)];
/** The colours a design shows, in the order they are painted. */
const kleurenVan = (o) => unique(o.velden.flatMap((f) => f.kleuren ?? [f.k]).filter((k) => k in KLEUREN));

/** Fill in what a signal of other flags takes from them: its designs, its colours, its pattern and shape. */
function compleet(v) {
  const flags = v.vlaggen?.map((id) => BY_ID.get(id).ontwerp);
  const designs = flags ?? [v.ontwerp, ...(v.ook ? [v.ook] : [])];
  const one = flags?.length === 1 ? BY_ID.get(v.vlaggen[0]) : null;
  return {
    lelievlet: undefined, cwo: false, ...v,
    kleuren: v.kleuren ?? unique([...designs.flatMap(kleurenVan), ...(v.tafereel === 'bol' ? ['zwart'] : [])]),
    patroon: v.patroon ?? (one ? one.patroon : 'samengesteld'),
    vorm: v.vorm ?? (flags && !one ? 'meer vlaggen' : (one?.ontwerp ?? v.ontwerp).vorm),
  };
}

/**
 * Every flag, pennant, board and flag sign, in the order of the list: id, soort, groep, naam,
 * betekenis (Dutch), lelievlet (optional), kleuren, patroon, vorm (see PATRONEN, VORMEN), cwo, and what
 * draws it: `ontwerp` (one design) or `vlaggen` (ids, top down, `naast` side by side), `tafereel` for
 * a scene. eigenVertaling: the meaning is our own translation of the Seinboek.
 */
export const VLAGGEN = [...SEINBOEK, ...WEDSTRIJD, ...BPR_LIJST].map(compleet);
export const VLAG_GROEPEN = unique(VLAGGEN.map((v) => v.groep));

// ---------------------------------------------------------------- the picture
const r1 = (n) => Math.round(n * 10) / 10;
const pts = (list, w, h) => list.map(([x, y]) => `${r1(x * w)},${r1(y * h)}`).join(' ');
const fill = (k) => KLEUREN[k] ?? k;
const LIJN = '#2b2b2b';

/** One field of a design, w × h px. Bands overlap their neighbour a little: no hairline between them. */
function veld(f, w, h) {
  switch (f.t) {
    case 'vlak': return `<rect x="-1" y="-1" width="${r1(w + 2)}" height="${r1(h + 2)}" fill="${fill(f.k ?? f.kleur)}"/>`;
    case 'banden': {
      const n = f.kleuren.length; const delen = f.delen ?? Array(n).fill(1 / n);
      let at = 0;
      return f.kleuren.map((k, i) => {
        const from = at; at += delen[i]; const more = i < n - 1 ? 0.6 : 1;
        return f.staand ? `<rect x="${r1(from * w - (i ? 0 : 1))}" y="-1" width="${r1(delen[i] * w + more + (i ? 0 : 1))}" height="${r1(h + 2)}" fill="${fill(k)}"/>`
          : `<rect x="-1" y="${r1(from * h - (i ? 0 : 1))}" width="${r1(w + 2)}" height="${r1(delen[i] * h + more + (i ? 0 : 1))}" fill="${fill(k)}"/>`;
      }).join('');
    }
    case 'rh': return `<rect x="${r1(f.x * w)}" y="${r1(f.y * h)}" width="${r1(f.b * w)}" height="${r1(f.h * h)}" fill="${fill(f.k)}"/>`;
    case 'veelhoek': return `<polygon points="${pts(f.punten, w, h)}" fill="${fill(f.k)}"/>`;
    case 'schijf': return `<circle cx="${r1(f.cx * w)}" cy="${r1(f.cy * h)}" r="${r1(f.r * h)}" fill="${fill(f.k)}"/>`;
    case 'balk': {                                 // a bar from corner to corner, run on past the ends and clipped
      const [ax, ay] = [f.van[0] * w, f.van[1] * h]; const [bx, by] = [f.naar[0] * w, f.naar[1] * h];
      const len = Math.hypot(bx - ax, by - ay); const [dx, dy] = [(bx - ax) / len, (by - ay) / len];
      const [nx, ny] = [-dy * f.breedte * h / 2, dx * f.breedte * h / 2]; const e = w + h;
      const p = [[ax - dx * e + nx, ay - dy * e + ny], [bx + dx * e + nx, by + dy * e + ny], [bx + dx * e - nx, by + dy * e - ny], [ax - dx * e - nx, ay - dy * e - ny]];
      return `<polygon points="${p.map(([x, y]) => `${r1(x)},${r1(y)}`).join(' ')}" fill="${fill(f.k)}"/>`;
    }
    case 'blokken': {
      let out = '';
      for (let r = 0; r < f.rijen; r++) for (let c = 0; c < f.kolommen; c++) {
        out += `<rect x="${r1((c * w) / f.kolommen)}" y="${r1((r * h) / f.rijen)}" width="${r1(w / f.kolommen + 0.6)}" height="${r1(h / f.rijen + 0.6)}" fill="${fill(f.kleuren[(r + c) % 2])}"/>`;
      }
      return out;
    }
    case 'schuin': {                               // band i: (x + y) / 2 in [i/n, (i+1)/n), the lines x + y = c
      let out = '';
      for (let i = 0; i < f.aantal; i++) {
        const [c0, c1] = [(2 * i) / f.aantal, (2 * (i + 1)) / f.aantal + (i < f.aantal - 1 ? 0.004 : 0)];
        out += `<polygon points="${pts([[c0 + 1, -1], [c1 + 1, -1], [c1 - 2, 2], [c0 - 2, 2]], w, h)}" fill="${fill(f.kleuren[i % 2])}"/>`;
      }
      return out;
    }
    case 'tekst': return `<text x="${r1(f.cx * w)}" y="${r1(f.cy * h)}" font-family="Arial, Helvetica, sans-serif" font-weight="700" font-size="${r1(f.hoogte * h)}" fill="${fill(f.k)}" text-anchor="middle" dominant-baseline="central">${f.woord}</text>`;
    default: return '';
  }
}

let clips = 0;
/** A design h px high at (x, y), clipped by its outline; `lijn`: its edge drawn, so white reads on white. */
function stuk(o, x, y, h, lijn = true) {
  const w = h * o.l; const id = `c${++clips}`; const outline = pts(o.omtrek, w, h);
  return `<g transform="translate(${r1(x)} ${r1(y)})"><clipPath id="${id}"><polygon points="${outline}"/></clipPath>`
    + `<g clip-path="url(#${id})">${o.velden.map((f) => veld(f, w, h)).join('')}</g>`
    + (lijn ? `<polygon points="${outline}" fill="none" stroke="${LIJN}" stroke-width="1.5" stroke-linejoin="round"/>` : '') + '</g>';
}
const doc = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(w)}" height="${Math.ceil(h)}" viewBox="0 0 ${Math.ceil(w)} ${Math.ceil(h)}">${body}</svg>`;
const staffSvg = (x, y0, y1, width = 4) => `<rect x="${r1(x - width / 2)}" y="${r1(y0)}" width="${width}" height="${r1(y1 - y0)}" rx="${width / 2}" fill="#8a7a62"/>`;

/** An arrow head at (x, y) pointing along angle a (radians, SVG axes). */
const head = (x, y, a, s = 9, kleur = LIJN) => {
  const p = [[x, y], [x - s * Math.cos(a - 0.45), y - s * Math.sin(a - 0.45)], [x - s * Math.cos(a + 0.45), y - s * Math.sin(a + 0.45)]];
  return `<polygon points="${p.map(([px, py]) => `${r1(px)},${r1(py)}`).join(' ')}" fill="${kleur}"/>`;
};

/** The design only, w × h px, no edge: the face of the cloth in the model. */
function doekSvg(o, w, h) { return doc(w, h, stuk({ ...o, l: w / h }, 0, 0, h, false)); }

/** The SVG of one entry (its own document): the flag with its hoist on the left, a hoist of flags, or the BPR's scene. */
export function vlagSvg(v) {
  clips = 0;
  const pad = 4;
  if (v.vlaggen) {
    const designs = v.vlaggen.map((id) => BY_ID.get(id).ontwerp);
    if (designs.length === 1) return vlagSvg({ ontwerp: designs[0] });
    const h = 120; const gap = v.naast ? 34 : 16;
    if (v.naast) {                                 // each on its own halyard, in rows of four
      const per = Math.min(4, designs.length); const cell = Math.max(...designs.map((o) => o.l * h)) + gap;
      const rows = Math.ceil(designs.length / per);
      const body = designs.map((o, i) => stuk(o, pad + (i % per) * cell, pad + Math.floor(i / per) * (h + gap), h)).join('');
      return doc(pad * 2 + per * cell - gap, pad * 2 + rows * (h + gap) - gap, body);
    }
    const w = Math.max(...designs.map((o) => o.l * h)); const x = pad + 6;   // one above the other on a staff
    const body = designs.map((o, i) => stuk(o, x, pad + 8 + i * (h + gap), h)).join('');
    const bottom = pad + 8 + designs.length * (h + gap) - gap;
    return doc(x + w + pad, bottom + pad + 8, staffSvg(pad + 2, pad, bottom + 8) + body);
  }
  const o = v.ontwerp;
  switch (v.tafereel) {
    case 'heen-en-weer': {                         // the flag on a stick, swung from side to side
      const [px, py, len, h] = [130, 250, 170, 78];
      const stick = (angle, opacity) => `<g transform="rotate(${angle} ${px} ${py})" opacity="${opacity}">${staffSvg(px, py - len, py, 5)}${stuk(o, px + 2, py - len, h)}</g>`;
      const R = len + 26; const arc = (deg) => [px + R * Math.sin(deg * Math.PI / 180), py - R * Math.cos(deg * Math.PI / 180)];
      const [a0, a1] = [arc(-34), arc(34)];
      const body = stick(-26, 0.25) + stick(26, 0.25) + stick(0, 1)
        + `<path d="M${r1(a0[0])},${r1(a0[1])} A${R},${R} 0 0 1 ${r1(a1[0])},${r1(a1[1])}" fill="none" stroke="${LIJN}" stroke-width="3" stroke-dasharray="8 6"/>`
        + head(a1[0], a1[1], (34 * Math.PI) / 180, 16) + head(a0[0], a0[1], Math.PI - (34 * Math.PI) / 180, 16);
      return doc(380, 270, body);
    }
    case 'rond': {                                 // the flag on a stick, swung round in a circle
      const [px, py, len, h] = [160, 160, 105, 66]; const R = 138;
      const body = `<circle cx="${px}" cy="${py}" r="${R}" fill="none" stroke="${LIJN}" stroke-width="3" stroke-dasharray="10 7"/>`
        + head(px - R, py + 4, Math.PI / 2, 20) + head(px + R, py - 4, -Math.PI / 2, 20)
        + `<g transform="rotate(-35 ${px} ${py})">${staffSvg(px, py - len, py + 12, 5)}${stuk(o, px + 2, py - len, h)}</g>`
        + `<circle cx="${px}" cy="${py}" r="9" fill="#d9a982" stroke="${LIJN}" stroke-width="1.5"/>`;
      return doc(320, 320, body);
    }
    case 'bol': {                                  // the flag at the top, the ball hung below it (BPR schets 64)
      const h = 120; const r = 34; const x = pad + 4; const ball = pad + 8 + h + 18 + r;
      const body = staffSvg(x, pad, ball + r + 40) + stuk(o, x + 2, pad + 8, h)
        + `<circle cx="${x + 2 + r}" cy="${ball}" r="${r}" fill="#111"/><circle cx="${x + 2 + r - 11}" cy="${ball - 11}" r="7" fill="#fff" opacity="0.25"/>`;
      return doc(x + 2 + h * o.l + pad, ball + r + 40 + pad, body);
    }
    case 'werktuig': {                             // seen from the water: the red board on the closed side, red over white on the free side
      const bw = 110; const bh = bw / o.l; const yard = 46; const [left, right] = [92, 288];
      const body = `<rect x="20" y="246" width="340" height="34" fill="#5d636a" stroke="${LIJN}" stroke-width="1.5"/>`
        + `<path d="M0,282 q15,-6 30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0" fill="none" stroke="#3d7fb0" stroke-width="3"/>`
        + staffSvg(190, 30, 246, 6) + `<rect x="${left - 8}" y="${yard - 3}" width="${right - left + 16}" height="6" rx="3" fill="#8a7a62"/>`
        + `<line x1="${left}" y1="${yard}" x2="${left}" y2="${yard + 12}" stroke="${LIJN}" stroke-width="2"/><line x1="${right}" y1="${yard}" x2="${right}" y2="${yard + 12}" stroke="${LIJN}" stroke-width="2"/>`
        + stuk(v.ook, left - bw / 2, yard + 12, bh) + stuk(o, right - bw / 2, yard + 12, bh);
      return doc(380, 292, body);
    }
    case 'licht': {                                // the board, a white flashing light in front of it
      const s = 200; const c = pad + s / 2; let rays = '';
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4; const [c0, s0] = [Math.cos(a), Math.sin(a)];
        rays += `<line x1="${r1(c + 26 * c0)}" y1="${r1(c + 26 * s0)}" x2="${r1(c + 42 * c0)}" y2="${r1(c + 42 * s0)}" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`;
      }
      return doc(s + pad * 2, s + pad * 2, stuk(o, pad, pad, s) + rays + `<circle cx="${c}" cy="${c}" r="18" fill="#fff" stroke="${LIJN}" stroke-width="2"/>`);
    }
    default: {
      const h = o.vorm === 'bord' ? (o.l >= 1 ? 200 / o.l : 200) : 200;
      return doc(h * o.l + pad * 2, h + pad * 2, stuk(o, pad, pad, h));
    }
  }
}

// ---------------------------------------------------------------- the model
// A staff standing on the waterline at the origin, y up, the flag at its top flying towards +x, its
// face towards +z. The cloth is one plane seen from both sides: from behind its picture is mirrored and
// the hoist stays at the staff, as a real flag (md "Drawing conventions"). It waves along its length,
// more towards the fly. Outside a browser (a test in node) there is no canvas: the cloth keeps a plain
// colour and the light stays out.
const HAS_DOM = typeof document !== 'undefined';
const STAF = 3.6;                                  // m: the staff above the water
const HOOGTE = { vlag: 0.72, zwaluwstaart: 0.72, wimpel: 0.5, puntwimpel: 0.6 };   // m at the hoist: a flag 0.9 × 0.72
const BORD = 0.8;                                  // m: the longer side of a board
const STAF_R = 0.03;
const mat = (color, roughness = 0.8) => new THREE.MeshStandardMaterial({ color, roughness });
const M = {
  staf: mat(0xe6dfcc, 0.6), stok: mat(0x8a6a44), kader: mat(0x2a2a2a, 0.6), bol: mat(0x111111, 0.5),
  romp: mat(0xeeeeea, 0.6), ponton: mat(0x575d63), mens: mat(0x26385a), huid: mat(0xd9a982),
};
const cylinder = (r, h, m, y = h / 2) => { const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 10), m); c.position.y = y; return c; };
const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); return b; };

const maps = new WeakMap();                        // design -> its texture, one for every flag that shows it
/** The face of a design: its own SVG, rasterised once it has loaded. */
function texture(o) {
  if (!HAS_DOM) return null;
  if (maps.has(o)) return maps.get(o);
  const h = 256; const w = Math.min(1024, Math.round(h * o.l));
  const c = Object.assign(document.createElement('canvas'), { width: w, height: h });
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4;
  map.userData.shared = true;                      // never disposed with one flag
  const img = new Image();
  img.onload = () => { c.getContext('2d').drawImage(img, 0, 0, w, h); map.needsUpdate = true; URL.revokeObjectURL(img.src); };
  img.src = URL.createObjectURL(new Blob([doekSvg(o, w, h)], { type: 'image/svg+xml' }));
  maps.set(o, map);
  return map;
}

/**
 * A cloth h m high: its hoist on x = 0, its top on y = 0. With `waves` (a list) it is cut finely and
 * a function that waves it at time t is added to it; without, it stays flat (a board).
 */
function doek(o, h, waves, phase = 0) {
  const l = h * o.l;
  const geo = new THREE.PlaneGeometry(l, h, waves ? 20 : 1, waves ? 8 : 1);
  geo.translate(l / 2, -h / 2, 0);
  const map = texture(o);
  // what lies outside the outline (the notch of a swallowtail, the sides of a pennant) is left out
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
    map, color: map ? 0xffffff : fill(kleurenVan(o)[0] ?? 'wit'), side: THREE.DoubleSide, alphaTest: 0.5, roughness: 0.9,
  }));
  if (waves) {
    const pos = geo.attributes.position; const base = Float32Array.from(pos.array);
    const amp = 0.035 + 0.05 * l; const k = (2 * Math.PI) / 0.95;
    waves.push((t) => {
      for (let i = 0; i < pos.count; i++) {
        const x = base[3 * i]; const y = base[3 * i + 1]; const u = x / l;
        pos.array[3 * i + 2] = amp * u * (Math.sin(k * x - 3.1 * t + phase) + 0.35 * Math.sin(2.3 * k * x + 2 * y - 4.6 * t + 1.7 * phase));
      }
      pos.needsUpdate = true; geo.computeVertexNormals();
    });
  }
  return mesh;
}

/** A rigid board, its longer side `size` m, centred on its origin, in a dark frame when it is square-cornered. */
function bord(o, size = BORD) {
  const w = o.l >= 1 ? size : size * o.l; const h = w / o.l;
  const g = new THREE.Group();
  const face = doek(o, h, null); face.position.set(-w / 2, h / 2, 0.016); g.add(face);
  if (o.omtrek === RECHT) g.add(box(w + 0.03, h + 0.03, 0.02, M.kader, 0, 0, 0));    // its back dark, as the BPR's frame
  g.userData = { w, h };
  return g;
}

/** A staff `height` m above the water, standing in it a little, with a knob on top. */
function staf(g, x, height) {
  const pole = cylinder(STAF_R, height + 0.8, M.staf, (height - 0.8) / 2); pole.position.x = x; g.add(pole);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 8), M.staf); knob.position.set(x, height + 0.03, 0); g.add(knob);
}

/**
 * Designs hoisted one above the other at the top of a staff at x. They hang from a vane on the staff:
 * turned round it, they fly the way the wind blows (userData.wind).
 */
function hijs(g, designs, ctx, x = 0) {
  staf(g, x, STAF);
  const vane = new THREE.Group(); vane.position.x = x; g.add(vane); ctx.vanes.push(vane);
  let y = STAF - 0.05;
  designs.forEach((o, i) => {
    const h = HOOGTE[o.vorm] ?? HOOGTE.vlag;
    const c = doek(o, h, ctx.waves, ctx.phase + i * 1.3); c.position.set(STAF_R + 0.005, y, 0); vane.add(c);
    y -= h + 0.12;
  });
}

/** A small open boat with someone standing in it; returns the point by the shoulder where the stick is held. */
function bootMetIemand(g) {
  g.add(box(3.2, 0.5, 1.3, M.romp, 0, 0.1, 0));
  const deck = 0.35; const x = -0.35;
  const legs = cylinder(0.11, 0.85, M.mens, deck + 0.425); legs.position.x = x; g.add(legs);
  const body = cylinder(0.17, 0.62, M.mens, deck + 1.16); body.position.x = x; g.add(body);
  const headM = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 10), M.huid); headM.position.set(x, deck + 1.62, 0); g.add(headM);
  return new THREE.Vector3(x + 0.3, deck + 1.38, 0.32);       // the hand, in front of the body: the flag passes clear of it
}

/** A stick held at `hand`, the cloth at its tip; returns the arm (turns round z) and the cloth's mount (turns round the stick). */
function stokMetVlag(g, hand, o, ctx) {
  const arm = new THREE.Group(); arm.position.copy(hand); g.add(arm);
  arm.add(cylinder(0.016, 1.25, M.stok, 0.5));
  const tip = new THREE.Group(); tip.position.y = 1.12; arm.add(tip);
  const c = doek(o, 0.48, ctx.waves, ctx.phase); c.position.x = 0.018; tip.add(c);
  return { arm, tip };
}

/** One entry as a model. userData.update(t, night) waves the cloth, swings what is swung, flashes a light. */
export function makeVlag(v) {
  const g = new THREE.Group(); g.name = v.id;
  const phase = ([...v.id].reduce((s, ch) => s + ch.charCodeAt(0), 0) * 0.37) % (2 * Math.PI);
  const ctx = { waves: [], anims: [], lamps: [], vanes: [], phase };
  let height = STAF + 0.2;
  if (v.vlaggen) {
    const designs = v.vlaggen.map((id) => BY_ID.get(id).ontwerp);
    if (v.naast) {                                 // each on its own staff, the row centred on the origin
      const step = Math.max(...designs.map((o) => (HOOGTE[o.vorm] ?? HOOGTE.vlag) * o.l)) + 0.5;
      designs.forEach((o, i) => hijs(g, [o], { ...ctx, phase: phase + i }, (i - (designs.length - 1) / 2) * step - step / 2 + 0.25));
    } else hijs(g, designs, ctx);
  } else {
    const o = v.ontwerp;
    switch (v.tafereel) {
      case 'heen-en-weer': {
        const { arm, tip } = stokMetVlag(g, bootMetIemand(g), o, ctx);
        const w = (2 * Math.PI) / 1.5;
        // the cloth trails the swing: it comes round the stick as the stick turns back
        ctx.anims.push((t) => { arm.rotation.z = 0.6 * Math.sin(w * t); tip.rotation.y = (Math.PI / 2) * (1 - Math.cos(w * t)); });
        height = 3.1;
        break;
      }
      case 'rond': {
        const { arm } = stokMetVlag(g, bootMetIemand(g), o, ctx);
        const w = (2 * Math.PI) / 1.8;
        ctx.anims.push((t) => { arm.rotation.z = w * t + phase; });       // anticlockwise, the cloth trailing on +x
        height = 3.2;
        break;
      }
      case 'bol': {
        staf(g, 0, STAF);
        const vane = new THREE.Group(); g.add(vane); ctx.vanes.push(vane);   // the flag and the ball under it go with the wind
        const h = 0.7; const c = doek(o, h, ctx.waves, phase); c.position.set(STAF_R + 0.005, STAF - 0.05, 0); vane.add(c);
        const r = 0.25; const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), M.bol);
        ball.position.set(STAF_R + r, STAF - 0.05 - h - 0.15 - r, 0); vane.add(ball);
        break;
      }
      case 'werktuig': {                           // a working pontoon, a yard on its mast, a board under each end
        g.add(box(5, 0.8, 2.4, M.ponton, 0, 0.2, -0.6));
        const top = 4.2; const mast = cylinder(0.05, top - 0.6, M.staf, 0.6 + (top - 0.6) / 2); g.add(mast);
        g.add(box(2.7, 0.06, 0.06, M.staf, 0, top - 0.2, 0));
        for (const [x, design] of [[-1.15, v.ook], [1.15, o]]) {
          const b = bord(design); b.position.set(x, top - 0.28 - b.userData.h / 2, 0.06); g.add(b);
        }
        height = top + 0.2;
        break;
      }
      case 'licht': {                              // the board on its staff, the light flashing in front of it
        staf(g, 0, STAF);
        const b = bord(o, 1.0); b.position.set(0, STAF - 0.5, 0.05); g.add(b);
        if (HAS_DOM) {
          const lamp = makeLamp('wit', 1.6, 3, { day: true }); lamp.position.set(0, STAF - 0.5, 0.12); g.add(lamp);
          ctx.lamps.push({ lamp, lit: character('Q') });
        }
        break;
      }
      default:
        if (o.vorm === 'bord') {                   // a board on a staff, centred on it
          staf(g, 0, STAF);
          const b = bord(o); b.position.set(0, STAF - b.userData.h / 2, 0.05); g.add(b);
        } else hijs(g, [o], ctx);
    }
  }
  g.userData = {
    height,
    // what flies from a staff turns to fly downwind: `down`, the way the wind blows, in this group's own frame
    // (a flag swung by hand, or a board, does not). Absent when there is nothing to turn.
    wind: ctx.vanes.length ? (down) => { const a = Math.atan2(-down.z, down.x); for (const v of ctx.vanes) v.rotation.y = a; } : undefined,
    update(t, night) {
      for (const wave of ctx.waves) wave(t);
      for (const anim of ctx.anims) anim(t);
      for (const { lamp, lit } of ctx.lamps) lamp.userData.set(lit(t), night);
    },
  };
  g.userData.update(0, 0);
  return g;
}

// ---------------------------------------------------------------- on the lelievlet herself
// What a lelievlet may fly herself: every flag and pennant of the Seinboek, the duikvlag, the noodsein N over C,
// and the noodsein of a flag with a ball under it. The racing signals are the committee's, the rest of the BPR
// is for other ships or for the shore.
const ZELF = new Set(['bpr-3.38-duiker', 'bva-NC-noodsein', 'bpr-3.30-vlag-bol']);
const SEINBOEK_SOORTEN = new Set(['letter', 'cijfer', 'vervanger', 'onderscheiding']);
export const aanBoord = (v) => SEINBOEK_SOORTEN.has(v.soort) || ZELF.has(v.id);
const KLEIN = 0.42;                                // a set of signal flags for a small boat: a flag 0.38 x 0.3 m

/**
 * The flags of `v` as they are hoisted on a line: their tops on it one below the other from y = 0 down, the
 * hoist on x = 0 and flying towards +x, no staff (the line is the want they are made fast to).
 * userData: { length, update(t) }.
 */
export function makeHijs(v) {
  const g = new THREE.Group(); g.name = `hijs:${v.id}`;
  const phase = ([...v.id].reduce((s, ch) => s + ch.charCodeAt(0), 0) * 0.37) % (2 * Math.PI);
  const waves = [];
  const designs = v.vlaggen ? v.vlaggen.map((id) => BY_ID.get(id).ontwerp) : [v.ontwerp];
  let y = 0;
  designs.forEach((o, i) => {
    const h = (HOOGTE[o.vorm] ?? HOOGTE.vlag) * KLEIN;
    const c = doek(o, h, waves, phase + i * 1.3); c.position.set(0.004, y, 0); g.add(c);
    y -= h + 0.05;
  });
  if (v.tafereel === 'bol') {                      // the ball under the flag
    const r = 0.12; const ball = new THREE.Mesh(new THREE.SphereGeometry(r, 20, 14), M.bol);
    ball.position.set(r + 0.01, y - 0.04 - r, 0); g.add(ball); y -= 0.08 + 2 * r;
  }
  g.userData = { length: -y, update: (t) => { for (const wave of waves) wave(t); } };
  g.userData.update(0);
  return g;
}
