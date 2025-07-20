
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { User, Settings, LogOut, Mail, Building, MapPin, Briefcase, FileText } from 'lucide-react';

const Profile = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Give a small delay before attempting to refresh profile
    if (!profile) {
      const timer = setTimeout(() => {
        refreshProfile();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, navigate, profile, refreshProfile]);
  
  const handleLogout = async () => {
    setLoading(true);
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditProfile = () => {
    navigate('/edit-profile');
  };
  
  if (!user) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Show basic profile info even if full profile isn't loaded yet
  const displayName = profile?.full_name || user.email?.split('@')[0] || 'User';
  const displayEmail = user.email || '';
  
  return (
    <div className="fade-in pb-28 md:pb-20 max-h-screen overflow-y-auto">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <div className="space-y-6 mt-6">
        <Card>
          {/* Main Profile Information */}
          <CardContent className="flex flex-col items-center pt-6">
            <Avatar className="h-24 w-24 mb-4">
              {profile?.avatar_url ? (
                <AvatarImage src={profile.avatar_url} alt={displayName} />
              ) : (
                <AvatarFallback className="text-4xl">
                  <User className="h-12 w-12" />
                </AvatarFallback>
              )}
            </Avatar>
            
            <h2 className="text-xl font-bold mb-1">{displayName}</h2>
            <div className="flex items-center text-muted-foreground mb-4">
              <Mail className="h-4 w-4 mr-1" />
              <span>{displayEmail}</span>
            </div>
          </CardContent>

          {profile && (
            <>
              <Separator />
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="space-y-3">
                  {profile.employee_id && (
                    <div className="flex items-center text-muted-foreground">
                      <FileText className="h-4 w-4 mr-2" />
                      <span className="text-muted-foreground/80">Employee ID:</span>
                      <span className="ml-2 text-foreground">{profile.employee_id}</span>
                    </div>
                  )}
                  
                  {profile.Employee_Role && (
                    <div className="flex items-center text-muted-foreground">
                      <Briefcase className="h-4 w-4 mr-2" />
                      <span className="text-muted-foreground/80">Role:</span>
                      <span className="ml-2 text-foreground">{profile.Employee_Role}</span>
                    </div>
                  )}
                  
                  {profile.department && (
                    <div className="flex items-center text-muted-foreground">
                      <Building className="h-4 w-4 mr-2" />
                      <span className="text-muted-foreground/80">Department:</span>
                      <span className="ml-2 text-foreground">{profile.department}</span>
                    </div>
                  )}
                  
                  {profile.site_name && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-muted-foreground/80">Site:</span>
                      <span className="ml-2 text-foreground">{profile.site_name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </>
          )}

          <Separator />

          {/* Actions */}
          <CardContent className="pt-6 flex flex-col gap-3">
            <Button variant="outline" onClick={handleEditProfile} className="w-full">
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button variant="destructive" onClick={handleLogout} disabled={loading} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
