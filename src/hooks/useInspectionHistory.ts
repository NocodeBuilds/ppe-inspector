
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InspectionHistoryFilters {
  ppeId?: string;
  type?: string;
  result?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export const useInspectionHistory = (filters: InspectionHistoryFilters = {}) => {
  const [inspections, setInspections] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    fetchInspectionHistory();
  }, [filters]);
  
  const fetchInspectionHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Build the query
      let query = supabase
        .from('inspections')
        .select(`
          id,
          date,
          type,
          overall_result,
          profiles!inspections_inspector_id_fkey(full_name, site_name),
          ppe_items!inspections_ppe_id_fkey(type, serial_number)
        `);
      
      // Apply filters
      if (filters.ppeId) {
        query = query.eq('ppe_id', filters.ppeId);
      }
      
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      
      if (filters.result) {
        query = query.eq('overall_result', filters.result);
      }
      
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }
      
      // Always order by date descending
      query = query.order('date', { ascending: false });
      
      // Apply limit if provided
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      
      // Execute the query
      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process the inspection data
      const processedInspections = data.map(item => ({
        id: item.id,
        date: item.date,
        type: item.type,
        overall_result: item.overall_result,
        inspector_name: item.profiles?.full_name || 'Unknown',
        site_name: item.profiles?.site_name || 'Unknown',
        ppe_type: item.ppe_items?.type || 'Unknown',
        ppe_serial: item.ppe_items?.serial_number || 'Unknown'
      }));
      
      setInspections(processedInspections);
      
      // Cache the inspection data for offline use
      localStorage.setItem('inspections_cache', JSON.stringify({
        data: processedInspections,
        timestamp: new Date().getTime()
      }));
      
    } catch (error: any) {
      console.error('Error fetching inspection history:', error);
      setError(error.message || 'Failed to load inspection history');
      
      // Try to load from cache if available
      try {
        const cachedInspections = localStorage.getItem('inspections_cache');
        if (cachedInspections) {
          const { data } = JSON.parse(cachedInspections);
          
          // Apply client-side filtering if using cached data
          let filteredData = data;
          
          if (filters.ppeId) {
            filteredData = filteredData.filter((item: any) => 
              item.ppe_id === filters.ppeId);
          }
          
          if (filters.type) {
            filteredData = filteredData.filter((item: any) => 
              item.type === filters.type);
          }
          
          if (filters.result) {
            filteredData = filteredData.filter((item: any) => 
              item.overall_result === filters.result);
          }
          
          if (filters.limit) {
            filteredData = filteredData.slice(0, filters.limit);
          }
          
          setInspections(filteredData);
        }
      } catch (cacheError) {
        console.error('Error loading from cache:', cacheError);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    inspections,
    isLoading,
    error,
    refetch: fetchInspectionHistory
  };
};
