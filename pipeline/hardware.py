"""Fittings the CAD leaves out or draws too simply, built from the holes that are in the CAD.

Everything is in CAD millimetres (x forward, y to port, z up), like the bodies it sits next to.

  reshape()  edits the mesh of a CAD body        - the lips of the mastband at the lummel
  build()    returns parts that have no CAD body - mastbout, grendelbout, borglijntje lummelbout,
             the two mikhouders, the six dolpotten with their gusset plates
"""
import numpy as np

import cad
from rigging import tube

# -- mastkoker: both bolts run athwartships through holes (r = 6) in its sides, y = -51.1 .. 50.9
MASTBOUT = (4361.2, 745.2)          # (x, z) through the mast itself, on its centreline
GRENDELBOUT = (4412.2, 420.2)       # (x, z) low down, passes just in front of the mast foot
KOKER_SIDES = (-51.1, 50.9)

# -- lummel: the lummelbout (r = 4) stands in the lips of the mastband and the eye of the lummelbeslag
LUMMELBOUT = (4309.1, -1.1)         # (x, y) of its axis
LUMMELBOUT_TOP = 1341.7
LIPS = ((1288.7, 1294.7), (1329.7, 1335.7))     # z of the lower and the upper lip
LIP_R, LIP_HOLE_R = 10.1, 4.6       # half the width of the lip; the hole leaves the bolt some play
LIP_ROOT = 4319.2                   # the lips leave the band here
GIEK_EYE = (4235.3, -0.9, 1351.0)   # middle of the eye on the beslagband of the giek


def _finish(V, F, want):
    """Flat-shaded mesh from triangles; each is wound so its normal agrees with `want`."""
    V = np.asarray(V, float); F = np.asarray(F, int).reshape(-1, 3)
    want = np.asarray(want, float).reshape(-1, 3)
    n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    flip = (n * want).sum(1) < 0
    F[flip] = F[flip][:, ::-1]
    Vo = V[F].reshape(-1, 3)
    No = np.repeat(want / np.maximum(np.linalg.norm(want, axis=1, keepdims=True), 1e-12), 3, axis=0)
    return Vo, No, np.arange(len(Vo)).reshape(-1, 3)


def _join(meshes):
    V, N, F, n = [], [], [], 0
    for v, nn, f in meshes:
        V.append(v); N.append(nn); F.append(f + n); n += len(v)
    return np.concatenate(V), np.concatenate(N), np.concatenate(F)


def prism(a, b, radius, sides, smooth):
    """Closed cylinder (or hexagon bar) from a to b."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    t = (b - a) / np.linalg.norm(b - a)
    u = np.cross(t, [0.0, 0.0, 1.0]); u = u / np.linalg.norm(u) if np.linalg.norm(u) > 1e-6 else np.array([1.0, 0, 0])
    w = np.cross(t, u)
    ang = np.linspace(0, 2 * np.pi, sides, endpoint=False)
    dirs = np.outer(np.cos(ang), u) + np.outer(np.sin(ang), w)
    V, F, want = [], [], []
    for k in range(sides):
        k2 = (k + 1) % sides
        quad = [a + radius * dirs[k], a + radius * dirs[k2], b + radius * dirs[k2], b + radius * dirs[k]]
        i = len(V); V += quad; F += [(i, i + 1, i + 2), (i, i + 2, i + 3)]
        want += [dirs[k] + dirs[k2]] * 2
        for end, out in ((a, -t), (b, t)):
            i = len(V); V += [end, end + radius * dirs[k], end + radius * dirs[k2]]
            F.append((i, i + 1, i + 2)); want.append(out)
    Vo, No, Fo = _finish(V, F, want)
    if smooth:                                           # round bar: shade the wall smoothly
        rad = Vo - a - np.outer((Vo - a) @ t, t)
        wall = np.abs((No * t).sum(1)) < 0.5
        No[wall] = rad[wall] / np.linalg.norm(rad[wall], axis=1, keepdims=True)
    return Vo, No, Fo


def pipe(a, b, r_out, r_in, sides=28):
    """Length of pipe with a real bore: outer wall, bore and an annular face at either end. Both
    walls are shaded round, like prism(smooth=True)."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    t = (b - a) / np.linalg.norm(b - a)
    u = np.cross(t, [0.0, 0.0, 1.0]); u = u / np.linalg.norm(u) if np.linalg.norm(u) > 1e-6 else np.array([1.0, 0, 0])
    w = np.cross(t, u)
    ang = np.linspace(0, 2 * np.pi, sides, endpoint=False)
    dirs = np.outer(np.cos(ang), u) + np.outer(np.sin(ang), w)
    V, F, want = [], [], []
    def quad(pts, n):
        i = len(V); V.extend(pts); F.extend([(i, i + 1, i + 2), (i, i + 2, i + 3)]); want.extend([n, n])
    for k in range(sides):
        d0, d1 = dirs[k], dirs[(k + 1) % sides]
        quad([a + r_out * d0, a + r_out * d1, b + r_out * d1, b + r_out * d0], d0 + d1)
        quad([a + r_in * d0, a + r_in * d1, b + r_in * d1, b + r_in * d0], -(d0 + d1))
        for end, out in ((a, -t), (b, t)):
            quad([end + r_in * d0, end + r_out * d0, end + r_out * d1, end + r_in * d1], out)
    Vo, No, Fo = _finish(V, F, want)
    rad = Vo - a - np.outer((Vo - a) @ t, t)
    rad = rad / np.linalg.norm(rad, axis=1, keepdims=True)
    wall = np.abs((No * t).sum(1)) < 0.5                 # everything but the two end faces
    No[wall] = np.copysign(1.0, (No[wall] * rad[wall]).sum(1))[:, None] * rad[wall]
    return Vo, No, Fo


def bolt(x, z, y_head, y_nut, radius=5.8):
    """Hex bolt lying athwartships: head against one side, washer and nut on the other. Head, nut
    and washer are sized to the bolt (an M12 as drawn for the mastbout)."""
    s = np.sign(y_nut - y_head); k = radius / 5.8
    P = lambda y: (x, y, z)
    return _join([
        prism(P(y_head - s * 1), P(y_nut + s * 16 * k), radius, 20, True),         # shank and thread end
        prism(P(y_head - s * 8 * k), P(y_head), 10.5 * k, 6, False),                 # head
        prism(P(y_nut), P(y_nut + s * 2 * k), 12.5 * k, 24, True),                   # washer
        prism(P(y_nut + s * 2 * k), P(y_nut + s * 11 * k), 10.5 * k, 6, False),      # nut
    ])


