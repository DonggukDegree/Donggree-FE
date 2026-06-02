import axiosInstance from '@/apis/axiosInstance';
import type { TGetUserInfoResponse } from '@/types/user/TGetUserInfo';

// 로그인한 사용자 정보 조회
export const getUserInfo = async () => {
  const { data } = await axiosInstance.get<TGetUserInfoResponse>('/api/users/me');
  return data.result;
};
