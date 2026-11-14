import mapOnboarding1 from '@/assets/map/onboarding1.webp';
import mapOnboarding2 from '@/assets/map/onboarding2.webp';
import mapOnboarding3 from '@/assets/map/onboarding3.webp';
import mapOnboarding4 from '@/assets/map/onboarding4.webp';
import type {
  TPlaceCategory,
  TPlaceReportReason,
  TPlaceSubCategory,
  TPlaceTag,
  TReviewReportReason,
} from '@/types/place/TPlace';

// 동글맵 기준값. 캠퍼스 중심은 BE CampusArea.CENTER와 같은 좌표를 쓴다.
export const CAMPUS_CENTER = { lat: 37.55828693771417, lng: 127.00018391368702 } as const;

// 서비스 영역. BE CampusArea.RADIUS_METERS와 같은 값이며, 최종 판정은 서버가 다시 한다.
export const CAMPUS_RADIUS_METERS = 1_500;

// 등록 입력 제한. BE PlaceRegisterRequest 검증과 같은 값.
export const PLACE_FORM_LIMITS = {
  NAME_MAX: 30,
  BUSINESS_HOURS_MAX: 100,
  DESCRIPTION_MAX: 300,
  MENU_NAME_MAX: 30,
  MENU_MAX_COUNT: 50,
  MENU_PRICE_MAX: 1_000_000,
} as const;

// 카카오 지도 레벨은 숫자가 작을수록 확대(1이 최대 확대). 레벨 3 이하에서 이름 라벨, 4~6은 아이콘·클러스터, 6 초과 축소 금지.
export const MAP_MIN_LEVEL = 1;
export const MAP_INITIAL_LEVEL = 3;
export const MAP_LABEL_MAX_LEVEL = 3;
export const MAP_MAX_LEVEL = 6;

export const PLACE_MENU_PREVIEW_COUNT = 5;

// 칩·핀 공용 카테고리 정의. 순서가 곧 칩 노출 순서다. 색은 아이콘 핀 배경이라 이모지가 잘 보이는 색을 쓴다.
export const PLACE_CATEGORIES: readonly { value: TPlaceCategory; label: string; emoji: string; color: string }[] = [
  { value: 'RESTAURANT', label: '음식점', emoji: '🍚', color: '#ff7124' },
  { value: 'CAFE', label: '카페', emoji: '☕', color: '#a0522d' },
  { value: 'BAR', label: '술집', emoji: '🍺', color: '#d4a017' },
  { value: 'STUDY', label: '스터디', emoji: '📚', color: '#3b6fd8' },
  { value: 'LIFE', label: '생활', emoji: '🛍️', color: '#b9e3c6' },
  { value: 'ENTERTAINMENT', label: '오락', emoji: '🎮', color: '#d9c2f5' },
  { value: 'ETC', label: '기타', emoji: '📍', color: '#697077' },
] as const;

export const PLACE_CATEGORY_BY_VALUE = Object.fromEntries(
  PLACE_CATEGORIES.map((category) => [category.value, category]),
) as Record<TPlaceCategory, (typeof PLACE_CATEGORIES)[number]>;

// 카테고리별 상세카테고리. 순서가 곧 선택지 노출 순서이며 BE PlaceSubCategory의 상위 카테고리와 일치해야 한다.
export const PLACE_SUB_CATEGORIES_BY_CATEGORY: Record<TPlaceCategory, readonly TPlaceSubCategory[]> = {
  RESTAURANT: ['KOREAN', 'CHINESE', 'JAPANESE', 'WESTERN', 'SNACK', 'ASIAN', 'MEAT', 'FAST_FOOD', 'RESTAURANT_ETC'],
  CAFE: ['FRANCHISE', 'DESSERT', 'COFFEE', 'CAFE_ETC'],
  BAR: ['PUB', 'IZAKAYA', 'WINE_BAR', 'BAR_ETC'],
  STUDY: ['STUDY_CAFE', 'CAMPUS_FACILITY', 'LIBRARY', 'STUDY_ETC'],
  LIFE: ['CONVENIENCE_STORE', 'PRINT', 'STATIONERY', 'MEDICAL', 'BEAUTY', 'MART', 'FITNESS', 'LIFE_ETC'],
  ENTERTAINMENT: ['BILLIARDS', 'BOWLING', 'KARAOKE', 'PC_ROOM', 'ENTERTAINMENT_ETC'],
  ETC: ['ETC'],
};

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
  FRANCHISE: '프랜차이즈',
  DESSERT: '디저트/베이커리',
  COFFEE: '커피 전문',
  CAFE_ETC: '기타',
  PUB: '호프/요리주점',
  IZAKAYA: '이자카야',
  WINE_BAR: '바/와인',
  BAR_ETC: '기타',
  STUDY_CAFE: '스터디카페/독서실',
  CAMPUS_FACILITY: '학교 시설',
  LIBRARY: '도서관',
  STUDY_ETC: '기타',
  CONVENIENCE_STORE: '편의점',
  PRINT: '인쇄/복사',
  STATIONERY: '문구',
  MEDICAL: '병원/약국',
  BEAUTY: '미용',
  MART: '마트',
  FITNESS: '헬스/운동',
  LIFE_ETC: '기타',
  BILLIARDS: '당구장',
  BOWLING: '볼링장',
  KARAOKE: '노래방',
  PC_ROOM: 'PC방',
  ENTERTAINMENT_ETC: '기타',
  ETC: '기타',
};

