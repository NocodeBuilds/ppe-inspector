
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Camera, Image as ImageIcon, Trash } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CheckpointItemProps {
  id: string;
  description: string;
  passed: boolean | null;
  notes: string;
  photoUrl?: string;
  onPassedChange: (value: boolean | null) => void;
  onNotesChange: (value: string) => void;
  onPhotoCapture: (url: string) => void;
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
  onPhotoDelete
}) => {
  const [showCamera, setShowCamera] = useState(false);
  const [showPhotoDeleteConfirm, setShowPhotoDeleteConfirm] = useState(false);
  
  const capturePhoto = async () => {
    try {
      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: 'Camera Error',
          description: 'Your browser does not support camera access',
          variant: 'destructive',
        });
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      
      // Set up video stream
      video.srcObject = stream;
      video.play();
      
      // After video is ready, capture a frame
      video.onloadedmetadata = () => {
        // Wait a moment for camera to adjust
        setTimeout(() => {
          // Set canvas dimensions
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          
          // Draw video frame to canvas
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0);
            
            // Convert to data URL
            try {
              const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
              onPhotoCapture(dataUrl);
              
              // Stop all video tracks
              stream.getTracks().forEach(track => track.stop());
              
              setShowCamera(false);
              
              toast({
                title: 'Photo Captured',
                description: 'Photo has been attached to this checkpoint',
              });
            } catch (e) {
              console.error('Error creating data URL', e);
              toast({
                title: 'Error',
                description: 'Failed to capture photo',
                variant: 'destructive',
              });
            }
          }
        }, 500);
      };
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Camera Error',
        description: 'Failed to access camera',
        variant: 'destructive',
      });
    }
  };
  
  const handlePhotoDelete = () => {
    if (showPhotoDeleteConfirm) {
      onPhotoDelete();
      setShowPhotoDeleteConfirm(false);
    } else {
      setShowPhotoDeleteConfirm(true);
      
      // Auto-hide confirmation after 3 seconds
      setTimeout(() => {
        setShowPhotoDeleteConfirm(false);
      }, 3000);
    }
  };

  return (
    <Card className={`p-4 ${passed === false ? 'border-red-300 bg-red-50 dark:bg-red-950/20' : passed === true ? 'border-green-300 bg-green-50 dark:bg-green-950/20' : ''}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <p className="text-sm font-medium flex-1">{description}</p>
          
          <div className="flex gap-2 ml-4">
            <Button
              type="button"
              size="sm"
              variant={passed === true ? 'default' : 'outline'}
              className={passed === true ? 'bg-green-600 hover:bg-green-700 border-green-600' : ''}
              onClick={() => onPassedChange(true)}
            >
              <Check size={16} className={passed === true ? "mr-1" : "mr-0"} />
              {passed === true && <span>Pass</span>}
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant={passed === false ? 'default' : 'outline'}
              className={passed === false ? 'bg-destructive hover:bg-destructive/90' : ''}
              onClick={() => onPassedChange(false)}
            >
              <X size={16} className={passed === false ? "mr-1" : "mr-0"} />
              {passed === false && <span>Fail</span>}
            </Button>
          </div>
        </div>
        
        {passed === false && (
          <div>
            <Textarea
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Add notes about the failure..."
              className={`mt-2 w-full min-h-[80px] ${!notes.trim() && 'border-destructive'}`}
            />
            {!notes.trim() && (
              <p className="text-xs text-destructive mt-1">
                Please add notes explaining the failure
              </p>
            )}
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 pt-1 items-center">
          {!photoUrl ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-8 text-xs"
              onClick={() => {
                setShowCamera(true);
                capturePhoto();
              }}
            >
              <Camera size={14} className="mr-1" />
              Add Photo
            </Button>
          ) : (
            <div className="flex flex-col gap-1">
              <div className="group relative">
                <a 
                  href={photoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block w-16 h-16 rounded overflow-hidden border border-border"
                >
                  <img 
                    src={photoUrl} 
                    alt="Evidence" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ImageIcon size={16} className="text-white" />
                  </div>
                </a>
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full"
                  onClick={handlePhotoDelete}
                >
                  {showPhotoDeleteConfirm ? (
                    <Check size={12} />
                  ) : (
                    <X size={12} />
                  )}
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">Evidence</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CheckpointItem;