# -- roerkop: the two M6 bolts through its cheeks and the helmhout between them, in the holes the
# CAD draws (x, z), heads to port; the cheeks stand at y = 8.2 (port) and -23.9
ROERKOP_BOLTS = ((658.3, 1027.4), (766.0, 1058.7))
ROERKOP_CHEEKS = (8.2, -23.9)


def lug(origin, u, v, w0, w1, radius, hole, reach):
    """A flat lug: round end with a hole in it, running `reach` towards u from the hole's centre.
    origin is the hole's centre, u and v span the plate, its thickness runs from w0 to w1 along u x v."""
    origin, u, v = (np.asarray(a, float) for a in (origin, u, v))
    w = np.cross(u, v)
    corner = np.arctan2(radius, reach)
    ang = np.unique(np.concatenate([np.linspace(-np.pi, np.pi, 49), [-corner, corner]]))
    def edge(a):                                         # angle 0 looks along u
        c, s = np.cos(a), np.sin(a)
        if c <= 0:
            return radius
        return min(reach / c, radius / max(abs(s), 1e-9))
    at = lambda r, a, t: origin + r * np.cos(a) * u + r * np.sin(a) * v + t * w
    V, F, want = [], [], []
    def quad(p, q, r, s, n):
        i = len(V); V.extend([p, q, r, s]); F.extend([(i, i + 1, i + 2), (i, i + 2, i + 3)]); want.extend([n, n])
    for a0, a1 in zip(ang[:-1], ang[1:]):
        for t, n in ((w1, w), (w0, -w)):
            quad(at(hole, a0, t), at(edge(a0), a0, t), at(edge(a1), a1, t), at(hole, a1, t), n)
        mid = (at(edge(a0), a0, 0) + at(edge(a1), a1, 0)) / 2 - origin
        quad(at(edge(a0), a0, w0), at(edge(a1), a1, w0), at(edge(a1), a1, w1), at(edge(a0), a0, w1), mid)     # outside
        mid = (at(hole, a0, 0) + at(hole, a1, 0)) / 2 - origin
        quad(at(hole, a0, w0), at(hole, a1, w0), at(hole, a1, w1), at(hole, a0, w1), -mid)                      # wall of the hole
    return _finish(V, F, want)


def lip(z0, z1):
    """One lip of the mastband: a tongue with a round end and the hole the lummelbout stands in."""
    cx, cy = LUMMELBOUT
    return lug((cx, cy, 0.0), (1.0, 0, 0), (0, 1.0, 0), z0, z1, LIP_R, LIP_HOLE_R, LIP_ROOT + 2.0 - cx)   # its root is buried in the band


# -- wervel: the CAD has a bar of 12 x 55 mm on the pin in the nok of the giek, with two dimples
# where its holes should be. It is a little longer and wider than drawn, so that a real hole fits
# in each end: the kraanlijn is made fast in the upper one, the pettenlijntje runs through the lower.
WERVEL_X = (1488.3, 1496.3)         # thickness of the bar, along the giek
WERVEL_PIN = (-1.1, 1318.2)         # (y, z) of the pin it turns on
WERVEL_ARM, WERVEL_R, WERVEL_HOLE = 37.0, 9.0, 4.5
WERVEL_PIN_FACES = (17, 20, 23)     # B-rep faces of the pin itself; the rest of the drawn bar goes
WERVEL_FACES = range(6, 27)
GIEK_EYE_AFT = (1523.0, -1.3, 1284.5)               # eye under the aft beslagband: the pettenlijntje leads through it
SCHOOTRING_HOOP = (2493.7, -54.5, 1246.0)           # bottom of the free hoop on the starboard end of the schootring
SCHOOTRING_HOOP_BB = (2493.7, 52.3, 1246.0)         # the port one: the grootschoot goes on it when a rif is in
PETTENLIJN_R = 2.0


def wervel_holes():
    y, z = WERVEL_PIN
    x = sum(WERVEL_X) / 2
    return (x, y, z + WERVEL_ARM), (x, y, z - WERVEL_ARM)          # upper (kraanlijn), lower (pettenlijntje)


def wervel(V, N, F, G):
    keep = ~(np.isin(G, list(WERVEL_FACES)) & ~np.isin(G, WERVEL_PIN_FACES))
    F, G = F[keep], G[keep]
    g = int(G.max()) + 1
    y, z = WERVEL_PIN
    for end, u, v in ((z + WERVEL_ARM, (0, 0, -1.0), (0, 1.0, 0)), (z - WERVEL_ARM, (0, 0, 1.0), (0, -1.0, 0))):
        v_, n_, f_ = lug((0.0, y, end), u, v, WERVEL_X[0], WERVEL_X[1], WERVEL_R, WERVEL_HOLE, WERVEL_ARM)
        F = np.vstack([F, f_ + len(V)]); G = np.concatenate([G, np.full(len(f_), g)]); g += 1
        V = np.vstack([V, v_]); N = np.vstack([N, n_])
    return V, N, F, G


def bead(centre, radius, rings=6, sides=10):
    """A knot in a line: a small ball."""
    P, F = [], []
    for i in range(rings + 1):
        a = np.pi * i / rings
        for k in range(sides):
            b = 2 * np.pi * k / sides
            P.append([np.sin(a) * np.cos(b), np.sin(a) * np.sin(b), np.cos(a)])
    for i in range(rings):
        for k in range(sides):
            p, q = i * sides + k, i * sides + (k + 1) % sides
            F += [(p, p + sides, q), (q, p + sides, q + sides)]          # wound to agree with the outward normals
    P = np.array(P)
    return np.asarray(centre, float) + radius * P, P.copy(), np.array(F)


