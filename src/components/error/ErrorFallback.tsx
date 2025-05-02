
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  componentStack?: string;
  errorInfo?: React.ErrorInfo;
  componentName?: string;
  retryCount?: number;
  maxRetries?: number;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary,
  componentStack,
  componentName = 'Unknown Component',
  retryCount = 0,
  maxRetries = 3,
}) => {
  let navigate;
  
  // Try to access the navigate function, but don't throw if we're outside a router context
  try {
    // @ts-ignore - We'll handle the case where this throws
    navigate = useNavigate();
  } catch (e) {
    // If we're outside a router context, navigate will be undefined
    console.log('Navigation not available in this context');
  }
  
  // Log the error for debugging
  useEffect(() => {
    console.error(`Error caught in ${componentName}:`, error);
    if (componentStack) {
      console.error('Component stack:', componentStack);
    }
    
    // You can add error reporting service here
    // reportErrorToService(error, componentStack, componentName);
  }, [error, componentStack, componentName]);

  // Auto-retry data loading errors with custom messaging
  const isDataLoadingError = error.message.includes('fetch') || 
                            error.message.includes('network') ||
                            error.message.includes('failed to load') ||
                            error.message.includes('API');
  
  const handleGoHome = () => {
    if (navigate) {
      navigate('/');
      resetErrorBoundary();
    } else {
      // Fallback for when navigate is not available - redirect using window.location
      window.location.href = '/';
    }
  };
  
  const isMaxRetriesReached = retryCount >= maxRetries;
  
  return (
    <div className="flex items-center justify-center min-h-[50vh] p-6">
      <div className="bg-background border rounded-lg shadow-lg p-6 max-w-md w-full">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-red-100 dark:bg-red-900/20 p-3 rounded-full">
            <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h2 className="h3 text-red-600 dark:text-red-400">Something went wrong</h2>
          
          {retryCount > 0 && (
            <p className="text-sm text-muted-foreground">
              Retry attempt: {retryCount} of {maxRetries}
              {isMaxRetriesReached ? ' (max retries reached)' : ''}
            </p>
          )}
          
          {componentName && (
            <p className="text-caption">
              Error in: {componentName}
            </p>
          )}
          
          {isDataLoadingError && !isMaxRetriesReached && (
            <div className="app-banner app-banner-info w-full">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Retrying to load data...</span>
            </div>
          )}
          
          <div className="bg-muted/30 rounded p-3 w-full">
            <p className="text-body-sm text-muted-foreground break-words font-mono">
              {error.message}
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="technical-details">
              <AccordionTrigger className="text-sm">
                <span className="flex items-center gap-1">
                  <Bug className="h-4 w-4" />
                  Technical Details
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="bg-muted/30 rounded p-3 mt-2 overflow-auto max-h-40">
                  <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono">
                    {error.stack || error.message}
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={resetErrorBoundary}
              className="flex items-center justify-center gap-2 flex-1"
              disabled={isDataLoadingError && !isMaxRetriesReached}
            >
              <RefreshCw className={`h-4 w-4 ${isDataLoadingError && !isMaxRetriesReached ? 'animate-spin' : ''}`} />
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
            {isDataLoadingError 
              ? "Having trouble connecting to the server. Please check your internet connection."
              : "If this problem persists, please contact support or try again later."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
