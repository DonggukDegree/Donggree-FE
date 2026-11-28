/** [정각원의 비밀] 회원(로그인 세션)과 비회원(진행 토큰)의 오늘의 사건·추리 제출 API. */
import axiosInstance from '@/apis/axiosInstance';
import type { TCommonResponse } from '@/types/common';
import type {
  TMysteryGuest,
  TMysteryGuestSubmission,
  TMysterySubmission,
  TMysteryToday,
} from '@/types/mystery/TMystery';

export const getMysteryToday = async (signal?: AbortSignal): Promise<TMysteryToday> => {
  const { data } = await axiosInstance.get<TCommonResponse<TMysteryToday>>('/api/games/mystery/today', { signal });
  return data.result;
};
export const submitMysteryGuess = async (body: TMysterySubmission): Promise<TMysteryToday> => {
  const { data } = await axiosInstance.post<TCommonResponse<TMysteryToday>>('/api/games/mystery/today/guesses', body);
  return data.result;
};

export const getMysteryGuestToday = async (
  progressToken: string | null,
  signal?: AbortSignal,
): Promise<TMysteryGuest> => {
  const { data } = await axiosInstance.post<TCommonResponse<TMysteryGuest>>(
    '/api/games/mystery/guest/today',
    { progressToken },
    { signal },
  );
  return data.result;
};
export const submitMysteryGuestGuess = async (body: TMysteryGuestSubmission): Promise<TMysteryGuest> => {
  const { data } = await axiosInstance.post<TCommonResponse<TMysteryGuest>>('/api/games/mystery/guest/guesses', body);
  return data.result;
};
