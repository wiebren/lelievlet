import css from './style.css?inline';
import { TEMPLATE } from './template.js';
import { resolveConfig, debugOn } from './config.js';
import { mount } from './main.js';

// The public face of the library. A page loads this module and calls create() on an element it has
// given a size; everything the viewer is lives in a shadow root on that element, so the page's own
// stylesheet cannot reach in and the viewer's cannot reach out. Nothing runs before create() does,
// and two viewers on one page know nothing of each other.

let devHandle = false;      // window.vlet goes to the first viewer only, and only in the dev server

/**
 * create(element, config) -> { ready, destroy, config, fullscreen, get, set }
 *   ready       resolves when the model is loaded and the first frame has been drawn
 *   destroy     stops the viewer, gives back its WebGL context and empties the element
 *   config      the configuration in force, defaults filled in (see config.js)
 *   fullscreen  fullscreen(on?) puts the viewer full screen or takes it back; left out, it flips.
 *               The browser only grants it from a real user action, and it does nothing at all
 *               when `volledigScherm` is false.
 *   get         get() -> the toestand the viewer is in (see config.js), or null until the model is in
 *   set         set(toestand, { direct }) takes the viewer there, only the keys given, animated as if
 *               the user had done it; `direct: true` jumps. Called before `ready`, it is applied
 *               together with the configuration's own toestand, at once.
 */
export function create(element, config = {}) {
  if (!(element instanceof Element)) {
    throw new TypeError('[lelievlet] create(element, config): het eerste argument is geen element');
  }
  const resolved = resolveConfig(config);

  // a second create() on the same element (after destroy()) reuses the shadow root it already has
  const ui = element.shadowRoot ?? element.attachShadow({ mode: 'open' });
  ui.replaceChildren();
  const style = document.createElement('style');
  style.textContent = css;
  const markup = document.createElement('template');
  markup.innerHTML = TEMPLATE;
  ui.append(style, markup.content);

  const viewer = mount(ui, element, resolved);
  const handle = { ready: viewer.ready, destroy: viewer.destroy, config: resolved, fullscreen: viewer.fullscreen,
                   get: viewer.get, set: viewer.set };
  if (debugOn(resolved)) handle.debugHandle = viewer.debug;
  if (import.meta.env.DEV && !devHandle) {   // handy in the console and for the automated checks
    devHandle = true;
    window.vlet = viewer.debug;
  }
  return handle;
}

export default { create };
