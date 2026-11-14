/** [동글맵 > 리뷰] 별점·본문 검증, 요청 변환, 접기 규칙 검사 */
import { describe, expect, it } from 'vitest';

import {
  createPlaceReviewForm,
  formatAverageRating,
  shouldFoldReview,
  toPlaceReviewRequest,
  validatePlaceReviewForm,
} from '@/utils/place/placeReview';

describe('리뷰 폼', () => {
  it('새 리뷰는 빈 폼, 수정은 기존 별점·본문으로 채움', () => {
    expect(createPlaceReviewForm(null)).toEqual({ rating: null, content: '' });
    expect(createPlaceReviewForm({ rating: 4, content: '맛있어요' })).toEqual({ rating: 4, content: '맛있어요' });
  });

  it('별점 필수, 본문은 공백 제외 10~500자', () => {
    expect(validatePlaceReviewForm({ rating: null, content: '' })).toEqual({
      rating: '별점을 선택해주세요.',
      content: '리뷰를 10자 이상 적어주세요.',
    });
    expect(validatePlaceReviewForm({ rating: 5, content: `  ${'가'.repeat(9)}  ` }).content).toContain('10자 이상');
    expect(validatePlaceReviewForm({ rating: 5, content: '가'.repeat(501) }).content).toContain('500자');
    expect(validatePlaceReviewForm({ rating: 1, content: '가'.repeat(10) })).toEqual({});
  });

  it('본문 앞뒤 공백을 지워 요청으로 바꿈', () => {
    expect(toPlaceReviewRequest({ rating: 3, content: '  짜장면이 맛있고 양이 많아요 ' })).toEqual({
      rating: 3,
      content: '짜장면이 맛있고 양이 많아요',
    });
  });

  it('90자를 넘거나 네 줄 이상이면 접고, 평균 별점은 소수 첫째 자리', () => {
    expect(shouldFoldReview('가'.repeat(90))).toBe(false);
    expect(shouldFoldReview('가'.repeat(91))).toBe(true);
    expect(shouldFoldReview('한\n두\n세\n네')).toBe(true);
    expect(formatAverageRating(4)).toBe('4.0');
    expect(formatAverageRating(null)).toBeNull();
  });
});
