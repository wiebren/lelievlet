import * as THREE from 'three';
import { CONFIGS, makeShip } from '../bpr/schepen.js';
import { createPijlen } from '../krachten/pijlen.js';
import { createKaart } from '../zeiltermen/kaart.js';
import { deckOutline } from './boot.js';
import { BREED, C, LANG, RONDE, T, landen, plan, vaar, vloot, vo } from './voorrang-pad.js';

// What a situatie of Voorrang looks like, on the water and in the map of the card: the lelievlet and the other
// boats (bpr/schepen.js) on their way (lessen/voorrang-pad.js), the banks, the wind, and once it is answered who
// goes first and who gives way. For the lesson (lessen/voorrang.js: she is 'jij', the other 'de ander') and the
// quiz (lessen/voorrang-quiz.js: A, B and C, sit.letters, one of them her).
//
//   zet(sit)              a new situatie: they lie still where they set out
//   antwoord()            it was answered: they go, from the start, and the one who gives way does
//   update(dt, w, h, blad) a frame; blad: whether the map is in sight
//   kijk()                where the camera goes (krachtView's names, main.js)
//   release()             the card closes

const SCHIP = { motor: 'klein_motorschip_a', zeil: 'klein_zeilschip_lt7m', spier: 'klein_schip_spierkracht', groot: 'groot_motorschip' };
const KLEUR = { voor: '#16833a', wijkt: '#c96f00', ander: '#36454f', wind: '#1b64c4' };

