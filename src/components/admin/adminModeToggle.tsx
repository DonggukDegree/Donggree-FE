import { useLocation, useNavigate } from 'react-router-dom';

import Toggle from '@/components/common/toggle';
import useCurrentRole from '@/hooks/auth/useCurrentRole';
import { isAdminRole } from '@/utils/authRole';

// ADMIN/SUPER_ADMIN 사용자에게만 보이는 학생/관리자 화면 전환 토글.
export default function AdminModeToggle() {
  const role = useCurrentRole();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith('/admin');

  if (!isAdminRole(role)) return null;

  const handleChange = (checked: boolean) => {
    navigate(checked ? '/admin/course-classifications' : '/');
  };

  return (
    <div className="flex items-center gap-2 rounded-full border border-primary-60/30 bg-primary-30 px-4 py-2">
      <span className={`text-body-xs ${isAdminPage ? 'text-coolgray-60' : 'text-primary-90'}`}>학생</span>
      <Toggle checked={isAdminPage} onChange={handleChange} />
      <span className={`text-body-xs ${isAdminPage ? 'text-primary-90' : 'text-coolgray-60'}`}>관리자</span>
    </div>
  );
}
