"""Procedural rigging that the CAD model gets wrong.

Marllijn: the DWG winds it round the spar as a plain helix. A marllijn is laid with marlsteken:
the line lies along the lijk of the sail, and at every zeilring it takes one turn round spar and
sail and is tucked under itself (an overhand), so each steek holds on its own. "De marllijn komt
daarbij in het lijk te liggen tussen de omslagen en drukt het zeil daarmee tegen het rondhout."
(nl.wikipedia.org/wiki/Marlsteek)

Zeilring positions follow the zeilplan (Vlettenboek p. 60): first ring 100 mm from the corner,
then every 200 mm along boven- and onderlijk. DWG millimetres throughout.
"""
import numpy as np

ROPE_R = 2.0            # mm. Vlettenboek: marllijn nylon 3 mm; drawn 4 mm so it stays visible
SIDES = 7


def surface_points(V, F, n=40000, seed=3):
    """Area-weighted random points on a mesh (a long cylinder has vertices at its ends only)."""
    rng = np.random.default_rng(seed)
    a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    area = np.linalg.norm(np.cross(b - a, c - a), axis=1)
    idx = rng.choice(len(F), n, p=area / area.sum())
    w = rng.random((n, 2)); flip = w.sum(1) > 1; w[flip] = 1 - w[flip]
    return a[idx] + (b[idx] - a[idx]) * w[:, :1] + (c[idx] - a[idx]) * w[:, 1:]


def spar_axis(V, F, lo, hi):
    """Axis (point, unit dir) and radius of the round shaft, fitted on the stretch of the spar
    between fractions lo and hi of its length (so klauw, beslag and tapers are left out)."""
    S = surface_points(V, F)
    c = S.mean(0)
    d = np.linalg.eigh(np.cov((S - c).T))[1][:, -1]
    t = (S - c) @ d
    S = S[(t > t.min() + lo * np.ptp(t)) & (t < t.min() + hi * np.ptp(t))]
    c = S.mean(0)                                       # refit on the round shaft only
    d = np.linalg.eigh(np.cov((S - c).T))[1][:, -1]
    r = np.linalg.norm((S - c) - np.outer((S - c) @ d, d), axis=1)
    return c, d, float(np.percentile(r, 90))            # facets lie just inside the true radius


def tube(P, radius=ROPE_R, sides=SIDES):
    """Sweep a circle along polyline P with parallel-transported frames."""
    T = np.gradient(P, axis=0); T /= np.linalg.norm(T, axis=1, keepdims=True)
    n = np.cross(T[0], [0.0, 0.0, 1.0])
    if np.linalg.norm(n) < 1e-6:
        n = np.cross(T[0], [0.0, 1.0, 0.0])
    n /= np.linalg.norm(n)
    rings, normals = [], []
    ang = np.linspace(0, 2 * np.pi, sides, endpoint=False)
    for p, t in zip(P, T):
        n = n - (n @ t) * t; n /= np.linalg.norm(n)
        b = np.cross(t, n)
        dirs = np.outer(np.cos(ang), n) + np.outer(np.sin(ang), b)
        rings.append(p + radius * dirs); normals.append(dirs)
    V = np.concatenate(rings); N = np.concatenate(normals)
    F = []
    for i in range(len(P) - 1):
        for k in range(sides):
            a, b_ = i * sides + k, i * sides + (k + 1) % sides
            c, d = a + sides, b_ + sides
            F += [(a, b_, c), (b_, d, c)]
    return V, N, np.array(F)


