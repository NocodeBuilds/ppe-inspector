import React, { useState } from 'react';
import { FileText, Download, MessageSquare, Mail, Home, Plus, WifiOff, FileSpreadsheet } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useNetwork } from '@/hooks/useNetwork';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogoIcon from '../common/LogoIcon';

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
  const [shareFormat, setShareFormat] = useState<string>("pdf");
  
  console.log('InspectionSuccessDialog rendered with isOpen:', isOpen, 'isOnline:', isOnline);

  const handleAction = async (
    action: () => void | Promise<void>, 
    actionName: string,
    requiresNetwork: boolean = false
  ) => {
    setIsLoading(actionName);
    
    try {
      if (requiresNetwork && !isOnline) {
        toast({
          title: "Offline Mode",
          description: "This action requires an internet connection. It will be queued for when you're back online.",
          variant: "default",
        });
        
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          const registration = await navigator.serviceWorker.ready;
          
          if ('sync' in registration) {
            await registration.sync.register('sync-offline-reports');
            
            toast({
              title: "Queued for Sync",
              description: "This action will be performed when you're back online",
              variant: "default",
            });
          }
        }
      } else {
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
  
  const handleShareWithFormat = async (shareMethod: 'whatsapp' | 'email') => {
    setIsLoading(shareMethod);
    
    try {
      if (shareFormat === 'pdf') {
        await onPDFDownload();
      } else {
        await onExcelDownload();
      }
      
      if (shareMethod === 'whatsapp') {
        await onWhatsAppShare();
      } else {
        await onEmailShare();
      }
      
      toast({
        title: `Shared via ${shareMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}`,
        description: `Report shared in ${shareFormat.toUpperCase()} format`,
      });
    } catch (error) {
      console.error(`Error during ${shareMethod} sharing:`, error);
      toast({
        title: "Share Failed",
        description: `Could not share via ${shareMethod === 'whatsapp' ? 'WhatsApp' : 'Email'}`,
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
          <div className="flex justify-center mb-2">
            <LogoIcon size="sm" withText />
          </div>
          <DialogTitle className="text-xl text-white text-center">Inspection Submitted Successfully!</DialogTitle>
          <DialogDescription className="text-gray-400 text-center">
            Choose a format to download or share the inspection report.
            {!isOnline && (
              <div className="mt-2 flex items-center justify-center text-amber-400">
                <WifiOff className="h-4 w-4 mr-2" />
                <span>You're currently offline. Some features may be limited.</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="download" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4">
            <TabsTrigger value="download">Download</TabsTrigger>
            <TabsTrigger value="share">Share</TabsTrigger>
          </TabsList>
          
          <div data-value="download" className="space-y-4">
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
                    PDF Format
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
                    <FileSpreadsheet className="mr-2 h-5 w-5" />
                    Excel Format
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div data-value="share" className="space-y-4">
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-2 block">Select Format to Share</label>
              <Select 
                defaultValue="pdf" 
                onValueChange={setShareFormat}
                disabled={isLoading !== null}
              >
                <SelectTrigger className="w-full bg-zinc-800 border-zinc-700">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Format</SelectItem>
                  <SelectItem value="excel">Excel Format</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full justify-start text-white border-zinc-800 hover:bg-zinc-800" 
                onClick={() => handleShareWithFormat('whatsapp')}
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
                onClick={() => handleShareWithFormat('email')}
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
            
            {!isOnline && (
              <p className="text-xs text-amber-400 text-center">
                Sharing requires an internet connection
              </p>
            )}
          </div>
        </Tabs>
        
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
