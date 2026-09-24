"""Borgkettinkje: the short chain that keeps the roer with the boat when it lifts off its
vingerlingen. CAD millimetres (x forward, y to port, z up), like pipeline/hardware.py.

The CAD has nothing of it. Three galvanised pieces:

  borgoog_roer      a quarter round of 6 mm bar welded into the corner where the top edge of the
                    roerblad runs into the roerkoning; corner and bar together make the eye
  borghaak_spiegel  one more leioog (body 5943), welded to the outside of the spiegel beside the
                    top vingerling, standing out aft with its opening upright
  borgkettinkje     5 mm short-link chain with a harpje at either end, hanging slack between them

The corner the eye goes into is a real corner in the drawing: the leading edge of the roerblad is
tangent to the roerkoning over the whole weld (16.850 mm off its axis, the radius of the 33.7 mm
tube), and the top edge of the plate leaves that tangent line at 82.4 degrees. So the quarter
round is an arc about the corner point itself: it meets the top edge square and runs into the
tube along a generator.

The hook is not drawn anew; it is body 5943 turned onto the spiegel, the way sleepogen.bow_eye()
stands a landvastoog on the stem.

The chain is long enough that the rudder can swing 40 degrees either way without it coming taut:
the eye travels on a circle about the roerkoning's axis, the largest distance from the hook over
that swing is taken, and the chain is made a quarter longer again.

    build(mesh_dir)   [(id, naam, groep, materiaal, (V, N, F))]
    points(mesh_dir)  eye, hook, length and number of links, for the viewer to re-lay the chain
"""
import numpy as np

import anchor                                            # its links, with this chain's numbers
import cad
import sleepogen                                         # the plane of the spiegel
from hardware import _join, prism
from rigging import tube

ROERBLAD, ROERBLAD_TOP = "58B7", 1       # face 1 of the blade is its top edge: one flat rectangle
ROERKONING, KONING_WALL = "58B8", 0      # face 0 of the stock is the wall of the tube
VINGERLING = "5A27"                      # the top one of the three, the hook goes beside it
LEIOOG, LEIOOG_WALL, LEIOOG_FEET = "5943", (0, 1, 2), (3, 4)   # bent bar; its two cut ends




