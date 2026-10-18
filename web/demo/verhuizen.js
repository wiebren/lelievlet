// The site moved from wiebren.github.io to scoutvaardig.nl (October 2026). For a while both addresses serve the same
// build, so an app installed from the old one still gets this version - and then moves on, with what it keeps on
// this device (localStorage: the boat, Aanpassen, lessons, quizzes, the logbook): a browser tab at once, the
// installed app (app.html) after asking, as it has to be installed again from the new address. What it keeps goes
// after the #, which the browser never sends to a server, with the # the page had (the boat) behind it; the new
// address takes over only what it does not have yet and puts the # back.
//
// A plain script in the <head> of the app and of the site's pages, not embed.html: a viewer on another site keeps
// the address it was put there with. It runs before the page's module reads the #, and a tab on the old address
// leaves before the viewer is loaded. The app has the dialog (#verhuisd) and the notice (#meegekomen); elsewhere it
// goes without them.
(() => {
  const OUD = 'wiebren.github.io';
  const NIEUW = 'https://scoutvaardig.nl';
  const VOORVOEGSEL = 'lelievlet.';
  const NIET_MEE = new Set(['lelievlet.melder.v1']);   // a name typed for Melden stays where it was typed
  const MERK = '#verhuis=';
  const standalone = ['standalone', 'minimal-ui', 'window-controls-overlay'].some((m) => matchMedia(`(display-mode: ${m})`).matches)
    || navigator.standalone === true;
  const naarBase64 = (tekst) => {
    let bin = '';
    for (const b of new TextEncoder().encode(tekst)) bin += String.fromCharCode(b);
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  };
  const uitBase64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
  const klaar = (f) => (document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', f) : f());

  // the same page on the new address, with what this device keeps; from the installed app with ?installeer,
  // which opens the instructions to install it there
  const nieuwAdres = () => {
    const mee = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(VOORVOEGSEL) && !NIET_MEE.has(key)) mee[key] = localStorage.getItem(key);
      }
    } catch { /* nothing to take along */ }
    const search = standalone ? '?installeer' : location.search;
    return `${NIEUW}${location.pathname}${search}${MERK}${naarBase64(JSON.stringify(mee))}&terug=${encodeURIComponent(location.hash)}`;
  };

  if (location.hostname === OUD) {
    if (!standalone) { location.replace(nieuwAdres()); return; }
    klaar(() => {
      const dialog = document.getElementById('verhuisd');
      if (!dialog) return;
      document.getElementById('verhuisd-later').addEventListener('click', () => dialog.close());
      document.getElementById('verhuisd-naar').addEventListener('click', () => {
        const tab = window.open(nieuwAdres(), '_blank');
        if (tab) tab.opener = null; else location.assign(nieuwAdres());
      });
      dialog.showModal();
    });
    return;
  }

  if (!location.hash.startsWith(MERK)) return;
  const [data, terug = ''] = location.hash.slice(MERK.length).split('&terug=');
  history.replaceState(null, '', location.pathname + location.search + decodeURIComponent(terug));
  let n = 0;
  try {
    for (const [key, value] of Object.entries(JSON.parse(uitBase64(data)))) {
      if (!key.startsWith(VOORVOEGSEL) || NIET_MEE.has(key) || typeof value !== 'string') continue;
      if (localStorage.getItem(key) === null) { localStorage.setItem(key, value); n++; }
    }
  } catch (e) { console.warn('[lelievlet] niets overgenomen van het oude adres:', e); }
  if (n) klaar(() => {
    const melding = document.getElementById('meegekomen');
    if (!melding) return;
    melding.hidden = false;
    document.getElementById('meegekomen-ok').addEventListener('click', () => { melding.hidden = true; });
  });
})();
