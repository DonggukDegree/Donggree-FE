import type { TCommonResponse } from '@/types/common';
import type { TCourseType } from '@/types/course';

export type TRuleTypeName =
  | 'TOTAL_CREDITS'
  | 'GPA'
  | 'MIN_AREA_CREDITS'
  | 'REQUIRED_COURSE'
  | 'ENGLISH_COURSE'
  | 'PREREQUISITE'
  | 'SCIENCE_EXPERIMENT'
  | 'SCIENCE_CONFLICT'
  | 'THESIS';

// GET /api/admin/rule-types 응답 항목 — 졸업 규칙 폼/필터 선택지
export type TAdminRuleType = {
  id: number;
  typeName: TRuleTypeName;
  courseType: TCourseType | null;
  description: string;
};

export type TGetRuleTypesResponse = TCommonResponse<TAdminRuleType[]>;
