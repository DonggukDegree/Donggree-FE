/**
 * [정각원의 비밀] 오늘의 사건 조회
 * 공개 화면이라 로그인 여부를 먼저 확인하고, 회원은 계정별 캐시로 서버 진행을, 비회원은 진행 토큰으로 같은 사건을 받는다.
 * 계정 전환 때 다른 회원·비회원의 진행을 보여주지 않도록 캐시 키를 나눈다.
 */
import { getMysteryGuestToday, getMysteryToday } from '@/apis/mystery/mystery';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import useUserInfo from '@/hooks/user/useUserInfo';
import { useAuthStore } from '@/stores/authStore';
import { getMemberIdFromAccessToken } from '@/utils/auth/authRole';
import { readGuestProgress, saveGuestProgress } from '@/utils/mystery/mysteryGuestProgress';

export default function useMysteryToday() {
  const user = useUserInfo();
  const token = useAuthStore((s) => s.accessToken);
  const isChecking = user.isPending;
  const isGuest = !isChecking && !user.data;
  const memberId = user.data ? getMemberIdFromAccessToken(token) : null;
  const queryKey = isGuest ? QUERY_KEYS.MYSTERY_GUEST_TODAY : QUERY_KEYS.MYSTERY_TODAY(memberId);
  const query = useCoreQuery(
    queryKey,
    async ({ signal }) => {
      if (!isGuest) return getMysteryToday(signal);
      const guest = await getMysteryGuestToday(readGuestProgress(), signal);
      saveGuestProgress(guest.progressToken);
      return guest.today;
    },
    { staleTime: 0, refetchOnWindowFocus: true, enabled: !isChecking },
  );
  return { ...query, isPending: query.isPending || isChecking, queryKey, memberId, isGuest };
}
