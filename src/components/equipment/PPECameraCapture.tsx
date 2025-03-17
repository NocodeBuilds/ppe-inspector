
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import CardOverlay from '@/components/ui/card-overlay';

interface PPECameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  existingImage?: string | null;
}

const PPECameraCapture: React.FC<PPECameraCaptureProps> = ({ 
  onCapture, 
  existingImage 
}) => {
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Cleanup function to stop camera stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  // Function to get available cameras with preference for back camera
  const getBackCamera = async () => {
    try {
      // First, request general camera access to prompt permissions
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(cameras);
      
      // Try to find a back camera by label
      const backCamera = cameras.find(camera => 
        camera.label.toLowerCase().includes('back') || 
        camera.label.toLowerCase().includes('rear') || 
        camera.label.toLowerCase().includes('environment')
      );
      
      // Return back camera ID or first camera ID as fallback
      return backCamera ? backCamera.deviceId : (cameras.length > 0 ? cameras[0].deviceId : null);
    } catch (error) {
      console.error('Error getting cameras:', error);
      return null;
    }
  };
  
  // Start camera stream
  const startCamera = async () => {
    setIsCameraOpen(true);
    setIsCapturing(true);
    setCameraError(null);
    
    try {
      const backCameraId = await getBackCamera();
      
      if (!backCameraId) {
        throw new Error('No camera found on this device');
      }
      
      // Request specific camera using deviceId
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: backCameraId },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (error: any) {
      console.error('Camera error:', error);
      setCameraError(error.message || 'Could not access camera');
      toast({
        variant: 'destructive',
        title: 'Camera Error',
        description: error.message || 'Could not access camera'
      });
    } finally {
      setIsCapturing(false);
    }
  };
  
  // Handle photo capture
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
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
      
      // Get image data URL
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Close camera and pass image data
      stopCamera();
      setIsCameraOpen(false);
      onCapture(imageDataUrl);
      
      toast({
        title: 'Photo Captured',
        description: 'Image has been captured successfully'
      });
    } catch (error: any) {
      console.error('Error capturing photo:', error);
      toast({
        variant: 'destructive',
        title: 'Capture Error',
        description: error.message || 'Failed to capture image'
      });
    }
  };
  
  // Close camera
  const closeCamera = () => {
    stopCamera();
    setIsCameraOpen(false);
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
          {existingImage ? 'Change Photo' : 'Add Photo'}
        </Button>
        
        {existingImage && (
          <div className="h-12 w-12 rounded overflow-hidden border">
            <img 
              src={existingImage}
              alt="PPE"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>
      
      <CardOverlay
        show={isCameraOpen}
        onClose={closeCamera}
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
                <Button variant="outline" onClick={closeCamera}>Cancel</Button>
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
                <Button variant="outline" onClick={closeCamera}>
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
                
                <Button 
                  onClick={capturePhoto}
                  disabled={!stream || isCapturing}
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

export default PPECameraCapture;
