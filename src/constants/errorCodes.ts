// 서버 응답 봉투의 에러 코드 중, 프론트에서 분기에 사용하는 것만 의미 있는 이름으로 모은다.
export const ERROR_CODE = {
  ALREADY_ONBOARDED: 'USER409_1', // 이미 온보딩이 완료된 회원
  DUPLICATE_STUDENT_ID: 'USER409_2', // 이미 사용 중인 학번
  IDENTITY_LOCKED: 'USER409_3', // 본인 인증 후 학번/이름 변경 불가
  SCHOOL_EMAIL_CODE_MISMATCH: 'EMAIL400_4', // 학교 이메일 인증 코드 불일치
  SCHOOL_EMAIL_CODE_EXPIRED: 'EMAIL400_3', // 학교 이메일 인증 코드 만료
  SCHOOL_EMAIL_ATTEMPT_LIMIT: 'EMAIL429_2', // 학교 이메일 인증 시도 횟수 초과
  INVALID_GRADE: 'TRANSCRIPT400_4', // 허용되지 않은 이수구분/성적 값
  NO_GRADUATION_REPORT: 'GRADUATION404_1', // 학업 리포트 없음
  NO_REQUIREMENT: 'GRADUATION404_2', // 적용 가능한 졸업 요건 없음
  PLACE_VERIFICATION_REQUIRED: 'PLACE403_1', // 동글맵 쓰기에 학생 인증 필요
  PLACE_OUT_OF_SERVICE_AREA: 'PLACE400_1', // 캠퍼스 반경 밖 장소 등록
  PLACE_DUPLICATE: 'PLACE409_1', // 반경 50m 안 같은 이름 장소
  PLACE_EDIT_CONFLICT: 'PLACE409_2', // 장소 정보를 다른 회원이 먼저 수정
} as const;
