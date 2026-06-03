import { getUserReports } from '@/apis/report/report';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// 성적표(학업 리포트) 조회 훅.
// 라우트 게이트와 학업 정보 화면에서 함께 쓰이므로 query 상태 전체를 반환한다.
// 성적표가 없으면 404(TRANSCRIPT404_1)로 isError가 된다. (호출부에서 업로드 유도로 분기)
export default function useUserReports() {
  return useCoreQuery(QUERY_KEYS.GET_USER_REPORTS, () => getUserReports());
}