def pettenlijntje():
    """Keeps the schootring from sliding forward along the giek: a thin line from the free hoop on
    the starboard end of the schootring, aft under the giek and through the lower hole of the
    wervel, with a stopper knot behind it. It is made fast to nothing that turns with the giek
    (the wervel hangs free on its pin), so it does not wind up when the sail is rolled round the giek."""
    _, lower = wervel_holes()
    lower = np.array(lower); hoop = np.array(SCHOOTRING_HOOP); eye = lower + (8.0, 0.0, 0.0)
    knot = lower + (-(WERVEL_X[1] - WERVEL_X[0]) / 2 - 5.0, 0, 0)
    span = eye + np.outer(np.linspace(0, 1, 30), hoop - eye)
    span[:, 2] -= 18.0 * np.sin(np.pi * np.linspace(0, 1, 30))       # it is not bar-taut
    P = np.vstack([knot, lower, span])
    return _join([tube(P, PETTENLIJN_R, 8), bead(knot, 5.5), bead(hoop + (0, 0, 7.0), 5.0)])


# -- dodemanseind: from near the nok of the gaffel to the hanepootloper, the point on the gaffeldraad
# where the piekenval is made fast. It stops the loper running too far down the hanepoot when the
# sail comes down; under sail it carries nothing and hangs slack.
GAFFEL_NOK = np.array([2527.6, -2.2, 5957.5]); GAFFEL_DIR = np.array([-0.6600, -0.0002, 0.7512]); GAFFEL_R = 30.1
HANEPOOTLOPER = np.array([3778.2, 3.6, 5096.1])
DODEMANSEIND_R = 3.0


def dodemanseind():
    up = np.array([GAFFEL_DIR[2], 0.0, -GAFFEL_DIR[0]])              # square to the gaffel, upwards
    side = np.array([0.0, 1.0, 0.0])
    fast = GAFFEL_NOK - 100.0 * GAFFEL_DIR                          # made fast 10 cm from the nok
    a = np.linspace(0, 4 * np.pi, 49)                                # two turns round the gaffel
    r = GAFFEL_R + DODEMANSEIND_R
    turns = fast + np.outer(r * np.cos(a), up) + np.outer(r * np.sin(a), side) - np.outer(8.0 * a / (2 * np.pi), GAFFEL_DIR)
    k = np.linspace(0, 1, 40)[1:]
    span = turns[-1] + np.outer(k, HANEPOOTLOPER - turns[-1])
    span[:, 2] -= 110.0 * np.sin(np.pi * k)                          # slack: it carries nothing under sail
    span[:, 1] += 14.0 * np.sin(np.pi * k)                           # and hangs just clear of the gaffeldraad
    return _join([tube(np.vstack([turns, span]), DODEMANSEIND_R, 8), bead(HANEPOOTLOPER, 6.0)])


PUTTING_FOOT, PUTTING_LEAN = 757.0, 0.0513     # down to the top edge of the boeisel (z 758.8 there), not under the dolboord; it leans with the boeisel


def putting_foot(V, N, F, G):
    """The CAD stops the wantputting 9 mm above the dolboord, with nothing under it. Carry the
    plate on down, along its own lean, past the inboard side of the dolboord pipe and over the
    top edge of the boeisel, where it is welded on."""
    z0 = V[:, 2].min()
    foot = V[V[:, 2] < z0 + 0.4]
    side = np.sign(foot[:, 1].mean())
    x0, x1 = foot[:, 0].min(), foot[:, 0].max()
    ya, yb = sorted([foot[:, 1].min(), foot[:, 1].max()], key=abs)
    shift = side * PUTTING_LEAN * (z0 - PUTTING_FOOT)
    top = [(x0, ya, z0), (x1, ya, z0), (x1, yb, z0), (x0, yb, z0)]   # flush with the plate's end: no overlap to shimmer
    bottom = [(x, y + shift, PUTTING_FOOT) for x, y, _ in top]
    P = np.array(top + bottom); mid = P.mean(0)
    quads = [(0, 1, 5, 4), (1, 2, 6, 5), (2, 3, 7, 6), (3, 0, 4, 7), (4, 5, 6, 7)]
    Vq, Fq, want = [], [], []
    for q in quads:
        i = len(Vq); Vq += [P[k] for k in q]; Fq += [(i, i + 1, i + 2), (i, i + 2, i + 3)]
        n = np.cross(P[q[1]] - P[q[0]], P[q[2]] - P[q[0]]); n = n if n @ (P[list(q)].mean(0) - mid) > 0 else -n
        want += [n, n]
    v, n, f = _finish(Vq, Fq, want)
    return (np.vstack([V, v]), np.vstack([N, n]), np.vstack([F, f + len(V)]),
            np.concatenate([G, np.full(len(f), int(G.max()) + 1)]))


# -- buikdenning: the two middle boards have a notch each for the legs of the grootschootoog, but
# the CAD cuts it 29.5 mm too far aft (x 2481.1 .. 2516.7), where it has the lower block of the
# grootschoot, while the eye itself stands at x 2521.4 .. 2535.4. The notch is slid forward.
NOTCH_X, NOTCH_Y, NOTCH_SHIFT = (2481.0, 2516.8), (11.5, 51.7), 29.5
NOTCH_SLOPE = -1.0 / 35.0           # the boards run downhill going forward here


def slide_notch(V):
    """Move the corners of the notch forward, along the board. Nothing else has a vertex there."""
    V = V.copy()
    corner = ((V[:, 0] > NOTCH_X[0]) & (V[:, 0] < NOTCH_X[1])
              & (np.abs(V[:, 1]) > NOTCH_Y[0]) & (np.abs(V[:, 1]) < NOTCH_Y[1]))
    V[corner, 0] += NOTCH_SHIFT
    V[corner, 2] += NOTCH_SHIFT * NOTCH_SLOPE
    return V


# -- zwaardkast (5843): the CAD solid is inside out bar the top flange on one side, so the viewer,
# which only draws front faces, shows every edge of the 4 mm plates open. And its aft end stands at
# x 3365 while the slot in the vlak ends at x 3352.2, which leaves a hole in the bottom behind it:
# the foot of the (sloping) end plate is moved aft until its face meets the end of the slot at the
# height of the vlak (z 46 .. 50); its top stays where it is.
KAST_FOOT_X, KAST_FOOT_SHIFT = 3370.0, -14.5


VLAK_UNDER_KAST = "583F"     # the starboard vlak: its underside is where the kast ends


