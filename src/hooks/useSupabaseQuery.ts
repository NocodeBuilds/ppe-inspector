
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PostgrestFilterBuilder, PostgrestError } from '@supabase/postgrest-js';

type UseSupabaseQueryOptions<T> = {
  cacheTime?: number;
  enabled?: boolean;
  onError?: (error: PostgrestError) => void;
  onSuccess?: (data: T[]) => void;
};

type QueryKey = [string, Record<string, any>?];

/**
 * A hook to fetch data from Supabase
 */
export function useSupabaseQuery<T = any>(
  queryKey: QueryKey,
  queryFn: () => PostgrestFilterBuilder<T>,
  options: UseSupabaseQueryOptions<T> = {}
) {
  const [data, setData] = useState<T[] | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  const { cacheTime = 5 * 60 * 1000, enabled = true, onError, onSuccess } = options;

  const fetchData = async (isRefetch = false) => {
    if (!enabled) return;

    if (isRefetch) {
      setIsRefetching(true);
    } else {
      setIsLoading(true);
    }

    try {
      const query = queryFn();
      const { data: result, error: queryError } = await query;

      if (queryError) {
        setError(queryError);
        if (onError) onError(queryError);
      } else {
        setData(result as T[]);
        if (onSuccess) onSuccess(result as T[]);
      }
    } catch (err: any) {
      const postgrestError = {
        message: err.message || 'An unknown error occurred',
        details: '',
        hint: '',
        code: '',
      } as PostgrestError;
      
      setError(postgrestError);
      if (onError) onError(postgrestError);
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey[0], JSON.stringify(queryKey[1]), enabled]);

  const refetch = () => fetchData(true);

  return {
    data,
    error,
    isLoading: isLoading && !isRefetching,
    isRefetching,
    refetch,
  };
}

// Example of a custom profile query that will be adapted to work with our schema
export function useProfileQuery(userId: string | null | undefined, options = {}) {
  return useSupabaseQuery(
    ['profile', { userId }],
    () => supabase.from('profiles').select('*').eq('id', userId || '').single(),
    options
  );
}

// Adapt the function to handle null values and simplify implementation
export function useExtendedProfileQuery(userId: string | null | undefined, options = {}) {
  return useSupabaseQuery(
    ['extended_profile', { userId }],
    () => supabase.from('profiles').select('*').eq('id', userId || '').single(),
    options
  );
}
