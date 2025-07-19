import { Suspense } from 'react';
import { Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/use-auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ui/theme-provider';
import NetworkStatus from '@/components/ui/network-status';
import { PageLoader } from '@/components/ui/page-loader';
import { Toaster as ShadcnToaster } from '@/components/ui/toaster';

/**
 * RootLayout component serves as the application's outermost layout container.
 * This wraps all content and provides common UI elements like toasts, 
 * network status indicator, and loading states.
 * 
 * IMPORTANT: This also provides AuthProvider context to all routes while preserving
 * access to router context from TanStack Router.
 */
const RootLayout = () => {
  // Create React Query client instance per route to avoid sharing issues
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 10, // 10 minutes
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="ppe-inspector-theme">
          <div className="min-h-screen bg-background font-sans antialiased">
            {/* Display network status indicator */}
            <NetworkStatus />
            
            {/* Main content area with Suspense for lazy loading */}
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
            
            {/* Global notification systems */}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 5000,
                className: 'toast-styles',
              }}
            />
            <ShadcnToaster />
          </div>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
