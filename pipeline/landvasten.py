"""Landvasten: the two mooring lines, each coiled down on its deck and made fast to its eye.

The CAD has no landvasten. Both are 12 mm three-strand line, some 6 m of it, coiled down flat on
the deck the way a hand-coiled line is laid: turns of one size dropped one beside the other with a
little wander in the radius, so a turn ends up lying over its neighbour as often as beside it.

The achterlandvast is made fast to the port landvastoog on the inside of the spiegel (CAD body
589B), a bent-rod omega whose middle bend stands 32 mm clear of the plate; the line takes two
round turns through that gap. The voorlandvast leaves the voordek over the port dolboord by the
stem, hangs down the outside of the bow over the berghout and is made fast to the sleepoog on the
stem, which `pipeline/sleepogen.py` builds from the same body.

Nothing here is guessed at: the deck is sampled under every turn of a coil, the dolboord where the
line is laid over it, the plating it climbs and hangs against, and the middle bend of each eye.
CAD millimetres throughout (x forward, y to port, z up).

  build()  returns the two parts; neither has a CAD body
"""
import json
from pathlib import Path

import numpy as np

import sleepogen
from hardware import _join, _round_section, _section, bead
from rigging import tube

ROOT = Path(__file__).resolve().parent.parent

ROPE_R, SIDES = 6.0, 8               # 12 mm line, drawn round and coarse: there is a lot of it
DECK_GAP = 1.0                       # the line lies on the deck, not in it
HULL_GAP = 5.0                       # outside the bow it hangs against the plating
STEM_GAP = 2.5                       # the stem is a rounded edge, not the flat plate the spiegel is
KNOT_R = 10.0                        # stopper knot behind the eye

ACHTERDEK, VOORDEK = "5873", "59D4"
LANDVASTOOG_BB = "589B"
DOLBOORD_BB = "5A3B"
BOW_PLATING = ("583C", "5A0B", "5827", "5A11")     # vlak, kim, boeisel, berghout, port side
CLIMB_PLATING = ("5A0B", "5827")                   # what the voorlandvast climbs on its way out
BOW_X = 5700.0                       # only the bow end of those bodies is ever near the line
INBOARD = np.array([5900.0, 0.0, 790.0])           # a point inside the boat there: which way is out


def _load(mesh_dir, handle):
    report = json.loads((ROOT / "build" / "tessellation_report.json").read_text())
    name = next(r["name"] for r in report if r["handle"] == handle)
    d = np.load(mesh_dir / f"{name}.npz")
    return d["V"].astype(float), d["N"].astype(float), d["F"].astype(int)


# ---- surfaces the line lies on

def _deck_z(V, N, F, P):
    """Top of a deck under each (x, y). Both decks are cambered and slope down towards the kuip,
    so every turn of a coil is put down on its own patch of plate rather than on a level."""
    T = V[F[N[F].mean(axis=1)[:, 2] > 0.5]]           # the upper skin of the plate
    a, b, c = T[:, 0], T[:, 1], T[:, 2]
    det = (b[:, 1] - c[:, 1]) * (a[:, 0] - c[:, 0]) + (c[:, 0] - b[:, 0]) * (a[:, 1] - c[:, 1])
    px, py = np.asarray(P)[:, :1], np.asarray(P)[:, 1:2]
    u = ((b[:, 1] - c[:, 1]) * (px - c[:, 0]) + (c[:, 0] - b[:, 0]) * (py - c[:, 1])) / det
    v = ((c[:, 1] - a[:, 1]) * (px - c[:, 0]) + (a[:, 0] - c[:, 0]) * (py - c[:, 1])) / det
    w = 1.0 - u - v
    on = (u >= -1e-9) & (v >= -1e-9) & (w >= -1e-9)
    return np.where(on, u * a[:, 2] + v * b[:, 2] + w * c[:, 2], -np.inf).max(axis=1)


def _skin(mesh_dir, handles, outward):
    """Triangles of the hull plating whose face looks out of the boat (or into it), with their
    normals. Only the bow end is kept: that is the only place a landvast touches the plating."""
    T, n = [], []
    for handle in handles:
        V, N, F = _load(mesh_dir, handle)
        fn = N[F].mean(axis=1)
        fn /= np.linalg.norm(fn, axis=1, keepdims=True)
        c = V[F].mean(axis=1)
        keep = (c[:, 0] > BOW_X) & ((((c - INBOARD) * fn).sum(1) > 0) == outward)
        T.append(V[F[keep]]); n.append(fn[keep])
    return np.concatenate(T), np.concatenate(n)


