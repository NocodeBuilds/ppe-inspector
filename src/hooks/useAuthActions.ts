
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

// Auth request timeout in milliseconds
const AUTH_REQUEST_TIMEOUT = 15000;

type AuthActionsHook = {
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

/**
 * Hook providing authentication actions
 * Separates auth operations from context state management
 */
export const useAuthActions = (): AuthActionsHook => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Centralized error handler
  const handleError = (error: any, title: string, defaultMessage: string) => {
    console.error(`${title}:`, error);
    toast({
      title: title,
      description: error.message || defaultMessage,
      variant: 'destructive',
    });
    return error;
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Create a promise that resolves after timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login request timed out. Please try again.')), AUTH_REQUEST_TIMEOUT);
      });
      
      // Race between the actual sign-in request and the timeout
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      
      const result = await Promise.race([signInPromise, timeoutPromise]) as { data: any, error: any };
      
      if (result.error) {
        throw result.error;
      }
      
      // Store auth status in local storage for PWA offline access
      localStorage.setItem('isAuthenticated', 'true');
      
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      
    } catch (error: any) {
      handleError(error, 'Login failed', 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Registration request timed out. Please try again.')), AUTH_REQUEST_TIMEOUT);
      });
      
      // Race between sign-up request and timeout
      const signUpPromise = supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      const result = await Promise.race([signUpPromise, timeoutPromise]) as { data: any, error: any };
      
      if (result.error) {
        throw result.error;
      }
      
      toast({
        title: 'Account created',
        description: 'Please check your email to confirm your account.',
      });
      
    } catch (error: any) {
      handleError(error, 'Signup failed', 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage
      localStorage.removeItem('isAuthenticated');
      
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    } catch (error: any) {
      handleError(error, 'Sign out failed', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      
      toast({
        title: 'Password reset link sent',
        description: 'Please check your email for the password reset link.',
      });
    } catch (error: any) {
      handleError(error, 'Password reset failed', 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      
      toast({
        title: 'Password updated',
        description: 'Your password has been successfully updated.',
      });
    } catch (error: any) {
      handleError(error, 'Failed to update password', 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword
  };
};
