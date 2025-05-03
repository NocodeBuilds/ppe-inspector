
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useProfileForm } from '@/hooks/useProfileForm';
import { useToast } from '@/hooks/use-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const {
    formData,
    handleInputChange,
    isLoading,
    isSaving,
    profile,
    avatarPreview,
    handleAvatarChange,
    handleSubmit
  } = useProfileForm();
  
  const { toast } = useToast();

  if (isLoading) {
    return <div className="container max-w-2xl mx-auto py-8 px-4">Loading...</div>;
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Edit Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-center">
              <Avatar className="w-20 h-20">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Profile" />
                ) : (
                  <AvatarImage src={profile?.avatar_url || ''} alt="Profile" />
                )}
                <AvatarFallback>{formData.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar" className="block text-sm font-medium">
                  Profile Photo
                </Label>
                <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} />
              </div>
            </div>
            
            <Separator />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name || ''}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <Input
                  id="mobile"
                  name="mobile"
                  value={formData.mobile || ''}
                  onChange={handleInputChange}
                  placeholder="Your mobile number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee_id">Employee ID</Label>
                <Input
                  id="employee_id"
                  name="employee_id"
                  value={formData.employee_id || ''}
                  onChange={handleInputChange}
                  placeholder="Your employee ID"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employee_role">Role</Label>
                <Input
                  id="employee_role"
                  name="employee_role"
                  value={formData.employee_role || ''}
                  onChange={handleInputChange}
                  placeholder="Your role"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={formData.department || ''}
                  onChange={handleInputChange}
                  placeholder="Your department"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="site_name">Site</Label>
                <Input
                  id="site_name"
                  name="site_name"
                  value={formData.site_name || ''}
                  onChange={handleInputChange}
                  placeholder="Your site location"
                />
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditProfile;
