
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/integrations/supabase/client';

interface UseProfileResult {
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

export const useProfile = (userId?: string | null): UseProfileResult => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        // Get email from auth if available, otherwise use null
        const { data: userData } = await supabase.auth.getUser();
        const email = userData?.user?.email || null;
        
        setProfile({
          ...data,
          email // Add email to satisfy the Profile type
        });
      }
    } catch (err: any) {
      console.error('Error loading profile:', err);
      setError(err.message || 'Error loading user profile');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const refreshProfile = async () => {
    await fetchProfile();
  };

  return { profile, isLoading, error, refreshProfile };
};
