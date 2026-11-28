/** [울타리치기] 로그인 회원의 스트릭·완료 수·크기별 최고 기록. 비회원은 요청하지 않는다. */
import { getFenceStatistics } from '@/apis/fence/fence';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

export default function useFenceStatistics(memberId: number | null) {
  const queryKey = QUERY_KEYS.FENCE_STATISTICS(memberId);
  const query = useCoreQuery(queryKey, () => getFenceStatistics(), { enabled: memberId !== null, staleTime: 0 });
  return { ...query, queryKey };
}
