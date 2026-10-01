// Basic Service Worker for Remote Labs Website
// Uses a runtime cache-as-you-go strategy: no static precache list is
// maintained, so there is no manual-bump failure mode. Assets are cached on
// first fetch and served from cache when the network is unavailable.
const CACHE_NAME = 'remotelabs-v2.1.7';
const ASSET_VERSION = '2.1.7';

// Install event - activate immediately (no precaching needed)
self.addEventListener('install', () => {
    self.skipWaiting();
});

// Fetch event - NETWORK FIRST with cache fallback
// This ensures users always get the latest version from the server.
self.addEventListener('fetch', (event) => {
    // Navigations (HTML page loads) always go to the network first.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    // Offline: serve the cached copy of this exact request,
                    // or fall back to the cached root only when the request
                    // was for the site root navigation.
                    return caches.match(event.request)
                        .then(function (cached) {
                            if (cached) return cached;
                            var url = new URL(event.request.url);
                            if (url.pathname === '/' || url.pathname === '/index.html') {
                                return caches.match('/');
                            }
                            return new Response('Offline', { status: 503, statusText: 'Offline' });
                        });
                })
        );
        return;
    }

    // For other assets, try network first, fall back to cache.
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache fresh responses for offline use.
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
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
