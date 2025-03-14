
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Smartphone } from 'lucide-react';

interface ScannerControlsProps {
  onCancel: () => void;
  onSwitchCamera: () => void;
  hasMultipleCameras: boolean;
  isScanning: boolean;
  hasScanned: boolean;
}

/**
 * Controls for the QR code scanner
 */
const ScannerControls: React.FC<ScannerControlsProps> = ({
  onCancel,
  onSwitchCamera,
  hasMultipleCameras,
  isScanning,
  hasScanned
}) => {
  return (
    <div className="mt-4 flex justify-between gap-3">
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="flex-1"
      >
        Cancel
      </Button>
      
      {hasMultipleCameras && (
        <Button 
          variant="outline" 
          onClick={onSwitchCamera}
          disabled={!isScanning || hasScanned}
          className="flex-1"
        >
          <Smartphone size={16} className="mr-2" />
          Switch Camera
        </Button>
      )}
    </div>
  );
};

export default ScannerControls;
