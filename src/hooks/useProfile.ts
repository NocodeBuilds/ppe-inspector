
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/ppe';
import { useAuth } from '@/hooks/useAuth';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const profileData = {
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
          updated_at: data.updated_at,
          
          // Add getters as actual properties for TypeScript
          createdAt: data.created_at || '',
          updatedAt: data.updated_at || '',
          fullName: data.full_name || '',
          avatarUrl: data.avatar_url || '',
          employeeId: data.employee_id || '',
          siteName: data.site_name || '',
          employeeRole: data.employee_role || ''
        };

        console.log('Profile data from DB:', data);
        console.log('Mapped profile:', profileData);
        
        setProfile(profileData as Profile);
      }
    } catch (err: any) {
      console.error('Unexpected error fetching profile:', err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log(`Fetching profile for: ${user.id}`);
      fetchProfile();
    } else {
      setProfile(null);
      setIsLoading(false);
    }
  }, [user]);

  return { profile, isLoading, error, refetchProfile: fetchProfile };
};
