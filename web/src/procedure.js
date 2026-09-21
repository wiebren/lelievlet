// A procedure is a list of steps done one after the other - reefing, striking the sails, lowering
// the mast. Each step takes one value from where it was to where it has to be in a given time, so
// the whole thing is a timeline: it can be played in either direction, paused, stepped through and
// scrubbed, and the boat always shows exactly what belongs to that moment.

export class Procedure {
  /**
   * name: what the control is called; values: where every value starts;
   * steps: [{ key, to, seconds, label, back }] in the order they are done; `back` names the step
   * done the other way round (Fok strijken, Fok hijsen), and is the label while it runs backwards.
   */
  constructor(name, values, steps) {
    this.name = name;
    this.start = { ...values };
    this.values = { ...values };
    this.steps = [];
    const reached = { ...values };
    let at = 0;
    for (const { key, to, seconds, label, back } of steps) {
      if (Math.abs(to - reached[key]) < 1e-9) continue;               // nothing to do: not a step
      this.steps.push({ key, label, back: back ?? label, from: reached[key], to, begin: at, end: at + seconds });
      reached[key] = to; at += seconds;
    }
    this.total = at;
    this.t = 0; this.goal = 0; this.playing = false; this.commanded = 0;
    this.direction = 1;             // +1 forwards, -1 backwards: the way it last went, or is going
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
  command(t) { this.commanded = Math.min(Math.max(t, 0), this.total); this.goal = this.commanded; this.playing = true; this.aim(this.goal); }

  /** End of the step with this key: the time at which everything up to and including it is done. */
  after(key) { const s = [...this.steps].reverse().find((x) => x.key === key); return s ? s.end : 0; }

  play() { this.goal = this.commanded; this.playing = Math.abs(this.goal - this.t) > 1e-6; this.aim(this.goal); }
  pause() { this.playing = false; }
  scrub(t) { this.playing = false; this.aim(t); this.seek(t); }

  /** One step on (+1) or back (-1), played, not jumped. */
  step(direction) {
    const edges = [0, ...this.steps.map((s) => s.end)];
    const next = direction > 0 ? edges.find((e) => e > this.t + 1e-6) : [...edges].reverse().find((e) => e < this.t - 1e-6);
    if (next === undefined) return;
    this.goal = next; this.playing = true; this.direction = direction;
  }

  tick(dt) {
    if (!this.playing) return;
    const gap = this.goal - this.t;
    if (Math.abs(gap) <= dt) { this.seek(this.goal); this.playing = false; } else this.seek(this.t + Math.sign(gap) * dt);
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