def zwaardkast(V, N, F, G):
    V = V.copy(); V[V[:, 0] < KAST_FOOT_X, 0] += KAST_FOOT_SHIFT
    # the CAD runs the plates of the kast 13 mm out through the bottom: everything below the
    # underside of the vlak, which rockers along the slot, is brought up flush with it
    Vv = cad.load(VLAK_UNDER_KAST)[0]
    near = Vv[np.abs(Vv[:, 1]) < 60.0]
    order = np.argsort(near[:, 0])
    xs, zs = near[order, 0], near[order, 2]
    low = np.minimum.accumulate(zs[::-1])[::-1] if zs[0] > zs[-1] else np.minimum.accumulate(zs)   # the underside rockers one way
    V[:, 2] = np.maximum(V[:, 2], np.interp(V[:, 0], xs, low))
    return outward(V, N, F, G)


# -- kim (5A0B, 5A0C) on the vlak (583C, 583F): the two plates are butted at the chine, end face to
# end face, but the CAD leaves 0.3 mm between them aft and 0.8 mm at the stem - a slit the light
# shows through - and sets the kim's end face 3.5 mm up the vlak's, which leaves a lit strip of
# that face showing outside. The kim's end face is laid onto the vlak's: its outer corner onto the
# vlak's outer corner, its inner corner onto the inner one.
KIM_ON = {"5A0B": "583C", "5A0C": "583F"}
KIM_REACH = 2.5              # the end faces are this close together; nothing else of the two is
STRIP_SPAN = 60.0            # along the seam, the stretch of end face a corner is judged against


def _closest_on_triangles(P, T):
    """For every point P[i], the closest point on any of the triangles T[i, k] (k candidates each)."""
    p = P[:, None, :]
    a, b, c = T[:, :, 0], T[:, :, 1], T[:, :, 2]
    n = np.cross(b - a, c - a); n /= np.maximum(np.linalg.norm(n, axis=2, keepdims=True), 1e-12)
    q = p - ((p - a) * n).sum(2, keepdims=True) * n                  # onto the plane
    inside = np.ones(q.shape[:2], bool)
    for u, v in ((a, b), (b, c), (c, a)):
        inside &= (np.cross(v - u, q - u) * n).sum(2) >= 0
    best = np.where(inside[..., None], q, np.nan)
    for u, v in ((a, b), (b, c), (c, a)):                          # or on one of its edges
        e = v - u
        t = np.clip(((p - u) * e).sum(2) / np.maximum((e * e).sum(2), 1e-12), 0, 1)
        s = u + t[..., None] * e
        closer = np.isnan(best[..., 0]) | (np.linalg.norm(s - p, axis=2) < np.linalg.norm(best - p, axis=2))
        best = np.where((closer & ~inside)[..., None], s, best)
    d = np.linalg.norm(best - p, axis=2)
    return best[np.arange(len(P)), d.argmin(1)], d.min(1)


def _near(P, V, F, reach):
    """Which points P come within `reach` of the mesh V, F."""
    T = V[F]
    boxed = ((P[:, None, :] >= T.min(1) - reach) & (P[:, None, :] <= T.max(1) + reach)).all(2)
    rows = np.flatnonzero(boxed.any(1))
    near = np.zeros(len(P), bool)
    if len(rows):
        cand = np.argsort(~boxed[rows], axis=1, kind="stable")[:, :int(boxed[rows].sum(1).max())]
        near[rows] = _closest_on_triangles(P[rows], T[cand])[1] < reach
    return near


def _outer_corner(P):
    """For the points of a thin end face along the chine: which lie on its outer (lower) edge. Round
    each point the face is fitted locally; its middle axis runs across the face, turned upward."""
    out = np.zeros(len(P), bool)
    for i, p in enumerate(P):
        local = P[np.abs(P[:, 0] - p[0]) < STRIP_SPAN]
        c = local.mean(0)
        across = np.linalg.svd(local - c)[2][1] if len(local) > 2 else np.array([0.0, 0.0, 1.0])
        out[i] = (p - c) @ (across if across[2] > 0 else -across) < 0
    return out


def _onto_edge(P, E):
    """Closest points on the polyline through E (sorted along x) for every point P."""
    E = E[np.argsort(E[:, 0])]
    a, b = E[:-1][None], E[1:][None]
    t = np.clip(((P[:, None] - a) * (b - a)).sum(2) / np.maximum(((b - a) ** 2).sum(2), 1e-12), 0, 1)
    S = a + t[..., None] * (b - a)
    return S[np.arange(len(P)), np.linalg.norm(S - P[:, None], axis=2).argmin(1)]


def kim(handle, V, F):
    Vv, _, Fv, _ = cad.load(KIM_ON[handle])
    Pk, first, back = np.unique(V.round(4), axis=0, return_index=True, return_inverse=True)   # a corner is shared by the faces that meet in it
    Pk = V[first]
    Pv = np.unique(Vv.round(4), axis=0)
    kim_end = np.flatnonzero(_near(Pk, Vv, Fv, KIM_REACH))
    vlak_end = Pv[_near(Pv, V, F, KIM_REACH + 3.5)]                  # its outer corner stands off the kim
    if len(kim_end) < 2 or len(vlak_end) < 4:
        return V
    k_out = _outer_corner(Pk[kim_end]); v_out = _outer_corner(vlak_end)
    P = Pk[kim_end]; to = P.copy()
    to[k_out] = _onto_edge(P[k_out], vlak_end[v_out])
    to[~k_out] = _onto_edge(P[~k_out], vlak_end[~v_out])
    # where the chine ends, at the stem head and the spiegel, the end face turns and its corners stop:
    # there the kim only closes up onto the nearest point of the vlak
    off = np.linalg.norm(to - P, axis=1) > KIM_REACH + 3.5
    if off.any():
        T = Vv[Fv]
        cand = np.argsort(np.linalg.norm(T.mean(1)[None] - P[off][:, None], axis=2), axis=1)[:, :40]
        to[off] = _closest_on_triangles(P[off], T[cand])[0]
    Pk = Pk.copy(); Pk[kim_end] = to
    return Pk[back.ravel()]


