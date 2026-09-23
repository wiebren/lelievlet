// A procedure is a list of steps done one after the other - reefing, striking the sails, lowering
// the mast. Each step takes one value from where it was to where it has to be in a given time, so
// the whole thing is a timeline: it can be played in either direction, paused, stepped through and
// scrubbed, and the boat always shows exactly what belongs to that moment.
//
// Some steps do not apply to the boat as she is (moored, there is no anchor to let go): they are
// skipped. A skipped step keeps its place on the timeline, so the stretches and the progress bar
// keep their shape, but it moves nothing - its value stays where it was - and playing, stepping
// and practising go straight over it.

export class Procedure {
  /**
   * name: what the control is called; values: where every value starts;
   * steps: [{ key, to, seconds, label, back, focus }] in the order they are done; `back` names the
   * step done the other way round (Fok strijken, Fok hijsen), and is the label while it runs
   * backwards; `focus` lists the ids of the parts to look at while it is stepped through, and
   * `camera` ({ positie, doel, kant }, model space), when given, is where to look from instead;
   * `like` names the key of another step whose movement it is framed on; `say` is what is called
   * out as the step begins (a command), and `by` who calls it ('roer', the helmsman, by default).
   */
  constructor(name, values, steps) {
    this.name = name;
    this.start = { ...values };
    this.values = { ...values };
    this.steps = [];
    const reached = { ...values };
    let at = 0;
    for (const { key, to, seconds, label, back, focus = [], camera = null, like = null, say = null, by = 'roer' } of steps) {
      if (Math.abs(to - reached[key]) < 1e-9) continue;               // nothing to do: not a step
      this.steps.push({ key, label, back: back ?? label, focus, camera, like, say, by, from: reached[key], to, begin: at, end: at + seconds });
      reached[key] = to; at += seconds;
    }
    this.total = at;
    this.t = 0; this.goal = 0; this.playing = false; this.commanded = 0;
    this.direction = 1;             // +1 forwards, -1 backwards: the way it last went, or is going
    this.rate = 1;                  // how fast it plays: slower while it is stepped through
    this.delay = 0;                 // seconds it waits before it moves: the camera goes first
    this.from = 0;                  // where the step being played set out from
    this.skipped = new Set();       // keys of the steps that do not apply now
  }

  /** Whether this step is skipped: it keeps its place, but does nothing. */
  isSkipped(s) { return this.skipped.has(s.key); }

  /** `t` moved out of any skipped step it lies in, the way `direction` goes. */
  pass(t, direction) {
    for (let moved = true; moved;) {
      moved = false;
      for (const s of this.steps) {
        if (!this.isSkipped(s) || t <= s.begin + 1e-9 || t >= s.end - 1e-9) continue;
        t = direction < 0 ? s.begin : s.end; moved = true;
      }
    }
    return t;
  }

  /** Heading for `t`: the direction it will go, or the one it had if it is there already. */
  aim(t) { if (Math.abs(t - this.t) > 1e-6) this.direction = Math.sign(t - this.t); }

  /** The values as they are at time t. */
  seek(t) {
    this.t = Math.min(Math.max(t, 0), this.total);
    Object.assign(this.values, this.start);
    for (const s of this.steps) {
      if (this.isSkipped(s)) continue;                              // it does nothing: its value stays
      if (this.t >= s.end) this.values[s.key] = s.to;
      else { if (this.t > s.begin) this.values[s.key] = s.from + (s.to - s.from) * ((this.t - s.begin) / (s.end - s.begin)); break; }
    }
    return this.values;
  }

  /** Where the procedure has to end up (a time); it starts playing towards it. */
  command(t) { this.commanded = Math.min(Math.max(t, 0), this.total); this.goal = this.commanded; this.playing = true; this.normal(); this.aim(this.goal); }

  /** End of the step with this key: the time at which everything up to and including it is done. */
  after(key) { const s = [...this.steps].reverse().find((x) => x.key === key); return s ? s.end : 0; }

  play() { this.goal = this.commanded; this.playing = Math.abs(this.goal - this.t) > 1e-6; this.normal(); this.aim(this.goal); }
  pause() { this.playing = false; }
  scrub(t) { this.playing = false; this.normal(); this.aim(t); this.seek(t); }
  normal() { this.rate = 1; this.delay = 0; }

  /** Whether a single step is being played (or waits for the camera), rather than the whole of it. */
  get stepping() { return this.playing && this.rate === STEP_RATE; }

  /**
   * The step one step on (+1) or back (-1) would play, and the time it would stop at; null at the
   * end, and null when that is back to where a step that has not moved yet set out from: that only
   * calls the step off.
   */
  upcoming(direction) {
    if (this.stepping && direction !== this.direction && Math.abs(this.t - this.from) < 1e-6) return null;
    return nextLive(this.steps, this.t, direction, (x) => this.isSkipped(x));
  }

  /**
   * One step on (+1) or back (-1), played, not jumped - at half speed, so it can be followed, and
   * after `delay` seconds, in which the camera takes up its place.
   */
  step(direction, delay = 0) {
    const next = this.upcoming(direction);
    if (!next) { this.goal = this.t; this.playing = false; this.normal(); return; }   // nothing that way: whatever was coming stops
    if (!this.stepping) this.from = this.t;       // turned round half way, it goes back to where it came from
    this.goal = next.at; this.playing = true; this.direction = direction;
    this.rate = STEP_RATE; this.delay = delay;
  }

