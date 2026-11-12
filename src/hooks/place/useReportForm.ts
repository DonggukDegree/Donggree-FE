/**
 * [동글맵 > 장소·리뷰 신고] 사유 선택·설명 입력·확인·제출 공용 제어
 * 제출 전 확인 단계에서 허위 신고 제재를 한 번 더 알린다. 미인증(403)은 학생 인증 안내로,
 * 처리 대기 신고 중복(409)은 오류 대신 안내로 바꾼다.
 */
import { useState } from 'react';
import { toast } from 'sonner';

import { ERROR_CODE } from '@/constants/errorCodes';
import { useCoreMutation } from '@/hooks/customQuery';
import { useModalStore } from '@/stores/modalStore';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getErrorCode, getErrorMessage } from '@/utils/error';
import { hasPlaceFormErrors } from '@/utils/place/placeForm';
import {
  createEmptyPlaceReportForm,
  toPlaceReportRequest,
  type TReportForm,
  type TReportFormErrors,
  validatePlaceReportForm,
} from '@/utils/place/placeReport';

export type TReportBody<TReason extends string> = { reason: TReason; description: string | null };

interface IReportFormOptions<TReason extends string> {
  submit: (body: TReportBody<TReason>) => Promise<number>;
  duplicateCode: string; // 처리 대기 신고가 이미 있을 때 서버가 주는 오류 코드
  duplicateMessage: string;
  onSubmitted: (body: TReportBody<TReason>) => void; // GA·캐시 갱신 등 대상별 후처리
  onClose: () => void;
}

export default function useReportForm<TReason extends string>({
  submit,
  duplicateCode,
  duplicateMessage,
  onSubmitted,
  onClose,
}: IReportFormOptions<TReason>) {
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  const [form, setForm] = useState<TReportForm<TReason>>(createEmptyPlaceReportForm<TReason>);
  const [errors, setErrors] = useState<TReportFormErrors>({});
  const [isConfirming, setIsConfirming] = useState(false);

  const report = useCoreMutation(submit, {
    onSuccess: (_reportId, body) => {
      onSubmitted(body);
      toast.success('신고를 접수했어요. 도움을 주셔서 감사합니다.');
      onClose();
    },
    onError: (error) => {
      setIsConfirming(false);
      const code = getErrorCode(error);
      if (code === ERROR_CODE.PLACE_VERIFICATION_REQUIRED) {
        onClose();
        openStudentVerification();
        return;
      }
      if (code === duplicateCode) {
        toast(duplicateMessage);
        onClose();
        return;
      }
      trackErrorShown('donggle_map', error);
      toast.error(getErrorMessage(error) ?? '신고하지 못했어요. 잠시 후 다시 시도해주세요.');
    },
  });

  // 입력을 검증한 뒤 바로 보내지 않고 확인 단계를 띄운다.
  const requestSubmit = () => {
    const nextErrors = validatePlaceReportForm(form);
    setErrors(nextErrors);
    if (hasPlaceFormErrors(nextErrors)) return;
    setIsConfirming(true);
  };

  return {
    form,
    errors,
    isSubmitting: report.isPending,
    isConfirming,
    changeReason: (reason: TReason) => {
      setForm((current) => ({ ...current, reason }));
      setErrors((current) => ({ ...current, reason: undefined }));
    },
    changeDescription: (description: string) => setForm((current) => ({ ...current, description })),
    submit: requestSubmit,
    confirm: () => report.mutate(toPlaceReportRequest(form) as TReportBody<TReason>),
    cancelConfirm: () => setIsConfirming(false),
  };
}

export type TReportFormController<TReason extends string> = ReturnType<typeof useReportForm<TReason>>;
