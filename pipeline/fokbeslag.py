"""Fokbeslag: how the fok is bent to the voorstag, and how the stay's foot is set up.

Two parts the CAD has nothing of, both stainless:

  leuvers           ten stagleuvers (piston hanks) seized to the luff of the fok, the jaw of each
                    clipped round the voorstag
  voorstagspanner   the voorstagspanner with its pelikaanhaak: one piece of 8 mm rod bent into a
                    long-shanked hook that takes the stay's foot to the hanekam, with the loose
                    ring that keeps it shut. It replaces the harpje (bodies 514E and 5156).

Everything is in CAD millimetres (x forward, y to port, z up), like pipeline/hardware.py.

The CAD draws the fok set flying, with its luff 38 to 46 mm clear of the stay, so bridging that
gap is exactly what the leuvers do here: each one is set with the centre of its jaw on the axis
of the stay and the tip of its tail on the luff - the line the viewer swings the whole sail
about, so the leuvers swing with it. Its long axis is therefore square to the stay and reaches
into the plane of the sail rather than lying in it; over the length of the luff that is a lean of
34 to 28 degrees out of the cloth, and a tail 38 to 46 mm long against the 38 of the real hook.
Both follow from the CAD's gap; neither is a choice made here.

  build(mesh_dir)          [(id, naam, groep, materiaal, (V, N, F))]
  build_spriet(mesh_dir)   the same, for the spriet on the hanekam
"""
import numpy as np

import borgketting
import cad
import parts
from hardware import _finish, _join, bead, bolt, prism    # the mesh helpers, so this file is geometry only
from rigging import tube

VOORSTAG = "51D0"            # the wire, with a thimble eye spliced into its lower end
HANEKAM = "589A"             # the plate on the stem head, with three holes athwartships

# Corners of the fok as the CAD draws it, the tack lowered with the harpje of the kettinkje
# (parts.HALS_SHIFT).
FOK_TACK, FOK_HEAD, FOK_CLEW = np.array(parts.FOK_TACK), np.array(parts.FOK_HEAD), np.array(parts.FOK_CLEW)

# -- stagleuver, after the 50 mm cast hook sold for it: 51.5 long over all, 27 wide, 10 thick at
# the shoulder. The jaw is a C of 14 mm inside closed by a thin spring-loaded gate; the other end
# is flattened into a tongue with a slot, and the luff of the sail is sewn through that slot.
N_LEUVERS = 10
LEUVER_MARGIN = 250.0        # the first and the last sit this far in from tack and head
JAW_BORE = 7.0               # inside radius of the C: the stay runs through it with room to spare
JAW_WALL, JAW_HALF_T = 3.25, 5.0     # half the section of the C at the shoulder, in plane and along the stay
JAW_TIP, JAW_TAPER = 0.5, 3.0   # the section keeps its size round the body and thins only near the lips
JAW_MOUTH = np.radians(60.0)  # how much of the C is left open, closed by the gate
GATE_R = 1.25
TAIL_HALF_T, TAIL_HALF_W = 2.0, 5.0  # the tail is flattened to 4 mm and 10 mm wide
TAIL_ROOT = 13.0             # where its round root sits, buried in the wall of the jaw
SLOT_R, SLOT_END, SLOT_LEN = 2.0, 5.0, 9.0   # the slot: 4 wide, ending this far from the tip

# -- pelikaanhaak. The U straddles the hanekam, its bend through the frontmost hole and the
# bridge of plate above that hole caught in its throat; the legs come up either side of the
# plate, so they stand 16.5 mm off its middle. The short one curls back in to the eye, which is
# pinned to the thimble in the stay; the long one runs up beside the stay and is loose.
ROD_R = 4.0                  # 8 mm rod
U_INSIDE = 25.0
HOLE_BEAR = 1.0              # the bend rides this far up the hole, pulled against its upper edge
ARM_LEN, ARM_LEAN, ARM_ESS = 200.0, 16.0, 40.0   # long arm: length, lean out at the top, size of its S
ARM_SIDE = -1.0              # to starboard, the empty side: kettinkje, fok and its tack fittings are to port
EYE_BORE, EYE_WALL, EYE_HALF_T = 4.0, 4.5, 3.0   # the small forged eye: 26 outside, 8 bore, 6 thick
EYE_Y = 6.5                  # its middle, one millimetre clear of the port face of the thimble
PIN_R, PIN_HEAD = 3.0, 5.0   # clevis pin through eye and thimble
RING_INSIDE = (45.0, 35.0)   # the loose ring, 6 mm rod
RING_R = 3.0
RING_UP = 2.0 / 3.0          # how far up the arm it sits
RING_GAP = 1.1               # it is meant to bear on stay and arm; this leaves both a hair clear




