
import React from "react";
import { cn } from "@/lib/utils";

interface CardOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  show: boolean;
  onClose?: () => void;
}

const CardOverlay = ({ 
  children, 
  show, 
  onClose, 
  className,
  ...props 
}: CardOverlayProps) => {
  if (!show) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
      {...props}
    >
      <div 
        className={cn(
          "glass-card max-w-md w-full p-6 rounded-lg animate-in fade-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto",
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default CardOverlay;
