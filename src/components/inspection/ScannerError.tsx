
import React from 'react';
import { Button } from '@/components/ui/button';

interface ScannerErrorProps {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
}

const ScannerError: React.FC<ScannerErrorProps> = ({ error, onRetry, onCancel }) => {
  return (
    <div className="text-center p-6 border rounded-lg">
      <p className="text-destructive mb-3">{error}</p>
      <div className="flex justify-center gap-3">
        <Button onClick={onRetry}>Try Again</Button>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
};

export default ScannerError;
