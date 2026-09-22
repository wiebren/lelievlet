"""Which DWG body is which part of the lelievlet.

Bodies in the official DWG carry no names, only a layer and a handle. They were identified by
size and position against the Vlettenboek (Vademecum deel 8) drawings and the numbered parts
diagram of the Katwijkse Zeeverkenners instruction book. DWG axes: X towards the bow, Y towards
port (bakboord), Z up; millimetres.

PARTS maps handle -> (part id, Dutch name, group, material). Several bodies may share a part id
(e.g. both halves of a wrang); SB/BB variants get their own id.
Anything not listed falls back to DEFAULT_BY_LAYER.
"""

# group ids double as top-level nodes in the exported scene
GROUPS = {
    "romp": "Romp (casco)", "roer": "Roer", "zwaard": "Zwaard en zwaardkast", "interieur": "Interieur",
    "beslag": "Beslag", "rondhout": "Rondhouten", "zeil": "Zeilen", "staand_want": "Staand want",
    "lopend_want": "Lopend want", "roeien": "Roeien en wrikken",
}

MATERIALS = {  # base colour (sRGB 0..1), metallic, roughness, double sided
    # Paint zones: the viewer's "Aanpassen" menu recolours these by material name.
    "romp": ((0.035, 0.035, 0.04), 0.0, 0.40, False),        # hull outside incl. everything below the waterline
    "berghout": ((0.035, 0.035, 0.04), 0.0, 0.40, False),
    "boeisel": ((0.96, 0.76, 0.05), 0.0, 0.40, False),
    "dolboord": ((0.035, 0.035, 0.04), 0.0, 0.40, False),    # incl. voorplecht and hanekam
    "voordek": ((0.56, 0.58, 0.60), 0.0, 0.75, False),
    "achterdek": ((0.56, 0.58, 0.60), 0.0, 0.75, False),
    "kuip": ((0.56, 0.58, 0.60), 0.0, 0.60, False),          # inside of the plating, spanten, schotten
    "zwaardkast": ((0.56, 0.58, 0.60), 0.0, 0.60, False),    # incl. zwaardloper, mastkoker and what is fixed to them
    "bakskleur": ((0.78, 0.06, 0.18), 0.0, 0.45, False),     # accent colour of the bak (ploeg): bands and beslag
    # everything else
    "verzinkt": ((0.62, 0.64, 0.66), 0.6, 0.45, False),
    "rvs": ((0.75, 0.76, 0.78), 0.9, 0.30, False),
    "hout_gelakt": ((0.62, 0.40, 0.20), 0.0, 0.35, False),
    "hout_vlonder": ((0.55, 0.42, 0.28), 0.0, 0.70, False),
    "zeildoek": ((0.93, 0.90, 0.82), 0.0, 0.85, True),
    "zeillat": ((0.70, 0.55, 0.35), 0.0, 0.70, True),
    "zeil_lijk": ((0.97, 0.95, 0.89), 0.0, 0.80, False),     # tape along the edges of a sail
    "zeil_hoek": ((0.84, 0.80, 0.70), 0.0, 0.80, False),     # reinforcement patch in a corner
    "zeil_teken": ((1.00, 1.00, 1.00), 0.0, 0.85, False),    # zeilteken; the viewer paints it
    "zeil_nummer": ((1.00, 1.00, 1.00), 0.0, 0.85, False),   # zeilnummer; the viewer paints it
    "touw": ((0.85, 0.82, 0.72), 0.0, 0.90, False),
    "touw_zwart": ((0.05, 0.05, 0.06), 0.0, 0.85, False),     # landvasten: black polypropylene
    "kunststof_wit": ((0.93, 0.93, 0.91), 0.0, 0.55, False),  # EHBO-koffer
    "ehbo_rood": ((0.80, 0.07, 0.10), 0.0, 0.55, False),      # its lettering
    "blok": ((0.20, 0.20, 0.22), 0.1, 0.50, False),
}

P = {}


ONDERBLOK_SHIFT = (39.5, -2.8, -2.0)
# the two blocks of the fokkenschoot, body by body
ONDERBLOK_GROOTSCHOOT = "55C2 55C8 55CC 55D0 55D8 55DE 55E4 55E8 55EB 55EF 55F3"
FOKKENSCHOOTBLOK = {"bb": "5449 544F 5453 5457 545B 545F 5467", "sb": "548C 5492 5496 549A 549E 54A2 54AA"}


def _add(handles, pid, naam, groep, materiaal):
    for h in handles.split():
        P[h] = (pid, naam, groep, materiaal)


