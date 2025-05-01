// Service Worker for PPE Inspector PWA
const CACHE_NAME = 'ppe-inspector-v5'; // Incremented version
const DYNAMIC_CACHE = 'ppe-inspector-dynamic-v5';
const API_CACHE = 'ppe-inspector-api-v5';
const OFFLINE_PAGE = '/offline.html';

// Assets to cache on install - critical app shell resources
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/offline.html',
  '/og-image.png',
  '/assets/index.css',
  '/assets/index.js',
  // Add any additional app shell resources
  '/lovable-uploads/logo.png'
];

// Routes that should be cached for offline access
const OFFLINE_ROUTES = [
  '/equipment',
  '/upcoming',
  '/expiring',
  '/flagged',
  '/reports',
  '/analytics'
];

// Helper functions for cache management with improved error handling
const cacheHelpers = {
  // Add all resources to a specific cache
  addResourcesToCache: async (cacheName, resources) => {
    try {
      const cache = await caches.open(cacheName);
      
      // Use Promise.allSettled instead of Promise.all for better error handling
      const results = await Promise.allSettled(
        resources.map(resource => 
          cache.add(resource).catch(err => {
            console.error(`[Service Worker] Failed to cache resource: ${resource}`, err);
            return null;
          })
        )
      );
      
      // Log results
      const successful = results.filter(r => r.status === 'fulfilled').length;
      console.log(`[Service Worker] Added ${successful}/${resources.length} resources to ${cacheName}`);
      
      return successful === resources.length;
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
  
  // Put a network response in cache with better error handling
  putInCache: async (cacheName, request, response) => {
    if (!response || !response.ok) return response;
    
    try {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      return response;
    } catch (error) {
      console.error('[Service Worker] Failed to put in cache:', error);
      return response;
    }
  },
  
  // Stale-while-revalidate strategy
  staleWhileRevalidate: async (request) => {
    try {
      // First, try to get from cache
      const cachedResponse = await caches.match(request);
      
      // Fetch from network in the background regardless
      const fetchPromise = fetch(request)
        .then(networkResponse => {
          // If request is successful, update cache
          if (networkResponse.ok) {
            const requestUrl = new URL(request.url);
            
            // Determine which cache to use based on request URL
            let cacheName = DYNAMIC_CACHE;
            if (requestUrl.pathname.includes('/rest/v1/')) {
              cacheName = API_CACHE;
            }
            
            cacheHelpers.putInCache(cacheName, request, networkResponse.clone());
          }
          
          return networkResponse;
        })
        .catch(error => {
          console.error('[Service Worker] Network fetch failed:', error);
          // Return nothing to fall back to cached response
          return null;
        });
        
      // Return the cached response if we have it, otherwise wait for the network response
      return cachedResponse || fetchPromise;
    } catch (error) {
      console.error('[Service Worker] Error in staleWhileRevalidate strategy:', error);
      
      // Try one more time to get from cache if something went wrong
      const fallbackCache = await caches.match(request);
      if (fallbackCache) return fallbackCache;
      
      // If not in cache and is a navigational request, serve offline page
      if (request.mode === 'navigate') {
        const offlineCache = await caches.open(CACHE_NAME);
        return offlineCache.match(OFFLINE_PAGE);
      }
      
      return new Response('Network error happened', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  },
  
  // Network first, then cache strategy with improved error handling
  networkFirstStrategy: async (request) => {
    try {
      // Try network first with a reasonable timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Network request timeout')), 3000);
      });
      
      const networkPromise = fetch(request);
      
      // Race between network request and timeout
      const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
      
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
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('[Service Worker] Serving from cache', request.url);
        return cachedResponse;
      }
      
      // If not in cache and is a page, serve offline page
      if (request.mode === 'navigate') {
        const offlineCache = await caches.open(CACHE_NAME);
        const offlineResponse = await offlineCache.match(OFFLINE_PAGE);
        if (offlineResponse) return offlineResponse;
        
        return new Response('Unable to connect. Please check your internet connection.', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
      
      // Otherwise return error
      return new Response('Network error happened', {
        status: 503,
        headers: { 'Content-Type': 'text/plain' },
      });
    }
  }
};

// Helper for sync operations with better error handling
const syncHelpers = {
  notifyClients: async (message) => {
    try {
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage(message);
      });
    } catch (error) {
      console.error('[Service Worker] Error notifying clients:', error);
    }
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
      
      let successCount = 0;
      let failureCount = 0;
      
      for (const key of formKeys) {
        try {
          // Process each form submission here
          // Implementation would depend on how your form data is stored
          
          // After successful processing, remove from cache
          await caches.delete(key);
          
          syncHelpers.notifyClients({
            type: 'FORM_SYNCED',
            key,
            remaining: formKeys.length - (successCount + failureCount + 1)
          });
          
          successCount++;
        } catch (error) {
          console.error(`[Service Worker] Failed to sync form ${key}:`, error);
          failureCount++;
        }
      }
      
      syncHelpers.notifyClients({
        type: 'SYNC_COMPLETED',
        successCount,
        failureCount
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

// Install event - cache core assets with progressive enhancement
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing version:', CACHE_NAME);
  
  event.waitUntil(
    Promise.resolve()
      .then(async () => {
        // First cache the offline page to ensure it's available
        const cache = await caches.open(CACHE_NAME);
        await cache.add(OFFLINE_PAGE).catch(() => 
          console.error('[Service Worker] Failed to cache offline page')
        );
        
        // Then cache the rest of the static assets
        const success = await cacheHelpers.addResourcesToCache(CACHE_NAME, STATIC_ASSETS);
        if (success) {
          console.log('[Service Worker] Successfully installed core assets');
          self.skipWaiting(); // Activate immediately
        }
      })
      .catch(error => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clear old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating version:', CACHE_NAME);
  
  event.waitUntil(
    Promise.resolve()
      .then(async () => {
        await cacheHelpers.clearOldCaches();
        await self.clients.claim(); // Take control of clients immediately
        console.log('[Service Worker] Successfully activated and claimed clients');
      })
      .catch(error => {
        console.error('[Service Worker] Activation failed:', error);
      })
  );
});

// Fetch event - handle network requests with adaptive strategy
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || !request.url.startsWith('http')) {
    return;
  }
  
  // Use stale-while-revalidate for API calls
  const url = new URL(request.url);
  if (url.pathname.includes('/rest/v1/')) {
    event.respondWith(cacheHelpers.staleWhileRevalidate(request));
    return;
  }
  
  // Use network-first for HTML pages (navigation)
  if (request.mode === 'navigate') {
    event.respondWith(cacheHelpers.networkFirstStrategy(request));
    return;
  }
  
  // Use stale-while-revalidate for all other requests
  event.respondWith(cacheHelpers.staleWhileRevalidate(request));
});

// Sync event - handle background sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync event:', event.tag);
  
  if (event.tag === 'sync-inspections') {
    event.waitUntil(syncHelpers.processQueuedInspections());
  }
});

