
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, ChevronRight, Scan } from 'lucide-react';
import QRCodeScanner from '@/components/inspection/QRCodeScanner';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useNotifications } from '@/hooks/useNotifications';
import { usePPEData } from '@/hooks/usePPEData';
import PPESelectionDialog from '@/components/inspection/PPESelectionDialog';
import { PPEItem } from '@/integrations/supabase/client';

const StartInspection = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [multiplePPE, setMultiplePPE] = useState<PPEItem[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { showNotification } = useNotifications();
  const { getPPEBySerialNumber } = usePPEData();

  // Handle scanner close
  const handleCloseScanner = () => {
    setShowScanner(false);
    setScanning(false);
  };

  // Handle successful QR code scan
  const handleScanResult = async (result: string) => {
    setScanning(false);
    setIsLoading(true);
    
    try {
      console.log('Scan result:', result);
      
      // Try to find PPE by serial number
      const ppeItems = await getPPEBySerialNumber(result);
      console.log('Found PPE items:', ppeItems);
      
      if (!ppeItems || ppeItems.length === 0) {
        // No PPE found with this serial number
        showNotification('Not Found', 'error', {
          description: `No PPE found with serial number: ${result}`
        });
        setShowScanner(false);
        setIsLoading(false);
        return;
      }
      
      if (ppeItems.length === 1) {
        // Single PPE found, navigate to inspection form
        handlePPESelected(ppeItems[0]);
      } else {
        // Multiple PPE found, show selection dialog
        setMultiplePPE(ppeItems);
      }
    } catch (error) {
      console.error('Error processing scan result:', error);
      showNotification('Error', 'error', {
        description: 'Failed to process scan result'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle PPE selection from dialog
  const handlePPESelected = (ppe: PPEItem) => {
    setMultiplePPE([]);
    setShowScanner(false);
    
    showNotification('PPE Found', 'success', {
      description: `Ready to inspect: ${ppe.type} (${ppe.serial_number})`
    });
    
    // Navigate to inspection form with PPE ID
    navigate(`/inspection-form/${ppe.id}`);
  };

  // Handle scanner error
  const handleScanError = (error: string) => {
    console.error('Scanner error:', error);
    setScanning(false);
    setShowScanner(false);
    
    if (error !== 'Scanning cancelled') {
      showNotification('Scanner Error', 'error', {
        description: error
      });
    }
  };

  // Navigate to manual inspection page
  const handleManualInspection = () => {
    navigate('/manual-inspection');
  };

  return (
    <div className="fade-in pb-28 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Start Inspection</h1>
        <p className="text-muted-foreground">
          Choose how you want to start your inspection
        </p>
      </div>
      
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardContent className="p-0">
          <Button 
            variant="ghost" 
            className="w-full justify-between p-6"
            onClick={() => setShowScanner(true)}
          >
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-lg mr-4">
                <QrCode className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Scan QR Code</div>
                <div className="text-sm text-muted-foreground">
                  Scan PPE QR code to start inspection
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
        </CardContent>
      </Card>
      
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardContent className="p-0">
          <Button 
            variant="ghost" 
            className="w-full justify-between p-6"
            onClick={handleManualInspection}
          >
            <div className="flex items-center">
              <div className="bg-primary/10 p-3 rounded-lg mr-4">
                <Scan className="h-6 w-6 text-primary" />
              </div>
              <div className="text-left">
                <div className="font-medium">Manual Selection</div>
                <div className="text-sm text-muted-foreground">
                  Manually select PPE to inspect
                </div>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </Button>
        </CardContent>
      </Card>
      
      {/* QR Code Scanner Dialog */}
      <Dialog open={showScanner} onOpenChange={setShowScanner}>
        <DialogContent className="max-w-md p-0">
          {showScanner && (
            <QRCodeScanner
              onResult={handleScanResult}
              onError={handleScanError}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Multiple PPE Selection Dialog */}
      <PPESelectionDialog
        ppeItems={multiplePPE}
        isOpen={multiplePPE.length > 0}
        onPPESelect={handlePPESelected}
        onClose={() => setMultiplePPE([])}
      />
    </div>
  );
};

export default StartInspection;
