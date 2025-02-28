
import { User, Mail, Key, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const handleLogout = () => {
    toast({
      title: 'Logout',
      description: 'You have been logged out',
    });
    // In a real app, we would redirect to the login page
  };
  
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <User size={40} className="text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold">John Smith</h2>
        <p className="text-sm text-muted-foreground">Administrator</p>
      </div>
      
      <div className="space-y-4">
        <div className="glass-card rounded-lg p-4">
          <div className="flex items-center">
            <Mail size={20} className="text-muted-foreground mr-3" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>john.smith@example.com</p>
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
