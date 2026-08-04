/**
 * [공용] 상단 헤더
 * 모든 화면 위에 고정으로 놓이는 내비게이션. 로그인 상태와 관리자 권한에 따라 메뉴가 달라진다.
 *
 * 반응형: lg 미만(모바일 웹앱 뷰)에서는 가로 메뉴가 들어가지 않아 로고 + 햄버거만 남기고,
 * 나머지 항목은 우측 드로어로 옮긴다. 관리자 헤더는 PC 전용이라 그대로 둔다.
 */
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import Headset from '@/assets/headset.svg?react';
import Logo from '@/assets/logo.svg?react';
import UserThumb from '@/assets/userThumb.svg?react';
import AdminModeToggle from '@/components/admin/common/adminModeToggle';
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

// 모바일 드로어 안 항목 공통 스타일. (가로 배치가 아니라 세로 목록이므로 PC와 모양을 따로 둔다)
const DRAWER_ITEM_CLASS =
  'w-full rounded-lg px-4 py-3 text-left text-button-m hover:cursor-pointer hover:bg-primary-30 hover:text-primary-90';

export default function Header() {
  const { pathname } = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdminPage = pathname.startsWith('/admin');
  const navBaseClass = 'rounded-full px-5 py-3 hover:cursor-pointer hover:text-primary-60';

  // 드로어가 열려 있는 동안 뒤 화면이 같이 스크롤되지 않도록 막는다.
  useEffect(() => {
    if (!isMenuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

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
      <div className="flex items-center justify-between py-2 px-5 lg:px-16">
        <div className="flex items-center gap-12">
          <Link to="/">
            <Logo className="hover:cursor-pointer w-32 lg:w-40 h-auto" />
          </Link>
          {/* 가로 메뉴는 PC 전용. 모바일에서는 아래 드로어가 대신한다. */}
          <div className="hidden lg:flex items-center gap-2 text-button-m">
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
        <div className="hidden lg:flex items-center gap-8 text-body-m">
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

        {/* 모바일 햄버거 버튼 */}
        <button
          type="button"
          aria-label="메뉴 열기"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
          className="lg:hidden p-2 cursor-pointer text-coolgray-90"
        >
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* 모바일 드로어. 열렸을 때만 마운트하고, 배경을 누르면 닫힌다. */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0">
          <button
            type="button"
            aria-label="메뉴 닫기"
            onClick={() => setIsMenuOpen(false)}
            className="absolute inset-0 w-full bg-overlay animate-fade-in cursor-default"
          />
          <nav className="absolute right-0 top-0 h-full w-64 max-w-[80%] bg-white p-4 flex flex-col gap-1 shadow-xl">
            <div className="flex justify-end">
              <button
                type="button"
                aria-label="메뉴 닫기"
                onClick={() => setIsMenuOpen(false)}
                className="p-2 cursor-pointer text-coolgray-60"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* 화면을 이동하면 드로어도 함께 닫는다. (effect 대신 각 항목의 클릭에서 닫는다) */}
            {NAV_ITEMS.map((item) =>
              item.type === 'link' ? (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`${DRAWER_ITEM_CLASS} ${
                    pathname === item.path ? 'bg-primary-30 text-primary-90' : 'text-coolgray-90'
                  }`}
                >
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => {
                    toast(READY_MESSAGE);
                    setIsMenuOpen(false);
                  }}
                  className={`${DRAWER_ITEM_CLASS} text-coolgray-90`}
                >
                  {item.name}
                </button>
              ),
            )}

            <a
              href={KAKAO_CHAT_URL}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsMenuOpen(false)}
              className={`${DRAWER_ITEM_CLASS} flex items-center gap-2 text-coolgray-90`}
            >
              <Headset className="w-5 h-5" />
              <span>고객지원</span>
            </a>
            <Link
              to="/my-page"
              onClick={() => setIsMenuOpen(false)}
              className={`${DRAWER_ITEM_CLASS} flex items-center gap-2 text-coolgray-90`}
            >
              <UserThumb className="w-6 h-6" />
              <span>마이페이지</span>
            </Link>

            {/*
              관리자 계정이 아니면 아무것도 렌더하지 않는다.
              토글로 관리자 화면에 넘어가면 이 헤더가 관리자 분기로 갈려 드로어가 사라지므로,
              body 스크롤 잠금이 남지 않도록 클릭이 올라올 때 열림 상태도 함께 내린다.
            */}
            <div className="mt-2 px-4" onClick={() => setIsMenuOpen(false)}>
              <AdminModeToggle />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
