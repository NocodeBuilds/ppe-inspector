import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Camera, Check, ChevronLeft, ChevronRight, Delete, Info, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { InspectionCheckpoint } from '@/types';
import CheckpointItem from '@/components/inspection/CheckpointItem';
import SignatureCanvas from '@/components/inspection/SignatureCanvas';
import { getStandardCheckpoints } from '@/services/checkpointService';
import { useAuth } from '@/hooks/useAuth';

const toPPEType = (typeString: string) => {
  const validTypes = [
    'Full Body Harness',
    'Fall Arrester',
    'Double Lanyard',
    'Safety Helmet',
    'Safety Boots',
    'Safety Gloves',
    'Safety Goggles',
    'Ear Protection'
  ];
  
  if (validTypes.includes(typeString)) {
    return typeString;
  }
  
  return 'Safety Helmet';
};

const InspectionForm = () => {
  const { ppeId } = useParams<{ ppeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [ppeItem, setPpeItem] = useState<{
    id: string;
    serialNumber: string;
    type: string;
    brand: string;
    modelNumber: string;
  } | null>(null);
  
  const [inspectionType, setInspectionType] = useState<'pre-use' | 'monthly' | 'quarterly'>('pre-use');
  const [checkpoints, setCheckpoints] = useState<InspectionCheckpoint[]>([]);
  const [results, setResults] = useState<Record<string, { passed: boolean; notes: string; photoUrl?: string }>>({});
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [overallResult, setOverallResult] = useState<'pass' | 'fail'>('pass');
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [ppeError, setPpeError] = useState<string | null>(null);
  const [checkpointsError, setCheckpointsError] = useState<string | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  
  useEffect(() => {
    if (ppeId) {
      fetchPPEItem(ppeId);
    } else {
      setPpeError('No PPE ID provided');
      setIsLoading(false);
    }
  }, [ppeId]);
  
  const fetchPPEItem = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setPpeItem({
          id: data.id,
          serialNumber: data.serial_number,
          type: toPPEType(data.type),
          brand: data.brand,
          modelNumber: data.model_number,
        });
        
        loadCheckpoints(data.type);
      }
    } catch (error: any) {
      console.error('Error fetching PPE item:', error);
      setPpeError(error.message || 'Failed to load PPE item');
      setIsLoading(false);
    }
  };
  
  const loadCheckpoints = (ppeType: string) => {
    try {
      const standardCheckpoints = getStandardCheckpoints(ppeType);
      
      if (standardCheckpoints.length === 0) {
        setCheckpointsError('No checkpoints defined for this PPE type');
        setIsLoading(false);
        return;
      }
      
      const formattedCheckpoints = standardCheckpoints.map((checkpoint, index) => ({
        id: `${ppeType.replace(/\s+/g, '-').toLowerCase()}-${index}`,
        description: checkpoint.description,
        ppeType: checkpoint.ppeType as any,
        required: checkpoint.required
      }));
      
      setCheckpoints(formattedCheckpoints);
      
      const initialResults: Record<string, { passed: boolean; notes: string; photoUrl?: string }> = {};
      formattedCheckpoints.forEach(checkpoint => {
        initialResults[checkpoint.id] = { passed: true, notes: '' };
      });
      
      setResults(initialResults);
      setIsLoading(false);
      
    } catch (error: any) {
      console.error('Error loading checkpoints:', error);
      setCheckpointsError(error.message || 'Failed to load inspection checkpoints');
      setIsLoading(false);
    }
  };
  
  const handleResultChange = (checkpointId: string, value: boolean) => {
    setResults(prev => ({
      ...prev,
      [checkpointId]: { ...prev[checkpointId], passed: value }
    }));
    
    if (!value) {
      setOverallResult('fail');
    } else {
      const allPassing = Object.values({ 
        ...results, 
        [checkpointId]: { ...results[checkpointId], passed: value } 
      }).every(result => result.passed);
      
      if (allPassing) {
        setOverallResult('pass');
      }
    }
  };
  
  const handleNotesChange = (checkpointId: string, value: string) => {
    setResults(prev => ({
      ...prev,
      [checkpointId]: { ...prev[checkpointId], notes: value }
    }));
  };
  
  const handlePhotoCapture = (checkpointId: string, photoUrl: string) => {
    setResults(prev => ({
      ...prev,
      [checkpointId]: { ...prev[checkpointId], photoUrl }
    }));
  };
  
  const handlePhotoDelete = (checkpointId: string) => {
    setResults(prev => {
      const newResults = { ...prev };
      delete newResults[checkpointId].photoUrl;
      return newResults;
    });
  };
  
  const handleNextStep = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    }
  };
  
  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };
  
  const validateForm = (): boolean => {
    const invalidResults = Object.entries(results).filter(
      ([_, result]) => !result.passed && !result.notes.trim()
    );
    
    if (invalidResults.length > 0) {
      setResultsError('Please add notes for all failed checkpoints');
      return false;
    }
    
    if (step === 3 && !signature) {
      toast({
        title: 'Signature Required',
        description: 'Please sign to complete the inspection',
        variant: 'destructive',
      });
      return false;
    }
    
    setResultsError(null);
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to submit inspections',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppeItem?.id,
          type: inspectionType,
          date: new Date().toISOString(),
          overall_result: overallResult,
          notes: notes,
          signature_url: signature,
          inspector_id: user.id,
        })
        .select('id')
        .single();
      
      if (inspectionError) throw inspectionError;
      
      const resultsToInsert = Object.entries(results).map(([checkpointId, result]) => ({
        inspection_id: inspection.id,
        checkpoint_id: checkpointId,
        passed: result.passed,
        notes: result.notes,
        photo_url: result.photoUrl,
      }));
      
      const { error: resultsError } = await supabase
        .from('inspection_results')
        .insert(resultsToInsert);
      
      if (resultsError) throw resultsError;
      
      const now = new Date();
      let nextInspectionDate: Date;
      
      switch (inspectionType) {
        case 'monthly':
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(now.getMonth() + 1);
          break;
        case 'quarterly':
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(now.getMonth() + 3);
          break;
        case 'pre-use':
        default:
          nextInspectionDate = new Date(now);
          nextInspectionDate.setDate(now.getDate() + 7);
          break;
      }
      
      const newStatus = overallResult === 'pass' ? 'active' : 'flagged';
      
      const { error: ppeUpdateError } = await supabase
        .from('ppe_items')
        .update({
          last_inspection: now.toISOString(),
          next_inspection: nextInspectionDate.toISOString(),
          status: newStatus,
        })
        .eq('id', ppeItem?.id);
      
      if (ppeUpdateError) throw ppeUpdateError;
      
      queryClient.invalidateQueries({ queryKey: ['ppe-items'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-inspections'] });
      
      toast({
        title: 'Inspection Completed',
        description: 'The inspection has been successfully recorded',
      });
      
      navigate(`/equipment/${ppeItem?.id}`);
    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'Failed to submit inspection',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center my-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (ppeError) {
    return (
      <div className="text-center my-12">
        <p className="text-destructive mb-4">{ppeError}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="pb-20">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
        </Button>
        <h1 className="text-2xl font-bold">Inspection Form</h1>
      </div>
      
      <Card className="p-4 mb-6 border border-border/40 shadow-sm">
        <h2 className="font-semibold mb-2">{ppeItem?.type}</h2>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Serial Number</p>
            <p>{ppeItem?.serialNumber}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Brand</p>
            <p>{ppeItem?.brand}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Model</p>
            <p>{ppeItem?.modelNumber}</p>
          </div>
        </div>
      </Card>
      
      <div className="relative mb-6">
        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-muted">
          <div 
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary" 
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
        <div className="flex justify-between">
          <div className={`text-xs ${step >= 1 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Inspection Type
          </div>
          <div className={`text-xs ${step >= 2 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Checkpoints
          </div>
          <div className={`text-xs ${step >= 3 ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
            Sign Off
          </div>
        </div>
      </div>
      
      {step === 1 && (
        <div className="fade-in">
          <h2 className="text-lg font-medium mb-4">Select Inspection Type</h2>
          
          <div className="grid grid-cols-1 gap-3 mb-8">
            <Card 
              className={`p-4 cursor-pointer border-2 ${inspectionType === 'pre-use' ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setInspectionType('pre-use')}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${inspectionType === 'pre-use' ? 'bg-primary text-white' : 'border border-muted-foreground'}`}>
                  {inspectionType === 'pre-use' && <Check size={12} />}
                </div>
                <div>
                  <h3 className="font-medium">Pre-Use Inspection</h3>
                  <p className="text-sm text-muted-foreground">Basic inspection before each use</p>
                </div>
              </div>
            </Card>
            
            <Card 
              className={`p-4 cursor-pointer border-2 ${inspectionType === 'monthly' ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setInspectionType('monthly')}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${inspectionType === 'monthly' ? 'bg-primary text-white' : 'border border-muted-foreground'}`}>
                  {inspectionType === 'monthly' && <Check size={12} />}
                </div>
                <div>
                  <h3 className="font-medium">Monthly Inspection</h3>
                  <p className="text-sm text-muted-foreground">Detailed inspection on a monthly basis</p>
                </div>
              </div>
            </Card>
            
            <Card 
              className={`p-4 cursor-pointer border-2 ${inspectionType === 'quarterly' ? 'border-primary' : 'border-transparent'}`}
              onClick={() => setInspectionType('quarterly')}
            >
              <div className="flex items-center">
                <div className={`w-5 h-5 rounded-full mr-3 flex items-center justify-center ${inspectionType === 'quarterly' ? 'bg-primary text-white' : 'border border-muted-foreground'}`}>
                  {inspectionType === 'quarterly' && <Check size={12} />}
                </div>
                <div>
                  <h3 className="font-medium">Quarterly Inspection</h3>
                  <p className="text-sm text-muted-foreground">Comprehensive inspection every 3 months</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {step === 2 && (
        <div className="fade-in">
          <h2 className="text-lg font-medium mb-4">Inspection Checkpoints</h2>
          
          {checkpointsError ? (
            <div className="text-center my-8">
              <p className="text-destructive mb-4">{checkpointsError}</p>
            </div>
          ) : checkpoints.length === 0 ? (
            <div className="text-center my-8">
              <p className="text-muted-foreground mb-4">No checkpoints defined for this equipment type</p>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {checkpoints.map((checkpoint) => (
                <CheckpointItem
                  key={checkpoint.id}
                  id={checkpoint.id}
                  description={checkpoint.description}
                  passed={results[checkpoint.id]?.passed || false}
                  notes={results[checkpoint.id]?.notes || ''}
                  photoUrl={results[checkpoint.id]?.photoUrl}
                  onPassedChange={(value) => handleResultChange(checkpoint.id, value)}
                  onNotesChange={(value) => handleNotesChange(checkpoint.id, value)}
                  onPhotoCapture={(url) => handlePhotoCapture(checkpoint.id, url)}
                  onPhotoDelete={() => handlePhotoDelete(checkpoint.id)}
                />
              ))}
            </div>
          )}
          
          {resultsError && (
            <div className="p-3 mb-4 bg-destructive/10 text-destructive rounded-md text-sm">
              <p>{resultsError}</p>
            </div>
          )}
          
          <div className="mt-8">
            <h3 className="text-sm font-medium mb-2">Overall Result</h3>
            <div className="flex gap-3">
              <Button
                type="button"
                variant={overallResult === 'pass' ? 'default' : 'outline'}
                className={overallResult === 'pass' ? 'bg-success hover:bg-success/90' : ''}
                onClick={() => setOverallResult('pass')}
              >
                <Check size={16} className="mr-2" />
                Pass
              </Button>
              
              <Button
                type="button"
                variant={overallResult === 'fail' ? 'default' : 'outline'}
                className={overallResult === 'fail' ? 'bg-destructive hover:bg-destructive/90' : ''}
                onClick={() => setOverallResult('fail')}
              >
                <X size={16} className="mr-2" />
                Fail
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {step === 3 && (
        <div className="fade-in">
          <h2 className="text-lg font-medium mb-4">Sign Off</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium block mb-2">Additional Notes (Optional)</label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any general notes about the inspection..."
                rows={4}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium block mb-2">Inspector Signature</label>
              <div className="border rounded-md p-2 bg-muted/30 mb-2">
                <SignatureCanvas 
                  onSave={setSignature}
                  existingSignature={signature}
                  onSignatureEnd={(signatureData) => setSignature(signatureData)} 
                />
              </div>
              
              {signature && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSignature(null)}
                  className="text-xs"
                >
                  <Delete size={14} className="mr-1" />
                  Clear Signature
                </Button>
              )}
            </div>
            
            <div className="p-4 bg-muted rounded-md mt-4">
              <div className="flex items-start gap-3">
                <Info size={20} className="text-muted-foreground mt-0.5" />
                <div>
                  <h4 className="font-medium text-sm">Inspection Summary</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    By submitting this form, you confirm that you have inspected {ppeItem?.type} (Serial: {ppeItem?.serialNumber}) 
                    and the overall result is {overallResult === 'pass' ? 'PASS' : 'FAIL'}.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <Separator className="my-6" />
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevStep}
          disabled={step === 1}
        >
          <ChevronLeft size={16} className="mr-2" />
          Previous
        </Button>
        
        {step < 3 ? (
          <Button onClick={handleNextStep}>
            Next
            <ChevronRight size={16} className="ml-2" />
          </Button>
        ) : (
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check size={16} className="mr-2" />
                Submit Inspection
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default InspectionForm;
