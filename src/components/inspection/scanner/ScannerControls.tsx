
import React from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, RefreshCw, FlashlightIcon } from 'lucide-react';

interface ScannerControlsProps {
  onCancel: () => void;
  onSwitchCamera: () => void;
  onToggleFlash?: () => void;
  hasMultipleCameras: boolean;
  hasFlash?: boolean;
  isFlashOn?: boolean;
  isScanning: boolean;
  hasScanned: boolean;
}

/**
 * Enhanced controls for the QR code scanner with flash support
 */
const ScannerControls: React.FC<ScannerControlsProps> = ({
  onCancel,
  onSwitchCamera,
  onToggleFlash,
  hasMultipleCameras,
  hasFlash = false,
  isFlashOn = false,
  isScanning,
  hasScanned
}) => {
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
      
      {hasMultipleCameras && (
        <Button 
          variant="outline" 
          onClick={onSwitchCamera}
          disabled={!isScanning || hasScanned}
          className="flex items-center justify-center"
        >
          <RefreshCw size={16} className="mr-2" />
          Switch Camera
        </Button>
      )}
      
      {hasFlash && onToggleFlash && (
        <Button 
          variant={isFlashOn ? "default" : "outline"} 
          onClick={onToggleFlash}
          disabled={!isScanning || hasScanned}
          className={`flex items-center justify-center ${isFlashOn ? "bg-amber-500 hover:bg-amber-600" : ""}`}
        >
          <FlashlightIcon size={16} className="mr-2" />
          {isFlashOn ? "Flash On" : "Flash Off"}
        </Button>
      )}
    </div>
  );
};

export default ScannerControls;
