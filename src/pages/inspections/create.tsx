import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { 
  CheckCircle2, 
  ChevronRight, 
  ClipboardList, 
  HardHat, 
  Shield
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

// Example inspection templates
const inspectionTemplates = [
  {
    id: 'template-harness',
    title: 'Fall Protection Harness',
    icon: <Shield className="h-10 w-10 text-primary" />,
    description: 'Complete inspection for safety harnesses and lanyards',
    checkpoints: 24,
    estimatedTime: '10-15 min',
  },
  {
    id: 'template-helmet',
    title: 'Safety Helmet',
    icon: <HardHat className="h-10 w-10 text-primary" />,
    description: 'Standard inspection for all types of safety helmets',
    checkpoints: 16,
    estimatedTime: '5-10 min',
  },
  {
    id: 'template-custom',
    title: 'Custom Inspection',
    icon: <ClipboardList className="h-10 w-10 text-primary" />,
    description: 'Create your own inspection checklist from scratch',
    checkpoints: 'Variable',
    estimatedTime: 'Variable',
  },
];

// Recent equipment data
const recentEquipment = [
  {
    id: 'equip-001',
    name: 'Harness #A1234',
    type: 'Full Body Harness',
    lastInspection: '2025-04-10',
    status: 'Passed',
  },
  {
    id: 'equip-002',
    name: 'Helmet #H5678',
    type: 'Type II Safety Helmet',
    lastInspection: '2025-04-15',
    status: 'Passed',
  },
  {
    id: 'equip-003',
    name: 'Lanyard #L9012',
    type: 'Shock-Absorbing Lanyard',
    lastInspection: '2025-04-08',
    status: 'Passed',
  },
];

export function CreateInspectionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [selectedEquipment, setSelectedEquipment] = React.useState<string | null>(null);

  const handleStartInspection = () => {
    // Validate selection
    if (!selectedTemplate) {
      toast({
        title: 'Template Required',
        description: 'Please select an inspection template to continue',
        variant: 'warning',
      });
      return;
    }

    // For custom template, go directly to custom builder
    if (selectedTemplate === 'template-custom') {
      navigate({ to: '/inspections/custom-builder' });
      return;
    }

    // For standard templates, proceed to equipment selection if not selected
    if (!selectedEquipment) {
      toast({
        title: 'Equipment Required',
        description: 'Please select equipment to inspect',
        variant: 'warning',
      });
      return;
    }

    // Navigate to the inspection form with template and equipment IDs
    navigate({ 
      to: '/inspections/form',
      search: {
        templateId: selectedTemplate,
        equipmentId: selectedEquipment
      }
    });
    
    toast({
      title: 'Inspection Started',
      description: 'Loading inspection form...',
      variant: 'info',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Create New Inspection</h1>
        <p className="text-body text-muted-foreground">
          Start a new PPE inspection by selecting a template and equipment
        </p>
      </header>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="templates" className="flex-1">Inspection Templates</TabsTrigger>
          <TabsTrigger value="equipment" className="flex-1">Select Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Select Inspection Template</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inspectionTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all ${
                  selectedTemplate === template.id 
                    ? 'ring-2 ring-primary ring-offset-2' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedTemplate(template.id)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <CardTitle className="text-xl">{template.title}</CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    {template.icon}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-body-sm">
                    <div>
                      <span className="text-muted-foreground">Checkpoints: </span>
                      <span className="font-medium">{template.checkpoints}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      <span className="font-medium">{template.estimatedTime}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  {selectedTemplate === template.id && (
                    <div className="flex items-center w-full justify-end text-primary">
                      <CheckCircle2 className="h-5 w-5 mr-1" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="equipment" className="mt-6">
          <h2 className="text-2xl font-semibold mb-4">Select Equipment to Inspect</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Recently Inspected Equipment</h3>
              <Button variant="outline" asChild>
                <a href="/equipment">Browse All Equipment</a>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {recentEquipment.map((equipment) => (
                <Card 
                  key={equipment.id} 
                  className={`cursor-pointer transition-all ${
                    selectedEquipment === equipment.id 
                      ? 'ring-2 ring-primary ring-offset-2' 
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedEquipment(equipment.id)}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{equipment.name}</CardTitle>
                    <CardDescription>{equipment.type}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="text-body-sm">
                      <span className="text-muted-foreground">Last inspection: </span>
                      <span className="font-medium">
                        {new Date(equipment.lastInspection).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-body-sm">
                      <span className="text-muted-foreground">Status: </span>
                      <span className="font-medium text-success">{equipment.status}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    {selectedEquipment === equipment.id && (
                      <div className="flex items-center w-full justify-end text-primary">
                        <CheckCircle2 className="h-5 w-5 mr-1" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
            
            <div className="flex justify-center mt-6">
              <Button variant="outline" className="w-full md:w-auto">
                Register New Equipment
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button 
          onClick={handleStartInspection}
          size="lg"
          className="gap-2"
        >
          Start Inspection
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default CreateInspectionPage;
