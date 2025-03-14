
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Check, Plus, Search, Filter, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { InspectionTemplate } from '@/types/inspection';
import { PPEType } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface TemplateSelectorProps {
  ppeType: PPEType;
  onSelectTemplate: (template: InspectionTemplate) => void;
  onCreateNewTemplate: () => void;
  selectedTemplateId?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  ppeType,
  onSelectTemplate,
  onCreateNewTemplate,
  selectedTemplateId,
}) => {
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMine, setShowMine] = useState(false);
  
  // Mock fetch templates - would be replaced with actual API call
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockTemplates: InspectionTemplate[] = [
          {
            id: '1',
            name: 'Standard Monthly Inspection',
            ppeType: ppeType,
            checkpoints: [],
            isDefault: true,
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Comprehensive Quarterly Inspection',
            ppeType: ppeType,
            checkpoints: [],
            isDefault: false,
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Quick Pre-Use Check',
            ppeType: ppeType,
            checkpoints: [],
            isDefault: false,
            createdAt: new Date().toISOString(),
          }
        ];
        
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, [ppeType]);
  
  const filteredTemplates = templates.filter(template => {
    if (searchQuery) {
      return template.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  }).filter(template => {
    if (showMine) {
      return !template.isDefault;
    }
    return true;
  });
  
  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => setShowMine(!showMine)}>
          <Filter className="h-4 w-4" />
        </Button>
      </div>
      
      {showMine && (
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="show-mine" 
            checked={showMine} 
            onCheckedChange={() => setShowMine(!showMine)} 
          />
          <label htmlFor="show-mine" className="text-sm font-medium">
            Show only my templates
          </label>
        </div>
      )}
      
      <div className="grid gap-3">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`p-4 transition cursor-pointer hover:border-primary ${
                selectedTemplateId === template.id ? 'border-2 border-primary' : ''
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    {template.createdAt ? new Date(template.createdAt).toLocaleDateString() : 'Unknown date'}
                  </div>
                </div>
                {selectedTemplateId === template.id && (
                  <div className="bg-primary text-primary-foreground h-6 w-6 rounded-full flex items-center justify-center">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>
              {template.isDefault && (
                <div className="mt-2">
                  <span className="text-xs bg-muted px-2 py-1 rounded-full">Default</span>
                </div>
              )}
            </Card>
          ))
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No templates found
          </div>
        )}
        
        <Button 
          variant="outline" 
          className="mt-2 border-dashed"
          onClick={onCreateNewTemplate}
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Template
        </Button>
      </div>
    </div>
  );
};

export default TemplateSelector;
