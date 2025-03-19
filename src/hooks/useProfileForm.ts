
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedProfile } from '@/types/extendedProfile';
import { useToast } from '@/hooks/use-toast';

type ProfileFormData = {
  fullName: string;
  employeeId: string;
  location: string;
  department: string;
  bio: string;
};

export const useProfileForm = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: '',
    employeeId: '',
    location: '',
    department: '',
    bio: '',
  });
  
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const { toast } = useToast();
  
  // Update form data when a field changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // Handle select changes
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
    
    fetchExtendedProfile();
    
    if (profile) {
      setFormData(prev => ({
        ...prev,
        fullName: profile.full_name || ''
      }));
    }
  }, [profile, navigate]);
  
  const fetchExtendedProfile = async () => {
    try {
      const { data, error } = await supabase.rpc('get_extended_profile');
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error;
        }
      } else if (data) {
        // Cast the data to ExtendedProfile type
        const profileData = data as unknown as ExtendedProfile;
        setExtendedProfile(profileData);
        
        // Populate form with existing data
        setFormData(prev => ({
          ...prev,
          fullName: prev.fullName, // Keep the already set fullName
          employeeId: profileData.employee_id || '',
          location: profileData.location || '',
          department: profileData.department || '',
          bio: profileData.bio || '',
        }));
      }
    } catch (error: any) {
      console.error('Error fetching extended profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      
      // Create preview
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
      // If there's an avatar update, upload it
      let avatarUrl = null;
      if (avatar) {
        avatarUrl = await uploadAvatar();
      }
      
      // Update profile basic info
      if (profile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.fullName,
            avatar_url: avatarUrl || profile.avatar_url,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id);
        
        if (profileError) throw profileError;
      }
      
      // Update or insert extended profile
      const { data: updatedExtendedProfile, error: extendedProfileError } = await supabase.rpc(
        'upsert_extended_profile',
        {
          p_employee_id: formData.employeeId,
          p_location: formData.location,
          p_department: formData.department,
          p_bio: formData.bio
        }
      );
      
      if (extendedProfileError) throw extendedProfileError;
      
      // Refresh profile data
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
