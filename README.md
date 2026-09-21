# Lelievlet 3D

Interactive 3D model of the lelievlet (Scouting Nederland) for instruction lessons, part-name
quizzes and group-colour customisation. Geometry comes from the official Scouting Nederland CAD
model; names and dimensions are checked against the Vlettenboek and the class rules.

| Folder | What |
|---|---|
| `reference/` | Source material and its index — start at `reference/README.md` |
| `pipeline/` | DWG bodies → meshes → `web/public/models/lelievlet.glb` |
| `web/` | Vite + three.js viewer |
| `build/` | Generated: mesh cache, tessellation report, preview renders (safe to delete) |

## What is and is not in this repository

The source of the viewer (`web/`) and of the model pipeline (`pipeline/`) are here, together with the
built model (`web/public/models/lelievlet.glb` + `lelievlet.parts.json`). The reference material the
model was built from (the official Scouting Nederland DWG, the Vlettenboek, the CWO course books) is
NOT included: it is not ours to redistribute. Without `reference/cad/` the first two pipeline steps
(extracting and tessellating the CAD bodies) cannot be run; everything else works from the built model.
No licence has been chosen yet.

## Run the viewer

    cd web && pnpm install && pnpm dev        # http://localhost:5173

## Rebuild the model

    OCP='--python 3.12 --with cadquery-ocp>=7.8,<7.9 --with ezdxf --with numpy'
    uv run $OCP python3 pipeline/tessellate_all.py --force      # ACIS bodies -> build/mesh (≈15 s)
    uv run --python 3.12 --with numpy --with scipy python3 pipeline/build_glb.py
    uv run --python 3.12 --with numpy --with pillow python3 pipeline/render_preview.py build/preview/iso.png --view iso

`cadquery-ocp` is pinned to 7.8: the 8.x wheels dropped the `TColgp`/`TColStd` array classes.

## Pipeline

1. `reference/cad/extract_sab.py` pulls the 222 binary ACIS bodies out of the DWG (see
   `reference/cad/README.md` for why `dwg2dxf` must not be used).
2. `pipeline/acis_occ.py` rebuilds each body in OpenCascade: analytic surfaces exactly, spline
   surfaces from their NURBS data, loops from the ACIS co-edge directions; faces are sewn per
   body and closed shells oriented as solids. On tori and spheres both sides of a loop are
   bounded, so there the ACIS rule decides which side is the face (flip the loops iff the face is
   reversed with respect to the rebuilt surface; verified on 1372 of 1373 unambiguous faces).
   Picking the smaller side instead loses every eye, ring and shackle bow. When those loops
   enclose a negative area they are the weld of an eye and the face is the whole surface minus
   that patch, which OpenCascade cannot mesh (the patch crosses the seam); the whole surface is
   emitted instead, since the patch is buried inside the part the eye is welded to. 6934 of 6936 faces convert; the two misses are a
   0.6 mm sliver on the giek and a 3 mm cylinder wall inside one rigging fitting.
3. `pipeline/tessellate_all.py` meshes with exact surface normals and a per-body triangle budget
   (ropes are coarsened) — ≈ 500 k triangles in total.
4. `pipeline/parts.py` names the bodies (handle → part id, Dutch name, group, material), identified
   by size and position against the Vlettenboek. Unlisted rigging hardware falls into one
   collective part for now.
5. `pipeline/sails.py` replaces the flat 0.1 mm CAD sails by cambered cloth on the same outline,
   with UVs, panel seams measured from the zeilplan (Vlettenboek p. 60: cross-cut, 90 cm cloth,
   perpendicular to clew → peak/head) and the positions of zeilteken and cijfers (p. 58: lelie + V
   38 cm wide, cijfers 30 × 20 cm, stuurboord het hoogst). The viewer paints the texture
   (`web/src/sails.js`) so the sail number can be changed live.
