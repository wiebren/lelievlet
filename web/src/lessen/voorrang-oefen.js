// Alles op een rij, in Voorrang (lessen/voorrang.js): situaties to practise on, made here from the rules rather than
// written out one by one, and sorted makkelijk / normaal / moeilijk by the rule that decides them. The boats are
// A, B (and C): one of them is the lelievlet - sailing or rowing - the others come from Zoeken › Lichten. The rules
// are those of the lesson (Sint Maarten Kielboot III § 4.3, BPR 6.04 to 6.17), in its order:
//
//   oplopen: the oploper wijkt;
//   then the stuurboordwal (only where the vaarwater has banks): the one that keeps it goes first;
//   then groot voor klein; then zeil voor spierkracht voor motor;
//   then between zeilschepen: wind over stuurboord goes first, and with the wind on the same side loef wijkt voor lij;
//   and between gelijke schepen: crossing, the one from stuurboord goes first; head on, both go to stuurboord.
//
// Each situatie is one for lessen/voorrang-pad.js (boten: hers first) with letters, antwoord and regel added; with
// three boats the antwoord is their order ('CAB': C first, then A, then B).

import { C, T, LANG, SNEL } from './voorrang-pad.js';

const NAAM = { zeil: 'een zeilschip', spier: 'een schip op spierkracht', motor: 'een motorschip', groot: 'een groot schip' };
export const SOORT = { zeil: 'zeilboot', spier: 'roeiboot', motor: 'motorboot', groot: 'groot schip' };
const RANG = { zeil: 3, spier: 2, motor: 1 };
const KORT = { zeil: 'zeil', spier: 'spierkracht', motor: 'motor' };
const KOERS = [45, 70, 90, 120, 150, -45, -70, -90, -120, -150];        // hers, off the wind: + over stuurboord
const RICHTING = [60, 90, 120, -60, -90, -120, 180, 0];                  // the other's heading, from her bow

const hoek = (a) => ((a + 540) % 360) - 180;                             // degrees into -180..180
const rad = (d) => d * Math.PI / 180;

// The wind on a zeilschip heading kop (degrees from her bow), with her koers: + over its stuurboord
const wind = (koers, kop) => hoek(koers - kop);
// it can sail that way - and not plat voor de wind, where no one can tell over which side the wind comes in
const kan = (koers, b) => b.soort !== 'zeil' || (Math.abs(wind(koers, b.kop)) >= 45 && Math.abs(wind(koers, b.kop)) < 170);

// What kind of meeting two boats have. Oplopen as BPR 6.01 lid 1b has it: the one comes up from more than 22°30'
// abaft the other's beam (112,5° off its bow, seen from where they are a little before they meet)
const peiling = (van, naar) => Math.abs(hoek(Math.atan2(naar.z - van.z, naar.x - van.x) * 180 / Math.PI - van.kop));
function ontmoeting(p, q) {
  if (peiling(p, q) > 112.5 || peiling(q, p) > 112.5) return 'oplopen';
  return Math.abs(hoek(q.kop - p.kop)) > 145 ? 'tegengesteld' : 'kruisend';
}
const ONTMOETING = { oplopen: 'Oplopen', tegengesteld: 'Tegengestelde koersen', kruisend: 'Kruisende koersen' };

