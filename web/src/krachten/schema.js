// Krachten as a schema: the same items as on the boat (pijlen.js), drawn flat in the card - from
// above with the bow up, from astern, or from astern close up on the hull - over outlines taken from
// the model itself, the way the lesboeken draw them. The 3D boat stays behind it, doing the same.
//
// Projection, in metres: boven: right = stuurboord (+z), up = forward (+x); achter and romp: right =
// stuurboord, up = up. One SVG per pane, side by side; words and lines are sized in screen pixels, so
// a close-up pane does not get bigger letters.

const NS = 'http://www.w3.org/2000/svg';
// each pane takes in the hull and whatever is drawn (not the sails), at least `min`, in the shape the card
// gives it: every pane as high as one would be across the whole card (ASPECT), so two side by side are
// narrower, not lower - and never changing with the forces. From above that is the hull's width only:
// along the boat the pane goes where the forces are, and the hull runs on out of it where nothing is
// drawn - the forces drawn large beat a whole boat drawn small
const ASPECT = 1.05;
const PANE = {
  boven: { min: [3.2, 4.2], titel: 'Bovenaanzicht', across: true },
  achter: { min: [3.4, 3.4], titel: 'Achteraanzicht' },
  romp: { min: [2.6, 2.4], titel: 'De romp, van achteren', box: { u: [-1.45, 1.45], v: [-1.6, 1.0] } },
};
const project = (view, [x, y, z]) => (view === 'boven' ? [z, -x] : [z, -y]);
// where a word may go when its own place is taken, nearest first
const STEPS = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0], [-1, -1], [1, -1], [-1, 1], [1, 1], [0, -2], [0, 2], [0, -3], [0, 3]];
const f = (n) => Math.round(n * 1000) / 1000;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function createSchema(host) {
  let views = ['boven'];
  const svgs = [];
  const boxes = {};                                                  // per view, the box shown: it eases to the one wanted
  const steps = {};                                                  // per view, per word: the step it was moved off by
  let hostWidth = -1; let most = 340;                                // the page's height limit, read again when the card changes width

  /** What a pane should show: the hull and the items, with room round them, in the pane's shape. */
  function fit(view, shapes, items, aspect) {
    const p = PANE[view];
    if (p.box) {                                                     // a fixed box, widened or heightened to the pane
      const { u: [a, z], v: [c, d] } = p.box; let w = z - a; let h = d - c;
      if (w / h < aspect) w = h * aspect; else h = w / aspect;
      return { u: [(a + z) / 2 - w / 2, (a + z) / 2 + w / 2], v: [(c + d) / 2 - h / 2, (c + d) / 2 + h / 2] };
    }
    const base = view === 'boven' ? 'boven' : 'achter';
    let u0 = Infinity; let u1 = -Infinity; let v0 = Infinity; let v1 = -Infinity;
    const take = (pt) => { const [u, v] = project(base, pt); u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); };
    const hull = [];
    for (const s of shapes) if (s.view === base && s.fit) hull.push(...s.pts);
    if (!p.across) hull.forEach(take);
    for (const it of items) {
      if (it.views && !it.views.includes(view) && !(view === 'achter' && it.views.includes('romp') && !views.includes('romp'))) continue;
      if (it.type === 'pijl') { take(it.from); take(it.from.map((c, i) => c + it.vec[i])); }
      else if (it.type === 'punt' || it.type === 'tekst' || it.type === 'ruimte') take(it.at);
      else if (it.type === 'lijn' || it.type === 'maat') { take(it.a); take(it.b); }
      else if (it.type === 'stroom') it.pts.forEach(take);
      else if (it.type === 'boog') { const [x, y, z] = it.center; take([x - it.r, y - it.r, z - it.r]); take([x + it.r, y + it.r, z + it.r]); }
    }
    if (p.across) {
      if (u0 === Infinity) hull.forEach(take);                       // nothing drawn: the whole boat
      for (const pt of hull) { const [u] = project(base, pt); u0 = Math.min(u0, u); u1 = Math.max(u1, u); }
    }
    const pad = 0.5;
    u0 -= pad; u1 += pad; v0 -= pad; v1 += pad;
    let w = Math.max(u1 - u0, p.min[0]); let h = Math.max(v1 - v0, p.min[1]);
    if (w / h < aspect) w = h * aspect; else h = w / aspect;
    const cu = (u0 + u1) / 2; let cv = (v0 + v1) / 2;
    if (p.across && hull.length) {                                   // shorter than the boat: the bow in it, so you see
      const bow = Math.min(...hull.map((pt) => project(base, pt)[1])) - pad;   // which way she goes, and as
      if (h < Math.max(...hull.map((pt) => project(base, pt)[1])) + pad - bow) cv = bow + h / 2;   // much more as fits
      cv = Math.min(Math.max(cv, v1 - h / 2), v0 + h / 2);         // but never a force out of it
    }
    return { u: [cu - w / 2, cu + w / 2], v: [cv - h / 2, cv + h / 2] };
  }

  const arcPts = (it, n = 36) => {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = it.start + (it.sweep * i) / n; const [x, y, z] = it.center;
      pts.push(it.as === 'y' ? [x + it.r * Math.cos(t), y, z - it.r * Math.sin(t)] : [x, y + it.r * Math.cos(t), z + it.r * Math.sin(t)]);
    }
    return pts;
  };

  /** One pane: everything in metres, `px` metres to a screen pixel. */
  function pane(view, b, shapes, items, px) {
    const base = view === 'boven' ? 'boven' : 'achter';
    const P = (p) => project(base, p);
    const unit = 2.6 * px;                                           // the width of a force arrow
    const font = 11.5 * px;
    const words = [];                                                // { u, v, text, kleur }: laid out last
    const word = (u, v, text, kleur, first = false) => words.push({ u, v, text, kleur, first });
    let out = '';
    if (base === 'achter') {
      out += `<rect x="${b.u[0]}" y="-0.3" width="${b.u[1] - b.u[0]}" height="${b.v[1] + 0.3}" fill="#cfe2ee"/>`;
      out += `<line x1="${b.u[0]}" y1="-0.3" x2="${b.u[1]}" y2="-0.3" stroke="#7fa7c2" stroke-width="${f(1.2 * px)}"/>`;
    }
    for (const s of shapes) {
      if (s.view !== base || (view === 'romp' && s.romp === false)) continue;
      if (s.dot) { const [u, v] = P(s.dot); out += `<circle cx="${f(u)}" cy="${f(v)}" r="${f(Math.max(s.r ?? 0.06, 3 * px))}" fill="${s.fill ?? '#36454f'}"/>`; continue; }
      const pts = s.pts.map((p) => P(p).map(f).join(',')).join(' ');
      out += `<${s.closed ? 'polygon' : 'polyline'} points="${pts}" fill="${s.fill ?? 'none'}" stroke="${s.stroke ?? 'none'}" stroke-width="${f((s.px ?? 1.3) * px)}"${s.dashed ? ` stroke-dasharray="${f(5 * px)} ${f(4 * px)}"` : ''} stroke-linejoin="round"/>`;
    }
    for (const it of items) {
      if (it.views && !it.views.includes(view) && !(view === 'achter' && it.views.includes('romp') && !views.includes('romp'))) continue;
      if (view === 'romp' && !it.views?.includes('romp')) continue;
      if (it.type === 'pijl') {
        const [u0, v0] = P(it.from); const [u1, v1] = P(it.from.map((c, i) => c + it.vec[i]));
        const du = u1 - u0; const dv = v1 - v0; const len = Math.hypot(du, dv);
        if (len < 4 * px) continue;
        const w = (it.dun ? 0.6 : 1) * unit;
        const hl = Math.min(4.5 * w, len * 0.45); const hw = 2 * w;
        const eu = du / len; const ev = dv / len; const bu = u1 - eu * hl; const bv = v1 - ev * hl;
        out += `<line x1="${f(u0)}" y1="${f(v0)}" x2="${f(bu + eu * hl * 0.1)}" y2="${f(bv + ev * hl * 0.1)}" stroke="${it.kleur}" stroke-width="${f(w)}" stroke-linecap="round"/>`;
        out += `<polygon points="${f(u1)},${f(v1)} ${f(bu - ev * hw)},${f(bv + eu * hw)} ${f(bu + ev * hw)},${f(bv - eu * hw)}" fill="${it.kleur}"/>`;
        if (it.label) { const k = it.labelAt ?? 0.62; word(u0 + du * k - ev * 9 * px, v0 + dv * k + eu * 9 * px, it.label, it.kleur); }
      } else if (it.type === 'lijn') {
        const [u0, v0] = P(it.a); const [u1, v1] = P(it.b);
        out += `<line x1="${f(u0)}" y1="${f(v0)}" x2="${f(u1)}" y2="${f(v1)}" stroke="${it.kleur}" stroke-width="${f(1 * px)}" stroke-dasharray="${f(4 * px)} ${f(3 * px)}"/>`;
      } else if (it.type === 'punt') {
        const [u, v] = P(it.at);
        out += `<circle cx="${f(u)}" cy="${f(v)}" r="${f(4 * px)}" fill="${it.kleur}" stroke="#fff" stroke-width="${f(1.2 * px)}"/>`;
        if (it.label) { const [ou, ov] = it.offset ?? [0, 13]; word(u + ou * px, v + ov * px, it.label, it.kleur, true); }
      } else if (it.type === 'boog') {
        if (Math.abs(it.sweep) < 0.05) continue;
        // an arc about an axis seen end on is a circle; seen side on it would only be a line
        if (!((base === 'boven' && it.as === 'y') || (base === 'achter' && it.as === 'x'))) continue;
        const pts = arcPts(it).map(P);
        out += `<polyline points="${pts.slice(0, -2).map((p) => p.map(f).join(',')).join(' ')}" fill="none" stroke="${it.kleur}" stroke-width="${f((it.vol ? 2.6 : 1.8) * px)}"${it.vol ? '' : ` stroke-dasharray="${f(6 * px)} ${f(4 * px)}"`}/>`;
        const [eu, ev] = pts[pts.length - 1]; const [pu, pv] = pts[pts.length - 3];
        const d = Math.hypot(eu - pu, ev - pv) || 1; const tu = (eu - pu) / d; const tv = (ev - pv) / d;
        const hl = (it.vol ? 11 : 9) * px; const hw = (it.vol ? 5.5 : 4.5) * px; const bu = eu - tu * hl; const bv = ev - tv * hl;
        out += `<polygon points="${f(eu)},${f(ev)} ${f(bu - tv * hw)},${f(bv + tu * hw)} ${f(bu + tv * hw)},${f(bv - tu * hw)}" fill="${it.kleur}"/>`;
        // its word just outside the arc, away from its middle, so the arc stays in sight beside it
        if (it.label) {
          const [mu, mv] = pts[Math.floor(pts.length / 2)]; const [cu, cv] = P(it.center);
          const d = Math.hypot(mu - cu, mv - cv) || 1;
          word(mu + ((mu - cu) / d) * 14 * px, mv + ((mv - cv) / d) * 10 * px, it.label, it.kleur);
        }
      } else if (it.type === 'tekst') {
        const [u, v] = P(it.at); const [ou, ov] = it.offset ?? [0, 0]; word(u + ou * px, v + ov * px, it.label, it.kleur);
      } else if (it.type === 'stroom') {
        if (base !== 'boven') continue;                                // the air from above only: from astern it is a smudge
        const pts = it.pts.map(P);
        out += `<polyline points="${pts.map((p) => p.map(f).join(',')).join(' ')}" fill="none" stroke="${it.kleur}" stroke-width="${f(1.1 * px)}" stroke-linejoin="round" stroke-linecap="round" opacity="0.85"/>`;
        if (it.pijl && pts.length > 2) {
          const [eu, ev] = pts[pts.length - 1]; const [pu, pv] = pts[pts.length - 3];
          const d = Math.hypot(eu - pu, ev - pv) || 1; const tu = (eu - pu) / d; const tv = (ev - pv) / d;
          const hl = 6 * px; const hw = 3 * px; const bu = eu - tu * hl; const bv = ev - tv * hl;
          out += `<polygon points="${f(eu)},${f(ev)} ${f(bu - tv * hw)},${f(bv + tu * hw)} ${f(bu + tv * hw)},${f(bv - tu * hw)}" fill="${it.kleur}" opacity="0.85"/>`;
        }
      } else if (it.type === 'maat') {
        const [u0, v0] = P(it.a); const [u1, v1] = P(it.b);
        const len = Math.hypot(u1 - u0, v1 - v0); if (len < 3 * px) continue;
        const nu = -(v1 - v0) / len; const nv = (u1 - u0) / len; const t = 5 * px;
        out += `<g stroke="${it.kleur}" stroke-width="${f(1.2 * px)}"><line x1="${f(u0)}" y1="${f(v0)}" x2="${f(u1)}" y2="${f(v1)}"/>`;
        for (const [u, v] of [[u0, v0], [u1, v1]]) out += `<line x1="${f(u - nu * t)}" y1="${f(v - nv * t)}" x2="${f(u + nu * t)}" y2="${f(v + nv * t)}"/>`;
        out += '</g>';
        if (it.label) word((u0 + u1) / 2, (v0 + v1) / 2 + 11 * px, it.label, it.kleur);
      }
    }
    // the words, each moved off the ones before it as far as it has to - in its own place when that is
    // free, else keeping the step it had while that still fits - and sliding to a new one, so a word
    // does not hop about as the arrows turn
    const placed = [];
    const h = 1.3 * font;
    const had = steps[view] ?? (steps[view] = new Map());
    words.sort((a, b) => b.first - a.first);                         // the points keep their place
    for (const w of words) {
      const wd = (w.text.length * 0.56 + 0.8) * font;
      const was = had.get(w.text);
      // a step is [across, up or down]: across by most of its own width, up or down by a line
      // (and never out of the pane: a word past its edge is pulled in)
      const inside = (u, lo, hi, half) => Math.min(Math.max(u, lo + half + 3 * px), hi - half - 3 * px);
      const at = ([a, k]) => [inside(w.u + a * 0.6 * wd, b.u[0], b.u[1], wd / 2), inside(w.v + k * h, b.v[0], b.v[1], h / 2)];
      // `ruim`: room to spare - a word that was moved off goes back to its own place only when that is clearly
      // free, so it does not hop to and fro while the pane eases to a new size
      const free = (step, ruim = 0) => { const [u, v] = at(step); return !placed.some((p) => Math.abs(p.u - u) < (p.w + wd) / 2 + ruim && Math.abs(p.v - v) < h + ruim); };
      const thuis = !was || was.step === STEPS[0];
      const step = free(STEPS[0], thuis ? 0 : 0.35 * h) ? STEPS[0] : was && free(was.step) ? was.step : STEPS.find((st) => free(st)) ?? STEPS[0];
      const glide = was ? was.glide.map((g, i) => g + (step[i] - g) * 0.2) : step;   // the step it is drawn at
      had.set(w.text, { step, glide });
      const [pu, pv] = at(step); const [u, v] = at(glide);
      placed.push({ u: pu, v: pv, w: wd });
      out += `<text x="${f(u)}" y="${f(v)}" fill="${w.kleur}" font-size="${f(font)}" stroke-width="${f(3 * px)}">${esc(w.text)}</text>`;
    }
    out += `<text x="${f(b.u[0] + 6 * px)}" y="${f(b.v[1] - 9 * px)}" class="kr-pane" font-size="${f(10.5 * px)}" stroke-width="${f(3 * px)}">${PANE[view].titel}</text>`;
    return out;
  }

  return {
    set views(v) { views = v; },
    get views() { return views; },
    draw(shapes, items, title) {
      while (svgs.length < views.length) {
        const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'kr-schema'); svg.setAttribute('role', 'img');
        host.append(svg); svgs.push(svg);
      }
      svgs.forEach((svg, i) => { svg.style.display = i < views.length ? '' : 'none'; });
      const gap = 6;
      const width = Math.max((host.clientWidth - gap * (views.length - 1)) / views.length, 120);
      // as high as one pane the full width of the card would be, up to what the page allows - two side by
      // side are as high as one, only narrower: the drawing takes the shape it is given
      if (host.clientWidth !== hostWidth) { hostWidth = host.clientWidth; most = parseFloat(getComputedStyle(svgs[0]).maxHeight) || 340; }
      const height = Math.min(host.clientWidth / ASPECT, most);
      views.forEach((view, i) => {
        const svg = svgs[i];
        svg.style.height = `${Math.round(height)}px`;
        const want = fit(view, shapes, items, width / height);
        const was = boxes[view];
        const ease = (a, z) => (was ? a + (z - a) * 0.12 : z);
        const b = boxes[view] = was ? { u: [ease(was.u[0], want.u[0]), ease(was.u[1], want.u[1])], v: [ease(was.v[0], want.v[0]), ease(was.v[1], want.v[1])] } : want;
        const wM = b.u[1] - b.u[0]; const hM = b.v[1] - b.v[0];
        const px = wM / width;
        svg.setAttribute('viewBox', `${b.u[0]} ${b.v[0]} ${f(wM)} ${f(hM)}`);
        svg.setAttribute('aria-label', `${title}: ${PANE[view].titel}`);
        svg.innerHTML = pane(view, b, shapes, items, px);
      });
    },
    dispose() { for (const s of svgs) s.remove(); },
  };
}
