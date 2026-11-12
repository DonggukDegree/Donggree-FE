import { PLACE_REVIEW_FOLD_LENGTH, PLACE_REVIEW_LIMITS } from '@/constants/place';
import type { TPlaceReview, TPlaceReviewRequest } from '@/types/place/TPlace';

// [동글맵 > 리뷰] 입력 검증·요청 변환·표시 규칙 순수 함수. 최종 검증은 서버가 다시 한다.

export type TPlaceReviewForm = { rating: number | null; content: string };
export type TPlaceReviewFormErrors = { rating?: string; content?: string };

export const createPlaceReviewForm = (review: Pick<TPlaceReview, 'rating' | 'content'> | null): TPlaceReviewForm => ({
  rating: review?.rating ?? null,
  content: review?.content ?? '',
});

export const validatePlaceReviewForm = (form: TPlaceReviewForm): TPlaceReviewFormErrors => {
  const errors: TPlaceReviewFormErrors = {};
  const length = form.content.trim().length;
  if (!form.rating) errors.rating = '별점을 선택해주세요.';
  if (length < PLACE_REVIEW_LIMITS.CONTENT_MIN)
    errors.content = `리뷰를 ${PLACE_REVIEW_LIMITS.CONTENT_MIN}자 이상 적어주세요.`;
  else if (length > PLACE_REVIEW_LIMITS.CONTENT_MAX)
    errors.content = `${PLACE_REVIEW_LIMITS.CONTENT_MAX}자 이하로 입력해주세요.`;
  return errors;
};

export const toPlaceReviewRequest = (form: TPlaceReviewForm): TPlaceReviewRequest => {
  if (!form.rating) throw new Error('별점이 선택되지 않은 폼은 변환할 수 없습니다.');
  return { rating: form.rating, content: form.content.trim() };
};

// 긴 본문이나 여러 줄 본문은 3줄로 접고 펼치기 버튼을 둔다.
export const shouldFoldReview = (content: string) =>
  content.length > PLACE_REVIEW_FOLD_LENGTH || content.split('\n').length > 3;

// 평균 별점 표시. 리뷰가 없으면 null.
export const formatAverageRating = (averageRating: number | null) =>
  averageRating === null ? null : averageRating.toFixed(1);
