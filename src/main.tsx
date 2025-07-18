import React from 'react';
import ReactDOM from 'react-dom/client';
<<<<<<< Updated upstream
import App from './App';
import './index.css';

// Initialize the app
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
=======
import { createRouter, RouterProvider, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ErrorBoundary } from 'react-error-boundary';
import { routeTree } from './routeTree';
import './index.css';

// Define fallback error component
const ErrorFallback = ({ error }: { error: Error }) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold">Something went wrong</h2>
        <div className="mb-4 rounded bg-muted p-4 text-left">
          <p className="font-mono text-sm">{error.message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
};

// Create React Query client with improved settings
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

// Create router instance
const router = createRouter({ routeTree });

// Register router with React Query for better data fetching
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// For TanStack Router, the RouterProvider must be the only top-level component
ReactDOM.createRoot(document.getElementById('root')!).render(
  <RouterProvider router={router} />
>>>>>>> Stashed changes
);
