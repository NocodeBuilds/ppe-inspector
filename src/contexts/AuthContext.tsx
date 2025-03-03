
import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, Profile } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Define the ExtendedProfile type to match the database structure
export type ExtendedProfile = {
  id: string;
  user_id: string;
  employee_id: string | null;
  location: string | null;
  department: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  extendedProfile: ExtendedProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth request timeout in milliseconds
const AUTH_REQUEST_TIMEOUT = 15000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Setup auth state listener
  useEffect(() => {
    console.log("Setting up auth listener");
    
    const setupAuth = async () => {
      try {
        // Get initial session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        console.log("Initial session:", data?.session ? "Found" : "None");
        setSession(data.session);
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await fetchProfile(data.session.user.id);
        }
      } catch (error) {
        console.error("Error getting session:", error);
      } finally {
        // Ensure we always set loading to false after initial check
        setIsLoading(false);
      }
      
      // Subscribe to auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log("Auth state changed:", event);
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchProfile(session.user.id);
            await fetchExtendedProfile();
          } else {
            setProfile(null);
            setExtendedProfile(null);
          }
        }
      );
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    setupAuth();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      console.log("Fetching profile for:", userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        console.log("Profile data:", data);
        setProfile({
          id: data.id,
          full_name: data.full_name,
          role: data.role || 'user',
          avatar_url: data.avatar_url
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Don't show toast here as it's not a user-facing operation
    }
  };

  const fetchExtendedProfile = async () => {
    try {
      const { data, error } = await supabase.rpc('get_extended_profile');
      
      if (error) {
        console.error('Error fetching extended profile:', error);
        return;
      }
      
      if (data) {
        setExtendedProfile(data as ExtendedProfile);
      }
    } catch (error) {
      console.error('Error fetching extended profile:', error);
    }
  };

  const refreshProfile = async () => {
    try {
      setIsLoading(true);
      if (user?.id) {
        await fetchProfile(user.id);
        await fetchExtendedProfile();
      }
    } catch (error) {
      handleError(error, 'Error', 'Failed to refresh profile');
    } finally {
      setIsLoading(false);
    }
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

  const value = {
    session,
    user,
    profile,
    extendedProfile,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    refreshProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
