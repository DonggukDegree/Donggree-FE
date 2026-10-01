/** [로그인 > 콜백] URL 정리 후 인증·사용자 확인 결과만 기록 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { getUserInfo } from '@/apis/user/user';
import Loading from '@/components/common/loading';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useAuthStore } from '@/stores/authStore';
import {
  getAnalyticsIdentityGeneration,
  markCallbackSanitized,
  syncAnalyticsIdentity,
  trackEvent,
  trackPageView,
} from '@/utils/analytics';
import { analyticsError } from '@/utils/analyticsError';
import { getRoleFromAccessToken, isAdminRole } from '@/utils/authRole';
import { consumeLoginAttempt } from '@/utils/loginAttempt';
import { resetSurveyPromptForLogin } from '@/utils/surveyPrompt';

// 카카오 OAuth 로그인 성공 후 백엔드가 리다이렉트하는 콜백 페이지.
// 백엔드는 accessToken을 쿼리 파라미터로 직접 전달하고, refreshToken은 HttpOnly 쿠키로 심는다.
export default function AuthCallback() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  // StrictMode에서 useEffect가 두 번 실행되는 것을 막아 토큰 처리/이동이 중복되지 않게 한다.
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const previousRole = getRoleFromAccessToken(useAuthStore.getState().accessToken);
    const failed = Boolean(searchParams.get('error'));
    const accessToken = searchParams.get('accessToken');
    const attemptId = consumeLoginAttempt();
    // 토큰을 로컬 변수에 확보한 뒤 실제 주소와 라우터 상태 모두 정리한다.
    // 어떤 GA 초기화·콜백 조회 기록보다 반드시 먼저 수행한다.
    window.history.replaceState(window.history.state, '', '/login/callback');
    markCallbackSanitized();
    if (accessToken && !failed) setAccessToken(accessToken);
    setSearchParams({}, { replace: true });
    trackPageView('/login/callback', window.history.state?.key ?? 'default');

    if (failed || !accessToken) {
      clearAuth();
      syncAnalyticsIdentity(
        isAdminRole(getRoleFromAccessToken(accessToken) ?? previousRole) ? 'excluded' : 'allowed',
        null,
      );

      trackEvent('login_failure', {
        method: 'kakao',
        attempt_id: attemptId,
        code: failed ? 'LOGIN_FAILED' : 'MISSING_TOKEN',
        status: 0,
      });
      toast.error('로그인에 실패했어요. 다시 시도해주세요.');
      trackEvent('error_shown', { source: 'login', code: failed ? 'LOGIN_FAILED' : 'MISSING_TOKEN', status: 0 });
      navigate('/login', { replace: true });
      return;
    }

    const generation = getAnalyticsIdentityGeneration();
    // 사용자 정보를 조회해 온보딩 여부로 분기한다.
    queryClient
      .fetchQuery({
        queryKey: QUERY_KEYS.GET_USER_INFO,
        queryFn: () => getUserInfo({ passiveAuth: true }),
        staleTime: 0,
        retry: false,
      })
      .then((user) => {
        if (generation !== getAnalyticsIdentityGeneration()) return;
        trackEvent('login_success', { method: 'kakao', attempt_id: attemptId });
        resetSurveyPromptForLogin();
        // 조회 결과를 캐시에 미리 심어, 이동한 페이지에서 useUserInfo가 중복 요청하지 않게 한다.
        queryClient.setQueryData(QUERY_KEYS.GET_USER_INFO, user);
        // studentId가 없으면 온보딩 미완료 → 온보딩으로 강제, 완료 상태면 홈으로.
        navigate(user.studentId === null ? '/onboarding' : '/', { replace: true });
      })
      .catch((error: unknown) => {
        if (generation !== getAnalyticsIdentityGeneration()) return;
        // 조회 실패 시 저장한 토큰을 정리하고 로그인으로 되돌린다.
        const role = getRoleFromAccessToken(accessToken);
        clearAuth();
        syncAnalyticsIdentity(isAdminRole(role) || role === null ? 'excluded' : 'allowed', null);
        trackEvent('login_failure', { method: 'kakao', attempt_id: attemptId, ...analyticsError('login', error) });
        toast.error('사용자 정보를 확인하지 못했어요. 다시 로그인해주세요.');
        trackEvent('error_shown', analyticsError('login', error));
        navigate('/login', { replace: true });
      });
  }, [searchParams, setSearchParams, navigate, queryClient, setAccessToken, clearAuth]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Loading />
    </div>
  );
}
