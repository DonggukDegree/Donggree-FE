import axiosInstance from '@/apis/axiosInstance';
import type { TCommonResponse } from '@/types/common';
import type { TGetUserInfoResponse } from '@/types/user/TGetUserInfo';
import type { TPatchProfileRequest, TPatchProfileResponse } from '@/types/user/TPatchProfile';

// 로그인한 사용자 정보 조회
export const getUserInfo = async () => {
  const { data } = await axiosInstance.get<TGetUserInfoResponse>('/api/users/me');
  return data.result;
};

// 프로필 수정 (학번·이름·닉네임). 본인 인증 후 학번/이름 변경 시 409(USER409_3), 학번 중복 시 409(USER409_2).
export const patchProfile = async (body: TPatchProfileRequest) => {
  const { data } = await axiosInstance.patch<TPatchProfileResponse>('/api/users/me', body);
  return data.result;
};

// 회원 탈퇴 (soft-delete).
export const deleteAccount = async () => {
  const { data } = await axiosInstance.delete<TCommonResponse<null>>('/api/users/me');
  return data;
};
