
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  showBackButton?: boolean;
  backTo?: string | number;
  rightElement?: React.ReactNode;
}

const PageHeader = ({ 
  title, 
  showBackButton = false, 
  backTo = -1,
  rightElement
}: PageHeaderProps) => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    if (typeof backTo === 'number') {
      navigate(backTo);
    } else {
      navigate(backTo);
    }
  };
  
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center">
        {showBackButton && (
          <Button 
            variant="ghost" 
            size="sm"
            className="mr-2"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
          </Button>
        )}
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
