import React, { useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useNotifications } from '@/hooks/useNotifications';

interface ScannerInitializerProps {
  scannerContainerId: string;
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
  onScannerStart: (scanner: Html5Qrcode) => void;
  onScannerError: (error: any) => void;
  selectedDeviceId: string;
}

/**
 * Component responsible for initializing and managing the HTML5 QR scanner
 */
const ScannerInitializer: React.FC<ScannerInitializerProps> = ({
  scannerContainerId,
  onScanSuccess,
  onScanError,
  onScannerStart,
  onScannerError,
  selectedDeviceId
}) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { showNotification } = useNotifications();
  const isMountedRef = useRef(true);

  // Handle successful scan with proper data extraction
  const handleScanSuccess = useCallback((decodedText: string) => {
    if (!isMountedRef.current) return;
    
    console.log('QR code scan successful, raw text:', decodedText);
    
    // Try to extract a serial number from the QR code
    // Common QR code formats: plain text, URL with params, or JSON
    let serialNumber = decodedText.trim();
    
    try {
      // Check if it's a URL with parameters
      if (decodedText.includes('?')) {
        const url = new URL(decodedText);
        // Look for serial parameter
        const serialParam = url.searchParams.get('serial') || 
                           url.searchParams.get('serialNumber') || 
                           url.searchParams.get('serial_number');
        if (serialParam) {
          serialNumber = serialParam;
        }
      } 
      // Check if it's JSON
      else if (decodedText.startsWith('{') && decodedText.endsWith('}')) {
        const jsonData = JSON.parse(decodedText);
        // Try common JSON key names for serial number
        serialNumber = jsonData.serial || 
                      jsonData.serialNumber || 
                      jsonData.serial_number || 
                      jsonData.id || 
                      decodedText;
      }
      
      console.log('Extracted serial number:', serialNumber);
      onScanSuccess(serialNumber);
    } catch (error) {
      console.log('Error parsing QR code, using raw text:', error);
      // If parsing fails, just use the raw text
      onScanSuccess(decodedText);
    }
  }, [onScanSuccess]);

  const startScanner = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    try {
      // Ensure we don't have an active scanner
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {
          // Ignore stop errors
        });
        scannerRef.current = null;
      }

      // Create a new scanner
      scannerRef.current = new Html5Qrcode(scannerContainerId);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
        formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
        experimentalFeatures: {
          useBarCodeDetectorIfSupported: true
        },
      };
      
      console.log('Starting scanner with configuration:', config);
      
      // Camera constraints logic - first define type to avoid TypeScript errors
      let cameraConstraints: { facingMode?: string; deviceId?: { exact: string } };
      
      // If a specific device ID is provided, use it
      if (selectedDeviceId) {
        cameraConstraints = {
          deviceId: { exact: selectedDeviceId }
        };
      } else {
        // Otherwise use environment (back) camera
        cameraConstraints = { 
          facingMode: 'environment' 
        };
      }
      
      if (!isMountedRef.current) return;
      
      await scannerRef.current.start(
        cameraConstraints,
        config,
        handleScanSuccess,
        onScanError
      );
      
      if (isMountedRef.current) {
        showNotification('Camera activated', 'info', {
          description: 'Point camera at a QR code to scan'
        });
        
        onScannerStart(scannerRef.current);
        console.log('QR scanner started successfully');
      }
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      if (isMountedRef.current) {
        onScannerError(err);
      }
    }
  }, [scannerContainerId, handleScanSuccess, onScanError, onScannerStart, onScannerError, selectedDeviceId, showNotification]);

  // Initialize scanner on mount or when deviceId changes
  useEffect(() => {
    isMountedRef.current = true;
    
    // Use timeout to ensure DOM is ready
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        startScanner();
      }
    }, 500);
    
    return () => {
      isMountedRef.current = false;
      clearTimeout(timer);
      
      // Clean up scanner
      if (scannerRef.current) {
        scannerRef.current.stop().catch(error => {
          console.error('Error stopping QR scanner:', error);
        });
        scannerRef.current = null;
      }
    };
  }, [startScanner, selectedDeviceId]);

  return null; // This is a non-visual component
};

export default ScannerInitializer;
