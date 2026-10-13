import * as THREE from 'three';
import { createLesKaart, schuif, knoppen } from './kaart.js';
import { gevolg } from '../logboek.js';
import { makeHoorn } from '../bpr/hoorn.js';

// Het weer: a lesson after Sint Maarten Kielboot II and III § 2.5, Weersinvloeden - de windkracht in Beaufort,
// tot hoeveel je mag varen, een weersomslag, en ruimen en krimpen. What a windkracht looks like is drawn round the
// boat: waves on the water that grow higher and longer and get white crests, smoke from a chimney on the wal that
// goes from straight up to flat, a tree that bends and shakes, a flag from limp to stiff, and the boat herself,
// heeling more until, past 5 Bft, her sails come off. A weersomslag plays out (clouds piling up, the calm, the
// gust and the wind going round, and then the thunder), and ruimen and krimpen turn the wind on a compass. With no
// wind at all the water lies like glass, she bobs on it with her sails hanging, and a mist comes up that stays as
// long as it is still; in it a ship nobody sees gives its long blast.
//
// The wal, the waves, the smoke, the tree and the flag stand still, and so does the wind over them: it comes from
// +x (W, the way her bow points when she lies in the wind). Up to 5 Bft she sails a course across it (KOERS, ruime
// wind), past that her sails come off and she lies head to wind - she turns about her middle (modes.kracht.plek)
// from one to the other, and the viewer's wind arrow turns with her. Only Ruimen en krimpen turns the wind
// itself, round her on her course; and in the weersomslag it goes round in the gust.

const C = 2.8;
// the windschaal, as the lesboek has it (after the KNMI): Beaufort, name, km/u, what you see
export const BEAUFORT = [
  ['Stil', 'minder dan 1', 'Rook stijgt recht of bijna recht omhoog'],
  ['Zwak', '1–5', 'De windrichting is goed te zien aan rookpluimen'],
  ['Zwak', '6–11', 'Wind merkbaar in je gezicht'],
  ['Matig', '12–19', 'Stof waait op'],
  ['Matig', '20–28', 'Haar in de war, kleding flappert'],
  ['Vrij krachtig', '29–38', 'Gekuifde golven op meren en kanalen'],
  ['Krachtig', '39–49', 'Paraplu’s met moeite vast te houden'],
  ['Hard', '50–61', 'Lastig tegen de wind in lopen of fietsen'],
  ['Stormachtig', '62–74', 'Vooruitkomen gaat heel moeilijk'],
  ['Storm', '75–88', 'Dakpannen waaien weg, kinderen waaien om'],
  ['Zware storm', '89–102', 'Grote schade aan gebouwen, volwassenen waaien om'],
  ['Zeer zware storm', '103–117', 'Enorme schade aan bossen'],
  ['Orkaan', 'meer dan 117', 'Verwoestingen'],
];
const MS = [0.3, 1.5, 3.3, 5.5, 8, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7, 36];   // m/s, the middle of each
// and the range of each, as the KNMI gives it: the CWO asks for m/s at Kielboot III
const MS_RANGE = ['0–0,2', '0,3–1,5', '1,6–3,3', '3,4–5,4', '5,5–7,9', '8,0–10,7', '10,8–13,8', '13,9–17,1', '17,2–20,7', '20,8–24,4', '24,5–28,4', '28,5–32,6', '32,7 of meer'];
// the waves on an inland water such as a big lake: height (m, crest to trough) and length (m)
const GOLF = [0, 0.03, 0.08, 0.18, 0.35, 0.55, 0.8, 1.1, 1.5, 2, 2.5, 3, 3.5];
const golfLengte = (b) => 1.5 + b * 2.2;
const HELLING = [0, 1, 2, 4, 7, 11];                                    // degrees she heels, halve wind, the crew aan loef
const KB3 = 5;                                                          // tot en met: what a Kielboot III may sail in
const KOERS = -120;                                                     // hers up to KB3: ruime wind, the wind over bakboord
const MIDDEN = new THREE.Vector3(C, 0, 0); const OMHOOG = new THREE.Vector3(0, 1, 0);   // her middle, what the camera goes round
const KIJK = { hoogte: 15, breedte: 42, doel: [C + 4, 2, 13], richting: [-0.55, 0.42, -1] };   // from her bakboord side, the wal beyond her
const VER = { hoogte: 30, breedte: 70, doel: [C + 8, 8, 25], richting: [-0.5, 0.3, -1] };     // and further off: the clouds coming up
const VERST = 350;                                                      // m: how far the camera draws while the lesson is open
const SHEET = 900;                                                      // px: up to this wide the card is a sheet at the foot (kaart.js)

export const WEER = [
  {
    id: 'beaufort', titel: 'Windkracht', cwo: 'KB II · KB III',
    kort: [
      'Het weer bepaalt mee of je veilig het water op kunt, samen met je boot, het water en hoeveel ervaring je bemanning heeft. Het belangrijkste is de <b>windkracht</b>.',
      'Die wordt uitgedrukt in de schaal van <b>Beaufort</b> (Bft), van 0 tot 12. Vroeger keek men naar wat de wind in de omgeving doet. Nu hoort er bij elke windkracht een snelheid in km/u.',
    ],
    meer: [{ kop: 'Wat je ziet', tekst: 'Kijk om je heen: rook die recht omhoog gaat of plat wegwaait, vlaggen die slap hangen of strak staan, bomen die bewegen, en golven met of zonder witte koppen. Zo schat je de windkracht ook zonder meter.' }],
    bft: 3, schaal: true,
    vraag: {
      tekst: 'Op het meer zie je golven met witte koppen. Welke windkracht is het ongeveer?',
      opties: [['2 Bft', false], ['3 Bft', false], ['5 Bft', true]],
      uitleg: 'Gekuifde golven, met witte koppen, horen bij 5 Bft: vrij krachtig.',
      laat: { bft: 5 },
    },
  },
  {
    id: 'grens', titel: 'Tot hoeveel Beaufort', cwo: 'KB I · KB II · KB III',
    kort: [
      'Hoeveel wind je aankunt, hoort bij je diploma: <b>Kielboot I</b> tot en met windkracht <b>3</b>, <b>Kielboot II</b> tot en met <b>4</b>, en <b>Kielboot III</b> tot en met <b>5</b>.',
      'Ook bij minder wind kan het te veel zijn: kijk ook naar je boot, het water en je bemanning. In de lelievlet ga je bij meer wind eerst met de bemanning aan loef zitten, en daarna reven.',
    ],
    meer: [{ kop: 'Vlagen', tekst: 'De windkracht in een verwachting is de gemiddelde wind. In vlagen kan het een stuk harder waaien.' }],
    bft: 4, schaal: true,
    vraag: {
      tekst: 'Het waait 6 Bft. Mag je met je Kielboot III varen?',
      opties: [['Ja, als je reeft', false], ['Nee, tot en met 5 Bft', true]],
      uitleg: 'Met Kielboot III vaar je tot en met 5 Bft. Bij 6 Bft blijven de zeilen eraf.',
      laat: { bft: 6 },
    },
  },
  {
    id: 'omslag', titel: 'Weersomslag', cwo: 'KB II · KB III',
    kort: [
      'Bij een <b>weersomslag</b> verandert het weer heel snel: het kan ineens hard gaan waaien, regenen of zelfs stormen.',
      'Let op de tekens: <b>snel opkomende bewolking</b> of wind, <b>bloemkoolwolken</b>, <b>stilte voor de storm</b> en een <b>plotselinge winddraaiing</b>.',
    ],
    meer: [{ kop: 'Op tijd', tekst: 'Zie je de tekens, wacht dan niet af: reef op tijd, of zoek de kant op. Kijk vóór het varen al naar de verwachting, en houd tijdens het varen de lucht in de gaten.' }],
    bft: 3, omslag: true,
    vraag: {
      tekst: 'Welke van deze tekens wijst op een weersomslag?',
      opties: [['Een strakblauwe lucht', false], ['Hoog opbollende bloemkoolwolken', true], ['Een gelijkmatige wind uit dezelfde hoek', false]],
      uitleg: 'Bloemkoolwolken die snel hoger worden, kunnen een bui met harde windstoten brengen.',
    },
  },
  {
    id: 'draaien', titel: 'Ruimen en krimpen', cwo: 'KB II · KB III',
    kort: [
      'De wind kan van richting veranderen. <b>Ruimen</b>: de wind draait met de klok mee, bijvoorbeeld van west naar noordwest. <b>Krimpen</b>: de wind draait tegen de klok in.',
      'Een <b>krimpende</b> wind hoort vaak bij slechter weer. Krimpt de wind flink, houd het weer dan goed in de gaten.',
    ],
    meer: [{ kop: 'Waar de wind vandaan komt', tekst: 'Een windrichting is altijd de richting waar de wind vandaan komt. Een westenwind komt uit het westen en waait naar het oosten.' }],
    bft: 3, kompas: true,
    vraag: {
      tekst: 'De wind draait van west naar zuidwest. Ruimt of krimpt hij?',
      opties: [['Hij ruimt', false], ['Hij krimpt', true]],
      uitleg: 'Van west naar zuidwest is tegen de klok in: de wind krimpt.',
      laat: { richting: 225 },
    },
  },
];

