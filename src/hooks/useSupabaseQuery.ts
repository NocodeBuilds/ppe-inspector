
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface UseSupabaseQueryOptions<TData, TError> extends Omit<UseQueryOptions<TData, TError, TData>, 'queryFn'> {
  showErrorToast?: boolean;
  errorToastTitle?: string;
  errorToastDescription?: string;
}

export function useSupabaseQuery<TData = unknown, TError = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseSupabaseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { showErrorToast = true, errorToastTitle = 'Error', errorToastDescription, ...restOptions } = options || {};

  return useQuery<TData, TError, TData>({
    queryKey,
    queryFn,
    ...restOptions,
    onSettled: (data, error) => {
      if (error) {
        console.error('Query Error:', error);
        
        if (showErrorToast) {
          toast({
            title: errorToastTitle,
            description: errorToastDescription || (error as Error)?.message || 'An error occurred',
            variant: 'destructive',
          });
        }
      }
      
      // Call the original onSettled if provided
      if (restOptions.onSettled) {
        restOptions.onSettled(data, error);
      }
    }
  });
}
