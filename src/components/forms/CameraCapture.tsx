
import React, { useState, useRef, useEffect } from 'react';
import { Camera, ImageIcon, RefreshCw, Check, CameraOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import LoadingSpinner from '@/components/common/LoadingSpinner';

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
  const [cameraTimeout, setCameraTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
      if (cameraTimeout) {
        clearTimeout(cameraTimeout);
      }
    };
  }, [cameraTimeout]);

  // Stop camera and release resources
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
    
    setIsCameraActive(false);
    setIsLoading(false);
  };

  // Function to compress and resize images for better performance
  const resizeAndCompressImage = async (imageDataUrl: string, maxWidth = 800, quality = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions if image is larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress image
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get compressed data URL
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = imageDataUrl;
    });
  };

  // Start camera with simpler constraints focused on back camera first
  const startCamera = async () => {
    setIsLoading(true);
    setError(null);
    console.log("CameraCapture: Starting camera initialization");
    
    // Set a timeout to prevent getting stuck in loading state
    const timeout = setTimeout(() => {
      console.log("CameraCapture: Camera initialization timed out");
      if (isLoading) {
        setError('Camera initialization timed out. Please try again.');
        setIsLoading(false);
        if (streamRef.current) {
          stopCamera();
        }
      }
    }, 10000); // 10 second timeout
    
    setCameraTimeout(timeout);
    
    try {
      if (streamRef.current) {
        stopCamera();
      }
      
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }
      
      // Simple constraints focused on getting any camera working first
      console.log("CameraCapture: Requesting camera with basic constraints");
      let stream: MediaStream;
      
      try {
        // First try to get the environment-facing (back) camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        console.log("CameraCapture: Successfully got environment camera");
      } catch (err) {
        console.log("CameraCapture: Couldn't get environment camera, trying any camera", err);
        // If that fails, try to get any camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
        console.log("CameraCapture: Successfully got any camera");
      }
      
      // Check if we got a valid stream
      if (!stream) {
        throw new Error('Could not access any camera');
      }
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          console.log("CameraCapture: Video metadata loaded");
          if (videoRef.current) {
            videoRef.current.play()
              .then(() => {
                console.log("CameraCapture: Video playback started");
                setIsCameraActive(true);
                setIsLoading(false);
                
                // Clear the timeout since camera initialized successfully
                if (cameraTimeout) {
                  clearTimeout(cameraTimeout);
                  setCameraTimeout(null);
                }
              })
              .catch(err => {
                console.error('Error playing video:', err);
                setError('Could not start video playback');
                setIsLoading(false);
                stopCamera();
                
                // Clear the timeout
                if (cameraTimeout) {
                  clearTimeout(cameraTimeout);
                  setCameraTimeout(null);
                }
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
      
      // Clear the timeout
      if (cameraTimeout) {
        clearTimeout(cameraTimeout);
        setCameraTimeout(null);
      }
      
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  // Activate camera on button click
  const activateCamera = () => {
    startCamera();
  };

  // Capture image from video stream
  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !streamRef.current) {
      toast({
        title: "Error",
        description: "Camera not properly initialized",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Set canvas dimensions to match video dimensions
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      const context = canvas.getContext('2d');
      if (context) {
        // Draw the current video frame to the canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Compress the image before converting to file
        const rawImageUrl = canvas.toDataURL('image/jpeg', 0.85);
        const compressedImageUrl = await resizeAndCompressImage(rawImageUrl, 800, 0.7);
        
        // Convert compressed data URL to blob
        const response = await fetch(compressedImageUrl);
        const blob = await response.blob();
        
        // Create a File from the blob
        const file = new File([blob], `ppe-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
        
        // Pass the file to parent component
        onImageCapture(file);
        
        // Create a URL for preview
        setCapturedImage(compressedImageUrl);
        
        // Show success toast
        toast({
          title: "Image Captured",
          description: "Photo saved successfully",
        });
        
        // Stop the camera after capturing
        stopCamera();
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      setError('Failed to capture image');
      toast({
        title: "Capture Failed",
        description: "Failed to capture image",
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
            onClick={!isLoading && !error ? activateCamera : undefined}
            style={{ cursor: !isLoading && !error ? 'pointer' : 'default' }}
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
                  {error ? "Try Again" : "Open Camera"}
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
