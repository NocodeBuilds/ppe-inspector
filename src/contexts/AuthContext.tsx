
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/index';
import { Profile } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useProfile } from '@/hooks/useProfile';
import { useAuthActions } from '@/hooks/useAuthActions';
import { toast } from '@/hooks/use-toast';

type AuthContextType = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
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
  const { profile, refreshProfile: fetchProfile, isLoading: profileLoading } = useProfile(user?.id);
  const { 
    isLoading: authActionsLoading, 
    signIn, 
    signUp, 
    signOut, 
    resetPassword, 
    updatePassword 
  } = useAuthActions();

  // Fixed: Update the refreshProfile function to ensure it returns Promise<void>
  const refreshProfile = async (): Promise<void> => {
    if (user?.id) {
      await fetchProfile();
      return;
    }
  };

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
