
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Standardized list of PPE types for the entire application
export const standardPPETypes = [
  'Full Body Harness',
  'Fall Arrester',
  'Double Lanyard',
  'Safety Helmet',
  'Safety Boots',
  'Safety Gloves',
  'Safety Goggles',
  'Ear Protection',
  'Respirator',
  'Safety Vest',
  'Face Shield'
];

interface PPETypeFilterProps {
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
  className?: string;
  variant?: 'simple' | 'scrollable' | 'draggable';
  showAllOption?: boolean;
  allOptionLabel?: string;
  buttonStyle?: 'default' | 'pill';
}

const ConsolidatedPPETypeFilter: React.FC<PPETypeFilterProps> = ({
  selectedType,
  onSelectType,
  className = '',
  variant = 'scrollable',
  showAllOption = true,
  allOptionLabel = 'All Types',
  buttonStyle = 'default'
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  
  // Check if scrolling is needed
  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current;
      if (container && variant !== 'simple') {
        setShowScrollButtons(container.scrollWidth > container.clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [variant]);
  
  // Function to scroll left/right
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  // Add drag scroll functionality for draggable variant
  useEffect(() => {
    if (variant !== 'draggable') return;
    
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;
    
    let isDown = false;
    let startX: number;
    let scrollLeft: number;
    
    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      scrollContainer.classList.add('grabbing');
      startX = e.pageX - scrollContainer.offsetLeft;
      scrollLeft = scrollContainer.scrollLeft;
    };
    
    const onMouseLeave = () => {
      isDown = false;
      scrollContainer.classList.remove('grabbing');
    };
    
    const onMouseUp = () => {
      isDown = false;
      scrollContainer.classList.remove('grabbing');
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2; // Scroll speed multiplier
      scrollContainer.scrollLeft = scrollLeft - walk;
    };
    
    // Touch events for mobile
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDown = true;
        startX = e.touches[0].pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
      }
    };
    
    const onTouchEnd = () => {
      isDown = false;
    };
    
    const onTouchMove = (e: TouchEvent) => {
      if (!isDown || e.touches.length !== 1) return;
      const x = e.touches[0].pageX - scrollContainer.offsetLeft;
      const walk = (x - startX) * 2;
      scrollContainer.scrollLeft = scrollLeft - walk;
    };
    
    scrollContainer.addEventListener('mousedown', onMouseDown);
    scrollContainer.addEventListener('mouseleave', onMouseLeave);
    scrollContainer.addEventListener('mouseup', onMouseUp);
    scrollContainer.addEventListener('mousemove', onMouseMove);
    
    scrollContainer.addEventListener('touchstart', onTouchStart);
    scrollContainer.addEventListener('touchend', onTouchEnd);
    scrollContainer.addEventListener('touchmove', onTouchMove);
    
    return () => {
      scrollContainer.removeEventListener('mousedown', onMouseDown);
      scrollContainer.removeEventListener('mouseleave', onMouseLeave);
      scrollContainer.removeEventListener('mouseup', onMouseUp);
      scrollContainer.removeEventListener('mousemove', onMouseMove);
      
      scrollContainer.removeEventListener('touchstart', onTouchStart);
      scrollContainer.removeEventListener('touchend', onTouchEnd);
      scrollContainer.removeEventListener('touchmove', onTouchMove);
    };
  }, [variant]);
  
  // Determine button class based on style
  const getButtonClasses = (isSelected: boolean) => {
    if (buttonStyle === 'pill') {
      return cn(
        "rounded-full px-4 text-xs h-8 font-medium border-2",
        isSelected 
          ? "bg-primary text-primary-foreground border-primary" 
          : "border-primary/10"
      );
    }
    
    return cn(
      "whitespace-nowrap",
      isSelected ? "bg-primary text-primary-foreground" : ""
    );
  };
  
  // Simple version of the component
  if (variant === 'simple') {
    return (
      <div className={className}>
        <div className="flex flex-wrap gap-2">
          {showAllOption && (
            <Button
              variant={selectedType === null ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectType(null)}
              className={getButtonClasses(selectedType === null)}
            >
              {allOptionLabel}
            </Button>
          )}
          
          {standardPPETypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectType(type)}
              className={getButtonClasses(selectedType === type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>
    );
  }
  
  // Scrollable or draggable version
  return (
    <div className={`relative ${className}`}>
      {showScrollButtons && variant === 'scrollable' && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 shadow-md rounded-full p-1"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      {variant === 'scrollable' ? (
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-2 p-1">
            {showAllOption && (
              <Button
                variant={selectedType === null ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectType(null)}
                className={getButtonClasses(selectedType === null)}
              >
                {allOptionLabel}
              </Button>
            )}
            
            {standardPPETypes.map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => onSelectType(type)}
                className={getButtonClasses(selectedType === type)}
              >
                {type}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" className="mt-1" />
        </ScrollArea>
      ) : (
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth cursor-grab"
          style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {showAllOption && (
            <Button
              variant={selectedType === null ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectType(null)}
              className={cn(getButtonClasses(selectedType === null), "mr-2 flex-shrink-0")}
            >
              {allOptionLabel}
            </Button>
          )}
          
          {standardPPETypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectType(type)}
              className={cn(getButtonClasses(selectedType === type), "mr-2 flex-shrink-0")}
            >
              {type}
            </Button>
          ))}
        </div>
      )}
      
      {showScrollButtons && variant === 'scrollable' && (
        <button 
          onClick={scrollRight}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 shadow-md rounded-full p-1"
          aria-label="Scroll right"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

export default ConsolidatedPPETypeFilter;
