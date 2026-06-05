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
import { getErrorStatus } from '@/utils/error';

export function useCoreQuery<TQueryFnData, TData = TQueryFnData>(
  keyName: QueryKey,
  query: QueryFunction<TQueryFnData, QueryKey>,
  options?: TUseQueryCustomOptions<TQueryFnData, TData>,
): UseQueryResult<TData, TResponseError> {
  return useQuery({
    queryKey: keyName,
    queryFn: query,
    staleTime: 1000 * 60 * 5,
    // 4xx(인증 실패·리소스 없음 등)는 재시도해도 결과가 같아 backoff 지연만 늘어나므로 즉시 중단한다.
    // 특히 401은 이미 axios 인터셉터가 refresh를 시도한 "최종 실패"라 여기서 또 재시도할 이유가 없다.
    // 서버 오류(5xx)·네트워크 오류 같은 일시적 실패만 기존처럼 최대 3회 재시도한다.
    retry: (failureCount, error) => {
      const status = getErrorStatus(error);
      if (status && status >= 400 && status < 500) return false;
      return failureCount < 3;
    },
    ...options,
  });
}

export function useCoreMutation<T, U>(mutation: MutationFunction<T, U>, options?: TUseMutationCustomOptions<T, U>) {
  // onError를 분리해 스프레드(...restOptions)가 아래 기본 핸들러를 덮어쓰지 않게 한다.
  const { onError, ...restOptions } = options ?? {};
  return useMutation({
    mutationFn: mutation,
    // either/or: 호출자가 onError를 직접 제공하면 그쪽에 위임하고(직접 토스트/모달 등 처리),
    // 없으면 공용 기본 토스트로 안내한다. (토스트와 커스텀 처리가 동시에 뜨지 않도록)
    onError: (error: TResponseError, variables: U, context: unknown) => {
      if (onError) {
        onError(error, variables, context);
      } else {
        toast.error(error.response?.data?.message ?? '요청 처리 중 오류가 발생했습니다.');
      }
    },
    ...restOptions,
  });
}
