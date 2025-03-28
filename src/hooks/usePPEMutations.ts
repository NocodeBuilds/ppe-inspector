
import { useState, useCallback } from 'react';
import { useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem, PPEStatus } from '@/integrations/supabase/client';
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
  const updatePPEStatusMutation = useSupabaseMutation<{ id: string }, { id: string, status: PPEStatus }>(
    async ({ id, status }) => {
      const { data, error } = await supabase
        .from('ppe_items')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
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

  // Mutation to create a new PPE item
  const createPPEMutation = useSupabaseMutation<PPEItem, Partial<PPEItem> & { imageFile?: File }>(
    async (ppeData) => {
      const { imageFile, ...ppeItem } = ppeData;
      
      // Make sure all required fields are provided
      if (!ppeItem.brand || !ppeItem.type || !ppeItem.serial_number || 
          !ppeItem.model_number || !ppeItem.manufacturing_date || !ppeItem.expiry_date) {
        throw new Error('Missing required PPE fields');
      }
      
      if (!user?.id) {
        throw new Error('User must be logged in to create PPE items');
      }
      
      // Check if expiry date is valid
      const expiryDate = new Date(ppeItem.expiry_date);
      const currentDate = new Date();
      
      // Calculate status based on expiry date
      const status: PPEStatus = expiryDate < currentDate ? 'expired' : 'active';
      
      // Calculate next inspection date (3 months from today)
      const nextInspection = new Date();
      nextInspection.setMonth(nextInspection.getMonth() + 3);
      
      // First, create the PPE item with all required fields
      const { data, error } = await supabase
        .from('ppe_items')
        .insert({
          brand: ppeItem.brand,
          type: ppeItem.type,
          serial_number: ppeItem.serial_number,
          model_number: ppeItem.model_number,
          manufacturing_date: ppeItem.manufacturing_date,
          expiry_date: ppeItem.expiry_date,
          created_by: user.id,
          status: status,
          next_inspection: nextInspection.toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Then, if there's an image file, upload it and update the PPE item
      if (imageFile && data.id) {
        const imageUrl = await compressAndUploadImage(imageFile, data.id);
        
        if (imageUrl) {
          const { data: updatedData, error: updateError } = await supabase
            .from('ppe_items')
            .update({ image_url: imageUrl })
            .eq('id', data.id)
            .select()
            .single();
          
          if (updateError) throw updateError;
          return updatedData;
        }
      }
      
      return data;
    },
    {
      onSuccess: () => {
        showNotification('Success', 'success', {
          description: 'PPE item created successfully'
        });
        refetchPPE();
      },
      onError: (error: any) => {
        showNotification('Error', 'error', {
          description: `Failed to create PPE item: ${error.message}`
        });
      },
      invalidateQueries: [['ppe-items']]
    }
  );

  return {
    updatePPEStatus: updatePPEStatusMutation.mutate,
    createPPE: createPPEMutation.mutate,
    uploadPPEImage: compressAndUploadImage,
    isUploading
  };
}
