import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Delete, Info, Loader2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { InspectionCheckpoint } from '@/types';
import CheckpointItem from '@/components/inspection/CheckpointItem';
import SignatureCanvas from '@/components/inspection/SignatureCanvas';
import InspectionSuccessDialog from '@/components/inspection/InspectionSuccessDialog';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/inspectionDetailPDF';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/inspectionExcelReport';
import { cn } from '@/lib/utils';
import { getStandardCheckpoints } from '@/services/checkpointService';
import { StandardInspectionData } from '@/utils/reportGenerator/reportDataFormatter';

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

const mapDbCheckpointToAppCheckpoint = (dbCheckpoint: any): InspectionCheckpoint => {
  return {
    id: dbCheckpoint.id,
    description: dbCheckpoint.description,
    ppeType: dbCheckpoint.ppe_type,
    required: true,
  };
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
    batch_number?: string;
    manufacturing_date?: string;
    expiry_date?: string;
  } | null>(null);
  
  const [inspectionType, setInspectionType] = useState<'pre-use' | 'monthly' | 'quarterly'>('pre-use');
  const [checkpoints, setCheckpoints] = useState<InspectionCheckpoint[]>([]);
  const [results, setResults] = useState<Record<string, { passed: boolean | null; notes: string; photoUrl?: string }>>({});
  const [notes, setNotes] = useState('');
  const [signature, setSignature] = useState<string | null>(null);
  const [overallResult, setOverallResult] = useState<'pass' | 'fail' | null>(null);
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [hasNetworkError, setHasNetworkError] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [ppeError, setPpeError] = useState<string | null>(null);
  const [checkpointsError, setCheckpointsError] = useState<string | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [submittedInspectionId, setSubmittedInspectionId] = useState<string | null>(null);
  const [submittedInspectionData, setSubmittedInspectionData] = useState<any | null>(null);
  
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
      setIsLoading(true);
      setPpeError(null);
      
      const { data, error } = await supabase
        .from('ppe_items')
        .select(`
          id,
          serial_number,
          type,
          brand,
          model_number,
          batch_number,
          manufacturing_date,
          expiry_date
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        console.log('PPE Item data:', data); // Debug log
        setPpeItem({
          id: data.id,
          serialNumber: data.serial_number,
          type: toPPEType(data.type),
          brand: data.brand,
          modelNumber: data.model_number,
          batch_number: data.batch_number ? String(data.batch_number) : '',
          manufacturing_date: data.manufacturing_date,
          expiry_date: data.expiry_date
        });
        
        await fetchCheckpoints(data.type);
      } else {
        throw new Error('PPE item not found');
      }
    } catch (error: any) {
      console.error('Error fetching PPE item:', error);
      setPpeError(error.message || 'Failed to load PPE item');
      setIsLoading(false);
    }
  };
  
  const fetchCheckpoints = async (ppeType: string) => {
    try {
      const { data: existingCheckpoints, error } = await supabase
        .from('inspection_checkpoints')
        .select('*')
        .eq('ppe_type', ppeType);
        
      if (error) {
        console.error('Error fetching checkpoints:', error);
        throw error;
      }
      
      if (existingCheckpoints && existingCheckpoints.length > 0) {
        console.log('Using checkpoints from database:', existingCheckpoints);
        const appCheckpoints = existingCheckpoints.map(mapDbCheckpointToAppCheckpoint);
        setCheckpoints(appCheckpoints);
        
        const initialResults: Record<string, { passed: boolean | null; notes: string; photoUrl?: string }> = {};
        existingCheckpoints.forEach(checkpoint => {
          initialResults[checkpoint.id] = { passed: null, notes: '' };
        });
        setResults(initialResults);
      } else {
        const standardCheckpoints = getStandardCheckpoints(ppeType);
        
        if (standardCheckpoints.length === 0) {
          setCheckpointsError('No checkpoints defined for this PPE type');
          setIsLoading(false);
          return;
        }
        
        const checkpointsToInsert = standardCheckpoints.map(cp => ({
          description: cp.description,
          ppe_type: ppeType
        }));
        
        const { data: insertedCheckpoints, error: insertError } = await supabase
          .from('inspection_checkpoints')
          .insert(checkpointsToInsert)
          .select();
          
        if (insertError) {
          console.error('Error inserting checkpoints:', insertError);
          throw insertError;
        }
        
        if (insertedCheckpoints) {
          console.log('Inserted new checkpoints:', insertedCheckpoints);
          const appCheckpoints = insertedCheckpoints.map(mapDbCheckpointToAppCheckpoint);
          setCheckpoints(appCheckpoints);
          
          const initialResults: Record<string, { passed: boolean | null; notes: string; photoUrl?: string }> = {};
          insertedCheckpoints.forEach(checkpoint => {
            initialResults[checkpoint.id] = { passed: null, notes: '' };
          });
          setResults(initialResults);
        }
      }
      
      setIsLoading(false);
    } catch (error: any) {
      console.error('Error with checkpoints:', error);
      
      const standardCheckpoints = getStandardCheckpoints(ppeType);
      if (standardCheckpoints.length > 0) {
        const tempCheckpoints = standardCheckpoints.map(cp => ({
          id: crypto.randomUUID(),
          description: cp.description,
          ppeType: ppeType,
          required: true
        }));
        
        setCheckpoints(tempCheckpoints);
        
        const initialResults: Record<string, { passed: boolean | null; notes: string; photoUrl?: string }> = {};
        tempCheckpoints.forEach(checkpoint => {
          initialResults[checkpoint.id] = { passed: null, notes: '' };
        });
        setResults(initialResults);
        
        setCheckpointsError('Using local checkpoints - database connection error');
      } else {
        setCheckpointsError('No checkpoints defined for this PPE type');
      }
      
      setIsLoading(false);
    }
  };
  
  const handleResultChange = (checkpointId: string, value: boolean | null) => {
    setResults(prev => ({
      ...prev,
      [checkpointId]: { ...prev[checkpointId], passed: value }
    }));
    
    const allResults = Object.entries({
      ...results,
      [checkpointId]: { ...results[checkpointId], passed: value }
    });
    
    const anyFailing = allResults.some(([_, result]) => result.passed === false);
    const allResultsEntered = allResults.every(([_, result]) => result.passed !== null);
    const allPassing = allResults.every(([_, result]) => result.passed === true || result.passed === null);
    
    if (anyFailing) {
      setOverallResult('fail');
    } else if (allResultsEntered && allPassing) {
      setOverallResult('pass');
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
    if (step === 2) {
      if (!validateForm()) {
        return;
      }
    }
    
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
    const unselectedRequired = checkpoints
      .filter(cp => cp.required)
      .filter(cp => results[cp.id]?.passed === null);
      
    if (unselectedRequired.length > 0) {
      setResultsError('Please select Pass or Fail for all required checkpoints');
      toast({
        title: 'Incomplete Form',
        description: 'Please select Pass or Fail for all required checkpoints',
        variant: 'destructive',
      });
      return false;
    }

    const invalidResults = Object.entries(results).filter(
      ([_, result]) => result.passed === false && !result.notes.trim()
    );
    
    if (invalidResults.length > 0) {
      setResultsError('Please add notes for all failed checkpoints');
      toast({
        title: 'Notes Required',
        description: 'Please add notes for all failed checkpoints',
        variant: 'destructive',
      });
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
  
  const saveFormToLocalStorage = () => {
    try {
      const formData = {
        ppeItem,
        inspectionType,
        results,
        notes,
        signature,
        overallResult,
        timestamp: new Date().toISOString()
      };
      
      const formKey = `inspection_form_${ppeId || 'new'}_${Date.now()}`;
      localStorage.setItem(formKey, JSON.stringify(formData));
      
      return formKey;
    } catch (error) {
      console.error('Error saving form to local storage:', error);
      return null;
    }
  };
  
  const handleRetry = async () => {
    setIsRetrying(true);
    const formKey = saveFormToLocalStorage();
    
    try {
      const online = navigator.onLine;
      if (!online) {
        throw new Error('You are currently offline. Please check your connection and try again.');
      }
      
      const pingResponse = await fetch(`https://oapfjmyyfuopajayrxzw.supabase.co/rest/v1/`, {
        method: 'HEAD',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9hcGZqbXl5ZnVvcGFqYXlyeHp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3NjEzOTcsImV4cCI6MjA1NjMzNzM5N30.ln7r0soXRMrjmOSY69za1GQkq4H-aW9tGvBI0O81T1U'
        }
      });
      
      if (!pingResponse.ok) {
        throw new Error('Server connection error. Please try again later.');
      }
      
      setHasNetworkError(false);
      await handleSubmit();
      
      if (formKey) {
        localStorage.removeItem(formKey);
      }
    } catch (error: any) {
      console.error('Retry failed:', error);
      toast({
        title: 'Retry Failed',
        description: error.message || 'Connection still unavailable',
        variant: 'destructive',
      });
    } finally {
      setIsRetrying(false);
    }
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
    setHasNetworkError(false);
    
    try {
      const inspectionTypeEnum = inspectionType as "pre-use" | "monthly" | "quarterly";
      
      saveFormToLocalStorage();
      
      console.log('Submitting inspection with data:', {
        ppe_id: ppeItem?.id,
        type: inspectionTypeEnum,
        overall_result: overallResult,
        checkpoint_ids: Object.keys(results),
      });
      
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppeItem?.id,
          type: inspectionTypeEnum,
          date: new Date().toISOString(),
          overall_result: overallResult || 'pass',
          notes: notes,
          signature_url: signature,
          inspector_id: user.id,
        })
        .select('id')
        .single();
      
      if (inspectionError) {
        console.error("Inspection insert error:", inspectionError);
        throw inspectionError;
      }
      
      console.log('Inspection created with ID:', inspection.id);
      
      const resultsToInsert = Object.entries(results).map(([checkpointId, result]) => ({
        inspection_id: inspection.id,
        checkpoint_id: checkpointId,
        passed: result.passed,
        notes: result.notes,
        photo_url: result.photoUrl,
      }));
      
      console.log('Inserting inspection results:', resultsToInsert);
      
      const { error: resultsError } = await supabase
        .from('inspection_results')
        .insert(resultsToInsert);
      
      if (resultsError) {
        console.error("Results insert error:", resultsError);
        throw resultsError;
      }
      
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
      
      const checkpointDetails = checkpoints.map(cp => ({
        id: cp.id,
        description: cp.description,
        passed: results[cp.id]?.passed,
        notes: results[cp.id]?.notes,
        photo_url: results[cp.id]?.photoUrl,
      }));
      
      const submittedData = {
        id: inspection.id,
        date: now.toISOString(),
        type: inspectionType,
        overall_result: overallResult || 'pass',
        notes: notes,
        signature_url: signature,
        inspector_name: user.user_metadata?.full_name || 'Unknown Inspector',
        ppe_type: ppeItem?.type || 'Unknown',
        ppe_serial: ppeItem?.serialNumber || 'Unknown',
        ppe_brand: ppeItem?.brand || 'Unknown',
        ppe_model: ppeItem?.modelNumber || 'Unknown',
        checkpoints: checkpointDetails
      };
      
      console.log('Setting submitted inspection data:', submittedData);
      setSubmittedInspectionData(submittedData);
      setSubmittedInspectionId(inspection.id);
      
      queryClient.invalidateQueries({ queryKey: ['ppe-items'] });
      queryClient.invalidateQueries({ queryKey: ['upcoming-inspections'] });
      
      toast({
        title: 'Inspection Completed',
        description: 'The inspection has been successfully recorded',
      });
      
      setShowSuccessDialog(true);
    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      
      if (
        error.message?.includes('fetch') || 
        error.message?.includes('network') ||
        error.message?.includes('connection') ||
        !navigator.onLine
      ) {
        setHasNetworkError(true);
        toast({
          title: 'Network Error',
          description: 'Could not connect to server. Your form has been saved. You can retry when connection is available.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Submission Failed',
          description: error.message || 'Failed to submit inspection',
          variant: 'destructive',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handlePDFDownload = async (data: StandardInspectionData): Promise<void> => {
    try {
      await generateInspectionDetailPDF(data);
      toast({
        title: 'PDF Generated',
        description: 'Inspection report has been downloaded as PDF',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'PDF Generation Failed',
        description: 'Could not generate PDF report',
        variant: 'destructive',
      });
    }
  };
  
  const handleExcelDownload = async (data: StandardInspectionData): Promise<void> => {
    try {
      await generateInspectionExcelReport(data);
      toast({
        title: 'Excel Generated',
        description: 'Inspection report has been downloaded as Excel',
      });
    } catch (error) {
      console.error('Excel generation error:', error);
      toast({
        title: 'Excel Generation Failed',
        description: 'Could not generate Excel report',
        variant: 'destructive',
      });
    }
  };
  
  const handleWhatsAppShare = async (): Promise<void> => {
    try {
      const message = 
        `Inspection Report\n` +
        `PPE: ${ppeItem?.type} (${ppeItem?.serialNumber})\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `Result: ${overallResult?.toUpperCase() || 'UNKNOWN'}\n` +
        `Inspector: ${user?.user_metadata?.full_name || 'Unknown Inspector'}\n`;
      
      const encodedMessage = encodeURIComponent(message);
      
      window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
      
      toast({
        title: 'Share via WhatsApp',
        description: 'WhatsApp opened with inspection details',
      });
    } catch (error) {
      console.error('WhatsApp share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share via WhatsApp',
        variant: 'destructive',
      });
    }
  };
  
  const handleEmailShare = async (): Promise<void> => {
    try {
      const subject = `Inspection Report - ${ppeItem?.type} (${ppeItem?.serialNumber})`;
      
      const body = 
        `Inspection Report\n\n` +
        `PPE: ${ppeItem?.type} (${ppeItem?.serialNumber})\n` +
        `Date: ${new Date().toLocaleDateString()}\n` +
        `Result: ${overallResult?.toUpperCase() || 'UNKNOWN'}\n` +
        `Inspector: ${user?.user_metadata?.full_name || 'Unknown Inspector'}\n`;
      
      const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      window.location.href = mailtoLink;
      
      toast({
        title: 'Share via Email',
        description: 'Email client opened with inspection details',
      });
    } catch (error) {
      console.error('Email share error:', error);
      toast({
        title: 'Share Failed',
        description: 'Could not share via email',
        variant: 'destructive',
      });
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
      
      <Card className="p-4 mb-4 border border-border/40 shadow-sm bg-slate-950">
        <h2 className="text-2xl font-semibold mb-3 text-white">{ppeItem?.type}</h2>
        
        {/* First row: Serial, Batch, Brand */}
        <div className="grid grid-cols-3 gap-x-4 md:gap-x-6 gap-y-2 mb-3">
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Serial Number</p>
            <p className="text-sm text-white truncate">{ppeItem?.serialNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Batch Number</p>
            <p className="text-sm text-white truncate">{ppeItem?.batch_number || '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Brand</p>
            <p className="text-sm text-white truncate">{ppeItem?.brand}</p>
          </div>
        </div>
        
        {/* Second row: Model, Manufacturing Date, Expiry Date */}
        <div className="grid grid-cols-3 gap-x-4 md:gap-x-6">
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Model</p>
            <p className="text-sm text-white truncate">{ppeItem?.modelNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Manufacturing Date</p>
            <p className="text-sm text-white truncate">{ppeItem?.manufacturing_date ? new Date(ppeItem.manufacturing_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '-'}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium truncate">Expiry Date</p>
            <p className="text-sm text-white truncate">{ppeItem?.expiry_date ? new Date(ppeItem.expiry_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' }) : '-'}</p>
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
                  passed={results[checkpoint.id]?.passed ?? null}
                  notes={results[checkpoint.id]?.notes ?? ''}
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
                variant="outline"
                className={cn(
                  "border transition-colors duration-200",
                  overallResult === 'pass' 
                    ? "!bg-green-500 hover:!bg-green-600 !border-green-600 text-white ring-green-400" 
                    : "hover:bg-green-50 hover:text-green-600 hover:border-green-400"
                )}
                onClick={() => setOverallResult('pass')}
              >
                <Check size={16} className="mr-2" />
                Pass
              </Button>
              
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "border transition-colors duration-200",
                  overallResult === 'fail' 
                    ? "!bg-red-500 hover:!bg-red-600 !border-red-600 text-white ring-red-400" 
                    : "hover:bg-red-50 hover:text-red-600 hover:border-red-400"
                )}
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
            
            {hasNetworkError && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md my-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} className="text-yellow-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-sm">Network Connection Issue</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      There was a problem connecting to the server. Your form data has been saved locally.
                    </p>
                    <Button 
                      onClick={handleRetry} 
                      className="mt-2" 
                      variant="outline"
                      disabled={isRetrying}
                    >
                      {isRetrying ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                          Retrying...
                        </>
                      ) : (
                        <>Retry Submission</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            )}
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
            disabled={isSubmitting || isRetrying}
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
      
      <InspectionSuccessDialog
        isOpen={showSuccessDialog}
        onClose={() => {
          setShowSuccessDialog(false);
          navigate(`/equipment/${ppeItem?.id}`);
        }}
        inspectionId={submittedInspectionId || ''}
        ppeId={ppeItem?.id || ''}
        onPDFDownload={handlePDFDownload}
        onExcelDownload={handleExcelDownload}
        onWhatsAppShare={handleWhatsAppShare}
        onEmailShare={handleEmailShare}
      />
    </div>
  );
};

export default InspectionForm;
