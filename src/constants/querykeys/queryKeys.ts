export const QUERY_KEYS = {
  GET_USER_INFO: ['users', 'me'] as const,
  GET_USER_REPORTS: ['users', 'me', 'reports'] as const,
  // 졸업 판정 리포트(요약·영역상세)를 한 번에 무효화하기 위한 접두사 키.
  REPORTS_ROOT: ['reports'] as const,
  GET_REPORT_SUMMARY: ['reports', 'summary'] as const,
  GET_REPORT_BY_COURSE_TYPE: (courseType: string) => ['reports', { courseType }] as const,
} as const;
