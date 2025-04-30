// Service Worker for PPE Inspector PWA
const CACHE_NAME = 'ppe-inspector-v4'; // Incremented version
const DYNAMIC_CACHE = 'ppe-inspector-dynamic-v4';
const API_CACHE = 'ppe-inspector-api-v4';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/og-image.png',
  '/assets/index.css',
  '/assets/index.js'
];

// Routes that should be cached for offline access
const OFFLINE_ROUTES = [
  '/equipment',
  '/upcoming',
  '/expiring',
  '/flagged',
  '/reports'
];

// Helper functions for cache management
const cacheHelpers = {
  // Add all resources to a specific cache
  addResourcesToCache: async (cacheName, resources) => {
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(resources);
      console.log(`[Service Worker] Added ${resources.length} resources to ${cacheName}`);
      return true;
    } catch (error) {
      console.error('[Service Worker] Failed to cache resources:', error);
      return false;
    }
  },
  
  // Clear old caches that don't match current versions
  clearOldCaches: async () => {
    const keyList = await caches.keys();
    const validCaches = [CACHE_NAME, DYNAMIC_CACHE, API_CACHE];
    
    return Promise.all(
      keyList.map(key => {
        if (!validCaches.includes(key)) {
          console.log('[Service Worker] Removing old cache', key);
          return caches.delete(key);
        }
      })
    );
  },
  
  // Put a network response in cache
  putInCache: async (cacheName, request, response) => {
    if (response && response.status === 200) {
      try {
        const cache = await caches.open(cacheName);
        await cache.put(request, response.clone());
        return response;
      } catch (error) {
        console.error('[Service Worker] Failed to put in cache:', error);
        return response;
      }
    }
    return response;
  },
  
  // Network first, then cache strategy
  networkFirstStrategy: async (request) => {
    try {
      // Try network first
      const networkResponse = await fetch(request);
      
      // If request is successful, update cache
      if (networkResponse.ok) {
        const requestUrl = new URL(request.url);
        
        // Determine which cache to use based on request URL
        let cacheName = DYNAMIC_CACHE;
        if (requestUrl.pathname.includes('/rest/v1/')) {
          cacheName = API_CACHE;
        }
        
        await cacheHelpers.putInCache(cacheName, request, networkResponse.clone());
      }
      
      return networkResponse;
    } catch (error) {
      console.log('[Service Worker] Network request failed, trying cache', request.url);
      
      // If network fails, try cache
      const cache = await caches.match(request);
      if (cache) {
        console.log('[Service Worker] Serving from cache', request.url);
        return cache;
      }
      
      // If not in cache and is a page, serve offline page
      if (request.mode === 'navigate') {
        const offlineCache = await caches.open(CACHE_NAME);
        return offlineCache.match('/offline.html') || new Response('Unable to connect. Please check your internet connection.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Otherwise return error
      return new Response('Network error happened', {
        status: 408,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
};

// Helper for sync operations
const syncHelpers = {
  notifyClients: async (message) => {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage(message);
    });
  },
  
  // Process background sync for stored inspection forms
  processQueuedInspections: async () => {
    try {
      const keys = await caches.keys();
      const formKeys = keys.filter(key => key.startsWith('inspection_form_'));
      
      if (formKeys.length === 0) return;
      
      syncHelpers.notifyClients({
        type: 'SYNC_STARTED',
        count: formKeys.length
      });
      
      for (const key of formKeys) {
        try {
          // Process each form submission here
          // Implementation would depend on how your form data is stored
          
          // After successful processing, remove from cache
          await caches.delete(key);
          
          syncHelpers.notifyClients({
            type: 'FORM_SYNCED',
            key
          });
        } catch (error) {
          console.error(`[Service Worker] Failed to sync form ${key}:`, error);
        }
      }
      
      syncHelpers.notifyClients({
        type: 'SYNC_COMPLETED'
      });
    } catch (error) {
      console.error('[Service Worker] Error in background sync:', error);
      
      syncHelpers.notifyClients({
        type: 'SYNC_ERROR',
        error: error.message
      });
    }
  }
};

// Install event - cache core assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    Promise.resolve()
      .then(async () => {
        const success = await cacheHelpers.addResourcesToCache(CACHE_NAME, STATIC_ASSETS);
        if (success) {
          console.log('[Service Worker] Successfully installed');
          self.skipWaiting(); // Activate immediately
        }
      })
  );
});

// Activate event - clear old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    Promise.resolve()
      .then(async () => {
        await cacheHelpers.clearOldCaches();
        await self.clients.claim(); // Take control of clients immediately
        console.log('[Service Worker] Successfully activated');
      })
  );
});

// Fetch event - handle network requests
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }
  
  // Use network-first strategy for all requests
  event.respondWith(cacheHelpers.networkFirstStrategy(request));
});

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag);
  
  if (event.tag === 'sync-inspections') {
    event.waitUntil(syncHelpers.processQueuedInspections());
  }
});

// Push event - handle push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received:', event);
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'PPE Inspector';
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    data: data.url || '/',
    vibrate: [100, 50, 100],
    tag: data.tag || 'default',
    renotify: data.renotify || false,
  };
  
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click event - handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event.notification.tag);
  
  event.notification.close();
  
  // Open the targeted URL when notification is clicked
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      const url = event.notification.data || '/';
      
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Handle unhandled errors
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Unhandled error:', event.message, event.filename, event.lineno);
});

console.log('[Service Worker] Script loaded');
