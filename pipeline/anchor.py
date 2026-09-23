"""Ankergerei, of which the CAD has nothing: anker, ankerketting, ankerlijn and the ankeroog the
line is made fast to. CAD millimetres (x forward, y to port, z up), like pipeline/hardware.py.

The boat carries the anchor Scouting Nederland sells for it (scoutingvlet.nl/product/anker):
a galvanised Danforth of about 7.5 kg (10 kg with its chain) on a metre of 6 mm chain. No
dimensions are published, so the plate is stepped off two photographs of one standing on a doft,
scaled on the 200 mm width of that doft; the steel so drawn comes to 7.6 kg at 7850 kg/m3.

    build(mesh_dir)            the four parts
    reference_points(mesh_dir) eye of the ankeroog and centre of the shackle, for the viewer
"""
import numpy as np

from hardware import _finish, _join, _load, bead, lug, pipe, prism
from rigging import thin, tube

# -- where it is stowed. Starboard side: a bakskist goes against the same bulkhead to port, so
# nothing of the anchor gear may reach past y = +60 there.
VOORSCHOT_BODY = "PartSolids-Frame_59E9"
VOORDEK_BODY = "PartSolids-Long_Shell_59D4"
VLAK_BODY = "PartSolids-Long_Shell_583F"                 # starboard half; the two meet at y = 0
FLOOR_BODIES = ("BuikdenningSolids_5620", "BuikdenningSolids_5623", "BuikdenningSolids_5626")
ANCHOR_Y = -310.0           # centre of the crown: as far outboard as the floor boards reach


def _surface_z(V, F, P):
    """Top of a mesh over each (x, y) of P: the highest triangle whose plan view covers the
    point, NaN where the mesh does not reach that far."""
    P = np.atleast_2d(np.asarray(P, float))
    a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    det = (b[:, 1] - c[:, 1]) * (a[:, 0] - c[:, 0]) + (c[:, 0] - b[:, 0]) * (a[:, 1] - c[:, 1])
    det = np.where(np.abs(det) > 1e-9, det, np.nan)
    dx, dy = P[:, None, 0] - c[None, :, 0], P[:, None, 1] - c[None, :, 1]
    l1 = ((b[:, 1] - c[:, 1]) * dx + (c[:, 0] - b[:, 0]) * dy) / det
    l2 = ((c[:, 1] - a[:, 1]) * dx + (a[:, 0] - c[:, 0]) * dy) / det
    hit = (l1 >= -1e-6) & (l2 >= -1e-6) & (l1 + l2 <= 1 + 1e-6)
    z = l1 * a[:, 2] + l2 * b[:, 2] + (1 - l1 - l2) * c[:, 2]
    return np.where(hit.any(1), np.max(np.where(hit, z, -np.inf), axis=1), np.nan)


def _bodies(mesh_dir, names):
    V, F, n = [], [], 0
    for name in names:
        v, f = _load(mesh_dir, name)
        V.append(v); F.append(f + n); n += len(v)
    return np.concatenate(V), np.concatenate(F)


def _floor(mesh_dir):
    """Top of the buikdenning in the forward bay. The boards lie flat athwartships and run
    downhill going forward, so one plane z = a + b*x covers the whole stretch (and it steps over
    the 20 mm gaps between the boards, which a direct lookup would fall into)."""
    V, F = _bodies(mesh_dir, FLOOR_BODIES)
    x = np.linspace(4250.0, 4740.0, 6)
    b, a = np.polyfit(x, _surface_z(V, F, np.c_[x, np.full(len(x), -300.0)]), 1)
    return lambda xx: a + b * np.asarray(xx, float)


