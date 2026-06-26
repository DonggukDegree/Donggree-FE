import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { postLogout } from '@/apis/auth/auth';
import { useCoreMutation } from '@/hooks/customQuery';
import { useAuthStore } from '@/stores/authStore';
import type { TCommonResponse } from '@/types/common';

// 로그아웃 훅.
// 성공 시 메모리의 accessToken을 비우고, 쿼리 캐시를 정리한 뒤 로그인 화면으로 이동한다.
// 호출 시 별도 변수가 필요 없으므로 mutation 변수 타입을 void로 지정한다. (logout() 형태로 호출)
export default function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useCoreMutation<TCommonResponse<null>, void>(() => postLogout(), {
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate('/');
    },
  });
}
