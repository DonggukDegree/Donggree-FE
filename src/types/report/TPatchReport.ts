import type { TCommonResponse } from '@/types/common';

// PATCH /api/users/me/reports 요청 — 기존 성적표에 수강 이력을 수동으로 추가
export type TPatchReportCourse = {
  semester: string; // 학기 (예: 2023-1)
  courseType: string; // 이수 구분
  areaName?: string; // 이수 영역 (선택)
  courseCode: string; // 학수번호
  courseName: string; // 교과목명
  credits: number; // 학점
  grade: string; // 성적 (A+, A0, ... P, NP)
  retake: boolean; // 재수강 여부
};

export type TPatchReportRequest = {
  courses: TPatchReportCourse[];
};

// 응답 result: 새로 생성된 수강 이력 ID 목록
export type TPatchReportResult = {
  addedIds: number[];
};

export type TPatchReportResponse = TCommonResponse<TPatchReportResult>;
