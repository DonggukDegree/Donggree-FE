export const QUERY_KEYS = {
  GET_USER_INFO: ['users', 'me'] as const,
  GET_USER_REPORTS: ['users', 'me', 'reports'] as const,
  // 졸업 판정 리포트(요약·영역상세)를 한 번에 무효화하기 위한 접두사 키.
  REPORTS_ROOT: ['reports'] as const,
  GET_REPORT_SUMMARY: ['reports', 'summary'] as const,
  GET_REPORT_BY_COURSE_TYPE: (courseType: string) => ['reports', { courseType }] as const,
  ADMIN_ROOT: ['admin'] as const,
  GET_ADMIN_AREA_TYPES: ['admin', 'area-types'] as const,
  // 관리자 과목 분류 조회를 필터별로 캐시하고, 저장 후에는 이 접두사로 한 번에 무효화한다.
  ADMIN_COURSE_CLASSIFICATIONS_ROOT: ['admin', 'course-classifications'] as const,
  GET_ADMIN_COURSE_CLASSIFICATIONS: (filters: object) => ['admin', 'course-classifications', filters] as const,
} as const;