// Who of p and q goes first: { wie: p | q | 'beide', regel, tekst(letter) }; p and q are { soort, kop, x, z (a little
// before they meet), wal }
function voorrang(p, q, koers, metWal) {
  const soort = ontmoeting(p, q);
  const L = (b) => b.letter;
  if (soort === 'oplopen') {
    // the oploper is the one that comes up from behind the other
    const [o, v] = peiling(p, q) > 112.5 ? [q, p] : [p, q];
    return { wie: v, regel: 'oplopen', tekst: () => `${L(o)} loopt ${L(v)} op: de oploper wijkt. ${L(v)} gaat voor.` };
  }
  if (metWal && p.wal !== q.wal) {
    const [w, n] = p.wal ? [p, q] : [q, p];
    return { wie: w, regel: 'wal', tekst: () => `${L(w)} houdt de stuurboordzijde van het vaarwater, ${L(n)} niet. De stuurboordwal gaat voor de andere regels: ${L(w)} gaat voor.` };
  }
  if ((p.soort === 'groot') !== (q.soort === 'groot')) {
    const [g, k] = p.soort === 'groot' ? [p, q] : [q, p];
    return { wie: g, regel: 'groot', tekst: () => `${L(g)} is ${NAAM.groot}, ${L(k)} ${NAAM[k.soort]}: groot gaat voor klein. ${L(g)} gaat voor.` };
  }
  if (p.soort !== q.soort) {
    const [h, l] = RANG[p.soort] > RANG[q.soort] ? [p, q] : [q, p];
    return { wie: h, regel: `${h.soort}-${l.soort}`, tekst: () => `${L(h)} is ${NAAM[h.soort]}, ${L(l)} ${NAAM[l.soort]}: ${KORT[h.soort]} gaat voor ${KORT[l.soort]}. ${L(h)} gaat voor.` };
  }
  if (p.soort === 'zeil') {
    const kp = wind(koers, p.kop) > 0; const kq = wind(koers, q.kop) > 0;
    if (kp !== kq) {
      const [s, b] = kp ? [p, q] : [q, p];
      return { wie: s, regel: 'boeg', tekst: () => `${L(s)} heeft de wind over stuurboord, ${L(b)} over bakboord: ${L(s)} gaat voor.` };
    }
    // the one further up to windward is to loef
    const w = [Math.cos(rad(koers)), Math.sin(rad(koers))];
    const [loef, lij] = p.x * w[0] + p.z * w[1] > q.x * w[0] + q.z * w[1] ? [p, q] : [q, p];
    return { wie: lij, regel: 'loef', tekst: () => `Allebei de wind over ${kp ? 'stuurboord' : 'bakboord'}: loef wijkt voor lij. ${L(loef)} ligt aan loef en wijkt; ${L(lij)} gaat voor.` };
  }
  if (soort === 'tegengesteld') return { wie: 'beide', regel: 'gelijk-tegen', tekst: () => `${L(p)} en ${L(q)} zijn gelijke schepen op tegengestelde koersen: allebei naar stuurboord, bakboord langs bakboord.` };
  // crossing, the one from stuurboord: q on p's stuurboord side, or the other way round
  const zq = -Math.sin(rad(p.kop)) * (q.x - p.x) + Math.cos(rad(p.kop)) * (q.z - p.z);
  const [s, b] = zq > 0 ? [q, p] : [p, q];
  return { wie: s, regel: 'gelijk-kruis', tekst: () => `${L(s)} en ${L(b)} zijn gelijke schepen op kruisende koersen: ${L(s)} komt van stuurboord en gaat voor.` };
}

// How hard: the rule that decides it
const NIVEAU = {
  oplopen: 'makkelijk', 'zeil-motor': 'makkelijk', 'spier-motor': 'makkelijk',
  'zeil-spier': 'normaal', groot: 'normaal', boeg: 'normaal', 'gelijk-tegen': 'normaal', 'gelijk-kruis': 'normaal',
  loef: 'moeilijk', wal: 'moeilijk',
};

// A boat of a situatie, a little before they meet (for the rules) and as lessen/voorrang-pad.js takes it: its middle
// at mid at time T
function boot(soort, kop, mid, v) {
  const d = [Math.cos(rad(kop)), Math.sin(rad(kop))]; const half = (LANG[soort] ?? 6) / 2;
  return {
    soort, kop, v,
    x: mid[0] - d[0] * v * 3, z: mid[1] - d[1] * v * 3,
    pad: { soort, richting: kop, v, treffen: [mid[0] - d[0] * half, mid[1] - d[1] * half] },
  };
}
const haarV = (soort) => (soort === 'spier' ? 1 : 1.4);
const haarBoot = (soort) => ({ soort, kop: 0, v: haarV(soort), x: C - haarV(soort) * 3, z: 0, haar: true });

// letters for n boats, shuffled by the number of the situatie so that she is not always A
const PERMS = { 2: [[0, 1], [1, 0]], 3: [[0, 1, 2], [1, 2, 0], [2, 0, 1], [0, 2, 1], [1, 0, 2], [2, 1, 0]] };
const letters = (n, i) => PERMS[n][(i * 7 + 3) % PERMS[n].length].map((k) => 'ABC'[k]);

