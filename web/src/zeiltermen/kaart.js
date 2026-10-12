// Zeiltermen as a map in the card: the boat from above, with the wind, the wallen, the koersen and her
// track, the way the lesboek draws them. Two ways round: 'boot', the bow up and stuurboord to the right;
// 'wind', the wind coming from the top (Sint Maarten fig. 1.1 to 1.7), and the boat turned as she lies in it.
//
// Everything is given in the boat's frame, flat: [x, z] in metres, x to the bow, z to stuurboord (index.js
// works them out from the 3D boat). The map turns them and fits a box round what is drawn:
//
//   { type: 'vlak', pts, fill, fit }                  an area: the deck, a wal (fit false: only its near edge counts)
//   { type: 'lijn', pts, kleur, px, dashed, fit }     a line or a track
//   { type: 'pijl', from, vec, kleur, label, dun }    an arrow from `from` along `vec` (labelAt: where along it its word goes)
//   { type: 'boog', pts, kleur, label }               a line along `pts` with a head at its end: a turn
//   { type: 'punt', at, kleur, r }                    a dot: the mast
//   { type: 'tekst', at, label, kleur, klein, groot } a word on its own; groot: big, in a ring (a question's ?)
//
// Lines and words are sized in screen pixels, so a map that takes in a whole wal has no bigger letters.

const NS = 'http://www.w3.org/2000/svg';
const ASPECT = 1.05;
const f = (n) => Math.round(n * 1000) / 1000;
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

