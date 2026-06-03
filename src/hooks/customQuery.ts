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
    // 인증 실패(401)는 재시도해도 결과가 같아 backoff 지연만 늘어나므로 즉시 중단한다.
    // 그 외 일시적 오류는 기존처럼 최대 3회까지 재시도한다.
    retry: (failureCount, error) => {
      if (error && (error as TResponseError).response?.status === 401) return false;
      return failureCount < 3;
    },
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
