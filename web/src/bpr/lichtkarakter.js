// Light characters as they are written on the chart and in BPR bijlage 8: F, Fl, LFl, Q, VQ, Iso,
// Oc and Mo, with a group in brackets and a period in seconds - "Iso 4s", "Q(3) 10s",
// "Q(6)+LFl 15s", "Fl(2) 10s", "Mo(A) 8s". character(text) gives a function of time (s) that says
// whether the light is lit (true) or dark. Timings are the usual ones of the IALA recommendation:
// a flash 0.5 s, a long flash 2 s, quick 60 a minute, very quick 120 a minute.

const FLASH = 0.5;                  // s
const LONG = 2;                     // s: a long flash
const Q = 1; const VQ = 0.5;        // s: the period of one quick, one very quick flash
const MORSE = { A: '.-', U: '..-', D: '-..', K: '-.-', N: '-.' };

/** On/off pieces in seconds, [lit, dark, lit, dark, ...] for one group of the character. */
function pieces(kind, group, period) {
  switch (kind) {
    case 'F': return null;                                               // fixed: always lit
    case 'Iso': return [period / 2, period / 2];
    case 'Oc': return [period * 0.75, period * 0.25];
    case 'Fl': return Array.from({ length: group }, () => [FLASH, 1]).flat();
    case 'LFl': return Array.from({ length: group }, () => [LONG, 1]).flat();
    case 'Q': return Array.from({ length: group }, () => [Q * 0.4, Q * 0.6]).flat();
    case 'VQ': return Array.from({ length: group }, () => [VQ * 0.4, VQ * 0.6]).flat();
    case 'Mo': return [...(MORSE[group] ?? '.-')].flatMap((c, i, all) => [c === '.' ? 0.5 : 1.5, i < all.length - 1 ? 0.5 : 0]);
    default: return null;
  }
}

/**
 * The character as a function of time. Unknown or missing text gives a fixed light. A character
 * without a period (plain "Q") repeats its group; with one, the group is followed by darkness to
 * make the period up.
 */
export function character(text) {
  const src = String(text ?? 'F').trim();
  const period = Number(src.match(/(\d+(?:[.,]\d+)?)\s*s\b/)?.[1]?.replace(',', '.')) || null;
  // the parts joined by "+": Q(6)+LFl is six quick flashes and a long one, as one group
  const parts = src.replace(/\s*\d+(?:[.,]\d+)?\s*s\b/, '').split('+').map((p) => {
    const m = p.trim().match(/^(LFl|Fl|F|VQ|Q|Iso|Oc|Mo)(?:\((\w+)\))?/);
    if (!m) return null;
    const group = m[1] === 'Mo' ? (m[2] ?? 'A') : Number(m[2] ?? 1);
    return pieces(m[1], group, period ?? (m[1] === 'Iso' || m[1] === 'Oc' ? 4 : 0));
  });
  if (!parts.length || parts.some((p) => p === null)) return () => true;
  const seq = parts.flat();
  const busy = seq.reduce((a, b) => a + b, 0);
  const cycle = Math.max(period ?? busy, busy);
  return (t) => {
    let x = ((t % cycle) + cycle) % cycle;
    for (let i = 0; i < seq.length; i++) {
      if (x < seq[i]) return i % 2 === 0;
      x -= seq[i];
    }
    return false;                                                        // the rest of the period is dark
  };
}
