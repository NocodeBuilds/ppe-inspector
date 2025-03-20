
import React from 'react';
import { Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CheckpointOptionsProps {
  passed: boolean | null;
  onStatusChange: (status: boolean | null) => void;
  disabled?: boolean;
}

const CheckpointOptions: React.FC<CheckpointOptionsProps> = ({
  passed,
  onStatusChange,
  disabled = false
}) => {
  console.log("CheckpointOptions rendered with passed:", passed);
  
  const handlePassClick = () => {
    console.log("Pass button clicked, current state:", passed, "changing to:", true);
    onStatusChange(true);
  };
  
  const handleFailClick = () => {
    console.log("Fail button clicked, current state:", passed, "changing to:", false);
    onStatusChange(false);
  };
  
  const handleNAClick = () => {
    console.log("N/A button clicked, current state:", passed, "changing to:", null);
    onStatusChange(null);
  };
  
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        variant={passed === true ? "default" : "outline"}
        className={passed === true ? "bg-green-500 hover:bg-green-600" : ""}
        onClick={handlePassClick}
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
        onClick={handleFailClick}
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
        onClick={handleNAClick}
        disabled={disabled}
      >
        <Minus className="h-4 w-4 mr-1" />
        N/A
      </Button>
    </div>
  );
};

export default CheckpointOptions;
