import React from 'react';
import OfflineBanner from './offline/OfflineBanner';

interface InspectionOfflineWrapperProps {
  children: React.ReactNode;
}

/**
 * A wrapper component that adds offline functionality notifications
 * to inspection-related pages.
 */
export const InspectionOfflineWrapper = ({ children }: InspectionOfflineWrapperProps) => {
  return (
    <div className="space-y-4">
      <OfflineBanner />
      {children}
    </div>
  );
};

export default InspectionOfflineWrapper;