# ---- hull plating (PartSolids-Long Shell)
_add("583C", "vlak_bb", "Vlak (bakboord)", "romp", "romp")
_add("583F", "vlak_sb", "Vlak (stuurboord)", "romp", "romp")
_add("5A0B", "kim_bb", "Kim (bakboord)", "romp", "romp")
_add("5A0C", "kim_sb", "Kim (stuurboord)", "romp", "romp")
_add("5827", "boeisel_bb", "Boeisel (bakboord)", "romp", "romp")
_add("5A33", "boeisel_sb", "Boeisel (stuurboord)", "romp", "romp")
_add("5873", "achterdek", "Achterdek", "romp", "achterdek")
_add("59D4", "voordek", "Voordek", "romp", "voordek")

# ---- plate parts (PartSolids-Frame)
_add("582A", "spiegel", "Spiegel", "romp", "romp")
_add("5881", "scheg", "Scheg", "romp", "romp")
_add("59F2", "achterschot", "Schot achterste luchtkast", "romp", "kuip")
_add("59E9", "voorschot", "Schot voorste luchtkast", "romp", "kuip")
_add("59FB 5831 5833 5838 5835 583A 5837 5839 5A02", "spanten", "Spanten (wrangen)", "romp", "kuip")
_add("5A1A 5A1B 5A23", "voorplecht", "Voorplecht", "romp", "bakskleur")   # Vlettenboek p. 35: "PLECHT dik 4 mm iets bol"
_add("5A0D", "grootschootoog_steun", "Steun grootschootoog", "beslag", "verzinkt")
_add("58DD 58ED 58E5 58D5", "dofthouders", "Dofthouders", "interieur", "kuip")
_add("5843 5855", "zwaardkast", "Zwaardkast", "zwaard", "zwaardkast")
_add("5857", "zwaard", "Zwaard", "zwaard", "romp")
# The zwaardloper is a rod in two links. Up to the half stop it only slides, held by a borgpen
# through one of its holes; fully up the pin goes through the board's own hole and the rod folds
# away. Both links carry the same name, so the viewer shows one part.
_add("585D", "zwaardloper_onder", "Zwaardloper", "zwaard", "zwaardkast")
_add("585B 5976", "zwaardloper_boven", "Zwaardloper", "zwaard", "zwaardkast")
_add("585F 5860", "zwaardstrippen", "Strippen zwaardsleuf", "zwaard", "romp")
_add("5853", "mastkoker", "Mastkoker", "romp", "zwaardkast")
_add("5980", "wantputting_bb", "Wantputting (bakboord)", "beslag", "verzinkt")
_add("5981", "wantputting_sb", "Wantputting (stuurboord)", "beslag", "verzinkt")
_add("589A", "hanekam", "Hanekam", "beslag", "bakskleur")
_add("58B7", "roerblad", "Roerblad", "roer", "romp")
_add("58C8", "roerkop", "Roerkop (helmhoutbeslag)", "roer", "bakskleur")

# ---- profiles (StiffenerSolids) and contour parts
_add("58B8", "roerkoning", "Roerkoning", "roer", "romp")
_add("5A27 5A2F 5A2B", "vingerlingen", "Vingerlingen", "roer", "romp")          # the pieces of tube on the spiegel
_add("5A3B", "dolboord_bb", "Dolboord (bakboord)", "romp", "dolboord")
_add("5A65", "dolboord_sb", "Dolboord (stuurboord)", "romp", "dolboord")
_add("5A11", "berghout_bb", "Berghout (bakboord)", "romp", "berghout")
_add("58F5", "berghout_sb", "Berghout (stuurboord)", "romp", "berghout")
_add("5A6C", "spiegelrand", "Dolboord over de spiegel", "romp", "dolboord")
_add("5A1F", "boegrand", "Dwarsbuis voordek", "romp", "dolboord")
_add("5A6F", "dekcontour", "Contour boeisel", "romp", "verzinkt")
_add("589B 589F", "landvastogen", "Landvastogen", "beslag", "verzinkt")
_add("5867 5876 587A 586B", "hijsogen", "Hijsogen", "beslag", "verzinkt")
_add("5900", "grootschootoog", "Grootschootoog", "beslag", "verzinkt")
_add(FOKKENSCHOOTBLOK["bb"], "blok_fokkenschoot_bb", "Blok fokkenschoot (bakboord)", "lopend_want", "verzinkt")
_add(FOKKENSCHOOTBLOK["sb"], "blok_fokkenschoot_sb", "Blok fokkenschoot (stuurboord)", "lopend_want", "verzinkt")
_add("594B 594F 5947 5943", "leiogen_bb", "Leiogen fokkenschoot (bakboord)", "beslag", "verzinkt")
_add("595B 595F 5957 5953", "leiogen_sb", "Leiogen fokkenschoot (stuurboord)", "beslag", "verzinkt")
_add("5920 5928 591C 5924", "kikkers_mastkoker", "Kikkers op de mastkoker", "beslag", "zwaardkast")
_add("592C 5930", "kikkers_voordek", "Kikkers op het voordek", "beslag", "verzinkt")

