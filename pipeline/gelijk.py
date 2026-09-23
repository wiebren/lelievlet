"""Small CAD fittings made lighter, and what the CAD has more than once made from one.

Tessellated one by one, a small fitting gets the finest setting there is (tessellate_all.py: 0.1
mm), and a block of nine centimetres comes out at eight thousand triangles. Every body under
SMALL is brought down here as far as it goes without its surface moving more than ERROR; a few
bigger ones that are no better off get a setting of their own (EXTRA).

Bodies the CAD has twice or more - the sheaves and pins of the blocks, the pins of the harpjes,
the links of the kettinkje of the fok, the two roeiriemen - are made lighter once, and that one is put where
each of the others is: turned, moved, or mirrored. A body is taken for another's copy when their
surface areas and their spread along their own axes agree, and the one put in the other's place
lies on it to within the tessellation's own play.

    uv run --python 3.12 --with numpy --with scipy --with meshoptimizer python3 pipeline/gelijk.py
        every body this touches, before and after, and how far it moved (mm)
"""
import itertools
import json
from pathlib import Path

import numpy as np

from lighter import lighter, off_by, spread

ROOT = Path(__file__).resolve().parent.parent
SMALL = 250.0               # mm: the diagonal of a body's box, below which it is made lighter
ERROR = 0.15                # mm: how far its surface may move
EXTRA = {"5760": 0.5, "576B": 0.5}   # the roeiriemen: 2.8 m, and the one the other mirrored
SAME = dict(area=0.005, spread=0.3, mean=0.1, most=0.6)   # what "the same body" allows: relative, mm, mm, mm


def _pose(V, F):
    """Area-weighted middle, the axes of the spread of the surface (columns, smallest first), how
    far it spreads along each (mm), and its area."""
    a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
    area = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2
    mid = (a + b + c) / 3
    o = (mid * area[:, None]).sum(0) / area.sum()
    X = mid - o
    w, E = np.linalg.eigh((X * area[:, None]).T @ X / area.sum())
    return o, E, np.sqrt(np.maximum(w, 0)), area.sum()


class Lighter:
    """Called with each CAD body as it is loaded: (V, N, F) made lighter, or None to leave it."""

    def __init__(self):
        self.done = []          # the bodies made lighter so far: what a later copy is made from
        self.log = []           # (handle, triangles before, after, the one it is a copy of or None)

    def __call__(self, handle, V, N, F):
        span = float(np.linalg.norm(V.max(0) - V.min(0)))
        if span >= SMALL and handle not in EXTRA:
            return None
        o, E, spread, area = _pose(V, F)
        for ref in self.done:
            if abs(ref["area"] - area) > SAME["area"] * area or np.abs(ref["spread"] - spread).max() > max(SAME["spread"], 1e-3 * span):
                continue
            M = self._fit(ref, V, F, o, E, area)
            if M is None:
                continue
            Vs, Ns, Fs = ref["light"]
            Fo = Fs[:, ::-1].copy() if np.linalg.det(M) < 0 else Fs      # mirrored: wound back the right way
            self.log.append((handle, len(F), len(Fs), ref["handle"]))
            return (Vs - ref["o"]) @ M.T + o, Ns @ M.T, Fo
        light = lighter(V, N, F, error=EXTRA.get(handle, ERROR))
        self.done.append(dict(handle=handle, V=V, o=o, E=E, spread=spread, area=area, light=light))
        self.log.append((handle, len(F), len(light[2]), None))
        return light

    @staticmethod
    def _fit(ref, V, F, o, E, area):
        """The turn (or mirror) that puts ref on this body, or None. Each axis may point either way;
        where two spread alike the axes are not to be trusted, and only a plain move is tried. Ref's
        vertices are held against this body's surface: points spread over it, closer together than
        its own vertices lie on a big flat face."""
        from scipy.spatial import cKDTree
        n = int(np.clip(area / 0.25, 50_000, 1_000_000))              # a point every half millimetre or so
        tree = cKDTree(spread(V, F, n))
        gap = np.sqrt(area / n)                                       # how far apart those points lie
        s = ref["spread"]
        alike = abs(s[1] - s[0]) < 0.02 * s[1] or abs(s[2] - s[1]) < 0.02 * s[2]
        tries = [np.eye(3)] if alike else [E @ np.diag(d) @ ref["E"].T for d in itertools.product((1, -1), repeat=3)]
        best = None
        for M in tries:
            d = tree.query((ref["V"] - ref["o"]) @ M.T + o)[0]
            if best is None or d.mean() < best[0]:
                best = (d.mean(), d.max(), M)
        # the points' own spacing is play too
        return best[2] if best[0] < SAME["mean"] + 0.5 * gap and best[1] < SAME["most"] + 2 * gap else None

    def report(self):
        before = sum(b for _, b, _, _ in self.log); after = sum(a for _, _, a, _ in self.log)
        copies = sum(1 for *_, of in self.log if of)
        return f"{len(self.log)} bodies made lighter ({copies} of them copies of another): {before} -> {after} triangles"


def check(mesh_dir):
    report = json.loads((ROOT / "build" / "tessellation_report.json").read_text())
    from parts import DROP
    import harpjes
    skip = set(harpjes.PIN_OF) | set(DROP)
    light = Lighter()
    worst = []
    for row in report:
        p = mesh_dir / f"{row['name']}.npz"
        if not p.exists() or row["handle"] in skip:
            continue
        d = np.load(p)
        V, N, F = d["V"].astype(float), d["N"].astype(float), d["F"].astype(np.int64)
        out = light(row["handle"], V, N, F)
        if out is None:
            continue
        p95, most = off_by(V, F, out[0], out[2])
        h, before, after, of = light.log[-1]
        worst.append((most, h))
        print(f"  {h}: {before:5d} -> {after:5d}{f'  (copy of {of})' if of else '':18s}  off by {p95:.2f} mm (95%), {most:.2f} at most")
    print(light.report())
    print("furthest off:", ", ".join(f"{h} {m:.2f}" for m, h in sorted(worst, reverse=True)[:5]))


if __name__ == "__main__":
    check(ROOT / "build" / "mesh")
