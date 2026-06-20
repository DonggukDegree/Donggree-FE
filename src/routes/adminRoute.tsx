import { Navigate, Outlet } from 'react-router-dom';

import useCurrentRole from '@/hooks/auth/useCurrentRole';
import { isAdminRole } from '@/utils/authRole';

// 관리자 라우트 게이트. 인증/온보딩은 ProtectedRoute가 먼저 처리하고, 여기서는 JWT role 클레임만 확인한다.
export default function AdminRoute() {
  const role = useCurrentRole();

  if (!isAdminRole(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
