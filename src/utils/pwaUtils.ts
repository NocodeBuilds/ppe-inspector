
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

// Set up PWA meta tags
export const setupPWAMetaTags = (): void => {
  try {
    const metaTags = [
      { name: 'theme-color', content: '#111111' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' }
    ];
    
    const linkTags = [
      { rel: 'apple-touch-icon', href: '/favicon.ico' },
      { rel: 'manifest', href: '/manifest.json' }
    ];
    
    // Add meta tags if they don't exist
    metaTags.forEach(tag => {
      if (!document.querySelector(`meta[name="${tag.name}"]`)) {
        const meta = document.createElement('meta');
        meta.name = tag.name;
        meta.content = tag.content;
        document.head.appendChild(meta);
      }
    });
    
    // Add link tags if they don't exist
    linkTags.forEach(tag => {
      if (!document.querySelector(`link[rel="${tag.rel}"]`)) {
        const link = document.createElement('link');
        link.rel = tag.rel;
        link.href = tag.href;
        document.head.appendChild(link);
      }
    });
  } catch (error) {
    console.error('Error setting up PWA meta tags:', error);
  }
};

/**
 * Registers the service worker for offline capabilities
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
  // Check for updates every hour
  const UPDATE_INTERVAL = 60 * 60 * 1000;
  
  // Check for updates periodically
  setInterval(() => {
    registration.update().catch(err => {
      console.error('Failed to update service worker:', err);
    });
  }, UPDATE_INTERVAL);
  
  // Listen for new service workers
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (!newWorker) return;
    
    console.log('New service worker installing...');
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('New service worker installed and waiting to activate');
        notifyUpdate();
      }
    });
  });
  
  // Listen for controller change (indicates an update has been applied)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service worker controller changed - new version activated');
  });
};

/**
 * Notify user of service worker update and prompt for refresh
 */
const notifyUpdate = (): void => {
  console.log('App update available');
  
  if (confirm('New version available! Reload to update?')) {
    window.location.reload();
  }
};

/**
 * Initialize all PWA features
 */
export const initializePWA = async (): Promise<void> => {
  const PWA_INIT_TIMEOUT = 3000; // 3 seconds
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
      registerServiceWorker(),
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

/**
 * Request permission for push notifications
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

/**
 * Subscribe to push notifications
 */
export const subscribeToPushNotifications = async (): Promise<PushSubscription | null> => {
  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    
    // Check for existing subscription
    const existingSubscription = await serviceWorkerRegistration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }
    
    // Create new subscription
    // In a real app, you would get this from your server
    const serverPublicKey = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
    
    const convertedKey = urlBase64ToUint8Array(serverPublicKey);
    
    const subscription = await serviceWorkerRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedKey
    });
    
    console.log('Subscribed to push notifications:', subscription);
    
    // In a real app, you would send this subscription to your server
    return subscription;
  } catch (error) {
    console.error('Failed to subscribe to push notifications:', error);
    return null;
  }
};

/**
 * Helper function to convert base64 to Uint8Array for push notification
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}