  tick(dt) {
    if (!this.playing) return;
    if (this.delay > 0) { this.delay -= dt; return; }
    const gap = this.goal - this.t;
    const move = dt * this.rate;
    if (Math.abs(gap) <= move) { this.seek(this.goal); this.playing = false; return; }
    // a skipped step takes no time: it is passed at once
    const way = Math.sign(gap); const next = this.pass(this.t + way * move, way);
    if ((this.goal - next) * way <= 1e-9) { this.seek(this.goal); this.playing = false; } else this.seek(next);
  }

  /**
   * The step it is on: the last one begun. A single step being played counts from half way between
   * where it set out and where it stops, so at a boundary it names the step it is about to do
   * rather than the one behind it - either way it is going.
   */
  get index() {
    const at = this.stepping && Math.abs(this.goal - this.t) > 1e-6 ? (this.t + this.goal) / 2 : this.t;
    return lastBegun(this.steps, at, (s) => this.isSkipped(s));
  }
  get current() { return this.steps[this.index] ?? null; }
  /** What that step is called, the way it is going. */
  get label() { const s = this.current; return s ? (this.direction < 0 ? s.back : s.label) : ''; }
  get resting() { return !this.playing && (this.t < 1e-6 || this.t > this.total - 1e-6 || Math.abs(this.t - this.commanded) < 1e-6); }
}

const STEP_RATE = 0.5;   // a step on its own plays at half speed

/**
 * The next step that is not skipped, the way `direction` goes from `t`, and where it stops: beyond
 * it, over any skipped steps that follow on, so a step at the end is not left short of the end.
 */
function nextLive(steps, t, direction, skipped) {
  const live = steps.filter((x) => !skipped(x));
  const s = direction > 0 ? live.find((x) => x.end > t + 1e-6) : live.findLast((x) => x.begin < t - 1e-6);
  if (!s) return null;
  let at = direction > 0 ? s.end : s.begin;
  for (let i = steps.indexOf(s) + direction; i >= 0 && i < steps.length && skipped(steps[i]); i += direction) {
    at = direction > 0 ? steps[i].end : steps[i].begin;
  }
  return { step: s, at };
}

/** The index of the last step begun by `at` that is not skipped; the first one that is not, before any. */
function lastBegun(steps, at, skipped) {
  const i = steps.findLastIndex((s) => !skipped(s) && at > s.begin + 1e-6);
  if (i >= 0) return i;
  const first = steps.findIndex((s) => !skipped(s));
  return first < 0 ? 0 : first;
}

/**
 * A stretch of a procedure, shown and steered as a procedure of its own: Zeilen and Mast are two
 * stretches of the one Tuig timeline, because the mast only comes down after the sails. It has the
 * steps between `from` and `to` (times counted from `from`), and playing, stepping and scrubbing
 * stay inside it; the values and the time live on the procedure underneath.
 */
export class Stretch {
  constructor(procedure, name, from, to) {
    this.procedure = procedure; this.name = name; this.from = from; this.total = to - from;
    this.steps = procedure.steps.filter((s) => s.begin >= from - 1e-6 && s.end <= to + 1e-6)
      .map((s) => ({ ...s, begin: s.begin - from, end: s.end - from }));
  }

  get t() { return Math.min(Math.max(this.procedure.t - this.from, 0), this.total); }
  get playing() { return this.procedure.playing; }
  get stepping() { return this.procedure.stepping; }
  get direction() { return this.procedure.direction; }
  get resting() { return this.procedure.resting || this.t < 1e-6 || this.t > this.total - 1e-6; }

  seek(t) { return this.procedure.seek(this.from + Math.min(Math.max(t, 0), this.total)); }
  play() { this.procedure.play(); }
  pause() { this.procedure.pause(); }
  scrub(t) { this.procedure.scrub(this.from + Math.min(Math.max(t, 0), this.total)); }

  isSkipped(s) { return this.procedure.isSkipped(s); }

  /** As Procedure.upcoming, but only the steps of this stretch: at its ends there is nothing more. */
  upcoming(direction) {
    const p = this.procedure; const t = this.t;
    if (p.stepping && direction !== p.direction && Math.abs(p.t - p.from) < 1e-6) return null;
    return nextLive(this.steps, t, direction, (x) => this.isSkipped(x));
  }

  /** As Procedure.step, within the stretch. */
  step(direction, delay = 0) {
    const p = this.procedure; const next = this.upcoming(direction);
    if (!next) { p.goal = p.t; p.playing = false; p.normal(); return; }
    if (!p.stepping) p.from = p.t;
    p.goal = this.from + next.at; p.playing = true; p.direction = direction;
    p.rate = STEP_RATE; p.delay = delay;
  }

  get index() {
    const p = this.procedure;
    const at = (p.stepping && Math.abs(p.goal - p.t) > 1e-6 ? (p.t + p.goal) / 2 : p.t) - this.from;
    return lastBegun(this.steps, at, (s) => this.isSkipped(s));
  }
  get current() { return this.steps[this.index] ?? null; }
  get label() { const s = this.current; return s ? (this.direction < 0 ? s.back : s.label) : ''; }
}
