self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open('agrifather-v1').then(cache => {
      return cache.match(event.request).then(response => {
        if (response) return response;
        return fetch(event.request)
          .then(networkResponse => {
            if (event.request.method === 'GET' && networkResponse.ok) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Optionally, return a fallback page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return new Response('Network error', { status: 408, statusText: 'Network error' });
          });
      });
    })
  );
});
