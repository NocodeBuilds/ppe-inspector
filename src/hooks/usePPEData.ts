
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem, PPEStatus } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

export function usePPEData() {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const createPPE = async ({
    brand,
    type,
    serial_number,
    model_number,
    manufacturing_date,
    expiry_date,
    batch_number,
    first_use,
    imageFile,
  }: {
    brand: string;
    type: string;
    serial_number: string;
    model_number: string;
    manufacturing_date: string;
    expiry_date: string;
    batch_number?: number;
    first_use?: string;
    imageFile?: File;
  }) => {
    setIsUploading(true);
    try {
      let imageUrl = null;
      if (imageFile) {
        const imagePath = `ppe-images/${serial_number}-${Date.now()}`;
        const { data: uploadData, error: storageError } = await supabase.storage
          .from('ppe-images')
          .upload(imagePath, imageFile, {
            cacheControl: '3600',
            upsert: false,
          });

        if (storageError) {
          console.error('Error uploading image:', storageError);
          throw new Error(`Failed to upload image: ${storageError.message}`);
        }

        const { data: publicUrlData } = supabase.storage
          .from('ppe-images')
          .getPublicUrl(imagePath);
          
        imageUrl = publicUrlData.publicUrl;
      }

      // Calculate status based on expiry date
      const expiryDate = new Date(expiry_date);
      const currentDate = new Date();
      const status: PPEStatus = expiryDate < currentDate ? 'expired' : 'active';

      const { data, error } = await supabase
        .from('ppe_items')
        .insert([
          {
            brand,
            type,
            serial_number,
            model_number,
            manufacturing_date,
            expiry_date,
            image_url: imageUrl,
            batch_number: batch_number?.toString(),
            first_use,
            status,
            created_by: user?.id,
          },
        ])
        .select();

      if (error) {
        console.error('Error creating PPE:', error);
        throw new Error(error.message || 'Failed to create PPE item');
      }

      toast({
        title: 'Success',
        description: 'PPE item added successfully',
      });

      return data;
    } catch (error: any) {
      console.error('Error adding PPE:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add PPE item',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const updatePPEStatus = async ({ id, status }: { id: string; status: PPEStatus }) => {
    try {
      const { data, error } = await supabase
        .from('ppe_items')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) {
        console.error('Error updating PPE status:', error);
        throw new Error('Failed to update PPE status');
      }

      toast({
        title: 'Success',
        description: 'PPE status updated successfully',
      });

      return data;
    } catch (error: any) {
      console.error('Error updating PPE status:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to update PPE status',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const getPPEBySerialNumber = async (serialNumber: string): Promise<PPEItem[]> => {
    try {
      const normalizedSerial = serialNumber.trim();
      
      if (!normalizedSerial) {
        throw new Error('Serial number cannot be empty');
      }

      const { data: exactMatch, error: exactError } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('serial_number', normalizedSerial);

      if (exactError) throw exactError;
      
      if (exactMatch && exactMatch.length > 0) {
        return exactMatch;
      }

      const { data: fuzzyMatch, error: fuzzyError } = await supabase
        .from('ppe_items')
        .select('*')
        .ilike('serial_number', `%${normalizedSerial}%`);

      if (fuzzyError) throw fuzzyError;
      
      return fuzzyMatch || [];
    } catch (error) {
      console.error('Error getting PPE by serial number:', error);
      throw error;
    }
  };

  const getPPEById = async (id: string): Promise<PPEItem | null> => {
    try {
      let isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

      let data;
      let error;

      if (isUUID) {
        const result = await supabase
          .from('ppe_items')
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        data = result.data;
        error = result.error;
      } else {
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
    } catch (error) {
      console.error('Error getting PPE by ID:', error);
      throw error;
    }
  };

  return {
    createPPE,
    updatePPEStatus,
    isUploading,
    getPPEBySerialNumber,
    getPPEById,
  };
}
