"""Wat er in de bakskist ligt: de meerpen, het hoosblik en de EHBO-koffer.

The chest itself is `pipeline/bakskist.py`. Its `placement()` gives the frame of the inside -
origin at the bottom centre of the floor, x along the length of the chest (forward), y to port,
z up out of that floor - and the size of the cavity, 570 x 350 x 315 mm. Everything here is built
in that frame and carried into CAD millimetres at the very end, so the gear lies on the floor of
the chest, which leans forward with the vlonders, and not level with the world.

The lid is hinged on the bakboord side and stands open, so the contents are seen from above and
from the stuurboord/aft side, where the crew is. The three items therefore lie beside each other,
none on top of another: the meerpen along the far (port) side with its head aft, the
EHBO-koffer aft and nearest the crew with its lettering the right way up from there,
and the hoosblik forward of it, its mouth pointing aft.

  build(mesh_dir)  [(id, naam, groep, materiaal, (V, N, F))] - meerpen, hoosblik, EHBO-koffer
"""
import numpy as np

from bakskist import board, placement
from hardware import _finish, _join, lug

# -- meerpen (scoutingvlet.nl, "landpin / meerpen 42.5 cm"), read off the two photographs: a
# galvanised bar of square section about 25 mm across, drawn out over the last 90 mm into a blunt
# chisel point, and forged flat at the head into a tongue with a hole, in which a loose welded ring
# of about 70 mm outside diameter hangs. Both photographs show one bright top face and one duller
# side face meeting at a single crisp edge, and the taper shows neither web nor hollow, so the
# section is read as a solid square bar rather than as an angle or a T.
PEN_LEN = 425.0                  # over the steel; the ring hangs another 48 mm beyond the head
PEN_BAR = 25.0                   # square section, resting on one of its faces
PEN_TIP = (90.0, 6.0, 4.0)       # the taper: how long, and the width and height of the blunt point
PEN_EYE = (11.0, 27.0, 11.0, 4.0, 7.5)   # tongue: hole from the head, reach past it, half-height,
PEN_TWIST = (38.0, 75.0)                 # half-thickness, hole radius; and where the twist runs
PEN_SHOULDER = 115.0             # by here the tongue has grown back into the full bar
PEN_RING = (30.0, 5.0)           # the ring: 70 mm outside diameter over 10 mm rod

# The tongue is flat in the photographs with its hole through the flat faces, and the ring there
# hangs down over the edge of a plank. On a floor such a ring cannot lie down at all: hanging in a
# hole 12.5 mm up it would hold the head of the pin 60 mm off the ground. The last 37 mm of the
# tongue is therefore given the quarter twist a forged eye usually has, so the hole looks across
# the pin and the ring lies down through it, flat-ish on the floor, as it is asked to.

# -- hoosblik. No photograph exists; this is the classic shape: an open scoop folded from 1.2 mm
# galvanised sheet with a flat bottom, two side walls that run out to nothing towards the mouth, a
# square back wall and a bail over the back half to grip it by.
HB = (260.0, 150.0, 90.0)        # length, width, depth at the back
HB_SHEET = 1.2
HB_LIP = 2.5                     # the walls do not quite die out: the mouth keeps a low lip
HB_RISE = 0.55                   # h = lip + (depth - lip) * (m/length) ** rise
HB_BAIL = (0.72, 25.0, 1.5, 40.0, 25.0)  # where along the length, strap width and thickness, how
HB_STATIONS = 18                         # far it stands over the rim, how far its feet reach down

# -- EHBO-koffer: a plastic case with well-rounded vertical corners, the seam between lid and base
# two thirds up, and the handle and both clasps on one long side - the side that faces the crew.
KOFFER = (260.0, 170.0, 80.0)
KOFFER_R = 20.0                  # radius of the vertical corners
KOFFER_TOP_R = 6.0               # the top edges are taken off with a smaller radius
KOFFER_SEAM = (51.5, 3.0, 1.5)   # the groove: where it starts, how high, how deep
KOFFER_GRIP = (100.0, 18.0, 8.0, 22.0)   # handle: span, height, thickness, how far it stands proud
KOFFER_CLASP = (85.0, 34.0, 26.0, 8.0)   # clasps: from the middle, wide, high, proud
KOFFER_ARC = 8                   # segments per rounded corner

