/**
 * [레이아웃] 공통 레이아웃
 * 헤더/푸터 사이에 각 화면(Outlet)을 끼우고, 전역 모달과 스크롤 위치 복원을 함께 얹는다.
 * 화면은 라우트 단위로 코드 분할되어 있어 Suspense 경계가 필요하다.
 *
 * 반응형: lg(1024px) 미만은 모바일 웹앱 뷰라, 본문을 640px(max-w-160) 셸 안에 가운데로 모은다.
 * iPhone은 셸이 화면을 꽉 채우고, iPad 세로(768)처럼 셸보다 넓은 화면은 좌우가 흰 배경으로 남는다.
 * lg 이상에서는 상한을 풀어 기존 PC 레이아웃 그대로 둔다.
 * 단 관리자 화면은 PC 전용이라 셸을 씌우면 표가 오히려 더 좁아지므로 상한에서 제외한다.
 */
import { Suspense } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router-dom';

import Footer from '@/components/common/footer';
import Header from '@/components/common/header';
import Loading from '@/components/common/loading';
import ModalProvider from '@/components/common/modalProvider';
import useAnalyticsIdentity from '@/hooks/useAnalyticsIdentity';
import usePageTracking from '@/hooks/usePageTracking';

export default function Layout() {
  const { pathname } = useLocation();
  // 라우트 변경마다 GA4 페이지뷰 전송(측정 ID 없으면 no-op).
  usePageTracking();
  // 로그인 상태가 바뀔 때마다 GA4 user_id를 갱신한다.
  useAnalyticsIdentity();

  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="w-full min-h-dvh flex flex-col bg-white">
      {/* 셸. flex-1 + flex-col을 이어받아야 화면이 짧은 페이지(404 등)의 flex-1이 그대로 동작한다. */}
      <div className={`mx-auto w-full flex-1 flex flex-col ${isAdminPage ? 'max-w-none' : 'max-w-160 lg:max-w-none'}`}>
        <Header />
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
        <Footer />
      </div>
      {/* 모달·토스트는 셸이 아니라 뷰포트 기준으로 떠야 하므로 셸 밖에 둔다. */}
      <ModalProvider />
      <ScrollRestoration />
    </div>
  );
}
