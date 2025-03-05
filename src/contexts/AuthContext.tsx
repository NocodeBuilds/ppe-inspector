
import { createContext, useContext, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { Profile } from '@/integrations/supabase/client';
import { useAuthSession } from '@/hooks/useAuthSession';
import { useProfile } from '@/hooks/useProfile';
import { useAuthActions } from '@/hooks/useAuthActions';

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

export function AuthProvider({ children }: { children: React.ReactNode }) {
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