# -- the lettering, raised on the top face so it can never z-fight with it. Bold sans capitals of
# 45 mm, with a Greek cross before them; E and H are partitioned into rectangles (they are not
# overlaid, which would leave coplanar faces), B and O are built as bands with their counters open.
TEKST = "EHBO"
LETTER_H = 45.0
LETTER_PROUD = 0.8
LETTER_GAP = 8.0
KRUIS_GAP = 14.0
STEM = 8.0                       # weight of the vertical strokes
BAR = (18.5, 26.5)               # the middle bar of the E and the H

# -- where each item lies on the floor, in the frame of the inside of the chest. The pin keeps to
# the port side, clear of the two others; 5 mm is left to every wall and at least 3 mm between the
# items (the narrowest gap is 8 mm, between koffer and hoosblik).
PEN_AT = (-223.5, 128.0, 1.0)                            # x of the head, y of the bar, which way
KOFFER_AT = (-146.0, -48.0)                              # centre of the case
HB_AT = (-8.0, -50.0)                                    # x of the mouth, centre of the width


def _rect(c, ex, ey):
    """The four corners of a rectangular section, ordered so that cross(ex, ey) runs along the
    sweep; `_sweep` then reads every wall of the solid as facing outwards."""
    c, ex, ey = (np.asarray(a, float) for a in (c, ex, ey))
    return np.array([c - ex - ey, c + ex - ey, c + ex + ey, c - ex + ey])


def _sweep(rings, caps):
    """Closed solid through a series of cross-sections with the same number of points, each wound
    counter-clockwise seen from the far end. `caps` triangulates one section and closes both ends."""
    rings = [np.asarray(r, float) for r in rings]
    V, F, want = [], [], []

    def quad(p, q, r, s, n):
        i = len(V); V.extend([p, q, r, s]); F.extend([(i, i + 1, i + 2), (i, i + 2, i + 3)]); want.extend([n, n])

    for a, b in zip(rings[:-1], rings[1:]):
        run = b.mean(0) - a.mean(0)
        for k in range(len(a)):
            k2 = (k + 1) % len(a)
            quad(a[k], a[k2], b[k2], b[k], np.cross(a[k2] - a[k] + b[k2] - b[k], run))
    for ring, out in ((rings[0], rings[0].mean(0) - rings[1].mean(0)),      # the run at the end
                      (rings[-1], rings[-1].mean(0) - rings[-2].mean(0))):  # itself, not overall:
        for t in caps:                                                      # a path may turn
            i = len(V); V.extend(ring[list(t)]); F.append((i, i + 1, i + 2)); want.append(out)
    return _finish(V, F, want)


def _torus(centre, e1, e2, major, minor, around=24, sides=10):
    """A welded ring in the plane of the orthonormal e1 and e2, with exact normals so it shades
    round rather than as facets."""
    centre = np.asarray(centre, float)
    n = np.cross(e1, e2)
    t = np.linspace(0, 2 * np.pi, around, endpoint=False)
    s = np.linspace(0, 2 * np.pi, sides, endpoint=False)
    d = np.cos(t)[:, None] * e1 + np.sin(t)[:, None] * e2                 # out along the ring
    N = np.cos(s)[None, :, None] * d[:, None, :] + np.sin(s)[None, :, None] * n
    V = centre + major * d[:, None, :] + minor * N
    F = []
    for i in range(around):
        for k in range(sides):
            a = i * sides + k; b = ((i + 1) % around) * sides + k
            c, e = b - k + (k + 1) % sides, a - k + (k + 1) % sides
            F += [(a, b, c), (a, c, e)]                                   # +t then +s is outwards
    return V.reshape(-1, 3), N.reshape(-1, 3), np.array(F)


