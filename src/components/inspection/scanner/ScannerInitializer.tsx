import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';

interface ScannerInitializerProps {
  scannerContainerId: string;
  onScanSuccess: (decodedText: string) => void;
  onScanError: (errorMessage: string) => void;
  onScannerStart: (scanner: Html5Qrcode) => void;
  onScannerError: (error: any) => void;
  selectedDeviceId?: string;
  forceBackCamera?: boolean;
}

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

  useEffect(() => {
    if (isMountedRef.current) {
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
    <div id={scannerContainerId} className="scanner-container">
      {isInitializing && <p>Initializing scanner...</p>}
      {/* Add custom UI elements here */}
      <style>
        {`
          .scanner-container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
          }
          .scanner-container p {
            font-size: 24px;
            font-weight: bold;
            color: #333;
          }
        `}
      </style>
    </div>
  );
};

export default ScannerInitializer;
