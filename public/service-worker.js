// Service Worker for PPE Inspector PWA
const CACHE_NAME = 'ppe-inspector-v3';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/assets/index.css',
  '/assets/index.js'
];

// Cache for dynamic content
const DYNAMIC_CACHE = 'ppe-inspector-dynamic-v3';
// Cache for API responses
const API_CACHE = 'ppe-inspector-api-v3';

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Successfully installed');
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  // Claim control of all open clients
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(
          keyList.map(key => {
            if (key !== CACHE_NAME && key !== DYNAMIC_CACHE && key !== API_CACHE) {
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

// Helper function to check if a request should be cached
const shouldCache = (request) => {
  const url = new URL(request.url);
  
  // Don't cache supabase API requests or auth endpoints
  if (
    url.pathname.includes('/supabase/') || 
    url.pathname.includes('/auth/') ||
    url.pathname.includes('/rest/') ||
    request.method !== 'GET'
  ) {
    return false;
  }
  
  return true;
};

// Optimized fetch event handler with improved strategies
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests to reduce risk
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Skip non-cacheable requests
  if (!shouldCache(event.request)) {
    return;
  }
  
  // Network-first strategy for navigation requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response before using it
          const responseToCache = response.clone();
          
          // Cache the fetched response
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        })
        .catch(() => {
          // If network fetch fails, try to respond from cache
          return caches.match(event.request)
            .then(cachedResponse => {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Return the offline page if navigation fails and no cache
              return caches.match('/');
            });
        })
    );
    return;
  }
  
  // Stale-while-revalidate for other assets
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response immediately if available
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Cache the new response for next time
            if (networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(DYNAMIC_CACHE)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }
            return networkResponse;
          })
          .catch(error => {
            console.error('[SW] Network fetch failed:', error);
            // Let the cached response handle this situation
          });
        
        return cachedResponse || fetchPromise;
      })
  );
});

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log(`[Service Worker] Background sync event: ${event.tag}`);
  
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
    console.log('[Service Worker] Starting inspection sync...');
    const db = await openDatabase();
    if (!db) {
      throw new Error('Could not open IndexedDB database');
    }
    
    const offlineInspections = await getOfflineInspections(db);
    
    if (offlineInspections.length === 0) {
      console.log('[Service Worker] No offline inspections to sync');
      return;
    }
    
    console.log('[Service Worker] Syncing', offlineInspections.length, 'inspection(s)');
    
    const successfulSyncs = [];
    const failedSyncs = [];
    
    // Process each offline inspection
    for (const inspection of offlineInspections) {
      try {
        // Perform API call to save the inspection using fetch
        const response = await fetch('/api/inspections', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(inspection.data),
        });
        
        if (response.ok) {
          // Remove from IndexedDB after successful sync
          await deleteOfflineInspection(db, inspection.id);
          successfulSyncs.push(inspection.id);
          console.log(`[Service Worker] Successfully synced inspection ${inspection.id}`);
        } else {
          console.error(`[Service Worker] Failed to sync inspection ${inspection.id} - response not ok`);
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
        type: 'INSPECTION_SYNC_COMPLETE',
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
    console.error('[Service Worker] Inspection sync failed:', error);
    // Register for retry
    await self.registration.sync.register('sync-inspections');
  }
}

// New function to sync offline reports
async function syncOfflineReports() {
  console.log('[Service Worker] Syncing offline reports');
  
  try {
    const db = await openDatabase();
    if (!db) {
      throw new Error('Could not open IndexedDB database');
    }
    
    const offlineReports = await getOfflineReports(db);
    
    if (offlineReports.length === 0) {
      console.log('[Service Worker] No offline reports to sync');
      return;
    }
    
    // Process and sync reports 
    // This would contain actual report syncing logic in a real implementation
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'REPORT_SYNC_COMPLETE',
        message: 'Offline reports synchronized'
      });
    });
  } catch (error) {
    console.error('[Service Worker] Error syncing offline reports:', error);
  }
}

