
import { useState, useCallback } from 'react';
import { useSupabaseMutation } from '@/hooks/useSupabaseMutation';
import { supabase, PPEItem, PPEStatus } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook providing mutation functionality for PPE data
 * Separated from queries for better code organization
 */
export function usePPEMutations(refetchPPE: () => void) {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [isUploading, setIsUploading] = useState(false);

  // Mutation to update PPE status
  const updatePPEStatusMutation = useSupabaseMutation<PPEItem, { id: string, status: PPEStatus }>(
    async ({ id, status }) => {
      const { data, error } = await supabase
        .from('ppe_items')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as PPEItem;
    },
    {
      onSuccess: () => {
        showNotification('Success', 'success', {
          description: 'PPE status updated successfully'
        });
        refetchPPE();
      },
      onError: (error: any) => {
        showNotification('Error', 'error', {
          description: `Failed to update PPE status: ${error.message}`
        });
      },
      invalidateQueries: [['ppe-items']]
    }
  );

  // Function to compress and resize image before upload
  const compressAndUploadImage = async (file: File, ppeId: string): Promise<string | null> => {
    if (!file || !ppeId) return null;
    
    setIsUploading(true);
    try {
      // Create a filename with PPE ID and timestamp
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${ppeId}-${Date.now()}.${fileExt}`;
      const filePath = `ppe-images/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('ppe-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('ppe-images')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      showNotification('Error', 'error', {
        description: `Failed to upload image: ${error.message}`
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  return {
    updatePPEStatusMutation,
    compressAndUploadImage,
    isUploading
  };
}
