
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/integrations/supabase/client';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (uid: string) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!uid) {
        setProfile(null);
        setIsLoading(false);
        return null;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setError(error.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }

      return data as Profile | null;
    } catch (err: any) {
      console.error('Unexpected error in fetchProfile:', err);
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!userId) return null;
    return await fetchProfile(userId);
  }, [userId, fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "No user ID available for profile update",
        variant: "destructive",
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Error",
          description: `Failed to update profile: ${error.message}`,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      setProfile(data as Profile);
      return data as Profile;
    } catch (err: any) {
      console.error('Unexpected error in updateProfile:', err);
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${err.message}`,
        variant: "destructive",
      });
      return null;
    }
  }, [userId, toast]);

  useEffect(() => {
    if (userId) {
      fetchProfile(userId);
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [userId, fetchProfile]);

  return { profile, isLoading, error, refreshProfile, updateProfile };
}
