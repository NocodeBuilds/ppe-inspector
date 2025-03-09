
import React, { createContext, useEffect, ReactNode, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useProfile } from '@/hooks/useProfile';
import { useAuthActions } from '@/hooks/useAuthActions';
import { toast } from '@/hooks/use-toast';

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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use React.useState to ensure React is available
  const [initialized, setInitialized] = React.useState(false);
  
  // Use our custom hooks to separate concerns
  const { session, user, isLoading: sessionLoading } = useAuthSession();
  const { profile, extendedProfile, refreshProfile, isLoading: profileLoading } = useProfile(user?.id);
  const { 
    isLoading: authActionsLoading, 
    signIn, 
    signUp, 
    signOut, 
    resetPassword, 
    updatePassword 
  } = useAuthActions();

  // Combined loading state
  const isLoading = sessionLoading || profileLoading || authActionsLoading;
  
  // Set initialized after first render
  useEffect(() => {
    setInitialized(true);
  }, []);
  
  // Log role for debugging
  useEffect(() => {
    if (profile && profile.role) {
      console.log(`User role loaded from profile: ${profile.role}`);
    }
  }, [profile]);
  
  // Check if profile is missing when user is authenticated
  useEffect(() => {
    // Wait for loading to complete
    if (isLoading) return;
    
    // If user is logged in but no profile found
    if (user && !profile && !sessionLoading && !profileLoading) {
      console.error("User authenticated but profile not found. This may indicate a database issue.");
      toast({
        title: "Profile Error",
        description: "Your user profile could not be loaded. Please contact support.",
        variant: "destructive",
      });
    }
  }, [user, profile, isLoading, sessionLoading, profileLoading]);

  // Create the combined auth context value
  const value: AuthContextType = {
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
