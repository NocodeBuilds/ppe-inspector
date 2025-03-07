
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PPEType } from '@/types';

// Define the standard PPE types for the entire application
export const standardPPETypes: PPEType[] = [
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
}

const EnhancedPPETypeFilter: React.FC<PPETypeFilterProps> = ({
  selectedType,
  onSelectType,
  className
}) => {
  return (
    <div className={`${className || ''}`}>
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex space-x-2 p-1">
          <Button
            variant={selectedType === null ? "default" : "outline"}
            size="sm"
            onClick={() => onSelectType(null)}
            className="rounded-full px-4 text-xs h-8 border-2 border-primary/10 font-medium"
          >
            All Items
          </Button>
          
          {standardPPETypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => onSelectType(type)}
              className={`rounded-full px-4 text-xs h-8 whitespace-nowrap font-medium border-2 ${
                selectedType === type ? 'border-primary' : 'border-primary/10'
              }`}
            >
              {type}
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default EnhancedPPETypeFilter;
