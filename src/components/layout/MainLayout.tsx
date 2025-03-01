
import { Outlet, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import BottomNav from './BottomNav';
import { ThemeToggler } from '@/components/ThemeToggler';

const MainLayout = () => {
  const location = useLocation();
  const hideNavPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
  const shouldShowNav = !hideNavPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {shouldShowNav && (
        <header className="flex justify-end items-center px-4 py-2 border-b">
          <ThemeToggler />
        </header>
      )}
      
      <main className="flex-1 container mx-auto px-4 py-4 max-w-md">
        <Outlet />
      </main>
      
      {shouldShowNav && <BottomNav />}
      
      <Toaster />
    </div>
  );
};

export default MainLayout;
