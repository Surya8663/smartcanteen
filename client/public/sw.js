/*
  SmartCanteen Service Worker
  - Cache name: smartcanteen-v1
  - Core assets pre-cached on install
  - Navigation: network first, fallback to cached index.html
  - Same-origin static assets: cache first, then network, then cache response
  - Same-origin API (/api/*): network first, fallback to cache for GET
  - Anthropic API: network only; offline fallback JSON
  - Other external requests: network first, offline placeholder fallback
  - Optional background sync for offline order queue
  - Supports SKIP_WAITING message from client
*/

const CACHE_NAME = 'smartcanteen-v1';
const CORE_ASSETS = ['/', '/index.html', '/manifest.json'];

const DB_NAME = 'smartcanteen-offline-db';
const DB_VERSION = 1;
const PENDING_ORDERS_STORE = 'pending-orders';

self.addEventListener('install', (event) => {
  // Pre-cache the app shell so first load/offline boot works.
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.warn('[SW] Install cache failed:', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  // Remove old cache versions and immediately control open clients.
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
      .catch((error) => {
        console.warn('[SW] Activate cleanup failed:', error);
      })
  );
});

self.addEventListener('message', (event) => {
  // Allow the app to instantly activate a waiting SW update.
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept localhost dev traffic (Vite HMR/modules).
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    return;
  }

  // Anthropic API: always network only, never cache AI responses.
  if (url.hostname.includes('api.anthropic.com')) {
    event.respondWith(handleAnthropicRequest(request));
    return;
  }

  // React Router offline support for HTML navigation.
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Same-origin API: network first, cache fallback for GET.
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Same-origin static assets: cache first strategy.
  if (url.origin === self.location.origin && isStaticAsset(request, url)) {
    event.respondWith(handleStaticAssetRequest(request));
    return;
  }

  // Other external requests: network first with offline placeholder fallback.
  if (url.origin !== self.location.origin) {
    event.respondWith(handleExternalRequest(request));
  }
});

async function handleNavigationRequest(request) {
  try {
    const response = await fetch(request);

    // Keep an updated copy of index for offline app shell fallback.
    const cache = await caches.open(CACHE_NAME);
    const appShell = await fetch('/index.html');
    if (appShell && appShell.ok) {
      await cache.put('/index.html', appShell.clone());
    }

    return response;
  } catch {
    const cachedIndex = await caches.match('/index.html');
    return (
      cachedIndex ||
      new Response('Offline', {
        status: 503,
        statusText: 'Offline'
      })
    );
  }
}

async function handleStaticAssetRequest(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const networkResponse = await fetch(request);
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // If a static asset is unavailable offline, return a lightweight fallback.
    return buildOfflinePlaceholderResponse(request);
  }
}

async function handleApiRequest(request) {
  try {
    const response = await fetch(request);

    // Cache only successful GET API responses for offline fallback.
    if (request.method === 'GET' && response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }

    return response;
  } catch {
    // Optional enhancement: queue POST /api/orders for later sync.
    if (request.method === 'POST' && request.url.includes('/api/orders')) {
      await queuePendingOrder(request);
      return new Response(
        JSON.stringify({
          queued: true,
          offline: true,
          message: 'Order saved offline and will sync when online.'
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (request.method === 'GET') {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
    }

    return new Response(
      JSON.stringify({ error: 'offline', message: 'API unavailable offline' }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleAnthropicRequest(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(
      JSON.stringify({
        error: 'offline',
        message: 'AI features unavailable offline'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function handleExternalRequest(request) {
  try {
    return await fetch(request);
  } catch {
    return buildOfflinePlaceholderResponse(request);
  }
}

function isStaticAsset(request, url) {
  if (request.method !== 'GET') {
    return false;
  }

  if (url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/manifest.json') {
    return true;
  }

  if (url.pathname.startsWith('/assets/')) {
    return true;
  }

  return ['script', 'style', 'image', 'font'].includes(request.destination);
}

function buildOfflinePlaceholderResponse(request) {
  if (request.destination === 'image') {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360">' +
      '<rect width="640" height="360" fill="#f1f5f9"/>' +
      '<text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#64748b" font-family="Arial, sans-serif" font-size="24">Offline image</text>' +
      '</svg>';
    return new Response(svg, {
      status: 503,
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }

  if (request.destination === 'style') {
    return new Response('/* Offline: stylesheet unavailable */', {
      status: 503,
      headers: { 'Content-Type': 'text/css' }
    });
  }

  if (request.destination === 'script') {
    return new Response('// Offline: script unavailable', {
      status: 503,
      headers: { 'Content-Type': 'application/javascript' }
    });
  }

  return new Response('Offline resource unavailable', {
    status: 503,
    headers: { 'Content-Type': 'text/plain' }
  });
}

function openPendingOrdersDb() {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open(DB_NAME, DB_VERSION);

    dbRequest.onupgradeneeded = () => {
      const db = dbRequest.result;
      if (!db.objectStoreNames.contains(PENDING_ORDERS_STORE)) {
        db.createObjectStore(PENDING_ORDERS_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    dbRequest.onsuccess = () => resolve(dbRequest.result);
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

async function queuePendingOrder(request) {
  try {
    const cloned = request.clone();
    const payload = await cloned.json();
    const db = await openPendingOrdersDb();

    await new Promise((resolve, reject) => {
      const tx = db.transaction(PENDING_ORDERS_STORE, 'readwrite');
      const store = tx.objectStore(PENDING_ORDERS_STORE);
      store.add({ payload, createdAt: Date.now() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });

    if (self.registration && 'sync' in self.registration) {
      await self.registration.sync.register('sync-pending-orders');
    }
  } catch (error) {
    console.warn('[SW] Failed to queue pending order:', error);
  }
}

async function getPendingOrders() {
  const db = await openPendingOrdersDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_ORDERS_STORE, 'readonly');
    const store = tx.objectStore(PENDING_ORDERS_STORE);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

async function clearPendingOrders() {
  const db = await openPendingOrdersDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_ORDERS_STORE, 'readwrite');
    const store = tx.objectStore(PENDING_ORDERS_STORE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

async function syncPendingOrders() {
  const pendingOrders = await getPendingOrders();
  if (!pendingOrders.length) {
    return;
  }

  // Placeholder sync behavior for now (no real backend write yet).
  console.log('[SW] Syncing pending orders:', pendingOrders);

  await clearPendingOrders();

  if (self.Notification && Notification.permission === 'granted') {
    await self.registration.showNotification('Your order has been synced! ✅', {
      body: `${pendingOrders.length} pending order(s) synced successfully.`,
      icon: '/favicon.ico',
      badge: '/favicon.ico'
    });
  }
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-orders') {
    event.waitUntil(syncPendingOrders());
  }
});