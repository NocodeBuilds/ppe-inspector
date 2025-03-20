import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ScannerInitializerProps {
  scannerContainerId: string;
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
  onScannerStart: (scanner: Html5Qrcode) => void;
  onScannerError: (error: any) => void;
  selectedDeviceId?: string;
  forceBackCamera?: boolean;
}

/**
 * Compoconst ScannerInitializer: React.FC<ScannerInitializerProps> = ({
   scannerContainerId,
   onScanSuccess,
   onScanError,
   onScannerStart,
   onScannerError,
   selectedDeviceId,
   forceBackCamera = true
 }) => {
   const scannerRef = useRef<Html5Qrcode | null>(null);
   const isMountedRef = useRef(true);
   const [isInitializing, setIsInitializing] = useState(false);
 
   // Safely clean up the scanner
   const cleanupScanner = useCallback(() => {
     if (scannerRef.current) {
       try {
         console.log('Stopping scanner...');
         scannerRef.current.stop().catch(() => {
           console.error('Failed to stop the scanner');
         });
       } catch (error) {
         console.error('Error during scanner cleanup:', error);
       }
     }
   }, []);
 
   // Initialize the scanner
   useEffect(() => {
     if (isMountedRef.current) {
       // Ensure scannerContainerId is valid
       if (!scannerContainerId) {
         console.error('Scanner container ID is not defined');
         return;
       }
 
       setIsInitializing(true);
       const scanner = new Html5Qrcode(scannerContainerId, {
         formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
         useBarCodeDetectorIfSupported: true,
       });
 
       scanner.start(
         { deviceId: { exact: selectedDeviceId || '' } },
         {
           fps: 10,
           qrbox: { width: 250, height: 250 },
           aspectRatio: 1.0,
           disableFlip: forceBackCamera,
         },
         onScanSuccess,
         onScanError
       ).then(() => {
         onScannerStart(scanner);
         scannerRef.current = scanner;
       }).catch(onScannerError).finally(() => {
         setIsInitializing(false);
       });
 
       return () => {
         cleanupScanner();
         isMountedRef.current = false;
       };
     }
   }, [scannerContainerId, selectedDeviceId, forceBackCamera, onScanSuccess, onScanError, onScannerStart, onScannerError, cleanupScanner]);
 
   return (
     <div id={scannerContainerId}>
       {isInitializing && <p>Initializing scanner...</p>}
     </div>
   );
 };nent responsible for initializing and managing the HTML5 QR scanner
 * Improved with better state management and error handling
 */