def _slab(poly, thickness):
    """Flat plate cut from a convex polygon, `thickness` thick about the polygon's own plane."""
    poly = np.asarray(poly, float)
    n = np.cross(poly[1] - poly[0], poly[2] - poly[0]); n /= np.linalg.norm(n)
    V, F, want = [], [], []
    for s in (-1.0, 1.0):
        i = len(V); V.extend(poly + s * thickness / 2 * n)
        F.extend([(i, i + k, i + k + 1) for k in range(1, len(poly) - 1)])
        want.extend([s * n] * (len(poly) - 2))
    for k in range(len(poly)):
        p, q = poly[k], poly[(k + 1) % len(poly)]
        side = np.cross(q - p, n)
        i = len(V); V.extend([p - thickness / 2 * n, q - thickness / 2 * n,
                              q + thickness / 2 * n, p + thickness / 2 * n])
        F.extend([(i, i + 1, i + 2), (i, i + 2, i + 3)]); want.extend([side, side])
    return _finish(V, F, want)


# -- the anchor itself, in its own frame: a along the crown, b up the flukes, c out of their
# plane (the way the tripping plates are bent). Sizes stepped off the photographs.
LEAN = 12.0                 # degrees the fluke plane leans forward, stowed against the voorschot
# The shank turns on the crown tube, up to some 32 degrees out of the fluke plane either way.
# Lying in that plane it would run through the voorschot, being both longer than the flukes and
# thicker than their plate, so it is drawn swung back far enough to stand plumb.
SHANK_SWING = LEAN
FLUKE = ((47.0, -25.0), (182.0, -25.0), (205.0, 285.0), (140.0, 285.0))   # (a, b), leaning outboard
FLUKE_T = 6.0
TRIP_A, TRIP_L, TRIP_ANGLE = (42.0, 192.0), 110.0, 35.0  # width, length and bend of a tripping plate
CROWN_R, CROWN_BORE, CROWN_L = 22.5, 8.0, 90.0           # the tube the shank pivots on
ROD_R, ANCHOR_W = 8.0, 410.0                             # the rod through it joins the two sides
SHANK_L, SHANK_W, SHANK_T, SHANK_HOLE = 430.0, 35.0, 10.0, 6.0   # length up to the hole in its end
SHACKLE_PIN_R, SHACKLE_R, SHACKLE_LEG, SHACKLE_BAR = 5.5, 22.0, 14.0, 5.0


def _frame(lean):
    """Unit vectors of the anchor's own axes, leaning `lean` degrees forward."""
    t = np.radians(lean)
    A = np.array([0.0, -1.0, 0.0])                       # crown axis, towards starboard
    B = np.array([np.sin(t), 0.0, np.cos(t)])            # up the flukes
    return A, B, np.cross(A, B)                          # C: out of the fluke plane, aft and up


def _anchor_local():
    """Meshes of the anchor with the centre of its crown at the origin, and the points the chain
    hangs on: the hole in the top of the shank and the crown of the shackle."""
    A, B, C = _frame(LEAN)
    P = lambda a, b, c=0.0: a * A + b * B + c * C
    S = np.cos(np.radians(SHANK_SWING)) * B + np.sin(np.radians(SHANK_SWING)) * C
    hole = SHANK_L * S                                   # the shackle stands in the top of the shank
    d = np.array([0.0, -np.cos(np.radians(TRIP_ANGLE)), np.sin(np.radians(TRIP_ANGLE))])
    meshes = []
    for s in (1.0, -1.0):
        meshes.append(_slab([P(s * a, b) for a, b in FLUKE], FLUKE_T))
        foot = [P(s * TRIP_A[0], FLUKE[0][1]), P(s * TRIP_A[1], FLUKE[0][1])]
        tip = [p + TRIP_L * P(*d) for p in foot]         # the same plate, bent out of the fluke plane
        meshes.append(_slab([foot[0], foot[1], tip[1], tip[0]], FLUKE_T))
    meshes += [pipe(P(-CROWN_L / 2, 0), P(CROWN_L / 2, 0), CROWN_R, CROWN_BORE),
               prism(P(-ANCHOR_W / 2, 0), P(ANCHOR_W / 2, 0), ROD_R, 20, True),
               lug(hole, -S, A, -SHANK_T / 2, SHANK_T / 2, SHANK_W / 2, SHANK_HOLE, SHANK_L),
               prism(hole - 30 * A, hole + 30 * A, SHACKLE_PIN_R, 16, True)]
    ang = np.linspace(np.pi, 0.0, 13)                    # bow of the D-shackle, over the pin
    bow = np.vstack([hole - SHACKLE_R * A, hole - SHACKLE_R * A + SHACKLE_LEG * S,
                     hole + np.outer(SHACKLE_R * np.cos(ang[1:-1]), A)
                          + np.outer(SHACKLE_LEG + SHACKLE_R * np.sin(ang[1:-1]), S),
                     hole + SHACKLE_R * A + SHACKLE_LEG * S, hole + SHACKLE_R * A])
    meshes.append(tube(bow, SHACKLE_BAR, 8))
    return meshes, hole, hole + (SHACKLE_LEG + SHACKLE_R) * S


