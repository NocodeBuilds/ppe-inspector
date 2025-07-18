import { Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import NetworkStatus from '@/components/ui/network-status';
import { PageLoader } from '@/components/ui/page-loader';

/**
 * RootLayout component serves as the application's outermost layout container.
 * This wraps all content and provides common UI elements like toasts, 
 * network status indicator, and loading states.
 */
const RootLayout = () => {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      {/* Display network status indicator */}
      <NetworkStatus />
      
      {/* Main content area with Suspense for lazy loading */}
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
      
      {/* Global notification system */}
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 5000,
          className: 'toast-styles',
        }}
      />
    </div>
  );
};

export default RootLayout;
