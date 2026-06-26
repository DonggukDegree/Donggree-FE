import axiosInstance from '@/apis/axiosInstance';
import type { TPostOnboardingRequest } from '@/types/auth/TPostOnboarding';
import type { TCommonResponse } from '@/types/common';

// 카카오 로그인 후 최초 1회 학번/이름을 저장해 회원 정보를 완성한다.
export const postOnboarding = async (body: TPostOnboardingRequest) => {
  const { data } = await axiosInstance.post<TCommonResponse<null>>('/api/users/me/onboarding', body);
  return data;
};

// 리프레시 토큰 쿠키를 삭제해 로그아웃 처리한다.
export const postLogout = async () => {
  const { data } = await axiosInstance.post<TCommonResponse<null>>('/auth/logout');
  return data;
};
