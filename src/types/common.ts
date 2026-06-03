import type { QueryKey, UseMutationOptions, UseQueryOptions } from '@tanstack/react-query';
import type { AxiosError } from 'axios';

export type TCommonResponse<T> = {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
};

export type TResponseError = AxiosError<TCommonResponse<null>>;

export type TUseMutationCustomOptions<TData = unknown, TVariables = unknown> = Omit<
  UseMutationOptions<TData, TResponseError, TVariables, unknown>,
  'mutationFn' | 'onError'
> & {
  // React Query 표준 시그니처에 맞춰 error 외 variables/context도 받을 수 있게 한다.
  // (error만 받는 핸들러도 그대로 할당 가능 — 후행 인자는 무시되므로 하위호환)
  onError?: (error: TResponseError, variables: TVariables, context: unknown) => void;
};

export type TUseQueryCustomOptions<TQueryFnData = unknown, TData = TQueryFnData> = Omit<
  UseQueryOptions<TQueryFnData, TResponseError, TData, QueryKey>,
  'queryKey'
>;
