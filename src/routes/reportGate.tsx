import { Navigate, Outlet } from 'react-router-dom';

import Loading from '@/components/common/loading';
import useUserReports from '@/hooks/report/useUserReports';
import NotFound from '@/pages/notFound';
import ServerError from '@/pages/serverError';
import { getErrorStatus } from '@/utils/error';

// 리포트(성적표) 존재 게이트.
// ProtectedRoute(인증·온보딩) 통과 후, 성적표 유무로 한 번 더 분기한다.
// - 조회 중: 로딩
// - 성적표 없음(404 TRANSCRIPT404_1): 업로드 화면으로 유도
// - 그 외 에러: NotFound
// - 성적표 있음: 통과(졸업 판정 등 렌더)
export default function ReportGate() {
  const { isPending, isError, error, refetch, isFetching } = useUserReports();

  // 최초 조회 중이거나, 에러 화면에서 "다시 시도"로 재요청이 진행 중일 때 로딩을 보여준다.
  if (isPending || (isError && isFetching)) {
    return <Loading />;
  }

  if (isError) {
    const status = getErrorStatus(error);
    // 미업로드(404)는 정상 흐름이므로 업로드로 보낸다.
    if (status === 404) {
      return <Navigate to="/upload" replace />;
    }
    // 서버 다운(응답 없음)·서버 오류(5xx)는 에러 화면으로 안내한다.
    if (!status || status >= 500) {
      return <ServerError onRetry={() => refetch()} />;
    }
    // 그 외 예기치 못한 오류는 NotFound로 처리한다.
    return <NotFound />;
  }

  return <Outlet />;
}
