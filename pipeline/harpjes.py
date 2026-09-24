"""The harpjes: one bow, used everywhere a harpje is.

The CAD has the same small D-shackle eleven times over (the masttopring and the hommerring, the
wantputtingen, the kettinkje of the fok, the fokkenval, the strop of the klauwval), each turned its
own way. Tessellated one by one they come out at 5,000 triangles a bow - fine enough for a fitting
of that size taken on its own, and the detail differs with how each one happens to lie along the
DWG axes. Here one bow is taken, made lighter, and put where every other one is: turned and moved
onto its pose. The pins are left to gelijk.py with the other small fittings: made lighter there,
and where one is a copy of another, made from that one.

The pose of a bow: its middle, and its axes - the length of the bow, pointing from the crown to
the pin; across the legs; and through the thickness. They come from the spread of its surface,
weighted by area, so the tessellation does not pull them about.

    uv run --python 3.12 --with numpy --with scipy --with meshoptimizer python3 pipeline/harpjes.py
        checks every bow against the one put in its place, in mm
"""
from functools import lru_cache

import numpy as np

import cad
from lighter import lighter, off_by, surface_axes

# every bow, and the pin that goes through it
PIN_OF = {
    "5420": "5428", "5267": "526F",                               # fokkenval, strop of the klauwval
    "5132": "513A", "5140": "5148",                               # the wantputtingen
    "515C": "5164", "53A7": "53AF",                               # either end of the kettinkje of the fok
    "516A": "5172", "5178": "5180", "518C": "5194", "51A6": "51AE", "51B4": "51BC",   # masttopring, hommerring
}
REFERENCE = "516A"          # the one that stands for them all
TRIANGLES = 700             # what it is brought down to (from about 5,000)




def pose(V, F, pin_V):
    """(middle, R): R's rows are the bow's axes - along it towards the pin, across, through."""
    o, E, _, _ = surface_axes(V, F)                               # smallest first
    along, across = E[:, 2], E[:, 1]
    if (pin_V.mean(0) - o) @ along < 0:                           # the pin is at the open end
        along = -along
    through = np.cross(along, across)                             # right-handed: a turn, never a mirror
    return o, np.array([along, across, through])


@lru_cache(maxsize=None)
def _reference(mesh_dir):
    """The reference bow, lighter, in its own axes (centred on its middle)."""
    V, N, F, _ = cad.load(REFERENCE, mesh_dir)
    o, R = pose(V, F, cad.load(PIN_OF[REFERENCE], mesh_dir)[0])
    Vs, Ns, Fs = lighter(V, N, F, TRIANGLES)
    return (Vs - o) @ R.T, Ns @ R.T, Fs


def bow(mesh_dir, handle):
    """The reference bow put where `handle`'s bow is, in CAD mm: (V, N, F)."""
    V, _, F, _ = cad.load(handle, mesh_dir)
    o, R = pose(V, F, cad.load(PIN_OF[handle], mesh_dir)[0])
    Vr, Nr, Fr = _reference(mesh_dir)
    return Vr @ R + o, Nr @ R, Fr


def build(mesh_dir):
    """{handle: (V, N, F)} for every bow: the CAD body's mesh is replaced by it."""
    return {h: bow(mesh_dir, h) for h in PIN_OF}


def check(mesh_dir):
    """How far each bow put in place lies from the CAD's own surface, in mm."""
    print(f"reference {REFERENCE}: {len(_reference(mesh_dir)[2])} triangles")
    for h in PIN_OF:
        V, _, F, _ = cad.load(h, mesh_dir)
        Vb, _, Fb = bow(mesh_dir, h)
        p95, most = off_by(V, F, Vb, Fb)
        print(f"  {h}: {len(F):5d} -> {len(Fb)} triangles, off by {p95:.2f} mm (95%), {most:.2f} at most")


if __name__ == "__main__":
    check(cad.MESH)