export function createVoorrangBeeld({ scene, camera, controls, parts, modes, layer, host }) {
  const waterline = scene.getObjectByName('lelievlet').userData.tuig?.waterlijn_m ?? 0.3;
  const deck = deckOutline(parts, scene);
  const haar = { x0: Math.min(...deck.map((q) => q[0])) - C, x1: Math.max(...deck.map((q) => q[0])) - C, r: Math.max(...deck.map((q) => Math.abs(q[1]))) };
  const pijlen = createPijlen({ scene, camera, controls, layer });
  const kaart = createKaart(host);
  const holder = new THREE.Group(); holder.name = 'les-voorrang'; holder.visible = false; scene.add(holder);
  // the banks of the water: along her course, of an engte, or of a vaarwater across it
  const wal = new THREE.Group(); holder.add(wal);
  const landMat = new THREE.MeshStandardMaterial({ color: 0x7f9a5c, roughness: 0.9 });
  const strook = (x0, x1, z0, z1) => { const b = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 1.0, z1 - z0), landMat); b.position.set((x0 + x1) / 2, waterline + 0.1, (z0 + z1) / 2); return b; };

  // more water: the viewer's own is a disc of 14 m round her (rig.js makeWater), and the others sail far beyond it -
  // so a ring of the same water goes on from its edge while Voorrang is open, with it as it moves along with her
  const zee = new THREE.Mesh(new THREE.RingGeometry(13.98, 320, 96, 1), modes.water?.material);
  zee.position.set(C, 0, 0); zee.renderOrder = 1;
  const meerWater = (aan) => { if (!modes.water) return; if (aan) modes.water.add(zee); else zee.removeFromParent(); };

  // the groot schip a short one, some 30 m, for room and time between them; one of each soort per place in the row
  const built = new Map();
  const bouw = (soort, i) => {
    const key = `${soort}#${i}`;
    if (!built.has(key)) built.set(key, makeShip({ ...CONFIGS.find((c) => c.id === SCHIP[soort]), lengte: LANG[soort], breedte: BREED[soort] }));
    return built.get(key);
  };

  let sit = null; let boten = []; let schepen = []; let wijk = null; let gaan = false; let t = 0;
  const quiz = () => Boolean(sit?.letters);

  let windBij = null;                                             // points of their ways, for where the wind goes in the map
  function zet(s) {
    sit = s; gaan = false; t = 0; kader = null; windBij = null;
    for (const m of schepen) m?.removeFromParent();
    boten = vloot(sit);
    schepen = boten.map((b, i) => (b.haar ? null : bouw(b.soort, i)));
    for (const m of schepen) if (m) holder.add(m);
    // her own way of going: under sail on the course of the situatie, or rowing
    if (sit.jij === 'roeien') { if (modes.state.mode !== 'roeien') modes.apply({ modus: 'roeien' }); modes.apply({ commando: 'slag' }); }
    else { if (modes.state.mode !== 'zeilen') modes.apply({ modus: 'zeilen' }); if (modes.current().tuig !== 'op') modes.apply({ tuig: 'op' }); modes.apply({ koers: sit.koers }); }
    wal.clear();
    for (const [x0, x1, z0, z1] of landen(sit)) wal.add(strook(x0, x1, z0, z1));
    wijk = plan(sit, haar);
    holder.visible = true; meerWater(true);
  }
  const antwoord = () => { gaan = true; t = 0; };

  // the map's frame, the same all the way: round where they all set out and where they would be at the end
  let kader = null;
  // each one by its place (her middle, the others' stern) and its bow, so a long ship is in it whole
  const romptop = (p, i) => {
    if (boten[i].haar) return [[p.x + haar.x0 * Math.cos(p.kop), p.z + haar.x0 * Math.sin(p.kop)], [p.x + haar.x1 * Math.cos(p.kop), p.z + haar.x1 * Math.sin(p.kop)]];
    const lang = LANG[boten[i].soort];
    return [[p.x, p.z], [p.x + lang * Math.cos(p.kop), p.z + lang * Math.sin(p.kop)]];
  };
  const omvang = () => {
    const a = vaar(sit, 0, null); const b = vaar(sit, RONDE, null);
    const pts = [...a.flatMap(romptop), ...b.flatMap(romptop)].concat(sit.treffen ? [sit.treffen] : [[C, 0]]);
    const xs = pts.map((q) => q[0]); const zs = pts.map((q) => q[1]);
    return [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
  };
  const kaderNu = () => {
    if (kader) return kader;
    const [x0, x1, z0, z1] = omvang();
    kader = [[x0 - 6, z0 - 6], [x1 + 6, z0 - 6], [x1 + 6, z1 + 6], [x0 - 6, z1 + 6]];
    return kader;
  };
  // the view stands still over the whole of it: from where she sets out to beyond where they meet
  const kijk = () => {
    const groot = boten.some((b) => b.soort === 'groot');
    if (!sit || !quiz()) {
      const [mx, mz] = sit?.treffen ?? [C + 6, 0];
      const van = C - (sit ? vo(sit) : 1.4) * T;
      return { hoogte: groot ? 44 : 26, breedte: groot ? 100 : 48, doel: [(van + mx) / 2 + 3, 0, mz / 2], richting: [-0.55, 1, 0.6] };
    }
    // the quiz: round where they all set out and where they meet, seen a little from aside
    const pts = vaar(sit, 0, null).flatMap(romptop).concat([[C, 0]]);
    const xs = pts.map((q) => q[0]); const zs = pts.map((q) => q[1]);
    const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
    const breedte = Math.max(groot ? 70 : 44, (x1 - x0) * 1.4, (z1 - z0) * 1.9);
    return { hoogte: breedte * 0.6, breedte, doel: [(x0 + x1) / 2, 0, (z0 + z1) / 2], richting: [-0.55, 1, 0.6] };
  };

  // who goes first, by place in the row: hers is 0
  const voorrang = (i) => !boten[i].wijkt;
  const naam = (i) => (quiz() ? sit.letters[i] : i === 0 ? 'jij' : '');
  // what it says by each once answered: voorrang or wijkt; of three, its place in the order (1e, 2e, 3e)
  const wat = (i) => (sit.antwoord?.length === 3 ? `${sit.antwoord.indexOf(sit.letters[i]) + 1}e` : voorrang(i) ? 'voorrang' : 'wijkt');
  // where a boat's word goes on the map: square to its way or ahead of or behind it, wherever it is furthest from the
  // other boats (their hulls, by a few points along each) and from the words already put down
  const plekLabel = (i, p, mid, geplaatst, nu) => {
    const c = Math.cos(p.kop); const s = Math.sin(p.kop);
    const lang = boten[i].haar ? haar.x1 - haar.x0 : LANG[boten[i].soort];
    const af = 3.5 + (boten[i].haar ? 0 : BREED[boten[i].soort] / 2);
    const kandidaten = [[s * af, -c * af], [-s * af, c * af], [c * (lang / 2 + 3), s * (lang / 2 + 3)], [-c * (lang / 2 + 3), -s * (lang / 2 + 3)]]
      .map(([dx, dz]) => [mid[i][0] + dx, mid[i][1] + dz]);
    const anderen = [];
    nu.forEach((q, j) => {
      if (j === i) return;
      const [a, b] = romptop(q, j);
      for (let k = 0; k <= 4; k++) anderen.push([a[0] + (b[0] - a[0]) * k / 4, a[1] + (b[1] - a[1]) * k / 4]);
    });
    anderen.push(...geplaatst);
    const ruimte = (pt) => Math.min(...anderen.map((q) => Math.hypot(q[0] - pt[0], q[1] - pt[1])), Infinity);
    const beste = kandidaten.reduce((x, y) => (ruimte(y) > ruimte(x) + 0.5 ? y : x));
    geplaatst.push(beste);
    return beste;
  };
  const romp = (lang, breed) => [[0, -breed / 2], [lang * 0.8, -breed / 2], [lang, 0], [lang * 0.8, breed / 2], [0, breed / 2]];

  function update(dt, width, height, blad) {
    if (!sit) return;
    if (gaan) t += dt;                                                    // still until it is answered
    const nu = vaar(sit, t % RONDE, gaan ? wijk : null);
    const jij = nu[0];
    modes.kracht.plek = { x: jij.x - C, z: jij.z, kop: jij.kop };
    // a point of her, from where she lies now (the boat's frame) to where she is on her way
    const opHaar = ([x, z]) => [jij.x + (x - C) * Math.cos(jij.kop) - z * Math.sin(jij.kop), jij.z + (x - C) * Math.sin(jij.kop) + z * Math.cos(jij.kop)];
    // each other one: its stern where the path is, its bow along its heading; mid, its middle
    const mid = nu.map((p, i) => {
      if (boten[i].haar) return [p.x, p.z];
      const s = schepen[i]; s.position.set(p.x, waterline, p.z); s.rotation.y = -p.kop; s.userData.update?.(t, 0, camera);
      const lang = s.userData.length ?? LANG[boten[i].soort];
      return [p.x + Math.cos(p.kop) * lang / 2, p.z + Math.sin(p.kop) * lang / 2];
    });
    const hoog = (i) => (boten[i].haar ? 3.2 : boten[i].soort === 'groot' ? 6 : 4);

    // on the water: who is who (the quiz), and once answered who goes first (not on the first page of the lesson:
    // there it is only what kind of meeting it is)
    const items = [];
    nu.forEach((p, i) => {
      const w = gaan && !sit.ontmoeting ? wat(i) : '';
      const label = quiz() ? (w ? `${naam(i)}: ${w}` : naam(i)) : w && (i === 0 ? `jij: ${w}` : w);
      if (label) items.push({ type: 'tekst', at: [mid[i][0], hoog(i), mid[i][1]], label, kleur: !w ? KLEUR.ander : voorrang(i) ? KLEUR.voor : KLEUR.wijkt });
    });
    pijlen.visible = true; pijlen.draw(items); pijlen.update(width, height);

    if (!blad) return;
    const m = []; const geplaatst = [];
    for (const [x0, x1, z0, z1] of landen(sit)) m.push({ type: 'vlak', pts: [[x0, z0], [x1, z0], [x1, z1], [x0, z1]], fill: '#c5cdb0' });
    nu.forEach((p, i) => {
      const b = boten[i]; const c = Math.cos(p.kop); const s = Math.sin(p.kop);
      if (b.haar) {
        m.push({ type: 'pijl', from: opHaar([C + 3.5, 0]), vec: [c * 6, s * 6], kleur: KLEUR.ander, dun: true });
        m.push({ type: 'vlak', pts: deck.map(opHaar), fill: '#f7f4ec', stroke: '#36454f' });
      } else {
        const lang = schepen[i].userData.length ?? LANG[b.soort];
        m.push({ type: 'pijl', from: [p.x + c * lang, p.z + s * lang], vec: [c * 6, s * 6], kleur: KLEUR.ander, dun: true });
        m.push({ type: 'vlak', pts: romp(lang, BREED[b.soort]).map(([x, z]) => [p.x + x * c - z * s, p.z + x * s + z * c]), fill: '#9aa5ae', stroke: KLEUR.ander });
      }
      const at = plekLabel(i, p, mid, geplaatst, nu);
      const w = gaan && !sit.ontmoeting ? wat(i) : '';
      const label = quiz() ? (w ? `${naam(i)}: ${w}` : naam(i)) : w;
      if (label) m.push({ type: 'tekst', at, label, kleur: !w ? KLEUR.ander : voorrang(i) ? KLEUR.voor : KLEUR.wijkt });
      if (!quiz() && i === 0) m.push({ type: 'tekst', at: [p.x, p.z + 4], label: 'jij', kleur: KLEUR.ander, klein: true });
    });
    if (sit.jij === 'zeilen' || boten.some((b) => b.soort === 'zeil')) {
      // the wind as one arrow on the side it comes from, at the edge of the map and as big as the map is (a fixed
      // 3 m was a speck in the map of a groot schip)
      const w = THREE.MathUtils.degToRad(sit.koers); const wx = Math.cos(w); const wz = Math.sin(w);
      const k = kaderNu(); const [x0, z0] = k[0]; const [x1, z1] = k[2];
      const midden = [(x0 + x1) / 2, (z0 + z1) / 2];
      const L = THREE.MathUtils.clamp(Math.max(x1 - x0, z1 - z0) * 0.12, 3, 14);
      // to the edge of the frame the wind comes from (a ray from its middle), then along that edge where it is furthest
      // from the boats' ways - worked out once, so that it stands still; each arrow and the word kept inside the frame
      const hx = (x1 - x0) / 2; const hz = (z1 - z0) / 2;
      const rand = Math.min(Math.abs(wx) > 1e-6 ? hx / Math.abs(wx) : Infinity, Math.abs(wz) > 1e-6 ? hz / Math.abs(wz) : Infinity) - L * 0.6;
      const binnen = (a, b) => {                                          // shift a stretch a..b so that all of it is inside
        const m = L * 0.25; const sh = [0, 0];
        for (const k of [0, 1]) {
          const lo = (k ? z0 : x0) + m; const hi = (k ? z1 : x1) - m;
          const min = Math.min(a[k], b[k]); const max = Math.max(a[k], b[k]);
          sh[k] = min < lo ? lo - min : max > hi ? hi - max : 0;
        }
        return [[a[0] + sh[0], a[1] + sh[1]], [b[0] + sh[0], b[1] + sh[1]]];
      };
      const bij = windBij ??= [0, 0.25, 0.5, 0.75, 1].flatMap((f) => vaar(sit, f * RONDE, null).map((q) => [q.x, q.z]));
      const verst = [-0.6, -0.3, 0, 0.3, 0.6].map((t) => t * Math.max(hx, hz)).map((d) => {
        const [c] = binnen([midden[0] + wx * (rand - L / 2) - wz * d, midden[1] + wz * (rand - L / 2) + wx * d], [midden[0] + wx * (rand - L / 2) - wz * d, midden[1] + wz * (rand - L / 2) + wx * d]);
        return { d, ruim: Math.min(...bij.map((q) => Math.hypot(q[0] - c[0], q[1] - c[1]))) };
      }).sort((a, b) => b.ruim - a.ruim)[0].d;
      const a = [midden[0] + wx * rand - wz * verst, midden[1] + wz * rand + wx * verst];
      const [from, to] = binnen(a, [a[0] - wx * L, a[1] - wz * L]);
      m.push({ type: 'pijl', from, vec: [to[0] - from[0], to[1] - from[1]], kleur: KLEUR.wind });
      // the word beside it, square to the wind, clear of the arrow itself
      const [woord] = binnen(...Array(2).fill([midden[0] + wx * (rand - L / 2) - wz * (verst + 0.7 * L), midden[1] + wz * (rand - L / 2) + wx * (verst + 0.7 * L)]));
      m.push({ type: 'tekst', at: woord, label: 'wind', kleur: KLEUR.wind });
    }
    // the map stands still too: its frame alone sets what it takes in, not the boats going by
    for (const it of m) it.fit = false;
    m.unshift({ type: 'vlak', pts: kaderNu(), fill: 'none', stroke: 'none' });
    kaart.draw({ frame: 'boot', wind: 0, centre: [C, 0], min: [30, 30], items: m, titel: quiz() ? 'Van bovenaf' : sit.naam });
  }

  const release = () => { holder.visible = false; pijlen.visible = false; meerWater(false); modes.kracht.plek = null; sit = null; if (modes.state.mode !== 'zeilen') modes.apply({ modus: 'zeilen' }); };
  const dispose = () => { pijlen.dispose(); kaart.dispose(); meerWater(false); zee.geometry.dispose(); holder.removeFromParent(); };
  return { zet, antwoord, update, kijk, release, dispose, haar, get sit() { return sit; }, get wijk() { return wijk; } };
}
