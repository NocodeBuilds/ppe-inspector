
import { User } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile } from '@/types';

export const useProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProfile(user);
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async (user: User) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        // Ensure role is one of the allowed values: 'admin', 'inspector', 'user'
        let validatedRole: 'admin' | 'inspector' | 'user' = 'user';
        if (data.role === 'admin' || data.role === 'inspector' || data.role === 'user') {
          validatedRole = data.role;
        }
        
        setProfile({
          id: data.id,
          email: user.email,
          full_name: data.full_name,
          avatar_url: data.avatar_url,
          role: validatedRole,
          employee_id: data.employee_id,
          site_name: data.site_name,
          department: data.department,
          employee_role: data.employee_role, // Using employee_role instead of Employee_Role
          createdAt: data.created_at,
          updatedAt: data.updated_at
        });
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Not authenticated');
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setProfile(prev => prev ? { ...prev, ...updates } : null);
        return data;
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    fetchProfile: () => user && fetchProfile(user),
  };
};

export default useProfile;