def _anchor(mesh_dir):
    """The anchor as it stands: the fluke tops bear on the aft face of the voorschot and the
    lower edges of the tripping plates stand on the floor boards."""
    meshes, hole, top = _anchor_local()
    V = np.concatenate([v for v, _, _ in meshes])
    dx = _load(mesh_dir, VOORSCHOT_BODY)[0][:, 0].min() - V[:, 0].max()
    low = V[V[:, 2].argmin()]                            # the edge of a tripping plate
    off = np.array([dx, ANCHOR_Y, float(_floor(mesh_dir)(low[0] + dx)) - low[2]])
    return [(v + off, n, f) for v, n, f in meshes], hole + off, top + off


# -- ankerketting: 1 m of 6 mm short-link chain, DIN 766 (pitch 18.5, wire 6, outside width 20).
# It hangs from the shackle down along the anchor and lies in a loose S on the floor beside it.
CHAIN_LEN, CHAIN_PITCH, CHAIN_WIRE, CHAIN_WIDTH = 1000.0, 18.5, 6.0, 20.0
CHAIN_SIDES = 5             # a link is a small stadium-shaped ring; keep the whole chain cheap (as the borgkettinkje)
CHAIN_KNOTS = np.array([    # after the shackle; the last stretch lies on the floor (z is set there)
    [4702.0, -332.0, 690.0], [4700.0, -372.0, 600.0], [4688.0, -410.0, 480.0],
    [4668.0, -438.0, 360.0], [4645.0, -460.0, 250.0], [4622.0, -474.0, 178.0],
    [4590.0, -474.0, 0.0], [4548.0, -452.0, 0.0], [4506.0, -474.0, 0.0],
    [4462.0, -506.0, 0.0], [4412.0, -508.0, 0.0], [4366.0, -486.0, 0.0],
    [4322.0, -500.0, 0.0], [4278.0, -526.0, 0.0], [4234.0, -524.0, 0.0],
    [4196.0, -506.0, 0.0]])


def _spline(knots, n, passes=6):
    t = np.linspace(0, 1, len(knots)); tt = np.linspace(0, 1, n)
    P = np.c_[[np.interp(tt, t, knots[:, k]) for k in range(3)]].T
    for _ in range(passes):                              # soften the corners
        P[1:-1] = (P[:-2] + 2 * P[1:-1] + P[2:]) / 4
    return P


def _arclength(P, step):
    """Resample a polyline at a fixed step along its own length."""
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
    t = np.arange(0.0, s[-1] + 1e-9, step)
    return np.c_[[np.interp(t, s, P[:, k]) for k in range(3)]].T


