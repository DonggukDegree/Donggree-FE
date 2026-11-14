import type { TCommonResponse } from '@/types/common';

// GET /api/users/me 응답
// 로그인만 완료하고 온보딩 전이면 studentId, name, nickname 모두 null로 내려온다.
export type TUserInfo = {
  studentId: string | null;
  name: string | null;
  nickname: string | null;
  identityVerified: boolean; // PDF 본인인증
  schoolEmailVerified: boolean; // 학교 이메일 인증. 둘 중 하나라도 완료하면 동글맵 쓰기 가능
};

export type TGetUserInfoResponse = TCommonResponse<TUserInfo>;
