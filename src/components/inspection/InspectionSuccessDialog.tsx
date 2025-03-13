
import React, { useState } from 'react';
import { X, FileText, Download, MessageSquare, Mail, Home, Plus, WifiOff } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useNetwork } from '@/hooks/useNetwork';

interface InspectionSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  inspectionId: string;
  ppeId: string;
  onPDFDownload: () => void;
  onExcelDownload: () => void;
  onWhatsAppShare: () => void;
  onEmailShare: () => void;
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
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const { isOnline } = useNetwork();
  
  console.log('InspectionSuccessDialog rendered with isOpen:', isOpen, 'isOnline:', isOnline);

  const handleAction = async (
    action: () => void | Promise<void>, 
    actionName: string,
    requiresNetwork: boolean = false
  ) => {
    setIsLoading(actionName);
    
    try {
      // Check if network is required but unavailable
      if (requiresNetwork && !isOnline) {
        toast({
          title: "Offline Mode",
          description: "This action requires an internet connection. It will be queued for when you're back online.",
          variant: "warning",
        });
        
        // Request sync when back online
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('sync-offline-reports');
          
          toast({
            title: "Queued for Sync",
            description: "This action will be performed when you're back online",
            variant: "default",
          });
        }
      } else {
        // Execute the action
        await action();
      }
    } catch (error) {
      console.error(`Error during ${actionName}:`, error);
      toast({
        title: "Action Failed",
        description: `There was an error performing this action. ${isOnline ? '' : 'You might be offline.'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md bg-zinc-900 text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Inspection Submitted Successfully!</DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose how you would like to share the inspection report or start a new inspection.
            {!isOnline && (
              <div className="mt-2 flex items-center text-amber-400">
                <WifiOff className="h-4 w-4 mr-2" />
                <span>You're currently offline. Some features may be limited.</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="absolute right-4 top-4">
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-zinc-800 hover:bg-zinc-800" 
            onClick={() => handleAction(onPDFDownload, "pdf")}
            disabled={isLoading !== null}
          >
            {isLoading === "pdf" ? (
              <span className="animate-pulse">Generating...</span>
            ) : (
              <>
                <FileText className="mr-2 h-5 w-5" />
                PDF
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-zinc-800 hover:bg-zinc-800" 
            onClick={() => handleAction(onExcelDownload, "excel")}
            disabled={isLoading !== null}
          >
            {isLoading === "excel" ? (
              <span className="animate-pulse">Generating...</span>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Excel
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-zinc-800 hover:bg-zinc-800" 
            onClick={() => handleAction(onWhatsAppShare, "whatsapp", true)}
            disabled={isLoading !== null || !isOnline}
          >
            {isLoading === "whatsapp" ? (
              <span className="animate-pulse">Sharing...</span>
            ) : (
              <>
                <MessageSquare className="mr-2 h-5 w-5" />
                WhatsApp
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start text-white border-zinc-800 hover:bg-zinc-800" 
            onClick={() => handleAction(onEmailShare, "email", true)}
            disabled={isLoading !== null || !isOnline}
          >
            {isLoading === "email" ? (
              <span className="animate-pulse">Sharing...</span>
            ) : (
              <>
                <Mail className="mr-2 h-5 w-5" />
                Email
              </>
            )}
          </Button>
        </div>
        
        <div className="flex justify-between mt-2">
          <Button 
            variant="outline" 
            className="border-zinc-800 hover:bg-zinc-800 text-white" 
            onClick={() => navigate('/')}
            disabled={isLoading !== null}
          >
            <Home className="mr-2 h-4 w-4" />
            Home
          </Button>
          <Button 
            onClick={() => navigate('/start-inspection')}
            className="bg-green-500 hover:bg-green-600 text-white"
            disabled={isLoading !== null}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Inspection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InspectionSuccessDialog;
