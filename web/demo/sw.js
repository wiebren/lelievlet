// The service worker of the installed app (app.html): everything the viewer needs kept here, so it
// also starts without internet - on the water, on a jetty - and swapped as a whole for the next
// build. The library build writes VERSION and FILES in (vite.lib.config.js): every build with any
// change is another sw.js, which the browser notices when the app page asks, at start, every hour
// and whenever the app comes back into view.
const VERSION = '__VERSION__';
const FILES = __FILES__;
const CACHE = `lelievlet-${VERSION}`;
const OWN_ICONS = 'lelievlet-eigen';                  // the icons app.html draws of the boat it was brought
const inScope = (path) => new URL(path, self.registration.scope).href;

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // past the HTTP cache: the site's files are kept there for minutes, and these have to be the new build
    await cache.addAll(FILES.map((file) => new Request(inScope(file), { cache: 'reload' })));
    await self.skipWaiting();                                      // the app page offers to start again with it
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) if (key.startsWith('lelievlet-') && key !== CACHE && key !== OWN_ICONS) await caches.delete(key);
    await self.clients.claim();
  })());
});

// only what the app needs is answered from here, an icon of the boat itself before the default one;
// anything else goes to the network as it would
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url); url.search = ''; url.hash = '';
  if (!FILES.some((file) => inScope(file) === url.href)) return;
  event.respondWith((async () => (await (await caches.open(OWN_ICONS)).match(url.href))
    ?? (await (await caches.open(CACHE)).match(url.href)) ?? fetch(event.request))());
});