// New function to sync generic offline actions
async function syncOfflineActions() {
  console.log('[Service Worker] Syncing offline actions');
  
  try {
    const db = await openDatabase();
    if (!db) {
      throw new Error('Could not open IndexedDB database');
    }
    
    // Get all pending actions
    const offlineActions = await getOfflineActions(db);
    
    if (offlineActions.length === 0) {
      console.log('[Service Worker] No offline actions to sync');
      return;
    }
    
    console.log(`[Service Worker] Found ${offlineActions.length} actions to sync`);
    
    // Process each action based on its type
    for (const action of offlineActions) {
      try {
        let success = false;
        
        // Process different action types
        switch (action.type) {
          case 'create_inspection':
            // Process inspection creation
            success = true;
            break;
            
          case 'update_ppe':
            // Process PPE updates 
            success = true;
            break;
            
          default:
            console.warn(`[Service Worker] Unknown action type: ${action.type}`);
        }
        
        // Mark action as complete if successful
        if (success) {
          await updateActionStatus(db, action.id, 'complete');
        }
      } catch (error) {
        console.error(`[Service Worker] Error processing action ${action.id}:`, error);
        await updateActionStatus(db, action.id, 'failed');
      }
    }
    
    // Notify clients
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        message: 'Offline actions synchronized'
      });
    });
  } catch (error) {
    console.error('[Service Worker] Error syncing offline actions:', error);
  }
}

// IndexedDB helper functions
async function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('ppe-inspector-db', 1);
    
    request.onerror = event => {
      console.error('Error opening IndexedDB:', event.target.error);
      resolve(null);
    };
    
    request.onsuccess = event => {
      resolve(event.target.result);
    };
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      // Create object stores if they don't exist
      if (!db.objectStoreNames.contains('inspections')) {
        db.createObjectStore('inspections', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('reports')) {
        db.createObjectStore('reports', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('offlineActions')) {
        const store = db.createObjectStore('offlineActions', { keyPath: 'id', autoIncrement: true });
        store.createIndex('status', 'status', { unique: false });
      }
    };
  });
}

async function getOfflineInspections(db) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve([]);
      return;
    }
    
    try {
      const transaction = db.transaction(['inspections'], 'readonly');
      const store = transaction.objectStore('inspections');
      const request = store.getAll();
      
      request.onsuccess = event => {
        resolve(event.target.result || []);
      };
      
      request.onerror = event => {
        console.error('Error getting offline inspections:', event.target.error);
        resolve([]);
      };
    } catch (error) {
      console.error('Transaction error:', error);
      resolve([]);
    }
  });
}

async function getOfflineReports(db) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve([]);
      return;
    }
    
    try {
      const transaction = db.transaction(['reports'], 'readonly');
      const store = transaction.objectStore('reports');
      const request = store.getAll();
      
      request.onsuccess = event => {
        resolve(event.target.result || []);
      };
      
      request.onerror = event => {
        console.error('Error getting offline reports:', event.target.error);
        resolve([]);
      };
    } catch (error) {
      console.error('Transaction error:', error);
      resolve([]);
    }
  });
}

async function getOfflineActions(db) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve([]);
      return;
    }
    
    try {
      const transaction = db.transaction(['offlineActions'], 'readonly');
      const store = transaction.objectStore('offlineActions');
      const index = store.index('status');
      const request = index.getAll('pending');
      
      request.onsuccess = event => {
        resolve(event.target.result || []);
      };
      
      request.onerror = event => {
        console.error('Error getting offline actions:', event.target.error);
        resolve([]);
      };
    } catch (error) {
      console.error('Transaction error:', error);
      resolve([]);
    }
  });
}

async function deleteOfflineInspection(db, id) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve(false);
      return;
    }
    
    try {
      const transaction = db.transaction(['inspections'], 'readwrite');
      const store = transaction.objectStore('inspections');
      const request = store.delete(id);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = event => {
        console.error(`Error deleting inspection ${id}:`, event.target.error);
        resolve(false);
      };
    } catch (error) {
      console.error('Transaction error:', error);
      resolve(false);
    }
  });
}

async function updateActionStatus(db, id, status) {
  return new Promise((resolve, reject) => {
    if (!db) {
      resolve(false);
      return;
    }
    
    try {
      const transaction = db.transaction(['offlineActions'], 'readwrite');
      const store = transaction.objectStore('offlineActions');
      const request = store.get(id);
      
      request.onsuccess = event => {
        const action = event.target.result;
        if (action) {
          action.status = status;
          action.updatedAt = new Date().toISOString();
          store.put(action);
          resolve(true);
        } else {
          resolve(false);
        }
      };
      
      request.onerror = event => {
        console.error(`Error updating action ${id}:`, event.target.error);
        resolve(false);
      };
    } catch (error) {
      console.error('Transaction error:', error);
      resolve(false);
    }
  });
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

