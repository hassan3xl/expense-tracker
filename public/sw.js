// Service Worker for Pennywise PWA - Online-First Strategy
// v4: Fix ERR_FAILED in standalone PWA mode
const CACHE_NAME = "pennywise-v4";
const STATIC_CACHE_NAME = "pennywise-static-v4";

// Only pre-cache truly static assets (NOT pages that may redirect or require auth)
const PRECACHE_ASSETS = [
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

// Fetch Event - Online-first with safe offline fallbacks
self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // 1. Ignore non-GET, non-http(s), and cross-origin requests — let them pass through
  if (
    request.method !== "GET" ||
    !url.protocol.startsWith("http") ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // 2. Navigation Requests (Page loads) — ALWAYS go to network first
  //    Never serve a cached navigation response that could be stale auth redirect
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Only cache successful HTML responses (not redirects or errors)
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.headers.get("content-type")?.includes("text/html")
          ) {
            const copy = networkResponse.clone();
            caches
              .open(STATIC_CACHE_NAME)
              .then((cache) => cache.put(request.url, copy));
          }
          return networkResponse;
        })
        .catch(async () => {
          // Offline fallback — try cache first, then show offline page
          const cachedPage = await caches.match(request.url);
          if (cachedPage) return cachedPage;

          // Generic offline fallback
          return new Response(
            `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Pennywise Offline</title></head><body style="font-family:system-ui,sans-serif;text-align:center;padding:40px;background:#090d16;color:#fff;"><h1 style="color:#10b981;">Pennywise</h1><p>Please reconnect to the internet to access your account.</p><button onclick="location.reload()" style="margin-top:20px;padding:12px 24px;background:#10b981;color:#fff;border:none;border-radius:8px;font-size:16px;cursor:pointer;">Retry</button></body></html>`,
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
      fetch(request)
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

  // 4. Static Assets (_next/static, images, icons) — Cache-first with background revalidation
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Revalidate in background
        fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              caches
                .open(STATIC_CACHE_NAME)
                .then((cache) => cache.put(request, networkResponse));
            }
          })
          .catch(() => {});
        return cachedResponse;
      }
      // Not in cache — fetch from network and cache for next time
      return fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches
              .open(STATIC_CACHE_NAME)
              .then((cache) => cache.put(request, copy));
          }
          return networkResponse;
        })
        .catch(() => new Response("", { status: 404 }));
    })
  );
});
