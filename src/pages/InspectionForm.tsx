import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Check, ChevronLeft, ChevronRight, Delete, Info, Loader2, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import CheckpointItem from '@/components/inspection/CheckpointItem';
import SignatureCanvas from '@/components/inspection/SignatureCanvas';
import { getStandardCheckpoints } from '@/services/checkpointService';
import InspectionSuccessDialog from '@/components/inspection/InspectionSuccessDialog';
import { generateInspectionDetailPDF } from '@/utils/reportGenerator/inspectionDetailPDF';
import { generateInspectionExcelReport } from '@/utils/reportGenerator/inspectionExcelReport';

interface UserProfile {
  site_name: string | null;
  department: string | null;
  employee_role: string | null;
  Full_name: string | null;
  employee_id: string | null;
}

interface PPEItem {
  id: string;
  serialNumber: string;
  type: string;
  brand: string;
  modelNumber: string;
  siteName: string;
  manufacturingDate: string;
  expiryDate: string;
}

interface DbProfile {
  user_id: string;
  site_name: string | null;
  department: string | null;
  Employee_Role: string | null;
  Full_name: string | null;
  employee_id: string | null;
}

interface InspectionCheckpoint {
  id: string;
  description: string;
  passed: boolean;
  notes: string;
  required?: boolean;
  ppeType?: string;
}

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
    passed: false,
    notes: '',
    required: true,
    ppeType: dbCheckpoint.ppe_type
  };
};

