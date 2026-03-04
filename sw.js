// Pacchi Portineria - Service Worker (auto-update)
const CACHE_NAME = "pacchi-portineria-v1"; // <-- quando aggiorni, cambia v1 in v2, v3...

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./logo.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => (k !== CACHE_NAME) ? caches.delete(k) : null));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(event.request, { ignoreSearch: true });
    if (cached) return cached;

    try {
      const resp = await fetch(event.request);
      if (resp && resp.ok) cache.put(event.request, resp.clone());
      return resp;
    } catch (e) {
      return cache.match("./index.html");
    }
  })());
});