def _chain_path(mesh_dir):
    """Centre line of the chain, exactly CHAIN_LEN long, from the crown of the shackle. Where it
    lies on the floor the centre line is half a link's width up, so the links on edge touch it."""
    floor = _floor(mesh_dir)
    knots = np.vstack([_anchor(mesh_dir)[2], CHAIN_KNOTS])
    flat = knots[:, 2] == 0.0
    knots[flat, 2] = floor(knots[flat, 0]) + CHAIN_WIDTH / 2
    P = _arclength(_spline(knots, 300), 2.0)
    return P[:int(CHAIN_LEN / 2.0) + 1]


def _link(centre, t, u):
    """One short link: a stadium-shaped ring round the plane spanned by t (its long axis) and u."""
    r, straight = (CHAIN_WIDTH - CHAIN_WIRE) / 2, CHAIN_PITCH - (CHAIN_WIDTH - CHAIN_WIRE)
    arc = np.linspace(-np.pi / 2, np.pi / 2, 6)
    path = np.vstack([np.c_[straight / 2 + r * np.cos(arc), r * np.sin(arc)],       # one round end
                      np.c_[-straight / 2 - r * np.cos(arc), -r * np.sin(arc)]])    # and the other
    n = np.cross(t, u)
    pts = centre + np.outer(path[:, 0], t) + np.outer(path[:, 1], u)
    tan = np.roll(pts, -1, axis=0) - np.roll(pts, 1, axis=0)
    tan /= np.linalg.norm(tan, axis=1, keepdims=True)
    e1 = np.cross(n, tan)                                # in the plane of the ring, outwards
    ang = np.linspace(0, 2 * np.pi, CHAIN_SIDES, endpoint=False)
    dirs = (np.cos(ang)[None, :, None] * e1[:, None, :] + np.sin(ang)[None, :, None] * n)
    V = (pts[:, None, :] + CHAIN_WIRE / 2 * dirs).reshape(-1, 3)
    m, F = len(pts), []
    for i in range(m):
        j = (i + 1) % m
        for k in range(CHAIN_SIDES):
            k2 = (k + 1) % CHAIN_SIDES
            F += [(i * CHAIN_SIDES + k, i * CHAIN_SIDES + k2, j * CHAIN_SIDES + k),
                  (i * CHAIN_SIDES + k2, j * CHAIN_SIDES + k2, j * CHAIN_SIDES + k)]
    return V, dirs.reshape(-1, 3), np.array(F)


def ketting(mesh_dir):
    """The links, every other one turned a quarter round, threaded along the chain's centre line."""
    P = _chain_path(mesh_dir)
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
    meshes = []
    for k in range(int(CHAIN_LEN // CHAIN_PITCH)):
        c = np.array([np.interp((k + 0.5) * CHAIN_PITCH, s, P[:, j]) for j in range(3)])
        t = np.array([np.interp((k + 0.6) * CHAIN_PITCH, s, P[:, j]) for j in range(3)]) - c
        t /= np.linalg.norm(t)
        u = np.array([0.0, 0.0, 1.0]) - t[2] * t          # links on edge stand up, the rest lie flat
        u = u / np.linalg.norm(u) if np.linalg.norm(u) > 1e-6 else np.array([1.0, 0.0, 0.0])
        meshes.append(_link(c, t, u if k % 2 == 0 else np.cross(t, u)))
    return _join(meshes)


# -- ankeroog: the same fitting as the two landvastogen on the inside of the spiegel (Vademecum
# p. 35, bodies 589B/589F): a length of 9 mm round bar bent into a flat omega and welded on by its
# two feet. Measured off 589B: 96 mm long overall, flat feet over the outer 16 mm at either end,
# the arch standing 25.6 mm off the plating. It goes on the centreline in the bow, in the V where
# the two vlak plates meet at the stem, halfway down from the voorplecht to the level of the
# voordek, with its eye standing aft.
OOG_BAR_R, OOG_HALF, OOG_Z = 4.55, 48.0, 782.0
OOG_FOOT = 5.5              # the feet sit in the V of the stem, not on flat plating, so a little clear
OOG_PROFILE = np.array([    # half the omega: distance along the plating, rise of the centre line
    [0.0, 25.6], [4.0, 25.2], [8.0, 23.2], [12.0, 18.7], [16.0, 13.3],
    [20.0, 8.9], [24.0, 3.9], [28.0, 1.0], [32.0, 0.1], [OOG_HALF, 0.0]])


def _stem(mesh_dir):
    """The stem, as the line where the two vlak plates meet: an arc-length parameterised polyline
    at y = 0 with, at every point, the normal pointing aft into the boat."""
    V = _load(mesh_dir, VLAK_BODY)[0]
    P = np.unique(V[(np.abs(V[:, 1]) < 0.01) & (V[:, 0] > 6100.0)].round(3), axis=0)
    P = _spline(P[np.argsort(P[:, 2])], 400, passes=0)
    s = np.r_[0.0, np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))]
    t = np.gradient(P, axis=0); t /= np.linalg.norm(t, axis=1, keepdims=True)
    return s, P, np.c_[-t[:, 2], np.zeros(len(t)), t[:, 0]]


