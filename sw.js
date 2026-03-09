const CACHE = 'magicuento-v1';
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  'https://fonts.googleapis.com/css2?family=Bubblegum+Sans&family=Quicksand:wght@400;500;600;700&display=swap'
];

// Install: cache shell
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(OFFLINE_ASSETS)).then(() => self.skipWaiting())
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', e => {
  // Skip Anthropic API calls — always network
  if (e.request.url.includes('anthropic.com')) return;

  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Cache successful GET responses
        if (e.request.method === 'GET' && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('/index.html')))
  );
});

// Background sync placeholder
self.addEventListener('sync', e => {
  if (e.tag === 'sync-stories') {
    console.log('[SW] Background sync triggered');
  }
});
