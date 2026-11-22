/** [정각원의 비밀] 계정별로 캐시를 분리해 계정 전환 때 다른 회원의 진행을 보여주지 않는다. */
import { getMysteryToday } from '@/apis/mystery/mystery';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import { useAuthStore } from '@/stores/authStore';
import { getMemberIdFromAccessToken } from '@/utils/auth/authRole';

export default function useMysteryToday() {
  const token = useAuthStore((s) => s.accessToken);
  const memberId = getMemberIdFromAccessToken(token);
  const queryKey = QUERY_KEYS.MYSTERY_TODAY(memberId);
  const query = useCoreQuery(queryKey, ({ signal }) => getMysteryToday(signal), {
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  return { ...query, queryKey, memberId };
}
