"""Rig measurements the viewer needs to animate the boat (sail trim, oars), taken from the CAD.

Everything is returned in model space (metres, x = transom -> bow, y = up, z = starboard); see
build_glb.to_model. Also classifies the unnamed rigging hardware by what it is fixed to, so that
it moves along with boom, gaff or fok.
"""
import numpy as np

import anchor
import bakskist
import borgketting
import fokbeslag
import hardware
import parts
import rigging
import wantkettingen

X_TRANSOM = 737.6


# Midzwaard linkage, CAD millimetres as (x, z): pin holes measured from the solids
ZWAARDBOUT = (4276.2, -22.8)           # the board swings on it
LOPER_FOOT = (3424.9, 58.7)            # pin joining the lower link to the board
BOARD_HOLE = (3458.4, 59.2)            # the board's own hole for the borgpen
KAST_TOP, LOPER_PLATE, LOPER_HALF_HOLE = 500.2, 712.9, 408.8
PIN_REST = KAST_TOP + 6.0              # centre of a hole that hangs on a 13 mm pin lying on the kast


def board_stops():
    """Board angles (degrees, positive lifts) at neer, half and op, solved from the pin geometry."""
    def height(point, angle):
        a = np.radians(angle); dx = point[0] - ZWAARDBOUT[0]; dz = point[1] - ZWAARDBOUT[1]
        return ZWAARDBOUT[1] - dx * np.sin(a) + dz * np.cos(a)

    def solve(point, z):
        lo, hi = -40.0, 60.0
        for _ in range(50):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if height(point, mid) < z else (lo, mid)
        return mid
    return (solve(LOPER_FOOT, LOPER_FOOT[1] - (LOPER_PLATE - KAST_TOP)),
            solve(LOPER_FOOT, LOPER_FOOT[1] + PIN_REST - LOPER_HALF_HOLE),
            solve(BOARD_HOLE, PIN_REST))


def m(p):
    """DWG mm point -> model metres."""
    p = np.asarray(p, float)
    return [round((p[0] - X_TRANSOM) / 1000, 4), round(p[2] / 1000, 4), round(-p[1] / 1000, 4)]


def d(v):
    """DWG mm direction -> model axes; a direction, so it is not moved with the origin."""
    v = np.asarray(v, float)
    return [round(float(v[0]), 5), round(float(v[2]), 5), round(float(-v[1]), 5)]


# Blok van de fokkenschoot, body by body: the harpje it hangs in and its schijf. Both are drawn on
# the second leioog and carried to the forward one by parts.NUDGE.
SCHOOTBLOK = {"bb": ("545F", "5449"), "sb": ("54A2", "548C")}
HARP_BOW = 14.0                        # the bow of the harpje: the part of it that goes round the eye


def schootblokken(mesh_dir):
    """Where each blok van de fokkenschoot hangs, turns and leads, in CAD mm, from the bodies
    themselves: the middle of the bow of its harpje, which stays on the leioog and is what the block
    swings about; the middle of its schijf; and the axle of that schijf, pointing outboard."""
    out = {}
    for key, (harp, schijf) in SCHOOTBLOK.items():
        shift = np.array(parts.NUDGE[harp])
        V = np.load(mesh_dir / f"StagSolids_{harp}.npz")["V"].astype(float) + shift
        S = np.load(mesh_dir / f"StagSolids_{schijf}.npz")["V"].astype(float) + shift
        c = S.mean(0)
        axle = np.linalg.svd(S - c, full_matrices=False)[2][2]      # the schijf is flat: its thinnest way
        out[key] = dict(voet=V[V[:, 2] < V[:, 2].min() + HARP_BOW].mean(0), schijf=c,
                        axle=axle if axle[1] * c[1] > 0 else -axle,
                        straal=float(np.ptp((S - c) @ np.linalg.svd(S - c, full_matrices=False)[2][0])) / 2)   # of the schijf
    return out


def _seg_dist(p, a, b):
    ab = b - a
    t = np.clip((p - a) @ ab / (ab @ ab), 0, 1)
    return float(np.linalg.norm(p - (a + t * ab)))


