
import { useState } from 'react';
import { supabase, Profile } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';

type ProfileHook = {
  profile: Profile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

export const useProfile = (userId: string | undefined): ProfileHook => {
  const { toast } = useToast();
  
  // Use React Query for profile data with faster retry and shorter stale time
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
          .maybeSingle();

        if (error) {
          console.error('Error fetching profile:', error);
          // If profile doesn't exist, create a basic one
          if (error.code === 'PGRST116') {
            console.log('Profile not found, creating default profile');
            const { data: user } = await supabase.auth.getUser();
            if (user.user) {
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: userId,
                  email: user.user.email || '',
                  full_name: user.user.email?.split('@')[0] || 'User',
                  role: 'user'
                })
                .select()
                .single();
                
              if (createError) {
                console.error('Error creating profile:', createError);
                throw createError;
              }
              
              return newProfile as Profile;
            }
          }
          throw error;
        }

        if (data) {
          console.log("Profile data found:", data);
          return data as Profile;
        }
        return null;
      } catch (error) {
        console.error('Error in profile fetch:', error);
        throw error;
      }
    },
    { 
      enabled: !!userId,
      staleTime: 10 * 1000, // 10 seconds
      refetchOnWindowFocus: false
    }
  );
  
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
