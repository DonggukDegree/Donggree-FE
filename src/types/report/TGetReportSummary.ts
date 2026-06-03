import type { TCommonResponse } from '@/types/common';
import type { TCourseName } from '@/types/course';

// GET /api/reports/summary 응답 — 전체 졸업 달성률 요약 + courseType별 이수 현황

// 상단 요약
export type TReportSummary = {
  achievementRate: number; // 전체 졸업 달성률 (0~100)
  earnedCredits: number; // 현재 이수 학점
  targetCredits: number; // 목표 이수 학점
  remainingCredits: number; // 잔여 학점
  gpa: number; // 총 평점 평균
  graduated: boolean; // 졸업 판정 여부
  unsatisfiedReasons: string[]; // 졸업요건 부문 미충족 사유 목록
};

// 영역(courseType)별 개요 카드
export type TAreaOverview = {
  courseType: TCourseName; // COMMON_GENERAL, LIBERAL_ARTS, ...
  courseTypeName: string; // 공통교양, 일반교양, ...
  achievementRate: number; // 해당 영역 달성률 (0~100)
  remainingCredits: number; // 해당 영역 잔여 학점
  satisfied: boolean; // 해당 영역 요건 충족 여부
};

export type TGetReportSummaryResult = {
  summary: TReportSummary;
  areaOverviews: TAreaOverview[];
};

export type TGetReportSummaryResponse = TCommonResponse<TGetReportSummaryResult>;
