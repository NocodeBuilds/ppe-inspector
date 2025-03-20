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
      <div className="scanner-frame">
        <p>Position QR code inside the frame</p>
      </div>
      <style>
        {`
          .scanner-container {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            height: 100vh;
            width: 100vw;
            background-color: #f0f0f0;
          }
          .scanner-frame {
            border: 2px dashed #4CAF50;
            width: 300px;
            height: 300px;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 20px;
            position: relative;
          }
          .scanner-frame p {
            position: absolute;
            top: -30px;
            font-size: 18px;
            color: #333;
          }
        `}
      </style>
    </div>
  );
};

export default ScannerInitializer;
