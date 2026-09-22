"""Curved sails on the outline of the CAD sails.

The DWG models the sails as flat 0.1 mm solids. Here each sail is rebuilt as cloth on the same
outline (so it still fits mast, gaffel, giek and voorstag), finely triangulated, with UVs in the
sail's own plane so the viewer can paint seams, zeilteken and sail number onto it.

Both sails are exported flat with a bend weight per vertex (glTF attribute _BOLLING); the viewer
bends them, because the belly is always to leeward: it changes side when the boat tacks.
- Grootzeil: laced to mast, gaffel and giek, so its belly vanishes along those three edges. The
  weight is the offset in metres at full depth; the battens carry the same weights.
- Fok: a flat triangle bent by the wind (single curvature); the weight is 0..1, the viewer sets
  the depth, which also depends on the course.

Seams follow the zeilplan of the Vlettenboek (p. 60): cross-cut panels of 90 cm cloth,
perpendicular to the straight line clew -> head/peak. Zeiltekens follow p. 58: lelie + V 38 cm
wide, cijfers 30 x 20 cm with 5 cm stroke, starboard side highest.

All coordinates here are DWG millimetres (X bow, Y port, Z up).
"""
import numpy as np
from scipy.spatial import Delaunay

from outline import boundary_loops, single_skin_faces
from parts import FOK_TACK, FOK_TACK_CAD

GRID = 55.0          # mm, mesh spacing
LIJK = 60.0          # mm, width of the tape along the edges (Vlettenboek p. 58)
HOEK = 180.0         # mm, size of the reinforcement patch in a corner


def _sub_polyline(pts, s0, s1):
    """The stretch of a polyline between path lengths s0 and s1 (ends interpolated)."""
    seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
    cum = np.concatenate([[0.0], np.cumsum(seg)])
    s1 = min(s1, cum[-1])
    at = lambda t: np.array([np.interp(t, cum, pts[:, k]) for k in range(pts.shape[1])])
    inner = pts[(cum > s0 + 1e-6) & (cum < s1 - 1e-6)]
    return np.vstack([at(s0), inner, at(s1)])


def _inside(poly, pts):
    """Even-odd point in polygon for an (n,2) polygon and (m,2) points."""
    x, y = pts[:, 0], pts[:, 1]
    inside = np.zeros(len(pts), bool)
    a = poly; b = np.roll(poly, -1, axis=0)
    for (x0, y0), (x1, y1) in zip(a, b):
        hit = ((y0 > y) != (y1 > y)) & (x < (x1 - x0) * (y - y0) / (y1 - y0 + 1e-30) + x0)
        inside ^= hit
    return inside


def _span(poly, v):
    """Min and max u of the polygon on each horizontal line v (arrays)."""
    a = poly; b = np.roll(poly, -1, axis=0)
    lo = np.full(len(v), np.inf); hi = np.full(len(v), -np.inf)
    for (x0, y0), (x1, y1) in zip(a, b):
        if abs(y1 - y0) < 1e-9:
            continue
        t = (v - y0) / (y1 - y0)
        ok = (t >= 0) & (t <= 1)
        x = x0 + t * (x1 - x0)
        lo = np.where(ok, np.minimum(lo, x), lo); hi = np.where(ok, np.maximum(hi, x), hi)
    return lo, hi


def _resample(poly, step):
    out = []
    for p, q in zip(poly, np.roll(poly, -1, axis=0)):
        n = max(1, int(np.ceil(np.linalg.norm(q - p) / step)))
        out.extend(p + (q - p) * (k / n) for k in range(n))
    return np.array(out)


def _resample_open(pts, step):
    out = [pts[0]]
    for p, q in zip(pts[:-1], pts[1:]):
        n = max(1, int(np.ceil(np.linalg.norm(q - p) / step)))
        out.extend(p + (q - p) * (k / n) for k in range(1, n + 1))
    return np.array(out)


def _clip_line(poly, p, d):
    """Segments of the infinite line p + t d that lie inside the polygon."""
    ts = []
    for a, b in zip(poly, np.roll(poly, -1, axis=0)):
        e = b - a
        den = d[0] * e[1] - d[1] * e[0]
        if abs(den) < 1e-12:
            continue
        t = ((a[0] - p[0]) * e[1] - (a[1] - p[1]) * e[0]) / den
        s = ((a[0] - p[0]) * d[1] - (a[1] - p[1]) * d[0]) / den
        if 0 <= s <= 1:
            ts.append(t)
    ts.sort()
    return [(p + d * t0, p + d * t1) for t0, t1 in zip(ts[::2], ts[1::2]) if t1 - t0 > 1.0]


