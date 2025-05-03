import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { InspectionCheckpoint, InspectionDetails, PPEItem } from '@/types/ppe';
import { useToast } from '@/hooks/use-toast';
import { useNotifications } from '@/hooks/useNotifications';

interface UseInspectionFormProps {
  ppeId: string | undefined;
  onSuccess?: () => void;
  onError?: (message: string) => void;
}

export const useInspectionForm = ({ ppeId, onSuccess, onError }: UseInspectionFormProps = {}) => {
  const [inspectionType, setInspectionType] = useState<string>('pre-use');
  const [overallResult, setOverallResult] = useState<string>('pass');
  const [notes, setNotes] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [checkpoints, setCheckpoints] = useState<InspectionCheckpoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ppeItem, setPpeItem] = useState<PPEItem | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const [inspectorName, setInspectorName] = useState<string>('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { showToastNotification } = useNotifications();

  // Fetch checkpoints based on PPE type
  const fetchCheckpoints = useCallback(async (ppeType: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('inspection_checkpoints')
        .select('*')
        .eq('ppe_type', ppeType);

      if (error) {
        console.error('Error fetching checkpoints:', error);
        showToastNotification('Error', 'error', {
          description: `Failed to fetch checkpoints: ${error.message}`
        });
        if (onError) onError(error.message);
        return;
      }

      // Initialize the checkpoints with a 'passed' status
      const initialCheckpoints = data.map(checkpoint => ({
        ...checkpoint,
        passed: null,
        notes: '',
        photo_url: null
      }));
      setCheckpoints(initialCheckpoints);
    } catch (error: any) {
      console.error('Unexpected error fetching checkpoints:', error);
      showToastNotification('Error', 'error', {
        description: `Unexpected error fetching checkpoints: ${error.message}`
      });
      if (onError) onError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [onError, showToastNotification]);

  // Fetch PPE item details
  const fetchPPEItem = useCallback(async (ppeId: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('id', ppeId)
        .single();

      if (error) {
        console.error('Error fetching PPE item:', error);
        showToastNotification('Error', 'error', {
          description: `Failed to fetch PPE item: ${error.message}`
        });
        if (onError) onError(error.message);
        return;
      }

      setPpeItem(data);
      fetchCheckpoints(data.type);
    } catch (error: any) {
      console.error('Unexpected error fetching PPE item:', error);
      showToastNotification('Error', 'error', {
        description: `Unexpected error fetching PPE item: ${error.message}`
      });
      if (onError) onError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [fetchCheckpoints, onError, showToastNotification]);

  // Handle checkpoint updates
  const updateCheckpoint = useCallback((id: string, field: string, value: any) => {
    setCheckpoints(prevCheckpoints =>
      prevCheckpoints.map(checkpoint =>
        checkpoint.id === id ? { ...checkpoint, [field]: value } : checkpoint
      )
    );
  }, []);

  // Handle signature clear
  const clearSignature = () => {
    setSignatureData(null);
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!user?.id || !ppeId || !ppeItem) {
      showToastNotification('Error', 'error', {
        description: 'User not authenticated or PPE item not loaded.'
      });
      if (onError) onError('User not authenticated or PPE item not loaded.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Validate that all required checkpoints have been filled
      const requiredCheckpoints = checkpoints.filter(checkpoint => checkpoint.required);
      const incompleteCheckpoints = requiredCheckpoints.filter(checkpoint => checkpoint.passed === null);

      if (incompleteCheckpoints.length > 0) {
        showToastNotification('Error', 'error', {
          description: 'Please complete all required checkpoints.'
        });
        if (onError) onError('Please complete all required checkpoints.');
        return;
      }

      // Upload the photo to Supabase storage
      let photoUrl = null;
      if (photo) {
        const filePath = `inspection-photos/${ppeId}-${Date.now()}.png`;
        const fileContent = photo.split(',')[1];
        const file = new Buffer(fileContent, 'base64');

        const { error: uploadError } = await supabase.storage
          .from('inspection-photos')
          .upload(filePath, file, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading photo:', uploadError);
          showToastNotification('Error', 'error', {
            description: `Failed to upload photo: ${uploadError.message}`
          });
          if (onError) onError(`Failed to upload photo: ${uploadError.message}`);
          return;
        }

        photoUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/inspection-photos/${filePath}`;
      }

      // Upload the signature to Supabase storage
      let signatureUrl = null;
      if (signatureData) {
        const filePath = `signatures/${ppeId}-${Date.now()}.png`;
        const fileContent = signatureData.split(',')[1];
        const file = new Buffer(fileContent, 'base64');

        const { error: uploadError } = await supabase.storage
          .from('signatures')
          .upload(filePath, file, {
            contentType: 'image/png',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading signature:', uploadError);
          showToastNotification('Error', 'error', {
            description: `Failed to upload signature: ${uploadError.message}`
          });
          if (onError) onError(`Failed to upload signature: ${uploadError.message}`);
          return;
        }

        signatureUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/signatures/${filePath}`;
      }

      // Insert the inspection data into the database
      const { data: inspectionData, error: inspectionError } = await supabase
        .from('inspections')
        .insert({
          ppe_id: ppeId,
          inspector_id: user.id,
          date: new Date().toISOString(),
          type: inspectionType,
          overall_result: overallResult,
          notes: notes,
          signature_url: signatureUrl,
          images: photoUrl ? [photoUrl] : [],
        })
        .select()
        .single();

      if (inspectionError) {
        console.error('Error inserting inspection:', inspectionError);
        showToastNotification('Error', 'error', {
          description: `Failed to create inspection: ${inspectionError.message}`
        });
        if (onError) onError(`Failed to create inspection: ${inspectionError.message}`);
        return;
      }

      // Insert the inspection results into the database
      const inspectionResults = checkpoints.map(checkpoint => ({
        inspection_id: inspectionData.id,
        checkpoint_id: checkpoint.id,
        passed: checkpoint.passed,
        notes: checkpoint.notes,
        photo_url: checkpoint.photo_url
      }));

      const { error: resultsError } = await supabase
        .from('inspection_results')
        .insert(inspectionResults);

      if (resultsError) {
        console.error('Error inserting inspection results:', resultsError);
        showToastNotification('Error', 'error', {
          description: `Failed to save inspection results: ${resultsError.message}`
        });
        if (onError) onError(`Failed to save inspection results: ${resultsError.message}`);
        return;
      }

      // Update the PPE item's next inspection date
      const nextInspectionDate = new Date();
      nextInspectionDate.setMonth(nextInspectionDate.getMonth() + 3);

      const { error: updateError } = await supabase
        .from('ppe_items')
        .update({
          next_inspection: nextInspectionDate.toISOString(),
          status: overallResult === 'pass' ? 'inspected' : 'flagged'
        })
        .eq('id', ppeId);

      if (updateError) {
        console.error('Error updating PPE item:', updateError);
        showToastNotification('Error', 'error', {
          description: `Failed to update PPE item: ${updateError.message}`
        });
        if (onError) onError(`Failed to update PPE item: ${updateError.message}`);
        return;
      }

      showToastNotification('Success', 'success', {
        description: 'Inspection submitted successfully!'
      });
      if (onSuccess) onSuccess();
      navigate('/upcoming');
    } catch (error: any) {
      console.error('Unexpected error during submission:', error);
      showToastNotification('Error', 'error', {
        description: `Unexpected error during submission: ${error.message}`
      });
      if (onError) onError(`Unexpected error during submission: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    inspectionType,
    setInspectionType,
    overallResult,
    setOverallResult,
    notes,
    setNotes,
    signatureData,
    setSignatureData,
    checkpoints,
    setCheckpoints,
    isLoading,
    isSubmitting,
    ppeItem,
    photo,
    setPhoto,
    inspectorName,
    setInspectorName,
    fetchCheckpoints,
    fetchPPEItem,
    updateCheckpoint,
    clearSignature,
    handleSubmit
  };
};
