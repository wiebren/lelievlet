// The default icons of the app, drawn from its logo (demo/logo.js) in the viewer's own colours:
// what a browser shows before the app page has drawn the boat it was brought. SVG to PNG takes
// rsvg-convert (librsvg), which the site's build does not have: the PNGs are kept in the
// repository, like the docs, and made again with `pnpm icons` when the logo changes.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logoSvg } from '../demo/logo.js';

const web = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const emblem = `data:image/png;base64,${readFileSync(join(web, 'public/textures/zeilteken.png')).toString('base64')}`;
const work = mkdtempSync(join(tmpdir(), 'lelievlet-icons-'));
const ICONS = [['icon-192.png', 192, false], ['icon-512.png', 512, false], ['icon-maskable-512.png', 512, true], ['apple-touch-icon.png', 180, false]];
for (const [name, size, maskable] of ICONS) {
  const svg = join(work, `${name}.svg`);
  writeFileSync(svg, logoSvg({ look: 'kleur', emblem, size, maskable }));
  execFileSync('rsvg-convert', [svg, '-o', join(web, 'demo/icons', name)]);
}
console.log(`demo/icons: ${ICONS.map(([n]) => n).join(', ')} geschreven`);
