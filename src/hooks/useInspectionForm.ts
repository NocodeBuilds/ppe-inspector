
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { PPEItem, InspectionType } from '@/integrations/supabase/client';
import { usePPEData } from '@/hooks/usePPEData';
import { calculateOverallResult } from '@/utils/inspectionUtils';

// Define the form schema
const inspectionFormSchema = z.object({
  type: z.enum(['pre-use', 'monthly', 'quarterly']),
  notes: z.string().optional(),
  signatureUrl: z.string().optional(),
  overallResult: z.enum(['pass', 'fail', 'maintenance-required']).nullable(),
  checkpointResults: z.array(z.object({
    checkpointId: z.string(),
    passed: z.boolean().nullable(),
    notes: z.string().optional(),
    photoUrl: z.string().optional(),
  }))
});

export type InspectionFormValues = z.infer<typeof inspectionFormSchema>;

export const useInspectionForm = () => {
  const { ppeId } = useParams<{ ppeId: string }>();
  const [ppeItem, setPpeItem] = useState<PPEItem | null>(null);
  const [checkpoints, setCheckpoints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotifications();
  const { getPPEById, updatePPEStatus } = usePPEData();

  // Initialize form with proper handling for null values
  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      type: 'pre-use',
      notes: '',
      overallResult: null,
      checkpointResults: []
    }
  });

  // Load PPE data and checkpoints
  useEffect(() => {
    const loadData = async () => {
      if (!ppeId) {
        showNotification('Error', 'error', {
          description: 'No PPE ID provided'
        });
        navigate('/start-inspection');
        return;
      }
      setIsLoading(true);
      try {
        const ppe = await getPPEById(ppeId);
        if (!ppe) {
          throw new Error('PPE not found');
        }
        
        setPpeItem(ppe);

        const { data: checkpointData, error: checkpointError } = await supabase
          .from('inspection_checkpoints')
          .select('*')
          .eq('ppe_type', ppe.type);

        if (checkpointError) throw checkpointError;
        
        setCheckpoints(checkpointData || []);

        if (ppe) {
          // Initialize each checkpoint with explicit null value for passed
          form.setValue('checkpointResults', (checkpointData || []).map(checkpoint => ({
            checkpointId: checkpoint.id,
            passed: null,
            notes: '',
            photoUrl: '',
          })));
        }

      } catch (error: any) {
        console.error('Error loading inspection data:', error);
        showNotification('Error', 'error', {
          description: `Failed to load inspection data: ${error.message}`
        });
        navigate('/start-inspection');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [ppeId, form, navigate, showNotification, getPPEById]);

  // Handle form submission with improved null handling
  const onSubmit = async (data: InspectionFormValues) => {
    if (!user || !ppeItem) return;
    
    setIsSubmitting(true);
    try {
      console.log('Submitting inspection form data:', data);

      // Calculate overall result using the utility function
      const resultsMap: Record<string, { passed: boolean | null | undefined; notes: string; photoUrl?: string }> = {};
      data.checkpointResults.forEach(result => {
        resultsMap[result.checkpointId] = {
          passed: result.passed,
          notes: result.notes || '',
          photoUrl: result.photoUrl
        };
      });
      
      // Use the utility function to calculate the overall result
      const calculatedResult = calculateOverallResult(resultsMap, checkpoints);
      
      // Override with the form value if provided, otherwise use calculated value
      const finalResult = data.overallResult || calculatedResult;
      console.log('Final overall result:', finalResult);

      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppeId,
          inspector_id: user.id,
          type: data.type as InspectionType,
          date: new Date().toISOString(),
          overall_result: finalResult,
          signature_url: data.signatureUrl,
          notes: data.notes
        })
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      const resultsToInsert = data.checkpointResults.map(result => ({
        inspection_id: inspection.id,
        checkpoint_id: result.checkpointId,
        passed: result.passed, // This now properly handles null values
        notes: result.notes || null,
        photo_url: result.photoUrl || null
      }));

      const { error: resultsError } = await supabase
        .from('inspection_results')
        .insert(resultsToInsert);

      if (resultsError) throw resultsError;

      const now = new Date();
      let nextInspectionDate: Date;
      
      switch (data.type) {
        case 'pre-use':
          nextInspectionDate = new Date(now);
          nextInspectionDate.setDate(nextInspectionDate.getDate() + 1);
          break;
        case 'monthly':
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 1);
          break;
        case 'quarterly':
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 3);
          break;
        default:
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 1);
      }

      // Update PPE status based on the final result
      if (finalResult === 'fail') {
        updatePPEStatus({ id: ppeId, status: 'flagged' });
      } else if (data.overallResult === 'maintenance-required') {
        updatePPEStatus({ id: ppeId, status: 'maintenance' });
      } else if (finalResult === 'pass') {
        updatePPEStatus({ id: ppeId, status: 'active' });
      }

      await supabase
        .from('ppe_items')
        .update({
          last_inspection: now.toISOString(),
          next_inspection: nextInspectionDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', ppeId);

      showNotification('Success', 'success', {
        description: 'Inspection completed successfully'
      });
      
      setShowSuccess(true);

    } catch (error: any) {
      console.error('Error submitting inspection:', error);
      showNotification('Error', 'error', {
        description: `Failed to submit inspection: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    ppeItem,
    checkpoints,
    isLoading,
    isSubmitting,
    showSuccess,
    onSubmit: form.handleSubmit(onSubmit)
  };
};
