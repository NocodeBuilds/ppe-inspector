import React, { memo, Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { ThemeToggler } from '@/components/ThemeToggler';
import { useAuth, useRoleAccess } from '@/hooks/useAuth';
import { ArrowLeft, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundaryWithFallback from '@/components/ErrorBoundaryWithFallback';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

// Memoized header component to prevent unnecessary re-renders
const Header = memo(({ 
  canGoBack, 
  navigate, 
  profile, 
  signOut,
  isAdmin
}: { 
  canGoBack: boolean, 
  navigate: (to: number | string) => void,
  profile: any,
  signOut: () => Promise<void>,
  isAdmin: boolean
}) => {
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Simulate notifications - in a real app, you would fetch these from your backend
  useEffect(() => {
    // Demo notifications count - would come from API in real implementation
    setNotificationCount(2);
  }, []);
  
  return (
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
            {isAdmin && <span className="ml-2 text-xs font-normal bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>}
          </span>
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        <ThemeToggler />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              {notificationCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center bg-destructive text-[10px]"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col">
                <span className="font-medium text-sm">PPE Expiring Soon</span>
                <span className="text-xs text-muted-foreground">Full Body Harness will expire in 7 days</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <div className="flex flex-col">
                <span className="font-medium text-sm">Inspection Due</span>
                <span className="text-xs text-muted-foreground">Safety Helmet #123 needs inspection</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-primary cursor-pointer">
              View All
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});

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
  const { user, profile, isLoading, signOut } = useAuth();
  const { isAdmin } = useRoleAccess();
  
  const hideNavPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const shouldShowNav = !hideNavPaths.includes(location.pathname);
  const canGoBack = !['/', '/login', '/register'].includes(location.pathname);
  
  useEffect(() => {
    if (profile && profile.role) {
      console.log(`User role: ${profile.role}`);
    }
  }, [profile]);
  
  // Handle authentication check
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  // Protected routes require authentication
  if (!user && !hideNavPaths.includes(location.pathname)) {
    // Save the current path to redirect back after login
    sessionStorage.setItem('redirectPath', location.pathname);
    
    // Show notification
    showNotification('Authentication Required', 'warning', {
      description: 'Please sign in to access this page',
    });
    
    return <Navigate to="/login" />;
  }

  return (
    <ErrorBoundaryWithFallback fallback={<LayoutErrorFallback />}>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        {shouldShowNav && (
          <Header 
            canGoBack={canGoBack} 
            navigate={navigate} 
            profile={profile} 
            signOut={signOut}
            isAdmin={isAdmin}
          />
        )}
        
        <main className="flex-1 container mx-auto px-4 py-4 w-full max-w-6xl overflow-y-auto">
          <Suspense fallback={<LoadingSpinner />}>
            <ErrorBoundaryWithFallback>
              <Outlet />
            </ErrorBoundaryWithFallback>
          </Suspense>
        </main>
        
        {shouldShowNav && <BottomNav />}
      </div>
    </ErrorBoundaryWithFallback>
  );
};

export default MainLayout;
