/**
 * [동글맵 > 장소 신고] 사유 선택·설명 입력·제출 제어
 * 신고만으로 장소가 숨겨지지 않고 관리자가 확인한다. 같은 장소에 처리 대기 신고가 있으면 서버가 409(PLACE409_3)로 막아
 * 이미 신고했다는 안내로 바꾸고, 미인증(403)은 학생 인증 안내로 이어 준다.
 */
import { useState } from 'react';
import { toast } from 'sonner';

import { postPlaceReport } from '@/apis/place/place';
import { ERROR_CODE } from '@/constants/errorCodes';
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
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  const [form, setForm] = useState<TPlaceReportForm>(createEmptyPlaceReportForm);
  const [errors, setErrors] = useState<TPlaceReportFormErrors>({});

  const report = useCoreMutation(postPlaceReport, {
    onSuccess: (_reportId, { body }) => {
      trackEvent('place_report_submit', { place_category: place.category, report_reason: body.reason });
      toast.success('신고를 접수했어요. 확인 후 처리할게요.');
      onClose();
    },
    onError: (error) => {
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

  const submit = () => {
    const nextErrors = validatePlaceReportForm(form);
    setErrors(nextErrors);
    if (hasPlaceFormErrors(nextErrors)) return;
    report.mutate({ placeId: place.id, body: toPlaceReportRequest(form) });
  };

  return {
    form,
    errors,
    isSubmitting: report.isPending,
    changeReason: (reason: TPlaceReportReason) => {
      setForm((current) => ({ ...current, reason }));
      setErrors((current) => ({ ...current, reason: undefined }));
    },
    changeDescription: (description: string) => setForm((current) => ({ ...current, description })),
    submit,
  };
}
