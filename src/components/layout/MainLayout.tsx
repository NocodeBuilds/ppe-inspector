
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { ThemeToggler } from '@/components/ThemeToggler';
import { useAuth, useRoleAccess } from '@/hooks/useAuth';
import { ArrowLeft, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { memo, Suspense, useEffect } from 'react';
import ErrorBoundaryWithFallback from '@/components/ErrorBoundaryWithFallback';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';

// Memoized header component to prevent unnecessary re-renders
const Header = memo(({ 
  canGoBack, 
  navigate, 
  profile, 
  signOut,
  isAdmin,
  isInspector 
}: { 
  canGoBack: boolean, 
  navigate: (to: number | string) => void,
  profile: any,
  signOut: () => Promise<void>,
  isAdmin: boolean,
  isInspector: boolean
}) => (
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
          {isInspector && !isAdmin && <span className="ml-2 text-xs font-normal bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-full">Inspector</span>}
        </span>
      </h1>
    </div>
    
    <div className="flex items-center gap-2">
      <ThemeToggler />
      
      {profile && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                {profile.avatar_url ? (
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'User'} />
                ) : (
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {profile.full_name || 'User'}
              <div className="text-xs text-muted-foreground font-normal">
                {profile.role ? profile.role.charAt(0).toUpperCase() + profile.role.slice(1) : 'User'}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={signOut}
              className="text-destructive focus:text-destructive"
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
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
  const { user, profile, isLoading, signOut } = useAuth();
  const { isAdmin, isInspector } = useRoleAccess();
  const { showNotification } = useNotifications();
  
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
            isInspector={isInspector}
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
