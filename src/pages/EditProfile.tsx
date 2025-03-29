import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useProfileForm } from '@/hooks/useProfileForm';
import AvatarUpload from '@/components/profile/AvatarUpload';
import ProfileForm from '@/components/profile/ProfileForm';
import ProfileFormActions from '@/components/profile/ProfileFormActions';
import { ScrollArea } from '@/components/ui/scroll-area';

const EditProfile = () => {
  const {
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
  } = useProfileForm();
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="fade-in pb-20">
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
      
      <ScrollArea className="h-[calc(100vh-180px)] pr-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <AvatarUpload 
            avatarUrl={profile?.avatar_url || null}
            avatarPreview={avatarPreview}
            onChange={handleAvatarChange}
          />
          
          <ProfileForm
            fullName={formData.fullName}
            employeeId={formData.employeeId}
            siteName={formData.siteName}
            department={formData.department}
            Employee_Role={formData.Employee_Role}
            onChange={handleInputChange}
            onSelectChange={handleSelectChange}
          />
          
          <ProfileFormActions
            isSaving={isSaving}
            onCancel={() => navigate('/profile')}
          />
        </form>
      </ScrollArea>
    </div>
  );
};

export default EditProfile;
