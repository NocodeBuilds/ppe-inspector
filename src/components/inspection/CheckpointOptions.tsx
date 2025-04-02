
import React from 'react';
import { Check, X, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CheckpointOptionsProps {
  passed: boolean | null | undefined;
  onStatusChange: (status: boolean | null) => void;
  disabled?: boolean;
}

const CheckpointOptions: React.FC<CheckpointOptionsProps> = ({
  passed,
  onStatusChange,
  disabled = false
}) => {
  const handleStatusChange = (status: boolean | null) => {
    // Log the status change to debug
    console.log("CheckpointOptions: Setting status to:", status);
    onStatusChange(status);
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
            ? "!bg-green-500 hover:!bg-green-600 !border-green-600 text-white" 
            : "hover:bg-green-50 hover:text-green-600 hover:border-green-400"
        )}
        onClick={() => handleStatusChange(true)}
        disabled={disabled}
        aria-pressed={passed === true}
      >
        <Check className="h-4 w-4 mr-1" />
        <span className="text-body-sm">OK</span>
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "border transition-colors duration-200",
          passed === false 
            ? "!bg-red-500 hover:!bg-red-600 !border-red-600 text-white" 
            : "hover:bg-red-50 hover:text-red-600 hover:border-red-400"
        )}
        onClick={() => handleStatusChange(false)}
        disabled={disabled}
        aria-pressed={passed === false}
      >
        <X className="h-4 w-4 mr-1" />
        <span className="text-body-sm">NOT OK</span>
      </Button>

      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "border transition-colors duration-200",
          passed === null 
            ? "!bg-slate-500 hover:!bg-slate-600 !border-slate-600 text-white" 
            : "hover:bg-slate-100 hover:text-slate-600 hover:border-slate-400"
        )}
        onClick={() => handleStatusChange(null)}
        disabled={disabled}
        aria-pressed={passed === null}
      >
        <Minus className="h-4 w-4 mr-1" />
        <span className="text-body-sm">N/A</span>
      </Button>
    </div>
  );
};

export default CheckpointOptions;
