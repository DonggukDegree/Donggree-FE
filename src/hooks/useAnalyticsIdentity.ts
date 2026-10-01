/** [공통 > 분석] 인증·학과 속성을 모든 화면에서 동기화 */
import type { QueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { getUserReports } from '@/apis/report/report';
import { getUserInfo } from '@/apis/user/user';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreQuery } from '@/hooks/customQuery';
import { hasSessionHint, useAuthStore } from '@/stores/authStore';
import { resetAnalyticsIdentity, syncAnalyticsIdentity } from '@/utils/analytics';
import { getMemberIdFromAccessToken, getRoleFromAccessToken, isAdminRole } from '@/utils/authRole';

// React effect보다 먼저 차단해 로그아웃·계정 전환 직후의 자동 전송도 막는다.
export const observeAnalyticsIdentity = (queryClient: QueryClient) =>
  useAuthStore.subscribe((state, previous) => {
    const oldMember = getMemberIdFromAccessToken(previous.accessToken);
    const newMember = getMemberIdFromAccessToken(state.accessToken);
    if (
      oldMember === newMember &&
      getRoleFromAccessToken(previous.accessToken) === getRoleFromAccessToken(state.accessToken)
    )
      return;
    resetAnalyticsIdentity(oldMember !== null);
    if (oldMember !== null && oldMember !== newMember) {
      void queryClient.cancelQueries({ queryKey: QUERY_KEYS.GET_USER_INFO });
      void queryClient.cancelQueries({ queryKey: QUERY_KEYS.REPORTS_ROOT });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.GET_USER_INFO });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.REPORTS_ROOT });
    }
  });

export default function useAnalyticsIdentity() {
  const token = useAuthStore((state) => state.accessToken);
  const memberId = getMemberIdFromAccessToken(token);
  const role = getRoleFromAccessToken(token);
  const admin = isAdminRole(role);
  const sessionExpected = Boolean(token) || hasSessionHint();
  const user = useCoreQuery(QUERY_KEYS.GET_USER_INFO, ({ signal }) => getUserInfo({ signal, passiveAuth: true }), {
    enabled: sessionExpected && !admin,
    retry: false,
  });
  const reportsEnabled = Boolean(token && role === 'STUDENT' && user.isSuccess && user.data?.studentId);
  const reports = useCoreQuery(QUERY_KEYS.GET_USER_REPORTS, ({ signal }) => getUserReports(signal, true), {
    enabled: reportsEnabled,
    retry: false,
  });

  useEffect(() => {
    if (admin) {
      syncAnalyticsIdentity('excluded', null);
      return;
    }
    if (!sessionExpected) {
      syncAnalyticsIdentity('allowed', null);
      return;
    }
    // 권한·사용자 확인 실패를 익명 사용자로 추측하지 않는다.
    if (!token || role !== 'STUDENT' || !user.isSuccess || (reportsEnabled && reports.isPending)) {
      syncAnalyticsIdentity('pending', null);
      return;
    }
    const meta = reportsEnabled && reports.isSuccess ? reports.data?.meta : undefined;
    syncAnalyticsIdentity('allowed', memberId, {
      department: meta?.department ?? null,
      college_name: meta?.collegeName ?? null,
      admission_year: meta?.admissionYear ? String(meta.admissionYear) : null,
    });
  }, [
    admin,
    sessionExpected,
    token,
    role,
    memberId,
    user.isSuccess,
    reportsEnabled,
    reports.isPending,
    reports.isSuccess,
    reports.data,
  ]);
}