const InspectionForm = () => {
  const { ppeId } = useParams<{ ppeId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const [ppeItem, setPpeItem] = useState<PPEItem | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

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

  useEffect(() => {
    if (user?.id) {
      fetchUserProfile(user.id);
    }
  }, [user?.id]);

  const fetchUserProfile = async (userId: string) => {
    try {
      type ProfileResponse = {
        site_name: string | null;
        department: string | null;
        Employee_Role: string | null;
        Full_name: string | null;
        employee_id: string | null;
      };

      const { data, error } = await supabase
        .from('profiles')
        .select('site_name,department,Employee_Role,Full_name,employee_id')
        .eq('user_id', userId)
        .single<ProfileResponse>();

      if (error) {
        console.error('Error fetching profile:', error);
        setUserProfile(null);
        return;
      }

      if (!data) {
        console.log('No profile found');
        setUserProfile(null);
        return;
      }

      const userProfile: UserProfile = {
        site_name: data.site_name,
        department: data.department,
        employee_role: data.Employee_Role,
        Full_name: data.Full_name,
        employee_id: data.employee_id
      };

      setUserProfile(userProfile);
      console.log('Profile data fetched:', data);
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      setUserProfile(null);
    }
  };

  const fetchPPEItem = async (id: string) => {
    try {
      setIsLoading(true);
      setPpeError(null);
      
      const { data: ppeData, error: ppeError } = await supabase
        .from('ppe_items')
        .select('id, serial_number, type, brand, model_number, manufacturing_date, expiry_date')
        .eq('id', id)
        .single();

      if (ppeError) throw ppeError;
      
      if (ppeData) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('site_name')
          .eq('user_id', user?.id)
          .single();
        
        setPpeItem({
          id: ppeData.id,
          serialNumber: ppeData.serial_number,
          type: toPPEType(ppeData.type),
          brand: ppeData.brand,
          modelNumber: ppeData.model_number,
          siteName: profileData?.site_name || 'Unknown Site',
          manufacturingDate: ppeData.manufacturing_date || 'N/A',
          expiryDate: ppeData.expiry_date || 'N/A'
        });
        
        await fetchCheckpoints(ppeData.type);
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
        .select('id, description, ppe_type')
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
          .select('id, description, ppe_type');
          
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
          passed: false,
          notes: ''
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
    if (!user) return;
    
    try {
      setIsSubmitting(true);
      
      const now = new Date();
      const inspectionRecord = {
        ppe_id: ppeItem?.id,
        type: inspectionType,
        date: now.toISOString(),
        overall_result: overallResult || 'pass',
        notes: notes,
        signature_url: signature,
        inspector_id: user.id,
        inspector_name: userProfile?.Full_name || user?.user_metadata?.name || 'Unknown Inspector',
        inspector_employee_id: userProfile?.employee_id || 'Unknown ID',
        inspector_role: userProfile?.employee_role || 'Unknown Role',
        site_name: userProfile?.site_name || 'Unknown Site'
      };

      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert(inspectionRecord)
        .select('id')
        .single();

      if (inspectionError) throw inspectionError;

      const inspectionData = {
        id: inspection.id,
        date: now.toISOString(),
        type: inspectionType,
        overall_result: overallResult || 'pass',
        notes: notes,
        signature_url: signature,
        inspector_name: userProfile?.Full_name || user?.user_metadata?.name || 'Unknown Inspector',
        inspector_id: user?.id || '',
        inspector_employee_id: userProfile?.employee_id || 'Unknown ID',
        inspector_role: userProfile?.employee_role || 'Unknown Role',
        ppe_type: ppeItem?.type || 'Unknown',
        ppe_serial: ppeItem?.serialNumber || 'Unknown',
        ppe_brand: ppeItem?.brand || 'Unknown',
        ppe_model: ppeItem?.modelNumber || 'Unknown',
        site_name: userProfile?.site_name || 'Unknown Site',
        manufacturing_date: ppeItem?.manufacturingDate || 'N/A',
        expiry_date: ppeItem?.expiryDate || 'N/A',
        checkpoints: checkpoints.map(cp => ({
          id: cp.id,
          description: cp.description,
          passed: cp.passed || false,
          notes: cp.notes || ''
        }))
      };

      console.log('User profile:', userProfile);
      console.log('Inspection data for reports:', inspectionData);

      setSubmittedInspectionData(inspectionData);
      setSubmittedInspectionId(inspection.id);
      setShowSuccessDialog(true);
      setIsSubmitting(false);

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
  
  const handlePDFDownload = async () => {
    if (submittedInspectionData) {
      await generateInspectionDetailPDF(submittedInspectionData);
    }
  };

  const handleExcelDownload = async () => {
    if (submittedInspectionData) {
      await generateInspectionExcelReport(submittedInspectionData);
    }
  };
  
  const handleWhatsAppShare = async () => {
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
    return Promise.resolve();
  };
  
  const handleEmailShare = async () => {
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
    return Promise.resolve();
  };
  
  const handleNavigateHome = async () => {
    navigate('/');
    return Promise.resolve();
  };

  const handleNewInspection = async () => {
    navigate('/inspection/start');
    return Promise.resolve();
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
        <Button onClick={handleNavigateHome}>Go Back</Button>
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
          onClick={handleNavigateHome}
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
          <div>
            <p className="text-muted-foreground">Site Name</p>
            <p>{ppeItem?.siteName}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Manufacturing Date</p>
            <p>{ppeItem?.manufacturingDate}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expiry Date</p>
            <p>{ppeItem?.expiryDate}</p>
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
                  passed={results[checkpoint.id]?.passed || null}
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
      
      {showSuccessDialog && submittedInspectionId && (
        <InspectionSuccessDialog
          isOpen={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          inspectionId={submittedInspectionId || ''}
          ppeId={ppeId || ''}
          inspectionData={submittedInspectionData || {
            id: '',
            date: '',
            type: '',
            overall_result: '',
            notes: null,
            signature_url: null,
            inspector_name: '',
            inspector_id: '',
            inspector_employee_id: '',
            inspector_role: '',
            ppe_type: '',
            ppe_serial: '',
            ppe_brand: '',
            ppe_model: '',
            site_name: '',
            manufacturing_date: '',
            expiry_date: '',
            checkpoints: []
          }}
          onPDFDownload={async () => {
            if (!submittedInspectionData) return;
            console.log('Generating PDF with data:', submittedInspectionData);
            await generateInspectionDetailPDF(submittedInspectionData);
          }}
          onExcelDownload={async () => {
            if (!submittedInspectionData) return;
            console.log('Generating Excel with data:', submittedInspectionData);
            await generateInspectionExcelReport(submittedInspectionData);
          }}
          onWhatsAppShare={() => Promise.resolve()}
          onEmailShare={() => Promise.resolve()}
        />
      )}
    </div>
  );
};

export default InspectionForm;
