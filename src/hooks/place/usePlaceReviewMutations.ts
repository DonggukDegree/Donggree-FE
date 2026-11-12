/**
 * [동글맵 > 리뷰] 작성·수정·삭제 제어
 * 성공하면 리뷰 목록과 장소 정보(평균 별점·리뷰 수)·지도 핀 목록(라벨 별점)을 다시 받는다.
 * 미인증(403)은 학생 인증 안내로, 중복 작성·숨김 리뷰 수정은 서버 문구로 안내한다.
 */
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { deletePlaceReview, postPlaceReview, postReviewReport, putPlaceReview } from '@/apis/place/place';
import { ERROR_CODE } from '@/constants/errorCodes';
import { QUERY_KEYS } from '@/constants/querykeys/queryKeys';
import { useCoreMutation } from '@/hooks/customQuery';
import useReportForm from '@/hooks/place/useReportForm';
import { useModalStore } from '@/stores/modalStore';
import type { TResponseError } from '@/types/common';
import type { TPlaceDetail, TPlaceReview, TReviewReportReason } from '@/types/place/TPlace';
import { trackEvent } from '@/utils/analytics/analytics';
import { trackErrorShown } from '@/utils/analytics/analyticsError';
import { getErrorCode, getErrorMessage } from '@/utils/error';
import {
  createPlaceReviewForm,
  toPlaceReviewRequest,
  type TPlaceReviewForm,
  type TPlaceReviewFormErrors,
  validatePlaceReviewForm,
} from '@/utils/place/placeReview';

type TPlaceRef = Pick<TPlaceDetail, 'id' | 'category'>;

function useRefreshPlaceReviews(placeId: number) {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_PLACE_REVIEWS(placeId) }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_PLACE_DETAIL(placeId) }),
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.GET_PLACES, exact: true }),
    ]);
}

function useHandleReviewError(fallback: string, onClose: () => void) {
  const openStudentVerification = useModalStore((state) => state.openStudentVerification);
  return (error: TResponseError) => {
    if (getErrorCode(error) === ERROR_CODE.PLACE_VERIFICATION_REQUIRED) {
      onClose();
      openStudentVerification();
      return;
    }
    trackErrorShown('donggle_map', error);
    toast.error(getErrorMessage(error) ?? fallback);
  };
}

// 작성(review 없음)·수정(review 있음) 폼.
export function usePlaceReviewForm(place: TPlaceRef, review: TPlaceReview | null, onClose: () => void) {
  const refresh = useRefreshPlaceReviews(place.id);
  const [form, setForm] = useState<TPlaceReviewForm>(() => createPlaceReviewForm(review));
  const [errors, setErrors] = useState<TPlaceReviewFormErrors>({});
  const onError = useHandleReviewError('리뷰를 저장하지 못했어요. 잠시 후 다시 시도해주세요.', onClose);

  const write = useCoreMutation(postPlaceReview, {
    onSuccess: async (_id, { body }) => {
      trackEvent('place_review_submit', { place_category: place.category, review_rating: body.rating });
      await refresh();
      toast.success('리뷰를 남겼어요.');
      onClose();
    },
    onError,
  });
  const edit = useCoreMutation(putPlaceReview, {
    onSuccess: async (_result, { body }) => {
      trackEvent('place_review_edit', { place_category: place.category, review_rating: body.rating });
      await refresh();
      toast.success('리뷰를 수정했어요.');
      onClose();
    },
    onError,
  });

  const submit = () => {
    const nextErrors = validatePlaceReviewForm(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const body = toPlaceReviewRequest(form);
    if (review) edit.mutate({ placeId: place.id, reviewId: review.id, body });
    else write.mutate({ placeId: place.id, body });
  };

  return {
    form,
    errors,
    isEditing: review !== null,
    isSubmitting: write.isPending || edit.isPending,
    changeRating: (rating: number) => {
      setForm((current) => ({ ...current, rating }));
      setErrors((current) => ({ ...current, rating: undefined }));
    },
    changeContent: (content: string) => setForm((current) => ({ ...current, content })),
    submit,
  };
}

// 본인 리뷰 삭제. 확인 모달에서 부른다.
export function usePlaceReviewDelete(place: TPlaceRef, onDone: () => void) {
  const refresh = useRefreshPlaceReviews(place.id);
  const onError = useHandleReviewError('리뷰를 삭제하지 못했어요. 잠시 후 다시 시도해주세요.', onDone);
  return useCoreMutation(deletePlaceReview, {
    onSuccess: async () => {
      trackEvent('place_review_delete', { place_category: place.category });
      await refresh();
      toast.success('리뷰를 삭제했어요.');
      onDone();
    },
    onError,
  });
}

// 리뷰 신고. 서로 다른 회원 3명이 신고하면 서버가 리뷰를 자동 숨김하므로 접수 후 목록·평균을 다시 받는다.
export function useReviewReportForm(place: TPlaceRef, review: Pick<TPlaceReview, 'id'>, onClose: () => void) {
  const refresh = useRefreshPlaceReviews(place.id);
  return useReportForm<TReviewReportReason>({
    submit: (body) => postReviewReport({ placeId: place.id, reviewId: review.id, body }),
    duplicateCode: ERROR_CODE.PLACE_REVIEW_REPORT_DUPLICATE,
    duplicateMessage: '이미 신고한 리뷰예요. 처리된 뒤 다시 신고할 수 있어요.',
    onSubmitted: (body) => {
      trackEvent('place_review_report_submit', { place_category: place.category, report_reason: body.reason });
      void refresh();
    },
    onClose,
  });
}
