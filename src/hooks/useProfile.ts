import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setError(error.message);
        }

        if (data) {
          // Convert database fields to match Profile interface
          const profile: Profile = {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            avatar_url: data.avatar_url || null,
            role: data.role,
            employee_id: data.employee_id,
            site_name: data.site_name,
            department: data.department, 
            employee_role: data.employee_role,
            mobile: data.mobile,
            signature: data.signature,
            created_at: data.created_at,
            updated_at: data.updated_at
          };

          // Additional console logging for debugging
          console.log('Profile data from DB:', data);
          console.log('Mapped profile:', profile);
          
          setProfile(profile);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching profile:', err);
        setError(err.message || 'An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return { profile, isLoading, error };
};
