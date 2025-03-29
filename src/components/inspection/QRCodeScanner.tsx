import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode, Html5QrcodeResult } from 'html5-qrcode';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QRCodeScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onResult, onClose }) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeScanner();
    return () => {
      stopScanner();
    };
  }, []);

  const initializeScanner = async () => {
    try {
      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);

      if (!containerRef.current) return;

      // Initialize QR scanner
      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices.length === 0) {
        throw new Error('No cameras found');
      }

      // Prefer back camera
      const camera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
      
      // Start scanning
      await startScanner(camera.id);
    } catch (err) {
      console.error('Scanner initialization error:', err);
      setHasPermission(false);
      setError(err instanceof Error ? err.message : 'Failed to initialize camera');
    }
  };

  const startScanner = async (deviceId: string) => {
    if (!scannerRef.current) return;

    try {
      setError(null);
      
      // Calculate optimal QR box size
      const containerWidth = containerRef.current?.clientWidth ?? 1080;
      const containerHeight = containerRef.current?.clientHeight ?? 1920;
      const minDimension = Math.min(containerWidth, containerHeight);
      const qrboxSize = Math.floor(minDimension * 0.7);

      await scannerRef.current.start(
        deviceId,
        {
          fps: 10,
          qrbox: qrboxSize,
          aspectRatio: 1,
        },
        handleScanSuccess,
        undefined // Ignore QR detection errors
      );
    } catch (err) {
      setError('Failed to start scanner');
      console.error('Scanner start error:', err);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
  };

  const handleScanSuccess = (decodedText: string, result: Html5QrcodeResult) => {
    stopScanner();
    onResult(decodedText);
  };

  const handleRetry = () => {
    setError(null);
    initializeScanner();
  };

  if (!hasPermission) {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-background rounded-lg">
        <div className="text-center space-y-4">
          <h3 className="text-lg font-semibold">Camera Access Required</h3>
          <p className="text-sm text-muted-foreground">
            Please allow camera access to scan QR codes
          </p>
          <Button onClick={handleRetry}>
            Request Access
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scanner */}
      <div className="flex-1 relative bg-black">
        <div 
          id="qr-reader" 
          ref={containerRef}
          className={cn(
            "w-full h-full",
            error && "opacity-50"
          )}
        />

        {/* Scanning guide */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 border-[3px] border-transparent">
            <div className="absolute inset-[30%] border-2 border-primary rounded-lg" />
          </div>
        </div>

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm mx-4 text-center">
              <p className="text-sm text-destructive mb-4">{error}</p>
              <Button onClick={handleRetry} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center border-t bg-background/80 backdrop-blur">
        <p className="text-sm text-muted-foreground">
          Position the QR code within the frame
        </p>
      </div>
    </div>
  );
};

export default QRCodeScanner;
