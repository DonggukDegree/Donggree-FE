/** [동글맵] 장소 핀의 카테고리 이모지·꼬리 레이어·별점·겹친 장소 묶음 핀 검사 */
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import PlaceMarkers from '@/components/map/placeMarkers';
import type { TPlaceSummary } from '@/types/place/TPlace';

vi.mock('react-kakao-maps-sdk', () => ({
  MarkerClusterer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CustomOverlayMap: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

const places: TPlaceSummary[] = [
  {
    id: 1,
    name: '동국반점',
    category: 'RESTAURANT',
    subCategory: 'CHINESE',
    latitude: 37.558,
    longitude: 127,
    averageRating: 4.3,
    reviewCount: 3,
  },
  {
    id: 2,
    name: '필동커피',
    category: 'CAFE',
    subCategory: 'COFFEE',
    latitude: 37.559,
    longitude: 127,
    averageRating: null,
    reviewCount: 0,
  },
];

const render = (level: number, list: TPlaceSummary[] = places, openGroupKey: number | null = null) =>
  renderToStaticMarkup(
    <PlaceMarkers
      places={list}
      level={level}
      selectedId={null}
      onSelect={vi.fn()}
      openGroupKey={openGroupKey}
      onToggleGroup={vi.fn()}
    />,
  );

// 동국반점(1)에서 약 1m 떨어진 두 장소. 최대로 확대해도 라벨이 겹친다.
const overlapping: TPlaceSummary[] = [
  ...places,
  { ...places[0]!, id: 3, name: '2층 카페', category: 'CAFE', latitude: 37.55801, averageRating: null },
  { ...places[0]!, id: 4, name: '지하 노래방', category: 'LIFE', longitude: 127.00001, averageRating: 3 },
];

describe('동글맵 장소 핀', () => {
  it('확대 레벨의 라벨 핀은 카테고리 이모지를 이름 앞에 표시', () => {
    const html = render(3);
    expect(html).toMatch(/<span aria-hidden="true" class="shrink-0">🍚<\/span><span class="truncate">동국반점<\/span>/);
    expect(html).toMatch(/<span aria-hidden="true" class="shrink-0">☕<\/span><span class="truncate">필동커피<\/span>/);
  });

  it('본체는 꼬리보다 위 레이어, 꼬리는 본체 밑으로 겹쳐 표시', () => {
    for (const level of [3, 5]) {
      const html = render(level);
      expect(html.match(/relative z-10 flex/g)).toHaveLength(2);
      expect(html.match(/relative z-0 -mt-1 h-0 w-0/g)).toHaveLength(2);
    }
  });

  it('라벨 핀은 리뷰가 있으면 이름 뒤에 평균 별점, 없으면 이름만 표시', () => {
    const html = render(3);
    expect(html).toMatch(/동국반점<\/span><span class="shrink-0 text-primary-60">★4\.3<\/span>/);
    expect(html).toMatch(/필동커피<\/span><\/span>/);
  });

  it('5m 안에 겹치는 장소는 라벨 레벨에서 개수 핀 하나로 묶고, 떨어진 장소는 따로 표시', () => {
    const html = render(1, overlapping);
    expect(html).toContain('aria-label="겹친 장소 3곳 목록 보기"');
    expect(html).toMatch(/>3<\/span>/);
    expect(html).not.toContain('2층 카페');
    expect(html).toContain('필동커피 장소 정보 보기');
  });

  it('묶음 핀을 누르면 핀 위에 이모지·이름·별점 목록을 펼침', () => {
    const html = render(1, overlapping, 1);
    expect(html).toContain('aria-label="겹친 장소 3곳 목록 닫기"');
    expect(html).toContain('aria-label="겹친 장소 목록"');
    expect(html).toMatch(
      /🍚<\/span><span class="min-w-0 flex-1 truncate">동국반점<\/span><span class="shrink-0 text-primary-60">★4\.3/,
    );
    expect(html).toMatch(/☕<\/span><span class="min-w-0 flex-1 truncate">2층 카페<\/span><\/button>/);
    expect(html).toContain('★3.0');
  });

  it('아이콘 레벨에서는 묶지 않고 장소마다 핀을 둬 카카오 클러스터러가 묶게 함', () => {
    const html = render(5, overlapping);
    expect(html).not.toContain('겹친 장소');
    expect(html.match(/장소 정보 보기/g)).toHaveLength(4);
  });
});
