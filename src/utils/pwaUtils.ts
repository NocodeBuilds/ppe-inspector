
/**
 * PPE Inspector PWA Utilities
 * Handles PWA setup, registration, updates and features
 */

// Extend ServiceWorkerRegistration type to include sync property
interface SyncManager {
  register(tag: string): Promise<void>;
  getTags(): Promise<string[]>;
}

interface ExtendedServiceWorkerRegistration extends ServiceWorkerRegistration {
  sync?: SyncManager;
  periodicSync?: {
    register: (options: { tag: string; minInterval: number }) => Promise<void>;
    unregister: (tag: string) => Promise<void>;
    permissionState: () => Promise<string>;
  };
}

// Check if the app is in standalone/installed mode
export const isRunningAsStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Detect iOS devices
export const isIOS = (): boolean => {
  return [
    'iPad Simulator',
    'iPhone Simulator',
    'iPod Simulator',
    'iPad',
    'iPhone',
    'iPod'
  ].includes(navigator.platform) || 
  // iPad on iOS 13+ detection
  (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

/**
 * Sets up PWA-specific meta tags
 */
export const setupPWAMetaTags = (): void => {
  try {
    // Meta tags are now set in index.html directly, so we'll just make sure they exist
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#111111';
      document.head.appendChild(meta);
    }
    
    // Check if manifest link exists
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }
  } catch (error) {
    console.error('Error setting up PWA meta tags:', error);
  }
};

/**
 * Registers the service worker for offline capabilities
 * Returns a promise that resolves with the service worker registration
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        updateViaCache: 'none' // Don't use cache for service worker updates
      });
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Set up service worker update handling
      setupServiceWorkerUpdates(registration);
      
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return null;
    }
  }
  console.warn('Service workers are not supported in this browser');
  return null;
};

/**
 * Sets up handling for service worker updates
 */
const setupServiceWorkerUpdates = (registration: ServiceWorkerRegistration): void => {
  // Check for updates every 15 minutes
  setInterval(() => {
    registration.update().catch(err => {
      console.error('Error updating service worker:', err);
    });
  }, 15 * 60 * 1000); 
  
  // Listen for new service workers
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (!newWorker) return;
    
    console.log('New service worker installing...');
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('New service worker installed and waiting to activate');
        // Notify user of update
        notifyUpdate();
      }
    });
  });
};

/**
 * Notify user of service worker update and prompt for refresh
 */
const notifyUpdate = (): void => {
  // This would use your app's notification system
  console.log('App update available');
  
  // Example implementation with dialog
  if (confirm('New version available! Reload to update?')) {
    window.location.reload();
  }
};

/**
 * Request permission for push notifications
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  return false;
};

/**
 * Register device for push notifications
 */
export const registerForPushNotifications = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notifications not supported');
    return false;
  }
  
  try {
    const permission = await requestNotificationPermission();
    if (!permission) return false;
    
    const registration = await navigator.serviceWorker.ready;
    
    // Here you would get push subscription from server and subscribe
    // Implementation left as is
    
    return true;
  } catch (error) {
    console.error('Failed to register for push notifications:', error);
    return false;
  }
};

/**
 * Register for background sync
 */
export const registerBackgroundSync = async (syncTag: string = 'sync-inspections'): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.warn('Background sync not supported');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready as ExtendedServiceWorkerRegistration;
    
    // Check if sync is supported
    if (registration.sync) {
      await registration.sync.register(syncTag);
      console.log(`Registered for background sync: ${syncTag}`);
      return true;
    } else {
      console.warn('Background sync API exists but is not available on registration');
      return false;
    }
  } catch (error) {
    console.error('Background sync registration failed:', error);
    return false;
  }
};

/**
 * Setup periodic background sync (if supported)
 */
export const setupPeriodicSync = async (
  tag: string = 'daily-sync',
  minInterval: number = 24 * 60 * 60 * 1000 // 24 hours
): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready as ExtendedServiceWorkerRegistration;
    
    // Check if periodicSync exists
    if (!registration.periodicSync) {
      console.warn('Periodic background sync not supported');
      return false;
    }
    
    // Check permission
    const permission = await registration.periodicSync.permissionState();
    if (permission !== 'granted') {
      console.warn('Periodic sync permission not granted');
      return false;
    }
    
    // Register periodic sync
    await registration.periodicSync.register({
      tag,
      minInterval
    });
    
    console.log(`Registered for periodic sync: ${tag}`);
    return true;
  } catch (error) {
    console.error('Periodic sync registration failed:', error);
    return false;
  }
};

/**
 * Listen for service worker messages
 */
export const listenForServiceWorkerMessages = (
  callback: (event: MessageEvent) => void
): () => void => {
  const listener = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    callback(event);
  };
  
  navigator.serviceWorker.addEventListener('message', listener);
  
  // Return function to unregister listener
  return () => {
    navigator.serviceWorker.removeEventListener('message', listener);
  };
};

/**
 * Initialize all PWA features
 * Returns a Promise that resolves to a boolean indicating success
 */
export const initializePWA = async (): Promise<boolean> => {
  try {
    // Only do the minimal setup needed to start
    console.log('Setting up PWA metadata...');
    setupPWAMetaTags();
    
    // Register service worker in background
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn('Service worker registration failed, but continuing app initialization');
      return false;
    }
    
    // Try other PWA features later to avoid blocking app startup
    setTimeout(async () => {
      try {
        await requestNotificationPermission();
        await registerBackgroundSync('sync-inspections');
        await registerBackgroundSync('sync-offline-actions');
        await setupPeriodicSync();
      } catch (error) {
        console.error('Error setting up additional PWA features:', error);
      }
    }, 2000);
    
    return true;
  } catch (error) {
    console.error('Error initializing PWA:', error);
    return false;
  }
};
