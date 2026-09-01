// Basic Service Worker for Remote Labs Website
// Version: Bump this number whenever you update assets to force cache invalidation
const CACHE_NAME = 'remotelabs-v2.1.1';
// Updated by build.js to match the ?v= query string used in the HTML so that
// precached entries share the same cache key as the runtime requests.
const ASSET_VERSION = '2.1.1';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.min.css?v=' + ASSET_VERSION,
    '/script.min.js?v=' + ASSET_VERSION,

    '/assets/fonts/fonts.css?v=' + ASSET_VERSION,
    '/assets/fonts/lato-400-latin.woff2',
    '/assets/fonts/lato-700-latin.woff2',
    '/assets/fonts/poppins-700-latin.woff2'
];

// Install event - cache assets and activate immediately
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[' + CACHE_NAME + '] Caching assets');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                // Activate the new service worker immediately
                console.log('[' + CACHE_NAME + '] Skipping waiting, activating now');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[' + CACHE_NAME + '] Cache failed:', error);
            })
    );
});

// Fetch event - NETWORK FIRST with cache fallback
// This ensures users always get the latest version from the server
self.addEventListener('fetch', (event) => {
    // For HTML files, always go to network first (don't cache)
    if (event.request.url.indexOf('.html') !== -1 || event.request.url === '/') {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(event.request) || caches.match('/');
                })
        );
        return;
    }
    
    // For other assets, try network first, fall back to cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Cache fresh responses for offline use
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            console.log('[' + CACHE_NAME + '] Caching:', event.request.url);
                            cache.put(event.request, responseToCache);
                        });
                }
                return response;
            })
            .catch(() => {
                // Fallback to cache if network fails
                console.log('[' + CACHE_NAME + '] Network failed, serving from cache:', event.request.url);
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
                        console.log('[' + CACHE_NAME + '] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('[' + CACHE_NAME + '] Service worker activated');
            // Claim all clients immediately
            return self.clients.claim();
        })
    );
});