6. `pipeline/rigging.py` regenerates geometry the CAD gets wrong. The blocks of the
   fokkenschoot are drawn on the second leioog; they belong on the forward one by the want
   (bodies 5943 / 5953), so `NUDGE` in `pipeline/parts.py` carries them there and the sheet runs
   schoothoek -> block -> hand of the crew (the viewer lays it live, see below). The roerkop is drawn as two
   loose 2 mm side plates; it is one plate folded over a radius with the helmstok slotting up
   into it from below, so the folded band along their top edge is generated and added.
   It also regenerates both marllijnen with proper marlsteken (the CAD winds a
   plain helix): line along the lijk, one tucked turn at every zeilring, first ring at 100 mm,
   then every 200 mm. Drawn Ø4 instead of the specified Ø3 so it stays visible.
   `pipeline/hardware.py` adds fittings from the holes the CAD does have: the **mastbout** (top
   hole of the mastkoker, through the mast) and the **grendelbout** (bottom hole, in front of
   the mast foot), round lips with a hole on the mastband so the lummelbout stands in them, the
   **borglijntje** from the lummelbout to the eye on the beslagband of the giek, and the foot of
   each wantputting, carried down onto the dolboord (the CAD stops it 9 mm above, in mid-air;
   the plate itself is not moved, so the harpje of the want still goes through its hole).
   It also builds the six **dolpotten** (Vlettenboek p. 23 and p. 35): 3/4" pipe 100 mm long,
   open at both ends, standing vertical against the inboard side of the dolboord with its top
   level with it, at x = 4412 / 3432 / 2488 both sides, each with the 4 mm plate that fills the
   wedge between pot and boeisel over its lower 50 mm. Sheer and beam change along the boat, so
   the dolboord circle and the inside of the plating are measured at every station. The dollen
   themselves are built in the viewer, on `extras.tuig.dolpotten`.
   The two **mikhouders** are the same pipe, 50 mm long, standing one above the other on the
   centreline against the forward face of the achterschot — a flat vertical plate at x = 2041.2,
   so the wall touches it along a line and no filler plate is needed — the upper one with its top
   40 mm below the top edge of that face and the lower one 250 mm under it. The **mik** itself
   (Vademecum p. 35) is built in the viewer (`makeMik`), on `extras.tuig.mik`.
   `pipeline/sleepogen.py` makes the **sleepogen** on the outside of the spiegel by mirroring the
   landvastogen (CAD bodies 589B, 589F) in the middle plane of the plate.
   `pipeline/anchor.py` adds the **ankergerei**, of which the CAD has nothing: the **anker**
   (the galvanised Danforth of scoutingvlet.nl, about 7.5 kg — no dimensions are published, so
   its 6 mm plate is stepped off two photographs and comes to 7.6 kg of steel), its metre of 6 mm
   **ankerketting** (DIN 766, 54 links of a stadium-shaped ring each) and about 6.4 m of 12 mm
   **ankerlijn**. It is stowed to starboard, a bakskist going against the same bulkhead to port:
   the anchor leans forward against the aft face of the voorschot (a flat plate at x = 4758.2),
   its fluke tops on that face and the lower edges of its tripping plates on the buikdenning,
   which runs to within 2 mm of the bulkhead. The shank has swung 12° back out of the fluke plane
   (it turns on the crown tube, up to about 32° either way) and so stands plumb: lying in that
   plane it would go through the bulkhead, being both longer and thicker than the flukes.
   Chain and coil lie on the boards beside
   it and the line leads over the voorschot, along the voordek (its height sampled from body 59D4
   so the rope lies on the deck) and up the V of the bow to the **ankeroog**. That eye is the same
   fitting as the landvastogen on the spiegel (Vademecum p. 35, bodies 589B/589F, measured off
   them: 9 mm bar, 96 mm long, arch 25.6 mm proud), welded by its feet into the seam where the two
   vlak plates meet at the stem, 70 mm under the voorplecht. Both ends are on
   `extras.tuig.anker` for the viewer.
   `pipeline/bakskist.py` (the chest on the vlonders, hollow, with lid, hinges and rope handles; `placement()`
   gives the inside frame for stowing things in it) and `pipeline/landvasten.py` (achterlandvast on the port
   landvastoog, coiled on the achterdek; voorlandvast coiled on the voordek, over the dolboord to the
   sleepoog on the stem) follow the same pattern: a module with `build(mesh_dir)`, added in `build_glb.py`.
   `pipeline/bakskist_inhoud.py`: what lies in the chest, placed in its own (pitched) frame: the
   **meerpen**, the **hoosblik** and the white **EHBO-koffer** with raised red lettering.
   `pipeline/fokbeslag.py`: ten **leuvers** (stagleuvers 51.5 x 27 mm) with their jaws on the axis of the
   voorstag and their tails on the luff of the fok (the CAD sets the fok 37 to 46 mm off its stay; the
   leuvers bridge that), and the **voorstagspanner met pelikaanhaak**: hook through the frontmost hole of
   the hanekam, eye pinned to the thimble of the stay, keeper ring over arm and stay. It replaces the CAD's
   harpje there (bodies 514E, 5156, in `DROP`). In the viewer the leuvers swing with the fok and slide down
   the stay when the fok is struck.
   `pipeline/wantkettingen.py`: the **wantketting** at the foot of either want — six links of the same
   6 mm chain as the ankerketting, on the wire's own line between the bow of the harpje in the
   wantputting and the spliced thimble eye. The CAD runs the wire down to that harpje, so the module
   also shortens it (`hardware.reshape` sends bodies 51C2 / 519A to it): the mesh is cut square to the
   axis 5 mm above the splice, the eye lifted 115.8 mm along it and the plain wire it now covers
   dropped. Both ends of each want go on `extras.tuig.wanten` for the viewer.
