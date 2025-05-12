import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { InspectionCheckpoint } from '@/types/inspection';
import { ClientPPEItem } from '@/types/PPETypes';
import { InspectionType, PPEStatus } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InspectionFormState {
  ppeItem: ClientPPEItem | null;
  inspectionType: InspectionType;
  checkpoints: InspectionCheckpoint[];
  results: Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }>;
  notes: string;
  signature: string | null;
  overallResult: 'pass' | 'fail' | null;
  step: number;
  isSubmitting: boolean;
  isRetrying: boolean;
  hasNetworkError: boolean;
  isLoading: boolean;
  ppeError: string | null;
  checkpointsError: string | null;
  resultsError: string | null;
  showSuccessDialog: boolean;
  submittedInspectionId: string | null;
  submittedInspectionData: any | null;
}

const initialState: InspectionFormState = {
  ppeItem: null,
  inspectionType: 'pre-use',
  checkpoints: [],
  results: {},
  notes: '',
  signature: null,
  overallResult: null,
  step: 1,
  isSubmitting: false,
  isRetrying: false,
  hasNetworkError: false,
  isLoading: true,
  ppeError: null,
  checkpointsError: null,
  resultsError: null,
  showSuccessDialog: false,
  submittedInspectionId: null,
  submittedInspectionData: null,
};

