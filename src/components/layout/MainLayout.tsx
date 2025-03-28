import React, { memo, Suspense, useEffect, useState, createContext, useContext } from 'react';
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import BottomNav from './BottomNav';
import { ThemeToggler } from '@/components/ThemeToggler';
import { useAuth, useRoleAccess } from '@/hooks/useAuth';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ErrorBoundaryWithFallback from '@/components/ErrorBoundaryWithFallback';
import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '../common/LoadingSpinner';
import LogoIcon from '../common/LogoIcon';
import NotificationCenter from '../notifications/NotificationCenter';

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

export const useBackNavigation = () => useContext(BackNavigationContext);

const Header = memo(({ 
  profile, 
  showBackButton,
  handleBack
}: { 
  profile: any,
  showBackButton: boolean,
  handleBack: () => void
}) => {
  return (
    <header className="sticky top-0 z-50 flex justify-between items-center px-3 py-2 border-b bg-background/80 backdrop-blur-sm">
      <div className="flex items-center">
        {showBackButton ? (
          <Button 
            variant="ghost" 
            size="sm"
            className="mr-2 h-9 w-9 p-0"
            onClick={handleBack}
          >
            <ArrowLeft size={20} />
          </Button>
        ) : (
          <LogoIcon size="sm" withText={true} className="flex-shrink-0" />
        )}
      </div>
      
      <div className="flex items-center gap-3">
        <ThemeToggler />
        <NotificationCenter />
      </div>
    </header>
  );
});

Header.displayName = 'Header';

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
  
  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading app..." />;
  }
  
  if (!user && !hideNavPaths.includes(location.pathname)) {
    sessionStorage.setItem('redirectPath', location.pathname);
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
              showBackButton={showBackButton}
              handleBack={handleBack}
            />
          )}
          
          <main className="flex-1 container mx-auto px-4 py-4 sm:py-5 w-full max-w-6xl overflow-y-auto">
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
