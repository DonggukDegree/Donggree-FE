/** [홈 > 만족도 조사] 본인 인증 완료 회원의 로그인당 1회 자동 모달 */
import { useEffect } from 'react';

import { SATISFACTION_SURVEY_URL } from '@/constants/links';
import useUserInfo from '@/hooks/user/useUserInfo';
import { hasSessionHint, useAuthStore } from '@/stores/authStore';
import { useModalStore } from '@/stores/modalStore';
import { claimSurveyPrompt } from '@/utils/surveyPrompt';

export default function useSurveyPrompt() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const modalType = useModalStore((state) => state.type);
  const hasLoginSession = Boolean(accessToken) || hasSessionHint();
  // 공개 홈에 온 비회원에게는 인증 요청을 보내지 않는다. 저장된 로그인은 기존 갱신 경로를 사용한다.
  const { data: user, isSuccess } = useUserInfo(Boolean(SATISFACTION_SURVEY_URL) && hasLoginSession);

  useEffect(() => {
    const modal = useModalStore.getState();
    if (!hasLoginSession || !isSuccess || !user?.identityVerified) {
      if (modal.type === 'survey') modal.closeModal();
      return;
    }
    if (!SATISFACTION_SURVEY_URL || !accessToken || modalType !== null) return;

    // 홈이 먼저 그려진 뒤 부드럽게 안내한다. StrictMode 재실행·화면 이탈 시 예약을 취소한다.
    const timer = window.setTimeout(() => {
      const current = useModalStore.getState();
      if (current.type === null && claimSurveyPrompt()) current.openSurvey();
    }, 500);
    return () => window.clearTimeout(timer);
  }, [accessToken, hasLoginSession, isSuccess, user?.identityVerified, modalType]);

  useEffect(
    () => () => {
      // 홈을 벗어난 뒤 리포트·관리자 화면까지 자동 모달이 따라가지 않도록 정리한다.
      const modal = useModalStore.getState();
      if (modal.type === 'survey') modal.closeModal();
    },
    [],
  );
}
