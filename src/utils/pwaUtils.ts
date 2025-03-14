
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
  periodicSync?: any; // We'll also extend this for the periodicSync manager
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
    
    // Add meta description
    const descriptionMeta = document.querySelector('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.setAttribute('content', 'PPE Inspector Pro - Track and manage PPE inventory and inspections');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'PPE Inspector Pro - Track and manage PPE inventory and inspections';
      document.head.appendChild(meta);
    }
    
    // Add Web App Manifest for better PWA support
    const manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }
    
    // Add viewport meta tag for mobile responsiveness if not present
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
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
    registration.update();
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
    // const subscription = await registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: urlBase64ToUint8Array('YOUR_PUBLIC_VAPID_KEY')
    // });
    
    // Send subscription to server
    // await sendSubscriptionToServer(subscription);
    
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
 */
export const initializePWA = async (): Promise<void> => {
  // Setup meta tags
  setupPWAMetaTags();
  
  // Register service worker
  const registration = await registerServiceWorker();
  if (!registration) return;
  
  // Request notification permission
  await requestNotificationPermission();
  
  // Register for background sync
  await registerBackgroundSync();
  
  // Try to setup periodic sync
  await setupPeriodicSync();
  
  // Check if running as standalone
  if (isRunningAsStandalone()) {
    console.log('App is running in standalone mode (installed)');
  }
};