7. `pipeline/build_glb.py` writes the GLB: metres, Y up, x from transom to bow, z to starboard;
   scene graph group → part, with `extras` (id, naam, groep, materiaal, DWG handles, size).

## Aanpassen (customisation)

The gear button opens the menu (`web/src/customize.js`): zeilnummer, naam and plaats (lettering
projected onto the boeisel as decals at voordek / achterdek, both sides — `web/src/hulltext.js`),
a bakskleur and one colour per paint zone. The bakskleur (material `bakskleur`) accents roerkop,
voorplecht, hanekam, the metal mast bands (lummel band, hommerring, masttopring), the giekbeslag
at both ends of the boom, and 5 cm painted bands: 5 cm from the ends of the doften and the
helmstok, and just past the handle of every oar. The metal pieces are faces of the CAD solids
split off as parts of their own (`REGION_SPLITS`); the painted bands are cut into the mesh along
two planes (`BANDS`, `cut_bands` in `pipeline/build_glb.py`). Zones are glTF material
names assigned in `pipeline/parts.py`: romp (incl. everything below the waterline), berghout,
boeisel, dolboord, voordek, achterdek, kuip, zwaardkast (incl.
zwaardloper, mastkoker and its kikkers). Settings persist in `localStorage`.
All user-facing text is Dutch.

## Modes and animation

`web/src/modes.js` switches between Zeilen, Roeien and Wrikken and, in Zeilen, trims the sails for
a course to the wind. The controls are one bar of icons along the bottom of the screen - Modus,
Wind, Midzwaard, Riemen - and each icon opens its control in a popover above it: one at a time,
closed again by the same icon, another icon, Escape or a click outside. Each icon draws its own
state (the mode it is in, the compass needle turned to the wind, the board down/half/up, the number
of riemen); Wind only shows in Zeilen and Riemen only in Roeien, and the bar re-centres without
them. The course slider is mirrored: the centre is aan de wind, to the right the
wind comes over starboard, to the left over port, so crossing the centre is going overstag; both
ends run to voor de wind and fok te loevert. Its labels show whenever the wind panel is open. The boat
stays put; a wind arrow moves round it.
All values ease towards their targets, so every change is an animation.

