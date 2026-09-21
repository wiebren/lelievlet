"""Wantkettingen: the chain at the foot of each want, between the harpje and the eye of the wire.

The CAD runs each want as one wire from the hommerring on the mast down to a harpje (bodies 5140
and 5132, with their pins) in the hole of the wantputting on the dolboord. In the boat there is a
short chain in between - the owner, asked what is at the foot of the wanten: "a short chain, six
links" - so six links of the same 6 mm DIN 766 short-link chain as the ankerketting hang in the
bow of the harpje and carry the spliced thimble eye of the wire. The link itself is the one
pipeline/anchor.py builds for the ankerketting, turned a quarter every other link, so the first
lies across the bow of the harpje and the sixth across the bight of the eye, which stand square
to each other in the CAD.

The chain has to come out of the want's own length, or wire and chain would stand in the same
place. `reshape_want()` cuts the mesh of the wire through a plane square to its axis a little
above the splice, lifts everything below that plane - the eye - along that axis by the working
length of the chain, and drops the stretch of plain wire the eye then covers. The wire so loses
exactly what the chain adds; pipeline/hardware.py dispatches the two handles to it.

Everything is in CAD millimetres (x forward, y to port, z up), like pipeline/hardware.py.

  build(mesh_dir)   [(id, naam, groep, materiaal, (V, N, F))] - the two chains
  ogen(mesh_dir)    both ends of each want, for the viewer (pipeline/rig_data.py)
"""
import json
from pathlib import Path

import numpy as np

from anchor import CHAIN_PITCH, CHAIN_WIRE, _link          # the same 6 mm link as the ankerketting
from hardware import _join

ROOT = Path(__file__).resolve().parent.parent
MESH = ROOT / "build" / "mesh"

WANTEN = dict(bb="51C2", sb="519A")          # the wire of each want, hommerring to harpje
HANGS_IN = {"51C2": "5140", "519A": "5132"}  # the harpje it is shackled to at the wantputting

LINKS = 6                   # "a short chain, six links"
LINK_GAP = 1.2              # play left at either end of the chain: what the CAD leaves between the
                            # bight of the eye and the bow of the harpje it is hung on today
EYE_REACH = 100.0           # the splice is 37 mm deep; below this everything belongs to the foot
CUT_CLEAR = 5.0             # the wire is cut this far above the top of the splice, in plain wire


def _load(mesh_dir, handle):
    """V, F and the B-rep face of every triangle of a CAD body."""
    report = json.loads((ROOT / "build" / "tessellation_report.json").read_text())
    name = next(r["name"] for r in report if r["handle"] == handle)
    d = np.load(mesh_dir / f"{name}.npz")
    return d["V"].astype(float), d["F"].astype(int), d["G"].astype(int)


def _axis(V, F, G):
    """Point at the foot of the wire, the unit direction up it, and which face the wire is. The
    wire is one long cylindrical face - by far the largest of the body - and its vertices come in
    rings, so the mean of a full ring lies on the axis."""
    area = np.linalg.norm(np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]), axis=1)
    g = int(np.argmax(np.bincount(G, weights=area)))
    P = V[np.unique(F[G == g])]
    e = np.linalg.eigh(np.cov((P - P.mean(0)).T))[1][:, -1]
    e = -e if e[2] < 0 else e
    t = P @ e
    order = np.argsort(t)
    rings = [r for r in np.split(order, np.where(np.diff(t[order]) > 1.0)[0] + 1) if len(r) >= 8]
    C = np.array([P[r].mean(0) for r in rings])
    return C[0], (C[-1] - C[0]) / np.linalg.norm(C[-1] - C[0]), g


