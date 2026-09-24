"""The tessellated CAD bodies, read once: every module that measures or reshapes a body loads it here.

build/tessellation_report.json lists every body (handle, layer, file name, shells); its mesh is
build/mesh/<name>.npz. Both are read on first use and kept, and the arrays handed out are read
only, since they are shared between every caller: a caller that wants to change one copies it.
"""
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
MESH = ROOT / "build" / "mesh"

_report = None
_names = {}
_bodies = {}


def report():
    """The rows of the tessellation report, in the order the bodies were tessellated."""
    global _report
    if _report is None:
        _report = json.loads((ROOT / "build" / "tessellation_report.json").read_text())
    return _report


def name(handle):
    """The file name of a body: its layer and handle, e.g. StagSolids_516A."""
    if not _names:
        _names.update({r["handle"]: r["name"] for r in report()})
    return _names[handle]


def load(handle, mesh_dir=MESH):
    """V, N, F, G of one CAD body in DWG mm: vertices, exact surface normals, triangles, and the
    B-rep face every triangle comes from."""
    key = (str(mesh_dir), handle)
    if key not in _bodies:
        d = np.load(Path(mesh_dir) / f"{name(handle)}.npz")
        arrays = (d["V"].astype(np.float64), d["N"].astype(np.float64), d["F"].astype(np.int64), d["G"].astype(np.int64))
        for a in arrays:
            a.setflags(write=False)
        _bodies[key] = arrays
    return _bodies[key]
