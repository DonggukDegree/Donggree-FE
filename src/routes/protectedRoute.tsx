import { Navigate, Outlet, useLocation } from 'react-router-dom';

import Loading from '@/components/common/loading';
import useUserInfo from '@/hooks/user/useUserInfo';

// 2단 라우팅 게이트.
// 1) 인증 게이트: 사용자 정보 조회 실패(미인증) 시 로그인 화면으로 보낸다.
//    (401이면 axios 인터셉터가 refresh를 시도하고, 그래도 실패하면 여기서 /login으로 처리)
// 2) 온보딩 게이트: 온보딩 미완료(studentId === null)면 무조건 온보딩 화면으로 강제하고,
//    완료한 사용자가 온보딩 화면에 진입하면 홈으로 돌려보낸다.
export default function ProtectedRoute() {
  const { data, isPending, isError } = useUserInfo();
  const { pathname } = useLocation();

  // 인증 확인이 끝날 때까지 기존 공용 로딩 컴포넌트를 보여준다.
  // (이 컴포넌트는 Layout의 Outlet 자리에 렌더되므로 Header/Footer 사이를 flex-1로 채운다)
  if (isPending) {
    return <Loading />;
  }

  // 미인증: 로그인 화면으로.
  if (isError || !data) {
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
