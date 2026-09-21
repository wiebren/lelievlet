"""ACIS (SAB) body -> OpenCascade shape -> triangle mesh.

Reads the binary ACIS bodies extracted from the official lelievlet DWG (reference/cad/sab) and
rebuilds every face as a trimmed OpenCascade face: analytic surfaces are recreated exactly,
spline surfaces from their stored NURBS data (procedural ones from their NURBS approximation).
Faces are sewn per body so the tessellation is conformal along shared edges.

Not a general ACIS reader: it covers what occurs in this model and reports what it skips.
"""
from __future__ import annotations

import math
from dataclasses import dataclass, field

import numpy as np
from ezdxf.acis import sab

from OCP.BRep import BRep_Builder, BRep_Tool
from OCP.BRepBuilderAPI import (BRepBuilderAPI_MakeEdge, BRepBuilderAPI_MakeFace, BRepBuilderAPI_MakeSolid,
                                BRepBuilderAPI_Sewing)
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.BRepGProp import BRepGProp
from OCP.BRepLib import BRepLib
from OCP.GProp import GProp_GProps
from OCP.BRepMesh import BRepMesh_IncrementalMesh
from OCP.BRepTools import BRepTools
from OCP.Geom import (Geom_BSplineCurve, Geom_BSplineSurface, Geom_Circle, Geom_ConicalSurface,
                      Geom_CylindricalSurface, Geom_Ellipse, Geom_Line, Geom_Plane,
                      Geom_SphericalSurface, Geom_SurfaceOfLinearExtrusion, Geom_SurfaceOfRevolution,
                      Geom_ToroidalSurface)
from OCP.gp import gp_Ax1, gp_Ax2, gp_Ax3, gp_Dir, gp_Pnt, gp_Vec
from OCP.ShapeExtend import ShapeExtend_WireData
from OCP.ShapeFix import ShapeFix_Face, ShapeFix_Wire
from OCP.TColgp import TColgp_Array1OfPnt, TColgp_Array2OfPnt
from OCP.TColStd import (TColStd_Array1OfInteger, TColStd_Array1OfReal, TColStd_Array2OfReal)
from OCP.TopAbs import TopAbs_FACE, TopAbs_REVERSED, TopAbs_SHELL
from OCP.TopExp import TopExp_Explorer
from OCP.TopLoc import TopLoc_Location
from OCP.TopoDS import TopoDS, TopoDS_Compound, TopoDS_Face

T = sab.Tags
NULL = "null-ptr"


class Unsupported(Exception):
    pass


# ---------------------------------------------------------------------------------- tokens

def _is(tok, *tags):
    return tok.tag in tags


def _ptr(tok):
    v = tok.value
    return None if getattr(v, "name", NULL) == NULL else v


def _bool(tok):
    return tok.tag == T.BOOL_TRUE


def _vec(tok):
    return np.array(tok.value, dtype=float)


def _block_end(data, start):
    """Index of the SUBTYPE_END matching the SUBTYPE_START at data[start]."""
    depth = 0
    for i in range(start, len(data)):
        if data[i].tag == T.SUBTYPE_START:
            depth += 1
        elif data[i].tag == T.SUBTYPE_END:
            depth -= 1
            if depth == 0:
                return i
    raise Unsupported("unterminated subtype block")


def _read_knots(data, i, n):
    knots, mults = [], []
    for _ in range(n):
        knots.append(float(data[i].value)); mults.append(int(data[i + 1].value)); i += 2
    return knots, mults, i


def _occ_knots(knots, mults, degree):
    """ACIS drops the first and last knot of the full vector; OpenCascade wants them."""
    # merge numerically identical neighbours (ACIS occasionally repeats a knot value)
    k2, m2 = [knots[0]], [mults[0]]
    for k, m in zip(knots[1:], mults[1:]):
        if abs(k - k2[-1]) <= 1e-12 * max(1.0, abs(k)):
            m2[-1] += m
        else:
            k2.append(k); m2.append(m)
    m2[0] += 1; m2[-1] += 1
    m2 = [min(m, degree + 1) if j in (0, len(m2) - 1) else min(m, degree) for j, m in enumerate(m2)]
    ka = TColStd_Array1OfReal(1, len(k2)); ma = TColStd_Array1OfInteger(1, len(k2))
    for j, (k, m) in enumerate(zip(k2, m2), 1):
        ka.SetValue(j, k); ma.SetValue(j, m)
    return ka, ma, sum(m2)


