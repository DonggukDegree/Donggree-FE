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
  averageRating: number | null; // 소수 첫째 자리 평균 별점. 리뷰가 없으면 null
  reviewCount: number;
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
  version: number; // 정보 수정 요청에 그대로 돌려보내는 장소 버전. 다른 회원이 먼저 고치면 올라간다
  registrantNickname: string | null; // 최초 등록자 닉네임. 탈퇴 등으로 없으면 null("탈퇴한 회원")
};

// POST /api/places 요청. 위치는 지도 중심 핀 좌표이며 주소는 보내지 않는다(카카오 주소 저장 금지).
export type TPlaceRegisterRequest = {
  name: string;
  category: TPlaceCategory;
  subCategory: TPlaceSubCategory;
  latitude: number;
  longitude: number;
  businessHours: string | null;
  description: string | null;
  menus: TPlaceMenu[];
};

// PUT /api/places/{placeId}/info 요청. 영업시간·설명·메뉴 전체를 보내 교체한다(이름·위치·카테고리는 수정 불가).
export type TPlaceInfoEditRequest = {
  version: number;
  businessHours: string | null; // null이면 삭제
  description: string | null; // null이면 삭제
  menus: TPlaceMenu[]; // 빈 배열이면 메뉴 전체 삭제
};

// 장소 신고 사유. 기타(OTHER)는 설명이 필수다.
export type TPlaceReportReason = 'CLOSED' | 'WRONG_LOCATION' | 'WRONG_NAME' | 'DUPLICATE' | 'INAPPROPRIATE' | 'OTHER';

// POST /api/places/{placeId}/reports 요청. 응답은 접수된 신고 ID.
export type TPlaceReportRequest = {
  reason: TPlaceReportReason;
  description: string | null; // 최대 200자, 기타 외에는 선택
};

// 리뷰 신고 사유. 기타(OTHER)는 설명이 필수다.
export type TReviewReportReason = 'ABUSE' | 'SPAM' | 'FALSE_INFO' | 'PRIVACY' | 'OTHER';

// 리뷰 한 건. 작성자 닉네임이 null이면 "탈퇴한 회원", 프로필 사진이 null이면 기본 아바타로 표시한다.
export type TPlaceReview = {
  id: number;
  rating: number; // 1~5
  content: string;
  createdAt: string;
  updatedAt: string;
  author: { nickname: string | null; profileUrl: string | null };
  mine: boolean;
  hidden: boolean; // 신고 누적·관리자로 숨겨짐(본인 리뷰에서만 true 가능)
};

// GET /api/places/{placeId}/reviews 한 페이지. 최신순 10개, 다음 페이지는 nextCursor를 cursor로 넘긴다.
export type TPlaceReviewPage = {
  reviews: TPlaceReview[];
  nextCursor: number | null;
  myReview: TPlaceReview | null; // 요청 회원의 리뷰(숨겨졌어도 포함)
};

// POST·PUT 리뷰 요청. 별점 1~5, 본문 앞뒤 공백 제외 10~500자.
export type TPlaceReviewRequest = { rating: number; content: string };

// GET /api/places/duplicates 후보. 반경 50m 안 장소.
export type TPlaceDuplicateCandidate = {
  id: number;
  name: string;
  category: TPlaceCategory;
  subCategory: TPlaceSubCategory;
  distanceMeters: number;
};

// exact가 있으면 등록 불가(정규화 이름 동일), similar는 확인 안내(한쪽 이름이 다른 쪽을 포함).
export type TPlaceDuplicates = {
  exact: TPlaceDuplicateCandidate[];
  similar: TPlaceDuplicateCandidate[];
};

export type TGetPlacesResponse = TCommonResponse<TPlaceSummary[]>;
export type TGetPlaceDetailResponse = TCommonResponse<TPlaceDetail>;
export type TGetPlaceDuplicatesResponse = TCommonResponse<TPlaceDuplicates>;
export type TPostPlaceResponse = TCommonResponse<number>;
export type TPutPlaceInfoResponse = TCommonResponse<TPlaceDetail>;
export type TPostPlaceReportResponse = TCommonResponse<number>;
export type TGetPlaceReviewsResponse = TCommonResponse<TPlaceReviewPage>;
export type TPostPlaceReviewResponse = TCommonResponse<number>;
export type TEmptyResponse = TCommonResponse<null>;
