/**
 * [레이아웃] 공통 레이아웃
 * 헤더/푸터 사이에 각 화면(Outlet)을 끼우고, 전역 모달과 스크롤 위치 복원을 함께 얹는다.
 */
import { Outlet, ScrollRestoration } from 'react-router-dom';

import Footer from '@/components/common/footer';
import Header from '@/components/common/header';
import ModalProvider from '@/components/common/modalProvider';
import usePageTracking from '@/hooks/usePageTracking';

export default function Layout() {
  // 라우트 변경마다 GA4 페이지뷰 전송(측정 ID 없으면 no-op).
  usePageTracking();

  return (
    <div className="w-full min-h-dvh flex flex-col">
      <Header />
      <Outlet />
      <Footer />
      <ModalProvider />
      <ScrollRestoration />
    </div>
  );
}
