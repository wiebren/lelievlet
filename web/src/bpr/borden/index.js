import a from './a.js';
import b from './b.js';
import cd from './cd.js';
import e from './e.js';
import fgh from './fgh.js';
import abc, { EXTRA as extraAbc } from './extra-abc.js';
import extraE, { EXTRA as extraEx } from './extra-e.js';
import gh, { EXTRA as extraGh } from './extra-gh.js';
import { plaatshouder } from './kader.js';

// Every sign drawn so far, by code: { w, h, svg }. A code nobody has drawn gets a stand-in.
export const BORDEN = { ...a, ...b, ...cd, ...e, ...fgh, ...abc, ...extraE, ...gh };

/**
 * The signs that CWO does not ask about (extra-*.js), each with { code, naam, kleur, groep, betekenis,
 * lelievlet }: where Zoeken lists it by its looks, and what it means. They are there to look up,
 * marked so, and never come up in the quiz.
 */
export const EXTRA = [...extraAbc, ...extraEx, ...extraGh];
export const NIET_CWO = new Set(EXTRA.map((x) => x.code));

/** The drawing of a sign, or its stand-in: { w, h, svg, missing }. */
export const bord = (code) => BORDEN[code] ?? { w: 600, h: 600, svg: plaatshouder(code), missing: true };
