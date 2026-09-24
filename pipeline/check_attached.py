"""Which CAD bodies touch nothing? For every body: the gap to the nearest other body.

Only fittings are checked (anything shorter than BIG). Their vertices and edges are measured
against the surfaces of everything around them, sampled every STEP mm, so a bolt standing in the
middle of a big plate is still found. Gaps are good to about STEP.
    uv run --python 3.12 --with numpy --with scipy python3 pipeline/check_attached.py [gap_mm]
"""
import sys

import numpy as np
from scipy.spatial import cKDTree

import cad
from parts import DROP, NUDGE, PARTS

REACH, STEP, BIG = 25.0, 1.5, 1500.0   # look this far round a body; sample spacing; bodies longer than this are skipped, mm


def edge_points(V, F):
    """Vertices of a body plus points every STEP mm along its edges."""
    T = V[F]
    E = np.concatenate([T[:, [0, 1]], T[:, [1, 2]], T[:, [2, 0]]])
    n = np.ceil(np.linalg.norm(E[:, 1] - E[:, 0], axis=1) / STEP).astype(int).clip(1, 400)
    out = [V]
    for k in np.unique(n):
        t = np.linspace(0, 1, k + 1)[None, :, None]
        e = E[n == k]
        out.append((e[:, None, 0] * (1 - t) + e[:, None, 1] * t).reshape(-1, 3))
    return np.unique(np.vstack(out).round(2), axis=0)


def surface_points(V, F, lo, hi):
    """Points every STEP mm on the triangles that reach into the box lo..hi, kept inside it."""
    T = V[F]
    T = T[(T.max(axis=1) >= lo).all(axis=1) & (T.min(axis=1) <= hi).all(axis=1)]
    if not len(T):
        return np.empty((0, 3))
    n = np.ceil(np.linalg.norm(T - np.roll(T, 1, axis=1), axis=2).max(axis=1) / STEP).astype(int).clip(1, 300)
    out = []
    for k in np.unique(n):
        i, j = np.meshgrid(np.arange(k + 1), np.arange(k + 1), indexing="ij")
        ok = i + j <= k
        u, w = (i[ok] / k)[None, :, None], (j[ok] / k)[None, :, None]
        t = T[n == k]
        P = (t[:, None, 0] * (1 - u - w) + t[:, None, 1] * u + t[:, None, 2] * w).reshape(-1, 3)
        out.append(P[((P >= lo) & (P <= hi)).all(axis=1)])
    return np.vstack(out)


def main():
    limit = float(sys.argv[1]) if len(sys.argv) > 1 else 3.0
    bodies = []
    for row in cad.report():
        V, _, F, _ = cad.load(row["handle"])
        if not len(F) or row["handle"] in DROP:
            continue
        V = V + np.array(NUDGE.get(row["handle"], (0, 0, 0)))
        bodies.append(dict(h=row["handle"], layer=row["layer"], V=V, F=F, lo=V.min(0), hi=V.max(0)))
    rows = []
    for a in bodies:
        if np.linalg.norm(a["hi"] - a["lo"]) > BIG:                # plating, spars, long ropes: not fittings
            continue
        Pa = edge_points(a["V"], a["F"])
        lo, hi = a["lo"] - REACH, a["hi"] + REACH
        best, who = np.inf, None
        for b in bodies:
            if b is a or (lo > b["hi"]).any() or (hi < b["lo"]).any():
                continue
            Pb = surface_points(b["V"], b["F"], lo, hi)
            if not len(Pb):
                continue
            d = cKDTree(Pb).query(Pa, distance_upper_bound=max(best, 1e-6))[0].min()
            if d < best:
                best, who = d, b["h"]
            if best < STEP:
                break
        rows.append((best, a["h"], a["layer"], who))
    name = lambda h: PARTS[h][0] if h in PARTS else "-"
    loose = sorted(r for r in rows if r[0] > limit)
    print(f"{len(rows)} fittings checked, {len(loose)} further than {limit} mm from every other body:\n")
    for gap, h, layer, who in loose:
        gap_txt = f"{gap:6.1f} mm" if np.isfinite(gap) else f"  > {REACH:.0f} mm"
        print(f"  {h}  {name(h):28s} {layer:24s} {gap_txt}  nearest {who or '-'} {name(who) if who else ''}")


if __name__ == "__main__":
    main()
