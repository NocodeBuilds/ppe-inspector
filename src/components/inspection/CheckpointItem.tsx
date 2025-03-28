import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Trash2, Smartphone, Image } from 'lucide-react';
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
  disabled?: boolean;
}

// Function to compress and resize images to reduce storage requirements
const resizeAndCompressImage = (imageDataUrl: string, maxWidth = 800, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
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
  disabled,
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [processingImage, setProcessingImage] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  const fetchAvailableDevices = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableDevices(videoDevices);
      
      // Try to find a back-facing camera first for mobile devices
      const envCamera = videoDevices.find(device => 
        device.label.toLowerCase().includes('back') || 
        device.label.toLowerCase().includes('environment')
      );
      
      if (envCamera) {
        setSelectedDeviceId(envCamera.deviceId);
        return envCamera.deviceId;
      } else if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
        return videoDevices[0].deviceId;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching camera devices:', error);
      return null;
    }
  };
  
  const startCamera = async () => {
    try {
      stopCamera();
      setCameraError(null);
      setShowCamera(true);
      setIsCapturing(true);
      
      const deviceId = await fetchAvailableDevices();
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }
      
      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } }
          : { facingMode: 'environment' }
      };
      
      console.log('Requesting camera access with constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
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
    
    const currentIndex = availableDevices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % availableDevices.length;
    const nextDeviceId = availableDevices[nextIndex].deviceId;
    
    setSelectedDeviceId(nextDeviceId);
    
    stopCamera();
    setTimeout(() => {
      startCamera();
    }, 300);
  };
  
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) {
      console.error('Video or canvas reference is null');
      return;
    }
    
    setProcessingImage(true);
    
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (!context) {
        console.error('Could not get canvas context');
        return;
      }
      
      console.log('Capturing photo...');
      
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoUrl = canvas.toDataURL('image/jpeg', 0.85);
      
      // Compress and resize the image
      const compressedPhotoUrl = await resizeAndCompressImage(photoUrl, 800, 0.7);
      
      onPhotoCapture(compressedPhotoUrl);
      
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
    } finally {
      setProcessingImage(false);
    }
  };

  const getBorderColor = () => {
    if (passed === true) return 'border-l-green-500';
    if (passed === false) return 'border-l-destructive';
    if (passed === null) return 'border-l-yellow-500';
    return 'border-l-gray-300';
  };
  
  return (
    <Card className={`p-4 border-l-4 ${getBorderColor()} mb-4`}>
      <div className="mb-4">
        <h4 className="font-medium mb-3">{description}</h4>
        
        <CheckpointOptions 
          passed={passed}
          onStatusChange={(value) => {
            console.log("CheckpointItem: Status change requested:", { value });
            onPassedChange(value);
          }}
          disabled={disabled}
        />
      </div>
      
      <div className="space-y-4">
        {/* Show notes textarea for all checkpoints but make it required only for failed ones */}
        <Textarea
          placeholder={passed === false ? "Add notes describing the issue... (required)" : "Add notes (optional)"}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className={`min-h-[80px] ${passed === false ? 'border-amber-500' : ''}`}
        />
        
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
            ) : photoUrl ? (
              <>
                <Camera size={14} className="mr-1" />
                Change Photo
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
                className="w-12 h-12 rounded overflow-hidden border cursor-pointer bg-muted flex items-center justify-center"
                onClick={() => {
                  const img = document.createElement('img');
                  img.src = photoUrl;
                  const w = window.open("");
                  if (w) {
                    w.document.write(img.outerHTML);
                  }
                }}
              >
                {photoUrl ? (
                  <img 
                    src={photoUrl} 
                    alt="Checkpoint evidence" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image size={20} className="text-muted-foreground" />
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onPhotoDelete}
                className="h-8 w-8 text-destructive hover:text-destructive/90"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          )}
        </div>
      </div>
      
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
                
                {processingImage && (
                  <div className="absolute inset-0 flex items-center justify-center flex-col bg-black/50">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mb-2"></div>
                    <p className="text-white text-sm">Processing image...</p>
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
                    disabled={isCapturing || processingImage}
                  >
                    <Smartphone size={16} className="mr-2" />
                    Switch Camera
                  </Button>
                )}
                
                <Button 
                  onClick={capturePhoto}
                  disabled={!stream || isCapturing || processingImage}
                >
                  {processingImage ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Camera size={16} className="mr-2" />
                      Capture
                    </>
                  )}
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