def outward(V, N, F, G):
    """Turn every B-rep face of a closed body that points into it outward again: a ray from just in
    front of the face that crosses the body an odd number of times started inside it."""
    T = V[F]; e1 = T[:, 1] - T[:, 0]; e2 = T[:, 2] - T[:, 0]
    n = np.cross(e1, e2); area = np.linalg.norm(n, axis=1)
    rays = np.array([[0.37, 0.56, 0.74], [-0.60, 0.21, 0.77], [0.45, -0.80, -0.39]])
    rays /= np.linalg.norm(rays, axis=1, keepdims=True)
    F = F.copy(); N = N.copy()
    for g in np.unique(G):
        tris = np.flatnonzero(G == g); i = tris[np.argmax(area[tris])]
        if area[i] < 1e-9:
            continue
        o = T[i].mean(axis=0) + n[i] / area[i] * 0.01
        inside = 0
        for d in rays:                                     # Moeller-Trumbore against every triangle
            p = np.cross(d, e2); det = (e1 * p).sum(1); ok = np.abs(det) > 1e-12
            inv = np.where(ok, 1.0 / np.where(ok, det, 1.0), 0.0); s = o - T[:, 0]
            u = (s * p).sum(1) * inv; q = np.cross(s, e1); v = (q * d).sum(1) * inv; t = (e2 * q).sum(1) * inv
            inside += int((ok & (u >= 0) & (v >= 0) & (u + v <= 1) & (t > 1e-6)).sum()) % 2
        if inside >= 2:
            F[tris] = F[tris][:, ::-1]
            N[np.unique(F[tris])] *= -1.0
    return V, N, F, G


# -- mast: the CAD keeps the square heel going 200 mm above the mastkoker and only then tapers it
# to the round spar, so the taper ends right under the mastband. Brought down: the heel rounds off
# from the top of the koker up, and is a plain round tube well before the band.
MAST_KOKER_TOP, MAST_ROUND_CAD, MAST_ROUND, MAST_BAND = 745.2, 1150.0, 950.0, 1288.0
MAST_AXIS, MAST_R = (4361.2, -1.1), 39.3       # the round spar above the heel: its axis and radius


def mast_taper(V):
    """Piecewise linear in z: the heel-to-round stretch above the koker compressed to end at
    MAST_ROUND, the round tube above stretched to the band; nothing else moves."""
    V = V.copy(); z = V[:, 2]
    lower = (z > MAST_KOKER_TOP) & (z <= MAST_ROUND_CAD)
    upper = (z > MAST_ROUND_CAD) & (z < MAST_BAND)
    V[lower, 2] = MAST_KOKER_TOP + (z[lower] - MAST_KOKER_TOP) * (MAST_ROUND - MAST_KOKER_TOP) / (MAST_ROUND_CAD - MAST_KOKER_TOP)
    V[upper, 2] = MAST_ROUND + (z[upper] - MAST_ROUND_CAD) * (MAST_BAND - MAST_ROUND) / (MAST_BAND - MAST_ROUND_CAD)
    return V


def mast_round(V, N, F, G, split_at):
    """The stretch between the heel and the band as one plain tube: the CAD's recess there, and
    the few big triangles it is drawn with, go, and a cylinder wall of MAST_R takes their place.
    It reaches a little into the heel below and the band above, where it is hidden inside them."""
    V, N, F, G = split_at(V, N, F, G, 2, MAST_ROUND)
    V, N, F, G = split_at(V, N, F, G, 2, MAST_BAND - 0.05)
    c = V[F].mean(axis=1)
    r = np.linalg.norm(c[:, :2] - MAST_AXIS, axis=1)
    drop = (c[:, 2] > MAST_ROUND) & (c[:, 2] < MAST_BAND - 0.05) & (r < MAST_R + 1.0)
    F, G = F[~drop], G[~drop]
    v, n, f = prism((*MAST_AXIS, MAST_ROUND - 3.0), (*MAST_AXIS, MAST_BAND + 2.0), MAST_R, 64, True)
    F = np.vstack([F, f + len(V)]); G = np.concatenate([G, np.full(len(f), int(G.max()) + 1)])
    return np.vstack([V, v]), np.vstack([N, n]), F, G


# -- bent bars: kikkers and leiogen are one round bar bent to shape. The CAD tessellates their
# torus and cylinder faces to a few thousand triangles each; the bar is swept anew along its own
# centre line instead, which reads the same and costs a fifth of that.
BARS = "5920 5928 591C 5924 592C 5930 594B 594F 5947 5943 595B 595F 5957 5953".split()
BAR_SIDES, BAR_STEP = 10, 3.0
BAR_REACH = 35.0             # a straight leg has no vertices along it: the next axis point can be this far on


def bar_tube(V, N, F, G):
    """A bent bar over again as a sweep: its two cut ends are the flat faces, its radius the half
    width of one of them, and its centre line the wall a radius in along the surface normals,
    chained from the one end to the other."""
    flat = [g for g in np.unique(G) if np.linalg.norm(N[np.unique(F[G == g])] - N[np.unique(F[G == g])].mean(0), axis=1).max() < 0.05]
    caps = [V[np.unique(F[G == g])] for g in flat]
    r = min(np.ptp((c - c.mean(0)) @ np.linalg.svd(c - c.mean(0), full_matrices=False)[2][1]) for c in caps) / 2
    wall = np.unique(F[~np.isin(G, flat)])
    P = np.unique((V[wall] - r * N[wall]).round(2), axis=0)
    ends = [c.mean(0) - r * 0.0 for c in caps]
    order = [ends[0]]; left = np.ones(len(P), bool)
    while left.any():
        d = np.linalg.norm(P - order[-1], axis=1); d[~left] = np.inf
        k = int(np.argmin(d))
        if d[k] > BAR_REACH:
            break
        order.append(P[k]); left &= np.linalg.norm(P - P[k], axis=1) > BAR_STEP * 0.6
    order.append(ends[1])
    C = np.array(order)
    s = np.concatenate([[0.0], np.cumsum(np.linalg.norm(np.diff(C, axis=0), axis=1))])
    t = np.linspace(0.0, s[-1], max(int(s[-1] / BAR_STEP), 4) + 1)
    C = np.column_stack([np.interp(t, s, C[:, k]) for k in range(3)])
    for _ in range(2):
        C[1:-1] = 0.25 * C[:-2] + 0.5 * C[1:-1] + 0.25 * C[2:]
    Vo, No, Fo = _sweep(C, r, BAR_SIDES)
    return Vo, No, Fo, np.zeros(len(Fo), dtype=G.dtype)


# -- boeisel into the dolboord: the CAD runs the top edge of the boeisel 1 to 3 mm outside the
# 20 mm pipe of the dolboord it is meant to end inside, so it shows through the pipe wherever
# that is faceted. Every vertex of the edge is drawn in onto the pipe's axis until it is inside.
BOEISEL_IN = {"5827": "5A3B", "5A33": "5A65"}
PIPE_R, PIPE_INSIDE = 10.0, 1.0      # the pipe, and how far inside it the edge is put
PIPE_FADE = 4.0                      # over this distance outside the pipe the pull fades to nothing
PIPE_STATION = 60.0                  # the pipe's axis is sampled this far apart along the boat


