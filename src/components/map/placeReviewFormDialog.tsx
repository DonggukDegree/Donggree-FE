/**
 * [동글맵 > 리뷰] 작성·수정 모달
 * 별점은 필수, 본문은 10~500자. 장소 정보 시트 안에서 열리므로 화면 전체를 덮는다.
 */
import Button from '@/components/common/inputs/button';
import { ReviewStarsInput } from '@/components/map/reviewStars';
import { INPUT_CLASS } from '@/constants/inputStyles';
import { PLACE_REVIEW_LIMITS } from '@/constants/place';
import { usePlaceReviewForm } from '@/hooks/place/usePlaceReviewMutations';
import type { TPlaceDetail, TPlaceReview } from '@/types/place/TPlace';

interface IPlaceReviewFormDialogProps {
  place: Pick<TPlaceDetail, 'id' | 'name' | 'category'>;
  review: TPlaceReview | null; // 있으면 수정
  onClose: () => void;
}

export default function PlaceReviewFormDialog({ place, review, onClose }: IPlaceReviewFormDialogProps) {
  const reviewForm = usePlaceReviewForm(place, review, onClose);
  const { form, errors } = reviewForm;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay p-4 lg:items-center">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="place-review-form-title"
        noValidate
        className="flex max-h-full w-full max-w-120 flex-col gap-5 overflow-y-auto rounded-2xl bg-white p-5"
        onSubmit={(event) => {
          event.preventDefault();
          reviewForm.submit();
        }}
      >
        <div className="flex flex-col gap-1">
          <h2 id="place-review-form-title" className="text-heading-6 text-coolgray-90">
            {reviewForm.isEditing ? '리뷰 수정' : '리뷰 쓰기'}
          </h2>
          <p className="break-keep text-body-s text-coolgray-60">
            <span className="text-coolgray-90">{place.name}</span>은 어땠나요?
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <ReviewStarsInput value={form.rating} onChange={reviewForm.changeRating} />
          {errors.rating && <p className="text-body-xs text-alert">{errors.rating}</p>}
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="place-review-content" className="sr-only">
            리뷰 본문
          </label>
          <textarea
            id="place-review-content"
            rows={5}
            value={form.content}
            maxLength={PLACE_REVIEW_LIMITS.CONTENT_MAX}
            placeholder="맛, 분위기, 가격 등 다른 학생에게 도움이 될 이야기를 적어주세요"
            onChange={(event) => reviewForm.changeContent(event.target.value)}
            className={`${INPUT_CLASS} resize-none ${errors.content ? 'border-alert' : 'border-coolgray-30'}`}
          />
          <div className="flex justify-between gap-2">
            <p className="text-body-xs text-alert">{errors.content}</p>
            <p className="shrink-0 text-body-xs text-coolgray-60">
              {form.content.length}/{PLACE_REVIEW_LIMITS.CONTENT_MAX}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outlined" className="flex-1" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" variant={reviewForm.isSubmitting ? 'disabled' : 'primary'} className="flex-1">
            {reviewForm.isSubmitting ? '저장 중' : reviewForm.isEditing ? '수정하기' : '등록하기'}
          </Button>
        </div>
      </form>
    </div>
  );
}
