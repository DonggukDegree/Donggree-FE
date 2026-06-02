import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { getUserInfo } from '@/apis/user/user';
import Loading from '@/components/common/loading';
import { useAuthStore } from '@/stores/authStore';

// 카카오 OAuth 로그인 성공 후 백엔드가 리다이렉트하는 콜백 페이지.
// 백엔드는 accessToken을 쿼리 파라미터로 직접 전달하고, refreshToken은 HttpOnly 쿠키로 심는다.
export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  // StrictMode에서 useEffect가 두 번 실행되는 것을 막아 토큰 처리/이동이 중복되지 않게 한다.
  const handledRef = useRef(false);

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const accessToken = searchParams.get('accessToken');
    // 토큰이 없으면 비정상 진입이므로 로그인 화면으로 되돌린다.
    if (!accessToken) {
      navigate('/login', { replace: true });
      return;
    }

    // accessToken을 메모리에 저장하고, 브라우저 히스토리/주소창에 토큰이 남지 않도록
    // 쿼리스트링을 즉시 제거한다. (URL 노출로 인한 토큰 유출 위험 최소화)
    setAccessToken(accessToken);
    window.history.replaceState(null, '', window.location.pathname);

    // 사용자 정보를 조회해 온보딩 여부로 분기한다.
    getUserInfo()
      .then((user) => {
        // studentId가 없으면 온보딩 미완료 → 온보딩으로 강제, 완료 상태면 홈으로.
        navigate(user.studentId === null ? '/onboarding' : '/', { replace: true });
      })
      .catch(() => {
        // 조회 실패 시 저장한 토큰을 정리하고 로그인으로 되돌린다.
        clearAuth();
        navigate('/login', { replace: true });
      });
  }, [searchParams, navigate, setAccessToken, clearAuth]);

  return (
    <div className="min-h-dvh flex flex-col">
      <Loading />
    </div>
  );
}
