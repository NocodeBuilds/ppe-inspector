
import { useState } from 'react';
import { supabase, Profile } from '@/integrations/supabase/client';
import { ExtendedProfile } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';

type ProfileHook = {
  profile: Profile | null;
  extendedProfile: ExtendedProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

/**
 * Hook to manage user profile data
 * Handles fetching and refreshing profile information with efficient caching
 */
export const useProfile = (userId: string | undefined): ProfileHook => {
  const { toast } = useToast();
  
  // Use React Query for profile data
  const {
    data: profile,
    isLoading: isProfileLoading,
    refetch: refetchProfile
  } = useSupabaseQuery<Profile | null>(
    ['profile', userId || ''],
    async () => {
      if (!userId) return null;
      
      try {
        console.log("Fetching profile for:", userId);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data) {
          console.log("Profile data:", data);
          return data as Profile; // Return the complete data object as Profile
        }
        return null;
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },
    { enabled: !!userId }
  );
  
  // Use React Query for extended profile data
  const {
    data: extendedProfile,
    isLoading: isExtendedProfileLoading,
    refetch: refetchExtendedProfile
  } = useSupabaseQuery<ExtendedProfile | null>(
    ['extendedProfile', userId || ''],
    async () => {
      try {
        const { data, error } = await supabase.rpc('get_extended_profile');
        
        if (error) {
          if (error.code === 'PGRST116') return null; // No rows returned
          throw error;
        }
        
        return data as ExtendedProfile;
      } catch (error) {
        console.error('Error fetching extended profile:', error);
        throw error;
      }
    },
    { enabled: !!userId }
  );
  
  // Combined refresh function
  const refreshProfile = async () => {
    try {
      await Promise.all([refetchProfile(), refetchExtendedProfile()]);
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to refresh profile',
        variant: 'destructive',
      });
    }
  };
  
  // Combined loading state
  const isLoading = isProfileLoading || isExtendedProfileLoading;
  
  return {
    profile,
    extendedProfile,
    isLoading,
    refreshProfile
  };
};
