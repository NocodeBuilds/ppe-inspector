
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
      return registration;
    } catch (error) {
      console.error('ServiceWorker registration failed: ', error);
      return null;
    }
  }
  console.warn('Service workers are not supported in this browser');
  return null;
};
