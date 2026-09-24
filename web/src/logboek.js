import { unpack } from './config.js';

// The logboek: a star in the bottom left corner with a count, and behind it the entries by name.
// It only keeps the record - nothing here brings anything about - and the star stays out of sight
// until there is something in it.
//
// The entries live in localStorage under one key; like everywhere else the access is wrapped, so
// the viewer works just as well without storage.

const STORE = 'lelievlet.logboek.v1';
const ENTRIES = {
  th: 'IzRYRXyBtsM=',
  rl: 'KSBDXHSL',
  wp: 'PCBBXD6asdK7ECBLZI4=',
  dn: 'LyREWXeAvg==',
  bs: 'KS5IUG2eq97+FA==',
  sv: 'OCJCQmqHt9DtDC1N',
  sp: 'ODFEWXCPstLp',
  sl: 'OC1IUm6EvJftEi1Nb4s=',
  mo: 'JiBDF3GYvMX5DyNYbg==',
  ve: 'MSREW3CbtNr+EmwbM9Ta',
  av: 'Ki9GUmzOr9LpDCNYb4s=',
  zb: 'MTZMVmyKu9juFGxGZZY=',
  nz: 'JSBOX2qUvN73BSI=',
  bi: 'KTNCQHCdvNa7KT9Ga4uP',
};
const KEYS = Object.keys(ENTRIES);

export function initLogboek(ui, { opslaan = true } = {}) {
  const $ = (id) => ui.getElementById(id);
  const toggle = $('log-toggle'); const count = $('log-count');
  const list = $('log-list'); const more = $('log-more');

  let kept = [];
  try {
    const raw = opslaan ? JSON.parse(localStorage.getItem(STORE) ?? 'null') : null;
    if (Array.isArray(raw?.entries)) kept = raw.entries;
  } catch { /* no storage, or it holds something else: start from nothing */ }
  const have = new Set(kept.filter((key) => key in ENTRIES));

  const row = (text) => Object.assign(document.createElement('li'), { textContent: text });
  const show = () => {
    toggle.hidden = have.size === 0;
    count.textContent = String(have.size);
    const rows = KEYS.filter((key) => have.has(key)).map((key) => row(unpack(ENTRIES[key])));
    // under them one faint row for every one still to come, fading away down the list
    const left = KEYS.length - have.size;
    for (let i = 0; i < left; i++) {
      const r = row('· · ·'); r.className = 'nog'; r.style.opacity = (0.5 - i * 0.06).toFixed(2);
      rows.push(r);
    }
    list.replaceChildren(...rows);
    more.hidden = left === 0;
  };
  show();

  /** An entry, the first time: it is written down and the star says one more. */
  const note = (key) => {
    if (!(key in ENTRIES) || have.has(key)) return;
    have.add(key);
    if (opslaan) try { localStorage.setItem(STORE, JSON.stringify({ v: 1, entries: [...have] })); } catch { /* it works without */ }
    show();
  };
  return { note };
}
