// Sound signals made audible (BPR bijlage 6): a ship's horn and a ship's bell, from Web Audio alone.
// A pattern is a string of tokens, as geluiden.js writes them: 'k' korte stoot (about 1 s), 'l' lange
// stoot (about 4 s), 'z' zeer korte stoot (about a quarter of a second), 'Z' a reeks zeer korte stoten
// (at least six, a quarter second each, a quarter second between), 'b' a klokslag, 'B' a reeks
// klokslagen (about 4 s), '|' a longer pause between two groups. Between two stoten about 1 s.

const DUUR = { k: 1, l: 4, z: 0.25 };
const TUSSEN = 1;                    // s between two stoten
const PAUZE = 2.5;                   // s for '|'
const REEKS = 8;                     // zeer korte stoten in a reeks (the BPR: at least 6)

/** The pattern laid out in time: [{ at, dur, kind: 'hoorn' | 'klok' }], and how long it all takes. */
export function tijdlijn(patroon) {
  const out = []; let t = 0; let last = null;
  for (const token of patroon.replace(/\s+/g, '')) {
    if (token === '|') { t += PAUZE - (last ? TUSSEN : 0); last = null; continue; }
    if (last) t += last === 'z' || last === 'Z' ? 0.25 : TUSSEN;
    if (token in DUUR) { out.push({ at: t, dur: DUUR[token], kind: 'hoorn', token }); t += DUUR[token]; }
    else if (token === 'Z') { for (let i = 0; i < REEKS; i++) { out.push({ at: t, dur: 0.25, kind: 'hoorn', token: 'z' }); t += i < REEKS - 1 ? 0.5 : 0.25; } }
    else if (token === 'b') { out.push({ at: t, dur: 0.3, kind: 'klok', token }); t += 0.3; }
    else if (token === 'B') { for (let i = 0; i < 16; i++) { out.push({ at: t, dur: 0.25, kind: 'klok', token: 'b' }); t += 0.25; } }
    else continue;
    last = token;
  }
  return { stappen: out, duur: t };
}

/**
 * The pattern as a picture, its width after time: a block for a stoot (a dot for a zeer korte), a
 * round for a klokslag, and a gap for a pause - read like the BPR's own drawing of it.
 */
export function patroonSvg(patroon, { h = 28, k = 14, kleur = '#16222e' } = {}) {
  const { stappen, duur } = tijdlijn(patroon);
  const w = Math.max(1, duur) * k + 8; const y = h / 2;
  const body = stappen.map(({ at, dur, kind, token }) => {
    const x = 4 + at * k;
    if (kind === 'klok') return `<circle cx="${(x + 3).toFixed(1)}" cy="${y}" r="3.2" fill="none" stroke="${kleur}" stroke-width="1.6"/>`;
    if (token === 'z') return `<circle cx="${(x + 2).toFixed(1)}" cy="${y}" r="2.2" fill="${kleur}"/>`;
    return `<rect x="${x.toFixed(1)}" y="${y - 3.5}" width="${(dur * k).toFixed(1)}" height="7" rx="3.5" fill="${kleur}"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w.toFixed(0)}" height="${h}" viewBox="0 0 ${w.toFixed(1)} ${h}">${body}</svg>`;
}

/**
 * One player for the viewer: play(patroon, { herhaald, klaar }) sounds it (twice, a pause between, when
 * it is a signal that is repeated) and calls `klaar` at the end; stop() silences it at once; close() lets the
 * audio go for good (the viewer taken down). The audio context is made on the first play, from a click, as
 * browsers want.
 */
export function makeHoorn() {
  let ctx = null; let bus = null; let running = []; let timer = 0; let done = null;
  const stop = () => {
    clearTimeout(timer);
    for (const node of running) { try { node.stop(); } catch { /* already over */ } }
    running = [];
    ctx?.suspend?.();                                               // silent at once, a bell ringing out too; play() resumes
    const d = done; done = null; d?.();
  };
  /** A horn: a low note with its overtones, through a filter, swelling in and dying away quickly. */
  const hoorn = (at, dur) => {
    const g = ctx.createGain(); g.gain.setValueAtTime(0, at);
    g.gain.linearRampToValueAtTime(0.32, at + 0.05); g.gain.setValueAtTime(0.32, at + dur - 0.08); g.gain.linearRampToValueAtTime(0, at + dur);
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 1400; filter.Q.value = 0.8;
    g.connect(filter); filter.connect(bus);
    for (const [f, type, level] of [[196, 'sawtooth', 0.5], [196.8, 'square', 0.25], [294, 'sawtooth', 0.2]]) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
      const lg = ctx.createGain(); lg.gain.value = level; o.connect(lg); lg.connect(g);
      o.start(at); o.stop(at + dur + 0.05); running.push(o);
    }
  };
  /** A bell: a few inharmonic partials, struck and ringing out. */
  const klok = (at) => {
    for (const [f, level, decay] of [[880, 0.35, 1.6], [1320 * 1.007, 0.18, 1.1], [2160, 0.12, 0.6], [3020, 0.06, 0.35]]) {
      const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = f;
      const g = ctx.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(level, at + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, at + decay);
      o.connect(g); g.connect(bus); o.start(at); o.stop(at + decay + 0.05); running.push(o);
    }
  };
  const play = (patroon, { herhaald = false, klaar } = {}) => {
    stop();
    if (!ctx) {
      const Ctx = window.AudioContext ?? window.webkitAudioContext;
      if (!Ctx) return false;
      ctx = new Ctx(); bus = ctx.createGain(); bus.gain.value = 0.8; bus.connect(ctx.destination);
    }
    ctx.resume?.();
    const { stappen, duur } = tijdlijn(patroon);
    const start = ctx.currentTime + 0.08;
    const rounds = herhaald ? 2 : 1;
    for (let r = 0; r < rounds; r++) {
      const off = start + r * (duur + 3);
      for (const s of stappen) (s.kind === 'klok' ? klok(off + s.at) : hoorn(off + s.at, s.dur));
    }
    done = klaar ?? null;
    const tail = stappen.at(-1)?.kind === 'klok' ? 1.6 : 0.4;       // a bell rings out after its last stroke
    timer = setTimeout(stop, (0.08 + rounds * duur + (rounds - 1) * 3 + tail) * 1000);
    return true;
  };
  const close = () => { stop(); ctx?.close?.(); ctx = null; bus = null; };
  return { play, stop, close, get playing() { return running.length > 0; } };
}