def marllijn(origin, axis, sail_dir, spar_r, length, first=100.0, spacing=200.0, rope_r=ROPE_R):
    """Polyline of a marllijn laid with marlsteken.

    origin: point on the spar axis at the corner of the sail where the lacing starts
    axis: unit vector along the spar towards the other corner
    sail_dir: unit vector from the axis towards the lijk of the sail
    """
    e1 = sail_dir - (sail_dir @ axis) * axis; e1 /= np.linalg.norm(e1)
    e2 = np.cross(axis, e1)
    rho0 = spar_r + rope_r + 0.6
    eps = 1.25 * rope_r / rho0                           # half the angular gap between two strands
    pts = []                                            # (s, phi, rho)

    def run(s0, s1, n=6):
        for k in np.linspace(0, 1, n, endpoint=False):
            pts.append((s0 + (s1 - s0) * k, eps + (-2 * eps) * k, rho0))

    eyelets = np.arange(first, length - first + 1e-6, spacing)
    s_dep = eyelets[0] - 30.0
    for i, s_i in enumerate(eyelets):
        run(s_dep, s_i - 5.0)
        # one turn round the spar, drifting back 10 mm, lifted where it crosses the continuing part
        turns = 1 if i < len(eyelets) - 1 else 3         # made fast with extra turns at the end
        n = 26 * turns
        for k in np.linspace(0, 1, n, endpoint=False):
            phi = -eps + k * (2 * np.pi * turns + 2 * eps)
            first_pass = phi < np.pi
            lift = 2.1 * rope_r * np.exp(-((phi - eps) / 0.16) ** 2) if first_pass else 0.0
            pts.append((s_i - 5.0 - 10.0 * k * (1 if turns == 1 else -2.2), phi, rho0 + lift))
        s_dep = s_i - 15.0 if turns == 1 else s_i + 17.0
    pts.append((s_dep + 25.0, eps, rho0))               # short tail
    pts = np.array(pts)
    P = origin + np.outer(pts[:, 0], axis) + pts[:, 2:3] * (np.outer(np.cos(pts[:, 1]), e1) + np.outer(np.sin(pts[:, 1]), e2))
    P[1:-1] = 0.25 * P[:-2] + 0.5 * P[1:-1] + 0.25 * P[2:]        # round the corners of the turns
    return P


def _mesh_from_quads(quads):
    """Build a mesh from quads, flat shaded (each quad keeps its own vertices)."""
    V, N, F = [], [], []
    for q in quads:
        n = np.cross(q[1] - q[0], q[2] - q[0]); ln = np.linalg.norm(n)
        n = n / ln if ln > 1e-12 else np.array([0.0, 0.0, 1.0])
        base = len(V)
        V.extend(q); N.extend([n] * 4)
        F += [(base, base + 1, base + 2), (base, base + 2, base + 3)]
    return np.array(V), np.array(N), np.array(F, dtype=np.int64)


def folded_band(p0, p1, y_centre, r_in, r_out, segments=28):
    """The fold of a plate bent over a radius: a half-round shell joining two parallel plates
    along the straight edge p0 -> p1 (both given on the mid-plane y = y_centre)."""
    d = p1 - p0
    length = np.linalg.norm(d); d = d / length
    up = np.array([-d[2], 0.0, d[0]])                    # perpendicular to the edge, in the XZ plane
    up = up / np.linalg.norm(up)
    if up[2] < 0:
        up = -up
    y_hat = np.array([0.0, 1.0, 0.0])
    theta = np.linspace(0.0, np.pi, segments + 1)        # 0 at one plate, pi at the other, over the top
    ring = lambda r: np.array([np.cos(a) * y_hat * r + np.sin(a) * up * r for a in theta])
    ends = [p0.copy(), p1.copy()]
    for e in ends:
        e[1] = y_centre
    outer = [ends[k] + ring(r_out) for k in (0, 1)]
    inner = [ends[k] + ring(r_in) for k in (0, 1)]
    quads = []
    for i in range(segments):                            # outer and inner surface
        quads.append([outer[0][i], outer[0][i + 1], outer[1][i + 1], outer[1][i]])
        quads.append([inner[0][i], inner[1][i], inner[1][i + 1], inner[0][i + 1]])
    for k, flip in ((0, False), (1, True)):              # the two ends of the band
        for i in range(segments):
            q = [outer[k][i], inner[k][i], inner[k][i + 1], outer[k][i + 1]]
            quads.append(q[::-1] if flip else q)
    for i, flip in ((0, False), (segments, True)):       # where it meets each plate
        q = [outer[0][i], inner[0][i], inner[1][i], outer[1][i]]
        quads.append(q[::-1] if flip else q)
    return _mesh_from_quads(quads)


