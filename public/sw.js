// Service Worker for Pennywise PWA - Online-First Strategy
const CACHE_NAME = "pennywise-v3";
const STATIC_CACHE_NAME = "pennywise-static-v3";

const PRECACHE_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon.svg",
];

// Install Event - Pre-cache shell assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((err) => console.log("Pre-cache asset info:", err))
  );
});

// Activate Event - Clean up old caches and take control immediately
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames.map((cache) => {
            if (cache !== CACHE_NAME && cache !== STATIC_CACHE_NAME) {
              return caches.delete(cache);
            }
          })
        )
      )
      .then(() => self.clients.claim())
  );
});

// Fetch Event - Prevent ERR_FAILED by passing request.url to fetch()
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Ignore non-GET, non-http(s), and cross-origin requests
  if (
    request.method !== "GET" ||
    !url.protocol.startsWith("http") ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // 2. Navigation Requests (Page loads, SSR, Clerk Auth redirects)
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request.url)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put("/", copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback
          const cachedRoot = await caches.match("/");
          if (cachedRoot) return cachedRoot;
          return new Response(
            "<!DOCTYPE html><html><head><title>Pennywise Offline</title></head><body style='font-family:sans-serif;text-align:center;padding:40px;background:#090d16;color:#fff;'><h1>Pennywise Offline</h1><p>Please reconnect to the internet to access your account.</p></body></html>",
            {
              status: 503,
              headers: { "Content-Type": "text/html" },
            }
          );
        })
    );
    return;
  }

  // 3. API Requests (/api/*) -> Online-First with cache fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request.url)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request.url, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request.url);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: "Offline mode active", offline: true }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        })
    );
    return;
  }

  // 4. Static Assets (_next/static, images, icons)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background
        fetch(request.url)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(request.url).catch(() => new Response("", { status: 404 }));
    })
  );
});
