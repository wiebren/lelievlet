// The markup of one viewer: what used to be the body of index.html, unchanged, wrapped in the one
// element everything is laid out against. create() puts this in a shadow root of its own, so the
// ids below live in that root alone and two viewers on one page never see each other’s.

export const TEMPLATE = `\n<div class="lv" part="viewer">\n
  <canvas id="scene"></canvas>

  <!-- Zoeken: the parts of the boat, and the signs, marks, signals and flags along the water (built in bpr/zoeken.js) -->
  <aside id="parts" hidden>
    <header>
      <button id="zoek-terug" type="button" class="link-button zoek-terug" aria-label="Terug naar Zoeken" title="Terug naar Zoeken" hidden>‹</button>
      <h2 id="zoek-titel">Zoeken</h2>
      <button id="parts-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <!-- the start: one field over everything, and what there is to look through; typing, the results take the tiles' place -->
    <div id="zoek-home" class="zoek-pane">
      <input id="zoek-alles" type="search" class="zoek-veld" autocomplete="off" placeholder="Zoek onderdeel, bord, ton, sein, vlag, schip of geluidssein…" aria-label="Zoek in alles">
      <div class="zoek-tegels" id="zoek-tegels">
        <button type="button" class="zoek-tegel" data-cat="onderdelen"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 16.5h17l-2.2 3.5H5.7z"/><path d="M12 3.5v13"/><path d="M12 4.5l6.5 10H12"/><path d="M12 7l-4.5 7.5H12"/></svg><span>Onderdelen</span></button>
        <button type="button" class="zoek-tegel" data-cat="borden"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.5" y="3" width="13" height="10.5" rx="1.2"/><path d="M8.5 6l7 4.5"/><path d="M12 13.5V21"/></svg><span>Borden</span></button>
        <button type="button" class="zoek-tegel" data-cat="markeringen"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8.5 17.5L12 4.5l3.5 13z"/><path d="M3.5 20c2.5-1.6 5.5-1.6 8.5 0s6 1.6 8.5 0"/></svg><span>Markeringen</span></button>
        <button type="button" class="zoek-tegel" data-cat="seinen"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="8" y="2.5" width="8" height="14" rx="2"/><circle cx="12" cy="6.5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><path d="M12 16.5V21"/></svg><span>Seinen</span></button>
        <button type="button" class="zoek-tegel" data-cat="lichten"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 17h17l-2 3.5H5.5z"/><path d="M12 17V8"/><circle cx="12" cy="6.2" r="1.6"/><circle cx="6.5" cy="13.6" r="1.4"/><circle cx="17.5" cy="13.6" r="1.4"/></svg><span>Lichten</span></button>
        <button type="button" class="zoek-tegel" data-cat="dagmerken"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="5.5" r="2.6"/><path d="M8.8 10h6.4L12 15.5z"/><path d="M12 15.5V21"/><path d="M8 21h8"/></svg><span>Dagmerken</span></button>
        <button type="button" class="zoek-tegel" data-cat="vlaggen"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 21V3.5"/><path d="M6 4.5h11.5l-3 4 3 4H6"/></svg><span>Vlaggen</span></button>
        <button type="button" class="zoek-tegel" data-cat="geluiden"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10v4h3l5 4V6L7 10z"/><path d="M15.5 9.5a3.5 3.5 0 0 1 0 5"/><path d="M18 7a7 7 0 0 1 0 10"/></svg><span>Geluidsseinen</span></button>
      </div>
      <div class="zoek-scroll" id="zoek-resultaten" hidden></div>
    </div>
    <div id="zoek-onderdelen" class="zoek-pane" hidden>
      <input id="parts-search" type="search" autocomplete="off" placeholder="Zoek onderdeel…" aria-label="Zoek onderdeel">
      <p class="parts-all"><button id="parts-show-all" type="button" class="link-button">Alles tonen</button>
        <button id="parts-hide-all" type="button" class="link-button">Alles verbergen</button></p>
      <div id="parts-list"></div>
      <p class="hint" id="parts-empty" hidden>Geen onderdeel gevonden.</p>
    </div>
    <div id="zoek-borden" class="zoek-pane" hidden></div>
    <div id="zoek-markeringen" class="zoek-pane" hidden></div>
    <div id="zoek-seinen" class="zoek-pane" hidden></div>
    <div id="zoek-vlaggen" class="zoek-pane" hidden></div>
    <div id="zoek-lichten" class="zoek-pane" hidden></div>
    <div id="zoek-dagmerken" class="zoek-pane" hidden></div>
    <div id="zoek-geluiden" class="zoek-pane" hidden></div>
  </aside>


  <!-- Oefenen: the start panel of the quiz; the card of a running round is built in quiz.js -->

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
    <div id="cfg-modus" class="segmented" role="radiogroup" aria-label="Kleuren">
      <button type="button" role="radio" data-modus="bekend" aria-checked="true">Bekend</button>
      <button type="button" role="radio" data-modus="eigen" aria-checked="false">Eigen</button>
    </div>
    <div id="cfg-bekend">
      <input id="cfg-zoek" class="zoek-veld" type="search" autocomplete="off" placeholder="Zoek groep, plaats of zeilnummer…" aria-label="Zoek groep, plaats of zeilnummer">
      <div id="cfg-groepen"></div>
      <p id="cfg-geen" class="hint" hidden></p>
      <button id="cfg-melden" type="button">Kleuren van je groep melden</button>
    </div>
    <div id="cfg-eigen" hidden>
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
    <label class="sail-row"><span>Zeilen</span>
      <input id="cfg-zeilkleur" type="range" min="0" max="100" step="1" aria-label="Kleur van de zeilen, van wit tot donkerbruin"></label>
    <div id="zone-colors">
      <label class="color-row"><input id="cfg-bakskleur" type="color"><span>Bakskleur</span></label>
    </div>
    <button id="customize-reset" type="button">Standaardwaarden</button>
    </div>
    <h3>Animatie</h3>
    <label class="speed"><span>Snelheid</span>
      <input id="speed" type="range" min="0.25" max="2" step="0.05" value="1" aria-label="Snelheid van de animaties"></label>
    <p class="hint">Pijltjes: verplaatsen · Shift + pijltjes: draaien · + / −: zoomen · Scrollen: inzoomen op de muisaanwijzer</p>
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

  <!-- Melden, onder Volledig scherm: wat er niet klopt, met de toestand van de viewer (feedback.js) -->
  <button id="feedback-toggle" class="icon-button" type="button" aria-label="Info en melden" title="Info, handleiding en melden" aria-expanded="false" aria-controls="feedback">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 11v5.5"/><path d="M12 7.6v.1"/>
    </svg>
  </button>

  <aside id="feedback" hidden>
    <header>
      <h2 id="feedback-title">Lelievlet 3D</h2>
      <button id="feedback-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <div id="feedback-body"></div>
  </aside>

  <!-- the boat controls: a column of icons at the top left, each opening its own popover beside it -->
  <nav id="controls" aria-label="Bediening">
    <!-- Boot: the mode, the course against the wind and the riemen, in one panel; its icon shows the mode -->
    <button id="boat-toggle" class="icon-button" type="button" aria-label="Boot" title="Boot" aria-expanded="false" aria-controls="boat-panel">
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
    <div id="boat-panel" class="popover" role="group" aria-label="Boot" hidden>
      <div class="popover-head"><span class="caption">Modus</span><button type="button" class="link-button popover-close" aria-label="Sluiten">Sluiten</button></div>
      <div id="mode-panel">
        <div class="choices row">
        <button type="button" data-mode="zeilen" aria-pressed="true">Zeilen</button>
        <button type="button" data-mode="roeien" aria-pressed="false">Roeien</button>
        <button type="button" data-mode="wrikken" aria-pressed="false">Wrikken</button>
      </div>
      </div>
      <div id="wind-section">
        <span class="caption">Wind</span>
        <!-- the windroos: the boat in the middle, bow up; the wind is dragged round her, the courses named round the ring -->
        <div id="wind-panel" role="group" aria-label="Koers ten opzichte van de wind">
          <div id="windroos" role="slider" tabindex="0" aria-label="Waar de wind vandaan komt" aria-valuemin="-180" aria-valuemax="180">
            <svg viewBox="-100 -100 200 200" aria-hidden="true">
              <path id="windroos-gap" class="gap"/>
              <circle class="ring" r="72"/>
              <g id="windroos-ticks"></g>
              <path class="boot" d="M0,-34 C9,-26 12,-6 11,14 C10.5,24 8,30 0,31 C-8,30 -10.5,24 -11,14 C-12,-6 -9,-26 0,-34 Z"/>
              <path class="mast" d="M0,-14 v0.1"/>
              <g id="windroos-wind"><line class="pijl" x1="0" y1="-72" x2="0" y2="-44"/><path class="pijlkop" d="M-6,-50 L0,-40 L6,-50"/><circle class="greep" cy="-72" r="9"/></g>
            </svg>
            <div id="course-markers"></div>
          </div>
          <input id="course" type="range" step="1" value="45" hidden>
        </div>
      </div>
      <div id="oars-section">
        <span class="caption">Riemen</span>
        <div id="oars-panel">
          <div class="choices row">
        <button type="button" data-rowing="naast">2 naast elkaar</button>
        <button type="button" data-rowing="kruis">2 kruislings</button>
        <button type="button" data-rowing="vier">4 riemen</button>
      </div>
        </div>
      </div>
    </div>





    <!-- Oefenen: first what to practise, then its own panel - Manoeuvres (handelingen.js),
         Onderdelen (quiz.js) or Verkeerstekens (bpr/tekenquiz.js) -->
    <button id="learn-toggle" class="icon-button" type="button" aria-label="Oefenen" title="Oefenen" aria-expanded="false" aria-controls="learn-panel" disabled>
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 4 2.5 8.2 12 12.4l9.5-4.2z"/>
      <path d="M6.6 10.2v4.4c0 1.6 2.4 2.9 5.4 2.9s5.4-1.3 5.4-2.9v-4.4"/>
      <path d="M21.5 8.2v4.6"/>
    </svg>
    </button>
    <div id="learn-panel" class="popover" role="group" aria-label="Oefenen" hidden>
      <div class="popover-head"><span class="caption">Oefenen</span><button type="button" class="link-button popover-close" aria-label="Sluiten">Sluiten</button></div>
      <div class="choices row" id="learn-kind">
        <button type="button" data-learn="manoeuvres" id="learn-manoeuvres" aria-pressed="true">Manoeuvres</button>
        <button type="button" data-learn="onderdelen" aria-pressed="false">Onderdelen</button>
        <button type="button" data-learn="verkeerstekens" aria-pressed="false">Verkeerstekens</button>
      </div>
      <div id="ops-panel" class="learn-section">
        <div class="ops">
        <div class="segmented groups" id="ops-groups" role="radiogroup" aria-label="Soort handeling"></div>
        <div class="kinds" id="ops-list" role="radiogroup" aria-label="Handeling"></div>
        <div class="option" id="ops-turns-row" hidden>
          <span>Slagen</span>
          <div class="segmented" id="ops-turns" role="radiogroup" aria-label="Aantal slagen om de giek"></div>
        </div>
        <div class="go">
          <button id="ops-bekijken" type="button">Bekijken</button>
          <button id="ops-oefenen" type="button" class="primary">Oefenen</button>
        </div>
      </div>
      </div>
      <div id="quiz" class="learn-section" hidden>
    <div class="kinds" id="quiz-kind" role="radiogroup" aria-label="Soort oefening">
      <button type="button" role="radio" data-kind="aanwijzen" aria-checked="true"><b>Aanwijzen</b><span>Zoek het onderdeel in de boot</span></button>
      <button type="button" role="radio" data-kind="benoemen" aria-checked="false"><b>Benoemen</b><span>Kies de goede naam uit vier</span></button>
      <button type="button" role="radio" data-kind="kies" aria-checked="false"><b>Kies het onderdeel</b><span>Vier onderdelen lichten op</span></button>
      <button type="button" role="radio" data-kind="typen" aria-checked="false"><b>Typen</b><span>Schrijf de naam zelf op</span></button>
      <button type="button" role="radio" data-kind="gemengd" aria-checked="false"><b>Gemengd</b><span>Alles door elkaar</span></button>
    </div>
    <div class="option">
      <span>Vragen</span>
      <div class="segmented" id="quiz-length" role="radiogroup" aria-label="Aantal vragen">
        <button type="button" role="radio" data-length="10" aria-checked="true">10</button>
        <button type="button" role="radio" data-length="20" aria-checked="false">20</button>
        <button type="button" role="radio" data-length="alles" aria-checked="false">Alles</button>
      </div>
    </div>
    <div class="option" id="quiz-discipline-row" hidden>
      <span>Diploma</span>
      <div class="segmented" id="quiz-discipline" role="radiogroup" aria-label="Diploma">
        <button type="button" role="radio" data-discipline="roeien" aria-checked="false">Roeien</button>
        <button type="button" role="radio" data-discipline="zeilen" aria-checked="true">Zeilen</button>
      </div>
    </div>
    <div class="option" id="quiz-level-row" hidden>
      <span>Niveau</span>
      <div class="segmented" id="quiz-level" role="radiogroup" aria-label="Niveau zeilen">
        <button type="button" role="radio" data-level="1" aria-checked="false">I</button>
        <button type="button" role="radio" data-level="2" aria-checked="false">II</button>
        <button type="button" role="radio" data-level="3" aria-checked="true">III</button>
      </div>
    </div>
    <p class="hint warning" id="quiz-warning" hidden></p>
    <button id="quiz-start" type="button" class="primary">Start</button>
    <button id="quiz-wrong" type="button" hidden>Oefen je fouten</button>
    <footer>
      <span id="quiz-total"></span>
      <button id="quiz-clear" type="button" class="link-button">Wissen</button>
      <span id="quiz-clear-confirm" hidden>Score wissen?
        <button id="quiz-clear-yes" type="button" class="link-button">Ja</button>
        <button id="quiz-clear-no" type="button" class="link-button">Nee</button>
      </span>
      <button id="quiz-tables" type="button" class="link-button" hidden>Tabellen</button>
    </footer>
      </div>
      <div id="teken-quiz" class="learn-section" hidden>
    <div class="segmented soort" id="teken-soort" role="radiogroup" aria-label="Welke tekens">
        <button type="button" role="radio" data-soort="alles" aria-checked="true">Alles</button>
        <button type="button" role="radio" data-soort="borden" aria-checked="false">Borden</button>
        <button type="button" role="radio" data-soort="tonnen" aria-checked="false">Tonnen</button>
        <button type="button" role="radio" data-soort="seinen" aria-checked="false">Seinen</button>
    </div>
    <div class="kinds" id="teken-kind" role="radiogroup" aria-label="Soort oefening">
      <button type="button" role="radio" data-kind="zien" aria-checked="true"><b>Wat zie je?</b><span>Hoe het heet en wat je moet doen</span></button>
      <button type="button" role="radio" data-kind="herkennen" aria-checked="false"><b>Welk teken?</b><span>Kies het plaatje bij de vraag</span></button>
      <button type="button" role="radio" data-kind="water" aria-checked="false"><b>Op het water</b><span>Kijk vanaf het roer</span></button>
      <button type="button" role="radio" data-kind="gemengd" aria-checked="false"><b>Gemengd</b><span>Alles door elkaar</span></button>
    </div>
    <div class="option">
      <span>Vragen</span>
      <div class="segmented" id="teken-length" role="radiogroup" aria-label="Aantal vragen">
        <button type="button" role="radio" data-length="10" aria-checked="true">10</button>
        <button type="button" role="radio" data-length="20" aria-checked="false">20</button>
        <button type="button" role="radio" data-length="alles" aria-checked="false">Alles</button>
      </div>
    </div>
    <button id="teken-start" type="button" class="primary">Start</button>
    <button id="teken-wrong" type="button" hidden>Oefen je fouten</button>
    <footer>
      <span id="teken-total"></span>
      <button id="teken-clear" type="button" class="link-button">Wissen</button>
      <span id="teken-clear-confirm" hidden>Score wissen?
        <button id="teken-clear-yes" type="button" class="link-button">Ja</button>
        <button id="teken-clear-no" type="button" class="link-button">Nee</button>
      </span>
    </footer>
      </div>
    </div>

    <button id="cmd-toggle" class="icon-button" type="button" aria-label="Roeicommando" title="Roeicommando" aria-expanded="false" aria-controls="cmd-panel" hidden>
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M4 10v4l3 .6L15 19V5L7 9.4z"/>
        <path d="M18 9.5a3.5 3.5 0 0 1 0 5"/>
        <path d="M7.5 14.8 9 19.5"/>
      </svg>
    </button>
  </nav>

  <!-- Roeicommando: a small card along the foot of the viewer, two steps deep (modes.js). The main
       row calls to the whole boat: Haalt op (both boorden ready for a stroke ahead), Door roeien op
       slag (stroke after stroke) and Gelijk (one stroke, each boord the way it was told). Bakboord,
       Beide boorden and Stuurboord open what a boord can be told: riemen op, stopt af, strijkt (the
       next stroke goes astern), riemen lopen, riemen geroeid. It stays open while it is used. -->
  <div id="cmd-panel" class="cmd-card" role="group" aria-label="Roeicommando" hidden>
    <div class="cmd-head">
      <span class="name">Roeicommando</span>
      <span class="spoken" id="cmd-spoken" aria-live="polite"></span>
      <button type="button" class="stop" id="cmd-close" aria-label="Sluiten" title="Sluiten">×</button>
    </div>
    <div data-panel="main">
      <div class="pads">
        <button type="button" data-side="bb"><b>Bakboord</b><span data-state="bb"></span></button>
        <button type="button" data-side="beide"><b>Beide boorden</b><span data-state="beide"></span></button>
        <button type="button" data-side="sb"><b>Stuurboord</b><span data-state="sb"></span></button>
        <button type="button" data-call="haalop" data-hint="naar voren buigen met gestrekte armen, de bladen voor: klaar voor de eerste slag"><b>Haalt op</b></button>
        <button type="button" data-call="slag" data-hint="slag na slag, elk boord dat klaar is of roeit, in zijn eigen richting"><b>Door roeien op slag</b></button>
        <button type="button" data-call="gelijk" data-hint="één slag van elk boord dat klaar is of roeit, in zijn eigen richting"><b>Gelijk</b></button>
      </div>
    </div>
    <div data-panel="side" hidden>
      <div class="cmd-sub">
        <button type="button" class="back" id="cmd-back" aria-label="Terug" title="Terug">‹</button>
        <b id="cmd-side-name">Bakboord</b>
      </div>
      <div class="pads orders">
        <button type="button" data-order="toe" data-hint="de riem rustig in de dol leggen: rust"><b>Riemen toe</b></button>
        <button type="button" data-order="opriemen" data-hint="haaks op de boot, evenwijdig aan het water, de bladen verticaal"><b>Op riemen</b></button>
        <button type="button" data-order="stopaf" data-hint="de bladen verticaal in het water: de vaart eruit"><b>Stopt af</b></button>
        <button type="button" data-order="strijk" data-hint="achterover zitten, klaar om achteruit te roeien"><b>Strijkt</b></button>
        <button type="button" data-order="lopen" data-hint="de riemen langs de boot naar achteren, boven het water"><b>Riemen lopen</b></button>
        <button type="button" data-order="op" data-hint="de riemen rechtop tussen de voeten"><b>Riemen op</b></button>
        <button type="button" data-order="geroeid" data-hint="de riemen netjes binnen neerleggen"><b>Riemen geroeid</b></button>
      </div>
    </div>
  </div>

  <!-- the timeline of the procedure that is running (Reven, Zeilen, Mast): it floats at the foot of the
       viewer, in the middle; while a run of an operation is watched it goes into the card (handelingen.js) -->
  <div id="procedure" role="group" aria-label="Stappen van de procedure" hidden>
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
      <input id="procedure-time" type="range" min="0" max="1" step="0.01" value="0" aria-label="Plaats in de procedure">
      <div class="ticks" id="procedure-ticks" aria-hidden="true"></div>
    </div>
  </div>

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

  <!-- Updates: per date what changed (updates.js), opened from Melden as Over dit model is -->
  <aside id="updates" hidden>
    <header>
      <h2>Updates</h2>
      <button id="updates-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <div id="updates-list"></div>
  </aside>

  <!-- debug.toestand: where the viewer is, as the configuration to start there -->
  <button id="toestand-toggle" class="icon-button" type="button" aria-label="Toestand" aria-expanded="false" aria-controls="toestand" title="Toestand" hidden>
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M8.5 4.5c-2 0-2.5 1-2.5 2.6v2.3c0 1.3-.7 2.1-2 2.6 1.3.5 2 1.3 2 2.6v2.3c0 1.6.5 2.6 2.5 2.6"/>
      <path d="M15.5 4.5c2 0 2.5 1 2.5 2.6v2.3c0 1.3.7 2.1 2 2.6-1.3.5-2 1.3-2 2.6v2.3c0 1.6-.5 2.6-2.5 2.6"/>
    </svg>
  </button>

  <!-- not installed: the app one tap away -->
  <button id="app-install-toggle" class="icon-button" type="button" aria-label="Installeer als app" title="Installeer als app" hidden>
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <rect x="6.5" y="2.5" width="11" height="19" rx="2"/>
      <path d="M12 7.5v7M9 11.5l3 3 3-3M10.5 18.5h3"/>
    </svg>
  </button>

  <aside id="toestand" hidden>
    <header>
      <h2>Toestand</h2>
      <button id="toestand-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <p class="hint">Zo begint een viewer hier: geef dit mee aan <code>create()</code>.</p>
    <pre id="toestand-json"></pre>
    <button id="toestand-copy" type="button">Kopieer als JSON</button>
  </aside>

  <!-- the logboek: out of sight until there is an entry in it -->
  <button id="log-toggle" class="icon-button" type="button" aria-label="Gevonden" aria-expanded="false" aria-controls="logboek" title="Gevonden" hidden>
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 3.6 14.6 9l5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.9 9.4 9z"/>
    </svg>
    <span class="badge" id="log-count" aria-hidden="true">0</span>
  </button>

  <aside id="logboek" hidden>
    <header>
      <h2>Gevonden</h2>
      <button id="log-close" type="button" class="link-button" aria-label="Sluiten">Sluiten</button>
    </header>
    <ul id="log-list"></ul>
    <p class="hint" id="log-more" hidden>Nog meer te vinden…</p>
  </aside>

  <!-- the part card, in the bottom right corner: with nothing selected only its search button, which
       opens Zoeken above it -->
  <div id="info" class="leeg">
    <button id="parts-toggle" class="info-search" type="button" aria-label="Zoeken: onderdelen, borden, markeringen, seinen, vlaggen, lichten, dagmerken en geluidsseinen" aria-expanded="false" aria-controls="parts" title="Zoeken">
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/>
      </svg>
    </button>
    <div class="body">
      <div class="group" id="info-group"></div>
      <div class="name" id="info-name"></div>
      <div class="note" id="info-note" hidden></div>
      <div class="model" id="info-model" hidden>Modelnummer <b id="info-handle"></b><span class="more" id="info-more"></span></div>
    </div>
  </div>
  <div id="hover" hidden></div>
  <div id="loading">Model laden…</div>\n</div>\n`;
