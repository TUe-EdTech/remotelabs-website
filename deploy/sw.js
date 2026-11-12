// Service worker for the Remote Labs website.
//
// Strategy: runtime cache-as-you-go - there is no static precache list, so
// there is no manual-bump failure mode. Assets are cached on first fetch
// and served from cache when the network is unavailable.
//
// The two version literals below are load-bearing: build.js rewrites these
// exact patterns when syncing the root VERSION file, and test.js matches on
// them. Keep the `const ... = '...'` shape.
const CACHE_NAME = 'remotelabs-v2.1.21';
const ASSET_VERSION = '2.1.21';

// Install: activate immediately (no precaching needed).
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Fetch strategy per request type:
// - Navigations (HTML): network first (always fresh), but the successful
//   response is cached too, so the offline fallback below can actually hit.
// - Same-origin versioned assets (?v=...): cache first. The URL only changes
//   when VERSION is bumped, and the bump changes CACHE_NAME, so the old
//   cache is dropped on activate and each asset is re-fetched exactly once.
// - Everything else: network first, cache-as-you-go, cache fallback.
// Every fallback ends in a real Response (never undefined).
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const offlineResponse = () => new Response('Offline', { status: 503, statusText: 'Offline' });

  // Cache a copy of a successful same-origin response (fire and forget).
  function cachePut(request, response) {
    if (response && response.status === 200 && response.type === 'basic') {
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then((cache) => {
        cache.put(request, responseToCache);
      });
    }
  }

  // Navigations (HTML page loads) always go to the network first.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          cachePut(event.request, response);
          return response;
        })
        .catch(() =>
          // Offline: serve the cached copy of this exact request, or fall
          // back to the cached root only when the request was for the site
          // root navigation.
          caches.match(event.request).then((cached) => {
            if (cached) return cached;
            const url = new URL(event.request.url);
            if (url.pathname === '/' || url.pathname === '/index.html') {
              return caches.match('/').then((root) => root || offlineResponse());
            }
            return offlineResponse();
          })
        )
    );
    return;
  }

  const url = new URL(event.request.url);

  // Versioned same-origin assets are immutable: cache first, network
  // fallback (and cache the fresh copy).
  if (url.origin === self.location.origin && url.searchParams.has('v')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request)
          .then((response) => {
            cachePut(event.request, response);
            return response;
          })
          .catch(offlineResponse);
      })
    );
    return;
  }

  // For other assets, try network first, fall back to cache.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        cachePut(event.request, response);
        return response;
      })
      .catch(() =>
        caches.match(event.request).then((cached) => cached || offlineResponse())
      )
  );
});

// Activate: delete every cache that is not the current CACHE_NAME, then
// take control of all open clients immediately.
self.addEventListener('activate', (event) => {
  const keepCaches = [CACHE_NAME];
  event.waitUntil(
    caches.keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cacheName) => {
            if (!keepCaches.includes(cacheName)) {
              return caches.delete(cacheName);
            }
            return undefined;
          })
        )
      )
      .then(() => self.clients.claim())
  );
});
