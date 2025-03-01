
import React, { useState } from 'react';
import { InspectionCheckpoint } from '@/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, Minus, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckpointItemProps {
  checkpoint: InspectionCheckpoint;
  result: {
    status: 'ok' | 'not-ok' | 'na';
    notes: string;
    photoUrl?: string;
  };
  onStatusChange: (status: 'ok' | 'not-ok' | 'na') => void;
  onNotesChange: (notes: string) => void;
  onCapturePicture: () => void;
}

const CheckpointItem = ({
  checkpoint,
  result,
  onStatusChange,
  onNotesChange,
  onCapturePicture
}: CheckpointItemProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border border-border rounded-lg overflow-hidden mb-3">
      <div className="p-3 flex flex-col">
        <div className="flex items-center justify-between">
          <span className="font-medium">{checkpoint.description}</span>
          <div className="flex space-x-1">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange('ok')}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                result.status === 'ok' && "bg-success text-white hover:bg-success/90"
              )}
            >
              <Check size={16} />
              <span className="sr-only">OK</span>
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange('not-ok')}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                result.status === 'not-ok' && "bg-destructive text-white hover:bg-destructive/90"
              )}
            >
              <X size={16} />
              <span className="sr-only">Not OK</span>
            </Button>
            
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onStatusChange('na')}
              className={cn(
                "h-8 w-8 p-0 rounded-full",
                result.status === 'na' && "bg-muted-foreground text-white hover:bg-muted-foreground/90"
              )}
            >
              <Minus size={16} />
              <span className="sr-only">N/A</span>
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(!expanded)}
            className="px-2 py-1 h-auto text-xs"
          >
            {expanded ? 'Hide Details' : 'Add Notes'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCapturePicture}
            className="px-2 py-1 h-auto flex items-center text-xs"
          >
            <Camera size={14} className="mr-1" />
            Photo
          </Button>
        </div>
      </div>
      
      {expanded && (
        <div className="p-3 pt-0">
          <Textarea
            value={result.notes}
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="Add notes"
            className="min-h-20 text-sm"
          />
          
          {result.photoUrl && (
            <div className="mt-2">
              <img
                src={result.photoUrl}
                alt="Inspection photo"
                className="max-h-32 rounded-md object-cover"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CheckpointItem;