def boeisel_into_dolboord(handle, V):
    Vd, _, Fd, _ = cad.load(BOEISEL_IN[handle])
    top = V[:, 2].max()
    xs = np.arange(Vd[:, 0].min() + 30.0, Vd[:, 0].max() - 30.0, PIPE_STATION)
    axis = []
    for x in xs:
        seg = _section(Vd, Fd, x)
        axis.append(_round_section(seg)[0] if len(seg) else (np.nan, np.nan))
    axis = np.array(axis); ok = ~np.isnan(axis[:, 0])
    cy = np.interp(V[:, 0], xs[ok], axis[ok, 0]); cz = np.interp(V[:, 0], xs[ok], axis[ok, 1])
    ry, rz = V[:, 1] - cy, V[:, 2] - cz
    d = np.hypot(ry, rz)
    # drawn in radially, by a weight that fades out smoothly with the distance from the axis: the
    # plates of the boeisel do not share their vertices, so a move with a step in it would open
    # their seams into slits
    inside = np.clip((PIPE_R + PIPE_FADE - d) / PIPE_FADE, 0.0, 1.0)
    inside[(V[:, 0] <= xs[ok][0]) | (V[:, 0] >= xs[ok][-1]) | (d < 1e-6)] = 0.0
    k = 1.0 - np.minimum(1.0, (PIPE_R - PIPE_INSIDE) / np.maximum(d, 1e-6))   # how far in, as a share of the way to the axis
    V = V.copy()
    V[:, 1] -= ry * k * inside; V[:, 2] -= rz * k * inside
    return V


# -- dolboord: a 20 mm pipe the length of the boat, which the CAD builds from a hundred short
# faces whose end rings do not quite meet, so that slits open between them. Like the bent bars it
# is swept anew along its own centre line, read off those faces: each ring's middle is a point on
# the axis.
PIPES = {"5A3B", "5A65"}
PIPE_SIDES, PIPE_STEP = 20, 20.0     # its radius is PIPE_R, above


def _sweep(C, r, sides):
    """A closed tube along the polyline C: the wall, and a lid over either end."""
    Vt, Nt, Ft = tube(C, r, sides)
    lids = []
    for ring, centre, out in ((Vt[:sides], C[0], C[0] - C[1]), (Vt[-sides:], C[-1], C[-1] - C[-2])):
        Vl, Fl, want = [], [], []
        for k in range(sides):
            i = len(Vl); Vl += [centre, ring[k], ring[(k + 1) % sides]]; Fl.append((i, i + 1, i + 2)); want.append(out)
        lids.append(_finish(Vl, Fl, want))
    return _join([(Vt, Nt, Ft), *lids])


def pipe_sweep(V, F, G):
    centres = []
    for g in np.unique(G):
        P = V[np.unique(F[G == g])]
        if len(P) < 20:
            continue
        c = P.mean(0); a = np.linalg.svd(P - c, full_matrices=False)[2][0]     # the segment's own axis
        Q = P - c; t = Q @ a; d = np.linalg.norm(Q - np.outer(t, a), axis=1)
        if abs(d.mean() - PIPE_R) < 1.5 and d.std() < 1.6:          # a length of the pipe, not a lid or a joint
            u = np.cross(a, [0.0, 0.0, 1.0]); u = u / np.linalg.norm(u) if np.linalg.norm(u) > 1e-6 else np.array([1.0, 0.0, 0.0])
            w = np.cross(a, u)
            for lo, hi in zip(np.linspace(t.min(), t.max(), 4)[:-1], np.linspace(t.min(), t.max(), 4)[1:]):
                sel = (t >= lo) & (t <= hi)                        # three points along it: a bend is followed, not cut
                if sel.sum() >= 6:
                    # the centre of the ring, fitted as a circle in the plane square to the axis:
                    # the mean of the vertices sits wherever the mesh happens to be densest
                    pts = np.c_[Q[sel] @ u, Q[sel] @ w]
                    cc = np.linalg.lstsq(np.c_[2 * pts, np.ones(len(pts))], (pts ** 2).sum(1), rcond=None)[0][:2]
                    centres.append(c + a * t[sel].mean() + cc[0] * u + cc[1] * w)
    C = np.array(centres); left = np.ones(len(C), bool)
    order = [int(np.argmin(C[:, 0]))]; left[order[0]] = False
    while left.any():
        d = np.linalg.norm(C - C[order[-1]], axis=1); d[~left] = np.inf
        k = int(np.argmin(d))
        if d[k] > 6.0 * PIPE_STEP:
            break
        order.append(k); left[k] = False
    C = C[order]
    ends = []
    for c, t in ((C[0], C[0] - C[1]), (C[-1], C[-1] - C[-2])):     # out to the end of the pipe itself
        t = t / np.linalg.norm(t)
        near = V[np.linalg.norm(V - c, axis=1) < 60.0]
        ends.append(c + t * max(float(((near - c) @ t).max()), 0.0))
    C = np.vstack([ends[0], C, ends[1]])
    s = np.concatenate([[0.0], np.cumsum(np.linalg.norm(np.diff(C, axis=0), axis=1))])
    t = np.linspace(0.0, s[-1], max(int(s[-1] / PIPE_STEP), 4) + 1)
    C = np.column_stack([np.interp(t, s, C[:, k]) for k in range(3)])
    for _ in range(6):                                    # what is left of the ring-to-ring scatter is smoothed out
        C[1:-1] = 0.25 * C[:-2] + 0.5 * C[1:-1] + 0.25 * C[2:]
    Vo, No, Fo = _sweep(C, PIPE_R, PIPE_SIDES)
    return Vo, No, Fo, np.zeros(len(Fo), dtype=G.dtype)


