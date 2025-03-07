
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Service to handle common authentication-related operations
 */
export const AuthService = {
  /**
   * Check if user is authenticated. Returns user ID if authenticated, otherwise redirects to login
   */
  ensureAuthenticated: async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        window.location.href = '/login';
        throw new Error('Authentication required');
      }
      return data.session.user.id;
    } catch (error) {
      console.error('Authentication error:', error);
      window.location.href = '/login';
      throw new Error('Authentication required');
    }
  },
  
  /**
   * Get the current user's ID
   */
  getCurrentUserId: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      return null;
    }
    return data.session.user.id;
  }
};

/**
 * React component hook to ensure user is authenticated before rendering
 */
export const useAuthGuard = () => {
  const { user, isLoading } = useAuth();
  
  if (!isLoading && !user) {
    window.location.href = '/login';
  }
  
  return { isAuthenticated: !!user, isLoading };
};

export default AuthService;
