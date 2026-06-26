import type { TGetUserInfoResponse } from '@/types/user/TGetUserInfo';

// PATCH /api/users/me 요청 바디 (모두 필수). 본인 인증 후에는 학번/이름 변경 불가(서버 409 USER409_3).
export type TPatchProfileRequest = {
  studentId: string;
  name: string;
  nickname: string;
};

// 응답 result는 GET /api/users/me와 동형(studentId/name/nickname/identityVerified)이라 재사용한다.
export type TPatchProfileResponse = TGetUserInfoResponse;
