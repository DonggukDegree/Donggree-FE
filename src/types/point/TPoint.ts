import type { TCommonResponse } from '@/types/common';

// 포인트 적립 사유. 화면 문구·적립액 안내는 constants/point에서 매핑한다.
export type TPointReason =
  | 'GRADUATION_REPORT_FIRST_VIEW'
  | 'PLACE_REGISTER'
  | 'PLACE_FIRST_REVIEW'
  | 'PLACE_REVIEW'
  | 'PLACE_INFO_EDIT'
  | 'MYSTERY_SOLVED'
  | 'CLUB_FIRST_REGISTRATION'
  | 'CLUB_RECRUITMENT'
  | 'CLUB_GENERATION_UPDATE';

// GET /api/points/me. 숨김으로 회수된 적립은 합계에서 빠진다.
export type TPointSummary = {
  totalPoints: number;
};

export type TPointHistory = {
  historyId: number;
  reason: TPointReason;
  amount: number;
  revoked: boolean; // 대상 장소·리뷰가 숨겨져 회수됨(총 포인트에서 빠짐)
  createdAt: string;
};

// GET /api/points/me/histories. 최신순 20개, 마지막 페이지면 nextCursor null.
export type TPointHistoryPage = {
  histories: TPointHistory[];
  nextCursor: number | null;
};

// POST /api/points/me/rewards/acknowledge. 방금 한 활동의 적립을 화면이 안내했다고 기록한다.
export type TPointRewardAcknowledgeRequest = {
  reason: TPointReason;
  targetId?: number; // 장소 ID 또는 추리 문제 날짜(yyyyMMdd), 졸업 리포트 최초 확인이면 생략
};

// 이번에 처음 안내하는 적립이면 rewarded=true. 적립 없음·이미 안내·회수면 false(amount 0).
export type TPointRewardAcknowledge = {
  rewarded: boolean;
  amount: number;
};

export type TGetPointSummaryResponse = TCommonResponse<TPointSummary>;
export type TGetPointHistoriesResponse = TCommonResponse<TPointHistoryPage>;
export type TPostPointRewardAcknowledgeResponse = TCommonResponse<TPointRewardAcknowledge>;
