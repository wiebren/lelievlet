"""Wantkettingen: the chain at the foot of each want, between the harpje and the eye of the wire.

The CAD runs each want as one wire from the hommerring on the mast down to a harpje (bodies 5140
and 5132, with their pins) in the hole of the wantputting on the dolboord. In the boat there is a
short chain in between - the owner, asked what is at the foot of the wanten: "a short chain, six
links" - so six links of the same 6 mm DIN 766 short-link chain as the ankerketting hang in the
bow of the harpje and carry the spliced thimble eye of the wire. The link itself is the one
pipeline/anchor.py builds for the ankerketting, turned a quarter every other link, so the first
lies across the bow of the harpje and the sixth across the bight of the eye, which stand square
to each other in the CAD.

At the top of the chain a second harpje, the same one over again turned bow down, takes the sixth
link in its bow and carries the thimble eye of the wire on its pin; the chain has a seventh
link for it.

The chain has to come out of the want's own length, or wire and chain would stand in the same
place. `reshape_want()` cuts the mesh of the wire through a plane square to its axis a little
above the splice, lifts everything below that plane - the eye - along that axis by the working
length of the chain, and drops the stretch of plain wire the eye then covers. The wire so loses
exactly what the chain adds; pipeline/hardware.py dispatches the two handles to it.

Everything is in CAD millimetres (x forward, y to port, z up), like pipeline/hardware.py.

  build(mesh_dir)   [(id, naam, groep, materiaal, (V, N, F))] - the two chains and the upper harpjes
  ogen(mesh_dir)    both ends of each want, for the viewer (pipeline/rig_data.py)
"""
import numpy as np

import cad
import harpjes

from anchor import CHAIN_PITCH, CHAIN_WIRE, _link          # the same 6 mm link as the ankerketting
from hardware import _join

WANTEN = dict(bb="51C2", sb="519A")          # the wire of each want, hommerring to harpje
HANGS_IN = {"51C2": "5140", "519A": "5132"}  # the harpje it is shackled to at the wantputting (its pin: harpjes.PIN_OF)

LINKS = 7                   # "a short chain, six links" - and one more for the upper harpje to hang in
LINK_GAP = 1.2              # play left at either end of the chain: what the CAD leaves between the
                            # bight of the eye and the bow of the harpje it is hung on today
EYE_REACH = 100.0           # the splice is 37 mm deep; below this everything belongs to the foot
EYE_LOOP = 40.0             # the thimble eye itself: this far up from its bight
CUT_CLEAR = 5.0             # the wire is cut this far above the top of the splice, in plain wire




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


def foot(handle, V, F, G, mesh_dir=cad.MESH):
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

    Lh = loc(cad.load(HANGS_IN[handle], mesh_dir)[0])
    cap = Lh[Lh[:, 0] > Lh[:, 0].max() - CHAIN_WIRE]         # the crown of the bow
    r_bow = np.ptp(cap[:, 1]) / 2                            # the bar of the bow is 2 r_bow thick
    crown = cap.mean(0)

    Lp = loc(cad.load(harpjes.PIN_OF[HANGS_IN[handle]], mesh_dir)[0])
    pin = Lp.mean(0); r_pin = np.ptp(Lp[:, 0]) / 2            # the axle of the pin, and how thick it is

    s1 = crown[0] - (r_bow + CHAIN_WIRE / 2) - LINK_GAP      # lower end of the first link
    s_top = s1 + LINKS * CHAIN_PITCH                         # upper end of the last link
    # the upper harpje, turned over: its bow down through the last link, the way the bow of the
    # lower one is through the first, its pin up through the middle of the thimble eye
    s_crown = s_top - (r_bow + CHAIN_WIRE / 2) - LINK_GAP    # centre line of that bow
    s_pin = s_crown + (crown[0] - pin[0])                    # its pin, as far up as it is down in the other
    loop = L[eye][L[eye, 0] < bight[0] + EYE_LOOP]           # the ring of the thimble, not the splice above it
    return dict(o=o, d=d, ex=ex, ey=ey, s1=s1, s_crown=s_crown, crown=crown,
                shift=s_pin - loop[:, 0].mean(),             # the eye's middle onto the pin
                cut=L[eye, 0].max() + CUT_CLEAR,             # where the wire is cut through
                across=(crown[1:] + bight[1:]) / 2,          # the chain splits the difference
                top=V[top].mean(0), oog=V[eye].mean(0))      # middle of either eye, as drawn


def _foot(mesh_dir, handle):
    """foot() of a want as the CAD draws it."""
    V, _, F, G = cad.load(handle, mesh_dir)
    return foot(handle, V, F, G, mesh_dir)


def ketting(mesh_dir, handle):
    """The six links, on the line of the wire, every other one turned a quarter round: the first
    lies across the bow of the harpje, the sixth across the bight of the eye."""
    f = _foot(mesh_dir, handle)
    base = f["o"] + f["across"][0] * f["ex"] + f["across"][1] * f["ey"]
    return _join([_link(base + (f["s1"] + (k + 0.5) * CHAIN_PITCH) * f["d"], f["d"],
                        f["ex"] if k % 2 == 0 else f["ey"]) for k in range(LINKS)])


def bovenharpje(mesh_dir, handle):
    """The harpje at the wantputting over again at the top of the chain: turned half round about
    the line forward across the wire, so its bow comes down over the sixth link, and set on the
    chain's own line."""
    f = _foot(mesh_dir, handle)
    M = np.array([f["d"], f["ex"], f["ey"]])                 # rows: local (s, x, y) -> world
    R = np.diag([-1.0, 1.0, -1.0])                           # half a turn about ex
    crown = f["crown"] @ R
    move = np.array([f["s_crown"] - crown[0], f["across"][0] - crown[1], f["across"][1] - crown[2]])
    meshes = []
    for h in (HANGS_IN[handle], harpjes.PIN_OF[HANGS_IN[handle]]):
        if h in harpjes.PIN_OF:                                   # the bow: the one harpje used for them all
            V, N, F = harpjes.bow(mesh_dir, h)
        else:
            V, N, F, _ = cad.load(h, mesh_dir)
        L = (V - f["o"]) @ M.T @ R + move
        meshes.append((f["o"] + L @ M, N @ M.T @ R @ M, F))
    return _join(meshes)


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
        f = _foot(mesh_dir, handle)
        out[side] = dict(top=f["top"], oog=f["oog"] + f["shift"] * f["d"])
    return out


def build(mesh_dir):
    """[(id, naam, groep, materiaal, (V, N, F))] for the two wantkettingen."""
    return [(f"wantketting_{side}", f"Wantketting ({'bakboord' if side == 'bb' else 'stuurboord'})",
             "staand_want", "verzinkt", ketting(mesh_dir, handle))
            for side, handle in WANTEN.items()] + \
           [("harpjes_wantketting", "Harpjes", "beslag", "verzinkt",
             _join([bovenharpje(mesh_dir, handle) for handle in WANTEN.values()]))]
