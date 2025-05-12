
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

export interface UseSupabaseMutationOptions<TData, TVariables, TError = unknown>
  extends Omit<UseMutationOptions<TData, TError, TVariables>, 'mutationFn'> {
  invalidateQueries?: string[][];
}

export function useSupabaseMutation<TData = unknown, TVariables = unknown, TError = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseSupabaseMutationOptions<TData, TVariables, TError>
) {
  const { invalidateQueries, ...mutationOptions } = options || {};

  return useMutation({
    mutationFn,
    ...mutationOptions,
    onError: (error, variables, context) => {
      console.error('Supabase Mutation Error:', error);
      toast({
        title: 'Error',
        description: (error as Error)?.message || 'An error occurred during the operation',
        variant: 'destructive',
      });

      if (options?.onError) {
        options.onError(error, variables, context);
      }
    }
  });
}
