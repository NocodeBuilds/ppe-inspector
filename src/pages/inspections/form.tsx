import React from 'react';
import { useNavigate, useSearch } from '@tanstack/react-router';
import { 
  ArrowLeft, 
  ArrowRight, 
  Camera, 
  Check, 
  ChevronRight, 
  ClipboardList, 
  Save, 
  X, 
  AlertTriangle,
  Info,
  FileText,
  CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupField, RadioItemWithLabel } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch, SwitchField } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Mock data for demo purposes
// In a real application, this would come from an API based on the template and equipment IDs
const mockInspectionData = {
  template: {
    id: 'template-harness',
    title: 'Fall Protection Harness Inspection',
    description: 'Complete inspection for safety harnesses and lanyards',
    checkpointGroups: [
      {
        id: 'group-1',
        title: 'Webbing',
        description: 'Inspect all webbing components',
        checkpoints: [
          {
            id: 'cp1',
            label: 'Check for cuts, tears, or frayed edges',
            helpText: 'Examine the entire length of webbing for any damage',
            critical: true,
          },
          {
            id: 'cp2',
            label: 'Inspect for chemical damage or burns',
            helpText: 'Look for discoloration, brittleness, or unusual texture',
            critical: true,
          },
          {
            id: 'cp3',
            label: 'Check for stretched or worn areas',
            helpText: 'Look for areas that have lost their original shape or thickness',
            critical: false,
          }
        ]
      },
      {
        id: 'group-2',
        title: 'Hardware',
        description: 'Inspect all metal components',
        checkpoints: [
          {
            id: 'cp4',
            label: 'Check D-rings for cracks, distortion, or corrosion',
            helpText: 'D-rings should be straight and free from significant wear',
            critical: true,
          },
          {
            id: 'cp5',
            label: 'Inspect buckles for proper function',
            helpText: 'Buckles should engage and release properly without excessive force',
            critical: true,
          },
          {
            id: 'cp6',
            label: 'Check for loose, distorted or broken grommets',
            helpText: 'All grommets should be secure and properly shaped',
            critical: false,
          }
        ]
      },
      {
        id: 'group-3',
        title: 'Stitching',
        description: 'Inspect all stitched areas and seams',
        checkpoints: [
          {
            id: 'cp7',
            label: 'Check for pulled or loose stitches',
            helpText: 'Examine all stitched areas carefully, particularly at stress points',
            critical: true,
          },
          {
            id: 'cp8',
            label: 'Inspect for cuts or broken stitches',
            helpText: 'Look for any area where stitching pattern is interrupted',
            critical: true,
          },
          {
            id: 'cp9',
            label: 'Check for wear or abrasion at stitching points',
            helpText: 'Areas where components connect often show early signs of wear',
            critical: false,
          }
        ]
      }
    ]
  },
  equipment: {
    id: 'equip-001',
    name: 'Harness #A1234',
    type: 'Full Body Harness',
    model: 'SafetyFirst Pro X3',
    serialNumber: 'SN-12345678',
    manufacturingDate: '2024-01-15',
    lastInspection: {
      date: '2025-04-10',
      result: 'Pass',
      inspector: 'John Doe'
    }
  }
};

// Type for checkpoint responses
type CheckpointResponse = {
  checkpointId: string;
  result: 'pass' | 'fail' | 'n/a';
  notes: string;
  photos: string[]; // In a real app, these would be file objects or URLs
};

