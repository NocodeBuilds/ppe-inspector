
import React, { memo, Suspense, useEffect, useState, createContext, useContext } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { ThemeToggler } from '@/components/ThemeToggler';
import { useAuth, useRoleAccess } from '@/hooks/useAuth';
import { Bell, ArrowLeft } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '../common/LoadingSpinner';

// Create context for back navigation
export const BackNavigationContext = createContext<{
  showBackButton: boolean;
  setShowBackButton: React.Dispatch<React.SetStateAction<boolean>>;
  backTo: string | number;
  setBackTo: React.Dispatch<React.SetStateAction<string | number>>;
  handleBack: () => void;
}>({
  showBackButton: false,
  setShowBackButton: () => {},
  backTo: -1,
  setBackTo: () => {},
  handleBack: () => {},
});

// Custom hook to use back navigation
export const useBackNavigation = () => useContext(BackNavigationContext);

// Memoized header component to prevent unnecessary re-renders
const Header = memo(({ 
  profile, 
  signOut,
  isAdmin,
  notifications,
  unreadCount,
  markAsRead,
  markAllAsRead,
  showBackButton,
  handleBack
}: { 
  profile: any,
  signOut: () => Promise<void>,
  isAdmin: boolean,
  notifications: any[],
  unreadCount: number,
  markAsRead: (id: string) => void,
  markAllAsRead: () => void,
  showBackButton: boolean,
  handleBack: () => void
}) => {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-4 py-2 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex items-center">
        {showBackButton ? (
          <Button 
            variant="ghost" 
            size="sm"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
          </Button>
        ) : null}
        
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
              {unreadCount > 0 && (
                <Badge 
                  className="absolute -top-1 -right-1 px-1.5 py-0.5 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center bg-destructive text-[10px]"
                >
                  {unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <DropdownMenuItem 
                    key={notification.id}
                    className="cursor-pointer"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{notification.title}</span>
                      <span className="text-xs text-muted-foreground">{notification.message}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-center text-primary cursor-pointer"
                  onClick={markAllAsRead}
                >
                  Mark All as Read
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem disabled>No notifications</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

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
  const { notifications, unreadCount, showNotification, markAsRead, markAllAsRead } = useNotifications();
  
  // Back navigation state
  const [showBackButton, setShowBackButton] = useState(false);
  const [backTo, setBackTo] = useState<string | number>(-1);
  
  const handleBack = () => {
    if (typeof backTo === 'number') {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };
  
  const hideNavPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const shouldShowNav = !hideNavPaths.includes(location.pathname);
  
  useEffect(() => {
    if (profile && profile.role) {
      console.log(`User role: ${profile.role}`);
    }
  }, [profile]);
  
  // Handle authentication check
  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading app..." />;
  }
  
  // Protected routes require authentication
  if (!user && !hideNavPaths.includes(location.pathname)) {
    // Save the current path to redirect back after login
    sessionStorage.setItem('redirectPath', location.pathname);
    
    // Show notification
    toast({
      title: 'Authentication Required',
      description: 'Please sign in to access this page',
      variant: 'destructive',
    });
    
    return <Navigate to="/login" />;
  }

  return (
    <ErrorBoundaryWithFallback fallback={<LayoutErrorFallback />}>
      <BackNavigationContext.Provider 
        value={{ 
          showBackButton, 
          setShowBackButton, 
          backTo, 
          setBackTo, 
          handleBack 
        }}
      >
        <div className="flex flex-col min-h-screen bg-background text-foreground">
          {shouldShowNav && (
            <Header 
              profile={profile} 
              signOut={signOut}
              isAdmin={isAdmin}
              notifications={notifications}
              unreadCount={unreadCount}
              markAsRead={markAsRead}
              markAllAsRead={markAllAsRead}
              showBackButton={showBackButton}
              handleBack={handleBack}
            />
          )}
          
          <main className="flex-1 container mx-auto px-4 py-4 w-full max-w-6xl overflow-y-auto">
            <Suspense fallback={<LoadingSpinner fullScreen text="Loading..." />}>
              <ErrorBoundaryWithFallback>
                <Outlet />
              </ErrorBoundaryWithFallback>
            </Suspense>
          </main>
          
          {shouldShowNav && <BottomNav />}
        </div>
      </BackNavigationContext.Provider>
    </ErrorBoundaryWithFallback>
  );
};

export default MainLayout;
