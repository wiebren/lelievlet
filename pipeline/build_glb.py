"""Assemble the cached meshes into web/public/models/lelievlet.glb with named parts.

    uv run --python 3.12 --with numpy --with scipy --with meshoptimizer python3 pipeline/build_glb.py

Model space: metres, glTF convention (Y up). x runs from the transom (0) to the bow, z is
positive to starboard, y = 0 at the DWG baseline (underside of the bottom plating amidships).
Scene graph: group node -> part node (extras: id, naam, groep, materiaal, handles) -> meshes.
"""
import json
import struct
from pathlib import Path

import numpy as np

try:                                                  # the glb is meshopt-packed when the encoder is there (uv run --with meshoptimizer)
    import meshoptimizer as meshopt
    MESHOPT = True
except ImportError:
    MESHOPT = False

import anchor
import rig_data
import bakskist
import borgketting
import bakskist_inhoud
import fokbeslag
import gelijk
import hardware
import harpjes
import landvasten
import sleepogen
import rigging
import sails
import wantkettingen
from parts import (BAND_MATERIAL, BANDS, DEFAULT_BY_LAYER, DROP, GROUPS, HARDWARE, MATERIALS, NUDGE, PARTS,
                   REGION_SPLITS, SINGLE_SKIN, TWO_TONE)

ROOT = Path(__file__).resolve().parent.parent
MESH = ROOT / "build" / "mesh"
OUT = ROOT / "web" / "public" / "models"
X_TRANSOM = 737.6            # DWG x of the aft end of the hull plating


def to_model(v, is_point=True):
    """DWG mm (X bow, Y port, Z up) -> glTF metres (x bow, y up, z starboard)."""
    out = np.stack([v[:, 0], v[:, 2], -v[:, 1]], axis=1).astype(np.float64)
    if is_point:
        out[:, 0] -= X_TRANSOM
        out /= 1000.0
    return out


def single_skin(V, N, F):
    """Keep one side of a paper-thin solid (sails are modelled 0.1 mm thick)."""
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    area = np.linalg.norm(fn, axis=1, keepdims=True); unit = fn / np.maximum(area, 1e-12)
    cov = (unit * area).T @ unit
    axis = np.linalg.eigh(cov)[1][:, -1]                 # dominant normal direction
    return F[(unit @ axis) > 0.5]


def faces_outward(V, N, F):
    """True per triangle when it belongs to the outer skin of the hull (DWG mm coordinates).
    Reference: a point on the centreline above the sheer, slid along x but kept inside the boat,
    so it also works for the raked transom and the rising bow."""
    centroid = V[F].mean(axis=1)
    ref = np.stack([np.clip(centroid[:, 0], 1500.0, 5000.0), np.zeros(len(F)), np.full(len(F), 1100.0)], axis=1)
    return np.einsum("ij,ij->i", centroid - ref, N[F].mean(axis=1)) > 0


def _along(V, axis):
    """Coordinate of points along a band axis: 0/1/2 for X/Y/Z, or any direction vector."""
    V = np.asarray(V, float)
    if isinstance(axis, int):
        return V[:, axis]
    d = np.asarray(axis, float)
    return V @ (d / np.linalg.norm(d))


def split_at(V, N, F, G, axis, c):
    """Cut every triangle that crosses the plane (coordinate along axis) = c, so none straddles it.
    G is a per-triangle label (the B-rep face); the pieces of a triangle inherit it."""
    t = _along(V, axis) - c
    V, N = list(map(tuple, V)), list(map(tuple, N))
    cache, out = {}, []

    def cross(i, j):                                      # vertex where edge i-j meets the plane
        key = (min(i, j), max(i, j))
        if key not in cache:
            k = t[i] / (t[i] - t[j])
            p = tuple(np.array(V[i]) + k * (np.array(V[j]) - np.array(V[i])))
            n = np.array(N[i]) + k * (np.array(N[j]) - np.array(N[i]))
            V.append(p); N.append(tuple(n / max(np.linalg.norm(n), 1e-12)))
            cache[key] = len(V) - 1
        return cache[key]

    labels = []
    for tri, g in zip(F, G):
        side = [t[i] > 1e-7 for i in tri]
        if all(side) or not any(side) or any(abs(t[i]) <= 1e-7 for i in tri):
            out.append(tuple(tri)); labels.append(g); continue
        k = side.index(True) if side.count(True) == 1 else side.index(False)     # the lone vertex
        a, b, c_ = tri[k], tri[(k + 1) % 3], tri[(k + 2) % 3]
        ab, ac = cross(a, b), cross(a, c_)
        out += [(a, ab, ac), (ab, b, c_), (ab, c_, ac)]                          # winding kept
        labels += [g, g, g]
    return np.array(V), np.array(N), np.array(out, dtype=np.int64), np.array(labels, dtype=np.int64)


