/** [울타리치기] 공개 화면에서 로그인 회원인지 확인한다. 비회원이어도 로그인 화면으로 보내지 않는다. */
import useUserInfo from '@/hooks/user/useUserInfo';
import { useAuthStore } from '@/stores/authStore';
import { getMemberIdFromAccessToken } from '@/utils/auth/authRole';

export default function useFenceMember() {
  const user = useUserInfo();
  const token = useAuthStore((s) => s.accessToken);
  const memberId = user.data ? getMemberIdFromAccessToken(token) : null;
  return { memberId, isMember: memberId !== null, isChecking: user.isPending };
}