class Sail:
    def __init__(self, V, F, depth, foot_attached):
        F, n = single_skin_faces(V, F)
        if n[1] < 0:
            n = -n                                   # towards port (+Y), the leeward side here
        self.n = n / np.linalg.norm(n)
        loop = boundary_loops(V, F)[0]
        self.origin = loop.mean(0)
        up = np.array([0.0, 0.0, 1.0]); ev = up - (up @ self.n) * self.n
        self.ev = ev / np.linalg.norm(ev)
        self.eu = np.cross(self.ev, self.n)          # in-plane, pointing aft: luff -> leech
        self.poly = self.to2d(loop)
        self.lo = self.poly.min(0); self.hi = self.poly.max(0)
        self.depth, self.foot_attached = depth, foot_attached

    def to2d(self, P):
        d = P - self.origin
        return np.stack([d @ self.eu, d @ self.ev], axis=1)

    def camber(self, uv):
        """Belly of a sail laced to its spars: offset along the sail normal (mm)."""
        if not self.depth:
            return np.zeros(len(uv))
        lo, hi = _span(self.poly, uv[:, 1])
        chord = np.maximum(hi - lo, 1e-6)
        s = np.clip((uv[:, 0] - lo) / chord, 0, 1)
        shape = s * (1 - s) ** 1.5 / 0.18590         # max 1 at 40 % of the chord
        out = self.depth * chord * shape
        if self.foot_attached:                       # laced to the giek: no belly at the foot
            out *= 1 - np.exp(-(uv[:, 1] - self.lo[1]) / 380.0)
        return np.where(np.isfinite(out), out, 0.0)

    def bend_weights(self, P, tack, head, clew):
        """Weights 0..1 for a sail that is a flat triangle bent by the wind (the fok): zero along
        the luff and at the clew, constant along lines parallel to the luff. That is a bend with
        single curvature - the foot and the leech bow out, the cloth does not bulge."""
        t, h, c = self.to2d(np.array([tack, head, clew]))
        luff = (h - t) / np.linalg.norm(h - t); normal = np.array([-luff[1], luff[0]])
        reach = (c - t) @ normal
        a = np.clip(((P - t) @ normal) / reach, 0.0, 1.0)      # 0 on the luff, 1 at the clew
        w = a * (1 - a) ** 1.2
        return w / (0.4545 * (1 - 0.4545) ** 1.2), abs(float(reach))   # maximum 1 at 45 % of the way

    def to3d(self, uv, lift=0.0):
        """Flat sail (the belly is applied by the viewer); lift offsets battens off the cloth."""
        return self.origin + uv[:, :1] * self.eu + uv[:, 1:2] * self.ev + lift * self.n

    def uv01(self, uv):
        return (uv - self.lo) / (self.hi - self.lo)

    def mesh(self, poly=None, lift=0.0, grid=GRID):
        poly = self.poly if poly is None else poly
        lo, hi = poly.min(0), poly.max(0)
        gx, gy = np.meshgrid(np.arange(lo[0], hi[0], grid), np.arange(lo[1], hi[1], grid))
        pts = np.stack([gx.ravel(), gy.ravel()], axis=1)
        border = _resample(poly, grid)
        keep = _inside(poly, pts)
        # drop grid points hugging the border: they make sliver triangles
        if keep.any():
            d = np.min(np.linalg.norm(pts[keep][:, None, :] - border[None, :, :], axis=2), axis=1)
            idx = np.flatnonzero(keep); keep[idx[d < grid * 0.45]] = False
        P = np.vstack([border, pts[keep]])
        tri = Delaunay(P).simplices
        centroid = P[tri].mean(axis=1)
        tri = tri[_inside(poly, centroid) & _inside(self.poly, centroid)]
        V3 = self.to3d(P, lift)
        # wind triangles so they face +n (port); compute smooth normals
        fn = np.cross(V3[tri[:, 1]] - V3[tri[:, 0]], V3[tri[:, 2]] - V3[tri[:, 0]])
        flip = fn @ self.n < 0
        tri[flip] = tri[flip][:, ::-1]; fn[flip] *= -1
        N = np.zeros_like(V3)
        for k in range(3):
            np.add.at(N, tri[:, k], fn)
        N /= np.maximum(np.linalg.norm(N, axis=1, keepdims=True), 1e-12)
        return V3, N, tri, self.uv01(P), self.camber(P) / 1000.0     # last: belly in metres

    # -- named edges (lijken) and corners (hoeken) as thin parts lying on the cloth
    def _edges(self, corners):
        """corners: {name: DWG point}. Returns [(name_a, name_b, 2D polyline from a to b)] going
        round the outline."""
        idx = {name: int(np.argmin(np.linalg.norm(self.poly - self.to2d(np.array([p]))[0], axis=1)))
               for name, p in corners.items()}
        order = sorted(idx, key=idx.get)
        n = len(self.poly); out = []
        for a, b in zip(order, order[1:] + order[:1]):
            i, j = idx[a], idx[b]
            ring = np.arange(i, j + 1) if j > i else np.concatenate([np.arange(i, n), np.arange(0, j + 1)])
            out.append((a, b, self.poly[ring]))
        return out

    def _inward(self, pts):
        """Unit normals of a polyline, pointing into the sail."""
        t = np.gradient(pts, axis=0); t /= np.maximum(np.linalg.norm(t, axis=1, keepdims=True), 1e-12)
        nrm = np.stack([-t[:, 1], t[:, 0]], axis=1)
        if ((self.poly.mean(0) - pts.mean(0)) @ nrm.mean(0)) < 0:
            nrm = -nrm
        return nrm

    def edge_strip(self, pts):
        """Polygon of the tape along an edge, kept clear of the corner patches."""
        length = np.linalg.norm(np.diff(pts, axis=0), axis=1).sum()
        mid = _resample_open(_sub_polyline(pts, HOEK * 0.8, length - HOEK * 0.8), GRID)
        return np.vstack([mid, (mid + LIJK * self._inward(mid))[::-1]])

    def corner_patch(self, before, after):
        """Polygon of a corner patch: before ends in the corner, after starts in it."""
        corner = after[0]
        a = _sub_polyline(after, 0.0, HOEK); b = _sub_polyline(before[::-1], 0.0, HOEK)
        va, vb = a[-1] - corner, b[-1] - corner
        ta, tb = np.arctan2(va[1], va[0]), np.arctan2(vb[1], vb[0])
        sweep = (tb - ta + np.pi) % (2 * np.pi) - np.pi                   # the short way round: inside the sail
        ks = np.linspace(0, 1, 9)[1:-1]
        radius = np.linalg.norm(va) + ks * (np.linalg.norm(vb) - np.linalg.norm(va))
        arc = corner + np.stack([radius * np.cos(ta + ks * sweep), radius * np.sin(ta + ks * sweep)], axis=1)
        return np.vstack([a, arc, b[::-1][:-1]])

    def overlay(self, poly, lift, weights):
        """Both faces of a thin part lying on the sail: [(V, N, F, W, UV)] for port and starboard."""
        faces = []
        for side in (1.0, -1.0):
            V3, N, F, uv, W = self.mesh(poly, lift=lift * side, grid=GRID * 0.6)
            if weights is not None:
                W = weights(self.lo + uv * (self.hi - self.lo))
            if side < 0:
                F = F[:, ::-1]; N = -N
            faces.append((V3, N, F, W, None))
        return faces

    def rect(self, x, z, width, height):
        """Rectangle in the sail plane from the DWG (x, z) of its top centre."""
        c = self.to2d(np.array([[x, self.origin[1], z]]))[0]
        return np.array([[c[0] - width / 2, c[1] - height], [c[0] + width / 2, c[1] - height],
                         [c[0] + width / 2, c[1]], [c[0] - width / 2, c[1]]])

    def decal(self, rect, lift, side, mirror_u=False):
        """One face of a patch lying on the cloth, with UVs local to the patch so the viewer can
        paint just that patch. side +1 faces port, -1 starboard (seen from there the artwork has
        to be mirrored, hence mirror_u)."""
        V3, N, F, uv, W = self.mesh(rect, lift=lift * side, grid=GRID * 0.5)
        P = self.lo + uv * (self.hi - self.lo)
        lo, hi = rect.min(0), rect.max(0)
        local = (P - lo) / (hi - lo)
        if mirror_u:
            local = np.column_stack([1.0 - local[:, 0], local[:, 1]])
        if side < 0:
            F = F[:, ::-1]; N = -N
        return V3, N, F, W, local

    def seams(self, clew, head, first, spacing):
        """Panel seams as UV segments: perpendicular to the line clew -> head."""
        c, h = self.to2d(np.array([clew, head]))
        d = (h - c) / np.linalg.norm(h - c); perp = np.array([-d[1], d[0]])
        segments = []
        t = first
        while t < np.linalg.norm(h - c):
            for a, b in _clip_line(self.poly, c + d * t, perp):
                segments.append([*self.uv01(a[None])[0].round(5).tolist(), *self.uv01(b[None])[0].round(5).tolist()])
            t += spacing
        return segments

    def info(self, **extra):
        size = (self.hi - self.lo) / 1000.0
        return dict(breedte_m=round(float(size[0]), 4), hoogte_m=round(float(size[1]), 4),
                    omtrek=self.uv01(self.poly).round(5).tolist(), **extra)

    def place(self, x, z):
        """UV of the point of the sail plane that lies at DWG (x, z) - for flat-in-Y placement."""
        p = np.array([[x, self.origin[1], z]])
        return self.uv01(self.to2d(p))[0].round(5).tolist()


