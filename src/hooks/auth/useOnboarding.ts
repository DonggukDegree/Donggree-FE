import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { postOnboarding } from '@/apis/auth/auth';
import { ERROR_CODE } from '@/constants/errorCodes';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import { useModalStore } from '@/stores/modalStore';
import type { TPostOnboardingRequest } from '@/types/auth/TPostOnboarding';
import type { TResponseError } from '@/types/common';
import { getErrorCode, getErrorMessage } from '@/utils/error';

// 온보딩 정보 저장 훅
// 성공 시 사용자 정보 캐시를 무효화하고(온보딩 완료 반영) 홈으로 이동시킨다.
// onError를 직접 제공하므로(either/or) 공용 기본 토스트 대신 코드별로 분기 처리한다.
export default function useOnboarding() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const closeModal = useModalStore((state) => state.closeModal);

  return useCoreMutation((body: TPostOnboardingRequest) => postOnboarding(body), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_INFO });
      navigate('/');
    },
    onError: (error: TResponseError) => {
      const code = getErrorCode(error);

      // 이미 온보딩 완료된 회원(다른 탭에서 먼저 완료한 레이스 등): 입력을 저장하지 않고 모달을 닫은 뒤 홈으로 보낸다.
      if (code === ERROR_CODE.ALREADY_ONBOARDED) {
        closeModal();
        navigate('/');
        return;
      }

      // 학번 중복은 제출 시점에만 알 수 있으므로 토스트로 안내한다.
      if (code === ERROR_CODE.DUPLICATE_STUDENT_ID) {
        toast.error('이미 가입한 학번입니다.');
        return;
      }

      // 그 외(회원 없음 등 예기치 못한 경우)는 서버 메시지를 토스트로 안내한다.
      toast.error(getErrorMessage(error) ?? '온보딩 처리 중 오류가 발생했어요.');
    },
  });
}