def _closest(p, T):
    """Closest point of every triangle of T to p (Ericson's region test, vectorised over T)."""
    a, b, c = T[:, 0], T[:, 1], T[:, 2]
    ab, ac = b - a, c - a
    d1, d2 = (ab * (p - a)).sum(1), (ac * (p - a)).sum(1)
    d3, d4 = (ab * (p - b)).sum(1), (ac * (p - b)).sum(1)
    d5, d6 = (ab * (p - c)).sum(1), (ac * (p - c)).sum(1)
    va, vb, vc = d3 * d6 - d5 * d4, d5 * d2 - d1 * d6, d1 * d4 - d3 * d2
    out = np.empty_like(a)
    corner = [((d1 <= 0) & (d2 <= 0), a), ((d3 >= 0) & (d4 <= d3), b), ((d6 >= 0) & (d5 <= d6), c)]
    edge = [((vc <= 0) & (d1 >= 0) & (d3 <= 0), a, ab, d1, d1 - d3),
            ((vb <= 0) & (d2 >= 0) & (d6 <= 0), a, ac, d2, d2 - d6),
            ((va <= 0) & (d4 >= d3) & (d5 >= d6), b, c - b, d4 - d3, (d4 - d3) + (d5 - d6))]
    done = np.zeros(len(T), bool)
    for hit, q in corner:
        hit &= ~done; out[hit] = q[hit]; done |= hit
    for hit, q, d, num, den in edge:
        hit &= ~done
        if hit.any():
            out[hit] = q[hit] + (num[hit] / np.where(den[hit] == 0, 1e-12, den[hit]))[:, None] * d[hit]
        done |= hit
    if (~done).any():
        k = ~done
        s = np.where(np.abs(va + vb + vc) < 1e-20, 1e-20, va + vb + vc)
        out[k] = a[k] + (vb[k] / s[k])[:, None] * ab[k] + (vc[k] / s[k])[:, None] * ac[k]
    return out


def _lay(P, skin, gap, rounds=8):
    """Pull a polyline taut against a surface: smooth it, then put every point that is free to
    move at `gap` from the nearest triangle it is properly in front of, on the side that triangle
    faces. The ends stay put. Triangles the point only sees edge-on are passed over: the plating
    is 4 mm thick, so the strip along the cut edge of a plate is a sliver standing square to both
    faces, and a line laid `gap` from that sliver would end up inside the plate. It is then lifted
    off anything that stands proud of that face - the berghout the line passes over."""
    T, n = skin
    P = np.array(P, float)
    for _ in range(rounds):
        P[1:-1] = 0.25 * P[:-2] + 0.5 * P[1:-1] + 0.25 * P[2:]
        P = _resample(P, _length(P) / (len(P) - 1))     # taut stretches run away with the spacing
        for i in range(1, len(P) - 1):
            v = P[i] - _closest(P[i], T)
            d = np.linalg.norm(v, axis=1)
            front = (v * n).sum(1) > 0.35 * d
            k = int(np.argmin(np.where(front, d, np.inf) if front.any() else d))
            P[i] = P[i] - v[k] + gap * n[k]
            for _ in range(4):
                v = P[i] - _closest(P[i], T)
                slack = (v * n).sum(1) - gap
                j = int(np.argmin(np.where(np.linalg.norm(v, axis=1) < gap, slack, np.inf)))
                if slack[j] >= -1e-6:
                    break
                P[i] = P[i] - slack[j] * n[j]
    return P


def _resample(P, step):
    """Even spacing along a polyline, so the tube is drawn with the triangles it needs and no more."""
    s = np.concatenate([[0.0], np.cumsum(np.linalg.norm(np.diff(P, axis=0), axis=1))])
    t = np.linspace(0.0, s[-1], max(int(round(s[-1] / step)), 2) + 1)
    return np.column_stack([np.interp(t, s, P[:, k]) for k in range(3)])


def _length(P):
    return float(np.linalg.norm(np.diff(P, axis=0), axis=1).sum())


# ---- the coil on deck

