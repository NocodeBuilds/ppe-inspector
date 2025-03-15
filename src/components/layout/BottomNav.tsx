
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  BarChart3, 
  Plus, 
  Settings, 
  User 
} from 'lucide-react';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: <Home size={20} />,
    },
    {
      name: 'Analytics',
      path: '/analytics',
      icon: <BarChart3 size={20} />,
    },
    {
      name: 'Inspect',
      path: '/start-inspection',
      icon: <Plus size={24} />,
      primary: true,
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings size={20} />,
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User size={20} />,
    },
  ];
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background backdrop-blur-sm">
      <div className="max-w-5xl mx-auto px-3 py-1 flex items-center justify-around">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant="ghost"
            size={item.primary ? 'default' : 'sm'}
            onClick={() => navigate(item.path)}
            className={`flex-col justify-center items-center ${
              item.primary 
                ? 'w-14 h-14 rounded-full shadow-md bg-primary hover:bg-primary/90 text-primary-foreground -mt-5' 
                : 'h-16 text-xs rounded-none gap-1'
            } ${isActive(item.path) && !item.primary ? 'bg-muted text-foreground' : ''}`}
          >
            {item.icon}
            {!item.primary && <span>{item.name}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default BottomNav;
