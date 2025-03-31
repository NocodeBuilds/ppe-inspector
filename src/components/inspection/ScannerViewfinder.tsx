import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Flashlight, Focus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ScannerViewfinderProps {
  isScanning: boolean;
  onTorchToggle?: () => void;
  onFocusChange?: (mode: 'auto' | 'manual') => void;
  torchEnabled?: boolean;
  focusMode?: 'auto' | 'manual';
  hasTorch?: boolean;
}

const ScannerViewfinder: React.FC<ScannerViewfinderProps> = ({
  isScanning,
  onTorchToggle,
  onFocusChange,
  torchEnabled = false,
  focusMode = 'auto',
  hasTorch = false
}) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {/* Viewfinder Frame */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72">
        {/* Main frame with gradient border */}
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 border-2 border-primary/50 rounded-lg"></div>
          
          {/* Animated gradient corners */}
          <motion.div 
            className="absolute inset-0"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: isScanning ? 1 : 0.5 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          >
            {/* Corner markers with gradients */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-md bg-gradient-to-br from-primary/20 to-transparent"></div>
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-md bg-gradient-to-bl from-primary/20 to-transparent"></div>
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-md bg-gradient-to-tr from-primary/20 to-transparent"></div>
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-md bg-gradient-to-tl from-primary/20 to-transparent"></div>
          </motion.div>
        </div>

        {/* Scanning line animation */}
        <motion.div 
          className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
          initial={{ top: 0, opacity: 0 }}
          animate={{ 
            top: ["0%", "100%"],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>
      
      {/* Instruction text with better visibility */}
      <div className="mt-6 px-6 py-3 bg-black/70 backdrop-blur-sm rounded-lg">
        <p className="text-white text-body-sm text-center">
          Position the QR code inside the frame
        </p>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
        <div className="flex justify-between items-center max-w-xs mx-auto">
          {hasTorch && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onTorchToggle}
              className="bg-black/20 hover:bg-black/30"
            >
              <Flashlight className={cn(
                "w-5 h-5",
                torchEnabled ? "text-yellow-400" : "text-white"
              )} />
              <span className="sr-only">
                {torchEnabled ? "Disable torch" : "Enable torch"}
              </span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onFocusChange?.(focusMode === 'auto' ? 'manual' : 'auto')}
            className="bg-black/20 hover:bg-black/30"
          >
            <Focus className="w-5 h-5 text-white" />
            <span className="sr-only">
              {focusMode === 'auto' ? "Switch to manual focus" : "Switch to auto focus"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScannerViewfinder;
