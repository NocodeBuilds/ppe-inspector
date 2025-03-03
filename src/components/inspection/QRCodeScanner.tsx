
import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Info, ArrowLeft } from 'lucide-react';

interface QRCodeScannerProps {
  onScan: (data: string) => void;
  onCancel: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onScan, onCancel }) => {
  const [error, setError] = useState<string | null>(null);

  const handleScan = (result: any) => {
    if (result) {
      onScan(result?.text);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError('Failed to access camera. Please make sure you have granted camera permissions.');
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex items-center mb-4">
        <Button variant="ghost" size="sm" onClick={onCancel} className="mr-2">
          <ArrowLeft size={18} />
        </Button>
        <h2 className="text-xl font-bold">Scan QR Code</h2>
      </div>

      <Card className="overflow-hidden mb-4">
        <QrReader
          constraints={{ facingMode: 'environment' }}
          onResult={handleScan}
          videoStyle={{ width: '100%', height: '100%' }}
          videoContainerStyle={{ 
            width: '100%', 
            height: '300px',
            borderRadius: '0.5rem',
            overflow: 'hidden' 
          }}
          scanDelay={500}
        />
      </Card>

      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm flex items-start">
          <Info size={16} className="mr-2 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-muted p-4 rounded-md mt-4">
        <p className="text-sm text-muted-foreground">
          Position the QR code within the frame to scan. Make sure the code is well-lit and clearly visible.
        </p>
      </div>

      <Button variant="outline" onClick={onCancel} className="mt-4">
        Cancel
      </Button>
    </div>
  );
};

export default QRCodeScanner;
