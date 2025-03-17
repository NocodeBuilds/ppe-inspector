
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RefreshCw } from 'lucide-react';

interface ScannerControlsProps {
  onCancel: () => void;
  onSwitchCamera?: () => void;
  hasMultipleCameras: boolean;
  isScanning: boolean;
  hasScanned: boolean;
}

/**
 * Simplified controls for the QR code scanner with better error handling
 */
const ScannerControls: React.FC<ScannerControlsProps> = ({
  onCancel,
  onSwitchCamera,
  hasMultipleCameras,
  isScanning,
  hasScanned
}) => {
  // Handle camera switch with logging for debugging
  const handleSwitchCamera = () => {
    console.log("ScannerControls: Switching camera");
    if (onSwitchCamera) {
      onSwitchCamera();
    }
  };

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <Button 
        variant="outline" 
        onClick={onCancel}
        className="flex items-center justify-center"
      >
        <X size={16} className="mr-2" />
        Cancel
      </Button>
      
      {hasMultipleCameras && onSwitchCamera && (
        <Button 
          variant="outline" 
          onClick={handleSwitchCamera}
          disabled={!isScanning || hasScanned}
          className="flex items-center justify-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Switch Camera
        </Button>
      )}
    </div>
  );
};

export default ScannerControls;
