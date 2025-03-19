import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import ScannerPermissionRequest from './ScannerPermissionRequest';
import ScannerError from './ScannerError';
import ScannerViewfinder from './ScannerViewfinder';
import ScannerHeader from './scanner/ScannerHeader';
import ScannerControls from './scanner/ScannerControls';
import ScannerInitializer from './scanner/ScannerInitializer';
import EnhancedErrorBoundary from '../error/EnhancedErrorBoundary';

interface QRCodeScannerProps {
  onResult: (result: string) => void;
  onError: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onResult, onError }) => {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const { toast } = useToast();
  const { showNotification } = useNotifications();
  const isMountedRef = useRef(true);

  useEffect(() => {
    const initializeScanner = async () => {
      try {
        setScanning(true);
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        const config = {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        };

        // Select the back camera by default
        const cameraList = await html5QrCode.getCameras();
        
        if (cameraList.length === 0) {
          throw new Error("No cameras found on this device.");
        }

        const backCamera = cameraList.find(
          (camera) => camera.label.toLowerCase().includes("back")
        );

        const cameraId = backCamera ? backCamera.id : cameraList[0].id;

        await html5QrCode.start(
          cameraId,
          config,
          (decodedText, decodedResult) => {
            console.log(`Code matched = ${decodedText}`, decodedResult);
            onResult(decodedText);
          },
          (errorMessage) => {
            console.warn(`Code scan error = ${errorMessage}`);
          }
        );

        console.log("Scanner started successfully");
      } catch (err: any) {
        console.error("Error initializing scanner:", err);
        setError(err.message || "Failed to initialize scanner.");
        onError(err.message || "Failed to initialize scanner.");
      }
    };

    initializeScanner();

    return () => {
      stopScanner();
    };
  }, [onResult, onError]);

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        console.log("Scanner stopped successfully");
      } catch (err: any) {
        console.error("Error stopping QR scanner:", err);
      }
      finally{
        setScanning(false);
      }
    }
  };

  const handleRetry = async () => {
    setPermissionDenied(false);
    setError(null);
    setHasScanned(false);
    stopScanner();
  };

  const handleCancel = () => {
    stopScanner();
    onError("Scanning cancelled");
  };

  const switchCamera = async () => {
    if (availableDevices.length <= 1) {
      toast({
        title: 'Camera Switch',
        description: 'No additional cameras available on this device',
        variant: 'default',
      });
      return;
    }
    
    const currentIndex = availableDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    const nextDeviceId = availableDevices[nextIndex].deviceId;
    
    console.log(`Switching camera from ${currentIndex} to ${nextIndex}`);
    
    await stopScanner();
    
    setSelectedDeviceId(nextDeviceId);
  };

  return (
    <EnhancedErrorBoundary component="QRCodeScanner">
      <div className="w-full max-w-md mx-auto">
        <ScannerHeader onClose={handleCancel} />
        
        {permissionDenied ? (
          <ScannerPermissionRequest onRetry={handleRetry} />
        ) : error ? (
          <ScannerError error={error} onRetry={handleRetry} onCancel={handleCancel} />
        ) : (
          <div className="relative border-2 border-primary rounded-lg overflow-hidden bg-black aspect-square">
            <div 
              id="qr-reader" 
              ref={scannerContainerRef}
              className="w-full h-full"
            />
            
            {!error && !hasScanned && (
              <ScannerInitializer 
                scannerContainerId="qr-reader"
                onScanSuccess={(decodedText) => {
                  console.log("QR code scanned:", decodedText);
                  onResult(decodedText);
                }}
                onScanError={(errorMessage) => {
                  console.warn(`Code scan error = ${errorMessage}`);
                }}
                onScannerStart={(scanner) => {
                  scannerRef.current = scanner;
                  setScanning(true);
                  setError(null);
                }}
                onScannerError={(err) => {
                  console.error("Error initializing scanner:", err);
                  setError(err.message || "Failed to initialize scanner.");
                  onError(err.message || "Failed to initialize scanner.");
                }}
                selectedDeviceId={selectedDeviceId}
              />
            )}
            
            {scanning && !hasScanned && <ScannerViewfinder />}
          </div>
        )}
        
        <ScannerControls 
          onCancel={handleCancel}
          onSwitchCamera={switchCamera}
          hasMultipleCameras={availableDevices.length > 1}
          isScanning={scanning}
          hasScanned={hasScanned}
        />
        
        <button
          type="button"
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          onClick={() => {
            stopScanner();
            onError("Scanning cancelled");
          }}
        >
          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>
    </EnhancedErrorBoundary>
  );
};

export default QRCodeScanner;