const ScannerInitializer: React.FC<ScannerInitializerProps> = ({
  scannerContainerId,
  onScanSuccess,
  onScanError,
  onScannerStart,
  onScannerError,
  selectedDeviceId,
  forceBackCamera = true
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isMountedRef = useRef(true);
  const [isInitializing, setIsInitializing] = useState(false);

  // Safely clean up the scanner
  const cleanupScanner = useCallback(() => {
    if (scannerRef.current) {
      try {
        console.log('Stopping scanner...');
        scannerRef.current.stop().catch(() => {
          console.log('Error stopping scanner, but continuing cleanup');
        });
      } catch (e) {
        console.log('Exception during scanner cleanup, ignoring:', e);
      } finally {
        console.log('Scanner cleanup complete');
        scannerRef.current = null;
      }
    }
  }, []);

  // Handle successful scan with proper data extraction
  const handleScanSuccess = useCallback((decodedText: string) => {
    if (!isMountedRef.current) return;
    
    console.log('QR code scan successful, raw text:', decodedText);
    
    // Try to extract a serial number from the QR code
    let serialNumber = decodedText.trim();
    
    try {
      // Check if it's a URL with parameters
      if (decodedText.includes('?')) {
        try {
          const url = new URL(decodedText);
          // Look for serial parameter
          const serialParam = url.searchParams.get('serial') || 
                             url.searchParams.get('serialNumber') || 
                             url.searchParams.get('serial_number');
          if (serialParam) {
            serialNumber = serialParam;
          }
        } catch (e) {
          console.log('Error parsing URL, using raw text');
        }
      } 
      // Check if it's JSON
      else if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
        try {
          const jsonData = JSON.parse(decodedText);
          // Try common JSON key names for serial number
          serialNumber = jsonData.serial || 
                        jsonData.serialNumber || 
                        jsonData.serial_number || 
                        jsonData.id || 
                        decodedText;
        } catch (e) {
          console.log('Error parsing JSON, using raw text');
        }
      }
      
      console.log('Extracted serial number:', serialNumber);
      
      // Stop scanner before calling success handler to prevent state conflicts
      cleanupScanner();
      
      // Now call the success handler with the extracted serial number
      onScanSuccess(serialNumber);
    } catch (error) {
      console.log('Error parsing QR code, using raw text:', error);
      cleanupScanner();
      onScanSuccess(decodedText);
    }
  }, [onScanSuccess, cleanupScanner]);

  // Find the best camera to use (preferring back camera for mobile devices)
  const findBestCamera = useCallback(async () => {
    try {
      // Ensure we have camera access first
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices);
      
      // If we're forcing back camera or no specific device is selected
      if (forceBackCamera || !selectedDeviceId) {
        // Try to find a back camera
        const backCamera = videoDevices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('environment') ||
          device.label.toLowerCase().includes('rear')
        );
        
        if (backCamera) {
          console.log('Found back camera:', backCamera.label);
          return backCamera.deviceId;
        }
      }
      
      // If a specific device is requested and not forcing back camera
      if (selectedDeviceId && !forceBackCamera) {
        console.log('Using selected device:', selectedDeviceId);
        return selectedDeviceId;
      }
      
      // Fallback to first available camera
      if (videoDevices.length > 0) {
        console.log('Falling back to first camera:', videoDevices[0].label);
        return videoDevices[0].deviceId;
      }
      
      console.log('No cameras found');
      return null;
    } catch (error) {
      console.error('Error accessing cameras:', error);
      return null;
    }
  }, [selectedDeviceId, forceBackCamera]);

  const startScanner = useCallback(async () => {
    if (!isMountedRef.current || isInitializing) return;
    
    setIsInitializing(true);
    
    try {
      // Clean up any existing scanner
      cleanupScanner();

      // Find the best camera to use
      const deviceId = await findBestCamera();
      console.log('Best camera device ID:', deviceId);

      // Create a new scanner instance
      console.log('Creating new scanner instance for', scannerContainerId);
      scannerRef.current = new Html5Qrcode(scannerContainerId, {
        verbose: true,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
      });

      const config = {
        fps: 15,
        qrbox: {
          width: Math.min(250, window.innerWidth - 50),
          height: Math.min(250, window.innerWidth - 50)
        },
        aspectRatio: window.innerHeight / window.innerWidth,
        disableFlip: false,
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
      };
      
      if (!isMountedRef.current) {
        cleanupScanner();
        return;
      }
      
      // Create a simplified camera identifier object
      // Must contain ONLY ONE of: deviceId OR facingMode
      const cameraIdentifier = deviceId 
        ? { deviceId: { exact: deviceId } } 
        : { facingMode: "environment" };
      
      console.log('Starting scanner with camera identifier:', cameraIdentifier);

      if (!deviceId) {
        onScannerError('No valid device ID found');
        return;
      }

      await scannerRef.current.start(
        cameraIdentifier,  // Only pass the camera identifier here - MUST have just ONE key
        config,
        handleScanSuccess,
        onScanError
      ).then(() => {
          console.log('QR scanner started successfully');
          onScannerStart(scannerRef.current);
        })
        .catch((error) => {
          console.error('Error starting QR scanner:', error);
          onScannerError(error);
        });
    } catch (error) {
      console.error('Error initializing scanner:', error);
      onScannerError(error);
    } finally {
      if (isMountedRef.current) {
        setIsInitializing(false);
      }
    }
  }, [scannerContainerId, onScanSuccess, onScanError, cleanupScanner, findBestCamera, isMountedRef, onScannerError]);

  useEffect(() => {
    // Start the scanner when the component mounts
    startScanner();

    // Clean up the scanner when the component unmounts
    return () => {
      isMountedRef.current = false;
      cleanupScanner();
    };
  }, [startScanner, cleanupScanner]);

  return null; // This is a non-visual component
};

export default ScannerInitializer;
