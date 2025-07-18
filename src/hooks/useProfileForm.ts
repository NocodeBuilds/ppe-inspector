import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ProfileFormData = {
  full_name: string;
  employee_id: string;
  site_name: string;
  department: string;
  Employee_Role: string;
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
    Employee_Role: '',
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
      setFormData({
        full_name: profile.full_name || '',
        employee_id: profile.employee_id || '',
        site_name: profile.site_name || '',
        department: profile.department || '',
        Employee_Role: profile.Employee_Role || '',
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
            Employee_Role: formData.Employee_Role,
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