def stay_axis(mesh_dir):
    """Point, unit direction (up the stay) and radius of the voorstag. The wire is one long
    cylindrical face; its vertices come in rings, and the mean of a full ring lies on the axis."""
    V, _, F, G = cad.load(VOORSTAG, mesh_dir)
    g = np.bincount(G).argmax()                          # the wire itself; the rest is the splice
    P = V[np.unique(F[G == g])]
    d = np.linalg.eigh(np.cov((P - P.mean(0)).T))[1][:, -1]
    d = -d if d[2] < 0 else d
    t = P @ d
    order = np.argsort(t)
    rings = [r for r in np.split(order, np.where(np.diff(t[order]) > 1.0)[0] + 1) if len(r) >= 8]
    C = np.array([P[r].mean(0) for r in rings])
    d = (C[-1] - C[0]) / np.linalg.norm(C[-1] - C[0])
    rad = np.linalg.norm((P - C[0]) - np.outer((P - C[0]) @ d, d), axis=1)
    return C[0], d, float(np.percentile(rad, 90))        # facets lie just inside the true radius


def stay_eye(mesh_dir):
    """Middle of the thimble eye spliced into the foot of the stay. The splice is a flat bight of
    wire, so the mean of the vertices of that bight is the middle of the opening it leaves."""
    V, _, F, _ = cad.load(VOORSTAG, mesh_dir)
    P = V[np.unique(F[V[F][:, :, 2].max(axis=1) < V[:, 2].min() + 45.0])]
    return P.mean(0)


def hanekam_holes(mesh_dir):
    """[(centre, radius)] of the holes in the hanekam, frontmost first. They are the faces that
    run right through the plate and whose section is a circle."""
    V, _, F, G = cad.load(HANEKAM, mesh_dir)
    y0, y1 = V[:, 1].min(), V[:, 1].max()
    out = []
    for g in np.unique(G):
        P = V[np.unique(F[G == g])]
        if len(P) < 20 or P[:, 1].min() > y0 + 0.1 or P[:, 1].max() < y1 - 0.1:
            continue
        c = P[:, [0, 2]].mean(0)
        r = np.linalg.norm(P[:, [0, 2]] - c, axis=1)
        if r.std() < 0.3:                                # round bore, not a flat face or a chamfer
            out.append((np.array([c[0], 0.0, c[1]]), float(r.mean())))
    return sorted(out, key=lambda h: -h[0][0])


def luff():
    """Unit vector up the luff, its length, and the unit normal of the plane of the sail."""
    d = FOK_HEAD - FOK_TACK
    length = np.linalg.norm(d)
    n = np.cross(d, FOK_CLEW - FOK_TACK)
    return d / length, float(length), n / np.linalg.norm(n)


# ---------------------------------------------------------------- mesh helpers

