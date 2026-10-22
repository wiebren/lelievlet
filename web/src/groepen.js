// Bekende groepen: the colours of the lelievletten of scouting groups, as their members reported them (Aanpassen ›
// Bekend › Melden) and they were checked. Each entry:
//
//   groep, plaats           the group and where it is, the place written out (Rotterdam)
//   plaatsOpBoot            the plaats as it is lettered on the hull, when that differs (R-dam); '': none on the
//                           hull; left out: plaats
//   plaatsIsNummer          true: where others letter the plaats, each boat has her own zeilnummer
//   kleuren                 the paint per zone of customize.js (romp, berghout, boeisel, dolboord, voordek,
//                           achterdek, kuip, zwaardkast); a zone left out keeps the viewer's own colour
//   bakskleur, zeilkleur    as in customize.js (zeilkleur 0-100); left out: the viewer's own
//   naamKleur, plaatsKleur  the lettering on the hull; left out: black
//   rompnummer              true: the zeilnummer midships on the boeisel as well, in the naamKleur. Not in
//                           Eigen: groups that letter it there have it from here
//   naamBordje              true: the naam on a wooden board on the boeisel, smaller, in the naamKleur
//   plechtKleur             the voorplecht and the hanenkam in this colour, not the bakskleur (as a rule the dolboord's)
//   roerKleur               the whole roer in this colour, the roerkop too (left out: the romp's, the roerkop the bakskleur)
//   spiegelKleur            the outside of the spiegel in this colour (left out: the romp's)
//   spiegelTekst            lettering on the spiegel, to bakboord of the roer, a line or two ('\n' between them): the
//                           group's name, or the group and its plaats
//   spiegelTekstKleur       the colour of that lettering (left out: the naamKleur)
//   spiegelBand             the spiegel above the berghout in this colour, a band like the boeisel, for the group or
//                           one boat
//   spiegelPunt             true: that band runs on down the middle of the spiegel to a point, three quarters of the
//                           way down; for the group or one boat
//   boten                   [{ zeilnummer, naam, bakskleur, boeiselBanen, spiegelBand, spiegelPunt }]; a boat's
//                           bakskleur, when she has one, is hers instead of the group's; naam '' when the group did
//                           not give it
//   boeiselBanen            the boeisel in lengthwise bands of these colours, top first (a flag on the sides), for
//                           the group or one boat: boeiselBanen: VLAG
//   boeiselVoor             true: the fore half of the boeisel in the bakskleur, the aft half in the boeisel's own
//
// Picked in Bekend, a group gives its colours and its plaats on the hull; one of its boats also its zeilnummer,
// naam and bakskleur. Found by either plaats.
// the Dutch flag, as some boats have it on the boeisel
const VLAG = ['#ae1c28', '#ffffff', '#21468b'];

