// Service Worker for PPE Inspector PWA
const CACHE_NAME = 'ppe-inspector-v1';

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

// Cache for dynamic content
const DYNAMIC_CACHE = 'ppe-inspector-dynamic-v1';

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
            if (key !== CACHE_NAME && key !== DYNAMIC_CACHE) {
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

// Fetch event - serve from cache or network with improved strategy
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
  
  // Handle page navigation - Use Cache-First for HTML requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          if (cachedResponse) {
            // Return cached response and update cache in background
            fetch(event.request)
              .then(response => {
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, response);
                  });
              })
              .catch(() => console.log('[SW] Failed to update navigation cache'));
            
            return cachedResponse;
          }
          
          // If not in cache, fetch from network
          return fetch(event.request)
            .then(response => {
              // Clone the response
              const clonedResponse = response.clone();
              
              // Cache the fetched response
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, clonedResponse);
                });
              
              return response;
            })
            .catch(error => {
              console.log('[SW] Navigation fetch failed:', error);
              // Return offline page if available
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // Handle assets and other requests - Use Network First with Cache Fallback
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Cache dynamic content
        if (response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => {
              cache.put(event.request, clonedResponse);
            });
        }
        return response;
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
    
    const successfulSyncs = [];
    const failedSyncs = [];
    
    // Process each offline inspection
    for (const inspection of offlineInspections) {
      try {
        // Perform API call to save the inspection
        const response = await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inspection),
        });
        
        if (response.ok) {
          // Remove from IndexedDB after successful sync
          await removeOfflineInspection(inspection.id);
          successfulSyncs.push(inspection.id);
        } else {
          failedSyncs.push(inspection.id);
        }
      } catch (error) {
        console.error('[Service Worker] Sync error for inspection', inspection.id, error);
        failedSyncs.push(inspection.id);
      }
    }
    
    // Notify clients about the sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: `Synced ${successfulSyncs.length} inspection(s)`,
        details: {
          successful: successfulSyncs,
          failed: failedSyncs
        }
      });
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

// New function to sync offline reports
async function syncOfflineReports() {
  // This would be implemented when offline report generation is added
  console.log('[Service Worker] Syncing offline reports');
  
  // In a real implementation, this would get and process offline reports
  // For now just notify clients
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'REPORT_SYNC_COMPLETE',
      message: 'Offline reports synchronized'
    });
  });
}

// Placeholder functions for IndexedDB operations - these would be implemented in real code
async function getOfflineInspections() {
  // In a real implementation, this would get data from IndexedDB
  return [];
}

async function removeOfflineInspection(id) {
  // In a real implementation, this would remove data from IndexedDB
  console.log('[Service Worker] Removed offline inspection:', id);
}

// Enhanced push notification event with sound and vibration
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
      sound: '/notification.mp3', // Add sound (if supported)
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

// Enhanced notification click event with action handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Handle notification action clicks
  if (event.action === 'view') {
    // Special handling for "view" action
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
  // If no action or "dismiss", just close the notification (already done)
});

// Handle periodic sync for regular background updates (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'daily-sync') {
    event.waitUntil(dailySync());
  }
});

// Function to handle daily sync tasks
async function dailySync() {
  console.log('[Service Worker] Performing daily sync');
  // This would update caches, sync data, etc.
  
  try {
    // Update cached resources
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(STATIC_ASSETS);
    
    // Notify clients if needed
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'DAILY_SYNC_COMPLETE',
        message: 'Background sync completed'
      });
    });
  } catch (error) {
    console.error('[Service Worker] Daily sync error:', error);
  }
}