def cut_bands(V, N, F, G, bands):
    """Returns the mesh cut along every band edge, and which triangles lie inside a band."""
    ranges = []
    for axis, origin, d0, d1 in bands:
        lo, hi = _along(V, axis).min(), _along(V, axis).max()
        if origin in ("max", "both"):
            ranges.append((axis, hi - d1, hi - d0))
        if origin in ("min", "both"):
            ranges.append((axis, lo + d0, lo + d1))
    for axis, a, b in ranges:
        V, N, F, G = split_at(V, N, F, G, axis, a)
        V, N, F, G = split_at(V, N, F, G, axis, b)
    mid = V[F].mean(axis=1)
    inside = np.zeros(len(F), bool)
    for axis, a, b in ranges:
        inside |= (_along(mid, axis) > a) & (_along(mid, axis) < b)
    return V, N, F, G, inside


# Stored smaller, the way gltfpack does it (meshopt filters, decoded by the viewer's MeshoptDecoder):
# positions on a grid of 2^POS_EXP m through the exponential filter - they come back as ordinary
# floats - and normals as two 8-bit numbers through the octahedral filter (KHR_mesh_quantization).
POS_EXP = -14                # 2^-14 m: a grid of 0.06 mm, a point at most 0.03 mm off


def exp_filter(V):
    """V (n, 3) as int32 for the EXPONENTIAL filter: a 24-bit mantissa under an 8-bit exponent."""
    m = np.round(V.astype(np.float64) * 2.0 ** -POS_EXP).astype(np.int64)
    assert np.abs(m).max() < 2 ** 23, "a position out of the filter's reach"
    return (((POS_EXP & 0xFF) << 24) | (m & 0xFFFFFF)).astype(np.uint32).view(np.int32)


def exp_decoded(E):
    """What the viewer gets back from exp_filter: float32."""
    e = E >> 24; m = (E << 8) >> 8
    return (m.astype(np.float64) * 2.0 ** e.astype(np.float64)).astype(np.float32)


def oct_filter(N):
    """Unit normals (n, 3) as int8 (n, 4) for the OCTAHEDRAL filter: the octahedral map at 8 bits,
    then the scale the decoder divides by, and a padding byte."""
    N = N.astype(np.float64)
    n = N / np.maximum(np.abs(N).sum(1, keepdims=True), 1e-12)
    x, y, z = n[:, 0], n[:, 1], n[:, 2]
    sx = np.where(x >= 0, 1.0, -1.0); sy = np.where(y >= 0, 1.0, -1.0)
    u = np.where(z >= 0, x, (1 - np.abs(y)) * sx)
    v = np.where(z >= 0, y, (1 - np.abs(x)) * sy)
    out = np.zeros((len(N), 4), np.int8)
    out[:, 0] = np.round(u * 127); out[:, 1] = np.round(v * 127); out[:, 2] = 127
    return out


def compact(V, N, F):
    used = np.unique(F)
    remap = np.full(len(V), -1, dtype=np.int64); remap[used] = np.arange(len(used))
    return V[used], N[used], remap[F]


