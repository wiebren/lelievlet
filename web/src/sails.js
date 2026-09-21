import * as THREE from 'three';

// Paints the sails: cloth, panel seams, edge tape, zeilteken and sail number.
// Layout data comes from the model (extras.zeil, written by pipeline/sails.py); sizes follow the
// Vlettenboek p. 58: lelie + V 38 cm wide, cijfers 30 x 20 cm, stuurboord het hoogst.
//
// Texture space: u runs from the luff aft to the leech, v runs up. The mesh faces port, so the
// port texture is drawn as-is and the starboard one (seen from behind) gets its artwork mirrored.

const CLOTH = '#ece7d8';
const PX_PER_M = 620;

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Sail numbers as the Vlettenboek prescribes them: 30 cm high, 20 cm wide, 5 cm stroke. They are
// drawn as centre lines stroked at constant width, so every digit is equally heavy (a font glyph
// stretched into the box makes a narrow "1" far bolder than the rest).
// Coordinates in cm inside a 20 x 30 box, y down; centre lines stay 2.5 cm inside the box.
const PI = Math.PI;
const DIGITS = {
  0: (c) => { c.roundRect(2.5, 2.5, 15, 25, 7); },
  1: (c) => { c.moveTo(1.5, 9.5); c.lineTo(8.5, 2.5); c.lineTo(8.5, 30); },
  2: (c) => { c.ellipse(10, 9.5, 7.5, 7, 0, PI, 2.2 * PI); c.lineTo(3.2, 27.5); c.lineTo(20, 27.5); },
  3: (c) => { c.ellipse(10, 8.75, 7.5, 6.25, 0, 1.15 * PI, 2.5 * PI); c.ellipse(10, 21.25, 7.5, 6.25, 0, 1.5 * PI, 2.85 * PI); },
  4: (c) => { c.moveTo(20, 20.5); c.lineTo(3.2, 20.5); c.lineTo(14, 1.5); c.moveTo(14, 0); c.lineTo(14, 30); },
  5: (c) => {                                  // upright and bowl as separate strokes: no join artefact
    c.moveTo(18.5, 2.5); c.lineTo(4.7, 2.5); c.lineTo(4.7, 15.2);
    c.moveTo(4.7, 13.84); c.ellipse(10, 19.5, 7.5, 8, 0, 1.25 * PI, 2.8 * PI);
  },
  6: (c) => { c.moveTo(16.5, 2.5); c.bezierCurveTo(7, 2.5, 2.5, 9, 2.5, 20); c.ellipse(10, 20, 7.5, 7.5, 0, PI, 3 * PI); },
  7: (c) => { c.moveTo(0, 2.5); c.lineTo(17.5, 2.5); c.lineTo(7, 30); },
  8: (c) => { c.ellipse(10, 8.5, 6.75, 6, 0, 0, 2 * PI); c.moveTo(17.5, 21); c.ellipse(10, 21, 7.5, 6.5, 0, 0, 2 * PI); },
  9: (c) => { c.moveTo(3.5, 27.5); c.bezierCurveTo(13, 27.5, 17.5, 21, 17.5, 10); c.ellipse(10, 10, 7.5, 7.5, 0, 0, 2 * PI); },
};
const ADVANCE = { 1: 11 };                     // a "1" is narrower than the 20 cm box

export function drawDigits(ctx, text, centerX, top, boxW, boxH, gap) {
  const cm = boxH / 30;                          // pixels per centimetre
  const gapCm = gap / cm;
  const widths = [...text].map((ch) => ADVANCE[ch] ?? 20);
  let x = -(widths.reduce((a, w) => a + w, 0) + gapCm * (text.length - 1)) / 2;
  ctx.save();
  ctx.translate(centerX, top);
  ctx.scale(cm, cm);
  ctx.lineWidth = 5; ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; ctx.miterLimit = 2;
  ctx.strokeStyle = ctx.fillStyle;
  [...text].forEach((ch, i) => {
    ctx.save();
    ctx.translate(x, 0);
    if (DIGITS[ch]) {
      ctx.beginPath(); DIGITS[ch](ctx); ctx.stroke();
    } else {                                     // letters (class rules allow a suffix): font, not stretched
      ctx.font = '700 41px "Helvetica Neue", Helvetica, Arial, sans-serif';
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'center';
      ctx.fillText(ch.toUpperCase(), 10, 30);
    }
    ctx.restore();
    x += widths[i] + gapCm;
  });
  ctx.restore();
}

