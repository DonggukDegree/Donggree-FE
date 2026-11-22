/** [정각원의 비밀] 로그인 세션을 사용하는 오늘의 사건·추리 제출 API. */
import axiosInstance from '@/apis/axiosInstance';
import type { TCommonResponse } from '@/types/common';
import type { TMysterySubmission, TMysteryToday } from '@/types/mystery/TMystery';

export const getMysteryToday = async (signal?: AbortSignal): Promise<TMysteryToday> => {
  const { data } = await axiosInstance.get<TCommonResponse<TMysteryToday>>('/api/games/mystery/today', { signal });
  return data.result;
};
export const submitMysteryGuess = async (body: TMysterySubmission): Promise<TMysteryToday> => {
  const { data } = await axiosInstance.post<TCommonResponse<TMysteryToday>>('/api/games/mystery/today/guesses', body);
  return data.result;
};
