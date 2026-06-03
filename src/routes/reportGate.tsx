import { Navigate, Outlet } from 'react-router-dom';

import Loading from '@/components/common/loading';
import useUserReports from '@/hooks/report/useUserReports';
import NotFound from '@/pages/notFound';

// 리포트(성적표) 존재 게이트.
// ProtectedRoute(인증·온보딩) 통과 후, 성적표 유무로 한 번 더 분기한다.
// - 조회 중: 로딩
// - 성적표 없음(404 TRANSCRIPT404_1): 업로드 화면으로 유도
// - 그 외 에러: NotFound
// - 성적표 있음: 통과(졸업 판정 등 렌더)
export default function ReportGate() {
  const { isPending, isError, error } = useUserReports();

  if (isPending) {
    return <Loading />;
  }

  if (isError) {
    // 미업로드(404)는 정상 흐름이므로 업로드로 보낸다.
    if (error.response?.status === 404) {
      return <Navigate to="/upload" replace />;
    }
    // 예기치 못한 오류는 NotFound로 처리한다.
    return <NotFound />;
  }

  return <Outlet />;
}
