/** [동글맵] 장소 정보의 카테고리 이모지·정보 수정/신고 칩·등록/수정일 표시 검사 */
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
  it('카테고리 앞에 색 점 대신 카테고리 이모지를 표시', () => {
    const html = renderToStaticMarkup(<PlaceDetailContent place={place} onEdit={vi.fn()} onReport={vi.fn()} />);
    expect(html).toMatch(/<span aria-hidden="true">🍚<\/span>음식점 · 중식/);
    expect(html).not.toContain('background:');
  });

  it('메뉴가 없어도 등록/수정일 옆에 정보 수정 칩과 사이렌 아이콘이 붙은 신고 칩을 표시', () => {
    const html = renderToStaticMarkup(<PlaceDetailContent place={place} onEdit={vi.fn()} onReport={vi.fn()} />);
    expect(html).toMatch(
      /마지막 수정 [^<]*<\/p><div class="ml-auto flex items-center gap-2"><div class="group relative"><button[^>]*rounded-full[^>]*>정보 수정<\/button>/,
    );
    expect(html).toMatch(
      /<button type="button" class="[^"]*rounded-full[^"]*hover:text-alert"><svg[^>]*aria-hidden="true"[^>]*>.*<\/svg>신고<\/button>/,
    );
    expect(html).not.toContain('>메뉴</h3>');
  });

  it('수정 칩 호버·포커스 시 위쪽 꼬리 말풍선으로 정보 추가 안내', () => {
    const html = renderToStaticMarkup(<PlaceDetailContent place={place} onEdit={vi.fn()} onReport={vi.fn()} />);
    expect(html).toContain('aria-describedby="place-edit-tooltip"');
    expect(html).toMatch(/role="tooltip"[^>]*opacity-0[^>]*group-hover:opacity-100[^>]*>.*장소 정보를 추가해주세요!/);
    expect(html).toMatch(/role="tooltip" class="[^"]*left-1\/2[^"]*-translate-x-1\/2/);
    expect(html).toMatch(/-top-1 left-1\/2[^"]*-translate-x-1\/2 rotate-45/);
  });

  it('메뉴 가격은 메뉴명과 같은 진한 색으로 표시', () => {
    const html = renderToStaticMarkup(
      <PlaceDetailContent
        place={{ ...place, menus: [{ name: '짜장면', price: 7000 }] }}
        onEdit={vi.fn()}
        onReport={vi.fn()}
      />,
    );
    expect(html).toMatch(
      /<span class="break-keep text-coolgray-90">짜장면<\/span><span class="shrink-0 text-coolgray-90">/,
    );
  });
});
