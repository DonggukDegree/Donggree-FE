import { getAdminAreaTypes } from '@/apis/admin/courseClassification';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// 과목 분류 필터와 저장 폼에서 공통으로 사용하는 이수 영역 목록.
export default function useAdminAreaTypes() {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_AREA_TYPES, () => getAdminAreaTypes());
}
