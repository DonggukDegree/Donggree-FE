/** [동글맵 > 장소 등록] 입력 폼·메뉴 행·중복 안내 표시 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import PlaceRegisterForm from '@/components/map/placeRegisterForm';
import type { TDuplicateNotice } from '@/hooks/place/usePlaceRegisterForm';
import type { TPlaceForm, TPlaceFormErrors } from '@/types/place/TPlaceForm';

const state = vi.hoisted(() => ({
  form: {} as TPlaceForm,
  errors: {} as TPlaceFormErrors,
  duplicateNotice: null as TDuplicateNotice | null,
}));

vi.mock('@/hooks/place/usePlaceAddress', () => ({
  default: () => ({ address: '서울 중구 필동로1길 30', isLoading: false }),
}));
vi.mock('@/hooks/place/usePlaceRegisterForm', () => ({
  default: () => ({
    form: state.form,
    errors: state.errors,
    duplicateNotice: state.duplicateNotice,
    isSubmitting: false,
  }),
}));

const candidate = (id: number, name: string) => ({
  id,
  name,
  category: 'RESTAURANT' as const,
  subCategory: 'CHINESE' as const,
  distanceMeters: 12,
});

const render = () =>
  renderToStaticMarkup(
    <PlaceRegisterForm
      point={{ lat: 37.5585, lng: 127 }}
      onBack={vi.fn()}
      onRegistered={vi.fn()}
      onSelectExisting={vi.fn()}
    />,
  );

describe('장소 등록 폼', () => {
  beforeEach(() => {
    state.form = {
      name: '',
      category: null,
      subCategory: null,
      businessHours: '',
      description: '',
      menus: [
        { key: 'a', name: '짜장면', price: '7000' },
        { key: 'b', name: '', price: '' },
      ],
    };
    state.errors = {};
    state.duplicateNotice = null;
  });

  it('실시간 주소와 필수 표시, 변경 불가 안내, 카테고리 전 상세카테고리 비활성 표시', () => {
    const html = render();
    expect(html).toContain('서울 중구 필동로1길 30');
    expect(html).toContain('이름·위치·카테고리는 등록 후 바꿀 수 없어요.');
    expect(html).toMatch(/id="place-sub-category"[^>]*disabled=""/);
    expect(html).toContain('카테고리 먼저');
  });

  it('메뉴 행마다 위·아래·삭제를 두고 첫 행 위·마지막 행 아래는 비활성', () => {
    const html = render();
    expect(html).toMatch(/aria-label="1번째 메뉴 위로" disabled=""/);
    expect(html).toMatch(/aria-label="2번째 메뉴 아래로" disabled=""/);
    expect(html).toContain('aria-label="2번째 메뉴 삭제"');
    expect(html).toContain('+ 메뉴 추가');
  });

  it('검증 오류를 해당 칸 아래에 표시', () => {
    state.errors = { name: '이름을 입력해주세요.', menus: { b: { name: '메뉴명을 입력하거나 행을 삭제해주세요.' } } };
    const html = render();
    expect(html).toContain('이름을 입력해주세요.');
    expect(html).toContain('메뉴명을 입력하거나 행을 삭제해주세요.');
  });

  it('같은 이름이면 등록 버튼 없이 기존 장소 보기만, 비슷한 이름이면 다른 장소예요 제공', () => {
    state.duplicateNotice = { type: 'exact', duplicates: { exact: [candidate(1, '동국반점')], similar: [] } };
    let html = render();
    expect(html).toContain('이미 등록된 장소예요');
    expect(html).toContain('이 장소 보기');
    expect(html).not.toContain('다른 장소예요');

    state.duplicateNotice = { type: 'similar', duplicates: { exact: [], similar: [candidate(2, '동국반점 2호점')] } };
    html = render();
    expect(html).toContain('혹시 이 중에 있나요?');
    expect(html).toContain('동국반점 2호점');
    expect(html).toContain('다른 장소예요');
  });
});
