import { useState, useEffect, createContext, useContext } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase-client';

// Define the auth context type
type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  error: AuthError | null;
  signUp: (email: string, password: string, userData?: Record<string, any>) => Promise<{
    success: boolean;
    error: AuthError | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    success: boolean;
    error: AuthError | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    success: boolean;
    error: AuthError | null;
  }>;
  updatePassword: (password: string) => Promise<{
    success: boolean;
    error: AuthError | null;
  }>;
  updateProfile: (data: Record<string, any>) => Promise<{
    success: boolean;
    error: Error | null;
  }>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component for auth context
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);
  
  const supabase = createClient();

  // Initialize the auth state
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      
      try {
        // Get current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(error);
          console.error('Error fetching session:', error);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
        }
      } catch (e) {
        console.error('Unexpected error during auth initialization:', e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign up a new user
  const signUp = async (email: string, password: string, userData?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) {
        setError(error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error during sign up:', error);
      return { 
        success: false, 
        error: new Error('An unexpected error occurred during sign up') as AuthError 
      };
    }
  };

  // Sign in an existing user
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error during sign in:', error);
      return { 
        success: false, 
        error: new Error('An unexpected error occurred during sign in') as AuthError 
      };
    }
  };

  // Sign out the current user
  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Send a password reset email
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        setError(error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error during password reset:', error);
      return { 
        success: false, 
        error: new Error('An unexpected error occurred during password reset') as AuthError 
      };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        setError(error);
        return { success: false, error };
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error during password update:', error);
      return { 
        success: false, 
        error: new Error('An unexpected error occurred updating password') as AuthError 
      };
    }
  };

  // Update user profile
  const updateProfile = async (data: Record<string, any>) => {
    try {
      // First update auth metadata
      const { data: authData, error: authError } = await supabase.auth.updateUser({
        data,
      });

      if (authError) {
        return { success: false, error: authError };
      }

      // Then update profile in profiles table if needed
      if (user?.id) {
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            ...data,
            updated_at: new Date().toISOString(),
          });

        if (profileError) {
          return { success: false, error: profileError };
        }
      }

      return { success: true, error: null };
    } catch (error) {
      console.error('Unexpected error updating profile:', error);
      return { success: false, error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const value = {
    session,
    user,
    isLoading,
    error,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
