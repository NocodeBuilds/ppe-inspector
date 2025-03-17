
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Minus } from 'lucide-react';

interface CheckpointOptionsProps {
  passed: boolean | null;
  onStatusChange: (passed: boolean | null) => void;
  disabled?: boolean;
}

const CheckpointOptions: React.FC<CheckpointOptionsProps> = ({ 
  passed, 
  onStatusChange, 
  disabled = false 
}) => {
  // Helper function to handle status change with console logging for debugging
  const handleStatusChange = (status: boolean | null) => {
    console.log("CheckpointOptions: Setting status to:", status);
    onStatusChange(status);
  };

  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        variant={passed === true ? "default" : "outline"}
        className={passed === true ? "bg-green-500 hover:bg-green-600" : ""}
        onClick={() => handleStatusChange(true)}
        disabled={disabled}
      >
        <Check className="h-4 w-4 mr-1" />
        Pass
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant={passed === false ? "default" : "outline"}
        className={passed === false ? "bg-red-500 hover:bg-red-600" : ""}
        onClick={() => handleStatusChange(false)}
        disabled={disabled}
      >
        <X className="h-4 w-4 mr-1" />
        Fail
      </Button>
      
      <Button
        type="button"
        size="sm"
        variant={passed === null ? "default" : "outline"}
        className={passed === null ? "bg-gray-500 hover:bg-gray-600" : ""}
        onClick={() => handleStatusChange(null)}
        disabled={disabled}
      >
        <Minus className="h-4 w-4 mr-1" />
        N/A
      </Button>
    </div>
  );
};

export default CheckpointOptions;
