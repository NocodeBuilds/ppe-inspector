// Service Worker for PPE Inspector PWA
const CACHE_NAME = 'ppe-inspector-v1';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME) {
              console.log('[Service Worker] Removing old cache', key);
              return caches.delete(key);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Now active, controlling clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip Supabase API requests and other non-cacheable requests
  if (
    event.request.url.includes('/supabase/') || 
    event.request.url.includes('/auth/') ||
    event.request.url.includes('/rest/') ||
    event.request.method !== 'GET'
  ) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if found
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Otherwise, fetch from network
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache the new response for future use
            let responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(error => {
            console.log('[Service Worker] Fetch failed:', error);
            
            // For HTML navigations, return the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
            
            return null;
          });
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-inspections') {
    event.waitUntil(syncInspections());
  }
});

// Background sync function for inspections
async function syncInspections() {
  try {
    // Get data from IndexedDB
    const offlineInspections = await getOfflineInspections();
    
    if (offlineInspections.length === 0) {
      return;
    }
    
    // Process each offline inspection
    for (const inspection of offlineInspections) {
      // Perform API call to save the inspection
      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inspection),
      });
      
      if (response.ok) {
        // Remove from IndexedDB after successful sync
        await removeOfflineInspection(inspection.id);
      }
    }
    
    // Notify clients about the sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Offline inspections have been synced'
      });
    });
    
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getOfflineInspections() {
  // In a real implementation, this would get data from IndexedDB
  return [];
}

async function removeOfflineInspection(id) {
  // In a real implementation, this would remove data from IndexedDB
}

// Push notification event
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientsList => {
      const url = event.notification.data.url;
      
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
});
