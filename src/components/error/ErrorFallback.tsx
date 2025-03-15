
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentStack?: string;
  errorInfo?: React.ErrorInfo;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  componentStack,
}) => {
  const navigate = useNavigate();
  
  // Log the error for debugging
  React.useEffect(() => {
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', componentStack);
    
    // You can add error reporting service here
    // reportErrorToService(error, componentStack);
  }, [error, componentStack]);
  
  const handleGoHome = () => {
    navigate('/');
    resetErrorBoundary();
  };
  
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-6">
      <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          
          <h2 className="text-xl font-bold text-red-600">Something went wrong</h2>
          
          <div className="bg-red-50 border border-red-200 rounded p-3 w-full overflow-auto max-h-28 text-left">
            <p className="text-sm font-mono text-red-800 whitespace-pre-wrap">
              {error.message || 'An unexpected error occurred'}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
            <Button 
              variant="outline" 
              className="flex-1" 
              onClick={resetErrorBoundary}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try again
            </Button>
            
            <Button 
              variant="default" 
              className="flex-1" 
              onClick={handleGoHome}
            >
              <Home className="mr-2 h-4 w-4" />
              Go to home
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
