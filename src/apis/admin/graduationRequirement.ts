import axiosInstance from '@/apis/axiosInstance';
import type { TGetCollegesResponse, TGetDepartmentsResponse } from '@/types/admin/TGetAcademicOrganizations';
import type { TGetGraduationRulesResponse, TGraduationRuleFilters } from '@/types/admin/TGetGraduationRules';
import type { TGetRuleTypesResponse } from '@/types/admin/TGetRuleTypes';
import type { TGraduationRuleUpsertRequest, TPutGraduationRulesResponse } from '@/types/admin/TPutGraduationRules';
import type {
  TGetRequirementSetDetailResponse,
  TGetRequirementSetsResponse,
  TPostRequirementSetResponse,
  TPutRequirementSetResponse,
  TRequirementSetCreateRequest,
  TRequirementSetFilters,
  TRequirementSetUpdateRequest,
} from '@/types/admin/TRequirementSets';

const joinParam = <T extends string | number>(values?: T[]) => {
  if (!values || values.length === 0) return undefined;
  return values.join(',');
};

// 졸업 규칙 종류 조회. ruleTypeId와 typeName 매핑 및 필터 선택지로 사용한다.
export const getAdminRuleTypes = async () => {
  const { data } = await axiosInstance.get<TGetRuleTypesResponse>('/api/admin/rule-types');
  return data.result;
};

// 졸업 요건 세트 필터/등록 폼에서 사용하는 단과대 선택지 조회.
export const getAdminColleges = async () => {
  const { data } = await axiosInstance.get<TGetCollegesResponse>('/api/admin/colleges');
  return data.result;
};

// 졸업 요건 세트 필터/등록 폼에서 사용하는 학과 선택지 조회.
export const getAdminDepartments = async (collegeId?: number) => {
  const { data } = await axiosInstance.get<TGetDepartmentsResponse>('/api/admin/departments', {
    params: {
      collegeId,
    },
  });
  return data.result;
};

// 졸업 규칙 다중 필터 조회.
export const getAdminGraduationRules = async (filters: TGraduationRuleFilters) => {
  const { data } = await axiosInstance.get<TGetGraduationRulesResponse>('/api/admin/graduation-rules', {
    params: {
      ruleTypeIds: joinParam(filters.ruleTypeIds),
      courseTypes: joinParam(filters.courseTypes),
    },
  });
  return data.result;
};

// 졸업 규칙 배치 업서트. ruleConfig는 typeName별 폼 값으로 프론트에서 조립한다.
export const putAdminGraduationRules = async (body: TGraduationRuleUpsertRequest) => {
  const { data } = await axiosInstance.put<TPutGraduationRulesResponse>('/api/admin/graduation-rules', body);
  return data.result;
};

// 졸업 요건 세트 목록 조회.
export const getAdminRequirementSets = async (filters: TRequirementSetFilters) => {
  const { data } = await axiosInstance.get<TGetRequirementSetsResponse>('/api/admin/requirement-sets', {
    params: filters,
  });
  return data.result;
};

// 졸업 요건 세트 단건 조회. 연결된 graduationRuleIds prefill에 사용한다.
export const getAdminRequirementSetDetail = async (id: number) => {
  const { data } = await axiosInstance.get<TGetRequirementSetDetailResponse>(`/api/admin/requirement-sets/${id}`);
  return data.result;
};

export const postAdminRequirementSet = async (body: TRequirementSetCreateRequest) => {
  const { data } = await axiosInstance.post<TPostRequirementSetResponse>('/api/admin/requirement-sets', body);
  return data.result;
};

export const putAdminRequirementSet = async (id: number, body: TRequirementSetUpdateRequest) => {
  const { data } = await axiosInstance.put<TPutRequirementSetResponse>(`/api/admin/requirement-sets/${id}`, body);
  return data.result;
};
