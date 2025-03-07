
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { PPEType } from '@/types';

interface PPETypeFilterProps {
  selectedType: string | null;
  onTypeChange: (type: string | null) => void;
}

const PPETypeFilter: React.FC<PPETypeFilterProps> = ({ selectedType, onTypeChange }) => {
  // Standard list of all PPE types
  const ppeTypes: PPEType[] = [
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
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium mb-2">Filter by Type</h3>
      <ScrollArea className="whitespace-nowrap pb-2">
        <div className="flex space-x-2">
          <Button
            key="all"
            variant={!selectedType ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange(null)}
            className="min-w-max"
          >
            All Types
          </Button>
          
          {ppeTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => onTypeChange(type)}
              className="min-w-max"
            >
              {type}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="mt-1" />
      </ScrollArea>
    </div>
  );
};

export default PPETypeFilter;
