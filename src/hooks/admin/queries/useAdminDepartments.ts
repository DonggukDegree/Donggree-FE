import { getAdminDepartments } from '@/apis/admin/graduationRequirement';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// 단과대 선택 시 해당 단과대의 학과만, 미선택 시 전체 학과를 조회한다.
export default function useAdminDepartments(collegeId?: number) {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_DEPARTMENTS(collegeId), () => getAdminDepartments(collegeId));
}
