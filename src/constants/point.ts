import type { TPointReason } from '@/types/point/TPoint';

// 적립 내역 한 줄의 항목 이름.
export const POINT_REASON_LABELS: Record<TPointReason, string> = {
  GRADUATION_REPORT_FIRST_VIEW: '졸업 리포트 첫 확인',
  PLACE_REGISTER: '동글맵 새 장소 등록',
  PLACE_FIRST_REVIEW: '동글맵 장소 첫 리뷰 작성',
  PLACE_REVIEW: '동글맵 리뷰 작성',
  PLACE_INFO_EDIT: '동글맵 장소 정보 수정',
  MYSTERY_SOLVED: '정각원의 비밀 정답 해결',
  CLUB_FIRST_REGISTRATION: '동아리 쇼핑 최초 등록',
  CLUB_RECRUITMENT: '동아리 쇼핑 모집 등록',
  CLUB_GENERATION_UPDATE: '동아리 쇼핑 기수 갱신',
};

// 적립 내역 페이지 ? 툴팁의 적립 기준 요약. 서버 적립 기준(BE PointReason)과 같은 값이어야 한다.
export const POINT_RULES: { label: string; amount: number; note?: string }[] = [
  { label: '졸업 리포트 첫 확인', amount: 500 },
  { label: '동글맵 새 장소 등록', amount: 500 },
  { label: '리뷰가 없던 장소에 첫 리뷰 작성', amount: 500 },
  { label: '동글맵 리뷰 작성', amount: 100, note: '장소별 1회' },
  { label: '동글맵 장소 정보 수정', amount: 100, note: '장소별 1회' },
  { label: '정각원의 비밀 정답 해결', amount: 10, note: '하루 1회' },
  { label: '동아리 쇼핑 최초 등록(관리자 승인)', amount: 500, note: '동아리당 1회' },
  { label: '동아리 쇼핑 새 기수 모집 등록(관리자 승인)', amount: 100, note: '동아리·기수당 1회' },
  { label: '동아리 쇼핑 기수 갱신(관리자 승인)', amount: 100, note: '동아리·기수당 1회' },
];

export const POINT_RULE_NOTE = '숨김 처리된 장소·리뷰로 받은 포인트는 회수돼요.';

// 적립 유도 말풍선·안내 문구.
export const POINT_HINTS = {
  REVIEW_WRITE: '리뷰 작성 시 100P 적립!',
  PLACE_REGISTER: '장소 등록 시 500P 적립!',
  firstReview: (placeName: string) => `${placeName}의 첫 리뷰 작성 시 500P 적립!`,
} as const;
