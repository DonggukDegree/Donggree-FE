/** [마이페이지 > 학교 이메일 인증] API 요청·응답 계약 */
export type TSchoolEmailDeliveryStatus = 'IDLE' | 'QUEUED' | 'SENDING' | 'SENT' | 'FAILED';

export type TSchoolEmailVerification = {
  identityVerified: boolean;
  schoolEmailVerified: boolean;
  schoolEmail: string | null;
  deliveryStatus: TSchoolEmailDeliveryStatus;
  requestId: string | null;
  requestedEmail: string | null;
  expiresInSeconds: number;
  resendAfterSeconds: number;
};

export type TSchoolEmailCodeRequest = { localPart: string };
export type TSchoolEmailCodeVerifyRequest = TSchoolEmailCodeRequest & { code: string };
export type TSchoolEmailCodeResult = {
  email: string;
  expiresInSeconds: number;
  resendAfterSeconds: number;
  requestId: string;
  deliveryStatus: TSchoolEmailDeliveryStatus;
};
