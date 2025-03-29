
// Service Worker for PPE Inspector PWA
const CACHE_NAME = 'ppe-inspector-v4';
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
  },
  
  // Store notification for later delivery
  storeNotificationForSync: async (notification) => {
    try {
      // Open the 'notifications-sync' object store to store pending notifications
      const db = await openNotificationDatabase();
      const tx = db.transaction('notifications-sync', 'readwrite');
      const store = tx.objectStore('notifications-sync');
      
      // Add the notification with timestamp
      await store.add({
        ...notification,
        timestamp: Date.now()
      });
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('[Service Worker] Failed to store notification:', error);
      return false;
    }
  },
  
  // Get pending notifications
  getPendingNotifications: async () => {
    try {
      const db = await openNotificationDatabase();
      const tx = db.transaction('notifications-sync', 'readonly');
      const store = tx.objectStore('notifications-sync');
      
      return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.error('[Service Worker] Failed to get pending notifications:', error);
      return [];
    }
  },
  
  // Clear delivered notifications from storage
  clearDeliveredNotifications: async (ids) => {
    if (!ids || !ids.length) return;
    
    try {
      const db = await openNotificationDatabase();
      const tx = db.transaction('notifications-sync', 'readwrite');
      const store = tx.objectStore('notifications-sync');
      
      for (const id of ids) {
        store.delete(id);
      }
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (error) {
      console.error('[Service Worker] Failed to clear delivered notifications:', error);
    }
  }
};

// IndexedDB for storing notifications that need to be synced
let notificationDb = null;

function openNotificationDatabase() {
  if (notificationDb) return Promise.resolve(notificationDb);
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('notifications-db', 1);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('notifications-sync')) {
        db.createObjectStore('notifications-sync', { keyPath: 'id', autoIncrement: true });
      }
    };
    
    request.onsuccess = (event) => {
      notificationDb = event.target.result;
      resolve(notificationDb);
    };
    
    request.onerror = (event) => {
      console.error('[Service Worker] IndexedDB error:', event.target.error);
      reject(event.target.error);
    };
  });
}

// Simplified install event - only cache critical assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    Promise.resolve()
      .then(async () => {
        // Initialize notification database
        await openNotificationDatabase();
        
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

// Enhanced Push notification event with sound and vibration
self.addEventListener('push', (event) => {
  try {
    let payload = { title: 'New Notification', body: 'Something new happened', url: '/', type: 'info' };
    
    // Try to parse the payload
    if (event.data) {
      try {
        payload = event.data.json();
      } catch (e) {
        payload.body = event.data.text();
      }
    }
    
    // Configure notification appearance based on type
    let icon = '/favicon.ico';
    let badge = '/favicon.ico';
    let tag = payload.tag || 'default';
    let requireInteraction = payload.type === 'error' || payload.important;
    
    const options = {
      body: payload.body,
      icon: icon,
      badge: badge,
      tag: tag,
      vibrate: [100, 50, 100],
      requireInteraction: requireInteraction,
      renotify: payload.type === 'error',
      data: {
        url: payload.url || '/',
        type: payload.type || 'info',
        timestamp: Date.now()
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

// Handle background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(
      syncHelpers.getPendingNotifications()
        .then(async (notifications) => {
          if (notifications.length === 0) return;
          
          console.log('[Service Worker] Syncing pending notifications:', notifications.length);
          
          const deliveredIds = [];
          
          for (const notification of notifications) {
            // Show the notification
            await self.registration.showNotification(notification.title, {
              body: notification.body,
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: notification.tag || 'synced',
              vibrate: [100, 50, 100],
              data: {
                url: notification.url || '/',
                type: notification.type || 'info',
                synced: true,
                timestamp: Date.now()
              }
            });
            
            deliveredIds.push(notification.id);
          }
          
          // Clear delivered notifications
          return syncHelpers.clearDeliveredNotifications(deliveredIds);
        })
        .catch(error => {
          console.error('[Service Worker] Failed to process sync:', error);
        })
    );
  }
});

// Enhanced notification click event handler
self.addEventListener('notificationclick', (event) => {
  const notification = event.notification;
  const action = event.action;
  const notificationData = notification.data || {};
  
  notification.close();
  
  let targetUrl = notificationData.url || '/';
  
  // Handle specific actions
  if (action === 'view') {
    // Already have targetUrl set
  } else if (action === 'dismiss') {
    // Just close the notification, no further action
    return;
  }
  
  // Custom handling for different notification types
  if (notificationData.type === 'error') {
    targetUrl = targetUrl || '/flagged';
  } else if (notificationData.type === 'warning') {
    targetUrl = targetUrl || '/upcoming';
  }
  
  // Open/focus the appropriate window
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientsList => {
      // If a tab is already open with the target URL, focus it
      for (const client of clientsList) {
        const url = new URL(client.url);
        const targetPath = new URL(targetUrl, self.location.origin).pathname;
        
        if (url.pathname === targetPath && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no matching tab is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Listen for message events to manually trigger sync
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_NOTIFICATIONS') {
    event.waitUntil(
      self.registration.sync.register('sync-notifications')
        .then(() => {
          console.log('[Service Worker] Registered notification sync');
        })
        .catch(error => {
          console.error('[Service Worker] Failed to register sync:', error);
        })
    );
  }
});
