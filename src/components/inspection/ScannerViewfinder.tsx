
import React from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';

const ScannerViewfinder: React.FC = () => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* Viewfinder Frame */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 border-2 border-primary rounded-lg overflow-hidden">
        {/* Scanning line animation */}
        <motion.div 
          className="absolute top-0 left-0 w-full h-1 bg-primary/70"
          initial={{ top: 0 }}
          animate={{ top: "100%" }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            repeatType: "reverse",
            ease: "easeInOut"
          }}
        />
        
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-md"></div>
        <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-md"></div>
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-md"></div>
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-md"></div>
      </div>
      
      {/* Instruction text */}
      <p className="mt-6 text-white text-lg font-medium bg-black/50 px-4 py-2 rounded-md max-w-xs text-center">
        Position the QR code inside the frame
      </p>
    </div>
  );
};

export default ScannerViewfinder;
