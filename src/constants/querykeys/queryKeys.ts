export const QUERY_KEYS = {
  GET_USER_INFO: ['users', 'me'] as const,
  GET_USER_REPORTS: ['users', 'me', 'reports'] as const,
  GET_REPORT_SUMMARY: ['reports', 'summary'] as const,
  GET_REPORT_BY_COURSE_TYPE: (courseType: string) => ['reports', { courseType }] as const,
} as const;
