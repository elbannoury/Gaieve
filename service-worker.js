// أبسط Service Worker ممكن
self.addEventListener('install', function(event) {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('fetch', function(event) {
    // لا تفعل أي شيء، فقط دع الطلبات تمر
    event.respondWith(fetch(event.request));
});

self.addEventListener('activate', function(event) {
    console.log('Service Worker activated');
});