def _along_stem(mesh_dir, a, out):
    """Points a mm along the stem from the crown of the eye (positive towards the voorplecht),
    `out` mm aft of the plating. Following the stem itself keeps the feet of the eye and the run
    of the line on the steel rather than on the chord between two mesh vertices."""
    s, P, N = _stem(mesh_dir)
    s0 = float(np.interp(OOG_Z, P[:, 2], s))
    at = lambda col: np.c_[[np.interp(s0 + a, s, col[:, k]) for k in range(3)]].T
    return at(P) + np.asarray(out, float)[:, None] * at(N)


def _oog_path(mesh_dir):
    """Centre line of the ankeroog: the measured omega, laid along the stem from its crown."""
    prof = np.vstack([OOG_PROFILE[::-1] * (-1.0, 1.0), OOG_PROFILE[1:]])
    a = np.linspace(prof[0, 0], prof[-1, 0], 61)
    return _along_stem(mesh_dir, a, OOG_FOOT + np.interp(np.abs(a), prof[:, 0], prof[:, 1]))


def ankeroog(mesh_dir):
    return tube(_oog_path(mesh_dir), OOG_BAR_R, 10)


# -- ankerlijn: 12 mm three-strand, made fast to the last link of the chain, coiled flat on the
# floor beside it and led forward over the voordek to the ankeroog in the bow.
LINE_R, LINE_SIDES, LINE_LIFT = 6.0, 8, 1.5              # how far the rope clears what it lies on
COIL_C, COIL_R, COIL_TURNS, COIL_RISE = (4370.0, -270.0), (175.0, 120.0), 4, 14.0
DECK_X = (4830.0, 6050.0)                                # stretch the line lies on the voordek
OOG_TURNS = (13.0, 11.05)                                # half the pitch of the two round turns, their radius


def _coil(mesh_dir, start):
    """A tidy flat coil next to the anchor, spiralling in from the point the chain ends at."""
    floor = _floor(mesh_dir)
    c = np.array(COIL_C)
    a0 = np.arctan2(start[1] - c[1], start[0] - c[0])
    a = a0 + np.linspace(0.0, 2 * np.pi * COIL_TURNS, 36 * COIL_TURNS + 1)
    r = np.linspace(*COIL_R, len(a))
    P = np.c_[c[0] + r * np.cos(a), c[1] + r * np.sin(a), np.zeros(len(a))]
    P[:, 2] = floor(P[:, 0]) + LINE_R + LINE_LIFT + COIL_RISE * np.linspace(0, 1, len(a))
    return P


def _deck_run(mesh_dir):
    """The stretch over the voordek: it lies on the deck, so the deck is sampled along the way.
    A gentle bow to starboard keeps it off the centreline and gives it a little slack."""
    V, F = _load(mesh_dir, VOORDEK_BODY)
    t = np.linspace(0.0, 1.0, 44)
    x = DECK_X[0] + t * (DECK_X[1] - DECK_X[0])
    y = -(55.0 * (1 - t) + 10.0 * t) - 30.0 * np.sin(np.pi * t)
    return np.c_[x, y, _surface_z(V, F, np.c_[x, y]) + LINE_R + LINE_LIFT]