export function createKaart(host) {
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('class', 'kr-schema zt-kaart'); svg.setAttribute('role', 'img');
  host.append(svg);
  let box = null; let frameWas = '';
  let most = 340; let hostWidth = -1;

  return {
    /**
     * frame: 'boot' or 'wind'; wind: the wind off her bow (radians, + : over stuurboord); centre: [x, z] the map
     * turns about (her middle); min: [w, h] in metres the map takes in at least; items as above. hoek: the wind
     * as a small arrow in the top right-hand corner, out of the way of a track (with the wind from the top only).
     */
    draw({ frame, wind, centre, min = [9, 9], items, titel, hoek = false }) {
      const [cx, cz] = centre;
      const wx = Math.cos(wind); const wz = Math.sin(wind);
      // to the screen: [right, down]. 'boot': right is stuurboord, up the bow; 'wind': up where the wind comes from
      const P = frame === 'boot' ? ([x, z]) => [z - cz, -(x - cx)]
        : ([x, z]) => { const dx = x - cx; const dz = z - cz; return [-dx * wz + dz * wx, -(dx * wx + dz * wz)]; };
      if (host.clientWidth !== hostWidth) { hostWidth = host.clientWidth; most = parseFloat(getComputedStyle(svg).maxHeight) || 340; }
      const width = Math.max(host.clientWidth, 120);
      const height = Math.min(width / ASPECT, most);
      svg.style.height = `${Math.round(height)}px`;

      // the box: round everything that counts, at least `min`, in the shape of the pane; eased, unless the map turned round
      let u0 = Infinity; let u1 = -Infinity; let v0 = Infinity; let v1 = -Infinity;
      const take = (p) => { const [u, v] = P(p); u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); };
      for (const it of items) {
        if (it.fit === false) continue;
        if (it.pts) it.pts.forEach(take);
        if (it.from) { take(it.from); take([it.from[0] + it.vec[0], it.from[1] + it.vec[1]]); }
        if (it.at) take(it.at);
      }
      if (u0 === Infinity) { u0 = v0 = -1; u1 = v1 = 1; }
      const pad = 1.2; u0 -= pad; u1 += pad; v0 -= pad; v1 += pad;
      let w = Math.max(u1 - u0, min[0]); let h = Math.max(v1 - v0, min[1]);
      const aspect = width / height;
      if (w / h < aspect) w = h * aspect; else h = w / aspect;
      const want = { u: (u0 + u1) / 2 - w / 2, v: (v0 + v1) / 2 - h / 2, w, h };
      const k = box && frame === frameWas ? 0.1 : 1;
      box = box && k < 1 ? { u: box.u + (want.u - box.u) * k, v: box.v + (want.v - box.v) * k, w: box.w + (want.w - box.w) * k, h: box.h + (want.h - box.h) * k } : want;
      frameWas = frame;
      const px = box.w / width;
      svg.setAttribute('viewBox', `${f(box.u)} ${f(box.v)} ${f(box.w)} ${f(box.h)}`);
      svg.setAttribute('aria-label', titel);

      let out = `<rect x="${f(box.u)}" y="${f(box.v)}" width="${f(box.w)}" height="${f(box.h)}" fill="#e3eef5"/>`;
      const words = [];
      const head = ([u1, v1], [du, dv], size, kleur) => {
        const len = Math.hypot(du, dv) || 1; const eu = du / len; const ev = dv / len;
        const hl = 4.5 * size; const hw = 2 * size; const bu = u1 - eu * hl; const bv = v1 - ev * hl;
        return `<polygon points="${f(u1)},${f(v1)} ${f(bu - ev * hw)},${f(bv + eu * hw)} ${f(bu + ev * hw)},${f(bv - eu * hw)}" fill="${kleur}"/>`;
      };
      for (const it of items) {
        if (it.type === 'vlak') {
          out += `<polygon points="${it.pts.map((p) => P(p).map(f).join(',')).join(' ')}" fill="${it.fill}" stroke="${it.stroke ?? 'none'}" stroke-width="${f(1.3 * px)}" stroke-linejoin="round"/>`;
        } else if (it.type === 'lijn') {
          const pts = it.pts.map((p) => P(p).map(f).join(',')).join(' ');
          out += `<polyline points="${pts}" fill="none" stroke="${it.kleur}" stroke-width="${f((it.px ?? 1.5) * px)}" stroke-linecap="round" stroke-linejoin="round"${it.dashed ? ` stroke-dasharray="${f(5 * px)} ${f(4 * px)}"` : ''}${it.opacity ? ` stroke-opacity="${it.opacity}"` : ''}/>`;
        } else if (it.type === 'pijl') {
          const [a, b] = P(it.from); const [c, d] = P([it.from[0] + it.vec[0], it.from[1] + it.vec[1]]);
          const size = (it.dun ? 1.6 : 2.6) * px;
          const len = Math.hypot(c - a, d - b); if (len < 4 * px) continue;
          const back = Math.min(4.5 * size, len * 0.45) * 0.9;
          out += `<line x1="${f(a)}" y1="${f(b)}" x2="${f(c - ((c - a) / len) * back)}" y2="${f(d - ((d - b) / len) * back)}" stroke="${it.kleur}" stroke-width="${f(size)}" stroke-linecap="round"/>`;
          out += head([c, d], [c - a, d - b], size, it.kleur);
          const t = it.labelAt ?? 0.5;
          if (it.label) words.push({ u: a + (c - a) * t - ((d - b) / len) * 10 * px, v: b + (d - b) * t + ((c - a) / len) * 10 * px, text: it.label, kleur: it.kleur });
        } else if (it.type === 'boog') {
          const pts = it.pts.map(P); if (pts.length < 3) continue;
          out += `<polyline points="${pts.slice(0, -1).map((p) => p.map(f).join(',')).join(' ')}" fill="none" stroke="${it.kleur}" stroke-width="${f(2 * px)}" stroke-dasharray="${f(6 * px)} ${f(4 * px)}"/>`;
          const [eu, ev] = pts[pts.length - 1]; const [pu, pv] = pts[pts.length - 3];
          out += head([eu, ev], [eu - pu, ev - pv], 2 * px, it.kleur);
          if (it.label) { const [mu, mv] = pts[Math.floor(pts.length / 2)]; words.push({ u: mu, v: mv, text: it.label, kleur: it.kleur }); }
        } else if (it.type === 'punt') {
          const [u, v] = P(it.at);
          out += `<circle cx="${f(u)}" cy="${f(v)}" r="${f((it.r ?? 3) * px)}" fill="${it.kleur}"/>`;
        } else if (it.type === 'tekst') {
          const [u, v] = P(it.at); words.push({ u, v, text: it.label, kleur: it.kleur, klein: it.klein, groot: it.groot });
        }
      }
      // the words last, over everything, each moved down a line while it would sit on one before it
      const placed = [];
      for (const wd of words) {
        const font = (wd.groot ? 22 : wd.klein ? 10.5 : 12) * px; const lh = 1.25 * font; const half = (wd.text.length * 0.56 * font) / 2 + 2 * px;
        let { v } = wd;
        for (let i = 0; i < 6 && placed.some((p) => Math.abs(p.u - wd.u) < p.half + half && Math.abs(p.v - v) < lh); i++) v += lh;
        placed.push({ u: wd.u, v, half });
        // a big one (what a question points at) in a ring of its colour
        if (wd.groot) out += `<circle cx="${f(wd.u)}" cy="${f(v - 0.35 * font)}" r="${f(0.75 * font)}" fill="#fff" stroke="${wd.kleur}" stroke-width="${f(2.5 * px)}"/>`;
        out += `<text x="${f(wd.u)}" y="${f(v)}" fill="${wd.kleur}" font-size="${f(font)}"${wd.groot ? ' font-weight="800"' : ''} stroke-width="${f(3 * px)}">${esc(wd.text)}</text>`;
      }
      if (hoek) {
        const u = box.u + box.w - 22 * px; const v0 = box.v + 24 * px; const v1 = v0 + 26 * px;
        out += `<line x1="${f(u)}" y1="${f(v0)}" x2="${f(u)}" y2="${f(v1 - 9 * px)}" stroke="#1b64c4" stroke-width="${f(2.6 * px)}" stroke-linecap="round"/>`;
        out += head([u, v1], [0, 1], 2.6 * px, '#1b64c4');
        out += `<text x="${f(u)}" y="${f(box.v + 13 * px)}" fill="#1b64c4" font-size="${f(12 * px)}" stroke-width="${f(3 * px)}">wind</text>`;
      }
      out += `<text x="${f(box.u + 6 * px)}" y="${f(box.v + box.h - 9 * px)}" class="kr-pane" font-size="${f(10.5 * px)}" stroke-width="${f(3 * px)}">Van bovenaf</text>`;
      svg.innerHTML = out;
    },
    dispose() { svg.remove(); },
  };
}
