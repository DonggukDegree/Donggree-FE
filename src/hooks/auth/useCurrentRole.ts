import { useAuthStore } from '@/stores/authStore';
import { getRoleFromAccessToken } from '@/utils/authRole';

// accessToken은 메모리 zustand store에만 저장되므로, 헤더/라우트 게이트에서 role 클레임을 즉시 계산해 사용한다.
export default function useCurrentRole() {
  const accessToken = useAuthStore((state) => state.accessToken);
  return getRoleFromAccessToken(accessToken);
}
