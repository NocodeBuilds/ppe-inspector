
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import QRCodeScanner from '@/components/inspection/QRCodeScanner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Search, QrCode, ClipboardList, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { PPEItem } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const StartInspection = () => {
  const [serialNumber, setSerialNumber] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [multiplePPE, setMultiplePPE] = useState<PPEItem[]>([]);
  const [showMultiplePPEDialog, setShowMultiplePPEDialog] = useState(false);
  
  const { toast } = useToast();
  const navigate = useNavigate();

  // Format date for display 
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleSearch = async () => {
    if (!serialNumber.trim()) {
      setError('Please enter a serial number');
      return;
    }

    setError(null);
    setIsSearching(true);

    try {
      const { data, error: searchError } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('serial_number', serialNumber.trim());

      if (searchError) throw searchError;

      if (data && data.length > 0) {
        // Check if there are multiple PPE items with the same serial number
        if (data.length > 1) {
          // Store the multiple items and show the selection dialog
          setMultiplePPE(data);
          setShowMultiplePPEDialog(true);
        } else {
          // Only one PPE found, navigate to inspection form
          navigate(`/inspect/${data[0].id}`);
        }
      } else {
        // PPE not found, navigate to manual inspection
        toast({
          title: 'PPE not found',
          description: 'Creating a new inspection record',
          variant: 'default',
        });
        navigate('/inspect/new', { state: { serialNumber: serialNumber.trim() } });
      }
    } catch (error: any) {
      console.error('Error searching for PPE:', error);
      setError(error.message || 'An error occurred while searching');
    } finally {
      setIsSearching(false);
    }
  };

  const handlePPESelection = (id: string) => {
    setShowMultiplePPEDialog(false);
    navigate(`/inspect/${id}`);
  };

  const handleScanResult = (result: string) => {
    setIsScanning(false);
    
    // Set serial number from scan result
    setSerialNumber(result);
    
    toast({
      title: 'QR Code Scanned',
      description: `Serial number: ${result}`,
    });
    
    // Trigger search with a slight delay to allow state update
    setTimeout(() => {
      handleSearch();
    }, 300);
  };

  const handleManualInspection = () => {
    navigate('/inspect/new');
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="text-2xl font-bold">Start Inspection</h1>
        <p className="text-muted-foreground">Scan a QR code or enter serial number to begin</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
          <CardDescription>
            Scan the QR code on a PPE item to quickly fetch its details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isScanning ? (
            <div className="relative">
              <QRCodeScanner 
                onResult={handleScanResult} 
                onError={(error) => {
                  setIsScanning(false);
                  // Only show toast for actual errors, not for user cancellations
                  if (error !== 'Scanning cancelled') {
                    toast({
                      title: 'Scanning Error',
                      description: error,
                      variant: 'destructive',
                    });
                  }
                }}
              />
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full py-8 text-lg h-auto"
              onClick={() => setIsScanning(true)}
            >
              <QrCode className="mr-2 h-6 w-6" />
              Tap to Start Scanning
            </Button>
          )}
        </CardContent>
      </Card>

      <Separator className="my-4" />

      <Card>
        <CardHeader>
          <CardTitle>Enter Serial Number</CardTitle>
          <CardDescription>
            Manually enter the PPE serial number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Enter serial number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button 
              onClick={handleSearch}
              disabled={isSearching || !serialNumber.trim()}
            >
              {isSearching ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-background border-t-transparent rounded-full"></span>
                  Searching...
                </div>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Inspection</CardTitle>
          <CardDescription>
            Create a new inspection without scanning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleManualInspection}
          >
            <ClipboardList className="mr-2 h-4 w-4" />
            New Manual Inspection
          </Button>
        </CardContent>
      </Card>

      {/* Dialog for multiple PPE selection */}
      <Dialog open={showMultiplePPEDialog} onOpenChange={setShowMultiplePPEDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Multiple PPE Items Found</DialogTitle>
            <DialogDescription>
              Multiple PPE items with the same serial number were found. 
              Please select which one you want to inspect.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2 max-h-[60vh] overflow-y-auto">
            {multiplePPE.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:border-primary transition-colors">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-bold">{item.type}</h3>
                      <p className="text-sm text-muted-foreground">Brand: {item.brand}</p>
                      <p className="text-sm text-muted-foreground">Model: {item.model_number}</p>
                      <p className="text-sm text-muted-foreground">Exp: {formatDate(item.expiry_date)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePPESelection(item.id)}
                    >
                      <ArrowRight size={16} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StartInspection;
