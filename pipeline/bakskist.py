"""De bakskist: the chest that stands on the buikdenning in the bow of the kuip, to bakboord.

A plain scouting chest of varnished 15 mm boards, butt-jointed so every board shows as a piece of
its own: a bottom the four sides stand on, two end boards over the full width and two side boards
let in between them. Two battens under the bottom keep it off the vlonders. It is really hollow -
the top of the bottom board is its floor - so gear can be stowed in it later; `placement()` says
where that floor is.

The vlonders only leave room for it fore and aft, so it lies with its length along the boat, close
up against the voorschot. The lid is hinged along its bakboord side and falls open outboard, a
little past vertical; the hasp is on the inboard side, where it is reached from the kuip.

Everything is in CAD millimetres (x forward, y to port, z up), like the bodies it stands on. The
chest has a frame of its own: u along its length (forward), v athwartships (to port), w up out of
the floor it stands on, which is not level, so the whole chest leans forward with it.

  build(mesh_dir)      [(id, naam, groep, materiaal, (V, N, F))] - kist, deksel, beslag, handvatten
  placement(mesh_dir)  frame and inside size of the chest, to stow items in it later
"""
import numpy as np

import cad
from hardware import _finish, _join, bead, prism           # the mesh helpers, so this file is geometry only
from rigging import tube

# -- the chest. 600 x 380 x 350 over the battens (365 with the lid shut). 380 rather than the 400
# of a chest ashore because the vlonders are cut back to y = 511.6 along the voorschot and the
# inboard side has to stay clear of the kikker on the mastkoker (it reaches y = 93.9) and of the
# anchor gear to starboard.
LENGTH, WIDTH, HEIGHT = 600.0, 380.0, 330.0             # outside, without the battens
BOARD = 15.0
BATTEN = (40.0, 20.0)                                    # 40 wide, 20 high, athwartships so that
BATTEN_INSET = 40.0                                      # they bridge the gaps between the vlonders
INBOARD_Y = 125.0                                        # y of the inboard side: 31 mm clear of the kikker
VOORSCHOT_GAP = 30.0                                     # from the top of the forward end board to the plate

# -- lid: the same 600 x 380 as the top, on two battens across its underside, hinged along the
# bakboord side so it falls open outboard. Nothing catches it at this angle: the plating is
# another 216 mm out and the nearest thing on that side is the stowed riem, 87 mm off. Thrown
# right open it would land on that riem at about 126 degrees; the angle here is simply chosen,
# a little past vertical, as the owner asked.
LID_ANGLE = np.radians(103.0)
LID_BATTEN = (40.0, 130.0, 430.0)                        # width, and where the two start along the lid
HINGE_PLATE = (120.0, 25.0, 3.0)                         # strap hinge: long, wide, thick
KNUCKLE_R = 5.0
HINGE_U = (150.0, 425.0)                                 # the two straps, by u of their aft edge
HASP = (70.0, 70.0, 250.0)                               # closing plate inboard: long, high, w of its foot
HASP_TONGUE = (100.0, 30.0, 45.0)                        # hasp: long, wide, how far it reaches onto the lid

# -- becket in each end board: a bight of 10 mm rope through two holes, hanging down the board
# with a stopper knot inside. It stands only 20 mm proud of the board: the voorschot is 32 mm in
# front of the forward end board at that height, so the becket there still clears it by 13 mm.
BECKET_R, BECKET_V, BECKET_W = 5.0, (110.0, 270.0), 250.0
BECKET_PROUD, BECKET_SAG, BECKET_KNOT = 15.0, 70.0, 9.0

# the three vlonderplanken the chest stands on, and the bulkhead it is stowed against
FLOOR_BOARDS = ("5639", "5633", "5636")
VOORSCHOT = "59E9"




def floor_plane(mesh_dir):
    """(slope, z0) of the top of the vlonders under the chest: z = slope * x + z0. The boards run
    downhill towards the bow, all three in one plane, so the chest simply leans with it. The fit
    allows for a slope athwartships as well; there is none, it comes out at 3e-10 mm/mm."""
    up = []
    for handle in FLOOR_BOARDS:
        V, _, F, _ = cad.load(handle, mesh_dir)
        n = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
        area = np.linalg.norm(n, axis=1)
        up.append(V[F[n[:, 2] / area > 0.99]].reshape(-1, 3))       # triangles of the top face
    P = np.concatenate(up)
    slope, _, z0 = np.linalg.lstsq(np.c_[P[:, 0], P[:, 1], np.ones(len(P))], P[:, 2], rcond=None)[0]
    return slope, z0


def voorschot_face(mesh_dir):
    """x of the aft face of the voorschot, the bulkhead the chest is stowed against. The plate is
    flat and vertical, so that face is simply its lowest x."""
    V = cad.load(VOORSCHOT, mesh_dir)[0]
    return V[:, 0].min()


