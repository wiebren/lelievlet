// Melden: the round button under Volledig scherm. It asks, one screen at a time, what is wrong -
// and whether it can be seen - before it asks for words, and sends a report with everything the
// viewer knows about where it is (main.js, snapshot): the toestand, what runs, the device, the
// build, and a picture of the boat. The picture is taken when the button is pressed, so it shows
// what the user saw; the panel is no part of it (it is not in the canvas).
//
// Where the report goes is `feedback.url` in the configuration: it is POSTed there as JSON. Without
// one it cannot be sent, and the last screen offers it as a file instead.

// what the manoeuvre documentation calls each operation: the heading the link goes to
const DOCS = 'https://github.com/wiebren/lelievlet/blob/main/docs/manoeuvres.md';
const SECTIONS = {
  aanslaan: 'Zeilen aanslaan en afslaan', afslaan: 'Zeilen aanslaan en afslaan', hijsen: 'Zeilen hijsen',
  nachtklaar: 'Zeilklaar en nachtklaar maken', zeilklaar: 'Zeilklaar en nachtklaar maken',
  strijken: 'Zeilen strijken', reven: 'Reven', mastStrijken: 'Mast strijken', mastZetten: 'Mast zetten',
  overstag: 'Overstag gaan (wenden)', gijpen: 'Gijpen', stormrondje: 'Stormrondje', opkruisen: 'Opkruisen',
  manOverBoord: 'Man over boord', peiling: 'Dwarspeiling', bijliggen: 'Bijliggen', weerVaren: 'Bijliggen',
  slipHoger: 'Afmeren: sliplanding hogerwal', opschieter: 'Afmeren: opschieter hogerwal',
  afmeren: 'Afmeren: sliplanding langswal', topEnTakel: 'Afmeren: voor top en takel langswal',
  aanleggenLager: 'Afmeren: aanleggen aan lagerwal', verhalen: 'Verhalen',
  afvarenHoger: 'Afvaren van hogerwal', afvaren: 'Afvaren van langswal', afvarenLager: 'Afvaren van lagerwal',
  kopInDeWind: 'Kop in de wind leggen',
  ankerenZeil: 'Ankeren', ankerenKaal: 'Ankeren', ankerOpZeil: 'Ankeren', ankerOpKaal: 'Ankeren',
  achtje: 'Achtje roeien', afvarenRoeiend: 'Afvaren roeiend', aanleggenBoeg: 'Aanleggen met de boeg',
  aanleggenZijkant: 'Zijwaartse aanleg', aanleggenSpiegel: 'Aanleggen met de spiegel',
  mobRoeiend: 'Man overboord roeiend', ankerenRoeiend: 'Ankeren roeiend', ankerOpRoeiend: 'Anker op roeiend',
};
// GitHub's anchor for a heading: lower case, punctuation out, spaces to hyphens
const anchor = (heading) => heading.toLowerCase().replace(/[^\p{L}\p{N} -]/gu, '').replace(/ /g, '-');

const CATEGORIES = [
  { key: 'model', naam: 'Model, animaties, bediening', uitleg: 'De boot zelf, hoe iets beweegt, wat een klik of knop doet' },
  { key: 'manoeuvres', naam: 'Manoeuvres en uitleg', uitleg: 'De stappen, commando’s en uitleg van een handeling' },
  { key: 'verzoek', naam: 'Iets ontbreekt', uitleg: 'Iets wat bij een bestaand onderdeel nog niet af is' },
];
const MIN_TEXT = 10;                      // characters: "werkt niet" alone is no report

/**
 * ui, wrap, config, signal, engaged: as mount() has them.
 * snapshot(): { screenshot, gegevens } - the picture as a data URL (or null) and the state as data.
 * closeOthers(): puts away the panels that stand where this one does.
 * about(): opens Over dit model, linked from the first screen.
 * Returns { close }.
 */