const RICHTING = { 0: 'noord', 45: 'noordoost', 90: 'oost', 135: 'zuidoost', 180: 'zuid', 225: 'zuidwest', 270: 'west', 315: 'noordwest' };
const KOMPAS_KOERS = 0;                                                // where her bow points, in the compass of Ruimen en krimpen

export function initWeer({ sleutel, wrap, scene, camera, controls, modes, fly, setCoveredRight, opslaan, onOpen, dismissProcedure, setDark }) {
  const lk = createLesKaart({ wrap, id: 'les-weer', sleutel, titel: 'Het weer', lessen: WEER, store: 'lelievlet.les.weer.v1', opslaan, fly, setCoveredRight, onOpen });
  const waterline = scene.getObjectByName('lelievlet').userData.tuig?.waterlijn_m ?? 0.3;
  const holder = new THREE.Group(); holder.name = 'les-weer'; holder.visible = false; scene.add(holder);
  const plaatje = document.createElement('div'); plaatje.className = 'les-plaatje'; lk.host.append(plaatje);
  // Windkracht: the waves as a line, from the side, with the lelievlet on them for their size (to scale, both ways:
  // her 5,6 m and her mast at 12 px a metre)
  const DS = 12; const DW = 300; const DH = 130; const DY = 92;        // px a metre; the box; where the still water is
  const doorsnede = document.createElement('div'); doorsnede.className = 'les-plaatje les-golven'; doorsnede.hidden = true;
  doorsnede.innerHTML = `<svg viewBox="0 0 ${DW} ${DH}" role="img" aria-label="De golven van opzij">
    <path class="water" fill="#cfe0ee" stroke="#1b64c4" stroke-width="1.6"/>
    <g class="schuim" fill="#ffffff" stroke="#9fb8cc" stroke-width="0.8"></g>
    <g class="boot"><line x1="-4" y1="-6" x2="-4" y2="-76" stroke="#7a5a2e" stroke-width="2"/>
      <path d="M-34,-7 L34,-9 L29,4 L-28,4 Z" fill="#f2c200" stroke="#36454f" stroke-width="1.2"/></g>
    <text x="8" y="${DH - 8}" font-size="10" fill="#5b6770">Van opzij</text></svg>`;
  lk.host.append(doorsnede);
  const golfLijn = doorsnede.querySelector('.water'); const golfBoot = doorsnede.querySelector('.boot'); const golfSchuim = doorsnede.querySelector('.schuim');

  // ------------------------------------------------------------------ the waves
  // from far out on her bakboord side up to the kade on her stuurboord side
  // far enough every way that its edge is not in sight, from further off either: a grid fine round her (some 40 cm)
  // and ever coarser out to its edges, as far as 150 m along her and 160 m out from the wal
  const WIDE = 300; const KADE = 18; const UIT = 160;
  const golfGeo = (() => {
    const uit = (t, ver) => ver * (0.2 * t + 0.8 * t ** 3);           // 0..1 to metres: fine at first, coarse at the end
    const xs = []; for (let i = -80; i <= 80; i++) xs.push(Math.sign(i) * uit(Math.abs(i) / 80, WIDE / 2));
    const zs = []; for (let i = 70; i >= 1; i--) zs.push(-uit(i / 70, UIT)); for (let i = 0; i <= 25; i++) zs.push((KADE * i) / 25);
    const pos = []; const index = [];
    for (const z of zs) for (const x of xs) pos.push(x, 0, z);
    const n = xs.length;
    for (let j = 0; j < zs.length - 1; j++) for (let i = 0; i < n - 1; i++) { const a = j * n + i; index.push(a, a + n, a + 1, a + 1, a + n, a + n + 1); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(index);
    return g;
  })();
  const base = Float32Array.from(golfGeo.attributes.position.array);
  const colours = new Float32Array(golfGeo.attributes.position.count * 3);
  golfGeo.setAttribute('color', new THREE.BufferAttribute(colours, 3));
  const golfMat = new THREE.MeshStandardMaterial({ vertexColors: true, transparent: true, opacity: 0.82, roughness: 0.35, metalness: 0.05, depthWrite: false });
  // no water inside her: a mask of her waterline, as the viewer's own water has its hole (rig.js makeWater). Close
  // round her the waves lie in her plane, so in plan her waterline stays where it was
  const gat = modes.water.geometry.parameters?.shapes?.holes?.[0]?.getPoints() ?? [];
  const gatKop = { value: 0 };                                          // how far she is turned (plek): the hole turns with her
  if (gat.length > 6) {
    const GAT = { x: -0.6, z: -1.6, w: 7.4, h: 3.2 }; const MW = 512; const MH = 224;
    const canvas = document.createElement('canvas'); canvas.width = MW; canvas.height = MH;
    const g = canvas.getContext('2d'); g.fillStyle = '#000'; g.fillRect(0, 0, MW, MH); g.fillStyle = '#fff'; g.beginPath();
    gat.forEach((p, i) => { const px = ((p.x - GAT.x) / GAT.w) * MW; const py = (1 - (-p.y - GAT.z) / GAT.h) * MH; if (i) g.lineTo(px, py); else g.moveTo(px, py); });
    g.closePath(); g.fill();
    const masker = new THREE.CanvasTexture(canvas);
    masker.generateMipmaps = false; masker.minFilter = THREE.LinearFilter;   // one sharp level: no lod to guess at its edge
    golfMat.onBeforeCompile = (shader) => {
      shader.uniforms.gatMap = { value: masker }; shader.uniforms.gatBox = { value: new THREE.Vector4(GAT.x - C, GAT.z, GAT.w, GAT.h) }; shader.uniforms.gatKop = gatKop;
      shader.vertexShader = shader.vertexShader.replace('#include <common>', '#include <common>\nvarying vec2 vGolf;')
        .replace('#include <begin_vertex>', '#include <begin_vertex>\nvGolf = position.xz;');
      shader.fragmentShader = shader.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vGolf;\nuniform sampler2D gatMap;\nuniform vec4 gatBox;\nuniform float gatKop;')
        .replace('void main() {', `void main() {
  vec2 gatHier = vec2(vGolf.x * cos(gatKop) + vGolf.y * sin(gatKop), -vGolf.x * sin(gatKop) + vGolf.y * cos(gatKop));
  vec2 gatUv = (gatHier - gatBox.xy) / gatBox.zw;
  // read every fragment, not only inside the box: a lookup in a branch has no derivatives at its edge, and dropped
  // fragments there let the sky through in a dashed line round her
  float gatIn = texture2D(gatMap, clamp(gatUv, 0.0, 1.0)).r;
  if (gatUv.x > 0.0 && gatUv.x < 1.0 && gatUv.y > 0.0 && gatUv.y < 1.0 && gatIn > 0.5) discard;`);
    };
  }
  const golven = new THREE.Mesh(golfGeo, golfMat);
  golven.position.set(C, waterline + 0.012, 0); golven.renderOrder = 1; golven.frustumCulled = false; holder.add(golven);
  const DIEP = new THREE.Color('#2f5d7c'); const LICHT = new THREE.Color('#7fa9c4'); const SCHUIM = new THREE.Color('#f4f8fa');
  const tint = new THREE.Color();
  const hash = (x, z) => { const s = Math.sin(x * 12.9898 + z * 78.233) * 43758.5453; return s - Math.floor(s); };

  // ------------------------------------------------------------------ the wal: a house with a chimney, a tree, a flagpole
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...extra });
  const box = (w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); return b; };
  const wal = new THREE.Group(); holder.add(wal);
  wal.add(box(110, 1.2, 30, mat(0x7f9a5c), C, waterline + 0.2, 33));           // the land, a strip along her stuurboord side
  wal.add(box(110, 1.0, 0.6, mat(0x9a9d9f), C, waterline + 0.1, 17.85));        // its kade, out in front of the land (no face shared)
  const huis = new THREE.Group(); huis.position.set(C + 10, waterline + 0.8, 26); wal.add(huis);
  huis.add(box(7, 3.6, 5.5, mat(0xd9cdb6), 0, 1.8, 0));
  // a pyramid square to the walls: turned in its own geometry, then stretched along them (turning the mesh would
  // stretch it askew)
  const dak = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 4.4, 2.6, 4, 1).rotateY(Math.PI / 4), mat(0x8a3b2a));
  dak.scale.set(1.15, 1, 0.9); dak.position.set(0, 4.9, 0); huis.add(dak);
  huis.add(box(0.7, 2.7, 0.7, mat(0x7a3a2a), 1.8, 4.95, 0.8));                   // from the top of the walls: it stays when the roof goes
  const schoorsteen = new THREE.Vector3(C + 10 + 1.8, waterline + 0.8 + 6.4, 26 + 0.8);
  const boom = new THREE.Group(); boom.position.set(C - 6, waterline + 0.8, 22); wal.add(boom);
  const buig = new THREE.Group(); boom.add(buig);
  const stam = box(0.45, 4.5, 0.45, mat(0x5b4330), 0, 2.25, 0); buig.add(stam);
  const blad = mat(0x4f7a3a); const kruin = [];
  for (const [x, y, z, r] of [[0, 5.6, 0, 2.1], [0.9, 4.8, 0.6, 1.5], [-1, 4.9, -0.4, 1.5], [0.2, 6.8, -0.3, 1.4]]) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 14, 10), blad); s.position.set(x, y, z); buig.add(s); kruin.push(s);
  }
  // struck by lightning in the weersomslag: the leaves gone, the trunk black - until the lesson starts it again
  const STAM = stam.material.color.getHex();
  const verkool = (ja) => { for (const s of kruin) s.visible = !ja; stam.material.color.setHex(ja ? 0x1d1a17 : STAM); };
  // the flagpole, on the kade, and its flag: limp in no wind, stiff in a lot
  const POOL = 8; const FW = 1.5; const FH = 1.0; const NU = 20;
  const paal = new THREE.Group(); paal.position.set(C + 22, waterline + 0.8, 20); wal.add(paal);
  paal.add(box(0.12, POOL, 0.12, mat(0xe6e6e6), 0, POOL / 2, 0));
  const vlagGeo = new THREE.PlaneGeometry(FW, FH, NU, 2); vlagGeo.translate(FW / 2, -FH / 2, 0);
  const canvas = document.createElement('canvas'); canvas.width = 4; canvas.height = 3;
  const paint = canvas.getContext('2d');
  ['#ae1c28', '#ffffff', '#21468b'].forEach((c, i) => { paint.fillStyle = c; paint.fillRect(0, i, 4, 1); });
  const vlagTex = new THREE.CanvasTexture(canvas); vlagTex.magFilter = THREE.NearestFilter; vlagTex.colorSpace = THREE.SRGBColorSpace;
  const vlag = new THREE.Mesh(vlagGeo, new THREE.MeshStandardMaterial({ map: vlagTex, side: THREE.DoubleSide, roughness: 0.85 }));
  const vlagHouder = new THREE.Group(); vlagHouder.position.y = POOL - 0.05; vlagHouder.add(vlag); paal.add(vlagHouder);
  const vlagRust = Float32Array.from(vlagGeo.attributes.position.array);
  const rand = new Float32Array(2 * (NU + 1));            // the top edge, [x, y] per column from the pole out

  // ------------------------------------------------------------------ smoke from the chimney
  const rookTex = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d');
    const grad = g.createRadialGradient(32, 32, 2, 32, 32, 30); grad.addColorStop(0, 'rgba(255,255,255,1)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  })();
  const ROOK = 46; const LEVEN = 7;
  const rook = Array.from({ length: ROOK }, (_, i) => {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: rookTex, color: 0xb9bdc2, transparent: true, depthWrite: false }));
    s.userData.leeftijd = (i / ROOK) * LEVEN; s.userData.zij = (hash(i, 3) - 0.5) * 2; holder.add(s); return s;
  });

  // ------------------------------------------------------------------ clouds, for the weersomslag
  const wolken = new THREE.Group(); holder.add(wolken);
  const wolkMat = mat(0xf2f3f5, { roughness: 1 }); const wolkDonker = mat(0x6e767e, { roughness: 1 });
  for (const [x, y, z, r, donker] of [[0, 0, 0, 9, true], [9, 1, 2, 8, true], [-9, 0.5, -1, 8, true], [2, 9, 0, 8, false], [-4, 15, 1, 7, false], [4, 20, -1, 6.5, false], [0, 25, 0, 6, false], [-1, 30, 1, 7.5, false], [7, 29, 0, 5, false]]) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), donker ? wolkDonker : wolkMat); s.position.set(x, y, z); s.scale.y = donker ? 0.55 : 1; wolken.add(s);
  }

  // ------------------------------------------------------------------ the thunderstorm, at the end of the weersomslag
  // a bolt from under the clouds down to the water, struck afresh each time; the sky lit up while it stands, and the
  // thunder after it, later the further off it is
  const schichtMat = new THREE.MeshBasicMaterial({ color: 0xf4f6ff, fog: false });
  const schicht = new THREE.Mesh(new THREE.BufferGeometry(), schichtMat); schicht.visible = false; holder.add(schicht);
  const gloed = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0xb8c8ff, transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  schicht.add(gloed);
  const flitsLicht = new THREE.AmbientLight(0xdfe6ff, 0); holder.add(flitsLicht);
  const slaInslag = (boven, onder = null) => {
    const pts = [boven.clone()]; const p = boven.clone(); const stap = (boven.y - (onder?.y ?? waterline)) / 9;
    for (let i = 0; i < 9; i++) {
      p.x += (Math.random() - 0.5) * 3.5; p.z += (Math.random() - 0.5) * 3.5; p.y -= stap;
      // to a point: drawn in on it as it comes down, so it ends there
      pts.push(onder ? p.clone().lerp(onder, ((i + 1) / 9) ** 2) : p.clone());
    }
    if (onder) pts[pts.length - 1].copy(onder); else pts[pts.length - 1].y = waterline;
    const pad = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.1);
    schicht.geometry.dispose(); gloed.geometry.dispose();
    schicht.geometry = new THREE.TubeGeometry(pad, 48, 0.6, 5, false); gloed.geometry = new THREE.TubeGeometry(pad, 48, 2.2, 6, false);
  };
  let onweer = null;                                                   // { volgende, flits, n, boom, gezien }: under way in the gust
  const kijk = new THREE.Vector3(); const wolkDoel = new THREE.Vector3(); const tmpV = new THREE.Vector3();
  let wolkGezet = false; let farWas = null;                                               // the clouds stand where the view looks: from then on eased
  // thunder from Web Audio: a low noise that cracks and then rolls away. Its context is made and started from a click
  // (ontgrendel: Laat het weer omslaan, the windkracht to 0) - Safari keeps one started from a frame silent - and all
  // of it goes through one bus, so what is still to come can be silenced at once (stilte)
  let geluid = null; let donderBus = null;
  const ontgrendel = () => {
    try {
      const Ctx = window.AudioContext ?? window.webkitAudioContext;
      if (Ctx && !geluid) { geluid = new Ctx(); donderBus = geluid.createGain(); donderBus.connect(geluid.destination); }
      geluid?.resume?.();
    } catch { /* no sound: the flash is enough */ }
    misthoorn.unlock();
  };
  const stilte = () => {
    if (!geluid) return;
    donderBus.disconnect(); donderBus = geluid.createGain(); donderBus.connect(geluid.destination);
  };
  const donder = (over) => {
    if (!geluid) return;
    try {
      const at = geluid.currentTime + over; const duur = 3.2;
      const buf = geluid.createBuffer(1, Math.ceil(geluid.sampleRate * duur), geluid.sampleRate); const d = buf.getChannelData(0);
      let laag = 0; for (let i = 0; i < d.length; i++) { laag += ((Math.random() * 2 - 1) - laag) * 0.04; d[i] = laag * 6; }
      const bron = geluid.createBufferSource(); bron.buffer = buf;
      const filter = geluid.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(900, at); filter.frequency.exponentialRampToValueAtTime(120, at + duur);
      const g = geluid.createGain(); g.gain.setValueAtTime(0, at); g.gain.linearRampToValueAtTime(0.7, at + 0.06); g.gain.exponentialRampToValueAtTime(0.001, at + duur);
      bron.connect(filter); filter.connect(g); g.connect(donderBus); bron.start(at); bron.stop(at + duur);
    } catch { /* no sound: the flash is enough */ }
  };

  // ------------------------------------------------------------------ mist, in a calm
  // the scene's own fog, thickening from the camera out, over a dome of the same grey that takes the sky away
  const MIST = new THREE.Color('#ccd3d8');
  const mistFog = new THREE.Fog(MIST, 1000, 2000);
  const koepel = new THREE.Mesh(new THREE.SphereGeometry(150, 24, 12), new THREE.MeshBasicMaterial({ color: MIST, side: THREE.BackSide, transparent: true, opacity: 0, depthWrite: false, fog: false }));
  koepel.renderOrder = -1; koepel.frustumCulled = false; koepel.visible = false; holder.add(koepel);
  let mist = 0; let mistGemeld = false; let fogWas = null; let mistSein = 0;
  const misthoorn = makeHoorn({ gain: 0.35 });                         // a ship far off in it: softer than one close by
  const MIST_OP = 14; const MIST_WEG = 3;                              // s: coming up slowly in the calm, lifting quickly in a wind
  const MIST_SEIN = 22;                                                // s between the blasts of the ship in the mist
  let dobberFase = 0;

  // ------------------------------------------------------------------ state
  // each motion keeps its own phase, moved on by its speed now: a change of windkracht changes how fast it goes,
  // without a jump (a time times a speed that changes would race through the change)
  let golfFase = 0; let boomFase = 0; let vlagFase = 0;
  // the storm's damage, 0 standing .. 1 down: from 10 Bft the tree goes over, from 11 the flagpole, at 12 the roof
  // blows off the house (and with less wind they stand again: it is a lesson)
  const schade = { boom: 0, paal: 0, dak: 0 };
  const SCHADE_BIJ = { boom: 10, paal: 11, dak: 12 };
  let bft = 3; let shownBft = 3; let heel = 0; let tuigWas = null;
  let richting = 270;                                                  // Ruimen en krimpen: where the wind comes from, compass degrees
  let omslag = null;                                                   // the weersomslag under way: { t }
  let W = 0; let wDoel = 0;                                            // the wind over the wal (radians, 0: from +x), and where it goes
  let koersWas = null;
  const les = () => lk.les;
  const tuig = (rig) => { if (modes.current().tuig !== rig) { modes.apply({ tuig: rig }, { direct: true }); dismissProcedure?.(); } };
  // past KB3 the sails come off and she lies head to wind; up to it they go up, and she is back on her course
  const zetBft = (b) => {
    bft = Math.max(0, Math.min(12, b));
    if (bft === 0) ontgrendel();                                       // from the slider or the table: the misthoorn may sound
    const op = modes.current().tuig === 'op';
    tuig(bft > KB3 ? 'gestreken' : 'op');
    if (bft <= KB3 && (!op || Math.abs(modes.state.course - KOERS) > 1) && !les()?.kompas) modes.apply({ koers: KOERS });
    if (les()?.schaal) toonSchaal();
    lk.renderControls();
  };
  // Ruimen en krimpen: the wind from `richting` with her bow to the north, as the course of the viewer
  const zetRichting = (r) => {
    richting = r; const rel = ((r - KOMPAS_KOERS + 540) % 360) - 180;   // off her bow, + over stuurboord
    modes.apply({ koers: rel }); toonKompas(); lk.renderControls();
  };

  // a row of the table clicked: that windkracht; on a phone only the rows round this one, and a button for all
  let heleTabel = false;
  plaatje.addEventListener('click', (e) => {
    if (e.target.closest('.les-hele-tabel')) { heleTabel = !heleTabel; toonSchaal(); return; }
    const tr = e.target.closest('tr[data-bft]'); if (tr && !omslag) zetBft(Number(tr.dataset.bft));
  });
  const SMAL = 900;                                                    // px: the card is a sheet over the boat (lessen/kaart.js)
  const toonSchaal = () => {
    const kort = wrap.clientWidth <= SMAL && !heleTabel;
    plaatje.innerHTML = `<table class="les-tabel"><thead><tr><th>Bft</th><th>Naam</th><th>m/s</th><th>km/u</th><th>Wat je ziet</th></tr></thead><tbody>${BEAUFORT.map(([naam, kmu, wat], b) =>
      `<tr data-bft="${b}" class="${b === bft ? 'nu' : ''} ${b > KB3 ? 'te-veel' : ''}"${kort && Math.abs(b - bft) > 1 ? ' hidden' : ''}><td>${b}</td><td>${naam}</td><td>${MS_RANGE[b]}</td><td>${kmu}</td><td>${wat}</td></tr>`).join('')}</tbody></table>${
      wrap.clientWidth <= SMAL ? `<button type="button" class="link-button les-hele-tabel">${heleTabel ? 'Minder van de tabel' : 'De hele tabel'}</button>` : ''}`;
    if (!kort) plaatje.querySelector('tr.nu')?.scrollIntoView?.({ block: 'nearest' });
  };
  const toonKompas = () => {
    const R = 90; const cx = 120; const cy = 115;
    const pt = (deg, r) => [cx + r * Math.sin((deg * Math.PI) / 180), cy - r * Math.cos((deg * Math.PI) / 180)];
    const [ax, ay] = pt(richting, R - 6); const [bx, by] = pt(richting, 34);
    const boog = (from, to, r, kleur, label) => {
      const [x0, y0] = pt(from, r); const [x1, y1] = pt(to, r); const sweep = to > from ? 1 : 0;
      const [lx, ly] = pt((from + to) / 2, r + 14);
      return `<path d="M${x0},${y0} A${r},${r} 0 0 ${sweep} ${x1},${y1}" fill="none" stroke="${kleur}" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#pijl-${kleur.slice(1)})"/><text x="${lx}" y="${ly}" fill="${kleur}">${label}</text>`;
    };
    plaatje.innerHTML = `<svg viewBox="0 0 240 230" role="img" aria-label="Kompas met de windrichting">
      <defs>${['#16833a', '#c0262d', '#1b64c4'].map((k) => `<marker id="pijl-${k.slice(1)}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 Z" fill="${k}"/></marker>`).join('')}</defs>
      <rect width="240" height="230" fill="#e3eef5"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="#9aa5ae"/>
      <g font-family="inherit" font-weight="600" font-size="14" text-anchor="middle" dominant-baseline="middle" fill="#36454f">
        <text x="${cx}" y="${cy - R + 13}">N</text><text x="${cx + R - 12}" y="${cy}">O</text><text x="${cx}" y="${cy + R - 12}">Z</text><text x="${cx - R + 12}" y="${cy}">W</text>
      </g>
      <g font-family="inherit" font-weight="600" font-size="12" text-anchor="middle" paint-order="stroke" stroke="#fff" stroke-width="3">
        ${boog(richting + 12, richting + 42, R + 2, '#16833a', 'ruimen')}${boog(richting - 12, richting - 42, R + 2, '#c0262d', 'krimpen')}
      </g>
      <line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="#1b64c4" stroke-width="4" marker-end="url(#pijl-1b64c4)"/>
      <path d="M${cx},${cy - 22} C${cx + 9},${cy - 8} ${cx + 8},${cy + 14} ${cx + 6},${cy + 20} L${cx - 6},${cy + 20} C${cx - 8},${cy + 14} ${cx - 9},${cy - 8} ${cx},${cy - 22} Z" fill="#f7f4ec" stroke="#36454f"/>
    </svg>`;
  };

  lk.koppel({
    begin(l) {
      if (tuigWas === null) { tuigWas = modes.current().tuig; koersWas = modes.state.course; }
      if (modes.state.mode !== 'zeilen') modes.apply({ modus: 'zeilen' });
      modes.dock.schoon();
      omslag = null; onweer = null; setDark?.(0); verkool(false); wolkGezet = false;
      // the bui stands far off, beyond what the viewer otherwise draws: the camera reaches further while the lesson is open
      if (farWas === null) { farWas = camera.far; camera.far = Math.max(camera.far, VERST); camera.updateProjectionMatrix(); }
      // the mist's fog is the scene's for as long as the lesson is open - far beyond what is drawn until there is mist -
      // so no material has to be built again when the mist comes up or lifts
      if (fogWas === null) { fogWas = scene.fog ?? false; scene.fog = mistFog; }
      mist = 0; koepel.visible = false; mistFog.near = 1e5; mistFog.far = 2e5; misthoorn.stop();
      // the waves are the water here: the flat disc of the viewer would stay put while she rides them, and show in her
      holder.visible = true; modes.water.visible = false; wolken.visible = Boolean(l.omslag); wolken.scale.setScalar(0.15);
      const rows = [];
      W = 0; wDoel = 0;
      if (l.kompas) { modes.apply({ koers: -90 }); zetRichting(270); bft = l.bft; tuig('op'); }
      else { modes.apply({ koers: KOERS }); zetBft(l.bft); }
      doorsnede.hidden = !l.schaal;
      if (l.schaal) rows.push(schuif('Windkracht', { min: 0, max: 12, step: 1 }, () => bft, zetBft, (b) => `${b} Bft, ${BEAUFORT[b][0].toLowerCase()}`, ['windstil', 'orkaan']));
      if (l.omslag) {
        plaatje.innerHTML = '';
        rows.push(knoppen([['speel', 'Laat het weer omslaan', true], ['terug', 'Opnieuw']], (k) => {
          if (k === 'speel') { omslag = { t: 0 }; ontgrendel(); }
          else { omslag = null; onweer = null; stilte(); W = 0; wDoel = 0; zetBft(l.bft); setDark?.(0); verkool(false); wolken.scale.setScalar(0.15); modes.apply({ koers: KOERS }); lk.frame(); }
          lk.renderControls();
        }, (k) => (k === 'speel' ? !omslag : true)));
      }
      if (l.kompas) {
        rows.push(knoppen([['ruim', 'Ruimen'], ['krimp', 'Krimpen']], (k) => zetRichting(richting + (k === 'ruim' ? 45 : -45)),
          (k) => (k === 'ruim' ? richting + 45 <= 315 : richting - 45 >= 180)));
      }
      return rows;
    },
    antwoord(laat) {
      if (laat.bft !== undefined) zetBft(laat.bft);
      if (laat.richting !== undefined) zetRichting(laat.richting);
    },
    release() {
      holder.visible = false; modes.water.visible = true; heel = 0; Object.assign(modes.kracht, { heel: 0, vlag: null, slap: 0, deining: null, plek: null }); setDark?.(null);
      if (tuigWas) tuig(tuigWas);
      if (koersWas !== null) modes.apply({ koers: koersWas });
      tuigWas = null; koersWas = null; omslag = null; onweer = null; verkool(false); stilte(); geluid?.suspend?.();
      if (farWas !== null) { camera.far = farWas; camera.updateProjectionMatrix(); farWas = null; }
      schicht.visible = false; flitsLicht.intensity = 0; misthoorn.stop();
      mist = 0; koepel.visible = false; if (fogWas !== null) { scene.fog = fogWas || null; fogWas = null; }
    },
    aanzicht: () => (les().omslag ? VER : KIJK),
  });

  // ------------------------------------------------------------------ every frame
  function update(dt, width) {
    if (!lk.tick(width)) return;
    const l = les();
    // the weersomslag: the clouds pile up, then the calm, then the gust and the wind going round
    let fase = '';
    if (omslag) {
      omslag.t += dt; const u = omslag.t;
      wolken.scale.setScalar(THREE.MathUtils.lerp(0.15, 1, Math.min(u / 6, 1)));
      setDark?.(Math.min(u / 9, 1) * 0.45);
      if (u < 6) fase = 'Snel opkomende bewolking: bloemkoolwolken worden hoger en hoger.';
      else if (u < 9) { if (bft !== 1) zetBft(1); fase = 'Stilte voor de storm: de wind valt bijna weg.'; }
      else {
        if (bft !== 7) { zetBft(7); wDoel = W + Math.PI / 4; }           // the wind goes round 45°, and she with it, head to wind
        fase = 'Een harde windstoot, en de wind draait plotseling. De zeilen moesten er al af zijn.';
        // and then the thunderstorm: a flash, now and then, out of the clouds
        onweer ??= { volgende: 10.2, flits: -1, gezien: false, n: 0, boom: false };
        if (u >= onweer.volgende) {
          onweer.flits = 0; onweer.volgende = u + 3 + Math.random() * 4; onweer.n += 1;
          if (onweer.n === 2) {
            // the second one strikes the tree on the wal, the highest point near: from under the clouds, the thunder at once
            const top = holder.worldToLocal(buig.localToWorld(new THREE.Vector3(0, 7.4, 0)));
            // from high over it, leaning a little towards the bui: down on the tree, not across the scene
            const van = top.clone().setY(top.y + 20).lerp(tmpV.set(wolken.position.x, top.y + 20, wolken.position.z), 0.25);
            slaInslag(van, top); donder(0.05); onweer.boom = true;          // black once the flash is gone
          } else {
            // from under the near edge of the clouds, the side the view looks from
            const r = (Math.random() - 0.5) * 16; const rand = camera.position.clone().sub(wolken.position).setY(0).setLength(12);
            // down onto something that is there - the land, or the water - nearer than the bui when it stands beyond
            // them, and straight down from its height there
            const p = new THREE.Vector3(wolken.position.x + rand.x + r * 0.6, waterline, wolken.position.z + rand.z + r);
            p.x = THREE.MathUtils.clamp(p.x, C - 140, C + 140); p.z = Math.max(p.z, -150);
            if (p.z > KADE && (Math.abs(p.x - C) > 52 || p.z > 46)) p.z = KADE - 2;   // past the land: on the water before the kade
            if (p.z > KADE) p.y = waterline + 0.8;                              // on the land
            slaInslag(p.clone().setY(wolken.position.y - 4).lerp(tmpV.set(wolken.position.x, wolken.position.y - 4, wolken.position.z), 0.3), p);
            donder(1.5 + Math.random() * 1.5);
          }
          if (!onweer.gezien) { onweer.gezien = true; gevolg('onweer'); }
        }
        if (onweer.gezien) {
          fase = onweer.boom ? 'De bliksem sloeg in de boom: het hoogste punt in de buurt. Op het water is dat jouw mast. Ga zo snel mogelijk van het water af.'
            : 'Onweer! Op het water is de mast het hoogste punt, en daar slaat de bliksem makkelijk in. Ga zo snel mogelijk van het water af.';
        }
      }
    }
    // a flash: two flickers, the bolt standing while they last, and the sky lit up
    let licht = 0;
    if (onweer && onweer.flits >= 0) {
      onweer.flits += dt; const f = onweer.flits;
      licht = f < 0.09 ? 1 : f < 0.15 ? 0 : f < 0.3 ? 0.8 : 0;
      if (f >= 0.3) { onweer.flits = -1; if (onweer.boom) verkool(true); }
    }
    schicht.visible = licht > 0; flitsLicht.intensity = 2.5 * licht;
    if (omslag && omslag.t >= 6) setDark?.(licht > 0 ? 0.05 : Math.min(omslag.t / 9, 1) * 0.45);
    shownBft += (bft - shownBft) * (1 - Math.exp(-dt * 1.5));
    const b = shownBft; const bi = Math.round(b);
    // her wind, off her bow; the wind over the wal (W), the same but for Ruimen en krimpen, where it turns about her;
    // and she, turned so that the one is the other (modes.kracht.plek)
    const haarWind = Math.atan2(Math.sin(modes.dock.wind), Math.cos(modes.dock.wind));
    if (l.kompas) { W = haarWind; wDoel = W; } else W += (wDoel - W) * (1 - Math.exp(-dt * 1.2));
    const gier = l.kompas ? 0 : Math.atan2(Math.sin(W - haarWind), Math.cos(W - haarWind));
    modes.kracht.plek = { x: 0, z: 0, kop: gier, pijlMee: true }; gatKop.value = gier;
    const wind = W;
    // the weersomslag: when the wind goes round, the camera goes round her with it, so the bui stays in sight
    if (omslag && omslag.wind !== undefined) {
      const draai = Math.atan2(Math.sin(wind - omslag.wind), Math.cos(wind - omslag.wind));
      if (Math.abs(draai) > 1e-5 && camera && controls) {
        for (const p of [camera.position, controls.target]) p.sub(MIDDEN).applyAxisAngle(OMHOOG, -draai).add(MIDDEN);
        controls.update();
      }
    }
    if (omslag) omslag.wind = wind;
    const wx = Math.cos(wind); const wz = Math.sin(wind);                // where it comes from
    const dx = -wx; const dz = -wz;                                     // where it blows to
    const side = Math.sign(haarWind) || 1;
    const ms = THREE.MathUtils.lerp(MS[Math.floor(b)], MS[Math.min(Math.floor(b) + 1, 12)], b - Math.floor(b));

    // waves running downwind: three trains a little apart, the height and length of this windkracht,
    // calm in her own lee so they do not run through her
    const H = THREE.MathUtils.lerp(GOLF[Math.floor(b)], GOLF[Math.min(Math.floor(b) + 1, 12)], b - Math.floor(b));
    const lambda = golfLengte(b); const k = (2 * Math.PI) / lambda; const w = Math.sqrt(9.81 * k);
    const trains = [[0, 0.5], [0.4, 0.3], [-0.5, 0.2]].map(([a, f]) => [Math.cos(a) * dx - Math.sin(a) * dz, Math.sin(a) * dx + Math.cos(a) * dz, f, a * 3.1]);
    golfFase += w * dt;
    const kop = Math.max(0, Math.min((b - 4.3) / 1.5, 1));             // white crests from 5 Bft (gekuifde golven)
    const breken = Math.max(0, Math.min((b - 6) / 2, 1));               // and from 7 they roll over and break
    if (!doorsnede.hidden) {
      // the higher the wind, the sharper the crests and the flatter the troughs between them
      const scherp = 1 + 1.2 * kop + 0.8 * breken;
      const vorm = (th) => 2 * ((1 + Math.sin(th)) / 2) ** scherp - 1;
      const hoogte = (x) => DY - (H / 2) * DS * vorm(k * (x / DS) - golfFase);
      let d = `M0,${DH}`;
      for (let x = 0; x <= DW; x += 3) d += ` L${x},${hoogte(x).toFixed(1)}`;
      golfLijn.setAttribute('d', `${d} L${DW},${DH} Z`);
      // she rides the waves: up and down with the water under her, and along its slope
      const helling = (Math.atan2(hoogte(DW / 2 + 20) - hoogte(DW / 2 - 20), 40) * 180) / Math.PI;
      golfBoot.setAttribute('transform', `translate(${DW / 2},${hoogte(DW / 2).toFixed(1)}) rotate(${helling.toFixed(1)})`);
      // on every crest a white cap, on the side it runs to; breaking, a crest that curls over down its front
      let schuim = '';
      if (kop > 0) {
        const L = (2 * Math.PI * DS) / k;                              // px from crest to crest
        const eerste = ((Math.PI / 2 + golfFase) / k) * DS;
        for (let xc = eerste - Math.ceil(eerste / L + 1) * L; xc < DW + L; xc += L) {
          const yc = hoogte(xc); const w = L * (0.06 + 0.1 * kop);
          let d = `M${(xc - w * 0.4).toFixed(1)},${hoogte(xc - w * 0.4).toFixed(1)}`;
          for (let u = -0.4; u <= 1.001; u += 0.2) d += ` L${(xc + u * w).toFixed(1)},${(hoogte(xc + u * w) - 1.5 * kop).toFixed(1)}`;
          for (let u = 1; u >= -0.401; u -= 0.2) d += ` L${(xc + u * w).toFixed(1)},${(hoogte(xc + u * w) + 1.2).toFixed(1)}`;
          schuim += `<path d="${d} Z"/>`;
          if (breken > 0) {
            const c = Math.min(L * 0.18, 26) * breken;                 // how far the lip reaches out over the front
            schuim += `<path d="M${xc.toFixed(1)},${(yc - 1).toFixed(1)} C${(xc + c * 0.7).toFixed(1)},${(yc - c * 0.45).toFixed(1)} ${(xc + c * 1.15).toFixed(1)},${(yc + c * 0.1).toFixed(1)} ${(xc + c * 0.9).toFixed(1)},${(yc + c * 0.45).toFixed(1)} C${(xc + c * 0.75).toFixed(1)},${(yc + c * 0.15).toFixed(1)} ${(xc + c * 0.45).toFixed(1)},${(yc + c * 0.05).toFixed(1)} ${(xc + c * 0.15).toFixed(1)},${(hoogte(xc + c * 0.15) + 1).toFixed(1)} Z"/>`;
          }
        }
      }
      golfSchuim.innerHTML = schuim;
    }
    const pos = golfGeo.attributes.position;
    const donker = Math.min(b / 9, 1);
    // she rides them: up and down with the water under her middle, her bow and her side along its slope. Close
    // round her the water lies in that plane, so no wave runs through her
    const golf = (x, z) => { let y = 0; for (const [ux, uz, f, p] of trains) y += Math.sin(k * (x * ux + z * uz) * (1 + p * 0.05) - golfFase + p) * f; return (y * H) / 2; };
    // (along her and across her as she is turned now: hx her bow, hz her stuurboord side)
    const hx = [Math.cos(gier), Math.sin(gier)]; const hz = [-Math.sin(gier), Math.cos(gier)];
    const h0 = golf(0, 0);
    const sx = (golf(2 * hx[0], 2 * hx[1]) - golf(-2 * hx[0], -2 * hx[1])) / 4;
    const sz = (golf(0.8 * hz[0], 0.8 * hz[1]) - golf(-0.8 * hz[0], -0.8 * hz[1])) / 1.6;
    // with no wind on glassy water she bobs a little, all the same
    dobberFase += dt; const kalm = Math.max(0, 1 - b);
    modes.kracht.deining = { op: h0 + kalm * 0.012 * Math.sin(dobberFase * 1.4), stamp: Math.atan(sx) + kalm * 0.004 * Math.sin(dobberFase * 0.9 + 1),
                             rol: -Math.atan(sz) + kalm * 0.012 * Math.sin(dobberFase * 1.1) };

    // mist: it comes up while it is windstil, and only then; a wind blows it away. The fog runs out from the camera,
    // so she stays in sight, faint, and the wal goes
    mist = Math.max(0, Math.min(1, mist + (bft === 0 && b < 0.5 ? dt / MIST_OP : -dt / MIST_WEG)));
    const m = mist * mist * (3 - 2 * mist);
    if (m > 0.001) {
      const ver = camera.position.distanceTo(MIDDEN);
      mistFog.near = THREE.MathUtils.lerp(ver * 3, ver * 0.7, m); mistFog.far = THREE.MathUtils.lerp(ver * 6, ver + 14, m);
      koepel.visible = true; koepel.position.copy(camera.position); koepel.material.opacity = 0.97 * m ** 1.5;
    } else if (koepel.visible) { mistFog.near = 1e5; mistFog.far = 2e5; koepel.visible = false; }
    if (mist >= 0.95 && !mistGemeld) { mistGemeld = true; gevolg('mist'); }
    // in thick mist, now and then, a ship nobody sees: one long blast
    if (mist >= 0.9) { mistSein -= dt; if (mistSein <= 0) { mistSein = MIST_SEIN; misthoorn.play('l'); } }
    else mistSein = 4;
    for (let i = 0; i < pos.count; i++) {
      const x = base[3 * i]; const z = base[3 * i + 2];
      const xh = x * hx[0] + z * hx[1]; const zh = x * hz[0] + z * hz[1];   // in her frame
      const rondBoot = Math.hypot(xh / 4.2, zh / 1.6);
      const stil = THREE.MathUtils.smoothstep(rondBoot, 1, 2.6);
      const vlak = h0 + sx * xh + sz * zh;
      const kant = 1 - THREE.MathUtils.smoothstep(z, KADE - 6, KADE - 0.6);   // against the kade they die down: none run through it
      const y = vlak + (golf(x, z) * kant - vlak) * stil;
      pos.setY(i, y);
      const top = H > 0 ? y / (H / 2) : 0;
      tint.copy(LICHT).lerp(DIEP, donker * 0.8 + 0.2 * (1 - top) * 0.5);
      if (kop > 0 && top > 0.72 && hash(Math.round(x * 3), Math.round(z * 3)) < kop * 0.55) tint.lerp(SCHUIM, Math.min((top - 0.72) * 5, 1));
      colours[3 * i] = tint.r; colours[3 * i + 1] = tint.g; colours[3 * i + 2] = tint.b;
    }
    pos.needsUpdate = true; golfGeo.attributes.color.needsUpdate = true; golfGeo.computeVertexNormals();

    // smoke: straight up in no wind, ever flatter and shorter as it blows
    const stijg = 0.9 / (1 + ms / 2.5);
    for (const s of rook) {
      s.userData.leeftijd = (s.userData.leeftijd + dt) % LEVEN; const a = s.userData.leeftijd;
      const drift = ms * 0.55 * a; const op = stijg * a + 0.15 * Math.sin(a * 1.3 + s.userData.zij);
      const across = s.userData.zij * (0.15 + 0.08 * a);
      s.position.set(schoorsteen.x + dx * drift - dz * across, schoorsteen.y + op, schoorsteen.z + dz * drift + dx * across);
      const groot = 0.5 + a * (0.35 + ms * 0.05);
      s.scale.setScalar(groot); s.material.opacity = 0.55 * (1 - a / LEVEN) * (1 / (1 + ms / 30));
    }

    // the tree bends away from the wind, and shakes the harder the more it blows
    boomFase += dt * (1.2 + b * 0.35);
    const krom = Math.min(b, 10) / 10 * 0.32 + Math.sin(boomFase) * 0.012 * b;
    for (const k of Object.keys(schade)) schade[k] = Math.max(0, Math.min(1, schade[k] + (b > SCHADE_BIJ[k] - 0.5 ? dt : -dt) * 0.7));
    const val = (v) => v * v;                                           // slow at first, then faster, as a fall goes
    const omver = new THREE.Vector3(dz, 0, -dx).normalize();             // turning about it leans a thing downwind
    buig.quaternion.setFromAxisAngle(omver, krom * (1 - schade.boom) + val(schade.boom) * 1.45);
    if (schade.boom >= 0.99) gevolg('omgewaaid');
    paal.quaternion.setFromAxisAngle(omver, val(schade.paal) * 1.5);
    // the roof lifts, flies off downwind tumbling, and lands on the land beyond the house
    const d = val(schade.dak);
    dak.position.set(dx * 6.5 * d, 4.9 + 3.5 * Math.sin(Math.PI * Math.min(d * 1.2, 1)) - 3.3 * d, dz * 6.5 * d);   // still on the land, also with the wind off it
    dak.quaternion.setFromAxisAngle(omver, d * 2.6);

    // the flag: downwind, hanging in no wind, flapping faster and standing out stiffer as it blows
    // out a quarter more with every Beaufort up to 4, then straight out and flapping ever harder - the one on the
    // kade and hers on the boat alike; with no wind her sails hang limp
    const strak = Math.min(b / 4, 1); const harder = Math.max(b - 4, 0) / 8;
    modes.kracht.vlag = strak + harder; modes.kracht.slap = Math.max(1 - b, 0);
    // both corners at the pole stay on it: the top edge bends down the further it is from the pole, the less it
    // blows, and the cloth hangs straight down from it
    vlagHouder.rotation.set(0, Math.atan2(-dz, dx), 0);
    const zak = (1 - strak) * (Math.PI / 2) * 0.95;
    for (let j = 1; j <= NU; j++) {
      const a = zak * ((j - 0.5) / NU) ** 0.8;
      rand[2 * j] = rand[2 * j - 2] + (Math.cos(a) * FW) / NU; rand[2 * j + 1] = rand[2 * j - 1] - (Math.sin(a) * FW) / NU;
    }
    const vp = vlagGeo.attributes.position; const golfje = 0.04 + 0.08 * strak + 0.08 * harder; const snel = 1.5 + 6 * strak + 9 * harder;
    vlagFase += dt * snel;
    for (let i = 0; i < vp.count; i++) {
      const u = vlagRust[3 * i] / FW; const j = Math.round(u * NU);
      vp.setXYZ(i, rand[2 * j], rand[2 * j + 1] + vlagRust[3 * i + 1], Math.sin(vlagFase - u * 7) * golfje * u);
    }
    vp.needsUpdate = true; vlagGeo.computeVertexNormals();

    // the clouds where the view looks, whichever way it is turned or zoomed: out beyond what it looks at, left of the
    // middle (the card is on the right; on a phone it is a sheet at the foot), and so far off that they stand above the
    // horizon - nearer when the view looks down so steeply that they would be above the top of it. Eased after the camera.
    if (wolken.visible) {
      kijk.set(width > SHEET ? -0.3 : 0, 0, 0.5).unproject(camera).sub(camera.position).setY(0);
      if (kijk.lengthSq() > 1e-8) {
        kijk.normalize();
        // and within what the camera draws: all of it, its top too, short of camera.far
        const boven = waterline + 14 + 32 * wolken.scale.y - camera.position.y; const bereik = camera.far * 0.9 - 12;
        let ver = Math.min(Math.max(60, camera.position.distanceTo(controls.target) + 45), Math.sqrt(Math.max(bereik ** 2 - boven ** 2, 0)));
        for (let i = 0; i < 10; i++) {
          wolkDoel.set(camera.position.x, waterline + 14, camera.position.z).addScaledVector(kijk, ver);
          if (tmpV.copy(wolkDoel).setY(wolkDoel.y + 15 * wolken.scale.y).project(camera).y <= 0.7 || ver < 25) break;
          ver *= 0.8;
        }
        if (wolkGezet) wolken.position.lerp(wolkDoel, 1 - Math.exp(-dt * 2.5)); else { wolken.position.copy(wolkDoel); wolkGezet = true; }
      }
    }

    // she heels with it, the crew aan loef, until the sails come off
    const wil = bi > KB3 || modes.current().tuig !== 'op' ? 0 : -side * THREE.MathUtils.degToRad(HELLING[Math.min(bi, KB3)]);
    heel += (wil - heel) * (1 - Math.exp(-dt * 2)); modes.kracht.heel = heel;

    const [naam, kmu, wat] = BEAUFORT[bft];
    let status = l.kompas ? `De wind komt uit het ${RICHTING[((richting % 360) + 360) % 360]}.`
      : fase || `${bft} Bft, ${naam.toLowerCase()} (${MS_RANGE[bft]} m/s, ${kmu} km/u): ${wat.charAt(0).toLowerCase()}${wat.slice(1)}.`;
    if (!l.kompas && !fase && bft > KB3) status += ' Met Kielboot III vaar je niet meer: de zeilen zijn eraf.';
    const dicht = mist >= 0.9;
    if (!fase && mist > 0.15) status = dicht ? 'Dichte mist: je ziet bijna niets meer. Hoor je een lange stoot? Dat is een schip dat je niet ziet. Vaar langzaam, dicht langs de kant, en luister goed.'
      : bft === 0 ? 'Windstil: de zeilen hangen slap en het water is spiegelglad. Er komt mist op.' : 'Er komt wind: de mist trekt op.';
    // over your limit (then you do not sail), the gust of the weersomslag: rood; its signs coming up: watch out
    const niveau = l.kompas ? '' : fase ? (omslag?.t >= 9 ? 'rood' : 'geel') : bft > KB3 ? 'rood' : dicht ? 'geel' : '';
    lk.status(status, niveau);
  }

  return { update, open: lk.open, close: lk.close, onderwerpen: WEER,
           dispose: () => {
             lk.dispose(); holder.removeFromParent(); golfGeo.dispose(); vlagTex.dispose(); rookTex.dispose();
             schicht.geometry.dispose(); gloed.geometry.dispose(); misthoorn.close(); geluid?.close?.();
           } };
}