// Push event - handle push notifications with better error handling
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received:', event);
  
  try {
    let data = { title: 'PPE Inspector', body: 'New notification' };
    
    if (event.data) {
      try {
        data = event.data.json();
      } catch (error) {
        console.error('[Service Worker] Failed to parse push data:', error);
      }
    }
    
    const options = {
      body: data.body,
      icon: '/lovable-uploads/logo.png',
      badge: '/lovable-uploads/logo.png',
      data: data.url || '/',
      vibrate: [100, 50, 100],
      tag: data.tag || 'default',
      renotify: data.renotify || false,
      actions: data.actions || [],
    };
    
    event.waitUntil(self.registration.showNotification(data.title, options));
  } catch (error) {
    console.error('[Service Worker] Error handling push notification:', error);
  }
});

// Notification click event - handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event.notification.tag);
  
  event.notification.close();
  
  try {
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
  } catch (error) {
    console.error('[Service Worker] Error handling notification click:', error);
  }
});

// Handle message events from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CHECK_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION',
      version: CACHE_NAME
    });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHES') {
    event.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(keys.map(key => caches.delete(key)));
      }).then(() => {
        event.ports[0].postMessage({
          type: 'CACHES_CLEARED'
        });
      })
    );
  }
});

// Handle unhandled errors
self.addEventListener('error', (event) => {
  console.error('[Service Worker] Unhandled error:', event.message, event.filename, event.lineno);
});

// Handle unhandled promise rejections
self.addEventListener('unhandledrejection', (event) => {
  console.error('[Service Worker] Unhandled promise rejection:', event.reason);
});

console.log('[Service Worker] Script loaded');