def _parse_bs3_curve(data, i, dim=3):
    """data[i] is the 'nubs'/'nurbs' token of a curve. Returns (Geom_BSplineCurve | 2d poles, next)."""
    rational = data[i].value == "nurbs"
    degree = int(data[i + 1].value)
    j = i + 2
    while not _is(data[j], T.INT):          # closure enum (and the odd rational flag string)
        j += 1
    nk = int(data[j].value)
    knots, mults, j = _read_knots(data, j + 1, nk)
    npoles = sum(mults) - degree + 1
    stride = dim + (1 if rational else 0)
    vals = [float(data[j + k].value) for k in range(npoles * stride)]
    j += npoles * stride
    pts = np.array(vals).reshape(npoles, stride)
    ka, ma, msum = _occ_knots(knots, mults, degree)
    if msum != npoles + degree + 1:
        raise Unsupported(f"curve knot/pole mismatch ({msum} vs {npoles}+{degree}+1)")
    if dim != 3:
        return (pts, knots, mults, degree), j
    poles = TColgp_Array1OfPnt(1, npoles)
    for k, p in enumerate(pts, 1):
        poles.SetValue(k, gp_Pnt(*p[:3]))
    if rational:
        w = TColStd_Array1OfReal(1, npoles)
        for k, p in enumerate(pts, 1):
            w.SetValue(k, p[3])
        return Geom_BSplineCurve(poles, w, ka, ma, degree), j
    return Geom_BSplineCurve(poles, ka, ma, degree), j


def _parse_bs3_surface(data, i):
    rational = data[i].value == "nurbs"
    du, dv = int(data[i + 1].value), int(data[i + 2].value)
    j = i + 3
    while not _is(data[j], T.INT):          # rational flag string + 4 closure/singularity enums
        j += 1
    nku, nkv = int(data[j].value), int(data[j + 1].value)
    ku, mu, j = _read_knots(data, j + 2, nku)
    kv, mv, j = _read_knots(data, j, nkv)
    nu, nv = sum(mu) - du + 1, sum(mv) - dv + 1
    stride = 4 if rational else 3
    vals = np.array([float(data[j + k].value) for k in range(nu * nv * stride)]).reshape(nv, nu, stride)
    kua, mua, su = _occ_knots(ku, mu, du)
    kva, mva, sv = _occ_knots(kv, mv, dv)
    if su != nu + du + 1 or sv != nv + dv + 1:
        raise Unsupported("surface knot/pole mismatch")
    poles = TColgp_Array2OfPnt(1, nu, 1, nv)
    weights = TColStd_Array2OfReal(1, nu, 1, nv)
    for b in range(nv):                     # ACIS writes the u index fastest
        for a in range(nu):
            p = vals[b, a]
            poles.SetValue(a + 1, b + 1, gp_Pnt(p[0], p[1], p[2]))
            weights.SetValue(a + 1, b + 1, p[3] if rational else 1.0)
    if rational:
        return Geom_BSplineSurface(poles, weights, kua, kva, mua, mva, du, dv)
    return Geom_BSplineSurface(poles, kua, kva, mua, mva, du, dv)


def _looks_like_surface(data, i):
    return (data[i].tag in (T.STR, T.LITERAL_STR, T.ENTITY_TYPE, T.ENTITY_TYPE_EX) or isinstance(data[i].value, str)) \
        and data[i].value in ("nubs", "nurbs") and _is(data[i + 1], T.INT) and _is(data[i + 2], T.INT)


def _looks_like_curve(data, i):
    return isinstance(data[i].value, str) and data[i].value in ("nubs", "nurbs") \
        and _is(data[i + 1], T.INT) and not _is(data[i + 2], T.INT)


# ---------------------------------------------------------------------------------- reader

@dataclass
class Stats:
    faces: int = 0
    built: int = 0
    shells: int = 0
    closed_shells: int = 0
    skipped: dict = field(default_factory=dict)

    def skip(self, why):
        self.skipped[why] = self.skipped.get(why, 0) + 1


