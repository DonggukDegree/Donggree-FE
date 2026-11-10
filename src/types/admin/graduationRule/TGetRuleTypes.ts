import type { TCommonResponse } from '@/types/common';
import type { TCourseType } from '@/types/course';

// MIN_AREA_CREDITS와 SCIENCE_EXPERIMENT는 판정 로직이 같아 서버에서 MIN_CREDITS 하나로 합쳐졌다.
// 합산 계산 또는 학수번호 그룹별 최소학점·필수 충족 그룹 수로 판정한다.
export type TRuleTypeName =
  | 'TOTAL_CREDITS'
  | 'GPA'
  | 'TEACHING_APTITUDE'
  | 'MIN_CREDITS'
  | 'REQUIRED_COURSE'
  | 'ENGLISH_COURSE'
  | 'PREREQUISITE'
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
