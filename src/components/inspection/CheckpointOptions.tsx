import React, { useEffect } from 'react';
import { Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
  useEffect(() => {
    console.log("CheckpointOptions state updated:", { passed });
  }, [passed]);
  
  const handlePassClick = () => {
    console.log("Pass button clicked, changing to:", true);
    onStatusChange(true);
  };
  
  const handleFailClick = () => {
    console.log("Fail button clicked, changing to:", false);
    onStatusChange(false);
  };
  
  const handleNAClick = () => {
    console.log("N/A button clicked, changing to:", null);
    onStatusChange(null);
  };
  
  return (
    <div className="flex gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "border transition-colors duration-200",
          passed === true 
            ? "!bg-green-500 hover:!bg-green-600 !border-green-600 text-white ring-green-400" 
            : "hover:bg-green-50 hover:text-green-600 hover:border-green-400"
        )}
        onClick={handlePassClick}
        disabled={disabled}
      >
        <Check className="h-4 w-4 mr-1" />
        <span className="text-body-sm">Pass</span>
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "border transition-colors duration-200",
          passed === false 
            ? "!bg-red-500 hover:!bg-red-600 !border-red-600 text-white ring-red-400" 
            : "hover:bg-red-50 hover:text-red-600 hover:border-red-400"
        )}
        onClick={handleFailClick}
        disabled={disabled}
      >
        <X className="h-4 w-4 mr-1" />
        <span className="text-body-sm">Fail</span>
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "border transition-colors duration-200",
          passed === null 
            ? "!bg-gray-500 hover:!bg-gray-600 !border-gray-600 text-white ring-gray-400" 
            : "hover:bg-gray-100 hover:text-gray-600 hover:border-gray-400"
        )}
        onClick={handleNAClick}
        disabled={disabled}
      >
        <Minus className="h-4 w-4 mr-1" />
        <span className="text-body-sm">N/A</span>
      </Button>
    </div>
  );
};

export default CheckpointOptions;
