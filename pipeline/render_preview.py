"""Headless preview renderer for the cached meshes (orthographic, numpy z-buffer splatting).

    uv run --with numpy --with pillow python3 pipeline/render_preview.py out.png [options] [name-filter ...]

Options: --view side|top|bow|stern|iso|iso2   --width 1800   --color layer|body|normal
         --zoom-to-filter   (frame only the filtered bodies but draw the rest faintly)
"""
import colorsys
import sys

import numpy as np
from PIL import Image

import cad

LAYER_COLORS = {
    "PartSolids-Long Shell": (0.30, 0.45, 0.70), "PartSolids-Frame": (0.80, 0.45, 0.25),
    "StiffenerSolids": (0.85, 0.75, 0.30), "Contours": (0.55, 0.75, 0.35),
    "BuikdenningSolids": (0.70, 0.55, 0.35), "DoftSolids": (0.60, 0.40, 0.22),
    "MastSolids": (0.75, 0.58, 0.35), "GiekSolids": (0.75, 0.58, 0.35), "GaffelSolids": (0.75, 0.58, 0.35),
    "HelmstokSolids": (0.60, 0.40, 0.22), "RiemSolids": (0.80, 0.65, 0.42),
    "ZeilSolids": (0.93, 0.91, 0.84), "StagSolids": (0.35, 0.35, 0.38),
}

VIEWS = {  # (right, up) in DWG axes: X = bow, Y = port, Z = up
    "side": ((1, 0, 0), (0, 0, 1)), "top": ((1, 0, 0), (0, 1, 0)),
    "bow": ((0, 1, 0), (0, 0, 1)), "stern": ((0, -1, 0), (0, 0, 1)),
}


def basis(view):
    if view in VIEWS:
        r, u = (np.array(v, float) for v in VIEWS[view])
    else:
        az, el = {"iso": (-55, 22), "iso2": (125, 28), "iso3": (-130, 35), "under": (-50, -30)}[view]
        az, el = np.radians(az), np.radians(el)
        f = np.array([np.cos(el) * np.cos(az), np.cos(el) * np.sin(az), np.sin(el)])   # towards the viewer
        r = np.cross([0, 0, 1], f); r /= np.linalg.norm(r); u = np.cross(f, r)
    return r, u, np.cross(r, u)


def load(filters):
    for row in cad.report():
        V, N, F, _ = cad.load(row["handle"])
        yield row, V, N, F, (not filters or any(f in row["name"] for f in filters))


def render(out, view="iso", width=1800, color="layer", filters=(), zoom=False, margin=0.04):
    r, u, f = basis(view)
    items = list(load(filters))
    sel = [it for it in items if it[4]] if (filters and zoom) else [it for it in items if it[4] or zoom]
    frame = [it for it in items if it[4]]
    P = np.concatenate([it[1] for it in frame])
    lo = np.array([(P @ r).min(), (P @ u).min()]); hi = np.array([(P @ r).max(), (P @ u).max()])
    span = (hi - lo).max() * (1 + 2 * margin); lo -= (hi - lo) * 0 + span * margin * np.array([1, 1])
    scale = width / ((hi[0] - lo[0]) + span * margin)
    height = int(np.ceil(((hi[1] - lo[1]) + span * margin) * scale))
    img = np.ones((height, width, 3)) * np.array([0.96, 0.97, 0.98]); depth = np.full((height, width), -1e18)
    light = np.array([0.35, -0.45, 0.82]); light /= np.linalg.norm(light)
    rng = np.random.default_rng(1)
    draw = items if (zoom or not filters) else frame
    for k, (row, V, N, F, chosen) in enumerate(draw):
        if color == "body":
            base = np.array(colorsys.hsv_to_rgb((k * 0.381966) % 1, 0.65, 0.9))
        else:
            base = np.array(LAYER_COLORS.get(row["layer"], (0.6, 0.6, 0.6)))
        if filters and not chosen:
            base = base * 0.25 + 0.72
        a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]
        area = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2
        n = np.maximum(1, np.ceil(area * scale * scale * 2.2)).astype(int)
        idx = np.repeat(np.arange(len(F)), n)
        w = rng.random((len(idx), 2)); flip = w.sum(1) > 1; w[flip] = 1 - w[flip]
        w0 = 1 - w[:, 0] - w[:, 1]
        pts = a[idx] * w0[:, None] + b[idx] * w[:, 0:1] + c[idx] * w[:, 1:2]
        nrm = N[F[idx, 0]] * w0[:, None] + N[F[idx, 1]] * w[:, 0:1] + N[F[idx, 2]] * w[:, 1:2]
        nrm /= np.maximum(1e-9, np.linalg.norm(nrm, axis=1, keepdims=True))
        facing = nrm @ f
        if color == "normal":                      # red where the surface faces away from its normal
            col = np.where(facing[:, None] >= 0, np.array([[0.55, 0.75, 0.55]]), np.array([[0.9, 0.2, 0.2]]))
            shade = 0.55 + 0.45 * np.abs(nrm @ light)
        else:
            col = np.broadcast_to(base, (len(idx), 3))
            nn = np.where(facing[:, None] >= 0, nrm, -nrm)
            shade = 0.38 + 0.62 * np.clip(nn @ light, 0, 1)
        px = ((pts @ r - lo[0]) * scale).astype(int); py = height - 1 - ((pts @ u - lo[1]) * scale).astype(int)
        ok = (px >= 0) & (px < width) & (py >= 0) & (py < height)
        px, py, d, rgb = px[ok], py[ok], (pts @ f)[ok], (col * shade[:, None])[ok]
        order = np.argsort(d)
        px, py, d, rgb = px[order], py[order], d[order], rgb[order]
        win = d >= depth[py, px]
        px, py, d, rgb = px[win], py[win], d[win], rgb[win]
        depth[py, px] = d; img[py, px] = rgb      # sorted ascending: the nearest sample is written last
    Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(out)
    return out


if __name__ == "__main__":
    args = sys.argv[1:]
    opts = {"view": "iso", "width": 1800, "color": "layer"}
    zoom = False; rest = []
    i = 0
    while i < len(args):
        if args[i] == "--zoom-to-filter":
            zoom = True
        elif args[i].startswith("--"):
            opts[args[i][2:]] = args[i + 1]; i += 1
        else:
            rest.append(args[i])
        i += 1
    print(render(rest[0], opts["view"], int(opts["width"]), opts["color"], tuple(rest[1:]), zoom))
