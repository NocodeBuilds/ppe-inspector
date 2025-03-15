
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ScannerHeaderProps {
  onClose: () => void;
}

/**
 * Header component for the QR code scanner
 */
const ScannerHeader: React.FC<ScannerHeaderProps> = ({ onClose }) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Scan QR Code</h2>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onClose}
        className="h-8 w-8"
      >
        <X size={18} />
      </Button>
    </div>
  );
};

export default ScannerHeader;
