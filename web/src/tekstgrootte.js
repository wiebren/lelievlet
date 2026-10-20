// Tekstgrootte (Aanpassen › Tekst): the text of the panels, cards and buttons a step or two larger, for whoever finds
// it small on a phone - in place of the browser's own zoom, which the viewer does not let happen (style.css,
// touch-action). Every font size in style.css is multiplied by --tekst, set here on the viewer's box; remembered in
// this browser, 'normaal' by leaving nothing behind.

const STORE = 'lelievlet.tekst.v1';
const SIZES = { normaal: 1, groter: 1.15, grootst: 1.3 };

export function initTekstgrootte(ui, wrap, { opslaan }) {
  const buttons = [...ui.getElementById('tekstgrootte').querySelectorAll('button')];
  const set = (size, remember) => {
    if (!Object.hasOwn(SIZES, size)) size = 'normaal';
    wrap.style.setProperty('--tekst', SIZES[size]);
    for (const b of buttons) b.setAttribute('aria-checked', String(b.dataset.tekst === size));
    if (remember && opslaan) {
      try { if (size === 'normaal') localStorage.removeItem(STORE); else localStorage.setItem(STORE, size); } catch { /* private mode */ }
    }
  };
  let saved = null;
  if (opslaan) try { saved = localStorage.getItem(STORE); } catch { /* private mode */ }
  set(saved, false);
  for (const b of buttons) b.addEventListener('click', () => set(b.dataset.tekst, true));
}
