# Seinvlaggen: signal flags, race signals and flag signs on Dutch waters

Collected 2026-10-10 for the navigation section of the lelievlet viewer: a "zoek" panel where the
user picks a flag by colour and pattern and gets its name and meaning in Dutch. It is the next
category after borden (`../bpr/TEKENS.md`) and markeringen (`../bpr/BETONNING.md`). English notes;
Dutch terms and every user-facing meaning are in Dutch. The machine-readable counterpart is
`seinvlaggen.json`: 83 entries, with 26 letter flags, 10 cijferwimpels, 3 vervangwimpels, the
onderscheidingswimpel, 29 race signals and 14 BPR/RPR/BVA flag signs. Each entry has a design that
is complete enough to draw an SVG from.

Trust levels: **officieel** means the legal text, the official ICS edition or the official RvW
translation. **tekening** means an official publication's illustration. These differ in details;
see "Design cross-check". **secundair** means a group booklet, Wikipedia or Commons. **afgeleid**
means my own measurement or translation, and is marked as such.

## Sources

| Key | Document | Local file (git-ignored) | URL | Licence | Trust |
|---|---|---|---|---|---|
| `[ICS-NGA]` | **NGA Pub. 102, International Code of Signals**, United States edition, 1969 Edition (Revised 2020). This is the full ICS text, an official national edition of the IMO code. Flag plate "International Flags and Pennants" on PDF p. 2. Signalling instructions in ch. 1 (PDF p. 9–13). Single-letter signals on printed p. 21 (PDF p. 26). Spelling tables on PDF p. 23. Text extract: `pub102.txt` | `nga_pub102_2020.pdf` | <https://msi.nga.mil/api/publications/download?key=16694273/SFH00000/Pub102bk.pdf&type=view> (via <https://msi.nga.mil/Publications/ICOS>). The USCG mirror `dco.uscg.mil/.../Pub102_2020.pdf` returns 403 to scripts | US Government work, public domain (17 U.S.C. §105) | officieel (text); tekening (plate) |
| `[RvW]` | **Regels voor Wedstrijdzeilen 2025–2028**, the official Dutch translation by the Watersportverbond (bilingual: World Sailing English text plus Dutch). Covers lettervlaggen, cijferwimpels, vervangwimpels and the onderscheidingswimpel with their own colour drawings (PDF p. 2–3), the Wedstrijdseinen (PDF p. 4–5), and rules 26–40 and 60.2. Text extract: `rvw.txt` | `rvw_2025-2028_rzvnaarden.pdf` | <https://rzvnaarden-site.e-captain.nl/bestanden/regels-voor-wedstrijdzeilen.pdf> (a club's copy; the Watersportverbond site has no direct link) | © World Sailing / Watersportverbond. Free download; the local copy is for private reference only and is not redistributed (Auteurswet art. 16b) | officieel |
| `[RRS]` | **The Racing Rules of Sailing 2025–2028**, World Sailing, English. "Race Signals" (PDF p. 2–3), rules 26 (p. 25), 29–30, 32–34, 37, 40, 60.2. Text extract: `rrs_en.txt` | `rrs_2025-2028_en.pdf` | <https://svensksegling.se/om-oss/dokumentbanken/904-rrs-2025-2028-final.pdf> | © World Sailing. Free download, private copy as above | officieel |
| `[BPR]` | Binnenvaartpolitiereglement, version in force from 17-06-2026: 3.03, 3.17, 3.18, 3.24, 3.25, 3.29, 3.30, 3.36, 3.38, 4.01, 6.04a, 6.22 lid 3, 10.04, 10.05, bijlage 3 (schetsen), bijlage 6, bijlage 7 A.1 and H.3 | `../bpr/BPR_2026-06-17.txt`, sketches `../bpr/bijlage3/`, sign drawings `../bpr/tekens/bpr_img/` | <https://wetten.overheid.nl/BWBR0003628/2026-06-17> | Statutory text, no copyright (Auteurswet art. 11) | officieel |
| `[RPR]` | Rijnvaartpolitiereglement 1995: 3.03, 3.17, 3.18, 3.25, 3.29, 3.30, 3.34, bijlage 8 IV | `../bpr/RPR.txt` | <https://wetten.overheid.nl/BWBR0006923> | same | officieel |
| `[BVA]` | Verdrag inzake de Internationale Bepalingen ter voorkoming van aanvaringen op zee, 1972 (COLREGs, Dutch text), **bijlage IV Noodseinen** | `bva_BWBV0001014.html`, text `bva.txt` | <https://wetten.overheid.nl/BWBV0001014> (in force from 01-01-2016 to today, checked 2026-10-10) | Treaty text, no copyright | officieel |
| `[Commons]` | Wikimedia Commons "ICS …" SVG set: letters `ICS Alfa.svg` … `ICS Zulu.svg`, `ICS Pennant Zero…Niner.svg`, `ICS Repeat One/Two/Three.svg`, `ICS Answer.svg`. Geometry is quoted under "Design cross-check" | `commons/` (all 40 files) | <https://commons.wikimedia.org/wiki/File:ICS_Alfa.svg> etc. | Letters, substitutes and Answer: **public domain**. Numeral pennants: **GPL** (licence read from the Commons API `extmetadata.LicenseShortName`) | secundair |
| `[WP-EN]` | English Wikipedia "International maritime signal flags": heraldic blazon of every flag | not kept (CC BY-SA, cited only) | <https://en.wikipedia.org/wiki/International_maritime_signal_flags> (read 2026-10-10) | CC BY-SA 4.0 | secundair |
| `[WP-NL]` | Dutch Wikipedia "Seinvlag": the only Dutch list of single-letter meanings found | not kept | <https://nl.wikipedia.org/wiki/Seinvlag> | CC BY-SA 4.0 | secundair, contains errors (below) |
| `[CWO-KB22]`, `[CWO-ZB22]`, `[CWO-R15]`, `[CWO-2024]` | CWO handbooks, as in `../bpr/VOORRANG.md` §7 | `../bpr/cwo/` | see there | © CWO | officieel (archived) |
| `[ZZL25]` | Zeilschool Zuidlaardermeer "Eisen Zwaardboot 2-mans" 2025: the current CWO wording as published by a school | `../bpr/cwo/zeilschoolzuidlaardermeer_Eisen_Zwaardboot_2025.pdf` | see `../bpr/VOORRANG.md` | © | secundair |
| `[SN-VS]` | Scouting Nederland vorderingsstaten CWO Kielboot 3 and Roeiboot 3 | `../parts/sn_insigne_CWO-*.pdf` | see `../parts/SOURCES.md` | © | secundair |
| `[NK-SI]` | Wedstrijdbepalingen NK Lelievlet 2026 (Scouting Nederland / LSZW): §5 OW ashore, §7 klassenvlaggen, §10–14 start and finish flags | `../hull/wedstrijdbepalingen_NK_lelievlet_2026.pdf` | <https://lszw.scouting.nl/images/LSZW-2026/PDF-files/wedstrijdbepalingen-NK_lelievlet_2026_versie_2_GG_def.pdf> | © | officieel for that event |
| `[KAAG]` | Kaagcup 2026 wedstrijdbepalingen: "Seinvlaggen" (booklet p. 10, PDF p. 12), Startprocedure, Terugroepen, Veldtekens | `../rig/kaagcup_wedstrijdbepalingen_2026.pdf` | <https://kaagcup.scouting.nl/images/download/2026/PDF-files/Kaagcup_wedstrijdbepalingen_web_2026-05-04.pdf> | © | officieel for that event |
| `[NTR08]` | Scouting Nederland Nautisch Technische Richtlijnen 2008: etiquette (p. 30), "Vlootschouw" (formation sailing with flag signals, p. 31), "5.17 De blauwe wimpel" | `../hull/scoutingnl_NTR_2008.pdf` | see `../hull/SOURCES.md` 1.2f | © | secundair (scouting) |
| `[KAT]` | Katwijkse Zeeverkenners CWO zeil-instructieboek: "Duikersvlag" p. 52 (PDF 58), §6.5.1 Vlagvoering p. 95 (PDF 101). The same text is in the Kielboot 3 book `../rig/katwijkse_zeeverkenners_kielboot3_boek.pdf` (PDF 95: "rood vlaggetje in het want") and in the roei books | `../cwo_zeil_instructieboek_katwijkse_zeeverkenners.pdf` | see `../book/NOTES.md` | © | secundair |
| `[KB3]` | Scouting De Bevers Kielboot III lesboek: "Duiktekens", fig. 5.25 seinvlag A with anchor ball (PDF p. 33) | `../parts/scouting_de_bevers_kielboot_III_lesboek.pdf` | see `../parts/SOURCES.md` | © | secundair |
| `[VB]` | Vlettenboek (Vademecum deel 8), inventory: "1 Nederlandse vlag 40 x 60 cm", "1 gebogen vlaggenstok essenhout" | `../hull/lszw_vademecum_lelievlet.pdf` | see `../hull/SOURCES.md` | © Scouting Nederland | officieel for the lelievlet |

