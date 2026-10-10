// Geluidsseinen: the sound signals of the BPR, bijlage 6 (sections A to G; F is 'niet overgenomen'),
// one entry per row of the bijlage, in its order, with the answers where the bijlage gives them.
// Patterns are read from the bijlage's images and checked against the articles it cites (3.18, 3.30,
// 4.01–4.04, 6.04a, 6.05, 6.26, 6.28, 6.31–6.33). Where the article has no words for the pattern
// (6.10 voorbijlopen, 6.13 keren, 6.16 havens), the RPR's articles of the same number give it. The
// yellow light a groot motorschip shows with every blast (4.01 lid 2) is told once, under attentie.
// 'klein' follows art. 4.02: a klein schip must or may give section A and the mistsein of G, never
// the manoeuvreerseinen of B, C, D and E. 'cwo' marks the signals of CWO's instructieboek, § 4.3.
// The bijlage cites '3.46, lid 3' for medische hulp and '6.26, lid 7' for the brug; the text is in
// 3.30 lid 3 and 6.26 lid 6, which is what 'artikel' gives.

export const GELUID_GROEPEN = ['Algemeen', 'Tegengestelde koersen', 'Voorbijlopen', 'Keren', 'Havens en nevenvaarwateren', 'Slecht zicht'];

/**
 * patroon: tokens, in order: 'k' korte stoot, 'l' lange stoot, 'z' zeer korte stoot, 'Z' reeks zeer korte stoten,
 * 'b' klokslag, 'B' reeks klokslagen, and '|' for a longer pause where the BPR separates two groups (e.g. two
 * ships answering each other, or a signal that is repeated after a pause). herhaald: true when the signal is
 * repeated (noodsein, mistseinen), with interval_s when the BPR gives one (an upper bound: 'ten hoogste').
 * alternatief: another patroon the BPR allows for the same sign (the noodsein with klokslagen).
 */
