/**
 * [레이아웃] 공통 레이아웃
 * 헤더/푸터 사이에 각 화면(Outlet)을 끼우고, 전역 모달과 스크롤 위치 복원을 함께 얹는다.
 */
import { Outlet, ScrollRestoration } from 'react-router-dom';

import Footer from '@/components/common/footer';
import Header from '@/components/common/header';
import ModalProvider from '@/components/common/modalProvider';

export default function Layout() {
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
