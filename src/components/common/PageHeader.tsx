
import React from 'react';
import { useBackNavigation } from '@/components/layout/MainLayout';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backTo?: string | number;
  rightElement?: React.ReactNode;
  icon?: React.ReactNode;
}

const PageHeader = ({ 
  title, 
  showBackButton = false, 
  backTo = -1,
  rightElement,
  icon
}: PageHeaderProps) => {
  const { setShowBackButton, setBackTo } = useBackNavigation();
  
  // Update global back navigation state when component mounts or props change
  React.useEffect(() => {
    if (showBackButton) {
      setShowBackButton(true);
      setBackTo(backTo);
      
      // Clean up when component unmounts
      return () => {
        setShowBackButton(false);
      };
    }
  }, [showBackButton, backTo, setShowBackButton, setBackTo]);
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>
      
      {rightElement && (
        <div>
          {rightElement}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