def _band(centre, outer, inner, arc, z, steps):
    """A flat elliptical band with a real hole in it: the bowls of the B and the ring of the O.
    `arc` is the sector; a full turn closes on itself and needs no end faces."""
    (cx, cy), (ao, bo), (ai, bi), (a0, a1), (z0, z1) = centre, outer, inner, arc, z
    full = abs(a1 - a0 - 2 * np.pi) < 1e-9
    a = np.linspace(a0, a1, steps + (0 if full else 1), endpoint=not full)
    P = lambda r, s, h: np.array([cx + r[0] * np.cos(a[s]), cy + r[1] * np.sin(a[s]), h])
    V, F, want = [], [], []

    def quad(p, q, r, s, n):
        i = len(V); V.extend([p, q, r, s]); F.extend([(i, i + 1, i + 2), (i, i + 2, i + 3)]); want.extend([n, n])

    for k in range(len(a) if full else len(a) - 1):
        k2 = (k + 1) % len(a)
        for h, n in ((z1, (0, 0, 1.0)), (z0, (0, 0, -1.0))):
            quad(P(inner, k, h), P(outer, k, h), P(outer, k2, h), P(inner, k2, h), n)
        for r, s in ((outer, 1.0), (inner, -1.0)):
            mid = (P(r, k, 0) + P(r, k2, 0)) / 2 - (cx, cy, 0)
            quad(P(r, k, z0), P(r, k2, z0), P(r, k2, z1), P(r, k, z1), s * mid)
    for k, s in ((0, -1.0), (len(a) - 1, 1.0)) if not full else ():
        t = np.array([-outer[0] * np.sin(a[k]), outer[1] * np.cos(a[k]), 0.0])
        quad(P(inner, k, z0), P(outer, k, z0), P(outer, k, z1), P(inner, k, z1), s * t)
    return _finish(V, F, want)


def _strap(path, wide, thick, ex):
    """A strap of sheet swept along a plane path: the bail of the hoosblik and the handle of the
    koffer. `ex` is the fixed direction of its width, the thickness follows the path."""
    path, ex = np.asarray(path, float), np.asarray(ex, float)
    rings = []
    for k, p in enumerate(path):
        t = path[min(k + 1, len(path) - 1)] - path[max(k - 1, 0)]
        t /= np.linalg.norm(t)
        rings.append(_rect(p, np.cross(ex, t) * thick / 2, ex * wide / 2))
    return _sweep(rings, [(0, 1, 2), (0, 2, 3)])


# ---------------------------------------------------------------- meerpen

def _pen_body():
    """Tongue, twist, shoulder, bar and point of one meerpen, as one sweep of a rectangle that
    turns a quarter over the twist and grows from the flat tongue into the full square bar. s runs
    from the head towards the point, p across the pin, z up; the bar rests on the floor at z = 0."""
    _, _, half, thick, _ = PEN_EYE
    t0, t1 = PEN_TWIST
    taper, tip_w, tip_h = PEN_TIP
    mid = PEN_BAR / 2                                    # the bar, and the tongue, sit on z = mid
    p, z = np.array([0.0, 1.0, 0.0]), np.array([0.0, 0.0, 1.0])
    rings = []
    for f in np.linspace(0, 1, 5):                       # the quarter twist out of the eye
        a = f * np.pi / 2
        u, v = np.cos(a) * p + np.sin(a) * z, -np.sin(a) * p + np.cos(a) * z
        rings.append(_rect((t0 + f * (t1 - t0), 0, mid), thick * u, half * v))
    for s in (t1 + (PEN_SHOULDER - t1) / 2, PEN_SHOULDER):    # forged back out into the bar
        f = (s - t1) / (PEN_SHOULDER - t1)
        rings.append(_rect((s, 0, mid), (thick + f * (mid - thick)) * p, (half + f * (mid - half)) * z))
    rings.append(_rect((PEN_LEN - taper, 0, mid), mid * p, mid * z))
    for f in (0.5, 1.0):                                 # the point: the top comes down, the
        w, h = mid + f * (tip_w / 2 - mid), mid + f * (tip_h / 2 - mid)     # underside stays flat
        rings.append(_rect((PEN_LEN - taper + f * taper, 0, h), w * p, h * z))
    return _sweep(rings, [(0, 1, 2), (0, 2, 3)])


