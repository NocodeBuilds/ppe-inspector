
import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface AddPPEFormActionsProps {
  isSubmitting: boolean;
  uploadProgress: number;
  isUploading: boolean;
}

const AddPPEFormActions: React.FC<AddPPEFormActionsProps> = ({
  isSubmitting,
  uploadProgress,
  isUploading,
}) => {
  return (
    <div className="space-y-4">
      {isSubmitting && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-center text-muted-foreground">
            {uploadProgress < 100 
              ? 'Saving PPE data...' 
              : 'PPE data saved successfully!'}
          </p>
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isSubmitting || isUploading}
      >
        {isSubmitting ? 'Saving...' : 'Save PPE Item'}
      </Button>
    </div>
  );
};

export default AddPPEFormActions;
