
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Camera, Trash2, Ban, Smartphone } from 'lucide-react';
import CardOverlay from '@/components/ui/card-overlay';
import { toast } from '@/hooks/use-toast';
import CheckpointOptions from './CheckpointOptions';

interface CheckpointItemProps {
  id: string;
  description: string;
  passed: boolean | null;
  notes: string;
  photoUrl?: string;
  onPassedChange: (passed: boolean | null) => void;
  onNotesChange: (notes: string) => void;
  onPhotoCapture: (photoUrl: string) => void;
  onPhotoDelete: () => void;
}

const CheckpointItem: React.FC<CheckpointItemProps> = ({
  id,
  description,
  passed,
  notes,
  photoUrl,
  onPassedChange,
  onNotesChange,
  onPhotoCapture,
  onPhotoDelete,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Clean up camera resources when component unmounts or camera is closed
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  const fetchAvailableDevices = async () => {
    try {
      // Request permission first to ensure we get accurate device list
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      
      // Set default device to the environment-facing camera if available
      const envCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment')
      );
      
      if (envCamera) {
        setSelectedDeviceId(envCamera.deviceId);
      } else if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
    } catch (error) {
      console.error('Error fetching camera devices:', error);
    }
  };
  
  const startCamera = async () => {
    try {
      // Clean up any existing streams first
      stopCamera();
      setCameraError(null);
      setShowCamera(true);
      setIsCapturing(true);
      
      // Fetch available devices before starting the camera
      await fetchAvailableDevices();
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }
      
      // Configure constraints based on selected device or default to environment-facing
      const constraints: MediaStreamConstraints = {
        video: selectedDeviceId 
          ? { deviceId: { exact: selectedDeviceId } }
          : { facingMode: 'environment' }
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Make sure video auto-plays
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(error => {
              console.error("Error playing video:", error);
              setCameraError('Failed to start video stream');
            });
          }
        };
      } else {
        console.error('Video reference is null');
        setCameraError('Failed to initialize camera view');
      }
      
      setIsCapturing(false);
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setIsCapturing(false);
      
      let errorMessage = 'Failed to access camera';
      
      // More user-friendly error messages
      if (error.name === 'NotAllowedError') {
        errorMessage = 'Camera access denied. Please grant permission to use your camera.';
      } else if (error.name === 'NotFoundError') {
        errorMessage = 'No camera found on your device.';
      } else if (error.name === 'NotReadableError') {
        errorMessage = 'Camera is already in use by another application.';
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = 'The requested camera settings are not supported.';
      } else if (error.name === 'SecurityError') {
        errorMessage = 'Camera access is restricted due to security settings.';
      } else if (error.name === 'AbortError') {
        errorMessage = 'Camera initialization was aborted.';
      } else if (error.name === 'TypeError') {
        errorMessage = 'Invalid camera constraints specified.';
      }
      
      setCameraError(errorMessage);
      toast({
        title: 'Camera Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };
  
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
    
    setShowCamera(false);
    setIsCapturing(false);
  };
  
  const switchCamera = async () => {
    if (availableDevices.length <= 1) {
      toast({
        title: 'Camera Switch',
        description: 'No additional cameras available on this device',
        variant: 'default',
      });
      return;
    }
    
    // Find the next camera in the list
    const currentIndex = availableDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    const nextDeviceId = availableDevices[nextIndex].deviceId;
    
    setSelectedDeviceId(nextDeviceId);
    
    // Restart camera with new device
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 300); // Small delay to ensure previous camera is fully stopped
  };
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas reference is null');
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) {
      console.error('Could not get canvas context');
      return;
    }
    
    try {
      console.log('Capturing photo...');
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL with quality parameter for better compression
      const photoUrl = canvas.toDataURL('image/jpeg', 0.85);
      
      // Pass photo URL to parent
      onPhotoCapture(photoUrl);
      
      // Stop camera
      stopCamera();
      
      toast({
        title: 'Photo Captured',
        description: 'The image has been attached to this checkpoint',
      });
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast({
        title: 'Error',
        description: 'Failed to capture photo',
        variant: 'destructive',
      });
    }
  };

  // Determine border color based on passed state
  const getBorderColor = () => {
    if (passed === true) return 'border-l-green-500';
    if (passed === false) return 'border-l-destructive';
    if (passed === null) return 'border-l-yellow-500';
    return 'border-l-gray-300';
  };
  
  return (
    <Card className={`p-4 border-l-4 ${getBorderColor()}`}>
      <div className="mb-3">
        <h4 className="font-medium mb-2">{description}</h4>
        
        <div className="flex gap-2 mb-3">
          <CheckpointOptions 
            passed={passed}
            onStatusChange={onPassedChange}
          />
        </div>
      </div>
      
      {/* Show notes for both pass and fail cases */}
      <div className="space-y-3">
        {passed === false && (
          <Textarea
            placeholder="Add notes describing the issue..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[80px]"
          />
        )}
        
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={startCamera}
            className="text-xs"
            disabled={isCapturing}
          >
            {isCapturing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                Loading...
              </>
            ) : (
              <>
                <Camera size={14} className="mr-1" />
                Add Photo
              </>
            )}
          </Button>
          
          {photoUrl && (
            <div className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded overflow-hidden border cursor-pointer"
                onClick={() => {
                  // Show photo in full screen or modal
                  const img = new Image();
                  img.src = photoUrl;
                  const w = window.open("");
                  if (w) {
                    w.document.write(img.outerHTML);
                  }
                }}
              >
                <img 
                  src={photoUrl} 
                  alt="Checkpoint evidence" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onPhotoDelete}
                className="h-7 w-7 text-destructive hover:text-destructive/90"
              >
                <Trash2 size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Camera overlay with improved UI */}
      <CardOverlay
        show={showCamera}
        onClose={stopCamera}
        title="Take Photo"
      >
        <div className="space-y-4">
          {cameraError ? (
            <div className="text-center p-4 border rounded">
              <p className="text-destructive mb-3">{cameraError}</p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => {
                  setCameraError(null);
                  startCamera();
                }}>Try Again</Button>
                <Button variant="outline" onClick={stopCamera}>Cancel</Button>
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
              
              <div className="flex justify-between gap-3">
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
                
                {availableDevices.length > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={switchCamera}
                    disabled={isCapturing}
                  >
                    <Smartphone size={16} className="mr-2" />
                    Switch Camera
                  </Button>
                )}
                
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
    </Card>
  );
};

export default CheckpointItem;
