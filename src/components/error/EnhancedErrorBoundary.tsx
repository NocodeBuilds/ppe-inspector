
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
  logErrors?: boolean;
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
  logErrors = true,
}) => {
  const handleError = (error: Error, info: React.ErrorInfo) => {
    // Log the error to console if enabled
    if (logErrors) {
      console.error(`Error in ${component}:`, error);
      console.error('Component stack:', info.componentStack);
    }
    
    // Call the onError prop if provided
    if (onError) {
      onError(error, info);
    }
  };
  
  return (
    <ErrorBoundary
      FallbackComponent={(props) => 
        fallback ? 
          <>{fallback}</> : 
          <ErrorFallback {...props} componentName={component} />
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
