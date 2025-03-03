
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Camera, Trash2 } from 'lucide-react';
import CardOverlay from '@/components/ui/card-overlay';

interface CheckpointItemProps {
  id: string;
  description: string;
  passed: boolean;
  notes: string;
  photoUrl?: string;
  onPassedChange: (passed: boolean) => void;
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
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      setStream(mediaStream);
      setShowCamera(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error: any) {
      console.error('Error accessing camera:', error);
      setCameraError(error.message || 'Failed to access camera');
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
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to data URL
    const photoUrl = canvas.toDataURL('image/jpeg');
    
    // Pass photo URL to parent
    onPhotoCapture(photoUrl);
    
    // Stop camera
    stopCamera();
  };
  
  return (
    <Card className={`p-4 border-l-4 ${passed ? 'border-l-green-500' : 'border-l-destructive'}`}>
      <div className="mb-3">
        <h4 className="font-medium mb-2">{description}</h4>
        
        <div className="flex gap-2 mb-3">
          <Button
            type="button"
            variant={passed ? 'default' : 'outline'}
            size="sm"
            className={passed ? 'bg-green-600 hover:bg-green-700' : ''}
            onClick={() => onPassedChange(true)}
          >
            <Check size={16} className="mr-2" />
            Pass
          </Button>
          
          <Button
            type="button"
            variant={!passed ? 'default' : 'outline'}
            size="sm"
            className={!passed ? 'bg-destructive hover:bg-destructive/90' : ''}
            onClick={() => onPassedChange(false)}
          >
            <X size={16} className="mr-2" />
            Fail
          </Button>
        </div>
      </div>
      
      {!passed && (
        <div className="space-y-3">
          <Textarea
            placeholder="Add notes describing the issue..."
            value={notes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="min-h-[80px]"
          />
          
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
                    alt="Issue evidence" 
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
      )}
      
      {/* Camera overlay */}
      <CardOverlay
        show={showCamera}
        onClose={stopCamera}
        title="Take Photo"
      >
        <div className="space-y-4">
          {cameraError ? (
            <div className="text-center p-4 border rounded">
              <p className="text-destructive mb-3">{cameraError}</p>
              <Button onClick={() => setCameraError(null)}>Try Again</Button>
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
