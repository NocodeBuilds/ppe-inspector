
import { Download, Edit, FileText } from 'lucide-react';
import { PPEItem } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { generatePPEItemReport } from '@/utils/reportGeneratorService';
import { useToast } from '@/hooks/use-toast';

interface EquipmentCardProps {
  item: PPEItem;
  type: 'expiring' | 'upcoming' | 'equipment' | 'flagged';
  onEdit?: () => void;
  onInspect?: () => void;
}

const EquipmentCard = ({ item, type, onEdit, onInspect }: EquipmentCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const borderColor = 
    type === 'expiring' ? 'border-destructive/50' : 
    type === 'upcoming' ? 'border-warning/50' : 
    type === 'flagged' ? 'border-destructive/70' :
    'border-primary/30';

  const statusIcon = 
    type === 'expiring' ? (
      <div className="w-10 h-10 bg-destructive/20 text-destructive rounded-lg flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <path d="M12 9v4"></path>
          <path d="M12 17h.01"></path>
        </svg>
      </div>
    ) : type === 'upcoming' ? (
      <div className="w-10 h-10 bg-warning/20 text-warning rounded-lg flex items-center justify-center flex-shrink-0">
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
    ) : type === 'flagged' ? (
      <div className="w-10 h-10 bg-destructive/20 text-destructive rounded-lg flex items-center justify-center flex-shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0-3.42 0z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
    ) : null;

  const getStatusText = () => {
    if (type === 'expiring') {
      return `Expires: ${new Date(item.expiryDate).toLocaleDateString('en-US', {
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
    } else if (type === 'flagged') {
      return `Flagged: ${item.status === 'flagged' ? 'Failed inspection' : 'Unknown reason'}`;
    } else {
      return `Brand: ${item.brand}`;
    }
  };

  const handleDownloadReport = async () => {
    try {
      toast({
        title: "Generating report",
        description: "Please wait while we generate the report...",
      });
      
      await generatePPEItemReport(item.id);
      
      toast({
        title: "Report downloaded",
        description: "The PPE report has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading report:", error);
      toast({
        title: "Error",
        description: "Failed to download report. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInspect = () => {
    if (onInspect) {
      onInspect();
    } else {
      navigate(`/inspect/${item.id}`);
    }
  };

  return (
    <div className={cn(
      'h-[120px] glass-card rounded-lg p-4 my-3 transition-all duration-300 hover:shadow-lg border-2 flex',
      borderColor
    )}>
      <div className="flex items-center gap-4 w-full h-full overflow-hidden">
        {statusIcon}
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className="font-semibold truncate">{item.type}</h3>
          <p className="text-sm text-muted-foreground truncate">SN: {item.serialNumber}</p>
          <p className="text-sm truncate">{getStatusText()}</p>
        </div>
        <div className="flex-shrink-0 flex gap-2">
          {(type === 'upcoming' || type === 'equipment') && (
            <Button variant="default" size="icon" onClick={handleInspect} className="bg-primary text-primary-foreground h-10 w-10 flex-shrink-0">
              <FileText size={20} />
            </Button>
          )}
          <Button variant="outline" size="icon" onClick={handleDownloadReport} className="bg-background h-10 w-10 flex-shrink-0">
            <Download size={20} />
          </Button>
          {onEdit && (
            <Button variant="default" size="icon" onClick={onEdit} className="bg-primary text-primary-foreground h-10 w-10 flex-shrink-0">
              <Edit size={20} />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EquipmentCard;