# ---- interior wood
_add("5742", "doft_achter", "Achterste doft", "interieur", "hout_gelakt")
_add("5744", "doft_voor", "Voorste doft (mastdoft)", "interieur", "hout_gelakt")
_add("5737", "helmstok", "Helmhout", "roer", "hout_gelakt")

# ---- spars, sails
_add("56A3", "mast", "Mast", "rondhout", "hout_gelakt")
_add("5706", "giek", "Giek", "rondhout", "hout_gelakt")
_add("5728", "lummelbout", "Lummelbout", "rondhout", "verzinkt")
_add("5693", "gaffel", "Gaffel", "rondhout", "hout_gelakt")
_add("5603", "grootzeil", "Grootzeil", "zeil", "zeildoek")
_add("5434", "fok", "Fok", "zeil", "zeildoek")
_add("5607 5608 5609 560A 560B 560C", "zeillatten", "Zeillatten", "zeil", "zeillat")

# ---- fittings of the rig that have a name of their own (numbers: the parts drawing)
_add("525D", "strop_gaffel", "Strop van de gaffel", "beslag", "verzinkt")                  # 26
_add("5267 526F 5275", "harpje_strop", "Harpje", "beslag", "verzinkt")                    # klauwval to strop
_add("5209 5211 5217", "hanepootloper", "Hanepootloper", "beslag", "verzinkt")            # 82
_add("53DF 53E9 53F3 53FD", "kettinkje_fok", "Kettinkje", "beslag", "verzinkt")           # 38: hals of the fok to the hanekam
_add("5253 521D 5225 524F 5241 524B 5247", "blok_piekenval", "Blok piekenval", "lopend_want", "verzinkt")
_add("52B1 5299 5291 52AD 529F 52A9 52A5", "blok_klauwval", "Blok klauwval", "lopend_want", "verzinkt")
_add("515C 5164 53A7 53AF", "harpjes_fok", "Harpjes", "beslag", "verzinkt")           # either end of that kettinkje; they come off with the fok
_add("5420 5428 542E", "harpje_fokkenval", "Harpje", "beslag", "verzinkt")            # fokkenval to the head of the fok
_add("5408", "blok_fokkenval", "Blok fokkenval", "lopend_want", "verzinkt")
# the harpjes on the masttopring and the hommerring go down with the mast, so they are a part of their own
_add("516A 5172 5178 5180 51BC 51AE 51B4 51A6 5194 518C", "harpjes_mast", "Harpjes", "beslag", "verzinkt")

# ---- standing and running rigging (the long bodies of StagSolids)
_add("51D0", "voorstag", "Voorstag met spanner", "staand_want", "rvs")
_add("51C2", "want_bb", "Bakboord zijstag", "staand_want", "rvs")
_add("519A", "want_sb", "Stuurboord zijstag", "staand_want", "rvs")
_add("5437", "fokkenval", "Fokkenval", "lopend_want", "touw")
_add("52B5", "klauwval", "Klauwval", "lopend_want", "touw")
_add("5257", "piekenval", "Piekenval", "lopend_want", "touw")
_add("5205", "gaffeldraad", "Gaffeldraad", "lopend_want", "rvs")
_add("52E9", "marllijn_gaffel", "Marllijn (gaffel)", "lopend_want", "touw")
_add("5324", "marllijn_giek", "Marllijn (giek)", "lopend_want", "touw")
_add("535D", "rijglijn", "Rijglijn", "lopend_want", "touw")
_add("55F7", "grootschoot", "Grootschoot met blokken", "lopend_want", "touw")
_add("547B 5484", "fokkenschoot", "Fokkenschoot", "lopend_want", "touw")
# the two blocks of the grootschoot: they hang in the sheet and tilt with it
_add("5551 5557 555D 5563 5569 556D 5575 557B 5581 5585 558D 5593 5597",
     "blok_grootschoot_giek", "Bovenblok grootschoot", "lopend_want", "verzinkt")
