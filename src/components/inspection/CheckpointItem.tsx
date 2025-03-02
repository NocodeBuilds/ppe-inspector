
import React, { useState } from 'react';
import { Check, X, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export interface CheckpointItemProps {
  id: string; // Add id property to fix the TypeScript error
  description: string;
  passed: boolean;
  notes: string;
  photoUrl?: string;
  onPassedChange: (value: boolean) => void;
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
  
  const handleCapturePhoto = () => {
    // In a real app, this would use the device camera
    // For this demo, we'll just use a placeholder image URL
    const mockPhotoUrl = 'https://via.placeholder.com/300';
    onPhotoCapture(mockPhotoUrl);
    setShowCamera(false);
  };
  
  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              variant={passed ? 'default' : 'outline'}
              className={passed ? 'bg-green-600 hover:bg-green-700 h-9 w-9 p-0' : 'h-9 w-9 p-0'}
              onClick={() => onPassedChange(true)}
            >
              <Check size={16} />
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant={!passed ? 'default' : 'outline'}
              className={!passed ? 'bg-destructive hover:bg-destructive/90 h-9 w-9 p-0' : 'h-9 w-9 p-0'}
              onClick={() => onPassedChange(false)}
            >
              <X size={16} />
            </Button>
          </div>
        </div>
        
        <div className="flex-grow">
          <p className="font-medium mb-2">{description}</p>
          
          {!passed && (
            <Textarea
              placeholder="Please add notes explaining the issue..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="mt-2 mb-3"
              rows={2}
            />
          )}
          
          {photoUrl ? (
            <div className="mt-3 relative">
              <img src={photoUrl} alt="Checkpoint" className="rounded-md w-full max-h-40 object-cover" />
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-8 w-8 p-0"
                onClick={onPhotoDelete}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          ) : (
            <div className="mt-2">
              {showCamera ? (
                <div className="bg-muted p-4 rounded-md">
                  <div className="aspect-video bg-muted-foreground/20 rounded flex items-center justify-center mb-2">
                    <Camera size={40} className="text-muted-foreground" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleCapturePhoto}>Capture</Button>
                    <Button size="sm" variant="outline" onClick={() => setShowCamera(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-1"
                  onClick={() => setShowCamera(true)}
                >
                  <Camera size={14} className="mr-1" />
                  Add Photo
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CheckpointItem;
