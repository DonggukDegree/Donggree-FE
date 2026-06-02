import type { TCommonResponse } from '@/types/common';

// GET /api/users/me 응답
// 로그인만 완료하고 온보딩 전이면 studentId, name, nickname 모두 null로 내려온다.
export type TGetUserInfoResponse = TCommonResponse<{
  studentId: string | null;
  name: string | null;
  nickname: string | null;
  identityVerified: boolean;
}>;
