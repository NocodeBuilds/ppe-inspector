
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

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
  padding = 'p-4',
}) => {
  const isMobile = useIsMobile();
  
  if (!show) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className={`bg-card rounded-lg shadow-lg max-w-md w-full max-h-[95vh] flex flex-col border border-border/40`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
      >
        {title && (
          <div className="p-3 pb-2 border-b flex justify-between items-center">
            <h3 className="text-base font-medium">{title}</h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7 rounded-full" 
              onClick={onClose}
            >
              <X size={16} />
            </Button>
          </div>
        )}
        
        <ScrollArea className="flex-1 overflow-auto">
          <div className={isMobile ? "p-3" : padding}>
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default CardOverlay;
