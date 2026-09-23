"""A mesh made lighter: fewer triangles for the same shape, as close to it as asked.

The B-rep faces of a CAD body meet at seams with their vertices doubled. Where the two sides of a
seam point the same way (a round bar's faces meeting) they are welded, or every such seam would be
a border the simplifier has to keep; where they do not (the corner of a block's cheek) they stay
apart, so the edge stays sharp. The vertices that are kept keep the CAD's own normals, and the
outside stays the CAD's.
"""
import numpy as np

CREASE = np.cos(np.radians(30))   # normals further apart than this meet at an edge, which stays sharp


def lighter(V, N, F, triangles=None, error=None):
    """(V, N, F) made lighter, in the same coordinates: brought down to about `triangles`, or - with
    `error`, in the units of V - as far as it goes without the surface moving more than that."""
    import meshoptimizer as meshopt
    # weld where the position is the same and the normals are within CREASE of each other
    _, at, same = np.unique(np.round(V, 4), axis=0, return_index=True, return_inverse=True)
    same = same.reshape(-1)
    inverse = np.arange(len(V))
    order = np.argsort(same, kind="stable")
    starts = np.flatnonzero(np.r_[True, np.diff(same[order]) != 0, True])
    for a, b in zip(starts[:-1], starts[1:]):
        if b - a < 2:
            continue
        group = order[a:b]; kept = []
        for i in group:
            for k in kept:
                if N[i] @ N[k] > CREASE:
                    inverse[i] = k; break
            else:
                kept.append(i)
    first, inverse = np.unique(inverse, return_inverse=True)
    Vw, Nw = V[first], N[first]
    Fw = inverse[F].astype(np.uint32)
    Fw = Fw[(Fw[:, 0] != Fw[:, 1]) & (Fw[:, 1] != Fw[:, 2]) & (Fw[:, 0] != Fw[:, 2])]
    c = Vw.mean(0)                                                # small numbers for the simplifier
    out = np.zeros(Fw.size, dtype=np.uint32)
    if error is not None:
        n = meshopt.simplify(out, Fw.reshape(-1), (Vw - c).astype(np.float32), target_index_count=36,
                             target_error=error, options=meshopt.SIMPLIFY_ERROR_ABSOLUTE)
    else:
        n = meshopt.simplify(out, Fw.reshape(-1), (Vw - c).astype(np.float32), target_index_count=triangles * 3, target_error=0.02)
    Fs = out[:n].reshape(-1, 3).astype(np.int64)
    used = np.unique(Fs)
    remap = np.full(len(Vw), -1, np.int64); remap[used] = np.arange(len(used))
    Vs, Ns, Fs = Vw[used], Nw[used], remap[Fs]
    fn = np.cross(Vs[Fs[:, 1]] - Vs[Fs[:, 0]], Vs[Fs[:, 2]] - Vs[Fs[:, 0]])
    if (fn * Ns[Fs].mean(axis=1)).sum() < 0:                      # wound the other way round: keep the CAD's outside
        Fs = Fs[:, ::-1].copy()
    return Vs, Ns, Fs


def spread(V, F, n, seed=0):
    """n points spread evenly over the surface (V, F)."""
    rng = np.random.default_rng(seed)
    t = rng.random((n, 2)); t[t.sum(1) > 1] = 1 - t[t.sum(1) > 1]
    area = np.linalg.norm(np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]]), axis=1)
    k = rng.choice(len(F), n, p=area / area.sum())
    a, b, c = V[F[k, 0]], V[F[k, 1]], V[F[k, 2]]
    return a + (b - a) * t[:, :1] + (c - a) * t[:, 1:]


def off_by(V, F, Vb, Fb):
    """How far (Vb, Fb) lies from (V, F), in the units of V: (95th percentile, most). Points spread
    over the one, each against the nearest of many points spread over the other."""
    from scipy.spatial import cKDTree
    d = cKDTree(spread(V, F, 200_000, 0)).query(spread(Vb, Fb, 20_000, 1))[0]
    return np.percentile(d, 95), d.max()
