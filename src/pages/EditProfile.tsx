
import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const EditProfile = () => {
  const navigate = useNavigate();
  const { formData, handleInputChange, isLoading, isSaving, error } = useProfile();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Assuming updateProfile is provided by the profile hook context
      const { data, error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          mobile: formData.mobile,
          site_name: formData.site_name,
          department: formData.department,
          employee_id: formData.employee_id,
          employee_role: formData.employee_role,
        })
        .eq('id', formData.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
      
      navigate('/settings');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      toast({
        title: 'Update Failed',
        description: err.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `avatars/${formData.id}-${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, { upsert: true });
        
      if (uploadError) {
        throw uploadError;
      }
      
      const { data: urlData } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);
        
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', formData.id);
        
      if (updateError) {
        throw updateError;
      }
      
      // Update local state
      handleInputChange({
        target: { name: 'avatar_url', value: urlData.publicUrl }
      } as ChangeEvent<HTMLInputElement>);
      
      toast({
        title: 'Avatar Updated',
        description: 'Your profile picture has been updated.',
      });
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload avatar. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
                <AvatarImage src={formData.avatar_url || ''} alt="Profile" />
                <AvatarFallback>{formData.full_name?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar" className="block text-sm font-medium">
                  Profile Photo
                </Label>
                <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarUpload} />
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
