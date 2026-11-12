/**
 * [동글맵 > 장소 정보 수정] 입력·검증·저장·충돌 제어
 * 폼은 연 시점의 장소 값과 버전으로 채운다. 저장 시 그 버전을 함께 보내고, 그사이 다른 회원이 먼저 고쳤으면
 * 서버가 409(PLACE409_2)로 막는다. 이때 입력은 그대로 두고 충돌 안내를 띄우며, 사용자가 최신 정보를 불러오면
 * 그 값과 버전으로 폼을 다시 채운다(다른 회원의 수정을 덮어쓰지 않는다).
 */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { getPlaceDetail, putPlaceInfo } from '@/apis/place/place';
import { ERROR_CODE } from '@/constants/errorCodes';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import { useModalStore } from '@/stores/modalStore';
import type { TPlaceDetail } from '@/types/place/TPlace';
import type { TPlaceInfoForm, TPlaceInfoFormErrors } from '@/types/place/TPlaceForm';
import { trackEvent } from '@/utils/analytics/analytics';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getErrorCode, getErrorMessage } from '@/utils/error';
import {
  createPlaceInfoForm,
  hasPlaceFormErrors,
  isSamePlaceInfo,
  toPlaceInfoEditRequest,
  validatePlaceInfoForm,
} from '@/utils/place/placeForm';

export default function usePlaceInfoEditForm(place: TPlaceDetail, onSaved: () => void) {
  const queryClient = useQueryClient();
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  // 폼을 채운 기준 장소. 버전·변경 여부 비교에 쓰고, 최신 정보를 불러오면 바뀐다.
  const [base, setBase] = useState(place);
  const [form, setForm] = useState<TPlaceInfoForm>(() => createPlaceInfoForm(place));
  const [errors, setErrors] = useState<TPlaceInfoFormErrors>({});
  const [hasConflict, setHasConflict] = useState(false);
  const detailKey = QUERY_KEYS.GET_PLACE_DETAIL(place.id);

  const save = useCoreMutation(putPlaceInfo, {
    onSuccess: (updated) => {
      trackEvent('place_edit_complete', { place_category: updated.category });
      queryClient.setQueryData(detailKey, updated);
      toast.success('장소 정보를 수정했어요.');
      onSaved();
    },
    onError: (error) => {
      const code = getErrorCode(error);
      if (code === ERROR_CODE.PLACE_VERIFICATION_REQUIRED) {
        openStudentVerification();
        return;
      }
      if (code === ERROR_CODE.PLACE_EDIT_CONFLICT) {
        trackEvent('place_edit_conflict_shown', { place_category: place.category });
        setHasConflict(true);
        return;
      }
      trackErrorShown('donggle_map', error);
      toast.error(getErrorMessage(error) ?? '장소 정보를 수정하지 못했어요. 잠시 후 다시 시도해주세요.');
    },
  });

  const reload = useCoreMutation(getPlaceDetail, {
    onSuccess: (latest) => {
      queryClient.setQueryData(detailKey, latest);
      setBase(latest);
      setForm(createPlaceInfoForm(latest));
      setErrors({});
      setHasConflict(false);
    },
    onError: (error) => {
      trackErrorShown('donggle_map', error);
      toast.error(getErrorMessage(error) ?? '최신 정보를 불러오지 못했어요. 잠시 후 다시 시도해주세요.');
    },
  });

  const submit = () => {
    if (hasConflict) return;
    const nextErrors = validatePlaceInfoForm(form);
    setErrors(nextErrors);
    if (hasPlaceFormErrors(nextErrors)) return;
    const body = toPlaceInfoEditRequest(form, base.version);
    // 바뀐 값이 없으면 서버도 이력·버전을 그대로 두므로 요청하지 않고 닫는다.
    if (isSamePlaceInfo(base, body)) {
      toast('바뀐 내용이 없어요.');
      onSaved();
      return;
    }
    save.mutate({ placeId: place.id, body });
  };

  return {
    form,
    errors,
    hasConflict,
    isSubmitting: save.isPending,
    isReloading: reload.isPending,
    changeInfo: (change: (current: TPlaceInfoForm) => TPlaceInfoForm) => setForm(change),
    submit,
    reloadLatest: () => reload.mutate(place.id),
  };
}
