
import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCw, ZapIcon, FlipHorizontal, Settings, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface QRCodeScannerProps {
  onResult: (result: string) => void;
  onClose: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ onResult, onClose }) => {
  const [cameraId, setCameraId] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitchingCamera, setIsSwitchingCamera] = useState(false);
  const [isScanComplete, setIsScanComplete] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);
  const resultTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Prevent multiple scans by tracking if a scan is in progress
  const isScanningRef = useRef(false);

  // Clean up any timeouts on unmount
  useEffect(() => {
    return () => {
      if (resultTimeoutRef.current) {
        clearTimeout(resultTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      if (!mounted) return;
      try {
        await initCamera();
      } catch (err) {
        console.error("Failed to initialize camera:", err);
        setError(err instanceof Error ? err.message : 'Failed to initialize camera');
        setIsLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
      cleanupCamera().catch(console.error);
    };
  }, []);

  const initCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });

      // Get available cameras
      const devices = await Html5Qrcode.getCameras();
      if (devices.length === 0) {
        throw new Error('No cameras found on your device');
      }

      // Map devices to our camera format
      const availableCameras = devices.map(d => ({ id: d.id, label: d.label }));
      setCameras(availableCameras);

      // Initialize scanner
      if (!scannerDivRef.current) return;
      
      // Only create a new scanner if one doesn't exist
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-scanner');
      }

      // Select back camera if available, otherwise use first camera
      const selectedCamera = devices.find(d => d.label.toLowerCase().includes('back')) || devices[0];
      setCameraId(selectedCamera.id);
      
      await startScanning(selectedCamera.id);
    } catch (err) {
      console.error('Camera init error:', err);
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      toast({
        title: "Camera Error",
        description: err instanceof Error ? err.message : 'Failed to access camera',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchCamera = async () => {
    if (!cameraId || cameras.length <= 1) return;
    
    setIsSwitchingCamera(true);
    try {
      // Stop current scanner
      await cleanupCamera();
      
      // Find next camera in the list
      const currentIndex = cameras.findIndex(cam => cam.id === cameraId);
      const nextIndex = (currentIndex + 1) % cameras.length;
      const nextCameraId = cameras[nextIndex].id;
      
      setCameraId(nextCameraId);
      await startScanning(nextCameraId);
      
      toast({
        title: "Camera Switched",
        description: `Using ${cameras[nextIndex].label.slice(0, 20)}...`
      });
    } catch (err) {
      console.error('Error switching camera:', err);
      setError('Failed to switch camera. Please try again.');
    } finally {
      setIsSwitchingCamera(false);
    }
  };

  const startScanning = async (deviceId: string) => {
    if (!scannerRef.current) return;

    try {
      setError(null);
      setIsScanning(false);
      isScanningRef.current = false;

      // Get container dimensions for optimal QR box size
      const containerWidth = scannerDivRef.current?.clientWidth || window.innerWidth;
      const containerHeight = scannerDivRef.current?.clientHeight || window.innerHeight;
      const minDimension = Math.min(containerWidth, containerHeight);
      const qrboxSize = Math.floor(minDimension * 0.7); // 70% of container size

      await scannerRef.current.start(
        deviceId,
        {
          fps: 10, // Lower FPS to save battery but still be responsive
          qrbox: {
            width: qrboxSize,
            height: qrboxSize
          },
          aspectRatio: 1
        },
        (text) => {
          // Only process a scan if we're not already processing one
          if (!isScanningRef.current) {
            handleSuccess(text);
          }
        },
        () => {} // Ignore QR detection errors
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Start scanning error:', err);
      setError('Failed to start camera. Please check permissions and try again.');
      setIsScanning(false);
    }
  };

  const cleanupCamera = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    }
  };

  const handleSuccess = async (result: string) => {
    // Set flag to prevent multiple scans
    isScanningRef.current = true;
    
    // Show result animation
    setIsScanComplete(true);
    setScanResult(result);
    
    // Play success sound if possible
    try {
      const audio = new Audio("data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAAFAAAGUACFhYWFhYWFhYWFhYWFhYWFhYWFvb29vb29vb29vb29vb29vb29vb3p6enp6enp6enp6enp6enp6enp6f////////////////////////////////8AAAA8TEFNRTMuMTAwBEgAAAAAAAAAABUgJAMGQQABmgAABlAIhvyKAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//sQxAADwAABpAAAACAAADSAAAAETEFNRTMuMTAwVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=");
      await audio.play();
    } catch (err) {
      // Silently fail if audio can't play
      console.log("Could not play audio feedback");
    }
    
    // Pause for animation before passing result
    resultTimeoutRef.current = setTimeout(() => {
      cleanupCamera().then(() => {
        onResult(result);
      });
    }, 600);
  };

  const handleRetry = async () => {
    await cleanupCamera();
    setIsScanComplete(false);
    setScanResult(null);
    initCamera();
  };

  // Permission denied or error state
  if (error) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background p-4 z-50">
        <div className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
            <Camera className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold">Camera Access Required</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="flex flex-col gap-2 mt-4">
            <Button onClick={handleRetry} className="w-full" variant="default">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            <Button onClick={onClose} className="w-full" variant="outline">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background/80 backdrop-blur-sm">
        <h2 className="text-lg font-semibold">Scan QR Code</h2>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Scanner */}
      <div className="flex-1 relative bg-black">
        {/* QR Scanner Container */}
        <div 
          id="qr-scanner" 
          ref={scannerDivRef}
          className={cn(
            "w-full h-full",
            !isScanning && "opacity-50",
            isScanComplete && "opacity-30 transition-opacity duration-500"
          )}
        />

        {/* Scanning Frame */}
        <div className={cn(
          "absolute inset-0 pointer-events-none transition-opacity duration-300",
          isScanComplete && "opacity-0"
        )}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-[70vmin] h-[70vmin] max-w-sm max-h-sm">
              {/* Corner markers with better visual design */}
              <div className="absolute left-0 top-0 w-12 h-12 border-l-4 border-t-4 border-primary rounded-tl-lg" />
              <div className="absolute right-0 top-0 w-12 h-12 border-r-4 border-t-4 border-primary rounded-tr-lg" />
              <div className="absolute left-0 bottom-0 w-12 h-12 border-l-4 border-b-4 border-primary rounded-bl-lg" />
              <div className="absolute right-0 bottom-0 w-12 h-12 border-r-4 border-b-4 border-primary rounded-br-lg" />
              
              {/* Improved scanning line animation */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-x-0 h-1 bg-primary/70 rounded-full animate-scan shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Success animation overlay */}
        {isScanComplete && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-scale-in">
                <ZapIcon className="h-10 w-10 text-white" />
              </div>
              <p className="mt-4 text-white font-medium text-center px-8">
                QR Code detected!
                <span className="block mt-2 text-sm opacity-80 truncate max-w-[250px]">
                  {scanResult}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-primary/30 rounded-full"></div>
                <div className="absolute top-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm font-medium text-white">Initializing camera...</p>
            </div>
          </div>
        )}

        {/* Camera switching overlay */}
        {isSwitchingCamera && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-20">
            <div className="flex flex-col items-center space-y-4">
              <FlipHorizontal className="h-12 w-12 text-primary animate-pulse" />
              <p className="text-sm font-medium text-white">Switching camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-background/90 backdrop-blur-sm border-t">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground flex items-center">
            <Smartphone className="mr-2 h-4 w-4" />
            Position the QR code within the frame
          </p>
          
          {/* Camera Controls */}
          <div className="flex gap-2">
            {cameras.length > 1 && (
              <Button 
                variant="outline" 
                size="icon" 
                onClick={switchCamera}
                disabled={isLoading || isSwitchingCamera || isScanComplete}
                title="Switch Camera"
              >
                <FlipHorizontal className="h-4 w-4" />
              </Button>
            )}
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleRetry}
              disabled={isLoading || isSwitchingCamera}
              title="Restart Scanner"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeScanner;
