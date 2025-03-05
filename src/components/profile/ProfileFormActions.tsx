
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ProfileFormActionsProps {
  isSaving: boolean;
  onCancel: () => void;
}

const ProfileFormActions = ({ isSaving, onCancel }: ProfileFormActionsProps) => {
  return (
    <div className="flex gap-3 pt-4">
      <Button 
        type="button" 
        variant="outline" 
        className="flex-1"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </Button>
      
      <Button 
        type="submit" 
        className="flex-1"
        disabled={isSaving}
      >
        {isSaving ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            Saving...
          </>
        ) : 'Save Changes'}
      </Button>
    </div>
  );
};

export default ProfileFormActions;
