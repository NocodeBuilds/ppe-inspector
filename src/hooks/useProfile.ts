
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
    refetch
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
          
          // Cast data to Profile type
          const profileData: Profile = {
            id: data.id,
            full_name: data.full_name,
            avatar_url: data.avatar_url,
            role: data.role,
            created_at: data.created_at,
            updated_at: data.updated_at,
            // Extended profile fields now directly in profiles table
            employee_id: data.employee_id || null,
            location: data.location || null,
            department: data.department || null,
            bio: data.bio || null,
            email: null // We can add email if needed
          };
          
          return profileData;
        }
        return null;
      } catch (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
    },
    { enabled: !!userId }
  );
    }
  };
  
  return {
    profile,
    isLoading,
    refreshProfile
  };
};
