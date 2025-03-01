
import React, { useState, useEffect } from 'react';
import { User, Mail, Key, LogOut, Edit, Briefcase, MapPin, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ExtendedProfile {
  employee_id: string;
  location: string;
  department: string;
  bio: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const [extendedProfile, setExtendedProfile] = useState<ExtendedProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (profile?.id) {
      fetchExtendedProfile();
    } else {
      setIsLoading(false);
    }
  }, [profile]);
  
  const fetchExtendedProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('extended_profiles')
        .select('*')
        .eq('user_id', profile?.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
        throw error;
      }
      
      setExtendedProfile(data || null);
    } catch (error: any) {
      console.error('Error fetching extended profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error: any) {
      toast({
        title: 'Logout Failed',
        description: error.message || 'An error occurred during logout',
        variant: 'destructive',
      });
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Profile</h1>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/edit-profile')}
          className="flex items-center gap-1"
        >
          <Edit size={16} />
          Edit
        </Button>
      </div>
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4 overflow-hidden">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <User size={40} className="text-muted-foreground" />
          )}
        </div>
        <h2 className="text-xl font-semibold">{profile?.full_name || 'User'}</h2>
        <p className="text-sm text-muted-foreground capitalize">{profile?.role || 'User'}</p>
      </div>
      
      <div className="space-y-4">
        {extendedProfile?.employee_id && (
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center">
              <Briefcase size={20} className="text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Employee ID</p>
                <p>{extendedProfile.employee_id}</p>
              </div>
            </div>
          </div>
        )}
        
        {extendedProfile?.location && (
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center">
              <MapPin size={20} className="text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Location</p>
                <p>{extendedProfile.location}</p>
              </div>
            </div>
          </div>
        )}
        
        {extendedProfile?.department && (
          <div className="glass-card rounded-lg p-4">
            <div className="flex items-center">
              <Building size={20} className="text-muted-foreground mr-3" />
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p>{extendedProfile.department}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center">
            <Mail size={20} className="text-muted-foreground mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{profile?.email || 'Email not available'}</p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-start h-auto py-4 px-4"
          onClick={() => {
            toast({
              title: 'Change Password',
              description: 'Password change functionality coming soon',
            });
          }}
        >
          <Key size={20} className="text-muted-foreground mr-3" />
          <div className="text-left">
            <p>Change Password</p>
          </div>
        </Button>
        
        <Button 
          variant="destructive" 
          className="w-full mt-8"
          onClick={handleLogout}
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Profile;