export const GELUIDEN = [
  // A. Algemene seinen
  { id: 'attentie', groep: 'Algemeen', naam: 'Attentie', patroon: 'l', artikel: 'BPR 4.01 lid 2, 4.02, bijlage 6 A',
    betekenis: 'Let op! Een schip wil dat je het opmerkt. Vóór een engte waar je niet ver vooruit kunt kijken, geeft een schip ook één lange stoot (art. 6.07). '
      + 'Bij elk geluidssein, behalve klokslagen, laat een groot motorschip tegelijk een geel licht branden: zo zie je welk schip het geeft.',
    lelievlet: 'Dit moet je zelf geven als het nodig is om een aanvaring te voorkomen. Een hoorn aan boord is daarvoor genoeg.',
    klein: true, cwo: true },
  { id: 'stuurboord-uit', groep: 'Algemeen', naam: 'Ik ga stuurboord uit', patroon: 'k', artikel: 'BPR 4.02, bijlage 6 A',
    betekenis: 'Het schip dat dit geeft, draait naar zijn stuurboord, naar rechts.',
    lelievlet: 'Je mag dit zelf geven. Hoor je het van een groot schip, dan weet je welke kant het op gaat.',
    klein: true, cwo: true },
  { id: 'bakboord-uit', groep: 'Algemeen', naam: 'Ik ga bakboord uit', patroon: 'kk', artikel: 'BPR 4.02, bijlage 6 A',
    betekenis: 'Het schip dat dit geeft, draait naar zijn bakboord, naar links.',
    lelievlet: 'Je mag dit zelf geven. Hoor je het van een groot schip, dan weet je welke kant het op gaat.',
    klein: true, cwo: true },
  { id: 'achteruit', groep: 'Algemeen', naam: 'Ik sla achteruit', patroon: 'kkk', artikel: 'BPR 4.02, bijlage 6 A',
    betekenis: 'Het schip zet zijn schroef achteruit. Het remt af of vaart achteruit.',
    lelievlet: 'Let op als je achter zo’n schip vaart: het komt naar je toe of stopt plotseling.',
    klein: true, cwo: true },
  { id: 'niet-manoeuvreren', groep: 'Algemeen', naam: 'Ik kan niet manoeuvreren', patroon: 'kkkk', artikel: 'BPR 3.18, 3.35, bijlage 6 A',
    betekenis: 'Het schip kan niet sturen of uitwijken. Andere schepen moeten er zelf omheen. Een rode vlag of rood licht waarmee wordt gezwaaid, betekent hetzelfde.',
    lelievlet: 'Dit moet je zelf geven als het nodig is, bijvoorbeeld als je roer breekt en je op een ander schip afdrijft.',
    klein: true, cwo: true },
  { id: 'gevaar-aanvaring', groep: 'Algemeen', naam: 'Er dreigt gevaar voor aanvaring', patroon: 'Z', artikel: 'BPR 4.02, bijlage 6 A',
    betekenis: 'Een schip ziet dat er bijna een aanvaring is. Iedereen in de buurt moet opletten en zo nodig uitwijken of stoppen.',
    lelievlet: 'Hoor je dit, kijk dan meteen om je heen. Misschien ben jij het schip waar het om gaat.',
    klein: true, cwo: true },
  { id: 'medische-hulp', groep: 'Algemeen', naam: 'Verzoek om medische hulp', patroon: 'kkkkl', artikel: 'BPR 3.30 lid 3, bijlage 6 A',
    betekenis: 'Iemand aan boord heeft dringend een dokter of ambulance nodig. Het schip vraagt anderen om hulp.',
    lelievlet: 'Je mag dit zelf geven, bijvoorbeeld als iemand aan boord ernstig gewond is.',
    klein: true, cwo: false },
  { id: 'noodsein', groep: 'Algemeen', naam: 'Noodsein', patroon: 'll', herhaald: true, alternatief: 'B', artikel: 'BPR 4.01 lid 4, bijlage 6 A',
    betekenis: 'Het schip is in nood en roept om hulp. Het geeft steeds weer lange stoten, of steeds weer reeksen klokslagen. Het mag ook noodtekens tonen.',
    lelievlet: 'Dit moet je zelf geven als je in nood bent. Met een hoorn: blijf lange stoten geven.',
    klein: true, cwo: true },
  { id: 'blijf-weg', groep: 'Algemeen', naam: 'Blijf weg', patroon: 'kl', herhaald: true, artikel: 'BPR 4.04, 6.19, bijlage 6 A',
    betekenis: 'Een schip met gevaarlijke stoffen heeft een ongeluk. Het geeft dit sein zonder te stoppen, minstens 15 minuten lang.',
    lelievlet: 'Alleen schepen met blauwe kegels of lichten geven dit. Hoor je het, vaar dan weg van het gevaar en keer zo nodig om.',
    klein: false, cwo: true },
  { id: 'brug-sluis', groep: 'Algemeen', naam: 'Verzoek om een brug of sluis te bedienen', patroon: 'lkl', artikel: 'BPR 6.26 lid 6, 6.28 lid 4, bijlage 6 A',
    betekenis: 'Het schip vraagt de brugwachter of sluiswachter om open te doen. Heeft die laten merken dat hij het hoorde, dan herhaal je het niet.',
    lelievlet: 'Je mag dit zelf geven met een hoorn. Je mag het ook gewoon roepen.',
    klein: true, cwo: true },

  // B.1 Naderen op tegengestelde koersen, op alle vaarwegen behalve de Geldersche IJssel en de Maas
  { id: 'sbsb-wil', groep: 'Tegengestelde koersen', naam: 'Ik wil stuurboord op stuurboord voorbijvaren', patroon: 'kk', artikel: 'BPR 6.04a lid 5, bijlage 6 B.1',
    betekenis: 'Een groot schip toont het lichtblauwe bord en wil rechts langs je heen. Het geeft dit sein als het vreest dat je dat niet begrijpt.',
    lelievlet: 'Je moet het grote schip voorrang geven, het liefst door het stuurboord op stuurboord te laten passeren. Antwoorden met de hoorn mag je niet.',
    klein: false, cwo: false },
  { id: 'sbsb-akkoord', groep: 'Tegengestelde koersen', naam: 'Akkoord, u kunt stuurboord op stuurboord voorbijvaren', patroon: 'kk', artikel: 'BPR 6.04a lid 5, bijlage 6 B.1',
    betekenis: 'Het tegemoetkomende schip antwoordt met hetzelfde sein: begrepen, we varen stuurboord op stuurboord langs elkaar.',
    klein: false, cwo: false },
  { id: 'sbsb-neen', groep: 'Tegengestelde koersen', naam: 'Neen, u kunt niet stuurboord op stuurboord voorbijvaren', patroon: 'Z', artikel: 'BPR 6.04a lid 6, bijlage 6 B.1',
    betekenis: 'Het tegemoetkomende schip kan niet aan de vraag voldoen. Beide schepen moeten dan doen wat nodig is om gevaar te voorkomen.',
    klein: false, cwo: false },

  // B.2 Op de Geldersche IJssel en de Maas: the opvarend groot schip chooses the side
  { id: 'maas-bbbb-wil', groep: 'Tegengestelde koersen', naam: 'IJssel en Maas, opvarend: ik wil bakboord op bakboord voorbijvaren', patroon: 'k', artikel: 'BPR 6.05 lid 5, bijlage 6 B.2',
    betekenis: 'Op de Geldersche IJssel en de Maas kiest het opvarende grote schip de kant. Met dit sein laat het de afvarende ruimte aan zijn bakboord.',
    lelievlet: 'Vaar je daar afvarend, geef het opvarende grote schip dan voorrang, het liefst door aan de vrijgelaten kant te passeren.',
    klein: false, cwo: false },
  { id: 'maas-bbbb-akkoord', groep: 'Tegengestelde koersen', naam: 'IJssel en Maas, afvarend: akkoord, u kunt bakboord op bakboord voorbijvaren', patroon: 'k', artikel: 'BPR 6.05 lid 6, bijlage 6 B.2',
    betekenis: 'Het afvarende grote schip herhaalt het sein en vaart aan de kant die het opvarende schip vrijlaat.',
    klein: false, cwo: false },
  { id: 'maas-sbsb-wil', groep: 'Tegengestelde koersen', naam: 'IJssel en Maas, opvarend: ik wil stuurboord op stuurboord voorbijvaren', patroon: 'kk', artikel: 'BPR 6.05 lid 5, bijlage 6 B.2',
    betekenis: 'Het opvarende grote schip toont het lichtblauwe bord en laat de afvarende ruimte aan zijn stuurboord.',
    lelievlet: 'Vaar je daar afvarend, geef het opvarende grote schip dan voorrang, het liefst door aan de vrijgelaten kant te passeren.',
    klein: false, cwo: false },
  { id: 'maas-sbsb-akkoord', groep: 'Tegengestelde koersen', naam: 'IJssel en Maas, afvarend: akkoord, u kunt stuurboord op stuurboord voorbijvaren', patroon: 'kk', artikel: 'BPR 6.05 lid 6, bijlage 6 B.2',
    betekenis: 'Het afvarende grote schip herhaalt het sein en het blauwe bord, en vaart aan de kant die het opvarende schip vrijlaat.',
    klein: false, cwo: false },

  // C. Voorbijlopen. The answer of the opgelopene says on which of its sides the oploper may pass:
  // one short = 'pass me on my bakboord', two short = 'on my stuurboord' (RPR 6.10 lid 4).
  { id: 'voorbij-bb-wil', groep: 'Voorbijlopen', naam: 'Oploper: ik wil u aan bakboord voorbijlopen', patroon: 'llkk', artikel: 'BPR 6.10, bijlage 6 C',
    betekenis: 'Een schip achter je wil je inhalen langs je bakboordkant, je linkerkant.',
    lelievlet: 'Hoor je dit van een groot schip achter je, maak het inhalen dan makkelijk. Houd ruimte vrij aan je bakboordkant en minder zo nodig vaart.',
    klein: false, cwo: true },
  { id: 'voorbij-bb-akkoord', groep: 'Voorbijlopen', naam: 'Opgelopene: akkoord, u kunt mij aan bakboord voorbijlopen', patroon: 'k', artikel: 'BPR 6.10, bijlage 6 C',
    betekenis: 'Het schip dat wordt ingehaald, zegt: dat kan, kom maar langs mijn bakboordkant. Dit antwoord is niet verplicht.',
    klein: false, cwo: false },
  { id: 'voorbij-bb-neen', groep: 'Voorbijlopen', naam: 'Opgelopene: neen, u moet mij aan stuurboord voorbijlopen', patroon: 'kk', artikel: 'BPR 6.10, bijlage 6 C',
    betekenis: 'Het schip dat wordt ingehaald, zegt: niet aan die kant, kom maar langs mijn stuurboordkant.',
    klein: false, cwo: false },
  { id: 'voorbij-bb-neen-akkoord', groep: 'Voorbijlopen', naam: 'Oploper: akkoord, ik zal u aan stuurboord voorbijlopen', patroon: 'k', artikel: 'BPR 6.10, bijlage 6 C',
    betekenis: 'De inhaler antwoordt: begrepen, ik haal je in langs je stuurboordkant.',
    klein: false, cwo: false },
  { id: 'voorbij-sb-wil', groep: 'Voorbijlopen', naam: 'Oploper: ik wil u aan stuurboord voorbijlopen', patroon: 'llk', artikel: 'BPR 6.10, bijlage 6 C',
    betekenis: 'Een schip achter je wil je inhalen langs je stuurboordkant, je rechterkant.',
    lelievlet: 'Hoor je dit van een groot schip achter je, maak het inhalen dan makkelijk. Houd ruimte vrij aan je stuurboordkant en minder zo nodig vaart.',
    klein: false, cwo: true },
  { id: 'voorbij-sb-akkoord', groep: 'Voorbijlopen', naam: 'Opgelopene: akkoord, u kunt mij aan stuurboord voorbijlopen', patroon: 'kk', artikel: 'BPR 6.10, bijlage 6 C',
    betekenis: 'Het schip dat wordt ingehaald, zegt: dat kan, kom maar langs mijn stuurboordkant. Dit antwoord is niet verplicht.',
    klein: false, cwo: false },
  { id: 'voorbij-sb-neen', groep: 'Voorbijlopen', naam: 'Opgelopene: neen, u moet mij aan bakboord voorbijlopen', patroon: 'k', artikel: 'BPR 6.10, bijlage 6 C',
    betekenis: 'Het schip dat wordt ingehaald, zegt: niet aan die kant, kom maar langs mijn bakboordkant.',
    klein: false, cwo: false },
  { id: 'voorbij-sb-neen-akkoord', groep: 'Voorbijlopen', naam: 'Oploper: akkoord, ik zal u aan bakboord voorbijlopen', patroon: 'kk', artikel: 'BPR 6.10, bijlage 6 C',
    betekenis: 'De inhaler antwoordt: begrepen, ik haal je in langs je bakboordkant.',
    klein: false, cwo: false },
  { id: 'voorbij-onmogelijk', groep: 'Voorbijlopen', naam: 'Opgelopene: u kunt mij niet voorbijlopen', patroon: 'kkkkk', artikel: 'BPR 6.10, bijlage 6 C',
    betekenis: 'Het schip dat wordt ingehaald, zegt: inhalen kan hier niet zonder gevaar. Wacht ermee.',
    klein: false, cwo: false },

  // D. Keren
  { id: 'keren-sb', groep: 'Keren', naam: 'Ik ga over stuurboord keren', patroon: 'lk', artikel: 'BPR 6.13, bijlage 6 D',
    betekenis: 'Het schip wil omkeren door een bocht naar stuurboord, naar rechts, te maken.',
    lelievlet: 'Hoor je dit van een groot schip, help dan mee: houd afstand en geef het de ruimte om te keren. Zelf geef je dit sein niet.',
    klein: false, cwo: true },
  { id: 'keren-bb', groep: 'Keren', naam: 'Ik ga over bakboord keren', patroon: 'lkk', artikel: 'BPR 6.13, bijlage 6 D',
    betekenis: 'Het schip wil omkeren door een bocht naar bakboord, naar links, te maken.',
    lelievlet: 'Hoor je dit van een groot schip, help dan mee: houd afstand en geef het de ruimte om te keren. Zelf geef je dit sein niet.',
    klein: false, cwo: true },

  // E. Uit- en invaren van havens en nevenvaarwateren
  { id: 'haven-sb', groep: 'Havens en nevenvaarwateren', naam: 'Ik ga stuurboord uit (haven of nevenvaarwater)', patroon: 'lllk', artikel: 'BPR 6.16, bijlage 6 E',
    betekenis: 'Het schip vaart een haven of zijwater in of uit, en draait daarbij naar stuurboord, naar rechts.',
    lelievlet: 'Hoor je dit van een groot schip, geef het dan voorrang. Het mag ook jouw medewerking vragen. Zelf geef je dit sein niet.',
    klein: false, cwo: true },
  { id: 'haven-bb', groep: 'Havens en nevenvaarwateren', naam: 'Ik ga bakboord uit (haven of nevenvaarwater)', patroon: 'lllkk', artikel: 'BPR 6.16, bijlage 6 E',
    betekenis: 'Het schip vaart een haven of zijwater in of uit, en draait daarbij naar bakboord, naar links.',
    lelievlet: 'Hoor je dit van een groot schip, geef het dan voorrang. Het mag ook jouw medewerking vragen. Zelf geef je dit sein niet.',
    klein: false, cwo: true },
  { id: 'haven-oversteken', groep: 'Havens en nevenvaarwateren', naam: 'Ik ga oversteken', patroon: 'lll', artikel: 'BPR 6.16, bijlage 6 E',
    betekenis: 'Het schip komt een haven of zijwater uit en steekt het grote vaarwater recht over.',
    lelievlet: 'Hoor je dit van een groot schip, geef het dan voorrang. Het mag ook jouw medewerking vragen. Zelf geef je dit sein niet.',
    klein: false, cwo: false },

  // G.1 Op radar varende schepen, zo dikwijls als nodig
  { id: 'mist-radar', groep: 'Slecht zicht', naam: 'Groot schip op radar, zonder marifooncontact', patroon: 'l', herhaald: true, artikel: 'BPR 6.32 lid 5, bijlage 6 G.1',
    betekenis: 'Een groot schip vaart in de mist op radar. Het krijgt andere schepen niet via de marifoon te spreken, dus geeft het zo vaak als nodig een lange stoot.',
    klein: false, cwo: false },
  { id: 'mist-radar-veerpont', groep: 'Slecht zicht', naam: 'Veerpont op radar, zonder marifooncontact', patroon: 'lkkkk', herhaald: true, artikel: 'BPR 6.32 lid 5, bijlage 6 G.1',
    betekenis: 'Een veerpont vaart in de mist op radar en krijgt geen marifooncontact. Ze geeft zo vaak als nodig dit sein.',
    lelievlet: 'Hoor je dit in de mist, dan steekt er vlakbij een pont over. Blijf uit haar vaarlijn.',
    klein: false, cwo: false },

  // G.2 Zonder radar varende schepen, met tussenpozen van ten hoogste één minuut
  { id: 'mist', groep: 'Slecht zicht', naam: 'Mistsein van een varend schip zonder radar', patroon: 'l', herhaald: true, interval_s: 60, artikel: 'BPR 6.33 lid 1 en 3, bijlage 6 G.2',
    betekenis: 'In de mist geeft een varend schip zonder radar een lange stoot. Dat herhaalt het minstens elke minuut.',
    lelievlet: 'Een klein schip hoeft dit niet, maar mag het wel geven. Blaas dan in de mist minstens elke minuut één lange stoot op je hoorn.',
    klein: true, cwo: true },
  { id: 'mist-veerpont', groep: 'Slecht zicht', naam: 'Mistsein van een varende veerpont zonder radar', patroon: 'lkkkk', herhaald: true, interval_s: 60, artikel: 'BPR 6.33, bijlage 6 G.2',
    betekenis: 'Een veerpont zonder radar geeft in de mist dit sein. Ze herhaalt het minstens elke minuut.',
    lelievlet: 'Hoor je dit in de mist, dan steekt er vlakbij een pont over. Blijf uit haar vaarlijn.',
    klein: false, cwo: false },

  // G.3 Seinen tijdens het stilliggen
  { id: 'stilliggend', groep: 'Slecht zicht', naam: 'Stilliggend schip op een gevaarlijke plaats', patroon: 'B', herhaald: true, interval_s: 60, artikel: 'BPR 6.31 lid 1, 2 en 4, bijlage 6 G.3',
    betekenis: 'Een schip ligt in de mist stil of vast, in of vlak bij het vaarwater. Hoort het schepen naderen, dan luidt het minstens elke minuut de scheepsbel. Melden via de marifoon mag ook.',
    lelievlet: 'Hoor je in de mist een bel, dan ligt daar een schip stil in de buurt. Vaar voorzichtig en houd afstand.',
    klein: true, cwo: false },
  { id: 'stilliggend-zeegaand', groep: 'Slecht zicht', naam: 'Stilliggend zeeschip op een gevaarlijke plaats', patroon: 'klk', herhaald: true, artikel: 'BPR 6.31 lid 3, bijlage 6 G.3',
    betekenis: 'Alleen een zeeschip dat zo stilligt, mag naast de klokslagen ook dit sein geven. Het mag het herhalen.',
    klein: false, cwo: false },
];
