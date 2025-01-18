const CACHE_NAME = 'pwa-wrapper-v1';
const OFFLINE_URL = 'offline.html';

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/manifest.json',
    '/styles.css',
    '/offline.html',
    '/userscripts.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'http://www.tiktok.com' // Preload the start_url
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Opened cache');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch((err) => console.error('Cache install error:', err))
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log(`Deleting old cache: ${cacheName}`);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch Event
self.addEventListener('fetch', (event) => {
    // Bypass the service worker for certain requests
    if (
        event.request.url.includes('accounts.google.com') || 
        event.request.url.includes('apis.google.com') || 
        event.request.url.includes('tiktok.com')
    ) {
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                return response || fetch(event.request);
            })
            .catch(() => {
                if (event.request.mode === 'navigate') {
                    return caches.match(OFFLINE_URL);
                }
                return new Response('', {
                    status: 408,
                    statusText: 'Request timed out.'
                });
            })
    );
});