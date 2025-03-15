
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
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-fade-in" 
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col border border-border/30"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {title && (
          <div className="p-6 pb-3 border-b border-border/20 flex justify-between items-center">
            <h3 className="text-xl font-bold text-primary">{title}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full hover:bg-background/80" 
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
