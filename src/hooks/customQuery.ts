/**
 * [공용] TanStack Query 래퍼
 * 모든 조회·변경 훅은 이 두 함수를 거친다. 캐시 정책과 에러 처리 기본값을 한곳에서 통일하기 위함이다.
 *  - useCoreQuery : 캐시 정책은 QueryClient 기본값(constants/queryOptions)을 따르고 타입만 고정
 *  - useCoreMutation: onError를 주지 않으면 공용 토스트로 안내 (either/or)
 */
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
  // staleTime·retry·refetchOnWindowFocus는 QueryClient 기본값(constants/queryOptions)에서 온다.
  // 여기서는 키/함수 타입만 고정하고, 화면별로 다르게 가야 하는 값만 options로 덮어쓴다.
  return useQuery({
    queryKey: keyName,
    queryFn: query,
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
