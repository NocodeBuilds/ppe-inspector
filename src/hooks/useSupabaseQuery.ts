
import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

interface UseSupabaseQueryOptions<TData, TError> 
  extends Omit<UseQueryOptions<TData, TError, TData>, 'queryFn' | 'queryKey'> {
  showErrorToast?: boolean;
  errorToastTitle?: string;
  errorToastDescription?: string;
}

export function useSupabaseQuery<TData = unknown, TError = unknown>(
  queryKey: string[],
  queryFn: () => Promise<TData>,
  options?: UseSupabaseQueryOptions<TData, TError>
): UseQueryResult<TData, TError> {
  const { 
    showErrorToast = true, 
    errorToastTitle = 'Error', 
    errorToastDescription,
    ...restOptions 
  } = options || {};

  // Create the query config with proper types
  const queryConfig: UseQueryOptions<TData, TError, TData> = {
    ...restOptions,
    queryKey,
    queryFn,
  };
  
  // Add error handling through the meta object for React Query v5+
  if (showErrorToast) {
    queryConfig.meta = {
      ...queryConfig.meta,
      onError: (error: TError) => {
        console.error('Query Error:', error);
        
        toast({
          title: errorToastTitle,
          description: errorToastDescription || (error as Error)?.message || 'An error occurred',
          variant: 'destructive',
        });
      }
    };
  }

  return useQuery(queryConfig);
}
