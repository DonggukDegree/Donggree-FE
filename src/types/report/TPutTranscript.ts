import type { TCommonResponse } from '@/types/common';

// 성적표 업로드 성공 응답의 result.
// creditGap = totalCredits - recordedCredits. 0이면 정합성 OK, 0이 아니면 불일치.
export type TPutTranscriptResult = {
  totalCredits: number; // PDF에 기재된 총취득학점
  recordedCredits: number; // 등록된 수강 이력 학점의 합
  creditGap: number; // 총취득학점 - 과목 학점 합 (양수: 이수 이력 추가 필요, 음수: 과목 합이 더 많음)
};

export type TPutTranscriptResponse = TCommonResponse<TPutTranscriptResult>;
