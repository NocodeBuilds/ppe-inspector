
import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { ScanLine, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onCancel: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onCancel }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';
  const { toast } = useToast();
  
  useEffect(() => {
    // Initialize QR code scanner
    qrRef.current = new Html5Qrcode(scannerContainerId);
    
    // Cleanup on unmount
    return () => {
      if (isScanning && qrRef.current) {
        qrRef.current
          .stop()
          .catch(error => console.error('Error stopping QR scanner:', error));
      }
    };
  }, []);
  
  const startScanner = () => {
    setIsScanning(true);
    setHasScanned(false);
    setError(null);
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };
    
    if (qrRef.current) {
      qrRef.current
        .start(
          { facingMode: 'environment' },
          config,
          onQRCodeSuccess,
          onQRCodeError
        )
        .catch(err => {
          console.error('Error starting QR scanner:', err);
          if (err.name === 'NotAllowedError') {
            setPermissionDenied(true);
            setIsScanning(false);
            setError('Camera access denied. Please allow camera access and try again.');
            toast({
              title: 'Camera Access Required',
              description: 'Please allow camera access to scan QR codes.',
              variant: 'destructive',
            });
          } else {
            setError(`Failed to start scanner: ${err.message}`);
            setIsScanning(false);
            toast({
              title: 'Scanner Error',
              description: err.message || 'Failed to start QR scanner',
              variant: 'destructive',
            });
          }
        });
    }
  };
  
  const stopScanner = () => {
    if (qrRef.current && isScanning) {
      qrRef.current
        .stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch(err => {
          console.error('Error stopping QR scanner:', err);
        });
    }
  };
  
  const onQRCodeSuccess = (decodedText: string) => {
    console.log("QR code scanned:", decodedText);
    setHasScanned(true);
    stopScanner();
    toast({
      title: 'QR Code Scanned',
      description: 'Successfully scanned QR code',
    });
    onScan(decodedText);
  };
  
  const onQRCodeError = (errorMessage: string) => {
    // We don't need to show transient scanning errors
    console.debug('QR scan error:', errorMessage);
  };
  
  const handleRetry = () => {
    setPermissionDenied(false);
    setError(null);
    startScanner();
  };
  
  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, []);
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Scan QR Code</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onCancel}
          className="h-8 w-8"
        >
          <X size={18} />
        </Button>
      </div>
      
      {permissionDenied ? (
        <div className="text-center p-6 border rounded-lg">
          <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <Camera size={24} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Camera Access Required</h3>
          <p className="text-muted-foreground mb-4">
            Please allow camera access to scan QR codes.
          </p>
          <Button onClick={handleRetry}>Try Again</Button>
        </div>
      ) : error ? (
        <div className="text-center p-6 border rounded-lg">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={handleRetry}>Try Again</Button>
        </div>
      ) : (
        <div className="relative">
          <div 
            id={scannerContainerId} 
            className="w-full aspect-square rounded-lg overflow-hidden bg-black"
          />
          
          {isScanning && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center justify-center">
              <div className="w-60 h-60 border-2 border-primary rounded-lg relative">
                <div className="absolute top-0 left-0 w-full animate-scan">
                  <ScanLine size={240} className="text-primary" />
                </div>
              </div>
              <p className="mt-4 text-white text-shadow-sm">
                Position QR code inside the box
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 flex justify-center">
        <Button 
          variant="outline" 
          onClick={onCancel}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default QRCodeScanner;
