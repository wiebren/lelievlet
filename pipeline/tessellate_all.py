"""Tessellate every ACIS body of the official lelievlet DWG into a cached mesh.

    uv run --python 3.12 --with "cadquery-ocp>=7.8,<7.9" --with ezdxf --with numpy \
        python3 pipeline/tessellate_all.py [--force] [name-filter]

Output: build/mesh/<Layer>_<handle>.npz (V, N, F in DWG millimetres + face ids) and
build/tessellation_report.json.
"""
import json
import sys
import time
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).parent))
from acis_occ import AcisBody, tessellate  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
CAD = ROOT / "reference" / "cad"
OUT = ROOT / "build" / "mesh"
BUDGET = 12000          # triangles per body before the tessellation is coarsened


def deflection(size):
    """Finer tessellation for small fittings, coarser for the big plates (mm)."""
    diag = float(np.linalg.norm(size))
    return min(1.0, max(0.03, diag * 0.0015))


def main():
    force = "--force" in sys.argv
    flt = [a for a in sys.argv[1:] if not a.startswith("--")]
    OUT.mkdir(parents=True, exist_ok=True)
    index = json.loads((CAD / "solids_index.json").read_text())
    report_path = ROOT / "build" / "tessellation_report.json"
    report = {r["file"]: r for r in json.loads(report_path.read_text())} if report_path.exists() else {}
    t_all = time.time()
    for rec in index:
        name = Path(rec["file"]).stem
        if flt and not any(f in name for f in flt):
            continue
        out = OUT / f"{name}.npz"
        if out.exists() and not force:
            continue
        t = time.time()
        row = dict(file=rec["file"], name=name, layer=rec["layer"], handle=rec["handle"], type=rec["type"])
        try:
            body = AcisBody(CAD / rec["file"])
            shape = body.shape()
            st = body.stats
            row.update(faces=st.faces, built=st.built, skipped=st.skipped, shells=st.shells, closed_shells=st.closed_shells)
            if shape is None:
                raise RuntimeError("nothing built")
            # Ropes and wires are long sweeps of a tiny circle: the default angular tolerance
            # explodes on them. Coarsen step by step until the body fits its budget.
            lin = deflection(rec["size"])
            for ang, lin_k in ((0.35, 1.0), (0.6, 2.0), (0.9, 4.0)):
                V, N, F, G = tessellate(shape, linear=lin * lin_k, angular=ang, with_face_ids=True)
                if len(F) <= BUDGET:
                    break
            row["angular"] = ang
            if len(F) == 0:
                raise RuntimeError("empty mesh")
            np.savez_compressed(out, V=V.astype(np.float32), N=N.astype(np.float32), F=F.astype(np.uint32), G=G.astype(np.uint32))
            row.update(vertices=int(len(V)), triangles=int(len(F)),
                       mesh_min=V.min(0).round(1).tolist(), mesh_max=V.max(0).round(1).tolist())
        except Exception as ex:
            row["error"] = f"{type(ex).__name__}: {ex}"[:300]
        row["seconds"] = round(time.time() - t, 2)
        report[rec["file"]] = row
        flag = "ERROR " + row["error"] if "error" in row else f"{row['built']}/{row['faces']} faces, {row['triangles']} tris" + (f", skipped {row['skipped']}" if row["skipped"] else "")
        print(f"{name:42s} {flag}  [{row['seconds']}s]", flush=True)
    report_path.write_text(json.dumps(list(report.values()), indent=1))
    rows = list(report.values())
    print(f"\n{len(rows)} bodies in report, {sum('error' in r for r in rows)} errors, "
          f"faces built {sum(r.get('built', 0) for r in rows)}/{sum(r.get('faces', 0) for r in rows)}, "
          f"{sum(r.get('triangles', 0) for r in rows)} triangles, {time.time() - t_all:.0f}s")


if __name__ == "__main__":
    main()
