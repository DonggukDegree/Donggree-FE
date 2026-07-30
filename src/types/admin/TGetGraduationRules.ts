import type { TCommonResponse } from '@/types/common';
import type { TCourseType } from '@/types/course';

import type { TRuleTypeName } from './TGetRuleTypes';

export type TGraduationRuleConfig = Record<string, unknown>;

// GET /api/admin/graduation-rules 응답 항목
export type TAdminGraduationRule = {
  id: number;
  ruleTypeId: number;
  typeName: TRuleTypeName;
  courseType: TCourseType | null;
  ruleName: string;
  ruleConfig: TGraduationRuleConfig;
  description: string | null;
};

export type TGraduationRuleFilters = {
  ruleTypeIds?: number[];
  courseTypes?: TCourseType[];
  // 지정하면 해당 졸업 요건 세트에 연결된 규칙만 조회한다. (다른 필터와 AND 결합)
  requirementSetId?: number;
};

export type TGetGraduationRulesResponse = TCommonResponse<TAdminGraduationRule[]>;
