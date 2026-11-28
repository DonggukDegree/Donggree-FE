/** [울타리치기] 판 발급·힌트(비회원 가능)와 완성 기록·통계(로그인 회원) API. */
import axiosInstance from '@/apis/axiosInstance';
import type {
  TFenceCompletion,
  TFenceHint,
  TFencePuzzle,
  TFenceSize,
  TFenceStateRequest,
  TFenceStatistics,
  TGetFenceStatisticsResponse,
  TPostFenceCompletionResponse,
  TPostFenceHintResponse,
  TPostFencePuzzleResponse,
} from '@/types/fence/TFence';

export const postFencePuzzle = async (size: TFenceSize): Promise<TFencePuzzle> => {
  const { data } = await axiosInstance.post<TPostFencePuzzleResponse>('/api/games/fence/puzzles', { size });
  return data.result;
};

export const postFenceHint = async (body: TFenceStateRequest): Promise<TFenceHint> => {
  const { data } = await axiosInstance.post<TPostFenceHintResponse>('/api/games/fence/hints', body);
  return data.result;
};

export const postFenceCompletion = async (body: TFenceStateRequest): Promise<TFenceCompletion> => {
  const { data } = await axiosInstance.post<TPostFenceCompletionResponse>('/api/games/fence/completions', body);
  return data.result;
};

export const getFenceStatistics = async (): Promise<TFenceStatistics> => {
  const { data } = await axiosInstance.get<TGetFenceStatisticsResponse>('/api/games/fence/statistics');
  return data.result;
};