def reshape(handle, V, N, F, G, split_at):
    """Mesh edits on a CAD body. Returns V, N, F, G."""
    if handle in PIPES:
        return pipe_sweep(V, F, G)
    if handle in BOEISEL_IN:
        return boeisel_into_dolboord(handle, V), N, F, G
    if handle in BARS:
        return bar_tube(V, N, F, G)
    if handle in ("5640", "563D"):
        return slide_notch(V), N, F, G
    if handle == "5843":
        return zwaardkast(V, N, F, G)
    if handle in KIM_ON:
        return kim(handle, V, F), N, F, G
    if handle in ("5980", "5981"):
        return putting_foot(V, N, F, G)
    if handle == "5706":
        return wervel(V, N, F, G)
    if handle in ("51C2", "519A"):
        import wantkettingen                              # here: it builds on this module
        return wantkettingen.reshape_want(handle, V, N, F, G, split_at)
    if handle != "56A3":
        return V, N, F, G
    V = mast_taper(V)
    V, N, F, G = mast_round(V, N, F, G, split_at)
    # The CAD draws the lips of the mastband as square tongues without a hole. Cut them off at
    # their root and put lips with a round end and a hole for the lummelbout in their place.
    V, N, F, G = split_at(V, N, F, G, 0, LIP_ROOT)
    c = V[F].mean(axis=1)
    lo, hi = LIPS[0][0] - 0.5, LIPS[1][1] + 0.5
    tongue = (c[:, 0] < LIP_ROOT) & (np.abs(c[:, 1] - LUMMELBOUT[1]) < LIP_R + 0.5) & (c[:, 2] > lo) & (c[:, 2] < hi)
    flat_or_lip = np.abs(N[F].mean(axis=1)[:, 2]) > 0.5           # top and bottom of band and lips
    sides = tongue & ~flat_or_lip & (c[:, 0] < LIP_ROOT - 1.2)      # walls of the tongues, not the band
    drop = (tongue & flat_or_lip) | sides
    F, G = F[~drop], G[~drop]
    g = int(G.max()) + 1
    for z0, z1 in LIPS:
        v, n, f = lip(z0, z1)
        F = np.vstack([F, f + len(V)]); G = np.concatenate([G, np.full(len(f), g)]); g += 1
        V = np.vstack([V, v]); N = np.vstack([N, n])
    return V, N, F, G


def lanyard():
    """Borglijntje: keeps the lummelbout with the boat. Tied under its head, made fast to the eye
    on the beslagband of the giek; it lies over the lummelbeslag in between."""
    cx, cy = LUMMELBOUT
    a = np.linspace(0, 2 * np.pi, 25)
    turn = np.c_[cx + 5.6 * np.cos(a), cy + 5.6 * np.sin(a), np.full(len(a), 1338.0)]   # round the bolt
    ex, ey, ez = GIEK_EYE
    knots = np.array([[cx - 5.6, cy, 1338.0], [4288.0, cy + 1.5, 1336.2], [4262.0, cy + 2.0, 1335.6],
                      [4246.0, ey + 1.0, 1341.5], [ex + 3.0, ey, ez - 1.0]])
    t = np.linspace(0, 1, len(knots)); tt = np.linspace(0, 1, 40)
    run = np.c_[[np.interp(tt, t, knots[:, k]) for k in range(3)]].T
    for _ in range(3):                                   # soften the corners
        run[1:-1] = (run[:-2] + 2 * run[1:-1] + run[2:]) / 4
    b = np.linspace(0, 2 * np.pi, 21)
    hitch = np.c_[np.full(len(b), ex + 3.0), ey + 4.0 * np.sin(b), ez + 3.0 - 4.0 * np.cos(b)]   # through the eye
    return _join([tube(turn, 1.4, 8), tube(run, 1.4, 8), tube(hitch, 1.4, 8)])


# -- dolpotten (Vlettenboek p. 23 and p. 35, detail "Dolpotten vertikaal"). A piece of 3/4" pipe,
# open at both ends so the pin and the kettinkje of a dol pass through it, stands exactly vertical
# against the inboard side of the dolboord, welded along the line where the two pipes touch, its
# top level with the top of the dolboord. Below that the boeisel leans away from the pot going
# down; a gusset plate closes that wedge over the lower 50 mm of the pot.
# Stations: 350 and 1330 mm aft of the aft edge of the voordek (the plecht, rowed from as well),
# and 450 mm forward of the forward edge of the achterdek.
DOLPOT_X = dict(plecht=4412.0, voor=3432.0, achter=2488.0)
DOLPOT_R, DOLPOT_WALL, DOLPOT_H = 13.45, 2.65, 100.0         # 3/4": 26.9 outside, wall 2.65
GUSSET_T, GUSSET_H, GUSSET_STEPS = 4.0, 50.0, 8              # thickness, height, steps along the plating
DOLPOT_SIDES = (("bb", 1.0), ("sb", -1.0))                   # sign of y
DOLBOORD_BODY = dict(bb="5A3B", sb="5A65")
BOEISEL_BODY = dict(bb="5827", sb="5A33")


def _section(V, F, x):
    """Cross-section of a mesh at station x, as line segments in the (y, z) plane."""
    T = V[F]
    s = T[:, :, 0] - x
    segs = []
    for tri in T[~((s > 0).all(1) | (s < 0).all(1))]:
        t = tri[:, 0] - x
        p = [tri[k] + t[k] / (t[k] - t[j]) * (tri[j] - tri[k]) for k, j in ((0, 1), (1, 2), (2, 0))
             if t[k] != t[j] and (t[k] <= 0 <= t[j] or t[j] <= 0 <= t[k])]
        if len(p) > 1:
            segs.append([p[0][1:], p[1][1:]])
    return np.array(segs)


def _round_section(seg):
    """Centre and radius of a round bar from its section. Its chords sag inside the true circle,
    so the radius is the largest one found rather than the fitted mean."""
    P = seg.reshape(-1, 2)
    c = np.linalg.lstsq(np.c_[2 * P, np.ones(len(P))], (P ** 2).sum(1), rcond=None)[0][:2]
    return c, np.linalg.norm(P - c, axis=1).max()


def _inboard_y(seg, z, side):
    """y of the inboard face of plating at height z, from its section."""
    a, b = seg[:, 0], seg[:, 1]
    hit = ((a[:, 1] - z) * (b[:, 1] - z) <= 0) & (np.abs(b[:, 1] - a[:, 1]) > 1e-9)
    a, b = a[hit], b[hit]
    y = a[:, 0] + (z - a[:, 1]) / (b[:, 1] - a[:, 1]) * (b[:, 0] - a[:, 0])
    return side * (side * y[side * y > 0]).min()


