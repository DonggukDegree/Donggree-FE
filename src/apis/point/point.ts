import axiosInstance from '@/apis/axiosInstance';
import type {
  TGetPointHistoriesResponse,
  TGetPointSummaryResponse,
  TPointHistoryPage,
  TPointRewardAcknowledge,
  TPointRewardAcknowledgeRequest,
  TPointSummary,
  TPostPointRewardAcknowledgeResponse,
} from '@/types/point/TPoint';

// 내 총 포인트.
export const getPointSummary = async (): Promise<TPointSummary> => {
  const { data } = await axiosInstance.get<TGetPointSummaryResponse>('/api/points/me');
  return data.result;
};

// 방금 한 활동의 적립 안내 확인. 처음 안내하는 적립이면 rewarded=true와 적립액을 받고, 서버는 안내한 것으로 기록한다.
// 장소 등록·리뷰·정보 수정 적립은 그 요청의 응답 전에 끝나 있으므로 성공 직후 바로 부르면 된다.
export const postPointRewardAcknowledge = async (
  body: TPointRewardAcknowledgeRequest,
): Promise<TPointRewardAcknowledge> => {
  const { data } = await axiosInstance.post<TPostPointRewardAcknowledgeResponse>(
    '/api/points/me/rewards/acknowledge',
    body,
  );
  return data.result;
};

// 내 적립 내역. 최신순 20개씩, 다음 페이지는 이전 응답의 nextCursor로 받는다.
export const getPointHistories = async (cursor: number | null): Promise<TPointHistoryPage> => {
  const { data } = await axiosInstance.get<TGetPointHistoriesResponse>('/api/points/me/histories', {
    params: cursor === null ? undefined : { cursor },
  });
  return data.result;
};
