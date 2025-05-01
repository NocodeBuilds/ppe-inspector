
import React from 'react';
import { Download, Edit, FileText } from 'lucide-react';
import { PPEItem } from '@/types';
import { Button } from '@/components/ui/button';
import { ItemCard } from '@/components/ui/item-card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { generatePPEItemReport } from '@/utils/reportGeneratorService';

interface StandardEquipmentCardProps {
  item: PPEItem;
  type: 'expiring' | 'upcoming' | 'equipment' | 'flagged';
  onEdit?: () => void;
  onInspect?: () => void;
}

const StandardEquipmentCard: React.FC<StandardEquipmentCardProps> = ({ 
  item, 
  type, 
  onEdit, 
  onInspect 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const getStatusIcon = () => {
    if (type === 'expiring') {
      return (
        <div className="w-8 h-8 bg-destructive/20 text-destructive rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
            <path d="M12 9v4"></path>
            <path d="M12 17h.01"></path>
          </svg>
        </div>
      );
    } else if (type === 'upcoming') {
      return (
        <div className="w-8 h-8 bg-warning/20 text-warning rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
            <line x1="16" x2="16" y1="2" y2="6"></line>
            <line x1="8" x2="8" y1="2" y2="6"></line>
            <line x1="3" x2="21" y1="10" y2="10"></line>
          </svg>
        </div>
      );
    } else if (type === 'flagged') {
      return (
        <div className="w-8 h-8 bg-destructive/20 text-destructive rounded-lg flex items-center justify-center flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>
      );
    } 
    return null;
  };

  const getStatusText = () => {
    if (type === 'expiring') {
      return 'expired';
    } else if (type === 'upcoming') {
      return 'inspection due';
    } else if (type === 'flagged') {
      return 'flagged';
    } else {
      return item.status;
    }
  };

  const getDate = () => {
    if (type === 'expiring') {
      return item.expiryDate;
    } else if (type === 'upcoming') {
      return item.nextInspection;
    } else {
      return null;
    }
  };

  const getDateLabel = () => {
    if (type === 'expiring') {
      return 'Expires';
    } else if (type === 'upcoming') {
      return 'Due';
    } else {
      return 'Date';
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

  const actions = (
    <>
      {(type === 'upcoming' || type === 'equipment') && (
        <Button variant="default" size="icon" onClick={handleInspect} className="bg-primary text-primary-foreground h-8 w-8 flex-shrink-0">
          <FileText size={16} />
        </Button>
      )}
      <Button variant="outline" size="icon" onClick={handleDownloadReport} className="bg-background h-8 w-8 flex-shrink-0">
        <Download size={16} />
      </Button>
      {onEdit && (
        <Button variant="default" size="icon" onClick={onEdit} className="bg-primary text-primary-foreground h-8 w-8 flex-shrink-0">
          <Edit size={16} />
        </Button>
      )}
    </>
  );

  return (
    <ItemCard
      title={item.type}
      subtitle={`SN: ${item.serialNumber}`}
      status={getStatusText()}
      date={getDate()}
      dateLabel={getDateLabel()}
      icon={getStatusIcon()}
      actions={actions}
    />
  );
};

export default StandardEquipmentCard;
