
/**
 * PPE Inspector PWA Utilities
 * Handles PWA setup, registration, updates and features
 * with robust error handling and performance optimizations
 */

// Configuration
const PWA_CONFIG = {
  SW_PATH: '/service-worker.js',
  SW_SCOPE: '/',
  UPDATE_CHECK_INTERVAL: 60 * 60 * 1000, // Check for updates every hour
  INSTALLATION_PROMPT_DELAY: 3000, // Delay before showing installation prompt (ms)
  INIT_TIMEOUT: 2000, // Max time for PWA initialization (ms)
};

// Types
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// Store the installation event for later use
let deferredPrompt: BeforeInstallPromptEvent | null = null;

// PWA version control
const currentVersion = 'v5'; // Should match service worker version

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

// Set up PWA meta tags with better compatibility
export const setupPWAMetaTags = (): void => {
  try {
    const metaTags = [
      { name: 'theme-color', content: '#2563eb' }, // Match theme color in manifest
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'application-name', content: 'PPE Inspector Pro' },
      { name: 'apple-mobile-web-app-title', content: 'PPE Inspector' },
      { name: 'msapplication-TileColor', content: '#2563eb' },
      { name: 'msapplication-starturl', content: '/' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, user-scalable=no' }
    ];
    
    const linkTags = [
      { rel: 'apple-touch-icon', href: '/lovable-uploads/logo.png' },
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
    
    // Add iOS splash screens
    if (isIOS()) {
      addIOSSplashScreens();
    }
  } catch (error) {
    console.error('Error setting up PWA meta tags:', error);
  }
};

/**
 * Add iOS splash screens for better iOS PWA experience
 */
const addIOSSplashScreens = (): void => {
  const splashScreens = [
    { href: '/lovable-uploads/logo.png', media: '(device-width: 375px) and (device-height: 812px)' }, // iPhone X/XS/11 Pro
    { href: '/lovable-uploads/logo.png', media: '(device-width: 414px) and (device-height: 896px)' }, // iPhone XR/XS Max/11/11 Pro Max
  ];
  
  splashScreens.forEach(screen => {
    const link = document.createElement('link');
    link.rel = 'apple-touch-startup-image';
    link.href = screen.href;
    if (screen.media) link.media = screen.media;
    document.head.appendChild(link);
  });
};

/**
 * Registers the service worker for offline capabilities
 * with better error handling and update detection
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if ('serviceWorker' in navigator) {
    try {
      console.log('Registering service worker...');
      
      // Check if service worker is already registered to avoid conflicts
      const existingRegistration = await navigator.serviceWorker.getRegistration();
      if (existingRegistration) {
        console.log('Service worker already registered, using existing one');
        
        // Setup service worker update handling
        setupServiceWorkerUpdates(existingRegistration);
        
        return existingRegistration;
      }
      
      const registration = await navigator.serviceWorker.register(PWA_CONFIG.SW_PATH, {
        scope: PWA_CONFIG.SW_SCOPE
      });
      
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Setup service worker update handling
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
 * Sets up handling for service worker updates with improved user experience
 */
const setupServiceWorkerUpdates = (registration: ServiceWorkerRegistration): void => {
  // Check for updates periodically
  setInterval(() => {
    registration.update().catch(err => {
      console.error('Failed to update service worker:', err);
    });
  }, PWA_CONFIG.UPDATE_CHECK_INTERVAL);
  
  // Listen for new service workers
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    if (!newWorker) return;
    
    console.log('New service worker installing...');
    
    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        console.log('New service worker installed and waiting to activate');
        notifyAppUpdate();
      }
    });
  });
  
  // Listen for controller change (indicates an update has been applied)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    console.log('Service worker controller changed - new version activated');
  });
  
  // Setup communication with the service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'VERSION') {
      console.log(`Service worker version: ${event.data.version}`);
      
      // Check if we need to update
      if (event.data.version !== currentVersion) {
        console.log('Service worker version mismatch, update available');
        notifyAppUpdate();
      }
    }
    
    // Handle sync updates
    if (event.data && event.data.type === 'SYNC_COMPLETED') {
      console.log(`Sync completed. Success: ${event.data.successCount}, Failures: ${event.data.failureCount}`);
      dispatchEvent(new CustomEvent('pwa:sync-completed', { 
        detail: event.data 
      }));
    }
  });
};

/**
 * Notify user of service worker update and prompt for refresh
 * with a better UX approach
 */
const notifyAppUpdate = (): void => {
  console.log('App update available');
  
  // Dispatch event for the app to show a toast or notification
  dispatchEvent(new CustomEvent('pwa:update-available'));
  
  // You could also create a UI element to notify the user
  // This is just a simple confirm, but in a real app you'd use your UI library
  if (confirm('New version available! Reload to update?')) {
    window.location.reload();
  }
};