def hinge_axis():
    """Point on the hinge line, in the chest's own frame; the line itself runs along u, over the
    bakboord side. The knuckle lies outside both faces of the corner it is screwed to, so the lid
    clears the rim of the chest all the way round."""
    return np.array([0.0, WIDTH + HINGE_PLATE[2] + KNUCKLE_R,
                     HEIGHT + BOARD + HINGE_PLATE[2] + KNUCKLE_R])


def frame(mesh_dir):
    """(origin, u, v, w) of the chest: the corner of the bottom board at its aft, inboard, lower
    side and the three unit vectors of its own axes.

    Athwartships and in height it follows the vlonders: w is their normal and the underside of
    both battens lies in their plane, so the chest stands on them without a gap. Fore and aft it
    is stowed against the voorschot, VOORSCHOT_GAP clear of the plate; the chest leans forward
    with the floor, so the corner that comes nearest is the top of the forward end board."""
    slope, z0 = floor_plane(mesh_dir)
    a = np.arctan(-slope)
    u = np.array([np.cos(a), 0.0, -np.sin(a)])
    v = np.array([0.0, 1.0, 0.0])
    w = np.array([np.sin(a), 0.0, np.cos(a)])
    x = voorschot_face(mesh_dir) - VOORSCHOT_GAP - LENGTH * np.cos(a) - HEIGHT * np.sin(a)
    base = z0 * np.cos(a) + BATTEN[1]                    # w . origin, fixed by the floor plus the battens
    return np.array([x, INBOARD_Y, (base - x * np.sin(a)) / np.cos(a)]), u, v, w


def board(a, b):
    """One board of the chest: a box in its own frame, every normal pointing out of it."""
    a, b = np.asarray(a, float), np.asarray(b, float)
    V, F, want = [], [], []
    for k in range(3):
        i, j = (k + 1) % 3, (k + 2) % 3
        for end, s in ((a, -1.0), (b, 1.0)):
            quad = []
            for di, dj in ((0, 0), (1, 0), (1, 1), (0, 1)):
                p = np.empty(3); p[k] = end[k]; p[i] = (a, b)[di][i]; p[j] = (a, b)[dj][j]
                quad.append(p)
            n = np.zeros(3); n[k] = s
            m = len(V); V += quad; F += [(m, m + 1, m + 2), (m, m + 2, m + 3)]; want += [n, n]
    return _finish(V, F, want)


def _knot(centre, radius):
    """A stopper knot."""
    return bead(centre, radius)


def becket(face, out):
    """Rope handle in an end board: the rope leaves the board, hangs down in a bight and goes back
    in through the second hole, with a stopper knot behind each. The knots and the run through the
    board are drawn, the holes are not: the rope simply comes out of the face."""
    v0, v1 = BECKET_V
    inside = face - out * (BOARD + BECKET_KNOT + 1.0)
    proud = face + out * BECKET_PROUD
    knots = np.array([[inside, v0, BECKET_W], [face, v0, BECKET_W],
                      [proud, v0 + 20.0, BECKET_W - 26.0],
                      [proud, (v0 + v1) / 2, BECKET_W - BECKET_SAG],
                      [proud, v1 - 20.0, BECKET_W - 26.0],
                      [face, v1, BECKET_W], [inside, v1, BECKET_W]])
    t = np.linspace(0, 1, len(knots)); tt = np.linspace(0, 1, 44)
    P = np.c_[[np.interp(tt, t, knots[:, k]) for k in range(3)]].T
    for _ in range(3):                                   # soften the corners, as the lanyard does
        P[1:-1] = (P[:-2] + 2 * P[1:-1] + P[2:]) / 4
    return [tube(P, BECKET_R, 8)] + [_knot(P[k], BECKET_KNOT) for k in (0, -1)]


def _chest():
    """The chest itself: bottom, two end boards over the full width, two side boards between them,
    and the two battens it stands on."""
    top = HEIGHT
    out = [board((0, 0, 0), (LENGTH, WIDTH, BOARD))]
    for u0 in (0.0, LENGTH - BOARD):
        out.append(board((u0, 0, BOARD), (u0 + BOARD, WIDTH, top)))
    for v0 in (0.0, WIDTH - BOARD):
        out.append(board((BOARD, v0, BOARD), (LENGTH - BOARD, v0 + BOARD, top)))
    for u0 in (BATTEN_INSET, LENGTH - BATTEN_INSET - BATTEN[0]):
        out.append(board((u0, 0, -BATTEN[1]), (u0 + BATTEN[0], WIDTH, 0)))
    return out


