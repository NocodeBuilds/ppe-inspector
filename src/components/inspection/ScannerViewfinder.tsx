
import React from 'react';
import { ScanLine } from 'lucide-react';

const ScannerViewfinder: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center justify-center">
      <div className="w-60 h-60 border-2 border-primary rounded-lg relative">
        <div className="absolute top-0 left-0 w-full animate-scan">
          <ScanLine className="text-primary" />
        </div>
      </div>
      <p className="mt-4 text-white drop-shadow-lg text-shadow">
        Position QR code inside the box
      </p>
    </div>
  );
};

export default ScannerViewfinder;
