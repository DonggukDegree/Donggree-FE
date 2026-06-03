import type { TCommonResponse } from '@/types/common';

// GET /api/users/me/reports 응답
// 성적표(학업 리포트) 메타 정보 + 학기별 수강 이력(학기 오름차순 그룹)

// 상단 메타 정보
export type TReportMeta = {
  admissionYear: number; // 입학년도
  department: string; // 전공 학과명
  subMajor1: string | null; // 제1부전공 학과명 (없으면 null)
  subMajor2: string | null; // 제2부전공 학과명 (없으면 null)
  dualMajor1: string | null; // 제1복수전공 학과명 (없으면 null)
  dualMajor2: string | null; // 제2복수전공 학과명 (없으면 null)
  academicStatus: string; // 학적 상태 (예: 재학)
  totalCredits: number; // 총취득학점
  gpa: number; // 평점 평균
  completedSemesters: number; // 이수 학기 수
};

// 개별 수강 이력
export type TTranscriptRecord = {
  id: number;
  courseCode: string; // 학수번호
  courseName: string; // 교과목명
  credits: number; // 학점
  courseType: string; // 이수 구분 (PDF 원시 문자열: 전공/공교/일교 등)
  areaName: string | null; // 이수 영역명 (없으면 null)
  grade: string; // 성적 (A+, A0, ... P, NP)
  retake: boolean; // 재수강 여부
};

// 학기별 수강 이력 그룹
export type TSemesterCourses = {
  semester: string; // 학기 (예: 2023-1, 2023-여름)
  records: TTranscriptRecord[];
};

export type TGetUserReportsResult = {
  meta: TReportMeta;
  courses: TSemesterCourses[];
};

export type TGetUserReportsResponse = TCommonResponse<TGetUserReportsResult>;
