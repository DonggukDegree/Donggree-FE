import { getAdminColleges } from '@/apis/admin/graduationRequirement';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// 졸업 요건 세트 필터/등록 폼의 단과대 드롭다운 선택지 조회.
export default function useAdminColleges() {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_COLLEGES, getAdminColleges);
}