def _sweep(P, m, across, thick, sides=6, closed=False, phase=0.0):
    """Sweep an oval section along the planar polyline P, whose plane has unit normal m. `across`
    and `thick` are the half-axes of the section, in that plane and along m, per point; `phase`
    turns a coarse section, to spend its few vertices where the size of the part shows. The frame
    is the one rigging.tube uses, so the winding comes out the same way."""
    P = np.asarray(P, float)
    across = np.broadcast_to(np.asarray(across, float), (len(P),))
    thick = np.broadcast_to(np.asarray(thick, float), (len(P),))
    T = (np.roll(P, -1, 0) - np.roll(P, 1, 0)) if closed else np.gradient(P, axis=0)
    T /= np.linalg.norm(T, axis=1, keepdims=True)
    ang = np.linspace(0, 2 * np.pi, sides, endpoint=False) + phase
    cos, sin = np.cos(ang)[:, None], np.sin(ang)[:, None]
    rings, normals = [], []
    for p, t, w, h in zip(P, T, across, thick):
        n = np.cross(m, t); n /= np.linalg.norm(n)
        rings.append(p + w * cos * n + h * sin * m)
        nd = (cos / w) * n + (sin / h) * m               # outward normal of an oval, not of a circle
        normals.append(nd / np.linalg.norm(nd, axis=1, keepdims=True))
    F = []
    last = len(P) if closed else len(P) - 1
    for i in range(last):
        j = (i + 1) % len(P)
        for k in range(sides):
            k2 = (k + 1) % sides
            F += [(i * sides + k, i * sides + k2, j * sides + k),
                  (i * sides + k2, j * sides + k2, j * sides + k)]
    return np.concatenate(rings), np.concatenate(normals), np.array(F)


def _cap(ring, out):
    """Close one end of a sweep with a fan, flat shaded, facing `out`."""
    c = ring.mean(0)
    V, F = [c] + list(ring), [(0, k + 1, (k + 1) % len(ring) + 1) for k in range(len(ring))]
    return _finish(V, F, np.broadcast_to(out, (len(F), 3)))


def _capsule(a, b, r, n):
    """n points round a stadium outline in the (p, q) plane: half-circles of radius r about the
    points a and b of the p axis. n is a multiple of four, so both half-circles close properly."""
    ang = np.linspace(-np.pi / 2, 3 * np.pi / 2, n, endpoint=False)
    c = np.where(np.cos(ang) >= -1e-9, b, a)
    return np.stack([c + r * np.cos(ang), r * np.sin(ang)], 1)


def _slotted_plate(at, outer, inner, t0, t1, m):
    """A flat plate with a slot through it. `outer` and `inner` are matched (p, q) outlines and
    at(p, q, t) places a local point; the plate runs from t0 to t1 along the normal m."""
    mid = np.concatenate([outer, inner]).mean(0)
    V, F, want = [], [], []
    def quad(pts, n):
        i = len(V); V.extend(pts); F.extend([(i, i + 1, i + 2), (i, i + 2, i + 3)]); want.extend([n, n])
    for i in range(len(outer)):
        j = (i + 1) % len(outer)
        o0, o1, s0, s1 = outer[i], outer[j], inner[i], inner[j]
        for t, n in ((t1, m), (t0, -m)):
            quad([at(*o0, t), at(*o1, t), at(*s1, t), at(*s0, t)], n)
        for e0, e1, sign in ((o0, o1, 1.0), (s1, s0, -1.0)):     # rim of the plate, wall of the slot
            edge = (e0 + e1) / 2
            n = at(edge[0], edge[1], 0.0) - at(mid[0], mid[1], 0.0)
            quad([at(*e0, t0), at(*e1, t0), at(*e1, t1), at(*e0, t1)], sign * n)
    return _finish(V, F, want)


def _hermite(p0, t0, p1, t1, n):
    """Cubic from p0 to p1, leaving along t0 and arriving along t1 (both unit)."""
    s = np.linalg.norm(p1 - p0)
    u = np.linspace(0, 1, n)[:, None]
    h = np.hstack([2 * u ** 3 - 3 * u ** 2 + 1, u ** 3 - 2 * u ** 2 + u, -2 * u ** 3 + 3 * u ** 2, u ** 3 - u ** 2])
    return h @ np.array([p0, s * np.asarray(t0), p1, s * np.asarray(t1)])


# ---------------------------------------------------------------- de leuvers

