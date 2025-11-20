const CACHE_NAME = "laksh-portfolio-cache";
const ASSET_LIST = [
  "./",
  "./index.html",
  "./assets/css/output.css",
  "./assets/css/style.css",
  "./assets/js/script.js",
  "./assets/images/favicon.png",
  "./assets/images/laksh.pradhwani.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSET_LIST);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
          });
        }
        return response;
      });

      // Return cached version immediately, update it in background
      return cached || networkFetch;
    })
  );
});
