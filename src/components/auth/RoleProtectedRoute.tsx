
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, hasRole } from '@/hooks/useAuth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'admin' | 'user';
  fallbackPath?: string;
}

/**
 * Component to protect routes based on user roles
 * Redirects to fallbackPath if user doesn't have the required role
 */
const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRole,
  fallbackPath = '/'
}) => {
  const { profile, isLoading } = useAuth();
  
  // Show loading state if auth is still loading
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If user doesn't have required role, show access denied or redirect
  if (!profile || !hasRole(requiredRole, profile.role)) {
    if (fallbackPath === 'access-denied') {
      return (
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Alert variant="destructive" className="mb-4">
            <Shield className="h-5 w-5 mr-2" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to access this page. This area requires {requiredRole} privileges.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        </div>
      );
    }
    
    // Redirect to fallback path
    return <Navigate to={fallbackPath} replace />;
  }
  
  // User has the required role, render children
  return <>{children}</>;
};

export default RoleProtectedRoute;