### Not found

- No **official Dutch text of the Internationaal Seinboek** is online. Dutch editions existed
  (Wikipedia cites "Internationaal Seinboek 1975, ISBN 90 6054 698 9"). The Dienst der Hydrografie
  HP list has none (<https://www.defensie.nl/onderwerpen/h/hydrografie/nautische-producten/boeken-met-nautische-gegevens>),
  and searches of RWS, Kustwacht, ANWB and the Flemish government found none. **The Dutch
  single-letter meanings in this folder are my own translations** of Pub. 102, checked against
  `[WP-NL]`. The exceptions are the terms that Dutch law or the RvW fix: "de internationale
  seinvlag «A»" (BPR 3.38), "seinvlag «B»" (BPR 10.04), "het noodsein N.C. uit het Internationaal
  Seinboek" (BVA), and the RvW names lettervlag, cijferwimpel, vervangwimpel and
  onderscheidingswimpel.
- The ICS gives **no proportions and no colour shades**. Pub. 102 only says that a set has 26
  alphabetical flags, 10 numeral pennants, 3 substitutes and the answering pennant (ch. 1 sec. 2
  §2).

## Local files (all git-ignored)

`nga_pub102_2020.pdf` + `pub102.txt` · `rvw_2025-2028_rzvnaarden.pdf` + `rvw.txt` ·
`rrs_2025-2028_en.pdf` + `rrs_en.txt` · `bva_BWBV0001014.html` + `bva.txt` · `commons/*.svg`.

## Drawing conventions

**Orientation.** The **broeking** (hoist) is the edge on the line or staff; the **vlucht** (fly)
is the free edge. Every design is described with the hoist on the **left**, the way all three
plates draw it. Seen from the other side, a flag is mirrored: the white of A is still at the staff
([BPR] schets 74 draws A flying to the left with the white against the staff). The 3D model must
mirror the texture on the back face, not repeat it.

**Coordinates in `seinvlaggen.json`.** `ontwerp.omtrek` and all `velden` use normalised
coordinates: x from 0 at the hoist to 1 at the fly, y from 0 at the top to 1 at the bottom.
`ontwerp.verhouding` is length ÷ height. The fields are painted in order and clipped by `omtrek`.
Field types:

| type | parameters | notes |
|---|---|---|
| `vlak` | `kleur` | whole area |
| `banden` | `richting` (`verticaal` = side by side, hoist→fly / `horizontaal` = top→bottom), `verdeling` (fractions), `kleuren` | |
| `rechthoek` | `x, y, b, h, kleur` | |
| `veelhoek` | `punten`, `kleur` | |
| `cirkel` | `cx, cy` (normalised), `r` **as a fraction of the height**, `kleur` | always draw a true circle, also on a long pennant |
| `balk` | `van`, `naar`, `breedte` (fraction of the height), `kleur` | a straight bar, extended past the ends and clipped (saltires) |
| `schaakbord` | `kolommen`, `rijen`, `kleuren` | first colour in the top-left (hoist, top) cell |
| `diagonale_banden` | `aantal`, `kleuren` | band *i* = points with (x+y)/2 in [i/n, (i+1)/n); first colour at hoist-top. Gives "/" stripes |
| `tekst` | `tekst`, `kleur`, `cx`, `cy`, `hoogte` | BPR loodsvlag and spuien/inlaten only |

**Shapes** (`ontwerp.vorm`) and the chosen proportions, with what each source shows (measured on
the rendered plates, afgeleid):

| vorm | Used for | Outline | Chosen L/H | NGA plate | RvW drawings | Commons |
|---|---|---|---|---|---|---|
| `rechthoekig` | letter flags, BPR flags | rectangle | **1,25** (h : l = 4 : 5) | 1,20–1,26 | 1,24–1,26 | 1,0 (square) |
| `zwaluwstaart` | A, B | notch to 0,75 L at mid-height | 1,25, notch depth **0,25 L** | notch ~0,32 L | ~0,15 L | 0,25 L |
| `wimpel` | cijferwimpels, onderscheidingswimpel | tapered, blunt fly; fly height **0,4 H** (y 0,3–0,7) | **2,5** | 3,1–3,4; fly 0,37–0,43 | 1,95; fly 0,39 | 1,8; fly 0,49 |
| `driehoek` | vervangwimpels, BPR rode wimpel, inlaten | pointed | **1,6** | 1,5–1,7 | 2,1 | 1,57 |
| `bord` | rigid boards (BPR 6.04a, C-bijtekens) | rectangle or triangle | per entry | | | |

BPR 3.03 gives minimum sizes for the flags a ship must carry: flags and boards at least 1 m × 1 m;
a wimpel at least 1 m long and 0,50 m high at one end. A klein schip may use smaller ones in
proportion to its size, as long as they stay clearly visible. RPR 3.34: the diving-flag replica is
at least 1 m high.

**Colours.** The ICS uses only red, blue, yellow, black and white, with no shades fixed. A
palette sampled from the RvW drawings, for a consistent look: rood `#e31f27`, blauw `#005c8e`,
geel `#ffe600`, zwart `#000000`, wit `#ffffff`. The race signals add oranje `#f26322` and groen
`#00a060`. The NGA plate uses a darker navy blue; Commons uses pure `#00f`/`#f00`/`#ff0`.
Lichtblauw (BPR 6.04a) has no published value.

## 1. Lettervlaggen (ICS A–Z)

Meanings in English are verbatim from `[ICS-NGA]`. **NL is my own translation**; no official
Dutch text was found (see "Not found"). "Wedstrijd" is the RvW meaning, see §4. ✱ = by sound only
in compliance with the COLREGs (ICS note 1).

| | Spelwoord | Design (hoist left) | Betekenis (NL) | ICS (EN) | Notes |
|---|---|---|---|---|---|
| A | Alfa | **zwaluwstaart**; verticaal gedeeld, **wit aan de broeking, blauw aan de vlucht** | Ik heb een duiker onder water; houd ruim afstand en vaar langzaam. | I have a diver down; keep well clear at slow speed. | BPR 3.38 / RPR 3.34 duikersvlag. Wedstrijd: OW/N boven A = vandaag geen wedstrijden meer |
| B ✱ | Bravo | **zwaluwstaart**, effen **rood** | Ik laad, los of vervoer gevaarlijke stoffen. | I am taking in, or discharging, or carrying dangerous goods. | BPR 10.04 (zeeschepen) |
| C ✱ | Charlie | 5 gelijke horizontale banen **blauw-wit-rood-wit-blauw** | Ja (bevestigend). | Yes (affirmative …). | NC = noodsein (BVA). Wedstrijd: volgend merkteken verlegd |
| D ✱ | Delta | horizontaal **geel-blauw-geel**, 1 : 3 : 1 | Houd van mij vrij; ik manoeuvreer met moeite. | Keep clear of me; I am maneuvering with difficulty. | |
| E ✱ | Echo | horizontaal gedeeld, **blauw boven, rood onder** | Ik verander mijn koers naar stuurboord. | I am altering my course to starboard. | |
| F | Foxtrot | **wit** met **rode ruit** die de vier zijden in het midden raakt | Ik ben onmanoeuvreerbaar; kom met mij in verbinding. | I am disabled; communicate with me. | |
| G ✱ | Golf | zes verticale banen **geel-blauw**, geel aan de broeking | Ik heb een loods nodig. (Vissers: ik haal netten in.) | I require a pilot. / Fishing vessels: I am hauling nets. | BPR 10.05 |
| H ✱ | Hotel | verticaal gedeeld, **wit aan de broeking, rood aan de vlucht** | Ik heb een loods aan boord. | I have a pilot on board. | BPR 10.05. Wedstrijd: OW/N boven H = verdere seinen aan de wal |
| I ✱ | India | **geel** met **zwarte schijf** (middellijn ½ H) in het midden | Ik verander mijn koers naar bakboord. | I am altering my course to port. | Wedstrijd: I-vlagregel |
| J | Juliett | horizontaal **blauw-wit-blauw**, drie gelijke banen | Ik heb brand en gevaarlijke lading aan boord: houd ruim van mij vrij. Of: ik lek gevaarlijke lading. | I am on fire and have dangerous cargo on board: keep well clear of me, or I am leaking dangerous cargo. | RvW spells "Juliet" |
| K | Kilo | verticaal gedeeld, **geel aan de broeking, blauw aan de vlucht** | Ik wil met u in verbinding komen. | I wish to communicate with you. | |
| L | Lima | gekwartierd **geel/zwart**, geel linksboven en rechtsonder | Stop uw schip onmiddellijk. | You should stop your vessel instantly. | Wedstrijd: mededeling / volg mij |
| M | Mike | **blauw** met **wit schuin kruis** van hoek tot hoek | Mijn schip ligt stil en heeft geen vaart door het water. | My vessel is stopped and making no way through the water. | Wedstrijd: vervangend merkteken |
| N | November | 4 × 4 geblokt **blauw/wit**, **blauw linksboven** | Nee (ontkennend). | No (negative …). | NC = noodsein. Wedstrijd: afbreken |
| O | Oscar | diagonaal gedeeld (broeking-boven → vlucht-onder): **geel** driehoek aan de broeking/onder, **rood** aan de vlucht/boven | Man over boord. | Man overboard. | |
| P | Papa | **blauw** met **wit vierkant** in het midden | In de haven: iedereen aan boord, het schip vertrekt. Op zee (vissers): mijn netten zitten vast. | In harbor: all persons should report on board as the vessel is about to proceed to sea. At sea (fishing vessels): my nets have come fast upon an obstruction. | "Blue Peter". BPR 10.05. Wedstrijd: voorbereidingssein |
| Q | Quebec | effen **geel** | Mijn schip is gezond; ik verzoek om vrije pratique. | My vessel is "healthy" and I request free pratique. | BPR 10.05. Do not confuse with the BPR 3.24 gele vlag |
| R | Romeo | **rood** met **geel recht kruis** in het midden | (geen betekenis als losse vlag) | — (R is not in the single-letter table) | Before 1969: "the way is off my ship" |
| S ✱ | Sierra | **wit** met **blauw vierkant** in het midden | Ik sla achteruit. | I am operating astern propulsion. | Wedstrijd: baan afgekort |
| T ✱ | Tango | verticaal **rood-wit-blauw**, rood aan de broeking | Houd van mij vrij; ik vis met een spannet. | Keep clear of me; I am engaged in pair trawling. | |
| U | Uniform | gekwartierd **rood/wit**, rood linksboven en rechtsonder | U loopt gevaar (u stuurt op gevaar af). | You are running into danger. | Wedstrijd: U-vlagregel |
| V | Victor | **wit** met **rood schuin kruis** | Ik heb hulp nodig. | I require assistance. | Wedstrijd: luister veiligheidskanaal |
| W | Whiskey | **blauwe** rand, **witte** rand, **rood** middenveld | Ik heb medische hulp nodig. | I require medical assistance. | |
| X | Xray | **wit** met **blauw recht kruis** | Stop met het uitvoeren van uw voornemens en let op mijn seinen. | Stop carrying out your intentions and watch for my signals. | Wedstrijd: individuele terugroep |
| Y | Yankee | schuine banen **geel/rood** ("/", 10 banen), **geel** in de hoek broeking-boven | Mijn anker krabt. | I am dragging my anchor. | Wedstrijd: draag drijfmiddelen |
| Z ✱ | Zulu | vier driehoeken naar het midden: **geel boven, zwart aan de broeking, rood onder, blauw aan de vlucht** | Ik heb een sleepboot nodig. (Vissers: ik zet netten uit.) | I require a tug. / Fishing vessels: I am shooting nets. | BPR 10.05. Wedstrijd: Z-vlagregel |

Also from `[ICS-NGA]`: N.C. together = distress; K and S are also landing signals for small boats
with persons in distress (SOLAS V/16). P as a sound means "I require a pilot". Single-letter
signals with numeral complements (A + 3 numerals = azimuth, …) are not listed here.

**Errors in `[WP-NL]`** (do not copy them): L "in de haven: ik lig onder quarantaine" and R "ik heb
uw laatste sein ontvangen" are pre-1969 meanings and are absent from Pub. 102. The page's Q
heading "Quarantaine" is misleading: Q is the request for pratique.

## 2. Cijferwimpels (ICS numeral pennants)

All are tapered pennants with a blunt fly (`vorm: wimpel`). The spelwoorden are from the ICS
figure spelling table.

| | Spelwoord | Design |
|---|---|---|
| 1 | Unaone | **wit** met **rode schijf** dicht bij de broeking |
| 2 | Bissotwo | **blauw** met **witte schijf** dicht bij de broeking |
| 3 | Terrathree | verticaal **rood-wit-blauw** in drie gelijke delen, rood aan de broeking |
| 4 | Kartefour | **rood** met **wit kruis**, de staande arm naar de broeking verschoven |
| 5 | Pantafive | verticaal gedeeld, **geel aan de broeking, blauw aan de vlucht** |
| 6 | Soxisix | horizontaal gedeeld, **zwart boven, wit onder** |
| 7 | Setteseven | horizontaal gedeeld, **geel boven, rood onder** |
| 8 | Oktoeight | **wit** met **rood kruis**, de staande arm naar de broeking verschoven |
| 9 | Novenine | gekwartierd: broeking **wit boven / rood onder**, vlucht **zwart boven / geel onder** |
| 0 | Nadazero | verticaal **geel-rood-geel** in drie gelijke delen |

The numbers 0–9 have no meaning as a single pennant. In racing, OW over pennant n = uitstel van n
uur (§4).

## 3. Vervangwimpels and onderscheidingswimpel

| id | Naam (RvW) | Design | Use (ICS) | Wedstrijd |
|---|---|---|---|---|
| `1e-vervanger` | Eerste vervangwimpel | driehoek, **blauw** met **gele driehoek aan de broeking**; the yellow touches the hoist and blue runs along the top and bottom edges | repeats the **uppermost** flag of the class (letters or numerals) directly above it | **algemene terugroep** |
| `2e-vervanger` | Tweede vervangwimpel | driehoek, verticaal gedeeld, **blauw aan de broeking, wit naar de punt** | repeats the second flag from the top | — |
| `3e-vervanger` | Derde vervangwimpel | driehoek, **wit** met **zwarte horizontale baan** door het midden tot in de punt | repeats the third flag from the top | — |
| `onderscheidingswimpel` | Onderscheidingswimpel (OW). RvW gives it three roles: "Contrasein, Slotsein, Decimaalteken". Pub. 102 calls it "Code (answering pennant or decimal point)"; English abbreviation AP | wimpel with **five vertical bands rood-wit-rood-wit-rood** | at the dip = signal seen; close up = understood; hoisted alone after the last hoist = end of signal; between numerals = decimal point. A substitute can be used only once in a group, and the OW used as a decimal point is ignored when counting (Pub. 102 ch. 1 sec. 5) | **uitstel** |

## Design cross-check and disagreements

Every design above was checked against **four** representations: the NGA plate `[ICS-NGA]`, the
Watersportverbond drawings `[RvW]` (plus the World Sailing ones in `[RRS]` for the flags used in
racing), the Commons SVGs and the heraldic blazons in `[WP-EN]`. I measured them on 200–300 dpi
renders. The **topology agrees in all sources for all 40 flags**: which colour is at the hoist,
which band is on top, the 4 × 4 checks of N with blue top-left, the yellow corner of Y at
hoist-top, the order of the Z triangles, and the quarters of L, U and 9. The point to watch: when
a flag or pennant is shown flying to the left, the hoist is then on the right.

What disagrees are **proportions**, which the ICS does not fix:

| Flag | NGA plate | RvW drawing | Commons | Chosen |
|---|---|---|---|---|
| A white part | ~0,28 L | 0,5 L | 0,5 L ("per pale") | 0,5 L |
| A/B notch depth | ~0,32 L | ~0,15 L | 0,25 L | 0,25 L |
| P white / S blue centre | ~0,55 L × 0,4 H | 0,5 × 0,5 | ⅓ × ⅓ | 0,5 × 0,5 |
| W | thick blue, narrow white, small red | blue 0,19, white 0,06, red 0,5 | blue/white/red each 1/5 | blue 0,2, white 0,1, red 0,4 |
| R, X cross arms | ~0,15 | ~0,11 L | 0,2 | 0,12 L / 0,15 H |
| M, V saltire width | — | — | 0,175 | 0,175 H |
| Y number of bands | ~10 | ~9–10 visible | 10 ("bendy sinister of ten") | 10 |
| Pennants 1/2 disc centre, radius | ~0,6 H, 0,28 H | ~0,64 H, 0,27 H (drawn as an oval) | 0,5 H, 0,25 H | 0,6 H, 0,27 H |
| Pennants 4/8 vertical arm | ~1,1 H from hoist | ~0,8 H | 0,5 H | 0,35 L (0,875 H) |
| 1st substitute yellow triangle | to ~0,45 L | to ~0,35 L | to 0,67 L | to 0,6 L |
| 2nd substitute split | ~0,45 L | ~0,6 L | 0,5 L | 0,5 L |
| Pennant length L/H | 3,1–3,4 | 1,95 | 1,8 | 2,5 |

The Kaagcup booklet `[KAAG]` p. 10 draws OW, the cijferwimpels 1–3, P, X, the eerste
vervangwimpel, Y, M, S and N the same way as the official sources (independent scouting check).

## 4. Wedstrijdseinen (Regels voor Wedstrijdzeilen 2025–2028)

Notation as in the RvW: ↑ = sein getoond, ↓ = weggenomen, • = one sound, — = one long sound,
- - - - - = repeated sounds. A visual signal over a klassenvlag (or vloot-, evenements- or
wedstrijdgebiedvlag) applies to that class only. **Timing is taken from the visual signal; a
missing sound is ignored (rule 26).** Meanings are paraphrased from the official Dutch
translation; the English is World Sailing's.

**Startprocedure (rule 26):**

| min before start | Visual | Sound | Meaning |
|---|---|---|---|
| 5 (or as in the SI) | klassenvlag ↑ | • | waarschuwingssein |
| 4 | P, I, Z, Z met I, U or zwarte vlag ↑ | • | voorbereidingssein |
| 1 | voorbereidingsvlag ↓ | — | één minuut |
| 0 | klassenvlag ↓ | • | startsein |

| id | Sein | Sound | Betekenis (NL) | Rule |
|---|---|---|---|---|
| `wed-OW` | OW (AP) | ↑•• ↓• | Nog niet gestarte wedstrijden uitgesteld; waarschuwingssein 1 min na wegnemen | Wedstrijdseinen, 27.3 |
| `wed-OW-H` | OW boven H | ↑•• | Uitgesteld; verdere seinen aan de wal | |
| `wed-OW-A` | OW boven A | ↑•• | Uitgesteld; vandaag geen wedstrijden meer | |
| `wed-OW-cijfer` | OW boven cijferwimpel 1–9 | ↑•• ↓• | Uitstel 1–9 uur vanaf de geplande starttijd | |
| `wed-N` | N | ↑••• ↓• | Alle begonnen wedstrijden afgebroken (EN adds: return to the starting area); waarschuwingssein 1 min na wegnemen | 32.3 |
| `wed-N-H` | N boven H | ↑••• | Afgebroken; verdere seinen aan de wal | 32.3 |
| `wed-N-A` | N boven A | ↑••• | Afgebroken; vandaag geen wedstrijden meer | 32.3 |
| `wed-V` | V | ↑— | Luister het communicatiekanaal uit voor veiligheidsinstructies | 37 |
| `wed-P` | P | ↑• ↓— | Voorbereidingssein | 26 |
| `wed-I` | I | ↑• ↓— | Voorbereidingssein + I-vlagregel: wie in de laatste minuut over de lijn is, moet om een verlengde terug | 30.1 |
| `wed-Z` | Z | ↑• ↓— | + Z-vlagregel: in de driehoek startlijn–eerste merkteken in de laatste minuut = 20 % straf | 30.2 |
| `wed-Z-I` | Z met I | ↑• ↓— | 30.1 and 30.2 both apply | 26 |
| `wed-U` | U | ↑• ↓— | + U-vlagregel: in die driehoek = DSQ zonder zitting (not when restarted) | 30.3 |
| `wed-zwarte-vlag` | Zwarte vlag | ↑• ↓— | + zwarte-vlagregel: DSQ zonder zitting, also on a restart; the sail number is shown | 30.4 |
| `wed-X` | X | ↑• | Individuele terugroep (taken down at the latest 4 min after the start) | 29.1 |
| `wed-1e-vervanger` | Eerste vervangwimpel | ↑•• ↓• | Algemene terugroep; waarschuwingssein 1 min na wegnemen | 29.2 |
| `wed-S` | S | ↑•• | De baan is afgekort; finish between the mark and the staff with S | 32.2 |
| `wed-C` | C (+ groene driehoek / rode rechthoek / − / +) | - - - - - | Volgend merkteken verlegd: naar stuurboord / bakboord / korter / langer | 33 |
| `wed-L` | L | ↑• | Aan de wal: mededeling opgehangen. Op het water: kom binnen praaiafstand of volg dit vaartuig | |
| `wed-M` | M | - - - - - | Het voorwerp met dit sein vervangt een ontbrekend merkteken | 34 |
| `wed-Y` | Y | ↑• | Draag persoonlijke drijfmiddelen (wetsuit/droogpak telt niet) | 40 |
| `wed-oranje-vlag` | Oranje vlag | geen | De stok met deze vlag is één einde van de startlijn | |
| `wed-blauwe-vlag` | Blauwe vlag | geen | De stok met deze vlag is één einde van de finishlijn | |
| `wed-klassenvlag` | Klassenvlag | ↑• ↓• | Waarschuwingssein / startsein; design per event | 26 |
| `wed-protestvlag` | Rode vlag | — | Protest: roep "Protest" en toon, **alleen bij een romp langer dan 6 m**, een rode vlag. **A lelievlet (5,6 m) only hails** | 60.2(a)(1) |

Notes. (1) V: the Race Signals page shows **one long** sound, while rule 37 says "with one sound".
This is an inconsistency inside the rulebook, in both the English and the Dutch edition. (2) "OW"
is the Dutch abbreviation for the answering pennant (onderscheidingswimpel); the English is AP.
(3) The C-bijtekens (green triangle, red rectangle, −, +) are boards, not flags; the RvW drawings
show the − and + high on a white upright board.

## 5. Flags and flag-like signs in the Dutch navigation rules

The BPR has no ICS signalling of its own. It uses a few ICS flags by name, plus coloured flags and
boards. Lights and the full day signals are in `../bpr/LICHTEN.md` (schets numbers there). Bijlage
7 note 2: *"De vlaggen en wimpels kunnen worden vervangen door borden van dezelfde vorm."*

| id | Sign | Article | Meaning | Sound | CWO |
|---|---|---|---|---|---|
| `bpr-3.38-duiker` | **seinvlag A** (or a rigid replica; lit at night) | BPR 3.38; RPR 3.34 (replica ≥ 1 m high) | schip gebruikt bij het duiken; also for diving from the shore. Keep clear and slow | — | KB III |
| `bpr-3.17-rode-wimpel` | **rode wimpel** on the voorschip | BPR 3.17; RPR 3.17 | schip met recht van voorrang bij doorvaart (bridges, locks); 6.26 and 6.28b let it through without delay | — | — |
| `bpr-3.18-rode-vlag-zwaaien` | **rode vlag heen en weer gezwaaid** (or a red board; or 2 black balls) | BPR 3.18; RPR 3.18 | schip wordt onmanoeuvreerbaar | replaces or supplements «Ik kan niet manoeuvreren» • • • • (bijlage 6 A) | (sound signal: KB III) |
| `bpr-3.30-noodtekens` | **vlag (RPR: rode vlag) in het rond gezwaaid**; or **vlag met een bol erboven of eronder** | BPR 3.30; RPR 3.30 | nood, hulp gevraagd | noodsein: herhaalde lange stoten or reeksen klokslagen (4.01 lid 4); medische hulp • • • • — (3.30 lid 3) | KB III, R III; noodsein from Introductie |
| `bva-NC-noodsein` | **N boven C**; square flag with ball | BVA bijlage IV 1 f, g | nood (at sea) | — | — |
| `bpr-3.25-rood-wit` | board/flag **rood boven wit** on the free side, **rood** on the closed side | BPR 3.25 lid 1 c–d (boards, flags allowed); RPR 3.25 (flags, boards allowed) | werkend drijvend werktuig or vastgevaren/gezonken schip that also wants protection from wash. **Passing on the red side is forbidden (BPR 6.22 lid 3)** | — | KB III, R III |
| `bpr-3.29-rood-boven-wit` | board/flag **half rood (boven) half wit**, or two: red over white | BPR 3.29; RPR 3.29 | bescherming tegen hinderlijke waterbeweging: pass slowly, keep away | — | KB III, R III |
| `bpr-3.24-gele-vlag` | **gele vlag** at the side of the net | BPR 3.24 | stilliggend schip met net/uitlegger uit (flowing water) | — | — |
| `bpr-3.36-loodsvlag` | **blauwe vlag met witte L** | BPR 3.36 | loodsvaartuig in dienst (not the ICS L!) | — | — |
| `bpr-6.04a-lichtblauw-bord` | **lichtblauw bord, witte rand ≥ 5 cm** + wit flikkerlicht, at stuurboord | BPR 6.04a lid 3; RPR 6.04 | groot schip wil stuurboord op stuurboord passeren. A board, not a flag ("blauwe vlag" is the old name) | — | KB III |
| `bpr-A.1-rode-vlag` | **rode vlag**; two above each other = longer prohibition | BPR bijlage 7 A.1 | in-, uit- of doorvaren verboden | — | KB III, R III |
| `bpr-H.3a-spuien` / `bpr-H.3b-inlaten` | **blauwe vlag "spuien"** / **blauwe wimpel "inlaten"** (white text) | BPR bijlage 7 H.3 | er wordt gespuid / ingelaten; with H.3c: weldra | — | KB III, R III |
| `bpr-10.05-zeeschepen` | ICS A, B, G, H, P, Q, Z | BPR 10.05; 10.04 (B, gevaarlijke stoffen) | zeegaande schepen on the vaarwegen tussen zee en zeehavens | — | — |

Asked about but **not present**: the BPR and RPR give **no flags for veerponten** (3.16 uses a
green ball and lights). RPR bijlage 8 IV marks obstacles on the Rhine with the same red and
red-over-white flags or boards as 3.25. BPR bijlage 8 §3 refers to 3.25 for that.

## 6. CWO scope

None of the CWO handbooks names an ICS signal flag or a race flag. What they require:

- **Noodsein** (item 102 "Veiligheidsafspraken / Noodsein") at **every level from Introductie**
  in Kielboot and Zwaardboot 2-mans `[CWO-KB22]`, `[CWO-ZB22]`.
- **BPR flag signs** through the Reglementen list at **Kielboot III / Gevorderd** (and IV): 3.25,
  3.29, 3.30, **3.38** (seinvlag A), 6.04a, bijlage 7 A.1 and H.3; Roeien III without 3.38
  `[CWO-R15]`. See `../bpr/VOORRANG.md` §7. `[ZZL25]` (2025 wording): "kennis van de
  belangrijkste tekens, lichten en seinen die in het BPR worden benoemd".
- **Racing**: item 3801 "Kennismaken met wedstrijdzeilen" from Basis ("eenvoudig parcours"),
  "simpele startprocedure en basis BPR/wedstrijdreglementen" from Ervaren, module 3803
  Wedstrijdzeilen, and module 3701 Starten ("weet de regels met betrekking tot de start toe te
  passen"). In practice that means the startprocedure flags (klassenvlag, P, X, eerste
  vervangwimpel) and OW, but this is **not stated** in the handbook.
- **Vlagvoering** (item 503 "Jachtetiquette en vlagvoering"): T at Gevorderd, P/T at
  Vergevorderd. Handboek Opleidingen 2005 (`../parts/caynoya_officiele_CWO_eisen_kielboot_1_2_3.pdf`): "Het kennen
  van de vlagvoering van het eigen schip" at KB III, "vlagvoering voor schepen met één mast" at
  KB IV. Scouting's vorderingsstaten Kielboot 3 and
  Roeiboot 3 `[SN-VS]` repeat "Gedragsregels, vlagvoering en jachtetiquette". This is about the
  Nederlandse vlag and club flags (§7), not seinvlaggen.

For the viewer this suggests: seinvlag A and the BPR signs as Gevorderd (III); the
startprocedure flags as an optional wedstrijd layer; the other ICS letters as background or
quiz material.

## 7. Scouting-specific flag usage

Only what the collected sources say:

- **Vlagvoering on a lelievlet** `[KAT]` §6.5.1 (also in the roei and Kielboot 3 books and
  `parts/jpcoen_boek_cwo_roeien_3_2021.pdf` §5.5.1): the **Nederlandse vlag on a gebogen
  vlaggenstok on the roerkoning**; sometimes a **verenigingsvlaggetje in the stuurboordstag**. The
  flag goes up after sunrise and comes down before sunset (it may stay up at night if lit by a
  floodlight). **No reclamevlaggen**, because Scouting is not a commercial organisation. The
  Vlettenboek inventory `[VB]` lists "1 Nederlandse vlag 40 x 60 cm" and "1 gebogen vlaggenstok
  essenhout". This belongs in the 3D model's inventory, not in the zoek panel.
- **Wedstrijden** `[NTR08]` p. 30: racing boats are recognisable by the **absence of the
  nationaliteitsvlag**. `[KAT]` (Kielboot 3 book, PDF p. 95; also Mees Toxopeus booklet) says racing boats "vaak een rood vlaggetje
  in het want" carry. That is probably the protest flag; the RvW has no recognition flag, and a
  lelievlet need not show a protest flag (60.2, < 6 m).
- **NK Lelievlet 2026** `[NK-SI]`: OW in the flagpole ashore (5.1–5.2; at least 60 min after it
  comes down until the next warning signal). **Klassenvlaggen** carry the speltak emblem: Scouts
  (t/m 15) on an **oranje** field, Explorers (t/m 18) on a **rood** field, open klasse (Roverscouts
  emblem) on a **blauw** field. The boats carry a matching **lint in the voorstag**: oranje, paars
  and blauw. Start buoys are yellow with an **oranje vlag**; finish buoys yellow with a **blauwe
  vlag**. Support boats fly the **LSZW-vlag** (22.1).
- **Kaagcup 2026** `[KAAG]`: a seinvlaggen page with OW, OW + 1/2/3, N, P, X, eerste
  vervangwimpel, Y ("reddingsvesten dragen verplicht"), M and S, plus a klassenvlag "in kleur van
  het veld". A **veldteken** (ribbon in the field colour) goes in the voorstag at 1–2 m. The
  startschip flies a Kaagcup-logo flag and the start line runs between two oranje vlaggen. They
  add a **10-minutensein** with the baanbord (a yellow board with a black letter). General recall
  sound: "2 korte, pauze, 1 kort".
- **Vlootschouw** `[NTR08]` p. 31: formation sailing, "aangegeven met geluid- en/of
  vlaggenseinen". Each signal has an aandacht-, opdracht- and uitvoersein from a list agreed
  beforehand. There is **no fixed scouting flag code**.
- **De blauwe wimpel** `[NTR08]` §5.17 is a **ploeg award** (nautical, camp and EHBO skills), not
  a signal flag. Its design is not described.

## Open points

- An official Dutch ICS text, if the Kustwacht, KNRM or a zeevaartschool has one, would replace
  my translations. Wording to check first: F "onmanoeuvreerbaar", Q "vrije pratique", T
  "spannet".
- Pennant length and the cross position on 4/8 are free choices (see the table). If the viewer
  wants the "look" of one source, use the RvW drawings: they are Dutch and official for racing.
- The NK and Kaagcup class flags change every year. Store them per event, not in this table.

## `seinvlaggen.json`

Array of objects. Common keys: `id`, `kind` (`letter` · `cijfer` · `vervanger` · `onderscheiding`
· `wedstrijd` · `bpr`; `onderscheiding` was added because the answering pennant is not a
substitute), `naam`, `naam_nl`, `spelwoord` (ICS phonetic word, letters and numerals),
`ontwerp {vorm, verhouding, omtrek, velden, omschrijving}` (see "Drawing conventions"),
`zoek {kleuren, patroon, vorm}` for the zoek panel, `betekenis_nl`, `betekenis_nl_status`
(officieel / parafrase / **eigen vertaling**), `betekenis_en`, `bron`, `relevant` (likely to be met
from a lelievlet), and when present `wedstrijd` (RvW meaning of the letter), `bpr`, `cwo`,
`scouting`, `afwijkingen` (design disagreements), `opmerking`, `ontwerp_check`.
Compound signals (`wedstrijd`, some `bpr`) list their flags top to bottom in `vlaggen` (ids of
other entries; `"1–9"` = any cijferwimpel) and have no `ontwerp` of their own. `geluid` uses the
RvW notation: `tonen` / `wegnemen` sounds, or for BPR entries the bijlage 6 signal.
`wed-klassenvlag` has the full `startprocedure`. `wed-C` lists its `bijtekens`.
