"""Sleepogen: the eyes on the outside of the spiegel and the one on the stem, for towing and being towed.

The CAD only has the landvastogen, the two bent-rod eyes on the inside of the spiegel. The
sleepogen are the same eyes welded on at the same place on the other side of the plate, so they
are made by mirroring the landvastogen in the middle plane of the spiegel. The sleepoog on the bow
(number 64 in the parts drawing) is one more of the same eye, stood along the stem on the outside.
"""
import numpy as np

import cad
LANDVASTOGEN = ("589B", "589F")
SPIEGEL = "582A"




def spiegel_plane(mesh_dir):
    """Unit normal (pointing forward, into the boat) and the offsets of the two faces of the plate."""
    V, N, F, _ = cad.load(SPIEGEL, mesh_dir)
    tri = V[F]
    fn = np.cross(tri[:, 1] - tri[:, 0], tri[:, 2] - tri[:, 0])
    area = np.linalg.norm(fn, axis=1)
    n = fn[np.argmax(area)] / area.max()                 # the plate's faces are by far its biggest triangles
    n = n if n[0] > 0 else -n
    flat = np.abs(fn @ n) > 0.999 * area                 # triangles lying in either face
    offsets = (tri[flat].mean(axis=1) @ n)
    return n, offsets.min(), offsets.max()               # aft (outside) face, forward (inside) face


STEM_BODY = "583C"                 # vlak, port: at the bow the two vlak plates run up and meet in the stem
SLEEPOOG_Z = 850.0                 # middle of the eye, a little under the berghout


def stem_line(mesh_dir, z, reach=70.0):
    """Point on the stem at height z and the unit tangent of the stem there (up and forward), from
    where the port vlak plate cuts the plane 1 mm off the centre line."""
    V, N, F, _ = cad.load(STEM_BODY, mesh_dir)
    t = V[:, 1] - 1.0
    pts = []
    for a, b in ((0, 1), (1, 2), (2, 0)):
        i, j = F[:, a], F[:, b]
        cut = (t[i] * t[j] < 0) & (V[i, 0] > 5900)
        k = (t[i][cut] / (t[i][cut] - t[j][cut]))[:, None]
        pts.append(V[i[cut]] + k * (V[j[cut]] - V[i[cut]]))
    P = np.vstack(pts)
    P = P[np.abs(P[:, 2] - z) < reach]
    outer = np.array([P[np.abs(P[:, 2] - h) < 6][:, 0].max() for h in np.arange(z - reach + 6, z + reach - 5, 6.0)
                      if (np.abs(P[:, 2] - h) < 6).any()])
    heights = np.array([h for h in np.arange(z - reach + 6, z + reach - 5, 6.0) if (np.abs(P[:, 2] - h) < 6).any()])
    slope, x0 = np.polyfit(heights, outer, 1)             # the outside of the plate: x = x0 + slope * z
    tangent = np.array([slope, 0.0, 1.0]); tangent /= np.linalg.norm(tangent)
    return np.array([x0 + slope * z, 0.0, z]), tangent


def bow_eye(mesh_dir):
    """The sleepoog on the stem: one landvastoog, stood along the stem line on the outside."""
    n, outside, inside = spiegel_plane(mesh_dir)
    V, N, F, _ = cad.load(LANDVASTOGEN[0], mesh_dir)
    a = np.array([0.0, 1.0, 0.0]); a -= (a @ n) * n; a /= np.linalg.norm(a)      # along the eye, in the plate
    w = np.cross(a, n)
    o = (V.min(0) + V.max(0)) / 2; o = o - (o @ n - inside) * n                  # under its middle, on the plate
    at, t = stem_line(mesh_dir, SLEEPOOG_Z)
    m = np.array([t[2], 0.0, -t[0]])                                             # out of the hull: forward and down
    basis = np.column_stack([t, m, np.cross(t, m)])                              # where a, n and w go
    local = np.column_stack([(V - o) @ a, (V - o) @ n, (V - o) @ w])
    return at + local @ basis.T, np.column_stack([N @ a, N @ n, N @ w]) @ basis.T, F


def build(mesh_dir):
    n, outside, inside = spiegel_plane(mesh_dir)
    middle = (outside + inside) / 2
    Vs, Ns, Fs, count = [], [], [], 0
    for handle in LANDVASTOGEN:
        V, N, F, _ = cad.load(handle, mesh_dir)
        V = V - 2 * np.outer(V @ n - middle, n)          # mirrored in the middle plane of the plate
        N = N - 2 * np.outer(N @ n, n)
        Vs.append(V); Ns.append(N); Fs.append(F[:, ::-1] + count); count += len(V)   # a mirror turns the winding
    return [("sleepogen", "Sleepogen", "beslag", "verzinkt", (np.vstack(Vs), np.vstack(Ns), np.vstack(Fs))),
            ("sleepoog_boeg", "Sleepoog", "beslag", "verzinkt", bow_eye(mesh_dir))]
