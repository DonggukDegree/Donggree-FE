/**
 * [동글맵 > 장소 신고] 사유 선택·설명 입력·확인·제출 제어
 * 제출 전 확인 단계에서 허위 신고 제재를 한 번 더 알린다. 서로 다른 회원 3명이 신고하면 서버가 장소를 자동 숨김하므로
 * 접수 후 지도 목록을 다시 받는다. 같은 장소에 처리 대기 신고가 있으면 서버가 409(PLACE409_3)로 막아
 * 이미 신고했다는 안내로 바꾸고, 미인증(403)은 학생 인증 안내로 이어 준다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { postPlaceReport } from '@/apis/place/place';
import { ERROR_CODE } from '@/constants/errorCodes';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import { useModalStore } from '@/stores/modalStore';
import type { TPlaceDetail, TPlaceReportReason } from '@/types/place/TPlace';
import { trackEvent } from '@/utils/analytics/analytics';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getErrorCode, getErrorMessage } from '@/utils/error';
import { hasPlaceFormErrors } from '@/utils/place/placeForm';
import {
  createEmptyPlaceReportForm,
  toPlaceReportRequest,
  type TPlaceReportForm,
  type TPlaceReportFormErrors,
  validatePlaceReportForm,
} from '@/utils/place/placeReport';

export default function usePlaceReportForm(place: Pick<TPlaceDetail, 'id' | 'category'>, onClose: () => void) {
  const queryClient = useQueryClient();
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  const [form, setForm] = useState<TPlaceReportForm>(createEmptyPlaceReportForm);
  const [errors, setErrors] = useState<TPlaceReportFormErrors>({});
  const [isConfirming, setIsConfirming] = useState(false);

  const report = useCoreMutation(postPlaceReport, {
    onSuccess: (_reportId, { body }) => {
      trackEvent('place_report_submit', { place_category: place.category, report_reason: body.reason });
      // 이 신고로 자동 숨김됐을 수 있어 핀 목록만 다시 받는다(열린 장소 정보는 그대로 둔다).
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_PLACES, exact: true });
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
      if (code === ERROR_CODE.PLACE_REPORT_DUPLICATE) {
        toast('이미 신고한 장소예요. 처리된 뒤 다시 신고할 수 있어요.');
        onClose();
        return;
      }
      trackErrorShown('donggle_map', error);
      toast.error(getErrorMessage(error) ?? '신고하지 못했어요. 잠시 후 다시 시도해주세요.');
    },
  });

  // 입력을 검증한 뒤 바로 보내지 않고 확인 단계를 띄운다.
  const submit = () => {
    const nextErrors = validatePlaceReportForm(form);
    setErrors(nextErrors);
    if (hasPlaceFormErrors(nextErrors)) return;
    setIsConfirming(true);
  };

  const confirm = () => report.mutate({ placeId: place.id, body: toPlaceReportRequest(form) });

  return {
    form,
    errors,
    isSubmitting: report.isPending,
    isConfirming,
    changeReason: (reason: TPlaceReportReason) => {
      setForm((current) => ({ ...current, reason }));
      setErrors((current) => ({ ...current, reason: undefined }));
    },
    changeDescription: (description: string) => setForm((current) => ({ ...current, description })),
    submit,
    confirm,
    cancelConfirm: () => setIsConfirming(false),
  };
}
