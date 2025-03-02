
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedProfile } from '@/types';
import { ArrowLeft, Loader2, User } from 'lucide-react';

const EditProfile = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [location, setLocation] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  useEffect(() => {
    if (!profile) {
      navigate('/login');
      return;
    }
    
    fetchExtendedProfile();
    
    if (profile) {
      setFullName(profile.full_name || '');
    }
  }, [profile, navigate]);
  
  const fetchExtendedProfile = async () => {
    try {
      const { data, error } = await supabase.rpc('get_extended_profile');
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error;
        }
      } else {
        setExtendedProfile(data as ExtendedProfile);
        
        // Populate form with existing data
        if (data) {
          setEmployeeId(data.employee_id || '');
          setLocation(data.location || '');
          setDepartment(data.department || '');
          setBio(data.bio || '');
        }
      }
    } catch (error: any) {
      console.error('Error fetching extended profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
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
            full_name: fullName,
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
          p_employee_id: employeeId,
          p_location: location,
          p_department: department,
          p_bio: bio
        }
      );
      
      if (extendedProfileError) throw extendedProfileError;
      
      // Refresh profile data
      await refreshProfile();
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated',
      });
      
      navigate('/profile');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="fade-in">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-2"
          onClick={() => navigate('/profile')}
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4 overflow-hidden relative group">
            {avatarPreview ? (
              <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User size={40} className="text-muted-foreground" />
            )}
            
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <label htmlFor="avatar-upload" className="text-white cursor-pointer text-xs font-medium">
                Change
              </label>
              <input 
                id="avatar-upload" 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="fullName" className="text-sm font-medium block mb-1">Full Name</label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          
          <div>
            <label htmlFor="employeeId" className="text-sm font-medium block mb-1">Employee ID (Optional)</label>
            <Input
              id="employeeId"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Your employee ID"
            />
          </div>
          
          <div>
            <label htmlFor="location" className="text-sm font-medium block mb-1">Location (Optional)</label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Your location or site"
            />
          </div>
          
          <div>
            <label htmlFor="department" className="text-sm font-medium block mb-1">Department (Optional)</label>
            <Input
              id="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              placeholder="Your department"
            />
          </div>
          
          <div>
            <label htmlFor="bio" className="text-sm font-medium block mb-1">Bio (Optional)</label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="A short bio about yourself"
              rows={4}
            />
          </div>
        </div>
        
        <div className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/profile')}
            disabled={isSaving}
          >
            Cancel
          </Button>
          
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
