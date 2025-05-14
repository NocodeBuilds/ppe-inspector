import { Shield } from 'lucide-react';

/**
 * PageLoader component provides a consistent loading indicator
 * for pages and full-screen loading states
 */
const PageLoader = () => {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
        </div>
        <Shield className="relative z-10 h-10 w-10 animate-pulse text-primary" />
      </div>
      <p className="mt-4 text-body-sm text-muted-foreground">Loading...</p>
    </div>
  );
};

export default PageLoader;
