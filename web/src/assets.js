// Where models/ and textures/ are fetched from. Nothing in the viewer names an absolute path any
// more: an embed may sit on any host, and the built library is published next to the files it
// needs, so the default is "beside the script that is running".
//
// `import.meta.url` is what an ES module has. The IIFE build has no import.meta at all, so the URL
// of the script tag is read while that script runs - which is the only moment document.currentScript
// still points at it.

const CURRENT_SCRIPT = (typeof document !== 'undefined' && document.currentScript?.src) || null;
const DEV = import.meta.env.DEV;                  // vite writes this away at build time

function ownDirectory() {
  if (CURRENT_SCRIPT) return new URL('.', CURRENT_SCRIPT).href;
  try {
    // resolved at run time, on whatever host the module was loaded from
    return new URL(/* @vite-ignore */ '.', import.meta.url).href;
  } catch {
    return './';      // the IIFE build has no import.meta; there CURRENT_SCRIPT is what answers
  }
}

/**
 * A function that turns 'models/lelievlet.glb' into the URL to fetch it from. `given` is
 * config.assets: a directory, with or without its closing slash.
 */
export function makeAsset(given) {
  let base = given ? String(given) : null;
  if (base && !base.endsWith('/')) base += '/';
  if (!base) base = DEV ? '/' : ownDirectory();   // vite dev serves public/ at the root, not beside the module
  // `given` may be relative ('/', './assets/'), and a relative URL is no base to resolve against:
  // it is made absolute against the page first.
  const root = new URL(base, document.baseURI).href;
  return (path) => new URL(String(path).replace(/^\//, ''), root).href;
}
