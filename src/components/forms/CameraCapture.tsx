
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import CardOverlay from '@/components/ui/card-overlay';

interface CameraCaptureProps {
  onImageCapture: (file: File) => void;
  existingImage?: File | null;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({
  onImageCapture,
  existingImage
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraTimeout, setCameraTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  useEffect(() => {
    // Clean up on unmount
    return () => {
      stopCamera();
    };
  }, []);
  
  const stopCamera = () => {
    console.log("CameraCapture: Stopping camera");
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Clear any existing timeout
    if (cameraTimeout) {
      clearTimeout(cameraTimeout);
      setCameraTimeout(null);
    }
    
    setIsCapturing(false);
  };
  
  const startCamera = async () => {
    setIsCameraOpen(true);
    setIsCapturing(true);
    setCameraError(null);
    
    console.log("CameraCapture: Starting camera");
    
    // Set a timeout to prevent getting stuck in loading state
    const timeout = setTimeout(() => {
      console.log("CameraCapture: Camera initialization timed out");
      if (isCapturing) {
        setCameraError("Camera initialization timed out. Please try again.");
        setIsCapturing(false);
      }
    }, 10000); // 10 second timeout
    
    setCameraTimeout(timeout);
    
    try {
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }
      
      // Try to get a stream with back camera if possible
      let stream: MediaStream;
      
      try {
        // First try with environment-facing camera
        console.log("CameraCapture: Trying with environment facing camera");
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        });
      } catch (err) {
        console.log("CameraCapture: Environment facing failed, trying default camera", err);
        // If that fails, try with default camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
      }
      
      // Store the stream ref
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        videoRef.current.onloadedmetadata = async () => {
          console.log("CameraCapture: Video metadata loaded");
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              console.log("CameraCapture: Video playback started");
              
              // Clear the timeout since camera initialized successfully
              if (cameraTimeout) {
                clearTimeout(cameraTimeout);
                setCameraTimeout(null);
              }
            } catch (error) {
              console.error("Error playing video:", error);
              setCameraError("Could not start video playback");
              stopCamera();
            } finally {
              setIsCapturing(false);
            }
          }
        };
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Could not access camera.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera access denied. Please grant camera permissions.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera is in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera does not meet the required constraints.';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Invalid constraints or parameters.';
      }

      setCameraError(errorMessage);
      
      // Clear the timeout
      if (cameraTimeout) {
        clearTimeout(cameraTimeout);
        setCameraTimeout(null);
      }
      
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: errorMessage
      });
    } finally {
      // Ensure isCapturing is set to false if it hasn't been already
      setTimeout(() => {
        if (isCapturing) {
          setIsCapturing(false);
        }
      }, 3000);
    }
  };
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      setCameraError("Camera is not ready");
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      // Set canvas size to match video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas content to blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image blob');
        }
        
        // Create a File object from the blob
        const fileName = `ppe_photo_${new Date().getTime()}.jpg`;
        const file = new File([blob], fileName, { type: 'image/jpeg' });
        
        // Close camera and pass image data
        stopCamera();
        setIsCameraOpen(false);
        onImageCapture(file);
        
        toast({
          title: 'Photo Captured',
          description: 'Image has been captured successfully'
        });
      }, 'image/jpeg', 0.8);
    } catch (error: any) {
      console.error('Error capturing photo:', error);
      setCameraError(error.message || 'Failed to capture image');
      
      toast({
        variant: 'destructive',
        title: 'Capture Error',
        description: error.message || 'Failed to capture image'
      });
    }
  };
  
  return (
    <div>
      <div className="flex items-center gap-3">
        <Button 
          type="button" 
          variant="outline" 
          onClick={startCamera}
          className="flex items-center gap-2"
        >
          <Camera size={16} />
          {existingImage ? 'Change Photo' : 'Take Photo'}
        </Button>
        
        {existingImage && (
          <div className="h-12 w-12 rounded overflow-hidden border">
            <p className="text-xs text-muted-foreground mt-2">
              {existingImage.name}
            </p>
          </div>
        )}
      </div>
      
      <CardOverlay
        show={isCameraOpen}
        onClose={() => {
          stopCamera();
          setIsCameraOpen(false);
        }}
        title="Take Photo"
      >
        <div className="space-y-4">
          {cameraError ? (
            <div className="text-center p-4 border rounded">
              <p className="text-destructive mb-3">{cameraError}</p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => {
                  setCameraError(null);
                  startCamera();
                }}>Try Again</Button>
                <Button variant="outline" onClick={() => {
                  stopCamera();
                  setIsCameraOpen(false);
                }}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="aspect-video bg-black rounded-md overflow-hidden relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                {isCapturing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    stopCamera();
                    setIsCameraOpen(false);
                  }}
                >
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                
                <Button 
                  onClick={capturePhoto}
                  disabled={isCapturing || !streamRef.current}
                >
                  <Camera size={16} className="mr-2" />
                  Capture
                </Button>
              </div>
            </>
          )}
        </div>
      </CardOverlay>
    </div>
  );
};

export default CameraCapture;