# Where each fokkenschoot runs: schoothoek -> the block on the forward leioog, by the want ->
# the hand of the crew. DWG mm; y is mirrored for the other side. The viewer lays the sheet anew
# for every position of the fok; what is built here is the sheet as the CAD has the sails.
SCHOOT_HOEP = (4060.0, 862.4, 787.5)          # middle of the sheave of that block
SCHOOT_HAND = (3550.0, 430.0, 862.0)          # crew sitting by the mastdoft
SCHOOT_R = 4.0                                # the sheet is drawn 8 mm


def fokkenschoot(clew, hoop, hand, sag=0.055):
    """One jib sheet: schoothoek -> block on the wantputting -> the crew's hand. It is not led
    through the lei-ogen and stays inboard of the want."""
    def leg(a, b, n=26):
        t = np.linspace(0.0, 1.0, n)
        pts = a + np.outer(t, b - a)
        pts[:, 2] -= sag * np.linalg.norm(b - a) * np.sin(np.pi * t)      # rope sags a little
        return pts
    return np.vstack([leg(clew, hoop), leg(hoop, hand)[1:]])


def build(mesh_dir):
    """Returns {handle: (V, N, F)} for bodies that are replaced by generated geometry."""
    out = {}
    def load(name):
        d = np.load(mesh_dir / f"{name}.npz")
        return d["V"].astype(float), d["F"].astype(int)

    # giek: sail above the boom; lacing runs from the tack (at the mast) aft to the clew
    c, d, r = spar_axis(*load("GiekSolids_5706"), 0.25, 0.85)
    d = -d if d[0] > 0 else d                           # point aft
    tack = np.array([4194.4, 0.0, 1331.6])
    origin = c + ((tack - c) @ d) * d
    P = marllijn(origin, d, np.array([0.0, 0.0, 1.0]), r, 2600.0)
    out["5324"] = tube(P)

    # gaffel: sail hangs below the gaff; lacing runs from the throat (klauw) up to the peak
    c, d, r = spar_axis(*load("GaffelSolids_5693"), 0.35, 0.9)
    d = -d if d[2] < 0 else d                           # point up to the peak
    throat = np.array([4194.4, 0.0, 3981.6])
    origin = c + ((throat - c) @ d) * d
    down_aft = np.array([-d[2], 0.0, d[0]])             # perpendicular to the gaff in the XZ plane
    if down_aft[2] > 0:
        down_aft = -down_aft
    P = marllijn(origin, d, down_aft, r, 2600.0)
    out["52E9"] = tube(P)

    # fokkenschoot: re-routed to the hoop on the wantputting and then to the crew
    clew = np.array([4268.7, 722.2, 1134.6])
    for handle, side in (("5484", 1.0), ("547B", -1.0)):
        hoop = np.array([SCHOOT_HOEP[0], SCHOOT_HOEP[1] * side, SCHOOT_HOEP[2]])
        hand = np.array([SCHOOT_HAND[0], SCHOOT_HAND[1] * side, SCHOOT_HAND[2]])
        out[handle] = tube(fokkenschoot(clew, hoop, hand), radius=SCHOOT_R)

    # roerkop: the CAD draws two loose side plates. It is one plate folded over a radius, with the
    # helmstok slotting up into it from below, so add the fold along their top edge.
    V, F = load("PartSolids-Frame_58C8")
    N = np.load(mesh_dir / "PartSolids-Frame_58C8.npz")["N"].astype(float)
    y_lo, y_hi = V[:, 1].min(), V[:, 1].max()            # outer faces of the two plates
    plate = V[V[:, 1] < y_lo + 0.5]                      # the outline of one plate
    top = plate[plate[:, 2] > plate[:, 2].max() - 60.0]  # its sloping top edge
    a = top[np.argmin(top[:, 0])].copy(); b = top[np.argmax(top[:, 0])].copy()
    r_out = (y_hi - y_lo) / 2.0
    fold = folded_band(a, b, (y_lo + y_hi) / 2.0, r_out - 2.05, r_out)
    out["58C8"] = (np.vstack([V, fold[0]]), np.vstack([N, fold[1]]),
                   np.vstack([F, fold[2] + len(V)]))
    return out
