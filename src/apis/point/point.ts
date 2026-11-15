import axiosInstance from '@/apis/axiosInstance';
import type {
  TGetPointHistoriesResponse,
  TGetPointSummaryResponse,
  TPointHistoryPage,
  TPointSummary,
} from '@/types/point/TPoint';

// 내 총 포인트.
export const getPointSummary = async (): Promise<TPointSummary> => {
  const { data } = await axiosInstance.get<TGetPointSummaryResponse>('/api/points/me');
  return data.result;
};

// 내 적립 내역. 최신순 20개씩, 다음 페이지는 이전 응답의 nextCursor로 받는다.
export const getPointHistories = async (cursor: number | null): Promise<TPointHistoryPage> => {
  const { data } = await axiosInstance.get<TGetPointHistoriesResponse>('/api/points/me/histories', {
    params: cursor === null ? undefined : { cursor },
  });
  return data.result;
};
