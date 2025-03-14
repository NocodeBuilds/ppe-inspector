
import React, { useState, useRef, useEffect } from 'react';
import { Camera, ImageIcon, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Clean up camera resources when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const activateCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Could not access camera. Please ensure you have granted camera permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert to file and pass to parent
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `ppe-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
            onImageCapture(file);
            
            // Also set preview
            const imageUrl = URL.createObjectURL(blob);
            setCapturedImage(imageUrl);
          }
        }, 'image/jpeg', 0.8);
      }
      
      stopCamera();
    }
  };

  const retakePhoto = () => {
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
            onCanPlay={() => videoRef.current?.play()}
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
            onClick={activateCamera}
          >
            <div className="flex flex-col items-center text-muted-foreground p-4">
              <ImageIcon className="h-12 w-12 mb-2" />
              <p>Click to take a photo of the PPE</p>
              {cameraError && (
                <p className="text-red-500 text-xs mt-2 text-center">{cameraError}</p>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex justify-center">
            <Button
              type="button"
              onClick={activateCamera}
              variant="outline"
            >
              <Camera className="mr-2 h-4 w-4" />
              Open Camera
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
