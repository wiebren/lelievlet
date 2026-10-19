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
//   spiegelTekst            a word on the spiegel, to bakboord of the roer, in the naamKleur (the group's name)
//   boten                   [{ zeilnummer, naam, bakskleur, boeiselBanen }]; a boat's bakskleur, when she has one, is
//                           hers instead of the group's; naam '' when the group did not give it
//   boeiselBanen            the boeisel in lengthwise bands of these colours, top first (a flag on the sides), for
//                           the group or one boat: boeiselBanen: VLAG
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
      { zeilnummer: '83', naam: 'Leien', bakskleur: '#308264' },
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
      { zeilnummer: '1314', naam: 'Wabhoop' },
      { zeilnummer: '1385', naam: '' },
    ],
  },
];
