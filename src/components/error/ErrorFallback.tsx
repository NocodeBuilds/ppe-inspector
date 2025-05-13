
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentStack?: string;
  errorInfo?: React.ErrorInfo;
  componentName?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  componentStack,
  componentName = 'Unknown Component',
}) => {
  // Log the error for debugging
  React.useEffect(() => {
    console.error(`Error caught in ${componentName}:`, error);
    console.error('Component stack:', componentStack);
  }, [error, componentStack, componentName]);
  
  const handleGoHome = () => {
    // Use window.location instead of useNavigate
    window.location.href = '/';
    resetErrorBoundary();
  };
  
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-6">
      <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="h3 text-red-600">Something went wrong</h2>
          {componentName && (
            <p className="text-caption">
              Error in: {componentName}
            </p>
          )}
          
          <div className="bg-muted/30 rounded p-3 w-full">
            <p className="text-body-sm text-muted-foreground break-words font-mono">
              {error.message}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={resetErrorBoundary}
              className="flex items-center justify-center gap-2 flex-1"
            >
              <RefreshCw className="h-4 w-4" />
              <span className="text-body-sm">Try Again</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 flex-1"
            >
              <Home className="h-4 w-4" />
              <span className="text-body-sm">Go Home</span>
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            If this problem persists, please contact support or try again later.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
