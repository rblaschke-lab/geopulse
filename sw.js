// ══════════════════════════════════════════════════════════════
// GEOPULSE Service Worker — PWA offline shell
//
// The page requests every asset with a ?v= cache-buster, so the
// precache list has to carry the same query — a bare '/main.js'
// never matches a request for '/main.js?v=2.7', and a precache that
// never matches is a precache that does nothing. VERSION below is
// the single place that changes on a release.
// ══════════════════════════════════════════════════════════════
const VERSION    = '2.7';
const CACHE_NAME = 'geopulse-v' + VERSION;
const V          = '?v=' + VERSION;

// The shell needed to boot the map offline. Tour prose, camera index and
// the long-form HTML pages are deliberately absent: they are large, and the
// fetch handler below caches them the first time they are actually opened.
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/fetchWrapper.js',
  '/config.js',
  '/style.css' + V,
  '/i18n.js' + V,
  '/quiz_bank.js' + V,
  '/quiz.js' + V,
  '/audio.js' + V,
  '/narration.js' + V,
  '/wind.js' + V,
  '/main.js' + V,
  '/search.js' + V,
  '/widgets.js' + V,
  '/tours_loader.js' + V,
  '/permalink.js' + V,
  '/manual.html'
];

// Install: pre-cache the shell. One 404 must not take the whole install
// down with it, so each asset is added on its own.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(STATIC_ASSETS.map(url =>
        cache.add(url).catch(() => console.warn('[SW] skipped ' + url))
      ))
    ).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: stale-while-revalidate for same-origin, network-only for APIs
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') return;
  // External requests (USGS, NASA, tiles) always go to the network —
  // stale seismic data is worse than no seismic data.
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        const fromNetwork = fetch(event.request).then(response => {
          if (response && response.ok) cache.put(event.request, response.clone());
          return response;
        }).catch(() => null);

        if (cached) {
          event.waitUntil(fromNetwork);
          return cached;
        }

        return fromNetwork.then(response => {
          if (response) return response;

          // Offline and nothing cached under this exact URL. A version bump
          // changes every query string at once, so fall back to the same file
          // from the previous release before giving up.
          return cache.match(event.request, { ignoreSearch: true }).then(stale => {
            if (stale) return stale;
            if (event.request.mode === 'navigate') return cache.match('/index.html');
            return new Response('', { status: 504, statusText: 'Offline' });
          });
        });
      })
    )
  );
});
