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
};

export type TGetGraduationRulesResponse = TCommonResponse<TAdminGraduationRule[]>;
