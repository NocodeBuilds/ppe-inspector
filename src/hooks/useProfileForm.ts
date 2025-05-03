
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ProfileFormData = {
  full_name: string;
  employee_id: string;
  site_name: string;
  department: string;
  employee_role: string;
  mobile: string; // Added mobile field to the ProfileFormData interface
};

export const useProfileForm = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<ProfileFormData>({
    full_name: '',
    employee_id: '',
    site_name: '',
    department: '',
    employee_role: '',
    mobile: '', // Initialize mobile field
  });
  
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  useEffect(() => {
    if (!profile) {
      navigate('/login');
      return;
    }

    // Populate form with existing data
    if (profile) {
      const profileData = {
        ...profile,
        employee_role: profile?.employee_role || '',
      };

      setFormData({
        full_name: profileData.full_name || '',
        employee_id: profileData.employee_id || '',
        site_name: profileData.site_name || '',
        department: profileData.department || '',
        employee_role: profileData.employee_role || '',
        mobile: profileData.mobile || '',  // Include the mobile field
      });
    }

    setIsLoading(false);
  }, [profile, navigate]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatar) return null;

    try {
      const fileExt = avatar.name.split('.').pop();
      const filePath = `avatars/${profile?.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatar);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await uploadAvatar();
      }

      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            avatar_url: avatarUrl || profile.avatar_url,
            updated_at: new Date().toISOString(),
            employee_id: formData.employee_id,
            site_name: formData.site_name,
            department: formData.department,
            employee_role: formData.employee_role,
            mobile: formData.mobile, // Update mobile field
          })
          .eq('id', profile.id);

        if (profileError) throw profileError;
      }

      await refreshProfile();

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated'
      });

      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    handleInputChange,
    handleSelectChange,
    isLoading,
    isSaving,
    profile,
    avatarPreview,
    handleAvatarChange,
    handleSubmit,
    navigate
  };
};
