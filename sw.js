// Service Worker لتطبيق PWA
const CACHE_NAME = 'pwa-wrapper-v2';
const APP_SHELL = [
    './',
    './index.html',
    './app.js',
    './manifest.json',
    './assets/icon-72.png',
    './assets/icon-96.png',
    './assets/icon-128.png',
    './assets/icon-144.png',
    './assets/icon-152.png',
    './assets/icon-192.png',
    './assets/icon-384.png',
    './assets/icon-512.png'
];

// التثبيت
self.addEventListener('install', event => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(APP_SHELL);
            })
            .then(() => self.skipWaiting())
    );
});

// التنشيط
self.addEventListener('activate', event => {
    console.log('[Service Worker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('[Service Worker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
    // استبعاد طلبات iframe (المواقع الخارجية)
    if (event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                })
        );
    }
    // للمواقع الخارجية، دعها تمر مباشرة
});
