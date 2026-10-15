import type { TCommonResponse } from '@/types/common';
import type { TCourseType } from '@/types/course';

// GET /api/admin/course-classifications 응답 항목
export type TAdminCourseClassification = {
  id: number;
  courseCode: string;
  tag: string | null;
  studentYearStart: number;
  studentYearEnd: number;
  courseType: TCourseType;
  areaTypeId: number | null;
  areaName: string | null;
  subCategory: string | null;
  subjectDomain: string | null;
};

// 과목 분류 조회 필터. 배열 값은 API 요청 직전에 콤마 문자열로 직렬화한다.
export type TCourseClassificationFilters = {
  areaTypeIds?: number[];
  courseTypes?: TCourseType[];
  years?: number[];
};

export type TGetCourseClassificationsResponse = TCommonResponse<TAdminCourseClassification[]>;
