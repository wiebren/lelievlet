"""Boundary loops of a tessellated thin solid (used to recover sail outlines from the CAD)."""
import collections

import numpy as np


def single_skin_faces(V, F):
    fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    area = np.linalg.norm(fn, axis=1, keepdims=True); unit = fn / np.maximum(area, 1e-12)
    axis = np.linalg.eigh((unit * area).T @ unit)[1][:, -1]
    return F[(unit @ axis) > 0.5], axis


def boundary_loops(V, F, weld=0.05):
    """Closed boundary polylines, longest perimeter first."""
    key = np.round(V / weld).astype(np.int64)
    _, inv = np.unique(key, axis=0, return_inverse=True); inv = inv.ravel()
    pos = {}
    for i, k in enumerate(inv):
        pos.setdefault(k, V[i])
    count = collections.Counter()
    for a, b in ((0, 1), (1, 2), (2, 0)):
        for e in zip(inv[F[:, a]], inv[F[:, b]]):
            if e[0] != e[1]:
                count[tuple(sorted(e))] += 1
    adj = collections.defaultdict(list)
    for (a, b), c in count.items():
        if c == 1:
            adj[a].append(b); adj[b].append(a)
    loops, seen = [], set()
    for start in adj:
        if start in seen:
            continue
        loop, prev, cur = [start], None, start
        seen.add(start)
        while True:
            nxt = next((n for n in adj[cur] if n != prev and n not in seen), None)
            if nxt is None:
                break
            loop.append(nxt); seen.add(nxt); prev, cur = cur, nxt
        loops.append(np.array([pos[k] for k in loop]))
    perimeter = lambda L: np.linalg.norm(np.diff(np.vstack([L, L[:1]]), axis=0), axis=1).sum()
    return sorted(loops, key=perimeter, reverse=True)