def leuver(J, a, m, reach):
    """One stagleuver: jaw, gate and tail. J is the centre of the jaw (on the axis of the stay),
    m the normal of the part's plane (the stay's direction), a the unit vector along the part
    towards the sail, and reach how far from J the tip of the tail lands."""
    b = np.cross(m, a)
    at = lambda p, q, t=0.0: J + p * a + q * b + t * m
    # jaw: an oval section swept round an arc, thinning from the shoulder towards the two lips
    half = np.pi - JAW_MOUTH / 2
    ang = np.linspace(-half, half, 13)
    taper = 1.0 - (1.0 - JAW_TIP) * (np.abs(ang) / half) ** JAW_TAPER
    rc = JAW_BORE + JAW_WALL
    arc = np.array([at(rc * np.cos(k), rc * np.sin(k)) for k in ang])
    jaw = _sweep(arc, m, JAW_WALL * taper, JAW_HALF_T * taper, phase=np.pi / 12)   # half a facet:
    sides = len(jaw[0]) // len(arc)                      # six of them still come out 25.5 by 9.7
    lips = [at(rc * np.cos(k), rc * np.sin(k)) for k in (-half, half)]
    ends = [_cap(jaw[0][:sides], -(arc[1] - arc[0])), _cap(jaw[0][-sides:], arc[-1] - arc[-2])]
    # gate: the thin rod that shuts the mouth. It is a chord well outside the bore, so the stay
    # cannot slip past it
    gate = prism(lips[0], lips[1], GATE_R, 6, True)
    # tail: a flat tongue with a slot, its round root buried in the wall of the jaw
    outer = _capsule(TAIL_ROOT, reach - TAIL_HALF_W, TAIL_HALF_W, 12)
    slot = _capsule(reach - SLOT_END - SLOT_R - SLOT_LEN, reach - SLOT_END - SLOT_R, SLOT_R, 12)
    tail = _slotted_plate(at, outer, slot, -TAIL_HALF_T, TAIL_HALF_T, m)
    return _join([jaw, *ends, gate, tail])


def leuvers(mesh_dir):
    """The ten of them, spread evenly along the luff. Each is set square to the stay, with the
    centre of its jaw on the stay's axis and the tip of its tail on the luff."""
    c, d, _ = stay_axis(mesh_dir)
    u, length, _ = luff()
    meshes = []
    for s in np.linspace(LEUVER_MARGIN, length - LEUVER_MARGIN, N_LEUVERS):
        L = FOK_TACK + s * u
        J = c + ((L - c) @ d) * d                        # foot of the perpendicular from the luff
        reach = np.linalg.norm(L - J)
        meshes.append(leuver(J, (L - J) / reach, d, reach))
    return _join(meshes)


# ---------------------------------------------------------------- de pelikaanhaak

def hook_frame(mesh_dir):
    """Where the hook stands: the frontmost hole of the hanekam, the direction of the stay, the
    athwartships axis of the hook's plane, and the middle of the U."""
    hole, r_hole = hanekam_holes(mesh_dir)[0]
    _, d, _ = stay_axis(mesh_dir)
    e = np.array([0.0, 1.0, 0.0]); e -= (e @ d) * d; e /= np.linalg.norm(e)
    C = hole + (HOLE_BEAR + U_INSIDE / 2 + ROD_R) * d
    return hole, r_hole, d, e, C


def hook_rod(mesh_dir):
    """Centreline of the hook, from the short leg at the eye, round the U and up the long arm."""
    hole, _, d, e, C = hook_frame(mesh_dir)
    R = U_INSIDE / 2 + ROD_R
    eye = stay_eye(mesh_dir)
    E = np.array([eye[0], EYE_Y, eye[2]])                # the eye, over the middle of the thimble
    # the U: half a turn, its lowest point in the hole, the legs 33 mm apart either side of the plate
    psi = np.linspace(np.pi / 2, -np.pi / 2, 13)
    arc = C + R * (-np.cos(psi)[:, None] * d + np.sin(psi)[:, None] * e)
    # short leg: up out of the U and curling back in, as the tip of a hook does, to the eye. It
    # stops on the middle of the pad, so the rod runs into the eye and not through its hole
    start = arc[0]
    aim = (E - start) / np.linalg.norm(E - start)
    leg = _hermite(E - (EYE_BORE + EYE_WALL) * aim, -aim, start, -d, 7)
    # long arm: nearly straight up beside the stay, leaning a little further out as it rises,
    # with a gentle S in it, and plain at the top
    u = np.linspace(0, 1, 19)[:, None]
    lean = ARM_LEAN * u ** 2 * (3 - 2 * u) + ARM_ESS * u ** 2 * (1 - u) * (1 - 2 * u)
    arm = arc[-1] + ARM_LEN * u * d + ARM_SIDE * lean * e
    return np.vstack([leg, arc[1:], arm[1:]]), E


