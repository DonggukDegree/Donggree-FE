/**
 * [관리자] 화면 오른쪽 아래의 관리자 모드 전환 버튼
 * 관리자 계정에서만 노출되며, 헤더 폭을 차지하지 않고 학생/관리자 화면 사이를 오간다.
 */
import { useLocation, useNavigate } from 'react-router-dom';

import useCurrentRole from '@/hooks/auth/useCurrentRole';
import { isAdminRole } from '@/utils/auth/authRole';

// ADMIN/SUPER_ADMIN 사용자에게만 보이는 학생/관리자 화면 전환 버튼.
export default function AdminModeToggle() {
  const role = useCurrentRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith('/admin');

  if (!isAdminRole(role)) return null;

  return (
    <button
      type="button"
      aria-label={isAdminPage ? '학생 화면으로 전환' : '관리자 화면으로 전환'}
      onClick={() => navigate(isAdminPage ? '/' : '/admin/course-classifications')}
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-primary-60/30 bg-white px-4 py-2 text-button-s whitespace-nowrap text-primary-90 shadow-[0_4px_14px_rgba(17,24,39,0.12)] hover:bg-primary-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-60 lg:right-6 lg:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
        <path d="M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {isAdminPage ? '학생 화면' : '관리자 화면'}
    </button>
  );
}