_add(ONDERBLOK_GROOTSCHOOT,
     "blok_grootschoot_kuip", "Onderblok grootschoot", "lopend_want", "verzinkt")

# ---- rowing
_add("5755", "wrikriem", "Wrikriem", "roeien", "hout_gelakt")
_add("5760", "riem_sb", "Roeiriem (stuurboord)", "roeien", "hout_gelakt")
_add("576B", "riem_bb", "Roeiriem (bakboord)", "roeien", "hout_gelakt")

PARTS = P

DEFAULT_BY_LAYER = {
    "BuikdenningSolids": ("buikdenning", "Vlonder", "interieur", "hout_vlonder"),
    "StagSolids": ("harpjes", "Harpjes", "beslag", "verzinkt"),      # what is left once the named fittings below are out
    "StiffenerSolids": ("profiel", "Profiel", "romp", "verzinkt"),
    "PartSolids-Frame": ("plaatdeel", "Plaatdeel", "romp", "kuip"),
}

# Thin solids exported as a single double-sided skin (avoids coincident front/back faces)
SINGLE_SKIN = {"5603", "5434"}

# Plates painted differently inside and out: part id -> (outside material, inside material).
# The exporter splits their triangles by whether the normal points away from the boat's interior.
TWO_TONE = {
    "vlak_bb": ("romp", "kuip"), "vlak_sb": ("romp", "kuip"),
    "kim_bb": ("romp", "kuip"), "kim_sb": ("romp", "kuip"),
    "boeisel_bb": ("boeisel", "kuip"), "boeisel_sb": ("boeisel", "kuip"),
    "spiegel": ("romp", "kuip"),
}

# Unnamed rigging hardware that is fixed to a moving spar or sail goes into its own part, so the
# viewer can move it along (pipeline/rig_data.py decides which by position).
HARDWARE = {
    "giek": ("schootring", "Schootring", "beslag", "verzinkt"),
    "gaffel": ("beslag_gaffel", "Banden van de gaffeldraad", "beslag", "verzinkt"),
}

# Stretches of a body that are a part of their own: handle -> [(axis, min, max, part entry)], DWG mm,
# or [(B-rep faces, part entry)] where no range along an axis tells the part from the rest of the body.
REGION_SPLITS = {
    # The wrikgat is only the half-round cup, the U-shaped cradle the wrikriem rests in; it is never
    # painted. The straight pipe butts onto both ends of the cup, so no range separates them by more
    # than half a millimetre; the cup is named by face instead (all of 7..55 bar the pipe segments),
    # and the stubs either side stay with the rest of the body, the dolboord over the spiegel.
    # The roerkoning is only the straight tube (its wall and two ends, faces 0..2); the three hooks
    # welded to it, which drop into the vingerlingen, are the roerhaken.
    "58B8": [(set(range(3, 36)), ("roerhaken", "Roerhaken", "roer", "romp"))],
    "5A6C": [(set(range(7, 56)) - {32, 39, 41, 47, 51}, ("wrikgat", "Wrikgat", "romp", "verzinkt"))],
    # the metal bands are faces of the mast solid: band with ears for the lummelbout, hommerring, masttopring
    "56A3": [(2, 1288.0, 1336.5, ("mastband_lummel", "Mastband met lummelbeslag", "rondhout", "bakskleur")),
             # the hommerring rests on a shoulder of the mast at z = 4765.2: that ledge is wood, so start above it
             (2, 4766.5, 4793.0, ("hommerring", "Hommerring", "rondhout", "bakskleur")),
             # the masttopring caps the mast, so the flat top at z = 5665.2 belongs to the ring
             (2, 5634.5, 5666.0, ("masttopring", "Masttopring", "rondhout", "bakskleur"))],
    # The giek body carries its end fittings. The wervel is only the outermost plate aft, and the
    # lummelbeslag only the fork that reaches the mast - the bands that wrap the giek are neither.
    "5706": [(0, 1400.0, 1501.0, ("wervel", "Wervel", "rondhout", "bakskleur")),
             # the two steel bands have no name of their own: they are part of the giek, but keep
             # their own paint (bakskleur) instead of the varnish of the spar
             (0, 1501.0, 1560.0, ("giek", "Giek", "rondhout", "bakskleur")),
             (0, 4100.0, 4255.0, ("giek", "Giek", "rondhout", "bakskleur")),
             (0, 4255.0, 4400.0, ("lummelbeslag", "Lummelbeslag", "rondhout", "bakskleur"))],
    # the klauw: the jaws at the lower end of the gaffel that grip the mast
    "5693": [(2, 3880.0, 4115.0, ("klauw", "Klauw", "rondhout", "hout_gelakt"))],
}

