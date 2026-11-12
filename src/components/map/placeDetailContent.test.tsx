/** [동글맵] 장소 정보의 수정 버튼·등록/수정일 표시 검사 */
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import PlaceDetailContent from '@/components/map/placeDetailContent';
import type { TPlaceDetail } from '@/types/place/TPlace';

vi.mock('@/hooks/place/usePlaceAddress', () => ({
  default: () => ({ address: '서울 중구 필동로1길 30', isLoading: false }),
}));

const place: TPlaceDetail = {
  id: 1,
  name: '동국반점',
  category: 'RESTAURANT',
  subCategory: 'CHINESE',
  latitude: 37.5585,
  longitude: 127,
  businessHours: null,
  description: null,
  menus: [],
  createdAt: '2026-11-01T12:00:00',
  updatedAt: '2026-11-02T12:00:00',
  version: 0,
};

describe('장소 정보', () => {
  it('메뉴가 없어도 영업시간·설명·메뉴 수정 버튼과 등록/수정일을 표시', () => {
    const html = renderToStaticMarkup(<PlaceDetailContent place={place} onEdit={vi.fn()} />);
    expect(html).toContain('영업시간·설명·메뉴 수정');
    expect(html).toContain('최초 등록');
    expect(html).toContain('마지막 수정');
    expect(html).not.toContain('>메뉴</h3>');
  });
});