class AcisBody:
    def __init__(self, path):
        self.entities = sab.parse_sab(open(path, "rb").read()).entities
        # Table of subtype definitions in file order; "{ ref n }" points into it.
        self.subtypes = []
        for e in self.entities:
            d = e.data
            for i, t in enumerate(d):
                if t.tag == T.SUBTYPE_START and i + 1 < len(d) and d[i + 1].value != "ref":
                    self.subtypes.append((d, i))
        self._surf, self._curve, self._edges = {}, {}, {}
        self.stats = Stats()

    # -- subtype helpers
    def _resolve(self, data, start):
        """Follow '{ ref n }'. Returns (data, start) of the real definition."""
        while data[start + 1].value == "ref":
            data, start = self.subtypes[int(data[start + 2].value)]
        return data, start

    def _own_level(self, data, start):
        """Indices of tokens directly inside the block at data[start] (nested blocks excluded)."""
        end = _block_end(data, start)
        depth, out = 0, []
        for i in range(start, end + 1):
            tag = data[i].tag
            if tag == T.SUBTYPE_START:
                depth += 1
            elif tag == T.SUBTYPE_END:
                depth -= 1
            elif depth == 1:
                out.append(i)
        return out

    # -- geometry
    def surface(self, ent):
        key = id(ent)
        if key not in self._surf:
            self._surf[key] = self._make_surface(ent)
        return self._surf[key]

    def _make_surface(self, ent):
        d, n = ent.data, ent.name
        if n == "plane-surface":
            return Geom_Plane(gp_Ax3(gp_Pnt(*_vec(d[1])), gp_Dir(*_vec(d[2])), gp_Dir(*_vec(d[3])))), False
        if n == "cone-surface":
            c, axis, major, ratio = _vec(d[1]), _vec(d[2]), _vec(d[3]), float(d[4].value)
            dbl = [float(t.value) for t in d[5:] if t.tag == T.DOUBLE]
            sine, cosine = dbl[0], dbl[1]
            r = float(np.linalg.norm(major))
            hollow = cosine < 0
            if abs(ratio - 1.0) > 1e-9:
                # Elliptical cylinder: a round bar extruded along a mitred polyline path.
                if abs(sine) > 1e-12:
                    raise Unsupported("elliptical cone")
                if ratio < 1.0:
                    ell = Geom_Ellipse(gp_Ax2(gp_Pnt(*c), gp_Dir(*axis), gp_Dir(*major)), r, r * ratio)
                else:
                    minor_dir = np.cross(axis / np.linalg.norm(axis), major)
                    ell = Geom_Ellipse(gp_Ax2(gp_Pnt(*c), gp_Dir(*axis), gp_Dir(*minor_dir)), r * ratio, r)
                return Geom_SurfaceOfLinearExtrusion(ell, gp_Dir(*axis)), hollow
            ax = gp_Ax3(gp_Pnt(*c), gp_Dir(*axis), gp_Dir(*major))
            if abs(sine) < 1e-12:
                return Geom_CylindricalSurface(ax, r), hollow
            # ACIS: the section shrinks along the axis when sine and cosine share a sign.
            ang = math.asin(min(1.0, abs(sine)))
            ang = -ang if sine * cosine > 0 else ang
            return ("cone", ax, ang, r, c, axis / np.linalg.norm(axis)), hollow
        if n == "sphere-surface":
            c, radius = _vec(d[1]), float(d[2].value)
            return Geom_SphericalSurface(gp_Ax3(gp_Pnt(*c), gp_Dir(*_vec(d[4])), gp_Dir(*_vec(d[3]))), abs(radius)), radius < 0
        if n == "torus-surface":
            c, nrm, major, minor = _vec(d[1]), _vec(d[2]), float(d[3].value), float(d[4].value)
            if major <= 0 or abs(minor) >= major:
                # "Lemon"/"apple" torus (rounded bar ends): revolve the tube circle instead.
                u = _vec(d[5]); u = u / np.linalg.norm(u); z = nrm / np.linalg.norm(nrm)
                circ = Geom_Circle(gp_Ax2(gp_Pnt(*(c + major * u)), gp_Dir(*np.cross(z, u)), gp_Dir(*u)), abs(minor))
                return Geom_SurfaceOfRevolution(circ, gp_Ax1(gp_Pnt(*c), gp_Dir(*z))), minor < 0
            return Geom_ToroidalSurface(gp_Ax3(gp_Pnt(*c), gp_Dir(*nrm), gp_Dir(*_vec(d[5]))), major, abs(minor)), minor < 0
        if n == "spline-surface":
            reversed_ = _bool(d[1])
            data, start = self._resolve(d, 2)
            for i in self._own_level(data, start):
                if _looks_like_surface(data, i):
                    return _parse_bs3_surface(data, i), reversed_
            raise Unsupported(f"no NURBS data in {data[start + 1].value}")
        raise Unsupported(n)

    def _cone(self, spec, pts):
        """Pick the cone half-angle sign that actually fits the face's vertices."""
        _, ax, ang, r, c, axis = spec
        best = None
        for a in (ang, -ang):
            err = 0.0
            for p in pts:
                h = float(np.dot(p - c, axis))
                rad = float(np.linalg.norm(p - c - h * axis))
                err += abs(rad - (r + h * math.tan(a)))
            if best is None or err < best[0]:
                best = (err, a)
        a = best[1]
        if abs(a) < 1e-9:
            return Geom_CylindricalSurface(ax, r)
        # OpenCascade wants a positive reference radius and measures v along the slant.
        return Geom_ConicalSurface(ax, a, r)

    def curve(self, ent):
        """Returns (Geom_Curve, negate) where negate means ACIS parameter = -OCC parameter."""
        key = id(ent)
        if key not in self._curve:
            self._curve[key] = self._make_curve(ent)
        return self._curve[key]

    def _make_curve(self, ent):
        d, n = ent.data, ent.name
        if n == "straight-curve":
            p, v = _vec(d[1]), _vec(d[2])
            return Geom_Line(gp_Pnt(*p), gp_Dir(*v)), float(np.linalg.norm(v)), False
        if n == "ellipse-curve":
            c, nrm, major, ratio = _vec(d[1]), _vec(d[2]), _vec(d[3]), float(d[4].value)
            r = float(np.linalg.norm(major))
            ax = gp_Ax2(gp_Pnt(*c), gp_Dir(*nrm), gp_Dir(*major))
            if abs(ratio - 1.0) < 1e-12:
                return Geom_Circle(ax, r), 1.0, False
            if ratio > 1.0:                 # ACIS allows the "major" axis to be the short one
                minor = np.cross(nrm / np.linalg.norm(nrm), major) * ratio
                ax = gp_Ax2(gp_Pnt(*c), gp_Dir(*nrm), gp_Dir(*minor))
                return Geom_Ellipse(ax, r * ratio, r), 1.0, False   # parameter is shifted by pi/2
            return Geom_Ellipse(ax, r, r * ratio), 1.0, False
        if n == "intcurve-curve":
            reversed_ = _bool(d[1])
            data, start = self._resolve(d, 2)
            for i in self._own_level(data, start):
                if _looks_like_curve(data, i):
                    crv, _ = _parse_bs3_curve(data, i, 3)
                    return crv, 1.0, reversed_
            raise Unsupported(f"no NURBS data in {data[start + 1].value}")
        raise Unsupported(n)

    # -- topology
    def _edge(self, edge_ent):
        """Returns (TopoDS_Edge, along) - along tells whether the OpenCascade edge runs in the
        direction of the ACIS edge (start vertex -> end vertex)."""
        key = id(edge_ent)
        if key in self._edges:
            return self._edges[key]
        d = edge_ent.data
        v0, t0, v1, t1 = _ptr(d[1]), float(d[2].value), _ptr(d[3]), float(d[4].value)
        cur = _ptr(d[6])
        if cur is None:
            self._edges[key] = None         # degenerate edge (cone apex and the like)
            return None
        rev = _bool(d[7])
        p0, p1 = self._point(v0), self._point(v1)
        crv, scale, negate = self.curve(cur)
        a, b = (-t1, -t0) if rev else (t0, t1)          # edge parameters -> curve parameters
        if negate:
            a, b = -b, -a
        a, b = a * scale, b * scale
        along_curve = rev == negate         # ACIS edge direction vs increasing curve parameter
        err = 1e9
        if b > a:
            try:
                ends = [np.array([q.X(), q.Y(), q.Z()]) for q in (crv.Value(a), crv.Value(b))]
                want = (p0, p1) if along_curve else (p1, p0)
                err = max(np.linalg.norm(ends[0] - want[0]), np.linalg.norm(ends[1] - want[1]))
            except Exception:
                pass
        result = None
        if err < 1.0:                       # tolerant edges miss their vertices by up to ~0.1 mm
            mk = BRepBuilderAPI_MakeEdge(crv, a, b)
            if mk.IsDone():
                result = (mk.Edge(), along_curve)
        if result is None and np.linalg.norm(p0 - p1) < 1e-6:
            mk = BRepBuilderAPI_MakeEdge(crv)
            if mk.IsDone():
                result = (mk.Edge(), along_curve)
        if result is None:
            for q0, q1, along in ((p0, p1, True), (p1, p0, False)):
                mk = BRepBuilderAPI_MakeEdge(crv, gp_Pnt(*q0), gp_Pnt(*q1))
                if mk.IsDone():
                    result = (mk.Edge(), along); break
        if result is None:
            raise Unsupported("edge construction failed")
        self._edges[key] = result
        return result

    def _point(self, vertex_ent):
        for t in vertex_ent.data:
            if t.tag == T.POINTER and getattr(t.value, "name", "") == "point":
                return _vec(t.value.data[1])
        raise Unsupported("vertex without point")

    def _loops(self, face_ent):
        loop = _ptr(face_ent.data[2])
        while loop is not None:
            first = _ptr(loop.data[2]); co = first; edges = []
            while co is not None:
                edges.append((_ptr(co.data[4]), _bool(co.data[5])))
                co = _ptr(co.data[1])
                if co is first:
                    break
            yield edges
            loop = _ptr(loop.data[1])

    def _face(self, face_ent):
        surf_ent = _ptr(face_ent.data[5])
        if surf_ent is None:
            raise Unsupported("face without surface")
        surf, surf_rev = self.surface(surf_ent)
        loops = list(self._loops(face_ent))
        if isinstance(surf, tuple):         # cone: needs the face's vertices to fix its sign
            pts = []
            for edges in loops:
                for e, _ in edges:
                    for k in (1, 3):
                        v = _ptr(e.data[k])
                        if v is not None:
                            pts.append(self._point(v))
            surf = self._cone(surf, pts)
        wires = []
        for edges in loops:
            wd = ShapeExtend_WireData()
            n = 0
            for e, co_rev in edges:
                oe = self._edge(e)
                if oe is not None:
                    edge, along = oe
                    wd.Add(edge if along != co_rev else TopoDS.Edge_s(edge.Reversed())); n += 1
            if n == 0:
                continue
            fw = ShapeFix_Wire(); fw.Load(wd); fw.SetSurface(surf)
            fw.SetPrecision(0.1); fw.SetMaxTolerance(1.0)
            fw.FixReorder(); fw.FixConnected()
            wires.append(fw.Wire())
        if not wires:
            mk = BRepBuilderAPI_MakeFace(surf, 1e-6)       # whole sphere / torus
            if not mk.IsDone():
                raise Unsupported("face construction failed")
            face = mk.Face()
        else:
            face = self._bounded_face(surf, wires, closed_both_ways=surf_ent.name in ("torus-surface", "sphere-surface"),
                                      expected_flip=_bool(face_ent.data[6]) != surf_rev)
        if _bool(face_ent.data[6]) != surf_rev:            # ACIS "reversed" sense
            face = TopoDS.Face_s(face.Reversed())
        return face

    @staticmethod
    def _bounded_face(surf, wires, closed_both_ways, expected_flip):
        """The loop direction decides which side of the loop is the face.

        On an open surface only one side is bounded, so: build it and keep the orientation that
        gives a valid face. On a torus or sphere both sides are bounded and validity cannot tell
        them apart (a loop welded to a ring is mostly exposed: the face is the *larger* piece).
        There the ACIS rule decides - the face lies to the left of its co-edges seen along the face
        normal, which means the loops must be flipped iff the ACIS face is reversed with respect
        to the surface as rebuilt here. That rule predicts the valid side on 1372 of 1373 open-
        surface faces of this model. ShapeFix's own re-orientation has to be off for it."""
        if closed_both_ways:
            # On a torus or sphere both sides of a loop are bounded, so validity cannot tell them
            # apart. Orient the loops as ACIS means them (with ShapeFix's own re-orientation off)
            # and look at the signed area they enclose. Positive: the face is that patch. Negative:
            # the loops are the weld of a bar or eye and the face is the whole surface minus that
            # patch - which OpenCascade cannot mesh, because the patch crosses the seam. The patch
            # is buried in the part the eye is welded to, so the whole surface renders the same.
            face = TopoDS_Face(); bld = BRep_Builder(); bld.MakeFace(face, surf, 1e-4)
            for w in wires:
                bld.Add(face, TopoDS.Wire_s(w.Reversed()) if expected_flip else w)
            try:
                fx = ShapeFix_Face(face); fx.SetPrecision(0.1); fx.SetMaxTolerance(1.0)
                fx.FixOrientationMode = 0
                fx.Perform(); patch = fx.Face()
                props = GProp_GProps(); BRepGProp.SurfaceProperties_s(patch, props)
                area = props.Mass()
                if area < 0:
                    whole = BRepBuilderAPI_MakeFace(surf, 1e-6)
                    if whole.IsDone():
                        return whole.Face()
                if 0 < area < 1e9:
                    BRepMesh_IncrementalMesh(patch, 0.5, False, 0.35, False)
                    tri = BRep_Tool.Triangulation_s(patch, TopLoc_Location())
                    if tri is not None and tri.NbTriangles() > 0:
                        return patch
            except Exception:
                pass
        valid, usable = [], []
        for flip in (False, True):
            face = TopoDS_Face(); bld = BRep_Builder(); bld.MakeFace(face, surf, 1e-4)
            for w in wires:
                bld.Add(face, TopoDS.Wire_s(w.Reversed()) if flip else w)
            try:
                fx = ShapeFix_Face(face); fx.SetPrecision(0.1); fx.SetMaxTolerance(1.0)
                fx.Perform(); face = fx.Face()
                props = GProp_GProps(); BRepGProp.SurfaceProperties_s(face, props)
                area = props.Mass()
            except Exception:
                continue
            if not (0 < area < 1e9):
                continue
            if BRepCheck_Analyzer(face).IsValid():
                if not closed_both_ways:
                    return face
                valid.append((area, face))
            else:
                usable.append((area, face))
        if valid:
            return min(valid, key=lambda c: c[0])[1]       # on a torus/sphere both sides are bounded
        # Faces closed around a cylinder get a seam added by ShapeFix; the checker dislikes the
        # result although it meshes correctly. Accept them if they really produce triangles.
        for area, face in sorted(usable, key=lambda c: c[0]):
            BRepMesh_IncrementalMesh(face, 0.5, False, 0.35, False)
            tri = BRep_Tool.Triangulation_s(face, TopLoc_Location())
            if tri is not None and tri.NbTriangles() > 0:
                return face
        raise Unsupported("no valid loop orientation")

    def shape(self, sew_tolerances=(0.1, 0.5, 1.5)):
        builder = BRep_Builder(); comp = TopoDS_Compound(); builder.MakeCompound(comp)
        faces = []
        for ent in self.entities:
            if ent.name != "face":
                continue
            self.stats.faces += 1
            try:
                f = self._face(ent)
            except Unsupported as ex:
                self.stats.skip(str(ex)); continue
            except Exception as ex:                        # OpenCascade Standard_Failure etc.
                self.stats.skip(f"{type(ex).__name__}"); continue
            builder.Add(comp, f); faces.append(f)
            self.stats.built += 1
        if not faces:
            return None
        best = None
        for tol in sew_tolerances:                         # loosen only if the shell stays open
            result = self._sew(faces, tol)
            if result is None:
                continue
            shape, shells, closed = result
            if best is None or closed > best[2] or (closed == best[2] and shells < best[1]):
                best = (shape, shells, closed)
            if shells and closed == shells:
                break
        if best is None:
            return comp
        self.stats.shells, self.stats.closed_shells = best[1], best[2]
        return best[0]

    @staticmethod
    def _sew(faces, tolerance):
        sewing = BRepBuilderAPI_Sewing(tolerance)
        for f in faces:
            sewing.Add(f)
        try:
            sewing.Perform()
            sewn = sewing.SewedShape()
        except Exception:
            return None
        if sewn.IsNull():
            return None
        # Closed shells become solids so OpenCascade can point every face outward.
        builder = BRep_Builder(); out = TopoDS_Compound(); builder.MakeCompound(out)
        shells = TopExp_Explorer(sewn, TopAbs_SHELL)
        n_shells = n_closed = 0
        while shells.More():
            shell = TopoDS.Shell_s(shells.Current()); shells.Next()
            n_shells += 1
            if BRep_Tool.IsClosed_s(shell):
                try:
                    solid = BRepBuilderAPI_MakeSolid(shell).Solid()
                    BRepLib.OrientClosedSolid_s(solid)
                    builder.Add(out, solid); n_closed += 1
                    continue
                except Exception:
                    pass
            builder.Add(out, shell)
        loose = TopExp_Explorer(sewn, TopAbs_FACE, TopAbs_SHELL)      # faces sewing left alone
        while loose.More():
            builder.Add(out, loose.Current()); loose.Next()
        return out, n_shells, n_closed


