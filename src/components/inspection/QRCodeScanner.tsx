
import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { X, Smartphone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';
import ScannerPermissionRequest from './ScannerPermissionRequest';
import ScannerError from './ScannerError';
import ScannerViewfinder from './ScannerViewfinder';

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
  
  const qrRef = useRef<Html5Qrcode | null>(null);
  const scanAttempts = useRef<number>(0);
  const scannerContainerId = 'qr-reader';
  const { toast } = useToast();
  const { showNotification } = useNotifications();
  
  useEffect(() => {
    // Initialize QR scanner on component mount
    if (!qrRef.current) {
      qrRef.current = new Html5Qrcode(scannerContainerId);
    }
    
    // Slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startScanner();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      stopScanner().then(() => {
        if (qrRef.current) {
          qrRef.current = null;
        }
      }).catch(error => {
        console.error('Error during scanner cleanup:', error);
      });
    };
  }, []);
  
  const fetchAvailableDevices = async () => {
    try {
      console.log('Fetching available camera devices...');
      
      // Request camera permission first
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available camera devices:', videoDevices);
      setAvailableDevices(videoDevices);
      
      // Prefer environment (back) camera if available
      const envCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment')
      );
      
      if (envCamera) {
        console.log('Selected environment camera:', envCamera.label);
        setSelectedDeviceId(envCamera.deviceId);
        return envCamera.deviceId;
      } else if (videoDevices.length > 0) {
        console.log('Selected first available camera:', videoDevices[0].label);
        setSelectedDeviceId(videoDevices[0].deviceId);
        return videoDevices[0].deviceId;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching camera devices:', error);
      return null;
    }
  };
  
  const startScanner = async () => {
    if (!qrRef.current || hasScanned || isScanning) return;
    
    console.log('Starting QR scanner...');
    setIsScanning(true);
    setError(null);
    
    try {
      // Fetch devices first
      const deviceId = await fetchAvailableDevices();
      
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
        rememberLastUsedCamera: true,
      };
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }
      
      console.log('Starting scanner with configuration:', config);
      
      const cameraConstraints = deviceId 
        ? { deviceId: { exact: deviceId } } 
        : { facingMode: 'environment' };
      
      await qrRef.current.start(
        cameraConstraints,
        config,
        onQRCodeSuccess,
        onQRCodeError
      );
      
      showNotification('Camera activated', 'info', {
        description: 'Point camera at a QR code to scan'
      });
      
      console.log('QR scanner started successfully');
    } catch (err: any) {
      console.error('Error starting QR scanner:', err);
      
      // Handle error with retry logic and fallbacks
      handleScannerStartError(err);
    }
  };
  
  const handleScannerStartError = async (err: any) => {
    // If we failed with the selected device, try with a different camera option
    if (scanAttempts.current < 2) {
      scanAttempts.current++;
      console.log(`Scanner start failed. Trying alternative camera (attempt ${scanAttempts.current})...`);
      
      try {
        if (scanAttempts.current === 1) {
          // Try with user facing camera on first retry
          await qrRef.current?.start(
            { facingMode: 'user' },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onQRCodeSuccess,
            onQRCodeError
          );
          console.log('Started with user-facing camera');
          return;
        } else {
          // Try with any available camera on second retry
          await qrRef.current?.start(
            { facingMode: { ideal: "environment" } },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            onQRCodeSuccess,
            onQRCodeError
          );
          console.log('Started with any available camera');
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
    if (qrRef.current && isScanning) {
      try {
        console.log('Stopping QR scanner...');
        await qrRef.current.stop();
        console.log('QR scanner stopped');
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
    
    // Prevent multiple scans
    if (hasScanned) return;
    setHasScanned(true);
    
    try {
      if (qrRef.current && isScanning) {
        await qrRef.current.stop();
        setIsScanning(false);
        
        showNotification('QR Code Scanned', 'success', {
          description: 'Successfully scanned QR code'
        });
        
        // Process the result
        onResult(decodedText);
      }
    } catch (err) {
      console.error('Error stopping QR scanner after successful scan:', err);
      setIsScanning(false);
      // Still pass the result even if stopping the scanner failed
      onResult(decodedText);
    }
  };
  
  const onQRCodeError = (errorMessage: string) => {
    // Don't log every frame error as it's too noisy
    // console.debug('QR scan error:', errorMessage);
  };
  
  const handleRetry = async () => {
    setPermissionDenied(false);
    setError(null);
    setHasScanned(false);
    scanAttempts.current = 0;
    
    await stopScanner();
    startScanner();
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
    setSelectedDeviceId(nextDeviceId);
    
    await stopScanner();
    // Reset scan attempts when manually switching
    scanAttempts.current = 0;
    setTimeout(() => {
      startScanner();
    }, 300);
  };

  const handleCancel = () => {
    onError('Scanning cancelled');
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Scan QR Code</h2>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleCancel}
          className="h-8 w-8"
        >
          <X size={18} />
        </Button>
      </div>
      
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
          
          {isScanning && !hasScanned && <ScannerViewfinder />}
        </div>
      )}
      
      <div className="mt-4 flex justify-between gap-3">
        <Button 
          variant="outline" 
          onClick={handleCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        
        {availableDevices.length > 1 && (
          <Button 
            variant="outline" 
            onClick={switchCamera}
            disabled={!isScanning || hasScanned}
            className="flex-1"
          >
            <Smartphone size={16} className="mr-2" />
            Switch Camera
          </Button>
        )}
      </div>
    </div>
  );
};

export default QRCodeScanner;
