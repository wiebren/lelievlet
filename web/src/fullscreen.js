// Volledig scherm: the round button under Aanpassen, the `f` key and handle.fullscreen(). The
// Fullscreen API is asked for the HOST element, so the whole shadow root travels with it and the
// viewer keeps its own layout; with a shadow root it is that host, not anything inside, that
// document.fullscreenElement names. Where element fullscreen is not to be had - iPhone Safari has
// no requestFullscreen on an element at all, an iframe without allow="fullscreen" has it disabled -
// and where the request is refused (it needs a real user gesture), the viewer fills the PAGE
// instead: an attribute on the host that style.css lays over everything, with the page's own
// scrolling locked for as long as it is up.

// what keeps a key to itself; the same guard the arrow keys in main.js use, with a field a page
// could have put in the light DOM around the viewer
const TYPING = 'input:not([type=checkbox]), textarea, select, [contenteditable]:not([contenteditable="false"])';
const FILLING = 'data-lv-vol';              // the attribute the page-filling mode hangs on
const SAVED = 'data-lv-vol-overflow';       // on the html element: the scrolling of the page as it was

/**
 * ui, host, config: as mount() has them; signal, engaged, realTarget and onDestroy likewise.
 * Returns { toggle }: toggle(on) with `on` left out flips it. It gives back the promise of the
 * request, so a caller can wait for it - but only a real click or keypress is ever granted one.
 */
export function initFullscreen({ ui, host, config, signal, engaged, realTarget, onDestroy }) {
  const button = ui.getElementById('fullscreen-toggle');
  if (!config.volledigScherm) {                 // no button, no key, and the handle does nothing
    button.hidden = true;
    return { toggle: () => Promise.resolve() };
  }
  const icons = button.querySelectorAll('[data-icon]');

  // Safari has its own spelling of every one of these, and an old one returns no promise.
  const request = host.requestFullscreen ?? host.webkitRequestFullscreen;
  const leave = document.exitFullscreen ?? document.webkitExitFullscreen;
  const fullscreenElement = () => document.fullscreenElement ?? document.webkitFullscreenElement ?? null;
  const native = Boolean(request) && (document.fullscreenEnabled ?? document.webkitFullscreenEnabled) !== false;

  const isOn = () => fullscreenElement() === host || host.hasAttribute(FILLING);

  /** The button says which way it goes next; the state itself is read back, never remembered. */
  function draw() {
    const on = isOn();
    const label = on ? 'Volledig scherm sluiten' : 'Volledig scherm';
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', label);
    button.title = label;
    for (const icon of icons) icon.toggleAttribute('hidden', (icon.dataset.icon === 'compress') !== on);
  }

  // The fallback: the host lies over the page, which must not scroll away under it. What the page
  // had is given back on the way out. Two viewers on one page know nothing of each other, so the
  // page's own value is parked on the page itself: the first one in locks it and remembers it there,
  // the last one out gives it back - neither of them can leave the page unscrollable behind.
  function fill(on) {
    if (on === host.hasAttribute(FILLING)) return;
    const root = document.documentElement;
    const locked = () => document.querySelector(`[${FILLING}]`);
    if (on) {
      if (!locked()) { root.setAttribute(SAVED, root.style.overflow); root.style.overflow = 'hidden'; }
      host.setAttribute(FILLING, '');
    } else {
      host.removeAttribute(FILLING);
      if (!locked()) { root.style.overflow = root.getAttribute(SAVED) ?? ''; root.removeAttribute(SAVED); }
    }
    draw();
  }

  async function set(on) {
    if (on === isOn()) return;
    if (!on) {
      if (fullscreenElement() === host) await leave.call(document);   // the change event redraws
      fill(false);
      return;
    }
    if (native) {
      try { await request.call(host); return; } catch { /* refused: the page it is, then */ }
    }
    fill(true);
  }

  button.addEventListener('click', () => set(!isOn()));
  // the state follows the browser, which also leaves full screen on Escape, on F11 and on its own
  for (const type of ['fullscreenchange', 'webkitfullscreenchange']) {
    document.addEventListener(type, draw, { signal });
  }

  // `f` toggles while this viewer has the pointer or the focus; Ctrl/Cmd + F stays the page's own
  // search. Escape only has to be caught for the page-filling mode: native full screen ends itself.
  window.addEventListener('keydown', (e) => {
    if (!engaged() || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Escape') { fill(false); return; }
    if (e.key !== 'f' && e.key !== 'F') return;
    if (realTarget(e).closest?.(TYPING)) return;
    set(!isOn());
    e.preventDefault();
  }, { signal });

  onDestroy(() => {
    if (fullscreenElement() === host) leave.call(document);
    fill(false);
  });

  draw();
  return { toggle: (on) => set(on ?? !isOn()) };
}
