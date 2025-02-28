
import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sun, Moon, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BottomNav from './BottomNav';
import { useToast } from '@/hooks/use-toast';

interface MainLayoutProps {
  title?: string;
}

const MainLayout = ({ title = 'PPE Inspector' }: MainLayoutProps) => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const { toast } = useToast();
  
  // Effect to set the initial theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else if (prefersDark) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };
  
  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications",
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border h-14 backdrop-blur-sm bg-opacity-80">
        <div className="flex items-center justify-between h-full px-4">
          <h1 className="text-xl font-bold">
            {title === 'PPE Inspector' ? (
              <span>
                <span className="text-primary">PPE</span> Inspector
              </span>
            ) : (
              title
            )}
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="transition-transform hover:scale-110">
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </Button>
            <Button variant="ghost" size="icon" onClick={handleNotificationClick} className="transition-transform hover:scale-110">
              <Bell size={20} />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 pt-14 pb-16 overflow-auto">
        <div className="container mx-auto px-4 py-6 max-w-xl">
          <Outlet />
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
};

export default MainLayout;
