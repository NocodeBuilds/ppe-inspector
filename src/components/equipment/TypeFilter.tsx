import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PPEType } from '@/types';
import { cn } from '@/lib/utils';

interface TypeFilterProps {
  types: string[];
  selectedType: string | null;
  onSelectType: (type: string | null) => void;
}

const TypeFilter: React.FC<TypeFilterProps> = ({ types, selectedType, onSelectType }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Function to scroll left
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };
  
  // Function to scroll right
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };
  
  // Add drag scroll functionality
  useEffect(() => {
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
  }, []);
  
  // Check if scrolling is needed
  const [showScrollButtons, setShowScrollButtons] = useState(false);
  
  useEffect(() => {
    const checkScrollable = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setShowScrollButtons(container.scrollWidth > container.clientWidth);
      }
    };
    
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [types]);
  
  return (
    <div className="relative mb-6 px-1">
      {showScrollButtons && (
        <button 
          onClick={scrollLeft}
          className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-background/80 shadow-md rounded-full p-1"
          aria-label="Scroll left"
        >
          <ChevronLeft size={20} />
        </button>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto py-2 px-1 no-scrollbar scroll-smooth cursor-grab"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <Button
          variant={selectedType === null ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectType(null)}
          className={cn("whitespace-nowrap mr-2 flex-shrink-0", 
            selectedType === null ? "bg-primary text-primary-foreground" : ""
          )}
        >
          All Types
        </Button>
        
        {types.map((type) => (
          <Button
            key={type}
            variant={selectedType === type ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectType(type)}
            className={cn("whitespace-nowrap mr-2 flex-shrink-0", 
              selectedType === type ? "bg-primary text-primary-foreground" : ""
            )}
          >
            {type}
          </Button>
        ))}
      </div>
      
      {showScrollButtons && (
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

export default TypeFilter;
