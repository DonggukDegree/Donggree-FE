import {
  type MutationFunction,
  type QueryFunction,
  type QueryKey,
  useMutation,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';

import type { TResponseError, TUseMutationCustomOptions, TUseQueryCustomOptions } from '@/types/common';

export function useCoreQuery<TQueryFnData, TData = TQueryFnData>(
  keyName: QueryKey,
  query: QueryFunction<TQueryFnData, QueryKey>,
  options?: TUseQueryCustomOptions<TQueryFnData, TData>,
): UseQueryResult<TData, TResponseError> {
  return useQuery({
    queryKey: keyName,
    queryFn: query,
    staleTime: 1000 * 60 * 5,
    ...options,
  });
}

export function useCoreMutation<T, U>(mutation: MutationFunction<T, U>, options?: TUseMutationCustomOptions<T, U>) {
  return useMutation({
    mutationFn: mutation,
    onError: (error: TResponseError) => {
      toast.error(error.response?.data?.message ?? '요청 처리 중 오류가 발생했습니다.');
      options?.onError?.(error);
    },
    ...options,
  });
}
