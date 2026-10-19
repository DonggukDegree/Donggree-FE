import type { TCommonResponse } from '@/types/common';

// 성적표 업로드 성공 응답의 result.
// 학점 차이와 별개로 F 평가방식 확인 대상이 있을 수 있다.
export type TGradeReviewCourse = { semester: string; courseCode: string; courseName: string };

export type TPutTranscriptResult = {
  totalCredits: number; // PDF에 기재된 총취득학점
  recordedCredits: number; // 등록된 취득학점 합 (P 포함, F·NP 제외)
  creditGap: number; // 총취득학점 - 등록된 취득학점 합
  gradeReviewCourses: TGradeReviewCourse[]; // 자동 구분하지 못해 F(등급)으로 저장한 과목
};

export type TPutTranscriptResponse = TCommonResponse<TPutTranscriptResult>;
