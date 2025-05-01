
import React, { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  resetKeys?: Array<any>;
  onReset?: () => void;
  component?: string;
  logErrors?: boolean;
  retry?: boolean;
  maxRetries?: number;
}

/**
 * An enhanced error boundary component that provides better error handling
 * with logging, reporting, recovery options, and automatic retries.
 * 
 * @param children - Child components to be wrapped in the error boundary
 * @param fallback - Custom fallback UI to show when an error occurs
 * @param onError - Custom error handler function
 * @param resetKeys - Array of values that will reset the error boundary when changed
 * @param onReset - Function called when the error boundary is reset
 * @param component - Name of the component being wrapped (for error reporting)
 * @param logErrors - Whether to log errors to the console (default: true)
 * @param retry - Whether to automatically retry after an error (default: false)
 * @param maxRetries - Maximum number of automatic retries (default: 3)
 */
const EnhancedErrorBoundary: React.FC<EnhancedErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  resetKeys,
  onReset,
  component = 'unknown',
  logErrors = true,
  retry = false,
  maxRetries = 3,
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  // Reset retry count when resetKeys change
  useEffect(() => {
    if (resetKeys && resetKeys.length > 0) {
      setRetryCount(0);
      setLastError(null);
    }
  }, [resetKeys]);
  
  const handleError = (error: Error, info: React.ErrorInfo) => {
    // Store the last error
    setLastError(error);
    
    // Log the error to console if enabled
    if (logErrors) {
      console.error(`Error in ${component}:`, error);
      console.error('Component stack:', info.componentStack);
    }
    
    // Call the onError prop if provided
    if (onError) {
      onError(error, info);
    }
    
    // Here you could add error reporting to a service like Sentry
    // reportErrorToService(error, info, component);
    
    // Increment retry count if automatic retry is enabled
    if (retry) {
      setRetryCount(prev => prev + 1);
    }
  };
  
  const handleReset = () => {
    setRetryCount(0);
    setLastError(null);
    
    // Call the onReset prop if provided
    if (onReset) {
      onReset();
    }
  };
  
  // Auto-retry logic
  useEffect(() => {
    if (retry && lastError && retryCount <= maxRetries) {
      const timeoutId = setTimeout(() => {
        console.log(`Auto-retrying ${component} (Attempt ${retryCount} of ${maxRetries})...`);
        setLastError(null);
      }, Math.min(retryCount * 1000, 5000)); // Exponential backoff with a max of 5 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [retry, lastError, retryCount, maxRetries, component]);
  
  return (
    <ErrorBoundary
      FallbackComponent={(props) => 
        fallback ? (
          <>{fallback}</>
        ) : (
          <ErrorFallback 
            {...props} 
            componentName={component} 
            retryCount={retryCount}
            maxRetries={maxRetries}
          />
        )
      }
      onError={handleError}
      resetKeys={resetKeys}
      onReset={handleReset}
      key={`error-boundary-${retryCount}`}
    >
      {children}
    </ErrorBoundary>
  );
};

export default EnhancedErrorBoundary;
