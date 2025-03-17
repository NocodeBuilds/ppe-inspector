
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
      console.log(`Searching for PPE with serial number pattern: ${serialNumber}`);
      
      // Search by similar serial number - using ilike for pattern matching
      const { data, error } = await supabase
        .from('ppe_items')
        .select('*')
        .ilike('serial_number', `%${serialNumber}%`);
      
      if (error) {
        console.error('Database error when searching by serial number:', error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} PPE items matching serial number pattern`);
      return data as PPEItem[];
    } catch (error: any) {
      console.error('Error fetching PPE by serial number:', error);
      showNotification('Error', 'error', {
        description: `Failed to fetch PPE data: ${error.message}`
      });
      return [];
    }
  }, [showNotification]);

  // Function to get PPE by ID - with better error handling for different ID formats
  const getPPEById = useCallback(async (id: string) => {
    try {
      console.log(`Trying to fetch PPE with ID/serial: ${id}`);
      let result = null;
      
      // First try getting by ID if it looks like a UUID
      if (id.includes('-') && id.length > 30) {
        console.log('Treating as UUID and searching by id');
        const { data, error } = await supabase
          .from('ppe_items')
          .select('*')
          .eq('id', id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching by ID:', error);
        } else if (data) {
          result = data;
        }
      }
      
      // If not found by ID, try getting by serial number
      if (!result) {
        console.log('Searching by serial number as fallback');
        const { data, error } = await supabase
          .from('ppe_items')
          .select('*')
          .eq('serial_number', id)
          .maybeSingle();
        
        if (error) {
          console.error('Error fetching by serial number:', error);
          // Don't throw here, we'll throw a combined error below if needed
        } else if (data) {
          result = data;
        }
      }
      
      if (!result) {
        console.log('No PPE found with given ID or serial number');
        throw new Error(`No PPE found with identifier: ${id}`);
      }
      
      return result as PPEItem;
    } catch (error: any) {
      console.error('Error getting PPE by ID:', error);
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
