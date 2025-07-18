import React from 'react';

const PageLoader = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-background">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-2"></div>
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export { PageLoader };