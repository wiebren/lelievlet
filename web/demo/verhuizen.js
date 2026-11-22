// The site moved from wiebren.github.io to scoutvaardig.nl (October 2026); GitHub now sends the old address on here.
// An app installed from the old address before that still runs the version that moves (it asks, then opens app.html
// here with ?installeer): what it kept on that device (localStorage: the boat, Aanpassen, lessons, quizzes, the
// logbook) comes along after the #, which the browser never sends to a server, with the # the page had (the boat)
// behind it. This takes over only what this address does not have yet and puts the # back.
//
// A plain script in the <head> of the app, before its module reads the #. The notice (#meegekomen) is in app.html.
(() => {
  const VOORVOEGSEL = 'lelievlet.';
  const NIET_MEE = new Set(['lelievlet.melder.v1']);   // a name typed for Melden stays where it was typed
  const MERK = '#verhuis=';
  if (!location.hash.startsWith(MERK)) return;

  const uitBase64 = (s) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)));
  const [data, terug = ''] = location.hash.slice(MERK.length).split('&terug=');
  history.replaceState(null, '', location.pathname + location.search + decodeURIComponent(terug));
  let n = 0;
  try {
    for (const [key, value] of Object.entries(JSON.parse(uitBase64(data)))) {
      if (!key.startsWith(VOORVOEGSEL) || NIET_MEE.has(key) || typeof value !== 'string') continue;
      if (localStorage.getItem(key) === null) { localStorage.setItem(key, value); n++; }
    }
  } catch (e) { console.warn('[lelievlet] niets overgenomen van het oude adres:', e); }
  if (!n) return;
  const toon = () => {
    const melding = document.getElementById('meegekomen');
    if (!melding) return;
    melding.hidden = false;
    document.getElementById('meegekomen-ok').addEventListener('click', () => { melding.hidden = true; });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', toon); else toon();
})();