def _pen_ring():
    """The loose ring, lying as flat as it can: it hangs through the hole in the tongue, which the
    twist has turned on edge, and leans away from the pin until it rests on the floor. Its tangent
    where it passes the hole is the hole's own axis, so the rod runs clean through it."""
    hole = PEN_EYE[0]
    major, minor = PEN_RING
    mid = PEN_BAR / 2
    tilt = np.arcsin((mid - minor) / (2 * major))        # just enough to put its far side on z = 0
    a = np.array([0.0, 1.0, 0.0])                        # across the pin: the axis of the hole
    b = np.array([-np.cos(tilt), 0.0, -np.sin(tilt)])    # away from the pin, and downhill
    return _torus(np.array([hole, 0.0, mid]) + major * b, a, b, major, minor)


def _meerpen():
    """One meerpen: the eye, the pin itself and the ring in it."""
    hole, reach, half, thick, bore = PEN_EYE
    eye = lug((hole, 0.0, PEN_BAR / 2), (1.0, 0, 0), (0, 0, 1.0), -thick, thick, half, bore, reach)
    return [eye, _pen_body(), _pen_ring()]


# ---------------------------------------------------------------- hoosblik

def _hb_height(m):
    """Height of the side walls m along the scoop: nothing at the mouth, full depth at the back."""
    length, _, depth = HB
    return HB_LIP + (depth - HB_LIP) * (m / length) ** HB_RISE


def _hb_shell():
    """Bottom and both side walls in one piece, the way the sheet is folded: a U of `HB_SHEET`
    swept from the mouth to the back wall, the walls growing out of the bottom as it goes."""
    length, wide, _ = HB
    t, half = HB_SHEET, wide / 2
    rings = []
    for f in np.linspace(0, 1, HB_STATIONS) ** 1.4:      # close together where the walls rise fast
        m, h = f * (length - t), _hb_height(f * (length - t))
        rings.append(np.array([[m, -half, h], [m, -half, 0], [m, half, 0], [m, half, h],
                               [m, half - t, h], [m, half - t, t], [m, t - half, t], [m, t - half, h]]))
    return _sweep(rings, [(0, 1, 6), (0, 6, 7), (1, 2, 5), (1, 5, 6), (2, 3, 4), (2, 4, 5)])


def _hb_bail():
    """The grip: a strap riveted inside both walls over the back half, arching over the rim. It is
    let 0.45 mm into the walls so that no two faces of the bailer ever end up coplanar."""
    length, wide, depth = HB
    where, strap_w, strap_t, over, down = HB_BAIL
    m, y = where * length, wide / 2 - HB_SHEET - 0.45
    h = _hb_height(m)
    arch = [(m, -y * np.cos(u), h + over * np.sin(u)) for u in np.linspace(0, np.pi, 13)]
    path = [(m, -y, h - down), (m, -y, h - 8.0)] + arch + [(m, y, h - 8.0), (m, y, h - down)]
    return _strap(path, strap_w, strap_t, np.array([1.0, 0.0, 0.0]))


def _hoosblik():
    """Shell, back wall and bail. The back wall overlaps the shell by half a millimetre instead of
    butting against it, so no face of the one lands in the plane of a face of the other."""
    length, wide, depth = HB
    t = HB_SHEET
    back = board((length - t - 0.5, -wide / 2, 0.0), (length, wide / 2, depth))
    return [_hb_shell(), back, _hb_bail()]


# ---------------------------------------------------------------- EHBO-koffer

