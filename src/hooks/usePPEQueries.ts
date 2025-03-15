
import { useCallback } from 'react';
import { useSupabaseQuery } from '@/hooks/useSupabaseQuery';
import { supabase } from '@/integrations/supabase/client';
import { PPEItem } from '@/integrations/supabase/client';
import { useNotifications } from '@/hooks/useNotifications';

/**
 * Hook providing query functionality for PPE data
 * Separated from mutations for better code organization
 */
export function usePPEQueries() {
  const { showNotification } = useNotifications();

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

  return {
    ppeItems,
    isLoadingPPE,
    ppeError,
    refetchPPE,
    getPPEBySerialNumber,
    getPPEById,
  };
}
