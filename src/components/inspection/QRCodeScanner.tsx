import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { X, RefreshCw, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useQRScannerManager } from '@/hooks/useQRScannerManager';
import ScannerViewfinder from './ScannerViewfinder';
import EnhancedErrorBoundary from '../error/EnhancedErrorBoundary';

// Scanner configuration
const SCANNER_CONFIG = {
  fps: 30,
  qrbox: {
    width: Math.min(window.innerWidth * 0.7, 300),
    height: Math.min(window.innerWidth * 0.7, 300)
  },
  aspectRatio: 1,
  disableFlip: false,
  formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
  experimentalFeatures: {
    useBarCodeDetectorIfSupported: true
  }
};

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
  const [error, setError] = useState<string | null>(null);
  const [cameraList, setCameraList] = useState<CameraDevice[]>([]);
  const [currentCamera, setCurrentCamera] = useState<string | null>(null);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [focusMode, setFocusMode] = useState<'auto' | 'manual'>('auto');
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const scannerManager = useQRScannerManager();

  // Initialize scanner on mount
  useEffect(() => {
    let mounted = true;
    
    const initScanner = async () => {
      try {
        if (!scannerContainerRef.current) return;
        
        // Create scanner instance with enhanced config
        const scanner = new Html5Qrcode('qr-scanner-container', {
          verbose: false,
          ...SCANNER_CONFIG
        });
        
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
      scannerManager.resetScan();
      
      await scannerRef.current.start(
        deviceId,
        SCANNER_CONFIG,
        handleQrCodeScan,
        (errorMessage) => {
          // This is just for qr detection errors, not critical
          if (!errorMessage.includes('No MultiFormat Readers')) {
            console.log('QR scan process:', errorMessage);
          }
        }
      );
      
      // Check if torch is available
      try {
        const torchAvailable = await scannerRef.current.hasFlash();
        setHasTorch(torchAvailable);
      } catch (err) {
        console.log('Torch check failed:', err);
        setHasTorch(false);
      }
      
      setIsScanning(true);
    } catch (err: any) {
      console.error('Error starting scanner:', err);
      setError(err.message || 'Failed to start scanner');
      setIsScanning(false);
    }
  };

  const stopScanner = useCallback(async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
        setTorchEnabled(false);
      } catch (err) {
        console.error('Exception when stopping scanner:', err);
      }
    }
  }, [isScanning]);

  const handleQrCodeScan = async (decodedText: string) => {
    // Use the scanner manager to prevent duplicate scans
    const shouldProcess = await scannerManager.processScan(decodedText);
    if (!shouldProcess) return;
    
    console.log('QR code scanned:', decodedText);
    
    // Provide haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
    
    await stopScanner();
    
    // Use a timeout to ensure the scanner is fully stopped
    setTimeout(() => {
      onResult(decodedText);
    }, 50);
  };

  const switchCamera = async () => {
    if (cameraList.length <= 1) {
      return;
    }
    
    await stopScanner();
    
    // Find the next camera in the list
    const currentIndex = cameraList.findIndex(camera => camera.id === currentCamera);
    const nextIndex = (currentIndex + 1) % cameraList.length;
    const nextCameraId = cameraList[nextIndex].id;
    
    setCurrentCamera(nextCameraId);
    startScanner(nextCameraId);
  };

  const toggleTorch = async () => {
    if (!scannerRef.current || !hasTorch) return;
    
    try {
      await scannerRef.current.toggleFlash();
      setTorchEnabled(prev => !prev);
    } catch (err) {
      console.error('Error toggling torch:', err);
    }
  };

  const handleFocusChange = (mode: 'auto' | 'manual') => {
    setFocusMode(mode);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
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
            onClick={handleClose}
            aria-label="Close scanner"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        {/* Scanner container */}
        <div className="relative flex-1 bg-black">
          {/* The actual scanner element */}
          <div 
            id="qr-scanner-container" 
            ref={scannerContainerRef}
            className="w-full h-full"
          />
          
          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div 
                className="absolute inset-0 flex items-center justify-center bg-black/70 p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="bg-background rounded-lg p-4 max-w-xs text-center">
                  <p className="text-body-sm text-destructive mb-4">{error}</p>
                  <Button 
                    onClick={() => {
                      setError(null);
                      if (currentCamera) startScanner(currentCamera);
                    }}
                  >
                    Try Again
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Scanner viewfinder overlay */}
          {isScanning && !error && (
            <ScannerViewfinder 
              isScanning={isScanning}
              onTorchToggle={hasTorch ? toggleTorch : undefined}
              onFocusChange={handleFocusChange}
              torchEnabled={torchEnabled}
              focusMode={focusMode}
              hasTorch={hasTorch}
            />
          )}
        </div>
        
        {/* Footer with controls */}
        <div className="p-4 border-t bg-background/80 backdrop-blur-sm">
          <div className="flex gap-2 justify-center">
            {cameraList.length > 1 && (
              <Button
                variant="outline"
                onClick={switchCamera}
                disabled={!isScanning || scannerManager.scanState.isProcessing}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Switch Camera</span>
              </Button>
            )}
            
            <Button
              variant="destructive"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </EnhancedErrorBoundary>
  );
};

export default QRCodeScanner;
