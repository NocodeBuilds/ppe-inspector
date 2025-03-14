
import { useState, useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem, PPEStatus } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';

export function usePPEData() {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  const [isUploading, setIsUploading] = useState(false);

  // Query to fetch all PPE items
  const {
    data: ppeItems,
    isLoading: isLoadingPPE,
    refetch: refetchPPE,
    isError: ppeError
  } = useSupabaseQuery<PPEItem[]>(
    ['ppe-items'],
    async () => {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PPEItem[];
    }
  );

  // Function to get PPE by serial number
  const getPPEBySerialNumber = useCallback(async (serialNumber: string) => {
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('serial_number', serialNumber);
      
      if (error) throw error;
      
      return data as PPEItem[];
    } catch (error: any) {
      console.error('Error fetching PPE by serial number:', error);
      showNotification('Error', 'error', {
        description: `Failed to fetch PPE data: ${error.message}`
      });
      return [];
    }
  }, [showNotification]);

  // Function to get PPE by ID
  const getPPEById = useCallback(async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as PPEItem;
    } catch (error: any) {
      console.error('Error fetching PPE by ID:', error);
      showNotification('Error', 'error', {
        description: `Failed to fetch PPE data: ${error.message}`
      });
      return null;
    }
  }, [showNotification]);

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

  // Function to upload PPE image
  const uploadPPEImage = async (file: File, ppeId: string): Promise<string | null> => {
    if (!file || !ppeId) return null;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${ppeId}-${Date.now()}.${fileExt}`;
      const filePath = `ppe-images/${fileName}`;
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from('ppe-images')
        .upload(filePath, file);
      
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
      
      // First, create the PPE item
      const { data, error } = await supabase
        .from('ppe_items')
        .insert({
          ...ppeItem,
          created_by: user?.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          status: ppeItem.status || 'active'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Then, if there's an image file, upload it and update the PPE item
      if (imageFile && data.id) {
        const imageUrl = await uploadPPEImage(imageFile, data.id);
        
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
    ppeItems,
    isLoadingPPE,
    ppeError,
    refetchPPE,
    getPPEBySerialNumber,
    getPPEById,
    updatePPEStatus: updatePPEStatusMutation.mutate,
    createPPE: createPPEMutation.mutate,
    uploadPPEImage,
    isUploading
  };
}
