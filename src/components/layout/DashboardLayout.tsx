import { useState, useEffect } from 'react';
import { Outlet, Link, useRouter } from '@tanstack/react-router';
import { 
  Home, 
  HardHat, 
  CalendarClock, 
  AlertTriangle, 
  LineChart, 
  FileText, 
  Settings, 
  User, 
  Menu, 
  Sun, 
  Moon,
  LogOut,
  Shield
} from 'lucide-react';
import { useTheme } from '@/components/ui/theme-provider';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMediaQuery } from '@/hooks/use-media-query';
<<<<<<< Updated upstream
import { useAuth } from '@/hooks/use-auth';
import { PageLoader } from '@/components/ui/page-loader';
=======
import { useAuth } from '@/hooks/use-auth.tsx';
import PageLoader from '@/components/ui/page-loader';
>>>>>>> Stashed changes

interface NavLinkProps {
  to: string;
  label: string;
  icon: React.ReactNode;
  active?: boolean;
}

const NavLink = ({ to, label, icon, active }: NavLinkProps) => (
  <Link
    to={to}
    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      active 
        ? 'bg-primary text-primary-foreground' 
        : 'hover:bg-secondary'
    }`}
    activeProps={{ className: 'bg-primary text-primary-foreground' }}
  >
    {icon}
    {label}
  </Link>
);

/**
 * DashboardLayout component provides the main authenticated user interface
 * with navigation, user profile, and content area.
 */
const DashboardLayout = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  
  // Close mobile nav when switching to desktop
  useEffect(() => {
    if (isDesktop) {
      setOpen(false);
    }
  }, [isDesktop]);

  // Prevent hydration mismatch with theme
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <PageLoader />;
  }

  const handleSignOut = async () => {
    await signOut();
    router.navigate({ to: '/auth/login' });
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home size={18} /> },
    { to: '/dashboard/equipment', label: 'Equipment', icon: <HardHat size={18} /> },
    { to: '/dashboard/expiring', label: 'Expiring PPE', icon: <CalendarClock size={18} /> },
    { to: '/dashboard/upcoming', label: 'Upcoming Inspections', icon: <CalendarClock size={18} /> },
    { to: '/dashboard/flagged', label: 'Flagged Issues', icon: <AlertTriangle size={18} /> },
    { to: '/dashboard/reports', label: 'Reports', icon: <FileText size={18} /> },
    { to: '/dashboard/analytics', label: 'Analytics', icon: <LineChart size={18} /> },
  ];

  const userNavItems = [
    { to: '/dashboard/profile', label: 'Profile', icon: <User size={18} /> },
    { to: '/dashboard/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    
    // Use first letter of email by default
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="outline" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0 pr-0">
            <div className="flex items-center gap-2 border-b p-4">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">PPE Inspector</span>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.to} 
                    to={item.to} 
                    label={item.label} 
                    icon={item.icon}
                    active={router.state.location.pathname === item.to}
                  />
                ))}
                <Separator className="my-2" />
                {userNavItems.map((item) => (
                  <NavLink 
                    key={item.to} 
                    to={item.to} 
                    label={item.label} 
                    icon={item.icon}
                    active={router.state.location.pathname === item.to}
                  />
                ))}
                <Separator className="my-2" />
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun size={18} />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon size={18} />
                      <span>Dark Mode</span>
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </Button>
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>
        
        {/* Logo for desktop */}
        <Link 
          to="/dashboard" 
          className="hidden items-center gap-2 md:flex"
        >
          <Shield className="h-6 w-6 text-primary" />
          <span className="text-lg font-semibold">PPE Inspector</span>
        </Link>
        
        {/* Spacer to push user menu to the right */}
        <div className="flex-1"></div>
        
        {/* User Profile */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="mr-2"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="hidden flex-col md:flex">
              <span className="text-sm font-medium">{user?.email}</span>
              <span className="text-xs text-muted-foreground">
                {user?.user_metadata?.role || 'User'}
              </span>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content area with side navigation */}
      <div className="flex flex-1 overflow-hidden">
        {/* Side Navigation - Desktop Only */}
        <aside className="hidden w-64 shrink-0 border-r md:block">
          <ScrollArea className="h-full py-4">
            <div className="px-4 py-2">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <NavLink 
                    key={item.to} 
                    to={item.to} 
                    label={item.label} 
                    icon={item.icon}
                  />
                ))}
                <Separator className="my-2" />
                {userNavItems.map((item) => (
                  <NavLink 
                    key={item.to} 
                    to={item.to} 
                    label={item.label} 
                    icon={item.icon}
                  />
                ))}
                <Separator className="my-2" />
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </ScrollArea>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <div className="container py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
