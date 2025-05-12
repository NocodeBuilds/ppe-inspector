
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export function useProfileForm() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  
  // Initialize form data state - using employee_role instead of Employee_Role
  const [formData, setFormData] = useState({
    full_name: '',
    employee_id: '',
    site_name: '',
    department: '',
    employee_role: '',
  });
  
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        employee_id: profile.employee_id || '',
        site_name: profile.site_name || '',
        department: profile.department || '',
        employee_role: profile.employee_role || '',
      });
      setIsLoading(false);
    }
  }, [profile]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarChange = (file: File) => {
    setAvatarFile(file);
    
    // Create preview URL
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };
  
  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return null;
    
    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload Error',
        description: error.message || 'Failed to upload avatar',
        variant: 'destructive',
      });
      return null;
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      let avatarUrl = null;
      
      if (avatarFile) {
        avatarUrl = await uploadAvatar();
      }
      
      const updates = {
        id: user.id,
        full_name: formData.full_name,
        employee_id: formData.employee_id,
        site_name: formData.site_name,
        department: formData.department,
        employee_role: formData.employee_role,
        avatar_url: avatarUrl || profile?.avatar_url,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      await refreshProfile();
      
      toast({
        title: 'Success',
        description: 'Your profile has been updated',
      });
      
      // Clean up the preview URL
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
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
}