/**
 * Force update the service worker
 */
export const forceUpdateServiceWorker = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return false;
    
    // Send a message to the service worker to skip waiting
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error forcing service worker update:', error);
    return false;
  }
};

/**
 * Clear all service worker caches - useful for troubleshooting
 */
export const clearServiceWorkerCaches = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration || !registration.active) return false;
    
    // Create a message channel to get a response
    const messageChannel = new MessageChannel();
    
    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.type === 'CACHES_CLEARED') {
          console.log('Service worker caches cleared');
          resolve(true);
        } else {
          resolve(false);
        }
      };
      
      registration.active.postMessage(
        { type: 'CLEAR_CACHES' },
        [messageChannel.port2]
      );
    });
  } catch (error) {
    console.error('Error clearing service worker caches:', error);
    return false;
  }
};

/**
 * Listen for beforeinstallprompt event to prompt user to install the app
 * Must be called early in the app lifecycle
 */
export const setupInstallPrompt = (): void => {
  // Listen for the beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 76+ from automatically showing the prompt
    e.preventDefault();
    
    // Stash the event so it can be triggered later
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    // Show the install button if it exists
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'block';
    }
    
    // Optionally show a custom install promotion after a delay
    setTimeout(() => {
      if (!isRunningAsStandalone() && !localStorage.getItem('installPromptDismissed')) {
        showInstallPromotion();
      }
    }, PWA_CONFIG.INSTALLATION_PROMPT_DELAY);
    
    console.log('App can be installed, saved event for later');
  });
  
  // Handle app installation success
  window.addEventListener('appinstalled', () => {
    // Clear the deferredPrompt as it's no longer needed
    deferredPrompt = null;
    
    // Hide the install button if it exists
    const installButton = document.getElementById('install-button');
    if (installButton) {
      installButton.style.display = 'none';
    }
    
    // Log or track the app installation
    console.log('App was installed successfully');
    
    // Dispatch custom event that can be listened for in the app
    dispatchEvent(new CustomEvent('pwa:installed'));
  });
};

/**
 * Show a custom installation promotion
 * Implement as needed in your app's UI
 */
const showInstallPromotion = (): void => {
  // Dispatch custom event that can be listened for in the app
  dispatchEvent(new CustomEvent('pwa:can-install'));
  
  // You'd implement this with your UI framework
  console.log('Should show install promotion');
};

/**
 * Prompt the user to install the app
 * Must be called in response to a user gesture
 */
export const promptInstall = async (): Promise<'accepted' | 'dismissed' | 'not_available'> => {
  if (!deferredPrompt) {
    return 'not_available';
  }
  
  try {
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice;
    
    // Reset the deferred prompt variable
    deferredPrompt = null;
    
    // Return the outcome
    return choiceResult.outcome;
  } catch (error) {
    console.error('Error prompting for installation:', error);
    return 'dismissed';
  }
};

/**
 * Dismiss the installation prompt and don't show again
 */
export const dismissInstallPromotion = (): void => {
  localStorage.setItem('installPromptDismissed', 'true');
};

/**
 * Initialize all PWA features with better error handling and timeouts
 */
export const initializePWA = async (): Promise<void> => {
  let timeoutId: number;
  
  return new Promise((resolve) => {
    try {
      // Create a promise that resolves after timeout
      timeoutId = window.setTimeout(() => {
        console.warn('PWA initialization timed out, continuing with app startup');
        resolve(); // Resolve instead of reject to prevent app from breaking
      }, PWA_CONFIG.INIT_TIMEOUT);
      
      // Setup meta tags
      setupPWAMetaTags();
      
      // Setup installation prompt handling
      setupInstallPrompt();
      
      // Register service worker with proper error handling
      registerServiceWorker()
        .then(() => {
          clearTimeout(timeoutId);
          resolve();
        })
        .catch(error => {
          console.error('Error during service worker registration:', error);
          clearTimeout(timeoutId);
          resolve(); // Still resolve to not break the app
        });
    } catch (error) {
      console.error('Error during PWA initialization:', error);
      clearTimeout(timeoutId!);
      resolve(); // Still resolve to not break the app
    }
  });
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

/**
 * Check if a new service worker update is available
 */
export const checkForServiceWorkerUpdates = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator)) return false;
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      return !!registration.installing || !!registration.waiting;
    }
    return false;
  } catch (error) {
    console.error('Error checking for service worker updates:', error);
    return false;
  }
};