- Gaff, mainsail, their lacing and hardware turn about the (exactly vertical) mast. The giek
  turns on the lummelbout, which stands 52 mm aft of the mast in the lips of the mastband, and
  is aimed so its nok stays under the schoothoek. The fok turns about the voorstag; past 180°
  it crosses to windward (fok te loevert).
- The fokkenschoten are not stretched CAD ropes but laid anew every frame (`RopeLine`,
  `roundTheFront` in `web/src/rig.js`): the sheet to leeward runs straight from the schoothoek
  to its block, the one to windward goes round the front of the mast first. Each block hangs on
  its leioog between the two parts of its sheet.
- Both sails are exported flat with a bend weight per vertex and bent in the viewer, because the
  belly is always to leeward and changes side when the boat tacks (grootzeil and its battens:
  designed belly, a little fuller off the wind).
- Every edge and corner of both sails is its own named part (voorlijk, achterlijk, onderlijk,
  bovenlijk; hals-, schoot-, klauw- and tophoek): a 6 cm strip of tape along each edge and a
  reinforcement patch in each corner, generated in `pipeline/sails.py` on both faces.
- The fok is a flat triangle bent by the wind: exported flat with a bend weight per vertex
  (`_BOLLING`), bent in the viewer with single curvature (luff straight, corners fixed, foot and
  leech bowing out). Depth follows the course, goes through flat while the fok crosses the boat
  and turns inside out for fok te loevert. The slider's short stretch past 180° snaps on release.
- Piekenval and klauwval, which only follow a moving end, are stretched per vertex
  (`RopeStretch` in `web/src/rig.js`).
- The grootschoot is a tackle reeved anew every frame (`RopeLine`): made fast to the hondsvot
  under the upper block, round one sheave of the lower block, over the upper sheave, round the
  other lower sheave and on to the hand of the helmsman, who sits to windward on the achterdek.
  The CAD draws the lower block 40 mm aft of the grootschootoog with its shackle beside the eye;
  `NUDGE` moves it so the shackle pin passes under the top of the eye.
- Axes and anchors come from the CAD via `pipeline/rig_data.py` (root node `extras.tuig`). That
  file also sorts the unnamed hardware into what travels with giek, gaffel or fok.
- The view menu (groups, camera views) sits behind the eye button; Aanpassen behind the gear;
  the boat controls behind the icons of the bottom bar.
- A running procedure (Reven, Tuig) shows its progress bar `#procedure` above the control bar: previous
  step, play/pause, next step and a slider over the whole timeline with a tick at every step boundary,
  the number and the Dutch label of the step it is in, and the name of the procedure. It plays by
  itself; dragging the slider scrubs and pauses, play takes it on to what was commanded. It rides
  above an open popover (`--procedure-lift`) and the info tile steps over it (`--procedure-top`).
  Once the procedure is at rest it fades out after 2.5 s, unless its own panel is open, it is hovered
  or it has the focus - so a finished procedure can be scrubbed back through from "Tuig" or "Reven".
- Onderdelen, under the eye button, lists every part by group, searchable, with one row per name
  (four dollen are one row "Dol ×4"). A bakboord and a stuurboord twin share one row under the name
  without the side ("Wantputting (bakboord)" and "(stuurboord)" -> "Wantputting", counted as one);
  clicking it takes the twin on the side the camera looks from, or the nearest one, and clicking
  again hands over the other. The search still matches the side in the names behind such a row.
  A row selects its part or parts - the same highlight and
  info tile as a click on the model, and the row of a part clicked on the model is marked in the
  list - and flies the camera to it: the bounding sphere of its meshes as they stand right now,
  seen from the candidate direction (8 azimuths × two elevations, plus the one we are looking
  from) that leaves the fewest of seven sample points of the part hidden behind other parts.
  Parts that are away in the current mode are dimmed and cannot be picked.
