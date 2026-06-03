import { getReportSummary } from '@/apis/report/report';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';

// 졸업 달성률 요약 조회 훅.
// 리포트 없음(GRADUATION404_1)·요건 없음(GRADUATION404_2)이면 isError가 된다. (호출부에서 분기)
export default function useReportSummary() {
  return useCoreQuery(QUERY_KEYS.GET_REPORT_SUMMARY, () => getReportSummary());
}
