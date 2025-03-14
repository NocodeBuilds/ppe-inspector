
import React from 'react';
import { ScanLine, Camera } from 'lucide-react';

const ScannerViewfinder: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex flex-col items-center justify-center">
      <div className="w-72 h-72 border-2 border-primary rounded-lg relative animate-pulse-slow">
        <div className="absolute top-0 left-0 w-full animate-scan">
          <ScanLine className="text-primary w-full h-1" />
        </div>
        
        {/* Corner markers for better visibility */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-md"></div>
        <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-md"></div>
        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-md"></div>
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-md"></div>
        
        {/* Camera icon */}
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
          <div className="bg-primary/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Camera className="text-primary w-6 h-6" />
          </div>
        </div>
      </div>
      <p className="mt-24 text-white drop-shadow-lg text-lg font-medium bg-black/50 px-4 py-2 rounded-md">
        Position QR code inside the frame
      </p>
    </div>
  );
};

export default ScannerViewfinder;
