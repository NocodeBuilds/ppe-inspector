
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfileForm } from '@/hooks/useProfileForm';
import AvatarUpload from '@/components/profile/AvatarUpload';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileFormActions from '@/components/profile/ProfileFormActions';

const EditProfile = () => {
  const {
    formData,
    handleInputChange,
    isLoading,
    isSaving,
    profile,
    avatarPreview,
    handleAvatarChange,
    handleSubmit,
    navigate
  } = useProfileForm();
  
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
        <AvatarUpload 
          avatarUrl={profile?.avatar_url || null}
          avatarPreview={avatarPreview}
          onChange={handleAvatarChange}
        />
        
        <ProfileForm
          fullName={formData.fullName}
          employeeId={formData.employeeId}
          location={formData.location}
          department={formData.department}
          bio={formData.bio}
          onChange={handleInputChange}
        />
        
        <ProfileFormActions
          isSaving={isSaving}
          onCancel={() => navigate('/profile')}
        />
      </form>
    </div>
  );
};

export default EditProfile;
