
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Profile } from '@/integrations/supabase/client';

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Helper to handle result from supabase
  const handleError = (err: any, context: string = "") => {
    const msg = (err && err.message) ? err.message : String(err);
    setError(msg);
    toast({
      title: "Profile error",
      description: `${context} ${msg}`,
      variant: "destructive",
    });
    return null;
  };

  const fetchProfile = useCallback(async (uid: string) => {
    setIsLoading(true);
    setError(null);

    if (!uid) {
      setProfile(null);
      setIsLoading(false);
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .maybeSingle();

      if (error) {
        return handleError(error, "fetching profile:");
      }
      if (!data) {
        return handleError({ message: "Profile record not found after signup! Please try logging out and back in." }, "fetching profile:");
      }

      setProfile(data as Profile);
      return data as Profile;
    } catch (err: any) {
      return handleError(err, "unexpected error in fetchProfile:");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // used for manual refresh
  const refreshProfile = useCallback(() => {
    if (!userId) return null;
    return fetchProfile(userId);
  }, [userId, fetchProfile]);

  // update
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
      toast({
        title: "Error",
        description: `An unexpected error occurred: ${err.message}`,
        variant: "destructive",
      });
      return null;
    }
  }, [userId]);

  // Always re-fetch when userId changes
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
