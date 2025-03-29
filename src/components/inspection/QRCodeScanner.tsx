import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, RefreshCw, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ScannerViewfinder from './ScannerViewfinder';
import EnhancedErrorBoundary from '../error/EnhancedErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';

// Define the CameraDevice type that html5-qrcode returns
interface CameraDevice {
  id: string;
  label: string;
}

interface QRCodeScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onResult, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cameraList, setCameraList] = useState<CameraDevice[]>([]);
  const [currentCamera, setCurrentCamera] = useState<string | null>(null);
  const [hasProcessedResult, setHasProcessedResult] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const cleanupScanner = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Error during scanner cleanup:', err);
      }
    }
  };

  // Reset processing state and cleanup when component unmounts
  useEffect(() => {
    return () => {
      setHasProcessedResult(false);
      cleanupScanner();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(track => track.stop());
      setHasPermission(true);
      return true;
    } catch (err) {
      setHasPermission(false);
      setError('Camera permission denied. Please grant access to use the scanner.');
      return false;
    }
  };

  // Initialize scanner on mount
  useEffect(() => {
    let mounted = true;
    
    const initScanner = async () => {
      try {
        if (!scannerContainerRef.current) return;
        
        const hasAccess = await checkCameraPermission();
        if (!hasAccess || !mounted) return;

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
            await startScanner(cameraId);
          } else if (devices.length === 0) {
            setError('No cameras found on this device');
          }
        }
      } catch (err) {
        if (mounted) {
          console.error('Camera initialization error:', err);
          setError('Failed to initialize camera. Please ensure camera permissions are granted.');
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };
    
    initScanner();
    
    return () => {
      mounted = false;
      cleanupScanner();
    };
  }, []);

  const calculateQrBoxSize = () => {
    if (!scannerContainerRef.current) return { width: 250, height: 250 };
    
    const containerWidth = scannerContainerRef.current.clientWidth;
    const containerHeight = scannerContainerRef.current.clientHeight;
    
    const size = Math.min(containerWidth, containerHeight) * 0.7;
    return {
      width: Math.floor(size),
      height: Math.floor(size)
    };
  };

  const startScanner = async (deviceId: string) => {
    if (!scannerRef.current) return;
    
    try {
      setError(null);
      setHasProcessedResult(false);
      
      const qrBoxSize = calculateQrBoxSize();
      const config = {
        fps: 10,
        qrbox: qrBoxSize,
        aspectRatio: 1,
      };
      
      await scannerRef.current.start(
        deviceId,
        config,
        (decodedText) => {
          handleQrCodeScan(decodedText);
        },
        () => {} // Ignore QR detection errors
      );
      
      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start scanner');
      setIsScanning(false);
    }
  };

  const retryScanner = async () => {
    setError(null);
    setIsInitializing(true);
    await cleanupScanner();
    
    if (currentCamera) {
      try {
        await startScanner(currentCamera);
      } catch (err) {
        setError('Failed to restart scanner. Please try again.');
      }
    }
    setIsInitializing(false);
  };

  const handleQrCodeScan = (decodedText: string) => {
    // Prevent processing the same result multiple times
    if (hasProcessedResult) return;
    
    setHasProcessedResult(true);
    cleanupScanner();
    
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
    
    await cleanupScanner();
    
    const currentIndex = cameraList.findIndex(camera => camera.id === currentCamera);
    const nextIndex = (currentIndex + 1) % cameraList.length;
    const nextCameraId = cameraList[nextIndex].id;
    
    setCurrentCamera(nextCameraId);
    startScanner(nextCameraId);
  };

  const handleClose = () => {
    cleanupScanner();
    onClose();
  };

  if (!hasPermission && error) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center p-8 bg-background rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Camera className="w-16 h-16 mb-6 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-3">Camera Access Required</h3>
        <p className="text-sm text-muted-foreground mb-6 text-center max-w-md">{error}</p>
        <Button onClick={retryScanner} size="lg" className="gap-2">
          <RefreshCw className="h-5 w-5" />
          Retry Camera Access
        </Button>
      </motion.div>
    );
  }

  return (
    <EnhancedErrorBoundary component="QRCodeScanner">
      <motion.div 
        className="relative h-full w-full flex flex-col bg-background rounded-lg shadow-lg overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-background/95 backdrop-blur-sm border-b">
          <h2 className="text-lg font-semibold">Scan QR Code</h2>
          <div className="flex gap-2">
            {cameraList.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={switchCamera}
                disabled={isInitializing || !isScanning}
                className="hover:bg-background/80"
                aria-label="Switch camera"
              >
                <RefreshCw size={18} className={isInitializing ? 'animate-spin' : ''} />
              </Button>
            )}
            <Button 
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="hover:bg-background/80"
              aria-label="Close scanner"
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Scanner container */}
        <div className="flex-1 relative bg-black">
          <div 
            id="qr-scanner-container" 
            ref={scannerContainerRef}
            className="w-full h-full"
          />
          
          <AnimatePresence>
            {/* Loading state */}
            {isInitializing && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex flex-col items-center bg-background p-6 rounded-lg shadow-lg">
                  <RefreshCw className="w-10 h-10 animate-spin mb-4 text-primary" />
                  <p className="text-sm font-medium">Initializing camera...</p>
                </div>
              </motion.div>
            )}

            {/* Error state */}
            {error && !isInitializing && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <div className="flex flex-col items-center bg-background p-6 rounded-lg shadow-lg max-w-sm mx-4">
                  <p className="text-sm text-destructive mb-4 text-center">{error}</p>
                  <Button onClick={retryScanner} variant="outline" className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Scanner viewfinder */}
          {isScanning && !error && !isInitializing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 pointer-events-none"
            >
              <ScannerViewfinder />
            </motion.div>
          )}
        </div>

        {/* Scanning instructions */}
        <div className="p-4 bg-background/95 backdrop-blur-sm border-t text-center">
          <p className="text-sm text-muted-foreground">
            Position the QR code within the frame to scan
          </p>
        </div>
      </motion.div>
    </EnhancedErrorBoundary>
  );
};

export default QRCodeScanner;
