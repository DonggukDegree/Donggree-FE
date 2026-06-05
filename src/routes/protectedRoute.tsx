import { Navigate, Outlet, useLocation } from 'react-router-dom';

import Loading from '@/components/common/loading';
import useUserInfo from '@/hooks/user/useUserInfo';
import ServerError from '@/pages/serverError';

// 2단 라우팅 게이트.
// 1) 인증 게이트: 사용자 정보 조회 실패 시 분기.
//    - 응답 없음(서버 다운)·5xx → 에러 화면(미인증과 구분)
//    - 4xx(미인증 등) → 로그인 화면 (401이면 axios 인터셉터가 refresh를 먼저 시도)
// 2) 온보딩 게이트: 온보딩 미완료(studentId === null)면 무조건 온보딩 화면으로 강제하고,
//    완료한 사용자가 온보딩 화면에 진입하면 홈으로 돌려보낸다.
export default function ProtectedRoute() {
  const { data, isPending, isError, error, refetch } = useUserInfo();
  const { pathname } = useLocation();

  // 인증 확인이 끝날 때까지 기존 공용 로딩 컴포넌트를 보여준다.
  // (이 컴포넌트는 Layout의 Outlet 자리에 렌더되므로 Header/Footer 사이를 flex-1로 채운다)
  if (isPending) {
    return <Loading />;
  }

  if (isError || !data) {
    // 서버 다운(응답 없음)·서버 오류(5xx)는 로그인이 아니라 에러 화면으로 안내한다.
    const status = error?.response?.status;
    if (!status || status >= 500) {
      return <ServerError onRetry={() => refetch()} />;
    }
    // 그 외(4xx, 미인증 등)는 로그인 화면으로.
    return <Navigate to="/login" replace />;
  }

  const needsOnboarding = data.studentId === null;
  const onOnboardingPage = pathname === '/onboarding';

  // 온보딩 미완료자는 온보딩 화면에서만 머무를 수 있다. (스킵 불가)
  if (needsOnboarding && !onOnboardingPage) {
    return <Navigate to="/onboarding" replace />;
  }
  // 이미 온보딩을 마친 사용자는 온보딩 화면에 들어올 수 없다.
  if (!needsOnboarding && onOnboardingPage) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
