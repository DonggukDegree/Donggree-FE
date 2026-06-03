import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

import { postOnboarding } from '@/apis/auth/auth';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TPostOnboardingRequest } from '@/types/auth/TPostOnboarding';

// 온보딩 정보 저장 훅
// 성공 시 사용자 정보 캐시를 무효화하고(온보딩 완료 반영) 홈으로 이동시킨다.
export default function useOnboarding() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useCoreMutation((body: TPostOnboardingRequest) => postOnboarding(body), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_INFO });
      navigate('/');
    },
  });
}
