import type { TPlaceCategory, TPlaceSubCategory } from '@/types/place/TPlace';

// 동글맵 기준값. 캠퍼스 중심은 BE CampusArea.CENTER와 같은 좌표를 쓴다.
export const CAMPUS_CENTER = { lat: 37.55828693771417, lng: 127.00018391368702 } as const;

// 카카오 지도 레벨은 숫자가 작을수록 확대(1이 최대 확대). 레벨 3 이하에서 이름 라벨, 4~6은 아이콘·클러스터, 6 초과 축소 금지.
export const MAP_MIN_LEVEL = 1;
export const MAP_INITIAL_LEVEL = 3;
export const MAP_LABEL_MAX_LEVEL = 3;
export const MAP_MAX_LEVEL = 6;

export const PLACE_MENU_PREVIEW_COUNT = 5;

// 칩·핀 공용 카테고리 정의. 순서가 곧 칩 노출 순서다.
export const PLACE_CATEGORIES: readonly { value: TPlaceCategory; label: string; emoji: string; color: string }[] = [
  { value: 'RESTAURANT', label: '음식점', emoji: '🍚', color: '#ff7124' },
  { value: 'CAFE', label: '카페', emoji: '☕', color: '#a0522d' },
  { value: 'BAR', label: '술집', emoji: '🍺', color: '#d4a017' },
  { value: 'STUDY', label: '스터디', emoji: '📚', color: '#3b6fd8' },
  { value: 'LIFE', label: '생활', emoji: '🛒', color: '#519c66' },
  { value: 'ETC', label: '기타', emoji: '📍', color: '#697077' },
] as const;

export const PLACE_CATEGORY_BY_VALUE = Object.fromEntries(
  PLACE_CATEGORIES.map((category) => [category.value, category]),
) as Record<TPlaceCategory, (typeof PLACE_CATEGORIES)[number]>;

export const PLACE_SUB_CATEGORY_LABELS: Record<TPlaceSubCategory, string> = {
  KOREAN: '한식',
  CHINESE: '중식',
  JAPANESE: '일식',
  WESTERN: '양식',
  SNACK: '분식',
  ASIAN: '아시안',
  MEAT: '고기/구이',
  FAST_FOOD: '패스트푸드',
  RESTAURANT_ETC: '기타',
  COFFEE: '커피',
  DESSERT: '디저트/베이커리',
  CAFE_ETC: '기타',
  PUB: '호프/요리주점',
  IZAKAYA: '이자카야',
  POCHA: '포차',
  WINE_BAR: '바/와인',
  BAR_ETC: '기타',
  STUDY_CAFE: '스터디카페',
  STUDY_FRIENDLY_CAFE: '카공 카페',
  CAMPUS_FACILITY: '학교 시설',
  STUDY_ETC: '기타',
  CONVENIENCE_STORE: '편의점',
  PRINT: '인쇄/복사',
  STATIONERY: '문구',
  MEDICAL: '병원/약국',
  BEAUTY: '미용',
  LIFE_ETC: '기타',
  ETC: '기타',
};