def _unit(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def _cylinder(P):
    """Axis (point, unit direction, up) and radius of a cylindrical face. The direction is the
    long axis of the point cloud; in the plane across it the centre and the radius come out of one
    linear least squares, since |p - c|^2 = r^2 is linear in (c, r^2 - |c|^2)."""
    c0 = P.mean(0)
    d = np.linalg.eigh(np.cov((P - c0).T))[1][:, -1]
    d = -d if d[2] < 0 else d
    e = _unit(np.cross(d, [0.0, 0.0, 1.0]))
    q = np.column_stack([(P - c0) @ e, (P - c0) @ np.cross(d, e)])
    k = np.linalg.lstsq(np.column_stack([2 * q, np.ones(len(q))]), (q ** 2).sum(1), rcond=None)[0]
    return c0 + k[0] * e + k[1] * np.cross(d, e), d, float(np.sqrt(k[2] + k[0] ** 2 + k[1] ** 2))


def koning_axis(mesh_dir):
    """Point on the axis, unit direction up it, and radius of the roerkoning (1" pipe, raked 33.7
    degrees aft). The stock and the whole rudder turn about this line."""
    V, N, F, G = cad.load(ROERKONING, mesh_dir)
    return _cylinder(V[np.unique(F[G == KONING_WALL])])


def blade_corner(mesh_dir):
    """Where the top edge of the roerblad runs into the roerkoning: the corner point on the
    blade's own centre plane, the unit vector along the top edge away from it, and the unit
    normal of that edge (out of the plate, in the plane of the blade). The top edge is one flat
    face with four corners; the two of them against the tube are the corner sought."""
    c, d, r = koning_axis(mesh_dir)
    p = _unit([d[2], 0.0, -d[0]])                        # out of the tube, square to its axis
    V, N, F, G = cad.load(ROERBLAD, mesh_dir)
    P = V[np.unique(F[G == ROERBLAD_TOP])]
    at_tube = (P @ p) > (P @ p).mean()
    C = P[at_tube].mean(0)
    e = _unit(P[~at_tube].mean(0) - C)
    f = _unit(np.cross(e, [0.0, 1.0, 0.0]))
    return C, e, f if f @ d > 0 else -f


# -- borgoog: a quarter round of 6 mm bar across the corner. 20 mm clear inside leaves room for
# the bow of the harpje as well as for its 6 mm pin. Both ends are carried a millimetre into the
# steel: at the top edge the arc leaves square to the plate, so that is a turn of
# arcsin(let-in / R); at the tube the centre line crosses the wall at one radius per radian, so
# there it is a turn of arccos(let-in / R) short of the tangent.
OOG_BAR, OOG_R, OOG_LET_IN = 3.0, 23.0, 1.0
OOG_SIDES, OOG_STEPS = 8, 25


def oog_path(mesh_dir):
    """Centre line of the quarter round, an arc about the corner itself."""
    C, e, f = blade_corner(mesh_dir)
    c, d, r = koning_axis(mesh_dir)
    p = _unit([d[2], 0.0, -d[0]])
    # the distance of the arc from the axis is r - R cos(phi - psi): psi is the turn at which it
    # touches the tangent line the blade is welded along
    psi = np.arctan2(f @ p, e @ p)
    phi = np.linspace(-np.arcsin(OOG_LET_IN / OOG_R), psi - np.arccos(OOG_LET_IN / OOG_R), OOG_STEPS)
    return C + OOG_R * (np.cos(phi)[:, None] * e + np.sin(phi)[:, None] * f)


def opening(mesh_dir, steps=48, passes=4):
    """Middle and radius of the biggest circle that fits in the eye - the clear opening between
    the top edge of the blade, the wall of the tube and the inside of the bar. Scanned over the
    plane of the blade, each pass on the cell the last one picked."""
    C, e, f = blade_corner(mesh_dir)
    c, d, r = koning_axis(mesh_dir)
    lo, hi = np.zeros(2), np.full(2, OOG_R)
    for _ in range(passes):
        a, b = np.linspace(lo[0], hi[0], steps), np.linspace(lo[1], hi[1], steps)
        A, B = np.meshgrid(a, b, indexing="ij")
        Q = C + A[..., None] * e + B[..., None] * f
        q = Q - c
        tube_gap = np.linalg.norm(q - (q @ d)[..., None] * d, axis=-1) - r
        clear = np.minimum(np.minimum(B, tube_gap),
                           OOG_R - OOG_BAR - np.linalg.norm(Q - C, axis=-1))
        i, j = np.unravel_index(clear.argmax(), clear.shape)
        step = (hi - lo) / (steps - 1)
        lo, hi = np.array([a[i], b[j]]) - step, np.array([a[i], b[j]]) + step
    return C + a[i] * e + b[j] * f, float(clear[i, j])


def borgoog(mesh_dir):
    return tube(oog_path(mesh_dir), OOG_BAR, OOG_SIDES)


# -- borghaak: body 5943, a C of 8 mm round bar, 50 mm between its two feet and standing 37.2 mm
# proud of the plating. It is welded to the curve of the boeisel, so its two cut feet are 17.8
# degrees out of parallel and no one plane lies in both. LEIOOG_SEAT is the plate normal that
# seats them best: with it the shallower foot touches, the other is 0.40 mm proud at its thinnest
# and 1.99 mm let into the steel at its deepest, inside the 2.5 mm the landvastogen are let in and
# well short of the 4 mm the spiegel is thick.
LEIOOG_BAR = 4.0
LEIOOG_SEAT = np.array([-0.0008, 0.9922, 0.1244])
HAAK_CLEAR = 60.0            # from the tube of the top vingerling to the plane of the C
HAAK_SIDE = -1.0             # to starboard: the eye stands clear of roerhaken and vingerlingen


def _leioog_local(mesh_dir):
    """Body 5943 in a frame of its own: the mesh, and the orthonormal basis (up the base line,
    into the plate, across the plane of the C) with the middle of its two feet on the plate as
    the origin."""
    V, N, F, G = cad.load(LEIOOG, mesh_dir)
    seat = _unit(LEIOOG_SEAT)
    feet = [V[np.unique(F[G == g])] for g in LEIOOG_FEET]
    plate = max(float((P @ seat).min()) for P in feet)   # the plate lies on the shallower foot
    m = np.linalg.eigh(np.cov((V - V.mean(0)).T))[1][:, 0]    # the C is flat: its thinnest way
    m = _unit(m - (m @ seat) * seat)
    base = feet[1].mean(0) - feet[0].mean(0)
    base = _unit(base - (base @ seat) * seat - (base @ m) * m)
    o = (feet[0].mean(0) + feet[1].mean(0)) / 2
    return V, N, F, G, np.array([base, seat, m]), o - (o @ seat - plate) * seat


def haak_frame(mesh_dir):
    """Where the hook stands: a point on the outside face of the spiegel beside the top
    vingerling, and the unit vectors the leioog's own axes are turned onto - up the plate, into
    the plate (forward), and athwartships."""
    n, outside, inside = sleepogen.spiegel_plane(mesh_dir)
    V, N, F, G = cad.load(VINGERLING, mesh_dir)
    c, d, r = _cylinder(V[np.unique(F[G == 0])])
    t = (V[np.unique(F[G == 0])] - c) @ d
    top = c + t.max() * d                                # middle of the tube's upper end face
    up = _unit(np.array([0.0, 0.0, 1.0]) - n[2] * n)
    y = c[1] + HAAK_SIDE * (r + HAAK_CLEAR)
    z = top[2]
    at = np.array([(outside - y * n[1] - z * n[2]) / n[0], y, z])
    return at, np.array([up, n, np.cross(up, n)])


def haak(mesh_dir):
    """The hook: the leioog turned out of its own frame into the one on the spiegel. The third
    axis takes the sign that keeps the basis handed like the leioog's, so nothing is mirrored and
    the winding of every triangle still agrees with its normal."""
    V, N, F, G, local, o = _leioog_local(mesh_dir)
    at, target = haak_frame(mesh_dir)
    if np.linalg.det(target) * np.linalg.det(local) < 0:
        target = target * np.array([1.0, 1.0, -1.0])[:, None]
    return at + ((V - o) @ local.T) @ target, (N @ local.T) @ target, F


def _haak_bar(mesh_dir):
    """Centre line of the hook's bar where it stands clear of the plate, in place on the spiegel.
    The mesh carries exact surface normals, so a point of the wall less one bar radius along its
    normal lies on the centre line."""
    V, N, F, G = cad.load(LEIOOG, mesh_dir)
    W, M, _ = haak(mesh_dir)
    wall = np.unique(F[np.isin(G, LEIOOG_WALL)])
    P = np.unique((W[wall] - LEIOOG_BAR * M[wall]).round(3), axis=0)
    n, outside, inside = sleepogen.spiegel_plane(mesh_dir)
    return P[outside - P @ n > 6.0]                      # the arch, not the two feet


def haak_bearing(mesh_dir):
    """Where a harpje hung in the hook comes to rest: the lowest point of the bar inside the eye,
    with the unit tangent of the bar there (fitted on the bar within a radius of it)."""
    P = _haak_bar(mesh_dir)
    low = P[P[:, 2].argmin()]
    near = P[np.linalg.norm(P - low, axis=1) < 7.0]
    return low, np.linalg.eigh(np.cov((near - near.mean(0)).T))[1][:, -1]


# -- borgkettinkje: 5 mm short-link chain, links 16 mm inside (pitch 21, outside width 17), with a
# harpje at either end. anchor.ketting threads the ankerketting out of the same stadium-shaped
# links, so its link builder is used here with this chain's numbers. Five sides to the wire keep
# the whole part inside its triangle budget.
CHAIN = dict(pitch=21.0, wire=5.0, width=17.0, sides=5)
SWING = 40.0                 # degrees the rudder may turn either way with the chain still slack
SLACK = 1.25                 # how much longer than the furthest the two eyes ever are apart
HARP_BAR, HARP_BOW, HARP_LEG, HARP_PIN = 2.5, 7.0, 8.0, 3.0      # the harpjes: 5 mm bar, 6 mm pin


def _harpje(bear, out, axis, hang):
    """A harpje (small D-shackle) hooked over a bar of radius `hang`: `bear` is a point on the
    centre line of that bar, `out` the way the shackle points away from it and `axis` its pin.
    The bow bears on the far side of the bar and the chain hangs on the pin, whose ends close the
    open ends of the bow. Returns the mesh and the middle of the pin."""
    o = bear + (HARP_BOW - HARP_BAR - hang) * out        # bow centre: the bar just inside its crown
    pin = o + HARP_LEG * out
    ang = np.linspace(np.pi, 2 * np.pi, 7)[:, None]
    bow = np.vstack([pin - HARP_BOW * axis,
                     o + HARP_BOW * (np.cos(ang) * axis + np.sin(ang) * out),
                     pin + HARP_BOW * axis])
    return _join([tube(bow, HARP_BAR, 6),
                  prism(pin - (HARP_BOW + 2.0) * axis, pin + (HARP_BOW + 2.0) * axis,
                        HARP_PIN, 8, True)]), pin


def oog_bearing(mesh_dir):
    """Where a harpje hung in the eye on the rudder comes to rest: the middle of the arc, with
    the unit tangent of the bar there."""
    P = oog_path(mesh_dir)
    k = len(P) // 2
    return P[k], _unit(P[k + 1] - P[k - 1])


def _span(mesh_dir):
    """The two points the harpjes bear on, and the furthest they are ever apart: the eye travels
    on a circle about the roerkoning's axis as the rudder swings, the hook stands still."""
    bear_o = oog_bearing(mesh_dir)[0]
    bear_h = haak_bearing(mesh_dir)[0]
    c, d, r = koning_axis(mesh_dir)
    q = bear_o - c
    a = np.radians(np.linspace(-SWING, SWING, 2 * int(SWING) + 1))[:, None]
    swung = c + q * np.cos(a) + np.cross(d, q) * np.sin(a) + d * (d @ q) * (1 - np.cos(a))
    return bear_o, bear_h, np.linalg.norm(swung - bear_h, axis=1)


def _catenary(A, B, length, n):
    """`length` of chain hanging between A and the higher point B, sampled at n points evenly
    along its own length. In the vertical plane through the two points the curve is
    y = a cosh((x - x0) / a); over the horizontal distance h and the rise v the parameter follows
    from 2a sinh(h / 2a) = sqrt(length^2 - v^2), whose left side falls monotonically from infinity
    to h as a grows, so it is bisected for."""
    v = B[2] - A[2]
    flat = np.array([B[0] - A[0], B[1] - A[1], 0.0])
    h = np.linalg.norm(flat)
    target = np.sqrt(max(length ** 2 - v ** 2, 1e-9))
    lo, hi = 1e-3, 1e6
    for _ in range(200):
        mid = (lo + hi) / 2
        lo, hi = (mid, hi) if 2 * mid * np.sinh(h / (2 * mid)) > target else (lo, mid)
    a = (lo + hi) / 2
    w = (np.log((length + v) / (length - v)) - h / a) / 2      # y'(0) = sinh(w): the lower end
    s = np.linspace(0.0, length, n)
    x = a * (np.arcsinh(s / a + np.sinh(w)) - w)               # the lowest point is at x = -a w
    y = a * np.cosh(x / a + w) - a * np.cosh(w)
    return A + np.outer(x, flat / h) + np.outer(y, [0.0, 0.0, 1.0])


def _hang(mesh_dir):
    """Both harpjes and the run of chain between their pins. Each harpje lies in the plane of the
    bar it hangs on that points at the other one, which is the way a shackle turns under its
    load."""
    bear_o, bear_h, reach = _span(mesh_dir)
    t_o, t_h = oog_bearing(mesh_dir)[1], haak_bearing(mesh_dir)[1]
    aim = lambda a, b, t: _unit((b - a) - ((b - a) @ t) * t)  # at the other eye, across the bar
    out_o, out_h = aim(bear_o, bear_h, t_o), aim(bear_h, bear_o, t_h)
    harp_o, pin_o = _harpje(bear_o, out_o, _unit(np.cross(t_o, out_o)), OOG_BAR)
    harp_h, pin_h = _harpje(bear_h, out_h, _unit(np.cross(t_h, out_h)), LEIOOG_BAR)
    spare = SLACK * reach.max() - np.linalg.norm(pin_o - bear_o) - np.linalg.norm(pin_h - bear_h)
    links = int(round(spare / CHAIN["pitch"]))
    return [harp_o, harp_h], pin_o, pin_h, links


def ketting(mesh_dir):
    """The two harpjes and the links, every other one turned a quarter round, threaded along the
    catenary between the two pins."""
    meshes, pin_o, pin_h, links = _hang(mesh_dir)
    pitch = CHAIN["pitch"]
    low, high = (pin_o, pin_h) if pin_o[2] < pin_h[2] else (pin_h, pin_o)
    P = _catenary(low, high, links * pitch, 16 * links + 1)
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
    for k in range(links):
        c = np.array([np.interp((k + 0.5) * pitch, s, P[:, j]) for j in range(3)])
        t = np.array([np.interp((k + 0.6) * pitch, s, P[:, j]) for j in range(3)]) - c
        t = _unit(t)
        u = np.array([0.0, 0.0, 1.0]) - t[2] * t         # links on edge stand up, the rest lie flat
        u = _unit(u) if np.linalg.norm(u) > 1e-6 else np.array([1.0, 0.0, 0.0])
        meshes.append(anchor._link(c, t, u if k % 2 == 0 else np.cross(t, u), **CHAIN))
    return _join(meshes)


def points(mesh_dir):
    """Middle of the eye on the rudder, the point inside the hook the harpje bears on, the length
    of the whole chain between those two (harpjes counted in) and the number of links, so the
    viewer can lay the chain again when the rudder turns."""
    _, pin_o, pin_h, links = _hang(mesh_dir)
    bear_o, bear_h, _ = _span(mesh_dir)
    length = (links * CHAIN["pitch"]
              + np.linalg.norm(pin_o - bear_o) + np.linalg.norm(pin_h - bear_h))
    return dict(oog=opening(mesh_dir)[0], haak=bear_h, lengte=float(length), schakels=links)


def build(mesh_dir):
    """[(id, naam, groep, materiaal, (V, N, F))] for the three pieces of the borgkettinkje."""
    return [
        ("borgoog_roer", "Oog van het borgkettinkje", "roer", "verzinkt", borgoog(mesh_dir)),
        ("borghaak_spiegel", "Haak van het borgkettinkje", "roer", "verzinkt", haak(mesh_dir)),
        ("borgkettinkje", "Borgkettinkje", "roer", "verzinkt", ketting(mesh_dir)),
    ]
