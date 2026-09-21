// A procedure is a list of steps done one after the other - reefing, striking the sails, lowering
// the mast. Each step takes one value from where it was to where it has to be in a given time, so
// the whole thing is a timeline: it can be played in either direction, paused, stepped through and
// scrubbed, and the boat always shows exactly what belongs to that moment.

export class Procedure {
  /**
   * name: what the control is called; values: where every value starts;
   * steps: [{ key, to, seconds, label, back, focus }] in the order they are done; `back` names the
   * step done the other way round (Fok strijken, Fok hijsen), and is the label while it runs
   * backwards; `focus` lists the ids of the parts to look at while it is stepped through.
   */
  constructor(name, values, steps) {
    this.name = name;
    this.start = { ...values };
    this.values = { ...values };
    this.steps = [];
    const reached = { ...values };
    let at = 0;
    for (const { key, to, seconds, label, back, focus = [] } of steps) {
      if (Math.abs(to - reached[key]) < 1e-9) continue;               // nothing to do: not a step
      this.steps.push({ key, label, back: back ?? label, focus, from: reached[key], to, begin: at, end: at + seconds });
      reached[key] = to; at += seconds;
    }
    this.total = at;
    this.t = 0; this.goal = 0; this.playing = false; this.commanded = 0;
    this.direction = 1;             // +1 forwards, -1 backwards: the way it last went, or is going
    this.rate = 1;                  // how fast it plays: slower while it is stepped through
    this.delay = 0;                 // seconds it waits before it moves: the camera goes first
  }

  /** Heading for `t`: the direction it will go, or the one it had if it is there already. */
  aim(t) { if (Math.abs(t - this.t) > 1e-6) this.direction = Math.sign(t - this.t); }

  /** The values as they are at time t. */
  seek(t) {
    this.t = Math.min(Math.max(t, 0), this.total);
    Object.assign(this.values, this.start);
    for (const s of this.steps) {
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

  /** The step one step on (+1) or back (-1) would play, and the time it would stop at; null at the end. */
  upcoming(direction) {
    if (direction > 0) { const s = this.steps.find((x) => x.end > this.t + 1e-6); return s ? { step: s, at: s.end } : null; }
    const s = this.steps.findLast((x) => x.begin < this.t - 1e-6);
    return s ? { step: s, at: s.begin } : null;
  }

  /**
   * One step on (+1) or back (-1), played, not jumped - at half speed, so it can be followed, and
   * after `delay` seconds, in which the camera takes up its place.
   */
  step(direction, delay = 0) {
    const next = this.upcoming(direction);
    if (!next) return;
    this.goal = next.at; this.playing = true; this.direction = direction;
    this.rate = STEP_RATE; this.delay = delay;
  }

  tick(dt) {
    if (!this.playing) return;
    if (this.delay > 0) { this.delay -= dt; return; }
    const gap = this.goal - this.t;
    const move = dt * this.rate;
    if (Math.abs(gap) <= move) { this.seek(this.goal); this.playing = false; } else this.seek(this.t + Math.sign(gap) * move);
  }

  /**
   * The step being done, or at a boundary the one last done: forwards the last one begun, backwards
   * the first one not yet finished. Struck, that is "Zeilbinders om"; hoisted again, "Afvallen".
   */
  get index() {
    if (this.direction < 0) {
      const i = this.steps.findIndex((s) => this.t < s.end - 1e-6);
      return i < 0 ? this.steps.length - 1 : i;
    }
    for (let i = this.steps.length - 1; i >= 0; i--) if (this.t > this.steps[i].begin + 1e-6) return i;
    return 0;
  }
  get current() { return this.steps[this.index] ?? null; }
  /** What that step is called, the way it is going. */
  get label() { const s = this.current; return s ? (this.direction < 0 ? s.back : s.label) : ''; }
  get resting() { return !this.playing && (this.t < 1e-6 || this.t > this.total - 1e-6 || Math.abs(this.t - this.commanded) < 1e-6); }
}

const STEP_RATE = 0.5;   // a step on its own plays at half speed
