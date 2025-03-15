
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

// Define the form schema
const inspectionFormSchema = z.object({
  type: z.enum(['pre-use', 'monthly', 'quarterly']),
  notes: z.string().optional(),
  signatureUrl: z.string().optional(),
  overallResult: z.enum(['pass', 'fail', 'maintenance-required']),
  checkpointResults: z.array(z.object({
    checkpointId: z.string(),
    passed: z.boolean(),
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

  // Initialize form
  const form = useForm<InspectionFormValues>({
    resolver: zodResolver(inspectionFormSchema),
    defaultValues: {
      type: 'pre-use',
      notes: '',
      overallResult: 'pass',
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
        // Fetch PPE item
        const ppe = await getPPEById(ppeId);
        if (!ppe) {
          throw new Error('PPE not found');
        }
        
        setPpeItem(ppe);

        // Fetch checkpoints for this PPE type
        const { data: checkpointData, error: checkpointError } = await supabase
          .from('inspection_checkpoints')
          .select('*')
          .eq('ppe_type', ppe.type);

        if (checkpointError) throw checkpointError;
        
        setCheckpoints(checkpointData || []);

        // Initialize checkpointResults in the form
        form.setValue('checkpointResults', (checkpointData || []).map(checkpoint => ({
          checkpointId: checkpoint.id,
          passed: true,
          notes: '',
          photoUrl: '',
        })));

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

  // Handle form submission
  const onSubmit = async (data: InspectionFormValues) => {
    if (!user || !ppeItem) return;
    
    setIsSubmitting(true);
    try {
      console.log('Submitting inspection form data:', data);

      // Create inspection
      const { data: inspection, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppeId,
          inspector_id: user.id,
          type: data.type as InspectionType,
          date: new Date().toISOString(),
          overall_result: data.overallResult,
          signature_url: data.signatureUrl,
          notes: data.notes
        })
        .select()
        .single();

      if (inspectionError) throw inspectionError;

      // Create inspection results
      const resultsToInsert = data.checkpointResults.map(result => ({
        inspection_id: inspection.id,
        checkpoint_id: result.checkpointId,
        passed: result.passed,
        notes: result.notes || null,
        photo_url: result.photoUrl || null
      }));

      const { error: resultsError } = await supabase
        .from('inspection_results')
        .insert(resultsToInsert);

      if (resultsError) throw resultsError;

      // Update PPE last inspection and next inspection dates
      const now = new Date();
      let nextInspectionDate: Date;
      
      // Calculate next inspection date based on type
      switch (data.type) {
        case 'pre-use':
          // Next pre-use inspection is tomorrow
          nextInspectionDate = new Date(now);
          nextInspectionDate.setDate(nextInspectionDate.getDate() + 1);
          break;
        case 'monthly':
          // Next monthly inspection is in 1 month
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 1);
          break;
        case 'quarterly':
          // Next quarterly inspection is in 3 months
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 3);
          break;
        default:
          nextInspectionDate = new Date(now);
          nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 1);
      }

      // Update the PPE status if the overall result is fail
      if (data.overallResult === 'fail') {
        updatePPEStatus({ id: ppeId, status: 'flagged' });
      } else if (data.overallResult === 'maintenance-required') {
        updatePPEStatus({ id: ppeId, status: 'maintenance' });
      }

      const { error: ppeUpdateError } = await supabase
        .from('ppe_items')
        .update({
          last_inspection: now.toISOString(),
          next_inspection: nextInspectionDate.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('id', ppeId);

      if (ppeUpdateError) throw ppeUpdateError;

      // Show success message
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

  // Reset form
  const resetForm = () => {
    form.reset();
    setShowSuccess(false);
  };

  return {
    form,
    ppeItem,
    checkpoints,
    isLoading,
    isSubmitting,
    showSuccess,
    onSubmit: form.handleSubmit(onSubmit),
    resetForm,
    setShowSuccess
  };
};
