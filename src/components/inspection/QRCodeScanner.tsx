
import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { ScanLine, Camera, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeScannerProps {
  onResult: (data: string) => void;
  onError: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onResult, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'qr-reader';
  const { toast } = useToast();
  
  // Initialize scanner when component mounts
  useEffect(() => {
    // Only initialize if not already initialized
    if (!qrRef.current) {
      qrRef.current = new Html5Qrcode(scannerContainerId);
    }
    
    // Start scanning automatically with a slight delay to ensure DOM is ready
    setTimeout(() => {
      startScanner();
    }, 500);
    
    // Clean up on unmount
    return () => {
      stopScanner().then(() => {
        if (qrRef.current) {
          // Clear the scanner instance
          qrRef.current = null;
        }
      }).catch(error => {
        console.error('Error during scanner cleanup:', error);
      });
    };
  }, []); // Empty dependency array ensures this runs only once
  
  const startScanner = async () => {
    if (!qrRef.current || hasScanned || isScanning) return;
    
    setIsScanning(true);
    setError(null);
    
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };
    
    try {
      console.log('Starting scanner with environment facing camera...');
      await qrRef.current.start(
        { facingMode: 'environment' },
        config,
        onQRCodeSuccess,
        onQRCodeError
      );
    } catch (err: any) {
      console.error('Error starting QR scanner:', err);
      
      // Try user facing camera as fallback
      if (err.name === 'NotReadableError' || err.name === 'OverconstrainedError') {
        try {
          console.log('Trying user facing camera as fallback...');
          await qrRef.current.start(
            { facingMode: 'user' },
            config,
            onQRCodeSuccess,
            onQRCodeError
          );
          return;
        } catch (fallbackErr: any) {
          console.error('Fallback camera also failed:', fallbackErr);
        }
      }
      
      if (err.name === 'NotAllowedError') {
        setPermissionDenied(true);
        setError('Camera access denied. Please allow camera access and try again.');
        toast({
          title: 'Camera Access Required',
          description: 'Please allow camera access to scan QR codes.',
          variant: 'destructive',
        });
        onError('Camera permission denied');
      } else {
        setError(`Failed to start scanner: ${err.message || 'Unknown error'}`);
        toast({
          title: 'Scanner Error',
          description: err.message || 'Failed to start QR scanner',
          variant: 'destructive',
        });
        onError(err.message || 'Failed to start scanner');
      }
      
      setIsScanning(false);
    }
  };
  
  const stopScanner = async () => {
    if (qrRef.current && isScanning) {
      try {
        await qrRef.current.stop();
        setIsScanning(false);
        return true;
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
        return false;
      }
    }
    return true;
  };
  
  const onQRCodeSuccess = async (decodedText: string) => {
    console.log("QR code scanned:", decodedText);
    
    // Set hasScanned immediately to prevent multiple scans
    setHasScanned(true);
    
    // Stop scanning
    try {
      if (qrRef.current && isScanning) {
        await qrRef.current.stop();
        setIsScanning(false);
        
        toast({
          title: 'QR Code Scanned',
          description: 'Successfully scanned QR code',
        });
        
        // Only call onResult after stopping the scanner
        onResult(decodedText);
      }
    } catch (err) {
      console.error('Error stopping QR scanner after successful scan:', err);
      // Still try to proceed with the result
      setIsScanning(false);
      onResult(decodedText);
    }
  };
  
  const onQRCodeError = (errorMessage: string) => {
    // We don't need to show transient scanning errors
    console.debug('QR scan error:', errorMessage);
  };
  
  const handleRetry = async () => {
    setPermissionDenied(false);
    setError(null);
    setHasScanned(false);
    
    // Ensure scanner is stopped before restarting
    await stopScanner();
    startScanner();
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Scan QR Code</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => onError('Scanning cancelled')}
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
        <div className="relative border-2 border-primary rounded-lg overflow-hidden bg-black aspect-square">
          <div 
            id={scannerContainerId} 
            className="w-full h-full"
          />
          
          {isScanning && !hasScanned && (
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center justify-center">
              <div className="w-60 h-60 border-2 border-primary rounded-lg relative">
                <div className="absolute top-0 left-0 w-full animate-scan">
                  <ScanLine className="text-primary" />
                </div>
              </div>
              <p className="mt-4 text-white drop-shadow-lg text-shadow">
                Position QR code inside the box
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-4 flex justify-center">
        <Button 
          variant="outline" 
          onClick={() => onError('Scanning cancelled')}
          className="w-full"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default QRCodeScanner;
