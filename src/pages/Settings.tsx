
import { useState } from 'react';
import { Sun, Moon, Bell, Wifi, Download, Trash2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  const [autoUpdate, setAutoUpdate] = useState(true);
  
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle('dark', checked);
    localStorage.setItem('theme', checked ? 'dark' : 'light');
  };
  
  const handlePushNotificationsToggle = (checked: boolean) => {
    setPushNotifications(checked);
    if (checked) {
      requestNotificationPermission();
    }
  };
  
  const requestNotificationPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast({
          title: 'Notifications enabled',
          description: 'You will now receive push notifications',
        });
      } else {
        setPushNotifications(false);
        toast({
          title: 'Notifications blocked',
          description: 'Please enable notifications in your browser settings',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };
  
  const handleClearData = () => {
    toast({
      title: 'Clear data',
      description: 'All app data has been cleared',
    });
  };
  
  return (
    <div className="fade-in">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="glass-card rounded-lg p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Appearance</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {darkMode ? <Moon size={20} className="mr-3" /> : <Sun size={20} className="mr-3" />}
                <span>Dark Mode</span>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={handleDarkModeToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell size={20} className="mr-3" />
                <span>Push Notifications</span>
              </div>
              <Switch 
                checked={pushNotifications} 
                onCheckedChange={handlePushNotificationsToggle}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <h2 className="text-xl font-semibold mb-4">Data & Storage</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Wifi size={20} className="mr-3" />
                  <span>Offline Mode</span>
                </div>
                <Switch 
                  checked={offlineMode} 
                  onCheckedChange={setOfflineMode}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Download size={20} className="mr-3" />
                  <span>Auto Update</span>
                </div>
                <Switch 
                  checked={autoUpdate} 
                  onCheckedChange={setAutoUpdate}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
              
              <Button 
                variant="outline" 
                className="w-full mt-4 text-muted-foreground border-muted"
                onClick={handleClearData}
              >
                <Trash2 size={16} className="mr-2" />
                Clear App Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