- Some numbers in the drawing name an area, not an object: Boeg (the forward 0.65 m of the romp)
  and Kleed (the third baan of the grootzeil, counted from the schoothoek up, between the seams of
  `extras.zeil.naden`). They stand in the list like parts, marked "gebied", with "Gebied, geen los
  onderdeel" in place of the dimensions. `web/src/regions.js` defines each one as a few part ids
  plus a predicate over the triangles of their meshes, and builds the highlight as an overlay that
  shares the position and normal attributes of those meshes (so it bends with the sail) and hangs
  under them (so it swings with them). It only shows while its row is picked and is never pickable
  itself - a click on the boeg still selects Boeisel, Vlak or Berghout.
- A windvaan on the masthead (built in `web/src/rig.js`, not in the CAD) turns so its wire frame
  points into the wind and the red vane streams downwind.
- Midzwaard neer / half / op (in every mode). The board swings about the zwaardbout at its
  forward-bottom corner - the CAD has that bolt as a hole in the plate, and the Vlettenboek p. 38
  gives the swing radius (R=880). The zwaardloper is a linkage and only ever turns on its pins:
  the foot of the lower link is pinned to the board (both have a hole at the same place), the
  links are pinned together at the knuckle, and the kast top is a 250 mm slot so the loper hangs
  plumb over its foot. The three stops are solved from those holes in `pipeline/rig_data.py`
  (`board_stops`): **neer** the loper's shoulder plate lands on the kast top (board 14.3° below
  the drawn position, which is itself the stop on the loper's middle hole); **half** the borgpen
  through the lowest hole of the upper link rests on the kast top (+6.6°); **op** the pin through
  the board's own hole rests there (+34.3°), the foot pin is then above the kast and the loper
  folds away - lower link turning on the foot pin to lie aft along the kast, upper link turning
  on the knuckle pin to hang down behind it. The pin is only in at a stop; in between it hangs
  on its kettinkje from an eye on the kast top.
- Wervel and pettenlijntje (`pipeline/hardware.py`): the CAD draws the wervel as a 12 x 55 mm bar with
  two dimples; it is rebuilt a little longer and wider (18 x 92 mm) with a real hole in each end. The
  kraanlijn is made fast in the upper hole. The pettenlijntje runs from the free hoop on the port
  end of the schootring aft under the giek, through the eye under the aft beslagband and through
  the lower hole, with a stopper knot behind it.
- Procedures (`web/src/procedure.js`): reven, zeilen strijken and mast strijken are timelines of steps, each
  taking one value from where it was to where it has to be in a given time and carrying a Dutch label.
  A timeline can be played either way, paused, stepped and scrubbed; `initModes()` hands the progress bar
  `procedure()` (plain data) and `procedureControl` (play, pause, next, previous, scrub). The rig is ONE
  timeline: "Zeilen op" is its start, "Zeilen gestreken" the end of the zeilbinders step, "Mast gestreken"
  its end. A reef is a fresh timeline from the present state to the chosen number of turns.
