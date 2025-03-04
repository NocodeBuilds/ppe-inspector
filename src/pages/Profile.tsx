
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedProfile } from '@/contexts/AuthContext';
import { 
  User, Settings, LogOut, Mail, 
  Building, MapPin, Briefcase, 
  FileText, Download, Share2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, profile, signOut, extendedProfile, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    if (!extendedProfile) {
      refreshProfile();
    }
  }, [user, navigate, extendedProfile, refreshProfile]);
  
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
  
  const handleShare = () => {
    toast({
      title: 'Share',
      description: 'Sharing profile link is not implemented yet',
    });
  };
  
  const handleDownloadData = () => {
    toast({
      title: 'Download Data',
      description: 'Profile data download is not implemented yet',
    });
  };
  
  if (!user || !profile) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="fade-in space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>
      
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Your Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pt-2 pb-6">
          <Avatar className="h-24 w-24 mb-4">
            {profile.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile.full_name || 'User'} />
            ) : (
              <AvatarFallback className="text-4xl">
                <User className="h-12 w-12" />
              </AvatarFallback>
            )}
          </Avatar>
          
          <h2 className="text-xl font-bold mb-1">{profile.full_name || 'User'}</h2>
          <div className="flex items-center text-muted-foreground">
            <Mail className="h-4 w-4 mr-1" />
            <span>{user.email}</span>
          </div>
          
          <div className="mt-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
              {profile.role || 'User'}
            </span>
          </div>
        </CardContent>
        <Separator />
        <CardFooter className="justify-between pt-6">
          <Button variant="outline" onClick={handleEditProfile}>
            <Settings className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
          <Button variant="destructive" onClick={handleLogout} disabled={loading}>
            {loading ? (
              <div className="flex items-center">
                <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                Signing out...
              </div>
            ) : (
              <>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {extendedProfile ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Briefcase className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Employee ID</p>
                    <p className="text-sm text-muted-foreground">
                      {extendedProfile.employee_id || 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Building className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Department</p>
                    <p className="text-sm text-muted-foreground">
                      {extendedProfile.department || 'Not set'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {extendedProfile.location || 'Not set'}
                    </p>
                  </div>
                </div>
              </div>
              
              {extendedProfile.bio && (
                <div className="pt-2">
                  <Separator className="mb-4" />
                  <div className="flex">
                    <FileText className="h-5 w-5 mr-3 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Bio</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">
                        {extendedProfile.bio}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-4 text-center text-muted-foreground">
              <p>No additional information available.</p>
              <p className="mt-1 text-sm">
                <Button 
                  variant="link" 
                  className="p-0 h-auto" 
                  onClick={handleEditProfile}
                >
                  Add more details to your profile
                </Button>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleDownloadData}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Data
        </Button>
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={handleShare}
        >
          <Share2 className="h-4 w-4 mr-2" />
          Share Profile
        </Button>
      </div>
    </div>
  );
};

export default Profile;
