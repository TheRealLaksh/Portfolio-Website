const CACHE_NAME = 'portfolio-v1';
const ASSETS = [
  './index.html',
  './assets/css/output.css',
  './assets/css/style.css',
  './assets/js/script.js',
  '/assets/images/favicon.png',
  '/assets/images/laksh.pradhwani.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});