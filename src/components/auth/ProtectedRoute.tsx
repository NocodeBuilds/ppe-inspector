import { ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/use-auth';
import PageLoader from '@/components/ui/page-loader';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'user' | 'inspector';
  fallbackPath?: string;
}

/**
 * ProtectedRoute component ensures that only authenticated users
 * can access certain routes. It also supports role-based access control.
 */
const ProtectedRoute = ({
  children,
  requiredRole,
  fallbackPath = '/auth/login',
}: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Don't redirect while authentication is being checked
    if (isLoading) return;

    // Redirect if no user is authenticated
    if (!user) {
      navigate({ to: fallbackPath });
      return;
    }

    // If a specific role is required, check for it
    if (requiredRole && user.user_metadata?.role !== requiredRole) {
      // Allow admin to access all routes
      if (user.user_metadata?.role === 'admin') {
        return;
      }
      
      // Redirect to fallback path if user doesn't have required role
      navigate({ to: fallbackPath });
    }
  }, [user, isLoading, fallbackPath, navigate, requiredRole]);

  // Show loading state while checking authentication
  if (isLoading) {
    return <PageLoader />;
  }

  // If not authenticated, render nothing (will redirect)
  if (!user) {
    return null;
  }

  // If role check is required and user doesn't have that role
  if (
    requiredRole &&
    user.user_metadata?.role !== requiredRole &&
    user.user_metadata?.role !== 'admin'
  ) {
    return null;
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
};

export default ProtectedRoute;
