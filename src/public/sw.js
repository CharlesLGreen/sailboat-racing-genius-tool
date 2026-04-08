// Service Worker for Snipeovation PWA
// - Handles Web Share Target POST to /vakaros/share (Vakaros file share-from-app)
// - Precaches app shell on install
// - Serves cached content as offline fallback (network-first, cache-fallback)

const CACHE_NAME = 'snipeovation-v4';
const PRECACHE = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.jpg'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) { return cache.addAll(PRECACHE); })
      .then(function() { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  // Handle Web Share Target API POST to /vakaros/share — preserve existing share-from-Vakaros flow
  if (url.pathname === '/vakaros/share' && event.request.method === 'POST') {
    event.respondWith((async () => {
      var formData = await event.request.formData();
      var file = formData.get('file');

      var newFormData = new FormData();
      if (file) newFormData.append('file', file);

      var response = await fetch('/vakaros/share', {
        method: 'POST',
        body: newFormData,
        credentials: 'same-origin'
      });
      return response;
    })());
    return;
  }

  // Only cache GETs
  if (event.request.method !== 'GET') return;

  // Network-first, cache-fallback for offline
  event.respondWith(
    fetch(event.request).then(function(resp) {
      if (resp && resp.ok && resp.type === 'basic') {
        var clone = resp.clone();
        caches.open(CACHE_NAME).then(function(c) { c.put(event.request, clone); });
      }
      return resp;
    }).catch(function() {
      return caches.match(event.request).then(function(cached) {
        return cached || caches.match('/');
      });
    })
  );
});