export function initFeedback({ ui, config, signal, engaged, snapshot, closeOthers, about }) {
  const $ = (id) => ui.getElementById(id);
  const button = $('feedback-toggle'); const panel = $('feedback'); const body = $('feedback-body');
  if (config.feedback === false) { button.hidden = true; return { close: () => {} }; }
  const url = config.feedback?.url ?? null;

  let report = null;                       // what is being put together; null while closed
  let trail = [];                          // the screens gone through, for Terug

  const el = (tag, props = {}, ...children) => {
    const node = Object.assign(document.createElement(tag), props);
    node.append(...children.filter((c) => c !== null && c !== undefined && c !== false));
    return node;
  };
  const text = (t, className = 'hint') => el('p', { className, textContent: t });
  const choice = (label, fn, primary = false) => {
    const b = el('button', { type: 'button', textContent: label, className: primary ? 'primary' : '' });
    b.addEventListener('click', fn);
    return b;
  };
  const row = (...buttons) => el('div', { className: 'fb-actions' }, ...buttons);

  /** A text field that remembers what was typed in `report[key]`, and keeps `next` shut until there is enough. */
  function field(key, label, placeholder, next, { rows = 5, min = MIN_TEXT, single = false } = {}) {
    const input = el(single ? 'input' : 'textarea', { value: report[key] ?? '', placeholder, id: `fb-${key}` });
    if (single) input.type = 'text'; else input.rows = rows;
    const check = () => { report[key] = input.value; if (next) next.disabled = input.value.trim().length < min; };
    input.addEventListener('input', check);
    check();
    queueMicrotask(() => input.focus());
    return el('label', { className: 'fb-field' }, el('span', { textContent: label }), input);
  }

  function capture() {
    const { screenshot, gegevens } = snapshot();
    report.screenshot = screenshot; report.gegevens = gegevens;
  }
  const thumb = () => (report.screenshot ? el('img', { className: 'fb-shot', src: report.screenshot, alt: 'Het scherm toen je op Melden drukte' }) : null);

  // ---------------------------------------------------------------- the screens
  const SCREENS = {
    start: () => [
      text('Dit is een bètaversie. Zie je iets dat niet klopt? Laat het ons weten, dan kunnen we het verbeteren.', 'fb-lead'),
      row(choice('Start', () => go('zichtbaar'), true)),
      about && el('p', { className: 'fb-about' }, el('button', { type: 'button', className: 'link-button', textContent: 'Over dit model',
                                                              onclick: () => { close(); about(); } })),
    ],

    zichtbaar: () => {
      const retake = el('button', { type: 'button', className: 'link-button', textContent: 'Opnieuw vastleggen' });
      retake.addEventListener('click', () => { capture(); show('zichtbaar', false); });
      return [
        el('h3', { textContent: 'Is wat je wilt melden nu op het scherm te zien?' }),
        thumb(),
        text(report.screenshot ? 'Dit was er te zien toen je op Melden drukte. Je kunt de boot nog draaien en het opnieuw vastleggen.'
          : 'Er kon geen afbeelding van het scherm gemaakt worden; wat er in de app gebeurt wordt wel meegestuurd.'),
        report.screenshot ? el('p', { className: 'fb-retake' }, retake) : null,
        row(choice('Nee', () => { report.zichtbaar = false; go('opnieuw'); }),
            choice('Ja', () => { report.zichtbaar = true; report.stappen = ''; go('categorie'); }, true)),
      ];
    },

    opnieuw: () => [
      el('h3', { textContent: 'Kun je het opnieuw laten gebeuren, zodat het wel te zien is?' }),
      text('Met het probleem in beeld kunnen we het veel sneller vinden.'),
      row(choice('Nee', () => go('stappen')), choice('Ja', () => go('nogmaals'), true)),
    ],

    nogmaals: () => [
      el('h3', { textContent: 'Graag!' }),
      text('Zorg dat het op het scherm staat en druk dan opnieuw op Melden.'),
      row(choice('Sluiten', close, true)),
    ],

    stappen: () => {
      const next = choice('Verder', () => go('categorie'), true);
      return [
        el('h3', { textContent: 'Beschrijf zo precies mogelijk wat je deed' }),
        field('stappen', 'Wat deed je, stap voor stap?', 'Bijvoorbeeld: Oefenen → Manoeuvres → Overstag → Bekijken, en bij stap 3 …', next),
        row(next),
      ];
    },

    categorie: () => [
      el('h3', { textContent: 'Waar gaat het over?' }),
      el('div', { className: 'fb-kinds' }, ...CATEGORIES.map((c) => {
        const b = el('button', { type: 'button' }, el('b', { textContent: c.naam }), el('span', { textContent: c.uitleg }));
        b.addEventListener('click', () => { report.categorie = c.key; go(c.key === 'manoeuvres' ? (activeStep(report.gegevens) ? 'plek' : 'welke') : c.key); });
        return b;
      })),
    ],

    model: () => {
      const next = choice('Verder', () => go('versturen'), true);
      return [
        el('h3', { textContent: 'Model, animaties, bediening' }),
        text('Kleine dingen aan het model, zoals een harpje dat scheef hangt, passen we op dit moment niet aan. Meld alleen wat echt niet klopt of stuk is.', 'fb-note'),
        field('omschrijving', report.zichtbaar ? 'Wat klopt er niet?' : 'Wat klopte er niet?', 'Wat zie je, en wat had je verwacht?', next),
        row(next),
      ];
    },

    // what was on screen when Melden was pressed: is that where it goes wrong?
    plek: () => {
      const at = activeStep(report.gegevens);
      return [
        el('h3', { textContent: 'Manoeuvres en uitleg' }),
        text('Toen je op Melden drukte, was je hier:', 'fb-lead'),
        el('dl', { className: 'fb-where' },
          el('dt', { textContent: 'Manoeuvre' }), el('dd', { textContent: at.manoeuvre }),
          at.stap ? el('dt', { textContent: at.nr ? `Stap ${at.nr} van ${at.van}` : 'Stap' }) : null,
          at.stap ? el('dd', { textContent: at.stap }) : null),
        el('h3', { textContent: 'Zit hier wat je wilt melden?' }),
        row(choice('Nee', () => go('welke')),
            choice('Ja', () => { report.plek = at; go('manoeuvres'); }, true)),
      ];
    },

    // not what was on screen, or nothing was: the report is only of use with the step in front of them
    welke: () => [
      el('h3', { textContent: 'Zet de manoeuvre op het scherm' }),
      text('Start de manoeuvre via Oefenen → Manoeuvres → Bekijken en ga met de stappenbalk naar de stap waar het om gaat. Druk dan opnieuw op Melden.', 'fb-lead'),
      row(choice('Sluiten', close, true)),
    ],

    manoeuvres: () => {
      const section = sectionFor(report.gegevens);
      const link = el('a', { href: section ? `${DOCS}#${anchor(section)}` : DOCS, target: '_blank', rel: 'noreferrer',
                             textContent: section ? `${section} in de beschrijving van de manoeuvres` : 'de beschrijving van de manoeuvres' });
      return [
        el('h3', { textContent: 'Manoeuvres en uitleg' }),
        el('p', { className: 'fb-lead' }, 'Kijk eerst in ', link, '.'),
        el('h3', { textContent: 'Staat wat je wilt melden daar wél goed uitgelegd?' }),
        row(choice('Nee', () => { report.documentatie = { klopt: false, sectie: section }; go('bron'); }),
            choice('Ja', () => { report.documentatie = { klopt: true, sectie: section }; report.bron = ''; go('afwijking'); }, true)),
      ];
    },

    afwijking: () => {
      const next = choice('Verder', () => go('versturen'), true);
      return [
        el('h3', { textContent: 'De app doet het anders dan de beschrijving' }),
        field('omschrijving', 'Wat klopt er niet?', 'Bij welke stap, en wat doet de app anders?', next),
        row(next),
      ];
    },

    bron: () => {
      const next = choice('Verder', () => go('versturen'), true);
      const description = field('omschrijving', 'Wat klopt er niet in de beschreven procedure?', 'Welke stap, en hoe hoort het te gaan?', next);
      const source = el('label', { className: 'fb-field' }, el('span', { textContent: 'Waar staat hoe het wel moet?' }),
        Object.assign(el('input', { type: 'text', value: report.bron ?? '', placeholder: 'Bijvoorbeeld: BPR artikel 6.04, CWO Kielboot II, Vlettenboek blz. 42' }), { id: 'fb-bron' }));
      const input = source.querySelector('input');
      const check = () => { report.bron = input.value; next.disabled = (report.omschrijving ?? '').trim().length < MIN_TEXT || input.value.trim().length < 3; };
      input.addEventListener('input', check);
      description.querySelector('textarea').addEventListener('input', check);
      check();
      return [
        el('h3', { textContent: 'De beschrijving klopt niet' }),
        text('Verwijs naar de sectie in het BPR, het CWO-boek of andere documentatie, zodat we het kunnen nakijken.', 'fb-note'),
        description, source, row(next),
      ];
    },

    verzoek: () => {
      const next = choice('Verder', () => go('versturen'), true);
      return [
        el('h3', { textContent: 'Iets ontbreekt' }),
        text('Verzoeken om nieuwe onderdelen nemen we op dit moment nog niet aan. Meld alleen wat binnen een bestaand onderdeel nog niet compleet is.', 'fb-note'),
        field('omschrijving', 'Wat ontbreekt er?', 'Bij welk onderdeel, en wat mis je?', next),
        row(next),
      ];
    },

    versturen: () => {
      const send = choice(url ? 'Versturen' : 'Opslaan als bestand', submit, true);
      const withShot = el('input', { type: 'checkbox', checked: report.metAfbeelding ?? Boolean(report.screenshot) });
      withShot.addEventListener('change', () => { report.metAfbeelding = withShot.checked; });
      report.metAfbeelding = withShot.checked;
      const shown = { ...report.gegevens };
      return [
        el('h3', { textContent: 'Klaar om te versturen' }),
        field('naam', 'Je naam of scoutinggroep (mag leeg blijven)', '', null, { single: true, min: 0 }),
        report.screenshot ? el('label', { className: 'fb-check' }, withShot, el('span', { textContent: 'Afbeelding van het scherm meesturen' })) : null,
        text('Je melding wordt openbaar zichtbaar. Zet er niets in wat niet iedereen mag lezen.'),
        el('details', { className: 'fb-details' }, el('summary', { textContent: 'Wat wordt er meegestuurd?' }),
          el('pre', { textContent: JSON.stringify(shown, null, 2) })),
        url ? null : text('Versturen kan nog niet vanuit deze versie. Sla de melding op en stuur het bestand naar de makers.', 'fb-note'),
        row(send),
      ];
    },

    verstuurd: () => [
      el('h3', { textContent: 'Bedankt!' }),
      text(url ? 'Je melding is verstuurd.' : 'De melding is opgeslagen als bestand.', 'fb-lead'),
      report.issue ? el('p', { className: 'fb-lead' }, el('a', { href: report.issue, target: '_blank', rel: 'noreferrer', textContent: 'Bekijk je melding' })) : null,
      row(choice('Sluiten', close, true)),
    ],

    mislukt: () => [
      el('h3', { textContent: 'Versturen is niet gelukt' }),
      text('Probeer het zo nog eens, of sla de melding op als bestand.'),
      row(choice('Opslaan als bestand', () => { download(); go('verstuurd'); }), choice('Opnieuw', submit, true)),
    ],
  };

  /** The manoeuvre and step on screen: the run of an operation, else the procedure the bar shows. */
  function activeStep(gegevens) {
    const p = gegevens?.procedure; const run = gegevens?.handeling;
    if (!p && !run) return null;
    return { manoeuvre: run?.naam ?? p?.naam, stap: p?.stap, nr: p?.stapNr, van: p?.stappen };
  }

  /** The docs heading for what is on screen: the operation that runs, else the one the procedure bar shows. */
  function sectionFor(gegevens) {
    const op = gegevens?.handeling?.handeling;
    if (op && SECTIONS[op]) return SECTIONS[op];
    const name = gegevens?.procedure?.naam;
    const known = name && Object.values(SECTIONS).find((s) => s.toLowerCase() === name.toLowerCase());
    if (known) return known;
    if (gegevens?.panelen?.includes('cmd-panel')) return 'Roeicommando’s';
    return null;
  }

  function show(name, push = true) {
    if (push && trail.at(-1) !== name) trail.push(name);
    const back = el('button', { type: 'button', className: 'link-button fb-back', textContent: '‹ Terug' });
    back.addEventListener('click', () => { trail.pop(); show(trail.at(-1) ?? 'start', false); });
    const final = ['verstuurd', 'nogmaals'].includes(name);
    body.replaceChildren(...SCREENS[name]().filter(Boolean), trail.length > 1 && !final ? back : '');
    body.scrollTop = 0;
  }
  const go = (name) => show(name);

  // ---------------------------------------------------------------- sending
  /** The report as it goes out: the answers, the state, and the picture if it may go along. */
  function payload() {
    const { screenshot, gegevens, metAfbeelding, issue, ...answers } = report;
    return {
      versie: 1, ...answers,
      omschrijving: answers.omschrijving?.trim() ?? '', stappen: answers.stappen?.trim() || undefined,
      naam: answers.naam?.trim() || undefined, bron: answers.bron?.trim() || undefined,
      gegevens, screenshot: metAfbeelding ? screenshot : null,
    };
  }

  function download() {
    const blob = new Blob([JSON.stringify(payload(), null, 2)], { type: 'application/json' });
    const a = el('a', { href: URL.createObjectURL(blob), download: `lelievlet-melding-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.json` });
    ui.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
  }

  // the report on its way, if one is: closing the panel, or opening a new report, does not stop it -
  // and when its answer comes, it only shows if that report is still the one in the panel
  let sending = null;
  async function submit() {
    if (sending === report) return;
    if (!url) { download(); go('verstuurd'); return; }
    const mine = report; sending = mine;
    const button = body.querySelector('.fb-actions .primary');
    if (button) { button.disabled = true; button.textContent = 'Bezig…'; }
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload()) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const { issue } = await response.json().catch(() => ({}));
      if (report !== mine) return;                                 // sent; the panel has moved on
      report.issue = typeof issue === 'string' && issue.startsWith('https://') ? issue : null;   // where it was filed, if it says
      go('verstuurd');
    } catch (error) {
      console.warn('[lelievlet] melding versturen:', error);
      if (report === mine) go('mislukt');
    } finally { if (sending === mine) sending = null; }
  }

  // ---------------------------------------------------------------- open and close
  function open() {
    closeOthers();
    report = {}; trail = [];
    capture();                                  // before anything else moves: what the user saw
    panel.hidden = false; button.setAttribute('aria-expanded', 'true');
    show('start');
  }
  function close() {
    panel.hidden = true; button.setAttribute('aria-expanded', 'false');
    report = null; trail = []; body.replaceChildren();
  }
  button.addEventListener('click', () => (panel.hidden ? open() : close()));
  $('feedback-close').addEventListener('click', close);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && engaged() && !panel.hidden) close(); }, { signal });

  return { close };
}