def ring(mesh_dir, rod):
    """The loose ring, slipped over stay and arm two thirds of the way up. It is far wider than
    the pair it holds, so like any such ring it hangs cocked, and only cocked does it bear on
    both: tilt it about the line joining the two until its long inside axis just spans them.
    Seen in the ring's own plane the rods are G / cos(tilt) apart and each is r / cos(tilt) wide,
    which fixes the tilt. Returns the mesh and that angle, in degrees."""
    c, d, r_stay = stay_axis(mesh_dir)
    arm = rod[-19:]
    P = arm[int(round(RING_UP * (len(arm) - 1)))]
    g = (P - c) - ((P - c) @ d) * d                      # from the stay across to the arm
    G = np.linalg.norm(g); g = g / G
    a_in, b_in = RING_INSIDE[0] / 2, RING_INSIDE[1] / 2
    cos = (G + ROD_R + r_stay + 2 * RING_GAP) / (2 * a_in)
    eA = cos * g + np.sqrt(1 - cos ** 2) * d             # long axis: towards the arm and up
    eB = np.cross(d, g)
    O = P - (a_in - (ROD_R + RING_GAP) / cos) * eA       # arm at one end of that axis, stay at the other
    ang = np.linspace(0, 2 * np.pi, 18, endpoint=False)
    oval = O + (a_in + RING_R) * np.cos(ang)[:, None] * eA + (b_in + RING_R) * np.sin(ang)[:, None] * eB
    return _sweep(oval, np.cross(eA, eB), RING_R, RING_R, sides=8, closed=True), float(np.degrees(np.arccos(cos)))


def pelikaanhaak(mesh_dir, with_ring=True):
    """The whole fitting: hook, its eye, the clevis pin through the thimble of the stay, and the
    ring. The ring is a part of its own in the model, because it is slid up the arm to free the hook."""
    rod, E = hook_rod(mesh_dir)
    eye = stay_eye(mesh_dir)
    ang = np.linspace(0, 2 * np.pi, 10, endpoint=False)
    circle = E + (EYE_BORE + EYE_WALL) * (np.cos(ang)[:, None] * np.array([1.0, 0, 0])
                                          + np.sin(ang)[:, None] * np.array([0.0, 0, 1.0]))
    pad = _sweep(circle, np.array([0.0, 1.0, 0.0]), EYE_WALL, EYE_HALF_T, sides=6, closed=True)
    pin = np.array([eye[0], 0.0, eye[2]])                # athwartships through eye and thimble
    return _join([
        tube(rod, ROD_R, 8),
        bead(rod[0], ROD_R, 3, 8),                       # swell where the rod is forged into the eye
        bead(rod[-1], ROD_R, 4, 8),                      # the arm ends plain, with a rounded end
        pad,
        prism(pin + [0, -4.0, 0], pin + [0, EYE_Y + EYE_HALF_T + 2.5, 0], PIN_R, 10, True),
        prism(pin + [0, -6.5, 0], pin + [0, -4.0, 0], PIN_HEAD, 6, False),
        prism(pin + [0, EYE_Y + EYE_HALF_T + 2.5, 0], pin + [0, EYE_Y + EYE_HALF_T + 5.0, 0], PIN_HEAD, 6, False),
    ] + ([ring(mesh_dir, rod)[0]] if with_ring else []))


def build(mesh_dir):
    """[(id, naam, groep, materiaal, (V, N, F))] for the fittings of the fok that have no CAD body."""
    return [("leuvers", "Leuvers", "beslag", "rvs", leuvers(mesh_dir)),
            ("voorstagspanner", "Voorstagspanner met pelikaanhaak", "staand_want", "rvs", pelikaanhaak(mesh_dir, with_ring=False)),
            ("pelikaanhaak_ring", "Ring van de pelikaanhaak", "staand_want", "rvs", ring(mesh_dir, hook_rod(mesh_dir)[0])[0])]


