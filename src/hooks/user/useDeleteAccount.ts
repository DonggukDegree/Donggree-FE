import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { deleteAccount } from '@/apis/user/user';
import { useCoreMutation } from '@/hooks/customQuery';
import { useAuthStore } from '@/stores/authStore';
import type { TCommonResponse } from '@/types/common';

// 회원 탈퇴 훅.
// 성공 시 로그아웃과 동일하게 인증을 비우고 캐시를 정리한 뒤 홈으로 이동한다.
// (탈퇴 변수가 없으므로 mutation 변수 타입을 void로 지정)
export default function useDeleteAccount() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useCoreMutation<TCommonResponse<null>, void>(() => deleteAccount(), {
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      navigate('/');
    },
  });
}
