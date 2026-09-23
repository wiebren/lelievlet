# CWO Roei-instructieboek – Katwijkse Zeeverkenners (1e druk, december 2005)

Source: https://katwijksezeeverkenners.nl/wp-content/uploads/2015/07/cwo_roei_instructieboek_katwijkse_zeeverkenners.pdf
Local: `../parts/katwijkse_zeeverkenners_cwo_roei_instructieboek.pdf` (60 PDF pages, Marc van Ruler)
— key `[KATR]` in `../parts/SOURCES.md` and `../parts/CWO_NIVEAUS.md`.

The rowing counterpart of the zeil-instructieboek in `NOTES.md`, and the project's primary reference
for **rowing**: part names, roeitermen, roeicommando's and manoeuvres. Scouting Nederland's own
*CWO Roeien* book (`../parts/jpcoen_boek_cwo_roeien_3_2021.pdf`, `[JPR3]`, "de leidraad voor het
CWO diploma Roeien") is built on it and has the same 40-name list (p. 7).

## Pages that matter

| PDF page | Printed | Content | Use |
|---|---|---|---|
| 5 | 1 | §1.1 side view of a vlet with the 40 numbers | Part quiz (Roeien) |
| 6 | 2 | §1.1 the 40 names; "Al het vaste staal van de boot wordt het casco genoemd"; §1.2.1 bakboord/stuurboord ("de kant waar het wrikgat zit, is stuurboord") | Part quiz, lesson text |
| 7 | 3 | §1.2.2 scheepsbenaming: roerganger, slagdoft/slagroeier (stuurboord), middoft/midroeiers, boegroeiers on the voordek; §1.2.3 landvasten en springen | Lesson text, crew positions |
| 8 | 4 | §1.3 averij, verhalen, schoeisel, harpje (mannetje/vrouwtje) | Tooltip text |
| 9–15 | 5–11 | H2 roeihouding, opbouw van een roeicommando (waarschuwings- + uitvoeringscommando), the commando's | Rowing animation and commando names |
| 16–21 | 12–17 | Manoeuvres: achtje, afvaren, aanleggen, man overboord, ankeren; wrikken, jagen, slepen | Procedures |

## Levels

There are none for the parts. §1.1: *"Toch is het noodzakelijk om alle onderdelen te kennen."*
`[JPR3]` p. 6 says the same, and the Scouting Nederland vorderingsstaten for Roeiboot I/II and III
both list only *"3. Onderdelen"*. The quiz therefore has one **Roeien** level that asks all of them
(decision of the owner, 2026-09-23), beside Zeilen I / II / III.

## The 40 names and the quiz

`nr` is the entry in `web/src/quizdata.js` (the numbering of the zeil drawing, plus 85 and on for
roei-only names); every one of them carries `roeien: true`.

| # | Name | quiz nr | | # | Name | quiz nr |
|---|---|---|---|---|---|---|
| 1 | Sleepoog | 64 | | 21 | Dol | 56 |
| 2 | Boeg | 79 | | 22 | Achterdek | 69 |
| 3 | Voordek | 60 | | 23 | Scheg | 47 |
| 4 | Hanekam | 39 | | 24 | Spiegel | 46 |
| 5 | Luchtkast | – (not in the model) | | 25 | Roerblad | 75 |
| 6 | Mangat | – (not in the model) | | 26 | Roerkoning | 72 |
| 7 | Dolboord | 41 | | 27 | Roerhaak | 73 (Roerhaken) |
| 8 | Boeisel | 42 | | 28 | Vingerling | 74 (Vingerlingen) |
| 9 | Berghout | 58 | | 29 | Helmstok | 71 |
| 10 | Kim | 44 | | 30 | Landvastoog | 68 (Landvastogen) |
| 11 | Vlak | 45 | | 31 | Hijsoog | 65 (Hijsogen) |
| 12 | Zwaardkast | 51 | | 32 | Wrikgat | 70 |
| 13 | Zwaardbout | 49 | | 33 | Buikdenningen | 63 (Buikdenning) |
| 14 | Mastkoker | 52 | | 34 | Spanten | 84 (Spant) |
| 15 | Grendelbout | 54 | | 35 | Kikker | 55 |
| 16 | Zwaardloper | 50 | | 36 | Vlaggestok | 76 (Vlaggenstok) |
| 17 | Zwaardgreep | – (part of the zwaard) | | 37 | Vlag | 78 |
| 18 | Zwaard | 48 | | 38 | Riem | 85 (roei-only) |
| 19 | Doft | 59 | | 39 | Handvat | – (part of the riem) |
| 20 | Dolpot | 57 | | 40 | Blad | – (part of the riem) |

35 of the 40 are asked. Handvat, Blad and Zwaardgreep become questions once the riem and the
zwaard are split into those parts in the model; Luchtkast and Mangat once there is something in
the model to point at.
