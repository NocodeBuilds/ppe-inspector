
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  backButton?: boolean;
  backUrl?: string;
  className?: string;
  icon?: React.ReactNode;
}

export function PageLayout({
  title,
  description,
  children,
  headerActions,
  backButton = false,
  backUrl,
  className,
  icon,
}: PageLayoutProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={cn("container mx-auto px-4 py-6 max-w-6xl pb-20", className)}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          {backButton && (
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8 rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && <p className="text-muted-foreground">{description}</p>}
            </div>
          </div>
        </div>
        {headerActions && (
          <div className="flex items-center gap-2">
            {headerActions}
          </div>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
