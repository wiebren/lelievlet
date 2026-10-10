// Bekende groepen: the colours of the lelievletten of scouting groups, as their members reported them (Aanpassen ›
// Bekend › Melden) and they were checked. Each entry:
//
//   groep, plaats           the group and where it is
//   kleuren                 the paint per zone of customize.js (romp, berghout, boeisel, dolboord, voordek,
//                           achterdek, kuip, zwaardkast); a zone left out keeps the viewer's own colour
//   bakskleur, zeilkleur    as in customize.js (zeilkleur 0-100); left out: the viewer's own
//   naamKleur, plaatsKleur  the lettering on the hull; left out: black
//   boten                   [{ zeilnummer, naam, bakskleur }]; a boat's bakskleur, when she has one, is hers
//                           instead of the group's
//
// Picked in Bekend, a group gives its colours and its plaats; one of its boats also its zeilnummer, naam and
// bakskleur.
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
    ],
  },
];