function situatie(niveau, koers, jij, boten, wal, beslist, nr) {
  const ls = letters(boten.length, nr);
  boten.forEach((b, i) => { b.letter = ls[i]; });
  const regels = beslist(boten);
  const wie = regels.wie;
  return {
    naam: `${niveau} ${nr}`, niveau, koers, jij, wal,
    boten: boten.map((b) => (b.haar ? { soort: b.soort, wijkt: wie !== b, draai: b.draai ?? 1 } : { ...b.pad, wijkt: wie === 'beide' || wie !== b, draai: b.draai ?? 1 })),
    letters: ls, antwoord: regels.volgorde ?? (wie === 'beide' ? 'beide' : wie.letter), regel: regels.tekst, soorten: boten.map((b) => b.soort),
  };
}

// Two boats: hers and one other, every way that makes sense - one of each kind of case per heading of the other and
// side the wind is on, the wind (her koers) taken by turns so they do not all sail the same course
function tweetallen() {
  const uit = []; const gezien = new Set(); let draai = 0;
  for (const haar of ['zeil', 'spier']) for (const ander of ['zeil', 'motor', 'spier', 'groot']) for (const r of RICHTING) for (const koers of [...KOERS.slice(draai % KOERS.length), ...KOERS.slice(0, draai++ % KOERS.length)]) {
    const h = haarBoot(haar);
    if (ander === 'groot' && Math.abs(r) === 60) continue;               // a groot schip from behind at an angle: no way out
    let v = SNEL[ander];
    if (r === 0) {                                                       // oplopen: the faster comes from behind
      if (ander === 'spier') v = h.v * 0.45; else if (ander !== 'motor' && ander !== 'groot') continue;
    }
    // where its middle is when hers is at C: head on a little to her bakboord side, so that they pass bakboord
    // langs bakboord; overtaking beside her, on her bakboord side when it comes up from behind, on its own
    // bakboord side when she does (a groot schip a way back still then: it is long, and it starts clear behind her)
    const opzij = ander === 'groot' ? (r === 0 ? -6 : -5) : r === 180 ? -2 : -3;
    const a = boot(ander, r, r === 180 ? [C, opzij] : r === 0 ? [ander === 'groot' ? C - 10 : C, v > h.v ? opzij : 4] : [ander === 'groot' ? C + 5 : C, 0], v);
    if (r === 0 && v < h.v) h.draai = -1;                                 // she the oploper: she goes round it to her bakboord
    if (!kan(koers, h) || !kan(koers, a)) continue;
    h.letter = 'p'; a.letter = 'q';
    const besl = voorrang(h, a, koers, false);
    const sleutel = `${haar}/${ander}/${besl.regel}/${ontmoeting(h, a)}/${r}/${Math.sign(koers)}/${besl.wie === h ? 'h' : 'a'}`;
    if (gezien.has(sleutel)) continue;
    gezien.add(sleutel);
    if (r === 0) a.draai = -1;                                           // an oploper passes her on her bakboord side
    uit.push({ niveau: NIVEAU[besl.regel], koers, jij: haar === 'spier' ? 'roeien' : 'zeilen', boten: [h, a], wal: null, beslist: (bs) => voorrang(bs[0], bs[1], koers, false) });
  }
  return uit;
}