def _lid():
    """The lid: one panel the size of the top with two battens across its underside. They are
    10 mm narrower than the opening, so closing the lid drops them into it and they keep it in
    place; that play also lets their far corner swing past the inboard rim, 3.8 mm clear, as the
    lid turns about the hinge on the other side."""
    top = HEIGHT + BOARD
    out = [board((0, 0, HEIGHT), (LENGTH, WIDTH, top))]
    for u0 in LID_BATTEN[1:]:
        out.append(board((u0, BOARD + 5.0, HEIGHT - BOARD),
                         (u0 + LID_BATTEN[0], WIDTH - BOARD - 5.0, HEIGHT)))
    return out


def _beslag():
    """Hinges and hasp. Each strap hinge is two flat straps - one down the bakboord face, one along
    the top of the lid - and the knuckle in the corner between them, tangent to both. The chest is
    closed on the inboard side by a plate with a staple; its hasp lies back on the open lid."""
    top = HEIGHT + BOARD
    reach, wide, thick = HINGE_PLATE
    _, av, aw = hinge_axis()
    fixed, moving = [], []
    for u0 in HINGE_U:
        fixed.append(board((u0, WIDTH, HEIGHT - reach), (u0 + wide, WIDTH + thick, HEIGHT)))
        moving.append(board((u0, WIDTH - reach, top), (u0 + wide, WIDTH, top + thick)))
        moving.append(prism((u0, av, aw), (u0 + wide, av, aw), KNUCKLE_R, 16, True))
    hu, hh, hz = HASP
    mid = LENGTH / 2
    fixed.append(board((mid - hu / 2, -thick, hz), (mid + hu / 2, 0.0, hz + hh)))
    fixed.append(board((mid - 10.0, -thick - 8.0, hz + hh / 2 - 5.0),                # the staple
                       (mid + 10.0, -thick, hz + hh / 2 + 5.0)))
    tv, tu, onto = HASP_TONGUE
    moving.append(board((mid - tu / 2, onto - tv, top), (mid + tu / 2, onto, top + thick)))
    return fixed, moving


def _open_lid():
    """Rotation of the lid out of the closed position, about the hinge line (along u)."""
    c, s = np.cos(LID_ANGLE), np.sin(LID_ANGLE)
    return np.array([[1.0, 0.0, 0.0], [0.0, c, s], [0.0, -s, c]])


def _world(meshes, origin, axes, opened=False):
    """Meshes in the chest's own frame to CAD millimetres; `opened` also swings them with the lid."""
    R, axis = _open_lid(), hinge_axis()
    out = []
    for V, N, F in meshes:
        if opened:
            V, N = axis + (V - axis) @ R.T, N @ R.T
        out.append((origin + V @ axes.T, N @ axes.T, F))
    return out


def hinge(mesh_dir):
    """The hinge line in CAD millimetres: a point on it, its direction, and how far the lid stands
    open (radians). Turning the lid about that direction by the angle, right-handed, shuts it."""
    o, u, v, w = frame(mesh_dir)
    return o + np.c_[u, v, w] @ hinge_axis(), u, LID_ANGLE


def placement(mesh_dir):
    """Where the inside of the chest is, so that items can be stowed in it later.

    origin  bottom centre of the inside floor, CAD mm
    x_axis / y_axis / z_axis  unit vectors of its length, width and up, in CAD coordinates
    inside  (length, width, height) of the cavity in mm
    """
    o, u, v, w = frame(mesh_dir)
    inside = (LENGTH - 2 * BOARD, WIDTH - 2 * BOARD, HEIGHT - BOARD)
    return dict(origin=o + LENGTH / 2 * u + WIDTH / 2 * v + BOARD * w,
                x_axis=u, y_axis=v, z_axis=w, inside=inside)


def build(mesh_dir):
    """[(id, naam, groep, materiaal, (V, N, F))] for the chest, its lid, its beslag and its beckets."""
    o, u, v, w = frame(mesh_dir)
    axes = np.c_[u, v, w]
    fixed, moving = _beslag()
    handles = becket(0.0, -1.0) + becket(LENGTH, 1.0)
    return [
        ("bakskist", "Bakskist", "interieur", "hout_gelakt", _join(_world(_chest(), o, axes))),
        ("bakskist_deksel", "Deksel van de bakskist", "interieur", "hout_gelakt",
         _join(_world(_lid(), o, axes, opened=True))),
        # what is screwed to the lid belongs to the lid (same id: one part, two materials), so that
        # the viewer can swing the lid shut as one piece
        ("bakskist_deksel", "Deksel van de bakskist", "interieur", "verzinkt",
         _join(_world(moving, o, axes, opened=True))),
        ("bakskist_beslag", "Beslag van de bakskist", "interieur", "verzinkt", _join(_world(fixed, o, axes))),
        ("bakskist_handvatten", "Handvatten van de bakskist", "interieur", "touw",
         _join(_world(handles, o, axes))),
    ]
