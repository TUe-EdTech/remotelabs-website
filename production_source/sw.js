// Basic Service Worker for Remote Labs Website
// Uses a runtime cache-as-you-go strategy: no static precache list is
// maintained, so there is no manual-bump failure mode. Assets are cached on
// first fetch and served from cache when the network is unavailable.
const CACHE_NAME = 'remotelabs-v2.1.16';
const ASSET_VERSION = '2.1.16';

// Install event - activate immediately (no precaching needed)
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Fetch event - strategy per request type:
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

    function cachePut(request, response) {
        if (response && response.status === 200 && response.type === 'basic') {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
                .then((cache) => {
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
                .catch(() => {
                    // Offline: serve the cached copy of this exact request,
                    // or fall back to the cached root only when the request
                    // was for the site root navigation.
                    return caches.match(event.request)
                        .then(function (cached) {
                            if (cached) return cached;
                            var url = new URL(event.request.url);
                            if (url.pathname === '/' || url.pathname === '/index.html') {
                                return caches.match('/').then((root) => root || offlineResponse());
                            }
                            return offlineResponse();
                        });
                })
        );
        return;
    }

    const url = new URL(event.request.url);

    // Versioned same-origin assets are immutable: cache first, network
    // fallback (and cache the fresh copy).
    if (url.origin === self.location.origin && url.searchParams.has('v')) {
        event.respondWith(
            caches.match(event.request)
                .then((cached) => {
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
            .catch(() => {
                return caches.match(event.request)
                    .then((cached) => cached || offlineResponse());
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            // Claim all clients immediately
            return self.clients.claim();
        })
    );
});
