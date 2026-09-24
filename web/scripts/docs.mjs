// Writes the reference documents for the viewer, in Dutch, from what the viewer itself uses:
//   docs/onderdelen.md   every part of the model, its other names and where Oefenen asks about it
//   docs/manoeuvres.md   every operation: its preconditions and its steps
// Run from web/ with `pnpm docs` after the model, the quiz list or the operations change. The
// tables come from lelievlet.parts.json, src/quizdata.js and src/modes.js, so they stay in step.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { QUIZ } from '../src/quizdata.js';

const here = dirname(fileURLToPath(import.meta.url));
const web = resolve(here, '..');
const docs = resolve(web, '..', 'docs');
const parts = JSON.parse(readFileSync(resolve(web, 'public/models/lelievlet.parts.json'), 'utf8'));
const modes = readFileSync(resolve(web, 'src/modes.js'), 'utf8');
const template = readFileSync(resolve(web, 'src/template.js'), 'utf8');

const ROMAN = { 1: 'I', 2: 'II', 3: 'III' };
const cell = (text) => String(text).replace(/\|/g, '\\|');
const table = (head, rows) => [`| ${head.join(' | ')} |`, `|${head.map(() => '---').join('|')}|`,
  ...rows.map((r) => `| ${r.map(cell).join(' | ')} |`)].join('\n');

// ================================================================ onderdelen

// Not part of the standard boat, and left out of this reference.
const LEFT_OUT = new Set(['boegspriet', 'boegspriet_bouten']);

const GROUPS = [
  ['romp', 'Romp (casco)'], ['roer', 'Roer'], ['zwaard', 'Zwaard en zwaardkast'], ['interieur', 'Interieur'],
  ['beslag', 'Beslag'], ['rondhout', 'Rondhouten'], ['zeil', 'Zeilen'], ['staand_want', 'Staand want'],
  ['lopend_want', 'Lopend want'], ['roeien', 'Roeien en wrikken'],
];

