import {
  getAdminMember,
  getAdminMembers,
  getAdminPlaceReport,
  getAdminPlaceReports,
  getAdminReviewReport,
  getAdminReviewReports,
} from '@/apis/admin/reports';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import type { TReportStatus } from '@/types/admin/TAdminReport';

// [관리자 > 신고 관리] 신고·회원 조회. 상세는 고른 항목이 있을 때만 요청한다.

export function useAdminPlaceReports(status: TReportStatus | null, page: number) {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_REPORTS('places', { status, page }), () =>
    getAdminPlaceReports({ status, page }),
  );
}

export function useAdminReviewReports(status: TReportStatus | null, page: number) {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_REPORTS('reviews', { status, page }), () =>
    getAdminReviewReports({ status, page }),
  );
}

export function useAdminPlaceReport(reportId: number | null) {
  return useCoreQuery(
    QUERY_KEYS.GET_ADMIN_REPORT('places', reportId ?? 0),
    () => getAdminPlaceReport(reportId as number),
    { enabled: reportId !== null },
  );
}

export function useAdminReviewReport(reportId: number | null) {
  return useCoreQuery(
    QUERY_KEYS.GET_ADMIN_REPORT('reviews', reportId ?? 0),
    () => getAdminReviewReport(reportId as number),
    { enabled: reportId !== null },
  );
}

export function useAdminMembers(keyword: string, page: number) {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_MEMBERS({ keyword, page }), () => getAdminMembers({ keyword, page }));
}

export function useAdminMember(memberId: number | null) {
  return useCoreQuery(QUERY_KEYS.GET_ADMIN_MEMBER(memberId ?? 0), () => getAdminMember(memberId as number), {
    enabled: memberId !== null,
  });
}
