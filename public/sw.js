// Service Worker for Finance Tracker - Online-First PWA Strategy
const CACHE_NAME = "finance-tracker-v1";
const STATIC_CACHE_NAME = "finance-tracker-static-v1";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon.svg",
];

// Install Event - Pre-cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.log("Pre-cache asset warning:", err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event - Clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== STATIC_CACHE_NAME) {
            console.log("Deleting old service worker cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event - Online-First Strategy for API & dynamic data, Cache-First for static assets
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests or browser extension requests
  if (request.method !== "GET" || !url.protocol.startsWith("http")) {
    return;
  }

  // 1. ONLINE-FIRST Strategy for API routes (/api/*)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // If response is valid, clone and store in cache as backup
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // Network failed (Offline) -> Fallback to cached API data
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({
              error: "You are currently offline. Showing last cached financial data.",
              offline: true,
            }),
            {
              status: 503,
              headers: { "Content-Type": "application/json" },
            }
          );
        })
    );
    return;
  }

  // 2. STALE-WHILE-REVALIDATE for App Shell & Static Assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is HTML page, return cached index or offline page
          if (request.headers.get("accept")?.includes("text/html")) {
            return caches.match("/");
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