def _outline(half_l, half_w, r, per=KOFFER_ARC):
    """Plan of the case: a rectangle with rounded corners, counter-clockwise. Inset by d it is the
    same outline on (half_l - d, half_w - d, r - d), which is how the seam and the top are drawn."""
    pts = []
    for (sx, sy), a0 in (((1, -1), -90), ((1, 1), 0), ((-1, 1), 90), ((-1, -1), 180)):
        c = np.array([sx * (half_l - r), sy * (half_w - r)])
        for a in np.radians(np.linspace(a0, a0 + 90, per + 1)):
            pts.append(c + r * np.array([np.cos(a), np.sin(a)]))
    return np.array(pts)


def _koffer_body():
    """The case: a rounded box with a 1.5 mm groove where lid and base meet, two thirds up, and the
    top edges taken off with a quarter round. The vertical walls are shaded round afterwards, so
    the corners do not read as facets."""
    length, wide, high = KOFFER
    seam_z, seam_h, seam_d = KOFFER_SEAM
    steps = [(0.0, 2.0), (2.0, 0.0),                     # a small chamfer along the bottom edge
             (seam_z, 0.0), (seam_z + 0.7, seam_d), (seam_z + seam_h - 0.7, seam_d),
             (seam_z + seam_h, 0.0), (high - KOFFER_TOP_R, 0.0)]
    for a in np.radians([22.5, 45.0, 67.5, 90.0]):       # the round-over of the top edge
        steps.append((high - KOFFER_TOP_R * (1 - np.sin(a)), KOFFER_TOP_R * (1 - np.cos(a))))
    rings = []
    for z, d in steps:
        o = _outline(length / 2 - d, wide / 2 - d, KOFFER_R - d)
        rings.append(np.c_[o, np.full(len(o), z)])
    n = len(rings[0])
    V, N, F = _sweep(rings, [(0, k, k + 1) for k in range(1, n - 1)])
    flat = np.abs(N[:, 2]) < 0.05                        # the vertical walls, groove and all
    c = np.clip(V[flat, :2], [-(length / 2 - KOFFER_R), -(wide / 2 - KOFFER_R)],
                [length / 2 - KOFFER_R, wide / 2 - KOFFER_R])
    r = V[flat, :2] - c
    N[flat] = np.c_[r / np.linalg.norm(r, axis=1, keepdims=True), np.zeros(len(r))]
    return V, N, F


def _koffer_beslag():
    """Handle and the two clasps, all on the same long side - the one the crew looks at. The feet
    of the handle run 2 mm into the case, so nothing is left coplanar with its wall."""
    length, wide, high = KOFFER
    span, tall, thick, proud = KOFFER_GRIP
    seam_z, seam_h, seam_d = KOFFER_SEAM
    from_mid, cw, ch, cp = KOFFER_CLASP
    face, half = -wide / 2, span / 2
    path = [(-half, face + 2.0, high / 2), (-half, face - proud + 8.0, high / 2),
            (-half + 5.0, face - proud, high / 2), (half - 5.0, face - proud, high / 2),
            (half, face - proud + 8.0, high / 2), (half, face + 2.0, high / 2)]
    out = [_strap(path, tall, thick, np.array([0.0, 0.0, 1.0]))]
    for s in (-1.0, 1.0):                                # clasps, straddling the seam
        out.append(board((s * from_mid - cw / 2, face - cp, seam_z + seam_h / 2 - ch / 2),
                         (s * from_mid + cw / 2, face + 2.0, seam_z + seam_h / 2 + ch / 2)))
    return out


def _slab(x0, x1, y0, y1, z):
    """One rectangle of a letter, raised off the top face of the case."""
    return board((x0, y0, z), (x1, y1, z + LETTER_PROUD))


