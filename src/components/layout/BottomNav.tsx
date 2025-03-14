
// src/components/layout/BottomNav.tsx - This file would need to be modified to include the analytics route
// but it wasn't provided in the current code files. This is a placeholder showing how it might be updated.

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Clipboard, Calendar, Settings, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  className?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  return (
    <div className={cn("fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t md:hidden", className)}>
      <div className="grid h-full max-w-lg grid-cols-5 mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
          end
        >
          <Home className="w-5 h-5 mb-1" />
          <span className="text-xs">Home</span>
        </NavLink>
        
        <NavLink
          to="/equipment"
          className={({ isActive }) =>
            cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <Clipboard className="w-5 h-5 mb-1" />
          <span className="text-xs">Equipment</span>
        </NavLink>
        
        <NavLink
          to="/start-inspection"
          className={({ isActive }) =>
            cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <Calendar className="w-5 h-5 mb-1" />
          <span className="text-xs">Inspect</span>
        </NavLink>
        
        <NavLink
          to="/analytics"
          className={({ isActive }) =>
            cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <BarChart3 className="w-5 h-5 mb-1" />
          <span className="text-xs">Analytics</span>
        </NavLink>
        
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "inline-flex flex-col items-center justify-center px-5 hover:bg-muted/50 group transition-colors",
              isActive ? "text-primary" : "text-muted-foreground"
            )
          }
        >
          <Settings className="w-5 h-5 mb-1" />
          <span className="text-xs">Settings</span>
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNav;
