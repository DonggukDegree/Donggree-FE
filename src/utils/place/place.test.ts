/** [동글맵] 칩 필터·라벨 레벨·주소창 장소 ID·표시 형식 검사 */
import { describe, expect, it } from 'vitest';

import type { TPlaceSummary } from '@/types/place/TPlace';
import {
  filterPlacesByCategory,
  formatMenuPrice,
  formatPlaceDate,
  parsePlaceIdParam,
  shouldShowPlaceLabel,
} from '@/utils/place/place';

const place = (id: number, category: TPlaceSummary['category']): TPlaceSummary => ({
  id,
  name: `장소${id}`,
  category,
  subCategory: 'ETC',
  latitude: 37.5585,
  longitude: 127.0,
  averageRating: null,
  reviewCount: 0,
});

describe('동글맵 표시 규칙', () => {
  it('전체 칩은 모든 장소, 카테고리 칩은 해당 장소만 남김', () => {
    const places = [place(1, 'CAFE'), place(2, 'BAR'), place(3, 'CAFE')];
    expect(filterPlacesByCategory(places, null)).toHaveLength(3);
    expect(filterPlacesByCategory(places, 'CAFE').map((p) => p.id)).toEqual([1, 3]);
    expect(filterPlacesByCategory(places, 'STUDY')).toEqual([]);
  });

  it('레벨 3 이하에서만 이름 라벨 표시', () => {
    expect(shouldShowPlaceLabel(1)).toBe(true);
    expect(shouldShowPlaceLabel(3)).toBe(true);
    expect(shouldShowPlaceLabel(4)).toBe(false);
  });

  it('주소창 place 값은 양의 정수만 장소 ID로 인정', () => {
    expect(parsePlaceIdParam('12')).toBe(12);
    expect(parsePlaceIdParam(null)).toBeNull();
    expect(parsePlaceIdParam('0')).toBeNull();
    expect(parsePlaceIdParam('-1')).toBeNull();
    expect(parsePlaceIdParam('1.5')).toBeNull();
    expect(parsePlaceIdParam('abc')).toBeNull();
    expect(parsePlaceIdParam('99999999999999999999')).toBeNull();
  });

  it('가격 없는 메뉴는 가격 변동, 날짜는 연.월.일로 표시', () => {
    expect(formatMenuPrice(7000)).toBe('7,000원');
    expect(formatMenuPrice(0)).toBe('0원');
    expect(formatMenuPrice(null)).toBe('가격 변동');
    expect(formatPlaceDate('2026-10-27T09:30:00')).toBe('2026.10.27');
    expect(formatPlaceDate('')).toBe('');
  });
});
