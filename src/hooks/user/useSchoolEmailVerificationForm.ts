/** [마이페이지 > 학교 이메일 인증] 입력·발송·코드 확인·대기시간 제어 */
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { requestSchoolEmailCode, verifySchoolEmailCode } from '@/apis/user/schoolEmailVerification';
import { ERROR_CODE } from '@/constants/errorCodes';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import useSchoolEmailVerification from '@/hooks/user/useSchoolEmailVerification';
import type { TSchoolEmailVerification } from '@/types/user/TSchoolEmailVerification';
import { trackEvent } from '@/utils/analytics/analytics';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getErrorCode, getErrorMessage } from '@/utils/error';
import {
  remainingSeconds,
  SCHOOL_EMAIL_DOMAIN,
  validateSchoolEmailCode,
  validateSchoolEmailLocalPart,
} from '@/utils/user/schoolEmailVerification';

export default function useSchoolEmailVerificationForm() {
  const queryClient = useQueryClient();
  const [localPart, setLocalPart] = useState('');
  const [code, setCode] = useState('');
  const [emailError, setEmailError] = useState('');
  const [codeError, setCodeError] = useState('');
  const [isCodeLocked, setCodeLocked] = useState(false);
  const confirmInFlight = useRef(false);
  // 페이지가 수행하는 단일 폴링 결과를 구독한다.
  const statusQuery = useSchoolEmailVerification(false);
  const status = statusQuery.data;
  const requestedLocalPart = status?.requestedEmail?.slice(0, -SCHOOL_EMAIL_DOMAIN.length) ?? '';
  const isDeliveryPending = status?.deliveryStatus === 'QUEUED' || status?.deliveryStatus === 'SENDING';
  const deliveryFailed = status?.deliveryStatus === 'FAILED';
  const [now, setNow] = useState(() => Date.now());
  const deliveryEvent = useRef('');
  const resendRequest = useRef(false);

  useEffect(() => {
    if (!requestedLocalPart) return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [requestedLocalPart]);

  useEffect(() => {
    if (!status?.requestId || deliveryEvent.current === status.requestId) return;
    if (status.deliveryStatus === 'SENT') {
      deliveryEvent.current = status.requestId;
      trackEvent(resendRequest.current ? 'school_email_code_resent' : 'school_email_code_sent');
    } else if (status.deliveryStatus === 'FAILED') {
      deliveryEvent.current = status.requestId;
      trackEvent('school_email_delivery_failure');
    }
  }, [status?.requestId, status?.deliveryStatus]);

  const request = useCoreMutation(requestSchoolEmailCode, {
    onSuccess: async (result) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEYS.SCHOOL_EMAIL_VERIFICATION });
      resendRequest.current = Boolean(requestedLocalPart);
      setCode('');
      setCodeError('');
      setCodeLocked(false);
      // 접수 응답은 실제 발송 성공과 구분하며, 진행 중에만 상태를 주기적으로 조회한다.
      queryClient.setQueryData<TSchoolEmailVerification>(QUERY_KEYS.SCHOOL_EMAIL_VERIFICATION, (previous) =>
        previous
          ? {
              ...previous,
              requestedEmail: result.email,
              requestId: result.requestId,
              deliveryStatus: result.deliveryStatus,
              expiresInSeconds: 0,
              resendAfterSeconds: result.resendAfterSeconds,
            }
          : previous,
      );
      trackEvent('school_email_code_queued');
    },
    onError: (error) => {
      // 응답이 유실됐더라도 이미 접수된 작업이 있으면 상태 조회로 복구한다.
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_EMAIL_VERIFICATION });
      toast.error(getErrorMessage(error) ?? '발송 요청을 처리하지 못했습니다. 다시 시도해주세요.');
      trackErrorShown('school_email_verification', error);
    },
  });

  const confirm = useCoreMutation(verifySchoolEmailCode, {
    onSuccess: async () => {
      trackEvent('school_email_verification_success');
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.SCHOOL_EMAIL_VERIFICATION });
      toast.success('학교 이메일 인증이 완료되었어요.');
    },
    onError: (error) => {
      const errorCode = getErrorCode(error);
      const message =
        errorCode === ERROR_CODE.SCHOOL_EMAIL_CODE_MISMATCH
          ? '인증 코드가 일치하지 않아요. 다시 입력해주세요.'
          : (getErrorMessage(error) ?? '인증을 확인하지 못했어요. 다시 입력해주세요.');
      setCode('');
      setCodeError(message);
      setCodeLocked(
        errorCode === ERROR_CODE.SCHOOL_EMAIL_CODE_EXPIRED || errorCode === ERROR_CODE.SCHOOL_EMAIL_ATTEMPT_LIMIT,
      );
      trackEvent('school_email_verification_failure');
      trackErrorShown('school_email_verification', error);
      toast.error(message);
    },
    onSettled: () => {
      confirmInFlight.current = false;
    },
  });

  const sent = status?.deliveryStatus === 'SENT';
  const clock = Math.max(now, statusQuery.dataUpdatedAt);
  const resendSeconds = !deliveryFailed
    ? remainingSeconds(statusQuery.dataUpdatedAt + (status?.resendAfterSeconds ?? 0) * 1000, clock)
    : 0;
  const expirySeconds = sent
    ? remainingSeconds(statusQuery.dataUpdatedAt + (status?.expiresInSeconds ?? 0) * 1000, clock)
    : 0;
  const isBusy = request.isPending || confirm.isPending;

  const changeLocalPart = (value: string) => {
    setLocalPart(value);
    setEmailError('');
    setCode('');
    setCodeError('');
  };

  const requestCode = () => {
    const target = requestedLocalPart || localPart;
    const error = validateSchoolEmailLocalPart(target);
    setEmailError(error);
    if (error || isBusy || resendSeconds > 0) return;
    request.mutate({ localPart: target });
  };

  const verifyCode = (value: string) => {
    const error = validateSchoolEmailCode(value);
    setCodeError(error);
    if (error || isBusy || confirmInFlight.current || isCodeLocked || !requestedLocalPart || expirySeconds === 0)
      return;
    confirmInFlight.current = true;
    trackEvent('school_email_verification_start');
    confirm.mutate({ localPart: requestedLocalPart, code: value });
  };

  return {
    localPart,
    code,
    emailError,
    codeError,
    requestedLocalPart,
    resendSeconds,
    expirySeconds,
    isBusy,
    isRequesting: request.isPending,
    isConfirming: confirm.isPending,
    isConfirmed: confirm.isSuccess,
    isCodeLocked,
    isDeliveryPending,
    deliveryFailed,
    changeLocalPart,
    changeCode: (value: string) => {
      if (isBusy || confirmInFlight.current || isCodeLocked || expirySeconds === 0) return;
      setCode(value);
      setCodeError('');
      if (value.length === 6) verifyCode(value);
    },
    requestCode,
  };
}
