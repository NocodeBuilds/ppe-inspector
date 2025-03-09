
import React, { useState } from 'react';
import { Check, X, Camera, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';

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

const CheckpointItem = ({
  id,
  description,
  passed,
  notes,
  photoUrl,
  onPassedChange,
  onNotesChange,
  onPhotoCapture,
  onPhotoDelete,
}: CheckpointItemProps) => {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  
  const handleCapture = (dataUrl: string) => {
    onPhotoCapture(dataUrl);
    setShowCamera(false);
  };
  
  const handleCameraError = (error: string) => {
    console.error('Camera error:', error);
    setCameraError(error);
    setShowCamera(false);
  };
  
  return (
    <Card className="p-4 border border-border/40 shadow-sm">
      <div className="space-y-3">
        <p className="text-sm">{description}</p>
        
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={passed === true ? "default" : "outline"}
            className={passed === true ? "bg-green-500 hover:bg-green-600" : ""}
            onClick={() => onPassedChange(true)}
          >
            <Check size={14} className="mr-1" />
            Pass
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant={passed === false ? "default" : "outline"}
            className={passed === false ? "bg-destructive hover:bg-destructive/90" : ""}
            onClick={() => onPassedChange(false)}
          >
            <X size={14} className="mr-1" />
            Fail
          </Button>
          
          <Button
            type="button"
            size="sm"
            variant={passed === null ? "default" : "outline"}
            className={passed === null ? "bg-gray-500 hover:bg-gray-600" : ""}
            onClick={() => onPassedChange(null)}
          >
            N/A
          </Button>
        </div>
        
        {passed === false && (
          <div className="space-y-2">
            <Label htmlFor={`notes-${id}`} className="text-xs font-medium">Notes (required for failures)</Label>
            <Textarea
              id={`notes-${id}`}
              placeholder="Describe the issue..."
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              className="h-20 resize-none"
            />
          </div>
        )}
        
        <div className="flex items-center gap-2">
          {!photoUrl && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="text-xs"
              onClick={() => setShowCamera(true)}
            >
              <Camera size={14} className="mr-1" />
              Add Photo
            </Button>
          )}
          
          {photoUrl && (
            <>
              <div className="relative border rounded-md overflow-hidden w-16 h-16">
                <img 
                  src={photoUrl} 
                  alt="Checkpoint evidence" 
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-0.5 right-0.5 h-5 w-5"
                  onClick={onPhotoDelete}
                >
                  <Trash2 size={10} />
                </Button>
              </div>
            </>
          )}
        </div>
        
        {showCamera && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg shadow-lg max-w-md w-full p-6 border border-border/40">
              {cameraError ? (
                <div className="text-center">
                  <p className="text-destructive mb-4">{cameraError}</p>
                  <Button onClick={() => setCameraError(null)}>Close</Button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Take Photo</h2>
                    <Button variant="ghost" size="icon" onClick={() => setShowCamera(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                    <div id={`camera-container-${id}`} className="w-full h-full">
                      {/* Camera will render here */}
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={() => setShowCamera(false)}>Cancel</Button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default CheckpointItem;
