import type { TCommonResponse } from '@/types/common';
import type { TCourseType } from '@/types/course';

// MIN_AREA_CREDITS와 SCIENCE_EXPERIMENT는 판정 로직이 같아 서버에서 MIN_CREDITS 하나로 합쳐졌다.
// (선택자 OR × 임계값 AND 구조. 자세한 config 스키마는 graduationRuleConfigFields 주석 참고)
export type TRuleTypeName =
  | 'TOTAL_CREDITS'
  | 'GPA'
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
