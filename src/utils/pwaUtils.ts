
/**
 * PPE Inspector PWA Utilities
 * Handles PWA setup, registration, updates and features
 */

// Check if the app is in standalone/installed mode
export const isRunningAsStandalone = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as any).standalone === true;
};

// Detect iOS devices
export const isIOS = (): boolean => {
  const iOSPlatforms = [
    'iPad Simulator', 'iPhone Simulator', 'iPod Simulator',
    'iPad', 'iPhone', 'iPod'
  ];
  
  return iOSPlatforms.includes(navigator.platform) || 
         // iPad on iOS 13+ detection
         (navigator.userAgent.includes("Mac") && "ontouchend" in document);
};

/**
 * Sets up PWA-specific meta tags
 */
export const setupPWAMetaTags = (): void => {
  try {
    // Set theme color meta tag
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#111111';
      document.head.appendChild(meta);
    }
    
    // Add apple-touch-icon for iOS
    const appleIcon = document.querySelector('link[rel="apple-touch-icon"]');
    if (!appleIcon) {
      const link = document.createElement('link');
      link.rel = 'apple-touch-icon';
      link.href = '/favicon.ico';
      document.head.appendChild(link);
    }
    
    // Make sure the manifest is linked
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }
    
    // Add apple-mobile-web-app-capable meta tag for iOS full-screen mode
    const appleMobileWebAppCapableMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMobileWebAppCapableMeta) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-capable';
      meta.content = 'yes';
      document.head.appendChild(meta);
    }
    
    // Add apple-mobile-web-app-status-bar-style meta tag for iOS status bar
    const appleMobileWebAppStatusBarStyleMeta = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (!appleMobileWebAppStatusBarStyleMeta) {
      const meta = document.createElement('meta');
      meta.name = 'apple-mobile-web-app-status-bar-style';
      meta.content = 'black-translucent';
      document.head.appendChild(meta);
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
      const registration = await navigator.serviceWorker.register('/service-worker.js');
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
  // Check for updates periodically
  setInterval(() => {
    registration.update().catch(err => {
      console.error('Failed to update service worker:', err);
    });
  }, 60 * 60 * 1000); // Check hourly
  
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
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  return false;
};

/**
 * Register for background sync
 */
export const registerBackgroundSync = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
    console.warn('Background sync not supported');
    return false;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if sync is supported
    if ('sync' in registration) {
      try {
        // @ts-ignore - TypeScript doesn't recognize sync property
        await registration.sync.register('sync-offline-data');
        console.log('Registered for background sync');
        return true;
      } catch (error) {
        console.error('Error registering sync:', error);
        return false;
      }
    } else {
      console.warn('Background sync API not available in this browser');
      return false;
    }
  } catch (error) {
    console.error('Background sync registration failed:', error);
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

const PWA_INIT_TIMEOUT = 5000; // 5 seconds

/**
 * Initialize all PWA features
 */
export const initializePWA = async (): Promise<void> => {
  let timeoutId: number;
  
  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise<void>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        console.warn('PWA initialization timed out, continuing with app startup');
        reject(new Error('PWA initialization timed out'));
      }, PWA_INIT_TIMEOUT);
    });
    
    // Setup meta tags
    setupPWAMetaTags();
    
    // Race between initialization and timeout
    await Promise.race([
      (async () => {
        // Register service worker
        const registration = await registerServiceWorker();
        if (!registration) return;
        
        // Request notification permission
        await requestNotificationPermission();
        
        // Register for background sync but don't wait
        registerBackgroundSync().catch(err => {
          console.warn('Background sync registration failed, continuing:', err);
        });
      })(),
      timeoutPromise
    ]);
  } catch (error) {
    console.error('Error during PWA initialization, continuing with app startup:', error);
  } finally {
    // Clear timeout to prevent memory leaks
    clearTimeout(timeoutId!);
    
    // Log status
    if (isRunningAsStandalone()) {
      console.log('App is running in standalone mode (installed)');
    }
  }
};