def coil(centre, deck, turns, r0, step=13.0, seed=7):
    """A line coiled down flat on the deck. The turns are all of one size, laid outwards one
    beside the other (`step` is a rope diameter), with a slow wander in the radius on top, so
    where two turns come closer than that the later one ends up lying over the earlier one. Every
    sample is dropped on the deck first and then lifted onto whatever is already under it, which
    is what makes the coil sit on the deck instead of floating in a mathematical plane.

    The spiral is wound clockwise from its inner end and finishes at angle pi, i.e. at the aft
    side of the coil with the standing part leading off to port; the caller turns it from there.
    """
    rng = np.random.default_rng(seed)
    th = np.linspace(np.pi, np.pi - 2 * np.pi * turns, int(round(77 * turns)))
    k = (np.pi - th) / (2 * np.pi)                    # turns laid so far
    wander = sum(amp * np.sin(2 * np.pi * f * k + rng.uniform(0, 2 * np.pi)) for amp, f in
                 ((3.2, 0.7), (2.1, 1.6), (1.1, 2.9)))
    r = r0 + step * k + wander
    P = np.column_stack([centre[0] + r * np.cos(th), centre[1] + r * np.sin(th)])
    z = deck(P) + ROPE_R + DECK_GAP
    for i in range(3, len(P)):
        d = np.linalg.norm(P[:i - 2] - P[i], axis=1)
        over = d < 2 * ROPE_R                         # this bit of line comes down on an earlier turn
        if over.any():
            z[i] = max(z[i], (z[:i - 2][over] + np.sqrt((2 * ROPE_R) ** 2 - d[over] ** 2)).max())
    return np.column_stack([P, z])


def _run(deck, waypoints, n=6):
    """A stretch of line lying on the deck through the given (x, y) marks."""
    W = np.asarray(waypoints, float)
    t = np.arange(len(W), dtype=float)
    tt = np.linspace(0.0, len(W) - 1.0, (len(W) - 1) * n + 1)
    P = np.column_stack([np.interp(tt, t, W[:, k]) for k in (0, 1)])
    for _ in range(3):                                # the line falls in a curve, not a dog-leg
        P[1:-1] = 0.25 * P[:-2] + 0.5 * P[1:-1] + 0.25 * P[2:]
    return np.column_stack([P, deck(P) + ROPE_R + DECK_GAP])


# ---- made fast: round turns through an eye

def _oog(mesh_dir):
    """The port landvastoog, in the frame it was drawn in and the frame bow_eye() stands it up in:
    the origin under the middle of the eye on the face of the plate, the axis along the eye, the
    one out of the plate and the one across both, then the middle bend of the omega - how far its
    axis stands off the plate, the radius of the rod and where the axis sits across the eye. The
    sleepoog on the stem is this same body, so both eyes are made fast to with the same numbers."""
    n, _, inside = sleepogen.spiegel_plane(mesh_dir)
    V = _load(mesh_dir, LANDVASTOOG_BB)[0]
    a = np.array([0.0, 1.0, 0.0]); a -= (a @ n) * n; a /= np.linalg.norm(a)
    w = np.cross(a, n)
    o = (V.min(0) + V.max(0)) / 2
    o = o - (o @ n - inside) * n
    mid = np.abs((V - o) @ a) < 4.0                    # the crown of the arch, where the turns go
    off, across = (V[mid] - o) @ n, (V[mid] - o) @ w
    return (o, a, n, w), ((off.min() + off.max()) / 2, (off.max() - off.min()) / 2,
                          (across.min() + across.max()) / 2)


def _turns(bend, stand, radius, out, across, along, clear=DECK_GAP, turns=2, pitch=12.5, step=3.5):
    """Round turns through an eye. The bend of the eye is a bar standing off a plate, so the loop
    is not a circle round the bar but the bar grown by the radius of the line and carried down to
    the plate: over the bend, straight down either side and round under the foot, where the line
    rests on the plate instead of choking in the narrow top of the arch. `bend` is a point on the
    axis of the bend, `out` points from the plate to it, `across` and `along` are the other two
    axes of the eye, `stand` how far the bend's axis stands off the plate. The turns are pitched a
    rope diameter apart and sit astride the bend's middle: it is where they pass under the bend
    that they have to clear the legs of the arch."""
    r = radius
    crown = bend
    lift = stand - (r + ROPE_R + clear)                # how far the loop is carried down the arch
    foot = crown - lift * out
    per = 2 * np.pi * r + 2 * lift
    low = (2 * lift + 1.5 * np.pi * r) / per                        # where in a turn the line is lowest
    t = np.arange(0.0, turns * per + step, step)
    s = np.mod(t, per)
    P = np.empty((len(t), 3))
    for i, (si, ti) in enumerate(zip(s, t)):
        if si < lift:                                               # up the near side
            P[i] = foot + si * out + r * across
        elif si < lift + np.pi * r:                                 # over the bend
            ang = (si - lift) / r
            P[i] = crown + r * (np.cos(ang) * across + np.sin(ang) * out)
        elif si < 2 * lift + np.pi * r:                             # down the far side
            P[i] = crown - (si - lift - np.pi * r) * out - r * across
        else:                                                       # under the foot, through the eye
            ang = (si - 2 * lift - np.pi * r) / r
            P[i] = foot - r * (np.cos(ang) * across + np.sin(ang) * out)
        P[i] += (ti / per - low - (turns - 1) / 2) * pitch * along
    return P


