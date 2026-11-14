/** [동글맵] 칩 필터·라벨 레벨·주소창 장소 ID·표시 형식 검사 */
import { describe, expect, it } from 'vitest';

import { PLACE_SUB_CATEGORIES_BY_CATEGORY, PLACE_SUB_CATEGORY_LABELS } from '@/constants/place';
import type { TPlaceSummary } from '@/types/place/TPlace';
import {
  ALL_PLACES_FILTER,
  filterPlaces,
  filterPlacesByCategory,
  formatMenuPrice,
  formatPlaceDate,
  groupNearbyPlaces,
  parsePlaceIdParam,
  placeMarkerZIndex,
  selectCategoryFilter,
  shouldShowPlaceLabel,
  toggleHiddenGemFilter,
  toggleSubCategoryFilter,
  toggleTagFilter,
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
  tags: [],
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

  it('겹친 핀은 커서를 올린 핀이 선택한 핀보다도 위, 나머지는 같은 높이', () => {
    expect(placeMarkerZIndex(1, 2, 1)).toBe(30);
    expect(placeMarkerZIndex(2, 2, 1)).toBe(20);
    expect(placeMarkerZIndex(2, 2, null)).toBe(20);
    expect(placeMarkerZIndex(3, 2, 1)).toBe(1);
  });

  it('기준 장소에서 5m 안의 장소만 한 묶음으로 모으고 기준 장소 ID를 key로 씀', () => {
    const at = (id: number, lat: number, lng: number) => ({ id, latitude: lat, longitude: lng });
    const groups = groupNearbyPlaces(
      [at(1, 37.5585, 127), at(2, 37.55851, 127), at(3, 37.5585, 127.00003), at(4, 37.55856, 127)],
      5,
    );
    expect(groups.map((group) => [group.key, group.places.map((member) => member.id)])).toEqual([
      [1, [1, 2, 3]],
      [4, [4]],
    ]);
  });

  it('카테고리는 하나만, 세부는 여러 개(하나라도 해당), 세부를 안 고르면 카테고리 전체', () => {
    const list = [
      { ...place(1, 'CAFE'), subCategory: 'FRANCHISE' as const },
      { ...place(2, 'CAFE'), subCategory: 'COFFEE' as const },
      { ...place(3, 'CAFE'), subCategory: 'DESSERT' as const },
      place(4, 'RESTAURANT'),
    ];
    let filter = selectCategoryFilter(ALL_PLACES_FILTER, 'CAFE');
    expect(filterPlaces(list, filter).map(({ id }) => id)).toEqual([1, 2, 3]);
    filter = toggleSubCategoryFilter(toggleSubCategoryFilter(filter, 'FRANCHISE'), 'COFFEE');
    expect(filterPlaces(list, filter).map(({ id }) => id)).toEqual([1, 2]);
    expect(selectCategoryFilter(filter, 'RESTAURANT')).toEqual({
      mode: 'category',
      category: 'RESTAURANT',
      subCategories: [],
    });
    expect(selectCategoryFilter(filter, 'CAFE')).toEqual(ALL_PLACES_FILTER);
    expect(filterPlaces(list, ALL_PLACES_FILTER)).toHaveLength(4);
  });

  it('숨은 맛집은 카테고리 선택을 풀고 태그가 있는 장소만, 태그를 고르면 하나라도 해당', () => {
    const list = [
      { ...place(1, 'CAFE'), tags: ['COFFEE' as const] },
      { ...place(2, 'RESTAURANT'), tags: ['SOLO_DINING' as const, 'MEAL_DATE' as const] },
      place(3, 'RESTAURANT'),
    ];
    let filter = toggleHiddenGemFilter(selectCategoryFilter(ALL_PLACES_FILTER, 'CAFE'));
    expect(filter).toEqual({ mode: 'hiddenGem', tags: [] });
    expect(filterPlaces(list, filter).map(({ id }) => id)).toEqual([1, 2]);
    filter = toggleTagFilter(toggleTagFilter(filter, 'SOLO_DINING'), 'COFFEE');
    expect(filterPlaces(list, filter).map(({ id }) => id)).toEqual([1, 2]);
    expect(filterPlaces(list, toggleTagFilter(filter, 'COFFEE')).map(({ id }) => id)).toEqual([2]);
    expect(toggleHiddenGemFilter(filter)).toEqual(ALL_PLACES_FILTER);
    expect(toggleSubCategoryFilter(filter, 'COFFEE')).toBe(filter);
  });
});

describe('음식점 상세카테고리', () => {
  it('학식당은 음식점 상세 칩에서 기타 바로 앞에 온다', () => {
    expect(PLACE_SUB_CATEGORIES_BY_CATEGORY.RESTAURANT.slice(-2)).toEqual(['CAFETERIA', 'RESTAURANT_ETC']);
    expect(PLACE_SUB_CATEGORY_LABELS.CAFETERIA).toBe('학식당');
  });
});
