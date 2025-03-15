
import React, { useState, useRef, useEffect } from 'react';
import { Camera, ImageIcon, RefreshCw, Check, CameraOff, Loader2, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import IconButton from '@/components/ui/icon-button';

interface CameraCaptureProps {
  onImageCapture: (imageFile: File) => void;
  existingImage?: string | null;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onImageCapture, 
  existingImage 
}) => {
  // State management
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(existingImage || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Stop camera and release resources
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
  };

  // Start camera with current facing mode
  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (streamRef.current) {
        stopCamera();
      }
      
      // Request camera access with proper constraints
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      // Try to get media stream
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                setIsCameraActive(true);
                setIsLoading(false);
              })
              .catch(err => {
                console.error('Error playing video:', err);
                setError('Could not start video playback');
                setIsLoading(false);
                stopCamera();
              });
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
        errorMessage = 'Camera constraints not satisfiable.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      
      // If environment camera fails, try user-facing camera
      if (facingMode === 'environment' && !streamRef.current) {
        setFacingMode('user');
        setTimeout(() => startCamera(), 500);
      } else {
        toast({
          title: "Camera Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  };

  // Switch between front and back cameras
  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => startCamera(), 300);
    }
  };

  // Activate camera on button click
  const activateCamera = () => {
    startCamera();
  };

  // Capture image from video stream
  const captureImage = () => {
    if (videoRef.current && canvasRef.current && streamRef.current) {
      try {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        
        // Set canvas dimensions to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const context = canvas.getContext('2d');
        if (context) {
          // Draw the current video frame to the canvas
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          // Convert canvas to blob and create a file
          canvas.toBlob((blob) => {
            if (blob) {
              const file = new File([blob], `ppe-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
              
              // Pass the file to parent component
              onImageCapture(file);
              
              // Create a URL for preview
              const imageUrl = URL.createObjectURL(blob);
              setCapturedImage(imageUrl);
              
              // Show success toast
              toast({
                title: "Image Captured",
                description: "Photo saved successfully",
              });
            } else {
              setError('Failed to process the captured image');
              toast({
                title: "Capture Failed",
                description: "Failed to process the captured image",
                variant: "destructive",
              });
            }
          }, 'image/jpeg', 0.8);
        }
        
        // Stop the camera after capturing
        stopCamera();
      } catch (error) {
        console.error('Error capturing image:', error);
        setError('Failed to capture image');
        toast({
          title: "Capture Failed",
          description: "Failed to capture image",
          variant: "destructive",
        });
      }
    } else {
      setError('Camera not properly initialized');
      toast({
        title: "Capture Failed",
        description: "Camera not properly initialized",
        variant: "destructive",
      });
    }
  };

  // Retake photo
  const retakePhoto = () => {
    if (capturedImage) {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(capturedImage);
    }
    
    setCapturedImage(null);
    activateCamera();
  };

  // Render the camera states: idle, active or captured
  const renderCameraState = () => {
    if (isCameraActive) {
      return (
        <div className="flex flex-col items-center">
          <div className="relative w-full rounded-md overflow-hidden bg-black">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full rounded-md"
              style={{ height: '240px', objectFit: 'cover' }}
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 bg-black/40 hover:bg-black/60"
              onClick={toggleCamera}
            >
              <SwitchCamera size={16} className="text-white" />
            </Button>
          </div>
          
          <div className="mt-4 flex justify-center gap-2">
            <Button
              type="button"
              onClick={stopCamera}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={captureImage}
              variant="default"
            >
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          </div>
        </div>
      );
    } else if (capturedImage) {
      return (
        <div className="flex flex-col items-center">
          <div className="relative w-full rounded-md overflow-hidden" style={{ height: '240px' }}>
            <img 
              src={capturedImage} 
              alt="Captured PPE"
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
              <Check className="h-4 w-4 text-white" />
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              onClick={retakePhoto}
              variant="outline"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Retake Photo
            </Button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center">
          <div 
            className="w-full h-[240px] rounded-md border border-dashed flex items-center justify-center bg-muted/30"
          >
            <div className="flex flex-col items-center text-muted-foreground p-4">
              {isLoading ? (
                <LoadingSpinner size="md" text="Initializing camera..." />
              ) : error ? (
                <>
                  <CameraOff className="h-12 w-12 mb-2 text-destructive" />
                  <p className="text-center">Camera error</p>
                  <p className="text-red-500 text-xs mt-2 text-center">{error}</p>
                </>
              ) : (
                <>
                  <ImageIcon className="h-12 w-12 mb-2" />
                  <p>Click to take a photo of the PPE</p>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              onClick={activateCamera}
              variant="outline"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Open Camera
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="p-4 relative">
      {renderCameraState()}
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Card>
  );
};

export default CameraCapture;