# ---- achterlandvast: coiled on the achterdek, made fast to the port landvastoog

ACHTER_COIL = (1500.0, 405.0)        # centre of the coil: clear of helmstok, mikhouders and dolboord
ACHTER_TURNS, ACHTER_R0 = 5.0, 128.0
ACHTER_RUN = [(1302.0, 440.0), (1275.0, 462.0), (1230.0, 465.0), (1150.0, 450.0),
              (1060.0, 425.0), (980.0, 405.0), (920.0, 390.0), (896.0, 384.0)]


def achterlandvast(mesh_dir):
    """Coiled down on the port side of the achterdek and made fast to the landvastoog above it."""
    Vd, Nd, Fd = _load(mesh_dir, ACHTERDEK)
    deck = lambda P: _deck_z(Vd, Nd, Fd, P)
    (origin, a, n, w), (off, rod, across) = _oog(mesh_dir)
    knots = _turns(origin + off * n + across * w, off, rod + ROPE_R, n, w, -a)

    laid = coil(ACHTER_COIL, deck, ACHTER_TURNS, ACHTER_R0)
    run = _run(deck, [tuple(laid[-1, :2])] + ACHTER_RUN)
    rise = np.linspace(0.0, 1.0, 7)[1:-1, None] * (knots[0] - run[-1]) + run[-1]
    rise[:, 2] -= 3.0 * np.sin(np.pi * np.linspace(0, 1, 7)[1:-1])   # it is led, not stretched
    tail = knots[-1] + np.outer(np.linspace(0.0, 1.0, 5)[1:], -46.0 * a)
    tail[:, 2] = np.minimum(tail[:, 2], deck(tail[:, :2]) + ROPE_R + 6.0)
    P = _resample(np.vstack([laid, run, rise, knots, tail]), 13.0)
    return _join([tube(P, ROPE_R, SIDES), bead(P[-1], KNOT_R)])


# ---- voorlandvast: coiled on the voordek, over the dolboord and down the bow to the sleepoog

VOOR_COIL = (5150.0, 350.0)          # port side of the voordek, the ankerlijn has the starboard side
VOOR_TURNS, VOOR_R0 = 4.5, 128.0
VOOR_RUN = [(5360.0, 322.0), (5420.0, 302.0), (5520.0, 292.0), (5650.0, 282.0),
            (5760.0, 262.0), (5850.0, 236.0), (5895.0, 215.0)]
CROSS_X = 5985.0                     # where the line goes over the dolboord: just aft of the boegrand
CROSS_IN, CROSS_OUT = -40.0, 150.0   # how far round the bar it is laid, from inboard to outboard
CROSS_LEAD = 14.0                    # the climb tops out this far inboard of it, clear of the boeisel
DOLBOORD_R = 10.0                    # the bar is 20 mm round; its section is oblique this far forward


def _inside_y(seg, z):
    """y of the inboard face of the port plating at height z, from a section of it (as
    hardware._inboard_y, but None where the section has run out above the top of the boeisel)."""
    a, b = seg[:, 0], seg[:, 1]
    hit = ((a[:, 1] - z) * (b[:, 1] - z) <= 0) & (np.abs(b[:, 1] - a[:, 1]) > 1e-9)
    a, b = a[hit], b[hit]
    y = a[:, 0] + (z - a[:, 1]) / (b[:, 1] - a[:, 1]) * (b[:, 0] - a[:, 0])
    y = y[y > 0]
    return y.min() if len(y) else None


