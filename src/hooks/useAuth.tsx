
import React, { useContext } from 'react';
import { AuthContext, useAuth as useAuthContext } from '@/contexts/AuthContext';

/**
 * Hook to access auth context
 * Provides a consistent way to use auth throughout the app
 */
export const useAuth = useAuthContext;

/**
 * Utility function to check if the current user has a specific role
 * @param role - The role to check for
 * @param userRole - The current user's role
 */
export const hasRole = (requiredRole: 'admin' | 'user', userRole?: string | null): boolean => {
  if (!userRole) return false;
  
  // Role hierarchy: admin > user
  if (requiredRole === 'user') {
    // Any authenticated user can access user-level features
    return ['admin', 'user'].includes(userRole);
  }
  
  if (requiredRole === 'admin') {
    // Only admins can access admin-level features
    return userRole === 'admin';
  }
  
  return false;
};

/**
 * Utility component to protect routes based on user roles
 * Returns an object with isAdmin and isUser flags
 */
export const useRoleAccess = () => {
  const { profile } = useAuth();
  
  return {
    isAdmin: hasRole('admin', profile?.role),
    isUser: !!profile?.role, // Any authenticated user with a role
  };
};
