const CACHE_NAME = 'gaieve-pwa-v1.0.0';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// الملفات التي سيتم تخزينها مؤقتاً
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-72x72.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// تركيب Service Worker
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Install completed');
        return self.skipWaiting();
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activation completed');
      return self.clients.claim();
    })
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // تجاهل طلبات POST وغير GET
  if (request.method !== 'GET') return;
  
  // تجاهل طلبات من مصادر مختلفة (CORS)
  if (request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        // إرجاع النسخة المخبأة إذا وجدت
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // محاولة جلب من الشبكة
        return fetch(request)
          .then(networkResponse => {
            // تخزين في الذاكرة المؤقتة الديناميكية
            if (request.url.startsWith('http')) {
              const responseClone = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // عرض صفحة عدم الاتصال إذا فشل الجلب
            if (request.destination === 'document') {
              return caches.match('/index.html');
            }
            
            // عرض رسالة خطأ للصور
            if (request.destination === 'image') {
              return new Response(
                '<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100" fill="#f0f0f0"/><text x="50" y="50" font-family="Arial" font-size="10" text-anchor="middle" fill="#666">No Image</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            return new Response('لا يوجد اتصال بالإنترنت', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// استقبال الرسائل من الصفحة الرئيسية
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// تحديث المحتوى في الخلفية
self.addEventListener('sync', event => {
  if (event.tag === 'update-content') {
    console.log('[Service Worker] Background sync triggered');
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    // تحديث المحتوى الديناميكي هنا
    console.log('[Service Worker] Content updated in background');
  } catch (error) {
    console.error('[Service Worker] Background sync failed:', error);
  }
}
