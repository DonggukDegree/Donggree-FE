import { getAdminRuleTypes } from '@/apis/admin/graduationRequirement';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// 졸업 규칙 종류 조회 훅. 규칙별 폼 분기와 필터 선택지로 사용한다.
export default function useAdminRuleTypes() {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_RULE_TYPES, () => getAdminRuleTypes());
}
