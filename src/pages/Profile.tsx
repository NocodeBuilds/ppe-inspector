import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import ProfileSkeleton from '@/components/profile/ProfileSkeleton';
import { format } from 'date-fns';

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  // Replace any reference to Employee_Role with employee_role
  const renderRoleBadge = (role: string) => {
    let badgeColor = 'bg-gray-500'; // Default color
    
    switch (role.toLowerCase()) {
      case 'admin':
        badgeColor = 'bg-red-500';
        break;
      case 'manager':
        badgeColor = 'bg-blue-500';
        break;
      case 'user':
        badgeColor = 'bg-green-500';
        break;
      default:
        badgeColor = 'bg-gray-500';
        break;
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badgeColor} text-white`}>
        {role}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <p>Please log in to view your profile</p>
            <Button onClick={() => navigate('/login')} className="mt-4">Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <CardHeader className="flex-row justify-between items-center space-y-0 gap-4">
        <CardTitle className="text-2xl font-bold">Profile</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/edit-profile')}>
            Edit Profile
          </Button>
          <Button variant="destructive" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="h-20 w-20 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-2xl font-bold text-muted-foreground">
                    {profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-xl font-semibold">{profile.full_name || 'User'}</h3>
                <p className="text-muted-foreground">{profile.email || user.email}</p>
                {profile.role && renderRoleBadge(profile.role)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details Card */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">User Details</h3>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Employee ID</dt>
                <dd className="mt-1">{profile.employee_id || 'Not set'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Site</dt>
                <dd className="mt-1">{profile.site_name || 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Department</dt>
                <dd className="mt-1">{profile.department || 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Role</dt>
                <dd className="mt-1">{profile.employee_role || 'Not assigned'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Mobile</dt>
                <dd className="mt-1">{profile.mobile || 'Not provided'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Member Since</dt>
                <dd className="mt-1">
                  {profile.created_at
                    ? format(new Date(profile.created_at), 'MMM dd, yyyy')
                    : 'Unknown'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
