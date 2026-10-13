// The address of the page as a way in: what is open in the viewer - a lesson on its onderwerp, a quiz, a manoeuvre,
// a page or a card of Zoeken, a part - stands after the ? and opens there again. Written only where the viewer has
// the page to itself (config `adres`: the app page), with replaceState: no step back in the history for every page
// turned. The # stays as it is: on the app page it holds the boat.
//
//   ?weer=beaufort          a lesson, on an onderwerp (its id; without one at the first)
//   ?voorrangquiz           a quiz on a lesson's card
//   ?leren=manoeuvres       Leren, on Lessen, Manoeuvres or Quiz
//   ?quiz=verkeerstekens    Leren › Quiz, on that one
//   ?manoeuvre=overstag     the card of a manoeuvre
//   ?zoeken=borden/A.1      Zoeken: its start page (?zoeken), a page, a card on that page
//   ?onderdeel=giek         a part of the boat, picked
//   ?over, ?updates         those pages

/** The keys of the address that are not a lesson's. */
export const SLEUTELS = ['leren', 'quiz', 'manoeuvre', 'zoeken', 'onderdeel', 'over', 'updates'];

/** What the address asks for: the first of `keys` (in their order) it has, as [key, value], or null. */
export function lees(keys, search = location.search) {
  const asked = new URLSearchParams(search);
  const key = keys.find((k) => asked.has(k));
  return key ? [key, asked.get(key)] : null;
}

/**
 * Put [key, value] in the address (null: none), in place of whatever of `keys` stood there; what else the page
 * has after the ? stays. A value reads as it is, a / in it too.
 */
export function zet(entry, keys) {
  const naam = (p) => { try { return decodeURIComponent(p.split('=')[0]); } catch { return p.split('=')[0]; } };
  const rest = location.search.slice(1).split('&').filter((p) => p && !keys.includes(naam(p)));
  const [key, value] = entry && keys.includes(entry[0]) ? entry : [];
  if (key) rest.unshift(value ? `${key}=${encodeURIComponent(value).replace(/%2F/g, '/')}` : key);
  const search = rest.length ? `?${rest.join('&')}` : '';
  if (search === location.search) return;
  try { history.replaceState(history.state, '', location.pathname + search + location.hash); } catch { /* a page that will not have it */ }
}
