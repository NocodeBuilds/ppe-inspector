
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ScannerViewfinder from './ScannerViewfinder';
import EnhancedErrorBoundary from '../error/EnhancedErrorBoundary';
import { motion } from 'framer-motion';

interface QRCodeScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onResult, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraList, setCameraList] = useState<MediaDeviceInfo[]>([]);
  const [currentCamera, setCurrentCamera] = useState<string | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize scanner on mount
  useEffect(() => {
    let mounted = true;
    
    const initScanner = async () => {
      try {
        if (!scannerContainerRef.current) return;
        
        // Create scanner instance
        const scanner = new Html5Qrcode('qr-scanner-container');
        scannerRef.current = scanner;
        
        // Get available cameras
        const devices = await Html5Qrcode.getCameras();
        if (mounted) {
          setCameraList(devices);
          
          // Select back camera by default if available
          const backCamera = devices.find(
            camera => camera.label.toLowerCase().includes('back')
          );
          
          const cameraId = backCamera ? backCamera.id : devices[0]?.id;
          setCurrentCamera(cameraId || null);
          
          if (cameraId) {
            startScanner(cameraId);
          } else if (devices.length === 0) {
            setError('No cameras found on this device');
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('Camera initialization error:', err);
          setError('Failed to initialize camera. Please ensure camera permissions are granted.');
        }
      }
    };
    
    initScanner();
    
    // Cleanup function
    return () => {
      mounted = false;
      stopScanner();
    };
  }, []);

  const startScanner = async (deviceId: string) => {
    if (!scannerRef.current) return;
    
    try {
      setError(null);
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
      };
      
      await scannerRef.current.start(
        deviceId,
        config,
        (decodedText) => {
          handleQrCodeScan(decodedText);
        },
        (errorMessage) => {
          // This is just for qr detection errors, not critical
          console.log('QR scan process:', errorMessage);
        }
      );
      
      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start scanner');
      setIsScanning(false);
    }
  };

  const stopScanner = () => {
    if (scannerRef.current && isScanning) {
      try {
        scannerRef.current.stop()
          .then(() => {
            setIsScanning(false);
          })
          .catch((err) => {
            console.error('Error stopping scanner:', err);
          });
      } catch (err) {
        console.error('Exception when stopping scanner:', err);
      }
    }
  };

  const handleQrCodeScan = (decodedText: string) => {
    console.log('QR code scanned:', decodedText);
    stopScanner();
    
    // Only call the result handler if we have a valid string
    if (decodedText && typeof decodedText === 'string') {
      onResult(decodedText);
    }
  };

  const switchCamera = async () => {
    if (cameraList.length <= 1) {
      toast({
        title: 'Camera Switch',
        description: 'No additional cameras available on this device',
      });
      return;
    }
    
    await stopScanner();
    
    // Find the next camera in the list
    const currentIndex = cameraList.findIndex(camera => camera.id === currentCamera);
    const nextIndex = (currentIndex + 1) % cameraList.length;
    const nextCameraId = cameraList[nextIndex].id;
    
    setCurrentCamera(nextCameraId);
    startScanner(nextCameraId);
    
    toast({
      title: 'Camera Switched',
      description: `Now using: ${cameraList[nextIndex].label.split('(')[0].trim()}`,
    });
  };

  return (
    <EnhancedErrorBoundary component="QRCodeScanner">
      <motion.div 
        className="relative h-full w-full flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with close button */}
        <div className="flex justify-between items-center p-4 bg-background/80 backdrop-blur-sm border-b">
          <h2 className="text-lg font-semibold">Scan QR Code</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              stopScanner();
              onClose();
            }}
            aria-label="Close scanner"
          >
            <X size={18} />
          </Button>
        </div>
        
        {/* Scanner container */}
        <div className="relative flex-1 bg-black">
          {/* The actual scanner element */}
          <div 
            id="qr-scanner-container" 
            ref={scannerContainerRef}
            className="w-full h-full"
          ></div>
          
          {/* Error message */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4">
              <div className="bg-background rounded-lg p-4 max-w-xs text-center">
                <p className="text-destructive mb-4">{error}</p>
                <Button 
                  onClick={() => {
                    setError(null);
                    if (currentCamera) startScanner(currentCamera);
                  }}
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
          
          {/* Scanner viewfinder overlay */}
          {isScanning && !error && <ScannerViewfinder />}
        </div>
        
        {/* Footer with controls */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
          <div className="flex gap-2 justify-center">
            {cameraList.length > 1 && (
              <Button
                variant="outline"
                onClick={switchCamera}
                disabled={!isScanning}
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Switch Camera
              </Button>
            )}
            
            <Button
              variant="destructive"
              onClick={() => {
                stopScanner();
                onClose();
              }}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </Button>
          </div>
        </div>
      </motion.div>
    </EnhancedErrorBoundary>
  );
};

export default QRCodeScanner;
