import { MAP_LABEL_MAX_LEVEL } from '@/constants/place';
import type { TPlaceCategory, TPlaceMenu, TPlaceSubCategory, TPlaceSummary, TPlaceTag } from '@/types/place/TPlace';
import { distanceMeters } from '@/utils/place/placeForm';

// [동글맵] 화면 표시용 순수 함수 모음.

// 칩 필터. null은 '전체'.
export const filterPlacesByCategory = (places: TPlaceSummary[], category: TPlaceCategory | null) =>
  category === null ? places : places.filter((place) => place.category === category);

// 확대 레벨 3 이하에서만 이름 라벨을 띄우고, 그보다 넓게 보면 아이콘·클러스터로 바꾼다.
export const shouldShowPlaceLabel = (level: number) => level <= MAP_LABEL_MAX_LEVEL;

// 주소창의 ?place= 값을 장소 ID로 읽는다. 양의 정수가 아니면 선택 없음.
export const parsePlaceIdParam = (value: string | null): number | null => {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
};

export const formatMenuPrice = (price: TPlaceMenu['price']) =>
  price === null ? '가격 변동' : `${price.toLocaleString('ko-KR')}원`;

// 서버 시각(KST, 오프셋 없는 ISO)을 날짜만 표시한다.
export const formatPlaceDate = (value: string) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? `${match[1]}.${match[2]}.${match[3]}` : '';
};

// 겹친 핀의 쌓임 순서. 커서를 올린 핀이 맨 위, 그다음 선택한 핀, 나머지는 같은 높이.
export const placeMarkerZIndex = (placeId: number, selectedId: number | null, hoveredId: number | null) => {
  if (placeId === hoveredId) return 30;
  if (placeId === selectedId) return 20;
  return 1;
};

export type TPlaceGroup<TPlace> = { key: number; anchor: TPlace; places: TPlace[] };

// 기준 장소(묶음의 첫 장소)에서 maxMeters 안의 장소를 한 묶음으로 모은다. 묶음 위치는 기준 장소 좌표,
// key는 기준 장소 ID라 목록이 바뀌어도 열린 묶음을 유지할 수 있다. 입력 순서(ID 오름차순)대로 기준을 정한다.
export const groupNearbyPlaces = <TPlace extends Pick<TPlaceSummary, 'id' | 'latitude' | 'longitude'>>(
  places: TPlace[],
  maxMeters: number,
): TPlaceGroup<TPlace>[] => {
  const groups: TPlaceGroup<TPlace>[] = [];
  for (const place of places) {
    const point = { lat: place.latitude, lng: place.longitude };
    const group = groups.find(
      ({ anchor }) => distanceMeters({ lat: anchor.latitude, lng: anchor.longitude }, point) <= maxMeters,
    );
    if (group) group.places.push(place);
    else groups.push({ key: place.id, anchor: place, places: [place] });
  }
  return groups;
};

// 지도 칩 필터. 카테고리는 하나만(null은 전체) 고르고 그 안의 세부는 여러 개(하나라도 해당).
// 숨은 맛집은 카테고리와 같이 고를 수 없는 별도 모드로, 태그 여러 개(하나라도 해당)·태그 미선택은 태그가 있는 장소 전체.
export type TPlaceFilter =
  | { mode: 'category'; category: TPlaceCategory | null; subCategories: TPlaceSubCategory[] }
  | { mode: 'hiddenGem'; tags: TPlaceTag[] };

export const ALL_PLACES_FILTER: TPlaceFilter = { mode: 'category', category: null, subCategories: [] };

export const filterPlaces = (places: TPlaceSummary[], filter: TPlaceFilter) => {
  if (filter.mode === 'hiddenGem')
    return places.filter((place) =>
      filter.tags.length === 0 ? place.tags.length > 0 : place.tags.some((tag) => filter.tags.includes(tag)),
    );
  if (filter.category === null) return places;
  return places.filter(
    (place) =>
      place.category === filter.category &&
      (filter.subCategories.length === 0 || filter.subCategories.includes(place.subCategory)),
  );
};

// 같은 카테고리를 다시 누르면 전체로 돌아가고, 다른 카테고리를 누르면 세부 선택을 비운다.
export const selectCategoryFilter = (filter: TPlaceFilter, category: TPlaceCategory | null): TPlaceFilter =>
  filter.mode === 'category' && filter.category === category && category !== null
    ? ALL_PLACES_FILTER
    : { mode: 'category', category, subCategories: [] };

// 숨은 맛집을 누르면 카테고리 선택을 모두 해제하고 전용 모드로, 다시 누르면 전체로 돌아간다.
export const toggleHiddenGemFilter = (filter: TPlaceFilter): TPlaceFilter =>
  filter.mode === 'hiddenGem' ? ALL_PLACES_FILTER : { mode: 'hiddenGem', tags: [] };

const toggleValue = <TValue>(values: readonly TValue[], value: TValue) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

export const toggleSubCategoryFilter = (filter: TPlaceFilter, subCategory: TPlaceSubCategory): TPlaceFilter =>
  filter.mode === 'category' ? { ...filter, subCategories: toggleValue(filter.subCategories, subCategory) } : filter;

export const toggleTagFilter = (filter: TPlaceFilter, tag: TPlaceTag): TPlaceFilter =>
  filter.mode === 'hiddenGem' ? { ...filter, tags: toggleValue(filter.tags, tag) } : filter;
