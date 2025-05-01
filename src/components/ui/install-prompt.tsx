
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { isRunningAsStandalone, dismissInstallPromotion, promptInstall } from '@/utils/pwaUtils';
import { X, Download } from 'lucide-react';

interface InstallPromptProps {
  autoShow?: boolean;
}

export function InstallPrompt({ autoShow = false }: InstallPromptProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  
  useEffect(() => {
    // Helper to check if we should show the install prompt
    const shouldShowPrompt = () => {
      // Don't show if already installed or if the user has dismissed before
      if (isRunningAsStandalone() || localStorage.getItem('installPromptDismissed')) {
        return false;
      }
      
      return true;
    };
    
    // Event listener for when the app can be installed
    const handleCanInstall = () => {
      setCanInstall(true);
      if (autoShow && shouldShowPrompt()) {
        setIsOpen(true);
      }
    };
    
    // Listen for the custom event we dispatch in pwaUtils
    window.addEventListener('pwa:can-install', handleCanInstall);
    
    // Clean up
    return () => {
      window.removeEventListener('pwa:can-install', handleCanInstall);
    };
  }, [autoShow]);
  
  const handleDismiss = () => {
    dismissInstallPromotion();
    setIsOpen(false);
  };
  
  const handleInstall = async () => {
    const result = await promptInstall();
    console.log('Installation result:', result);
    setIsOpen(false);
  };
  
  return (
    <>
      {canInstall && !isRunningAsStandalone() && (
        <Button 
          variant="outline" 
          onClick={() => setIsOpen(true)}
          id="install-button"
          className="flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Install App
        </Button>
      )}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Install PPE Inspector</DialogTitle>
            <DialogDescription>
              Install this app on your device for faster access and offline capabilities.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center text-center gap-2 p-3 border rounded-lg">
                <span className="text-3xl">📱</span>
                <span className="text-sm font-medium">Works offline</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 border rounded-lg">
                <span className="text-3xl">⚡</span>
                <span className="text-sm font-medium">Faster loading</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 border rounded-lg">
                <span className="text-3xl">🔒</span>
                <span className="text-sm font-medium">Secure access</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2 p-3 border rounded-lg">
                <span className="text-3xl">🔍</span>
                <span className="text-sm font-medium">No browser UI</span>
              </div>
            </div>
            
            <div className="flex justify-between gap-2 mt-2">
              <Button 
                variant="outline" 
                onClick={handleDismiss} 
                className="flex-1"
              >
                Not Now
              </Button>
              <Button 
                onClick={handleInstall} 
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" /> Install
              </Button>
            </div>
            
            <div className="text-center text-xs text-muted-foreground">
              You won't see this prompt again if you dismiss it.
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default InstallPrompt;
