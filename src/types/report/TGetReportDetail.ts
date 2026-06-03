import type { TCommonResponse } from '@/types/common';

// GET /api/reports?courseType={courseType} 응답 — courseType 내 영역(areaType)별 상세 이수 현황

// 과목 이수 상태
export type TReportItemStatus = 'SATISFIED' | 'UNSATISFIED' | 'OPTIONAL'; // 필수 이수 / 필수 미이수 / 선택 이수

// 영역 내 개별 과목
export type TReportAreaItem = {
  title: string; // 과목명
  credit: number; // 이수 학점 (미이수 필수과목은 0)
  status: TReportItemStatus;
  detail: string[] | null; // 부가 설명 (없으면 null)
};

// 영역(areaType)별 상세
export type TReportAreaDetail = {
  areaName: string; // 영역 이름
  earnedCredits: number; // 해당 영역 이수 학점
  targetCredits: number; // 해당 영역 목표 학점
  satisfied: boolean; // 해당 영역 필수 요건 충족 여부
  items: TReportAreaItem[];
};

// 해당 courseType 전체 학점 현황
export type TReportCreditStatus = {
  earnedCredits: number;
  targetCredits: number;
  remainingCredits: number;
};

export type TGetReportDetailResult = {
  areaDetails: TReportAreaDetail[];
  unsatisfiedReasons: string[]; // 해당 courseType 미충족 졸업 규칙 사유
  creditStatus: TReportCreditStatus;
};

export type TGetReportDetailResponse = TCommonResponse<TGetReportDetailResult>;