def _letter(ch, x, y, z):
    """One capital, its foot on y and its left edge on x. E and H are cut into rectangles that do
    not overlap; the bowls of the B and the ring of the O are bands, so their counters are holes."""
    h, s = LETTER_H, STEM
    b0, b1 = y + BAR[0], y + BAR[1]
    if ch == "E":
        w, mid = 28.0, 24.0
        return [_slab(x, x + w, y + h - s, y + h, z), _slab(x, x + mid, b0, b1, z),
                _slab(x, x + w, y, y + s, z), _slab(x, x + s, y + s, b0, z),
                _slab(x, x + s, b1, y + h - s, z)], w
    if ch == "H":
        w = 30.0
        return [_slab(x, x + s, y, y + h, z), _slab(x + w - s, x + w, y, y + h, z),
                _slab(x + s, x + w - s, b0, b1, z)], w
    if ch == "B":
        stroke, w = 6.0, 22.5
        out = [_slab(x, x + s, y, y + h, z)]
        for cy, ao in ((y + 3 * h / 4, 12.0), (y + h / 4, 14.5)):
            out.append(_band((x + s, cy), (ao, h / 4), (ao - stroke, h / 4 - stroke),
                             (-np.pi / 2, np.pi / 2), (z, z + LETTER_PROUD), 10))
        return out, w
    stroke, w = 7.0, 32.0                                # O
    return [_band((x + w / 2, y + h / 2), (w / 2, h / 2), (w / 2 - stroke, h / 2 - stroke),
                  (0.0, 2 * np.pi), (z, z + LETTER_PROUD), 24)], w


def _kruis(x, y, z):
    """A Greek cross before the letters, its arms a third of its height wide."""
    a = LETTER_H / 3
    return [_slab(x, x + a, y + a, y + 2 * a, z), _slab(x + a, x + 2 * a, y, y + 3 * a, z),
            _slab(x + 2 * a, x + 3 * a, y + a, y + 2 * a, z)], 3 * a


def _opdruk():
    """EHBO in red on the top face, with the cross before it. It reads for someone at the
    stuurboord side of the open chest: the letters run forward and stand up towards port. Laid out
    from x = 0 and shifted back over half its length, so the whole line is centred on the case."""
    z, x, y, out = KOFFER[2], 0.0, -LETTER_H / 2, []
    meshes, w = _kruis(x, y, z)
    out += meshes; x += w + KRUIS_GAP
    for ch in TEKST:
        meshes, w = _letter(ch, x, y, z)
        out += meshes; x += w + LETTER_GAP
    return _shift(out, -(x - LETTER_GAP) / 2, 0.0)


# ---------------------------------------------------------------- putting it in the chest

def _turn(meshes, origin, sense):
    """An item built along its own length into the frame of the inside of the chest: `sense` is
    +1 when it lies head-aft and -1 when it has been turned end for end about the vertical."""
    o = np.array([origin[0], origin[1], 0.0])
    R = np.diag([sense, sense, 1.0])
    return [(o + V @ R, N @ R, F) for V, N, F in meshes]


def _shift(meshes, x, y):
    return [(V + (x, y, 0.0), N, F) for V, N, F in meshes]


def _world(meshes, origin, axes):
    """From the frame of the inside of the chest into CAD millimetres."""
    return [(origin + V @ axes.T, N @ axes.T, F) for V, N, F in meshes]


def build(mesh_dir):
    """[(id, naam, groep, materiaal, (V, N, F))] for the contents of the bakskist. The koffer comes
    back twice under the one id: build_glb.py merges tuples that share an id into a single part
    with a skin per material, so case and lettering are one onderdeel with one name."""
    p = placement(mesh_dir)
    o, axes = p["origin"], np.c_[p["x_axis"], p["y_axis"], p["z_axis"]]
    pen = _turn(_meerpen(), PEN_AT[:2], PEN_AT[2])
    koffer = _shift([_koffer_body()] + _koffer_beslag(), *KOFFER_AT)
    opdruk = _shift(_opdruk(), *KOFFER_AT)
    blik = _shift(_hoosblik(), *HB_AT)
    return [
        ("meerpen", "Meerpen", "interieur", "verzinkt", _join(_world(pen, o, axes))),
        ("hoosblik", "Hoosblik", "interieur", "verzinkt", _join(_world(blik, o, axes))),
        ("ehbo_koffer", "EHBO-koffer", "interieur", "kunststof_wit", _join(_world(koffer, o, axes))),
        ("ehbo_koffer", "EHBO-koffer", "interieur", "ehbo_rood", _join(_world(opdruk, o, axes))),
    ]
