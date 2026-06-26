import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import Headset from '@/assets/headset.svg?react';
import Logo from '@/assets/logo.svg?react';
import UserThumb from '@/assets/userThumb.svg?react';
import AdminModeToggle from '@/components/admin/adminModeToggle';
import { KAKAO_CHAT_URL, READY_MESSAGE } from '@/constants/links';

// 졸업 판정만 실제 페이지로 연결하고, 커리큘럼은 아직 미개발이라 토스트로 안내한다.
const NAV_ITEMS = [
  { name: '졸업 판정', type: 'link', path: '/graduation' },
  { name: '커리큘럼', type: 'toast' },
] as const;

const ADMIN_NAV_ITEMS = [
  { name: '과목 관리', path: '/admin/course-classifications' },
  { name: '졸업 요건 관리', path: '/admin/graduation-requirements' },
] as const;

export default function Header() {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith('/admin');
  const navBaseClass = 'rounded-full px-5 py-3 hover:cursor-pointer hover:text-primary-60';

  if (isAdminPage) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-coolgray-10 bg-white text-coolgray-90">
        <div className="flex items-center justify-between px-16 py-2">
          <div className="flex items-center gap-12">
            {/* 일반 헤더와 동일하게 로고 클릭 시 관리자 메인(/admin)으로 이동하도록 Link로 감싼다. */}
            <Link to="/admin">
              <Logo className="hover:cursor-pointer w-40 h-auto" />
            </Link>
            <div className="flex items-center gap-2 text-button-m">
              {ADMIN_NAV_ITEMS.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${navBaseClass} ${
                    pathname === item.path ? 'bg-primary-30 text-primary-90' : 'text-coolgray-90'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          <AdminModeToggle />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-white text-coolgray-90">
      <div className="flex items-center justify-between py-2 px-16">
        <div className="flex items-center gap-12">
          <Link to="/">
            <Logo className="hover:cursor-pointer w-40 h-auto" />
          </Link>
          <div className="flex items-center gap-2 text-button-m">
            {NAV_ITEMS.map((item) =>
              item.type === 'link' ? (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`${navBaseClass} ${
                    pathname === item.path ? 'bg-primary-30 text-primary-90' : 'text-coolgray-90'
                  }`}
                >
                  {item.name}
                </Link>
              ) : (
                // 미개발 기능: 토스트로 준비 중임을 안내한다.
                <button
                  key={item.name}
                  type="button"
                  onClick={() => toast(READY_MESSAGE)}
                  className={`${navBaseClass} text-coolgray-90`}
                >
                  {item.name}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="flex items-center gap-8 text-body-m">
          {/* 고객지원: 카카오 채널 채팅으로 연결 */}
          <a
            href={KAKAO_CHAT_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 py-3 hover:cursor-pointer"
          >
            <Headset className="w-5 h-5" />
            <span>고객지원</span>
          </a>
          <Link to="/my-page" className="flex items-center gap-2 hover:cursor-pointer">
            <UserThumb className="w-8 h-8" />
            <span>마이페이지</span>
          </Link>
          <AdminModeToggle />
        </div>
      </div>
    </header>
  );
}
