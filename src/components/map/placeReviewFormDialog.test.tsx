/** [동글맵 > 리뷰] 작성·수정 모달의 별점 입력·글자 수·오류 표시 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlaceReviewFormDialog from '@/components/map/placeReviewFormDialog';
import type { TPlaceReviewForm, TPlaceReviewFormErrors } from '@/utils/place/placeReview';

const state = vi.hoisted(() => ({
  form: { rating: null, content: '' } as TPlaceReviewForm,
  errors: {} as TPlaceReviewFormErrors,
  isEditing: false,
}));

vi.mock('@/hooks/place/usePlaceReviewMutations', () => ({
  usePlaceReviewForm: () => ({
    form: state.form,
    errors: state.errors,
    isEditing: state.isEditing,
    isSubmitting: false,
  }),
}));

const render = () =>
  renderToStaticMarkup(
    <PlaceReviewFormDialog
      place={{ id: 1, name: '동국반점', category: 'RESTAURANT' }}
      review={null}
      onClose={vi.fn()}
    />,
  );

describe('리뷰 작성 모달', () => {
  beforeEach(() => {
    state.form = { rating: null, content: '' };
    state.errors = {};
    state.isEditing = false;
  });

  it('별 다섯 개 입력과 500자 글자 수, 등록하기 버튼', () => {
    const html = render();
    expect(html).toContain('리뷰 쓰기');
    expect(html.match(/role="radio"/g)).toHaveLength(5);
    expect(html).toContain('0/500');
    expect(html).toContain('maxLength="500"');
    expect(html).toContain('등록하기');
  });

  it('선택한 별까지 채우고, 수정이면 제목·버튼이 수정으로 바뀜', () => {
    state.form = { rating: 3, content: '짜장면이 맛있어요' };
    state.isEditing = true;
    const html = render();
    expect(html).toContain('리뷰 수정');
    expect(html).toContain('수정하기');
    expect(html).toMatch(/aria-checked="true" aria-label="3점"/);
    expect(html.match(/text-primary-60 hover:text-primary-60/g)).toHaveLength(3);
  });

  it('검증 오류를 표시', () => {
    state.errors = { rating: '별점을 선택해주세요.', content: '리뷰를 10자 이상 적어주세요.' };
    const html = render();
    expect(html).toContain('별점을 선택해주세요.');
    expect(html).toContain('리뷰를 10자 이상 적어주세요.');
  });
});