// The stuurboordwal against the other rules, on courses that meet (BPR 6.04 lid 2, 6.17 lid 2: only where there is
// gevaar voor aanvaring). Head on: she keeps her stuurboordzijde and a groot schip or motorboot comes down her side of
// the water, or that one keeps its stuurboordzijde and she is on its side. Crossing: she keeps her stuurboordzijde and
// a zeilboot or motorboot comes across the water to her bank (opkruisend, or making for the other side).
function walSituaties() {
  const uit = [];
  for (const haar of ['zeil', 'spier']) for (const ander of ['motor', 'groot']) for (const zijdeVanHaar of [true, false]) {
    const koers = haar === 'zeil' ? 90 : 120;
    const h = { ...haarBoot(haar), wal: zijdeVanHaar };
    // her stuurboordwal 4 m off and the other down the middle of it, on her line; or the other 3 m off its own
    // stuurboordwal (her bakboord side) and she in that half of the water, on its line
    const wal = zijdeVanHaar ? { sb: 4, bb: -30 } : { sb: 22, bb: -8 };
    const z = zijdeVanHaar ? (ander === 'groot' ? 1 : 0.5) : (ander === 'groot' ? -2.5 : -2);
    const a = { ...boot(ander, 180, [C + 6, z], SNEL[ander]), wal: !zijdeVanHaar };
    uit.push({ niveau: 'moeilijk', koers, jij: haar === 'spier' ? 'roeien' : 'zeilen', boten: [h, a], wal, beslist: (bs) => voorrang(bs[0], bs[1], koers, true) });
  }
  // crossing: the other comes from her bakboord side across the water, and turns back (to its bakboord) to give way
  for (const haar of ['zeil', 'spier']) for (const [ander, r, koers] of [['zeil', 60, -120], ['zeil', 120, -90], ['motor', 90, haar === 'zeil' ? 90 : 120]]) {
    const h = { ...haarBoot(haar), wal: true };
    const a = { ...boot(ander, r, [C + 3, 0], SNEL[ander]), wal: false, draai: -1 };
    if (!kan(koers, h) || !kan(koers, a)) continue;
    uit.push({ niveau: 'moeilijk', koers, jij: haar === 'spier' ? 'roeien' : 'zeilen', boten: [h, a], wal: { sb: 8, bb: -45 }, beslist: (bs) => voorrang(bs[0], bs[1], koers, true) });
  }
  return uit;
}

// Three boats: hers and two others, where one goes before both - the one asked for
function drietallen() {
  const uit = [];
  const sets = [['zeil', 'motor', 'groot'], ['zeil', 'spier', 'motor'], ['spier', 'zeil', 'motor'], ['spier', 'motor', 'groot'], ['zeil', 'zeil', 'motor'], ['spier', 'spier', 'motor']];
  const wegen = [[90, 180], [-90, 180], [90, -90], [120, -120], [-60, 180]];
  let n = 0;
  for (const [haar, b, c] of sets) for (const [rb, rc] of wegen) {
    const koers = KOERS[(n++ * 3) % KOERS.length];
    const h = haarBoot(haar);
    const pb = boot(b, rb, [C + 1, 0], SNEL[b]); const pc = boot(c, rc, rc === 180 ? [C - 1, c === 'groot' ? -5 : -2] : [c === 'groot' ? C + 5 : C - 1, 0], SNEL[c]);
    if (![h, pb, pc].every((x) => kan(koers, x))) continue;
    const bs = [h, pb, pc];
    bs.forEach((x, i) => { x.letter = 'pqr'[i]; });
    const paren = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => voorrang(bs[i], bs[j], koers, false));
    if (paren.some((x) => x.wie === 'beide')) continue;
    const top = bs.find((x) => paren.filter((pr) => pr.wie === x).length === 2);
    if (!top) continue;
    uit.push({ niveau: 'moeilijk', koers, jij: haar === 'spier' ? 'roeien' : 'zeilen', boten: bs, wal: null, beslist: drie(koers) });
  }
  return uit;
}
// the order of three, and why: first the one that goes before both others, then the one that goes before the last;
// volgorde their letters in that order ('CAB'), and each pair's rule
const drie = (koers) => (bs) => {
  const paren = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => voorrang(bs[i], bs[j], koers, false));
  const wint = (x) => paren.filter((pr) => pr.wie === x).length;
  const rij = [...bs].sort((a, b) => wint(b) - wint(a));
  const uitleg = [...paren].sort((a, b) => wint(b.wie) - wint(a.wie));
  return { wie: rij[0], volgorde: rij.map((x) => x.letter).join(''),
    tekst: () => `${uitleg.map((pr) => pr.tekst()).join(' ')} Dus eerst ${rij[0].letter}, dan ${rij[1].letter}, dan ${rij[2].letter}.` };
};

// All of them, by niveau: { makkelijk: [...], normaal: [...], moeilijk: [...] }
export function oefenSituaties() {
  const alle = [...tweetallen(), ...walSituaties(), ...drietallen()];
  const per = { makkelijk: [], normaal: [], moeilijk: [] };
  alle.forEach((x, i) => {
    const sit = situatie(x.niveau, x.koers, x.jij, x.boten.map((b) => ({ ...b, pad: b.pad && { ...b.pad } })), x.wal, x.beslist, i + 1);
    sit.regel = sit.regel();
    per[x.niveau].push(sit);
  });
  return per;
}

export { T };