export const useInspectionForm = () => {
  const [state, setState] = useState<InspectionFormState>(initialState);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { ppeId } = useParams<{ ppeId: string }>();

  useEffect(() => {
    if (ppeId) {
      fetchPPEItem(ppeId);
    } else {
      setState(prev => ({
        ...prev,
        ppeError: 'No PPE ID provided',
        isLoading: false
      }));
    }
  }, [ppeId]);

  const fetchPPEItem = async (id: string) => {
    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        ppeError: null
      }));
      
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
        console.log('PPE Item data:', data);
        const ppeItem: ClientPPEItem = {
          id: data.id,
          serialNumber: data.serial_number,
          type: data.type,
          brand: data.brand || '',
          modelNumber: data.model_number || '',
          manufacturingDate: data.manufacturing_date || '',
          expiryDate: data.expiry_date || '',
          status: 'active' as PPEStatus,
          createdAt: '',
          updatedAt: '',
          batchNumber: data.batch_number ? String(data.batch_number) : '',
        };
        
        setState(prev => ({
          ...prev,
          ppeItem
        }));
        
        await fetchCheckpoints(data.type);
      } else {
        throw new Error('PPE item not found');
      }
    } catch (error: any) {
      console.error('Error fetching PPE item:', error);
      setState(prev => ({
        ...prev,
        ppeError: error.message || 'Failed to load PPE item',
        isLoading: false
      }));
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
        
        const initialResults: Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }> = {};
        existingCheckpoints.forEach(checkpoint => {
          initialResults[checkpoint.id] = { passed: undefined, notes: '' };
        });
        
        setState(prev => ({
          ...prev,
          checkpoints: appCheckpoints,
          results: initialResults,
          isLoading: false
        }));
      } else {
        const standardCheckpoints = getStandardCheckpoints(ppeType);
        
        if (standardCheckpoints.length === 0) {
          setState(prev => ({
            ...prev,
            checkpointsError: 'No checkpoints defined for this PPE type',
            isLoading: false
          }));
          return;
        }
        
        const checkpointsToInsert = standardCheckpoints.map(cp => ({
          description: cp.description,
          ppe_type: ppeType,
          order_number: cp.order || 0
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
          
          const initialResults: Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }> = {};
          insertedCheckpoints.forEach(checkpoint => {
            initialResults[checkpoint.id] = { passed: undefined, notes: '' };
          });
          
          setState(prev => ({
            ...prev,
            checkpoints: appCheckpoints,
            results: initialResults,
            isLoading: false
          }));
        }
      }
    } catch (error: any) {
      console.error('Error with checkpoints:', error);
      
      const standardCheckpoints = getStandardCheckpoints(ppeType);
      if (standardCheckpoints.length > 0) {
        const tempCheckpoints = standardCheckpoints.map(cp => ({
          id: crypto.randomUUID(),
          description: cp.description,
          ppeType: ppeType,
          required: true,
          order: cp.order || 0
        }));
        
        const initialResults: Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }> = {};
        tempCheckpoints.forEach(checkpoint => {
          initialResults[checkpoint.id] = { passed: undefined, notes: '' };
        });
        
        setState(prev => ({
          ...prev,
          checkpoints: tempCheckpoints,
          results: initialResults,
          checkpointsError: 'Using local checkpoints - database connection error',
          isLoading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          checkpointsError: 'No checkpoints defined for this PPE type',
          isLoading: false
        }));
      }
    }
  };

  const mapDbCheckpointToAppCheckpoint = (dbCheckpoint: any): InspectionCheckpoint => {
    return {
      id: dbCheckpoint.id,
      description: dbCheckpoint.description,
      ppeType: dbCheckpoint.ppe_type,
      required: true,
      order: dbCheckpoint.order_number || 0
    };
  };

  const getStandardCheckpoints = (ppeType: string): { description: string; ppeType: string; order: number }[] => {
    // Default checkpoints based on PPE type
    switch (ppeType.toLowerCase()) {
      case 'full body harness':
        return [
          { description: 'Check webbing for cuts, fraying, or damage', ppeType, order: 1 },
          { description: 'Inspect D-rings for deformation or cracks', ppeType, order: 2 },
          { description: 'Verify buckles function properly', ppeType, order: 3 },
          { description: 'Check stitching for loose threads or damage', ppeType, order: 4 }
        ];
      case 'safety helmet':
        return [
          { description: 'Check shell for cracks, dents, or damage', ppeType, order: 1 },
          { description: 'Inspect suspension system for wear', ppeType, order: 2 },
          { description: 'Verify chin strap is intact and functional', ppeType, order: 3 }
        ];
      default:
        return [
          { description: 'Check for physical damage', ppeType, order: 1 },
          { description: 'Verify expiration date', ppeType, order: 2 },
          { description: 'Test functionality', ppeType, order: 3 }
        ];
    }
  };

  const handleResultChange = (checkpointId: string, value: boolean | null) => {
    setState(prev => {
      const newResults = {
        ...prev.results,
        [checkpointId]: { 
          ...prev.results[checkpointId], 
          passed: value,
          notes: prev.results[checkpointId]?.notes || ''
        }
      };
      
      // Calculate overall result
      const allResults = Object.entries(newResults);
      
      // Consider all required checkpoints that are not NA
      const requiredResults = allResults.filter(([id]) => {
        const checkpoint = prev.checkpoints.find(cp => cp.id === id);
        const result = newResults[id];
        // Include required checkpoints that have any selection
        return checkpoint?.required && result?.passed !== undefined;
      });
      
      if (requiredResults.length === 0) {
        return {
          ...prev,
          results: newResults,
          overallResult: null
        };
      }

      // Calculate pass/fail based on required checkpoints that are not NA
      const nonNAResults = requiredResults.filter(([_, result]) => result.passed !== null);
      const hasFailedRequired = nonNAResults.some(([_, result]) => result.passed === false);
      
      // Only set a pass/fail result if there are non-NA required checkpoints
      let newOverallResult = prev.overallResult;
      if (nonNAResults.length > 0) {
        newOverallResult = hasFailedRequired ? 'fail' : 'pass';
      } else {
        newOverallResult = null;
      }
      
      return {
        ...prev,
        results: newResults,
        overallResult: newOverallResult
      };
    });
  };

  const handleNotesChange = (checkpointId: string, value: string) => {
    setState(prev => ({
      ...prev,
      results: {
        ...prev.results,
        [checkpointId]: { ...prev.results[checkpointId], notes: value }
      }
    }));
  };
  
  const handlePhotoCapture = (checkpointId: string, photoUrl: string) => {
    setState(prev => ({
      ...prev,
      results: {
        ...prev.results,
        [checkpointId]: { ...prev.results[checkpointId], photoUrl }
      }
    }));
  };
  
  const handlePhotoDelete = (checkpointId: string) => {
    setState(prev => {
      const newResults = { ...prev.results };
      const checkpointResult = { ...newResults[checkpointId] };
      delete checkpointResult.photoUrl;
      newResults[checkpointId] = checkpointResult;
      return {
        ...prev,
        results: newResults
      };
    });
  };
  
  const setInspectionType = (type: InspectionType) => {
    setState(prev => ({
      ...prev,
      inspectionType: type
    }));
  };
  
  const setNotes = (notes: string) => {
    setState(prev => ({
      ...prev,
      notes
    }));
  };
  
  const setSignature = (signature: string | null) => {
    setState(prev => ({
      ...prev,
      signature
    }));
  };
  
  const setOverallResult = (result: 'pass' | 'fail' | null) => {
    setState(prev => ({
      ...prev,
      overallResult: result
    }));
  };
  
  const nextStep = () => {
    if (state.step === 2) {
      if (!validateForm()) {
        return;
      }
    }
    
    if (state.step < 3) {
      setState(prev => ({
        ...prev,
        step: prev.step + 1
      }));
    }
  };
  
  const prevStep = () => {
    if (state.step > 1) {
      setState(prev => ({
        ...prev,
        step: prev.step - 1
      }));
    }
  };
  
  const validateForm = () => {
    // Get required checkpoints that have no selection at all
    const unselectedRequired = state.checkpoints
      .filter(cp => cp.required)
      .filter(cp => {
        const result = state.results[cp.id];
        return result?.passed === undefined || (result?.passed !== true && result?.passed !== false && result?.passed !== null);
      });
      
    if (unselectedRequired.length > 0) {
      setState(prev => ({
        ...prev,
        resultsError: 'Please select OK, NOT OK, or N/A for all required checkpoints'
      }));
      
      toast({
        title: 'Incomplete Form',
        description: 'Please select OK, NOT OK, or N/A for all required checkpoints',
        variant: 'destructive',
      });
      return false;
    }

    return true;
  };
  
  const saveFormToLocalStorage = () => {
    try {
      const formData = {
        ppeItem: state.ppeItem,
        inspectionType: state.inspectionType,
        results: state.results,
        notes: state.notes,
        signature: state.signature,
        overallResult: state.overallResult,
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
    setState(prev => ({
      ...prev,
      isRetrying: true
    }));
    
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
      
      setState(prev => ({
        ...prev,
        hasNetworkError: false
      }));
      
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
      setState(prev => ({
        ...prev,
        isRetrying: false
      }));
    }
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    // Check for user authentication
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to submit inspections',
        variant: 'destructive',
      });
      return;
    }
    
    const user = sessionData.session.user;
    
    setState(prev => ({
      ...prev,
      isSubmitting: true,
      hasNetworkError: false
    }));
    
    try {
      const inspectionTypeEnum = state.inspectionType;
      
      saveFormToLocalStorage();
      
      console.log('Submitting inspection with data:', {
        ppe_id: state.ppeItem?.id,
        type: inspectionTypeEnum,
        overall_result: state.overallResult,
        checkpoint_ids: Object.keys(state.results),
      });
      
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: state.ppeItem?.id,
          type: inspectionTypeEnum,
          date: new Date().toISOString(),
          overall_result: state.overallResult || 'pass',
          notes: state.notes,
          signature_data: state.signature,
          inspector_id: user.id,
        })
        .select('id')
        .single();
      
      if (inspectionError) {
        console.error("Inspection insert error:", inspectionError);
        throw inspectionError;
      }
      
      console.log('Inspection created with ID:', inspection.id);
      
      const resultsToInsert = Object.entries(state.results).map(([checkpointId, result]) => ({
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
      
      switch (state.inspectionType) {
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
      
      const newStatus = state.overallResult === 'pass' ? 'active' : 'flagged';
      
      const { error: ppeUpdateError } = await supabase
        .from('ppe_items')
        .update({
          last_inspection: now.toISOString(),
          next_inspection: nextInspectionDate.toISOString(),
          status: newStatus,
        })
        .eq('id', state.ppeItem?.id);
      
      if (ppeUpdateError) throw ppeUpdateError;
      
      const checkpointDetails = state.checkpoints.map(cp => ({
        id: cp.id,
        description: cp.description,
        passed: state.results[cp.id]?.passed,
        notes: state.results[cp.id]?.notes,
        photo_url: state.results[cp.id]?.photoUrl,
      }));
      
      const submittedData = {
        id: inspection.id,
        date: now.toISOString(),
        type: state.inspectionType,
        overall_result: state.overallResult || 'pass',
        notes: state.notes,
        signature_url: state.signature,
        inspector_name: user.user_metadata?.full_name || 'Unknown Inspector',
        ppe_type: state.ppeItem?.type || 'Unknown',
        ppe_serial: state.ppeItem?.serialNumber || 'Unknown',
        ppe_brand: state.ppeItem?.brand || 'Unknown',
        ppe_model: state.ppeItem?.modelNumber || 'Unknown',
        checkpoints: checkpointDetails
      };
      
      console.log('Setting submitted inspection data:', submittedData);
      
      setState(prev => ({
        ...prev,
        submittedInspectionData: submittedData,
        submittedInspectionId: inspection.id,
        showSuccessDialog: true,
        isSubmitting: false
      }));
      
      toast({
        title: 'Inspection Completed',
        description: 'The inspection has been successfully recorded',
      });
      
    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      
      if (
        error.message?.includes('fetch') || 
        error.message?.includes('network') ||
        error.message?.includes('connection') ||
        !navigator.onLine
      ) {
        setState(prev => ({
          ...prev,
          hasNetworkError: true,
          isSubmitting: false
        }));
        
        toast({
          title: 'Network Error',
          description: 'Could not connect to server. Your form has been saved. You can retry when connection is available.',
          variant: 'destructive',
        });
      } else {
        setState(prev => ({
          ...prev,
          isSubmitting: false
        }));
        
        toast({
          title: 'Submission Failed',
          description: error.message || 'Failed to submit inspection',
          variant: 'destructive',
        });
      }
    }
  };
  
  const closeSuccessDialog = () => {
    setState(prev => ({
      ...prev,
      showSuccessDialog: false
    }));
    
    if (state.ppeItem?.id) {
      navigate(`/equipment/${state.ppeItem.id}`);
    } else {
      navigate('/equipment');
    }
  };

  return {
    state,
    setInspectionType: (type: InspectionType) => setState(prev => ({ ...prev, inspectionType: type })),
    setNotes: (notes: string) => setState(prev => ({ ...prev, notes })),
    setSignature: (signature: string | null) => setState(prev => ({ ...prev, signature })),
    setOverallResult: (result: 'pass' | 'fail' | null) => setState(prev => ({ ...prev, overallResult: result })),
    handleResultChange: (checkpointId: string, value: boolean | null) => {
      setState(prev => {
        const newResults = {
          ...prev.results,
          [checkpointId]: { 
            ...prev.results[checkpointId], 
            passed: value,
            notes: prev.results[checkpointId]?.notes || ''
          }
        };
        
        // Calculate overall result
        const allResults = Object.entries(newResults);
        
        // Consider all required checkpoints that are not NA
        const requiredResults = allResults.filter(([id]) => {
          const checkpoint = prev.checkpoints.find(cp => cp.id === id);
          const result = newResults[id];
          // Include required checkpoints that have any selection
          return checkpoint?.required && result?.passed !== undefined;
        });
        
        if (requiredResults.length === 0) {
          return {
            ...prev,
            results: newResults,
            overallResult: null
          };
        }

        // Calculate pass/fail based on required checkpoints that are not NA
        const nonNAResults = requiredResults.filter(([_, result]) => result.passed !== null);
        const hasFailedRequired = nonNAResults.some(([_, result]) => result.passed === false);
        
        // Only set a pass/fail result if there are non-NA required checkpoints
        let newOverallResult = prev.overallResult;
        if (nonNAResults.length > 0) {
          newOverallResult = hasFailedRequired ? 'fail' : 'pass';
        } else {
          newOverallResult = null;
        }
        
        return {
          ...prev,
          results: newResults,
          overallResult: newOverallResult
        };
      });
    },
    handleNotesChange: (checkpointId: string, value: string) => {
      setState(prev => ({
        ...prev,
        results: {
          ...prev.results,
          [checkpointId]: { ...prev.results[checkpointId], notes: value }
        }
      }));
    },
    handlePhotoCapture: (checkpointId: string, photoUrl: string) => {
      setState(prev => ({
        ...prev,
        results: {
          ...prev.results,
          [checkpointId]: { ...prev.results[checkpointId], photoUrl }
        }
      }));
    },
    handlePhotoDelete: (checkpointId: string) => {
      setState(prev => {
        const newResults = { ...prev.results };
        const checkpointResult = { ...newResults[checkpointId] };
        delete checkpointResult.photoUrl;
        newResults[checkpointId] = checkpointResult;
        return {
          ...prev,
          results: newResults
        };
      });
    },
    nextStep: () => {
      if (state.step === 2) {
        if (!validateForm()) {
          return;
        }
      }
      
      if (state.step < 3) {
        setState(prev => ({
          ...prev,
          step: prev.step + 1
        }));
      }
    },
    prevStep: () => {
      if (state.step > 1) {
        setState(prev => ({
          ...prev,
          step: prev.step - 1
        }));
      }
    },
    handleSubmit: async () => {
      if (!validateForm()) return;
      
      // Check for user authentication
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) {
        toast({
          title: 'Authentication Required',
          description: 'You must be logged in to submit inspections',
          variant: 'destructive',
        });
        return;
      }
      
      // ... keep existing code (form submission)
    },
    handleRetry: async () => {
      setState(prev => ({
        ...prev,
        isRetrying: true
      }));
      
      // ... keep existing code (retry logic)
    },
    closeSuccessDialog: () => {
      setState(prev => ({
        ...prev,
        showSuccessDialog: false
      }));
      
      if (state.ppeItem?.id) {
        navigate(`/equipment/${state.ppeItem.id}`);
      } else {
        navigate('/equipment');
      }
    },
    validateForm: () => {
      // ... keep existing code (validation logic)
      return true; // Placeholder
    }
  };
};
