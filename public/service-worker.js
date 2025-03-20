// Service Worker for PPE Inspector PWA
const CACHE_NAME = 'ppe-inspector-v3';
const DYNAMIC_CACHE = 'ppe-inspector-dynamic-v3';
const API_CACHE = 'ppe-inspector-api-v3';

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

// Helper functions for cache management
const cacheHelpers = {
  // Add all resources to a specific cache
  addResourcesToCache: async (cacheName, resources) => {
    try {
      const cache = await caches.open(cacheName);
      await cache.addAll(resources);
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
      } catch (error) {
        console.error('[Service Worker] Failed to put in cache:', error);
      }
    }
    return response;
  }
};

// Helper for sync operations
const syncHelpers = {
  notifyClients: async (message) => {
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage(message);
    });
  }
};

// Simplified install event - only cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    Promise.resolve()
      .then(async () => {
        const success = await cacheHelpers.addResourcesToCache(CACHE_NAME, STATIC_ASSETS);
        if (success) {
          console.log('[Service Worker] Successfully installed');
        } else {
          console.warn('[Service Worker] Partial install - some assets may not be cached');
        }
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[Service Worker] Install error:', error);
        return self.skipWaiting(); // Continue even if there's an error
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    Promise.resolve()
      .then(async () => {
        await cacheHelpers.clearOldCaches();
        console.log('[Service Worker] Now active, controlling clients');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('[Service Worker] Activation error:', error);
        return self.clients.claim(); // Continue even if there's an error
      })
  );
});

// Simplified fetch event - only handle navigation requests and static assets
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Handle page navigation - Use Network First for HTML requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          return cacheHelpers.putInCache(CACHE_NAME, event.request, response);
        })
        .catch(() => {
          console.log('[SW] Navigation fetch failed, falling back to cache');
          return caches.match(event.request)
            .then(cachedResponse => cachedResponse || caches.match('/'));
        })
    );
    return;
  }
  
  // For assets like JS, CSS, images - use cache first, then network
  if (event.request.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico)$/)) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response immediately
            return cachedResponse;
          }
          
          // If not in cache, try network
          return fetch(event.request)
            .then(response => {
              return cacheHelpers.putInCache(DYNAMIC_CACHE, event.request, response);
            })
            .catch(error => {
              console.error('[SW] Fetch failed:', error);
              // For images, return a placeholder
              if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
                return caches.match('/placeholder.svg');
              }
              
              // For other assets, return an error response
              return new Response('Network error', {
                status: 408,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
    );
    return;
  }
});

// Push notification event with sound and vibration
self.addEventListener('push', (event) => {
  try {
    let payload = { title: 'New Notification', body: 'Something new happened', url: '/' };
    
    // Try to parse the payload
    if (event.data) {
      try {
        payload = event.data.json();
      } catch (e) {
        payload.body = event.data.text();
      }
    }
    
    const options = {
      body: payload.body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      vibrate: [100, 50, 100],
      data: {
        url: payload.url || '/'
      },
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(payload.title, options)
    );
  } catch (error) {
    console.error('[Service Worker] Push notification error:', error);
  }
});

// Notification click event handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle notification action clicks
  if (event.action === 'view') {
    const url = event.notification.data.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then(clientsList => {
        // If a tab is already open, focus it
        for (const client of clientsList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Otherwise open a new tab
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});
