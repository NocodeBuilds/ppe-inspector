import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, ChevronRight } from 'lucide-react';

interface SpotlightStep {
  target: string;
  title: string;
  description: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

interface FeatureSpotlightProps {
  steps: SpotlightStep[];
  onComplete: () => void;
  isOpen: boolean;
}

const FeatureSpotlight: React.FC<FeatureSpotlightProps> = ({
  steps,
  onComplete,
  isOpen
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltip, setTooltip] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  const positionTooltip = () => {
    const step = steps[currentStep];
    if (!step) return;
    
    const targetEl = document.querySelector(step.target);
    if (!targetEl || !tooltipRef.current) return;
    
    const targetRect = targetEl.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    switch (step.position || 'bottom') {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'right':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.right + 10;
        break;
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);
        break;
      case 'left':
        top = targetRect.top + (targetRect.height / 2) - (tooltipRect.height / 2);
        left = targetRect.left - tooltipRect.width - 10;
        break;
    }
    
    setTooltip({ top, left });
    
    // Highlight target element
    targetEl.setAttribute('data-spotlight', 'true');
    return () => targetEl.removeAttribute('data-spotlight');
  };

  useEffect(() => {
    if (isOpen) {
      positionTooltip();
      const handleResize = () => positionTooltip();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      const currentTarget = document.querySelector(steps[currentStep].target);
      if (currentTarget) {
        currentTarget.removeAttribute('data-spotlight');
      }
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    const currentTarget = document.querySelector(steps[currentStep].target);
    if (currentTarget) {
      currentTarget.removeAttribute('data-spotlight');
    }
    onComplete();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" />
      <div
        ref={tooltipRef}
        style={{
          top: tooltip.top,
          left: tooltip.left,
        }}
        className="fixed z-50 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transition-all"
      >
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2"
          onClick={handleSkip}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <div className="mb-4">
          <h3 className="h4 mb-1">{steps[currentStep].title}</h3>
          <p className="text-caption">{steps[currentStep].description}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 w-1.5 rounded-full ${
                  idx === currentStep ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <Button size="sm" className="text-body-sm" onClick={handleNext}>
            {currentStep < steps.length - 1 ? (
              <>
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </>
            ) : (
              'Finish'
            )}
          </Button>
        </div>
      </div>
    </>
  );
};

export default FeatureSpotlight;
