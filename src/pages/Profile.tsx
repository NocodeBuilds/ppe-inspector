
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Edit, 
  User, 
  LogOut, 
  Shield, 
  ChevronRight,
  Building2,
  MapPin,
  Briefcase,
  UserCircle,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import PageHeader from '@/components/common/PageHeader';

const ProfileCard: React.FC = () => {
  const { user, profile, signOut, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-[200px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
        </div>
        
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    );
  }
  
  const getInitials = (name: string | null): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardContent className="p-0 space-y-6">
        <div className="flex items-start gap-5">
          <Avatar className="h-16 w-16 border">
            {profile?.avatar_url ? (
              <AvatarImage src={profile.avatar_url} alt={profile?.full_name || 'User'} />
            ) : (
              <AvatarFallback className="text-lg">
                {getInitials(profile?.full_name)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{profile?.full_name || 'User'}</h3>
            <p className="text-muted-foreground text-sm">{user?.email}</p>
            
            <div className="mt-1 flex items-center text-xs">
              <Shield className="h-3.5 w-3.5 mr-1 text-primary" />
              <span className="capitalize">{profile?.role || 'User'} Account</span>
            </div>
          </div>
          
          <Link to="/profile/edit">
            <Button size="sm" variant="outline" className="gap-1">
              <Edit className="h-4 w-4" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
          </Link>
        </div>
        
        <Separator />
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2 rounded-md">
              <UserCircle className="h-5 w-5 text-foreground/70" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Employee ID</p>
              <p className="font-medium">{profile?.employee_id || 'Not set'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2 rounded-md">
              <MapPin className="h-5 w-5 text-foreground/70" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Site Name</p>
              <p className="font-medium">{profile?.site_name || 'Not set'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2 rounded-md">
              <Building2 className="h-5 w-5 text-foreground/70" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="font-medium">{profile?.department || 'Not set'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-secondary p-2 rounded-md">
              <Briefcase className="h-5 w-5 text-foreground/70" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Employee Role</p>
              <p className="font-medium">{profile?.employee_role || 'Not set'}</p>
            </div>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          className="w-full justify-between text-left mt-4" 
          onClick={handleSignOut}
        >
          <div className="flex items-center">
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};

const Profile = () => {  
  return (
    <div className="pb-20 fade-in">
      <PageHeader title="Profile" />
      
      <div className="space-y-6">
        <ProfileCard />
      </div>
    </div>
  );
};

export default Profile;
