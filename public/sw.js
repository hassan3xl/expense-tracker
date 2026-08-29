// Service Worker for Pennywise PWA - Online-First Strategy
const CACHE_NAME = "pennywise-v2";
const STATIC_CACHE_NAME = "pennywise-static-v2";

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
      .catch((err) => console.error("PWA cache install error:", err))
  );
});

// Activate Event - Clean up old caches
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

// Fetch Event - Handle requests safely without causing ERR_FAILED
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 1. Ignore non-GET requests, non-http(s), and cross-origin requests (e.g. Clerk Auth, external APIs)
  if (
    request.method !== "GET" ||
    !url.protocol.startsWith("http") ||
    url.origin !== self.location.origin
  ) {
    return; // Allow browser to handle normally
  }

  // 2. Navigation Requests (Page Loads / Standalone PWA Window) -> Network First
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline/failed, fallback to cached page or cached root /
          const cached = await caches.match(request);
          if (cached) return cached;
          const cachedRoot = await caches.match("/");
          if (cachedRoot) return cachedRoot;
          return new Response("Offline - Pennywise", {
            status: 503,
            headers: { "Content-Type": "text/html" },
          });
        })
    );
    return;
  }

  // 3. API Requests (/api/*) -> Online-First with Cached API Fallback
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          if (cached) return cached;
          return new Response(
            JSON.stringify({ error: "Offline mode active", offline: true }),
            { status: 503, headers: { "Content-Type": "application/json" } }
          );
        })
    );
    return;
  }

  // 4. Static Assets (_next/static, icons, images, styles) -> Cache First / Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached and update in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches.open(STATIC_CACHE_NAME).then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      return fetch(request).catch(() => new Response("", { status: 404 }));
    })
  );
});
