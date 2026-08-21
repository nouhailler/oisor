const CACHE_NAME = 'oiseaux-de-france-v1.1.0';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/data/birds.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/assets/images/birds/rouge-gorge.webp',
  '/assets/images/birds/mesange-bleue.webp',
  '/assets/images/birds/merle-noir.webp',
  '/assets/images/birds/chardonneret-elegant.webp',
  '/assets/images/birds/heron-cendre.webp',
  '/assets/images/birds/canard-colvert.webp'
];

// Installation: Pre-cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to pre-cache some assets:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activation: Clean up legacy caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Strategy: Stale-While-Revalidate for assets & JSON, Cache-First for images
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Handle API / JSON / Static Assets: Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline fallback
            return cachedResponse;
          });

        // Return cached version immediately if available, otherwise wait for network
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Listen for message from app to skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
