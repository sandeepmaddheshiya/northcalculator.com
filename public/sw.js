/* NorthCalculator service worker (BRIEF §10: PWA/offline). Same-origin GET requests only.
 * - Hashed build assets (/_next/static, fonts, icons): cache-first (they are immutable).
 * - Pages: network-first, falling back to the cached copy, then to the offline page.
 * - Other same-origin data (search index): stale-while-revalidate.
 * Calculators run entirely in the browser, so any page visited once keeps working offline.
 * Cross-origin requests (currency rate providers) are never intercepted.
 */
const VERSION = 'v1';
const ASSETS = `nc-assets-${VERSION}`;
const PAGES = `nc-pages-${VERSION}`;
const DATA = `nc-data-${VERSION}`;
const MAX_PAGES = 60;
const OFFLINE = '/en/offline';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((c) => c.addAll(['/en', OFFLINE]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith('nc-') && ![ASSETS, PAGES, DATA].includes(k))
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function trim(cacheName, max) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (const k of keys.slice(0, Math.max(0, keys.length - max))) await cache.delete(k);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (
    url.pathname.startsWith('/_next/static/') ||
    /\.(woff2?|png|svg|ico|webmanifest)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.open(ASSETS).then(async (c) => {
        const hit = await c.match(req);
        if (hit) return hit;
        const res = await fetch(req);
        if (res.ok) c.put(req, res.clone());
        return res;
      }),
    );
    return;
  }

  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const c = await caches.open(PAGES);
        try {
          const res = await fetch(req);
          if (res.ok) {
            // Store without the query string: calculator state lives in the URL and the page
            // restores it on the client, so one copy per page is enough.
            const key = url.origin + url.pathname;
            c.put(key, res.clone()).then(() => trim(PAGES, MAX_PAGES));
          }
          return res;
        } catch {
          return (
            (await c.match(url.origin + url.pathname)) ??
            (await c.match(OFFLINE)) ??
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  event.respondWith(
    caches.open(DATA).then(async (c) => {
      const hit = await c.match(req);
      const net = fetch(req)
        .then((res) => {
          if (res.ok) c.put(req, res.clone());
          return res;
        })
        .catch(() => hit ?? Response.error());
      return hit ?? net;
    }),
  );
});
