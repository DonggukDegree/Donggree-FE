import { Outlet } from 'react-router-dom';

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
    </div>
  );
}
