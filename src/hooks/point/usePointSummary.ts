import { getPointSummary } from '@/apis/point/point';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// [포인트] 내 총 포인트. 적립이 활동 뒤 비동기로 반영되므로 화면에 들어올 때마다 다시 받는다.
export default function usePointSummary() {
  return useCoreQuery(QUERY_KEYS.GET_POINT_SUMMARY, () => getPointSummary(), { staleTime: 0 });
}
