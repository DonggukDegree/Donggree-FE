import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { patchProfile } from '@/apis/user/user';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import type { TResponseError } from '@/types/common';
import type { TPatchProfileRequest } from '@/types/user/TPatchProfile';

// 프로필 수정 훅.
// 성공 시 사용자 정보 캐시를 무효화하고 안내 토스트를 띄운다(페이지에 머문다).
// onError를 직접 제공하므로(either/or) 코드별로 분기한다.
export default function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useCoreMutation((body: TPatchProfileRequest) => patchProfile(body), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_USER_INFO });
      toast.success('프로필이 수정되었어요.');
    },
    onError: (error: TResponseError) => {
      const code = error.response?.data?.code;

      // 학번 중복은 제출 시점에만 알 수 있어 토스트로 안내.
      if (code === 'USER409_2') {
        toast.error('이미 가입한 학번입니다.');
        return;
      }
      // 본인 인증 후 학번/이름 변경 시도 (UI에서 잠그지만 방어적 안내).
      if (code === 'USER409_3') {
        toast.error('본인 인증 후에는 학번과 이름을 변경할 수 없어요.');
        return;
      }
      // 그 외(온보딩 미완료·회원 없음 등)는 서버 메시지를 토스트로 안내.
      toast.error(error.response?.data?.message ?? '프로필 수정 중 오류가 발생했어요.');
    },
  });
}
