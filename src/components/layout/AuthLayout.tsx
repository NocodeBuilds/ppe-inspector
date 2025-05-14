import { Outlet } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { Link } from '@tanstack/react-router';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Shield } from 'lucide-react';

/**
 * AuthLayout component provides the layout structure for authentication pages 
 * such as login, register, and password recovery screens.
 */
const AuthLayout = () => {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top navigation bar with logo and theme toggle */}
      <header className="flex h-16 items-center justify-between border-b px-6">
        <Link 
          to="/"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Shield className="h-6 w-6 text-primary" />
          <span>PPE Inspector</span>
        </Link>
        <ModeToggle />
      </header>

      {/* Main content area with auth forms */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div className="mx-auto text-center">
            <Shield className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 text-3xl font-bold">PPE Inspector</h1>
            <p className="mt-2 text-muted-foreground">
              Streamline safety inspections and compliance management
            </p>
          </div>
          
          {/* Authentication content via outlet */}
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer with copyright and links */}
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="container flex flex-col items-center justify-center gap-2 md:flex-row md:gap-4">
          <p>© {new Date().getFullYear()} PPE Inspector. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthLayout;
