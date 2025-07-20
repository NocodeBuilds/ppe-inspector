
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { PPEType } from '@/types/index';

interface PPECreateInput {
  serial_number: string;
  batch_number?: string;
  type: PPEType;
  brand: string;
  model_number: string;
  manufacturing_date: string;
  expiry_date: string;
  imageFile?: File;
}

interface PPEItem {
  id: string;
  serial_number: string;
  type: string;
  brand: string;
  model_number: string;
  manufacturing_date: string;
  expiry_date: string;
  status: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export const usePPE = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  /**
   * Create a new PPE item
   */
  const createPPE = async (data: PPECreateInput): Promise<PPEItem | null> => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'You must be logged in to create PPE items',
        variant: 'destructive',
      });
      return null;
    }

    setIsLoading(true);
    let imageUrl = null;

    try {
      // Upload image if provided
      if (data.imageFile) {
        setIsUploading(true);
        const filePath = `ppe/${user.id}/${Date.now()}-${data.imageFile.name}`;
        
        const { data: fileData, error: uploadError } = await supabase.storage
          .from('ppe_images')
          .upload(filePath, data.imageFile);

        if (uploadError) {
          throw new Error(`Error uploading image: ${uploadError.message}`);
        }

        const { data: urlData } = await supabase.storage
          .from('ppe_images')
          .getPublicUrl(filePath);

        imageUrl = urlData.publicUrl;
        setIsUploading(false);
      }

      // Insert PPE data
      const { data: ppeData, error: ppeError } = await supabase
        .from('ppe_items')
        .insert({
          serial_number: data.serial_number,
          batch_number: data.batch_number,
          type: data.type,
          brand: data.brand,
          model_number: data.model_number,
          manufacturing_date: data.manufacturing_date,
          expiry_date: data.expiry_date,
          image_url: imageUrl,
          created_by: user.id,
          status: 'active',
        })
        .select()
        .single();

      if (ppeError) {
        throw new Error(`Error creating PPE: ${ppeError.message}`);
      }

      toast({
        title: 'PPE Created',
        description: `${data.type} has been successfully created`,
      });

      return ppeData;
    } catch (error: any) {
      console.error('Error in createPPE:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create PPE item',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  /**
   * Get PPE by serial number
   */
  const getPPEBySerialNumber = async (serialNumber: string, batchNumber?: string): Promise<PPEItem[]> => {
    try {
      let query = supabase
        .from('ppe_items')
        .select('*')
        .ilike('serial_number', serialNumber);

      if (batchNumber) {
        query = query.eq('batch_number', batchNumber);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Error fetching PPE: ${error.message}`);
      }

      return data || [];
    } catch (error: any) {
      console.error('Error in getPPEBySerialNumber:', error);
      throw error;
    }
  };

  return {
    isLoading,
    isUploading,
    createPPE,
    getPPEBySerialNumber,
  };
};
