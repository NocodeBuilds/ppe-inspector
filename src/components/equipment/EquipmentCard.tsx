
import { Download, Edit } from 'lucide-react';
import { PPEItem } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EquipmentCardProps {
  item: PPEItem;
  type: 'expiring' | 'upcoming' | 'equipment';
  onEdit?: () => void;
  onDownload?: () => void;
  onInspect?: () => void;  // Added the onInspect prop
}

const EquipmentCard = ({ item, type, onEdit, onDownload, onInspect }: EquipmentCardProps) => {
  const borderColor = 
    type === 'expiring' ? 'border-danger/50' : 
    type === 'upcoming' ? 'border-warning/50' : 
    'border-border';
  
  const statusIcon = 
    type === 'expiring' ? (
      <div className="w-10 h-10 bg-danger/20 text-danger rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <path d="M12 9v4"></path>
          <path d="M12 17h.01"></path>
        </svg>
      </div>
    ) : (
      <div className="w-10 h-10 bg-warning/20 text-warning rounded-lg flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
          <line x1="16" x2="16" y1="2" y2="6"></line>
          <line x1="8" x2="8" y1="2" y2="6"></line>
          <line x1="3" x2="21" y1="10" y2="10"></line>
          <path d="M8 14h.01"></path>
          <path d="M12 14h.01"></path>
          <path d="M16 14h.01"></path>
          <path d="M8 18h.01"></path>
          <path d="M12 18h.01"></path>
          <path d="M16 18h.01"></path>
        </svg>
      </div>
    );

  const getStatusText = () => {
    if (type === 'expiring') {
      return `Expired: ${new Date(item.expiryDate).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })}`;
    } else if (type === 'upcoming') {
      return `Due: ${item.nextInspection ? new Date(item.nextInspection).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }) : 'Unknown'}`;
    } else {
      return `Brand: ${item.brand}`;
    }
  };

  return (
    <div className={cn(
      'glass-card rounded-lg p-4 my-3 transition-all duration-300 hover:shadow-lg',
      borderColor
    )}>
      <div className="flex items-center gap-4">
        {type !== 'equipment' && statusIcon}
        <div className="flex-1">
          <h3 className="font-semibold">{item.type}</h3>
          <p className="text-sm text-muted-foreground">{item.serialNumber}</p>
          <p className="text-sm">{getStatusText()}</p>
        </div>
        <div className="flex gap-2">
          {onInspect && (
            <Button variant="default" size="icon" onClick={onInspect} className="bg-primary text-primary-foreground h-10 w-10">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M16 13H8"></path>
                <path d="M16 17H8"></path>
                <path d="M10 9H8"></path>
              </svg>
            </Button>
          )}
          {onDownload && (
            <Button variant="outline" size="icon" onClick={onDownload} className="bg-background h-10 w-10">
              <Download size={20} />
            </Button>
          )}
          {onEdit && (
            <Button variant="default" size="icon" onClick={onEdit} className="bg-primary text-primary-foreground h-10 w-10">
              <Edit size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