def _climb(mesh_dir, foot, head, n=20):
    """Up the inside of the plating, from where the line leaves the deck to the rail. The bow is
    drawn in so fast that a line pulled taut between those two points would rather run forward
    along the plating than up it, so the climb is stepped out instead: station and height rise
    straight from foot to head and the line is set against the inboard face of kim and boeisel at
    each step, measured from a section there the way hardware.gusset() follows the same plating.
    The offset is taken along the normal of that face, not athwartships: forward of the mast the
    plating leans away from the y axis in both directions at once."""
    Vk, _, Fk = _load(mesh_dir, CLIMB_PLATING[0])
    Vb, _, Fb = _load(mesh_dir, CLIMB_PLATING[1])
    V, F = np.vstack([Vk, Vb]), np.vstack([Fk, Fb + len(Vk)])
    at = lambda x, z: _inside_y(_section(V, F, x), z)
    P = foot + np.outer(np.linspace(0.0, 1.0, n), head - foot)
    for i in range(1, n - 1):
        x, _, z = P[i]
        y = [at(x, z), at(x - 5.0, z), at(x + 5.0, z), at(x, z - 5.0), at(x, z + 5.0)]
        if None in y:                                  # above the top edge it lies against nothing
            continue
        slope = np.array([(y[2] - y[1]) / 10.0, -1.0, (y[4] - y[3]) / 10.0])
        P[i] = [x, y[0], z] + (ROPE_R + DECK_GAP) * slope / np.linalg.norm(slope)
    for _ in range(3):
        P[1:-1] = 0.25 * P[:-2] + 0.5 * P[1:-1] + 0.25 * P[2:]
    return P


def _dolboord(mesh_dir, x):
    """Axis and forward tangent of the port dolboord at station x, and the two directions square
    to it: up and outboard. Fitted from two sections, because the bar sweeps in fast by the stem."""
    V, _, F = _load(mesh_dir, DOLBOORD_BB)
    at = []
    for xx in (x - 20.0, x + 20.0):
        (y, z), _ = _round_section(_section(V, F, xx))
        at.append(np.array([xx, y, z]))
    d = at[1] - at[0]; d /= np.linalg.norm(d)
    out = np.cross(d, [0.0, 0.0, 1.0]); out = -out / np.linalg.norm(out)      # outboard, horizontal
    up = np.array([0.0, 0.0, 1.0]) - d[2] * d; up /= np.linalg.norm(up)
    return (at[0] + at[1]) / 2, d, up, out


def voorlandvast(mesh_dir):
    """Coiled on the port side of the voordek, over the port dolboord by the stem and down the
    outside of the bow to the sleepoog. The bow is drawn in fast there, so the stretch down the
    plating is not a guess but a line pulled taut against the outer skin of vlak, kim, boeisel and
    berghout; the climb up to the dolboord is the same thing against the inside of that skin."""
    Vd, Nd, Fd = _load(mesh_dir, VOORDEK)
    deck = lambda P: _deck_z(Vd, Nd, Fd, P)
    axis, _, up, out = _dolboord(mesh_dir, CROSS_X)
    lay_on = DOLBOORD_R + ROPE_R + 0.3           # laid on the bar: touching it, not sunk into it
    over = np.array([axis + lay_on * (np.cos(np.radians(t)) * up + np.sin(np.radians(t)) * out)
                     for t in np.arange(CROSS_IN, CROSS_OUT + 1.0, 8.0)])

    laid = coil(VOOR_COIL, deck, VOOR_TURNS, VOOR_R0)
    run = _run(deck, [tuple(laid[-1, :2])] + VOOR_RUN)
    lead = over[0] - CROSS_LEAD * out             # up the inside first, out over the rail after
    climb = _climb(mesh_dir, run[-1], lead)

    _, (off, rod, across) = _oog(mesh_dir)
    at, t = sleepogen.stem_line(mesh_dir, sleepogen.SLEEPOOG_Z)
    m = np.array([t[2], 0.0, -t[0]])                   # out of the hull: forward and down
    b = np.cross(t, m)                                 # where the eye's own axes end up: t, m, b
    knots = _turns(at + off * m + across * b, off, rod + ROPE_R, m, b, -t, clear=STEM_GAP)
    down = _lay(_resample(np.vstack([over[-1], knots[0]]), 9.0),
                _skin(mesh_dir, BOW_PLATING, True), ROPE_R + HULL_GAP)
    below = sleepogen.stem_line(mesh_dir, sleepogen.SLEEPOOG_Z - 60.0)[0]
    end = below + (KNOT_R + 2.0) * m + across * b       # the tail hangs down the stem, knot clear of it
    tail = knots[-1] + np.outer(np.linspace(0.0, 1.0, 5)[1:], end - knots[-1])

    P = _resample(np.vstack([laid, run, climb[1:], over, down[1:-1], knots, tail]), 12.0)
    return _join([tube(P, ROPE_R, SIDES), bead(P[-1], KNOT_R)])


def build(mesh_dir):
    """[(id, naam, groep, materiaal, (V, N, F))] for the two landvasten."""
    return [("achterlandvast", "Achterlandvast", "lopend_want", "touw_zwart", achterlandvast(mesh_dir)),
            ("voorlandvast", "Voorlandvast", "lopend_want", "touw_zwart", voorlandvast(mesh_dir))]