// Other names for a part, with the source that uses them (keys as in reference/parts/SOURCES.md
// and CWO_NIVEAUS.md). Only names the sources give; the name the quiz asks it by is in the Oefenen
// column already.
const ALT = {
  dolboord_bb: 'boordrand [OZS102], stootrand [WIL88, ARG]', dolboord_sb: 'boordrand [OZS102], stootrand [WIL88, ARG]',
  vlak_bb: 'bodem [ARG]', vlak_sb: 'bodem [ARG]',
  spanten: 'wrang ≡ denningsteun [VDM8]',
  buikdenning: 'buikdenning [VDM8, KATR], denning [KB3L, ARG]',
  helmstok: 'helmstok (de meeste bronnen)',
  roerkop: 'helmhoutbeslag',
  zwaard: 'midzwaard [VDM8, KATR], zwaardblad',
  zwaardloper_boven: 'zwaardval [ARG, HBO]', zwaardloper_onder: 'zwaardval [ARG, HBO]',
  grendelbout: 'mastgrendel, borgbout',
  klauw: 'gaffelklauw',
  lummelbeslag: 'lummelhouder; in de lesstof vaak lummelbout [KATZ, MTX, SNEEK, PRAET]',
  hommerring: 'mastring; [VDM8] en [OZS102] onderscheiden mastring, topmastring en hommerring',
  hanekam: 'hanenkam (de meeste bronnen)',
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

// Parts the viewer makes itself: in the quiz, but not in the model file.
const MADE = {
  windvaan: 'Windvaan', vlaggenstok: 'Vlaggenstok', vlag: 'Vlag', kleed: 'Kleed (gebied op het grootzeil)',
  boeg: 'Boeg (gebied)', stootwillen: 'Stootwillen', zeilbinders: 'Zeilbinders',
};
const nameOf = (id) => parts.find((p) => p.id === id)?.naam ?? MADE[id] ?? id;

function onderdelen() {
  const asked = new Map();        // part id -> [{ entry, how: 'is' | 'ook' }]
  for (const q of QUIZ) {
    for (const id of q.delen) asked.set(id, [...(asked.get(id) ?? []), { q, how: 'is' }]);
    for (const id of q.ook ?? []) asked.set(id, [...(asked.get(id) ?? []), { q, how: 'ook' }]);
  }
  const level = (q) => [q.zeilen === false ? null : `Zeilen ${ROMAN[q.niveau ?? 3]}`, q.roeien ? 'Roeien' : null].filter(Boolean).join(', ');
  const quizCell = (id) => (asked.get(id) ?? []).map(({ q, how }) => (how === 'is'
    ? `**${q.nr} ${q.naam}** (${level(q)})` : `telt mee bij ${q.nr} ${q.naam}`)).join('; ') || '—';

  const shown = parts.filter((p) => !LEFT_OUT.has(p.id));
  const sections = GROUPS.map(([key, title]) => {
    const rows = shown.filter((p) => p.groep === key).map((p) => [p.naam, `\`${p.id}\``, ALT[p.id] ?? '', quizCell(p.id)]);
    return `### ${title}\n\n${table(['Onderdeel', 'Id', 'Andere namen', 'Oefenen'], rows)}`;
  });

  const quizRows = QUIZ.map((q) => [q.nr, q.naam, q.zeilen === false ? '–' : ROMAN[q.niveau ?? 3], q.roeien ? 'ja' : '',
    q.delen.map(nameOf).join(', '), (q.ook ?? []).map(nameOf).join(', ')]);
  const count = (f) => QUIZ.filter(f).length;

  return `# Onderdelen van de lelievlet

Naslag voor wie de viewer gebruikt of controleert: elk onderdeel dat het 3D-model heeft, de andere
namen die de lesstof ervoor gebruikt, en of en hoe **Oefenen** ernaar vraagt.

Dit bestand wordt gemaakt door \`web/scripts/docs.mjs\` (\`pnpm docs\` in \`web/\`) uit
\`web/public/models/lelievlet.parts.json\` (het model) en \`web/src/quizdata.js\` (de vragen). Pas
het niet met de hand aan: verander de bron en draai het script opnieuw.

## Hoe te lezen

- **Onderdeel** is de naam die de viewer toont (hovertip, infotegel, onderdelenlijst); **Id** is de
  sleutel waarmee een insluitende pagina het onderdeel hernoemt (\`namen.onderdelen\`) of selecteert.
- **Andere namen** komen uit de lesstof; de bronsleutels staan in
  \`reference/parts/SOURCES.md\` en \`reference/parts/CWO_NIVEAUS.md\` (hoofdstuk 4). De naam
  waaronder Oefenen het vraagt staat in de kolom Oefenen.
- **Oefenen**: **vetgedrukt** is een vraag waarvan dit onderdeel het antwoord *is*, met het niveau
  waarop het gevraagd wordt: Zeilen I, II of III (CWO Zeilen Kielboot) en/of Roeien (CWO Roeiboot,
  zonder niveaus: alles tegelijk). "Telt mee bij" betekent dat een klik op dit onderdeel bij die vraag
  ook goed is, omdat het erbij hoort. Zeilen-niveau L vraagt alles tot en met L.
- Hoe de niveaus zijn bepaald, met bronnen en paginanummers: \`reference/parts/CWO_NIVEAUS.md\`.
  Waarom Roeien geen niveaus heeft: \`reference/book/ROEIEN.md\`.

## Onderdelen per groep

${sections.join('\n\n')}

## De vragen van Oefenen

${count((q) => q.zeilen !== false)} vragen bij Zeilen (niveau I: ${count((q) => q.zeilen !== false && (q.niveau ?? 3) === 1)},
tot en met II: ${count((q) => q.zeilen !== false && (q.niveau ?? 3) <= 2)}, tot en met III: ${count((q) => q.zeilen !== false)}),
${count((q) => q.roeien)} bij Roeien. Het nummer is dat van de onderdelentekening van de klasse
(\`reference/book/onderdelen_lelievlet.json\`); 85 en verder zijn namen van de roeilijst die de
zeiltekening niet nummert. Een insluitende pagina kan vragen weglaten (\`quiz.weg\`), toevoegen
(\`quiz.erbij\`) en hernoemen (\`namen.quiz\`); zie de README.

${table(['Nr', 'Vraag', 'Zeilen', 'Roeien', 'Antwoord: onderdelen', 'Telt ook goed'], quizRows)}

## Niet gevraagd

- **61 Luchtkast** en **62 Mangat** staan op de tekening, maar niets in het model staat ervoor.
- **77 Knop van de vlaggenstok** hoort bij de Vlaggenstok.
- Van de roeilijst van 40: **Handvat** en **Blad** zijn delen van de riem en **Zwaardgreep** van het
  zwaard; ze worden vragen zodra het model ze als eigen onderdeel heeft.
`;
}

// ================================================================ manoeuvres

/** The steps of a procedure in modes.js, from its source: key, goal, time, labels. */
function stepsOf(name) {
  const at = modes.indexOf(`new Procedure('${name}'`);
  let block = modes.slice(at, modes.indexOf(']);', at));
  // steps kept in an array of their own just before it (afmeren's landvasten), spread in
  const spread = block.match(/\.\.\.(\w+),/);
  if (spread) {
    const from = modes.lastIndexOf(`const ${spread[1]} = [`, at);
    block = block.replace(spread[0], modes.slice(from, modes.indexOf('];', from)));
  }
  const out = [];
  const re = /(\.\.\.\(upwind \? \[)?\{ key: '(\w+)', to: ([^,]+), seconds: (.+?), label: stap\('([^']+)'\), back: stap\('([^']+)'\)/g;
  for (let m = re.exec(block); m; m = re.exec(block)) {
    out.push({ key: m[2], to: m[3].trim(), seconds: m[4].trim(), label: m[5], back: m[6], ifUpwind: Boolean(m[1]) });
  }
  // steps written through a helper: step('key', seconds, 'Label', [focus], camera, 'Said!', 'who'),
  // the same both ways
  const helper = /step\('(\w+)', (.+?), '([^']+)', \[[^\]]*\](?:, (?:\w+|null)(?:, '([^']+)')?(?:, '(\w+)')?)?\)/g;
  for (const m of block.matchAll(helper)) {
    out.push({ key: m[1], to: '1', seconds: m[2].trim(), label: m[3], back: m[3], ifUpwind: false, say: m[4] ?? null, by: m[5] ?? 'roer' });
  }
  return out;
}
/** An object literal of modes.js, by the name it is bound to. */
function objectOf(name) {
  const at = modes.indexOf(`const ${name} = {`);
  const text = modes.slice(modes.indexOf('{', at), modes.indexOf('};', at) + 1);
  return Function(`return ${text}`)();
}
/** The step order a manoeuvre's run checks, from `<name>.needs = { ... };` in modes.js. */
function needsOf(name) {
  const m = modes.match(new RegExp(`\\b${name}\\.needs = (\\{[\\s\\S]*?\\})\\s*;`));
  if (!m) throw new Error(`docs.mjs: no \`${name}.needs = { ... };\` in src/modes.js`);
  try {
    return Function(`return ${m[1]}`)();
  } catch (error) {
    throw new Error(`docs.mjs: \`${name}.needs\` in src/modes.js is no plain object literal (${error.message})`);
  }
}
/**
 * The preconditions of each operation, as the reasons the viewer shows, in the order it checks them
 * (it shows the first that fails). A shared precondition stands in the list by its name.
 */
function opsOf() {
  const at = modes.indexOf('const OPS = {');
  const block = modes.slice(at, modes.indexOf('\n  };', at));
  // preconditions shared between operations, written once as `const name = [check, 'reason'];`
  const shared = Object.fromEntries([...modes.matchAll(/const (\w+) = \[[^\]\n]*'([^']+)'\];/g)].map((m) => [m[1], m[2]]));
  if (!shared.notReefing) throw new Error('docs.mjs: no `const notReefing = [..., \'reason\']` in src/modes.js');
  const named = new RegExp(`'([^']+)'|\\b(${Object.keys(shared).join('|')})\\b`, 'g');
  const out = {};
  const heads = [...block.matchAll(/^ {4}(\w+): \{/gm)];
  heads.forEach((h, i) => {
    const body = block.slice(h.index, heads[i + 1]?.index ?? block.length);
    const needs = body.slice(body.indexOf('needs:'));
    out[h[1]] = [...needs.matchAll(named)].map((r) => r[1] ?? shared[r[2]]);
  });
  return out;
}

function manoeuvres() {
  const rig = stepsOf('Tuig');
  const reef = stepsOf('Reven');
  const NEEDS = objectOf('STEP_NEEDS');
  const REEF_NEEDS = objectOf('REEF_NEEDS');
  const TACK_NEEDS = objectOf('TACK_NEEDS');
  const GYBE_NEEDS = objectOf('GYBE_NEEDS');
  const tack = stepsOf('Overstag');
  const gybe = stepsOf('Gijpen');
  const storm = stepsOf('Stormrondje');
  const berth = stepsOf('Sliplanding langswal');
  const hoger = stepsOf('Sliplanding hogerwal');
  const opschieter = stepsOf('Opschieter');
  const takel = stepsOf('Voor top en takel');
  const leave = stepsOf('Afvaren');
  const turnRound = stepsOf('Kop in de wind');
  const WHO = { roer: 'de roerganger', fok: 'de fokkenist' };
  const turnTable = (list, needs) => table(['#', 'Stap', 'Roept', 'Eerst gedaan (voor Oefenen)', 'Duur'], list.map((s, i) => [i + 1, s.label,
    s.say ? `“${s.say}” (${WHO[s.by]})` : '—', (needs[s.key] ?? []).map((k) => list.find((x) => x.key === k).label).join(', ') || '—', secs(s)]));
  const OPS = opsOf();
  const split = rig.findIndex((s) => s.key === 'ties') + 1;
  const sails = rig.slice(0, split); const mast = rig.slice(split);
  const byKey = Object.fromEntries(rig.map((s) => [s.key, s]));
  // a plain number of seconds, or the choice a step makes between two ("1,5 of 0,6 s")
  const secs = (s) => {
    const n = Number(s.seconds);
    if (/GYBE_COURSE/.test(s.seconds)) return '0,6 s, plus 1 s per 30° hoger dan voor de wind';
    if (/\/ 45/.test(s.seconds)) return `${s.seconds.match(/^\s*(\d+(\.\d+)?)/)[1].replace('.', ',')} s, plus 1 s per 45° ruimer dan aan de wind`;
    if (/seconds\('/.test(s.seconds)) return 'volgt uit de afstand en de snelheid';
    if (/FENDER_SECONDS/.test(s.seconds)) return `${modes.match(/const FENDER_SECONDS = ([\d.]+)/)[1].replace('.', ',')} s`;
    if (/SWING\.seconds/.test(s.seconds)) return `${modes.match(/const SWING = \{[^}]*seconds: ([\d.]+)/)[1].replace('.', ',')} s`;
    if (/LINE_SECONDS/.test(s.seconds)) return `${String(modes.match(/const LINE_SECONDS = ([\d.]+)/)[1]).replace('.', ',')} s`;
    if (/way\.seconds/.test(s.seconds)) return `de weg langszij, op ${modes.match(/const MOOR_SPEED = ([\d.]+)/)[1].replace('.', ',')} m/s; minstens 3 s`;
    if (/m0/.test(s.seconds)) return '0,6 s, plus 1 s per 30° ruimer dan aan de wind';
    const shown = Number.isNaN(n) ? (s.seconds.split('?')[1] ?? '').match(/\d+(\.\d+)?/g)?.join(' of ') ?? '?' : String(n);
    return `${shown.replace(/\./g, ',')} s`;
  };

  // forwards: a step needs the steps it names done; backwards: undoing a step needs every step that
  // needed it undone first
  const forward = (list) => table(['#', 'Stap', 'Eerst gedaan (voor Oefenen)', 'Duur'],
    list.map((s, i) => [i + 1, s.label, (NEEDS[s.key] ?? []).map((k) => byKey[k].label).join(', ') || '—', secs(s)]));
  const backward = (list) => table(['#', 'Stap', 'Eerst gedaan (voor Oefenen)', 'Duur'],
    [...list].reverse().map((s, i) => [i + 1, s.back,
      rig.filter((d) => (NEEDS[d.key] ?? []).includes(s.key)).map((d) => d.back).join(', ') || '—', secs(s)]));
  const reefId = (s) => (s.key === 'turns' ? 'turns' : `${s.key}>${s.to === '0' ? 0 : 1}`);
  const reefLabel = Object.fromEntries(reef.map((s) => [reefId(s), s.label]));
  const reefTable = table(['#', 'Stap', 'Eerst gedaan (voor Oefenen)', 'Duur'], reef.map((s, i) => [i + 1,
    s.label + (s.ifUpwind ? ' *' : '') + (s.key === 'hoop' ? ' **' : ''),
    (REEF_NEEDS[reefId(s)] ?? []).map((id) => reefLabel[id]).join(', ') || '—',
    s.key === 'turns' ? '1,25 s per slag' : secs(s)]));
  // each reason the viewer shows, as the condition it stands for
  const CONDITION = {
    'Eerst de mast zetten': 'de mast staat', 'De mast ligt al': 'de mast staat',
    'Eerst het reven afmaken': 'er wordt niet gereefd', 'Eerst de zeilen strijken': 'de zeilen zijn gestreken en opgebonden',
    'Eerst de zeilen hijsen': 'de zeilen staan', 'Eerst het anker op': 'het anker is op',
    'Eerst losgooien': 'de boot is niet afgemeerd',
    'Eerst een koers varen, niet kop in de wind': 'de boot vaart een koers (niet kop in de wind)',
    'Eerst afmeren': 'de boot ligt afgemeerd', 'Alleen van een langswal': 'de wal is een langswal', 'Alleen aan een langswal': 'de wal is een langswal',
    'Eerst kop in de wind leggen': 'de wind komt van voren (minder dan 45° van de boeg)',
    'Eerst het draaien afmaken': 'er is geen kop in de wind leggen bezig',
    'Eerst het afmeren of draaien afmaken': 'er is geen afmeren of kop in de wind leggen half af',
    'Afgemeerd alleen kop in de wind, of met de wind over de steiger': 'niet afgemeerd, of afgemeerd kop in de wind, of aan de wind of halve wind met de wind over de steiger',
    'Alleen met de wind van achteren': 'de wind komt van achteren (135° of meer van de boeg)',
    'Eerst halve wind, ruime of voor de wind gaan varen': 'de boot vaart halve wind, ruime wind of voor de wind (70° of meer van de wind)',
    'Eerst aan de wind of halve wind gaan varen': 'de boot vaart aan de wind of halve wind (niet kop in de wind, niet ruime of voor de wind)',
    'Eerst de wending of gijp afmaken': 'er is geen wending of gijp bezig',
    'Eerst ruime of voor de wind gaan varen': 'de boot vaart ruime wind of voor de wind (niet halve wind of hoger)',
  };
  const pre = (op) => (OPS[op]?.length
    ? OPS[op].map((r) => `- ${CONDITION[r] ?? r} — anders grijs met *${r}*`).join('\n')
    : '- geen');

  const commands = [...template.matchAll(/<div class="choices( beide)?" data-boord="(\w+)">[\s\S]*?<\/div>/g)];
  const say = Object.fromEntries([...modes.matchAll(/^ {2}(\w+): \{[^}]*say: '([^']*)'/gm)].map((m) => [m[1], m[2]]));
  const knoppen = new Map();
  for (const [block, , boord] of commands) {
    for (const m of block.matchAll(/data-commando="(\w+)">([^<]+)</g)) knoppen.set(m[1], { knop: m[2], beide: boord === 'beide' });
  }
  const cmdRows = [...knoppen].map(([key, { knop, beide }]) => [knop, beide ? 'hele boot' : 'per boord', say[key] ? `“${say[key]}”` : '—']);

  return `# Handelingen en manoeuvres

Naslag voor wie de viewer gebruikt of controleert: wat de boot kan doen, wanneer (de voorwaarden)
en in welke stappen. Wat er nog bij komt, met CWO-niveau en bronnen, staat in de werklijst
\`docs/handelingen.md\`.

Dit bestand wordt gemaakt door \`web/scripts/docs.mjs\` (\`pnpm docs\` in \`web/\`); de stappen, de
voorwaarden en wat er eerst gedaan moet zijn komen rechtstreeks uit \`web/src/modes.js\`. Pas het niet
met de hand aan: verander de bron en draai het script opnieuw. Een insluitende pagina kan de namen
van stappen veranderen (\`namen.stappen\`); hier staan de standaardnamen.

## Het menu Handelingen

Oefenen (de studentenmuts in de kolom linksboven) → Manoeuvres, alleen in de modus Zeilen, toont de
handelingen per groep: **Zeil** (hijsen, strijken, reven), **Wenden** (overstag, gijp, stormrondje),
**Afmeren** (sliplanding en opschieter aan hogerwal, sliplanding en voor top en takel aan een langswal, kop in de
wind leggen, afvaren van langswal) en **Mast** (zetten, strijken). Eerst staat de groep open met de eerste handeling die kan.
Een handeling die niet kan is grijs, met de reden eronder; een die al gedaan is zegt dat ("De mast
staat al"). De voorwaarden kijken naar hoe de boot er *nu* bij ligt, niet naar wat er het laatst
gevraagd is. Wat niet genoemd wordt doet er niet toe: de mast strijken vraagt gestreken en
opgebonden zeilen, waar het anker of het midzwaard intussen is maakt niet uit.

Daaronder kies je:

- **Bekijken**: de handeling speelt vanzelf af. De stappenbalk staat in de kaart: vorige stap,
  afspelen/pauzeren, volgende stap en een schuif over de hele handeling. Volgende en vorige stap gaan
  altijd in de richting van de handeling zelf, ook bij zeilen hijsen en mast zetten, die de
  tijdlijn van strijken terug doorlopen. Een stap op zich laat de camera eerst naar de onderdelen gaan
  waar het om gaat.
- **Oefenen**: de boot blijft staan en bij elke stap is de vraag *Wat is de volgende stap?*, met vier
  antwoorden. Het goede antwoord staat ertussen, en de drie andere zijn stappen die in de toestand van
  de boot op dat moment wél zouden kunnen, alleen niet nu: een stap waarvan alles wat er eerst moet
  gebeuren al gedaan is (kolom *Eerst gedaan* hieronder), of het terugdraaien van een stap die al
  gedaan is. Ze komen vooral uit de handeling zelf, soms uit de andere helft van het tuig. Bij de
  manoeuvres (wenden, gijpen, afmeren, afvaren, kop in de wind) komen er zetten van andere manoeuvres
  bij, zodat er altijd vier antwoorden zijn: één of twee uit de manoeuvre zelf, de rest uit wat je
  varend zou kunnen doen (oploeven, afvallen, ree, fok bak, gijp, zeilen los, strijken, anker uit…),
  bij het afmeren ook stootwillen en landvasten, en afgemeerd de lijnen, stootwillen en afduwen. Een
  andere naam voor dezelfde zet als het goede antwoord (*Afvallen* bij *Iets afvallen*) staat er nooit
  tussen. Na elk antwoord wordt de goede stap getoond; aan het eind volgt de uitslag.

Een handeling die je bij Oefenen van begin tot eind zonder fout hebt doorlopen, krijgt een groen
vinkje in de hoek van zijn tegel. Hij moet dan ook bij zijn eerste stap begonnen zijn: wie halverwege
het strijken stopt en vanaf daar weer hijst, heeft maar een deel gedaan en krijgt geen vinkje. Dat onthoudt de browser (\`lelievlet.manoeuvres.v1\` in
localStorage); Bekijken telt niet mee.

Zolang een handeling loopt, staat de viewer in focusmodus: alleen de boot, de kaart en de knop voor
volledig scherm; een klik op het model doet dan niets.

## Zeilen strijken

Voorwaarden:
${pre('strijken')}

Ligt de boot afgemeerd, dan vallen *Kop in de wind*, *Anker uit* en *Midzwaard op* weg: ze ligt al kop
in de wind en de landvasten houden haar vast, dus er gaat geen anker uit en daarom ook het midzwaard
niet op. Bij hijsen vallen om dezelfde reden *Midzwaard neer*, *Anker op* en *Afvallen* weg. De stappen
blijven op de voortgangsbalk staan, gearceerd, en worden overgeslagen. In Oefenen komen ze niet voor,
ook niet als fout antwoord.

${forward(sails)}

## Zeilen hijsen

Voorwaarden:
${pre('hijsen')}

Hijsen is strijken in omgekeerde volgorde. Het zeilinstructieboek geeft hijsen een eigen volgorde
(grootschoot en zeilbandjes los; gaffel op ±45°, beide vallen samen; klauwval vast; piek stellen met
een plooi van nok naar hals; fok als laatste; vallen opschieten — [KATZ] p. 64, [HBO] p. 6); dat staat
op de werklijst.

${backward(sails)}

## Mast strijken

Voorwaarden:
${pre('mastStrijken')}

${forward(mast)}

## Mast zetten

Voorwaarden:
${pre('mastZetten')}

${backward(mast)}

## Reven

Een rolrif: de giek wordt een aantal slagen gedraaid (0 tot en met het maximum dat het zeil toelaat),
of het rif gaat er weer uit.

Voorwaarden:
${pre('reven')}

${reefTable}

\\* Alleen als de boot niet al met de kop in de wind ligt; dan ook als laatste stap *Afvallen*.
\\*\\* Alleen bij een rif; als het rif eruit gaat, wordt de grootschoot teruggehangen.

## Overstag gaan (wenden)

Met de kop door de wind van de ene boeg naar de andere, in de volgorde van het zeilinstructieboek
(Katwijkse Zeeverkenners, § 5.6.1, p. 70). Hij kan vanaf aan de wind en halve wind: de eerste stap
loeft op tot hoog aan de wind (45°), daarna gaat de boeg door de wind en eindigt de boot hoog aan de
wind over de andere boeg. Een wending gaat alleen vooruit: terug is nog een keer overstag, over de
andere boeg. Bij Oefenen zijn er daarom geen antwoorden die een stap terugdraaien; wel een stap die al
gedaan is, nog een keer. Bij Bekijken kan Vorige stap wel: dat laat de stap ervoor nog eens zien. De fok doet wat de commando's zeggen:
los en klapperend; bak aan de oude kant gehouden terwijl de boeg door de wind gaat, vol maar
verkeerd om (de buik naar de nieuwe lijzijde); met *Fok bak houden* blijft hij zo staan terwijl de
boot over de nieuwe boeg afvalt - de bakke fok helpt haar rond; pas dan weer los, klapperend over naar
de nieuwe kant; en aangetrokken, vol de goede kant op. Het grootzeil killt van *Fok los* tot de boot
over de nieuwe boeg is afgevallen, en de helmstok staat van *Ree* naar lij en komt bij het afvallen
terug naar het midden. Het boek zelf gaat na *Fok bak* meteen naar *Fok over*; het vasthouden en
afvallen daartussen is zoals het op het water gedaan wordt.

Voorwaarden:
${pre('overstag')}

${turnTable(tack, TACK_NEEDS)}

Wie met de hand een andere koers kiest terwijl een wending half af stilstaat, neemt het roer over: de
wending vervalt.

## Gijpen

Met de achtersteven door de wind, in de volgorde van het zeilinstructieboek (§ 5.6.2, p. 71). Hij kan
vanaf ruime wind en voor de wind: de eerste stap valt af tot goed voor de wind (172°), daarna gaat de
achtersteven door de wind en eindigt de boot op 155° over de andere boeg, net buiten voor de wind.
*Fok komt over* is de fok die naar te loevert klapt als de boot voorbij pal voor de wind afvalt; staat
de fok aan het begin al te loevert (voor de wind), dan valt die stap weg. Te loevert over de oude boeg
is lij over de nieuwe: daar blijft de fok, en hij gaat bij *Bijsturen* naar zijn gewone stand. De giek
blijft aan de oude kant tot *Gijp!*, wordt dan hand over hand met de grootschoot binnengehaald tot vlak
bij midscheeps en bij *Schoot uitvieren* rustig uitgevierd naar de nieuwe kant: geen klapgijp. De
helmstok gaat bij *Iets afvallen* van de stuurman af (die aan lij zit), bij *Tegensturen* de andere
kant op en bij *Bijsturen* weer recht. Net als overstag gaat een gijp alleen vooruit, en valt hij weg
als je halverwege met de hand de koers verandert. *Kijken of de weg vrij is* uit het boek zit niet als eigen stap in de viewer.

Voorwaarden:
${pre('gijpen')}

${turnTable(gybe, GYBE_NEEDS)}

## Stormrondje

Gijpen door overstag te gaan (zeilinstructieboek § 5.6.3, p. 72, Kielboot II & III): als het hard
waait is een gijp lastig, omdat de wind het zeil bij het overhalen flinke vaart geeft. Dan loef je op,
ga je overstag en val je weer af. Het is meer werk en vraagt meer ruimte, maar het is veiliger: het
zeil vangt na de wending geleidelijk meer wind. Het boek geeft er geen eigen commando's voor; de
wending in het midden is de overstag van hierboven, met zijn commando's. De boot begint op ruime wind
of voor de wind, loeft op tot hoog aan de wind (45°) en gaat overstag. Na „Fok bak houden” valt ze in
één keer af tot dezelfde koers over de andere boeg, met de fok nog bak: die duwt de boeg weg. Pas
daarna komt de fok over en wordt hij aangetrokken voor die koers. De giek volgt de koers: aangetrokken
bij het oploeven, gevierd bij het afvallen.
Het spoor op het water laat de lus zien die de boot vaart.

Voorwaarden:
${pre('stormrondje')}

${turnTable(storm, TACK_NEEDS)}

## Afmeren: sliplanding hogerwal

Aanleggen aan hogerwal, de wind recht van de kant af, met een sliplanding (zeilinstructieboek
§ 5.10.1, p. 79). De viewer legt een steiger dwars op de wind neer, precies voor waar de boeg
uitkomt; de weg erheen blijft er benedenwinds van.

- **Oploeven tot aan de wind** (alleen als ze nog niet aan de wind voer): koers op de kant.
- **Zeilen los**: ruim van tevoren de schoten vieren tot de zeilen klapperen; ze remt af op de
  tegenwind (van 1,4 naar 0,6 m/s).
- **Grootzeil aan**: in het boek als je te vroeg stil komt te liggen. Hier altijd even, om te laten
  zien hoe ze weer vaart krijgt (tot 1 m/s).
- **Oploeven, kop in de wind aan de steiger**: het laatste stuk loeft ze op tot kop in de wind en komt
  met de boeg vlak voor de steiger stil te liggen.
- **Voorlandvast vastmaken**, van het sleepoog naar de bolder die het dichtst bij de boeg staat. De
  wind houdt haar van de kant af; zo ligt ze ook als het boek het afvaren van hogerwal begint (§ 5.9.1,
  p. 76: "je ligt al tegen wind in").

Kop in de wind leggen en afvaren van langswal gaan hier niet: die horen bij een langswal.

Voor Oefenen is fout: oploeven naar de steiger voordat de zeilen los zijn, en het voorlandvast voordat
ze er ligt. Grootzeil aan komt na zeilen los. Alleen vooruit.

Voorwaarden:
${pre('slipHoger')}

${turnTable(hoger, objectOf('HOGER_NEEDS'))}

## Afmeren: opschieter hogerwal

De andere manier om aan hogerwal aan te leggen (zeilinstructieboek § 5.10.1, p. 80). De viewer legt de
steiger dwars op de wind neer, precies voor waar de boeg uitkomt, en laat hem van de kant waar ze
vandaan kwam af lopen: komt ze voor de wind aan, dan vaart ze langs het eind ervan.

- **Langs de kant, remweg schatten**: ze vaart halve wind, ruime wind of voor de wind op de koers die
  ze had, zo ver van de kant als ze straks met de kop in de wind nodig heeft om stil te komen.
- **Met veel roer tegen de wind in**: de helmstok gaat ver naar lij (35°) en ze loeft op in een ruime
  halve cirkel, zoals het boek het tekent, tot kop in de wind; het laatste stuk gaat de helmstok terug
  naar het midden. Vanaf halve wind klapperen de zeilen. Ze schiet met de vaart die ze nog heeft op
  naar de steiger en komt met de boeg vlak ervoor stil te liggen.
- **Voorlandvast vastmaken**, van het sleepoog naar de bolder die het dichtst bij de boeg staat, zoals
  na de sliplanding aan hogerwal.

Het boek noemt ook afremmen door het roer heen en weer te bewegen, als het nodig is; dat zit er niet
in: ze komt precies goed aan.

Voor Oefenen: het roer gaat pas om als ze langs de kant vaart; het voorlandvast voordat ze er ligt is
fout. Alleen vooruit.

Voorwaarden:
${pre('opschieter')}

${turnTable(opschieter, objectOf('OPSCHIETER_NEEDS'))}

## Afmeren: sliplanding langswal

Aanleggen aan een langswal kan op twee manieren (zeilinstructieboek § 5.10.2, p. 81): met een
sliplanding of voor top en takel. Dit is de eerste.

Aanleggen aan een langswal met een sliplanding (zeilinstructieboek § 5.10.1, p. 79) en dan vastmaken
(§ 5.4, p. 67; roei-instructieboek § 1.2.3, p. 3). De viewer legt een nieuwe steiger neer, langs de
wind en aan lij van de boot, precies naast waar de sliplanding eindigt; de boot vaart er dus nooit
doorheen.

- **Oploeven tot aan de wind** (alleen als ze nog niet aan de wind voer): koers op de kant.
- **Stootwillen uit** aan de kant van de steiger, terwijl ze aan de wind doorvaart.
- **Zeilen los**: ruim van tevoren de schoten vieren tot de zeilen klapperen. Ze vangt geen wind
  meer en remt af op de tegenwind (van 1,4 naar 0,6 m/s).
- **Grootzeil aan**: in het boek als je te vroeg stil komt te liggen. Hier altijd even, om te laten
  zien hoe ze weer vaart krijgt (tot 1 m/s). De fok blijft los.
- **Oploeven, langszij**: ze loeft op tot kop in de wind, langs de steiger, en komt stil te liggen,
  een halve meter tot een meter ervandaan. Zo slaat de spiegel er bij het oploeven niet tegenaan.

Dan de landvasten. De wind komt van voren, dus eerst het **voorlandvast** en daarna het
achterlandvast. Andersom draait de boot van de wal weg. Met de landvasten wordt ze zijwaarts
tegen de stootwillen gehaald: eerst de boeg met het voorlandvast, dan de spiegel met het
achterlandvast. Het voorlandvast loopt door het sleepoog naar
een bolder voor de boeg, het achterlandvast van het landvastoog op de spiegel naar een bolder achter
de boot. Daarna de **achterspring** en de **voorspring**, van dezelfde ogen naar de bolder ter hoogte
van het midden van de boot: die houden haar tegen het heen en weer gaan langs de wal.

Voor Oefenen is fout: langszij komen voordat de stootwillen uit zijn of de zeilen los zijn, een
landvast voordat de boot langszij ligt, en het achterlandvast eerst. Grootzeil aan komt na zeilen
los, de springen na de landvasten, en de voorspring na de achterspring. Afmeren gaat alleen vooruit;
losgooien hoort bij het afvaren (D1, D2, D8).

Voorwaarden:
${pre('afmeren')}

${turnTable(berth, needsOf('berthing'))}

## Afmeren: voor top en takel langswal

De andere manier van § 5.10.2 (p. 81): op het laatste moment alle zeilen strijken en de boot met de
wind laten meedrijven tot ze op haar plek ligt. Het vraagt ruimte langs de kant, en de snelheid is
niet te regelen. De viewer legt de steiger weer precies naast waar de weg eindigt, langs de wind.

- **Oploeven tot aan de wind** (alleen als ze nog niet aan de wind voer): koers op de kant.
- **Grootzeil strijken**, ruim van tevoren: de giek in de mik en het grootzeil erop, zoals bij Zeilen
  strijken. Ze vaart verder op de fok en loopt terug van 1,4 naar 1,1 m/s.
- **Stootwillen uit** aan de kant van de steiger.
- **Fok strijken**, vlak voor de kant.
- **Afvallen tot voor de wind**: met de vaart die ze nog heeft draait ze van de wind af, tot ze met de
  wind van achteren langs de steiger ligt.
- **Voor top en takel langszij**: zonder zeilen drijft ze voor de wind langs de steiger en komt op haar
  plek tot stilstand, iets ervandaan.

Dan de landvasten. De wind komt nu van achteren, dus eerst het **achterlandvast** en daarna het
voorlandvast: zo blijft de spiegel in de wind. Met de landvasten wordt ze tegen de stootwillen gehaald,
eerst de spiegel, dan de boeg. Daarna de achterspring en de voorspring, zoals bij de sliplanding.

De zeilen liggen dan gestreken maar nog niet opgedoekt: Zeilen strijken gaat verder met opdoeken en de
zeilbinders. Daarna kan de boot kop in de wind gelegd worden, en dan weer afvaren.

Voor Oefenen is fout: de fok eerst strijken, afvallen voordat de zeilen weg zijn, het voorlandvast
eerst. Langszij drijven komt pas na het afvallen, de springen na de landvasten, en de voorspring na de
achterspring. Voor top en takel gaat alleen vooruit.

Voorwaarden:
${pre('topEnTakel')}

${turnTable(takel, objectOf('TAKEL_NEEDS'))}

## Afgemeerd: de wind draait

Ligt de boot langszij afgemeerd, dan kan de wind gewoon verzet worden: de lijnen houden haar op haar
plaats en de wind draait om haar heen.

Ligt ze met de boeg aan de steiger op alleen het voorlandvast (na de sliplanding of de opschieter aan
hogerwal), dan draait ze om haar boeg als de wind verzet wordt. De windschuif blijft wat hij altijd is,
de wind op de boot: van kop in de wind tot halve wind draait ze mee, tot ze langs de steiger ligt;
verder draait ze niet, anders zou ze erdoorheen gaan, en gaat alleen de wind verder rond. Onderweg komt
de boeg wat van de steiger af, zodat haar zijkant vrij blijft. De zeilen staan los en waaien mee.
Laat je de windschuif los bij halve wind, ruime wind of voor de wind, dan wordt ze langszij vastgemaakt:
steekt ze voorbij het eind van de steiger (na een opschieter ligt ze aan de kop ervan), dan schuift ze
eerst langs de steiger tot ze er helemaal naast ligt en gaat het voorlandvast naar een eigen bolder;
dan de stootwillen uit en na elkaar het achterlandvast, de achterspring en de voorspring. Vanaf dan is
het een langswal. Andersom, van langszij terug naar met de boeg aan de steiger, gebeurt niet. Afvaren van langswal kan alleen met de wind van voren. Komt de wind van
achteren, dan eerst kop in de wind leggen. Andere windrichtingen komen later.

Afgemeerd gaan de zeilen alleen omhoog als ze vrij van de wal waaien: kop in de wind, of aan de wind
of halve wind met de wind over de steiger, zodat ze boven het water uitstaan. Gestreken ligt de fok
gebundeld midden op de voorstag, en de giek in de mik, wat de wind ook doet.

## Kop in de wind leggen

Afgemeerd met de wind van achteren, met de zeilen gestreken: het boek wil haar kop in de wind voor het
afvaren (§ 5.9.2, p. 77, "zonodig moet de boot even worden verhaald"). Ze wordt om haar boeg gedraaid.

- Een **stootwil naar de boeg**, aan de kant van de wal: daar leunt ze straks tegen de steiger.
- **Alle lijnen los behalve de voorspring**: het voorlandvast, de achterspring, en het achterlandvast
  als laatste. De voorspring houdt haar tegen de wind.
- **Spiegel afduwen.**
- **Over de boeg draaien**: de wind duwt de spiegel rond, om de boeg heen, tot ze weer langs de steiger
  ligt, kop in de wind, met haar andere kant naar de wal. Terwijl ze draait gaan de stootwillen naar
  de andere kant: de stootwil achter binnen, die aan de andere kant uit.
- **De lijnen weer vast.** De voorspring is blijven zitten; omgedraaid ligt zijn bolder voor de boeg,
  dus hij is nu het voorlandvast. Dan het achterlandvast, de achterspring en een nieuwe voorspring naar
  de bolder bij het midden van de boot. Tot slot de stootwil van de boeg binnen.

Afmeren legt daarvoor een steiger van 18 meter met de ligplaats in het midden: omgedraaid ligt de boot
een bootlengte verder.

Voor Oefenen is fout: de spiegel afduwen voordat de lijnen los zijn, en een lijn vastmaken voordat ze
weer langs de steiger ligt.

Voorwaarden:
${pre('kopInDeWind')}

${turnTable(turnRound, needsOf('turning'))}

## Afvaren van langswal

Wegvaren van een langswal (zeilinstructieboek § 5.9.2, p. 77). De boot ligt kop in de wind met de
zeilen op, zoals Afmeren haar achterlaat. De lijnen gaan in omgekeerde volgorde los
(roei-instructieboek § 1.2.3, p. 3): eerst de springen, dan het achterlandvast, en het
**voorlandvast als laatste**. Met de wind van voren is dat de lijn die haar vasthoudt. Dan kijken of
de vaarweg vrij is.

De persoon op de wal gooit het voorlandvast los, trekt de boot een stukje naar voren zodat ze al wat
vaart heeft, en duwt de boeg rustig af. Met de **fok bak** draait de boeg verder van de wal af, tot
aan de wind. Niet in één keer ver afvallen, want dan slaat de spiegel tegen de wal. Met genoeg ruimte
komt de fok over en wordt het **grootzeil aangetrokken**. Ze vaart weg aan de wind (60°), en als ze
vrij is gaan de stootwillen binnen. Daarna vaart ze gewoon verder.

Voor Oefenen is fout: het voorlandvast los voordat de rest los is (dan zwaait ze met de spiegel naar
de wal en hangt ze aan het achterlandvast), de fok over voordat hij bak gehouden is, en de
stootwillen binnen voordat ze van de wal af is. De achterspring komt na de voorspring, en het
grootzeil aan na de fok over. Afvaren gaat alleen vooruit.

Voorwaarden:
${pre('afvaren')}

${turnTable(leave, needsOf('leaving'))}

## Wat er geroepen wordt, het spoor en de camera

Tijdens een manoeuvre (overstag, gijpen, afmeren) tekent de viewer de weg die de boot over het water
aflegt als een lichtrood spoor; het blijft liggen tot de volgende manoeuvre begint. Ga je terug in de
manoeuvre (terugspoelen), dan verdwijnt het stuk spoor daarna weer en ligt de boot waar ze toen was.
Een manoeuvre die begint terwijl de boot vaart (overstag, gijpen, stormrondje en het afmeren) vaart
eerst drie seconden rechtdoor op de koers die ze had, met spoor, zodat je ziet waar ze vandaan komt;
dan begint de eerste stap. Dat stuk is geen stap: het hoort bij de eerste.
Wacht de manoeuvre op je (stap voor stap, bij Oefenen op je antwoord, of gepauzeerd), dan blijft de boot
liggen waar ze is: ze vaart pas verder als de volgende stap begint.

Tijdens een manoeuvre draait de boot in beeld, niet de wereld: de camera gaat om de boot heen mee
met haar koers, zodat de steiger, de windpijl en het spoor stil blijven liggen en je haar ziet draaien.
Hetzelfde als ze met de boeg aan de steiger om haar boeg zwaait. Daarbuiten, bij het verzetten van de
koers of de wind, blijft de boot in beeld staan en draait de wereld eromheen, zoals altijd.

De manoeuvres aan de wal (afmeren, kop in de wind leggen, afvaren) worden van hoog bekeken, met de
boot en de steiger allebei in beeld: de camera gaat daarheen als de handeling begint, en bij elke stap
die op zich getoond wordt. De andere handelingen gaan per stap naar de onderdelen waar het om gaat.

Als een stap met een commando begint, verschijnt het commando in een tekstballon boven wie het roept:
de roerganger achterin, of de fokkenist bij de mast (*Fok komt over!*). Een roeicommando dat je kiest
verschijnt op dezelfde manier. Terugspoelen of een stap terug roept niets.

## Zonder menu: met een klik op het model

| Onderdeel | Wat een klik doet |
|---|---|
| Dol of dolkettinkje | de dol in de dolpot, of eruit (niet terwijl er met die riem geroeid wordt) |
| Riem | in de dol, of terug op de doften; beide riemen in hun dol is roeien |
| Wrikriem | in het wrikgat, of terug; in het wrikgat is wrikken |
| Zwaard, zwaardloper, borgpen of kettinkje | het midzwaard een stand verder: neer, half, op en weer neer |
| Mik of mikhouders | de mik omhoog in de houders of terug op de vlonder; met het zeil opgedoekt erin: het tuig in de kraanlijn optoppen, of terug |
| Stootwil | overboord, of weer binnen |
| Bakskist | het deksel open of dicht |
| Ankerlijn of anker | het anker uit, of op |
| Helmstok | slepen stuurt het roer |

## Koersen

De koers kies je in het paneel Boot, onder Wind (alleen in de modus Zeilen): de wind komt van boven in de koersschuif, met **kop in de wind** in het
midden, dan **aan de wind** (45°), **halve wind** (90°), **ruime wind** (135°) en **voor de wind**
(vanaf 158°, met de fok te loevert), met de wind over bakboord of over stuurboord. Giek, fok en de
bolling van de zeilen volgen de koers.

## Roeicommando's

Een commando begint met *Op… riemen*, behalve de twee die meteen moeten worden uitgevoerd (*Stopt…
af* en *Riemen… lopen*). De roerganger roept het met de boorden ervoor: *Bakboord, stuurboord haalt
op… gelijk*.

${table(['Knop', 'Voor', 'De roerganger roept'], cmdRows)}
`;
}

writeFileSync(resolve(docs, 'onderdelen.md'), onderdelen());
writeFileSync(resolve(docs, 'manoeuvres.md'), manoeuvres());
console.log('docs/onderdelen.md en docs/manoeuvres.md geschreven');
