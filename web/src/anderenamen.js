// Other names a part goes by in the lesson material, with the sources that use them (keys as in
// reference/parts/SOURCES.md and CWO_NIVEAUS.md). Only names the sources give; the name the viewer and
// the quiz use is the part's own. docs/onderdelen.md lists them, and the Onderdelen search finds a part
// by them too.
export const ANDERE_NAMEN = {
  dolboord_bb: 'boordrand [OZS102], stootrand [WIL88, ARG]', dolboord_sb: 'boordrand [OZS102], stootrand [WIL88, ARG]',
  vlak_bb: 'bodem [ARG]', vlak_sb: 'bodem [ARG]',
  spanten: 'wrang ≡ denningsteun [VDM8]',
  buikdenning: 'buikdenning [VDM8, KATR], denning [KB3L, ARG]',
  roerkop: 'helmhoutbeslag',
  zwaard: 'midzwaard [VDM8, KATR], zwaardblad',
  kraanlijn: 'dirk [KATZ, KB3L]',
  windvaan: 'vaantje [KATZ]',
  zwaardloper_boven: 'zwaardval [ARG, HBO]', zwaardloper_onder: 'zwaardval [ARG, HBO]',
  grendelbout: 'mastgrendel, borgbout',
  klauw: 'gaffelklauw',
  lummelbeslag: 'lummelhouder, lummelbout [in de lesstof vaak: KATZ, MTX, SNEEK, PRAET]',
  hommerring: 'mastring [VDM8 en OZS102 onderscheiden mastring, topmastring en hommerring]',
  want_bb: 'want [KATZ, ARG]', want_sb: 'want [KATZ, ARG]',
  wantketting_bb: 'wantspanner [SNEEK, ARG], talreep', wantketting_sb: 'wantspanner [SNEEK, ARG], talreep',
  voorstagspanner: 'spanner met klep, klephaak',
  pelikaanhaak_ring: 'ring van de klephaak',
  piekenval: 'piekeval [KB3L], nokeval',
  fokkenval: 'fokkeval [KB3L]',
  fokkenschoot: 'fokkeschoot [KB3L]',
  gaffeldraad: 'spruit [MTX, SNEEK, KB3L]',
  hanepootloper: 'spruitloper [MTX, SNEEK]',
  dodemanseind: 'dodemanslijn, spruitloperborglijn [SNEEK], dodemanslijntje [PRAET]',
  schootring: 'hoefijzer [KATZ, MTX], grootschootring [KB3L]',
  grootzeil_tophoek: 'nokhoek [MTX, SNEEK, WIL88], piek',
  fok_halshoek: 'halsbroek [VDM8, KATZ, WIL88]',
  kettinkje_fok: 'fokkekettinkje',
  leuvers: 'leuvertje',
  leiogen_bb: 'leioog fokkeschoot', leiogen_sb: 'leioog fokkeschoot',
  riem_bb: 'roeiriem', riem_sb: 'roeiriem',
  voorplecht: 'plecht',
};

/** The other names of a part on their own, for searching: no sources, no explanations. */
export const zoeknamen = (id) => (ANDERE_NAMEN[id] ?? '')
  .replace(/\[[^\]]*\]|\([^)]*\)/g, '')
  .split(/[,;≡]/).map((n) => n.trim()).filter(Boolean);