export const GROEPEN = [
  {
    groep: 'Zwolsche Zeeverkenners', plaats: 'Zwolle',
    kleuren: {
      romp: '#0a0a0b', berghout: '#0a0a0b', boeisel: '#f5c20d', dolboord: '#0a0a0b',
      voordek: '#8f9499', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
    },
    zeilkleur: 10,
    boten: [
      { zeilnummer: '440', naam: 'Fluessen', bakskleur: '#c8102e' },
      { zeilnummer: '441', naam: 'Morra', bakskleur: '#00843d' },
      { zeilnummer: '442', naam: 'Potten', bakskleur: '#f5c20d' },
      { zeilnummer: '884', naam: 'Brekken', bakskleur: '#0b4ea2' },
      { zeilnummer: '83', naam: 'Leijen', bakskleur: '#308264', spiegelBand: '#f5c20d', spiegelPunt: true },
    ],
  },
  {
    groep: 'Tasmania', plaats: 'Rotterdam', plaatsOpBoot: 'R-dam',
    kleuren: {
      romp: '#bdbdbd', berghout: '#ff0000', boeisel: '#0c0182', dolboord: '#ff0000',
      voordek: '#8f9499', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
    },
    zeilkleur: 0,
    naamKleur: '#ffff00', plaatsKleur: '#ffff00', rompnummer: true,
    boten: [
      { zeilnummer: '124', naam: 'Heemskerck', bakskleur: '#c8102e' },
    ],
  },
  {
    groep: 'Tjarda', plaats: 'Hillegom', plaatsIsNummer: true,
    kleuren: {
      romp: '#0000ff', berghout: '#0000ff', boeisel: '#0000ff', dolboord: '#ffff00',
      voordek: '#0000ff', achterdek: '#0000ff', kuip: '#0000ff', zwaardkast: '#0000ff',
    },
    zeilkleur: 100,
    naamKleur: '#ffff00', plaatsKleur: '#ffff00', plechtKleur: '#ffff00', spiegelTekst: 'Tjarda',
    boten: [
      { zeilnummer: '1436', naam: 'Bandung', bakskleur: '#ff9500' },
      { zeilnummer: '545', naam: 'Jakarta', bakskleur: '#ffffff' },
      { zeilnummer: '668', naam: 'Semaranh', bakskleur: '#ffff00' },
      { zeilnummer: '670', naam: 'Sukabumi', bakskleur: '#096b00' },
      { zeilnummer: '671', naam: 'Semarang', bakskleur: '#ff0000' },
      { zeilnummer: '1759', naam: 'Banyuwangi', bakskleur: '#ff00ff' },
    ],
  },
  {
    groep: 'Klaas Toxopeus', plaats: 'Kortenhoef', plaatsOpBoot: '',
    kleuren: {
      romp: '#0a0a0b', berghout: '#ffffff', boeisel: '#0011ff', dolboord: '#ffffff',
      voordek: '#000000', achterdek: '#000000', kuip: '#ededed', zwaardkast: '#ededed',
    },
    bakskleur: '#ffffff', zeilkleur: 10,
    naamKleur: '#ffffff', plaatsKleur: '#ffffff', naamBordje: true,
    boten: [
      { zeilnummer: '674', naam: 'Quartair', bakskleur: '#fff700' },
      { zeilnummer: '305', naam: '', bakskleur: '#ff0000' },
      { zeilnummer: '564', naam: '', bakskleur: '#0008ff' },
      { zeilnummer: '421', naam: '', bakskleur: '#00ff33' },
      { zeilnummer: '902', naam: '', bakskleur: '#00ffaa' },
      { zeilnummer: '903', naam: '', bakskleur: '#00fffb', boeiselBanen: VLAG },
    ],
  },
  {
    groep: 'Hubertus-Brandaan', plaats: 'Leidschendam-Voorburg', plaatsOpBoot: '',
    kleuren: {
      romp: '#ffffff', berghout: '#ae1c28', boeisel: '#ffffff', dolboord: '#ae1c28',
      voordek: '#8f9499', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
    },
    zeilkleur: 10,
    plechtKleur: '#ae1c28', roerKleur: '#21468b', boeiselBanen: VLAG,
    boten: [
      { zeilnummer: '1037', naam: '', bakskleur: '#ffd500' },
      { zeilnummer: '1055', naam: '', bakskleur: '#1a2f6e' },
      { zeilnummer: '1101', naam: '', bakskleur: '#c8102e' },
      { zeilnummer: '1379', naam: '', bakskleur: '#b9a3e3' },
      { zeilnummer: '1689', naam: '', bakskleur: '#76bb40' },
    ],
  },
  {
    groep: 'Fivelgroep', plaats: 'Delfzijl', plaatsOpBoot: '',
    kleuren: {
      romp: '#263e0f', berghout: '#ffffff', boeisel: '#ff6a00', dolboord: '#ffffff',
      voordek: '#8f9499', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
    },
    bakskleur: '#c8102e', zeilkleur: 10,
    boten: [
      { zeilnummer: '950', naam: 'Fivel' },
    ],
  },
  {
    groep: 'Henk Brunt', plaats: 'Kampen', plaatsOpBoot: '',
    kleuren: {
      romp: '#0000ff', berghout: '#0000ff', boeisel: '#ffffff', dolboord: '#0000ff',
      voordek: '#8f9499', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
    },
    bakskleur: '#0000ff', zeilkleur: 10,
    boten: [
      { zeilnummer: '90', naam: '' },
      { zeilnummer: '91', naam: '' },
      { zeilnummer: '1362', naam: '' },
      { zeilnummer: '1314', naam: 'Wanhoop' },
      { zeilnummer: '1385', naam: '' },
    ],
  },
  {
    groep: 'Tjerk Hiddes', plaats: 'Harderwijk', plaatsOpBoot: '',
    kleuren: {
      romp: '#280f73', berghout: '#ffffff', boeisel: '#ff0000', dolboord: '#ffffff',
      voordek: '#b5b5b5', achterdek: '#bdbdbd', kuip: '#b8b8b8', zwaardkast: '#b8b8b8',
    },
    zeilkleur: 10,
    naamKleur: '#ffffff', plaatsKleur: '#ffffff',
    spiegelKleur: '#ffffff', spiegelTekst: 'Tjerk Hiddes\nHarderwijk', spiegelTekstKleur: '#280f73',
    boten: [
      { zeilnummer: '114', naam: '', bakskleur: '#ffffff' },
      { zeilnummer: '276', naam: '', bakskleur: '#000000' },
      { zeilnummer: '583', naam: '', bakskleur: '#0000ff' },
      { zeilnummer: '602', naam: '', bakskleur: '#ffff00' },
      { zeilnummer: '1736', naam: '', bakskleur: '#00ff00' },
      { zeilnummer: '1808', naam: '', bakskleur: '#ff0000' },
    ],
  },
  {
    groep: 'Pieter Marits', plaats: 'Zwartsluis',
    kleuren: {
      romp: '#540000', berghout: '#ffd5b8', boeisel: '#5e0000', dolboord: '#ffe5cc',
      voordek: '#8f9499', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
    },
    zeilkleur: 10,
    naamKleur: '#ffffff', plaatsKleur: '#ffffff',
    spiegelBand: '#ffd5b8', spiegelTekst: 'Zwartsluis', spiegelTekstKleur: '#5e0000',
    boten: [
      { zeilnummer: '611', naam: 'Orca', bakskleur: '#008234' },
      { zeilnummer: '916', naam: 'Black-lock', bakskleur: '#ffbfbf' },
      { zeilnummer: '1108', naam: 'Zeemeeuw', bakskleur: '#000782' },
    ],
  },
  {
    groep: 'Christofoor', plaats: 'Zwolle', plaatsOpBoot: '',
    kleuren: {
      romp: '#9c9c9c', berghout: '#110073', boeisel: '#090085', dolboord: '#070091',
      voordek: '#8f9499', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
    },
    bakskleur: '#43009c', zeilkleur: 10,
    boten: [
      { zeilnummer: '1825', naam: '' },
      { zeilnummer: '1724', naam: '' },
      { zeilnummer: '88', naam: '' },
      { zeilnummer: '1433', naam: '' },
    ],
  },
  {
    groep: 'Scouting Meppel', plaats: 'Meppel',
    kleuren: {
      romp: '#0a0a0b', berghout: '#e32400', boeisel: '#4f7a28', dolboord: '#e32400',
      voordek: '#c0c0c0', achterdek: '#c0c0c0', kuip: '#c0c0c0', zwaardkast: '#c0c0c0',
    },
    zeilkleur: 0,
    spiegelKleur: '#ffffff', spiegelTekst: 'Scouting Meppel',
    boten: [
      { zeilnummer: '2010', naam: 'JubJam', bakskleur: '#e32400' },
      { zeilnummer: '923', naam: 'Roggemoer', bakskleur: '#ffffff' },
      { zeilnummer: '1493', naam: 'De 3 Schakels', bakskleur: '#919191' },
      { zeilnummer: '215', naam: 'Wiebie', bakskleur: '#669c35' },
    ],
  },
  {
    groep: 'Olivier van Noort groep II', plaats: 'Schoonhoven',
    kleuren: {
      romp: '#1f5aa8', berghout: '#0a0a0b', boeisel: '#ffffff', dolboord: '#0a0a0b',
      voordek: '#000000', achterdek: '#8f9499', kuip: '#8f9499', zwaardkast: '#8f9499',
    },
    zeilkleur: 0,
    naamKleur: '#ffffff', boeiselVoor: true, spiegelTekst: 'Olivier van Noort II',
    boten: [
      { zeilnummer: '9', naam: 'Odysseus', bakskleur: '#f570ff' },
      { zeilnummer: '779', naam: 'Seapaerd', bakskleur: '#c8102e' },
      { zeilnummer: '154', naam: 'Nautilus', bakskleur: '#050505' },
      { zeilnummer: '153', naam: 'Hendrik Frederik', bakskleur: '#fff700' },
      { zeilnummer: '200', naam: 'Hector', bakskleur: '#a1a1a1' },
      { zeilnummer: '911', naam: 'Mauritius', bakskleur: '#ff7605' },
      { zeilnummer: '892', naam: 'Eendracht', bakskleur: '#3ba800' },
    ],
  },
];
