
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import BottomNav from './BottomNav';
import { ThemeToggler } from '@/components/ThemeToggler';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo, Suspense } from 'react';
import ErrorBoundaryWithFallback from '@/components/ErrorBoundaryWithFallback';

// Memoized header component to prevent unnecessary re-renders
const Header = memo(({ canGoBack, navigate }: { canGoBack: boolean, navigate: (to: number) => void }) => (
  <header className="sticky top-0 z-50 flex justify-between items-center px-4 py-2 border-b bg-background/80 backdrop-blur-sm">
    <div className="flex items-center">
      {canGoBack && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
      )}
      <h1 className="text-xl font-bold">
        <span>
          <span className="text-primary">PPE</span> Inspector
        </span>
      </h1>
    </div>
    <ThemeToggler />
  </header>
));

Header.displayName = 'Header';

// Loading spinner component
const LoadingSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Component-specific error fallback
const LayoutErrorFallback = () => (
  <div className="flex flex-col items-center justify-center p-8 h-screen">
    <div className="max-w-md text-center">
      <h2 className="text-2xl font-bold mb-4">Layout Error</h2>
      <p className="mb-6">We're having trouble loading the application layout. Please try again or return to login.</p>
      <Button asChild>
        <a href="/login">Go to Login</a>
      </Button>
    </div>
  </div>
);

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const hideNavPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const shouldShowNav = !hideNavPaths.includes(location.pathname);
  const canGoBack = !['/', '/login', '/register'].includes(location.pathname);
  
  // Handle authentication check
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Protected routes require authentication
  if (!user && !hideNavPaths.includes(location.pathname)) {
    // Save the current path to redirect back after login
    sessionStorage.setItem('redirectPath', location.pathname);
    return <Navigate to="/login" />;
  }

  return (
    <ErrorBoundaryWithFallback fallback={<LayoutErrorFallback />}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {shouldShowNav && <Header canGoBack={canGoBack} navigate={navigate} />}
        
        <main className="flex-1 container mx-auto px-4 py-4 w-full max-w-6xl overflow-y-auto">
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundaryWithFallback>
              <Outlet />
            </ErrorBoundaryWithFallback>
          </Suspense>
        </main>
        
        {shouldShowNav && <BottomNav />}
        
        <Toaster />
      </div>
    </ErrorBoundaryWithFallback>
  );
};

export default MainLayout;
