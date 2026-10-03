import a from './a.js';
import b from './b.js';
import cd from './cd.js';
import e from './e.js';
import fgh from './fgh.js';
import { plaatshouder } from './kader.js';

// Every sign drawn so far, by code: { w, h, svg }. A code nobody has drawn gets a stand-in.
export const BORDEN = { ...a, ...b, ...cd, ...e, ...fgh };

/** The drawing of a sign, or its stand-in: { w, h, svg, missing }. */
export const bord = (code) => BORDEN[code] ?? { w: 600, h: 600, svg: plaatshouder(code), missing: true };
