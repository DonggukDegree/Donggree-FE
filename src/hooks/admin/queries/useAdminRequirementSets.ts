import { getAdminRequirementSets } from '@/apis/admin/graduationRequirement';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import type { TRequirementSetFilters } from '@/types/admin/TRequirementSets';

// 졸업 요건 세트 목록 조회 훅. departmentId/year 필터별로 캐시를 분리한다.
export default function useAdminRequirementSets(filters: TRequirementSetFilters) {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_REQUIREMENT_SETS(filters), () => getAdminRequirementSets(filters));
}
