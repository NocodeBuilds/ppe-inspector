
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CardOverlayProps {
  show: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  padding?: string;
}

const CardOverlay: React.FC<CardOverlayProps> = ({
  show,
  onClose,
  title,
  children,
  padding = 'p-6',
}) => {
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`bg-card rounded-lg shadow-lg max-w-md w-full max-h-[90vh] flex flex-col border border-border/40`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {title && (
          <div className="p-6 pb-2 border-b flex justify-between items-center">
            <h3 className="text-lg font-medium">{title}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full" 
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </div>
        )}
        
        <ScrollArea className="flex-1 overflow-auto">
          <div className={padding}>
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CardOverlay;
