import type { TCommonResponse } from '@/types/common';

export type TRequirementSetFilters = {
  collegeId?: number;
  departmentId?: number;
  year?: number;
};

export type TAdminRequirementSetSummary = {
  id: number;
  departmentId: number;
  departmentName: string;
  yearStart: number;
  yearEnd: number;
  version: number;
  description: string | null;
  sheetImageUrl: string | null;
  active: boolean;
};

export type TAdminRequirementSetDetail = TAdminRequirementSetSummary & {
  graduationRuleIds: number[];
};

export type TRequirementSetCreateRequest = {
  collegeName: string;
  departmentName: string;
  yearStart: number;
  yearEnd: number;
  description: string | null;
  sheetImageUrl: string | null;
  active: boolean;
  graduationRuleIds: number[];
};

export type TRequirementSetUpdateRequest = Omit<TRequirementSetCreateRequest, 'collegeName' | 'departmentName'>;

export type TGetRequirementSetsResponse = TCommonResponse<TAdminRequirementSetSummary[]>;
export type TGetRequirementSetDetailResponse = TCommonResponse<TAdminRequirementSetDetail>;
export type TPostRequirementSetResponse = TCommonResponse<number>;
export type TPutRequirementSetResponse = TCommonResponse<null>;
