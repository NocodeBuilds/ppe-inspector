
import { Outlet, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import BottomNav from './BottomNav';
import { ThemeToggler } from '@/components/ThemeToggler';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const hideNavPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const shouldShowNav = !hideNavPaths.includes(location.pathname);
  const canGoBack = !['/', '/login', '/register'].includes(location.pathname);
  
  // Handle authentication check
  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Protected routes require authentication
  if (!user && !hideNavPaths.includes(location.pathname)) {
    return <Navigate to="/login" />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {shouldShowNav && (
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
      )}
      
      <main className="flex-1 container mx-auto px-4 py-4 w-full max-w-6xl overflow-y-auto">
        <Outlet />
      </main>
      
      {shouldShowNav && <BottomNav />}
      
      <Toaster />
    </div>
  );
};

export default MainLayout;
