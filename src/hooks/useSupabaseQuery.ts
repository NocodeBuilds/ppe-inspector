
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface QueryOptions {
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
}

/**
 * Custom hook for querying Supabase data with React Query
 */
export const useSupabaseQuery = <T>(
  queryKey: string[], 
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey,
    queryFn,
    staleTime: options.staleTime || 5 * 60 * 1000, // 5 minutes
    gcTime: options.cacheTime || 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: options.refetchOnWindowFocus ?? false,
    enabled: options.enabled,
    onError: (error: any) => {
      console.error(`Query error (${queryKey.join('/')}):`, error);
      toast({
        title: 'Error fetching data',
        description: error.message || 'An error occurred while fetching data',
        variant: 'destructive',
      });
    }
  });
};

/**
 * Custom hook for mutating Supabase data with React Query
 */
export const useSupabaseMutation = <T, U>(
  mutationFn: (data: U) => Promise<T>,
  options: {
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    invalidateQueries?: string[][];
  } = {}
) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn,
    onSuccess: (data) => {
      // Invalidate queries if specified
      if (options.invalidateQueries) {
        options.invalidateQueries.forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
      }
      
      // Call custom onSuccess if provided
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      
      // Show toast notification
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });
      
      // Call custom onError if provided
      if (options.onError) {
        options.onError(error);
      }
    }
  });
};

// Utility functions for common Supabase operations
export const fetchProfileData = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
    
  if (error) throw error;
  return data;
};

export const fetchExtendedProfileData = async () => {
  const { data, error } = await supabase.rpc('get_extended_profile');
  
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};