- Mast strijken (second half of the rig's timeline): fok taken off; the made-up sail with giek and gaffel,
  one stiff bundle carried by two points, goes from the fork of the mik into its lower hook; lummelbout
  drawn (it hangs on its borglijntje under the giek) and the bundle's forward end comes down on the
  mastdoft; grendelbout out; keeper ring slid up the pelikaanhaak; hook out of the hanekam; mast down aft
  on the mastbout (74.6 degrees) into the fork of the mik, top beyond the spiegel, with bands, blocks,
  harpjes, vallen, windvaan and kraanlijn block; the voorstag folds along the mast; the wanten are laid
  live and hang slack over the mik; the vallen's ends stay on the gaffel (their deltas are taken back
  into the mast's own frame).
- Zeilen strijken, control "Tuig" (Zeilen op / Zeilen gestreken), the same kind of sequencer as reven:
  head to wind (boom, fok and wind arrow amidships, no belly); anchor out (the stowed anker, ketting and
  lijn give way to a line paid out from the ankeroog over the bow into the water); fok down its stay
  into a bundle on the voordek (`jibBend.warp`); mik set; grootzeil down in folds while the gaffel comes
  down the mast and is laid flat, the nok of the giek lifted 1.1 degrees into the fork of the mik, kraanlijn
  taut (`mainBend.warp`); the cloth made up into a roll on the giek (part "Opgedoekt grootzeil"); three
  zeilbinders (double elastic, two balls) round sail, giek and gaffel. Hoisting runs it backwards.
- By hand: dragging the helmstok steers (the rudder parts, vlaggenstok and flag turn about the raked
  roerkoning; a table converts the pointer's bearing into the angle about that axis; the drag is taken
  in the capture phase so OrbitControls never sees it). A click on a dol ships or unships it (not while
  an oar is pulled in it), a click on the mik or its holders sets or stows it; a change of mode puts
  them back where they belong. A click on the bakskist shuts or opens its lid (modelled open; the lid and
  what is screwed to it turn about the hinge line from `extras.tuig.bakskist`). A click on anker, ketting
  or lijn lets the anchor go or weighs it: lifted by its shackle, carried over the voordek, swung out over
  the starboard bow and lowered to the bottom along a spline; the ketting is one mesh whose 54 links are
  posed as rigid pieces along its run, the lijn is laid live over the rail to the ankeroog. Zeilen strijken
  drives the same animation and waits for it.
- The foot of the grootzeil follows the giek, which swings on the lummelbout, while its head follows the
  gaffel round the mast 52 mm further forward; `Bend.shift` takes the cloth over evenly from the one to
  the other, so there is no gap between sail and giek at any sheeting angle, reefed or not.
- Reven (rolrif), control "Reven" with the number of turns of the giek. A small sequencer in
  `web/src/modes.js` runs the steps in order, each one value driven to its goal, and replans from
  wherever it is when the order changes: ease the vallen; slide the schootring aft to the nok; pull the
  giek 3 cm aft against the spring in the lummelbeslag (a shaft shows in the gap); turn the giek; let it
  spring back; shift the grootschoot to the port hoop of the schootring, which turns 37 degrees round the
  giek; slide the ring forward; set up the vallen. `Bend` does the cloth: the foot first travels a quarter
  turn from the top of the giek to its side, after that cloth is wound on (the roll grows 1.2 mm a turn),
  the sail above comes down by that length with the gaffel, klauw, vallen and rijglijn, and leaves the
  roll beside the giek. The cloth mesh is too coarse to wind into a spiral, so wound cloth is gathered
  at the roll and the roll is a part of its own ("Rif"). The pettenlijntje is laid live between the
  starboard hoop and the wervel, neither of which turns with the giek, and hangs in a bight when slack.
- Dodemanseind (`pipeline/hardware.py`): two turns round the gaffel 10 cm from the nok, then slack to
  the hanepootloper, the point on the gaffeldraad where the piekenval is made fast; swings with the gaffel.
- Dirk of kraanlijn (not in the CAD): from the wervel up over a small block (`makeBlokje`) on the
  port eye of the masttopring, the one eye that carries nothing, and down to the upper port kikker
  on the mastkoker, the only free one. Laid every frame: it hangs slack, swings with the giek and
  lies against the cloth when the sail bellies to port.
- Vlaggenstok, knop and vlag (`web/src/flag.js`): a bent staff (straight in the tube, then curving over aft, tapered) standing in the open top of the
  roerkoning, a 1" tube, so it rakes 33.7 degrees aft with the rudder; the knop is a 2 cm disc with a
  rounded edge in the bakskleur; the Dutch flag streams downwind under sail, hangs when there is
  no wind, and the lot is drawn out of the tube for wrikken.
- Mik (`makeMik`): under sail it lies on the buikdenning on the port side of the kuip; with the sails
  down (roeien, wrikken) it is carried over and stands in the two mikhouders on the achterschot, fork
  up and square to the boat, its foot on the vlak.
- Dollen: the boat has six dolpotten (pipeline) but four dollen (`makeDol`, `makeKnevel` in
  `web/src/rig.js`), in the potten by the two doften. A dol stands in its pot, turning with the
  oar, only while an oar is pulled in it; otherwise it is lifted out and hangs inboard, upside
  down, on its kettinkje, which runs through the pot to a knevel that cannot pass the bore
  (`layChain` lays the links along the path over the rim).
- Five parts the CAD does not have are built in the viewer (`web/src/rig.js`) and registered as
  ordinary pickable parts: the **zwaardbout**, the **borgpen**, its **kettinkje**, the
  **windvaan**, and the fold of the **roerkop**.
- The two blocks of the grootschoot hang in the sheet: each is aimed along the line from the
  schootring to the grootschootoog, so they tilt as the boom swings.
- Zeilteken and zeilnummer are parts of their own (pickable, named), thin patches lying on the
  cloth with their own painted texture, mirrored on the starboard side. They bend and swing
  with the sail like the lijken and hoeken.
- Roeicommando's (control "Roeicommando", Katwijk rowing book H2): each boord has its own commando - op slag,
  haalt op gelijk (single strokes with a wait), op riemen, strijkt gelijk (the same stroke run backwards), stopt
  af, riemen lopen / over / op / geroeid. A commando is a pose (`COMMANDS` in `web/src/modes.js`: power, how far
  down, swung aft, blade upright or flat, how far inboard, standing on the vlonder, in the dol or stowed) that
  every oar of that boord eases into; the panel shows the words the roerganger would call for the two boorden
  together, with "op… riemen" first unless both have to be obeyed at once. Different commando's on the two
  boorden give the flauwe, scherpe and zeer scherpe bocht; a green arrow on the water shows which way the
  boat goes (the boat itself stays put).
- Roeien: sails fade out and the stroke (inpik - haal - uitpik - recover) simply runs, one per
  3.2 s; three set-ups - 2 naast elkaar, 2 kruislings, 4 riemen (the second pair
  of oars is added in the viewer); Wrikken: the wrikriem in the wrikgat,
  1.4 m inboard at 50 degrees, with a figure-of-eight motion. The CAD has no dollen; each oar lies
  50 mm above the rim of its dolpot.

## Checks that the geometry is right

`pipeline/check_attached.py [gap_mm]` lists every fitting (body shorter than 1.5 m) that is further
than the gap from every other body, i.e. hangs in mid-air, with the body nearest to it. It works on
surfaces, not vertices, and takes half a minute. Fixes go into `NUDGE` in `pipeline/parts.py`.

- Hull plating 5599 × 1836 mm (class: 5600 ± 50 × 1800).
- Plate volume ÷ area gives 3.96 mm for the vlak and 2.99 mm for the decks; the Vlettenboek
  specifies 4 and 3 mm.
- Chine half-breadth 596 (Vlettenboek spantenlijst 594), berghout 918 (913), zwaardkast
  946 × 500 (950 × 497–503), mast foot at 365 in both, fokkeschoot lei-ogen at 282 / 742 / 1142 /
  1942 mm aft of the mastkoker, inside the Vlettenboek's tolerance bands.

## Artwork

`web/public/textures/zeilteken.png` is derived from `reference/parts/scoutwiki_lelievlet_zeilteken.png`
(scoutwiki.scouts.nl); the emblem itself is the class insignia of Scouting Nederland. Check the
licence before publishing outside scouting.
