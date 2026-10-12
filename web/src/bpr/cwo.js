// What the CWO asks of the tekens, lichten and geluidsseinen: CWO Kielboot, competentie 402, Gevorderd (handboek
// 2022, as reference/bpr/cwo/THEORIE_EISEN.md lists it). One place for all that marks it: Zoeken (its CWO chip and
// 'niet voor CWO'), the quiz of Leren › Quiz › Verkeerstekens (bpr/tekenquiz.js, which keeps to these) and the
// Zelf verkennen of the lessons ('geen CWO').

// bijlage 7: A1 (and A1a), A9, A11, A12, A13, A15, A16, A17, B5, B6, D1, E1, E4, E9, E10, E11, E15, E16, E18, E19, E20,
// G1, G2, G4, G5.1(a) and H3
const TEKEN = /^(A\.(1|1a|9|11|12|13|15|16|17)|B\.(5|6)|D\.1[ab]?|E\.(1|4[ab]|9[a-i]|10[a-f]|11|15|16|18|19|20)|G\.(1[ab]|2[ab]|4\.1[ab]|4\.2|5\.1a?)|H\.3[abc]?)$/;
export const cwoTeken = (code) => TEKEN.test(String(code));

// lichten en dagtekens, by the BPR article a ship's tekens are in ('3.08 lid 1', 'BPR 3.26 lid 1, 3'): 3.01a, 3.05,
// 3.07, 3.08 lid 1 en 5, 3.09 lid 1-4, 3.12, 3.13, 3.15, 3.20, 3.25, 3.29, 3.30 and 3.38
export const cwoLicht = (artikel) => /^3\.(01a|05|07|08 lid [15]|09 lid [1-4]|09$|12|13|15|20|25|29|30|38)\b/.test(String(artikel ?? '').replace(/^BPR\s*/, ''));

// geluidsseinen: exactly the eight of bijlage 6 A the handboek names
export const CWO_GELUID = new Set(['attentie', 'stuurboord-uit', 'bakboord-uit', 'achteruit', 'niet-manoeuvreren', 'noodsein', 'blijf-weg', 'brug-sluis']);

// a flag or board on board, by its bron ('BPR 3.29', 'BPR 3.25; 6.22', 'BPR bijlage 7 H.3'): CWO if one of its BPR
// places is
export function cwoBron(bron) {
  return String(bron ?? '').split(';').map((s) => s.trim().replace(/^BPR\s*/, '')).some((s) => {
    const teken = s.match(/^bijlage 7 ([A-H]\.[0-9a-z.]+)$/);
    return teken ? cwoTeken(teken[1]) || cwoTeken(`${teken[1]}a`) : cwoLicht(s);
  });
}
