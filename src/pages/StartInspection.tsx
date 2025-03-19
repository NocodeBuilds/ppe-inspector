import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { QrCode, ChevronRight, Scan, Search } from 'lucide-react';
import QRCodeScanner from '@/components/inspection/QRCodeScanner';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { usePPEData } from '@/hooks/usePPEData';
import PPESelectionDialog from '@/components/inspection/PPESelectionDialog';
import { PPEItem } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/common/PageHeader';

const StartInspection = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [serialNumber, setSerialNumber] = useState('');
  const [scanning, setScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [multiplePPE, setMultiplePPE] = useState<PPEItem[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getPPEBySerialNumber } = usePPEData();

  const handleCloseScanner = () => {
    setShowScanner(false);
    setScanning(false);
  };

  const handleScanResult = async (result: string) => {
    setScanning(false);
    setShowScanner(false);
    
    try {
      // Show scanning feedback
      toast({
        title: 'Processing',
        variant: 'default',
        description: 'Processing QR code...'
      });
      
      await searchBySerial(result);
    } catch (error) {
      console.error('Error handling scan result:', error);
      toast({
        title: 'Error',
        variant: 'destructive',
        description: error instanceof Error ? error.message : 'Failed to process QR code'
      });
    }
  };

  const searchBySerial = async (serial: string) => {
    if (!serial.trim()) {
      throw new Error('Please enter a valid serial number');
    }
    
    setIsLoading(true);
    setIsSearching(true);
    
    try {
      console.log('Searching for serial number:', serial);
      
      const ppeItems = await getPPEBySerialNumber(serial);
      console.log('Found PPE items:', ppeItems);
      
      if (!ppeItems || ppeItems.length === 0) {
        throw new Error(`No PPE found with serial number: ${serial}`);
      }
      
      if (ppeItems.length === 1) {
        handlePPESelected(ppeItems[0]);
      } else {
        setMultiplePPE(ppeItems);
      }
    } catch (error) {
      console.error('Error processing serial number:', error);
      throw error; // Re-throw to be handled by caller
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const handlePPESelected = (ppe: PPEItem) => {
    setMultiplePPE([]);
    setShowScanner(false);
    setSerialNumber('');
    
    toast({
      title: 'PPE Found',
      variant: 'success',
      description: `Ready to inspect: ${ppe.type} (${ppe.serial_number})`
    });
    
    // Navigate to the inspection form with the PPE ID
    navigate(`/inspect/${ppe.id}`);
  };

  const handleScanError = (error: string) => {
    console.error('Scanner error:', error);
    setScanning(false);
    setShowScanner(false);
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchBySerial(serialNumber);
  };

  const handleManualInspection = () => {
    navigate('/inspect/new');
  };

  return (
    <div className="fade-in pb-28 space-y-6">
      <PageHeader title="Start Inspection" />
      
      <p className="text-muted-foreground">
        Choose how you want to start your inspection
      </p>
      
      {isLoading && !isSearching ? (
        <>
          <Skeleton className="h-[120px] w-full rounded-lg" />
          <Skeleton className="h-[120px] w-full rounded-lg" />
        </>
      ) : (
        <>
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
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-primary/10 p-3 rounded-lg mr-4">
                  <Search className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Search by Serial Number</h3>
                  <p className="text-sm text-muted-foreground">
                    Enter the PPE serial number manually
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleManualSearch} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="serialNumber"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value)}
                      placeholder="Enter serial number"
                      disabled={isSearching}
                    />
                    <Button 
                      type="submit" 
                      disabled={!serialNumber.trim() || isSearching}
                    >
                      {isSearching ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching
                        </span>
                      ) : 'Search'}
                    </Button>
                  </div>
                </div>
              </form>
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
        </>
      )}
      
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