export function InspectionFormPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: '/inspections/form' });
  const { toast } = useToast();
  
  // Form state
  const [currentStep, setCurrentStep] = React.useState(0);
  const [responses, setResponses] = React.useState<Record<string, CheckpointResponse>>({});
  const [currentGroupIndex, setCurrentGroupIndex] = React.useState(0);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = React.useState(false);
  const [inspectorName, setInspectorName] = React.useState('');
  const [inspectorSignature, setInspectorSignature] = React.useState(false);
  
  // Load data based on URL params
  const templateId = search.templateId as string;
  const equipmentId = search.equipmentId as string;
  
  // In a real application, we'd fetch the data here
  const { template, equipment } = mockInspectionData;
  
  // Calculate progress
  const totalCheckpoints = template.checkpointGroups.reduce(
    (sum, group) => sum + group.checkpoints.length, 
    0
  );
  const completedCheckpoints = Object.keys(responses).length;
  const progressPercentage = totalCheckpoints > 0 
    ? Math.round((completedCheckpoints / totalCheckpoints) * 100) 
    : 0;
  
  const currentGroup = template.checkpointGroups[currentGroupIndex];
  
  // Handle checkpoint responses
  const handleResponseChange = (checkpointId: string, result: 'pass' | 'fail' | 'n/a') => {
    setResponses(prev => ({
      ...prev,
      [checkpointId]: {
        ...prev[checkpointId],
        checkpointId,
        result,
        notes: prev[checkpointId]?.notes || '',
        photos: prev[checkpointId]?.photos || [],
      }
    }));
  };
  
  const handleNotesChange = (checkpointId: string, notes: string) => {
    setResponses(prev => ({
      ...prev,
      [checkpointId]: {
        ...prev[checkpointId],
        notes,
      }
    }));
  };
  
  // Navigation between groups
  const goToNextGroup = () => {
    if (currentGroupIndex < template.checkpointGroups.length - 1) {
      setCurrentGroupIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      setShowCompleteDialog(true);
    }
  };
  
  const goToPreviousGroup = () => {
    if (currentGroupIndex > 0) {
      setCurrentGroupIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };
  
  // Save draft or complete inspection
  const saveAsDraft = () => {
    // In a real app, we'd call an API to save the draft here
    toast({
      title: "Draft Saved",
      description: "Your inspection has been saved as a draft",
      variant: "success",
    });
    setShowSaveDialog(false);
    navigate({ to: "/inspections" });
  };
  
  const completeInspection = () => {
    if (!inspectorName) {
      toast({
        title: "Inspector Name Required",
        description: "Please enter your name to complete the inspection",
        variant: "warning",
      });
      return;
    }
    
    if (!inspectorSignature) {
      toast({
        title: "Signature Required",
        description: "Please confirm your digital signature to complete the inspection",
        variant: "warning",
      });
      return;
    }
    
    // In a real app, we'd call an API to submit the inspection here
    toast({
      title: "Inspection Completed",
      description: "Your inspection has been successfully submitted",
      variant: "success",
    });
    
    navigate({ to: "/inspections" });
  };
  
  // Determine the overall inspection result
  const getOverallResult = (): 'pass' | 'fail' | 'incomplete' => {
    // If any critical checkpoint failed, the entire inspection fails
    const hasCriticalFailure = template.checkpointGroups
      .flatMap(group => group.checkpoints)
      .some(checkpoint => 
        checkpoint.critical && 
        responses[checkpoint.id]?.result === 'fail'
      );
    
    if (hasCriticalFailure) {
      return 'fail';
    }
    
    // If not all checkpoints have responses, it's incomplete
    const allCheckpointsAnswered = template.checkpointGroups
      .flatMap(group => group.checkpoints)
      .every(checkpoint => responses[checkpoint.id]);
    
    if (!allCheckpointsAnswered) {
      return 'incomplete';
    }
    
    return 'pass';
  };
  
  const overallResult = getOverallResult();
  
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <header className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSaveDialog(true)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">{template.title}</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <p className="text-body-sm font-medium">{equipment.name}</p>
            <p className="text-body-sm text-muted-foreground">
              {equipment.type} • SN: {equipment.serialNumber}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
          </div>
        </div>
      </header>
      
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <p className="text-sm font-medium">Inspection Progress</p>
          <p className="text-sm text-muted-foreground">
            {completedCheckpoints} of {totalCheckpoints} checkpoints
          </p>
        </div>
        <Progress value={progressPercentage} />
      </div>
      
      <Tabs defaultValue="inspection" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="inspection" className="flex-1">
            <ClipboardList className="h-4 w-4 mr-2" />
            Inspection
          </TabsTrigger>
          <TabsTrigger value="equipment-info" className="flex-1">
            <Info className="h-4 w-4 mr-2" />
            Equipment Info
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="inspection" className="mt-6">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  {currentGroup.title}
                </CardTitle>
                <Badge variant="outline">
                  Section {currentGroupIndex + 1} of {template.checkpointGroups.length}
                </Badge>
              </div>
              <p className="text-body-sm text-muted-foreground">
                {currentGroup.description}
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {currentGroup.checkpoints.map((checkpoint) => {
                const response = responses[checkpoint.id];
                const showNotes = response?.result === 'fail';
                
                return (
                  <div key={checkpoint.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-body font-medium">{checkpoint.label}</h3>
                          {checkpoint.critical && (
                            <Badge variant="destructive" className="text-xs">Critical</Badge>
                          )}
                        </div>
                        <p className="text-body-sm text-muted-foreground">
                          {checkpoint.helpText}
                        </p>
                      </div>
                    </div>
                    
                    <RadioGroupField
                      value={response?.result}
                      onValueChange={(value) => 
                        handleResponseChange(checkpoint.id, value as 'pass' | 'fail' | 'n/a')
                      }
                      className="flex space-x-4"
                    >
                      <RadioItemWithLabel
                        value="pass"
                        label="Pass"
                        id={`${checkpoint.id}-pass`}
                        className="flex-1"
                      />
                      <RadioItemWithLabel
                        value="fail"
                        label="Fail"
                        id={`${checkpoint.id}-fail`}
                        className="flex-1"
                      />
                      <RadioItemWithLabel
                        value="n/a"
                        label="N/A"
                        id={`${checkpoint.id}-na`}
                        className="flex-1"
                      />
                    </RadioGroupField>
                    
                    {showNotes && (
                      <div className="space-y-2">
                        <Label htmlFor={`notes-${checkpoint.id}`}>
                          Failure Notes (Required)
                        </Label>
                        <Textarea
                          id={`notes-${checkpoint.id}`}
                          placeholder="Describe the issue in detail..."
                          value={response?.notes || ''}
                          onChange={(e) => handleNotesChange(checkpoint.id, e.target.value)}
                        />
                        
                        <div className="flex items-center gap-2 mt-2">
                          <Button variant="outline" size="sm" className="gap-2">
                            <Camera className="h-4 w-4" />
                            Add Photo
                          </Button>
                          <p className="text-body-sm text-muted-foreground">
                            {response?.photos?.length || 0} photos added
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={goToPreviousGroup}
                disabled={currentGroupIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              <Button onClick={goToNextGroup}>
                {currentGroupIndex < template.checkpointGroups.length - 1 ? (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Review & Complete
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="equipment-info">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Equipment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Equipment Name</p>
                  <p className="text-body font-medium">{equipment.name}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Type</p>
                  <p className="text-body font-medium">{equipment.type}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Model</p>
                  <p className="text-body font-medium">{equipment.model}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Serial Number</p>
                  <p className="text-body font-medium">{equipment.serialNumber}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Manufacturing Date</p>
                  <p className="text-body font-medium">
                    {new Date(equipment.manufacturingDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-body-sm text-muted-foreground">Last Inspection</p>
                  <div className="flex items-center gap-2">
                    <p className="text-body font-medium">
                      {new Date(equipment.lastInspection.date).toLocaleDateString()}
                    </p>
                    <Badge variant="success">{equipment.lastInspection.result}</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 pt-4 border-t">
                <p className="text-body-sm text-muted-foreground">Last Inspector</p>
                <p className="text-body font-medium">{equipment.lastInspection.inspector}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Save Draft Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save Inspection as Draft?</DialogTitle>
            <DialogDescription>
              Your progress will be saved and you can continue the inspection later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Continue Inspection
            </Button>
            <div className="flex gap-2">
              <Button variant="destructive" onClick={() => navigate({ to: "/inspections" })}>
                Discard
              </Button>
              <Button onClick={saveAsDraft}>
                Save Draft
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Complete Inspection Dialog */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review & Complete Inspection</DialogTitle>
            <DialogDescription>
              Review your inspection before final submission
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 my-2">
            <div className="rounded-lg border p-4">
              <h3 className="text-lg font-semibold mb-2">Inspection Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-body-sm font-medium">Inspection Result</p>
                  
                  {overallResult === 'pass' && (
                    <Badge variant="success" className="flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Pass
                    </Badge>
                  )}
                  
                  {overallResult === 'fail' && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <X className="h-3 w-3" />
                      Fail
                    </Badge>
                  )}
                  
                  {overallResult === 'incomplete' && (
                    <Badge variant="warning" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Incomplete
                    </Badge>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-body-sm font-medium">Checkpoints Completed</p>
                  <p className="text-body-sm">
                    {completedCheckpoints} of {totalCheckpoints}
                  </p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-body-sm font-medium">Equipment</p>
                  <p className="text-body-sm">{equipment.name}</p>
                </div>
                
                <div className="flex justify-between items-center">
                  <p className="text-body-sm font-medium">Template</p>
                  <p className="text-body-sm">{template.title}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label 
                  htmlFor="inspector-name" 
                  className={!inspectorName ? "text-destructive" : ""}
                >
                  Inspector Name (Required)
                </Label>
                <Textarea
                  id="inspector-name"
                  placeholder="Enter your full name"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  className={!inspectorName ? "border-destructive" : ""}
                />
              </div>
              
              <SwitchField
                label="Digital Signature"
                description="I confirm that I have inspected this equipment according to all applicable standards and procedures."
                checked={inspectorSignature}
                onCheckedChange={(checked) => setInspectorSignature(checked)}
              />
              
              {overallResult === 'incomplete' && (
                <div className="flex items-center p-3 rounded-md bg-warning/10 border border-warning text-warning">
                  <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
                  <p className="text-body-sm">
                    Some checkpoints have not been completed. You can still save this as a draft.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 sm:justify-between">
            <Button variant="outline" onClick={() => setShowCompleteDialog(false)}>
              Go Back
            </Button>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={saveAsDraft}>
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              
              <Button 
                onClick={completeInspection}
                disabled={overallResult === 'incomplete'}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Complete Inspection
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default InspectionFormPage;
