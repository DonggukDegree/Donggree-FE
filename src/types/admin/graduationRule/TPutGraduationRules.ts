import type { TValidatedRuleConfig } from '@/types/admin/graduationRule/graduationRuleConfig';
import type { TCommonResponse } from '@/types/common';

export type TGraduationRuleUpsertItem = {
  id: number | null;
  ruleTypeId: number;
  ruleName: string;
  ruleConfig: TValidatedRuleConfig;
  description: string | null;
};

export type TGraduationRuleUpsertRequest = {
  items: TGraduationRuleUpsertItem[];
};

export type TPutGraduationRulesResponse = TCommonResponse<number[]>;