def main():
    report = json.loads((ROOT / "build" / "tessellation_report.json").read_text())
    parts = {}
    sail_meshes = sails.build(MESH)          # curved cloth replaces the flat CAD sails
    rig_meshes = rigging.build(MESH)         # marllijnen laid with proper marlsteken
    rig = rig_data.Rig(MESH)                 # axes and anchors for the viewer's animations
    # the harpjes: one light bow put where each of the CAD's is (gelijk does the rest of the small ones)
    shared = harpjes.build(MESH)
    light = gelijk.Lighter()                 # small fittings lighter, and what the CAD has twice made from one
    for row in report:
        p = MESH / f"{row['name']}.npz"
        if not p.exists():
            continue
        d = np.load(p)
        V, N, F = d["V"].astype(np.float64), d["N"].astype(np.float64), d["F"].astype(np.int64)
        h = row["handle"]
        if h in DROP:
            continue
        if h in shared:                                     # before the nudge: it moves the one put in its place
            V, N, F = shared[h]
        if h in NUDGE:
            V = V + np.array(NUDGE[h])
        if row["type"] == "3DSOLID" and row["closed_shells"] != row["shells"] and h not in shared:
            # open shell: OpenCascade could not orient it, so use the sign of the enclosed volume
            fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
            if (V[F[:, 0]] * fn).sum() < 0:
                F = F[:, ::-1].copy(); N = -N
        UV = zeil = W = None
        if h in sail_meshes:
            sm = sail_meshes[h]
            V, N, F, UV, zeil = sm["V"], sm["N"], sm["F"], sm["UV"], sm["extras"]
            W = sm.get("W")
        elif h in rig_meshes:
            V, N, F = rig_meshes[h]
        elif h in SINGLE_SKIN:
            F = single_skin(V, N, F)
        entry = PARTS.get(h) or DEFAULT_BY_LAYER.get(row["layer"]) or ("overig", "Overig", "beslag", "verzinkt")
        if h not in PARTS and row["layer"] == "StagSolids":
            fixed_to = rig.attachment((V.min(0) + V.max(0)) / 2)
            if fixed_to:
                entry = HARDWARE[fixed_to]
        band = np.zeros(len(F), bool)
        G = d["G"].astype(np.int64) if h not in shared else np.zeros(len(F), np.int64)   # B-rep face of every triangle
        V, N, F, G = hardware.reshape(h, V, N, F, G, split_at)
        if h not in shared and h not in sail_meshes and h not in rig_meshes and h not in SINGLE_SKIN:
            made = light(h, V, N, F)
            if made is not None:
                V, N, F = made; G = np.zeros(len(F), np.int64)
        band = np.zeros(len(F), bool)
        if h in BANDS:                                      # painted bands: cut the mesh where they start and end
            V, N, F, G, band = cut_bands(V, N, F, G, BANDS[h])
        jobs = [(entry, F, band)]
        if h in REGION_SPLITS:                              # stretches of the body that are parts of their own
            area = np.linalg.norm(np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]), axis=1)
            owner = np.zeros(len(F), np.int64)              # 0 = the body itself, k = k-th split
            for g in np.unique(G):                          # whole faces, so the cut follows the CAD edges
                sel = G == g
                c = np.average(V[F[sel]].mean(axis=1), axis=0, weights=np.maximum(area[sel], 1e-9))
                for k, spec in enumerate(REGION_SPLITS[h], 1):
                    hit = g in spec[0] if len(spec) == 2 else spec[1] <= c[spec[0]] <= spec[2]
                    if hit:
                        owner[sel] = k
            jobs = [(entry, F[owner == 0], band[owner == 0])]
            jobs += [(spec[-1], F[owner == k], band[owner == k]) for k, spec in enumerate(REGION_SPLITS[h], 1)]
        for (pid, naam, groep, mat), Fj, bandj in jobs:
            if len(Fj) == 0:
                continue
            part = parts.setdefault(pid, dict(id=pid, naam=naam, groep=groep, materiaal=mat, handles=[], skins={}))
            part["handles"].append(h)
            if zeil:
                part["zeil"] = zeil
            if pid in TWO_TONE:
                out = faces_outward(V, N, Fj)
                pieces = [(TWO_TONE[pid][0], Fj[out]), (TWO_TONE[pid][1], Fj[~out])]
            else:
                pieces = [(mat, Fj[~bandj]), (BAND_MATERIAL, Fj[bandj])]
            for m, Fm in pieces:
                if len(Fm) == 0:
                    continue
                used = np.unique(Fm)
                Vc, Nc, Fc = compact(V, N, Fm)
                skin = part["skins"].setdefault(m, dict(V=[], N=[], F=[], UV=[], W=[], B=[], n=0))
                skin["V"].append(to_model(Vc)); skin["N"].append(to_model(Nc, False)); skin["F"].append(Fc + skin["n"])
                skin["B"].append(np.full(len(Vc), float(int(h, 16))))     # which CAD body this is
                if UV is not None:
                    skin["UV"].append(UV[used])
                if W is not None:
                    skin["W"].append(W[used])
                skin["n"] += len(Vc)

    # parts that are generated rather than taken from a CAD body: lijken and hoeken of the sails
    for pid, naam, mat, faces in sail_meshes.get("_extra", []):
        part = parts.setdefault(pid, dict(id=pid, naam=naam, groep="zeil", materiaal=mat, handles=[], skins={}))
        skin = part["skins"].setdefault(mat, dict(V=[], N=[], F=[], UV=[], W=[], B=[], n=0))
        for V, N, F, W, uv in faces:
            skin["V"].append(to_model(V)); skin["N"].append(to_model(N, False)); skin["F"].append(F + skin["n"])
            skin["W"].append(W); skin["B"].append(np.zeros(len(V))); skin["n"] += len(V)
            if uv is not None:
                skin["UV"].append(uv)

    # fittings the CAD leaves out: mastbout, grendelbout, borglijntje of the lummelbout, dolpotten
    for pid, naam, groep, mat, (V, N, F) in hardware.build(MESH) + sleepogen.build(MESH) + anchor.build(MESH) + bakskist.build(MESH) + landvasten.build(MESH) + fokbeslag.build(MESH) + bakskist_inhoud.build(MESH) + wantkettingen.build(MESH) + borgketting.build(MESH) + fokbeslag.build_spriet(MESH):
        part = parts.setdefault(pid, dict(id=pid, naam=naam, groep=groep, materiaal=mat, handles=[], skins={}))
        skin = part["skins"].setdefault(mat, dict(V=[], N=[], F=[], UV=[], W=[], B=[], n=0))
        skin["V"].append(to_model(V)); skin["N"].append(to_model(N, False)); skin["F"].append(F + skin["n"])
        skin["B"].append(np.zeros(len(V))); skin["n"] += len(V)

    # ---- glTF assembly
    blob = bytearray(); views, accessors, meshes, nodes, materials = [], [], [], [], []
    mat_index = {}

    def add_view(data, target, packed=None):
        """A buffer view; `packed` = (array, stride, mode) has it meshopt-encoded in place, with the
        plain layout the decoder gives back described in the view."""
        while len(blob) % 4:
            blob.append(0)
        if packed is None or not MESHOPT:
            views.append(dict(buffer=0, byteOffset=len(blob), byteLength=len(data), target=target))
            blob.extend(data)
            return len(views) - 1
        arr, stride, mode, *filt = packed
        count = len(data) // stride
        enc = meshopt.encode_vertex_buffer(arr, count, stride) if mode == "ATTRIBUTES" else meshopt.encode_index_buffer(arr, count, int(arr.max()) + 1)
        ext = dict(buffer=0, byteOffset=len(blob), byteLength=len(enc), byteStride=stride, count=count, mode=mode)
        if filt:
            ext["filter"] = filt[0]
        views.append(dict(buffer=0, byteOffset=len(blob), byteLength=len(data), byteStride=stride if mode == "ATTRIBUTES" else None, target=target,
                          extensions=dict(EXT_meshopt_compression=ext)))
        views[-1] = {k: v for k, v in views[-1].items() if v is not None}
        blob.extend(enc)
        return len(views) - 1

    def material(name):
        if name not in mat_index:
            rgb, metal, rough, double = MATERIALS[name]
            rgb = [((c + 0.055) / 1.055) ** 2.4 if c > 0.04045 else c / 12.92 for c in rgb]   # sRGB -> linear
            materials.append(dict(name=name, doubleSided=double, pbrMetallicRoughness=dict(
                baseColorFactor=[*rgb, 1.0], metallicFactor=metal, roughnessFactor=rough)))
            mat_index[name] = len(materials) - 1
        return mat_index[name]

    group_nodes = {}
    summary = []
    for pid, part in sorted(parts.items(), key=lambda kv: (list(GROUPS).index(kv[1]["groep"]), kv[0])):
        prims, lo, hi, ntri, nvert = [], [], [], 0, 0
        for m, skin in part["skins"].items():
            V = np.concatenate(skin["V"]).astype(np.float32); N = np.concatenate(skin["N"]).astype(np.float32)
            F = np.concatenate(skin["F"]).astype(np.uint32)
            ln = np.linalg.norm(N, axis=1, keepdims=True); ln[ln == 0] = 1; N = (N / ln).astype(np.float32)
            V = V.astype(np.float32)
            if MESHOPT:                                     # on the grid, and the normals in 8 bits
                E = exp_filter(V); V = exp_decoded(E); On = oct_filter(N)
                pv = add_view(V.tobytes(), 34962, (E, 12, "ATTRIBUTES", "EXPONENTIAL"))
                nv = add_view(On.tobytes(), 34962, (On, 4, "ATTRIBUTES", "OCTAHEDRAL"))
                normal = dict(componentType=5120, normalized=True)
            else:
                pv = add_view(V.tobytes(), 34962); nv = add_view(N.tobytes(), 34962)
                normal = dict(componentType=5126)
            iv = add_view(F.tobytes(), 34963, (F.ravel(), 4, "TRIANGLES"))
            a0 = len(accessors)
            accessors.append(dict(bufferView=pv, componentType=5126, count=len(V), type="VEC3",
                                  min=V.min(0).tolist(), max=V.max(0).tolist()))
            accessors.append(dict(bufferView=nv, **normal, count=len(N), type="VEC3"))
            accessors.append(dict(bufferView=iv, componentType=5125, count=int(F.size), type="SCALAR"))
            attributes = dict(POSITION=a0, NORMAL=a0 + 1)
            if skin["UV"]:
                uv = np.concatenate(skin["UV"]).astype(np.float32)
                tv = add_view(uv.tobytes(), 34962, (uv, 8, "ATTRIBUTES"))
                accessors.append(dict(bufferView=tv, componentType=5126, count=len(uv), type="VEC2"))
                attributes["TEXCOORD_0"] = len(accessors) - 1
            if skin["B"]:                                   # which CAD body each vertex came from
                b = np.concatenate(skin["B"]).astype(np.float32)
                bv = add_view(b.tobytes(), 34962, (b, 4, "ATTRIBUTES"))   # long runs of one value: next to nothing packed
                accessors.append(dict(bufferView=bv, componentType=5126, count=len(b), type="SCALAR"))
                attributes["_BODY"] = len(accessors) - 1
            if skin["W"]:                                   # custom attribute: bend weight of the fok
                w = np.concatenate(skin["W"]).astype(np.float32)
                wv = add_view(w.tobytes(), 34962, (w, 4, "ATTRIBUTES"))
                accessors.append(dict(bufferView=wv, componentType=5126, count=len(w), type="SCALAR"))
                attributes["_BOLLING"] = len(accessors) - 1
            prims.append(dict(attributes=attributes, indices=a0 + 2, material=material(m)))
            lo.append(V.min(0)); hi.append(V.max(0)); ntri += len(F); nvert += len(V)
        meshes.append(dict(name=pid, primitives=prims))
        size = np.max(hi, axis=0) - np.min(lo, axis=0)
        extras = dict(id=pid, naam=part["naam"], groep=part["groep"], materiaal=part["materiaal"],
                      handles=part["handles"], afmetingen_mm=[int(round(s * 1000)) for s in size])
        if "zeil" in part:
            extras["zeil"] = part["zeil"]
        nodes.append(dict(name=pid, mesh=len(meshes) - 1, extras=extras))
        group_nodes.setdefault(part["groep"], []).append(len(nodes) - 1)
        summary.append(dict(**extras, triangles=int(ntri), vertices=int(nvert)))

    roots = []
    for g, title in GROUPS.items():
        if g in group_nodes:
            nodes.append(dict(name=g, children=group_nodes[g], extras=dict(groep=g, titel=title)))
            roots.append(len(nodes) - 1)
    nodes.append(dict(name="lelievlet", children=roots, extras=dict(tuig=rig.extras())))
    packing = ["EXT_meshopt_compression", "KHR_mesh_quantization"]
    gltf = dict(**(dict(extensionsUsed=packing, extensionsRequired=packing) if MESHOPT else {}),
                asset=dict(version="2.0", generator="vlet pipeline/build_glb.py",
                           extras=dict(bron="Scouting Nederland 3D-Model-binded.dwg (2012)", eenheid="m",
                                       assen="x = spiegel naar boeg, y = omhoog, z = stuurboord")),
                scene=0, scenes=[dict(nodes=[len(nodes) - 1])], nodes=nodes, meshes=meshes, materials=materials,
                accessors=accessors, bufferViews=views, buffers=[dict(byteLength=len(blob))])
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    while len(blob) % 4:
        blob.append(0)
    OUT.mkdir(parents=True, exist_ok=True)
    with open(OUT / "lelievlet.glb", "wb") as fh:
        fh.write(struct.pack("<4sII", b"glTF", 2, 12 + 8 + len(js) + 8 + len(blob)))
        fh.write(struct.pack("<I4s", len(js), b"JSON")); fh.write(js)
        fh.write(struct.pack("<I4s", len(blob), b"BIN\x00")); fh.write(blob)
    (OUT / "lelievlet.parts.json").write_text(json.dumps(summary, indent=1, ensure_ascii=False))
    tris = sum(s["triangles"] for s in summary)
    print(f"{len(summary)} parts, {tris} triangles, {(OUT / 'lelievlet.glb').stat().st_size / 1e6:.1f} MB -> {OUT / 'lelievlet.glb'}")
    for g in GROUPS:
        names = [s["naam"] for s in summary if s["groep"] == g]
        print(f"  {GROUPS[g]}: {len(names)}")


if __name__ == "__main__":
    main()
