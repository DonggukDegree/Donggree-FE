import { getReportDetail } from '@/apis/report/report';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import type { TCourseType } from '@/types/course';

// courseType별 영역 상세 조회 훅.
// 탭뷰에서 활성 탭의 courseType으로만 호출되어, 활성 탭 데이터만 조회한다(지연 로딩).
// courseType이 queryKey에 포함되므로 탭별로 캐시되어 재방문 시 즉시 표시된다.
export default function useReportDetail(courseType: TCourseType) {
  return useCoreQuery(QUERY_KEYS.GET_REPORT_BY_COURSE_TYPE(courseType), () => getReportDetail(courseType));
}