def dolpot_axes(mesh_dir):
    """Top centre of every dolpot, keyed <side>_<station>. The sheer rises and the beam changes
    along the boat, so each one is taken from the dolboord pipe at its own station: the pot hangs
    on the inboard side of that circle, its top at the top of it."""
    out = {}
    for side, s in DOLPOT_SIDES:
        V, _, F, _ = cad.load(DOLBOORD_BODY[side], mesh_dir)
        for key, x in DOLPOT_X.items():
            (y, z), r = _round_section(_section(V, F, x))
            out[f"{side}_{key}"] = np.array([x, y - s * (r + DOLPOT_R), z + r])
    return out


def gusset(V, F, top, s):
    """The plate between one pot and the boeisel, standing in the athwartships plane through the
    pot's axis. Its inboard edge lies on the wall of the pot and its outboard edge on the inside
    of the plating, which is curved, so it is followed step by step; the wedge is widest at the
    foot of the pot and has all but closed at the top edge of the plate."""
    x, y, z_top = top
    z = np.linspace(z_top - DOLPOT_H, z_top - DOLPOT_H + GUSSET_H, GUSSET_STEPS + 1)
    edges = []
    for dx in (-GUSSET_T / 2, GUSSET_T / 2):
        seg = _section(V, F, x + dx)
        y_pot = y + s * np.sqrt(DOLPOT_R ** 2 - dx ** 2)     # this face meets the round wall on a chord
        edges.append(np.array([[(x + dx, y_pot, zz), (x + dx, _inboard_y(seg, zz, s), zz)] for zz in z]))
    a, b = edges
    mid = np.concatenate(edges).reshape(-1, 3).mean(0)
    Vq, Fq, want = [], [], []
    def quad(pts):
        i = len(Vq); Vq.extend(pts); Fq.extend([(i, i + 1, i + 2), (i, i + 2, i + 3)])
        n = np.cross(pts[1] - pts[0], pts[2] - pts[0])
        want.extend([n if n @ (np.mean(pts, axis=0) - mid) > 0 else -n] * 2)
    for k in range(GUSSET_STEPS):
        quad([a[k, 0], a[k, 1], a[k + 1, 1], a[k + 1, 0]])   # the two flat faces
        quad([b[k, 0], b[k, 1], b[k + 1, 1], b[k + 1, 0]])
        quad([a[k, 0], b[k, 0], b[k + 1, 0], a[k + 1, 0]])   # edge against the pot
        quad([a[k, 1], b[k, 1], b[k + 1, 1], a[k + 1, 1]])   # edge on the boeisel
    for k in (0, -1):
        quad([a[k, 0], a[k, 1], b[k, 1], b[k, 0]])           # bottom and top edge
    return _finish(Vq, Fq, want)


def dolpotten(mesh_dir):
    """The six pots with their plates, as one part per side."""
    axes = dolpot_axes(mesh_dir)
    out = []
    for side, s in DOLPOT_SIDES:
        V, _, F, _ = cad.load(BOEISEL_BODY[side], mesh_dir)
        meshes = []
        for key in DOLPOT_X:
            top = axes[f"{side}_{key}"]
            meshes += [pipe(top - [0, 0, DOLPOT_H], top, DOLPOT_R, DOLPOT_R - DOLPOT_WALL),
                       gusset(V, F, top, s)]
        naam = "Dolpotten (bakboord)" if side == "bb" else "Dolpotten (stuurboord)"
        out.append((f"dolpotten_{side}", naam, "beslag", "verzinkt", _join(meshes)))
    return out


# -- mikhouders: the mik (the crutch the lowered giek, gaffel and sail rest in, Vademecum p. 35) is
# stowed upright in two short pieces of the same 3/4" pipe as the dolpotten, welded one above the
# other against the forward face of the achterschot on the centreline; the 20 mm bar of the mik
# slides through them with play and its foot lands on the vlak. The face is a flat vertical plate,
# so the pipe wall touches it along a line and no filler plate is needed.
ACHTERSCHOT_BODY = "59F2"
MIKHOUDER_DROP, MIKHOUDER_PITCH, MIKHOUDER_H = 40.0, 250.0, 50.0   # below the top edge, apart, long


def mikhouder_axes(mesh_dir):
    """(top rim of the upper pipe, bottom rim of the lower one) on their common vertical axis,
    measured from the achterschot itself: its forward face is the plate's highest x, and the top
    edge of that face is where it turns aft into the flange the achterdek lands on."""
    V = cad.load(ACHTERSCHOT_BODY, mesh_dir)[0]
    x = V[:, 0].max()
    top = V[V[:, 0] > x - 1e-3, 2].max()
    z = top - MIKHOUDER_DROP
    return (np.array([x + DOLPOT_R, 0.0, z]),
            np.array([x + DOLPOT_R, 0.0, z - MIKHOUDER_PITCH - MIKHOUDER_H]))


def mikhouders(mesh_dir):
    boven, onder = mikhouder_axes(mesh_dir)
    r_in = DOLPOT_R - DOLPOT_WALL
    return _join([pipe(boven - [0, 0, MIKHOUDER_H], boven, DOLPOT_R, r_in),
                  pipe(onder, onder + [0, 0, MIKHOUDER_H], DOLPOT_R, r_in)])


def build(mesh_dir):
    """[(id, naam, groep, materiaal, (V, N, F))] for parts that have no CAD body."""
    lo, hi = KOKER_SIDES
    return [
        ("mikhouders", "Mikhouders", "beslag", "verzinkt", mikhouders(mesh_dir)),
        ("mastbout", "Mastbout", "beslag", "verzinkt", bolt(*MASTBOUT, lo, hi)),
        ("roerkop", "Roerkop (helmhoutbeslag)", "roer", "verzinkt", _join([bolt(x, z, *ROERKOP_CHEEKS, radius=2.9) for x, z in ROERKOP_BOLTS])),
        ("grendelbout", "Grendelbout", "beslag", "verzinkt", bolt(*GRENDELBOUT, lo, hi)),
        ("borglijntje_lummelbout", "Borglijntje lummelbout", "lopend_want", "touw", lanyard()),
        ("pettenlijntje", "Pettenlijntje", "lopend_want", "touw", pettenlijntje()),
        ("dodemanseind", "Dodemanseind", "lopend_want", "touw", dodemanseind()),
    ] + dolpotten(mesh_dir)
