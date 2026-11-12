/** [동글맵 > 장소 정보 수정] 고정 항목 표시·기존 값 채움·충돌 안내 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlaceInfoEditForm from '@/components/map/placeInfoEditForm';
import type { TPlaceDetail } from '@/types/place/TPlace';
import type { TPlaceInfoForm, TPlaceInfoFormErrors } from '@/types/place/TPlaceForm';

const state = vi.hoisted(() => ({
  form: {} as TPlaceInfoForm,
  errors: {} as TPlaceInfoFormErrors,
  hasConflict: false,
  isSubmitting: false,
}));

vi.mock('@/hooks/place/usePlaceInfoEditForm', () => ({
  default: () => ({
    form: state.form,
    errors: state.errors,
    hasConflict: state.hasConflict,
    isSubmitting: state.isSubmitting,
    isReloading: false,
  }),
}));

const place: TPlaceDetail = {
  id: 1,
  name: '동국반점',
  category: 'RESTAURANT',
  subCategory: 'CHINESE',
  latitude: 37.5585,
  longitude: 127,
  businessHours: '평일 11:00-21:00',
  description: null,
  menus: [{ name: '짜장면', price: 7000 }],
  createdAt: '2026-11-01T12:00:00',
  updatedAt: '2026-11-02T12:00:00',
  version: 2,
};

const render = () => renderToStaticMarkup(<PlaceInfoEditForm place={place} onClose={vi.fn()} />);

describe('장소 정보 수정 폼', () => {
  beforeEach(() => {
    state.form = {
      businessHours: '평일 11:00-21:00',
      description: '',
      menus: [{ key: 'a', name: '짜장면', price: '7000' }],
    };
    state.errors = {};
    state.hasConflict = false;
    state.isSubmitting = false;
  });

  it('이름·카테고리는 입력 칸 없이 보여주고 영업시간·메뉴는 기존 값으로 채움', () => {
    const html = render();
    expect(html).toContain('동국반점');
    expect(html).toContain('🍚 음식점 · 중식');
    expect(html).toContain('이름·위치·카테고리는 바꿀 수 없어요.');
    expect(html).not.toContain('id="place-name"');
    expect(html).toMatch(/id="place-hours"[^>]*value="평일 11:00-21:00"/);
    expect(html).toMatch(/aria-label="1번째 메뉴명"[^>]*value="짜장면"/);
    expect(html).toContain('저장하기');
    expect(html).not.toContain('role="alert"');
  });

  it('다른 회원이 먼저 수정했으면 안내와 최신 정보 불러오기를 보여주고 저장을 막음', () => {
    state.hasConflict = true;
    const html = render();
    expect(html).toContain('role="alert"');
    expect(html).toContain('다른 회원이 먼저 수정했어요.');
    expect(html).toContain('최신 정보 불러오기');
    expect(html).toMatch(/<button type="submit" disabled=""/);
  });

  it('검증 오류를 해당 칸 아래에 표시', () => {
    state.errors = { menus: { a: { price: '100만 원 이하로 입력해주세요.' } } };
    expect(render()).toContain('100만 원 이하로 입력해주세요.');
  });
});
