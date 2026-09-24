import { createHash } from 'node:crypto';
import { copyFileSync, cpSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));

// The library build: one script that a page loads and calls create() on. three is bundled in, so a
// page needs nothing else, and public/ (models/, textures/) is copied next to the script - which is
// where the viewer looks for it when the page passes no `assets`.

/** The demo page is what dist-lib is published as: it becomes the index of the site. Beside it
 *  embed.html, the viewer on its own for an <iframe> on another site, and app.html, the viewer as
 *  an installable app, with its manifest, icons and service worker. */
const demoPage = {
  name: 'lelievlet-demo-page',
  closeBundle() {
    const out = resolve(here, 'dist-lib');
    mkdirSync(out, { recursive: true });
    for (const file of ['index.html', 'embed.html', 'app.html', 'app.webmanifest', 'logo.js']) copyFileSync(resolve(here, 'demo', file), resolve(out, file));
    cpSync(resolve(here, 'demo/icons'), resolve(out, 'icons'), { recursive: true });
    // the service worker keeps what the app needs; its version is a hash of all of that, so any
    // change - the model, the script, the page - makes another sw.js, and the app takes it in
    const files = ['app.html', 'app.webmanifest', 'lelievlet.js', 'logo.js',
      ...['icons', 'models', 'textures'].flatMap((dir) => readdirSync(resolve(out, dir)).map((f) => `${dir}/${f}`))].sort();
    const hash = createHash('sha256');
    for (const file of files) hash.update(file).update(readFileSync(resolve(out, file)));
    const worker = readFileSync(resolve(here, 'demo/sw.js'), 'utf8');
    hash.update(worker);
    writeFileSync(resolve(out, 'sw.js'), worker.replace("'__VERSION__'", `'${hash.digest('hex').slice(0, 12)}'`)
      .replace('__FILES__', JSON.stringify(files)));
  },
};

export default defineConfig({
  plugins: [demoPage],
  build: {
    outDir: 'dist-lib',
    emptyOutDir: true,
    copyPublicDir: true,          // models/ and textures/ end up beside the script
    target: 'es2022',
    minify: true,
    lib: {
      entry: resolve(here, 'src/lib.js'),
      name: 'Lelievlet',
      formats: ['es', 'iife'],
      fileName: (format) => (format === 'es' ? 'lelievlet.js' : 'lelievlet.iife.js'),
    },
    // nothing is external: three travels with it. `named` keeps the IIFE global an object with
    // create() on it, beside the default export the ES build hands out.
    // It is served from a CDN, so the whitespace goes too: the ES build keeps it otherwise.
    rollupOptions: {
      external: [],
      output: { exports: 'named', minify: { mangle: true, compress: true } },
    },
  },
});
