const CACHE_NAME = "demma-gta-ops-v48";
const APP_SHELL = ["./", "./index.html", "./week.json", "./manifest.webmanifest", "./assets/los-santos-ops-hero.jpg", "./assets/demma-ops-icon-180.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  // The weekly feed has to be network-first or a cached copy would pin the app
  // to whichever week it first saw. Cache is only the offline fallback.
  if (new URL(event.request.url).pathname.endsWith("/week.json")) {
    // Stored under the bare path, not the cache-busting ?v= the page adds, so
    // the offline copy is one entry rather than one per visit.
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put("./week.json", copy));
      return response;
    }).catch(() => caches.match("./week.json")));
    return;
  }
  // The page itself is network-first too, so a new build lands on an ordinary
  // refresh. Cache-first meant every app update needed the in-app reset button.
  if (event.request.mode === "navigate" || new URL(event.request.url).pathname.endsWith("/index.html")) {
    event.respondWith(fetch(event.request).then(response => {
      const copy = response.clone();
      caches.open(CACHE_NAME).then(cache => cache.put("./index.html", copy));
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  // Everything else (icons, the hero image) is versioned by cache name and
  // never changes within a release, so cache-first is right for those.
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    const copy = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
    return response;
  }).catch(() => caches.match("./index.html"))));
});