# Painted bands in the bakskleur: handle -> [(axis, measured from, start, end)] in mm; axis is 0/1/2 for
# X/Y/Z or a direction vector. The mesh is cut
# along the two planes, so the band is exactly as wide as stated; it stays part of the same part.
BANDS = {
    "5742": [(1, "both", 50.0, 100.0)], "5744": [(1, "both", 50.0, 100.0)],      # doften: 5 cm band, 5 cm from each end
    "5737": [(0, "max", 50.0, 100.0)],                                           # helmstok: from its free end
    "5760": [(0, "max", 162.0, 212.0)], "576B": [(0, "max", 162.0, 212.0)],      # roeiriemen: just past the handle
    "5755": [(0, "max", 180.0, 230.0)],                                          # wrikriem: its handle is longer
    # gaffel: the last 5 cm of both jaws of the klauw (they run horizontally forward past the mast), and a
    # band 5 cm from the peak, cut square to the gaff (its axis as fitted by rigging.spar_axis)
    "5693": [(0, "max", 0.0, 50.0), ((-0.6600, -0.0002, 0.7512), "max", 50.0, 100.0)],
}
BAND_MATERIAL = "bakskleur"

# CAD leftovers that are not part of the boat. 559B: a 5 mm disc without thickness on one roller
# of the schootring, the end face of an axle pin that was never drawn.
# 514E, 5156: the harpje between voorstag and hanekam; the voorstagspanner with its pelikaanhaak
# (pipeline/fokbeslag.py) takes its place.
# 546D 5475: a harpje drawn in the schoothoek of the fok; the fokkenschoot is knotted to the sail
DROP = {"559B", "514E", "5156", "546D", "5475"}

# Small corrections to the CAD, in DWG mm (dx, dy, dz). The blocks of the fokkenschoot are drawn
# on the second leioog; they belong on the forward one by the want (5943 to port, 5953 to
# starboard), so they are carried from the top of the one eye to the top of the other.
# (The wantputtingen stay where the CAD has them, so the harpjes of the want still go through
# their holes; hardware.reshape() extends the plates down onto the dolboord instead.)
NUDGE = {h: (460.0, 4.4 * side, 20.3)
         for key, side in (("bb", 1.0), ("sb", -1.0)) for h in FOKKENSCHOOTBLOK[key].split()}
# The lower block of the grootschoot is drawn 40 mm aft of the grootschootoog, its shackle beside
# the eye instead of through it. Moved forward, the shackle pin passes under the top of the eye.
NUDGE |= {h: ONDERBLOK_SHIFT for h in ONDERBLOK_GROOTSCHOOT.split()}
# The legs of the grootschootoog stop 2 mm above the flange of the spant (59FB) they are welded to.
NUDGE["5900"] = (0.0, 0.0, -2.0)
# The kikkers on the voordek are bent rod welded to the inside of the boeisel by their middle bend;
# the CAD leaves 2.8 mm of air there. Moved square onto the plating (found by check_attached.py).
NUDGE["592C"] = (1.9, 3.3, 0.1)
NUDGE["5930"] = (1.9, -3.3, 0.1)
# The helmstok is drawn 10 mm to port of the roerkop, one cheek of the slot through it; moved onto
# the middle of the slot (the cheeks stand 28 mm apart round y = -7.8, on the roer's centre line).
NUDGE["5737"] = (0.0, -10.2, 5.8)                 # and 6 mm up, snug under the top of the roerkop
# The kettinkje of the fok is drawn 23 mm short: the harpje at its top (53A7, pin 53AF) stands
# clear of the last link, where the one at its foot hangs in the first. Carried down the chain
# until it hangs in its link the same way. Its pin goes through the halshoek of the fok, so the
# tack comes down with it: FOK_TACK is the corner the rest of the pipeline uses, and
# pipeline/sails.py stretches the cloth to it.
HALS_SHIFT = (7.1, 0.0, -22.0)
NUDGE |= {h: HALS_SHIFT for h in ("53A7", "53AF")}
FOK_TACK_CAD = (6126.2, -7.3, 1266.7)
FOK_TACK = tuple(c + s for c, s in zip(FOK_TACK_CAD, HALS_SHIFT))
