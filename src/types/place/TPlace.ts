import type { TCommonResponse } from '@/types/common';

// 동글맵 장소 관련 타입. 서버는 카테고리를 enum 코드로만 주고받고, 라벨은 constants/place에서 매핑한다.

export type TPlaceCategory = 'RESTAURANT' | 'CAFE' | 'BAR' | 'STUDY' | 'LIFE' | 'ETC';

export type TPlaceSubCategory =
  | 'KOREAN'
  | 'CHINESE'
  | 'JAPANESE'
  | 'WESTERN'
  | 'SNACK'
  | 'ASIAN'
  | 'MEAT'
  | 'FAST_FOOD'
  | 'RESTAURANT_ETC'
  | 'COFFEE'
  | 'DESSERT'
  | 'CAFE_ETC'
  | 'PUB'
  | 'IZAKAYA'
  | 'POCHA'
  | 'WINE_BAR'
  | 'BAR_ETC'
  | 'STUDY_CAFE'
  | 'STUDY_FRIENDLY_CAFE'
  | 'CAMPUS_FACILITY'
  | 'STUDY_ETC'
  | 'CONVENIENCE_STORE'
  | 'PRINT'
  | 'STATIONERY'
  | 'MEDICAL'
  | 'BEAUTY'
  | 'LIFE_ETC'
  | 'ETC';

// GET /api/places 응답 한 건. 지도 핀 표시용 최소 정보.
export type TPlaceSummary = {
  id: number;
  name: string;
  category: TPlaceCategory;
  subCategory: TPlaceSubCategory;
  latitude: number;
  longitude: number;
};

export type TPlaceMenu = {
  name: string;
  price: number | null; // null이면 가격 변동
};

// GET /api/places/{placeId} 응답. 주소는 저장하지 않으므로 좌표로 실시간 조회한다.
export type TPlaceDetail = TPlaceSummary & {
  businessHours: string | null;
  description: string | null;
  menus: TPlaceMenu[];
  createdAt: string; // 최초 등록 시각(ISO)
  updatedAt: string; // 마지막 정보 수정 시각(ISO)
};

export type TGetPlacesResponse = TCommonResponse<TPlaceSummary[]>;
export type TGetPlaceDetailResponse = TCommonResponse<TPlaceDetail>;
