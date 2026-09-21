// The markup of one viewer: what used to be the body of index.html, unchanged, wrapped in the one
// element everything is laid out against. create() puts this in a shadow root of its own, so the
// ids below live in that root alone and two viewers on one page never see each other’s.

export const TEMPLATE = `\n<div class="lv" part="viewer">\n
  <canvas id="scene"></canvas>

  <button id="view-toggle" class="icon-button" type="button" aria-label="Weergave" aria-expanded="false" aria-controls="sidebar" title="Weergave">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  </button>

  <aside id="sidebar" hidden>
    <h1>Lelievlet</h1>
    <section>
      <h2>Groepen</h2>
      <ul id="groups"></ul>
    </section>
    <section>
      <h2>Aanzicht</h2>
      <div class="buttons" id="views">
        <button data-view="iso">3D</button>
        <button data-view="side">Zij</button>
        <button data-view="top">Boven</button>
        <button data-view="bow">Voor</button>
        <button data-view="stern">Achter</button>
      </div>
      <p class="hint">Pijltjes: verplaatsen · Shift + pijltjes: draaien · + / −: zoomen · Scrollen: inzoomen op de muisaanwijzer</p>
    </section>
  </aside>

  <button id="parts-toggle" class="icon-button" type="button" aria-label="Onderdelen" aria-expanded="false" aria-controls="parts" title="Onderdelen">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4.5 6.5h.01"/><path d="M9 6.5h10.5"/>
      <path d="M4.5 12h.01"/><path d="M9 12h10.5"/>
      <path d="M4.5 17.5h.01"/><path d="M9 17.5h10.5"/>
    </svg>
  </button>

  <aside id="parts" hidden>
    <header>
      <h2>Onderdelen</h2>
      <button id="parts-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <input id="parts-search" type="search" autocomplete="off" placeholder="Zoek onderdeel…" aria-label="Zoek onderdeel">
    <div id="parts-list"></div>
    <p class="hint" id="parts-empty" hidden>Geen onderdeel gevonden.</p>
  </aside>

  <button id="quiz-toggle" class="icon-button" type="button" aria-label="Oefenen" aria-expanded="false" aria-controls="quiz" title="Oefenen" disabled>
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 4 2.5 8.2 12 12.4l9.5-4.2z"/>
      <path d="M6.6 10.2v4.4c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-4.4"/>
      <path d="M21.5 8.2v4.6"/>
    </svg>
  </button>

  <!-- Oefenen: the start panel of the quiz; the card of a running round is built in quiz.js -->
  <aside id="quiz" hidden>
    <header>
      <h2>Oefenen</h2>
      <button id="quiz-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <h3>Soort oefening</h3>
    <div class="choices" id="quiz-kind">
      <button type="button" data-kind="aanwijzen" aria-pressed="true">Aanwijzen</button>
      <button type="button" data-kind="benoemen" aria-pressed="false">Benoemen</button>
      <button type="button" data-kind="typen" aria-pressed="false">Typen</button>
      <button type="button" data-kind="kies" aria-pressed="false">Kies het onderdeel</button>
      <button type="button" data-kind="gemengd" aria-pressed="false">Gemengd</button>
    </div>
    <h3>Lengte</h3>
    <div class="choices" id="quiz-length">
      <button type="button" data-length="10" aria-pressed="true">10 vragen</button>
      <button type="button" data-length="20" aria-pressed="false">20 vragen</button>
      <button type="button" data-length="alles" aria-pressed="false">Alles</button>
    </div>
    <h3 id="quiz-level-head" hidden>Niveau</h3>
    <div class="choices" id="quiz-level" hidden>
      <button type="button" data-level="1" aria-pressed="false">CWO I</button>
      <button type="button" data-level="2" aria-pressed="false">CWO II</button>
      <button type="button" data-level="3" aria-pressed="true">CWO III</button>
    </div>
    <p class="hint" id="quiz-warning" hidden></p>
    <p class="hint" id="quiz-total"></p>
    <button id="quiz-start" type="button">Start</button>
    <button id="quiz-wrong" type="button" hidden>Oefen fouten</button>
    <p class="hint quiz-clear">
      <button id="quiz-clear" type="button" class="link-button">Score wissen</button>
      <span id="quiz-clear-confirm" hidden>Zeker weten?
        <button id="quiz-clear-yes" type="button" class="link-button">Ja</button> ·
        <button id="quiz-clear-no" type="button" class="link-button">Nee</button>
      </span>
    </p>
    <p class="hint quiz-tables" id="quiz-tables-row" hidden>
      <button id="quiz-tables" type="button" class="link-button">Tabellen</button>
    </p>
  </aside>

  <!-- debug.quiztabellen: the quiz configuration as it was resolved, and the parts no entry asks about -->
  <aside id="quiz-debug" hidden>
    <header>
      <h2>Quiztabellen</h2>
      <button id="quiz-debug-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <div id="quiz-debug-body"></div>
  </aside>

  <button id="customize-toggle" class="icon-button" type="button" aria-label="Boot aanpassen" aria-expanded="false" aria-controls="customize" title="Boot aanpassen">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="3.2"/>
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>
    </svg>
  </button>

  <aside id="customize" hidden>
    <header>
      <h2>Aanpassen</h2>
      <button id="customize-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <label class="field"><span>Zeilnummer</span>
      <input id="cfg-zeilnummer" type="text" inputmode="numeric" maxlength="4" autocomplete="off"></label>
    <div class="field">
      <label for="cfg-naam"><span>Naam</span></label>
      <div class="with-color">
        <input id="cfg-naam" type="text" maxlength="24" autocomplete="off">
        <input id="cfg-naamKleur" type="color" aria-label="Kleur van de naam" title="Kleur van de naam">
      </div>
    </div>
    <div class="field">
      <label for="cfg-plaats"><span>Plaats</span></label>
      <div class="with-color">
        <input id="cfg-plaats" type="text" maxlength="24" autocomplete="off">
        <input id="cfg-plaatsKleur" type="color" aria-label="Kleur van de plaats" title="Kleur van de plaats">
      </div>
    </div>
    <h3>Kleuren</h3>
    <label class="color-row"><input id="cfg-bakskleur" type="color"><span>Bakskleur</span></label>
    <div id="zone-colors"></div>
    <button id="customize-reset" type="button">Standaardwaarden</button>
  </aside>

  <!-- Volledig scherm, onder het tandwiel; het staat na het Aanpassen-paneel zodat de stylesheet
       het met een broer-selector wegneemt zolang dat paneel open staat (het valt er anders achter) -->
  <button id="fullscreen-toggle" class="icon-button" type="button" aria-label="Volledig scherm" title="Volledig scherm" aria-pressed="false">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <g data-icon="expand">
        <path d="M9.5 4.5H4.5V9.5"/><path d="M14.5 4.5h5v5"/>
        <path d="M19.5 14.5v5h-5"/><path d="M9.5 19.5h-5v-5"/>
      </g>
      <g data-icon="compress" hidden>
        <path d="M4.5 9.5h5v-5"/><path d="M19.5 9.5h-5v-5"/>
        <path d="M14.5 19.5v-5h5"/><path d="M9.5 19.5v-5h-5"/>
      </g>
    </svg>
  </button>

  <!-- the boat controls: a row of icons along the bottom, each opening its own popover -->
  <nav id="controls" aria-label="Bediening">
    <button id="mode-toggle" class="icon-button" type="button" aria-label="Modus" title="Modus" aria-expanded="false" aria-controls="mode-panel">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <g data-mode="zeilen">
          <path d="M12 2.5v15.5"/>
          <path d="M12 5c3.4 2.6 5.4 6.2 6 10H12"/>
          <path d="M4 18h16l-2.2 3H6.2z"/>
        </g>
        <g data-mode="roeien" hidden>
          <path d="M4.2 20.2 14.6 6.4"/>
          <ellipse cx="16.3" cy="4.2" rx="1.9" ry="2.7" transform="rotate(37 16.3 4.2)"/>
          <path d="M19.8 20.2 9.4 6.4"/>
          <ellipse cx="7.7" cy="4.2" rx="1.9" ry="2.7" transform="rotate(-37 7.7 4.2)"/>
        </g>
        <g data-mode="wrikken" hidden>
          <path d="M7.5 13 14.8 4.9"/>
          <ellipse cx="16.2" cy="3.4" rx="1.6" ry="2.2" transform="rotate(42 16.2 3.4)"/>
          <path d="M7.8 14.6c-2 0-3.3 1.1-3.3 2.4s1.3 2.4 3.3 2.4c3.4 0 5-4.8 8.4-4.8 2 0 3.3 1.1 3.3 2.4s-1.3 2.4-3.3 2.4c-3.4 0-5-4.8-8.4-4.8z"/>
        </g>
      </svg>
    </button>
    <div id="mode-panel" class="popover" role="group" aria-label="Modus" hidden>
      <div class="choices">
        <button type="button" data-mode="zeilen" aria-pressed="true">Zeilen</button>
        <button type="button" data-mode="roeien" aria-pressed="false">Roeien</button>
        <button type="button" data-mode="wrikken" aria-pressed="false">Wrikken</button>
      </div>
    </div>

    <button id="wind-toggle" class="icon-button" type="button" aria-label="Wind" title="Wind" aria-expanded="false" aria-controls="wind-panel">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" overflow="visible" aria-hidden="true">
        <!-- a cloud blowing: the cloud sits where the wind comes from, the arrow points where it goes -->
        <g id="wind-needle" transform="rotate(0 12 12)">
          <path d="M7 10.5h10a3.2 3.2 0 0 0 .6-6.35A4.6 4.6 0 0 0 10.2 3.1 2.2 2.2 0 0 0 6.6 4.6 3.1 3.1 0 0 0 7 10.5z"/>
          <path d="M10.6 13v4.6M13.4 13v4.6M8.2 17.6 12 22.4l3.8-4.8"/>
        </g>
      </svg>
    </button>
    <div id="wind-panel" class="popover" role="group" aria-label="Koers ten opzichte van de wind" hidden>
      <div id="course-markers"></div>
      <input id="course" type="range" step="1" value="45" aria-label="Koers ten opzichte van de wind">
      <div class="ticks" aria-hidden="true"></div>
    </div>

    <button id="reef-toggle" class="icon-button" type="button" aria-label="Reven" title="Reven" aria-expanded="false" aria-controls="reef-panel">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 3v12"/>
        <path d="M6 3 17.5 8.5 19 15"/>
        <path d="M3 17.5h18"/>
        <path d="M19.2 19.6a3 3 0 1 1-1-4.4"/>
      </svg>
      <span class="badge" id="reef-count" aria-hidden="true" hidden>0</span>
    </button>
    <div id="reef-panel" class="popover" role="group" aria-label="Reven" hidden>
      <label class="reef"><span>Rif: <b id="reef-value">geen</b></span>
        <input id="reef" type="range" min="0" max="6" step="1" value="0" aria-label="Aantal slagen om de giek"></label>
    </div>

    <button id="rig-toggle" class="icon-button" type="button" aria-label="Tuig" title="Tuig" aria-expanded="false" aria-controls="rig-panel">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M8 3v17"/>
        <path d="M8 16h12"/>
        <path d="M10 13.5 19.5 12"/>
        <path d="m4.5 8 3.5 3.5L11.5 8"/>
      </svg>
    </button>
    <div id="rig-panel" class="popover" role="group" aria-label="Tuig" hidden>
      <div class="choices">
        <button type="button" data-rig="op" aria-pressed="true">Zeilen op</button>
        <button type="button" data-rig="gestreken" aria-pressed="false">Zeilen gestreken</button>
        <button type="button" data-rig="mast" aria-pressed="false">Mast gestreken</button>
      </div>
    </div>

    <button id="oars-toggle" class="icon-button" type="button" aria-label="Riemen" title="Riemen" aria-expanded="false" aria-controls="oars-panel">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M2.6 19 7.9 5.2"/>
        <ellipse cx="8.7" cy="3" rx="1.7" ry="2.4" transform="rotate(21 8.7 3)"/>
        <path d="M10.3 19 15.6 5.2"/>
        <ellipse cx="16.4" cy="3" rx="1.7" ry="2.4" transform="rotate(21 16.4 3)"/>
      </svg>
      <span class="badge" id="oar-count" aria-hidden="true">2</span>
    </button>
    <div id="oars-panel" class="popover" role="group" aria-label="Riemen" hidden>
      <div class="choices">
        <button type="button" data-rowing="naast">2 naast elkaar</button>
        <button type="button" data-rowing="kruis">2 kruislings</button>
        <button type="button" data-rowing="vier">4 riemen</button>
      </div>
    </div>

    <button id="cmd-toggle" class="icon-button" type="button" aria-label="Roeicommando" title="Roeicommando" aria-expanded="false" aria-controls="cmd-panel">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 10v4l3 .6L15 19V5L7 9.4z"/>
        <path d="M18 9.5a3.5 3.5 0 0 1 0 5"/>
        <path d="M7.5 14.8 9 19.5"/>
      </svg>
    </button>
    <div id="cmd-panel" class="popover" role="group" aria-label="Roeicommando" hidden>
      <p class="spoken" id="cmd-spoken" aria-live="polite"></p>
      <div class="choices beide" data-boord="beide"><span class="caption">Beide boorden</span>
        <button type="button" data-commando="slag">Op… slag</button>
        <button type="button" data-commando="over">Riemen… over</button>
        <button type="button" data-commando="op">Riemen… op</button>
        <button type="button" data-commando="geroeid">Riemen… geroeid</button>
      </div>
      <div class="boorden">
        <div class="choices" data-boord="bb"><span class="caption">Bakboord</span>
          <button type="button" data-commando="haal">Haalt op… gelijk</button>
          <button type="button" data-commando="opriemen">Op… riemen</button>
          <button type="button" data-commando="strijk">Strijkt… gelijk</button>
          <button type="button" data-commando="stopaf">Stopt… af</button>
          <button type="button" data-commando="lopen">Riemen… lopen</button>
        </div>
        <div class="choices" data-boord="sb"><span class="caption">Stuurboord</span>
          <button type="button" data-commando="haal">Haalt op… gelijk</button>
          <button type="button" data-commando="opriemen">Op… riemen</button>
          <button type="button" data-commando="strijk">Strijkt… gelijk</button>
          <button type="button" data-commando="stopaf">Stopt… af</button>
          <button type="button" data-commando="lopen">Riemen… lopen</button>
        </div>
      </div>
    </div>
  </nav>

  <!-- the timeline of the procedure that is running (Reven, Tuig): it floats above the control bar,
       and rides over an open popover so the two never cover each other -->
  <div id="procedure" role="group" aria-label="Voortgang van de procedure" hidden>
    <button id="procedure-previous" class="icon-button" type="button" aria-label="Vorige stap" title="Vorige stap">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M7 5.5v13"/>
        <path d="M18.5 6.2 10 12l8.5 5.8z"/>
      </svg>
    </button>
    <button id="procedure-play" class="icon-button" type="button" aria-label="Pauzeren" title="Pauzeren">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <g data-icon="pause"><path d="M9.5 5.5v13"/><path d="M14.5 5.5v13"/></g>
        <g data-icon="play" hidden><path d="M8 5.5 18.5 12 8 18.5z"/></g>
      </svg>
    </button>
    <button id="procedure-next" class="icon-button" type="button" aria-label="Volgende stap" title="Volgende stap">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M17 5.5v13"/>
        <path d="M5.5 6.2 14 12l-8.5 5.8z"/>
      </svg>
    </button>
    <div class="track">
      <div class="head">
        <span class="step" id="procedure-step"></span>
        <span class="caption" id="procedure-name"></span>
      </div>
      <input id="procedure-time" type="range" min="0" max="1" step="0.01" value="0" aria-label="Voortgang">
      <div class="ticks" id="procedure-ticks" aria-hidden="true"></div>
    </div>
  </div>

  <button id="about-toggle" class="icon-button" type="button" aria-label="Over dit model" aria-expanded="false" aria-controls="about" title="Over dit model">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9.2"/>
      <path d="M12 11v5.5"/>
      <path d="M12 7.6v.2"/>
    </svg>
  </button>

  <aside id="about" hidden>
    <header>
      <h2>Over dit model</h2>
      <button id="about-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <p>Gebaseerd op het officiële 3D-model van de lelievlet van Scouting Nederland. Maten en namen
      zijn gecontroleerd aan de hand van het Vlettenboek en de klassenvoorschriften.</p>

    <h3>Bronnen</h3>
    <ul class="links">
      <li><a href="https://www.scouting.nl/bestuur/accommodatie-vloot-en-materiaal/lelieboten" target="_blank" rel="noreferrer">3D-model van de lelievlet</a> — Scouting Nederland, team Lelieschepen</li>
      <li><a href="https://lszw.scouting.nl/images/lelievlet.pdf" target="_blank" rel="noreferrer">Vademecum voor het waterwerk deel 8: De Lelievlet</a> — het Vlettenboek, 8e druk 1988</li>
      <li><a href="https://lszw.scouting.nl/images/LSZW-2025/PDF-files/KLASSENVOORSCHRIFTEN_Lelievlet_v2.pdf" target="_blank" rel="noreferrer">Klassenvoorschriften Nationale Lelievlet Klasse v2.0</a> — geldig vanaf 1 mei 2025</li>
      <li><a href="https://katwijksezeeverkenners.nl/wp-content/uploads/2015/07/cwo_zeil_instructieboek_katwijkse_zeeverkenners.pdf" target="_blank" rel="noreferrer">CWO zeilinstructieboek</a> — Katwijkse Zeeverkenners</li>
      <li><a href="https://activiteitenbank.scouting.nl/uploads/Benamingen_vlet.pdf" target="_blank" rel="noreferrer">Benamingen vlet</a> — Activiteitenbank Scouting Nederland</li>
      <li><a href="https://nl.scoutwiki.org/Lelievlet" target="_blank" rel="noreferrer">Lelievlet</a> — ScoutWiki, met het zeilteken</li>
    </ul>

    <h3>Broncode</h3>
    <p><a href="https://github.com/wiebren/lelievlet" target="_blank" rel="noreferrer">github.com/wiebren/lelievlet</a></p>
  </aside>

  <div id="info" hidden>
    <div class="group" id="info-group"></div>
    <div class="name" id="info-name"></div>
    <div class="note" id="info-note" hidden></div>
    <div class="model" id="info-model" hidden>Modelnummer <b id="info-handle"></b><span class="more" id="info-more"></span></div>
  </div>
  <div id="hover" hidden></div>
  <div id="loading">Model laden…</div>\n</div>\n`;
