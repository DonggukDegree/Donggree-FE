/** [마이페이지 > 학교 이메일 인증] 학교 도메인은 백엔드에서 결합한다. */
import axiosInstance from '@/apis/axiosInstance';
import type { TCommonResponse } from '@/types/common';
import type {
  TSchoolEmailCodeRequest,
  TSchoolEmailCodeResult,
  TSchoolEmailCodeVerifyRequest,
  TSchoolEmailVerification,
} from '@/types/user/TSchoolEmailVerification';

const ENDPOINT = '/api/users/me/school-email-verification';

export const getSchoolEmailVerification = async () => {
  const { data } = await axiosInstance.get<TCommonResponse<TSchoolEmailVerification>>(ENDPOINT);
  return data.result;
};

export const requestSchoolEmailCode = async (body: TSchoolEmailCodeRequest) => {
  const { data } = await axiosInstance.post<TCommonResponse<TSchoolEmailCodeResult>>(`${ENDPOINT}/codes`, body);
  return data.result;
};

export const verifySchoolEmailCode = async (body: TSchoolEmailCodeVerifyRequest) => {
  const { data } = await axiosInstance.post<TCommonResponse<null>>(`${ENDPOINT}/confirm`, body);
  return data.result;
};
