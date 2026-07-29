import { getAdminGraduationRules } from '@/apis/admin/graduationRequirement';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import type { TGraduationRuleFilters } from '@/types/admin/TGetGraduationRules';

// 관리자 졸업 규칙 목록 조회. 필터 객체를 query key에 포함해 필터별 캐시를 분리한다.
export default function useAdminGraduationRules(filters: TGraduationRuleFilters) {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_GRADUATION_RULES(filters), () => getAdminGraduationRules(filters));
}
