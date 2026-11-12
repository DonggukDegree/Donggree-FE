export const QUERY_KEYS = {
  GET_USER_INFO: ['users', 'me'] as const,
  SCHOOL_EMAIL_VERIFICATION: ['users', 'me', 'school-email-verification'] as const,
  GET_USER_REPORTS: ['users', 'me', 'reports'] as const,
  // 졸업 판정 리포트(요약·영역상세)를 한 번에 무효화하기 위한 접두사 키.
  REPORTS_ROOT: ['reports'] as const,
  GET_REPORT_SUMMARY: ['reports', 'summary'] as const,
  GET_REPORT_BY_COURSE_TYPE: (courseType: string) => ['reports', { courseType }] as const,
  // 동글맵 장소. 등록·수정 후 이 접두사로 목록과 상세를 함께 무효화한다.
  PLACES_ROOT: ['places'] as const,
  GET_PLACES: ['places', 'list'] as const,
  GET_PLACE_DETAIL: (placeId: number) => ['places', 'detail', placeId] as const,
  GET_PLACE_REVIEWS: (placeId: number) => ['places', 'reviews', placeId] as const,
  FAQS_ROOT: ['faqs'] as const,
  GET_FAQS: (tag: string | null) => ['faqs', { tag }] as const,
  ADMIN_ROOT: ['admin'] as const,
  // 신고 관리. 처리·정지 후 목록·상세·회원을 한 번에 무효화하기 위한 접두사 키.
  ADMIN_REPORTS_ROOT: ['admin', 'reports'] as const,
  GET_ADMIN_REPORTS: (target: 'places' | 'reviews', filters: object) => ['admin', 'reports', target, filters] as const,
  GET_ADMIN_REPORT: (target: 'places' | 'reviews', reportId: number) =>
    ['admin', 'reports', target, 'detail', reportId] as const,
  GET_ADMIN_MEMBERS: (filters: object) => ['admin', 'reports', 'members', filters] as const,
  GET_ADMIN_MEMBER: (memberId: number) => ['admin', 'reports', 'members', 'detail', memberId] as const,
  // 신고 관리 하단 전체 목록. 처리 후 ADMIN_REPORTS_ROOT 무효화에 함께 갱신되도록 같은 뿌리에 둔다.
  GET_ADMIN_PLACE_LIST: (filters: object) => ['admin', 'reports', 'place-list', filters] as const,
  GET_ADMIN_REVIEW_LIST: (filters: object) => ['admin', 'reports', 'review-list', filters] as const,
  GET_ADMIN_AREA_TYPES: ['admin', 'area-types'] as const,
  // 관리자 과목 분류 조회를 필터별로 캐시하고, 저장 후에는 이 접두사로 한 번에 무효화한다.
  ADMIN_COURSE_CLASSIFICATIONS_ROOT: ['admin', 'course-classifications'] as const,
  GET_ADMIN_COURSE_CLASSIFICATIONS: (filters: object) => ['admin', 'course-classifications', filters] as const,
  GET_ADMIN_RULE_TYPES: ['admin', 'rule-types'] as const,
  GET_ADMIN_COLLEGES: ['admin', 'colleges'] as const,
  ADMIN_DEPARTMENTS_ROOT: ['admin', 'departments'] as const,
  GET_ADMIN_DEPARTMENTS: (collegeId?: number) => ['admin', 'departments', { collegeId }] as const,
  ADMIN_GRADUATION_RULES_ROOT: ['admin', 'graduation-rules'] as const,
  GET_ADMIN_GRADUATION_RULES: (filters: object) => ['admin', 'graduation-rules', filters] as const,
  ADMIN_REQUIREMENT_SETS_ROOT: ['admin', 'requirement-sets'] as const,
  GET_ADMIN_REQUIREMENT_SETS: (filters: object) => ['admin', 'requirement-sets', filters] as const,
  GET_ADMIN_REQUIREMENT_SET_DETAIL: (id: number) => ['admin', 'requirement-sets', id] as const,
} as const;
