
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

  // Function to get PPE by serial number - improved to handle number-only serial numbers
  const getPPEBySerialNumber = useCallback(async (serialNumber: string) => {
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
      showNotification('Error', 'error', {
        description: `Failed to fetch PPE data: ${error.message}`
      });
      return [];
    }
  }, [showNotification]);

  // Function to get PPE by ID - improved error handling with better fallback
  const getPPEById = useCallback(async (id: string) => {
    try {
      console.log(`Trying to fetch PPE with ID/serial: ${id}`);
      let result = null;
      
      // First try direct string match on serial_number
      console.log('Searching by exact serial number match first');
      const { data: serialData, error: serialError } = await supabase
        .from('ppe_items')
        .select('*')
        .eq('serial_number', id)
        .maybeSingle();
      
      if (serialError) {
        console.error('Error fetching by serial number:', serialError);
      } else if (serialData) {
        result = serialData;
        console.log('Found by exact serial match:', result);
        return result as PPEItem;
      }
      
      // If that didn't work, try UUID match if it looks like a UUID
      if (!result && id.includes('-') && id.length > 30) {
        console.log('Trying as UUID');
        try {
          const { data: uuidData, error: uuidError } = await supabase
            .from('ppe_items')
            .select('*')
            .eq('id', id)
            .maybeSingle();
          
          if (uuidError) {
            console.error('Error fetching by ID:', uuidError);
          } else if (uuidData) {
            result = uuidData;
            console.log('Found by UUID match:', result);
            return result as PPEItem;
          }
        } catch (e) {
          console.log('UUID lookup failed, continuing with pattern search');
        }
      }
      
      // Last resort: fuzzy search on serial number
      if (!result) {
        console.log('Trying pattern match on serial number');
        const { data: patternData, error: patternError } = await supabase
          .from('ppe_items')
          .select('*')
          .ilike('serial_number', `%${id}%`)
          .limit(1)
          .maybeSingle();
        
        if (patternError) {
          console.error('Error fetching by pattern:', patternError);
        } else if (patternData) {
          result = patternData;
          console.log('Found by pattern match:', result);
          return result as PPEItem;
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