def foot(handle, V, F, G, mesh_dir=MESH):
    """Everything the chain and the mesh edit need about the foot of one want, in a frame on the
    wire's axis: s runs up the wire from `o`, ex forward across it and ey to the side.

    The chain goes between the bight of the eye and the crown of the bow of the harpje, both of
    them the far end of a bent bar. The bight is read off the lowest metal of the wire, which lies
    a wire radius under the bar's centre line; the crown is the mean of the metal in the top 6 mm
    of the harpje, which lands on that bar's centre line and is not thrown off by the facets. The
    first link then hangs `LINK_GAP` clear of the bow and the eye rides `LINK_GAP` clear of the
    sixth, which fixes both where the links go (s1) and how far the eye is lifted (shift). Across
    the axis the chain splits the difference between the two: the harpje is a small one, about
    6.6 mm clear between its cheeks, so the links have to thread it as squarely as they can."""
    o, d, g_wire = _axis(V, F, G)
    ex = np.array([1.0, 0.0, 0.0]); ex -= (ex @ d) * d; ex /= np.linalg.norm(ex)
    ey = np.cross(d, ex)
    loc = lambda Q: np.c_[(Q - o) @ d, (Q - o) @ ex, (Q - o) @ ey]
    L = loc(V)
    splice = np.unique(F[G != g_wire])                       # eye and splice at either end
    eye, top = splice[L[splice, 0] < EYE_REACH], splice[L[splice, 0] > EYE_REACH]
    r_wire = (L[eye, 2].max() - L[eye, 2].min()) / 2         # the eye is a flat loop: its thickness
    bight = L[eye][L[eye, 0] < L[eye, 0].min() + 0.05].mean(0) + (r_wire, 0.0, 0.0)

    Lh = loc(_load(mesh_dir, HANGS_IN[handle])[0])
    cap = Lh[Lh[:, 0] > Lh[:, 0].max() - CHAIN_WIRE]         # the crown of the bow
    r_bow = np.ptp(cap[:, 1]) / 2                            # the bar of the bow is 2 r_bow thick
    crown = cap.mean(0)

    s1 = crown[0] - (r_bow + CHAIN_WIRE / 2) - LINK_GAP      # lower end of the first link
    s6 = s1 + LINKS * CHAIN_PITCH                            # upper end of the sixth
    return dict(o=o, d=d, ex=ex, ey=ey, s1=s1,
                shift=s6 + (CHAIN_WIRE / 2 + r_wire) + LINK_GAP - bight[0],
                cut=L[eye, 0].max() + CUT_CLEAR,             # where the wire is cut through
                across=(crown[1:] + bight[1:]) / 2,          # the chain splits the difference
                top=V[top].mean(0), oog=V[eye].mean(0))      # middle of either eye, as drawn


def ketting(mesh_dir, handle):
    """The six links, on the line of the wire, every other one turned a quarter round: the first
    lies across the bow of the harpje, the sixth across the bight of the eye."""
    f = foot(handle, *_load(mesh_dir, handle), mesh_dir=mesh_dir)
    base = f["o"] + f["across"][0] * f["ex"] + f["across"][1] * f["ey"]
    return _join([_link(base + (f["s1"] + (k + 0.5) * CHAIN_PITCH) * f["d"], f["d"],
                        f["ex"] if k % 2 == 0 else f["ey"]) for k in range(LINKS)])


def reshape_want(handle, V, N, F, G, split_at):
    """Take the chain's length out of the wire: cut it square to its axis above the splice, lift
    the eye along that axis and drop the plain wire the eye now covers. Both cuts are made before
    anything moves, so the rim of the lifted piece lands exactly on the rim of what is kept."""
    f = foot(handle, V, F, G)
    d, shift = f["d"], f["shift"]
    c = f["o"] @ d + f["cut"]
    V, N, F, G = split_at(V, N, F, G, d, c)
    V, N, F, G = split_at(V, N, F, G, d, c + shift)
    mid = V[F].mean(axis=1) @ d
    eye, keep = mid < c, mid > c + shift
    V = V.copy(); V[np.unique(F[eye])] += shift * d
    return V, N, np.vstack([F[eye], F[keep]]), np.concatenate([G[eye], G[keep]])


def ogen(mesh_dir):
    """Both ends of each want in CAD mm: the middle of the eye at the hommerring, and the middle of
    the thimble eye at the foot as it stands once the wire has been shortened."""
    out = {}
    for side, handle in WANTEN.items():
        f = foot(handle, *_load(mesh_dir, handle), mesh_dir=mesh_dir)
        out[side] = dict(top=f["top"], oog=f["oog"] + f["shift"] * f["d"])
    return out


def build(mesh_dir):
    """[(id, naam, groep, materiaal, (V, N, F))] for the two wantkettingen."""
    return [(f"wantketting_{side}", f"Wantketting ({'bakboord' if side == 'bb' else 'stuurboord'})",
             "staand_want", "verzinkt", ketting(mesh_dir, handle))
            for side, handle in WANTEN.items()]
