import type { TCommonResponse } from '@/types/common';

// 자주 묻는 질문(FAQ) 관련 타입

// 태그. 화면 상단 칩으로 노출되며, 서버는 enum 이름만 주고받는다.
//  SERVICE: 동그리 서비스 자체 / COMMON: 공통 졸업 요건 / MAJOR: 전공 졸업 요건
export type TFaqTag = 'SERVICE' | 'COMMON' | 'MAJOR';

// GET /api/faqs 응답 한 건.
export type TFaq = {
  id: number;
  tag: TFaqTag;
  title: string; // 화면의 Q. 문구
  content: string; // 줄바꿈 포함 평문
};

export type TGetFaqsResponse = TCommonResponse<TFaq[]>;

// POST/PUT /api/admin/faqs 요청. tag 필수
export type TFaqRequest = {
  tag: TFaqTag;
  title: string;
  content: string;
};

export type TPostFaqResponse = TCommonResponse<number>;
export type TFaqMutationResponse = TCommonResponse<null>;
