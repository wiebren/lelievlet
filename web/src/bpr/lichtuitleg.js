// The lights and dagmerken of other ships explained, one entry for every configuration of schepen.js
// (and of reference/bpr/lichten.json), in the order of CONFIGS. The content is our own plain Dutch for
// scouts of 12 to 16, after the BPR text in force from 2026-06-17 (hoofdstuk 3, 6.04a, 10.03, 10.04; local copy
// reference/bpr/BPR_2026-06-17.txt) and the notes in reference/bpr/LICHTEN.md. `lichten`: what you see
// at night; `dagmerk`: by day (absent when there is nothing); `betekenis`: what it tells you; `lelievlet`:
// what you do in a lelievlet, and for the lelievlet_* entries `betekenis` says what the lelievlet itself
// must carry.

export const LICHT_GROEPEN = ['Grote schepen', 'Kleine schepen', 'Slepen, duwen en koppelen', 'Veerponten', 'Stilliggend', 'Werk en hinder', 'Bijzondere schepen', 'De lelievlet'];

// the rule for meeting a groot schip, said the same way everywhere (BPR 6.04 lid 2, 3; 6.17 lid 2, 3)
const GROOT = 'tenzij jij aan de stuurboordkant van het vaarwater vaart en het grote schip niet';

export const LICHT_UITLEG = {
  // -- grote schepen
  groot_motorschip: {
    naam: 'Groot motorschip', groep: 'Grote schepen', artikel: 'BPR 3.08 lid 1',
    lichten: 'Een wit toplicht hoog op het voorschip, een groen boordlicht aan stuurboord, een rood aan bakboord en een wit heklicht.',
    betekenis: 'Een vrachtschip of ander motorschip van 20 m of langer dat vaart. Zie je groen en rood tegelijk, dan komt het recht op je af.',
    lelievlet: `Het grote schip gaat voor, ${GROOT}. Blijf hoe dan ook ruim uit de buurt.`,
  },
  groot_motorschip_tweede_toplicht: {
    naam: 'Groot motorschip met twee toplichten', groep: 'Grote schepen', artikel: 'BPR 3.08 lid 2',
    lichten: 'De lichten van een groot motorschip, met een tweede wit toplicht op het achterschip, hoger dan het voorste.',
    betekenis: 'Dat tweede toplicht mag, het hoeft niet. Staan de twee witte lichten recht boven elkaar, dan komt het schip recht op je af.',
    lelievlet: `Het grote schip gaat voor, ${GROOT}.`,
  },
  snel_schip: {
    naam: 'Snel schip', groep: 'Grote schepen', artikel: 'BPR 3.08 lid 4',
    lichten: 'De lichten van een groot motorschip, en daarbij twee gele lichten boven elkaar die snel flikkeren.',
    dagmerk: 'Ook overdag flikkeren de twee gele lichten.',
    betekenis: 'Een groot motorschip dat sneller kan dan 40 km per uur, zoals een snelle veerboot. Het moet voorrang geven aan alle andere schepen.',
    lelievlet: 'Het snelle schip moet jou ontwijken, maar het is snel dichtbij en maakt hoge golven. Houd je koers en vaar voorspelbaar.',
  },
  groot_zeil_en_motor: {
    naam: 'Groot zeilschip dat ook motort', groep: 'Grote schepen', artikel: 'BPR 3.08 lid 5',
    lichten: 'Dezelfde lichten als een groot motorschip: een wit toplicht, een groen en een rood boordlicht en een wit heklicht.',
    dagmerk: 'Een zwarte kegel met de punt omlaag, zo hoog mogelijk waar hij goed te zien is.',
    betekenis: 'Een groot zeilschip met de motor bij is volgens de wet een motorschip. Daarom voert het de lichten van een motorschip.',
    lelievlet: `Het is een groot schip: het gaat voor, ${GROOT}.`,
  },
  groot_zeilschip: {
    naam: 'Groot zeilschip', groep: 'Grote schepen', artikel: 'BPR 3.12',
    lichten: 'Hoog in de mast een rood licht boven een groen licht, rondom zichtbaar. Lager een groen en een rood boordlicht, en een wit heklicht.',
    betekenis: 'Een zeilschip van 20 m of langer, zoals een schip van de bruine vloot. Een zeilschip voert nooit een wit toplicht.',
    lelievlet: `Het is een groot schip: het gaat voor, ${GROOT}.`,
  },
  passagiersschip_klein: {
    naam: 'Passagiersschip korter dan 20 m', groep: 'Grote schepen', artikel: 'BPR 3.15',
    lichten: 'De lichten van een groot motorschip: een wit toplicht, een groen en een rood boordlicht en een wit heklicht.',
    dagmerk: 'Een gele ruit, van alle kanten te zien.',
    betekenis: 'Een rondvaartboot of watertaxi die meer dan 12 passagiers mag meenemen. Ook al is hij korter dan 20 m, hij telt als groot schip.',
    lelievlet: `Behandel hem als een groot schip: hij gaat voor, ${GROOT}.`,
  },

  // -- kleine schepen
  klein_motorschip_a: {
    naam: 'Klein motorschip', groep: 'Kleine schepen', artikel: 'BPR 3.13 lid 1',
    lichten: 'Een wit toplicht voorop, even hoog als het groene en het rode boordlicht erachter, en een wit heklicht.',
    betekenis: 'Een motorboot korter dan 20 m. Het toplicht staat minstens 1 m vóór de boordlichten.',
    lelievlet: 'Een klein motorschip moet jou voorrang geven als je zeilt of roeit. Dat geldt niet als hij aan de stuurboordkant van het vaarwater vaart en jij niet.',
  },
  klein_motorschip_b: {
    naam: 'Klein motorschip, toplicht hoger', groep: 'Kleine schepen', artikel: 'BPR 3.13 lid 1',
    lichten: 'Een wit toplicht minstens 1 m boven de boordlichten, groen en rood mogen samen in één lantaarn op de boeg, en een wit heklicht.',
    betekenis: 'Een motorboot korter dan 20 m, zoals een sloep of speedboot. Van achteren zie je alleen het witte heklicht.',
    lelievlet: 'Een klein motorschip moet jou voorrang geven als je zeilt of roeit. Dat geldt niet als hij aan de stuurboordkant van het vaarwater vaart en jij niet.',
  },
  klein_motorschip_rondom: {
    naam: 'Klein motorschip met wit rondom licht', groep: 'Kleine schepen', artikel: 'BPR 3.13 lid 1',
    lichten: 'Een wit licht dat rondom schijnt, en een groen en een rood boordlicht, vaak samen in één lantaarn op de boeg.',
    betekenis: 'Een motorboot korter dan 20 m mag één wit rondom licht voeren in plaats van toplicht en heklicht. Zo zie je het vaak op sloepen en speedboten.',
    lelievlet: 'Een klein motorschip moet jou voorrang geven als je zeilt of roeit. Dat geldt niet als hij aan de stuurboordkant van het vaarwater vaart en jij niet.',
  },
  klein_open_motorschip_lt7m: {
    naam: 'Open motorbootje korter dan 7 m', groep: 'Kleine schepen', artikel: 'BPR 3.13 lid 2',
    lichten: 'Alleen één wit licht dat rondom schijnt.',
    betekenis: 'Een open bootje korter dan 7 m dat niet sneller kan dan 13 km per uur. ’s Nachts zie je het verschil niet met een roeiboot of klein zeilbootje.',
    lelievlet: 'Bij één wit licht weet je niet wat het is of waar het heen gaat. Houd afstand en laat zelf goed zien waar je bent.',
  },
  klein_zeilschip_boeg_hek: {
    naam: 'Klein zeilschip met boord- en heklicht', groep: 'Kleine schepen', artikel: 'BPR 3.13 lid 5',
    lichten: 'Een groen en een rood boordlicht op de boeg, naast elkaar of in één lantaarn, en een wit heklicht achterop.',
    betekenis: 'Een zeilboot korter dan 20 m. Een zeilschip voert geen toplicht: zie je geen wit licht boven groen of rood, dan kan het een zeilboot zijn.',
    lelievlet: 'Zeil je allebei, dan wijkt wie over stuurboordboeg zeilt; op dezelfde boeg wijkt wie loefwaarts vaart. Eerst telt wel wie aan de stuurboordkant van het vaarwater vaart.',
  },
  klein_zeilschip_driekleur: {
    naam: 'Klein zeilschip met driekleurenlantaarn', groep: 'Kleine schepen', artikel: 'BPR 3.13 lid 5',
    lichten: 'Eén lantaarn in de top van de mast: groen naar stuurboord, rood naar bakboord en wit naar achteren.',
    betekenis: 'Een zeilboot korter dan 20 m mag boordlichten en heklicht samen in één lantaarn in de top voeren. Zo’n licht hoog in de mast zie je van ver.',
    lelievlet: 'Zeil je allebei, dan wijkt wie over stuurboordboeg zeilt; op dezelfde boeg wijkt wie loefwaarts vaart. Eerst telt wel wie aan de stuurboordkant van het vaarwater vaart.',
  },
  klein_zeilschip_lt7m: {
    naam: 'Klein zeilschip korter dan 7 m', groep: 'Kleine schepen', artikel: 'BPR 3.13 lid 5',
    lichten: 'Eén wit licht dat rondom schijnt, zo hoog dat je het van alle kanten ziet. Dreigt er een aanvaring, dan komt er een tweede wit licht bij.',
    betekenis: 'Een zeilbootje korter dan 7 m mag dit voeren in plaats van boord- en heklicht. Het tweede licht, vaak een zaklamp, is om de aandacht te trekken.',
    lelievlet: 'Een lelievlet is 5,6 m lang en mag dus ook zo varen.',
  },
  klein_schip_spierkracht: {
    naam: 'Roeiboot of kano', groep: 'Kleine schepen', artikel: 'BPR 3.13 lid 6',
    lichten: 'Eén wit licht dat rondom schijnt.',
    betekenis: 'Een klein schip dat door spierkracht vaart: roeien, peddelen of wrikken. Waar het licht moet zitten, zegt de wet niet.',
    lelievlet: 'Zeil jij, dan geeft een roeiboot jou voorrang. Dat geldt niet als hij aan de stuurboordkant van het vaarwater vaart en jij niet.',
  },
  klein_zeil_en_motor: {
    naam: 'Klein zeilschip dat ook motort', groep: 'Kleine schepen', artikel: 'BPR 3.13 lid 7',
    lichten: 'De lichten van een klein motorschip: een wit toplicht, een groen en een rood boordlicht en een wit heklicht.',
    dagmerk: 'Een zwarte kegel met de punt omlaag, zo hoog mogelijk waar hij goed te zien is.',
    betekenis: 'Een zeilboot met de motor bij is volgens de wet een motorschip. Hij heeft dus niet de voorrang van een zeilschip.',
    lelievlet: 'Hij moet jou voorrang geven als jij zeilt of roeit. Dat geldt niet als hij aan de stuurboordkant van het vaarwater vaart en jij niet.',
  },

  // -- slepen, duwen en koppelen
  sleepboot: {
    naam: 'Sleepboot met een sleep', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.09 lid 1',
    lichten: 'Op de sleepboot twee witte toplichten boven elkaar, boordlichten en een geel heklicht. Op het gesleepte schip een wit rondom licht en een wit heklicht.',
    dagmerk: 'Op de sleepboot een gele cilinder met zwarte en witte banden; op het gesleepte schip een gele bol.',
    betekenis: 'Een sleepboot trekt een of meer grote schepen aan een lange tros. Het gele heklicht schijnt naar achteren, naar de schepen die hij sleept.',
    lelievlet: 'Vaar nooit tussen de sleepboot en de gesleepte schepen door: de tros zie je ’s nachts niet.',
  },
  sleepboten_niet_in_kiellinie: {
    naam: 'Twee sleepboten naast elkaar', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.09 lid 2',
    lichten: 'Elke sleepboot voert drie witte toplichten boven elkaar, een groen en een rood boordlicht en een geel heklicht.',
    dagmerk: 'Elke sleepboot een gele cilinder met zwarte en witte banden; het gesleepte schip een gele bol.',
    betekenis: 'Slepen meer sleepboten samen, maar niet achter elkaar, dan voert elk drie toplichten in plaats van twee. Dat geldt ook als ze samen een schip helpen.',
    lelievlet: 'Blijf ver weg, en vaar nooit tussen de sleepboten en het gesleepte schip door.',
  },
  gesleept_groot_schip: {
    naam: 'Gesleept groot schip', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.09 lid 3',
    lichten: 'Een wit rondom licht, hoog op het schip. Een lengte van meer dan 110 m voert er twee: één voorop en één achterop.',
    dagmerk: 'Een gele bol, van alle kanten te zien.',
    betekenis: 'Een groot schip in een sleep dat niet zelf sleept. Liggen er meer dan twee schepen naast elkaar, dan voeren alleen de buitenste het licht.',
    lelievlet: 'Vaar nooit tussen de schepen van een sleep door. De trossen zie je ’s nachts niet.',
  },
  laatste_lengte_sleep: {
    naam: 'Laatste lengte van een sleep', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.09 lid 4',
    lichten: 'Net als de andere gesleepte schepen een wit rondom licht, en daarbij een wit heklicht.',
    dagmerk: 'Een gele bol, net als de andere gesleepte schepen.',
    betekenis: 'Het witte heklicht laat zien waar de sleep ophoudt. Liggen er achteraan meer dan twee schepen naast elkaar, dan voeren alleen de buitenste deze lichten.',
    lelievlet: 'Moet je de sleep kruisen, ga dan pas achter het witte heklicht van de laatste lengte langs.',
  },
  groot_motorschip_geassisteerd: {
    naam: 'Groot motorschip met een helpende sleepboot', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.08 lid 3',
    lichten: 'Het schip voert de lichten van een groot motorschip. De sleepboot die helpt voert twee witte toplichten boven elkaar en een geel heklicht.',
    dagmerk: 'Een gele bol op het voorschip, minstens 5 m hoog; op de sleepboot een gele cilinder met banden.',
    betekenis: 'Een groot motorschip dat door een sleepboot wordt geholpen, bijvoorbeeld bij het draaien. Een zeegaand schip hoeft de gele bol niet te voeren.',
    lelievlet: 'Blijf weg van het schip en de sleepboot, en vaar niet tussen hen door: daar kan een tros lopen.',
  },
  duwstel: {
    naam: 'Duwstel', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.10 lid 1',
    lichten: 'Voorop drie witte toplichten in een driehoek, een wit toplicht op de bak ernaast, boordlichten en drie witte heklichten naast elkaar.',
    betekenis: 'Een duwboot die een of meer duwbakken voor zich uit duwt. Zo’n duwstel is lang en zwaar, en kan maar langzaam stoppen of uitwijken.',
    lelievlet: 'Vlak voor een duwstel ziet de schipper je niet. Blijf ver weg en kruis nooit vlak voor de kop.',
  },
  duwstel_klein: {
    naam: 'Kort duwstel', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.10 lid 4',
    lichten: 'Dezelfde lichten als een groot motorschip: één wit toplicht, een groen en een rood boordlicht en een wit heklicht.',
    betekenis: 'Een duwstel van hoogstens 110 m lang en 12 m breed telt als één motorschip. Het voert dus geen driehoek van toplichten.',
    lelievlet: `Behandel het als een groot motorschip: het gaat voor, ${GROOT}.`,
  },
  duwstel_geassisteerd: {
    naam: 'Duwstel met een helpende sleepboot', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.10 lid 2',
    lichten: 'De lichten van een duwstel, maar de drie heklichten op de duwboot zijn geel. De sleepboot die helpt voert twee witte toplichten en een geel heklicht.',
    dagmerk: 'Een gele bol op de duwboot, minstens 5 m hoog.',
    betekenis: 'Een duwstel dat door een ander motorschip wordt geholpen. Van achteren zie je dat aan de gele heklichten.',
    lelievlet: 'Blijf ver weg van het duwstel en de sleepboot, en vaar nooit tussen hen door.',
  },
  duwstel_twee_duwboten: {
    naam: 'Duwstel met twee duwboten', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.10 lid 3',
    lichten: 'Voorop de lichten van een duwstel: drie witte toplichten in een driehoek. Achterop drie witte heklichten naast elkaar op de duwboot aan stuurboord, en één wit heklicht op de andere.',
    betekenis: 'Een duwstel dat door twee duwboten naast elkaar wordt geduwd. Van achteren zie je dat aan het losse vierde heklicht.',
    lelievlet: 'Zo’n duwstel is groot en breed, en kan maar langzaam stoppen of uitwijken. Blijf ver weg en kruis nooit vlak voor de kop.',
  },
  gekoppeld_samenstel: {
    naam: 'Gekoppeld samenstel', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.11 lid 1',
    lichten: 'Op elk schip een wit toplicht, dus twee naast elkaar; groen en rood alleen aan de buitenkanten; en op elk schip een wit heklicht.',
    betekenis: 'Grote schepen die langszij aan elkaar vastzitten en samen varen. Een schip dat geen motorschip is, mag in plaats van het toplicht een wit rondom licht voeren.',
    lelievlet: `Het is breed en groot: het gaat voor, ${GROOT}.`,
  },
  gekoppeld_samenstel_geassisteerd: {
    naam: 'Gekoppeld samenstel met een helpende sleepboot', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.11 lid 2',
    lichten: 'De lichten van een gekoppeld samenstel: twee witte toplichten naast elkaar, boordlichten aan de buitenkanten en twee heklichten. De sleepboot die helpt voert twee witte toplichten boven elkaar en een geel heklicht.',
    dagmerk: 'Een gele bol voorop, minstens 5 m hoog; op de sleepboot een gele cilinder met banden.',
    betekenis: 'Grote schepen die langszij aan elkaar vastzitten en door een sleepboot worden geholpen.',
    lelievlet: 'Blijf weg van het samenstel en de sleepboot, en vaar niet tussen hen door: daar loopt een tros.',
  },
  klein_motorschip_sleept_klein: {
    naam: 'Volgboot met vletten op sleeptouw', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.13 lid 3',
    lichten: 'De volgboot voert de gewone lichten van een klein motorschip. Elke gesleepte vlet voert een wit rondom licht.',
    betekenis: 'Een klein motorschip dat alleen kleine schepen sleept, voert geen sleeplichten zoals een grote sleepboot. Je ziet een gewone motorboot met witte lichtjes erachter.',
    lelievlet: 'Vaar nooit tussen de volgboot en de vletten door: daar loopt de lijn.',
  },
  klein_schip_gesleept: {
    naam: 'Klein schip langszij meegevoerd', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.13 lid 4',
    lichten: 'Het meegevoerde bootje voert een wit rondom licht; de motorboot ernaast voert zijn gewone lichten.',
    betekenis: 'Een klein schip dat wordt gesleept of langszij vastgemaakt meevaart, voert een wit rondom licht. De bijboot van een schip hoeft dat niet.',
    lelievlet: 'Dit geldt ook voor jouw lelievlet als die wordt gesleept of langszij wordt meegenomen.',
  },
  drijvend_voorwerp_varend: {
    naam: 'Drijvend voorwerp op sleeptouw', groep: 'Slepen, duwen en koppelen', artikel: 'BPR 3.19',
    lichten: 'Witte rondom lichten op de hoeken, zodat je ziet hoe groot het is. Hier trekt een sleepboot met zijn eigen lichten het voort.',
    dagmerk: 'Op de sleepboot een gele cilinder met zwarte en witte banden.',
    betekenis: 'Een drijvend ding dat geen schip is, zoals een ponton of een drijvende bok. ’s Nachts tonen witte lichten de omtrek.',
    lelievlet: 'Houd ruim afstand, en vaar niet tussen de sleepboot en het ponton door.',
  },

  // -- veerponten
  veerpont_niet_vrijvarend: {
    naam: 'Kabelpont of gierpont', groep: 'Veerponten', artikel: 'BPR 3.16 lid 1',
    lichten: 'Een groen licht ongeveer 1 m boven een wit licht, allebei rondom zichtbaar. Geen boordlichten.',
    betekenis: 'Een veerpont die aan een kabel oversteekt. Hij voert deze lichten ook als hij aan zijn aanlegplaats ligt.',
    lelievlet: 'Geef een vertrekkende of overstekende pont voorrang. Vaar nooit vlak voor of achter een kabelpont langs: daar loopt de kabel.',
  },
  veerpont_ankerschuit: {
    naam: 'Gierpont met drijvers', groep: 'Veerponten', artikel: 'BPR 3.16 lid 2',
    lichten: 'Op de pont groen boven wit, rondom zichtbaar. Op de drijver die het verst stroomopwaarts ligt een wit rondom licht, minstens 3 m boven het water.',
    betekenis: 'Een gierpont hangt aan een lange kabel die stroomopwaarts aan een anker vastzit. Drijvers houden die kabel boven water.',
    lelievlet: 'Vaar niet tussen de pont en de drijvers door, en ook niet vlak langs de drijvers: daar loopt de kabel.',
  },
  veerpont_vrijvarend: {
    naam: 'Vrijvarende veerpont', groep: 'Veerponten', artikel: 'BPR 3.16 lid 3',
    lichten: 'Groen boven wit, allebei rondom zichtbaar, en daarbij een groen en een rood boordlicht en een wit heklicht.',
    betekenis: 'Een veerboot die zonder kabel heen en weer vaart. Aan de boordlichten zie je welke kant hij op gaat.',
    lelievlet: 'Geef een vertrekkende, kerende of overstekende veerpont voorrang.',
  },
  veerpont_vrijvarend_aanlegplaats: {
    naam: 'Vrijvarende veerpont aan de aanlegplaats', groep: 'Veerponten', artikel: 'BPR 3.22 lid 2',
    lichten: 'Groen boven wit, rondom zichtbaar. De boordlichten en het heklicht mogen blijven branden.',
    betekenis: 'De pont ligt aan zijn aanlegplaats en is in dienst. Is hij buiten dienst, dan gaan het groene licht, de boordlichten en het heklicht uit.',
    lelievlet: 'Hij kan zo vertrekken: vaar er niet vlak langs, en geef hem voorrang als hij vertrekt.',
  },

  // -- stilliggend
  groot_schip_gemeerd: {
    naam: 'Groot schip aan de kant', groep: 'Stilliggend', artikel: 'BPR 3.20 lid 1',
    lichten: 'Een wit rondom licht aan de kant van het vaarwater, minstens 3 m hoog. Het mogen er ook twee zijn, voorop en achterop.',
    betekenis: 'Een groot schip dat aan de oever vastligt. Het licht laat zien hoe ver het schip het vaarwater in steekt.',
    lelievlet: 'Vaar langzaam langs, zodat je geen golven maakt, en blijf weg van de trossen.',
  },
  groot_schip_geankerd: {
    naam: 'Groot schip voor anker', groep: 'Stilliggend', artikel: 'BPR 3.20 lid 2',
    lichten: 'Twee witte rondom lichten: het voorste minstens 4 m hoog, het achterste minstens 2 m lager.',
    dagmerk: 'Een zwarte bol op het voorschip.',
    betekenis: 'Een groot schip dat ten anker ligt, niet aan de kant. Het hoogste licht zit voorop.',
    lelievlet: 'Vaar niet vlak voor de boeg langs: daar loopt de ankerketting.',
  },
  duwstel_geankerd: {
    naam: 'Duwstel voor anker', groep: 'Stilliggend', artikel: 'BPR 3.20 lid 3',
    lichten: 'Een wit rondom licht op elk schip, minstens 4 m hoog. Op de bakken samen hoeven er niet meer dan vier te staan.',
    dagmerk: 'Een zwarte bol op de duwboot en op de voorste bakken aan de buitenkant.',
    betekenis: 'Een duwstel dat ten anker ligt, niet aan de kant. Samen tonen de witte lichten hoe groot het duwstel is.',
    lelievlet: 'Houd ruim afstand en vaar niet vlak voor de kop langs: daar liggen de ankers.',
  },
  klein_schip_stilliggend: {
    naam: 'Klein schip voor anker', groep: 'Stilliggend', artikel: 'BPR 3.20 lid 4',
    lichten: 'Eén wit rondom licht, waar het het best te zien is.',
    dagmerk: 'Een zwarte bol, maar alleen als het schip niet aan de oever vastligt.',
    betekenis: 'Een klein schip dat stilligt: voor anker of aan de kant. Op sommige plekken hoeft het niet, bijvoorbeeld op een veilige ligplaats.',
    lelievlet: 'Precies dit voert een lelievlet voor anker.',
  },
  anker_gevaar: {
    naam: 'Anker dat een gevaar kan zijn', groep: 'Stilliggend', artikel: 'BPR 3.26 lid 1, 3',
    lichten: 'Een tweede wit rondom licht, ongeveer 1 m onder het ankerlicht op het voorschip.',
    dagmerk: 'Het anker zelf is gemarkeerd met een gele boei met een radarreflector.',
    betekenis: 'Het anker of de ketting ligt zo dat het een gevaar is voor andere schepen. De gele boei ligt boven het anker.',
    lelievlet: 'Vaar niet tussen het schip en de gele boei door.',
  },
  drijvend_voorwerp_stil: {
    naam: 'Stilliggend drijvend voorwerp', groep: 'Stilliggend', artikel: 'BPR 3.23',
    lichten: 'Witte rondom lichten aan de kant van het vaarwater, genoeg om te zien hoe ver het uitsteekt.',
    betekenis: 'Een drijvende steiger, ponton of ander drijvend voorwerp dat stilligt. De lichten tonen de omtrek aan de kant van het vaarwater.',
    lelievlet: 'Blijf buiten de witte lichten: daarbinnen ligt het voorwerp.',
  },
  drijvend_voorwerp_anker_gevaar: {
    naam: 'Drijvend voorwerp met een gevaarlijk anker', groep: 'Stilliggend', artikel: 'BPR 3.26 lid 2, 3',
    lichten: 'Witte rondom lichten aan de kant van het vaarwater, maar bij het anker twee witte rondom lichten boven elkaar, ongeveer 1 m uit elkaar.',
    dagmerk: 'Het anker zelf is gemarkeerd met een gele boei met een radarreflector.',
    betekenis: 'Een ponton of drijvende steiger met een anker uit dat een gevaar is voor de scheepvaart. De twee lichten staan aan de kant van het anker.',
    lelievlet: 'Vaar niet tussen het ponton en de gele boei door: daar loopt de ankerketting.',
  },
  netten_stilliggend: {
    naam: 'Schip met een net uit', groep: 'Stilliggend', artikel: 'BPR 3.24',
    lichten: 'Een wit rondom licht bij het net of de uitlegger, naast de lichten van het stilliggende schip zelf.',
    dagmerk: 'Een gele vlag bij het net of de uitlegger.',
    betekenis: 'Een stilliggend schip heeft in stromend water een net of uitlegger uitstaan. Licht en vlag laten zien waar dat net zit.',
    lelievlet: 'Vaar niet tussen het schip en het licht of de gele vlag door: daar hangt het net.',
  },
  verbod_toegang: {
    naam: 'Verboden toegang aan boord', groep: 'Stilliggend', artikel: 'BPR 3.31',
    lichten: 'De gewone lichten van het schip, hier een wit rondom licht aan de kant van het vaarwater. ’s Nachts wordt het bord zo nodig verlicht.',
    dagmerk: 'Een rond wit bord met een rode rand en een rode schuine streep, met in zwart een hand die tegenhoudt. Het hangt aan boord of bij de loopplank.',
    betekenis: 'Wie niet bij het schip hoort, mag niet aan boord komen.',
    lelievlet: 'Ga niet aan boord, ook niet even om iets te vragen.',
  },
  verbod_roken: {
    naam: 'Verboden te roken en open vuur', groep: 'Stilliggend', artikel: 'BPR 3.32',
    lichten: 'De gewone lichten van het schip, hier een wit rondom licht aan de kant van het vaarwater. ’s Nachts wordt het bord zo nodig verlicht.',
    dagmerk: 'Een rond wit bord met een rode rand en een rode schuine streep, met een brandende lucifer.',
    betekenis: 'Aan boord mag niemand roken of open vuur of onbeschermd licht gebruiken. Je ziet het vooral op tankschepen.',
    lelievlet: 'Lig je vlak bij zo’n schip, wees dan zelf ook voorzichtig met vuur.',
  },
  verbod_ligplaats_langszij: {
    naam: 'Verboden langszij ligplaats te nemen', groep: 'Stilliggend', artikel: 'BPR 3.33',
    lichten: 'De gewone lichten van het schip, hier een wit rondom licht aan de kant van het vaarwater. ’s Nachts is het bord verlicht, aan beide kanten van het schip.',
    dagmerk: 'Midden op het dek een vierkant wit bord met een rode rand, een rode schuine streep en een zwarte P. Eronder een witte driehoek met een getal.',
    betekenis: 'Binnen het aantal meters op de driehoek mag niemand naast dit schip ligplaats nemen, hier 10 m.',
    lelievlet: 'Ga niet langszij liggen, en ga ook niet binnen die afstand naast het schip voor anker of aan de kant.',
  },

  // -- werk en hinder
  werkend_schip: {
    naam: 'Werkend schip', groep: 'Werk en hinder', artikel: 'BPR 3.25 lid 1',
    lichten: 'Aan de kant waar je langs mag twee groene rondom lichten boven elkaar; aan de andere kant een rood rondom licht.',
    dagmerk: 'Aan de vrije kant twee groene ruiten boven elkaar; aan de andere kant een rode bol.',
    betekenis: 'Een drijvend werktuig aan het werk, zoals een baggermolen of kraanschip, of een schip dat in het vaarwater werkt of meet.',
    lelievlet: 'Vaar alleen langs de groene kant. Langs de rode kant varen is verboden.',
  },
  werkend_schip_golfslag: {
    naam: 'Werkend schip, ook tegen golfslag', groep: 'Werk en hinder', artikel: 'BPR 3.25 lid 1',
    lichten: 'Aan de vrije kant rood boven wit, rondom zichtbaar; aan de andere kant een rood rondom licht.',
    dagmerk: 'Aan de vrije kant een bord, boven rood en onder wit; aan de andere kant een rood bord. Vlaggen mogen ook.',
    betekenis: 'Een werkend schip dat ook geen last wil hebben van de golven van langsvarende schepen.',
    lelievlet: 'Vaar langs de rood-witte kant, langzaam en zo ver mogelijk weg. Langs de rode kant varen is verboden.',
  },
  werktuig_anker_gevaar: {
    naam: 'Werkend schip met een gevaarlijk anker', groep: 'Werk en hinder', artikel: 'BPR 3.26 lid 4',
    lichten: 'De lichten van een werkend schip: twee groene rondom lichten boven elkaar aan de vrije kant, een rood aan de andere. Boven het anker een boei met een wit rondom licht.',
    dagmerk: 'Twee groene ruiten aan de vrije kant, een rode bol aan de andere kant, en boven het anker een gele boei met een radarreflector.',
    betekenis: 'Een drijvend werktuig aan het werk, zoals een kraanschip, met een anker uit dat een gevaar kan zijn. Elk zo’n anker krijgt een boei.',
    lelievlet: 'Vaar langs de groene kant, maar niet tussen het schip en de boei door: daar loopt de ankerketting.',
  },
  beperkt_manoeuvreerbaar: {
    naam: 'Beperkt manoeuvreerbaar schip', groep: 'Werk en hinder', artikel: 'BPR 3.34',
    lichten: 'Rood, wit en rood boven elkaar, rondom zichtbaar, naast de gewone lichten. Lager twee rode lichten aan de dichte kant en twee groene aan de vrije kant.',
    dagmerk: 'Bol, ruit en bol boven elkaar, allemaal zwart. Lager twee zwarte bollen aan de dichte kant en twee zwarte ruiten aan de vrije kant.',
    betekenis: 'Een varend schip dat werk uitvoert en daardoor slecht kan uitwijken, zoals een baggerschip. Is de doorvaart aan beide kanten vrij, dan staan aan beide kanten twee groene lichten.',
    lelievlet: 'Vaar langs de kant met de groene lichten of de ruiten. Langs de kant met de rode lichten of de bollen is verboden.',
  },
  werkzaamheden_geel: {
    naam: 'Werkschip met geel flikkerlicht', groep: 'Werk en hinder', artikel: 'BPR 3.28',
    lichten: 'Naast de gewone lichten een geel flikkerlicht dat rondom schijnt.',
    dagmerk: 'Ook overdag mag het gele licht flikkeren.',
    betekenis: 'Een schip dat met toestemming in of vlak bij het vaarwater werkt, bijvoorbeeld aan de oever of aan de boeien.',
    lelievlet: 'Er wordt gewerkt: vaar rustig langs en houd afstand.',
  },
  bescherming_golfslag: {
    naam: 'Geen golfslag gewenst', groep: 'Werk en hinder', artikel: 'BPR 3.29',
    lichten: 'Een rood licht ongeveer 1 m boven een wit licht, allebei rondom zichtbaar.',
    dagmerk: 'Een bord, boven rood en onder wit, of twee borden: rood boven wit. Vlaggen mogen ook.',
    betekenis: 'Dit schip wil geen last van de golven van langsvarende schepen, bijvoorbeeld omdat het zwaar beschadigd is of omdat er wordt gewerkt.',
    lelievlet: 'Vaar langzaam langs en zo ver mogelijk weg.',
  },
  vastgevaren_gezonken: {
    naam: 'Vastgevaren of gezonken schip', groep: 'Werk en hinder', artikel: 'BPR 3.25 lid 2',
    lichten: 'Aan de kant waar je langs kunt rood boven wit, rondom zichtbaar; aan de andere kant een rood rondom licht.',
    dagmerk: 'Aan de vrije kant een rood-wit bord, aan de andere kant een rood bord. Vlaggen mogen ook.',
    betekenis: 'Een schip dat aan de grond zit of gezonken is. Passen de tekens niet op het wrak, dan staan ze op bootjes ernaast of op een andere goede manier.',
    lelievlet: 'Vaar langzaam langs de rood-witte kant, zo ver mogelijk weg. Langs de rode kant varen is verboden.',
  },
  onmanoeuvreerbaar: {
    naam: 'Onmanoeuvreerbaar schip', groep: 'Werk en hinder', artikel: 'BPR 3.18',
    lichten: 'Twee rode rondom lichten boven elkaar. Of iemand zwaait een rood licht heen en weer; op een klein schip mag dat wit zijn.',
    dagmerk: 'Twee zwarte bollen boven elkaar, of iemand zwaait een rode vlag heen en weer.',
    betekenis: 'Dit schip kan niet meer sturen of manoeuvreren, bijvoorbeeld door motorpech. Het kan jou niet ontwijken.',
    lelievlet: 'Ga op tijd uit de weg. Kun je zelf niet meer sturen, zwaai dan ’s nachts een wit licht en overdag een rode vlag heen en weer.',
  },
  nood: {
    naam: 'Schip in nood', groep: 'Werk en hinder', artikel: 'BPR 3.30',
    lichten: 'Iemand zwaait een licht in het rond. Ook vuurpijlen, lichtkogels of vlammen zijn noodtekens.',
    dagmerk: 'Een vlag met een bol erboven of eronder, of iemand zwaait een vlag of iets anders in het rond. Ook een rookbom is een noodteken.',
    betekenis: 'Dit schip is in nood en vraagt om hulp. Het kan daarbij ook met de hoorn noodseinen geven.',
    lelievlet: 'Help als dat veilig kan, of haal hulp. Ben je zelf in nood, dan mag jij deze tekens ook geven.',
  },

  // -- bijzondere schepen
  gevaarlijke_stoffen_1: {
    naam: 'Schip met brandbare stoffen', groep: 'Bijzondere schepen', artikel: 'BPR 3.14 lid 1',
    lichten: 'Naast de gewone lichten één blauw licht dat rondom schijnt.',
    dagmerk: 'Eén blauwe kegel met de punt omlaag, of één op het voorschip en één op het achterschip.',
    betekenis: 'Het schip vervoert bepaalde brandbare stoffen. Het voert dit teken ook als het stilligt.',
    lelievlet: 'Voor één blauw licht geldt geen vaste afstand, maar blijf toch ruim weg.',
  },
  gevaarlijke_stoffen_2: {
    naam: 'Schip met schadelijke stoffen', groep: 'Bijzondere schepen', artikel: 'BPR 3.14 lid 2',
    lichten: 'Naast de gewone lichten twee blauwe lichten boven elkaar, rondom zichtbaar.',
    dagmerk: 'Twee blauwe kegels boven elkaar, met de punt omlaag.',
    betekenis: 'Het schip vervoert stoffen die schadelijk zijn voor de gezondheid. Het voert dit teken ook als het stilligt.',
    lelievlet: 'Vaar niet binnen 50 m van dit schip, behalve als je het inhaalt of tegemoet vaart.',
  },
  gevaarlijke_stoffen_3: {
    naam: 'Schip met ontplofbare stoffen', groep: 'Bijzondere schepen', artikel: 'BPR 3.14 lid 3',
    lichten: 'Naast de gewone lichten drie blauwe lichten boven elkaar, rondom zichtbaar.',
    dagmerk: 'Drie blauwe kegels boven elkaar, met de punt omlaag.',
    betekenis: 'Het schip vervoert ontplofbare stoffen. Het voert dit teken ook als het stilligt.',
    lelievlet: 'Vaar niet binnen 50 m van dit schip, behalve als je het inhaalt of tegemoet vaart.',
  },
  handhaving_brandweer: {
    naam: 'Politie, brandweer of reddingsboot', groep: 'Bijzondere schepen', artikel: 'BPR 3.27',
    lichten: 'Naast de gewone lichten een blauw licht dat rondom schijnt en flikkert.',
    dagmerk: 'Het blauwe licht mag ook overdag flikkeren.',
    betekenis: 'Een schip van politie of toezicht, een brandweerboot die hulp biedt of onderweg is, of een reddingsboot bij een redding.',
    lelievlet: 'Maak ruim baan en volg aanwijzingen op.',
  },
  voorrang: {
    naam: 'Schip met recht van voorrang', groep: 'Bijzondere schepen', artikel: 'BPR 3.17',
    lichten: 'De gewone lichten: ’s nachts is er geen apart teken voor.',
    dagmerk: 'Een rode wimpel op het voorschip.',
    betekenis: 'Dit schip heeft voorrang bij een brug of sluis waar de volgorde is geregeld, en wil die gebruiken. Bijvoorbeeld politie of brandweer met spoed.',
    lelievlet: 'Laat dit schip bij de brug of sluis voorgaan.',
  },
  stuurboord_op_stuurboord: {
    naam: 'Stuurboord op stuurboord passeren', groep: 'Bijzondere schepen', artikel: 'BPR 6.04a lid 3',
    lichten: 'Naast de gewone lichten een wit flikkerlicht aan stuurboord, soms bij een lichtblauw bord.',
    dagmerk: 'Aan stuurboord een lichtblauw bord met een witte rand, samen met het witte flikkerlicht.',
    betekenis: 'Een groot schip vraagt een tegemoetkomend schip om stuurboord op stuurboord te passeren, dus andersom dan gewoonlijk. Bijvoorbeeld omdat het naar een haven aan bakboord wil.',
    lelievlet: 'Geef het grote schip voorrang, het liefst door te doen wat het vraagt.',
  },
  vissersschip: {
    naam: 'Vissersschip', groep: 'Bijzondere schepen', artikel: 'BPR 3.37',
    lichten: 'Groen boven wit, allebei rondom zichtbaar; daaronder een groen en een rood boordlicht en een wit heklicht.',
    dagmerk: 'Twee zwarte kegels met de punten tegen elkaar, als een zandloper.',
    betekenis: 'Een schip dat vist met netten of lijnen, waardoor het minder makkelijk uitwijkt. Een vissersschip telt altijd als groot schip, ook als het kort is.',
    lelievlet: `Het gaat voor, ${GROOT}. Blijf weg van de netten.`,
  },
  loodsboot: {
    naam: 'Loodsboot', groep: 'Bijzondere schepen', artikel: 'BPR 3.36',
    lichten: 'In de top van de mast wit boven rood, rondom zichtbaar; daarbij een groen en een rood boordlicht en een wit heklicht.',
    dagmerk: 'Een blauwe vlag met een witte letter L in de top van de mast.',
    betekenis: 'Een boot die loodsen naar schepen brengt of van schepen ophaalt. Een loodsboot voert geen toplicht.',
    lelievlet: 'Blijf uit de buurt: een loodsboot gaat vaak vlak langs grote schepen.',
  },
  mijnenopruimer: {
    naam: 'Mijnenopruimingsschip', groep: 'Bijzondere schepen', artikel: 'BPR 3.35',
    lichten: 'Naast de gewone lichten drie groene rondom lichten: één in de top van de mast en één aan elk uiteinde van de ra.',
    dagmerk: 'Drie zwarte bollen, op dezelfde plaatsen als de groene lichten.',
    betekenis: 'Een marineschip dat mijnen opruimt. In de buurt kan het gevaarlijk zijn.',
    lelievlet: 'Blijf als het kan minstens 1000 m weg.',
  },
  duiker: {
    naam: 'Duikvlag A', groep: 'Bijzondere schepen', artikel: 'BPR 3.38',
    lichten: 'De gewone lichten van het schip; ’s nachts is de vlag A verlicht.',
    dagmerk: 'De seinvlag A, wit en blauw met een zwaluwstaart, of een stijve plaat in die vorm.',
    betekenis: 'Bij dit schip is iemand aan het duiken. De vlag mag ook worden getoond als er vanaf de kant wordt gedoken.',
    lelievlet: 'Vaar langzaam en blijf zo ver mogelijk weg: er zwemt iemand onder water.',
  },
  bovenmaats_zeeschip: {
    naam: 'Bovenmaats zeeschip', groep: 'Bijzondere schepen', artikel: 'BPR 10.03',
    lichten: 'Naast de gewone lichten drie rode rondom lichten boven elkaar.',
    dagmerk: 'Een zwarte cilinder.',
    betekenis: 'Een zeeschip dat door zijn diepgang of lengte aan een deel van de vaarweg gebonden is. Dit teken kom je tegen op de vaarwegen tussen zee en de zeehavens.',
    lelievlet: 'Iedereen moet dit schip voorrang geven. Blijf uit zijn vaargeul.',
  },
  zeeschip_gevaarlijke_stoffen: {
    naam: 'Zeeschip met gevaarlijke stoffen', groep: 'Bijzondere schepen', artikel: 'BPR 10.04',
    lichten: 'Naast de gewone lichten één rood rondom licht, minstens 6 m hoog.',
    dagmerk: 'De rode seinvlag B, minstens 6 m hoog.',
    betekenis: 'Een zeeschip dat gevaarlijke stoffen vervoert. Dit teken kom je tegen op de vaarwegen tussen zee en de zeehavens; een binnenschip toont daarvoor blauwe lichten of kegels.',
    lelievlet: 'Blijf ruim uit de buurt en uit zijn vaargeul.',
  },

  // -- de lelievlet
  lelievlet_zeilen: {
    naam: 'Lelievlet onder zeil', groep: 'De lelievlet', artikel: 'BPR 3.13 lid 5',
    lichten: 'Eén wit rondom licht, zo hoog dat het van alle kanten te zien is. Dreigt er een aanvaring, dan komt er een tweede wit licht bij.',
    betekenis: 'Een zeilende lelievlet is een klein zeilschip korter dan 7 m. Hij mag één wit rondom licht voeren, en toont bij gevaar voor aanvaring een tweede wit licht, zoals een zaklamp.',
    lelievlet: 'Schijn met de zaklamp op je zeil: dan zien anderen dat je een zeilboot bent.',
  },
  lelievlet_zeilen_driekleur: {
    naam: 'Lelievlet met driekleurenlantaarn', groep: 'De lelievlet', artikel: 'BPR 3.13 lid 5',
    lichten: 'Eén lantaarn in de top: groen naar stuurboord, rood naar bakboord en wit naar achteren.',
    betekenis: 'In plaats van het witte rondom licht mag een zeilende lelievlet ook een driekleurenlantaarn in de top voeren, of boordlichten op de boeg en een heklicht.',
    lelievlet: 'Zo zien anderen ’s nachts welke kant je op vaart.',
  },
  lelievlet_roeien: {
    naam: 'Lelievlet geroeid', groep: 'De lelievlet', artikel: 'BPR 3.13 lid 6',
    lichten: 'Eén wit rondom licht, bijvoorbeeld op een stokje achterin.',
    betekenis: 'Een geroeide of gewrikte lelievlet is een klein schip op spierkracht. Hij moet ’s nachts één wit rondom licht voeren; waar precies, zegt de wet niet.',
    lelievlet: 'Een klein motorschip geeft jou voorrang, en jij geeft een zeilschip voorrang. Eerst telt wel wie aan de stuurboordkant van het vaarwater vaart.',
  },
  lelievlet_zeil_en_motor: {
    naam: 'Lelievlet met buitenboordmotor', groep: 'De lelievlet', artikel: 'BPR 3.13 lid 2, 7',
    lichten: 'Eén wit rondom licht, als hij niet sneller kan dan 13 km per uur; anders de lichten van een klein motorschip.',
    dagmerk: 'Staat het zeil op terwijl de motor loopt, dan een zwarte kegel met de punt omlaag, zo hoog mogelijk.',
    betekenis: 'Met de motor aan is de lelievlet een klein motorschip, ook als het zeil op staat. Hij voert dan één wit rondom licht, en overdag met zeil op de kegel.',
    lelievlet: 'Met de motor aan geef jij voorrang aan zeilende en roeiende boten. Dat geldt niet als jij aan de stuurboordkant van het vaarwater vaart en zij niet.',
  },
  lelievlet_geankerd: {
    naam: 'Lelievlet voor anker', groep: 'De lelievlet', artikel: 'BPR 3.20 lid 4',
    lichten: 'Eén wit rondom licht, waar het het best te zien is. Een hoogte is niet voorgeschreven.',
    dagmerk: 'Een zwarte bol, van alle kanten te zien, bijvoorbeeld in de voorstag. Een kleinere of opvouwbare bol mag.',
    betekenis: 'Een lelievlet voor anker voert ’s nachts één wit rondom licht en overdag een zwarte bol. Is het anker een gevaar voor anderen, dan komt er een tweede wit licht onder.',
    lelievlet: 'Een goede stormlamp of ledlamp is genoeg, als je hem in het donker ongeveer 1000 m ver ziet.',
  },
  lelievlet_gemeerd: {
    naam: 'Lelievlet gemeerd', groep: 'De lelievlet', artikel: 'BPR 3.20 lid 4, 5',
    lichten: 'Eén wit rondom licht, waar het het best te zien is.',
    dagmerk: 'Geen: aan de oever of een steiger hoeft de zwarte bol niet.',
    betekenis: 'Ook aan de oever of een steiger voert een lelievlet ’s nachts één wit rondom licht. Het hoeft niet op een veilige ligplaats, of waar de kade genoeg verlicht is.',
    lelievlet: 'Lig je langszij van een ander schip dat aan de kant ligt, dan telt dat ook als gemeerd.',
  },
  lelievlet_gesleept: {
    naam: 'Lelievlet op sleeptouw', groep: 'De lelievlet', artikel: 'BPR 3.13 lid 4',
    lichten: 'De gesleepte lelievlet voert één wit rondom licht; de volgboot ervoor voert de lichten van een klein motorschip.',
    betekenis: 'Een lelievlet die wordt gesleept of langszij wordt meegevoerd, moet ’s nachts één wit rondom licht voeren.',
    lelievlet: 'Zet het licht zo dat het niet achter de mast of de bemanning verdwijnt.',
  },
};
