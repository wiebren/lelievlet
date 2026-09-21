"""Extract every ACIS body of '3D Model-binded.dwg' as a binary SAB file (sab/*.sab) and write
solids_index.json with a vertex bounding box (mm) per body.

The DWG stores ACIS as binary SAB. LibreDWG's DXF writer truncates it when converting to SAT
text, so go via its JSON dump, which carries the untouched bytes as hex:

    dwgread -O JSON -o model.json "3D Model-binded.dwg"
    uv run --with ezdxf python3 extract_sab.py model.json
"""
import sys, json, re, collections
from ezdxf.acis import sab

raw = open(sys.argv[1], errors="replace").read()
raw = re.sub(r"\bnan\b", "null", raw)          # LibreDWG emits bare nan, which is not JSON
objs = json.loads(raw)["OBJECTS"]
layers = {o["handle"][-1]: o.get("name") for o in objs if o.get("object") == "LAYER"}

rows = []
for o in objs:
    if o.get("entity") not in ("3DSOLID", "REGION", "BODY"): continue
    layer = layers.get(o["layer"][-1], "?")
    handle = f"{o['handle'][-1]:X}"
    ad = o.get("acis_data") or []
    if not ad or ad[0] != "ACIS BinaryFile":
        rows.append(dict(layer=layer, type=o["entity"], handle=handle, error="no binary ACIS data")); continue
    data = b"ACIS BinaryFile" + bytes.fromhex("".join(ad[1:]))   # standard SAB signature + payload
    fn = f"sab/{layer.replace(' ', '_')}_{handle}.sab"
    open(fn, "wb").write(data)
    row = dict(layer=layer, type=o["entity"], handle=handle, bytes=len(data), file=fn)
    try:
        ents = sab.parse_sab(data).entities
        kinds = collections.Counter(e.name for e in ents)
        pts = [t.value for e in ents if e.name == "point" for t in e.data if t.tag == sab.Tags.LOCATION_VEC]
        row.update(faces=kinds["face"], vertices=len(pts),
                   surfaces={k: v for k, v in kinds.items() if k.endswith("-surface")})
        if pts:
            mn = [min(p[i] for p in pts) for i in range(3)]; mx = [max(p[i] for p in pts) for i in range(3)]
            row.update(min=[round(v, 1) for v in mn], max=[round(v, 1) for v in mx],
                       size=[round(mx[i] - mn[i], 1) for i in range(3)])
    except Exception as ex:
        row["error"] = f"{type(ex).__name__}: {ex}"[:200]
    rows.append(row)
json.dump(rows, open("solids_index.json", "w"), indent=1)

print(len(rows), "bodies;", sum("error" in r for r in rows), "with errors;", sum("min" in r for r in rows), "with bbox")
by = collections.defaultdict(list)
for r in rows:
    if "min" in r: by[r["layer"]].append(r)
for l, rs in sorted(by.items()):
    mn = [min(r["min"][i] for r in rs) for i in range(3)]; mx = [max(r["max"][i] for r in rs) for i in range(3)]
    print(f"\n## {l}: {len(rs)}  x[{mn[0]:.0f},{mx[0]:.0f}] y[{mn[1]:.0f},{mx[1]:.0f}] z[{mn[2]:.0f},{mx[2]:.0f}]  size {mx[0]-mn[0]:.0f} x {mx[1]-mn[1]:.0f} x {mx[2]-mn[2]:.0f}")
    if len(rs) <= 8:
        for r in rs: print("   ", r["handle"], r["type"], "faces", r["faces"], "min", r["min"], "size", r["size"])
