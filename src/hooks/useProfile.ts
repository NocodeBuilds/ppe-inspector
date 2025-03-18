
import { useState } from 'react';
import { supabase, Profile } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';

type ProfileHook = {
  profile: Profile | null;
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
    isLoading,
    refetch: refreshProfile
  } = useSupabaseQuery<Profile | null>(
    ['profile', userId || ''],
    async () => {
      if (!userId) return null;
      
      try {
        console.log("Fetching profile for:", userId);
        const { data, error } = await supabase
          .from('profiles')
          .select('*, extended_profiles:user_id(*)')
          .eq('id', userId)
          .single();

        if (error) throw error;

        if (data) {
          console.log("Profile data:", data);
          
          // Merge the profile and extended profile data
          const mergedProfile: Profile = {
            id: data.id,
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            role: data.role,
            created_at: data.created_at,
            updated_at: data.updated_at,
            employee_id: data.extended_profiles?.employee_id || null,
            location: data.extended_profiles?.location || null,
            department: data.extended_profiles?.department || null,
            bio: data.extended_profiles?.bio || null,
            email: null // We can add email if needed
          };
          
          return mergedProfile;
        }
        return null;
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },
    { enabled: !!userId }
  );
  
  return {
    profile,
    isLoading,
    refreshProfile
  };
};
