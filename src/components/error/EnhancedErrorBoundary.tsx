
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from './ErrorFallback';

interface EnhancedErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, info: React.ErrorInfo) => void;
  resetKeys?: Array<any>;
  onReset?: () => void;
  component?: string;
}

/**
 * An enhanced error boundary component that provides better error handling
 * with logging, reporting, and recovery options.
 */
const EnhancedErrorBoundary: React.FC<EnhancedErrorBoundaryProps> = ({
  children,
  fallback,
  onError,
  resetKeys,
  onReset,
  component = 'unknown',
}) => {
  const handleError = (error: Error, info: React.ErrorInfo) => {
    // Log the error to console
    console.error(`Error in ${component}:`, error);
    console.error('Component stack:', info.componentStack);
    
    // Call the onError prop if provided
    if (onError) {
      onError(error, info);
    }
    
    // Here you could also report to an error tracking service
    // reportError(error, info, component);
  };
  
  return (
    <ErrorBoundary
      FallbackComponent={(props) => 
        fallback ? 
          <>{fallback}</> : 
          <ErrorFallback {...props} />
      }
      onError={handleError}
      resetKeys={resetKeys}
      onReset={onReset}
    >
      {children}
    </ErrorBoundary>
  );
};

export default EnhancedErrorBoundary;
