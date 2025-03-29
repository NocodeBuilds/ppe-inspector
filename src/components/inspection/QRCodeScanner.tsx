import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QRCodeScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onResult, onClose }) => {
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      await initCamera();
    };

    init().catch(console.error);

    return () => {
      mounted = false;
      cleanupCamera().catch(console.error);
    };
  }, []);

  const initCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices.length === 0) {
        throw new Error('No cameras found');
      }

      // Initialize scanner
      if (!scannerDivRef.current) return;
      scannerRef.current = new Html5Qrcode('qr-scanner');

      // Select back camera if available, otherwise use first camera
      const selectedCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
      setCameraId(selectedCamera.id);
      
      await startScanning(selectedCamera.id);
    } catch (err) {
      console.error('Camera init error:', err);
      setError(err instanceof Error ? err.message : 'Failed to access camera');
    } finally {
      setIsLoading(false);
    }
  };

  const startScanning = async (deviceId: string) => {
    if (!scannerRef.current) return;

    try {
      setError(null);
      setIsScanning(false);

      // Get container dimensions for optimal QR box size
      const containerWidth = scannerDivRef.current?.clientWidth || window.innerWidth;
      const containerHeight = scannerDivRef.current?.clientHeight || window.innerHeight;
      const minDimension = Math.min(containerWidth, containerHeight);
      const qrboxSize = Math.floor(minDimension * 0.6); // 60% of container size

      await scannerRef.current.start(
        deviceId,
        {
          fps: 15,
          qrbox: {
            width: qrboxSize,
            height: qrboxSize
          },
          aspectRatio: 1
        },
        (text) => {
          handleSuccess(text);
        },
        () => {} // Ignore QR detection errors
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Start scanning error:', err);
      setError('Failed to start camera');
      setIsScanning(false);
    }
  };

  const cleanupCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    }
  };

  const handleSuccess = async (result: string) => {
    await cleanupCamera();
    onResult(result);
  };

  const handleRetry = async () => {
    await cleanupCamera();
    initCamera();
  };

  // Permission denied or error state
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg text-center space-y-4">
          <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="text-xl font-semibold">Camera Access Required</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={handleRetry} className="w-full">
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scanner */}
      <div className="flex-1 relative bg-black">
        {/* QR Scanner Container */}
        <div 
          id="qr-scanner" 
          ref={scannerDivRef}
          className={cn(
            "w-full h-full",
            !isScanning && "opacity-50"
          )}
        />

        {/* Scanning Frame */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vmin] h-[60vmin]">
              {/* Corner markers */}
              <div className="absolute left-0 top-0 w-8 h-8 border-l-4 border-t-4 border-primary" />
              <div className="absolute right-0 top-0 w-8 h-8 border-r-4 border-t-4 border-primary" />
              <div className="absolute left-0 bottom-0 w-8 h-8 border-l-4 border-b-4 border-primary" />
              <div className="absolute right-0 bottom-0 w-8 h-8 border-r-4 border-b-4 border-primary" />
              
              {/* Scanning line animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 h-0.5 bg-primary/50 animate-scan" />
              </div>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="flex flex-col items-center space-y-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm font-medium">Initializing camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center border-t bg-background/90 backdrop-blur-sm">
        <p className="text-sm text-muted-foreground">
          Position the QR code within the frame to scan
        </p>
      </div>
    </div>
  );
};

export default QRCodeScanner;
