
import { useState, useEffect } from 'react';
import { supabase, Profile } from '@/integrations/supabase/client';
import { ExtendedProfile } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type ProfileHook = {
  profile: Profile | null;
  extendedProfile: ExtendedProfile | null;
  isLoading: boolean;
  refreshProfile: () => Promise<void>;
};

/**
 * Hook to manage user profile data
 * Handles fetching and refreshing profile information
 */
export const useProfile = (userId: string | undefined): ProfileHook => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async (id: string) => {
    try {
      console.log("Fetching profile for:", id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
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
    if (!userId) return;
    
    try {
      setIsLoading(true);
      await fetchProfile(userId);
      await fetchExtendedProfile();
    } catch (error: any) {
      console.error('Error refreshing profile:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to refresh profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch when userId is available
  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
      fetchExtendedProfile();
    }
  }, [userId]);

  return {
    profile,
    extendedProfile,
    isLoading,
    refreshProfile
  };
};
