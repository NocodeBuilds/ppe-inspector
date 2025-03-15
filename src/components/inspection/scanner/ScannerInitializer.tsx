
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

  const startScanner = useCallback(async () => {
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }

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
      
      console.log('Starting scanner with configuration:', config);
      
      const cameraConstraints = selectedDeviceId 
        ? { deviceId: { exact: selectedDeviceId } } 
        : { facingMode: 'environment' };
      
      await scannerRef.current.start(
        cameraConstraints,
        config,
        onScanSuccess,
        onScanError
      );
      
      showNotification('Camera activated', 'info', {
        description: 'Point camera at a QR code to scan'
      });
      
      onScannerStart(scannerRef.current);
      console.log('QR scanner started successfully');
    } catch (err) {
      console.error('Error starting QR scanner:', err);
      onScannerError(err);
    }
  }, [scannerContainerId, onScanSuccess, onScanError, onScannerStart, onScannerError, selectedDeviceId, showNotification]);

  // Initialize scanner on mount or when deviceId changes
  useEffect(() => {
    const timer = setTimeout(() => {
      startScanner();
    }, 500);
    
    return () => {
      clearTimeout(timer);
      
      if (scannerRef.current) {
        scannerRef.current.stop().catch(error => {
          console.error('Error stopping QR scanner:', error);
        });
      }
    };
  }, [startScanner, selectedDeviceId]);

  return null; // This is a non-visual component
};

export default ScannerInitializer;
