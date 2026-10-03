// A contact sheet of the drawn scheepvaartverkeerstekens next to the BPR's own drawings, to check them:
//   node scripts/borden.mjs [group letters, e.g. "a" or "cd"] [out.png]
// Each row: the code, our drawing, and the BPR drawing(s) from reference/bpr/tekens/bpr_img (not in git).
// Needs rsvg-convert and ImageMagick (brew install librsvg imagemagick). Writes nothing into the repo
// unless `out` points there: by default the sheet goes to the system's temp directory.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const groups = (process.argv[2] ?? 'a b cd e fgh').split(/[\s,]+/).filter(Boolean);
const out = resolve(process.argv[3] ?? join(tmpdir(), `borden-${groups.join('')}.png`));
const bpr = resolve(here, '..', '..', 'reference', 'bpr');
const table = Object.fromEntries(JSON.parse(readFileSync(join(bpr, 'tekens.json'), 'utf8')).map((t) => [t.code, t]));
const work = mkdtempSync(join(tmpdir(), 'borden-'));

const rows = [];
for (const g of groups) {
  const signs = (await import(`../src/bpr/borden/${g}.js?${Date.now()}`)).default;
  for (const [code, { svg }] of Object.entries(signs)) {
    const file = join(work, `${code}.svg`); writeFileSync(file, svg);
    const ours = join(work, `${code}.png`);
    execFileSync('rsvg-convert', ['-h', '240', '-o', ours, file]);
    const theirs = (table[code]?.bpr_afbeelding ?? []).map((f) => join(bpr, 'tekens', 'bpr_img', f)).filter(existsSync);
    const label = join(work, `${code}-label.png`);
    const labelSvg = join(work, `${code}-label.svg`);
    writeFileSync(labelSvg, `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="240"><rect width="160" height="240" fill="white"/><text x="80" y="130" font-family="Arial" font-size="34" text-anchor="middle">${code}</text></svg>`);
    execFileSync('rsvg-convert', ['-o', label, labelSvg]);
    const row = join(work, `${code}-row.png`);
    execFileSync('magick', [label, ours, ...theirs.map((f) => ['(', f, '-resize', 'x240', ')']).flat(), '-background', 'white', '-splice', '12x0', '+append', row]);
    rows.push(row);
  }
}
if (!rows.length) { console.log('niets getekend in', groups.join(', ')); process.exit(0); }
execFileSync('magick', [...rows, '-background', '#dddddd', '-splice', '0x8', '-append', out]);
console.log(`${rows.length} tekens: ${out}`);
