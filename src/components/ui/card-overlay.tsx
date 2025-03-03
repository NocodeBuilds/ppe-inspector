
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CardOverlayProps {
  show: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
}

const CardOverlay: React.FC<CardOverlayProps> = ({
  show,
  onClose,
  children,
  title,
  showCloseButton = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Small delay for animation
    let timer: ReturnType<typeof setTimeout>;
    
    if (show) {
      setIsVisible(true);
    } else {
      timer = setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [show]);
  
  if (!show && !isVisible) {
    return null;
  }
  
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm transition-opacity duration-300 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto transition-transform duration-300 ${
          show ? 'scale-100' : 'scale-95'
        }`}
      >
        {(title || showCloseButton) && (
          <div className="flex justify-between items-center p-4 border-b">
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8"
              >
                <X size={18} />
              </Button>
            )}
          </div>
        )}
        <div className="p-4">{children}</div>
      </Card>
    </div>
  );
};

export default CardOverlay;
