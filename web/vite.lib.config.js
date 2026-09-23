import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const here = dirname(fileURLToPath(import.meta.url));

// The library build: one script that a page loads and calls create() on. three is bundled in, so a
// page needs nothing else, and public/ (models/, textures/) is copied next to the script - which is
// where the viewer looks for it when the page passes no `assets`.

/** The demo page is what dist-lib is published as: it becomes the index of the site. Beside it
 *  embed.html, the viewer on its own for an <iframe> on another site. */
const demoPage = {
  name: 'lelievlet-demo-page',
  closeBundle() {
    const out = resolve(here, 'dist-lib');
    mkdirSync(out, { recursive: true });
    copyFileSync(resolve(here, 'demo/index.html'), resolve(out, 'index.html'));
    copyFileSync(resolve(here, 'demo/embed.html'), resolve(out, 'embed.html'));
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
