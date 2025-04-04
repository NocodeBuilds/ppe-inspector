
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Home, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  showResetButton?: boolean;
  showHomeButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundaryWithFallback extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { 
      hasError: true, 
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      errorInfo: errorInfo
    });
  }
  
  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { showResetButton = true, showHomeButton = true } = this.props;
    
    if (this.state.hasError) {
      // Check for module loading errors
      const isModuleLoadingError = 
        this.state.error?.message?.includes('Failed to fetch dynamically imported module') ||
        this.state.error?.message?.includes('Importing a module script failed') ||
        this.state.error?.message?.includes('ChunkLoadError') ||
        this.state.error?.message?.includes('Loading chunk') ||
        (this.state.errorInfo?.componentStack || '').includes('lazy');
      
      // Check for null/undefined props errors
      const isNullPropsError =
        this.state.error?.message?.includes('Cannot read properties of null') ||
        this.state.error?.message?.includes('Cannot read properties of undefined');
      
      // Check for React missing error
      const isReactMissingError = 
        this.state.error?.message?.includes('React') ||
        this.state.error?.message?.includes('useState');
      
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px] bg-muted/20 rounded-lg border border-muted">
          <AlertCircle className="h-10 w-10 text-destructive mb-2" />
          <h2 className="text-xl font-bold mb-2">
            {isModuleLoadingError ? "Failed to load page" : 
             isReactMissingError ? "React component error" :
             "Something went wrong"}
          </h2>
          <p className="text-muted-foreground mb-4 max-w-md">
            {isModuleLoadingError 
              ? "There was a problem loading this page. This could be due to a network issue or an application error."
              : isNullPropsError
                ? "The application tried to access a property of an object that doesn't exist. This is likely due to data not being loaded yet."
                : isReactMissingError
                  ? "There was an error with React hooks or components. Please check the import statements."
                  : this.state.error?.message || 'An unexpected error occurred'}
          </p>
          
          {isModuleLoadingError && (
            <Alert variant="default" className="mb-4 max-w-md text-left">
              <Info className="h-4 w-4" />
              <AlertTitle>Network Issue Detected</AlertTitle>
              <AlertDescription>
                The application failed to load required components. This may be due to a poor network connection or a browser caching issue.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2">
            {showResetButton && (
              <Button onClick={this.handleReset} variant="outline" className="flex items-center">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
            )}
            <Button onClick={() => window.location.reload()} variant="default">
              Reload Page
            </Button>
            {showHomeButton && (
              <Link to="/">
                <Button variant="default" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
            )}
          </div>
          
          {this.state.errorInfo && (
            <details className="mt-4 text-left w-full">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs overflow-auto p-2 bg-muted rounded border border-border max-h-[200px]">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWithFallback;
