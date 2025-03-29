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
          
          // Cast data to Profile type with proper type safety
          const profileData: Profile = {
            id: data.id,
            full_name: data.full_name || null,
            avatar_url: data.avatar_url || null,
            role: data.role || 'user',
            created_at: data.created_at || null,
            updated_at: data.updated_at || null,
            employee_id: data.employee_id || null,
            site_name: data.site_name || null,
            department: data.department || null,
            Employee_Role: data.Employee_Role || null,
            bio: data.bio || null,
            email: null
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
  
  // Create a function to refresh the profile data
  const refreshProfile = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Error refreshing profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh profile data',
        variant: 'destructive',
      });
    }
  };

  return {
    profile,
    isLoading,
    refreshProfile
  };
}