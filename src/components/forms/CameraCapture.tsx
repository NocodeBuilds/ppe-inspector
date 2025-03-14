
import React, { useState, useRef, useEffect } from 'react';
import { Camera, ImageIcon, RefreshCw, Check, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';

interface CameraCaptureProps {
  onImageCapture: (imageFile: File) => void;
  existingImage?: string | null;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ 
  onImageCapture, 
  existingImage 
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(existingImage || null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

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

  const activateCamera = async () => {
    try {
      setIsInitializing(true);
      setCameraError(null);
      
      // First try to access the environment facing camera (back camera)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 } 
          },
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Wait for video to be ready
          videoRef.current.onloadedmetadata = () => {
            if (videoRef.current) {
              videoRef.current.play()
                .then(() => {
                  setIsCameraActive(true);
                  setIsInitializing(false);
                })
                .catch(err => {
                  console.error('Error playing video:', err);
                  setCameraError('Could not start video stream');
                  setIsInitializing(false);
                  stopCamera();
                });
            }
          };
        }
      } catch (environmentError) {
        // If environment camera fails, try user-facing camera
        console.warn('Could not access environment camera, trying user-facing camera:', environmentError);
        
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              facingMode: 'user',
              width: { ideal: 1280 },
              height: { ideal: 720 } 
            },
            audio: false
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            
            // Wait for video to be ready
            videoRef.current.onloadedmetadata = () => {
              if (videoRef.current) {
                videoRef.current.play()
                  .then(() => {
                    setIsCameraActive(true);
                    setIsInitializing(false);
                  })
                  .catch(err => {
                    console.error('Error playing video:', err);
                    setCameraError('Could not start video stream');
                    setIsInitializing(false);
                    stopCamera();
                  });
              }
            };
          }
        } catch (userFacingError) {
          throw new Error('Could not access any camera');
        }
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
      let errorMessage = 'Could not access camera.';
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        errorMessage = 'Camera access denied. Please grant camera permissions in your browser settings.';
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        errorMessage = 'Camera is in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'Camera constraints not satisfiable.';
      }
      
      setCameraError(errorMessage);
      setIsInitializing(false);
      stopCamera();
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

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
              setCameraError('Failed to process the captured image');
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
        setCameraError('Failed to capture image');
        toast({
          title: "Capture Failed",
          description: "Failed to capture image",
          variant: "destructive",
        });
      }
    } else {
      setCameraError('Camera not properly initialized');
      toast({
        title: "Capture Failed",
        description: "Camera not properly initialized",
        variant: "destructive",
      });
    }
  };

  const retakePhoto = () => {
    if (capturedImage) {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(capturedImage);
    }
    
    setCapturedImage(null);
    activateCamera();
  };

  return (
    <Card className="p-4 relative">
      {isCameraActive ? (
        <div className="flex flex-col items-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full rounded-md border overflow-hidden"
            style={{ height: '240px', objectFit: 'cover' }}
          />
          
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
      ) : capturedImage ? (
        <div className="flex flex-col items-center">
          <div className="relative w-full rounded-md border overflow-hidden" style={{ height: '240px' }}>
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
      ) : (
        <div className="flex flex-col items-center">
          <div 
            className="w-full h-[240px] rounded-md border border-dashed flex items-center justify-center bg-muted/30 cursor-pointer"
            onClick={isInitializing ? undefined : activateCamera}
          >
            <div className="flex flex-col items-center text-muted-foreground p-4">
              {isInitializing ? (
                <>
                  <Loader2 className="h-12 w-12 mb-2 animate-spin" />
                  <p>Initializing camera...</p>
                </>
              ) : cameraError ? (
                <>
                  <CameraOff className="h-12 w-12 mb-2 text-destructive" />
                  <p className="text-center">Camera error</p>
                  <p className="text-red-500 text-xs mt-2 text-center">{cameraError}</p>
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
              disabled={isInitializing}
            >
              {isInitializing ? (
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
      )}
      
      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Card>
  );
};

export default CameraCapture;