def drag_corner(V, corner, others, to):
    """Move one corner of a flat sail to `to`, the cloth following in proportion: each point by its
    barycentric weight of that corner in the triangle of the three corners. An affine map, so the
    sail stays flat and the other two corners stay where they are."""
    b, c = others
    A = np.column_stack([corner - b, c - b])
    w = np.linalg.lstsq(A, (V - b).T, rcond=None)[0][0]
    return V + w[:, None] * (np.asarray(to) - corner)


def build(mesh_dir):
    """Returns {handle: dict(V, N, F, UV, extras[, W])} replacing the CAD sail bodies."""
    def load(handle):
        return np.load(mesh_dir / f"ZeilSolids_{handle}.npz")

    result = {}

    d = load("5603"); V = d["V"].astype(float); F = d["F"].astype(int)
    main = Sail(V, F, depth=0.085, foot_attached=True)
    clew, peak = np.array([1594.4, 0, 1331.6]), np.array([2476.2, 0, 5932.9])
    Vm, Nm, Fm, UVm, Wm = main.mesh()
    extras = main.info(
        naden=main.seams(clew, peak, first=442.0, spacing=901.0),
        # zeilteken: lelie + V, 38 cm wide; same place on both sides (it is symmetric).
        # cijfers 30 x 20 cm: stuurboord het hoogst (Vlettenboek p. 58)
        teken=dict(midden_boven=main.place(3050.0, 4600.0), breedte_m=0.38),
        cijfers=dict(sb_midden_boven=main.place(3050.0, 3950.0), bb_midden_boven=main.place(3050.0, 3550.0),
                     hoogte_m=0.30, breedte_m=0.20, tussenruimte_m=0.06),
        bolling=dict(normaal=[0.0, 0.0, -1.0]),          # model axes: towards port
    )
    result["5603"] = dict(V=Vm, N=Nm, F=Fm, UV=UVm, W=Wm, extras=extras)

    # battens: CAD regions lie flat on either face of the sail; they bend along with the cloth
    for h in ("5607", "5608", "5609", "560A", "560B", "560C"):
        b = load(h); Vb = b["V"].astype(float); Fb = b["F"].astype(int)
        loop = boundary_loops(Vb, Fb)[0]
        side = 1.0 if Vb[:, 1].mean() > 0 else -1.0
        Vb2, Nb2, Fb2, _, Wb = main.mesh(main.to2d(loop), lift=2.5 * side, grid=40.0)
        if side < 0:
            Fb2 = Fb2[:, ::-1]; Nb2 = -Nb2
        result[h] = dict(V=Vb2, N=Nb2, F=Fb2, UV=None, W=Wb, extras=None)

    # fok: exported flat, with bend weights. The viewer bends it: fuller off the wind, flat while
    # it crosses the boat, and the other way round when it is set to windward (fok te loevert).
    # The tack comes down to where the harpje of the kettinkje hangs (parts.HALS_SHIFT).
    tack_f = np.array(FOK_TACK)
    clew_f, head_f = np.array([4268.7, 722.2, 1134.6]), np.array([4580.0, -0.7, 5090.8])
    d = load("5434"); F = d["F"].astype(int)
    V = drag_corner(d["V"].astype(float), np.array(FOK_TACK_CAD), (head_f, clew_f), tack_f)
    fok = Sail(V, F, depth=0.0, foot_attached=False)
    Vf, Nf, Ff, UVf, _ = fok.mesh()
    Wf, reach = fok.bend_weights(fok.lo + UVf * (fok.hi - fok.lo), tack_f, head_f, clew_f)
    n = fok.n
    result["5434"] = dict(V=Vf, N=Nf, F=Ff, UV=UVf, W=Wf, extras=fok.info(
        naden=fok.seams(clew_f, head_f, first=606.0, spacing=925.0),
        bolling=dict(normaal=[round(float(n[0]), 5), round(float(n[2]), 5), round(float(-n[1]), 5)],   # model axes, to leeward (port)
                     reikwijdte_m=round(reach / 1000.0, 4))))                                    # luff -> clew
    # lijken and hoeken: named parts of their own, lying on the cloth
    def named(sail, corners, names, weights):
        edges = sail._edges(corners)
        parts = []
        for a, b, pts in edges:
            pid, naam = names[frozenset((a, b))]
            parts.append((pid, naam, "zeil_lijk", sail.overlay(sail.edge_strip(pts), 1.2, weights)))
        for (_, _, before), (corner, _, after) in zip(edges[-1:] + edges[:-1], edges):
            pid, naam = names[corner]
            parts.append((pid, naam, "zeil_hoek", sail.overlay(sail.corner_patch(before, after), 2.0, weights)))
        return parts

    tack = np.array([4194.4, 0.0, 1331.6]); throat = np.array([4194.4, 0.0, 3981.6])
    extra = named(main, dict(hals=tack, klauw=throat, top=peak, schoot=clew), {
        frozenset(("hals", "klauw")): ("grootzeil_voorlijk", "Voorlijk grootzeil"),
        frozenset(("klauw", "top")): ("grootzeil_bovenlijk", "Bovenlijk grootzeil"),
        frozenset(("top", "schoot")): ("grootzeil_achterlijk", "Achterlijk grootzeil"),
        frozenset(("schoot", "hals")): ("grootzeil_onderlijk", "Onderlijk grootzeil"),
        "hals": ("grootzeil_halshoek", "Halshoek grootzeil"), "klauw": ("grootzeil_klauwhoek", "Klauwhoek"),
        "top": ("grootzeil_tophoek", "Tophoek grootzeil (piek)"), "schoot": ("grootzeil_schoothoek", "Schoothoek grootzeil"),
    }, None)
    fok_w = lambda P: fok.bend_weights(P, tack_f, head_f, clew_f)[0]
    extra += named(fok, dict(hals=tack_f, top=head_f, schoot=clew_f), {
        frozenset(("hals", "top")): ("fok_voorlijk", "Voorlijk fok"),
        frozenset(("top", "schoot")): ("fok_achterlijk", "Achterlijk fok"),
        frozenset(("schoot", "hals")): ("fok_onderlijk", "Onderlijk fok"),
        "hals": ("fok_halshoek", "Halshoek fok"), "top": ("fok_tophoek", "Tophoek fok"),
        "schoot": ("fok_schoothoek", "Schoothoek fok"),
    }, fok_w)
    # zeilteken and zeilnummer: parts of their own, so they can be picked and named. The viewer
    # paints them; sizes from the Vlettenboek p. 58 (lelie + V 38 cm wide, cijfers 30 x 20 x 5 cm).
    TEKEN_W = 380.0; TEKEN_H = TEKEN_W * 464 / 326          # aspect of the emblem artwork
    NUMMER_W = 4 * 200.0 + 3 * 60.0; NUMMER_H = 300.0       # room for four digits
    r_teken = main.rect(3050.0, 4600.0, TEKEN_W, TEKEN_H)
    extra.append(("grootzeil_zeilteken", "Zeilteken", "zeil_teken",
                  [main.decal(r_teken, 2.6, 1.0), main.decal(r_teken, 2.6, -1.0, mirror_u=True)]))
    extra.append(("grootzeil_zeilnummer", "Zeilnummer", "zeil_nummer",
                  [main.decal(main.rect(3050.0, 3550.0, NUMMER_W, NUMMER_H), 2.6, 1.0),
                   main.decal(main.rect(3050.0, 3950.0, NUMMER_W, NUMMER_H), 2.6, -1.0, mirror_u=True)]))
    result["_extra"] = extra
    return result
