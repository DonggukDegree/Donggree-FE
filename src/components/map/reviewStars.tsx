/**
 * [동글맵 > 리뷰] 별점 표시·입력
 * 표시는 채운 별(주황)과 빈 별(회색) 다섯 개, 입력은 별 다섯 개를 버튼으로 둔다(선택한 별까지 채움).
 */
import { PLACE_REVIEW_LIMITS } from '@/constants/place';

const STARS = Array.from({ length: PLACE_REVIEW_LIMITS.RATING_MAX }, (_, index) => index + 1);

export function ReviewStars({ rating, className = 'text-body-s' }: { rating: number; className?: string }) {
  return (
    <span role="img" aria-label={`별점 ${rating}점`} className={`flex shrink-0 ${className}`}>
      {STARS.map((star) => (
        <span key={star} aria-hidden="true" className={star <= rating ? 'text-primary-60' : 'text-coolgray-20'}>
          ★
        </span>
      ))}
    </span>
  );
}

export function ReviewStarsInput({ value, onChange }: { value: number | null; onChange: (rating: number) => void }) {
  return (
    <div role="radiogroup" aria-label="별점" className="flex gap-1">
      {STARS.map((star) => {
        const filled = value !== null && star <= value;
        return (
          <button
            key={star}
            type="button"
            role="radio"
            aria-checked={value === star}
            aria-label={`${star}점`}
            onClick={() => onChange(star)}
            className={`cursor-pointer text-heading-4 leading-none ${filled ? 'text-primary-60' : 'text-coolgray-20'} hover:text-primary-60`}
          >
            <span aria-hidden="true">★</span>
          </button>
        );
      })}
    </div>
  );
}