def _oog_turns(mesh_dir):
    """Two round turns round the crown of the eye, rove through it from below."""
    phi = np.linspace(0.0, 4 * np.pi, 49)
    a = np.linspace(-OOG_TURNS[0], OOG_TURNS[0], len(phi))
    out = (OOG_FOOT + np.interp(np.abs(a), OOG_PROFILE[:, 0], OOG_PROFILE[:, 1])
           + OOG_TURNS[1] * np.cos(phi))
    return _along_stem(mesh_dir, a, out) + np.c_[0 * phi, OOG_TURNS[1] * np.sin(phi), 0 * phi]


def _line_path(mesh_dir):
    """Knot on the chain, coil and the standing part on to the ankeroog, as one polyline."""
    end = _chain_path(mesh_dir)[-1]
    coil = _coil(mesh_dir, end)
    lead = _spline(np.vstack([end, (end + coil[0]) / 2 + (0, 0, 8.0), coil[0]]), 8)
    deck = _deck_run(mesh_dir)
    # up over the top edge of the voorschot - the CAD draws it with a 3 mm flange at z = 630.4 ..
    # 633.4 that stands proud of the deck - passing inboard of the anchor, then down onto the deck
    over = _spline(np.vstack([coil[-1], [4520.0, -300.0, 230.0], [4620.0, -200.0, 350.0],
                              [4700.0, -110.0, 500.0], [4748.0, -60.0, 615.0], [4752.0, -57.0, 645.0],
                              [4790.0, -56.0, 645.0], deck[0]]), 40)
    turns = _oog_turns(mesh_dir)
    up = _along_stem(mesh_dir, np.linspace(-170.0, -46.0, 8), np.full(8, LINE_R + 8.0))
    stem = _spline(np.vstack([deck[-1], up[up[:, 0] > deck[-1, 0] + 30.0], turns[0]]), 24, passes=2)
    tail = turns[-1] + np.array([[-20.0, 5.0, -20.0], [-40.0, 7.0, -46.0]])
    return np.vstack([lead, coil, over, deck, stem[1:], turns, tail]), end


def ankerlijn(mesh_dir):
    """Knot on the last link, the coil, the standing part, and a stopper knot behind the eye."""
    P, end = _line_path(mesh_dir)
    floor = _floor(mesh_dir)
    bitter = end + (-78.0, -30.0, 0.0); bitter[2] = floor(bitter[0]) + LINE_R + LINE_LIFT
    tail = _spline(np.vstack([end, end + (-40.0, -18.0, -2.0), bitter]), 8)
    return _join([tube(thin(P), LINE_R, LINE_SIDES), tube(thin(tail), LINE_R, LINE_SIDES),
                  bead(end, 9.0), bead(P[-1], 9.0)])


def reference_points(mesh_dir):
    """Eye of the ankeroog and centre of the shackle on the shank, in CAD mm."""
    path = _oog_path(mesh_dir)
    return dict(oog=path[len(path) // 2], schakel=_anchor(mesh_dir)[1])


def build(mesh_dir):
    """[(id, naam, groep, materiaal, (V, N, F))] for the anchor gear."""
    return [
        ("anker", "Anker", "beslag", "verzinkt", _join(_anchor(mesh_dir)[0])),
        ("ankerketting", "Ankerketting", "beslag", "verzinkt", ketting(mesh_dir)),
        ("ankeroog", "Ankeroog", "beslag", "verzinkt", ankeroog(mesh_dir)),
        ("ankerlijn", "Ankerlijn", "lopend_want", "touw", ankerlijn(mesh_dir)),
    ]
