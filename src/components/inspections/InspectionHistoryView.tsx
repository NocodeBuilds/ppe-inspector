
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import InspectionList from './InspectionList';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useNetwork } from '@/hooks/useNetwork';

interface InspectionFilters {
  searchTerm?: string;
  type?: string;
  result?: string;
  dateFrom?: string;
  dateTo?: string;
}

const InspectionHistoryView = () => {
  const [inspections, setInspections] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<InspectionFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;
  const { isOnline } = useNetwork();
  
  useEffect(() => {
    fetchInspections();
  }, [filters, currentPage]);
  
  const fetchInspections = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate pagination limits
      const from = (currentPage - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;
      
      // Start building the query
      let query = supabase
        .from('inspections')
        .select(`
          id,
          date,
          type,
          overall_result,
          profiles!inspections_inspector_id_fkey(full_name, site_name),
          ppe_items!inspections_ppe_id_fkey(type, serial_number)
        `, { count: 'exact' });
      
      // Apply filters
      if (filters.searchTerm) {
        const searchTerm = `%${filters.searchTerm}%`;
        query = query.or(`ppe_items.serial_number.ilike.${searchTerm},ppe_items.type.ilike.${searchTerm}`);
      }
      
      if (filters.type && filters.type !== 'all') {
        query = query.eq('type', filters.type);
      }
      
      if (filters.result && filters.result !== 'all') {
        query = query.eq('overall_result', filters.result);
      }
      
      if (filters.dateFrom) {
        query = query.gte('date', filters.dateFrom);
      }
      
      if (filters.dateTo) {
        query = query.lte('date', filters.dateTo);
      }
      
      // Add pagination
      query = query
        .order('date', { ascending: false })
        .range(from, to);
      
      // Execute the query
      const { data, error, count } = await query;
      
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
      
      // Update pagination information
      if (count !== null) {
        setTotalCount(count);
        setTotalPages(Math.ceil(count / itemsPerPage));
      }
      
    } catch (error: any) {
      console.error('Error fetching inspections:', error);
      setError(error.message || 'Failed to load inspections');
      
      toast({
        title: 'Error',
        description: error.message || 'Failed to load inspections',
        variant: 'destructive',
      });
      
      // Try to load from cache if offline
      if (!isOnline) {
        try {
          const cachedInspections = localStorage.getItem('inspections_cache');
          if (cachedInspections) {
            const { data, timestamp } = JSON.parse(cachedInspections);
            setInspections(data);
            toast({
              title: 'Offline Mode',
              description: 'Showing cached inspections data',
            });
          }
        } catch (cacheError) {
          console.error('Error loading from cache:', cacheError);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFilterChange = (newFilters: InspectionFilters) => {
    setFilters({...filters, ...newFilters});
    setCurrentPage(1); // Reset to first page when filters change
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <div className="space-y-4">
      {error && !inspections && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md text-red-800">
          {error}
        </div>
      )}
      
      {isLoading && !inspections && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      <InspectionList
        inspections={inspections}
        isLoading={isLoading && !inspections}
        showFilters={true}
        onFilterChange={handleFilterChange}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        totalPages={totalPages}
        emptyMessage="No inspection records found. Complete an inspection to see it here."
      />
      
      {totalCount > 0 && (
        <div className="text-sm text-muted-foreground text-right">
          Showing {inspections?.length || 0} of {totalCount} total inspections
        </div>
      )}
    </div>
  );
};

export default InspectionHistoryView;
