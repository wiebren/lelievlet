# Betonning en markering: buoyage and fairway marking on Dutch waters

Collected 2026-09-28 for the BPR lessons in the lelievlet viewer: which marks exist, what they look
like (for the 3D assets), how their lights flash, and which side you pass them on. The mark-by-mark
data is in `boeien.json` (42 entries). English notes; Dutch terms are kept verbatim.

Trust levels: **hoog** = the legal text or a Rijkswaterstaat guideline, **midden** = an official
dataset or an older official publication, **laag** = a secondary or foreign source, or my own
inference.

## Sources

| Key | File (git-ignored) | Source / URL | Date | Trust |
|---|---|---|---|---|
| `[B8]` | `BPR_BWBR0003628_2026-06-17.html` (fetched by another agent; same text), figures in `betonning_img/bpr_b8_*.png` | BPR **Bijlage 8 "Markering van het vaarwater"**, <https://wetten.overheid.nl/BWBR0003628/2026-06-17/0/Bijlage8>. Figures come from `https://wetten.overheid.nl/afbeelding?toestandid=BWBR0003628/2026-06-17_0&naam=<nr>.png` | version in force 17-06-2026 to today (checked 2026-09-28) | **hoog**: this is the law |
| `[RST]` | `richtlijnen_scheepvaarttekens_2023.pdf` | Rijkswaterstaat, **Richtlijnen Scheepvaarttekens 2023**, ch. 6 "Markering van het vaarwater" (pp. 70–82). <https://open.rijkswaterstaat.nl/publish/pages/193547/richtlijnen_scheepvaarttekens_2023_final_v5_clean_voorwoord_ondertekend.pdf> (landing page <https://open.rijkswaterstaat.nl/@269371/richtlijnen-scheepvaarttekens-2023/>) | approved 14-03-2023, Stcrt 27-03-2023; it replaces RST 2008 | **hoog**: the current RWS guideline |
| `[HP]` | `betonningssystemen_in_nederland_rws_1998.pdf` (OCR, 63 p.) | "**Betonningssystemen in Nederland**", RWS + DGSM + Dienst der Hydrografie, 1983, 3rd impression 1989, scanned by RWS in 1998. <https://open.rijkswaterstaat.nl/publish/pages/26155/1998_betonningssystemen_in_nederland_ocr.pdf>. Bijlage 1 is the IALA text (1980 translation), bijlage 2 the SIGNI/BPR text | 1989 | **midden**: official and educational, but old. Where it overlaps `[B8]` it agrees |
| `[HP3]` | `hp3_betonningssystemen_in_nederland.pdf` (scan, no text layer, 56 p.) | "HP 3 – Betonningssystemen in Nederland", the version [RST] points to: <https://ienc-kennisportaal.nl/wp-content/uploads/2016/09/HP-3-Betonningssystemen-in-Nedeland-1.pdf> | PDF 2010 | midden; not read in full (no text layer). It appears to be the same publication as [HP] |
| `[RWS-D]` | not kept (a 3.4 MB CSV would be tracked by git); fetch it again from the URL | RWS **Vaarwegmarkeringen drijvend**, 10 108 floating marks on the state waters with shape, colour, topmark, light and object model. <https://geo.rijkswaterstaat.nl/services/ogc/gdr/vaarweg_markeringen/ows?service=WFS&version=2.0.0&request=GetFeature&typeName=vaarweg_markering_drijvend&outputFormat=csv> (catalogue entry <https://data.overheid.nl/dataset/47148-vaarwegmarkeringen-drijvend>, CC-0) | fetched 2026-09-28 | **midden–hoog** for what is actually lying in the water |
| `[FRY]` | not kept | Provincie Fryslân **Vaarwegmarkeringen** (1 315 marks on the Friese meren), WFS `https://geoportaal.fryslan.nl/arcgis/services/ProvinciaalGeoRegister/PGR2/MapServer/WFSServer?service=WFS&version=2.0.0&request=GetFeature&typeNames=PGR:Vaarwegmarkeringen` | fetched 2026-09-28 | midden–hoog |
| `[HBO]` | `../parts/caynoya_officiele_CWO_eisen_kielboot_1_2_3.pdf` | CWO Handboek Opleidingen 2005, ch. 5 Kielboot | 2005 | hoog for CWO in 2005; may be outdated |
| `[KATZ]` | `../cwo_zeil_instructieboek_katwijkse_zeeverkenners.pdf` p. 60–63 | Katwijkse Zeeverkenners CWO zeil-instructieboek, §4.6 Markeringstekens (marked **Kielboot III**) | – | laag–midden (a group's booklet) |
| `[WIKI-PRIK]` | – | <https://nl.wikipedia.org/wiki/Prik_(scheepsbaken)> | read 2026-09-28 | laag–midden |
| `[JFC]` | – | JFC Marine Ø1800 "Gannet" navigation buoy, as quoted in a search snippet (the product page now returns 404): focal height 2500 mm, overall 3750 mm | – | laag; a size analogy only, not a Dutch buoy |
| `[SEALITE]` | `sealite_inland_waterway_brochure.pdf` | Sealite (USA) inland waterway spar and float-collar buoys, <https://www.sealite.com/wp-content/uploads/Inland-waterway-brochure_LR.pdf> | – | laag; American regulatory buoys, useful only as a proportion check (spar Ø229 mm × 2032 mm with 1067 mm freeboard) |
| `[EUROS]` | – | <https://www.euroszeilen.utwente.nl/wiki/Betonning>: "sparboei … ongeveer 7 keer zo hoog als de diameter" | – | laag |

Not obtained: the UNECE **SIGNI 2019** text (unece.org returns 403 to scripts:
<https://unece.org/DAM/trans/main/sc3/publications/SIGNI_2019_e.pdf>), the current IALA R1001
Maritime Buoyage System, and the Waddenzee "knooppuntenboekje" on binnenvaartkennis.nl (it
returns an HTML page instead of the PDF). No manufacturer drawing of the Dutch RWS buoys was
found either (supplier: Rombouts Kunststof Techniek, Tholen, which publishes no dimensions).

## Where each system applies

- **BPR / SIGNI** (`[B8]`, `[RST]` §1.2.3, §6.1.2) covers all Dutch inland waters under the BPR:
  rivers (except the Rhine branches, which fall under the RPR with nearly the same marks), canals,
  **IJsselmeer, Markermeer, randmeren, Friese meren**, and the Zuid-Hollandse and Zeeuwse
  stromen (Oosterschelde, Grevelingen, Veerse Meer, Haringvliet, …).
- **IALA-A** applies on the Noordzee, zeegaten, **Waddenzee** (to match Germany and Denmark),
  **Westerschelde** and Eemsmonding (`[RST]` §6.1.2, `[HP]` §7). The Waddenzee falls under the
  BPR as a regulation, but its buoyage is IALA.
- Where the border runs across a harbour, it lies on the seaward heads of the harbour moles
  (`[HP]` §7).

## Which way is "right"? Read this before anything else

**BPR (`[B8]` §1.2):** *rechter/linker zijde* is the side to the right or left of an observer
looking:
a. on rivers: **downstream**; in tidal waters, in the direction of the ebb stream;
b. on canals: "van boven naar beneden", i.e. towards the lower reach;
c. on side channels: towards the main waterway;
d. on lakes and closed sea arms (and channels in them that are not part of a through route):
   **towards the exit to the sea or open water**;
e. on the Flevoland randmeren: **counted from Amsterdam**;
f. in the zeegaten: towards the Noordzee.
The waterway authority decides doubtful cases.

**IALA-A (`[HP]` Bijlage 1 §2.1):** the *betonningsrichting* is the usual approach **from sea into
port**. Along the Dutch coast and the Waddenzee it runs roughly NE/E and from outside to inside
(`[HP]` §8). *Bakboord/stuurboord* is the side of a ship sailing in that direction.

**The two directions are opposite, but the marks lie on the same side** (`[B8]` §1.2
"Opmerking", `[HP]` §8). Red and stomp is on your **bakboord** when you come *from sea / from the
lower end / upstream*; the same red mark is on your **stuurboord** when you sail *downstream /
towards the sea*. Numbers rise in the same direction in both systems: from sea inwards, "van
beneden naar boven" (`[B8]` §1.3.4, `[HP]` §8).

Teach it as: *komende van zee, of tegen de stroom op: rood aan bakboord, groen aan stuurboord.
De nummers lopen op.* Sailing the other way, everything swaps. A common learner mistake, which
`[KATZ]` p. 61 states correctly but easily misread: "vanaf de bron gezien rood aan stuurboord".

**Harbour entrances are the exception** (`[B8]` §7, `[RST]` §6.3.6): they are marked *seen
entering the harbour*, red-white on bakboord and green-white on stuurboord, whichever way the
river flows.

## BPR inland system (Bijlage 8), mark by mark

The size of the object shows how important the fairway is: (licht)boei > ton > sparboei >
drijfbaken > kopbaken > steekbaken (`[B8]` §1.3). Colours: R red, G green, W white, Y yellow,
B black.

### Laterale hoofdmarkering (§2.1)

| | Rechterzijde (§2.1.1) | Linkerzijde (§2.1.2) |
|---|---|---|
| Vorm | **stompe** boei of ton, sparboei, drijfbaken, kopbaken, **walbaken** (triangle point *down*), or a **los steekbaken** (loose twigs) | **spitse** boei or ton, sparboei, drijfbaken, kopbaken, walbaken (triangle point *up*), or a **bijeengebonden steekbaken** |
| Kleur | rood | groen |
| Topteken (if fitted) | rode **cilinder** | groene **kegel, punt omhoog** |
| Licht (if fitted) | rood **Iso** or **LFl** ("rustig") | groen Iso or LFl |
| Kenteken | letters of the fairway + **even** number (HD 4, HD 6); bank marks are numbered consecutively regardless of colour (1, 2, 4 …) | letters + **oneven** number (V 3, V 5) |

- Sparboeien used laterally are also stomp or spits in the Netherlands (§1.3.1).
- If an object is not itself stomp, spits or bol, a topmark (cilinder, kegel, bol) gives its
  shape. **Drijf- and kopbakens always carry a topmark**; tonnen and sparboeien only where it
  helps (in a bend, to break a row of identical buoys, at the start or end of a fairway).
- Kop-, steek- and walbakens carry no kenteken (§2.1 footnote 2). Drijfbakens are numbered, kop-
  and steekbakens are not (`[HP]` §18).
- Winter: vulnerable light buoys and tonnen can be replaced by small tonnen, spars or drijfbakens
  of the same colour (§1.3.5). `[RST]` §6.2.9 says winterbetonning is hardly laid any more; lit
  "ijssparren" now stay all year.

Figure: `betonning_img/bpr_b8_65665.png` (right) shows, left to right, stompe ton, sparboei,
drijfbaken (square float, pole, cylinder), kopbaken, walbaken (red triangle point down on a pole)
and a loose steekbaken (bare tree), with the Iso and LFl light bars below. `bpr_b8_65666.png` is
the left-side equivalent.

### Splitsingen en kruisingen (§2.1.3): the **bolvorm** is the BPR's own

Floating scheidingsmarkering **always** carries a topmark, to tell it apart from veilig vaarwater
(which has none in the BPR).

| | Colour, top to bottom | Topteken | Licht | Kenteken |
|---|---|---|---|---|
| a. Vaarwaters van gelijk belang | rood-groen horizontal bands | rood-groene **bol** | **wit snel isofase, Iso 2s** | initials of both fairways, alphabetical, e.g. BV 8-WTV 9 |
| b. **Hoofdvaarwater links** | **rood boven, groen onder** | rode **cilinder**; on spar, drijf- and kopbaken also a rode bol (cylinder above ball) | rood **Q** | main fairway first, e.g. "HV 12 – KG 9"; real: BN 22-KG 1, IJM 12-MG 1 |
| c. **Hoofdvaarwater rechts** | **groen boven, rood onder** | groene **kegel** point up; on spar etc. also a groene bol | groen **Q** | main first, e.g. "VG 1 – HV 14"; real: BN 25-HG 8 |
| d. Splitsingspunt (bank) | walbaken: red triangle point down **above** green triangle point up ("zandloper") | – | wit Iso 2s | follows the walbakens |

How to read b and c (`[HP]` footnotes to 2.1.3): *"deze markering ligt als stompe ton van het
hoofdvaarwater"* (b) or as its *spitse ton* (c). **The top colour and the topmark tell you which
lateral mark of the main fairway it is.** Treat a rood-boven-groen buoy as a red buoy of the
hoofdvaarwater:
- sailing in the BPR direction (downstream, towards the sea) the hoofdvaarwater lies **to the
  left** of it (hence the name);
- coming from sea or sailing upstream you keep it **on bakboord** to stay in the hoofdvaarwater.
The nevenvaarwater branches off on the other side.

Steekbakens: a split is usually shown by two or three steekbakens together (§1.3.1).

`bpr_b8_65668.png` shows b: a red-over-green bolton with a cylinder, and spar and drijfbaken with
a cylinder over a ball; the night bar is red Q.

### Aanvullende markering (§2.2): recreational side channels

On wide waters, outside the main buoyage, an extra channel for shallower craft:
**rood-wit** horizontal bands, stomp, rode cilinder (right); **groen-wit**, spits, groene kegel
(left). "In principe een ander betonningsvoorwerp", in practice smaller. `[RST]` §6.3.2 calls them
"recreatieboeien", officially *bakens* because they are unlit. They are not mandatory but
recommended. Where two aanvullende rows meet there is a scheidingston of matching size, and the
aanvullend-marked fairway counts as hoofdvaarwater there. Unlit: `[RWS-D]` REC11 and REC12 have
0 lights. (Under the RPR the same colours mean obstakels; `[RST]` p. 72.)

### Gevaarlijke punten en obstakels (§3)

- In or near the fairway: lateral marks (§2).
- On or at an obstacle: the ship signs of **art. 3.25**. Free side: **twee groene ruiten** above
  each other (±1 m), by night two green lights. Blocked side: **rode bol**, one red light. With a
  ban on hinderlijke waterbeweging: free side rood-boven-wit bord, and red over white lights.
  `[RST]` §6.3.4 prefers a **wrakkenscheepje** (small wreck-marking vessel) on narrow waters.
- On wide waters and lakes: cardinals (§6.1) and afzonderlijk gevaar (§6.2).
- The IALA blue-yellow **emergency wreck marking buoy** is *not* in the BPR or RPR (`[RST]`
  §6.3.4).

### Bijzondere markering (§4)

**Geel**, shape stomp, spits or bol (it must not contradict the lateral shape where it lies).
Topmark geel liggend kruis, or for a verboden gebied the **A.1** verbodsteken (red-white-red) as a
cylinder. Light **geel Fl or Fl(n), never Fl(2)**. Kenteken: purpose or pictogram ("Gas").
**Through traffic keeps yellow marks on the same side as normal buoyage.** Used for verboden
gebieden, vogelrust- and natuurgebieden (Fryslân: 142 of them, 1 Oct–1 Apr), snelvaar-, ski- and
zeilplankgebieden, wedstrijdbanen, kabels and meetpalen.

### Markering loop van de vaargeul (§5): bank boards on rivers

These are square boards on the bank the deep channel runs along.

| | Dagmerk | Licht |
|---|---|---|
| 5.1.1 geul langs rechteroever | square **red board with white bands at top and bottom**, on its flat side | red **Oc** (different periods for even- and odd-numbered lights) |
| 5.1.2 geul langs linkeroever | square board **groen boven, wit onder**, standing on its point (diamond) | green Oc |
| 5.2.1 overgang, rechteroever | square **yellow with a vertical black bar** in the middle, on its flat side | yellow Oc |
| 5.2.2 overgang, linkeroever | square **yellow with a diagonal black bar**, on its point | yellow Oc |

5.2.3 geleidelijn: two such boards on the same bank, the rear one higher; in line, they give the
axis of the crossing. §5.3 lichtenlijnen (leading lights, usually white and synchronised) and §5.4
sectorlichten (white sector = fairway, red/green = danger) follow the same idea.

### Brede vaarwaters en meren (§6): the IALA marks adopted in the BPR

**Cardinale markering (§6.1)**: the quadrants are bounded by the bearings NW–NO, NO–ZO, ZO–ZW,
ZW–NW, seen from the danger. The name of the mark = the quadrant it lies in = **the side you pass
it on**. The main features are the topmark (always two black cones) and a white Q or VQ light.
Shapes: pilaar, ton, sparboei, drijf- or kopbaken.

| | Kleur (top → bottom) | Topteken | Licht (wit) |
|---|---|---|---|
| **Noord** | zwart boven geel | 2 cones, both points **up** | **VQ or Q** (continuous) |
| **Oost** | zwart – geel – zwart | 2 cones **base to base** (points away from each other) | **VQ(3) 5s or Q(3) 10s** |
| **Zuid** | geel boven zwart | 2 cones, both points **down** | **VQ(6)+LFl 10s or Q(6)+LFl 15s** |
| **West** | geel – zwart – geel | 2 cones **point to point** | **VQ(9) 10s or Q(9) 15s** |

Memory aids (`[HP]` §9, `[KATZ]` p. 60): the cone points show where the black is (N up = black on
top; S down = black at the bottom; O: points outward = black top and bottom; W: points inward =
black in the middle). The O outline looks like an "O", the W on its side like a "W". The flash
counts follow a clock face: 3 = O, 6 = Z, 9 = W, continuous = N. The long flash after the Z group
keeps it apart from W.

**Internal inconsistency in `[B8]`:** the cardinal figure `bpr_b8_68754.png` labels the zuid
light **Q(6) LFl 10 s**, but the text of §6.1.3 and the light table `bpr_b8_68739.png` give
**Q(6)+LFl 15 s** (VQ variant 10 s). Use the text: 15 s for Q, 10 s for VQ. That also matches
IALA and `[RWS-D]` (Q(6)(1) 15 s, 11×; VQ 10 s, 8×).

**Afzonderlijk gevaar (§6.2)**: an isolated danger with navigable water all round. Pilaar or spar;
**zwart with a broad red band** (black–red–black); topmark **2 black balls**; light white
**Fl(2)**, table: Fl(2) 10s.

**Veilig vaarwater (§6.3)**: the middle of a fairway or a landfall position. Bolvormige boei or
ton, or a spar; **rood-wit vertical stripes**; **in the BPR without a topmark** (so it cannot be
confused with the scheidingston). White, slow light: Iso 6s or 8s, LFl 10s, Oc 6s, Mo(A) 8s.

### Havens en aftakkingen (§7), seen entering

| | lit | unlit |
|---|---|---|
| Bakboord | red-white horizontally banded **cylindrical** light tower; **rood vast (F)** or red Q | red-white banded pole with a **red cylinder** |
| Stuurboord | green-white banded **conical** light tower; **groen vast** or green Q | green-white pole with a **green cone** point up |

Fixed lights are used here on purpose, to stand apart from the periodic fairway lights (§7
footnote).

## IALA-A as used in the Netherlands

Source: the IALA text in `[HP]` Bijlage 1 (translation of the Nov. 1980 edition), plus `[RST]`
and `[RWS-D]` for current Dutch practice.

- **Lateral**: bakboord **rood**, stomp, pilaar or spar, rode cilinder; stuurboord **groen**,
  spits, pilaar or spar, groene kegel. The light may have any character **except Fl(2+1)**. Dutch
  practice per `[RWS-D]`: Iso 4s (≈670 buoys), Iso 8s, LFl 5s and 8s, Q at critical points. Numbers
  and letters count in the betonningsrichting (from sea): even on red, odd on green, prefixed with
  the channel's letters (BO = Boontjes, VL = Vliestroom, BS = Blauwe Slenk, D = Doove Balg, ZOL =
  Zuid Oost Lauwers, SO = Scheurrak-Omdraai, VA = Veerbootroute Ameland). **On the Waddenzee most
  laterals are spar buoys** (Ø 0.90 m SK21/SK22, lit Ø 1.20 m SKV11/SKV12), with light buoys LK2600
  in the main channels.
- **Splitsing (preferred channel)**: *aangepaste laterale markering*. **Rood with a broad green
  band** (rood-groen-rood), stomp, rode cilinder, **Fl(2+1) R** = recommended channel to
  **stuurboord**. **Groen with a broad red band** (groen-rood-groen), spits, groene kegel, **Fl(2+1)
  G** = recommended channel to **bakboord**. A split of equal channels uses a **cardinal** in IALA,
  never a bolton (`[HP]` §15). Real: BO 44-MR 29 (rood-groen-rood spar, cylinder), D 3-VL 2
  (groen-rood-groen), VA 2-R 1 (a zuidcardinaal at a junction).
- **Cardinals, afzonderlijk gevaar**: the same as the BPR table above. In IALA, cardinal shape is
  "pilaar or spar".
- **Safe water**: red-white vertical stripes, spherical or pillar/spar, **topmark one red ball**,
  light Iso, Oc, LFl 10s or Mo(A).
- **Special marks**: yellow, yellow X, yellow Fl, Fl(3), Fl(4) or Fl(5) (1980 text). IALA has no
  red-white/green-white recreational rows. `[RST]` §6.3.2: on the Waddenzee, Westerschelde and
  Noordzee, recreational channels get **yellow buoys with a red-white-red topmark**, which also
  mark the prohibited area behind them.
- **New dangers**: double marking, and optionally a racon Morse "D"; the blue-yellow emergency
  wreck buoy (`[RST]` Fig. 29: 4–8 blue/yellow vertical stripes, a yellow upright cross, light Bu
  1 s / Y 1 s alternating with 0.5 s dark between) is used on IALA water only.
- **Prikken / steekbakens on the Wad** (`[HP]` §22f, `[WIKI-PRIK]`): small gullies (prielen) and
  wantij crossings are marked by ash poles 3–7 m long. **Bakboord (from sea): twigs spread, blunt
  ("bezem", broom up)**; **stuurboord: twigs bound to a point, splayed below (broom down)**. This
  is the SIGNI stomp/spits idea. In narrow gullies they stand only on the steep (deep) side; **2–3
  prikken together** = the marking stops on this side and continues on the other. Through-gullies
  behind the islands are generally marked west to east (`[WIKI-PRIK]`). On a wantij the channel is
  marked from both ends towards the shallow crest, so the betonningsrichting flips there (my
  inference from the tidal geometry; confirm against a Waddenzee chart before teaching it).

## Where BPR and IALA-A differ

| Topic | BPR (SIGNI) | IALA-A (Waddenzee, zee, Westerschelde) |
|---|---|---|
| Reference direction | rechts/links looking **downstream / towards sea** (§1.2) | bakboord/stuurboord sailing **from sea inwards** |
| Lateral colours and shapes | red stomp right, green spits left | red stomp bakboord, green spits stuurboord: **same physical side** |
| Lateral light | Iso or LFl only ("rustig"), see table | anything except Fl(2+1) |
| Split of equal fairways | **bolton rood-groen banded**, rood-groene bol, **W Iso 2s** | **cardinal** |
| Main/side split | **bolton** two colours: rood boven groen (hoofdvaarwater links, R Q) / groen boven rood (hoofdvaarwater rechts, G Q) | **modified lateral**, three bands: rood-groen-rood (to starboard) / groen-rood-groen (to port), **Fl(2+1)** |
| Split on the bank | zandloper walbaken, W Iso 2s | – |
| Veilig vaarwater topmark | **none** | one red ball |
| Aanvullende (recreational) channel | rood-wit / groen-wit banded marks | yellow buoys (special marks), with a red-white-red topmark on large waters |
| Steekbakens | loose = right/stomp, bound = left/spits | prikken on the Wad, same principle from sea: bezem = bakboord, bound = stuurboord |
| Bank marks, channel-course boards, harbour marks | yes (§2.1 walbakens, §5, §7) | not part of IALA |
| Emergency wreck buoy (blue/yellow) | not in the BPR | yes |
| Kentekens | only "indien aanwezig"; `[RST]` §6.4: CEVNI marks need no unique code | every mark has a unique letter+number code |

## Dimensions (for the 3D assets)

No Dutch source gives *height above water* for any buoy. What is solid:

| Object | Diameter | Length / height | Source, trust |
|---|---|---|---|
| RWS kunststof lichtboei (LK) | core **1.80 m** (rivers, small lakes), **2.60 m** (large inland waters), **3.00 m** (estuaries, outer waters) | light ≈ 2.5 m above water, overall ≈ 3.75 m (analogy with a Ø1800 JFC buoy) | `[RST]` §6.2.4 hoog; height `[JFC]` laag |
| RWS kunststof sparboei (SK, SKV = lit) | **0.63 / 0.90 / 1.20 m** | not published; rule of thumb ≈ 7 × diameter overall | `[RST]` §6.2.4 + `[RWS-D]` hoog; length `[EUROS]` laag |
| RWS kleine ton (TK) | **0.80 / 1.20 m** | – | `[RST]` hoog; mapping TK1x → 1.20, TK2x → 0.80 is my guess |
| Friese meren boei | **0.50 m** | **1.70 m** long (model "D 500x1700", 764 marks); yellow "D 500x1200"; aanvullend "D 430" | `[FRY]` midden–hoog |
| Wad prik | – | 3–7 m pole | `[WIKI-PRIK]` midden |
| Kribbaken | – | topmark ≥ 1 m above Maatgevende Hoge Waterstand; a radar reflector serves as topmark | `[RST]` §6.2.2 hoog |
| Radar reflector (octahedral, unpainted aluminium or stainless) | – | type 1 **420 mm** tip to tip (blind buoys, light buoys on fairways up to 170 m wide); type 2 **850 mm** | `[RST]` §6.2.8 hoog |
| Harbour pole | **30 / 40 / 50 cm** for water widths <20 / 20–60 / >60 m | band height 2–2.5 × pole diameter, ≥ 4 bands | `[RST]` Tabel 8 hoog |
| Topmark on fixed marks | cylinder look (two crossed rectangles) **45×60 / 60×80 / 72×96 cm**; cone look (two crossed equilateral triangles) side **70 / 90 / 110 cm** | – | `[RST]` Tabel 9 hoog |
| Lettering | – | ≥ 20 cm high, white on red and green, black on yellow, on two sides | `[RST]` §6.4 hoog |
| Mooring chain | links Ø13–25 mm inland; length 2 × depth (up to 8 × on rivers) | – | `[RST]` §6.2.6 |

What `[RWS-D]` shows is in the water (10 108 floating marks): **spar 70 %**, stomp 16 %, spits
11 %, bol 2 %, pilaar 1 %. The object-model code encodes function in its last digit: **x1 = groen /
spits, x2 = rood / stomp, x3 = scheiding** (SK31 = green 630 spar, TK12 = red ton, REC13 =
recreational split). Sizes typical for lelievlet waters: **randmeren, Markermeer, Friese kanalen:
Ø 0.63 spars; IJsselmeer and Wad: Ø 0.90 spars; Friese meren: 0.5 × 1.7 m buoys; rivers: LK1800
light buoys**. For modelling, a reasonable default for an unlit inland spar is Ø 0.63 m, about
1.5–2 m above water (an estimate from the proportions above, not a source).

## Light characters

Defined in `[B8]` §1.3.3 (same as IALA). The period is the time for one full cycle, in seconds.

| Abbr. | Dutch | Meaning | Timing for animation |
|---|---|---|---|
| F | vast licht | steady | never on floating marks (a moving buoy would look periodic); harbour marks only |
| Fl | schitterlicht | light shorter than dark | e.g. Fl 5s: ≈0.5–1 s on, rest dark |
| LFl | lang schitterlicht | a flash of **at least 2 s** | LFl 8s: 2 s on, 6 s dark |
| Fl(n) | groepschitterlicht | a group of 2–5 flashes, then dark | Fl(2) 10s: 2 flashes ≈1 s apart, then dark to 10 s |
| Fl(2+1) | samengesteld groepschitter | 2 flashes, pause, 1 flash | IALA preferred-channel marks, 10 s |
| Iso | isofaselicht | light and dark **equal** | Iso 4s: 2 s on, 2 s off |
| Oc | onderbroken licht | light **longer** than dark | Oc 4s: ≈3 s on, 1 s off |
| Q | flikkerlicht | continuous quick flashes, **50–60/min** | ≈1 flash per second |
| VQ | snelflikkerlicht | **100–120/min** | ≈2 per second |
| Q(n), VQ(n) | groep(snel)flikker | groups of 3, 6 or 9 | Q(3) 10s: 3 flashes in ≈3 s, dark to 10 s |
| Q(6)+LFl | | 6 quick flashes, then a ≥ 2 s long flash | zuidcardinaal, 15 s (VQ variant 10 s) |
| Mo(A) | morse A | · — (short, long) | veilig vaarwater, 8 s |

**Rule of thumb in `[B8]`: the faster the character, the more dangerous the point.**
Combinations actually used, from the `[B8]` table (`bpr_b8_68739.png`):

- lateral R/G: Iso 2s (exceptional), 4s, 6s, 8s; LFl 5s, 8s, 10s
- split of equal fairways: W Iso 2s
- hoofdvaarwater links/rechts: R or G **Q**
- bijzonder: Y Fl 5s, Fl 10s, Fl(3) 10s, Fl(4) 15s, Fl(5) 20s
- geul boards: R or G Oc 4s, 6s
- cardinals: as in the table above
- afzonderlijk gevaar: W Fl(2) 10s
- veilig vaarwater: W LFl 10s, Iso 6s, Iso 8s, Oc 6s, Mo(A) 8s
- haveningang: R or G Q, or F

## Numbering and lettering

- Even = red/right/bakboord, odd = green/left/stuurboord, prefixed with the fairway's initials:
  HD 4, V 3, PM 137, IJM 1, GIJ 49A. Numbers rise **from sea / from the lower end inwards**
  (`[B8]` §1.3.4, `[HP]` §8). Suffix letters (49A, 49B, 16A) are inserted buoys.
- Scheidingstonnen carry both codes joined by a hyphen, hoofdvaarwater first (`BN 22-KG 1`); for
  equal fairways, alphabetical order.
- Bank marks (walbakens, geul boards) are numbered consecutively regardless of colour. Kop- and
  steekbakens are not numbered; drijfbakens are.
- Cardinals, afzonderlijk gevaar and yellow marks carry a name or abbreviation (`ET-N 1`,
  `Kerkhof`, `Gas`, `SPH-D`).
- Recreational rows use an `R-` prefix or a trailing R (`R-HD 29`, `GMR 2`, `WWR 15`).
- The real codes in `[RWS-D]` include `IJM` (IJmeer) and `KG` (Krabbersgat, the "KG" example in
  `[B8]`).

## Most relevant for a lelievlet / CWO (secondary)

A lelievlet sails on lakes, randmeren, rivers and canals, and seldom on the Wad. So the **BPR
system** is what matters, and the marks a crew will actually meet are **spars and small tonnen
(red, green, yellow), scheidingstonnen, aanvullende rood-wit/groen-wit rows, cardinals around
shallows, harbour entrances and yellow vogelrust- and ski-area marks**.

- `[HBO]` (CWO Handboek 2005) puts buoyage late. **Kielboot IV** theory, item 6: *"De betekenis
  van de rode en groene (splitsings)tonnen volgens het SIGNI-systeem moet worden gekend."*
  **Kielboot V** item 14 requires the full Bijlage 8: §1.1–1.2 (where SIGNI applies; rechts and
  links), shape, colour, lights and kentekens, §2.1 incl. splitsingen, §2.2, §3, §4 (shape and
  colour only), §5.1–5.4, §6.1–6.3 and §7. Kielboot I–III list BPR articles and Bijlage 7 signs,
  but no Bijlage 8.
- Scouting practice is earlier: `[KATZ]` teaches **kardinale, laterale, ronde scheidingsmarkering,
  aanvullende betonning and geleide-/sectorlichten at Kielboot III** (p. 60–63).
- The current cwo.nl pages (saved by another agent in `cwo/`) do not mention betonning. Whether
  the 2024+ CWO eisen moved it is **not verified**.

## Teachable scenarios

1. **Vaargeul in, komende van het meer (lager eind):** rode stompe tonnen aan bakboord, groene
   spitse aan stuurboord, nummers lopen op (HD 2, 4, 6 …). Turn round: everything swaps.
2. **River, downstream:** red on stuurboord. Ask: "waar ligt de rechteroever?"
3. **Randmeren from Amsterdam:** Gooimeer → Eemmeer → Nijkerkernauw → Veluwemeer; the numbers
   rise *towards* Amsterdam, since "rechts" is counted from Amsterdam (§1.2e). A trick question.
   Checked in `[RWS-D]`: GM 1 lies at the east end of the Gooimeer and GM 64 at the west end; VM 1
   is at Elburg and VM 99 at the Harderwijk/Nijkerk end; DM 1 is at the Ketelmeer and DM 48 at the
   south end.
4. **Scheidingston, rood boven groen with cilinder (hoofdvaarwater links):** you come from the
   lake and want to stay in the main fairway, so keep it on bakboord like a red buoy. Show the
   nevenvaarwater splitting off to the other side.
5. **Scheidingston, groen boven rood with kegel:** the mirror case.
6. **Rood-groen banded bolton, rood-groene bol, W Iso 2s at night:** equal fairways, choose freely.
   Contrast it with the rood-wit **vertical** veilig vaarwater bol *without* a topmark.
7. **Aanvullende betonning:** a lelievlet sails in the recreatiegeul between rood-wit and groen-wit
   spars, out of the way of the beroepsvaart in the main channel (links to BPR art. 6.04 and
   stuurboordwal lessons).
8. **Noordcardinaal (both cones up) on a shallow:** pass on the **north** side. Use the compass
   rose; the other three are variants.
9. **Night quiz:** Q(3) 10s = oost; Q(9) 15s = west; Q(6)+LFl 15s = zuid; Q = noord (or a red or
   green hoofdvaarwater split, if coloured); Fl(2) = afzonderlijk gevaar, pass all round at a
   distance.
10. **Gele ton with a cross, or an A.1 topmark (vogelrustgebied, 1 Oct–1 Apr):** don't enter;
    through traffic keeps it on the same side as normal buoyage.
11. **Wrakschuitje with two green ruiten on one side and a red ball on the other:** pass at the
    green side.
12. **Haveningang:** entering, red-white on bakboord and green-white on stuurboord, *even if* the
    river runs the other way.
13. **Steekbakens on a shallow lake or on the Wad:** broom (loose twigs) = red side, bound = green
    side; 2–3 together = the marking switches sides.
14. **Don't moor to a buoy** (BPR art. 1.13); report one that is damaged or moved (art. 1.13 lid
    2–3). Pass upstream buoys wide, because the chain may be taut (`[HP]` §22b).
15. **Waddenzee (IALA):** rood-groen-rood spar with Fl(2+1) R = hoofdvaarwater to stuurboord, the
    three-band version of the BPR bolton.

## Uncertain or missing

- **Heights above water** of Dutch buoys: no RWS or Rombouts drawing found. `boeien.json` gives
  diameters from `[RST]`/`[RWS-D]`/`[FRY]` and leaves `hoogte_m` null unless there is a source;
  where there is only an analogy (light buoys), it says so in `bron`.
- The TK1x/TK2x → 1.20/0.80 m mapping is inferred.
- The Wad prik rules (bezem = bakboord) rest on Wikipedia plus the SIGNI principle in `[HP]`; the
  official current Waddenzee description (knooppuntenboekje, Hydrografische kaart 1811 legend)
  was not obtained. The coloured ribbons on prikken are unconfirmed.
- The SIGNI 2019 and IALA R1001 originals were not downloaded, so the IALA part rests on the 1980
  translation in `[HP]` plus current Dutch data.
- The bijzondere-markering light list may be longer in current IALA than in the 1980 list.
- The current CWO eisenprogramma for betonning is not checked beyond the 2005 handbook.
