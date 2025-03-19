import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
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
  onResult: (data: string) => void;
  onError: (error: string) => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onResult, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [qrScanner, setQrScanner] = useState<Html5Qrcode | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const scanAttempts = useRef<number>(0);
  const scannerContainerId = 'qr-reader';
  const { toast } = useToast();
  const { showNotification } = useNotifications();
  const isMountedRef = useRef(true);
  
  // Set up isMounted ref for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Fetch available camera devices
  useEffect(() => {
    const fetchAvailableDevices = async () => {
      if (!isMountedRef.current || isInitializing) return;
      
      setIsInitializing(true);
      
      try {
        console.log('Fetching available camera devices...');
        
        // Request camera permission first
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        if (!isMountedRef.current) return;
        
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        console.log('Available camera devices:', videoDevices);
        
        if (!isMountedRef.current) return;
        setAvailableDevices(videoDevices);
        
        // Prefer environment (back) camera if available
        const envCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment')
        );
        
        if (envCamera) {
          console.log('Selected environment camera:', envCamera.label);
          setSelectedDeviceId(envCamera.deviceId);
        } else if (videoDevices.length > 0) {
          console.log('Selected first available camera:', videoDevices[0].label);
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      } catch (error) {
        console.error('Error fetching camera devices:', error);
        if (isMountedRef.current) {
          handleScannerStartError(error);
        }
      } finally {
        if (isMountedRef.current) {
          setIsInitializing(false);
        }
      }
    };
    
    fetchAvailableDevices();
  }, []);
  
  const onQRCodeSuccess = async (decodedText: string) => {
    console.log("QR code scanned:", decodedText);
    
    // Prevent multiple scans
    if (hasScanned || !isMountedRef.current) return;
    
    try {
      // Basic validation of QR code format
      const trimmedText = decodedText.trim();
      if (!trimmedText) {
        throw new Error('Invalid QR code: empty content');
      }

      // You might want to add more specific validation based on your QR code format
      // For example, if it should match a specific pattern
      if (!/^[A-Za-z0-9-_]+$/.test(trimmedText)) {
        throw new Error('Invalid QR code format: should only contain alphanumeric characters, hyphens, and underscores');
      }

      setHasScanned(true);
      
      if (qrScanner && isScanning) {
        await qrScanner.stop();
        if (!isMountedRef.current) return;
        
        setIsScanning(false);
        
        showNotification('QR Code Scanned', 'success', {
          description: 'Successfully scanned QR code'
        });
        
        // Process the result with validated text
        onResult(trimmedText);
      }
    } catch (err: any) {
      console.error('Error processing QR code:', err);
      if (isMountedRef.current) {
        setIsScanning(false);
        onError(err.message || 'Failed to process QR code');
        showNotification('QR Code Error', 'error', {
          description: err.message || 'Failed to process QR code'
        });
      }
    }
  };
  
  const onQRCodeError = (errorMessage: string) => {
    // Don't log every frame error as it's too noisy
    // console.debug('QR scan error:', errorMessage);
  };
  
  const handleScannerStart = (scanner: Html5Qrcode) => {
    if (!isMountedRef.current) return;
    
    setQrScanner(scanner);
    setIsScanning(true);
    setError(null);
  };
  
  const handleScannerStartError = async (err: any) => {
    if (!isMountedRef.current) return;
    
    // If we failed with the selected device, try with a different camera option
    if (scanAttempts.current < 2) {
      scanAttempts.current++;
      console.log(`Scanner start failed. Trying alternative camera (attempt ${scanAttempts.current})...`);
      
      try {
        if (!qrScanner) return;
        
        if (scanAttempts.current === 1) {
          // Try with user facing camera on first retry
          await qrScanner.start(
            { facingMode: 'user' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onQRCodeSuccess,
            onQRCodeError
          );
          console.log('Started with user-facing camera');
          setIsScanning(true);
          return;
        } else {
          // Try with any available camera on second retry
          await qrScanner.start(
            { facingMode: { ideal: "environment" } },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onQRCodeSuccess,
            onQRCodeError
          );
          console.log('Started with any available camera');
          setIsScanning(true);
          return;
        }
      } catch (retryErr) {
        console.error(`Camera retry attempt ${scanAttempts.current} failed:`, retryErr);
      }
    }
    
    // All attempts failed, show error
    if (err.name === 'NotAllowedError') {
      setPermissionDenied(true);
      setError('Camera access denied. Please allow camera access and try again.');
      showNotification('Camera Access Required', 'error', {
        description: 'Please allow camera access to scan QR codes.'
      });
      onError('Camera permission denied');
    } else {
      setError(`Failed to start scanner: ${err.message || 'Unknown error'}`);
      showNotification('Scanner Error', 'error', {
        description: err.message || 'Failed to start QR scanner'
      });
      onError(err.message || 'Failed to start scanner');
    }
    
    setIsScanning(false);
  };
  
  const stopScanner = async () => {
    if (!isMountedRef.current) return true;
    
    if (qrScanner && isScanning) {
      try {
        console.log('Stopping QR scanner...');
        await qrScanner.stop();
        console.log('QR scanner stopped');
        if (isMountedRef.current) {
          setIsScanning(false);
        }
        return true;
      } catch (err) {
        console.error('Error stopping QR scanner:', err);
        return false;
      }
    }
    return true;
  };
  
  const handleRetry = async () => {
    if (!isMountedRef.current) return;
    
    setPermissionDenied(false);
    setError(null);
    setHasScanned(false);
    scanAttempts.current = 0;
    
    await stopScanner();
    // ScannerInitializer will restart the scanner automatically when state changes
  };
  
  const switchCamera = async () => {
    if (!isMountedRef.current) return;
    
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
    
    // Reset scan attempts when manually switching
    scanAttempts.current = 0;
    setSelectedDeviceId(nextDeviceId);
  };

  const handleCancel = () => {
    stopScanner();
    onError('Scanning cancelled');
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);
  
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
              id={scannerContainerId} 
              className="w-full h-full"
            />
            
            {!error && !hasScanned && (
              <ScannerInitializer 
                scannerContainerId={scannerContainerId}
                onScanSuccess={onQRCodeSuccess}
                onScanError={onQRCodeError}
                onScannerStart={handleScannerStart}
                onScannerError={handleScannerStartError}
                selectedDeviceId={selectedDeviceId}
              />
            )}
            
            {isScanning && !hasScanned && <ScannerViewfinder />}
          </div>
        )}
        
        <ScannerControls 
          onCancel={handleCancel}
          onSwitchCamera={switchCamera}
          hasMultipleCameras={availableDevices.length > 1}
          isScanning={isScanning}
          hasScanned={hasScanned}
        />
      </div>
    </EnhancedErrorBoundary>
  );
};

export default QRCodeScanner;
