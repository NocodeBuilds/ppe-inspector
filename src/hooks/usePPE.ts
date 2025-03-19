
import { useState, useCallback } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem, PPEStatus } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export type CreatePPEParams = {
  brand: string;
  type: string;
  serial_number: string;
  model_number: string;
  manufacturing_date: string;
  expiry_date: string;
  imageFile?: File;
};

/**
 * Unified hook for PPE data operations
 * Combines functionality from usePPEQueries, usePPEMutations, and usePPEData
 */
export function usePPE() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  // QUERY FUNCTIONS
  
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

  // Get PPE by serial number - optimized to handle partial matches
  const getPPEBySerialNumber = useCallback(async (serialNumber: string): Promise<PPEItem[]> => {
    try {
      console.log(`Searching for PPE with serial number pattern: ${serialNumber}`);
      
      // Normalize the serial number by trimming whitespace
      const normalizedSerial = serialNumber.trim();
      
      // First try exact match
      const { data: exactMatch, error: exactError } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('serial_number', normalizedSerial)
        .maybeSingle();
      
      if (exactError) {
        console.error('Database error when searching by exact serial number:', exactError);
      } else if (exactMatch) {
        console.log('Found exact match for serial number:', exactMatch);
        return [exactMatch] as PPEItem[];
      }
      
      // If exact match didn't yield results, try pattern matching
      console.log('No exact match found, trying pattern match');
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .ilike('serial_number', `%${normalizedSerial}%`);
      
      if (error) {
        console.error('Database error when searching by serial number pattern:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} PPE items matching serial number pattern`);
      return data as PPEItem[];
    } catch (error: any) {
      console.error('Error fetching PPE by serial number:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch PPE data: ${error.message}`,
        variant: 'destructive',
      });
      return [];
    }
  }, [toast]);

  // Get PPE by ID - improved to handle both UUIDs and serial numbers
  const getPPEById = useCallback(async (id: string): Promise<PPEItem | null> => {
    try {
      // First check if the ID is a valid UUID
      let isUUID = true;
      try {
        // Simple UUID validation check
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          isUUID = false;
        }
      } catch {
        isUUID = false;
      }

      let data;
      let error;

      if (isUUID) {
        // If it's a UUID, search by ID
        const result = await supabase
          .from('ppe_items')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        data = result.data;
        error = result.error;
      } else {
        // If it's not a UUID, search by serial number
        const result = await supabase
          .from('ppe_items')
          .select('*')
          .eq('serial_number', id)
          .maybeSingle();
          
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error getting PPE by ID:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch PPE data: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  // MUTATION FUNCTIONS

  // Upload and compress image
  const uploadPPEImage = async (file: File, ppeId: string): Promise<string | null> => {
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
      toast({
        title: 'Error',
        description: `Failed to upload image: ${error.message}`,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

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
        toast({
          title: 'Success',
          description: 'PPE status updated successfully'
        });
        refetchPPE();
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: `Failed to update PPE status: ${error.message}`,
          variant: 'destructive',
        });
      },
      invalidateQueries: [['ppe-items']]
    }
  );

  // Mutation to create a new PPE item
  const createPPEMutation = useSupabaseMutation<PPEItem, CreatePPEParams & { imageFile?: File }>(
    async (ppeData) => {
      const { imageFile, ...ppeItem } = ppeData;
      
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
        toast({
          title: 'Success',
          description: 'PPE item created successfully'
        });
        refetchPPE();
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: `Failed to create PPE item: ${error.message}`,
          variant: 'destructive',
        });
      },
      invalidateQueries: [['ppe-items']]
    }
  );

  // Direct create PPE function (compatible with older usePPEData interface)
  const createPPE = async (params: CreatePPEParams) => {
    try {
      const result = await createPPEMutation.mutateAsync(params);
      return result;
    } catch (error) {
      // Error is already handled in mutation
      throw error;
    }
  };

  // Direct update PPE status function (compatible with older interface)
  const updatePPEStatus = async ({ id, status }: { id: string; status: PPEStatus }) => {
    try {
      const result = await updatePPEStatusMutation.mutateAsync({ id, status });
      return result;
    } catch (error) {
      // Error is already handled in mutation
      throw error;
    }
  };
  
  return {
    // Query results
    ppeItems,
    isLoadingPPE,
    ppeError,
    refetchPPE,
    
    // Query functions
    getPPEBySerialNumber,
    getPPEById,
    
    // Mutation functions
    createPPE,
    updatePPEStatus,
    uploadPPEImage,
    
    // State
    isUploading
  };
}
