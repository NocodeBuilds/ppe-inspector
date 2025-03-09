
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Camera, Trash2, Ban } from 'lucide-react';
import CardOverlay from '@/components/ui/card-overlay';
import { toast } from '@/hooks/use-toast';

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
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  const startCamera = async () => {
    try {
      setCameraError(null);
      
      // Check if browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support camera access');
      }
      
      // Request camera access with improved error handling
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Make sure video is properly loaded
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current) {
            videoRef.current.play().catch(error => {
              console.error("Error playing video:", error);
              setCameraError('Failed to start video stream');
            });
          }
        };
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      
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
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };
  
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    try {
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to data URL
      const photoUrl = canvas.toDataURL('image/jpeg', 0.8); // Add quality parameter
      
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
          <Button
            type="button"
            variant={passed === true ? 'default' : 'outline'}
            size="sm"
            className={passed === true ? 'bg-green-600 hover:bg-green-700' : ''}
            onClick={() => onPassedChange(true)}
          >
            <Check size={16} className="mr-2" />
            Pass
          </Button>
          
          <Button
            type="button"
            variant={passed === false ? 'default' : 'outline'}
            size="sm"
            className={passed === false ? 'bg-destructive hover:bg-destructive/90' : ''}
            onClick={() => onPassedChange(false)}
          >
            <X size={16} className="mr-2" />
            Fail
          </Button>

          <Button
            type="button"
            variant={passed === null ? 'default' : 'outline'}
            size="sm"
            className={passed === null ? 'bg-yellow-500 hover:bg-yellow-600' : ''}
            onClick={() => onPassedChange(null)}
          >
            <Ban size={16} className="mr-2" />
            N/A
          </Button>
        </div>
      </div>
      
      {/* Show photo options for both pass and fail cases */}
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
          >
            <Camera size={14} className="mr-1" />
            Add Photo
          </Button>
          
          {photoUrl && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded overflow-hidden border">
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
                <Button onClick={() => setCameraError(null)}>Try Again</Button>
                <Button variant="outline" onClick={stopCamera}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="aspect-video bg-black rounded-md overflow-hidden">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
              
              <canvas ref={canvasRef} className="hidden" />
              
              <div className="flex justify-center gap-3">
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
                <Button onClick={capturePhoto}>
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