# ---------------------------------------------------------------------------------- meshing

def tessellate(shape, linear=0.5, angular=0.35, with_face_ids=False):
    """Returns (vertices Nx3, normals Nx3, triangles Mx3) in model units, exact surface normals.
    with_face_ids adds a per-triangle index of the B-rep face it came from."""
    BRepTools.Clean_s(shape)                # drop any earlier triangulation
    BRepMesh_IncrementalMesh(shape, linear, False, angular, True)
    V, N, F, G = [], [], [], []
    base = 0
    face_no = -1
    exp = TopExp_Explorer(shape, TopAbs_FACE)
    while exp.More():
        face = TopoDS.Face_s(exp.Current()); exp.Next()
        loc = TopLoc_Location()
        tri = BRep_Tool.Triangulation_s(face, loc)
        if tri is None:
            continue
        face_no += 1
        trsf = loc.Transformation()
        flip = face.Orientation() == TopAbs_REVERSED
        surf = BRep_Tool.Surface_s(face)
        nn = tri.NbNodes()
        has_uv = tri.HasUVNodes()
        p, d1u, d1v = gp_Pnt(), gp_Vec(), gp_Vec()
        for i in range(1, nn + 1):
            q = tri.Node(i).Transformed(trsf)
            V.append((q.X(), q.Y(), q.Z()))
            nrm = (0.0, 0.0, 0.0)
            if has_uv:
                uv = tri.UVNode(i)
                surf.D1(uv.X(), uv.Y(), p, d1u, d1v)
                c = d1u.Crossed(d1v)
                if c.Magnitude() > 1e-12:
                    c.Normalize()
                    c.Transform(trsf)
                    nrm = (-c.X(), -c.Y(), -c.Z()) if flip else (c.X(), c.Y(), c.Z())
            N.append(nrm)
        for i in range(1, tri.NbTriangles() + 1):
            a, b, c = tri.Triangle(i).Get()
            F.append((base + a - 1, base + c - 1, base + b - 1) if flip else (base + a - 1, base + b - 1, base + c - 1))
            G.append(face_no)
        base += nn
    V = np.array(V, dtype=np.float64).reshape(-1, 3); N = np.array(N, dtype=np.float64).reshape(-1, 3)
    F = np.array(F, dtype=np.int64).reshape(-1, 3)
    if len(F):                              # degenerate normals (poles, apexes): use the triangle's
        bad = np.linalg.norm(N, axis=1) < 0.5
        if bad.any():
            fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
            acc = np.zeros_like(V)
            for k in range(3):
                np.add.at(acc, F[:, k], fn)
            ln = np.linalg.norm(acc, axis=1, keepdims=True); ln[ln == 0] = 1
            N[bad] = (acc / ln)[bad]
    if with_face_ids:
        return V, N, F, np.array(G, dtype=np.int64)
    return V, N, F
