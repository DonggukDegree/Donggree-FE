/**
 * [동글맵 > 장소 등록] 입력·검증·중복 확인·등록 제어
 * 제출 시 반경 50m 중복 후보를 먼저 확인한다. 같은 이름(exact)은 등록을 막고, 비슷한 이름(similar)은
 * 사용자가 "다른 장소예요"를 고른 뒤에만 등록한다. 서버가 403·409를 돌려주면 같은 안내로 이어 준다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { getPlaceDuplicates, postPlace } from '@/apis/place/place';
import { ERROR_CODE } from '@/constants/errorCodes';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import { useModalStore } from '@/stores/modalStore';
import type { TPlaceCategory, TPlaceDuplicates, TPlaceSubCategory } from '@/types/place/TPlace';
import type { TLatLng, TPlaceForm, TPlaceFormErrors, TPlaceInfoForm } from '@/types/place/TPlaceForm';
import { trackEvent } from '@/utils/analytics/analytics';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getErrorCode, getErrorMessage } from '@/utils/error';
import {
  changeCategory,
  createEmptyPlaceForm,
  hasPlaceFormErrors,
  toPlaceRegisterRequest,
  validatePlaceForm,
} from '@/utils/place/placeForm';

export type TDuplicateNotice = { type: 'exact' | 'similar'; duplicates: TPlaceDuplicates };

export default function usePlaceRegisterForm(point: TLatLng, onRegistered: (placeId: number) => void) {
  const queryClient = useQueryClient();
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  const [form, setForm] = useState<TPlaceForm>(createEmptyPlaceForm);
  const [errors, setErrors] = useState<TPlaceFormErrors>({});
  const [duplicateNotice, setDuplicateNotice] = useState<TDuplicateNotice | null>(null);

  const showDuplicates = (duplicates: TPlaceDuplicates) => {
    const type = duplicates.exact.length > 0 ? 'exact' : 'similar';
    trackEvent('place_duplicate_shown', { duplicate_type: type });
    setDuplicateNotice({ type, duplicates });
  };

  const register = useCoreMutation(postPlace, {
    onSuccess: async (placeId, body) => {
      trackEvent('place_register_complete', { place_category: body.category });
      await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PLACES_ROOT });
      toast.success('장소를 등록했어요.');
      onRegistered(placeId);
    },
    onError: (error, body) => {
      const code = getErrorCode(error);
      if (code === ERROR_CODE.PLACE_VERIFICATION_REQUIRED) {
        openStudentVerification();
        return;
      }
      trackErrorShown('donggle_map', error);
      if (code === ERROR_CODE.PLACE_DUPLICATE) {
        // 확인과 등록 사이에 같은 이름이 먼저 등록된 경우. 후보를 다시 받아 바로가기를 보여 준다.
        void getPlaceDuplicates({ name: body.name, latitude: body.latitude, longitude: body.longitude })
          .then(showDuplicates)
          .catch(() => toast.error(getErrorMessage(error) ?? '이미 등록된 장소예요.'));
        return;
      }
      toast.error(getErrorMessage(error) ?? '장소를 등록하지 못했어요. 잠시 후 다시 시도해주세요.');
    },
  });

  const checkDuplicates = useCoreMutation(getPlaceDuplicates, {
    onError: (error) => {
      trackErrorShown('donggle_map', error);
      toast.error(getErrorMessage(error) ?? '중복 장소를 확인하지 못했어요. 잠시 후 다시 시도해주세요.');
    },
  });

  const update = (patch: Partial<TPlaceForm>) => setForm((current) => ({ ...current, ...patch }));

  const submit = async () => {
    const nextErrors = validatePlaceForm(form);
    setErrors(nextErrors);
    if (hasPlaceFormErrors(nextErrors)) return;
    const body = toPlaceRegisterRequest(form, point);
    const duplicates = await checkDuplicates
      .mutateAsync({ name: body.name, latitude: body.latitude, longitude: body.longitude })
      .catch(() => null);
    if (!duplicates) return;
    if (duplicates.exact.length > 0 || duplicates.similar.length > 0) {
      showDuplicates(duplicates);
      return;
    }
    register.mutate(body);
  };

  // 비슷한 장소 안내에서 "다른 장소예요"를 고르면 그대로 등록한다.
  const confirmDifferentPlace = () => {
    setDuplicateNotice(null);
    register.mutate(toPlaceRegisterRequest(form, point));
  };

  return {
    form,
    errors,
    duplicateNotice,
    isSubmitting: checkDuplicates.isPending || register.isPending,
    changeName: (name: string) => update({ name }),
    changeCategory: (category: TPlaceCategory) => setForm((current) => changeCategory(current, category)),
    changeSubCategory: (subCategory: TPlaceSubCategory) => update({ subCategory }),
    // 영업시간·설명·메뉴는 수정 폼과 같은 입력 칸(PlaceInfoFields)이 갱신 함수로 바꾼다.
    changeInfo: (change: (current: TPlaceInfoForm) => TPlaceInfoForm) =>
      setForm((current) => ({ ...current, ...change(current) })),
    submit,
    confirmDifferentPlace,
    closeDuplicateNotice: () => setDuplicateNotice(null),
  };
}
