
import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Camera, X } from 'lucide-react';

interface QRCodeScannerProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
}

const QRCodeScanner = ({ onResult, onError }: QRCodeScannerProps) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-reader';

  const startScanner = async () => {
    setScanning(true);
    setError(null);

    try {
      // Check if camera permissions are available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      if (videoDevices.length === 0) {
        throw new Error('No camera found on this device');
      }

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(containerId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      await scannerRef.current.start(
        { facingMode: 'environment' },
        config,
        (decodedText) => {
          handleScanSuccess(decodedText);
        },
        (errorMessage) => {
          // This is a normal behavior for QR code scanning, not an error to show
          console.log('QR scan loop:', errorMessage);
        }
      );
    } catch (err: any) {
      console.error('Starting scanner failed:', err);
      
      // Check if the error is related to camera permissions
      if (err.name === 'NotAllowedError' || err.message.includes('permission')) {
        setPermissionDenied(true);
        setError('Camera access was denied. Please allow camera access and try again.');
      } else {
        setError(`Failed to start camera: ${err.message}`);
      }
      
      setScanning(false);
      onError(err.message || 'Failed to initialize camera');
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop()
        .then(() => {
          setScanning(false);
        })
        .catch((err) => {
          console.error('Error stopping scanner:', err);
        });
    } else {
      setScanning(false);
    }
  };

  const handleCancel = () => {
    stopScanner();
    onError('Scanning cancelled');
  };

  const handleScanSuccess = (decodedText: string) => {
    stopScanner();
    onResult(decodedText);
  };

  useEffect(() => {
    startScanner();
    
    return () => {
      stopScanner();
    };
  }, []);

  if (error || permissionDenied) {
    return (
      <div className="text-center p-4">
        <div className="mb-4 text-destructive">{error}</div>
        {permissionDenied && (
          <div className="mb-4 text-sm">
            <p>You need to allow camera access in your browser settings.</p>
            <p className="mt-2">On most browsers, click the camera icon in the address bar and select "Allow".</p>
          </div>
        )}
        <div className="flex justify-center gap-2">
          <Button onClick={startScanner}>Try Again</Button>
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-4">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div id={containerId} className="w-full max-w-md h-64 bg-muted rounded-md overflow-hidden">
        {!scanning && (
          <div className="flex items-center justify-center h-full">
            <Button onClick={startScanner} className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Start Camera
            </Button>
          </div>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground mt-4 text-center">
        Point your camera at a QR code to scan
      </p>
    </div>
  );
};

export default QRCodeScanner;
