import type { TCommonResponse } from '@/types/common';
import type { TSemesterCourses } from '@/types/report/TGetUserReports';

// PATCH /api/users/me/reports 요청 — 변경 후의 전체 수강 이력 목록으로 통째 치환(수정·추가·삭제)
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

// 응답 result: 재계산된 학점·평점 + 학기 오름차순으로 그룹핑한 전체 수강 이력(치환 후 id 새로 부여)
export type TPatchReportResult = {
  totalCredits: number;
  gpa: number;
  courses: TSemesterCourses[];
};

export type TPatchReportResponse = TCommonResponse<TPatchReportResult>;
