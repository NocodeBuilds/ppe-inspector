import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

interface ScannerPermissionRequestProps {
  onRetry: () => void;
}

const ScannerPermissionRequest: React.FC<ScannerPermissionRequestProps> = ({ onRetry }) => {
  return (
    <div className="text-center p-6 border rounded-lg">
      <div className="mb-4 mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
        <Camera size={24} className="text-muted-foreground" />
      </div>
      <h3 className="h3 mb-2">Camera Access Required</h3>
      <p className="text-body text-muted-foreground mb-4">
        Please allow camera access to scan QR codes.
      </p>
      <Button onClick={onRetry}>
        <span className="text-body-sm">Try Again</span>
      </Button>
    </div>
  );
};

export default ScannerPermissionRequest;
