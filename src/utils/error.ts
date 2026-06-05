import { isAxiosError } from 'axios';

import type { TCommonResponse } from '@/types/common';

// 응답 봉투의 의미 코드(code)를 안전하게 추출한다. (axios 에러가 아니거나 응답이 없으면 undefined)
export const getErrorCode = (error: unknown): string | undefined =>
  isAxiosError<TCommonResponse<null>>(error) ? error.response?.data?.code : undefined;

// 응답 봉투의 메시지를 안전하게 추출한다.
export const getErrorMessage = (error: unknown): string | undefined =>
  isAxiosError<TCommonResponse<null>>(error) ? error.response?.data?.message : undefined;

// HTTP 상태 코드를 안전하게 추출한다. (응답 없는 네트워크 에러면 undefined)
export const getErrorStatus = (error: unknown): number | undefined =>
  isAxiosError(error) ? error.response?.status : undefined;