function paint(canvas, zeil, side, emblem, number) {
  const W = canvas.width; const H = canvas.height;
  const ctx = canvas.getContext('2d');
  const X = (u) => u * W; const Y = (v) => (1 - v) * H;
  const px = (metres) => metres * PX_PER_M;

  ctx.fillStyle = CLOTH;
  ctx.fillRect(0, 0, W, H);

  const outline = new Path2D();
  zeil.omtrek.forEach(([u, v], i) => (i ? outline.lineTo(X(u), Y(v)) : outline.moveTo(X(u), Y(v))));
  outline.closePath();

  ctx.save();
  ctx.clip(outline);

  // seams: 2 cm overlap with a row of stitching on either side
  for (const [u0, v0, u1, v1] of zeil.naden) {
    const ax = X(u0), ay = Y(v0), bx = X(u1), by = Y(v1);
    ctx.lineCap = 'butt';
    ctx.strokeStyle = 'rgba(70, 60, 40, 0.13)';
    ctx.lineWidth = px(0.02);
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    const len = Math.hypot(bx - ax, by - ay); const nx = -(by - ay) / len; const ny = (bx - ax) / len;
    ctx.strokeStyle = 'rgba(60, 50, 35, 0.55)';
    ctx.lineWidth = Math.max(1, px(0.0022));
    ctx.setLineDash([px(0.006), px(0.004)]);
    for (const s of [-1, 1]) {
      const o = s * px(0.008);
      ctx.beginPath(); ctx.moveTo(ax + nx * o, ay + ny * o); ctx.lineTo(bx + nx * o, by + ny * o); ctx.stroke();
    }
    ctx.setLineDash([]);
  }

  // 60 mm tape along the edges. Strokes are centred on the edge and clipped to the sail, so a
  // stroke of 12 cm shows 6 cm; a dark stroke under a slightly narrower light one leaves the
  // stitching line at the inner edge of the tape.
  const stitch = Math.max(1.5, px(0.003));
  ctx.strokeStyle = 'rgba(60, 50, 35, 0.5)';
  ctx.lineWidth = px(0.12);
  ctx.stroke(outline);
  ctx.strokeStyle = '#f4f0e4';
  ctx.lineWidth = px(0.12) - 2 * stitch;
  ctx.stroke(outline);
  ctx.restore();

  // artwork, mirrored for the starboard side so it reads correctly from there
  const mirrored = (cx, draw) => {
    ctx.save();
    ctx.translate(cx, 0);
    if (side === 'sb') ctx.scale(-1, 1);
    draw();
    ctx.restore();
  };
  void mirrored;            // zeilteken and zeilnummer are parts of their own, painted below
}

/** A patch lying on the sail (zeilteken, zeilnummer) that carries its own painted texture. */
function decalPatch(parts, id, widthM, heightM, renderer) {
  const part = parts.find((p) => p.extras.id === id);
  if (!part) return null;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(widthM * PX_PER_M); canvas.height = Math.round(heightM * PX_PER_M);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
  for (const mesh of part.meshes) {
    mesh.material = new THREE.MeshStandardMaterial({
      map: texture, transparent: true, roughness: 0.85, metalness: 0, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    });
    mesh.material.userData.keepTransparent = true;
  }
  return { canvas, texture, ctx: canvas.getContext('2d') };
}

export async function dressSails(parts, renderer, number = '000') {
  const emblem = await loadImage('/textures/zeilteken.png').catch(() => null);
  const sails = [];
  for (const part of parts) {
    const zeil = part.extras.zeil;
    if (!zeil) continue;
    const sides = {};
    for (const side of ['bb', 'sb']) {
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(zeil.breedte_m * PX_PER_M);
      canvas.height = Math.round(zeil.hoogte_m * PX_PER_M);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      sides[side] = { canvas, texture };
    }
    const material = (side) => new THREE.MeshStandardMaterial({
      map: sides[side].texture, roughness: 0.9, metalness: 0,
      side: side === 'bb' ? THREE.FrontSide : THREE.BackSide,
    });
    for (const mesh of [...part.meshes]) {
      mesh.material = material('bb');                 // the mesh faces port
      const back = new THREE.Mesh(mesh.geometry, material('sb'));   // same cloth seen from starboard
      back.position.copy(mesh.position); back.quaternion.copy(mesh.quaternion); back.scale.copy(mesh.scale);
      back.userData.part = mesh.userData.part;
      mesh.parent.add(back);
      part.meshes.push(back);
    }
    sails.push({ zeil, sides });
  }
  const setNumber = (value) => {
    for (const { zeil, sides } of sails) {
      for (const side of ['bb', 'sb']) {
        paint(sides[side].canvas, zeil, side, emblem, value);
        sides[side].texture.needsUpdate = true;
      }
    }
  };
  // zeilteken and zeilnummer sit on the cloth as parts of their own, so they can be picked
  const NUMMER_MM = 980;                                  // the patch holds up to four digits
  const emblemPatch = decalPatch(parts, 'grootzeil_zeilteken', 0.38, 0.38 * (emblem ? emblem.height / emblem.width : 1.42), renderer);
  const numberPatch = decalPatch(parts, 'grootzeil_zeilnummer', NUMMER_MM / 1000, 0.30, renderer);
  if (emblemPatch && emblem) {
    emblemPatch.ctx.drawImage(emblem, 0, 0, emblemPatch.canvas.width, emblemPatch.canvas.height);
    emblemPatch.texture.needsUpdate = true;
  }
  const paintNumber = (value) => {
    if (!numberPatch) return;
    const { canvas, ctx, texture } = numberPatch;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#111';
    const mm = canvas.width / NUMMER_MM;
    drawDigits(ctx, value, canvas.width / 2, 0, 200 * mm, 300 * mm, 60 * mm);
    texture.needsUpdate = true;
  };

  const setAll = (value) => { setNumber(value); paintNumber(value); };
  setAll(number);
  return { setNumber: setAll };
}
