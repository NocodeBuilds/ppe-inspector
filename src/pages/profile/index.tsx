import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  Bell, 
  Camera, 
  Key, 
  LogOut, 
  Moon, 
  Save, 
  Shield, 
  Sun, 
  User as UserIcon
} from 'lucide-react';

import { useAuth } from '@/hooks/use-auth.tsx';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch, SwitchField } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

export function ProfilePage() {
  const { user, updateProfile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // User profile state
  const [profileData, setProfileData] = React.useState({
    firstName: user?.user_metadata?.firstName || '',
    lastName: user?.user_metadata?.lastName || '',
    email: user?.email || '',
    jobTitle: user?.user_metadata?.jobTitle || '',
    department: user?.user_metadata?.department || '',
    phone: user?.user_metadata?.phone || '',
    bio: user?.user_metadata?.bio || '',
  });
  
  // Settings state
  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    autoSave: true,
    twoFactorAuth: false,
  });
  
  // Password change dialog
  const [passwordDialog, setPasswordDialog] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = React.useState<Record<string, string>>({});
  
  // Logout confirmation dialog
  const [logoutDialog, setLogoutDialog] = React.useState(false);
  
  // Handle profile form changes
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };
  
  // Handle settings changes
  const handleSettingChange = (name: string, value: boolean) => {
    setSettings({
      ...settings,
      [name]: value,
    });
    
    // In a real app, this would save the setting to the user's profile
    toast({
      title: 'Setting Updated',
      description: `${name} has been ${value ? 'enabled' : 'disabled'}`,
      variant: 'success',
    });
  };
  
  // Handle password form changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
    
    // Clear error when user types
    if (passwordErrors[name]) {
      const newErrors = { ...passwordErrors };
      delete newErrors[name];
      setPasswordErrors(newErrors);
    }
  };
  
  // Validate and save profile
  const handleSaveProfile = async () => {
    try {
      // In a real app, this would call the updateProfile method with proper validation
      await updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        jobTitle: profileData.jobTitle,
        department: profileData.department,
        phone: profileData.phone,
        bio: profileData.bio,
      });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'There was an error updating your profile. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Validate and change password
  const handleChangePassword = () => {
    const newErrors: Record<string, string> = {};
    
    // Validate current password
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // Validate new password
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    // Validate confirm password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }
    
    // In a real app, this would call an API to change the password
    toast({
      title: 'Password Changed',
      description: 'Your password has been updated successfully',
      variant: 'success',
    });
    
    setPasswordDialog(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
  };
  
  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
      navigate({ to: '/auth/login' });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Logout Failed',
        description: 'There was an error signing out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-body text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="col-span-1">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                  {user?.user_metadata?.avatar ? (
                    <img 
                      src={user.user_metadata.avatar} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="h-12 w-12 text-muted-foreground" />
                  )}
                </div>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className="absolute bottom-0 right-0 rounded-full"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              
              <h2 className="text-xl font-semibold">
                {profileData.firstName} {profileData.lastName}
              </h2>
              <p className="text-body-sm text-muted-foreground">
                {profileData.jobTitle || 'No job title set'}
              </p>
              
              <div className="mt-4 w-full">
                <Badge className="w-full py-1 mb-2" variant="outline">
                  Inspector
                </Badge>
                <p className="text-body-sm text-muted-foreground mt-2">
                  Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                </p>
              </div>
              
              <Button 
                variant="destructive" 
                className="mt-6 w-full" 
                onClick={() => setLogoutDialog(true)}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 md:col-span-3">
          <Tabs defaultValue="profile">
            <TabsList className="mb-6">
              <TabsTrigger value="profile">
                <UserIcon className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger value="preferences">
                <Bell className="h-4 w-4 mr-2" />
                Preferences
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        value={profileData.email}
                        disabled
                        className="bg-muted/50"
                      />
                      <p className="text-body-sm text-muted-foreground">
                        Email cannot be changed. Contact an administrator for assistance.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleProfileChange}
                        placeholder="e.g. +1 (123) 456-7890"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="jobTitle">Job Title</Label>
                      <Input
                        id="jobTitle"
                        name="jobTitle"
                        value={profileData.jobTitle}
                        onChange={handleProfileChange}
                        placeholder="e.g. Safety Inspector"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        name="department"
                        value={profileData.department}
                        onChange={handleProfileChange}
                        placeholder="e.g. Safety & Compliance"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      value={profileData.bio}
                      onChange={handleProfileChange}
                      placeholder="A short bio about yourself..."
                      rows={4}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-body font-medium">Password</h3>
                      <p className="text-body-sm text-muted-foreground">
                        Change your account password
                      </p>
                    </div>
                    <Button variant="outline" onClick={() => setPasswordDialog(true)}>
                      <Key className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between border-b pb-4">
                    <div>
                      <h3 className="text-body font-medium">Two-Factor Authentication</h3>
                      <p className="text-body-sm text-muted-foreground">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Switch 
                      checked={settings.twoFactorAuth}
                      onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pb-4">
                    <div>
                      <h3 className="text-body font-medium">Sessions</h3>
                      <p className="text-body-sm text-muted-foreground">
                        Manage your active sessions
                      </p>
                    </div>
                    <Button variant="outline">
                      Manage Sessions
                    </Button>
                  </div>
                  
                  <Alert className="mt-4">
                    <AlertDescription className="flex flex-col text-body-sm">
                      <p className="font-medium mb-1">
                        Last sign in: 
                      </p>
                      <p>
                        {new Date().toLocaleString()} • IP: 192.168.1.1
                      </p>
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>
                    Customize your notification and display preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4 border-b pb-4">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    
                    <SwitchField 
                      label="Email Notifications"
                      description="Receive email notifications for inspections, reports, and system updates"
                      checked={settings.emailNotifications}
                      onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                    />
                    
                    <SwitchField 
                      label="Push Notifications"
                      description="Receive push notifications on your device for important alerts"
                      checked={settings.pushNotifications}
                      onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                    />
                  </div>
                  
                  <div className="space-y-4 border-b pb-4">
                    <h3 className="text-lg font-medium">Display</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-body font-medium">Theme</p>
                        <p className="text-body-sm text-muted-foreground">
                          Choose between light and dark mode
                        </p>
                      </div>
                      <Select
                        value={settings.darkMode ? 'dark' : 'light'}
                        onValueChange={(value) => handleSettingChange('darkMode', value === 'dark')}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select theme" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">
                            <div className="flex items-center">
                              <Sun className="h-4 w-4 mr-2" />
                              Light
                            </div>
                          </SelectItem>
                          <SelectItem value="dark">
                            <div className="flex items-center">
                              <Moon className="h-4 w-4 mr-2" />
                              Dark
                            </div>
                          </SelectItem>
                          <SelectItem value="system">
                            <div className="flex items-center">
                              System Default
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Other Preferences</h3>
                    
                    <SwitchField 
                      label="Auto-Save Drafts"
                      description="Automatically save inspection drafts as you work"
                      checked={settings.autoSave}
                      onCheckedChange={(checked) => handleSettingChange('autoSave', checked)}
                    />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-body font-medium">Language</p>
                        <p className="text-body-sm text-muted-foreground">
                          Select your preferred language
                        </p>
                      </div>
                      <Select defaultValue="en">
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                          <SelectItem value="fr">Français</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className={passwordErrors.currentPassword ? "border-destructive" : ""}
              />
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive">{passwordErrors.currentPassword}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className={passwordErrors.newPassword ? "border-destructive" : ""}
              />
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">{passwordErrors.newPassword}</p>
              )}
              <p className="text-body-sm text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className={passwordErrors.confirmPassword ? "border-destructive" : ""}
              />
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordErrors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword}>
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialog} onOpenChange={setLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription>
              Are you sure you want to sign out?
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Sign Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePage;
