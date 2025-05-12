
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface UseSupabaseQueryOptions<TData, TError = unknown>
  extends Omit<
    UseQueryOptions<TData, TError, TData>,
    'queryKey' | 'queryFn'
  > {}

export function useSupabaseQuery<TData = unknown, TError = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseSupabaseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  return useQuery({
    queryKey,
    queryFn,
    onError: (error) => {
      console.error('Supabase Query Error:', error);
      toast({
        title: 'Error',
        description: (error as Error)?.message || 'Failed to fetch data',
        variant: 'destructive',
      });
    },
    ...options,
  });
}
