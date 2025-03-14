
import React from 'react';
import { ScanLine } from 'lucide-react';

const ScannerViewfinder: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center justify-center">
      <div className="w-64 h-64 border-2 border-primary rounded-lg relative animate-pulse-slow">
        <div className="absolute top-0 left-0 w-full animate-scan">
          <ScanLine className="text-primary w-full h-1" />
        </div>
        
        {/* Corner markers for better visibility */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary"></div>
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary"></div>
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary"></div>
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary"></div>
      </div>
      <p className="mt-4 text-white drop-shadow-lg text-lg font-medium bg-black/30 px-3 py-1 rounded-md">
        Position QR code inside the box
      </p>
    </div>
  );
};

export default ScannerViewfinder;