class Rig:
    def __init__(self, mesh_dir):
        def load(name):
            d = np.load(mesh_dir / f"{name}.npz")
            return d["V"].astype(float), d["F"].astype(int)

        self.mast_c, mast_d, _ = rigging.spar_axis(*load("MastSolids_56A3"), 0.3, 0.8)
        c, d, _ = rigging.spar_axis(*load("GiekSolids_5706"), 0.25, 0.85)
        V = load("GiekSolids_5706")[0]; t = (V - c) @ d
        self.boom = (c + t.min() * d, c + t.max() * d)
        c, d, _ = rigging.spar_axis(*load("GaffelSolids_5693"), 0.35, 0.9)
        V = load("GaffelSolids_5693")[0]; t = (V - c) @ d
        self.gaff = (c + t.min() * d, c + t.max() * d)
        # fok corners (outline of the CAD sail, the tack lowered with its harpje) and the gaffeldraad span
        self.fok_tack = np.array(parts.FOK_TACK); self.fok_head = np.array([4580.0, -0.7, 5090.8])
        self.fok_clew = np.array([4268.7, 722.2, 1134.6])
        Vd = load("StagSolids_5205")[0]
        self.gaffeldraad = (Vd[np.argmin(Vd[:, 0])], Vd[np.argmax(Vd[:, 0])])
        Vp = load("StagSolids_5257")[0]
        self.hanepoot = Vp[Vp[:, 0] < Vp[:, 0].min() + 30].mean(0)
        Vs = load("StagSolids_55F7")[0]
        self.sheet_top = Vs[Vs[:, 2] > Vs[:, 2].max() - 40].mean(0)
        self.sheet_eye = np.array([2528.0, 0.0, 244.0])             # where the shackle of the lower block bears on the grootschootoog
        self.oars = {}
        for pid, name in (("riem_sb", "RiemSolids_5760"), ("riem_bb", "RiemSolids_576B"), ("wrikriem", "RiemSolids_5755")):
            Vo = load(name)[0]
            self.oars[pid] = (Vo[np.argmax(Vo[:, 0])], Vo[np.argmin(Vo[:, 0])])      # handle (fwd), blade (aft)
        self.blocks = {}
        for key, handles in (("boven", "5551 5557 555D 5563 5569 556D 5575 557B 5581 5585 558D 5593 5597"),
                             ("onder", "55C2 55C8 55CC 55D0 55D8 55DE 55E4 55E8 55EB 55EF 55F3")):
            P = np.vstack([load(f"StagSolids_{h}")[0] for h in handles.split()])
            self.blocks[key] = P
        self.dolpotten = hardware.dolpot_axes(mesh_dir)      # top centre of every rowlock socket
        self.mikhouders = hardware.mikhouder_axes(mesh_dir)  # the two pipes the mik is stowed in
        self.kist = bakskist.hinge(mesh_dir)
        self.borg = borgketting.points(mesh_dir)
        self.anker = anchor.reference_points(mesh_dir)       # eye of the ankeroog, shackle on the shank
        self.boegspriet = fokbeslag.spriet_lift(mesh_dir)   # from the hanekam onto the upper flange
        self.schootblokken = schootblokken(mesh_dir)         # harpje, schijf and axle of either fokkenschootblok
        top = self.mast_c + [0.0, 0.0, 5665.2 - self.mast_c[2]]      # the flat top of the masttopring
        self.kluiver = dict(hals=fokbeslag.spriet_eye(mesh_dir), top=top)   # hals and top of the kluiver
        self.wanten = wantkettingen.ogen(mesh_dir)           # both ends of either want

    def attachment(self, centre):
        """What an unnamed piece of rigging hardware is fixed to: 'giek', 'gaffel', 'fok' or None."""
        if _seg_dist(centre, *self.boom) < 160:
            return "giek"
        if _seg_dist(centre, *self.gaff) < 160 or _seg_dist(centre, *self.gaffeldraad) < 120 \
                or np.linalg.norm(centre - self.hanepoot) < 150:
            return "gaffel"
        return None

    def extras(self):
        mast_at = lambda z: self.mast_c + np.array([0, 0, z - self.mast_c[2]])
        return dict(
            mast=dict(punt=m(mast_at(1318.0)),                               # vertical: the mast has no rake
                      top=m(mast_at(5665.2))),
            voorstag=dict(hals=m(self.fok_tack), top=m(self.fok_head)),      # the fok turns about this line
            fok_schoothoek=m(self.fok_clew),
            # Each fokkenschoot: schoothoek -> block on the forward leioog -> hand of the crew. The
            # viewer lays both anew for every position of the fok; the sheet to windward goes
            # round the front of the mast. voet = the bow of the harpje, which stays on the leioog and
            # is what the block swings about; schijf = the middle of its sheave; as = that sheave's
            # axle, so the viewer can stand the sheave in the plane of the two parts of the sheet.
            fokkenschoot={key: {"voet": m(self.schootblokken[key]["voet"]),
                                "schijf": m(self.schootblokken[key]["schijf"]),
                                "as": d(self.schootblokken[key]["axle"]),
                                "schijf_straal_m": round(self.schootblokken[key]["straal"] / 1000, 4),
                                "hand": m([rigging.SCHOOT_HAND[0], side * rigging.SCHOOT_HAND[1], rigging.SCHOOT_HAND[2]])}
                          for key, side in (("bb", 1.0), ("sb", -1.0))} | dict(straal_m=rigging.SCHOOT_R / 1000.0, mast_straal_m=0.046),
            # The grootschoot is a tackle, laid by the viewer: made fast to the becket under the
            # upper block, down round one sheave of the lower block, up over the upper sheave, down
            # round the other lower sheave and from there to the hand of the helmsman.
            grootschoot=dict(oog=m(self.sheet_eye), giek=m(self.sheet_top),
                             hondsvot=m([2493.6, -0.8, 1092.0]), schijf_boven=m([2494.4, -0.8, 1172.8]),
                             schijven_onder=[m([2493.6 + dx, y + dy, 312.1 + dz]) for y in (-3.2, 8.8)
                                             for dx, dy, dz in [parts.ONDERBLOK_SHIFT]],
                             schijf_straal_m=0.020, straal_m=0.0045,
                             # the helmsman sits on the achterdek (top at z = 625) with the sheet in hand
                             hand=m([1950.0, 330.0, 880.0]), dek_m=0.632),
            # the giek turns on the lummelbout, which stands in the lips of the mastband
            lummelbout=m([4309.1, -1.1, 1318.0]), giek_nok=m([1490.0, -1.2, 1318.0]),
            hanepoot=m(self.hanepoot),
            riemen={pid: dict(handvat=m(h), blad=m(b)) for pid, (h, b) in self.oars.items()},
            # top rim of each dolpot (pipeline/hardware.py builds them; the CAD has neither pots
            # nor dollen). A dol stands in its pot with the riem lying 50 mm above that rim.
            dolpotten={key: m(p) for key, p in self.dolpotten.items()},
            dollen={key: m(self.dolpotten[key] + [0.0, 0.0, 50.0])
                    for key in ("sb_voor", "bb_voor", "sb_achter", "bb_achter")},
            # the two pipes on the forward face of the achterschot the mik stands in: top rim of
            # the upper one and bottom rim of the lower one, on their common vertical axis
            mik=dict(houder_boven=m(self.mikhouders[0]), houder_onder=m(self.mikhouders[1])),
            # ankergerei (pipeline/anchor.py): the eye of the ankeroog in the bow and the shackle
            # on the shank, the two ends the ankerlijn and the ankerketting are made fast to
            anker=dict(oog=m(self.anker["oog"]), schakel=m(self.anker["schakel"])),
            # the boegspriet (fokbeslag.build_spriet): how far what is made fast to the hanekam goes
            # when it is made fast to the upper flange instead, model axes
            # the kluiver: the luff it is set on, from the hook on the boegspriet to the top of the
            # mast; the viewer lays the fok's own cloth over it
            kluiver=dict(hals=m(self.kluiver["hals"]), top=m(self.kluiver["top"])),
            boegspriet=dict(verplaatsing=[round(self.boegspriet[0] / 1000, 4), round(self.boegspriet[2] / 1000, 4),
                                          round(-self.boegspriet[1] / 1000, 4)]),
            # either want: the eye at the hommerring and the thimble eye at its foot, where the
            # wantketting takes over (pipeline/wantkettingen.py, which shortens the wire for it)
            wanten={side: dict(top=m(p["top"]), oog=m(p["oog"])) for side, p in self.wanten.items()},
            # The zwaardloper is a linkage, and every number here is a pin hole in the CAD.
            # The foot of the lower link is pinned to the zwaard (both have a hole at 3424.9, 58.7),
            # the two links are pinned together at the knuckle (3427.1, 353.8), and the borgpen goes
            # through a hole in the loper or through the board's own second hole (3458.4, 59.2).
            # The kast top (z = 500.2) is a slot 250 mm long, so the loper hangs plumb over its foot.
            zwaardloper=dict(voet=m([*LOPER_FOOT[:1], 0.0, LOPER_FOOT[1]]), knik=m([3427.1, 0.0, 353.8]),
                             pen=m([3427.6, 0.0, LOPER_HALF_HOLE]),    # the hole the borgpen uses at half
                             # the borgpen hangs on a short chain from an eye on the rim of the kast,
                             # set between the two places the pin is used so the chain reaches both
                             kettingoog=m([3545.0, -52.0, 505.0]), ketting_m=0.13),
            # Board angles from the drawn position, positive lifts it. Neer: the shoulder plate of
            # the loper lands on the kast top. Half: the pin through the lowest hole of the upper
            # link rests on the kast top. Op: the pin through the board's own hole rests there.
            zwaard=dict(bout=m([ZWAARDBOUT[0], 0.0, ZWAARDBOUT[1]]),
                        hoek_graden=[round(a, 2) for a in board_stops()],
                        penhole=m([BOARD_HOLE[0], 0.0, BOARD_HOLE[1]])),
            # the blocks of the grootschoot hang from the schootring and stand on the grootschootoog
            blokken=dict(boven=m(self.blocks["boven"][np.argmax(self.blocks["boven"][:, 2])]),
                         onder=m(self.sheet_eye)),
            # end of the klauwval, shackled to a strop on the klauw of the gaffel
            klauwval=dict(klauw=m([4260.0, -1.0, 4114.0])),
            # Reven (rolrif): the sail is rolled round the giek. onderlijk_m = height of the foot of the
            # sail, straal_m = giek plus a layer of cloth, schuif_m = how far aft the schootring is slid
            # to clear the sail (past the schoothoek, up to the nok), hoep_* = the hoops of the
            # schootring (the sheet moves to the port one).
            reven=dict(onderlijk_m=1.3316, straal_m=0.0257, schuif_m=0.925, max_slagen=5,      # a sixth turn would roll up the lowest zeillat
                      
                       hoep_bb=m(list(hardware.SCHOOTRING_HOOP_BB)), hoep_sb=m(list(hardware.SCHOOTRING_HOOP)),
                       wervel_onder=m(list(hardware.wervel_holes()[1]))),
            # borgkettinkje of the rudder: eye on the rudder (turns with it), hook on the spiegel
            borgketting={k: m(list(v)) for k, v in self.borg.items() if k in ('oog', 'haak')},
            # the lid of the bakskist is modelled open; the viewer shuts it about this line
            bakskist=dict(scharnier=m(list(self.kist[0])), richting=[float(self.kist[1][0]), float(self.kist[1][2]), float(-self.kist[1][1])],
                          open_graden=round(float(np.degrees(self.kist[2])), 2)),
            # Dirk of kraanlijn (not in the CAD): from the wervel on the nok of the giek up to a double
            # block hung on the after side of the hommerring, and down the port side of the mast to the
            # upper port kikker on the mastkoker, the only free one (piekenval, klauwval and fokkenval
            # have the other three).
            kraanlijn=dict(wervel=m(list(hardware.wervel_holes()[0])),   # made fast in the upper hole of the wervel
                           oog=m([4300.0, 28.0, 4792.0]),
                           val=[m([4337.0, 63.0, 693.0])], straal_m=0.003),   # as thick as the vallen in the CAD
            # the vlaggenstok stands in the open top of the roerkoning (a 1" tube, raked 33.7 degrees aft)
            vlaggenstok=dict(voet=m([594.0, -7.9, 1022.1]), richting=[-0.5546, 0.8321, 0.0010]),
            wrikgat=m([738.0, -278.0, 932.0]),                               # oar resting in the U of the transom pipe (starboard)
            waterlijn_m=0.30,
        )
