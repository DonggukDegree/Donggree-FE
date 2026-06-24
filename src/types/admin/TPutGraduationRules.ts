import type { TCommonResponse } from '@/types/common';

import type { TGraduationRuleConfig } from './TGetGraduationRules';

export type TGraduationRuleUpsertItem = {
  id: number | null;
  ruleTypeId: number;
  ruleName: string;
  ruleConfig: TGraduationRuleConfig;
  description: string | null;
};

export type TGraduationRuleUpsertRequest = {
  items: TGraduationRuleUpsertItem[];
};

export type TPutGraduationRulesResponse = TCommonResponse<number[]>;
