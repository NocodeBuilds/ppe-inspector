import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Share2, 
  Home, 
  Plus, 
  WifiOff, 
  MessageSquare, 
  Mail,
  Cloud,
  Download,
  Check
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useNetwork } from '@/hooks/useNetwork';
import { cn } from '@/lib/utils';
import LogoIcon from '../common/LogoIcon';
import { supabase } from '@/integrations/supabase/client';
import { fetchCompleteInspectionData, StandardInspectionData } from '@/utils/reportGenerator/reportDataFormatter';

type ReportFormat = 'pdf' | 'excel';
type ShareMethod = 'whatsapp' | 'email' | 'onedrive' | 'gdrive';
type ActionType = ReportFormat | ShareMethod;

interface ActionConfig {
  id: ActionType;
  label: string;
  icon: React.ReactNode;
  action: () => Promise<void>;
  requiresNetwork?: boolean;
  color?: string;
}

interface InspectionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: string;
  ppeId: string;
  onPDFDownload: (data: StandardInspectionData) => Promise<void>;
  onExcelDownload: (data: StandardInspectionData) => Promise<void>;
  onWhatsAppShare: () => Promise<void>;
  onEmailShare: () => Promise<void>;
}

const InspectionSuccessDialog: React.FC<InspectionSuccessDialogProps> = ({
  isOpen,
  onClose,
  inspectionId,
  ppeId,
  onPDFDownload,
  onExcelDownload,
  onWhatsAppShare,
  onEmailShare
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<ActionType | null>(null);
  const { isOnline } = useNetwork();
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>('pdf');
  const [inspectionData, setInspectionData] = useState<StandardInspectionData | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (isOpen && inspectionId) {
      fetchInspectionData();
    }
  }, [isOpen, inspectionId]);

  const fetchInspectionData = async () => {
    try {
      setIsDataLoading(true);
      const data = await fetchCompleteInspectionData(supabase, inspectionId);
      setInspectionData(data);
    } catch (error) {
      console.error('Error fetching inspection data:', error);
      toast({
        title: 'Data Loading Error',
        description: 'Could not load inspection details',
        variant: 'destructive',
      });
    } finally {
      setIsDataLoading(false);
    }
  };

  const downloadActions: ActionConfig[] = [
    {
      id: 'pdf',
      label: 'PDF',
      icon: <FileText className="h-7 w-7" />,
      action: async () => {
        if (!inspectionData) {
          toast({
            title: 'Missing Data',
            description: 'Inspection data not available',
            variant: 'destructive',
          });
          return;
        }
        await onPDFDownload(inspectionData);
      },
      color: 'text-red-400 hover:text-red-300'
    },
    {
      id: 'excel',
      label: 'Excel',
      icon: <FileSpreadsheet className="h-7 w-7" />,
      action: async () => {
        if (!inspectionData) {
          toast({
            title: 'Missing Data',
            description: 'Inspection data not available',
            variant: 'destructive',
          });
          return;
        }
        await onExcelDownload(inspectionData);
      },
      color: 'text-green-400 hover:text-green-300'
    }
  ];

  const createShareActions = (
    shareFormat: ReportFormat
  ): ActionConfig[] => [
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <MessageSquare className="h-7 w-7" />,
      action: async () => {
        if (!inspectionData) {
          toast({
            title: 'Missing Data',
            description: 'Inspection data not available',
            variant: 'destructive',
          });
          return;
        }
        
        await (shareFormat === 'pdf' ? onPDFDownload(inspectionData) : onExcelDownload(inspectionData));
        await onWhatsAppShare();
      },
      requiresNetwork: true,
      color: 'text-green-400 hover:text-green-300'
    },
    {
      id: 'email',
      label: 'Email',
      icon: <Mail className="h-7 w-7" />,
      action: async () => {
        if (!inspectionData) {
          toast({
            title: 'Missing Data',
            description: 'Inspection data not available',
            variant: 'destructive',
          });
          return;
        }
        
        await (shareFormat === 'pdf' ? onPDFDownload(inspectionData) : onExcelDownload(inspectionData));
        await onEmailShare();
      },
      requiresNetwork: true,
      color: 'text-blue-400 hover:text-blue-300'
    },
    {
      id: 'onedrive',
      label: 'OneDrive',
      icon: <Cloud className="h-7 w-7" />,
      action: async () => {
        if (!inspectionData) {
          toast({
            title: 'Missing Data',
            description: 'Inspection data not available',
            variant: 'destructive',
          });
          return;
        }
        
        await (shareFormat === 'pdf' ? onPDFDownload(inspectionData) : onExcelDownload(inspectionData));
        toast({
          title: "Coming Soon",
          description: "OneDrive sharing will be available soon",
        });
      },
      requiresNetwork: true,
      color: 'text-sky-400 hover:text-sky-300'
    },
    {
      id: 'gdrive',
      label: 'Google Drive',
      icon: <Cloud className="h-7 w-7" />,
      action: async () => {
        if (!inspectionData) {
          toast({
            title: 'Missing Data',
            description: 'Inspection data not available',
            variant: 'destructive',
          });
          return;
        }
        
        await (shareFormat === 'pdf' ? onPDFDownload(inspectionData) : onExcelDownload(inspectionData));
        toast({
          title: "Coming Soon",
          description: "Google Drive sharing will be available soon",
        });
      },
      requiresNetwork: true,
      color: 'text-yellow-400 hover:text-yellow-300'
    }
  ];

  const queueOfflineAction = async (actionId: ActionType) => {
    if (!('serviceWorker' in navigator) || !('SyncManager' in window)) {
      toast({
        title: "Offline Sync Not Available",
        description: "Your browser doesn't support background sync. Please try again when online.",
        variant: "destructive",
      });
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const syncManager = (registration as any).sync;
      
      if (syncManager) {
        await syncManager.register(`offline-action-${actionId}`);
        toast({
          title: "Queued for Sync",
          description: "This action will be performed when you're back online",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Failed to queue offline action:", error);
      toast({
        title: "Sync Failed",
        description: "Could not queue the action for offline sync",
        variant: "destructive",
      });
    }
  };

  const handleAction = async (config: ActionConfig) => {
    const { id, action, requiresNetwork } = config;
    setIsLoading(id);
    
    try {
      if (requiresNetwork && !isOnline) {
        toast({
          title: "Offline Mode",
          description: "This action requires an internet connection",
          variant: "default",
        });
        await queueOfflineAction(id);
      } else {
        await action();
        if (id === 'whatsapp' || id === 'email') {
          toast({
            title: `Shared via ${id === 'whatsapp' ? 'WhatsApp' : 'Email'}`,
            description: `Report shared in ${selectedFormat.toUpperCase()} format`,
          });
        }
      }
    } catch (error) {
      console.error(`Error during ${id}:`, error);
      toast({
        title: "Action Failed",
        description: `There was an error performing this action. ${isOnline ? '' : 'You might be offline.'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  const renderActionButton = (config: ActionConfig) => {
    const { id, label, icon, requiresNetwork, color } = config;
    const isActive = isLoading === id;
    
    return (
      <button 
        key={id}
        onClick={() => {
          if (id === 'pdf' || id === 'excel') {
            setSelectedFormat(id as ReportFormat);
          }
          handleAction(config);
        }}
        disabled={isLoading !== null || (requiresNetwork && !isOnline)}
        className={cn(
          "group relative flex flex-col items-center justify-center p-4 rounded-lg",
          "transition-all duration-200",
          "hover:bg-zinc-800/50",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "focus:outline-none focus:ring-2 focus:ring-green-500/20",
          isActive && "bg-green-500/10"
        )}
      >
        <div className={cn(
          "relative transition-transform duration-200",
          "group-hover:scale-110",
          color || "text-zinc-400",
          isActive && "text-green-400"
        )}>
          {icon}
          {isActive && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-current border-t-transparent" />
            </div>
          )}
        </div>
        <span className={cn(
          "mt-2 text-body-sm font-medium transition-colors duration-200",
          isActive ? "text-green-400" : "text-zinc-400 group-hover:text-zinc-300"
        )}>
          {isLoading === id ? (
            id === 'pdf' || id === 'excel' ? 'Downloading...' : 'Sharing...'
          ) : (
            label
          )}
        </span>
      </button>
    );
  };

  const currentShareActions = createShareActions(selectedFormat);

  return (
    <Dialog 
      open={isOpen}
      onOpenChange={(open) => {
        if (open) {
          onClose();
        }
      }}
      modal={true}
    >
      <DialogContent 
        className="sm:max-w-md bg-zinc-900 border-zinc-800 p-0"
        onPointerDownOutside={(e) => {
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <div className="relative min-h-[32rem]">
          {/* Success Animation */}
          <div className="absolute inset-0 flex items-center justify-center -mt-16">
            <div className="w-32 h-32 rounded-full bg-green-500/10 flex items-center justify-center animate-pulse">
              <Check className="w-16 h-16 text-green-500" />
            </div>
          </div>
          
          <div className="relative z-10 p-8">
            {/* Logo Section */}
            <div className="flex justify-center mb-10">
              <LogoIcon size="lg" className="h-24 w-24" />
            </div>

            <DialogHeader className="space-y-3">
              <DialogTitle className="h1 text-white text-center">
                Inspection Complete!
              </DialogTitle>
              <DialogDescription className="text-body-lg text-zinc-400 text-center">
                Download or share your report
                {!isOnline && (
                  <div className="mt-4 flex items-center justify-center text-amber-400 bg-amber-500/10 p-3 rounded-lg">
                    <WifiOff className="h-5 w-5 mr-2" />
                    <span className="text-body-sm">You're currently offline</span>
                  </div>
                )}
                {isDataLoading && (
                  <div className="mt-4 flex items-center justify-center text-blue-400 bg-blue-500/10 p-3 rounded-lg">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    <span className="text-body-sm">Loading inspection data...</span>
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="mt-10">
              <div className="space-y-8">
                <div>
                  <h3 className="text-overline text-zinc-400 mb-4 flex items-center">
                    <Download className="h-4 w-4 mr-2 text-zinc-500" />
                    Download as:
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {downloadActions.map(renderActionButton)}
                  </div>
                </div>

                <div>
                  <h3 className="text-overline text-zinc-400 mb-4 flex items-center">
                    <Share2 className="h-4 w-4 mr-2 text-zinc-500" />
                    Share via:
                  </h3>
                  <div className="grid grid-cols-4 gap-4">
                    {currentShareActions.map(renderActionButton)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <Button 
                variant="outline" 
                className="flex-1 bg-zinc-800/50 border-zinc-700 hover:bg-zinc-700 text-white py-6" 
                onClick={() => handleNavigate('/')}
                disabled={isLoading !== null || isDataLoading}
              >
                <Home className="mr-2 h-5 w-5" />
                <span className="text-body-sm">Home</span>
              </Button>
              <Button 
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-6"
                onClick={() => handleNavigate('/start-inspection')}
                disabled={isLoading !== null || isDataLoading}
              >
                <Plus className="mr-2 h-5 w-5" />
                <span className="text-body-sm">New Inspection</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InspectionSuccessDialog;
