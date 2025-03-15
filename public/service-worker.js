// Service Worker for PPE Inspector PWA
const CACHE_NAME = 'ppe-inspector-v2';
const DYNAMIC_CACHE = 'ppe-inspector-dynamic-v2';
const API_CACHE = 'ppe-inspector-api-v2';

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
    const cache = await caches.open(cacheName);
    return cache.addAll(resources);
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
    if (response.status === 200) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
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
  },
  
  // Process offline data and sync with server
  processOfflineData: async (dataItems, apiEndpoint, successCallback) => {
    if (!dataItems || dataItems.length === 0) return { success: [], failed: [] };
    
    const successfulItems = [];
    const failedItems = [];
    
    for (const item of dataItems) {
      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item),
        });
        
        if (response.ok) {
          successfulItems.push(item.id);
          if (successCallback) await successCallback(item.id);
        } else {
          failedItems.push(item.id);
        }
      } catch (error) {
        console.error('[Service Worker] Sync error for item', item.id, error);
        failedItems.push(item.id);
      }
    }
    
    return { success: successfulItems, failed: failedItems };
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    cacheHelpers.addResourcesToCache(CACHE_NAME, STATIC_ASSETS)
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
    cacheHelpers.clearOldCaches()
      .then(() => {
        console.log('[Service Worker] Now active, controlling clients');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache or network with improved strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-cacheable API requests
  if (
    event.request.url.includes('/supabase/') || 
    event.request.url.includes('/auth/') ||
    event.request.url.includes('/rest/') ||
    event.request.method !== 'GET'
  ) {
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
  
  // Handle assets and other requests - Use Network First with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache dynamic content
        return cacheHelpers.putInCache(DYNAMIC_CACHE, event.request, response);
      })
      .catch(() => {
        // Try to get from cache if network fails
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            
            // If it's an image, return a placeholder
            if (event.request.url.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
              return caches.match('/placeholder.svg');
            }
            
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-inspections') {
    event.waitUntil(syncInspections());
  } else if (event.tag === 'sync-offline-reports') {
    event.waitUntil(syncOfflineReports());
  } else if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Improved background sync function for inspections with retry
async function syncInspections() {
  try {
    const offlineInspections = await getOfflineInspections();
    
    if (offlineInspections.length === 0) {
      return;
    }
    
    console.log('[Service Worker] Syncing', offlineInspections.length, 'inspection(s)');
    
    const { success: successfulSyncs, failed: failedSyncs } = 
      await syncHelpers.processOfflineData(
        offlineInspections, 
        '/api/inspections',
        removeOfflineInspection
      );
    
    // Notify clients about the sync
    await syncHelpers.notifyClients({
      type: 'SYNC_COMPLETE',
      message: `Synced ${successfulSyncs.length} inspection(s)`,
      details: { successful: successfulSyncs, failed: failedSyncs }
    });
    
    // If any failed, register for retry
    if (failedSyncs.length > 0) {
      await self.registration.sync.register('sync-inspections');
    }
    
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
    // Register for retry
    await self.registration.sync.register('sync-inspections');
  }
}

// Function to sync offline reports
async function syncOfflineReports() {
  console.log('[Service Worker] Syncing offline reports');
  
  try {
    // This will be implemented with IndexedDB when offline report generation is added
    await syncHelpers.notifyClients({
      type: 'REPORT_SYNC_COMPLETE',
      message: 'Offline reports synchronized'
    });
  } catch (error) {
    console.error('[Service Worker] Error syncing reports:', error);
  }
}

// Function to sync generic offline actions
async function syncOfflineActions() {
  console.log('[Service Worker] Syncing offline actions');
  
  try {
    // This will be implemented with IndexedDB for generic offline actions
    await syncHelpers.notifyClients({
      type: 'SYNC_COMPLETE',
      message: 'Offline actions synchronized',
      details: { successful: [], failed: [] }
    });
  } catch (error) {
    console.error('[Service Worker] Error syncing offline actions:', error);
  }
}

// Placeholder functions for IndexedDB operations
async function getOfflineInspections() {
  // In a real implementation, this would get data from IndexedDB
  return [];
}

async function removeOfflineInspection(id) {
  // In a real implementation, this would remove data from IndexedDB
  console.log('[Service Worker] Removed offline inspection:', id);
}

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
      sound: '/notification.mp3',
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

// Handle periodic sync for regular background updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sync') {
    event.waitUntil(dailySync());
  }
});

// Function to handle daily sync tasks
async function dailySync() {
  console.log('[Service Worker] Performing daily sync');
  
  try {
    // Update cached resources
    await cacheHelpers.addResourcesToCache(CACHE_NAME, STATIC_ASSETS);
    
    // Notify clients if needed
    await syncHelpers.notifyClients({
      type: 'DAILY_SYNC_COMPLETE',
      message: 'Background sync completed'
    });
  } catch (error) {
    console.error('[Service Worker] Daily sync error:', error);
  }
}
