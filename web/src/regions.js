import * as THREE from 'three';

// Gebieden: numbers in the parts drawing of the class that name an AREA instead of an object - the
// boeg is the forward end of the romp, a kleed is one panel of the grootzeil. Each one joins
// `parts` as a pseudo-part (extras.gebied), so the list, the search and the info tile treat it
// like any other row.
//
// Its shape is an overlay, never a body of its own: one child mesh per source mesh that shares the
// position and normal attributes of that mesh and carries an index of only the triangles of the
// gebied. Sharing the attributes is what lets it follow the grootzeil, whose vertices are rewritten
// every frame; hanging under the source mesh is what lets it follow the position and quaternion the
// modes set. It is drawn only while the gebied is selected and never takes part in picking.

const BOEG_X = 4.95;             // m: the forward 0.65 m, from the kikkers of the voordek to the steven
const BOEG = ['vlak_bb', 'vlak_sb', 'kim_bb', 'kim_sb', 'boeisel_bb', 'boeisel_sb',
              'berghout_bb', 'berghout_sb', 'dolboord_bb', 'dolboord_sb', 'dekcontour',
              'voordek', 'voorplecht', 'boegrand', 'hanekam'];
const KLEED = 3;                 // the third cloth counted from the schoothoek up: a full one, mid sail

/**
 * Every gebied: the parts it lies on, and which of their triangles belong to it. `inside` is asked
 * once per triangle at start-up, on the rest positions in model space (metres, x from the spiegel
 * at 0 to the steven at 5.6, y up, z to starboard), with the centroid, the mesh the triangle is of
 * and its three vertex indices.
 */
const GEBIEDEN = [
  { id: 'boeg', naam: 'Boeg', groep: 'romp', sources: BOEG,
    inside: (centroid) => centroid.x > BOEG_X },
  { id: 'kleed', naam: 'Kleed', groep: 'zeil', sources: ['grootzeil'],
    inside: (centroid, mesh, tri) => clothAt(mesh, tri) === KLEED },
];

// A kleed is the strip of cloth between two seams, 90.1 cm wide and perpendicular to the line
// schoothoek -> piek (Vlettenboek p. 60). The seams sit in the sail data (extras.zeil.naden) as uv
// segments, so a triangle is placed by the uv of its centroid: the cloths are counted from the
// schoothoek up, and a triangle lies in cloth n when n - 1 seams stand between it and that corner.
const SCHOOTHOEK = [1, 0];       // uv of the clew: u = 1 is the achterlijk, v = 0 the onderlijk
const sideOfSeam = ([u0, v0, u1, v1], u, v) => (u1 - u0) * (v - v0) - (v1 - v0) * (u - u0);

function clothAt(mesh, tri) {
  const { naden } = mesh.userData.part.userData.zeil;      // the sail data of the part this mesh is of
  const uv = mesh.geometry.attributes.uv;
  let u = 0; let v = 0;
  for (const i of tri) { u += uv.getX(i) / 3; v += uv.getY(i) / 3; }
  return 1 + naden.filter((seam) => sideOfSeam(seam, u, v) * sideOfSeam(seam, ...SCHOOTHOEK) < 0).length;
}

const _v = new THREE.Vector3();
const _centroid = new THREE.Vector3();

/**
 * World box of the triangles an overlay covers. Box3.setFromObject would take the whole shared
 * position attribute, which is the entire romp or the whole zeil, so the vertices it uses are
 * walked by hand - and only under a source mesh that is there in this mode.
 */
function spanBox(spans, out) {
  out.makeEmpty();
  for (const { overlay, used } of spans) {
    if (!overlay.parent.visible) continue;
    const position = overlay.geometry.attributes.position;
    overlay.updateWorldMatrix(true, false);
    for (const i of used) out.expandByPoint(_v.fromBufferAttribute(position, i).applyMatrix4(overlay.matrixWorld));
  }
  return out;
}

/**
 * Whether a click landed inside a gebied: the raycast hit one of the triangles its overlay covers.
 * The overlays take no part in picking, so `hit.object` is the source mesh that was clicked - the
 * quiz asks this to tell a click on the boeg from one on the same plank further aft.
 */
export function regionAt(region, hit) {
  const faces = region?.covered?.get(hit?.object);
  return Boolean(faces && hit.face && faces.has(`${hit.face.a},${hit.face.b},${hit.face.c}`));
}

/** Builds every gebied and pushes it into `parts`; returns them. */
export function initRegions({ parts, groups, highlight }) {
  const byId = new Map(parts.map((p) => [p.extras.id, p]));
  const material = new THREE.MeshBasicMaterial({
    color: highlight, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false,
    // the overlay lies ON the source: a normal offset is impossible with shared vertices
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
  });
  const made = [];
  for (const def of GEBIEDEN) {
    const sources = def.sources.flatMap((id) => byId.get(id)?.meshes ?? []);
    const overlays = [];
    const spans = [];                                      // { overlay, used }: for its bounding box
    const covered = new Map();                             // source mesh -> the triangles it covers
    for (const mesh of sources) {
      const index = mesh.geometry.index;
      if (!index) continue;                                // geometry built in the viewer (ropes)
      const position = mesh.geometry.attributes.position;
      const keep = [];
      for (let t = 0; t < index.count; t += 3) {
        const tri = [index.getX(t), index.getX(t + 1), index.getX(t + 2)];
        _centroid.set(0, 0, 0);
        for (const i of tri) _centroid.add(_v.fromBufferAttribute(position, i));
        if (def.inside(_centroid.divideScalar(3), mesh, tri)) keep.push(...tri);
      }
      if (!keep.length) continue;
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', position);         // the very same attributes, not copies:
      geometry.setAttribute('normal', mesh.geometry.attributes.normal);   // a bent sail carries over
      geometry.setIndex(new THREE.BufferAttribute(Uint32Array.from(keep), 1));
      const overlay = new THREE.Mesh(geometry, material);
      overlay.visible = false;
      overlay.frustumCulled = false;      // it has no bounding volumes: they would go stale on the sail
      mesh.add(overlay);
      overlays.push(overlay);
      spans.push({ overlay, used: Uint32Array.from(new Set(keep)) });
      const faces = new Set();                             // as Raycaster reports them: face.a, .b, .c
      for (let t = 0; t < keep.length; t += 3) faces.add(`${keep[t]},${keep[t + 1]},${keep[t + 2]}`);
      covered.set(mesh, faces);
    }
    // a node of its own, under the group node, so the gebied hides with its group like any part
    const node = new THREE.Object3D();
    node.name = def.id;
    groups.get(def.groep).node.add(node);
    const part = { node, meshes: overlays, sources, covered, box: (out) => spanBox(spans, out),
                   extras: { id: def.id, naam: def.naam, groep: def.groep, gebied: true } };
    parts.push(part);
    made.push(part);
  }
  return made;
}
