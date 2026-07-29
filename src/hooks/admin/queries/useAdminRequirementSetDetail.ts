import { getAdminRequirementSetDetail } from '@/apis/admin/graduationRequirement';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// 선택한 졸업 요건 세트의 연결 규칙 ID를 조회한다. id가 없으면 호출하지 않는다.
export default function useAdminRequirementSetDetail(id: number | null) {
  return useCoreQuery(
    QUERY_KEYS.GET_ADMIN_REQUIREMENT_SET_DETAIL(id ?? 0),
    () => getAdminRequirementSetDetail(id ?? 0),
    {
      enabled: id !== null,
    },
  );
}