// ✨ 숨은 맛집. 메인 카테고리와 별개인 태그로, 지도에서는 전용 칩을 눌렀을 때만 남색 ✨ 핀으로 보인다.
export const HIDDEN_GEM = { label: '숨은 맛집', emoji: '✨', color: '#1f2a5c' } as const;

// 숨은 맛집 태그. 순서가 곧 체크박스·칩 노출 순서이며 BE PlaceTag 순서와 같다.
export const PLACE_TAGS: readonly { value: TPlaceTag; label: string }[] = [
  { value: 'SHORTCUT', label: '지름길 맛집' },
  { value: 'STUDY', label: '공부 맛집' },
  { value: 'GATHERING', label: '회식 맛집' },
  { value: 'MEAL_DATE', label: '밥약 맛집' },
  { value: 'MOOD', label: '분위기 맛집' },
  { value: 'SOLO_DINING', label: '혼밥 맛집' },
  { value: 'COFFEE', label: '커피 맛집' },
  { value: 'GENUINE', label: '진짜 맛집' },
];

export const PLACE_TAG_LABELS = Object.fromEntries(PLACE_TAGS.map(({ value, label }) => [value, label])) as Record<
  TPlaceTag,
  string
>;

// 장소 신고 사유. 서버 enum 코드 순서대로 보여준다. 기타는 설명이 필수다.
export const PLACE_REPORT_REASONS: { value: TPlaceReportReason; label: string }[] = [
  { value: 'CLOSED', label: '폐업했어요' },
  { value: 'WRONG_LOCATION', label: '위치가 달라요' },
  { value: 'WRONG_NAME', label: '이름이 달라요' },
  { value: 'DUPLICATE', label: '중복된 장소예요' },
  { value: 'INAPPROPRIATE', label: '부적절한 내용이 있어요' },
  { value: 'OTHER', label: '기타' },
];

export const PLACE_REPORT_DESCRIPTION_MAX = 200;

// 장소 등록자·리뷰 작성자가 탈퇴했거나 조회되지 않을 때 닉네임 대신 쓰는 표기.
export const WITHDRAWN_MEMBER_LABEL = '탈퇴한 회원';
// 목록의 숨긴 리뷰 자리에 본문 대신 보여주는 문구(별점도 숨김).
export const HIDDEN_REVIEW_LABEL = '신고되어 숨겨진 리뷰입니다.';

// 리뷰 작성 제한. 서버도 같은 기준으로 다시 검증한다.
export const PLACE_REVIEW_LIMITS = { RATING_MIN: 1, RATING_MAX: 5, CONTENT_MIN: 10, CONTENT_MAX: 500 } as const;

// 리뷰 본문은 이 길이를 넘으면 3줄로 접고 펼치기 버튼을 둔다.
export const PLACE_REVIEW_FOLD_LENGTH = 90;

// 리뷰 신고 사유. 서버 enum 코드 순서대로 보여준다. 기타는 설명이 필수다.
export const REVIEW_REPORT_REASONS: { value: TReviewReportReason; label: string }[] = [
  { value: 'ABUSE', label: '욕설·비방이 있어요' },
  { value: 'SPAM', label: '광고·도배예요' },
  { value: 'FALSE_INFO', label: '사실과 다른 내용이에요' },
  { value: 'PRIVACY', label: '개인정보가 노출됐어요' },
  { value: 'OTHER', label: '기타' },
];

// 리뷰 목록은 처음 5개만 보이고, "리뷰 더보기"마다 10개씩 더 보인다(서버는 10개씩 커서 조회).
export const PLACE_REVIEW_INITIAL_COUNT = 5;
export const PLACE_REVIEW_MORE_COUNT = 10;

// 이 거리(m) 안의 장소는 최대로 확대해도 라벨 핀이 겹쳐 고를 수 없으므로 개수 핀 하나로 묶는다.
export const PLACE_OVERLAP_GROUP_METERS = 5;

// 동글맵 첫 방문 튜토리얼 단계. image는 4:3 프리뷰 이미지(1200×900)로, 비어 있으면 같은 비율의 빈 자리를 보여준다.
export const MAP_ONBOARDING_STEPS: { title: string; body: string; image?: string }[] = [
  {
    title: '동글맵이 출시되었어요!',
    body: '상단 칩을 눌러 학교 주변 "동글인 보증" 맛집을 알아보세요.',
    image: mapOnboarding1,
  },
  {
    title: '좋아하는 장소를 등록해요.',
    body: '새내기 동글인을 위해 직접 장소를 등록하고 공유해 주세요.',
    image: mapOnboarding2,
  },
  {
    title: '장소 정보를 보완하고, 리뷰를 적을 수 있어요.',
    body: '장소 수정을 통해 더 나은 정보를 제공하고, 리뷰를 달아 이 장소를 검증해주세요.',
    image: mapOnboarding3,
  },
  {
    title: '숨은 맛집을 찾아내요!',
    body: '동글맵만의 숨은 맛집을 등록해 동국대생만 공유하는 진짜 명소를 모아봐요.',
    image: mapOnboarding4,
  },
];
