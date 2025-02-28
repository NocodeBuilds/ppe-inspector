
import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Clipboard, User, Settings } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/equipment', label: 'Equipment', icon: Clipboard },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border h-16 backdrop-blur-sm bg-opacity-80">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center w-1/4 h-full transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon size={24} className={isActive ? 'animate-pulse-glow' : ''} />
              <span className="text-xs mt-1">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
