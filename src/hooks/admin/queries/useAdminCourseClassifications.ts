import { getAdminCourseClassifications } from '@/apis/admin/courseClassification';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import type { TCourseClassificationFilters } from '@/types/admin/TGetCourseClassifications';

// 관리자 과목 분류 목록 조회. 필터 객체를 query key에 포함해 필터별 캐시를 분리한다.
export default function useAdminCourseClassifications(filters: TCourseClassificationFilters) {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_COURSE_CLASSIFICATIONS(filters), () =>
    getAdminCourseClassifications(filters),
  );
}