# -- the spriet: a steel tube standing forward over the stem, bolted to the hanekam.
#
#   tube      800 mm long, 50 mm across, closed at both ends; its after end over the after end of
#             the hanekam
#   flanges   two more of the hanekam, holes and all, under and over the after end of the tube. The
#             lower one lies against the starboard face of the hanekam and is bolted to it through
#             the after and the forward hole; the upper one stands on the tube and takes what the
#             hanekam takes otherwise: the voorstagspanner and the harpje of the kettinkje of the fok
#   bouten    the two bolts, a part of their own (they go in last)
#   hook      a leioog (body 5943) on top of the forward end
#
# Both flanges stand over the middle of the tube, so the upper one is the hanekam moved by
# spriet_lift(): that is how far everything made fast to the hanekam goes along with it.

SPRIET_LENGTH, SPRIET_R = 800.0, 25.0
SPRIET_WELD = 3.0            # the upper flange is let this far into the top of the tube
SPRIET_HOOK_IN = 40.0        # middle of the feet of the hook, from the forward end


def _hanekam(mesh_dir):
    V, N, F, _ = cad.load(HANEKAM, mesh_dir)
    return V, N, F


def spriet_frame(mesh_dir):
    """After end of the tube's axis, and the shift that takes the hanekam onto the upper flange."""
    V, _, _ = _hanekam(mesh_dir)
    thick = V[:, 1].max() - V[:, 1].min()
    y = V[:, 1].min() - thick / 2                        # over the middle of the lower flange
    axis = np.array([V[:, 0].min(), y, V[:, 2].max() + SPRIET_R])
    lift = np.array([0.0, y, axis[2] + SPRIET_R - SPRIET_WELD - V[:, 2].min()])
    return axis, lift, thick


def spriet_lift(mesh_dir):
    return spriet_frame(mesh_dir)[1]


def spriet_hook(mesh_dir, at):
    """The leioog stood on the top of the tube, its C in the plane of the tube's axis. As in
    borgketting.haak(), the third axis keeps the basis handed like the leioog's own."""
    V, N, F, G, local, o = borgketting._leioog_local(mesh_dir)
    target = np.array([[1.0, 0.0, 0.0], [0.0, 0.0, -1.0], [0.0, 1.0, 0.0]])   # along, into the tube, across
    if np.linalg.det(target) * np.linalg.det(local) < 0:
        target = target * np.array([1.0, 1.0, -1.0])[:, None]
    return at + ((V - o) @ local.T) @ target, (N @ local.T) @ target, F


def _spriet_hook_at(axis):
    return axis + [SPRIET_LENGTH - SPRIET_HOOK_IN, 0.0, SPRIET_R]


def spriet_eye(mesh_dir):
    """Middle of the eye of the hook on the end of the spriet."""
    V = spriet_hook(mesh_dir, _spriet_hook_at(spriet_frame(mesh_dir)[0]))[0]
    return (V.min(0) + V.max(0)) / 2


def spriet(mesh_dir):
    V, N, F = _hanekam(mesh_dir)
    axis, up, thick = spriet_frame(mesh_dir)
    return _join([
        prism(axis, axis + [SPRIET_LENGTH, 0.0, 0.0], SPRIET_R, 40, True),
        (V + [0.0, -thick, 0.0], N, F),                  # lower flange, against the hanekam
        (V + up, N, F),                                  # upper flange
        spriet_hook(mesh_dir, _spriet_hook_at(axis)),
    ])


def spriet_bouten(mesh_dir):
    """The two bolts through hanekam and lower flange, their heads to port."""
    V, _, _ = _hanekam(mesh_dir)
    thick = V[:, 1].max() - V[:, 1].min()
    holes = hanekam_holes(mesh_dir)                      # frontmost first
    return _join([bolt(c[0], c[2], V[:, 1].max(), V[:, 1].min() - thick, radius=r - 0.4) for c, r in (holes[0], holes[-1])])


def build_spriet(mesh_dir):
    return [("boegspriet", "Boegspriet", "beslag", "verzinkt", spriet(mesh_dir)),
            ("boegspriet_bouten", "Bouten boegspriet", "beslag", "verzinkt", spriet_bouten(mesh_dir))]
