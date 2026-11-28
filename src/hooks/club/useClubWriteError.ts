/**
 * [동아리] 쓰기 요청 실패 처리
 * 서버가 학생 인증 필요(CLUB403_1)로 막으면 토스트 대신 학생 인증 안내를 띄우고,
 * 그 밖의 실패는 GA 오류(club)로 남긴 뒤 서버 안내 문구(없으면 기본 문구)를 토스트로 보여준다.
 */
import { toast } from 'sonner';

import { ERROR_CODE } from '@/constants/errorCodes';
import { useModalStore } from '@/stores/modalStore';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getErrorCode, getErrorMessage } from '@/utils/error';

export default function useClubWriteError() {
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  return (error: unknown, fallback: string) => {
    if (getErrorCode(error) === ERROR_CODE.CLUB_VERIFICATION_REQUIRED) {
      openStudentVerification('club');
      return;
    }
    trackErrorShown('club', error);
    toast.error(getErrorMessage(error) ?? fallback);
  };
}
